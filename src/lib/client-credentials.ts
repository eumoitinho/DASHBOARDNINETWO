/**
 * Client Credentials Management for NINETWODASH
 * Handles secure storage and retrieval of API credentials for each client
 */

import { prisma } from './database';
import { encryptCredentials, decryptCredentials } from './encryption';

// Types for credentials
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

export interface GoogleAnalyticsCredentials {
  propertyId: string;
  viewId?: string;
  serviceAccountKey?: any;
  clientEmail?: string;
  privateKey?: string;
}

/**
 * Save Google Ads credentials for a client
 */
export async function saveGoogleAdsCredentials(
  clientSlug: string,
  credentials: GoogleAdsCredentials
): Promise<boolean> {
  try {
    
    // Encrypt credentials
    const encryptedCredentials = encryptCredentials(credentials);
    
    // Update client using slug with Prisma
    await prisma.client.update({
      where: { slug: clientSlug },
      data: {
        googleAdsCustomerId: credentials.customerId,
        googleAdsEncryptedCredentials: encryptedCredentials,
        googleAdsConnected: false, // Will be tested separately
        updatedAt: new Date(),
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar credenciais Google Ads:', error);
    return false;
  }
}

/**
 * Save Facebook Ads credentials for a client
 */
export async function saveFacebookAdsCredentials(
  clientSlug: string,
  credentials: FacebookAdsCredentials
): Promise<boolean> {
  try {
    
    // Encrypt credentials
    const encryptedCredentials = encryptCredentials(credentials);
    
    // Update client using slug with Prisma
    await prisma.client.update({
      where: { slug: clientSlug },
      data: {
        facebookAdsAccountId: credentials.adAccountId,
        facebookPixelId: credentials.pixelId,
        facebookAdsEncryptedCredentials: encryptedCredentials,
        facebookAdsConnected: false, // Will be tested separately
        updatedAt: new Date(),
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar credenciais Facebook Ads:', error);
    return false;
  }
}

/**
 * Save Google Analytics credentials for a client
 */
export async function saveGoogleAnalyticsCredentials(
  clientSlug: string,
  credentials: GoogleAnalyticsCredentials
): Promise<boolean> {
  try {
    
    // Encrypt credentials
    const encryptedCredentials = encryptCredentials(credentials);
    
    // Update client using slug with Prisma
    await prisma.client.update({
      where: { slug: clientSlug },
      data: {
        googleAnalyticsPropertyId: credentials.propertyId,
        googleAnalyticsViewId: credentials.viewId,
        googleAnalyticsEncryptedCredentials: encryptedCredentials,
        googleAnalyticsConnected: false, // Will be tested separately
        updatedAt: new Date(),
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar credenciais Google Analytics:', error);
    return false;
  }
}

/**
 * Get Google Ads credentials for a client
 */
export async function getGoogleAdsCredentials(clientSlug: string): Promise<GoogleAdsCredentials | null> {
  try {
    
    const client = await prisma.client.findUnique({ where: { slug: clientSlug } });
    if (!client?.googleAdsEncryptedCredentials) {
      return null;
    }
    
    const credentials = decryptCredentials(client.googleAdsEncryptedCredentials);
    return credentials as GoogleAdsCredentials;
  } catch (error) {
    console.error('Erro ao obter credenciais Google Ads:', error);
    return null;
  }
}

/**
 * Get Facebook Ads credentials for a client
 */
export async function getFacebookAdsCredentials(clientSlug: string): Promise<FacebookAdsCredentials | null> {
  try {
    
    const client = await prisma.client.findUnique({ where: { slug: clientSlug } });
    if (!client?.facebookAdsEncryptedCredentials) {
      return null;
    }
    
    const credentials = decryptCredentials(client.facebookAdsEncryptedCredentials);
    return credentials as FacebookAdsCredentials;
  } catch (error) {
    console.error('Erro ao obter credenciais Facebook Ads:', error);
    return null;
  }
}

/**
 * Get Google Analytics credentials for a client
 */
export async function getGoogleAnalyticsCredentials(clientSlug: string): Promise<GoogleAnalyticsCredentials | null> {
  try {
    
    const client = await prisma.client.findUnique({ where: { slug: clientSlug } });
    if (!client?.googleAnalyticsEncryptedCredentials) {
      return null;
    }
    
    const credentials = decryptCredentials(client.googleAnalyticsEncryptedCredentials);
    return credentials as GoogleAnalyticsCredentials;
  } catch (error) {
    console.error('Erro ao obter credenciais Google Analytics:', error);
    return null;
  }
}

/**
 * Test Google Ads connection for a client
 */
export async function testGoogleAdsConnection(clientSlug: string): Promise<boolean> {
  try {
    const credentials = await getGoogleAdsCredentials(clientSlug);
    if (!credentials) {
      return false;
    }
    
    // For now, just check if credentials exist
    // TODO: Implement actual API test when Google Ads client is available
    const isConnected = !!(credentials.customerId && credentials.developerId);
    
    // Update connection status using slug with Prisma
    await prisma.client.update({
      where: { slug: clientSlug },
      data: {
        googleAdsConnected: isConnected,
        googleAdsLastSync: isConnected ? new Date() : null,
      }
    });
    
    return isConnected;
  } catch (error) {
    console.error('Erro ao testar conexão Google Ads:', error);
    return false;
  }
}

/**
 * Test Facebook Ads connection for a client
 */
export async function testFacebookAdsConnection(clientSlug: string): Promise<boolean> {
  try {
    const credentials = await getFacebookAdsCredentials(clientSlug);
    if (!credentials) {
      return false;
    }
    
    // For now, just check if credentials exist
    // TODO: Implement actual API test when Facebook client is available
    const isConnected = !!(credentials.adAccountId && credentials.appId);
    
    // Update connection status using slug with Prisma
    await prisma.client.update({
      where: { slug: clientSlug },
      data: {
        facebookAdsConnected: isConnected,
        facebookAdsLastSync: isConnected ? new Date() : null,
      }
    });
    
    return isConnected;
  } catch (error) {
    console.error('Erro ao testar conexão Facebook Ads:', error);
    return false;
  }
}

/**
 * Test Google Analytics connection for a client
 */
export async function testGoogleAnalyticsConnection(clientSlug: string): Promise<boolean> {
  try {
    const credentials = await getGoogleAnalyticsCredentials(clientSlug);
    if (!credentials) {
      return false;
    }
    
    // For now, just check if credentials exist
    // TODO: Implement actual API test when Google Analytics client is available
    const isConnected = !!(credentials.propertyId && (credentials.serviceAccountKey || credentials.clientEmail));
    
    // Update connection status using slug with Prisma
    await prisma.client.update({
      where: { slug: clientSlug },
      data: {
        googleAnalyticsConnected: isConnected,
        googleAnalyticsLastSync: isConnected ? new Date() : null,
      }
    });
    
    return isConnected;
  } catch (error) {
    console.error('Erro ao testar conexão Google Analytics:', error);
    return false;
  }
}

/**
 * Test all connections for a client
 */
export async function testAllConnections(clientSlug: string): Promise<{
  googleAds: boolean;
  facebookAds: boolean;
  googleAnalytics: boolean;
}> {
  const [googleAds, facebookAds, googleAnalytics] = await Promise.allSettled([
    testGoogleAdsConnection(clientSlug),
    testFacebookAdsConnection(clientSlug),
    testGoogleAnalyticsConnection(clientSlug),
  ]);
  
  return {
    googleAds: googleAds.status === 'fulfilled' ? googleAds.value : false,
    facebookAds: facebookAds.status === 'fulfilled' ? facebookAds.value : false,
    googleAnalytics: googleAnalytics.status === 'fulfilled' ? googleAnalytics.value : false,
  };
}

/**
 * Remove credentials for a client (security cleanup)
 */
export async function removeClientCredentials(clientSlug: string, platform?: 'googleAds' | 'facebookAds' | 'googleAnalytics'): Promise<boolean> {
  try {
    
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (!platform || platform === 'googleAds') {
      updateData.googleAdsEncryptedCredentials = null;
      updateData.googleAdsConnected = false;
    }
    
    if (!platform || platform === 'facebookAds') {
      updateData.facebookAdsEncryptedCredentials = null;
      updateData.facebookAdsConnected = false;
    }
    
    if (!platform || platform === 'googleAnalytics') {
      updateData.googleAnalyticsEncryptedCredentials = null;
      updateData.googleAnalyticsConnected = false;
    }
    
    await prisma.client.update({
      where: { slug: clientSlug },
      data: updateData
    });
    return true;
  } catch (error) {
    console.error('Erro ao remover credenciais:', error);
    return false;
  }
}

/**
 * Get client API status
 */
export async function getClientAPIStatus(clientSlug: string): Promise<{
  googleAds: { connected: boolean; customerId?: string; lastSync?: Date };
  facebookAds: { connected: boolean; adAccountId?: string; lastSync?: Date };
  googleAnalytics: { connected: boolean; propertyId?: string; lastSync?: Date };
}> {
  try {
    
    const client = await prisma.client.findUnique({ where: { slug: clientSlug } });
    if (!client) {
      throw new Error('Cliente não encontrado');
    }
    
    return {
      googleAds: {
        connected: client.googleAdsConnected || false,
        customerId: client.googleAdsCustomerId,
        lastSync: client.googleAdsLastSync,
      },
      facebookAds: {
        connected: client.facebookAdsConnected || false,
        adAccountId: client.facebookAdsAccountId,
        lastSync: client.facebookAdsLastSync,
      },
      googleAnalytics: {
        connected: client.googleAnalyticsConnected || false,
        propertyId: client.googleAnalyticsPropertyId,
        lastSync: client.googleAnalyticsLastSync,
      },
    };
  } catch (error) {
    console.error('Erro ao obter status das APIs:', error);
    throw error;
  }
}