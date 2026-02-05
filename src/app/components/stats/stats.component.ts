import { Component, inject, computed, signal } from '@angular/core';

import { CvDataService } from '../../services/cv-data.service';
import { ThemeService } from '../../services/theme.service';
import { ScrollAnimateDirective, InteractiveAnimateDirective } from '../../shared/utils/animations';
import { GlassModalComponent } from '../../shared/components/ui/glass-modal.component';
import { GlassListCardComponent } from '../../shared/components/ui/glass-list-card.component';
import { STATS_CONTENT } from '../../shared/constants/stats-content.constants';

interface StatItem {
  title: string;
  value: string;
  icon: string;
  description: string;
  color: 'primary' | 'secondary' | 'accent' | 'orange';
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [ScrollAnimateDirective, InteractiveAnimateDirective, GlassModalComponent, GlassListCardComponent],
  template: `
    <!-- Stats Section -->
    <section id="stats" class="py-20 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-gradient-to-b from-background/30 to-background/50"></div>

      <div class="relative z-10 max-w-6xl mx-auto px-6">
        <!-- Section Header -->
        <div class="text-center mb-16" appScrollAnimate="fadeInUp">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            {{ STATS.SECTION_TITLES.PROFESSIONAL_METRICS }}
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            {{ STATS.DESCRIPTIONS.SECTION_SUBTITLE }}
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (stat of stats(); track stat.title; let i = $index) {
            <div
              class="glass-card p-6 text-center group cursor-pointer"
              [class]="getStatColorClass(stat.color)"
              appScrollAnimate="fadeInUp"
              [animationDelay]="i * 150"
              appInteractiveAnimate="lift"
              animationTrigger="hover"
              (click)="openStat(stat.title)"
              (keydown.enter)="openStat(stat.title)"
              (keydown.space)="$event.preventDefault(); openStat(stat.title)"
              role="button"
              tabindex="0"
              [attr.aria-label]="'Open details for ' + stat.title"
            >
              <!-- Icon -->
              <div class="mb-4 flex justify-center">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center"
                  [class]="getIconBackgroundClass(stat.color)"
                  appInteractiveAnimate="bounce"
                  animationTrigger="hover"
                >
                  <div [innerHTML]="stat.icon" class="w-6 h-6"></div>
                </div>
              </div>

              <!-- Value -->
              <div
                class="text-3xl md:text-4xl font-bold mb-2 transition-all duration-300"
                [class]="getValueColorClass(stat.color)"
                appInteractiveAnimate="pulse"
                animationTrigger="hover"
              >
                {{ stat.value }}
              </div>

              <!-- Title -->
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                {{ stat.title }}
              </h3>


              <!-- Description -->
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ stat.description }}
              </p>
            </div>
          }
        </div>


        @if (statModalOpen()) {
          <app-glass-modal [open]="true" size="xl" (closed)="closeStatModal()" [closeOnBackdrop]="true">
            <div class="flex items-start justify-between mb-6">
              <h3 class="text-2xl md:text-3xl font-extrabold gradient-text">{{ modalTitle() }}</h3>
              <button class="p-2 hover:bg-white/10 rounded-lg transition-colors" (click)="closeStatModal()" aria-label="Close">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Projects Delivered Breakdown -->
            @if (selectedStat() === 'Projects Delivered') {
              <div class="space-y-6">
                <p class="text-sm text-muted-foreground">{{ STATS.LABELS.PROJECTS_DEDUPE_NOTE }}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <app-glass-list-card [title]="STATS.LABELS.PORTFOLIO_PROJECTS"
                    [items]="projectsBreakdown().portfolio" />

                  @for (group of companyProjects(); track group.company) {
                    <app-glass-list-card [title]="group.company"
                      [subtitle]="STATS.LABELS.EXPERIENCE_PROJECTS"
                      [items]="group.projects" />
                  }
                </div>
              </div>
            }

            <!-- Technologies Breakdown -->
            @if (selectedStat() === 'Technologies Adapted') {
              <div class="space-y-4">
                @for (cat of techCategories(); track cat.name) {
                  <div class="p-4 rounded-lg border border-border/20 bg-background/60">
                    <div class="text-base font-semibold mb-1">{{ cat.name }} ({{ cat.items.length }})</div>
                    <div class="text-sm text-muted-foreground">{{ cat.items.join(', ') }}</div>
                  </div>
                }
              </div>
            }

            <!-- Years of Experience Breakdown -->
            @if (selectedStat() === 'Years of Experience') {
              <div class="space-y-2">
                @for (exp of experiences(); track exp.id) {
                  <div class="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/60">
                    <div class="text-sm font-medium">{{ exp.company }}</div>
                    <div class="text-sm text-muted-foreground">{{ formatYears(getCompanyYears(exp)) }} years</div>
                  </div>
                }
              </div>
            }

            <!-- Industries Covered Breakdown -->
            @if (selectedStat() === 'Industries Covered') {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (g of industriesBreakdown(); track g.industry) {
                  <app-glass-list-card [title]="g.industry"
                    [subtitle]="'Companies: ' + g.companies.length + ', Experiences: ' + g.experiences + ' and Projects: ' + g.projectsCount"
                    [items]="g.companies" />
                }
              </div>
            }
          </app-glass-modal>
        }

      </div>
    </section>
  `,
  styles: [`
    .stat-primary {
      border-color: hsl(var(--primary) / 0.2);
    }

    .stat-secondary {
      border-color: hsl(var(--secondary) / 0.2);
    }

    .stat-accent {
      border-color: hsl(var(--accent) / 0.2);
    }

    .stat-orange {
      border-color: hsl(var(--orange) / 0.2);
    }

    .icon-bg-primary {
      background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.2));
      color: hsl(var(--primary));
    }

    .icon-bg-secondary {
      background: linear-gradient(135deg, hsl(var(--secondary) / 0.1), hsl(var(--secondary) / 0.2));
      color: hsl(var(--secondary));
    }

    .icon-bg-accent {
      background: linear-gradient(135deg, hsl(var(--accent) / 0.1), hsl(var(--accent) / 0.2));
      color: hsl(var(--accent));
    }

    .icon-bg-orange {
      background: linear-gradient(135deg, hsl(var(--orange) / 0.1), hsl(var(--orange) / 0.2));
      color: hsl(var(--orange));
    }

    /* Option 3: Very Subtle Glow - No Eye Strain */
    .value-primary {
      color: hsl(var(--primary));
      text-shadow: 0 0 4px hsl(var(--primary) / 0.15);
      letter-spacing: 0.5px;
    }

    .value-secondary {
      color: hsl(var(--secondary));
      text-shadow: 0 0 4px hsl(var(--secondary) / 0.15);
      letter-spacing: 0.5px;
    }

    .value-accent {
      color: hsl(var(--accent));
      text-shadow: 0 0 4px hsl(var(--accent) / 0.15);
      letter-spacing: 0.5px;
    }

    .value-orange {
      color: hsl(var(--orange));
      text-shadow: 0 0 4px hsl(var(--orange) / 0.15);
      letter-spacing: 0.5px;
    }
  `]
})
export class StatsComponent {
  private cvDataService = inject(CvDataService);
  private themeService = inject(ThemeService);

  // Constants
  readonly STATS = STATS_CONTENT;

  // Data access
  readonly experiences = this.cvDataService.experiences;
  readonly projects = this.cvDataService.projects;
  readonly skills = this.cvDataService.skills;

  readonly totalExperienceYears = this.cvDataService.totalExperienceYears;
  readonly totalProjectsDelivered = this.cvDataService.totalProjectsDelivered;
  readonly projectsBreakdown = this.cvDataService.projectsBreakdown;
  readonly totalSkills = computed(() => this.skills().length);

  // Group experience projects by company for card rendering
  readonly companyProjects = computed(() => {
    const map = new Map<string, Set<string>>();
    const bd = this.projectsBreakdown();
    for (const item of bd.experience || []) {
      for (const company of item.companies || []) {
        if (!map.has(company)) map.set(company, new Set<string>());
        map.get(company)!.add(item.name);
      }
    }
    return Array.from(map.entries())
      .map(([company, set]) => ({ company, projects: Array.from(set).sort() }))
      .sort((a, b) => a.company.localeCompare(b.company));
  });


  // Modal state
  readonly statModalOpen = signal(false);
  readonly selectedStat = signal<string | null>(null);

  openStat(title: string) { this.selectedStat.set(title); this.statModalOpen.set(true); }
  closeStatModal() { this.statModalOpen.set(false); this.selectedStat.set(null); }

  modalTitle = computed(() => {
    switch (this.selectedStat()) {
      case 'Projects Delivered': return this.STATS.MODAL_TITLES.PROJECTS_BREAKDOWN;
      case 'Technologies Adapted': return this.STATS.MODAL_TITLES.TECHNOLOGIES_BREAKDOWN;
      case 'Years of Experience': return this.STATS.MODAL_TITLES.EXPERIENCE_BREAKDOWN;
      case 'Industries Covered': return this.STATS.MODAL_TITLES.EXPERIENCE_BREAKDOWN;
      default: return '';
    }
  });

  // Technologies by category for modal (from skills)
  readonly techCategories = computed(() => {
    const list: any[] = this.cvDataService.skillsByCategory() as any[];
    return (list || []).map((cat: any) => ({
      name: cat.category || cat.name || 'Category',
      items: (cat.skills || []).map((s: any) => s.name)
    }));
  });

  // Industries breakdown: Companies, Experiences, Projects per industry (supports multi-tag industries)
  readonly industriesBreakdown = computed(() => {
    type Acc = { companies: Set<string>; experiences: number; projects: Set<string> };
    const map = new Map<string, Acc>();
    for (const exp of this.experiences() || []) {
      const industries: string[] = (exp as any).industry || [];
      const company = (exp as any).company || 'Unknown';
      const posArr = (exp as any).positions || [];
      const projectNames = new Set<string>();
      for (const pos of posArr) for (const prj of (pos.projects || [])) if (prj?.name) projectNames.add(String(prj.name).trim().toLowerCase());
      // If no industries specified, classify under 'Other'
      const tags = industries.length ? industries : ['Other'];
      for (const tag of tags) {
        if (!map.has(tag)) map.set(tag, { companies: new Set(), experiences: 0, projects: new Set() });
        const acc = map.get(tag)!;
        acc.companies.add(company);
        acc.experiences += 1;
        for (const name of projectNames) acc.projects.add(name);
      }
    }
    return Array.from(map.entries())
      .map(([industry, acc]) => ({
        industry,
        companies: Array.from(acc.companies).sort(),
        experiences: acc.experiences,
        projectsCount: acc.projects.size
      }))
      .sort((a, b) => a.industry.localeCompare(b.industry));
  });

  formatYears(n: number, decimals = 1): string {
    if (!Number.isFinite(n)) return '0';
    const rounded = Number(n.toFixed(decimals));
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
  }

  getCompanyYears(exp: any): number {
    const start: Date | undefined = exp.overallStartDate || exp.startDate;
    const end: Date = exp.overallEndDate || exp.endDate || new Date();
    if (!start) return 0;
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return totalMonths / 12;
  }

  readonly stats = computed<StatItem[]>(() => [
    {
      title: 'Years of Experience',
      value: `${this.formatYears(this.totalExperienceYears(), 1)}+`,
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      description: 'Professional software development experience across multiple domains',
      color: 'orange'
    },
    {
      title: 'Projects Delivered',
      value: `${this.totalProjectsDelivered()}+`,
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      description: 'Successfully delivered projects from concept to production',
      color: 'secondary'
    },
    {
      title: 'Technologies Adapted',
      value: `${this.totalSkills()}+`,
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
      </svg>`,
      description: 'Modern frameworks, languages, and development tools',
      color: 'accent'
    },
    {
      title: 'Industries Covered',
      value: '6+',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>`,
      description: 'Telco, FinTech, Automotive, Healthcare, Infotainment, Public Infrastructure & Transport',
      color: 'primary'
    }
  ]);

  getStatColorClass(color: string): string {
    return `stat-${color}`;
  }

  getIconBackgroundClass(color: string): string {
    return `icon-bg-${color}`;
  }

  getValueColorClass(color: string): string {
    return `value-${color}`;
  }
}
