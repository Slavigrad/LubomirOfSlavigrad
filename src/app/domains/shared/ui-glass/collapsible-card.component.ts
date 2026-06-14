import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';

import { CollapseComponent, CollapseVariant, CollapseSize, CollapseAnimation } from './collapse.component';
import { CardComponent } from './card.component';

export interface CollapsibleCardConfig {
  variant?: CollapseVariant;
  size?: CollapseSize;
  animation?: CollapseAnimation;
  duration?: number;
  showIcon?: boolean;
  customIcon?: string;
  collapsible?: boolean;
  startExpanded?: boolean;
}

@Component({
  selector: 'app-collapsible-card',
  imports: [CollapseComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collapsible-card.component.html',
  styleUrl: './collapsible-card.component.scss',
})
export class CollapsibleCardComponent {
  // Configuration inputs
  readonly variant = input<CollapseVariant>('card');
  readonly size = input<CollapseSize>('md');
  readonly animation = input<CollapseAnimation>('slide');
  readonly duration = input<number>(300);
  readonly collapsible = input<boolean>(true);
  readonly expanded = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly showIcon = input<boolean>(true);
  readonly customIcon = input<string>('');

  // Content inputs
  readonly title = input<string>('Card Title');
  readonly subtitle = input<string>('');
  readonly description = input<string>('');
  readonly icon = input<string>('');
  readonly badge = input<string>('');
  readonly badgeVariant = input<'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'>('default');

  // Action inputs
  readonly actions = input<CardAction[]>([]);

  // Events
  readonly expandedChange = output<boolean>();
  readonly toggle = output<boolean>();
  readonly actionClick = output<CardAction>();

  // Internal state
  private readonly hasFooterSlot = signal(false);
  private readonly expandedSignal = signal(false);

  // Computed properties
  readonly containerClasses = computed(() => {
    const variantValue = this.variant();
    const sizeValue = this.size();

    return [
      'collapsible-card-container',
      `variant-${variantValue}`,
      `size-${sizeValue}`,
      this.disabled() ? 'disabled' : ''
    ].filter(Boolean).join(' ');
  });

  readonly badgeClass = computed(() => {
    return `badge badge-${this.badgeVariant()}`;
  });

  readonly hasFooterContent = computed(() => {
    return this.hasFooterSlot() || this.actions().length > 0;
  });

  onExpandedChange(expanded: boolean): void {
    this.expandedSignal.set(expanded);
    this.expandedChange.emit(expanded);
  }

  onToggle(expanded: boolean): void {
    this.toggle.emit(expanded);
  }

  onActionClick(action: CardAction): void {
    if (!action.disabled) {
      this.actionClick.emit(action);
      action.onClick?.(action);
    }
  }

  getActionClass(action: CardAction): string {
    const variant = action.variant || 'outline';
    return `action-${variant}`;
  }

  // Public API methods
  expand(): void {
    if (this.collapsible() && !this.expandedSignal()) {
      this.expandedSignal.set(true);
      this.expandedChange.emit(true);
    }
  }

  collapse(): void {
    if (this.collapsible() && this.expandedSignal()) {
      this.expandedSignal.set(false);
      this.expandedChange.emit(false);
    }
  }

  toggleExpansion(): void {
    if (this.collapsible()) {
      const newState = !this.expandedSignal();
      this.expandedSignal.set(newState);
      this.expandedChange.emit(newState);
    }
  }
}

export interface CardAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  icon?: string;
  disabled?: boolean;
  onClick?: (action: CardAction) => void;
}
