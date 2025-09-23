/*
 * Glass Morphism Design Interfaces
 * Defines token types for elevation, opacity, blur, gradients and shadows
 * used by PDF rendering services. Kept framework-agnostic so it can be
 * reused by both canvas-based preview and jsPDF vector rendering paths.
 */

export type GlassElevation = 0 | 1 | 2 | 3 | 4;

export interface GlassBlurScale {
  // Backdrop blur simulation intensity per elevation level (0..4)
  backdropByElevation: Record<GlassElevation, number>;
  // Content blur (used rarely for accents)
  contentByElevation: Record<GlassElevation, number>;
}

export interface GlassOpacityScale {
  // Base surface opacity for the elevation
  surfaceByElevation: Record<GlassElevation, number>;
  // Suggested border opacity multiplier (applied to white border)
  borderMultiplier: number;
}

export interface GlassShadowSpec {
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number; // 0..1 applied to black
}

export interface GlassDesignTokens {
  blur: GlassBlurScale;
  opacity: GlassOpacityScale;
  shadows: Record<GlassElevation, GlassShadowSpec>;
  depthZIndex: Record<GlassElevation, number>;
}

// Helper object that maps tokens to the GlassEffectsRenderer card params
export interface GlassCardStyle {
  elevation: GlassElevation;
  fillColor: string;   // hex
  strokeColor: string; // hex
  opacity: number;     // 0..1
  shadow: GlassShadowSpec;
}

