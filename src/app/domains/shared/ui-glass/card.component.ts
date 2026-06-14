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
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
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
