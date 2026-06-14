import { Component, input, signal, computed, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import {
  createFormVariants,
  formCompoundVariants,
  combineVariants,
} from '../util-performance/utils';

// Create input variants using shared variant system
const inputContainerVariants = createFormVariants('input-container');

const inputFieldVariants = combineVariants(createFormVariants('input'), formCompoundVariants);

// Generate TypeScript types from CVA variants
type InputVariants = VariantProps<typeof inputFieldVariants>;
export type InputVariant = InputVariants['variant'];
export type InputSize = InputVariants['size'];

@Component({
  selector: 'app-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="containerClasses()">
      @if (label()) {
        <label [for]="inputId()" class="input-label">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500 ml-1">*</span>
          }
        </label>
      }

      <div class="relative">
        @if (icon()) {
          <div class="input-icon-left">
            <span [innerHTML]="icon()"></span>
          </div>
        }

        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabledState()"
          [readonly]="readonly()"
          [class]="inputClasses()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />

        @if (clearable() && value()) {
          <button type="button" class="input-clear" (click)="clearValue()" aria-label="Clear input">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        }
      </div>

      @if (error()) {
        <p class="input-error">{{ error() }}</p>
      }

      @if (hint() && !error()) {
        <p class="input-hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .input-container {
        width: 100%;
      }

      .input-label {
        display: block;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        color: var(--color-foreground);
        margin-bottom: 0.5rem;
      }

      .input {
        width: 100%;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
      }
      .input:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--color-ring);
      }
      .input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .input::placeholder {
        color: var(--color-muted-foreground);
      }

      /* Size Styles */
      .input-sm {
        padding-inline: 0.75rem;
        padding-block: 0.375rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        border-radius: 0.375rem;
      }

      .input-md {
        padding-inline: 1rem;
        padding-block: 0.5rem;
        font-size: 1rem;
        line-height: 1.5rem;
        border-radius: 0.5rem;
      }

      .input-lg {
        padding-inline: 1.25rem;
        padding-block: 0.75rem;
        font-size: 1.125rem;
        line-height: 1.75rem;
        border-radius: var(--radius-xl);
      }

      /* Variant Styles */
      .input-default {
        background-color: var(--color-input);
        border: 1px solid var(--color-border);
        color: var(--color-foreground);
      }
      .input-default:focus {
        box-shadow: 0 0 0 2px var(--color-primary);
        border-color: var(--color-primary);
      }

      .input-glass {
        background-color: rgb(255 255 255 / 0.1);
        border: 1px solid rgb(255 255 255 / 0.2);
        color: #fff;
        backdrop-filter: blur(10px);
      }
      .input-glass:focus {
        box-shadow: 0 0 0 2px rgb(255 255 255 / 0.5);
        border-color: rgb(255 255 255 / 0.5);
      }

      .input-glass::placeholder {
        color: rgb(255 255 255 / 0.6);
      }

      .input-outline {
        background-color: transparent;
        border: 2px solid var(--color-border);
        color: var(--color-foreground);
      }
      .input-outline:focus {
        box-shadow: 0 0 0 2px var(--color-primary);
        border-color: var(--color-primary);
      }

      /* Icon Styles */
      .input-with-icon {
        padding-left: 2.5rem;
      }

      .input-with-icon.input-sm {
        padding-left: 2rem;
      }

      .input-with-icon.input-lg {
        padding-left: 3rem;
      }

      .input-icon-left {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-muted-foreground);
        pointer-events: none;
      }

      .input-icon-left svg {
        width: 1.25rem;
        height: 1.25rem;
      }

      /* Clear Button */
      .input-clear {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-muted-foreground);
        transition-property: color, background-color, border-color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
      }
      .input-clear:hover {
        color: var(--color-foreground);
      }

      /* Error State */
      .input-error-state {
        border-color: var(--color-red-500);
      }
      .input-error-state:focus {
        box-shadow: 0 0 0 2px var(--color-red-500);
        border-color: var(--color-red-500);
      }

      .input-error {
        color: var(--color-red-500);
        font-size: 0.875rem;
        line-height: 1.25rem;
        margin-top: 0.25rem;
      }

      .input-hint {
        color: var(--color-muted-foreground);
        font-size: 0.875rem;
        line-height: 1.25rem;
        margin-top: 0.25rem;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .input-lg {
          padding-inline: 1rem;
          padding-block: 0.625rem;
          font-size: 1rem;
          line-height: 1.5rem;
        }
      }
    `,
  ],
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly variant = input<InputVariant>('default');
  readonly size = input<InputSize>('md');
  readonly readonly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly clearable = input<boolean>(false);
  readonly icon = input<string>('');
  readonly error = input<string>('');
  readonly hint = input<string>('');

  // disabledState is a writable signal to support ControlValueAccessor's setDisabledState
  readonly disabledState = signal<boolean>(false);
  readonly value = signal<string>('');
  readonly inputId = signal(`input-${Math.random().toString(36).substr(2, 9)}`);

  private onChange = (value: string) => {};
  private onTouched = () => {};

  readonly containerClasses = computed(() => clsx(inputContainerVariants({})));

  readonly inputClasses = computed(() =>
    clsx(
      inputFieldVariants({
        variant: this.variant(),
        size: this.size(),
        hasIcon: !!this.icon(),
        hasError: !!this.error(),
      }),
    ),
  );

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  onBlur() {
    this.onTouched();
  }

  onFocus() {
    // Focus handling if needed
  }

  clearValue() {
    this.value.set('');
    this.onChange('');
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }
}
