/**
 * Feature Toggle Utility
 * 
 * Provides consistent feature toggle configuration across the application.
 * Replaces duplicated boilerplate in contact.configuration and hero.configuration.
 */

/**
 * Detects whether the application is running on localhost.
 * Used for enabling development-only features.
 */
export const isLocalhost: boolean = 
  typeof window !== 'undefined' && 
  /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

/**
 * Creates a feature configuration object with automatic localhost overrides.
 * 
 * @param baseFeatures - The base feature flags (production defaults)
 * @param localOverrides - Feature overrides to apply only on localhost
 * @returns A configuration object with the features property
 * 
 * @example
 * const BASE_FEATURES = { featureA: true, featureB: false } as const;
 * const LOCAL_OVERRIDES = { featureB: true };
 * export const CONFIG = createFeatureConfig(BASE_FEATURES, LOCAL_OVERRIDES);
 * // On localhost: { features: { featureA: true, featureB: true } }
 * // In production: { features: { featureA: true, featureB: false } }
 */
export function createFeatureConfig<T extends Record<string, boolean>>(
  baseFeatures: T,
  localOverrides: Partial<T> = {}
): { features: T } {
  return {
    features: { 
      ...baseFeatures, 
      ...(isLocalhost ? localOverrides : {}) 
    } as T
  };
}

