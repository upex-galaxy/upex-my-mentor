# Toggle Between Light and Dark Mode

**Jira Key:** MYM-70
**Epic:** MYM-69 (Dark Mode & Theme Preferences)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null
**Type:** Feature (Post-MVP)

---

## User Story

**As a** user
**I want to** toggle between light and dark mode
**So that** I can use the app comfortably in any lighting condition

---

## Description

This story implements the core theme toggle functionality for the Upex My Mentor platform. Users should be able to switch between light and dark color schemes through an easily accessible UI control in the navbar.

The design system already has CSS variables prepared for both themes in `globals.css`. This story focuses on:
1. Creating a ThemeProvider context to manage theme state
2. Building a theme toggle button component
3. Integrating the toggle into the Navbar
4. Ensuring all UI elements respond correctly to theme changes

This is a foundational story for the Dark Mode epic - subsequent stories build upon this toggle mechanism.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: User toggles from light to dark mode
- **Given:** The user is viewing the application in light mode
- **When:** The user clicks the theme toggle button in the navbar
- **Then:** The application switches to dark mode immediately
- **And:** All UI elements reflect the dark theme colors
- **And:** The toggle icon changes to indicate dark mode is active (moon icon)

### Scenario 2: User toggles from dark to light mode
- **Given:** The user is viewing the application in dark mode
- **When:** The user clicks the theme toggle button
- **Then:** The application switches to light mode immediately
- **And:** All UI elements reflect the light theme colors
- **And:** The toggle icon changes to indicate light mode is active (sun icon)

### Scenario 3: Theme toggle is accessible via keyboard
- **Given:** The user is navigating via keyboard
- **When:** The user focuses on the theme toggle and presses Enter or Space
- **Then:** The theme toggles successfully
- **And:** Focus remains on the toggle button

### Scenario 4: Theme applies to all pages
- **Given:** The user has toggled to dark mode
- **When:** The user navigates to any page in the application
- **Then:** Dark mode is consistently applied across all pages

---

## Technical Notes

### Frontend

**Components to create:**
- `src/contexts/theme-context.tsx` - ThemeProvider context
- `src/components/ui/theme-toggle.tsx` - Toggle button component

**Components to modify:**
- `src/components/layout/navbar.tsx` - Add theme toggle button
- `src/app/layout.tsx` - Wrap app with ThemeProvider

### Backend
- N/A - Client-side only feature

### Database
- N/A - No database changes required

### Implementation Approach

**Recommended: Use next-themes library**

```bash
bun add next-themes
```

**ThemeProvider setup:**
```tsx
// src/contexts/theme-context.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Theme Toggle component:**
```tsx
// src/components/ui/theme-toggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

### Impact Analysis

**Affected areas:**
- Root layout (needs ThemeProvider wrapper)
- Navbar (add toggle button)
- All pages benefit from theme support

**No breaking changes** - additive feature only

---

## Dependencies

### Blocked By
- None

### Blocks
- MYM-71 (Persist theme preference) - builds on this toggle
- MYM-72 (System theme detection) - builds on this toggle

### Related Stories
- MYM-71 - Adds persistence to this toggle
- MYM-72 - Adds system detection

---

## UI/UX Considerations

- Toggle button should be clearly visible in navbar
- Use recognizable icons (Sun for light, Moon for dark)
- Smooth transition between themes (or instant with no flash)
- Button should have proper hover/focus states
- Consider tooltip explaining the action

**Placement:** Right side of navbar, near user menu or auth buttons

---

## Definition of Done

- [ ] ThemeProvider context created and wrapping app
- [ ] ThemeToggle component created with Sun/Moon icons
- [ ] Toggle integrated into Navbar
- [ ] Theme changes apply immediately to all components
- [ ] Keyboard accessible (Enter/Space to toggle)
- [ ] Works in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Code review approved
- [ ] No TypeScript errors
- [ ] Manual QA passed

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-69-dark-mode-theme/epic.md`
- **Design System:** `.context/design-system.md`
- **Global Styles:** `src/app/globals.css`
