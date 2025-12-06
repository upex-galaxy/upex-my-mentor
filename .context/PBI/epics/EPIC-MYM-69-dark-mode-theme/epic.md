# Dark Mode & Theme Preferences

**Jira Key:** MYM-69
**Status:** To Do
**Priority:** MEDIUM (Post-MVP Enhancement)
**Type:** New Feature (Post-MVP)

---

## Epic Description

This epic implements a comprehensive dark mode and theme preference system for the Upex My Mentor platform. It allows users to switch between light and dark color schemes, providing a comfortable viewing experience in any lighting condition.

The design system already has CSS variables prepared for both light and dark themes (defined in `globals.css`). This epic focuses on implementing the user-facing toggle, preference persistence, and system theme detection.

### Business Value

- **User Experience:** Reduces eye strain and improves usability in low-light environments
- **Accessibility:** Supports users who prefer or require dark interfaces
- **Modern Standard:** Dark mode is an expected feature in modern web applications
- **User Retention:** Personalization features increase user satisfaction and engagement

---

## User Stories

1. **MYM-70** - As a user, I want to toggle between light and dark mode so that I can use the app comfortably in any lighting condition
2. **MYM-71** - As a user, I want my theme preference to be persisted so that it remains consistent across sessions
3. **MYM-72** - As a user, I want the app to detect my system theme preference so that it automatically matches my device settings

**Total Story Points:** ~11 pts (5 + 3 + 3)

---

## Scope

### In Scope

- Theme toggle component in the UI (navbar)
- ThemeProvider context for state management
- Preference persistence using localStorage
- System theme preference detection via `prefers-color-scheme`
- Real-time response to system theme changes
- Smooth theme transitions (no flash of unstyled content)
- All existing components working correctly in both modes
- Keyboard accessibility for theme toggle

### Out of Scope

- Per-page theme settings
- Custom color themes beyond light/dark
- Theme scheduling (auto-switch by time of day)
- Syncing theme preference to user profile in database
- Theme preview before applying

---

## Acceptance Criteria (Epic Level)

### AC-1: Theme Toggle Functionality
- Users can toggle between light and dark mode via a visible UI control
- The toggle is accessible in the navbar on all pages
- Theme changes apply immediately without page reload

### AC-2: Preference Persistence
- Theme preference is saved to localStorage
- Preference persists across browser sessions
- No flash of incorrect theme on page load

### AC-3: System Theme Detection
- App detects system `prefers-color-scheme` preference
- System preference is used as default for new users
- Manual preference overrides system preference
- App responds to real-time system theme changes (when using system setting)

### AC-4: Visual Consistency
- All UI components render correctly in both themes
- Colors follow the design system variables
- No hardcoded colors that break in dark mode

---

## Related Functional Requirements

- N/A - This is a new post-MVP enhancement feature
- Related to general UX and accessibility requirements

---

## Technical Considerations

### Architecture

```
src/
├── contexts/
│   └── theme-context.tsx     # ThemeProvider for theme state
├── components/
│   ├── layout/
│   │   └── navbar.tsx        # Add theme toggle button
│   └── ui/
│       └── theme-toggle.tsx  # Theme toggle component
└── app/
    └── layout.tsx            # Wrap app with ThemeProvider
```

### Technology Choices

**Option 1: next-themes library (Recommended)**
- Battle-tested solution for Next.js
- Handles SSR, hydration, and FOUC prevention
- Supports system theme detection out of the box
- Minimal configuration required

**Option 2: Custom implementation**
- More control but more code to maintain
- Need to handle SSR edge cases manually
- Requires script injection for FOUC prevention

### CSS Variables (Already Defined)

The design system (`globals.css`) already has light/dark variables:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--muted-foreground`
- etc.

Tailwind is configured to use `class` strategy for dark mode, so adding `dark` class to `<html>` activates dark theme.

### Dependencies

- `next-themes` package (if using library approach)
- Lucide React icons (Sun, Moon) for toggle button

---

## Dependencies

### Blocked By
- None - This epic can be implemented independently

### Blocks
- None

### Related Stories
- Could enhance user profile settings in future (sync theme to account)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Theme toggle works | 100% | Manual QA |
| No FOUC on page load | 0 flashes | Manual testing |
| Preference persists | 100% | Automated tests |
| System detection works | All major browsers | Cross-browser testing |
| Accessibility | WCAG AA | Lighthouse audit |

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| FOUC on page load | Medium | Medium | Use next-themes or inject script in `<head>` |
| Hardcoded colors break dark mode | Medium | Low | Audit existing components, use design system variables |
| SSR hydration mismatch | Low | Medium | Use suppressHydrationWarning, proper client detection |
| Browser compatibility | Low | Low | Use standard APIs, test across browsers |

---

## Testing Strategy

### Unit Tests
- ThemeProvider context behavior
- Theme toggle component state changes
- localStorage read/write operations

### Integration Tests
- Theme persists across page navigation
- System preference detection
- Manual preference override

### E2E Tests (Playwright)
- Toggle theme and verify visual change
- Reload page and verify persistence
- Change system theme and verify app responds

### Manual Testing
- Visual inspection in both themes
- All pages render correctly
- No broken colors or contrast issues

---

## Implementation Plan

### Phase 1: Core Toggle (MYM-70)
1. Install next-themes package
2. Create ThemeProvider wrapper
3. Add ThemeToggle component
4. Integrate into Navbar
5. Test basic toggle functionality

### Phase 2: Persistence (MYM-71)
1. Configure next-themes storage
2. Verify localStorage behavior
3. Test persistence across sessions
4. Prevent FOUC with proper setup

### Phase 3: System Detection (MYM-72)
1. Add "system" option to theme selector
2. Test prefers-color-scheme detection
3. Implement real-time change listener
4. Verify priority order (manual > system > default)

---

## Notes

- The design system already has all color variables defined for dark mode
- This is a post-MVP enhancement that improves UX
- Consider adding to user settings page in future iteration
- Industry standard feature - most modern apps support dark mode

---

## Related Documentation

- **Design System:** `.context/design-system.md`
- **Frontend Architecture:** `.context/frontend-architecture.md`
- **Global Styles:** `src/app/globals.css`
- **Tailwind Config:** `tailwind.config.ts`

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-04 | 1.0.0 | Initial epic documentation |
