import { signal, computed, Signal, WritableSignal } from '@angular/core';

/**
 * Modern Angular signal-based models for type-safe reactive state management
 */

// Base signal model interface
export interface SignalModel<T> {
  readonly value: Signal<T>;
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<string | null>;
  update(value: T): void;
  reset(): void;
}

// Signal-based personal info model
export interface PersonalInfoSignals {
  readonly name: WritableSignal<string>;
  readonly title: WritableSignal<string>;
  readonly email: WritableSignal<string>;
  readonly phone: WritableSignal<string>;
  readonly location: WritableSignal<string>;
  readonly website: WritableSignal<string>;
  readonly linkedin: WritableSignal<string>;
  readonly github: WritableSignal<string>;
  readonly summary: WritableSignal<string>;
  readonly profileImage: WritableSignal<string>;
}

// Signal-based experience model
export interface ExperienceSignals {
  readonly id: WritableSignal<string>;
  readonly company: WritableSignal<string>;
  readonly position: WritableSignal<string>;
  readonly startDate: WritableSignal<string>;
  readonly endDate: WritableSignal<string | null>;
  readonly current: WritableSignal<boolean>;
  readonly description: WritableSignal<string>;
  readonly technologies: WritableSignal<string[]>;
  readonly achievements: WritableSignal<string[]>;
  readonly location: WritableSignal<string>;
}

// Signal-based project model
export interface ProjectSignals {
  readonly id: WritableSignal<string>;
  readonly name: WritableSignal<string>;
  readonly description: WritableSignal<string>;
  readonly technologies: WritableSignal<string[]>;
  readonly githubUrl: WritableSignal<string | null>;
  readonly liveUrl: WritableSignal<string | null>;
  readonly imageUrl: WritableSignal<string | null>;
  readonly featured: WritableSignal<boolean>;
  readonly status: WritableSignal<'completed' | 'in-progress' | 'planned'>;
}

// Signal-based skill model
export interface SkillSignals {
  readonly id: WritableSignal<string>;
  readonly name: WritableSignal<string>;
  readonly category: WritableSignal<string>;
  readonly level: WritableSignal<'beginner' | 'intermediate' | 'advanced' | 'expert'>;
  readonly yearsOfExperience: WritableSignal<number>;
  readonly lastUsed: WritableSignal<string>;
  readonly certified: WritableSignal<boolean>;
}

// Signal-based theme model
export interface ThemeSignals {
  readonly currentTheme: WritableSignal<'dark' | 'light' | 'auto'>;
  readonly animationsEnabled: WritableSignal<boolean>;
  readonly glassEffectsEnabled: WritableSignal<boolean>;
  readonly reducedMotion: WritableSignal<boolean>;
  readonly highContrast: WritableSignal<boolean>;
}

// Signal-based form state model
export interface FormSignals<T> {
  readonly value: WritableSignal<T>;
  readonly errors: WritableSignal<Record<string, string[]>>;
  readonly touched: WritableSignal<Record<string, boolean>>;
  readonly dirty: WritableSignal<boolean>;
  readonly valid: WritableSignal<boolean>;
  readonly pending: WritableSignal<boolean>;
  readonly submitted: WritableSignal<boolean>;
}

// Signal-based navigation model
export interface NavigationSignals {
  readonly currentSection: WritableSignal<string>;
  readonly isScrolling: WritableSignal<boolean>;
  readonly scrollProgress: WritableSignal<number>;
  readonly visibleSections: WritableSignal<string[]>;
  readonly mobileMenuOpen: WritableSignal<boolean>;
}

// Signal-based performance model
export interface PerformanceSignals {
  readonly metrics: WritableSignal<{
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  }>;
  readonly score: WritableSignal<number>;
  readonly isMonitoring: WritableSignal<boolean>;
  readonly optimizationsEnabled: WritableSignal<boolean>;
}

// Factory functions for creating signal models
export function createPersonalInfoSignals(): PersonalInfoSignals {
  return {
    name: signal(''),
    title: signal(''),
    email: signal(''),
    phone: signal(''),
    location: signal(''),
    website: signal(''),
    linkedin: signal(''),
    github: signal(''),
    summary: signal(''),
    profileImage: signal('')
  };
}

export function createExperienceSignals(): ExperienceSignals {
  return {
    id: signal(''),
    company: signal(''),
    position: signal(''),
    startDate: signal(''),
    endDate: signal(null),
    current: signal(false),
    description: signal(''),
    technologies: signal([]),
    achievements: signal([]),
    location: signal('')
  };
}

export function createProjectSignals(): ProjectSignals {
  return {
    id: signal(''),
    name: signal(''),
    description: signal(''),
    technologies: signal([]),
    githubUrl: signal(null),
    liveUrl: signal(null),
    imageUrl: signal(null),
    featured: signal(false),
    status: signal('planned' as const)
  };
}

export function createSkillSignals(): SkillSignals {
  return {
    id: signal(''),
    name: signal(''),
    category: signal(''),
    level: signal('beginner' as const),
    yearsOfExperience: signal(0),
    lastUsed: signal(''),
    certified: signal(false)
  };
}

export function createThemeSignals(): ThemeSignals {
  return {
    currentTheme: signal('dark' as const),
    animationsEnabled: signal(true),
    glassEffectsEnabled: signal(true),
    reducedMotion: signal(false),
    highContrast: signal(false)
  };
}

export function createFormSignals<T>(initialValue: T): FormSignals<T> {
  return {
    value: signal(initialValue),
    errors: signal({}),
    touched: signal({}),
    dirty: signal(false),
    valid: signal(true),
    pending: signal(false),
    submitted: signal(false)
  };
}

export function createNavigationSignals(): NavigationSignals {
  return {
    currentSection: signal('hero'),
    isScrolling: signal(false),
    scrollProgress: signal(0),
    visibleSections: signal([]),
    mobileMenuOpen: signal(false)
  };
}

export function createPerformanceSignals(): PerformanceSignals {
  return {
    metrics: signal({
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0
    }),
    score: signal(0),
    isMonitoring: signal(false),
    optimizationsEnabled: signal(true)
  };
}

// Signal-based computed helpers
export function createComputedFullName(firstName: Signal<string>, lastName: Signal<string>): Signal<string> {
  return computed(() => `${firstName()} ${lastName()}`.trim());
}

export function createComputedExperienceYears(experiences: Signal<any[]>): Signal<number> {
  return computed(() => {
    const exps = experiences();
    if (exps.length === 0) return 0;
    
    const totalMonths = exps.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);
    
    return Math.round(totalMonths / 12);
  });
}

export function createComputedSkillsByCategory(skills: Signal<any[]>): Signal<Record<string, any[]>> {
  return computed(() => {
    const skillsArray = skills();
    return skillsArray.reduce((acc, skill) => {
      const category = skill.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, any[]>);
  });
}

export function createComputedFeaturedProjects(projects: Signal<any[]>): Signal<any[]> {
  return computed(() => projects().filter(project => project.featured));
}

// Signal-based validation helpers
export function createEmailValidator(email: Signal<string>): Signal<boolean> {
  return computed(() => {
    const emailValue = email();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  });
}

export function createRequiredValidator(value: Signal<string>): Signal<boolean> {
  return computed(() => value().trim().length > 0);
}

export function createMinLengthValidator(value: Signal<string>, minLength: number): Signal<boolean> {
  return computed(() => value().length >= minLength);
}

export function createMaxLengthValidator(value: Signal<string>, maxLength: number): Signal<boolean> {
  return computed(() => value().length <= maxLength);
}
