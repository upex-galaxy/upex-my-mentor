# Fase 6: Planning (Implementation Plans)

## Propósito

Crear planes técnicos de implementación **ANTES** de escribir código. Define el approach técnico, decisiones de arquitectura, y estructura de archivos a crear.

**Por qué existe esta fase:**

- Reduce re-trabajo por decisiones técnicas incorrectas
- Documenta el "cómo" antes de implementar
- Facilita code review (el plan es el benchmark)
- Permite validar approach con MCPs de documentación

---

## Pre-requisitos

- Fase 5 completada:
  - `feature-test-plan.md` (Epic level)
  - `acceptance-test-plan.md` (Story level)
- Contexto técnico:
  - `.context/SRS/*.md`
  - `.context/design-system.md` (si hay UI)
- MCPs disponibles:
  - Context7 (documentación de librerías)
  - Supabase MCP (si hay backend)
  - shadcn MCP (si hay UI components)

---

## Prompts en Esta Fase

| Orden | Prompt                           | Nivel | Propósito                          |
| ----- | -------------------------------- | ----- | ---------------------------------- |
| 1     | `feature-implementation-plan.md` | Epic  | Arquitectura y decisiones técnicas |
| 2     | `story-implementation-plan.md`   | Story | Plan detallado de implementación   |

---

## Flujo de Ejecución

```
Test Plans (Fase 5)
        ↓
┌───────────────────────────────────────┐
│  [1] Feature Implementation Plan       │
│      (Epic Level)                      │
├───────────────────────────────────────┤
│                                        │
│  Input:                                │
│  - Epic + Stories                      │
│  - SRS completo                        │
│  - Feature Test Plan                   │
│  - Design System                       │
│                                        │
│  Decisiones:                           │
│  - Stack técnico específico            │
│  - Patrones de arquitectura            │
│  - Librerías a usar (validar con MCP)  │
│  - Estructura de carpetas              │
│                                        │
│  Output:                               │
│  - feature-implementation-plan.md      │
│                                        │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│  [2] Story Implementation Plan         │
│      (Story Level)                     │
├───────────────────────────────────────┤
│                                        │
│  Input:                                │
│  - Story + Test Cases                  │
│  - Feature Implementation Plan         │
│  - SRS relevante                       │
│  - Design System                       │
│                                        │
│  Decisiones:                           │
│  - Technical approach específico       │
│  - Archivos a crear/modificar          │
│  - UI/UX design (si aplica)            │
│  - Implementation checklist            │
│                                        │
│  Output:                               │
│  - implementation-plan.md              │
│                                        │
└───────────────────────────────────────┘
```

---

## Verificación con MCPs

```
┌─────────────────────────────────────────────────────────────┐
│           MCP VERIFICATION (OBLIGATORIO)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ANTES de tomar decisiones técnicas:                        │
│                                                              │
│  1. Context7 MCP (MÁS IMPORTANTE)                           │
│     - Verificar APIs de librerías                           │
│     - Confirmar métodos/hooks existen                       │
│     - Obtener best practices actualizadas                   │
│                                                              │
│  2. Supabase MCP (si hay backend/DB)                        │
│     - Verificar capacidades de Supabase                     │
│     - Confirmar APIs disponibles                            │
│     - Patrones recomendados                                 │
│                                                              │
│  3. shadcn MCP (si hay UI)                                  │
│     - Buscar componentes existentes                         │
│     - Evitar crear custom si shadcn tiene                   │
│     - Verificar variantes disponibles                       │
│                                                              │
│  Beneficio: Decisiones basadas en docs oficiales            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos Generada

```
.context/PBI/epics/
└── EPIC-{KEY}-{NUM}-{nombre}/
    ├── epic.md
    ├── feature-test-plan.md
    ├── feature-implementation-plan.md    # ← Generado por feature-implementation-plan.md
    └── stories/
        └── STORY-{KEY}-{NUM}-{nombre}/
            ├── story.md
            ├── acceptance-test-plan.md
            └── implementation-plan.md    # ← Generado por story-implementation-plan.md
```

---

## Contenido del Implementation Plan

### Feature Level

```markdown
# Feature Implementation Plan: EPIC-XXX

## Overview

- Descripción high-level
- Stories incluidas
- Stack técnico

## Technical Decisions

- Decisiones de arquitectura
- Librerías seleccionadas (verificadas con Context7)
- Patrones a usar
- Trade-offs considerados

## File Structure

- Carpetas a crear
- Archivos nuevos
- Archivos a modificar

## Dependencies

- Entre stories
- Con otros sistemas
- Librerías externas
```

### Story Level

```markdown
# Implementation Plan: STORY-XXX

## Overview

- Acceptance Criteria
- Approach técnico

## Technical Approach

- Solución elegida
- Alternativas consideradas
- Verificación con Context7

## UI/UX Design (si aplica)

- Wireframe ASCII
- Componentes a usar
- Estados de UI

## Implementation Checklist

- [ ] Paso 1: ...
- [ ] Paso 2: ...
- [ ] Paso N: ...

## Files to Create/Modify

- Lista de archivos con descripción
```

---

## Roles Asumidos por la IA

| Prompt                           | Roles                                                |
| -------------------------------- | ---------------------------------------------------- |
| `feature-implementation-plan.md` | Senior Software Architect, Tech Lead, UI/UX Designer |
| `story-implementation-plan.md`   | Senior Full-Stack Developer, UI/UX Designer          |

---

## Output de Esta Fase

- **Por Epic:** `feature-implementation-plan.md` con arquitectura
- **Por Story:** `implementation-plan.md` con plan detallado
- **Decisiones validadas:** Con MCPs de documentación
- **Base para:** Fase 7 (Implementation)

---

## Siguiente Fase

Con implementation plans definidos:

- Proceder a **Fase 7: Implementation**
- Seguir los planes creados
- Code = ejecutar el plan

---

## FAQ

**P: ¿Por qué verificar con Context7 antes de decidir?**
R: El conocimiento de la IA puede estar desactualizado. Context7 proporciona documentación oficial actual.

**P: ¿Debo crear plan para TODAS las stories?**
R: Recomendado para stories complejas. Stories triviales pueden tener planes simplificados.

**P: ¿Qué pasa si el plan necesita cambios durante implementación?**
R: Actualiza el plan. Es un documento vivo, no un contrato rígido.

---

## Documentación Relacionada

- **Test Plans:** `.context/PBI/epics/*/feature-test-plan.md`
- **SRS:** `.context/SRS/`
- **Design System:** `.context/design-system.md`
- **Main README:** `.prompts/README.md`
- **Fase 7:** `.prompts/fase-7-implementation/README.md`
