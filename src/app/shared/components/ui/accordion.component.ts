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
import { NgTemplateOutlet } from '@angular/common';
import { CollapseComponent, CollapseVariant, CollapseSize, CollapseAnimation } from './collapse.component';

export interface AccordionItem {
  id: string;
  header: string;
  content?: string;
  disabled?: boolean;
  expanded?: boolean;
}

export interface AccordionConfig {
  variant?: CollapseVariant;
  size?: CollapseSize;
  animation?: CollapseAnimation;
  duration?: number;
  allowMultiple?: boolean;
  allowToggle?: boolean;
  showIcons?: boolean;
  customIcon?: string;
}

@Component({
  selector: 'app-accordion',
  imports: [NgTemplateOutlet, CollapseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="accordion-container"
      [class]="containerClasses()"
      role="tablist"
      [attr.aria-multiselectable]="allowMultiple()"
    >
      @for (item of items(); track item.id; let i = $index) {
        <app-collapse
          [variant]="variant()"
          [size]="size()"
          [animation]="animation()"
          [duration]="duration()"
          [disabled]="item.disabled || false"
          [allowToggle]="allowToggle()"
          [expanded]="isItemExpanded(item.id)"
          [showIcon]="showIcons()"
          [customIcon]="customIcon()"
          [headerText]="item.header"
          [headerClass]="getItemHeaderClass(item, i)"
          [contentClass]="getItemContentClass(item, i)"
          (expandedChange)="onItemToggle(item.id, $event)"
          (toggleEvent)="onItemToggleEvent(item.id, $event)"
          [attr.aria-setsize]="items().length"
          [attr.aria-posinset]="i + 1"
        >
          <!-- Header slot -->
          <div slot="header" class="accordion-item-header">
            <ng-container *ngTemplateOutlet="getHeaderTemplate(item); context: { $implicit: item, index: i }"
             />
          </div>

          <!-- Content -->
          <div class="accordion-item-content">
            @if (item.content) {
              <div [innerHTML]="item.content"></div>
            }
            <ng-container *ngTemplateOutlet="getContentTemplate(item); context: { $implicit: item, index: i }"
             />
          </div>
        </app-collapse>
      }

      <!-- Content projection for custom accordion items -->
      <ng-content />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .accordion-container {
      @apply w-full space-y-0;
    }

    /* Variant-specific spacing */
    .variant-default .accordion-container,
    .variant-glass .accordion-container,
    .variant-bordered .accordion-container,
    .variant-card .accordion-container {
      @apply space-y-2;
    }

    .variant-minimal .accordion-container {
      @apply space-y-0;
    }

    /* Item styling */
    .accordion-item-header {
      @apply w-full text-left;
    }

    .accordion-item-content {
      @apply w-full;
    }

    /* Size variants */
    .size-sm {
      @apply text-sm;
    }

    .size-md {
      @apply text-base;
    }

    .size-lg {
      @apply text-lg;
    }

    /* Animation classes */
    .animation-stagger app-collapse {
      animation-delay: calc(var(--item-index) * 50ms);
    }

    /* Accessibility improvements */
    .accordion-container:focus-within {
      @apply ring-2 ring-primary ring-offset-2 rounded-lg;
    }

    /* Custom item states */
    .item-first {
      @apply rounded-t-lg;
    }

    .item-last {
      @apply rounded-b-lg;
    }

    .item-middle {
      @apply rounded-none;
    }

    .item-only {
      @apply rounded-lg;
    }

    /* Hover effects for groups */
    .variant-glass .accordion-container:hover {
      @apply shadow-lg;
    }

    .variant-card .accordion-container:hover {
      @apply shadow-xl;
    }
  `]
})
export class AccordionComponent implements AfterContentInit, OnDestroy {
  readonly collapseItems = contentChildren(CollapseComponent);

  // Configuration inputs
  readonly items = input<AccordionItem[]>([]);
  readonly variant = input<CollapseVariant>('default');
  readonly size = input<CollapseSize>('md');
  readonly animation = input<CollapseAnimation>('slide');
  readonly duration = input<number>(300);
  readonly allowMultiple = input<boolean>(false);
  readonly allowToggle = input<boolean>(true);
  readonly allowToggleAll = input<boolean>(true);
  readonly showIcons = input<boolean>(true);
  readonly customIcon = input<string>('');
  readonly staggerAnimation = input<boolean>(false);

  // Events
  readonly itemToggle = output<{ itemId: string; expanded: boolean }>();
  readonly itemsChange = output<AccordionItem[]>();
  readonly expandedItemsChange = output<string[]>();

  // Internal state
  private readonly expandedItems = signal<Set<string>>(new Set());
  private readonly itemTemplates = signal<Map<string, any>>(new Map());
  private readonly itemsSignal = signal<AccordionItem[]>([]);

  // Computed properties
  readonly containerClasses = computed(() => {
    const variantValue = this.variant();
    const sizeValue = this.size();
    const animationValue = this.animation();

    return [
      'accordion',
      `variant-${variantValue}`,
      `size-${sizeValue}`,
      `animation-${animationValue}`,
      this.staggerAnimation() ? 'animation-stagger' : ''
    ].filter(Boolean).join(' ');
  });

  readonly expandedItemIds = computed(() => Array.from(this.expandedItems()));

  constructor() {
    // Use effect to track items input and content children changes
    effect(() => {
      const itemsValue = this.items();
      this.itemsSignal.set(itemsValue);

      const initialExpanded = new Set<string>();
      itemsValue.forEach(item => {
        if (item.expanded) {
          initialExpanded.add(item.id);
        }
      });
      this.expandedItems.set(initialExpanded);
    });

    // Use effect to watch content children
    effect(() => {
      const collapseItemsArr = this.collapseItems();
      this.updateContentChildren(collapseItemsArr);
    });
  }

  ngAfterContentInit() {
    // Initial setup handled by effects in constructor
  }

  ngOnDestroy() {
    // Cleanup subscriptions if needed
  }

  private updateContentChildren(collapseItemsArr: readonly CollapseComponent[]) {
    // Sync content children with accordion behavior
    collapseItemsArr.forEach((collapse, index) => {
      // Set up event listeners for content children
      collapse.expandedChange.subscribe((expanded: boolean) => {
        const itemId = `content-child-${index}`;
        this.onItemToggle(itemId, expanded);
      });
    });
  }

  isItemExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }

  onItemToggle(itemId: string, expanded: boolean): void {
    const currentExpanded = new Set(this.expandedItems());

    if (expanded) {
      if (!this.allowMultiple()) {
        // Close all other items if multiple not allowed
        currentExpanded.clear();
      }
      currentExpanded.add(itemId);
    } else {
      currentExpanded.delete(itemId);
    }

    this.expandedItems.set(currentExpanded);
    this.itemToggle.emit({ itemId, expanded });
    this.expandedItemsChange.emit(Array.from(currentExpanded));

    // Update items array
    const updatedItems = this.itemsSignal().map(item => ({
      ...item,
      expanded: item.id === itemId ? expanded : (this.allowMultiple() ? item.expanded : false)
    }));
    this.itemsSignal.set(updatedItems);
    this.itemsChange.emit(updatedItems);
  }

  onItemToggleEvent(itemId: string, expanded: boolean): void {
    // Additional event handling if needed
    console.log(`Accordion item ${itemId} ${expanded ? 'expanded' : 'collapsed'}`);
  }

  getItemHeaderClass(item: AccordionItem, index: number): string {
    const classes = ['accordion-item-header'];
    const itemsArr = this.items();

    if (index === 0) classes.push('item-first');
    if (index === itemsArr.length - 1) classes.push('item-last');
    if (index > 0 && index < itemsArr.length - 1) classes.push('item-middle');
    if (itemsArr.length === 1) classes.push('item-only');

    return classes.join(' ');
  }

  getItemContentClass(item: AccordionItem, index: number): string {
    return 'accordion-item-content';
  }

  getHeaderTemplate(item: AccordionItem): any {
    return this.itemTemplates().get(`${item.id}-header`) || null;
  }

  getContentTemplate(item: AccordionItem): any {
    return this.itemTemplates().get(`${item.id}-content`) || null;
  }

  // Public API methods
  expandItem(itemId: string): void {
    const item = this.items().find(i => i.id === itemId);
    if (item && !item.disabled) {
      this.onItemToggle(itemId, true);
    }
  }

  collapseItem(itemId: string): void {
    const item = this.items().find(i => i.id === itemId);
    if (item && !item.disabled) {
      this.onItemToggle(itemId, false);
    }
  }

  expandAll(): void {
    if (this.allowMultiple()) {
      this.items().forEach(item => {
        if (!item.disabled) {
          this.expandItem(item.id);
        }
      });
    }
  }

  collapseAll(): void {
    this.items().forEach(item => {
      if (!item.disabled) {
        this.collapseItem(item.id);
      }
    });
  }

  toggleItem(itemId: string): void {
    const isExpanded = this.isItemExpanded(itemId);
    this.onItemToggle(itemId, !isExpanded);
  }

  addItem(item: AccordionItem): void {
    const currentItems = this.itemsSignal();
    this.itemsSignal.set([...currentItems, item]);
  }

  removeItem(itemId: string): void {
    const currentItems = this.itemsSignal().filter(item => item.id !== itemId);
    this.itemsSignal.set(currentItems);

    // Remove from expanded items
    const currentExpanded = new Set(this.expandedItems());
    currentExpanded.delete(itemId);
    this.expandedItems.set(currentExpanded);
  }

  updateItem(itemId: string, updates: Partial<AccordionItem>): void {
    const currentItems = this.itemsSignal().map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    this.itemsSignal.set(currentItems);
  }
}
