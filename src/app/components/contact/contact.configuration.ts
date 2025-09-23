// Feature toggle configuration for ContactComponent
// - Keep recruiter-safe defaults
// - Allow local overrides on localhost only

const BASE_FEATURES = {
  // Entire contact section visibility
  sectionEnabled: true,
  // Show the social links card
  socialLinks: true,
  // Show the contact form (currently demo-only submit)
  formEnabled: true,
} as const;

// Local developer overrides (apply only on localhost)
export const CONTACT_LOCAL_OVERRIDES: Partial<typeof BASE_FEATURES> = {
  // Example:
  // formEnabled: true,
};

const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

export const CONTACT_CONFIG = {
  features: {
    ...BASE_FEATURES,
    ...(isLocalhost ? CONTACT_LOCAL_OVERRIDES : {}),
  },
} as const;

export type ContactFeatures = typeof BASE_FEATURES;
export type ContactConfig = typeof CONTACT_CONFIG;

