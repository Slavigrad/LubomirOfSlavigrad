import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  model,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

/**
 * Modern signal-based form component
 * Demonstrates Angular 21+ signal-based forms without reactive forms
 */

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string[];
}

@Component({
  selector: 'app-signal-form',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      class="signal-form"
      [class]="formClasses()"
      (ngSubmit)="handleSubmit()"
      [attr.novalidate]="true"
    >
      @for (field of fields(); track field.id) {
        <div class="form-field" [class]="getFieldClasses(field)">
          <!-- Field Label -->
          @if (field.label) {
            <label
              [for]="field.id"
              class="field-label"
              [class.required]="field.required"
            >
              {{ field.label }}
              @if (field.required) {
                <span class="required-indicator">*</span>
              }
            </label>
          }

          <!-- Text Input -->
          @if (field.type === 'text' || field.type === 'email' || field.type === 'password') {
            <input
              [id]="field.id"
              [type]="field.type"
              [placeholder]="field.placeholder || ''"
              [disabled]="field.disabled || isSubmitting()"
              [value]="getFieldValue(field.id)"
              (input)="updateField(field.id, $event)"
              (blur)="markFieldTouched(field.id)"
              class="form-input"
              [class.error]="hasFieldError(field.id)"
              [attr.aria-describedby]="hasFieldError(field.id) ? field.id + '-error' : null"
            />
          }

          <!-- Textarea -->
          @if (field.type === 'textarea') {
            <textarea
              [id]="field.id"
              [placeholder]="field.placeholder || ''"
              [disabled]="field.disabled || isSubmitting()"
              [value]="getFieldValue(field.id)"
              (input)="updateField(field.id, $event)"
              (blur)="markFieldTouched(field.id)"
              class="form-textarea"
              [class.error]="hasFieldError(field.id)"
              [attr.aria-describedby]="hasFieldError(field.id) ? field.id + '-error' : null"
              rows="4"
            ></textarea>
          }

          <!-- Select -->
          @if (field.type === 'select') {
            <select
              [id]="field.id"
              [disabled]="field.disabled || isSubmitting()"
              [value]="getFieldValue(field.id)"
              (change)="updateField(field.id, $event)"
              (blur)="markFieldTouched(field.id)"
              class="form-select"
              [class.error]="hasFieldError(field.id)"
              [attr.aria-describedby]="hasFieldError(field.id) ? field.id + '-error' : null"
            >
              <option value="">Select an option</option>
              @for (option of field.options; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          }

          <!-- Checkbox -->
          @if (field.type === 'checkbox') {
            <label class="checkbox-label">
              <input
                [id]="field.id"
                type="checkbox"
                [disabled]="field.disabled || isSubmitting()"
                [checked]="getFieldValue(field.id)"
                (change)="updateField(field.id, $event)"
                (blur)="markFieldTouched(field.id)"
                class="form-checkbox"
              />
              <span class="checkbox-text">{{ field.label }}</span>
            </label>
          }

          <!-- Radio Group -->
          @if (field.type === 'radio') {
            <div class="radio-group">
              @for (option of field.options; track option.value) {
                <label class="radio-label">
                  <input
                    type="radio"
                    [name]="field.id"
                    [value]="option.value"
                    [disabled]="field.disabled || isSubmitting()"
                    [checked]="getFieldValue(field.id) === option.value"
                    (change)="updateField(field.id, $event)"
                    (blur)="markFieldTouched(field.id)"
                    class="form-radio"
                  />
                  <span class="radio-text">{{ option.label }}</span>
                </label>
              }
            </div>
          }

          <!-- Field Errors -->
          @if (hasFieldError(field.id)) {
            <div
              [id]="field.id + '-error'"
              class="field-errors"
              role="alert"
              aria-live="polite"
            >
              @for (error of getFieldErrors(field.id); track error) {
                <span class="error-message">{{ error }}</span>
              }
            </div>
          }
        </div>
      }

      <!-- Form Actions -->
      <div class="form-actions">
        @if (showResetButton()) {
          <button
            type="button"
            class="btn btn-secondary"
            [disabled]="isSubmitting() || !isDirty()"
            (click)="handleReset()"
          >
            {{ resetButtonText() }}
          </button>
        }

        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="isSubmitting() || !isValid() || !isDirty()"
        >
          @if (isSubmitting()) {
            <span class="loading-spinner"></span>
          }
          {{ submitButtonText() }}
        </button>
      </div>

      <!-- Form-level Errors -->
      @if (formError()) {
        <div class="form-error" role="alert" aria-live="polite">
          {{ formError() }}
        </div>
      }

      <!-- Success Message -->
      @if (successMessage()) {
        <div class="form-success" role="alert" aria-live="polite">
          {{ successMessage() }}
        </div>
      }
    </form>
  `,
  styles: [`
    .signal-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 100%;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field-label {
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .required-indicator {
      color: #ef4444;
    }

    .form-input,
    .form-textarea,
    .form-select {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.9);
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #3B82F6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.error,
    .form-textarea.error,
    .form-select.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .checkbox-label,
    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .form-checkbox,
    .form-radio {
      width: 1rem;
      height: 1rem;
      accent-color: #3B82F6;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field-errors {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3B82F6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .form-error {
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      font-size: 0.875rem;
    }

    .form-success {
      padding: 0.75rem 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      color: #10b981;
      font-size: 0.875rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Responsive design */
    @media (max-width: 640px) {
      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class SignalFormComponent implements OnInit {
  // Signal-based inputs
  readonly fields = input.required<FormField[]>();
  readonly submitButtonText = input<string>('Submit');
  readonly resetButtonText = input<string>('Reset');
  readonly showResetButton = input<boolean>(true);
  readonly disabled = input<boolean>(false);

  // Signal-based two-way binding for form data
  readonly formData = model<FormData>({});

  // Signal-based outputs
  readonly formSubmit = output<FormData>();
  readonly formReset = output<void>();
  readonly formChange = output<FormData>();
  readonly fieldChange = output<{ fieldId: string; value: any }>();

  // Internal state signals
  protected readonly errors = signal<FormErrors>({});
  protected readonly touched = signal<Record<string, boolean>>({});
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  // Computed signals
  readonly isValid = computed(() => {
    const currentErrors = this.errors();
    return Object.keys(currentErrors).length === 0;
  });

  readonly isDirty = computed(() => {
    const touchedFields = this.touched();
    return Object.keys(touchedFields).some(key => touchedFields[key]);
  });

  readonly formClasses = computed(() => {
    const classes = ['signal-form'];
    if (this.disabled()) classes.push('disabled');
    if (this.isSubmitting()) classes.push('submitting');
    if (!this.isValid()) classes.push('invalid');
    return classes.join(' ');
  });

  ngOnInit(): void {
    // Initialize form data with default values
    const initialData: FormData = {};
    this.fields().forEach(field => {
      if (!(field.id in this.formData())) {
        switch (field.type) {
          case 'checkbox':
            initialData[field.id] = false;
            break;
          case 'select':
          case 'radio':
            initialData[field.id] = '';
            break;
          default:
            initialData[field.id] = '';
        }
      }
    });

    if (Object.keys(initialData).length > 0) {
      this.formData.update(current => ({ ...current, ...initialData }));
    }

    // Set up validation effect
    effect(() => {
      this.validateForm();
    });
  }

  // Field value management
  getFieldValue(fieldId: string): any {
    return this.formData()[fieldId] || '';
  }

  updateField(fieldId: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    let value: any;

    if (target.type === 'checkbox') {
      value = (target as HTMLInputElement).checked;
    } else if (target.type === 'radio') {
      value = target.value;
    } else {
      value = target.value;
    }

    this.formData.update(current => ({
      ...current,
      [fieldId]: value
    }));

    this.fieldChange.emit({ fieldId, value });
    this.formChange.emit(this.formData());

    // Clear success message on change
    this.successMessage.set(null);
  }

  markFieldTouched(fieldId: string): void {
    this.touched.update(current => ({
      ...current,
      [fieldId]: true
    }));
  }

  // Validation
  private validateForm(): void {
    const newErrors: FormErrors = {};
    const currentData = this.formData();

    this.fields().forEach(field => {
      const value = currentData[field.id];
      const fieldErrors: string[] = [];

      // Required validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors.push(`${field.label} is required`);
      }

      // Type-specific validation
      if (value && typeof value === 'string') {
        // Email validation
        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            fieldErrors.push('Please enter a valid email address');
          }
        }

        // Length validation
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          fieldErrors.push(`Minimum length is ${field.validation.minLength} characters`);
        }

        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          fieldErrors.push(`Maximum length is ${field.validation.maxLength} characters`);
        }

        // Pattern validation
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            fieldErrors.push('Please enter a valid format');
          }
        }
      }

      // Custom validation
      if (field.validation?.custom) {
        const customError = field.validation.custom(value);
        if (customError) {
          fieldErrors.push(customError);
        }
      }

      if (fieldErrors.length > 0) {
        newErrors[field.id] = fieldErrors;
      }
    });

    this.errors.set(newErrors);
  }

  // Error handling
  hasFieldError(fieldId: string): boolean {
    return this.touched()[fieldId] && !!this.errors()[fieldId];
  }

  getFieldErrors(fieldId: string): string[] {
    return this.errors()[fieldId] || [];
  }

  getFieldClasses(field: FormField): string {
    const classes = ['form-field'];
    if (field.required) classes.push('required');
    if (field.disabled) classes.push('disabled');
    if (this.hasFieldError(field.id)) classes.push('error');
    return classes.join(' ');
  }

  // Form submission
  async handleSubmit(): Promise<void> {
    if (!this.isValid() || this.isSubmitting()) {
      return;
    }

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    this.fields().forEach(field => {
      allTouched[field.id] = true;
    });
    this.touched.set(allTouched);

    // Validate again
    this.validateForm();

    if (!this.isValid()) {
      this.formError.set('Please fix the errors above');
      return;
    }

    this.isSubmitting.set(true);
    this.formError.set(null);

    try {
      this.formSubmit.emit(this.formData());
      this.successMessage.set('Form submitted successfully!');
    } catch (error) {
      this.formError.set('An error occurred while submitting the form');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Form reset
  handleReset(): void {
    const resetData: FormData = {};
    this.fields().forEach(field => {
      switch (field.type) {
        case 'checkbox':
          resetData[field.id] = false;
          break;
        default:
          resetData[field.id] = '';
      }
    });

    this.formData.set(resetData);
    this.errors.set({});
    this.touched.set({});
    this.formError.set(null);
    this.successMessage.set(null);

    this.formReset.emit();
  }

  // Public methods
  setFieldValue(fieldId: string, value: any): void {
    this.formData.update(current => ({
      ...current,
      [fieldId]: value
    }));
  }

  setFieldError(fieldId: string, error: string): void {
    this.errors.update(current => ({
      ...current,
      [fieldId]: [error]
    }));
  }

  clearFieldError(fieldId: string): void {
    this.errors.update(current => {
      const newErrors = { ...current };
      delete newErrors[fieldId];
      return newErrors;
    });
  }

  setFormError(error: string): void {
    this.formError.set(error);
  }

  clearFormError(): void {
    this.formError.set(null);
  }

  setSuccessMessage(message: string): void {
    this.successMessage.set(message);
  }

  clearSuccessMessage(): void {
    this.successMessage.set(null);
  }
}
