import { Injectable, signal, computed, effect } from '@angular/core';
import { fromEvent, merge, debounceTime, throttleTime } from 'rxjs';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
  memoryUsage?: number;
  connectionType?: string;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  enableOptimizations: boolean;
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableCaching: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private readonly _metrics = signal<Partial<PerformanceMetrics>>({});
  private readonly _config = signal<PerformanceConfig>({
    enableMetrics: true,
    enableOptimizations: true,
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableCaching: true
  });

  readonly metrics = this._metrics.asReadonly();
  readonly config = this._config.asReadonly();
  
  readonly performanceScore = computed(() => {
    const m = this._metrics();
    if (!m.fcp || !m.lcp || !m.cls) return 0;
    
    // Calculate performance score based on Core Web Vitals
    const fcpScore = this.getFCPScore(m.fcp);
    const lcpScore = this.getLCPScore(m.lcp);
    const clsScore = this.getCLSScore(m.cls);
    const fidScore = m.fid ? this.getFIDScore(m.fid) : 100;
    
    return Math.round((fcpScore + lcpScore + clsScore + fidScore) / 4);
  });

  constructor() {
    this.initializePerformanceMonitoring();
    this.setupPerformanceOptimizations();
    
    // Load saved configuration
    this.loadConfiguration();
    
    // Auto-save configuration changes
    effect(() => {
      this.saveConfiguration(this._config());
    });
  }

  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined' || !this._config().enableMetrics) {
      return;
    }

    // Monitor Core Web Vitals
    this.observePerformanceEntries();
    this.measureNavigationTiming();
    this.monitorMemoryUsage();
    this.detectConnectionType();
  }

  private observePerformanceEntries(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.updateMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.updateMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.updateMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private measureNavigationTiming(): void {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      
      // Wait for page load to complete
      window.addEventListener('load', () => {
        setTimeout(() => {
          const ttfb = timing.responseStart - timing.navigationStart;
          const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
          const loadComplete = timing.loadEventEnd - timing.navigationStart;
          
          this.updateMetric('ttfb', ttfb);
          this.updateMetric('domContentLoaded', domContentLoaded);
          this.updateMetric('loadComplete', loadComplete);
          
          // First Contentful Paint (fallback)
          if (performance.getEntriesByType) {
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              this.updateMetric('fcp', fcpEntry.startTime);
            }
          }
        }, 0);
      });
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.updateMetric('memoryUsage', memory.usedJSHeapSize / 1024 / 1024); // MB
    }
  }

  private detectConnectionType(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.updateMetric('connectionType', connection.effectiveType);
    }
  }

  private setupPerformanceOptimizations(): void {
    if (!this._config().enableOptimizations) {
      return;
    }

    // Debounce scroll events
    if (typeof window !== 'undefined') {
      const scrollEvents = fromEvent(window, 'scroll');
      const resizeEvents = fromEvent(window, 'resize');
      
      merge(
        scrollEvents.pipe(throttleTime(16)), // ~60fps
        resizeEvents.pipe(debounceTime(250))
      ).subscribe(() => {
        // Trigger optimizations on scroll/resize
        this.optimizeForCurrentViewport();
      });
    }
  }

  private optimizeForCurrentViewport(): void {
    // Implement viewport-specific optimizations
    if (typeof window !== 'undefined') {
      const isSmallViewport = window.innerWidth < 768;
      
      if (isSmallViewport) {
        // Reduce animations on small screens
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    }
  }

  private updateMetric(key: keyof PerformanceMetrics, value: any): void {
    this._metrics.update(current => ({
      ...current,
      [key]: value
    }));
  }

  // Performance scoring methods
  private getFCPScore(fcp: number): number {
    if (fcp <= 1800) return 100;
    if (fcp <= 3000) return 50;
    return 0;
  }

  private getLCPScore(lcp: number): number {
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 50;
    return 0;
  }

  private getFIDScore(fid: number): number {
    if (fid <= 100) return 100;
    if (fid <= 300) return 50;
    return 0;
  }

  private getCLSScore(cls: number): number {
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 50;
    return 0;
  }

  // Configuration methods
  updateConfig(config: Partial<PerformanceConfig>): void {
    this._config.update(current => ({ ...current, ...config }));
  }

  private loadConfiguration(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('performance-config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          this._config.set({ ...this._config(), ...config });
        } catch (error) {
          console.warn('Failed to load performance configuration:', error);
        }
      }
    }
  }

  private saveConfiguration(config: PerformanceConfig): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('performance-config', JSON.stringify(config));
    }
  }

  // Public API methods
  getPerformanceReport(): PerformanceMetrics & { score: number } {
    return {
      ...this._metrics() as PerformanceMetrics,
      score: this.performanceScore()
    };
  }

  enableOptimization(optimization: keyof PerformanceConfig): void {
    this.updateConfig({ [optimization]: true });
  }

  disableOptimization(optimization: keyof PerformanceConfig): void {
    this.updateConfig({ [optimization]: false });
  }
}
