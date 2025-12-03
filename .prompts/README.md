# 🤖 AI PROMPTS - Context Engineering para Desarrollo de Software

Este directorio contiene prompts optimizados para generar documentación de proyecto siguiendo el **AI-Driven Software Project Blueprint v4.0**.

---

## 📋 ÍNDICE DE PROMPTS

### **🔹 FASES SINCRÓNICAS** (una sola vez, setup inicial)

#### **Fase 1: Constitution** (Definición del modelo de negocio)

- `fase-1-constitution/business-model.md` - Generar Business Model Canvas
- `fase-1-constitution/market-context.md` - Generar análisis de mercado

#### **Fase 2: Architecture** (Product + Technical specs)

**PRD (Product Requirements Document):**

- `fase-2-architecture/prd-executive-summary.md` - Problem statement, solution, KPIs
- `fase-2-architecture/prd-user-personas.md` - Perfiles de usuarios objetivo
- `fase-2-architecture/prd-mvp-scope.md` - Épicas iniciales y user stories del MVP
- `fase-2-architecture/prd-user-journeys.md` - Flujos de usuario (happy + edge cases)

**SRS (Software Requirements Specification):**

- `fase-2-architecture/srs-functional-specs.md` - Requerimientos funcionales
- `fase-2-architecture/srs-non-functional-specs.md` - Performance, security, scalability
- `fase-2-architecture/srs-architecture-specs.md` - Arquitectura del sistema
- `fase-2-architecture/srs-api-contracts.md` - OpenAPI spec de endpoints

#### **Fase 3: Infrastructure** ⭐ **NUEVA** (Setup técnico base)

- `fase-3-infrastructure/cloud-services.md` - Setup de Supabase, Vercel, Railway
- `fase-3-infrastructure/backend-setup.md` - DB schemas + API boilerplate + tipos TypeScript
- `fase-3-infrastructure/frontend-setup.md` - Design System + proyecto frontend
- `fase-3-infrastructure/README.md` - Guía de la fase (orden crítico: Backend → Frontend)

---

### **🔹 FASES ASINCRÓNICAS** (iterativas, por sprint/épica)

#### **Fase 4: Specification** (Product Backlog)

- `fase-4-specification/pbi-product-backlog.md` - Setup inicial: Crear epic-tree, épicas y stories del MVP
- `fase-4-specification/pbi-add-feature.md` - ⭐ Agregar features post-MVP (analiza complejidad + crea incremental)

#### **Fase 5: Shift-Left Testing** (QA temprano)

- `fase-5-shift-left-testing/feature-test-plan.md` - Plan de pruebas a nivel épica
- `fase-5-shift-left-testing/story-test-cases.md` - Test cases detallados por story

#### **Fase 6: Planning** (Planificación técnica)

- `fase-6-planning/feature-implementation-plan.md` - Plan técnico a nivel épica
- `fase-6-planning/story-implementation-plan.md` - Plan detallado de implementación por story

#### **Fase 7: Implementation** (Desarrollo + Unit Tests)

- `fase-7-implementation/implement-story.md` - Implementar story desde cero
- `fase-7-implementation/continue-implementation.md` - Continuar story pausada
- `fase-7-implementation/fix-issues.md` - Debuggear y corregir errores
- `fase-7-implementation/unit-testing.md` - ⭐ **NUEVO** - Crear unit tests durante implementación
- `fase-7-implementation/README.md` - Guía de la fase

**⚠️ IMPORTANTE:** Unit tests se crean AQUÍ (Fase 7), NO en Fase 11.

#### **Fase 8: Code Review** (Revisión de código)

- `fase-8-code-review/review-pr.md` - Revisar Pull Request
- `fase-8-code-review/setup-linting.md` - Configurar linters y formatters
- `fase-8-code-review/README.md` - Guía de la fase

#### **Fase 9: Deployment Staging** ⭐ **NUEVA** (CI/CD + Deploy a staging)

- `fase-9-deployment-staging/ci-cd-setup.md` - Configurar GitHub Actions workflow
- `fase-9-deployment-staging/environment-config.md` - Configurar secrets por ambiente
- `fase-9-deployment-staging/deploy-to-staging.md` - Deploy automatizado a staging
- `fase-9-deployment-staging/README.md` - Guía de la fase

#### **Fase 10: Exploratory Testing** ⭐ **NUEVA** (Testing manual rápido)

- `fase-10-exploratory-testing/smoke-test.md` - Smoke test post-deploy (5-10 min)
- `fase-10-exploratory-testing/test-charter.md` - Crear charter de exploración
- `fase-10-exploratory-testing/session-notes.md` - Documentar sesión exploratoria
- `fase-10-exploratory-testing/bug-report.md` - Reportar bugs encontrados
- `fase-10-exploratory-testing/README.md` - Guía de la fase

**⚠️ IMPORTANTE:** Esta fase viene ANTES de Test Automation. No automatices funcionalidad rota.

#### **Fase 11: Test Automation** (Integration + E2E - KATA Framework)

**Prompts KATA existentes (validados):**
- `fase-11-test-automation/test-strategy.md` - Estrategia general de testing del proyecto
- `fase-11-test-automation/kata-implementation-plan.md` - Plan de implementación de KATA framework
- `fase-11-test-automation/automation-standards.md` - Estándares de código para tests

**Prompts nuevos (Integration + E2E):** ⭐
- `fase-11-test-automation/integration-test-plan.md` - Plan de tests API basado en KATA
- `fase-11-test-automation/e2e-test-plan.md` - Plan de tests E2E basado en KATA
- `fase-11-test-automation/implement-integration-tests.md` - Implementar tests de integración (API)
- `fase-11-test-automation/implement-e2e-tests.md` - Implementar tests E2E (Playwright)
- `fase-11-test-automation/README.md` - Guía de la fase

**⚠️ IMPORTANTE:** Esta fase viene DESPUÉS de Exploratory Testing (Fase 10). Solo automatiza funcionalidad validada.

#### **Fase 12: Production Deployment** ⭐ **NUEVA** (Deploy a producción)

- `fase-12-production-deployment/pre-deploy-checklist.md` - Validaciones pre-deploy
- `fase-12-production-deployment/deploy-to-production.md` - Estrategia de deploy a prod
- `fase-12-production-deployment/rollback-plan.md` - Plan de contingencia y rollback
- `fase-12-production-deployment/README.md` - Guía de la fase

#### **Fase 13: Shift-Right Testing** ⭐ **NUEVA** (Monitoring + Observabilidad)

- `fase-13-shift-right-testing/monitoring-setup.md` - Configurar Sentry/DataDog/logs
- `fase-13-shift-right-testing/smoke-tests.md` - Tests post-deploy automatizados
- `fase-13-shift-right-testing/incident-response.md` - Playbook de respuesta a incidentes
- `fase-13-shift-right-testing/README.md` - Guía de la fase

---

## 🎯 CÓMO USAR ESTOS PROMPTS

### **Instrucciones Generales**

1. **Abrir el archivo del prompt** correspondiente a la fase en la que estás
2. **Copiar TODO el contenido** del archivo (Ctrl+A → Ctrl+C)
3. **Pegar en tu chat con la IA** (Claude, ChatGPT, etc.)
4. **Reemplazar los placeholders** con tu información específica:
   - `[usar archivo.md]` → Pega el contenido del archivo referenciado
   - `[PROYECTO]` → Código del proyecto en Jira (ej: MYM, UPEX)
   - `[NUM]` → Número de issue en Jira (ej: 13, 456)
   - `[nombre]` → Nombre descriptivo en kebab-case
   - `[industria/vertical]` → Especifica tu industria
5. **Ejecutar el prompt**
6. **Copiar la respuesta de la IA** al archivo destino en `.context/`

---

### **Workflow Secuencial**

#### **🔹 FASES SINCRÓNICAS** (una sola vez)

#### **Paso 1: Fase 1 - Constitution**

1. Usa `business-model.md` → Genera `.context/idea/business-model.md`
2. Usa `market-context.md` (pega el business-model.md previo) → Genera `.context/idea/market-context.md`

#### **Paso 2: Fase 2 - Architecture (PRD)**

1. Usa `prd-executive-summary.md` → Genera `.context/PRD/executive-summary.md`
2. Usa `prd-user-personas.md` → Genera `.context/PRD/user-personas.md`
3. Usa `prd-mvp-scope.md` → Genera `.context/PRD/mvp-scope.md`
4. Usa `prd-user-journeys.md` → Genera `.context/PRD/user-journeys.md`

#### **Paso 3: Fase 2 - Architecture (SRS)**

1. Usa `srs-functional-specs.md` → Genera `.context/SRS/functional-specs.md`
2. Usa `srs-non-functional-specs.md` → Genera `.context/SRS/non-functional-specs.md`
3. Usa `srs-architecture-specs.md` → Genera `.context/SRS/architecture-specs.md`
4. Usa `srs-api-contracts.md` → Genera `.context/SRS/api-contracts.yaml`

#### **Paso 4: Fase 3 - Infrastructure** ⭐ **NUEVA**

**⚠️ ORDEN CRÍTICO: Backend → Frontend**

1. Usa `cloud-services.md` → Setup Supabase + Vercel + `.env.example`
2. Usa `backend-setup.md` → DB schemas + API + tipos TypeScript generados
3. Usa `frontend-setup.md` → Design System + frontend project + importa tipos del backend
4. Genera `.context/infrastructure/` completo

**Por qué este orden:**
- Backend define schemas → genera tipos TypeScript automáticamente
- Frontend importa tipos reales → zero type mismatches

---

#### **🔹 FASES ASINCRÓNICAS** (iterativas, por sprint/épica)

#### **Paso 5: Fase 4 - Specification (PBI)** ⚡ **FLUJO JIRA-FIRST**

**IMPORTANTE:** Este prompt trabaja de forma incremental usando MCP de Atlassian.

**Primera ejecución (Planificación):**

1. Usa `pbi-product-backlog.md` → Genera `.context/PBI/epic-tree.md` (vista completa)

**Por cada épica (Incremental):**
2. **Jira:** Crea épica en Jira (MCP) → Obtén ID real (ej: MYM-13)
3. **Local:** Crea carpeta `EPIC-MYM-13-nombre-descriptivo/`
4. **Local:** Crea archivo `epic.md`
5. **Jira:** Crea todas las stories de la épica (MCP) → Obtén IDs reales
6. **Local:** Crea carpetas `STORY-MYM-14-nombre/` con `story.md`
7. **Local:** Actualiza `epic.md` con IDs reales
8. ✅ Repite para siguiente épica

**Beneficios:**

- ✅ Nomenclatura correcta desde el inicio (IDs reales de Jira)
- ✅ No hay sincronización posterior
- ✅ Trabajo incremental (menos tokens)
- ✅ Trazabilidad perfecta (carpeta → Jira issue)

---

#### **Paso 5B: Agregar Features Post-MVP** ⚡ **ANALIZA + CREA**

**NUEVO:** Usa `pbi-add-feature.md` para agregar features después del MVP inicial.

**¿Qué hace?**

1. **Analiza la complejidad** de tu idea automáticamente
2. **Clasifica en 3 niveles:**
   - **Nivel 1:** Story individual → Agrega a épica existente
   - **Nivel 2:** Épica completa → Crea épica + stories
   - **Nivel 3:** Múltiples épicas → ⚠️ Genera plan + advierte (no crea nada)
3. **Ejecuta o advierte** según clasificación

**Input:**

- Descripción de la feature/idea
- Epic tree existente (para revisar épicas)

**Beneficios:**

- ✅ Inteligente: Analiza complejidad antes de crear
- ✅ Flexible: Maneja desde 1 story hasta épicas completas
- ✅ Seguro: Advierte si la idea es muy compleja (Nivel 3)
- ✅ Incremental: Flujo Jira-First igual que setup inicial

---

#### **Paso 6: Fase 5 - Shift-Left Testing (por cada épica)** 🔍 **ANÁLISIS CRÍTICO PRIMERO**

**NUEVO ENFOQUE:** QA como analista crítico, no solo ejecutor de test cases.

**Por cada épica (una vez):**

1. Usa `feature-test-plan.md` → Genera:
   - `.context/PBI/epics/EPIC-XXX/feature-test-plan.md`
   - Incluye: Business context + Risk analysis + Critical questions for PO/Dev
   - Requiere: TODO el contexto (idea, PRD completo, SRS completo, epic, stories)

**Por cada story:**
2. Usa `story-test-cases.md` → Genera:

- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/test-cases.md`
- **5 FASES:**
    1. Critical Analysis (business + technical context)
    2. Story Quality Analysis (ambiguities, gaps, edge cases)
    3. Refined Acceptance Criteria (con edge cases identificados)
    4. Test Design (sin número fijo, con parametrización si aplica)
    5. QA Feedback Report (para PO/Dev ANTES de implementar)

**Características clave:**

- ✅ Contexto completo (business + PRD + SRS + arquitectura + API contracts)
- ✅ Análisis crítico antes de test design
- ✅ Identificar ambigüedades y gaps en stories
- ✅ Feedback temprano para PO/Dev (valor real de Shift-Left)
- ✅ NO forzar número mínimo de test cases (depende de complejidad)
- ✅ Parametrización de pruebas cuando aplique
- ✅ Integration/API tests basados en architecture specs

#### **Paso 7: Fase 6 - Planning (por cada épica)**

1. Usa `feature-implementation-plan.md` → Genera `.context/PBI/epics/EPIC-XXX/feature-implementation-plan.md`

**Por cada story de la épica:**
2. Usa `story-implementation-plan.md` → Genera `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md`

#### **Paso 8: Fase 7 - Implementation** (Desarrollo + Unit Tests)

**Por cada story:**

1. Usa `implement-story.md` → Implementa código funcional
2. Usa `unit-testing.md` → ⭐ **NUEVO** - Crea unit tests durante implementación
3. Si hay errores: Usa `fix-issues.md` → Debuggea y corrige
4. Si pausaste: Usa `continue-implementation.md` → Retoma desde donde quedó

**⚠️ IMPORTANTE:**
- ✅ Unit tests se crean AQUÍ (Fase 7), durante implementación
- ❌ NO esperar hasta Fase 11 (que es solo para integration + e2e)
- ✅ Seguir `.context/guidelines/` (code-standards, error-handling, etc.)

**Guidelines a leer:**
- `.context/guidelines/implementation-workflow.md`
- `.context/guidelines/code-standards.md`
- `.context/guidelines/error-handling.md`
- `.context/guidelines/mcp-usage-tips.md`

#### **Paso 9: Fase 8 - Code Review**

1. Usa `review-pr.md` → Revisar Pull Request
2. Si es primera vez: Usa `setup-linting.md` → Configurar linters

**Guidelines a leer:**
- `.context/guidelines/code-standards.md`

#### **Paso 10: Fase 9 - Deployment Staging** ⭐ **NUEVA**

**Primera vez (setup CI/CD):**
1. Usa `ci-cd-setup.md` → Configurar GitHub Actions workflow
2. Usa `environment-config.md` → Configurar secrets en GitHub

**Por cada story (deployment):**
3. Usa `deploy-to-staging.md` → Deploy automático a staging
4. Verifica logs y notifica a QA

**Output:** URL de staging disponible para exploratory testing

#### **Paso 11: Fase 10 - Exploratory Testing** ⭐ **NUEVA**

**⚠️ IMPORTANTE: Esta fase viene ANTES de Test Automation**

**Por cada story desplegada en staging:**

1. Usa `smoke-test.md` → Smoke test rápido (5-10 min)
   - ¿La app carga? ¿Login funciona? ¿Features básicas responden?
2. Usa `test-charter.md` → Crear charter de exploración
3. Ejecuta sesión exploratoria (60-90 min)
4. Usa `session-notes.md` → Documentar hallazgos
5. Si encuentras bugs: Usa `bug-report.md` → Reportar en Jira

**Criterios de salida:**
- ✅ Smoke test pasó
- ✅ Sesión documentada
- ✅ Bugs críticos reportados
- ✅ **Luz verde para automatizar (Fase 11)** o **bloqueo para fix (volver a Fase 7)**

**Por qué manual antes de automatizar:**
- Feedback rápido (minutos vs horas)
- Encuentra bugs de UX que tests automatizados no ven
- Solo automatizas lo ya validado manualmente

#### **Paso 12: Fase 11 - Test Automation** (Integration + E2E - KATA)

**⚠️ IMPORTANTE: Esta fase viene DESPUÉS de Exploratory Testing (Fase 10)**

**Primera vez (setup KATA):**
1. Usa `test-strategy.md` → Genera `.context/guidelines/tae/test-strategy.md`
2. Usa `kata-implementation-plan.md` → Genera `.context/guidelines/tae/kata-implementation-plan.md`
3. Usa `automation-standards.md` → Genera `.context/guidelines/tae/automation-standards.md`

**Por cada feature (iterativo):**

**Integration Tests (API):**
4. Usa `integration-test-plan.md` → Plan de tests API basado en KATA
5. Usa `implement-integration-tests.md` → Implementar tests de integración

**E2E Tests (UI):**
6. Usa `e2e-test-plan.md` → Plan de tests E2E basado en KATA
7. Usa `implement-e2e-tests.md` → Implementar tests E2E con Playwright

**Arquitectura KATA:**
```
tests/
├── integration/           (API tests)
│   └── api/
│       └── users/
│           ├── components/    ← API Wrappers
│           ├── actions/       ← Business Logic
│           └── tests/         ← Test Cases
│
└── e2e/                  (E2E tests)
    └── user-management/
        ├── components/        ← Page Objects
        ├── actions/           ← User Flows
        └── tests/             ← Test Cases
```

**⚠️ IMPORTANTE:**
- ❌ NO crear unit tests aquí (esos van en Fase 7)
- ✅ Solo integration tests (API) y E2E tests (UI)
- ✅ Leer exploratory session notes antes de automatizar

**Archivos de referencia (ya completos en `.context/guidelines/tae/`):**
- `kata-architecture.md` - Documentación completa de KATA
- `test-data-management.md` - Estrategias de datos de prueba
- `tms-integration.md` - Integración con Xray/Jira
- `ci-cd-integration.md` - GitHub Actions para tests

#### **Paso 13: Fase 12 - Production Deployment** ⭐ **NUEVA**

**Antes de deploy:**
1. Usa `pre-deploy-checklist.md` → Validar que TODO está listo
   - Exploratory testing aprobado
   - Automation tests passing
   - Code review aprobado
   - Staging sin errores por 24-48h

**Deploy a producción:**
2. Usa `deploy-to-production.md` → Estrategia de deploy (Blue-Green, Canary, Feature Flags)
3. Usa `rollback-plan.md` → Plan de contingencia documentado

**Post-deploy:**
- Ejecutar smoke tests automatizados (Fase 13)
- Monitorear logs en tiempo real (15-30 min)
- Verificar métricas clave

#### **Paso 14: Fase 13 - Shift-Right Testing** ⭐ **NUEVA**

**⚠️ Esta fase es continua (siempre activa en producción)**

**Primera vez (setup monitoring):**
1. Usa `monitoring-setup.md` → Configurar Sentry, Vercel Analytics, Logtail
2. Usa `smoke-tests.md` → Tests automatizados post-deploy
3. Usa `incident-response.md` → Playbook de respuesta a incidentes

**Monitoreo continuo:**
- Alertas configuradas (error rate, response time, uptime)
- Tests automatizados cada X minutos
- Incident response cuando ocurre issue

**Output:**
- `.context/testing/shift-right/monitoring-config.md`
- `.context/testing/shift-right/incident-reports/`

---

## 📝 NOMENCLATURA DE CARPETAS (PBI)

**IMPORTANTE:** Nomenclatura estándar para épicas y stories en `.context/PBI/`

### Épicas

**Formato:** `EPIC-{PROYECTO}-{NUMERO}-{nombre-descriptivo}/`

**Componentes:**

- `{PROYECTO}`: Código del proyecto en Jira (ej: MYM, UPEX) - MAYÚSCULAS
- `{NUMERO}`: ID numérico de Jira sin ceros a la izquierda (ej: 2, 13, 28)
- `{nombre-descriptivo}`: 2-4 palabras en kebab-case, minúsculas

**Ejemplos válidos:**

- ✅ `EPIC-MYM-2-user-authentication-profiles/`
- ✅ `EPIC-MYM-13-mentor-discovery-search/`
- ✅ `EPIC-UPEX-45-payment-processing/`

**Ejemplos INVÁLIDOS:**

- ❌ `EPIC-001-user-auth/` (falta código proyecto)
- ❌ `EPIC_MYM_2_UserAuth/` (formato incorrecto)
- ❌ `EPIC-MYM-002-auth/` (no usar ceros a la izquierda)

### Stories

**Formato:** `STORY-{PROYECTO}-{NUMERO}-{nombre-descriptivo}/`
(Mismas reglas que épicas)

**Ejemplos válidos:**

- ✅ `STORY-MYM-3-user-signup-email/`
- ✅ `STORY-MYM-14-view-all-mentors/`

---

## ⚙️ TIPS DE USO

### **Contexto Acumulativo**

Los prompts están diseñados para funcionar en cascada:

- Cada prompt pide como input el output de prompts anteriores
- Siempre pega el contenido de los archivos generados previamente cuando el prompt lo solicite

### **Placeholders a Reemplazar**

Cuando veas:

- `[usar archivo.md]` → Copia y pega el contenido completo del archivo
- `[PROYECTO]` → Código del proyecto en Jira (ej: MYM, UPEX)
- `[NUM]` → Número de issue (ej: 13, 456)
- `[nombre]` → Nombre descriptivo en kebab-case
- `[especificar X]` → Reemplaza con tu valor específico

### **Iteración**

- Si la IA genera algo que no te gusta, puedes pedirle que lo refine
- Puedes agregar contexto adicional entre corchetes en el prompt
- Los prompts son templates, no reglas absolutas

### **Herramientas Complementarias (MCP)**

- **Supabase MCP:** Para obtener schema real de DB (NO hardcodear SQL en docs)
- **Atlassian MCP:** Para crear épicas/stories en Jira PRIMERO (flujo Jira-First)
  - Usar en Fase 4 (Specification) para crear issues y obtener IDs reales
  - Garantiza nomenclatura correcta desde el inicio
- **Context7 MCP:** Para consultar docs oficiales actualizadas (Next.js, React, Supabase)
- **Mermaid Live Editor:** Para visualizar/editar diagramas generados

---

## 🚨 IMPORTANTE

### **NO hacer:**

- ❌ Modificar los prompts sin entender su propósito
- ❌ Saltarse fases (cada fase depende de la anterior)
- ❌ Usar SQL estático en documentación (siempre usar Supabase MCP)
- ❌ Crear épicas/stories localmente primero (usar flujo Jira-First con MCP)
- ❌ Usar nomenclatura inconsistente en carpetas PBI
- ❌ Automatizar tests sin validación manual previa (Fase 10 antes de Fase 11)
- ❌ Crear unit tests en Fase 11 (van en Fase 7 durante implementación)

### **SÍ hacer:**

- ✅ Seguir el orden secuencial de fases (1 → 2 → 3 → ... → 13)
- ✅ Pegar contexto completo cuando el prompt lo solicite
- ✅ Revisar y refinar outputs de la IA
- ✅ Usar flujo Jira-First en Fase 4 (crear en Jira → luego local)
- ✅ Seguir nomenclatura estándar (EPIC-{PROYECTO}-{NUM}-{nombre})
- ✅ Trabajar de forma incremental (épica por épica) para optimizar tokens
- ✅ Backend antes que Frontend (Fase 3: Infrastructure)
- ✅ Testing manual antes de automatizar (Fase 10 antes de Fase 11)
- ✅ Unit tests durante implementación (Fase 7)

---

## 📁 ESTRUCTURA DE SALIDA ESPERADA

Después de usar todos los prompts, tu directorio `.context/` debe verse así:

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
├── infrastructure/                [Fase 3] ⭐ NUEVA
│   ├── cloud-setup.md
│   ├── backend-schema.md
│   ├── frontend-project.md
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
├── deployment/                    [Fases 9, 12] ⭐ NUEVA
│   ├── staging/
│   │   ├── ci-cd-config.yaml
│   │   ├── environment-vars.md
│   │   └── deployment-log.md
│   └── production/
│       ├── pre-deploy-checklist.md
│       ├── deployment-log.md
│       └── rollback-procedures.md
│
├── testing/                       [Fases 10, 13] ⭐ NUEVA
│   ├── exploratory/
│   │   ├── smoke-tests.md
│   │   ├── test-charters/
│   │   ├── session-notes/
│   │   └── bug-reports/
│   └── shift-right/
│       ├── monitoring-config.md
│       ├── smoke-tests-automated.md
│       └── incident-reports/
│
└── guidelines/                    [Fases 7-8-11 - Reference material]
    ├── implementation-workflow.md
    ├── code-standards.md
    ├── error-handling.md
    ├── context-loading.md
    ├── mcp-usage-tips.md
    ├── deployment-workflow.md     ⭐ NUEVA
    ├── testing-strategy.md        ⭐ NUEVA
    ├── exploratory-testing.md     ⭐ NUEVA
    ├── git-flow.md                ⭐ NUEVA
    │
    └── tae/                       [Fase 11]
        ├── README.md
        ├── test-strategy.md
        ├── kata-architecture.md
        ├── kata-implementation-plan.md
        ├── component-catalog.md
        ├── atc-registry.md
        ├── automation-standards.md
        ├── integration-test-plan.md     ⭐ NUEVA
        ├── e2e-test-plan.md             ⭐ NUEVA
        ├── test-data-management.md
        ├── tms-integration.md
        └── ci-cd-integration.md
```

---

## 🔗 RECURSOS ADICIONALES

- **Blueprint completo:** `docs/ai-driven-software-project-blueprint.md`
- **KATA Architecture (TAE):** `docs/kata-test-architecture.md`
- **Guidelines para IA:** `.context/guidelines/`
- **CHANGELOG:** `CHANGELOG.md` - Migración v3.0 → v4.0
- **PENDING-PROMPTS:** `PENDING-PROMPTS.md` - Estado de implementación

---

## 📞 SOPORTE

Si tienes dudas sobre cómo usar estos prompts:

1. Lee el Blueprint completo en `docs/ai-driven-software-project-blueprint.md`
2. Revisa el README.md de cada fase en `.prompts/fase-X-nombre/README.md`
3. Consulta los ejemplos en cada prompt
4. Experimenta con prompts individuales primero

---

## 📊 ESTADÍSTICAS

- **Fases totales:** 13 (3 sincrónicas + 10 asincrónicas)
- **Prompts totales:** ~54 archivos
- **Prompts nuevos (v4.0):** 27 archivos
- **Guidelines:** 10 archivos base + 13 archivos TAE
- **Archivos generados:** 118-125 (después de ejecutar todos los prompts)

---

**Versión:** 4.0 (13 Fases: 3 Sincrónicas + 10 Asincrónicas)
**Última actualización:** 2024-11-12
**Autor:** UPEX Galaxy - DOJO AI-Powered Quality Engineer
