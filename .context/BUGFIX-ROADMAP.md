# Bugfix & Improvements Roadmap - MyMentor

> **Documento provisional** - Generado: 2026-02-25
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

### Defects OPEN (Sin Fix)

| Key     | Summary                                        | Priority | Afecta a | Assignee |
| ------- | ---------------------------------------------- | -------- | -------- | -------- |
| MYM-155 | Messages not displayed in thread               | High     | MYM-59   | Ely      |
| MYM-96  | Widget de mensajes no actualiza realtime       | High     | MYM-59   | Ely      |
| MYM-140 | Mentores verificados sin especialidad/tarifa   | Low      | MYM-14   | Ely      |
| MYM-137 | Chat bubbles text wrap issue                   | Low      | MYM-59   | Ely      |
| MYM-128 | Sesion 24h+1min rechazada (> vs >=)            | Low      | MYM-31   | Ely      |

### Defects Ready For QA (Fixeados - Pendientes de Testing)

| Key     | Summary                                        | Priority | Fixeado Por | Fecha Fix  |
| ------- | ---------------------------------------------- | -------- | ----------- | ---------- |
| MYM-141 | API GET /api/mentors retorna 404               | Highest  | Ely         | 2026-02-23 |
| MYM-75  | Password validation no permite crear usuario   | Highest  | Ely         | 2026-02-23 |
| MYM-126 | Cancel API no actualiza transactions refunded  | High     | Ely         | 2026-02-24 |
| MYM-83  | Pagination fails with NULL rating              | High     | Ely         | 2026-02-24 |
| MYM-142 | URLs staging incorrectas en docs               | Medium   | Ely         | 2026-02-23 |
| MYM-139 | Rating/reviews desincronizados                 | Medium   | Ely         | 2026-02-24 |
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

---

## User Stories Afectadas por Defects

### Con Defects OPEN (Potencialmente Bloqueantes)

| Story  | Summary                    | Defects OPEN      | Impacto                        |
| ------ | -------------------------- | ----------------- | ------------------------------ |
| MYM-59 | Mentor responds from dash  | MYM-155, MYM-96, MYM-137 | Mensajeria parcialmente rota |
| MYM-31 | Cancel session 24h         | MYM-128           | Edge case (Low priority)       |
| MYM-14 | Gallery of mentors         | MYM-140           | Datos incompletos (Low)        |

**Nota:** MYM-31 y MYM-14 fueron desbloqueadas (Ready For QA). Los bugs OPEN son Low priority edge cases.

### Con Defects Fixeados (Ready For QA)

| Story  | Summary                    | Defects Fixeados  | Estado US    |
| ------ | -------------------------- | ----------------- | ------------ |
| MYM-14 | Gallery of mentors         | MYM-141, MYM-124, MYM-139 | Ready For QA |
| MYM-31 | Cancel session 24h         | MYM-125, MYM-126, MYM-127 | Ready For QA |

---

## Orden de Prioridad para Fixes

### Prioridad 1 - OPEN Alta Prioridad

1. **MYM-155** (High) - Messages not displayed in thread
   - **Problema:** Mensajes enviados solo aparecen en preview "Tu: ..." pero no en el hilo
   - **Impacto:** Feature de mensajeria inutilizable
   - **Afecta:** MYM-59 (Mentor responds from dashboard)
   - **Estado:** OPEN - Pendiente investigacion

2. **MYM-96** (High) - Widget no realtime update
   - **Problema:** Widget de mensajes recientes no actualiza automaticamente
   - **Impacto:** UX degradada, requiere refresh manual
   - **Afecta:** MYM-59 (Messaging)
   - **Estado:** OPEN - Pendiente fix (ya tiene fallback polling implementado)

### Prioridad 2 - OPEN Baja Prioridad (Edge Cases)

3. **MYM-140** (Low) - Mentores sin especialidad/tarifa
   - **Problema:** Algunos mentores verificados no tienen datos completos
   - **Impacto:** Datos inconsistentes, bajo impacto visual
   - **Estado:** OPEN - Data quality issue

4. **MYM-137** (Low) - Chat bubbles text wrap
   - **Problema:** Texto largo sin espacios no hace wrap
   - **Impacto:** Visual, bajo impacto funcional
   - **Estado:** OPEN - CSS fix pendiente

5. **MYM-128** (Low) - Sesion 24h+1min rechazada
   - **Problema:** Comparacion `>` en lugar de `>=` para 24 horas
   - **Impacto:** Edge case boundary, bajo impacto
   - **Estado:** OPEN - Decision de producto pendiente

---

## Tracking de Fixes Recientes (Sesion 2026-02-24)

### MYM-139 - Rating/reviews desincronizados

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: average_rating no calculado de reviews |
| 2    | Completado | Fix: Migration para recalcular desde reviews  |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

### MYM-132 - App crash on network loss

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: Error no manejado en fetch             |
| 2    | Completado | Fix: try/catch en sendReplyToConversation     |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | CLOSED - Verificado                           |

### MYM-129 - Estudiantes pueden crear canales

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: Sin validacion de rol en endpoint      |
| 2    | Completado | Fix: Validacion role === 'mentor' en PUT      |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

### MYM-125 - No muestra toast de exito

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: useToast (shadcn) vs toast (sonner)    |
| 2    | Completado | Fix: Cambio a toast.success de sonner         |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

### MYM-124 - Paginacion "Siguiente" no actualiza

| Paso | Estado     | Notas                                         |
| ---- | ---------- | --------------------------------------------- |
| 1    | Completado | Causa: Logica para rating=0 vs NULL           |
| 2    | Completado | Fix: Separar logica para 0-rated y NULL       |
| 3    | Completado | Push directo a staging                        |
| 4    | Completado | Transicionado a Ready For QA                  |

---

## Metricas

- **Total Defects OPEN:** 5 (2 High, 3 Low)
- **Defects Ready For QA:** 15 (pendientes de testing)
- **Defects CLOSED:** 11 (verificados)
- **Defects REJECTED/Cannot Reproduce:** 8
- **User Stories potencialmente afectadas:** 3 (MYM-59, MYM-31, MYM-14)

---

## Proximos Pasos

1. **Investigar MYM-155** (Messages not displayed)
   - Revisar logica de fetch en conversation view
   - Verificar que mensajes se persisten correctamente

2. **QA debe re-testear:**
   - MYM-141 (API mentors 404) - Asignada a yxsinell
   - MYM-126 (Cancel API refund) - Asignada a Maria Agustina
   - MYM-125 (Toast cancelar) - Asignada a Maria Agustina
   - MYM-124 (Paginacion) - Asignada a yxsinell
   - MYM-139 (Ratings desync) - Asignada a yxsinell

3. **Una vez QA valide los fixes:**
   - MYM-14 puede pasar a QA Approved
   - MYM-31 puede pasar a QA Approved

---

## Referencias

- [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) - Roadmap de features
- [ai-work-tracker.md](./ai-work-tracker.md) - Tracking de sesiones de trabajo
- [Jira Board](https://upexgalaxy65.atlassian.net/browse/MYM) - Tablero del proyecto

---

_Actualizado por Claude Code - 2026-02-25_
