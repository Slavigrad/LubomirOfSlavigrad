import jsPDF from 'jspdf';
import { PDFTemplate } from '../pdf-template.service';
import { ProcessedPDFData } from '../pdf-data-processor.service';
import { RenderContext, ISectionRenderer } from '../section-renderer.interface';
import { ColorManager } from '../color-manager.service';
import { LayoutManager } from '../layout-manager.service';
import { GlassEffectsRenderer } from '../glass-effects-renderer.service';
import { GlassMorphismDesignService } from '../glass-morphism-design.service';

export class SidebarCardRenderer implements ISectionRenderer {
  renderSidebarCard(
    _pdf: jsPDF,
    template: PDFTemplate,
    _data: ProcessedPDFData,
    renderingContext: RenderContext,
    xMm: number,
    yMm: number,
    widthMm: number,
    heightMm: number
  ): number {
    const { ctx, width: canvasWidth, height: canvasHeight } = renderingContext;

    // Convert PDF mm coordinates to canvas px coordinates via LayoutManager
    const layout = new LayoutManager(template.layout);

    const canvasX = layout.mmToCanvasX(xMm, canvasWidth);
    const canvasY = layout.mmToCanvasY(yMm, canvasHeight);
    const canvasCardWidth = layout.widthMmToCanvasPx(widthMm, canvasWidth);
    const canvasCardHeight = layout.heightMmToCanvasPx(heightMm, canvasHeight);

    // Subtle background gradient
    const colorManager = new ColorManager(template.colorScheme);
    const gradient = colorManager.createSidebarCardGradient(ctx, canvasX, canvasY, canvasCardHeight);

    ctx.fillStyle = gradient;
    ctx.fillRect(canvasX, canvasY, canvasCardWidth, canvasCardHeight);

    // Glass overlay using elevation tokens + gradient border + inner highlight
    const design = new GlassMorphismDesignService();
    const style = design.getCardStyle(1); // sidebar cards: elevation 1
    const gfx = new GlassEffectsRenderer();
    gfx.renderGlassCard(ctx, {
      x: canvasX,
      y: canvasY,
      width: canvasCardWidth,
      height: canvasCardHeight,
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

    // Premium touches
    gfx.drawGradientBorder(
      ctx,
      canvasX,
      canvasY,
      canvasCardWidth,
      canvasCardHeight,
      layout.getRadius('card'),
      template.colorScheme.glass.strokeColor,
      0.35,
      0.15
    );
    gfx.drawInnerHighlight(
      ctx,
      canvasX,
      canvasY,
      canvasCardWidth,
      canvasCardHeight,
      layout.getRadius('card'),
      '#ffffff',
      0.12
    );

    // Ops estimate updated slightly: gradient + fill + glass + border + highlight ~ 8
    return 8;
  }
}

