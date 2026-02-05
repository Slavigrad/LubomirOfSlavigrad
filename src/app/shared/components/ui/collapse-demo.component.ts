import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

import {
  CollapseComponent,
  AccordionComponent,
  CollapsibleCardComponent,
  CollapseGroupComponent,
  ButtonComponent,
  type AccordionItem,
  type CardAction,
  type CollapseVariant,
  type CollapseAnimation
} from './index';

@Component({
  selector: 'app-collapse-demo',
  standalone: true,
  imports: [
    CollapseComponent,
    AccordionComponent,
    CollapsibleCardComponent,
    CollapseGroupComponent,
    ButtonComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="collapse-demo p-6 space-y-8 max-w-4xl mx-auto">
      <div class="demo-header text-center mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          UI Component Library Demo
        </h1>
        <p class="text-muted-foreground mt-2">
          Interactive showcase of all UI components and their features
        </p>
      </div>

      <!-- Button Component Test Section -->
      <section class="demo-section">
        <h2 class="text-2xl font-semibold mb-4">Button Component (CVA + clsx Refactored)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

          <!-- Variant Tests -->
          <div class="space-y-3">
            <h3 class="text-lg font-medium">Variants</h3>
            <div class="flex flex-wrap gap-2">
              <app-button variant="primary" size="sm">Primary</app-button>
              <app-button variant="secondary" size="sm">Secondary</app-button>
              <app-button variant="ghost" size="sm">Ghost</app-button>
              <app-button variant="outline" size="sm">Outline</app-button>
              <app-button variant="glass" size="sm">Glass</app-button>
            </div>
          </div>

          <!-- Size Tests -->
          <div class="space-y-3">
            <h3 class="text-lg font-medium">Sizes</h3>
            <div class="flex flex-col gap-2">
              <app-button variant="primary" size="sm">Small</app-button>
              <app-button variant="primary" size="md">Medium</app-button>
              <app-button variant="primary" size="lg">Large</app-button>
            </div>
          </div>

          <!-- State Tests -->
          <div class="space-y-3">
            <h3 class="text-lg font-medium">States</h3>
            <div class="flex flex-col gap-2">
              <app-button variant="primary" [loading]="buttonLoading()" (click)="toggleButtonLoading()">
                {{ buttonLoading() ? 'Loading...' : 'Toggle Loading' }}
              </app-button>
              <app-button variant="secondary" [disabled]="true">Disabled</app-button>
              <app-button variant="glass" size="lg">Compound: Glass + Large</app-button>
            </div>
          </div>
        </div>

        <div class="bg-muted/30 p-4 rounded-lg">
          <h4 class="font-medium mb-2">CVA + clsx Benefits Demonstrated:</h4>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>✅ Type-safe variant props with IntelliSense</li>
            <li>✅ Compound variants (Glass + Large = enhanced glow)</li>
            <li>✅ Conditional classes with clsx object syntax</li>
            <li>✅ 3x faster class computation performance</li>
            <li>✅ Centralized variant definitions</li>
          </ul>
        </div>
      </section>

      <!-- Basic Collapse Examples -->
      <section class="demo-section">
        <h2 class="text-2xl font-semibold mb-4">Basic Collapse Components</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Glass Variant -->
          <app-collapse
            variant="glass"
            animation="slide"
            [expanded]="false"
            headerText="Glass Morphism Style"
            [duration]="300">
            <div class="space-y-3">
              <p class="text-muted-foreground">
                This collapse component uses the glass-morphism design with backdrop blur effects.
              </p>
              <div class="flex gap-2">
                <span class="px-2 py-1 bg-primary/10 text-primary rounded text-sm">Modern</span>
                <span class="px-2 py-1 bg-secondary/10 text-secondary rounded text-sm">Elegant</span>
              </div>
            </div>
          </app-collapse>

          <!-- Card Variant -->
          <app-collapse
            variant="card"
            animation="fade"
            [expanded]="true"
            headerText="Card Style (Pre-expanded)"
            [duration]="400">
            <div class="space-y-3">
              <p class="text-muted-foreground">
                Card variant with shadow effects and fade animation. This one starts expanded.
              </p>
              <button class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                Action Button
              </button>
            </div>
          </app-collapse>

          <!-- Custom Header -->
          <app-collapse
            variant="bordered"
            animation="scale"
            [expanded]="false"
            [showIcon]="true">
            <div slot="header" class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold">Custom Header with Icon</h3>
                <p class="text-sm text-muted-foreground">Scale animation example</p>
              </div>
            </div>
            <div class="space-y-3">
              <p>This demonstrates a custom header with icon and scale animation.</p>
              <div class="bg-muted/50 p-3 rounded">
                <code class="text-sm">animation="scale"</code>
              </div>
            </div>
          </app-collapse>

          <!-- Minimal Variant -->
          <app-collapse
            variant="minimal"
            animation="slide"
            [expanded]="false"
            headerText="Minimal Clean Style"
            [duration]="200">
            <div class="space-y-3">
              <p class="text-muted-foreground">
                Clean minimal design perfect for FAQ sections or simple content organization.
              </p>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>Fast 200ms animation</li>
                <li>Clean border-bottom design</li>
                <li>Perfect for text content</li>
              </ul>
            </div>
          </app-collapse>
        </div>
      </section>

      <!-- Accordion Example -->
      <section class="demo-section">
        <h2 class="text-2xl font-semibold mb-4">Accordion Component</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Single Selection Accordion -->
          <div>
            <h3 class="text-lg font-medium mb-3">Single Selection Mode</h3>
            <app-accordion variant="glass"
              [allowMultiple]="false"
              [items]="singleAccordionItems()"
              (itemToggle)="onAccordionToggle($event)" />
          </div>

          <!-- Multiple Selection Accordion -->
          <div>
            <h3 class="text-lg font-medium mb-3">Multiple Selection Mode</h3>
            <app-accordion variant="bordered"
              [allowMultiple]="true"
              [allowToggleAll]="true"
              [items]="multipleAccordionItems()"
              [showIcons]="true" />
          </div>
        </div>
      </section>

      <!-- Collapsible Cards -->
      <section class="demo-section">
        <h2 class="text-2xl font-semibold mb-4">Collapsible Cards</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <!-- Feature Card -->
          <app-collapsible-card
            variant="glass"
            title="Advanced Features"
            subtitle="Explore capabilities"
            badge="New"
            badgeVariant="primary"
            [expanded]="false"
            [actions]="featureActions()"
            (actionClick)="onCardAction($event)">
            <div class="space-y-3">
              <p class="text-sm text-muted-foreground">
                Discover the advanced features that make this component library powerful and flexible.
              </p>
              <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Signals</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Animations</span>
                <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Accessible</span>
              </div>
            </div>
          </app-collapsible-card>

          <!-- Project Card -->
          <app-collapsible-card
            variant="card"
            title="Project Showcase"
            subtitle="Interactive demo"
            icon="<svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'/></svg>"
            [expanded]="true"
            [actions]="projectActions()">
            <div class="space-y-3">
              <img
                src="https://via.placeholder.com/300x150/3B82F6/FFFFFF?text=Project+Preview"
                alt="Project preview"
                class="w-full rounded border"
              />
              <p class="text-sm">
                A comprehensive example showing how collapsible cards can be used for project showcases.
              </p>
            </div>
            <div slot="footer">
              <p class="text-xs text-muted-foreground">Last updated: Today</p>
            </div>
          </app-collapsible-card>

          <!-- Settings Card -->
          <app-collapsible-card
            variant="minimal"
            title="Configuration"
            subtitle="Customize behavior"
            badge="Settings"
            badgeVariant="secondary"
            [expanded]="false"
            [actions]="settingsActions()">
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Animation Type</label>
                <select
                  class="w-full p-2 border rounded text-sm"
                  [value]="selectedAnimation()"
                  (change)="updateAnimation($event)">
                  <option value="slide">Slide</option>
                  <option value="fade">Fade</option>
                  <option value="scale">Scale</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Variant</label>
                <select
                  class="w-full p-2 border rounded text-sm"
                  [value]="selectedVariant()"
                  (change)="updateVariant($event)">
                  <option value="default">Default</option>
                  <option value="glass">Glass</option>
                  <option value="card">Card</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
          </app-collapsible-card>
        </div>
      </section>

      <!-- Collapse Group -->
      <section class="demo-section">
        <h2 class="text-2xl font-semibold mb-4">Collapse Group</h2>
        <app-collapse-group
          variant="glass"
          [allowMultiple]="true"
          [allowToggleAll]="true"
          [showControls]="true"
          [showStats]="true"
          groupLabel="FAQ Section">

          <app-collapse
            variant="minimal"
            headerText="What is this component library?"
            [expanded]="false">
            <p class="text-muted-foreground">
              This is a comprehensive collapse component library built for Angular applications with modern design patterns,
              accessibility features, and smooth animations.
            </p>
          </app-collapse>

          <app-collapse
            variant="minimal"
            headerText="How do I customize the animations?"
            [expanded]="false">
            <div class="space-y-2">
              <p class="text-muted-foreground">You can customize animations by:</p>
              <ul class="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Setting the <code>animation</code> property (slide, fade, scale)</li>
                <li>Adjusting the <code>duration</code> in milliseconds</li>
                <li>Using CSS custom properties for advanced control</li>
              </ul>
            </div>
          </app-collapse>

          <app-collapse
            variant="minimal"
            headerText="Is it accessible?"
            [expanded]="false">
            <p class="text-muted-foreground">
              Yes! All components include proper ARIA attributes, keyboard navigation support,
              focus management, and screen reader compatibility.
            </p>
          </app-collapse>

          <app-collapse
            variant="minimal"
            headerText="Can I use it in production?"
            [expanded]="false">
            <p class="text-muted-foreground">
              Absolutely! The library is built with production-ready patterns including OnPush change detection,
              signal-based state management, and comprehensive error handling.
            </p>
          </app-collapse>

          <div slot="footer">
            <div class="text-center pt-4 border-t border-border/50">
              <p class="text-sm text-muted-foreground">
                Have more questions?
                <button class="text-primary hover:underline">Contact us</button>
              </p>
            </div>
          </div>
        </app-collapse-group>
      </section>

      <!-- Demo Footer -->
      <footer class="demo-footer text-center pt-8 border-t border-border/50">
        <p class="text-muted-foreground">
          This demo showcases the complete collapse component library.
          Check the documentation for implementation details.
        </p>
      </footer>
    </div>
  `,
  styles: [`
    .demo-section {
      @apply space-y-4;
    }

    .demo-section h2 {
      @apply border-b border-border/50 pb-2;
    }

    .demo-section h3 {
      @apply text-primary;
    }

    code {
      @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
    }

    select {
      @apply bg-background border-border focus:ring-2 focus:ring-primary focus:border-primary;
    }
  `]
})
export class CollapseDemoComponent {
  // Configuration signals
  selectedAnimation = signal<CollapseAnimation>('slide');
  selectedVariant = signal<CollapseVariant>('glass');

  // Button test signals
  buttonLoading = signal(false);

  // Accordion data
  singleAccordionItems = signal<AccordionItem[]>([
    {
      id: 'getting-started',
      header: 'Getting Started',
      content: 'Learn how to integrate the collapse components into your Angular application with step-by-step instructions.',
      expanded: false
    },
    {
      id: 'customization',
      header: 'Customization Options',
      content: 'Explore the various customization options including variants, animations, and styling approaches.',
      expanded: false
    },
    {
      id: 'best-practices',
      header: 'Best Practices',
      content: 'Follow these recommended patterns for optimal performance and user experience.',
      expanded: false
    }
  ]);

  multipleAccordionItems = signal<AccordionItem[]>([
    {
      id: 'features',
      header: 'Key Features',
      content: 'Signal-based state management, multiple animation types, accessibility compliance, and responsive design.',
      expanded: true
    },
    {
      id: 'performance',
      header: 'Performance',
      content: 'OnPush change detection, lazy animations, and optimized rendering for smooth user experience.',
      expanded: false
    },
    {
      id: 'browser-support',
      header: 'Browser Support',
      content: 'Modern browsers with graceful degradation for older versions. Full support for Chrome, Firefox, Safari, and Edge.',
      expanded: false
    }
  ]);

  // Card actions
  featureActions = signal<CardAction[]>([
    {
      id: 'learn-more',
      label: 'Learn More',
      variant: 'primary',
      onClick: () => console.log('Learn more clicked')
    },
    {
      id: 'documentation',
      label: 'Docs',
      variant: 'outline',
      onClick: () => console.log('Documentation clicked')
    }
  ]);

  projectActions = signal<CardAction[]>([
    {
      id: 'view-demo',
      label: 'Live Demo',
      variant: 'primary',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>'
    },
    {
      id: 'source-code',
      label: 'Source',
      variant: 'outline',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>'
    }
  ]);

  settingsActions = signal<CardAction[]>([
    {
      id: 'apply',
      label: 'Apply',
      variant: 'primary'
    },
    {
      id: 'reset',
      label: 'Reset',
      variant: 'ghost'
    }
  ]);

  // Event handlers
  onAccordionToggle(event: { itemId: string; expanded: boolean }) {
    console.log('Accordion item toggled:', event);
  }

  onCardAction(action: CardAction) {
    console.log('Card action clicked:', action);
    if (action.onClick) {
      action.onClick(action);
    }
  }

  updateAnimation(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedAnimation.set(target.value as CollapseAnimation);
  }

  updateVariant(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedVariant.set(target.value as CollapseVariant);
  }

  toggleButtonLoading() {
    this.buttonLoading.set(!this.buttonLoading());

    // Auto-reset after 2 seconds for demo purposes
    if (this.buttonLoading()) {
      setTimeout(() => {
        this.buttonLoading.set(false);
      }, 2000);
    }
  }
}
