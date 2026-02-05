import jsPDF from 'jspdf';
import { PDFTemplate } from '../pdf-template.service';
import { ProcessedPDFData } from '../pdf-data-processor.service';
import { RenderContext, ISectionRenderer } from '../section-renderer.interface';
import { renderGlassCardBackground } from '../../shared/utils/glass-card-renderer';

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
    const result = renderGlassCardBackground(
      template,
      renderingContext,
      xMm,
      yMm,
      widthMm,
      heightMm,
      {
        elevation: 1,
        enableLightEffects: false,
        enableNoise: false,
      }
    );

    return result.opsCount;
  }
}

