import { Component, input, HostListener, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';


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
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="chapter-nav hidden lg:block">
      <div class="chapter-nav-container">
        <h3 class="chapter-nav-title">Chapters</h3>
    
        <ul class="chapter-nav-list">
          @for (chapter of chapters(); track trackById($index, chapter)) {
            <li class="chapter-nav-item">
              <a
                [attr.href]="hrefFor(chapter.id)"
                (click)="onNavClick($event, chapter.id)"
                [class.active]="activeChapterId() === chapter.id"
                class="chapter-nav-link">
                <span class="chapter-number">{{ chapter.number }}</span>
                <span class="chapter-title">{{ chapter.title }}</span>
              </a>
            </li>
          }
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
      scrollbar-gutter: stable both-edges;
      overscroll-behavior: contain;
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
      width: 100%; /* stable hit area */
      padding: 0.5rem 0.75rem 0.5rem 0.75rem; /* constant padding to avoid layout shift */
      border-radius: 6px;
      text-decoration: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      transition: color 0.15s ease, background 0.15s ease; /* no transform transition */
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
      pointer-events: none; /* ensure bar never blocks clicks */
    }

    .chapter-nav-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.9);
    }

    .chapter-nav-link:hover::before {
      transform: scaleY(1);
    }

    .chapter-nav-link.active {
      background: rgba(139, 92, 246, 0.15);
      color: #fff;
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
  readonly chapters = input<NavigationChapter[]>([]);

  /**
   * Currently active chapter ID
   */
  activeChapterId = signal<string>('');
  private lastActiveId: string = '';
  private scrollTicking = false;
  private readonly HYSTERESIS_PX = 16;
  private isProgrammaticScroll = false;

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Scroll offset for active chapter detection
   * Navbar (72px) + Reading progress bar (4px) + Breathing room (120px) = 196px
   */
  private readonly SCROLL_OFFSET = 196;

  /**
   * Scroll listener to detect which chapter is currently visible
   * Uses the same visual offset as the scroll alignment to avoid flicker
   */
  @HostListener('window:scroll')
  onScroll(): void {
    // Ignore scroll events during programmatic navigation to prevent race conditions
    if (this.isProgrammaticScroll) return;

    if (this.scrollTicking) return;
    this.scrollTicking = true;
    requestAnimationFrame(() => {
      this.updateActiveChapter();
      this.scrollTicking = false;
    });
  }

  private updateActiveChapter(): void {
    const offset = this.SCROLL_OFFSET;
    const chaptersValue = this.chapters();
    let candidateId = chaptersValue[0]?.id ?? '';

    for (let i = 0; i < chaptersValue.length; i++) {
      const chapter = chaptersValue[i];
      const el = document.getElementById(chapter.id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top - offset <= 10) {
        candidateId = chapter.id;
      } else {
        break;
      }
    }

    // Hysteresis: avoid switching if we are too close to the threshold
    if (candidateId !== this.lastActiveId) {
      const el = document.getElementById(candidateId);
      if (el) {
        const distance = Math.abs(el.getBoundingClientRect().top - offset);
        if (distance < this.HYSTERESIS_PX) {
          candidateId = this.lastActiveId || candidateId;
        }
      }
    }

    if (candidateId && candidateId !== this.activeChapterId()) {
      this.activeChapterId.set(candidateId);
      this.lastActiveId = candidateId;
    }
  }
  /**
   * Stable trackBy to prevent re-creation of list items during change detection
   */
  trackById(index: number, item: NavigationChapter): string { return item.id; }


  /**
   * Compute a stable href that preserves the current route path, e.g.
   * /egypt-story#chapter-3 (so hover shows the correct URL)
   */
  hrefFor(chapterId: string): string {
    const path = (typeof window !== 'undefined' ? window.location.pathname : '') || '';
    return `${path}#${chapterId}`;
  }

  /**
   * Handle navigation click: prevent default jump, smooth scroll, and update URL
   * Keeps the current route (e.g. /egypt-story#chapter-3) to avoid router resets
   */
  onNavClick(event: Event, chapterId: string): void {
    event.preventDefault();
    const el = document.getElementById(chapterId);
    if (!el) return;

    // Update the active highlight immediately to the clicked chapter
    this.activeChapterId.set(chapterId);
    this.lastActiveId = chapterId;

    // Manually trigger change detection to update the UI immediately
    // This is necessary because we use OnPush change detection strategy
    this.cdr.markForCheck();

    // Disable scroll listener during programmatic navigation to prevent race conditions
    // where the scroll listener might detect an intermediate chapter during smooth scrolling
    this.isProgrammaticScroll = true;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Re-enable scroll listener after smooth scroll completes
    // Smooth scroll typically takes 300-500ms, we wait a bit longer to be safe
    setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 1000);

    // Update the URL to include current path + fragment (no navigation)
    try {
      const path = (typeof window !== 'undefined' ? window.location.pathname : '') || '';
      window.history.replaceState(null, '', `${path}#${chapterId}`);
    } catch {}
  }
}

