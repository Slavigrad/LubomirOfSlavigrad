/**
 * Glass Card Renderer Utility
 *
 * Provides a shared, pure function for rendering glass-morphism card backgrounds.
 * Extracted from ExperienceCardRenderer, ProjectCardRenderer, and SidebarCardRenderer
 * to eliminate code duplication.
 *
 * This utility accepts all dependencies as parameters (no Angular DI) for testability.
 */

import { PDFTemplate } from '../../services/pdf-template.service';
import { RenderContext } from '../../services/section-renderer.interface';
import { ColorManager } from '../../services/color-manager.service';
import { LayoutManager } from '../../services/layout-manager.service';
import { GlassEffectsRenderer } from '../../services/glass-effects-renderer.service';
import { GlassMorphismDesignService } from '../../services/glass-morphism-design.service';

export interface GlassCardRenderOptions {
  /** Elevation level (1-4), affects opacity and shadow. Default: 2 */
  elevation?: 1 | 2 | 3 | 4;
  /** Enable edge light and specular spot effects. Default: true */
  enableLightEffects?: boolean;
  /** Enable micro noise overlay. Default: true */
  enableNoise?: boolean;
}

export interface GlassCardRenderResult {
  /** Estimated number of canvas operations performed */
  opsCount: number;
  /** Canvas coordinates used for rendering */
  canvasRect: { x: number; y: number; width: number; height: number };
}

/**
 * Renders a glass-morphism card background onto the canvas.
 *
 * This function encapsulates the shared sequence:
 * 1. mm→canvas coordinate conversion (via LayoutManager)
 * 2. Background gradient (via ColorManager)
 * 3. Glass card rendering (via GlassMorphismDesignService + GlassEffectsRenderer)
 * 4. Gradient border + inner highlight
 * 5. Optional: light effects (edge light + specular spot)
 * 6. Optional: micro noise
 *
 * @param template - PDF template with color scheme and layout config
 * @param renderingContext - Canvas rendering context with dimensions
 * @param xMm - X position in millimeters
 * @param yMm - Y position in millimeters
 * @param widthMm - Width in millimeters
 * @param heightMm - Height in millimeters
 * @param options - Optional rendering configuration
 * @returns Result with ops count and canvas coordinates
 */
export function renderGlassCardBackground(
  template: PDFTemplate,
  renderingContext: RenderContext,
  xMm: number,
  yMm: number,
  widthMm: number,
  heightMm: number,
  options: GlassCardRenderOptions = {}
): GlassCardRenderResult {
  const { ctx, width: canvasWidth, height: canvasHeight } = renderingContext;
  const {
    elevation = 2,
    enableLightEffects = true,
    enableNoise = true,
  } = options;

  // Convert PDF mm coordinates to canvas px coordinates
  const layout = new LayoutManager(template.layout);
  const x = layout.mmToCanvasX(xMm, canvasWidth);
  const y = layout.mmToCanvasY(yMm, canvasHeight);
  const w = layout.widthMmToCanvasPx(widthMm, canvasWidth);
  const h = layout.heightMmToCanvasPx(heightMm, canvasHeight);
  const radius = layout.getRadius('card');

  // Background gradient
  const colorManager = new ColorManager(template.colorScheme);
  const gradient = colorManager.createSidebarCardGradient(ctx, x, y, h);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);

  // Glass overlay using elevation tokens
  const design = new GlassMorphismDesignService();
  const level = Math.max(1, Math.min(4, elevation)) as 1 | 2 | 3 | 4;
  const style = design.getCardStyle(level);
  const gfx = new GlassEffectsRenderer();

  gfx.renderGlassCard(ctx, {
    x,
    y,
    width: w,
    height: h,
    radius,
    fillColor: template.colorScheme.glass.fillColor,
    strokeColor: template.colorScheme.glass.strokeColor,
    opacity: style.opacity,
    shadow: {
      color: template.colorScheme.glass.shadowColor,
      blur: style.shadow.blur,
      offsetX: style.shadow.offsetX,
      offsetY: style.shadow.offsetY,
      opacity: style.shadow.opacity,
    },
  });

  // Gradient border + inner highlight
  const borderTop = template.colorScheme.glass.borderOpts?.gradientAlphaTop ?? 0.35;
  const borderBottom = template.colorScheme.glass.borderOpts?.gradientAlphaBottom ?? 0.15;
  gfx.drawGradientBorder(ctx, x, y, w, h, radius, template.colorScheme.glass.strokeColor, borderTop, borderBottom);
  gfx.drawInnerHighlight(ctx, x, y, w, h, radius, '#ffffff', 0.12);

  let opsCount = 8; // base ops: gradient + fill + glass + border + highlight

  // Enhanced glass effects (light)
  if (enableLightEffects) {
    const light = template.colorScheme.glass.light;
    if (light) {
      gfx.drawEdgeLight(ctx, x, y, w, h, radius, {
        direction: light.direction,
        color: light.color ?? '#ffffff',
        strength: (light.intensity ?? 1) * (light.edgeStrength ?? 0.35),
        thickness: template.colorScheme.glass.borderOpts?.thickness ?? 2,
      });
      gfx.drawSpecularSpot(ctx, x, y, w, h, radius, {
        direction: light.direction,
        color: light.color ?? '#ffffff',
        size: light.specularSize ?? 36,
        strength: (light.intensity ?? 1) * (light.specularStrength ?? 0.22),
      });
      opsCount += 2;
    }
  }

  // Micro noise overlay
  if (enableNoise) {
    const noise = template.colorScheme.glass.noise;
    if (noise && noise.amount > 0) {
      gfx.drawMicroNoise(ctx, x, y, w, h, radius, noise.amount, noise.scale ?? 1, noise.type ?? 'mono');
      opsCount += 1;
    }
  }

  return {
    opsCount,
    canvasRect: { x, y, width: w, height: h },
  };
}

