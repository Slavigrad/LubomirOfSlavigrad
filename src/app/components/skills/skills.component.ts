import { Component, inject, computed, signal, ViewChildren, QueryList } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { CvDataService } from '../../services/cv-data.service';
import { Skill } from '../../models/cv-data.interface';
import { ThemeService } from '../../services/theme.service';
import { ScrollAnimateDirective, InteractiveAnimateDirective } from '../../shared/utils/animations';
import { CollapseComponent } from '../../shared/components/ui/collapse.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, ScrollAnimateDirective, InteractiveAnimateDirective, CollapseComponent],
  template: `
    <!-- Skills Section -->
    <section id="skills" class="py-20 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-gradient-to-b from-background to-background/95"></div>

      <div class="relative z-10 max-w-6xl mx-auto px-6">
        <!-- Section Header -->
        <div class="text-center mb-16" appScrollAnimate="fadeInUp">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Technical Expertise ( Skills )
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Comprehensive skill set across modern development technologies and methodologies
          </p>

          <!-- Accordion Controls -->
          <div class="flex items-center justify-center gap-3">
            <button
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/30 transition text-sm font-medium"
              (click)="expandAllSkills()"
              appInteractiveAnimate="scale"
              animationTrigger="click"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Expand All Categories
            </button>
            <button
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/30 transition text-sm font-medium"
              (click)="collapseAllSkills()"
              appInteractiveAnimate="scale"
              animationTrigger="click"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/>
              </svg>
              Collapse All Categories
            </button>
          </div>
        </div>

        <!-- Skills Categories with Manual Collapse -->
        <div class="space-y-6">
          @for (cat of skillsByCategory(); track cat.id; let i = $index) {
            <div class="glass-card overflow-hidden"
                 appScrollAnimate="fadeInUp"
                 [animationDelay]="i * 150"
                 appInteractiveAnimate="lift"
                 animationTrigger="hover">

              <!-- Custom Header -->
              <div class="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors"
                   (click)="onSkillCategoryToggle({itemId: cat.id, expanded: !isCategoryExpandedIndex(cat.id, i)})">
                <div class="flex items-center gap-4 flex-1">
                  <div
                    class="w-12 h-12 rounded-lg flex items-center justify-center"
                    [class]="getCategoryIconClass(cat.category)"
                    appInteractiveAnimate="bounce"
                    animationTrigger="hover"
                  >
                    <div [innerHTML]="getCategoryIconSafe(cat.category)" class="w-6 h-6"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-xl font-bold text-foreground capitalize mb-1">
                      {{ cat.category }}
                    </h3>
                    <p class="text-sm text-muted-foreground">
                      {{ getCategoryDescription(cat.category) }} • {{ cat.skills.length || 0 }} skills
                    </p>
                  </div>
                </div>

                <!-- Toggle Icon -->
                <div class="ml-4 transition-transform duration-200"
                     [class.rotate-180]="isCategoryExpandedIndex(cat.id, i)">
                  <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>

              <!-- Collapsible Content -->
              @if (isCategoryExpandedIndex(cat.id, i)) {
                <div class="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @for (skill of cat.skills; track skill.id; let j = $index) {
                      <div class="group"
                           appScrollAnimate="fadeInUp"
                           [animationDelay]="j * 50"
                           appInteractiveAnimate="scale"
                           animationTrigger="hover">
                        <!-- Skill Header -->
                        <div class="flex items-center justify-between mb-3">
                          <span class="font-semibold text-foreground">{{ skill.name }}</span>
                          <span
                            class="text-sm font-medium px-2 py-1 rounded-full"
                            [class]="getSkillLevelClass(skill.level)"
                            appInteractiveAnimate="pulse"
                            animationTrigger="hover"
                          >
                            {{ skill.level }}
                          </span>
                        </div>

                        <!-- Progress Bar -->
                        <div class="relative">
                          <div class="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              class="h-full transition-all duration-1000 ease-out rounded-full"
                              [class]="getSkillProgressClass(skill.level)"
                              [style.width.%]="getSkillPercentage(skill.level)"
                            ></div>
                          </div>

                          <!-- Glow Effect -->
                          <div
                            class="absolute inset-0 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            [class]="getSkillGlowClass(skill.level)"
                          ></div>
                        </div>

                        <!-- Years Experience (if available) -->
                        @if (skill.years) {
                          <div class="text-xs text-muted-foreground mt-2">
                            {{ skill.years }} years experience
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Skills Summary -->
        <div class="mt-16 text-center">
          <div class="glass-card p-8 max-w-4xl mx-auto">
            <h3 class="text-2xl font-bold mb-4 text-foreground">
              Continuous Learning & Growth
            </h3>
            <p class="text-muted-foreground leading-relaxed">
              I believe in staying current with emerging technologies and best practices.
              My skill set continues to evolve with industry trends, focusing on creating
              scalable, maintainable, and user-centric solutions.
            </p>

            <div class="mt-6 flex flex-wrap justify-center gap-3">
              @for (level of skillLevels; track level) {
                <div class="flex items-center gap-2">
                  <div
                    class="w-3 h-3 rounded-full"
                    [class]="getSkillProgressClass(level)"
                  ></div>
                  <span class="text-sm text-muted-foreground capitalize">{{ level }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Aurora Glass: Category Icon Styles with Micro-Glow */
    .category-frontend {
      background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.25));
      color: hsl(var(--primary));
      box-shadow: 0 0 12px hsl(var(--primary) / 0.3);
      /* Aurora Glass: Micro-glow on text */
      text-shadow: 0 0 4px hsl(var(--primary) / 0.4);
    }

    .category-backend {
      background: linear-gradient(135deg, hsl(var(--secondary) / 0.15), hsl(var(--secondary) / 0.25));
      color: hsl(var(--secondary));
      box-shadow: 0 0 12px hsl(var(--secondary) / 0.3);
      text-shadow: 0 0 4px hsl(var(--secondary) / 0.4);
    }

    .category-database {
      background: linear-gradient(135deg, hsl(var(--accent) / 0.15), hsl(var(--accent) / 0.25));
      color: hsl(var(--accent));
      box-shadow: 0 0 12px hsl(var(--accent) / 0.3);
      text-shadow: 0 0 4px hsl(var(--accent) / 0.4);
    }

    .category-cloud, .category-devops, .category-tools, .category-methodology {
      background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.25));
      color: hsl(var(--primary));
      box-shadow: 0 0 12px hsl(var(--primary) / 0.3);
      text-shadow: 0 0 4px hsl(var(--primary) / 0.4);
    }

    /* Aurora Glass: Premium Progress Bar Glass Treatment */
    .skill-expert {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8));
      /* Aurora Glass: Enhanced glow with layered shadows */
      box-shadow:
        0 0 15px hsl(var(--primary) / 0.5),
        0 0 30px hsl(var(--primary) / 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      /* Semi-transparent for glass effect */
      backdrop-filter: blur(4px) saturate(180%);
      -webkit-backdrop-filter: blur(4px) saturate(180%);
    }

    .skill-advanced {
      background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--secondary) / 0.8));
      box-shadow:
        0 0 15px hsl(var(--secondary) / 0.5),
        0 0 30px hsl(var(--secondary) / 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px) saturate(180%);
      -webkit-backdrop-filter: blur(4px) saturate(180%);
    }

    .skill-intermediate {
      background: linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent) / 0.8));
      box-shadow:
        0 0 15px hsl(var(--accent) / 0.5),
        0 0 30px hsl(var(--accent) / 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px) saturate(180%);
      -webkit-backdrop-filter: blur(4px) saturate(180%);
    }

    .skill-beginner {
      background: linear-gradient(135deg, hsl(var(--orange) / 0.9), hsl(var(--orange)));
      box-shadow:
        0 0 15px hsl(var(--orange) / 0.5),
        0 0 30px hsl(var(--orange) / 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px) saturate(180%);
      -webkit-backdrop-filter: blur(4px) saturate(180%);
    }

    /* Aurora Glass: Enhanced glow effects on hover */
    .glow-expert {
      box-shadow:
        0 0 25px hsl(var(--primary) / 0.7),
        0 0 50px hsl(var(--primary) / 0.4);
    }

    .glow-advanced {
      box-shadow:
        0 0 25px hsl(var(--secondary) / 0.7),
        0 0 50px hsl(var(--secondary) / 0.4);
    }

    .glow-intermediate {
      box-shadow:
        0 0 25px hsl(var(--accent) / 0.7),
        0 0 50px hsl(var(--accent) / 0.4);
    }

    .glow-beginner {
      box-shadow:
        0 0 25px hsl(var(--orange) / 0.7),
        0 0 50px hsl(var(--orange) / 0.4);
    }

    .level-expert { @apply bg-primary text-white; }
    .level-advanced { @apply bg-secondary text-white; }
    .level-intermediate { @apply bg-accent text-white; }
    .level-beginner { background-color: hsl(var(--orange)); color: white; }

    /* Skill Category Header Styles */
    .skill-category-header {
      @apply p-6;
    }

    .skill-category-content {
      @apply px-6 pb-6;
    }

    /* Enhanced category icon styles for collapse components */
    .category-frontend, .category-programming {
      background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.25));
      color: hsl(var(--primary));
      border: 1px solid hsl(var(--primary) / 0.3);
    }

    .category-backend, .category-cloud, .category-devops {
      background: linear-gradient(135deg, hsl(var(--secondary) / 0.15), hsl(var(--secondary) / 0.25));
      color: hsl(var(--secondary));
      border: 1px solid hsl(var(--secondary) / 0.3);
    }

    .category-database, .category-tools, .category-methodology {
      background: linear-gradient(135deg, hsl(var(--accent) / 0.15), hsl(var(--accent) / 0.25));
      color: hsl(var(--accent));
      border: 1px solid hsl(var(--accent) / 0.3);
    }
  `]
})
export class SkillsComponent {
  @ViewChildren(CollapseComponent) private collapseItems!: QueryList<CollapseComponent>;
  private sanitizer = inject(DomSanitizer);
  private cvDataService = inject(CvDataService);
  private themeService = inject(ThemeService);

  readonly skills = this.cvDataService.skills;
  readonly skillsByCategory = this.cvDataService.skillsByCategory;
  readonly skillCategories = computed(() => this.skillsByCategory()?.map(cat => cat.category) || []);

  readonly skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

  // Track expanded state for each skill category
  private readonly categoryStates = signal<Map<string, boolean>>(new Map());

  // Accordion control methods
  expandAllSkills(): void {
    const categories = this.skillsByCategory();
    const newStates = new Map<string, boolean>();
    categories?.forEach(cat => newStates.set(cat.id, true));
    this.categoryStates.set(newStates);
    // Expand visible collapse items
    this.collapseItems?.forEach(item => item.expand());
  }

  collapseAllSkills(): void {
    const categories = this.skillsByCategory();
    const newStates = new Map<string, boolean>();
    categories?.forEach(cat => newStates.set(cat.id, false));
    this.categoryStates.set(newStates);
    // Collapse visible collapse items
    this.collapseItems?.forEach(item => item.collapse());
  }

  onSkillCategoryToggle(event: { itemId: string; expanded: boolean }): void {
    const currentStates = new Map(this.categoryStates());
    currentStates.set(event.itemId, event.expanded);
    this.categoryStates.set(currentStates);

    console.log(`Skill category ${event.itemId} ${event.expanded ? 'expanded' : 'collapsed'}`);
  }

  // Compute initial expansion: explicit state wins, otherwise first 2 expanded
  isCategoryExpandedIndex(categoryId: string, index: number): boolean {
    const state = this.categoryStates().get(categoryId);
    return state !== undefined ? state : index < 2;
  }

  getSkillsForCategory(category: string): Skill[] {
    const skillCategories = this.skillsByCategory();
    const categoryObj = skillCategories?.find(cat => cat.category === category);
    return categoryObj?.skills || [];
  }

  // trackBy for categories
  trackCat = (_: number, cat: any) => cat.id;

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      frontend: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>`,
      backend: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"></path>
      </svg>`,
      database: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
      </svg>`,
      cloud: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
      </svg>`,
      devops: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>`,
      tools: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>`,
      methodology: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
      </svg>`
    };
    return icons[category] || icons['tools'];
  }

  getCategoryIconClass(category: string): string {
    return `category-${category}`;
  }

  getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      frontend: 'User interface and experience technologies',
      backend: 'Server-side development and APIs',
      database: 'Data storage and management systems',
      cloud: 'Cloud platforms and services',
      devops: 'Development operations and automation',
      tools: 'Development tools and utilities',
      methodology: 'Development methodologies and practices'
    };
    return descriptions[category] || 'Technical skills and expertise';
  }

  getSkillLevelClass(level: string): string {
    return `level-${level}`;
  }

  getSkillProgressClass(level: string): string {
    return `skill-${level}`;
  }

  getSkillGlowClass(level: string): string {
    return `glow-${level}`;
  }

  getSkillPercentage(level: string): number {
    const percentages: Record<string, number> = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 95
    };
    return percentages[level] || 0;
  }

  // Safe HTML for static SVG icons
  getCategoryIconSafe(category: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.getCategoryIcon(category));
  }
}
