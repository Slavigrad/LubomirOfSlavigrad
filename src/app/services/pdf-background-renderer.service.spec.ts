import { TestBed } from '@angular/core/testing';
import { PDFBackgroundRendererService } from './pdf-background-renderer.service';
import { PDFTemplate } from './pdf-template.service';

// Minimal mock jsPDF with addImage only (used by GlassEffectsRenderer.canvasToPdf)
class MockJsPDF {
  public addImage = jasmine.createSpy('addImage');
}

describe('PDFBackgroundRendererService', () => {
  let service: PDFBackgroundRendererService;
  let pdf: MockJsPDF;

  const mockTemplate: PDFTemplate = {
    id: 'bg-test',
    name: 'BG Test',
    description: 'Background render test template',
    targetAudience: 'recruiter',
    maxPages: 1,
    minPages: 1,
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#111827',
      textSecondary: '#64748b',
      muted: '#94a3b8',
      glass: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.2)',
        shadow: 'rgba(0, 0, 0, 0.25)',
        highlight: 'rgba(255, 255, 255, 0.4)',
        fillColor: '#ffffff',
        strokeColor: '#ffffff',
        opacity: 0.08,
        shadowColor: '#000000',
        shadowBlur: 5,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.08,
        presets: {
          hero: { opacity: 0.1, shadowBlur: 10, shadowOffset: { x: 0, y: 2 }, shadowOpacity: 0.1 },
          card: { opacity: 0.06, shadowBlur: 5, shadowOffset: { x: 2, y: 2 }, shadowOpacity: 0.08 }
        }
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    layout: {
      format: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      columns: 1,
      columnGap: 20,
      spacing: { section: 16, paragraph: 8, line: 4, element: 4 },
      radii: { card: 8, chip: 1, button: 4 },
      typography: { baseSize: 12, scaleRatio: 1.25, lineHeight: 1.5 }
    },
    sections: [],
    features: {
      supportsGlassMorphism: true,
      supportsCharts: false,
      supportsImages: true,
      supportsCustomFonts: false
    },
    performance: { estimatedGenerationTime: 500, memoryUsage: 'low', complexity: 'simple' },
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [PDFBackgroundRendererService]
    }).compileComponents();

    service = TestBed.inject(PDFBackgroundRendererService);
    pdf = new MockJsPDF();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should render layered background to canvas and add image to PDF', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 1131; // roughly A4 @ ~96dpi scale
    const ctx = canvas.getContext('2d')!;

    const ops = await service.renderLayeredBackground(pdf as any, mockTemplate, { canvas, ctx }, {
      enablePattern: true,
      enableLighting: true,
      enableVignette: true,
      patternOpacity: 0.05,
      lightingOpacity: 0.12,
      vignetteOpacity: 0.06,
    });

    expect(ops).toBeGreaterThan(0);
    expect(pdf.addImage).toHaveBeenCalled();
  });

  it('should simulate backdrop blur without throwing', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext('2d')!;

    const count = service.simulateBackdropBlur(ctx, 10, 10, 100, 60, 2);
    expect(count).toBeGreaterThan(0);
  });
});

