# Bug Fix Workflow

> **IMPORTANTE**: Lee este documento cada vez que inicies una sesión o compactes la conversación.

---

## Resumen del Flujo

```
Retest en Staging → Confirmar Bug → Jira In Progress → Fix Local →
Verificar (typecheck/lint/build) → Test Localhost → Comentar Jira →
Commit con ID → Push Staging → Esperar Vercel → Jira Ready For QA → Siguiente Bug
```

---

## Configuración

| Item | Valor |
|------|-------|
| **Rama de trabajo** | `staging` (push directo, sin PRs) |
| **Ambiente Staging** | https://staging-upexmymentor.vercel.app |
| **Localhost** | http://localhost:3000 |
| **Proyecto Jira** | MYM |
| **Proyecto Vercel** | `UpexMyMentor` (ignorar otros con nombres similares) |
| **Supabase Project ID** | `ionevzckjyxtpmyenbxc` |

---

## Usuarios de Prueba

Disponibles en la página de login:

| Rol | Email | Password |
|-----|-------|----------|
| Mentor | `mentor.demo@upexmymentor.com` | `Demo123!` |
| Mentee | (verificar en login page) | (verificar en login page) |

---

## Paso a Paso Detallado

### 1. Retest en Staging

```bash
# Usar Playwright MCP para abrir staging
mcp__playwright__browser_navigate → https://staging-upexmymentor.vercel.app
```

- Seguir los Steps to Reproduce del bug
- Capturar evidencia si es necesario
- Si NO se reproduce → Agregar comentario en Jira y cerrar como "Cannot Reproduce"

### 2. Confirmar Bug Existe → Transitar a In Progress

```bash
# Usar Atlassian MCP
mcp__atlassian__jira_get_transitions → MYM-XX
mcp__atlassian__jira_transition_issue → transition_id para "In Progress"
```

- Verificar que Ely esté asignado
- Si no está asignado, asignar con `jira_update_issue`

### 3. Investigar Causa Raíz

- Buscar en código: `src/app/`, `src/components/`, `src/lib/`
- Verificar en Supabase: `mcp__supabase__execute_sql`, `mcp__supabase__list_tables`
- Revisar logs: `mcp__supabase__get_logs`

### 4. Implementar Fix

- Editar archivos necesarios
- Seguir code-standards.md (DRY, KISS, YAGNI)
- NO over-engineer, solo arreglar el bug específico

### 5. Verificar Localmente

```bash
# Scripts de verificación
bun run typecheck   # Verificar tipos
bun run lint        # Verificar estilo
bun run build       # Verificar build completo
```

### 6. Testear en Localhost

```bash
# Iniciar servidor local
bun run dev

# Usar Playwright MCP para testear
mcp__playwright__browser_navigate → http://localhost:3000
```

- Reproducir los pasos del bug
- Verificar que el fix funciona
- Verificar que no rompe nada más

### 7. Comentar en Jira

```bash
mcp__atlassian__jira_add_comment → MYM-XX
```

Contenido del comentario:
```
## Fix Aplicado ✅

**Causa Raíz:** [Descripción breve]
**Archivos modificados:** [Lista de archivos]
**Verificación local:** Pasó typecheck, lint, build y test manual en localhost.
```

### 8. Commit con ID del Bug

**Formato obligatorio:**
```
fix(MYM-XX): Descripción breve del fix
```

Ejemplos:
```
fix(MYM-88): Configure Stripe secret key in environment
fix(MYM-79): Add redirect URLs to Supabase auth config
fix(MYM-96): Implement realtime subscription for messages widget
```

### 9. Push a Staging

```bash
git push origin staging
```

- NO crear Pull Request
- Push directo a staging

### 10. Esperar Deployment de Vercel

- Verificar que el deployment sea del proyecto `UpexMyMentor`
- Ignorar deployments de otros proyectos similares
- Esperar a que termine exitosamente

### 11. Transitar a Ready For QA

```bash
# Primero a In Review (si workflow lo requiere)
mcp__atlassian__jira_transition_issue → "In Review"

# Luego a Ready For QA
mcp__atlassian__jira_transition_issue → "Ready For QA"
```

### 12. Repetir con Siguiente Bug

Volver al paso 1 con el siguiente bug de la lista priorizada.

---

## Lista de Bugs Priorizada

### ✅ Completados (Sesión 2025-12-27)

| Key | Título | Estado |
|-----|--------|--------|
| ~~MYM-88~~ | ~~Stripe Connect Error 500~~ | ✅ DONE (env var fix) |
| ~~MYM-79~~ | ~~Password Reset no funciona~~ | ✅ DONE (redirect loop fix) |
| ~~MYM-96~~ | ~~Widget mensajes no realtime~~ | ✅ Ready For QA |
| ~~MYM-97~~ | ~~Falta link perfil mentee~~ | ✅ Ready For QA |
| ~~MYM-89~~ | ~~Navegación a settings oculta~~ | ✅ Ready For QA |
| ~~MYM-64~~ | ~~Missing Availability page~~ | ✅ Duplicated (MYM-19 implemented) |

### ✅ Verificados (Sesión 2025-12-28)

| Key | Título | Estado |
|-----|--------|--------|
| ~~MYM-87~~ | ~~API Error 500 - Communication channels~~ | ✅ Ready For QA |
| ~~MYM-85~~ | ~~Send Message Button Non-Functional~~ | ✅ Ready For QA |
| ~~MYM-77~~ | ~~Imágenes no cargan en /mentors~~ | ✅ Ready For QA |
| ~~MYM-46~~ | ~~Search no trimea espacios~~ | ✅ Ready For QA |

### 🔄 Pendientes (Nueva Ronda)

| Prioridad | Key | Título | Estado | Prioridad Jira |
|-----------|-----|--------|--------|----------------|
| 1 | MYM-86 | Defectos visuales Light/Dark Mode | OPEN | Medium |
| 2 | MYM-47 | Skill filtering usa OR en vez de AND | OPEN | High |
| 3 | MYM-92 | Toast notifications no se muestran | OPEN | Medium |
| 4 | MYM-91 | Inconsistencia contador mensajes realtime | OPEN | Medium |
| 5 | MYM-48 | Filters client-side only, sin backend | OPEN | Medium |

---

## Herramientas MCP Disponibles

| Tarea | MCP Tool |
|-------|----------|
| Navegar/testear UI | `mcp__playwright__*` |
| Consultar/modificar DB | `mcp__supabase__*` |
| Gestionar Jira | `mcp__atlassian__jira_*` |
| Buscar docs | `mcp__context7__*` |

---

## Checklist Pre-Commit

- [ ] Bug reproducido en staging
- [ ] Causa raíz identificada
- [ ] Fix implementado (mínimo necesario)
- [ ] `bun run typecheck` pasa
- [ ] `bun run lint` pasa
- [ ] `bun run build` pasa
- [ ] Testeado manualmente en localhost
- [ ] Comentario agregado en Jira
- [ ] Commit message incluye `fix(MYM-XX):`

---

## Notas Importantes

1. **No crear PRs** - Trabajamos directo en staging
2. **Commits atómicos** - Un bug = un commit
3. **Verificar Vercel** - Solo deployments de `UpexMyMentor`
4. **Documentar en Jira** - Siempre agregar comentario con el fix
5. **Leer este archivo** - Cada vez que se compacte la conversación

---

**Última actualización**: 2025-12-27
