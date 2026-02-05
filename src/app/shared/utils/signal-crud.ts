/**
 * Signal-CRUD Utility
 * 
 * Provides generic CRUD operations for Angular WritableSignal arrays.
 * Eliminates duplicate add/update/delete patterns across entity types.
 */

import { WritableSignal } from '@angular/core';
import { generateId } from './id-generator';

/**
 * Base interface for entities managed by signal-CRUD.
 * Entities must have id, and optionally createdAt/updatedAt fields.
 */
export interface CrudEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Notification callback type for CRUD operations.
 */
export type CrudNotifyFn<T> = (
  action: 'create' | 'update' | 'delete',
  entityType: string,
  oldValue: T | null,
  newValue: T | null
) => void;

/**
 * CRUD operations interface returned by createSignalCrud.
 */
export interface SignalCrudOps<T extends CrudEntity> {
  add(input: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T;
  update(id: string, updates: Partial<T>): void;
  delete(id: string): void;
}

/**
 * Creates a set of CRUD operations for a signal-based entity array.
 * 
 * @param signal - The WritableSignal holding the entity array
 * @param prefix - ID prefix for new entities (e.g., 'exp', 'proj', 'skill')
 * @param notifyFn - Callback function for change notifications
 * @param entityType - Type name for notifications (e.g., 'experience', 'project')
 * @returns Object with add, update, and delete methods
 * 
 * @example
 * ```typescript
 * const experienceCrud = createSignalCrud(
 *   this._experiences,
 *   'exp',
 *   this.notifyDataChange.bind(this),
 *   'experience'
 * );
 * 
 * // Add new experience
 * experienceCrud.add({ company: 'Acme', positions: [] });
 * 
 * // Update experience
 * experienceCrud.update('exp-123', { company: 'Updated Acme' });
 * 
 * // Delete experience
 * experienceCrud.delete('exp-123');
 * ```
 */
export function createSignalCrud<T extends CrudEntity>(
  signal: WritableSignal<T[]>,
  prefix: string,
  notifyFn: CrudNotifyFn<T>,
  entityType: string
): SignalCrudOps<T> {
  return {
    add(input: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
      const newItem = {
        ...input,
        id: generateId(prefix),
        createdAt: new Date(),
        updatedAt: new Date()
      } as T;

      const current = signal();
      signal.set([...current, newItem]);
      notifyFn('create', entityType, null, newItem);
      
      return newItem;
    },

    update(id: string, updates: Partial<T>): void {
      const current = signal();
      const index = current.findIndex(item => item.id === id);

      if (index === -1) return;

      const oldItem = current[index];
      const updatedItem = {
        ...oldItem,
        ...updates,
        updatedAt: new Date()
      } as T;

      const newArray = [...current];
      newArray[index] = updatedItem;

      signal.set(newArray);
      notifyFn('update', entityType, oldItem, updatedItem);
    },

    delete(id: string): void {
      const current = signal();
      const item = current.find(item => item.id === id);

      if (!item) return;

      const filtered = current.filter(item => item.id !== id);
      signal.set(filtered);
      notifyFn('delete', entityType, item, null);
    }
  };
}

