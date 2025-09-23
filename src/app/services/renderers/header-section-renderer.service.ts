import jsPDF from 'jspdf';
import { PDFTemplate } from '../pdf-template.service';
import { ProcessedPDFData } from '../pdf-data-processor.service';
import { RenderContext, ISectionRenderer } from '../section-renderer.interface';
import { ColorManager } from '../color-manager.service';
import { GlassEffectsRenderer } from '../glass-effects-renderer.service';
import { GlassMorphismDesignService } from '../glass-morphism-design.service';

export class HeaderSectionRenderer implements ISectionRenderer {
  renderHeader(
    _pdf: jsPDF,
    template: PDFTemplate,
    _data: ProcessedPDFData,
    renderingContext: RenderContext
  ): number {
    const { ctx, width, height } = renderingContext;
    const heroHeight = height * 0.3; // 30% of page height

    // Gradient background via ColorManager (same visuals as before)
    const colorManager = new ColorManager(template.colorScheme);
    const gradient = colorManager.createHeroGradient(ctx, width, heroHeight);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, heroHeight);

    // Glass overlay using elevation tokens + premium touches (hero: elevation 3)
    const design = new GlassMorphismDesignService();
    const style = design.getCardStyle(3);
    const gfx = new GlassEffectsRenderer();

    gfx.renderGlassCard(ctx, {
      x: 0,
      y: 0,
      width,
      height: heroHeight,
      radius: 0,
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

    gfx.drawGradientBorder(ctx, 0, 0, width, heroHeight, 0, template.colorScheme.glass.strokeColor, 0.35, 0.15);
    gfx.drawInnerHighlight(ctx, 0, 0, width, heroHeight, 0, '#ffffff', 0.10);

    // Ops estimate: gradient + fill + glass + border + highlight ~ 8
    return 8;
  }
}

