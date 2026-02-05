import { Component, inject, signal } from '@angular/core';

import { CvDataService } from '../../services/cv-data.service';
import { ThemeService } from '../../services/theme.service';
import { ScrollAnimateDirective, InteractiveAnimateDirective } from '../../shared/utils/animations';
import { TechnologyListComponent } from '../../shared/components/ui/technology-list.component';
import { GlassModalComponent } from '../../shared/components/ui/glass-modal.component';

import { STATS_CONTENT } from '../../shared/constants/stats-content.constants';

import { EXPERIENCE_TEXT as EXP_TEXT, EXPERIENCE_CLASSES as EXP_CLASSES, EXPERIENCE_ICONS as EXP_ICONS } from './experience.constants';
import { EXPERIENCE_CONFIG as EXP_CONFIG } from './experience.configuration';


@Component({
  selector: 'app-experience',
  imports: [ScrollAnimateDirective, InteractiveAnimateDirective, TechnologyListComponent, GlassModalComponent],
  template: `
    <!-- Experience Section -->
    <section id="experience" class="py-20 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-gradient-to-b from-background/40 to-background/50"></div>

      <div class="relative z-10 max-w-6xl mx-auto px-6">
        <!-- Section Header -->
        <div class="text-center mb-16" appScrollAnimate="fadeInUp">
          <h2 class="text-3xl md:text-4xl font-bold mb-3 gradient-text">
            {{ UI.SECTION_TITLE }}
          </h2>
          <div class="max-w-2xl mx-auto text-center text-muted-foreground">
            <p class="text-sm mb-4">{{ UI.SUMMARY_LINE }}</p>
            <div class="flex items-center justify-center gap-3">
              <button
                [class]="CLASSES.toolbarButton"
                (click)="expandAll()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.PLUS"/>
                </svg>
                {{ UI.BUTTONS.EXPAND_ALL }}
              </button>
              <button
                [class]="CLASSES.toolbarButton"
                (click)="collapseAll()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.MINUS"/>
                </svg>
                {{ UI.BUTTONS.COLLAPSE_ALL }}
              </button>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="relative">
          <!-- Timeline Line -->
          <div class="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent"></div>

          <!-- Experience Summary -->
          <div class="mb-16 text-center" appScrollAnimate="fadeInUp">
            <div class="glass-card p-8 max-w-4xl mx-auto" appInteractiveAnimate="lift" [animationTrigger]="CONFIG.animations.interactionTrigger">
              <h3 class="text-2xl font-bold mb-4 text-foreground">
                {{ STATS.SECTION_TITLES.CAREER_HIGHLIGHTS }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div appScrollAnimate="fadeInUp" [animationDelay]="CONFIG.animations.summaryDelays[0]">
                  <div class="text-3xl font-bold mb-2" [style.color]="'hsl(var(--orange))'">{{ totalProjectsDelivered() }}+</div>
                  <div class="text-sm text-muted-foreground">{{ UI.SUMMARY_LABELS.PROJECTS_DELIVERED }}</div>
                </div>
                <div appScrollAnimate="fadeInUp" [animationDelay]="CONFIG.animations.summaryDelays[1]">
                  <div class="text-3xl font-bold text-primary mb-2">{{ totalExperienceYears() }}+</div>
                  <div class="text-sm text-muted-foreground">{{ UI.SUMMARY_LABELS.YEARS_OF_EXPERIENCE }}</div>
                </div>
                <div appScrollAnimate="fadeInUp" [animationDelay]="CONFIG.animations.summaryDelays[2]">
                  <div class="text-3xl font-bold text-secondary mb-2">{{ totalCompanies() }}</div>
                  <div class="text-sm text-muted-foreground">{{ UI.SUMMARY_LABELS.COMPANIES_WORKED }}</div>
                </div>
                <div appScrollAnimate="fadeInUp" [animationDelay]="CONFIG.animations.summaryDelays[3]">
                  <div class="text-3xl font-bold text-accent mb-2">{{ getTotalTechnologies() }}</div>
                  <div class="text-sm text-muted-foreground">{{ UI.SUMMARY_LABELS.TECHNOLOGIES_USED }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Experience Items -->
          <div class="space-y-12">
            @for (experience of experiences(); track experience.id; let i = $index) {
              <div
                class="relative flex flex-col md:flex-row items-start"
                [class]="i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
                appScrollAnimate="fadeInUp"
                [animationDelay]="i * CONFIG.animations.sectionBaseDelay"
              >
                <!-- Timeline Dot -->
                <div class="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background z-10"
                     [class]="experience.current ? 'bg-primary animate-pulse' : 'bg-muted'"
                     appScrollAnimate="zoomIn"
                     [animationDelay]="i * CONFIG.animations.sectionBaseDelay + CONFIG.animations.timelineDotOffset">
                </div>

                <!-- Content Card -->
                <div
                  class="ml-16 md:ml-0 md:w-5/12 glass-card p-6 group"
                  [class]="i % 2 === 0 ? 'md:mr-auto md:ml-0' : 'md:ml-auto md:mr-0'"
                  appInteractiveAnimate="lift"
                  [animationTrigger]="CONFIG.animations.interactionTrigger"
                >
                  <!-- Header (Company level) -->
                  <div class="mb-4">
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <div class="company-name" [class]="getCompanyColorClass(i)">
                        <span class="company-icon">🏢</span>
                        <span class="company-text">{{ experience.company }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          [class]="CLASSES.readButton"
                          (click)="openExperienceDetails(experience); $event.stopPropagation()"
                          [attr.title]="UI.ARIA.VIEW_DETAILS"
                          [attr.aria-label]="UI.ARIA.VIEW_DETAILS"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.SEARCH"/>
                          </svg>
                          {{ UI.BUTTONS.READ }}
                        </button>
                        <button
                          [class]="CLASSES.toggleButton"
                          (click)="toggleCompany(experience.id)"
                          [attr.aria-expanded]="isCompanyExpanded(experience.id)"
                        >
                          <svg class="w-4 h-4 transition-transform" [class.rotate-180]="!isCompanyExpanded(experience.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.CHEVRON_DOWN"/>
                          </svg>
                          {{ isCompanyExpanded(experience.id) ? UI.BUTTONS.COLLAPSE : UI.BUTTONS.EXPAND }}
                        </button>
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-4 text-sm">
                      <span class="location-badge" [class]="getLocationColorClass(i)">
                        <svg class="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.LOCATION_PIN_OUTER"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.LOCATION_PIN_INNER"></path>
                        </svg>
                        <span class="location-text">{{ experience.location }}</span>
                      </span>
                      <span class="duration-badge">
                        <svg class="duration-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.DURATION"></path>
                        </svg>
                        <span class="duration-text">
                          {{ formatDate(getOverallStart(experience)) }} -
                          {{ isCurrentExperience(experience) ? UI.LABELS.PRESENT : formatDate(getOverallEnd(experience)!) }}
                        </span>
                      </span>
                      @if (isCurrentExperience(experience)) {
                        <span [class]="CLASSES.currentBadge">{{ UI.LABELS.CURRENT }}</span>
                      }
                    </div>
                  </div>

                  <!-- Positions (collapsible) -->
                  @if (isCompanyExpanded(experience.id)) {
                    <div class="space-y-5">
                      @for (position of getPositions(experience); track $index; let pi = $index) {
                        <div class="border border-border/10 rounded-lg overflow-hidden">
                          <!-- Position header row -->
                          <div class="p-4">
                            <div class="flex items-start justify-between gap-3">
                              <div class="min-w-0 flex-1">
                                <h4 class="text-lg font-semibold text-foreground mb-1">{{ position.title }}</h4>
                                @if (position.role && position.role !== position.title) {
                                  <div class="text-sm text-muted-foreground mb-1">{{ position.role }}</div>
                                }
                                <div class="text-sm text-muted-foreground">
                                  {{ formatDate(position.startDate) }} - {{ position.endDate ? formatDate(position.endDate) : UI.LABELS.PRESENT }}
                                  @if (position.teamSize) {
                                    <span class="ml-2">• {{ UI.LABELS.TEAM }}: {{ position.teamSize }}</span>
                                  }
                                </div>
                              </div>
                              <button
                                [class]="CLASSES.positionToggleButton"
                                (click)="togglePosition(experience.id, pi)"
                                [attr.aria-expanded]="isPositionExpanded(experience.id, pi)"
                              >
                                <svg class="w-3 h-3 transition-transform" [class.rotate-180]="!isPositionExpanded(experience.id, pi)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.CHEVRON_DOWN"/>
                                </svg>
                                {{ isPositionExpanded(experience.id, pi) ? UI.BUTTONS.HIDE : UI.BUTTONS.SHOW }}
                              </button>
                            </div>
                          </div>

                          <!-- Position content (collapsible) -->
                          @if (isPositionExpanded(experience.id, pi)) {
                            <div class="px-4 pb-4">
                              <!-- Description -->
                              @if (position.description) {
                                <div class="mt-3">
                                  <h5 class="text-sm font-semibold mb-2">{{ UI.HEADINGS.DESCRIPTION }}</h5>
                                  <p class="text-sm text-muted-foreground leading-relaxed">{{ position.description }}</p>
                                </div>
                              }

                              <!-- Technologies -->
                              @if (position.technologies?.length) {
                                <div class="mt-4">
                                  <h5 class="text-sm font-semibold mb-2">{{ UI.HEADINGS.TECHNOLOGIES }}</h5>
                                  <app-technology-list [technologies]="position.technologies"
                                    [showPreview]="CONFIG.preview.showPreview"
                                    [previewCount]="CONFIG.preview.techListCard"
                                    variant="default" />
                                </div>
                              }

                              <!-- Responsibilities -->
                              @if (position.responsibilities?.length) {
                                <div class="mt-4">
                                  <h5 class="text-sm font-semibold mb-2">{{ UI.HEADINGS.RESPONSIBILITIES }}</h5>
                                  <ul class="space-y-1">
                                    @for (item of position.responsibilities; track item) {
                                      <li class="text-sm text-muted-foreground flex gap-2">
                                        <svg class="w-3 h-3 mt-1 text-secondary" fill="currentColor" viewBox="0 0 20 20"><path [attr.d]="ICONS.CHECK_CIRCLE" fill-rule="evenodd" clip-rule="evenodd"/></svg>
                                        {{ item }}
                                      </li>
                                    }
                                  </ul>
                                </div>
                              }

                              <!-- Achievements -->
                              @if (position.achievements?.length) {
                                <div class="mt-4">
                                  <h5 class="text-sm font-semibold mb-2">{{ UI.HEADINGS.ACHIEVEMENTS }}</h5>
                                  <ul class="space-y-1">
                                    @for (ach of position.achievements; track ach) {
                                      <li class="text-sm text-foreground flex gap-2">
                                        <svg class="w-3 h-3 mt-1 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                        {{ ach }}
                                      </li>
                                    }
                                  </ul>
                                </div>
                              }

                              <!-- Projects -->
                              @if (position.projects?.length) {
                                <div class="mt-4">
                                  <h5 class="text-sm font-semibold mb-2">{{ UI.HEADINGS.PROJECTS }}</h5>
                                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    @for (p of position.projects; track p.name) {
                                      <div class="p-3 rounded-lg border border-border/20 bg-muted/20">
                                        <div class="text-sm font-semibold">{{ p.name }}</div>
                                        <div class="text-xs text-muted-foreground mt-0.5">{{ p.duration }}</div>
                                        <div class="text-xs text-muted-foreground mt-1">{{ p.description }}</div>
                                      </div>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      @if (showExperienceModal() && selectedExperience(); as exp) {
        <app-glass-modal [open]="true" [size]="CONFIG.modal.size" (closed)="closeExperienceDetails()" [closeOnBackdrop]="CONFIG.modal.closeOnBackdrop">
          <div class="flex items-start justify-between mb-6">
            <h3 class="text-3xl md:text-4xl font-extrabold gradient-text">{{ exp.company }}</h3>
            <button class="p-2 hover:bg-white/10 rounded-lg transition-colors" (click)="closeExperienceDetails()" aria-label="Close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.CLOSE_X"></path>
              </svg>
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-base mb-6">
            <span class="location-badge" [class]="getLocationColorClass(0)">
              <svg class="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.LOCATION_PIN_OUTER"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.LOCATION_PIN_INNER"></path>
              </svg>
              <span class="location-text">{{ exp.location }}</span>
            </span>
            <span class="duration-badge">
              <svg class="duration-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="ICONS.DURATION"></path>
              </svg>
              <span class="duration-text">
                {{ formatDate(getOverallStart(exp)) }} - {{ isCurrentExperience(exp) ? UI.LABELS.PRESENT : formatDate(getOverallEnd(exp)!) }}
              </span>
            </span>
          </div>

          <div class="space-y-6">
            @for (position of getPositions(exp); track $index) {
              <div class="p-5 md:p-6 rounded-xl border border-border/20 bg-background/60">
                <div class="min-w-0">
                  <div class="text-xl md:text-2xl font-semibold mb-1">{{ position.title }}</div>
                  @if (position.role && position.role !== position.title) {
                    <div class="text-sm md:text-base text-muted-foreground mb-1">{{ position.role }}</div>
                  }
                  <div class="text-sm md:text-base text-muted-foreground">
                    {{ formatDate(position.startDate) }} - {{ position.endDate ? formatDate(position.endDate) : UI.LABELS.PRESENT }}
                    @if (position.teamSize) { <span class="ml-2">• {{ UI.LABELS.TEAM }}: {{ position.teamSize }}</span> }
                  </div>
                </div>

                @if (position.description) {
                  <div class="mt-4">
                    <h5 class="text-sm md:text-base font-semibold mb-2">{{ UI.HEADINGS.DESCRIPTION }}</h5>
                    <p class="text-sm md:text-base text-muted-foreground leading-relaxed">{{ position.description }}</p>
                  </div>
                }

                @if (position.technologies?.length) {
                  <div class="mt-4">
                    <h5 class="text-sm md:text-base font-semibold mb-2">{{ UI.HEADINGS.TECHNOLOGIES }}</h5>
                    <app-technology-list [technologies]="position.technologies" [showPreview]="CONFIG.preview.showPreview" [previewCount]="CONFIG.preview.techListModal" variant="default" />
                  </div>
                }

                @if (position.responsibilities?.length) {
                  <div class="mt-4">
                    <h5 class="text-sm md:text-base font-semibold mb-2">{{ UI.HEADINGS.RESPONSIBILITIES }}</h5>
                    <ul class="space-y-1">
                      @for (item of position.responsibilities; track item) {
                        <li class="text-sm md:text-base text-muted-foreground flex gap-2">
                          <svg class="w-3 h-3 mt-1 text-secondary" fill="currentColor" viewBox="0 0 20 20"><path [attr.d]="ICONS.CHECK_CIRCLE" fill-rule="evenodd" clip-rule="evenodd"/></svg>
                          {{ item }}
                        </li>
                      }
                    </ul>
                  </div>
                }

                @if (position.achievements?.length) {
                  <div class="mt-4">
                    <h5 class="text-sm md:text-base font-semibold mb-2">{{ UI.HEADINGS.ACHIEVEMENTS }}</h5>
                    <ul class="space-y-1">
                      @for (ach of position.achievements; track ach) {
                        <li class="text-sm md:text-base text-foreground flex gap-2">
                          <svg class="w-3 h-3 mt-1 text-accent" fill="currentColor" viewBox="0 0 20 20"><path [attr.d]="ICONS.CHECK_CIRCLE" fill-rule="evenodd" clip-rule="evenodd"/></svg>
                          {{ ach }}
                        </li>
                      }
                    </ul>
                  </div>
                }

                @if (position.projects?.length) {
                  <div class="mt-4">
                    <h5 class="text-sm md:text-base font-semibold mb-2">{{ UI.HEADINGS.PROJECTS }}</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      @for (p of position.projects; track p.name) {
                        <div class="p-3 rounded-lg border border-border/20 bg-muted/20">
                          <div class="text-sm md:text-base font-semibold">{{ p.name }}</div>
                          <div class="text-xs md:text-sm text-muted-foreground mt-0.5">{{ p.duration }}</div>
                          <div class="text-xs md:text-sm text-muted-foreground mt-1">{{ p.description }}</div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </app-glass-modal>
      }

    </section>
  `,
  styles: [`
    /* Aurora Glass: Timeline Enhancements */
    .timeline-dot-current {
      background: hsl(var(--primary));
      box-shadow:
        0 0 20px hsl(var(--primary) / 0.6),
        0 0 40px hsl(var(--primary) / 0.3);
      animation: pulse-glow 2s ease-in-out infinite;
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow:
          0 0 20px hsl(var(--primary) / 0.6),
          0 0 40px hsl(var(--primary) / 0.3);
      }
      50% {
        box-shadow:
          0 0 30px hsl(var(--primary) / 0.8),
          0 0 60px hsl(var(--primary) / 0.4);
      }
    }

    .timeline-dot-past {
      background: hsl(var(--muted));
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    /* Aurora Glass: Technology Badge Styles */
    .tech-badge {
      @apply inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full;
      @apply transition-all duration-300 ease-out cursor-default;
      @apply border border-transparent;
      /* Aurora Glass effect */
      backdrop-filter: blur(8px) saturate(180%);
      -webkit-backdrop-filter: blur(8px) saturate(180%);
      @apply hover:scale-105;
    }

    .tech-icon {
      @apply text-sm leading-none;
    }

    .tech-name {
      @apply font-semibold tracking-wide;
    }

    /* Aurora Glass: Technology Category Colors */
    .tech-badge-primary {
      @apply bg-gradient-to-r from-primary/20 to-primary/30;
      @apply text-primary border-primary/40;
      @apply hover:from-primary/30 hover:to-primary/40;
      @apply hover:border-primary/60 hover:text-primary;
      box-shadow:
        0 2px 8px hsl(var(--primary) / 0.3),
        0 4px 16px hsl(var(--primary) / 0.15);
    }

    .tech-badge-primary:hover {
      box-shadow:
        0 4px 12px hsl(var(--primary) / 0.4),
        0 8px 24px hsl(var(--primary) / 0.2);
    }

    .tech-badge-secondary {
      @apply bg-gradient-to-r from-secondary/20 to-secondary/30;
      @apply text-secondary border-secondary/40;
      @apply hover:from-secondary/30 hover:to-secondary/40;
      @apply hover:border-secondary/60 hover:text-secondary;
      box-shadow:
        0 2px 8px hsl(var(--secondary) / 0.3),
        0 4px 16px hsl(var(--secondary) / 0.15);
    }

    .tech-badge-secondary:hover {
      box-shadow:
        0 4px 12px hsl(var(--secondary) / 0.4),
        0 8px 24px hsl(var(--secondary) / 0.2);
    }

    .tech-badge-accent {
      @apply bg-gradient-to-r from-accent/20 to-accent/30;
      @apply text-accent border-accent/40;
      @apply hover:from-accent/30 hover:to-accent/40;
      @apply hover:border-accent/60 hover:text-accent;
      box-shadow:
        0 2px 8px hsl(var(--accent) / 0.3),
        0 4px 16px hsl(var(--accent) / 0.15);
    }

    .tech-badge-accent:hover {
      box-shadow:
        0 4px 12px hsl(var(--accent) / 0.4),
        0 8px 24px hsl(var(--accent) / 0.2);
    }


    /* Responsive adjustments */


    @media (max-width: 768px) {
      .timeline-line {
        left: 2rem;
      }

      .timeline-dot {
        left: 2rem;
      }


      .tech-badge {
        @apply px-2 py-1 text-xs gap-1;
      }

      .tech-icon {
        @apply text-xs;
      }
    }


    /* Aurora Glass: Company Name Styles with Micro-Glow */
    .company-name {
      @apply inline-flex items-center gap-2 text-lg font-bold;
      @apply transition-all duration-300 ease-out;
      @apply hover:scale-105 cursor-default;
      letter-spacing: 0.5px;
    }

    .company-icon {
      @apply text-lg;
      filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
    }

    .company-text {
      @apply font-bold tracking-wide;
    }

    .company-primary .company-text {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      /* Aurora Glass: Micro-glow */
      text-shadow: 0 0 6px rgba(74, 144, 255, 0.4);
    }

    .company-secondary .company-text {
      background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--secondary-glow)));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      /* Aurora Glass: Micro-glow */
      text-shadow: 0 0 6px rgba(184, 79, 255, 0.4);
    }

    .company-accent .company-text {
      background: linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-glow)));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      /* Aurora Glass: Micro-glow */
      text-shadow: 0 0 6px rgba(0, 212, 170, 0.4);
    }




    /* Aurora Glass: Location Badge Styles */
    .location-badge {
      @apply inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full;
      @apply transition-all duration-300 ease-out cursor-default;
      @apply border;
      /* Aurora Glass effect */
      backdrop-filter: blur(8px) saturate(180%);
      -webkit-backdrop-filter: blur(8px) saturate(180%);
      @apply hover:scale-105;
    }

    .location-icon {
      @apply w-4 h-4;
    }

    .location-text {
      @apply font-semibold tracking-wide;
    }

    .location-primary {
      @apply bg-gradient-to-r from-primary/15 to-primary/25;
      @apply text-primary border-primary/30;
      box-shadow: 0 2px 8px hsl(var(--primary) / 0.2);
    }

    .location-primary:hover {
      box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
    }

    .location-secondary {
      @apply bg-gradient-to-r from-secondary/15 to-secondary/25;
      @apply text-secondary border-secondary/30;
      box-shadow: 0 2px 8px hsl(var(--secondary) / 0.2);
    }

    .location-secondary:hover {
      box-shadow: 0 4px 12px hsl(var(--secondary) / 0.3);
    }

    .location-accent {
      @apply bg-gradient-to-r from-accent/15 to-accent/25;
      @apply text-accent border-accent/30;
      box-shadow: 0 2px 8px hsl(var(--accent) / 0.2);
    }

    .location-accent:hover {
      box-shadow: 0 4px 12px hsl(var(--accent) / 0.3);
    }


    /* Duration Badge Styles */
    .duration-badge {
      @apply inline-flex items-center gap-1.5 px-2 py-1 text-sm;
      @apply text-muted-foreground transition-colors duration-300;
      @apply hover:text-foreground;
    }

    .duration-icon {
      @apply w-4 h-4;
    }

    .duration-text {
      @apply font-medium;
    }


  `]
})
export class ExperienceComponent {
  private cvDataService = inject(CvDataService);
  private themeService = inject(ThemeService);

  // Extracted constants/config for template access
  readonly UI = EXP_TEXT;
  readonly CLASSES = EXP_CLASSES;
  readonly ICONS = EXP_ICONS;
  readonly CONFIG = EXP_CONFIG;

  // Constants
  readonly STATS = STATS_CONTENT;

  // Data signals
  readonly experiences = this.cvDataService.experiences;
  readonly totalExperienceYears = this.cvDataService.totalExperienceYears;
  readonly totalProjectsDelivered = this.cvDataService.totalProjectsDelivered;
  readonly totalCompanies = this.cvDataService.totalCompanies;

  // Hierarchical collapse state management
  private readonly companyStates = signal<Map<string, boolean>>(new Map());
  private readonly positionStates = signal<Map<string, Map<number, boolean>>>(new Map());

  // Company-level collapse/expand
  isCompanyExpanded(expId: string): boolean {
    const states = this.companyStates();
    return states.get(expId) ?? this.CONFIG.defaults.companyExpanded; // default from config
  }

  toggleCompany(expId: string) {
    const states = new Map(this.companyStates());
    states.set(expId, !this.isCompanyExpanded(expId));
    this.companyStates.set(states);
  }

  // Experience detail modal state
  readonly showExperienceModal = signal<boolean>(false);
  readonly selectedExperience = signal<any | null>(null);

  openExperienceDetails(exp: any): void {
    this.selectedExperience.set(exp);
    this.showExperienceModal.set(true);
  }

  closeExperienceDetails(): void {
    this.showExperienceModal.set(false);
    this.selectedExperience.set(null);
  }

  // Position-level collapse/expand
  isPositionExpanded(expId: string, posIndex: number): boolean {
    const states = this.positionStates();
    const companyPositions = states.get(expId);
    return companyPositions?.get(posIndex) ?? this.CONFIG.defaults.positionExpanded; // default from config
  }

  togglePosition(expId: string, posIndex: number) {
    const states = new Map(this.positionStates());
    if (!states.has(expId)) {
      states.set(expId, new Map());
    }
    const companyPositions = states.get(expId)!;
    companyPositions.set(posIndex, !this.isPositionExpanded(expId, posIndex));
    this.positionStates.set(states);
  }

  // Global controls
  expandAll() {
    const experiences = this.experiences();
    const companyStates = new Map<string, boolean>();
    const positionStates = new Map<string, Map<number, boolean>>();

    experiences.forEach(exp => {
      companyStates.set(exp.id, true);
      const positions = this.getPositions(exp);
      const posMap = new Map<number, boolean>();
      positions.forEach((_, index) => posMap.set(index, true));
      positionStates.set(exp.id, posMap);
    });

    this.companyStates.set(companyStates);
    this.positionStates.set(positionStates);
  }

  collapseAll() {
    const experiences = this.experiences();
    const companyStates = new Map<string, boolean>();
    const positionStates = new Map<string, Map<number, boolean>>();

    experiences.forEach(exp => {
      companyStates.set(exp.id, false);
      const positions = this.getPositions(exp);
      const posMap = new Map<number, boolean>();
      positions.forEach((_, index) => posMap.set(index, false));
      positionStates.set(exp.id, posMap);
    });

    this.companyStates.set(companyStates);
    this.positionStates.set(positionStates);
  }



  formatDate(date: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  getTotalTechnologies(): number {
    const allTechnologies = new Set<string>();
    this.experiences().forEach(exp => {
      this.getPositions(exp).forEach(pos => pos.technologies?.forEach((t: string) => allTechnologies.add(t)));
      // legacy fallback
      (exp as any).technologies?.forEach((t: string) => allTechnologies.add(t));
    });
    return allTechnologies.size;
  }

  getTechnologyCategory(technology: string): { color: string; icon: string } {
    for (const [categoryName, category] of Object.entries(this.CONFIG.technologyCategories)) {
      if (category.technologies.some(tech =>
        tech.toLowerCase() === technology.toLowerCase() ||
        technology.toLowerCase().includes(tech.toLowerCase()) ||
        tech.toLowerCase().includes(technology.toLowerCase())
      )) {
        return { color: category.color, icon: category.icon };
      }
    }
    // Default category for unknown technologies
    return this.CONFIG.technologyCategoryFallback;
  }

  getTechnologyColorClass(technology: string): string {
    const category = this.getTechnologyCategory(technology);
    return `tech-badge-${category.color}`;
  }

  getCompanyColorClass(index: number): string {
    const colors = this.CONFIG.colors.companyCycle as readonly string[];
    return `company-${colors[index % colors.length]}`;
  }


  // Utilities for enhanced Experience model with backward compatibility
  getPositions(exp: any): any[] {
    if (Array.isArray(exp?.positions) && exp.positions.length > 0) return exp.positions;
    // Legacy fallback: build a single position from legacy fields
    return [{
      title: exp.position || exp.title || 'Role',
      role: exp.role,
      startDate: exp.startDate || exp.overallStartDate,
      endDate: exp.endDate || exp.overallEndDate,
      description: exp.description,
      technologies: exp.technologies || [],
      responsibilities: exp.responsibilities || [],
      achievements: exp.achievements || [],
      projects: exp.projects || [],
      teamSize: exp.teamSize
    }];
  }

  getOverallStart(exp: any): Date {
    return exp.overallStartDate || this.getPositions(exp)[0]?.startDate || exp.startDate;
  }

  getOverallEnd(exp: any): Date | null {
    if (exp.overallEndDate != null) return exp.overallEndDate;
    const positions = this.getPositions(exp);
    const last = positions[positions.length - 1];
    return last?.endDate ?? exp.endDate ?? null;
  }

  isCurrentExperience(exp: any): boolean {
    const end = this.getOverallEnd(exp);
    return end === null || end === undefined || (exp as any).current === true;
  }

  getLocationColorClass(index: number): string {
    const colors = this.CONFIG.colors.locationCycle as readonly string[];
    return `location-${colors[index % colors.length]}`;
  }
}
