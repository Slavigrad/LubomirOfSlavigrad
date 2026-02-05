import { Component, Input, signal, computed } from '@angular/core';

import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { createBadgeVariants, badgeCompoundVariants, combineVariants } from '../../utils';

// Create badge variants using shared variant system
const badgeVariants = combineVariants(
  createBadgeVariants('badge'),
  badgeCompoundVariants
);

// Generate TypeScript types from CVA variants
type BadgeVariants = VariantProps<typeof badgeVariants>;
export type BadgeVariant = BadgeVariants['variant'];
export type BadgeSize = BadgeVariants['size'];
export type BadgeRemovable = BadgeVariants['removable'];

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  template: `
    <span [class]="badgeClasses()">
      @if (icon) {
        <span class="badge-icon" [innerHTML]="icon"></span>
      }
      <ng-content />
      @if (removable) {
        <button
          class="badge-remove"
          (click)="onRemove()"
          type="button"
          aria-label="Remove"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .badge {
      @apply inline-flex items-center font-medium transition-all duration-200;
      @apply border border-transparent;
    }

    .badge-icon {
      @apply flex items-center justify-center;
    }

    .badge-remove {
      @apply ml-1 flex items-center justify-center;
      @apply hover:bg-black/10 rounded-full p-0.5;
      @apply transition-colors duration-200;
    }

    /* Size Styles */
    .badge-sm {
      @apply px-2 py-0.5 text-xs rounded-md;
    }

    .badge-sm .badge-icon {
      @apply w-3 h-3 mr-1;
    }

    .badge-md {
      @apply px-2.5 py-1 text-sm rounded-lg;
    }

    .badge-md .badge-icon {
      @apply w-4 h-4 mr-1.5;
    }

    .badge-lg {
      @apply px-3 py-1.5 text-base rounded-xl;
    }

    .badge-lg .badge-icon {
      @apply w-5 h-5 mr-2;
    }

    /* Variant Styles */
    .badge-default {
      @apply bg-muted text-muted-foreground;
    }

    .badge-primary {
      @apply bg-primary/20 text-primary border-primary/30;
    }

    .badge-secondary {
      @apply bg-secondary/20 text-secondary border-secondary/30;
    }

    .badge-accent {
      @apply bg-accent/20 text-accent border-accent/30;
    }

    .badge-success {
      @apply bg-green-100 text-green-800 border-green-200;
    }

    .badge-warning {
      @apply bg-yellow-100 text-yellow-800 border-yellow-200;
    }

    .badge-error {
      @apply bg-red-100 text-red-800 border-red-200;
    }

    .badge-outline {
      @apply bg-transparent border-border text-foreground;
    }

    /* Dark mode adjustments */
    @media (prefers-color-scheme: dark) {
      .badge-success {
        @apply bg-green-900/30 text-green-400 border-green-800;
      }

      .badge-warning {
        @apply bg-yellow-900/30 text-yellow-400 border-yellow-800;
      }

      .badge-error {
        @apply bg-red-900/30 text-red-400 border-red-800;
      }
    }

    /* Hover Effects */
    .badge:hover {
      @apply scale-105;
    }

    .badge-removable:hover {
      @apply shadow-sm;
    }

    /* Animation for removal */
    .badge-removing {
      @apply scale-95 opacity-0;
      transition: all 0.2s ease-out;
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
  @Input() icon: string = '';
  @Input() removable: boolean = false;

  readonly badgeClasses = computed(() =>
    clsx(
      badgeVariants({
        variant: this.variant,
        size: this.size,
        removable: this.removable
      })
    )
  );

  onRemove() {
    // Emit remove event - in a real implementation this would be an @Output()
    console.log('Badge removed');
  }
}
