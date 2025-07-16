import { NextRequest, NextResponse } from 'next/server';
import { createFacebookAdsClient, getFacebookDateRange } from '@/lib/facebook-ads';
import { withCache, generateCacheKey } from '@/lib/cache';
import { prisma, findClientBySlug, updateClient } from '@/lib/database';
import type { APIResponse, CampaignMetrics, Campaign } from '@/types/dashboard';

/**
 * GET /api/facebook-ads/[client]
 * Fetch Facebook Marketing API data for a specific client
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
    const type = searchParams.get('type') || 'summary'; // 'summary' | 'campaigns' | 'insights' | 'creatives'
    const useCache = searchParams.get('cache') !== 'false';

    // Connect to database and get client configuration
    const clientData = await findClientBySlug(client);
    
    if (!clientData) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'CLIENT_NOT_FOUND',
        message: `Client '${client}' not found`,
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    // Check if Facebook Ads is configured for this client
    if (!clientData.facebookAds?.accountId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'FACEBOOK_ADS_NOT_CONFIGURED',
        message: `Facebook Ads not configured for client '${client}'`,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }


    // Validate API configuration
    if (!process.env.FACEBOOK_APP_ID || 
        !process.env.FACEBOOK_APP_SECRET || 
        !process.env.FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'FACEBOOK_ADS_CONFIG_MISSING',
        message: 'Facebook Marketing API configuration is incomplete',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Get date range
    const dateRange = getFacebookDateRange(period);
    
    // Create Facebook Ads client
    const facebookAdsClient = createFacebookAdsClient(
      clientData.facebookAds.accountId, 
      clientData.facebookAds.pixelId
    );

    // Generate cache key
    const cacheKey = generateCacheKey('campaign', client, { 
      type, 
      period, 
      from: dateRange.from, 
      to: dateRange.to,
      platform: 'facebook'
    });

    // Define fetch function based on type
    const fetchData = async () => {
      switch (type) {
        case 'campaigns':
          return await facebookAdsClient.getCampaignData(dateRange.from, dateRange.to);
        case 'insights':
          return await facebookAdsClient.getAdAccountInsights(dateRange.from, dateRange.to);
        case 'creatives':
          return await facebookAdsClient.getAdCreativesData(dateRange.from, dateRange.to);
        case 'pixel':
          return await facebookAdsClient.getPixelData(dateRange.from, dateRange.to);
        default:
          return await facebookAdsClient.getSummaryMetrics(dateRange.from, dateRange.to);
      }
    };

    // Fetch data with cache
    let data;
    if (useCache) {
      data = await withCache('campaign', cacheKey, fetchData);
    } else {
      data = await fetchData();
    }

    return NextResponse.json<APIResponse<CampaignMetrics | Campaign[] | any>>({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    const { client } = await params;
    console.error(`Error fetching Facebook Ads data for client ${client}:`, error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: error.code || 'FACEBOOK_ADS_API_ERROR',
      message: error.message || 'Failed to fetch Facebook Ads data',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/facebook-ads/[client]/test-connection
 * Test Facebook Marketing API connection for a specific client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ client: string }> }
): Promise<NextResponse> {
  try {
    const { client } = await params;
    
    // Connect to database and get client configuration
    const clientData = await findClientBySlug(client);
    
    if (!clientData) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'CLIENT_NOT_FOUND',
        message: `Client '${client}' not found`,
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    // Check if Facebook Ads is configured for this client
    if (!clientData.facebookAds?.accountId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'FACEBOOK_ADS_NOT_CONFIGURED',
        message: `Facebook Ads not configured for client '${client}'`,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Create Facebook Ads client and test connection
    const facebookAdsClient = createFacebookAdsClient(
      clientData.facebookAds.accountId, 
      clientData.facebookAds.pixelId
    );
    const isConnected = await facebookAdsClient.testConnection();

    // Update connection status in database
    await updateClient(clientData.id, {
      facebookAds: {
        ...clientData.facebookAds,
        connected: isConnected,
        lastSync: isConnected ? new Date() : null,
      }
    });

    return NextResponse.json<APIResponse<{ connected: boolean }>>({
      success: true,
      data: { connected: isConnected },
      message: isConnected ? 'Facebook Ads connection successful' : 'Facebook Ads connection failed',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    const { client } = await params;
    console.error(`Error testing Facebook Ads connection for client ${client}:`, error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'CONNECTION_TEST_FAILED',
      message: error.message || 'Failed to test Facebook Ads connection',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

