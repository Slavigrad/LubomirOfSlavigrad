import { Component, input, computed } from '@angular/core';

import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import {
  createButtonVariants,
  buttonCompoundVariants,
  combineVariants,
} from '../util-performance/utils';

// Create button variants using shared variant system
const buttonVariants = combineVariants(createButtonVariants('btn'), buttonCompoundVariants);

// Generate TypeScript types from CVA variants
type ButtonVariants = VariantProps<typeof buttonVariants>;
export type ButtonVariant = ButtonVariants['variant'];
export type ButtonSize = ButtonVariants['size'];

@Component({
  selector: 'app-button',
  template: `
    <button [class]="buttonClasses()" [disabled]="disabled()" [type]="type()">
      @if (loading()) {
        <div
          class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"
        ></div>
      }
      @if (icon() && !loading()) {
        <span class="mr-2" [innerHTML]="icon()"></span>
      }
      <ng-content />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
      }

      button:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow:
          0 0 0 2px var(--color-background),
          0 0 0 4px var(--color-primary);
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Variant Styles */
      .btn-primary {
        color: #fff;
        box-shadow:
          0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      }
      .btn-primary:hover {
        background-color: color-mix(in oklab, var(--color-primary) 90%, transparent);
        box-shadow:
          0 20px 25px -5px rgb(0 0 0 / 0.1),
          0 8px 10px -6px rgb(0 0 0 / 0.1);
      }

      .btn-secondary {
        color: #fff;
        box-shadow:
          0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      }
      .btn-secondary:hover {
        background-color: color-mix(in oklab, var(--color-secondary) 90%, transparent);
        box-shadow:
          0 20px 25px -5px rgb(0 0 0 / 0.1),
          0 8px 10px -6px rgb(0 0 0 / 0.1);
      }

      .btn-ghost {
        background-color: transparent;
        color: var(--color-foreground);
        border: 1px solid transparent;
      }
      .btn-ghost:hover {
        background-color: var(--color-muted);
        border-color: var(--color-border);
      }

      .btn-outline {
        background-color: transparent;
        color: var(--color-foreground);
        border: 1px solid var(--color-border);
      }
      .btn-outline:hover {
        background-color: var(--color-muted);
        border-color: var(--color-primary);
      }

      /* Aurora Glass Button - Premium Glassmorphism */
      .btn-glass {
        color: #fff;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
        position: relative;
        overflow: hidden;

        /* Aurora Glass: Multi-layer gradient background */
        background: linear-gradient(135deg, rgba(74, 144, 255, 0.15), rgba(74, 144, 255, 0.08));

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
        background: linear-gradient(120deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
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
        background: linear-gradient(135deg, rgba(74, 144, 255, 0.25), rgba(74, 144, 255, 0.15));
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
        padding-inline: 0.75rem;
        padding-block: 0.375rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        border-radius: 0.375rem;
      }

      .btn-md {
        padding-inline: 1rem;
        padding-block: 0.5rem;
        font-size: 1rem;
        line-height: 1.5rem;
        border-radius: 0.5rem;
      }

      .btn-lg {
        padding-inline: 1.5rem;
        padding-block: 0.75rem;
        font-size: 1.125rem;
        line-height: 1.75rem;
        border-radius: var(--radius-xl);
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
    `,
  ],
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly icon = input<string>('');

  readonly buttonClasses = computed(() =>
    clsx(
      buttonVariants({
        variant: this.variant(),
        size: this.size(),
      }),
      {
        'cursor-wait': this.loading(),
        'opacity-50': this.disabled(),
      },
    ),
  );
}
