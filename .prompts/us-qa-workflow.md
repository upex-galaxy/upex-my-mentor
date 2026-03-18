# US QA Workflow

> **Propósito**: Workflow completo de QA para un User Story, desde testing exploratorio hasta automatización.
> **Alcance**: Un US a la vez - completar todas las etapas antes de pasar al siguiente US.
> **Output**: Feature testeado, casos de test documentados, tests automatizados.

---

## Overview

Este orquestador guía el proceso completo de QA para **un User Story**. Ejecutar las etapas secuencialmente, completando cada una antes de avanzar.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     QA WORKFLOW PARA UN USER STORY                          │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Stage 1  │───►│ Stage 2  │───►│ Stage 3  │───►│ Stage 4  │───►│ Stage 5  │
  │ Shift-   │    │ Explora- │    │ Document │    │ Automate │    │ Regres-  │
  │ Left     │    │ tory     │    │ ation    │    │          │    │ sion     │
  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
       │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼
    ATP/Test        Bugs +         ATCs en        Tests           Reporte
    Plan            Hallazgos      TMS            Automatizados   Ejecución

  ◄────────────────── FEEDBACK LOOP ──────────────────────────────────────────►
```

---

## Input Requerido

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INFORMACIÓN DEL USER STORY                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Story ID:        _________________________________ (ej: PROJ-123)          │
│                                                                             │
│ Story Title:     _________________________________ (descripción breve)     │
│                                                                             │
│ Status:          ○ Ready For QA    ○ In Testing    ○ QA Approved           │
│                                                                             │
│ Staging URL:     _________________________________ (para testing)          │
│                                                                             │
│ Source:          ○ Jira (usar MCP)    ○ Input manual                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prerrequisitos

Antes de empezar, verificar:

- [ ] User Story está en status "Ready For QA"
- [ ] Feature desplegado en ambiente de staging
- [ ] Acceso a staging URL disponible
- [ ] Archivos de contexto cargados (ver sección Context Loading)

### Context Loading

```markdown
Cargar estos archivos antes de empezar:

1. `qa/.context/guidelines/TAE/KATA-AI-GUIDE.md` → Patrones KATA
2. `qa/.context/guidelines/TAE/automation-standards.md` → Estándares de código
3. `.context/test-management-system.md` → Configuración TMS (si existe)
4. `.context/project-test-guide.md` → Qué testear (si existe)
```

---

## Stage 1: Shift-Left Testing

> **Prompt**: `.prompts/fase-5-shift-left-testing/acceptance-test-plan.md`
> **Cuándo**: Antes o durante desarrollo (opcional si US ya está en QA)
> **Output**: Acceptance Test Plan (ATP) con escenarios de test

### Acciones

1. **Leer el User Story**
   - Obtener detalles de Jira (si MCP disponible) o input manual
   - Extraer Criterios de Aceptación
   - Identificar reglas de negocio

2. **Crear ATP**
   - Usar prompt para generar escenarios de test
   - Aplicar nomenclatura: `{US_ID}: TC#: Validar <CORE> <CONDITIONAL>`
   - Identificar variables y necesidades de datos de test

3. **Decisión**
   - Skip si US ya tiene casos de test documentados
   - Continuar si se planean nuevos tests

### Output Checkpoint

```markdown
## Stage 1 Completo

- [ ] ATP creado con N escenarios de test
- [ ] Nomenclatura de test aplicada
- [ ] Variables identificadas
- [ ] Listo para testing exploratorio
```

---

## Stage 2: Exploratory Testing

> **Prompts**: `.prompts/fase-10-exploratory-testing/*.md`
> **Cuándo**: Feature desplegado en staging
> **Output**: Hallazgos de exploración, bugs reportados

### Acciones

1. **Smoke Test** (5-10 min)
   - Usar: `.prompts/fase-10-exploratory-testing/smoke-test.md`
   - Verificar que funcionalidad básica funciona
   - Verificar que no hay errores bloqueantes

2. **Exploración Profunda** (varía)
   - Usar: `.prompts/fase-10-exploratory-testing/exploratory-test.md`
   - Testear happy paths y edge cases
   - Documentar hallazgos

3. **Reporte de Bugs** (si se encuentran issues)
   - Usar: `.prompts/fase-10-exploratory-testing/bug-report.md`
   - Crear bugs en Jira (confirmar con usuario primero)
   - Linkear bugs al User Story

4. **Punto de Decisión**
   - **PASSED**: Continuar a Stage 3
   - **BLOCKED**: Esperar fixes, retornar al Step 1
   - **FAILED**: Reportar issues, escalar

### Herramientas MCP (si disponibles)

```
- mcp__playwright__* → Automatización de browser para UI testing
- mcp__atlassian__* → Jira para creación de bugs
```

### Output Checkpoint

```markdown
## Stage 2 Completo

- [ ] Smoke test: PASSED / FAILED
- [ ] Testing exploratorio: PASSED / FAILED / BLOCKED
- [ ] Bugs creados: N (o ninguno)
- [ ] Recomendación: APROBAR / RECHAZAR / ESPERAR
```

---

## Stage 3: Test Documentation

> **Prompts**: `.prompts/fase-11-test-documentation/*.md`
> **Cuándo**: Después de que testing exploratorio pasa
> **Output**: Casos de test documentados en TMS

### Acciones

1. **Analizar Candidatos de Test**
   - Usar: `.prompts/fase-11-test-documentation/test-analysis.md`
   - Revisar hallazgos de exploración
   - Identificar escenarios para suite de regresión
   - Separar: automatizable vs solo-manual

2. **Priorizar para Automatización**
   - Usar: `.prompts/fase-11-test-documentation/test-prioritization.md`
   - Aplicar fórmula ROI
   - Rankear por impacto de negocio

3. **Documentar en TMS**
   - Usar: `.prompts/fase-11-test-documentation/test-documentation.md`
   - Crear casos de test con formato Gherkin
   - Usar patrón de variables (no datos hardcodeados)
   - Linkear al User Story

### Output Checkpoint

```markdown
## Stage 3 Completo

- [ ] Análisis de test completado
- [ ] N tests identificados para automatización
- [ ] N tests marcados como solo-manual
- [ ] Casos de test creados en TMS: TEST-001, TEST-002, ...
- [ ] Tests linkeados al US
```

---

## Stage 4: Test Automation

> **Prompts**: `.prompts/fase-12-test-automation/*.md`
> **Cuándo**: Después de casos de test documentados
> **Output**: Tests automatizados siguiendo arquitectura KATA

### Workflow: Plan → Coding → Review

Para cada caso de test a automatizar:

#### Fase 1: Plan

```markdown
# Para tests E2E (UI):
Usar: `.prompts/fase-12-test-automation/e2e/e2e-plan.md`

# Para tests Integration (API):
Usar: `.prompts/fase-12-test-automation/integration/integration-plan.md`
```

#### Fase 2: Coding

```markdown
# Para tests E2E (UI):
Usar: `.prompts/fase-12-test-automation/e2e/e2e-coding.md`

# Para tests Integration (API):
Usar: `.prompts/fase-12-test-automation/integration/integration-coding.md`
```

#### Fase 3: Review

```markdown
# Para tests E2E (UI):
Usar: `.prompts/fase-12-test-automation/e2e/e2e-review.md`

# Para tests Integration (API):
Usar: `.prompts/fase-12-test-automation/integration/integration-review.md`
```

### Validación

```bash
# Ejecutar desde la carpeta qa/
cd qa

# Ejecutar el nuevo test
bun run test tests/e2e/{module}/{test}.test.ts

# O para integration
bun run test tests/integration/{module}/{test}.test.ts

# Verificar linting
bun run lint

# Verificar tipos
bun run type-check
```

### Output Checkpoint

```markdown
## Stage 4 Completo

- [ ] Plan creado para cada test
- [ ] Componente implementado (si necesario)
- [ ] Archivo de test creado
- [ ] Fixture actualizado (si necesario)
- [ ] Code review: APROBADO
- [ ] Test pasa localmente
- [ ] Lint/type-check pasan
```

---

## Stage 5: Regression (Opcional por US)

> **Prompts**: `.prompts/fase-12-test-automation/regression/*.md`
> **Cuándo**: Después de automatización completa O al momento de release
> **Output**: Reporte de ejecución, decisión GO/NO-GO

### Cuándo Ejecutar

| Trigger | Acción |
|---------|--------|
| US individual completo | Ejecutar sanity con nuevo test |
| Sprint completo | Ejecutar regresión completa |
| Pre-release | Ejecutar regresión completa + reporte |

### Acciones

1. **Ejecutar Tests**
   - Usar: `.prompts/fase-12-test-automation/regression/regression-execution.md`
   - Disparar workflow apropiado via `gh` CLI
   - Monitorear hasta completar

2. **Analizar Resultados**
   - Usar: `.prompts/fase-12-test-automation/regression/regression-analysis.md`
   - Clasificar cualquier fallo
   - Calcular métricas

3. **Generar Reporte** (para releases)
   - Usar: `.prompts/fase-12-test-automation/regression/regression-report.md`
   - Crear recomendación GO/NO-GO
   - Compartir con stakeholders

### Sanity Rápido para US Individual

```bash
# Ejecutar desde raíz del proyecto
# Ejecutar solo el nuevo test
gh workflow run sanity.yml \
  -f environment=staging \
  -f test_file="tests/e2e/{module}/{test}.test.ts"
```

### Output Checkpoint

```markdown
## Stage 5 Completo

- [ ] Tests ejecutados exitosamente
- [ ] Nuevo test pasa en CI
- [ ] No se introdujeron regresiones
- [ ] (Opcional) Reporte de regresión completo generado
```

---

## Resumen del Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW COMPLETO PARA US: {US-ID}                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Stage 1: Shift-Left                                                        │
│  ├─ [ ] ATP creado con escenarios de test                                  │
│  └─ [ ] Variables y datos de test identificados                            │
│                                                                             │
│  Stage 2: Exploratory                                                       │
│  ├─ [ ] Smoke test PASSED                                                  │
│  ├─ [ ] Exploración profunda completa                                      │
│  ├─ [ ] Bugs reportados (si hay)                                           │
│  └─ [ ] Decisión: APROBAR / RECHAZAR                                       │
│                                                                             │
│  Stage 3: Documentation                                                     │
│  ├─ [ ] Análisis de test completo                                          │
│  ├─ [ ] Tests priorizados para automatización                              │
│  └─ [ ] Casos de test creados en TMS                                       │
│                                                                             │
│  Stage 4: Automation                                                        │
│  ├─ [ ] Plan creado para cada test                                         │
│  ├─ [ ] Código implementado (componente + test)                            │
│  ├─ [ ] Code review APROBADO                                               │
│  └─ [ ] Tests pasan localmente                                             │
│                                                                             │
│  Stage 5: Regression                                                        │
│  ├─ [ ] Sanity ejecutado con nuevo(s) test(s)                              │
│  └─ [ ] No se introdujeron regresiones                                     │
│                                                                             │
│  ✅ US COMPLETO                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Template de Tracking de Progreso

Copiar este template para trackear progreso de un US específico:

```markdown
# Progreso QA: {US-ID} - {Title}

## User Story
- **ID**: {US-ID}
- **Title**: {Title}
- **Status**: Ready For QA → In Testing → QA Approved
- **Staging URL**: {URL}

## Stage 1: Shift-Left
- [ ] ATP creado
- Escenarios: {N}
- Notas: {cualquier nota}

## Stage 2: Exploratory
- [ ] Smoke: PASS / FAIL
- [ ] Exploración: PASS / FAIL
- Bugs: {lista o "ninguno"}
- Decisión: {APROBAR / RECHAZAR}

## Stage 3: Documentation
- [ ] Análisis completo
- [ ] Tests en TMS: {TEST-001, TEST-002, ...}
- Candidatos automatización: {N}
- Solo manual: {N}

## Stage 4: Automation
| Test ID | Tipo | Status | Archivo |
|---------|------|--------|---------|
| TEST-001 | E2E | ✅ Done | qa/tests/e2e/... |
| TEST-002 | API | 🔄 In Progress | qa/tests/integration/... |

## Stage 5: Regression
- [ ] Sanity: PASS / FAIL
- [ ] Regresión: N/A (US individual)

## Completado
- [ ] Todas las etapas completas
- [ ] Listo para siguiente US
```

---

## Archivos de Contexto Requeridos

Antes de empezar, asegurar que estos archivos estén disponibles:

| Archivo | Propósito |
|---------|-----------|
| `qa/.context/guidelines/TAE/KATA-AI-GUIDE.md` | Orientación rápida KATA |
| `qa/.context/guidelines/TAE/automation-standards.md` | Estándares de código |
| `qa/.context/guidelines/TAE/kata-architecture.md` | Arquitectura del framework |

---

## Herramientas MCP Utilizadas

| Herramienta | Stage | Propósito |
|-------------|-------|-----------|
| `mcp__atlassian__getJiraIssue` | Todos | Leer detalles del US |
| `mcp__atlassian__createJiraIssue` | 2, 3 | Crear issues Test/Bug |
| `mcp__atlassian__addCommentToJiraIssue` | Todos | Agregar comentarios |
| `mcp__playwright__browser_navigate` | 2 | Navegar páginas |
| `mcp__playwright__browser_snapshot` | 2 | Obtener estructura de página |
| `mcp__playwright__browser_click` | 2 | Clickear elementos |
| `mcp__playwright__browser_type` | 2 | Escribir texto |
| `mcp__playwright__browser_take_screenshot` | 2 | Capturar evidencia |

---

## Documentación Relacionada

| Stage | Directorio de Prompts |
|-------|----------------------|
| Stage 1 | `.prompts/fase-5-shift-left-testing/` |
| Stage 2 | `.prompts/fase-10-exploratory-testing/` |
| Stage 3 | `.prompts/fase-11-test-documentation/` |
| Stage 4 | `.prompts/fase-12-test-automation/` |
| Stage 5 | `.prompts/fase-12-test-automation/regression/` |

### Guidelines

- `qa/.context/guidelines/TAE/KATA-AI-GUIDE.md` - Patrones KATA
- `qa/.context/guidelines/TAE/automation-standards.md` - Estándares de código

### Utilities

- `.prompts/kata-framework-setup.md` - Setup del framework
- `.prompts/utilities/git-flow.md` - Workflow de Git

---

## Manejo de Errores

| Situación | Acción |
|-----------|--------|
| US no listo | Verificar status, esperar "Ready For QA" |
| Staging caído | Verificar deployment, escalar a DevOps |
| Bug crítico encontrado | Parar exploración, crear bug, esperar fix |
| Automatización bloqueada | Marcar test como solo-manual, continuar con otros |
| Test flaky | Debugear con `--debug` flag, agregar waits apropiados |
| Fallo en CI | Verificar logs, verificar configuración de ambiente |

---

## Mejores Prácticas

1. **Completar un US antes de empezar otro** - Evitar context switching
2. **No saltarse exploratorio** - Testing manual valida antes de automatizar
3. **Usar patrón de variables** - No datos de test hardcodeados
4. **Seguir KATA** - Arquitectura consistente en todos los tests
5. **Revisar antes de commit** - La calidad de código importa
6. **Ejecutar sanity después de automatizar** - Verificar que nuevos tests funcionan en CI

---

**Última actualización**: 2026-03-10
