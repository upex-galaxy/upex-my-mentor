# Regression Execution

> **Fase**: 1 de 3 (Execution → Analysis → Report)
> **Propósito**: Ejecutar suites de tests automatizados via GitHub Actions y monitorear hasta completar.
> **Output**: Run ID, estado de ejecución y resumen listo para análisis.

---

## Carga de Contexto

**Cargar estos archivos de referencia:**

1. `.github/workflows/regression.yml` → Estructura del workflow de regresión completa
2. `.github/workflows/smoke.yml` → Workflow de smoke tests
3. `.github/workflows/sanity.yml` → Workflow de sanity tests
4. `.context/test-management-system.md` → Configuración de TMS (si se sincroniza)

---

## Input Requerido

Especificar qué tipo de regresión ejecutar:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PARÁMETROS DE EJECUCIÓN                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Tipo de Suite:   ○ regression (completo)  ○ smoke (crítico)  ○ sanity      │
│                                                                             │
│ Ambiente:        ○ staging (default)      ○ local                          │
│                                                                             │
│ Generar Allure:  ○ sí (default)           ○ no                             │
│                                                                             │
│ [Solo para sanity]                                                          │
│ ─────────────────────────────────────────────────────────────────────────  │
│ Tipo de Test:    ○ all    ○ e2e    ○ integration                           │
│ Patrón Grep:     _________________________________ (ej: @auth, login)      │
│ Archivo Test:    _________________________________ (ej: qa/tests/e2e/...)  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Ejemplos de Selección Rápida

| Escenario | Suite | Parámetros |
|-----------|-------|------------|
| Regresión completa antes de release | `regression` | `environment=staging` |
| Health check diario | `smoke` | `environment=staging` |
| Validar feature específico | `sanity` | `grep="@booking"`, `test_type=e2e` |
| Ejecutar archivo de test único | `sanity` | `test_file="qa/tests/e2e/auth/login.test.ts"` |
| Solo tests de API | `sanity` | `test_type=integration` |

---

## Flujo de Ejecución

### Paso 1: Validar Prerrequisitos

Antes de disparar, verificar:

```bash
# Verificar que gh CLI está autenticado
gh auth status

# Verificar acceso al repositorio
gh repo view --json name,owner

# Listar workflows disponibles
gh workflow list
```

Output esperado:
```
NAME              STATE   ID
Regression Tests  active  12345678
Smoke Tests       active  12345679
Sanity Tests      active  12345680
```

---

### Paso 2: Disparar Workflow

Ejecutar el workflow apropiado según el input:

#### Para Regresión Completa

```bash
gh workflow run regression.yml \
  -f environment=staging \
  -f video_record=false \
  -f generate_allure=true
```

#### Para Smoke Tests

```bash
gh workflow run smoke.yml \
  -f environment=staging \
  -f generate_allure=true
```

#### Para Sanity Tests

```bash
# Con patrón grep
gh workflow run sanity.yml \
  -f environment=staging \
  -f test_type=e2e \
  -f grep="@auth" \
  -f generate_allure=true

# Con archivo específico
gh workflow run sanity.yml \
  -f environment=staging \
  -f test_file="qa/tests/e2e/auth/login.test.ts" \
  -f generate_allure=true

# Solo tests de integración
gh workflow run sanity.yml \
  -f environment=staging \
  -f test_type=integration \
  -f generate_allure=true
```

---

### Paso 3: Capturar Run ID

Inmediatamente después de disparar, obtener el run ID:

```bash
# Esperar unos segundos para que aparezca el run
sleep 5

# Obtener el run ID más reciente
gh run list --workflow={workflow}.yml --limit=1 --json databaseId,status,createdAt
```

Output esperado:
```json
[
  {
    "databaseId": 12345678901,
    "status": "in_progress",
    "createdAt": "2026-02-11T14:30:00Z"
  }
]
```

Extraer y guardar el `databaseId` como `RUN_ID` para los pasos siguientes.

---

### Paso 4: Monitorear Ejecución

#### Opción A: Watch en Tiempo Real

```bash
gh run watch <RUN_ID>
```

Esto bloquea hasta que el run complete, mostrando progreso en vivo.

#### Opción B: Polling de Estado (No Bloqueante)

```bash
# Verificar estado
gh run view <RUN_ID> --json status,conclusion

# Esperado durante ejecución:
# {"status":"in_progress","conclusion":null}

# Esperado después de completar:
# {"status":"completed","conclusion":"success"}
# {"status":"completed","conclusion":"failure"}
```

#### Opción C: Obtener Estado Detallado de Jobs

```bash
gh run view <RUN_ID> --json jobs --jq '.jobs[] | {name, status, conclusion}'
```

Output esperado:
```json
{"name":"Integration Tests","status":"completed","conclusion":"success"}
{"name":"E2E Tests","status":"in_progress","conclusion":null}
{"name":"Build & Deploy Allure Report","status":"queued","conclusion":null}
```

---

### Paso 5: Capturar Estado Final

Una vez completado, obtener resumen completo de ejecución:

```bash
gh run view <RUN_ID> --json status,conclusion,jobs,createdAt,updatedAt,url
```

Parsear la respuesta para extraer:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `status` | Estado del run | `completed` |
| `conclusion` | Resultado final | `success` \| `failure` |
| `url` | URL de GitHub Actions | `https://github.com/.../runs/...` |
| `createdAt` | Hora de inicio | `2026-02-11T14:30:00Z` |
| `updatedAt` | Hora de fin | `2026-02-11T14:45:32Z` |
| `jobs` | Array de resultados de jobs | Ver abajo |

---

## Template de Output

Generar el siguiente resumen de ejecución:

```markdown
## Resumen de Ejecución

| Atributo | Valor |
|----------|-------|
| **Workflow** | {workflow_name} |
| **Run ID** | {run_id} |
| **Ambiente** | {environment} |
| **Estado** | ✅ Completado / ❌ Fallido / 🔄 En Progreso |
| **Conclusión** | success / failure / cancelled |
| **Duración** | {calculated_duration} |
| **Disparado Por** | {actor} |
| **Timestamp** | {createdAt} |
| **URL** | [{run_id}]({url}) |

### Estado de Jobs

| Job | Estado | Conclusión | Duración |
|-----|--------|------------|----------|
| Integration Tests | completed | ✅ success | 5m 12s |
| E2E Tests | completed | ❌ failure | 8m 45s |
| Build & Deploy Allure Report | completed | ✅ success | 1m 35s |

### Artefactos Generados

| Artefacto | Disponible |
|-----------|------------|
| integration-allure-results | ✅ |
| e2e-allure-results | ✅ |
| merged-allure-results-staging | ✅ |
| e2e-playwright-report | ✅ |
| e2e-failure-evidence | ✅ |

### URL del Allure Report

https://{owner}.github.io/{repo}/{environment}/{suite}/

---

## Siguientes Pasos

→ **Si Estado = SUCCESS**: Proceder a `regression-analysis.md` para revisión de métricas
→ **Si Estado = FAILURE**: Proceder a `regression-analysis.md` para investigación de fallos
→ **Run ID para Análisis**: {run_id}
```

---

## Manejo de Errores

### Workflow No Se Encuentra

```bash
# Error: could not find workflow 'regression.yml'
# Solución: Listar workflows disponibles
gh workflow list

# Verificar si el workflow está habilitado
gh workflow view regression.yml
```

### Problemas de Autenticación

```bash
# Error: HTTP 401
# Solución: Re-autenticar
gh auth login
```

### Run No Inicia

```bash
# Verificar que los inputs son válidos
gh workflow view regression.yml --yaml | grep -A 20 "inputs:"

# Verificar secrets requeridos
# (Esto requiere acceso admin o ver el archivo de workflow)
```

### Timeout Durante Monitoreo

```bash
# Si gh run watch hace timeout, verificar estado manualmente
gh run view <RUN_ID> --json status,conclusion

# Re-ejecutar si es necesario
gh run rerun <RUN_ID>
```

---

## Decisiones de Ejecución

### ¿Cuál Suite Elegir?

| Situación | Suite Recomendada |
|-----------|-------------------|
| Validación pre-release | `regression` (completo) |
| Verificación post-deployment | `smoke` (solo críticos) |
| Validar feature específico | `sanity` con grep |
| Debuggear test fallido | `sanity` con test_file |
| Health check nocturno | `smoke` o `regression` (programado) |

### Cuándo Usar Grabación de Video

Habilitar `video_record=true` cuando:
- Debuggeando tests flaky
- Investigando issues visuales
- Se necesita evidencia para bug reports

Nota: La grabación de video aumenta el tiempo de ejecución y el tamaño de artefactos.

---

## Ejecución Programada vs Manual

| Tipo | Trigger | Caso de Uso |
|------|---------|-------------|
| **Programada** | Cron (diario) | Regresión nocturna, monitoreo continuo |
| **Manual** | `workflow_dispatch` | Pre-release, testing ad-hoc |

Verificar runs programados:
```bash
gh run list --workflow=regression.yml --event=schedule --limit=5
```

---

## Comandos de Referencia Rápida

```bash
# Disparar regresión completa
gh workflow run regression.yml -f environment=staging

# Obtener último run ID
gh run list --workflow=regression.yml --limit=1 --json databaseId -q '.[0].databaseId'

# Watch de ejecución
gh run watch $(gh run list --workflow=regression.yml --limit=1 --json databaseId -q '.[0].databaseId')

# Verificar si completó
gh run view <RUN_ID> --json conclusion -q '.conclusion'

# Obtener URL de GitHub Actions
gh run view <RUN_ID> --json url -q '.url'
```

---

## Siguiente Paso

Una vez que complete la ejecución:

→ **Proceder a**: `regression-analysis.md` (Fase 2)
→ **Con**: Run ID de esta ejecución
