import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { CvDataService } from '../../data/cv-data.service';
import {
  ScrollAnimateDirective,
  InteractiveAnimateDirective,
} from '../../../shared/util-performance/utils/animations';
import { CONTACT_TIMINGS } from './contact.constants';
import { CONTACT_CONFIG } from './contact.configuration';

interface SubmitResult {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, ScrollAnimateDirective, InteractiveAnimateDirective, TranslatePipe],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly cvDataService = inject(CvDataService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  protected readonly personalInfo = this.cvDataService.personalInfo;
  protected readonly isSubmitting = signal(false);
  protected readonly submitMessage = signal<SubmitResult | null>(null);

  protected readonly TIMINGS = CONTACT_TIMINGS;
  protected readonly FEATURES = CONTACT_CONFIG.features;

  // NOTE: Reactive Forms is retained here intentionally. Angular 22 makes
  // Signal Forms the default for *new* forms, but Reactive Forms remain
  // fully supported; migrating this working form is tracked separately.
  protected readonly contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required]],
    message: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    if (!this.contactForm.valid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitMessage.set(null);

    // Simulated submission.
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitMessage.set({
        success: true,
        message: this.translate.instant('CV.CONTACT.SUCCESS'),
      });
      this.contactForm.reset();
    }, this.TIMINGS.submitDelayMs);
  }
}
