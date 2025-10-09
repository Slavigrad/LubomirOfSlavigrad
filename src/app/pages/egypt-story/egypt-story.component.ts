import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EGYPT_STORY, Story } from '../../data/egypt-story-data';

@Component({
  selector: 'app-egypt-story',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen relative">
      <!-- Hero Section -->
      <section class="relative py-20 px-6">
        <div class="container mx-auto max-w-4xl">
          <!-- Back Button -->
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors group"
          >
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Return to the Citadel</span>
          </a>

          <!-- Title -->
          <div class="text-center mb-16">
            <h1 class="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              {{ story.title }}
            </h1>

            <!-- Subtitle (if present) -->
            <p *ngIf="story.subtitle" class="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
              {{ story.subtitle }}
            </p>

            <div class="flex items-center justify-center gap-4 text-muted-foreground text-sm">
              <ng-container *ngFor="let meta of story.metadata; let i = index">
                <span *ngIf="i > 0" class="text-border">•</span>
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="meta.icon"></path>
                  </svg>
                  {{ meta.text }}
                </span>
              </ng-container>
            </div>
          </div>

          <!-- Story Content -->
          <div class="glass-card p-8 md:p-12 rounded-2xl border border-border/20 space-y-8">
            <!-- Introduction -->
            <div class="prose prose-invert max-w-none">
              <p class="text-lg text-foreground/90 leading-relaxed">
                {{ story.introduction }}
              </p>
            </div>

            <!-- Chapters (Dynamic) -->
            <div *ngFor="let chapter of story.chapters" class="space-y-6">
              <!-- Chapter Title -->
              <h2 class="text-2xl md:text-3xl font-bold flex items-center gap-3"
                  [ngClass]="{
                    'text-primary': chapter.theme === 'primary',
                    'text-secondary': chapter.theme === 'secondary',
                    'text-accent': chapter.theme === 'accent',
                    'text-primary': !chapter.theme
                  }">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      [ngClass]="{
                        'bg-primary/20': chapter.theme === 'primary' || !chapter.theme,
                        'bg-secondary/20': chapter.theme === 'secondary',
                        'bg-accent/20': chapter.theme === 'accent'
                      }">
                  {{ chapter.number }}
                </span>
                {{ chapter.title }}
              </h2>

              <!-- Chapter Sections -->
              <div *ngFor="let section of chapter.sections" class="space-y-3">
                <!-- Section Title (if present) -->
                <h3 *ngIf="section.title" class="text-xl font-semibold text-foreground/90 mt-6">
                  {{ section.title }}
                </h3>

                <!-- Section Paragraphs -->
                <p *ngFor="let paragraph of section.paragraphs" class="text-foreground/80 leading-relaxed">
                  {{ paragraph }}
                </p>
              </div>
            </div>

            <!-- Closing Quote (if present) -->
            <div *ngIf="story.closingQuote" class="mt-12 pt-8 border-t border-border/20">
              <blockquote class="text-center italic text-lg text-muted-foreground">
                "{{ story.closingQuote.text }}"
                <footer class="text-sm mt-2 not-italic">— {{ story.closingQuote.author }}</footer>
              </blockquote>
            </div>

            <!-- Author Info (if present) -->
            <div *ngIf="story.author" class="mt-8 pt-8 border-t border-border/20 text-center">
              <p class="text-muted-foreground mb-4">Written by <span class="text-foreground font-semibold">{{ story.author.name }}</span></p>
              <div *ngIf="story.author.links" class="flex items-center justify-center gap-4">
                <a *ngIf="story.author.links.linkedin" [href]="story.author.links.linkedin" target="_blank" rel="noopener noreferrer"
                   class="text-muted-foreground hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a *ngIf="story.author.links.website" [href]="story.author.links.website" target="_blank" rel="noopener noreferrer"
                   class="text-muted-foreground hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                </a>
                <a *ngIf="story.author.links.instagram" [href]="story.author.links.instagram" target="_blank" rel="noopener noreferrer"
                   class="text-muted-foreground hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a *ngIf="story.author.links.twitter" [href]="story.author.links.twitter" target="_blank" rel="noopener noreferrer"
                   class="text-muted-foreground hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Navigation Footer -->
          <div class="mt-12 text-center">
            <a 
              routerLink="/" 
              class="inline-flex items-center gap-2 px-8 py-3 rounded-lg glass-card border border-border/20 hover:border-primary/50 transition-all hover:scale-105 active:scale-95"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span class="font-semibold">Return Home</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .gradient-text {
      background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

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
  `]
})
export class EgyptStoryComponent {
  /**
   * Story data loaded from the data file
   * This component uses a data-driven architecture where all content
   * is separated from presentation logic for easy maintenance
   */
  protected readonly story: Story = EGYPT_STORY;
}

