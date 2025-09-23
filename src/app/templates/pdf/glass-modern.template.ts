import { Injectable } from '@angular/core';
import {
  PDFTemplate,
  PDFColorScheme,
  PDFLayoutConfig,
  PDFSectionConfig,
  PDF_COLOR_SCHEMES,
  PDF_LAYOUT_PRESETS
} from '../../services/pdf-template.service';

// ============================================================================
// GLASS-MORPHISM PDF TEMPLATE IMPLEMENTATION
// ============================================================================

/**
 * Premium Glass-Morphism PDF Template
 * Translates the web glass-morphism design system to PDF format
 * Optimized for recruiter-friendly presentation with maximum visual impact
 */
@Injectable({
  providedIn: 'root'
})
export class GlassMorphismPDFTemplate {

  /**
   * Glass-Morphism Color Scheme for PDF
   * Dark theme with glass-morphism effects matching the preview
   */
  static readonly GLASS_COLOR_SCHEME: PDFColorScheme = {
    // Core brand colors (from web --primary, --secondary, --accent)
    primary: '#3b82f6',      // Electric blue (217 91% 60%)
    secondary: '#8b5cf6',    // Purple (280 70% 50%)
    accent: '#10b981',       // Green (150 80% 45%)

    // Background and surface colors (dark theme to match preview)
    background: '#1e1b4b',   // Dark purple background matching preview
    surface: '#312e81',      // Darker purple for cards
    text: '#f8fafc',         // Light text for dark background
    textSecondary: '#cbd5e1', // Light gray for secondary text
    muted: '#94a3b8',        // Medium gray for muted text

    // Glass-morphism specific colors and parameters (for dark backgrounds)
    glass: {
      // Legacy colors used by older utilities
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      highlight: 'rgba(255, 255, 255, 0.4)',

      // New standardized canvas rendering params
      fillColor: '#ffffff',
      strokeColor: '#ffffff',
      opacity: 0.08, // base default
      shadowColor: '#000000',
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.08,

      // Context presets to match current visuals exactly
      presets: {
        hero: { opacity: 0.1, shadowBlur: 10, shadowOffset: { x: 0, y: 2 }, shadowOpacity: 0.1 },
        card: { opacity: 0.06, shadowBlur: 5, shadowOffset: { x: 2, y: 2 }, shadowOpacity: 0.08 }
      },

      // Enhanced effects (Task 1.3)
      light: {
        direction: { x: -0.6, y: -0.8 },
        color: '#ffffff',
        intensity: 1,
        edgeStrength: 0.35,
        specularSize: 40,
        specularStrength: 0.22
      },
      noise: {
        amount: 0.02,
        scale: 1,
        type: 'mono'
      },
      borderOpts: {
        gradientAlphaTop: 0.35,
        gradientAlphaBottom: 0.15,
        thickness: 2
      }
    },

    // Status colors (adjusted for dark background)
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };

  /**
   * Glass-Morphism Layout Configuration
   * Optimized for A4 format with glass card positioning
   */
  static readonly GLASS_LAYOUT_CONFIG: PDFLayoutConfig = {
    format: 'A4',
    orientation: 'portrait',
    margins: {
      top: 15,    // Reduced margins for more content
      right: 15,
      bottom: 15,
      left: 15
    },
    columns: 2,     // Two-column layout for optimal information density
    columnGap: 12,  // Space between columns
    spacing: {
      section: 14,    // Space between sections
      paragraph: 8,   // Space between paragraphs
      line: 4,        // Line spacing
      element: 6      // Element spacing
    },
    radii: {
      card: 8,
      chip: 1,
      button: 4
    },
    typography: {
      baseSize: 11,     // Slightly smaller for more content
      scaleRatio: 1.25, // Typography scale
      lineHeight: 1.4   // Compact line height
    }
  };

  /**
   * Glass-Morphism Section Definitions
   * Defines the layout and positioning of each CV section
   */
  static readonly GLASS_SECTIONS: PDFSectionConfig[] = [
    // Hero Section - Full width header with glass effect
    {
      id: 'hero-section',
      name: 'Hero',
      page: 1,
      position: { x: 0, y: 0, width: 100, height: 25 },
      variant: 'glass-hero',
      required: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Personal Info - Left column
    {
      id: 'personal-info-section',
      name: 'Personal Information',
      page: 1,
      position: { x: 0, y: 25, width: 35, height: 30 },
      variant: 'glass-sidebar',
      required: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Skills - Left column continuation
    {
      id: 'skills-section',
      name: 'Skills',
      page: 1,
      position: { x: 0, y: 55, width: 35, height: 45 },
      variant: 'glass-sidebar',
      required: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Experience - Right column
    {
      id: 'experience-section',
      name: 'Experience',
      page: 1,
      position: { x: 37, y: 25, width: 63, height: 50 },
      variant: 'glass-content',
      required: true,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Projects - Right column continuation
    {
      id: 'projects-section',
      name: 'Projects',
      page: 1,
      position: { x: 37, y: 75, width: 63, height: 25 },
      variant: 'glass-content',
      required: true,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  /**
   * Complete Glass-Morphism Template Definition
   */
  static readonly GLASS_MODERN_TEMPLATE: PDFTemplate = {
    // Basic template information
    id: 'glass-modern-template',
    name: 'Glass Modern',
    description: 'Premium glass-morphism template with translucent effects and modern typography. Optimized for recruiter impact with clean, professional presentation.',
    targetAudience: 'recruiter',

    // Page constraints
    maxPages: 2,
    minPages: 1,

    // Design system integration
    colorScheme: GlassMorphismPDFTemplate.GLASS_COLOR_SCHEME,
    layout: GlassMorphismPDFTemplate.GLASS_LAYOUT_CONFIG,
    sections: GlassMorphismPDFTemplate.GLASS_SECTIONS,

    // Template metadata
    version: 1,
    templateVersion: '1.0.0',
    author: 'Lubomir of Slavigrad',
    preview: '/assets/templates/glass-modern-preview.png',

    // Feature capabilities
    features: {
      supportsGlassMorphism: true,
      supportsCharts: true,
      supportsImages: true,
      supportsCustomFonts: true
    },

    // Performance characteristics
    performance: {
      estimatedGenerationTime: 2500, // 2.5 seconds
      memoryUsage: 'medium',
      complexity: 'moderate'
    },

    // Entity metadata
    createdAt: new Date(),
    updatedAt: new Date(),
    visibility: 'public',
    priority: 1,
    tags: ['glass-morphism', 'modern', 'recruiter-friendly', 'premium']
  };

  /**
   * Get the complete template definition
   */
  static getTemplate(): PDFTemplate {
    return { ...this.GLASS_MODERN_TEMPLATE };
  }

  /**
   * Get template with custom color scheme
   */
  static getTemplateWithColorScheme(colorScheme: PDFColorScheme): PDFTemplate {
    return {
      ...this.GLASS_MODERN_TEMPLATE,
      colorScheme,
      id: `${this.GLASS_MODERN_TEMPLATE.id}-custom`,
      updatedAt: new Date()
    };
  }

  /**
   * Get template with custom layout
   */
  static getTemplateWithLayout(layout: PDFLayoutConfig): PDFTemplate {
    return {
      ...this.GLASS_MODERN_TEMPLATE,
      layout,
      id: `${this.GLASS_MODERN_TEMPLATE.id}-custom-layout`,
      updatedAt: new Date()
    };
  }

  /**
   * Validate template configuration
   */
  static validateTemplate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const template = this.GLASS_MODERN_TEMPLATE;

    // Validate sections don't overlap
    const sections = template.sections;
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const section1 = sections[i];
        const section2 = sections[j];

        // Check for overlap on same page
        if (section1.page === section2.page) {
          const overlap = this.checkSectionOverlap(section1, section2);
          if (overlap) {
            errors.push(`Sections ${section1.name} and ${section2.name} overlap on page ${section1.page}`);
          }
        }
      }
    }

    // Validate color scheme
    if (!template.colorScheme.glass.background) {
      errors.push('Glass background color is required for glass-morphism template');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if two sections overlap
   */
  private static checkSectionOverlap(section1: PDFSectionConfig, section2: PDFSectionConfig): boolean {
    const s1 = section1.position;
    const s2 = section2.position;

    return !(
      s1.x + s1.width <= s2.x ||
      s2.x + s2.width <= s1.x ||
      s1.y + s1.height <= s2.y ||
      s2.y + s2.height <= s1.y
    );
  }
}

// ============================================================================
// GLASS-MORPHISM PDF RENDERING UTILITIES
// ============================================================================

/**
 * PDF Glass Effects Renderer
 * Translates web glass-morphism effects to PDF-compatible rendering
 */
export class PDFGlassRenderer {

  /**
   * Render glass-morphism card effect in PDF
   * Simulates backdrop-blur and transparency using layered shapes
   */
  static renderGlassCard(
    pdf: any, // jsPDF instance
    x: number,
    y: number,
    width: number,
    height: number,
    colorScheme: PDFColorScheme,
    options: {
      cornerRadius?: number;
      shadowOffset?: number;
      borderWidth?: number;
      opacity?: number;
    } = {}
  ): void {
    const {
      cornerRadius = 3,
      shadowOffset = 1,
      borderWidth = 0.3,
      opacity = 0.1
    } = options;

    // Save current graphics state
    pdf.saveGraphicsState();

    // 1. Render shadow layer (simulates box-shadow)
    pdf.setFillColor(0, 0, 0);
    pdf.setGState(new pdf.GState({ opacity: 0.15 }));
    pdf.roundedRect(
      x + shadowOffset,
      y + shadowOffset,
      width,
      height,
      cornerRadius,
      cornerRadius,
      'F'
    );

    // 2. Render glass background (simulates backdrop-blur background)
    const glassColor = this.parseRGBA(colorScheme.glass.background);
    pdf.setFillColor(glassColor.r, glassColor.g, glassColor.b);
    pdf.setGState(new pdf.GState({ opacity: glassColor.a }));
    pdf.roundedRect(x, y, width, height, cornerRadius, cornerRadius, 'F');

    // 3. Render glass border (simulates border with transparency)
    const borderColor = this.parseRGBA(colorScheme.glass.border);
    pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
    pdf.setGState(new pdf.GState({ opacity: borderColor.a }));
    pdf.setLineWidth(borderWidth);
    pdf.roundedRect(x, y, width, height, cornerRadius, cornerRadius, 'S');

    // 4. Render highlight effect (simulates inset highlight)
    const highlightColor = this.parseRGBA(colorScheme.glass.highlight);
    pdf.setDrawColor(highlightColor.r, highlightColor.g, highlightColor.b);
    pdf.setGState(new pdf.GState({ opacity: highlightColor.a * 0.5 }));
    pdf.setLineWidth(0.2);
    pdf.roundedRect(
      x + 0.5,
      y + 0.5,
      width - 1,
      height - 1,
      cornerRadius - 0.5,
      cornerRadius - 0.5,
      'S'
    );

    // Restore graphics state
    pdf.restoreGraphicsState();
  }

  /**
   * Render glass-morphism hero section
   * Special rendering for the hero section with gradient-like effect
   */
  static renderGlassHero(
    pdf: any,
    x: number,
    y: number,
    width: number,
    height: number,
    colorScheme: PDFColorScheme
  ): void {
    pdf.saveGraphicsState();

    // Background gradient simulation using multiple layers
    const steps = 5;
    const stepHeight = height / steps;

    for (let i = 0; i < steps; i++) {
      const opacity = 0.15 - (i * 0.02); // Decreasing opacity
      const currentY = y + (i * stepHeight);

      pdf.setFillColor(59, 130, 246); // Primary blue
      pdf.setGState(new pdf.GState({ opacity }));
      pdf.rect(x, currentY, width, stepHeight, 'F');
    }

    // Glass overlay
    this.renderGlassCard(pdf, x, y, width, height, colorScheme, {
      cornerRadius: 0,
      shadowOffset: 0,
      borderWidth: 0
    });

    pdf.restoreGraphicsState();
  }

  /**
   * Render glass-morphism sidebar section
   * Optimized for left column content with subtle glass effect
   */
  static renderGlassSidebar(
    pdf: any,
    x: number,
    y: number,
    width: number,
    height: number,
    colorScheme: PDFColorScheme
  ): void {
    this.renderGlassCard(pdf, x, y, width, height, colorScheme, {
      cornerRadius: 4,
      shadowOffset: 0.5,
      borderWidth: 0.2,
      opacity: 0.08
    });
  }

  /**
   * Render glass-morphism content section
   * Optimized for main content areas with enhanced readability
   */
  static renderGlassContent(
    pdf: any,
    x: number,
    y: number,
    width: number,
    height: number,
    colorScheme: PDFColorScheme
  ): void {
    this.renderGlassCard(pdf, x, y, width, height, colorScheme, {
      cornerRadius: 3,
      shadowOffset: 1,
      borderWidth: 0.3,
      opacity: 0.12
    });
  }

  /**
   * Parse RGBA color string to RGB values with alpha
   */
  private static parseRGBA(rgba: string): { r: number; g: number; b: number; a: number } {
    // Handle rgba(r, g, b, a) format
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1
      };
    }

    // Fallback to white with low opacity
    return { r: 255, g: 255, b: 255, a: 0.1 };
  }

  /**
   * Apply glass-morphism text styling
   * Optimized text rendering for glass backgrounds
   */
  static applyGlassTextStyle(
    pdf: any,
    colorScheme: PDFColorScheme,
    textType: 'primary' | 'secondary' | 'accent' = 'primary'
  ): void {
    switch (textType) {
      case 'primary':
        pdf.setTextColor(248, 250, 252); // text color
        break;
      case 'secondary':
        pdf.setTextColor(203, 213, 225); // textSecondary color
        break;
      case 'accent':
        pdf.setTextColor(59, 130, 246); // primary accent color
        break;
    }
  }
}
