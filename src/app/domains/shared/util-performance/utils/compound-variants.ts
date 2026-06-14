import { type ClassValue } from 'clsx';
import { colorVariants, sharedSizeVariants, badgeSizeVariants } from './variant-definitions';

/**
 * Compound Variants and Advanced Patterns
 * 
 * This file contains compound variant definitions and advanced styling patterns
 * that combine multiple variant dimensions for sophisticated component styling.
 * 
 * Compound variants are used when specific combinations of variants need
 * special styling that can't be achieved by simply combining individual variants.
 */

// ============================================================================
// BUTTON COMPOUND VARIANTS
// ============================================================================

/**
 * Button compound variants for special combinations
 */
export const buttonCompoundVariants = [
  // Glass + Large = Special glow effect
  {
    variant: 'glass' as const,
    size: 'lg' as const,
    class: 'glass-glow-effect shadow-2xl'
  },
  // Primary + Small = Compact primary styling
  {
    variant: 'primary' as const,
    size: 'sm' as const,
    class: 'font-semibold'
  },
  // Outline + Large = Enhanced border
  {
    variant: 'outline' as const,
    size: 'lg' as const,
    class: 'border-2 font-medium'
  }
] as const;

// ============================================================================
// FORM COMPOUND VARIANTS
// ============================================================================

/**
 * Form input compound variants for special combinations
 */
export const formCompoundVariants = [
  // Glass + Large = Enhanced glass effect
  {
    variant: 'glass' as const,
    size: 'lg' as const,
    class: 'backdrop-blur-2xl shadow-xl'
  },
  // Error state + Glass = Special error styling for glass inputs
  {
    variant: 'glass' as const,
    hasError: true as const,
    class: 'border-red-400/50 focus:ring-red-400/50'
  },
  // Outline + Error = Enhanced error border
  {
    variant: 'outline' as const,
    hasError: true as const,
    class: 'border-red-500 border-2'
  }
] as const;

// ============================================================================
// BADGE COMPOUND VARIANTS
// ============================================================================

/**
 * Badge compound variants for special combinations
 */
export const badgeCompoundVariants = [
  // Success + Large = Enhanced success styling
  {
    variant: 'success' as const,
    size: 'lg' as const,
    class: 'shadow-green-500/25 shadow-lg'
  },
  // Error + Large = Enhanced error styling
  {
    variant: 'error' as const,
    size: 'lg' as const,
    class: 'shadow-red-500/25 shadow-lg'
  },
  // Primary + Small = Compact primary badge
  {
    variant: 'primary' as const,
    size: 'sm' as const,
    class: 'font-semibold'
  }
] as const;

// ============================================================================
// CARD COMPOUND VARIANTS
// ============================================================================

/**
 * Card compound variants for special combinations
 */
export const cardCompoundVariants = [
  // Glass + Hoverable = Enhanced glass hover effect
  {
    variant: 'glass' as const,
    hoverable: true as const,
    class: 'hover:backdrop-blur-3xl hover:shadow-2xl'
  },
  // Elevated + Hoverable = Enhanced elevation on hover
  {
    variant: 'elevated' as const,
    hoverable: true as const,
    class: 'hover:shadow-2xl hover:-translate-y-2'
  }
] as const;

// ============================================================================
// COLLAPSE COMPOUND VARIANTS
// ============================================================================

/**
 * Collapse compound variants for special combinations
 */
export const collapseCompoundVariants = [
  // Glass + Large = Enhanced glass collapse
  {
    variant: 'glass' as const,
    size: 'lg' as const,
    class: 'backdrop-blur-2xl shadow-xl'
  },
  // Card + Large = Enhanced card styling
  {
    variant: 'card' as const,
    size: 'lg' as const,
    class: 'shadow-2xl'
  },
  // Minimal + Disabled = Subtle disabled state
  {
    variant: 'minimal' as const,
    disabled: true as const,
    class: 'opacity-40'
  }
] as const;

// ============================================================================
// RESPONSIVE COMPOUND VARIANTS
// ============================================================================

/**
 * Responsive variants that change based on screen size
 */
export const responsiveVariants = {
  // Mobile-first responsive sizing
  mobileFirst: {
    sm: 'text-sm px-2 py-1 md:text-base md:px-4 md:py-2',
    md: 'text-base px-4 py-2 md:text-lg md:px-6 md:py-3',
    lg: 'text-lg px-6 py-3 md:text-xl md:px-8 md:py-4'
  },
  
  // Desktop-first responsive sizing
  desktopFirst: {
    sm: 'text-base px-4 py-2 sm:text-sm sm:px-2 sm:py-1',
    md: 'text-lg px-6 py-3 sm:text-base sm:px-4 sm:py-2',
    lg: 'text-xl px-8 py-4 sm:text-lg sm:px-6 sm:py-3'
  }
} as const;

// ============================================================================
// THEME-AWARE VARIANTS
// ============================================================================

/**
 * Theme-aware variants that adapt to light/dark mode
 */
export const themeVariants = {
  // Adaptive glass effect
  adaptiveGlass: 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10',
  
  // Adaptive text colors
  adaptiveText: 'text-gray-900 dark:text-gray-100',
  
  // Adaptive backgrounds
  adaptiveBackground: 'bg-white dark:bg-gray-900',
  
  // Adaptive borders
  adaptiveBorder: 'border-gray-200 dark:border-gray-700'
} as const;

// ============================================================================
// ANIMATION COMPOUND VARIANTS
// ============================================================================

/**
 * Animation compound variants for enhanced motion
 */
export const animationCompoundVariants = [
  // Glass + Slide = Enhanced glass animation
  {
    variant: 'glass' as const,
    animation: 'slide' as const,
    class: 'transition-all duration-500 ease-out'
  },
  // Card + Scale = Enhanced card scaling
  {
    variant: 'card' as const,
    animation: 'scale' as const,
    class: 'transition-transform duration-300 ease-bounce'
  }
] as const;

// ============================================================================
// ACCESSIBILITY COMPOUND VARIANTS
// ============================================================================

/**
 * Accessibility-focused compound variants
 */
export const a11yCompoundVariants = [
  // High contrast mode
  {
    highContrast: true as const,
    class: 'contrast-more:border-2 contrast-more:border-black dark:contrast-more:border-white'
  },
  // Reduced motion
  {
    reducedMotion: true as const,
    class: 'motion-reduce:transition-none motion-reduce:animate-none'
  },
  // Focus visible enhancements
  {
    enhancedFocus: true as const,
    class: 'focus-visible:ring-4 focus-visible:ring-offset-4'
  }
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility function to combine base variants with compound variants
 */
export function combineVariants<T extends Record<string, any>>(
  baseVariants: T,
  compoundVariants: readonly any[]
): T & { compoundVariants: typeof compoundVariants } {
  return {
    ...baseVariants,
    compoundVariants
  };
}

/**
 * Utility function to create responsive variant classes
 */
export function createResponsiveVariant(
  baseClass: string,
  breakpoints: Record<string, string>
): string {
  const classes = [baseClass];
  
  Object.entries(breakpoints).forEach(([breakpoint, className]) => {
    if (breakpoint === 'base') {
      classes.push(className);
    } else {
      classes.push(`${breakpoint}:${className}`);
    }
  });
  
  return classes.join(' ');
}

/**
 * Utility function to create theme-aware variant classes
 */
export function createThemeVariant(
  lightClass: string,
  darkClass: string
): string {
  return `${lightClass} dark:${darkClass}`;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ButtonCompoundVariant = typeof buttonCompoundVariants[number];
export type FormCompoundVariant = typeof formCompoundVariants[number];
export type BadgeCompoundVariant = typeof badgeCompoundVariants[number];
export type CardCompoundVariant = typeof cardCompoundVariants[number];
export type CollapseCompoundVariant = typeof collapseCompoundVariants[number];
export type ResponsiveVariant = keyof typeof responsiveVariants;
export type ThemeVariant = keyof typeof themeVariants;
export type AnimationCompoundVariant = typeof animationCompoundVariants[number];
export type A11yCompoundVariant = typeof a11yCompoundVariants[number];
