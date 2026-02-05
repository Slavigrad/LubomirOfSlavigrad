/**
 * Audience-specific technology priority maps for PDF processing.
 * Used for prioritizing technologies based on target audience.
 *
 * DRY-3: Consolidated from pdf-data-processor.service.ts
 */

/**
 * Base technology priorities by audience type.
 * Used by extractKeyTechnologies() and extractPrimaryTechnologies().
 */
export const AUDIENCE_TECH_PRIORITIES: Record<string, string[]> = {
  recruiter: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Docker'],
  technical: ['Java', 'Kotlin', 'Spring Boot', 'Kafka', 'Kubernetes', 'Angular'],
  executive: ['Java', 'Spring Boot', 'AWS', 'Microservices', 'Leadership'],
} as const;

/**
 * Extended technology priorities by audience type.
 * Includes additional technologies for relevance scoring.
 * Used by calculateTechnologyRelevance().
 *
 * Derived from AUDIENCE_TECH_PRIORITIES with additional items per audience.
 */
export const AUDIENCE_TECH_PRIORITIES_EXTENDED: Record<string, string[]> = {
  recruiter: [...AUDIENCE_TECH_PRIORITIES['recruiter'], 'Kubernetes'],
  technical: [...AUDIENCE_TECH_PRIORITIES['technical'], 'Microservices'],
  executive: [...AUDIENCE_TECH_PRIORITIES['executive'], 'Architecture'],
} as const;

/**
 * Type-safe audience keys for compile-time checking.
 */
export type AudienceType = 'recruiter' | 'technical' | 'executive';

/**
 * Get technology priorities for an audience, with fallback to recruiter.
 */
export function getTechPriorities(
  audience: string,
  extended = false
): string[] {
  const map = extended
    ? AUDIENCE_TECH_PRIORITIES_EXTENDED
    : AUDIENCE_TECH_PRIORITIES;
  return map[audience] || map['recruiter'];
}

