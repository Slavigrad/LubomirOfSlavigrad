import { PDFColorScheme } from './pdf-template.service';

/**
 * ColorManager centralizes color parsing, alpha application and
 * common gradient creation for glass-morphism rendering.
 *
 * IMPORTANT: Visual output must remain identical to the previous
 * inline logic. Default gradient stop colors mirror existing hardcoded
 * rgba values used in the renderer. The scheme is accepted for
 * future configurability without changing visuals now.
 */
export class ColorManager {
  constructor(private readonly scheme: PDFColorScheme) {}

  // Static helpers for convenience where a scheme is not needed
  static parseHex(hex: string): { r: number; g: number; b: number } {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3
      ? normalized.split('').map(c => c + c).join('')
      : normalized;
    const num = parseInt(value, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  static rgbaFromHex(hex: string, alpha: number): string {
    const { r, g, b } = ColorManager.parseHex(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Instance variants
  parseHex(hex: string): { r: number; g: number; b: number } {
    return ColorManager.parseHex(hex);
  }

  rgbaFromHex(hex: string, alpha: number): string {
    const { r, g, b } = ColorManager.parseHex(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

  // Create a linear gradient with provided stops
  createLinearGradient(
    ctx: CanvasRenderingContext2D,
    x0: number, y0: number,
    x1: number, y1: number,
    stops: Array<{ offset: number; color: string }>
  ): CanvasGradient {
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const s of stops) grad.addColorStop(s.offset, s.color);
    return grad;
  }

  // Hero background gradient (keeps existing visual: blue -> purple -> pink with subtle alphas)
  createHeroGradient(ctx: CanvasRenderingContext2D, width: number, heroHeight: number): CanvasGradient {
    return this.createLinearGradient(ctx, 0, 0, width, heroHeight, [
      { offset: 0.0, color: 'rgba(59, 130, 246, 0.1)' },   // Primary blue
      { offset: 0.5, color: 'rgba(147, 51, 234, 0.08)' }, // Purple
      { offset: 1.0, color: 'rgba(236, 72, 153, 0.06)' }  // Pink
    ]);
  }

  // Sidebar card subtle vertical gradient (keeps existing visual: blue alpha fade)
  createSidebarCardGradient(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    height: number
  ): CanvasGradient {
    return this.createLinearGradient(ctx, x, y, x, y + height, [
      { offset: 0.0, color: 'rgba(59, 130, 246, 0.08)' }, // Light blue
      { offset: 1.0, color: 'rgba(59, 130, 246, 0.04)' }  // Lighter blue
    ]);
  }

  // Utility: apply an alpha to a hex color (uses scheme if needed later)
  withAlpha(hex: string, alpha: number): string {
    return this.rgbaFromHex(hex, alpha);
  }
  // Glass-aware contrast enhancement: gently increases contrast for text over translucent glass
  static enhanceContrastForGlass(hex: string, elevation: number = 2): { r: number; g: number; b: number } {
    const { r, g, b } = ColorManager.parseHex(hex);
    // Relative luminance approximation
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    // Higher elevations get slightly stronger adjustment (clamped)
    const factor = Math.min(0.12, 0.04 + (elevation * 0.02));
    const target = lum > 0.6 ? 255 : 0; // lighten light text, darken dark text
    const adjust = (c: number) => Math.round(c + (target - c) * factor);
    return { r: adjust(r), g: adjust(g), b: adjust(b) };
  }

  enhanceContrastForGlass(hex: string, elevation: number = 2): { r: number; g: number; b: number } {
    return ColorManager.enhanceContrastForGlass(hex, elevation);
  }

}

