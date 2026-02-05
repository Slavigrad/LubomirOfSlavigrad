import { Injectable, signal, computed, inject } from '@angular/core';
import { PDFPerformanceService, PerformanceMetrics } from './pdf-performance.service';
import { PDFCacheManagerService, CacheAnalytics } from './pdf-cache-manager.service';
import { IntervalManager } from '../shared/utils/interval-manager';
import { generateId } from '../shared/utils/id-generator';

/**
 * Analytics Event Types
 */
export type AnalyticsEventType =
  | 'pdf_generation_started'
  | 'pdf_generation_completed'
  | 'pdf_generation_failed'
  | 'template_selected'
  | 'template_previewed'
  | 'pdf_downloaded'
  | 'cache_hit'
  | 'cache_miss'
  | 'performance_regression'
  | 'quality_threshold_breach'
  | 'quality_assessment_completed';

/**
 * Analytics Event Interface
 */
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: number;
  userId?: string;
  sessionId: string;
  templateId?: string;
  metadata: Record<string, any>;
  duration?: number;
  success: boolean;
  errorMessage?: string;
}

/**
 * Performance Analytics
 */
export interface PerformanceAnalytics {
  averageGenerationTime: number;
  medianGenerationTime: number;
  p95GenerationTime: number;
  p99GenerationTime: number;
  successRate: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsageAverage: number;
  memoryUsagePeak: number;
  concurrentOperationsAverage: number;
  regressionCount: number;
  lastRegressionTime?: number;
}

/**
 * User Engagement Analytics
 */
export interface UserEngagementAnalytics {
  totalGenerations: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  templatePreferences: Record<string, number>;
  downloadRate: number;
  retryRate: number;
  abandonmentRate: number;
  peakUsageHours: number[];
  userRetentionRate: number;
  featureUsageStats: Record<string, number>;
}

/**
 * Quality Analytics
 */
export interface QualityAnalytics {
  overallQualityScore: number;
  contentQualityScore: number;
  visualQualityScore: number;
  performanceQualityScore: number;
  accessibilityScore: number;
  templateQualityScores: Record<string, number>;
  qualityTrends: QualityTrend[];
  qualityAlerts: QualityAlert[];
}

/**
 * Quality Trend
 */
export interface QualityTrend {
  timestamp: number;
  metric: string;
  value: number;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
}

/**
 * Quality Alert
 */
export interface QualityAlert {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  currentValue: number;
  threshold: number;
  message: string;
  resolved: boolean;
}

/**
 * Analytics Dashboard Data
 */
export interface AnalyticsDashboardData {
  performance: PerformanceAnalytics;
  userEngagement: UserEngagementAnalytics;
  quality: QualityAnalytics;
  systemHealth: SystemHealthMetrics;
  realTimeMetrics: RealTimeMetrics;
}

/**
 * System Health Metrics
 */
export interface SystemHealthMetrics {
  uptime: number;
  errorRate: number;
  responseTime: number;
  memoryUsage: number;
  cacheEfficiency: number;
  storageUsage: number;
  healthScore: number;
  alerts: SystemAlert[];
}

/**
 * System Alert
 */
export interface SystemAlert {
  id: string;
  timestamp: number;
  type: 'performance' | 'quality' | 'system' | 'user';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  resolved: boolean;
  resolvedAt?: number;
}

/**
 * Real-Time Metrics
 */
export interface RealTimeMetrics {
  activeUsers: number;
  currentGenerations: number;
  queueLength: number;
  cacheHitRate: number;
  averageResponseTime: number;
  errorCount: number;
  lastUpdated: number;
}

/**
 * Analytics Configuration
 */
export interface AnalyticsConfig {
  enableRealTimeTracking: boolean;
  enableUserTracking: boolean;
  enablePerformanceTracking: boolean;
  enableQualityTracking: boolean;
  dataRetentionDays: number;
  alertThresholds: AlertThresholds;
  reportingInterval: number;
  batchSize: number;
}

/**
 * Alert Thresholds
 */
export interface AlertThresholds {
  generationTimeThreshold: number;
  errorRateThreshold: number;
  memoryUsageThreshold: number;
  cacheHitRateThreshold: number;
  qualityScoreThreshold: number;
  regressionDetectionThreshold: number;
}

/**
 * PDF Analytics Service
 *
 * Provides comprehensive analytics and monitoring for PDF generation system,
 * including performance metrics, quality assessment, and user engagement tracking.
 */
@Injectable({
  providedIn: 'root'
})
export class PDFAnalyticsService {

  private readonly performanceService = inject(PDFPerformanceService);
  private readonly cacheService = inject(PDFCacheManagerService);

  // Interval management
  private readonly intervals = new IntervalManager();

  // Analytics configuration
  private readonly config: AnalyticsConfig = {
    enableRealTimeTracking: true,
    enableUserTracking: true,
    enablePerformanceTracking: true,
    enableQualityTracking: true,
    dataRetentionDays: 30,
    alertThresholds: {
      generationTimeThreshold: 5000, // 5 seconds
      errorRateThreshold: 0.05, // 5%
      memoryUsageThreshold: 100 * 1024 * 1024, // 100MB
      cacheHitRateThreshold: 0.8, // 80%
      qualityScoreThreshold: 85, // 85%
      regressionDetectionThreshold: 0.2 // 20% degradation
    },
    reportingInterval: 60000, // 1 minute
    batchSize: 100
  };

  // Event storage and processing
  private readonly events: AnalyticsEvent[] = [];
  private readonly alerts: SystemAlert[] = [];
  private sessionId = generateId('session');
  private userId?: string;

  // Reactive state
  private readonly _performanceAnalytics = signal<PerformanceAnalytics>({
    averageGenerationTime: 0,
    medianGenerationTime: 0,
    p95GenerationTime: 0,
    p99GenerationTime: 0,
    successRate: 100,
    errorRate: 0,
    cacheHitRate: 0,
    memoryUsageAverage: 0,
    memoryUsagePeak: 0,
    concurrentOperationsAverage: 0,
    regressionCount: 0
  });

  private readonly _userEngagementAnalytics = signal<UserEngagementAnalytics>({
    totalGenerations: 0,
    uniqueUsers: 0,
    averageSessionDuration: 0,
    templatePreferences: {},
    downloadRate: 0,
    retryRate: 0,
    abandonmentRate: 0,
    peakUsageHours: [],
    userRetentionRate: 0,
    featureUsageStats: {}
  });

  private readonly _qualityAnalytics = signal<QualityAnalytics>({
    overallQualityScore: 100,
    contentQualityScore: 100,
    visualQualityScore: 100,
    performanceQualityScore: 100,
    accessibilityScore: 100,
    templateQualityScores: {},
    qualityTrends: [],
    qualityAlerts: []
  });

  private readonly _systemHealth = signal<SystemHealthMetrics>({
    uptime: 0,
    errorRate: 0,
    responseTime: 0,
    memoryUsage: 0,
    cacheEfficiency: 0,
    storageUsage: 0,
    healthScore: 100,
    alerts: []
  });

  private readonly _realTimeMetrics = signal<RealTimeMetrics>({
    activeUsers: 0,
    currentGenerations: 0,
    queueLength: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    errorCount: 0,
    lastUpdated: Date.now()
  });

  // Public readonly signals
  readonly performanceAnalytics = this._performanceAnalytics.asReadonly();
  readonly userEngagementAnalytics = this._userEngagementAnalytics.asReadonly();
  readonly qualityAnalytics = this._qualityAnalytics.asReadonly();
  readonly systemHealth = this._systemHealth.asReadonly();
  readonly realTimeMetrics = this._realTimeMetrics.asReadonly();

  // Computed analytics
  readonly dashboardData = computed((): AnalyticsDashboardData => ({
    performance: this._performanceAnalytics(),
    userEngagement: this._userEngagementAnalytics(),
    quality: this._qualityAnalytics(),
    systemHealth: this._systemHealth(),
    realTimeMetrics: this._realTimeMetrics()
  }));

  /**
   * Track analytics event
   */
  trackEvent(
    type: AnalyticsEventType,
    metadata: Record<string, any> = {},
    templateId?: string,
    duration?: number,
    success: boolean = true,
    errorMessage?: string
  ): void {
    const event: AnalyticsEvent = {
      id: generateId('event'),
      type,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      templateId,
      metadata,
      duration,
      success,
      errorMessage
    };

    this.events.push(event);

    // Process event immediately for real-time metrics
    this.processEventRealTime(event);

    // Check for alerts
    this.checkEventAlerts(event);

    // Cleanup old events
    this.cleanupOldEvents();
  }

  /**
   * Track PDF generation start
   */
  trackGenerationStart(templateId: string, metadata: Record<string, any> = {}): string {
    const eventId = generateId('event');
    this.trackEvent('pdf_generation_started', {
      ...metadata,
      eventId
    }, templateId);

    // Update real-time metrics
    const current = this._realTimeMetrics();
    this._realTimeMetrics.set({
      ...current,
      currentGenerations: current.currentGenerations + 1,
      lastUpdated: Date.now()
    });

    return eventId;
  }

  /**
   * Track PDF generation completion
   */
  trackGenerationComplete(
    eventId: string,
    templateId: string,
    duration: number,
    qualityScore: number,
    metadata: Record<string, any> = {}
  ): void {
    this.trackEvent('pdf_generation_completed', {
      ...metadata,
      eventId,
      qualityScore
    }, templateId, duration, true);

    // Update real-time metrics
    const current = this._realTimeMetrics();
    this._realTimeMetrics.set({
      ...current,
      currentGenerations: Math.max(0, current.currentGenerations - 1),
      averageResponseTime: this.calculateMovingAverage(current.averageResponseTime, duration, 10),
      lastUpdated: Date.now()
    });
  }

  /**
   * Track PDF generation failure
   */
  trackGenerationFailure(
    eventId: string,
    templateId: string,
    duration: number,
    errorMessage: string,
    metadata: Record<string, any> = {}
  ): void {
    this.trackEvent('pdf_generation_failed', {
      ...metadata,
      eventId
    }, templateId, duration, false, errorMessage);

    // Update real-time metrics
    const current = this._realTimeMetrics();
    this._realTimeMetrics.set({
      ...current,
      currentGenerations: Math.max(0, current.currentGenerations - 1),
      errorCount: current.errorCount + 1,
      lastUpdated: Date.now()
    });

    // Create alert for failures
    this.createAlert('performance', 'error', `PDF generation failed: ${errorMessage}`);
  }

  /**
   * Track template selection
   */
  trackTemplateSelection(templateId: string, metadata: Record<string, any> = {}): void {
    this.trackEvent('template_selected', metadata, templateId);
  }

  /**
   * Track template preview
   */
  trackTemplatePreview(templateId: string, metadata: Record<string, any> = {}): void {
    this.trackEvent('template_previewed', metadata, templateId);
  }

  /**
   * Track PDF download
   */
  trackPDFDownload(templateId: string, metadata: Record<string, any> = {}): void {
    this.trackEvent('pdf_downloaded', metadata, templateId);
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(timeRange?: { start: number; end: number }): PerformanceAnalytics {
    const events = this.getEventsInRange(timeRange);
    const generationEvents = events.filter(e =>
      e.type === 'pdf_generation_completed' || e.type === 'pdf_generation_failed'
    );

    if (generationEvents.length === 0) {
      return this._performanceAnalytics();
    }

    const durations = generationEvents
      .filter(e => e.duration !== undefined)
      .map(e => e.duration!)
      .sort((a, b) => a - b);

    const successfulEvents = generationEvents.filter(e => e.success);
    const failedEvents = generationEvents.filter(e => !e.success);

    const cacheEvents = events.filter(e => e.type === 'cache_hit' || e.type === 'cache_miss');
    const cacheHits = cacheEvents.filter(e => e.type === 'cache_hit').length;
    const cacheTotal = cacheEvents.length;

    return {
      averageGenerationTime: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      medianGenerationTime: durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0,
      p95GenerationTime: durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0,
      p99GenerationTime: durations.length > 0 ? durations[Math.floor(durations.length * 0.99)] : 0,
      successRate: generationEvents.length > 0 ? (successfulEvents.length / generationEvents.length) * 100 : 100,
      errorRate: generationEvents.length > 0 ? (failedEvents.length / generationEvents.length) * 100 : 0,
      cacheHitRate: cacheTotal > 0 ? (cacheHits / cacheTotal) * 100 : 0,
      memoryUsageAverage: this.calculateAverageMemoryUsage(events),
      memoryUsagePeak: this.calculatePeakMemoryUsage(events),
      concurrentOperationsAverage: this.calculateAverageConcurrentOperations(events),
      regressionCount: this.countRegressions(timeRange),
      lastRegressionTime: this.getLastRegressionTime()
    };
  }

  /**
   * Get user engagement analytics
   */
  getUserEngagementAnalytics(timeRange?: { start: number; end: number }): UserEngagementAnalytics {
    const events = this.getEventsInRange(timeRange);
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
    const sessions = new Set(events.map(e => e.sessionId)).size;

    const generationEvents = events.filter(e => e.type === 'pdf_generation_completed');
    const downloadEvents = events.filter(e => e.type === 'pdf_downloaded');
    const templateSelections = events.filter(e => e.type === 'template_selected');

    // Calculate template preferences
    const templatePreferences: Record<string, number> = {};
    templateSelections.forEach(event => {
      if (event.templateId) {
        templatePreferences[event.templateId] = (templatePreferences[event.templateId] || 0) + 1;
      }
    });

    // Calculate peak usage hours
    const hourlyUsage: Record<number, number> = {};
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
    });

    const peakUsageHours = Object.entries(hourlyUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return {
      totalGenerations: generationEvents.length,
      uniqueUsers,
      averageSessionDuration: this.calculateAverageSessionDuration(events),
      templatePreferences,
      downloadRate: generationEvents.length > 0 ? (downloadEvents.length / generationEvents.length) * 100 : 0,
      retryRate: this.calculateRetryRate(events),
      abandonmentRate: this.calculateAbandonmentRate(events),
      peakUsageHours,
      userRetentionRate: this.calculateUserRetentionRate(events),
      featureUsageStats: this.calculateFeatureUsageStats(events)
    };
  }

  /**
   * Generate analytics report
   */
  generateReport(timeRange?: { start: number; end: number }): {
    performance: PerformanceAnalytics;
    userEngagement: UserEngagementAnalytics;
    quality: QualityAnalytics;
    systemHealth: SystemHealthMetrics;
    summary: string;
    recommendations: string[];
  } {
    const performance = this.getPerformanceAnalytics(timeRange);
    const userEngagement = this.getUserEngagementAnalytics(timeRange);
    const quality = this._qualityAnalytics();
    const systemHealth = this._systemHealth();

    const summary = this.generateReportSummary(performance, userEngagement, quality, systemHealth);
    const recommendations = this.generateRecommendations(performance, userEngagement, quality, systemHealth);

    return {
      performance,
      userEngagement,
      quality,
      systemHealth,
      summary,
      recommendations
    };
  }
  /**
   * Private helper methods
   */

  private initializeUserTracking(): void {
    // Initialize user ID from localStorage or generate new one
    this.userId = localStorage.getItem('pdf-analytics-user-id') || generateId('user');
    localStorage.setItem('pdf-analytics-user-id', this.userId);
  }

  private setupPerformanceIntegration(): void {
    // Subscribe to performance service metrics
    // This would integrate with the performance service from Task 4.7
  }

  private initializeQualityTracking(): void {
    // Initialize quality tracking baseline
    this._qualityAnalytics.set({
      overallQualityScore: 100,
      contentQualityScore: 100,
      visualQualityScore: 100,
      performanceQualityScore: 100,
      accessibilityScore: 100,
      templateQualityScores: {},
      qualityTrends: [],
      qualityAlerts: []
    });
  }

  private processEventRealTime(event: AnalyticsEvent): void {
    // Update real-time metrics based on event type
    const current = this._realTimeMetrics();

    switch (event.type) {
      case 'cache_hit':
        this._realTimeMetrics.set({
          ...current,
          cacheHitRate: this.calculateMovingAverage(current.cacheHitRate, 100, 20),
          lastUpdated: Date.now()
        });
        break;
      case 'cache_miss':
        this._realTimeMetrics.set({
          ...current,
          cacheHitRate: this.calculateMovingAverage(current.cacheHitRate, 0, 20),
          lastUpdated: Date.now()
        });
        break;
    }
  }

  private checkEventAlerts(event: AnalyticsEvent): void {
    // Check for alert conditions
    if (event.type === 'pdf_generation_failed') {
      this.createAlert('performance', 'error', `PDF generation failed: ${event.errorMessage}`);
    }

    if (event.type === 'pdf_generation_completed' && event.duration) {
      if (event.duration > this.config.alertThresholds.generationTimeThreshold) {
        this.createAlert('performance', 'warning',
          `Slow PDF generation detected: ${event.duration}ms (threshold: ${this.config.alertThresholds.generationTimeThreshold}ms)`);
      }
    }
  }

  private createAlert(
    type: 'performance' | 'quality' | 'system' | 'user',
    severity: 'info' | 'warning' | 'error' | 'critical',
    message: string
  ): void {
    const alert: SystemAlert = {
      id: generateId('alert'),
      timestamp: Date.now(),
      type,
      severity,
      message,
      resolved: false
    };

    this.alerts.push(alert);

    // Update system health
    this.updateSystemHealth();
  }

  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
    const initialLength = this.events.length;

    // Remove events older than retention period
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i].timestamp < cutoffTime) {
        this.events.splice(i, 1);
      }
    }

    // Also cleanup old alerts
    for (let i = this.alerts.length - 1; i >= 0; i--) {
      if (this.alerts[i].timestamp < cutoffTime) {
        this.alerts.splice(i, 1);
      }
    }
  }

  private getEventsInRange(timeRange?: { start: number; end: number }): AnalyticsEvent[] {
    if (!timeRange) {
      return this.events;
    }

    return this.events.filter(event =>
      event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );
  }

  private calculateMovingAverage(currentAverage: number, newValue: number, windowSize: number): number {
    return ((currentAverage * (windowSize - 1)) + newValue) / windowSize;
  }

  private calculateAverageMemoryUsage(events: AnalyticsEvent[]): number {
    const memoryEvents = events.filter(e => e.metadata?.['memoryUsage']);
    if (memoryEvents.length === 0) return 0;

    const total = memoryEvents.reduce((sum, e) => sum + (e.metadata['memoryUsage'] || 0), 0);
    return total / memoryEvents.length;
  }

  private calculatePeakMemoryUsage(events: AnalyticsEvent[]): number {
    const memoryEvents = events.filter(e => e.metadata?.['memoryUsage']);
    if (memoryEvents.length === 0) return 0;

    return Math.max(...memoryEvents.map(e => e.metadata['memoryUsage'] || 0));
  }

  private calculateAverageConcurrentOperations(events: AnalyticsEvent[]): number {
    const concurrentEvents = events.filter(e => e.metadata?.['concurrentOperations']);
    if (concurrentEvents.length === 0) return 0;

    const total = concurrentEvents.reduce((sum, e) => sum + (e.metadata['concurrentOperations'] || 0), 0);
    return total / concurrentEvents.length;
  }

  private countRegressions(timeRange?: { start: number; end: number }): number {
    const events = this.getEventsInRange(timeRange);
    return events.filter(e => e.type === 'performance_regression').length;
  }

  private getLastRegressionTime(): number | undefined {
    const regressionEvents = this.events.filter(e => e.type === 'performance_regression');
    if (regressionEvents.length === 0) return undefined;

    return Math.max(...regressionEvents.map(e => e.timestamp));
  }

  private calculateAverageSessionDuration(events: AnalyticsEvent[]): number {
    const sessions = new Map<string, { start: number; end: number }>();

    events.forEach(event => {
      const session = sessions.get(event.sessionId);
      if (!session) {
        sessions.set(event.sessionId, { start: event.timestamp, end: event.timestamp });
      } else {
        session.end = Math.max(session.end, event.timestamp);
      }
    });

    const durations = Array.from(sessions.values()).map(s => s.end - s.start);
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  private calculateRetryRate(events: AnalyticsEvent[]): number {
    const generationStarts = events.filter(e => e.type === 'pdf_generation_started');
    const generationCompletes = events.filter(e => e.type === 'pdf_generation_completed');

    if (generationStarts.length === 0) return 0;

    const retries = generationStarts.length - generationCompletes.length;
    return (retries / generationStarts.length) * 100;
  }

  private calculateAbandonmentRate(events: AnalyticsEvent[]): number {
    const templateSelections = events.filter(e => e.type === 'template_selected');
    const generationStarts = events.filter(e => e.type === 'pdf_generation_started');

    if (templateSelections.length === 0) return 0;

    const abandonments = templateSelections.length - generationStarts.length;
    return Math.max(0, (abandonments / templateSelections.length) * 100);
  }

  private calculateUserRetentionRate(events: AnalyticsEvent[]): number {
    // Calculate 7-day retention rate
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentUsers = new Set(
      events
        .filter(e => e.timestamp >= sevenDaysAgo && e.userId)
        .map(e => e.userId)
    );

    const olderUsers = new Set(
      events
        .filter(e => e.timestamp < sevenDaysAgo && e.userId)
        .map(e => e.userId)
    );

    if (olderUsers.size === 0) return 100;

    const retainedUsers = Array.from(recentUsers).filter(user => olderUsers.has(user));
    return (retainedUsers.length / olderUsers.size) * 100;
  }

  private calculateFeatureUsageStats(events: AnalyticsEvent[]): Record<string, number> {
    const featureUsage: Record<string, number> = {};

    events.forEach(event => {
      const feature = this.getFeatureFromEvent(event);
      if (feature) {
        featureUsage[feature] = (featureUsage[feature] || 0) + 1;
      }
    });

    return featureUsage;
  }

  private getFeatureFromEvent(event: AnalyticsEvent): string | null {
    switch (event.type) {
      case 'template_selected': return 'template_selection';
      case 'template_previewed': return 'template_preview';
      case 'pdf_generation_started': return 'pdf_generation';
      case 'pdf_downloaded': return 'pdf_download';
      default: return null;
    }
  }

  private aggregateAnalytics(): void {
    // Update performance analytics
    this._performanceAnalytics.set(this.getPerformanceAnalytics());

    // Update user engagement analytics
    this._userEngagementAnalytics.set(this.getUserEngagementAnalytics());

    // Update system health
    this.updateSystemHealth();
  }

  private performHealthCheck(): void {
    const performance = this.performanceService.getPerformanceStats();
    const cacheAnalytics = this.cacheService.getCacheAnalytics();

    // Calculate health score
    let healthScore = 100;

    // Deduct points for poor performance
    if (performance.averageGenerationTime > this.config.alertThresholds.generationTimeThreshold) {
      healthScore -= 20;
    }

    // Deduct points for high error rate
    const currentAnalytics = this._performanceAnalytics();
    if (currentAnalytics.errorRate > this.config.alertThresholds.errorRateThreshold * 100) {
      healthScore -= 30;
    }

    // Deduct points for low cache hit rate
    if (cacheAnalytics.hitRate < this.config.alertThresholds.cacheHitRateThreshold * 100) {
      healthScore -= 15;
    }

    // Deduct points for high memory usage
    if (performance.peakMemoryUsage > this.config.alertThresholds.memoryUsageThreshold) {
      healthScore -= 25;
    }

    this._systemHealth.set({
      uptime: Date.now() - this.getSystemStartTime(),
      errorRate: currentAnalytics.errorRate,
      responseTime: performance.averageGenerationTime,
      memoryUsage: performance.peakMemoryUsage,
      cacheEfficiency: cacheAnalytics.hitRate,
      storageUsage: this.calculateStorageUsage(),
      healthScore: Math.max(0, healthScore),
      alerts: this.alerts.filter(a => !a.resolved)
    });
  }

  private detectPerformanceRegressions(): void {
    const recentEvents = this.getEventsInRange({
      start: Date.now() - (5 * 60 * 1000), // Last 5 minutes
      end: Date.now()
    });

    const olderEvents = this.getEventsInRange({
      start: Date.now() - (30 * 60 * 1000), // 30 minutes ago
      end: Date.now() - (5 * 60 * 1000)     // 5 minutes ago
    });

    const recentPerformance = this.getPerformanceAnalytics({
      start: Date.now() - (5 * 60 * 1000),
      end: Date.now()
    });

    const olderPerformance = this.getPerformanceAnalytics({
      start: Date.now() - (30 * 60 * 1000),
      end: Date.now() - (5 * 60 * 1000)
    });

    // Check for regression in generation time
    if (olderPerformance.averageGenerationTime > 0) {
      const regressionRatio = recentPerformance.averageGenerationTime / olderPerformance.averageGenerationTime;

      if (regressionRatio > (1 + this.config.alertThresholds.regressionDetectionThreshold)) {
        this.trackEvent('performance_regression', {
          metric: 'generation_time',
          oldValue: olderPerformance.averageGenerationTime,
          newValue: recentPerformance.averageGenerationTime,
          regressionRatio
        });

        this.createAlert('performance', 'warning',
          `Performance regression detected: Generation time increased by ${((regressionRatio - 1) * 100).toFixed(1)}%`);
      }
    }
  }

  private updateSystemHealth(): void {
    // This method updates the system health metrics
    // Implementation would depend on specific system monitoring requirements
  }

  private getSystemStartTime(): number {
    // Return system start time (would be stored in a persistent way)
    return Date.now() - (60 * 60 * 1000); // Placeholder: 1 hour ago
  }

  private calculateStorageUsage(): number {
    // Calculate current storage usage
    try {
      const used = JSON.stringify(this.events).length + JSON.stringify(this.alerts).length;
      return used;
    } catch {
      return 0;
    }
  }

  private generateReportSummary(
    performance: PerformanceAnalytics,
    userEngagement: UserEngagementAnalytics,
    quality: QualityAnalytics,
    systemHealth: SystemHealthMetrics
  ): string {
    return `
Analytics Report Summary:
- Average generation time: ${performance.averageGenerationTime.toFixed(0)}ms
- Success rate: ${performance.successRate.toFixed(1)}%
- Cache hit rate: ${performance.cacheHitRate.toFixed(1)}%
- Total generations: ${userEngagement.totalGenerations}
- Unique users: ${userEngagement.uniqueUsers}
- Overall quality score: ${quality.overallQualityScore.toFixed(1)}%
- System health score: ${systemHealth.healthScore.toFixed(1)}%
    `.trim();
  }

  private generateRecommendations(
    performance: PerformanceAnalytics,
    userEngagement: UserEngagementAnalytics,
    quality: QualityAnalytics,
    systemHealth: SystemHealthMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (performance.averageGenerationTime > 3000) {
      recommendations.push('Consider optimizing PDF generation pipeline to reduce average generation time');
    }

    if (performance.cacheHitRate < 80) {
      recommendations.push('Improve cache warming strategies to increase cache hit rate');
    }

    if (userEngagement.abandonmentRate > 20) {
      recommendations.push('Investigate user experience issues causing high abandonment rate');
    }

    if (quality.overallQualityScore < 85) {
      recommendations.push('Review and improve PDF quality assessment algorithms');
    }

    if (systemHealth.healthScore < 80) {
      recommendations.push('Address system health issues to improve overall performance');
    }

    return recommendations;
  }

  /**
   * Destroy service and cleanup resources
   */
  destroy(): void {
    this.intervals.clearAll();
  }
}
