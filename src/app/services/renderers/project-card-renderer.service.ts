import jsPDF from 'jspdf';
import { PDFTemplate } from '../pdf-template.service';
import { ProcessedPDFData } from '../pdf-data-processor.service';
import { RenderContext, ISectionRenderer } from '../section-renderer.interface';
import { renderGlassCardBackground } from '../../shared/utils/glass-card-renderer';

export class ProjectCardRenderer implements ISectionRenderer {
  renderProjectCard(
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
    const result = renderGlassCardBackground(
      template,
      renderingContext,
      xMm,
      yMm,
      widthMm,
      heightMm,
      {
        elevation: Math.max(1, Math.min(4, elevationLevel)) as 1 | 2 | 3 | 4,
        enableLightEffects: true,
        enableNoise: true,
      }
    );

    return result.opsCount;
  }
}

