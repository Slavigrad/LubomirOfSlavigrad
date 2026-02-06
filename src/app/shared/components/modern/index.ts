/**
 * Modern Angular Components Index
 * Exports all modern Angular 21+ components and utilities
 */

// Modern signal-based components
export { ModernCardComponent } from '../modern-card/modern-card.component';
export { SignalFormComponent, type FormField, type FormData, type FormErrors } from '../signal-form/signal-form.component';
export { ModernLifecycleComponent } from '../modern-lifecycle/modern-lifecycle.component';

// Modern signal models and utilities
export * from '../../models/signal-models';

// Modern signal-based services
export { SignalStateService } from '../../services/signal-state.service';

// Modern directives
export { LazyImageDirective, LazyBackgroundDirective } from '../../directives/lazy-image.directive';

// Modern performance components
export { PerformanceMonitorComponent } from '../performance-monitor/performance-monitor.component';

/**
 * Collection of all modern Angular components for easy importing
 */
export const MODERN_COMPONENTS = [
  'ModernCardComponent',
  'SignalFormComponent',
  'ModernLifecycleComponent',
  'PerformanceMonitorComponent'
] as const;

/**
 * Collection of all modern Angular directives for easy importing
 */
export const MODERN_DIRECTIVES = [
  'LazyImageDirective',
  'LazyBackgroundDirective'
] as const;

/**
 * Collection of all modern Angular services for easy importing
 */
export const MODERN_SERVICES = [
  'SignalStateService'
] as const;

/**
 * All modern Angular features combined
 */
export const MODERN_ANGULAR_FEATURES = [
  ...MODERN_COMPONENTS,
  ...MODERN_DIRECTIVES,
  ...MODERN_SERVICES
] as const;

/**
 * Type definitions for modern Angular features
 */
export type ModernComponent = typeof MODERN_COMPONENTS[number];
export type ModernDirective = typeof MODERN_DIRECTIVES[number];
export type ModernService = typeof MODERN_SERVICES[number];
export type ModernAngularFeature = typeof MODERN_ANGULAR_FEATURES[number];

/**
 * Utility function to check if a feature is a modern Angular component
 */
export function isModernComponent(feature: any): feature is ModernComponent {
  return MODERN_COMPONENTS.includes(feature);
}

/**
 * Utility function to check if a feature is a modern Angular directive
 */
export function isModernDirective(feature: any): feature is ModernDirective {
  return MODERN_DIRECTIVES.includes(feature);
}

/**
 * Utility function to check if a feature is a modern Angular service
 */
export function isModernService(feature: any): feature is ModernService {
  return MODERN_SERVICES.includes(feature);
}

/**
 * Modern Angular feature detection utilities
 */
export const ModernAngularUtils = {
  /**
   * Check if the current Angular version supports modern features
   */
  isModernAngularSupported(): boolean {
    // Check for Angular 21+ features
    try {
      // Test for signal-based inputs (Angular 17.1+)
      const hasSignalInputs = typeof (globalThis as any).ng?.input === 'function';

      // Test for new control flow (Angular 17+)
      const hasNewControlFlow = typeof (globalThis as any).ng?.['@if'] !== 'undefined';

      // Test for standalone components (Angular 14+)
      const hasStandaloneComponents = typeof (globalThis as any).ng?.Component !== 'undefined';

      return hasSignalInputs || hasNewControlFlow || hasStandaloneComponents;
    } catch {
      return false;
    }
  },

  /**
   * Get the list of available modern features
   */
  getAvailableFeatures(): string[] {
    const features: string[] = [];

    if (typeof (globalThis as any).ng?.signal === 'function') {
      features.push('signals');
    }

    if (typeof (globalThis as any).ng?.input === 'function') {
      features.push('signal-inputs');
    }

    if (typeof (globalThis as any).ng?.output === 'function') {
      features.push('signal-outputs');
    }

    if (typeof (globalThis as any).ng?.model === 'function') {
      features.push('signal-models');
    }

    if (typeof (globalThis as any).ng?.viewChild === 'function') {
      features.push('signal-view-child');
    }

    if (typeof (globalThis as any).ng?.contentChild === 'function') {
      features.push('signal-content-child');
    }

    features.push('standalone-components');
    features.push('new-control-flow');
    features.push('inject-function');
    features.push('computed-signals');
    features.push('effect-function');

    return features;
  },

  /**
   * Check if a specific modern feature is available
   */
  hasFeature(feature: string): boolean {
    return this.getAvailableFeatures().includes(feature);
  },

  /**
   * Get modern Angular version information
   */
  getVersionInfo(): {
    isModern: boolean;
    features: string[];
    recommendations: string[];
  } {
    const features = this.getAvailableFeatures();
    const isModern = this.isModernAngularSupported();

    const recommendations: string[] = [];

    if (!this.hasFeature('signals')) {
      recommendations.push('Upgrade to Angular 16+ for signals support');
    }

    if (!this.hasFeature('signal-inputs')) {
      recommendations.push('Upgrade to Angular 17.1+ for signal-based inputs');
    }

    if (!this.hasFeature('new-control-flow')) {
      recommendations.push('Upgrade to Angular 17+ for new control flow syntax');
    }

    if (features.length < 8) {
      recommendations.push('Consider upgrading to Angular 21+ for full modern feature support');
    }

    return {
      isModern,
      features,
      recommendations
    };
  }
};

/**
 * Modern Angular development best practices
 */
export const ModernAngularBestPractices = {
  /**
   * Signal-based component guidelines
   */
  signals: {
    // Use readonly signals for public API
    useReadonlySignals: 'Always expose signals as readonly to prevent external mutation',

    // Use computed for derived state
    useComputedForDerivedState: 'Use computed() for values derived from other signals',

    // Use effects sparingly
    useEffectsSparingly: 'Use effect() only for side effects, not for derived state',

    // Prefer signal inputs over @Input
    preferSignalInputs: 'Use signal-based inputs for better type safety and reactivity'
  },

  /**
   * Component architecture guidelines
   */
  components: {
    // Use standalone components
    useStandaloneComponents: 'Prefer standalone components over NgModules',

    // Use OnPush change detection
    useOnPushChangeDetection: 'Use OnPush change detection with signals for better performance',

    // Use inject() function
    useInjectFunction: 'Use inject() function instead of constructor injection',

    // Use new control flow
    useNewControlFlow: 'Use @if, @for, @switch instead of *ngIf, *ngFor, *ngSwitch'
  },

  /**
   * Performance guidelines
   */
  performance: {
    // Lazy load components
    useLazyLoading: 'Implement lazy loading for better initial load performance',

    // Use trackBy functions
    useTrackByFunctions: 'Always use trackBy functions with @for loops',

    // Minimize effect usage
    minimizeEffectUsage: 'Use effects only when necessary, prefer computed signals',

    // Use async pipe
    useAsyncPipe: 'Use async pipe for observables in templates'
  },

  /**
   * Testing guidelines
   */
  testing: {
    // Test signal behavior
    testSignalBehavior: 'Test signal updates and computed values',

    // Use TestBed with standalone components
    useTestBedWithStandalone: 'Configure TestBed for standalone components',

    // Test accessibility
    testAccessibility: 'Include accessibility testing in component tests',

    // Test performance
    testPerformance: 'Include performance tests for critical components'
  }
};

/**
 * Export everything for convenience
 */
export default {
  components: MODERN_COMPONENTS,
  directives: MODERN_DIRECTIVES,
  services: MODERN_SERVICES,
  utils: ModernAngularUtils,
  bestPractices: ModernAngularBestPractices
};
