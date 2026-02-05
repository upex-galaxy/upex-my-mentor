# Fase 11: Test Documentation

## Propósito

Documentación asincrónica de **ATCs (Acceptance Test Cases)** en Jira **DESPUÉS** de que la funcionalidad ha pasado exploratory testing.

**Por qué existe esta fase:**

- Las features se validan primero (feedback rápido)
- La documentación ocurre cuando la feature es estable
- Los ATCs se documentan para regresión (manual o automatizada)
- Trazabilidad clara: **ATP (Fase 5) → ATCs (Fase 11) → KATA (Fase 12)**
- Decisiones de automatización basadas en ROI

**Conexión IQL:**
Esta fase corresponde al **Step 6 del Mid-Game Testing** - donde los escenarios del ATP se convierten en ATCs formales.

---

## Pre-requisitos

- US status: "QA Approved" (exploratory testing pasado)
- Exploratory session notes con escenarios validados
- Acceso a herramientas:
  - MCP Atlassian (obligatorio)
  - Xray CLI (`bun xray`) si el proyecto usa Xray

**Contexto obligatorio:**

```
Leer primero: .context/guidelines/QA/jira-test-management.md
```

---

## Prompts en Esta Fase

| Orden | Prompt                   | Propósito                                      |
| ----- | ------------------------ | ---------------------------------------------- |
| 1     | `test-analysis.md`       | Analizar US, comentarios y contexto completo   |
| 2     | `test-prioritization.md` | Calcular ROI y decidir path (Candidate/Manual) |
| 3     | `test-documentation.md`  | Crear Tests en Jira, transitar workflow        |

---

## Flujo de Ejecución

```
US Status: QA Approved
        ↓
[1] Test Analysis
    ├── Leer US, comentarios, issues enlazadas (MCP Atlassian)
    ├── Identificar escenarios de prueba
    ├── Clasificar por tipo (E2E, Integration, Functional)
    └── Mapear componentes reutilizables (Lego)
        ↓
[2] Test Prioritization
    ├── Calcular ROI por escenario
    ├── Aplicar bonus por reutilización
    ├── Decidir path: Candidate vs Manual vs Deferred
    └── Ordenar por prioridad de implementación
        ↓
[3] Test Documentation
    ├── Verificar modalidad (Jira nativo vs Xray)
    ├── Verificar/crear épica de regresión
    ├── Crear Tests (MCP Atlassian o Xray CLI)
    ├── Vincular a User Story
    └── Transitar workflow: Draft → In Design → Ready → [Manual|Candidate]
        ↓
Output:
    ├── Candidates → Fase 12: Test Automation
    └── Manual → Suite de regresión manual
```

---

## Modalidades de Test Management

### Pregunta Clave

```
¿El proyecto utiliza Xray como plugin?

- SÍ → Xray CLI (`bun xray`) + MCP Atlassian
- NO → Solo MCP Atlassian con Issue Type "Test"
```

### Herramientas por Modalidad

| Modalidad   | Herramientas               |
| ----------- | -------------------------- |
| Jira nativo | MCP Atlassian              |
| Jira + Xray | MCP Atlassian + `bun xray` |

---

## Workflow de ATCs

```
DRAFT → IN DESIGN → READY → [MANUAL | IN REVIEW → CANDIDATE]

Estados finales de regresión:
- MANUAL: ATC para regresión manual
- AUTOMATED: ATC automatizado con KATA (después de Fase 12)
```

**Trazabilidad KATA:** Cada ATC marcado como CANDIDATE usa el decorador `@atc('PROJECT-XXX')` en Fase 12.

Referencia visual completa en: `.context/guidelines/QA/jira-test-management.md`

---

## Épica de Regresión

**OBLIGATORIO:** Todos los tests deben pertenecer a una épica de regresión.

```
Buscar: project = PROJ AND issuetype = Epic AND (summary ~ "regression" OR labels = "test-repository")

Si no existe → Crear "{PROJECT} Test Repository"
```

---

## Clasificación de Tests

| Tipo            | Descripción                           | Automatizable |
| --------------- | ------------------------------------- | ------------- |
| **E2E**         | Flujo completo de usuario             | Sí            |
| **Integration** | Comunicación entre sistemas/APIs      | Sí            |
| **Functional**  | Funcionalidad específica aislada      | Sí            |
| **Smoke**       | Verificación básica de funcionamiento | Sí            |
| **Visual**      | Validación visual                     | No (manual)   |

---

## Decisiones de Path

| ROI Score | Path                  | Status Final |
| --------- | --------------------- | ------------ |
| > 1.5     | → Candidate           | CANDIDATE    |
| 0.5 - 1.5 | → Evaluar / In Review | IN REVIEW    |
| < 0.5     | → Manual o Diferir    | MANUAL       |

---

## Comandos Xray CLI

```bash
# Autenticación
bun xray auth login --client-id "$XRAY_CLIENT_ID" --client-secret "$XRAY_CLIENT_SECRET"
bun xray auth status

# Crear test
bun xray test create --project PROJ --summary "Test name" \
  --step "Action|Expected"

# Crear test Cucumber
bun xray test create --project PROJ --type Cucumber \
  --summary "Feature" --gherkin "Feature: X\n  Scenario: Y"

# Listar tests
bun xray test list --project PROJ
```

---

## Output de Esta Fase

- Tests creados en Jira como Issue Type "Test"
- Tests vinculados a User Stories relacionadas
- Tests dentro de Épica de Regresión
- Estados transitados según workflow
- Candidatos de automatización listos para Fase 12
- Tests manuales en suite de regresión

---

## Siguiente Fase

Para ATCs marcados como **Candidate**:

- Proceder a **Fase 12: Test Automation**
- Implementar ATCs siguiendo arquitectura KATA
- Cada ATC se vincula con `@atc('PROJECT-XXX')` para trazabilidad

**Conexión IQL:** Esta transición corresponde a los Steps 7-10 del Mid-Game Testing (evaluación, automatización, CI y PR).

---

## Documentación Relacionada

- **Guidelines:** `.context/guidelines/QA/jira-test-management.md`
- **QA Workflow:** `.prompts/us-qa-workflow.md`
- **KATA Guidelines:** `.context/guidelines/TAE/`
- **TMS Integration:** `.context/guidelines/TAE/tms-integration.md`
