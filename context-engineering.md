# BIG PICTURE - Arquitectura Completa del Repositorio

## Estructura Visual Completa

```
aicode-starter/
│
├── .context/                           Para: Documentacion de ingenieria de contexto (IA lee esto)
│   │
│   ├── README.md                       Para: Indice maestro del proyecto, punto de entrada
│   │
│   ├── idea/                           Para: FASE 1 - Constitucion del negocio
│   │   ├── README.md                   Para: Explicar Fase 1
│   │   ├── business-model.md           Para: Business Model Canvas (9 bloques)
│   │   ├── market-context.md           Para: Analisis de mercado y competencia
│   │   └── legacy-analysis.md          Para: Analisis de codigo existente (solo proyectos legacy)
│   │
│   ├── PRD/                            Para: FASE 2 - Product Requirements (vision de negocio)
│   │   ├── README.md                   Para: Explicar que es PRD
│   │   ├── executive-summary.md        Para: Problem statement + KPIs + target users
│   │   ├── user-personas.md            Para: 2-3 perfiles de usuarios detallados
│   │   ├── mvp-scope.md                Para: Epicas y user stories del MVP
│   │   └── user-journeys.md            Para: Flujos de usuario (happy path + edge cases)
│   │
│   ├── SRS/                            Para: FASE 2 - Software Requirements (vision tecnica)
│   │   ├── README.md                   Para: Explicar que es SRS
│   │   ├── functional-specs.md         Para: Requerimientos funcionales (FRs mapeados 1:1)
│   │   ├── non-functional-specs.md     Para: Performance, security, scalability
│   │   ├── architecture-specs.md       Para: C4 diagrams, ERD, tech stack
│   │   └── api-contracts.yaml          Para: OpenAPI 3.0 spec de todos los endpoints
│   │
│   ├── PBI/                            Para: FASES 4-6 - Product Backlog (tareas concretas)
│   │   ├── README.md                   Para: Explicar estructura de PBI
│   │   ├── epic-tree.md                Para: Vista high-level de todas las epicas
│   │   │
│   │   └── epics/                      Para: Contener todas las epicas del proyecto
│   │       │
│   │       └── EPIC-{PROYECTO}-{NUM}-{nombre}/  Para: Una epica (ej: EPIC-MYM-13-mentor-discovery)
│   │           │
│   │           ├── epic.md             Para: FASE 4 - Descripcion, scope, criteria
│   │           ├── feature-test-plan.md   Para: FASE 5 - Plan de pruebas a nivel feature
│   │           ├── feature-implementation-plan.md  Para: FASE 6 - Decisiones tecnicas de la epica
│   │           │
│   │           └── stories/            Para: Contener todas las stories de esta epica
│   │               │
│   │               └── STORY-{PROYECTO}-{NUM}-{nombre}/  Para: Una story (ej: STORY-MYM-14-view-mentors)
│   │                   │
│   │                   ├── story.md       Para: FASE 4 - User story + acceptance criteria
│   │                   ├── test-cases.md  Para: FASE 5 - 6+ test cases detallados
│   │                   └── implementation-plan.md  Para: FASE 6 - Plan tecnico step-by-step
│   │
│   └── guidelines/                     Para: FASES 7-14 - Reference material para la IA
│       ├── README.md                   Para: Explicar guidelines y su uso
│       │
│       ├── Workflow y Estandares:
│       ├── implementation-workflow.md  Para: Workflow paso a paso de implementacion
│       ├── code-standards.md           Para: DRY, naming, TypeScript strict
│       ├── error-handling.md           Para: NO hardcodear, error classes, logging
│       ├── context-loading.md          Para: Que archivos leer en cada fase
│       ├── mcp-usage-tips.md           Para: Cuando usar Supabase/Atlassian MCP
│       │
│       └── TAE/                        Para: FASE 12 - Test Automation Engineering
│           ├── README.md               Para: Explicar TAE y workflow de uso
│           ├── test-strategy.md        Para: Estrategia general de testing del proyecto
│           ├── kata-architecture.md    Para: Arquitectura KATA adaptada al proyecto
│           ├── automation-standards.md Para: Estandares de codigo para tests
│           └── ...
│
├── .prompts/                           Para: Prompts copy-paste para generar documentacion
│   │
│   ├── README.md                       Para: Instrucciones de como usar los prompts
│   │
│   ├── fase-1-constitution/            Para: Generar docs de negocio
│   │   ├── business-model.md           Para: Prompt de Business Model Canvas
│   │   └── market-context.md           Para: Prompt de analisis de mercado
│   │
│   ├── fase-2-architecture/            Para: Generar specs de producto y arquitectura
│   │   ├── prd-executive-summary.md    Para: Prompt de executive summary
│   │   ├── prd-user-personas.md        Para: Prompt de user personas
│   │   ├── prd-mvp-scope.md            Para: Prompt de epicas iniciales
│   │   ├── prd-user-journeys.md        Para: Prompt de user journeys
│   │   ├── srs-functional-specs.md     Para: Prompt de FRs
│   │   ├── srs-non-functional-specs.md Para: Prompt de NFRs
│   │   ├── srs-architecture-specs.md   Para: Prompt de arquitectura + C4
│   │   └── srs-api-contracts.md        Para: Prompt de OpenAPI spec
│   │
│   ├── fase-3-infrastructure/          Para: Setup tecnico base (una sola vez)
│   │   ├── README.md                   Para: Guia de la fase
│   │   ├── backend-setup.md            Para: DB schemas + API boilerplate
│   │   └── frontend-setup.md           Para: Design System + proyecto frontend
│   │
│   ├── fase-4-specification/           Para: Generar product backlog (PBI)
│   │   ├── pbi-product-backlog.md      Para: Setup MVP - epic-tree + epicas/stories (Jira-First)
│   │   └── pbi-add-feature.md          Para: Post-MVP - Analiza + crea features (3 niveles)
│   │
│   ├── fase-5-shift-left-testing/      Para: Generar docs de testing
│   │   ├── feature-test-plan.md        Para: Prompt de plan de pruebas (epica)
│   │   └── story-test-cases.md         Para: Prompt de test cases (story)
│   │
│   ├── fase-6-planning/                Para: Generar planes de implementacion
│   │   ├── feature-implementation-plan.md Para: Prompt de plan tecnico (epica)
│   │   └── story-implementation-plan.md   Para: Prompt de plan tecnico (story)
│   │
│   ├── fase-7-implementation/          Para: Guias de implementacion de codigo
│   │   ├── README.md                   Para: Guia de uso de prompts de implementacion
│   │   ├── implement-story.md          Para: Implementar story desde cero
│   │   ├── continue-implementation.md  Para: Retomar story pausada
│   │   ├── fix-issues.md               Para: Debuggear y corregir errores
│   │   └── unit-testing.md             Para: Agregar unit tests
│   │
│   ├── fase-8-code-review/             Para: Guias de code review estatico
│   │   ├── README.md                   Para: Guia de uso de prompts de review
│   │   ├── review-pr.md                Para: Review completo de codigo
│   │   └── setup-linting.md            Para: Configurar ESLint + Prettier
│   │
│   ├── fase-9-deployment-staging/      Para: Deploy a ambiente de pruebas
│   │   ├── README.md                   Para: Guia de la fase
│   │   ├── ci-cd-setup.md              Para: GitHub Actions workflow
│   │   ├── environment-config.md       Para: Configurar secrets por ambiente
│   │   └── deploy-to-staging.md        Para: Deploy automatizado
│   │
│   ├── fase-10-exploratory-testing/    Para: Testing manual rapido
│   │   ├── README.md                   Para: Guia de la fase
│   │   ├── smoke-test.md               Para: Validar deployment
│   │   ├── exploratory-test.md         Para: Exploracion profunda con Playwright MCP
│   │   └── bug-report.md               Para: Reportar bugs
│   │
│   ├── fase-11-test-documentation/     Para: Documentacion de tests en Jira
│   │   ├── README.md                   Para: Guia de la fase
│   │   ├── test-analysis.md            Para: Analizar candidatos para regression
│   │   ├── test-prioritization.md      Para: Priorizar tests
│   │   └── test-documentation.md       Para: Crear Test issues en Jira
│   │
│   ├── fase-12-test-automation/        Para: Automation con KATA framework
│   │   ├── README.md                   Para: Guia de la fase
│   │   ├── kata-framework-setup.md     Para: Setup inicial KATA
│   │   ├── automation-e2e-test.md      Para: Implementar tests E2E
│   │   └── automation-integration-test.md Para: Implementar tests API
│   │
│   ├── fase-13-production-deployment/  Para: Deploy a produccion
│   │   ├── README.md                   Para: Guia de la fase
│   │   ├── pre-deploy-checklist.md     Para: Validaciones pre-deploy
│   │   ├── deploy-to-production.md     Para: Estrategia de deploy
│   │   └── rollback-plan.md            Para: Plan de contingencia
│   │
│   ├── fase-14-shift-right-testing/    Para: Monitoring y observabilidad
│   │   ├── README.md                   Para: Guia de la fase
│   │   ├── monitoring-setup.md         Para: Configurar Sentry/logs
│   │   ├── smoke-tests.md              Para: Tests post-deploy
│   │   └── incident-response.md        Para: Playbook de incidentes
│   │
│   ├── git-flow.md                     Para: Estrategia de branching
│   ├── git-conflict-fix.md             Para: Resolver conflictos de merge
│   ├── us-dev-workflow.md              Para: Workflow completo de desarrollo (Fases 6-9)
│   └── us-qa-workflow.md               Para: Workflow completo de QA (Fases 10-12)
│
└── docs/                               Para: Documentacion maestra del sistema
    ├── README.md                       Para: Indice de toda la documentacion
    │
    ├── Arquitectura y Blueprint
    │   ├── ai-driven-software-project-blueprint.md  Para: Metodologia de 14 fases
    │   └── kata-test-architecture.md   Para: Framework de testing KATA
    │
    └── MCP Configuration (Model Context Protocol)
        ├── mcp-config-general.md       Para: Conceptos fundamentales de MCP
        ├── mcp-config-claudecode.md    Para: Configuracion Claude Code
        ├── mcp-config-geminicli.md     Para: Configuracion Gemini CLI
        ├── mcp-config-copilotcli.md    Para: Configuracion GitHub Copilot CLI
        ├── mcp-config-vscode.md        Para: Configuracion VS Code + Copilot
        └── mcp-builder-strategy.md     Para: Optimizacion de tokens (session-based)
```

---

## FLUJO DE TRABAJO COMPLETO

### **FASES SINCRONICAS** (Setup inicial - una sola vez)

#### 1. FASE 1: Constitution (Founder/Cliente)

```
Input: Idea de negocio
Usar: .prompts/fase-1-constitution/
Output: .context/idea/ (2-3 archivos)
Quien: Founder, Cliente, Product Owner
```

#### 2. FASE 2: Architecture (Architect/PM/BA)

```
Input: .context/idea/
Usar: .prompts/fase-2-architecture/
Output:
  - .context/PRD/ (4 archivos: executive-summary, user-personas, mvp-scope, user-journeys)
  - .context/SRS/ (4 archivos: functional-specs, non-functional-specs, architecture-specs, api-contracts)
Quien: Solution Architect, Product Manager, Business Analyst
```

#### 3. FASE 3: Infrastructure (DevOps/Dev)

```
Input: .context/PRD/ + .context/SRS/
Usar: .prompts/fase-3-infrastructure/

Ejecutar en orden:
1. backend-setup.md       → DB schemas + API + tipos TypeScript
2. frontend-setup.md      → Design System + proyecto frontend

Output: Proyecto base funcional con backend + frontend integrados
Quien: DevOps, Backend Dev, Frontend Dev

Por que este orden:
- Backend define schemas → genera tipos TypeScript
- Frontend consume esos tipos → zero type errors
```

---

### **FASES ASINCRONICAS** (Iterativas - por story/sprint)

#### 4. FASE 4: Specification (PO/PM) - FLUJO JIRA-FIRST

```
Input (MVP): .context/PRD/ + .context/SRS/
Input (Post-MVP): Descripcion de feature/idea
Usar:
  - .prompts/fase-4-specification/pbi-product-backlog.md (setup MVP)
  - .prompts/fase-4-specification/pbi-add-feature.md (agregar features)

Flujo Jira-First:
  1. Crea epica/story en Jira (MCP) → Obtiene ID real
  2. Crea carpeta local con ID real (ej: EPIC-MYM-13-nombre/)
  3. Crea archivos .md locales

Output:
  - .context/PBI/epic-tree.md
  - .context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/epic.md
  - .context/PBI/epics/.../stories/STORY-{PROYECTO}-{NUM}-{nombre}/story.md

Beneficio: Nomenclatura correcta desde el inicio (IDs reales de Jira)
Quien: Product Owner, Product Manager
```

#### 5. FASE 5: Shift-Left Testing (QA)

```
Input: .context/PBI/ (epicas y stories especificas)
Usar: .prompts/fase-5-shift-left-testing/
Output:
  - .context/PBI/epics/EPIC-XXX/feature-test-plan.md
  - .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/test-cases.md
Quien: QA Engineer, Test Lead
```

#### 6. FASE 6: Planning (Tech Lead/Dev)

```
Input: .context/PBI/ + .context/SRS/
Usar: .prompts/fase-6-planning/
Output:
  - .context/PBI/epics/EPIC-XXX/feature-implementation-plan.md
  - .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md
Quien: Tech Lead, Senior Developer
```

#### 7. FASE 7: Implementation (Dev + IA)

```
Input: .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md
Leer: .context/guidelines/ (TODOS los archivos)
Usar: .prompts/fase-7-implementation/

Flujo:
1. implement-story.md     → Implementar funcionalidad
2. unit-testing.md        → Agregar unit tests (si aplica)

Output: Codigo funcional implementado (src/, componentes, API, DB) + unit tests
Quien: Developer + AI Assistant
Nota: Solo funcionalidad + unit tests - NO incluye integration/E2E tests (esos van en Fase 12)
```

#### 8. FASE 8: Code Review (Tech Lead/Senior Dev)

```
Input: Codigo implementado (Fase 7)
Leer: .context/guidelines/code-standards.md
Usar: .prompts/fase-8-code-review/
Output: Reporte de review (APPROVE / CHANGES REQUESTED)
Quien: Tech Lead, Senior Developer
Nota: Analisis estatico - NO revisa tests (tests van en Fase 12)
```

#### 9. FASE 9: Deployment Staging (DevOps)

```
Input: Codigo aprobado (Fase 8)
Usar: .prompts/fase-9-deployment-staging/

CI/CD ejecuta automaticamente:
1. Linting
2. Unit tests
3. Build
4. Deploy to Vercel Staging

Output: URL de staging disponible
Quien: DevOps (automatizado)
```

#### 10. FASE 10: Exploratory Testing (QA)

```
Input: URL de staging
Usar: .prompts/fase-10-exploratory-testing/

Flujo:
1. smoke-test.md          → Validar deployment (5 min)
2. exploratory-test.md    → Exploracion profunda con Playwright MCP
3. bug-report.md          → Reportar bugs

Output: Feedback manual + bugs encontrados
Quien: QA Engineer

Por que manual antes que automatizado:
- Feedback rapido (minutos vs horas)
- Encuentra bugs de UX que tests automatizados no ven
- Solo automatizas lo ya validado manualmente
```

#### 11. FASE 11: Test Documentation (QA)

```
Input: Exploratory findings (Fase 10)
Usar: .prompts/fase-11-test-documentation/

Flujo:
1. test-analysis.md       → Analizar candidatos para regression
2. test-prioritization.md → Priorizar tests
3. test-documentation.md  → Crear Test issues en Jira

Output: Tests documentados en Jira con trazabilidad
Quien: QA Engineer
```

#### 12. FASE 12: Test Automation (QA Automation)

```
Input: Tests documentados (Fase 11)
Usar: .prompts/fase-12-test-automation/

Arquitectura: KATA Framework

Flujo:
1. kata-framework-setup.md         → Setup inicial (primera vez)
2. automation-integration-test.md  → Implementar tests API
3. automation-e2e-test.md          → Implementar tests E2E

Output: Integration + E2E tests funcionando en CI/CD
Quien: QA Automation Engineer, SDET
Nota: Solo automatiza lo ya validado en Fase 10

Tipos de tests:
- Integration tests (API)
- E2E tests (UI con Playwright)
- NO unit tests (esos van en Fase 7)
```

#### 13. FASE 13: Production Deployment (DevOps)

```
Input: Tests automation pasando (Fase 12)
Usar: .prompts/fase-13-production-deployment/

Flujo:
1. pre-deploy-checklist.md   → Validaciones pre-deploy
2. deploy-to-production.md   → Deploy estrategico
3. rollback-plan.md          → Solo si hay problemas

Output: Codigo en produccion
Quien: DevOps
```

#### 14. FASE 14: Shift-Right Testing (SRE/DevOps)

```
Input: Produccion activa
Usar: .prompts/fase-14-shift-right-testing/

Componentes:
- Monitoring (Sentry, logs)
- Smoke tests post-deploy
- Incident response

Output: Observabilidad activa
Quien: SRE, DevOps
```

---

## CONCEPTOS CLAVE

### Documentacion vs Prompts

| Tipo              | Ubicacion   | Proposito                                            |
| ----------------- | ----------- | ---------------------------------------------------- |
| **Documentacion** | `.context/` | Informacion que la IA lee para trabajar              |
| **Prompts**       | `.prompts/` | Plantillas para GENERAR documentacion en `.context/` |
| **Blueprints**    | `docs/`     | Documentacion maestra del sistema completo           |

### Roles por Fase

| Fase             | Nombre              | Tipo      | Rol                     | Input                             | Output                             |
| ---------------- | ------------------- | --------- | ----------------------- | --------------------------------- | ---------------------------------- |
| **SINCRONICAS**  |                     |           |                         |                                   |                                    |
| 1                | Constitution        | Setup     | Founder/Cliente/PO      | Idea de negocio                   | `.context/idea/`                   |
| 2                | Architecture        | Setup     | Architect/PM/BA         | `.context/idea/`                  | `.context/PRD/` + `.context/SRS/`  |
| 3                | Infrastructure      | Setup     | DevOps/Backend/Frontend | PRD + SRS                         | Cloud + Backend + Frontend base    |
| **ASINCRONICAS** |                     |           |                         |                                   |                                    |
| 4                | Specification       | Iterativa | PO/PM                   | PRD + SRS                         | `.context/PBI/` (epicas + stories) |
| 5                | Shift-Left Testing  | Iterativa | QA Engineer             | PBI                               | Test plans + test cases en PBI     |
| 6                | Planning            | Iterativa | Tech Lead/Dev           | SRS + PBI                         | Implementation plans               |
| 7                | Implementation      | Iterativa | Dev + IA                | Implementation plans + guidelines | Codigo (src/) + unit tests         |
| 8                | Code Review         | Iterativa | Tech Lead/Senior Dev    | Pull Request                      | PR aprobado                        |
| 9                | Deployment Staging  | Iterativa | DevOps                  | Codigo aprobado                   | Deploy a staging                   |
| 10               | Exploratory Testing | Iterativa | QA Engineer             | Staging                           | Feedback manual + bugs             |
| 11               | Test Documentation  | Iterativa | QA Engineer             | Exploratory findings              | Tests documentados en Jira         |
| 12               | Test Automation     | Iterativa | QA Automation/SDET      | Tests documentados                | Integration + E2E tests            |
| 13               | Production Deploy   | Iterativa | DevOps                  | Tests pasando                     | Deploy a produccion                |
| 14               | Shift-Right Testing | Continua  | SRE/DevOps              | Produccion activa                 | Monitoring + observabilidad        |

### Arquitectura Unificada (PBI)

**Beneficio clave**: Para trabajar en una story, la IA lee **UNA sola carpeta**.

```
.context/PBI/epics/EPIC-MYM-13-mentor-discovery/stories/STORY-MYM-14-view-mentors/
├── story.md                    (Fase 4: Que hacer)
├── test-cases.md               (Fase 5: Como probar)
└── implementation-plan.md      (Fase 6: Como implementar)
```

**TODO en un lugar** → Sin duplicacion → Context Engineering optimizado

**Nomenclatura:** `EPIC-{PROYECTO}-{NUM}-{nombre}/` y `STORY-{PROYECTO}-{NUM}-{nombre}/`

- IDs reales de Jira (obtenidos con flujo Jira-First)
- Kebab-case en nombres descriptivos
- Trazabilidad perfecta: carpeta local ↔ Jira issue (1:1)

---

## CONCEPTOS CLAVE ACTUALIZADOS

### Architecture (Fase 2) vs Infrastructure (Fase 3)

**Architecture (Fase 2):**

- Specs tecnicas en papel
- Diagramas C4, ERD, API contracts
- Decisiones de diseño
- **NO se escribe codigo**

**Infrastructure (Fase 3):**

- Implementacion de la base tecnica
- Codigo real: backend + frontend
- Se ejecuta **una sola vez**
- Output: proyecto funcional base

### Backend antes que Frontend (Fase 3)

**Por que este orden:**

```typescript
// 1. Backend define schemas (Fase 3.1)
// schemas/user.ts
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email()
})

// 2. Backend genera tipos automaticamente
export type User = z.infer<typeof userSchema>

// 3. Frontend importa tipos reales (Fase 3.2)
import type { User } from '@/lib/types'

const UserCard = ({ user }: { user: User }) => {
  return <div>{user.name}</div>  // Zero type errors
}
```

**Beneficios:**

- Zero type mismatches
- Frontend consume APIs reales (no mock)
- Cambios en backend se reflejan automaticamente en frontend

### Testing: Manual antes que Automatizado

**Exploratory (Fase 10) antes que Automation (Fase 12):**

| Aspecto      | Exploratory         | Automation  |
| ------------ | ------------------- | ----------- |
| Velocidad    | 5-30 minutos        | Horas/dias  |
| Cobertura    | Bugs de UX + logica | Solo logica |
| Inversion    | Baja                | Alta        |
| Flexibilidad | Total               | Rigida      |

**Principio:** Solo automatiza lo ya validado manualmente.

**Razon:** No pierdas tiempo automatizando funcionalidad rota o que cambiara.

### Unit Tests en Implementation (Fase 7)

**Por que unit tests van en desarrollo:**

- Son parte natural del codigo
- Rapidos (milisegundos)
- Corren local antes de commit
- Evitan bugs antes de merge

**Integration/E2E van despues (Fase 12):**

- Necesitan ambiente real (staging)
- Lentos (segundos/minutos)
- Validan sistema completo integrado

### Arquitectura KATA en Test Automation

**KATA** = Keyword-Action-Test Architecture

Organiza tests en 3 capas:

- **Components:** Wrappers de APIs o Page Objects
- **Actions:** Flujos de negocio reutilizables
- **Tests:** Casos de prueba concretos

Todos los tests automation siguen KATA.

---

## ESTADISTICAS

### Archivos Totales Creados

| Directorio                 | Archivos            | Proposito                               |
| -------------------------- | ------------------- | --------------------------------------- |
| `.context/idea/`           | 3-4                 | Fase 1: Constitution                    |
| `.context/PRD/`            | 4                   | Fase 2: Architecture (business)         |
| `.context/SRS/`            | 4                   | Fase 2: Architecture (technical)        |
| `.context/PBI/`            | Variable            | Fases 4-6 (depende de # epicas/stories) |
| `.context/guidelines/`     | 10                  | Fases 7-14: Reference material          |
| `.context/guidelines/TAE/` | 10                  | Fase 12: Test Automation                |
| `.prompts/`                | ~40                 | Guias de prompts (todas las fases)      |
| `docs/`                    | 9                   | Blueprints + MCP configs                |
| **TOTAL BASE**             | **~80-90 archivos** | Sistema completo (14 fases)             |

---

## PUNTOS CLAVE PARA RECORDAR

### DO's (Hacer)

1. **Seguir el orden secuencial** de fases (1-3 para setup, luego 4-14 iterativo)
2. **Usar prompts de `.prompts/`** para generar docs en `.context/`
3. **Fase 3 ANTES de Fase 4** - Setup tecnico antes de backlog
4. **Backend antes que Frontend** en Fase 3 (tipos compartidos)
5. **Exploratory antes que Automation** - Manual (Fase 10) antes de automatizar (Fase 12)
6. **Unit tests en Fase 7** - Durante implementation, no despues
7. **Usar flujo Jira-First** en Fase 4 (crear en Jira → obtener ID → crear local)
8. **Leer guidelines** antes de implementar (Fases 7-14)
9. **Usar MCP tools** (Supabase, Atlassian) para datos reales y crear issues
10. **Mantener arquitectura unificada** (todo en carpeta de story)
11. **Seguir nomenclatura estandar** (EPIC-{PROYECTO}-{NUM}-{nombre})
12. **Fases 1-3 son sincronicas** (una sola vez), **Fases 4-14 son asincronicas** (por sprint)

### DON'Ts (No hacer)

1. **NO hardcodear** SQL schemas (usar Supabase MCP)
2. **NO saltarse** fases (cada una depende de la anterior)
3. **NO duplicar** informacion (DRY always)
4. **NO mezclar** prompts con documentacion
5. **NO crear** archivos innecesarios (solo si son criticos)
6. **NO crear epicas/stories localmente primero** (usar flujo Jira-First con MCP)
7. **NO usar nomenclatura inconsistente** (siempre EPIC-{PROYECTO}-{NUM}-{nombre})
8. **NO inventar IDs** (siempre usar IDs reales de Jira obtenidos con MCP)
9. **NO crear Frontend antes que Backend** (orden incorrecto)
10. **NO automatizar antes de validar manualmente** (Exploratory primero)
11. **NO poner unit tests en Fase 12** (van en Fase 7)
12. **NO saltarse smoke tests** (Fase 10 primero)

---

## PROXIMOS PASOS

1. **Para nuevos proyectos**: Empezar con `.prompts/fase-1-constitution/`
2. **Para proyectos existentes**: Empezar con analisis legacy → `.context/idea/legacy-analysis.md`
3. **Setup inicial**: Completar Fases 1-3 (Constitution + Architecture + Infrastructure) antes de entrar a sprints
4. **Setup MVP (Fase 4)**: Usar `pbi-product-backlog.md` con flujo Jira-First para crear backlog inicial
5. **Infrastructure (Fase 3)**: Ejecutar en orden: backend-setup → frontend-setup
6. **Agregar features post-MVP**: Usar `pbi-add-feature.md` que analiza complejidad y crea incremental
7. **Para implementacion (Fase 7)**: Usar `.prompts/fase-7-implementation/implement-story.md` por cada story
8. **Para code review (Fase 8)**: Usar `.prompts/fase-8-code-review/review-pr.md` antes de merge
9. **Para exploratory testing (Fase 10)**: Usar `.prompts/fase-10-exploratory-testing/` despues de deploy staging
10. **Para test documentation (Fase 11)**: Usar `.prompts/fase-11-test-documentation/` despues de exploratory
11. **Para automation (Fase 12)**: Usar `.prompts/fase-12-test-automation/` despues de documentar tests
12. **Para production (Fase 13)**: Usar `.prompts/fase-13-production-deployment/` cuando tests pasen
13. **Para monitoring (Fase 14)**: Usar `.prompts/fase-14-shift-right-testing/` en produccion

---

## DOCUMENTACION COMPLETA

### Arquitectura del Sistema

- **[AI-Driven Software Project Blueprint](./docs/ai-driven-software-project-blueprint.md)** - Metodologia completa de 14 fases
- **[KATA Test Architecture](./docs/kata-test-architecture.md)** - Framework de testing automatizado

### MCP Configuration (Model Context Protocol)

> **Que es MCP?** Un protocolo que permite a las IAs conectarse con herramientas externas (bases de datos, APIs, testing, etc.)

**Configuracion Esencial**:

1. **[MCP Builder Strategy](./docs/mcp-builder-strategy.md)** - EMPIEZA AQUI
   - Solucion al "Token Hell" (reduccion 80-90% tokens)
   - Carga de MCPs por sesion/tarea
   - Setup paso a paso con templates

2. **[MCP - Guia General](./docs/mcp-config-general.md)**
   - Conceptos fundamentales
   - Tipos de transporte (stdio, HTTP, SSE)
   - Seguridad y autenticacion

**Configuracion por Herramienta** (elige la tuya):

- **[Claude Code](./docs/mcp-config-claudecode.md)** - CLI de Anthropic
- **[Gemini CLI](./docs/mcp-config-geminicli.md)** - CLI de Google
- **[GitHub Copilot CLI](./docs/mcp-config-copilotcli.md)** - CLI de GitHub
- **[VS Code + Copilot](./docs/mcp-config-vscode.md)** - Integracion en editor

**Quick Start MCP**:

```bash
# 1. Configura variables de ambiente
cp .env.example .env
# Edita .env y ajusta las rutas segun tu herramienta (Gemini, Claude Code, etc.)

# 2. Copia template de MCP catalog
cp templates/mcp/gemini.template.json .gemini/settings.catalog.json

# 3. Agrega tus API keys al catalog
# Edita .gemini/settings.catalog.json con tus claves reales

# 4. Carga MCPs por tarea
node scripts/mcp-builder.js backend  # Solo supabase + context7
node scripts/mcp-builder.js frontend  # Solo playwright + context7
```

---

**Este sistema es tu "segundo cerebro" para desarrollo de software impulsado por IA. Cada archivo tiene un proposito especifico en el flujo de trabajo completo de 14 fases.**

---

## CODE QUALITY TOOLS

Este template incluye herramientas de code quality preconfiguradas:

### Herramientas Incluidas

| Herramienta      | Proposito                                | Configuracion      |
| ---------------- | ---------------------------------------- | ------------------ |
| **Prettier**     | Formateo automatico de codigo            | `.prettierrc`      |
| **ESLint**       | Linting y deteccion de errores           | `eslint.config.js` |
| **Husky**        | Git hooks automatizados                  | `.husky/`          |
| **lint-staged**  | Ejecutar linters solo en archivos staged | `package.json`     |
| **EditorConfig** | Consistencia de estilo entre editores    | `.editorconfig`    |

### Scripts Disponibles

```bash
# Formateo
bun run format          # Formatear todos los archivos
bun run format:check    # Verificar formato sin modificar

# Linting
bun run lint            # Ejecutar ESLint
bun run lint:fix        # Ejecutar ESLint con auto-fix
```

### Pre-commit Hook

El hook pre-commit ejecuta automaticamente:

1. **ESLint** con auto-fix en archivos `.ts`, `.tsx`, `.js`, `.jsx`
2. **Prettier** en archivos modificados

Esto asegura que todo codigo commiteado cumple con los estandares del proyecto.

### Configuracion de Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

---

**Version 3.0** - Expandido de 13 a 14 fases con Test Documentation separada
**Ultima actualizacion:** 2025-12-21
