# Sprint Report

> **Propósito**: Generar un reporte visual del estado actual del Sprint y Backlog usando Jira.
> **Herramienta**: MCP Atlassian (`mcp__atlassian__*`)
> **Output**: Reporte markdown con issues agrupados por status y tipo.

---

## Prerequisitos

- MCP de Atlassian configurado y conectado
- Acceso al proyecto en Jira
- Conocer el código del proyecto (ej: `SQ`, `PROJ`, `APP`)

---

## Input Requerido

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PARÁMETROS DEL REPORTE                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Proyecto:        _________________________________ (ej: SQ, PROJ)           │
│                                                                             │
│ Tipo de Reporte: ○ Sprint Activo   ○ Backlog Completo   ○ Ambos            │
│                                                                             │
│ Filtros Opcionales:                                                         │
│ ─────────────────────────────────────────────────────────────────────────  │
│ Sprint:          _________________________________ (ej: "Sprint 5")         │
│ Assignee:        _________________________________ (ej: "Juan Perez")       │
│ Epic:            _________________________________ (ej: "PROJ-100")         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Workflow

### Paso 0: Descubrir Tipos de Issues del Proyecto (Dinámico)

**IMPORTANTE**: Antes de hacer las consultas principales, descubrir qué tipos de issues existen en el proyecto:

```
mcp__atlassian__search_issues(
  jql: "project = {PROJECT} ORDER BY created DESC",
  limit: 1,
  fields: "issuetype"
)
```

Luego obtener los tipos únicos con una consulta más amplia o usar los tipos estándar como fallback.

**Tipos de Issues Comunes:**

| Tipo | Descripción | Incluir en Reporte |
|------|-------------|-------------------|
| **Story** | Funcionalidades de usuario | ✅ Siempre |
| **Bug** | Defectos encontrados en testing | ✅ Siempre |
| **Defect** | Issues de producción | ✅ Siempre |
| **Improvement** | Mejoras técnicas | ✅ Si existe |
| **Task** | Tareas técnicas | ⚪ Opcional |
| **Sub-task** | Subtareas | ⚪ Opcional |
| **Epic** | Épicas (contenedores) | ⚪ Opcional |

### Paso 1: Obtener TODOS los Issues del Sprint Activo

Ejecutar búsqueda JQL incluyendo **todos los tipos relevantes**:

```
mcp__atlassian__search_issues(
  jql: "project = {PROJECT} AND issuetype IN (Story, Bug, Defect, Improvement) AND status NOT IN (Done, Closed, Cancelled) ORDER BY issuetype ASC, status ASC, priority DESC",
  limit: 100,
  fields: "summary,status,priority,assignee,issuetype"
)
```

**Nota**: Si algún tipo no existe en el proyecto, Jira lo ignorará automáticamente.

### Paso 2: Obtener Issues del Backlog

Si se solicitó Backlog Completo:

```
mcp__atlassian__search_issues(
  jql: "project = {PROJECT} AND issuetype IN (Story, Bug, Defect, Improvement) AND status IN (Backlog, 'To Do', Open) ORDER BY issuetype ASC, priority DESC, created ASC",
  limit: 100,
  fields: "summary,status,priority,assignee,issuetype"
)
```

### Paso 3: Procesar y Agrupar Resultados

Agrupar los issues por **status** primero, luego por **tipo** dentro de cada status:

**Orden de Status (prioridad de atención):**

1. **BLOCKED** (crítico - requiere atención inmediata)
2. **In Progress** (desarrollo activo)
3. **Ready For Dev** (listo para desarrollo)
4. **Shift-Left QA** (análisis QA pre-desarrollo)
5. **In Test** (testing activo)
6. **Ready For QA** (esperando QA)
7. **QA Approved** (completadas)
8. **Backlog** (pendientes)

**Iconos por Tipo de Issue:**

| Tipo | Icono |
|------|-------|
| Story | 📗 |
| Bug | 🐛 |
| Defect | 🔴 |
| Improvement | 💡 |
| Task | 📋 |

---

## Template de Output

Generar el siguiente reporte en formato markdown:

```markdown
# 📋 Sprint Report - {PROJECT}

**Fecha:** {fecha_actual}
**Sprint:** {sprint_name} (si aplica)

---

## 🔴 BLOCKED ({count})

{Si hay items bloqueados, mostrar tabla. Si no: "No hay issues bloqueados actualmente ✅"}

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| 📗 Story | {key} | {summary} | {priority} | {assignee} |
| 🐛 Bug | {key} | {summary} | {priority} | {assignee} |

---

## 🟡 In Progress ({count})

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| {icon} {type} | {key} | {summary} | {priority} | {assignee} |

---

## 🔵 Ready For Dev ({count})

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| {icon} {type} | {key} | {summary} | {priority} | {assignee} |

---

## 🟣 Shift-Left QA ({count})

> Pendientes de análisis de QA antes de desarrollo

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| {icon} {type} | {key} | {summary} | {priority} | {assignee} |

---

## 🟠 In Test ({count})

> En testing activo por QA

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| {icon} {type} | {key} | {summary} | {priority} | {assignee} |

---

## 🔷 Ready For QA ({count})

> Listas para que QA comience testing

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| {icon} {type} | {key} | {summary} | {priority} | {assignee} |

---

## ✅ QA Approved ({count})

> Aprobadas por QA - completadas

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| {icon} {type} | {key} | {summary} | {priority} | {assignee} |

---

## 📦 Backlog ({count})

> Pendientes de priorización

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| {icon} {type} | {key} | {summary} | {priority} | {assignee} |

---

## 📊 Resumen por Status

| Status | Stories | Bugs | Defects | Improvements | Total |
|--------|---------|------|---------|--------------|-------|
| BLOCKED | {n} | {n} | {n} | {n} | {total} |
| In Progress | {n} | {n} | {n} | {n} | {total} |
| Ready For Dev | {n} | {n} | {n} | {n} | {total} |
| Shift-Left QA | {n} | {n} | {n} | {n} | {total} |
| In Test | {n} | {n} | {n} | {n} | {total} |
| Ready For QA | {n} | {n} | {n} | {n} | {total} |
| QA Approved | {n} | {n} | {n} | {n} | {total} |
| Backlog | {n} | {n} | {n} | {n} | {total} |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}** | **{grand_total}** |

---

## 📈 Resumen por Tipo de Issue

| Tipo | Icono | Count | % del Total |
|------|-------|-------|-------------|
| Stories | 📗 | {count} | {percent}% |
| Bugs | 🐛 | {count} | {percent}% |
| Defects | 🔴 | {count} | {percent}% |
| Improvements | 💡 | {count} | {percent}% |
| **Total** | | **{total}** | **100%** |

---

## 🎯 Métricas Clave

| Métrica | Valor |
|---------|-------|
| **Issues Bloqueados** | {blocked_count} {⚠️ si > 0} |
| **Bugs Abiertos** | {open_bugs} {🐛 si > 0} |
| **Defectos Activos** | {open_defects} {🔴 si > 0} |
| **En Testing** | {in_test + ready_for_qa} |
| **Completados** | {qa_approved_count} |
| **Progreso del Sprint** | {(completed / total_sprint) * 100}% |

---

## ⚠️ Alertas

### Bloqueos Activos
{Si hay BLOCKED: listar con tipo y razón del bloqueo}

### Bugs de Alta Prioridad
{Si hay bugs con priority High/Highest: listar}

### Defectos sin Asignar
{Si hay defects sin assignee: listar}

### Issues sin Assignee
{Si hay issues sin assignee en estados activos: listar}
```

---

## Consultas JQL de Referencia

### Todos los Tipos - Sprint Activo

```jql
project = {PROJECT}
AND issuetype IN (Story, Bug, Defect, Improvement)
AND sprint in openSprints()
ORDER BY issuetype ASC, status ASC, priority DESC
```

### Solo Bugs y Defects Abiertos

```jql
project = {PROJECT}
AND issuetype IN (Bug, Defect)
AND status NOT IN (Done, Closed, Cancelled, "QA Approved")
ORDER BY priority DESC, created DESC
```

### Bugs por Severidad

```jql
project = {PROJECT}
AND issuetype = Bug
AND status NOT IN (Done, Closed)
ORDER BY priority DESC
```

### Defectos de Producción

```jql
project = {PROJECT}
AND issuetype = Defect
AND status NOT IN (Done, Closed)
ORDER BY priority DESC, created ASC
```

### Issues Bloqueados (Todos los Tipos)

```jql
project = {PROJECT}
AND issuetype IN (Story, Bug, Defect, Improvement)
AND status = "BLOCKED"
ORDER BY priority DESC
```

### Issues sin Assignee (Activos)

```jql
project = {PROJECT}
AND issuetype IN (Story, Bug, Defect)
AND assignee IS EMPTY
AND status NOT IN (Backlog, Done, Closed)
ORDER BY priority DESC
```

### Por Epic (Todos los Tipos)

```jql
project = {PROJECT}
AND issuetype IN (Story, Bug, Defect, Improvement)
AND "Epic Link" = {EPIC-KEY}
ORDER BY issuetype ASC, status ASC
```

### Improvements Pendientes

```jql
project = {PROJECT}
AND issuetype = Improvement
AND status NOT IN (Done, Closed)
ORDER BY priority DESC
```

---

## Adaptación del Workflow

### Tipos de Issues por Proyecto

Algunos proyectos usan nombres diferentes. Adaptar según el proyecto:

| Tipo Estándar | Alternativas Comunes |
|---------------|---------------------|
| Story | User Story, Historia, Feature |
| Bug | Error, Issue, Problem |
| Defect | Production Bug, Critical Bug, Incident |
| Improvement | Enhancement, Technical Debt, Refactor |
| Task | Technical Task, Dev Task, Spike |

### Detección Automática de Tipos

Si no estás seguro de qué tipos existen, usar esta consulta para descubrirlos:

```jql
project = {PROJECT} ORDER BY created DESC
```

Y observar el campo `issuetype` en los resultados.

---

## Ejemplo de Ejecución

### Input

```
Proyecto: SQ
Tipo: Sprint Activo + Backlog
```

### Llamadas MCP

```javascript
// Paso 1: Obtener TODOS los issues activos (todos los tipos)
mcp__atlassian__search_issues({
  jql: "project = SQ AND issuetype IN (Story, Bug, Defect, Improvement) AND status NOT IN (Done, Closed, Cancelled) ORDER BY issuetype ASC, status ASC, priority DESC",
  limit: 100,
  fields: "summary,status,priority,assignee,issuetype"
})

// Paso 2: Obtener backlog
mcp__atlassian__search_issues({
  jql: "project = SQ AND issuetype IN (Story, Bug, Defect, Improvement) AND status IN (Backlog, 'To Do', Open) ORDER BY issuetype ASC, priority DESC",
  limit: 100,
  fields: "summary,status,priority,assignee,issuetype"
})
```

### Output Esperado

```markdown
# 📋 Sprint Report - SQ

**Fecha:** 2026-03-10
**Sprint:** Sprint 5

---

## 🔴 BLOCKED (1)

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| 🐛 Bug | SQ-99 | Login fails on Safari | High | Juan Perez |

---

## 🟠 In Test (6)

| Type | Key | Summary | Priority | Assignee |
|------|-----|---------|----------|----------|
| 📗 Story | SQ-2 | User Registration | Highest | Samuel Amonzabel |
| 📗 Story | SQ-4 | Password Recovery | High | Maxe Aguilera |
| 🐛 Bug | SQ-88 | Email not sending | Medium | Ana Garcia |
| 🐛 Bug | SQ-92 | Validation error | Low | Pedro Lopez |
| 💡 Improvement | SQ-101 | Optimize queries | Medium | Dev Team |

---

## 📊 Resumen por Status

| Status | Stories | Bugs | Defects | Improvements | Total |
|--------|---------|------|---------|--------------|-------|
| BLOCKED | 0 | 1 | 0 | 0 | 1 |
| In Progress | 2 | 0 | 0 | 1 | 3 |
| In Test | 4 | 2 | 0 | 1 | 7 |
| Ready For QA | 10 | 3 | 1 | 0 | 14 |
| QA Approved | 6 | 2 | 0 | 1 | 9 |
| Backlog | 20 | 5 | 2 | 3 | 30 |
| **Total** | **42** | **13** | **3** | **6** | **64** |

---

## 📈 Resumen por Tipo

| Tipo | Icono | Count | % |
|------|-------|-------|---|
| Stories | 📗 | 42 | 66% |
| Bugs | 🐛 | 13 | 20% |
| Defects | 🔴 | 3 | 5% |
| Improvements | 💡 | 6 | 9% |
| **Total** | | **64** | **100%** |

---

## ⚠️ Alertas

### Bloqueos Activos
- 🐛 **SQ-99** - Login fails on Safari (High) - Assigned: Juan Perez

### Bugs de Alta Prioridad
- 🐛 **SQ-88** - Email not sending (Medium) - In Test
```

---

## Variantes del Reporte

### Reporte Solo Bugs

```jql
project = {PROJECT}
AND issuetype IN (Bug, Defect)
AND status NOT IN (Done, Closed)
ORDER BY priority DESC, status ASC
```

### Reporte Solo Stories

```jql
project = {PROJECT}
AND issuetype = Story
AND status NOT IN (Done, Closed)
ORDER BY status ASC, priority DESC
```

### Reporte de Deuda Técnica

```jql
project = {PROJECT}
AND issuetype = Improvement
AND status NOT IN (Done, Closed)
ORDER BY priority DESC
```

### Reporte Rápido (Solo Métricas)

```markdown
## 📊 Sprint Status - {PROJECT}

| Métrica | Valor |
|---------|-------|
| 🔴 Bloqueados | 1 ⚠️ |
| 📗 Stories Activas | 16 |
| 🐛 Bugs Abiertos | 6 |
| 🔴 Defectos | 1 |
| ✅ Completados | 9 |
| 📈 Progreso | 36% |
```

---

## Siguiente Paso

Después de generar el reporte:

- **Si hay BLOCKED**: Investigar y resolver bloqueos inmediatamente
- **Si Bugs > 5**: Priorizar bug fixing antes de nuevas features
- **Si hay Defects**: Escalar a producción support
- **Si Ready For QA > 5**: Priorizar testing
- **Si hay issues sin assignee**: Asignar responsables

---

**Versión**: 1.1
**Última Actualización**: 2026-03-10
