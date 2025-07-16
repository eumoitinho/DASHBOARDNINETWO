// Dashboard data types for NINETWODASH

export interface Client {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  ga4Connected: boolean;
  metaConnected: boolean;
  lastSync: string;
  monthlyBudget: number;
  avatar?: string;
  tags?: string[];
  // API credentials (stored securely)
  googleAdsCustomerId?: string;
  facebookAdAccountId?: string;
  facebookPixelId?: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversionRate: number;
  roas?: number;
}

export interface Campaign {
  campaignId: string;
  campaignName: string;
  platform: 'google_ads' | 'facebook' | 'meta';
  status: 'active' | 'paused' | 'completed';
  date: string;
  metrics: CampaignMetrics;
}

export interface DashboardSummary extends CampaignMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalCost: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageCPM: number;
  averageConversionRate: number;
  totalROAS: number;
}

export interface ClientDashboardData {
  client: Client;
  dateRange: {
    from: string;
    to: string;
  };
  summary: DashboardSummary;
  campaigns: Campaign[];
  lastUpdated: string;
  dataSource: {
    googleAds: boolean;
    facebookAds: boolean;
    mock: boolean;
  };
}

export interface AgencyOverview {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  totalSpend: number;
  totalConversions: number;
  averageConversionRate: number;
  topPerformingClients: Array<{
    client: Client;
    metrics: CampaignMetrics;
  }>;
  lastUpdated: string;
}

// Google Ads API Types
export interface GoogleAdsConfig {
  developerId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
}

export interface GoogleAdsMetrics {
  impressions: string;
  clicks: string;
  cost_micros: string;
  conversions: string;
  search_impression_share?: string;
  ctr?: string;
  average_cpc?: string;
  cost_per_conversion?: string;
}

// Facebook Marketing API Types
export interface FacebookAdsConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  adAccountId: string;
  pixelId?: string;
}

export interface FacebookAdsMetrics {
  impressions: string;
  clicks: string;
  spend: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  ctr: string;
  cpc: string;
  cpm: string;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Date range options
export type DateRangeOption = '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

// Error handling
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}