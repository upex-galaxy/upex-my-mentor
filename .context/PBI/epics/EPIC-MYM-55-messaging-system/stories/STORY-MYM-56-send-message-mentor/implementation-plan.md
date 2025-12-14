# Implementation Plan: STORY-MYM-56 - Send Message to Mentor Before Booking

**Fecha:** 2025-12-13
**Developer:** Claude AI
**Story Points:** 8
**Branch:** `feat/MYM-56/send-message`

---

## Overview

Implementar la funcionalidad que permite a un mentee enviar un mensaje directo a un mentor desde su perfil, antes de reservar una sesión. Esta es la story fundacional del Epic de Messaging, que crea el schema de base de datos, RLS policies, y la UI de composición de mensajes.

**Acceptance Criteria a cumplir:**

1. ✅ Mentee autenticado ve botón "Send Message" en perfil de mentor
2. ✅ Click abre modal con textarea para escribir mensaje
3. ✅ Mensaje mínimo 10 caracteres (validación en tiempo real)
4. ✅ Envío crea conversación + mensaje en DB (transacción atómica)
5. ✅ Redirect a `/dashboard/messages/[conversationId]` tras envío exitoso
6. ✅ Usuario no autenticado es redirigido a `/login`
7. ✅ Botón cambia a "View Conversation" si ya existe conversación

---

## Technical Approach

**Chosen approach:** Modal + Server Action + Supabase Realtime-ready tables

**Why this approach:**
- ✅ Modal mantiene contexto del perfil (no saca al usuario de la página)
- ✅ Server Action permite lógica atómica de create conversation + message
- ✅ Tablas preparadas para Realtime (MYM-58 las usará)
- ✅ RLS policies garantizan seguridad sin código adicional
- ❌ Trade-off: Requiere estado client-side para abrir/cerrar modal

**Alternatives considered:**
- Nueva página `/messages/compose`: Rompe flujo UX, requiere más navegación
- Chat widget flotante: Demasiado complejo para MVP

---

## UI/UX Design

### Componentes del Design System a usar:

| Componente | Uso |
|------------|-----|
| `Button` | "Send Message", "Send", "Cancel" |
| `Dialog` | Modal de composición |
| `Textarea` | Input del mensaje |
| `Badge` | (futuro) Indicador de conversación existente |

### Componentes custom a crear:

**1. SendMessageButton**
- **Propósito:** CTA button que verifica auth y abre modal o navega a conversación existente
- **Props:** `mentorId: string`, `mentorName: string`, `existingConversationId?: string`
- **Ubicación:** `src/components/messaging/send-message-button.tsx`
- **Estados:**
  - No auth → Redirect a login
  - No conversación → "Send Message" + abre modal
  - Conversación existe → "View Conversation" + navega

**2. MessageComposerModal**
- **Propósito:** Modal para escribir y enviar primer mensaje
- **Props:** `mentorId: string`, `mentorName: string`, `open: boolean`, `onOpenChange: (open: boolean) => void`
- **Ubicación:** `src/components/messaging/message-composer-modal.tsx`
- **Estados:**
  - Idle: Textarea vacío, botón disabled
  - Valid: 10+ chars, botón enabled
  - Sending: Spinner, disabled
  - Error: Toast con mensaje

### Layout del Modal:

```
┌────────────────────────────────────────────┐
│ Message to [Mentor Name]              [X]  │
├────────────────────────────────────────────┤
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Escribe tu mensaje aquí...             │ │
│ │                                        │ │
│ │                                        │ │
│ │                                        │ │
│ └────────────────────────────────────────┘ │
│ El mensaje debe tener al menos 10 chars    │
│                                            │
├────────────────────────────────────────────┤
│                    [Cancel]  [Send Message]│
└────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading (modal):** Botón con spinner, textarea disabled
- **Empty (future):** Para página de mensajes, no aplica aquí
- **Error:** Toast notification con mensaje
- **Success:** Modal se cierra, redirect a conversación

### Responsividad:

- **Mobile:** Modal full-width con padding
- **Desktop:** Modal max-width 500px, centrado

### Personalidad UI/UX (Bold/Moderno):

- Dialog con `rounded-lg` y `shadow-xl`
- Button primary con hover effect
- Textarea con focus ring `ring-primary`
- Transitions suaves

---

## Types & Type Safety

**Nuevos tipos a agregar en `src/types/messaging.ts`:**

```typescript
// Database types (from Supabase)
export interface ConversationRow {
  id: string
  participant_1_id: string
  participant_2_id: string
  created_at: string
  updated_at: string
}

export interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// API types
export interface SendMessageRequest {
  mentorId: string
  content: string
}

export interface SendMessageResponse {
  success: boolean
  conversationId?: string
  error?: string
}

// Component types
export interface ConversationCheck {
  exists: boolean
  conversationId?: string
}
```

**Actualizar `src/types/supabase.ts`:** Agregar tablas `conversations` y `messages`

---

## Implementation Steps

### **Step 1: Database Migrations**

**Task:** Crear tablas `conversations` y `messages` con RLS policies

**Details:**
- Usar Supabase MCP para aplicar migrations
- Crear tabla `conversations` con UNIQUE constraint ordenado
- Crear tabla `messages` con CHECK de 10 chars mínimo
- Habilitar RLS en ambas tablas
- Crear policies para SELECT, INSERT, UPDATE
- Habilitar Realtime en ambas tablas

**SQL (referencia del feature-implementation-plan):**

```sql
-- conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_participants UNIQUE (participant_1_id, participant_2_id),
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id)
);

-- messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT min_message_length CHECK (length(content) >= 10)
);

-- RLS policies (ver feature-implementation-plan.md para detalles completos)
```

**Testing:**
- Verificar tablas existen en Supabase dashboard
- Test RLS: User A no puede ver conversaciones de User B

**Estimated time:** 30 min

---

### **Step 2: Types & Supabase Types Update**

**Task:** Agregar tipos TypeScript para messaging

**Files:**
- `src/types/messaging.ts` (nuevo)
- `src/types/supabase.ts` (actualizar)
- `src/types/index.ts` (re-exportar)

**Details:**
- Definir interfaces para Conversation, Message, API requests/responses
- Regenerar tipos de Supabase o agregar manualmente las nuevas tablas

**Testing:**
- TypeScript compila sin errores

**Estimated time:** 20 min

---

### **Step 3: Server Actions para Messaging**

**Task:** Crear server actions para enviar mensaje y verificar conversación existente

**File:** `src/lib/actions/messaging.ts`

**Functions:**

```typescript
// Verifica si existe conversación entre usuario actual y mentor
export async function checkExistingConversation(
  mentorId: string
): Promise<ConversationCheck>

// Crea conversación (si no existe) y envía mensaje
export async function sendMessageToMentor(
  data: SendMessageRequest
): Promise<SendMessageResponse>
```

**Logic:**
1. `checkExistingConversation`:
   - Get current user from session
   - Query conversations where current user es participant
   - Retornar `{ exists: true, conversationId }` o `{ exists: false }`

2. `sendMessageToMentor`:
   - Validate content >= 10 chars
   - Get or create conversation (función SQL helper)
   - Insert message
   - Update conversation.updated_at
   - Retornar conversationId para redirect

**Edge cases:**
- User not authenticated → error
- Mentor not found → error
- Message too short → error (double validation)
- Self-message attempt → error

**Testing:**
- Unit test: validation logic
- Integration test: DB operations

**Estimated time:** 45 min

---

### **Step 4: SendMessageButton Component**

**Task:** Crear botón CTA que verifica estado y abre modal o navega

**File:** `src/components/messaging/send-message-button.tsx`

**Props:**
```typescript
interface SendMessageButtonProps {
  mentorId: string
  mentorName: string
}
```

**Logic:**
1. On mount: verificar si existe conversación (server action)
2. Si user no autenticado: onClick → redirect a `/login?redirect=/mentors/${mentorId}`
3. Si conversación existe: Mostrar "View Conversation" → navega a `/dashboard/messages/${id}`
4. Si no existe: Mostrar "Send Message" → abre modal

**States:**
- Loading: Skeleton o spinner pequeño
- Authenticated + No conversation: "Send Message" button
- Authenticated + Has conversation: "View Conversation" button
- Not authenticated: "Send Message" (redirect on click)

**Testing:**
- Component renders correctly for each state

**Estimated time:** 40 min

---

### **Step 5: MessageComposerModal Component**

**Task:** Crear modal de composición de mensaje

**File:** `src/components/messaging/message-composer-modal.tsx`

**Props:**
```typescript
interface MessageComposerModalProps {
  mentorId: string
  mentorName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**UI Elements:**
- Dialog de shadcn/ui
- DialogHeader con título "Message to [Mentor Name]"
- Textarea con placeholder
- Helper text con contador/validación
- DialogFooter con Cancel + Send buttons

**Logic:**
1. State: `content`, `isSubmitting`, `error`
2. Validation: Enable Send button only if content.length >= 10
3. On submit:
   - Set isSubmitting = true
   - Call sendMessageToMentor server action
   - On success: close modal, redirect to conversation
   - On error: show toast, enable form

**Validations:**
- Min 10 chars → "El mensaje debe tener al menos 10 caracteres"
- Show character count: `${content.length}/10 caracteres mínimo`

**Testing:**
- Modal opens/closes correctly
- Validation displays correctly
- Submit flow works

**Estimated time:** 45 min

---

### **Step 6: Integrate into Mentor Profile Page**

**Task:** Agregar SendMessageButton al booking card del mentor profile

**File:** `src/app/mentors/[id]/page.tsx`

**Changes:**
1. Import SendMessageButton
2. Agregar después del botón "Reservar Sesión" en el booking card
3. Pasar props: mentorId, mentorName

**Layout:**
```tsx
<CardContent className="space-y-4">
  <Button data-testid="book_button" className="w-full" size="lg" asChild>
    <Link href={`/mentors/${mentor.id}/book`}>
      <Calendar className="mr-2 h-5 w-5" />
      Reservar Sesión
    </Link>
  </Button>

  {/* NEW: Send Message Button */}
  <SendMessageButton
    mentorId={mentor.id}
    mentorName={mentor.name}
  />

  {/* Existing content... */}
</CardContent>
```

**Edge case:** No mostrar botón si el usuario está viendo su propio perfil (futuro, cuando mentores puedan ver su propio perfil público)

**Testing:**
- Button appears on mentor profile
- Click behavior works as expected

**Estimated time:** 20 min

---

### **Step 7: Create Messages Page (Placeholder)**

**Task:** Crear página básica `/dashboard/messages/[conversationId]` para redirect

**File:** `src/app/dashboard/messages/[conversationId]/page.tsx`

**Content:**
- Placeholder simple que muestra "Conversation {id}"
- Esta página será completada en MYM-57

```tsx
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Conversación</h1>
      <p className="text-muted-foreground">
        Conversación ID: {conversationId}
      </p>
      <p className="mt-4">
        Esta página será completada en MYM-57 (Conversation History).
      </p>
    </div>
  )
}
```

**Testing:**
- Page renders without error
- Route works correctly

**Estimated time:** 15 min

---

### **Step 8: Update Middleware for Protected Routes**

**Task:** Asegurar que `/dashboard/messages/*` requiere autenticación

**File:** `middleware.ts`

**Check:**
- Verificar que el patrón `/dashboard/*` ya está protegido
- Si no, agregar `/dashboard/messages` a rutas protegidas

**Testing:**
- Usuario no autenticado es redirigido a login

**Estimated time:** 10 min

---

### **Step 9: Integration Testing**

**Task:** Verificar flujo completo end-to-end

**Flow:**
1. Usuario no autenticado visita `/mentors/[id]`
2. Click en "Send Message" → Redirect a login
3. Login → Redirect back to mentor profile
4. Click en "Send Message" → Modal abre
5. Escribir mensaje corto → Botón disabled, helper text visible
6. Escribir mensaje válido → Botón enabled
7. Click Send → Spinner, luego redirect a `/dashboard/messages/[id]`
8. Volver a mentor profile → Botón dice "View Conversation"

**Testing:**
- Manual smoke test
- E2E test (si hay setup de Playwright)

**Estimated time:** 30 min

---

## Technical Decisions (Story-specific)

### Decision 1: Modal vs Inline Form

**Chosen:** Modal (Dialog de shadcn)

**Reasoning:**
- ✅ Mantiene contexto del perfil visible
- ✅ UX familiar (muchas apps usan modales para compose)
- ✅ Fácil de cerrar y volver
- ❌ Trade-off: Requiere state management para open/close

### Decision 2: Server Action vs API Route

**Chosen:** Server Action

**Reasoning:**
- ✅ Más simple, menos boilerplate
- ✅ Type-safe by default
- ✅ Integración natural con forms
- ❌ Trade-off: Menos reusable que API route (ok para MVP)

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Supabase configurado con Realtime habilitado
- [x] Auth context funcionando
- [x] shadcn/ui Dialog component (verificar si está instalado)

**Verificar/instalar:**
```bash
# Si Dialog no está instalado:
bunx shadcn@latest add dialog
bunx shadcn@latest add textarea
```

---

## Risks & Mitigations

**Risk 1:** RLS policies mal configuradas
- **Impact:** Critical (privacy breach)
- **Mitigation:** Test explícito con 3 usuarios (A envía a B, C no puede ver)

**Risk 2:** Race condition al crear conversación
- **Impact:** Medium (conversaciones duplicadas)
- **Mitigation:** UNIQUE constraint en DB + upsert logic

**Risk 3:** Usuario intenta enviar mensaje a sí mismo
- **Impact:** Low (UX confusa)
- **Mitigation:** No mostrar botón en propio perfil (edge case)

---

## Estimated Effort

| Step | Task | Time |
|------|------|------|
| 1 | Database Migrations | 30 min |
| 2 | Types Update | 20 min |
| 3 | Server Actions | 45 min |
| 4 | SendMessageButton | 40 min |
| 5 | MessageComposerModal | 45 min |
| 6 | Integrate in Profile | 20 min |
| 7 | Messages Page Placeholder | 15 min |
| 8 | Middleware Update | 10 min |
| 9 | Integration Testing | 30 min |
| **Total** | | **~4.5 hours** |

**Story points:** 8 (matches estimation in story.md)

---

## Definition of Done Checklist

- [ ] **Database:**
  - [ ] `conversations` table created with RLS
  - [ ] `messages` table created with RLS
  - [ ] Realtime enabled on both tables
  - [ ] Helper function `get_or_create_conversation` deployed

- [ ] **Types:**
  - [ ] `src/types/messaging.ts` created
  - [ ] `src/types/supabase.ts` updated
  - [ ] Zero TypeScript errors

- [ ] **Components:**
  - [ ] `SendMessageButton` renders correctly
  - [ ] `MessageComposerModal` opens/closes
  - [ ] Validation works (min 10 chars)
  - [ ] Submit flow works

- [ ] **Integration:**
  - [ ] Button visible on mentor profile
  - [ ] No button on own profile (edge case)
  - [ ] Redirect after send works
  - [ ] "View Conversation" state works

- [ ] **Auth:**
  - [ ] Non-authenticated redirect to login
  - [ ] Return to mentor profile after login

- [ ] **Quality:**
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
  - [ ] Manual smoke test passed

- [ ] **E2E Test Cases (from test-cases.md):**
  - [ ] TC-MYM56-01: Happy path send message
  - [ ] TC-MYM56-02: Send to existing conversation
  - [ ] TC-MYM56-03: Validation (short message)
  - [ ] TC-MYM56-04: Unauthenticated redirect
  - [ ] TC-MYM56-05: API creates conversation + message
  - [ ] TC-MYM56-06: RLS security test

---

*Última actualización: 2025-12-13*
*Generado por Claude Code*
