/**
 * CV Data Validation Utilities
 * Provides runtime validation for the comprehensive CV data models
 * Ensures data integrity across all consumers (UI, PDF, etc.)
 */

import { 
  CVData, 
  ValidationResult, 
  ValidationSchema, 
  PersonalInfo, 
  Experience, 
  Project, 
  Skill,
  Education,
  Certification,
  DataQualityScore,
  CURRENT_SCHEMA_VERSION
} from './cv-data.interface';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const PERSONAL_INFO_SCHEMA: ValidationSchema = {
  required_fields: ['name', 'title', 'email'],
  field_types: {
    name: 'string',
    title: 'string',
    email: 'string',
    phone: 'string',
    location: 'string'
  },
  field_constraints: {
    name: { min_length: 2, max_length: 100 },
    title: { min_length: 5, max_length: 200 },
    email: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
    phone: { pattern: '^[+]?[0-9\\s\\-\\(\\)]+$' }
  }
};

export const EXPERIENCE_SCHEMA: ValidationSchema = {
  required_fields: ['company', 'location'],
  field_types: {
    company: 'string',
    location: 'string',
    startDate: 'date',
    endDate: 'date'
  },
  field_constraints: {
    company: { min_length: 2, max_length: 100 },
    location: { min_length: 2, max_length: 100 }
  }
};

export const PROJECT_SCHEMA: ValidationSchema = {
  required_fields: ['name', 'description', 'status'],
  field_types: {
    name: 'string',
    description: 'string',
    status: 'string',
    technologies: 'array'
  },
  field_constraints: {
    name: { min_length: 3, max_length: 100 },
    description: { min_length: 10, max_length: 1000 },
    status: { enum_values: ['completed', 'in-progress', 'planned', 'on-hold', 'cancelled'] }
  }
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a complete CV data structure
 */
export function validateCVData(data: CVData): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  // Validate required sections
  if (!data.personalInfo) {
    errors.push({
      field: 'personalInfo',
      message: 'Personal information is required',
      severity: 'error'
    });
  } else {
    const personalInfoResult = validatePersonalInfo(data.personalInfo);
    errors.push(...personalInfoResult.errors);
    warnings.push(...(personalInfoResult.warnings || []));
  }

  // Validate experiences
  if (!data.experiences || data.experiences.length === 0) {
    warnings.push({
      field: 'experiences',
      message: 'No work experience provided',
      suggestion: 'Add at least one work experience for a complete profile'
    });
  } else {
    data.experiences.forEach((exp, index) => {
      const expResult = validateExperience(exp);
      expResult.errors.forEach(error => {
        errors.push({
          ...error,
          field: `experiences[${index}].${error.field}`
        });
      });
    });
  }

  // Validate projects
  if (data.projects && data.projects.length > 0) {
    data.projects.forEach((project, index) => {
      const projectResult = validateProject(project);
      projectResult.errors.forEach(error => {
        errors.push({
          ...error,
          field: `projects[${index}].${error.field}`
        });
      });
    });
  }

  // Calculate completeness score
  const completenessScore = calculateCompletenessScore(data);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness_score: completenessScore,
    suggestions: generateSuggestions(data, completenessScore)
  };
}

/**
 * Validates personal information
 */
export function validatePersonalInfo(info: PersonalInfo): ValidationResult {
  return validateAgainstSchema(info, PERSONAL_INFO_SCHEMA);
}

/**
 * Validates work experience
 */
export function validateExperience(experience: Experience): ValidationResult {
  const result = validateAgainstSchema(experience, EXPERIENCE_SCHEMA);
  
  // Additional business logic validation
  if (experience.startDate && experience.endDate) {
    if (new Date(experience.startDate) > new Date(experience.endDate)) {
      result.errors.push({
        field: 'endDate',
        message: 'End date cannot be before start date',
        severity: 'error'
      });
    }
  }

  return result;
}

/**
 * Validates project data
 */
export function validateProject(project: Project): ValidationResult {
  return validateAgainstSchema(project, PROJECT_SCHEMA);
}

/**
 * Generic schema validation function
 */
export function validateAgainstSchema(data: any, schema: ValidationSchema): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  // Check required fields
  schema.required_fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push({
        field,
        message: `${field} is required`,
        severity: 'error'
      });
    }
  });

  // Check field types and constraints
  Object.entries(schema.field_types).forEach(([field, expectedType]) => {
    const value = data[field];
    if (value !== undefined && value !== null) {
      const actualType = getFieldType(value);
      if (actualType !== expectedType) {
        errors.push({
          field,
          message: `Expected ${expectedType}, got ${actualType}`,
          severity: 'error'
        });
      }

      // Check constraints
      const constraints = schema.field_constraints?.[field];
      if (constraints) {
        const constraintErrors = validateConstraints(field, value, constraints);
        errors.push(...constraintErrors);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates field constraints
 */
function validateConstraints(field: string, value: any, constraints: any): ValidationResult['errors'] {
  const errors: ValidationResult['errors'] = [];

  if (typeof value === 'string') {
    if (constraints.min_length && value.length < constraints.min_length) {
      errors.push({
        field,
        message: `Minimum length is ${constraints.min_length} characters`,
        severity: 'error'
      });
    }
    if (constraints.max_length && value.length > constraints.max_length) {
      errors.push({
        field,
        message: `Maximum length is ${constraints.max_length} characters`,
        severity: 'error'
      });
    }
    if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) {
      errors.push({
        field,
        message: `Invalid format for ${field}`,
        severity: 'error'
      });
    }
  }

  if (typeof value === 'number') {
    if (constraints.min_value && value < constraints.min_value) {
      errors.push({
        field,
        message: `Minimum value is ${constraints.min_value}`,
        severity: 'error'
      });
    }
    if (constraints.max_value && value > constraints.max_value) {
      errors.push({
        field,
        message: `Maximum value is ${constraints.max_value}`,
        severity: 'error'
      });
    }
  }

  if (constraints.enum_values && !constraints.enum_values.includes(value)) {
    errors.push({
      field,
      message: `Value must be one of: ${constraints.enum_values.join(', ')}`,
      severity: 'error'
    });
  }

  return errors;
}

/**
 * Determines the type of a field value
 */
function getFieldType(value: any): string {
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (value === null) return 'null';
  return typeof value;
}

/**
 * Calculates completeness score for CV data
 */
export function calculateCompletenessScore(data: CVData): number {
  let totalWeight = 0;
  let completedWeight = 0;

  // Core sections (higher weight)
  const coreWeights = {
    personalInfo: 20,
    experiences: 25,
    skills: 20,
    projects: 15
  };

  // Optional sections (lower weight)
  const optionalWeights = {
    education: 5,
    certifications: 5,
    socialLinks: 3,
    volunteerWork: 2,
    publications: 2,
    speaking: 2,
    references: 1
  };

  // Calculate core completeness
  Object.entries(coreWeights).forEach(([section, weight]) => {
    totalWeight += weight;
    if (data[section as keyof CVData]) {
      completedWeight += weight;
    }
  });

  // Calculate optional completeness
  Object.entries(optionalWeights).forEach(([section, weight]) => {
    totalWeight += weight;
    const sectionData = data[section as keyof CVData];
    if (sectionData && (Array.isArray(sectionData) ? sectionData.length > 0 : true)) {
      completedWeight += weight;
    }
  });

  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Generates improvement suggestions based on CV data
 */
export function generateSuggestions(data: CVData, completenessScore: number): string[] {
  const suggestions: string[] = [];

  if (completenessScore < 70) {
    suggestions.push('Consider adding more sections to improve profile completeness');
  }

  if (!data.education || data.education.length === 0) {
    suggestions.push('Add education information to strengthen your profile');
  }

  if (!data.certifications || data.certifications.length === 0) {
    suggestions.push('Include relevant certifications to showcase your expertise');
  }

  if (!data.projects || data.projects.length < 3) {
    suggestions.push('Add more projects to demonstrate your practical experience');
  }

  if (data.experiences && data.experiences.length > 0) {
    const hasRecentExperience = data.experiences.some(exp => {
      const endDate = exp.endDate || exp.overallEndDate;
      if (!endDate) return true; // Current position
      const yearsSince = (Date.now() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      return yearsSince < 2;
    });

    if (!hasRecentExperience) {
      suggestions.push('Consider updating with more recent work experience');
    }
  }

  return suggestions;
}

/**
 * Calculates data quality score
 */
export function calculateDataQualityScore(data: CVData): DataQualityScore {
  const completeness = calculateCompletenessScore(data);
  const validation = validateCVData(data);
  
  // Accuracy based on validation errors
  const accuracy = validation.errors.length === 0 ? 100 : Math.max(0, 100 - (validation.errors.length * 10));
  
  // Consistency (simplified - could be more sophisticated)
  const consistency = 85; // Placeholder - would check for consistent formatting, dates, etc.
  
  // Timeliness based on last updated date
  const daysSinceUpdate = (Date.now() - new Date(data.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
  const timeliness = Math.max(0, 100 - (daysSinceUpdate * 2)); // Decreases 2 points per day
  
  const overall = Math.round((completeness + accuracy + consistency + timeliness) / 4);

  return {
    completeness,
    accuracy,
    consistency,
    timeliness,
    overall
  };
}
