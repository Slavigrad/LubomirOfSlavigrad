import { Component, Input, HostListener, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Chapter Navigation Component
 * 
 * A sticky sidebar that shows all chapters and highlights the current one
 * as the user scrolls through the content.
 * 
 * Features:
 * - Sticky positioning
 * - Auto-highlights current chapter
 * - Smooth scroll to chapter on click
 * - Responsive (hides on mobile)
 * - Beautiful hover effects
 */

export interface NavigationChapter {
  id: string;
  title: string;
  number: number;
}

@Component({
  selector: 'app-chapter-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="chapter-nav hidden lg:block">
      <div class="chapter-nav-container">
        <h3 class="chapter-nav-title">Chapters</h3>
        
        <ul class="chapter-nav-list">
          <li *ngFor="let chapter of chapters" class="chapter-nav-item">
            <a
              [href]="'#' + chapter.id"
              (click)="scrollToChapter($event, chapter.id)"
              [class.active]="activeChapterId() === chapter.id"
              class="chapter-nav-link">
              <span class="chapter-number">{{ chapter.number }}</span>
              <span class="chapter-title">{{ chapter.title }}</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .chapter-nav {
      position: fixed;
      right: 2rem;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      max-height: 80vh;
      overflow-y: auto;
    }

    .chapter-nav-container {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem 1rem;
      min-width: 200px;
      max-width: 250px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .chapter-nav-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
      padding-left: 0.5rem;
    }

    .chapter-nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .chapter-nav-item {
      position: relative;
    }

    .chapter-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 6px;
      text-decoration: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      transition: all 0.2s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .chapter-nav-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, #8b5cf6, #ec4899);
      transform: scaleY(0);
      transition: transform 0.2s ease;
    }

    .chapter-nav-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.9);
      padding-left: 0.75rem;
    }

    .chapter-nav-link:hover::before {
      transform: scaleY(1);
    }

    .chapter-nav-link.active {
      background: rgba(139, 92, 246, 0.15);
      color: #fff;
      padding-left: 0.75rem;
    }

    .chapter-nav-link.active::before {
      transform: scaleY(1);
    }

    .chapter-nav-link.active .chapter-number {
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      color: white;
    }

    .chapter-number {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .chapter-title {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    /* Custom scrollbar */
    .chapter-nav::-webkit-scrollbar {
      width: 4px;
    }

    .chapter-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .chapter-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }

    .chapter-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Hide on smaller screens */
    @media (max-width: 1024px) {
      .chapter-nav {
        display: none;
      }
    }
  `]
})
export class ChapterNavigationComponent {
  @Input() chapters: NavigationChapter[] = [];

  /**
   * Currently active chapter ID
   */
  activeChapterId = signal<string>('');

  /**
   * Scroll listener to detect which chapter is currently visible
   */
  @HostListener('window:scroll')
  onScroll(): void {
    // Find which chapter is currently in view
    const scrollPosition = window.scrollY + 200; // Offset for better UX

    for (let i = this.chapters.length - 1; i >= 0; i--) {
      const chapter = this.chapters[i];
      const element = document.getElementById(chapter.id);
      
      if (element) {
        const elementTop = element.offsetTop;
        
        if (scrollPosition >= elementTop) {
          this.activeChapterId.set(chapter.id);
          break;
        }
      }
    }
  }

  /**
   * Smooth scroll to a specific chapter
   */
  scrollToChapter(event: Event, chapterId: string): void {
    event.preventDefault();
    
    const element = document.getElementById(chapterId);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }
}

