# Test Cases: STORY-MYM-70 - As a user, I want to toggle between light and dark mode

**Fecha:** 2025-12-07
**QA Engineer:** Gemini
**Story Jira Key:** MYM-70
**Epic:** EPIC-MYM-69 - Dark Mode & Theme Preferences
**Status:** Draft

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary:** Laura, la Desarrolladora Junior. Pasa muchas horas codificando y valora enormemente el modo oscuro para reducir la fatiga visual.
- **Secondary:** Carlos, el Arquitecto Senior. También se beneficia al dar o recibir mentorías fuera del horario laboral.

**Business Value:**
- **Value Proposition:** Mejora directa de la Experiencia de Usuario (UX) y la accesibilidad, alineando la plataforma con las expectativas estándar de las herramientas para desarrolladores.
- **Business Impact:** Aumenta la satisfacción y retención del usuario al proporcionar una experiencia de visualización más cómoda.

**Related User Journey:**
- **Journey:** Afecta a todos los journeys.
- **Step:** Es una funcionalidad transversal disponible en todo momento a través de la barra de navegación.

### Technical Context of This Story

**Architecture Components:**
**Frontend:**
- **Components:** `ThemeProvider`, `ThemeToggle` (en `Navbar`), `globals.css` (variables de color).
- **State Management:** Se utilizará React Context (`ThemeProvider`) y `localStorage` para la persistencia.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** ¿Debería el tema por defecto para un nuevo usuario ser el del sistema operativo (`prefers-color-scheme`)?
- **Location in Story:** No especificado en la descripción.
- **Question for PO:** ¿Cuál es el comportamiento deseado para la primera visita de un usuario? ¿Se respeta la configuración del SO o se fuerza el modo claro?
- **Impact on Testing:** Afecta los test cases para el estado inicial de la aplicación.
- **Suggested Clarification:** Recomiendo usar el tema del sistema como default, es una práctica moderna y centrada en el usuario.

### Missing Information / Gaps

**Gap 1:** Persistencia del tema.
- **Type:** Acceptance Criteria.
- **Why It's Critical:** Sin persistencia, la funcionalidad pierde gran parte de su valor, ya que el usuario tendría que cambiar el tema en cada visita/recarga.
- **Suggested Addition:** Añadir un criterio de aceptación que valide que el tema seleccionado se guarda y se aplica en visitas posteriores.

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** El usuario tiene `localStorage` deshabilitado.
- **Scenario:** Un usuario con configuración de navegador muy restrictiva.
- **Expected Behavior:** La aplicación debería funcionar sin errores, aunque el cambio de tema no será persistente entre sesiones. El estado debería manejarse en memoria para la sesión actual.
- **Criticality:** Medium.
- **Action Required:** Añadir a los test cases.

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: User toggles from light to dark mode (Happy Path)

- **Given:** The user is on any page of the application and the current theme is light.
- **When:** The user clicks the theme toggle button (showing a sun icon).
- **Then:** The `<html>` element immediately gets the `dark` class applied.
- **And:** All UI elements switch to their dark theme variants as defined in `globals.css`.
- **And:** The theme toggle button now shows a moon icon.
- **And:** The selected theme ('dark') is saved to `localStorage`.

### Scenario 2: User toggles from dark to light mode

- **Given:** The user is on any page and the current theme is dark.
- **When:** The user clicks the theme toggle button (showing a moon icon).
- **Then:** The `dark` class is immediately removed from the `<html>` element.
- **And:** All UI elements switch back to their light theme variants.
- **And:** The theme toggle button now shows a sun icon.
- **And:** The selected theme ('light') is saved to `localStorage`.

### Scenario 3: Theme preference is persistent

- **Given:** A user has previously selected the dark theme.
- **When:** The user closes the browser tab and re-opens the application.
- **Then:** The application should load directly in dark theme.

### Scenario 4: Theme toggle is keyboard accessible

- **Given:** The user is navigating the `Navbar` using the Tab key.
- **When:** The user focuses on the theme toggle button and presses `Enter` or `Space`.
- **Then:** The theme toggles successfully.
- **And:** The keyboard focus remains on the toggle button.

---

## 🧪 FASE 4: Test Design

### Test Cases

#### **TC-001: Toggle from Light to Dark Mode**
- **Type:** Positive
- **Priority:** Critical
- **Test Level:** E2E
- **Preconditions:** The application is loaded and the current theme is light.
- **Test Steps:**
  1. Observe that the `<html>` element does not have the `dark` class.
  2. Observe that the theme toggle button displays a sun icon.
  3. Click the theme toggle button.
- **Expected Result:**
  - The `<html>` element now has the `dark` class.
  - The UI immediately changes to a dark color scheme.
  - The theme toggle button now displays a moon icon.
  - The value in `localStorage` for the theme key is `"dark"`.

#### **TC-002: Toggle from Dark to Light Mode**
- **Type:** Positive
- **Priority:** Critical
- **Test Level:** E2E
- **Preconditions:** The application is in dark mode (e.g., after executing TC-001).
- **Test Steps:**
  1. Observe that the `<html>` element has the `dark` class.
  2. Observe that the theme toggle button displays a moon icon.
  3. Click the theme toggle button.
- **Expected Result:**
  - The `dark` class is removed from the `<html>` element.
  - The UI immediately changes to a light color scheme.
  - The theme toggle button now displays a sun icon.
  - The value in `localStorage` for the theme key is `"light"`.

#### **TC-003: Theme preference persists after reload**
- **Type:** Positive
- **Priority:** High
- **Test Level:** E2E
- **Preconditions:** The user has selected the dark theme.
- **Test Steps:**
  1. Set the theme to dark.
  2. Reload the page.
- **Expected Result:**
  - The page loads directly with the dark theme applied.
  - The `<html>` element has the `dark` class upon initial load.

#### **TC-004: Keyboard navigation toggles theme**
- **Type:** Accessibility
- **Priority:** High
- **Test Level:** E2E
- **Preconditions:** The application is loaded.
- **Test Steps:**
  1. Press the `Tab` key until the theme toggle button has focus.
  2. Press the `Enter` key.
  3. Verify the theme has changed (e.g., to dark).
  4. Press the `Space` key.
- **Expected Result:**
  - The theme toggles correctly on both `Enter` and `Space` key presses.
  - Focus remains on the toggle button after the action.

#### **TC-005: Behavior with localStorage disabled**
- **Type:** Negative
- **Priority:** Medium
- **Test Level:** Manual
- **Preconditions:** `localStorage` is disabled in the browser settings.
- **Test Steps:**
  1. Load the application.
  2. Click the theme toggle button to change the theme.
  3. Verify the theme changes visually.
  4. Reload the page.
- **Expected Result:**
  - The theme changes for the current session without JavaScript errors in the console.
  - After reloading, the theme reverts to the default (e.g., light or system preference), as it could not be persisted.
