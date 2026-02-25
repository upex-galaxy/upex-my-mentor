# Implementation Roadmap - MyMentor

> **Documento provisional** - Generado: 2026-02-25 | **Ultima actualizacion:** 2026-02-25
> **Proposito:** Panorama completo del estado actual y plan de implementacion ordenado por dependencias.

---

## Instrucciones para Continuar (Contexto IA)

**Para retomar el desarrollo en un nuevo chat:**

1. **Workflow a seguir:** `.prompts/us-dev-workflow.md` (12 pasos)
2. **Test Cases:** Buscar primero en **comentarios de Jira** de la US (Acceptance Test Plan del QA)
3. **Siguiente tarea:** Ver seccion "US en Trabajo Actual" abajo
4. **Si la US actual esta completa:** Tomar la siguiente de "Lista Estrategica de Implementacion"

**Comando sugerido para iniciar:**

```
Continua con el IMPLEMENTATION-ROADMAP.md siguiendo .prompts/us-dev-workflow.md
```

---

## Criterios de Transicion de Estados

### User Stories

| Estado        | Requisito PR Shift-Left | Requisito PR Impl | Asignado a          |
| ------------- | ----------------------- | ----------------- | ------------------- |
| Ready For Dev | MERGED (o N/A)          | NO debe existir   | Ely (Dev)           |
| In Progress   | MERGED (o N/A)          | OPEN              | Ely (Dev)           |
| Ready For QA  | MERGED (o N/A)          | MERGED            | Tester (Shift-Left) |
| In Test       | MERGED (o N/A)          | MERGED            | Tester (QA)         |
| BLOCKED       | MERGED (o N/A)          | MERGED            | Dev (para fix)      |

### Defects/Bugs

| Estado       | Significado            | PR Fix    |
| ------------ | ---------------------- | --------- |
| OPEN         | Bug reportado, sin fix | NO existe |
| In Progress  | Fixing                 | OPEN      |
| In Review    | PR abierto             | OPEN      |
| Ready For QA | Fixeado y desplegado   | MERGED    |

---

## Estado Actual del Tablero Jira (2026-02-25)

### Epic: MYM-2 - User Authentication & Profiles

| Key   | Story                   | Status       | Priority | Assignee               | Epic   |
| ----- | ----------------------- | ------------ | -------- | ---------------------- | ------ |
| MYM-3 | Sign up with email      | In Test      | Medium   | Ely                    | MYM-2  |
| MYM-4 | Log in and log out      | Ready For QA | Medium   | Rafael Mejia           | MYM-2  |
| MYM-5 | Create mentee profile   | Ready For QA | Medium   | yleonice.colegio       | MYM-2  |
| MYM-6 | Create mentor profile   | QA Approved  | Medium   | Jessica Alves Lemes    | MYM-2  |

### Epic: MYM-8 - Mentor Vetting & Onboarding

| Key    | Story                        | Status       | Priority | Assignee                   | Epic   |
| ------ | ---------------------------- | ------------ | -------- | -------------------------- | ------ |
| MYM-9  | View pending applications    | Ready For QA | Medium   | Lady Johana Toro           | MYM-8  |
| MYM-10 | Review application details   | Ready For QA | Medium   | MARIA DE LOS ANGELES CAMPOO| MYM-8  |
| MYM-11 | Approve/reject application   | Ready For QA | Medium   | Luis Eduardo Flores        | MYM-8  |
| MYM-12 | Email notification status    | Ready For QA | Medium   | nicolas zotelo             | MYM-8  |

### Epic: MYM-13 - Mentor Discovery & Search

| Key    | Story                       | Status       | Priority | Assignee               | Epic    |
| ------ | --------------------------- | ------------ | -------- | ---------------------- | ------- |
| MYM-14 | Gallery of all mentors      | Ready For QA | Medium   | yxsinell acosta zambrano| MYM-13 |
| MYM-15 | Search mentors by keyword   | Ready For QA | Medium   | Marttin Roman          | MYM-13  |
| MYM-16 | Filter mentors by skills    | Ready For QA | Medium   | Ely                    | MYM-13  |
| MYM-17 | View mentor detail profile  | Ready For QA | Medium   | Ely                    | MYM-13  |

### Epic: MYM-18 - Scheduling & Booking

| Key     | Story                        | Status       | Priority | Assignee                     | Epic    |
| ------- | ---------------------------- | ------------ | -------- | ---------------------------- | ------- |
| MYM-19  | Set weekly availability      | Ready For QA | Medium   | Jescer Alejandro Fleitas     | MYM-18  |
| MYM-20  | View availability in timezone| Ready For QA | Medium   | Noelia Barboza               | MYM-18  |
| MYM-21  | Select slot and book session | Ready For QA | Medium   | Ely                          | MYM-18  |
| MYM-22  | Email + calendar invite      | Ready For QA | Medium   | Ely                          | MYM-18  |
| MYM-131 | Set weekly availability (v2) | In Test      | Medium   | Ely                          | MYM-18  |

### Epic: MYM-23 - Payments & Payouts

| Key    | Story                      | Status       | Priority | Assignee             | Epic    |
| ------ | -------------------------- | ------------ | -------- | -------------------- | ------- |
| MYM-24 | Enter credit card (Stripe) | Ready For QA | Medium   | Ely                  | MYM-23  |
| MYM-25 | Connect bank (Stripe)      | Ready For QA | Medium   | Ely                  | MYM-23  |
| MYM-26 | See earnings record        | Shift-Left QA| Medium   | Melary Vasquez       | MYM-23  |
| MYM-27 | Auto payout after 24h      | Ready For QA | Medium   | Jorge Luis Bergandi  | MYM-23  |

### Epic: MYM-28 - Session Management

| Key    | Story                      | Status       | Priority | Assignee                    | Epic    |
| ------ | -------------------------- | ------------ | -------- | --------------------------- | ------- |
| MYM-7  | Reset password             | Ready For QA | Medium   | juan Fernando Giraldo       | MYM-28  |
| MYM-29 | Dashboard sessions view    | Ready For QA | Medium   | Evelyn Ruch                 | MYM-28  |
| MYM-30 | Communication channels     | QA Approved  | Medium   | Jorge Luis Bergandi         | MYM-28  |
| MYM-31 | Cancel session (24h)       | Ready For QA | Medium   | Maria Agustina Tramanzoli   | MYM-28  |

### Epic: MYM-32 - Reputation & Reviews System

| Key    | Story                      | Status       | Priority | Assignee               | Epic    |
| ------ | -------------------------- | ------------ | -------- | ---------------------- | ------- |
| MYM-33 | Mentee rates mentor        | Ready For QA | Medium   | Isidro Serrano Pineda  | MYM-32  |
| MYM-34 | Mentor rates mentee        | Ready For QA | Medium   | Stephanie Garcia       | MYM-32  |
| MYM-35 | View ratings on profiles   | QA Approved  | Medium   | Ely                    | MYM-32  |

### Epic: MYM-55 - Messaging System

| Key    | Story                      | Status       | Priority | Assignee             | Epic    |
| ------ | -------------------------- | ------------ | -------- | -------------------- | ------- |
| MYM-56 | Send message before booking| Ready For QA | Medium   | Ely                  | MYM-55  |
| MYM-57 | View conversation history  | QA Approved  | Medium   | Yudelkis             | MYM-55  |
| MYM-58 | Receive new message notif  | QA Approved  | Medium   | Carrera Franco       | MYM-55  |
| MYM-59 | Mentor responds from dash  | In Test      | Medium   | Jose Andres Lorca    | MYM-55  |
| MYM-84 | Conversation History nav   | Backlog      | Medium   | Unassigned           | MYM-55  |

### Epic: MYM-69 - Dark Mode & Theme Preferences

| Key    | Story                      | Status       | Priority | Assignee                     | Epic    |
| ------ | -------------------------- | ------------ | -------- | ---------------------------- | ------- |
| MYM-70 | Toggle light/dark mode     | QA Approved  | Medium   | Jescer Alejandro Fleitas     | MYM-69  |
| MYM-71 | Persist theme in storage   | In Test      | Medium   | Sol Farina                   | MYM-69  |
| MYM-72 | Detect system preference   | Ready For QA | Medium   | Noelia Magali Gomez          | MYM-69  |

---

## PRs de Implementacion (Referencia)

### PRs Merged (Implementacion)

| PR  | Branch                            | Jira Key(s)      | Status |
| --- | --------------------------------- | ---------------- | ------ |
| #90 | feat/MYM-72/system-theme-detection| MYM-72           | MERGED |
| #82 | fix/MYM-121/multiple-channels-500 | MYM-121          | MERGED |
| #80 | fix/MYM-100/shadcn-select         | MYM-100          | MERGED |
| #79 | fix/MYM-99/rating-percentage      | MYM-99           | MERGED |
| #77 | feat/MYM-19/set-mentor-availability| MYM-19          | MERGED |
| #76 | fix/MYM-85-MYM-87                 | MYM-85, MYM-87   | MERGED |
| #70 | fix/pagination-and-kata-framework | MYM-83           | MERGED |
| #69 | fix/MYM-81/mentors-gallery-photos-v2| MYM-81         | MERGED |
| #65 | feat/MYM-70-71/dark-mode-theme    | MYM-70, MYM-71   | MERGED |
| #64 | feat/MYM-59/mentor-respond-dashboard| MYM-59         | MERGED |
| #63 | feat/MYM-58/message-notifications | MYM-58           | MERGED |
| #62 | feat/MYM-57/conversation-history  | MYM-57           | MERGED |
| #61 | feat/MYM-56/send-message          | MYM-56           | MERGED |

### PRs Open (Shift-Left Documentation)

| PR  | Branch                            | Jira Key(s)      | Type       |
| --- | --------------------------------- | ---------------- | ---------- |
| #89 | test/MYM-14/api-exploratory-testing| MYM-14          | Shift-Left |
| #88 | test/MYM-14/exploratory-db        | MYM-14           | Shift-Left |
| #87 | feat/MYM-14/qa-exploratory-notes  | MYM-14           | Shift-Left |
| #86 | docs/MYM-59-clean-smoke-exploratory-db| MYM-59       | Shift-Left |
| #84 | docs/MYM-57/fase-10-documentation | MYM-57           | Shift-Left |
| #81 | docs/MYM-58/User-Messaging        | MYM-58           | Shift-Left |
| #78 | autotest/MYM-35-view-profiles-reviews| MYM-35        | Shift-Left |

---

## Lista Estrategica de Implementacion

### ✅ FASE 1: Dark Mode Completion - COMPLETADA

| Orden | Key    | Story                    | Status       | PR Impl |
| ----- | ------ | ------------------------ | ------------ | ------- |
| 1     | MYM-72 | Detect system preference | Ready For QA | #90 ✅  |

**Nota:** MYM-70, MYM-71, MYM-72 - Dark Mode Epic completamente implementado!

### FASE 2: Features en Shift-Left QA (esperando PRs)

| Orden | Key    | Story               | Status        | Assignee         |
| ----- | ------ | ------------------- | ------------- | ---------------- |
| 2     | MYM-26 | See earnings record | Shift-Left QA | Melary Vasquez   |

---

## Metricas (2026-02-25)

- **Total US implementadas:** 30 (PRs mergeados en staging)
- **US en QA Approved:** 6 (MYM-6, MYM-30, MYM-35, MYM-57, MYM-58, MYM-70)
- **US en In Test:** 4 (MYM-3, MYM-59, MYM-71, MYM-131)
- **US en Ready For QA:** 22 (listas para testing, incluye MYM-72)
- **US en Shift-Left QA:** 1 (MYM-26)
- **US en Ready For Dev:** 0 ✅
- **US en Backlog:** 1 (MYM-84)
- **Bugs OPEN:** 0 ✅ (todos fixeados!)
- **Bugs Ready For QA:** 24 (fixeados, pendientes de testing)

---

## Bloqueos por Defects (2026-02-25)

> **Ver:** [BUGFIX-ROADMAP.md](./BUGFIX-ROADMAP.md) para tracking completo de bugs

### ✅ User Stories SIN Bloqueos Activos

**No hay bugs OPEN.** Todas las User Stories pueden avanzar sin bloqueos de desarrollo.

### Bugs Ready For QA (Pendientes de Testing)

Los siguientes bugs fueron fixeados y esperan validacion de QA:

| Bug     | Summary                                    | Priority | Afecta a |
| ------- | ------------------------------------------ | -------- | -------- |
| MYM-133 | Availability slots no persisten            | Highest  | MYM-131  |
| MYM-155 | Messages not displayed in thread           | High     | MYM-59   |
| MYM-96  | Widget no realtime update                  | High     | MYM-59   |
| MYM-140 | Mentores sin especialidad ni tarifa        | Low      | MYM-14   |
| MYM-137 | Chat bubbles text wrap issue               | Low      | MYM-59   |
| MYM-128 | Sesion 24h+1min rechazada (> vs >=)        | Low      | MYM-31   |

---

## US en Trabajo Actual

**Status:** ✅ Sin US pendientes de implementacion

Todas las User Stories Ready For Dev han sido implementadas:
- MYM-72 (ultima US implementada) - PR #90 MERGED

### Proximos Pasos:

1. **Esperar QA testing** de las 24 US en Ready For QA
2. **MYM-26** esta en Shift-Left QA - esperar que avance a Ready For Dev
3. **MYM-84** (Backlog) - pendiente de priorizacion

---

## Historial de Actualizaciones

| Fecha      | Cambios                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------- |
| 2026-02-25 | MYM-72 implementado (PR #90) - Dark Mode Epic completado                                   |
| 2026-02-25 | 6 bugs fixeados (MYM-133, MYM-155, MYM-96, MYM-137, MYM-128, MYM-140) - 0 bugs OPEN        |
| 2026-02-25 | **Documento actualizado** - Snapshot actual del estado de MyMentor                         |
| 2026-02-24 | MYM-139 (ratings desync) fixeado con migration para recalcular                             |
| 2026-02-24 | MYM-132 (network crash) fixeado con try/catch                                               |
| 2026-02-24 | MYM-129 (students channels) fixeado con validacion de rol                                   |

---

_Actualizado por Claude Code - 2026-02-25_
