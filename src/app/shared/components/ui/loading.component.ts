import { Component, Input, signal, computed } from '@angular/core';


export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-loading',
  template: `
    <div [class]="containerClasses()">
      @switch (variant()) {
        @case ('spinner') {
          <div [class]="spinnerClasses()"></div>
        }
        @case ('dots') {
          <div class="flex space-x-1">
            <div [class]="dotClasses() + ' animate-bounce'" style="animation-delay: 0ms"></div>
            <div [class]="dotClasses() + ' animate-bounce'" style="animation-delay: 150ms"></div>
            <div [class]="dotClasses() + ' animate-bounce'" style="animation-delay: 300ms"></div>
          </div>
        }
        @case ('pulse') {
          <div [class]="pulseClasses()"></div>
        }
        @case ('skeleton') {
          <div class="space-y-3">
            <div [class]="skeletonClasses() + ' h-4 w-3/4'"></div>
            <div [class]="skeletonClasses() + ' h-4 w-1/2'"></div>
            <div [class]="skeletonClasses() + ' h-4 w-5/6'"></div>
          </div>
        }
      }

      @if (text()) {
        <p [class]="textClasses()">{{ text() }}</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .loading-container {
      @apply flex flex-col items-center justify-center;
    }

    /* Spinner Styles */
    .spinner {
      @apply border-2 border-current border-t-transparent rounded-full animate-spin;
    }

    .spinner-sm { @apply w-4 h-4; }
    .spinner-md { @apply w-6 h-6; }
    .spinner-lg { @apply w-8 h-8; }
    .spinner-xl { @apply w-12 h-12; }

    /* Dot Styles */
    .dot {
      @apply rounded-full bg-current;
    }

    .dot-sm { @apply w-1 h-1; }
    .dot-md { @apply w-2 h-2; }
    .dot-lg { @apply w-3 h-3; }
    .dot-xl { @apply w-4 h-4; }

    /* Pulse Styles */
    .pulse {
      @apply rounded-full bg-current animate-pulse;
    }

    .pulse-sm { @apply w-8 h-8; }
    .pulse-md { @apply w-12 h-12; }
    .pulse-lg { @apply w-16 h-16; }
    .pulse-xl { @apply w-20 h-20; }

    /* Skeleton Styles */
    .skeleton {
      @apply bg-muted rounded animate-pulse;
    }

    /* Text Styles */
    .loading-text {
      @apply text-muted-foreground mt-2;
    }

    .text-sm { font-size: 0.875rem; }
    .text-md { font-size: 1rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }

    /* Color Variants */
    .loading-primary { @apply text-primary; }
    .loading-secondary { @apply text-secondary; }
    .loading-accent { @apply text-accent; }
    .loading-muted { @apply text-muted-foreground; }

    /* Custom Animations */
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-spin-slow {
      animation: spin-slow 2s linear infinite;
    }

    @keyframes pulse-glow {
      0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 0 currentColor;
      }
      50% {
        opacity: 0.7;
        box-shadow: 0 0 0 10px transparent;
      }
    }

    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .spinner-xl { @apply w-10 h-10; }
      .pulse-xl { @apply w-16 h-16; }
    }
  `]
})
export class LoadingComponent {
  @Input() variant = signal<LoadingVariant>('spinner');
  @Input() size = signal<LoadingSize>('md');
  @Input() text = signal<string>('');
  @Input() color = signal<'primary' | 'secondary' | 'accent' | 'muted'>('primary');

  readonly containerClasses = computed(() => {
    return [
      'loading-container',
      `loading-${this.color()}`,
    ].join(' ');
  });

  readonly spinnerClasses = computed(() => {
    return [
      'spinner',
      `spinner-${this.size()}`,
    ].join(' ');
  });

  readonly dotClasses = computed(() => {
    return [
      'dot',
      `dot-${this.size()}`,
    ].join(' ');
  });

  readonly pulseClasses = computed(() => {
    return [
      'pulse',
      `pulse-${this.size()}`,
      'animate-pulse-glow',
    ].join(' ');
  });

  readonly skeletonClasses = computed(() => {
    return 'skeleton';
  });

  readonly textClasses = computed(() => {
    return [
      'loading-text',
      `text-${this.size()}`,
    ].join(' ');
  });
}
