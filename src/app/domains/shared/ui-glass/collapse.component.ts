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
  templateUrl: './collapse.component.html',
  styleUrl: './collapse.component.scss',
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
