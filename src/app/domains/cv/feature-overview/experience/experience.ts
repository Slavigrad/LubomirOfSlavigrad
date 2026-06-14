import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { CvDataService } from '../../data/cv-data.service';
import { Experience as ExperienceModel, Position } from '../../data/cv-data.interface';
import {
  ScrollAnimateDirective,
  InteractiveAnimateDirective,
} from '../../../shared/util-performance/utils/animations';
import { TechnologyListComponent } from '../../../shared/ui-glass/technology-list.component';
import { GlassModalComponent } from '../../../shared/ui-glass/glass-modal.component';

import { STATS_CONTENT } from '../../../shared/util-performance/constants/stats-content.constants';

import { EXPERIENCE_TEXT, EXPERIENCE_CLASSES, EXPERIENCE_ICONS } from './experience.constants';
import { EXPERIENCE_CONFIG } from './experience.configuration';

@Component({
  selector: 'app-experience',
  imports: [
    ScrollAnimateDirective,
    InteractiveAnimateDirective,
    TechnologyListComponent,
    GlassModalComponent,
  ],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
  private readonly cvDataService = inject(CvDataService);

  // Extracted constants/config for template access.
  protected readonly UI = EXPERIENCE_TEXT;
  protected readonly CLASSES = EXPERIENCE_CLASSES;
  protected readonly ICONS = EXPERIENCE_ICONS;
  protected readonly CONFIG = EXPERIENCE_CONFIG;
  protected readonly STATS = STATS_CONTENT;

  // Data signals.
  protected readonly experiences = this.cvDataService.experiences;
  protected readonly totalExperienceYears = this.cvDataService.totalExperienceYears;
  protected readonly totalProjectsDelivered = this.cvDataService.totalProjectsDelivered;
  protected readonly totalCompanies = this.cvDataService.totalCompanies;

  // Hierarchical collapse state.
  private readonly companyStates = signal<Map<string, boolean>>(new Map());
  private readonly positionStates = signal<Map<string, Map<number, boolean>>>(new Map());

  // Experience detail modal state.
  protected readonly showExperienceModal = signal(false);
  protected readonly selectedExperience = signal<ExperienceModel | null>(null);

  protected isCompanyExpanded(expId: string): boolean {
    return this.companyStates().get(expId) ?? this.CONFIG.defaults.companyExpanded;
  }

  protected toggleCompany(expId: string): void {
    const states = new Map(this.companyStates());
    states.set(expId, !this.isCompanyExpanded(expId));
    this.companyStates.set(states);
  }

  protected openExperienceDetails(exp: ExperienceModel): void {
    this.selectedExperience.set(exp);
    this.showExperienceModal.set(true);
  }

  protected closeExperienceDetails(): void {
    this.showExperienceModal.set(false);
    this.selectedExperience.set(null);
  }

  protected isPositionExpanded(expId: string, posIndex: number): boolean {
    return this.positionStates().get(expId)?.get(posIndex) ?? this.CONFIG.defaults.positionExpanded;
  }

  protected togglePosition(expId: string, posIndex: number): void {
    const states = new Map(this.positionStates());
    if (!states.has(expId)) {
      states.set(expId, new Map());
    }
    const positions = states.get(expId)!;
    positions.set(posIndex, !this.isPositionExpanded(expId, posIndex));
    this.positionStates.set(states);
  }

  protected expandAll(): void {
    this.setAll(true);
  }

  protected collapseAll(): void {
    this.setAll(false);
  }

  private setAll(expanded: boolean): void {
    const companyStates = new Map<string, boolean>();
    const positionStates = new Map<string, Map<number, boolean>>();

    this.experiences().forEach((exp) => {
      companyStates.set(exp.id, expanded);
      const posMap = new Map<number, boolean>();
      this.getPositions(exp).forEach((_, index) => posMap.set(index, expanded));
      positionStates.set(exp.id, posMap);
    });

    this.companyStates.set(companyStates);
    this.positionStates.set(positionStates);
  }

  protected formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  protected getTotalTechnologies(): number {
    const all = new Set<string>();
    this.experiences().forEach((exp) => {
      this.getPositions(exp).forEach((pos) => pos.technologies?.forEach((t) => all.add(t)));
      exp.technologies?.forEach((t) => all.add(t)); // legacy fallback
    });
    return all.size;
  }

  protected getTechnologyCategory(technology: string): {
    color: string;
    icon: string;
  } {
    const needle = technology.toLowerCase();
    for (const category of Object.values(this.CONFIG.technologyCategories)) {
      const match = category.technologies.some((tech) => {
        const t = tech.toLowerCase();
        return t === needle || needle.includes(t) || t.includes(needle);
      });
      if (match) {
        return { color: category.color, icon: category.icon };
      }
    }
    return this.CONFIG.technologyCategoryFallback;
  }

  protected getTechnologyColorClass(technology: string): string {
    return `tech-badge-${this.getTechnologyCategory(technology).color}`;
  }

  protected getCompanyColorClass(index: number): string {
    const colors = this.CONFIG.colors.companyCycle as readonly string[];
    return `company-${colors[index % colors.length]}`;
  }

  protected getLocationColorClass(index: number): string {
    const colors = this.CONFIG.colors.locationCycle as readonly string[];
    return `location-${colors[index % colors.length]}`;
  }

  // Utilities for the enhanced Experience model with backward compatibility.
  protected getPositions(exp: ExperienceModel): Position[] {
    if (Array.isArray(exp.positions) && exp.positions.length > 0) {
      return exp.positions;
    }
    // Legacy fallback: build a single position from legacy fields.
    return [
      {
        id: exp.id,
        title: exp.position ?? exp.title ?? 'Role',
        description: exp.description ?? '',
        startDate: exp.startDate ?? exp.overallStartDate,
        endDate: exp.endDate ?? exp.overallEndDate,
        technologies: exp.technologies ?? [],
        responsibilities: [],
        achievements: exp.achievements ?? [],
      } as Position,
    ];
  }

  protected getOverallStart(exp: ExperienceModel): Date | undefined {
    return exp.overallStartDate ?? this.getPositions(exp)[0]?.startDate ?? exp.startDate;
  }

  protected getOverallEnd(exp: ExperienceModel): Date | null {
    if (exp.overallEndDate != null) return exp.overallEndDate;
    const positions = this.getPositions(exp);
    return positions[positions.length - 1]?.endDate ?? exp.endDate ?? null;
  }

  protected isCurrentExperience(exp: ExperienceModel): boolean {
    return this.getOverallEnd(exp) == null || exp.current === true;
  }
}
