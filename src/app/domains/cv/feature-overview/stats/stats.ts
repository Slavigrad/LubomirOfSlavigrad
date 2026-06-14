import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CvDataService } from '../../data/cv-data.service';
import { Experience } from '../../data/cv-data.interface';
import {
  ScrollAnimateDirective,
  InteractiveAnimateDirective,
} from '../../../shared/util-performance/utils/animations';
import { GlassModalComponent } from '../../../shared/ui-glass/glass-modal.component';
import { GlassListCardComponent } from '../../../shared/ui-glass/glass-list-card.component';
import { STATS_CONTENT } from '../../../shared/util-performance/constants/stats-content.constants';

// Two-tone accent: gold leads, jade supports. (Was a four-hue rainbow.)
type StatAccent = 'gold' | 'jade';

interface StatItem {
  title: string;
  value: string;
  icon: string;
  description: string;
  accent: StatAccent;
}

@Component({
  selector: 'app-stats',
  imports: [
    ScrollAnimateDirective,
    InteractiveAnimateDirective,
    GlassModalComponent,
    GlassListCardComponent,
  ],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stats {
  private readonly cvDataService = inject(CvDataService);

  protected readonly STATS = STATS_CONTENT;

  // Data access.
  protected readonly experiences = this.cvDataService.experiences;
  protected readonly projects = this.cvDataService.projects;
  protected readonly skills = this.cvDataService.skills;

  protected readonly totalExperienceYears = this.cvDataService.totalExperienceYears;
  protected readonly totalProjectsDelivered = this.cvDataService.totalProjectsDelivered;
  protected readonly projectsBreakdown = this.cvDataService.projectsBreakdown;
  protected readonly totalSkills = computed(() => this.skills().length);

  // Group experience projects by company for card rendering.
  protected readonly companyProjects = computed(() => {
    const map = new Map<string, Set<string>>();
    for (const item of this.projectsBreakdown().experience ?? []) {
      for (const company of item.companies ?? []) {
        if (!map.has(company)) map.set(company, new Set<string>());
        map.get(company)!.add(item.name);
      }
    }
    return Array.from(map.entries())
      .map(([company, set]) => ({ company, projects: Array.from(set).sort() }))
      .sort((a, b) => a.company.localeCompare(b.company));
  });

  // Modal state.
  protected readonly statModalOpen = signal(false);
  protected readonly selectedStat = signal<string | null>(null);

  protected openStat(title: string): void {
    this.selectedStat.set(title);
    this.statModalOpen.set(true);
  }

  protected closeStatModal(): void {
    this.statModalOpen.set(false);
    this.selectedStat.set(null);
  }

  protected readonly modalTitle = computed(() => {
    switch (this.selectedStat()) {
      case 'Projects Delivered':
        return this.STATS.MODAL_TITLES.PROJECTS_BREAKDOWN;
      case 'Technologies Adapted':
        return this.STATS.MODAL_TITLES.TECHNOLOGIES_BREAKDOWN;
      case 'Years of Experience':
      case 'Industries Covered':
        return this.STATS.MODAL_TITLES.EXPERIENCE_BREAKDOWN;
      default:
        return '';
    }
  });

  // Technologies by category for the modal (from skills).
  protected readonly techCategories = computed(() =>
    (this.cvDataService.skillsByCategory() ?? []).map((cat) => ({
      name: cat.category ?? 'Category',
      items: (cat.skills ?? []).map((s) => s.name),
    })),
  );

  // Industries breakdown: companies, experiences, and projects per industry
  // (supports multi-tag industries).
  protected readonly industriesBreakdown = computed(() => {
    interface Acc {
      companies: Set<string>;
      experiences: number;
      projects: Set<string>;
    }
    const map = new Map<string, Acc>();

    for (const exp of this.experiences() ?? []) {
      const industries = exp.industry?.map((i) => String(i)) ?? [];
      const company = exp.company ?? 'Unknown';
      const projectNames = new Set<string>();
      for (const pos of exp.positions ?? []) {
        for (const prj of pos.projects ?? []) {
          if (prj?.name) projectNames.add(prj.name.trim().toLowerCase());
        }
      }
      const tags = industries.length ? industries : ['Other'];
      for (const tag of tags) {
        if (!map.has(tag)) {
          map.set(tag, { companies: new Set(), experiences: 0, projects: new Set() });
        }
        const acc = map.get(tag)!;
        acc.companies.add(company);
        acc.experiences += 1;
        projectNames.forEach((name) => acc.projects.add(name));
      }
    }

    return Array.from(map.entries())
      .map(([industry, acc]) => ({
        industry,
        companies: Array.from(acc.companies).sort(),
        experiences: acc.experiences,
        projectsCount: acc.projects.size,
      }))
      .sort((a, b) => a.industry.localeCompare(b.industry));
  });

  protected formatYears(n: number, decimals = 1): string {
    if (!Number.isFinite(n)) return '0';
    const rounded = Number(n.toFixed(decimals));
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
  }

  protected getCompanyYears(exp: Experience): number {
    const start = exp.overallStartDate ?? exp.startDate;
    const end = exp.overallEndDate ?? exp.endDate ?? new Date();
    if (!start) return 0;
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months / 12;
  }

  protected readonly stats = computed<StatItem[]>(() => [
    {
      title: 'Years of Experience',
      value: `${this.formatYears(this.totalExperienceYears(), 1)}+`,
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      description: 'Professional software development experience across multiple domains',
      accent: 'gold',
    },
    {
      title: 'Projects Delivered',
      value: `${this.totalProjectsDelivered()}+`,
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      description: 'Successfully delivered projects from concept to production',
      accent: 'jade',
    },
    {
      title: 'Technologies Adapted',
      value: `${this.totalSkills()}+`,
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
      </svg>`,
      description: 'Modern frameworks, languages, and development tools',
      accent: 'jade',
    },
    {
      title: 'Industries Covered',
      value: '6+',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>`,
      description:
        'Telco, FinTech, Automotive, Healthcare, Infotainment, Public Infrastructure & Transport',
      accent: 'gold',
    },
  ]);

  protected getStatColorClass(accent: StatAccent): string {
    return `stat-${accent}`;
  }

  protected getIconBackgroundClass(accent: StatAccent): string {
    return `icon-bg-${accent}`;
  }
}
