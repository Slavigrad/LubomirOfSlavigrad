/**
 * localStorage Configuration Utility
 * 
 * Provides consistent localStorage-based configuration loading and saving
 * for Angular signals. Replaces duplicated patterns in performance.service
 * and image-optimization.service.
 */

import { WritableSignal, Signal } from '@angular/core';

/**
 * Loads configuration from localStorage and merges it into a signal.
 * 
 * @param signal - The writable signal to update with loaded config
 * @param storageKey - The localStorage key to read from
 * @param logContext - Optional context string for warning messages
 * 
 * @example
 * private readonly _config = signal<Config>(DEFAULT_CONFIG);
 * 
 * constructor() {
 *   loadSignalConfig(this._config, 'my-config', 'My Service');
 * }
 */
export function loadSignalConfig<T extends object>(
  signal: WritableSignal<T>,
  storageKey: string,
  logContext?: string
): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return;
  }

  try {
    const config = JSON.parse(saved) as Partial<T>;
    signal.set({ ...signal(), ...config });
  } catch (error) {
    const context = logContext ? `${logContext} ` : '';
    console.warn(`Failed to load ${context}configuration:`, error);
  }
}

/**
 * Saves a signal's current value to localStorage.
 * 
 * @param signal - The signal to read from (can be writable or readonly)
 * @param storageKey - The localStorage key to write to
 * 
 * @example
 * effect(() => {
 *   saveSignalConfig(this._config, 'my-config');
 * });
 */
export function saveSignalConfig<T>(
  signal: Signal<T> | WritableSignal<T>,
  storageKey: string
): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(signal()));
}

