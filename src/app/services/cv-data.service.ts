import { Injectable, signal, computed, effect } from '@angular/core';
import {
  CVData,
  PersonalInfo,
  Experience,
  Project,
  Skill,
  Education,
  Certification,
  VolunteerWork,
  Publication,
  Speaking,
  Reference,
  CVSectionConfig,
  DEFAULT_CV_SECTIONS,
} from '../models';
import { computeOverallExperienceDates, extractAllTechnologies } from '../models/cv-data.utils';
import { CV_DATA } from '../data/cv-data';

@Injectable({
  providedIn: 'root',
})
export class CvDataService {
  // ============================================================================
  // PRIVATE CORE DATA SIGNALS
  // ============================================================================

  // Core data signals using static CV data
  private readonly _personalInfo = signal<PersonalInfo>(CV_DATA.personalInfo);
  private readonly _experiences = signal<Experience[]>(CV_DATA.experiences);
  private readonly _projects = signal<Project[]>(CV_DATA.projects);
  private readonly _skills = signal<Skill[]>(CV_DATA.skills);
  private readonly _socialLinks = signal(CV_DATA.socialLinks);
  private readonly _stats = signal(CV_DATA.stats);
  private readonly _education = signal<Education[]>([]);
  private readonly _certifications = signal<Certification[]>([]);
  private readonly _volunteerWork = signal<VolunteerWork[]>([]);
  private readonly _publications = signal<Publication[]>([]);
  private readonly _speaking = signal<Speaking[]>([]);
  private readonly _references = signal<Reference[]>([]);

  // Configuration and state signals
  private readonly _sectionConfigs = signal<CVSectionConfig[]>(Object.values(DEFAULT_CV_SECTIONS));

  constructor() {
    // Set up reactive effects for data synchronization and validation
    this.setupReactiveEffects();
  }

  // ============================================================================
  // PUBLIC READONLY SIGNALS (API)
  // ============================================================================

  // Core data access (readonly)
  readonly personalInfo = this._personalInfo.asReadonly();
  readonly experiences = this._experiences.asReadonly();
  readonly projects = this._projects.asReadonly();
  readonly skills = this._skills.asReadonly();
  readonly socialLinks = this._socialLinks.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly education = this._education.asReadonly();
  readonly certifications = this._certifications.asReadonly();
  readonly volunteerWork = this._volunteerWork.asReadonly();
  readonly publications = this._publications.asReadonly();
  readonly speaking = this._speaking.asReadonly();
  readonly references = this._references.asReadonly();

  // Configuration access
  readonly sectionConfigs = this._sectionConfigs.asReadonly();

  // ============================================================================
  // COMPUTED SIGNALS FOR REACTIVE DATA TRANSFORMATIONS
  // ============================================================================

  // Transformed data
  readonly skillsByCategory = computed(() => {
    return CV_DATA.skillCategories;
  });

  readonly allTechnologies = computed(() => {
    const cvData = this.exportCVData();
    return extractAllTechnologies(cvData);
  });

  // Statistics and computed metrics (maintaining backward compatibility)
  readonly totalExperienceYears = computed(() => {
    const experiences = this._experiences();

    if (!experiences || experiences.length === 0) {
      return 0;
    }

    const totalYears = experiences.reduce((total, exp) => {
      const startDate = exp.overallStartDate || exp.startDate;
      const endDate = exp.overallEndDate || exp.endDate || new Date();

      if (!startDate) {
        return total;
      }

      // Calculate years using month-based calculation for better accuracy
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();

      const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
      const years = totalMonths / 12;

      return total + years;
    }, 0);

    // Round to whole numbers for clean display
    return Math.round(totalYears);
  });

  // Total unique companies (by company name)
  readonly totalCompanies = computed(() => {
    const set = new Set<string>();
    for (const exp of this._experiences() || []) {
      if (exp?.company) set.add(exp.company.trim().toLowerCase());
    }
    return set.size;
  });

  // Projects breakdown and totals (portfolio + nested under experiences)
  readonly projectsBreakdown = computed(() => {
    const portfolioNames = new Set<string>();
    const experienceMap = new Map<string, Set<string>>(); // name -> companies

    // Top-level portfolio projects
    for (const p of this._projects() || []) {
      if (p?.name) portfolioNames.add(p.name.trim());
    }

    // Experience nested projects and legacy notable_projects
    for (const exp of this._experiences() || []) {
      const company = exp.company?.trim() || 'Unknown Company';

      const addExpProject = (name: string) => {
        const key = name.trim();
        if (!key) return;
        if (!experienceMap.has(key)) experienceMap.set(key, new Set());
        experienceMap.get(key)!.add(company);
      };

      // Legacy notable projects
      const notable = (exp as any).notable_projects as string[] | undefined;
      if (Array.isArray(notable)) {
        for (const n of notable) addExpProject(n);
      }

      // Modern positions projects
      if (Array.isArray(exp.positions)) {
        for (const pos of exp.positions) {
          if (Array.isArray(pos.projects)) {
            for (const prj of pos.projects) {
              if (prj?.name) addExpProject(prj.name);
            }
          }
        }
      }
    }

    return {
      portfolio: Array.from(portfolioNames).sort(),
      experience: Array.from(experienceMap.entries())
        .map(([name, companies]) => ({
          name,
          companies: Array.from(companies).sort(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    } as const;
  });

  readonly totalProjectsDelivered = computed(() => {
    const names = new Set<string>();
    for (const p of this._projects() || []) if (p?.name) names.add(p.name.trim().toLowerCase());
    const bd = this.projectsBreakdown();
    for (const item of bd.experience) names.add(item.name.trim().toLowerCase());
    return names.size;
  });

  readonly skillsByLevel = computed(() => {
    const skills = this._skills();
    return skills.reduce(
      (acc, skill) => {
        if (!acc[skill.level]) {
          acc[skill.level] = [];
        }
        acc[skill.level].push(skill);
        return acc;
      },
      {} as Record<string, Skill[]>,
    );
  });

  // ============================================================================
  // CONFIGURATION AND STATE MANAGEMENT
  // ============================================================================

  // Section configuration
  updateSectionConfig(sectionKey: string, updates: Partial<CVSectionConfig>): void {
    const current = this._sectionConfigs();
    const updated = current.map((config) =>
      config.section_key === sectionKey ? { ...config, ...updates } : config,
    );
    this._sectionConfigs.set(updated);
  }

  // ============================================================================
  // UTILITY AND HELPER METHODS
  // ============================================================================

  // Export CV data (maintaining backward compatibility)
  exportCVData(): CVData {
    return {
      id: 'cv-data-lubomir-slavigrad',
      personalInfo: this._personalInfo(),
      experiences: this._experiences(),
      projects: this._projects(),
      skills: this._skills(),
      education: this._education(),
      certifications: this._certifications(),
      volunteerWork: this._volunteerWork(),
      publications: this._publications(),
      speaking: this._speaking(),
      references: this._references(),
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Utility methods (maintaining backward compatibility)
  getSkillColor(level: string): string {
    const colorMap = {
      expert: 'skill-expert',
      advanced: 'skill-advanced',
      intermediate: 'skill-intermediate',
      beginner: 'skill-beginner',
    };
    return colorMap[level as keyof typeof colorMap] || 'skill-beginner';
  }

  getExperienceInYears(startDate: Date, endDate?: Date): number {
    const end = endDate || new Date();

    // Calculate years using month-based calculation for better accuracy
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
    const years = totalMonths / 12;

    // Round to 1 decimal place for individual experience calculations
    return Math.round(years * 10) / 10;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private setupReactiveEffects(): void {
    // Effect to compute overall experience dates
    effect(() => {
      const experiences = this._experiences();
      const updatedExperiences = experiences.map((exp) => {
        const computedDates = computeOverallExperienceDates(exp);
        return {
          ...exp,
          overallStartDate: computedDates.startDate,
          overallEndDate: computedDates.endDate,
        };
      });

      // Only update if there are actual changes to avoid infinite loops
      const hasChanges = updatedExperiences.some((exp, index) => {
        const original = experiences[index];
        return (
          exp.overallStartDate?.getTime() !== original.overallStartDate?.getTime() ||
          exp.overallEndDate?.getTime() !== original.overallEndDate?.getTime()
        );
      });

      if (hasChanges) {
        this._experiences.set(updatedExperiences);
      }
    });
  }

  // ============================================================================
  // HELPER METHODS FOR DATA TRANSFORMATION
  // ============================================================================
}
