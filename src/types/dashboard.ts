/**
 * TypeScript definitions for NINETWODASH
 * Defines interfaces and types for dashboard, API responses, and data structures
 */

// Base API Response structure
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Client interface
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
  googleAdsCustomerId?: string;
  facebookAdAccountId?: string;
}

// Campaign metrics interface
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversionRate: number;
  roas: number;
}

// Campaign interface
export interface Campaign {
  campaignId: string;
  campaignName: string;
  platform: 'google_ads' | 'facebook' | 'meta';
  status: 'active' | 'paused' | 'completed';
  date: string;
  metrics: CampaignMetrics;
}

// Dashboard summary interface
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

// Date range interface
export interface DateRange {
  from: string;
  to: string;
}

// Data source interface
export interface DataSource {
  googleAds: boolean;
  facebookAds: boolean;
  mock: boolean;
}

// Client dashboard data interface
export interface ClientDashboardData {
  client: Client;
  dateRange: DateRange;
  summary: DashboardSummary;
  campaigns: Campaign[];
  lastUpdated: string;
  dataSource: DataSource;
}

// Google Analytics interfaces
export interface GAMetrics {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  sessionDuration: number;
  newUsers: number;
}

export interface GATrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  bounceRate: number;
}

export interface GADeviceData {
  deviceCategory: string;
  sessions: number;
  users: number;
  bounceRate: number;
}

export interface GATopPage {
  page: string;
  pageTitle: string;
  pageviews: number;
  uniquePageviews: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

// Error interfaces
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Cache interfaces
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: string;
}

// Connection test interfaces
export interface ConnectionTestResult {
  service: string;
  connected: boolean;
  error?: string;
  response_time?: number;
  details?: any;
}

// Report interfaces
export interface Report {
  id: string;
  clientId: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  dateRange: DateRange;
  summary: DashboardSummary;
  campaigns: Campaign[];
  createdAt: string;
  generatedBy: string;
}

// Activity log interface
export interface ActivityLog {
  id: string;
  userId: string;
  clientId?: string;
  action: string;
  description: string;
  metadata?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  clientId?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// Portal settings interface
export interface PortalSettings {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  allowedSections: string[];
  customDomain?: string;
}

// Client with portal settings
export interface ClientWithPortal extends Client {
  portalSettings: PortalSettings;
}

// API credentials interfaces
export interface GoogleAdsCredentials {
  developerId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
}

export interface FacebookAdsCredentials {
  appId: string;
  appSecret: string;
  accessToken: string;
  adAccountId: string;
  pixelId?: string;
}

export interface FacebookAdsConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  adAccountId: string;
  pixelId?: string;
  version: string;
}

export interface FacebookAdsMetrics extends CampaignMetrics {
  reach: number;
  frequency: number;
  socialSpend: number;
  websiteClicks: number;
}

export interface GoogleAdsConfig {
  developerId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
}

export interface GoogleAdsMetrics extends CampaignMetrics {
  searchImpressionShare: number;
  qualityScore: number;
  avgPosition: number;
  invalidClicks: number;
}

export interface GoogleAnalyticsCredentials {
  propertyId: string;
  viewId?: string;
  serviceAccountKey?: any;
  clientEmail?: string;
  privateKey?: string;
}

// Client API status interface
export interface ClientAPIStatus {
  googleAds: {
    connected: boolean;
    customerId?: string;
    lastSync?: Date;
  };
  facebookAds: {
    connected: boolean;
    adAccountId?: string;
    lastSync?: Date;
  };
  googleAnalytics: {
    connected: boolean;
    propertyId?: string;
    lastSync?: Date;
  };
}

// Chart data interfaces
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface TimeSeriesData {
  data: ChartDataPoint[];
  categories: string[];
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter interfaces
export interface DateFilter {
  from: Date;
  to: Date;
}

export interface CampaignFilter {
  platform?: 'google_ads' | 'facebook' | 'meta';
  status?: 'active' | 'paused' | 'completed';
  dateFilter?: DateFilter;
}

// Export interfaces
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'xlsx';
  dateRange: DateRange;
  includeCharts: boolean;
  clientIds?: string[];
}

// Notification interfaces
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// System health interface
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  services: {
    database: boolean;
    googleAds: boolean;
    facebookAds: boolean;
    googleAnalytics: boolean;
    cache: boolean;
  };
  uptime: number;
  lastCheck: string;
}