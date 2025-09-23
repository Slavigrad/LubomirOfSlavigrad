import { TestBed } from '@angular/core/testing';
import { GlassMorphismDesignService } from './glass-morphism-design.service';

describe('GlassMorphismDesignService', () => {
  let service: GlassMorphismDesignService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [GlassMorphismDesignService]
    }).compileComponents();

    service = TestBed.inject(GlassMorphismDesignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose 5 elevation levels with expected opacity scale (0.08 → 0.20)', () => {
    expect(service.getOpacity(0)).toBeCloseTo(0.08, 5);
    expect(service.getOpacity(1)).toBeCloseTo(0.12, 5);
    expect(service.getOpacity(2)).toBeCloseTo(0.15, 5);
    expect(service.getOpacity(3)).toBeCloseTo(0.18, 5);
    expect(service.getOpacity(4)).toBeCloseTo(0.20, 5);
  });

  it('should provide progressive backdrop blur by elevation', () => {
    const b0 = service.getBackdropBlur(0);
    const b4 = service.getBackdropBlur(4);
    expect(b0).toBeLessThan(b4);
    expect(b0).toBeGreaterThanOrEqual(0);
  });

  it('should map elevation to a ready-to-use card style', () => {
    const style = service.getCardStyle(3);
    expect(style.elevation).toBe(3);
    expect(style.fillColor).toBe('#ffffff');
    expect(style.strokeColor).toBe('#ffffff');
    expect(style.opacity).toBeCloseTo(0.18, 5);
    expect(style.shadow.blur).toBeGreaterThan(0);
    expect(style.shadow.opacity).toBeGreaterThan(0);
  });
});

