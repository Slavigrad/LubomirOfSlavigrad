/**
 * Projects Data for Lubomir of Slavigrad
 *
 * Portfolio projects showcasing technical expertise and innovation
 * following the Slavigrad Chronicles theme.
 */

import { Project } from '../models/cv-data.interface';

export const projects: Project[] = [
  {
    id: 'project-slavigrad-chronicles',
    name: 'Slavigrad Chronicles Platform',
    title: 'The Digital Chronicles of Slavigrad',
    description: 'A comprehensive digital platform showcasing the rich history and culture of Slavigrad. This immersive web experience combines storytelling with modern web technologies to create an interactive journey through the mythical realm.',

    // Technical Details
    technologies: ['Angular 19', 'TypeScript', 'Node.js', 'MongoDB', 'AWS', 'Tailwind CSS', 'Three.js'],
    architecture: ['Microservices', 'Event-Driven Architecture', 'CDN', 'Progressive Web App'],
    deployment_platforms: ['AWS EC2', 'AWS S3', 'CloudFront', 'MongoDB Atlas'],

    // Project Classification
    category: 'web',
    type: 'personal',
    complexity: 'complex',

    // Timeline
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-12-01'),
    status: 'completed',

    // Features and Innovation
    features: [
      'Interactive historical timeline with 3D visualizations',
      'Multilingual content management system',
      'Advanced search and filtering capabilities',
      'Responsive design with smooth animations',
      'Progressive Web App with offline capabilities',
      'Real-time content updates and notifications'
    ],
    key_innovations: [
      'Custom 3D timeline component using Three.js',
      'Dynamic content localization system',
      'Immersive storytelling with parallax effects',
      'Voice narration with synchronized animations'
    ],

    // Links and Resources
    links: {
      live: 'https://chronicles.slavigrad.dev',
      github: 'https://github.com/lubomir-slavigrad/chronicles',
      demo: 'https://demo.chronicles.slavigrad.dev',
      documentation: 'https://docs.chronicles.slavigrad.dev',
      case_study: 'https://blog.slavigrad.dev/chronicles-case-study'
    },

    // Visual Assets
    image: '/assets/images/projects/slavigrad-chronicles.jpg',
    screenshots: [
      '/assets/images/projects/chronicles-timeline.jpg',
      '/assets/images/projects/chronicles-map.jpg',
      '/assets/images/projects/chronicles-stories.jpg'
    ],
    video_url: 'https://youtube.com/watch?v=slavigrad-chronicles',

    // Metrics and Impact
    metrics: [
      {
        metric: 'Monthly Visitors',
        value: '10,000+',
        description: 'Unique visitors exploring Slavigrad'
      },
      {
        metric: 'Story Completion Rate',
        value: '85%',
        description: 'Users completing full timeline journey'
      },
      {
        metric: 'Performance Score',
        value: '95/100',
        description: 'Lighthouse performance rating'
      },
      {
        metric: 'Languages Supported',
        value: '5',
        description: 'English, Slovak, German, Czech, Hungarian'
      }
    ],

    // User Feedback
    user_feedback: {
      rating: 4.8,
      testimonials: [
        'An incredible journey through digital storytelling!',
        'The 3D timeline is absolutely mesmerizing.',
        'Perfect blend of technology and mythology.'
      ],
      usage_stats: {
        'Average Session Duration': '12 minutes',
        'Return Visitor Rate': '65%',
        'Mobile Usage': '70%'
      }
    },

    // Learning and Development
    challenges_overcome: [
      'Optimizing 3D rendering performance on mobile devices',
      'Creating seamless multilingual content transitions',
      'Implementing complex animation sequences',
      'Balancing visual appeal with accessibility'
    ],
    skills_learned: [
      'Advanced Three.js 3D programming',
      'Progressive Web App development',
      'Performance optimization techniques',
      'Accessibility best practices'
    ],
    future_enhancements: [
      'Virtual Reality support',
      'AI-powered story recommendations',
      'Community-generated content',
      'Advanced analytics dashboard'
    ],

    // Display Settings
    featured: true,
    highlight_order: 1,

    createdAt: new Date(),
    updatedAt: new Date()
  },
/*
  {
    id: 'project-enterprise-dashboard',
    name: 'Enterprise Analytics Dashboard Demo',
    title: 'Real-time Business Intelligence Platform',
    description: 'A sophisticated dashboard application providing real-time business analytics and data visualization for enterprise clients. Features customizable charts, automated reporting, and advanced filtering capabilities.',

    // Technical Details
    technologies: ['React 18', 'D3.js', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
    architecture: ['Microservices', 'Real-time Data Pipeline', 'Caching Layer', 'API Gateway'],
    deployment_platforms: ['Kubernetes', 'AWS EKS', 'AWS RDS', 'ElastiCache'],

    // Project Classification
    category: 'web',
    type: 'professional',
    complexity: 'enterprise',

    // Timeline
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-05-01'),
    status: 'completed',

    // Features
    features: [
      'Real-time data visualization with D3.js',
      'Customizable dashboard layouts',
      'Advanced filtering and drill-down capabilities',
      'Automated report generation and scheduling',
      'Role-based access control',
      'Export functionality (PDF, Excel, CSV)',
      'Mobile-responsive design',
      'Real-time notifications and alerts'
    ],
    key_innovations: [
      'Custom chart component library',
      'Real-time data streaming architecture',
      'Advanced caching strategy for performance',
      'Intelligent data aggregation algorithms'
    ],

    // Links (Limited due to enterprise nature)
    links: {
      demo: 'https://dashboard-demo.example.com',
      documentation: 'https://docs.dashboard.example.com'
    },

    // Visual Assets
    image: '/assets/images/projects/enterprise-dashboard.jpg',
    screenshots: [
      '/assets/images/projects/dashboard-overview.jpg',
      '/assets/images/projects/dashboard-charts.jpg',
      '/assets/images/projects/dashboard-reports.jpg'
    ],

    // Metrics and Impact
    metrics: [
      {
        metric: 'Data Points Processed',
        value: '1M+/hour',
        description: 'Real-time data processing capacity'
      },
      {
        metric: 'Response Time',
        value: '<200ms',
        description: 'Average API response time'
      },
      {
        metric: 'Client Satisfaction',
        value: '98%',
        description: 'Client satisfaction rating'
      },
      {
        metric: 'Cost Reduction',
        value: '40%',
        description: 'Reporting process automation savings'
      }
    ],

    // Team Collaboration
    team_size: 4,
    collaborators: [
      {
        name: 'Sarah Johnson',
        role: 'UI/UX Designer',
        profile_url: 'https://linkedin.com/in/sarah-johnson'
      },
      {
        name: 'Mike Chen',
        role: 'Data Engineer',
        profile_url: 'https://linkedin.com/in/mike-chen'
      },
      {
        name: 'Anna Kowalski',
        role: 'Backend Developer',
        profile_url: 'https://linkedin.com/in/anna-kowalski'
      }
    ],

    // Learning and Development
    challenges_overcome: [
      'Handling large-scale real-time data processing',
      'Optimizing complex chart rendering performance',
      'Implementing secure multi-tenant architecture',
      'Creating intuitive data exploration interfaces'
    ],
    skills_learned: [
      'Advanced D3.js data visualization',
      'Real-time data streaming with WebSockets',
      'Performance optimization for large datasets',
      'Enterprise security patterns'
    ],

    // Display Settings
    featured: true,
    highlight_order: 2,

    createdAt: new Date(),
    updatedAt: new Date()
  },
*/
  {
    id: 'project-angular-neural-network-simulator',
    name: 'Angular Neural Network Simulator',
    title: 'Educational Neural Network Visualization Platform',
    description: 'A comprehensive educational platform for visualizing and understanding neural networks, built with modern Angular architecture. Features interactive network design, real-time training visualization, and mathematical algorithm exploration. Designed with Swiss banking-grade UI/UX principles.',

    // Technical Details
    technologies: [
      'Angular 18',
      'TypeScript',
      'Angular Material',
      'RxJS',
      'Angular Signals',
      'D3.js',
      'SVG Animations',
      'SCSS',
      'Jest',
      'Cypress'
    ],
    architecture: [
      'Clean Architecture',
      'Domain-Driven Design',
      'Standalone Components',
      'Signal-based State Management',
      'Reactive Programming',
      'Mathematical Domain Layer',
      'Educational Component Design'
    ],
    deployment_platforms: ['Vercel', 'GitHub Pages', 'Angular CLI'],

    // Project Classification
    category: 'education',
    type: 'personal',
    complexity: 'complex',

    // Timeline
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-01-15'),
    status: 'in-progress',

    // Features
    features: [
      'Interactive neural network architecture design',
      'Real-time training visualization with loss curves',
      'Step-by-step backpropagation algorithm visualization',
      'Multiple activation function comparisons',
      'Dynamic weight and bias adjustment',
      'Mathematical formula explanations',
      'Swiss-inspired enterprise UI design',
      'Educational tooltips and guided tutorials',
      'Export network configurations and training data',
      'Responsive design for desktop and tablet',
      'Accessibility compliance (WCAG 2.1 AA)',
      'Multi-layered network support (input, hidden, output)'
    ],
    key_innovations: [
      'Dual-purpose educational and engineering learning platform',
      'Mathematical algorithm visualization in real-time',
      'Swiss banking aesthetic applied to educational software',
      'Spec-driven development with dynamic task management',
      'Clean architecture separating neural network math from UI',
      'Signal-based reactive state management for training data',
      'Interactive SVG-based network visualization engine'
    ],

    // Links
    links: {
      live: undefined, // In development
      github: undefined, // Private repository
      demo: undefined, // To be created
      documentation: 'Internal project documentation'
    },

    // Visual Assets
    image: '/assets/images/projects/neural-network-simulator.jpg',
    screenshots: [
      '/assets/images/projects/network-architecture-editor.jpg',
      '/assets/images/projects/training-visualization.jpg',
      '/assets/images/projects/swiss-ui-design.jpg',
      '/assets/images/projects/mathematical-explanations.jpg'
    ],

    // Metrics and Impact
    metrics: [
      {
        metric: 'Educational Value',
        value: 'Dual Learning',
        description: 'Teaches both Neural Networks and Angular'
      },
      {
        metric: 'Code Quality',
        value: '95%+',
        description: 'Clean architecture with comprehensive testing'
      },
      {
        metric: 'UI/UX Standards',
        value: 'Enterprise',
        description: 'Swiss banking-grade design system'
      },
      {
        metric: 'Mathematical Accuracy',
        value: '100%',
        description: 'Verified neural network algorithms'
      }
    ],

    // Learning and Development
    challenges_overcome: [
      'Implementing mathematical algorithms in pure TypeScript',
      'Creating interactive SVG visualizations with Angular',
      'Balancing educational clarity with technical accuracy',
      'Designing enterprise-grade UI for educational content',
      'Managing complex state in neural network training',
      'Optimizing performance for real-time visualizations'
    ],
    skills_learned: [
      'Advanced Angular 18 features and standalone components',
      'Mathematical algorithm implementation in TypeScript',
      'SVG-based data visualization techniques',
      'Clean architecture and domain-driven design',
      'Swiss design principles and accessibility standards',
      'Spec-driven development with AI coding assistants',
      'Dynamic task management and adaptive planning'
    ],
    future_enhancements: [
      'Convolutional Neural Network (CNN) support',
      'Recurrent Neural Network (RNN) visualization',
      'Custom dataset import and training',
      'Advanced optimization algorithms (Adam, RMSprop)',
      'Network performance comparison tools',
      'Integration with TensorFlow.js for real training',
      'Mobile responsive design',
      'Collaborative learning features'
    ],

    // // Educational Focus
    // educational_objectives: [
    //   'Understand neural network mathematical foundations',
    //   'Learn modern Angular development patterns',
    //   'Experience clean architecture principles',
    //   'Master reactive programming with RxJS and Signals',
    //   'Apply Swiss design principles to software interfaces',
    //   'Practice test-driven development methodologies'
    // ],

    // // Development Methodology
    // development_approach: {
    //   methodology: 'Spec-driven development with AI assistance',
    //   ai_tool: 'Augment Code',
    //   task_management: 'Dynamic phase-based planning (5-10 tasks per phase)',
    //   architecture_approach: 'Clean Architecture with Domain-Driven Design',
    //   testing_strategy: 'Test-driven development with Jest and Cypress',
    //   documentation_philosophy: 'Code as educational material'
    // },

    // // Design Philosophy
    // design_principles: [
    //   'Swiss banking aesthetic with precision and clarity',
    //   'Educational transparency in all interactions',
    //   'Mathematical accuracy with visual elegance',
    //   'Enterprise-grade accessibility and usability',
    //   'Performance optimization for real-time visualizations'
    // ],

    // Display Settings
    featured: true,
    highlight_order: 1,

    createdAt: new Date(),
    updatedAt: new Date()
  }
];
