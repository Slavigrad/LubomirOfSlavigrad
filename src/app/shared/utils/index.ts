/**
 * Shared Utilities Index
 *
 * This file exports all shared utilities, variant definitions, and helper functions
 * for consistent component development across the application.
 */

// ============================================================================
// VARIANT DEFINITIONS
// ============================================================================

export {
  // Shared variant objects
  sharedSizeVariants,
  formSizeVariants,
  badgeSizeVariants,
  colorVariants,
  stateVariants,
  animationVariants,
  interactionVariants,

  // CVA factory functions
  createButtonVariants,
  createFormVariants,
  createBadgeVariants,
  createCardVariants,
  createCollapseVariants,

  // Type exports
  type SharedSize,
  type SharedColor,
  type SharedState,
  type SharedAnimation,
  type SharedInteraction,
  type ButtonVariantProps,
  type FormVariantProps,
  type BadgeVariantProps,
  type CardVariantProps,
  type CollapseVariantProps
} from './variant-definitions';

// ============================================================================
// COMPOUND VARIANTS
// ============================================================================

export {
  // Compound variant arrays
  buttonCompoundVariants,
  formCompoundVariants,
  badgeCompoundVariants,
  cardCompoundVariants,
  collapseCompoundVariants,
  animationCompoundVariants,
  a11yCompoundVariants,

  // Responsive and theme variants
  responsiveVariants,
  themeVariants,

  // Utility functions
  combineVariants,
  createResponsiveVariant,
  createThemeVariant,

  // Type exports
  type ButtonCompoundVariant,
  type FormCompoundVariant,
  type BadgeCompoundVariant,
  type CardCompoundVariant,
  type CollapseCompoundVariant,
  type ResponsiveVariant,
  type ThemeVariant,
  type AnimationCompoundVariant,
  type A11yCompoundVariant
} from './compound-variants';

// ============================================================================
// INTERVAL MANAGER
// ============================================================================

export { IntervalManager } from './interval-manager';

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

export {
  // Animation service and directives
  AnimationService,
  useScrollAnimation,
  ScrollAnimateDirective,
  InteractiveAnimateDirective,

  // Animation styles and configurations
  ANIMATION_STYLES,

  // Type exports
  type AnimationOptions,
  type ScrollAnimationConfig,
  type InteractiveAnimationConfig
} from './animations';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility function to merge variant classes with custom classes
 * Ensures proper class precedence and deduplication
 */
export function mergeVariantClasses(
  variantClasses: string,
  customClasses?: string
): string {
  if (!customClasses) return variantClasses;

  // Simple concatenation - clsx will handle deduplication
  return `${variantClasses} ${customClasses}`;
}

/**
 * Utility function to create conditional variant classes
 */
export function conditionalVariant(
  condition: boolean,
  trueVariant: string,
  falseVariant: string = ''
): string {
  return condition ? trueVariant : falseVariant;
}

/**
 * Utility function to create size-responsive classes
 */
export function responsiveSize(
  baseSize: 'sm' | 'md' | 'lg',
  mobileSize?: 'sm' | 'md' | 'lg'
): string {
  if (!mobileSize) return baseSize;
  return `${mobileSize} md:${baseSize}`;
}

/**
 * Utility function to create variant-aware focus classes
 */
export function createFocusClasses(variant: string): string {
  const focusMap: Record<string, string> = {
    primary: 'focus:ring-primary focus:border-primary',
    secondary: 'focus:ring-secondary focus:border-secondary',
    accent: 'focus:ring-accent focus:border-accent',
    success: 'focus:ring-green-500 focus:border-green-500',
    warning: 'focus:ring-yellow-500 focus:border-yellow-500',
    error: 'focus:ring-red-500 focus:border-red-500',
    outline: 'focus:ring-primary focus:border-primary',
    ghost: 'focus:ring-primary focus:border-primary',
    glass: 'focus:ring-white/50 focus:border-white/50'
  };

  return focusMap[variant] || focusMap['primary'];
}

/**
 * Utility function to create hover classes based on variant
 */
export function createHoverClasses(variant: string): string {
  const hoverMap: Record<string, string> = {
    primary: 'hover:bg-primary/90',
    secondary: 'hover:bg-secondary/90',
    accent: 'hover:bg-accent/90',
    success: 'hover:bg-green-600',
    warning: 'hover:bg-yellow-600',
    error: 'hover:bg-red-600',
    outline: 'hover:bg-muted',
    ghost: 'hover:bg-muted',
    glass: 'hover:bg-white/20'
  };

  return hoverMap[variant] || hoverMap['primary'];
}

/**
 * Utility function to create disabled state classes
 */
export function createDisabledClasses(disabled: boolean): string {
  return disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
}

/**
 * Utility function to create loading state classes
 */
export function createLoadingClasses(loading: boolean): string {
  return loading ? 'cursor-wait opacity-75' : '';
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Common CSS transition classes
 */
export const TRANSITIONS = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  colors: 'transition-colors duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out'
} as const;

/**
 * Common shadow classes
 */
export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  none: 'shadow-none'
} as const;

/**
 * Common border radius classes
 */
export const BORDER_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full'
} as const;

/**
 * Common spacing classes
 */
export const SPACING = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
} as const;

// ============================================================================
// ID GENERATION
// ============================================================================

export { generateId } from './id-generator';

// ============================================================================
// FEATURE TOGGLE
// ============================================================================

export { isLocalhost, createFeatureConfig } from './feature-toggle';

// ============================================================================
// LOCAL STORAGE CONFIG
// ============================================================================

export { loadSignalConfig, saveSignalConfig } from './local-storage-config';

// ============================================================================
// CANVAS NOISE
// ============================================================================

export {
  createNoisePattern,
  clearNoisePatternCache,
  type NoiseType,
  type NoisePatternOptions,
} from './canvas-noise';

// ============================================================================
// GLASS CARD RENDERER
// ============================================================================

export {
  renderGlassCardBackground,
  type GlassCardRenderOptions,
  type GlassCardRenderResult,
} from './glass-card-renderer';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TransitionType = keyof typeof TRANSITIONS;
export type ShadowType = keyof typeof SHADOWS;
export type BorderRadiusType = keyof typeof BORDER_RADIUS;
export type SpacingType = keyof typeof SPACING;
