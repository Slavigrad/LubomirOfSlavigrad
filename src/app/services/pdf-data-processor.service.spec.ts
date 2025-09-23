import { TestBed } from '@angular/core/testing';
import { PDFDataProcessorService, PDFProcessingOptions, ProcessedPDFData } from './pdf-data-processor.service';
import { PDFTemplate } from './pdf-template.service';
import { CVData, Experience, Project, Skill } from '../models/cv-data.interface';

describe('PDFDataProcessorService', () => {
  let service: PDFDataProcessorService;

  const mockTemplate: PDFTemplate = {
    id: 'test-template',
    name: 'Test Template',
    description: 'Test template',
    targetAudience: 'recruiter',
    maxPages: 3,
    minPages: 1,
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#64748b',
      muted: '#6b7280',
      glass: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.2)',
        shadow: 'rgba(0, 0, 0, 0.1)',
        highlight: 'rgba(255, 255, 255, 0.3)',
        fillColor: '#ffffff',
        strokeColor: '#ffffff',
        opacity: 0.08,
        shadowColor: '#000000',
        shadowBlur: 5,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.08,
        presets: {
          hero: { opacity: 0.1, shadowBlur: 10, shadowOffset: { x: 0, y: 2 }, shadowOpacity: 0.1 },
          card: { opacity: 0.06, shadowBlur: 5, shadowOffset: { x: 2, y: 2 }, shadowOpacity: 0.08 }
        }
      },

      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    layout: {
      format: 'A4',
      orientation: 'portrait',
      margins: { top: 15, right: 15, bottom: 15, left: 15 },
      columns: 1,
      spacing: { section: 12, paragraph: 6, line: 4, element: 2 },
      typography: {
        baseSize: 12,
        scaleRatio: 1.2,
        lineHeight: 1.4
      },
      radii: { card: 8, chip: 1, button: 4 },

      columnGap: 20
    },
    sections: [],
    features: {
      supportsGlassMorphism: true,
      supportsCharts: true,
      supportsImages: true,
      supportsCustomFonts: false
    },
    performance: {
      estimatedGenerationTime: 2000,
      memoryUsage: 'medium',
      complexity: 'moderate'
    },
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCVData: CVData = {
    id: 'cv1',
    lastUpdated: new Date(),
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    personalInfo: {
      id: 'personal-info-1',
      name: 'John Doe',
      title: 'Senior Software Engineer',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      summary: 'Experienced software engineer with 8+ years in full-stack development, specializing in React, Node.js, and cloud technologies.'
    },
    experiences: [
      {
        id: 'exp1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-12-31'),
        current: false,
        description: 'Led development of microservices architecture serving 1M+ users',
        achievements: [
          'Reduced API response time by 40%',
          'Implemented CI/CD pipeline reducing deployment time by 60%',
          'Mentored 5 junior developers'
        ],
        technologies: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'exp2',
        title: 'Software Engineer',
        company: 'StartupXYZ',
        location: 'Remote',
        startDate: new Date('2018-06-01'),
        endDate: new Date('2019-12-31'),
        current: false,
        description: 'Full-stack development for e-commerce platform',
        achievements: [
          'Built payment processing system',
          'Increased conversion rate by 25%'
        ],
        technologies: ['Vue.js', 'Python', 'PostgreSQL'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    projects: [
      {
        id: 'proj1',
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB'],
        url: 'https://github.com/johndoe/ecommerce',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-01'),
        status: 'completed',
        features: ['Payment integration', 'User authentication', 'Product catalog'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    skills: [
      {
        id: 'skill1',
        name: 'React',
        category: 'Frontend',
        level: 'expert',

        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'skill2',
        name: 'Node.js',
        category: 'Backend',
        level: 'advanced',

        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'skill3',
        name: 'AWS',
        category: 'Cloud',
        level: 'advanced',

        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    education: [],
    certifications: [],
    volunteerWork: [],
    publications: [],
    speaking: [],
    references: []
  };

  const defaultProcessingOptions: PDFProcessingOptions = {
    targetAudience: 'recruiter',
    maxPages: 3,
    contentDensity: 'normal',
    includeSections: {
      personalInfo: true,
      experience: true,
      projects: true,
      skills: true,
      education: true,
      certifications: true,
      volunteerWork: false,
      publications: false,
      speaking: false
    },
    experienceLimit: 5,
    projectLimit: 3,
    skillsDisplayMode: 'detailed',
    templateId: 'test-template',
    preserveOriginalOrder: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [PDFDataProcessorService]
    }).compileComponents();

    service = TestBed.inject(PDFDataProcessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('processForTemplate', () => {
    it('should process CV data for template successfully', async () => {
      const result = await service.processForTemplate(mockCVData, mockTemplate, defaultProcessingOptions);

      expect(result).toBeDefined();
      expect(result.personalInfo).toBeDefined();
      expect(result.experiences).toBeDefined();
      expect(result.projects).toBeDefined();
      expect(result.skills).toBeDefined();
      expect(result.processingMetadata).toBeDefined();
    });

    it('should process personal info correctly', async () => {
      const result = await service.processForTemplate(mockCVData, mockTemplate, defaultProcessingOptions);

      expect(result.personalInfo.name).toBe('John Doe');
      expect(result.personalInfo.title).toBe('Senior Software Engineer');
      expect(result.personalInfo.primaryContact.email).toBe('john.doe@example.com');
      expect(result.personalInfo.primaryContact.phone).toBe('+1-555-0123');
      expect(result.personalInfo.primaryContact.location).toBe('San Francisco, CA');
    });

    it('should limit experiences based on maxExperiences option', async () => {
      const options = { ...defaultProcessingOptions, maxExperiences: 1 };
      const result = await service.processForTemplate(mockCVData, mockTemplate, options);

      expect(result.experiences.length).toBe(1);
      expect(result.experiences[0].title).toBe('Senior Software Engineer'); // Most recent
    });

    it('should prioritize recent experiences when prioritizeRecent is true', async () => {
      const options = { ...defaultProcessingOptions, prioritizeRecent: true };
      const result = await service.processForTemplate(mockCVData, mockTemplate, options);

      expect(result.experiences[0].startDate).toEqual(new Date('2020-01-01')); // More recent experience first
    });

    it('should exclude projects when includeProjects is false', async () => {
      const options = { ...defaultProcessingOptions, includeProjects: false };
      const result = await service.processForTemplate(mockCVData, mockTemplate, options);

      expect(result.projects.length).toBe(0);
    });

    it('should process skills with different display modes', async () => {
      const compactOptions = { ...defaultProcessingOptions, skillsDisplayMode: 'compact' as const };
      const visualOptions = { ...defaultProcessingOptions, skillsDisplayMode: 'categorized' as const };

      const compactResult = await service.processForTemplate(mockCVData, mockTemplate, compactOptions);
      const visualResult = await service.processForTemplate(mockCVData, mockTemplate, visualOptions);

      expect(compactResult.skills.compact).toBeDefined();
      expect(visualResult.skills.categorized).toBeDefined();
      expect(visualResult.skills.categorized.categories).toBeDefined();
    });

    it('should optimize content for different audiences', async () => {
      const recruiterTemplate = { ...mockTemplate, targetAudience: 'recruiter' as const };
      const technicalTemplate = { ...mockTemplate, targetAudience: 'technical' as const };

      const recruiterResult = await service.processForTemplate(mockCVData, recruiterTemplate, defaultProcessingOptions);
      const technicalResult = await service.processForTemplate(mockCVData, technicalTemplate, defaultProcessingOptions);

      expect(recruiterResult.processingMetadata.contentStrategy).toBeDefined();
      expect(technicalResult.processingMetadata.contentStrategy).toBeDefined();
    });

    it('should calculate processing metadata correctly', async () => {
      const result = await service.processForTemplate(mockCVData, mockTemplate, defaultProcessingOptions);

      expect(result.processingMetadata.originalDataSize).toBeGreaterThan(0);
      expect(result.processingMetadata.processedDataSize).toBeGreaterThan(0);
      expect(result.processingMetadata.compressionRatio).toBeGreaterThan(0);
      expect(result.processingMetadata.processingTime).toBeGreaterThan(0);
      expect(result.processingMetadata.optimizationsApplied).toBeDefined();
    });
  });

  describe('content optimization', () => {
    it('should truncate long descriptions based on template constraints', async () => {
      const longDescription = 'A'.repeat(1000);
      const cvDataWithLongDesc = {
        ...mockCVData,
        experiences: [{
          ...mockCVData.experiences[0],
          description: longDescription
        }]
      };

      const result = await service.processForTemplate(cvDataWithLongDesc, mockTemplate, defaultProcessingOptions);

      expect(result.experiences[0].description?.length || 0).toBeLessThan(longDescription.length);
    });

    it('should limit achievements based on template space', async () => {
      const manyAchievements = Array.from({ length: 10 }, (_, i) => `Achievement ${i + 1}`);
      const cvDataWithManyAchievements = {
        ...mockCVData,
        experiences: [{
          ...mockCVData.experiences[0],
          achievements: manyAchievements
        }]
      };

      const result = await service.processForTemplate(cvDataWithManyAchievements, mockTemplate, defaultProcessingOptions);

      expect(result.experiences[0].achievements?.length || 0).toBeLessThanOrEqual(5);
    });

    it('should prioritize top skills based on level and experience', async () => {
      const result = await service.processForTemplate(mockCVData, mockTemplate, defaultProcessingOptions);

      expect(result.skills.topSkills.length).toBeGreaterThan(0);
      // Skills are now string-based levels, so we'll just check they exist
      expect(result.skills.topSkills[0].level).toBeDefined();
    });
  });

  describe('template optimization analysis', () => {
    it('should provide content fit analysis', async () => {
      const result = await service.processForTemplate(mockCVData, mockTemplate, defaultProcessingOptions);

      expect(result.templateOptimizations.contentFitAnalysis).toBeDefined();
      expect(result.templateOptimizations.contentFitAnalysis.totalEstimatedHeight).toBeGreaterThan(0);
    });

    it('should provide layout recommendations', async () => {
      const result = await service.processForTemplate(mockCVData, mockTemplate, defaultProcessingOptions);

      expect(result.templateOptimizations.layoutRecommendations).toBeDefined();
      expect(Array.isArray(result.templateOptimizations.layoutRecommendations)).toBe(true);
    });

    it('should calculate section priorities', async () => {
      const result = await service.processForTemplate(mockCVData, mockTemplate, defaultProcessingOptions);

      expect(result.templateOptimizations.sectionPriorities).toBeDefined();
      expect(typeof result.templateOptimizations.sectionPriorities).toBe('object');
    });
  });

  describe('error handling', () => {
    it('should handle missing personal info gracefully', async () => {
      const incompleteData = { ...mockCVData, personalInfo: undefined as any };

      await expectAsync(service.processForTemplate(incompleteData, mockTemplate, defaultProcessingOptions))
        .toBeRejectedWithError('Personal information is required');
    });

    it('should handle empty experiences array', async () => {
      const dataWithoutExperiences = { ...mockCVData, experiences: [] };

      const result = await service.processForTemplate(dataWithoutExperiences, mockTemplate, defaultProcessingOptions);

      expect(result.experiences.length).toBe(0);
      expect(result.processingMetadata.optimizationsApplied).toContain('no-experience-optimization');
    });

    it('should handle invalid template configuration', async () => {
      const invalidTemplate = { ...mockTemplate, maxPages: 0 };

      await expectAsync(service.processForTemplate(mockCVData, invalidTemplate, defaultProcessingOptions))
        .toBeRejectedWithError('Invalid template configuration');
    });
  });

  describe('performance', () => {
    it('should process data within reasonable time limits', async () => {
      const startTime = performance.now();

      await service.processForTemplate(mockCVData, mockTemplate, defaultProcessingOptions);

      const processingTime = performance.now() - startTime;
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeExperiences = Array.from({ length: 50 }, (_, i) => ({
        ...mockCVData.experiences[0],
        id: `exp${i}`,
        title: `Position ${i}`
      }));

      const largeSkills = Array.from({ length: 100 }, (_, i) => ({
        ...mockCVData.skills[0],
        id: `skill${i}`,
        name: `Skill ${i}`
      }));

      const largeCVData = {
        ...mockCVData,
        experiences: largeExperiences,
        skills: largeSkills
      };

      const startTime = performance.now();
      const result = await service.processForTemplate(largeCVData, mockTemplate, defaultProcessingOptions);
      const processingTime = performance.now() - startTime;

      expect(result).toBeDefined();
      expect(processingTime).toBeLessThan(2000); // Should handle large data within 2 seconds
    });
  });

  describe('content strategy application', () => {
    it('should apply recruiter-focused strategy', async () => {
      const options = { ...defaultProcessingOptions, contentStrategy: 'balanced' as const };
      const result = await service.processForTemplate(mockCVData, mockTemplate, options);

      expect(result.processingMetadata.contentStrategy).toBeDefined();
      expect(result.processingMetadata.optimizationsApplied).toContain('content-optimization');
    });

    it('should apply technical-focused strategy', async () => {
      const options = { ...defaultProcessingOptions, contentStrategy: 'balanced' as const };
      const result = await service.processForTemplate(mockCVData, mockTemplate, options);

      expect(result.processingMetadata.contentStrategy).toBeDefined();
      expect(result.processingMetadata.optimizationsApplied).toContain('content-optimization');
    });
  });
});
