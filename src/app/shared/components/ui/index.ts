// UI Components Library
// Export all reusable UI components for the Lubomir of Slavigrad Chronicles CV website

// Button Components
export { ButtonComponent } from './button.component';
export type { ButtonVariant, ButtonSize } from './button.component';

// Card Components
export { CardComponent } from './card.component';
export type { CardVariant } from './card.component';

// Badge Components
export { BadgeComponent } from './badge.component';
export type { BadgeVariant, BadgeSize } from './badge.component';

// Loading Components
export { LoadingComponent } from './loading.component';
export type { LoadingVariant, LoadingSize } from './loading.component';

// Collapse Components
export { CollapseComponent } from './collapse.component';
export type { CollapseVariant, CollapseSize, CollapseAnimation, CollapseConfig } from './collapse.component';

// Accordion Components
export { AccordionComponent } from './accordion.component';
export type { AccordionItem, AccordionConfig } from './accordion.component';

// Collapsible Card Components
export { CollapsibleCardComponent } from './collapsible-card.component';
export type { CollapsibleCardConfig, CardAction } from './collapsible-card.component';

// Collapse Group Components
export { CollapseGroupComponent } from './collapse-group.component';
export type { CollapseGroupConfig, CollapseGroupItem } from './collapse-group.component';

// Technology List Component
export { TechnologyListComponent } from './technology-list.component';
export type { TechnologyCategory } from './technology-list.component';

// Modal Component
export { GlassModalComponent } from './glass-modal.component';
export type { GlassModalSize } from './glass-modal.component';

// Glass List Card (reusable list card for modal/grid use)
export { GlassListCardComponent } from './glass-list-card.component';

// Form Control Components
export { InputComponent } from './input.component';
export type { InputVariant, InputSize } from './input.component';

export { TextareaComponent } from './textarea.component';
export type { TextareaVariant, TextareaSize } from './textarea.component';

// Animation Utilities
export {
  AnimationService,
  useScrollAnimation,
  ANIMATION_STYLES,
  ScrollAnimateDirective,
  InteractiveAnimateDirective
} from '../../utils/animations';
export type {
  AnimationOptions,
  ScrollAnimationConfig,
  InteractiveAnimationConfig
} from '../../utils/animations';
