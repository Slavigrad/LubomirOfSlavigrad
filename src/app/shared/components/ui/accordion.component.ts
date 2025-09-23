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
  standalone: true,
  imports: [CommonModule, CollapseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="accordion-container"
      [class]="containerClasses()"
      role="tablist"
      [attr.aria-multiselectable]="allowMultiple"
    >
      @for (item of items; track item.id; let i = $index) {
        <app-collapse
          [variant]="variant"
          [size]="size"
          [animation]="animation"
          [duration]="duration"
          [disabled]="item.disabled || false"
          [allowToggle]="allowToggle"
          [expanded]="isItemExpanded(item.id)"
          [showIcon]="showIcons"
          [customIcon]="customIcon"
          [headerText]="item.header"
          [headerClass]="getItemHeaderClass(item, i)"
          [contentClass]="getItemContentClass(item, i)"
          (expandedChange)="onItemToggle(item.id, $event)"
          (toggleEvent)="onItemToggleEvent(item.id, $event)"
          [attr.aria-setsize]="items.length"
          [attr.aria-posinset]="i + 1"
        >
          <!-- Header slot -->
          <div slot="header" class="accordion-item-header">
            <ng-container
              *ngTemplateOutlet="getHeaderTemplate(item); context: { $implicit: item, index: i }"
            ></ng-container>
          </div>

          <!-- Content -->
          <div class="accordion-item-content">
            @if (item.content) {
              <div [innerHTML]="item.content"></div>
            }
            <ng-container
              *ngTemplateOutlet="getContentTemplate(item); context: { $implicit: item, index: i }"
            ></ng-container>
          </div>
        </app-collapse>
      }

      <!-- Content projection for custom accordion items -->
      <ng-content></ng-content>
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
  @ContentChildren(CollapseComponent) collapseItems!: QueryList<CollapseComponent>;

  // Configuration inputs
  @Input() items: AccordionItem[] = [];
  @Input() variant: CollapseVariant = 'default';
  @Input() size: CollapseSize = 'md';
  @Input() animation: CollapseAnimation = 'slide';
  @Input() duration: number = 300;
  @Input() allowMultiple: boolean = false;
  @Input() allowToggle: boolean = true;
  @Input() allowToggleAll: boolean = true;
  @Input() showIcons: boolean = true;
  @Input() customIcon: string = '';
  @Input() staggerAnimation: boolean = false;

  // Events
  @Output() itemToggle = new EventEmitter<{ itemId: string; expanded: boolean }>();
  @Output() itemsChange = new EventEmitter<AccordionItem[]>();
  @Output() expandedItemsChange = new EventEmitter<string[]>();

  // Internal state
  private readonly expandedItems = signal<Set<string>>(new Set());
  private readonly itemTemplates = signal<Map<string, any>>(new Map());
  private readonly itemsSignal = signal<AccordionItem[]>([]);

  // Computed properties
  readonly containerClasses = computed(() => {
    const variant = this.variant;
    const size = this.size;
    const animation = this.animation;

    return [
      'accordion',
      `variant-${variant}`,
      `size-${size}`,
      `animation-${animation}`,
      this.staggerAnimation ? 'animation-stagger' : ''
    ].filter(Boolean).join(' ');
  });

  readonly expandedItemIds = computed(() => Array.from(this.expandedItems()));

  ngAfterContentInit() {
    // Initialize expanded items from initial state
    this.itemsSignal.set(this.items);

    effect(() => {
      const initialExpanded = new Set<string>();
      this.itemsSignal().forEach(item => {
        if (item.expanded) {
          initialExpanded.add(item.id);
        }
      });
      this.expandedItems.set(initialExpanded);
    });

    // Watch for changes in content children
    if (this.collapseItems) {
      this.collapseItems.changes.subscribe(() => {
        this.updateContentChildren();
      });
      this.updateContentChildren();
    }
  }

  ngOnDestroy() {
    // Cleanup subscriptions if needed
  }

  private updateContentChildren() {
    // Sync content children with accordion behavior
    this.collapseItems.forEach((collapse, index) => {
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
      if (!this.allowMultiple) {
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
      expanded: item.id === itemId ? expanded : (this.allowMultiple ? item.expanded : false)
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

    if (index === 0) classes.push('item-first');
    if (index === this.items.length - 1) classes.push('item-last');
    if (index > 0 && index < this.items.length - 1) classes.push('item-middle');
    if (this.items.length === 1) classes.push('item-only');

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
    const item = this.items.find(i => i.id === itemId);
    if (item && !item.disabled) {
      this.onItemToggle(itemId, true);
    }
  }

  collapseItem(itemId: string): void {
    const item = this.items.find(i => i.id === itemId);
    if (item && !item.disabled) {
      this.onItemToggle(itemId, false);
    }
  }

  expandAll(): void {
    if (this.allowMultiple) {
      this.items.forEach(item => {
        if (!item.disabled) {
          this.expandItem(item.id);
        }
      });
    }
  }

  collapseAll(): void {
    this.items.forEach(item => {
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
