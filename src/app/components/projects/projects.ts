import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import { CvDataService } from '../../services/cv-data.service';
import {
  ScrollAnimateDirective,
  InteractiveAnimateDirective,
} from '../../shared/utils/animations';

@Component({
  selector: 'app-projects',
  imports: [ScrollAnimateDirective, InteractiveAnimateDirective],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  private readonly cvDataService = inject(CvDataService);

  protected readonly projects = this.cvDataService.projects;

  protected formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  protected getStatusClass(status: string): string {
    return `status-${status}`;
  }

  protected getCompletedProjects(): number {
    return this.projects().filter((p) => p.status === 'completed').length;
  }

  protected getActiveProjects(): number {
    return this.projects().filter((p) => p.status === 'in-progress').length;
  }

  protected getUniqueProjectTechnologies(): number {
    const all = new Set<string>();
    this.projects().forEach((project) =>
      project.technologies.forEach((tech) => all.add(tech)),
    );
    return all.size;
  }
}
