/**
 * CV Data Utilities and Transformations
 * Provides helper functions for data manipulation, migration, and computed properties
 * Supports the single source of truth architecture with automatic propagation
 */

import { CVData, Experience, Skill, SkillCategory } from './cv-data.interface';

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Computes overall experience dates from positions
 */
export function computeOverallExperienceDates(experience: Experience): {
  startDate: Date;
  endDate: Date | null;
} {
  if (!experience.positions || experience.positions.length === 0) {
    return {
      startDate: experience.startDate || new Date(),
      endDate: experience.endDate || null,
    };
  }

  const positions = experience.positions;
  const startDate = new Date(
    Math.min(...positions.map((p) => new Date(p.startDate || new Date()).getTime())),
  );

  // If any position is current (no end date), overall end date is null
  const hasCurrentPosition = positions.some((p) => !p.endDate);
  const endDate = hasCurrentPosition
    ? null
    : new Date(
        Math.max(...positions.filter((p) => p.endDate).map((p) => new Date(p.endDate!).getTime())),
      );

  return { startDate, endDate };
}

/**
 * Calculates total years of experience
 */
export function calculateTotalExperience(experiences: Experience[]): number {
  let totalMonths = 0;
  const processedPeriods: { start: Date; end: Date }[] = [];

  experiences.forEach((exp) => {
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

  return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal place
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

  skills.forEach((skill) => {
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
      const levelOrder = { master: 5, expert: 4, advanced: 3, intermediate: 2, beginner: 1 };
      const levelDiff = (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
      if (levelDiff !== 0) return levelDiff;
      return (b.years || 0) - (a.years || 0);
    }),
    color: getColorForCategory(category, index),
    display_order: index,
    createdAt: new Date(),
    updatedAt: new Date(),
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
  data.experiences.forEach((exp) => {
    if (exp.technologies) {
      exp.technologies.forEach((tech) => technologies.add(tech));
    }
    if (exp.positions) {
      exp.positions.forEach((pos) => {
        pos.technologies.forEach((tech) => technologies.add(tech));
      });
    }
  });

  // From projects
  data.projects.forEach((project) => {
    project.technologies.forEach((tech) => technologies.add(tech));
  });

  return Array.from(technologies).sort();
}
