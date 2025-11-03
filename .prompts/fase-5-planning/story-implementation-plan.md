Actúa como Senior Full-Stack Developer.

**Input:**
- Story: [usar .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/story.md]
- Test Cases: [usar .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/test-cases.md]
- Feature Implementation Plan: [usar .context/PBI/epics/EPIC-XXX/feature-implementation-plan.md]
- SRS relevante: [usar secciones relacionadas de .context/SRS/]

**Genera archivo: implementation-plan.md** (dentro de .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/)

---

# Implementation Plan: STORY-XXX - [Story Title]

## Overview

Implementar funcionalidad de [descripción breve].

**Acceptance Criteria a cumplir:**
- [Criterio 1]
- [Criterio 2]
- [Criterio 3]

---

## Technical Approach

**Chosen approach:** [Descripción del enfoque técnico]

**Alternatives considered:**
- [Alternativa A]: [Por qué no se eligió]
- [Alternativa B]: [Por qué no se eligió]

**Why this approach:**
- ✅ [Ventaja 1]
- ✅ [Ventaja 2]
- ❌ Trade-off: [Desventaja o compromiso]

---

## Implementation Steps

### **Step 1: [Nombre del paso]**

**Task:** [Descripción de la tarea]

**Details:**
- [Detalle 1]
- [Detalle 2]
- [Detalle 3]

**⚠️ IMPORTANTE (si aplica DB):** NO incluir SQL estático. Descripción de cambios necesarios + usar Supabase MCP para ejecutar.

**Testing:**
- [Tipo de test]: [Qué verificar]

**Estimated time:** [tiempo]

---

### **Step 2: [Nombre del paso]**

**Task:** [Descripción]

**File:** [ruta del archivo a crear/modificar]

**Structure/Logic:**
- [Elemento 1]
- [Elemento 2]

**Edge cases handled:**
- [Edge case 1]: [Cómo se maneja]
- [Edge case 2]: [Cómo se maneja]

**Testing:**
- [Tests a realizar]

**Estimated time:** [tiempo]

---

(Continuar con todos los steps necesarios)

### **Step N: Integration**

**Task:** Conectar todos los componentes

**Flow completo:**
1. [Paso 1 del flujo]
2. [Paso 2 del flujo]
3. [Paso 3 del flujo]
...

**Testing:**
- E2E test: [Escenario completo]

**Estimated time:** [tiempo]

---

## Technical Decisions (Story-specific)

### Decision 1: [Nombre de decisión específica de esta story]

**Chosen:** [Decisión]

**Reasoning:**
- ✅ [Razón]
- ❌ Trade-off: [Compromiso]

---

## Dependencies

**Pre-requisitos técnicos:**
- [ ] [Pre-requisito 1]
- [ ] [Pre-requisito 2 - BLOCKER si no está]

---

## Risks & Mitigations

**Risk 1:** [Descripción del riesgo específico de esta story]
- **Impact:** High | Medium | Low
- **Mitigation:** [Estrategia]

**Risk 2:** ...
- **Impact:** ...
- **Mitigation:** ...

---

## Estimated Effort

| Step           | Time             |
| -------------- | ---------------- |
| 1. [Step name] | [time]           |
| 2. [Step name] | [time]           |
| 3. [Step name] | [time]           |
| ...            | ...              |
| **Total**      | **[total time]** |

**Story points:** [número] (debe match estimación en story.md)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] Tests unitarios escritos (coverage > 80%)
  - [ ] [Componente específico 1]
  - [ ] [Componente específico 2]
- [ ] Tests de integración pasando
  - [ ] [Escenario específico]
- [ ] Tests E2E pasando (referencia: test-cases.md)
  - [ ] TC-001: [nombre]
  - [ ] TC-002: [nombre]
  - [ ] ...
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] Linting passes
  - [ ] Build passes
- [ ] Deployed to staging
- [ ] Manual smoke test en staging

---

**Output:** Archivo Markdown listo para .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md

**Nota para IA:**
- Si story es compleja, considera crear archivos adicionales opcionales (components.md, api-details.md, database-changes.md)
- Esto es decisión de la IA según complejidad real

**Restricciones:**
- Steps específicos y ejecutables
- Estimated time realista
- Total debe match story points
- Testing strategy por cada step
