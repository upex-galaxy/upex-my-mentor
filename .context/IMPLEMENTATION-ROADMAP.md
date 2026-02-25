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
| MYM-72 | Detect system preference   | Ready For Dev| Medium   | Noelia Magali Gomez          | MYM-69  |

---

## Lista Estrategica de Implementacion

### FASE 1: Dark Mode Completion (1 US pendiente)

| Orden | Key    | Story                    | Status       | Assignee              |
| ----- | ------ | ------------------------ | ------------ | --------------------- |
| 1     | MYM-72 | Detect system preference | Ready For Dev| Noelia Magali Gomez   |

**Nota:** MYM-70 y MYM-71 ya estan QA Approved/In Test. Solo falta MYM-72 para completar Dark Mode.

### FASE 2: Features en Shift-Left QA (esperando PRs)

| Orden | Key    | Story               | Status        | Assignee         |
| ----- | ------ | ------------------- | ------------- | ---------------- |
| 2     | MYM-26 | See earnings record | Shift-Left QA | Melary Vasquez   |

---

## Metricas (2026-02-25)

- **Total US implementadas:** 29 (PRs mergeados en staging)
- **US en QA Approved:** 6 (MYM-6, MYM-30, MYM-35, MYM-57, MYM-58, MYM-70)
- **US en In Test:** 4 (MYM-3, MYM-59, MYM-71, MYM-131)
- **US en Ready For QA:** 21 (listas para testing)
- **US en Shift-Left QA:** 1 (MYM-26)
- **US en Ready For Dev:** 1 (MYM-72)
- **US en Backlog:** 1 (MYM-84)
- **Bugs OPEN:** 5 (1 High, 4 Low/Medium)
- **Bugs Ready For QA:** 15 (fixeados, pendientes de testing)

---

## Bloqueos por Defects (2026-02-25)

> **Ver:** [BUGFIX-ROADMAP.md](./BUGFIX-ROADMAP.md) para tracking completo de bugs

### User Stories SIN Bloqueos Activos

Actualmente no hay User Stories BLOQUEADAS. Los bugs reportados estan siendo resueltos.

### Bugs OPEN (Sin Fix)

| Bug     | Summary                                    | Priority | Afecta a |
| ------- | ------------------------------------------ | -------- | -------- |
| MYM-155 | Messages not displayed in thread           | High     | MYM-59   |
| MYM-96  | Widget no realtime update                  | High     | MYM-59   |
| MYM-140 | Mentores sin especialidad ni tarifa        | Low      | MYM-14   |
| MYM-137 | Chat bubbles text wrap issue               | Low      | MYM-59   |
| MYM-128 | Sesion 24h+1min rechazada (> vs >=)        | Low      | MYM-31   |

### Bugs Ready For QA (Fixeados)

| Bug     | Summary                                    | Priority | Fixeado |
| ------- | ------------------------------------------ | -------- | ------- |
| MYM-141 | API /api/mentors 404                       | Highest  | ✅      |
| MYM-75  | Password validation issue                  | Highest  | ✅      |
| MYM-126 | Cancel API transactions not refunded       | High     | ✅      |
| MYM-83  | Pagination NULL rating                     | High     | ✅      |
| MYM-139 | Rating/reviews desync                      | Medium   | ✅      |
| MYM-142 | Staging URLs incorrectas                   | Medium   | ✅      |
| MYM-129 | Students creating channels                 | Medium   | ✅      |
| MYM-127 | Emails cancelacion (config)                | Medium   | ✅      |
| MYM-125 | Toast de exito cancelar                    | Medium   | ✅      |
| MYM-124 | Paginacion "Siguiente"                     | Medium   | ✅      |
| MYM-123 | Navegacion inconsistente                   | Medium   | ✅      |
| MYM-85  | Send message button                        | Medium   | ✅      |
| MYM-79  | Flujo recuperacion password                | Medium   | ✅      |
| MYM-77  | Imagenes no cargan                         | Medium   | ✅      |
| MYM-46  | Search input trim spaces                   | Medium   | ✅      |

---

## US en Trabajo Actual

**US actual:** MYM-72 - Detect system theme preference
**Status:** Ready For Dev
**Asignada a:** Noelia Magali Gomez (Shift-Left) - Ely (Dev)

### Proximos Pasos:
1. Buscar Test Cases en comentarios de Jira (MYM-72)
2. Seguir workflow de `.prompts/us-dev-workflow.md`
3. Crear rama `feat/MYM-72/detect-system-theme`
4. Implementar deteccion de `prefers-color-scheme`

---

## Historial de Actualizaciones

| Fecha      | Cambios                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------- |
| 2026-02-25 | **Documento creado** - Snapshot inicial del estado de MyMentor                              |
| 2026-02-25 | 10 bugs fixeados en sesion anterior, 2 US desbloqueadas (MYM-14, MYM-31)                   |
| 2026-02-24 | MYM-139 (ratings desync) fixeado con migration para recalcular                             |
| 2026-02-24 | MYM-132 (network crash) fixeado con try/catch                                               |
| 2026-02-24 | MYM-129 (students channels) fixeado con validacion de rol                                   |

---

_Actualizado por Claude Code - 2026-02-25_
