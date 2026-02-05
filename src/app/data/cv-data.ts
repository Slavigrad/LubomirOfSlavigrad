/**
 * Static CV Data for Lubomir of Slavigrad
 *
 * This file contains the complete CV data following the "Lubomir of Slavigrad" theme
 * as specified in the technical specification. The data is structured to support
 * the single source of truth architecture with automatic propagation.
 */

import { CVData, PersonalInfo, SocialLink, Stat, SkillCategory, Experience, Project } from '../models/cv-data.interface';
import { experiences } from './experience-data';
import { projects } from './projects-data';
import { skillCategories, skills } from './skills-data';

// ============================================================================
// PERSONAL INFORMATION - LUBOMIR OF SLAVIGRAD
// ============================================================================

const personalInfo: PersonalInfo = {
  id: 'personal-info-lubomir-slavigrad',
  name: 'Lubomir Dobrovodsky',
  firstName: 'Lubomir',
  lastName: 'Dobrovodsky',
  title: 'Senior Fullstack Engineer & AI Enthusiast',
  subtitle: 'Architect of the Digital Realm of Slavigrad',

  // Professional Summary with Slavigrad theme
  bio: 'Welcome to Slavigrad — the digital city where code and myth intertwine. As the sovereign of this realm, I have spent 20+ years forging enterprise solutions with Java, Spring Boot, and modern web technologies.',
  summary:
    'Experienced software engineer with 20 years in enterprise development, specializing in Java/Kotlin, Spring Boot, EAI and modern web technologies. Proven track record in developing robust backend systems mostly for telecommunications operators but also for various European enterprises.\n\n' +
    'Expertise in designing and implementing software solutions based on Onion and\n' +
    'Hexagonal architectures, applying SOLID principles, Domain-Driven Design, Clean\n' +
    'Code, and Test-Driven Development.\n',
  elevator_pitch:
    'I transform complex business challenges into elegant technical solutions, leading teams to build scalable systems that serve millions of users.',

  // Contact Information
  email: 'notavailable@slavigrad.net',
  phone: '+41 00 000 00 00',
  location: 'Zürich, Switzerland',
  website: 'https://slavigrad.net',

  // Professional Profiles
  linkedin: 'https://www.linkedin.com/in/lubomir-dobrovodsky/',
  github: 'https://github.com/Slavigrad',
  portfolio: 'https://portfolio.slavigrad.net',
  blog: 'https://blog.slavigrad.net',

  // Core Technologies - Signature Expertise
  technologies: ['Java 21', 'Kotlin', 'Spring Boot', 'Kafka', 'Angular', 'Docker'],

  // Media and Branding - Slavigrad Theme
  avatar: '/assets/images/lubomir-avatar.jpg',
  cover_image: '/assets/images/slavigrad-cover.jpg',
  personal_brand: {
    tagline: 'Code and Myth Intertwined',
    color_scheme: 'electric-blue-purple',
    logo: '/assets/images/slavigrad-logo.svg'
  },

  // Availability
  availability: {
    status: 'employed',
    notice_period: '3 months',
    work_authorization: 'EU Citizen',
    willing_to_relocate: false,
    preferred_locations: ['Remote', 'Bratislava', 'Vienna', 'Zurich'],
    salary_expectations: {
      min: 80000,
      max: 120000,
      currency: 'EUR',
      negotiable: true
    }
  },

  // Languages
  languages: [
    {
      id: 'lang-sk',
      name: 'Slovak',
      code: 'sk',
      proficiency: 'native',
      is_native: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'lang-en',
      name: 'English',
      code: 'en',
      proficiency: 'fluent',
      certifications: ['TOEFL 110/120'],
      is_native: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'lang-de',
      name: 'German',
      code: 'de',
      proficiency: 'intermediate',
      is_native: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================================================
// SOCIAL LINKS - SLAVIGRAD THEMED
// ============================================================================

const socialLinks: SocialLink[] = [
  {
    id: 'social-github',
    platform: 'GitHub',
    url: 'https://github.com/Slavigrad',
    icon: 'github',
    label: 'Code Repository',
    username: 'lubomir-slavigrad',
    verified: true,
    description: 'Open source contributions and personal projects',
    primary: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'social-linkedin',
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/lubomir-dobrovodsky/',
    icon: 'linkedin',
    label: 'Professional Network',
    username: 'lubomir-slavigrad',
    verified: true,
    follower_count: 2500,
    description: 'Professional networking and career updates',
    primary: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'social-email',
    platform: 'Email',
    url: 'mailto:notavailable@slavigrad.net',
    icon: 'mail',
    label: 'Direct Contact',
    description: 'Best way to reach me for opportunities',
    primary: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'social-website',
    platform: 'Website',
    url: 'https://slavigrad.net',
    icon: 'globe',
    label: 'Digital Realm',
    description: 'Welcome to the Chronicles of Slavigrad',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// ============================================================================
// STATISTICS - PROFESSIONAL METRICS
// ============================================================================

const stats: Stat[] = [
  {
    id: 'stat-experience',
    title: 'Years of Experience',
    value: '20+',
    icon: 'briefcase',
    description: 'Professional software development across multiple domains',
    trend: 'up',
    color: 'primary',
    category: 'experience',
    unit: 'years',
    source: 'calculated',
    format: 'number',
    show_trend: true,
    highlight: true,
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'stat-projects',
    title: 'Projects Completed',
    value: '150+',
    icon: 'code',
    description: 'From enterprise systems to personal innovations',
    trend: 'up',
    color: 'secondary',
    category: 'projects',
    unit: 'projects',
    source: 'estimated',
    format: 'number',
    show_trend: true,
    highlight: true,
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'stat-technologies',
    title: 'Technologies Mastered',
    value: '25+',
    icon: 'cpu',
    description: 'Modern frameworks, languages, and development tools',
    trend: 'up',
    color: 'accent',
    category: 'skills',
    unit: 'technologies',
    source: 'skills_count',
    format: 'number',
    show_trend: true,
    highlight: true,
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'stat-teams',
    title: 'Teams Led',
    value: '12+',
    icon: 'users',
    description: 'Cross-functional development teams and mentoring',
    trend: 'neutral',
    color: 'primary',
    category: 'achievements',
    unit: 'teams',
    source: 'experience_data',
    format: 'number',
    show_trend: false,
    highlight: false,
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'stat-architecture',
    title: 'Systems Architected',
    value: '50+',
    icon: 'layers',
    description: 'Scalable microservices and enterprise architectures',
    trend: 'up',
    color: 'secondary',
    category: 'achievements',
    unit: 'systems',
    source: 'experience_data',
    format: 'number',
    show_trend: true,
    highlight: true,
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'stat-coffee',
    title: 'Coffee Consumed',
    value: '∞',
    icon: 'coffee',
    description: 'Fuel for creativity and late-night coding sessions',
    trend: 'up',
    color: 'accent',
    category: 'custom',
    unit: 'cups',
    source: 'humor',
    format: 'number',
    show_trend: true,
    highlight: false,
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// ============================================================================
// SKILLS DATA - IMPORTED FROM SEPARATE FILE
// ============================================================================
// Skills data is now imported from ./skills-data.ts for better organization

// ============================================================================
// EXPORT THE COMPLETE CV DATA STRUCTURE
// ============================================================================
export const CV_DATA: CVData = {
  id: 'cv-data-lubomir-slavigrad',
  personalInfo,
  socialLinks,
  stats,
  skillCategories,
  skills,
  experiences,
  projects,

  // Additional sections (to be implemented)
  education: [],
  certifications: [],
  volunteerWork: [],
  publications: [],
  speaking: [],
  references: [],

  // Metadata
  data_schema_version: '2.0.0',
  lastUpdated: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
};
