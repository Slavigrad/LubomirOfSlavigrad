import { Injectable, inject, signal, computed } from '@angular/core';
import { CVData } from '../models/cv-data.interface';
import { PDFTemplate } from './pdf-template.service';
import { PDFGenerationOrchestratorService, TemplateCompatibility } from './pdf-generation-orchestrator.service';
import { CvDataService } from './cv-data.service';

/**
 * Template Preview Configuration
 */
export interface TemplatePreviewConfig {
  width: number;
  height: number;
  scale: number;
  quality: 'low' | 'medium' | 'high';
  showContent: boolean;
  showPlaceholders: boolean;
}

/**
 * Template Preview Result
 */
export interface TemplatePreviewResult {
  templateId: string;
  previewUrl: string;
  thumbnailUrl: string;
  metadata: {
    generationTime: number;
    dimensions: { width: number; height: number };
    fileSize: number;
    quality: string;
  };
  compatibility: TemplateCompatibility;
}

/**
 * Preview Cache Entry
 */
interface PreviewCacheEntry {
  result: TemplatePreviewResult;
  timestamp: number;
  cvDataHash: string;
}

/**
 * Template Feature Highlight
 */
export interface TemplateFeature {
  name: string;
  description: string;
  icon: string;
  category: 'design' | 'layout' | 'content' | 'performance';
  highlighted: boolean;
}

/**
 * PDF Template Preview Service
 *
 * Generates lightweight preview images of PDF templates using actual CV data,
 * provides template metadata and compatibility analysis, and handles preview
 * caching for optimal performance.
 */
@Injectable({
  providedIn: 'root'
})
export class PDFTemplatePreviewService {

  // Injected services
  private readonly orchestrator = inject(PDFGenerationOrchestratorService);
  private readonly cvDataService = inject(CvDataService);

  // Preview state management
  private readonly _isGeneratingPreview = signal<boolean>(false);
  private readonly _currentPreviewTemplate = signal<string | null>(null);
  private readonly _previewProgress = signal<number>(0);

  // Preview cache
  private readonly previewCache = new Map<string, PreviewCacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 50;

  // Preview configuration
  private readonly defaultPreviewConfig: TemplatePreviewConfig = {
    width: 400,
    height: 566, // A4 aspect ratio (210/297 * 400)
    scale: 0.5,
    quality: 'medium',
    showContent: true,
    showPlaceholders: false
  };

  // Public readonly signals
  readonly isGeneratingPreview = this._isGeneratingPreview.asReadonly();
  readonly currentPreviewTemplate = this._currentPreviewTemplate.asReadonly();
  readonly previewProgress = this._previewProgress.asReadonly();

  // Computed cache statistics
  readonly cacheStats = computed(() => ({
    size: this.previewCache.size,
    maxSize: this.MAX_CACHE_SIZE,
    hitRate: this.calculateCacheHitRate()
  }));

  /**
   * Generate preview for a specific template
   */
  async generatePreview(
    templateId: string,
    config: Partial<TemplatePreviewConfig> = {}
  ): Promise<TemplatePreviewResult> {
    console.log('Generating preview for template:', templateId);
    const startTime = performance.now();

    try {
      this._isGeneratingPreview.set(true);
      this._currentPreviewTemplate.set(templateId);
      this._previewProgress.set(0);

      // Check cache first
      const cached = this.getCachedPreview(templateId);
      if (cached) {
        this._previewProgress.set(100);
        return cached;
      }

      this._previewProgress.set(20);

      // Get CV data and template compatibility
      const cvData = await this.getCVData();
      console.log('CV data for preview:', cvData);
      const compatibility = await this.getTemplateCompatibility(templateId);

      this._previewProgress.set(40);

      // Generate preview using canvas-based rendering
      const previewConfig = { ...this.defaultPreviewConfig, ...config };
      console.log('Preview config:', previewConfig);
      const { previewUrl, thumbnailUrl } = await this.renderTemplatePreview(
        templateId,
        cvData,
        previewConfig
      );
      console.log('Generated preview URL:', previewUrl ? 'Success' : 'Failed');

      this._previewProgress.set(80);

      // Create result
      const result: TemplatePreviewResult = {
        templateId,
        previewUrl,
        thumbnailUrl,
        metadata: {
          generationTime: performance.now() - startTime,
          dimensions: {
            width: previewConfig.width,
            height: previewConfig.height
          },
          fileSize: this.estimatePreviewSize(previewUrl),
          quality: previewConfig.quality
        },
        compatibility
      };

      // Cache the result
      this.cachePreview(templateId, result, cvData);

      this._previewProgress.set(100);
      return result;

    } catch (error) {
      console.error('Preview generation failed:', error);
      throw new Error(`Failed to generate preview for template ${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this._isGeneratingPreview.set(false);
      this._currentPreviewTemplate.set(null);
      this._previewProgress.set(0);
    }
  }

  /**
   * Generate previews for multiple templates
   */
  async generateMultiplePreviews(
    templateIds: string[],
    config: Partial<TemplatePreviewConfig> = {}
  ): Promise<Map<string, TemplatePreviewResult>> {
    const results = new Map<string, TemplatePreviewResult>();

    // Generate previews sequentially to avoid overwhelming the system
    for (const templateId of templateIds) {
      try {
        const result = await this.generatePreview(templateId, config);
        results.set(templateId, result);
      } catch (error) {
        console.error(`Failed to generate preview for template ${templateId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get template features for highlighting
   */
  getTemplateFeatures(templateId: string): TemplateFeature[] {
    // This would typically come from template metadata
    const baseFeatures: TemplateFeature[] = [
      {
        name: 'Glass Morphism',
        description: 'Modern translucent design effects',
        icon: 'sparkles',
        category: 'design',
        highlighted: templateId === 'glass-modern'
      },
      {
        name: 'Two Column Layout',
        description: 'Optimized information density',
        icon: 'columns',
        category: 'layout',
        highlighted: true
      },
      {
        name: 'ATS Friendly',
        description: 'Applicant Tracking System compatible',
        icon: 'check-circle',
        category: 'content',
        highlighted: true
      },
      {
        name: 'Fast Generation',
        description: 'Sub-3-second PDF creation',
        icon: 'zap',
        category: 'performance',
        highlighted: true
      }
    ];

    return baseFeatures;
  }

  /**
   * Get template compatibility analysis
   */
  async getTemplateCompatibility(templateId: string): Promise<TemplateCompatibility> {
    const compatibilityAnalyses = await this.orchestrator.analyzeTemplateCompatibility(templateId);
    return compatibilityAnalyses[0] || {
      templateId,
      compatibilityScore: 85,
      contentFitScore: 90,
      performanceScore: 80,
      recommendations: [],
      warnings: [],
      estimatedTime: 2500
    };
  }

  /**
   * Clear preview cache
   */
  clearCache(): void {
    this.previewCache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.previewCache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.previewCache.delete(key);
      }
    }
  }

  /**
   * Get cached preview if available and valid
   */
  private getCachedPreview(templateId: string): TemplatePreviewResult | null {
    const cached = this.previewCache.get(templateId);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.previewCache.delete(templateId);
      return null;
    }

    // Check if CV data has changed
    const currentCVDataHash = this.generateCVDataHash();
    if (cached.cvDataHash !== currentCVDataHash) {
      this.previewCache.delete(templateId);
      return null;
    }

    return cached.result;
  }

  /**
   * Cache preview result
   */
  private cachePreview(templateId: string, result: TemplatePreviewResult, cvData: CVData): void {
    // Ensure cache doesn't exceed max size
    if (this.previewCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = Array.from(this.previewCache.keys())[0];
      this.previewCache.delete(oldestKey);
    }

    this.previewCache.set(templateId, {
      result,
      timestamp: Date.now(),
      cvDataHash: this.generateCVDataHash(cvData)
    });
  }

  /**
   * Render template preview using canvas-based approach
   */
  private async renderTemplatePreview(
    templateId: string,
    cvData: CVData,
    config: TemplatePreviewConfig
  ): Promise<{ previewUrl: string; thumbnailUrl: string }> {
    // Create canvas for preview rendering
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Set canvas dimensions
    canvas.width = config.width;
    canvas.height = config.height;

    // Set high DPI scaling for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width *= dpr;
    canvas.height *= dpr;
    ctx.scale(dpr, dpr);

    // Render template preview
    await this.renderTemplateContent(ctx, templateId, cvData, config);

    // Generate preview URL
    const previewUrl = canvas.toDataURL('image/png', this.getQualityValue(config.quality));

    // Generate thumbnail (smaller version)
    const thumbnailCanvas = document.createElement('canvas');
    const thumbnailCtx = thumbnailCanvas.getContext('2d')!;
    const thumbnailSize = 200;

    thumbnailCanvas.width = thumbnailSize;
    thumbnailCanvas.height = Math.round(thumbnailSize * (config.height / config.width));

    thumbnailCtx.drawImage(
      canvas,
      0, 0, canvas.width, canvas.height,
      0, 0, thumbnailCanvas.width, thumbnailCanvas.height
    );

    const thumbnailUrl = thumbnailCanvas.toDataURL('image/png', 0.8);

    return { previewUrl, thumbnailUrl };
  }

  /**
   * Render template content on canvas
   */
  private async renderTemplateContent(
    ctx: CanvasRenderingContext2D,
    templateId: string,
    cvData: CVData,
    config: TemplatePreviewConfig
  ): Promise<void> {
    console.log('Rendering template content for:', templateId);
    const { width, height } = config;

    // Clear canvas with background
    ctx.fillStyle = templateId === 'glass-modern-template' ? '#0a0a0a' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Render based on template type
    if (templateId === 'glass-modern-template') {
      await this.renderGlassMorphismPreview(ctx, cvData, width, height);
    } else {
      await this.renderClassicPreview(ctx, cvData, width, height);
    }

    // Add template watermark/identifier
    this.renderTemplateWatermark(ctx, templateId, width, height);
  }

  /**
   * Render glass-morphism template preview
   */
  private async renderGlassMorphismPreview(
    ctx: CanvasRenderingContext2D,
    cvData: CVData,
    width: number,
    height: number
  ): Promise<void> {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1e1b4b');
    gradient.addColorStop(0.5, '#312e81');
    gradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Glass card background
    const cardX = 20;
    const cardY = 20;
    const cardWidth = width - 40;
    const cardHeight = height - 40;

    // Glass effect simulation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

    // Header section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(cvData.personalInfo.name, cardX + 20, cardY + 40);

    ctx.fillStyle = '#a855f7';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(cvData.personalInfo.title, cardX + 20, cardY + 60);

    // Technology badges
    let badgeX = cardX + 20;
    const badgeY = cardY + 80;
    const technologies = cvData.personalInfo.technologies || [];
    technologies.slice(0, 4).forEach((tech, index) => {
      const badgeWidth = ctx.measureText(tech).width + 16;

      // Badge background
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.fillRect(badgeX, badgeY, badgeWidth, 20);

      // Badge text
      ctx.fillStyle = '#a855f7';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(tech, badgeX + 8, badgeY + 14);

      badgeX += badgeWidth + 8;
    });

    // Experience section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('Experience', cardX + 20, cardY + 130);

    // Experience items (simplified)
    cvData.experiences.slice(0, 2).forEach((exp, index) => {
      const expY = cardY + 160 + (index * 60);

      // Get the most recent position or fallback to legacy fields
      const currentPosition = exp.positions && exp.positions.length > 0
        ? exp.positions[exp.positions.length - 1]
        : null;

      const title = currentPosition?.title || exp.position || exp.title || 'Position';
      const duration = this.formatExperienceDuration(exp);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(title, cardX + 20, expY);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(exp.company, cardX + 20, expY + 16);
      ctx.fillText(duration, cardX + 20, expY + 30);
    });
  }

  /**
   * Render classic template preview
   */
  private async renderClassicPreview(
    ctx: CanvasRenderingContext2D,
    cvData: CVData,
    width: number,
    height: number
  ): Promise<void> {
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(cvData.personalInfo.name, 20, 40);

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(cvData.personalInfo.title, 20, 60);

    // Contact info
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText(cvData.personalInfo.email, 20, 80);
    ctx.fillText(cvData.personalInfo.location, 20, 95);

    // Divider line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 110);
    ctx.lineTo(width - 20, 110);
    ctx.stroke();

    // Experience section
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('Professional Experience', 20, 140);

    // Experience items
    cvData.experiences.slice(0, 3).forEach((exp, index) => {
      const expY = 170 + (index * 50);

      // Get the most recent position or fallback to legacy fields
      const currentPosition = exp.positions && exp.positions.length > 0
        ? exp.positions[exp.positions.length - 1]
        : null;

      const title = currentPosition?.title || exp.position || exp.title || 'Position';
      const duration = this.formatExperienceDuration(exp);

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText(title, 20, expY);

      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText(`${exp.company} • ${duration}`, 20, expY + 16);
    });
  }

  /**
   * Render template watermark/identifier
   */
  private renderTemplateWatermark(
    ctx: CanvasRenderingContext2D,
    templateId: string,
    width: number,
    height: number
  ): void {
    ctx.save();

    // Semi-transparent watermark
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = templateId === 'glass-modern-template' ? '#a855f7' : '#6b7280';
    ctx.font = '10px Inter, sans-serif';

    const watermarkText = templateId.replace('-', ' ').toUpperCase();
    const textWidth = ctx.measureText(watermarkText).width;

    ctx.fillText(watermarkText, width - textWidth - 10, height - 10);

    ctx.restore();
  }

  /**
   * Get quality value for canvas export
   */
  private getQualityValue(quality: string): number {
    switch (quality) {
      case 'low': return 0.6;
      case 'medium': return 0.8;
      case 'high': return 0.95;
      default: return 0.8;
    }
  }

  /**
   * Estimate preview file size
   */
  private estimatePreviewSize(dataUrl: string): number {
    // Rough estimation based on data URL length
    return Math.round(dataUrl.length * 0.75); // Base64 overhead
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This would be tracked in a real implementation
    return 0.85; // 85% hit rate example
  }

  /**
   * Get CV data asynchronously
   */
  private async getCVData(): Promise<CVData> {
    return this.getCVDataSync();
  }

  /**
   * Generate CV data hash for cache invalidation
   */
  private generateCVDataHash(cvData?: CVData): string {
    const data = cvData || this.getCVDataSync();
    return btoa(JSON.stringify({
      personalInfo: data.personalInfo.name,
      experienceCount: data.experiences.length,
      projectCount: data.projects.length,
      skillCount: data.skills.length,
      lastUpdated: data.lastUpdated
    }));
  }

  /**
   * Format experience duration for display
   */
  private formatExperienceDuration(exp: any): string {
    if (exp.duration) {
      return exp.duration;
    }

    // Calculate duration from dates
    const startDate = exp.overallStartDate || exp.startDate;
    const endDate = exp.overallEndDate || exp.endDate;

    if (!startDate) return 'Duration';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
      return `${years}y ${remainingMonths}m`;
    } else if (years > 0) {
      return `${years}y`;
    } else {
      return `${remainingMonths}m`;
    }
  }

  /**
   * Get CV data synchronously
   */
  private getCVDataSync(): CVData {
    const personalInfo = this.cvDataService.personalInfo();
    const experiences = this.cvDataService.experiences();
    const projects = this.cvDataService.projects();
    const skills = this.cvDataService.skills();
    const education = this.cvDataService.education();

    return {
      id: 'cv-data-' + Date.now(),
      lastUpdated: new Date(),
      personalInfo,
      experiences,
      projects,
      skills,
      education,
      certifications: [],
      volunteerWork: [],
      publications: [],
      speaking: []
    };
  }
}
