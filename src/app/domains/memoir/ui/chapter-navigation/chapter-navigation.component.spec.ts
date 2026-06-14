import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ChapterNavigationComponent, NavigationChapter } from './chapter-navigation.component';

describe('ChapterNavigationComponent', () => {
  let component: ChapterNavigationComponent;
  let fixture: ComponentFixture<ChapterNavigationComponent>;
  let markForCheckSpy: ReturnType<typeof vi.spyOn>;

  const mockChapters: NavigationChapter[] = [
    { id: 'chapter-1', title: 'First Chapter', number: 1 },
    { id: 'chapter-2', title: 'Second Chapter', number: 2 },
    { id: 'chapter-3', title: 'Third Chapter', number: 3 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterNavigationComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChapterNavigationComponent);
    component = fixture.componentInstance;
    markForCheckSpy = vi.spyOn(component['cdr'] as any, 'markForCheck');
    fixture.componentRef.setInput('chapters', mockChapters);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Navigation Click Behavior', () => {
    it('should update activeChapterId immediately on click', () => {
      // Arrange
      const chapterId = 'chapter-2';
      const mockEvent = new Event('click');

      // Create a mock element
      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      // Act
      component.onNavClick(mockEvent, chapterId);

      // Assert
      expect(component.activeChapterId()).toBe(chapterId);
      expect(markForCheckSpy).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(mockElement);
    });

    it('should call markForCheck to trigger change detection with OnPush strategy', () => {
      // Arrange
      const chapterId = 'chapter-1';
      const mockEvent = new Event('click');

      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      // Act
      component.onNavClick(mockEvent, chapterId);

      // Assert - This is the fix for the two-click bug
      expect(markForCheckSpy).toHaveBeenCalledTimes(1);

      // Cleanup
      document.body.removeChild(mockElement);
    });

    it('should update lastActiveId when clicking a chapter', () => {
      // Arrange
      const chapterId = 'chapter-3';
      const mockEvent = new Event('click');

      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      // Act
      component.onNavClick(mockEvent, chapterId);

      // Assert
      expect(component['lastActiveId']).toBe(chapterId);

      // Cleanup
      document.body.removeChild(mockElement);
    });

    it('should call scrollIntoView with smooth behavior', () => {
      // Arrange
      const chapterId = 'chapter-2';
      const mockEvent = new Event('click');

      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      // Act
      component.onNavClick(mockEvent, chapterId);

      // Assert
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });

      // Cleanup
      document.body.removeChild(mockElement);
    });

    it('should prevent default event behavior', () => {
      // Arrange
      const chapterId = 'chapter-1';
      const mockEvent = new Event('click');
      vi.spyOn(mockEvent, 'preventDefault');

      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      // Act
      component.onNavClick(mockEvent, chapterId);

      // Assert
      expect(mockEvent.preventDefault).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(mockElement);
    });

    it('should not proceed if element is not found', () => {
      // Arrange
      const chapterId = 'non-existent-chapter';
      const mockEvent = new Event('click');
      const initialActiveId = component.activeChapterId();

      // Act
      component.onNavClick(mockEvent, chapterId);

      // Assert - activeChapterId should not change
      expect(component.activeChapterId()).toBe(initialActiveId);
    });
  });

  describe('Visual State Update', () => {
    it('should apply active class to the clicked chapter immediately', () => {
      // Arrange
      const chapterId = 'chapter-2';
      const mockEvent = new Event('click');

      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      // Act
      component.onNavClick(mockEvent, chapterId);
      fixture.detectChanges(); // Trigger change detection

      // Assert
      const navLinks = fixture.nativeElement.querySelectorAll('.chapter-nav-link');
      const activeLink = Array.from(navLinks).find((link: any) =>
        link.classList.contains('active'),
      );

      expect(activeLink).toBeTruthy();

      // Cleanup
      document.body.removeChild(mockElement);
    });
  });

  describe('URL Management', () => {
    it('should update URL with fragment identifier', () => {
      // Arrange
      const chapterId = 'chapter-2';
      const mockEvent = new Event('click');

      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

      // Act
      component.onNavClick(mockEvent, chapterId);

      // Assert
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        expect.stringContaining(`#${chapterId}`),
      );

      // Cleanup
      document.body.removeChild(mockElement);
    });
  });

  describe('hrefFor method', () => {
    it('should generate correct href with current path and fragment', () => {
      // Arrange
      const chapterId = 'chapter-1';
      const currentPath = window.location.pathname;

      // Act
      const href = component.hrefFor(chapterId);

      // Assert
      expect(href).toBe(`${currentPath}#${chapterId}`);
    });
  });

  describe('trackById method', () => {
    it('should return chapter id for tracking', () => {
      // Arrange
      const chapter = mockChapters[0];

      // Act
      const result = component.trackById(0, chapter);

      // Assert
      expect(result).toBe(chapter.id);
    });
  });

  describe('Race Condition Prevention', () => {
    it('should disable scroll listener during programmatic navigation', () => {
      // Arrange
      const chapterId = 'chapter-2';
      const mockEvent = new Event('click');

      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      // Act
      component.onNavClick(mockEvent, chapterId);

      // Assert - isProgrammaticScroll should be true during navigation
      expect(component['isProgrammaticScroll']).toBe(true);

      // Cleanup
      document.body.removeChild(mockElement);
    });

    it('should re-enable scroll listener after timeout', () => {
      vi.useFakeTimers();

      const chapterId = 'chapter-2';
      const mockEvent = new Event('click');

      const mockElement = document.createElement('div');
      mockElement.id = chapterId;
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);

      component.onNavClick(mockEvent, chapterId);
      expect(component['isProgrammaticScroll']).toBe(true);

      vi.advanceTimersByTime(1100);

      expect(component['isProgrammaticScroll']).toBe(false);
      document.body.removeChild(mockElement);

      vi.useRealTimers();
    });

    it('should ignore scroll events during programmatic navigation', () => {
      // Arrange
      component['isProgrammaticScroll'] = true;
      vi.spyOn(component as any, 'updateActiveChapter');

      // Act
      component.onScroll();

      // Assert - updateActiveChapter should not be called
      expect(component['updateActiveChapter']).not.toHaveBeenCalled();
    });

    it('should process scroll events when not in programmatic navigation', () => {
      vi.useFakeTimers();

      component['isProgrammaticScroll'] = false;
      vi.spyOn(component as any, 'updateActiveChapter');

      component.onScroll();

      vi.advanceTimersByTime(16);

      expect(component['updateActiveChapter']).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
