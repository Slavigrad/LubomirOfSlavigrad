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

    .card-glass {
      @apply bg-white/10 text-white border-white/20;
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .card-glass:hover {
      @apply bg-white/15 border-white/30;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
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
