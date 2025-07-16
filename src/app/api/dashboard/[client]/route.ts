import { NextRequest, NextResponse } from 'next/server';
import { withCache, generateCacheKey } from '@/lib/cache';
import { findClientBySlug, findRecentCampaigns } from '@/lib/database';
import { getServerSession } from 'next-auth';
import type { 
  APIResponse, 
  ClientDashboardData, 
  CampaignMetrics, 
  Campaign, 
  Client,
  DashboardSummary 
} from '@/types/dashboard';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/dashboard/[client]
 * Get consolidated dashboard data for a specific client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ client: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Não autorizado',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    const { client } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const period = (searchParams.get('period') as '7d' | '30d' | '90d') || '30d';
    const useCache = searchParams.get('cache') !== 'false';

    // Validate client exists
    const clientData = await findClientBySlug(client);
    if (!clientData) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'CLIENT_NOT_FOUND',
        message: `Cliente '${client}' não encontrado`,
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    // Verifica se o usuário tem acesso a este cliente
    const userRole = (session.user as any).role;
    const userClientSlug = (session.user as any).clientSlug;
    if (userRole !== 'admin' && userClientSlug !== client) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'Acesso negado a este cliente',
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }

    // Convert Prisma client to Client type
    const clientConfig: Client = {
      id: Number(clientData.id),
      name: clientData.name,
      email: clientData.email,
      status: clientData.status,
      ga4Connected: clientData.googleAnalyticsConnected || false,
      metaConnected: clientData.facebookAdsConnected || false,
      lastSync: typeof clientData.updatedAt === 'string'
        ? clientData.updatedAt
        : clientData.updatedAt instanceof Date
          ? clientData.updatedAt.toISOString()
          : new Date().toISOString(),
      monthlyBudget: clientData.monthlyBudget,
      avatar: clientData.avatar,
      tags: clientData.tags,
      googleAdsCustomerId: clientData.googleAdsCustomerId,
      facebookAdAccountId: clientData.facebookAdsAccountId,
    };


    // Generate cache key
    const cacheKey = generateCacheKey('client', client, { 
      period,
      type: 'dashboard'
    });

    // Get date range
    const dateRange = getDateRange(period);
    
    // Fetch campaigns from database for the period
    const campaigns = await findRecentCampaigns(client, period);
    
    // Fetch data from APIs if credentials are configured
    let googleMetrics = null;
    let facebookMetrics = null;
    
    try {
      if (clientData.googleAdsConnected) {
        googleMetrics = await fetchGoogleAdsData(client, period, clientData);
      }
    } catch (error) {
      console.error('Error fetching Google Ads data:', error);
    }
    
    try {
      if (clientData.facebookAdsConnected) {
        facebookMetrics = await fetchFacebookAdsData(client, period, clientData);
      }
    } catch (error) {
      console.error('Error fetching Facebook Ads data:', error);
    }

    // Combine database campaigns with API campaigns
    const allCampaigns: Campaign[] = [...campaigns];
    if (googleMetrics?.campaigns) {
      allCampaigns.push(...googleMetrics.campaigns);
    }
    if (facebookMetrics?.campaigns) {
      allCampaigns.push(...facebookMetrics.campaigns);
    }

    // Calculate consolidated summary from database and API data
    const summary = calculateConsolidatedSummary(
      googleMetrics?.summary,
      facebookMetrics?.summary,
      campaigns
    );

    // Define fetch function
    const fetchData = async (): Promise<ClientDashboardData> => {
      return {
        client: clientConfig,
        dateRange,
        summary,
        campaigns: allCampaigns,
        lastUpdated: new Date().toISOString(),
        dataSource: {
          googleAds: googleMetrics !== null,
          facebookAds: facebookMetrics !== null,
          mock: false,
        },
      };
    };

    // Return data (cache temporarily disabled to fix promise issues)
    const data = await fetchData();

    return NextResponse.json<APIResponse<ClientDashboardData>>({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    const { client } = await params;
    console.error(`Error fetching dashboard data for client ${client}:`, error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: error.code || 'DASHBOARD_API_ERROR',
      message: error.message || 'Failed to fetch dashboard data',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Fetch Google Ads data from internal API
 */
async function fetchGoogleAdsData(client: string, period: string, clientData: any) {
  try {
    // Only fetch if Google Ads is connected and has credentials
    if (!clientData.googleAdsConnected || !clientData.googleAdsCustomerId) {
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/google-ads/${client}?period=${period}&type=summary`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Ads API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      summary: result.data,
      campaigns: [], // We'll fetch campaigns separately if needed
    };
  } catch (error) {
    console.error('Error fetching Google Ads data:', error);
    return null;
  }
}

/**
 * Fetch Facebook Ads data from internal API
 */
async function fetchFacebookAdsData(client: string, period: string, clientData: any) {
  try {
    // Only fetch if Facebook Ads is connected and has credentials
    if (!clientData.facebookAdsConnected || !clientData.facebookAdsAccountId) {
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/facebook-ads/${client}?period=${period}&type=summary`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Facebook Ads API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      summary: result.data,
      campaigns: [], // We'll fetch campaigns separately if needed
    };
  } catch (error) {
    console.error('Error fetching Facebook Ads data:', error);
    return null;
  }
}

/**
 * Calculate consolidated summary from Google Ads, Facebook Ads and database data
 */
function calculateConsolidatedSummary(
  googleMetrics?: CampaignMetrics | null,
  facebookMetrics?: CampaignMetrics | null,
  dbCampaigns?: Campaign[]
): DashboardSummary {
  const google = googleMetrics || {
    impressions: 0, clicks: 0, cost: 0, conversions: 0,
    ctr: 0, cpc: 0, cpm: 0, conversionRate: 0, roas: 0
  };
  
  const facebook = facebookMetrics || {
    impressions: 0, clicks: 0, cost: 0, conversions: 0,
    ctr: 0, cpc: 0, cpm: 0, conversionRate: 0, roas: 0
  };

  // Calculate totals from database campaigns
  const dbTotals = dbCampaigns?.reduce((acc, campaign) => ({
    impressions: acc.impressions + (campaign.metrics?.impressions || 0),
    clicks: acc.clicks + (campaign.metrics?.clicks || 0),
    cost: acc.cost + (campaign.metrics?.cost || 0),
    conversions: acc.conversions + (campaign.metrics?.conversions || 0),
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0 }) || { impressions: 0, clicks: 0, cost: 0, conversions: 0 };

  const totalImpressions = google.impressions + facebook.impressions + dbTotals.impressions;
  const totalClicks = google.clicks + facebook.clicks + dbTotals.clicks;
  const totalCost = google.cost + facebook.cost + dbTotals.cost;
  const totalConversions = google.conversions + facebook.conversions + dbTotals.conversions;

  return {
    totalImpressions,
    totalClicks,
    totalCost,
    totalConversions,
    // Weighted averages
    averageCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    averageCPC: totalClicks > 0 ? totalCost / totalClicks : 0,
    averageCPM: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
    averageConversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    totalROAS: totalCost > 0 && totalConversions > 0 ? totalConversions / totalCost : 0,
    // Include individual metrics for backwards compatibility
    impressions: totalImpressions,
    clicks: totalClicks,
    cost: totalCost,
    conversions: totalConversions,
    ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    cpc: totalClicks > 0 ? totalCost / totalClicks : 0,
    cpm: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
    conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    roas: totalCost > 0 && totalConversions > 0 ? totalConversions / totalCost : 0,
  };
}

/**
 * Get date range for the period
 */
function getDateRange(period: '7d' | '30d' | '90d') {
  const today = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));

  return {
    from: from.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0],
  };
}

