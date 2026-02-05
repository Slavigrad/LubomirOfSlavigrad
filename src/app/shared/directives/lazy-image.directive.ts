import {
  Directive,
  ElementRef,
  input,
  OnInit,
  OnDestroy,
  Renderer2,
  signal,
  effect,
  inject
} from '@angular/core';

export interface LazyImageConfig {
  placeholder?: string;
  errorImage?: string;
  threshold?: number;
  rootMargin?: string;
  enableBlur?: boolean;
  enableFadeIn?: boolean;
  retryAttempts?: number;
}

@Directive({
  selector: '[appLazyImage]'
})
export class LazyImageDirective implements OnInit, OnDestroy {
  readonly appLazyImage = input.required<string>(); // Image source URL
  readonly lazyPlaceholder = input<string | undefined>();
  readonly lazyErrorImage = input<string | undefined>();
  readonly lazyThreshold = input<number>(0.1);
  readonly lazyRootMargin = input<string>('50px');
  readonly lazyEnableBlur = input<boolean>(true);
  readonly lazyEnableFadeIn = input<boolean>(true);
  readonly lazyRetryAttempts = input<number>(3);

  private observer?: IntersectionObserver;
  private isLoaded = signal(false);
  private isError = signal(false);
  private retryCount = 0;

  private readonly elementRef = inject(ElementRef<HTMLImageElement>);
  private readonly renderer = inject(Renderer2);

  constructor() {
    // Apply loading effects
    effect(() => {
      if (this.isLoaded()) {
        this.applyLoadedState();
      }
    });

    effect(() => {
      if (this.isError()) {
        this.applyErrorState();
      }
    });
  }

  ngOnInit(): void {
    this.setupLazyLoading();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupLazyLoading(): void {
    const img = this.elementRef.nativeElement;

    // Set initial placeholder
    this.setPlaceholder();

    // Apply initial blur effect
    if (this.lazyEnableBlur()) {
      this.renderer.setStyle(img, 'filter', 'blur(5px)');
      this.renderer.setStyle(img, 'transition', 'filter 0.3s ease, opacity 0.3s ease');
    }

    // Set up intersection observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(img);
          }
        });
      },
      {
        threshold: this.lazyThreshold(),
        rootMargin: this.lazyRootMargin()
      }
    );

    this.observer.observe(img);
  }

  private setPlaceholder(): void {
    const img = this.elementRef.nativeElement;
    const placeholderValue = this.lazyPlaceholder();

    if (placeholderValue) {
      this.renderer.setAttribute(img, 'src', placeholderValue);
    } else {
      // Generate a simple placeholder
      const placeholder = this.generatePlaceholder();
      this.renderer.setAttribute(img, 'src', placeholder);
    }

    // Add loading class
    this.renderer.addClass(img, 'lazy-loading');
  }

  private generatePlaceholder(): string {
    // Create a simple SVG placeholder
    const width = this.elementRef.nativeElement.width || 300;
    const height = this.elementRef.nativeElement.height || 200;
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui">
          Loading...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private loadImage(): void {
    const img = this.elementRef.nativeElement;
    const actualImage = new Image();
    const imageUrl = this.appLazyImage();

    // Set up load handlers
    actualImage.onload = () => {
      this.renderer.setAttribute(img, 'src', imageUrl);
      this.isLoaded.set(true);
    };

    actualImage.onerror = () => {
      this.handleImageError();
    };

    // Start loading
    actualImage.src = imageUrl;
  }

  private handleImageError(): void {
    if (this.retryCount < this.lazyRetryAttempts()) {
      this.retryCount++;
      setTimeout(() => {
        this.loadImage();
      }, 1000 * this.retryCount); // Exponential backoff
    } else {
      this.isError.set(true);
    }
  }

  private applyLoadedState(): void {
    const img = this.elementRef.nativeElement;

    // Remove blur effect
    if (this.lazyEnableBlur()) {
      this.renderer.setStyle(img, 'filter', 'none');
    }

    // Apply fade-in effect
    if (this.lazyEnableFadeIn()) {
      this.renderer.setStyle(img, 'opacity', '0');
      setTimeout(() => {
        this.renderer.setStyle(img, 'opacity', '1');
      }, 50);
    }

    // Update classes
    this.renderer.removeClass(img, 'lazy-loading');
    this.renderer.addClass(img, 'lazy-loaded');
  }

  private applyErrorState(): void {
    const img = this.elementRef.nativeElement;
    const errorImageValue = this.lazyErrorImage();

    if (errorImageValue) {
      this.renderer.setAttribute(img, 'src', errorImageValue);
    } else {
      // Generate error placeholder
      const errorPlaceholder = this.generateErrorPlaceholder();
      this.renderer.setAttribute(img, 'src', errorPlaceholder);
    }

    // Update classes
    this.renderer.removeClass(img, 'lazy-loading');
    this.renderer.addClass(img, 'lazy-error');
  }

  private generateErrorPlaceholder(): string {
    const width = this.elementRef.nativeElement.width || 300;
    const height = this.elementRef.nativeElement.height || 200;
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fef2f2"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#ef4444" font-family="system-ui">
          Failed to load
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

/**
 * Lazy loading directive for background images
 */
@Directive({
  selector: '[appLazyBackground]'
})
export class LazyBackgroundDirective implements OnInit, OnDestroy {
  readonly appLazyBackground = input.required<string>();
  readonly lazyThreshold = input<number>(0.1);
  readonly lazyRootMargin = input<string>('50px');

  private observer?: IntersectionObserver;

  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    this.setupLazyLoading();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupLazyLoading(): void {
    const element = this.elementRef.nativeElement;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadBackgroundImage();
            this.observer?.unobserve(element);
          }
        });
      },
      {
        threshold: this.lazyThreshold(),
        rootMargin: this.lazyRootMargin()
      }
    );

    this.observer.observe(element);
  }

  private loadBackgroundImage(): void {
    const element = this.elementRef.nativeElement;
    const img = new Image();
    const bgUrl = this.appLazyBackground();

    img.onload = () => {
      this.renderer.setStyle(
        element,
        'background-image',
        `url(${bgUrl})`
      );
      this.renderer.addClass(element, 'lazy-bg-loaded');
    };

    img.src = bgUrl;
  }
}
