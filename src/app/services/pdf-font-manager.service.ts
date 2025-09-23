import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

/**
 * Font configuration for PDF rendering
 */
export interface PDFFontDefinition {
  family: string;
  style: 'normal' | 'bold' | 'italic' | 'bolditalic';
  weight: number;
  src?: string; // Base64 encoded font data
  filename?: string; // Font filename for jsPDF
}

/**
 * Font family configuration
 */
export interface PDFFontFamily {
  name: string;
  fonts: PDFFontDefinition[];
  fallbacks: string[];
}

/**
 * Professional font configurations for PDF generation
 */
@Injectable({
  providedIn: 'root'
})
export class PDFFontManagerService {

  /**
   * Built-in jsPDF fonts that are always available
   */
  private readonly builtInFonts = {
    helvetica: {
      name: 'helvetica',
      fonts: [
        { family: 'helvetica', style: 'normal' as const, weight: 400 },
        { family: 'helvetica', style: 'bold' as const, weight: 700 },
        { family: 'helvetica', style: 'italic' as const, weight: 400 },
        { family: 'helvetica', style: 'bolditalic' as const, weight: 700 }
      ],
      fallbacks: ['times', 'courier']
    },
    times: {
      name: 'times',
      fonts: [
        { family: 'times', style: 'normal' as const, weight: 400 },
        { family: 'times', style: 'bold' as const, weight: 700 },
        { family: 'times', style: 'italic' as const, weight: 400 },
        { family: 'times', style: 'bolditalic' as const, weight: 700 }
      ],
      fallbacks: ['helvetica', 'courier']
    },
    courier: {
      name: 'courier',
      fonts: [
        { family: 'courier', style: 'normal' as const, weight: 400 },
        { family: 'courier', style: 'bold' as const, weight: 700 },
        { family: 'courier', style: 'italic' as const, weight: 400 },
        { family: 'courier', style: 'bolditalic' as const, weight: 700 }
      ],
      fallbacks: ['helvetica', 'times']
    }
  };

  /**
   * Professional font configurations optimized for CV generation
   */
  private readonly professionalFonts = {
    primary: this.builtInFonts.helvetica,
    secondary: this.builtInFonts.helvetica,
    monospace: this.builtInFonts.courier,
    heading: this.builtInFonts.helvetica,
    body: this.builtInFonts.helvetica
  };

  /**
   * Get available fonts in jsPDF instance
   */
  getAvailableFonts(pdf: jsPDF): Record<string, string[]> {
    try {
      return (pdf as any).getFontList ? (pdf as any).getFontList() : {};
    } catch (error) {
      console.warn('[PDFFontManagerService] Could not retrieve font list:', error);
      return {};
    }
  }

  /**
   * Check if a specific font is available
   */
  isFontAvailable(pdf: jsPDF, fontFamily: string): boolean {
    const availableFonts = this.getAvailableFonts(pdf);
    return fontFamily in availableFonts;
  }

  /**
   * Get the best available font for a given purpose
   */
  getBestFont(pdf: jsPDF, purpose: 'primary' | 'secondary' | 'monospace' | 'heading' | 'body'): PDFFontFamily {
    const targetFont = this.professionalFonts[purpose];

    // Check if the target font is available
    if (this.isFontAvailable(pdf, targetFont.name)) {
      return targetFont;
    }

    // Try fallbacks
    for (const fallback of targetFont.fallbacks) {
      if (this.isFontAvailable(pdf, fallback)) {
        return this.builtInFonts[fallback as keyof typeof this.builtInFonts];
      }
    }

    // Ultimate fallback to helvetica
    return this.builtInFonts.helvetica;
  }

  /**
   * Configure fonts for a PDF document
   */
  configurePDFFonts(pdf: jsPDF): void {
    console.log('[PDFFontManagerService] Configuring PDF fonts...');

    const availableFonts = this.getAvailableFonts(pdf);
    console.log('[PDFFontManagerService] Available fonts:', Object.keys(availableFonts));

    // Verify all our professional fonts are available
    const fontStatus = {
      primary: this.isFontAvailable(pdf, this.professionalFonts.primary.name),
      secondary: this.isFontAvailable(pdf, this.professionalFonts.secondary.name),
      monospace: this.isFontAvailable(pdf, this.professionalFonts.monospace.name)
    };

    console.log('[PDFFontManagerService] Font status:', fontStatus);

    // All our fonts should be available since we're using built-ins
    if (Object.values(fontStatus).every(status => status)) {
      console.log('[PDFFontManagerService] All fonts configured successfully');
    } else {
      console.warn('[PDFFontManagerService] Some fonts may not be available');
    }
  }

  /**
   * Apply font to PDF with proper fallback
   */
  applyFont(pdf: jsPDF, purpose: 'primary' | 'secondary' | 'monospace' | 'heading' | 'body', style: 'normal' | 'bold' | 'italic' = 'normal'): void {
    const fontFamily = this.getBestFont(pdf, purpose);

    // Map style to jsPDF font style
    const jsPDFStyle = style === 'bold' ? 'bold' : style === 'italic' ? 'italic' : 'normal';

    const anyPdf = pdf as any;
    if (typeof anyPdf.setFont === 'function') {
      try {
        anyPdf.setFont(fontFamily.name, jsPDFStyle);
      } catch (error) {
        console.warn(`[PDFFontManagerService] Failed to apply font ${fontFamily.name} with style ${jsPDFStyle}, falling back to helvetica`);
        try { anyPdf.setFont('helvetica', jsPDFStyle); } catch {}
      }
    } else {
      console.warn('[PDFFontManagerService] setFont unavailable on pdf instance; proceeding without changing font family');
    }
  }

  /**
   * Get font metrics for layout calculations
   */
  getFontMetrics(pdf: jsPDF, fontSize: number, purpose: 'primary' | 'secondary' | 'monospace' = 'primary'): {
    lineHeight: number;
    charWidth: number;
    spaceWidth: number;
  } {
    const fontFamily = this.getBestFont(pdf, purpose);

    // Set font for measurements (if available)
    const anyPdf = pdf as any;
    if (typeof anyPdf.setFont === 'function') {
      try { anyPdf.setFont(fontFamily.name, 'normal'); } catch {}
    }
    if (typeof anyPdf.setFontSize === 'function') {
      try { anyPdf.setFontSize(fontSize); } catch {}
    }

    // Calculate metrics with safe fallbacks
    const lineHeight = fontSize * 1.2; // Standard line height
    const charWidth = typeof anyPdf.getTextWidth === 'function' ? anyPdf.getTextWidth('M') : fontSize * 0.6;
    const spaceWidth = typeof anyPdf.getTextWidth === 'function' ? anyPdf.getTextWidth(' ') : fontSize * 0.33;

    return {
      lineHeight,
      charWidth,
      spaceWidth
    };
  }

  /**
   * Future: Add custom font embedding capability
   * This method would handle loading and embedding custom fonts like Inter or JetBrains Mono
   */
  async embedCustomFont(pdf: jsPDF, fontDefinition: PDFFontDefinition): Promise<boolean> {
    try {
      if (!fontDefinition.src || !fontDefinition.filename) {
        console.warn('[PDFFontManagerService] Custom font embedding requires src and filename');
        return false;
      }

      // Add font to jsPDF virtual file system
      pdf.addFileToVFS(fontDefinition.filename, fontDefinition.src);

      // Register the font
      pdf.addFont(fontDefinition.filename, fontDefinition.family, fontDefinition.style);

      console.log(`[PDFFontManagerService] Successfully embedded custom font: ${fontDefinition.family}`);
      return true;
    } catch (error) {
      console.error(`[PDFFontManagerService] Failed to embed custom font ${fontDefinition.family}:`, error);
      return false;
    }
  }

  /**
   * Advanced typography scale tuned for PDF and glass contexts
   */
  getTypographyScale(params?: {
    pageWidth?: number; // in points (A4 ~ 595)
    density?: 'compact' | 'normal' | 'spacious';
  }): {
    name: number;
    title: number;
    sectionHeader: number;
    body: number;
    caption: number;
    small: number;
    lineHeights: {
      heading: number; // multiplier
      body: number;    // multiplier
      small: number;   // multiplier
    };
    tracking: {
      heading: number; // letter spacing in em
      body: number;
      small: number;
    };
  } {
    const pageWidth = params?.pageWidth ?? 595; // A4 width in points at 72DPI
    const density = params?.density ?? 'normal';

    // Base sizes aligned with previous defaults to avoid regressions
    let base = {
      name: 24,
      title: 16,
      sectionHeader: 14,
      body: 11,
      caption: 10,
      small: 9
    };

    // Slightly adapt scale by page width to keep visual proportion across formats
    // Keep adjustments conservative to remain compatible with current expectations
    if (pageWidth > 595) {
      const factor = Math.min(1.1, pageWidth / 595);
      base = {
        name: Math.round(base.name * factor),
        title: Math.round(base.title * factor),
        sectionHeader: Math.round(base.sectionHeader * factor),
        body: Math.round(base.body * factor),
        caption: Math.round(base.caption * factor),
        small: Math.round(base.small * factor)
      };
    }

    // Density adjustments (compact reduces, spacious increases slightly)
    if (density !== 'normal') {
      const df = density === 'compact' ? 0.95 : 1.05;
      base = {
        name: Math.round(base.name * df),
        title: Math.round(base.title * df),
        sectionHeader: Math.round(base.sectionHeader * df),
        body: Math.round(base.body * df),
        caption: Math.round(base.caption * df),
        small: Math.round(base.small * df)
      };
    }

    // Line heights and tracking tuned for print-PDF legibility
    const lineHeights = {
      heading: 1.15,
      body: 1.35,
      small: 1.3
    };

    const tracking = {
      heading: 0.0, // keep headings crisp
      body: 0.0,
      small: 0.01 // tiny spacing for small text to prevent ink gain
    };

    return { ...base, lineHeights, tracking };
  }

  /**
   * Backwards-compatible helper used by existing renderers
   */
  getRecommendedFontSizes(): {
    name: number;
    title: number;
    sectionHeader: number;
    body: number;
    caption: number;
    small: number;
  } {
    const scale = this.getTypographyScale();
    const { name, title, sectionHeader, body, caption, small } = scale;
    return { name, title, sectionHeader, body, caption, small };
  }
}
