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
        class="fixed inset-0 flex items-center justify-center p-4 aurora-modal-backdrop"
        [style.zIndex]="Z.overlay"
        [ngClass]="backdropClass"
        (click)="onBackdropClick()"
      >
        <div
          #container
          class="aurora-modal-container w-full max-h-[85vh] overflow-y-auto p-6 md:p-8"
          [ngClass]="containerClasses"
          tabindex="-1"
          role="dialog"
          [attr.aria-modal]="true"
          [attr.aria-label]="ariaLabel || 'Modal dialog'"
          (click)="$event.stopPropagation()"
          (keydown)="onContainerKeydown($event)"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
  styles: [`
    /* Option 3: Ocean Blue Glass Modal - Premium Glassmorphism */
    .aurora-modal-backdrop {
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(24px) brightness(0.7);
      -webkit-backdrop-filter: blur(24px) brightness(0.7);
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .aurora-modal-container {
      /* Option 3: Ocean Blue Glass - Subtle blue gradient background */
      background: linear-gradient(135deg,
        rgba(74, 144, 255, 0.15),
        rgba(138, 43, 226, 0.10));

      /* Enhanced backdrop blur with saturation boost and brightness */
      backdrop-filter: blur(24px) saturate(180%) brightness(1.15);
      -webkit-backdrop-filter: blur(24px) saturate(180%) brightness(1.15);

      /* Luminous border with subtle blue tint */
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 1rem;

      /* Layered shadows for 3D depth with subtle blue glow */
      box-shadow:
        0 8px 40px rgba(0, 0, 0, 0.5),
        0 16px 80px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(74, 144, 255, 0.15),
        0 0 60px rgba(74, 144, 255, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);

      /* Smooth entrance animation */
      animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      /* Prepare for animated gradient overlay */
      position: relative;
      /* Removed overflow: hidden to allow scrolling - the overflow-y-auto class in template handles this */
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Option 3: Very Subtle Animated Gradient Overlay */
    .aurora-modal-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(120deg,
        rgba(74, 144, 255, 0.05),
        rgba(138, 43, 226, 0.03));
      background-size: 200% 200%;
      animation: moveGradient 15s ease infinite;
      pointer-events: none;
      opacity: 0.6;
      border-radius: inherit;
      z-index: 0;
    }

    /* Ensure content is above the gradient overlay */
    .aurora-modal-container > * {
      position: relative;
      z-index: 1;
    }

    @keyframes moveGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Custom scrollbar for modal content */
    .aurora-modal-container::-webkit-scrollbar {
      width: 8px;
    }

    .aurora-modal-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .aurora-modal-container::-webkit-scrollbar-thumb {
      background: rgba(74, 144, 255, 0.5);
      border-radius: 4px;
    }

    .aurora-modal-container::-webkit-scrollbar-thumb:hover {
      background: rgba(74, 144, 255, 0.7);
    }
  `],
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
