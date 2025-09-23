import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Custom preloading strategy that preloads routes based on priority and network conditions
 */
@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if route should be preloaded
    if (this.shouldPreload(route)) {
      // Add delay for low priority routes to avoid blocking critical resources
      const delay = this.getPreloadDelay(route);
      
      return timer(delay).pipe(
        mergeMap(() => {
          console.log(`Preloading route: ${route.path}`);
          return load();
        })
      );
    }
    
    return of(null);
  }

  private shouldPreload(route: Route): boolean {
    // Don't preload if user prefers reduced data usage
    if (this.isSlowConnection()) {
      return false;
    }

    // Check for preload flag in route data
    if (route.data && route.data['preload'] === false) {
      return false;
    }

    // Preload high priority routes immediately
    if (route.data && route.data['priority'] === 'high') {
      return true;
    }

    // Preload other routes with delay
    return true;
  }

  private getPreloadDelay(route: Route): number {
    if (route.data && route.data['priority'] === 'high') {
      return 0; // Immediate preload
    }
    
    if (route.data && route.data['priority'] === 'low') {
      return 5000; // 5 second delay
    }
    
    return 2000; // Default 2 second delay
  }

  private isSlowConnection(): boolean {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection && (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.saveData === true
      );
    }
    return false;
  }
}

/**
 * Network-aware preloading strategy
 */
@Injectable({
  providedIn: 'root'
})
export class NetworkAwarePreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload on fast connections
    if (this.isFastConnection()) {
      return load();
    }
    
    return of(null);
  }

  private isFastConnection(): boolean {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection && (
        connection.effectiveType === '4g' ||
        connection.effectiveType === '3g'
      ) && !connection.saveData;
    }
    
    // Assume fast connection if API not available
    return true;
  }
}

/**
 * Selective preloading strategy based on user interaction
 */
@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  private preloadedRoutes = new Set<string>();
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const routePath = route.path || '';
    
    // Avoid preloading the same route multiple times
    if (this.preloadedRoutes.has(routePath)) {
      return of(null);
    }
    
    // Mark route as preloaded
    this.preloadedRoutes.add(routePath);
    
    // Preload based on route importance
    if (this.isImportantRoute(route)) {
      console.log(`Preloading important route: ${routePath}`);
      return load();
    }
    
    return of(null);
  }

  private isImportantRoute(route: Route): boolean {
    // Define important routes that should be preloaded
    const importantRoutes = ['home', 'cv', 'portfolio'];
    return importantRoutes.includes(route.path || '');
  }

  /**
   * Manually trigger preloading for a specific route
   */
  preloadRoute(routePath: string): void {
    // This could be called when user hovers over navigation links
    console.log(`Manual preload triggered for: ${routePath}`);
  }
}
