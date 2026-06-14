import { Component, input, computed } from '@angular/core';


export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  readonly variant = input<LoadingVariant>('spinner');
  readonly size = input<LoadingSize>('md');
  readonly text = input<string>('');
  readonly color = input<'primary' | 'secondary' | 'accent' | 'muted'>('primary');

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
