# Implementation Plan: STORY-MYM-59 - Mentor Respond to Messages from Dashboard

**Fecha:** 2025-12-14
**Developer:** Claude AI
**Story Jira Key:** MYM-59
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** In Progress

---

## Overview

Implementar el widget "Recent Messages" en el dashboard de mentores que permite ver y responder mensajes de forma eficiente sin salir del dashboard.

**Acceptance Criteria a cumplir:**
- AC1: Dashboard muestra widget "Recent Messages" con hasta 5 conversaciones
- AC2: Click en conversación permite ver y responder
- AC3: Reply funciona correctamente con notificación al mentee
- AC4: "View All Messages" navega al inbox completo
- AC5: Contexto del mentee visible (nombre, avatar, link a perfil)
- AC6 (Refined): Empty state cuando no hay mensajes
- AC7 (Refined): Real-time updates sin refresh
- AC8 (Refined): Mark as read al abrir conversación

---

## Technical Approach

**Chosen approach:** Crear un componente `RecentMessagesWidget` que reutilice los componentes existentes de MYM-57/58 y se integre en el dashboard existente.

**Alternatives considered:**
- A) Widget con inline reply expandible: Complejidad UI alta, rompe consistencia
- B) Widget que abre modal con conversación completa: Reutiliza componentes, UX familiar

**Why this approach (B):**
- ✅ Reutiliza `ConversationThread` de MYM-57
- ✅ Reutiliza `ConversationListItem` para mostrar previews
- ✅ Usa `NotificationContext` de MYM-58 para real-time
- ✅ UX consistente con el resto del sistema de mensajería
- ❌ Trade-off: Requiere modal overlay en dashboard

---

## Dependencies Analysis

**Pre-requisitos cumplidos (de MYM-56, 57, 58):**
- ✅ Tablas `conversations` y `messages` existen
- ✅ `getConversations()` server action existe
- ✅ `ConversationListItem` componente existe
- ✅ `ConversationThread` componente existe
- ✅ `NotificationContext` con real-time existe
- ✅ `sendMessageToMentor()` action existe

**No se requieren cambios de DB ni nuevas migraciones.**

---

## UI/UX Design

### Componentes a reutilizar

| Componente | De Story | Uso |
|------------|----------|-----|
| `ConversationListItem` | MYM-57 | Items en el widget |
| `ConversationThread` | MYM-57 | Vista de conversación en modal |
| `MessageBubble` | MYM-57 | Mensajes individuales |
| `NotificationContext` | MYM-58 | Real-time updates |
| `Card`, `Dialog`, `Badge` | shadcn/ui | UI base |

### Nuevo componente: RecentMessagesWidget

**Ubicación:** `src/components/messaging/recent-messages-widget.tsx`

**Props:**
```typescript
interface RecentMessagesWidgetProps {
  userId: string
  userRole: 'mentor' | 'student'
}
```

**Estructura:**
```
┌──────────────────────────────────────────────┐
│ CardHeader                                   │
│   [Icon] Recent Messages    [Badge: unread]  │
│   "Your inquiries from students"             │
├──────────────────────────────────────────────┤
│ CardContent                                  │
│   ┌────────────────────────────────────────┐ │
│   │ ConversationListItem (1)               │ │
│   │ Avatar | Name | Preview | Time | Dot   │ │
│   ├────────────────────────────────────────┤ │
│   │ ConversationListItem (2)               │ │
│   ├────────────────────────────────────────┤ │
│   │ ConversationListItem (3)               │ │
│   ├────────────────────────────────────────┤ │
│   │ ... (max 5)                            │ │
│   └────────────────────────────────────────┘ │
│                                              │
│   OR EmptyState if no conversations          │
├──────────────────────────────────────────────┤
│ CardFooter                                   │
│                      [View All Messages →]   │
└──────────────────────────────────────────────┘
```

### Modal para Quick Reply

Al hacer click en una conversación, se abre un Dialog con:
- Header: Mentee info (avatar, name, link to profile)
- Body: `ConversationThread` existente (scrollable)
- Footer: Input para reply + Send button

### Estados de UI

- **Loading:** Skeleton con 3 items placeholder
- **Empty (mentor):** "No inquiries yet. Complete your profile to attract mentees."
- **Empty (student):** "No conversations yet. Send a message to a mentor to start!"
- **Success:** Lista de hasta 5 conversaciones
- **Error:** Toast con retry

### Personalidad UI/UX (Bold/Modern)

- Sombras pronunciadas en hover: `hover:shadow-lg transition-shadow`
- Bordes redondeados: `rounded-lg`
- Badge de unread: `bg-primary text-primary-foreground`
- Gradient accent en header icon background

---

## Types & Type Safety

**Nuevos tipos a agregar en `src/types/messaging.ts`:**

```typescript
// MYM-59: Widget props
export interface RecentMessagesWidgetProps {
  userId: string
  userRole: 'mentor' | 'student' | 'admin'
}

export interface QuickReplyModalProps {
  conversationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  otherParticipant: ConversationParticipant
  onMessageSent: () => void
}
```

**Tipos existentes a reutilizar:**
- `ConversationWithDetails` - para lista de conversaciones
- `ConversationParticipant` - info del otro usuario
- `MessageWithSender` - mensajes con sender info

---

## Implementation Steps

### **Step 1: Add Types for MYM-59**

**Task:** Agregar tipos para el widget y modal

**File:** `src/types/messaging.ts`

**Changes:**
- Agregar `RecentMessagesWidgetProps` interface
- Agregar `QuickReplyModalProps` interface
- Export en `src/types/index.ts`

**Testing:**
- TypeScript compilation passes

---

### **Step 2: Create RecentMessagesWidget Component**

**Task:** Crear el componente principal del widget

**File:** `src/components/messaging/recent-messages-widget.tsx`

**Structure:**
1. Use `getConversations()` server action para fetch inicial
2. Limitar a 5 conversaciones: `.slice(0, 5)`
3. Renderizar con `ConversationListItem` modificado para onClick
4. Empty state condicional por role
5. "View All Messages" link a `/dashboard/messages`
6. Badge con unread count total

**States:**
- Loading: Skeleton
- Empty: EmptyState message
- Data: Lista de items

**Testing:**
- Renderiza correctamente con 0, 1, 5 conversaciones
- Empty state muestra mensaje correcto por role

---

### **Step 3: Create QuickReplyModal Component**

**Task:** Modal para ver conversación y responder

**File:** `src/components/messaging/quick-reply-modal.tsx`

**Structure:**
1. Dialog de shadcn/ui
2. Header con participant info + link to profile
3. Body con ScrollArea + mensajes
4. Footer con Textarea + Send button
5. Uses `sendMessageToMentor()` para enviar
6. Optimistic UI: agregar mensaje inmediatamente

**Features:**
- Mark as read on mount (via `markConversationAsRead`)
- Scroll to bottom on new message
- Loading state on send
- Error handling with toast

**Testing:**
- Modal abre/cierra correctamente
- Mensaje se envía y aparece
- Scroll funciona

---

### **Step 4: Add Real-time Updates to Widget**

**Task:** Integrar con NotificationContext para updates automáticos

**File:** Modificar `recent-messages-widget.tsx`

**Implementation:**
1. Usar `useNotification()` hook existente
2. Escuchar cambios en `unreadCount`
3. Re-fetch conversations cuando hay nuevo mensaje
4. Reordenar lista por `updated_at`

**Edge cases:**
- Nuevo mensaje mientras modal abierto: no mostrar toast (handled by MYM-58)
- Conversación no en top 5 recibe mensaje: aparece en lista

---

### **Step 5: Integrate Widget in Dashboard**

**Task:** Reemplazar el card simple de mensajes con el widget completo

**File:** `src/app/dashboard/page.tsx`

**Changes:**
1. Importar `RecentMessagesWidget`
2. Reemplazar el `Card` de mensajes (líneas 264-283) con el widget
3. Pasar `userId` y `userRole` desde el profile
4. Posicionar en el grid del dashboard

**Layout:**
- Widget ocupa una columna completa
- Debajo de las cards de stats
- Antes del CTA section

---

### **Step 6: Export Component and Final Integration**

**Task:** Exportar en index y verificar build

**Files:**
- `src/components/messaging/index.ts` - agregar exports
- Verificar imports en dashboard

**Testing:**
- `bun run lint` passes
- `bun run build` passes
- Manual test en browser

---

## Technical Decisions (Story-specific)

### Decision 1: Modal vs Navigation for Quick Reply

**Chosen:** Modal overlay

**Reasoning:**
- ✅ Mantiene contexto del dashboard
- ✅ UX más rápida (no page navigation)
- ✅ Reutiliza ConversationThread existente
- ❌ Trade-off: Modal puede sentirse restrictivo en mobile

---

### Decision 2: Fetch Strategy

**Chosen:** Server-side initial fetch + client-side refresh

**Reasoning:**
- ✅ SSR para performance inicial
- ✅ Client refresh via NotificationContext trigger
- ✅ No polling, solo event-driven
- ❌ Trade-off: Requiere pasar data como props

---

## Risks & Mitigations

**Risk 1:** Performance con muchas conversaciones
- **Impact:** Low (limitado a 5)
- **Mitigation:** Ya implementado slice(0, 5)

**Risk 2:** Real-time no funciona
- **Impact:** Medium
- **Mitigation:** Fallback a refresh manual + "Last updated" timestamp

**Risk 3:** Modal conflicto con navigation
- **Impact:** Low
- **Mitigation:** Usar Dialog de Radix (maneja focus trap)

---

## Estimated Effort

| Step | Description | Time |
|------|-------------|------|
| 1 | Add Types | 15 min |
| 2 | RecentMessagesWidget | 45 min |
| 3 | QuickReplyModal | 45 min |
| 4 | Real-time integration | 30 min |
| 5 | Dashboard integration | 20 min |
| 6 | Exports and testing | 15 min |
| **Total** | | **~3 hours** |

**Story points:** 5 (matches story.md)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] AC1: Widget muestra hasta 5 conversaciones
  - [ ] AC2: Click abre modal con conversación
  - [ ] AC3: Reply funciona correctamente
  - [ ] AC4: "View All" navega a inbox
  - [ ] AC5: Contexto de mentee visible
  - [ ] AC6: Empty state implementado
  - [ ] AC7: Real-time updates funcionando
  - [ ] AC8: Mark as read on open
- [ ] **Tipos del backend usados correctamente**
  - [ ] Props tipadas con tipos existentes
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada (Bold/Modern)**
  - [ ] Sombras hover
  - [ ] Bordes redondeados
  - [ ] Badge styling correcto
- [ ] **Test Cases de Shift-Left:**
  - [ ] TC-MYM59-01: View Recent Messages Widget
  - [ ] TC-MYM59-02: Quick Reply from Dashboard
  - [ ] TC-MYM59-03: Empty State
  - [ ] TC-MYM59-04: Real-time Incoming Message
  - [ ] TC-MYM59-05: Truncation of Long Messages
  - [ ] TC-MYM59-07: Navigate to Full Inbox
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Manual smoke test en staging

---

*Última actualización: 2025-12-14*
*Generado por Claude Code*
