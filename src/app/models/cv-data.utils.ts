/**
 * CV Data Utilities and Transformations
 * Provides helper functions for data manipulation, migration, and computed properties
 * Supports the single source of truth architecture with automatic propagation
 */

import {
  CVData,
  Experience,
  Position,
  Project,
  Skill,
  SkillCategory,
  DataChangeNotification,
  ContentStrategy,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_CV_SECTIONS
} from './cv-data.interface';

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Migrates legacy experience format to new hierarchical structure
 */
export function migrateLegacyExperience(experience: Experience): Experience {
  // If already using new format, return as-is
  if (experience.positions && experience.positions.length > 0) {
    return experience;
  }

  // Convert legacy fields to position structure
  const position: Position = {
    id: `${experience.id}-pos-1`,
    title: experience.title || experience.position || 'Position',
    startDate: experience.startDate || new Date(),
    endDate: experience.endDate,
    description: experience.description || '',
    technologies: experience.technologies || [],
    responsibilities: [], // Would need to be populated manually
    achievements: experience.achievements || [],
    isCurrent: experience.current,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    ...experience,
    positions: [position],
    overallStartDate: experience.startDate,
    overallEndDate: experience.endDate,
    // Keep legacy fields for backward compatibility
    updatedAt: new Date()
  };
}

/**
 * Computes overall experience dates from positions
 */
export function computeOverallExperienceDates(experience: Experience): { startDate: Date; endDate: Date | null } {
  if (!experience.positions || experience.positions.length === 0) {
    return {
      startDate: experience.startDate || new Date(),
      endDate: experience.endDate || null
    };
  }

  const positions = experience.positions;
  const startDate = new Date(Math.min(...positions.map(p => new Date(p.startDate || new Date()).getTime())));

  // If any position is current (no end date), overall end date is null
  const hasCurrentPosition = positions.some(p => !p.endDate);
  const endDate = hasCurrentPosition
    ? null
    : new Date(Math.max(...positions.filter(p => p.endDate).map(p => new Date(p.endDate!).getTime())));

  return { startDate, endDate };
}

/**
 * Calculates total years of experience
 */
export function calculateTotalExperience(experiences: Experience[]): number {
  let totalMonths = 0;
  const processedPeriods: { start: Date; end: Date }[] = [];

  experiences.forEach(exp => {
    const { startDate, endDate } = computeOverallExperienceDates(exp);
    const end = endDate || new Date();

    processedPeriods.push({ start: startDate, end });
  });

  // Sort periods by start date
  processedPeriods.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Merge overlapping periods and calculate total
  let currentStart = processedPeriods[0]?.start;
  let currentEnd = processedPeriods[0]?.end;

  for (let i = 1; i < processedPeriods.length; i++) {
    const period = processedPeriods[i];

    if (period.start <= currentEnd) {
      // Overlapping period - extend current end if necessary
      currentEnd = new Date(Math.max(currentEnd.getTime(), period.end.getTime()));
    } else {
      // Non-overlapping period - add current period to total and start new one
      totalMonths += getMonthsDifference(currentStart, currentEnd);
      currentStart = period.start;
      currentEnd = period.end;
    }
  }

  // Add the last period
  if (currentStart && currentEnd) {
    totalMonths += getMonthsDifference(currentStart, currentEnd);
  }

  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
}

/**
 * Gets difference in months between two dates
 */
function getMonthsDifference(start: Date, end: Date): number {
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  return yearDiff * 12 + monthDiff;
}

/**
 * Groups skills by category with computed metadata
 */
export function groupSkillsByCategory(skills: Skill[]): SkillCategory[] {
  const categoryMap = new Map<string, Skill[]>();

  skills.forEach(skill => {
    if (!categoryMap.has(skill.category)) {
      categoryMap.set(skill.category, []);
    }
    categoryMap.get(skill.category)!.push(skill);
  });

  return Array.from(categoryMap.entries()).map(([category, categorySkills], index) => ({
    id: `category-${category.toLowerCase().replace(/\s+/g, '-')}`,
    category,
    skills: categorySkills.sort((a, b) => {
      // Sort by level (expert first) then by years of experience
      const levelOrder = { 'master': 5, 'expert': 4, 'advanced': 3, 'intermediate': 2, 'beginner': 1 };
      const levelDiff = (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
      if (levelDiff !== 0) return levelDiff;
      return (b.years || 0) - (a.years || 0);
    }),
    color: getColorForCategory(category, index),
    display_order: index,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

/**
 * Gets appropriate color for skill category
 */
function getColorForCategory(category: string, index: number): 'primary' | 'secondary' | 'accent' {
  const colors: ('primary' | 'secondary' | 'accent')[] = ['primary', 'secondary', 'accent'];
  return colors[index % colors.length];
}

/**
 * Extracts all technologies from experiences and projects
 */
export function extractAllTechnologies(data: CVData): string[] {
  const technologies = new Set<string>();

  // From experiences
  data.experiences.forEach(exp => {
    if (exp.technologies) {
      exp.technologies.forEach(tech => technologies.add(tech));
    }
    if (exp.positions) {
      exp.positions.forEach(pos => {
        pos.technologies.forEach(tech => technologies.add(tech));
      });
    }
  });

  // From projects
  data.projects.forEach(project => {
    project.technologies.forEach(tech => technologies.add(tech));
  });

  return Array.from(technologies).sort();
}

/**
 * Generates computed statistics from CV data
 */
export function generateComputedStats(data: CVData) {
  const totalExperience = calculateTotalExperience(data.experiences);
  const totalProjects = data.projects.length;
  const totalSkills = data.skills.length;
  const technologies = extractAllTechnologies(data);

  return {
    totalExperienceYears: totalExperience,
    totalProjects,
    totalSkills,
    totalTechnologies: technologies.length,
    currentPositions: data.experiences.filter(exp => {
      const { endDate } = computeOverallExperienceDates(exp);
      return !endDate;
    }).length,
    featuredProjects: data.projects.filter(p => p.featured).length,
    completedProjects: data.projects.filter(p => p.status === 'completed').length,
    expertSkills: data.skills.filter(s => s.level === 'expert' || s.level === 'master').length
  };
}

// ============================================================================
// DATA CHANGE TRACKING AND PROPAGATION
// ============================================================================

/**
 * Creates a data change notification
 */
export function createChangeNotification<T>(
  entityType: string,
  entityId: string,
  changeType: 'create' | 'update' | 'delete' | 'bulk_update',
  oldValue?: T,
  newValue?: T,
  source: 'user' | 'system' | 'import' | 'sync' = 'user'
): DataChangeNotification<T> {
  return {
    entity_type: entityType,
    entity_id: entityId,
    change_type: changeType,
    old_value: oldValue,
    new_value: newValue,
    timestamp: new Date(),
    source,
    propagate_to: ['ui', 'pdf', 'analytics'] // Default consumers
  };
}

/**
 * Determines which computed values need to be recalculated based on a change
 */
export function getAffectedComputedValues(notification: DataChangeNotification): string[] {
  const affected: string[] = [];

  switch (notification.entity_type) {
    case 'experience':
      affected.push('totalExperienceYears', 'currentPositions', 'technologies');
      break;
    case 'project':
      affected.push('totalProjects', 'featuredProjects', 'completedProjects', 'technologies');
      break;
    case 'skill':
      affected.push('totalSkills', 'expertSkills', 'skillCategories');
      break;
    case 'personalInfo':
      affected.push('profileCompleteness');
      break;
  }

  return affected;
}

// ============================================================================
// CONTENT STRATEGY UTILITIES
// ============================================================================

/**
 * Applies content strategy to CV data for targeted presentation
 */
export function applyContentStrategy(data: CVData, strategy: ContentStrategy): CVData {
  const strategicData = { ...data };

  // Apply section visibility rules
  if (strategy.hidden_sections.length > 0) {
    strategy.hidden_sections.forEach(section => {
      if (section in strategicData) {
        delete strategicData[section as keyof CVData];
      }
    });
  }

  // Filter and prioritize experiences
  if (strategy.experience_focus === 'recent') {
    strategicData.experiences = strategicData.experiences
      .sort((a, b) => {
        const aDate = computeOverallExperienceDates(a).startDate;
        const bDate = computeOverallExperienceDates(b).startDate;
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 5); // Show only 5 most recent
  }

  // Filter and prioritize projects
  if (strategy.project_selection === 'impact') {
    strategicData.projects = strategicData.projects
      .filter(p => p.featured)
      .sort((a, b) => (b.highlight_order || 0) - (a.highlight_order || 0));
  }

  // Apply skill emphasis
  if (strategy.skill_emphasis === 'technical') {
    strategicData.skills = strategicData.skills.filter(skill =>
      ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools'].includes(skill.category)
    );
  }

  return strategicData;
}

/**
 * Generates section order based on content strategy
 */
export function generateSectionOrder(strategy: ContentStrategy): string[] {
  const baseOrder = Object.keys(DEFAULT_CV_SECTIONS).sort((a, b) =>
    DEFAULT_CV_SECTIONS[a].display_order - DEFAULT_CV_SECTIONS[b].display_order
  );

  // Reorder based on strategy weights
  return baseOrder.sort((a, b) => {
    const weightA = strategy.section_weights[a] || 0;
    const weightB = strategy.section_weights[b] || 0;
    return weightB - weightA; // Higher weight first
  });
}

// ============================================================================
// DATA EXPORT UTILITIES
// ============================================================================

/**
 * Prepares CV data for export in different formats
 */
export function prepareDataForExport(data: CVData, format: 'json' | 'pdf' | 'html'): any {
  const exportData = { ...data };

  // Remove internal metadata for external formats
  if (format !== 'json') {
    // Remove Angular-specific or internal fields
    delete exportData.metadata;
    delete exportData.analytics;

    // Clean up nested objects
    exportData.experiences = exportData.experiences.map(exp => {
      const cleanExp = { ...exp };
      delete cleanExp.metadata;
      return cleanExp;
    });
  }

  // Format-specific transformations
  switch (format) {
    case 'pdf':
      // Ensure all dates are formatted consistently
      exportData.experiences = exportData.experiences.map(exp => ({
        ...exp,
        startDate: exp.startDate ? exp.startDate : undefined,
        endDate: exp.endDate ? exp.endDate : undefined
      }));
      break;

    case 'html':
      // Convert markdown to HTML if needed
      // Add any HTML-specific formatting
      break;
  }

  return exportData;
}

/**
 * Validates data schema version and suggests migration if needed
 */
export function checkSchemaVersion(data: CVData): { needsMigration: boolean; fromVersion?: string; toVersion: string } {
  const dataVersion = data.data_schema_version || '1.0.0';
  const needsMigration = dataVersion !== CURRENT_SCHEMA_VERSION;

  return {
    needsMigration,
    fromVersion: needsMigration ? dataVersion : undefined,
    toVersion: CURRENT_SCHEMA_VERSION
  };
}

/**
 * Creates a deep clone of CV data for safe mutations
 */
export function cloneCVData(data: CVData): CVData {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Merges partial CV data updates with existing data
 */
export function mergeCVDataUpdates(existing: CVData, updates: Partial<CVData>): CVData {
  const merged = { ...existing, ...updates };
  merged.lastUpdated = new Date();
  merged.updatedAt = new Date();

  return merged;
}
