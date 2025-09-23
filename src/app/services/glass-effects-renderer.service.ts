import jsPDF from 'jspdf';
import { ColorManager } from './color-manager.service';
// Dynamic import type for optional DOM rasterization
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type html2canvasType from 'html2canvas';


export interface ShadowParams {
  color: string; // hex like '#000000'
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number; // 0..1
}

export interface GlassCardParams {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fillColor: string;   // hex color for glass fill (typically '#ffffff')
  strokeColor: string; // hex color for border (typically '#ffffff')
  opacity: number;     // 0..1 translucency for the glass


  shadow?: ShadowParams;
  // Optional: if caller wants to use a gradient instead of flat fill
  fillStyle?: CanvasGradient | string;
}

/**
 * Encapsulates glass-morphism drawing primitives so PDFRendererService
 * can delegate rounded rect paths, shadows, overlays, and canvas→PDF flow.
 */
export interface DomRasterizeOptions {
  cacheKey?: string;
  scale?: number; // default 2
  backgroundColor?: string | null; // default null (transparent)
  useCORS?: boolean; // default true
}

export class GlassEffectsRenderer {


  renderRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle?: string | CanvasGradient,
    strokeStyle?: string
  ): void {
    ctx.beginPath();
    if (radius > 0) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    } else {
      ctx.rect(x, y, width, height);
    }
    ctx.closePath();

    if (fillStyle) {
      ctx.fillStyle = fillStyle as any;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  }

  applyShadow(ctx: CanvasRenderingContext2D, shadow: ShadowParams | undefined): void {
    if (!shadow) return;
    ctx.shadowColor = ColorManager.rgbaFromHex(shadow.color, Math.max(0, Math.min(1, shadow.opacity)));
    ctx.shadowBlur = Math.max(0, shadow.blur);
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
  }

  renderGlassCard(ctx: CanvasRenderingContext2D, params: GlassCardParams): void {
    const { x, y, width, height, radius, fillColor, strokeColor, opacity, shadow, fillStyle } = params;
    ctx.save();
    try {
      // Shadow
      this.applyShadow(ctx, shadow);

      // Fill
      const fill = fillStyle ?? ColorManager.rgbaFromHex(fillColor, opacity);
      // Border
      const stroke = ColorManager.rgbaFromHex(strokeColor, Math.min(1, opacity * 0.8));

      ctx.lineWidth = 1;
      this.renderRoundedRect(ctx, x, y, width, height, radius, fill, stroke);
    } finally {
      ctx.restore();
      }
    }


  /**
   * Directional edge lighting stroke along the bright side of the card.
   */
  drawEdgeLight(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, width: number, height: number, radius: number,
    opts: { direction: { x: number; y: number }; color?: string; strength?: number; thickness?: number }
  ): void {
    const dir = opts.direction || { x: -0.6, y: -0.8 };
    const color = opts.color || '#ffffff';
    const strength = Math.max(0, Math.min(1, opts.strength ?? 0.35));
    const thickness = Math.max(0.5, opts.thickness ?? 2);

    // Gradient across light direction
    const cx = x + width / 2, cy = y + height / 2;
    const len = Math.hypot(dir.x, dir.y) || 1;
    const nx = dir.x / len, ny = dir.y / len;
    const gx0 = cx + nx * (Math.min(width, height) * 0.6);
    const gy0 = cy + ny * (Math.min(width, height) * 0.6);
    const gx1 = cx - nx * (Math.min(width, height) * 0.6);
    const gy1 = cy - ny * (Math.min(width, height) * 0.6);

    const grad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
    grad.addColorStop(0, ColorManager.rgbaFromHex(color, strength));
    grad.addColorStop(0.5, ColorManager.rgbaFromHex(color, strength * 0.2));
    grad.addColorStop(1, ColorManager.rgbaFromHex(color, 0));

    ctx.save();
    try {
      // Clip to shape and draw stroke
      this.renderRoundedRect(ctx, x, y, width, height, radius);
      ctx.clip();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.lineWidth = thickness;
      this.renderRoundedRect(ctx, x + thickness, y + thickness, width - thickness * 2, height - thickness * 2, Math.max(0, radius - thickness), undefined, grad as any);
    } finally {
      ctx.restore();
    }
  }

  /**
   * Specular highlight spot near the light-facing corner.
   */
  drawSpecularSpot(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, width: number, height: number, radius: number,
    opts: { direction: { x: number; y: number }; color?: string; size?: number; strength?: number }
  ): void {
    const dir = opts.direction || { x: -0.6, y: -0.8 };
    const color = opts.color || '#ffffff';
    const size = Math.max(10, opts.size ?? 36);
    const strength = Math.max(0, Math.min(1, opts.strength ?? 0.22));
    const cx = x + width / 2, cy = y + height / 2;
    const len = Math.hypot(dir.x, dir.y) || 1;
    const nx = dir.x / len, ny = dir.y / len;
    const px = cx + nx * (Math.min(width, height) * 0.25);
    const py = cy + ny * (Math.min(width, height) * 0.25);

    const grad = ctx.createRadialGradient(px, py, 0, px, py, size);
    grad.addColorStop(0, ColorManager.rgbaFromHex(color, strength));
    grad.addColorStop(1, ColorManager.rgbaFromHex(color, 0));

    ctx.save();
    try {
      this.renderRoundedRect(ctx, x, y, width, height, radius);
      ctx.clip();
      ctx.fillStyle = grad as any;
      ctx.fillRect(x, y, width, height);
    } finally {
      ctx.restore();
    }
  }

  /**
   * Subtle micro-noise overlay to sell frosted glass texture.
   */
  private _noisePatternCache = new Map<string, CanvasPattern | null>();
  private _createNoisePattern(ctx: CanvasRenderingContext2D, amount: number, scale = 1, type: 'mono' | 'rgb' = 'mono'): CanvasPattern | null {
    const key = `${amount}|${scale}|${type}`;
    if (this._noisePatternCache.has(key)) return this._noisePatternCache.get(key) || null;
    const size = Math.max(16, Math.floor(48 * scale));
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const g = c.getContext('2d');
    if (!g) return null;
    const img = g.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 255 * Math.random();
      if (type === 'rgb') {
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v;
      } else {
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v;
      }
      img.data[i + 3] = Math.floor(255 * Math.min(0.1, Math.max(0, amount))); // clamp
    }
    g.putImageData(img, 0, 0);
    const pattern = ctx.createPattern(c, 'repeat');
    this._noisePatternCache.set(key, pattern);
    return pattern;
  }

  drawMicroNoise(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, width: number, height: number, radius: number,
    amount = 0.02, scale = 1, type: 'mono' | 'rgb' = 'mono'
  ): void {
    const pattern = this._createNoisePattern(ctx, amount, scale, type);
    if (!pattern) return;
    ctx.save();
    try {
      this.renderRoundedRect(ctx, x, y, width, height, radius);
      ctx.clip();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = pattern;
      ctx.fillRect(x, y, width, height);
    } finally {
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }
  }

  /**
   * Optional gradient border pass for extra premium look.
   * alphaTop/bottom are 0..1 applied to strokeColor.
   */
  drawGradientBorder(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, width: number, height: number, radius: number,
    strokeHex: string,
    alphaTop = 0.35,
    alphaBottom = 0.15
  ): void {
    ctx.save();
    try {
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, ColorManager.rgbaFromHex(strokeHex, Math.max(0, Math.min(1, alphaTop))));
      grad.addColorStop(1, ColorManager.rgbaFromHex(strokeHex, Math.max(0, Math.min(1, alphaBottom))));
      // Ensure the border stroke is crisp (no shadow bleed)
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5;
      this.renderRoundedRect(ctx, x, y, width, height, radius, undefined, grad as any);
    } finally {
      ctx.restore();
    }
  }

  /**
   * Optional inner top highlight to sell the glass refraction.
   */
  drawInnerHighlight(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, width: number, height: number, radius: number,
    whiteHex = '#ffffff',
    strength = 0.12
  ): void {
    ctx.save();
    try {
      // Clip to the card shape
      this.renderRoundedRect(ctx, x, y, width, height, radius);
      ctx.clip();
      // Draw a top-to-down gradient highlight over ~35% of the card height
      const highlightHeight = Math.max(8, height * 0.35);
      const grad = ctx.createLinearGradient(x, y, x, y + highlightHeight);
      grad.addColorStop(0, ColorManager.rgbaFromHex(whiteHex, Math.max(0, Math.min(1, strength))));
      grad.addColorStop(1, ColorManager.rgbaFromHex(whiteHex, 0));
      ctx.fillStyle = grad as any;
      ctx.fillRect(x, y, width, highlightHeight);
    } finally {
      ctx.restore();
    }
  }


  // Helper that renders from template glass configuration with optional preset overrides
  renderGlassCardFromScheme(
    ctx: CanvasRenderingContext2D,
    args: {
      x: number; y: number; width: number; height: number; radius: number;
      glass: {
        fillColor: string; strokeColor: string; opacity: number;
        shadowColor: string; shadowBlur: number; shadowOffset: { x: number; y: number }; shadowOpacity: number;
        presets?: { hero?: any; card?: any };
      };
      preset?: 'hero' | 'card';
    }
  ): void {
    const { x, y, width, height, radius, glass, preset } = args;
    const presetVals = preset && glass.presets ? (glass.presets as any)[preset] : undefined;
    const opacity = presetVals?.opacity ?? glass.opacity;
    const shadowBlur = presetVals?.shadowBlur ?? glass.shadowBlur;
    const shadowOffset = presetVals?.shadowOffset ?? glass.shadowOffset;
    const shadowOpacity = presetVals?.shadowOpacity ?? glass.shadowOpacity;

    this.renderGlassCard(ctx, {
      x, y, width, height, radius,
      fillColor: glass.fillColor,
      strokeColor: glass.strokeColor,
      opacity,
      shadow: {
        color: glass.shadowColor,
        blur: shadowBlur,
        offsetX: shadowOffset.x,
        offsetY: shadowOffset.y,
        opacity: shadowOpacity,
      },
    });
  }

  // --- Optional targeted html2canvas path (disabled by default; dynamic import; cached)
  private _domRasterCache = new Map<string, string>(); // cacheKey -> dataURL


  /**
   * Rasterize a small DOM element to a PNG data URL using html2canvas (loaded lazily)
   */
  async domElementToDataURL(element: HTMLElement, opts: DomRasterizeOptions = {}): Promise<string> {
    const cacheKey = opts.cacheKey;
    if (cacheKey && this._domRasterCache.has(cacheKey)) {
      return this._domRasterCache.get(cacheKey)!;
    }

    const html2canvasMod = (await import('html2canvas')) as { default: typeof html2canvasType };
    const html2canvas = html2canvasMod.default;

    const canvas = await html2canvas(element, {
      backgroundColor: opts.backgroundColor ?? null,
      scale: opts.scale ?? 2,
      useCORS: opts.useCORS ?? true,
      logging: false,
      removeContainer: true,
    } as any);

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    if (cacheKey) this._domRasterCache.set(cacheKey, dataUrl);
    return dataUrl;
  }

  /**
   * Add a DOM element snapshot directly to the PDF at the given mm rectangle.
   * This bypasses the intermediate canvas to preserve transparency and avoid scaling artifacts.
   * Returns an operation count estimate for performance tracking.
   */
  async renderDomElementToPdf(
    pdf: jsPDF,
    element: HTMLElement,
    xMm: number,
    yMm: number,
    widthMm: number,
    heightMm: number,
    opts: DomRasterizeOptions = {}
  ): Promise<number> {
    const dataUrl = await this.domElementToDataURL(element, opts);
    const anyPdf = pdf as any;
    if (typeof anyPdf.addImage === 'function') {
      anyPdf.addImage(dataUrl, 'PNG', xMm, yMm, widthMm, heightMm);
      return 2; // toDataURL (cached) + addImage
    } else {
      console.warn('[GlassEffectsRenderer] addImage unavailable; skipping DOM snapshot add to PDF');
      return 1; // only toDataURL was performed
    }
  }


  canvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number): void {
    const img = canvas.toDataURL('image/png', 1.0);
    const anyPdf = pdf as any;
    if (typeof anyPdf.addImage === 'function') {
      anyPdf.addImage(img, 'PNG', x, y, width, height);
    } else {
      console.warn('[GlassEffectsRenderer] addImage unavailable; skipping canvas add to PDF');
    }
  }
}

