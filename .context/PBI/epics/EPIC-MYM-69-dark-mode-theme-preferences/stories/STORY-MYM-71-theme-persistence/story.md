# User Story: Theme Preference Persistence

**ID:** MYM-71
**Epic:** EPIC-MYM-2-user-authentication-profiles

## User Story
**As a** user
**I want** to have my theme preference persisted
**So that** it remains consistent across browser sessions

## Description
This story ensures that once a user selects their preferred theme (light or dark), that preference is saved and automatically applied when they return to the application. This creates a seamless experience where users don't have to re-select their theme every time they visit.

## Acceptance Criteria (Gherkin format)

### Scenario 1: Theme preference is saved after selection
**Given** The user is viewing the application
**When** The user toggles to dark mode
**Then** The preference is saved to localStorage
**And** The key `theme` contains the value `dark`

### Scenario 2: Saved theme is applied on page load
**Given** The user previously selected dark mode
**And** The preference is saved in localStorage
**When** The user opens the application in a new session
**Then** Dark mode is automatically applied
**And** No flash of light theme occurs during load

### Scenario 3: Theme persists across page navigation
**Given** The user has selected dark mode
**When** The user navigates to different pages within the app
**Then** Dark mode remains active on all pages

### Scenario 4: Clearing localStorage resets to default
**Given** The user has a saved theme preference
**When** The user clears their browser localStorage
**And** Reloads the application
**Then** The application uses the default theme (light) or system preference

## Technical Notes

### Frontend
- Use `localStorage` key: `theme`
- Values: `light`, `dark`, or `system`
- Apply theme before first paint to prevent FOUC (Flash of Unstyled Content)
- Consider using a script in `<head>` for immediate theme application

### Implementation
- Extend `ThemeProvider` to read/write `localStorage`
- Handle SSR considerations (check if window is defined)
- Use `next-themes` `suppressHydrationWarning` if needed
