import { Component, Input, signal, computed, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { createFormVariants, formCompoundVariants, combineVariants } from '../../utils';

// Create input variants using shared variant system
const inputContainerVariants = createFormVariants('input-container');

const inputFieldVariants = combineVariants(
  createFormVariants('input'),
  formCompoundVariants
);

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
      multi: true
    }
  ],
  template: `
    <div [class]="containerClasses()">
      @if (label) {
        <label [for]="inputId()" class="input-label">
          {{ label }}
          @if (required) {
            <span class="text-red-500 ml-1">*</span>
          }
        </label>
      }

      <div class="relative">
        @if (icon) {
          <div class="input-icon-left">
            <span [innerHTML]="icon"></span>
          </div>
        }

        <input
          [id]="inputId()"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [class]="inputClasses()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />

        @if (clearable && value()) {
          <button
            type="button"
            class="input-clear"
            (click)="clearValue()"
            aria-label="Clear input"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        }
      </div>

      @if (error) {
        <p class="input-error">{{ error }}</p>
      }

      @if (hint && !error) {
        <p class="input-hint">{{ hint }}</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .input-container {
      @apply w-full;
    }

    .input-label {
      @apply block text-sm font-medium text-foreground mb-2;
    }

    .input {
      @apply w-full transition-all duration-200;
      @apply focus:outline-none focus:ring-2 focus:ring-offset-0;
      @apply disabled:opacity-50 disabled:cursor-not-allowed;
      @apply placeholder:text-muted-foreground;
    }

    /* Size Styles */
    .input-sm {
      @apply px-3 py-1.5 text-sm rounded-md;
    }

    .input-md {
      @apply px-4 py-2 text-base rounded-lg;
    }

    .input-lg {
      @apply px-5 py-3 text-lg rounded-xl;
    }

    /* Variant Styles */
    .input-default {
      @apply bg-input border border-border text-foreground;
      @apply focus:ring-primary focus:border-primary;
    }

    .input-glass {
      @apply bg-white/10 border border-white/20 text-white;
      @apply focus:ring-white/50 focus:border-white/50;
      backdrop-filter: blur(10px);
    }

    .input-glass::placeholder {
      @apply text-white/60;
    }

    .input-outline {
      @apply bg-transparent border-2 border-border text-foreground;
      @apply focus:ring-primary focus:border-primary;
    }

    /* Icon Styles */
    .input-with-icon {
      @apply pl-10;
    }

    .input-with-icon.input-sm {
      @apply pl-8;
    }

    .input-with-icon.input-lg {
      @apply pl-12;
    }

    .input-icon-left {
      @apply absolute left-3 top-1/2 transform -translate-y-1/2;
      @apply text-muted-foreground pointer-events-none;
    }

    .input-icon-left svg {
      @apply w-5 h-5;
    }

    /* Clear Button */
    .input-clear {
      @apply absolute right-3 top-1/2 transform -translate-y-1/2;
      @apply text-muted-foreground hover:text-foreground;
      @apply transition-colors duration-200;
    }

    /* Error State */
    .input-error-state {
      @apply border-red-500 focus:ring-red-500 focus:border-red-500;
    }

    .input-error {
      @apply text-red-500 text-sm mt-1;
    }

    .input-hint {
      @apply text-muted-foreground text-sm mt-1;
    }

    /* Focus States */
    .input:focus {
      @apply ring-2;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .input-lg {
        @apply px-4 py-2.5 text-base;
      }
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() variant: InputVariant = 'default';
  @Input() size: InputSize = 'md';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() clearable: boolean = false;
  @Input() icon: string = '';
  @Input() error: string = '';
  @Input() hint: string = '';

  readonly value = signal<string>('');
  readonly inputId = signal(`input-${Math.random().toString(36).substr(2, 9)}`);

  private onChange = (value: string) => {};
  private onTouched = () => {};

  readonly containerClasses = computed(() =>
    clsx(
      inputContainerVariants({})
    )
  );

  readonly inputClasses = computed(() =>
    clsx(
      inputFieldVariants({
        variant: this.variant,
        size: this.size,
        hasIcon: !!this.icon,
        hasError: !!this.error
      })
    )
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
    this.disabled = isDisabled;
  }
}
