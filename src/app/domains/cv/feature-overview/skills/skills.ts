import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { CvDataService } from '../../data/cv-data.service';
import { Skill } from '../../data/cv-data.interface';
import {
  ScrollAnimateDirective,
  InteractiveAnimateDirective,
} from '../../../shared/util-performance/utils/animations';
import { CollapseComponent } from '../../../shared/ui-glass/collapse.component';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

@Component({
  selector: 'app-skills',
  imports: [ScrollAnimateDirective, InteractiveAnimateDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  private readonly collapseItems = viewChildren(CollapseComponent);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cvDataService = inject(CvDataService);

  protected readonly skills = this.cvDataService.skills;
  protected readonly skillsByCategory = this.cvDataService.skillsByCategory;
  protected readonly skillCategories = computed(
    () => this.skillsByCategory()?.map((cat) => cat.category) ?? [],
  );

  protected readonly skillLevels: readonly SkillLevel[] = [
    'beginner',
    'intermediate',
    'advanced',
    'expert',
  ];

  // Track expanded state for each skill category.
  private readonly categoryStates = signal<Map<string, boolean>>(new Map());

  protected expandAllSkills(): void {
    this.setAllCategories(true);
    this.collapseItems().forEach((item) => item.expand());
  }

  protected collapseAllSkills(): void {
    this.setAllCategories(false);
    this.collapseItems().forEach((item) => item.collapse());
  }

  private setAllCategories(expanded: boolean): void {
    const next = new Map<string, boolean>();
    this.skillsByCategory()?.forEach((cat) => next.set(cat.id, expanded));
    this.categoryStates.set(next);
  }

  protected onSkillCategoryToggle(event: { itemId: string; expanded: boolean }): void {
    const next = new Map(this.categoryStates());
    next.set(event.itemId, event.expanded);
    this.categoryStates.set(next);
  }

  // Explicit state wins; otherwise the first two categories start expanded.
  protected isCategoryExpandedIndex(categoryId: string, index: number): boolean {
    const state = this.categoryStates().get(categoryId);
    return state !== undefined ? state : index < 2;
  }

  protected getSkillsForCategory(category: string): Skill[] {
    return this.skillsByCategory()?.find((cat) => cat.category === category)?.skills ?? [];
  }

  protected getCategoryIconClass(category: string): string {
    return `category-${category}`;
  }

  protected getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      frontend: 'User interface and experience technologies',
      backend: 'Server-side development and APIs',
      database: 'Data storage and management systems',
      cloud: 'Cloud platforms and services',
      devops: 'Development operations and automation',
      tools: 'Development tools and utilities',
      methodology: 'Development methodologies and practices',
    };
    return descriptions[category] ?? 'Technical skills and expertise';
  }

  protected getSkillLevelClass(level: string): string {
    return `level-${level}`;
  }

  protected getSkillProgressClass(level: string): string {
    return `skill-${level}`;
  }

  protected getSkillPercentage(level: string): number {
    const percentages: Record<string, number> = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 95,
    };
    return percentages[level] ?? 0;
  }

  // Static, hard-coded SVG markup — safe to trust.
  protected getCategoryIconSafe(category: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.getCategoryIcon(category));
  }

  private getCategoryIcon(category: string): string {
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
      </svg>`,
    };
    return icons[category] ?? icons['tools'];
  }
}
