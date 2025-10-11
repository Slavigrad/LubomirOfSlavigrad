import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { createCardVariants, cardCompoundVariants, combineVariants } from '../../utils';

// Create card variants using shared variant system
const cardVariants = combineVariants(
  createCardVariants('card'),
  cardCompoundVariants
);

// Generate TypeScript types from CVA variants
type CardVariants = VariantProps<typeof cardVariants>;
export type CardVariant = CardVariants['variant'];
export type CardHoverable = CardVariants['hoverable'];

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      @if (title || subtitle) {
        <div class="card-header">
          @if (title) {
            <h3 class="card-title">{{ title }}</h3>
          }
          @if (subtitle) {
            <p class="card-subtitle">{{ subtitle }}</p>
          }
        </div>
      }

      <div class="card-content">
        <ng-content></ng-content>
      </div>

      @if (hasFooter()) {
        <div class="card-footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .card {
      @apply rounded-xl transition-all duration-300;
      @apply border border-border/50;
    }

    .card-header {
      @apply p-6 pb-4;
    }

    .card-title {
      @apply text-xl font-semibold text-foreground mb-1;
    }

    .card-subtitle {
      @apply text-sm text-muted-foreground;
    }

    .card-content {
      @apply p-6 pt-0;
    }

    .card-footer {
      @apply p-6 pt-0 border-t border-border/50 mt-4;
    }

    /* Variant Styles */
    .card-default {
      @apply bg-card text-card-foreground;
      @apply shadow-sm hover:shadow-md;
    }

    /* Aurora Glass Card - Premium Glassmorphism */
    .card-glass {
      @apply text-white transition-all duration-300;
      position: relative;
      overflow: hidden;

      /* Aurora Glass: Multi-layer gradient background */
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.02));

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
      background: linear-gradient(120deg,
        rgba(255, 255, 255, 0.07),
        rgba(255, 255, 255, 0.03));
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
      @apply bg-card text-card-foreground;
      @apply shadow-lg hover:shadow-xl;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .card-elevated:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .card-outlined {
      @apply bg-transparent border-2 border-border;
      @apply hover:border-primary hover:bg-muted/50;
    }

    /* Hover Effects */
    .card:hover {
      @apply border-border;
    }

    /* Animation Classes */
    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .hover-lift:hover {
      transform: translateY(-2px);
    }

    /* Responsive Padding */
    @media (max-width: 640px) {
      .card-header,
      .card-content,
      .card-footer {
        @apply p-4;
      }

      .card-content {
        @apply pt-0;
      }

      .card-footer {
        @apply pt-0;
      }
    }
  `]
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() hoverable: boolean = true;

  readonly hasFooter = signal(false);

  readonly cardClasses = computed(() =>
    clsx(
      cardVariants({
        variant: this.variant,
        hoverable: this.hoverable
      })
    )
  );

  ngAfterContentInit() {
    // Check if footer content is projected
    // This is a simplified check - in a real implementation you might use ViewChild
    this.hasFooter.set(false);
  }
}
