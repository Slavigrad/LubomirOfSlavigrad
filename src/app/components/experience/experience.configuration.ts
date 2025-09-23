// Behavior and presentation configuration for ExperienceComponent
// Tune defaults and behaviors here; the component imports and uses these values only.

export const EXPERIENCE_CONFIG = {
  // Default expand/collapse states when there is no user interaction stored
  defaults: {
    companyExpanded: true,
    positionExpanded: false,
  },

  // Technology list preview chip counts and flags
  preview: {
    techListCard: 6,    // number of technologies shown in the card view
    techListModal: 8,   // number of technologies shown in the modal view
    showPreview: true,  // whether to show preview mode on technology list
  },

  // Animation timing and interaction configuration
  animations: {
    sectionBaseDelay: 200,   // base delay used for stagger in experience items (ms)
    timelineDotOffset: 100,  // additional offset for the timeline dot glow (ms)
    summaryDelays: [50, 150, 250, 350] as const, // header stat tiles delays (ms)
    interactionTrigger: 'hover' as const,        // trigger for appInteractiveAnimate
  },

  // Modal behavior and presentation
  modal: {
    size: 'xl' as const,       // default experience details modal size
    closeOnBackdrop: true,     // allow closing modal on backdrop click
  },

  // Color rotation cycles for visual differentiation
  colors: {
    companyCycle: ['primary', 'secondary', 'accent'] as const,
    locationCycle: ['accent', 'primary', 'secondary'] as const,
  },

  // Technology categorization for color coding and iconography
  technologyCategories: {
    frontend: {
      technologies: ['Angular', 'React', 'Vue', 'TypeScript', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS', 'Bootstrap', 'SCSS', 'Next.js', 'Nuxt.js'] as const,
      color: 'primary' as const,
      icon: '🎨',
    },
    backend: {
      technologies: ['Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Spring Boot', 'Express', 'Django', 'FastAPI', '.NET'] as const,
      color: 'secondary' as const,
      icon: '⚙️',
    },
    database: {
      technologies: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQLite', 'Oracle', 'Cassandra', 'DynamoDB', 'Firebase'] as const,
      color: 'accent' as const,
      icon: '🗄️',
    },
    cloud: {
      technologies: ['AWS', 'Azure', 'GCP', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean', 'Cloudflare'] as const,
      color: 'primary' as const,
      icon: '☁️',
    },
    devops: {
      technologies: ['Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'Terraform', 'Ansible'] as const,
      color: 'secondary' as const,
      icon: '🔧',
    },
    tools: {
      technologies: ['Git', 'Figma', 'Jira', 'Confluence', 'Slack', 'VS Code', 'IntelliJ', 'Postman'] as const,
      color: 'accent' as const,
      icon: '🛠️',
    },
    methodology: {
      technologies: ['Agile/Scrum', 'Kanban', 'TDD', 'BDD', 'DevOps', 'Microservices', 'REST API', 'GraphQL'] as const,
      color: 'primary' as const,
      icon: '📋',
    },
  } as const,

  // Fallback when a technology doesn't match any category
  technologyCategoryFallback: {
    color: 'accent' as const,
    icon: '💻',
  },
} as const;

export type ExperienceConfig = typeof EXPERIENCE_CONFIG;

