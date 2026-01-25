# Fase 2: Architecture

## Propósito

Transformar el Business Model Canvas (Fase 1) en documentación técnica formal: PRD (Product Requirements Document) y SRS (Software Requirements Specification).

**Por qué existe esta fase:**

- Formaliza la visión de producto en documentos ejecutables
- Crea trazabilidad desde negocio hacia implementación técnica
- Establece el scope del MVP con criterios claros
- Define la arquitectura técnica antes de escribir código

---

## Pre-requisitos

- Fase 1 completada:
  - `.context/idea/business-model.md`
  - `.context/idea/market-context.md`
- Tech Stack definido (Next.js 15, Supabase, Vercel, GitHub Actions)

---

## Prompts en Esta Fase

| Orden | Prompt                        | Propósito                         | Output                                 |
| ----- | ----------------------------- | --------------------------------- | -------------------------------------- |
| 1     | `prd-executive-summary.md`    | Problem statement, solución, KPIs | `.context/PRD/executive-summary.md`    |
| 2     | `prd-user-personas.md`        | Perfiles detallados de usuarios   | `.context/PRD/user-personas.md`        |
| 3     | `prd-user-journeys.md`        | Flujos de usuario paso a paso     | `.context/PRD/user-journeys.md`        |
| 4     | `prd-mvp-scope.md`            | Epics y User Stories del MVP      | `.context/PRD/mvp-scope.md`            |
| 5     | `srs-functional-specs.md`     | Functional Requirements (FR-XXX)  | `.context/SRS/functional-specs.md`     |
| 6     | `srs-non-functional-specs.md` | NFRs (performance, seguridad)     | `.context/SRS/non-functional-specs.md` |
| 7     | `srs-architecture-specs.md`   | Arquitectura técnica, diagramas   | `.context/SRS/architecture-specs.md`   |
| 8     | `srs-api-contracts.md`        | OpenAPI contracts                 | `.context/SRS/api-contracts.yaml`      |

---

## Flujo de Ejecución

```
Business Model (Fase 1)
        ↓
┌───────────────────────────────────────┐
│              PRD (Producto)            │
├───────────────────────────────────────┤
│                                        │
│  [1] Executive Summary                 │
│      └── Problem, Solution, KPIs       │
│              ↓                         │
│  [2] User Personas                     │
│      └── Quiénes son los usuarios      │
│              ↓                         │
│  [3] User Journeys                     │
│      └── Cómo interactúan              │
│              ↓                         │
│  [4] MVP Scope                         │
│      └── Epics + User Stories          │
│                                        │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│              SRS (Técnico)             │
├───────────────────────────────────────┤
│                                        │
│  [5] Functional Specs                  │
│      └── FR-001, FR-002, ...           │
│              ↓                         │
│  [6] Non-Functional Specs              │
│      └── Performance, Security         │
│              ↓                         │
│  [7] Architecture Specs                │
│      └── Diagramas, decisiones         │
│              ↓                         │
│  [8] API Contracts                     │
│      └── OpenAPI YAML                  │
│                                        │
└───────────────────────────────────────┘
        ↓
Output: Documentación completa para Fase 3+
```

---

## Estructura de Carpetas Generada

```
.context/
├── PRD/
│   ├── executive-summary.md
│   ├── user-personas.md
│   ├── user-journeys.md
│   └── mvp-scope.md
│
└── SRS/
    ├── functional-specs.md
    ├── non-functional-specs.md
    ├── architecture-specs.md
    └── api-contracts.yaml
```

---

## Roles Asumidos por la IA

| Prompt             | Rol                                   |
| ------------------ | ------------------------------------- |
| PRD prompts        | Senior Product Manager                |
| SRS Functional     | Software Architect + Business Analyst |
| SRS Non-Functional | Software Architect                    |
| SRS Architecture   | Solution Architect                    |
| SRS API Contracts  | API Designer                          |

---

## Output de Esta Fase

- **PRD completo:** Visión de producto documentada
- **SRS completo:** Especificaciones técnicas detalladas
- **Trazabilidad:** User Stories → Functional Requirements
- **Contratos API:** OpenAPI spec lista para implementación
- **Base para Fase 3:** Infraestructura puede implementarse

---

## Siguiente Fase

Con PRD y SRS completos:

- Proceder a **Fase 3: Infrastructure**
- Implementar cloud services, backend, frontend base

---

## Documentación Relacionada

- **Business Model:** `.context/idea/business-model.md`
- **Main README:** `.prompts/README.md`
- **Fase 3:** `.prompts/fase-3-infrastructure/README.md`
