import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
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

    .btn-glass {
      @apply bg-white/10 text-white border border-white/20;
      @apply hover:bg-white/20 hover:border-white/30;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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

    /* Hover Effects */
    .btn-primary:hover,
    .btn-secondary:hover {
      transform: translateY(-1px);
    }

    .btn-glass:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    /* Compound Variant: Glass + Large with enhanced glow effect */
    .glass-glow-effect {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px rgba(59, 130, 246, 0.3);
    }

    .glass-glow-effect:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(59, 130, 246, 0.5);
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
