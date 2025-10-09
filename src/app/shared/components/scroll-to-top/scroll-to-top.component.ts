import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Scroll to Top Button Component
 * 
 * A floating button that appears when user scrolls down,
 * and smoothly scrolls back to top when clicked.
 * 
 * Features:
 * - Auto-show/hide based on scroll position
 * - Smooth scroll animation
 * - Hover effects
 * - Accessible with keyboard
 */
@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      *ngIf="isVisible()"
      (click)="scrollToTop()"
      class="scroll-to-top-button"
      aria-label="Scroll to top"
      title="Back to top">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
      </svg>
    </button>
  `,
  styles: [`
    .scroll-to-top-button {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      background: linear-gradient(135deg,
        hsl(var(--primary)) 0%,
        hsl(var(--secondary)) 100%);
      color: white;
      border: 2px solid hsl(var(--border) / 0.3);
      cursor: pointer;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 20px hsl(var(--primary) / 0.3);
      animation: fadeInUp 0.3s ease-out;
    }

    .scroll-to-top-button:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 8px 30px hsl(var(--primary) / 0.5);
    }

    .scroll-to-top-button:active {
      transform: translateY(-2px) scale(1.02);
    }

    .scroll-to-top-button svg {
      animation: bounce 2s infinite;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .scroll-to-top-button {
        bottom: 1.5rem;
        right: 1.5rem;
        width: 3rem;
        height: 3rem;
      }
    }
  `]
})
export class ScrollToTopComponent {
  /**
   * Whether the button should be visible
   * Shows after scrolling down 300px
   */
  isVisible = signal(false);

  /**
   * Threshold in pixels before showing the button
   */
  private readonly SCROLL_THRESHOLD = 300;

  /**
   * Listen to scroll events and show/hide button
   */
  @HostListener('window:scroll')
  onScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isVisible.set(scrollTop > this.SCROLL_THRESHOLD);
  }

  /**
   * Scroll smoothly to the top of the page
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

