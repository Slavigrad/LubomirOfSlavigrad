import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  contentChildren,
  AfterContentInit,
  OnDestroy
} from '@angular/core';

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
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="collapse-group"
      [class]="containerClasses()"
      role="group"
      [attr.aria-label]="groupLabel()"
    >
      <!-- Group Controls -->
      @if (allowToggleAll() && showControls()) {
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

          @if (showStats()) {
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
        [style.--stagger-delay]="staggerDelay() + 'ms'"
      >
        <ng-content />
      </div>

      <!-- Group Footer -->
      @if (hasFooterContent()) {
        <div class="group-footer">
          <ng-content select="[slot=footer]" />
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    /* Local keyframes (utilities are unavailable in scoped styles) */
    @keyframes pulse {
      50% { opacity: 0.5; }
    }

    .collapse-group {
      width: 100%;
    }
    .collapse-group > * + * {
      margin-top: 1rem;
    }

    /* Group Controls */
    .group-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background-color: color-mix(in oklab, var(--color-muted) 30%, transparent);
      border-radius: 0.5rem;
      border: 1px solid color-mix(in oklab, var(--color-border) 50%, transparent);
    }

    .control-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .control-btn {
      display: inline-flex;
      align-items: center;
      padding-inline: 0.75rem;
      padding-block: 0.375rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      border-radius: 0.375rem;
      border: 1px solid var(--color-border);
      background-color: var(--color-background);
      transition-property: color, background-color, border-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
    .control-btn:hover {
      background-color: var(--color-muted);
    }
    .control-btn:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow:
        0 0 0 2px var(--color-background),
        0 0 0 4px var(--color-primary);
    }
    .control-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .control-btn:hover:not(:disabled) {
      background-color: var(--color-muted);
      border-color: color-mix(in oklab, var(--color-primary) 50%, transparent);
    }

    .expand-all {
      color: var(--color-green-700);
      border-color: var(--color-green-200);
    }
    .expand-all:hover {
      background-color: var(--color-green-50);
    }

    .collapse-all {
      color: var(--color-red-700);
      border-color: var(--color-red-200);
    }
    .collapse-all:hover {
      background-color: var(--color-red-50);
    }

    .group-stats {
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--color-muted-foreground);
    }

    .stats-text {
      font-weight: 500;
    }

    /* Content Layout */
    .group-content > * + * {
      margin-top: 0.5rem;
    }

    .orientation-horizontal .group-content {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .orientation-horizontal .group-content > * + * {
      margin-top: 0;
    }

    .orientation-horizontal .group-content > * {
      flex: 1 1 0%;
      min-width: 0;
    }

    /* Size Variants */
    .size-sm .group-content > * + * {
      margin-top: 0.25rem;
    }

    .size-sm .orientation-horizontal .group-content {
      gap: 0.5rem;
    }

    .size-lg .group-content > * + * {
      margin-top: 1rem;
    }

    .size-lg .orientation-horizontal .group-content {
      gap: 1.5rem;
    }

    /* Animation Variants */
    .animation-stagger .group-content > * {
      animation-delay: calc(var(--item-index, 0) * var(--stagger-delay, 100ms));
    }

    /* Variant Styles */
    .variant-glass {
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      background-image: linear-gradient(
        to bottom right,
        color-mix(in oklab, var(--color-card) 30%, transparent),
        color-mix(in oklab, var(--color-card) 10%, transparent)
      );
      border: 1px solid color-mix(in oklab, var(--color-border) 20%, transparent);
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .variant-bordered {
      border: 2px solid var(--color-border);
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .variant-card {
      background-color: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
      padding: 1rem;
    }

    .variant-minimal {
      border-left: 4px solid var(--color-primary);
      padding-left: 1rem;
    }

    /* Group Footer */
    .group-footer {
      padding-top: 1rem;
      border-top: 1px solid color-mix(in oklab, var(--color-border) 50%, transparent);
    }

    /* Responsive Design */
    @media (max-width: 640px) {
      .group-controls {
        flex-direction: column;
        gap: 0.75rem;
        align-items: stretch;
      }

      .control-buttons {
        justify-content: center;
      }

      .orientation-horizontal .group-content {
        flex-direction: column;
      }
    }

    /* Focus Management */
    .collapse-group:focus-within {
      border-radius: 0.5rem;
      box-shadow:
        0 0 0 2px var(--color-background),
        0 0 0 4px var(--color-primary);
    }

    /* Loading State */
    .loading {
      opacity: 0.5;
      pointer-events: none;
    }

    .loading .group-content {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding-block: 2rem;
      color: var(--color-muted-foreground);
    }

    .empty-state-icon {
      width: 3rem;
      height: 3rem;
      margin-inline: auto;
      margin-bottom: 1rem;
      color: color-mix(in oklab, var(--color-muted-foreground) 50%, transparent);
    }

    .empty-state-text {
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .empty-state-description {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  `]
})
export class CollapseGroupComponent implements AfterContentInit, OnDestroy {
  readonly collapseItems = contentChildren(CollapseComponent, { descendants: true });
  readonly cardItems = contentChildren(CollapsibleCardComponent, { descendants: true });

  // Configuration inputs
  readonly variant = input<CollapseVariant>('default');
  readonly size = input<CollapseSize>('md');
  readonly animation = input<CollapseAnimation>('slide');
  readonly duration = input<number>(300);
  readonly allowMultiple = input<boolean>(true);
  readonly allowToggleAll = input<boolean>(true);
  readonly staggerDelay = input<number>(100);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly groupLabel = input<string>('Collapsible Group');
  readonly showControls = input<boolean>(true);
  readonly showStats = input<boolean>(true);
  readonly loading = input<boolean>(false);

  // Events
  readonly itemToggle = output<{ itemId: string; expanded: boolean }>();
  readonly expandedItemsChange = output<string[]>();
  readonly expandAllEvent = output<void>();
  readonly collapseAllEvent = output<void>();

  // Internal state
  private readonly expandedItems = signal<Set<string>>(new Set());
  private readonly itemSubscriptions = new Map<string, any>();

  // Computed properties
  readonly containerClasses = computed(() => {
    const variantValue = this.variant();
    const sizeValue = this.size();
    const orientationValue = this.orientation();
    const animationValue = this.animation();

    return [
      'collapse-group-container',
      `variant-${variantValue}`,
      `size-${sizeValue}`,
      `orientation-${orientationValue}`,
      `animation-${animationValue}`,
      this.loading() ? 'loading' : ''
    ].filter(Boolean).join(' ');
  });

  readonly contentClasses = computed(() => {
    return [
      'group-content',
      'animation-stagger'
    ].filter(Boolean).join(' ');
  });

  readonly allItems = computed(() => {
    const collapseItemsArr = this.collapseItems() || [];
    const cardItemsArr = this.cardItems() || [];
    return [...collapseItemsArr, ...cardItemsArr];
  });

  readonly totalCount = computed(() => this.allItems().length);
  readonly expandedCount = computed(() => this.expandedItems().size);
  readonly allExpanded = computed(() => this.expandedCount() === this.totalCount() && this.totalCount() > 0);
  readonly allCollapsed = computed(() => this.expandedCount() === 0);
  readonly hasFooterContent = computed(() => {
    // Check if footer slot has content
    return false; // This would need to be implemented based on content projection
  });

  constructor() {
    // Use effect to set up subscriptions when content children change
    effect(() => {
      const collapseItemsArr = this.collapseItems();
      const cardItemsArr = this.cardItems();
      this.setupItemSubscriptions(collapseItemsArr, cardItemsArr);
    });
  }

  ngAfterContentInit() {
    // Initial setup handled by effect in constructor
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

  private setupItemSubscriptions(collapseItemsArr: readonly CollapseComponent[], cardItemsArr: readonly CollapsibleCardComponent[]) {
    // Clear existing subscriptions
    this.itemSubscriptions.forEach(subscription => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    this.itemSubscriptions.clear();

    // Set up new subscriptions for collapse items
    collapseItemsArr.forEach((item, index) => {
      const itemId = `collapse-${index}`;
      const subscription = item.expandedChange.subscribe((expanded: boolean) => {
        this.handleItemToggle(itemId, expanded);
      });
      this.itemSubscriptions.set(itemId, subscription);
    });

    // Set up new subscriptions for card items
    cardItemsArr.forEach((item, index) => {
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
      if (!this.allowMultiple()) {
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
    if (!this.allowMultiple()) {
      return;
    }

    this.collapseItems().forEach(item => {
      if (!item.disabled()) {
        item.expand();
      }
    });

    this.cardItems().forEach(item => {
      if (!item.disabled()) {
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
    this.collapseItems().forEach(item => {
      if (!item.disabled()) {
        item.collapse();
      }
    });

    this.cardItems().forEach(item => {
      if (!item.disabled()) {
        item.collapse();
      }
    });
  }

  expandItem(index: number): void {
    const allItemsArr = this.allItems();
    if (index >= 0 && index < allItemsArr.length) {
      const item = allItemsArr[index];
      if ('expand' in item && !item.disabled()) {
        item.expand();
      }
    }
  }

  collapseItem(index: number): void {
    const allItemsArr = this.allItems();
    if (index >= 0 && index < allItemsArr.length) {
      const item = allItemsArr[index];
      if ('collapse' in item && !item.disabled()) {
        item.collapse();
      }
    }
  }

  toggleItem(index: number): void {
    const allItemsArr = this.allItems();
    if (index >= 0 && index < allItemsArr.length) {
      const item = allItemsArr[index];
      if ('toggleExpansion' in item && !item.disabled()) {
        item.toggleExpansion();
      } else if ('toggleCollapse' in item && !item.disabled()) {
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
