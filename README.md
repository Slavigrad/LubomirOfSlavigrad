# LubomirOfSlavigrad (Angular)

A personal, recruiter‑focused profile site built with Angular. The MVP emphasizes a clean review experience: focused modal UX, keyboard accessibility, and feature‑gated work‑in‑progress items.

## Features (MVP)

- Glass modal system with portal to <body> (escapes stacking contexts)
- Body scroll lock while modal is open; instant scroll restore on close (no jump/slide)
- Keyboard accessibility: ESC/backdrop/(x) to close and minimal focus trap
- Centralized z-index management
- Feature flags to keep incomplete features hidden by default
- Optional PDF generation and template gallery (gated for now)

## Tech stack

- Angular 20 (standalone components)
- TypeScript, RxJS, Zone.js
- Tailwind CSS + utilities

## Getting started

Prerequisites:
- Node.js 18.19+ or 20+
- npm 9+

Install and run dev server:

```bash
npm ci
npm start
# Open http://localhost:4200
```

## Scripts

- `npm start` — Run dev server (Angular CLI)
- `npm run build` — Production build (default configuration)
- `npm run build:prod` — Explicit production build
- `npm run watch` — Rebuild on change (development)
- `npm test` — Unit tests (Karma/Jasmine)
- `npm run analyze:bundle` — Analyze production bundle
- `npm run performance:*` — Optional perf helpers (budget + lighthouse)

## Configuration: recruiter‑safe feature flags

PDF and other non‑MVP CTAs/modals are disabled by default and can be enabled locally.

Edit:
`src/app/components/hero/hero.configuration.ts`

- Production‑safe defaults live in `BASE_FEATURES` (all `false`).
- For local testing, enable flags in `HERO_LOCAL_OVERRIDES` (uncomment as needed). These only apply on `localhost`.

Example:
```ts
export const HERO_LOCAL_OVERRIDES = {
  // pdfGeneration: true,
  // pdfTemplateSelector: true,
  // pdfConfiguration: true,
};
```

## Modal usage (GlassModal)

A single, shared modal component is used across the app and is rendered in a global modal root under `<body>` to avoid z-index/stacking issues.

```html
<app-glass-modal [open]="isOpen" (closed)="isOpen = false" ariaLabel="Dialog title">
  <!-- Modal content -->
</app-glass-modal>
```

Behavior:
- Backdrop click, ESC, and close button emit `(closed)`
- Focus is trapped within the modal while open
- Opening locks background scroll; closing restores exact scroll position instantly

Relevant files:
- `src/app/shared/components/ui/glass-modal.component.ts`
- `src/app/shared/styles/z-index.ts`

## Building

```bash
npm run build       # default (production)
npm run build:prod  # explicit production config
```

Artifacts are emitted to `dist/LubomirOfSlavigrad`.

## Testing

```bash
npm test
```

## Troubleshooting

- Component CSS budgets
  - Production builds enforce per‑component CSS budgets (see `angular.json`).
  - If a component exceeds the budget, either trim the component styles or raise the `anyComponentStyle` budget under `projects.LubomirOfSlavigrad.architect.build.configurations.production.budgets`.

- CommonJS optimization warnings
  - PDF tooling (e.g., `html2canvas`, `canvg`) may trigger warnings. These do not affect dev.
  - If needed, consider replacing with ESM‑friendly alternatives or adjust CLI configuration.

- Modal scroll “jump”
  - The modal system uses `position: fixed` body locking and temporarily forces `html { scroll-behavior: auto }` when restoring scroll to prevent a jump/slide.

## Project status

MVP is ready to share with recruiters. Non‑essential features (e.g., advanced PDF flows) remain gated and can be iterated on without affecting the core review experience.
