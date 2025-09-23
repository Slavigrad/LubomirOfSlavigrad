/**
 * Comprehensive CV Data Models - Single Source of Truth Architecture
 * Lubomir of Slavigrad Chronicles - Modern Angular CV Website
 *
 * This file defines the complete data architecture for the CV application,
 * serving as the single source of truth for all CV content. Any changes here
 * automatically propagate to all consumers (UI components, PDF generator, etc.).
 *
 * Design Principles:
 * - Single Source of Truth: All CV data defined once, consumed everywhere
 * - Easy Extensibility: Adding new fields/sections requires minimal changes
 * - Automatic Propagation: Changes reflect across all systems automatically
 * - Type Safety: Full TypeScript support with validation schemas
 * - Reactive Patterns: Designed for Angular signals and reactive updates
 */

// ============================================================================
// BASE INTERFACES AND METADATA
// ============================================================================

/**
 * Base interface for all CV data entities with common metadata
 * Provides tracking, validation, and extensibility features
 */
export interface CVEntityBase {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
  metadata?: Record<string, any>;
  tags?: string[];
  visibility?: 'public' | 'private' | 'recruiter-only';
  priority?: number; // For ordering/ranking
}

/**
 * Base interface for time-based entities (experiences, education, etc.)
 */
export interface TimePeriodBase extends CVEntityBase {
  startDate?: Date; // Made optional for backward compatibility
  endDate?: Date | null; // null indicates current/ongoing
  duration?: string; // Computed or manual override
  isCurrent?: boolean; // Computed from endDate
}

/**
 * Base interface for entities with location information
 */
export interface LocationBase {
  location: string;
  locationType?: 'remote' | 'hybrid' | 'on-site';
  country?: string;
  city?: string;
  timezone?: string;
}

// ============================================================================
// PERSONAL INFORMATION AND CONTACT
// ============================================================================

/**
 * Comprehensive personal information with extensible contact methods
 */
export interface PersonalInfo extends CVEntityBase {
  // Core Identity
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  subtitle?: string;

  // Professional Summary
  bio?: string;
  summary?: string;
  elevator_pitch?: string; // 30-second introduction

  // Contact Information
  email: string;
  phone: string;
  location: string;
  website?: string;

  // Professional Profiles
  linkedin?: string;
  github?: string;
  portfolio?: string;
  blog?: string;

  // Core Technologies - Signature Expertise
  technologies?: string[];

  // Media and Branding
  avatar?: string;
  cover_image?: string;
  personal_brand?: {
    tagline?: string;
    color_scheme?: string;
    logo?: string;
  };

  // Availability and Preferences
  availability?: {
    status: 'available' | 'employed' | 'not-looking';
    start_date?: Date;
    notice_period?: string;
    work_authorization?: string;
    willing_to_relocate?: boolean;
    preferred_locations?: string[];
    salary_expectations?: {
      min?: number;
      max?: number;
      currency?: string;
      negotiable?: boolean;
    };
  };

  // Languages
  languages?: Language[];
}

/**
 * Language proficiency information
 */
export interface Language extends CVEntityBase {
  name: string;
  code: string; // ISO 639-1 code (e.g., 'en', 'es', 'fr')
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
  certifications?: string[]; // e.g., TOEFL, IELTS scores
  is_native?: boolean;
}

/**
 * Enhanced social links with analytics and verification
 */
export interface SocialLink extends CVEntityBase {
  platform: string;
  url: string;
  icon: string;
  label?: string;
  username?: string;
  verified?: boolean;
  follower_count?: number;
  description?: string;
  primary?: boolean; // Mark primary social profiles
}

// ============================================================================
// STATISTICS AND METRICS
// ============================================================================

/**
 * Enhanced statistics with time-series data and context
 */
export interface Stat extends CVEntityBase {
  title: string;
  value: string | number;
  icon: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'secondary' | 'accent';

  // Enhanced metrics
  category?: 'experience' | 'projects' | 'skills' | 'achievements' | 'custom';
  unit?: string; // e.g., 'years', '%', 'projects', 'certifications'
  source?: string; // Where this metric comes from
  last_updated?: Date;
  historical_data?: {
    date: Date;
    value: number;
  }[];

  // Display configuration
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  precision?: number;
  show_trend?: boolean;
  highlight?: boolean;
}

// ============================================================================
// SKILLS AND COMPETENCIES
// ============================================================================

/**
 * Comprehensive skill definition with proficiency tracking
 */
export interface Skill extends CVEntityBase {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  category: string;

  // Experience and validation
  years?: number;
  months?: number; // For more precise tracking
  last_used?: Date;
  first_learned?: Date;

  // Skill validation and evidence
  certifications?: string[];
  projects_used_in?: string[]; // Project IDs where this skill was used
  endorsements?: {
    source: string;
    date: Date;
    comment?: string;
  }[];

  // Learning and development
  learning_resources?: {
    type: 'course' | 'book' | 'tutorial' | 'certification';
    name: string;
    url?: string;
    completed?: boolean;
    completion_date?: Date;
  }[];

  // Market relevance
  market_demand?: 'high' | 'medium' | 'low';
  trending?: boolean;

  // Associated technologies or sub-tech stacks (e.g., Java 17, Kotlin, OAuth2)
  technologies?: string[];

  // Display preferences
  highlight?: boolean;
  show_in_summary?: boolean;
}

/**
 * Enhanced skill categories with hierarchy and relationships
 */
export interface SkillCategory extends CVEntityBase {
  category: string;
  skills: Skill[];
  color: 'primary' | 'secondary' | 'accent';
  icon?: string;
  description?: string;

  // Category hierarchy and organization
  parent_category?: string;
  subcategories?: string[];
  display_order?: number;

  // Category metadata
  industry_relevance?: Industry[];
  market_trends?: {
    growth: 'growing' | 'stable' | 'declining';
    demand: 'high' | 'medium' | 'low';
    future_outlook?: string;
  };

  // Learning path
  recommended_learning_path?: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
}

// ============================================================================
// PROFESSIONAL EXPERIENCE
// ============================================================================

/**
 * Comprehensive work experience with hierarchical positions
 * Supports both modern multi-position structure and legacy single-position format
 */
import type { Industry } from '../shared/constants/industry.constants';

export interface Experience extends TimePeriodBase, LocationBase {
  // Company Information
  company: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry?: Industry[];
  company_description?: string;
  company_website?: string;
  company_logo?: string;

  // Employment Details
  type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'volunteer';
  employment_status?: 'permanent' | 'temporary' | 'seasonal';

  // Position Hierarchy (Modern Structure)
  positions?: Position[]; // Made optional for backward compatibility
  overallStartDate?: Date; // Computed from positions or manual override
  overallEndDate?: Date | null; // Computed from positions or manual override

  // Legacy Support (will be migrated to positions array)
  position?: string;
  title?: string;
  duration?: string;
  startDate?: Date;
  endDate?: Date | null;
  description?: string;
  technologies?: string[];
  achievements?: string[];
  current?: boolean;

  // Additional Context
  referral_source?: string;
  reason_for_leaving?: string;
  notable_projects?: string[];
  team_structure?: {
    reporting_to?: string;
    team_size?: number;
    direct_reports?: number;
    cross_functional_teams?: string[];
  };

  // Performance and Recognition
  performance_reviews?: {
    period: string;
    rating?: string;
    feedback?: string;
    goals_achieved?: string[];
  }[];

  promotions?: {
    from_position: string;
    to_position: string;
    date: Date;
    reason?: string;
  }[];
}

/**
 * Individual position within a company experience
 * Supports detailed tracking of role progression and responsibilities
 */
export interface Position extends TimePeriodBase {
  title: string;
  description: string;
  role?: string; // when different from title (e.g., "Senior Developer" vs "Tech Lead")

  // Core Responsibilities and Skills
  technologies: string[];
  responsibilities: string[];
  achievements: string[];

  // Project and Team Context
  projects?: ExperienceProject[];
  teamSize?: number;
  budget_responsibility?: {
    amount?: number;
    currency?: string;
    description?: string;
  };

  // Performance Metrics
  key_metrics?: {
    metric: string;
    value: string;
    improvement?: string;
    context?: string;
  }[];

  // Professional Development
  skills_developed?: string[];
  training_completed?: {
    name: string;
    provider: string;
    completion_date: Date;
    certification?: string;
  }[];

  // Leadership and Mentoring
  mentoring?: {
    mentees_count?: number;
    mentoring_areas?: string[];
    success_stories?: string[];
  };

  // Recognition and Awards
  awards?: {
    name: string;
    date: Date;
    description?: string;
    issuer?: string;
  }[];
}

/**
 * Project within a work experience context
 * Links professional projects to specific positions
 */
export interface ExperienceProject extends CVEntityBase {
  name: string;
  description: string;
  technologies: string[];
  duration?: string;

  // Project Details
  role_in_project?: string;
  team_size?: number;
  budget?: {
    amount?: number;
    currency?: string;
  };

  // Project Outcomes
  results?: string[];
  metrics?: {
    metric: string;
    value: string;
    improvement?: string;
  }[];

  // Project Links and Documentation
  links?: {
    repository?: string;
    documentation?: string;
    demo?: string;
    case_study?: string;
  };

  // Project Status and Timeline
  status: 'completed' | 'in-progress' | 'cancelled' | 'on-hold';
  start_date?: Date;
  end_date?: Date;

  // Client and Stakeholder Information
  client?: string;
  stakeholders?: string[];

  // Challenges and Learning
  challenges_faced?: string[];
  lessons_learned?: string[];
  innovations?: string[];
}

// ============================================================================
// PROJECTS AND PORTFOLIO
// ============================================================================

/**
 * Comprehensive project definition for portfolio showcase
 * Supports both personal and professional projects
 */
export interface Project extends TimePeriodBase {
  name: string;
  title?: string; // Display title if different from name
  description: string;

  // Technical Details
  technologies: string[];
  architecture?: string[];
  deployment_platforms?: string[];

  // Project Classification
  category?: 'web' | 'mobile' | 'desktop' | 'api' | 'library' | 'tool' | 'research' | 'education' | 'other';
  type?: 'personal' | 'professional' | 'open-source' | 'client' | 'academic';
  complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';

  // Project Status and Timeline
  status: 'completed' | 'in-progress' | 'planned' | 'on-hold' | 'cancelled';

  // Features and Functionality
  features: string[];
  key_innovations?: string[];

  // Links and Resources
  links?: {
    live?: string;
    github?: string;
    demo?: string;
    documentation?: string;
    case_study?: string;
    video_demo?: string;
    presentation?: string;
  };

  // Legacy support
  url?: string;
  github?: string;

  // Visual and Media
  image?: string;
  screenshots?: string[];
  video_url?: string;

  // Metrics and Impact
  metrics?: {
    metric: string;
    value: string;
    description?: string;
  }[];

  // User and Market Impact
  user_feedback?: {
    rating?: number;
    testimonials?: string[];
    usage_stats?: Record<string, string>;
  };

  // Team and Collaboration
  team_size?: number;
  collaborators?: {
    name: string;
    role: string;
    profile_url?: string;
  }[];

  // Learning and Development
  challenges_overcome?: string[];
  skills_learned?: string[];
  future_enhancements?: string[];

  // Display and Presentation
  featured?: boolean;
  highlight_order?: number;
  show_in_portfolio?: boolean;

  // Awards and Recognition
  awards?: {
    name: string;
    issuer: string;
    date: Date;
    description?: string;
  }[];
}

// ============================================================================
// EDUCATION AND LEARNING
// ============================================================================

/**
 * Comprehensive education record with academic achievements
 */
export interface Education extends TimePeriodBase, LocationBase {
  institution: string;
  degree: string;
  field: string;

  // Academic Performance
  gpa?: string;
  gpa_scale?: string; // e.g., "4.0", "100", "First Class"
  class_rank?: string;
  honors?: string[];

  // Academic Details
  major?: string;
  minor?: string;
  concentration?: string;
  thesis_title?: string;
  thesis_advisor?: string;

  // Coursework and Skills
  relevant_coursework?: string[];
  key_projects?: {
    name: string;
    description: string;
    technologies?: string[];
    grade?: string;
  }[];

  // Academic Activities
  extracurricular_activities?: string[];
  leadership_roles?: {
    role: string;
    organization: string;
    description?: string;
    duration?: string;
  }[];

  // Academic Recognition
  scholarships?: {
    name: string;
    amount?: string;
    criteria?: string;
    year?: string;
  }[];

  dean_list?: string[]; // Semesters on dean's list
  academic_awards?: {
    name: string;
    date: Date;
    description?: string;
  }[];

  // Research and Publications
  research_experience?: {
    title: string;
    advisor: string;
    description: string;
    duration: string;
    publications?: string[];
  }[];

  // Institution Details
  institution_type?: 'university' | 'college' | 'community-college' | 'trade-school' | 'online';
  accreditation?: string[];

  description?: string;
}

// ============================================================================
// CERTIFICATIONS AND CREDENTIALS
// ============================================================================

/**
 * Professional certifications with validation and tracking
 */
export interface Certification extends CVEntityBase {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;

  // Credential Verification
  credentialId?: string;
  credentialUrl?: string;
  verification_url?: string;
  badge_url?: string;

  // Certification Details
  description?: string;
  level?: 'foundation' | 'associate' | 'professional' | 'expert' | 'master';
  category?: 'technical' | 'management' | 'industry' | 'safety' | 'compliance';

  // Certification Process
  exam_score?: string;
  passing_score?: string;
  preparation_time?: string;
  study_materials?: {
    type: 'course' | 'book' | 'practice-exam' | 'bootcamp';
    name: string;
    provider?: string;
    url?: string;
  }[];

  // Maintenance and Renewal
  renewal_required?: boolean;
  renewal_period?: string; // e.g., "2 years", "annually"
  continuing_education_required?: boolean;
  maintenance_activities?: {
    activity: string;
    date: Date;
    credits?: number;
  }[];

  // Market Value and Recognition
  industry_recognition?: 'high' | 'medium' | 'low';
  market_demand?: 'high' | 'medium' | 'low';
  salary_impact?: string;

  // Related Skills and Prerequisites
  related_skills?: string[];
  prerequisites?: string[];
  next_level_certifications?: string[];

  // Status and Validity
  status: 'active' | 'expired' | 'in-progress' | 'planned';
  is_current?: boolean; // Computed from expiry date
}

// ============================================================================
// ADDITIONAL CV SECTIONS (RECRUITER-VALUED)
// ============================================================================

/**
 * Volunteer work and community involvement
 */
export interface VolunteerWork extends TimePeriodBase, LocationBase {
  organization: string;
  role: string;
  description: string;

  // Impact and Achievements
  achievements?: string[];
  skills_used?: string[];
  skills_developed?: string[];

  // Organization Details
  organization_type?: 'nonprofit' | 'charity' | 'community' | 'religious' | 'educational';
  cause_area?: string;
  organization_size?: string;

  // Time Commitment
  hours_per_week?: number;
  total_hours?: number;

  // Recognition
  awards?: string[];
  references?: {
    name: string;
    title: string;
    contact?: string;
  }[];
}

/**
 * Publications and thought leadership
 */
export interface Publication extends CVEntityBase {
  title: string;
  type: 'article' | 'blog-post' | 'research-paper' | 'book' | 'white-paper' | 'case-study';
  publication_venue?: string; // Journal, blog, conference, etc.
  publication_date: Date;

  // Content Details
  abstract?: string;
  keywords?: string[];
  topics?: string[];

  // Authorship
  authors?: {
    name: string;
    affiliation?: string;
    is_primary_author?: boolean;
  }[];

  // Links and Access
  url?: string;
  doi?: string;
  pdf_url?: string;

  // Impact Metrics
  citations?: number;
  downloads?: number;
  views?: number;

  // Peer Review
  peer_reviewed?: boolean;
  conference_acceptance_rate?: string;

  // Recognition
  awards?: string[];
  featured?: boolean;
}

/**
 * Speaking engagements and presentations
 */
export interface Speaking extends CVEntityBase {
  title: string;
  event_name: string;
  event_type: 'conference' | 'meetup' | 'workshop' | 'webinar' | 'podcast' | 'panel';
  date: Date;
  location?: string;
  virtual?: boolean;

  // Presentation Details
  description?: string;
  topics?: string[];
  audience_size?: number;
  audience_type?: string;

  // Content and Materials
  slides_url?: string;
  video_url?: string;
  recording_url?: string;
  materials_url?: string;

  // Recognition and Feedback
  feedback_score?: number;
  testimonials?: string[];

  // Event Details
  event_website?: string;
  organizer?: string;

  // Speaking Role
  role: 'keynote' | 'speaker' | 'panelist' | 'moderator' | 'workshop-leader';
  invited?: boolean;
}

/**
 * Professional references
 */
export interface Reference extends CVEntityBase {
  name: string;
  title: string;
  company: string;
  relationship: 'manager' | 'colleague' | 'direct-report' | 'client' | 'mentor' | 'other';

  // Contact Information
  email?: string;
  phone?: string;
  linkedin?: string;

  // Context
  worked_together_period?: {
    start: Date;
    end?: Date;
  };
  projects_collaborated_on?: string[];

  // Reference Details
  can_contact?: boolean;
  preferred_contact_method?: 'email' | 'phone' | 'linkedin';
  best_contact_time?: string;

  // Relationship Context
  how_they_know_you?: string;
  key_projects_together?: string[];

  // Reference Quality
  reference_strength?: 'strong' | 'good' | 'neutral';
  areas_they_can_speak_to?: string[];

  // Privacy and Consent
  consent_given?: boolean;
  consent_date?: Date;
  reference_letter_available?: boolean;
}

/**
 * Enhanced contact information
 */
export interface ContactInfo extends CVEntityBase {
  email: string;
  phone: string;
  location: string;
  timezone?: string;
  availability?: string;
  preferredContact?: 'email' | 'phone' | 'linkedin';

  // Additional Contact Methods
  secondary_email?: string;
  secondary_phone?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Professional Addresses
  mailing_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };

  // Communication Preferences
  communication_preferences?: {
    email_frequency?: 'immediate' | 'daily' | 'weekly';
    phone_hours?: string;
    time_zone_preference?: string;
    language_preference?: string;
  };
}

// ============================================================================
// MAIN CV DATA STRUCTURE - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Complete CV data structure serving as the single source of truth
 * All UI components and PDF generation consume this structure
 * Adding new sections here automatically makes them available everywhere
 */
export interface CVData extends CVEntityBase {
  // Core Information (Required)
  personalInfo: PersonalInfo;
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];

  // Enhanced Sections (Optional but Recommended)
  socialLinks?: SocialLink[];
  stats?: Stat[];
  skillCategories?: SkillCategory[];
  education?: Education[];
  certifications?: Certification[];

  // Additional Professional Sections
  volunteerWork?: VolunteerWork[];
  publications?: Publication[];
  speaking?: Speaking[];
  references?: Reference[];

  // Contact and Availability
  contactInfo?: ContactInfo;

  // Data Management
  lastUpdated: Date;
  data_schema_version?: string; // For migration tracking

  // Content Strategy
  content_strategy?: {
    target_roles?: string[];
    target_industries?: Industry[];
    key_messaging?: string[];
    differentiators?: string[];
  };

  // Privacy and Visibility
  privacy_settings?: {
    public_sections?: string[];
    recruiter_only_sections?: string[];
    private_sections?: string[];
  };

  // Analytics and Tracking
  analytics?: {
    profile_views?: number;
    pdf_downloads?: number;
    contact_form_submissions?: number;
    last_analytics_update?: Date;
  };

  // Customization and Theming
  theme_preferences?: {
    color_scheme?: 'default' | 'professional' | 'creative' | 'minimal';
    layout_style?: 'modern' | 'classic' | 'compact';
    section_order?: string[];
    hidden_sections?: string[];
  };
}

// ============================================================================
// DATA VALIDATION AND SCHEMAS
// ============================================================================

/**
 * Validation schema for runtime data validation
 * Ensures data integrity across all consumers
 */
export interface ValidationSchema {
  required_fields: string[];
  field_types: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'>;
  field_constraints?: Record<string, {
    min_length?: number;
    max_length?: number;
    pattern?: string;
    enum_values?: string[];
    min_value?: number;
    max_value?: number;
  }>;
  custom_validators?: Record<string, (value: any) => boolean>;
}

/**
 * Validation result with detailed feedback
 */
export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }[];
  warnings?: {
    field: string;
    message: string;
    suggestion?: string;
  }[];
  completeness_score?: number; // 0-100 percentage
  suggestions?: string[];
}

/**
 * Data migration interface for schema updates
 */
export interface DataMigration {
  from_version: string;
  to_version: string;
  migration_steps: {
    step: string;
    description: string;
    transform: (data: any) => any;
  }[];
  rollback_steps?: {
    step: string;
    transform: (data: any) => any;
  }[];
}

// ============================================================================
// REACTIVE PATTERNS FOR ANGULAR SIGNALS
// ============================================================================

/**
 * Signal-compatible data change event
 */
export interface DataChangeEvent<T = any> {
  type: 'create' | 'update' | 'delete' | 'bulk_update';
  entity_type: string;
  entity_id?: string;
  old_value?: T;
  new_value?: T;
  timestamp: Date;
  source: 'user' | 'system' | 'import' | 'migration';
  metadata?: Record<string, any>;
}

/**
 * Computed data dependencies for reactive updates
 */
export interface ComputedDependencies {
  depends_on: string[]; // Field paths that trigger recomputation
  compute_function: string; // Function name for computation
  cache_duration?: number; // Cache time in milliseconds
  invalidate_on?: string[]; // Events that invalidate cache
}

/**
 * Data subscription configuration for real-time updates
 */
export interface DataSubscription {
  entity_types: string[];
  change_types: ('create' | 'update' | 'delete')[];
  filters?: Record<string, any>;
  callback: (event: DataChangeEvent) => void;
  debounce_ms?: number;
}

// ============================================================================
// UTILITY TYPES AND ENUMS
// ============================================================================

// Enhanced utility types for type safety
export type ProjectStatus = Project['status'];
export type ExperienceType = Experience['type'];
export type SkillCategoryColor = SkillCategory['color'];
export type TrendDirection = Stat['trend'];
export type EducationType = Education['institution_type'];
export type CertificationStatus = Certification['status'];
export type PublicationType = Publication['type'];
export type SpeakingRole = Speaking['role'];
export type ReferenceRelationship = Reference['relationship'];

// Section visibility types
export type SectionVisibility = 'public' | 'private' | 'recruiter-only';
export type CVSection = keyof Omit<CVData, keyof CVEntityBase | 'lastUpdated' | 'version'>;

// Data quality metrics
export type DataQualityScore = {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  consistency: number; // 0-100
  timeliness: number; // 0-100
  overall: number; // 0-100
};

// ============================================================================
// HELPER TYPES AND FUNCTIONS FOR SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Type-safe field paths for nested object access
 */
export type FieldPath<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${FieldPath<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

/**
 * Extract type from field path
 */
export type FieldType<T, P extends FieldPath<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends FieldPath<T[K]>
      ? FieldType<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

/**
 * Data change notification for reactive updates
 */
export interface DataChangeNotification<T = any> {
  entity_type: string;
  entity_id: string;
  field_path?: string;
  change_type: 'create' | 'update' | 'delete' | 'bulk_update';
  old_value?: T;
  new_value?: T;
  timestamp: Date;
  source: 'user' | 'system' | 'import' | 'sync';
  propagate_to?: string[]; // Which consumers should be notified
}

/**
 * Extensible section configuration for easy addition of new CV sections
 */
export interface CVSectionConfig {
  section_key: string;
  display_name: string;
  description?: string;
  icon?: string;

  // Visibility and Access
  default_visibility: SectionVisibility;
  required_for_completeness?: boolean;

  // Display Configuration
  display_order: number;
  collapsible: boolean;
  default_collapsed?: boolean;

  // Data Configuration
  data_type: 'array' | 'object' | 'primitive';
  validation_schema?: ValidationSchema;

  // UI Configuration
  component_name?: string;
  pdf_template?: string;

  // Feature Flags
  enabled: boolean;
  beta_feature?: boolean;

  // Dependencies
  depends_on?: string[];
  conflicts_with?: string[];
}

/**
 * Content strategy configuration for targeted CV presentation
 */
export interface ContentStrategy {
  strategy_name: string;
  target_audience: 'general' | 'technical' | 'executive' | 'startup' | 'enterprise';

  // Section Prioritization
  section_weights: Record<string, number>; // 0-1 importance weights
  highlighted_sections: string[];
  hidden_sections: string[];

  // Content Emphasis
  skill_emphasis: 'technical' | 'leadership' | 'business' | 'creative';
  experience_focus: 'recent' | 'relevant' | 'progressive' | 'diverse';
  project_selection: 'technical' | 'impact' | 'scale' | 'innovation';

  // Messaging
  key_value_propositions: string[];
  differentiators: string[];
  call_to_action?: string;

  // Customization Rules
  content_rules: {
    rule_name: string;
    condition: string; // JSONPath or similar
    action: 'show' | 'hide' | 'emphasize' | 'modify';
    parameters?: Record<string, any>;
  }[];
}

/**
 * Data export configuration for different formats and purposes
 */
export interface ExportConfig {
  format: 'json' | 'pdf' | 'html' | 'docx' | 'txt' | 'csv';
  purpose: 'backup' | 'sharing' | 'printing' | 'ats' | 'portfolio';

  // Content Selection
  included_sections: string[];
  content_strategy?: string; // Reference to ContentStrategy

  // Format-Specific Options
  pdf_config?: PDFConfig;
  html_config?: {
    include_styles: boolean;
    responsive: boolean;
    print_optimized: boolean;
  };

  // Privacy and Security
  anonymize_contact_info?: boolean;
  exclude_private_sections?: boolean;
  watermark?: string;

  // Metadata
  include_metadata: boolean;
  export_timestamp: boolean;
  version_info: boolean;
}

// ============================================================================
// CONSTANTS AND DEFAULTS
// ============================================================================

/**
 * Default CV section configurations
 */
export const DEFAULT_CV_SECTIONS: Record<string, CVSectionConfig> = {
  personalInfo: {
    section_key: 'personalInfo',
    display_name: 'Personal Information',
    display_order: 1,
    collapsible: false,
    default_visibility: 'public',
    required_for_completeness: true,
    data_type: 'object',
    enabled: true
  },
  experiences: {
    section_key: 'experiences',
    display_name: 'Professional Experience',
    display_order: 2,
    collapsible: true,
    default_visibility: 'public',
    required_for_completeness: true,
    data_type: 'array',
    enabled: true
  },
  skills: {
    section_key: 'skills',
    display_name: 'Skills & Technologies',
    display_order: 3,
    collapsible: true,
    default_visibility: 'public',
    required_for_completeness: true,
    data_type: 'array',
    enabled: true
  },
  projects: {
    section_key: 'projects',
    display_name: 'Projects & Portfolio',
    display_order: 4,
    collapsible: true,
    default_visibility: 'public',
    required_for_completeness: false,
    data_type: 'array',
    enabled: true
  },
  education: {
    section_key: 'education',
    display_name: 'Education',
    display_order: 5,
    collapsible: true,
    default_visibility: 'public',
    required_for_completeness: false,
    data_type: 'array',
    enabled: true
  },
  certifications: {
    section_key: 'certifications',
    display_name: 'Certifications',
    display_order: 6,
    collapsible: true,
    default_visibility: 'public',
    required_for_completeness: false,
    data_type: 'array',
    enabled: true
  }
};

/**
 * Schema version for data migration tracking
 */
export const CURRENT_SCHEMA_VERSION = '2.0.0';

/**
 * Supported data export formats
 */
export const SUPPORTED_EXPORT_FORMATS = ['json', 'pdf', 'html', 'docx'] as const;

/**
 * Default content strategies
 */
export const DEFAULT_CONTENT_STRATEGIES = {
  technical: 'Technical Role Focus',
  leadership: 'Leadership & Management Focus',
  startup: 'Startup & Innovation Focus',
  enterprise: 'Enterprise & Scale Focus'
} as const;

// ============================================================================
// FORMS AND USER INTERACTIONS
// ============================================================================

/**
 * Enhanced contact form with lead qualification
 */
export interface ContactFormData extends CVEntityBase {
  // Basic Information
  name: string;
  email: string;
  subject: string;
  message: string;

  // Optional Details
  company?: string;
  phone?: string;
  job_title?: string;

  // Lead Qualification
  inquiry_type?: 'job_opportunity' | 'freelance' | 'collaboration' | 'speaking' | 'general';
  urgency?: 'low' | 'medium' | 'high';
  budget_range?: string;
  timeline?: string;

  // Context
  how_did_you_find_me?: string;
  referral_source?: string;

  // Preferences
  preferred_contact_method?: 'email' | 'phone' | 'video_call';
  best_time_to_contact?: string;

  // Consent and Privacy
  consent_to_contact?: boolean;
  consent_to_store_data?: boolean;
  newsletter_signup?: boolean;

  // Anti-spam
  honeypot?: string; // Should be empty
  captcha_token?: string;
}

/**
 * Enhanced form response with tracking
 */
export interface ContactFormResponse {
  success: boolean;
  message: string;
  timestamp: string;

  // Response Details
  response_id?: string;
  estimated_response_time?: string;
  next_steps?: string[];

  // Analytics
  form_completion_time?: number; // milliseconds
  user_agent?: string;
  referrer?: string;

  // Follow-up
  follow_up_scheduled?: boolean;
  follow_up_date?: string;
}

// ============================================================================
// ANALYTICS AND TRACKING
// ============================================================================

/**
 * Enhanced analytics event with context
 */
export interface AnalyticsEvent extends CVEntityBase {
  event: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: string;

  // Enhanced Context
  user_id?: string;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
  referrer?: string;

  // Event Properties
  properties?: Record<string, any>;
  custom_dimensions?: Record<string, string>;

  // Performance Metrics
  page_load_time?: number;
  interaction_time?: number;

  // User Journey
  funnel_step?: string;
  conversion_goal?: string;

  // Device and Location
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

/**
 * Enhanced page view tracking
 */
export interface PageView extends CVEntityBase {
  page: string;
  timestamp: string;
  userAgent?: string;
  referrer?: string;

  // Enhanced Tracking
  session_id?: string;
  user_id?: string;

  // Page Performance
  load_time?: number;
  time_on_page?: number;
  scroll_depth?: number;

  // User Interaction
  clicks?: number;
  form_interactions?: number;
  downloads?: string[];

  // Traffic Source
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;

  // Device Information
  screen_resolution?: string;
  viewport_size?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';

  // Exit Information
  exit_page?: boolean;
  bounce?: boolean;
  conversion?: boolean;
}

// ============================================================================
// CONFIGURATION AND CUSTOMIZATION
// ============================================================================

/**
 * Enhanced PDF generation configuration
 */
export interface PDFConfig extends CVEntityBase {
  // Section Inclusion
  includeProjects: boolean;
  includeSkills: boolean;
  includeEducation: boolean;
  includeCertifications: boolean;
  includeVolunteerWork?: boolean;
  includePublications?: boolean;
  includeSpeaking?: boolean;
  includeReferences?: boolean;

  // Template and Styling
  template: 'modern' | 'classic' | 'minimal' | 'executive' | 'creative';
  colorScheme: 'default' | 'monochrome' | 'accent' | 'professional' | 'vibrant';

  // Layout Options
  layout: 'single-column' | 'two-column' | 'three-column';
  page_size: 'A4' | 'Letter' | 'Legal';
  margins: 'narrow' | 'normal' | 'wide';

  // Content Customization
  max_experience_items?: number;
  max_project_items?: number;
  max_skills_per_category?: number;

  // Personalization
  target_role?: string;
  target_company?: string;
  custom_sections?: {
    title: string;
    content: string;
    position: number;
  }[];

  // Branding
  include_logo?: boolean;
  include_qr_code?: boolean;
  watermark?: string;

  // Export Options
  file_name?: string;
  password_protect?: boolean;
  include_metadata?: boolean;

  // Quality and Performance
  image_quality: 'low' | 'medium' | 'high';
  compression_level: 'none' | 'low' | 'medium' | 'high';
}

/**
 * Enhanced theme and customization configuration
 */
export interface ThemeConfig extends CVEntityBase {
  // Color Scheme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;

  // Mode and Appearance
  darkMode: boolean;
  highContrast?: boolean;
  colorBlindFriendly?: boolean;

  // Visual Effects
  animations: boolean;
  glassEffects: boolean;
  gradients?: boolean;
  shadows?: boolean;
  borderRadius?: 'none' | 'small' | 'medium' | 'large';

  // Typography
  fontFamily?: 'system' | 'serif' | 'sans-serif' | 'monospace';
  fontSize?: 'small' | 'medium' | 'large';
  fontWeight?: 'light' | 'normal' | 'medium' | 'bold';
  lineHeight?: 'tight' | 'normal' | 'relaxed';

  // Layout
  spacing?: 'compact' | 'normal' | 'spacious';
  containerWidth?: 'narrow' | 'normal' | 'wide' | 'full';

  // Interactive Elements
  buttonStyle?: 'flat' | 'outlined' | 'filled' | 'ghost';
  hoverEffects?: boolean;
  focusIndicators?: boolean;

  // Accessibility
  reducedMotion?: boolean;
  screenReaderOptimized?: boolean;
  keyboardNavigationEnhanced?: boolean;

  // Custom CSS
  customCSS?: string;
  cssVariables?: Record<string, string>;
}

// ============================================================================
// API AND ERROR HANDLING
// ============================================================================

/**
 * Enhanced API response with metadata
 */
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;

  // Enhanced Response Data
  request_id?: string;
  response_time?: number;
  cache_hit?: boolean;

  // Pagination (for list responses)
  pagination?: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };

  // Metadata
  api_version?: string;
  rate_limit?: {
    remaining: number;
    reset_time: string;
  };

  // Warnings and Info
  warnings?: string[];
  deprecation_notices?: string[];
}

/**
 * Enhanced error handling with context
 */
export interface CVError extends CVEntityBase {
  code: string;
  message: string;
  details?: any;
  timestamp: string;

  // Error Context
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'network' | 'authentication' | 'authorization' | 'system' | 'user';

  // Technical Details
  stack_trace?: string;
  request_id?: string;
  user_agent?: string;
  url?: string;

  // User Experience
  user_message?: string;
  suggested_actions?: string[];
  help_url?: string;

  // Recovery
  recoverable?: boolean;
  retry_after?: number;

  // Tracking
  error_id?: string;
  correlation_id?: string;
  reported?: boolean;
}

// Legacy validation result interface (kept for backward compatibility)
export interface LegacyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

/**
 * Enhanced search and filtering capabilities
 */
export interface SearchFilters extends CVEntityBase {
  // Basic Filters
  technologies?: string[];
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  featured?: boolean;
  status?: ProjectStatus[];

  // Advanced Filters
  skill_levels?: string[];
  experience_types?: ExperienceType[];
  industries?: Industry[];
  locations?: string[];

  // Text Search
  query?: string;
  search_fields?: string[];
  fuzzy_search?: boolean;

  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';

  // Faceted Search
  facets?: Record<string, string[]>;

  // Personalization
  user_preferences?: Record<string, any>;
  recommendation_boost?: boolean;
}

/**
 * Enhanced search results with analytics
 */
export interface SearchResult<T> extends CVEntityBase {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;

  // Search Metadata
  query?: string;
  search_time?: number;
  filters_applied?: SearchFilters;

  // Facets and Aggregations
  facets?: Record<string, {
    value: string;
    count: number;
  }[]>;

  // Suggestions
  suggestions?: string[];
  did_you_mean?: string;

  // Analytics
  search_id?: string;
  result_clicks?: Record<string, number>;
}
