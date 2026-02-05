/**
 * IntervalManager - Utility for managing multiple setInterval handles
 *
 * Provides a centralized way to register and clear multiple intervals,
 * reducing boilerplate in service destroy() methods.
 *
 * Usage:
 * ```typescript
 * class MyService {
 *   private readonly intervals = new IntervalManager();
 *
 *   constructor() {
 *     this.intervals.register(window.setInterval(() => this.doSomething(), 1000));
 *     this.intervals.register(window.setInterval(() => this.doOther(), 5000));
 *   }
 *
 *   destroy(): void {
 *     this.intervals.clearAll();
 *   }
 * }
 * ```
 */
export class IntervalManager {
  private readonly intervals: (number | undefined)[] = [];

  /**
   * Register an interval ID for later cleanup
   * @param id - The interval ID returned by setInterval
   * @returns The same interval ID (for chaining)
   */
  register(id: number): number {
    this.intervals.push(id);
    return id;
  }

  /**
   * Clear all registered intervals and reset the internal list
   */
  clearAll(): void {
    this.intervals.forEach(id => {
      if (id !== undefined) {
        clearInterval(id);
      }
    });
    this.intervals.length = 0;
  }

  /**
   * Get the count of registered intervals
   */
  get count(): number {
    return this.intervals.length;
  }
}

