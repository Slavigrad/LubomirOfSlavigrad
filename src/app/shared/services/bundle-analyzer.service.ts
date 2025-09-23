import { Injectable, signal, computed } from '@angular/core';

export interface BundleInfo {
  name: string;
  size: number;
  gzipSize: number;
  modules: ModuleInfo[];
  loadTime: number;
  isLazy: boolean;
}

export interface ModuleInfo {
  name: string;
  size: number;
  dependencies: string[];
  isTreeShakeable: boolean;
  unusedExports?: string[];
}

export interface BundleAnalysis {
  totalSize: number;
  totalGzipSize: number;
  bundles: BundleInfo[];
  recommendations: BundleRecommendation[];
  performanceScore: number;
}

export interface BundleRecommendation {
  type: 'size' | 'lazy-loading' | 'tree-shaking' | 'code-splitting';
  severity: 'low' | 'medium' | 'high';
  message: string;
  impact: string;
  solution: string;
}

export interface BundleBudget {
  type: 'initial' | 'lazy' | 'total';
  maximumWarning: number;
  maximumError: number;
  current: number;
  status: 'ok' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class BundleAnalyzerService {
  private readonly _analysis = signal<BundleAnalysis | null>(null);
  private readonly _budgets = signal<BundleBudget[]>([]);
  private readonly _isAnalyzing = signal(false);

  readonly analysis = this._analysis.asReadonly();
  readonly budgets = this._budgets.asReadonly();
  readonly isAnalyzing = this._isAnalyzing.asReadonly();

  readonly budgetStatus = computed(() => {
    const budgets = this._budgets();
    const hasErrors = budgets.some(b => b.status === 'error');
    const hasWarnings = budgets.some(b => b.status === 'warning');

    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'ok';
  });

  constructor() {
    this.initializeBudgets();
    this.startPerformanceMonitoring();
  }

  /**
   * Analyze current bundle composition
   */
  async analyzeBundles(): Promise<BundleAnalysis> {
    this._isAnalyzing.set(true);

    try {
      const analysis = await this.performBundleAnalysis();
      this._analysis.set(analysis);
      this.updateBudgetStatus(analysis);
      return analysis;
    } finally {
      this._isAnalyzing.set(false);
    }
  }

  /**
   * Get bundle size recommendations
   */
  getBundleRecommendations(analysis: BundleAnalysis): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = [];

    // Check for large bundles
    analysis.bundles.forEach(bundle => {
      if (bundle.size > 500 * 1024) { // 500KB
        recommendations.push({
          type: 'size',
          severity: 'high',
          message: `Bundle "${bundle.name}" is too large (${this.formatSize(bundle.size)})`,
          impact: 'Slow initial page load',
          solution: 'Consider code splitting or lazy loading'
        });
      }
    });

    // Check for missing lazy loading
    const eagerBundles = analysis.bundles.filter(b => !b.isLazy && b.name !== 'main');
    if (eagerBundles.length > 2) {
      recommendations.push({
        type: 'lazy-loading',
        severity: 'medium',
        message: `${eagerBundles.length} bundles are loaded eagerly`,
        impact: 'Increased initial bundle size',
        solution: 'Implement lazy loading for non-critical routes'
      });
    }

    // Check total bundle size
    if (analysis.totalSize > 1024 * 1024) { // 1MB
      recommendations.push({
        type: 'size',
        severity: 'high',
        message: `Total bundle size is ${this.formatSize(analysis.totalSize)}`,
        impact: 'Poor performance on slow connections',
        solution: 'Optimize dependencies and implement code splitting'
      });
    }

    return recommendations;
  }

  /**
   * Monitor bundle performance in real-time
   */
  private startPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          this.trackResourceLoad(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Track individual resource loading
   */
  private trackResourceLoad(entry: PerformanceEntry): void {
    const resourceEntry = entry as PerformanceResourceTiming;

    // Extract bundle information from resource timing
    const bundleInfo = {
      name: this.extractBundleName(entry.name),
      loadTime: resourceEntry.responseEnd - resourceEntry.startTime,
      size: resourceEntry.transferSize || 0,
      gzipSize: resourceEntry.encodedBodySize || 0
    };

    // Update analysis if available
    const currentAnalysis = this._analysis();
    if (currentAnalysis) {
      const bundleIndex = currentAnalysis.bundles.findIndex(b => b.name === bundleInfo.name);
      if (bundleIndex >= 0) {
        currentAnalysis.bundles[bundleIndex].loadTime = bundleInfo.loadTime;
        this._analysis.set({ ...currentAnalysis });
      }
    }
  }

  /**
   * Perform detailed bundle analysis
   */
  private async performBundleAnalysis(): Promise<BundleAnalysis> {
    // In a real implementation, this would analyze the actual bundle files
    // For now, we'll simulate the analysis with performance API data

    const bundles = await this.extractBundleInfo();
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    const totalGzipSize = bundles.reduce((sum, bundle) => sum + bundle.gzipSize, 0);

    const analysis: BundleAnalysis = {
      totalSize,
      totalGzipSize,
      bundles,
      recommendations: [],
      performanceScore: this.calculatePerformanceScore(bundles)
    };

    analysis.recommendations = this.getBundleRecommendations(analysis);

    return analysis;
  }

  /**
   * Extract bundle information from performance entries
   */
  private async extractBundleInfo(): Promise<BundleInfo[]> {
    if (typeof window === 'undefined') return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const bundles: BundleInfo[] = [];

    resources.forEach(resource => {
      if (resource.name.includes('.js')) {
        const bundleName = this.extractBundleName(resource.name);

        if (!bundles.find(b => b.name === bundleName)) {
          bundles.push({
            name: bundleName,
            size: resource.transferSize || 0,
            gzipSize: resource.encodedBodySize || 0,
            modules: [], // Would be populated by actual bundle analysis
            loadTime: resource.responseEnd - resource.startTime,
            isLazy: this.isLazyBundle(bundleName)
          });
        }
      }
    });

    return bundles;
  }

  /**
   * Extract bundle name from resource URL
   */
  private extractBundleName(url: string): string {
    const filename = url.split('/').pop() || '';
    const nameMatch = filename.match(/^([^-]+)/);
    return nameMatch ? nameMatch[1] : filename;
  }

  /**
   * Determine if bundle is lazy-loaded
   */
  private isLazyBundle(bundleName: string): boolean {
    const lazyBundlePatterns = ['chunk-', 'lazy-', 'component-'];
    return lazyBundlePatterns.some(pattern => bundleName.includes(pattern));
  }

  /**
   * Calculate performance score based on bundle metrics
   */
  private calculatePerformanceScore(bundles: BundleInfo[]): number {
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    const avgLoadTime = bundles.reduce((sum, bundle) => sum + bundle.loadTime, 0) / bundles.length;

    // Score based on size (0-50 points)
    const sizeScore = Math.max(0, 50 - (totalSize / (1024 * 1024)) * 25); // Penalty for each MB

    // Score based on load time (0-50 points)
    const timeScore = Math.max(0, 50 - (avgLoadTime / 1000) * 10); // Penalty for each second

    return Math.round(sizeScore + timeScore);
  }

  /**
   * Initialize performance budgets
   */
  private initializeBudgets(): void {
    const budgets: BundleBudget[] = [
      {
        type: 'initial',
        maximumWarning: 500 * 1024, // 500KB
        maximumError: 1024 * 1024,  // 1MB
        current: 0,
        status: 'ok'
      },
      {
        type: 'lazy',
        maximumWarning: 200 * 1024, // 200KB
        maximumError: 500 * 1024,   // 500KB
        current: 0,
        status: 'ok'
      },
      {
        type: 'total',
        maximumWarning: 2 * 1024 * 1024, // 2MB
        maximumError: 5 * 1024 * 1024,   // 5MB
        current: 0,
        status: 'ok'
      }
    ];

    this._budgets.set(budgets);
  }

  /**
   * Update budget status based on analysis
   */
  private updateBudgetStatus(analysis: BundleAnalysis): void {
    const budgets = this._budgets().map(budget => {
      let current = 0;

      switch (budget.type) {
        case 'initial':
          current = analysis.bundles
            .filter(b => !b.isLazy)
            .reduce((sum, b) => sum + b.size, 0);
          break;
        case 'lazy':
          const lazyBundles = analysis.bundles.filter(b => b.isLazy);
          current = lazyBundles.length > 0
            ? Math.max(...lazyBundles.map(b => b.size))
            : 0;
          break;
        case 'total':
          current = analysis.totalSize;
          break;
      }

      const status: 'ok' | 'warning' | 'error' = current > budget.maximumError ? 'error' :
                    current > budget.maximumWarning ? 'warning' : 'ok';

      return { ...budget, current, status };
    });

    this._budgets.set(budgets);
  }

  /**
   * Format file size for display
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
