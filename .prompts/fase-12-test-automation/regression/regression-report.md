# Regression Report

> **Fase**: 3 de 3 (Execution → Analysis → Report)
> **Propósito**: Generar reporte de calidad para stakeholders con decisión GO/NO-GO.
> **Output**: Reporte de calidad, issues creados, actualizaciones de TMS, recomendaciones.

---

## Carga de Contexto

**Cargar estos archivos de referencia:**

1. Output del análisis de `regression-analysis.md` (Fase 2)
2. `.context/test-management-system.md` → Configuración de sincronización con TMS
3. Contexto del proyecto (versión de release, sprint, target de deploy)

---

## Input Requerido

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PARÁMETROS DEL REPORTE                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Análisis:        [Output de regression-analysis.md] (requerido)             │
│                                                                             │
│ Contexto de Release:                                                        │
│ ─────────────────────────────────────────────────────────────────────────  │
│ Versión:         _________________________________ (ej: v2.3.0)            │
│ Sprint:          _________________________________ (ej: Sprint 15)         │
│ Target Deploy:   ○ Production    ○ Staging    ○ QA                        │
│ Fecha Deploy:    _________________________________ (ej: 2026-02-12)        │
│                                                                             │
│ Opciones:                                                                   │
│ ─────────────────────────────────────────────────────────────────────────  │
│ Crear Issues:    ○ Sí (para regresiones)    ○ No                          │
│ Actualizar TMS:  ○ Sí (si configurado)      ○ No                          │
│ Notificar Team:  ○ Sí (si Slack configurado) ○ No                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Generación del Reporte

### Paso 1: Validar Input de Análisis

Asegurar que el análisis de la Fase 2 contiene:

- [ ] Métricas de ejecución (total, pasados, fallidos, pass rate)
- [ ] Clasificación de fallos (REGRESIÓN, FLAKY, CONOCIDO, AMBIENTE)
- [ ] Resumen de jobs
- [ ] Recomendación preliminar

---

### Paso 2: Calcular Decisión GO/NO-GO

#### Criterios de Decisión

| Criterio           | GO          | PRECAUCIÓN       | NO-GO                  |
| ------------------ | ----------- | ---------------- | ---------------------- |
| Pass Rate          | ≥ 95%       | 90-95%           | < 90%                  |
| Regresiones        | 0           | 1-2 Bajo impacto | Cualquier Alto/Crítico |
| Tests Críticos     | Todos pasan | -                | Cualquier fallo        |
| Tests Flaky        | ≤ 3         | 4-5              | > 5                    |
| Issues de Ambiente | 0           | 1-2              | Persistentes           |

#### Matriz de Puntaje

```
                    CÁLCULO DE PUNTAJE
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Puntaje de Pass Rate:                            │
│   ├─ ≥ 95%  = +3                                   │
│   ├─ 90-95% = +1                                   │
│   └─ < 90%  = -2                                   │
│                                                     │
│   Puntaje de Regresiones:                          │
│   ├─ 0 regresiones       = +3                      │
│   ├─ 1-2 Bajo impacto    = +1                      │
│   ├─ 1+ Medio impacto    = -1                      │
│   └─ Cualquier Alto/Crítico = -3                   │
│                                                     │
│   Puntaje de Tests Críticos:                       │
│   ├─ Todos pasan = +2                              │
│   └─ Cualquier fallo = -3                          │
│                                                     │
│   Puntaje de Flaky:                                │
│   ├─ ≤ 3 flaky = +1                                │
│   ├─ 4-5 flaky = 0                                 │
│   └─ > 5 flaky = -1                                │
│                                                     │
│   TOTAL: ___ / 9                                   │
│                                                     │
│   Decisión:                                         │
│   ├─ Puntaje ≥ 7  → GO                             │
│   ├─ Puntaje 4-6  → PRECAUCIÓN (revisión manual)   │
│   └─ Puntaje < 4  → NO-GO                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### Paso 3: Crear Issues para Regresiones

Si `Crear Issues = Sí` y se encontraron regresiones:

```bash
# Para cada regresión, crear un GitHub issue
gh issue create \
  --title "[REGRESIÓN] {test_name} fallando en {suite}" \
  --body "$(cat <<EOF
## Detalles de Regresión

- **Test ID**: {atc_id}
- **Nombre del Test**: {test_name}
- **Suite**: {suite}
- **Run ID**: {run_id}
- **Ambiente**: {environment}

## Error

\`\`\`
{error_message}
\`\`\`

## Evidencia

- [GitHub Actions Run]({run_url})
- [Allure Report]({allure_url})

## Último Pase

- **Fecha**: {last_pass_date}
- **Run**: #{last_pass_run}

## Impacto

{impact_description}

## Investigación Sugerida

1. Verificar commits recientes que afecten {affected_area}
2. Revisar selectores de elementos/contratos de API
3. Verificar disponibilidad de datos de test

---
_Auto-generado por Pipeline de Regresión_
EOF
)" \
  --label "regression,bug,automated-tests" \
  --assignee "{assignee}"
```

Guardar números de issues creados para el reporte.

---

### Paso 4: Actualizar TMS (Opcional)

Si la sincronización con TMS está configurada en `.context/test-management-system.md`:

#### Para Integración con Xray

```bash
# Actualizar estado de ejecución de tests
# Esto usaría Xray CLI o API - placeholder para implementación real

# Estructura de ejemplo:
# POST /api/v2/import/execution
# {
#   "testExecutionKey": "PROJ-123",
#   "tests": [
#     { "testKey": "AUTH-001", "status": "PASSED" },
#     { "testKey": "AUTH-002", "status": "FAILED", "comment": "..." }
#   ]
# }
```

#### Para MCP de Atlassian (si está disponible)

Usar herramientas `mcp__atlassian__*` para actualizar ejecución de tests en Jira/Xray.

---

### Paso 5: Generar Reporte de Calidad

Crear el reporte final para stakeholders:

---

## Template de Reporte de Calidad

```markdown
# Reporte de Calidad de Regresión

---

## Encabezado

| Atributo                 | Valor                 |
| ------------------------ | --------------------- |
| **Fecha del Reporte**    | {date}                |
| **Ambiente**             | {environment}         |
| **Versión**              | {version}             |
| **Sprint**               | {sprint}              |
| **Run ID**               | [{run_id}]({run_url}) |
| **Disparado Por**        | {actor}               |
| **Reporte Generado Por** | AI Assistant          |

---

## Resumen Ejecutivo

### Veredicto: {verdict_icon} {GO / PRECAUCIÓN / NO-GO}

| Métrica           | Valor        | Umbral | Estado        |
| ----------------- | ------------ | ------ | ------------- |
| Pass Rate         | {pass_rate}% | ≥ 95%  | {status_icon} |
| Regresiones       | {count}      | 0      | {status_icon} |
| Fallos Críticos   | {count}      | 0      | {status_icon} |
| Tests Flaky       | {count}      | ≤ 3    | {status_icon} |
| Duración del Test | {duration}   | ≤ 30m  | {status_icon} |

### Justificación de la Decisión

{detailed_explanation_of_decision}

---

## Resumen de Resultados de Tests

### Por Categoría
```

┌────────────────────────────────────────────────────────────┐
│ RESULTADOS DE TESTS │
├────────────────────────────────────────────────────────────┤
│ │
│ Pasados: ████████████████████████████████████ {n} ✅ │
│ Fallidos: ████ {n} ❌ │
│ Saltados: ██ {n} ⏭️ │
│ Rotos: █ {n} 💔 │
│ │
│ Total: {total} tests | Pass Rate: {rate}% │
│ │
└────────────────────────────────────────────────────────────┘

```

### Por Tipo de Test

| Tipo | Total | Pasados | Fallidos | Pass Rate |
|------|-------|---------|----------|-----------|
| Integration (API) | {n} | {n} | {n} | {rate}% |
| E2E (Browser) | {n} | {n} | {n} | {rate}% |

### Por Suite

| Suite | Total | Pasados | Fallidos | Estado |
|-------|-------|---------|----------|--------|
| Auth | {n} | {n} | {n} | {status} |
| Booking | {n} | {n} | {n} | {status} |
| ... | | | | |

---

## Bloqueadores de Release

{si NO-GO o PRECAUCIÓN, listar bloqueadores}

### Issues Críticos

| # | Test | Impacto | Issue | Owner |
|---|------|---------|-------|-------|
| 1 | {test_name} | {ALTO/CRÍTICO} | [{PROJ-XXX}]({url}) | {owner} |
| 2 | {test_name} | {impact} | [{PROJ-XXX}]({url}) | {owner} |

### Acciones Requeridas Antes del Release

1. **{action_1}** - {owner} - ETA: {date}
2. **{action_2}** - {owner} - ETA: {date}

---

## Detalles de Fallos

### Regresiones ({count})

{para cada regresión}

#### {regression_number}. {test_name}

| Atributo | Valor |
|----------|-------|
| Test ID | {atc_id} |
| Suite | {suite} |
| Último Pase | {date} (Run #{run}) |
| Impacto | {severity} |
| Issue | [{PROJ-XXX}]({url}) |

**Error:**
```

{error_message}

```

**Causa Probable:** {analysis_of_error}

**Screenshot:** [Ver Evidencia]({screenshot_url})

---

### Issues Conocidos ({count})

| Test | Test ID | Ticket | Estado | Fix Esperado |
|------|---------|--------|--------|--------------|
| {name} | {id} | [{PROJ-XXX}]({url}) | {status} | {date} |

---

### Tests Flaky ({count})

| Test | Test ID | Tasa de Fallo | Acción |
|------|---------|---------------|--------|
| {name} | {id} | {rate}% | {stabilization_ticket} |

**Recomendación:** Programar estabilización en siguiente sprint.

---

### Issues de Ambiente ({count})

| Test | Error | Resolución |
|------|-------|------------|
| {name} | {error_type} | {action_taken} |

---

## Análisis de Tendencia

### Tendencia de Pass Rate (Últimos 5 Runs)

```

100% │
95% │──────────────────────────── Objetivo
90% │ ●───● ●
85% │ ╲ ╱
80% │ ●───●
└────────────────────────────
Run Run Run Run Actual
-4 -3 -2 -1

```

| Run | Fecha | Pass Rate | Delta |
|-----|-------|-----------|-------|
| Actual | {date} | {rate}% | - |
| Anterior | {date} | {rate}% | {delta}% |
| ... | | | |

---

## Recomendaciones

### Inmediatas (Pre-Release)

1. {recommendation_1}
2. {recommendation_2}

### Corto Plazo (Este Sprint)

1. {recommendation_1}
2. {recommendation_2}

### Largo Plazo (Deuda Técnica)

1. {recommendation_1}
2. {recommendation_2}

---

## Notas de Cobertura de Tests

### Áreas Bien Cubiertas

- {area_1}: {coverage_note}
- {area_2}: {coverage_note}

### Gaps de Cobertura Identificados

- {gap_1}: {recommendation}
- {gap_2}: {recommendation}

---

## Links y Recursos

| Recurso | URL |
|---------|-----|
| GitHub Actions Run | [{run_id}]({run_url}) |
| Allure Report | [Ver Reporte]({allure_url}) |
| Playwright Report | [Ver Reporte]({playwright_url}) |
| Issues Creados | [Ver Issues]({issues_url}) |
| Ejecución TMS | [{execution_key}]({tms_url}) |

---

## Apéndice

### A. Todos los Tests Fallidos

<details>
<summary>Click para expandir lista completa de fallos</summary>

| # | Nombre del Test | Test ID | Categoría | Error |
|---|-----------------|---------|-----------|-------|
| 1 | {name} | {id} | {category} | {error} |
| 2 | {name} | {id} | {category} | {error} |
| ... | | | | |

</details>

### B. Configuración del Run

| Configuración | Valor |
|---------------|-------|
| Workflow | {workflow_name} |
| Ambiente | {environment} |
| Browser | Chromium (headless) |
| Workers Paralelos | {workers} |
| Grabación de Video | {enabled/disabled} |

### C. Ambiente de Test

| Componente | Versión/Detalles |
|------------|------------------|
| Node.js | {version} |
| Bun | {version} |
| Playwright | {version} |
| OS | Ubuntu Latest |

---

**Reporte Generado:** {timestamp}
**Siguiente Run Programado:** {next_run_time}

---

_Este reporte fue generado automáticamente por el Pipeline de Regresión._
_Para preguntas, contactar al equipo de QA o revisar la [Documentación de Regresión]({docs_url})._
```

---

## Acciones del Reporte

### Guardar Reporte

```bash
# Escribir reporte a archivo
# El reporte se guardará en: .context/reports/regression-{date}.md
```

### Notificar al Equipo (Opcional)

Si la integración con Slack está configurada:

```bash
# Publicar resumen en Slack (placeholder - implementación real depende del setup)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Regression Report: {verdict}"}' \
#   $SLACK_WEBHOOK_URL
```

---

## Acciones Post-Reporte

### Si Decisión GO

1. Marcar release candidate como aprobado
2. Proceder con deployment
3. Programar smoke test post-deployment

### Si Decisión PRECAUCIÓN

1. Revisar con team lead
2. Evaluar riesgo de issues conocidos
3. Documentar riesgos aceptados
4. Proceder con precaución o diferir

### Si Decisión NO-GO

1. Bloquear release
2. Asignar issues de regresión a desarrolladores
3. Programar verificación de fixes
4. Re-ejecutar regresión después de fixes

---

## Loop de Feedback

### Actualizar Stage 1 (Shift-Left)

Basándose en hallazgos de regresión, sugerir:

- Nuevos casos de test para áreas poco testeadas
- Actualizaciones de ATP para escenarios no cubiertos

### Actualizar Stage 4 (Automation)

Basándose en tests flaky, programar:

- Trabajo de estabilización de tests
- Mejoras de locators
- Actualizaciones de estrategias de espera

---

## Checklist del Reporte

Antes de finalizar:

- [ ] Todas las métricas calculadas correctamente
- [ ] Regresiones categorizadas apropiadamente
- [ ] Issues creados para bloqueadores
- [ ] Justificación de decisión es clara
- [ ] Links son válidos
- [ ] Reporte es amigable para stakeholders
- [ ] Recomendaciones son accionables

---

## Ubicación del Output

Guardar el reporte en:

```
.context/reports/
└── regression-{env}-{date}.md

Ejemplo:
.context/reports/regression-staging-2026-02-11.md
```

---

**Generación de Reporte Completa** - Compartir con stakeholders y proceder según decisión.
