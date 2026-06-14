# Collapse Component Library

A comprehensive, reusable collapse component library for the Lubomir of Slavigrad Chronicles CV website. Built with Angular 19+ signals, modern animations, and full accessibility support.

## Components Overview

### 1. CollapseComponent (`app-collapse`)
The foundational collapsible component with customizable animations and variants.

**Features:**
- Multiple animation types (slide, fade, scale, rotate)
- Glass-morphism and card variants
- Accessibility compliant (ARIA attributes, keyboard navigation)
- Signal-based reactive state management
- Customizable icons and headers

**Basic Usage:**
```html
<app-collapse
  variant="glass"
  animation="slide"
  [expanded]="false"
  headerText="Click to expand">
  <p>Your collapsible content here</p>
</app-collapse>
```

### 2. AccordionComponent (`app-accordion`)
Multi-item accordion with single or multiple expansion modes.

**Features:**
- Single or multiple item expansion
- Programmatic control (expand all, collapse all)
- Dynamic item management
- Staggered animations
- Template-based customization

**Basic Usage:**
```html
<app-accordion
  variant="bordered"
  [allowMultiple]="false"
  [items]="accordionItems"
  (itemToggle)="onToggle($event)">
</app-accordion>
```

### 3. CollapsibleCardComponent (`app-collapsible-card`)
Enhanced card component with collapsible content and action buttons.

**Features:**
- Card-based layout with header, content, and footer
- Action button system
- Badge and icon support
- Static or collapsible modes
- Rich content projection

**Basic Usage:**
```html
<app-collapsible-card
  title="Feature Card"
  subtitle="Expandable content"
  badge="New"
  [actions]="cardActions"
  [expanded]="false">
  <p>Card content goes here</p>
</app-collapsible-card>
```

### 4. CollapseGroupComponent (`app-collapse-group`)
Container for managing multiple collapsible components with group controls.

**Features:**
- Group-level expand/collapse controls
- Horizontal and vertical layouts
- Statistics display (expanded count)
- Staggered animations
- Mixed component support

**Basic Usage:**
```html
<app-collapse-group
  variant="glass"
  [allowMultiple]="true"
  [allowToggleAll]="true">
  
  <app-collapse headerText="Item 1">Content 1</app-collapse>
  <app-collapse headerText="Item 2">Content 2</app-collapse>
  <app-collapse headerText="Item 3">Content 3</app-collapse>
</app-collapse-group>
```

## Configuration Options

### Variants
- `default` - Standard border styling
- `glass` - Glass-morphism effect with backdrop blur
- `bordered` - Enhanced border styling
- `minimal` - Clean, minimal appearance
- `card` - Card-based styling with shadows

### Sizes
- `sm` - Compact sizing for dense layouts
- `md` - Standard sizing (default)
- `lg` - Large sizing for prominent sections

### Animations
- `slide` - Smooth height transition (default)
- `fade` - Opacity and transform animation
- `scale` - Scale transformation
- `rotate` - Icon rotation animation

## Advanced Features

### Custom Headers
```html
<app-collapse>
  <div slot="header" class="custom-header">
    <h3>Custom Title</h3>
    <span class="badge">Important</span>
  </div>
  <p>Content with custom header</p>
</app-collapse>
```

### Action Buttons
```typescript
const cardActions: CardAction[] = [
  {
    id: 'edit',
    label: 'Edit',
    variant: 'primary',
    icon: '<svg>...</svg>',
    onClick: (action) => console.log('Edit clicked')
  },
  {
    id: 'delete',
    label: 'Delete',
    variant: 'outline',
    disabled: false
  }
];
```

### Programmatic Control
```typescript
// Component reference
@ViewChild(CollapseComponent) collapse!: CollapseComponent;

// Control methods
expand() { this.collapse.expand(); }
collapse() { this.collapse.collapse(); }
toggle() { this.collapse.toggle(); }
```

## Accessibility Features

- **ARIA Support**: Proper `aria-expanded`, `aria-controls`, and `role` attributes
- **Keyboard Navigation**: Enter and Space key support for toggling
- **Focus Management**: Visible focus indicators and logical tab order
- **Screen Reader**: Descriptive labels and state announcements

## Styling and Theming

### CSS Custom Properties
```css
:root {
  --collapse-duration: 300ms;
  --collapse-easing: cubic-bezier(0.4, 0.0, 0.2, 1);
  --collapse-border-radius: 0.5rem;
  --collapse-backdrop-blur: 16px;
}
```

### Tailwind Classes
The components use Tailwind CSS classes that can be customized:
- `bg-gradient-to-br` - Glass-morphism gradients
- `backdrop-blur-xl` - Backdrop blur effects
- `border-border/20` - Border opacity variations
- `text-foreground` - Theme-aware text colors

## Performance Considerations

- **OnPush Change Detection**: All components use OnPush strategy
- **Signal-based State**: Reactive state management with Angular signals
- **Lazy Animations**: Animations only run when needed
- **Memory Management**: Proper subscription cleanup

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Backdrop Filter**: Graceful degradation for older browsers
- **CSS Grid/Flexbox**: Full support for layout features

## Integration Examples

### FAQ Section
```html
<app-collapse-group variant="minimal" groupLabel="FAQ">
  <app-collapse headerText="How do I get started?">
    <p>Follow our quick start guide...</p>
  </app-collapse>
  <!-- More FAQ items -->
</app-collapse-group>
```

### Project Showcase
```html
<app-collapsible-card
  title="Project Name"
  subtitle="Technology stack"
  [actions]="[
    { id: 'demo', label: 'Live Demo', variant: 'primary' },
    { id: 'code', label: 'Source', variant: 'outline' }
  ]">
  <div class="project-details">
    <!-- Project content -->
  </div>
</app-collapsible-card>
```

### Settings Panel
```html
<app-accordion
  variant="glass"
  [allowMultiple]="true"
  [items]="settingsGroups">
</app-accordion>
```

## Best Practices

1. **Content Organization**: Group related content logically
2. **Performance**: Use trackBy functions for dynamic lists
3. **Accessibility**: Always provide meaningful header text
4. **Animation**: Choose appropriate animation types for content
5. **Responsive**: Test on various screen sizes
6. **State Management**: Use signals for reactive updates

## Migration Guide

### From Basic HTML Details/Summary
```html
<!-- Before -->
<details>
  <summary>Click to expand</summary>
  <p>Content here</p>
</details>

<!-- After -->
<app-collapse headerText="Click to expand">
  <p>Content here</p>
</app-collapse>
```

### From Custom Accordion
Replace custom accordion implementations with the standardized components for better maintainability and accessibility.

## Troubleshooting

### Common Issues
1. **Animation not working**: Check if animations are enabled in browser
2. **Content not expanding**: Verify `expanded` signal binding
3. **Styling issues**: Ensure Tailwind CSS classes are available
4. **Accessibility warnings**: Check ARIA attributes and labels

### Debug Mode
Enable debug logging by setting the component's debug property:
```html
<app-collapse [debug]="true">
```

## Contributing

When extending the collapse library:
1. Follow the existing signal-based patterns
2. Maintain accessibility standards
3. Add comprehensive tests
4. Update documentation
5. Consider performance implications
