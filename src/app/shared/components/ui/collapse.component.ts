import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  effect,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  AfterViewInit
} from '@angular/core';

import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations';
import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { createCollapseVariants, collapseCompoundVariants, combineVariants } from '../../utils';

// Create collapse variants using shared variant system
const collapseContainerVariants = combineVariants(
  createCollapseVariants('collapse'),
  collapseCompoundVariants
);

// Simple header and content variants (component-specific)
const collapseHeaderVariants = createCollapseVariants('collapse-header');
const collapseContentVariants = createCollapseVariants('collapse-content');

// Generate TypeScript types from CVA variants
type CollapseVariants = VariantProps<typeof collapseContainerVariants>;
export type CollapseVariant = CollapseVariants['variant'];
export type CollapseSize = CollapseVariants['size'];
export type CollapseAnimation = CollapseVariants['animation'];

export interface CollapseConfig {
  variant?: CollapseVariant;
  size?: CollapseSize;
  animation?: CollapseAnimation;
  duration?: number;
  disabled?: boolean;
  allowToggle?: boolean;
  startExpanded?: boolean;
  showIcon?: boolean;
  customIcon?: string;
  headerClass?: string;
  contentClass?: string;
}

@Component({
  selector: 'app-collapse',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Slide animation
    trigger('slideAnimation', [
      state('collapsed', style({
        height: '0px',
        opacity: 0
      })),
      state('expanded', style({
        height: '*',
        opacity: 1
      })),
      transition('collapsed <=> expanded', [
        animate('{{ duration }}ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),

    // Fade animation
    trigger('fadeAnimation', [
      state('collapsed', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      state('expanded', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('collapsed <=> expanded', [
        animate('{{ duration }}ms ease-in-out')
      ])
    ]),

    // Scale animation
    trigger('scaleAnimation', [
      state('collapsed', style({
        transform: 'scaleY(0)',
        transformOrigin: 'top',
        opacity: 0
      })),
      state('expanded', style({
        transform: 'scaleY(1)',
        transformOrigin: 'top',
        opacity: 1
      })),
      transition('collapsed <=> expanded', [
        animate('{{ duration }}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')
      ])
    ]),

    // Rotate icon animation
    trigger('iconRotation', [
      state('collapsed', style({
        transform: 'rotate(0deg)'
      })),
      state('expanded', style({
        transform: 'rotate(180deg)'
      })),
      transition('collapsed <=> expanded', [
        animate('{{ duration }}ms ease-in-out')
      ])
    ])
  ],
  template: `
    <div
      class="collapse-container"
      [class]="containerClasses()"
      [attr.aria-expanded]="isExpanded()"
      [attr.aria-disabled]="disabled"
    >
      <!-- Header/Trigger -->
      <div
        #headerElement
        class="collapse-header"
        [class]="headerClasses()"
        (click)="toggleCollapse()"
        (keydown.enter)="toggleCollapse()"
        (keydown.space)="toggleCollapse()"
        [attr.tabindex]="disabled ? -1 : 0"
        [attr.role]="'button'"
        [attr.aria-controls]="contentId"
        [attr.aria-expanded]="isExpanded()"
      >
        <!-- Header Content -->
        <div class="header-content">
          <ng-content select="[slot=header]"></ng-content>
          @if (!hasHeaderSlot()) {
            <span class="default-header">{{ headerText }}</span>
          }
        </div>

        <!-- Toggle Icon -->
        @if (showIcon) {
          <div
            class="collapse-icon"
            [@iconRotation]="{ value: animationState(), params: { duration: duration } }"
          >
            @if (customIcon) {
              <span [innerHTML]="customIcon"></span>
            } @else {
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            }
          </div>
        }
      </div>

      <!-- Content -->
      <div
        #contentElement
        [id]="contentId"
        class="collapse-content"
        [class]="contentClasses()"
        [@slideAnimation]="getAnimationConfig()"
        (@slideAnimation.start)="onAnimationStart($event)"
        (@slideAnimation.done)="onAnimationDone($event)"
        [attr.aria-hidden]="!isExpanded()"
        role="region"
      >
        <div class="content-wrapper">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .collapse-container {
      @apply w-full;
    }

    /* Variant Styles */
    .variant-default {
      @apply border border-border rounded-lg overflow-hidden;
    }

    .variant-glass {
      @apply backdrop-blur-xl bg-gradient-to-br from-card/50 to-card/30;
      @apply border border-border/20 rounded-lg overflow-hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .variant-bordered {
      @apply border-2 border-border rounded-lg overflow-hidden;
    }

    .variant-minimal {
      @apply border-b border-border/50;
    }

    .variant-card {
      @apply bg-card border border-border rounded-lg shadow-lg overflow-hidden;
    }

    /* Header Styles */
    .collapse-header {
      @apply flex items-center justify-between p-4 cursor-pointer;
      @apply transition-all duration-200 ease-in-out;
      @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
    }

    .collapse-header:hover {
      @apply bg-muted/50;
    }

    .collapse-header[aria-disabled="true"] {
      @apply cursor-not-allowed opacity-50;
    }

    .header-content {
      @apply flex-1 text-left;
    }

    .default-header {
      @apply font-medium text-foreground;
    }

    .collapse-icon {
      @apply ml-2 text-muted-foreground transition-transform duration-200;
    }

    /* Size Variants */
    .size-sm .collapse-header {
      @apply p-2 text-sm;
    }

    .size-sm .collapse-icon {
      @apply w-4 h-4;
    }

    .size-md .collapse-header {
      @apply p-4 text-base;
    }

    .size-md .collapse-icon {
      @apply w-5 h-5;
    }

    .size-lg .collapse-header {
      @apply p-6 text-lg;
    }

    .size-lg .collapse-icon {
      @apply w-6 h-6;
    }

    /* Content Styles */
    .collapse-content {
      @apply overflow-hidden;
    }

    /* Ensure content can overflow when expanded without animating the property */
    .collapse-content[aria-hidden="false"] {
      overflow: visible;
    }

    .content-wrapper {
      @apply p-4;
    }

    .size-sm .content-wrapper {
      @apply p-2;
    }

    .size-lg .content-wrapper {
      @apply p-6;
    }

    /* Animation States */
    .animation-fade .collapse-content {
      @apply transition-all duration-300 ease-in-out;
    }

    .animation-scale .collapse-content {
      @apply transition-all duration-300 ease-out;
    }

    /* Accessibility */
    .collapse-header:focus-visible {
      @apply ring-2 ring-primary ring-offset-2;
    }

    /* Disabled State */
    .disabled {
      @apply opacity-50 pointer-events-none;
    }
  `]
})
export class CollapseComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('headerElement') headerElement!: ElementRef<HTMLElement>;
  @ViewChild('contentElement') contentElement!: ElementRef<HTMLElement>;

  // Configuration inputs
  @Input() variant: CollapseVariant = 'default';
  @Input() size: CollapseSize = 'md';
  @Input() animation: CollapseAnimation = 'slide';
  @Input() duration: number = 300;
  @Input() disabled: boolean = false;
  @Input() allowToggle: boolean = true;
  @Input() expanded: boolean = false;
  @Input() showIcon: boolean = true;
  @Input() customIcon: string = '';
  @Input() headerText: string = 'Toggle Content';
  @Input() headerClass: string = '';
  @Input() contentClass: string = '';

  // Events
  @Output() expandedChange = new EventEmitter<boolean>();
  @Output() toggleEvent = new EventEmitter<boolean>();
  @Output() animationStart = new EventEmitter<AnimationEvent>();
  @Output() animationDone = new EventEmitter<AnimationEvent>();

  // Internal state
  private readonly animating = signal(false);
  readonly hasHeaderSlot = signal(false);
  private readonly expandedSignal = signal(false);

  // Computed properties
  readonly isExpanded = computed(() => this.expandedSignal());
  readonly animationState = computed(() => this.isExpanded() ? 'expanded' : 'collapsed');
  readonly contentId = `collapse-content-${Math.random().toString(36).substr(2, 9)}`;

  readonly containerClasses = computed(() =>
    clsx(
      collapseContainerVariants({
        variant: this.variant,
        size: this.size,
        animation: this.animation,
        disabled: this.disabled
      }),
      this.headerClass
    )
  );

  readonly headerClasses = computed(() =>
    clsx(
      collapseHeaderVariants({}),
      {
        'animating': this.animating()
      }
    )
  );

  readonly contentClasses = computed(() =>
    clsx(
      collapseContentVariants({}),
      this.contentClass
    )
  );

  ngOnInit() {
    // Initialize expanded signal from input
    this.expandedSignal.set(this.expanded);
  }

  ngAfterViewInit() {
    // Check if header slot content exists after view initialization
    if (this.headerElement) {
      const headerSlot = this.headerElement.nativeElement.querySelector('[slot=header]');
      this.hasHeaderSlot.set(!!headerSlot);
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  toggleCollapse(): void {
    if (this.disabled || !this.allowToggle || this.animating()) {
      return;
    }

    const newState = !this.isExpanded();
    this.expandedSignal.set(newState);
    this.expandedChange.emit(newState);
    this.toggleEvent.emit(newState);
  }

  expand(): void {
    if (!this.isExpanded() && !this.disabled) {
      this.toggleCollapse();
    }
  }

  collapse(): void {
    if (this.isExpanded() && !this.disabled) {
      this.toggleCollapse();
    }
  }

  getAnimationConfig() {
    const animationType = this.animation;
    const duration = this.duration;
    const state = this.animationState();

    switch (animationType) {
      case 'fade':
        return { value: state, params: { duration } };
      case 'scale':
        return { value: state, params: { duration } };
      case 'slide':
      default:
        return { value: state, params: { duration } };
    }
  }

  onAnimationStart(event: AnimationEvent): void {
    this.animating.set(true);
    this.animationStart.emit(event);
  }

  onAnimationDone(event: AnimationEvent): void {
    this.animating.set(false);
    this.animationDone.emit(event);
  }
}
