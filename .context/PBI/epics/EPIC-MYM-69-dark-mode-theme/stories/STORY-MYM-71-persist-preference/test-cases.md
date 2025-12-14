# Feature Test Plan: Theme Preference Persistence

**Story:** MYM-71
**Epic:** EPIC-MYM-2-user-authentication-profiles

## Test Strategy
- **Scope:** Verify theme persistence in localStorage and correct application on load/navigation.
- **Types:** Manual Exploratory, Unit Tests (utility functions), E2E (Playwright).
- **Tools:** Chrome DevTools (Application tab), Playwright.

## Test Cases

### TC-MYM-71-01: Save Theme Preference
- **Description:** Verify that toggling the theme updates localStorage.
- **Preconditions:** User is on the dashboard.
- **Steps:**
  1. Open Chrome DevTools > Application > Local Storage.
  2. Click the theme toggle button (switch to Dark).
  3. Observe the `theme` key in Local Storage.
- **Expected Result:** 
  - The UI changes to dark mode immediately.
  - `theme` key is created/updated with value `dark`.

### TC-MYM-71-02: Persist Theme on Reload
- **Description:** Verify that the selected theme persists after a page reload.
- **Preconditions:** User has selected Dark mode. `theme` = `dark` in localStorage.
- **Steps:**
  1. Refresh the page.
  2. Observe the UI during load.
  3. Check the theme toggle state.
- **Expected Result:** 
  - The page loads in Dark mode.
  - **No flash** of Light mode (FOUC) is observed.
  - The toggle remains in the "Dark" state.

### TC-MYM-71-03: Persist Theme on Navigation
- **Description:** Verify that the theme remains consistent when navigating between pages.
- **Preconditions:** User is on the Home page in Dark mode.
- **Steps:**
  1. Click on a link to go to the Login page or Profile page.
  2. Observe the UI on the new page.
- **Expected Result:** 
  - The new page renders in Dark mode.

### TC-MYM-71-04: Default to System Preference
- **Description:** Verify behavior when no theme is saved (or localStorage cleared).
- **Preconditions:** LocalStorage is empty. System OS theme is set to Dark.
- **Steps:**
  1. Clear localStorage `theme` key.
  2. Reload the application.
- **Expected Result:** 
  - The application detects the System preference (Dark).
  - The UI loads in Dark mode (if system is dark) or Light (if system is light).
  - *Note:* If default is explicitly Light in code, verify that matches requirements. (Usually `system` is default for `next-themes`).

### TC-MYM-71-05: Switch back to Light
- **Description:** Verify switching from Dark to Light.
- **Preconditions:** User is in Dark mode.
- **Steps:**
  1. Toggle the theme switch to Light.
  2. Check localStorage.
- **Expected Result:** 
  - UI changes to Light mode.
  - `theme` key updates to `light`.

## Automated Test Candidates (Playwright)
- `test('should persist theme preference across reloads')`
- `test('should sync with local storage')`
# Shift-Left Test Plan — MYM-71 Theme Preference Persistence

## Objective & Scope
- Ensure a user’s selected theme (`light`, `dark`, or `system`) persists across sessions and navigation, applies before first paint, and degrades safely when storage or environment constraints exist.
- In scope: `ThemeProvider` config, root layout wiring, UI toggle behavior, persistence via `localStorage`, SSR/CSR interaction, and absence of hydration/FOUC issues.
- Out of scope: Comprehensive visual regression of every screen (spot-check key templates only).

## Key Artifacts
- Root layout: `src/app/layout.tsx`
- Theme provider: `src/components/theme-provider.tsx`
- Mode toggle: `src/components/mode-toggle.tsx`
- Library: `next-themes`

## Risks & Failure Modes
- FOUC/“flash of light theme” on initial load if theme class isn’t set before first paint.
- Hydration mismatch warnings due to theme changes between SSR and CSR.
- Accessing `window`/`localStorage` during SSR causing crashes or logs.
- Missing or blocked `localStorage` (private mode, storage disabled) breaks persistence.
- Incorrect default when no preference (should follow `defaultTheme="system"`).
- Stale or invalid `theme` value in `localStorage` causes wrong class or errors.
- Cross-page persistence failures (navigation loses theme).
- Console errors from `next-themes` misconfiguration (e.g., wrong `attribute`).
- Accessibility regressions (contrast ratios, focus states in dark mode).
- Cross-browser inconsistencies for prefers-color-scheme.

## Test Types
- Static checks: TypeScript, import boundaries, SSR guards (no `window` in server code), lint.
- Unit: Provider props and class attribute; Toggle calls `setTheme` with correct values.
- Integration: Persistence across reloads and navigation; default behavior; invalid storage recovery.
- E2E (Playwright): No FOUC; theme applied before paint; multi-page flows; storage interactions.
- Accessibility: Contrast, focus, ARIA/name for toggle; keyboard operability.
- Cross-browser: Chrome, Firefox, Safari, Edge; desktop and at least one mobile viewport.
- Performance: Ensure no layout shift from theme application; track FCP/LCP deltas when toggling.
- Security/Privacy: Only `theme` is stored; no PII; storage key namespace is stable.

## Assumptions
- `ThemeProvider` is used in `src/app/layout.tsx` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and optional `disableTransitionOnChange`.
- `next-themes` manages `localStorage` key `theme`.
- Tailwind is configured for class-based dark mode.

## Environments
- Local dev with Next.js dev server.
- Browsers: latest Chrome, Firefox, Edge, Safari.
- OS-level theme set to light/dark for system tests.

## Test Data
- Storage values: `light`, `dark`, `system`, invalid: `""`, `"blue"`, `null`.
- States: empty `localStorage`; storage throwing (mock) to simulate blocked.

## Automation Guidance
- Unit (Jest + RTL): mock `next-themes` `useTheme`; assert `setTheme` calls and provider props.
- Integration/E2E (Playwright): use `storageState` or `page.addInitScript` to seed `localStorage` before `page.goto`; assert `<html>` has expected class without visual flash (via first-screenshot comparison and console log checks).

## Test Cases

### Happy Path
1) ID: MYM-71-HP-01 — Toggle saves dark
   - Pre: `localStorage.theme` unset.
   - Steps: Open app; use `ModeToggle` to select Dark.
   - Expected: `localStorage.theme === 'dark'`; `<html>` has `class` including `dark`.

2) ID: MYM-71-HP-02 — Apply saved dark on reload
   - Pre: `localStorage.theme = 'dark'`.
   - Steps: Reload app/new session.
   - Expected: No flash of light; `<html>` has `dark` before paint; UI renders dark.

3) ID: MYM-71-HP-03 — Persist across navigation
   - Pre: Dark already selected.
   - Steps: Navigate across at least 3 routes.
   - Expected: Dark remains active; no class flicker across route transitions.

4) ID: MYM-71-HP-04 — System default
   - Pre: Clear `localStorage.theme`; OS set to Dark; `defaultTheme='system'`.
   - Steps: Open app.
   - Expected: Dark applied via system; no hydration mismatch.

5) ID: MYM-71-HP-05 — Light selection persists
   - Pre: None.
   - Steps: Select Light; reload.
   - Expected: `localStorage.theme === 'light'`; Light remains after reload.

### Negative
6) ID: MYM-71-NG-01 — Storage unavailable
   - Pre: Mock `localStorage` access to throw/quota exceeded.
   - Steps: Open app; try toggling.
   - Expected: App renders; default/system theme applies; no crashes; console clean of errors.

7) ID: MYM-71-NG-02 — Invalid value in storage
   - Pre: `localStorage.theme = 'blue'`.
   - Steps: Open app.
   - Expected: Falls back to default/system; no error; theme class valid.

8) ID: MYM-71-NG-03 — SSR safety
   - Pre: Server render enabled.
   - Steps: Hit page with JS disabled or inspect server logs.
   - Expected: No reference to `window`/`localStorage` on server; no SSR crash.

9) ID: MYM-71-NG-04 — Hydration warnings
   - Pre: Dark saved, ensure provider configured.
   - Steps: Load app and inspect console.
   - Expected: No hydration mismatch warnings; empty console for theme errors.

### Edge Cases
10) ID: MYM-71-ED-01 — Rapid toggling
   - Pre: None.
   - Steps: Toggle theme 5–10 times quickly.
   - Expected: Last selection persists; no race conditions; UI stable.

11) ID: MYM-71-ED-02 — Multi-tab sync
   - Pre: Two tabs A/B; open app in both.
   - Steps: Toggle Dark in A; switch to B.
   - Expected: B updates to Dark or reflects persisted value on next navigation/reload; no conflicts.

12) ID: MYM-71-ED-03 — System theme change live
   - Pre: `defaultTheme='system'`; `localStorage.theme` unset.
   - Steps: While app open, change OS theme from Light→Dark.
   - Expected: App updates accordingly (if `enableSystem`); no hydration issues.

13) ID: MYM-71-ED-04 — Route transition frameworks
   - Pre: Dark saved.
   - Steps: Navigate between server/Client components routes.
   - Expected: Theme class stable on `<html>`; no flicker.

14) ID: MYM-71-ED-05 — First paint performance
   - Pre: None.
   - Steps: Measure FCP/LCP; compare with/without theme saved.
   - Expected: No significant regression; no layout shift caused by late class application.

15) ID: MYM-71-ED-06 — Clear storage resets
   - Pre: Dark saved.
   - Steps: Clear `localStorage`; reload.
   - Expected: App returns to default/system; no residual dark class.

### Accessibility
16) ID: MYM-71-A11Y-01 — Toggle semantics
   - Pre: None.
   - Steps: Inspect `ModeToggle` with screen reader/DOM.
   - Expected: Has accessible name/role; keyboard operable; visible focus; meets contrast in both themes.

## Acceptance Mapping
- AC1 (Save after selection): Covered by HP-01, HP-05.
- AC2 (Apply on load, no flash): Covered by HP-02, ED-05.
- AC3 (Persist across navigation): Covered by HP-03, ED-04.
- AC4 (Clearing resets to default/system): Covered by ED-06, HP-04.

## Exit Criteria
- All Happy Path and Negative tests pass on Chrome; spot-check Edge/Firefox/Safari.
- No hydration warnings; no theme-related console errors.
- Verified no FOUC in at least two repeated cold loads.
- A11y toggle semantics validated; contrast acceptable on sampled pages.

## QA Checklist
- [ ] `ThemeProvider` in `src/app/layout.tsx` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`.
- [ ] `ModeToggle` calls `setTheme('light'|'dark'|'system')` and updates UI.
- [ ] `localStorage.theme` set/cleared appropriately; invalid values handled.
- [ ] No hydration mismatch warnings; no FOUC on cold load.
- [ ] Cross-navigation persistence confirmed.
