import { Injectable, signal, computed } from '@angular/core';
import {
  CVData,
  Experience,
  Project,
  Skill,
  SkillCategory,
  PersonalInfo,
  ContentStrategy
} from '../models/cv-data.interface';
import {
  PDFTemplate,
  PDFSectionConfig
} from './pdf-template.service';
import {
  migrateLegacyExperience,
  computeOverallExperienceDates,
  calculateTotalExperience,
  groupSkillsByCategory,
  extractAllTechnologies,
  applyContentStrategy
} from '../models/cv-data.utils';

// ============================================================================
// PDF DATA PROCESSING INTERFACES
// ============================================================================

/**
 * PDF Processing Options for content optimization
 */
export interface PDFProcessingOptions {
  // Target audience optimization
  targetAudience: 'recruiter' | 'technical' | 'executive' | 'creative';

  // Content density and length constraints
  maxPages: number;
  contentDensity: 'compact' | 'normal' | 'spacious';

  // Section inclusion preferences
  includeSections: {
    personalInfo: boolean;
    experience: boolean;
    projects: boolean;
    skills: boolean;
    education: boolean;
    certifications: boolean;
    volunteerWork: boolean;
    publications: boolean;
    speaking: boolean;
  };

  // Content prioritization
  experienceLimit?: number;
  projectLimit?: number;
  skillsDisplayMode: 'compact' | 'detailed' | 'categorized';

  // Template-specific optimizations
  templateId: string;
  preserveOriginalOrder: boolean;
}

/**
 * Processed PDF Data optimized for template rendering
 */
export interface ProcessedPDFData {
  // Core processed sections
  personalInfo: ProcessedPersonalInfo;
  experiences: ProcessedExperience[];
  projects: ProcessedProject[];
  skills: ProcessedSkillData;

  // Optional sections
  education?: any[];
  certifications?: any[];
  volunteerWork?: any[];
  publications?: any[];
  speaking?: any[];

  // Processing metadata
  processingMetadata: {
    originalDataSize: number;
    processedDataSize: number;
    compressionRatio: number;
    processingTime: number;
    optimizationsApplied: string[];
    contentStrategy: ContentStrategy;
  };

  // Template-specific data
  templateOptimizations: {
    sectionPriorities: Record<string, number>;
    contentFitAnalysis: ContentFitAnalysis;
    layoutRecommendations: LayoutRecommendation[];
  };
}

/**
 * Processed Personal Information optimized for PDF
 */
export interface ProcessedPersonalInfo extends PersonalInfo {
  // Optimized fields for PDF display
  displayName: string;
  displayTitle: string;
  displaySummary: string;
  primaryContact: {
    email: string;
    phone: string;
    location: string;
  };
  professionalLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  keyTechnologies: string[]; // Top 5-7 technologies for header
}

/**
 * Processed Experience optimized for PDF layout
 */
export interface ProcessedExperience extends Experience {
  // Optimized display fields
  displayTitle: string;
  displayCompany: string;
  displayDuration: string;
  displayLocation: string;

  // Prioritized content
  keyAchievements: string[]; // Top 3-4 achievements
  primaryTechnologies: string[]; // Most relevant technologies
  impactMetrics: string[]; // Quantified results

  // Layout optimization
  estimatedHeight: number; // Estimated PDF height in points
  priority: number; // Rank order priority (1-10)
  priorityScore: number; // Absolute priority score (0-100)
  elevation: number; // Glass elevation level (1-4)
  contentDensity: 'high' | 'medium' | 'low';
}

/**
 * Processed Project optimized for PDF presentation
 */
export interface ProcessedProject extends Project {
  // Optimized display
  displayTitle: string;
  displayDescription: string;
  keyTechnologies: string[]; // Top technologies
  primaryMetrics: Record<string, string>; // Most important metrics

  // Layout optimization
  estimatedHeight: number;
  priority: number; // Rank order priority (1-10)
  priorityScore: number; // Absolute priority score (0-100)
  elevation: number; // Glass elevation level (1-4)
  visualElements: {
    hasLinks: boolean;
    hasMetrics: boolean;
    hasImage: boolean;
  };
}

/**
 * Processed Skills Data with multiple display modes
 */
export interface ProcessedSkillData {
  // Different display modes
  compact: CompactSkillDisplay;
  detailed: DetailedSkillDisplay;
  categorized: CategorizedSkillDisplay;

  // Skill analytics
  topSkills: Skill[]; // Top 10-15 skills
  trendingSkills: Skill[]; // Currently trending
  coreCompetencies: string[]; // Primary skill areas

  // Layout optimization
  recommendedDisplayMode: 'compact' | 'detailed' | 'categorized';
  estimatedHeight: Record<string, number>; // Height for each mode
}

export interface CompactSkillDisplay {
  skillList: string[]; // Comma-separated skill names
  groupedByLevel: Record<string, string[]>;
  estimatedLines: number;
}

export interface DetailedSkillDisplay {
  skillsWithLevels: Array<{
    name: string;
    level: string;
    years?: number;
    highlight: boolean;
  }>;
  estimatedHeight: number;
}

export interface CategorizedSkillDisplay {
  categories: Array<{
    name: string;
    skills: string[];
    color: string;
    priority: number;
  }>;
  estimatedHeight: number;
}

/**
 * Content Fit Analysis for template optimization
 */
export interface ContentFitAnalysis {
  totalEstimatedHeight: number;
  availableHeight: number;
  fitRatio: number; // 0-1, where 1 = perfect fit
  overflowSections: string[];
  recommendations: string[];
}

/**
 * Layout Recommendations for optimal presentation
 */
export interface LayoutRecommendation {
  type: 'content_reduction' | 'layout_adjustment' | 'section_reorder' | 'density_change';
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementation: string;
}

// ============================================================================
// PDF DATA PROCESSOR SERVICE
// ============================================================================

/**
 * Enhanced PDF Data Processing Pipeline
 * Optimizes CV data for PDF presentation with intelligent content prioritization
 */
@Injectable({
  providedIn: 'root'
})
export class PDFDataProcessorService {

  // Processing performance tracking
  private readonly _processingMetrics = signal<{
    lastProcessingTime: number;
    averageProcessingTime: number;
    totalProcessingCalls: number;
  }>({
    lastProcessingTime: 0,
    averageProcessingTime: 0,
    totalProcessingCalls: 0
  });

  readonly processingMetrics = this._processingMetrics.asReadonly();

  /**
   * Main processing method - optimizes CV data for PDF template
   */
  async processForTemplate(
    cvData: CVData,
    template: PDFTemplate,
    options: PDFProcessingOptions
  ): Promise<ProcessedPDFData> {
    const startTime = performance.now();

    try {
      // 1. Data validation and sanitization
      const sanitizedData = this.sanitizeData(cvData);

      // 2. Apply content strategy based on target audience
      const strategicData = this.applyAudienceStrategy(sanitizedData, options);

      // 3. Process each section with template-specific optimizations
      console.log('Strategic data:', strategicData);
      const processedPersonalInfo = this.processPersonalInfo(strategicData.personalInfo, options);
      const processedExperiences = this.processExperiences(strategicData.experiences, template, options);
      const processedProjects = this.processProjects(strategicData.projects, template, options);
      const processedSkills = this.processSkills(strategicData.skills, strategicData.skillCategories, options);
      console.log('Processed data:', { processedPersonalInfo, processedExperiences, processedProjects, processedSkills });

      // 4. Analyze content fit and generate recommendations
      const contentFitAnalysis = this.analyzeContentFit(
        { processedPersonalInfo, processedExperiences, processedProjects, processedSkills },
        template
      );

      // 5. Generate layout recommendations
      const layoutRecommendations = this.generateLayoutRecommendations(contentFitAnalysis, template, options);

      // 6. Calculate processing metadata
      const processingTime = performance.now() - startTime;
      const processingMetadata = this.generateProcessingMetadata(
        cvData,
        { processedPersonalInfo, processedExperiences, processedProjects, processedSkills },
        processingTime,
        options
      );

      // Update performance metrics
      this.updateProcessingMetrics(processingTime);

      return {
        personalInfo: processedPersonalInfo,
        experiences: processedExperiences,
        projects: processedProjects,
        skills: processedSkills,
        education: strategicData.education || [],
        certifications: strategicData.certifications || [],
        volunteerWork: strategicData.volunteerWork || [],
        publications: strategicData.publications || [],
        speaking: strategicData.speaking || [],
        processingMetadata,
        templateOptimizations: {
          sectionPriorities: this.calculateSectionPriorities(template, options),
          contentFitAnalysis,
          layoutRecommendations
        }
      };

    } catch (error) {
      console.error('PDF data processing failed:', error);
      throw new Error(`PDF data processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sanitize and validate CV data for PDF processing
   */
  private sanitizeData(cvData: CVData): CVData {
    return {
      ...cvData,
      experiences: cvData.experiences.map(exp => migrateLegacyExperience(exp)),
      // Ensure all required fields are present
      personalInfo: {
        ...cvData.personalInfo,
        name: cvData.personalInfo.name || 'Professional',
        title: cvData.personalInfo.title || 'Professional',
        email: cvData.personalInfo.email || '',
        phone: cvData.personalInfo.phone || '',
        location: cvData.personalInfo.location || ''
      }
    };
  }

  /**
   * Apply audience-specific content strategy
   */
  private applyAudienceStrategy(cvData: CVData, options: PDFProcessingOptions): CVData {
    const strategy: ContentStrategy = this.createAudienceStrategy(options.targetAudience);
    return applyContentStrategy(cvData, strategy);
  }

  /**
   * Create content strategy based on target audience
   */
  private createAudienceStrategy(audience: string): ContentStrategy {
    const baseStrategy: ContentStrategy = {
      strategy_name: `PDF ${audience} Strategy`,
      target_audience: audience === 'recruiter' ? 'general' : audience as any,
      section_weights: {
        personalInfo: 1.0,
        experience: 0.9,
        skills: 0.8,
        projects: 0.7,
        education: 0.6,
        certifications: 0.5
      },
      highlighted_sections: ['personalInfo', 'experience'],
      hidden_sections: [],
      skill_emphasis: 'technical',
      experience_focus: 'recent',
      project_selection: 'impact',
      key_value_propositions: ['Technical Excellence', 'Problem Solving', 'Innovation'],
      differentiators: ['Full-Stack Expertise', 'Enterprise Experience'],
      content_rules: []
    };

    // Audience-specific customizations
    switch (audience) {
      case 'recruiter':
        return {
          ...baseStrategy,
          target_audience: 'general',
          experience_focus: 'recent',
          project_selection: 'impact',
          skill_emphasis: 'business',
          hidden_sections: ['publications', 'speaking'],
          section_weights: {
            ...baseStrategy.section_weights,
            experience: 1.0,
            skills: 0.9
          }
        };

      case 'technical':
        return {
          ...baseStrategy,
          target_audience: 'technical',
          experience_focus: 'relevant',
          project_selection: 'technical',
          skill_emphasis: 'technical',
          highlighted_sections: ['skills', 'experience', 'projects'],
          section_weights: {
            ...baseStrategy.section_weights,
            skills: 1.0,
            projects: 0.9
          }
        };

      case 'executive':
        return {
          ...baseStrategy,
          target_audience: 'executive',
          experience_focus: 'progressive',
          project_selection: 'impact',
          skill_emphasis: 'business',
          hidden_sections: ['certifications'],
          key_value_propositions: ['Strategic Leadership', 'Business Impact', 'Technical Vision']
        };

      default:
        return baseStrategy;
    }
  }

  /**
   * Process personal information for PDF display
   */
  private processPersonalInfo(personalInfo: PersonalInfo, options: PDFProcessingOptions): ProcessedPersonalInfo {
    console.log('Processing personal info:', personalInfo);
    // Extract key technologies from bio or summary
    const keyTechnologies = this.extractKeyTechnologies(personalInfo, options.targetAudience);

    return {
      ...personalInfo,
      displayName: personalInfo.name,
      displayTitle: personalInfo.title,
      displaySummary: this.optimizeSummary(personalInfo.summary || personalInfo.bio || '', options),
      primaryContact: {
        email: personalInfo.email,
        phone: personalInfo.phone,
        location: personalInfo.location
      },
      professionalLinks: {
        linkedin: personalInfo.linkedin,
        github: personalInfo.github,
        portfolio: personalInfo.portfolio || personalInfo.website
      },
      keyTechnologies
    };
  }

  /**
   * Extract key technologies for header display
   */
  private extractKeyTechnologies(personalInfo: PersonalInfo, audience: string): string[] {
    const technologies = personalInfo.technologies || [];

    // Audience-specific technology prioritization
    const priorityMap: Record<string, string[]> = {
      recruiter: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Docker'],
      technical: ['Java', 'Kotlin', 'Spring Boot', 'Kafka', 'Kubernetes'],
      executive: ['Java', 'Spring Boot', 'AWS', 'Microservices', 'Leadership']
    };

    const priorities = priorityMap[audience] || priorityMap['recruiter'];

    // Sort technologies by priority and limit to top 7
    return technologies
      .sort((a, b) => {
        const aIndex = priorities.indexOf(a);
        const bIndex = priorities.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
      .slice(0, 7);
  }

  /**
   * Optimize summary text for PDF display
   */
  private optimizeSummary(summary: string, options: PDFProcessingOptions): string {
    if (!summary) return '';

    const maxLength = options.contentDensity === 'compact' ? 150 :
                     options.contentDensity === 'normal' ? 200 : 250;

    if (summary.length <= maxLength) return summary;

    // Intelligent truncation at sentence boundaries
    const sentences = summary.split('. ');
    let result = '';

    for (const sentence of sentences) {
      if ((result + sentence + '. ').length <= maxLength) {
        result += sentence + '. ';
      } else {
        break;
      }
    }

    return result.trim() || summary.substring(0, maxLength - 3) + '...';
  }

  /**
   * Process experiences with intelligent prioritization and optimization
   */
  private processExperiences(
    experiences: Experience[],
    template: PDFTemplate,
    options: PDFProcessingOptions
  ): ProcessedExperience[] {
    // Sort experiences by relevance and recency
    const sortedExperiences = this.sortExperiencesByPriority(experiences, options.targetAudience);

    // Apply experience limit if specified
    const limitedExperiences = options.experienceLimit
      ? sortedExperiences.slice(0, options.experienceLimit)
      : sortedExperiences;

    return limitedExperiences.map((exp, index) => this.processExperience(exp, index, options));
  }

  /**
   * Sort experiences by priority based on audience and relevance
   */
  private sortExperiencesByPriority(experiences: Experience[], audience: string): Experience[] {
    return experiences.sort((a, b) => {
      // Calculate priority score for each experience
      const scoreA = this.calculateExperiencePriority(a, audience);
      const scoreB = this.calculateExperiencePriority(b, audience);

      return scoreB - scoreA; // Higher score first
    });
  }

  /**
   * Calculate priority score for experience based on audience
   */
  private calculateExperiencePriority(experience: Experience, audience: string): number {
    let score = 0;

    // Recency score (0-30 points)
    const dates = computeOverallExperienceDates(experience);
    const endDate = dates.endDate || new Date();
    const monthsAgo = (Date.now() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    score += Math.max(0, 30 - monthsAgo);

    // Duration score (0-20 points)
    const durationMonths = (endDate.getTime() - dates.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    score += Math.min(20, durationMonths / 6); // 6 months = 1 point

    // Company size score (0-15 points)
    const companySizeScore = {
      'enterprise': 15,
      'large': 12,
      'medium': 8,
      'small': 5,
      'startup': 3
    };
    score += companySizeScore[experience.company_size || 'medium'] || 8;

    // Technology relevance score (0-25 points)
    const techScore = this.calculateTechnologyRelevance(experience, audience);
    score += techScore;

    // Achievement score (0-10 points)
    const achievementCount = (experience.achievements || []).length;
    score += Math.min(10, achievementCount * 2);

    return score;

  }

  /**
   * Map absolute priority score (0-100+) to glass elevation level (1-4)
   */
  private mapPriorityScoreToElevation(score: number): number {
    const s = Math.max(0, score);
    if (s >= 90) return 4;
    if (s >= 70) return 3;
    if (s >= 50) return 2;
    return 1;
  }


  /**
   * Calculate technology relevance score for experience
   */
  private calculateTechnologyRelevance(experience: Experience, audience: string): number {
    const technologies = experience.technologies || [];

    const relevantTechs: Record<string, string[]> = {
      recruiter: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Docker', 'Kubernetes'],
      technical: ['Java', 'Kotlin', 'Spring Boot', 'Kafka', 'Microservices', 'Kubernetes', 'Angular'],
      executive: ['Java', 'Spring Boot', 'AWS', 'Microservices', 'Leadership', 'Architecture']
    };

    const relevant = relevantTechs[audience] || relevantTechs['recruiter'];
    const matches = technologies.filter(tech =>
      relevant.some(rel => tech.toLowerCase().includes(rel.toLowerCase()))
    );

    return Math.min(25, matches.length * 3);
  }

  /**
   * Process individual experience for PDF display
   */
  private processExperience(experience: Experience, index: number, options: PDFProcessingOptions): ProcessedExperience {
    const dates = computeOverallExperienceDates(experience);
    const priorityScore = this.calculateExperiencePriority(experience, options.targetAudience);
    const elevation = this.mapPriorityScoreToElevation(priorityScore);
    const priority = 10 - index; // Rank for ordering

    // Extract key achievements (top 3-4)
    const achievements = experience.achievements || [];
    const keyAchievements = this.prioritizeAchievements(achievements, options.targetAudience)
      .slice(0, options.contentDensity === 'compact' ? 3 : 4);

    // Extract primary technologies (most relevant)
    const primaryTechnologies = this.extractPrimaryTechnologies(
      experience.technologies || [],
      options.targetAudience
    );

    // Extract impact metrics
    const impactMetrics = this.extractImpactMetrics(experience, options.targetAudience);

    // Estimate content height
    const estimatedHeight = this.estimateExperienceHeight(experience, options);

    return {
      ...experience,
      displayTitle: experience.position || experience.title || 'Professional',
      displayCompany: experience.company,
      displayDuration: this.formatDuration(dates.startDate, dates.endDate || new Date()),
      displayLocation: experience.location,
      keyAchievements,
      primaryTechnologies,
      impactMetrics,
      estimatedHeight,
      priority,
      priorityScore,
      elevation,
      contentDensity: this.determineContentDensity(experience, options)
    };
  }

  /**
   * Prioritize achievements based on audience
   */
  private prioritizeAchievements(achievements: string[], audience: string): string[] {
    // Keywords that indicate high-impact achievements for different audiences
    const priorityKeywords: Record<string, string[]> = {
      recruiter: ['increased', 'improved', 'reduced', 'delivered', 'achieved', 'led'],
      technical: ['implemented', 'developed', 'optimized', 'architected', 'designed', 'built'],
      executive: ['led', 'managed', 'delivered', 'increased', 'strategic', 'business']
    };

    const keywords = priorityKeywords[audience] || priorityKeywords['recruiter'];

    return achievements.sort((a, b) => {
      const scoreA = keywords.reduce((score, keyword) =>
        score + (a.toLowerCase().includes(keyword) ? 1 : 0), 0);
      const scoreB = keywords.reduce((score, keyword) =>
        score + (b.toLowerCase().includes(keyword) ? 1 : 0), 0);

      return scoreB - scoreA;
    });
  }

  /**
   * Extract primary technologies for experience
   */
  private extractPrimaryTechnologies(technologies: string[], audience: string): string[] {
    const priorityTechs: Record<string, string[]> = {
      recruiter: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Docker'],
      technical: ['Java', 'Kotlin', 'Spring Boot', 'Kafka', 'Kubernetes', 'Angular'],
      executive: ['Java', 'Spring Boot', 'AWS', 'Microservices']
    };

    const priorities = priorityTechs[audience] || priorityTechs['recruiter'];

    return technologies
      .filter(tech => priorities.some(p => tech.toLowerCase().includes(p.toLowerCase())))
      .slice(0, 6);
  }

  /**
   * Extract impact metrics from experience
   */
  private extractImpactMetrics(experience: Experience, audience: string): string[] {
    const achievements = experience.achievements || [];
    const metrics: string[] = [];

    // Extract quantified results using regex patterns
    const patterns = [
      /(\d+)%\s*(increase|improvement|reduction|faster)/gi,
      /(\d+)x\s*(faster|improvement|increase)/gi,
      /\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|k|thousand)?/gi,
      /(\d+)\s*(?:million|thousand|k)\s*(?:users|customers|requests)/gi
    ];

    achievements.forEach(achievement => {
      patterns.forEach(pattern => {
        const matches = achievement.match(pattern);
        if (matches) {
          metrics.push(...matches.slice(0, 2)); // Limit to 2 metrics per achievement
        }
      });
    });

    return metrics.slice(0, 3); // Top 3 metrics
  }

  /**
   * Estimate height required for experience in PDF
   */
  private estimateExperienceHeight(experience: Experience, options: PDFProcessingOptions): number {
    const baseHeight = 20; // Base height for title and company
    const achievementHeight = (experience.achievements || []).length * 4;
    const technologyHeight = Math.ceil((experience.technologies || []).length / 6) * 4;

    const densityMultiplier = {
      compact: 0.8,
      normal: 1.0,
      spacious: 1.2
    };

    return (baseHeight + achievementHeight + technologyHeight) * densityMultiplier[options.contentDensity];
  }

  /**
   * Determine content density for experience
   */
  private determineContentDensity(experience: Experience, options: PDFProcessingOptions): 'high' | 'medium' | 'low' {
    const contentItems = [
      ...(experience.achievements || []),
      ...(experience.technologies || [])
    ].length;

    if (contentItems > 15) return 'high';
    if (contentItems > 8) return 'medium';
    return 'low';
  }

  /**
   * Format duration for display
   */
  private formatDuration(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const end = endDate > new Date() ? 'Present' :
                endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return `${start} - ${end}`;
  }

  /**
   * Process projects with prioritization and optimization
   */
  private processProjects(
    projects: Project[],
    template: PDFTemplate,
    options: PDFProcessingOptions
  ): ProcessedProject[] {
    // Sort projects by priority
    const sortedProjects = this.sortProjectsByPriority(projects, options.targetAudience);

    // Apply project limit if specified
    const limitedProjects = options.projectLimit
      ? sortedProjects.slice(0, options.projectLimit)
      : sortedProjects;

    return limitedProjects.map((project, index) => this.processProject(project, index, options));
  }

  /**
   * Sort projects by priority based on audience
   */
  private sortProjectsByPriority(projects: Project[], audience: string): Project[] {
    return projects.sort((a, b) => {
      const scoreA = this.calculateProjectPriority(a, audience);
      const scoreB = this.calculateProjectPriority(b, audience);

      return scoreB - scoreA;
    });
  }

  /**
   * Calculate priority score for project
   */
  private calculateProjectPriority(project: Project, audience: string): number {
    let score = 0;

    // Featured project bonus
    if (project.featured) score += 20;

    // Technology relevance
    const techScore = this.calculateTechnologyRelevance({ technologies: project.technologies } as Experience, audience);
    score += techScore;

    // Metrics availability
    const metricsCount = Object.keys(project.metrics || {}).length;
    score += Math.min(15, metricsCount * 3);

    // Links availability (shows completeness)
    const linksCount = Object.keys(project.links || {}).length;
    score += Math.min(10, linksCount * 2);

    return score;
  }

  /**
   * Process individual project for PDF display
   */
  private processProject(project: Project, index: number, options: PDFProcessingOptions): ProcessedProject {
    const priorityScore = this.calculateProjectPriority(project, options.targetAudience);
    const elevation = this.mapPriorityScoreToElevation(priorityScore);
    const priority = 10 - index;

    // Optimize description length
    const displayDescription = this.optimizeProjectDescription(project.description, options);

    // Extract key technologies
    const keyTechnologies = this.extractPrimaryTechnologies(project.technologies, options.targetAudience);

    // Extract primary metrics
    const projectMetrics = project.metrics || {};
    const metricsRecord: Record<string, string> = {};

    if (Array.isArray(projectMetrics)) {
      // Convert array format to record format
      projectMetrics.forEach((metric, index) => {
        if (typeof metric === 'object' && metric.metric && metric.value) {
          metricsRecord[metric.metric] = metric.value;
        }
      });
    } else if (typeof projectMetrics === 'object') {
      // Already in record format
      Object.assign(metricsRecord, projectMetrics);
    }

    const primaryMetrics = this.extractPrimaryProjectMetrics(metricsRecord, options.targetAudience);

    // Estimate height
    const estimatedHeight = this.estimateProjectHeight(project, options);

    return {
      ...project,
      displayTitle: project.title || 'Project',
      displayDescription,
      keyTechnologies,
      primaryMetrics,
      estimatedHeight,
      priority,
      priorityScore,
      elevation,
      visualElements: {
        hasLinks: Object.keys(project.links || {}).length > 0,
        hasMetrics: Object.keys(project.metrics || {}).length > 0,
        hasImage: !!project.image
      }
    };
  }

  /**
   * Optimize project description for PDF
   */
  private optimizeProjectDescription(description: string, options: PDFProcessingOptions): string {
    const maxLength = options.contentDensity === 'compact' ? 120 :
                     options.contentDensity === 'normal' ? 160 : 200;

    if (description.length <= maxLength) return description;

    // Intelligent truncation
    const sentences = description.split('. ');
    let result = '';

    for (const sentence of sentences) {
      if ((result + sentence + '. ').length <= maxLength) {
        result += sentence + '. ';
      } else {
        break;
      }
    }

    return result.trim() || description.substring(0, maxLength - 3) + '...';
  }

  /**
   * Extract primary metrics from project
   */
  private extractPrimaryProjectMetrics(metrics: Record<string, string>, audience: string): Record<string, string> {
    const priorityMetrics: Record<string, string[]> = {
      recruiter: ['users', 'performance', 'impact', 'adoption'],
      technical: ['performance', 'scalability', 'efficiency', 'coverage'],
      executive: ['impact', 'users', 'revenue', 'adoption']
    };

    const priorities = priorityMetrics[audience] || priorityMetrics['recruiter'];
    const result: Record<string, string> = {};

    // Add metrics in priority order
    priorities.forEach(priority => {
      const matchingKey = Object.keys(metrics).find(key =>
        key.toLowerCase().includes(priority.toLowerCase())
      );
      if (matchingKey && Object.keys(result).length < 3) {
        result[matchingKey] = metrics[matchingKey];
      }
    });

    // Fill remaining slots with other metrics
    Object.entries(metrics).forEach(([key, value]) => {
      if (!result[key] && Object.keys(result).length < 3) {
        result[key] = value;
      }
    });

    return result;
  }

  /**
   * Estimate height required for project in PDF
   */
  private estimateProjectHeight(project: Project, options: PDFProcessingOptions): number {
    const baseHeight = 15; // Title
    const descriptionHeight = Math.ceil(project.description.length / 80) * 4;
    const technologiesHeight = Math.ceil(project.technologies.length / 8) * 4;
    const metricsHeight = Object.keys(project.metrics || {}).length * 3;

    const densityMultiplier = {
      compact: 0.8,
      normal: 1.0,
      spacious: 1.2
    };

    return (baseHeight + descriptionHeight + technologiesHeight + metricsHeight) *
           densityMultiplier[options.contentDensity];
  }

  /**
   * Process skills with multiple display modes
   */
  private processSkills(
    skills: Skill[],
    skillCategories: SkillCategory[] | undefined,
    options: PDFProcessingOptions
  ): ProcessedSkillData {
    // Filter and prioritize skills
    const prioritizedSkills = this.prioritizeSkills(skills, options.targetAudience);

    // Generate different display modes
    const compact = this.generateCompactSkillDisplay(prioritizedSkills);
    const detailed = this.generateDetailedSkillDisplay(prioritizedSkills);
    const categorized = this.generateCategorizedSkillDisplay(prioritizedSkills, skillCategories || []);

    // Determine recommended display mode
    const recommendedDisplayMode = this.determineRecommendedSkillDisplayMode(options);

    return {
      compact,
      detailed,
      categorized,
      topSkills: prioritizedSkills.slice(0, 15),
      trendingSkills: prioritizedSkills.filter(skill => skill.trending).slice(0, 8),
      coreCompetencies: this.extractCoreCompetencies(prioritizedSkills, options.targetAudience),
      recommendedDisplayMode,
      estimatedHeight: {
        compact: compact.estimatedLines * 4,
        detailed: detailed.estimatedHeight,
        categorized: categorized.estimatedHeight
      }
    };
  }

  /**
   * Prioritize skills based on audience and relevance
   */
  private prioritizeSkills(skills: Skill[], audience: string): Skill[] {
    return skills.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Highlight bonus
      if (a.highlight) scoreA += 20;
      if (b.highlight) scoreB += 20;

      // Level score
      const levelScore = { expert: 15, advanced: 12, intermediate: 8, beginner: 4, master: 18 };
      scoreA += levelScore[a.level] || 0;
      scoreB += levelScore[b.level] || 0;

      // Years of experience
      scoreA += Math.min(10, (a.years || 0));
      scoreB += Math.min(10, (b.years || 0));

      // Market demand
      if (a.market_demand === 'high') scoreA += 8;
      if (b.market_demand === 'high') scoreB += 8;

      // Trending bonus
      if (a.trending) scoreA += 5;
      if (b.trending) scoreB += 5;

      return scoreB - scoreA;
    });
  }

  /**
   * Generate compact skill display
   */
  private generateCompactSkillDisplay(skills: Skill[]): CompactSkillDisplay {
    const topSkills = skills.slice(0, 20);
    const skillList = topSkills.map(skill => skill.name);

    const groupedByLevel = topSkills.reduce((acc, skill) => {
      if (!acc[skill.level]) acc[skill.level] = [];
      acc[skill.level].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);

    // Estimate lines needed (assuming ~8 skills per line)
    const estimatedLines = Math.ceil(skillList.length / 8);

    return {
      skillList,
      groupedByLevel,
      estimatedLines
    };
  }

  /**
   * Generate detailed skill display
   */
  private generateDetailedSkillDisplay(skills: Skill[]): DetailedSkillDisplay {
    const topSkills = skills.slice(0, 15);

    const skillsWithLevels = topSkills.map(skill => ({
      name: skill.name,
      level: skill.level,
      years: skill.years,
      highlight: skill.highlight || false
    }));

    // Estimate height (each skill ~6pt)
    const estimatedHeight = skillsWithLevels.length * 6;

    return {
      skillsWithLevels,
      estimatedHeight
    };
  }

  /**
   * Generate categorized skill display
   */
  private generateCategorizedSkillDisplay(skills: Skill[], categories: SkillCategory[]): CategorizedSkillDisplay {
    const categorizedSkills = categories
      .filter(category => category.skills && category.skills.length > 0)
      .map(category => ({
        name: category.category,
        skills: category.skills
          .filter(skill => skills.some(s => s.id === skill.id))
          .slice(0, 8) // Limit skills per category
          .map(skill => skill.name),
        color: category.color || 'primary',
        priority: category.display_order || 999
      }))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6); // Limit to 6 categories

    // Estimate height
    const estimatedHeight = categorizedSkills.reduce((height, category) => {
      return height + 8 + Math.ceil(category.skills.length / 6) * 4; // Category header + skills
    }, 0);

    return {
      categories: categorizedSkills,
      estimatedHeight
    };
  }

  /**
   * Determine recommended skill display mode
   */
  private determineRecommendedSkillDisplayMode(options: PDFProcessingOptions): 'compact' | 'detailed' | 'categorized' {
    if (options.skillsDisplayMode !== 'categorized') {
      return options.skillsDisplayMode;
    }

    // Auto-determine based on content density and audience
    if (options.contentDensity === 'compact') return 'compact';
    if (options.targetAudience === 'technical') return 'categorized';
    return 'detailed';
  }

  /**
   * Extract core competencies
   */
  private extractCoreCompetencies(skills: Skill[], audience: string): string[] {
    const coreSkills = skills
      .filter(skill => skill.highlight || skill.level === 'expert' || skill.level === 'advanced')
      .slice(0, 8)
      .map(skill => skill.name);

    return coreSkills;
  }

  /**
   * Analyze content fit for template
   */
  private analyzeContentFit(
    processedData: any,
    template: PDFTemplate
  ): ContentFitAnalysis {
    // Calculate total estimated height
    const totalHeight = this.calculateTotalContentHeight(processedData);

    // Calculate available height based on template
    const availableHeight = this.calculateAvailableHeight(template);

    const fitRatio = Math.min(1, availableHeight / totalHeight);

    const overflowSections: string[] = [];
    const recommendations: string[] = [];

    if (fitRatio < 0.9) {
      overflowSections.push('Content exceeds available space');
      recommendations.push('Consider reducing content density or increasing page limit');
    }

    return {
      totalEstimatedHeight: totalHeight,
      availableHeight,
      fitRatio,
      overflowSections,
      recommendations
    };
  }

  /**
   * Calculate total content height
   */
  private calculateTotalContentHeight(processedData: any): number {
    let totalHeight = 0;

    // Personal info section
    totalHeight += 60; // Header section

    // Experiences
    totalHeight += processedData.processedExperiences.reduce((sum: number, exp: ProcessedExperience) =>
      sum + exp.estimatedHeight, 0);

    // Projects
    totalHeight += processedData.processedProjects.reduce((sum: number, project: ProcessedProject) =>
      sum + project.estimatedHeight, 0);

    // Skills (use recommended display mode)
    const skillsMode = processedData.processedSkills.recommendedDisplayMode;
    totalHeight += processedData.processedSkills.estimatedHeight[skillsMode];

    return totalHeight;
  }

  /**
   * Calculate available height in template
   */
  private calculateAvailableHeight(template: PDFTemplate): number {
    const pageHeight = template.layout.format === 'A4' ? 297 : 279; // mm
    const margins = template.layout.margins;
    const availableHeight = pageHeight - margins.top - margins.bottom;

    // Convert mm to points (1mm ≈ 2.83 points)
    return availableHeight * 2.83 * template.maxPages;
  }

  /**
   * Generate layout recommendations
   */
  private generateLayoutRecommendations(
    contentFit: ContentFitAnalysis,
    template: PDFTemplate,
    options: PDFProcessingOptions
  ): LayoutRecommendation[] {
    const recommendations: LayoutRecommendation[] = [];

    if (contentFit.fitRatio < 0.8) {
      recommendations.push({
        type: 'content_reduction',
        description: 'Reduce content to fit within page constraints',
        impact: 'high',
        implementation: 'Limit experiences to 4, projects to 3, use compact skill display'
      });
    }

    if (contentFit.fitRatio < 0.9) {
      recommendations.push({
        type: 'density_change',
        description: 'Switch to compact content density',
        impact: 'medium',
        implementation: 'Change contentDensity to "compact"'
      });
    }

    return recommendations;
  }

  /**
   * Calculate section priorities for template
   */
  private calculateSectionPriorities(template: PDFTemplate, options: PDFProcessingOptions): Record<string, number> {
    const basePriorities = {
      personalInfo: 10,
      experience: 9,
      skills: 8,
      projects: 7,
      education: 6,
      certifications: 5
    };

    // Adjust based on audience
    if (options.targetAudience === 'technical') {
      basePriorities.skills = 9;
      basePriorities.projects = 8;
    }

    return basePriorities;
  }

  /**
   * Generate processing metadata
   */
  private generateProcessingMetadata(
    originalData: CVData,
    processedData: any,
    processingTime: number,
    options: PDFProcessingOptions
  ): any {
    const originalSize = JSON.stringify(originalData).length;
    const processedSize = JSON.stringify(processedData).length;

    return {
      originalDataSize: originalSize,
      processedDataSize: processedSize,
      compressionRatio: processedSize / originalSize,
      processingTime,
      optimizationsApplied: [
        'content_prioritization',
        'audience_optimization',
        'length_optimization',
        'layout_optimization'
      ],
      contentStrategy: this.createAudienceStrategy(options.targetAudience)
    };
  }

  /**
   * Update processing performance metrics
   */
  private updateProcessingMetrics(processingTime: number): void {
    const current = this._processingMetrics();
    const totalCalls = current.totalProcessingCalls + 1;
    const newAverage = (current.averageProcessingTime * current.totalProcessingCalls + processingTime) / totalCalls;

    this._processingMetrics.set({
      lastProcessingTime: processingTime,
      averageProcessingTime: newAverage,
      totalProcessingCalls: totalCalls
    });
  }
}
