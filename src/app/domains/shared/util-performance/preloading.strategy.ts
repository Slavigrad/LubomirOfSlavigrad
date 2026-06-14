import { Service } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Custom preloading strategy that preloads routes based on priority and network conditions
 */
@Service()
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if route should be preloaded
    if (this.shouldPreload(route)) {
      // Add delay for low priority routes to avoid blocking critical resources
      const delay = this.getPreloadDelay(route);

      return timer(delay).pipe(mergeMap(() => load()));
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
      return (
        connection &&
        (connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g' ||
          connection.saveData === true)
      );
    }
    return false;
  }
}
