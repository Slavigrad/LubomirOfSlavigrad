import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { LanguageSelectorComponent } from './language-selector.component';
import { SUPPORTED_LANGUAGES } from '../i18n/supported-languages';

describe('LanguageSelectorComponent', () => {
  let translate: TranslateService;
  let fixture: ComponentFixture<LanguageSelectorComponent>;

  /** Builds the fixture and runs the first change-detection pass. */
  function create(): HTMLElement {
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const trigger = () => fixture.nativeElement.querySelector('.ls-trigger') as HTMLButtonElement;
  const panel = () => fixture.nativeElement.querySelector('.ls-panel') as HTMLElement | null;
  const options = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.ls-option')) as HTMLButtonElement[];

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent],
      providers: [provideTranslateService({ lang: 'en', fallbackLang: 'en' })],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { APP: { NAV: { LANGUAGE: { LABEL: 'Select language' } } } });
    translate.setTranslation('sk', { APP: { NAV: { LANGUAGE: { LABEL: 'Vyberte jazyk' } } } });
    translate.use('en');
  });

  it('should create and show the current language label', () => {
    create();
    expect(fixture.componentInstance).toBeTruthy();
    expect(trigger().querySelector('.ls-code')?.textContent?.trim()).toBe('EN');
  });

  it('should keep the panel closed until the trigger is activated', () => {
    create();
    expect(panel()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('should open the panel with one option per supported language', () => {
    create();
    trigger().click();
    fixture.detectChanges();

    expect(panel()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(options()).toHaveLength(SUPPORTED_LANGUAGES.length);
  });

  it('should mark the active language and toggle the panel shut on a second click', () => {
    create();
    trigger().click();
    fixture.detectChanges();

    const active = options().find((o) => o.classList.contains('is-active'));
    expect(active?.getAttribute('aria-selected')).toBe('true');
    expect(active?.textContent).toContain('EN');

    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('should switch language, persist it, and close when an option is selected', () => {
    create();
    trigger().click();
    fixture.detectChanges();

    const sk = options().find((o) => o.textContent?.includes('SK'));
    sk!.click();
    fixture.detectChanges();

    expect(translate.currentLang()).toBe('sk');
    expect(localStorage.getItem('lang')).toBe('sk');
    expect(panel()).toBeNull();
  });

  it('should close on Escape', () => {
    create();
    trigger().click();
    fixture.detectChanges();
    expect(panel()).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('should close on an outside click but stay open when clicking inside', () => {
    create();
    trigger().click();
    fixture.detectChanges();

    // Click inside the host -> stays open.
    panel()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(panel()).not.toBeNull();

    // Click outside (target = document) -> closes.
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('should restore a previously stored language on construction', () => {
    localStorage.setItem('lang', 'sk');
    create();
    expect(translate.currentLang()).toBe('sk');
    expect(trigger().querySelector('.ls-code')?.textContent?.trim()).toBe('SK');
  });

  it('should ignore a stored language that is not supported', () => {
    localStorage.setItem('lang', 'xx');
    create();
    expect(translate.currentLang()).toBe('en');
  });
});
