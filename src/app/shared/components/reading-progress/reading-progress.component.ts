import { Component, HostListener, signal } from '@angular/core';


/**
 * Reading Progress Bar Component
 * 
 * Displays a progress bar at the top of the page showing how far
 * the user has scrolled through the content.
 * 
 * Features:
 * - Smooth animation
 * - Gradient color that matches theme
 * - Auto-calculates scroll percentage
 * - Fixed at top of viewport
 */
@Component({
  selector: 'app-reading-progress',
  standalone: true,
  imports: [],
  template: `
    <div class="reading-progress-container">
      <div 
        class="reading-progress-bar"
        [style.width.%]="scrollProgress()">
      </div>
    </div>
  `,
  styles: [`
    .reading-progress-container {
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      z-index: 10000;
      overflow: visible;
      pointer-events: none;
    }

    .reading-progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg,
        #8b5cf6 0%,
        #ec4899 50%,
        #10b981 100%);
      transition: width 0.15s ease-out;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.8),
                  0 0 40px rgba(236, 72, 153, 0.6),
                  0 2px 10px rgba(139, 92, 246, 0.5);
    }
  `]
})
export class ReadingProgressComponent {
  /**
   * Current scroll progress as a percentage (0-100)
   */
  scrollProgress = signal(0);

  /**
   * Listen to scroll events and update progress
   */
  @HostListener('window:scroll')
  onScroll(): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Calculate how far through the document we've scrolled
    const scrollableHeight = documentHeight - windowHeight;
    const progress = scrollableHeight > 0
      ? (scrollTop / scrollableHeight) * 100
      : 0;

    this.scrollProgress.set(Math.min(100, Math.max(0, progress)));
  }
}

