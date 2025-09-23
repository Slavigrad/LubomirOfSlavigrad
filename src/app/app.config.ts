import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { CustomPreloadingStrategy } from './shared/strategies/preloading.strategy';
import { PerformanceService } from './shared/services/performance.service';
import { BundleAnalyzerService } from './shared/services/bundle-analyzer.service';
import { CacheService } from './shared/services/cache.service';
import { ImageOptimizationService } from './shared/services/image-optimization.service';
import { SignalStateService } from './shared/services/signal-state.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(CustomPreloadingStrategy)),
    provideAnimations(),

    // Performance optimization services
    PerformanceService,
    BundleAnalyzerService,
    CacheService,
    ImageOptimizationService,
    CustomPreloadingStrategy,

    // Modern Angular signal-based services
    SignalStateService
  ]
};
