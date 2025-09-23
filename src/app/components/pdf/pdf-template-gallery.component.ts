import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFTemplateService, PDFTemplate } from '../../services/pdf-template.service';
import { PDFTemplatePreviewService, TemplatePreviewResult, TemplateFeature } from '../../services/pdf-template-preview.service';
import { PDFGenerationOrchestratorService, TemplateCompatibility } from '../../services/pdf-generation-orchestrator.service';
import { ModernCardComponent } from '../../shared/components/modern-card/modern-card.component';

/**
 * Template Filter Options
 */
export interface TemplateFilter {
  audience: string[];
  features: string[];
  complexity: string[];
  searchTerm: string;
}

/**
 * Template Comparison Data
 */
export interface TemplateComparison {
  templates: PDFTemplate[];
  previews: Map<string, TemplatePreviewResult>;
  compatibility: Map<string, TemplateCompatibility>;
}

/**
 * PDF Template Gallery Component
 *
 * Provides an interactive gallery for browsing and selecting PDF templates
 * with real-time previews, compatibility analysis, and comparison features.
 */
@Component({
  selector: 'app-pdf-template-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, ModernCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pdf-template-gallery">
      <!-- Gallery Header -->
      <div class="gallery-header">
        <div class="header-content">
          <h2 class="gallery-title">Choose Your Perfect Template</h2>
          <p class="gallery-subtitle">
            Select from our professionally designed templates optimized for different audiences and purposes.
          </p>
        </div>

        <!-- Gallery Controls -->
        <div class="gallery-controls">
          <!-- Search -->
          <div class="search-container">
            <input
              type="text"
              placeholder="Search templates..."
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
              class="search-input"
            />
            <i class="search-icon fas fa-search"></i>
          </div>

          <!-- Filters -->
          <div class="filter-container">
            <select
              [(ngModel)]="selectedAudience"
              (change)="onFilterChange()"
              class="filter-select"
            >
              <option value="">All Audiences</option>
              <option value="recruiter">Recruiter</option>
              <option value="technical">Technical</option>
              <option value="executive">Executive</option>
              <option value="creative">Creative</option>
            </select>

            <button
              (click)="toggleComparisonMode()"
              [class.active]="comparisonMode()"
              class="comparison-toggle"
            >
              <i class="fas fa-columns"></i>
              Compare
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading templates...</p>
        </div>
      }

      <!-- Template Grid -->
      @if (!isLoading() && !comparisonMode()) {
        <div class="template-grid">
          @for (template of filteredTemplates(); track template.id) {
            <app-modern-card
              [title]="template.name"
              [subtitle]="template.description"
              [variant]="selectedTemplateId() === template.id ? 'elevated' : 'default'"
              [clickable]="true"
              [hoverEffect]="true"
              [loading]="isGeneratingPreview() && currentPreviewTemplate() === template.id"
              [loadingText]="'Generating preview...'"
              (cardClick)="selectTemplate(template.id)"
              class="template-card"
            >
              <!-- Template Preview -->
              <div class="template-preview">
                @if (getPreviewUrl(template.id); as previewUrl) {
                  <img
                    [src]="previewUrl"
                    [alt]="template.name + ' preview'"
                    class="preview-image"
                    (load)="onPreviewLoad(template.id)"
                    (error)="onPreviewError(template.id)"
                  />
                } @else {
                  <div class="preview-placeholder">
                    <i class="fas fa-file-pdf preview-icon"></i>
                    <span class="preview-text">Generating preview...</span>
                  </div>
                }

                <!-- Template Badge -->
                <div class="template-badge" [attr.data-audience]="template.targetAudience">
                  {{ template.targetAudience | titlecase }}
                </div>
              </div>

              <!-- Template Info -->
              <div class="template-info">
                <!-- Compatibility Score -->
                @if (getCompatibilityScore(template.id); as score) {
                  <div class="compatibility-score">
                    <div class="score-bar">
                      <div
                        class="score-fill"
                        [style.width.%]="score"
                        [class]="getScoreClass(score)"
                      ></div>
                    </div>
                    <span class="score-text">{{ score }}% match</span>
                  </div>
                }

                <!-- Template Features -->
                <div class="template-features">
                  @for (feature of getTemplateFeatures(template.id); track feature.name) {
                    @if (feature.highlighted) {
                      <span
                        class="feature-badge"
                        [attr.data-category]="feature.category"
                        [title]="feature.description"
                      >
                        <i [class]="'fas fa-' + feature.icon"></i>
                        {{ feature.name }}
                      </span>
                    }
                  }
                </div>

                <!-- Generation Time -->
                @if (getEstimatedTime(template.id); as time) {
                  <div class="generation-time">
                    <i class="fas fa-clock"></i>
                    <span>~{{ (time / 1000).toFixed(1) }}s generation</span>
                  </div>
                }
              </div>

              <!-- Template Actions -->
              <div slot="footer" class="template-actions">
                <button
                  (click)="previewTemplate(template.id); $event.stopPropagation()"
                  [disabled]="isGeneratingPreview()"
                  class="action-button preview-button"
                >
                  <i class="fas fa-eye"></i>
                  Preview
                </button>

                <button
                  (click)="addToComparison(template.id); $event.stopPropagation()"
                  [disabled]="comparisonTemplates().length >= 3"
                  class="action-button compare-button"
                >
                  <i class="fas fa-plus"></i>
                  Compare
                </button>

                <button
                  (click)="generatePDF(template.id); $event.stopPropagation()"
                  [disabled]="isGeneratingPDF()"
                  class="action-button generate-button primary"
                >
                  <i class="fas fa-download"></i>
                  Generate
                </button>
              </div>
            </app-modern-card>
          }
        </div>
      }

      <!-- Comparison View -->
      @if (comparisonMode() && comparisonTemplates().length > 0) {
        <div class="comparison-view">
          <div class="comparison-header">
            <h3>Template Comparison</h3>
            <button
              (click)="clearComparison()"
              class="clear-comparison"
            >
              <i class="fas fa-times"></i>
              Clear All
            </button>
          </div>

          <div class="comparison-grid">
            @for (templateId of comparisonTemplates(); track templateId) {
              @if (getTemplate(templateId); as template) {
                <div class="comparison-card">
                  <!-- Template Preview -->
                  <div class="comparison-preview">
                    @if (getPreviewUrl(templateId); as previewUrl) {
                      <img [src]="previewUrl" [alt]="template.name" />
                    }
                  </div>

                  <!-- Template Details -->
                  <div class="comparison-details">
                    <h4>{{ template.name }}</h4>
                    <p>{{ template.description }}</p>

                    <!-- Comparison Metrics -->
                    <div class="comparison-metrics">
                      <div class="metric">
                        <span class="metric-label">Compatibility</span>
                        <span class="metric-value">{{ getCompatibilityScore(templateId) }}%</span>
                      </div>
                      <div class="metric">
                        <span class="metric-label">Generation Time</span>
                        <span class="metric-value">{{ (getEstimatedTime(templateId) / 1000).toFixed(1) }}s</span>
                      </div>
                      <div class="metric">
                        <span class="metric-label">Target Audience</span>
                        <span class="metric-value">{{ template.targetAudience | titlecase }}</span>
                      </div>
                    </div>

                    <!-- Action Button -->
                    <button
                      (click)="selectAndGenerate(templateId)"
                      class="comparison-action"
                    >
                      Select & Generate
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && filteredTemplates().length === 0) {
        <div class="empty-state">
          <i class="fas fa-search empty-icon"></i>
          <h3>No templates found</h3>
          <p>Try adjusting your search or filter criteria.</p>
          <button
            (click)="clearFilters()"
            class="clear-filters-button"
          >
            Clear Filters
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .pdf-template-gallery {
      @apply w-full max-w-7xl mx-auto p-6;
    }

    .gallery-header {
      @apply mb-8;
    }

    .header-content {
      @apply mb-6;
    }

    .gallery-title {
      @apply text-3xl font-bold text-foreground mb-2;
    }

    .gallery-subtitle {
      @apply text-lg text-muted-foreground;
    }

    .gallery-controls {
      @apply flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between;
    }

    .search-container {
      @apply relative flex-1 max-w-md;
    }

    .search-input {
      @apply w-full px-4 py-2 pl-10 rounded-lg border border-border bg-background text-foreground;
      @apply focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
    }

    .search-icon {
      @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground;
    }

    .filter-container {
      @apply flex gap-3;
    }

    .filter-select {
      @apply px-3 py-2 rounded-lg border border-border bg-background text-foreground;
      @apply focus:outline-none focus:ring-2 focus:ring-primary;
    }

    .comparison-toggle {
      @apply px-4 py-2 rounded-lg border border-border bg-background text-foreground;
      @apply hover:bg-accent transition-colors;
    }

    .comparison-toggle.active {
      @apply bg-primary text-white border-primary;
    }

    .loading-container {
      @apply flex flex-col items-center justify-center py-16;
    }

    .loading-spinner {
      @apply w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4;
    }

    .loading-text {
      @apply text-muted-foreground;
    }

    .template-grid {
      @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
    }

    .template-card {
      @apply h-full;
    }

    .template-preview {
      @apply relative mb-4 rounded-lg overflow-hidden bg-muted;
      @apply aspect-[3/4];
    }

    .preview-image {
      @apply w-full h-full object-cover;
    }

    .preview-placeholder {
      @apply w-full h-full flex flex-col items-center justify-center text-muted-foreground;
    }

    .preview-icon {
      @apply text-4xl mb-2;
    }

    .preview-text {
      @apply text-sm;
    }

    .template-badge {
      @apply absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium;
      @apply bg-background/80 backdrop-blur-sm border border-border;
    }

    .template-badge[data-audience="recruiter"] {
      @apply bg-blue-500/20 text-blue-400 border-blue-500/30;
    }

    .template-badge[data-audience="technical"] {
      @apply bg-green-500/20 text-green-400 border-green-500/30;
    }

    .template-badge[data-audience="executive"] {
      @apply bg-purple-500/20 text-purple-400 border-purple-500/30;
    }

    .template-badge[data-audience="creative"] {
      @apply bg-orange-500/20 text-orange-400 border-orange-500/30;
    }

    .template-info {
      @apply space-y-3 mb-4;
    }

    .compatibility-score {
      @apply flex items-center gap-3;
    }

    .score-bar {
      @apply flex-1 h-2 bg-muted rounded-full overflow-hidden;
    }

    .score-fill {
      @apply h-full transition-all duration-300;
    }

    .score-fill.high {
      @apply bg-green-500;
    }

    .score-fill.medium {
      @apply bg-yellow-500;
    }

    .score-fill.low {
      @apply bg-red-500;
    }

    .score-text {
      @apply text-sm font-medium text-foreground;
    }

    .template-features {
      @apply flex flex-wrap gap-2;
    }

    .feature-badge {
      @apply inline-flex items-center gap-1 px-2 py-1 rounded text-xs;
      @apply bg-gray-100 text-gray-700;
    }

    .feature-badge[data-category="design"] {
      @apply bg-purple-500/20 text-purple-400;
    }

    .feature-badge[data-category="layout"] {
      @apply bg-blue-500/20 text-blue-400;
    }

    .feature-badge[data-category="content"] {
      @apply bg-green-500/20 text-green-400;
    }

    .feature-badge[data-category="performance"] {
      @apply bg-orange-500/20 text-orange-400;
    }

    .generation-time {
      @apply flex items-center gap-2 text-sm text-muted-foreground;
    }

    .template-actions {
      @apply flex gap-2;
    }

    .action-button {
      @apply flex-1 px-3 py-2 rounded-lg text-sm font-medium;
      @apply border border-border bg-background text-foreground;
      @apply hover:bg-accent transition-colors;
      @apply disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .action-button.primary {
      @apply bg-primary text-white border-primary;
      @apply hover:bg-primary/90;
    }

    .comparison-view {
      @apply space-y-6;
    }

    .comparison-header {
      @apply flex items-center justify-between;
    }

    .comparison-header h3 {
      @apply text-2xl font-bold text-foreground;
    }

    .clear-comparison {
      @apply px-4 py-2 rounded-lg bg-destructive text-destructive-foreground;
      @apply hover:bg-destructive/90 transition-colors;
    }

    .comparison-grid {
      @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
    }

    .comparison-card {
      @apply bg-card border border-border rounded-lg overflow-hidden;
    }

    .comparison-preview {
      @apply aspect-[3/4] bg-muted;
    }

    .comparison-preview img {
      @apply w-full h-full object-cover;
    }

    .comparison-details {
      @apply p-4 space-y-4;
    }

    .comparison-details h4 {
      @apply text-lg font-semibold text-foreground;
    }

    .comparison-details p {
      @apply text-sm text-muted-foreground;
    }

    .comparison-metrics {
      @apply space-y-2;
    }

    .metric {
      @apply flex justify-between items-center;
    }

    .metric-label {
      @apply text-sm text-muted-foreground;
    }

    .metric-value {
      @apply text-sm font-medium text-foreground;
    }

    .comparison-action {
      @apply w-full px-4 py-2 rounded-lg bg-primary text-white;
      @apply hover:bg-primary/90 transition-colors;
    }

    .empty-state {
      @apply text-center py-16;
    }

    .empty-icon {
      @apply text-6xl text-muted-foreground mb-4;
    }

    .empty-state h3 {
      @apply text-xl font-semibold text-foreground mb-2;
    }

    .empty-state p {
      @apply text-muted-foreground mb-6;
    }

    .clear-filters-button {
      @apply px-6 py-2 rounded-lg bg-primary text-white;
      @apply hover:bg-primary/90 transition-colors;
    }
  `]
})
export class PDFTemplateGalleryComponent implements OnInit {

  // Injected services
  private readonly templateService = inject(PDFTemplateService);
  private readonly previewService = inject(PDFTemplatePreviewService);
  private readonly orchestrator = inject(PDFGenerationOrchestratorService);

  // Component state
  private readonly _isLoading = signal<boolean>(true);
  private readonly _selectedTemplateId = signal<string | null>(null);
  private readonly _comparisonMode = signal<boolean>(false);
  private readonly _comparisonTemplates = signal<string[]>([]);
  private readonly _searchTerm = signal<string>('');
  private readonly _selectedAudience = signal<string>('');
  private readonly _isGeneratingPDF = signal<boolean>(false);

  // Preview data
  private readonly _previews = signal<Map<string, TemplatePreviewResult>>(new Map());
  private readonly _compatibility = signal<Map<string, TemplateCompatibility>>(new Map());

  // Public readonly signals
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedTemplateId = this._selectedTemplateId.asReadonly();
  readonly comparisonMode = this._comparisonMode.asReadonly();
  readonly comparisonTemplates = this._comparisonTemplates.asReadonly();
  readonly isGeneratingPDF = this._isGeneratingPDF.asReadonly();
  readonly isGeneratingPreview = this.previewService.isGeneratingPreview;
  readonly currentPreviewTemplate = this.previewService.currentPreviewTemplate;

  // Template data
  readonly availableTemplates = this.templateService.availableTemplates;

  // Computed properties
  readonly filteredTemplates = computed(() => {
    const templates = this.availableTemplates();
    const searchTerm = this._searchTerm().toLowerCase();
    const selectedAudience = this._selectedAudience();

    return templates.filter(template => {
      // Search filter
      if (searchTerm && !template.name.toLowerCase().includes(searchTerm) &&
          !template.description.toLowerCase().includes(searchTerm)) {
        return false;
      }

      // Audience filter
      if (selectedAudience && template.targetAudience !== selectedAudience) {
        return false;
      }

      return true;
    });
  });

  // Form properties for template binding
  searchTerm = '';
  selectedAudience = '';

  private readonly _templatesReadyEffect = effect(() => {
    const templates = this.availableTemplates();
    // When templates become available for the first time, generate previews
    if (templates.length > 0 && this._previews().size === 0) {
      console.log('[PDFTemplateGallery] Templates available, generating previews...');
      // Fire and forget; effect cannot be async
      this.loadTemplatesAndPreviews();
    }
  });

  async ngOnInit() {
    try {
      this._isLoading.set(true);

      // Load templates and generate initial previews
      await this.loadTemplatesAndPreviews();

      // Load compatibility analysis
      await this.loadCompatibilityAnalysis();

    } catch (error) {
      console.error('Failed to initialize template gallery:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Load templates and generate previews
   */
  private async loadTemplatesAndPreviews(): Promise<void> {
    const templates = this.availableTemplates();
    console.log('Available templates:', templates);

    if (templates.length === 0) {
      console.warn('No templates available');
      return;
    }

    // Generate previews for all templates
    const templateIds = templates.map(t => t.id);
    console.log('Generating previews for template IDs:', templateIds);
    const previews = await this.previewService.generateMultiplePreviews(templateIds);
    console.log('Generated previews:', previews);

    this._previews.set(previews);
  }

  /**
   * Load compatibility analysis for all templates
   */
  private async loadCompatibilityAnalysis(): Promise<void> {
    try {
      const compatibilityAnalyses = await this.orchestrator.analyzeTemplateCompatibility();
      const compatibilityMap = new Map<string, TemplateCompatibility>();

      compatibilityAnalyses.forEach(analysis => {
        compatibilityMap.set(analysis.templateId, analysis);
      });

      this._compatibility.set(compatibilityMap);
    } catch (error) {
      console.error('Failed to load compatibility analysis:', error);
    }
  }

  /**
   * Select a template
   */
  selectTemplate(templateId: string): void {
    this._selectedTemplateId.set(templateId);
  }

  /**
   * Preview a specific template
   */
  async previewTemplate(templateId: string): Promise<void> {
    try {
      const result = await this.previewService.generatePreview(templateId, {
        quality: 'high',
        showContent: true
      });

      // Update previews map
      const currentPreviews = this._previews();
      currentPreviews.set(templateId, result);
      this._previews.set(new Map(currentPreviews));

    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  }

  /**
   * Generate PDF with selected template
   */
  async generatePDF(templateId: string): Promise<void> {
    try {
      this._isGeneratingPDF.set(true);
      this._selectedTemplateId.set(templateId);

      const result = await this.orchestrator.generatePDF({
        templateId,
        preferences: {
          prioritizeQuality: true,
          enableFallback: true,
          validateOutput: true
        }
      });

      // Download the PDF
      this.downloadPDF(result.pdfBlob, `CV_${templateId}_${Date.now()}.pdf`);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // TODO: Show error notification
    } finally {
      this._isGeneratingPDF.set(false);
    }
  }

  /**
   * Add template to comparison
   */
  addToComparison(templateId: string): void {
    const current = this._comparisonTemplates();
    if (!current.includes(templateId) && current.length < 3) {
      this._comparisonTemplates.set([...current, templateId]);
    }
  }

  /**
   * Remove template from comparison
   */
  removeFromComparison(templateId: string): void {
    const current = this._comparisonTemplates();
    this._comparisonTemplates.set(current.filter(id => id !== templateId));
  }

  /**
   * Toggle comparison mode
   */
  toggleComparisonMode(): void {
    this._comparisonMode.update(current => !current);
  }

  /**
   * Clear all comparisons
   */
  clearComparison(): void {
    this._comparisonTemplates.set([]);
    this._comparisonMode.set(false);
  }

  /**
   * Select template and generate PDF from comparison
   */
  async selectAndGenerate(templateId: string): Promise<void> {
    this.selectTemplate(templateId);
    await this.generatePDF(templateId);
  }

  /**
   * Handle search input change
   */
  onSearchChange(): void {
    this._searchTerm.set(this.searchTerm);
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this._selectedAudience.set(this.selectedAudience);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedAudience = '';
    this._searchTerm.set('');
    this._selectedAudience.set('');
  }

  /**
   * Get preview URL for template
   */
  getPreviewUrl(templateId: string): string | null {
    const preview = this._previews().get(templateId);
    return preview?.previewUrl || null;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): PDFTemplate | null {
    return this.availableTemplates().find(t => t.id === templateId) || null;
  }

  /**
   * Get compatibility score for template
   */
  getCompatibilityScore(templateId: string): number {
    const compatibility = this._compatibility().get(templateId);
    return compatibility?.compatibilityScore || 0;
  }

  /**
   * Get estimated generation time for template
   */
  getEstimatedTime(templateId: string): number {
    const compatibility = this._compatibility().get(templateId);
    return compatibility?.estimatedTime || 3000;
  }

  /**
   * Get template features
   */
  getTemplateFeatures(templateId: string): TemplateFeature[] {
    return this.previewService.getTemplateFeatures(templateId);
  }

  /**
   * Get score class for styling
   */
  getScoreClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  /**
   * Handle preview image load
   */
  onPreviewLoad(templateId: string): void {
    // Could track loading metrics here
    console.log(`Preview loaded for template: ${templateId}`);
  }

  /**
   * Handle preview image error
   */
  onPreviewError(templateId: string): void {
    console.error(`Failed to load preview for template: ${templateId}`);
    // Could trigger retry or show fallback
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
