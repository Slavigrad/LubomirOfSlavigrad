import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvDataService } from '../../services/cv-data.service';
import { ThemeService } from '../../services/theme.service';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import { HeroPDFIntegrationService } from '../../services/hero-pdf-integration.service';
import { PDFGenerationOrchestratorService } from '../../services/pdf-generation-orchestrator.service';
import { PDFTemplatePreviewService } from '../../services/pdf-template-preview.service';
import { LazyImageDirective } from '../../shared/directives/lazy-image.directive';
import { PDFConfigurationComponent, PDFConfigurationState } from '../pdf-configuration/pdf-configuration.component';
import {UI_TEXT} from './hero.constants';
import { HERO_CONFIG as HERO_CFG } from './hero.configuration';
import { GlassModalComponent } from '../../shared/components/ui/glass-modal.component';


@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LazyImageDirective, PDFConfigurationComponent, GlassModalComponent],
  template: `
    <!-- Hero Section -->
    <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden" [style.background]="'url(/assets/images/slavigrad.png) center/cover no-repeat fixed'">
      <!-- Clean Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/80">
        <!-- Subtle Floating Elements -->
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
        <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div class="absolute top-1/2 right-1/3 w-32 h-32 bg-accent/5 rounded-full blur-2xl animate-float"></div>

        <!-- Subtle Grid Pattern -->
        <div class="absolute inset-0 bg-grid-pattern opacity-3"></div>
      </div>

      <!-- Hero Content Container -->
      <div class="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <!-- Main Content Layout -->
        <div class="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20">

          <!-- Profile Image Section -->
          <div class="flex-shrink-0 order-1 lg:order-1">
            <div class="relative group">
              <!-- Subtle Glow Ring -->
              <div class="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

              <!-- Profile Image Container -->
              <div class="relative">
                <img
                  [appLazyImage]="profileImageUrl()"
                  [alt]="personalInfo().name"
                  class="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full object-cover border-2 border-white/10 shadow-2xl group-hover:scale-[1.02] transition-all duration-500"
                  [lazyThreshold]="0.1"
                  [lazyEnableBlur]="true"
                  [lazyEnableFadeIn]="true"
                >

                <!-- Status Indicator -->
                <div class="absolute bottom-2 right-2 w-4 h-4 bg-accent rounded-full border-2 border-background shadow-lg"></div>
              </div>
            </div>
          </div>

          <!-- Text Content Section -->
          <div class="flex-1 text-center lg:text-left order-2 lg:order-2 max-w-2xl">
            <!-- Name -->
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text leading-tight">
              {{ personalInfo().name }}
            </h1>

            <!-- Title (above subtitle) -->
            @if (personalInfo().title) {
              <h2 class="text-xl md:text-2xl lg:text-3xl mb-2 font-semibold bg-gradient-to-r from-[#4A90FF] to-[#00D4AA] bg-clip-text text-transparent">
                {{ personalInfo().title }}
              </h2>
            }

            <!-- Subtitle -->
            @if (personalInfo().subtitle) {
              <h3 class="text-lg md:text-xl lg:text-2xl text-primary/80 mb-6 font-light tracking-wide">
                {{ personalInfo().subtitle }}
              </h3>
            } @else {
              <!-- Fallback to title if subtitle missing -->
              <h3 class="text-lg md:text-xl lg:text-2xl text-primary/80 mb-6 font-light tracking-wide">
                {{ personalInfo().title }}
              </h3>
            }

            <!-- Location -->
            <div class="flex items-center justify-center lg:justify-start gap-2 mb-8 text-muted-foreground">
              <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-lg">{{ personalInfo().location || 'Zürich, Switzerland' }}</span>
            </div>

            <!-- Summary -->
            <p class="text-lg text-muted-foreground/90 mb-8 leading-relaxed max-w-xl">
              {{ personalInfo().summary }}
            </p>

            <!-- Core Technologies -->
            @if (personalInfo().technologies && personalInfo().technologies!.length > 0) {
              <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
                <span class="text-sm font-medium text-muted-foreground/70 mr-2">Core Technologies:</span>
                @for (tech of personalInfo().technologies!; track tech) {
                  <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300 hover:scale-105 shadow-sm">
                    <svg class="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ tech }}
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Enhanced CTA Buttons with PDF Generation -->
        <div class="flex flex-col items-center mb-16">
          <!-- Primary Actions -->
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <!-- Main Download Button with Enhanced Features -->
            @if (FEATURES.pdfGeneration) {
            <div class="relative">
              <button
                class="group relative px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:bg-primary/90 hover:scale-105 shadow-lg hover:shadow-xl"
                [disabled]="!canGeneratePdf()"
                (click)="downloadCV()"
              >
                <span class="flex items-center gap-3">
                  @if (heroPdfState().isGenerating) {
                    <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {{ UI_TEXT.GENERATING_PDF }}
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    {{ UI_TEXT.DOWNLOAD_CV }}
                  }
                </span>
              </button>

              <!-- Progress Bar -->
              @if (heroPdfState().isGenerating && generationProgress() > 0) {
                <div class="absolute -bottom-1 left-0 right-0 h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-foreground transition-all duration-300 ease-out"
                    [style.width.%]="generationProgress()"
                  ></div>
                </div>
              }
            </div>
            }

            <!-- Center Circular Action Buttons -->
            <div class="flex items-center gap-3">
              @if (FEATURES.pdfTemplateSelector) {
              <button
                class="w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold hover:scale-110 transition-all duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ring-offset-2 ring-offset-background"
                (click)="toggleTemplateSelector()"
                [disabled]="heroPdfState().isGenerating"
                title="{{UI_TEXT.CHOOSE_TEMPLATE}}"
                aria-label="{{UI_TEXT.CHOOSE_TEMPLATE}}"
              >
                📄
              </button>
              }
              @if (FEATURES.pdfConfiguration) {
              <button
                class="w-12 h-12 bg-green-600 text-white rounded-full text-xl font-bold hover:scale-110 transition-all duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 ring-offset-2 ring-offset-background"
                (click)="toggleAdvancedOptions()"
                [disabled]="heroPdfState().isGenerating"
                title="{{UI_TEXT.PDF_CONFIGURATION}}"
                aria-label="{{UI_TEXT.PDF_CONFIGURATION}}"
              >
                ⚙️
              </button>
              }
            </div>

            <!-- Get In Touch Button -->
            @if (FEATURES.contact) {
            <button
              class="group px-8 py-4 bg-transparent border-2 border-accent text-accent rounded-lg font-semibold transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-105"
              (click)="scrollToContact()"
            >
              <span class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {{ UI_TEXT.GET_IN_TOUCH }}
              </span>
            </button>
            }
          </div>

          <!-- Secondary Action -->
          @if (FEATURES.portfolioDownload) {
          <button
            class="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm font-medium group"
            (click)="downloadFullWebsite()"
            [disabled]="isGeneratingPdf() || heroPdfState().isGenerating"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
              </svg>
              {{ UI_TEXT.DOWNLOAD_FULL_PORTFOLIO }}
            </span>
          </button>
          }
        </div>

        <!-- Template Selector Modal -->
        @if (FEATURES.pdfTemplateSelector) {

        <app-glass-modal
          [open]="showTemplateSelectorSignal()"
          (closed)="hideTemplateSelector()"
          size="xl"
          ariaLabel="Template selector"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold gradient-text">Choose PDF Template</h3>
            <button
              class="p-2 hover:bg-white/10 rounded-lg transition-colors"
              (click)="hideTemplateSelector()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Template Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            @for (templateId of availableTemplates(); track templateId) {
              <div
                class="relative group cursor-pointer border-2 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                [class.border-primary]="selectedTemplateSignal() === templateId"
                [class.border-white/10]="selectedTemplateSignal() !== templateId"
                [class.bg-primary/5]="selectedTemplateSignal() === templateId"
                [class.bg-white/5]="selectedTemplateSignal() !== templateId"
                (click)="selectTemplate(templateId)"
              >
                <!-- Template Preview -->
                <div class="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 overflow-hidden">
                  @if (getTemplatePreviewUrl(templateId); as previewUrl) {
                    <img
                      [src]="previewUrl"
                      [alt]="getTemplateDisplayName(templateId) + ' preview'"
                      class="w-full h-full object-cover"
                      (error)="onPreviewError(templateId)"
                    />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="w-12 h-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                  }
                </div>

                <!-- Template Info -->
                <div class="text-center">
                  <h4 class="font-semibold text-lg mb-1">{{ getTemplateDisplayName(templateId) }}</h4>
                  <p class="text-sm text-muted-foreground mb-3">{{ getTemplateDescription(templateId) }}</p>

                  <!-- Recommended Badge -->
                  @if (isTemplateRecommended(templateId)) {
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Recommended
                    </span>
                  }
                </div>

                <!-- Selection Indicator -->
                @if (selectedTemplateSignal() === templateId) {
                  <div class="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 justify-end">
            <button
              class="px-6 py-2 border border-white/20 text-muted-foreground rounded-lg hover:bg-white/10 transition-colors"
              (click)="hideTemplateSelector()"
            >
              Cancel
            </button>
            <button
              class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              (click)="downloadCVWithTemplate(selectedTemplateSignal())"
              [disabled]="heroPdfState().isGenerating"
            >
              Generate PDF
            </button>

          </div>
        </app-glass-modal>

        }

        <!-- PDF Configuration Modal -->
        @if (FEATURES.pdfConfiguration) {

        <app-glass-modal
          [open]="showAdvancedOptionsSignal()"
          (closed)="hideAdvancedOptions()"
          size="xl"
          ariaLabel="PDF configuration"
        >
          <app-pdf-configuration
            (configurationChanged)="onConfigurationChanged($event)"
            (pdfGenerated)="onPdfGenerated($event)"
          ></app-pdf-configuration>
        </app-glass-modal>

        }

        <!-- Error Notification -->

        @if (heroPdfState().error) {
          <div class="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex-1">
                <p class="text-sm text-red-300">{{ heroPdfState().error }}</p>
              </div>
              <button
                class="p-1 hover:bg-red-500/20 rounded transition-colors"
                (click)="clearErrors()"
              >
                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        }

        <!-- Success Notification -->
        @if (heroPdfState().downloadUrl && !heroPdfState().isGenerating) {
          <div class="max-w-md mx-auto mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div class="flex-1">
                <p class="text-sm text-green-300">PDF generated successfully!</p>
                <p class="text-xs text-green-400/80">Generation time: {{ heroPdfState().lastGenerationTime }}ms</p>
              </div>
            </div>
          </div>
        }

        <!-- Clean Social Links -->
        <div class="flex justify-center gap-6 mb-20">
          @if (personalInfo().linkedin) {
            <a
              [href]="personalInfo().linkedin"
              target="_blank"
              class="p-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn Profile"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          }

          @if (personalInfo().github) {
            <a
              [href]="personalInfo().github"
              target="_blank"
              class="p-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-secondary hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="GitHub Profile"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          }

          @if (personalInfo().website) {
            <a
              [href]="personalInfo().website"
              target="_blank"
              class="p-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-accent hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Personal Website"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
            </a>
          }

          @if (personalInfo().email) {
            <a
              [href]="'mailto:' + personalInfo().email"
              class="p-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Send Email"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </a>
          }
        </div>

        <!-- Clean Scroll Indicator -->
        @if (FEATURES.scrollIndicator) {
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            (click)="scrollToNextSection()"
            class="p-2 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/10 transition-all duration-300 animate-bounce hover:animate-none"
            aria-label="Scroll to next section"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </button>
        </div>
        }
      </div>
    </section>
  `,
  styles: [`
    /* Aurora Glass: Enhanced grid pattern with glow */
    .bg-grid-pattern {
      background-image:
        linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
      background-size: 60px 60px;
      /* Subtle glow on grid lines */
      filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.1));
    }

    /* Aurora Glass: Enhanced floating animations with rotation */
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) translateX(0px) rotate(0deg);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-15px) translateX(10px) rotate(5deg);
        opacity: 0.7;
      }
    }

    @keyframes float-delayed {
      0%, 100% {
        transform: translateY(0px) translateX(0px) rotate(0deg);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-12px) translateX(-8px) rotate(-5deg);
        opacity: 0.7;
      }
    }

    @keyframes float-slow {
      0%, 100% {
        transform: translateY(0px) translateX(0px) scale(1);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-10px) translateX(5px) scale(1.1);
        opacity: 0.7;
      }
    }

    .animate-float {
      animation: float 10s ease-in-out infinite;
    }

    .animate-float-delayed {
      animation: float-delayed 12s ease-in-out infinite;
    }

    .animate-float-slow {
      animation: float-slow 15s ease-in-out infinite;
    }

    /* Aurora Glass: Enhanced button styles with glow */
    .btn-primary {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
      /* Aurora Glass: Layered shadows with glow */
      box-shadow:
        0 4px 15px rgba(59, 130, 246, 0.4),
        0 8px 30px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .btn-primary:hover::before {
      left: 100%;
    }

    .btn-primary:hover {
      box-shadow:
        0 6px 20px rgba(59, 130, 246, 0.5),
        0 12px 40px rgba(59, 130, 246, 0.3),
        0 0 30px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      transform: translateY(-2px) scale(1.02);
    }

    /* Enhanced PDF Generation Styles */
    .template-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .template-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .progress-bar {
      background: linear-gradient(90deg,
        hsl(var(--primary)) 0%,
        hsl(var(--accent)) 50%,
        hsl(var(--primary)) 100%);
      animation: progress-shimmer 2s ease-in-out infinite;
    }

    @keyframes progress-shimmer {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .template-selector-backdrop {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .notification-slide-in {
      animation: slideInFromTop 0.3s ease-out;
    }

    @keyframes slideInFromTop {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .hero-content {
        padding: 1.5rem 1rem;
      }

      .template-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .hero-content {
        padding: 1rem 0.5rem;
      }

      .template-selector-modal {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }
    }
  `]
})
export class HeroComponent {
  private cvDataService = inject(CvDataService);
  private themeService = inject(ThemeService);
  private pdfGeneratorService = inject(PdfGeneratorService);
  private heroPdfService = inject(HeroPDFIntegrationService);
  private orchestrator = inject(PDFGenerationOrchestratorService);
  private previewService = inject(PDFTemplatePreviewService);

  constructor() {
    // Initialize template previews when component loads
    this.initializeTemplatePreviews();
  }

  // Legacy PDF generation state (for backward compatibility)
  readonly isGeneratingPdf = signal(false);

  // Enhanced PDF generation state
  readonly showAdvancedOptionsSignal = signal(false);
  readonly showTemplateSelectorSignal = signal(false);
  readonly selectedTemplateSignal = signal('glass-modern-template');

  // PDF Configuration state
  readonly currentConfiguration = signal<PDFConfigurationState | null>(null);

  readonly personalInfo = this.cvDataService.personalInfo;
  readonly profileImageUrl = computed(() => 'assets/images/lubomir_dobrovodsky.jpg');

  // Hero PDF Integration
  readonly heroPdfState = this.heroPdfService.state;
  readonly availableTemplates = this.heroPdfService.availableTemplates;
  readonly canGeneratePdf = this.heroPdfService.canGenerate;
  readonly generationProgress = this.heroPdfService.generationProgress;

  // Template previews
  readonly templatePreviews = signal<Map<string, string>>(new Map());

  async downloadCV(): Promise<void> {
    if (!this.canGeneratePdf()) return;

    try {
      // Use the enhanced PDF generation system
      const result = await this.heroPdfService.generateQuickPDF({
        templateId: this.selectedTemplateSignal(),
        quickMode: true,
        autoDownload: true,
        trackAnalytics: true
      });

      if (result) {
        console.log('CV PDF generated successfully with enhanced system');
      }
    } catch (error) {
      console.error('Error generating CV PDF:', error);
      // Show user-friendly error message
      this.showErrorNotification('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Download CV with specific template
   */
  async downloadCVWithTemplate(templateId: string): Promise<void> {
    if (!this.canGeneratePdf()) return;

    try {
      const result = await this.heroPdfService.generateWithTemplate(templateId, {
        autoDownload: true,
        trackAnalytics: true
      });

      if (result) {
        console.log(`CV PDF generated successfully with template: ${templateId}`);
        this.hideTemplateSelector();
      }
    } catch (error) {
      console.error('Error generating CV PDF with template:', error);
      this.showErrorNotification('Failed to generate PDF with selected template. Please try again.');
    }
  }

  async downloadFullWebsite(): Promise<void> {
    if (!this.canGeneratePdf()) return;

    try {
      this.isGeneratingPdf.set(true);

      // Get the main content element
      const mainElement = document.querySelector('main') as HTMLElement;
      if (!mainElement) {
        throw new Error('Main content element not found');
      }

      // Generate PDF from the entire website using legacy service for now
      await this.pdfGeneratorService.generateFromElement(mainElement, {
        format: 'a4',
        orientation: 'portrait',
        quality: 0.8,
        filename: 'Lubomir_Dobrovodsky_Portfolio.pdf'
      });

      console.log('Full website PDF generated successfully');
    } catch (error) {
      console.error('Error generating website PDF:', error);
      this.showErrorNotification('Failed to generate website PDF. Please try again.');
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }

  /**
   * Template selection methods
   */
  selectTemplate(templateId: string): void {
    this.selectedTemplateSignal.set(templateId);
    this.heroPdfService.selectTemplate(templateId);
  }

  showTemplateSelector(): void {
    this.showTemplateSelectorSignal.set(true);
  }

  hideTemplateSelector(): void {
    this.showTemplateSelectorSignal.set(false);
  }

  toggleTemplateSelector(): void {
    this.showTemplateSelectorSignal.set(!this.showTemplateSelectorSignal());
  }

  /**
   * Advanced options methods
   */
  showAdvancedOptions(): void {
    this.showAdvancedOptionsSignal.set(true);
  }

  hideAdvancedOptions(): void {
    this.showAdvancedOptionsSignal.set(false);
  }

  toggleAdvancedOptions(): void {
    this.showAdvancedOptionsSignal.set(!this.showAdvancedOptionsSignal());
  }

  scrollToContact(): void {
    const contactElement = document.getElementById('contact');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToNextSection(): void {
    const statsElement = document.getElementById('stats');
    if (statsElement) {
      statsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Utility methods
   */
  private showErrorNotification(message: string): void {
    // In a real app, this would show a toast notification
    // For now, using alert as fallback
    alert(message);
  }

  /**
   * Get template display name
   */
  getTemplateDisplayName(templateId: string): string {
    const templateNames: Record<string, string> = {
      'glass-modern-template': 'Glass Modern',
      'classic-professional': 'Classic Professional',
      'minimal-clean': 'Minimal Clean',
      'creative-bold': 'Creative Bold'
    };
    return templateNames[templateId] || templateId;
  }

  /**
   * Get template description
   */
  getTemplateDescription(templateId: string): string {
    const descriptions: Record<string, string> = {
      'glass-modern-template': 'Modern glass-morphism design with elegant transparency effects',
      'classic-professional': 'Traditional professional layout perfect for corporate environments',
      'minimal-clean': 'Clean and minimal design focusing on content clarity',
      'creative-bold': 'Bold and creative layout for design-focused roles'
    };
    return descriptions[templateId] || 'Professional CV template';
  }

  /**
   * Check if template is recommended
   */
  isTemplateRecommended(templateId: string): boolean {
    return templateId === 'glass-modern-template'; // Default recommendation
  }

  /**
   * Get template preview URL
   */
  getTemplatePreviewUrl(templateId: string): string | null {
    return this.templatePreviews().get(templateId) || null;
  }

  /**
   * Handle preview image error
   */
  onPreviewError(templateId: string): void {
    console.warn(`Failed to load preview for template: ${templateId}`);
  }

  /**
   * Initialize template previews
   */
  private async initializeTemplatePreviews(): Promise<void> {
    try {
      const templates = this.availableTemplates();
      if (templates.length === 0) {
        console.warn('No templates available for preview generation');
        return;
      }

      console.log('Generating previews for templates:', templates);
      const previews = await this.previewService.generateMultiplePreviews(templates, {
        quality: 'medium',
        showContent: true
      });

      // Convert preview results to URL map
      const previewUrls = new Map<string, string>();
      previews.forEach((result, templateId) => {
        if (result.previewUrl) {
          previewUrls.set(templateId, result.previewUrl);
        }
      });

      this.templatePreviews.set(previewUrls);
      console.log('Template previews initialized:', previewUrls.size);
    } catch (error) {
      console.error('Failed to initialize template previews:', error);
    }
  }

  /**
   * Clear any error states
   */
  clearErrors(): void {
    this.heroPdfService.clearError();
  }

  /**
   * Handle configuration changes from the PDF configuration panel
   */
  onConfigurationChanged(config: PDFConfigurationState): void {
    this.currentConfiguration.set(config);
    console.log('PDF Configuration updated:', config);
  }

  /**
   * Handle PDF generation completion from configuration panel
   */
  onPdfGenerated(pdfBlob: Blob): void {
    console.log('PDF generated with custom configuration:', pdfBlob.size, 'bytes');
    // The download is handled by the configuration component
    // We could add analytics tracking here if needed
  }

  readonly FEATURES = HERO_CFG.features;
  protected readonly UI_TEXT = UI_TEXT;
}
