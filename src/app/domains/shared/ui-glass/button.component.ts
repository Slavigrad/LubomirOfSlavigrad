import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
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
