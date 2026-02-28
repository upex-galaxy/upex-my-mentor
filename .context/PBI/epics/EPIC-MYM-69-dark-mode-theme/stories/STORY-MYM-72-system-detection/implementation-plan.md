# Implementation Plan: STORY-MYM-72 - Detect System Theme Preference

## Overview

Implementar detección automática de preferencia de tema del sistema operativo, permitiendo al usuario elegir entre Light, Dark y System.

**Estado actual:**
- ThemeProvider ya tiene `defaultTheme="system"` y `enableSystem` habilitado
- ThemeToggle actual solo permite toggle entre light ↔ dark
- Al hacer toggle, se sobrescribe la preferencia "system"

**Lo que falta:**
- Opción explícita "System" en la UI para que el usuario pueda revertir a detección automática

**Acceptance Criteria a cumplir:**

- AC1: App detecta preferencia oscura del sistema en primera visita
- AC2: App detecta preferencia clara del sistema en primera visita
- AC3: Preferencia manual sobrescribe preferencia del sistema
- AC4: App responde a cambios de tema del sistema en tiempo real
- AC5: Usuario puede elegir explícitamente "System" para revertir a detección automática

---

## Test Cases Mapping (de Jira)

| Test Case | Descripción | Step de Implementación |
|-----------|-------------|------------------------|
| TC-MYM72-01 | Detección automática tema oscuro primera visita | Ya funciona (ThemeProvider) |
| TC-MYM72-02 | Detección automática tema claro primera visita | Ya funciona (ThemeProvider) |
| TC-MYM72-03 | Selección manual sobrescribe sistema | Ya funciona (toggle actual) |
| TC-MYM72-04 | App reacciona en tiempo real a cambios del sistema | Ya funciona (enableSystem) |
| TC-MYM72-05 | Revertir a "System" después de selección manual | **Step 1: Implementar dropdown** |

---

## Technical Approach

**Chosen approach:** Convertir ThemeToggle de botón simple a DropdownMenu con 3 opciones

**Verificación Context7 (next-themes):**
- `useTheme()` provee: `theme`, `setTheme()`, `resolvedTheme`, `systemTheme`
- `setTheme('system')` revierte a detección automática del sistema
- API confirmada y estable

**Alternatives considered:**

- **Cycle toggle (Light → Dark → System → Light):** Más simple pero menos descubrible
- **Separate button for System:** UI más compleja, innecesario

**Why dropdown approach:**

- ✅ Las 3 opciones son claramente visibles
- ✅ Usuario entiende que "Sistema" es una opción explícita
- ✅ Usa componentes existentes del design system (DropdownMenu)
- ✅ Recomendado en story.md

---

## UI/UX Design

### Componentes del Design System a usar:

**Componentes existentes:**
- ✅ `Button` → variant="ghost", size="icon" (trigger del dropdown)
- ✅ `DropdownMenu` → Ya existe en `@/components/ui/dropdown-menu`
- ✅ Iconos Lucide: `Sun`, `Moon`, `Monitor`

### Componentes a modificar:

- 🔄 `src/components/ui/theme-toggle.tsx`
  - **Cambio:** De botón toggle a DropdownMenu
  - **Props:** Sin cambios (componente sin props)
  - **Ubicación:** Mismo archivo

### Diseño del Dropdown:

```
┌─────────────────────┐
│ [Sun/Moon Icon] ▼   │  ← Button trigger (muestra icono del tema actual)
├─────────────────────┤
│ ☀️ Claro           │  ← setTheme('light')
│ 🌙 Oscuro          │  ← setTheme('dark')
│ 💻 Sistema         │  ← setTheme('system')
└─────────────────────┘
```

### Estados de UI:

- **Loading (SSR):** Botón deshabilitado con icono Sun
- **Mounted:** Dropdown funcional con icono que refleja tema actual
- **Active item:** Checkmark o highlight en la opción seleccionada

### Accesibilidad:

- Keyboard navigation (Enter/Space para abrir, Arrow keys para navegar)
- ARIA labels descriptivos
- Focus visible en opciones

---

## Implementation Steps

### **Step 1: Modificar ThemeToggle a Dropdown**

**Task:** Reemplazar el botón toggle simple por un DropdownMenu con 3 opciones

**File:** `src/components/ui/theme-toggle.tsx`

**Cambios:**
1. Importar componentes de DropdownMenu
2. Importar icono `Monitor` de Lucide
3. Cambiar estructura de Button a DropdownMenu
4. Usar `theme` (no `resolvedTheme`) para determinar opción activa
5. Agregar las 3 opciones: Light, Dark, System

**API de next-themes a usar:**
```typescript
const { theme, setTheme, resolvedTheme } = useTheme()
// theme: 'light' | 'dark' | 'system' (lo que el usuario eligió)
// resolvedTheme: 'light' | 'dark' (el tema realmente aplicado)
```

**Lógica de iconos:**
- Trigger button: Mostrar Sun/Moon basado en `resolvedTheme`
- Menu items: Icono fijo por opción (Sun, Moon, Monitor)

**Testing:**
- Manual: Verificar que dropdown abre y cierra
- Manual: Verificar que cada opción cambia el tema
- Manual: Verificar que "Sistema" activa detección automática

**Estimated time:** 30 min

---

### **Step 2: Verificar Persistencia y Comportamiento**

**Task:** Confirmar que la persistencia en localStorage funciona correctamente

**Verificaciones:**
1. Seleccionar "Sistema" → `localStorage.theme` debe ser "system"
2. Reload → Debe cargar con tema del sistema
3. Cambiar preferencia del SO → App debe reaccionar (si está en "system")

**Testing:**
- Manual: Abrir DevTools > Application > localStorage
- Manual: Verificar valor de key "theme"
- Manual: Simular cambio de preferencia del sistema en DevTools

**Estimated time:** 15 min

---

### **Step 3: Linting y Build**

**Task:** Asegurar que el código pasa todas las validaciones

**Commands:**
```bash
bun run lint
bun run build
```

**Testing:**
- Lint: Sin errores ni warnings
- Build: Compilación exitosa

**Estimated time:** 5 min

---

## Technical Decisions

### Decision 1: Usar `theme` vs `resolvedTheme` para item activo

**Chosen:** Usar `theme` para determinar cuál opción está activa

**Reasoning:**
- ✅ `theme` muestra lo que el usuario eligió ("system", "light", "dark")
- ❌ `resolvedTheme` solo muestra "light" o "dark", no distingue "system"

### Decision 2: Texto en español

**Chosen:** Usar "Claro", "Oscuro", "Sistema" (consistente con tooltip actual)

**Reasoning:**
- ✅ El tooltip actual ya usa español ("Cambiar a modo claro/oscuro")
- ✅ Consistencia con el resto de la UI

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] `next-themes` instalado (^0.4.6) ✓
- [x] `DropdownMenu` component disponible ✓
- [x] ThemeProvider configurado con `enableSystem` ✓

---

## Risks & Mitigations

**Risk 1:** Hydration mismatch al mostrar tema en SSR

- **Impact:** Low
- **Mitigation:** Ya existe patrón `mounted` en el componente actual

**Risk 2:** DropdownMenu no existe en el proyecto

- **Impact:** Medium
- **Mitigation:** Verificar existencia, si no existe usar shadcn CLI para agregarlo

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Modificar ThemeToggle a Dropdown | 30 min |
| 2. Verificar persistencia | 15 min |
| 3. Linting y Build | 5 min |
| **Total** | **50 min** |

**Story points:** 3 (match con story.md)

---

## Definition of Done Checklist

- [ ] ThemeToggle muestra dropdown con 3 opciones (Light, Dark, System)
- [ ] Opción "Sistema" funciona y activa detección automática
- [ ] Item activo está visualmente marcado en el dropdown
- [ ] Persistencia funciona correctamente
- [ ] Sin errores de linting
- [ ] Build exitoso
- [ ] Tests manuales pasando:
  - [ ] TC-MYM72-01: Detección automática tema oscuro
  - [ ] TC-MYM72-02: Detección automática tema claro
  - [ ] TC-MYM72-03: Selección manual sobrescribe sistema
  - [ ] TC-MYM72-04: Reacción en tiempo real a cambios
  - [ ] TC-MYM72-05: Revertir a "Sistema" funciona

---

_Generado: 2026-02-25_
_Branch: feat/MYM-72/system-theme-detection_
