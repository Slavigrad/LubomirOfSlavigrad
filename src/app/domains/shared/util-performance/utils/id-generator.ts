/**
 * ID Generation Utility
 * 
 * Provides consistent unique ID generation across the application.
 * Replaces duplicated patterns in cv-data.service, pdf-analytics.service,
 * pdf-generation-orchestrator.service, and pdf-performance.service.
 */

/**
 * Generates a unique ID with the given prefix.
 * 
 * Format: `{prefix}-{timestamp}-{random}`
 * 
 * @param prefix - The prefix for the ID (e.g., 'session', 'event', 'exp')
 * @returns A unique string ID
 * 
 * @example
 * generateId('session') // 'session-1738720800000-abc123xyz'
 * generateId('event')   // 'event-1738720800000-def456ghi'
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

