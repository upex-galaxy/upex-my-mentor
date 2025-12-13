# Shift-Left Testing Status Report

> **Fecha:** 2025-12-08
> **Proyecto:** Upex My Mentor (MYM)
> **Propósito:** Panorama de User Stories refinadas por Shift-Left Testing

---

## Resumen Ejecutivo

| Métrica | Cantidad |
|---------|----------|
| Total de Stories en repo | 31 |
| Stories con Shift-Left aplicado (Jira) | 23 |
| Implementation plans creados | 18 |
| Implementation plans completados | 20 |
| Implementation plans pendientes | 3 |
| PRs abiertos relacionados | 6 |

---

## User Stories con Shift-Left Testing

Las siguientes 20 US tienen análisis Shift-Left documentado en Jira:
- 17 encontradas via JQL (comentarios con "shift-left")
- 3 adicionales identificadas manualmente (labels `shift-left-reviewed` o texto en descripción)

| Key | Summary | Status Jira | Implementation Plan | PR |
|-----|---------|-------------|---------------------|-----|
| **MYM-3** | User Sign Up | Ready For QA | ✅ en staging | [#18](../../pulls/18) MERGED |
| **MYM-4** | Login/Logout | Ready For QA | ✅ en staging | [#19](../../pulls/19) MERGED |
| **MYM-6** | Mentor Profile | Ready For QA | ✅ en main | [#9](../../pulls/9) MERGED |
| **MYM-7** | Password Reset | In Progress | ✅ Implementado | PR pendiente de crear |
| **MYM-9** | View Pending Applications | Ready For QA | ✅ Completado | [#26](../../pulls/26) MERGED |
| **MYM-10** | Review Application Details | Ready For QA | ✅ Completado | [#32](../../pulls/32) MERGED |
| **MYM-11** | Approve/Reject Application | Ready For QA | ✅ Completado | [#33](../../pulls/33) MERGED |
| **MYM-12** | Email Notification Status | Ready For QA | ✅ Completado | [#35](../../pulls/35) MERGED |
| **MYM-14** | View All Mentors | Ready For QA | ✅ Completado | [#38](../../pulls/38) MERGED |
| **MYM-15** | Search Mentors by Keyword | Ready For QA | ✅ Completado | [#41](../../pulls/41) MERGED |
| **MYM-16** | Filter Mentors by Skills | In Review | ✅ Completado | [#54](../../pulls/54) OPEN |
| **MYM-17** | View Mentor Profile Detail | Ready For QA | ✅ Completado | [#40](../../pulls/40) MERGED |
| **MYM-20** | Timezone Conversion | Ready For QA | ❌ Pendiente | - |
| **MYM-22** | Email Calendar Invite | In Review | ✅ Completado | [#44](../../pulls/44) OPEN |
| **MYM-24** | Session Checkout | Ready For QA | ✅ Completado | [#47](../../pulls/47) MERGED |
| **MYM-25** | Stripe Connect | Ready For QA | ✅ Completado | [#46](../../pulls/46) MERGED |
| **MYM-27** | Automated Payouts | Ready For QA | ✅ Completado | [#50](../../pulls/50) MERGED |
| **MYM-29** | Session Dashboard | Ready For QA | ✅ Completado | [#49](../../pulls/49) MERGED |
| **MYM-30** | Join Video Call | ⏸️ DEPRIORITIZED | ⏸️ En pausa | [#48](../../pulls/48) NO MERGE - Pendiente decisión equipo: ¿Daily.co vs link propio del mentor? |
| **MYM-34** | Mentor Review Mentee | Ready For QA | ✅ Completado | [#43](../../pulls/43) MERGED |
| **MYM-35** | View Profile Reviews | Ready For QA | ✅ Completado | [#42](../../pulls/42) MERGED |
| **MYM-58** | Message Notifications | Shift-Left QA | ❌ Pendiente | - |
| **MYM-19** | Set Mentor Availability | Ready For QA | ✅ Completado | [#10](../../pulls/10) MERGED |
| **MYM-31** | Cancel Session | Ready For QA | ❌ Pendiente | - |
| **MYM-56** | Send Message to Mentor | In Progress | ❌ Pendiente | [#12](../../pulls/12) OPEN |

> **Nota:** MYM-19, MYM-31, MYM-56 tienen Shift-Left documentado con nomenclatura diferente:
> - MYM-19: "Análisis y Diseño de Pruebas (Shift-Left Testing)" en descripción
> - MYM-31: Label `shift-left-reviewed` + "Test Cases" en comentarios
> - MYM-56: Label `shift-left-reviewed` + "QA Refinements (Shift-Left Analysis)" en descripción

---

## Implementation Plans Pendientes (5)

Estas US ya tienen Shift-Left y están listas para crear su `implementation-plan.md`:

### Prioridad Alta (Ready For Dev / In Progress)
1. **MYM-27** - Automated Payouts (EPIC-MYM-23) ← **SIGUIENTE**
2. **MYM-29** - Session Dashboard (EPIC-MYM-28)
3. **MYM-30** - Join Video Call (EPIC-MYM-28)
4. **MYM-31** - Cancel Session (EPIC-MYM-28)
5. **MYM-56** - Send Message to Mentor (EPIC-MYM-55)

### Prioridad Media (Shift-Left QA)
6. **MYM-20** - Timezone Conversion (EPIC-MYM-18)
7. **MYM-58** - Message Notifications (EPIC-MYM-55)

---

## PRs Abiertos Relacionados

| PR | Branch | Story | Estado | Descripción |
|----|--------|-------|--------|-------------|
| #54 | feat/MYM-16/filter-mentors-skills | MYM-16 | OPEN | Filter mentors by skills - Shift-Left + docs |
| #44 | feat/MYM-22/email-calendar-invite | MYM-22 | OPEN | Email confirmation + calendar invite |
| #39 | ale-mym-70 | MYM-70 | OPEN | Theme switching implementation |
| #12 | MYM-56-... | MYM-56 | OPEN | Messaging implementation |
| #8 | test/MYM-27/... | MYM-27 | OPEN | Automated payouts test cases |
| #4 | feature-SLT-MYM7 | MYM-7 | OPEN | Password reset shift-left docs |

**Nota:** PRs #50 (MYM-27), #47 (MYM-24), #49 (MYM-29), #46 (MYM-25) fueron mergeados recientemente.

---

## Branches Pendientes de Merge

Los siguientes implementation plans están en branches feature, no en main:

| Branch | Story | Contenido |
|--------|-------|-----------|
| `feat/MYM-7/password-reset` | MYM-7 | implementation-plan.md |

**Acción requerida:** Crear PRs para mergear estos planes a main/staging.

---

## Stories SIN Shift-Left (8)

Las siguientes US del repo local NO tienen análisis Shift-Left en Jira:

| Epic | Stories sin Shift-Left |
|------|------------------------|
| EPIC-MYM-2 | MYM-5 |
| EPIC-MYM-8 | MYM-10 |
| EPIC-MYM-18 | MYM-21 |
| EPIC-MYM-23 | MYM-24, MYM-26 |
| EPIC-MYM-32 | MYM-33 |
| EPIC-MYM-55 | MYM-57, MYM-59 |

**Nota:** MYM-19, MYM-31 y MYM-56 fueron identificados con Shift-Left usando labels (`shift-left-reviewed`) y texto en descripción, no encontrables via JQL de comentarios.

---

## Orden Recomendado de Implementación por Épica

Basado en el análisis de dependencias entre épicas:

```
EPIC-MYM-2 (Auth) ✅ COMPLETADO
    │
    └──► EPIC-MYM-8 (Vetting) ──► EPIC-MYM-13 (Discovery) ──┬──► EPIC-MYM-18 (Scheduling)
                                                            │           │
                                                            │           ├──► EPIC-MYM-23 (Payments)
                                                            │           │           │
                                                            │           └──► EPIC-MYM-28 (Sessions) ◄── Payments
                                                            │                       │
                                                            │                       └──► EPIC-MYM-32 (Reviews)
                                                            │
                                                            └──► EPIC-MYM-55 (Messaging) [paralelo]
```

### Orden de Implementación

| # | Épica | Nombre | Dependencias | Shift-Left | US Listas para Implementar |
|---|-------|--------|--------------|------------|----------------------------|
| ✅ | EPIC-MYM-2 | Auth & Profiles | Ninguna | 80% (4/5) | ✅ MYM-3, MYM-4, MYM-6, MYM-7 completados |
| ✅ | EPIC-MYM-8 | Mentor Vetting | Auth ✅ | 100% (4/4) | ✅ MYM-9, MYM-10, MYM-11, MYM-12 completados |
| ✅ | EPIC-MYM-13 | Mentor Discovery | Vetting ✅ | 100% (4/4) | ✅ MYM-14, MYM-15, MYM-16, MYM-17 completados |
| **🚧** | EPIC-MYM-18 | Scheduling & Booking | Discovery ✅ | 75% (3/4) | MYM-19 ✅, MYM-22 ✅, MYM-20 |
| **4** | EPIC-MYM-23 | Payments & Payouts | Scheduling | 50% (2/4) | MYM-25, MYM-27 |
| **5** | EPIC-MYM-28 | Session Management | Scheduling + Payments | 100% (3/3) | MYM-29, MYM-30, MYM-31 |
| ✅ | EPIC-MYM-32 | Reviews & Reputation | Sessions | 67% (2/3) | ✅ MYM-34, MYM-35 completados |
| **||** | EPIC-MYM-55 | Messaging (paralelo) | Discovery ✅ | 50% (2/4) | MYM-56, MYM-58 |

> **Leyenda:**
> - ✅ en "US Listas" = Tiene Shift-Left completado en Jira
> - **||** = Puede implementarse en paralelo después de su dependencia

### Detalle por Épica a Implementar

#### 1. EPIC-MYM-8 (Mentor Vetting) - ✅ COMPLETADO
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-9 | View Pending Applications | ✅ Completado | Ready For QA |
| MYM-10 | Review Application Details | ✅ Completado | Ready For QA |
| MYM-11 | Approve/Reject Application | ✅ Completado | Ready For QA |
| MYM-12 | Email Notification Status | ✅ Completado | Ready For QA |

#### 2. EPIC-MYM-13 (Mentor Discovery) - ✅ 100% COMPLETADO
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-14 | View All Mentors | ✅ Completado | Ready For QA |
| MYM-15 | Search Mentors by Keyword | ✅ Completado | Ready For QA |
| MYM-16 | Filter Mentors by Skills | ✅ Completado | In Review | [#54](../../pulls/54)
| MYM-17 | View Mentor Profile Detail | ✅ Completado | Ready For QA |

#### 3. EPIC-MYM-18 (Scheduling & Booking) - 50% COMPLETADO
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-19 | Set Mentor Availability | ✅ Completado | Ready For QA |
| MYM-20 | Timezone Conversion | ✅ Listo | Ready For QA |
| MYM-21 | Book a Session | ❌ Pendiente | - |
| MYM-22 | Email Calendar Invite | ✅ Completado | In Review | [#44](../../pulls/44)

#### 4. EPIC-MYM-23 (Payments & Payouts) - 25% COMPLETADO
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-24 | Session Payment | ❌ Pendiente | - |
| MYM-25 | Stripe Connect | ✅ Completado | Ready For QA | [#46](../../pulls/46) MERGED
| MYM-26 | Platform Fee | ❌ Pendiente | - |
| MYM-27 | Automated Payouts | ✅ Listo | In Progress |

#### 5. EPIC-MYM-28 (Session Management)
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-29 | Session Dashboard | ✅ Listo | Ready For QA |
| MYM-30 | Join Video Call | ✅ Listo | Ready For Dev |
| MYM-31 | Cancel Session | ✅ Listo | Ready For Dev |

#### 6. EPIC-MYM-32 (Reviews & Reputation) - 67% COMPLETADO
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-33 | Leave Review After Session | ❌ Pendiente | - |
| MYM-34 | Mentor Review Mentee | ✅ Completado | Ready For QA |
| MYM-35 | View Profile Reviews | ✅ Completado | Ready For QA |

#### || EPIC-MYM-55 (Messaging - Paralelo)
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-56 | Send Message to Mentor | ✅ Listo | Ready For Dev |
| MYM-57 | View Conversation List | ❌ Pendiente | - |
| MYM-58 | Message Notifications | ✅ Listo | Shift-Left QA |
| MYM-59 | Real-time Message Updates | ❌ Pendiente | - |

---

## Próximos Pasos Recomendados

1. **✅ COMPLETADO: MYM-25** - Stripe Connect (EPIC-MYM-23) - [PR #46](../../pulls/46) MERGED
2. **✅ COMPLETADO: MYM-24** - Session Checkout (EPIC-MYM-23) - [PR #47](../../pulls/47) MERGED
3. **✅ COMPLETADO: MYM-27** - Automated Payouts (EPIC-MYM-23) - [PR #50](../../pulls/50) MERGED
4. **Implementar MYM-31** - Cancel Session (EPIC-MYM-28) ← **SIGUIENTE**
5. **Implementar MYM-56** - Send Message to Mentor (EPIC-MYM-55) - paralelo Messaging
6. **Completar Shift-Left faltante** - MYM-33 (Reviews), MYM-21 (Booking), etc.

> **Última US completada:** MYM-27 (Automated Payouts) - [PR #50](../../pulls/50) MERGED
> **Siguiente US:** MYM-31 (Cancel Session - EPIC-MYM-28)

---

## Distribución por Epic

```
EPIC-MYM-2  (Auth & Profiles):     4/5  con Shift-Left (80%)
EPIC-MYM-8  (Mentor Vetting):      4/4  con Shift-Left (100%) ✅ COMPLETADO
EPIC-MYM-13 (Mentor Discovery):    4/4  con Shift-Left (100%) ✅ COMPLETADO
EPIC-MYM-18 (Scheduling):          3/4  con Shift-Left (75%)  ← +MYM-19
EPIC-MYM-23 (Payments):            2/4  con Shift-Left (50%)
EPIC-MYM-28 (Session Management):  3/3  con Shift-Left (100%) ← +MYM-31
EPIC-MYM-32 (Reviews):             2/3  con Shift-Left (67%)
EPIC-MYM-55 (Messaging):           2/4  con Shift-Left (50%)  ← +MYM-56
─────────────────────────────────────────────────────────
TOTAL:                            23/31 con Shift-Left (74%)
```

---

*Generado automáticamente - Claude Code*
