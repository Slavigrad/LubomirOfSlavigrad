import { Injectable, signal } from '@angular/core';

export interface ImageOptimizationConfig {
  enableWebP: boolean;
  enableResponsive: boolean;
  enableCompression: boolean;
  quality: number;
  enableLazyLoading: boolean;
  enablePreloading: boolean;
}

export interface ResponsiveImageConfig {
  breakpoints: number[];
  sizes: string[];
  formats: string[];
}

export interface ImageMetrics {
  loadTime: number;
  fileSize: number;
  format: string;
  dimensions: { width: number; height: number };
  compressionRatio?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  private readonly _config = signal<ImageOptimizationConfig>({
    enableWebP: true,
    enableResponsive: true,
    enableCompression: true,
    quality: 85,
    enableLazyLoading: true,
    enablePreloading: false
  });

  private readonly _metrics = signal<Map<string, ImageMetrics>>(new Map());
  private webpSupported?: boolean;

  readonly config = this._config.asReadonly();
  readonly metrics = this._metrics.asReadonly();

  constructor() {
    this.detectWebPSupport();
    this.loadConfiguration();
  }

  /**
   * Generate optimized image URL with format and quality parameters
   */
  getOptimizedImageUrl(
    originalUrl: string, 
    width?: number, 
    height?: number,
    quality?: number
  ): string {
    const config = this._config();
    
    // If WebP is supported and enabled, convert format
    if (config.enableWebP && this.webpSupported) {
      originalUrl = this.convertToWebP(originalUrl);
    }

    // Add compression parameters
    if (config.enableCompression) {
      originalUrl = this.addCompressionParams(originalUrl, quality || config.quality);
    }

    // Add responsive parameters
    if (width || height) {
      originalUrl = this.addDimensionParams(originalUrl, width, height);
    }

    return originalUrl;
  }

  /**
   * Generate responsive image srcset
   */
  generateResponsiveSrcSet(
    baseUrl: string,
    config: ResponsiveImageConfig
  ): string {
    const srcsetEntries: string[] = [];

    config.breakpoints.forEach((width, index) => {
      const optimizedUrl = this.getOptimizedImageUrl(baseUrl, width);
      srcsetEntries.push(`${optimizedUrl} ${width}w`);
    });

    return srcsetEntries.join(', ');
  }

  /**
   * Generate sizes attribute for responsive images
   */
  generateSizesAttribute(config: ResponsiveImageConfig): string {
    return config.sizes.join(', ');
  }

  /**
   * Preload critical images
   */
  preloadImage(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload image: ${url}`));

      document.head.appendChild(link);
    });
  }

  /**
   * Compress image using canvas
   */
  compressImage(
    file: File, 
    quality: number = 0.8,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions
        let { width, height } = img;
        
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Measure image loading performance
   */
  measureImagePerformance(url: string): Promise<ImageMetrics> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const img = new Image();

      img.onload = () => {
        const loadTime = performance.now() - startTime;
        
        const metrics: ImageMetrics = {
          loadTime,
          fileSize: this.estimateFileSize(img),
          format: this.detectImageFormat(url),
          dimensions: {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        };

        // Store metrics
        this._metrics.update(current => {
          const newMap = new Map(current);
          newMap.set(url, metrics);
          return newMap;
        });

        resolve(metrics);
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Get image format recommendations
   */
  getFormatRecommendations(imageType: string, hasTransparency: boolean): string[] {
    const recommendations: string[] = [];

    if (hasTransparency) {
      if (this.webpSupported) {
        recommendations.push('WebP');
      }
      recommendations.push('PNG');
    } else {
      if (this.webpSupported) {
        recommendations.push('WebP');
      }
      recommendations.push('JPEG');
    }

    return recommendations;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ImageOptimizationConfig>): void {
    this._config.update(current => ({ ...current, ...config }));
    this.saveConfiguration();
  }

  private detectWebPSupport(): void {
    if (typeof window === 'undefined') {
      this.webpSupported = false;
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    this.webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private convertToWebP(url: string): string {
    // This would typically be handled by a CDN or image service
    // For now, just replace the extension if it's a common format
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  private addCompressionParams(url: string, quality: number): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}quality=${quality}`;
  }

  private addDimensionParams(url: string, width?: number, height?: number): string {
    const separator = url.includes('?') ? '&' : '?';
    const params: string[] = [];
    
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    
    return params.length > 0 ? `${url}${separator}${params.join('&')}` : url;
  }

  private estimateFileSize(img: HTMLImageElement): number {
    // Rough estimation based on dimensions and format
    const pixels = img.naturalWidth * img.naturalHeight;
    return Math.round(pixels * 0.5); // Rough estimate in bytes
  }

  private detectImageFormat(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  private loadConfiguration(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('image-optimization-config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          this._config.set({ ...this._config(), ...config });
        } catch (error) {
          console.warn('Failed to load image optimization configuration:', error);
        }
      }
    }
  }

  private saveConfiguration(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('image-optimization-config', JSON.stringify(this._config()));
    }
  }
}
