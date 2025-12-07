---
**Jira Key:** MYM-70
**Epic:** EPIC-MYM-69-dark-mode-theme-preferences
**Title:** As a user, I want to toggle between light and dark mode so that I can use the app comfortably in any lighting condition
---

## User Story

**As a** user
**I want to** toggle between light and dark mode
**So that** I can use the app comfortably in any lighting condition

## Description

This story implements the core theme toggle functionality. Users should be able to switch between light and dark color schemes through an easily accessible UI control. The toggle should be visible in the navbar and provide immediate visual feedback when activated.

The design system already has CSS variables prepared for both themes in `globals.css`. This story focuses on implementing the toggle mechanism and applying the theme class to the document.

## Acceptance Criteria (Gherkin format)

### Scenario 1: User toggles from light to dark mode

* **Given:** The user is viewing the application in light mode
* **When:** The user clicks the theme toggle button in the navbar
* **Then:** The application switches to dark mode immediately
* **And:** All UI elements reflect the dark theme colors
* **And:** The toggle icon changes to indicate dark mode is active

### Scenario 2: User toggles from dark to light mode

* **Given:** The user is viewing the application in dark mode
* **When:** The user clicks the theme toggle button
* **Then:** The application switches to light mode immediately
* **And:** All UI elements reflect the light theme colors
* **And:** The toggle icon changes to indicate light mode is active

### Scenario 3: Theme toggle is accessible via keyboard

* **Given:** The user is navigating via keyboard
* **When:** The user focuses on the theme toggle and presses Enter or Space
* **Then:** The theme toggles successfully
* **And:** Focus remains on the toggle button

## Technical Notes

### Frontend

* Create `ThemeProvider` context to manage theme state
* Add theme toggle button to Navbar component
* Use `next-themes` library or custom implementation
* Apply `dark` class to `<html>` element for Tailwind dark mode

### Implementation

* Toggle adds/removes `dark` class on document root
* CSS variables in globals.css already support dark mode values
* Use Lucide icons (Sun/Moon) for toggle button
