import jsPDF from 'jspdf';
import { PDFTemplate } from '../pdf-template.service';
import { ProcessedPDFData } from '../pdf-data-processor.service';
import { RenderContext, ISectionRenderer } from '../section-renderer.interface';
import { ColorManager } from '../color-manager.service';
import { LayoutManager } from '../layout-manager.service';
import { GlassEffectsRenderer } from '../glass-effects-renderer.service';
import { GlassMorphismDesignService } from '../glass-morphism-design.service';

export class ExperienceCardRenderer implements ISectionRenderer {
  renderExperienceCard(
    _pdf: jsPDF,
    template: PDFTemplate,
    _data: ProcessedPDFData | undefined,
    renderingContext: RenderContext,
    xMm: number,
    yMm: number,
    widthMm: number,
    heightMm: number,
    elevationLevel: number = 2
  ): number {
    const { ctx, width: canvasWidth, height: canvasHeight } = renderingContext;

    // Convert PDF mm coordinates to canvas px coordinates via LayoutManager
    const layout = new LayoutManager(template.layout);

    const x = layout.mmToCanvasX(xMm, canvasWidth);
    const y = layout.mmToCanvasY(yMm, canvasHeight);
    const w = layout.widthMmToCanvasPx(widthMm, canvasWidth);
    const h = layout.heightMmToCanvasPx(heightMm, canvasHeight);

    // Background gradient
    const colorManager = new ColorManager(template.colorScheme);
    const gradient = colorManager.createSidebarCardGradient(ctx, x, y, h);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    // Glass overlay using elevation tokens + premium touches
    const design = new GlassMorphismDesignService();
    const level = Math.max(1, Math.min(4, elevationLevel)) as any;
    const style = design.getCardStyle(level as any);
    const gfx = new GlassEffectsRenderer();
    gfx.renderGlassCard(ctx, {
      x,
      y,
      width: w,
      height: h,
      radius: layout.getRadius('card'),
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

    const borderTop = template.colorScheme.glass.borderOpts?.gradientAlphaTop ?? 0.35;
    const borderBottom = template.colorScheme.glass.borderOpts?.gradientAlphaBottom ?? 0.15;
    gfx.drawGradientBorder(ctx, x, y, w, h, layout.getRadius('card'), template.colorScheme.glass.strokeColor, borderTop, borderBottom);
    gfx.drawInnerHighlight(ctx, x, y, w, h, layout.getRadius('card'), '#ffffff', 0.12);

    // Enhanced glass effects (Task 1.3)
    const light = template.colorScheme.glass.light;
    if (light) {
      gfx.drawEdgeLight(ctx, x, y, w, h, layout.getRadius('card'), {
        direction: light.direction,
        color: light.color ?? '#ffffff',
        strength: (light.intensity ?? 1) * (light.edgeStrength ?? 0.35),
        thickness: template.colorScheme.glass.borderOpts?.thickness ?? 2,
      });
      gfx.drawSpecularSpot(ctx, x, y, w, h, layout.getRadius('card'), {
        direction: light.direction,
        color: light.color ?? '#ffffff',
        size: light.specularSize ?? 36,
        strength: (light.intensity ?? 1) * (light.specularStrength ?? 0.22),
      });
    }

    const noise = template.colorScheme.glass.noise;
    if (noise && noise.amount > 0) {
      gfx.drawMicroNoise(ctx, x, y, w, h, layout.getRadius('card'), noise.amount, noise.scale ?? 1, noise.type ?? 'mono');
    }

    return 11; // ops estimate: + edge + specular + noise
  }
}

