import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Z_INDEX } from '../../styles/z-index';

export type GlassModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-glass-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        [style.zIndex]="Z.overlay"
        [ngClass]="backdropClass"
        (click)="onBackdropClick()"
      >
        <div
          #container
          class="bg-background/95 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl"
          [ngClass]="containerClasses"
          tabindex="-1"
          role="dialog"
          [attr.aria-modal]="true"
          [attr.aria-label]="ariaLabel || 'Modal dialog'"
          (click)="$event.stopPropagation()"
          (keydown)="onContainerKeydown($event)"

        >
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
})
export class GlassModalComponent implements OnChanges, OnInit, OnDestroy {
  @Input() open = false;
  @Input() size: GlassModalSize = 'xl';
  @Input() closeOnBackdrop = true;
  @Input() backdropClass?: string | string[] | Record<string, boolean>;
  @Input() containerClass?: string | string[] | Record<string, boolean>;
  @Input() ariaLabel?: string;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('container') containerRef?: ElementRef<HTMLDivElement>;

  // Expose z-index constants to template
  readonly Z = Z_INDEX;

  private placeholderNode?: Comment;
  private modalRoot?: HTMLElement;
  private movedToBody = false;

  private locked = false;
  private scrollY = 0;
  private previouslyFocused?: HTMLElement | null;
  private scrollX = 0;
  private htmlScrollBehaviorPrev?: string;

  private static openCount = 0;

  constructor(private elRef: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Move host to global modal root to escape any stacking contexts in parent components
    const host = this.elRef.nativeElement;
    const parent = host.parentNode as Node | null;
    if (!parent) return;

    // Create placeholder to preserve original position in DOM
    this.placeholderNode = this.renderer.createComment('app-glass-modal-anchor');
    this.renderer.insertBefore(parent, this.placeholderNode, host);

    // Ensure global modal root exists
    let modalRoot = document.getElementById('global-modal-root') as HTMLElement | null;
    if (!modalRoot) {
      modalRoot = this.renderer.createElement('div') as HTMLElement;
      modalRoot.id = 'global-modal-root';
      this.renderer.setStyle(modalRoot, 'position', 'relative');
      this.renderer.setStyle(modalRoot, 'zIndex', String(Z_INDEX.modal));
      this.renderer.appendChild(document.body, modalRoot);
    }
    this.modalRoot = modalRoot;

    // Move host under body-level root
    this.renderer.appendChild(modalRoot, host);
    this.movedToBody = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) {
        // Capture the previously focused element and lock body scroll
        this.previouslyFocused = document.activeElement as HTMLElement | null;
        this.lockBodyScroll();
        // Focus container when modal opens
        queueMicrotask(() => this.containerRef?.nativeElement.focus());
      } else {
        // Unlock body scroll and return focus to the previously focused element
        this.unlockBodyScroll();
        queueMicrotask(() => this.previouslyFocused?.focus?.());
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (!this.open) return;
    if (ev.key === 'Escape' || ev.key === 'Esc') {
      ev.preventDefault();
      this.requestClose();
    }
  }

  onBackdropClick() {
    if (!this.open) return;
    if (this.closeOnBackdrop) this.requestClose();
  }

  requestClose() {
    this.closed.emit();
  }

  get containerClasses() {
    const sizeClass = this.size === 'sm' ? 'max-w-md' :
      this.size === 'md' ? 'max-w-2xl' :
      this.size === 'lg' ? 'max-w-4xl' :
      this.size === 'xl' ? 'max-w-6xl' :
      'max-w-none';
    return [sizeClass, this.containerClass].filter(Boolean);
  }

  onContainerKeydown(e: KeyboardEvent) {
    if (!this.open) return;
    if (e.key !== 'Tab') return;

    const container = this.containerRef?.nativeElement;
    if (!container) return;

    const focusables = this.getFocusableElements(container);
    if (focusables.length === 0) {
      e.preventDefault();
      container.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = (document.activeElement as HTMLElement | null);
    const inside = !!active && container.contains(active);

    if (e.shiftKey) {
      // Shift+Tab from first (or when focus is outside) -> wrap to last
      if (!inside || active === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab from last (or when focus is outside) -> wrap to first
      if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  private getFocusableElements(root: HTMLElement): HTMLElement[] {
    const selectors = [
      'a[href]','area[href]','button:not([disabled])','input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])','textarea:not([disabled])','iframe','object','embed',
      '[tabindex]:not([tabindex="-1"])','[contenteditable="true"]'
    ].join(',');

    const nodes = Array.from(root.querySelectorAll<HTMLElement>(selectors));
    return nodes.filter(el => {
      const style = getComputedStyle(el);
      const visible = style.visibility !== 'hidden' && style.display !== 'none';
      const tabbable = el.tabIndex !== -1;
      return visible && tabbable && !el.hasAttribute('disabled');
    });
  }


  ngOnDestroy(): void {
    this.unlockBodyScroll();
    if (!this.movedToBody) return;
    const host = this.elRef.nativeElement;

    // Remove host from modal root to ensure it disappears when component is destroyed
    try {
      if (this.modalRoot && host.parentNode === this.modalRoot) {
        this.renderer.removeChild(this.modalRoot, host);
      } else if (host.parentNode) {
        host.parentNode.removeChild(host);
      }
    } catch {}

    // Clean up placeholder comment node
    const placeholderParent = this.placeholderNode?.parentNode;
    if (this.placeholderNode && placeholderParent) {
      try {
        this.renderer.removeChild(placeholderParent, this.placeholderNode);
      } catch {}
    }
  }
  private lockBodyScroll() {
    if (this.locked) return;
    this.locked = true;
    GlassModalComponent.openCount++;
    if (GlassModalComponent.openCount > 1) return;
    // First modal being opened — lock the body
    this.scrollY = window.scrollY || window.pageYOffset || 0;
    this.scrollX = window.scrollX || window.pageXOffset || 0;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${this.scrollY}px`;
    body.style.left = `-${this.scrollX}px`;
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
  }

  private unlockBodyScroll() {
    if (!this.locked) return;
    this.locked = false;
    GlassModalComponent.openCount = Math.max(0, GlassModalComponent.openCount - 1);
    if (GlassModalComponent.openCount > 0) return;
    // Last modal closed — restore the body
    const html = document.documentElement as HTMLElement;
    // Temporarily disable smooth scrolling so restore is instant
    this.htmlScrollBehaviorPrev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    const body = document.body;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    body.style.overflow = '';

    // Restore the scroll position synchronously
    window.scrollTo({ top: this.scrollY || 0, left: this.scrollX || 0, behavior: 'auto' });

    // Restore prior scroll-behavior on the next frame
    requestAnimationFrame(() => {
      html.style.scrollBehavior = this.htmlScrollBehaviorPrev ?? '';
    });
  }

}
