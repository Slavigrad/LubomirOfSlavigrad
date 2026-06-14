import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { CustomPreloadingStrategy } from './domains/shared/util-performance/preloading.strategy';
import { ImageOptimizationService } from './domains/shared/util-performance/image-optimization.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(CustomPreloadingStrategy)),
    provideAnimations(),

    // Performance optimization services
    ImageOptimizationService,
    CustomPreloadingStrategy,
  ],
};
