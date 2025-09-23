/**
 * Barrel exports for all CV data models
 * Provides clean imports throughout the application
 */

// Core interfaces
export * from './cv-data.interface';

// Re-export commonly used types for convenience
export type {
  PersonalInfo,
  Experience,
  Project,
  Skill,
  SkillCategory,
  SocialLink,
  Stat,
  CVData,
  ContactFormData,
  PDFConfig,
  ThemeConfig,
} from './cv-data.interface';
