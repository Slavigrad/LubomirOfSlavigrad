import { Injectable, signal, computed, inject } from '@angular/core';
import { PDFGenerationOrchestratorService, PDFGenerationRequest, PDFGenerationResult } from './pdf-generation-orchestrator.service';
import { PDFTemplateGalleryComponent } from '../components/pdf/pdf-template-gallery.component';
import { PDFAnalyticsService } from './pdf-analytics.service';
import { PDFPerformanceService } from './pdf-performance.service';
import { PDFTemplateService } from './pdf-template.service';
import { CvDataService } from './cv-data.service';

/**
 * Hero PDF Integration Configuration
 */
export interface HeroPDFConfig {
  enableQuickGeneration: boolean;
  enableTemplateSelection: boolean;
  enablePreview: boolean;
  defaultTemplate: string;
  maxPreviewTime: number;
  enableAnalytics: boolean;
  preloadAssets: boolean;
}

/**
 * Hero PDF Generation State
 */
export interface HeroPDFState {
  isGenerating: boolean;
  isPreviewMode: boolean;
  selectedTemplate: string | null;
  generationProgress: number;
  lastGenerationTime: number;
  downloadUrl: string | null;
  error: string | null;
}

/**
 * Hero PDF Generation Options
 */
export interface HeroPDFOptions {
  templateId?: string;
  quickMode?: boolean;
  showProgress?: boolean;
  autoDownload?: boolean;
  trackAnalytics?: boolean;
}

/**
 * Hero PDF Integration Service
 *
 * Provides seamless integration between the hero component and the comprehensive
 * PDF generation system, optimized for hero-specific workflows and user experience.
 */
@Injectable({
  providedIn: 'root'
})
export class HeroPDFIntegrationService {

  private readonly orchestrator = inject(PDFGenerationOrchestratorService);
  private readonly analytics = inject(PDFAnalyticsService);
  private readonly performance = inject(PDFPerformanceService);
  private readonly templateService = inject(PDFTemplateService);
  private readonly cvDataService = inject(CvDataService);

  // Configuration
  private readonly config: HeroPDFConfig = {
    enableQuickGeneration: true,
    enableTemplateSelection: true,
    enablePreview: true,
    defaultTemplate: 'glass-modern-template',
    maxPreviewTime: 5000, // 5 seconds
    enableAnalytics: true,
    preloadAssets: true
  };

  // Reactive state
  private readonly _state = signal<HeroPDFState>({
    isGenerating: false,
    isPreviewMode: false,
    selectedTemplate: null,
    generationProgress: 0,
    lastGenerationTime: 0,
    downloadUrl: null,
    error: null
  });

  private readonly _quickGenerationEnabled = signal(true);
  private readonly _templateSelectorVisible = signal(false);

  // Public readonly signals
  readonly state = this._state.asReadonly();
  readonly availableTemplates = computed(() =>
    this.templateService.availableTemplates().map(template => template.id)
  );
  readonly quickGenerationEnabled = this._quickGenerationEnabled.asReadonly();
  readonly templateSelectorVisible = this._templateSelectorVisible.asReadonly();

  // Computed properties
  readonly isGenerating = computed(() => this._state().isGenerating);
  readonly generationProgress = computed(() => this._state().generationProgress);
  readonly selectedTemplate = computed(() => this._state().selectedTemplate || this.config.defaultTemplate);
  readonly canGenerate = computed(() => !this.isGenerating() && this._quickGenerationEnabled());
  readonly hasError = computed(() => !!this._state().error);

  constructor() {
    this.initializeService();
  }

  /**
   * Quick PDF generation with default settings
   */
  async generateQuickPDF(options: HeroPDFOptions = {}): Promise<PDFGenerationResult | null> {
    if (!this.canGenerate()) {
      return null;
    }

    const startTime = Date.now();

    try {
      this.updateState({
        isGenerating: true,
        generationProgress: 0,
        error: null,
        downloadUrl: null
      });

      // Track analytics
      if (this.config.enableAnalytics && options.trackAnalytics !== false) {
        this.analytics.trackEvent('pdf_generation_started', {
          source: 'hero_component',
          templateId: options.templateId || this.selectedTemplate(),
          quickMode: options.quickMode !== false
        });
      }

      // Prepare generation request
      const request: PDFGenerationRequest = {
        templateId: options.templateId || this.selectedTemplate(),
        targetAudience: 'recruiter',
        processingOptions: {
          maxPages: 3,
          contentDensity: 'normal',
          skillsDisplayMode: 'compact'
        },
        preferences: {
          prioritizeQuality: true,
          enableFallback: true
        }
      };

      // Generate PDF
      const result = await this.orchestrator.generatePDF(request);

      // Update state with success
      this.updateState({
        isGenerating: false,
        generationProgress: 100,
        lastGenerationTime: Date.now() - startTime,
        downloadUrl: URL.createObjectURL(result.pdfBlob)
      });

      // Auto-download if enabled
      if (options.autoDownload !== false && result.pdfBlob) {
        this.downloadPDF(result.pdfBlob, 'CV.pdf');
      }

      // Track success analytics
      if (this.config.enableAnalytics && options.trackAnalytics !== false) {
        this.analytics.trackEvent('pdf_generation_completed', {
          source: 'hero_component',
          templateId: result.metadata.templateUsed.id || 'unknown',
          generationTime: Date.now() - startTime,
          fileSize: result.pdfBlob?.size || 0
        }, result.metadata.templateUsed.id, Date.now() - startTime);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      this.updateState({
        isGenerating: false,
        generationProgress: 0,
        error: errorMessage
      });

      // Track error analytics
      if (this.config.enableAnalytics && options.trackAnalytics !== false) {
        this.analytics.trackEvent('pdf_generation_failed', {
          source: 'hero_component',
          error: errorMessage,
          generationTime: Date.now() - startTime
        }, options.templateId, Date.now() - startTime, false, errorMessage);
      }

      throw error;
    }
  }

  /**
   * Generate PDF with template selection
   */
  async generateWithTemplate(templateId: string, options: HeroPDFOptions = {}): Promise<PDFGenerationResult | null> {
    this.selectTemplate(templateId);
    return this.generateQuickPDF({ ...options, templateId });
  }

  /**
   * Select template for generation
   */
  selectTemplate(templateId: string): void {
    if (this.availableTemplates().includes(templateId)) {
      this.updateState({ selectedTemplate: templateId });

      // Track template selection
      if (this.config.enableAnalytics) {
        this.analytics.trackEvent('template_selected', {
          source: 'hero_component',
          templateId,
          previousTemplate: this._state().selectedTemplate
        }, templateId);
      }
    }
  }

  /**
   * Toggle template selector visibility
   */
  toggleTemplateSelector(): void {
    this._templateSelectorVisible.set(!this._templateSelectorVisible());
  }

  /**
   * Show template selector
   */
  showTemplateSelector(): void {
    this._templateSelectorVisible.set(true);
  }

  /**
   * Hide template selector
   */
  hideTemplateSelector(): void {
    this._templateSelectorVisible.set(false);
  }

  /**
   * Download PDF blob
   */
  private downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Track download
    if (this.config.enableAnalytics) {
      this.analytics.trackEvent('pdf_downloaded', {
        source: 'hero_component',
        filename,
        fileSize: blob.size
      });
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Reset generation state
   */
  reset(): void {
    this.updateState({
      isGenerating: false,
      isPreviewMode: false,
      generationProgress: 0,
      downloadUrl: null,
      error: null
    });
  }

  /**
   * Get generation statistics
   */
  getGenerationStats(): {
    totalGenerations: number;
    averageTime: number;
    successRate: number;
    preferredTemplate: string;
  } {
    // This would integrate with analytics service
    return {
      totalGenerations: 0,
      averageTime: 0,
      successRate: 100,
      preferredTemplate: this.config.defaultTemplate
    };
  }

  /**
   * Preload PDF generation assets
   */
  async preloadAssets(): Promise<void> {
    if (!this.config.preloadAssets) return;

    try {
      // Get available templates to warm up the system
      const templates = this.availableTemplates();
      console.log(`Preloaded ${templates.length} PDF templates`);

    } catch (error) {
      console.warn('Failed to preload PDF assets:', error);
    }
  }

  /**
   * Private helper methods
   */

  private initializeService(): void {
    // Initialize with default template
    this.updateState({ selectedTemplate: this.config.defaultTemplate });

    // Preload assets if enabled
    if (this.config.preloadAssets) {
      this.preloadAssets();
    }
  }

  private updateState(updates: Partial<HeroPDFState>): void {
    this._state.set({ ...this._state(), ...updates });
  }
}
