import { Injectable, ElementRef, signal, Directive, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

export interface AnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export interface ScrollAnimationConfig {
  element: ElementRef;
  animation: string;
  options?: AnimationOptions;
}

export interface InteractiveAnimationConfig {
  element: ElementRef;
  trigger: 'hover' | 'click' | 'focus';
  animation: string;
  options?: AnimationOptions;
}

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private observers = new Map<Element, IntersectionObserver>();
  private animatedElements = new Set<Element>();
  private interactiveElements = new Map<Element, () => void>();

  /**
   * Animate element when it enters viewport
   */
  animateOnScroll(config: ScrollAnimationConfig): void {
    const { element, animation, options = {} } = config;
    const {
      threshold = 0.1,
      rootMargin = '0px',
      once = true,
      delay = 0,
      duration = 600
    } = options;

    const target = element.nativeElement;
    if (!target) return;

    // Set initial state
    target.style.opacity = '0';
    target.style.transform = this.getInitialTransform(animation);
    target.style.transition = `all ${duration}ms ease-out`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              this.applyAnimation(target, animation);

              if (once) {
                observer.unobserve(target);
                this.observers.delete(target);
              }

              this.animatedElements.add(target);
            }, delay);
          } else if (!once && this.animatedElements.has(target)) {
            // Reset animation if not 'once' and element is out of view
            target.style.opacity = '0';
            target.style.transform = this.getInitialTransform(animation);
            this.animatedElements.delete(target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(target);
    this.observers.set(target, observer);
  }

  /**
   * Remove animation observer
   */
  removeAnimation(element: ElementRef): void {
    const target = element.nativeElement;
    if (!target) return;

    const observer = this.observers.get(target);
    if (observer) {
      observer.unobserve(target);
      this.observers.delete(target);
    }

    this.animatedElements.delete(target);
  }

  /**
   * Add interactive animation (hover, click, focus)
   */
  addInteractiveAnimation(config: InteractiveAnimationConfig): void {
    const { element, trigger, animation, options = {} } = config;
    const target = element.nativeElement;
    if (!target) return;

    const cleanup = () => {
      target.classList.remove(`${trigger}-${animation}`);
    };

    switch (trigger) {
      case 'hover':
        target.addEventListener('mouseenter', () => {
          target.classList.add(`hover-${animation}`);
        });
        target.addEventListener('mouseleave', () => {
          target.classList.remove(`hover-${animation}`);
        });
        break;

      case 'click':
        target.addEventListener('click', () => {
          target.classList.add(`click-${animation}`);
          setTimeout(() => {
            target.classList.remove(`click-${animation}`);
          }, options.duration || 300);
        });
        break;

      case 'focus':
        target.addEventListener('focus', () => {
          target.classList.add(`focus-${animation}`);
        });
        target.addEventListener('blur', () => {
          target.classList.remove(`focus-${animation}`);
        });
        break;
    }

    this.interactiveElements.set(target, cleanup);
  }

  /**
   * Apply hover animation (legacy method for backward compatibility)
   */
  addHoverAnimation(element: ElementRef, animation: string): void {
    this.addInteractiveAnimation({
      element,
      trigger: 'hover',
      animation
    });
  }

  /**
   * Animate elements with stagger effect
   */
  animateWithStagger(elements: ElementRef[], animation: string, staggerDelay: number = 100): void {
    elements.forEach((element, index) => {
      this.animateOnScroll({
        element,
        animation,
        options: {
          delay: index * staggerDelay,
          once: true
        }
      });
    });
  }

  /**
   * Stagger animations for multiple elements
   */
  staggerAnimation(elements: ElementRef[], animation: string, staggerDelay: number = 100): void {
    elements.forEach((element, index) => {
      this.animateOnScroll({
        element,
        animation,
        options: {
          delay: index * staggerDelay,
          once: true
        }
      });
    });
  }

  /**
   * Get initial transform for animation type
   */
  private getInitialTransform(animation: string): string {
    switch (animation) {
      case 'fadeInUp':
        return 'translateY(30px)';
      case 'fadeInDown':
        return 'translateY(-30px)';
      case 'fadeInLeft':
        return 'translateX(-30px)';
      case 'fadeInRight':
        return 'translateX(30px)';
      case 'scaleIn':
        return 'scale(0.8)';
      case 'rotateIn':
        return 'rotate(-10deg) scale(0.8)';
      case 'slideInUp':
        return 'translateY(50px)';
      case 'slideInDown':
        return 'translateY(-50px)';
      case 'zoomIn':
        return 'scale(0.5)';
      default:
        return 'translateY(20px)';
    }
  }

  /**
   * Apply animation to element
   */
  private applyAnimation(element: HTMLElement, animation: string): void {
    element.style.opacity = '1';
    element.style.transform = 'translateX(0) translateY(0) scale(1) rotate(0)';

    // Add animation class for additional effects
    element.classList.add(`animate-${animation}`);

    // Remove animation class after animation completes
    setTimeout(() => {
      element.classList.remove(`animate-${animation}`);
    }, 600);
  }

  /**
   * Remove interactive animation
   */
  removeInteractiveAnimation(element: ElementRef): void {
    const target = element.nativeElement;
    if (!target) return;

    const cleanup = this.interactiveElements.get(target);
    if (cleanup) {
      cleanup();
      this.interactiveElements.delete(target);
    }
  }

  /**
   * Cleanup all observers and interactive elements
   */
  cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.animatedElements.clear();

    this.interactiveElements.forEach((cleanup) => {
      cleanup();
    });
    this.interactiveElements.clear();
  }
}

/**
 * Animation directive for easy use in templates
 */
export function useScrollAnimation(
  element: ElementRef,
  animation: string,
  options?: AnimationOptions
) {
  const animationService = new AnimationService();

  return {
    init: () => {
      animationService.animateOnScroll({
        element,
        animation,
        options
      });
    },
    destroy: () => {
      animationService.removeAnimation(element);
    }
  };
}

/**
 * Scroll Animation Directive
 */
@Directive({
  selector: '[appScrollAnimate]',
  standalone: true
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() appScrollAnimate: string = 'fadeInUp';
  @Input() animationDelay: number = 0;
  @Input() animationThreshold: number = 0.1;
  @Input() animationOnce: boolean = true;

  private animationService = new AnimationService();

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.animationService.animateOnScroll({
      element: this.elementRef,
      animation: this.appScrollAnimate,
      options: {
        delay: this.animationDelay,
        threshold: this.animationThreshold,
        once: this.animationOnce
      }
    });
  }

  ngOnDestroy() {
    this.animationService.removeAnimation(this.elementRef);
  }
}

/**
 * Interactive Animation Directive
 */
@Directive({
  selector: '[appInteractiveAnimate]',
  standalone: true
})
export class InteractiveAnimateDirective implements OnInit, OnDestroy {
  @Input() appInteractiveAnimate: string = 'lift';
  @Input() animationTrigger: 'hover' | 'click' | 'focus' = 'hover';
  @Input() animationDuration: number = 300;

  private animationService = new AnimationService();

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.animationService.addInteractiveAnimation({
      element: this.elementRef,
      trigger: this.animationTrigger,
      animation: this.appInteractiveAnimate,
      options: {
        duration: this.animationDuration
      }
    });
  }

  ngOnDestroy() {
    this.animationService.removeInteractiveAnimation(this.elementRef);
  }
}

/**
 * CSS Animation Classes
 * These should be added to your global styles
 */
export const ANIMATION_STYLES = `
  /* Fade Animations */
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-fadeInDown {
    animation: fadeInDown 0.6s ease-out forwards;
  }

  .animate-fadeInLeft {
    animation: fadeInLeft 0.6s ease-out forwards;
  }

  .animate-fadeInRight {
    animation: fadeInRight 0.6s ease-out forwards;
  }

  /* Scale Animations */
  .animate-scaleIn {
    animation: scaleIn 0.6s ease-out forwards;
  }

  .animate-zoomIn {
    animation: zoomIn 0.6s ease-out forwards;
  }

  /* Slide Animations */
  .animate-slideInUp {
    animation: slideInUp 0.6s ease-out forwards;
  }

  .animate-slideInDown {
    animation: slideInDown 0.6s ease-out forwards;
  }

  /* Rotate Animations */
  .animate-rotateIn {
    animation: rotateIn 0.6s ease-out forwards;
  }

  /* Interactive Animations */
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .hover-scale {
    transition: transform 0.3s ease;
  }

  .hover-scale:hover {
    transform: scale(1.05);
  }

  .hover-glow {
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }

  .hover-glow:hover {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    transform: translateY(-2px);
  }

  .hover-bounce {
    transition: transform 0.3s ease;
  }

  .hover-bounce:hover {
    animation: bounce 0.6s ease;
  }

  .hover-pulse {
    transition: transform 0.3s ease;
  }

  .hover-pulse:hover {
    animation: pulse 1s ease infinite;
  }

  .hover-rotate {
    transition: transform 0.3s ease;
  }

  .hover-rotate:hover {
    transform: rotate(5deg);
  }

  .hover-flip {
    transition: transform 0.6s ease;
    transform-style: preserve-3d;
  }

  .hover-flip:hover {
    transform: rotateY(180deg);
  }

  /* Click Animations */
  .click-ripple {
    position: relative;
    overflow: hidden;
  }

  .click-ripple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }

  .click-ripple:active::after {
    width: 200px;
    height: 200px;
  }

  .click-scale {
    transition: transform 0.1s ease;
  }

  .click-scale:active {
    transform: scale(0.95);
  }

  /* Focus Animations */
  .focus-glow:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .focus-scale:focus {
    transform: scale(1.02);
  }

  /* Keyframes */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes rotateIn {
    from {
      opacity: 0;
      transform: rotate(-10deg) scale(0.8);
    }
    to {
      opacity: 1;
      transform: rotate(0) scale(1);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translateY(0);
    }
    40%, 43% {
      transform: translateY(-15px);
    }
    70% {
      transform: translateY(-7px);
    }
    90% {
      transform: translateY(-3px);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(5px);
    }
  }

  @keyframes wobble {
    0% {
      transform: translateX(0%);
    }
    15% {
      transform: translateX(-25%) rotate(-5deg);
    }
    30% {
      transform: translateX(20%) rotate(3deg);
    }
    45% {
      transform: translateX(-15%) rotate(-3deg);
    }
    60% {
      transform: translateX(10%) rotate(2deg);
    }
    75% {
      transform: translateX(-5%) rotate(-1deg);
    }
    100% {
      transform: translateX(0%);
    }
  }
`;
