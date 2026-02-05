import { Component, inject, OnInit } from '@angular/core';

import { CvDataService, ThemeService } from '../../services';
import {
  HeroComponent,
  StatsComponent,
  SkillsComponent,
  ExperienceComponent,
  ProjectsComponent,
  ContactComponent
} from '../../components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    StatsComponent,
    SkillsComponent,
    ExperienceComponent,
    ProjectsComponent,
    ContactComponent
],
  template: `
    <div class="min-h-screen">
      <!-- Hero Section Component -->
      <app-hero></app-hero>

      <!-- Stats Section Component -->
      <app-stats></app-stats>

      <!-- Skills Section Component -->
      <app-skills></app-skills>

      <!-- Experience Section Component -->
      <app-experience></app-experience>

      <!-- Projects Section Component -->
      <app-projects></app-projects>

      <!-- Contact Section Component -->
      <app-contact></app-contact>
    </div>
  `,









  styles: [`
    :host {
      display: block;
    }

    /* Smooth scroll behavior */
    html {
      scroll-behavior: smooth;
    }

    /* Custom animations for staggered entrance */
    .animate-scale-in {
      animation: scaleIn 0.6s ease-out forwards;
    }

    .animate-slide-in-left {
      animation: slideInLeft 0.8s ease-out forwards;
    }

    .animate-slide-in-right {
      animation: slideInRight 0.8s ease-out forwards;
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class HomeComponent {
  // This component now serves as a container for the individual CV section components
  // All functionality has been moved to dedicated standalone components:
  // - HeroComponent: Profile information and call-to-action buttons
  // - StatsComponent: Professional metrics and achievements
  // - SkillsComponent: Technical skills with categorization and progress visualization
  // - ExperienceComponent: Work history with timeline layout
  // - ProjectsComponent: Portfolio showcase with project details
  // - ContactComponent: Contact information and message form
}
