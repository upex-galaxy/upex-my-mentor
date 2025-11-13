Actúa como Senior Software Architect, Tech Lead, y UI/UX Designer.

**Input:**
- Epic: [usar .context/PBI/epics/EPIC-XXX/epic.md]
- SRS completo: [usar .context/SRS/*.md]
- Feature Test Plan: [usar .context/PBI/epics/EPIC-XXX/feature-test-plan.md]
- **Design System:** [usar .context/design-system.md - para decisiones de UI/UX]

**Genera archivo: feature-implementation-plan.md** (dentro de .context/PBI/epics/EPIC-XXX/)

---

# Feature Implementation Plan: EPIC-XXX - [Epic Title]

## Overview

Esta feature implementa [descripción high-level de la feature].

**Alcance:**
- [Story 1]: [Título]
- [Story 2]: [Título]
- [Story 3]: [Título]
- ...

**Stack técnico:**
- Frontend: [framework y versión]
- Backend: [framework/plataforma]
- Database: [sistema de BD]
- Deployment: [plataforma]
- Testing: [frameworks]

---

## Technical Decisions

### Decision 1: [Nombre de la decisión]

**Options considered:**
- A) [Opción A]
- B) [Opción B]
- C) [Opción C]

**Chosen:** [Opción elegida]

**Reasoning:**
- ✅ Ventaja 1
- ✅ Ventaja 2
- ✅ Ventaja 3
- ❌ Trade-off: [Desventaja o compromiso]

**Implementation notes:**
- [Detalle de implementación]
- [Consideraciones específicas]

---

### Decision 2: [Otra decisión técnica]

**Chosen:** [Decisión]

**Reasoning:**
- ✅ ...
- ❌ Trade-off: ...

**Implementation notes:**
- [Detalles]

---

(Incluir 3-5 decisiones técnicas críticas a nivel feature)

---

## UI/UX Design Strategy (Si la feature tiene interfaz)

**⚠️ IMPORTANTE:** Esta feature debe usar el Design System base de Fase 2.5.

**Design System disponible:** `.context/design-system.md`

### Componentes compartidos por stories:

**Componentes del Design System a usar:**
- ✅ [Componente 1]: [Cómo se usa en esta feature]
- ✅ [Componente 2]: [Cómo se usa en esta feature]
- ✅ [Layout]: [Navbar/Sidebar - si se necesitan ajustes]

**Componentes custom a nivel feature:**
- 🆕 [FeatureComponentName] (ej: MentorCard, ProjectFilters)
  - **Usado por stories:** [Story A, Story B]
  - **Propósito:** [Descripción]
  - **Diseño base:** [Descripción visual usando design system]
  - **Ubicación:** `components/[feature-domain]/`

### Consistencia visual:

**Paleta aplicada (del design system):**
- Primary: `bg-primary` - [Uso específico en esta feature]
- Secondary: `bg-secondary` - [Uso específico]
- Accent: `bg-accent` - [Uso específico]

**Patrones de diseño comunes:**
- [Patrón 1]: [Descripción de cómo se aplica] (ej: Todas las listas usan Card grid)
- [Patrón 2]: [Descripción]

### Flujos de UX:

**User journeys específicos de esta feature:**
1. [Flujo 1]: [Descripción paso a paso]
   - Estado inicial → [Story A]
   - Acción → [Story B]
   - Resultado → [Story C]

2. [Flujo 2]: [Descripción]

**Estados globales de la feature:**
- Loading: [Cómo se muestra]
- Empty: [Qué mensaje/CTA]
- Error: [Cómo se recupera]

**Nota:** Los diseños específicos de cada story se detallan en sus `implementation-plan.md` respectivos.

---

## Shared Dependencies

**Todas las stories de esta feature requieren:**

1. **[Dependency 1]**
   - [Detalles de la dependencia]
   - [Configuración necesaria]

2. **[Dependency 2]**
   - [Detalles]

3. **Environment variables:**
   - VAR_NAME: [descripción]
   - VAR_NAME_2: [descripción]

4. **External services:**
   - [Servicio 1]: [para qué se usa]
   - [Servicio 2]: [para qué se usa]

---

## Architecture Notes

### Folder Structure

(Mostrar estructura de carpetas relevante para esta feature)

/app
├── /feature-name
│   ├── /component1
│   └── /component2
/lib
├── /feature-utils
...

### Design Patterns
1. **[Pattern 1]**: [Descripción de uso]
2. **[Pattern 2]**: [Descripción de uso]

### Third-party Libraries
- **[Library 1]**: [versión] - [para qué se usa]
- **[Library 2]**: [versión] - [para qué se usa]

---

## Implementation Order

**Recomendado:**

1. **STORY-XXX: [Título]** (base para todo)
   - Razón: [Por qué primero]

2. **STORY-YYY: [Título]** (depende de STORY-XXX)
   - Razón: [Por qué después]

3. **STORY-ZZZ: [Título]** (puede ir en paralelo)
   - Razón: [Por qué en paralelo]

---

## Risks & Mitigations

### Risk 1: [Descripción del riesgo]

**Impact:** High | Medium | Low (explicar impacto)
**Likelihood:** High | Medium | Low
**Mitigation:**
- [Estrategia de mitigación 1]
- [Estrategia de mitigación 2]

### Risk 2: [Descripción del riesgo]

**Impact:** ...
**Likelihood:** ...
**Mitigation:**
- ...

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las stories implementadas y deployed
- [ ] 100% de test cases críticos pasando
- [ ] [Criterio específico de la feature]
- [ ] Performance targets alcanzados
- [ ] Documentation actualizada

---

**Formato:** Markdown estructurado, listo para copiar a .context/PBI/epics/EPIC-XXX/feature-implementation-plan.md

**Restricciones:**
- Decisiones técnicas justificadas
- Dependencias compartidas claras
- Orden de implementación lógico
- Riesgos identificados con mitigaciones
