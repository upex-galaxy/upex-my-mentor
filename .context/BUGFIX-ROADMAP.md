# Bugfix & Improvements Roadmap - MyMentor

> **Documento provisional** - Generado: 2026-02-25
> **Ultima actualizacion:** 2026-02-25
> **Proposito:** Tracking de defects, bugs e improvements encontrados durante QA

---

## Instrucciones para Continuar (Contexto IA)

**Para trabajar en bugfixes:**

1. **Ver el bug:** Revisar descripcion, pasos de reproduccion, y evidencia en Jira
2. **Workflow:** Push directo a `staging` (sin crear rama/PR para bugs)
3. **Implementar fix:** Seguir guidelines de `.context/guidelines/DEV/`
4. **Transicionar:** Mover bug a Ready For QA en Jira

**Para trabajar en improvements:**

1. **Ver el improvement:** Revisar descripcion y contexto en Jira
2. **Crear rama:** `feat/MYM-XX/descripcion-corta`
3. **Implementar:** Seguir guidelines de `.context/guidelines/DEV/`
4. **PR a staging:** Crear PR con referencia al improvement

**Comando sugerido para iniciar:**

```
Continua con el BUGFIX-ROADMAP.md - trabaja en MYM-XX
```

---

## Criterios de Transicion de Defects

| Estado           | Significado            | Accion              |
| ---------------- | ---------------------- | ------------------- |
| OPEN             | Bug reportado, sin fix | Priorizar y asignar |
| In Progress      | Fixing activamente     | Esperar fix         |
| Ready For QA     | Fixeado y desplegado   | Re-testear          |
| CLOSED           | Verificado y cerrado   | N/A                 |
| REJECTED         | No es bug / duplicado  | N/A                 |
| Cannot Reproduce | No reproducible        | N/A                 |
| ABORTED          | Abandonado             | N/A                 |

---

## Estado Actual de Defects (2026-02-25)

### ✅ Defects OPEN (Sin Fix) - NINGUNO

**¡Todos los bugs han sido fixeados!** No hay defects OPEN pendientes.

### Defects Ready For QA (Fixeados - Pendientes de Testing)

| Key     | Summary                                        | Priority | Fixeado Por | Fecha Fix  |
| ------- | ---------------------------------------------- | -------- | ----------- | ---------- |
| MYM-133 | Availability slots no persisten cambios        | Highest  | Ely         | 2026-02-25 |
| MYM-155 | Messages not displayed in thread               | High     | Ely         | 2026-02-25 |
| MYM-96  | Widget mensajes no actualiza realtime          | High     | Ely         | 2026-02-25 |
| MYM-92  | Notificaciones Toast no se muestran            | Medium   | Ely         | 2025-12-28 |
| MYM-91  | Inconsistencia contador mensajes Realtime      | Medium   | Ely         | 2025-12-28 |
| MYM-86  | Defectos visuales Light/Dark Mode              | Medium   | Ely         | 2025-12-28 |
| MYM-141 | API GET /api/mentors retorna 404               | Highest  | Ely         | 2026-02-23 |
| MYM-75  | Password validation no permite crear usuario   | Highest  | Ely         | 2026-02-23 |
| MYM-126 | Cancel API no actualiza transactions refunded  | High     | Ely         | 2026-02-24 |
| MYM-83  | Pagination fails with NULL rating              | High     | Ely         | 2026-02-24 |
| MYM-142 | URLs staging incorrectas en docs               | Medium   | Ely         | 2026-02-23 |
| MYM-139 | Rating/reviews desincronizados                 | Medium   | Ely         | 2026-02-24 |
| MYM-140 | Mentores verificados sin especialidad/tarifa   | Low      | Ely         | 2026-02-25 |
| MYM-137 | Chat bubbles text wrap issue                   | Low      | Ely         | 2026-02-25 |
| MYM-128 | Sesion 24h+1min rechazada (> vs >=)            | Low      | Ely         | 2026-02-25 |
| MYM-129 | Estudiantes pueden crear canales comunicacion  | Medium   | Ely         | 2026-02-24 |
| MYM-127 | Emails cancelacion no enviados (config)        | Medium   | Config      | 2026-02-24 |
| MYM-125 | No muestra toast de exito al cancelar          | Medium   | Ely         | 2026-02-24 |
| MYM-124 | Paginacion "Siguiente" no actualiza resultados | Medium   | Ely         | 2026-02-24 |
| MYM-123 | Navegacion inconsistente en settings           | Medium   | Ely         | 2026-02-24 |
| MYM-85  | Send message button non-functional             | Medium   | Ely         | 2026-02-23 |
| MYM-79  | Flujo recuperacion password no funciona        | Medium   | Ely         | 2026-02-23 |
| MYM-77  | Imagenes no cargan en /mentors                 | Medium   | Ely         | 2026-02-23 |
| MYM-46  | Search input no hace trim de espacios          | Medium   | Ely         | 2026-02-23 |

### Defects CLOSED (Verificados)

| Key     | Summary                                        | Priority | Cerrado    |
| ------- | ---------------------------------------------- | -------- | ---------- |
| MYM-132 | App crash on network loss                      | Medium   | 2026-02-24 |
| MYM-122 | Booking RLS permissions error                  | Highest  | 2026-02-23 |
| MYM-121 | Error 500 multiples canales comunicacion       | High     | 2026-02-23 |
| MYM-120 | Stripe Connect pagos no completan flujo        | Highest  | 2026-02-23 |
| MYM-109 | Stripe Connect URLs apuntan a localhost        | Highest  | 2026-02-23 |
| MYM-100 | Select uses native HTML instead of shadcn      | Low      | 2026-02-23 |
| MYM-99  | Rating breakdown no muestra porcentaje         | Low      | 2026-02-23 |
| MYM-97  | Falta enlace a perfil mentee                   | High     | 2026-02-23 |
| MYM-89  | No navegacion a canales comunicacion           | Medium   | 2026-02-23 |
| MYM-88  | Stripe Connect onboarding Error 500            | Highest  | 2026-02-22 |
| MYM-87  | PUT /api/users/me/communication-channels 500   | Highest  | 2026-02-22 |
| MYM-81  | Mentors photos not displayed in gallery        | High     | 2025-12-16 |
| MYM-74  | Login mentor bloqueado en carga                | Highest  | 2025-12-11 |

### Defects REJECTED / Cannot Reproduce / Duplicated

| Key     | Summary                                        | Razon            |
| ------- | ---------------------------------------------- | ---------------- |
| MYM-101 | Flag button no functionality                   | REJECTED (future)|
| MYM-98  | Rating breakdown (duplicado)                   | REJECTED (dup)   |
| MYM-78  | Dashboard widget missing                       | REJECTED         |
| MYM-76  | Staging mezcla sesiones                        | ABORTED          |
| MYM-66  | No auto-login post-registro                    | REJECTED (design)|
| MYM-118 | Solo un slot tras vaciar calendario            | Cannot Reproduce |
| MYM-117 | Boton guardar no persiste                      | Cannot Reproduce |
| MYM-64  | Missing availability page                      | Duplicated       |
| MYM-48  | Filters client-side only                       | REJECTED         |
| MYM-47  | Skill filtering OR vs AND                      | REJECTED         |

---

## Tracking de Fixes Recientes (Sesion 2026-02-25)

### MYM-133 - Availability slots no persisten

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: Time format mismatch (HH:MM:SS vs HH:MM) |
| 2    | Completado | Fix: Normalize time format in toSlots()       |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

### MYM-155 - Messages not displayed in thread

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: ScrollArea ref on Root not Viewport    |
| 2    | Completado | Fix: Access Viewport via data-radix attribute |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

### MYM-96 - Widget no realtime update

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: Polling 30s too slow, no refresh on close |
| 2    | Completado | Fix: 10s polling + refresh on modal close     |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

### MYM-137 - Chat bubbles text wrap

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: Missing break-all for long strings     |
| 2    | Completado | Fix: Added break-all class to message-bubble  |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

### MYM-128 - Sesion 24h+1min rechazada

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: > instead of >= for 24h boundary       |
| 2    | Completado | Fix: Changed to >= in canCancelSession()      |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

### MYM-140 - Mentores sin especialidad/tarifa

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: Data quality - incomplete profiles     |
| 2    | Completado | Fix: Migration to set is_verified=false       |
| 3    | Completado | Applied via Supabase MCP                      |
| 4    | Completado | Transicionado a Ready For QA                  |

---

## Metricas

- **Total Defects OPEN:** 0 ✅ (todos fixeados!)
- **Defects Ready For QA:** 24 (pendientes de testing)
- **Defects CLOSED:** 13 (verificados)
- **Defects REJECTED/Cannot Reproduce:** 10

---

## Proximos Pasos

1. **QA debe re-testear todos los bugs Ready For QA**
2. **Sin bugs OPEN** - podemos continuar con feature development
3. **Feature pendiente:** MYM-26 (Earnings record) en Shift-Left QA

---

## Referencias

- [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) - Roadmap de features
- [ai-work-tracker.md](./ai-work-tracker.md) - Tracking de sesiones de trabajo
- [Jira Board](https://upexgalaxy65.atlassian.net/browse/MYM) - Tablero del proyecto

---

_Actualizado por Claude Code - 2026-02-25_
