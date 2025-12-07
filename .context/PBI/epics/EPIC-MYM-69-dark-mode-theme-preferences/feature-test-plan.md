# Feature Test Plan: EPIC-MYM-69 - Dark Mode & Theme Preferences

**Fecha:** 2025-12-07
**QA Lead:** Gemini
**Epic Jira Key:** MYM-69
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

Esta épica mejora directamente la usabilidad y la experiencia del usuario (UX) de la plataforma. Al ofrecer un modo oscuro, se reduce la fatiga visual en entornos de poca luz, una necesidad común para los desarrolladores que pasan largas horas frente a la pantalla. Esto incrementa la satisfacción y el tiempo de permanencia en la plataforma.

**Key Value Proposition:**
- **Para Estudiantes y Mentores:** Mejora la comodidad visual y la accesibilidad, permitiendo un uso prolongado de la plataforma sin importar las condiciones de iluminación.

**Success Metrics (KPIs):**
- **Engagement:** Un aumento en la duración promedio de la sesión podría ser un indicador indirecto de mayor comodidad del usuario.
- **Adopción:** Podríamos medir cuántos usuarios activan y mantienen el modo oscuro.

**User Impact:**
- **Laura, la Desarrolladora Junior:** Como usuaria principal que pasa mucho tiempo en la plataforma, el modo oscuro es casi una expectativa estándar para reducir la fatiga visual.
- **Carlos, el Arquitecto Senior:** También se beneficia de una interfaz más cómoda durante las sesiones de mentoría nocturnas o en entornos de baja luminosidad.
- **Sofía, la Cambiadora de Carrera:** Aprecia una interfaz moderna y personalizable que se alinea con las herramientas de desarrollo que utiliza a diario.

**Critical User Journeys:**
- Este feature impacta transversalmente todos los user journeys, ya que es un cambio en la UI global. Afecta principalmente la experiencia visual durante el "Registro de Estudiante y Reserva de Primera Sesión" y el "Registro de Mentor y Configuración de Perfil".

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**
- **Componentes a crear/modificar:**
    - `ThemeProvider` (Contexto para gestionar el tema).
    - `ThemeToggle` (Botón para cambiar de tema, probablemente en el `Navbar`).
    - Modificaciones a `globals.css` para asegurar que las variables de color para light/dark estén correctamente definidas.
- **Páginas/rutas afectadas:** Todas las páginas de la aplicación.

**Backend:**
- No hay impacto directo en la API. La preferencia del tema se gestionará en el frontend, posiblemente utilizando `localStorage` para persistencia.

**Database:**
- No hay impacto directo en el esquema de la base de datos para el MVP. En una v2, se podría persistir la preferencia del usuario en la tabla `USERS`.

**External Services:**
- Ninguno.

### Integration Points (Critical for Testing)

**Internal Integration Points:**
- `ThemeToggle` ↔ `ThemeProvider`: El botón debe comunicar el cambio de estado al proveedor de contexto.
- `ThemeProvider` ↔ `<html>` element: El proveedor debe aplicar la clase `dark` al elemento raíz del DOM para que Tailwind CSS aplique los estilos correctos.

**Data Flow:**
```
User clicks ThemeToggle -> ThemeProvider updates state -> 'dark' class is added/removed on <html> -> Tailwind CSS applies dark/light theme styles -> State is persisted in localStorage.
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Inconsistencias de UI en el modo oscuro

- **Impact:** Medium
- **Likelihood:** High
- **Area Affected:** Frontend
- **Mitigation Strategy:**
  - Realizar una revisión visual exhaustiva de todos los componentes de la UI en ambos modos.
  - Asegurarse de que todos los colores de texto, fondo e íconos estén definidos con las variables de CSS de `shadcn/ui` y Tailwind (`--primary`, `--secondary`, `--background`, etc.) y no con colores hardcodeados.
- **Test Coverage Required:** Test cases visuales para cada componente interactivo y página principal en modo oscuro.

### Business Risks

#### Risk 1: El tema no se persiste correctamente

- **Impact on Users:** Frustración si el usuario tiene que cambiar el tema en cada visita.
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Implementar la persistencia del tema usando `localStorage`.
  - Probar que la preferencia se mantiene al recargar la página, cerrar y abrir el navegador.
- **Acceptance Criteria Validation:** La historia debe incluir un AC para la persistencia.

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** ¿Cuál es el tema por defecto para un nuevo usuario?
- **Found in:** Story `MYM-70` (implícito)
- **Question for PO:** ¿Debería el tema por defecto ser el del sistema operativo del usuario (`prefers-color-scheme`) o siempre "light"?
- **Impact if not clarified:** Podríamos implementar un comportamiento por defecto que no sea el esperado.

### Suggested Improvements (Before Implementation)

**Improvement 1:** Añadir persistencia de la preferencia del tema.
- **Story Affected:** `MYM-70`
- **Current State:** La historia no menciona explícitamente la persistencia.
- **Suggested Change:** Agregar un criterio de aceptación: "Given a user has selected a theme, When they reload the page, Then the selected theme should be maintained."
- **Benefit:** Mejora significativamente la experiencia de usuario.

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**
- Functional testing del toggle de tema.
- Visual testing de las páginas principales en modo claro y oscuro.
- Cross-browser testing (Chrome, Firefox, Safari).
- Mobile responsiveness del toggle y la correcta visualización del tema.
- Persistencia del tema seleccionado.

**Out of Scope (For This Epic):**
- Testing de rendimiento exhaustivo relacionado con el cambio de tema.
- Guardar la preferencia del tema en la base de datos (se usará `localStorage` para el MVP).

### Test Levels

- **Unit Testing:**
  - **Focus Areas:** Lógica del `ThemeProvider` para cambiar y persistir el tema.
- **E2E Testing:**
  - **Tool:** Playwright.
  - **Focus Areas:** Flujo completo de un usuario cambiando de tema y verificando que se aplique correctamente en diferentes páginas.

---

## 📊 Test Cases Summary by Story

### STORY-MYM-70: As a user, I want to toggle between light and dark mode...

**Complexity:** Low
**Estimated Test Cases:** 8

- Positive: 3
- Negative: 1 (verificar que no haya fallos si localStorage no está disponible)
- Boundary: 2 (cambios rápidos, interacciones con otras partes de la UI)
- E2E: 2

**Rationale for estimate:**
La funcionalidad es autocontenida y de bajo riesgo, pero requiere validación visual en múltiples estados y persistencia.

---

## 🗂️ Test Data Requirements

No se requiere data específica del backend. El testing se centrará en el estado del frontend y `localStorage`.

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)
- [ ] Story implementada y desplegada en staging.
- [ ] Unit tests para el `ThemeProvider` creados y pasando.
- [ ] Dev confirma que el toggle funciona en su entorno local.

### Exit Criteria (Per Story)
- [ ] Todos los test cases ejecutados.
- [ ] 100% de los test cases críticos/altos pasando.
- [ ] No hay bugs visuales críticos en modo oscuro en las páginas principales.
- [ ] La persistencia del tema funciona correctamente.
