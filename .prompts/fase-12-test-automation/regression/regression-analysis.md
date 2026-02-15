# Regression Analysis

> **Fase**: 2 de 3 (Execution → Analysis → Report)
> **Propósito**: Analizar resultados de tests, clasificar fallos y calcular métricas de calidad.
> **Output**: Clasificación de fallos, métricas y recomendación preliminar GO/NO-GO.

---

## Carga de Contexto

**Cargar estos archivos de referencia:**

1. `.context/guidelines/TAE/kata-ai-index.md` → Entender estructura de ATCs
2. `.context/test-management-system.md` → Para issues conocidos y links de TMS
3. Artefactos del run (descargados en esta fase)

---

## Input Requerido

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PARÁMETROS DE ANÁLISIS                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Run ID:          _________________________________ (requerido)              │
│                                                                             │
│ Allure URL:      _________________________________ (opcional, auto-detectar)│
│                                                                             │
│ Issues Conocidos:_________________________________ (tickets separados por ,)│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Análisis

### Paso 1: Obtener Información del Run

Recuperar datos completos del run:

```bash
# Obtener detalles completos del run
gh run view <RUN_ID> --json \
  status,conclusion,jobs,createdAt,updatedAt,url,headBranch,event,actor

# Obtener detalles a nivel de job con pasos
gh run view <RUN_ID> --json jobs --jq '.jobs[] | {name, conclusion, steps: [.steps[] | {name, conclusion}]}'
```

Estructura esperada:

```json
{
  "status": "completed",
  "conclusion": "failure",
  "jobs": [
    {
      "name": "Integration Tests",
      "conclusion": "success",
      "steps": [...]
    },
    {
      "name": "E2E Tests",
      "conclusion": "failure",
      "steps": [...]
    }
  ]
}
```

---

### Paso 2: Analizar Jobs Fallidos

Para cada job fallido, obtener logs detallados:

```bash
# Obtener solo logs de fallos (output enfocado)
gh run view <RUN_ID> --log-failed

# O obtener logs para job específico
gh run view <RUN_ID> --job=<JOB_ID> --log
```

Parsear logs buscando:

| Patrón          | Significado                           |
| --------------- | ------------------------------------- |
| `Error:`        | Fallo de assertion de test            |
| `Timeout`       | Espera de elemento/respuesta excedida |
| `locator.click` | Fallo de interacción con elemento     |
| `expect(...)`   | Fallo de assertion                    |
| `status code`   | Mismatch de respuesta de API          |
| `ECONNREFUSED`  | Issue de ambiente/red                 |

---

### Paso 3: Descargar Artefactos

Descargar resultados de tests para análisis detallado:

```bash
# Listar artefactos disponibles
gh run view <RUN_ID> --json artifacts --jq '.artifacts[].name'

# Descargar resultados de Allure combinados
gh run download <RUN_ID> -n merged-allure-results-staging -D ./analysis/

# Descargar evidencia de fallos (screenshots, traces)
gh run download <RUN_ID> -n e2e-failure-evidence -D ./analysis/evidence/

# Descargar reporte de Playwright
gh run download <RUN_ID> -n e2e-playwright-report -D ./analysis/playwright/
```

---

### Paso 4: Parsear Resultados de Tests

#### Desde Resultados de Allure

Leer los archivos JSON de resultados de Allure:

```bash
# Listar archivos de resultados
ls ./analysis/merged-allure-results-staging/*.json
```

Parsear cada archivo de resultado para extraer:

```json
{
  "uuid": "abc123",
  "name": "should login successfully",
  "status": "failed",
  "statusDetails": {
    "message": "Element [data-testid='login-btn'] not found",
    "trace": "..."
  },
  "labels": [
    { "name": "suite", "value": "Auth Tests" },
    { "name": "testId", "value": "AUTH-001" }
  ],
  "start": 1707654321000,
  "stop": 1707654325000
}
```

#### Desde Reporte de Playwright

Si Allure no está disponible, parsear JSON de Playwright:

```bash
cat ./analysis/playwright/report.json
```

---

### Paso 5: Calcular Métricas

#### Métricas Core

| Métrica           | Cálculo                                |
| ----------------- | -------------------------------------- |
| **Tests Totales** | Cuenta de todos los resultados         |
| **Pasados**       | Cuenta donde `status = passed`         |
| **Fallidos**      | Cuenta donde `status = failed`         |
| **Saltados**      | Cuenta donde `status = skipped`        |
| **Rotos**         | Cuenta donde `status = broken`         |
| **Pass Rate**     | `(Pasados / Total) * 100`              |
| **Duración**      | `max(stop) - min(start)` de resultados |

#### Métricas de Tendencia (si hay datos históricos disponibles)

| Métrica                | Cálculo                                |
| ---------------------- | -------------------------------------- |
| **Pass Rate Anterior** | Del último run                         |
| **Delta**              | Actual - Anterior                      |
| **Tendencia**          | ↑ Mejorando / ↓ Degradando / → Estable |

---

### Paso 6: Clasificar Fallos

Aplicar lógica de clasificación a cada test fallido:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LÓGICA DE CLASIFICACIÓN DE FALLOS                       │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │   Test Fallido   │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │ ¿Está en Issues Conocidos?│
                    └─────────────┬─────────────┘
                           │             │
                          SÍ            NO
                           │             │
                           ▼             ▼
                    ┌──────────┐   ┌──────────────────┐
                    │ ISSUE    │   │ ¿Pasó en los     │
                    │ CONOCIDO │   │ últimos 5 runs?  │
                    └──────────┘   └────────┬─────────┘
                                       │         │
                                      SÍ        NO
                                       │         │
                                       ▼         ▼
                              ┌───────────┐  ┌──────────────┐
                              │ REGRESIÓN │  │ ¿Es error    │
                              │ (nuevo)   │  │ de ambiente? │
                              └───────────┘  └──────┬───────┘
                                                │         │
                                               SÍ        NO
                                                │         │
                                                ▼         ▼
                                       ┌────────────┐  ┌─────────────┐
                                       │ ISSUE DE   │  │ Verificar   │
                                       │ AMBIENTE   │  │ historial   │
                                       └────────────┘  └──────┬──────┘
                                                          │         │
                                                       > 20%     ≤ 20%
                                                          │         │
                                                          ▼         ▼
                                                    ┌─────────┐  ┌──────────┐
                                                    │ FLAKY   │  │ TEST     │
                                                    │ TEST    │  │ NUEVO    │
                                                    └─────────┘  └──────────┘
```

#### Criterios de Clasificación

| Categoría          | Criterio                                                        | Impacto | Acción                         |
| ------------------ | --------------------------------------------------------------- | ------- | ------------------------------ |
| **REGRESIÓN**      | Test pasaba antes, ahora falla consistentemente                 | ALTO    | Bloquear release, crear issue  |
| **FLAKY**          | Falla intermitentemente (>20% rate de fallo en últimos 10 runs) | MEDIO   | Marcar para estabilización     |
| **ISSUE CONOCIDO** | Vinculado a ticket existente en backlog                         | BAJO    | Documentar, no bloquear        |
| **AMBIENTE**       | Timeout, red, o error de infraestructura                        | MEDIO   | Re-ejecutar o investigar infra |
| **TEST NUEVO**     | Primera ejecución, sin historial                                | BAJO    | Verificación manual necesaria  |

#### Indicadores de Issue de Ambiente

El error contiene cualquiera de:

- `ECONNREFUSED`
- `ETIMEDOUT`
- `net::ERR_`
- `Navigation timeout`
- `browserType.launch`
- `context deadline exceeded`
- `502 Bad Gateway`
- `503 Service Unavailable`

---

### Paso 7: Extraer Detalles de Tests

Para cada test fallido, recopilar:

| Campo                | Fuente                    | Ejemplo                     |
| -------------------- | ------------------------- | --------------------------- |
| **Nombre del Test**  | campo `name`              | `should login successfully` |
| **Test ID**          | `labels[testId]` o `@atc` | `AUTH-001`                  |
| **Suite**            | `labels[suite]`           | `Auth Tests`                |
| **Mensaje de Error** | `statusDetails.message`   | `Element not found`         |
| **Duración**         | `stop - start`            | `4.2s`                      |
| **Screenshot**       | Artefacto de evidencia    | `login-failure.png`         |

---

## Template de Output

Generar el siguiente reporte de análisis:

```markdown
# Reporte de Análisis

**Run ID**: {run_id}
**Analizado**: {timestamp}
**Workflow**: {workflow_name}
**Ambiente**: {environment}

---

## Métricas de Ejecución

| Métrica       | Valor        |
| ------------- | ------------ |
| Tests Totales | {total}      |
| Pasados       | {passed}     |
| Fallidos      | {failed}     |
| Saltados      | {skipped}    |
| Rotos         | {broken}     |
| **Pass Rate** | {pass_rate}% |
| Duración      | {duration}   |

### Tendencia (vs Run Anterior)

| Métrica   | Anterior      | Actual        | Delta                 |
| --------- | ------------- | ------------- | --------------------- |
| Pass Rate | {prev}%       | {curr}%       | {delta}% {trend_icon} |
| Fallidos  | {prev_failed} | {curr_failed} | {diff}                |

---

## Clasificación de Tests Fallidos

### REGRESIONES ({count}) - Bloqueadores de Release

| Nombre del Test | Test ID  | Error           | Último Pase      |
| --------------- | -------- | --------------- | ---------------- |
| {name}          | {atc_id} | {error_summary} | {last_pass_date} |

<details>
<summary>Detalles de Regresiones</summary>

#### {test_name}

- **Test ID**: {atc_id}
- **Suite**: {suite}
- **Error**:
```

{full_error_message}

```
- **Último Pase**: {date} (Run #{run_number})
- **Screenshot**: [Ver]({screenshot_path})

</details>

---

### TESTS FLAKY ({count}) - Necesitan Estabilización

| Nombre del Test | Test ID | Tasa de Fallo | Últimos 10 Runs |
|-----------------|---------|---------------|-----------------|
| {name} | {atc_id} | {rate}% | ✓✓✗✓✗✓✓✓✗✓ |

---

### ISSUES CONOCIDOS ({count}) - Fallos Esperados

| Nombre del Test | Test ID | Ticket | Estado |
|-----------------|---------|--------|--------|
| {name} | {atc_id} | {PROJ-XXX} | {ticket_status} |

---

### ISSUES DE AMBIENTE ({count}) - Problemas de Infraestructura

| Nombre del Test | Test ID | Tipo de Error |
|-----------------|---------|---------------|
| {name} | {atc_id} | {Timeout/Network/etc} |

**Recomendación**: Re-ejecutar después de verificar infraestructura

---

### FALLOS DE TESTS NUEVOS ({count}) - Necesitan Investigación

| Nombre del Test | Test ID | Error |
|-----------------|---------|-------|
| {name} | {atc_id} | {error_summary} |

---

## Resumen de Jobs

| Job | Resultado | Duración | Tests Fallidos |
|-----|-----------|----------|----------------|
| Integration Tests | ✅ success | 5m 12s | 0 |
| E2E Tests | ❌ failure | 8m 45s | 6 |

---

## Recomendación Preliminar

### Matriz de Decisión

| Factor | Estado | Peso | Puntaje |
|--------|--------|------|---------|
| Pass Rate ≥ 95% | {status} | 2 | {score} |
| Sin Regresiones | {status} | 3 | {score} |
| Sin Fallos Críticos | {status} | 3 | {score} |
| Flaky Tests ≤ 3 | {status} | 1 | {score} |
| **Total** | | | **{total}/9** |

### Veredicto

{verdict_icon} **{GO / PRECAUCIÓN / NO-GO}**

**Razón**: {explanation}

### Issues Bloqueadores

1. {issue_1}
2. {issue_2}

### Issues No Bloqueadores

1. {issue_1}
2. {issue_2}

---

## Artefactos Analizados

| Artefacto | Ruta | Estado |
|-----------|------|--------|
| Resultados Allure | ./analysis/merged-allure-results-staging/ | ✅ Analizado |
| Evidencia de Fallos | ./analysis/evidence/ | ✅ {count} archivos |
| Reporte Playwright | ./analysis/playwright/ | ✅ Disponible |

---

## Links

- [GitHub Actions Run]({run_url})
- [Allure Report]({allure_url})
- [Screenshots de Fallos]({evidence_path})

---

## Siguiente Paso

→ **Proceder a**: `regression-report.md` (Fase 3)
→ **Con**: Este análisis para generación de reporte para stakeholders
```

---

## Helpers de Análisis

### Obtener Historial de Tests (si está disponible)

```bash
# Listar runs recientes del mismo workflow
gh run list --workflow=regression.yml --limit=10 --json databaseId,conclusion,createdAt
```

### Comparar con Run Anterior

```bash
# Obtener ID del run anterior
PREV_RUN=$(gh run list --workflow=regression.yml --limit=2 --json databaseId -q '.[1].databaseId')

# Descargar resultados anteriores para comparación
gh run download $PREV_RUN -n merged-allure-results-staging -D ./analysis/previous/
```

### Buscar Issues Conocidos

```bash
# Si se usan GitHub Issues
gh issue list --label "test-failure" --json number,title,state

# Cross-reference con test ID
gh issue list --search "AUTH-001 in:title"
```

---

## Referencia Rápida de Clasificación

| Patrón de Error                     | Clasificación Probable       |
| ----------------------------------- | ---------------------------- |
| `Element not found`                 | REGRESIÓN (cambio de UI)     |
| `Timeout waiting for selector`      | REGRESIÓN o FLAKY            |
| `expect(...).toBe(...)`             | REGRESIÓN (cambio de lógica) |
| `status code 500`                   | AMBIENTE o REGRESIÓN         |
| `ECONNREFUSED`                      | AMBIENTE                     |
| `Navigation timeout`                | AMBIENTE o FLAKY             |
| `Test pasaba antes` + `ahora falla` | REGRESIÓN                    |
| `Intermitente en historial`         | FLAKY                        |

---

## Evaluación de Severidad

| Severidad   | Criterio                          | Ejemplos                            |
| ----------- | --------------------------------- | ----------------------------------- |
| **CRÍTICA** | Journey de usuario core bloqueado | Login, Checkout, Pago               |
| **ALTA**    | Feature mayor rota                | Búsqueda, Perfil, Dashboard         |
| **MEDIA**   | Feature menor afectada            | Filtros, Ordenamiento, Preferencias |
| **BAJA**    | Fallo de edge case                | Escenarios raros, Features de Admin |

Mapear severidad basándose en:

1. Tags del test (`@critical`, `@smoke`)
2. Nombre de suite (Auth, Booking, etc.)
3. Impacto de negocio documentado en TMS

---

## Siguiente Paso

Una vez que el análisis esté completo:

→ **Proceder a**: `regression-report.md` (Fase 3)
→ **Con**: Este documento de análisis para generación de reporte para stakeholders
