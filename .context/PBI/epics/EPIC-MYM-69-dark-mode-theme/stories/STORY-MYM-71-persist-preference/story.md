# Persist Theme Preference

**Jira Key:** MYM-71
**Epic:** MYM-69 (Dark Mode & Theme Preferences)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do
**Assignee:** null
**Type:** Feature (Post-MVP)

---

## User Story

**As a** user
**I want to** have my theme preference persisted
**So that** it remains consistent across browser sessions

---

## Description

This story ensures that once a user selects their preferred theme (light or dark), that preference is saved and automatically applied when they return to the application. This creates a seamless experience where users don't have to re-select their theme every time they visit.

The implementation uses localStorage for persistence, which is the standard approach for client-side user preferences. A critical requirement is preventing the "Flash of Unstyled Content" (FOUC) - where the wrong theme briefly appears before the correct one is applied.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Theme preference is saved after selection
- **Given:** The user is viewing the application
- **When:** The user toggles to dark mode
- **Then:** The preference is saved to localStorage
- **And:** The key `theme` contains the value `dark`

### Scenario 2: Saved theme is applied on page load
- **Given:** The user previously selected dark mode
- **And:** The preference is saved in localStorage
- **When:** The user opens the application in a new browser session
- **Then:** Dark mode is automatically applied
- **And:** No flash of light theme occurs during load

### Scenario 3: Theme persists across page navigation
- **Given:** The user has selected dark mode
- **When:** The user navigates to different pages within the app
- **Then:** Dark mode remains active on all pages
- **And:** No theme flickering occurs during navigation

### Scenario 4: Light mode preference is also persisted
- **Given:** The user has previously used dark mode
- **When:** The user toggles to light mode
- **And:** Closes and reopens the browser
- **Then:** Light mode is applied on return

### Scenario 5: Clearing localStorage resets preference
- **Given:** The user has a saved theme preference
- **When:** The user clears their browser localStorage
- **And:** Reloads the application
- **Then:** The application uses the default theme or system preference

---

## Technical Notes

### Frontend

**Components to modify:**
- `src/contexts/theme-context.tsx` - Configure storage options

### Backend
- N/A - Client-side only feature

### Database
- N/A - Using localStorage, not database

### Implementation Details

**localStorage key:** `theme`
**Possible values:** `light`, `dark`, `system`

**Preventing FOUC:**

The `next-themes` library handles this automatically by:
1. Injecting a script in `<head>` that runs before React hydration
2. Reading localStorage and applying the theme class immediately
3. Using `suppressHydrationWarning` on the `<html>` element

**Configuration in layout.tsx:**
```tsx
// src/app/layout.tsx
import { ThemeProvider } from '@/contexts/theme-context'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**ThemeProvider with storage:**
```tsx
// The next-themes library handles localStorage automatically
<NextThemesProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  storageKey="theme"  // localStorage key
>
  {children}
</NextThemesProvider>
```

### Testing FOUC Prevention

1. Set theme to dark mode
2. Hard refresh the page (Ctrl+Shift+R)
3. Observe: Page should load in dark mode immediately, no white flash

### Impact Analysis

**Affected areas:**
- Root layout configuration
- ThemeProvider configuration

**No breaking changes** - extends existing toggle functionality

---

## Dependencies

### Blocked By
- MYM-70 (Toggle theme) - Must have toggle working first

### Blocks
- None

### Related Stories
- MYM-70 - Provides the toggle this story persists
- MYM-72 - System detection interacts with persistence

---

## UI/UX Considerations

- No visible UI changes from MYM-70
- The key UX improvement is seamless persistence
- User should never have to re-select their theme after choosing once
- No jarring flash of wrong theme on page load

---

## Definition of Done

- [ ] Theme preference saved to localStorage on change
- [ ] Preference loaded and applied on page load
- [ ] No FOUC (Flash of Unstyled Content)
- [ ] Preference persists across browser sessions
- [ ] Works with browser back/forward navigation
- [ ] Works in incognito mode (persists within session)
- [ ] Code review approved
- [ ] Manual QA passed - test with hard refresh

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-69-dark-mode-theme/epic.md`
- **Parent Story:** `.context/PBI/epics/EPIC-MYM-69-dark-mode-theme/stories/STORY-MYM-70-toggle-theme/story.md`
- **next-themes docs:** https://github.com/pacocoursey/next-themes
