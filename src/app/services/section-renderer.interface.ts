import jsPDF from 'jspdf';
import { PDFTemplate } from './pdf-template.service';
import { ProcessedPDFData } from './pdf-data-processor.service';

// Minimal context needed by section renderers; mirrors the shape used in PDFRendererService
export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;
  width: number;
  height: number;
}

// Section renderer contract. Methods are optional so concrete renderers only implement what they support.
export interface ISectionRenderer {
  renderHeader?(
    pdf: jsPDF,
    template: PDFTemplate,
    data: ProcessedPDFData | undefined,
    renderingContext: RenderContext
  ): Promise<number> | number;

  renderSidebarCard?(
    pdf: jsPDF,
    template: PDFTemplate,
    data: ProcessedPDFData | undefined,
    renderingContext: RenderContext,
    xMm: number,
    yMm: number,
    widthMm: number,
    heightMm: number
  ): Promise<number> | number;

  renderExperienceCard?(
    pdf: jsPDF,
    template: PDFTemplate,
    data: ProcessedPDFData | undefined,
    renderingContext: RenderContext,
    xMm: number,
    yMm: number,
    widthMm: number,
    heightMm: number
  ): Promise<number> | number;

  renderProjectCard?(
    pdf: jsPDF,
    template: PDFTemplate,
    data: ProcessedPDFData | undefined,
    renderingContext: RenderContext,
    xMm: number,
    yMm: number,
    widthMm: number,
    heightMm: number
  ): Promise<number> | number;

  // Future extension points
  renderContentSection?(
    pdf: jsPDF,
    template: PDFTemplate,
    data: ProcessedPDFData,
    renderingContext: RenderContext,
    sectionKey: string
  ): Promise<number> | number;
}

