// Feature toggle configuration for ContactComponent
// - Keep recruiter-safe defaults
// - Allow local overrides on localhost only

import { createFeatureConfig } from '../../shared/utils/feature-toggle';

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

export const CONTACT_CONFIG = createFeatureConfig(BASE_FEATURES, CONTACT_LOCAL_OVERRIDES);

export type ContactFeatures = typeof BASE_FEATURES;
export type ContactConfig = typeof CONTACT_CONFIG;

