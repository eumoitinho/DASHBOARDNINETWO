/**
 * Google Analytics 4 API Integration for NINETWODASH
 * Handles authentication and data fetching from Google Analytics 4
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

import { format, subDays } from 'date-fns';

// Google Analytics 4 configuration
export interface GoogleAnalyticsConfig {
  propertyId: string;
  viewId?: string;
  serviceAccountKey?: any;
  clientEmail?: string;
  privateKey?: string;
}

/**
 * Google Analytics 4 API client class
 */
export class GoogleAnalyticsClient {
  private analyticsDataClient: BetaAnalyticsDataClient;
  private config: GoogleAnalyticsConfig;

  constructor(config: GoogleAnalyticsConfig) {
    this.config = config;
    
    // Initialize Analytics Data client
    if (config.serviceAccountKey) {
      this.analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: config.serviceAccountKey,
      });
    } else if (config.clientEmail && config.privateKey) {
      this.analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
          client_email: config.clientEmail,
          private_key: config.privateKey.replace(/\\n/g, '\n'),
        },
      });
    } else {
      throw new Error('Missing Google Analytics credentials');
    }
  }

  /**
   * Test connection to Google Analytics 4 API
   */
  async testConnection(): Promise<boolean> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [
          {
            startDate: '7daysAgo',
            endDate: 'today',
          },
        ],
        metrics: [
          { name: 'sessions' },
        ],
        dimensions: [
          { name: 'date' },
        ],
        limit: 1,
      });

      return !!response;
    } catch (error) {
      console.error('Google Analytics connection test failed:', error);
      return false;
    }
  }

  /**
   * Get basic metrics for date range
   */
  async getMetrics(
    dateFrom: string,
    dateTo: string
  ): Promise<{
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    sessionDuration: number;
    newUsers: number;
  }> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [
          {
            startDate: dateFrom,
            endDate: dateTo,
          },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'newUsers' },
        ],
      });

      const row = response.rows?.[0];
      if (!row) {
        return {
          sessions: 0,
          users: 0,
          pageviews: 0,
          bounceRate: 0,
          sessionDuration: 0,
          newUsers: 0,
        };
      }

      return {
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
        sessionDuration: parseFloat(row.metricValues?.[4]?.value || '0'),
        newUsers: parseInt(row.metricValues?.[5]?.value || '0'),
      };
    } catch (error) {
      console.error('Error fetching Google Analytics metrics:', error);
      throw error;
    }
  }

  /**
   * Get traffic sources data
   */
  async getTrafficSources(
    dateFrom: string,
    dateTo: string
  ): Promise<Array<{
    source: string;
    medium: string;
    sessions: number;
    users: number;
    bounceRate: number;
  }>> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [
          {
            startDate: dateFrom,
            endDate: dateTo,
          },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'bounceRate' },
        ],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ],
        orderBys: [
          {
            metric: {
              metricName: 'sessions',
            },
            desc: true,
          },
        ],
        limit: 10,
      });

      return response.rows?.map(row => ({
        source: row.dimensionValues?.[0]?.value || 'unknown',
        medium: row.dimensionValues?.[1]?.value || 'unknown',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
      })) || [];
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
      throw error;
    }
  }

  /**
   * Get device category data
   */
  async getDeviceData(
    dateFrom: string,
    dateTo: string
  ): Promise<Array<{
    deviceCategory: string;
    sessions: number;
    users: number;
    bounceRate: number;
  }>> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [
          {
            startDate: dateFrom,
            endDate: dateTo,
          },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'bounceRate' },
        ],
        dimensions: [
          { name: 'deviceCategory' },
        ],
        orderBys: [
          {
            metric: {
              metricName: 'sessions',
            },
            desc: true,
          },
        ],
      });

      return response.rows?.map(row => ({
        deviceCategory: row.dimensionValues?.[0]?.value || 'unknown',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
      })) || [];
    } catch (error) {
      console.error('Error fetching device data:', error);
      throw error;
    }
  }

  /**
   * Get page views data
   */
  async getPageViews(
    dateFrom: string,
    dateTo: string
  ): Promise<Array<{
    page: string;
    pageTitle: string;
    pageviews: number;
    uniquePageviews: number;
    bounceRate: number;
    avgTimeOnPage: number;
  }>> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [
          {
            startDate: dateFrom,
            endDate: dateTo,
          },
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
        ],
        orderBys: [
          {
            metric: {
              metricName: 'screenPageViews',
            },
            desc: true,
          },
        ],
        limit: 20,
      });

      return response.rows?.map(row => ({
        page: row.dimensionValues?.[0]?.value || '/',
        pageTitle: row.dimensionValues?.[1]?.value || 'Unknown',
        pageviews: parseInt(row.metricValues?.[0]?.value || '0'),
        uniquePageviews: parseInt(row.metricValues?.[0]?.value || '0'), // GA4 doesn't have unique pageviews
        bounceRate: parseFloat(row.metricValues?.[1]?.value || '0'),
        avgTimeOnPage: parseFloat(row.metricValues?.[2]?.value || '0'),
      })) || [];
    } catch (error) {
      console.error('Error fetching page views:', error);
      throw error;
    }
  }

  /**
   * Get conversion data
   */
  async getConversions(
    dateFrom: string,
    dateTo: string
  ): Promise<Array<{
    eventName: string;
    eventCount: number;
    conversionRate: number;
  }>> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [
          {
            startDate: dateFrom,
            endDate: dateTo,
          },
        ],
        metrics: [
          { name: 'eventCount' },
          { name: 'sessions' },
        ],
        dimensions: [
          { name: 'eventName' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'CONTAINS',
              value: 'purchase',
            },
          },
        },
        orderBys: [
          {
            metric: {
              metricName: 'eventCount',
            },
            desc: true,
          },
        ],
        limit: 10,
      });

      return response.rows?.map(row => {
        const eventCount = parseInt(row.metricValues?.[0]?.value || '0');
        const sessions = parseInt(row.metricValues?.[1]?.value || '0');
        
        return {
          eventName: row.dimensionValues?.[0]?.value || 'unknown',
          eventCount,
          conversionRate: sessions > 0 ? (eventCount / sessions) * 100 : 0,
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching conversions:', error);
      throw error;
    }
  }

  /**
   * Get daily metrics for charts
   */
  async getDailyMetrics(
    dateFrom: string,
    dateTo: string
  ): Promise<Array<{
    date: string;
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
  }>> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [
          {
            startDate: dateFrom,
            endDate: dateTo,
          },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
        ],
        dimensions: [
          { name: 'date' },
        ],
        orderBys: [
          {
            dimension: {
              dimensionName: 'date',
            },
          },
        ],
      });

      return response.rows?.map(row => ({
        date: row.dimensionValues?.[0]?.value || '',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
      })) || [];
    } catch (error) {
      console.error('Error fetching daily metrics:', error);
      throw error;
    }
  }
}

/**
 * Create Google Analytics client instance with custom credentials
 */
export function createGoogleAnalyticsClient(propertyId: string, viewId?: string, credentials?: any): GoogleAnalyticsClient {
  const config: GoogleAnalyticsConfig = {
    propertyId,
    viewId,
    serviceAccountKey: credentials?.serviceAccountKey,
    clientEmail: credentials?.clientEmail || process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
    privateKey: credentials?.privateKey || process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  };

  return new GoogleAnalyticsClient(config);
}

/**
 * Generate date range for Google Analytics API queries
 */
export function getGADateRange(period: '7d' | '30d' | '90d'): { from: string; to: string } {
  const today = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = subDays(today, days);

  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(today, 'yyyy-MM-dd'),
  };
}