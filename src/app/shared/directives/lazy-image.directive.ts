import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy, 
  Renderer2,
  signal,
  effect
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
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() appLazyImage!: string; // Image source URL
  @Input() lazyPlaceholder?: string;
  @Input() lazyErrorImage?: string;
  @Input() lazyThreshold: number = 0.1;
  @Input() lazyRootMargin: string = '50px';
  @Input() lazyEnableBlur: boolean = true;
  @Input() lazyEnableFadeIn: boolean = true;
  @Input() lazyRetryAttempts: number = 3;

  private observer?: IntersectionObserver;
  private isLoaded = signal(false);
  private isError = signal(false);
  private retryCount = 0;

  constructor(
    private elementRef: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {
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
    if (this.lazyEnableBlur) {
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
        threshold: this.lazyThreshold,
        rootMargin: this.lazyRootMargin
      }
    );

    this.observer.observe(img);
  }

  private setPlaceholder(): void {
    const img = this.elementRef.nativeElement;
    
    if (this.lazyPlaceholder) {
      this.renderer.setAttribute(img, 'src', this.lazyPlaceholder);
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

    // Set up load handlers
    actualImage.onload = () => {
      this.renderer.setAttribute(img, 'src', this.appLazyImage);
      this.isLoaded.set(true);
    };

    actualImage.onerror = () => {
      this.handleImageError();
    };

    // Start loading
    actualImage.src = this.appLazyImage;
  }

  private handleImageError(): void {
    if (this.retryCount < this.lazyRetryAttempts) {
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
    if (this.lazyEnableBlur) {
      this.renderer.setStyle(img, 'filter', 'none');
    }

    // Apply fade-in effect
    if (this.lazyEnableFadeIn) {
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
    
    if (this.lazyErrorImage) {
      this.renderer.setAttribute(img, 'src', this.lazyErrorImage);
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
  selector: '[appLazyBackground]',
  standalone: true
})
export class LazyBackgroundDirective implements OnInit, OnDestroy {
  @Input() appLazyBackground!: string;
  @Input() lazyThreshold: number = 0.1;
  @Input() lazyRootMargin: string = '50px';

  private observer?: IntersectionObserver;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

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
        threshold: this.lazyThreshold,
        rootMargin: this.lazyRootMargin
      }
    );

    this.observer.observe(element);
  }

  private loadBackgroundImage(): void {
    const element = this.elementRef.nativeElement;
    const img = new Image();

    img.onload = () => {
      this.renderer.setStyle(
        element, 
        'background-image', 
        `url(${this.appLazyBackground})`
      );
      this.renderer.addClass(element, 'lazy-bg-loaded');
    };

    img.src = this.appLazyBackground;
  }
}
