import { Component, inject, computed } from '@angular/core';

import { CvDataService } from '../../services/cv-data.service';
import { ThemeService } from '../../services/theme.service';
import { ScrollAnimateDirective, InteractiveAnimateDirective } from '../../shared/utils/animations';

@Component({
  selector: 'app-projects',
  imports: [ScrollAnimateDirective, InteractiveAnimateDirective],
  template: `
    <!-- Projects Section -->
    <section id="projects" class="py-20 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-gradient-to-b from-background/50 to-background/40"></div>

      <div class="relative z-10 max-w-6xl mx-auto px-6">
        <!-- Section Header -->
        <div class="text-center mb-16" appScrollAnimate="fadeInUp">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Featured Projects
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Showcasing innovative solutions and technical achievements across various domains
          </p>
        </div>

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (project of projects(); track project.id; let i = $index) {
            <div class="glass-card p-6 group"
                 appScrollAnimate="fadeInUp"
                 [animationDelay]="i * 150"
                 appInteractiveAnimate="lift"
                 animationTrigger="hover">
              <!-- Project Header -->
              <div class="mb-4">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-xl font-semibold text-primary mb-2">
                    {{ project.name }}
                  </h3>
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    [class]="getStatusClass(project.status)"
                  >
                    {{ project.status }}
                  </span>
                </div>

                @if (project.category) {
                  <div class="text-sm text-muted-foreground mb-2">
                    {{ project.category }}
                  </div>
                }
              </div>

              <!-- Project Description -->
              <p class="text-muted-foreground mb-4 leading-relaxed">
                {{ project.description }}
              </p>

              <!-- Features -->
              @if (project.features && project.features.length > 0) {
                <div class="mb-4">
                  <h4 class="text-sm font-semibold text-foreground mb-2">Key Features:</h4>
                  <ul class="space-y-1">
                    @for (feature of project.features; track feature) {
                      <li class="text-sm text-muted-foreground flex items-start gap-2">
                        <svg class="w-3 h-3 mt-1 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        {{ feature }}
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Technologies -->
              @if (project.technologies.length > 0) {
                <div class="mb-6">
                  <h4 class="text-sm font-semibold text-foreground mb-2">Technologies:</h4>
                  <div class="flex flex-wrap gap-2">
                    @for (tech of project.technologies; track tech) {
                      <span class="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md hover:bg-secondary/20 hover:text-secondary transition-colors">
                        {{ tech }}
                      </span>
                    }
                  </div>
                </div>
              }

              <!-- Project Links -->
              <div class="flex gap-3">
                @if (project.url) {
                  <a
                    [href]="project.url"
                    target="_blank"
                    class="glass-card px-4 py-2 text-sm font-medium text-primary hover:text-primary-foreground hover:bg-primary/20 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <svg class="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Live Demo
                  </a>
                }

                @if (project.github) {
                  <a
                    [href]="project.github"
                    target="_blank"
                    class="glass-card px-4 py-2 text-sm font-medium text-accent hover:text-accent-foreground hover:bg-accent/20 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <svg class="w-4 h-4 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                }
              </div>

              <!-- Project Timeline (if available) -->
              @if (project.startDate || project.endDate) {
                <div class="mt-4 pt-4 border-t border-border/20">
                  <div class="text-xs text-muted-foreground flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v10a2 2 0 01-2 2H10a2 2 0 01-2-2V9"></path>
                    </svg>
                    @if (project.startDate) {
                      {{ formatDate(project.startDate) }}
                    }
                    @if (project.startDate && project.endDate) {
                      -
                    }
                    @if (project.endDate) {
                      {{ formatDate(project.endDate) }}
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Projects Summary -->
        <div class="mt-16 text-center">
          <div class="glass-card p-8 max-w-4xl mx-auto">
            <h3 class="text-2xl font-bold mb-4 text-foreground">
              Project Portfolio
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div class="text-3xl font-bold text-primary mb-2">{{ projects().length }}</div>
                <div class="text-sm text-muted-foreground">Total Projects</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-secondary mb-2">{{ getCompletedProjects() }}</div>
                <div class="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-accent mb-2">{{ getUniqueProjectTechnologies() }}</div>
                <div class="text-sm text-muted-foreground">Technologies</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-primary mb-2">{{ getActiveProjects() }}</div>
                <div class="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .status-completed {
      @apply bg-accent/20 text-accent;
    }

    .status-in-progress {
      @apply bg-primary/20 text-primary;
    }

    .status-planned {
      @apply bg-secondary/20 text-secondary;
    }
  `]
})
export class ProjectsComponent {
  private cvDataService = inject(CvDataService);
  private themeService = inject(ThemeService);

  readonly projects = this.cvDataService.projects;

  formatDate(date: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getCompletedProjects(): number {
    return this.projects().filter(p => p.status === 'completed').length;
  }

  getActiveProjects(): number {
    return this.projects().filter(p => p.status === 'in-progress').length;
  }

  getUniqueProjectTechnologies(): number {
    const allTechnologies = new Set<string>();
    this.projects().forEach(project => {
      project.technologies.forEach(tech => allTechnologies.add(tech));
    });
    return allTechnologies.size;
  }
}
