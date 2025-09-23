import { Injectable, signal, computed, effect, Signal, WritableSignal } from '@angular/core';
import { 
  PersonalInfoSignals, 
  ThemeSignals, 
  NavigationSignals, 
  PerformanceSignals,
  createPersonalInfoSignals,
  createThemeSignals,
  createNavigationSignals,
  createPerformanceSignals
} from '../models/signal-models';

/**
 * Modern Angular signal-based state management service
 * Provides reactive state management using Angular signals
 */
@Injectable({
  providedIn: 'root'
})
export class SignalStateService {
  // Core application state signals
  private readonly _personalInfo = createPersonalInfoSignals();
  private readonly _theme = createThemeSignals();
  private readonly _navigation = createNavigationSignals();
  private readonly _performance = createPerformanceSignals();

  // Collection signals for dynamic data
  private readonly _experiences = signal<any[]>([]);
  private readonly _projects = signal<any[]>([]);
  private readonly _skills = signal<any[]>([]);

  // Loading and error state signals
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastUpdated = signal<Date | null>(null);

  // Public readonly access to state
  readonly personalInfo: PersonalInfoSignals = this._personalInfo;
  readonly theme: ThemeSignals = this._theme;
  readonly navigation: NavigationSignals = this._navigation;
  readonly performance: PerformanceSignals = this._performance;

  readonly experiences = this._experiences.asReadonly();
  readonly projects = this._projects.asReadonly();
  readonly skills = this._skills.asReadonly();

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();

  // Computed signals for derived state
  readonly totalExperienceYears = computed(() => {
    const exps = this._experiences();
    if (exps.length === 0) return 0;
    
    const totalMonths = exps.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);
    
    return Math.round(totalMonths / 12);
  });

  readonly featuredProjects = computed(() => 
    this._projects().filter(project => project.featured)
  );

  readonly skillsByCategory = computed(() => {
    const skills = this._skills();
    return skills.reduce((acc, skill) => {
      const category = skill.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, any[]>);
  });

  readonly currentThemeClass = computed(() => {
    const theme = this._theme.currentTheme();
    const reducedMotion = this._theme.reducedMotion();
    const highContrast = this._theme.highContrast();
    
    let classes = [`theme-${theme}`];
    if (reducedMotion) classes.push('reduced-motion');
    if (highContrast) classes.push('high-contrast');
    
    return classes.join(' ');
  });

  readonly isDataLoaded = computed(() => 
    this._experiences().length > 0 && 
    this._projects().length > 0 && 
    this._skills().length > 0
  );

  readonly appStatus = computed(() => {
    if (this._isLoading()) return 'loading';
    if (this._error()) return 'error';
    if (this.isDataLoaded()) return 'ready';
    return 'initializing';
  });

  constructor() {
    // Set up effects for automatic state persistence
    this.setupPersistenceEffects();
    
    // Set up theme effects
    this.setupThemeEffects();
    
    // Load initial state from storage
    this.loadPersistedState();
  }

  // Personal info management
  updatePersonalInfo(updates: Partial<{
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    summary: string;
    profileImage: string;
  }>): void {
    Object.entries(updates).forEach(([key, value]) => {
      if (key in this._personalInfo && value !== undefined) {
        (this._personalInfo as any)[key].set(value);
      }
    });
    this._lastUpdated.set(new Date());
  }

  // Experience management
  setExperiences(experiences: any[]): void {
    this._experiences.set(experiences);
    this._lastUpdated.set(new Date());
  }

  addExperience(experience: any): void {
    this._experiences.update(current => [...current, experience]);
    this._lastUpdated.set(new Date());
  }

  updateExperience(id: string, updates: Partial<any>): void {
    this._experiences.update(current => 
      current.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
    );
    this._lastUpdated.set(new Date());
  }

  removeExperience(id: string): void {
    this._experiences.update(current => current.filter(exp => exp.id !== id));
    this._lastUpdated.set(new Date());
  }

  // Project management
  setProjects(projects: any[]): void {
    this._projects.set(projects);
    this._lastUpdated.set(new Date());
  }

  addProject(project: any): void {
    this._projects.update(current => [...current, project]);
    this._lastUpdated.set(new Date());
  }

  updateProject(id: string, updates: Partial<any>): void {
    this._projects.update(current => 
      current.map(proj => proj.id === id ? { ...proj, ...updates } : proj)
    );
    this._lastUpdated.set(new Date());
  }

  removeProject(id: string): void {
    this._projects.update(current => current.filter(proj => proj.id !== id));
    this._lastUpdated.set(new Date());
  }

  // Skill management
  setSkills(skills: any[]): void {
    this._skills.set(skills);
    this._lastUpdated.set(new Date());
  }

  addSkill(skill: any): void {
    this._skills.update(current => [...current, skill]);
    this._lastUpdated.set(new Date());
  }

  updateSkill(id: string, updates: Partial<any>): void {
    this._skills.update(current => 
      current.map(skill => skill.id === id ? { ...skill, ...updates } : skill)
    );
    this._lastUpdated.set(new Date());
  }

  removeSkill(id: string): void {
    this._skills.update(current => current.filter(skill => skill.id !== id));
    this._lastUpdated.set(new Date());
  }

  // Theme management
  setTheme(theme: 'dark' | 'light' | 'auto'): void {
    this._theme.currentTheme.set(theme);
  }

  toggleAnimations(): void {
    this._theme.animationsEnabled.update(current => !current);
  }

  toggleGlassEffects(): void {
    this._theme.glassEffectsEnabled.update(current => !current);
  }

  setReducedMotion(enabled: boolean): void {
    this._theme.reducedMotion.set(enabled);
  }

  setHighContrast(enabled: boolean): void {
    this._theme.highContrast.set(enabled);
  }

  // Navigation management
  setCurrentSection(section: string): void {
    this._navigation.currentSection.set(section);
  }

  setScrolling(isScrolling: boolean): void {
    this._navigation.isScrolling.set(isScrolling);
  }

  updateScrollProgress(progress: number): void {
    this._navigation.scrollProgress.set(Math.max(0, Math.min(100, progress)));
  }

  setVisibleSections(sections: string[]): void {
    this._navigation.visibleSections.set(sections);
  }

  toggleMobileMenu(): void {
    this._navigation.mobileMenuOpen.update(current => !current);
  }

  closeMobileMenu(): void {
    this._navigation.mobileMenuOpen.set(false);
  }

  // Loading and error management
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  clearError(): void {
    this._error.set(null);
  }

  // Persistence effects
  private setupPersistenceEffects(): void {
    // Persist theme settings
    effect(() => {
      const themeData = {
        currentTheme: this._theme.currentTheme(),
        animationsEnabled: this._theme.animationsEnabled(),
        glassEffectsEnabled: this._theme.glassEffectsEnabled(),
        reducedMotion: this._theme.reducedMotion(),
        highContrast: this._theme.highContrast()
      };
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cv-theme-settings', JSON.stringify(themeData));
      }
    });

    // Persist navigation state
    effect(() => {
      const navData = {
        currentSection: this._navigation.currentSection(),
        scrollProgress: this._navigation.scrollProgress()
      };
      
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('cv-navigation-state', JSON.stringify(navData));
      }
    });
  }

  // Theme effects
  private setupThemeEffects(): void {
    // Apply theme to document
    effect(() => {
      const theme = this._theme.currentTheme();
      const reducedMotion = this._theme.reducedMotion();
      const highContrast = this._theme.highContrast();
      
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.toggle('reduced-motion', reducedMotion);
        document.documentElement.classList.toggle('high-contrast', highContrast);
      }
    });

    // Handle system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      effect(() => {
        if (this._theme.currentTheme() === 'auto') {
          const systemTheme = mediaQuery.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', systemTheme);
        }
      });
    }
  }

  // Load persisted state
  private loadPersistedState(): void {
    if (typeof localStorage !== 'undefined') {
      // Load theme settings
      const themeData = localStorage.getItem('cv-theme-settings');
      if (themeData) {
        try {
          const theme = JSON.parse(themeData);
          this._theme.currentTheme.set(theme.currentTheme || 'dark');
          this._theme.animationsEnabled.set(theme.animationsEnabled ?? true);
          this._theme.glassEffectsEnabled.set(theme.glassEffectsEnabled ?? true);
          this._theme.reducedMotion.set(theme.reducedMotion ?? false);
          this._theme.highContrast.set(theme.highContrast ?? false);
        } catch (error) {
          console.warn('Failed to load theme settings:', error);
        }
      }
    }

    if (typeof sessionStorage !== 'undefined') {
      // Load navigation state
      const navData = sessionStorage.getItem('cv-navigation-state');
      if (navData) {
        try {
          const nav = JSON.parse(navData);
          this._navigation.currentSection.set(nav.currentSection || 'hero');
          this._navigation.scrollProgress.set(nav.scrollProgress || 0);
        } catch (error) {
          console.warn('Failed to load navigation state:', error);
        }
      }
    }
  }

  // Reset all state
  reset(): void {
    // Reset collections
    this._experiences.set([]);
    this._projects.set([]);
    this._skills.set([]);

    // Reset loading state
    this._isLoading.set(false);
    this._error.set(null);
    this._lastUpdated.set(null);

    // Reset navigation
    this._navigation.currentSection.set('hero');
    this._navigation.isScrolling.set(false);
    this._navigation.scrollProgress.set(0);
    this._navigation.visibleSections.set([]);
    this._navigation.mobileMenuOpen.set(false);

    // Clear storage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('cv-theme-settings');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('cv-navigation-state');
    }
  }
}
