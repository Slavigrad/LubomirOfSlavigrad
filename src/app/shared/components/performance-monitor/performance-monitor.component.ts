import { Component, inject, computed, signal } from '@angular/core';

import { PerformanceService } from '../../services/performance.service';
import { BundleAnalyzerService } from '../../services/bundle-analyzer.service';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-performance-monitor',
  template: `
    <div class="performance-monitor glass-card p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-foreground">Performance Monitor</h3>
        <div class="flex items-center gap-2">
          <div
            class="w-3 h-3 rounded-full"
            [class]="getStatusColor()"
          ></div>
          <span class="text-sm text-muted-foreground">
            Score: {{ performanceService.performanceScore() }}
          </span>
        </div>
      </div>
    
      <!-- Core Web Vitals -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-4 text-foreground">Core Web Vitals</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- FCP -->
          <div class="metric-card">
            <div class="metric-label">FCP</div>
            <div class="metric-value" [class]="getMetricClass('fcp')">
              {{ formatTime(performanceService.metrics().fcp) }}
            </div>
            <div class="metric-description">First Contentful Paint</div>
          </div>
    
          <!-- LCP -->
          <div class="metric-card">
            <div class="metric-label">LCP</div>
            <div class="metric-value" [class]="getMetricClass('lcp')">
              {{ formatTime(performanceService.metrics().lcp) }}
            </div>
            <div class="metric-description">Largest Contentful Paint</div>
          </div>
    
          <!-- FID -->
          <div class="metric-card">
            <div class="metric-label">FID</div>
            <div class="metric-value" [class]="getMetricClass('fid')">
              {{ formatTime(performanceService.metrics().fid) }}
            </div>
            <div class="metric-description">First Input Delay</div>
          </div>
    
          <!-- CLS -->
          <div class="metric-card">
            <div class="metric-label">CLS</div>
            <div class="metric-value" [class]="getMetricClass('cls')">
              {{ formatCLS(performanceService.metrics().cls) }}
            </div>
            <div class="metric-description">Cumulative Layout Shift</div>
          </div>
        </div>
      </div>
    
      <!-- Bundle Analysis -->
      @if (bundleAnalyzer.analysis()) {
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-4 text-foreground">Bundle Analysis</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="metric-card">
              <div class="metric-label">Total Size</div>
              <div class="metric-value">
                {{ formatSize(bundleAnalyzer.analysis()?.totalSize || 0) }}
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Gzip Size</div>
              <div class="metric-value">
                {{ formatSize(bundleAnalyzer.analysis()?.totalGzipSize || 0) }}
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Bundle Score</div>
              <div class="metric-value">
                {{ bundleAnalyzer.analysis()?.performanceScore || 0 }}
              </div>
            </div>
          </div>
        </div>
      }
    
      <!-- Cache Metrics -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-4 text-foreground">Cache Performance</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="metric-card">
            <div class="metric-label">Hit Rate</div>
            <div class="metric-value text-accent">
              {{ formatPercentage(cacheService.metrics().hitRate) }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Cache Size</div>
            <div class="metric-value">
              {{ formatSize(cacheService.metrics().cacheSize) }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Requests</div>
            <div class="metric-value">
              {{ cacheService.metrics().totalRequests }}
            </div>
          </div>
        </div>
      </div>
    
      <!-- Budget Status -->
      @if (bundleAnalyzer.budgets().length > 0) {
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-4 text-foreground">Performance Budgets</h4>
          <div class="space-y-3">
            @for (budget of bundleAnalyzer.budgets(); track budget.type) {
              <div class="budget-item">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium capitalize">{{ budget.type }} Bundle</span>
                  <span
                    class="px-2 py-1 rounded text-xs font-medium"
                    [class]="getBudgetStatusClass(budget.status)"
                    >
                    {{ budget.status.toUpperCase() }}
                  </span>
                </div>
                <div class="budget-bar">
                  <div
                    class="budget-progress"
                    [class]="getBudgetProgressClass(budget.status)"
                    [style.width.%]="getBudgetPercentage(budget)"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{{ formatSize(budget.current) }}</span>
                  <span>{{ formatSize(budget.maximumError) }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    
      <!-- Recommendations -->
      @if (bundleAnalyzer.analysis()?.recommendations && bundleAnalyzer.analysis()!.recommendations.length > 0) {
        <div>
          <h4 class="text-lg font-semibold mb-4 text-foreground">Recommendations</h4>
          <div class="space-y-3">
            @for (rec of bundleAnalyzer.analysis()?.recommendations; track rec.message) {
              <div
                class="recommendation-item p-3 rounded border-l-4"
                [class]="getRecommendationClass(rec.severity)"
                >
                <div class="font-medium">{{ rec.message }}</div>
                <div class="text-sm text-muted-foreground mt-1">{{ rec.solution }}</div>
              </div>
            }
          </div>
        </div>
      }
    
      <!-- Actions -->
      <div class="flex gap-3 mt-6">
        <button
          class="btn btn-primary"
          (click)="refreshAnalysis()"
          [disabled]="bundleAnalyzer.isAnalyzing()"
          >
          {{ bundleAnalyzer.isAnalyzing() ? 'Analyzing...' : 'Refresh Analysis' }}
        </button>
        <button
          class="btn btn-secondary"
          (click)="clearCache()"
          >
          Clear Cache
        </button>
      </div>
    </div>
    `,
  styles: [`
    .performance-monitor {
      max-width: 1200px;
      margin: 0 auto;
    }

    .metric-card {
      @apply bg-card-glass p-4 rounded-lg border border-border;
    }

    .metric-label {
      @apply text-sm font-medium text-muted-foreground mb-1;
    }

    .metric-value {
      @apply text-2xl font-bold mb-1;
    }

    .metric-description {
      @apply text-xs text-muted-foreground;
    }

    .metric-good { @apply text-accent; }
    .metric-needs-improvement { @apply text-yellow-500; }
    .metric-poor { @apply text-red-500; }

    .budget-item {
      @apply bg-card-glass p-3 rounded border border-border;
    }

    .budget-bar {
      @apply w-full bg-muted rounded-full h-2;
    }

    .budget-progress {
      @apply h-full rounded-full transition-all duration-300;
    }

    .budget-ok { @apply bg-accent; }
    .budget-warning { @apply bg-yellow-500; }
    .budget-error { @apply bg-red-500; }

    .recommendation-item.severity-low {
      @apply border-l-blue-500 bg-blue-50/10;
    }

    .recommendation-item.severity-medium {
      @apply border-l-yellow-500 bg-yellow-50/10;
    }

    .recommendation-item.severity-high {
      @apply border-l-red-500 bg-red-50/10;
    }

    .btn {
      @apply px-4 py-2 rounded font-medium transition-colors;
    }

    .btn-primary {
      @apply bg-primary text-white hover:bg-primary/90;
    }

    .btn-secondary {
      @apply bg-secondary text-white hover:bg-secondary/90;
    }

    .btn:disabled {
      @apply opacity-50 cursor-not-allowed;
    }
  `]
})
export class PerformanceMonitorComponent {
  readonly performanceService = inject(PerformanceService);
  readonly bundleAnalyzer = inject(BundleAnalyzerService);
  readonly cacheService = inject(CacheService);

  readonly isVisible = signal(false);

  constructor() {
    // Auto-refresh analysis periodically
    setInterval(() => {
      if (this.isVisible()) {
        this.bundleAnalyzer.analyzeBundles();
      }
    }, 30000); // Every 30 seconds
  }

  getStatusColor(): string {
    const score = this.performanceService.performanceScore();
    if (score >= 90) return 'bg-accent';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getMetricClass(metric: string): string {
    const metrics = this.performanceService.metrics();
    const value = metrics[metric as keyof typeof metrics] as number;

    if (!value) return '';

    switch (metric) {
      case 'fcp':
        return value <= 1800 ? 'metric-good' : value <= 3000 ? 'metric-needs-improvement' : 'metric-poor';
      case 'lcp':
        return value <= 2500 ? 'metric-good' : value <= 4000 ? 'metric-needs-improvement' : 'metric-poor';
      case 'fid':
        return value <= 100 ? 'metric-good' : value <= 300 ? 'metric-needs-improvement' : 'metric-poor';
      case 'cls':
        return value <= 0.1 ? 'metric-good' : value <= 0.25 ? 'metric-needs-improvement' : 'metric-poor';
      default:
        return '';
    }
  }

  getBudgetStatusClass(status: string): string {
    switch (status) {
      case 'ok': return 'bg-accent text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  getBudgetProgressClass(status: string): string {
    return `budget-${status}`;
  }

  getBudgetPercentage(budget: any): number {
    return Math.min(100, (budget.current / budget.maximumError) * 100);
  }

  getRecommendationClass(severity: string): string {
    return `severity-${severity}`;
  }

  formatTime(ms: number | undefined): string {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
  }

  formatCLS(value: number | undefined): string {
    if (value === undefined) return 'N/A';
    return value.toFixed(3);
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  async refreshAnalysis(): Promise<void> {
    await this.bundleAnalyzer.analyzeBundles();
  }

  clearCache(): void {
    this.cacheService.clearCache();
  }

  toggleVisibility(): void {
    this.isVisible.update(current => !current);
  }
}
