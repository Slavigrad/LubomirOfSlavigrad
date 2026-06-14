import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';

import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations';
import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import {
  createCollapseVariants,
  collapseCompoundVariants,
  combineVariants,
} from '../util-performance/utils';

// Create collapse variants using shared variant system
const collapseContainerVariants = combineVariants(
  createCollapseVariants('collapse'),
  collapseCompoundVariants,
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
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Slide animation
    trigger('slideAnimation', [
      state(
        'collapsed',
        style({
          height: '0px',
          opacity: 0,
        }),
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
        }),
      ),
      transition('collapsed <=> expanded', [
        animate('{{ duration }}ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
    ]),

    // Fade animation
    trigger('fadeAnimation', [
      state(
        'collapsed',
        style({
          opacity: 0,
          transform: 'translateY(-10px)',
        }),
      ),
      state(
        'expanded',
        style({
          opacity: 1,
          transform: 'translateY(0)',
        }),
      ),
      transition('collapsed <=> expanded', [animate('{{ duration }}ms ease-in-out')]),
    ]),

    // Scale animation
    trigger('scaleAnimation', [
      state(
        'collapsed',
        style({
          transform: 'scaleY(0)',
          transformOrigin: 'top',
          opacity: 0,
        }),
      ),
      state(
        'expanded',
        style({
          transform: 'scaleY(1)',
          transformOrigin: 'top',
          opacity: 1,
        }),
      ),
      transition('collapsed <=> expanded', [
        animate('{{ duration }}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'),
      ]),
    ]),

    // Rotate icon animation
    trigger('iconRotation', [
      state(
        'collapsed',
        style({
          transform: 'rotate(0deg)',
        }),
      ),
      state(
        'expanded',
        style({
          transform: 'rotate(180deg)',
        }),
      ),
      transition('collapsed <=> expanded', [animate('{{ duration }}ms ease-in-out')]),
    ]),
  ],
  template: `
    <div
      class="collapse-container"
      [class]="containerClasses()"
      [attr.aria-expanded]="isExpanded()"
      [attr.aria-disabled]="disabled()"
    >
      <!-- Header/Trigger -->
      <div
        #headerElement
        class="collapse-header"
        [class]="headerClasses()"
        (click)="toggleCollapse()"
        (keydown.enter)="toggleCollapse()"
        (keydown.space)="toggleCollapse()"
        [attr.tabindex]="disabled() ? -1 : 0"
        [attr.role]="'button'"
        [attr.aria-controls]="contentId"
        [attr.aria-expanded]="isExpanded()"
      >
        <!-- Header Content -->
        <div class="header-content">
          <ng-content select="[slot=header]" />
          @if (!hasHeaderSlot()) {
            <span class="default-header">{{ headerText() }}</span>
          }
        </div>

        <!-- Toggle Icon -->
        @if (showIcon()) {
          <div
            class="collapse-icon"
            [@iconRotation]="{ value: animationState(), params: { duration: duration() } }"
          >
            @if (customIcon()) {
              <span [innerHTML]="customIcon()"></span>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .collapse-container {
        width: 100%;
      }

      /* Variant Styles */
      .variant-default {
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        overflow: hidden;
      }

      .variant-glass {
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        background-image: linear-gradient(
          to bottom right,
          color-mix(in oklab, var(--color-card) 50%, transparent),
          color-mix(in oklab, var(--color-card) 30%, transparent)
        );
        border: 1px solid color-mix(in oklab, var(--color-border) 20%, transparent);
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .variant-bordered {
        border: 2px solid var(--color-border);
        border-radius: 0.5rem;
        overflow: hidden;
      }

      .variant-minimal {
        border-bottom: 1px solid color-mix(in oklab, var(--color-border) 50%, transparent);
      }

      .variant-card {
        background-color: var(--color-card);
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        box-shadow:
          0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
        overflow: hidden;
      }

      /* Header Styles */
      .collapse-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        cursor: pointer;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
      }
      .collapse-header:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow:
          0 0 0 2px var(--color-background),
          0 0 0 4px var(--color-primary);
      }

      .collapse-header:hover {
        background-color: color-mix(in oklab, var(--color-muted) 50%, transparent);
      }

      .collapse-header[aria-disabled='true'] {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .header-content {
        flex: 1 1 0%;
        text-align: left;
      }

      .default-header {
        font-weight: 500;
        color: var(--color-foreground);
      }

      .collapse-icon {
        margin-left: 0.5rem;
        color: var(--color-muted-foreground);
        transition-property: transform;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
      }

      /* Size Variants */
      .size-sm .collapse-header {
        padding: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
      }

      .size-sm .collapse-icon {
        width: 1rem;
        height: 1rem;
      }

      .size-md .collapse-header {
        padding: 1rem;
        font-size: 1rem;
        line-height: 1.5rem;
      }

      .size-md .collapse-icon {
        width: 1.25rem;
        height: 1.25rem;
      }

      .size-lg .collapse-header {
        padding: 1.5rem;
        font-size: 1.125rem;
        line-height: 1.75rem;
      }

      .size-lg .collapse-icon {
        width: 1.5rem;
        height: 1.5rem;
      }

      /* Content Styles */
      .collapse-content {
        overflow: hidden;
      }

      /* Ensure content can overflow when expanded without animating the property */
      .collapse-content[aria-hidden='false'] {
        overflow: visible;
      }

      .content-wrapper {
        padding: 1rem;
      }

      .size-sm .content-wrapper {
        padding: 0.5rem;
      }

      .size-lg .content-wrapper {
        padding: 1.5rem;
      }

      /* Animation States */
      .animation-fade .collapse-content {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
      }

      .animation-scale .collapse-content {
        transition-property: all;
        transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
        transition-duration: 300ms;
      }

      /* Accessibility */
      .collapse-header:focus-visible {
        box-shadow:
          0 0 0 2px var(--color-background),
          0 0 0 4px var(--color-primary);
      }

      /* Disabled State */
      .disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    `,
  ],
})
export class CollapseComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly headerElement = viewChild<ElementRef<HTMLElement>>('headerElement');
  readonly contentElement = viewChild<ElementRef<HTMLElement>>('contentElement');

  // Configuration inputs
  readonly variant = input<CollapseVariant>('default');
  readonly size = input<CollapseSize>('md');
  readonly animation = input<CollapseAnimation>('slide');
  readonly duration = input<number>(300);
  readonly disabled = input<boolean>(false);
  readonly allowToggle = input<boolean>(true);
  readonly expanded = input<boolean>(false);
  readonly showIcon = input<boolean>(true);
  readonly customIcon = input<string>('');
  readonly headerText = input<string>('Toggle Content');
  readonly headerClass = input<string>('');
  readonly contentClass = input<string>('');

  // Events
  readonly expandedChange = output<boolean>();
  readonly toggleEvent = output<boolean>();
  readonly animationStart = output<AnimationEvent>();
  readonly animationDone = output<AnimationEvent>();

  // Internal state
  private readonly animating = signal(false);
  readonly hasHeaderSlot = signal(false);
  private readonly expandedSignal = signal(false);

  // Computed properties
  readonly isExpanded = computed(() => this.expandedSignal());
  readonly animationState = computed(() => (this.isExpanded() ? 'expanded' : 'collapsed'));
  readonly contentId = `collapse-content-${Math.random().toString(36).substr(2, 9)}`;

  readonly containerClasses = computed(() =>
    clsx(
      collapseContainerVariants({
        variant: this.variant(),
        size: this.size(),
        animation: this.animation(),
        disabled: this.disabled(),
      }),
      this.headerClass(),
    ),
  );

  readonly headerClasses = computed(() =>
    clsx(collapseHeaderVariants({}), {
      animating: this.animating(),
    }),
  );

  readonly contentClasses = computed(() => clsx(collapseContentVariants({}), this.contentClass()));

  ngOnInit() {
    // Initialize expanded signal from input
    this.expandedSignal.set(this.expanded());
  }

  ngAfterViewInit() {
    // Check if header slot content exists after view initialization
    const headerEl = this.headerElement();
    if (headerEl) {
      const headerSlot = headerEl.nativeElement.querySelector('[slot=header]');
      this.hasHeaderSlot.set(!!headerSlot);
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  toggleCollapse(): void {
    if (this.disabled() || !this.allowToggle() || this.animating()) {
      return;
    }

    const newState = !this.isExpanded();
    this.expandedSignal.set(newState);
    this.expandedChange.emit(newState);
    this.toggleEvent.emit(newState);
  }

  expand(): void {
    if (!this.isExpanded() && !this.disabled()) {
      this.toggleCollapse();
    }
  }

  collapse(): void {
    if (this.isExpanded() && !this.disabled()) {
      this.toggleCollapse();
    }
  }

  getAnimationConfig() {
    const animationType = this.animation();
    const durationValue = this.duration();
    const stateValue = this.animationState();

    switch (animationType) {
      case 'fade':
        return { value: stateValue, params: { duration: durationValue } };
      case 'scale':
        return { value: stateValue, params: { duration: durationValue } };
      case 'slide':
      default:
        return { value: stateValue, params: { duration: durationValue } };
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
