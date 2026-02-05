import {
  Component,
  input,
  output,
  computed,
  signal,
  effect,
  model,
  viewChild,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';


/**
 * Modern Angular component using signal-based inputs/outputs
 * Demonstrates latest Angular 21+ features
 */
@Component({
  selector: 'app-modern-card',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #cardElement
      class="modern-card"
      [class]="cardClasses()"
      [style.--hover-scale]="hoverScale()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (click)="handleClick()"
    >
      <!-- Card Header -->
      @if (showHeader()) {
        <div class="card-header" [class.with-actions]="hasActions()">
          <div class="header-content">
            @if (icon()) {
              <div class="card-icon">
                <i [class]="icon()"></i>
              </div>
            }

            <div class="header-text">
              @if (title()) {
                <h3 class="card-title" [class]="titleClass()">
                  {{ title() }}
                </h3>
              }

              @if (subtitle()) {
                <p class="card-subtitle" [class]="subtitleClass()">
                  {{ subtitle() }}
                </p>
              }
            </div>
          </div>

          @if (hasActions()) {
            <div class="card-actions">
              <ng-content select="[slot=actions]" />
            </div>
          }
        </div>
      }

      <!-- Card Content -->
      <div class="card-content" [class]="contentClass()">
        <ng-content />
      </div>

      <!-- Card Footer -->
      @if (showFooter()) {
        <div class="card-footer" [class]="footerClass()">
          <ng-content select="[slot=footer]" />
        </div>
      }

      <!-- Loading Overlay -->
      @if (loading()) {
        <div class="loading-overlay">
          <div class="loading-spinner"></div>
          @if (loadingText()) {
            <p class="loading-text">{{ loadingText() }}</p>
          }
        </div>
      }

      <!-- Hover Effect -->
      @if (hoverEffect() && isHovered()) {
        <div class="hover-overlay"></div>
      }
    </div>
  `,
  styles: [`
    .modern-card {
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      cursor: pointer;
    }

    .modern-card:hover {
      transform: translateY(-4px) scale(var(--hover-scale, 1.02));
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.2);
    }

    .modern-card.variant-elevated {
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.05);
    }

    .modern-card.variant-outlined {
      background: transparent;
      border: 2px solid rgba(59, 130, 246, 0.3);
    }

    .modern-card.variant-filled {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .modern-card.size-sm {
      padding: 1rem;
      border-radius: 12px;
    }

    .modern-card.size-lg {
      padding: 2rem;
      border-radius: 20px;
    }

    .modern-card.clickable {
      cursor: pointer;
    }

    .modern-card.clickable:active {
      transform: translateY(-2px) scale(0.98);
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 8px;
      background: rgba(59, 130, 246, 0.1);
      color: #3B82F6;
      font-size: 1.25rem;
    }

    .header-text {
      flex: 1;
    }

    .card-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.4;
    }

    .card-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.4;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .card-content {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
    }

    .card-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      border-radius: inherit;
    }

    .loading-spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top: 2px solid #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
    }

    .hover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.1) 0%,
        rgba(139, 92, 246, 0.1) 100%
      );
      border-radius: inherit;
      pointer-events: none;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .modern-card {
        transition: none;
      }

      .modern-card:hover {
        transform: none;
      }

      .loading-spinner {
        animation: none;
      }
    }

    /* High contrast support */
    @media (prefers-contrast: high) {
      .modern-card {
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: rgba(0, 0, 0, 0.9);
      }

      .card-title {
        color: white;
      }

      .card-subtitle {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  `]
})
export class ModernCardComponent {
  // Signal-based inputs (Angular 21+ feature)
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
  readonly variant = input<'default' | 'elevated' | 'outlined' | 'filled'>('default');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('');
  readonly clickable = input<boolean>(true);
  readonly hoverEffect = input<boolean>(true);
  readonly hoverScale = input<number>(1.02);
  readonly titleClass = input<string>('');
  readonly subtitleClass = input<string>('');
  readonly contentClass = input<string>('');
  readonly footerClass = input<string>('');

  // Signal-based two-way binding (model)
  readonly selected = model<boolean>(false);
  readonly expanded = model<boolean>(false);

  // Signal-based outputs (Angular 21+ feature)
  readonly cardClick = output<MouseEvent>();
  readonly cardHover = output<boolean>();
  readonly cardFocus = output<FocusEvent>();
  readonly cardBlur = output<FocusEvent>();

  // ViewChild with signal
  readonly cardElement = viewChild<ElementRef<HTMLElement>>('cardElement');

  // Internal state signals
  protected readonly isHovered = signal(false);
  protected readonly isFocused = signal(false);

  // Computed signals for dynamic classes and properties
  readonly cardClasses = computed(() => {
    const classes = ['modern-card'];

    classes.push(`variant-${this.variant()}`);
    classes.push(`size-${this.size()}`);

    if (this.clickable()) classes.push('clickable');
    if (this.selected()) classes.push('selected');
    if (this.expanded()) classes.push('expanded');
    if (this.loading()) classes.push('loading');

    return classes.join(' ');
  });

  readonly showHeader = computed(() =>
    this.title() || this.subtitle() || this.icon() || this.hasActions()
  );

  readonly showFooter = computed(() => this.hasActions());

  readonly hasActions = computed(() => {
    // This would be determined by checking if actions slot has content
    // For now, we'll return false as we can't easily check slot content
    return false;
  });

  constructor() {
    // Effect to handle accessibility
    effect(() => {
      const element = this.cardElement()?.nativeElement;
      if (element) {
        if (this.clickable()) {
          element.setAttribute('role', 'button');
          element.setAttribute('tabindex', '0');
        } else {
          element.removeAttribute('role');
          element.removeAttribute('tabindex');
        }
      }
    });

    // Effect to handle selection state
    effect(() => {
      const element = this.cardElement()?.nativeElement;
      if (element) {
        element.setAttribute('aria-selected', this.selected().toString());
      }
    });

    // Effect to handle expanded state
    effect(() => {
      const element = this.cardElement()?.nativeElement;
      if (element) {
        element.setAttribute('aria-expanded', this.expanded().toString());
      }
    });
  }

  // Event handlers
  onMouseEnter(): void {
    this.isHovered.set(true);
    this.cardHover.emit(true);
  }

  onMouseLeave(): void {
    this.isHovered.set(false);
    this.cardHover.emit(false);
  }

  handleClick(): void {
    if (this.clickable() && !this.loading()) {
      const event = new MouseEvent('click');
      this.cardClick.emit(event);

      // Toggle selection if it's a selectable card
      if (this.selected !== undefined) {
        this.selected.update(current => !current);
      }
    }
  }

  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.cardFocus.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.cardBlur.emit(event);
  }

  // Public methods for programmatic control
  focus(): void {
    this.cardElement()?.nativeElement.focus();
  }

  blur(): void {
    this.cardElement()?.nativeElement.blur();
  }

  toggle(): void {
    this.selected.update(current => !current);
  }

  expand(): void {
    this.expanded.set(true);
  }

  collapse(): void {
    this.expanded.set(false);
  }

  toggleExpanded(): void {
    this.expanded.update(current => !current);
  }
}
