import { Component, inject, signal } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CvDataService } from '../../services/cv-data.service';
import { ThemeService } from '../../services/theme.service';
import { ScrollAnimateDirective, InteractiveAnimateDirective } from '../../shared/utils/animations';
import { CONTACT_TEXT, CONTACT_TIMINGS } from './contact.constants';
import { CONTACT_CONFIG } from './contact.configuration';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, ScrollAnimateDirective, InteractiveAnimateDirective],
  template: `
    <!-- Contact Section -->
    @if (FEATURES.sectionEnabled) {

      <section id="contact" class="py-20 relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute inset-0 bg-gradient-to-b from-background/40 to-background/50"></div>

        <div class="relative z-10 max-w-6xl mx-auto px-6">
          <!-- Section Header -->
          <div class="text-center mb-16" appScrollAnimate="fadeInUp">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Get In Touch
            </h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              {{ CONTACT_TEXT.sectionSubtitle }}
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Contact Information -->
            <div class="space-y-8">
              <div class="glass-card p-8" appScrollAnimate="fadeInLeft" appInteractiveAnimate="lift"
                   animationTrigger="hover">
                <h3 class="text-2xl font-bold mb-6 text-foreground">
                  {{ CONTACT_TEXT.infoTitle }}
                </h3>

                <div class="space-y-6">
                  <!-- Email -->
                  <div class="flex items-center gap-4 group">
                    <div
                      class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm text-muted-foreground">Email</div>
                      <a [href]="'mailto:' + personalInfo().email"
                         class="text-foreground hover:text-primary transition-colors">
                        {{ personalInfo().email }}
                      </a>
                    </div>
                  </div>

                  <!-- Phone -->
                  <div class="flex items-center gap-4 group">
                    <div
                      class="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm text-muted-foreground">Phone</div>
                      <a [href]="'tel:' + personalInfo().phone"
                         class="text-foreground hover:text-secondary transition-colors">
                        {{ personalInfo().phone }}
                      </a>
                    </div>
                  </div>

                  <!-- Location -->
                  <div class="flex items-center gap-4 group">
                    <div
                      class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm text-muted-foreground">Location</div>
                      <div class="text-foreground">{{ personalInfo().location }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Social Links -->
              <div class="glass-card p-8" appScrollAnimate="fadeInLeft" [animationDelay]="200"
                   appInteractiveAnimate="lift" animationTrigger="hover">
                <h3 class="text-xl font-bold mb-6 text-foreground">
                  {{ CONTACT_TEXT.connectTitle }}
                </h3>

                <div class="flex gap-4">
                  @if (personalInfo().linkedin) {
                    <a
                      [href]="personalInfo().linkedin"
                      target="_blank"
                      class="w-12 h-12 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover-lift group"
                      aria-label="LinkedIn Profile"
                    >
                      <svg class="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="currentColor"
                           viewBox="0 0 24 24">
                        <path
                          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  }

                  @if (personalInfo().github) {
                    <a
                      [href]="personalInfo().github"
                      target="_blank"
                      class="w-12 h-12 rounded-lg bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center transition-all duration-300 hover-lift group"
                      aria-label="GitHub Profile"
                    >
                      <svg class="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" fill="currentColor"
                           viewBox="0 0 24 24">
                        <path
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  }

                  @if (personalInfo().website) {
                    <a
                      [href]="personalInfo().website"
                      target="_blank"
                      class="w-12 h-12 rounded-lg bg-accent/10 hover:bg-accent/20 flex items-center justify-center transition-all duration-300 hover-lift group"
                      aria-label="Personal Website"
                    >
                      <svg class="w-6 h-6 text-accent group-hover:scale-110 transition-transform" fill="none"
                           stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                      </svg>
                    </a>
                  }
                </div>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="glass-card p-8" appScrollAnimate="fadeInRight" appInteractiveAnimate="lift"
                 animationTrigger="hover">
              <h3 class="text-2xl font-bold mb-6 text-foreground">
                {{ CONTACT_TEXT.formTitle }}
              </h3>

              <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Name -->
                <div>
                  <label for="name" class="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    formControlName="name"
                    class="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="{{ CONTACT_TEXT.placeholders.name }}"
                  >
                  @if (contactForm.get('name')?.invalid && contactForm.get('name')?.touched) {
                    <div class="text-red-500 text-sm mt-1">{{ CONTACT_TEXT.validation.nameRequired }}</div>
                  }
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="{{ CONTACT_TEXT.placeholders.email }}"
                  >
                  @if (contactForm.get('email')?.invalid && contactForm.get('email')?.touched) {
                    <div class="text-red-500 text-sm mt-1">{{ CONTACT_TEXT.validation.emailRequired }}</div>
                  }
                </div>

                <!-- Subject -->
                <div>
                  <label for="subject" class="block text-sm font-medium text-foreground mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    formControlName="subject"
                    class="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="{{ CONTACT_TEXT.placeholders.subject }}"
                  >
                  @if (contactForm.get('subject')?.invalid && contactForm.get('subject')?.touched) {
                    <div class="text-red-500 text-sm mt-1">{{ CONTACT_TEXT.validation.subjectRequired }}</div>
                  }
                </div>

                <!-- Message -->
                <div>
                  <label for="message" class="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    formControlName="message"
                    rows="5"
                    class="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="{{ CONTACT_TEXT.placeholders.message }}"
                  ></textarea>
                  @if (contactForm.get('message')?.invalid && contactForm.get('message')?.touched) {
                    <div class="text-red-500 text-sm mt-1">{{ CONTACT_TEXT.validation.messageRequired }}</div>
                  }
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  [disabled]="contactForm.invalid || isSubmitting()"
                  class="w-full glass-card px-6 py-3 text-lg font-semibold text-primary hover:text-primary-foreground hover:bg-primary/20 transition-all duration-300 hover-lift disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                <span class="flex items-center justify-center gap-2">
                  @if (isSubmitting()) {
                    <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Sending...
                  } @else {
                    <svg class="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                    Send Message
                  }
                </span>
                </button>
              </form>

              @if (submitMessage()) {
                <div class="mt-4 p-4 rounded-lg"
                     [class]="submitMessage()?.success ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'">
                  {{ submitMessage()?.message }}
                </div>
              }
            </div>
          </div>
        </div>
      </section>
    }

  `,
  styles: [`
    input:focus, textarea:focus {
      box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
    }
  `]
})
export class ContactComponent {
  private cvDataService = inject(CvDataService);
  private themeService = inject(ThemeService);
  private fb = inject(FormBuilder);

  readonly personalInfo = this.cvDataService.personalInfo;
  readonly isSubmitting = signal(false);
  readonly submitMessage = signal<{success: boolean, message: string} | null>(null);
  readonly TEXT = CONTACT_TEXT;
  readonly TIMINGS = CONTACT_TIMINGS;
  readonly FEATURES = CONTACT_CONFIG.features;


  readonly contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required]],
    message: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      this.submitMessage.set(null);

      // Simulate form submission
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.submitMessage.set({
          success: true,
          message: this.TEXT.successMessage
        });
        this.contactForm.reset();
      }, this.TIMINGS.submitDelayMs);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  protected readonly CONTACT_TEXT = CONTACT_TEXT;
}
