# US Development Session

> **Propósito:** Prompt inteligente para iniciar cualquier sesión de desarrollo de User Stories.
> La IA diagnostica automáticamente el estado actual y determina qué acción ejecutar.
> Soporta reanudación de sesiones interrumpidas mediante resumen de progreso.

---

## Detección de Modo de Sesión

**Primero, determina en qué modo estás:**

### Modo A: Sesión Nueva (sin resumen adjunto)

- No hay `## Resumen de Progreso` adjunto después de este prompt
- Ejecutar diagnóstico completo desde Paso 1

### Modo B: Sesión de Reanudación (con resumen adjunto)

- El usuario adjuntó un `## Resumen de Progreso` de una sesión anterior
- **Saltar directamente a la sección "Reanudación de Sesión"** más abajo
- Verificar el progreso reportado antes de continuar

---

## Contexto del Proyecto

- **Status Report:** @.context/PRD/shift-left-status-report.md
- **Workflow:** @.prompts/us-dev-workflow.md
- **Frontend:** @.context/design-system.md
- **Backend:** @.context/backend-setup.md

## Target de Esta Sesión

- **Epic:** EPIC-MYM-{N}
- **Story:** MYM-{N}

---

## Diagnóstico Automático

**Ejecuta este checklist en orden y reporta el estado detectado:**

### Paso 1: Verificar Shift-Left Testing

**Archivo a buscar:** `.context/PBI/epics/EPIC-MYM-{N}-*/stories/STORY-MYM-{N}-*/test-cases.md`

| Estado | Acción |
|--------|--------|
| **NO existe** | STOP. Informar al usuario que debe ejecutar Shift-Left Testing primero usando `.prompts/fase-5-shift-left-testing/story-test-cases.md`. No continuar. |
| **SÍ existe** | Continuar al Paso 2 |

---

### Paso 2: Verificar Feature Implementation Plan (Épica)

**Archivo a buscar:** `.context/PBI/epics/EPIC-MYM-{N}-*/feature-implementation-plan.md`

| Estado | Acción |
|--------|--------|
| **NO existe** | Crear el plan siguiendo `.prompts/fase-6-planning/feature-implementation-plan.md`. Al completar, hacer commit y terminar sesión. |
| **SÍ existe** | Continuar al Paso 3 |

---

### Paso 3: Verificar Story Implementation Plan

**Archivo a buscar:** `.context/PBI/epics/EPIC-MYM-{N}-*/stories/STORY-MYM-{N}-*/implementation-plan.md`

| Estado | Acción |
|--------|--------|
| **NO existe** | Crear el plan siguiendo `.prompts/fase-6-planning/story-implementation-plan.md`. Al completar, hacer commit y terminar sesión. |
| **SÍ existe** | Continuar al Paso 4 |

---

### Paso 4: Ejecutar Workflow de Implementación

**Condición:** Todos los planes existen.

**Acciones:**

1. Verificar estado en Jira (Paso 1 del Workflow)
2. Transitar a "In Progress" si es necesario
3. Implementar según `.prompts/fase-7-implementation/implement-story.md`
4. Seguir los pasos restantes del Workflow (`.prompts/us-dev-workflow.md`)

---

## Resumen de Acciones por Estado

| Estado Detectado | Tarea | Prompt a Seguir | Fin de Sesión |
|-----------------|-------|-----------------|---------------|
| Sin Shift-Left | STOP - Informar usuario | `fase-5-shift-left-testing/story-test-cases.md` | Sí |
| Sin Feature Plan | Crear plan de épica | `fase-6-planning/feature-implementation-plan.md` | Sí |
| Sin Story Plan | Crear plan de story | `fase-6-planning/story-implementation-plan.md` | Sí |
| Todo listo | Implementar story | `fase-7-implementation/implement-story.md` | Depende |

---

## MCPs Disponibles

| MCP | Uso | Configuración |
|-----|-----|---------------|
| **Atlassian** | Jira (issues, transiciones, comentarios) | CloudID: `348c51d9-ae78-4544-b33e-4ee8e89a7534` |
| **Supabase** | Backend (DB, migraciones, queries) | ProjectID: `ionevzckjyxtpmyenbxc` |
| **Context7** | Documentación actualizada de librerías | - |
| **shadcn** | Componentes UI | - |

---

## Contexto Adicional de la Story

El contexto completo de cada US está en su directorio correspondiente en PBI:

```
.context/PBI/epics/EPIC-MYM-{N}-*/stories/STORY-MYM-{N}-*/
├── story.md              # Descripción y Acceptance Criteria
├── test-cases.md         # Test cases (Shift-Left)
└── implementation-plan.md # Plan técnico
```

También puedes consultar Jira con el MCP de Atlassian para ver comentarios del equipo.

---

## Primera Acción

1. Lee el status report para ubicar la story target
2. Ejecuta el diagnóstico automático (Pasos 1-4)
3. Reporta el estado detectado en este formato:

```markdown
## Estado Detectado

**Epic:** EPIC-MYM-{N} - {nombre}
**Story:** MYM-{N} - {nombre}

**Checklist:**
- [ ] Shift-Left Testing: [Existe/No existe]
- [ ] Feature Implementation Plan: [Existe/No existe]
- [ ] Story Implementation Plan: [Existe/No existe]

**Siguiente Acción:** [Descripción de qué vas a hacer]
**Prompt a seguir:** [Ruta del prompt]
```

---

## Notas Importantes

1. **Crear planes consume muchos tokens.** Por eso, al crear un plan, termina la sesión y continúa en una nueva.

2. **Los planes son críticos.** Tómate el tiempo necesario para hacerlos bien. Un buen plan = implementación fluida.

3. **Sigue el Workflow.** El archivo `.prompts/us-dev-workflow.md` tiene los 11 pasos detallados. Es la guía maestra.

4. **No asumas.** Verifica siempre el estado real leyendo los archivos y consultando Jira.

5. **Commits atómicos.** Cada paso completado debe tener su commit correspondiente.

---

## Manejo de Contexto y Reanudación

> **Nota técnica:** La IA no puede detectar el límite de tokens. El usuario debe solicitar el resumen o la IA debe generarlo en hitos clave.

### Cuándo Generar Resumen de Progreso

**Genera el resumen automáticamente al completar estos hitos:**

- ✅ Al terminar de crear un `feature-implementation-plan.md`
- ✅ Al terminar de crear un `implementation-plan.md` de story
- ✅ Al completar cada Step del implementation plan durante implementación
- ✅ Cuando el usuario escribe: `resumen`, `pausa`, `guardar progreso`

**También genera resumen si el usuario lo solicita explícitamente.**

**Mensaje al generar:**

```
📋 Generando Resumen de Progreso para continuidad entre sesiones.
Copia este resumen y pégalo junto con el prompt en tu próxima sesión.
```

### Template de Resumen de Progreso

**Genera este resumen en formato copiable para el usuario:**

```markdown
## Resumen de Progreso

**Sesión:** {fecha y hora aproximada}
**Epic:** EPIC-MYM-{N} - {nombre}
**Story:** MYM-{N} - {nombre}

### Estado del Workflow
- **Paso actual:** {número y nombre del paso del workflow}
- **Fase actual:** {Fase 5/6/7/8 según corresponda}

### Progreso Completado
- [x] {Tarea completada 1}
- [x] {Tarea completada 2}
- [x] {Tarea completada 3}

### Archivos Creados/Modificados
| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `{ruta/archivo.ts}` | Creado | {descripción breve} |
| `{ruta/archivo2.ts}` | Modificado | {qué se cambió} |

### Commits Realizados
- `{hash corto}`: {mensaje del commit}

### Tarea en Progreso (Incompleta)
**Qué estaba haciendo:** {descripción de la tarea actual}
**Archivo en edición:** `{ruta si aplica}`
**Último paso completado:** {descripción}
**Siguiente acción:** {qué hacer a continuación}

### Contexto Crítico
{Cualquier información importante que la nueva sesión necesita saber:
- Decisiones técnicas tomadas
- Problemas encontrados y cómo se resolvieron
- Dependencias identificadas
- Notas del implementation-plan.md relevantes}

### Verificación Rápida
Para verificar este progreso, la nueva sesión debe:
1. `git log --oneline -5` → Ver commits recientes
2. `git status` → Ver archivos modificados
3. Leer `{archivo clave}` → Verificar implementación
```

---

## Reanudación de Sesión

**Si el usuario adjuntó un Resumen de Progreso, sigue estos pasos:**

### Paso R1: Verificar Progreso Reportado

**Ejecuta verificaciones:**

```bash
# Ver commits recientes
git log --oneline -5

# Ver estado actual
git status

# Ver rama actual
git branch --show-current
```

**Lee los archivos mencionados** en el resumen para confirmar que existen y tienen el contenido esperado.

### Paso R2: Validar Alineación

Compara el progreso reportado con:

1. **El implementation-plan.md** de la story → ¿Los steps reportados coinciden?
2. **El workflow** (`.prompts/us-dev-workflow.md`) → ¿El paso actual es correcto?
3. **Los archivos reales** → ¿El código existe y está correcto?

**Si hay discrepancias:**

```markdown
⚠️ Detecté diferencias entre el resumen y el estado actual:
- Resumen dice: {X}
- Estado real: {Y}

Voy a continuar basándome en el estado real del código.
```

### Paso R3: Reportar y Continuar

**Reporta el estado verificado:**

```markdown
## Reanudación Verificada

**Resumen recibido:** ✅ Validado
**Progreso confirmado:**
- [x] {Lo que realmente está hecho}

**Continuando desde:** {Paso/Tarea específica}
**Próxima acción:** {Qué voy a hacer ahora}
```

**Luego continúa** con la tarea pendiente según el resumen verificado.

---

## Flujo Completo de Sesiones

```
┌─────────────────────────────────────────────────────────────┐
│                    SESIÓN 1 (Nueva)                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Usuario pasa: us-dev-session.md + Epic/Story            │
│ 2. IA: Diagnóstico automático                              │
│ 3. IA: Trabaja en la tarea correspondiente                 │
│ 4. IA: Completa un hito (plan, step, etc.)                 │
│ 5. IA: Genera "Resumen de Progreso" automáticamente        │
│ 6. Usuario: Copia el resumen (o escribe "resumen")         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 SESIÓN 2 (Reanudación)                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Usuario pasa: us-dev-session.md + Resumen de Progreso   │
│ 2. IA: Detecta Modo B (Reanudación)                        │
│ 3. IA: Verifica progreso (git, archivos)                   │
│ 4. IA: Valida alineación con plan                          │
│ 5. IA: Continúa desde donde quedó                          │
│ 6. (Repetir ciclo en cada hito...)                         │
└─────────────────────────────────────────────────────────────┘
```

**Comandos del usuario para generar resumen manualmente:**

- `resumen` - Genera resumen del progreso actual
- `pausa` - Genera resumen y termina la sesión
- `guardar progreso` - Genera resumen detallado

---

## Notas Importantes

1. **Crear planes consume muchos tokens.** Por eso, al crear un plan, termina la sesión y continúa en una nueva.

2. **Los planes son críticos.** Tómate el tiempo necesario para hacerlos bien. Un buen plan = implementación fluida.

3. **Sigue el Workflow.** El archivo `.prompts/us-dev-workflow.md` tiene los 11 pasos detallados. Es la guía maestra.

4. **No asumas.** Verifica siempre el estado real leyendo los archivos y consultando Jira.

5. **Commits atómicos.** Cada paso completado debe tener su commit correspondiente.

6. **Resumen por hitos.** Genera resumen automáticamente al completar cada hito importante (planes, steps). No esperes a que el usuario lo pida.

7. **Verificación obligatoria.** Al reanudar, SIEMPRE verifica el progreso antes de continuar. No confíes ciegamente en el resumen.

---

**Versión:** 1.2
**Última actualización:** 2025-12-05
