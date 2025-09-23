import { Component, signal, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFProcessingOptions } from '../../services/pdf-data-processor.service';
import { PDFRenderingOptions } from '../../services/pdf-renderer.service';
import { PDFGenerationOrchestratorService } from '../../services/pdf-generation-orchestrator.service';

/**
 * PDF Configuration Interface for User Experimentation
 */
export interface PDFConfigurationState {
  // Content Control
  experienceLimit: number | 'all';
  includeExperienceDescriptions: boolean;
  includeProjectDescriptions: boolean;

  // Section Visibility
  sections: {
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

  // Content Density
  contentDensity: 'compact' | 'normal' | 'spacious';
  maxPages: number;

  // Experience Layout
  experienceLayout: 'stacked' | 'two-column';

  // Skills Display
  skillsDisplayMode: 'compact' | 'detailed' | 'categorized';

  // Quality Settings
  quality: number;
  dpi: number;

  // Template Settings
  templateId: string;
  targetAudience: 'recruiter' | 'technical' | 'executive' | 'creative';
}

@Component({
  selector: 'app-pdf-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pdf-configuration-panel">
      <!-- Header -->
      <div class="config-header">
        <h3 class="text-xl font-bold gradient-text">PDF Configuration</h3>
        <p class="text-sm text-muted-foreground">Customize your CV for experimentation and comparison</p>
      </div>

      <!-- Content Control Section -->
      <div class="config-section">
        <h4 class="section-title">Content Control</h4>

        <!-- Experience Limit -->
        <div class="config-item">
          <label class="config-label">Experience Entries</label>
          <select [(ngModel)]="config().experienceLimit" (ngModelChange)="updateConfig('experienceLimit', $event)" class="config-select">
            <option value="all">Show All Experiences</option>
            <option [value]="3">Last 3 Experiences</option>
            <option [value]="5">Last 5 Experiences</option>
            <option [value]="7">Last 7 Experiences</option>
            <option [value]="10">Last 10 Experiences</option>
          </select>
        </div>

        <!-- Experience Descriptions -->
        <div class="config-item">
          <label class="config-checkbox">
            <input
              type="checkbox"
              [(ngModel)]="config().includeExperienceDescriptions"
              (ngModelChange)="updateConfig('includeExperienceDescriptions', $event)"
            />
            <span>Include Experience Descriptions</span>
          </label>
        </div>

        <!-- Project Descriptions -->
        <div class="config-item">
          <label class="config-checkbox">
            <input
              type="checkbox"
              [(ngModel)]="config().includeProjectDescriptions"
              (ngModelChange)="updateConfig('includeProjectDescriptions', $event)"
            />
            <span>Include Project Descriptions</span>
          </label>
        </div>
      </div>

      <!-- Section Visibility -->
      <div class="config-section">
        <h4 class="section-title">Section Visibility</h4>

        @for (section of sectionOptions; track section.key) {
          <div class="config-item">
            <label class="config-checkbox">
              <input
                type="checkbox"
                [ngModel]="config().sections[section.key]"
                (ngModelChange)="updateSectionVisibility(section.key, $event)"
              />
              <span>{{ section.label }}</span>
            </label>
          </div>
        }
      </div>

      <!-- Layout & Density -->
      <div class="config-section">
        <h4 class="section-title">Layout & Density</h4>

        <!-- Content Density -->
        <div class="config-item">
          <label class="config-label">Content Density</label>
          <select [(ngModel)]="config().contentDensity" (ngModelChange)="updateConfig('contentDensity', $event)" class="config-select">
            <option value="compact">Compact (More content, less spacing)</option>
            <option value="normal">Normal (Balanced)</option>
            <option value="spacious">Spacious (More spacing, less content)</option>
          </select>
        </div>

        <!-- Experience Layout -->
        <div class="config-item">
          <label class="config-label">Experience Layout</label>
          <select [(ngModel)]="config().experienceLayout" (ngModelChange)="updateConfig('experienceLayout', $event)" class="config-select">
            <option value="stacked">Stacked (Single column)</option>
            <option value="two-column">Two columns (Denser)</option>
          </select>
        </div>

        <!-- Max Pages -->
        <div class="config-item">
          <label class="config-label">Maximum Pages</label>
          <select [(ngModel)]="config().maxPages" (ngModelChange)="updateConfig('maxPages', $event)" class="config-select">
            <option [value]="1">1 Page (Ultra Compact)</option>
            <option [value]="2">2 Pages (Standard)</option>
            <option [value]="3">3 Pages (Extended)</option>
            <option [value]="4">4 Pages (Detailed)</option>
            <option [value]="5">5 Pages (Comprehensive)</option>
          </select>
        </div>

        <!-- Skills Display Mode -->
        <div class="config-item">
          <label class="config-label">Skills Display</label>
          <select [(ngModel)]="config().skillsDisplayMode" (ngModelChange)="updateConfig('skillsDisplayMode', $event)" class="config-select">
            <option value="compact">Compact (Tags only)</option>
            <option value="detailed">Detailed (With proficiency)</option>
            <option value="categorized">Categorized (Grouped by type)</option>
          </select>
        </div>
      </div>

      <!-- Quality Settings -->
      <div class="config-section">
        <h4 class="section-title">Quality Settings</h4>

        <!-- Quality Slider -->
        <div class="config-item">
          <label class="config-label">PDF Quality: {{ (config().quality * 100).toFixed(0) }}%</label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.1"
            [(ngModel)]="config().quality"
            (ngModelChange)="updateConfig('quality', $event)"
            class="config-slider"
          />
        </div>

        <!-- DPI Setting -->
        <div class="config-item">
          <label class="config-label">Resolution (DPI)</label>
          <select [(ngModel)]="config().dpi" (ngModelChange)="updateConfig('dpi', $event)" class="config-select">
            <option [value]="150">150 DPI (Fast, smaller file)</option>
            <option [value]="300">300 DPI (Standard, balanced)</option>
            <option [value]="600">600 DPI (High quality, larger file)</option>
          </select>
        </div>
      </div>

      <!-- Target Audience -->
      <div class="config-section">
        <h4 class="section-title">Target Audience</h4>

        <div class="config-item">
          <select [(ngModel)]="config().targetAudience" (ngModelChange)="updateConfig('targetAudience', $event)" class="config-select">
            <option value="recruiter">Recruiter (Concise, impact-focused)</option>
            <option value="technical">Technical (Detailed, skill-focused)</option>
            <option value="executive">Executive (Strategic, leadership-focused)</option>
            <option value="creative">Creative (Visual, portfolio-focused)</option>
          </select>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="config-actions">
        <button
          class="btn-secondary"
          (click)="resetToDefaults()"
        >
          Reset to Defaults
        </button>

        <button
          class="btn-primary"
          (click)="generatePreview()"
          [disabled]="isGenerating()"
        >
          {{ isGenerating() ? 'Generating...' : 'Generate Preview' }}
        </button>

        <button
          class="btn-accent"
          (click)="generateAndDownload()"
          [disabled]="isGenerating()"
        >
          {{ isGenerating() ? 'Generating...' : 'Download PDF' }}
        </button>
      </div>

      <!-- Configuration Summary -->
      <div class="config-summary">
        <h5 class="text-sm font-semibold text-muted-foreground mb-2">Current Configuration:</h5>
        <div class="summary-grid">
          <span>Experiences: {{ config().experienceLimit === 'all' ? 'All' : config().experienceLimit }}</span>
          <span>Pages: {{ config().maxPages }}</span>
          <span>Density: {{ config().contentDensity }}</span>
          <span>Quality: {{ (config().quality * 100).toFixed(0) }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pdf-configuration-panel {
      @apply bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto;
    }

    .config-header {
      @apply mb-6 pb-4 border-b border-white/10;
    }

    .config-section {
      @apply mb-6 space-y-4;
    }

    .section-title {
      @apply text-lg font-semibold text-white mb-3;
    }

    .config-item {
      @apply space-y-2;
    }

    .config-label {
      @apply block text-sm font-medium text-white;
    }

    .config-checkbox {
      @apply flex items-center space-x-2 text-sm text-white cursor-pointer;
    }

    .config-checkbox input[type="checkbox"] {
      @apply w-4 h-4 text-blue-600 bg-gray-800 border-white/20 rounded focus:ring-blue-500 focus:ring-2;
    }

    .config-select {
      @apply w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500;
    }

    .config-slider {
      @apply w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer;
    }

    .config-slider::-webkit-slider-thumb {
      @apply appearance-none w-4 h-4 bg-primary rounded-full cursor-pointer;
    }

    .config-actions {
      @apply flex gap-3 mt-6 pt-4 border-t border-white/10;
    }

    .btn-primary {
      @apply flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50;
    }

    .btn-secondary {
      @apply px-4 py-2 border border-white/20 text-gray-400 rounded-lg hover:bg-white/10 transition-colors text-sm;
    }

    .btn-accent {
      @apply flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50;
    }

    .config-summary {
      @apply mt-6 pt-4 border-t border-white/10;
    }

    .summary-grid {
      @apply grid grid-cols-2 gap-2 text-xs text-gray-400;
    }

    .gradient-text {
      @apply bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent;
    }
  `]
})
export class PDFConfigurationComponent {
  private orchestrator = inject(PDFGenerationOrchestratorService);

  // Configuration state
  readonly config = signal<PDFConfigurationState>({
    experienceLimit: 'all',
    includeExperienceDescriptions: true,
    includeProjectDescriptions: true,
    sections: {
      personalInfo: true,

      experience: true,
      projects: true,
      skills: true,
      education: true,
      certifications: false,
      volunteerWork: false,
      publications: false,
      speaking: false
    },
    contentDensity: 'normal',
    maxPages: 2,
    experienceLayout: 'two-column',

    skillsDisplayMode: 'compact',
    quality: 0.9,
    dpi: 300,
    templateId: 'glass-modern-template',
    targetAudience: 'recruiter'
  });

  // UI state
  readonly isGenerating = signal(false);

  // Section options for UI
  readonly sectionOptions = [
    { key: 'personalInfo' as const, label: 'Personal Information' },
    { key: 'experience' as const, label: 'Work Experience' },
    { key: 'projects' as const, label: 'Projects' },
    { key: 'skills' as const, label: 'Skills' },
    { key: 'education' as const, label: 'Education' },
    { key: 'certifications' as const, label: 'Certifications' },
    { key: 'volunteerWork' as const, label: 'Volunteer Work' },
    { key: 'publications' as const, label: 'Publications' },
    { key: 'speaking' as const, label: 'Speaking' }
  ];

  // Events
  readonly configurationChanged = output<PDFConfigurationState>();
  readonly pdfGenerated = output<Blob>();

  /**
   * Update configuration value
   */
  updateConfig<K extends keyof PDFConfigurationState>(key: K, value: PDFConfigurationState[K]): void {
    this.config.update(current => ({
      ...current,
      [key]: value
    }));
    this.configurationChanged.emit(this.config());
  }

  /**
   * Update section visibility
   */
  updateSectionVisibility(sectionKey: keyof PDFConfigurationState['sections'], visible: boolean): void {
    this.config.update(current => ({
      ...current,
      sections: {
        ...current.sections,
        [sectionKey]: visible
      }
    }));
    this.configurationChanged.emit(this.config());
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults(): void {
    this.config.set({
      experienceLimit: 'all',
      includeExperienceDescriptions: true,
      includeProjectDescriptions: true,
      sections: {
        personalInfo: true,
        experience: true,
        projects: true,
        skills: true,
        education: true,
        certifications: false,
        volunteerWork: false,
        publications: false,
        speaking: false
      },
      contentDensity: 'normal',
      maxPages: 2,
      experienceLayout: 'two-column',

      skillsDisplayMode: 'compact',
      quality: 0.9,
      dpi: 300,
      templateId: 'glass-modern-template',
      targetAudience: 'recruiter'
    });
    this.configurationChanged.emit(this.config());
  }

  /**
   * Generate PDF preview (without download)
   */
  async generatePreview(): Promise<void> {
    await this.generatePDF(false);
  }

  /**
   * Generate and download PDF
   */
  async generateAndDownload(): Promise<void> {
    await this.generatePDF(true);
  }

  /**
   * Generate PDF with current configuration
   */
  private async generatePDF(download: boolean): Promise<void> {
    try {
      this.isGenerating.set(true);

      const currentConfig = this.config();

      // Convert configuration to processing options
      const processingOptions: Partial<PDFProcessingOptions> = {
        targetAudience: currentConfig.targetAudience,
        maxPages: currentConfig.maxPages,
        contentDensity: currentConfig.contentDensity,
        includeSections: currentConfig.sections,
        experienceLimit: currentConfig.experienceLimit === 'all' ? undefined : currentConfig.experienceLimit,
        skillsDisplayMode: currentConfig.skillsDisplayMode,
        templateId: currentConfig.templateId
      };

      // Convert configuration to rendering options
      const renderingOptions: Partial<PDFRenderingOptions> = {
        quality: currentConfig.quality,
        dpi: currentConfig.dpi,
        compression: currentConfig.quality > 0.9 ? 'slow' : 'fast',
        enableProgressiveRendering: true,
        fontEmbedding: true,
        vectorGraphics: true,
        includeExperienceDescriptions: currentConfig.includeExperienceDescriptions,
        includeProjectDescriptions: currentConfig.includeProjectDescriptions,
        experienceLayout: currentConfig.experienceLayout
      };

      const result = await this.orchestrator.generatePDF({
        templateId: currentConfig.templateId,
        processingOptions,
        renderingOptions,
        preferences: {
          prioritizeQuality: currentConfig.quality > 0.8,
          enableFallback: true,
          validateOutput: true
        }
      });

      this.pdfGenerated.emit(result.pdfBlob);

      if (download) {
        this.downloadPDF(result.pdfBlob, this.generateFilename());
      }

    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Generate filename based on configuration
   */
  private generateFilename(): string {
    const config = this.config();
    const timestamp = new Date().toISOString().slice(0, 10);
    const expLimit = config.experienceLimit === 'all' ? 'all' : config.experienceLimit;
    return `CV_${config.targetAudience}_${expLimit}exp_${config.maxPages}p_${timestamp}.pdf`;
  }

  /**
   * Download PDF blob
   */
  private downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
