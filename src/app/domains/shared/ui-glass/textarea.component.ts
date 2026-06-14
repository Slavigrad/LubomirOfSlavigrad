import {
  Component,
  input,
  signal,
  computed,
  forwardRef,
  ElementRef,
  viewChild,
  AfterViewInit,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import {
  createFormVariants,
  formCompoundVariants,
  combineVariants,
} from '../util-performance/utils';

// Create textarea variants using shared variant system
const textareaContainerVariants = createFormVariants('textarea-container');

const textareaFieldVariants = combineVariants(createFormVariants('textarea'), formCompoundVariants);

// Generate TypeScript types from CVA variants
type TextareaVariants = VariantProps<typeof textareaFieldVariants>;
export type TextareaVariant = TextareaVariants['variant'];
export type TextareaSize = TextareaVariants['size'];

@Component({
  selector: 'app-textarea',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  imports: [TranslatePipe],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
})
export class TextareaComponent implements ControlValueAccessor, AfterViewInit {
  readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');

  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly variant = input<TextareaVariant>('default');
  readonly size = input<TextareaSize>('md');
  readonly readonly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly clearable = input<boolean>(false);
  readonly autoResize = input<boolean>(true);
  readonly rows = input<number>(4);
  readonly maxLength = input<number | null>(null);
  readonly error = input<string>('');
  readonly hint = input<string>('');

  // disabledState is a writable signal to support ControlValueAccessor's setDisabledState
  readonly disabledState = signal<boolean>(false);
  readonly value = signal<string>('');
  readonly textareaId = signal(`textarea-${Math.random().toString(36).substr(2, 9)}`);

  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    if (this.autoResize()) {
      this.adjustHeight();
    }
  }

  readonly containerClasses = computed(() => clsx(textareaContainerVariants({})));

  readonly textareaClasses = computed(() =>
    clsx(
      textareaFieldVariants({
        variant: this.variant(),
        size: this.size(),
        hasError: !!this.error(),
        autoResize: this.autoResize(),
      }),
    ),
  );

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
    this.onChange(target.value);

    if (this.autoResize()) {
      this.adjustHeight();
    }
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

    if (this.autoResize()) {
      this.adjustHeight();
    }
  }

  private adjustHeight() {
    const ref = this.textareaRef();
    if (ref?.nativeElement) {
      const textarea = ref.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');

    // Adjust height after value is set
    setTimeout(() => {
      if (this.autoResize()) {
        this.adjustHeight();
      }
    });
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
