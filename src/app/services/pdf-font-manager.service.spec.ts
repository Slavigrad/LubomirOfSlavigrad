import { PDFFontManagerService } from './pdf-font-manager.service';

describe('PDFFontManagerService — Advanced Typography Scale', () => {
  let service: PDFFontManagerService;

  beforeEach(() => {
    service = new PDFFontManagerService();
  });

  it('should provide backwards-compatible recommended font sizes', () => {
    const sizes = service.getRecommendedFontSizes();
    expect(sizes).toEqual({ name: 24, title: 16, sectionHeader: 14, body: 11, caption: 10, small: 9 });
  });

  it('should expose a full typography scale with lineHeights and tracking', () => {
    const scale = service.getTypographyScale();
    expect(scale.name).toBeGreaterThan(0);
    expect(scale.title).toBeGreaterThan(0);
    expect(scale.sectionHeader).toBeGreaterThan(0);
    expect(scale.body).toBeGreaterThan(0);
    expect(scale.caption).toBeGreaterThan(0);
    expect(scale.small).toBeGreaterThan(0);

    expect(scale.lineHeights).toBeDefined();
    expect(scale.lineHeights.heading).toBeGreaterThan(1);
    expect(scale.lineHeights.body).toBeGreaterThan(1);
    expect(scale.lineHeights.small).toBeGreaterThan(1);

    expect(scale.tracking).toBeDefined();
    expect(typeof scale.tracking.heading).toBe('number');
    expect(typeof scale.tracking.body).toBe('number');
    expect(typeof scale.tracking.small).toBe('number');
  });

  it('should gently scale sizes when page width increases', () => {
    const defaultScale = service.getTypographyScale({ pageWidth: 595 });
    const largerScale = service.getTypographyScale({ pageWidth: 700 });

    expect(largerScale.name).toBeGreaterThanOrEqual(defaultScale.name);
    expect(largerScale.title).toBeGreaterThanOrEqual(defaultScale.title);
    expect(largerScale.sectionHeader).toBeGreaterThanOrEqual(defaultScale.sectionHeader);
    expect(largerScale.body).toBeGreaterThanOrEqual(defaultScale.body);
  });

  it('should respect density presets (compact vs. spacious)', () => {
    const normal = service.getTypographyScale({ density: 'normal' });
    const compact = service.getTypographyScale({ density: 'compact' });
    const spacious = service.getTypographyScale({ density: 'spacious' });

    expect(compact.body).toBeLessThanOrEqual(normal.body);
    expect(spacious.body).toBeGreaterThanOrEqual(normal.body);
  });
});

