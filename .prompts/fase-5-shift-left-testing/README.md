# Fase 5: Shift-Left Testing

## Propósito

Diseñar la estrategia de testing **ANTES** de escribir código. Analiza Epics y Stories desde perspectiva QA para identificar escenarios de prueba, riesgos y criterios de aceptación refinados.

**Por qué existe esta fase:**

- Testing shift-left = feedback más temprano = menos bugs
- Identifica ambigüedades en requirements antes de implementar
- Define criterios de aceptación testeables
- Crea base para test automation posterior (Fase 12)

---

## Pre-requisitos

- Fase 4 completada:
  - Product Backlog en Jira
  - Estructura `.context/PBI/` con Epics y Stories
- Contexto de negocio:
  - `.context/idea/business-model.md`
  - `.context/PRD/*.md`
- Contexto técnico:
  - `.context/SRS/*.md`
- MCP Atlassian disponible

---

## Prompts en Esta Fase

| Orden | Prompt                    | Nivel | Propósito                                     |
| ----- | ------------------------- | ----- | --------------------------------------------- |
| 1     | `feature-test-plan.md`    | Epic  | Test strategy a nivel feature                 |
| 2     | `acceptance-test-plan.md` | Story | Acceptance test plan con test cases por story |

---

## Flujo de Ejecución

```
Epic en Jira + Local
        ↓
┌───────────────────────────────────────┐
│  [1] Feature Test Plan (Epic)          │
├───────────────────────────────────────┤
│                                        │
│  Input:                                │
│  - Epic path local                     │
│  - Business context (PRD)              │
│  - Technical context (SRS)             │
│                                        │
│  Análisis:                             │
│  - Riesgos de la feature               │
│  - Escenarios críticos                 │
│  - Dependencias técnicas               │
│  - Criterios de éxito                  │
│                                        │
│  Output:                               │
│  - feature-test-plan.md (local)        │
│  - Comentario en Epic (Jira)           │
│  - Epic actualizada con findings       │
│                                        │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│  [2] Acceptance Test Plan (Story)      │
├───────────────────────────────────────┤
│                                        │
│  Input:                                │
│  - Story path local                    │
│  - Feature test plan (Epic padre)      │
│  - Acceptance Criteria de la Story     │
│                                        │
│  Análisis:                             │
│  - Casos positivos (happy path)        │
│  - Casos negativos (edge cases)        │
│  - Validaciones de input               │
│  - Estados de error                    │
│                                        │
│  Output:                               │
│  - acceptance-test-plan.md (local)     │
│  - Comentario en Story (Jira)          │
│  - Story refinada con ACs testeables   │
│                                        │
└───────────────────────────────────────┘
```

---

## Niveles de Testing (Jerarquía IQL)

```
┌─────────────────────────────────────────────────────────────┐
│                    SHIFT-LEFT TESTING                        │
│                    Step 1: Análisis de Requerimientos        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [1a] NIVEL EPIC (Primero)     [1b] NIVEL STORY (Después)  │
│   ────────────────────────      ─────────────────────────   │
│                                                              │
│   FTP (Feature Test Plan)       ATP (Acceptance Test Plan)  │
│   - Riesgos                     - Escenarios por AC         │
│   - Escenarios críticos         - Happy path                │
│   - Dependencias                - Edge cases                │
│   - Criterios de éxito          - Estados de error          │
│                                                              │
│   feature-test-plan.md          acceptance-test-plan.md     │
│   (1 por Epic)                  (1 por Story)               │
│   Provee CONTEXTO para →        ← Informado por FTP         │
│                                                              │
│                                        ↓                     │
│                              ATCs (Mid-Game Step 6)          │
│                              Documentados en Jira            │
│                                        ↓                     │
│                              KATA Automation (Steps 8-10)    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

> **Orden importante:** FTP se crea PRIMERO (contexto macro), ATP se crea DESPUÉS (informado por el FTP). Ambos ocurren ANTES del sprint durante refinamiento.

**Trazabilidad completa:** FTP (Epic) → ATP (Story) → ATCs (Jira) → KATA (Automation)

---

## Estructura de Archivos Generada

```
.context/PBI/epics/
└── EPIC-{KEY}-{NUM}-{nombre}/
    ├── epic.md
    ├── feature-test-plan.md          # ← Generado por feature-test-plan.md
    └── stories/
        └── STORY-{KEY}-{NUM}-{nombre}/
            ├── story.md
            └── acceptance-test-plan.md  # ← Generado por acceptance-test-plan.md
```

---

## Workflow Jira-First

```
┌─────────────────────────────────────────────────────────────┐
│               JIRA-FIRST → LOCAL MIRROR                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Leer Epic/Story local (obtener Jira Key)                │
│  2. Leer Epic/Story actual de Jira (MCP)                    │
│  3. Analizar con contexto PRD + SRS                         │
│  4. Actualizar Epic/Story en Jira con findings (MCP)        │
│  5. Agregar comentario con test plan/cases (MCP)            │
│  6. Generar archivo local (mirror)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Roles Asumidos por la IA

| Prompt                    | Rol                             |
| ------------------------- | ------------------------------- |
| `feature-test-plan.md`    | QA Lead, Test Strategy Expert   |
| `acceptance-test-plan.md` | QA Engineer, Test Case Designer |

---

## Herramientas Requeridas

| Herramienta   | Propósito                          |
| ------------- | ---------------------------------- |
| MCP Atlassian | Leer/actualizar Epics y Stories    |
| Filesystem    | Leer contexto, escribir test plans |

---

## Output de Esta Fase

- **Por Epic:** `feature-test-plan.md` con estrategia de testing
- **Por Story:** `acceptance-test-plan.md` con acceptance test cases
- **En Jira:** Comments con test strategy y cases
- **Refinamiento:** ACs más específicos y testeables
- **Base para:** Fase 12 (Test Automation)

---

## Conexión con Mid-Game Testing

Los artefactos de esta fase alimentan directamente al **Mid-Game Testing (Steps 6-10)**:

| Artefacto Fase 5    | → Mid-Game        | Propósito                          |
| ------------------- | ----------------- | ---------------------------------- |
| ATP (Story-level)   | → ATCs (Step 6)   | Escenarios se formalizan en Jira   |
| Escenarios críticos | → Candidates      | Priorizados para automatización    |
| Acceptance Criteria | → KATA decorators | Trazabilidad `@atc('PROJECT-XXX')` |

**Ver:** `docs/testing/test-architecture/mid-game-testing.md`

---

## Siguiente Fase

Con test plans y cases definidos:

- Proceder a **Fase 6: Planning**
- Crear implementation plans técnicos
- Definir approach de desarrollo

---

## FAQ

**P: ¿Debo ejecutar esto para TODAS las stories?**
R: Recomendado para stories críticas. Stories triviales pueden omitirse o tener test cases simplificados.

**P: ¿Los test cases se ejecutan en esta fase?**
R: No. Esta fase es solo diseño. Ejecución ocurre en Fase 10 (Exploratory) y Fase 12 (Automation).

**P: ¿Qué pasa si los requirements cambian?**
R: Re-ejecuta el prompt con el contexto actualizado. Los archivos se sobrescriben.

---

## Documentación Relacionada

- **Product Backlog:** `.context/PBI/`
- **Main README:** `.prompts/README.md`
- **Fase 6:** `.prompts/fase-6-planning/README.md`
- **Fase 10:** `.prompts/fase-10-exploratory-testing/README.md`
- **Fase 12:** `.prompts/fase-12-test-automation/README.md`
