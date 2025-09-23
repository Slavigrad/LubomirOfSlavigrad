import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PDFGenerationOrchestratorService, PDFGenerationRequest } from './pdf-generation-orchestrator.service';
import { CvDataService } from './cv-data.service';
import { PDFTemplateService, PDFTemplate } from './pdf-template.service';
import { PDFDataProcessorService, ProcessedPDFData } from './pdf-data-processor.service';
import { PDFRendererService } from './pdf-renderer.service';
import { CVData } from '../models/cv-data.interface';

describe('PDF Generation Performance Benchmarks', () => {
  let orchestrator: PDFGenerationOrchestratorService;
  let mockCvDataService: jasmine.SpyObj<CvDataService>;
  let mockTemplateService: jasmine.SpyObj<PDFTemplateService>;
  let mockDataProcessor: jasmine.SpyObj<PDFDataProcessorService>;
  let mockRenderer: jasmine.SpyObj<PDFRendererService>;

  const mockTemplate: PDFTemplate = {
    id: 'performance-test-template',
    name: 'Performance Test Template',
    description: 'Template for performance testing',
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

  // Create large CV data for performance testing
  const createLargeCVData = (size: 'small' | 'medium' | 'large'): CVData => {
    const experienceCount = size === 'small' ? 3 : size === 'medium' ? 10 : 25;
    const projectCount = size === 'small' ? 2 : size === 'medium' ? 8 : 20;
    const skillCount = size === 'small' ? 10 : size === 'medium' ? 30 : 75;

    return {
      id: 'cv-perf-test',
      lastUpdated: new Date(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      personalInfo: {
        id: 'personal-info-1',
        name: 'Performance Test User',
        title: 'Senior Software Engineer',
        email: 'test@example.com',
        phone: '+1234567890',
        location: 'Test City',
        summary: 'A'.repeat(500) // Long summary for testing
      },
      experiences: Array.from({ length: experienceCount }, (_, i) => ({
        id: `exp${i}`,
        title: `Position ${i + 1}`,
        company: `Company ${i + 1}`,
        location: 'Test Location',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-12-31'),
        current: false,
        description: 'A'.repeat(300), // Long description
        achievements: Array.from({ length: 5 }, (_, j) => `Achievement ${j + 1} for position ${i + 1}`),
        technologies: Array.from({ length: 8 }, (_, j) => `Tech${j + 1}`),
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      projects: Array.from({ length: projectCount }, (_, i) => ({
        id: `proj${i}`,
        name: `Project ${i + 1}`,
        description: 'B'.repeat(200), // Long description
        technologies: Array.from({ length: 6 }, (_, j) => `ProjectTech${j + 1}`),
        url: `https://github.com/test/project${i}`,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-01'),
        features: [`Feature ${i + 1}`, `Feature ${i + 2}`],
        status: 'completed',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      skills: Array.from({ length: skillCount }, (_, i) => ({
        id: `skill${i}`,
        name: `Skill ${i + 1}`,
        category: `Category ${Math.floor(i / 10) + 1}`,
        level: ['beginner', 'intermediate', 'advanced', 'expert', 'master'][Math.floor(Math.random() * 5)] as any,
        yearsOfExperience: Math.floor(Math.random() * 10) + 1,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      education: [],
      certifications: [],
      volunteerWork: [],
      publications: [],
      speaking: [],
      references: []
    };
  };

  const createMockProcessedData = (size: 'small' | 'medium' | 'large'): ProcessedPDFData => {
    const cvData = createLargeCVData(size);
    return {
      personalInfo: {
        id: cvData.personalInfo.id,
        name: cvData.personalInfo.name,
        title: cvData.personalInfo.title,
        email: cvData.personalInfo.email!,
        phone: cvData.personalInfo.phone!,
        location: cvData.personalInfo.location!,
        summary: cvData.personalInfo.summary!,
        displayName: cvData.personalInfo.name,
        displayTitle: cvData.personalInfo.title,
        displaySummary: cvData.personalInfo.summary!,
        primaryContact: {
          email: cvData.personalInfo.email!,
          phone: cvData.personalInfo.phone!,
          location: cvData.personalInfo.location!
        },
        professionalLinks: {},
        keyTechnologies: ['React', 'Node.js']
      },
      experiences: [], // Simplified for performance testing
      projects: [], // Simplified for performance testing
      skills: {
        compact: {
          skillList: cvData.skills.map(s => s.name),
          groupedByLevel: {},
          estimatedLines: 5
        },
        detailed: {
          skillsWithLevels: [],
          estimatedHeight: 200
        },
        categorized: {
          categories: [],
          estimatedHeight: 300
        },
        topSkills: cvData.skills.slice(0, 10),
        trendingSkills: [],
        coreCompetencies: [],
        recommendedDisplayMode: 'compact',
        estimatedHeight: { compact: 100, detailed: 200, categorized: 300 }
      },
      processingMetadata: {
        originalDataSize: JSON.stringify(cvData).length,
        processedDataSize: 1000,
        compressionRatio: 0.8,
        processingTime: 100,
        optimizationsApplied: ['content-optimization'],
        contentStrategy: {
          strategy_name: 'balanced',
          target_audience: 'general',
          section_weights: {},
          highlighted_sections: [],
          hidden_sections: [],
          skill_emphasis: 'technical',
          experience_focus: 'recent',
          project_selection: 'technical',
          key_value_propositions: [],
          differentiators: [],
          content_rules: []
        }
      },
      templateOptimizations: {
        contentFitAnalysis: {
          totalEstimatedHeight: 800,
          availableHeight: 1000,
          fitRatio: 0.8,
          overflowSections: [],
          recommendations: []
        },
        layoutRecommendations: [],
        sectionPriorities: { hero: 1, experience: 2, skills: 3 }
      }
    };
  };

  beforeEach(async () => {
    const cvDataSpy = jasmine.createSpyObj('CvDataService', ['exportCVData']);
    const templateSpy = jasmine.createSpyObj('PDFTemplateService', ['getTemplate', 'availableTemplates']);
    const processorSpy = jasmine.createSpyObj('PDFDataProcessorService', ['processForTemplate']);
    const rendererSpy = jasmine.createSpyObj('PDFRendererService', ['renderPDF']);

    await TestBed.configureTestingModule({
      providers: [
        PDFGenerationOrchestratorService,
        { provide: CvDataService, useValue: cvDataSpy },
        { provide: PDFTemplateService, useValue: templateSpy },
        { provide: PDFDataProcessorService, useValue: processorSpy },
        { provide: PDFRendererService, useValue: rendererSpy }
      ]
    }).compileComponents();

    orchestrator = TestBed.inject(PDFGenerationOrchestratorService);
    mockCvDataService = TestBed.inject(CvDataService) as jasmine.SpyObj<CvDataService>;
    mockTemplateService = TestBed.inject(PDFTemplateService) as jasmine.SpyObj<PDFTemplateService>;
    mockDataProcessor = TestBed.inject(PDFDataProcessorService) as jasmine.SpyObj<PDFDataProcessorService>;
    mockRenderer = TestBed.inject(PDFRendererService) as jasmine.SpyObj<PDFRendererService>;

    // Setup mocks
    mockTemplateService.getTemplate.and.returnValue(Promise.resolve(mockTemplate));
    Object.defineProperty(mockTemplateService, 'availableTemplates', {
      value: signal([mockTemplate]),
      writable: false
    });
    mockRenderer.renderPDF.and.returnValue(Promise.resolve(new Blob(['test pdf'], { type: 'application/pdf' })));
  });

  describe('Generation Time Benchmarks', () => {
    it('should generate small CV PDF within 1 second', async () => {
      const smallCVData = createLargeCVData('small');
      const smallProcessedData = createMockProcessedData('small');

      mockCvDataService.exportCVData.and.returnValue(smallCVData);
      mockDataProcessor.processForTemplate.and.returnValue(Promise.resolve(smallProcessedData));

      const startTime = performance.now();

      const request: PDFGenerationRequest = {
        templateId: 'performance-test-template',
        preferences: { prioritizeSpeed: true }
      };

      await orchestrator.generatePDF(request);

      const generationTime = performance.now() - startTime;

      expect(generationTime).toBeLessThan(1000); // Should complete within 1 second
      console.log(`Small CV generation time: ${generationTime.toFixed(2)}ms`);
    });

    it('should generate medium CV PDF within 2 seconds', async () => {
      const mediumCVData = createLargeCVData('medium');
      const mediumProcessedData = createMockProcessedData('medium');

      mockCvDataService.exportCVData.and.returnValue(mediumCVData);
      mockDataProcessor.processForTemplate.and.returnValue(Promise.resolve(mediumProcessedData));

      const startTime = performance.now();

      const request: PDFGenerationRequest = {
        templateId: 'performance-test-template',
        preferences: { prioritizeSpeed: true }
      };

      await orchestrator.generatePDF(request);

      const generationTime = performance.now() - startTime;

      expect(generationTime).toBeLessThan(2000); // Should complete within 2 seconds
      console.log(`Medium CV generation time: ${generationTime.toFixed(2)}ms`);
    });

    it('should generate large CV PDF within 3 seconds', async () => {
      const largeCVData = createLargeCVData('large');
      const largeProcessedData = createMockProcessedData('large');

      mockCvDataService.exportCVData.and.returnValue(largeCVData);
      mockDataProcessor.processForTemplate.and.returnValue(Promise.resolve(largeProcessedData));

      const startTime = performance.now();

      const request: PDFGenerationRequest = {
        templateId: 'performance-test-template',
        preferences: { prioritizeSpeed: true }
      };

      await orchestrator.generatePDF(request);

      const generationTime = performance.now() - startTime;

      expect(generationTime).toBeLessThan(3000); // Should complete within 3 seconds
      console.log(`Large CV generation time: ${generationTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should maintain reasonable memory usage during generation', async () => {
      const largeCVData = createLargeCVData('large');
      const largeProcessedData = createMockProcessedData('large');

      mockCvDataService.exportCVData.and.returnValue(largeCVData);
      mockDataProcessor.processForTemplate.and.returnValue(Promise.resolve(largeProcessedData));

      // Measure memory before generation
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const request: PDFGenerationRequest = {
        templateId: 'performance-test-template',
        renderingOptions: { memoryOptimization: true }
      };

      await orchestrator.generatePDF(request);

      // Measure memory after generation
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      console.log(`Memory increase during generation: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Concurrent Generation Benchmarks', () => {
    it('should handle multiple concurrent generations efficiently', async () => {
      const mediumCVData = createLargeCVData('medium');
      const mediumProcessedData = createMockProcessedData('medium');

      mockCvDataService.exportCVData.and.returnValue(mediumCVData);
      mockDataProcessor.processForTemplate.and.returnValue(Promise.resolve(mediumProcessedData));

      const startTime = performance.now();

      // Generate 3 PDFs concurrently
      const requests = Array.from({ length: 3 }, (_, i) => ({
        templateId: 'performance-test-template',
        preferences: { prioritizeSpeed: true },
        metadata: { filename: `test-${i}.pdf` }
      }));

      const promises = requests.map(request => orchestrator.generatePDF(request));
      await Promise.all(promises);

      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / 3;

      // Concurrent generation should be efficient
      expect(averageTime).toBeLessThan(2000); // Average should be under 2 seconds
      console.log(`Concurrent generation - Total: ${totalTime.toFixed(2)}ms, Average: ${averageTime.toFixed(2)}ms`);
    });
  });

  describe('Batch Generation Benchmarks', () => {
    it('should efficiently generate multiple templates in batch', async () => {
      const mediumCVData = createLargeCVData('medium');
      const mediumProcessedData = createMockProcessedData('medium');

      mockCvDataService.exportCVData.and.returnValue(mediumCVData);
      mockDataProcessor.processForTemplate.and.returnValue(Promise.resolve(mediumProcessedData));

      const startTime = performance.now();

      const batchRequest = {
        templateIds: ['performance-test-template', 'performance-test-template', 'performance-test-template'],
        baseRequest: { preferences: { prioritizeSpeed: true } },
        options: { parallel: true, maxConcurrency: 2 }
      };

      const result = await orchestrator.generateBatch(batchRequest);

      const totalTime = performance.now() - startTime;

      expect(result.results.size).toBe(3);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
      console.log(`Batch generation time: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Quality vs Speed Trade-offs', () => {
    it('should generate faster with speed priority', async () => {
      const mediumCVData = createLargeCVData('medium');
      const mediumProcessedData = createMockProcessedData('medium');

      mockCvDataService.exportCVData.and.returnValue(mediumCVData);
      mockDataProcessor.processForTemplate.and.returnValue(Promise.resolve(mediumProcessedData));

      // Speed-optimized generation
      const speedStartTime = performance.now();
      await orchestrator.generatePDF({
        templateId: 'performance-test-template',
        preferences: { prioritizeSpeed: true },
        renderingOptions: { quality: 0.6, compression: 'fast' }
      });
      const speedTime = performance.now() - speedStartTime;

      // Quality-optimized generation
      const qualityStartTime = performance.now();
      await orchestrator.generatePDF({
        templateId: 'performance-test-template',
        preferences: { prioritizeQuality: true },
        renderingOptions: { quality: 0.95, compression: 'slow' }
      });
      const qualityTime = performance.now() - qualityStartTime;

      // Speed-optimized should be faster
      expect(speedTime).toBeLessThan(qualityTime);
      console.log(`Speed-optimized: ${speedTime.toFixed(2)}ms, Quality-optimized: ${qualityTime.toFixed(2)}ms`);
    });
  });

  describe('Performance Metrics Validation', () => {
    it('should meet documented performance standards', async () => {
      const mediumCVData = createLargeCVData('medium');
      const mediumProcessedData = createMockProcessedData('medium');

      mockCvDataService.exportCVData.and.returnValue(mediumCVData);
      mockDataProcessor.processForTemplate.and.returnValue(Promise.resolve(mediumProcessedData));

      const startTime = performance.now();

      const result = await orchestrator.generatePDF({
        templateId: 'performance-test-template',
        preferences: { prioritizeQuality: true }
      });

      const generationTime = performance.now() - startTime;

      // Validate against documented standards
      expect(generationTime).toBeLessThan(3000); // < 3 seconds for 3-page PDF
      expect(result.pdfBlob.size).toBeGreaterThan(500 * 1024); // > 500KB
      expect(result.pdfBlob.size).toBeLessThan(2 * 1024 * 1024); // < 2MB
      expect(result.metadata.qualityScore).toBeGreaterThan(0.8); // > 80% quality

      console.log(`Performance validation - Time: ${generationTime.toFixed(2)}ms, Size: ${(result.pdfBlob.size / 1024).toFixed(2)}KB, Quality: ${(result.metadata.qualityScore * 100).toFixed(1)}%`);
    });
  });
});
