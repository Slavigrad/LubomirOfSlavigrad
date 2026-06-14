import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Shared Variant Definitions for UI Components
 *
 * This file contains centralized variant definitions that can be shared
 * across multiple components to ensure consistency and reduce duplication.
 *
 * Based on analysis of existing components:
 * - ButtonComponent, CardComponent, BadgeComponent
 * - CollapseComponent, InputComponent, TextareaComponent
 */

// ============================================================================
// SHARED SIZE VARIANTS
// ============================================================================

/**
 * Standard size variants used across components
 * Provides consistent sizing for buttons, inputs, badges, etc.
 */
export const sharedSizeVariants = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    rounded: 'rounded-md'
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-base',
    rounded: 'rounded-lg'
  },
  lg: {
    padding: 'px-5 py-3',
    text: 'text-lg',
    rounded: 'rounded-xl'
  }
} as const;

/**
 * Size variants for form inputs (slightly different padding)
 */
export const formSizeVariants = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    rounded: 'rounded-md'
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-base',
    rounded: 'rounded-lg'
  },
  lg: {
    padding: 'px-5 py-3',
    text: 'text-lg',
    rounded: 'rounded-xl'
  }
} as const;

/**
 * Size variants for badges (more compact)
 */
export const badgeSizeVariants = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    rounded: 'rounded'
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    rounded: 'rounded-md'
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    rounded: 'rounded-lg'
  }
} as const;

// ============================================================================
// SHARED COLOR VARIANTS
// ============================================================================

/**
 * Primary color variants used across components
 * Based on the design system colors from tailwind.config.js
 */
export const colorVariants = {
  primary: {
    bg: 'bg-primary',
    text: 'text-white',
    border: 'border-primary',
    hover: 'hover:bg-primary/90',
    focus: 'focus:ring-primary'
  },
  secondary: {
    bg: 'bg-secondary',
    text: 'text-white',
    border: 'border-secondary',
    hover: 'hover:bg-secondary/90',
    focus: 'focus:ring-secondary'
  },
  accent: {
    bg: 'bg-accent',
    text: 'text-white',
    border: 'border-accent',
    hover: 'hover:bg-accent/90',
    focus: 'focus:ring-accent'
  },
  success: {
    bg: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-500',
    hover: 'hover:bg-green-600',
    focus: 'focus:ring-green-500'
  },
  warning: {
    bg: 'bg-yellow-500',
    text: 'text-white',
    border: 'border-yellow-500',
    hover: 'hover:bg-yellow-600',
    focus: 'focus:ring-yellow-500'
  },
  error: {
    bg: 'bg-red-500',
    text: 'text-white',
    border: 'border-red-500',
    hover: 'hover:bg-red-600',
    focus: 'focus:ring-red-500'
  },
  outline: {
    bg: 'bg-transparent',
    text: 'text-foreground',
    border: 'border-border',
    hover: 'hover:bg-muted',
    focus: 'focus:ring-primary'
  },
  ghost: {
    bg: 'bg-transparent',
    text: 'text-foreground',
    border: 'border-transparent',
    hover: 'hover:bg-muted',
    focus: 'focus:ring-primary'
  },
  glass: {
    bg: 'bg-white/10',
    text: 'text-white',
    border: 'border-white/20',
    hover: 'hover:bg-white/20',
    focus: 'focus:ring-white/50',
    backdrop: 'backdrop-blur-xl'
  }
} as const;

// ============================================================================
// SHARED STATE VARIANTS
// ============================================================================

/**
 * Common state variants for interactive components
 */
export const stateVariants = {
  default: '',
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  loading: 'cursor-wait opacity-75',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-500 focus:ring-green-500 focus:border-green-500'
} as const;

// ============================================================================
// SHARED ANIMATION VARIANTS
// ============================================================================

/**
 * Animation variants for components with transitions
 */
export const animationVariants = {
  slide: 'transition-all duration-300 ease-in-out',
  fade: 'transition-opacity duration-300 ease-in-out',
  scale: 'transition-transform duration-300 ease-out',
  bounce: 'transition-transform duration-300 ease-bounce',
  none: ''
} as const;

// ============================================================================
// SHARED INTERACTION VARIANTS
// ============================================================================

/**
 * Interactive behavior variants
 */
export const interactionVariants = {
  hoverable: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
  clickable: 'active:scale-95 transition-transform duration-150',
  focusable: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
  none: ''
} as const;

// ============================================================================
// SHARED CVA CONFIGURATIONS
// ============================================================================

/**
 * Base CVA configuration for buttons and button-like components
 */
export const createButtonVariants = (baseClass: string) => cva(baseClass, {
  variants: {
    variant: {
      primary: `${colorVariants.primary.bg} ${colorVariants.primary.text} ${colorVariants.primary.border} ${colorVariants.primary.hover}`,
      secondary: `${colorVariants.secondary.bg} ${colorVariants.secondary.text} ${colorVariants.secondary.border} ${colorVariants.secondary.hover}`,
      accent: `${colorVariants.accent.bg} ${colorVariants.accent.text} ${colorVariants.accent.border} ${colorVariants.accent.hover}`,
      outline: `${colorVariants.outline.bg} ${colorVariants.outline.text} ${colorVariants.outline.border} ${colorVariants.outline.hover}`,
      ghost: `${colorVariants.ghost.bg} ${colorVariants.ghost.text} ${colorVariants.ghost.border} ${colorVariants.ghost.hover}`,
      glass: `${colorVariants.glass.bg} ${colorVariants.glass.text} ${colorVariants.glass.border} ${colorVariants.glass.hover} ${colorVariants.glass.backdrop}`
    },
    size: {
      sm: `${sharedSizeVariants.sm.padding} ${sharedSizeVariants.sm.text} ${sharedSizeVariants.sm.rounded}`,
      md: `${sharedSizeVariants.md.padding} ${sharedSizeVariants.md.text} ${sharedSizeVariants.md.rounded}`,
      lg: `${sharedSizeVariants.lg.padding} ${sharedSizeVariants.lg.text} ${sharedSizeVariants.lg.rounded}`
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
});

/**
 * Base CVA configuration for form inputs
 */
export const createFormVariants = (baseClass: string) => cva(baseClass, {
  variants: {
    variant: {
      default: `bg-input border border-border text-foreground ${colorVariants.primary.focus}`,
      glass: `${colorVariants.glass.bg} ${colorVariants.glass.border} ${colorVariants.glass.text} ${colorVariants.glass.focus} ${colorVariants.glass.backdrop}`,
      outline: `${colorVariants.outline.bg} border-2 ${colorVariants.outline.border} ${colorVariants.outline.text} ${colorVariants.primary.focus}`
    },
    size: {
      sm: `${formSizeVariants.sm.padding} ${formSizeVariants.sm.text} ${formSizeVariants.sm.rounded}`,
      md: `${formSizeVariants.md.padding} ${formSizeVariants.md.text} ${formSizeVariants.md.rounded}`,
      lg: `${formSizeVariants.lg.padding} ${formSizeVariants.lg.text} ${formSizeVariants.lg.rounded}`
    },
    hasError: {
      true: stateVariants.error,
      false: ''
    },
    hasIcon: {
      true: 'pl-10',
      false: ''
    },
    autoResize: {
      true: 'resize-none overflow-hidden',
      false: 'resize-vertical'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    hasError: false,
    hasIcon: false,
    autoResize: false
  }
});

/**
 * Base CVA configuration for badges
 */
export const createBadgeVariants = (baseClass: string) => cva(baseClass, {
  variants: {
    variant: {
      default: 'bg-muted text-muted-foreground border border-border',
      primary: `${colorVariants.primary.bg} ${colorVariants.primary.text}`,
      secondary: `${colorVariants.secondary.bg} ${colorVariants.secondary.text}`,
      accent: `${colorVariants.accent.bg} ${colorVariants.accent.text}`,
      success: `${colorVariants.success.bg} ${colorVariants.success.text}`,
      warning: `${colorVariants.warning.bg} ${colorVariants.warning.text}`,
      error: `${colorVariants.error.bg} ${colorVariants.error.text}`,
      outline: `${colorVariants.outline.bg} ${colorVariants.outline.text} ${colorVariants.outline.border}`
    },
    size: {
      sm: `${badgeSizeVariants.sm.padding} ${badgeSizeVariants.sm.text} ${badgeSizeVariants.sm.rounded}`,
      md: `${badgeSizeVariants.md.padding} ${badgeSizeVariants.md.text} ${badgeSizeVariants.md.rounded}`,
      lg: `${badgeSizeVariants.lg.padding} ${badgeSizeVariants.lg.text} ${badgeSizeVariants.lg.rounded}`
    },
    removable: {
      true: 'pr-1 cursor-pointer hover:opacity-80',
      false: ''
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    removable: false
  }
});

/**
 * Base CVA configuration for cards
 */
export const createCardVariants = (baseClass: string) => cva(baseClass, {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground border border-border shadow-sm',
      glass: `${colorVariants.glass.bg} ${colorVariants.glass.text} ${colorVariants.glass.border} ${colorVariants.glass.backdrop} shadow-lg`,
      elevated: 'bg-card text-card-foreground border border-border shadow-lg',
      outlined: 'bg-transparent text-foreground border-2 border-border'
    },
    hoverable: {
      true: interactionVariants.hoverable,
      false: ''
    }
  },
  defaultVariants: {
    variant: 'default',
    hoverable: true
  }
});

/**
 * Base CVA configuration for collapse components
 */
export const createCollapseVariants = (baseClass: string) => cva(baseClass, {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground border border-border',
      glass: `${colorVariants.glass.bg} ${colorVariants.glass.text} ${colorVariants.glass.border} ${colorVariants.glass.backdrop}`,
      bordered: 'bg-card text-card-foreground border-2 border-border',
      minimal: 'bg-transparent text-foreground',
      card: 'bg-card text-card-foreground border border-border shadow-md'
    },
    size: {
      sm: `${sharedSizeVariants.sm.padding} ${sharedSizeVariants.sm.text}`,
      md: `${sharedSizeVariants.md.padding} ${sharedSizeVariants.md.text}`,
      lg: `${sharedSizeVariants.lg.padding} ${sharedSizeVariants.lg.text}`
    },
    animation: {
      slide: animationVariants.slide,
      fade: animationVariants.fade,
      scale: animationVariants.scale,
      bounce: animationVariants.bounce
    },
    disabled: {
      true: stateVariants.disabled,
      false: ''
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    animation: 'slide',
    disabled: false
  }
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SharedSize = keyof typeof sharedSizeVariants;
export type SharedColor = keyof typeof colorVariants;
export type SharedState = keyof typeof stateVariants;
export type SharedAnimation = keyof typeof animationVariants;
export type SharedInteraction = keyof typeof interactionVariants;

// Export variant props types for components
export type ButtonVariantProps = VariantProps<ReturnType<typeof createButtonVariants>>;
export type FormVariantProps = VariantProps<ReturnType<typeof createFormVariants>>;
export type BadgeVariantProps = VariantProps<ReturnType<typeof createBadgeVariants>>;
export type CardVariantProps = VariantProps<ReturnType<typeof createCardVariants>>;
export type CollapseVariantProps = VariantProps<ReturnType<typeof createCollapseVariants>>;
