import { Injectable, signal, computed, effect } from '@angular/core';

export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  animations: {
    enabled: boolean;
    duration: 'fast' | 'normal' | 'slow';
  };
  glassEffect: {
    enabled: boolean;
    intensity: 'subtle' | 'medium' | 'strong';
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Available themes
  private readonly themes: ThemeConfig[] = [
    {
      name: 'slavigrad-chronicles',
      displayName: 'Slavigrad Chronicles',
      colors: {
        primary: '#3B82F6',    // Electric Blue
        secondary: '#8B5CF6',  // Purple
        accent: '#10B981',     // Green
        background: 'hsl(220 20% 5%)',
        foreground: 'hsl(210 40% 98%)'
      },
      animations: {
        enabled: true,
        duration: 'normal'
      },
      glassEffect: {
        enabled: true,
        intensity: 'medium'
      }
    },
    {
      name: 'cyber-neon',
      displayName: 'Cyber Neon',
      colors: {
        primary: '#00FFFF',    // Cyan
        secondary: '#FF00FF',  // Magenta
        accent: '#FFFF00',     // Yellow
        background: 'hsl(240 20% 3%)',
        foreground: 'hsl(180 100% 95%)'
      },
      animations: {
        enabled: true,
        duration: 'fast'
      },
      glassEffect: {
        enabled: true,
        intensity: 'strong'
      }
    },
    {
      name: 'minimal-dark',
      displayName: 'Minimal Dark',
      colors: {
        primary: '#6366F1',    // Indigo
        secondary: '#8B5CF6',  // Purple
        accent: '#06B6D4',     // Cyan
        background: 'hsl(220 15% 8%)',
        foreground: 'hsl(210 40% 95%)'
      },
      animations: {
        enabled: false,
        duration: 'normal'
      },
      glassEffect: {
        enabled: false,
        intensity: 'subtle'
      }
    }
  ];

  // Current theme state
  private _currentTheme = signal<ThemeConfig>(this.themes[0]);
  private _animationsEnabled = signal<boolean>(true);
  private _glassEffectsEnabled = signal<boolean>(true);
  private _reducedMotion = signal<boolean>(false);

  // Public readonly signals
  readonly currentTheme = this._currentTheme.asReadonly();
  readonly animationsEnabled = this._animationsEnabled.asReadonly();
  readonly glassEffectsEnabled = this._glassEffectsEnabled.asReadonly();
  readonly reducedMotion = this._reducedMotion.asReadonly();

  // Computed values
  readonly availableThemes = computed(() => this.themes);

  readonly effectiveAnimationsEnabled = computed(() =>
    this._animationsEnabled() && !this._reducedMotion() && this._currentTheme().animations.enabled
  );

  readonly effectiveGlassEnabled = computed(() =>
    this._glassEffectsEnabled() && this._currentTheme().glassEffect.enabled
  );

  readonly cssVariables = computed(() => {
    const theme = this._currentTheme();
    return {
      '--theme-primary': theme.colors.primary,
      '--theme-secondary': theme.colors.secondary,
      '--theme-accent': theme.colors.accent,
      '--theme-background': theme.colors.background,
      '--theme-foreground': theme.colors.foreground,
      '--orange': '24 95% 53%',
      '--animation-duration': this.getAnimationDuration(),
      '--glass-opacity': this.getGlassOpacity(),
      '--glass-blur': this.getGlassBlur()
    };
  });

  constructor() {
    // Load saved preferences
    this.loadPreferences();

    // Check for reduced motion preference
    this.checkReducedMotionPreference();

    // Apply theme changes to document
    effect(() => {
      this.applyThemeToDocument();
    });

    // Save preferences when they change
    effect(() => {
      this.savePreferences();
    });
  }

  // Theme management methods
  setTheme(themeName: string): void {
    const theme = this.themes.find(t => t.name === themeName);
    if (theme) {
      this._currentTheme.set(theme);
    }
  }

  toggleAnimations(): void {
    this._animationsEnabled.update(enabled => !enabled);
  }

  toggleGlassEffects(): void {
    this._glassEffectsEnabled.update(enabled => !enabled);
  }

  // Utility methods
  getSkillLevelColor(level: string): string {
    const theme = this._currentTheme();
    const colorMap = {
      'expert': theme.colors.primary,
      'advanced': theme.colors.secondary,
      'intermediate': theme.colors.accent,
      'beginner': 'hsl(var(--orange))' // Orange
    };
    return colorMap[level as keyof typeof colorMap] || colorMap.beginner;
  }

  getSectionColor(section: string): string {
    const theme = this._currentTheme();
    const colorMap = {
      'hero': theme.colors.primary,
      'experience': theme.colors.secondary,
      'projects': theme.colors.accent,
      'skills': theme.colors.primary,
      'contact': theme.colors.accent
    };
    return colorMap[section as keyof typeof colorMap] || theme.colors.primary;
  }

  getAnimationClass(animationType: string): string {
    if (!this.effectiveAnimationsEnabled()) {
      return '';
    }

    const duration = this._currentTheme().animations.duration;
    const baseClass = `animate-${animationType}`;

    switch (duration) {
      case 'fast':
        return `${baseClass} duration-200`;
      case 'slow':
        return `${baseClass} duration-700`;
      default:
        return `${baseClass} duration-300`;
    }
  }

  getGlassClass(): string {
    if (!this.effectiveGlassEnabled()) {
      return 'bg-card border border-border';
    }

    const intensity = this._currentTheme().glassEffect.intensity;
    switch (intensity) {
      case 'subtle':
        return 'glass-card backdrop-blur-sm';
      case 'strong':
        return 'glass-card backdrop-blur-2xl';
      default:
        return 'glass-card backdrop-blur-xl';
    }
  }

  // Private helper methods
  private getAnimationDuration(): string {
    const duration = this._currentTheme().animations.duration;
    switch (duration) {
      case 'fast': return '0.2s';
      case 'slow': return '0.7s';
      default: return '0.3s';
    }
  }

  private getGlassOpacity(): string {
    const intensity = this._currentTheme().glassEffect.intensity;
    switch (intensity) {
      case 'subtle': return '0.03';
      case 'strong': return '0.1';
      default: return '0.05';
    }
  }

  private getGlassBlur(): string {
    const intensity = this._currentTheme().glassEffect.intensity;
    switch (intensity) {
      case 'subtle': return '8px';
      case 'strong': return '32px';
      default: return '20px';
    }
  }

  private applyThemeToDocument(): void {
    const variables = this.cssVariables();
    const root = document.documentElement;

    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .concat(` theme-${this._currentTheme().name}`);

    // Add animation preference class
    if (this.effectiveAnimationsEnabled()) {
      document.body.classList.add('animations-enabled');
      document.body.classList.remove('animations-disabled');
    } else {
      document.body.classList.add('animations-disabled');
      document.body.classList.remove('animations-enabled');
    }

    // Add glass effect preference class
    if (this.effectiveGlassEnabled()) {
      document.body.classList.add('glass-enabled');
      document.body.classList.remove('glass-disabled');
    } else {
      document.body.classList.add('glass-disabled');
      document.body.classList.remove('glass-enabled');
    }
  }

  private checkReducedMotionPreference(): void {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._reducedMotion.set(mediaQuery.matches);

      mediaQuery.addEventListener('change', (e) => {
        this._reducedMotion.set(e.matches);
      });
    }
  }

  private loadPreferences(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('slavigrad-theme-preferences');
      if (saved) {
        try {
          const preferences = JSON.parse(saved);
          if (preferences.themeName) {
            this.setTheme(preferences.themeName);
          }
          if (typeof preferences.animationsEnabled === 'boolean') {
            this._animationsEnabled.set(preferences.animationsEnabled);
          }
          if (typeof preferences.glassEffectsEnabled === 'boolean') {
            this._glassEffectsEnabled.set(preferences.glassEffectsEnabled);
          }
        } catch (error) {
          console.warn('Failed to load theme preferences:', error);
        }
      }
    }
  }

  private savePreferences(): void {
    if (typeof localStorage !== 'undefined') {
      const preferences = {
        themeName: this._currentTheme().name,
        animationsEnabled: this._animationsEnabled(),
        glassEffectsEnabled: this._glassEffectsEnabled()
      };
      localStorage.setItem('slavigrad-theme-preferences', JSON.stringify(preferences));
    }
  }
}
