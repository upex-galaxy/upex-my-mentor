# Implementation Plan: STORY-MYM-57 - View Conversation History

**Fecha:** 2025-12-14
**Architect:** Claude AI
**Story Jira Key:** MYM-57
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** Ready for Implementation

---

## Overview

Implementar la funcionalidad de historial de conversaciones para que los usuarios (mentores y estudiantes) puedan ver todas sus conversaciones y acceder al historial completo de mensajes con cada contacto.

**Acceptance Criteria a cumplir:**

1. Lista de conversaciones con avatar, nombre, preview del último mensaje y timestamp relativo
2. Indicador visual (punto azul) para conversaciones con mensajes no leídos
3. Vista de thread con burbujas de mensajes diferenciadas (propias vs. del otro usuario)
4. Marcar como leído automáticamente al abrir una conversación
5. Ordenar conversaciones por actividad más reciente
6. Empty state cuando no hay conversaciones

---

## Technical Approach

**Chosen approach:** Server Components + Client Components híbridos

- Server Components para fetch inicial de datos (SSR)
- Client Components para interactividad (marcar leído, scroll)
- API Routes para operaciones de escritura (mark as read)

**Why this approach:**
- ✅ SSR para mejor SEO y performance inicial
- ✅ Aprovecha tipos existentes de `@/types/messaging`
- ✅ Reutiliza patrón de dashboard existente
- ❌ Trade-off: Requiere coordinación server/client para estado de lectura

---

## UI/UX Design

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ `Card` → Contenedor de lista de conversaciones
- ✅ `Button` → Navegación y CTAs
- ✅ `Badge` → Indicador de no leídos (variante accent)
- ✅ `Avatar` → Fotos de participantes (ya usado en dashboard)
- ✅ `ScrollArea` → Lista de mensajes scrolleable

### Componentes custom a crear:

**1. ConversationList** (`src/components/messaging/conversation-list.tsx`)
- **Propósito:** Lista de conversaciones con preview
- **Props:** `conversations: ConversationWithDetails[]`
- **Estados:** loading (skeleton), empty, data

**2. ConversationListItem** (`src/components/messaging/conversation-list-item.tsx`)
- **Propósito:** Item individual de conversación
- **Props:** `conversation: ConversationWithDetails`, `isActive: boolean`
- **Diseño:** Avatar + Nombre + Preview + Timestamp + Badge no leídos

**3. ConversationThread** (`src/components/messaging/conversation-thread.tsx`)
- **Propósito:** Vista de mensajes de una conversación
- **Props:** `conversationId: string`, `messages: MessageWithSender[]`, `currentUserId: string`
- **Estados:** loading, empty, data

**4. MessageBubble** (`src/components/messaging/message-bubble.tsx`)
- **Propósito:** Burbuja individual de mensaje
- **Props:** `message: MessageWithSender`, `isOwn: boolean`
- **Diseño:** Alineado derecha (propio) o izquierda (otro), colores distintos

**5. EmptyConversations** (`src/components/messaging/empty-conversations.tsx`)
- **Propósito:** Estado vacío para lista de conversaciones
- **Props:** `userRole: 'student' | 'mentor'`

### Wireframes/Layout:

**Lista de Conversaciones (`/dashboard/messages`):**
```
┌──────────────────────────────────────────────────┐
│ Navbar                                           │
├──────────────────────────────────────────────────┤
│ Header: "Mensajes"                               │
├──────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐  │
│ │ [Avatar] Nombre            5m ago    [●]    │  │ <- Unread indicator
│ │          Preview del mensaje...             │  │
│ ├─────────────────────────────────────────────┤  │
│ │ [Avatar] Nombre            Ayer             │  │
│ │          Tú: Mi mensaje...                  │  │
│ ├─────────────────────────────────────────────┤  │
│ │ [Avatar] Nombre            12/12/2025       │  │
│ │          Preview del mensaje...             │  │
│ └─────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────┤
│ Footer                                           │
└──────────────────────────────────────────────────┘
```

**Thread de Conversación (`/dashboard/messages/[id]`):**
```
┌──────────────────────────────────────────────────┐
│ Navbar                                           │
├──────────────────────────────────────────────────┤
│ ← Volver | [Avatar] Nombre del participante     │
├──────────────────────────────────────────────────┤
│         ┌──────────────────────┐                 │
│         │ Mensaje del otro     │ 10:30           │
│         └──────────────────────┘                 │
│                                                  │
│                    ┌──────────────────────┐      │
│           10:35    │ Mi mensaje           │      │
│                    └──────────────────────┘      │
│                                                  │
│         ┌──────────────────────┐                 │
│         │ Otro mensaje         │ 10:40           │
│         └──────────────────────┘                 │
├──────────────────────────────────────────────────┤
│ Footer                                           │
└──────────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton loaders para lista y thread
- **Empty:** Mensaje amigable + CTA a `/mentors` para estudiantes
- **Error:** Toast con mensaje de error + retry
- **Success:** Vista normal con datos

### Personalidad UI/UX aplicada:

**Estilo visual:** Bold/Moderno (consistente con design system)

- Sombras pronunciadas en hover (`shadow-lg`)
- Bordes redondeados (`rounded-lg`)
- Hover effects con transitions
- Burbujas de mensaje: `bg-primary` (propias), `bg-muted` (otro)

---

## Types & Type Safety

**Tipos disponibles en `@/types/messaging`:**
- ✅ `ConversationWithDetails` - Conversación con participante y último mensaje
- ✅ `MessageWithSender` - Mensaje con info del remitente
- ✅ `ConversationParticipant` - Info del participante

**Tipos adicionales para esta story:**

```typescript
// Para props de componentes (agregar en messaging.ts)
export interface ConversationListProps {
  conversations: ConversationWithDetails[]
}

export interface ConversationListItemProps {
  conversation: ConversationWithDetails
  isActive?: boolean
}

export interface ConversationThreadProps {
  conversationId: string
  initialMessages: MessageWithSender[]
  currentUserId: string
  otherParticipant: ConversationParticipant
}

export interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
}
```

---

## Implementation Steps

### **Step 1: Agregar tipos de componentes**

**Task:** Extender `src/types/messaging.ts` con props de componentes

**Details:**
- Agregar interfaces para props de los nuevos componentes
- Mantener consistencia con tipos existentes

**Testing:**
- TypeScript: Sin errores de compilación

---

### **Step 2: Crear MessageBubble component**

**Task:** Componente base para mostrar un mensaje individual

**File:** `src/components/messaging/message-bubble.tsx`

**Structure:**
- Alineación condicional (derecha si es propio, izquierda si es otro)
- Color de fondo diferenciado (`bg-primary` vs `bg-muted`)
- Timestamp formateado (relativo)
- Nombre del remitente (solo si no es propio)

**Edge cases:**
- Mensaje muy largo: word-wrap
- Timestamp relativo vs absoluto según fecha

**Testing:**
- Visual: Renderiza correctamente ambas variantes

---

### **Step 3: Crear ConversationThread component**

**Task:** Vista de thread de mensajes

**File:** `src/components/messaging/conversation-thread.tsx`

**Structure:**
- Header con nombre y avatar del otro participante
- Lista de MessageBubbles en ScrollArea
- Ordenado cronológicamente (más antiguo arriba)
- Auto-scroll al último mensaje

**Edge cases:**
- Conversación sin mensajes (empty state)
- Muchos mensajes (scroll handling)

**Testing:**
- Integration: Renderiza lista de mensajes correctamente

---

### **Step 4: Crear ConversationListItem component**

**Task:** Item individual en lista de conversaciones

**File:** `src/components/messaging/conversation-list-item.tsx`

**Structure:**
- Avatar del otro participante
- Nombre clickeable
- Preview del último mensaje (truncado a 100 chars)
- Timestamp relativo
- Badge de no leídos (punto azul)
- Hover state visual

**Edge cases:**
- Preview de mensaje propio: prefijo "Tú: "
- Sin mensajes: mostrar "Nueva conversación"
- Nombre muy largo: truncar con ellipsis

**Testing:**
- Visual: Estados con/sin no leídos

---

### **Step 5: Crear ConversationList component**

**Task:** Lista completa de conversaciones

**File:** `src/components/messaging/conversation-list.tsx`

**Structure:**
- Lista de ConversationListItem
- Skeleton loader mientras carga
- Empty state si no hay conversaciones

**Testing:**
- Integration: Lista renderiza correctamente

---

### **Step 6: Crear EmptyConversations component**

**Task:** Estado vacío para lista de conversaciones

**File:** `src/components/messaging/empty-conversations.tsx`

**Structure:**
- Icono ilustrativo
- Mensaje: "No tienes conversaciones aún"
- CTA: "Explorar mentores" → `/mentors` (para estudiantes)
- Para mentores: solo mensaje sin CTA

**Testing:**
- Visual: Renderiza según rol

---

### **Step 7: Crear API para obtener conversaciones**

**Task:** Server action para obtener conversaciones del usuario

**File:** `src/lib/actions/messaging.ts` (agregar función)

**Function:** `getConversations(): Promise<ConversationWithDetails[]>`

**Logic:**
1. Obtener userId actual
2. Query conversations donde participant_1_id o participant_2_id = userId
3. Join con profiles para obtener info del otro participante
4. Join con messages para obtener último mensaje y count de no leídos
5. Ordenar por updated_at DESC

**Edge cases:**
- Usuario no autenticado → retornar []
- Error de query → throw/handle

**Testing:**
- Integration: Retorna datos correctos

---

### **Step 8: Crear API para obtener mensajes de conversación**

**Task:** Server action para obtener mensajes de una conversación

**File:** `src/lib/actions/messaging.ts` (agregar función)

**Function:** `getConversationMessages(conversationId: string): Promise<{ messages: MessageWithSender[], otherParticipant: ConversationParticipant } | null>`

**Logic:**
1. Verificar que usuario es participante de la conversación
2. Obtener mensajes ordenados por created_at ASC
3. Join con profiles para sender info
4. Obtener info del otro participante

**Edge cases:**
- Conversación no existe → retornar null
- Usuario no es participante → retornar null (RLS ya lo maneja)

**Testing:**
- Integration: Retorna mensajes correctos

---

### **Step 9: Crear API para marcar mensajes como leídos**

**Task:** Server action para marcar mensajes como leídos

**File:** `src/lib/actions/messaging.ts` (agregar función)

**Function:** `markConversationAsRead(conversationId: string): Promise<void>`

**Logic:**
1. Obtener userId actual
2. UPDATE messages SET is_read = true WHERE conversation_id = conversationId AND sender_id != userId AND is_read = false

**Edge cases:**
- Ya están leídos → no hacer nada
- Conversación no existe → no hacer nada

**Testing:**
- Integration: Actualiza is_read correctamente

---

### **Step 10: Crear página de lista de conversaciones**

**Task:** Página principal de mensajes

**File:** `src/app/dashboard/messages/page.tsx`

**Structure:**
- Server Component
- Layout con Navbar + Footer
- Fetch de conversaciones
- Render ConversationList o EmptyConversations

**Testing:**
- E2E: Navegación y render correcto

---

### **Step 11: Crear página de thread de conversación**

**Task:** Página de detalle de conversación

**File:** `src/app/dashboard/messages/[conversationId]/page.tsx`

**Structure:**
- Server Component para fetch inicial
- Client Component para interactividad
- Marcar como leído al montar
- Botón "Volver" a lista

**Testing:**
- E2E: Navegación y render correcto
- Integration: Mensajes se marcan como leídos

---

### **Step 12: Exportar componentes**

**Task:** Actualizar barrel export

**File:** `src/components/messaging/index.ts`

**Details:**
- Agregar exports de nuevos componentes

---

### **Step 13: Agregar link a Messages en Navbar/Dashboard**

**Task:** Navegación a mensajes desde dashboard

**Files:**
- `src/app/dashboard/page.tsx` - Agregar card/link a mensajes

**Details:**
- Agregar sección "Mensajes" en dashboard con link a `/dashboard/messages`

---

### **Step 14: Verificación y testing**

**Task:** Verificar linting, build, y funcionalidad

**Commands:**
```bash
bun run lint
bun run build
```

**Manual testing:**
- Navegar a /dashboard/messages
- Ver lista de conversaciones
- Click en conversación → ver thread
- Verificar que no leídos se marcan al abrir
- Verificar empty state

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tablas `conversations` y `messages` creadas (MYM-56)
- [x] RLS policies configuradas (MYM-56)
- [x] Tipos base en `@/types/messaging` (MYM-56)
- [x] Action `sendMessageToMentor` existente (MYM-56)

---

## Risks & Mitigations

**Risk 1:** Performance con muchos mensajes
- **Impact:** Medium
- **Mitigation:** Implementar scroll virtual o paginación en v2

**Risk 2:** Estado de lectura no sincronizado
- **Impact:** Low
- **Mitigation:** Marcar al montar + refetch al volver a la lista

---

## Estimated Effort

| Step                          | Time   |
| ----------------------------- | ------ |
| 1. Agregar tipos              | 15min  |
| 2. MessageBubble              | 30min  |
| 3. ConversationThread         | 45min  |
| 4. ConversationListItem       | 30min  |
| 5. ConversationList           | 20min  |
| 6. EmptyConversations         | 15min  |
| 7. API getConversations       | 30min  |
| 8. API getConversationMessages| 30min  |
| 9. API markAsRead             | 20min  |
| 10. Page lista                | 30min  |
| 11. Page thread               | 45min  |
| 12. Exports                   | 5min   |
| 13. Dashboard link            | 15min  |
| 14. Verificación              | 30min  |
| **Total**                     | **~6h**|

**Story points:** 5

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] Lista de conversaciones con avatar, nombre, preview, timestamp
  - [ ] Indicador de no leídos (punto azul)
  - [ ] Thread con burbujas diferenciadas
  - [ ] Marcar como leído automáticamente
  - [ ] Ordenar por actividad reciente
  - [ ] Empty state implementado
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types/messaging`
  - [ ] Props tipadas con ConversationWithDetails, MessageWithSender
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada**
  - [ ] Bordes rounded-lg
  - [ ] Sombras en hover
  - [ ] Colores del design system
- [ ] **Content Writing contextual**
  - [ ] "Mensajes" como título
  - [ ] "No tienes conversaciones aún" en empty state
  - [ ] "Explorar mentores" como CTA
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` pasa
  - [ ] `bun run build` pasa
- [ ] Deployed to staging
- [ ] Manual smoke test:
  - [ ] Lista carga correctamente
  - [ ] Thread muestra mensajes
  - [ ] No leídos funcionan
  - [ ] Empty state visible para usuarios sin conversaciones

---

*Última actualización: 2025-12-14*
*Generado por Claude Code*
