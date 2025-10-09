import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EGYPT_STORY, Story } from '../../data/egypt-story-data';
import { ScrollAnimateDirective, InteractiveAnimateDirective } from '../../shared/utils/animations';
import { ReadingProgressComponent } from '../../shared/components/reading-progress/reading-progress.component';
import { ScrollToTopComponent } from '../../shared/components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-egypt-story',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ScrollAnimateDirective,
    InteractiveAnimateDirective,
    ReadingProgressComponent,
    ScrollToTopComponent
  ],
  template: `
    <!-- Reading Progress Bar -->
    <app-reading-progress></app-reading-progress>

    <!-- Scroll to Top Button -->
    <app-scroll-to-top></app-scroll-to-top>

    <div class="min-h-screen relative overflow-hidden">
      <!-- Ambient Background Effects -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <!-- Animated gradient orbs -->
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float-delay"></div>
        <div class="absolute top-1/2 left-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-glow"></div>

        <!-- Desert sand particles effect -->
        <div class="absolute inset-0 opacity-20">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
          <div class="particle particle-5"></div>
        </div>
      </div>

      <div class="min-h-screen relative z-10">
      <!-- Hero Section -->
      <section class="relative py-20 px-6">
        <div class="container mx-auto max-w-4xl">
          <!-- Back Button -->
          <a
            routerLink="/"
            appInteractiveAnimate="lift"
            class="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-all duration-300 group"
          >
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Return to the Citadel</span>
          </a>

          <!-- Title -->
          <div class="text-center mb-16 animate-fade-in-up">
            <h1 class="text-5xl md:text-7xl font-bold mb-8 gradient-text-enhanced tracking-tight py-2">
              {{ story.title }}
            </h1>

            <!-- Decorative divider -->
            <div class="flex items-center justify-center gap-4 mb-8">
              <div class="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <svg class="w-6 h-6 text-primary animate-pulse-glow" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <div class="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>

            <!-- Subtitle (if present) -->
            <p *ngIf="story.subtitle"
               class="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-light italic animate-fade-in-up"
               style="animation-delay: 0.3s">
              {{ story.subtitle }}
            </p>

            <div class="flex flex-wrap items-center justify-center gap-4 text-muted-foreground text-sm animate-fade-in-up"
                 style="animation-delay: 0.6s">
              <ng-container *ngFor="let meta of story.metadata; let i = index">
                <span *ngIf="i > 0" class="text-border">•</span>
                <span class="flex items-center gap-2 hover:text-primary transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="meta.icon"></path>
                  </svg>
                  {{ meta.text }}
                </span>
              </ng-container>
            </div>
          </div>

          <!-- Story Content -->
          <div class="glass-card-enhanced p-8 md:p-12 rounded-3xl border border-border/30 space-y-12 relative overflow-hidden animate-fade-in-up"
               style="animation-delay: 0.9s">
            <!-- Enhanced glass overlay -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
            <div class="absolute inset-0 backdrop-blur-xl pointer-events-none"></div>

            <!-- Content wrapper -->
            <div class="relative z-10">
              <!-- Introduction -->
              <div class="prose prose-invert max-w-none mb-16 space-y-6">
                <!-- Split introduction into paragraphs -->
                <p *ngFor="let paragraph of getIntroductionParagraphs(); let i = index"
                   class="text-lg md:text-xl text-foreground/90 leading-relaxed"
                   [ngClass]="{'first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-none': i === 0}">
                  {{ paragraph }}
                </p>
              </div>

              <!-- Decorative separator -->
              <div class="flex items-center justify-center gap-4 mb-16">
                <div class="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div class="flex gap-2">
                  <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <div class="w-2 h-2 rounded-full bg-secondary animate-pulse" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 rounded-full bg-accent animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
                <div class="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              <!-- Chapters (Dynamic) -->
              <div *ngFor="let chapter of story.chapters; let chapterIndex = index"
                   class="chapter-container space-y-8 mb-20 last:mb-0">

                <!-- Chapter Header Card -->
                <div class="chapter-header relative group">
                  <!-- Animated gradient border -->
                  <div class="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       [ngClass]="{
                         'bg-gradient-to-r from-primary via-primary to-primary': chapter.theme === 'primary' || !chapter.theme,
                         'bg-gradient-to-r from-secondary via-secondary to-secondary': chapter.theme === 'secondary',
                         'bg-gradient-to-r from-accent via-accent to-accent': chapter.theme === 'accent'
                       }"></div>

                  <!-- Chapter Title -->
                  <div class="relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
                    <h2 class="text-3xl md:text-4xl font-bold flex items-center gap-4 group-hover:scale-[1.02] transition-transform duration-300"
                        [ngClass]="{
                          'text-primary': chapter.theme === 'primary' || !chapter.theme,
                          'text-secondary': chapter.theme === 'secondary',
                          'text-accent': chapter.theme === 'accent'
                        }">
                      <!-- Chapter number badge -->
                      <span class="chapter-number w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg text-white"
                            [ngClass]="{
                              'bg-gradient-to-br from-primary to-primary': chapter.theme === 'primary' || !chapter.theme,
                              'bg-gradient-to-br from-secondary to-secondary': chapter.theme === 'secondary',
                              'bg-gradient-to-br from-accent to-accent': chapter.theme === 'accent'
                            }">
                        {{ chapter.number }}
                      </span>
                      <span class="flex-1">{{ chapter.title }}</span>

                      <!-- Decorative icon -->
                      <svg class="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                    </h2>
                  </div>
                </div>

                <!-- Chapter Sections -->
                <div class="chapter-content space-y-8 pl-0 md:pl-8">
                  <div *ngFor="let section of chapter.sections; let sectionIndex = index"
                       class="section-container space-y-4">

                    <!-- Section Title (if present) -->
                    <h3 *ngIf="section.title"
                        class="text-xl md:text-2xl font-semibold text-foreground/90 mt-8 mb-4 flex items-center gap-3">
                      <span class="w-1 h-6 rounded-full"
                            [ngClass]="{
                              'bg-primary': chapter.theme === 'primary' || !chapter.theme,
                              'bg-secondary': chapter.theme === 'secondary',
                              'bg-accent': chapter.theme === 'accent'
                            }"></span>
                      {{ section.title }}
                    </h3>

                    <!-- Section Paragraphs -->
                    <div class="space-y-4">
                      <p *ngFor="let paragraph of section.paragraphs; let paragraphIndex = index"
                         class="text-base md:text-lg text-foreground/85 leading-relaxed hover:text-foreground/95 transition-colors paragraph-text">
                        {{ paragraph }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Chapter Separator (not for last chapter) -->
                <div *ngIf="chapterIndex < story.chapters.length - 1"
                     class="chapter-separator mt-16 mb-8">
                  <div class="flex items-center justify-center gap-4">
                    <div class="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>
                    <div class="flex gap-2">
                      <div class="w-1.5 h-1.5 rounded-full"
                           [ngClass]="{
                             'bg-primary': chapter.theme === 'primary' || !chapter.theme,
                             'bg-secondary': chapter.theme === 'secondary',
                             'bg-accent': chapter.theme === 'accent'
                           }"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-border"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-border"></div>
                    </div>
                    <div class="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>
                  </div>
                </div>
              </div>

              <!-- Closing Quote (if present) -->
              <div *ngIf="story.closingQuote"
                   class="mt-16 pt-12 border-t border-border/20">
                <blockquote class="text-center italic text-xl md:text-2xl text-muted-foreground relative">
                  <svg class="w-12 h-12 text-primary/20 absolute -top-6 left-1/2 -translate-x-1/2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                  </svg>
                  <p class="relative z-10">"{{ story.closingQuote.text }}"</p>
                  <footer class="text-base mt-4 not-italic text-foreground/70">— {{ story.closingQuote.author }}</footer>
                </blockquote>
              </div>

              <!-- Author Info (if present) -->
              <div *ngIf="story.author"
                   class="mt-12 pt-12 border-t border-border/20 text-center">
                <p class="text-lg text-muted-foreground mb-6">
                  Written by <span class="text-foreground font-semibold text-xl gradient-text-enhanced">{{ story.author.name }}</span>
                </p>
                <div *ngIf="story.author.links" class="flex items-center justify-center gap-6">
                  <a *ngIf="story.author.links.linkedin"
                     [href]="story.author.links.linkedin"
                     target="_blank"
                     rel="noopener noreferrer"
                     appInteractiveAnimate="lift"
                     class="text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-110">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a *ngIf="story.author.links.website"
                     [href]="story.author.links.website"
                     target="_blank"
                     rel="noopener noreferrer"
                     appInteractiveAnimate="lift"
                     class="text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-110">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                    </svg>
                  </a>
                  <a *ngIf="story.author.links.instagram"
                     [href]="story.author.links.instagram"
                     target="_blank"
                     rel="noopener noreferrer"
                     appInteractiveAnimate="lift"
                     class="text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-110">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a *ngIf="story.author.links.twitter"
                     [href]="story.author.links.twitter"
                     target="_blank"
                     rel="noopener noreferrer"
                     appInteractiveAnimate="lift"
                     class="text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-110">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Footer -->
          <div class="mt-16 text-center">
            <a
              routerLink="/"
              appInteractiveAnimate="lift"
              class="inline-flex items-center gap-3 px-10 py-4 rounded-xl glass-card-enhanced border border-border/30 hover:border-primary/50 transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <svg class="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span class="font-semibold text-lg">Return Home</span>
            </a>
          </div>
        </div>
      </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Fade In Up Animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in-up {
      animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }

    /* Enhanced Gradient Text */
    .gradient-text-enhanced {
      background: linear-gradient(135deg,
        hsl(var(--primary)) 0%,
        hsl(var(--primary-glow)) 25%,
        hsl(var(--secondary)) 50%,
        hsl(var(--secondary-glow)) 75%,
        hsl(var(--accent)) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      background-size: 200% 200%;
      animation: gradient-shift 8s ease infinite;
      line-height: 1.2;
      padding: 0.1em 0;
      display: inline-block;
    }

    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    /* Enhanced Glass Card */
    .glass-card-enhanced {
      background: linear-gradient(135deg,
        hsl(var(--card-glass)) 0%,
        hsl(var(--card)) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow:
        0 8px 32px 0 rgba(0, 0, 0, 0.37),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
    }

    /* Floating Particles */
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: hsl(var(--primary));
      border-radius: 50%;
      opacity: 0.3;
      animation: float-particle 20s infinite;
    }

    .particle-1 {
      top: 20%;
      left: 10%;
      animation-delay: 0s;
      animation-duration: 25s;
    }

    .particle-2 {
      top: 60%;
      left: 80%;
      animation-delay: 5s;
      animation-duration: 30s;
    }

    .particle-3 {
      top: 40%;
      left: 50%;
      animation-delay: 10s;
      animation-duration: 20s;
      background: hsl(var(--secondary));
    }

    .particle-4 {
      top: 80%;
      left: 30%;
      animation-delay: 15s;
      animation-duration: 35s;
      background: hsl(var(--accent));
    }

    .particle-5 {
      top: 10%;
      left: 70%;
      animation-delay: 20s;
      animation-duration: 28s;
    }

    @keyframes float-particle {
      0%, 100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.3;
      }
      25% {
        transform: translate(100px, -100px) scale(1.5);
        opacity: 0.6;
      }
      50% {
        transform: translate(200px, 50px) scale(1);
        opacity: 0.3;
      }
      75% {
        transform: translate(50px, 150px) scale(1.2);
        opacity: 0.5;
      }
    }

    /* Chapter Container Enhancements */
    .chapter-container {
      position: relative;
    }

    .chapter-header {
      position: relative;
      margin-bottom: 2rem;
    }

    .chapter-number {
      position: relative;
      overflow: hidden;
    }

    .chapter-number::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s;
    }

    .chapter-header:hover .chapter-number::before {
      left: 100%;
    }

    /* Typography Enhancements */
    .paragraph-text {
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      hyphens: auto;
      word-spacing: 0.05em;
      letter-spacing: 0.01em;
    }

    /* Prose Styles */
    .prose {
      color: hsl(var(--foreground));
    }

    .prose p {
      margin-bottom: 1rem;
    }

    .prose blockquote {
      border-left: 4px solid hsl(var(--primary));
      padding-left: 1.5rem;
      margin: 2rem 0;
    }

    /* Section Transitions */
    .section-container {
      transition: all 0.3s ease;
    }

    .section-container:hover {
      transform: translateX(4px);
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
      .gradient-text-enhanced {
        font-size: 2.5rem;
      }

      .chapter-header h2 {
        font-size: 1.75rem;
      }

      .glass-card-enhanced {
        padding: 1.5rem;
      }
    }

    /* Accessibility: Respect reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .particle {
        display: none;
      }
    }

    /* Print Styles */
    @media print {
      .particle,
      .ambient-background,
      [appScrollAnimate],
      [appInteractiveAnimate] {
        display: none !important;
      }

      .glass-card-enhanced {
        background: white;
        border: 1px solid #ccc;
      }

      .chapter-header {
        page-break-after: avoid;
      }

      .section-container {
        page-break-inside: avoid;
      }
    }
  `]
})
export class EgyptStoryComponent {
  /**
   * Story data loaded from the data file
   * This component uses a data-driven architecture where all content
   * is separated from presentation logic for easy maintenance
   */
  protected readonly story: Story = EGYPT_STORY;

  constructor() {
    console.log('Egypt Story Component initialized');
    console.log('Story title:', this.story.title);
    console.log('Number of chapters:', this.story.chapters?.length);
    console.log('First chapter:', this.story.chapters?.[0]);
  }

  /**
   * Split introduction text into paragraphs
   * The introduction contains line breaks that should be rendered as separate paragraphs
   */
  protected getIntroductionParagraphs(): string[] {
    return this.story.introduction
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }
}

