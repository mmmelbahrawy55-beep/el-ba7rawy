/**
 * Simple In-Memory Cache for High-Performance Data Retrieval
 * Reduces database load by caching static or semi-static config/knowledge
 */

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const cache = new Map<string, CacheEntry<any>>();

export const memoryCache = {
  /**
   * Get item from cache
   */
  get: <T>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  },

  /**
   * Set item in cache with TTL (Time To Live) in milliseconds
   */
  set: <T>(key: string, data: T, ttl: number = 300000): void => {
    cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  },

  /**
   * Invalidate a specific key or all cache
   */
  invalidate: (key?: string): void => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  },

  /**
   * Advanced Semantic-like lookup (Key Normalization)
   * Collapses similar queries into the same cache key to increase hit rate.
   */
  getSemanticKey: (text: string): string => {
    return text.toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/gi, '') // Keep Arabic and Alphanumeric
      .trim()
      .split(/\s+/)
      .slice(0, 5) // Use first 5 words as semantic hash
      .join('_');
  }
};
