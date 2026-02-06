import { Injectable, inject, signal, computed } from '@angular/core';
import { CVData } from '../models/cv-data.interface';
import { CvDataService } from './cv-data.service';
import { PDFTemplateService, PDFTemplate } from './pdf-template.service';
import { PDFDataProcessorService, PDFProcessingOptions, ProcessedPDFData } from './pdf-data-processor.service';
import { PDFRendererService, PDFRenderingOptions, RenderingMetrics } from './pdf-renderer.service';
import { generateId } from '../shared/utils/id-generator';

/**
 * PDF Generation Request Configuration
 */
export interface PDFGenerationRequest {
  // Template selection
  templateId?: string; // If not provided, auto-select based on audience
  targetAudience?: 'recruiter' | 'technical' | 'executive' | 'creative';

  // Data processing options
  processingOptions?: Partial<PDFProcessingOptions>;

  // Rendering options
  renderingOptions?: Partial<PDFRenderingOptions>;

  // Generation preferences
  preferences?: {
    prioritizeSpeed?: boolean;
    prioritizeQuality?: boolean;
    enableFallback?: boolean;
    validateOutput?: boolean;
  };

  // Metadata
  metadata?: {
    filename?: string;
    purpose?: 'application' | 'portfolio' | 'networking' | 'archive';
    customization?: Record<string, any>;
  };
}

/**
 * PDF Generation Result with comprehensive metadata
 */
export interface PDFGenerationResult {
  // Generated PDF
  pdfBlob: Blob;

  // Generation metadata
  metadata: {
    templateUsed: PDFTemplate;
    processingTime: number;
    renderingMetrics: RenderingMetrics;
    qualityScore: number;
    fileSize: number;
    pageCount: number;
    generatedAt: Date;
  };

  // Processing details
  processingDetails: {
    dataProcessingTime: number;
    renderingTime: number;
    optimizationsApplied: string[];
    contentFitAnalysis: any;
    layoutRecommendations: any[];
  };

  // Quality assurance
  qualityAssurance: {
    validationPassed: boolean;
    warnings: string[];
    recommendations: string[];
  };
}

/**
 * Batch Generation Request for multiple templates
 */
export interface BatchGenerationRequest {
  templateIds: string[];
  baseRequest: Omit<PDFGenerationRequest, 'templateId'>;
  options?: {
    parallel?: boolean;
    maxConcurrency?: number;
    failFast?: boolean;
  };
}

/**
 * Batch Generation Result
 */
export interface BatchGenerationResult {
  results: Map<string, PDFGenerationResult>;
  summary: {
    totalTime: number;
    successCount: number;
    failureCount: number;
    averageQualityScore: number;
    totalFileSize: number;
  };
  errors: Map<string, Error>;
}

/**
 * Template Compatibility Analysis
 */
export interface TemplateCompatibility {
  templateId: string;
  compatibilityScore: number; // 0-100
  contentFitScore: number; // 0-100
  performanceScore: number; // 0-100
  recommendations: string[];
  warnings: string[];
  estimatedTime: number;
}

/**
 * Generation Queue Item
 */
interface GenerationQueueItem {
  id: string;
  request: PDFGenerationRequest;
  priority: number;
  createdAt: Date;
  resolve: (result: PDFGenerationResult) => void;
  reject: (error: Error) => void;
}

/**
 * Multi-Template PDF Generation Orchestrator
 *
 * Coordinates all PDF generation services to provide a unified, powerful API
 * for generating professional PDFs across multiple template variations while
 * maintaining sub-3-second generation time and the "double damn" effect.
 */
@Injectable({
  providedIn: 'root'
})
export class PDFGenerationOrchestratorService {

  // Injected services
  private readonly cvDataService = inject(CvDataService);
  private readonly templateService = inject(PDFTemplateService);
  private readonly dataProcessor = inject(PDFDataProcessorService);
  private readonly renderer = inject(PDFRendererService);

  // Generation state management
  private readonly _isGenerating = signal<boolean>(false);
  private readonly _currentGeneration = signal<string | null>(null);
  private readonly _generationProgress = signal<number>(0);
  private readonly _queueSize = signal<number>(0);

  // Generation statistics
  private readonly _generationStats = signal<{
    totalGenerations: number;
    successfulGenerations: number;
    averageGenerationTime: number;
    averageQualityScore: number;
  }>({
    totalGenerations: 0,
    successfulGenerations: 0,
    averageGenerationTime: 0,
    averageQualityScore: 0
  });

  // Public readonly signals
  readonly isGenerating = this._isGenerating.asReadonly();
  readonly currentGeneration = this._currentGeneration.asReadonly();
  readonly generationProgress = this._generationProgress.asReadonly();
  readonly queueSize = this._queueSize.asReadonly();
  readonly generationStats = this._generationStats.asReadonly();

  // Computed status
  readonly generationStatus = computed(() => {
    const isGenerating = this._isGenerating();
    const progress = this._generationProgress();

    if (!isGenerating) return 'idle';
    if (progress < 20) return 'initializing';
    if (progress < 40) return 'processing';
    if (progress < 80) return 'rendering';
    if (progress < 100) return 'finalizing';
    return 'complete';
  });

  // Generation queue for performance optimization
  private generationQueue: GenerationQueueItem[] = [];
  private isProcessingQueue = false;

  // Default options
  private readonly defaultProcessingOptions: PDFProcessingOptions = {
    targetAudience: 'recruiter',
    contentDensity: 'normal',
    maxPages: 2,
    includeSections: {
      personalInfo: true,
      experience: true,
      projects: true,
      skills: true,
      education: true,
      certifications: false,
      volunteerWork: false,
      publications: false,
      speaking: false
    },
    // experienceLimit: undefined, // default: show all unless user opts to limit
    projectLimit: 4,
    skillsDisplayMode: 'compact',
    templateId: 'glass-modern-template',
    preserveOriginalOrder: false
  };

  private readonly defaultRenderingOptions: PDFRenderingOptions = {
    dpi: 300,
    quality: 0.95,
    compression: 'slow',
    enableProgressiveRendering: true,
    maxRenderTime: 30000,
    memoryOptimization: true,
    colorProfile: 'sRGB',
    pdfVersion: '1.7',
    compliance: 'PDF/A-2',
    antiAliasing: true,
    fontEmbedding: true,
    vectorGraphics: true,
    includeExperienceDescriptions: true,
    includeProjectDescriptions: true,
    experienceLayout: 'two-column',

  };

  /**
   * Main PDF generation method - single entry point for all PDF generation
   */
  async generatePDF(request: PDFGenerationRequest): Promise<PDFGenerationResult> {
    const startTime = performance.now();

    try {
      this._isGenerating.set(true);
      this._generationProgress.set(0);

      // 1. Validate and prepare request
      const validatedRequest = await this.validateAndPrepareRequest(request);
      this._generationProgress.set(10);

      // 2. Select optimal template
      const template = await this.selectOptimalTemplate(validatedRequest);
      this._currentGeneration.set(template.name);
      this._generationProgress.set(20);

      // 3. Get CV data
      const cvData = await this.getCVData();
      this._generationProgress.set(25);

      // 4. Process data for template
      const processedData = await this.processDataForTemplate(cvData, template, validatedRequest);
      this._generationProgress.set(50);

      // 5. Render PDF
      const pdfBlob = await this.renderPDF(processedData, template, validatedRequest);
      this._generationProgress.set(90);

      // 6. Perform quality assurance
      const qualityAssurance = await this.performQualityAssurance(pdfBlob, template, processedData);
      this._generationProgress.set(95);

      // 7. Generate result metadata
      const result = await this.generateResult(
        pdfBlob,
        template,
        processedData,
        qualityAssurance,
        startTime,
        validatedRequest
      );
      this._generationProgress.set(100);

      // Update statistics
      this.updateGenerationStats(result);

      return result;

    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this._isGenerating.set(false);
      this._currentGeneration.set(null);
      this._generationProgress.set(0);
    }
  }

  /**
   * Generate multiple PDFs with different templates simultaneously
   */
  async generateBatch(request: BatchGenerationRequest): Promise<BatchGenerationResult> {
    const startTime = performance.now();
    const results = new Map<string, PDFGenerationResult>();
    const errors = new Map<string, Error>();

    const { templateIds, baseRequest, options = {} } = request;
    const { parallel = true, maxConcurrency = 3, failFast = false } = options;

    if (parallel) {
      // Parallel generation with concurrency control
      const chunks = this.chunkArray(templateIds, maxConcurrency);

      for (const chunk of chunks) {
        const promises = chunk.map(async (templateId) => {
          try {
            const result = await this.generatePDF({
              ...baseRequest,
              templateId
            });
            results.set(templateId, result);
          } catch (error) {
            errors.set(templateId, error as Error);
            if (failFast) throw error;
          }
        });

        await Promise.all(promises);
      }
    } else {
      // Sequential generation
      for (const templateId of templateIds) {
        try {
          const result = await this.generatePDF({
            ...baseRequest,
            templateId
          });
          results.set(templateId, result);
        } catch (error) {
          errors.set(templateId, error as Error);
          if (failFast) throw error;
        }
      }
    }

    // Generate summary
    const totalTime = performance.now() - startTime;
    const successCount = results.size;
    const failureCount = errors.size;
    const averageQualityScore = Array.from(results.values())
      .reduce((sum, result) => sum + result.metadata.qualityScore, 0) / successCount || 0;
    const totalFileSize = Array.from(results.values())
      .reduce((sum, result) => sum + result.metadata.fileSize, 0);

    return {
      results,
      summary: {
        totalTime,
        successCount,
        failureCount,
        averageQualityScore,
        totalFileSize
      },
      errors
    };
  }

  /**
   * Analyze template compatibility with current CV data
   */
  async analyzeTemplateCompatibility(templateId?: string): Promise<TemplateCompatibility[]> {
    const templates = templateId
      ? [await this.templateService.getTemplate(templateId)].filter(Boolean) as PDFTemplate[]
      : this.templateService.availableTemplates();

    const cvData = await this.getCVData();
    const analyses: TemplateCompatibility[] = [];

    for (const template of templates) {
      const analysis = await this.analyzeTemplateForData(template, cvData);
      analyses.push(analysis);
    }

    // Sort by compatibility score (highest first)
    return analyses.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  /**
   * Get recommended template for specific audience
   */
  async getRecommendedTemplate(audience: string): Promise<PDFTemplate | null> {
    const compatibilityAnalyses = await this.analyzeTemplateCompatibility();

    // Filter by audience and get highest scoring template
    const audienceTemplates = compatibilityAnalyses
      .filter(analysis => {
        const template = this.templateService.templates()
          .find(t => t.id === analysis.templateId);
        return template?.targetAudience === audience;
      });

    if (audienceTemplates.length === 0) return null;

    const bestTemplate = audienceTemplates[0];
    return await this.templateService.getTemplate(bestTemplate.templateId);
  }

  /**
   * Add generation request to queue for batch processing
   */
  async queueGeneration(request: PDFGenerationRequest): Promise<Promise<PDFGenerationResult>> {
    return new Promise((resolve, reject) => {
      const queueItem: GenerationQueueItem = {
        id: generateId('queue'),
        request,
        priority: this.calculatePriority(request),
        createdAt: new Date(),
        resolve,
        reject
      };

      this.generationQueue.push(queueItem);
      this.generationQueue.sort((a, b) => b.priority - a.priority); // Higher priority first
      this._queueSize.set(this.generationQueue.length);

      // Start processing queue if not already running
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Validate and prepare generation request
   */
  private async validateAndPrepareRequest(request: PDFGenerationRequest): Promise<PDFGenerationRequest> {
    const prepared: PDFGenerationRequest = {
      ...request,
      processingOptions: {
        ...this.defaultProcessingOptions,
        ...request.processingOptions
      },
      renderingOptions: {
        ...this.defaultRenderingOptions,
        ...request.renderingOptions
      },
      preferences: {
        prioritizeSpeed: false,
        prioritizeQuality: true,
        enableFallback: true,
        validateOutput: true,
        ...request.preferences
      }
    };

    // Validate template ID if provided
    if (prepared.templateId) {
      const template = await this.templateService.getTemplate(prepared.templateId);
      if (!template) {
        throw new Error(`Template not found: ${prepared.templateId}`);
      }
    }

    // Ensure target audience is set
    if (!prepared.targetAudience && !prepared.templateId) {
      prepared.targetAudience = 'recruiter'; // Default audience
    }

    return prepared;
  }

  /**
   * Select optimal template based on request and data analysis
   */
  private async selectOptimalTemplate(request: PDFGenerationRequest): Promise<PDFTemplate> {
    // If template ID is specified, use it
    if (request.templateId) {
      const template = await this.templateService.getTemplate(request.templateId);
      if (template) return template;

      // Fallback if template not found and fallback is enabled
      if (request.preferences?.enableFallback) {
        console.warn(`Template ${request.templateId} not found, falling back to recommended template`);
      } else {
        throw new Error(`Template not found: ${request.templateId}`);
      }
    }

    // Auto-select based on audience
    if (request.targetAudience) {
      const recommended = await this.getRecommendedTemplate(request.targetAudience);
      if (recommended) return recommended;
    }

    // Final fallback to first available template
    const availableTemplates = this.templateService.availableTemplates();
    if (availableTemplates.length === 0) {
      throw new Error('No templates available');
    }

    return availableTemplates[0];
  }

  /**
   * Get current CV data
   */
  private async getCVData(): Promise<CVData> {
    // Get data from CV data service
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

  /**
   * Process CV data for specific template
   */
  private async processDataForTemplate(
    cvData: CVData,
    template: PDFTemplate,
    request: PDFGenerationRequest
  ): Promise<ProcessedPDFData> {
    const processingOptions = request.processingOptions!;

    // Apply template-specific optimizations
    const optimizedOptions = this.optimizeProcessingOptionsForTemplate(processingOptions, template);

    return await this.dataProcessor.processForTemplate(cvData, template, optimizedOptions);
  }

  /**
   * Render PDF using advanced rendering engine
   */
  private async renderPDF(
    processedData: ProcessedPDFData,
    template: PDFTemplate,
    request: PDFGenerationRequest
  ): Promise<Blob> {
    const renderingOptions = request.renderingOptions!;

    // Apply template-specific rendering optimizations
    const optimizedOptions = this.optimizeRenderingOptionsForTemplate(renderingOptions, template);

    return await this.renderer.renderPDF(processedData, template, optimizedOptions);
  }

  /**
   * Perform quality assurance on generated PDF
   */
  private async performQualityAssurance(
    pdfBlob: Blob,
    template: PDFTemplate,
    processedData: ProcessedPDFData
  ): Promise<any> {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // File size validation
    const fileSizeMB = pdfBlob.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      warnings.push('PDF file size is large (>5MB). Consider optimizing images or reducing content.');
    }

    // Content validation
    if (processedData.experiences.length === 0) {
      warnings.push('No experience data found. PDF may appear incomplete.');
    }

    if (processedData.skills.topSkills.length === 0) {
      warnings.push('No skills data found. Consider adding skills to improve CV impact.');
    }

    // Template-specific recommendations
    if (template.targetAudience === 'technical' && processedData.projects.length < 2) {
      recommendations.push('Consider adding more technical projects for technical audience.');
    }

    return {
      validationPassed: warnings.length === 0,
      warnings,
      recommendations
    };
  }

  /**
   * Generate comprehensive result metadata
   */
  private async generateResult(
    pdfBlob: Blob,
    template: PDFTemplate,
    processedData: ProcessedPDFData,
    qualityAssurance: any,
    startTime: number,
    request: PDFGenerationRequest
  ): Promise<PDFGenerationResult> {
    const totalTime = performance.now() - startTime;

    // Calculate quality score based on multiple factors
    const qualityScore = this.calculateQualityScore(
      totalTime,
      pdfBlob.size,
      qualityAssurance.warnings.length,
      template
    );

    // Estimate page count (rough calculation)
    const estimatedPageCount = Math.max(1, Math.ceil(pdfBlob.size / 50000)); // ~50KB per page estimate

    return {
      pdfBlob,
      metadata: {
        templateUsed: template,
        processingTime: totalTime,
        renderingMetrics: {
          totalRenderTime: totalTime,
          sectionRenderTimes: {},
          memoryUsage: 0,
          canvasOperations: 0,
          pdfSize: pdfBlob.size,
          qualityScore
        },
        qualityScore,
        fileSize: pdfBlob.size,
        pageCount: estimatedPageCount,
        generatedAt: new Date()
      },
      processingDetails: {
        dataProcessingTime: 0, // Would be tracked from actual processing
        renderingTime: totalTime,
        optimizationsApplied: this.getAppliedOptimizations(request),
        contentFitAnalysis: processedData.templateOptimizations.contentFitAnalysis,
        layoutRecommendations: processedData.templateOptimizations.layoutRecommendations
      },
      qualityAssurance
    };
  }

  /**
   * Analyze template compatibility with specific CV data
   */
  private async analyzeTemplateForData(template: PDFTemplate, cvData: CVData): Promise<TemplateCompatibility> {
    let compatibilityScore = 100;
    let contentFitScore = 100;
    let performanceScore = 100;
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Content fit analysis
    const experienceCount = cvData.experiences.length;
    const projectCount = cvData.projects.length;
    const skillCount = cvData.skills.length;

    // Check if content fits template constraints
    if (experienceCount > 8 && template.maxPages <= 2) {
      contentFitScore -= 20;
      recommendations.push('Consider reducing experience entries for better fit');
    }

    if (projectCount > 6 && template.maxPages <= 2) {
      contentFitScore -= 15;
      recommendations.push('Consider highlighting top projects only');
    }

    // Performance analysis
    const performanceEstimate = this.templateService.getPerformanceEstimate(template);
    if (performanceEstimate.estimatedTime > 3000) {
      performanceScore -= 30;
      warnings.push('Template may exceed 3-second generation target');
    }

    // Calculate overall compatibility
    compatibilityScore = Math.round((contentFitScore + performanceScore) / 2);

    return {
      templateId: template.id,
      compatibilityScore,
      contentFitScore,
      performanceScore,
      recommendations,
      warnings,
      estimatedTime: performanceEstimate.estimatedTime
    };
  }

  /**
   * Optimize processing options for specific template
   */
  private optimizeProcessingOptionsForTemplate(
    options: Partial<PDFProcessingOptions>,
    template: PDFTemplate
  ): PDFProcessingOptions {
    const optimized: PDFProcessingOptions = {
      ...this.defaultProcessingOptions,
      ...options
    };

    // Template-specific optimizations
    if (template.targetAudience === 'recruiter') {
      optimized.contentDensity = 'compact';
      if (optimized.experienceLimit !== undefined) {
        optimized.experienceLimit = Math.min(optimized.experienceLimit, 5);
      }
      optimized.skillsDisplayMode = 'compact';
    } else if (template.targetAudience === 'technical') {
      optimized.includeSections.projects = true;
      optimized.projectLimit = Math.min(optimized.projectLimit || 4, 6);
      optimized.skillsDisplayMode = 'detailed';
    }

    // Page constraint optimizations
    if (template.maxPages <= 2) {
      if (optimized.experienceLimit !== undefined) {
        optimized.experienceLimit = Math.min(optimized.experienceLimit, 4);
      }
      if (optimized.projectLimit !== undefined) {
        optimized.projectLimit = Math.min(optimized.projectLimit, 3);
      }
    }

    return optimized;
  }

  /**
   * Optimize rendering options for specific template
   */
  private optimizeRenderingOptionsForTemplate(
    options: Partial<PDFRenderingOptions>,
    template: PDFTemplate
  ): PDFRenderingOptions {
    const optimized: PDFRenderingOptions = {
      ...this.defaultRenderingOptions,
      ...options
    };

    // Glass-morphism templates need higher quality
    if (template.features?.supportsGlassMorphism) {
      optimized.quality = Math.max(optimized.quality, 0.9);
      optimized.antiAliasing = true;
      optimized.vectorGraphics = true;
    }

    // Performance vs quality trade-offs
    if (template.features?.supportsCharts) {
      optimized.dpi = Math.max(optimized.dpi, 300);
      optimized.compression = 'slow'; // Better quality for charts
    }

    return optimized;
  }

  /**
   * Calculate quality score based on multiple factors
   */
  private calculateQualityScore(
    renderTime: number,
    fileSize: number,
    warningCount: number,
    template: PDFTemplate
  ): number {
    let score = 100;

    // Time penalty (target: sub-3-second)
    if (renderTime > 3000) {
      score -= Math.min(30, (renderTime - 3000) / 100);
    }

    // File size penalty (target: under 2MB)
    const fileSizeMB = fileSize / (1024 * 1024);
    if (fileSizeMB > 2) {
      score -= Math.min(20, (fileSizeMB - 2) * 5);
    }

    // Warning penalty
    score -= warningCount * 10;

    // Template complexity bonus
    if (template.features?.supportsGlassMorphism) {
      score += 5; // Bonus for advanced features
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Get list of applied optimizations
   */
  private getAppliedOptimizations(request: PDFGenerationRequest): string[] {
    const optimizations: string[] = [];

    if (request.preferences?.prioritizeSpeed) {
      optimizations.push('Speed optimization enabled');
    }

    if (request.preferences?.prioritizeQuality) {
      optimizations.push('Quality optimization enabled');
    }

    if (request.renderingOptions?.compression !== 'none') {
      optimizations.push('PDF compression applied');
    }

    if (request.renderingOptions?.memoryOptimization) {
      optimizations.push('Memory optimization enabled');
    }

    return optimizations;
  }

  /**
   * Update generation statistics
   */
  private updateGenerationStats(result: PDFGenerationResult): void {
    const currentStats = this._generationStats();
    const newTotalGenerations = currentStats.totalGenerations + 1;
    const newSuccessfulGenerations = currentStats.successfulGenerations + 1;

    // Calculate new averages
    const newAverageTime = (
      (currentStats.averageGenerationTime * currentStats.totalGenerations) +
      result.metadata.processingTime
    ) / newTotalGenerations;

    const newAverageQuality = (
      (currentStats.averageQualityScore * currentStats.successfulGenerations) +
      result.metadata.qualityScore
    ) / newSuccessfulGenerations;

    this._generationStats.set({
      totalGenerations: newTotalGenerations,
      successfulGenerations: newSuccessfulGenerations,
      averageGenerationTime: newAverageTime,
      averageQualityScore: newAverageQuality
    });
  }

  /**
   * Process generation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.generationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.generationQueue.length > 0) {
      const item = this.generationQueue.shift()!;
      this._queueSize.set(this.generationQueue.length);

      try {
        const result = await this.generatePDF(item.request);
        item.resolve(result);
      } catch (error) {
        item.reject(error as Error);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Calculate request priority for queue ordering
   */
  private calculatePriority(request: PDFGenerationRequest): number {
    let priority = 50; // Base priority

    // Higher priority for speed-optimized requests
    if (request.preferences?.prioritizeSpeed) {
      priority += 20;
    }

    // Higher priority for specific templates (vs auto-selection)
    if (request.templateId) {
      priority += 10;
    }

    // Higher priority for recruiter audience (most common use case)
    if (request.targetAudience === 'recruiter') {
      priority += 15;
    }

    return priority;
  }

  /**
   * Utility method to chunk array for parallel processing
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
