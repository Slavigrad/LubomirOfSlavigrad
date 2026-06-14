import {
  Component,
  input,
  computed,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';


export interface TechnologyCategory {
  name: string;
  technologies: string[];
  color: 'primary' | 'secondary' | 'accent';
  icon: string;
}

@Component({
  selector: 'app-technology-list',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="technology-list">
      @if (showPreview() && technologies().length > previewCount()) {
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
          @for (tech of technologies(); track tech) {
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
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding-inline: 0.75rem;
      padding-block: 0.375rem;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 500;
      border-radius: 9999px;
      transition-property: all;
      transition-duration: 300ms;
      transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
      cursor: default;
      border: 1px solid transparent;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .tech-badge:hover {
      transform: scale(1.05);
      box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    .tech-icon {
      font-size: 0.875rem;
      line-height: 1;
    }

    .tech-name {
      font-weight: 600;
      letter-spacing: 0.025em;
    }

    /* Technology Category Colors */
    .tech-badge-primary {
      background-image: linear-gradient(
        to right,
        color-mix(in oklab, var(--color-primary) 20%, transparent),
        color-mix(in oklab, var(--color-primary) 30%, transparent)
      );
      color: var(--color-primary);
      border-color: color-mix(in oklab, var(--color-primary) 40%, transparent);
      box-shadow: 0 2px 8px hsl(var(--primary) / 0.2);
    }
    .tech-badge-primary:hover {
      background-image: linear-gradient(
        to right,
        color-mix(in oklab, var(--color-primary) 30%, transparent),
        color-mix(in oklab, var(--color-primary) 40%, transparent)
      );
      border-color: color-mix(in oklab, var(--color-primary) 60%, transparent);
      color: var(--color-primary);
    }

    .tech-badge-secondary {
      background-image: linear-gradient(
        to right,
        color-mix(in oklab, var(--color-secondary) 20%, transparent),
        color-mix(in oklab, var(--color-secondary) 30%, transparent)
      );
      color: var(--color-secondary);
      border-color: color-mix(in oklab, var(--color-secondary) 40%, transparent);
      box-shadow: 0 2px 8px hsl(var(--secondary) / 0.2);
    }
    .tech-badge-secondary:hover {
      background-image: linear-gradient(
        to right,
        color-mix(in oklab, var(--color-secondary) 30%, transparent),
        color-mix(in oklab, var(--color-secondary) 40%, transparent)
      );
      border-color: color-mix(in oklab, var(--color-secondary) 60%, transparent);
      color: var(--color-secondary);
    }

    .tech-badge-accent {
      background-image: linear-gradient(
        to right,
        color-mix(in oklab, var(--color-accent) 20%, transparent),
        color-mix(in oklab, var(--color-accent) 30%, transparent)
      );
      color: var(--color-accent);
      border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
      box-shadow: 0 2px 8px hsl(var(--accent) / 0.2);
    }
    .tech-badge-accent:hover {
      background-image: linear-gradient(
        to right,
        color-mix(in oklab, var(--color-accent) 30%, transparent),
        color-mix(in oklab, var(--color-accent) 40%, transparent)
      );
      border-color: color-mix(in oklab, var(--color-accent) 60%, transparent);
      color: var(--color-accent);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .tech-badge {
        padding-inline: 0.5rem;
        padding-block: 0.25rem;
        font-size: 0.75rem;
        line-height: 1rem;
        gap: 0.25rem;
      }

      .tech-icon {
        font-size: 0.75rem;
        line-height: 1rem;
      }
    }
  `]
})
export class TechnologyListComponent {
  readonly technologies = input<string[]>([]);
  readonly showPreview = input<boolean>(true);
  readonly previewCount = input<number>(4);
  readonly variant = input<'default' | 'compact' | 'detailed'>('default');

  // Local state for simple toggle
  private readonly expandedState = signal(false);
  isExpanded() { return this.expandedState(); }
  toggleExpanded() { this.expandedState.set(!this.expandedState()); }

  // Computed properties for preview/additional split
  readonly previewTechnologies = computed(() =>
    this.technologies().slice(0, this.previewCount())
  );

  readonly additionalTechnologies = computed(() =>
    this.technologies().slice(this.previewCount())
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
