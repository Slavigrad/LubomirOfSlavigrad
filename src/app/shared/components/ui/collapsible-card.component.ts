import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';

import { CollapseComponent, CollapseVariant, CollapseSize, CollapseAnimation } from './collapse.component';
import { CardComponent } from './card.component';

export interface CollapsibleCardConfig {
  variant?: CollapseVariant;
  size?: CollapseSize;
  animation?: CollapseAnimation;
  duration?: number;
  showIcon?: boolean;
  customIcon?: string;
  collapsible?: boolean;
  startExpanded?: boolean;
}

@Component({
  selector: 'app-collapsible-card',
  standalone: true,
  imports: [CollapseComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="collapsible-card"
      [class]="containerClasses()"
    >
      @if (collapsible) {
        <!-- Collapsible Card -->
        <app-collapse
          [variant]="variant"
          [size]="size"
          [animation]="animation"
          [duration]="duration"
          [expanded]="expanded"
          [showIcon]="showIcon"
          [customIcon]="customIcon"
          [headerText]="title"
          [disabled]="disabled"
          (expandedChange)="onExpandedChange($event)"
          (toggleEvent)="onToggle($event)"
        >
          <!-- Header Content -->
          <div slot="header" class="card-header-content">
            @if (icon) {
              <div class="card-icon" [innerHTML]="icon"></div>
            }
            <div class="card-title-section">
              <h3 class="card-title">{{ title }}</h3>
              @if (subtitle) {
                <p class="card-subtitle">{{ subtitle }}</p>
              }
            </div>
            @if (badge) {
              <div class="card-badge">
                <span class="badge" [class]="badgeClass()">{{ badge }}</span>
              </div>
            }
          </div>

          <!-- Card Content -->
          <div class="card-content">
            @if (description) {
              <p class="card-description">{{ description }}</p>
            }

            <!-- Main Content -->
            <div class="card-body">
              <ng-content></ng-content>
            </div>

            <!-- Footer Actions -->
            @if (hasFooterContent()) {
              <div class="card-footer">
                <ng-content select="[slot=footer]"></ng-content>
                @if (actions.length > 0) {
                  <div class="card-actions">
                    @for (action of actions; track action.id) {
                      <button
                        type="button"
                        [class]="getActionClass(action)"
                        [disabled]="action.disabled"
                        (click)="onActionClick(action)"
                      >
                        @if (action.icon) {
                          <span [innerHTML]="action.icon" class="action-icon"></span>
                        }
                        {{ action.label }}
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </app-collapse>
      } @else {
        <!-- Static Card -->
        <app-card>
          <ng-content></ng-content>
          <div slot="footer">
            <ng-content select="[slot=footer]"></ng-content>
            @if (actions.length > 0) {
              <div class="card-actions">
                @for (action of actions; track action.id) {
                  <button
                    type="button"
                    [class]="getActionClass(action)"
                    [disabled]="action.disabled"
                    (click)="onActionClick(action)"
                  >
                    @if (action.icon) {
                      <span [innerHTML]="action.icon" class="action-icon"></span>
                    }
                    {{ action.label }}
                  </button>
                }
              </div>
            }
          </div>
        </app-card>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .collapsible-card {
      @apply w-full;
    }

    /* Header Content Styling */
    .card-header-content {
      @apply flex items-center gap-3 w-full;
    }

    .card-icon {
      @apply flex-shrink-0 w-8 h-8 text-primary;
    }

    .card-title-section {
      @apply flex-1 min-w-0;
    }

    .card-title {
      @apply text-lg font-semibold text-foreground truncate;
    }

    .card-subtitle {
      @apply text-sm text-muted-foreground mt-1 truncate;
    }

    .card-badge {
      @apply flex-shrink-0;
    }

    .badge {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
    }

    .badge-default {
      @apply bg-muted text-muted-foreground;
    }

    .badge-primary {
      @apply bg-primary/10 text-primary;
    }

    .badge-secondary {
      @apply bg-secondary/10 text-secondary;
    }

    .badge-success {
      @apply bg-green-100 text-green-800;
    }

    .badge-warning {
      @apply bg-yellow-100 text-yellow-800;
    }

    .badge-error {
      @apply bg-red-100 text-red-800;
    }

    /* Content Styling */
    .card-content {
      @apply space-y-4;
    }

    .card-description {
      @apply text-muted-foreground text-sm leading-relaxed;
    }

    .card-body {
      @apply space-y-3;
    }

    /* Footer Styling */
    .card-footer {
      @apply pt-4 border-t border-border/50 space-y-3;
    }

    .card-actions {
      @apply flex flex-wrap gap-2;
    }

    .action-icon {
      @apply w-4 h-4 mr-1.5;
    }

    /* Action Button Variants */
    .action-primary {
      @apply bg-primary text-white hover:bg-primary/90;
      @apply px-3 py-1.5 rounded-md text-sm font-medium;
      @apply transition-colors duration-200;
    }

    .action-secondary {
      @apply bg-secondary text-white hover:bg-secondary/90;
      @apply px-3 py-1.5 rounded-md text-sm font-medium;
      @apply transition-colors duration-200;
    }

    .action-outline {
      @apply border border-border text-foreground hover:bg-muted;
      @apply px-3 py-1.5 rounded-md text-sm font-medium;
      @apply transition-colors duration-200;
    }

    .action-ghost {
      @apply text-foreground hover:bg-muted;
      @apply px-3 py-1.5 rounded-md text-sm font-medium;
      @apply transition-colors duration-200;
    }

    .action-link {
      @apply text-primary hover:text-primary/80 underline;
      @apply px-1 py-0.5 text-sm font-medium;
      @apply transition-colors duration-200;
    }

    /* Size Variants */
    .size-sm .card-title {
      @apply text-base;
    }

    .size-sm .card-subtitle {
      @apply text-xs;
    }

    .size-sm .card-icon {
      @apply w-6 h-6;
    }

    .size-lg .card-title {
      @apply text-xl;
    }

    .size-lg .card-subtitle {
      @apply text-base;
    }

    .size-lg .card-icon {
      @apply w-10 h-10;
    }

    /* Hover Effects */
    .collapsible-card:hover .card-header-content {
      @apply text-primary;
    }

    /* Focus States */
    .collapsible-card:focus-within {
      @apply ring-2 ring-primary ring-offset-2 rounded-lg;
    }

    /* Disabled State */
    .disabled {
      @apply opacity-50 pointer-events-none;
    }
  `]
})
export class CollapsibleCardComponent {
  // Configuration inputs
  @Input() variant: CollapseVariant = 'card';
  @Input() size: CollapseSize = 'md';
  @Input() animation: CollapseAnimation = 'slide';
  @Input() duration: number = 300;
  @Input() collapsible: boolean = true;
  @Input() expanded: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showIcon: boolean = true;
  @Input() customIcon: string = '';

  // Content inputs
  @Input() title: string = 'Card Title';
  @Input() subtitle: string = '';
  @Input() description: string = '';
  @Input() icon: string = '';
  @Input() badge: string = '';
  @Input() badgeVariant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'default';

  // Action inputs
  @Input() actions: CardAction[] = [];

  // Events
  @Output() expandedChange = new EventEmitter<boolean>();
  @Output() toggle = new EventEmitter<boolean>();
  @Output() actionClick = new EventEmitter<CardAction>();

  // Internal state
  private readonly hasFooterSlot = signal(false);
  private readonly expandedSignal = signal(false);

  // Computed properties
  readonly containerClasses = computed(() => {
    const variant = this.variant;
    const size = this.size;

    return [
      'collapsible-card-container',
      `variant-${variant}`,
      `size-${size}`,
      this.disabled ? 'disabled' : ''
    ].filter(Boolean).join(' ');
  });

  readonly badgeClass = computed(() => {
    return `badge badge-${this.badgeVariant}`;
  });

  readonly hasFooterContent = computed(() => {
    return this.hasFooterSlot() || this.actions.length > 0;
  });

  onExpandedChange(expanded: boolean): void {
    this.expandedSignal.set(expanded);
    this.expandedChange.emit(expanded);
  }

  onToggle(expanded: boolean): void {
    this.toggle.emit(expanded);
  }

  onActionClick(action: CardAction): void {
    if (!action.disabled) {
      this.actionClick.emit(action);
      action.onClick?.(action);
    }
  }

  getActionClass(action: CardAction): string {
    const variant = action.variant || 'outline';
    return `action-${variant}`;
  }

  // Public API methods
  expand(): void {
    if (this.collapsible && !this.expandedSignal()) {
      this.expandedSignal.set(true);
      this.expandedChange.emit(true);
    }
  }

  collapse(): void {
    if (this.collapsible && this.expandedSignal()) {
      this.expandedSignal.set(false);
      this.expandedChange.emit(false);
    }
  }

  toggleExpansion(): void {
    if (this.collapsible) {
      const newState = !this.expandedSignal();
      this.expandedSignal.set(newState);
      this.expandedChange.emit(newState);
    }
  }
}

export interface CardAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  icon?: string;
  disabled?: boolean;
  onClick?: (action: CardAction) => void;
}
