import { Injectable, signal, computed, inject } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { generateId } from '../shared/utils/id-generator';
import { IntervalManager } from '../shared/utils/interval-manager';

/**
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
  generationTime: number;
  renderingTime: number;
  processingTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  concurrentOperations: number;
  timestamp: number;
}

/**
 * Memory Usage Statistics
 */
export interface MemoryStats {
  used: number;
  total: number;
  percentage: number;
  peak: number;
  gcCount: number;
}

/**
 * Canvas Pool Configuration
 */
export interface CanvasPoolConfig {
  maxSize: number;
  initialSize: number;
  maxWidth: number;
  maxHeight: number;
  cleanupInterval: number;
}

/**
 * Performance Optimization Configuration
 */
export interface PerformanceConfig {
  enableCanvasPooling: boolean;
  enableProgressiveRendering: boolean;
  enableBackgroundProcessing: boolean;
  enableMemoryOptimization: boolean;
  chunkSize: number;
  maxConcurrentOperations: number;
  memoryThreshold: number;
  gcInterval: number;
}

/**
 * Canvas Pool Entry
 */
interface CanvasPoolEntry {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  inUse: boolean;
  lastUsed: number;
  width: number;
  height: number;
}

/**
 * Processing Queue Item
 */
interface ProcessingQueueItem {
  id: string;
  priority: number;
  operation: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

/**
 * PDF Performance Optimization Service
 *
 * Provides comprehensive performance optimization and monitoring for PDF generation,
 * including memory management, canvas pooling, progressive rendering, and metrics collection.
 */
@Injectable({
  providedIn: 'root'
})
export class PDFPerformanceService {

  // Performance configuration
  private readonly config: PerformanceConfig = {
    enableCanvasPooling: true,
    enableProgressiveRendering: true,
    enableBackgroundProcessing: true,
    enableMemoryOptimization: true,
    chunkSize: 10,
    maxConcurrentOperations: 3,
    memoryThreshold: 100 * 1024 * 1024, // 100MB
    gcInterval: 30000 // 30 seconds
  };

  // Canvas pool management
  private readonly canvasPool: Map<string, CanvasPoolEntry[]> = new Map();
  private readonly canvasPoolConfig: CanvasPoolConfig = {
    maxSize: 10,
    initialSize: 3,
    maxWidth: 2000,
    maxHeight: 2000,
    cleanupInterval: 60000 // 1 minute
  };

  // Processing queue management
  private readonly processingQueue: ProcessingQueueItem[] = [];
  private readonly activeOperations = new Set<string>();

  // Performance metrics
  private readonly _performanceMetrics = signal<PerformanceMetrics[]>([]);
  private readonly _currentMemoryUsage = signal<MemoryStats>({
    used: 0,
    total: 0,
    percentage: 0,
    peak: 0,
    gcCount: 0
  });
  private readonly _isOptimizing = signal<boolean>(false);
  private readonly _concurrentOperations = signal<number>(0);

  // Performance monitoring
  private performanceObserver: PerformanceObserver | null = null;
  private readonly intervals = new IntervalManager();
  private lastGcTime = 0;

  // Public readonly signals
  readonly performanceMetrics = this._performanceMetrics.asReadonly();
  readonly currentMemoryUsage = this._currentMemoryUsage.asReadonly();
  readonly isOptimizing = this._isOptimizing.asReadonly();
  readonly concurrentOperations = this._concurrentOperations.asReadonly();

  // Computed performance statistics
  readonly averageGenerationTime = computed(() => {
    const metrics = this._performanceMetrics();
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.generationTime, 0) / metrics.length;
  });

  readonly peakMemoryUsage = computed(() => {
    return this._currentMemoryUsage().peak;
  });

  readonly cacheEffectiveness = computed(() => {
    const metrics = this._performanceMetrics();
    if (metrics.length === 0) return 0;
    const recent = metrics.slice(-10);
    return recent.reduce((sum, m) => sum + m.cacheHitRate, 0) / recent.length;
  });

  constructor() {
    this.initializePerformanceMonitoring();
    this.initializeCanvasPool();
    this.startMemoryMonitoring();
    this.startGarbageCollection();
    this.startProcessingQueueWorker();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name.startsWith('pdf-')) {
            this.recordPerformanceEntry(entry);
          }
        });
      });

      this.performanceObserver.observe({
        entryTypes: ['measure', 'navigation', 'resource']
      });
    }
  }

  /**
   * Initialize canvas pool
   */
  private initializeCanvasPool(): void {
    // Create initial canvas pool for common sizes
    const commonSizes = [
      { width: 400, height: 566 }, // A4 preview
      { width: 800, height: 1132 }, // A4 high-res
      { width: 200, height: 283 }, // Thumbnail
    ];

    commonSizes.forEach(size => {
      const key = this.getCanvasPoolKey(size.width, size.height);
      this.createCanvasPool(key, size.width, size.height);
    });

    // Setup cleanup interval
    this.intervals.register(window.setInterval(() => {
      this.cleanupCanvasPool();
    }, this.canvasPoolConfig.cleanupInterval));
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    this.intervals.register(window.setInterval(() => {
      this.updateMemoryStats();
    }, 5000)); // Update every 5 seconds
  }

  /**
   * Start garbage collection optimization
   */
  private startGarbageCollection(): void {
    this.intervals.register(window.setInterval(() => {
      this.optimizeMemoryUsage();
    }, this.config.gcInterval));
  }

  /**
   * Start processing queue worker
   */
  private startProcessingQueueWorker(): void {
    this.intervals.register(window.setInterval(() => {
      this.processQueue();
    }, 100)); // Process queue every 100ms
  }

  /**
   * Get or create canvas from pool
   */
  getCanvas(width: number, height: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
    if (!this.config.enableCanvasPooling) {
      return this.createNewCanvas(width, height);
    }

    const key = this.getCanvasPoolKey(width, height);
    let pool = this.canvasPool.get(key);

    if (!pool) {
      pool = this.createCanvasPool(key, width, height);
    }

    // Find available canvas
    const available = pool.find(entry => !entry.inUse);
    if (available) {
      available.inUse = true;
      available.lastUsed = Date.now();

      // Clear canvas
      available.context.clearRect(0, 0, width, height);

      return {
        canvas: available.canvas,
        context: available.context
      };
    }

    // Create new canvas if pool not full
    if (pool.length < this.canvasPoolConfig.maxSize) {
      const entry = this.createCanvasEntry(width, height);
      entry.inUse = true;
      pool.push(entry);

      return {
        canvas: entry.canvas,
        context: entry.context
      };
    }

    // Pool is full, create temporary canvas
    return this.createNewCanvas(width, height);
  }

  /**
   * Return canvas to pool
   */
  returnCanvas(canvas: HTMLCanvasElement): void {
    if (!this.config.enableCanvasPooling) {
      return;
    }

    for (const [key, pool] of this.canvasPool.entries()) {
      const entry = pool.find(e => e.canvas === canvas);
      if (entry) {
        entry.inUse = false;
        entry.lastUsed = Date.now();
        break;
      }
    }
  }

  /**
   * Optimize memory usage and trigger garbage collection
   */
  async optimizeMemoryUsage(): Promise<void> {
    if (!this.config.enableMemoryOptimization) {
      return;
    }

    this._isOptimizing.set(true);

    try {
      // Clean up canvas pool
      this.cleanupCanvasPool();

      // Clear old performance metrics
      const metrics = this._performanceMetrics();
      if (metrics.length > 100) {
        this._performanceMetrics.set(metrics.slice(-50));
      }

      // Force garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
        this.lastGcTime = Date.now();

        const currentStats = this._currentMemoryUsage();
        this._currentMemoryUsage.set({
          ...currentStats,
          gcCount: currentStats.gcCount + 1
        });
      }

      // Update memory stats
      this.updateMemoryStats();

    } finally {
      this._isOptimizing.set(false);
    }
  }

  /**
   * Update memory statistics from performance.memory
   */
  private updateMemoryStats(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const currentStats = this._currentMemoryUsage();

      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const percentage = (used / total) * 100;
      const peak = Math.max(currentStats.peak, used);

      this._currentMemoryUsage.set({
        used,
        total,
        percentage,
        peak,
        gcCount: currentStats.gcCount
      });

      // Trigger optimization if memory usage is high
      if (percentage > 80 && !this._isOptimizing()) {
        this.optimizeMemoryUsage();
      }
    }
  }

  /**
   * Clean up old unused canvas entries from pool
   */
  private cleanupCanvasPool(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, pool] of this.canvasPool.entries()) {
      // Remove old unused canvases
      const activePool = pool.filter(entry => {
        if (!entry.inUse && (now - entry.lastUsed) > maxAge) {
          return false;
        }
        return true;
      });

      if (activePool.length !== pool.length) {
        this.canvasPool.set(key, activePool);
      }
    }
  }

  /**
   * Record performance entry from PerformanceObserver
   */
  private recordPerformanceEntry(entry: PerformanceEntry): void {
    // Extract metrics from performance entry
    const metrics: Partial<PerformanceMetrics> = {
      timestamp: Date.now()
    };

    if (entry.name.includes('generation')) {
      metrics.generationTime = entry.duration;
    } else if (entry.name.includes('rendering')) {
      metrics.renderingTime = entry.duration;
    } else if (entry.name.includes('processing')) {
      metrics.processingTime = entry.duration;
    }

    this.updatePerformanceMetrics(metrics);
  }

  /**
   * Record operation-specific performance metrics
   */
  private recordMetrics(operationName: string, duration: number): void {
    const metrics: Partial<PerformanceMetrics> = {
      timestamp: Date.now()
    };

    if (operationName.includes('generation')) {
      metrics.generationTime = duration;
    } else if (operationName.includes('rendering')) {
      metrics.renderingTime = duration;
    } else if (operationName.includes('processing')) {
      metrics.processingTime = duration;
    }

    this.updatePerformanceMetrics(metrics);
  }

  /**
   * Update performance metrics signal with new data
   */
  private updatePerformanceMetrics(partialMetrics: Partial<PerformanceMetrics>): void {
    const currentMetrics = this._performanceMetrics();
    const memoryStats = this._currentMemoryUsage();

    const newMetric: PerformanceMetrics = {
      generationTime: partialMetrics.generationTime || 0,
      renderingTime: partialMetrics.renderingTime || 0,
      processingTime: partialMetrics.processingTime || 0,
      memoryUsage: memoryStats.used,
      cacheHitRate: partialMetrics.cacheHitRate || 0,
      concurrentOperations: this._concurrentOperations(),
      timestamp: partialMetrics.timestamp || Date.now()
    };

    const updatedMetrics = [...currentMetrics, newMetric];

    // Keep only last 100 metrics
    if (updatedMetrics.length > 100) {
      updatedMetrics.splice(0, updatedMetrics.length - 100);
    }

    this._performanceMetrics.set(updatedMetrics);
  }

  /**
   * Process the priority-based operation queue
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue.length === 0) {
      return;
    }

    if (this.activeOperations.size >= this.config.maxConcurrentOperations) {
      return;
    }

    const item = this.processingQueue.shift();
    if (!item) {
      return;
    }

    try {
      const result = await item.operation();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }
  }

  /**
   * Canvas pool helper methods
   */
  private getCanvasPoolKey(width: number, height: number): string {
    return `${width}x${height}`;
  }

  private createCanvasPool(key: string, width: number, height: number): CanvasPoolEntry[] {
    const pool: CanvasPoolEntry[] = [];

    for (let i = 0; i < this.canvasPoolConfig.initialSize; i++) {
      pool.push(this.createCanvasEntry(width, height));
    }

    this.canvasPool.set(key, pool);
    return pool;
  }

  private createCanvasEntry(width: number, height: number): CanvasPoolEntry {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d')!;

    return {
      canvas,
      context,
      inUse: false,
      lastUsed: Date.now(),
      width,
      height
    };
  }

  private createNewCanvas(width: number, height: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d')!;

    return { canvas, context };
  }

  /**
   * Process operation with performance tracking
   */
  async processWithTracking<T>(
    operationName: string,
    operation: () => Promise<T>,
    priority: number = 1
  ): Promise<T> {
    const operationId = generateId(operationName);

    return new Promise((resolve, reject) => {
      this.processingQueue.push({
        id: operationId,
        priority,
        operation: async () => {
          const startTime = performance.now();
          performance.mark(`pdf-${operationName}-start`);

          try {
            this.activeOperations.add(operationId);
            this._concurrentOperations.set(this.activeOperations.size);

            const result = await operation();

            performance.mark(`pdf-${operationName}-end`);
            performance.measure(
              `pdf-${operationName}`,
              `pdf-${operationName}-start`,
              `pdf-${operationName}-end`
            );

            const endTime = performance.now();
            this.recordMetrics(operationName, endTime - startTime);

            return result;
          } finally {
            this.activeOperations.delete(operationId);
            this._concurrentOperations.set(this.activeOperations.size);
          }
        },
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Sort queue by priority
      this.processingQueue.sort((a, b) => b.priority - a.priority);
    });
  }

  /**
   * Progressive rendering with chunked processing
   */
  async processInChunks<T, R>(
    items: T[],
    processor: (chunk: T[]) => Promise<R[]>,
    onProgress?: (progress: number) => void
  ): Promise<R[]> {
    if (!this.config.enableProgressiveRendering) {
      return processor(items);
    }

    const results: R[] = [];
    const chunkSize = this.config.chunkSize;
    const totalChunks = Math.ceil(items.length / chunkSize);

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const chunkResults = await processor(chunk);
      results.push(...chunkResults);

      if (onProgress) {
        const progress = Math.min(((i / chunkSize) + 1) / totalChunks * 100, 100);
        onProgress(progress);
      }

      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  }

  /**
   * Get comprehensive performance statistics
   */
  getPerformanceStats(): {
    averageGenerationTime: number;
    peakMemoryUsage: number;
    cacheHitRate: number;
    concurrentOperations: number;
    totalOperations: number;
  } {
    const metrics = this._performanceMetrics();

    return {
      averageGenerationTime: this.averageGenerationTime(),
      peakMemoryUsage: this.peakMemoryUsage(),
      cacheHitRate: this.cacheEffectiveness(),
      concurrentOperations: this._concurrentOperations(),
      totalOperations: metrics.length
    };
  }

  /**
   * Clear all performance data
   */
  clearPerformanceData(): void {
    this._performanceMetrics.set([]);
    this._currentMemoryUsage.set({
      used: 0,
      total: 0,
      percentage: 0,
      peak: 0,
      gcCount: 0
    });
  }

  /**
   * Destroy service and cleanup resources
   */
  destroy(): void {
    // Clear all intervals
    this.intervals.clearAll();

    // Disconnect performance observer
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Clear canvas pool
    this.canvasPool.clear();

    // Clear processing queue
    this.processingQueue.length = 0;
    this.activeOperations.clear();
  }
}
