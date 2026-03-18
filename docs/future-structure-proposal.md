# Propuesta: Nueva Estructura de Prompts (v2.0)

> Esta propuesta se implementará en una versión futura para no afectar usuarios actuales.

---

## Motivación

La estructura actual de prompts usa prefijos numéricos (`fase-1-`, `fase-10-`, etc.) que:

1. Dificultan la navegación visual
2. Mezclan diferentes roles (spec, dev, qa) sin distinción clara
3. Requieren conocer el número de fase para encontrar un prompt
4. Generan nombres de carpeta largos

---

## Estructura Propuesta

```
.prompts/
├── README.md
├── spec/                        # (antes: discovery/fases 1-4)
│   ├── constitution/
│   │   ├── business-model.md
│   │   └── domain-glossary.md
│   ├── architecture/
│   │   ├── prd-discovery.md
│   │   ├── srs-discovery.md
│   │   └── api-discovery.md
│   └── specification/
│       ├── backlog-mapping.md
│       └── us-templates.md
│
├── dev/                         # (antes: fases 6-9)
│   ├── planning/
│   │   ├── sprint-planning.md
│   │   └── tech-spec.md
│   ├── implementation/
│   │   ├── feature-coding.md
│   │   └── bug-fix-workflow.md
│   ├── code-review/
│   │   └── pr-review.md
│   └── deployment/
│       └── release-checklist.md
│
├── qa/                          # (antes: fases 10-14)
│   ├── exploratory/
│   │   ├── smoke-test.md
│   │   ├── exploratory-test.md
│   │   └── bug-report.md
│   ├── documentation/
│   │   ├── test-analysis.md
│   │   ├── test-prioritization.md
│   │   └── test-documentation.md
│   ├── automation/
│   │   ├── e2e/
│   │   │   ├── e2e-plan.md
│   │   │   ├── e2e-coding.md
│   │   │   └── e2e-review.md
│   │   └── integration/
│   │       ├── integration-plan.md
│   │       ├── integration-coding.md
│   │       └── integration-review.md
│   └── regression/
│       ├── regression-execution.md
│       ├── regression-analysis.md
│       └── regression-report.md
│
├── setup/
│   ├── project-init.md
│   └── kata-framework-setup.md
│
├── workflows/
│   ├── us-dev-workflow.md
│   └── us-qa-workflow.md
│
├── utilities/
│   ├── git-flow.md
│   ├── git-conflict-fix.md
│   └── context-engineering-setup.md
│
└── learning/
    └── qa-methodology/
        ├── testing-fundamentals.md
        └── automation-best-practices.md
```

---

## Beneficios

### 1. Nombres más cortos y concisos

| Antes                                       | Después                         |
| ------------------------------------------- | ------------------------------- |
| `fase-10-exploratory-testing/smoke-test.md` | `qa/exploratory/smoke-test.md`  |
| `fase-12-test-automation/e2e/e2e-plan.md`   | `qa/automation/e2e/e2e-plan.md` |

### 2. Estructura intuitiva por rol

- **spec/**: Prompts de especificación y descubrimiento
- **dev/**: Prompts de desarrollo
- **qa/**: Prompts de QA y testing
- **setup/**: Prompts de configuración inicial
- **workflows/**: Orquestadores de flujos completos
- **utilities/**: Herramientas auxiliares

### 3. Mejor organización visual

Los prompts se agrupan por función, no por número de fase. Esto facilita:

- Encontrar prompts rápidamente
- Entender el propósito de cada grupo
- Onboarding de nuevos miembros del equipo

### 4. Más fácil de navegar

Los usuarios pueden navegar por rol/área en lugar de memorizar números de fase.

---

## Mapeo Actual → Propuesto

| Ubicación Actual               | Ubicación Propuesta             |
| ------------------------------ | ------------------------------- |
| `fase-1-constitution/`         | `spec/constitution/`            |
| `fase-2-architecture/`         | `spec/architecture/`            |
| `fase-3-infrastructure/`       | `spec/infrastructure/`          |
| `fase-4-specification/`        | `spec/specification/`           |
| `fase-5-shift-left-testing/`   | `qa/shift-left/`                |
| `fase-6-sprint-planning/`      | `dev/planning/`                 |
| `fase-7-implementation/`       | `dev/implementation/`           |
| `fase-8-code-review/`          | `dev/code-review/`              |
| `fase-9-deployment/`           | `dev/deployment/`               |
| `fase-10-exploratory-testing/` | `qa/exploratory/`               |
| `fase-11-test-documentation/`  | `qa/documentation/`             |
| `fase-12-test-automation/`     | `qa/automation/`                |
| `utilities/`                   | `utilities/`                    |
| `us-dev-workflow.md`           | `workflows/us-dev-workflow.md`  |
| `us-qa-workflow.md`            | `workflows/us-qa-workflow.md`   |
| `kata-framework-setup.md`      | `setup/kata-framework-setup.md` |

---

## Plan de Migración

La migración se hará de forma gradual para minimizar el impacto:

### Fase 1: Preparación (No Breaking)

1. Crear nueva estructura en paralelo
2. Copiar contenido actualizado a nueva ubicación
3. Mantener estructura antigua sin cambios
4. Documentar ambas estructuras

### Fase 2: Deprecación Suave

1. Agregar notice de deprecación a estructura antigua
2. Actualizar documentación principal para apuntar a nueva estructura
3. Actualizar CLAUDE.md y system-prompt.md
4. Período de transición: 2-3 meses

### Fase 3: Limpieza

1. Eliminar estructura antigua
2. Actualizar todos los cross-references
3. Comunicar cambio a usuarios

---

## Consideraciones

### Compatibilidad

- Los usuarios actuales que referencian rutas de `fase-X` necesitarán actualizar sus referencias
- Se pueden crear symlinks temporales durante la transición
- Los workflows que usan paths específicos deberán actualizarse

### Documentación

- El README.md principal deberá actualizarse
- CLAUDE.md necesitará nuevas rutas de carga de contexto
- system-prompt.md deberá actualizarse con la nueva estructura

### Timing

Esta migración se recomienda para:

- Un nuevo major release (v2.0)
- Un período de baja actividad
- Después de comunicar el cambio con antelación

---

## Feedback

Esta propuesta está abierta a feedback. Consideraciones:

1. ¿Los nombres de carpeta son intuitivos?
2. ¿Falta algún grupo/categoría?
3. ¿El mapeo actual → propuesto es correcto?
4. ¿El plan de migración es realista?

---

**Fecha de propuesta**: 2026-03-10
**Estado**: Draft - Pendiente de revisión
**Autor**: AI-Assisted Documentation
