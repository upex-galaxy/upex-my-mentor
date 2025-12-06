# Detect System Theme Preference

**Jira Key:** MYM-72
**Epic:** MYM-69 (Dark Mode & Theme Preferences)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do
**Assignee:** null
**Type:** Feature (Post-MVP)

---

## User Story

**As a** user
**I want to** have the app detect my system theme preference
**So that** it automatically matches my device settings without manual configuration

---

## Description

This story implements automatic detection of the user's operating system theme preference. Modern operating systems (Windows, macOS, iOS, Android) allow users to set a system-wide light or dark mode preference. The application should respect this preference by default, providing a seamless experience that matches the user's device settings.

Additionally, when the user has selected "System" as their theme preference, the app should respond in real-time when they change their system theme - without requiring a page refresh.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: App detects dark system preference on first visit
- **Given:** The user's operating system is set to dark mode
- **And:** The user has not previously set a theme preference in the app
- **When:** The user visits the application for the first time
- **Then:** The application loads in dark mode automatically

### Scenario 2: App detects light system preference on first visit
- **Given:** The user's operating system is set to light mode
- **And:** The user has not previously set a theme preference in the app
- **When:** The user visits the application for the first time
- **Then:** The application loads in light mode automatically

### Scenario 3: Manual preference overrides system preference
- **Given:** The user's operating system is set to dark mode
- **And:** The user manually selects light mode in the app
- **When:** The user returns to the application later
- **Then:** Light mode is applied (manual preference takes priority)
- **And:** System dark mode is ignored

### Scenario 4: App responds to system theme changes in real-time
- **Given:** The user is viewing the application
- **And:** The user's theme is set to "System" (not manual light/dark)
- **When:** The user changes their system theme from light to dark
- **Then:** The application theme updates to dark mode automatically
- **And:** No page refresh is required

### Scenario 5: User can explicitly choose system theme
- **Given:** The user has manually set light mode previously
- **When:** The user selects "System" from the theme options
- **Then:** The app switches to match the current system preference
- **And:** Future system changes are reflected automatically

---

## Technical Notes

### Frontend

**Components to modify:**
- `src/components/ui/theme-toggle.tsx` - Add system option or cycle through light/dark/system

### Backend
- N/A - Client-side only feature

### Database
- N/A - Using browser APIs

### Implementation Details

**System detection API:**
```javascript
// Check current system preference
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

// Listen for changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    const newColorScheme = e.matches ? 'dark' : 'light'
  })
```

**next-themes handles this automatically with `enableSystem`:**
```tsx
<NextThemesProvider
  attribute="class"
  defaultTheme="system"  // Use system preference by default
  enableSystem           // Enable system theme detection
>
  {children}
</NextThemesProvider>
```

**Enhanced Theme Toggle (3-state):**
```tsx
// Option 1: Cycle through themes
const cycleTheme = () => {
  if (theme === 'light') setTheme('dark')
  else if (theme === 'dark') setTheme('system')
  else setTheme('light')
}

// Option 2: Dropdown menu with 3 options
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => setTheme('light')}>
      <Sun className="mr-2 h-4 w-4" /> Light
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setTheme('dark')}>
      <Moon className="mr-2 h-4 w-4" /> Dark
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setTheme('system')}>
      <Monitor className="mr-2 h-4 w-4" /> System
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Priority Order

1. **Manual preference** (user explicitly chose light or dark)
2. **System preference** (when set to "system" or no preference saved)
3. **Default** (light, if system detection fails)

### Browser Support

`prefers-color-scheme` media query is supported in:
- Chrome 76+
- Firefox 67+
- Safari 12.1+
- Edge 79+

All modern browsers support this feature.

### Impact Analysis

**Affected areas:**
- ThemeToggle component (may need UI update for 3 options)
- ThemeProvider configuration

**No breaking changes** - extends existing functionality

---

## Dependencies

### Blocked By
- MYM-70 (Toggle theme) - Need basic toggle working
- MYM-71 (Persist preference) - Need persistence to distinguish manual vs system

### Blocks
- None

### Related Stories
- MYM-70 - Base toggle functionality
- MYM-71 - Persistence (differentiates "system" from explicit choice)

---

## UI/UX Considerations

**Option A: Simple Toggle (cycle)**
- Click cycles: Light → Dark → System → Light
- Show current mode with icon
- Pros: Simple, minimal UI
- Cons: System option not immediately discoverable

**Option B: Dropdown Menu (recommended)**
- Click opens dropdown with 3 clear options
- Icons: Sun (Light), Moon (Dark), Monitor (System)
- Pros: Clear options, user understands system setting
- Cons: Extra click to change theme

**Recommendation:** Start with dropdown menu for clarity. Users should understand they can defer to system settings.

---

## Definition of Done

- [ ] System preference detected on first visit (no saved preference)
- [ ] "System" option available in theme selector
- [ ] Manual preference overrides system preference
- [ ] Real-time response to system theme changes
- [ ] Works on Windows, macOS, and mobile devices
- [ ] Works in all major browsers
- [ ] Code review approved
- [ ] Manual QA passed - test system theme change

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-69-dark-mode-theme/epic.md`
- **Related Stories:**
  - `.context/PBI/epics/EPIC-MYM-69-dark-mode-theme/stories/STORY-MYM-70-toggle-theme/story.md`
  - `.context/PBI/epics/EPIC-MYM-69-dark-mode-theme/stories/STORY-MYM-71-persist-preference/story.md`
- **MDN prefers-color-scheme:** https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
