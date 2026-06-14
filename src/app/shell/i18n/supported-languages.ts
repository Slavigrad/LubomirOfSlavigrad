/**
 * Single source of truth for the languages the app offers.
 *
 * To add a language:
 *   1. Drop a new `assets/i18n/<code>.json` next to `en.json`.
 *   2. Add one entry below ({ code, label }).
 * Everything else (the switcher, the default-language wiring) reads from here.
 */
export interface SupportedLanguage {
  /** BCP-47 code; must match the `assets/i18n/<code>.json` filename. */
  readonly code: string;
  /** Short label shown in the switcher (e.g. ENG, EST, RUS, FIN). */
  readonly label: string;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: 'en', label: 'EN' },
  { code: 'sk', label: 'SK' },
] as const;

/** The language used on first load and as the fallback. */
export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0].code;

/** Codes only, derived from the list above. */
export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);
