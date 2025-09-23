import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollapseComponent, CollapseVariant, CollapseSize, CollapseAnimation } from './collapse.component';
import { CollapsibleCardComponent } from './collapsible-card.component';

export interface CollapseGroupConfig {
  variant?: CollapseVariant;
  size?: CollapseSize;
  animation?: CollapseAnimation;
  duration?: number;
  allowMultiple?: boolean;
  allowToggleAll?: boolean;
  staggerDelay?: number;
  orientation?: 'vertical' | 'horizontal';
}

export interface CollapseGroupItem {
  id: string;
  expanded?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-collapse-group',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="collapse-group"
      [class]="containerClasses()"
      role="group"
      [attr.aria-label]="groupLabel"
    >
      <!-- Group Controls -->
      @if (allowToggleAll && showControls) {
        <div class="group-controls">
          <div class="control-buttons">
            <button
              type="button"
              class="control-btn expand-all"
              [disabled]="allExpanded()"
              (click)="expandAllItems()"
              [attr.aria-label]="'Expand all items'"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
              Expand All
            </button>

            <button
              type="button"
              class="control-btn collapse-all"
              [disabled]="allCollapsed()"
              (click)="collapseAllItems()"
              [attr.aria-label]="'Collapse all items'"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
              </svg>
              Collapse All
            </button>
          </div>

          @if (showStats) {
            <div class="group-stats">
              <span class="stats-text">
                {{ expandedCount() }} of {{ totalCount() }} expanded
              </span>
            </div>
          }
        </div>
      }

      <!-- Group Content -->
      <div
        class="group-content"
        [class]="contentClasses()"
        [style.--stagger-delay]="staggerDelay + 'ms'"
      >
        <ng-content></ng-content>
      </div>

      <!-- Group Footer -->
      @if (hasFooterContent()) {
        <div class="group-footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .collapse-group {
      @apply w-full space-y-4;
    }

    /* Group Controls */
    .group-controls {
      @apply flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50;
    }

    .control-buttons {
      @apply flex gap-2;
    }

    .control-btn {
      @apply inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md;
      @apply border border-border bg-background hover:bg-muted;
      @apply transition-colors duration-200;
      @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
      @apply disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .control-btn:hover:not(:disabled) {
      @apply bg-muted border-primary/50;
    }

    .expand-all {
      @apply text-green-700 border-green-200 hover:bg-green-50;
    }

    .collapse-all {
      @apply text-red-700 border-red-200 hover:bg-red-50;
    }

    .group-stats {
      @apply text-sm text-muted-foreground;
    }

    .stats-text {
      @apply font-medium;
    }

    /* Content Layout */
    .group-content {
      @apply space-y-2;
    }

    .orientation-horizontal .group-content {
      @apply flex flex-wrap gap-4 space-y-0;
    }

    .orientation-horizontal .group-content > * {
      @apply flex-1 min-w-0;
    }

    /* Size Variants */
    .size-sm .group-content {
      @apply space-y-1;
    }

    .size-sm .orientation-horizontal .group-content {
      @apply gap-2;
    }

    .size-lg .group-content {
      @apply space-y-4;
    }

    .size-lg .orientation-horizontal .group-content {
      @apply gap-6;
    }

    /* Animation Variants */
    .animation-stagger .group-content > * {
      animation-delay: calc(var(--item-index, 0) * var(--stagger-delay, 100ms));
    }

    /* Variant Styles */
    .variant-glass {
      @apply backdrop-blur-xl bg-gradient-to-br from-card/30 to-card/10;
      @apply border border-border/20 rounded-lg p-4;
    }

    .variant-bordered {
      @apply border-2 border-border rounded-lg p-4;
    }

    .variant-card {
      @apply bg-card border border-border rounded-lg shadow-lg p-4;
    }

    .variant-minimal {
      @apply border-l-4 border-primary pl-4;
    }

    /* Group Footer */
    .group-footer {
      @apply pt-4 border-t border-border/50;
    }

    /* Responsive Design */
    @media (max-width: 640px) {
      .group-controls {
        @apply flex-col gap-3 items-stretch;
      }

      .control-buttons {
        @apply justify-center;
      }

      .orientation-horizontal .group-content {
        @apply flex-col;
      }
    }

    /* Focus Management */
    .collapse-group:focus-within {
      @apply ring-2 ring-primary ring-offset-2 rounded-lg;
    }

    /* Loading State */
    .loading {
      @apply opacity-50 pointer-events-none;
    }

    .loading .group-content {
      @apply animate-pulse;
    }

    /* Empty State */
    .empty-state {
      @apply text-center py-8 text-muted-foreground;
    }

    .empty-state-icon {
      @apply w-12 h-12 mx-auto mb-4 text-muted-foreground/50;
    }

    .empty-state-text {
      @apply text-lg font-medium mb-2;
    }

    .empty-state-description {
      @apply text-sm;
    }
  `]
})
export class CollapseGroupComponent implements AfterContentInit, OnDestroy {
  @ContentChildren(CollapseComponent, { descendants: true }) collapseItems!: QueryList<CollapseComponent>;
  @ContentChildren(CollapsibleCardComponent, { descendants: true }) cardItems!: QueryList<CollapsibleCardComponent>;

  // Configuration inputs
  @Input() variant: CollapseVariant = 'default';
  @Input() size: CollapseSize = 'md';
  @Input() animation: CollapseAnimation = 'slide';
  @Input() duration: number = 300;
  @Input() allowMultiple: boolean = true;
  @Input() allowToggleAll: boolean = true;
  @Input() staggerDelay: number = 100;
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';
  @Input() groupLabel: string = 'Collapsible Group';
  @Input() showControls: boolean = true;
  @Input() showStats: boolean = true;
  @Input() loading: boolean = false;

  // Events
  @Output() itemToggle = new EventEmitter<{ itemId: string; expanded: boolean }>();
  @Output() expandedItemsChange = new EventEmitter<string[]>();
  @Output() expandAllEvent = new EventEmitter<void>();
  @Output() collapseAllEvent = new EventEmitter<void>();

  // Internal state
  private readonly expandedItems = signal<Set<string>>(new Set());
  private readonly itemSubscriptions = new Map<string, any>();

  // Computed properties
  readonly containerClasses = computed(() => {
    const variant = this.variant;
    const size = this.size;
    const orientation = this.orientation;
    const animation = this.animation;

    return [
      'collapse-group-container',
      `variant-${variant}`,
      `size-${size}`,
      `orientation-${orientation}`,
      `animation-${animation}`,
      this.loading ? 'loading' : ''
    ].filter(Boolean).join(' ');
  });

  readonly contentClasses = computed(() => {
    return [
      'group-content',
      'animation-stagger'
    ].filter(Boolean).join(' ');
  });

  readonly allItems = computed(() => {
    const collapseItems = this.collapseItems?.toArray() || [];
    const cardItems = this.cardItems?.toArray() || [];
    return [...collapseItems, ...cardItems];
  });

  readonly totalCount = computed(() => this.allItems().length);
  readonly expandedCount = computed(() => this.expandedItems().size);
  readonly allExpanded = computed(() => this.expandedCount() === this.totalCount() && this.totalCount() > 0);
  readonly allCollapsed = computed(() => this.expandedCount() === 0);
  readonly hasFooterContent = computed(() => {
    // Check if footer slot has content
    return false; // This would need to be implemented based on content projection
  });

  ngAfterContentInit() {
    // Set up initial state and subscriptions
    this.setupItemSubscriptions();

    // Watch for changes in content children
    this.collapseItems?.changes.subscribe(() => {
      this.setupItemSubscriptions();
    });

    this.cardItems?.changes.subscribe(() => {
      this.setupItemSubscriptions();
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.itemSubscriptions.forEach(subscription => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    this.itemSubscriptions.clear();
  }

  private setupItemSubscriptions() {
    // Clear existing subscriptions
    this.itemSubscriptions.forEach(subscription => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    this.itemSubscriptions.clear();

    // Set up new subscriptions for collapse items
    this.collapseItems?.forEach((item, index) => {
      const itemId = `collapse-${index}`;
      const subscription = item.expandedChange.subscribe((expanded: boolean) => {
        this.handleItemToggle(itemId, expanded);
      });
      this.itemSubscriptions.set(itemId, subscription);
    });

    // Set up new subscriptions for card items
    this.cardItems?.forEach((item, index) => {
      const itemId = `card-${index}`;
      const subscription = item.expandedChange.subscribe((expanded: boolean) => {
        this.handleItemToggle(itemId, expanded);
      });
      this.itemSubscriptions.set(itemId, subscription);
    });
  }

  private handleItemToggle(itemId: string, expanded: boolean) {
    const currentExpanded = new Set(this.expandedItems());

    if (expanded) {
      if (!this.allowMultiple) {
        // Close all other items if multiple not allowed
        currentExpanded.clear();
        this.collapseAllItemsInternal();
      }
      currentExpanded.add(itemId);
    } else {
      currentExpanded.delete(itemId);
    }

    this.expandedItems.set(currentExpanded);
    this.itemToggle.emit({ itemId, expanded });
    this.expandedItemsChange.emit(Array.from(currentExpanded));
  }

  // Public API methods
  expandAllItems(): void {
    if (!this.allowMultiple) {
      return;
    }

    this.collapseItems?.forEach(item => {
      if (!item.disabled) {
        item.expand();
      }
    });

    this.cardItems?.forEach(item => {
      if (!item.disabled) {
        item.expand();
      }
    });

    this.expandAllEvent.emit();
  }

  collapseAllItems(): void {
    this.collapseAllItemsInternal();
    this.collapseAllEvent.emit();
  }

  private collapseAllItemsInternal(): void {
    this.collapseItems?.forEach(item => {
      if (!item.disabled) {
        item.collapse();
      }
    });

    this.cardItems?.forEach(item => {
      if (!item.disabled) {
        item.collapse();
      }
    });
  }

  expandItem(index: number): void {
    const allItems = this.allItems();
    if (index >= 0 && index < allItems.length) {
      const item = allItems[index];
      if ('expand' in item && !item.disabled) {
        item.expand();
      }
    }
  }

  collapseItem(index: number): void {
    const allItems = this.allItems();
    if (index >= 0 && index < allItems.length) {
      const item = allItems[index];
      if ('collapse' in item && !item.disabled) {
        item.collapse();
      }
    }
  }

  toggleItem(index: number): void {
    const allItems = this.allItems();
    if (index >= 0 && index < allItems.length) {
      const item = allItems[index];
      if ('toggleExpansion' in item && !item.disabled) {
        item.toggleExpansion();
      } else if ('toggleCollapse' in item && !item.disabled) {
        item.toggleCollapse();
      }
    }
  }

  getExpandedItems(): string[] {
    return Array.from(this.expandedItems());
  }

  isItemExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }
}
