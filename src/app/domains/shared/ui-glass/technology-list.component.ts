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
  templateUrl: './technology-list.component.html',
  styleUrl: './technology-list.component.scss',
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
