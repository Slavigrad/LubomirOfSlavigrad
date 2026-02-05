import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvDataService } from '../../services/cv-data.service';
import { ThemeService } from '../../services/theme.service';

import { LazyImageDirective } from '../../shared/directives/lazy-image.directive';

import { UI_TEXT } from './hero.constants';
import { HERO_CONFIG as HERO_CFG } from './hero.configuration';



@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LazyImageDirective],
  template: `
    <!-- Hero Section -->
    <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden" [style.background]="'url(/assets/images/slavigrad.png) center/cover no-repeat fixed'">
      <!-- Clean Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-background/60 via-background/50 to-background/40">
        <!-- Subtle Floating Elements -->
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
        <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div class="absolute top-1/2 right-1/3 w-32 h-32 bg-accent/5 rounded-full blur-2xl animate-float"></div>

        <!-- Subtle Grid Pattern -->
        <div class="absolute inset-0 bg-grid-pattern opacity-3"></div>
      </div>

      <!-- Hero Content Container -->
      <div class="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <!-- Glass Card Wrapper -->
        <div class="glass-card-hero p-8 md:p-12 lg:p-16">
          <!-- Main Content Layout -->
          <div class="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20">

          <!-- Profile Image Section -->
          <div class="flex-shrink-0 order-1 lg:order-1">
            <div class="relative group">
              <!-- Subtle Glow Ring -->
              <div class="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

              <!-- Profile Image Container -->
              <div class="relative">
                <img
                  [appLazyImage]="profileImageUrl()"
                  [alt]="personalInfo().name"
                  class="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full object-cover border-2 border-white/10 shadow-2xl group-hover:scale-[1.02] transition-all duration-500"
                  [lazyThreshold]="0.1"
                  [lazyEnableBlur]="true"
                  [lazyEnableFadeIn]="true"
                >

                <!-- Status Indicator -->
                <div class="absolute bottom-2 right-2 w-4 h-4 bg-accent rounded-full border-2 border-background shadow-lg"></div>
              </div>
            </div>
          </div>

          <!-- Text Content Section -->
          <div class="flex-1 text-center lg:text-left order-2 lg:order-2 max-w-2xl">
            <!-- Name -->
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text leading-tight">
              {{ personalInfo().name }}
            </h1>

            <!-- Title (above subtitle) -->
            @if (personalInfo().title) {
              <h2 class="text-xl md:text-2xl lg:text-3xl mb-2 font-semibold bg-gradient-to-r from-[#4A90FF] to-[#00D4AA] bg-clip-text text-transparent">
                {{ personalInfo().title }}
              </h2>
            }

            <!-- Subtitle -->
            @if (personalInfo().subtitle) {
              <h3 class="text-lg md:text-xl lg:text-2xl text-primary/80 mb-6 font-light tracking-wide">
                {{ personalInfo().subtitle }}
              </h3>
            } @else {
              <!-- Fallback to title if subtitle missing -->
              <h3 class="text-lg md:text-xl lg:text-2xl text-primary/80 mb-6 font-light tracking-wide">
                {{ personalInfo().title }}
              </h3>
            }

            <!-- Location -->
            <div class="flex items-center justify-center lg:justify-start gap-2 mb-8 text-muted-foreground">
              <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-lg">{{ personalInfo().location || 'Zürich, Switzerland' }}</span>
            </div>

            <!-- Summary -->
            <p class="text-lg text-muted-foreground/90 mb-8 leading-relaxed max-w-xl">
              {{ personalInfo().summary }}
            </p>

            <!-- Core Technologies -->
            @if (personalInfo().technologies && personalInfo().technologies!.length > 0) {
              <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
                <span class="text-sm font-medium text-muted-foreground/70 mr-2">Core Technologies:</span>
                @for (tech of personalInfo().technologies!; track tech) {
                  <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300 hover:scale-105 shadow-sm">
                    <svg class="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ tech }}
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Enhanced CTA Buttons with PDF Generation -->
        <div class="flex flex-col items-center mb-16">
          <!-- Primary Actions -->
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <!-- Main Download Button with Enhanced Features -->


            <!-- Get In Touch Button -->
            @if (FEATURES.contact) {
            <button
              class="group px-8 py-4 bg-transparent border-2 border-accent text-accent rounded-lg font-semibold transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-105"
              (click)="scrollToContact()"
            >
              <span class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {{ UI_TEXT.GET_IN_TOUCH }}
              </span>
            </button>
            }
          </div>


        </div>


        <!-- Clean Social Links -->
        <div class="flex justify-center gap-6 mb-20">
          @if (personalInfo().linkedin) {
            <a
              [href]="personalInfo().linkedin"
              target="_blank"
              class="p-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn Profile"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          }

          @if (personalInfo().github) {
            <a
              [href]="personalInfo().github"
              target="_blank"
              class="p-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-secondary hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="GitHub Profile"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          }

          @if (personalInfo().website) {
            <a
              [href]="personalInfo().website"
              target="_blank"
              class="p-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-accent hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Personal Website"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
            </a>
          }

          @if (personalInfo().email) {
            <a
              [href]="'mailto:' + personalInfo().email"
              class="p-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Send Email"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </a>
          }
        </div>
        </div>
        <!-- End Glass Card Wrapper -->

        <!-- Clean Scroll Indicator -->
        @if (FEATURES.scrollIndicator) {
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            (click)="scrollToNextSection()"
            class="p-2 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/10 transition-all duration-300 animate-bounce hover:animate-none"
            aria-label="Scroll to next section"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </button>
        </div>
        }
      </div>
    </section>
  `,
  styles: [`
    /* Hero Glass Card - Premium Glassmorphism Effect */
    .glass-card-hero {
      /* Multi-layer gradient background with enhanced opacity for readability */
      background: linear-gradient(135deg,
        rgba(15, 15, 25, 0.75),
        rgba(10, 10, 20, 0.65));

      /* Backdrop blur for glassmorphism effect */
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);

      /* Border with subtle gradient */
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;

      /* Premium shadow with depth */
      box-shadow:
        0 8px 40px rgba(0, 0, 0, 0.5),
        0 0 40px rgba(59, 130, 246, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);

      /* Smooth transitions */
      transition: all 0.3s ease-out;
    }

    .glass-card-hero:hover {
      /* Subtle lift on hover */
      box-shadow:
        0 12px 50px rgba(0, 0, 0, 0.6),
        0 0 50px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    /* Aurora Glass: Enhanced grid pattern with glow */
    .bg-grid-pattern {
      background-image:
        linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
      background-size: 60px 60px;
      /* Subtle glow on grid lines */
      filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.1));
    }

    /* Aurora Glass: Enhanced floating animations with rotation */
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) translateX(0px) rotate(0deg);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-15px) translateX(10px) rotate(5deg);
        opacity: 0.7;
      }
    }

    @keyframes float-delayed {
      0%, 100% {
        transform: translateY(0px) translateX(0px) rotate(0deg);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-12px) translateX(-8px) rotate(-5deg);
        opacity: 0.7;
      }
    }

    @keyframes float-slow {
      0%, 100% {
        transform: translateY(0px) translateX(0px) scale(1);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-10px) translateX(5px) scale(1.1);
        opacity: 0.7;
      }
    }

    .animate-float {
      animation: float 10s ease-in-out infinite;
    }

    .animate-float-delayed {
      animation: float-delayed 12s ease-in-out infinite;
    }

    .animate-float-slow {
      animation: float-slow 15s ease-in-out infinite;
    }

    /* Aurora Glass: Enhanced button styles with glow */
    .btn-primary {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
      /* Aurora Glass: Layered shadows with glow */
      box-shadow:
        0 4px 15px rgba(59, 130, 246, 0.4),
        0 8px 30px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .btn-primary:hover::before {
      left: 100%;
    }

    .btn-primary:hover {
      box-shadow:
        0 6px 20px rgba(59, 130, 246, 0.5),
        0 12px 40px rgba(59, 130, 246, 0.3),
        0 0 30px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      transform: translateY(-2px) scale(1.02);
    }

    /* Enhanced PDF Generation Styles */
    .template-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .template-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .progress-bar {
      background: linear-gradient(90deg,
        hsl(var(--primary)) 0%,
        hsl(var(--accent)) 50%,
        hsl(var(--primary)) 100%);
      animation: progress-shimmer 2s ease-in-out infinite;
    }

    @keyframes progress-shimmer {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .template-selector-backdrop {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .notification-slide-in {
      animation: slideInFromTop 0.3s ease-out;
    }

    @keyframes slideInFromTop {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .glass-card-hero {
        padding: 2rem 1.5rem !important;
        border-radius: 1rem;
      }

      .hero-content {
        padding: 1.5rem 1rem;
      }

      .template-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .glass-card-hero {
        padding: 1.5rem 1rem !important;
        border-radius: 0.75rem;
        /* Reduce blur on mobile for better performance */
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
      }

      .hero-content {
        padding: 1rem 0.5rem;
      }

      .template-selector-modal {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }
    }
  `]
})
export class HeroComponent {
  private cvDataService = inject(CvDataService);
  private themeService = inject(ThemeService);






  readonly personalInfo = this.cvDataService.personalInfo;
  readonly profileImageUrl = computed(() => 'assets/images/lubomir_dobrovodsky.jpg');



  // Template previews




  scrollToContact(): void {
    const contactElement = document.getElementById('contact');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToNextSection(): void {
    const statsElement = document.getElementById('stats');
    if (statsElement) {
      statsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Utility methods
   */


  readonly FEATURES = HERO_CFG.features;
  protected readonly UI_TEXT = UI_TEXT;
}
