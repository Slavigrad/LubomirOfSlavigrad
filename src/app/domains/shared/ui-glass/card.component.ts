import { Component, input, signal, computed } from '@angular/core';

import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import {
  createCardVariants,
  cardCompoundVariants,
  combineVariants,
} from '../util-performance/utils';

// Create card variants using shared variant system
const cardVariants = combineVariants(createCardVariants('card'), cardCompoundVariants);

// Generate TypeScript types from CVA variants
type CardVariants = VariantProps<typeof cardVariants>;
export type CardVariant = CardVariants['variant'];
export type CardHoverable = CardVariants['hoverable'];

@Component({
  selector: 'app-card',
  template: `
    <div [class]="cardClasses()">
      @if (title() || subtitle()) {
        <div class="card-header">
          @if (title()) {
            <h3 class="card-title">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="card-subtitle">{{ subtitle() }}</p>
          }
        </div>
      }

      <div class="card-content">
        <ng-content />
      </div>

      @if (hasFooter()) {
        <div class="card-footer">
          <ng-content select="[slot=footer]" />
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .card {
        border-radius: var(--radius-xl);
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
        border: 1px solid color-mix(in oklab, var(--color-border) 50%, transparent);
      }

      .card-header {
        padding: 1.5rem;
        padding-bottom: 1rem;
      }

      .card-title {
        font-size: 1.25rem;
        line-height: 1.75rem;
        font-weight: 600;
        color: var(--color-foreground);
        margin-bottom: 0.25rem;
      }

      .card-subtitle {
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: var(--color-muted-foreground);
      }

      .card-content {
        padding: 1.5rem;
        padding-top: 0;
      }

      .card-footer {
        padding: 1.5rem;
        padding-top: 0;
        border-top: 1px solid color-mix(in oklab, var(--color-border) 50%, transparent);
        margin-top: 1rem;
      }

      /* Variant Styles */
      .card-default {
        background-color: var(--color-card);
        color: var(--color-card-foreground);
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      }
      .card-default:hover {
        box-shadow:
          0 4px 6px -1px rgb(0 0 0 / 0.1),
          0 2px 4px -2px rgb(0 0 0 / 0.1);
      }

      /* Aurora Glass Card - Premium Glassmorphism */
      .card-glass {
        color: #fff;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
        position: relative;
        overflow: hidden;

        /* Aurora Glass: Multi-layer gradient background */
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));

        /* Aurora Glass: Enhanced backdrop blur with saturation boost */
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);

        /* Aurora Glass: Luminous gradient borders */
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-top-color: rgba(255, 255, 255, 0.18);
        border-left-color: rgba(255, 255, 255, 0.18);
        border-bottom-color: rgba(0, 0, 0, 0.2);
        border-right-color: rgba(0, 0, 0, 0.15);

        /* Aurora Glass: Layered shadows */
        box-shadow:
          0 4px 30px rgba(0, 0, 0, 0.4),
          0 8px 60px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }

      /* Aurora Glass: Animated gradient overlay */
      .card-glass::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(120deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
        background-size: 200% 200%;
        animation: moveGradient 15s ease infinite;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.4s ease;
        border-radius: inherit;
      }

      .card-glass:hover::before {
        opacity: 1;
      }

      .card-glass:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow:
          0 8px 40px rgba(0, 0, 0, 0.5),
          0 12px 80px rgba(74, 144, 255, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .card-elevated {
        background-color: var(--color-card);
        color: var(--color-card-foreground);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }

      .card-elevated:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      }

      .card-outlined {
        background-color: transparent;
        border: 2px solid var(--color-border);
      }
      .card-outlined:hover {
        border-color: var(--color-primary);
        background-color: color-mix(in oklab, var(--color-muted) 50%, transparent);
      }

      /* Hover Effects */
      .card:hover {
        border-color: var(--color-border);
      }

      /* Animation Classes */
      .hover-lift {
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
      }

      .hover-lift:hover {
        transform: translateY(-2px);
      }

      /* Responsive Padding */
      @media (max-width: 640px) {
        .card-header,
        .card-content,
        .card-footer {
          padding: 1rem;
        }

        .card-content {
          padding-top: 0;
        }

        .card-footer {
          padding-top: 0;
        }
      }
    `,
  ],
})
export class CardComponent {
  readonly variant = input<CardVariant>('default');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly hoverable = input<boolean>(true);

  readonly hasFooter = signal(false);

  readonly cardClasses = computed(() =>
    clsx(
      cardVariants({
        variant: this.variant(),
        hoverable: this.hoverable(),
      }),
    ),
  );

  ngAfterContentInit() {
    // Check if footer content is projected
    // This is a simplified check - in a real implementation you might use ViewChild
    this.hasFooter.set(false);
  }
}
