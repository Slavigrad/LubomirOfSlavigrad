import { Component, Input, computed, signal } from '@angular/core';

import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { createButtonVariants, buttonCompoundVariants, combineVariants } from '../../utils';

// Create button variants using shared variant system
const buttonVariants = combineVariants(
  createButtonVariants('btn'),
  buttonCompoundVariants
);

// Generate TypeScript types from CVA variants
type ButtonVariants = VariantProps<typeof buttonVariants>;
export type ButtonVariant = ButtonVariants['variant'];
export type ButtonSize = ButtonVariants['size'];

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  template: `
    <button
      [class]="buttonClasses()"
      [disabled]="disabled"
      [type]="type"
    >
      @if (loading) {
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
      }
      @if (icon && !loading) {
        <span class="mr-2" [innerHTML]="icon"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    button {
      @apply relative inline-flex items-center justify-center font-medium transition-all duration-300;
      @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary;
      @apply disabled:opacity-50 disabled:cursor-not-allowed;
    }

    /* Variant Styles */
    .btn-primary {
      @apply bg-primary text-white hover:bg-primary/90;
      @apply shadow-lg hover:shadow-xl;
      background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
    }

    .btn-secondary {
      @apply bg-secondary text-white hover:bg-secondary/90;
      @apply shadow-lg hover:shadow-xl;
      background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    }

    .btn-ghost {
      @apply bg-transparent text-foreground hover:bg-muted;
      @apply border border-transparent hover:border-border;
    }

    .btn-outline {
      @apply bg-transparent text-foreground border border-border;
      @apply hover:bg-muted hover:border-primary;
    }

    /* Aurora Glass Button - Premium Glassmorphism */
    .btn-glass {
      @apply text-white transition-all duration-300;
      position: relative;
      overflow: hidden;

      /* Aurora Glass: Multi-layer gradient background */
      background: linear-gradient(135deg,
        rgba(74, 144, 255, 0.15),
        rgba(74, 144, 255, 0.08));

      /* Aurora Glass: Enhanced backdrop blur with saturation boost */
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);

      /* Aurora Glass: Luminous gradient borders */
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-top-color: rgba(255, 255, 255, 0.2);
      border-left-color: rgba(255, 255, 255, 0.2);
      border-bottom-color: rgba(0, 0, 0, 0.15);
      border-right-color: rgba(0, 0, 0, 0.1);

      /* Aurora Glass: Layered shadows */
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.3),
        0 8px 40px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    /* Aurora Glass: Animated gradient overlay */
    .btn-glass::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(120deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.05));
      background-size: 200% 200%;
      animation: moveGradient 15s ease infinite;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: inherit;
    }

    .btn-glass:hover::before {
      opacity: 1;
    }

    .btn-glass:hover {
      background: linear-gradient(135deg,
        rgba(74, 144, 255, 0.25),
        rgba(74, 144, 255, 0.15));
      border-top-color: rgba(255, 255, 255, 0.3);
      border-left-color: rgba(255, 255, 255, 0.3);
      box-shadow:
        0 6px 30px rgba(0, 0, 0, 0.4),
        0 12px 60px rgba(74, 144, 255, 0.3),
        0 0 40px rgba(74, 144, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transform: translateY(-2px) scale(1.02);
    }

    .btn-glass:active {
      transform: translateY(0) scale(0.98);
    }

    /* Size Styles */
    .btn-sm {
      @apply px-3 py-1.5 text-sm rounded-md;
    }

    .btn-md {
      @apply px-4 py-2 text-base rounded-lg;
    }

    .btn-lg {
      @apply px-6 py-3 text-lg rounded-xl;
    }

    /* Hover Effects - Enhanced */
    .btn-primary:hover,
    .btn-secondary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.2),
        0 0 30px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:active,
    .btn-secondary:active {
      transform: translateY(0) scale(0.98);
    }

    /* Compound Variant: Glass + Large with enhanced glow effect */
    .glass-glow-effect {
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 0 30px rgba(74, 144, 255, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .glass-glow-effect:hover {
      box-shadow:
        0 12px 50px rgba(0, 0, 0, 0.4),
        0 0 50px rgba(74, 144, 255, 0.6),
        0 0 80px rgba(74, 144, 255, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() icon: string = '';

  readonly buttonClasses = computed(() =>
    clsx(
      buttonVariants({
        variant: this.variant,
        size: this.size
      }),
      {
        'cursor-wait': this.loading,
        'opacity-50': this.disabled
      }
    )
  );
}
