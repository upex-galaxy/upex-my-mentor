# Feature Implementation Plan: EPIC-MYM-55 - Messaging System

**Fecha:** 2025-12-13
**Architect:** Claude AI
**Epic Jira Key:** MYM-55
**Status:** Draft

---

## Overview

Esta feature implementa un sistema de mensajería directa entre mentores y estudiantes, permitiendo comunicación pre-reserva y post-sesión. Es un componente crítico para construir confianza y reducir fricción en el marketplace.

**Alcance:**
- **MYM-56**: Send Message to Mentor Before Booking (Foundation)
- **MYM-57**: View Conversation History
- **MYM-58**: Receive Message Notifications
- **MYM-59**: Mentor Respond from Dashboard

**Stack técnico:**
- Frontend: Next.js 15 (App Router) + React 19
- Backend: Supabase (PostgreSQL + Realtime + RLS)
- Styling: TailwindCSS + shadcn/ui
- Real-time: Supabase Realtime (postgres_changes)
- Validation: Zod
- Deployment: Vercel + Supabase Cloud

---

## Technical Decisions

### Decision 1: Estrategia de Real-time

**Options considered:**
- A) Polling cada N segundos (simple pero ineficiente)
- B) Supabase Realtime con `postgres_changes` (CDC)
- C) WebSockets custom

**Chosen:** B) Supabase Realtime con `postgres_changes`

**Reasoning:**
- ✅ Ya configurado en el proyecto (zero setup adicional)
- ✅ Integración nativa con RLS (seguridad garantizada)
- ✅ Latencia baja (<500ms para mensajes nuevos)
- ✅ Documentación oficial soporta filtros por tabla y evento
- ❌ Trade-off: Requiere configurar Realtime en las tablas nuevas

**Implementation notes:**
```typescript
// Suscripción a nuevos mensajes en una conversación
const channel = supabase.channel(`conversation:${conversationId}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
    (payload) => {
      // Agregar mensaje al state
    }
  )
  .subscribe()
```

---

### Decision 2: Creación de Conversación y Primer Mensaje

**Options considered:**
- A) Dos endpoints separados: `POST /conversations` + `POST /messages`
- B) Endpoint único atómico: `POST /conversations/messages` (upsert)

**Chosen:** B) Endpoint único atómico

**Reasoning:**
- ✅ Evita conversaciones huérfanas (sin mensajes)
- ✅ Transacción única garantiza atomicidad
- ✅ UX más simple (un click = conversación + mensaje)
- ❌ Trade-off: Lógica más compleja en el backend

**Implementation notes:**
```typescript
// API: POST /api/conversations
// Si ya existe conversación entre usuarios → agregar mensaje
// Si no existe → crear conversación + mensaje en transacción
```

---

### Decision 3: Estructura de Base de Datos

**Chosen:** Dos tablas separadas: `conversations` y `messages`

**Reasoning:**
- ✅ Normalización correcta
- ✅ Permite metadata en conversaciones (updated_at, last_message_preview)
- ✅ Facilita queries de "lista de conversaciones" con último mensaje
- ✅ RLS más simple por tabla

**Schema (definido en epic.md):**
```sql
-- conversations: Tracks threads between two participants
-- UNIQUE constraint on (participant_1_id, participant_2_id)

-- messages: Individual messages with FK to conversations
-- CHECK constraint: length(content) >= 10
```

---

### Decision 4: Componentes UI para Mensajería

**Options considered:**
- A) Página completa nueva `/messages`
- B) Modal/Drawer desde perfil de mentor + página de mensajes en dashboard
- C) Chat widget flotante

**Chosen:** B) Modal desde perfil + página en dashboard

**Reasoning:**
- ✅ Modal mantiene contexto del perfil (no saca al usuario)
- ✅ Dashboard page para gestión completa de conversaciones
- ✅ Mejor UX mobile (modal optimizado)
- ❌ Trade-off: Dos UIs a mantener (modal + page)

**Implementation notes:**
- `SendMessageButton` + `MessageComposerModal` en `/mentors/[id]`
- `/dashboard/messages` para lista de conversaciones
- `/dashboard/messages/[conversationId]` para thread completo

---

### Decision 5: Estado de Lectura (is_read)

**Options considered:**
- A) Marcar como leído cuando el mensaje es visible (IntersectionObserver)
- B) Marcar como leído cuando se abre la conversación
- C) Marcar manualmente (botón)

**Chosen:** B) Marcar como leído cuando se abre la conversación

**Reasoning:**
- ✅ Simple de implementar
- ✅ UX estándar (similar a WhatsApp Web, Slack)
- ✅ Performance: una query UPDATE en vez de múltiples
- ❌ Trade-off: Menos preciso que IntersectionObserver

**Implementation notes:**
```typescript
// Al montar ConversationThread:
await supabase
  .from('messages')
  .update({ is_read: true })
  .eq('conversation_id', conversationId)
  .neq('sender_id', currentUserId)
  .eq('is_read', false)
```

---

## Types & Type Safety

**Tipos disponibles:**
- `src/lib/database.types.ts` - Tipos generados desde Supabase
- `src/lib/types.ts` - Type helpers del proyecto

**Nuevos tipos para esta feature:**

```typescript
// src/lib/types.ts (agregar)

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

// Helper types para UI
export interface ConversationWithParticipant extends Conversation {
  other_participant: Pick<Profile, 'id' | 'name' | 'photo_url' | 'role'>
  last_message?: Pick<Message, 'content' | 'created_at' | 'is_read'>
  unread_count: number
}

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'name' | 'photo_url'>
}
```

**Directiva para todas las stories:**
- ✅ Importar tipos desde `@/lib/types`
- ✅ Props de componentes tipadas con tipos del backend
- ✅ Zero type errors relacionados a entidades

---

## UI/UX Design Strategy

### Componentes shadcn/ui a usar

| Componente | Uso en esta feature |
|------------|---------------------|
| `Dialog` | Modal de composición de mensaje |
| `Button` | Send Message, View Conversation, Send |
| `Textarea` | Input de mensaje |
| `Avatar` | Fotos de participantes |
| `Badge` | Indicador de mensajes no leídos |
| `Card` | Contenedor de conversaciones |
| `ScrollArea` | Lista de mensajes con scroll |
| `Skeleton` | Loading states |
| `Toast` | Confirmación de mensaje enviado |

### Componentes custom a nivel feature

**1. SendMessageButton**
- **Usado por:** MYM-56
- **Propósito:** CTA en perfil de mentor para iniciar conversación
- **Ubicación:** `src/components/messaging/send-message-button.tsx`
- **Estados:** "Send Message" (nueva) / "View Conversation" (existente)

**2. MessageComposerModal**
- **Usado por:** MYM-56
- **Propósito:** Modal para escribir y enviar mensaje
- **Ubicación:** `src/components/messaging/message-composer-modal.tsx`

**3. ConversationList**
- **Usado por:** MYM-57, MYM-59
- **Propósito:** Lista de conversaciones con preview
- **Ubicación:** `src/components/messaging/conversation-list.tsx`

**4. ConversationThread**
- **Usado por:** MYM-57
- **Propósito:** Vista de mensajes de una conversación
- **Ubicación:** `src/components/messaging/conversation-thread.tsx`

**5. MessageBubble**
- **Usado por:** MYM-57
- **Propósito:** Burbuja individual de mensaje
- **Ubicación:** `src/components/messaging/message-bubble.tsx`

**6. NotificationBadge**
- **Usado por:** MYM-58
- **Propósito:** Badge con contador de no leídos en Navbar
- **Ubicación:** `src/components/messaging/notification-badge.tsx`

**7. MessagesWidget**
- **Usado por:** MYM-59
- **Propósito:** Widget de mensajes recientes en dashboard mentor
- **Ubicación:** `src/components/messaging/messages-widget.tsx`

### Consistencia visual

**Paleta aplicada (del design system):**
- Primary: `bg-primary` - Botón "Send", burbujas propias
- Secondary: `bg-secondary` - Botón "View Conversation"
- Muted: `bg-muted` - Burbujas del otro participante
- Accent: `bg-accent` - Badge de no leídos

**Patrones de diseño:**
- Todas las cards usan `hover:shadow-lg transition-shadow`
- Bordes redondeados: `rounded-lg` (consistente con design system)
- Espaciado: `p-4`, `gap-4` (múltiplos de 4)

### Flujos de UX

**Flujo 1: Mentee envía primer mensaje**
1. Mentee en `/mentors/[id]` → Click "Send Message"
2. Modal se abre → Escribe mensaje (min 10 chars)
3. Click "Send" → Spinner + disabled
4. Éxito → Toast + Redirect a `/dashboard/messages/[conversationId]`
5. En próxima visita al perfil → Botón dice "View Conversation"

**Flujo 2: Usuario ve sus conversaciones**
1. Usuario en `/dashboard/messages`
2. Lista de conversaciones con preview del último mensaje
3. Badge indica no leídos por conversación
4. Click en conversación → Thread completo
5. Mensajes se marcan como leídos automáticamente

**Flujo 3: Mentor recibe mensaje (realtime)**
1. Mentor en cualquier página de la app
2. Nuevo mensaje llega via Supabase Realtime
3. Badge en Navbar incrementa
4. Toast notifica "Nuevo mensaje de [Nombre]"
5. Click en toast → Navega a conversación

**Estados globales:**
- **Loading:** Skeleton con forma de lista/mensajes
- **Empty (sin conversaciones):** "No tienes conversaciones aún. Explora mentores para comenzar."
- **Error:** Toast con "Error al cargar mensajes. Intenta de nuevo."

### Personalidad UI/UX

**Estilo visual:** Moderno/Bold (del design system)

Aplicar en TODAS las stories:
- Sombras pronunciadas en hover (`shadow-lg`)
- Bordes redondeados (`rounded-lg`)
- Hover effects con transitions
- Gradientes sutiles en headers

---

## Content Writing Strategy

**Vocabulario del dominio (de PRD):**
- "Mentor" / "Mentee" (no "usuario")
- "Sesión" / "Reserva" (no "cita")
- "Enviar mensaje" / "Responder"
- "Conversación" (no "chat")

**Textos contextuales:**

| Ubicación | Texto |
|-----------|-------|
| Botón perfil | "Enviar mensaje" / "Ver conversación" |
| Modal título | "Mensaje a [Nombre del Mentor]" |
| Placeholder | "Escribe tu mensaje aquí..." |
| Validación | "El mensaje debe tener al menos 10 caracteres" |
| Toast éxito | "Mensaje enviado correctamente" |
| Empty state | "No tienes conversaciones aún" |
| Empty CTA | "Explorar mentores" |

---

## Shared Dependencies

**Todas las stories requieren:**

1. **Supabase Realtime**
   - Habilitado en proyecto (ya configurado)
   - Configurar replicación en tablas `conversations` y `messages`

2. **Nuevas tablas en DB:**
   - `conversations` con RLS
   - `messages` con RLS

3. **Environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` (existente)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (existente)

4. **Rutas protegidas (middleware):**
   - `/dashboard/messages/*` - requiere auth

---

## Architecture Notes

### Folder Structure

```
src/
├── app/
│   ├── api/
│   │   └── conversations/
│   │       ├── route.ts            # POST: crear/enviar mensaje
│   │       └── [id]/
│   │           ├── route.ts        # GET: obtener conversación
│   │           └── messages/
│   │               └── route.ts    # POST: enviar mensaje a conversación existente
│   └── dashboard/
│       └── messages/
│           ├── page.tsx            # Lista de conversaciones
│           └── [conversationId]/
│               └── page.tsx        # Thread de conversación
├── components/
│   └── messaging/
│       ├── send-message-button.tsx
│       ├── message-composer-modal.tsx
│       ├── conversation-list.tsx
│       ├── conversation-thread.tsx
│       ├── message-bubble.tsx
│       ├── notification-badge.tsx
│       └── messages-widget.tsx
├── hooks/
│   ├── use-conversations.ts        # Hook para lista de conversaciones
│   ├── use-conversation.ts         # Hook para una conversación
│   └── use-unread-count.ts         # Hook para contador global
└── lib/
    └── messaging/
        └── actions.ts              # Server actions para mensajes
```

### Design Patterns

1. **Real-time Subscriptions:** Usar `useEffect` con cleanup para suscripciones Supabase
2. **Optimistic Updates:** Mostrar mensaje inmediatamente, confirmar con respuesta del server
3. **Infinite Scroll:** Para conversaciones con muchos mensajes (pagination cursor-based)

### Third-party Libraries

- **Supabase Realtime** (incluido en @supabase/supabase-js) - Real-time CDC
- **date-fns** (ya instalado) - Formateo de timestamps
- **lucide-react** (ya instalado) - Iconos (MessageCircle, Send)

---

## Implementation Order

**Recomendado:**

1. **MYM-56: Send Message to Mentor** (FOUNDATION)
   - Razón: Crea schema de DB, RLS, API base, y UI de composición
   - Dependencias: Ninguna
   - Entregable: Mentee puede enviar primer mensaje

2. **MYM-57: Conversation History** (CORE)
   - Razón: Construye sobre MYM-56, agrega vistas de lectura
   - Dependencias: MYM-56
   - Entregable: Lista de conversaciones + thread view

3. **MYM-58: Message Notifications** (REAL-TIME)
   - Razón: Agrega capa de real-time sobre estructura existente
   - Dependencias: MYM-56, MYM-57
   - Entregable: Badge + toasts + real-time updates

4. **MYM-59: Mentor Dashboard Widget** (INTEGRATION)
   - Razón: Integra messaging con dashboard existente
   - Dependencias: MYM-56, MYM-57
   - Entregable: Widget de mensajes recientes + quick reply

**Nota:** MYM-58 y MYM-59 pueden desarrollarse en paralelo después de MYM-57.

---

## Database Migrations

### Migration 1: Create conversations table

```sql
-- 001_create_conversations_table.sql
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate conversations between same users
  CONSTRAINT unique_participants UNIQUE (participant_1_id, participant_2_id),
  -- Ensure participant_1_id < participant_2_id to normalize order
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id)
);

-- Index for faster lookups by participant
CREATE INDEX idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Policy: Authenticated users can create conversations they're part of
CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
```

### Migration 2: Create messages table

```sql
-- 002_create_messages_table.sql
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Minimum message length
  CONSTRAINT min_message_length CHECK (length(content) >= 10)
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_unread ON public.messages(conversation_id, is_read) WHERE is_read = FALSE;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON public.messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );

-- Policy: Users can send messages in their conversations
CREATE POLICY "Users can send messages in own conversations" ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );

-- Policy: Users can mark messages as read in their conversations
CREATE POLICY "Users can update read status" ON public.messages
  FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Only allow updating is_read field
    sender_id = sender_id AND
    content = content AND
    conversation_id = conversation_id
  );

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

### Migration 3: Helper function for finding/creating conversation

```sql
-- 003_create_conversation_helpers.sql

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  user_a_id UUID,
  user_b_id UUID
) RETURNS UUID AS $$
DECLARE
  p1_id UUID;
  p2_id UUID;
  conv_id UUID;
BEGIN
  -- Normalize order (smaller UUID first)
  IF user_a_id < user_b_id THEN
    p1_id := user_a_id;
    p2_id := user_b_id;
  ELSE
    p1_id := user_b_id;
    p2_id := user_a_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE participant_1_id = p1_id AND participant_2_id = p2_id;

  -- If not found, create new
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (p1_id, p2_id)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Risks & Mitigations

### Risk 1: Real-time Connection Instability

**Impact:** High - Users miss messages
**Likelihood:** Medium - Especially on mobile
**Mitigation:**
- Implementar lógica de reconexión automática
- Al reconectar, refetch estado desde API (no solo depender de CDC)
- Mostrar indicador de conexión en UI

### Risk 2: RLS Policy Misconfiguration

**Impact:** Critical - Privacy breach
**Likelihood:** Low - Si se revisan bien
**Mitigation:**
- Escribir tests específicos para RLS
- User C intenta acceder a conversación de A-B → debe fallar
- Code review enfocado en policies

### Risk 3: Spam/Abuse

**Impact:** High - UX degradada para mentores
**Likelihood:** Medium - Sistema público
**Mitigation:**
- Rate limiting: max 10 mensajes/hora a nuevos contactos
- Reportar mensaje (v2)
- Bloquear usuario (v2)

### Risk 4: Performance con Muchos Mensajes

**Impact:** Medium - UX lenta
**Likelihood:** Medium - Conversaciones largas
**Mitigation:**
- Paginación cursor-based (no offset)
- Índices en created_at
- Lazy loading / infinite scroll

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las stories implementadas y deployed
- [ ] **Base de datos:**
  - [ ] Tablas `conversations` y `messages` creadas
  - [ ] RLS policies implementadas y testeadas
  - [ ] Realtime habilitado en ambas tablas
- [ ] **Tipos del backend aplicados:**
  - [ ] Tipos `Conversation` y `Message` en `@/lib/types`
  - [ ] Zero type errors en toda la feature
- [ ] **UI/UX consistente:**
  - [ ] Design system aplicado (colores, spacing, shadows)
  - [ ] Responsive en mobile y desktop
- [ ] **Funcionalidad:**
  - [ ] Mentee puede enviar mensaje desde perfil
  - [ ] Usuario puede ver lista de conversaciones
  - [ ] Usuario puede ver thread de mensajes
  - [ ] Notificaciones en tiempo real funcionando
  - [ ] Mentor puede responder desde dashboard
- [ ] **Performance:**
  - [ ] Mensajes entregados en <500ms
  - [ ] Lista de conversaciones carga en <1s
  - [ ] Badge actualiza en <200ms
- [ ] **Build y linting:**
  - [ ] `bun run build` exitoso
  - [ ] `bun run lint` sin errores

---

*Última actualización: 2025-12-13*
*Generado por Claude Code*
