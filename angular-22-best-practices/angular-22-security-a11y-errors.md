# Angular 22 — Security, Accessibility & Error Handling

> Part of the Angular 22 Best Practices set. Load whenever output touches user data rendering, DOM APIs, auth, HTTP error paths, or any UI a human must operate. These rules are **non-negotiable** — they outrank convenience and feature requests.

---

## A. Security

### A1. XSS Model
- Angular treats **all bound values as untrusted** and sanitizes/escapes per context (HTML, Style, URL, Resource URL). Interpolation always escapes. This protection exists only inside Angular templates.
- **Templates are trusted executable code.** NEVER build a template string from user input, never compile user-supplied templates, never use JIT in production. AOT (the CLI default) is mandatory.
- HTML constructed on the server is equally dangerous — never generate Angular templates server-side from user data.

### A2. DOM Access
- Avoid direct DOM APIs (`document`, `ElementRef.nativeElement.innerHTML = …`, third-party DOM libs) — they bypass sanitization. Use template bindings.
- If unavoidable, sanitize explicitly: `inject(DomSanitizer).sanitize(SecurityContext.HTML, value)`.
- `[innerHTML]="userContent"` is allowed — Angular sanitizes it — but prefer rendering structured data over raw HTML.

### A3. Bypassing Sanitization (`bypassSecurityTrust*`)
- `bypassSecurityTrustHtml/Url/ResourceUrl/Style/Script` mark a value as safe **on your authority**. Use only on values you fully control or have validated; construct the SafeValue as close to the input as possible (e.g., `'https://www.youtube.com/embed/' + validatedId`).
- An AI agent must **never** introduce a `bypassSecurityTrust*` call to "fix" a sanitization warning without flagging it for human security review.

### A4. Defense in Depth
- **CSP**: serve `Content-Security-Policy` with per-request nonces (`default-src 'self'; style-src 'self' 'nonce-…'; script-src 'self' 'nonce-…'`). Wire the nonce via the `autoCsp` builder option, `ngCspNonce` attribute, or `CSP_NONCE` token. Nonces must be unique per request — generate at the edge when behind a CDN.
- **Trusted Types**: enforce with `Content-Security-Policy: trusted-types angular; require-trusted-types-for 'script';` — add `angular#bundler` (lazy chunks) and `angular#unsafe-bypass` only if you use bypass methods.
- Keep Angular current (`ng update`); never fork/patch the framework.

### A5. XSRF/CSRF & XSSI
- `HttpClient` implements the cookie-to-header scheme: reads `XSRF-TOKEN` cookie → sends `X-XSRF-TOKEN` header on mutating same-origin requests. **The backend must set/verify the token** (in Spring Boot: `CookieCsrfTokenRepository.withHttpOnlyFalse()` matches this contract). Customize names via `withXsrfConfiguration` if needed.
- Cookies: `Secure`, `HttpOnly` where possible, `SameSite` set deliberately.

### A6. AuthN/AuthZ (Modern Pattern)
- For browser apps, current recommendation is **server-side OAuth2/OIDC** (BFF pattern): tokens live on the server/backend-for-frontend; browser holds only a session cookie (+ XSRF protection). Avoid keeping access/refresh tokens in `localStorage`.
- If client-side OAuth2 is mandated: Authorization Code + PKCE, short-lived tokens, no implicit flow.
- Route guards enforce **UX**, not security — every authorization decision must be enforced server-side too.

## B. Accessibility (WCAG 2.x AA Minimum)

- **Semantic HTML first**: `<button>` for actions, `<a>` for navigation, `<nav>/<main>/<header>/<table>` etc. Never a clickable `<div>`.
- Every image: `alt` (empty for decorative). Every input: a programmatically associated `<label>`. Icon-only controls: `aria-label`.
- Use native attributes where they exist; ARIA only to fill gaps. Bind ARIA attributes with `[attr.aria-…]` (they're attributes, not properties).
- **Keyboard**: everything operable via keyboard; logical tab order; visible focus (`:focus-visible` styles — never remove outlines without replacement).
- **Focus management**: on route change, move focus to the new content/heading; trap focus in dialogs and restore it on close (use Angular Aria/CDK dialogs which do this).
- Color contrast ≥ 4.5:1 normal text / 3:1 large text; never convey meaning by color alone.
- Announce dynamic changes: `aria-live` regions / CDK `LiveAnnouncer` for async results ("5 flights found").
- Use the router's `routerLink` + real URLs so assistive tech and middle-click work.
- **Angular Aria** (`@angular/aria`): headless, signal-based, fully accessible primitives (menu, dialog, tabs, combobox, listbox, …). Prefer it (or CDK/Material) over hand-rolling interactive widgets — correct keyboard + ARIA behavior is hard.
- Gate CI on automated checks (axe/Lighthouse a11y ≥ 90) **and** do manual keyboard + screen-reader passes for new interactive UI.

## C. Error Handling

### C1. Strategy: Handle at the Callsite
The code that initiates an operation has the context to recover. Handle expected failures where they occur (HTTP call sites, form submission, parsing) and translate them into **state the UI renders** — not exceptions that escape.

- Resources already encode this: failures land in `resource.error()` / `status()`; render retry UI from them. Do not wrap resource usage in try/catch.
- For imperative `HttpClient` calls: `catchError` (RxJS) or `try/catch` (promises) at the call, map to user-meaningful state.
- Avoid "overly general" handlers that log without context.

### C2. `ErrorHandler` = Last Line, Not a Strategy
Unhandled errors (especially those thrown in framework-invoked code: constructors, lifecycle, template expressions) go to the root `ErrorHandler`. Provide a custom one **for reporting**, not for app logic:

```typescript
export class GlobalErrorHandler implements ErrorHandler {
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);
  handleError(error: unknown): void {
    this.analytics.trackEvent({ eventName: 'exception',
      description: `Screen: ${this.router.url} | ${(error as Error)?.message ?? 'unknown'}` });
    console.error(GlobalErrorHandler.name, { error });
  }
}
// app.config.ts: { provide: ErrorHandler, useClass: GlobalErrorHandler }
```

- Angular does **not** catch errors in code you call directly — that's yours.
- Async errors reach `ErrorHandler` only where Angular owns the contract (e.g., `AsyncPipe`, `PendingTasks.run`); `resource` deliberately surfaces errors as state instead.

### C3. Global Listeners
- `provideBrowserGlobalErrorListeners()` (CLI default in new apps) forwards window `error`/`unhandledrejection` to `ErrorHandler` — keep it unless you install equivalent custom listeners.
- SSR: Angular adds `unhandledRejection`/`uncaughtException` process listeners automatically so a render error doesn't kill the server.

### C4. Testing Note
`TestBed` **rethrows** errors reported to `ErrorHandler` so tests can't silently swallow them; opt out per-suite only when explicitly testing resilience: `TestBed.configureTestingModule({ rethrowApplicationErrors: false })`.

### C5. UX Rules
- Every async UI needs three states: loading, success, error-with-retry.
- Error messages: say what failed and what the user can do; never leak stack traces, internal URLs, or backend error bodies verbatim to end users.
