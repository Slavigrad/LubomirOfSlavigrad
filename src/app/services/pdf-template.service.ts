import { Injectable, signal, computed } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { CVEntityBase } from '../models/cv-data.interface';
import { colorVariants, sharedSizeVariants } from '../shared/utils/variant-definitions';
import { GlassMorphismPDFTemplate } from '../templates/pdf/glass-modern.template';

// ============================================================================
// PDF TEMPLATE CORE INTERFACES
// ============================================================================

/**
 * PDF Color Scheme with design token mapping from web to print
 * Extends existing colorVariants for consistency
 */
export interface PDFColorScheme {
  // Primary brand colors
  primary: string;
  secondary: string;
  accent: string;

  // Background and surface colors
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  muted: string;

  // Glass-morphism specific colors and parameters for PDF
  glass: {
    // Legacy color fields (kept for compatibility with existing utilities)
    background: string;
    border: string;
    shadow: string;
    highlight: string;

    // New standardized parameters for canvas-based glass rendering
    fillColor: string;        // typically '#ffffff'
    strokeColor: string;      // typically '#ffffff'
    opacity: number;          // base opacity for generic overlays
    shadowColor: string;      // typically '#000000'
    shadowBlur: number;
    shadowOffset: { x: number; y: number };
    shadowOpacity: number;

    // Optional presets for context-specific overlays (hero/card)
    presets?: {
      hero?: { opacity: number; shadowBlur: number; shadowOffset: { x: number; y: number }; shadowOpacity: number };
      card?: { opacity: number; shadowBlur: number; shadowOffset: { x: number; y: number }; shadowOpacity: number };
    };

    // Enhanced glass effects (optional)
    light?: {
      direction: { x: number; y: number }; // normalized-ish; e.g., {-0.6, -0.8} from top-left
      color?: string;      // default '#ffffff'
      intensity?: number;  // 0..1, global multiplier
      edgeStrength?: number; // 0..1, border light strength
      specularSize?: number; // px radius for specular spot
      specularStrength?: number; // 0..1
    };
    noise?: {
      amount: number; // 0..0.1 typical 0.02
      scale?: number; // 0.5..4, default 1
      type?: 'mono' | 'rgb'; // default 'mono'
    };
    borderOpts?: {
      gradientAlphaTop?: number;
      gradientAlphaBottom?: number;
      thickness?: number; // px for canvas stroke
    };
  };

  // Status and semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * PDF Layout Configuration with responsive design principles
 */
export interface PDFLayoutConfig {
  // Page setup
  format: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';

  // Layout structure
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  // Column system
  columns: 1 | 2 | 3;
  columnGap: number;

  // Spacing system (mapped from existing design tokens)
  spacing: {
    section: number;
    paragraph: number;
    line: number;
    element: number;
  };

  // Radii system for common components
  radii: {
    card: number;
    chip: number;
    button: number;
  };

  // Typography scale
  typography: {
    baseSize: number;
    scaleRatio: number;
    lineHeight: number;
  };
}

/**
 * PDF Section Configuration for layout positioning
 */
export interface PDFSectionConfig extends CVEntityBase {
  name: string;
  page: number;
  position: {
    x: number; // Percentage of page width
    y: number; // Percentage of page height
    width: number; // Percentage of page width
    height: number; // Percentage of page height
  };
  variant: string; // CVA variant for styling
  required: boolean;
  order: number;
  responsive?: {
    mobile?: Partial<PDFSectionConfig['position']>;
    tablet?: Partial<PDFSectionConfig['position']>;
  };
}

// Optional background rendering configuration (template-driven)
export interface PDFBackgroundConfig {
  enablePattern?: boolean;
  enableLighting?: boolean;
  enableVignette?: boolean;
  patternOpacity?: number; // 0..1
  lightingOpacity?: number; // 0..1
  vignetteOpacity?: number; // 0..1
}

/**
 * Complete PDF Template Definition
 * Integrates with existing CVA patterns and design system
 */
export interface PDFTemplate extends CVEntityBase {
  name: string;
  description: string;
  targetAudience: 'recruiter' | 'technical' | 'executive' | 'creative';

  // Template constraints
  maxPages: number;
  minPages: number;

  // Design system integration
  colorScheme: PDFColorScheme;
  layout: PDFLayoutConfig;
  sections: PDFSectionConfig[];

  // Template metadata (override version to be string)
  version: number; // Keep as number to match CVEntityBase
  templateVersion?: string; // Add separate template version string
  author?: string;
  preview?: string; // URL to preview image

  // Feature flags
  features: {
    supportsGlassMorphism: boolean;
    supportsCharts: boolean;
    supportsImages: boolean;
    supportsCustomFonts: boolean;
  };

  // Performance hints
  performance: {
    estimatedGenerationTime: number; // in milliseconds
    memoryUsage: 'low' | 'medium' | 'high';
    complexity: 'simple' | 'moderate' | 'complex';
  };

  // Rendering options (opt-in feature flags, default disabled)
  rendering?: {
    rasterizeTechBadges?: boolean; // default false
    background?: PDFBackgroundConfig; // template-driven background tuning
  };

}

// ============================================================================
// PDF-SPECIFIC CVA VARIANT SYSTEM
// ============================================================================

/**
 * PDF Template variants extending existing CVA patterns
 * Maintains consistency with web design system
 */
export const createPDFTemplateVariants = (baseClass: string) => cva(baseClass, {
  variants: {
    template: {
      modern: 'pdf-modern',
      executive: 'pdf-executive',
      technical: 'pdf-technical',
      creative: 'pdf-creative',
      minimal: 'pdf-minimal'
    },
    colorScheme: {
      professional: 'pdf-professional',
      monochrome: 'pdf-monochrome',
      accent: 'pdf-accent',
      glass: 'pdf-glass',
      vibrant: 'pdf-vibrant'
    },
    density: {
      compact: 'pdf-compact',
      normal: 'pdf-normal',
      spacious: 'pdf-spacious'
    },
    audience: {
      recruiter: 'pdf-recruiter-optimized',
      technical: 'pdf-technical-optimized',
      executive: 'pdf-executive-optimized',
      creative: 'pdf-creative-optimized'
    }
  },
  compoundVariants: [
    {
      template: 'modern',
      colorScheme: 'glass',
      class: 'pdf-glass-modern'
    },
    {
      template: 'executive',
      colorScheme: 'professional',
      class: 'pdf-executive-professional'
    },
    {
      template: 'technical',
      density: 'compact',
      class: 'pdf-technical-compact'
    },
    {
      audience: 'recruiter',
      density: 'normal',
      class: 'pdf-recruiter-friendly'
    }
  ],
  defaultVariants: {
    template: 'modern',
    colorScheme: 'professional',
    density: 'normal',
    audience: 'recruiter'
  }
});

/**
 * PDF Section variants for different content types
 */
export const createPDFSectionVariants = (baseClass: string) => cva(baseClass, {
  variants: {
    type: {
      hero: 'pdf-section-hero',
      content: 'pdf-section-content',
      sidebar: 'pdf-section-sidebar',
      footer: 'pdf-section-footer',
      header: 'pdf-section-header'
    },
    style: {
      glass: 'pdf-glass-effect',
      solid: 'pdf-solid-background',
      transparent: 'pdf-transparent',
      gradient: 'pdf-gradient-background'
    },
    size: {
      sm: `${sharedSizeVariants.sm.padding}`,
      md: `${sharedSizeVariants.md.padding}`,
      lg: `${sharedSizeVariants.lg.padding}`
    }
  },
  defaultVariants: {
    type: 'content',
    style: 'solid',
    size: 'md'
  }
});

// ============================================================================
// DESIGN TOKEN MAPPING
// ============================================================================

/**
 * Maps web design tokens to PDF-compatible values
 * Ensures visual consistency between web and print
 */
export const createPDFColorSchemeFromWeb = (webVariant: keyof typeof colorVariants): PDFColorScheme => {
  const webColors = colorVariants[webVariant];

  return {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    muted: '#94a3b8',
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.25)',
      highlight: 'rgba(255, 255, 255, 0.4)',
      fillColor: '#ffffff',
      strokeColor: '#ffffff',
      opacity: 0.08,
      shadowColor: '#000000',
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.08,
      presets: {
        hero: { opacity: 0.1, shadowBlur: 10, shadowOffset: { x: 0, y: 2 }, shadowOpacity: 0.1 },
        card: { opacity: 0.06, shadowBlur: 5, shadowOffset: { x: 2, y: 2 }, shadowOpacity: 0.08 }
      }
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };
};

// ============================================================================
// PREDEFINED COLOR SCHEMES
// ============================================================================

/**
 * Predefined PDF color schemes for different use cases
 */
export const PDF_COLOR_SCHEMES: Record<string, PDFColorScheme> = {
  professional: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    muted: '#94a3b8',
    glass: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.25)',
      highlight: 'rgba(59, 130, 246, 0.4)',
      fillColor: '#ffffff',
      strokeColor: '#ffffff',
      opacity: 0.08,
      shadowColor: '#000000',
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.08,
      presets: {
        hero: { opacity: 0.1, shadowBlur: 10, shadowOffset: { x: 0, y: 2 }, shadowOpacity: 0.1 },
        card: { opacity: 0.06, shadowBlur: 5, shadowOffset: { x: 2, y: 2 }, shadowOpacity: 0.08 }
      }
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },

  monochrome: {
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#9ca3af',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    muted: '#d1d5db',
    glass: {
      background: 'rgba(107, 114, 128, 0.1)',
      border: 'rgba(107, 114, 128, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.15)',
      highlight: 'rgba(107, 114, 128, 0.3)',
      fillColor: '#ffffff',
      strokeColor: '#ffffff',
      opacity: 0.08,
      shadowColor: '#000000',
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.08,
      presets: {
        hero: { opacity: 0.1, shadowBlur: 10, shadowOffset: { x: 0, y: 2 }, shadowOpacity: 0.1 },
        card: { opacity: 0.06, shadowBlur: 5, shadowOffset: { x: 2, y: 2 }, shadowOpacity: 0.08 }
      }
    },
    success: '#6b7280',
    warning: '#6b7280',
    error: '#374151',
    info: '#6b7280'
  },

  glass: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    muted: '#64748b',
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.25)',
      highlight: 'rgba(255, 255, 255, 0.4)',
      fillColor: '#ffffff',
      strokeColor: '#ffffff',
      opacity: 0.08,
      shadowColor: '#000000',
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.08,
      presets: {
        hero: { opacity: 0.1, shadowBlur: 10, shadowOffset: { x: 0, y: 2 }, shadowOpacity: 0.1 },
        card: { opacity: 0.06, shadowBlur: 5, shadowOffset: { x: 2, y: 2 }, shadowOpacity: 0.08 }
      }
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  }
};

/**
 * Standard PDF layout configurations
 */
export const PDF_LAYOUT_PRESETS: Record<string, PDFLayoutConfig> = {
  standard: {
    format: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    columns: 1,
    columnGap: 20,
    spacing: { section: 16, paragraph: 8, line: 4, element: 4 },
    radii: { card: 8, chip: 1, button: 4 },
    typography: { baseSize: 12, scaleRatio: 1.25, lineHeight: 1.5 }
  },

  compact: {
    format: 'A4',
    orientation: 'portrait',
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
    columns: 2,
    columnGap: 15,
    spacing: { section: 12, paragraph: 6, line: 3, element: 3 },
    radii: { card: 8, chip: 1, button: 4 },
    typography: { baseSize: 10, scaleRatio: 1.2, lineHeight: 1.4 }
  },

  executive: {
    format: 'A4',
    orientation: 'portrait',
    margins: { top: 25, right: 25, bottom: 25, left: 25 },
    columns: 1,
    columnGap: 0,
    spacing: { section: 20, paragraph: 10, line: 5, element: 5 },
    radii: { card: 8, chip: 1, button: 4 },
    typography: { baseSize: 14, scaleRatio: 1.3, lineHeight: 1.6 }
  }
};

// ============================================================================
// TYPE EXPORTS FOR CVA INTEGRATION
// ============================================================================

export type PDFTemplateVariants = VariantProps<typeof createPDFTemplateVariants>;
export type PDFSectionVariants = VariantProps<typeof createPDFSectionVariants>;

// ============================================================================
// PDF TEMPLATE SERVICE
// ============================================================================

/**
 * PDF Template Service
 * Manages PDF templates with CVA integration and design system consistency
 */
@Injectable({
  providedIn: 'root'
})
export class PDFTemplateService {
  // Template registry
  private readonly _templates = signal<PDFTemplate[]>([]);
  private readonly _activeTemplate = signal<PDFTemplate | null>(null);

  // Computed properties
  readonly templates = this._templates.asReadonly();
  readonly activeTemplate = this._activeTemplate.asReadonly();

  readonly availableTemplates = computed(() =>
    this._templates().filter(template => template.visibility !== 'private')
  );

  readonly templatesByAudience = computed(() => {
    const templates = this.availableTemplates();
    return {
      recruiter: templates.filter(t => t.targetAudience === 'recruiter'),
      technical: templates.filter(t => t.targetAudience === 'technical'),
      executive: templates.filter(t => t.targetAudience === 'executive'),
      creative: templates.filter(t => t.targetAudience === 'creative')
    };
  });

  constructor() {
    console.log('[PDFTemplateService] Initializing template service...');
    this.initializeDefaultTemplates();
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<PDFTemplate | null> {
    const template = this._templates().find(t => t.id === templateId);
    return template || null;
  }

  /**
   * Register a new template
   */
  registerTemplate(template: PDFTemplate): void {
    console.log('[PDFTemplateService] Registering template:', template.id, template.name);
    const templates = this._templates();
    const existingIndex = templates.findIndex(t => t.id === template.id);

    if (existingIndex >= 0) {
      // Update existing template
      const updatedTemplates = [...templates];
      updatedTemplates[existingIndex] = { ...template, updatedAt: new Date() };
      this._templates.set(updatedTemplates);
      console.log('[PDFTemplateService] Updated existing template:', template.id);
    } else {
      // Add new template
      this._templates.set([...templates, { ...template, createdAt: new Date() }]);
      console.log('[PDFTemplateService] Added new template:', template.id);
    }
    console.log('[PDFTemplateService] Total templates now:', this._templates().length);
  }

  /**
   * Set active template
   */
  setActiveTemplate(templateId: string): void {
    const template = this._templates().find(t => t.id === templateId);
    if (template) {
      this._activeTemplate.set(template);
    }
  }

  /**
   * Generate CVA classes for template
   */
  getTemplateClasses(variants?: PDFTemplateVariants): string {
    const variantFn = createPDFTemplateVariants('pdf-template');
    return variantFn(variants as any);
  }

  /**
   * Generate CVA classes for section
   */
  getSectionClasses(variants?: PDFSectionVariants): string {
    const variantFn = createPDFSectionVariants('pdf-section');
    return variantFn(variants as any);
  }

  /**
   * Create color scheme from web variant
   */
  createColorScheme(webVariant: keyof typeof colorVariants): PDFColorScheme {
    return createPDFColorSchemeFromWeb(webVariant);
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    console.log('[PDFTemplateService] Initializing default templates...');
    // Register the Glass-Morphism template
    this.registerGlassMorphismTemplate();
  }


  /**
   * Default background presets per audience
   */
  private getAudienceBackgroundPreset(audience: PDFTemplate['targetAudience']): PDFBackgroundConfig {
    switch (audience) {
      case 'technical':
        return {
          enablePattern: true,
          enableLighting: true,
          enableVignette: true,
          patternOpacity: 0.06,
          lightingOpacity: 0.08,
          vignetteOpacity: 0.04,
        };
      case 'executive':
        return {
          enablePattern: true,
          enableLighting: true,
          enableVignette: true,
          patternOpacity: 0.03,
          lightingOpacity: 0.12,
          vignetteOpacity: 0.08,
        };
      case 'creative':
        return {
          enablePattern: true,
          enableLighting: true,
          enableVignette: true,
          patternOpacity: 0.07,
          lightingOpacity: 0.12,
          vignetteOpacity: 0.05,
        };
      case 'recruiter':
      default:
        return {
          enablePattern: true,
          enableLighting: true,
          enableVignette: true,
          patternOpacity: 0.04,
          lightingOpacity: 0.10,
          vignetteOpacity: 0.05,
        };
    }
  }



  /**
   * Register the Glass-Morphism template
   */
  private registerGlassMorphismTemplate(): void {
    console.log('[PDFTemplateService] Registering Glass-Morphism template synchronously...');

    // Use the actual Glass Modern template with proper sections
    const glassTemplate: PDFTemplate = GlassMorphismPDFTemplate.getTemplate();

    // Ensure audience-based background defaults are applied if not provided
    const bg = glassTemplate.rendering?.background ?? this.getAudienceBackgroundPreset(glassTemplate.targetAudience);
    const finalizedTemplate: PDFTemplate = {
      ...glassTemplate,
      rendering: { ...(glassTemplate.rendering ?? {}), background: bg },
    };

    console.log('[PDFTemplateService] Glass-Morphism template definition created:', finalizedTemplate);
    this.registerTemplate(finalizedTemplate);

    // Set as default active template
    if (!this._activeTemplate()) {
      this.setActiveTemplate(finalizedTemplate.id);
    }
    console.log('[PDFTemplateService] Glass-Morphism template registered successfully');
  }

  /**
   * Validate template configuration
   */
  validateTemplate(template: PDFTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!template.id || template.id.trim() === '') {
      errors.push('Template ID is required');
    }

    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }

    if (template.maxPages < 1 || template.maxPages > 10) {
      errors.push('Template must support 1-10 pages');
    }

    if (template.minPages < 1 || template.minPages > template.maxPages) {
      errors.push('Invalid page range configuration');
    }

    // Layout validation
    if (!template.layout) {
      errors.push('Layout configuration is required');
    } else {
      if (template.layout.columns < 1 || template.layout.columns > 3) {
        errors.push('Template must support 1-3 columns');
      }

      if (template.layout.margins.top < 0 || template.layout.margins.top > 50) {
        errors.push('Invalid margin configuration');
      }
    }

    // Section validation
    if (!template.sections || template.sections.length === 0) {
      errors.push('Template must have at least one section');
    } else {
      const requiredSections = template.sections.filter(s => s.required);
      if (requiredSections.length === 0) {
        errors.push('Template must have at least one required section');
      }

      // Validate section positions
      template.sections.forEach((section, index) => {
        if (section.position.x < 0 || section.position.x > 100) {
          errors.push(`Section ${index + 1}: Invalid X position (must be 0-100%)`);
        }
        if (section.position.y < 0 || section.position.y > 100) {
          errors.push(`Section ${index + 1}: Invalid Y position (must be 0-100%)`);
        }
        if (section.position.width <= 0 || section.position.width > 100) {
          errors.push(`Section ${index + 1}: Invalid width (must be 1-100%)`);
        }
        if (section.position.height <= 0 || section.position.height > 100) {
          errors.push(`Section ${index + 1}: Invalid height (must be 1-100%)`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get template performance estimate
   */
  getPerformanceEstimate(template: PDFTemplate): {
    estimatedTime: number;
    memoryUsage: string;
    complexity: string;
  } {
    let baseTime = 1000; // 1 second base
    let complexity = 'simple';
    let memoryUsage = 'low';

    // Adjust based on features
    if (template.features.supportsGlassMorphism) {
      baseTime += 500;
      complexity = 'moderate';
      memoryUsage = 'medium';
    }

    if (template.features.supportsCharts) {
      baseTime += 800;
      complexity = 'complex';
      memoryUsage = 'high';
    }

    if (template.features.supportsImages) {
      baseTime += 300;
    }

    // Adjust based on sections
    const sectionCount = template.sections.length;
    baseTime += sectionCount * 100;

    // Adjust based on pages
    baseTime += (template.maxPages - 1) * 200;

    return {
      estimatedTime: baseTime,
      memoryUsage,
      complexity
    };
  }

  /**
   * Create template variant classes
   */
  createTemplateVariantClasses(
    template: PDFTemplate,
    overrides?: Partial<PDFTemplateVariants>
  ): string {
    const baseVariants = {
      template: this.mapTemplateToVariant(template.name),
      colorScheme: this.mapColorSchemeToVariant(template.colorScheme),
      density: 'normal' as const,
      audience: template.targetAudience
    };

    const variants = { ...baseVariants, ...overrides } as PDFTemplateVariants;
    return this.getTemplateClasses(variants);
  }

  /**
   * Map template name to CVA variant
   */
  private mapTemplateToVariant(templateName: string): 'modern' | 'executive' | 'technical' | 'creative' | 'minimal' {
    const name = templateName.toLowerCase();
    if (name.includes('executive')) return 'executive';
    if (name.includes('technical')) return 'technical';
    if (name.includes('creative')) return 'creative';
    if (name.includes('minimal')) return 'minimal';
    return 'modern';
  }

  /**
   * Map color scheme to CVA variant
   */
  private mapColorSchemeToVariant(colorScheme: PDFColorScheme): 'professional' | 'monochrome' | 'accent' | 'glass' | 'vibrant' {
    // Analyze color scheme to determine variant
    const hasGlass = colorScheme.glass.background !== 'transparent';
    if (hasGlass) return 'glass';

    const isMonochrome = colorScheme.primary === colorScheme.secondary;
    if (isMonochrome) return 'monochrome';

    return 'professional';
  }

  /**
   * Get Glass-Morphism template specifically
   */
  async getGlassMorphismTemplate(): Promise<PDFTemplate | null> {
    return this.getTemplate('glass-modern-template');
  }

  /**
   * Check if Glass-Morphism template is available
   */
  isGlassMorphismTemplateAvailable(): boolean {
    return this._templates().some(t => t.id === 'glass-modern-template');
  }

  /**
   * Get templates that support glass-morphism effects
   */
  getGlassCompatibleTemplates(): PDFTemplate[] {
    return this._templates().filter(t => t.features.supportsGlassMorphism);
  }

  /**
   * Create a custom glass template with different color scheme
   */
  createCustomGlassTemplate(
    colorScheme: PDFColorScheme,
    customName?: string
  ): PDFTemplate | null {
    const baseTemplate = this._templates().find(t => t.id === 'glass-modern-template');
    if (!baseTemplate) return null;

    const customTemplate: PDFTemplate = {
      ...baseTemplate,
      id: `glass-modern-custom-${Date.now()}`,
      name: customName || `${baseTemplate.name} (Custom)`,
      colorScheme,
      templateVersion: `${baseTemplate.templateVersion}-custom`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return customTemplate;
  }
}
