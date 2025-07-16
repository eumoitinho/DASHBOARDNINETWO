import { NextRequest, NextResponse } from 'next/server';
import { createGoogleAdsClient, getDateRange } from '@/lib/google-ads';
import { withCache, generateCacheKey } from '@/lib/cache';
import { prisma } from '@/lib/database';
import type { APIResponse, CampaignMetrics, Campaign } from '@/types/dashboard';

/**
 * GET /api/google-ads/[client]
 * Fetch Google Ads data for a specific client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ client: string }> }
): Promise<NextResponse> {
  try {
    const { client } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const period = (searchParams.get('period') as '7d' | '30d' | '90d') || '30d';
    const type = searchParams.get('type') || 'summary'; // 'summary' | 'campaigns'
    const useCache = searchParams.get('cache') !== 'false';

    // Connect to database and get client configuration
    const clientData = await (Client as any).findOne({ slug: client });
    
    if (!clientData) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'CLIENT_NOT_FOUND',
        message: `Client '${client}' not found`,
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    // Check if Google Ads is configured for this client
    if (!clientData.googleAds?.customerId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'GOOGLE_ADS_NOT_CONFIGURED',
        message: `Google Ads not configured for client '${client}'`,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }


    // Validate API configuration
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 
        !process.env.GOOGLE_ADS_CLIENT_ID || 
        !process.env.GOOGLE_ADS_CLIENT_SECRET || 
        !process.env.GOOGLE_ADS_REFRESH_TOKEN) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'GOOGLE_ADS_CONFIG_MISSING',
        message: 'Google Ads API configuration is incomplete',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Get date range
    const dateRange = getDateRange(period);
    
    // Create Google Ads client
    const googleAdsClient = createGoogleAdsClient(clientData.googleAds.customerId);

    // Generate cache key
    const cacheKey = generateCacheKey('campaign', client, { 
      type, 
      period, 
      from: dateRange.from, 
      to: dateRange.to 
    });

    // Define fetch function
    const fetchData = async () => {
      if (type === 'campaigns') {
        return await googleAdsClient.getCampaignData(dateRange.from, dateRange.to);
      } else {
        return await googleAdsClient.getSummaryMetrics(dateRange.from, dateRange.to);
      }
    };

    // Fetch data with cache
    let data;
    if (useCache) {
      data = await withCache('campaign', cacheKey, fetchData);
    } else {
      data = await fetchData();
    }

    return NextResponse.json<APIResponse<CampaignMetrics | Campaign[]>>({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    const { client } = await params;
    console.error(`Error fetching Google Ads data for client ${client}:`, error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: error.code || 'GOOGLE_ADS_API_ERROR',
      message: error.message || 'Failed to fetch Google Ads data',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/google-ads/[client]/test-connection
 * Test Google Ads API connection for a specific client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ client: string }> }
): Promise<NextResponse> {
  try {
    const { client } = await params;
    
    // Connect to database and get client configuration
    const clientData = await (Client as any).findOne({ slug: client });
    
    if (!clientData) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'CLIENT_NOT_FOUND',
        message: `Client '${client}' not found`,
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    // Check if Google Ads is configured for this client
    if (!clientData.googleAds?.customerId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'GOOGLE_ADS_NOT_CONFIGURED',
        message: `Google Ads not configured for client '${client}'`,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Create Google Ads client and test connection
    const googleAdsClient = createGoogleAdsClient(clientData.googleAds.customerId);
    const isConnected = await googleAdsClient.testConnection();

    // Update connection status in database
    await (Client as any).updateOne(
      { slug: client },
      { 
        $set: { 
          'googleAds.connected': isConnected,
          'googleAds.lastSync': isConnected ? new Date() : null,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json<APIResponse<{ connected: boolean }>>({
      success: true,
      data: { connected: isConnected },
      message: isConnected ? 'Google Ads connection successful' : 'Google Ads connection failed',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    const { client } = await params;
    console.error(`Error testing Google Ads connection for client ${client}:`, error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'CONNECTION_TEST_FAILED',
      message: error.message || 'Failed to test Google Ads connection',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

