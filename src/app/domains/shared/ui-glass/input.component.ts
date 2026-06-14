import { Component, input, signal, computed, forwardRef } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [TranslatePipe],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
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
