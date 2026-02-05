import {
  Component,
  signal,
  computed,
  effect,
  input,
  output,
  viewChild,
  contentChild,
  ElementRef,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  AfterViewInit,
  AfterContentInit
} from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Modern Angular component demonstrating latest lifecycle hooks
 * and signal-based patterns in Angular 21+
 */
@Component({
  selector: 'app-modern-lifecycle',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #containerElement
      class="modern-lifecycle-container"
      [class]="containerClasses()"
    >
      <!-- Header Section -->
      <header class="lifecycle-header">
        <h2>Modern Angular Lifecycle Demo</h2>
        <p>Demonstrating Angular 21+ features and lifecycle hooks</p>

        <div class="lifecycle-stats">
          <div class="stat-item">
            <span class="stat-label">Render Count:</span>
            <span class="stat-value">{{ renderCount() }}</span>
          </div>

          <div class="stat-item">
            <span class="stat-label">Effect Runs:</span>
            <span class="stat-value">{{ effectRunCount() }}</span>
          </div>

          <div class="stat-item">
            <span class="stat-label">Component State:</span>
            <span class="stat-value">{{ componentState() }}</span>
          </div>
        </div>
      </header>

      <!-- Interactive Controls -->
      <section class="lifecycle-controls">
        <button
          class="btn btn-primary"
          (click)="incrementCounter()"
          [disabled]="isDestroyed()"
        >
          Increment Counter ({{ counter() }})
        </button>

        <button
          class="btn btn-secondary"
          (click)="toggleVisibility()"
          [disabled]="isDestroyed()"
        >
          Toggle Content ({{ isVisible() ? 'Visible' : 'Hidden' }})
        </button>

        <button
          class="btn btn-accent"
          (click)="triggerAsyncOperation()"
          [disabled]="isDestroyed() || isLoading()"
        >
          @if (isLoading()) {
            <span class="loading-spinner"></span>
            Loading...
          } @else {
            Async Operation
          }
        </button>
      </section>

      <!-- Dynamic Content -->
      @if (isVisible()) {
        <section class="lifecycle-content">
          <div class="content-grid">
            @for (item of computedItems(); track item.id) {
              <div
                class="content-item"
                [class.highlighted]="item.highlighted"
                (click)="selectItem(item.id)"
              >
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
                <small>Created: {{ item.timestamp | date:'short' }}</small>
              </div>
            }
          </div>

          @if (computedItems().length === 0) {
            <div class="empty-state">
              <p>No items to display. Click "Increment Counter" to generate items.</p>
            </div>
          }
        </section>
      }

      <!-- Performance Metrics -->
      <section class="lifecycle-metrics">
        <h3>Performance Metrics</h3>

        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Last Update:</span>
            <span class="metric-value">{{ lastUpdateTime() | date:'HH:mm:ss.SSS' }}</span>
          </div>

          <div class="metric-card">
            <span class="metric-label">Memory Usage:</span>
            <span class="metric-value">{{ memoryUsage() }} MB</span>
          </div>

          <div class="metric-card">
            <span class="metric-label">Active Effects:</span>
            <span class="metric-value">{{ activeEffects() }}</span>
          </div>
        </div>
      </section>

      <!-- Content Projection -->
      <section class="lifecycle-projection">
        <h3>Content Projection</h3>
        <div class="projected-content">
          <ng-content />
        </div>

        @if (!hasProjectedContent()) {
          <p class="no-content">No content projected</p>
        }
      </section>
    </div>
  `,
  styles: [`
    .modern-lifecycle-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .lifecycle-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .lifecycle-header h2 {
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 0.5rem;
    }

    .lifecycle-header p {
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 1.5rem;
    }

    .lifecycle-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #3B82F6;
    }

    .lifecycle-controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3B82F6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .btn-accent {
      background: #10B981;
      color: white;
    }

    .btn-accent:hover:not(:disabled) {
      background: #059669;
    }

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .lifecycle-content {
      margin-bottom: 2rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .content-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .content-item:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .content-item.highlighted {
      border-color: #3B82F6;
      background: rgba(59, 130, 246, 0.1);
    }

    .content-item h4 {
      margin: 0 0 0.5rem 0;
      color: rgba(255, 255, 255, 0.9);
    }

    .content-item p {
      margin: 0 0 0.5rem 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }

    .content-item small {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .lifecycle-metrics {
      margin-bottom: 2rem;
    }

    .lifecycle-metrics h3 {
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 1rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
    }

    .metric-value {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .lifecycle-projection h3 {
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 1rem;
    }

    .projected-content {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      min-height: 100px;
    }

    .no-content {
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
      text-align: center;
      margin: 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .modern-lifecycle-container {
        padding: 1rem;
      }

      .lifecycle-stats {
        gap: 1rem;
      }

      .lifecycle-controls {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 100%;
        max-width: 300px;
        justify-content: center;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ModernLifecycleComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {
  // Signal-based inputs
  readonly initialCounter = input<number>(0);
  readonly autoIncrement = input<boolean>(false);
  readonly theme = input<'light' | 'dark'>('dark');

  // Signal-based outputs
  readonly counterChange = output<number>();
  readonly stateChange = output<string>();
  readonly itemSelected = output<string>();

  // ViewChild and ContentChild with signals
  readonly containerElement = viewChild<ElementRef<HTMLElement>>('containerElement');
  readonly projectedContent = contentChild<ElementRef>('projected');

  // Internal state signals
  protected readonly counter = signal<number>(0);
  protected readonly isVisible = signal<boolean>(true);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isDestroyed = signal<boolean>(false);
  protected readonly componentState = signal<string>('initializing');
  protected readonly renderCount = signal<number>(0);
  protected readonly effectRunCount = signal<number>(0);
  protected readonly lastUpdateTime = signal<Date>(new Date());
  protected readonly selectedItemId = signal<string | null>(null);
  private readonly items = signal<Array<{
    id: string;
    title: string;
    description: string;
    timestamp: Date;
    highlighted: boolean;
  }>>([]);

  // Computed signals
  readonly containerClasses = computed(() => {
    const classes = ['modern-lifecycle'];
    classes.push(`theme-${this.theme()}`);
    if (this.isLoading()) classes.push('loading');
    if (this.isDestroyed()) classes.push('destroyed');
    return classes.join(' ');
  });

  readonly computedItems = computed(() => {
    const selectedId = this.selectedItemId();
    return this.items().map(item => ({
      ...item,
      highlighted: item.id === selectedId
    }));
  });

  readonly hasProjectedContent = computed(() => {
    return !!this.projectedContent();
  });

  readonly memoryUsage = computed(() => {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  });

  readonly activeEffects = computed(() => {
    // This is a simplified count - in a real app you'd track actual effects
    return this.effectRunCount();
  });

  // Lifecycle hooks
  ngOnInit(): void {
    this.componentState.set('initialized');
    this.counter.set(this.initialCounter());

    // Set up auto-increment if enabled
    if (this.autoIncrement()) {
      this.setupAutoIncrement();
    }
  }

  ngAfterViewInit(): void {
    this.componentState.set('view-ready');

    // Set up intersection observer for performance monitoring
    this.setupIntersectionObserver();
  }

  ngAfterContentInit(): void {
    this.componentState.set('content-ready');
  }

  ngOnDestroy(): void {
    this.isDestroyed.set(true);
    this.componentState.set('destroyed');
  }

  constructor() {
    // Modern effect for tracking renders
    effect(() => {
      this.renderCount.update(count => count + 1);
      this.lastUpdateTime.set(new Date());
    });

    // Effect for counter changes
    effect(() => {
      const currentCounter = this.counter();
      this.effectRunCount.update(count => count + 1);
      this.counterChange.emit(currentCounter);

      // Generate items based on counter
      this.generateItems(currentCounter);
    });

    // Effect for state changes
    effect(() => {
      const state = this.componentState();
      this.stateChange.emit(state);
    });

    // Effect for cleanup on destroy
    effect(() => {
      if (this.isDestroyed()) {
        this.cleanup();
      }
    });
  }

  // Public methods
  incrementCounter(): void {
    this.counter.update(current => current + 1);
  }

  toggleVisibility(): void {
    this.isVisible.update(current => !current);
  }

  async triggerAsyncOperation(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add some random items
      const newItems = Array.from({ length: 3 }, (_, i) => ({
        id: crypto.randomUUID(),
        title: `Async Item ${i + 1}`,
        description: `Generated from async operation at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        highlighted: false
      }));

      this.items.update(current => [...current, ...newItems]);

    } finally {
      this.isLoading.set(false);
    }
  }

  selectItem(itemId: string): void {
    this.selectedItemId.set(itemId);
    this.itemSelected.emit(itemId);
  }

  // Private methods
  private generateItems(count: number): void {
    const newItems = Array.from({ length: count }, (_, i) => ({
      id: `item-${i}`,
      title: `Generated Item ${i + 1}`,
      description: `This item was generated when counter reached ${count}`,
      timestamp: new Date(),
      highlighted: false
    }));

    this.items.set(newItems);
  }

  private setupAutoIncrement(): void {
    const interval = setInterval(() => {
      if (!this.isDestroyed()) {
        this.incrementCounter();
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  private setupIntersectionObserver(): void {
    const element = this.containerElement()?.nativeElement;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.componentState.set('visible');
          } else {
            this.componentState.set('hidden');
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    // Cleanup observer on destroy
    effect(() => {
      if (this.isDestroyed()) {
        observer.disconnect();
      }
    });
  }

  private cleanup(): void {
    // Perform any necessary cleanup
    this.items.set([]);
    this.selectedItemId.set(null);
  }
}
