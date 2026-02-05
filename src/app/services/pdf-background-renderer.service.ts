import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PDFTemplate } from './pdf-template.service';
import { LayoutManager } from './layout-manager.service';
import { ColorManager } from './color-manager.service';
import { GlassEffectsRenderer } from './glass-effects-renderer.service';
import { createNoisePattern } from '../shared/utils/canvas-noise';

export interface BackgroundRenderConfig {
  enablePattern?: boolean;
  enableLighting?: boolean;
  enableVignette?: boolean;
  patternOpacity?: number; // 0..1
  lightingOpacity?: number; // 0..1
  vignetteOpacity?: number; // 0..1
}

@Injectable({ providedIn: 'root' })
export class PDFBackgroundRendererService {
  /**
   * Render layered, PDF-safe atmospheric background (gradient + subtle pattern + lighting + vignette)
   * onto the provided high-DPI canvas, then place it into the PDF as a single image.
   * Returns the number of canvas operations performed (for metrics).
   */
  async renderLayeredBackground(
    pdf: jsPDF,
    template: PDFTemplate,
    renderingContext: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D },
    config: BackgroundRenderConfig = {}
  ): Promise<number> {
    const { canvas, ctx } = renderingContext;
    let ops = 0;

    const lm = new LayoutManager(template.layout);
    const page = lm.getPageRect();

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height); ops++;

    // Base diagonal gradient (background -> surface with subtle accent tint)
    const bg = ColorManager.parseHex(template.colorScheme.background);
    const surface = ColorManager.parseHex(template.colorScheme.surface);
    const accent = ColorManager.parseHex(template.colorScheme.accent);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, `rgba(${bg.r}, ${bg.g}, ${bg.b}, 1)`);
    grad.addColorStop(0.6, `rgba(${surface.r}, ${surface.g}, ${surface.b}, 1)`);
    grad.addColorStop(1, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.06)`);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height); ops += 2;

    // Optional subtle pattern overlay
    if (config.enablePattern !== false) {
      const pOpacity = config.patternOpacity ?? 0.06;
      ctx.globalAlpha = pOpacity;
      const pattern = this.createSubtlePattern(canvas.width, canvas.height, template);
      if (pattern) { ctx.fillStyle = pattern; ctx.fillRect(0, 0, canvas.width, canvas.height); ops += 2; }
      ctx.globalAlpha = 1;
    }

    // Optional atmospheric lighting (soft radial highlights)
    if (config.enableLighting !== false) {
      const lOpacity = config.lightingOpacity ?? 0.12;
      this.drawRadialLight(ctx, canvas.width * 0.15, canvas.height * 0.2, canvas.width * 0.35, template, lOpacity); ops++;
      this.drawRadialLight(ctx, canvas.width * 0.85, canvas.height * 0.85, canvas.width * 0.45, template, lOpacity * 0.8); ops++;
    }

    // Optional vignette for depth
    if (config.enableVignette !== false) {
      const vOpacity = config.vignetteOpacity ?? 0.08;
      const vignette = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.5, Math.min(canvas.width, canvas.height) * 0.4,
        canvas.width * 0.5, canvas.height * 0.5, Math.max(canvas.width, canvas.height) * 0.75,
      );
      const muted = ColorManager.parseHex(template.colorScheme.muted);
      vignette.addColorStop(0, `rgba(${muted.r}, ${muted.g}, ${muted.b}, 0)`);
      vignette.addColorStop(1, `rgba(0, 0, 0, ${vOpacity})`);
      ctx.fillStyle = vignette; ctx.fillRect(0, 0, canvas.width, canvas.height); ops += 2;
    }

    // Place the composed background into the PDF as one image (ensures PDF compatibility)
    new GlassEffectsRenderer().canvasToPdf(pdf, canvas, 0, 0, page.width, page.height); ops += 2;

    return ops;
  }

  /**
   * Very light diagonal hatch pattern to suggest texture. PDF-safe since we rasterize via canvas.
   */
  private createSubtlePattern(width: number, height: number, template: PDFTemplate): CanvasPattern | null {
    const off = document.createElement('canvas');
    off.width = 64; off.height = 64;
    const c = off.getContext('2d');
    if (!c) return null;

    const surface = ColorManager.parseHex(template.colorScheme.surface);
    const stroke = `rgba(${surface.r}, ${surface.g}, ${surface.b}, 0.35)`;

    // Background transparent
    c.clearRect(0, 0, 64, 64);

    // Diagonal lines
    c.strokeStyle = stroke;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, 48); c.lineTo(48, 0);
    c.moveTo(16, 64); c.lineTo(64, 16);
    c.moveTo(0, 16); c.lineTo(16, 0);
    c.stroke();

    return c.createPattern(off, 'repeat');
  }

  /**
   * Soft radial light spot using accent color.
   */
  private drawRadialLight(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    template: PDFTemplate,
    opacity: number
  ) {
    const a = ColorManager.parseHex(template.colorScheme.accent);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, `rgba(${a.r}, ${a.g}, ${a.b}, ${opacity})`);
    g.addColorStop(1, `rgba(${a.r}, ${a.g}, ${a.b}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * PDF-safe approximation of backdrop blur for rectangular areas.
   * Strategy: layered translucent fills + subtle noise to suggest diffusion.
   * Uses the shared createNoisePattern utility from canvas-noise.ts.
   */
  simulateBackdropBlur(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    intensity: 1 | 2 | 3 = 2
  ): number {
    let ops = 0;
    const layers = intensity === 1 ? 2 : intensity === 2 ? 3 : 4;
    for (let i = 0; i < layers; i++) {
      const alpha = 0.06 + i * 0.04; // 0.06 → 0.18
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(x, y, w, h); ops++;
    }

    // Tiny noise overlay to reduce banding (using shared utility)
    // Note: The shared utility uses a different alpha approach, but produces similar visual effect
    const noisePattern = createNoisePattern(ctx, { amount: 0.04, scale: 0.5, type: 'mono' });
    if (noisePattern) {
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = noisePattern;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
      ops += 2;
    }

    return ops;
  }
}

