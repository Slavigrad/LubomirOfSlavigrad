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
  type CollapseAnimation,
} from '../../shared/ui-glass';

@Component({
  selector: 'app-collapse-demo',
  imports: [
    CollapseComponent,
    AccordionComponent,
    CollapsibleCardComponent,
    CollapseGroupComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collapse-demo.component.html',
  styleUrl: './collapse-demo.component.scss',
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
      content:
        'Learn how to integrate the collapse components into your Angular application with step-by-step instructions.',
      expanded: false,
    },
    {
      id: 'customization',
      header: 'Customization Options',
      content:
        'Explore the various customization options including variants, animations, and styling approaches.',
      expanded: false,
    },
    {
      id: 'best-practices',
      header: 'Best Practices',
      content: 'Follow these recommended patterns for optimal performance and user experience.',
      expanded: false,
    },
  ]);

  multipleAccordionItems = signal<AccordionItem[]>([
    {
      id: 'features',
      header: 'Key Features',
      content:
        'Signal-based state management, multiple animation types, accessibility compliance, and responsive design.',
      expanded: true,
    },
    {
      id: 'performance',
      header: 'Performance',
      content:
        'OnPush change detection, lazy animations, and optimized rendering for smooth user experience.',
      expanded: false,
    },
    {
      id: 'browser-support',
      header: 'Browser Support',
      content:
        'Modern browsers with graceful degradation for older versions. Full support for Chrome, Firefox, Safari, and Edge.',
      expanded: false,
    },
  ]);

  // Card actions
  featureActions = signal<CardAction[]>([
    {
      id: 'learn-more',
      label: 'Learn More',
      variant: 'primary',
      onClick: () => console.log('Learn more clicked'),
    },
    {
      id: 'documentation',
      label: 'Docs',
      variant: 'outline',
      onClick: () => console.log('Documentation clicked'),
    },
  ]);

  projectActions = signal<CardAction[]>([
    {
      id: 'view-demo',
      label: 'Live Demo',
      variant: 'primary',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>',
    },
    {
      id: 'source-code',
      label: 'Source',
      variant: 'outline',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>',
    },
  ]);

  settingsActions = signal<CardAction[]>([
    {
      id: 'apply',
      label: 'Apply',
      variant: 'primary',
    },
    {
      id: 'reset',
      label: 'Reset',
      variant: 'ghost',
    },
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
