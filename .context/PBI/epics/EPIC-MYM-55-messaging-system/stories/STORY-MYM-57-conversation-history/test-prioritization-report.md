# Test Prioritization Report

**Feature:** [MYM-57] View Conversation History
**Epic:** [MYM-55] Messaging System
**Fecha:** 2026-06-09
**Total Candidatos Inicial:** 9 (TC1–TC9 del test-analysis-report.md)
**Candidatos que pasan filtro:** 3 (33% del total ✅ objetivo < 50%)

---

## Fase 0: Filtro de Preguntas Críticas

| # | Escenario | ¿Protege futuro? | ¿Bug previo? | ¿Nivel feature? | ¿Pasa filtro? |
|---|-----------|-----------------|-------------|----------------|--------------|
| TC1 | Validar carga exitosa de lista de conversaciones con metadata completa | SÍ | NO (indirecto) | SÍ | ✅ |
| TC2 | Validar visualización del thread de mensajes en orden cronológico | SÍ | SÍ — MYM-155, MYM-137 | SÍ | ✅ |
| TC3 | Validar indicador de no leído y marcado como leído | SÍ | SÍ — MYM-155 | SÍ | ✅ |
| TC4 | Validar ordenamiento de conversaciones por actividad más reciente | SÍ | NO | SÍ | ⚠️ Absorbido en TC1 |
| TC5 | Validar empty state con CTA funcional | NO — validación one-time, UI estática | NO | SÍ | ❌ |
| TC6 | Validar formato de timestamp relativo | SÍ | SÍ — MYM-170 OPEN | SÍ | ❌ DIFERIDO (bug aún abierto) |
| TC7 | Validar comportamiento con perfil de participante eliminado | NO — edge case < 1% usuarios, setup muy complejo | NO | SÍ | ❌ |
| TC8 | Validar preview de último mensaje truncado (100 chars) | NO — lógica CSS simple, muy estable | Indirecto — MYM-137 (área diferente) | SÍ | ❌ |
| TC9 | Validar carga paginada de mensajes históricos (scroll infinito) | SÍ | NO | SÍ | ❌ ROI bajo |

**Resultado:** 3 de 9 candidatos pasan el filtro. TC4 se absorbe dentro de TC1.

---

## Análisis ROI — Solo candidatos que pasaron filtro

> Fórmula: `ROI = (Frecuencia × Impacto × Estabilidad) / (Esfuerzo × Dependencias)`
> Bonus componente: `ROI final = ROI base × (1 + 0.2 × N flujos E2E)`

| # | Escenario | Freq | Impact | Stab | Effort | Deps | ROI base | Bug Previo | N flujos | ROI final | Decisión |
|---|-----------|------|--------|------|--------|------|----------|-----------|---------|-----------|----------|
| TC1 | Validar carga exitosa de lista con metadata completa | 5 | 5 | 4 | 2 | 2 | 25.0 | — | 2 | **35.0** | ✅ AUTO |
| TC2 | Validar thread de mensajes en orden cronológico | 5 | 5 | 4 | 2 | 2 | 25.0 | MYM-155, MYM-137 | 2 | **35.0** | ✅ AUTO |
| TC3 | Validar unread indicator y mark-as-read | 5 | 4 | 4 | 2 | 2 | 20.0 | MYM-155 | 1 | **24.0** | ✅ AUTO |

### Justificación de scores por candidato

**TC1** — Frecuencia 5 (corre en cada PR), Impacto 5 (sin lista de conversaciones el módulo entero falla), Estabilidad 4 (API definida y estable), Esfuerzo 2 (navegación + assertions simples), Dependencias 2 (auth + conversations API). Componente de 2 flujos E2E (Complete Messaging + posible flujo de Notifications).

**TC2** — Mismo perfil que TC1 más el peso de dos bugs cerrados: MYM-155 (mensajes no aparecían en el thread, prioridad High) y MYM-137 (wrapping de texto en bubbles). Área que ya falló antes = mayor probabilidad de regresar.

**TC3** — Frecuencia 5 (cada PR que toca is_read o el PATCH endpoint), Impacto 4 (el indicador es visible y afecta la UX, pero el usuario aún puede leer mensajes sin él), Estabilidad 4, Esfuerzo 2, Dependencias 2. Bug previo MYM-155 es el área más crítica de regresión.

### ¿Por qué se absorbió TC4?

TC4 (ordenamiento) se valida **dentro de TC1**: si la lista carga correctamente con múltiples conversaciones, la assertion del orden es simplemente verificar que `conversations[0].updated_at > conversations[1].updated_at`. Crear un test separado solo para el ordenamiento viola el principio "1 test de flujo > 5 tests atómicos".

---

## Candidatos Diferidos — Con Justificación

| # | Escenario | ROI estimado | Razón para diferir |
|---|-----------|-------------|-------------------|
| TC5 | Validar empty state con CTA funcional | ~12 | One-time validation. UI estática. Solo afecta usuarios nuevos sin conversaciones. Impacto 2. Muy improbable que regrese. |
| TC6 | Validar formato de timestamp relativo | — | MYM-170 está OPEN. Documentar el test ahora significaría tener un test que siempre falla. Se crea **después** de que MYM-170 se cierre. |
| TC7 | Validar comportamiento con perfil de participante eliminado | ~5 | Edge case < 1% de usuarios. Requiere setup complejo de DB (borrar perfil manualmente). No hay bug previo. Costo de mantenimiento no justificado. |
| TC8 | Validar preview de último mensaje truncado | ~15 | Lógica de truncado es CSS simple y extremadamente estable. MYM-137 afectó los bubbles del thread, no el preview de la lista — conexión indirecta. Impacto 2. |
| TC9 | Validar carga paginada de mensajes históricos | ~3 | ROI borderline (3.0). Requiere seed de 50+ mensajes. Dependencias 3. No hay bug previo. La lógica de paginación es estable una vez implementada. |

---

## Decisión Final

### ✅ Para Regresión Automatizada (Candidate → Fase 12)

| # | Nomenclatura Final | ROI | Path | Justificación |
|---|-------------------|-----|------|---------------|
| 1 | `MYM-57: TC1: Validate conversation list displays complete metadata and recent-activity ordering when user has multiple conversations` | 35.0 | → Candidate | Flujo principal, componente de E2E, impacto crítico. Título refleja TC4 absorbido (ordering = AC3) |
| 2 | `MYM-57: TC2: Validate conversation thread displays all messages in chronological order when conversation has messages from both participants` | 35.0 | → Candidate | Flujo principal + bugs previos MYM-155/MYM-137. "All messages from both participants" codifica exactamente la regresión de MYM-155 |
| 3 | `MYM-57: TC3: Validate conversation is marked as read when opening a conversation with unread messages` | 24.0 | → Candidate | Bug previo MYM-155, lógica de estado crítica, componente de MYM-58. El badge que desaparece es assertion del expected result |

**Total: 3 tests** — apropiado para feature de complejidad media.

### ❌ Diferidos (NO entran en regresión ahora)

**Total diferidos: 6** (5 de candidatos activos + TC6 pendiente de MYM-170)

---

## Resumen de Reducción

| Métrica | Antes | Después | Reducción |
|---------|-------|---------|-----------|
| Candidatos | 9 | 3 | **67%** ✅ |

| Track | Count | Nota |
|-------|-------|------|
| Automated Regression (Candidate) | 3 | TC1, TC2, TC3 |
| Manual Regression | 0 | Ninguno necesario |
| Deferred | 6 | TC4 absorbido, TC5/7/8/9 diferidos, TC6 pendiente fix MYM-170 |

---

## Para Test Documentation (siguiente paso)

**Tests a crear en Jira como Issue Type "Test":**

| Test | Nomenclatura | Path en Workflow |
|------|-------------|-----------------|
| TC1 | `MYM-57: TC1: Validate conversation list displays complete metadata and recent-activity ordering when user has multiple conversations` | Draft → In Design → Ready → In Review → **Candidate** |
| TC2 | `MYM-57: TC2: Validate conversation thread displays all messages in chronological order when conversation has messages from both participants` | Draft → In Design → Ready → In Review → **Candidate** |
| TC3 | `MYM-57: TC3: Validate conversation is marked as read when opening a conversation with unread messages` | Draft → In Design → Ready → In Review → **Candidate** |

**Características transversales a validar DENTRO de los 3 tests:**

| Característica | Cómo se valida |
|----------------|----------------|
| Mobile responsive | Ejecutar TC1, TC2, TC3 en viewport 375x667 (mobile) |
| Performance | Assertion: API response < 300ms en TC1 |
| XSS | Incluir mensaje con `<script>alert('xss')</script>` en test data de TC2 |

**TC6 (timestamps) — decisión actualizada (2026-06-10):**
El formato de timestamp relativo es una **característica compartida** (aparece en la lista, en el thread y en otras áreas de la app), no un flujo propio de esta US. Cuando MYM-170 se cierre, **NO se creará como test independiente**: se validará como assertion adicional dentro de TC1 (lista) y TC2 (thread), igual que mobile/performance/XSS.

---

## Análisis de Protección Futura (Risk-Based) — 2026-06-10

> Contexto: la US ya está **QA Approved** — todos estos escenarios ya PASARON una vez durante la validación.
> La pregunta de regresión no es "¿funciona?" sino: **"¿qué probabilidad hay de que un cambio futuro rompa este comportamiento que ya pasó?"**

### Cambio futuro conocido que amenaza esta área

**MYM-58 (Notifications)** — siguiente story del epic MYM-55, aún no implementada. Su implementación tocará directamente:
- La lógica de `is_read` / unread counts (base de las notificaciones) → **TC3 en zona de impacto directo**
- La lista de conversaciones (badges, posible realtime/reordering) → **TC1 en zona de impacto**
- El thread de mensajes (posible realtime de mensajes nuevos + interacción con paginación) → **TC2 en zona de impacto**

Es decir: el área de los 3 tests seleccionados **va a ser modificada con certeza** — no es especulación, está en el backlog del mismo epic.

### Ranking de valor de protección

| Rank | Test | Protección futura | Justificación |
|------|------|-------------------|---------------|
| 🥇 | **TC2** (thread completo + orden) | **Máxima** | Este comportamiento exacto **ya falló una vez** (MYM-155, High: mensajes enviados no aparecían en el thread). Área que falló = área que puede volver a fallar. Además, realtime (MYM-58) + scroll infinito tocan justo la lógica de merge/orden de mensajes. |
| 🥈 | **TC3** (mark as read) | **Máxima a futuro** | MYM-58 se construirá ENCIMA de `is_read`. Cualquier implementación de notificaciones modifica esta lógica. Es el test con mayor probabilidad de atrapar una regresión cuando llegue MYM-58. Bug previo MYM-155 en la misma área. |
| 🥉 | **TC1** (lista + metadata + orden) | **Media-alta** | Sin bug previo directo y la metadata es estable, PERO es el smoke/gate del módulo (si falla, todo mensajería está roto), es componente de 2 flujos E2E, y MYM-58 tocará la lista (badges). Barato de mantener (esfuerzo 2). |

**Ultimátum:** si solo se pudiera automatizar UN test, sería **TC2** — combina bug histórico High + flujo core + área con cambios futuros garantizados.

### Confirmación de los diferidos (lógica "one-time validation")

Estos ya pasaron una vez y **NO se justifica re-ejecutarlos constantemente** porque ningún cambio planificado toca su lógica:

| Test | ¿Por qué una sola ejecución fue suficiente? |
|------|---------------------------------------------|
| TC5 (empty state) | UI estática sin lógica de negocio. Solo se rompería con un rediseño deliberado de la página (que se detectaría a simple vista). |
| TC7 (perfil eliminado) | Edge case < 1% de usuarios, sin bug previo, setup complejo. El costo de mantenimiento supera el riesgo. |
| TC8 (truncado de preview) | CSS puro, extremadamente estable. MYM-137 afectó otra área (bubbles del thread). |
| TC9 (paginación) | Sin bug previo, lógica estable una vez implementada. ⚠️ **Re-evaluar cuando MYM-58 introduzca realtime** — la interacción paginación + mensajes en vivo es un punto de riesgo nuevo. Mientras tanto, la integridad del thread la cubre TC2. |
| TC6 (timestamps) | Característica compartida → assertion dentro de TC1/TC2 cuando MYM-170 cierre. |

### ¿Es correcto el tamaño de la suite? (3 automatizados, 0 manuales)

**SÍ.** Justificación risk-based:
- **Importancia de la US:** mensajería es el canal de coordinación mentor↔student — sin historial de conversaciones se pierde la comunicación que sostiene los bookings (revenue directo del marketplace).
- **Historial del módulo:** es el área con peor historial de bugs del proyecto (MYM-155 High, MYM-132 Medium, MYM-137 Low cerrados + 4 menores abiertos) → módulo propenso a regresión.
- **Cambio futuro garantizado:** MYM-58 pendiente → el área seguirá cambiando.
- **Proporción:** 3 de 12 escenarios (25%) — dentro del objetivo < 50%. Cada test es además un componente Lego reutilizable en los E2E cross-story.
- **0 manuales es correcto:** ningún diferido requiere juicio humano; los que quedaron fuera, quedaron fuera por bajo riesgo, no por no ser automatizables.

---

## Decisión de Idioma de los TCs — 2026-06-10

**Decisión: INGLÉS** para los títulos y contenido de los Tests en Jira.

| Evidencia | Idioma |
|-----------|--------|
| User Story MYM-57 en Jira ("As a User, I want to view my conversation history...") | Inglés |
| Bugs del módulo en Jira (MYM-155 "Sent messages not displayed...", MYM-170 "Hydration mismatch...") | Inglés |
| Shift-left `test-cases.md` (TC-MYM57-01 "View the conversation list...") | Inglés |
| Guía oficial `jira-test-management.md` (formato `Validate <CORE> <CONDITIONAL>` y todos sus ejemplos) | Inglés |
| Fase 12 (automatización): los títulos de Jira deben mapear 1:1 con los nombres de tests en Playwright (decorador `@atc`) | Inglés |

Los **reportes internos de trabajo** (analysis, prioritization) se mantienen en español por ser documentos de proceso del equipo; los **artefactos en Jira** (Tests, bugs, stories) van en inglés para consistencia con todo el issue trail del proyecto.

---

## Siguiente Paso

Tests priorizados → proceder a **`test-documentation.md`**

Crear los 3 tests en Jira (Issue Type: Test), vincularlos a MYM-57, y transitarlos por el workflow hasta **Candidate**.
