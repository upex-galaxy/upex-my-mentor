# Regression Testing

> **Propósito**: Ejecutar suites de tests automatizados, analizar resultados y generar reportes de calidad para tomar decisiones GO/NO-GO.
> **Iteración**: Por release, sprint, o bajo demanda (validación post-deploy).

---

## Overview

Esta subfase cierra el ciclo de testing ejecutando tests automatizados y analizando resultados. Mientras las otras subfases (E2E, Integration) se enfocan en crear y automatizar tests, **Regression** se enfoca en **ejecutarlos sistemáticamente** y **tomar decisiones basadas en resultados**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CICLO DE TESTING                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  Fase 10         Fase 11          Fase 12
  ───────         ───────          ───────────────────────────────────────────
  Exploratory →   Documentation →  Automation (E2E/Integration/Regression)
      │                │                                │
      ▼                ▼                                ▼
  Tests manuales   ATCs en TMS                    Código + Ejecución + Reportes
                                                        │
                  ◄─────────────── Feedback Loop ───────┘
```

---

## Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REGRESSION WORKFLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                       ┌─────────────────────┐
                       │      TRIGGER        │
                       │  ─────────────────  │
                       │  • Request manual   │
                       │  • Schedule diario  │
                       │  • Post-deploy      │
                       └──────────┬──────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. EJECUCIÓN (regression-execution.md)                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Seleccionar tipo: regression | smoke | sanity                            │
│  • Disparar workflow via `gh workflow run`                                  │
│  • Monitorear hasta completar                                               │
│  • Output: Run ID, status, duración                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. ANÁLISIS (regression-analysis.md)                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Descargar y parsear resultados                                           │
│  • Clasificar fallos: REGRESSION | FLAKY | KNOWN | ENVIRONMENT              │
│  • Calcular métricas: pass rate, duración, tendencias                       │
│  • Output: Clasificación de fallos, métricas, recomendación preliminar      │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. REPORTE (regression-report.md)                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Generar reporte de calidad con decisión GO/NO-GO                         │
│  • Crear issues para regresiones (opcional)                                 │
│  • Actualizar estado en TMS (opcional)                                      │
│  • Output: Reporte de calidad, issues creados, recomendaciones              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prompts Disponibles

| Fase | Prompt                    | Propósito                                      |
| ---- | ------------------------- | ---------------------------------------------- |
| 1    | `regression-execution.md` | Ejecutar suite y monitorear hasta completar    |
| 2    | `regression-analysis.md`  | Analizar resultados y clasificar fallos        |
| 3    | `regression-report.md`    | Generar reporte de calidad y decisión GO/NO-GO |

### Cuándo Usar Cada Uno

| Escenario                            | Prompt(s) a Usar                              |
| ------------------------------------ | --------------------------------------------- |
| Regression completo antes de release | Los tres en secuencia                         |
| Health check rápido                  | `regression-execution.md` (smoke) solamente   |
| Investigar fallos                    | `regression-analysis.md` con Run ID existente |
| Generar reporte para stakeholders    | `regression-report.md` con análisis           |

---

## Workflows Disponibles

| Workflow       | Archivo          | Schedule         | Propósito                          |
| -------------- | ---------------- | ---------------- | ---------------------------------- |
| **Regression** | `regression.yml` | Diario 00:00 UTC | Suite completa: Integration → E2E  |
| **Smoke**      | `smoke.yml`      | Diario 02:00 UTC | Solo tests críticos (@critical)    |
| **Sanity**     | `sanity.yml`     | Solo manual      | Tests específicos por grep/archivo |

---

## Referencia Rápida `gh` CLI

### Ejecutar Workflows

```bash
# Regression completo
gh workflow run regression.yml -f environment=staging -f generate_allure=true

# Smoke tests
gh workflow run smoke.yml -f environment=staging

# Sanity con patrón grep
gh workflow run sanity.yml -f environment=staging -f grep="@auth" -f test_type=e2e
```

### Monitorear Ejecución

```bash
# Listar runs recientes
gh run list --workflow=regression.yml --limit=5

# Ver run en tiempo real
gh run watch <run-id>

# Ver status del run
gh run view <run-id>
```

### Analizar Resultados

```bash
# Ver solo logs de fallos
gh run view <run-id> --log-failed

# Descargar artefactos
gh run download <run-id> -n merged-allure-results-staging
```

---

## Framework de Decisión

### Criterios GO/NO-GO

| Métrica         | GO    | PRECAUCIÓN         | NO-GO                  |
| --------------- | ----- | ------------------ | ---------------------- |
| Pass Rate       | ≥ 95% | 90-95%             | < 90%                  |
| Regresiones     | 0     | 1-2 (bajo impacto) | Cualquier alto impacto |
| Fallos Críticos | 0     | 0                  | Cualquiera             |
| Tests Flaky     | ≤ 3   | 4-5                | > 5                    |

### Clasificación de Fallos

| Categoría       | Criterio                          | Acción                   |
| --------------- | --------------------------------- | ------------------------ |
| **REGRESSION**  | Test pasaba antes, ahora falla    | Crear issue, bloquear GO |
| **FLAKY**       | Historial de fallos intermitentes | Marcar para revisión     |
| **KNOWN ISSUE** | Vinculado a ticket existente      | Documentar, no bloquear  |
| **ENVIRONMENT** | Issue de infraestructura/timeout  | Re-ejecutar o saltar     |
| **NEW TEST**    | Sin historial previo              | Verificación manual      |

---

## Integración con Otras Fases

### Feedback a Fase 10 (Exploratory)

- Identificar áreas poco testeadas por patrones de fallos
- Sugerir nuevos casos de test basados en regresiones

### Feedback a E2E/Integration

- Reportar tests flaky para estabilización
- Identificar tests que necesitan mantenimiento

### Sync con TMS (Fase 11)

- Actualizar estado de ejecución de tests
- Vincular fallos a casos de test

---

**Regression completa el ciclo**: Tests automatizados se ejecutan, analizan y reportan para decisiones informadas de release.
