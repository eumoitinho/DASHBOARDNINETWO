import { LRUCache } from 'lru-cache';
import type { CacheEntry } from '../types/dashboard';

/**
 * Cache system for NINETWODASH API responses
 * Implements LRU cache with TTL for Google Ads and Facebook Marketing API data
 */

// Cache configurations
const CACHE_CONFIG = {
  // Campaign data cache - 15 minutes
  campaigns: {
    max: 100,
    ttl: 15 * 60 * 1000, // 15 minutes
  },
  // Historical data cache - 1 hour
  historical: {
    max: 50,
    ttl: 60 * 60 * 1000, // 1 hour
  },
  // Client data cache - 5 minutes
  clients: {
    max: 200,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
  // Agency overview cache - 10 minutes
  overview: {
    max: 10,
    ttl: 10 * 60 * 1000, // 10 minutes
  }
};

// Create cache instances
export const campaignCache = new LRUCache<string, CacheEntry<any>>(CACHE_CONFIG.campaigns);
export const historicalCache = new LRUCache<string, CacheEntry<any>>(CACHE_CONFIG.historical);
export const clientCache = new LRUCache<string, CacheEntry<any>>(CACHE_CONFIG.clients);
export const overviewCache = new LRUCache<string, CacheEntry<any>>(CACHE_CONFIG.overview);

/**
 * Generate cache key for API requests
 */
export function generateCacheKey(
  type: 'campaign' | 'historical' | 'client' | 'overview',
  clientId: string,
  params?: Record<string, any>
): string {
  const baseKey = `${type}:${clientId}`;
  
  if (!params) return baseKey;
  
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
    
  return `${baseKey}:${paramString}`;
}

/**
 * Get data from cache
 */
export function getCachedData<T>(
  cache: LRUCache<string, CacheEntry<T>>,
  key: string
): T | null {
  const entry = cache.get(key);
  
  if (!entry) return null;
  
  // Check if cache entry has expired
  if (Date.now() > entry.timestamp + entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Set data in cache
 */
export function setCachedData<T>(
  cache: LRUCache<string, CacheEntry<T>>,
  key: string,
  data: T,
  customTtl?: number
): void {
  const ttl = customTtl || CACHE_CONFIG.campaigns.ttl;
  
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl
  };
  
  cache.set(key, entry);
}

/**
 * Clear cache for specific client
 */
export function clearClientCache(clientId: string): void {
  // Clear all cache entries for this client
  [campaignCache, historicalCache, clientCache, overviewCache].forEach(cache => {
    for (const key of cache.keys()) {
      if (key.includes(`:${clientId}`)) {
        cache.delete(key);
      }
    }
  });
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  campaignCache.clear();
  historicalCache.clear();
  clientCache.clear();
  overviewCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    campaigns: {
      size: campaignCache.size,
      max: campaignCache.max,
      calculatedSize: campaignCache.calculatedSize
    },
    historical: {
      size: historicalCache.size,
      max: historicalCache.max,
      calculatedSize: historicalCache.calculatedSize
    },
    clients: {
      size: clientCache.size,
      max: clientCache.max,
      calculatedSize: clientCache.calculatedSize
    },
    overview: {
      size: overviewCache.size,
      max: overviewCache.max,
      calculatedSize: overviewCache.calculatedSize
    }
  };
}

/**
 * Helper function to cache API responses
 */
export async function withCache<T>(
  cacheType: 'campaign' | 'historical' | 'client' | 'overview',
  key: string,
  fetchFunction: () => Promise<T>,
  customTtl?: number
): Promise<T> {
  const cache = getCacheByType(cacheType);
  
  // Try to get from cache first
  const cached = getCachedData(cache, key);
  if (cached) {
    console.log(`Cache hit for key: ${key}`);
    return cached;
  }
  
  console.log(`Cache miss for key: ${key}, fetching data...`);
  
  try {
    // Fetch fresh data
    const data = await fetchFunction();
    
    // Cache the result
    setCachedData(cache, key, data, customTtl);
    
    return data;
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Get cache instance by type
 */
function getCacheByType(type: 'campaign' | 'historical' | 'client' | 'overview') {
  switch (type) {
    case 'campaign': return campaignCache;
    case 'historical': return historicalCache;
    case 'client': return clientCache;
    case 'overview': return overviewCache;
    default: return campaignCache;
  }
}