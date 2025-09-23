import { Injectable, signal, computed, inject } from '@angular/core';
import { PDFAnalyticsService, QualityAnalytics, QualityTrend, QualityAlert } from './pdf-analytics.service';

/**
 * Quality Assessment Criteria
 */
export interface QualityAssessmentCriteria {
  contentCompleteness: number;
  visualConsistency: number;
  typographyQuality: number;
  layoutBalance: number;
  colorHarmony: number;
  accessibilityCompliance: number;
  performanceEfficiency: number;
  templateEffectiveness: number;
}

/**
 * Quality Score Weights
 */
export interface QualityScoreWeights {
  content: number;
  visual: number;
  performance: number;
  accessibility: number;
  userExperience: number;
}

/**
 * Quality Assessment Result
 */
export interface QualityAssessmentResult {
  overallScore: number;
  categoryScores: {
    content: number;
    visual: number;
    performance: number;
    accessibility: number;
    userExperience: number;
  };
  criteria: QualityAssessmentCriteria;
  recommendations: QualityRecommendation[];
  benchmarkComparison: BenchmarkComparison;
  timestamp: number;
}

/**
 * Quality Recommendation
 */
export interface QualityRecommendation {
  category: 'content' | 'visual' | 'performance' | 'accessibility' | 'userExperience';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number;
}

/**
 * Benchmark Comparison
 */
export interface BenchmarkComparison {
  industryAverage: number;
  topPerformers: number;
  previousPeriod: number;
  improvement: number;
  ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
}

/**
 * Template Quality Metrics
 */
export interface TemplateQualityMetrics {
  templateId: string;
  templateName: string;
  qualityScore: number;
  usageCount: number;
  userSatisfactionScore: number;
  conversionRate: number;
  averageGenerationTime: number;
  errorRate: number;
  lastAssessed: number;
  trends: QualityTrend[];
}

/**
 * Quality Monitoring Configuration
 */
export interface QualityMonitoringConfig {
  enableRealTimeAssessment: boolean;
  enableTrendAnalysis: boolean;
  enableBenchmarking: boolean;
  assessmentInterval: number;
  qualityThresholds: QualityThresholds;
  alertConfiguration: QualityAlertConfig;
}

/**
 * Quality Thresholds
 */
export interface QualityThresholds {
  minimumOverallScore: number;
  minimumContentScore: number;
  minimumVisualScore: number;
  minimumPerformanceScore: number;
  minimumAccessibilityScore: number;
  criticalThreshold: number;
  warningThreshold: number;
}

/**
 * Quality Alert Configuration
 */
export interface QualityAlertConfig {
  enableAlerts: boolean;
  alertChannels: ('console' | 'analytics' | 'external')[];
  escalationRules: EscalationRule[];
}

/**
 * Escalation Rule
 */
export interface EscalationRule {
  condition: string;
  threshold: number;
  action: string;
  delay: number;
}

/**
 * PDF Quality Metrics Service
 *
 * Provides comprehensive quality assessment and monitoring for PDF generation,
 * including automated quality scoring, trend analysis, and improvement recommendations.
 */
@Injectable({
  providedIn: 'root'
})
export class PDFQualityMetricsService {

  private readonly analyticsService = inject(PDFAnalyticsService);

  // Quality monitoring configuration
  private readonly config: QualityMonitoringConfig = {
    enableRealTimeAssessment: true,
    enableTrendAnalysis: true,
    enableBenchmarking: true,
    assessmentInterval: 300000, // 5 minutes
    qualityThresholds: {
      minimumOverallScore: 85,
      minimumContentScore: 80,
      minimumVisualScore: 85,
      minimumPerformanceScore: 90,
      minimumAccessibilityScore: 75,
      criticalThreshold: 70,
      warningThreshold: 80
    },
    alertConfiguration: {
      enableAlerts: true,
      alertChannels: ['console', 'analytics'],
      escalationRules: [
        {
          condition: 'quality_below_critical',
          threshold: 70,
          action: 'immediate_alert',
          delay: 0
        },
        {
          condition: 'quality_declining_trend',
          threshold: 5, // 5% decline
          action: 'trend_alert',
          delay: 300000 // 5 minutes
        }
      ]
    }
  };

  // Quality score weights
  private readonly scoreWeights: QualityScoreWeights = {
    content: 0.25,
    visual: 0.25,
    performance: 0.20,
    accessibility: 0.15,
    userExperience: 0.15
  };

  // Quality assessment history
  private readonly assessmentHistory: QualityAssessmentResult[] = [];
  private readonly templateMetrics = new Map<string, TemplateQualityMetrics>();

  // Reactive state
  private readonly _currentQualityScore = signal<number>(100);
  private readonly _qualityTrends = signal<QualityTrend[]>([]);
  private readonly _qualityAlerts = signal<QualityAlert[]>([]);
  private readonly _templateQualityScores = signal<Record<string, number>>({});

  // Public readonly signals
  readonly currentQualityScore = this._currentQualityScore.asReadonly();
  readonly qualityTrends = this._qualityTrends.asReadonly();
  readonly qualityAlerts = this._qualityAlerts.asReadonly();
  readonly templateQualityScores = this._templateQualityScores.asReadonly();

  // Computed quality metrics
  readonly qualityGrade = computed(() => {
    const score = this._currentQualityScore();
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    return 'D';
  });

  readonly qualityStatus = computed(() => {
    const score = this._currentQualityScore();
    if (score >= this.config.qualityThresholds.minimumOverallScore) return 'excellent';
    if (score >= this.config.qualityThresholds.warningThreshold) return 'good';
    if (score >= this.config.qualityThresholds.criticalThreshold) return 'warning';
    return 'critical';
  });

  readonly activeQualityAlerts = computed(() => {
    return this._qualityAlerts().filter(alert => !alert.resolved);
  });

  // Monitoring intervals
  private assessmentInterval?: number;
  private trendAnalysisInterval?: number;

  constructor() {
    this.initializeQualityMonitoring();
    this.startQualityAssessment();
  }

  /**
   * Assess PDF quality
   */
  async assessPDFQuality(
    templateId: string,
    pdfData: any,
    metadata: Record<string, any> = {}
  ): Promise<QualityAssessmentResult> {
    const startTime = Date.now();

    // Perform quality assessment
    const criteria = await this.evaluateQualityCriteria(templateId, pdfData, metadata);
    const categoryScores = this.calculateCategoryScores(criteria);
    const overallScore = this.calculateOverallScore(categoryScores);

    // Generate recommendations
    const recommendations = this.generateQualityRecommendations(criteria, categoryScores);

    // Compare with benchmarks
    const benchmarkComparison = this.compareToBenchmarks(overallScore, templateId);

    const result: QualityAssessmentResult = {
      overallScore,
      categoryScores,
      criteria,
      recommendations,
      benchmarkComparison,
      timestamp: Date.now()
    };

    // Store assessment result
    this.assessmentHistory.push(result);

    // Update template metrics
    this.updateTemplateMetrics(templateId, result, metadata);

    // Update reactive state
    this._currentQualityScore.set(overallScore);
    this.updateQualityTrends();

    // Check for quality alerts
    this.checkQualityAlerts(result);

    // Track assessment in analytics
    this.analyticsService.trackEvent('quality_assessment_completed', {
      templateId,
      qualityScore: overallScore,
      assessmentDuration: Date.now() - startTime,
      ...metadata
    }, templateId, Date.now() - startTime);

    return result;
  }

  /**
   * Get template quality metrics
   */
  getTemplateQualityMetrics(templateId: string): TemplateQualityMetrics | null {
    return this.templateMetrics.get(templateId) || null;
  }

  /**
   * Get all template quality metrics
   */
  getAllTemplateQualityMetrics(): TemplateQualityMetrics[] {
    return Array.from(this.templateMetrics.values());
  }

  /**
   * Private helper methods
   */

  private initializeQualityMonitoring(): void {
    // Initialize quality baseline
    this._currentQualityScore.set(100);
    this._qualityTrends.set([]);
    this._qualityAlerts.set([]);
    this._templateQualityScores.set({});
  }

  private startQualityAssessment(): void {
    if (this.config.enableRealTimeAssessment) {
      this.assessmentInterval = window.setInterval(() => {
        this.performPeriodicQualityAssessment();
      }, this.config.assessmentInterval);
    }

    if (this.config.enableTrendAnalysis) {
      this.trendAnalysisInterval = window.setInterval(() => {
        this.analyzeTrends();
      }, 600000); // Every 10 minutes
    }
  }

  private async evaluateQualityCriteria(
    templateId: string,
    pdfData: any,
    metadata: Record<string, any>
  ): Promise<QualityAssessmentCriteria> {
    // Content completeness assessment
    const contentCompleteness = this.assessContentCompleteness(pdfData, metadata);

    // Visual consistency assessment
    const visualConsistency = this.assessVisualConsistency(pdfData, templateId);

    // Typography quality assessment
    const typographyQuality = this.assessTypographyQuality(pdfData);

    // Layout balance assessment
    const layoutBalance = this.assessLayoutBalance(pdfData);

    // Color harmony assessment
    const colorHarmony = this.assessColorHarmony(pdfData);

    // Accessibility compliance assessment
    const accessibilityCompliance = this.assessAccessibilityCompliance(pdfData);

    // Performance efficiency assessment
    const performanceEfficiency = this.assessPerformanceEfficiency(metadata);

    // Template effectiveness assessment
    const templateEffectiveness = this.assessTemplateEffectiveness(templateId, metadata);

    return {
      contentCompleteness,
      visualConsistency,
      typographyQuality,
      layoutBalance,
      colorHarmony,
      accessibilityCompliance,
      performanceEfficiency,
      templateEffectiveness
    };
  }

  private calculateCategoryScores(criteria: QualityAssessmentCriteria): {
    content: number;
    visual: number;
    performance: number;
    accessibility: number;
    userExperience: number;
  } {
    return {
      content: (criteria.contentCompleteness * 0.7 + criteria.templateEffectiveness * 0.3),
      visual: (criteria.visualConsistency * 0.4 + criteria.typographyQuality * 0.3 +
               criteria.layoutBalance * 0.2 + criteria.colorHarmony * 0.1),
      performance: criteria.performanceEfficiency,
      accessibility: criteria.accessibilityCompliance,
      userExperience: (criteria.templateEffectiveness * 0.6 + criteria.layoutBalance * 0.4)
    };
  }

  private calculateOverallScore(categoryScores: {
    content: number;
    visual: number;
    performance: number;
    accessibility: number;
    userExperience: number;
  }): number {
    return (
      categoryScores.content * this.scoreWeights.content +
      categoryScores.visual * this.scoreWeights.visual +
      categoryScores.performance * this.scoreWeights.performance +
      categoryScores.accessibility * this.scoreWeights.accessibility +
      categoryScores.userExperience * this.scoreWeights.userExperience
    );
  }

  private generateQualityRecommendations(
    criteria: QualityAssessmentCriteria,
    categoryScores: any
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    // Content recommendations
    if (categoryScores.content < 80) {
      recommendations.push({
        category: 'content',
        priority: 'high',
        title: 'Improve Content Completeness',
        description: 'The PDF content appears incomplete or poorly structured.',
        actionItems: [
          'Review CV data completeness',
          'Ensure all sections are properly populated',
          'Validate data quality before PDF generation'
        ],
        estimatedImpact: 15
      });
    }

    // Visual recommendations
    if (categoryScores.visual < 85) {
      recommendations.push({
        category: 'visual',
        priority: 'medium',
        title: 'Enhance Visual Consistency',
        description: 'Visual elements could be better aligned and consistent.',
        actionItems: [
          'Review typography consistency',
          'Improve layout balance',
          'Optimize color scheme harmony'
        ],
        estimatedImpact: 12
      });
    }

    // Performance recommendations
    if (categoryScores.performance < 90) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Optimize Performance',
        description: 'PDF generation performance could be improved.',
        actionItems: [
          'Optimize rendering algorithms',
          'Implement better caching strategies',
          'Reduce memory usage during generation'
        ],
        estimatedImpact: 20
      });
    }

    // Accessibility recommendations
    if (categoryScores.accessibility < 75) {
      recommendations.push({
        category: 'accessibility',
        priority: 'medium',
        title: 'Improve Accessibility',
        description: 'PDF accessibility compliance needs enhancement.',
        actionItems: [
          'Add proper heading structure',
          'Ensure sufficient color contrast',
          'Include alternative text for images'
        ],
        estimatedImpact: 10
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private compareToBenchmarks(overallScore: number, templateId: string): BenchmarkComparison {
    // Industry benchmarks (these would be real data in production)
    const industryAverage = 82;
    const topPerformers = 95;

    // Previous period comparison
    const previousAssessments = this.assessmentHistory
      .filter(a => a.timestamp > Date.now() - (7 * 24 * 60 * 60 * 1000)) // Last 7 days
      .slice(-10); // Last 10 assessments

    const previousPeriod = previousAssessments.length > 0
      ? previousAssessments.reduce((sum, a) => sum + a.overallScore, 0) / previousAssessments.length
      : overallScore;

    const improvement = overallScore - previousPeriod;

    let ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
    if (overallScore >= 95) ranking = 'excellent';
    else if (overallScore >= 85) ranking = 'good';
    else if (overallScore >= 75) ranking = 'average';
    else if (overallScore >= 65) ranking = 'below_average';
    else ranking = 'poor';

    return {
      industryAverage,
      topPerformers,
      previousPeriod,
      improvement,
      ranking
    };
  }

  private updateTemplateMetrics(
    templateId: string,
    assessment: QualityAssessmentResult,
    metadata: Record<string, any>
  ): void {
    const existing = this.templateMetrics.get(templateId);
    const usageCount = (existing?.usageCount || 0) + 1;

    // Calculate user satisfaction (would be based on real user feedback)
    const userSatisfactionScore = this.calculateUserSatisfactionScore(assessment.overallScore);

    // Calculate conversion rate (would be based on actual user actions)
    const conversionRate = this.calculateConversionRate(templateId);

    const metrics: TemplateQualityMetrics = {
      templateId,
      templateName: metadata['templateName'] || templateId,
      qualityScore: assessment.overallScore,
      usageCount,
      userSatisfactionScore,
      conversionRate,
      averageGenerationTime: metadata['generationTime'] || 0,
      errorRate: metadata['errorRate'] || 0,
      lastAssessed: assessment.timestamp,
      trends: this.calculateTemplateTrends(templateId, assessment)
    };

    this.templateMetrics.set(templateId, metrics);

    // Update reactive state
    const templateScores = Object.fromEntries(
      Array.from(this.templateMetrics.entries()).map(([id, metrics]) => [id, metrics.qualityScore])
    );
    this._templateQualityScores.set(templateScores);
  }

  private updateQualityTrends(): void {
    const recentAssessments = this.assessmentHistory.slice(-20); // Last 20 assessments

    if (recentAssessments.length < 2) return;

    const trends: QualityTrend[] = [];

    // Overall quality trend
    const currentScore = recentAssessments[recentAssessments.length - 1].overallScore;
    const previousScore = recentAssessments[recentAssessments.length - 2].overallScore;
    const changePercentage = ((currentScore - previousScore) / previousScore) * 100;

    let trend: 'improving' | 'declining' | 'stable';
    if (Math.abs(changePercentage) < 2) trend = 'stable';
    else if (changePercentage > 0) trend = 'improving';
    else trend = 'declining';

    trends.push({
      timestamp: Date.now(),
      metric: 'overall_quality',
      value: currentScore,
      trend,
      changePercentage
    });

    this._qualityTrends.set(trends);
  }

  private checkQualityAlerts(assessment: QualityAssessmentResult): void {
    const alerts: QualityAlert[] = [...this._qualityAlerts()];

    // Check for critical quality threshold breach
    if (assessment.overallScore < this.config.qualityThresholds.criticalThreshold) {
      alerts.push({
        id: `quality-alert-${Date.now()}`,
        timestamp: Date.now(),
        severity: 'critical',
        metric: 'overall_quality',
        currentValue: assessment.overallScore,
        threshold: this.config.qualityThresholds.criticalThreshold,
        message: `Quality score ${assessment.overallScore.toFixed(1)} is below critical threshold ${this.config.qualityThresholds.criticalThreshold}`,
        resolved: false
      });
    }

    // Check for warning threshold breach
    else if (assessment.overallScore < this.config.qualityThresholds.warningThreshold) {
      alerts.push({
        id: `quality-alert-${Date.now()}`,
        timestamp: Date.now(),
        severity: 'medium',
        metric: 'overall_quality',
        currentValue: assessment.overallScore,
        threshold: this.config.qualityThresholds.warningThreshold,
        message: `Quality score ${assessment.overallScore.toFixed(1)} is below warning threshold ${this.config.qualityThresholds.warningThreshold}`,
        resolved: false
      });
    }

    this._qualityAlerts.set(alerts);
  }
  /**
   * Quality assessment methods
   */

  private assessContentCompleteness(pdfData: any, metadata: Record<string, any>): number {
    // Assess content completeness based on CV data
    let score = 100;

    // Check for missing essential sections
    if (!metadata['hasPersonalInfo']) score -= 20;
    if (!metadata['hasExperience']) score -= 25;
    if (!metadata['hasSkills']) score -= 15;
    if (!metadata['hasEducation']) score -= 10;

    // Check content quality
    if (metadata['experienceCount'] < 2) score -= 10;
    if (metadata['skillCount'] < 5) score -= 5;

    return Math.max(0, score);
  }

  private assessVisualConsistency(pdfData: any, templateId: string): number {
    // Assess visual consistency (would analyze actual PDF layout in production)
    let score = 90; // Base score

    // Template-specific adjustments
    const templateMetrics = this.templateMetrics.get(templateId);
    if (templateMetrics && templateMetrics.qualityScore < 85) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  private assessTypographyQuality(pdfData: any): number {
    // Assess typography quality
    return 88; // Placeholder - would analyze font consistency, sizing, etc.
  }

  private assessLayoutBalance(pdfData: any): number {
    // Assess layout balance and spacing
    return 92; // Placeholder - would analyze whitespace, alignment, etc.
  }

  private assessColorHarmony(pdfData: any): number {
    // Assess color scheme harmony
    return 85; // Placeholder - would analyze color contrast, harmony, etc.
  }

  private assessAccessibilityCompliance(pdfData: any): number {
    // Assess accessibility compliance
    return 78; // Placeholder - would check WCAG compliance, structure, etc.
  }

  private assessPerformanceEfficiency(metadata: Record<string, any>): number {
    // Assess performance efficiency
    let score = 100;

    const generationTime = metadata['generationTime'] || 0;
    if (generationTime > 5000) score -= 30; // > 5 seconds
    else if (generationTime > 3000) score -= 15; // > 3 seconds
    else if (generationTime > 2000) score -= 5; // > 2 seconds

    const memoryUsage = metadata['memoryUsage'] || 0;
    if (memoryUsage > 100 * 1024 * 1024) score -= 20; // > 100MB
    else if (memoryUsage > 50 * 1024 * 1024) score -= 10; // > 50MB

    return Math.max(0, score);
  }

  private assessTemplateEffectiveness(templateId: string, metadata: Record<string, any>): number {
    // Assess template effectiveness based on usage and feedback
    const templateMetrics = this.templateMetrics.get(templateId);

    if (!templateMetrics) return 85; // Default for new templates

    let score = 80;

    // Usage-based scoring
    if (templateMetrics.usageCount > 100) score += 10;
    else if (templateMetrics.usageCount > 50) score += 5;

    // User satisfaction scoring
    score += (templateMetrics.userSatisfactionScore - 80) * 0.5;

    // Conversion rate scoring
    if (templateMetrics.conversionRate > 0.8) score += 10;
    else if (templateMetrics.conversionRate > 0.6) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculateUserSatisfactionScore(qualityScore: number): number {
    // Simulate user satisfaction based on quality score
    return Math.min(100, qualityScore + Math.random() * 10 - 5);
  }

  private calculateConversionRate(templateId: string): number {
    // Simulate conversion rate (would be based on actual user actions)
    const existing = this.templateMetrics.get(templateId);
    return existing?.conversionRate || (0.7 + Math.random() * 0.2);
  }

  private calculateTemplateTrends(templateId: string, assessment: QualityAssessmentResult): QualityTrend[] {
    // Calculate trends for this template
    const existing = this.templateMetrics.get(templateId);
    const trends: QualityTrend[] = existing?.trends || [];

    if (existing) {
      const changePercentage = ((assessment.overallScore - existing.qualityScore) / existing.qualityScore) * 100;
      let trend: 'improving' | 'declining' | 'stable';

      if (Math.abs(changePercentage) < 2) trend = 'stable';
      else if (changePercentage > 0) trend = 'improving';
      else trend = 'declining';

      trends.push({
        timestamp: Date.now(),
        metric: 'template_quality',
        value: assessment.overallScore,
        trend,
        changePercentage
      });

      // Keep only last 10 trends
      return trends.slice(-10);
    }

    return trends;
  }

  private getAssessmentsInRange(timeRange?: { start: number; end: number }): QualityAssessmentResult[] {
    if (!timeRange) {
      return this.assessmentHistory;
    }

    return this.assessmentHistory.filter(assessment =>
      assessment.timestamp >= timeRange.start && assessment.timestamp <= timeRange.end
    );
  }

  private prioritizeRecommendations(recommendations: QualityRecommendation[]): QualityRecommendation[] {
    // Group by category and priority, then select top recommendations
    const grouped = new Map<string, QualityRecommendation[]>();

    recommendations.forEach(rec => {
      const key = `${rec.category}-${rec.priority}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(rec);
    });

    // Select top recommendation from each category-priority group
    const topRecommendations: QualityRecommendation[] = [];
    grouped.forEach(recs => {
      if (recs.length > 0) {
        topRecommendations.push(recs[0]);
      }
    });

    return topRecommendations
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5); // Top 5 recommendations
  }

  private generateTrendAnalysis(trends: QualityTrend[]): string {
    if (trends.length === 0) {
      return 'No trend data available yet.';
    }

    const improvingTrends = trends.filter(t => t.trend === 'improving').length;
    const decliningTrends = trends.filter(t => t.trend === 'declining').length;
    const stableTrends = trends.filter(t => t.trend === 'stable').length;

    let analysis = `Quality trend analysis: `;

    if (improvingTrends > decliningTrends) {
      analysis += `Overall quality is improving with ${improvingTrends} positive trends.`;
    } else if (decliningTrends > improvingTrends) {
      analysis += `Quality shows concerning decline with ${decliningTrends} negative trends.`;
    } else {
      analysis += `Quality remains stable with ${stableTrends} stable metrics.`;
    }

    return analysis;
  }

  private generateActionPlan(recommendations: QualityRecommendation[], analytics: QualityAnalytics): string[] {
    const actionPlan: string[] = [];

    // High priority actions
    const highPriorityRecs = recommendations.filter(r => r.priority === 'high' || r.priority === 'critical');
    if (highPriorityRecs.length > 0) {
      actionPlan.push(`Immediate Actions: Address ${highPriorityRecs.length} high-priority quality issues`);
      highPriorityRecs.forEach(rec => {
        actionPlan.push(`- ${rec.title}: ${rec.actionItems[0]}`);
      });
    }

    // Performance improvements
    if (analytics.performanceQualityScore < 90) {
      actionPlan.push('Performance Optimization: Focus on reducing generation time and memory usage');
    }

    // Template improvements
    const lowQualityTemplates = Object.entries(analytics.templateQualityScores)
      .filter(([, score]) => score < 80)
      .length;

    if (lowQualityTemplates > 0) {
      actionPlan.push(`Template Review: ${lowQualityTemplates} templates need quality improvements`);
    }

    return actionPlan;
  }

  private generateQualityReportSummary(analytics: QualityAnalytics, templateRankings: TemplateQualityMetrics[]): string {
    return `
Quality Report Summary:
- Overall Quality Score: ${analytics.overallQualityScore.toFixed(1)}%
- Content Quality: ${analytics.contentQualityScore.toFixed(1)}%
- Visual Quality: ${analytics.visualQualityScore.toFixed(1)}%
- Performance Quality: ${analytics.performanceQualityScore.toFixed(1)}%
- Accessibility Score: ${analytics.accessibilityScore.toFixed(1)}%
- Templates Assessed: ${templateRankings.length}
- Top Performing Template: ${templateRankings[0]?.templateName || 'N/A'} (${templateRankings[0]?.qualityScore.toFixed(1) || 'N/A'}%)
- Active Quality Alerts: ${analytics.qualityAlerts.filter(a => !a.resolved).length}
    `.trim();
  }

  private performPeriodicQualityAssessment(): void {
    // Perform periodic quality assessment of system
    // This would trigger assessments of recently generated PDFs
  }

  private analyzeTrends(): void {
    // Analyze quality trends and detect patterns
    this.updateQualityTrends();
  }

  /**
   * Destroy service and cleanup resources
   */
  destroy(): void {
    if (this.assessmentInterval) {
      clearInterval(this.assessmentInterval);
    }
    if (this.trendAnalysisInterval) {
      clearInterval(this.trendAnalysisInterval);
    }
  }
}
