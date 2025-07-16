/**
 * Google Ads API Integration for NINETWODASH
 * Handles authentication and data fetching from Google Ads API
 */

import { GoogleAdsConfig, GoogleAdsMetrics, Campaign, CampaignMetrics } from '../types/dashboard';
import { format, subDays } from 'date-fns';

// Google Ads API configuration
const GOOGLE_ADS_API_VERSION = 'v16';
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

/**
 * Google Ads API client class
 */
export class GoogleAdsClient {
  private config: GoogleAdsConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: GoogleAdsConfig) {
    this.config = config;
  }

  /**
   * Get or refresh OAuth2 access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh Google Ads token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 50 minutes (tokens are valid for 1 hour)
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error refreshing Google Ads token:', error);
      throw new Error('Failed to authenticate with Google Ads API');
    }
  }

  /**
   * Make authenticated request to Google Ads API
   */
  private async makeRequest(endpoint: string, body?: any): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${GOOGLE_ADS_BASE_URL}/${endpoint}`;

    const requestOptions: RequestInit = {
      method: body ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': this.config.developerId,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Ads API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error making request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Test connection to Google Ads API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest(`customers/${this.config.customerId}`);
      return true;
    } catch (error) {
      console.error('Google Ads connection test failed:', error);
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
    const query = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_per_conversion,
        segments.date
      FROM campaign 
      WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
      AND campaign.status = 'ENABLED'
      ORDER BY segments.date DESC
    `;

    try {
      const response = await this.makeRequest(
        `customers/${this.config.customerId}/googleAds:searchStream`,
        {
          query,
        }
      );

      return this.transformCampaignData(response);
    } catch (error) {
      console.error('Error fetching Google Ads campaign data:', error);
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
    const query = `
      SELECT 
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_per_conversion
      FROM campaign 
      WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
      AND campaign.status = 'ENABLED'
    `;

    try {
      const response = await this.makeRequest(
        `customers/${this.config.customerId}/googleAds:searchStream`,
        {
          query,
        }
      );

      return this.aggregateMetrics(response);
    } catch (error) {
      console.error('Error fetching Google Ads summary metrics:', error);
      throw error;
    }
  }

  /**
   * Transform Google Ads API response to campaign format
   */
  private transformCampaignData(apiResponse: any): Campaign[] {
    if (!apiResponse.results) return [];

    return apiResponse.results.map((result: any) => {
      const campaign = result.campaign;
      const metrics = result.metrics;
      const segments = result.segments;

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        platform: 'google_ads' as const,
        status: this.mapCampaignStatus(campaign.status),
        date: segments.date,
        metrics: this.transformMetrics(metrics),
      };
    });
  }

  /**
   * Transform Google Ads metrics to standard format
   */
  private transformMetrics(metrics: GoogleAdsMetrics): CampaignMetrics {
    const impressions = Number(metrics.impressions) || 0;
    const clicks = Number(metrics.clicks) || 0;
    const cost = Number((metrics as any).cost_micros) / 1000000 || 0; // Convert micros to currency
    const conversions = Number(metrics.conversions) || 0;

    return {
      impressions,
      clicks,
      cost,
      conversions,
      ctr: Number((metrics as any).ctr || 0),
      cpc: Number((metrics as any).average_cpc || 0) / 1000000, // Convert micros
      cpm: impressions > 0 ? (cost / impressions) * 1000 : 0,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      roas: cost > 0 && conversions > 0 ? conversions / cost : 0,
    };
  }

  /**
   * Aggregate metrics from multiple campaigns
   */
  private aggregateMetrics(apiResponse: any): CampaignMetrics {
    if (!apiResponse.results || apiResponse.results.length === 0) {
      return {
        impressions: 0,
        clicks: 0,
        cost: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        conversionRate: 0,
        roas: 0,
      };
    }

    let totalImpressions = 0;
    let totalClicks = 0;
    let totalCost = 0;
    let totalConversions = 0;

    apiResponse.results.forEach((result: any) => {
      const metrics = result.metrics;
      totalImpressions += parseInt(metrics.impressions) || 0;
      totalClicks += parseInt(metrics.clicks) || 0;
      totalCost += parseInt(metrics.cost_micros) / 1000000 || 0;
      totalConversions += parseFloat(metrics.conversions) || 0;
    });

    return {
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
   * Map Google Ads campaign status to standard format
   */
  private mapCampaignStatus(status: string): 'active' | 'paused' | 'completed' {
    switch (status) {
      case 'ENABLED': return 'active';
      case 'PAUSED': return 'paused';
      case 'REMOVED': return 'completed';
      default: return 'paused';
    }
  }

  /**
   * Generate realistic mock metrics for development
   */
  private generateMockMetrics(customerId: string, dateFrom: string, dateTo: string): CampaignMetrics {
    // Base metrics with some variation based on client ID
    const clientHash = this.hashClientId(customerId);
    const dayCount = Math.max(1, Math.floor((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)));
    
    // Generate realistic metrics based on client and period
    const baseImpressions = Math.floor(clientHash * 100 + dayCount * 50);
    const impressions = baseImpressions + Math.floor(Math.random() * baseImpressions * 0.3);
    const clicks = Math.floor(impressions * (0.008 + Math.random() * 0.012)); // CTR entre 0.8% e 2%
    const cost = clicks * (12 + Math.random() * 25); // CPC entre R$ 12 e R$ 37
    const conversions = Math.floor(clicks * (0.08 + Math.random() * 0.15)); // Taxa de conversão 8-23%
    
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? cost / clicks : 0;
    const cpm = impressions > 0 ? (cost / impressions) * 1000 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const roas = cost > 0 ? (conversions * 150) / cost : 0; // Assumindo valor médio de conversão R$ 150

    return {
      impressions,
      clicks,
      cost: parseFloat(cost.toFixed(2)),
      conversions,
      ctr: parseFloat(ctr.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      cpm: parseFloat(cpm.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      roas: parseFloat(roas.toFixed(2)),
    };
  }

  /**
   * Create a hash from client ID for consistent mock data
   */
  private hashClientId(customerId: string): number {
    let hash = 0;
    for (let i = 0; i < customerId.length; i++) {
      const char = customerId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000 + 500; // Retorna um número entre 500 e 1499
  }
}

/**
 * Create Google Ads client instance with custom credentials
 */
export function createGoogleAdsClient(customerId: string, credentials?: any): GoogleAdsClient {
  const config: GoogleAdsConfig = {
    developerId: credentials?.developerId || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    clientId: credentials?.clientId || process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: credentials?.clientSecret || process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    refreshToken: credentials?.refreshToken || process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    customerId,
  };

  if (!config.developerId || !config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error('Missing required Google Ads API configuration');
  }

  return new GoogleAdsClient(config);
}

/**
 * Generate date range for API queries
 */
export function getDateRange(period: '7d' | '30d' | '90d'): { from: string; to: string } {
  const today = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = subDays(today, days);

  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(today, 'yyyy-MM-dd'),
  };
}