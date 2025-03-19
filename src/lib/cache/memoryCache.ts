// src/lib/cache/memoryCache.ts
import { LRUCache } from 'lru-cache';

// Create a cache with a maximum of 100 items that expire after 1 hour
const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 60, // 1 hour
});

/**
 * Get an item from the cache
 * @param key Cache key
 * @returns Cached item or undefined
 */
export function getCacheItem(key: string) {
  return cache.get(key);
}

/**
 * Set an item in the cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in milliseconds (optional)
 */
export function setCacheItem(key: string, value: any, ttl?: number) {
  cache.set(key, value, { ttl });
}

/**
 * Remove an item from the cache
 * @param key Cache key
 */
export function removeCacheItem(key: string) {
  cache.delete(key);
}

/**
 * Clear the entire cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Get cache stats
 * @returns Cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: cache.max,
    itemCount: cache.size,
  };
}
