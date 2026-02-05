import { Component, Input, signal, computed, forwardRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { createFormVariants, formCompoundVariants, combineVariants } from '../../utils';

// Create textarea variants using shared variant system
const textareaContainerVariants = createFormVariants('textarea-container');

const textareaFieldVariants = combineVariants(
  createFormVariants('textarea'),
  formCompoundVariants
);

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
      multi: true
    }
  ],
  template: `
    <div [class]="containerClasses()">
      @if (label) {
        <label [for]="textareaId()" class="textarea-label">
          {{ label }}
          @if (required) {
            <span class="text-red-500 ml-1">*</span>
          }
        </label>
      }

      <div class="relative">
        <textarea
          #textareaRef
          [id]="textareaId()"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [rows]="rows"
          [attr.maxlength]="maxLength || null"
          [class]="textareaClasses()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        ></textarea>

        @if (clearable && value()) {
          <button
            type="button"
            class="textarea-clear"
            (click)="clearValue()"
            aria-label="Clear textarea"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        }

        @if (maxLength) {
          <div class="textarea-counter">
            {{ value().length }}/{{ maxLength }}
          </div>
        }
      </div>

      @if (error) {
        <p class="textarea-error">{{ error }}</p>
      }

      @if (hint && !error) {
        <p class="textarea-hint">{{ hint }}</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .textarea-container {
      @apply w-full;
    }

    .textarea-label {
      @apply block text-sm font-medium text-foreground mb-2;
    }

    .textarea {
      @apply w-full transition-all duration-200 resize-none;
      @apply focus:outline-none focus:ring-2 focus:ring-offset-0;
      @apply disabled:opacity-50 disabled:cursor-not-allowed;
      @apply placeholder:text-muted-foreground;
    }

    /* Size Styles */
    .textarea-sm {
      @apply px-3 py-1.5 text-sm rounded-md;
    }

    .textarea-md {
      @apply px-4 py-2 text-base rounded-lg;
    }

    .textarea-lg {
      @apply px-5 py-3 text-lg rounded-xl;
    }

    /* Variant Styles */
    .textarea-default {
      @apply bg-input border border-border text-foreground;
      @apply focus:ring-primary focus:border-primary;
    }

    .textarea-glass {
      @apply bg-white/10 border border-white/20 text-white;
      @apply focus:ring-white/50 focus:border-white/50;
      backdrop-filter: blur(10px);
    }

    .textarea-glass::placeholder {
      @apply text-white/60;
    }

    .textarea-outline {
      @apply bg-transparent border-2 border-border text-foreground;
      @apply focus:ring-primary focus:border-primary;
    }

    /* Auto-resize */
    .textarea-auto-resize {
      @apply overflow-hidden;
      min-height: 2.5rem;
    }

    /* Clear Button */
    .textarea-clear {
      @apply absolute top-3 right-3;
      @apply text-muted-foreground hover:text-foreground;
      @apply transition-colors duration-200;
    }

    /* Character Counter */
    .textarea-counter {
      @apply absolute bottom-3 right-3;
      @apply text-xs text-muted-foreground;
      @apply bg-background/80 px-2 py-1 rounded;
    }

    /* Error State */
    .textarea-error-state {
      @apply border-red-500 focus:ring-red-500 focus:border-red-500;
    }

    .textarea-error {
      @apply text-red-500 text-sm mt-1;
    }

    .textarea-hint {
      @apply text-muted-foreground text-sm mt-1;
    }

    /* Focus States */
    .textarea:focus {
      @apply ring-2;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .textarea-lg {
        @apply px-4 py-2.5 text-base;
      }
    }
  `]
})
export class TextareaComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() variant: TextareaVariant = 'default';
  @Input() size: TextareaSize = 'md';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() clearable: boolean = false;
  @Input() autoResize: boolean = true;
  @Input() rows: number = 4;
  @Input() maxLength: number | null = null;
  @Input() error: string = '';
  @Input() hint: string = '';

  readonly value = signal<string>('');
  readonly textareaId = signal(`textarea-${Math.random().toString(36).substr(2, 9)}`);

  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    if (this.autoResize) {
      this.adjustHeight();
    }
  }

  readonly containerClasses = computed(() =>
    clsx(
      textareaContainerVariants({})
    )
  );

  readonly textareaClasses = computed(() =>
    clsx(
      textareaFieldVariants({
        variant: this.variant,
        size: this.size,
        hasError: !!this.error,
        autoResize: this.autoResize
      })
    )
  );

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
    this.onChange(target.value);

    if (this.autoResize) {
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

    if (this.autoResize) {
      this.adjustHeight();
    }
  }

  private adjustHeight() {
    if (this.textareaRef?.nativeElement) {
      const textarea = this.textareaRef.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');

    // Adjust height after value is set
    setTimeout(() => {
      if (this.autoResize) {
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
    this.disabled = isDisabled;
  }
}
