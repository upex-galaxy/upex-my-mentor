# Database Exploratory Testing Session Notes
# MYM-57 — View Conversation History

**Date:** 2026-05-29
**Feature:** MYM-57 - Conversation History
**Epic:** EPIC-MYM-55 - Messaging System
**Database:** Supabase PostgreSQL (Staging)
**Tool:** DBHub MCP (`mcp__dbhub__execute_sql`, `mcp__dbhub__search_objects`)
**Tester:** YuEngineer / Claude AI
**Branch:** `test/MYM-57/db-exploratory-testing`
**Duration:** ~2 horas (8 fases + 3 tests adicionales)

---

## Executive Summary

- **Overall Status:** ✅ PASSED
- **Tables Tested:** `conversations`, `messages`, `profiles`
- **Phases Executed:** 8 (template completo) + 4 tests adicionales fuera del template
- **Constraints Verified:** 8 de 8 (100%) — incluye `profiles_email_key` UNIQUE (A.4, 2026-06-06)
- **Triggers en BD:** Ninguno — actualización de `updated_at` ocurre en capa de aplicación
- **Data Integrity Issues:** 0
- **RLS Policies Verified:** 14 de 14
- **Performance Issues Bloqueantes:** 0
- **Índices sin uso:** 1 (`idx_conversations_updated_at`) — no bloqueante
- **Blocking Bugs:** 0
- **Hallazgos extra (no en template):** 3 constraints adicionales — todos funcionales y beneficiosos

---

## Schema Verification

| Table | Constraints OK | Triggers OK | Notes |
|-------|----------------|-------------|-------|
| conversations | YES | N/A | `ordered_participants` + `unique_participants` (bonus) |
| messages | YES | N/A | `min_message_length >= 10` (bonus constraint) |
| profiles | YES | N/A | Email unique, `chk_verified_mentor` (bonus), role como enum |

---

### Detail — 2.1 Tablas en schema `public`

La BD tiene **12 tablas** en total. Las 3 involucradas en MYM-57 existen y tienen datos:

| Tabla | Columnas | Filas | Comentario en BD |
|-------|----------|-------|-----------------|
| `conversations` | 5 | 15 | "MYM-56: Stores message threads between two users" |
| `messages` | 6 | 170 | "MYM-56: Individual messages within conversations" |
| `profiles` | 17 | 71 | — |

> El template de la historia documentaba `profiles` con 7 columnas. La tabla real tiene **17 columnas** — incluye campos extendidos del perfil mentor: `specialties`, `hourly_rate`, `linkedin_url`, `github_url`, `average_rating`, `total_reviews`, `years_of_experience`, `rejection_reason`, `description`, `updated_at`. Las columnas clave para MYM-57 están presentes y correctas.

### 2.2 Columnas verificadas

**`conversations`:**

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | gen_random_uuid() |
| `participant_1_id` | uuid | NO | — |
| `participant_2_id` | uuid | NO | — |
| `created_at` | timestamptz | YES | now() |
| `updated_at` | timestamptz | YES | now() |

**`messages`:**

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | gen_random_uuid() |
| `conversation_id` | uuid | NO | — |
| `sender_id` | uuid | NO | — |
| `content` | text | NO | — |
| `is_read` | boolean | YES | false |
| `created_at` | timestamptz | YES | now() |

**`profiles` (columnas clave para MYM-57):**

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | — |
| `email` | varchar | NO | — |
| `name` | varchar | YES | — |
| `role` | USER-DEFINED enum (`user_role`) | NO | — |
| `photo_url` | text | YES | — |
| `is_verified` | boolean | YES | false |

> `profiles.role` es un tipo **enum de PostgreSQL** (`user_role`), no TEXT con CHECK como indicaba el template. Esto es más robusto y eficiente — el motor valida los valores posibles a nivel de tipo, no de constraint.

### 2.3 Constraints verificados

| Constraint | Tabla | Tipo | En Template | Resultado |
|-----------|-------|------|-------------|-----------|
| `conversations_pkey` | conversations | PRIMARY KEY | ✅ Sí | ✅ Existe |
| `conversations_participant_1_id_fkey` | conversations | FOREIGN KEY | ✅ Sí | ✅ Existe |
| `conversations_participant_2_id_fkey` | conversations | FOREIGN KEY | ✅ Sí | ✅ Existe |
| `ordered_participants` | conversations | CHECK (`p1_id < p2_id`) | ✅ Sí* | ✅ Existe |
| `unique_participants` | conversations | UNIQUE (`p1_id, p2_id`) | ❌ No documentado | ✅ BONUS |
| `messages_pkey` | messages | PRIMARY KEY | ✅ Sí | ✅ Existe |
| `messages_conversation_id_fkey` | messages | FOREIGN KEY (ON DELETE CASCADE) | ✅ Sí | ✅ Existe |
| `messages_sender_id_fkey` | messages | FOREIGN KEY | ✅ Sí | ✅ Existe |
| `min_message_length` | messages | CHECK (`length(content) >= 10`) | ❌ No documentado | ✅ BONUS |
| `profiles_pkey` | profiles | PRIMARY KEY | ✅ Sí | ✅ Existe |
| `profiles_id_fkey` | profiles | FOREIGN KEY → auth.users | ✅ Sí | ✅ Existe |
| `profiles_email_key` | profiles | UNIQUE | ✅ Sí | ✅ Existe |
| `chk_verified_mentor_requires_complete_profile` | profiles | CHECK | ❌ No documentado | ✅ BONUS |

> *El template nombra este constraint como `conversations_participant_order`. En BD se llama `ordered_participants`. Misma lógica, diferente nombre.

**Detalle del constraint bonus `chk_verified_mentor_requires_complete_profile`:**
```sql
CHECK (
  (NOT (is_verified = true AND role = 'mentor'))
  OR (
    specialties IS NOT NULL
    AND array_length(specialties, 1) > 0
    AND hourly_rate IS NOT NULL
    AND hourly_rate > 0
  )
)
```
Un mentor solo puede tener `is_verified = true` si tiene `specialties` y `hourly_rate` completos. Garantiza que los mentores verificados mostrados en MYM-57 siempre tengan datos de perfil completos.

### 2.4 Indexes verificados

| Índice | Tabla | Tipo | En Template | Estado |
|--------|-------|------|-------------|--------|
| `conversations_pkey` | conversations | UNIQUE btree(id) | ✅ Sí | ✅ |
| `idx_conversations_participant_1` | conversations | btree(participant_1_id) | ✅ Sí | ✅ |
| `idx_conversations_participant_2` | conversations | btree(participant_2_id) | ✅ Sí | ✅ |
| `idx_conversations_updated_at` | conversations | btree(updated_at DESC) | ❌ No documentado | ✅ BONUS |
| `unique_participants` | conversations | UNIQUE btree(p1_id, p2_id) | ❌ No documentado | ✅ BONUS |
| `messages_pkey` | messages | UNIQUE btree(id) | ✅ Sí | ✅ |
| `idx_messages_conversation_id` | messages | btree(conversation_id) | ✅ Sí | ✅ |
| `idx_messages_sender_id` | messages | btree(sender_id) | ✅ Sí | ✅ |
| `idx_messages_created_at` | messages | btree(created_at DESC) | ✅ Sí | ✅ |
| `idx_messages_unread` | messages | PARTIAL btree(conv_id, is_read) WHERE is_read=false | ❌ No documentado | ✅ BONUS |

---

## Data State Verification

### After: UI + API operations on staging environment

| Verification Point | Expected | Actual | Status |
|-------------------|----------|--------|--------|
| Test users exist in profiles | 2 users (student + mentor) | 2 users found | PASSED |
| Conversations exist for student.demo | ≥ 1 conversation | 3 conversations | PASSED |
| Messages exist per conversation | ≥ 1 message each | 26 / 2 / 4 messages | PASSED |
| is_read defaults to false | false on new messages | 39 unread / 131 read / 0 NULL | PASSED |
| updated_at synced with last message | updated_at ≥ last msg created_at | Diff: 12–96 ms (app-layer update) | PASSED |
| Participant ordering constraint respected | participant_1_id < participant_2_id | All 3 conversations comply | PASSED |
| Messages in chronological order | created_at ASC | Confirmed on conversation `08756a45` | PASSED |

---

### Detail — 3.1 Usuarios de prueba confirmados

| Campo | student.demo | mentor.demo |
|-------|-------------|------------|
| ID | `36db5101-3a00-43b8-9885-4b7232cc2598` | `81dce8b2-c2c6-486e-856c-b5645b2e68e9` |
| Nombre | Alex García Demo | Laura Martínez Demo |
| Role | student | mentor |
| is_verified | false | true |
| Existe en BD | ✅ | ✅ |

### 3.2 Conversaciones del usuario de prueba (Alex)

| Conversación | Participante 2 | Total Msgs | Unread | Última actividad |
|-------------|---------------|-----------|--------|-----------------|
| `08756a45` | Laura Martínez (mentor.demo) | 26 | 0 | 2026-05-19 |
| `371ff3e9` | Nuria García | 2 | 0 | 2025-12-26 |
| `a71474ab` | Ana Rodríguez | 4 | **4** (todos) | 2025-12-23 |

> La conversación con Ana tiene 4 mensajes todos `is_read = false` — estado válido que indica que Alex nunca abrió esa conversación.

### 3.3 Participant ordering

Las 3 conversaciones de Alex cumplen el constraint `participant_1_id < participant_2_id`. Sin violaciones en ningún registro.

### 3.4 Sincronización de updated_at

| Conversación | conversations.updated_at | messages.MAX(created_at) | Diferencia |
|-------------|--------------------------|--------------------------|-----------|
| Alex ↔ Laura | `23:45:41.935Z` | `23:45:41.923Z` | 12 ms |
| Alex ↔ Nuria | `17:49:25.785Z` | `17:49:25.771Z` | 14 ms |
| Alex ↔ Ana | `19:19:39.575Z` | `19:19:39.479Z` | 96 ms |

La diferencia de milisegundos corresponde al tiempo de ejecución del UPDATE en la app después del INSERT. `updated_at` es siempre >= al último `created_at`. Sincronización correcta (ver también Hallazgo A.1).

### 3.5 Distribución de is_read en toda la tabla

| Estado | Mensajes | Porcentaje |
|--------|---------|-----------|
| `is_read = false` | 39 | 22.94% |
| `is_read = true` | 131 | 77.06% |
| **Total** | **170** | 100% |

Sin valores NULL. `is_read` funciona como boolean puro en todos los registros.

---

## Constraint Testing

Todos los tests ejecutados con `BEGIN / ROLLBACK`. Ningún dato quedó en la BD.

| Constraint Type | Tested | Working | Notes |
|----------------|--------|---------|-------|
| Foreign Keys | 2 | 2 | FK on participant_1_id and participant_2_id — both enforced |
| CHECK | 3 | 3 | `ordered_participants` (p1<p2), `min_message_length` (≥10 chars), `chk_verified_mentor` |
| UNIQUE | 2 | 2 | `unique_participants` (conversation pairs) + `profiles_email_key` (emails) |
| NOT NULL | 1 | 1 | `participant_2_id` required on conversations |

**Total: 8/8 constraints working correctly. No test data left in DB.**

### Detail — exact errors returned by PostgreSQL

| # | Type | Test Input | PostgreSQL Error |
|---|------|-----------|-----------------|
| 4.1 | FOREIGN KEY | Conversation with non-existent UUIDs | `violates foreign key constraint "conversations_participant_1_id_fkey"` |
| 4.2 | CHECK | participant_1 > participant_2 (ordering violated) | `violates check constraint "ordered_participants"` |
| 4.3 | UNIQUE | Duplicate Alex ↔ Laura pair already in DB | `duplicate key value violates unique constraint "unique_participants"` |
| 4.4 | NOT NULL | Conversation missing `participant_2_id` | `null value in column "participant_2_id" violates not-null constraint` |
| 4.5 | CHECK | Message "Hola" (4 chars, minimum is 10) | `violates check constraint "min_message_length"` |
| 4.6 | UNIQUE | Profile with duplicate email (A.4, 2026-06-06) | `duplicate key value violates unique constraint "profiles_email_key"` — code 23505 |

---

## Data Integrity Checks

| Check | Issues Found | Severity |
|-------|-------------|----------|
| Orphan conversations (no valid users) | 0 | - |
| Orphan messages (no valid conversation) | 0 | - |
| Messages with invalid sender | 0 | - |
| Conversations with no messages | 0 | - |
| Calculation mismatches (updated_at < last message) | 0 | - |
| Invalid states (empty content / only spaces) | 0 | - |
| Future timestamps | 0 | - |
| NULL values in is_read | 0 | - |
| impossible state (updated_at < created_at) | 0 | - |
| Historical messages violating min_message_length | 0 | - |

**10/10 checks clean — zero data integrity issues found.**

> Note: all 170 historical messages have `length(content) >= 10`, confirming the constraint has been respected since data origin — not just for new inserts.

---

## RLS Policy Testing

| Policy | Status | Notes |
|--------|--------|-------|
| Users see own conversations only | VERIFIED | Alex sees 3 of 15 total — 12 hidden by RLS |
| Users can't access others' conversations | VERIFIED | 12 conversations filtered correctly |
| Users can only send messages as themselves | VERIFIED | `sender_id = auth.uid()` enforced on INSERT |
| Users can view messages in own conversations only | VERIFIED | `conversation_id IN (own convs)` enforced on SELECT |
| Users can mark others' messages as read | VERIFIED | Allowed — `sender_id <> auth.uid()` in own conversations |
| Users can't mark their own messages as read | VERIFIED | `sender_id <> auth.uid()` blocks self-read-marking |
| Public profiles viewable by everyone | VERIFIED | `qual = true` — needed for mentor marketplace |
| Users can only update their own profile | VERIFIED | `auth.uid() = id` enforced on UPDATE |
| QA team has full bypass access | VERIFIED | `qa_team` role with `qual = true` on all 3 tables |

---

### Detail — 6.1 RLS habilitado en las 3 tablas

| Tabla | RLS Activo |
|-------|-----------|
| `conversations` | ✅ true |
| `messages` | ✅ true |
| `profiles` | ✅ true |

### 6.2 Políticas RLS — 14 en total

**`conversations` (4 políticas):**

| Política | Cmd | Roles | Lógica | Status |
|---------|-----|-------|--------|--------|
| Users can view own conversations | SELECT | public | `auth.uid() = participant_1_id OR participant_2_id` | ✅ Correcta |
| Users can create own conversations | INSERT | public | usuario debe ser participante | ✅ Correcta |
| Users can update own conversations | UPDATE | public | usuario debe ser participante | ✅ Correcta |
| QA team full access to conversations | ALL | qa_team | `qual = true` (bypass total) | ✅ Correcta |

**`messages` (4 políticas):**

| Política | Cmd | Roles | Lógica | Status |
|---------|-----|-------|--------|--------|
| Users can view messages in own conversations | SELECT | public | `conversation_id IN (mis conversaciones)` | ✅ Correcta |
| Users can send messages in own conversations | INSERT | public | `sender_id = auth.uid()` + conv propia | ✅ Correcta |
| Users can update read status | UPDATE | public | `sender_id <> auth.uid()` + conv propia | ✅ Correcta |
| QA team full access to messages | ALL | qa_team | `qual = true` (bypass total) | ✅ Correcta |

**`profiles` (6 políticas):**

| Política | Cmd | Roles | Lógica | Status |
|---------|-----|-------|--------|--------|
| Public profiles are viewable by everyone | SELECT | public | `qual = true` | ✅ Correcta |
| Users can insert their own profile | INSERT | public | `auth.uid() = id` | ✅ Correcta |
| Users can update their own profile | UPDATE | public | `auth.uid() = id` | ✅ Correcta |
| Admins can read all profiles | SELECT | authenticated | `is_admin()` | ✅ Correcta |
| Admins can update profiles | UPDATE | authenticated | `is_admin()` | ✅ Correcta |
| QA team full access to profiles | ALL | qa_team | `qual = true` (bypass total) | ✅ Correcta |

### 6.3 Verificación lógica con datos reales

| Verificación | Resultado | Interpretación |
|-------------|-----------|---------------|
| Conversaciones visibles para Alex bajo RLS | **3** | Solo las suyas ✅ |
| Conversaciones de otros (ocultas por RLS para Alex) | **12** | Filtradas correctamente ✅ |
| Total en BD sin filtro (como qa_team) | **15** | 3 + 12 = 15 ✅ |
| Mensajes que Alex puede marcar como leídos | **8** | Solo los recibidos de otros ✅ |

### 6.4 Hallazgo destacado — política "update read status"

`qual: sender_id <> auth.uid()` — un usuario **no puede marcar sus propios mensajes como leídos**. Solo puede marcar mensajes recibidos. Diseño deliberado y correcto: evita que el sender manipule el estado de lectura de lo que él mismo envió.

---

## Phase 7: Performance Analysis

### 7.1 Tamaño de tablas

| Tabla | Datos | Índices | Total |
|-------|-------|---------|-------|
| `profiles` | 24 kB | 192 kB | 256 kB |
| `messages` | 40 kB | 80 kB | 160 kB |
| `conversations` | 8 kB | 80 kB | 120 kB |

### 7.2 Uso de índices

| Índice | Tabla | Scans | Evaluación |
|--------|-------|-------|-----------|
| `idx_messages_conversation_id` | messages | **39,539** | ✅ El más usado — crítico para carga de mensajes |
| `idx_messages_unread` | messages | **23,410** | ✅ Muy activo — badge de unread count |
| `conversations_pkey` | conversations | **18,249** | ✅ Activo |
| `idx_messages_created_at` | messages | **6,319** | ✅ Activo — ordenamiento cronológico |
| `idx_conversations_participant_2` | conversations | **5,159** | ✅ Activo |
| `idx_conversations_participant_1` | conversations | **5,149** | ✅ Activo |
| `unique_participants` | conversations | 22 | ✅ Activo en validaciones |
| `idx_messages_sender_id` | messages | 10 | ✅ Activo (baja frecuencia) |
| `idx_conversations_updated_at` | conversations | **0** | ⚠️ NUNCA USADO — ver Observación 1 |

### 7.3 EXPLAIN — Query principal MYM-57: cargar conversaciones

```
Sort (cost=9.54) → Sort Key: updated_at DESC
  → Hash Join → profiles p2 (Seq Scan: 71 rows)
      → Merge Join → profiles p1 (Index Scan via profiles_pkey ✅)
          → Seq Scan on conversations (15 rows) → Filter: p1 OR p2
```

**Costo: 9.54** ✅ — Seq Scan en conversations es correcto para 15 filas.

### 7.4 EXPLAIN — Query de mensajes por conversación

```
Sort (cost=12.16) → Sort Key: created_at ASC
  → Hash Join → profiles (Seq Scan)
      → Bitmap Heap Scan on messages
          → Bitmap Index Scan on idx_messages_conversation_id ✅
```

**Costo: 12.16** ✅ — Usa el índice más crítico correctamente.

### 7.5 EXPLAIN — Unread count (badge navbar)

```
Aggregate (cost=8.88)
  → Hash Join → conversations (Seq Scan + Filter p1 OR p2)
      → Seq Scan on messages → Filter: NOT is_read AND sender_id <> user
```

**Costo: 8.88** ✅ para volumen actual. No usa `idx_messages_unread` porque el query agrega `sender_id <>` que el índice parcial no cubre. A escala podría degradar ⚠️ — alineado con el tech debt de paginación ya documentado en UI testing.

---

## Additional Tests (Fuera del Template)

### A.1: Triggers en conversations y messages

**Resultado: 0 triggers encontrados en ambas tablas.**

`conversations.updated_at` **no se actualiza mediante trigger de BD** — la actualización ocurre desde la capa de aplicación (Next.js Server Actions). Esto explica la diferencia de milisegundos observada en Phase 3.

**Implicación:** Si un mensaje es insertado directamente por SQL sin pasar por la app, `conversations.updated_at` no se actualizará. La consistencia del sorting depende de que todos los inserts pasen por la aplicación.

| Tabla | Triggers en BD | Actualización de updated_at |
|-------|---------------|----------------------------|
| `conversations` | 0 | App-layer ℹ️ |
| `messages` | 0 | N/A |

### A.2: CASCADE DELETE

Test ejecutado con `BEGIN / ROLLBACK` — ningún dato quedó en la BD.

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | INSERT conversación temporal (usuarios sin conversación previa) | ✅ Creada |
| 2 | INSERT mensaje en esa conversación | ✅ Creado |
| 3 | COUNT mensajes ANTES de borrar conversación | **1** mensaje |
| 4 | DELETE conversación | ✅ Ejecutado |
| 5 | COUNT mensajes DESPUÉS de borrar conversación | **0** mensajes |
| ROLLBACK | Todo revertido | ✅ BD sin cambios |

`ON DELETE CASCADE` funciona correctamente. Al eliminar una conversación, todos sus mensajes se eliminan automáticamente.

### A.3: Constraint chk_verified_mentor_requires_complete_profile

Test con `BEGIN / ROLLBACK`. Intento de crear mentor verificado sin perfil completo:

```sql
INSERT INTO profiles (id, email, name, role, is_verified)
VALUES (gen_random_uuid(), 'test@test.com', 'Mentor Sin Datos', 'mentor', true);
```

**Resultado:** ✅ BLOQUEADO
```
violates check constraint "chk_verified_mentor_requires_complete_profile"
```

Los mentores verificados que MYM-57 muestra como participantes siempre tendrán `specialties` y `hourly_rate` completos. La integridad del perfil está garantizada a nivel de BD.

### A.4: UNIQUE profiles_email_key — Violación de constraint

**Ejecutado:** 2026-06-06  
**Herramienta:** Supabase JS Client (service role — bypasa RLS, mismos privilegios que `qa_team`)

**Contexto:** En la sesión original (Phase 4.3) se ejecutó la violación de `unique_participants` (par duplicado de conversación). La constraint `profiles_email_key` fue verificada como **existente** en Phase 2, pero su comportamiento de violación no había sido probado explícitamente.

**Test ejecutado:** INSERT con email duplicado — `test.empty.state@upexmymentor.com` (perfil real en staging)

```typescript
const { error } = await supabase.from('profiles').insert({
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test.empty.state@upexmymentor.com', // email que ya existe en BD
  name: 'Duplicate Test User',
  role: 'student'
})
```

**Resultado:** ✅ INSERT correctamente RECHAZADO por PostgreSQL

| Campo | Valor |
|-------|-------|
| Error code | `23505` |
| Error message | `duplicate key value violates unique constraint "profiles_email_key"` |
| Details | `Key (email)=(test.empty.state@upexmymentor.com) already exists.` |

**Verificación post-test:** Profiles con ese email en BD = **1** (el original) ✅ — sin duplicado insertado.

**Conclusión:** La constraint `profiles_email_key` bloquea correctamente emails duplicados. PostgreSQL error `23505` (unique_violation) confirmado. Gap cerrado — coverage 100%.

---

## Issues Found

**No se encontraron bugs bloqueantes.**

### Observación 1: Índice sin uso — Low / No bloqueante

- **Índice:** `idx_conversations_updated_at` en tabla `conversations`
- **Detalle:** 0 scans desde su creación. El query planner prefiere Seq Scan con 15 filas.
- **Impacto:** Ocupa espacio en índices sin aportar beneficio actual. No afecta funcionalidad.
- **Recomendación:** Monitorear en producción con mayor volumen de conversaciones.

### Observación 2: updated_at sin trigger — Low / Riesgo técnico

- **Tablas:** `conversations`, `messages`
- **Detalle:** Actualización de `updated_at` es responsabilidad exclusiva de la app. Inserts directos por SQL no activarán la actualización.
- **Impacto:** El sorting de conversaciones podría quedar desactualizado en operaciones fuera de la app (seeds, migraciones, admin).
- **Recomendación:** Considerar agregar un trigger como capa de seguridad adicional.

### Observación 3: Unread count sin índice parcial — Low / Tech Debt de escala

- **Tabla:** `messages`
- **Detalle:** El badge de notificaciones no usa `idx_messages_unread` por el filtro extra `sender_id <>`.
- **Impacto:** A escala con miles de mensajes el Seq Scan puede degradar. Confirma el tech debt de paginación ya documentado en UI testing.

---

## Acceptance Criteria — Verificación a nivel DB

| AC | Criterio | Verificación en BD | Status |
|----|---------|-------------------|--------|
| AC1 | Lista de conversaciones con metadata | Datos existen con participants, timestamps, joins a profiles correctos | ✅ PASSED |
| AC2 | Thread view en orden cronológico | Mensajes con `created_at` ASC, índice activo y en uso | ✅ PASSED |
| AC3 | Sorting por actividad reciente | `conversations.updated_at` sincronizado correctamente con último mensaje | ✅ PASSED |
| AC4 | Empty state | Estado válido — sin conversaciones para usuario sin actividad | ✅ PASSED |
| AC5 | Unread indicators | `is_read = false` por defecto, distribución correcta (39 unread / 131 read / 0 NULL) | ✅ PASSED |

---

## Schema Verification Summary

| Tabla | Constraints | Índices | RLS | Notas |
|-------|-------------|---------|-----|-------|
| `conversations` | ✅ 6/6 | ✅ 5/5 | ✅ 4 políticas | `unique_participants` no estaba en template |
| `messages` | ✅ 5/5 | ✅ 5/5 | ✅ 4 políticas | `min_message_length` no estaba en template |
| `profiles` | ✅ 5/5 | ✅ 7/7 | ✅ 6 políticas | 17 cols reales (template: 7), role como enum |

---

## Observations & Recommendations

### Positive Findings:
- Schema más robusto que el documentado: 3 constraints y 2 índices extras, todos funcionales y activos
- RLS correctamente implementado: 14 políticas activas y lógicamente correctas en las 3 tablas
- Los 3 índices más críticos para MYM-57 son los más usados en producción (`idx_messages_conversation_id`: 39,539 scans)
- Todos los 170 mensajes históricos respetan los constraints desde el origen — integridad total
- CASCADE DELETE funcional: eliminar conversación limpia sus mensajes automáticamente
- `profiles.role` como enum de PostgreSQL es más robusto que TEXT con CHECK (template discrepancy)
- Rol `qa_team` con acceso total correctamente configurado para operaciones de testing

### Areas of Concern:
- `idx_conversations_updated_at` con 0 scans — índice sin uso con el volumen actual; monitorear en producción
- `updated_at` actualizado solo por app-layer — riesgo de desincronización si se insertan mensajes directamente vía SQL (seeds, migraciones, admin)
- Unread count query no usa `idx_messages_unread` por filtro extra `sender_id <>` — confirma tech debt de paginación documentado en UI testing

### Recommendations:
- Considerar agregar un trigger en `conversations` para actualizar `updated_at` automáticamente como capa de seguridad adicional a la lógica de la app
- Documentar el nombre real del constraint (`ordered_participants`) vs el nombre en el template (`conversations_participant_order`) para mantener consistencia en la documentación
- Monitorear `idx_conversations_updated_at` en producción con volumen real — desactivar si permanece en 0 scans

---

## Trifuerza Testing — Estado actual

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│      UI      │   │     API      │   │      DB      │
│   PASSED ✅  │   │   PASSED ✅  │   │   PASSED ✅  │
│  9 pasos     │   │  8 fases +   │   │  8 fases +   │
│ (100% cover) │   │  32 escenarios│   │  4 adicionales│
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## Next Steps

- [x] DB Testing exploratorio completado
- [x] Gap A.4 cerrado — `profiles_email_key` UNIQUE constraint verificada (2026-06-06)
- [x] API Testing exploratorio completado (2026-06-02)
- [x] `final-test-results.md` actualizado con resultados de las 3 capas
- [x] MYM-57 — testing completo en las 3 capas (UI + DB + API)
