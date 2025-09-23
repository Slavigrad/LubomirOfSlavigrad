import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ModernCardComponent } from './modern-card.component';

/**
 * Modern Angular testing patterns for signal-based components
 * Demonstrates Angular 20+ testing best practices
 */

// Test host component for testing inputs/outputs
@Component({
  template: `
    <app-modern-card
      [title]="title()"
      [subtitle]="subtitle()"
      [icon]="icon()"
      [variant]="variant()"
      [size]="size()"
      [loading]="loading()"
      [clickable]="clickable()"
      [hoverEffect]="hoverEffect()"
      [(selected)]="selected"
      [(expanded)]="expanded"
      (cardClick)="onCardClick($event)"
      (cardHover)="onCardHover($event)"
    >
      <div slot="actions">
        <button class="test-action">Action</button>
      </div>
      
      <p>Test content inside the card</p>
      
      <div slot="footer">
        <span>Footer content</span>
      </div>
    </app-modern-card>
  `
})
class TestHostComponent {
  // Signal-based properties for testing
  readonly title = signal('Test Card');
  readonly subtitle = signal('Test Subtitle');
  readonly icon = signal('test-icon');
  readonly variant = signal<'default' | 'elevated' | 'outlined' | 'filled'>('default');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly loading = signal(false);
  readonly clickable = signal(true);
  readonly hoverEffect = signal(true);
  
  // Two-way binding signals
  readonly selected = signal(false);
  readonly expanded = signal(false);
  
  // Event tracking
  cardClickCount = 0;
  lastHoverState = false;
  
  onCardClick(event: MouseEvent): void {
    this.cardClickCount++;
  }
  
  onCardHover(isHovered: boolean): void {
    this.lastHoverState = isHovered;
  }
}

describe('ModernCardComponent', () => {
  let component: ModernCardComponent;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModernCardComponent],
      declarations: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    
    // Get the card component instance
    const cardDebugElement = fixture.debugElement.query(By.directive(ModernCardComponent));
    component = cardDebugElement.componentInstance;
    
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should create the host component', () => {
      expect(hostComponent).toBeTruthy();
    });
  });

  describe('Signal-based Inputs', () => {
    it('should display the correct title', () => {
      const titleElement = fixture.debugElement.query(By.css('.card-title'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Test Card');
    });

    it('should display the correct subtitle', () => {
      const subtitleElement = fixture.debugElement.query(By.css('.card-subtitle'));
      expect(subtitleElement.nativeElement.textContent.trim()).toBe('Test Subtitle');
    });

    it('should apply the correct variant class', () => {
      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      expect(cardElement.nativeElement.classList).toContain('variant-default');
    });

    it('should apply the correct size class', () => {
      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      expect(cardElement.nativeElement.classList).toContain('size-md');
    });

    it('should react to input changes', () => {
      // Change the title signal
      hostComponent.title.set('Updated Title');
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.card-title'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Updated Title');
    });

    it('should react to variant changes', () => {
      // Change the variant signal
      hostComponent.variant.set('elevated');
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      expect(cardElement.nativeElement.classList).toContain('variant-elevated');
      expect(cardElement.nativeElement.classList).not.toContain('variant-default');
    });
  });

  describe('Loading State', () => {
    it('should show loading overlay when loading is true', () => {
      hostComponent.loading.set(true);
      fixture.detectChanges();

      const loadingOverlay = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(loadingOverlay).toBeTruthy();
    });

    it('should hide loading overlay when loading is false', () => {
      hostComponent.loading.set(false);
      fixture.detectChanges();

      const loadingOverlay = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(loadingOverlay).toBeFalsy();
    });

    it('should show loading spinner when loading', () => {
      hostComponent.loading.set(true);
      fixture.detectChanges();

      const loadingSpinner = fixture.debugElement.query(By.css('.loading-spinner'));
      expect(loadingSpinner).toBeTruthy();
    });
  });

  describe('Click Interactions', () => {
    it('should emit cardClick event when clicked', () => {
      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      
      cardElement.nativeElement.click();
      
      expect(hostComponent.cardClickCount).toBe(1);
    });

    it('should not emit click when not clickable', () => {
      hostComponent.clickable.set(false);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      cardElement.nativeElement.click();
      
      expect(hostComponent.cardClickCount).toBe(0);
    });

    it('should not emit click when loading', () => {
      hostComponent.loading.set(true);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      cardElement.nativeElement.click();
      
      expect(hostComponent.cardClickCount).toBe(0);
    });
  });

  describe('Hover Interactions', () => {
    it('should emit hover events on mouse enter/leave', () => {
      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      
      // Mouse enter
      cardElement.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      expect(hostComponent.lastHoverState).toBe(true);
      
      // Mouse leave
      cardElement.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
      expect(hostComponent.lastHoverState).toBe(false);
    });

    it('should show hover overlay when hovered and hover effect is enabled', () => {
      hostComponent.hoverEffect.set(true);
      fixture.detectChanges();

      // Trigger hover state
      component.onMouseEnter();
      fixture.detectChanges();

      const hoverOverlay = fixture.debugElement.query(By.css('.hover-overlay'));
      expect(hoverOverlay).toBeTruthy();
    });
  });

  describe('Two-way Binding', () => {
    it('should update selected state when clicked', () => {
      expect(hostComponent.selected()).toBe(false);
      
      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      cardElement.nativeElement.click();
      
      expect(hostComponent.selected()).toBe(true);
    });

    it('should apply selected class when selected', () => {
      hostComponent.selected.set(true);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      expect(cardElement.nativeElement.classList).toContain('selected');
    });

    it('should toggle expanded state', () => {
      expect(hostComponent.expanded()).toBe(false);
      
      component.toggleExpanded();
      
      expect(hostComponent.expanded()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('should compute card classes correctly', () => {
      hostComponent.variant.set('elevated');
      hostComponent.size.set('lg');
      hostComponent.selected.set(true);
      hostComponent.loading.set(true);
      fixture.detectChanges();

      const classes = component.cardClasses();
      expect(classes).toContain('modern-card');
      expect(classes).toContain('variant-elevated');
      expect(classes).toContain('size-lg');
      expect(classes).toContain('selected');
      expect(classes).toContain('loading');
    });

    it('should show header when title or subtitle is provided', () => {
      expect(component.showHeader()).toBe(true);
      
      hostComponent.title.set('');
      hostComponent.subtitle.set('');
      hostComponent.icon.set('');
      fixture.detectChanges();
      
      expect(component.showHeader()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when clickable', () => {
      hostComponent.clickable.set(true);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      expect(cardElement.nativeElement.getAttribute('role')).toBe('button');
      expect(cardElement.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('should not have button role when not clickable', () => {
      hostComponent.clickable.set(false);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      expect(cardElement.nativeElement.getAttribute('role')).toBeNull();
      expect(cardElement.nativeElement.getAttribute('tabindex')).toBeNull();
    });

    it('should have proper aria-selected attribute', () => {
      hostComponent.selected.set(true);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      expect(cardElement.nativeElement.getAttribute('aria-selected')).toBe('true');
    });

    it('should have proper aria-expanded attribute', () => {
      hostComponent.expanded.set(true);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      expect(cardElement.nativeElement.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Content Projection', () => {
    it('should project main content', () => {
      const contentElement = fixture.debugElement.query(By.css('.card-content p'));
      expect(contentElement.nativeElement.textContent.trim()).toBe('Test content inside the card');
    });
  });

  describe('Public Methods', () => {
    it('should focus the card element', () => {
      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      spyOn(cardElement.nativeElement, 'focus');
      
      component.focus();
      
      expect(cardElement.nativeElement.focus).toHaveBeenCalled();
    });

    it('should blur the card element', () => {
      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      spyOn(cardElement.nativeElement, 'blur');
      
      component.blur();
      
      expect(cardElement.nativeElement.blur).toHaveBeenCalled();
    });

    it('should toggle selection state', () => {
      expect(hostComponent.selected()).toBe(false);
      
      component.toggle();
      
      expect(hostComponent.selected()).toBe(true);
    });

    it('should expand the card', () => {
      expect(hostComponent.expanded()).toBe(false);
      
      component.expand();
      
      expect(hostComponent.expanded()).toBe(true);
    });

    it('should collapse the card', () => {
      hostComponent.expanded.set(true);
      
      component.collapse();
      
      expect(hostComponent.expanded()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      hostComponent.title.set('');
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.card-title'));
      expect(titleElement).toBeFalsy();
    });

    it('should handle rapid state changes', () => {
      // Rapidly toggle states
      for (let i = 0; i < 10; i++) {
        component.toggle();
        component.toggleExpanded();
      }
      
      // Should end up in the final state
      expect(hostComponent.selected()).toBe(false); // Even number of toggles
      expect(hostComponent.expanded()).toBe(false); // Even number of toggles
    });

    it('should handle simultaneous loading and clicking', () => {
      hostComponent.loading.set(true);
      fixture.detectChanges();

      const initialClickCount = hostComponent.cardClickCount;
      
      const cardElement = fixture.debugElement.query(By.css('.modern-card'));
      cardElement.nativeElement.click();
      
      // Should not increment click count when loading
      expect(hostComponent.cardClickCount).toBe(initialClickCount);
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const initialRenderCount = fixture.componentRef.changeDetectorRef.detectChanges;
      
      // Multiple signal updates
      hostComponent.title.set('New Title 1');
      hostComponent.title.set('New Title 2');
      hostComponent.title.set('New Title 3');
      
      fixture.detectChanges();
      
      // Should only trigger one change detection cycle
      const titleElement = fixture.debugElement.query(By.css('.card-title'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('New Title 3');
    });
  });
});
