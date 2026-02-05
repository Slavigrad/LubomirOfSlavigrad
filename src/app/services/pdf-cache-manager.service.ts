import { Injectable, signal, computed, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IntervalManager } from '../shared/utils/interval-manager';

/**
 * Cache Storage Types
 */
export type CacheStorageType = 'memory' | 'sessionStorage' | 'indexedDB';

/**
 * Cache Entry Interface
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
}

/**
 * Cache Configuration
 */
export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  maxEntries: number; // Maximum number of entries
  defaultTTL: number; // Default time to live in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  enableCompression: boolean;
  enableEncryption: boolean;
}

/**
 * Cache Statistics
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  storageQuotaUsed: number;
  storageQuotaTotal: number;
}

/**
 * Cache Analytics
 */
export interface CacheAnalytics {
  hitCount: number;
  missCount: number;
  evictionCount: number;
  totalRequests: number;
  averageAccessTime: number;
  popularKeys: string[];
  storageDistribution: Record<CacheStorageType, number>;
  hitRate: number;
  missRate: number;
}

/**
 * Storage Quota Information
 */
interface StorageQuota {
  quota: number;
  usage: number;
  available: number;
  percentage: number;
}

/**
 * PDF Cache Manager Service
 *
 * Provides comprehensive caching capabilities for PDF generation system with
 * multi-level storage, intelligent eviction, and performance analytics.
 */
@Injectable({
  providedIn: 'root'
})
export class PDFCacheManagerService {

  // Cache configurations for different storage types
  private readonly cacheConfigs: Record<CacheStorageType, CacheConfig> = {
    memory: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000,
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      enableCompression: false,
      enableEncryption: false
    },
    sessionStorage: {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxEntries: 200,
      defaultTTL: 60 * 60 * 1000, // 1 hour
      cleanupInterval: 10 * 60 * 1000, // 10 minutes
      enableCompression: true,
      enableEncryption: false
    },
    indexedDB: {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 5000,
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 30 * 60 * 1000, // 30 minutes
      enableCompression: true,
      enableEncryption: true
    }
  };

  // Memory cache storage
  private readonly memoryCache = new Map<string, CacheEntry>();

  // Cache analytics tracking
  private readonly analytics: CacheAnalytics = {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
    totalRequests: 0,
    averageAccessTime: 0,
    popularKeys: [],
    storageDistribution: {
      memory: 0,
      sessionStorage: 0,
      indexedDB: 0
    },
    hitRate: 0,
    missRate: 0
  };

  // Reactive state
  private readonly _cacheStats = signal<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    storageQuotaUsed: 0,
    storageQuotaTotal: 0
  });

  private readonly _storageQuota = signal<StorageQuota>({
    quota: 0,
    usage: 0,
    available: 0,
    percentage: 0
  });

  private readonly _isOptimizing = signal<boolean>(false);

  // Public readonly signals
  readonly cacheStats = this._cacheStats.asReadonly();
  readonly storageQuota = this._storageQuota.asReadonly();
  readonly isOptimizing = this._isOptimizing.asReadonly();

  // Computed cache effectiveness
  readonly cacheEffectiveness = computed(() => {
    const stats = this._cacheStats();
    return stats.hitRate;
  });

  readonly memoryPressure = computed(() => {
    const quota = this._storageQuota();
    return quota.percentage > 80;
  });

  // Interval management
  private readonly intervals = new IntervalManager();

  // IndexedDB instance
  private indexedDB: IDBDatabase | null = null;

  constructor() {
    this.initializeCache();
    this.startCleanupIntervals();
    this.monitorStorageQuota();
  }

  /**
   * Initialize cache system
   */
  private async initializeCache(): Promise<void> {
    // Initialize IndexedDB
    await this.initializeIndexedDB();

    // Load existing cache stats
    this.updateCacheStats();

    // Setup cross-tab synchronization
    this.setupCrossTabSync();
  }

  /**
   * Initialize IndexedDB for persistent caching
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PDFCacheDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.indexedDB = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('expiresAt', 'expiresAt');
          store.createIndex('tags', 'tags', { multiEntry: true });
        }
      };
    });
  }

  /**
   * Get item from cache with multi-level fallback
   */
  async get<T>(key: string, storageTypes: CacheStorageType[] = ['memory', 'sessionStorage', 'indexedDB']): Promise<T | null> {
    const startTime = performance.now();
    this.analytics.totalRequests++;

    for (const storageType of storageTypes) {
      const entry = await this.getFromStorage<T>(key, storageType);

      if (entry && !this.isExpired(entry)) {
        // Update access statistics
        entry.accessCount++;
        entry.lastAccessed = Date.now();

        // Promote to higher-level cache if needed
        if (storageType !== 'memory') {
          await this.set(key, entry.value, 'memory', {
            ttl: entry.expiresAt - Date.now(),
            tags: entry.tags
          });
        }

        this.analytics.hitCount++;
        this.recordAccessTime(performance.now() - startTime);
        this.updatePopularKeys(key);

        return entry.value;
      }
    }

    this.analytics.missCount++;
    this.recordAccessTime(performance.now() - startTime);
    return null;
  }

  /**
   * Set item in cache with specified storage type
   */
  async set<T>(
    key: string,
    value: T,
    storageType: CacheStorageType = 'memory',
    options: {
      ttl?: number;
      tags?: string[];
      priority?: number;
    } = {}
  ): Promise<void> {
    const config = this.cacheConfigs[storageType];
    const ttl = options.ttl || config.defaultTTL;
    const size = this.calculateSize(value);

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      size,
      accessCount: 1,
      lastAccessed: Date.now(),
      tags: options.tags || []
    };

    // Check if cache needs cleanup before adding
    await this.ensureCapacity(storageType, size);

    // Store in specified storage type
    await this.setInStorage(entry, storageType);

    // Update analytics
    this.analytics.storageDistribution[storageType] += size;
    this.updateCacheStats();
  }

  /**
   * Remove item from all cache levels
   */
  async remove(key: string): Promise<void> {
    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from session storage
    try {
      sessionStorage.removeItem(`pdf-cache-${key}`);
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
    }

    // Remove from IndexedDB
    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      store.delete(key);
    }

    this.updateCacheStats();
  }

  /**
   * Warm cache with preloaded data
   */
  async warmCache(entries: Array<{ key: string; value: any; storageType?: CacheStorageType; tags?: string[] }>): Promise<void> {
    const promises = entries.map(entry =>
      this.set(entry.key, entry.value, entry.storageType || 'memory', {
        tags: entry.tags
      })
    );

    await Promise.all(promises);
  }

  /**
   * Get cache analytics
   */
  getCacheAnalytics(): CacheAnalytics {
    const totalRequests = this.analytics.totalRequests;
    const hitRate = totalRequests > 0 ? (this.analytics.hitCount / totalRequests) * 100 : 0;
    const missRate = totalRequests > 0 ? (this.analytics.missCount / totalRequests) * 100 : 0;

    return {
      ...this.analytics,
      hitRate,
      missRate
    };
  }

  /**
   * Optimize cache performance
   */
  async optimizeCache(): Promise<void> {
    this._isOptimizing.set(true);

    try {
      // Clean expired entries
      await this.cleanupExpiredEntries();

      // Optimize storage distribution
      await this.optimizeStorageDistribution();

      // Update analytics
      this.updateCacheStats();

    } finally {
      this._isOptimizing.set(false);
    }
  }

  /**
   * Private helper methods
   */

  private async getFromStorage<T>(key: string, storageType: CacheStorageType): Promise<CacheEntry<T> | null> {
    switch (storageType) {
      case 'memory':
        return this.memoryCache.get(key) as CacheEntry<T> || null;

      case 'sessionStorage':
        try {
          const item = sessionStorage.getItem(`pdf-cache-${key}`);
          return item ? JSON.parse(item) : null;
        } catch {
          return null;
        }

      case 'indexedDB':
        if (!this.indexedDB) return null;

        return new Promise((resolve) => {
          const transaction = this.indexedDB!.transaction(['cache'], 'readonly');
          const store = transaction.objectStore('cache');
          const request = store.get(key);

          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });

      default:
        return null;
    }
  }

  private async setInStorage<T>(entry: CacheEntry<T>, storageType: CacheStorageType): Promise<void> {
    switch (storageType) {
      case 'memory':
        this.memoryCache.set(entry.key, entry);
        break;

      case 'sessionStorage':
        try {
          const serialized = JSON.stringify(entry);
          sessionStorage.setItem(`pdf-cache-${entry.key}`, serialized);
        } catch (error) {
          console.warn('Failed to store in sessionStorage:', error);
        }
        break;

      case 'indexedDB':
        if (this.indexedDB) {
          const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          store.put(entry);
        }
        break;
    }
  }

  private async clearStorage(storageType: CacheStorageType, options: {
    tags?: string[];
    olderThan?: number;
  }): Promise<void> {
    switch (storageType) {
      case 'memory':
        if (options.tags || options.olderThan) {
          for (const [key, entry] of this.memoryCache.entries()) {
            if (this.shouldRemoveEntry(entry, options)) {
              this.memoryCache.delete(key);
            }
          }
        } else {
          this.memoryCache.clear();
        }
        break;

      case 'sessionStorage':
        if (options.tags || options.olderThan) {
          const keysToRemove: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith('pdf-cache-')) {
              try {
                const entry = JSON.parse(sessionStorage.getItem(key)!);
                if (this.shouldRemoveEntry(entry, options)) {
                  keysToRemove.push(key);
                }
              } catch {
                keysToRemove.push(key);
              }
            }
          }
          keysToRemove.forEach(key => sessionStorage.removeItem(key));
        } else {
          // Clear all PDF cache entries
          const keysToRemove: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith('pdf-cache-')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => sessionStorage.removeItem(key));
        }
        break;

      case 'indexedDB':
        if (this.indexedDB) {
          const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');

          if (options.tags || options.olderThan) {
            const request = store.openCursor();
            request.onsuccess = (event) => {
              const cursor = (event.target as IDBRequest).result;
              if (cursor) {
                const entry = cursor.value;
                if (this.shouldRemoveEntry(entry, options)) {
                  cursor.delete();
                }
                cursor.continue();
              }
            };
          } else {
            store.clear();
          }
        }
        break;
    }
  }

  private shouldRemoveEntry(entry: CacheEntry, options: {
    tags?: string[];
    olderThan?: number;
  }): boolean {
    if (options.olderThan && entry.timestamp < options.olderThan) {
      return true;
    }

    if (options.tags && options.tags.some(tag => entry.tags.includes(tag))) {
      return true;
    }

    return false;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private calculateSize(value: any): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return JSON.stringify(value).length * 2; // Rough estimate
    }
  }

  private async ensureCapacity(storageType: CacheStorageType, requiredSize: number): Promise<void> {
    const config = this.cacheConfigs[storageType];
    const currentStats = await this.getStorageStats(storageType);

    if (currentStats.totalSize + requiredSize > config.maxSize ||
        currentStats.totalEntries >= config.maxEntries) {
      await this.evictLRU(storageType, requiredSize);
    }
  }

  private async evictLRU(storageType: CacheStorageType, requiredSize: number): Promise<void> {
    const entries = await this.getAllEntries(storageType);

    // Sort by last accessed time (LRU)
    entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

    let freedSize = 0;
    const keysToRemove: string[] = [];

    for (const entry of entries) {
      keysToRemove.push(entry.key);
      freedSize += entry.size;
      this.analytics.evictionCount++;

      if (freedSize >= requiredSize) {
        break;
      }
    }

    // Remove selected entries
    for (const key of keysToRemove) {
      await this.removeFromStorage(key, storageType);
    }
  }

  /**
   * Additional helper methods
   */
  private async getAllEntries(storageType: CacheStorageType): Promise<CacheEntry[]> {
    switch (storageType) {
      case 'memory':
        return Array.from(this.memoryCache.values());

      case 'sessionStorage':
        const sessionEntries: CacheEntry[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('pdf-cache-')) {
            try {
              const entry = JSON.parse(sessionStorage.getItem(key)!);
              sessionEntries.push(entry);
            } catch {
              // Skip invalid entries
            }
          }
        }
        return sessionEntries;

      case 'indexedDB':
        if (!this.indexedDB) return [];

        return new Promise((resolve) => {
          const entries: CacheEntry[] = [];
          const transaction = this.indexedDB!.transaction(['cache'], 'readonly');
          const store = transaction.objectStore('cache');
          const request = store.openCursor();

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              entries.push(cursor.value);
              cursor.continue();
            } else {
              resolve(entries);
            }
          };

          request.onerror = () => resolve([]);
        });

      default:
        return [];
    }
  }

  private async removeFromStorage(key: string, storageType: CacheStorageType): Promise<void> {
    switch (storageType) {
      case 'memory':
        this.memoryCache.delete(key);
        break;

      case 'sessionStorage':
        sessionStorage.removeItem(`pdf-cache-${key}`);
        break;

      case 'indexedDB':
        if (this.indexedDB) {
          const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          store.delete(key);
        }
        break;
    }
  }

  private async getStorageStats(storageType: CacheStorageType): Promise<{ totalEntries: number; totalSize: number }> {
    const entries = await this.getAllEntries(storageType);

    return {
      totalEntries: entries.length,
      totalSize: entries.reduce((sum, entry) => sum + entry.size, 0)
    };
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();

    // Cleanup memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Cleanup session storage
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('pdf-cache-')) {
        try {
          const entry = JSON.parse(sessionStorage.getItem(key)!);
          if (this.isExpired(entry)) {
            sessionKeysToRemove.push(key);
          }
        } catch {
          sessionKeysToRemove.push(key);
        }
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

    // Cleanup IndexedDB
    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(now);

      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    }
  }

  private async optimizeStorageDistribution(): Promise<void> {
    // Move frequently accessed items to memory cache
    const sessionEntries = await this.getAllEntries('sessionStorage');
    const indexedDBEntries = await this.getAllEntries('indexedDB');

    const allEntries = [...sessionEntries, ...indexedDBEntries];
    allEntries.sort((a, b) => b.accessCount - a.accessCount);

    // Move top 10 most accessed items to memory
    const topEntries = allEntries.slice(0, 10);
    for (const entry of topEntries) {
      if (!this.memoryCache.has(entry.key)) {
        await this.set(entry.key, entry.value, 'memory', {
          ttl: entry.expiresAt - Date.now(),
          tags: entry.tags
        });
      }
    }
  }

  private recordAccessTime(time: number): void {
    const currentAverage = this.analytics.averageAccessTime;
    const totalRequests = this.analytics.totalRequests;

    this.analytics.averageAccessTime =
      (currentAverage * (totalRequests - 1) + time) / totalRequests;
  }

  private updatePopularKeys(key: string): void {
    const popularKeys = this.analytics.popularKeys;
    const index = popularKeys.indexOf(key);

    if (index > -1) {
      // Move to front
      popularKeys.splice(index, 1);
      popularKeys.unshift(key);
    } else {
      // Add to front
      popularKeys.unshift(key);

      // Keep only top 20
      if (popularKeys.length > 20) {
        popularKeys.pop();
      }
    }
  }

  private startCleanupIntervals(): void {
    Object.entries(this.cacheConfigs).forEach(([, config]) => {
      this.intervals.register(window.setInterval(() => {
        this.cleanupExpiredEntries();
      }, config.cleanupInterval));
    });
  }

  private setupCrossTabSync(): void {
    // Listen for storage events to sync across tabs
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('pdf-cache-')) {
        this.updateCacheStats();
      }
    });
  }

  private async monitorStorageQuota(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const updateQuota = async () => {
        try {
          const estimate = await navigator.storage.estimate();
          const quota = estimate.quota || 0;
          const usage = estimate.usage || 0;

          this._storageQuota.set({
            quota,
            usage,
            available: quota - usage,
            percentage: quota > 0 ? (usage / quota) * 100 : 0
          });
        } catch (error) {
          console.warn('Failed to get storage estimate:', error);
        }
      };

      // Update immediately and then every 30 seconds
      await updateQuota();
      setInterval(updateQuota, 30000);
    }
  }

  private updateCacheStats(): void {
    // This would be implemented to aggregate stats from all storage types
    // For now, we'll update with current memory cache stats
    const memoryEntries = Array.from(this.memoryCache.values());
    const totalSize = memoryEntries.reduce((sum, entry) => sum + entry.size, 0);

    const analytics = this.getCacheAnalytics();

    this._cacheStats.set({
      totalEntries: memoryEntries.length,
      totalSize,
      hitRate: analytics.hitRate,
      missRate: analytics.missRate,
      evictionCount: analytics.evictionCount,
      storageQuotaUsed: this._storageQuota().usage,
      storageQuotaTotal: this._storageQuota().quota
    });
  }

  /**
   * Destroy service and cleanup resources
   */
  destroy(): void {
    // Clear all intervals
    this.intervals.clearAll();

    // Close IndexedDB connection
    if (this.indexedDB) {
      this.indexedDB.close();
    }

    // Clear memory cache
    this.memoryCache.clear();
  }
}
