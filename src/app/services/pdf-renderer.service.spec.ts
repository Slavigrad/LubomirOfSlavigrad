import { TestBed } from '@angular/core/testing';
import { PDFRendererService, PDFRenderingOptions, RenderingMetrics } from './pdf-renderer.service';
import { PDFTemplate } from './pdf-template.service';
import { ProcessedPDFData } from './pdf-data-processor.service';

// Mock jsPDF
const mockJsPDF = {
  internal: {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297
    }
  },
  setFontSize: jasmine.createSpy('setFontSize'),
  setTextColor: jasmine.createSpy('setTextColor'),
  setFillColor: jasmine.createSpy('setFillColor'),
  setDrawColor: jasmine.createSpy('setDrawColor'),
  text: jasmine.createSpy('text'),
  rect: jasmine.createSpy('rect'),
  roundedRect: jasmine.createSpy('roundedRect'),
  addPage: jasmine.createSpy('addPage'),
  output: jasmine.createSpy('output').and.returnValue(new Blob(['mock pdf'], { type: 'application/pdf' })),
  setGState: jasmine.createSpy('setGState'),
  saveGraphicsState: jasmine.createSpy('saveGraphicsState'),
  restoreGraphicsState: jasmine.createSpy('restoreGraphicsState'),
  setLineWidth: jasmine.createSpy('setLineWidth')
};

// Mock jsPDF constructor
// Mock jsPDF in the global scope for browser environment
if (typeof window !== 'undefined') {
  (window as any).jsPDF = jasmine.createSpy('jsPDF').and.returnValue(mockJsPDF);
} else {
  (globalThis as any).jsPDF = jasmine.createSpy('jsPDF').and.returnValue(mockJsPDF);
}

describe('PDFRendererService', () => {
  let service: PDFRendererService;

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
    sections: [
      {
        id: 'hero',
        name: 'Hero Section',
        page: 1,
        variant: 'hero',
        required: true,
        order: 1,
        position: { x: 0, y: 0, width: 100, height: 25 },
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
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

  const mockProcessedData: ProcessedPDFData = {
    personalInfo: {
      id: 'personal-info-1',
      name: 'John Doe',
      title: 'Senior Software Engineer',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      summary: 'Experienced software engineer with 8+ years in full-stack development.',
      displayName: 'John Doe',
      displayTitle: 'Senior Software Engineer',
      displaySummary: 'Experienced software engineer with 8+ years in full-stack development.',
      primaryContact: {
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA'
      },
      professionalLinks: {},
      keyTechnologies: ['React', 'Node.js']
    },
    experiences: [
      {
        id: 'exp1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2023-12-31'),
        displayTitle: 'Senior Software Engineer',
        displayCompany: 'Tech Corp',
        displayDuration: '4 years',
        displayLocation: 'San Francisco, CA',
        keyAchievements: [
          'Reduced API response time by 40%',
          'Implemented CI/CD pipeline reducing deployment time by 60%'
        ],
        primaryTechnologies: ['React', 'Node.js', 'AWS', 'Docker'],
        impactMetrics: ['40% improvement in performance', '60% faster deployment'],
        priority: 9,
        estimatedHeight: 120,
        contentDensity: 'medium'
      }
    ],
    projects: [
      {
        id: 'project1',
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with React and Node.js',
        displayTitle: 'E-commerce Platform',
        displayDescription: 'Full-stack e-commerce solution with React and Node.js',
        keyTechnologies: ['React', 'Node.js', 'MongoDB'],
        technologies: ['React', 'Node.js', 'MongoDB'],
        primaryMetrics: { duration: '6 months', status: 'Completed successfully' },
        priority: 9,
        estimatedHeight: 100,
        url: 'https://github.com/johndoe/ecommerce',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-30'),
        visualElements: {
          hasLinks: true,
          hasMetrics: true,
          hasImage: false
        },
        status: 'completed',
        features: ['responsive-design', 'real-time-updates']
      }
    ],
    skills: {
      compact: {
        skillList: ['React', 'Vue.js'],
        groupedByLevel: {},
        estimatedLines: 2
      },
      detailed: {
        skillsWithLevels: [],
        estimatedHeight: 100
      },
      categorized: {
        categories: [],
        estimatedHeight: 150
      },
      topSkills: [
        { id: 'skill1', name: 'React', level: 'expert', category: 'Frontend' }
      ],
      trendingSkills: [],
      coreCompetencies: ['Frontend Development'],
      recommendedDisplayMode: 'compact',
      estimatedHeight: { compact: 50, detailed: 100, categorized: 150 }
    },
    processingMetadata: {
      originalDataSize: 1000,
      processedDataSize: 800,
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

  const defaultRenderingOptions: PDFRenderingOptions = {
    dpi: 150,
    quality: 0.8,
    compression: 'fast',
    enableProgressiveRendering: false,
    maxRenderTime: 30000,
    memoryOptimization: true,
    colorProfile: 'sRGB',
    pdfVersion: '1.4',
    compliance: 'none',
    antiAliasing: true,
    fontEmbedding: true,
    vectorGraphics: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [PDFRendererService]
    }).compileComponents();

    service = TestBed.inject(PDFRendererService);

    // Reset all spy calls
    Object.values(mockJsPDF).forEach(spy => {
      if (typeof spy === 'function' && spy.calls) {
        spy.calls.reset();
      }
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('renderPDF', () => {
    it('should render PDF successfully with valid data', async () => {
      const result = await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should update rendering progress during generation', async () => {
      const progressValues: number[] = [];

      // Note: renderingProgress() returns a signal, not an observable
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      // Check that progress reaches 100% after completion
      expect(service.renderingProgress()).toBe(100);
    });

    it('should set rendering state correctly', async () => {
      expect(service.isRendering()).toBe(false);

      const renderPromise = service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      // Should be rendering during the process
      expect(service.isRendering()).toBe(true);

      await renderPromise;

      // Should not be rendering after completion
      expect(service.isRendering()).toBe(false);
    });

    it('should initialize PDF with correct template settings', async () => {
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      const jsPDFSpy = typeof window !== 'undefined' ? (window as any).jsPDF : (globalThis as any).jsPDF;
      expect(jsPDFSpy).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'A4'
      });
    });

    it('should render personal info section', async () => {
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      expect(mockJsPDF.text).toHaveBeenCalledWith('John Doe', jasmine.any(Number), jasmine.any(Number));
      expect(mockJsPDF.text).toHaveBeenCalledWith('Senior Software Engineer', jasmine.any(Number), jasmine.any(Number));
    });

    it('should render experience section', async () => {
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      expect(mockJsPDF.text).toHaveBeenCalledWith('Senior Software Engineer', jasmine.any(Number), jasmine.any(Number));
      expect(mockJsPDF.text).toHaveBeenCalledWith('Tech Corp', jasmine.any(Number), jasmine.any(Number));
    });

    it('should render skills section with progress bars', async () => {
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      // Should render skill progress bars
      expect(mockJsPDF.rect).toHaveBeenCalled();
      expect(mockJsPDF.text).toHaveBeenCalledWith('React', jasmine.any(Number), jasmine.any(Number));
    });

    it('should handle different rendering options', async () => {
      const highQualityOptions: PDFRenderingOptions = {
        ...defaultRenderingOptions,
        dpi: 300,
        quality: 0.95,
        compression: 'slow'
      };

      const result = await service.renderPDF(mockProcessedData, mockTemplate, highQualityOptions);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle glass-morphism effects', async () => {
      const glassTemplate = {
        ...mockTemplate,
        sections: [
          {
            ...mockTemplate.sections[0],
            variant: 'glass'
          }
        ]
      };

      await service.renderPDF(mockProcessedData, glassTemplate, defaultRenderingOptions);

      // Should render glass effects with transparency
      expect(mockJsPDF.setGState).toHaveBeenCalled();
      expect(mockJsPDF.roundedRect).toHaveBeenCalled();
    });
  });

  describe('rendering metrics', () => {
    it('should provide rendering metrics after completion', async () => {
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      const metrics = service.renderingMetrics();
      expect(metrics).toBeDefined();
      expect(metrics?.totalRenderTime).toBeGreaterThan(0);
      expect(metrics?.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics?.pdfSize).toBeGreaterThan(0);
    });

    it('should track section render times', async () => {
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      const metrics = service.renderingMetrics();
      expect(metrics?.sectionRenderTimes).toBeDefined();
      expect(typeof metrics?.sectionRenderTimes).toBe('object');
    });
  });

  describe('error handling', () => {
    it('should handle rendering errors gracefully', async () => {
      // Mock jsPDF to throw an error
      mockJsPDF.text.and.throwError('Rendering error');

      await expectAsync(service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions))
        .toBeRejectedWithError('PDF rendering failed: Rendering error');

      expect(service.isRendering()).toBe(false);
    });

    it('should handle missing template sections', async () => {
      const templateWithoutSections = { ...mockTemplate, sections: [] };

      const result = await service.renderPDF(mockProcessedData, templateWithoutSections, defaultRenderingOptions);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle empty processed data', async () => {
      const emptyData: ProcessedPDFData = {
        ...mockProcessedData,
        experiences: [],
        projects: [],
        skills: {
          compact: { skillList: [], groupedByLevel: {}, estimatedLines: 0 },
          detailed: { skillsWithLevels: [], estimatedHeight: 0 },
          categorized: { categories: [], estimatedHeight: 0 },
          topSkills: [],
          trendingSkills: [],
          coreCompetencies: [],
          recommendedDisplayMode: 'compact',
          estimatedHeight: {}
        }
      };

      const result = await service.renderPDF(emptyData, mockTemplate, defaultRenderingOptions);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('performance optimization', () => {
    it('should respect memory optimization settings', async () => {
      const memoryOptimizedOptions = {
        ...defaultRenderingOptions,
        memoryOptimization: true
      };

      const startTime = performance.now();
      await service.renderPDF(mockProcessedData, mockTemplate, memoryOptimizedOptions);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle progressive rendering', async () => {
      const progressiveOptions = {
        ...defaultRenderingOptions,
        enableProgressiveRendering: true
      };

      const result = await service.renderPDF(mockProcessedData, mockTemplate, progressiveOptions);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should respect max render time', async () => {
      const quickOptions = {
        ...defaultRenderingOptions,
        maxRenderTime: 1000 // 1 second limit
      };

      const startTime = performance.now();
      await service.renderPDF(mockProcessedData, mockTemplate, quickOptions);
      const renderTime = performance.now() - startTime;

      // Should complete quickly or timeout gracefully
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('visual elements rendering', () => {
    it('should render skill progress bars correctly', async () => {
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      // Should render background and progress bars
      expect(mockJsPDF.rect).toHaveBeenCalled();
      expect(mockJsPDF.setFillColor).toHaveBeenCalled();
    });

    it('should render glass card effects', async () => {
      await service.renderPDF(mockProcessedData, mockTemplate, defaultRenderingOptions);

      // Should render glass effects with proper layering
      expect(mockJsPDF.setGState).toHaveBeenCalled();
      expect(mockJsPDF.saveGraphicsState).toHaveBeenCalled();
    });

    it('should handle different color schemes', async () => {
      const customColorTemplate = {
        ...mockTemplate,
        colorScheme: {
          ...mockTemplate.colorScheme,
          primary: '#ff0000',
          accent: '#00ff00'
        }
      };

      await service.renderPDF(mockProcessedData, customColorTemplate, defaultRenderingOptions);

      expect(mockJsPDF.setFillColor).toHaveBeenCalled();
      expect(mockJsPDF.setTextColor).toHaveBeenCalled();
    });
  });

  describe('multi-page handling', () => {
    it('should add new pages when content exceeds page height', async () => {
      const largeData = {
        ...mockProcessedData,
        experiences: Array.from({ length: 10 }, (_, i) => ({
          ...mockProcessedData.experiences[0],
          title: `Position ${i + 1}`
        }))
      };

      await service.renderPDF(largeData, mockTemplate, defaultRenderingOptions);

      expect(mockJsPDF.addPage).toHaveBeenCalled();
    });

    it('should respect template page limits', async () => {
      const singlePageTemplate = { ...mockTemplate, maxPages: 1 };

      await service.renderPDF(mockProcessedData, singlePageTemplate, defaultRenderingOptions);

      // Should not add pages beyond the limit
      expect(mockJsPDF.addPage).not.toHaveBeenCalled();
    });
  });
});
