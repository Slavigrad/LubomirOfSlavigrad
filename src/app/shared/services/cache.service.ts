import { Injectable, signal } from '@angular/core';

export interface CacheConfig {
  enableServiceWorker: boolean;
  enableHttpCache: boolean;
  enableBrowserCache: boolean;
  cacheVersion: string;
  maxAge: number;
  strategies: CacheStrategy[];
}

export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';
  maxAge: number;
  maxEntries?: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly _config = signal<CacheConfig>({
    enableServiceWorker: true,
    enableHttpCache: true,
    enableBrowserCache: true,
    cacheVersion: '1.0.0',
    maxAge: 86400000, // 24 hours
    strategies: [
      {
        name: 'static-assets',
        pattern: /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/,
        strategy: 'cache-first',
        maxAge: 31536000000, // 1 year
        maxEntries: 100
      },
      {
        name: 'api-data',
        pattern: /\/api\//,
        strategy: 'network-first',
        maxAge: 300000, // 5 minutes
        maxEntries: 50
      },
      {
        name: 'html-pages',
        pattern: /\.html$/,
        strategy: 'stale-while-revalidate',
        maxAge: 86400000, // 24 hours
        maxEntries: 20
      }
    ]
  });

  private readonly _metrics = signal<CacheMetrics>({
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    cacheSize: 0,
    lastUpdated: new Date()
  });

  readonly config = this._config.asReadonly();
  readonly metrics = this._metrics.asReadonly();

  constructor() {
    this.initializeCache();
    this.loadConfiguration();
  }

  /**
   * Initialize caching system
   */
  private async initializeCache(): Promise<void> {
    if (this._config().enableServiceWorker) {
      await this.registerServiceWorker();
    }

    if (this._config().enableBrowserCache) {
      this.setupBrowserCache();
    }

    this.startMetricsCollection();
  }

  /**
   * Register service worker for offline caching
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Setup browser-based caching
   */
  private setupBrowserCache(): void {
    // Implement browser storage caching strategies
    this.setupIndexedDBCache();
  }

  /**
   * Cache data in localStorage
   */
  cacheInLocalStorage(key: string, data: any, maxAge?: number): void {
    if (typeof localStorage === 'undefined') return;

    const cacheItem = {
      data,
      timestamp: Date.now(),
      maxAge: maxAge || this._config().maxAge
    };

    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache in localStorage:', error);
      this.clearOldCacheEntries();
    }
  }

  /**
   * Retrieve data from localStorage cache
   */
  getFromLocalStorage<T>(key: string): T | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.maxAge;

      if (isExpired) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      this.updateMetrics('hit');
      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to retrieve from localStorage cache:', error);
      this.updateMetrics('miss');
      return null;
    }
  }

  /**
   * Cache data in sessionStorage
   */
  cacheInSessionStorage(key: string, data: any): void {
    if (typeof sessionStorage === 'undefined') return;

    try {
      sessionStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache in sessionStorage:', error);
    }
  }

  /**
   * Retrieve data from sessionStorage cache
   */
  getFromSessionStorage<T>(key: string): T | null {
    if (typeof sessionStorage === 'undefined') return null;

    try {
      const cached = sessionStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      this.updateMetrics('hit');
      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to retrieve from sessionStorage cache:', error);
      this.updateMetrics('miss');
      return null;
    }
  }

  /**
   * Setup IndexedDB for large data caching
   */
  private setupIndexedDBCache(): void {
    if (!('indexedDB' in window)) return;

    // Initialize IndexedDB for complex data caching
    const request = indexedDB.open('AppCache', 1);

    request.onerror = () => {
      console.warn('IndexedDB initialization failed');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB initialized for caching');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('cache')) {
        const store = db.createObjectStore('cache', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  }

  /**
   * Clear expired cache entries
   */
  private clearOldCacheEntries(): void {
    if (typeof localStorage === 'undefined') return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheItem = JSON.parse(cached);
            const isExpired = Date.now() - cacheItem.timestamp > cacheItem.maxAge;

            if (isExpired) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Update cache metrics
   */
  private updateMetrics(type: 'hit' | 'miss'): void {
    this._metrics.update(current => {
      const totalRequests = current.totalRequests + 1;
      const hits = type === 'hit' ? 1 : 0;
      const misses = type === 'miss' ? 1 : 0;

      return {
        ...current,
        hitRate: ((current.hitRate * current.totalRequests) + hits) / totalRequests,
        missRate: ((current.missRate * current.totalRequests) + misses) / totalRequests,
        totalRequests,
        lastUpdated: new Date()
      };
    });
  }

  /**
   * Start collecting cache metrics
   */
  private startMetricsCollection(): void {
    // Monitor cache size periodically
    setInterval(() => {
      this.updateCacheSize();
    }, 60000); // Every minute
  }

  /**
   * Update cache size metrics
   */
  private updateCacheSize(): void {
    if (typeof localStorage === 'undefined') return;

    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }

    this._metrics.update(current => ({
      ...current,
      cacheSize: totalSize
    }));
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    // Clear localStorage cache
    if (typeof localStorage !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    // Clear sessionStorage cache
    if (typeof sessionStorage !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }

    // Reset metrics
    this._metrics.set({
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      cacheSize: 0,
      lastUpdated: new Date()
    });
  }

  /**
   * Update cache configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this._config.update(current => ({ ...current, ...config }));
    this.saveConfiguration();
  }

  /**
   * Load configuration from storage
   */
  private loadConfiguration(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('cache-config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          this._config.set({ ...this._config(), ...config });
        } catch (error) {
          console.warn('Failed to load cache configuration:', error);
        }
      }
    }
  }

  /**
   * Save configuration to storage
   */
  private saveConfiguration(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cache-config', JSON.stringify(this._config()));
    }
  }
}
