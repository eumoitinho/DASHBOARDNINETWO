/**
 * Facebook Marketing API Integration for NINETWODASH
 * Handles authentication and data fetching from Facebook Marketing API
 */

import { FacebookAdsConfig, FacebookAdsMetrics, Campaign, CampaignMetrics, APIError } from '../types/dashboard';
import { format, subDays } from 'date-fns';

// Facebook Marketing API configuration
const FACEBOOK_API_VERSION = 'v19.0';
const FACEBOOK_BASE_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

/**
 * Facebook Marketing API client class
 */
export class FacebookAdsClient {
  private config: FacebookAdsConfig;

  constructor(config: FacebookAdsConfig) {
    this.config = config;
  }

  /**
   * Make authenticated request to Facebook Marketing API
   */
  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<any> {
    const url = new URL(`${FACEBOOK_BASE_URL}/${endpoint}`);
    
    // Add access token to params
    const queryParams = {
      access_token: this.config.accessToken,
      ...params,
    };

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Facebook API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error making request to ${url.toString()}:`, error);
      throw error;
    }
  }

  /**
   * Test connection to Facebook Marketing API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest(`act_${this.config.adAccountId}`, {
        fields: 'id,name,account_status'
      });
      return true;
    } catch (error) {
      console.error('Facebook Ads connection test failed:', error);
      return false;
    }
  }

  /**
   * Get campaign data for date range
   */
  async getCampaignData(
    dateFrom: string,
    dateTo: string
  ): Promise<Campaign[]> {
    const fields = [
      'id',
      'name',
      'status',
      'insights{impressions,clicks,spend,actions,ctr,cpc,cpm,date_start,date_stop}'
    ].join(',');

    try {
      const response = await this.makeRequest(
        `act_${this.config.adAccountId}/campaigns`,
        {
          fields,
          time_range: JSON.stringify({
            since: dateFrom,
            until: dateTo
          }),
          level: 'campaign',
          time_increment: 1, // Daily breakdown
        }
      );

      return this.transformCampaignData(response.data || []);
    } catch (error) {
      console.error('Error fetching Facebook Ads campaign data:', error);
      throw error;
    }
  }

  /**
   * Get summary metrics for date range
   */
  async getSummaryMetrics(
    dateFrom: string,
    dateTo: string
  ): Promise<CampaignMetrics> {
    const fields = [
      'impressions',
      'clicks',
      'spend',
      'actions',
      'ctr',
      'cpc',
      'cpm'
    ].join(',');

    try {
      const response = await this.makeRequest(
        `act_${this.config.adAccountId}/insights`,
        {
          fields,
          time_range: JSON.stringify({
            since: dateFrom,
            until: dateTo
          }),
          level: 'account',
        }
      );

      const data = response.data && response.data.length > 0 ? response.data[0] : {};
      return this.transformMetrics(data);
    } catch (error) {
      console.error('Error fetching Facebook Ads summary metrics:', error);
      throw error;
    }
  }

  /**
   * Get ad account insights
   */
  async getAdAccountInsights(
    dateFrom: string,
    dateTo: string
  ): Promise<any> {
    const fields = [
      'impressions',
      'clicks',
      'spend',
      'actions',
      'ctr',
      'cpc',
      'cpm',
      'reach',
      'frequency'
    ].join(',');

    try {
      const response = await this.makeRequest(
        `act_${this.config.adAccountId}/insights`,
        {
          fields,
          time_range: JSON.stringify({
            since: dateFrom,
            until: dateTo
          }),
          level: 'account',
          breakdowns: 'device_platform',
        }
      );

      return response.data || [];
    } catch (error) {
      console.error('Error fetching Facebook Ads account insights:', error);
      throw error;
    }
  }

  /**
   * Transform Facebook Ads API response to campaign format
   */
  private transformCampaignData(campaigns: any[]): Campaign[] {
    return campaigns.map((campaign: any) => {
      const insights = campaign.insights?.data?.[0] || {};
      
      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        platform: 'facebook' as const,
        status: this.mapCampaignStatus(campaign.status),
        date: insights.date_start || new Date().toISOString().split('T')[0],
        metrics: this.transformMetrics(insights),
      };
    });
  }

  /**
   * Transform Facebook Ads metrics to standard format
   */
  private transformMetrics(metrics: FacebookAdsMetrics | any): CampaignMetrics {
    const impressions = parseInt(metrics.impressions) || 0;
    const clicks = parseInt(metrics.clicks) || 0;
    const cost = parseFloat(metrics.spend) || 0;
    
    // Extract conversions from actions array
    let conversions = 0;
    if (metrics.actions && Array.isArray(metrics.actions)) {
      const conversionActions = metrics.actions.filter((action: any) => 
        action.action_type === 'purchase' || 
        action.action_type === 'lead' ||
        action.action_type === 'complete_registration'
      );
      conversions = conversionActions.reduce((sum: number, action: any) => 
        sum + (parseFloat(action.value) || 0), 0
      );
    }

    return {
      impressions,
      clicks,
      cost,
      conversions,
      ctr: parseFloat(metrics.ctr) || 0,
      cpc: parseFloat(metrics.cpc) || 0,
      cpm: parseFloat(metrics.cpm) || 0,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      roas: cost > 0 && conversions > 0 ? conversions / cost : 0,
    };
  }

  /**
   * Map Facebook campaign status to standard format
   */
  private mapCampaignStatus(status: string): 'active' | 'paused' | 'completed' {
    switch (status) {
      case 'ACTIVE': return 'active';
      case 'PAUSED': return 'paused';
      case 'DELETED':
      case 'ARCHIVED': return 'completed';
      default: return 'paused';
    }
  }

  /**
   * Get pixel data if configured
   */
  async getPixelData(
    dateFrom: string,
    dateTo: string
  ): Promise<any> {
    if (!this.config.pixelId) {
      return null;
    }

    try {
      const response = await this.makeRequest(
        `${this.config.pixelId}/stats`,
        {
          start_time: dateFrom,
          end_time: dateTo,
        }
      );

      return response.data || [];
    } catch (error) {
      console.error('Error fetching Facebook Pixel data:', error);
      return null;
    }
  }

  /**
   * Get ad creatives performance
   */
  async getAdCreativesData(
    dateFrom: string,
    dateTo: string
  ): Promise<any[]> {
    const fields = [
      'id',
      'name',
      'insights{impressions,clicks,spend,ctr,cpc}'
    ].join(',');

    try {
      const response = await this.makeRequest(
        `act_${this.config.adAccountId}/ads`,
        {
          fields,
          time_range: JSON.stringify({
            since: dateFrom,
            until: dateTo
          }),
          limit: 50,
        }
      );

      return response.data || [];
    } catch (error) {
      console.error('Error fetching Facebook Ads creatives data:', error);
      return [];
    }
  }
}

/**
 * Create Facebook Ads client instance with custom credentials
 */
export function createFacebookAdsClient(adAccountId: string, pixelId?: string, credentials?: any): FacebookAdsClient {
  const config: FacebookAdsConfig = {
    appId: credentials?.appId || process.env.FACEBOOK_APP_ID || '',
    appSecret: credentials?.appSecret || process.env.FACEBOOK_APP_SECRET || '',
    accessToken: credentials?.accessToken || process.env.FACEBOOK_ACCESS_TOKEN || '',
    adAccountId,
    pixelId,
    version: '19.0',
  };

  if (!config.appId || !config.appSecret || !config.accessToken) {
    throw new Error('Missing required Facebook Marketing API configuration');
  }

  return new FacebookAdsClient(config);
}

/**
 * Validate Facebook access token
 */
export async function validateFacebookToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${FACEBOOK_BASE_URL}/me?access_token=${accessToken}&fields=id`);
    return response.ok;
  } catch (error) {
    console.error('Error validating Facebook token:', error);
    return false;
  }
}

/**
 * Generate date range for Facebook API queries
 */
export function getFacebookDateRange(period: '7d' | '30d' | '90d'): { from: string; to: string } {
  const today = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = subDays(today, days);

  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(today, 'yyyy-MM-dd'),
  };
}