import { Injectable } from '@angular/core';
import { GlassCardStyle, GlassDesignTokens, GlassElevation } from '../interfaces/glass-design.interface';

/**
 * GlassMorphismDesignService
 * Central source of truth for elevation levels, transparency/blur scales
 * and shadow specifications used to achieve a professional glass aesthetic.
 *
 * Targets from plan:
 * - 5 elevation levels with 8–20% surface opacity
 * - Progressive blur intensity for backdrop simulation
 * - Depth-aware shadow ramps
 */
@Injectable({ providedIn: 'root' })
export class GlassMorphismDesignService {
  // White for glass fill/border; consumers adapt via color schemes if needed
  private readonly baseFillHex = '#ffffff';
  private readonly baseStrokeHex = '#ffffff';

  // Design tokens (can be extended later but keep stable defaults now)
  readonly tokens: GlassDesignTokens = {
    // Blur intensities approximate a backdrop-filter look when simulated
    blur: {
      backdropByElevation: { 0: 4, 1: 8, 2: 12, 3: 16, 4: 20 },
      contentByElevation: { 0: 0, 1: 2, 2: 3, 3: 4, 4: 5 },
    },
    // Opacity scale grounded in spec: 0.08 → 0.20
    opacity: {
      surfaceByElevation: { 0: 0.08, 1: 0.12, 2: 0.15, 3: 0.18, 4: 0.20 },
      borderMultiplier: 0.75,
    },
    // Shadow ramp tuned for PDF legibility (mm → canvas px handled elsewhere)
    shadows: {
      0: { blur: 6,  offsetX: 0, offsetY: 1, opacity: 0.10 },
      1: { blur: 8,  offsetX: 0, offsetY: 2, opacity: 0.12 },
      2: { blur: 12, offsetX: 0, offsetY: 3, opacity: 0.14 },
      3: { blur: 16, offsetX: 0, offsetY: 4, opacity: 0.16 },
      4: { blur: 22, offsetX: 0, offsetY: 6, opacity: 0.18 },
    },
    // z-index style ordering for layout engines that need stable ordering
    depthZIndex: { 0: 0, 1: 10, 2: 20, 3: 30, 4: 40 },
  };

  /** Get opacity for an elevation level */
  getOpacity(level: GlassElevation): number {
    return this.tokens.opacity.surfaceByElevation[level];
  }

  /** Get backdrop blur intensity for an elevation level */
  getBackdropBlur(level: GlassElevation): number {
    return this.tokens.blur.backdropByElevation[level];
  }

  /** Get shadow spec for an elevation level */
  getShadow(level: GlassElevation) {
    return this.tokens.shadows[level];
  }

  /**
   * Build a ready-to-use GlassCardStyle for the GlassEffectsRenderer
   * caller. Consumers can override colors if needed.
   */
  getCardStyle(level: GlassElevation): GlassCardStyle {
    const opacity = this.getOpacity(level);
    const shadow = this.getShadow(level);
    return {
      elevation: level,
      fillColor: this.baseFillHex,
      strokeColor: this.baseStrokeHex,
      opacity,
      shadow,
    };
  }
}

