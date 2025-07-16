/**
 * Database Connection and Helpers for NINETWODASH with Prisma + Neon PostgreSQL
 * Handles database operations for clients, reports, and user management
 */

import { PrismaClient } from '@prisma/client'

// Global is used here to maintain a cached connection across hot reloads in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Helper functions for common database operations
export async function findClientBySlug(slug: string) {
  const client = await prisma.client.findUnique({
    where: {
      slug,
      status: {
        not: 'inactive'
      }
    },
    include: {
      users: true,
      customCharts: true,
    }
  });

  if (!client) {
    return null;
  }

  // Transform the client data to match the expected structure
  return {
    ...client,
    // Map portal settings from individual fields to nested object
    portalSettings: {
      primaryColor: client.primaryColor,
      secondaryColor: client.secondaryColor,
      allowedSections: client.allowedSections,
      logoUrl: client.logoUrl,
      customDomain: client.customDomain,
    },
    // Map API connections to nested objects
    googleAds: {
      customerId: client.googleAdsCustomerId,
      managerId: client.googleAdsManagerId,
      connected: client.googleAdsConnected,
      lastSync: client.googleAdsLastSync,
    },
    facebookAds: {
      adAccountId: client.facebookAdsAccountId,
      pixelId: client.facebookPixelId,
      connected: client.facebookAdsConnected,
      lastSync: client.facebookAdsLastSync,
    },
    googleAnalytics: {
      propertyId: client.googleAnalyticsPropertyId,
      connected: client.googleAnalyticsConnected,
      lastSync: client.googleAnalyticsLastSync,
    },
  };
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email,
      isActive: true
    },
    include: {
      client: true
    }
  });
}

export async function logActivity(
  userId: string,
  action: string,
  description: string,
  metadata?: any,
  clientId?: string
) {
  return await prisma.activityLog.create({
    data: {
      userId,
      clientId,
      action,
      description,
      metadata: metadata || undefined,
    }
  });
}

export async function getClientCampaigns(clientId: string, platform?: string) {
  const whereClause: any = { clientId };
  if (platform) {
    whereClause.platform = platform;
  }

  return await prisma.campaign.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          slug: true
        }
      },
      metrics: {
        orderBy: { date: 'desc' },
        take: 30 // Last 30 days of metrics
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function saveMetricsData(
  clientId: string,
  campaignId: string,
  platform: string,
  campaignName: string,
  metricsData: any[]
) {
  // First, find or create the campaign
  const campaign = await prisma.campaign.upsert({
    where: {
      clientId_campaignId_platform: {
        clientId,
        campaignId,
        platform: platform as any
      }
    },
    update: {
      campaignName,
      status: 'active',
      updatedAt: new Date()
    },
    create: {
      clientId,
      campaignId,
      campaignName,
      platform: platform as any,
      status: 'active'
    }
  });

  // Then save the metrics data
  const metricsToCreate = metricsData.map(metric => ({
    campaignId: campaign.id,
    date: new Date(metric.date),
    impressions: metric.impressions || 0,
    clicks: metric.clicks || 0,
    cost: metric.cost || 0,
    conversions: metric.conversions || 0,
    ctr: metric.ctr || 0,
    cpc: metric.cpc || 0,
    cpm: metric.cpm || 0,
    conversionRate: metric.conversionRate || 0,
    roas: metric.roas || 0,
  }));

  // Use createMany with skipDuplicates to avoid conflicts
  await prisma.campaignMetric.createMany({
    data: metricsToCreate,
    skipDuplicates: true
  });

  return campaign;
}

export async function findRecentCampaigns(clientSlug: string, period: '7d' | '30d' | '90d') {
  // Get client first
  const client = await prisma.client.findUnique({
    where: { slug: clientSlug }
  });

  if (!client) {
    return [];
  }

  // Calculate date range
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Find campaigns for the client in the period
  const campaigns = await prisma.campaign.findMany({
    where: {
      clientId: client.id,
      updatedAt: { gte: startDate },
      status: 'active'
    },
    include: {
      metrics: {
        orderBy: { date: 'desc' },
        take: 1 // Get the most recent metrics
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return campaigns.map((campaign) => ({
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    platform: campaign.platform,
    status: campaign.status,
    date: campaign.updatedAt.toISOString().split('T')[0],
    metrics: campaign.metrics[0] || {
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      conversionRate: 0,
      roas: 0,
    },
  }));
}

export async function getAllClients() {
  return await prisma.client.findMany({
    where: {
      status: {
        not: 'inactive'
      }
    },
    include: {
      users: true,
      _count: {
        select: {
          campaigns: true,
          reports: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function createClient(data: {
  name: string;
  email: string;
  slug: string;
  monthlyBudget: number;
  tags?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  allowedSections?: string[];
}) {
  return await prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      slug: data.slug,
      monthlyBudget: data.monthlyBudget,
      tags: data.tags || [],
      primaryColor: data.primaryColor || '#3B82F6',
      secondaryColor: data.secondaryColor || '#8B5CF6',
      allowedSections: data.allowedSections || ['dashboard', 'campanhas', 'analytics', 'relatorios'],
      status: 'active'
    }
  });
}

export async function updateClient(id: string, data: any) {
  // Filter only valid Prisma fields
  const validData: any = {};
  
  // Basic client fields
  if (data.name !== undefined) validData.name = data.name;
  if (data.email !== undefined) validData.email = data.email;
  if (data.slug !== undefined) validData.slug = data.slug;
  if (data.monthlyBudget !== undefined) validData.monthlyBudget = data.monthlyBudget;
  if (data.tags !== undefined) validData.tags = data.tags;
  if (data.status !== undefined) validData.status = data.status;
  if (data.avatar !== undefined) validData.avatar = data.avatar;
  
  // Additional client info
  if (data.phone !== undefined) validData.phone = data.phone;
  if (data.company !== undefined) validData.company = data.company;
  if (data.website !== undefined) validData.website = data.website;
  if (data.notes !== undefined) validData.notes = data.notes;
  
  // Portal settings - map to individual fields
  if (data.portalSettings) {
    if (data.portalSettings.primaryColor) validData.primaryColor = data.portalSettings.primaryColor;
    if (data.portalSettings.secondaryColor) validData.secondaryColor = data.portalSettings.secondaryColor;
    if (data.portalSettings.allowedSections) validData.allowedSections = data.portalSettings.allowedSections;
    if (data.portalSettings.logoUrl) validData.logoUrl = data.portalSettings.logoUrl;
    if (data.portalSettings.customDomain) validData.customDomain = data.portalSettings.customDomain;
  }
  
  // API connections
  if (data.googleAds) {
    if (data.googleAds.connected !== undefined) validData.googleAdsConnected = data.googleAds.connected;
    if (data.googleAds.customerId !== undefined) validData.googleAdsCustomerId = data.googleAds.customerId;
    if (data.googleAds.managerId !== undefined) validData.googleAdsManagerId = data.googleAds.managerId;
    if (data.googleAds.lastSync !== undefined) validData.googleAdsLastSync = data.googleAds.lastSync;
  }
  
  if (data.facebookAds) {
    if (data.facebookAds.connected !== undefined) validData.facebookAdsConnected = data.facebookAds.connected;
    if (data.facebookAds.adAccountId !== undefined) validData.facebookAdsAccountId = data.facebookAds.adAccountId;
    if (data.facebookAds.pixelId !== undefined) validData.facebookPixelId = data.facebookAds.pixelId;
    if (data.facebookAds.lastSync !== undefined) validData.facebookAdsLastSync = data.facebookAds.lastSync;
  }
  
  if (data.googleAnalytics) {
    if (data.googleAnalytics.connected !== undefined) validData.googleAnalyticsConnected = data.googleAnalytics.connected;
    if (data.googleAnalytics.propertyId !== undefined) validData.googleAnalyticsPropertyId = data.googleAnalytics.propertyId;
    if (data.googleAnalytics.lastSync !== undefined) validData.googleAnalyticsLastSync = data.googleAnalytics.lastSync;
  }
  
  // Always update the timestamp
  validData.updatedAt = new Date();
  
  return await prisma.client.update({
    where: { id },
    data: validData
  });
}

export async function deleteClient(id: string) {
  // This will cascade delete all related records due to the schema configuration
  return await prisma.client.delete({
    where: { id }
  });
}

// Analytics helpers
export async function saveAnalyticsData(clientId: string, date: Date, data: {
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  bounceRate: number;
  sessionDuration: number;
  trafficSources?: any;
  deviceData?: any;
  topPages?: any;
}) {
  return await prisma.analyticsData.upsert({
    where: {
      clientId_date: {
        clientId,
        date
      }
    },
    update: {
      sessions: data.sessions,
      users: data.users,
      newUsers: data.newUsers,
      pageviews: data.pageviews,
      bounceRate: data.bounceRate,
      sessionDuration: data.sessionDuration,
      trafficSources: data.trafficSources,
      deviceData: data.deviceData,
      topPages: data.topPages,
    },
    create: {
      clientId,
      date,
      sessions: data.sessions,
      users: data.users,
      newUsers: data.newUsers,
      pageviews: data.pageviews,
      bounceRate: data.bounceRate,
      sessionDuration: data.sessionDuration,
      trafficSources: data.trafficSources,
      deviceData: data.deviceData,
      topPages: data.topPages,
    }
  });
}

export async function getClientAnalytics(clientId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.analyticsData.findMany({
    where: {
      clientId,
      date: { gte: startDate }
    },
    orderBy: { date: 'asc' }
  });
}

export default prisma;