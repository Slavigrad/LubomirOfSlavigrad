import { Component, input, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import {
  createBadgeVariants,
  badgeCompoundVariants,
  combineVariants,
} from '../util-performance/utils';

// Create badge variants using shared variant system
const badgeVariants = combineVariants(createBadgeVariants('badge'), badgeCompoundVariants);

// Generate TypeScript types from CVA variants
type BadgeVariants = VariantProps<typeof badgeVariants>;
export type BadgeVariant = BadgeVariants['variant'];
export type BadgeSize = BadgeVariants['size'];
export type BadgeRemovable = BadgeVariants['removable'];

@Component({
  selector: 'app-badge',
  imports: [TranslatePipe],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<BadgeSize>('md');
  readonly icon = input<string>('');
  readonly removable = input<boolean>(false);

  readonly badgeClasses = computed(() =>
    clsx(
      badgeVariants({
        variant: this.variant(),
        size: this.size(),
        removable: this.removable(),
      }),
    ),
  );

  onRemove() {
    // Emit remove event - in a real implementation this would be an @Output()
    console.log('Badge removed');
  }
}
