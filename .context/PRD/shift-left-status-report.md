# Shift-Left Testing Status Report

> **Fecha:** 2025-12-02
> **Proyecto:** Upex My Mentor (MYM)
> **Propósito:** Panorama de User Stories refinadas por Shift-Left Testing

---

## Resumen Ejecutivo

| Métrica | Cantidad |
|---------|----------|
| Total de Stories en repo | 31 |
| Stories con Shift-Left aplicado (Jira) | 20 |
| Implementation plans creados | 5 |
| Implementation plans completados | 4 |
| Implementation plans pendientes | 15 |
| PRs abiertos relacionados | 4 |

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
| **MYM-10** | Review Application Details | In Progress | ✅ Completado | PR pendiente |
| **MYM-11** | Approve/Reject Application | Estimation | ❌ Pendiente | - |
| **MYM-12** | Email Notification Status | Estimation | ❌ Pendiente | - |
| **MYM-14** | View All Mentors | In Progress | ❌ Pendiente | - |
| **MYM-20** | Timezone Conversion | Ready For QA | ❌ Pendiente | - |
| **MYM-22** | Email Calendar Invite | Ready For Dev | ❌ Pendiente | - |
| **MYM-25** | Stripe Connect | Ready For Dev | ❌ Pendiente | - |
| **MYM-27** | Automated Payouts | In Progress | ❌ Pendiente | [#8](../../pulls/8) OPEN |
| **MYM-29** | Session Dashboard | Ready For QA | ❌ Pendiente | - |
| **MYM-30** | Join Video Call | Estimation | ❌ Pendiente | - |
| **MYM-34** | Mentor Review Mentee | Shift-Left QA | ❌ Pendiente | - |
| **MYM-35** | View Profile Reviews | In Progress | ❌ Pendiente | [#3](../../pulls/3) MERGED |
| **MYM-58** | Message Notifications | Shift-Left QA | ❌ Pendiente | - |
| **MYM-19** | Set Mentor Availability | In Progress | ❌ Pendiente | [#10](../../pulls/10) OPEN |
| **MYM-31** | Cancel Session | Ready For QA | ❌ Pendiente | - |
| **MYM-56** | Send Message to Mentor | In Progress | ❌ Pendiente | [#12](../../pulls/12) OPEN |

> **Nota:** MYM-19, MYM-31, MYM-56 tienen Shift-Left documentado con nomenclatura diferente:
> - MYM-19: "Análisis y Diseño de Pruebas (Shift-Left Testing)" en descripción
> - MYM-31: Label `shift-left-reviewed` + "Test Cases" en comentarios
> - MYM-56: Label `shift-left-reviewed` + "QA Refinements (Shift-Left Analysis)" en descripción

---

## Implementation Plans Pendientes (16)

Estas US ya tienen Shift-Left y están listas para crear su `implementation-plan.md`:

### Prioridad Alta (Ready For Dev / In Progress)
1. **MYM-9** - View Pending Applications (EPIC-MYM-8)
2. **MYM-14** - View All Mentors (EPIC-MYM-13)
3. **MYM-19** - Set Mentor Availability (EPIC-MYM-18)
4. **MYM-22** - Email Calendar Invite (EPIC-MYM-18)
5. **MYM-25** - Stripe Connect (EPIC-MYM-23)
6. **MYM-27** - Automated Payouts (EPIC-MYM-23)
7. **MYM-29** - Session Dashboard (EPIC-MYM-28)
8. **MYM-31** - Cancel Session (EPIC-MYM-28)
9. **MYM-35** - View Profile Reviews (EPIC-MYM-32)
10. **MYM-56** - Send Message to Mentor (EPIC-MYM-55)

### Prioridad Media (Estimation / Shift-Left QA)
11. **MYM-11** - Approve/Reject Application (EPIC-MYM-8)
12. **MYM-12** - Email Notification Status (EPIC-MYM-8)
13. **MYM-20** - Timezone Conversion (EPIC-MYM-18)
14. **MYM-30** - Join Video Call (EPIC-MYM-28)
15. **MYM-34** - Mentor Review Mentee (EPIC-MYM-32)
16. **MYM-58** - Message Notifications (EPIC-MYM-55)

---

## PRs Abiertos Relacionados

| PR | Branch | Story | Estado | Descripción |
|----|--------|-------|--------|-------------|
| #12 | MYM-56-... | MYM-56 | OPEN | Messaging implementation |
| #10 | feature/MYM-19-... | MYM-19 | OPEN | Mentor availability tests |
| #8 | test/MYM-27/... | MYM-27 | OPEN | Automated payouts test cases |
| #4 | feature-SLT-MYM7 | MYM-7 | OPEN | Password reset shift-left docs |

**Nota:** MYM-19 y MYM-56 tienen PRs y fueron verificados - ambos tienen Shift-Left documentado con nomenclatura alternativa (labels y descripción).

---

## Branches Pendientes de Merge

Los siguientes implementation plans están en branches feature, no en main:

| Branch | Story | Contenido |
|--------|-------|-----------|
| `feat/MYM-7/password-reset` | MYM-7 | implementation-plan.md |

**Acción requerida:** Crear PRs para mergear estos planes a main/staging.

---

## Stories SIN Shift-Left (11)

Las siguientes US del repo local NO tienen análisis Shift-Left en Jira:

| Epic | Stories sin Shift-Left |
|------|------------------------|
| EPIC-MYM-2 | MYM-5 |
| EPIC-MYM-8 | MYM-10 |
| EPIC-MYM-13 | MYM-15, MYM-16, MYM-17 |
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
| **1** | EPIC-MYM-8 | Mentor Vetting | Auth ✅ | 75% (3/4) | MYM-9 ✅, MYM-11, MYM-12 |
| **2** | EPIC-MYM-13 | Mentor Discovery | Vetting | 25% (1/4) | MYM-14 ✅ |
| **3** | EPIC-MYM-18 | Scheduling & Booking | Discovery | 75% (3/4) | MYM-19 ✅, MYM-20, MYM-22 |
| **4** | EPIC-MYM-23 | Payments & Payouts | Scheduling | 50% (2/4) | MYM-25, MYM-27 ✅ |
| **5** | EPIC-MYM-28 | Session Management | Scheduling + Payments | 100% (3/3) | MYM-29, MYM-30, MYM-31 |
| **6** | EPIC-MYM-32 | Reviews & Reputation | Sessions | 67% (2/3) | MYM-34, MYM-35 ✅ |
| **||** | EPIC-MYM-55 | Messaging (paralelo) | Discovery | 50% (2/4) | MYM-56 ✅, MYM-58 |

> **Leyenda:**
> - ✅ en "US Listas" = Tiene Shift-Left completado en Jira
> - **||** = Puede implementarse en paralelo después de su dependencia

### Detalle por Épica a Implementar

#### 1. EPIC-MYM-8 (Mentor Vetting) - SIGUIENTE
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-9 | View Pending Applications | ✅ Listo | Ready For QA |
| MYM-10 | Admin Dashboard | ❌ Pendiente | - |
| MYM-11 | Approve/Reject Application | ✅ Listo | Estimation |
| MYM-12 | Email Notification Status | ✅ Listo | Estimation |

#### 2. EPIC-MYM-13 (Mentor Discovery)
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-14 | View All Mentors | ✅ Listo | In Progress |
| MYM-15 | Search Mentors by Specialty | ❌ Pendiente | - |
| MYM-16 | Filter Mentors | ❌ Pendiente | - |
| MYM-17 | View Mentor Profile Detail | ❌ Pendiente | - |

#### 3. EPIC-MYM-18 (Scheduling & Booking)
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-19 | Set Mentor Availability | ✅ Listo | In Progress |
| MYM-20 | Timezone Conversion | ✅ Listo | Ready For QA |
| MYM-21 | Book a Session | ❌ Pendiente | - |
| MYM-22 | Email Calendar Invite | ✅ Listo | Ready For Dev |

#### 4. EPIC-MYM-23 (Payments & Payouts)
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-24 | Session Payment | ❌ Pendiente | - |
| MYM-25 | Stripe Connect | ✅ Listo | Ready For Dev |
| MYM-26 | Platform Fee | ❌ Pendiente | - |
| MYM-27 | Automated Payouts | ✅ Listo | In Progress |

#### 5. EPIC-MYM-28 (Session Management)
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-29 | Session Dashboard | ✅ Listo | Ready For QA |
| MYM-30 | Join Video Call | ✅ Listo | In Progress |
| MYM-31 | Cancel Session | ✅ Listo | Ready For QA |

#### 6. EPIC-MYM-32 (Reviews & Reputation)
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-33 | Leave Review After Session | ❌ Pendiente | - |
| MYM-34 | Mentor Review Mentee | ✅ Listo | Shift-Left QA |
| MYM-35 | View Profile Reviews | ✅ Listo | In Progress |

#### || EPIC-MYM-55 (Messaging - Paralelo)
| US | Summary | Shift-Left | Status Jira |
|----|---------|------------|-------------|
| MYM-56 | Send Message to Mentor | ✅ Listo | In Progress |
| MYM-57 | View Conversation List | ❌ Pendiente | - |
| MYM-58 | Message Notifications | ✅ Listo | Shift-Left QA |
| MYM-59 | Real-time Message Updates | ❌ Pendiente | - |

---

## Próximos Pasos Recomendados

1. **Implementar EPIC-MYM-8** - Comenzar con MYM-9 (View Pending Applications)
2. **Completar Shift-Left faltante** - Para US sin análisis en cada épica antes de implementar
3. **Mergear branches pendientes** - MYM-7 tiene plan listo en branch

> **Última US completada:** MYM-10 (Review Application Details) - PR pendiente 2025-12-05
> **Siguiente US:** MYM-11 (Approve/Reject Application)

---

## Distribución por Epic

```
EPIC-MYM-2  (Auth & Profiles):     4/5  con Shift-Left (80%)
EPIC-MYM-8  (Mentor Vetting):      3/4  con Shift-Left (75%)
EPIC-MYM-13 (Mentor Discovery):    1/4  con Shift-Left (25%)
EPIC-MYM-18 (Scheduling):          3/4  con Shift-Left (75%)  ← +MYM-19
EPIC-MYM-23 (Payments):            2/4  con Shift-Left (50%)
EPIC-MYM-28 (Session Management):  3/3  con Shift-Left (100%) ← +MYM-31
EPIC-MYM-32 (Reviews):             2/3  con Shift-Left (67%)
EPIC-MYM-55 (Messaging):           2/4  con Shift-Left (50%)  ← +MYM-56
─────────────────────────────────────────────────────────
TOTAL:                            20/31 con Shift-Left (65%)
```

---

*Generado automáticamente - Claude Code*
