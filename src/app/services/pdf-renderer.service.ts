import { Injectable, inject, signal, computed } from '@angular/core';
import jsPDF from 'jspdf';
import { PDFTemplate } from './pdf-template.service';
import { ProcessedPDFData, ProcessedPersonalInfo, ProcessedExperience, ProcessedProject, ProcessedSkillData } from './pdf-data-processor.service';
import { PDFFontManagerService } from './pdf-font-manager.service';
import { ColorManager } from './color-manager.service';
import { LayoutManager } from './layout-manager.service';
import { GlassEffectsRenderer } from './glass-effects-renderer.service';
import { HeaderSectionRenderer } from './renderers/header-section-renderer.service';
import { SidebarCardRenderer } from './renderers/sidebar-card-renderer.service';
import { ExperienceCardRenderer } from './renderers/experience-card-renderer.service';
import { ProjectCardRenderer } from './renderers/project-card-renderer.service';

import { PDFBackgroundRendererService } from './pdf-background-renderer.service';


/**
 * Advanced PDF Rendering Configuration
 */
export interface PDFRenderingOptions {
  // Quality settings
  dpi: number;
  quality: number;
  compression: 'none' | 'fast' | 'slow';

  // Performance settings
  enableProgressiveRendering: boolean;
  maxRenderTime: number; // milliseconds
  memoryOptimization: boolean;

  // Output settings
  colorProfile: 'sRGB' | 'CMYK' | 'RGB';
  pdfVersion: '1.4' | '1.5' | '1.6' | '1.7';
  compliance: 'none' | 'PDF/A-1' | 'PDF/A-2' | 'PDF/A-3';

  // Visual settings
  antiAliasing: boolean;
  fontEmbedding: boolean;
  vectorGraphics: boolean;

	  // Content display toggles
	  includeExperienceDescriptions?: boolean;
	  includeProjectDescriptions?: boolean;


  // Layout variants
  experienceLayout?: 'stacked' | 'two-column';

}

/**
 * Rendering Performance Metrics
 */
export interface RenderingMetrics {
  totalRenderTime: number;
  sectionRenderTimes: Record<string, number>;
  memoryUsage: number;
  canvasOperations: number;
  pdfSize: number;
  qualityScore: number;
}

/**
 * Font Configuration for PDF Rendering
 */
export interface PDFFontConfig {
  primary: {
    family: string;
    weights: number[];
    fallback: string[];
  };
  secondary: {
    family: string;
    weights: number[];
    fallback: string[];
  };
  monospace: {
    family: string;
    weights: number[];
    fallback: string[];
  };
}

/**
 * Advanced Canvas Rendering Context
 */
export interface CanvasRenderingContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;
  width: number;
  height: number;
}


/**
 * Advanced PDF Rendering Service
 *
 * Transforms processed CV data into high-quality PDF output using sophisticated
 * rendering techniques including glass-morphism effects, vector graphics,
 * and performance optimizations.
 */
@Injectable({
  providedIn: 'root'
})
export class PDFRendererService {
  private fontManager = inject(PDFFontManagerService);

  // Rendering state management
  private readonly _isRendering = signal<boolean>(false);
  private readonly _renderingProgress = signal<number>(0);
  private readonly _renderingMetrics = signal<RenderingMetrics | null>(null);

  // Performance tracking
  private currentSectionRenderTimes: Record<string, number> = {};
  private currentCanvasOperations = 0;

  // Public readonly signals
  readonly isRendering = this._isRendering.asReadonly();
  readonly renderingProgress = this._renderingProgress.asReadonly();
  readonly renderingMetrics = this._renderingMetrics.asReadonly();

  // Computed rendering status
  readonly renderingStatus = computed(() => {
    const isRendering = this._isRendering();
    const progress = this._renderingProgress();

    if (!isRendering) return 'idle';
    if (progress < 25) return 'initializing';
    if (progress < 50) return 'processing';
    if (progress < 75) return 'rendering';
    if (progress < 100) return 'finalizing';
    return 'complete';
  });

  // Default rendering options
  private readonly defaultRenderingOptions: PDFRenderingOptions = {
    dpi: 300,
    quality: 0.95,
    compression: 'slow',
    enableProgressiveRendering: true,
    maxRenderTime: 30000, // 30 seconds
    memoryOptimization: true,
    colorProfile: 'sRGB',
    pdfVersion: '1.7',
    compliance: 'PDF/A-2',
    antiAliasing: true,
    fontEmbedding: true,
    vectorGraphics: true
  };

  // Font configuration optimized for professional CVs with jsPDF-compatible fonts
  private readonly fontConfig: PDFFontConfig = {
    primary: {
      family: 'helvetica', // Use jsPDF built-in font directly
      weights: [400, 500, 600, 700],
      fallback: ['times', 'courier']
    },
    secondary: {
      family: 'helvetica', // Use jsPDF built-in font directly
      weights: [400, 500],
      fallback: ['times', 'courier']
    },
    monospace: {
      family: 'courier', // Use jsPDF built-in monospace font directly
      weights: [400, 500],
      fallback: ['helvetica', 'times']
    }
  };

  /**
   * Main rendering method - generates high-quality PDF from processed data
   */
  async renderPDF(
    processedData: ProcessedPDFData,
    template: PDFTemplate,
    options: Partial<PDFRenderingOptions> = {}
  ): Promise<Blob> {
    console.log('PDF Renderer received data:', processedData);
    console.log('PDF Renderer using template:', template);
    const renderingOptions = { ...this.defaultRenderingOptions, ...options };
    const startTime = performance.now();

    try {
      this._isRendering.set(true);
      this._renderingProgress.set(0);

      // Reset performance tracking
      this.currentSectionRenderTimes = {};
      this.currentCanvasOperations = 0;

      // Initialize PDF document
      const pdf = this.initializePDF(template, renderingOptions);
      this._renderingProgress.set(10);

      // Setup rendering context
      const renderingContext = await this.setupRenderingContext(template, renderingOptions);
      this._renderingProgress.set(20);

      // Render advanced layered background (glass-friendly, PDF-safe)
      try {
        const bgRenderer = new PDFBackgroundRendererService();
        this.currentCanvasOperations += await bgRenderer.renderLayeredBackground(
          pdf,
          template,
          renderingContext,
          template.rendering?.background ?? {
            enablePattern: true,
            enableLighting: true,
            enableVignette: true,
            patternOpacity: 0.05,
            lightingOpacity: 0.12,
            vignetteOpacity: 0.06,
          }
        );
      } catch (e) {
        console.warn('[PDFRenderer] Background rendering skipped due to error:', e);
      }

      // Render sections progressively
      await this.renderSections(pdf, processedData, template, renderingContext, renderingOptions);
      this._renderingProgress.set(80);

      // Apply final optimizations
      await this.applyFinalOptimizations(pdf, renderingOptions);
      this._renderingProgress.set(90);

      // Generate final PDF blob
      const pdfBlob = this.generatePDFBlob(pdf, renderingOptions);
      this._renderingProgress.set(100);

      // Calculate and store metrics
      const metrics = this.calculateRenderingMetrics(startTime, pdfBlob, renderingContext);
      this._renderingMetrics.set(metrics);

      return pdfBlob;

    } catch (error) {
      console.error('PDF rendering failed:', error);
      throw new Error(`PDF rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Mark rendering complete; keep progress at 100 so callers can observe completion
      this._isRendering.set(false);
    }
  }

  /**
   * Initialize PDF document with optimal settings
   */
  private initializePDF(template: PDFTemplate, options: PDFRenderingOptions): jsPDF {
    // Use global jsPDF spy if available (for tests), otherwise fall back to module import
    const JsPdfCtor: any = (typeof window !== 'undefined' && (window as any).jsPDF)
      ? (window as any).jsPDF
      : jsPDF;

    const pdf = new JsPdfCtor({
      orientation: template.layout.orientation,
      unit: 'mm',
      format: template.layout.format,
      compress: options.compression !== 'none',
      precision: 16,
      userUnit: 1.0
    });

    // Set document properties
    this.setDocumentProperties(pdf, template);

    // Set background color based on template
    const __layout = new LayoutManager(template.layout);
    const { width: pageWidth, height: pageHeight } = __layout.getPageRect();

    // Use template's background color
    const bgColor = ColorManager.parseHex(template.colorScheme.background);
    pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Configure PDF settings
    // Ensure fonts are available; fall back to built-ins if custom fonts not registered
    this.resolveAndApplyFontFallbacks(pdf);

    this.configurePDFSettings(pdf, options);

    return pdf;
  }

  /**
   * Set document metadata and properties
   */
  private setDocumentProperties(pdf: jsPDF, template: PDFTemplate): void {
    const props = {
      title: 'Professional CV - Lubomir Dobrovodsky',
      subject: 'Curriculum Vitae',
      author: 'Lubomir Dobrovodsky',
      creator: 'Ultimate PDF Generation System',
      keywords: 'CV, Resume, Software Engineer, Full Stack Developer'
    };

    const anyPdf = pdf as any;
    if (typeof anyPdf.setProperties === 'function') {
      anyPdf.setProperties(props);
    } else if (typeof anyPdf.setDocProps === 'function') {
      anyPdf.setDocProps(props);
    } else if (typeof anyPdf.addMetadata === 'function') {
      anyPdf.addMetadata(props);
    } else {
      // No-op if metadata API not available (test spies may not implement it)
    }
  }

  /**
   * Configure PDF-specific settings for optimal output
   */
  private configurePDFSettings(pdf: jsPDF, options: PDFRenderingOptions): void {
    try {
      // Set PDF version if supported
      if (options.pdfVersion && (pdf as any).setPDFVersion) {
        (pdf as any).setPDFVersion(options.pdfVersion);
      }

      // Configure compression settings
      if (options.compression !== 'none') {
        // Compression is handled in jsPDF constructor, but we can set additional options
        if ((pdf as any).setCompression) {
          const compressionLevel = options.compression === 'fast' ? 1 : 9;
          (pdf as any).setCompression(compressionLevel);
        }
      }

      // Configure font embedding
      if (options.fontEmbedding && (pdf as any).setFontEmbedding) {
        (pdf as any).setFontEmbedding(true);
      }

      // Set color profile preferences
      if (options.colorProfile && (pdf as any).setColorProfile) {
        (pdf as any).setColorProfile(options.colorProfile);
      }

      // Configure anti-aliasing for text rendering
      if (options.antiAliasing && (pdf as any).setTextRenderingMode) {
        (pdf as any).setTextRenderingMode('auto');
      }

      // Set DPI-related scaling if supported
      if (options.dpi !== 96 && (pdf as any).setDPI) {
        (pdf as any).setDPI(options.dpi);
      }

      console.log(`[PDFRenderer] Configured PDF settings: version=${options.pdfVersion}, compression=${options.compression}, dpi=${options.dpi}`);
    } catch (error) {
      console.warn('[PDFRenderer] Some PDF settings could not be applied:', error);
      // Continue rendering even if some advanced settings fail
    }
  }

  /**
   * Configure fonts for PDF rendering using the font manager.
   */
  private resolveAndApplyFontFallbacks(pdf: jsPDF): void {
    this.fontManager.configurePDFFonts(pdf);
  }

  /**
   * Apply font using the font manager with proper fallback handling
   */
  private applyFont(pdf: jsPDF, purpose: 'primary' | 'secondary' | 'monospace' | 'heading' | 'body', style: 'normal' | 'bold' | 'italic' = 'normal'): void {
    this.fontManager.applyFont(pdf, purpose, style);
  }

  /**
   * Get recommended font sizes from the font manager
   */
  private getFontSizes() {
    return this.fontManager.getRecommendedFontSizes();
  }


  /**
   * Apply tracking (letter spacing) if supported by jsPDF
   */
  private applyTracking(pdf: jsPDF, kind: 'heading' | 'body' | 'small', fontSize: number): void {
    const t = this.fontManager.getTypographyScale().tracking;
    const em = kind === 'heading' ? t.heading : kind === 'small' ? t.small : t.body;
    const setCharSpace = (pdf as any).setCharSpace;
    if (typeof setCharSpace === 'function' && Math.abs(em) > 1e-4) {
      // Conservative conversion from em to jsPDF char space units
      setCharSpace.call(pdf, em * fontSize * 0.02);
    }
  }

  /**
   * Get glass-aware text color for better readability over elevated glass backgrounds
   */
  private getGlassAwareTextColor(hex: string, elevation: number): { r: number; g: number; b: number } {
    return ColorManager.enhanceContrastForGlass(hex, elevation);
  }

  /**
   * Add a new page and immediately paint the background so every page is consistent.
   */
  private async addPageWithBackground(pdf: jsPDF, template: PDFTemplate, renderingContext: CanvasRenderingContext): Promise<void> {
    pdf.addPage();
    // Base solid fill
    const lm = new LayoutManager(template.layout);
    const { width: pw, height: ph } = lm.getPageRect();
    const bg = ColorManager.parseHex(template.colorScheme.background);
    pdf.setFillColor(bg.r, bg.g, bg.b);
    pdf.rect(0, 0, pw, ph, 'F');

    // Layered background (pattern + lighting + vignette)
    try {
      const bgRenderer = new PDFBackgroundRendererService();
      this.currentCanvasOperations += await bgRenderer.renderLayeredBackground(
        pdf,
        template,
        renderingContext,
        template.rendering?.background ?? {
          enablePattern: true,
          enableLighting: true,
          enableVignette: true,
          patternOpacity: 0.05,
          lightingOpacity: 0.12,
          vignetteOpacity: 0.06,
        }
      );
    } catch (e) {
      console.warn('[PDFRenderer] Background rendering for new page skipped due to error:', e);
    }
  }


  /**
   * Setup advanced rendering context with canvas optimization
   */
  private async setupRenderingContext(
    template: PDFTemplate,
    options: PDFRenderingOptions
  ): Promise<CanvasRenderingContext> {
    try {
      const scale = options.dpi / 96; // Convert DPI to scale factor
      const _layout = new LayoutManager(template.layout);
      const _page = _layout.getPageRect();

      // Convert mm to pixels at target DPI
      const pixelWidth = Math.round(_layout.mmToPx(_page.width, options.dpi));
      const pixelHeight = Math.round(_layout.mmToPx(_page.height, options.dpi));

      // Validate canvas dimensions
      if (pixelWidth <= 0 || pixelHeight <= 0) {
        throw new Error(`Invalid canvas dimensions: ${pixelWidth}x${pixelHeight}`);
      }

      if (pixelWidth > 32767 || pixelHeight > 32767) {
        throw new Error(`Canvas dimensions too large: ${pixelWidth}x${pixelHeight}. Maximum is 32767x32767`);
      }

      // Create high-resolution canvas
      const canvas = document.createElement('canvas');

      try {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      } catch (error) {
        throw new Error(`Failed to set canvas dimensions: ${error}`);
      }

      const ctx = canvas.getContext('2d', {
        alpha: true,
        desynchronized: false,
        colorSpace: 'srgb'
      });

      if (!ctx) {
        throw new Error('Failed to create canvas rendering context - browser may not support 2D canvas');
      }

      // Configure canvas for high-quality rendering
      this.configureCanvasContext(ctx, options);

      console.log(`[PDFRenderer] Created canvas context: ${pixelWidth}x${pixelHeight} at ${options.dpi}DPI`);

      return {
        canvas,
        ctx,
        scale,
        width: pixelWidth,
        height: pixelHeight
      };
    } catch (error) {
      console.error('[PDFRenderer] Failed to setup rendering context:', error);
      throw new Error(`Canvas setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Configure canvas context for optimal rendering quality
   */
  private configureCanvasContext(ctx: CanvasRenderingContext2D, options: PDFRenderingOptions): void {
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = options.antiAliasing;
    ctx.imageSmoothingQuality = 'high';

    // Set text rendering quality
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    // Configure line rendering
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set default styles
    ctx.fillStyle = ColorManager.rgbaFromHex('#ffffff', 1);
    ctx.strokeStyle = ColorManager.rgbaFromHex('#000000', 1);
    ctx.lineWidth = 1;
  }

  /**
   * Render all sections progressively with performance monitoring
   */
  private async renderSections(
    pdf: jsPDF,
    processedData: ProcessedPDFData,
    template: PDFTemplate,
    renderingContext: CanvasRenderingContext,
    options: PDFRenderingOptions
  ): Promise<void> {
    let currentY = template.layout.margins.top;

    // Track which core sections were rendered by template
    const renderedFlags = {
      header: false,
      personal: false,
      experience: false,
      skills: false,
      projects: false,
    };

    // Render sections in order defined by template
    console.log('Template sections:', template.sections);
    console.log('Processed data summary:', {
      personalInfo: !!processedData.personalInfo,
      experiences: processedData.experiences?.length || 0,
      projects: processedData.projects?.length || 0,
      skills: !!processedData.skills
    });

    for (const sectionConfig of template.sections) {
      console.log('Rendering section:', sectionConfig.id);
      const sectionStartTime = performance.now();

      switch (sectionConfig.id) {
        case 'header':
        case 'hero-section':
        case 'hero':
          renderedFlags.header = true;
          currentY = await this.renderHeaderSection(
            pdf, processedData.personalInfo, template, renderingContext, currentY, options
          );
          break;

        case 'personal-info-section':
          renderedFlags.personal = true;
          currentY = await this.renderPersonalInfoSection(
            pdf, processedData.personalInfo, template, renderingContext, currentY, options
          );
          break;

        case 'experience':
        case 'experience-section':
          renderedFlags.experience = true;
          currentY = await this.renderExperienceSection(
            pdf, processedData.experiences, template, renderingContext, currentY, options
          );
          break;

        case 'skills':
        case 'skills-section':
          renderedFlags.skills = true;
          currentY = await this.renderSkillsSection(
            pdf, processedData.skills, template, renderingContext, currentY, options
          );
          break;

        case 'projects':
        case 'projects-section':
          renderedFlags.projects = true;
          currentY = await this.renderProjectsSection(
            pdf, processedData.projects, template, renderingContext, currentY, options
          );
          break;

        default:
          console.warn(`Unknown section: ${sectionConfig.id}`);
      }

      const sectionRenderTime = performance.now() - sectionStartTime;
      this.currentSectionRenderTimes[sectionConfig.id] = sectionRenderTime;

      // Update progress
      const progress = 20 + (template.sections.indexOf(sectionConfig) / template.sections.length) * 60;
      this._renderingProgress.set(progress);

      // Check for page break
      if (currentY > new LayoutManager(template.layout).getPageRect().height - template.layout.margins.bottom) {
        await this.addPageWithBackground(pdf, template, renderingContext);
        currentY = template.layout.margins.top;
      }
    }

    // Fallback: render core sections if not present in template (keeps legacy behavior and tests)
    if (!renderedFlags.experience && processedData.experiences && processedData.experiences.length > 0) {
      currentY = await this.renderExperienceSection(
        pdf, processedData.experiences, template, renderingContext, currentY, options
      );
      if (currentY > new LayoutManager(template.layout).getPageRect().height - template.layout.margins.bottom) {
        await this.addPageWithBackground(pdf, template, renderingContext);
        currentY = template.layout.margins.top;
      }
    }

    if (!renderedFlags.skills && processedData.skills) {
      currentY = await this.renderSkillsSection(
        pdf, processedData.skills, template, renderingContext, currentY, options
      );
      if (currentY > new LayoutManager(template.layout).getPageRect().height - template.layout.margins.bottom) {
        await this.addPageWithBackground(pdf, template, renderingContext);
        currentY = template.layout.margins.top;
      }
    }

    if (!renderedFlags.projects && processedData.projects && processedData.projects.length > 0) {
      currentY = await this.renderProjectsSection(
        pdf, processedData.projects, template, renderingContext, currentY, options
      );
      if (currentY > new LayoutManager(template.layout).getPageRect().height - template.layout.margins.bottom) {
        await this.addPageWithBackground(pdf, template, renderingContext);
        currentY = template.layout.margins.top;
      }
    }
  }

  /**
   * Render header section with glass-morphism effects
   */
  private async renderHeaderSection(
    pdf: jsPDF,
    personalInfo: ProcessedPersonalInfo,
    template: PDFTemplate,
    renderingContext: CanvasRenderingContext,
    startY: number,
    options: PDFRenderingOptions
  ): Promise<number> {
    const { ctx, canvas } = renderingContext;
    const __layoutHdr = new LayoutManager(template.layout);
    const { width: pageWidth } = __layoutHdr.getPageRect();
    const contentWidth = __layoutHdr.getContentRect().width;

    // Clear canvas for this section
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.currentCanvasOperations++;

    // Render glass-morphism hero background via section renderer
    const headerRenderer = new HeaderSectionRenderer();
    this.currentCanvasOperations += (await headerRenderer.renderHeader(pdf, template, undefined as any, renderingContext)) || 0;

    // Convert canvas to image and add to PDF
    const heroHeight = 60; // mm - height of hero section
    new GlassEffectsRenderer().canvasToPdf(pdf, canvas, 0, startY, pageWidth, heroHeight);
    this.currentCanvasOperations += 2; // toDataURL + addImage

    let currentY = startY + 10;

    // Render name with large, bold typography
    currentY = this.renderName(pdf, personalInfo.displayName, template, currentY);

    // Render title/position
    currentY = this.renderTitle(pdf, personalInfo.displayTitle, template, currentY);

    // Render contact information in elegant layout
    currentY = this.renderContactInfo(pdf, personalInfo, template, currentY);

    // Render key technologies as elegant badges
    if (personalInfo.keyTechnologies.length > 0) {
      currentY = await this.renderTechnologyBadges(pdf, personalInfo.keyTechnologies, template, currentY);
    }

    // Render professional summary
    if (personalInfo.displaySummary) {
      currentY = this.renderSummary(pdf, personalInfo.displaySummary, template, currentY);
    }

    return currentY + 15; // Add spacing after header
  }



  /**
   * Render name with sophisticated typography
   */
  private renderName(pdf: jsPDF, name: string, template: PDFTemplate, y: number): number {
    const fontSizes = this.getFontSizes();

    this.applyFont(pdf, 'heading', 'bold');
    pdf.setFontSize(fontSizes.name);

    // Glass-aware text color for hero overlay (elev 3)
    const c = this.getGlassAwareTextColor(template.colorScheme.text, 3);
    pdf.setTextColor(c.r, c.g, c.b);

    this.applyTracking(pdf, 'heading', fontSizes.name);

    const x = template.layout.margins.left;
    pdf.text(name, x, y);

    const scale = this.fontManager.getTypographyScale();
    return y + fontSizes.name * 0.4 * (scale.lineHeights.heading / 1.2);
  }

  /**
   * Render professional title
   */
  private renderTitle(pdf: jsPDF, title: string, template: PDFTemplate, y: number): number {
    const fontSizes = this.getFontSizes();

    this.applyFont(pdf, 'primary', 'normal');
    pdf.setFontSize(fontSizes.title);

    // Glass-aware secondary text over hero (elev 3)
    const c = this.getGlassAwareTextColor(template.colorScheme.textSecondary, 3);
    pdf.setTextColor(c.r, c.g, c.b);

    this.applyTracking(pdf, 'body', fontSizes.title);

    const x = template.layout.margins.left;
    pdf.text(title, x, y);

    const scale = this.fontManager.getTypographyScale();
    return y + fontSizes.title * 0.4 * (scale.lineHeights.body / 1.2) + 5;
  }

  /**
   * Render contact information in elegant layout
   */
  private renderContactInfo(pdf: jsPDF, personalInfo: ProcessedPersonalInfo, template: PDFTemplate, y: number): number {
    const fontSize = 10;
    const lineHeight = fontSize * 0.4;

    this.applyFont(pdf, 'secondary', 'normal');
    pdf.setFontSize(fontSize);

    // Use template-specific secondary text color
    const textColor = ColorManager.parseHex(template.colorScheme.textSecondary);
    pdf.setTextColor(textColor.r, textColor.g, textColor.b);

    const x = template.layout.margins.left;
    let currentY = y;

    // Email
    if (personalInfo.primaryContact.email) {
      pdf.text(`Email: ${personalInfo.primaryContact.email}`, x, currentY);
      currentY += lineHeight;
    }

    // Phone
    if (personalInfo.primaryContact.phone) {
      pdf.text(`Phone: ${personalInfo.primaryContact.phone}`, x, currentY);
      currentY += lineHeight;
    }

    // Location
    if (personalInfo.primaryContact.location) {
      pdf.text(`Location: ${personalInfo.primaryContact.location}`, x, currentY);
      currentY += lineHeight;
    }

    // Professional links
    if (personalInfo.professionalLinks.linkedin) {
      pdf.text(`LinkedIn: ${personalInfo.professionalLinks.linkedin}`, x, currentY);
      currentY += lineHeight;
    }

    if (personalInfo.professionalLinks.github) {
      pdf.text(`GitHub: ${personalInfo.professionalLinks.github}`, x, currentY);
      currentY += lineHeight;
    }

    return currentY + 5; // Add spacing
  }

  /**
   * Render technology badges in elegant layout
   */
  private async renderTechnologyBadges(pdf: jsPDF, technologies: string[], template: PDFTemplate, y: number): Promise<number> {
    const fontSize = 9;
    const badgeHeight = 6;
    const badgeSpacing = 2;
    const lineSpacing = 8;

    this.applyFont(pdf, 'secondary', 'normal');
    pdf.setFontSize(fontSize);

    const x = template.layout.margins.left;
    const contentWidth = new LayoutManager(template.layout).getContentRect().width;

    let currentX = x;
    let currentY = y;

    const rasterize = !!(template as any).rendering?.rasterizeTechBadges;

    for (const tech of technologies) {
      const textWidth = typeof (pdf as any).getTextWidth === 'function' ? (pdf as any).getTextWidth(tech) : (tech?.length || 0) * 2;
      const badgeWidth = textWidth + 4; // Padding

      // Check if badge fits on current line
      if (currentX + badgeWidth > x + contentWidth) {
        currentX = x;
        currentY += lineSpacing;
      }

      let renderedViaRaster = false;
      if (rasterize) {
        try {
          const slug = tech.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const byDataAttr = document.querySelector(`[data-tech-badge="${tech}"]`) as HTMLElement | null;
          const byId = document.getElementById(`tech-badge-${slug}`) as HTMLElement | null;
          const el = byDataAttr || byId;
          if (el) {
            const ops = await new GlassEffectsRenderer().renderDomElementToPdf(
              pdf,
              el,
              currentX,
              currentY - 2,
              badgeWidth,
              badgeHeight,
              { cacheKey: `tech-badge:${tech}:v1`, scale: 2, backgroundColor: null, useCORS: true }
            );
            this.currentCanvasOperations += ops || 0;
            renderedViaRaster = true;
          }
        } catch (_e) {
          // Fallback to vector rendering below
          renderedViaRaster = false;
        }
      }

      if (!renderedViaRaster) {
        // Vector badge background + text (current behavior)
        const __accent = ColorManager.parseHex(template.colorScheme.accent);
        pdf.setFillColor(__accent.r, __accent.g, __accent.b);
        pdf.setDrawColor(__accent.r, __accent.g, __accent.b);
        { const chipR = new LayoutManager(template.layout).getRadius('chip'); pdf.roundedRect(currentX, currentY - 2, badgeWidth, badgeHeight, chipR, chipR, 'FD'); }

        pdf.setTextColor(255, 255, 255); // White text
        pdf.text(tech, currentX + 2, currentY);
      }

      currentX += badgeWidth + badgeSpacing;
    }

    return currentY + lineSpacing;
  }

  /**
   * Render professional summary with optimal typography
   */
  private renderSummary(pdf: jsPDF, summary: string, template: PDFTemplate, y: number): number {
    const fontSize = 11;
    const scale = this.fontManager.getTypographyScale();
    const lineHeight = fontSize * 0.5 * (scale.lineHeights.body / 1.2);

    this.applyFont(pdf, 'primary', 'normal');
    pdf.setFontSize(fontSize);

    // Glass-aware body text over glass (elev 2)
    const c = this.getGlassAwareTextColor(template.colorScheme.text, 2);
    pdf.setTextColor(c.r, c.g, c.b);
    this.applyTracking(pdf, 'body', fontSize);

    const x = template.layout.margins.left;
    const contentWidth = new LayoutManager(template.layout).getContentRect().width;

    // Split text into lines that fit within content width
    const lines = pdf.splitTextToSize(summary, contentWidth);

    let currentY = y;
    lines.forEach((line: string) => {
      pdf.text(line, x, currentY);
      currentY += lineHeight;
    });

    return currentY + 5; // Add spacing
  }

  /**
   * Render personal info section (for glass-morphism template)
   */
  private async renderPersonalInfoSection(
    pdf: jsPDF,
    personalInfo: ProcessedPersonalInfo,
    template: PDFTemplate,
    renderingContext: CanvasRenderingContext,
    startY: number,
    options: PDFRenderingOptions
  ): Promise<number> {
    const { ctx, canvas } = renderingContext;
    let currentY = startY;

    // Calculate section dimensions via Precision Grid (align to 16-col grid)
    const lm = new LayoutManager(template.layout);
    const spec = lm.getGridSpec({ columns: 16 });
    const desiredWidthMm = lm.getPageRect().width * 0.35; // preserve intent (~35% of page width)
    let bestSpan = 1;
    let minDelta = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= spec.columns; span++) {
      const w = span * spec.columnWidthMm + (span - 1) * spec.gutterMm;
      const d = Math.abs(w - desiredWidthMm);
      if (d < minDelta) { minDelta = d; bestSpan = span; }
    }
    const sidebarRect = lm.getGridRectBySpan(1, bestSpan);
    const sectionX = sidebarRect.x;
    const sectionWidth = desiredWidthMm; // preserve exact previous width while mapping to grid
    const sectionHeight = 80; // mm

    // Clear canvas and render glass card background via section renderer
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sidebarRenderer = new SidebarCardRenderer();
    this.currentCanvasOperations += (await sidebarRenderer.renderSidebarCard(pdf, template, undefined as any, renderingContext, sectionX, currentY, sectionWidth, sectionHeight)) || 0;

    // Convert canvas to image and add to PDF
    new GlassEffectsRenderer().canvasToPdf(pdf, canvas, sectionX, currentY, sectionWidth, sectionHeight);

    // Section header
    currentY = this.renderSectionHeader(pdf, 'Contact', template, currentY + 5, sectionX);

    // Contact information
    if (personalInfo.email) {
      currentY = this.renderContactItem(pdf, 'Email', personalInfo.email, template, currentY);
    }

    if (personalInfo.phone) {
      currentY = this.renderContactItem(pdf, 'Phone', personalInfo.phone, template, currentY);
    }

    if (personalInfo.location) {
      currentY = this.renderContactItem(pdf, 'Location', personalInfo.location, template, currentY);
    }

    if (personalInfo.website) {
      currentY = this.renderContactItem(pdf, 'Website', personalInfo.website, template, currentY);
    }

    return currentY + 10; // Add spacing
  }

  /**
   * Render a contact item
   */
  private renderContactItem(pdf: jsPDF, label: string, value: string, template: PDFTemplate, y: number): number {
    const fontSize = 10;
    const x = template.layout.margins.left;

    // Label
    this.applyFont(pdf, 'primary', 'bold');
    pdf.setFontSize(fontSize);
    { const c = ColorManager.parseHex(template.colorScheme.textSecondary); pdf.setTextColor(c.r, c.g, c.b); }
    pdf.text(label + ':', x, y);

    // Value
    this.applyFont(pdf, 'primary', 'normal');
    { const c = ColorManager.parseHex(template.colorScheme.text); pdf.setTextColor(c.r, c.g, c.b); }
    const labelWidth = typeof (pdf as any).getTextWidth === 'function'
      ? (pdf as any).getTextWidth(label + ': ')
      : (label.length + 1) * 2;
    pdf.text(value, x + labelWidth + 2, y);

    return y + fontSize * 0.6 + 3; // Line height + spacing
  }

  /**
   * Render experience section with glass cards
   */
  private async renderExperienceSection(
    pdf: jsPDF,
    experiences: ProcessedExperience[],
    template: PDFTemplate,
    renderingContext: CanvasRenderingContext,
    startY: number,
    options: PDFRenderingOptions
  ): Promise<number> {
    let currentY = startY;
    // Align Experience section header to main grid area and set gutter
    const lmMain = new LayoutManager(template.layout);
    const specMain = lmMain.getGridSpec({ columns: 16 });
    const desiredSidebarWidthMmMain = lmMain.getPageRect().width * 0.35;
    let bestSidebarSpanMain = 1;
    let minDeltaMain = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= specMain.columns; span++) {
      const w = span * specMain.columnWidthMm + (span - 1) * specMain.gutterMm;
      const d = Math.abs(w - desiredSidebarWidthMmMain);
      if (d < minDeltaMain) { minDeltaMain = d; bestSidebarSpanMain = span; }
    }
    const mainRectMain = lmMain.getGridRectBySpan(bestSidebarSpanMain + 1, specMain.columns - bestSidebarSpanMain);
    const gutterExp = lmMain.getGutterForElevationMm(2);

    // Section header (aligned to main grid x)
    currentY = this.renderSectionHeader(pdf, 'Experience', template, currentY, mainRectMain.x);

    // Page height limit for breaks
    const pageRect = new LayoutManager(template.layout).getPageRect();
    const limitY = pageRect.height - template.layout.margins.bottom - 5;

    // Render experiences based on selected layout
    if (options.experienceLayout === 'two-column') {
      const columnGutter = lmMain.getGutterForElevationMm(2);
      const columnWidth = (mainRectMain.width - columnGutter) / 2;
      const leftX = mainRectMain.x;
      const rightX = mainRectMain.x + columnWidth + columnGutter;

      let yLeft = currentY;
      let yRight = currentY;

      for (const exp of experiences) {
        // pick the shorter column
        const useLeft = yLeft <= yRight;
        const xCol = useLeft ? leftX : rightX;
        let yCol = useLeft ? yLeft : yRight;

        // Preflight: estimate height and break if the active column can't fit
        const requiredHeight = this.estimateExperienceItemHeight(pdf, exp, template, options, columnWidth);
        if (yCol + requiredHeight > limitY) {
          await this.addPageWithBackground(pdf, template, renderingContext);
          const newTop = this.renderSectionHeader(pdf, 'Experience', template, template.layout.margins.top, mainRectMain.x);
          yLeft = newTop;
          yRight = newTop;
          yCol = useLeft ? yLeft : yRight;
        }

        const yStart = useLeft ? yLeft : yRight;

        // Render item with override rect
        const yAfter = await this.renderExperienceItem(
          pdf, exp, template, renderingContext, yStart, options, { x: xCol, width: columnWidth }
        );

        if (useLeft) {
          yLeft = yAfter + gutterExp;
        } else {
          yRight = yAfter + gutterExp;
        }

        // Extra safety: if both columns exhausted, force break
        if (yLeft > limitY && yRight > limitY) {
          await this.addPageWithBackground(pdf, template, renderingContext);
          const newTop = this.renderSectionHeader(pdf, 'Experience', template, template.layout.margins.top, mainRectMain.x);
          yLeft = newTop;
          yRight = newTop;
        }
      }

      currentY = Math.max(yLeft, yRight);
    } else {
      // Default stacked layout (legacy)
      for (const experience of experiences) {
        // Preflight: break before drawing if item doesn't fit the remaining space
        const requiredHeight = this.estimateExperienceItemHeight(pdf, experience, template, options, mainRectMain.width);
        if (currentY + requiredHeight > limitY) {
          await this.addPageWithBackground(pdf, template, renderingContext);
          currentY = this.renderSectionHeader(pdf, 'Experience', template, template.layout.margins.top, mainRectMain.x);
        }

        currentY = await this.renderExperienceItem(pdf, experience, template, renderingContext, currentY, options);
        currentY += gutterExp; // Grid gutter spacing (elev 2)
      }
    }

    return currentY;
  }

  /**
   * Render skills section with multiple display modes and glass effects
   */
  private async renderSkillsSection(
    pdf: jsPDF,
    skills: ProcessedSkillData,
    template: PDFTemplate,
    renderingContext: CanvasRenderingContext,
    startY: number,
    options: PDFRenderingOptions
  ): Promise<number> {
    const { ctx, canvas } = renderingContext;
    let currentY = startY;

    // Calculate section dimensions via Precision Grid (align to 16-col grid)
    const lm2 = new LayoutManager(template.layout);
    const spec2 = lm2.getGridSpec({ columns: 16 });
    const desiredWidthMm2 = lm2.getPageRect().width * 0.35;
    let bestSpan2 = 1;
    let minDelta2 = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= spec2.columns; span++) {
      const w = span * spec2.columnWidthMm + (span - 1) * spec2.gutterMm;
      const d = Math.abs(w - desiredWidthMm2);
      if (d < minDelta2) { minDelta2 = d; bestSpan2 = span; }
    }
    const sidebarRect2 = lm2.getGridRectBySpan(1, bestSpan2);
    const sectionX = sidebarRect2.x;
    const sectionWidth = desiredWidthMm2; // preserve exact previous width while mapping to grid
    const sectionHeight = 60; // mm

    // Clear canvas and render glass card background via section renderer
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sidebarRenderer2 = new SidebarCardRenderer();
    this.currentCanvasOperations += (await sidebarRenderer2.renderSidebarCard(pdf, template, undefined as any, renderingContext, sectionX, currentY, sectionWidth, sectionHeight)) || 0;

    // Convert canvas to image and add to PDF
    new GlassEffectsRenderer().canvasToPdf(pdf, canvas, sectionX, currentY, sectionWidth, sectionHeight);

    // Section header
    // Align Skills section header to main grid x
    const lmSkillsMain = new LayoutManager(template.layout);
    const specSkillsMain = lmSkillsMain.getGridSpec({ columns: 16 });
    const desiredSidebarWidthMmSkills = lmSkillsMain.getPageRect().width * 0.35;
    let bestSidebarSpanSkills = 1;
    let minDeltaSkills = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= specSkillsMain.columns; span++) {
      const w = span * specSkillsMain.columnWidthMm + (span - 1) * specSkillsMain.gutterMm;
      const d = Math.abs(w - desiredSidebarWidthMmSkills);
      if (d < minDeltaSkills) { minDeltaSkills = d; bestSidebarSpanSkills = span; }
    }
    const mainRectSkills = lmSkillsMain.getGridRectBySpan(bestSidebarSpanSkills + 1, specSkillsMain.columns - bestSidebarSpanSkills);

    currentY = this.renderSectionHeader(pdf, 'Skills', template, currentY + 5, mainRectSkills.x);

    // Render based on recommended display mode
    switch (skills.recommendedDisplayMode) {
      case 'compact':
        currentY = await this.renderCompactSkills(pdf, skills.compact, template, renderingContext, currentY, mainRectSkills.x);
        break;
      case 'detailed':
        currentY = await this.renderDetailedSkills(pdf, skills.detailed, template, renderingContext, currentY, mainRectSkills.x);
        break;
      case 'categorized':
        currentY = await this.renderCategorizedSkills(pdf, skills.categorized, template, renderingContext, currentY, mainRectSkills.x);
        break;
    }

    return currentY;
  }

  /**
   * Render projects section
   */
  private async renderProjectsSection(
    pdf: jsPDF,
    projects: ProcessedProject[],
    template: PDFTemplate,
    renderingContext: CanvasRenderingContext,
    startY: number,
    options: PDFRenderingOptions
  ): Promise<number> {
    let currentY = startY;

    // Align header to main grid x and set gutter
    const lmProjMain = new LayoutManager(template.layout);
    const specProjMain = lmProjMain.getGridSpec({ columns: 16 });
    const desiredSidebarWidthMmProjMain = lmProjMain.getPageRect().width * 0.35;
    let bestSidebarSpanProjMain = 1;
    let minDeltaProjMain = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= specProjMain.columns; span++) {
      const w = span * specProjMain.columnWidthMm + (span - 1) * specProjMain.gutterMm;
      const d = Math.abs(w - desiredSidebarWidthMmProjMain);
      if (d < minDeltaProjMain) { minDeltaProjMain = d; bestSidebarSpanProjMain = span; }
    }
    const mainRectProjMain = lmProjMain.getGridRectBySpan(bestSidebarSpanProjMain + 1, specProjMain.columns - bestSidebarSpanProjMain);
    const gutterProj = lmProjMain.getGutterForElevationMm(1);

    // Section header
    currentY = this.renderSectionHeader(pdf, 'Projects', template, currentY, mainRectProjMain.x);

    const pageRect = new LayoutManager(template.layout).getPageRect();
    const limitY = pageRect.height - template.layout.margins.bottom - 5;

    // Render each project
    for (const project of projects) {
      currentY = await this.renderProjectItem(pdf, project, template, renderingContext, currentY, options);
      currentY += gutterProj; // Grid gutter spacing (elev 1)

      if (currentY > limitY) {
        await this.addPageWithBackground(pdf, template, renderingContext);
        currentY = this.renderSectionHeader(pdf, 'Projects', template, template.layout.margins.top, mainRectProjMain.x);
      }
    }

    return currentY;
  }

  /**
   * Render section header with consistent styling
   */
  private renderSectionHeader(pdf: jsPDF, title: string, template: PDFTemplate, y: number, xOverride?: number): number {
    const fontSizes = this.getFontSizes();
    const accent = ColorManager.parseHex(template.colorScheme.accent);

    // Base X (grid-aligned) and icon chip geometry
    const baseX = (typeof xOverride === 'number') ? xOverride : template.layout.margins.left;
    const iconSize = 6; // mm
    const iconGutter = 2; // mm

    // Draw a small floating glass chip + accent glyph to the left of the header
    try {
      (pdf as any).saveGraphicsState?.();
      // Soft shadow behind chip
      (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.12 }));
      pdf.setFillColor(0, 0, 0);
      pdf.roundedRect(baseX + 0.6, y - (iconSize * 0.8), iconSize, iconSize, 1.8, 1.8, 'F');

      // Glass chip fill
      const chipOpacity = Math.min(1, (template.colorScheme.glass.opacity ?? 0.1) + 0.02);
      (pdf as any).setGState?.(new (pdf as any).GState({ opacity: chipOpacity }));
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(baseX, y - (iconSize * 0.9), iconSize, iconSize, 1.8, 1.8, 'F');

      // Glass chip border
      (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.35 }));
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(baseX, y - (iconSize * 0.9), iconSize, iconSize, 1.8, 1.8, 'S');

      // Accent glyph inside chip (small round rect)
      (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.9 }));
      pdf.setFillColor(accent.r, accent.g, accent.b);
      pdf.roundedRect(baseX + iconSize / 2 - 1, y - (iconSize * 0.9) + iconSize / 2 - 1, 2, 2, 1, 1, 'F');
    } finally {
      (pdf as any).restoreGraphicsState?.();
    }

    // Position text after the icon chip
    const x = baseX + iconSize + iconGutter;

    // Typography and glow
    this.applyFont(pdf, 'heading', 'bold');
    pdf.setFontSize(fontSizes.sectionHeader);
    this.applyTracking(pdf, 'heading', fontSizes.sectionHeader);

    // Soft accent glow behind header text
    try {
      (pdf as any).saveGraphicsState?.();
      (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.18 }));
      pdf.setTextColor(accent.r, accent.g, accent.b);
      pdf.text(title, x, y + 0.4);
    } finally {
      (pdf as any).restoreGraphicsState?.();
    }

    // Main header text with glass-aware color
    const c = this.getGlassAwareTextColor(template.colorScheme.text, 2);
    pdf.setTextColor(c.r, c.g, c.b);
    pdf.text(title, x, y);

    // Gradient-like underline: soft block + crisp highlight line
    const textWidth = typeof (pdf as any).getTextWidth === 'function' ? (pdf as any).getTextWidth(title) : (title?.length || 0) * 2;

    // Soft base
    try {
      (pdf as any).saveGraphicsState?.();
      (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.25 }));
      pdf.setFillColor(accent.r, accent.g, accent.b);
      pdf.rect(x, y + 1.6, textWidth, 0.9, 'F');
    } finally {
      (pdf as any).restoreGraphicsState?.();
    }

    // Crisp top line
    try {
      (pdf as any).saveGraphicsState?.();
      (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.55 }));
      pdf.setDrawColor(accent.r, accent.g, accent.b);
      pdf.setLineWidth(0.5);
      pdf.line(x, y + 2.2, x + textWidth, y + 2.2);
    } finally {
      (pdf as any).restoreGraphicsState?.();
    }

    // Spacing after header (account for icon height as minimum)
    const scale = this.fontManager.getTypographyScale();
    const textBlock = fontSizes.sectionHeader * 0.6 * (scale.lineHeights.heading / 1.2);
    const spacingAfter = Math.max(iconSize, textBlock) + 6;
    return y + spacingAfter;
  }

  /**
   * Apply final optimizations to PDF
   */
  private async applyFinalOptimizations(pdf: jsPDF, options: PDFRenderingOptions): Promise<void> {
    try {
      // Set PDF metadata for compliance
      if (options.compliance !== 'none') {
        this.setPDFCompliance(pdf, options.compliance);
      }

      // Optimize for print if needed
      if (options.colorProfile === 'CMYK') {
        this.convertToCMYK(pdf);
      }

      // Apply image compression optimizations
      await this.optimizeImages(pdf, options);

      // Optimize text rendering
      this.optimizeTextRendering(pdf, options);

      // Apply memory optimizations
      if (options.memoryOptimization) {
        this.applyMemoryOptimizations(pdf);
      }

      // Optimize file size
      this.optimizeFileSize(pdf, options);

      // Set final document properties
      this.setFinalDocumentProperties(pdf, options);

      console.log('[PDFRenderer] Applied final optimizations');
    } catch (error) {
      console.warn('[PDFRenderer] Some optimizations could not be applied:', error);
    }
  }

  /**
   * Optimize images in the PDF
   */
  private async optimizeImages(pdf: jsPDF, options: PDFRenderingOptions): Promise<void> {
    if (options.quality < 1.0 && (pdf as any).setImageQuality) {
      (pdf as any).setImageQuality(options.quality);
    }

    // Apply image compression if supported
    if ((pdf as any).setImageCompression) {
      const compressionLevel = options.compression === 'fast' ? 'low' : 'high';
      (pdf as any).setImageCompression(compressionLevel);
    }
  }

  /**
   * Optimize text rendering
   */
  private optimizeTextRendering(pdf: jsPDF, options: PDFRenderingOptions): void {
    // Enable font subsetting to reduce file size
    if (options.fontEmbedding && (pdf as any).setFontSubsetting) {
      (pdf as any).setFontSubsetting(true);
    }

    // Optimize text rendering mode
    if (options.antiAliasing && (pdf as any).setTextRenderingMode) {
      (pdf as any).setTextRenderingMode('optimizeSpeed');
    }
  }

  /**
   * Apply memory optimizations
   */
  private applyMemoryOptimizations(pdf: jsPDF): void {
    // Clear any cached resources if supported
    if ((pdf as any).clearCache) {
      (pdf as any).clearCache();
    }

    // Optimize memory usage
    if ((pdf as any).optimizeMemory) {
      (pdf as any).optimizeMemory();
    }
  }

  /**
   * Optimize final file size
   */
  private optimizeFileSize(pdf: jsPDF, options: PDFRenderingOptions): void {
    // Remove unused resources
    if ((pdf as any).removeUnusedResources) {
      (pdf as any).removeUnusedResources();
    }

    // Apply final compression
    if (options.compression !== 'none' && (pdf as any).compress) {
      (pdf as any).compress();
    }
  }

  /**
   * Set final document properties and metadata
   */
  private setFinalDocumentProperties(pdf: jsPDF, options: PDFRenderingOptions): void {
    // Set creation and modification dates
    const now = new Date();
    if ((pdf as any).setCreationDate) {
      (pdf as any).setCreationDate(now);
    }
    if ((pdf as any).setModificationDate) {
      (pdf as any).setModificationDate(now);
    }

    // Set producer information
    if ((pdf as any).setProducer) {
      (pdf as any).setProducer('Ultimate PDF Generation System v1.0');
    }

    // Set PDF version as final step
    if (options.pdfVersion && (pdf as any).setPDFVersion) {
      (pdf as any).setPDFVersion(options.pdfVersion);
    }
  }

  /**
   * Generate final PDF blob
   */
  private generatePDFBlob(pdf: jsPDF, options: PDFRenderingOptions): Blob {
    const pdfData = pdf.output('blob');
    return pdfData;
  }

  /**
   * Calculate rendering performance metrics
   */
  private calculateRenderingMetrics(
    startTime: number,
    pdfBlob: Blob,
    renderingContext: CanvasRenderingContext
  ): RenderingMetrics {
    const totalRenderTime = performance.now() - startTime;

    return {
      totalRenderTime,
      sectionRenderTimes: { ...this.currentSectionRenderTimes },
      memoryUsage: renderingContext.canvas.width * renderingContext.canvas.height * 4, // RGBA bytes
      canvasOperations: this.currentCanvasOperations,
      pdfSize: pdfBlob.size,
      qualityScore: this.calculateQualityScore(totalRenderTime, pdfBlob.size)
    };
  }

  /**
   * Calculate quality score based on performance metrics
   */
  private calculateQualityScore(renderTime: number, fileSize: number): number {
    // Score based on render time (faster = better, max 50 points)
    const timeScore = Math.max(0, 50 - (renderTime / 100));

    // Score based on file size (smaller = better, max 30 points)
    const sizeScore = Math.max(0, 30 - (fileSize / 100000));

    // Base quality score (20 points)
    const baseScore = 20;

    return Math.min(100, timeScore + sizeScore + baseScore);
  }


  // Section rendering implementations
  /**
   * Estimate total rendered height (in mm) of an experience item including
   * title line, meta, optional description (max 2 lines), up to 3 achievements,
   * and technologies line. Used for preflight page-break checks.
   */
  private estimateExperienceItemHeight(
    pdf: jsPDF,
    experience: ProcessedExperience,
    template: PDFTemplate,
    options: PDFRenderingOptions,
    contentWidth: number
  ): number {
    let heightMm = 0;
    // Title/company line
    heightMm += 12;
    // Duration and location line
    heightMm += 10;

    // Optional description (up to 2 lines)
    if (options.includeExperienceDescriptions && (experience.description && experience.description.trim().length > 0)) {
      const preLines = pdf.splitTextToSize(experience.description, contentWidth) as string[];
      const linesToRender = Math.min(2, preLines.length);
      heightMm += linesToRender * 7;
      heightMm += 2; // spacing before achievements
    }

    // Achievements (max 3)
    const achCount = Math.min(3, (experience.keyAchievements?.length || 0));
    if (achCount > 0) {
      heightMm += achCount * 8;
    }

    // Technologies line
    if (experience.primaryTechnologies && experience.primaryTechnologies.length > 0) {
      heightMm += 3; // spacing before
      heightMm += 8; // tech line height
    }

    // Final spacing after item
    return heightMm + 5;
  }

  private async renderExperienceItem(pdf: jsPDF, experience: ProcessedExperience, template: PDFTemplate, renderingContext: CanvasRenderingContext, y: number, options: PDFRenderingOptions, overrideRect?: { x: number; width: number }): Promise<number> {
    let currentY = y;
    // Align Experience items to the Precision Layout Grid main content area (right of sidebar)
    let x: number;
    let contentWidth: number;
    if (overrideRect && typeof overrideRect.x === 'number' && typeof overrideRect.width === 'number') {
      x = overrideRect.x;
      contentWidth = overrideRect.width;
    } else {
      const lmExp = new LayoutManager(template.layout);
      const specExp = lmExp.getGridSpec({ columns: 16 });
      const desiredSidebarWidthMmExp = lmExp.getPageRect().width * 0.35;
      let bestSidebarSpanExp = 1;
      let minDeltaExp = Number.POSITIVE_INFINITY;
      for (let span = 1; span <= specExp.columns; span++) {
        const w = span * specExp.columnWidthMm + (span - 1) * specExp.gutterMm;
        const d = Math.abs(w - desiredSidebarWidthMmExp);
        if (d < minDeltaExp) { minDeltaExp = d; bestSidebarSpanExp = span; }
      }
      const mainRectExp = lmExp.getGridRectBySpan(bestSidebarSpanExp + 1, specExp.columns - bestSidebarSpanExp);
      x = mainRectExp.x;
      contentWidth = mainRectExp.width;
    }

    // Optional glass card background for experience item
    if (template.colorScheme && (template.colorScheme as any).glass) {
      const startY = currentY;
      // Estimate card height without rendering text (must precede text drawing)
      let heightMm = 0;
      // Title/company line
      heightMm += 12;
      // Duration/location line
      heightMm += 10;
      // Achievements (max 3)

      // Optional description (up to 2 lines)
      if (options.includeExperienceDescriptions && (experience.description && experience.description.trim().length > 0)) {
        const preLines = pdf.splitTextToSize(experience.description, contentWidth) as string[];
        const linesToRender = Math.min(2, preLines.length);
        heightMm += linesToRender * 7;
      }

      const achCount = Math.min(3, (experience.keyAchievements?.length || 0));
      heightMm += achCount * 8;
      // Technologies line
      if (experience.primaryTechnologies && experience.primaryTechnologies.length > 0) {
        heightMm += 3; // spacing before
        heightMm += 8; // line height
      }

      // Draw background onto canvas and place it into PDF behind text
      const { canvas, ctx } = renderingContext;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.currentCanvasOperations += 1;

      const cardRenderer = new ExperienceCardRenderer();
      this.currentCanvasOperations += (await cardRenderer.renderExperienceCard(
        pdf, template, undefined as any, renderingContext,
        x, startY, contentWidth, heightMm, (experience as any).elevation ?? 2
      )) || 0;

      new GlassEffectsRenderer().canvasToPdf(pdf, canvas, x, startY, contentWidth, heightMm);
      this.currentCanvasOperations += 2; // toDataURL + addImage
    }

    // Company and position
    pdf.setFont(this.fontConfig.primary.family, 'bold');
    pdf.setFontSize(12);
    { const c = ColorManager.parseHex(template.colorScheme.text); pdf.setTextColor(c.r, c.g, c.b); }
    pdf.text(experience.displayTitle || experience.position || 'Position', x, currentY);

    // Company name on the same line
    const titleText = experience.displayTitle || experience.position || 'Position';
    const titleWidth = typeof (pdf as any).getTextWidth === 'function'
      ? (pdf as any).getTextWidth(titleText)
      : titleText.length * 2;
    this.applyFont(pdf, 'primary', 'normal');
    { const c = ColorManager.parseHex(template.colorScheme.textSecondary); pdf.setTextColor(c.r, c.g, c.b); }
    pdf.text(` at ${experience.displayCompany || experience.company}`, x + titleWidth + 3, currentY);

    currentY += 12;

    // Duration and location
    this.applyFont(pdf, 'primary', 'normal');
    pdf.setFontSize(10);
    { const c = ColorManager.parseHex(template.colorScheme.textSecondary); pdf.setTextColor(c.r, c.g, c.b); }
    pdf.text(experience.displayDuration || 'Duration', x, currentY);

    if (experience.displayLocation || experience.location) {
      const durationText = experience.displayDuration || 'Duration';
      const durationWidth = typeof (pdf as any).getTextWidth === 'function' ? (pdf as any).getTextWidth(durationText) : durationText.length * 2;
      pdf.text(` • ${experience.displayLocation || experience.location}`, x + durationWidth + 5, currentY);
    }

    currentY += 10;

    // Optional experience description
    if (options.includeExperienceDescriptions && (experience.description && experience.description.trim().length > 0)) {
      this.applyFont(pdf, 'primary', 'normal');
      pdf.setFontSize(9);
      { const c = ColorManager.parseHex(template.colorScheme.text); pdf.setTextColor(c.r, c.g, c.b); }
      const lines = pdf.splitTextToSize(experience.description, contentWidth) as string[];
      for (const line of lines.slice(0, 2)) {
        pdf.text(line, x, currentY);
        currentY += 7;
      }
      currentY += 2; // small spacing before achievements
    }


    // Key achievements
    if (experience.keyAchievements && experience.keyAchievements.length > 0) {
      this.applyFont(pdf, 'primary', 'normal');
      pdf.setFontSize(9);
      { const c = ColorManager.parseHex(template.colorScheme.text); pdf.setTextColor(c.r, c.g, c.b); }

      for (const achievement of experience.keyAchievements.slice(0, 3)) {
        pdf.text(`• ${achievement}`, x + 5, currentY);
        currentY += 8;
      }
    }

    // Technologies


    if (experience.primaryTechnologies && experience.primaryTechnologies.length > 0) {
      currentY += 3;
      this.applyFont(pdf, 'primary', 'normal');
      pdf.setFontSize(8);
      { const c = ColorManager.parseHex(template.colorScheme.accent); pdf.setTextColor(c.r, c.g, c.b); }
      const techText = experience.primaryTechnologies.join(' • ');
      pdf.text(techText, x, currentY);
      currentY += 8;
    }

    return currentY + 5; // Add spacing
  }

  // --- Skills rendering helpers (glass-styled) ---------------------------------
  private measureText(pdf: jsPDF, text: string): number {
    return typeof (pdf as any).getTextWidth === 'function'
      ? (pdf as any).getTextWidth(text)
      : (text?.length || 0) * 2;
  }

  private drawGlassProgressBar(
    pdf: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    pct: number,
    template: PDFTemplate
  ): void {
    const accent = ColorManager.parseHex(template.colorScheme.accent);
    const muted = ColorManager.parseHex(template.colorScheme.muted);

    // Background (translucent, rounded)
    try { (pdf as any).saveGraphicsState?.(); (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.28 })); } catch {}
    pdf.setFillColor(muted.r, muted.g, muted.b);
    const r = Math.min(h / 2, 2);
    pdf.roundedRect(x, y, w, h, r, r, 'F');
    try { (pdf as any).restoreGraphicsState?.(); } catch {}

    // Inner highlight (top)
    try { (pdf as any).saveGraphicsState?.(); (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.35 })); } catch {}
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x + 0.6, y + 0.35, Math.max(0, w - 1.2), Math.max(0.4, h * 0.35), r, r, 'F');
    try { (pdf as any).restoreGraphicsState?.(); } catch {}

    // Fill
    const fillW = Math.max(0, Math.min(1, pct)) * w;
    if (fillW > 0) {
      try { (pdf as any).saveGraphicsState?.(); (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.9 })); } catch {}
      pdf.setFillColor(accent.r, accent.g, accent.b);
      pdf.roundedRect(x, y, fillW, h, r, r, 'F');
      try { (pdf as any).restoreGraphicsState?.(); } catch {}

      // Crisp top line for polish
      try { (pdf as any).saveGraphicsState?.(); (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.55 })); } catch {}
      pdf.setDrawColor(accent.r, accent.g, accent.b);
      pdf.setLineWidth(0.3);
      pdf.line(x, y + 0.6, x + fillW, y + 0.6);
      try { (pdf as any).restoreGraphicsState?.(); } catch {}
    }
  }

  private drawSkillBadge(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    template: PDFTemplate
  ): number {
    const padX = 3;
    const height = 6;
    const accent = ColorManager.parseHex(template.colorScheme.accent);
    const textWidth = this.measureText(pdf, text);
    const width = textWidth + padX * 2 + 4; // +4 for accent dot space

    // Soft shadow
    try { (pdf as any).saveGraphicsState?.(); (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.12 })); } catch {}
    pdf.setFillColor(0, 0, 0);
    pdf.roundedRect(x + 0.7, y - (height * 0.85), width, height, 2, 2, 'F');
    try { (pdf as any).restoreGraphicsState?.(); } catch {}

    // Glass chip
    try { (pdf as any).saveGraphicsState?.(); (pdf as any).setGState?.(new (pdf as any).GState({ opacity: 0.35 })); } catch {}
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, y - (height * 0.95), width, height, 2, 2, 'F');
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y - (height * 0.95), width, height, 2, 2, 'S');
    try { (pdf as any).restoreGraphicsState?.(); } catch {}

    // Accent dot
    pdf.setFillColor(accent.r, accent.g, accent.b);
    pdf.roundedRect(x + 2, y - (height * 0.95) + height / 2 - 1, 2, 2, 1, 1, 'F');

    // Text
    const t = ColorManager.parseHex(template.colorScheme.text);
    pdf.setTextColor(t.r, t.g, t.b);
    pdf.text(text, x + padX + 4, y);

    return width;
  }

  private async renderCompactSkills(pdf: jsPDF, skills: any, template: PDFTemplate, renderingContext: CanvasRenderingContext, y: number, headerX: number): Promise<number> {
    let currentY = y;
    // Use main content grid area (right of sidebar)
    const lm = new LayoutManager(template.layout);
    const spec = lm.getGridSpec({ columns: 16 });
    const desiredSidebarWidthMm = lm.getPageRect().width * 0.35;
    let bestSidebarSpan = 1;
    let minDelta = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= spec.columns; span++) {
      const w = span * spec.columnWidthMm + (span - 1) * spec.gutterMm;
      const d = Math.abs(w - desiredSidebarWidthMm);
      if (d < minDelta) { minDelta = d; bestSidebarSpan = span; }
    }
    const mainRect = lm.getGridRectBySpan(bestSidebarSpan + 1, spec.columns - bestSidebarSpan);
    const x = mainRect.x;
    const contentWidth = mainRect.width;

    // Page limit for in-section page breaks
    const pageRect = new LayoutManager(template.layout).getPageRect();
    const limitY = pageRect.height - template.layout.margins.bottom - 5;

    const skillList: string[] = skills?.skillList || [];
    if (skillList.length > 0) {
      // 1) Floating badges masonry
      this.applyFont(pdf, 'secondary', 'normal');
      pdf.setFontSize(8.5);
      const textCol = ColorManager.parseHex(template.colorScheme.text);
      pdf.setTextColor(textCol.r, textCol.g, textCol.b);

      let cx = x;
      const maxX = x + contentWidth;
      const rowH = 8;
      const gap = 2;

      for (const label of skillList.slice(0, 24)) {
        const badgeW = this.measureText(pdf, label) + 3 * 2 + 4;
        if (cx + badgeW > maxX) {
          // Move to next row; preflight page break before advancing Y
          cx = x;
          if (currentY + rowH > limitY) {
            await this.addPageWithBackground(pdf, template, renderingContext);
            currentY = this.renderSectionHeader(pdf, 'Skills', template, template.layout.margins.top, headerX);
          }
          currentY += rowH;
        }
        this.drawSkillBadge(pdf, label, cx, currentY, template);
        cx += badgeW + gap;
      }
      currentY += rowH + 2;

      // 2) Glass progress bars grid (top skills)
      const cols = 2;
      const gutter = 6;
      const barHeight = 3;
      const colW = (contentWidth - gutter) / cols;

      const top = skillList.slice(0, Math.min(8, skillList.length));
      // Preflight page break for progress bars grid
      const rowsForBars = Math.ceil(top.length / cols);
      const requiredBarsHeight = rowsForBars * 9 + 4;
      if (currentY + requiredBarsHeight > limitY) {
        await this.addPageWithBackground(pdf, template, renderingContext);
        currentY = this.renderSectionHeader(pdf, 'Skills', template, template.layout.margins.top, headerX);
      }
      this.applyFont(pdf, 'primary', 'normal');
      pdf.setFontSize(8.5);

      const pctFrom = (v: any): number => {
        if (typeof v === 'object') {
          if (typeof v.levelPct === 'number') return Math.max(0, Math.min(1, v.levelPct));
          const L = (v.level || '').toString().toLowerCase();
          if (L.includes('expert') || L.includes('senior')) return 0.95;
          if (L.includes('advanced')) return 0.85;
          if (L.includes('intermediate') || L.includes('mid')) return 0.7;
          if (L.includes('beginner') || L.includes('junior')) return 0.45;
        }
        return 0.75;
      };

      for (let i = 0; i < top.length; i++) {
        const label = top[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const baseX = x + col * (colW + gutter);
        const baseY = currentY + row * 9;

        // Label
        const t = ColorManager.parseHex(template.colorScheme.text);
        pdf.setTextColor(t.r, t.g, t.b);
        pdf.text(label, baseX, baseY);
        // Bar under label
        const w = Math.max(24, colW * 0.85);
        this.drawGlassProgressBar(pdf, baseX, baseY + 1.2, w, barHeight, pctFrom(label), template);
      }

      // Advance Y after grid
      const rows = Math.ceil(top.length / cols);
      currentY += rows * 9 + 4;
    }

    return currentY + 5;
  }

  private async renderDetailedSkills(pdf: jsPDF, skills: any, template: PDFTemplate, renderingContext: CanvasRenderingContext, y: number, headerX: number): Promise<number> {
    let currentY = y;
    // Use main content grid area (right of sidebar)
    const lm = new LayoutManager(template.layout);
    const spec = lm.getGridSpec({ columns: 16 });
    const desiredSidebarWidthMm = lm.getPageRect().width * 0.35;
    let bestSidebarSpan = 1;
    let minDelta = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= spec.columns; span++) {
      const w = span * spec.columnWidthMm + (span - 1) * spec.gutterMm;
      const d = Math.abs(w - desiredSidebarWidthMm);
      if (d < minDelta) { minDelta = d; bestSidebarSpan = span; }
    }
    const mainRect = lm.getGridRectBySpan(bestSidebarSpan + 1, spec.columns - bestSidebarSpan);
    const x = mainRect.x;
    const contentWidth = mainRect.width;

    // Page limit for in-section page breaks
    const pageRect = new LayoutManager(template.layout).getPageRect();
    const limitY = pageRect.height - template.layout.margins.bottom - 5;

    const list = (skills?.skillsWithLevels || []).slice(0, 10);
    if (list.length > 0) {
      for (const s of list) {
        // Preflight per item; each item uses ~10mm vertical space
        if (currentY + 10 > limitY) {
          await this.addPageWithBackground(pdf, template, renderingContext);
          currentY = this.renderSectionHeader(pdf, 'Skills', template, template.layout.margins.top, headerX);
        }

        const label = (s as any)?.name || ('' + s);
        this.applyFont(pdf, 'primary', 'normal');
        pdf.setFontSize(9);
        { const c = ColorManager.parseHex(template.colorScheme.text); pdf.setTextColor(c.r, c.g, c.b); }
        pdf.text(label, x, currentY);

        // Progress bar under each label
        const pct = ((): number => {
          if (typeof s === 'object') {
            if (typeof (s as any).levelPct === 'number') return Math.max(0, Math.min(1, (s as any).levelPct));
            const L = ((s as any).level || '').toString().toLowerCase();
            if (L.includes('expert') || L.includes('senior')) return 0.95;
            if (L.includes('advanced')) return 0.85;
            if (L.includes('intermediate') || L.includes('mid')) return 0.7;
            if (L.includes('beginner') || L.includes('junior')) return 0.45;
          }
          return 0.75;
        })();

        const barW = Math.max(40, contentWidth * 0.55);
        this.drawGlassProgressBar(pdf, x, currentY + 1.4, barW, 3, pct, template);

        // Optional level tag at end of bar (small pill)
        const levelLabel = (s as any)?.level ? String((s as any).level) : '';
        if (levelLabel) {
          const lblW = this.measureText(pdf, levelLabel) + 6;
          const bx = x + barW + 2;
          const by = currentY + 1.4 + 3; // baseline
          // very small chip using drawSkillBadge styling
          this.drawSkillBadge(pdf, levelLabel, bx, by, template);
        }

        currentY += 10;
      }
    }

    return currentY + 5;
  }

  private async renderCategorizedSkills(pdf: jsPDF, skills: any, template: PDFTemplate, renderingContext: CanvasRenderingContext, y: number, headerX: number): Promise<number> {
    let currentY = y;
    // Use main content grid area (right of sidebar)
    const lm = new LayoutManager(template.layout);
    const spec = lm.getGridSpec({ columns: 16 });
    const desiredSidebarWidthMm = lm.getPageRect().width * 0.35;
    let bestSidebarSpan = 1;
    let minDelta = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= spec.columns; span++) {
      const w = span * spec.columnWidthMm + (span - 1) * spec.gutterMm;
      const d = Math.abs(w - desiredSidebarWidthMm);
      if (d < minDelta) { minDelta = d; bestSidebarSpan = span; }
    }
    const mainRect = lm.getGridRectBySpan(bestSidebarSpan + 1, spec.columns - bestSidebarSpan);
    const x = mainRect.x;
    const contentWidth = mainRect.width;

    // Page limit for in-section page breaks
    const pageRect = new LayoutManager(template.layout).getPageRect();
    const limitY = pageRect.height - template.layout.margins.bottom - 5;


    const categories = skills?.categories || [];
    if (categories.length > 0) {
      for (const category of categories.slice(0, 4)) {
        // Estimate required height for this category (header + skills lines) and preflight
        let estLines = 0;
        if (category.skills && category.skills.length > 0) {
          const estSkillNames = category.skills.map((skill: any) => (skill?.name ?? skill)).join(', ');
          const est = pdf.splitTextToSize(estSkillNames, contentWidth - 10) as string[];
          estLines = est.length;
        }
        const required = 8 + (estLines > 0 ? estLines * 7 : 0) + 5;
        if (currentY + required > limitY) {
          await this.addPageWithBackground(pdf, template, renderingContext);
          currentY = this.renderSectionHeader(pdf, 'Skills', template, template.layout.margins.top, headerX);
        }

        // Category name
        this.applyFont(pdf, 'primary', 'bold');
        pdf.setFontSize(10);
        { const c = ColorManager.parseHex(template.colorScheme.accent); pdf.setTextColor(c.r, c.g, c.b); }
        pdf.text(category.name || 'Category', x, currentY);
        currentY += 8;

        // Category skills
        if (category.skills && category.skills.length > 0) {
          this.applyFont(pdf, 'primary', 'normal');
          pdf.setFontSize(9);
          { const c = ColorManager.parseHex(template.colorScheme.text); pdf.setTextColor(c.r, c.g, c.b); }

          const skillNames = category.skills.map((skill: any) => (skill?.name ?? skill)).join(', ');
          const lines = pdf.splitTextToSize(skillNames, contentWidth - 10);

          for (const line of lines) {
            pdf.text(line, x + 5, currentY);
            currentY += 7;
          }
        }

        currentY += 5;
      }
    }

    return currentY + 5;
  }

  private async renderProjectItem(pdf: jsPDF, project: ProcessedProject, template: PDFTemplate, renderingContext: CanvasRenderingContext, y: number, options: PDFRenderingOptions): Promise<number> {
    let currentY = y;
    // Align Project items to the Precision Layout Grid main content area (right of sidebar)
    const lmProj = new LayoutManager(template.layout);
    const specProj = lmProj.getGridSpec({ columns: 16 });
    const desiredSidebarWidthMmProj = lmProj.getPageRect().width * 0.35;
    let bestSidebarSpanProj = 1;
    let minDeltaProj = Number.POSITIVE_INFINITY;
    for (let span = 1; span <= specProj.columns; span++) {
      const w = span * specProj.columnWidthMm + (span - 1) * specProj.gutterMm;
      const d = Math.abs(w - desiredSidebarWidthMmProj);
      if (d < minDeltaProj) { minDeltaProj = d; bestSidebarSpanProj = span; }
    }
    const mainRectProj = lmProj.getGridRectBySpan(bestSidebarSpanProj + 1, specProj.columns - bestSidebarSpanProj);
    const x = mainRectProj.x;
    const contentWidth = mainRectProj.width;


    // Optional glass card background for project item (must be before text drawing)
    if (template.colorScheme && (template.colorScheme as any).glass) {
      const startY = currentY;
      let heightMm = 0;
      // Title line
      heightMm += 10;
      // Description (up to 2 lines) if enabled
      if (options.includeProjectDescriptions && (project.displayDescription || project.description)) {
        const preDesc = project.displayDescription || project.description || '';
        const preLines = preDesc ? pdf.splitTextToSize(preDesc, contentWidth) : [] as string[];
        const linesToRender = Math.min(2, preLines.length);
        heightMm += linesToRender * 7;
      }
      // Technologies line
      if (project.keyTechnologies && project.keyTechnologies.length > 0) {
        heightMm += 2; // spacing before
        heightMm += 8; // line height
      }
      // Metrics line
      if (project.primaryMetrics && Object.keys(project.primaryMetrics).length > 0) {
        heightMm += 8;
      }

      const { canvas, ctx } = renderingContext;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.currentCanvasOperations += 1;

      const cardRenderer = new ProjectCardRenderer();
      this.currentCanvasOperations += (await cardRenderer.renderProjectCard(
        pdf, template, undefined as any, renderingContext,
        x, startY, contentWidth, heightMm, (project as any).elevation ?? 2
      )) || 0;

      new GlassEffectsRenderer().canvasToPdf(pdf, canvas, x, startY, contentWidth, heightMm);
      this.currentCanvasOperations += 2; // toDataURL + addImage
    }

    // Project title
    this.applyFont(pdf, 'primary', 'bold');
    pdf.setFontSize(11);
    { const c = ColorManager.parseHex(template.colorScheme.text); pdf.setTextColor(c.r, c.g, c.b); }
    pdf.text(project.displayTitle || project.title || 'Project', x, currentY);
    currentY += 10;

    // Project description
    if (options.includeProjectDescriptions && (project.displayDescription || project.description)) {
      this.applyFont(pdf, 'primary', 'normal');
      pdf.setFontSize(9);
      { const c = ColorManager.parseHex(template.colorScheme.text); pdf.setTextColor(c.r, c.g, c.b); }

      const description = project.displayDescription || project.description || '';
      const lines = pdf.splitTextToSize(description, contentWidth);

      for (const line of lines.slice(0, 2)) { // Limit to 2 lines
        pdf.text(line, x, currentY);
        currentY += 7;
      }
    }

    // Key technologies
    if (project.keyTechnologies && project.keyTechnologies.length > 0) {
      currentY += 2;
      this.applyFont(pdf, 'primary', 'normal');
      pdf.setFontSize(8);
      { const c = ColorManager.parseHex(template.colorScheme.accent); pdf.setTextColor(c.r, c.g, c.b); }
      const techText = project.keyTechnologies.join(' • ');
      pdf.text(techText, x, currentY);
      currentY += 8;
    }


    // Optional glass card background for project item (must be before text drawing)
    if (template.colorScheme && (template.colorScheme as any).glass) {
      const startY = currentY;
      let heightMm = 0;
      // Title line
      heightMm += 10;
      // Description (up to 2 lines) if enabled
      if (options.includeProjectDescriptions && (project.displayDescription || project.description)) {
        const description = project.displayDescription || project.description || '';
        const preLines = description ? pdf.splitTextToSize(description, contentWidth) : [] as string[];
        const linesToRender = Math.min(2, preLines.length);
        heightMm += linesToRender * 7;
      }
      // Technologies line
      if (project.keyTechnologies && project.keyTechnologies.length > 0) {
        heightMm += 2; // spacing before
        heightMm += 8; // line height
      }
      // Metrics line
      if (project.primaryMetrics && Object.keys(project.primaryMetrics).length > 0) {
        heightMm += 8;
      }

      const { canvas, ctx } = renderingContext;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.currentCanvasOperations += 1;

      const cardRenderer = new ProjectCardRenderer();
      this.currentCanvasOperations += (await cardRenderer.renderProjectCard(
        pdf, template, undefined as any, renderingContext,
        x, startY, contentWidth, heightMm, (project as any).elevation ?? 2
      )) || 0;

      new GlassEffectsRenderer().canvasToPdf(pdf, canvas, x, startY, contentWidth, heightMm);
      this.currentCanvasOperations += 2; // toDataURL + addImage
    }

    if (project.primaryMetrics && Object.keys(project.primaryMetrics).length > 0) {
      this.applyFont(pdf, 'primary', 'normal');
      pdf.setFontSize(8);
      { const c = ColorManager.parseHex(template.colorScheme.textSecondary); pdf.setTextColor(c.r, c.g, c.b); }

      const metrics = Object.entries(project.primaryMetrics)
        .slice(0, 2)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' • ');

      pdf.text(metrics, x, currentY);
      currentY += 8;
    }

    return currentY + 5; // Add spacing
  }

  private setPDFCompliance(pdf: jsPDF, compliance: string): void {
    try {
      switch (compliance) {
        case 'PDF/A-1':
          this.setPDFA1Compliance(pdf);
          break;
        case 'PDF/A-2':
          this.setPDFA2Compliance(pdf);
          break;
        case 'PDF/A-3':
          this.setPDFA3Compliance(pdf);
          break;
        default:
          console.warn(`[PDFRenderer] Unknown compliance standard: ${compliance}`);
      }
    } catch (error) {
      console.warn(`[PDFRenderer] Failed to set PDF compliance ${compliance}:`, error);
    }
  }

  /**
   * Set PDF/A-1 compliance (basic archival standard)
   */
  private setPDFA1Compliance(pdf: jsPDF): void {
    // PDF/A-1 requirements
    if ((pdf as any).setPDFACompliance) {
      (pdf as any).setPDFACompliance('1b');
    }

    // Ensure all fonts are embedded
    if ((pdf as any).setFontEmbedding) {
      (pdf as any).setFontEmbedding(true);
    }

    // Set color profile to sRGB
    if ((pdf as any).setColorProfile) {
      (pdf as any).setColorProfile('sRGB');
    }

    console.log('[PDFRenderer] Applied PDF/A-1 compliance settings');
  }

  /**
   * Set PDF/A-2 compliance (enhanced archival standard)
   */
  private setPDFA2Compliance(pdf: jsPDF): void {
    // PDF/A-2 includes PDF/A-1 requirements plus additional features
    this.setPDFA1Compliance(pdf);

    // Additional PDF/A-2 features
    if ((pdf as any).setPDFACompliance) {
      (pdf as any).setPDFACompliance('2b');
    }

    // Enable transparency support
    if ((pdf as any).setTransparencySupport) {
      (pdf as any).setTransparencySupport(true);
    }

    console.log('[PDFRenderer] Applied PDF/A-2 compliance settings');
  }

  /**
   * Set PDF/A-3 compliance (archival with embedded files)
   */
  private setPDFA3Compliance(pdf: jsPDF): void {
    // PDF/A-3 includes PDF/A-2 requirements plus embedded file support
    this.setPDFA2Compliance(pdf);

    if ((pdf as any).setPDFACompliance) {
      (pdf as any).setPDFACompliance('3b');
    }

    // Enable embedded file support
    if ((pdf as any).setEmbeddedFileSupport) {
      (pdf as any).setEmbeddedFileSupport(true);
    }

    console.log('[PDFRenderer] Applied PDF/A-3 compliance settings');
  }

  private convertToCMYK(pdf: jsPDF): void {
    try {
      // Set color space to CMYK if supported
      if ((pdf as any).setColorSpace) {
        (pdf as any).setColorSpace('CMYK');
      }

      // Convert RGB colors to CMYK for print optimization
      if ((pdf as any).convertColorSpace) {
        (pdf as any).convertColorSpace('RGB', 'CMYK');
      }

      // Apply CMYK color profile
      if ((pdf as any).setColorProfile) {
        (pdf as any).setColorProfile('CMYK');
      }

      console.log('[PDFRenderer] Converted color space to CMYK for print optimization');
    } catch (error) {
      console.warn('[PDFRenderer] CMYK conversion not supported in current jsPDF version:', error);
      // Fallback: Log warning but continue with RGB colors
      console.log('[PDFRenderer] Continuing with RGB color space');
    }
  }

  /**
   * Convert RGB color values to CMYK
   * Utility method for manual color conversion when jsPDF doesn't support it
   */
  private rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
    // Normalize RGB values to 0-1 range
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    // Calculate K (black) component
    const k = 1 - Math.max(rNorm, Math.max(gNorm, bNorm));

    // Calculate CMY components
    const c = k === 1 ? 0 : (1 - rNorm - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - gNorm - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - bNorm - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  }


}
