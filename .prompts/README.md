# AI PROMPTS - Context Engineering para Desarrollo de Software

Este directorio contiene prompts optimizados para generar documentación de proyecto siguiendo el **AI-Driven Software Project Blueprint v5.0**.

---

## PROMPTS DE SESION (Inicio Rapido)

### `us-dev-workflow.md` - Workflow Completo de Desarrollo

**Uso:** Copiar y pegar al inicio de cada sesion de desarrollo de User Stories.

**Que hace:**

1. Diagnostica automaticamente el estado actual de la US
2. Identifica si falta Shift-Left Testing, Feature Plan, o Story Plan
3. Ejecuta los 12 pasos del workflow completo
4. Soporta reanudacion con Resumen de Progreso
5. Incluye referencias rapidas (MCPs, Jira, Supabase)

**Como usar:**

```markdown
# En tu chat con la IA, pega:

@.prompts/us-dev-workflow.md

# Y reemplaza los placeholders:

- EPIC-{PROJECT_KEY}-{N} → EPIC-MYM-8 (por ejemplo)
- STORY-{PROJECT_KEY}-{N} → STORY-MYM-10 (por ejemplo)
```

---

### `us-qa-workflow.md` - Workflow Completo de QA

**Uso:** Copiar y pegar al inicio de cada sesion de QA para User Stories.

**Que hace:**

1. Guia el proceso completo de QA (Fases 10-12)
2. Ejecuta exploratory testing con Playwright MCP
3. Documenta test cases en Jira
4. Implementa automatizacion con KATA framework

**Como usar:**

```markdown
# En tu chat con la IA, pega:

@.prompts/us-qa-workflow.md

# Prerequisitos:

- US en estado "Ready For QA"
- Feature desplegada en staging
- Acceso a Playwright MCP y Atlassian MCP
```

---

## INDICE DE PROMPTS

### **FASES SINCRONICAS** (una sola vez, setup inicial)

#### **Fase 1: Constitution** (Definicion del modelo de negocio)

| Archivo                                 | Proposito                     |
| --------------------------------------- | ----------------------------- |
| `fase-1-constitution/business-model.md` | Generar Business Model Canvas |
| `fase-1-constitution/market-context.md` | Generar analisis de mercado   |

#### **Fase 2: Architecture** (Product + Technical specs)

**PRD (Product Requirements Document):**

| Archivo                                        | Proposito                               |
| ---------------------------------------------- | --------------------------------------- |
| `fase-2-architecture/prd-executive-summary.md` | Problem statement, solution, KPIs       |
| `fase-2-architecture/prd-user-personas.md`     | Perfiles de usuarios objetivo           |
| `fase-2-architecture/prd-mvp-scope.md`         | Epicas iniciales y user stories del MVP |
| `fase-2-architecture/prd-user-journeys.md`     | Flujos de usuario (happy + edge cases)  |

**SRS (Software Requirements Specification):**

| Archivo                                           | Proposito                          |
| ------------------------------------------------- | ---------------------------------- |
| `fase-2-architecture/srs-functional-specs.md`     | Requerimientos funcionales         |
| `fase-2-architecture/srs-non-functional-specs.md` | Performance, security, scalability |
| `fase-2-architecture/srs-architecture-specs.md`   | Arquitectura del sistema           |
| `fase-2-architecture/srs-api-contracts.md`        | OpenAPI spec de endpoints          |

#### **Fase 3: Infrastructure** (Setup tecnico base)

| Archivo                                   | Proposito                                       |
| ----------------------------------------- | ----------------------------------------------- |
| `fase-3-infrastructure/backend-setup.md`  | DB schemas + API boilerplate + tipos TypeScript |
| `fase-3-infrastructure/frontend-setup.md` | Design System + proyecto frontend               |

**Orden critico:** Backend → Frontend (tipos generados del backend se importan en frontend)

---

### **FASES ASINCRONICAS** (iterativas, por sprint/epica)

#### **Fase 4: Specification** (Product Backlog)

| Archivo                                       | Proposito                                                          |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `fase-4-specification/pbi-product-backlog.md` | Setup inicial: Crear epic-tree, epicas y stories del MVP           |
| `fase-4-specification/pbi-add-feature.md`     | Agregar features post-MVP (analiza complejidad + crea incremental) |

#### **Fase 5: Shift-Left Testing** (QA temprano)

| Archivo                                          | Proposito                       |
| ------------------------------------------------ | ------------------------------- |
| `fase-5-shift-left-testing/feature-test-plan.md` | Plan de pruebas a nivel epica   |
| `fase-5-shift-left-testing/story-test-cases.md`  | Test cases detallados por story |

#### **Fase 6: Planning** (Planificacion tecnica)

| Archivo                                          | Proposito                                  |
| ------------------------------------------------ | ------------------------------------------ |
| `fase-6-planning/feature-implementation-plan.md` | Plan tecnico a nivel epica                 |
| `fase-6-planning/story-implementation-plan.md`   | Plan detallado de implementacion por story |

#### **Fase 7: Implementation** (Desarrollo + Unit Tests)

| Archivo                                            | Proposito                               |
| -------------------------------------------------- | --------------------------------------- |
| `fase-7-implementation/implement-story.md`         | Implementar story desde cero            |
| `fase-7-implementation/continue-implementation.md` | Continuar story pausada                 |
| `fase-7-implementation/fix-issues.md`              | Debuggear y corregir errores            |
| `fase-7-implementation/unit-testing.md`            | Crear unit tests durante implementacion |

**IMPORTANTE:** Unit tests se crean AQUI (Fase 7), NO en fases posteriores.

#### **Fase 8: Code Review** (Revision de codigo)

| Archivo                               | Proposito                       |
| ------------------------------------- | ------------------------------- |
| `fase-8-code-review/review-pr.md`     | Revisar Pull Request            |
| `fase-8-code-review/setup-linting.md` | Configurar linters y formatters |

#### **Fase 9: Deployment Staging** (CI/CD + Deploy a staging)

| Archivo                                           | Proposito                          |
| ------------------------------------------------- | ---------------------------------- |
| `fase-9-deployment-staging/ci-cd-setup.md`        | Configurar GitHub Actions workflow |
| `fase-9-deployment-staging/environment-config.md` | Configurar secrets por ambiente    |
| `fase-9-deployment-staging/deploy-to-staging.md`  | Deploy automatizado a staging      |

#### **Fase 10: Exploratory Testing** (Testing manual)

| Archivo                                           | Proposito                               |
| ------------------------------------------------- | --------------------------------------- |
| `fase-10-exploratory-testing/smoke-test.md`       | Smoke test post-deploy (5-10 min)       |
| `fase-10-exploratory-testing/exploratory-test.md` | Exploracion profunda con Playwright MCP |
| `fase-10-exploratory-testing/bug-report.md`       | Reportar bugs encontrados               |

**IMPORTANTE:** Esta fase viene ANTES de Test Automation. No automatices funcionalidad rota.

#### **Fase 11: Test Documentation** (Documentacion de tests)

| Archivo                                             | Proposito                                   |
| --------------------------------------------------- | ------------------------------------------- |
| `fase-11-test-documentation/test-analysis.md`       | Analizar candidatos para regression testing |
| `fase-11-test-documentation/test-prioritization.md` | Priorizar cuales tests documentar           |
| `fase-11-test-documentation/test-documentation.md`  | Crear Test issues en Jira                   |

**Por que esta fase:** Documentar tests en Jira DESPUES de validacion exploratoria para trazabilidad.

#### **Fase 12: Test Automation** (Integration + E2E - KATA Framework)

| Archivo                                                  | Proposito                                     |
| -------------------------------------------------------- | --------------------------------------------- |
| `kata-framework-setup.md`                                | Setup inicial o refactoring de KATA framework |
| `fase-12-test-automation/automation-e2e-test.md`         | Implementar tests E2E (UI)                    |
| `fase-12-test-automation/automation-integration-test.md` | Implementar tests de integracion (API)        |

**IMPORTANTE:**

- Esta fase viene DESPUES de Exploratory Testing y Test Documentation
- Solo automatizar funcionalidad validada manualmente
- NO crear unit tests aqui (esos van en Fase 7)

#### **Fase 13: Production Deployment** (Deploy a produccion)

| Archivo                                                 | Proposito                       |
| ------------------------------------------------------- | ------------------------------- |
| `fase-13-production-deployment/pre-deploy-checklist.md` | Validaciones pre-deploy         |
| `fase-13-production-deployment/deploy-to-production.md` | Estrategia de deploy a prod     |
| `fase-13-production-deployment/rollback-plan.md`        | Plan de contingencia y rollback |

#### **Fase 14: Shift-Right Testing** (Monitoring + Observabilidad)

| Archivo                                            | Proposito                          |
| -------------------------------------------------- | ---------------------------------- |
| `fase-14-shift-right-testing/monitoring-setup.md`  | Configurar Sentry/DataDog/logs     |
| `fase-14-shift-right-testing/smoke-tests.md`       | Tests post-deploy automatizados    |
| `fase-14-shift-right-testing/incident-response.md` | Playbook de respuesta a incidentes |

---

### **PROMPTS STANDALONE** (Utilidades)

| Archivo                   | Proposito                                     |
| ------------------------- | --------------------------------------------- |
| `git-flow.md`             | Estrategia de branching y git workflow        |
| `git-conflict-fix.md`     | Resolver conflictos de merge                  |
| `us-dev-workflow.md`      | Workflow completo de desarrollo (Fases 6-9)   |
| `us-qa-workflow.md`       | Workflow completo de QA (Fases 10-12)         |
| `kata-framework-setup.md` | Setup inicial o refactoring de KATA framework |

---

## COMO USAR ESTOS PROMPTS

### **Instrucciones Generales**

1. **Abrir el archivo del prompt** correspondiente a la fase en la que estas
2. **Copiar TODO el contenido** del archivo (Ctrl+A → Ctrl+C)
3. **Pegar en tu chat con la IA** (Claude, Cursor, etc.)
4. **Reemplazar los placeholders** con tu informacion especifica:
   - `[usar archivo.md]` → Pega el contenido del archivo referenciado
   - `{PROJECT_KEY}` → Codigo del proyecto en Jira (ej: MYM, UPEX)
   - `{N}` → Numero de issue en Jira (ej: 13, 456)
   - `{nombre}` → Nombre descriptivo en kebab-case
5. **Ejecutar el prompt**
6. **Copiar la respuesta de la IA** al archivo destino en `.context/`

---

### **Workflow Secuencial Recomendado**

#### **FASES SINCRONICAS** (una sola vez)

```
Fase 1 (Constitution)
    ↓
Fase 2 (Architecture: PRD → SRS)
    ↓
Fase 3 (Infrastructure: Backend → Frontend)
```

#### **FASES ASINCRONICAS** (iterativas por sprint)

```
Fase 4 (Specification: Product Backlog)
    ↓
Fase 5 (Shift-Left Testing)
    ↓
Fase 6 (Planning)
    ↓
Fase 7 (Implementation + Unit Tests)
    ↓
Fase 8 (Code Review)
    ↓
Fase 9 (Deployment Staging)
    ↓
Fase 10 (Exploratory Testing)
    ↓
Fase 11 (Test Documentation)
    ↓
Fase 12 (Test Automation)
    ↓
Fase 13 (Production Deployment)
    ↓
Fase 14 (Shift-Right Testing - continuo)
```

---

## NOMENCLATURA DE CARPETAS (PBI)

**IMPORTANTE:** Nomenclatura estandar para epicas y stories en `.context/PBI/`

### Epicas

**Formato:** `EPIC-{PROJECT_KEY}-{NUMERO}-{nombre-descriptivo}/`

**Componentes:**

- `{PROJECT_KEY}`: Codigo del proyecto en Jira (ej: MYM, UPEX) - MAYUSCULAS
- `{NUMERO}`: ID numerico de Jira sin ceros a la izquierda (ej: 2, 13, 28)
- `{nombre-descriptivo}`: 2-4 palabras en kebab-case, minusculas

**Ejemplos validos:**

- `EPIC-MYM-2-user-authentication-profiles/`
- `EPIC-MYM-13-mentor-discovery-search/`
- `EPIC-UPEX-45-payment-processing/`

### Stories

**Formato:** `STORY-{PROJECT_KEY}-{NUMERO}-{nombre-descriptivo}/`
(Mismas reglas que epicas)

**Ejemplos validos:**

- `STORY-MYM-3-user-signup-email/`
- `STORY-MYM-14-view-all-mentors/`

---

## TIPS DE USO

### **Contexto Acumulativo**

Los prompts estan disenados para funcionar en cascada:

- Cada prompt pide como input el output de prompts anteriores
- Siempre pega el contenido de los archivos generados previamente cuando el prompt lo solicite

### **Placeholders a Reemplazar**

Cuando veas:

- `[usar archivo.md]` → Copia y pega el contenido completo del archivo
- `{PROJECT_KEY}` → Codigo del proyecto en Jira (ej: MYM, UPEX)
- `{N}` → Numero de issue (ej: 13, 456)
- `{nombre}` → Nombre descriptivo en kebab-case
- `[especificar X]` → Reemplaza con tu valor especifico

### **Herramientas Complementarias (MCP)**

- **Supabase MCP:** Para obtener schema real de DB (NO hardcodear SQL en docs)
- **Atlassian MCP:** Para crear epicas/stories en Jira PRIMERO (flujo Jira-First)
- **Context7 MCP:** Para consultar docs oficiales actualizadas (Next.js, React, Supabase)
- **Playwright MCP:** Para exploratory testing automatizado

---

## IMPORTANTE

### **NO hacer:**

- No modificar los prompts sin entender su proposito
- No saltarse fases (cada fase depende de la anterior)
- No usar SQL estatico en documentacion (siempre usar Supabase MCP)
- No crear epicas/stories localmente primero (usar flujo Jira-First con MCP)
- No usar nomenclatura inconsistente en carpetas PBI
- No automatizar tests sin validacion manual previa (Fase 10 antes de Fase 12)
- No crear unit tests en Fase 12 (van en Fase 7 durante implementacion)

### **SI hacer:**

- Seguir el orden secuencial de fases (1 → 2 → 3 → ... → 14)
- Pegar contexto completo cuando el prompt lo solicite
- Revisar y refinar outputs de la IA
- Usar flujo Jira-First en Fase 4 (crear en Jira → luego local)
- Seguir nomenclatura estandar (EPIC-{PROJECT_KEY}-{NUM}-{nombre})
- Trabajar de forma incremental (epica por epica) para optimizar tokens
- Backend antes que Frontend (Fase 3: Infrastructure)
- Testing manual antes de automatizar (Fase 10 antes de Fase 12)
- Unit tests durante implementacion (Fase 7)

---

## ESTRUCTURA DE SALIDA ESPERADA

Despues de usar todos los prompts, tu directorio `.context/` debe verse asi:

```
.context/
├── idea/                          [Fase 1]
│   ├── business-model.md
│   └── market-context.md
│
├── PRD/                           [Fase 2]
│   ├── executive-summary.md
│   ├── user-personas.md
│   ├── mvp-scope.md
│   └── user-journeys.md
│
├── SRS/                           [Fase 2]
│   ├── functional-specs.md
│   ├── non-functional-specs.md
│   ├── architecture-specs.md
│   └── api-contracts.yaml
│
├── infrastructure/                [Fase 3]
│   ├── backend-setup.md
│   ├── frontend-setup.md
│   └── env-config.md
│
├── PBI/                           [Fases 4-6]
│   ├── epic-tree.md
│   └── epics/
│       └── EPIC-XXX-nombre/
│           ├── epic.md                     [Fase 4]
│           ├── feature-test-plan.md        [Fase 5]
│           ├── feature-implementation-plan.md [Fase 6]
│           └── stories/
│               └── STORY-XXX-nombre/
│                   ├── story.md            [Fase 4]
│                   ├── test-cases.md       [Fase 5]
│                   └── implementation-plan.md [Fase 6]
│
├── deployment/                    [Fases 9, 13]
│   ├── staging/
│   │   ├── ci-cd-config.yaml
│   │   ├── environment-vars.md
│   │   └── deployment-log.md
│   └── production/
│       ├── pre-deploy-checklist.md
│       ├── deployment-log.md
│       └── rollback-procedures.md
│
├── testing/                       [Fases 10-12, 14]
│   ├── exploratory/
│   │   ├── smoke-tests.md
│   │   ├── session-notes/
│   │   └── bug-reports/
│   ├── documentation/
│   │   └── test-cases/
│   └── shift-right/
│       ├── monitoring-config.md
│       ├── smoke-tests-automated.md
│       └── incident-reports/
│
└── guidelines/                    [Reference material]
    ├── implementation-workflow.md
    ├── code-standards.md
    ├── error-handling.md
    ├── context-loading.md
    ├── mcp-usage-tips.md
    │
    └── TAE/                       [Fase 12]
        ├── README.md
        ├── test-strategy.md
        ├── kata-architecture.md
        ├── automation-standards.md
        └── ...
```

---

## ESTADISTICAS

- **Fases totales:** 14 (3 sincronicas + 11 asincronicas)
- **Prompts totales:** 36 archivos
- **Workflows de sesion:** 2 (us-dev-workflow.md, us-qa-workflow.md)
- **Utilidades standalone:** 2 (git-flow.md, git-conflict-fix.md)

---

## RECURSOS ADICIONALES

- **Guidelines para IA:** `.context/guidelines/`
- **KATA Architecture (TAE):** `.context/guidelines/TAE/`

---

## SOPORTE

Si tienes dudas sobre como usar estos prompts:

1. Revisa el README.md de cada fase en `.prompts/fase-X-nombre/README.md`
2. Consulta los ejemplos en cada prompt
3. Experimenta con prompts individuales primero

---

**Version:** 5.0 (14 Fases: 3 Sincronicas + 11 Asincronicas)
**Ultima actualizacion:** 2025-12-18
**Autor:** UPEX Galaxy - DOJO AI-Powered Quality Engineer
