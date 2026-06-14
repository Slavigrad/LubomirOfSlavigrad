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
  templateUrl: './collapse-group.component.html',
  styleUrl: './collapse-group.component.scss',
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
