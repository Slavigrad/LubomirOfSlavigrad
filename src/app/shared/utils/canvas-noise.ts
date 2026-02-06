/**
 * Canvas Noise Pattern Utility
 *
 * Provides noise pattern generation for glass-morphism effects.
 * Extracted from GlassEffectsRenderer._createNoisePattern() and
 * pdf-background-renderer.service.ts inline noise generation.
 */

// Internal cache to avoid recreating identical noise patterns
const noisePatternCache = new Map<string, CanvasPattern | null>();

export type NoiseType = 'mono' | 'rgb';

export interface NoisePatternOptions {
  /** Noise intensity/amount (0..1, clamped to max 0.1 for subtle effect) */
  amount?: number;
  /** Scale factor for the pattern tile size (default: 1) */
  scale?: number;
  /** Noise type: 'mono' for grayscale, 'rgb' for colored (default: 'mono') */
  type?: NoiseType;
}

/**
 * Creates a repeatable noise pattern for canvas rendering.
 * The pattern is cached by configuration to avoid regeneration.
 *
 * @param ctx - Canvas rendering context (used to create the pattern)
 * @param options - Noise configuration options
 * @returns CanvasPattern or null if creation fails
 *
 * @example
 * const pattern = createNoisePattern(ctx, { amount: 0.02, scale: 1, type: 'mono' });
 * if (pattern) {
 *   ctx.fillStyle = pattern;
 *   ctx.fillRect(x, y, w, h);
 * }
 */
export function createNoisePattern(
  ctx: CanvasRenderingContext2D,
  options: NoisePatternOptions = {}
): CanvasPattern | null {
  const amount = options.amount ?? 0.02;
  const scale = options.scale ?? 1;
  const type = options.type ?? 'mono';

  const cacheKey = `${amount}|${scale}|${type}`;
  if (noisePatternCache.has(cacheKey)) {
    return noisePatternCache.get(cacheKey) || null;
  }

  const size = Math.max(16, Math.floor(48 * scale));
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = size;
  offscreenCanvas.height = size;

  const offscreenCtx = offscreenCanvas.getContext('2d');
  if (!offscreenCtx) {
    noisePatternCache.set(cacheKey, null);
    return null;
  }

  const imageData = offscreenCtx.createImageData(size, size);
  const clampedAmount = Math.min(0.1, Math.max(0, amount));

  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = 255 * Math.random();
    // Both 'mono' and 'rgb' use grayscale in the original implementation
    imageData.data[i] = v;     // R
    imageData.data[i + 1] = v; // G
    imageData.data[i + 2] = v; // B
    imageData.data[i + 3] = Math.floor(255 * clampedAmount); // Alpha
  }

  offscreenCtx.putImageData(imageData, 0, 0);
  const pattern = ctx.createPattern(offscreenCanvas, 'repeat');
  noisePatternCache.set(cacheKey, pattern);

  return pattern;
}

/**
 * Clears the noise pattern cache.
 * Useful for testing or when memory cleanup is needed.
 */
export function clearNoisePatternCache(): void {
  noisePatternCache.clear();
}

