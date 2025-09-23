// Feature toggle configuration for HeroComponent
// - Use simple boolean flags per CTA button
// - Defaults are production-safe (all false)
// - Local developer overrides are applied automatically on localhost

// Base feature flags (production defaults)
const BASE_FEATURES = {
  // Primary CV/PDF generation button
  pdfGeneration: false,

  // Circular button to open the template selector modal
  pdfTemplateSelector: false,

  // Circular button to open advanced PDF configuration
  pdfConfiguration: false,

  // Secondary action to download full website/portfolio as PDF
  portfolioDownload: false,

  // "Get In Touch" CTA button (scrolls to contact section)
  contact: false,

  // Bottom scroll indicator button
  scrollIndicator: false,
} as const;

// Local developer overrides
// - These are applied automatically when running on localhost/127.0.0.1
// - Modify values below to enable features during development without affecting production
export const HERO_LOCAL_OVERRIDES: Partial<typeof BASE_FEATURES> = {
  // Example defaults for local testing (uncomment as needed):
  // pdfGeneration: true,
  // pdfTemplateSelector: true,
  // pdfConfiguration: true,
  // portfolioDownload: true,
  // contact: true,
  // scrollIndicator: true,
};

const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

export const HERO_CONFIG = {
  features: {
    ...BASE_FEATURES,
    ...(isLocalhost ? HERO_LOCAL_OVERRIDES : {}),
  },
} as const;

export type HeroFeatures = typeof BASE_FEATURES;
export type HeroConfig = typeof HERO_CONFIG;

