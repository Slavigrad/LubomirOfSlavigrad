import {
  Component,
  input,
  output,
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
  imports: [CollapseComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="collapsible-card"
      [class]="containerClasses()"
    >
      @if (collapsible()) {
        <!-- Collapsible Card -->
        <app-collapse
          [variant]="variant()"
          [size]="size()"
          [animation]="animation()"
          [duration]="duration()"
          [expanded]="expanded()"
          [showIcon]="showIcon()"
          [customIcon]="customIcon()"
          [headerText]="title()"
          [disabled]="disabled()"
          (expandedChange)="onExpandedChange($event)"
          (toggleEvent)="onToggle($event)"
        >
          <!-- Header Content -->
          <div slot="header" class="card-header-content">
            @if (icon()) {
              <div class="card-icon" [innerHTML]="icon()"></div>
            }
            <div class="card-title-section">
              <h3 class="card-title">{{ title() }}</h3>
              @if (subtitle()) {
                <p class="card-subtitle">{{ subtitle() }}</p>
              }
            </div>
            @if (badge()) {
              <div class="card-badge">
                <span class="badge" [class]="badgeClass()">{{ badge() }}</span>
              </div>
            }
          </div>

          <!-- Card Content -->
          <div class="card-content">
            @if (description()) {
              <p class="card-description">{{ description() }}</p>
            }

            <!-- Main Content -->
            <div class="card-body">
              <ng-content />
            </div>

            <!-- Footer Actions -->
            @if (hasFooterContent()) {
              <div class="card-footer">
                <ng-content select="[slot=footer]" />
                @if (actions().length > 0) {
                  <div class="card-actions">
                    @for (action of actions(); track action.id) {
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
          <ng-content />
          <div slot="footer">
            <ng-content select="[slot=footer]" />
            @if (actions().length > 0) {
              <div class="card-actions">
                @for (action of actions(); track action.id) {
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
      width: 100%;
    }

    /* Header Content Styling */
    .card-header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    }

    .card-icon {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      color: var(--color-primary);
    }

    .card-title-section {
      flex: 1 1 0%;
      min-width: 0;
    }

    .card-title {
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 600;
      color: var(--color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-subtitle {
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--color-muted-foreground);
      margin-top: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-badge {
      flex-shrink: 0;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding-inline: 0.625rem;
      padding-block: 0.125rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 500;
    }

    .badge-default {
      background-color: var(--color-muted);
      color: var(--color-muted-foreground);
    }

    .badge-primary {
      background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
      color: var(--color-primary);
    }

    .badge-secondary {
      background-color: color-mix(in oklab, var(--color-secondary) 10%, transparent);
      color: var(--color-secondary);
    }

    .badge-success {
      background-color: var(--color-green-100);
      color: var(--color-green-800);
    }

    .badge-warning {
      background-color: var(--color-yellow-100);
      color: var(--color-yellow-800);
    }

    .badge-error {
      background-color: var(--color-red-100);
      color: var(--color-red-800);
    }

    /* Content Styling */
    .card-content > * + * {
      margin-top: 1rem;
    }

    .card-description {
      color: var(--color-muted-foreground);
      font-size: 0.875rem;
      line-height: 1.625;
    }

    .card-body > * + * {
      margin-top: 0.75rem;
    }

    /* Footer Styling */
    .card-footer {
      padding-top: 1rem;
      border-top: 1px solid color-mix(in oklab, var(--color-border) 50%, transparent);
    }
    .card-footer > * + * {
      margin-top: 0.75rem;
    }

    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .action-icon {
      width: 1rem;
      height: 1rem;
      margin-right: 0.375rem;
    }

    /* Action Button Variants */
    .action-primary {
      background-color: var(--color-primary);
      color: #fff;
      padding-inline: 0.75rem;
      padding-block: 0.375rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      transition-property: color, background-color, border-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
    .action-primary:hover {
      background-color: color-mix(in oklab, var(--color-primary) 90%, transparent);
    }

    .action-secondary {
      background-color: var(--color-secondary);
      color: #fff;
      padding-inline: 0.75rem;
      padding-block: 0.375rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      transition-property: color, background-color, border-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
    .action-secondary:hover {
      background-color: color-mix(in oklab, var(--color-secondary) 90%, transparent);
    }

    .action-outline {
      border: 1px solid var(--color-border);
      color: var(--color-foreground);
      padding-inline: 0.75rem;
      padding-block: 0.375rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      transition-property: color, background-color, border-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
    .action-outline:hover {
      background-color: var(--color-muted);
    }

    .action-ghost {
      color: var(--color-foreground);
      padding-inline: 0.75rem;
      padding-block: 0.375rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      transition-property: color, background-color, border-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
    .action-ghost:hover {
      background-color: var(--color-muted);
    }

    .action-link {
      color: var(--color-primary);
      text-decoration-line: underline;
      padding-inline: 0.25rem;
      padding-block: 0.125rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      transition-property: color, background-color, border-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
    .action-link:hover {
      color: color-mix(in oklab, var(--color-primary) 80%, transparent);
    }

    /* Size Variants */
    .size-sm .card-title {
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .size-sm .card-subtitle {
      font-size: 0.75rem;
      line-height: 1rem;
    }

    .size-sm .card-icon {
      width: 1.5rem;
      height: 1.5rem;
    }

    .size-lg .card-title {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    .size-lg .card-subtitle {
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .size-lg .card-icon {
      width: 2.5rem;
      height: 2.5rem;
    }

    /* Hover Effects */
    .collapsible-card:hover .card-header-content {
      color: var(--color-primary);
    }

    /* Focus States */
    .collapsible-card:focus-within {
      border-radius: 0.5rem;
      box-shadow:
        0 0 0 2px var(--color-background),
        0 0 0 4px var(--color-primary);
    }

    /* Disabled State */
    .disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  `]
})
export class CollapsibleCardComponent {
  // Configuration inputs
  readonly variant = input<CollapseVariant>('card');
  readonly size = input<CollapseSize>('md');
  readonly animation = input<CollapseAnimation>('slide');
  readonly duration = input<number>(300);
  readonly collapsible = input<boolean>(true);
  readonly expanded = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly showIcon = input<boolean>(true);
  readonly customIcon = input<string>('');

  // Content inputs
  readonly title = input<string>('Card Title');
  readonly subtitle = input<string>('');
  readonly description = input<string>('');
  readonly icon = input<string>('');
  readonly badge = input<string>('');
  readonly badgeVariant = input<'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'>('default');

  // Action inputs
  readonly actions = input<CardAction[]>([]);

  // Events
  readonly expandedChange = output<boolean>();
  readonly toggle = output<boolean>();
  readonly actionClick = output<CardAction>();

  // Internal state
  private readonly hasFooterSlot = signal(false);
  private readonly expandedSignal = signal(false);

  // Computed properties
  readonly containerClasses = computed(() => {
    const variantValue = this.variant();
    const sizeValue = this.size();

    return [
      'collapsible-card-container',
      `variant-${variantValue}`,
      `size-${sizeValue}`,
      this.disabled() ? 'disabled' : ''
    ].filter(Boolean).join(' ');
  });

  readonly badgeClass = computed(() => {
    return `badge badge-${this.badgeVariant()}`;
  });

  readonly hasFooterContent = computed(() => {
    return this.hasFooterSlot() || this.actions().length > 0;
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
    if (this.collapsible() && !this.expandedSignal()) {
      this.expandedSignal.set(true);
      this.expandedChange.emit(true);
    }
  }

  collapse(): void {
    if (this.collapsible() && this.expandedSignal()) {
      this.expandedSignal.set(false);
      this.expandedChange.emit(false);
    }
  }

  toggleExpansion(): void {
    if (this.collapsible()) {
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
