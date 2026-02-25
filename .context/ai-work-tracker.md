# AI Work Tracker

> **Propósito:** Archivo de contexto persistente para tracking continuo del trabajo de IA.
> **Regla de oro:** Commitear este archivo después de cada tarea completada.

---

## Estado Actual (2026-02-24)

**Rama actual:** `staging`
**Última actualización:** 2026-02-24

---

## Bugs Pendientes (OPEN)

| Key | Summary | Priority | Status |
|-----|---------|----------|--------|
| MYM-140 | Mentores verificados sin especialidad ni tarifa | Low | OPEN |
| MYM-128 | Sesión a 24h+1min es rechazada (> vs >=) | Low | OPEN |

---

## Bugs Ready For QA (Completados esta sesión)

| Key | Summary | Priority | Fixed |
|-----|---------|----------|-------|
| MYM-141 | API /api/mentors 404 | Highest | ✅ |
| MYM-126 | CancelAPI transactions no refunded | High | ✅ |
| MYM-96 | Widget realtime crash | High | ✅ |
| MYM-142 | URLs staging incorrectas | Medium | ✅ |
| MYM-139 | Rating/reviews desync | Medium | ✅ |
| MYM-132 | App crash on network loss | Medium | ✅ |
| MYM-129 | Students creating channels | Medium | ✅ |
| MYM-127 | Emails cancelación (config) | Medium | ✅ |
| MYM-125 | Toast de éxito cancelar | Medium | ✅ |
| MYM-124 | Paginación "Siguiente" | Medium | ✅ |

---

## Stories Pendientes

| Key | Summary | Status | Assignee |
|-----|---------|--------|----------|
| MYM-72 | Detect system theme preference | Ready For Dev | - |
| MYM-31 | Cancel session up to 24 hours | Ready For QA | Maria Agustina Tramanzoli |
| MYM-14 | See gallery of all mentors | Ready For QA | yxsinell acosta zambrano |
| MYM-26 | See record of earnings | Shift-Left QA | - |

---

## PRs Abiertos (QA/Docs)

| # | Branch | Descripción |
|---|--------|-------------|
| #89 | test/MYM-14/api-exploratory-testing | Exploratory API |
| #88 | test/MYM-14/exploratory-db | Exploratory DB |
| #87 | feat/MYM-14/qa-exploratory-notes | QA notes |
| #86 | docs/MYM-59-clean-smoke-exploratory-db | Smoke + exploratory |
| #84 | docs/MYM-57/fase-10-documentation | Fase 10 docs |
| #81 | docs/MYM-58/User-Messaging | Exploratory notes |
| #78 | autotest/MYM-35-view-profiles-reviews | Exploratory testing |

---

## Trabajo en Progreso

**Bug actual:** Ninguno
**US actual:** MYM-72 (pendiente)

---

## Historial de Sesión

### Sesión 2026-02-24 (Continuación)
- [x] MYM-139 - **FIXED** - Migration para recalcular ratings desde reviews reales
- [x] MYM-132 - **FIXED** - Try/catch en sendReplyToConversation y getConversations
- [x] MYM-129 - **FIXED** - Validación de rol mentor en PUT /api/users/me/communication-channels
- [x] MYM-127 - **CONFIG** - Requiere RESEND_API_KEY (usuario configuró en Vercel)
- [x] MYM-125 - **FIXED** - Cambio de useToast (shadcn) a toast (sonner)
- [x] MYM-124 - **FIXED** - Lógica de paginación para rating=0 vs NULL
- [x] **MYM-14 DESBLOQUEADA** → Ready For QA (assignee: yxsinell)
- [x] **MYM-31 DESBLOQUEADA** → Ready For QA (assignee: Maria Agustina)

### Sesión 2026-02-23
- [x] Exploración del panorama completo (PRs, Bugs, Stories)
- [x] Creación de archivo de tracking
- [x] MYM-141 - **FIXED** - Creado endpoint GET /api/mentors (commit 6c0f750)
- [x] MYM-126 - **FIXED** - Añadido stripe_refund_id a transactions (commit 058521d)
- [x] MYM-96 - **FIXED** - Añadido polling fallback para widget (commit e881d53)
- [x] MYM-142 - **FIXED** - Corregidas URLs de staging/prod en documentación (commit 160b0a9)

---

## Notas de Contexto

- **Bug fixes:** Push directo a staging (sin crear rama)
- **User Stories:** Rama feature + PR hacia staging
- **Archivos workflow:**
  - `.prompts/bug-fix-workflow.md` - Para bugs
  - `.prompts/us-dev-workflow.md` - Para US

---

*Última modificación: 2026-02-24*
