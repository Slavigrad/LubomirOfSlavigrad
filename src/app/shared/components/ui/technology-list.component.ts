import {
  Component,
  Input,
  computed,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TechnologyCategory {
  name: string;
  technologies: string[];
  color: 'primary' | 'secondary' | 'accent';
  icon: string;
}

@Component({
  selector: 'app-technology-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="technology-list">
      @if (showPreview && technologies.length > previewCount) {
        <!-- Preview Mode with simple toggle (robust, no nested components) -->
        <div class="space-y-3">
          <!-- Preview Technologies -->
          <div class="flex flex-wrap gap-2">
            @for (tech of previewTechnologies(); track tech) {
              <span
                class="tech-badge"
                [class]="getTechnologyClass(tech)"
                [title]="getTechnologyTooltip(tech)"
              >
                <span class="tech-icon">{{ getTechnologyIcon(tech) }}</span>
                <span class="tech-name">{{ tech }}</span>
              </span>
            }
          </div>

          <!-- Toggle for Additional Technologies -->
          @if (additionalTechnologies().length > 0) {
            <button type="button"
              class="w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              (click)="toggleExpanded()"
              [attr.aria-expanded]="isExpanded()"
            >
              <svg class="w-4 h-4 transition-transform" [class.rotate-180]="isExpanded()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              {{ isExpanded() ? 'Hide' : getCollapseHeaderText() }}
            </button>

            @if (isExpanded()) {
              <div class="pt-2 flex flex-wrap gap-2">
                @for (tech of additionalTechnologies(); track tech) {
                  <span
                    class="tech-badge"
                    [class]="getTechnologyClass(tech)"
                    [title]="getTechnologyTooltip(tech)"
                  >
                    <span class="tech-icon">{{ getTechnologyIcon(tech) }}</span>
                    <span class="tech-name">{{ tech }}</span>
                  </span>
                }
              </div>
            }
          }
        </div>
      } @else {
        <!-- Full List Mode -->
        <div class="flex flex-wrap gap-2">
          @for (tech of technologies; track tech) {
            <span
              class="tech-badge"
              [class]="getTechnologyClass(tech)"
              [title]="getTechnologyTooltip(tech)"
            >
              <span class="tech-icon">{{ getTechnologyIcon(tech) }}</span>
              <span class="tech-name">{{ tech }}</span>
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .tech-badge {
      @apply inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full;
      @apply transition-all duration-300 ease-out cursor-default;
      @apply border border-transparent backdrop-blur-sm;
      @apply hover:scale-105 hover:shadow-lg;
    }

    .tech-icon {
      @apply text-sm leading-none;
    }

    .tech-name {
      @apply font-semibold tracking-wide;
    }

    /* Technology Category Colors */
    .tech-badge-primary {
      @apply bg-gradient-to-r from-primary/20 to-primary/30;
      @apply text-primary border-primary/40;
      @apply hover:from-primary/30 hover:to-primary/40;
      @apply hover:border-primary/60 hover:text-primary;
      box-shadow: 0 2px 8px hsl(var(--primary) / 0.2);
    }

    .tech-badge-secondary {
      @apply bg-gradient-to-r from-secondary/20 to-secondary/30;
      @apply text-secondary border-secondary/40;
      @apply hover:from-secondary/30 hover:to-secondary/40;
      @apply hover:border-secondary/60 hover:text-secondary;
      box-shadow: 0 2px 8px hsl(var(--secondary) / 0.2);
    }

    .tech-badge-accent {
      @apply bg-gradient-to-r from-accent/20 to-accent/30;
      @apply text-accent border-accent/40;
      @apply hover:from-accent/30 hover:to-accent/40;
      @apply hover:border-accent/60 hover:text-accent;
      box-shadow: 0 2px 8px hsl(var(--accent) / 0.2);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .tech-badge {
        @apply px-2 py-1 text-xs gap-1;
      }

      .tech-icon {
        @apply text-xs;
      }
    }
  `]
})
export class TechnologyListComponent {
  @Input() technologies: string[] = [];
  @Input() showPreview: boolean = true;
  @Input() previewCount: number = 4;
  @Input() variant: 'default' | 'compact' | 'detailed' = 'default';

  // Local state for simple toggle
  private readonly expandedState = signal(false);
  isExpanded() { return this.expandedState(); }
  toggleExpanded() { this.expandedState.set(!this.expandedState()); }

  // Computed properties for preview/additional split
  readonly previewTechnologies = computed(() =>
    this.technologies.slice(0, this.previewCount)
  );

  readonly additionalTechnologies = computed(() =>
    this.technologies.slice(this.previewCount)
  );


  // Technology categorization for styling and icons
  private readonly technologyCategories = {
    frontend: {
      technologies: ['Angular', 'React', 'Vue', 'TypeScript', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS', 'Bootstrap', 'SCSS', 'Next.js', 'Nuxt.js', 'Svelte'],
      color: 'primary' as const,
      icon: '🎨'
    },
    backend: {
      technologies: ['Node.js', 'Python', 'Java', 'Kotlin', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Spring Boot', 'Express', 'Django', 'FastAPI', '.NET'],
      color: 'secondary' as const,
      icon: '⚙️'
    },
    database: {
      technologies: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQLite', 'Oracle', 'Cassandra', 'DynamoDB', 'Firebase', 'Elasticsearch'],
      color: 'accent' as const,
      icon: '🗄️'
    },
    cloud: {
      technologies: ['AWS', 'Azure', 'GCP', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean', 'Cloudflare', 'Docker', 'Kubernetes'],
      color: 'primary' as const,
      icon: '☁️'
    },
    devops: {
      technologies: ['CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'Terraform', 'Ansible', 'Nginx', 'Apache'],
      color: 'secondary' as const,
      icon: '🔧'
    },
    tools: {
      technologies: ['Git', 'Figma', 'Jira', 'Confluence', 'Slack', 'VS Code', 'IntelliJ', 'Postman', 'Webpack', 'Vite'],
      color: 'accent' as const,
      icon: '🛠️'
    }
  };

  getTechnologyCategory(technology: string): { color: 'primary' | 'secondary' | 'accent'; icon: string } {
    for (const [categoryName, category] of Object.entries(this.technologyCategories)) {
      if (category.technologies.some(tech =>
        tech.toLowerCase() === technology.toLowerCase() ||
        technology.toLowerCase().includes(tech.toLowerCase()) ||
        tech.toLowerCase().includes(technology.toLowerCase())
      )) {
        return { color: category.color, icon: category.icon };
      }
    }
    // Default category for unknown technologies
    return { color: 'accent', icon: '💻' };
  }

  getTechnologyClass(technology: string): string {
    const category = this.getTechnologyCategory(technology);
    return `tech-badge-${category.color}`;
  }

  getTechnologyIcon(technology: string): string {
    const category = this.getTechnologyCategory(technology);
    return category.icon;
  }

  getTechnologyTooltip(technology: string): string {
    const category = this.getTechnologyCategory(technology);
    return `${category.icon} ${technology}`;
  }

  getCollapseHeaderText(): string {
    const count = this.additionalTechnologies().length;
    return `Show ${count} more technolog${count === 1 ? 'y' : 'ies'}`;
  }
}
