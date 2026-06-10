# Test Analysis Report

**User Story:** [MYM-57] As a User, I want to view my conversation history so that I can follow up on previous discussions
**Epic:** [MYM-55] Messaging System
**Fecha:** 2026-06-09
**Analista:** AI Assistant (Claude Sonnet 4.6)
**Status US en Jira:** QA Approved ✅

---

## Fuentes Analizadas

| Fuente | Issues / Docs | Insights Clave |
|--------|--------------|----------------|
| User Story | MYM-57 | 5 ACs: lista, thread, ordenamiento, empty state, unread indicator |
| Shift-Left Test Cases | test-cases.md (25 TCs) | TC-MYM57-01/02/03/08 son los más relevantes para regresión |
| Exploratory UI Testing | final-test-results.md | 10 escenarios PASSED + 4 edge cases PASSED |
| Bugs abiertos enlazados | MYM-170, MYM-173, MYM-174, MYM-175 | 4 bugs Low — no bloquean release |
| Bugs cerrados (histórico) | MYM-155 (High), MYM-137 (Low), MYM-132 (Med) | Áreas que fallaron antes → mayor riesgo de regresión |
| Pending Bug Reports | pending-bug-reports.md | Detalle técnico de los 4 bugs encontrados en exploratory |

---

## Características Transversales (NO son tests separados)

Estas se validan **dentro** de cada escenario, no como tests independientes:

| Característica | Cómo se valida |
|----------------|----------------|
| Mobile responsive | Ejecutar TC1–TC5 en viewport mobile (375x667) Y desktop |
| Performance (< 300ms API) | Medir tiempos en cada test que llama a la API |
| XSS prevention | Incluir caracteres especiales en el contenido de mensajes de test data |
| Manejo genérico de errores | Validar como parte de escenarios negativos específicos |

---

## Escenarios Identificados

### Critical Priority

| # | Escenario | Tipo | Automatable | Componente de |
|---|-----------|------|-------------|---------------|
| TC1 | Validar carga exitosa de lista de conversaciones con metadata completa cuando el usuario tiene múltiples conversaciones | E2E | Sí | Complete Messaging E2E |
| TC2 | Validar visualización del thread de mensajes en orden cronológico al abrir una conversación | E2E | Sí | Complete Messaging E2E |
| TC3 | Validar indicador de no leído y marcado como leído al abrir una conversación con mensajes pendientes | E2E | Sí | Notification E2E (MYM-58) |

> ⚠️ **TC3 — Mayor riesgo:** Área afectada por MYM-155 (CLOSED, High) — mensajes enviados no se mostraban en el thread. Si regresa, el indicador de no leído podría ser inconsistente.

### High Priority

| # | Escenario | Tipo | Automatable | Componente de |
|---|-----------|------|-------------|---------------|
| TC4 | Validar ordenamiento de conversaciones por actividad más reciente cuando hay múltiples conversaciones activas | Functional | Sí | Complete Messaging E2E |
| TC5 | Validar empty state con CTA funcional cuando el usuario no tiene conversaciones | Functional | Sí | — |
| TC6 | Validar formato de timestamp relativo en lista y thread de conversaciones | Functional | Sí | Complete Messaging E2E |

> ⚠️ **TC6 — Riesgo activo:** MYM-170 (OPEN, Low) — Hydration mismatch en formateo de timestamps. Escenario válido para regresión una vez que el bug sea cerrado.

### Medium Priority

| # | Escenario | Tipo | Automatable | Notas |
|---|-----------|------|-------------|-------|
| TC7 | Validar comportamiento de lista de conversaciones cuando el perfil de un participante fue eliminado | Integration | Sí (con setup) | Edge case cubierto en exploratory ✅ |
| TC8 | Validar preview de último mensaje truncado cuando el contenido excede 100 caracteres | Functional | Sí | Ambiguity resuelta: max 100 chars + "..." |
| TC9 | Validar carga paginada de mensajes históricos al hacer scroll hacia arriba cuando hay más de 20 mensajes | E2E | Sí | Requiere seed de 50+ mensajes |

### Low Priority / Deferred

| # | Escenario | Razón para Diferir |
|---|-----------|-------------------|
| TC10 | Validar carga de avatares en lista y thread de mensajes | MYM-173 OPEN — DiceBear HTTP 400 sin fix aún |
| TC11 | Validar navegación de links del footer desde páginas del módulo de mensajería | MYM-174 OPEN — páginas no implementadas |
| TC12 | Validar constraint de longitud máxima de mensajes vía API directa sin pasar por Server Action | MYM-175 OPEN — DB constraint faltante sin fix |

---

## Mapa de Componentes (Lego)

```
E2E: Complete Messaging Flow (cruza MYM-56 + MYM-57)
├── [NEW - MYM-56] Validar envío de mensaje desde perfil de mentor
├── [TC1] Validar carga exitosa de lista de conversaciones (Functional)
├── [TC2] Validar visualización del thread de mensajes (Functional)
├── [TC4] Validar ordenamiento por actividad reciente (Functional)
└── [TC3] Validar indicador de no leído y marcado como leído (Functional)

E2E: Notification Flow (cruza MYM-57 + MYM-58)
├── [TC3] Validar indicador de no leído (reutilizado de MYM-57)
├── [TC1] Validar lista actualizada después de leer (reutilizado de MYM-57)
└── [NEW - MYM-58] Validar recepción de notificación de nuevo mensaje
```

---

## Resumen de Candidatos

| Categoría | Cantidad |
|-----------|----------|
| Total escenarios reales identificados | 12 |
| Características transversales (NO son tests) | 4 |
| Candidatos para regresión (activos) | 9 (TC1–TC9) |
| Diferidos por bugs abiertos | 3 (TC10, TC11, TC12) |
| Con bugs previos cerrados (mayor riesgo) | 3 (TC1, TC2, TC3 — área MYM-155/137/132) |
| Automatable | 9 |
| Manual-only | 0 |

---

## Análisis de Bugs Previos (Riesgo)

| Bug ID | Descripción | Estado | Área Afectada | Escenario Relacionado | ¿Mayor Riesgo? |
|--------|-------------|--------|---------------|----------------------|----------------|
| MYM-155 | Sent messages not displayed in conversation thread | CLOSED | Thread / mensajes | TC2, TC3 | ✅ SÍ — área crítica |
| MYM-137 | Chat bubbles fail to wrap long continuous text strings | CLOSED | UI thread / bubbles | TC2, TC8 | SÍ — wrap de mensajes largos |
| MYM-132 | Critical Application Crash (White Screen) on Network Loss | CLOSED | Network error handling | TC2 (network error) | SÍ — crash en condición límite |
| MYM-170 | Hydration mismatch en formateo de timestamps | OPEN | ConversationList | TC6 | SÍ — afecta TC6 (diferido hasta fix) |
| MYM-173 | DiceBear avatares HTTP 400 via Next.js Image | OPEN | Avatares | TC10 | Bajo (fallback funcional) |
| MYM-174 | Footer links retornan 404 | OPEN | Footer | TC11 | Bajo (fuera del flujo core) |
| MYM-175 | Ausencia de CHECK constraint longitud máxima en messages | OPEN | API / DB | TC12 | Medio (security risk, API directa) |

---

## Recomendaciones para Priorización

### Escenarios con mayor prioridad para regresión:
- **TC3** (unread indicator + mark as read) — área de MYM-155 que falló antes con prioridad High. El más crítico para regresión.
- **TC1 y TC2** — flujo core de la feature, alta visibilidad de usuario, afectados por área de bugs cerrados.
- **TC6** — una vez que MYM-170 sea cerrado, este escenario tiene riesgo real de regresar.

### Áreas de Riesgo Detectadas:
- **Thread de mensajes** (MYM-155, MYM-137) — `Incluir en regresión` → TC2, TC3, TC8
- **Timestamps / formateo de fechas** (MYM-170) — `Evaluar cuando bug esté cerrado` → TC6
- **DB constraint de mensajes** (MYM-175) — `Incluir como test de seguridad/integration` → TC12 (después del fix)

### Necesidad de Tests E2E / Integration:

| ¿Necesita E2E? | Razón |
|----------------|-------|
| SÍ | Esta story es parte del flujo completo: MYM-56 (envío) → MYM-57 (historial) → MYM-58 (notificaciones). Los TC1, TC2, TC3 son componentes de un E2E cross-story. |

| ¿Necesita Integration? | Razón |
|------------------------|-------|
| SÍ | Consume 3 endpoints (GET /api/conversations, GET /api/conversations/:id, PATCH /api/conversations/:id) usados también por MYM-58. TC7 y TC12 requieren setup de DB y llamadas directas a API. |

---

## Decisión Point

Candidatos identificados → proceder a **`test-prioritization.md`**

| Candidatos activos | 9 (TC1–TC9) |
|--------------------|-------------|
| Diferidos | 3 (TC10–TC12, dependen de fixes de bugs abiertos) |
| Siguiente paso | `test-prioritization.md` — calcular ROI y decidir path Candidate vs Manual |
