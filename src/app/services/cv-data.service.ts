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
  ValidationResult,
  DataQualityScore,
  ContentStrategy,
  DataChangeNotification,
  CVSectionConfig,
  DEFAULT_CV_SECTIONS
} from '../models';
import {
  validateCVData,
  validatePersonalInfo,
  validateExperience,
  calculateCompletenessScore,
  calculateDataQualityScore
} from '../models/cv-data.validators';
import {
  migrateLegacyExperience,
  computeOverallExperienceDates,
  calculateTotalExperience,
  groupSkillsByCategory,
  extractAllTechnologies,
  generateComputedStats,
  applyContentStrategy,
  prepareDataForExport
} from '../models/cv-data.utils';
import { CV_DATA } from '../data/cv-data';
import { generateId } from '../shared/utils/id-generator';

@Injectable({
  providedIn: 'root'
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
  private readonly _contentStrategy = signal<ContentStrategy | null>(null);
  private readonly _searchQuery = signal<string>('');
  private readonly _sectionConfigs = signal<CVSectionConfig[]>(Object.values(DEFAULT_CV_SECTIONS));
  private readonly _dataChangeNotifications = signal<DataChangeNotification[]>([]);

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
  readonly contentStrategy = this._contentStrategy.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly sectionConfigs = this._sectionConfigs.asReadonly();

  // ============================================================================
  // COMPUTED SIGNALS FOR REACTIVE DATA TRANSFORMATIONS
  // ============================================================================

  // Filtered and transformed data
  readonly filteredExperiences = computed(() => {
    const experiences = this._experiences();
    const strategy = this._contentStrategy();

    if (!strategy) return experiences;

    // Apply content strategy filtering
    const strategicData = applyContentStrategy({ experiences } as CVData, strategy);
    return strategicData.experiences;
  });

  readonly filteredProjects = computed(() => {
    const projects = this._projects();
    const strategy = this._contentStrategy();

    if (!strategy) return projects;

    // Apply project filtering based on strategy
    if (strategy.project_selection === 'impact') {
      return projects.filter(p => p.featured).sort((a, b) => (b.highlight_order || 0) - (a.highlight_order || 0));
    }

    return projects;
  });

  readonly skillsByCategory = computed(() => {
    return CV_DATA.skillCategories;
  });

  readonly allTechnologies = computed(() => {
    const cvData = this.exportCVData();
    return extractAllTechnologies(cvData);
  });

  // Data validation and quality metrics
  readonly validationResult = computed(() => {
    const cvData = this.exportCVData();
    return validateCVData(cvData);
  });

  readonly qualityMetrics = computed(() => {
    const cvData = this.exportCVData();
    return calculateDataQualityScore(cvData);
  });

  readonly completenessScore = computed(() => {
    const cvData = this.exportCVData();
    return calculateCompletenessScore(cvData);
  });

  // Search functionality
  readonly searchResults = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    if (!query) return null;

    const allData = this.exportCVData();
    const results = {
      experiences: allData.experiences.filter(exp =>
        exp.company.toLowerCase().includes(query) ||
        exp.industry?.some(i => i.toLowerCase().includes(query)) ||
        exp.positions?.some(pos =>
          pos.title.toLowerCase().includes(query) ||
          pos.description?.toLowerCase().includes(query) ||
          pos.technologies?.some(tech => tech.toLowerCase().includes(query))
        )
      ),
      projects: allData.projects.filter(proj =>
        proj.name.toLowerCase().includes(query) ||
        proj.description?.toLowerCase().includes(query) ||
        proj.technologies?.some(tech => tech.toLowerCase().includes(query))
      ),
      skills: allData.skills.filter(skill =>
        skill.name.toLowerCase().includes(query) ||
        skill.category?.toLowerCase().includes(query)
      )
    };

    return results;
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
      experience: Array.from(experienceMap.entries()).map(([name, companies]) => ({
        name,
        companies: Array.from(companies).sort()
      })).sort((a, b) => a.name.localeCompare(b.name))
    } as const;
  });

  readonly totalProjectsDelivered = computed(() => {
    const names = new Set<string>();
    for (const p of this._projects() || []) if (p?.name) names.add(p.name.trim().toLowerCase());
    const bd = this.projectsBreakdown();
    for (const item of bd.experience) names.add(item.name.trim().toLowerCase());
    return names.size;
  });


  readonly computedStatistics = computed(() => {
    const cvData = this.exportCVData();
    return generateComputedStats(cvData);
  });

  readonly skillsByLevel = computed(() => {
    const skills = this._skills();
    return skills.reduce((acc, skill) => {
      if (!acc[skill.level]) {
        acc[skill.level] = [];
      }
      acc[skill.level].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  });

  // Export data preparation
  readonly exportData = computed(() => {
    const cvData = this.exportCVData();
    const strategy = this._contentStrategy();

    // Apply content strategy before export if available
    if (strategy) {
      const strategicData = applyContentStrategy(cvData, strategy);
      return prepareDataForExport(strategicData, 'pdf');
    }

    return prepareDataForExport(cvData, 'pdf');
  });

  // ============================================================================
  // CRUD OPERATIONS AND DATA MANAGEMENT
  // ============================================================================

  // Personal Info operations
  updatePersonalInfo(updates: Partial<PersonalInfo>): void {
    const current = this._personalInfo();
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date()
    };

    this._personalInfo.set(updated);
    this.notifyDataChange('update', 'personalInfo', current, updated);
  }

  // Experience operations
  addExperience(experience: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newExperience: Experience = {
      ...experience,
      id: generateId('exp'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this._experiences();
    this._experiences.set([...current, newExperience]);
    this.notifyDataChange('create', 'experience', null, newExperience);
  }

  updateExperience(id: string, updates: Partial<Experience>): void {
    const current = this._experiences();
    const index = current.findIndex(exp => exp.id === id);

    if (index === -1) return;

    const oldExperience = current[index];
    const updatedExperience = {
      ...oldExperience,
      ...updates,
      updatedAt: new Date()
    };

    const newExperiences = [...current];
    newExperiences[index] = updatedExperience;

    this._experiences.set(newExperiences);
    this.notifyDataChange('update', 'experience', oldExperience, updatedExperience);
  }

  deleteExperience(id: string): void {
    const current = this._experiences();
    const experience = current.find(exp => exp.id === id);

    if (!experience) return;

    const filtered = current.filter(exp => exp.id !== id);
    this._experiences.set(filtered);
    this.notifyDataChange('delete', 'experience', experience, null);
  }

  // Project operations
  addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newProject: Project = {
      ...project,
      id: generateId('proj'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this._projects();
    this._projects.set([...current, newProject]);
    this.notifyDataChange('create', 'project', null, newProject);
  }

  updateProject(id: string, updates: Partial<Project>): void {
    const current = this._projects();
    const index = current.findIndex(proj => proj.id === id);

    if (index === -1) return;

    const oldProject = current[index];
    const updatedProject = {
      ...oldProject,
      ...updates,
      updatedAt: new Date()
    };

    const newProjects = [...current];
    newProjects[index] = updatedProject;

    this._projects.set(newProjects);
    this.notifyDataChange('update', 'project', oldProject, updatedProject);
  }

  deleteProject(id: string): void {
    const current = this._projects();
    const project = current.find(proj => proj.id === id);

    if (!project) return;

    const filtered = current.filter(proj => proj.id !== id);
    this._projects.set(filtered);
    this.notifyDataChange('delete', 'project', project, null);
  }

  // Skill operations
  addSkill(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newSkill: Skill = {
      ...skill,
      id: generateId('skill'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this._skills();
    this._skills.set([...current, newSkill]);
    this.notifyDataChange('create', 'skill', null, newSkill);
  }

  updateSkill(id: string, updates: Partial<Skill>): void {
    const current = this._skills();
    const index = current.findIndex(skill => skill.id === id);

    if (index === -1) return;

    const oldSkill = current[index];
    const updatedSkill = {
      ...oldSkill,
      ...updates,
      updatedAt: new Date()
    };

    const newSkills = [...current];
    newSkills[index] = updatedSkill;

    this._skills.set(newSkills);
    this.notifyDataChange('update', 'skill', oldSkill, updatedSkill);
  }

  deleteSkill(id: string): void {
    const current = this._skills();
    const skill = current.find(s => s.id === id);

    if (!skill) return;

    const filtered = current.filter(s => s.id !== id);
    this._skills.set(filtered);
    this.notifyDataChange('delete', 'skill', skill, null);
  }

  // ============================================================================
  // CONFIGURATION AND STATE MANAGEMENT
  // ============================================================================

  // Content strategy operations
  setContentStrategy(strategy: ContentStrategy | null): void {
    this._contentStrategy.set(strategy);
    this.notifyDataChange('update', 'contentStrategy', null, strategy);
  }

  // Search operations
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  clearSearch(): void {
    this._searchQuery.set('');
  }

  // Section configuration
  updateSectionConfig(sectionKey: string, updates: Partial<CVSectionConfig>): void {
    const current = this._sectionConfigs();
    const updated = current.map(config =>
      config.section_key === sectionKey
        ? { ...config, ...updates }
        : config
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
      updatedAt: new Date()
    };
  }

  // Import CV data with validation
  importCVData(data: CVData): void {
    // Validate data before importing
    const validation = validateCVData(data);
    if (!validation.isValid) {
      console.warn('CV data validation failed:', validation.errors);
    }

    // Import data with migration if needed
    this._personalInfo.set(data.personalInfo);
    this._experiences.set(data.experiences.map(exp => migrateLegacyExperience(exp)));
    this._projects.set(data.projects);
    this._skills.set(data.skills);

    // Import additional sections if present
    if (data.education) this._education.set(data.education);
    if (data.certifications) this._certifications.set(data.certifications);
    if (data.volunteerWork) this._volunteerWork.set(data.volunteerWork);
    if (data.publications) this._publications.set(data.publications);
    if (data.speaking) this._speaking.set(data.speaking);
    if (data.references) this._references.set(data.references);

    this.notifyDataChange('bulk_update', 'cvData', null, data);
  }

  // Utility methods (maintaining backward compatibility)
  getSkillColor(level: string): string {
    const colorMap = {
      'expert': 'skill-expert',
      'advanced': 'skill-advanced',
      'intermediate': 'skill-intermediate',
      'beginner': 'skill-beginner'
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

  private notifyDataChange(
    action: 'create' | 'update' | 'delete' | 'bulk_update',
    entityType: string,
    oldValue: any,
    newValue: any
  ): void {
    const notification: DataChangeNotification = {
      entity_type: entityType,
      entity_id: newValue?.id || oldValue?.id || generateId('entity'),
      change_type: action,
      old_value: oldValue,
      new_value: newValue,
      timestamp: new Date(),
      source: 'user'
    };

    const current = this._dataChangeNotifications();
    this._dataChangeNotifications.set([notification, ...current.slice(0, 99)]); // Keep last 100 notifications
  }

  private setupReactiveEffects(): void {
    // Effect to validate data changes
    effect(() => {
      const cvData = this.exportCVData();
      const validation = validateCVData(cvData);

      if (!validation.isValid) {
        console.warn('CV data validation issues detected:', validation.errors);
      }
    });

    // Effect to compute overall experience dates
    effect(() => {
      const experiences = this._experiences();
      const updatedExperiences = experiences.map(exp => {
        const computedDates = computeOverallExperienceDates(exp);
        return {
          ...exp,
          overallStartDate: computedDates.startDate,
          overallEndDate: computedDates.endDate
        };
      });

      // Only update if there are actual changes to avoid infinite loops
      const hasChanges = updatedExperiences.some((exp, index) => {
        const original = experiences[index];
        return exp.overallStartDate?.getTime() !== original.overallStartDate?.getTime() ||
               exp.overallEndDate?.getTime() !== original.overallEndDate?.getTime();
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
