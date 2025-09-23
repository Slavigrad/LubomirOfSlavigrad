import { PDFLayoutConfig } from './pdf-template.service';

/**
 * LayoutManager centralizes page geometry, conversions, spacing and radii.
 * It mirrors existing hardcoded behavior to ensure zero visual regression.
 */
export class LayoutManager {
  constructor(private readonly cfg: PDFLayoutConfig) {}

  // --- Conversions
  mmToPx(mm: number, dpi: number): number {
    return (mm / 25.4) * dpi;
  }

  pxToMm(px: number, dpi: number): number {
    return (px / dpi) * 25.4;
  }

  // Canvas conversions based on current page size and canvas dimensions
  mmToCanvasX(mm: number, canvasWidth: number): number {
    const page = this.getPageRect();
    return (mm / page.width) * canvasWidth;
  }

  mmToCanvasY(mm: number, canvasHeight: number): number {
    const page = this.getPageRect();
    return (mm / page.height) * canvasHeight;
  }

  widthMmToCanvasPx(widthMm: number, canvasWidth: number): number {
    const page = this.getPageRect();
    return (widthMm / page.width) * canvasWidth;
  }

  heightMmToCanvasPx(heightMm: number, canvasHeight: number): number {
    const page = this.getPageRect();
    return (heightMm / page.height) * canvasHeight;
  }


  // --- Page geometry (mm)
  getPageRect(): { width: number; height: number } {
    const { format, orientation } = this.cfg;
    // Match previous behavior: A4 (210x297), others treated as Letter (216x279)
    let width = 210;
    let height = 297;
    if (format !== 'A4') {
      if (format === 'Legal') {
        width = 216; height = 356; // Legal ~ 8.5x14 in (rounded)
      } else {
        width = 216; height = 279; // Letter ~ 8.5x11 in (rounded)
      }
    }
    const isLandscape = orientation === 'landscape';
    return isLandscape ? { width: height, height: width } : { width, height };
  }

  getContentRect(): { x: number; y: number; width: number; height: number } {
    const page = this.getPageRect();
    const { top, right, bottom, left } = this.cfg.margins;
    return {
      x: left,
      y: top,
      width: page.width - left - right,
      height: page.height - top - bottom,
    };
  }

  // Sidebar: keep 35% width as used by current implementation
  getSidebarRect(): { x: number; y: number; width: number; height: number } {
    const content = this.getContentRect();
    return {
      x: content.x,
      y: content.y,
      width: this.getPageRect().width * 0.35, // preserve prior behavior (based on full page width)
      height: content.height,
    };
  }

  getMainContentRect(): { x: number; y: number; width: number; height: number } {
    const page = this.getPageRect();
    const content = this.getContentRect();
    const sidebarWidth = page.width * 0.35;
    return {
      x: content.x + sidebarWidth + this.cfg.columnGap,
      y: content.y,
      width: content.width - sidebarWidth - this.cfg.columnGap,
      height: content.height,
    };
  }

  // --- Spacing and radii
  getSpacing(type: 'section' | 'paragraph' | 'line' | 'element'): number {
    return this.cfg.spacing[type];
  }

  // Read radii from template configuration
  getRadius(type: 'card' | 'chip' | 'button'): number {
    return this.cfg.radii[type];
  }

  // --- Precision Grid API (non-breaking, additive)
  /**
   * Compute a 16-column grid inside the content rect.
   * Options allow overriding columns/gutter in millimeters.
   */
  getGridSpec(options?: { columns?: number; gutterMm?: number }): {
    columns: number;
    gutterMm: number;
    content: { x: number; y: number; width: number; height: number };
    columnWidthMm: number;
  } {
    const cols = Math.max(1, Math.floor(options?.columns ?? 16));
    const content = this.getContentRect();

    // Derive a sensible gutter from template spacing if not provided
    const derivedGutter = Math.max(2, Math.min(10,
      this.cfg.spacing.element + (this.cfg.spacing.paragraph - this.cfg.spacing.element) * 0.5
    ));
    const gutterMm = options?.gutterMm ?? derivedGutter;

    const totalGutters = Math.max(0, cols - 1) * gutterMm;
    const columnWidthMm = (content.width - totalGutters) / cols;

    return { columns: cols, gutterMm, content, columnWidthMm };
  }

  /**
   * Get a rectangle for a column span within the grid (by start column and span length).
   * Columns are 1-based indices; span >= 1.
   */
  getGridRectBySpan(startCol: number, span: number, options?: { columns?: number; gutterMm?: number }):
    { x: number; y: number; width: number; height: number } {
    const spec = this.getGridSpec(options);
    const s = Math.max(1, Math.min(startCol, spec.columns));
    const sp = Math.max(1, Math.min(span, spec.columns - s + 1));

    const x = spec.content.x + (s - 1) * (spec.columnWidthMm + spec.gutterMm);
    const width = sp * spec.columnWidthMm + Math.max(0, sp - 1) * spec.gutterMm;
    return { x, y: spec.content.y, width, height: spec.content.height };
  }

  /** Base baseline step in mm for vertical rhythm (aligned to spacing.line). */
  getBaselineStepMm(): number {
    return this.cfg.spacing.line;
  }

  /** Elevation-aware spacing multiplier for padding/margins around glass cards. */
  getElevationSpacingMm(level: 0 | 1 | 2 | 3 | 4, base: 'element' | 'paragraph' = 'element'): number {
    const baseMm = this.cfg.spacing[base];
    const multiplier = 1 + level * 0.12; // gentle scale-up per elevation
    return Math.round((baseMm * multiplier) * 100) / 100; // keep it tidy
  }

  /** Elevation-aware gutter suggestion between sibling cards. */
  getGutterForElevationMm(level: 0 | 1 | 2 | 3 | 4): number {
    const baseGutter = Math.max(2, Math.min(10,
      this.cfg.spacing.element + (this.cfg.spacing.paragraph - this.cfg.spacing.element) * 0.5
    ));
    return Math.round((baseGutter * (1 + level * 0.08)) * 100) / 100;
  }



}
