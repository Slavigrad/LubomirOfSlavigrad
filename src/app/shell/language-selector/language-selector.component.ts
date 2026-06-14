import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { SUPPORTED_LANGUAGES } from '../i18n/supported-languages';

/** Smoked-crystal language switcher driven by SUPPORTED_LANGUAGES + TranslateService. */
@Component({
  selector: 'app-language-selector',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
})
export class LanguageSelectorComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly translate = inject(TranslateService);

  protected readonly languages = SUPPORTED_LANGUAGES;
  protected readonly open = signal(false);
  protected readonly currentCode = this.translate.currentLang;
  protected readonly currentLabel = computed(() => {
    const code = this.currentCode();
    return this.languages.find((l) => l.code === code)?.label ?? (code ?? '').toUpperCase();
  });

  constructor() {
    const saved = this.readStored();
    if (saved && saved !== this.translate.getCurrentLang()) {
      this.translate.use(saved);
    }
  }

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected isActive(code: string): boolean {
    return code === this.currentCode();
  }

  protected select(code: string): void {
    if (code !== this.currentCode()) {
      this.translate.use(code);
      try {
        localStorage.setItem('lang', code);
      } catch {
        /* storage unavailable — selection is still applied for the session */
      }
    }
    this.close();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  private readStored(): string | null {
    try {
      const saved = localStorage.getItem('lang');
      return this.languages.some((l) => l.code === saved) ? saved : null;
    } catch {
      return null;
    }
  }
}
