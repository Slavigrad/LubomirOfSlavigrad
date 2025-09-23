import { LayoutManager } from './layout-manager.service';
import { PDFLayoutConfig } from './pdf-template.service';

describe('LayoutManager — Precision Grid API', () => {
  const makeCfg = (overrides: Partial<PDFLayoutConfig> = {}): PDFLayoutConfig => ({
    format: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    columns: 1,
    columnGap: 20,
    spacing: { section: 16, paragraph: 8, line: 4, element: 4 },
    radii: { card: 8, chip: 1, button: 4 },
    typography: { baseSize: 12, scaleRatio: 1.25, lineHeight: 1.5 },
    ...overrides,
  });

  it('computes a 16-column grid with sensible gutter by default', () => {
    const lm = new LayoutManager(makeCfg());
    const spec = lm.getGridSpec();
    expect(spec.columns).toBe(16);
    expect(spec.gutterMm).toBeGreaterThanOrEqual(2);
    expect(spec.gutterMm).toBeLessThanOrEqual(10);
    expect(spec.columnWidthMm).toBeGreaterThan(0);

    // Verify total width reconstruction: columns*col + (cols-1)*gutter == content width
    const total = spec.columns * spec.columnWidthMm + (spec.columns - 1) * spec.gutterMm;
    expect(Math.abs(total - spec.content.width)).toBeLessThan(0.01);
  });

  it('returns rects for spans aligned to the grid', () => {
    const lm = new LayoutManager(makeCfg());
    const spec = lm.getGridSpec();

    const rect4 = lm.getGridRectBySpan(1, 4);
    const expectedW = 4 * spec.columnWidthMm + 3 * spec.gutterMm;
    expect(Math.abs(rect4.width - expectedW)).toBeLessThan(0.01);
    expect(rect4.x).toBeCloseTo(spec.content.x, 2);
  });

  it('supports overriding columns and gutter', () => {
    const lm = new LayoutManager(makeCfg());
    const spec = lm.getGridSpec({ columns: 12, gutterMm: 6 });
    expect(spec.columns).toBe(12);
    expect(spec.gutterMm).toBe(6);
  });

  it('exposes baseline step in mm aligned to spacing.line', () => {
    const lm = new LayoutManager(makeCfg({ spacing: { section: 16, paragraph: 8, line: 3, element: 4 } }));
    expect(lm.getBaselineStepMm()).toBe(3);
  });

  it('provides elevation-aware spacing and gutters that increase with level', () => {
    const lm = new LayoutManager(makeCfg());
    const e0 = lm.getElevationSpacingMm(0);
    const e3 = lm.getElevationSpacingMm(3);
    expect(e3).toBeGreaterThan(e0);

    const g1 = lm.getGutterForElevationMm(1);
    const g4 = lm.getGutterForElevationMm(4);
    expect(g4).toBeGreaterThan(g1);
  });
});

