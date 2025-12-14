# Implementation Plan: STORY-MYM-58 - Message Notifications

**Fecha:** 2025-12-14
**Developer:** Claude AI
**Story Jira Key:** MYM-58
**Epic:** EPIC-MYM-55 - Messaging System
**Story Points:** 5

---

## Overview

Implementar sistema de notificaciones en tiempo real para mensajes nuevos, incluyendo:
- Badge con contador de mensajes no leídos en el Navbar
- Toast notifications cuando llegan mensajes nuevos
- Actualización en tiempo real via Supabase Realtime

**Acceptance Criteria a cumplir:**

1. **AC1:** In-app notification badge con contador de unread messages en navbar
2. **AC2:** Real-time notification update sin refresh de página + toast notification
3. **AC3:** Toast clickable navega a conversación, auto-dismiss después de 5 segundos
4. **AC4:** No mostrar toast si ya estamos en esa conversación activa
5. **AC5:** Badge count actualiza cuando se leen mensajes

---

## Technical Approach

**Chosen approach:** Supabase Realtime con `postgres_changes` + React Context para estado global

**Alternatives considered:**
- **Polling:** Simple pero ineficiente y no es real-time
- **WebSockets custom:** Overkill, Supabase Realtime ya lo maneja

**Why this approach:**
- ✅ Supabase Realtime ya está configurado en el proyecto
- ✅ RLS policies existentes garantizan seguridad
- ✅ Latencia <500ms para actualizaciones
- ✅ Zero setup adicional de infraestructura
- ❌ Trade-off: Requiere manejar reconexiones y estado offline

**Arquitectura:**
```
┌─────────────────────────────────────────────────────────────┐
│                     NotificationProvider                     │
│  - unreadCount: number                                       │
│  - activeConversationId: string | null                       │
│  - refreshUnreadCount(): void                                │
│  - setActiveConversation(id): void                           │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Realtime                         │
│  - Subscribe to messages INSERT                              │
│  - Filter: recipient is current user                         │
│  - Action: update count + show toast                         │
└─────────────────────────────────────────────────────────────┘
```

---

## UI/UX Design

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ Button → `variant="ghost"` + `size="icon"` para MessagesIcon
- ✅ Toast → Para notificaciones de nuevos mensajes (shadcn/ui)
- ✅ Badge → `bg-accent` para contador

### Componentes custom a crear:

**1. NotificationBadge**
- **Propósito:** Badge circular con número de mensajes no leídos
- **Props:** `count: number`
- **Diseño:** Círculo pequeño (`h-5 w-5`) con `bg-accent`, texto blanco, posición absoluta
- **Ubicación:** `src/components/messaging/notification-badge.tsx`

**2. MessagesNavIcon**
- **Propósito:** Icono de mensajes en Navbar con badge integrado
- **Props:** ninguno (usa contexto)
- **Diseño:** MessageCircle icon de lucide + NotificationBadge superpuesto
- **Ubicación:** `src/components/messaging/messages-nav-icon.tsx`

**3. NotificationProvider**
- **Propósito:** Contexto global para estado de notificaciones
- **Ubicación:** `src/contexts/notification-context.tsx`

### Wireframes/Layout:

**MessagesNavIcon en Navbar (Desktop):**
```
┌──────────────────────────────────────────────────────────┐
│ [Logo] | Explorar | Cómo Funciona | [Messages●3] [User▼] │
└──────────────────────────────────────────────────────────┘
                                         ↑
                                    MessagesNavIcon
                                    con badge "3"
```

**Toast Notification:**
```
┌─────────────────────────────────────────┐
│ 🟣 [Avatar] Juan García                 │
│    "Hola, tengo una pregunta sobre..."  │
│                              [5s auto]  │
└─────────────────────────────────────────┘
```

### Estados de UI:

- **Badge visible:** count > 0 → Mostrar número (máx "99+")
- **Badge hidden:** count === 0 → No mostrar badge
- **Toast active:** Nuevo mensaje de conversación inactiva → Mostrar toast
- **Toast suppressed:** Mensaje de conversación activa → No toast

### Responsividad:

- **Mobile:** MessagesNavIcon en menú hamburguesa
- **Desktop:** MessagesNavIcon junto al user info

---

## Types & Type Safety

**Tipos existentes a usar:**
- `MessageRow` - Estructura de mensaje desde DB
- `ConversationWithDetails` - Conversación con participante

**Nuevos tipos a agregar en `src/types/messaging.ts`:**

```typescript
// MYM-58: Notification types
export interface NotificationContextValue {
  unreadCount: number;
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;
  refreshUnreadCount: () => Promise<void>;
}

export interface NewMessagePayload {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface NotificationBadgeProps {
  count: number;
  maxDisplay?: number; // Default 99
}
```

---

## Implementation Steps

### **Step 1: Agregar tipos de notificación**

**Task:** Extender tipos de messaging con interfaces de notificación

**File:** `src/types/messaging.ts`

**Details:**
- Agregar `NotificationContextValue`
- Agregar `NewMessagePayload`
- Agregar `NotificationBadgeProps`
- Export en `src/types/index.ts`

**Testing:**
- TypeScript compile sin errores

---

### **Step 2: Crear NotificationBadge component**

**Task:** Componente visual del badge con contador

**File:** `src/components/messaging/notification-badge.tsx`

**Structure:**
```tsx
interface NotificationBadgeProps {
  count: number;
  maxDisplay?: number;
}

// Display: "3", "12", "99+"
// Hidden when count === 0
```

**Styling:**
- `absolute -top-1 -right-1`
- `h-5 w-5 rounded-full`
- `bg-accent text-accent-foreground`
- `text-xs font-bold`
- Animate pulse cuando count > 0

**Testing:**
- Render con count=0 → no visible
- Render con count=5 → muestra "5"
- Render con count=150 → muestra "99+"

---

### **Step 3: Crear API endpoint para unread count**

**Task:** Endpoint que retorna el conteo de mensajes no leídos

**File:** `src/app/api/messages/unread-count/route.ts`

**Logic:**
```sql
SELECT COUNT(*) FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
  AND m.sender_id != auth.uid()
  AND m.is_read = false
```

**Response:**
```json
{ "count": 5 }
```

**Edge cases:**
- Usuario no autenticado → 401
- Sin mensajes → { "count": 0 }

**Testing:**
- API retorna count correcto
- Respeta RLS policies

---

### **Step 4: Crear NotificationContext y Provider**

**Task:** Contexto global para estado de notificaciones y Supabase Realtime

**File:** `src/contexts/notification-context.tsx`

**Structure:**
```tsx
const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch initial count on mount
  useEffect(() => { fetchUnreadCount(); }, [user]);

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel('new-messages-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, handleNewMessage)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeConversationId]);

  const handleNewMessage = (payload) => {
    // Solo procesar si el mensaje NO es del usuario actual
    // Solo procesar si la conversación incluye al usuario
    // Incrementar count
    // Mostrar toast si no es conversación activa
  };
}
```

**Dependencies:**
- AuthContext para user actual
- useToast para mostrar notificaciones
- Supabase client

**Testing:**
- Count inicial se carga correctamente
- Realtime updates incrementan count
- Toast se muestra para mensajes nuevos
- Toast NO se muestra si conversación activa

---

### **Step 5: Crear MessagesNavIcon component**

**Task:** Icono de mensajes para Navbar con badge integrado

**File:** `src/components/messaging/messages-nav-icon.tsx`

**Structure:**
```tsx
export function MessagesNavIcon() {
  const { unreadCount } = useNotification();

  return (
    <Link href="/dashboard/messages">
      <Button variant="ghost" size="icon" className="relative">
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
      </Button>
    </Link>
  );
}
```

**Testing:**
- Badge visible cuando hay mensajes
- Click navega a /dashboard/messages

---

### **Step 6: Integrar MessagesNavIcon en Navbar**

**Task:** Agregar el icono de mensajes al Navbar para usuarios autenticados

**File:** `src/components/layout/navbar.tsx`

**Changes:**
1. Import `MessagesNavIcon`
2. Agregar dentro del bloque `{user ? (...)}`
3. Posición: antes del user info, después de Dashboard link
4. También agregar en mobile menu

**Desktop layout:**
```tsx
{user && <MessagesNavIcon />}
```

**Mobile layout:**
```tsx
<Link href="/dashboard/messages">
  <Button variant="outline" className="w-full">
    <MessageCircle className="h-4 w-4 mr-2" />
    Mensajes
    {unreadCount > 0 && <span className="ml-2 badge">{unreadCount}</span>}
  </Button>
</Link>
```

**Testing:**
- Icon visible solo para usuarios autenticados
- Badge muestra count correcto

---

### **Step 7: Integrar setActiveConversation en ConversationThread**

**Task:** Marcar conversación como activa cuando se visualiza

**File:** `src/app/dashboard/messages/[conversationId]/page.tsx`

**Changes:**
```tsx
const { setActiveConversation } = useNotification();

useEffect(() => {
  setActiveConversation(conversationId);
  return () => setActiveConversation(null);
}, [conversationId]);
```

**Purpose:**
- Evitar toast para mensajes de la conversación que estamos viendo
- Badge decrementa cuando se marcan mensajes como leídos

---

### **Step 8: Wrapping con NotificationProvider**

**Task:** Envolver la app con NotificationProvider

**File:** `src/app/layout.tsx`

**Changes:**
```tsx
<AuthProvider>
  <NotificationProvider>
    {children}
    <Toaster />
  </NotificationProvider>
</AuthProvider>
```

**Note:** NotificationProvider debe estar dentro de AuthProvider (necesita user context)

---

### **Step 9: Implementar toast con navegación**

**Task:** Toast clickable que navega a la conversación

**Details:**
- Usar `toast()` con action button
- onClick → `router.push(`/dashboard/messages/${conversationId}`)`
- Auto-dismiss después de 5 segundos

**Implementation in NotificationContext:**
```tsx
const router = useRouter();

toast({
  title: senderName,
  description: messagePreview.substring(0, 50) + '...',
  action: (
    <ToastAction
      altText="Ver conversación"
      onClick={() => router.push(`/dashboard/messages/${conversationId}`)}
    >
      Ver
    </ToastAction>
  ),
  duration: 5000,
});
```

---

### **Step 10: Sincronizar count cuando se leen mensajes**

**Task:** Decrementar badge cuando mensajes se marcan como leídos

**Approach:**
1. En `ConversationThread`, después de marcar mensajes como leídos
2. Llamar `refreshUnreadCount()` del contexto

**File:** `src/components/messaging/conversation-thread.tsx`

**Changes:**
```tsx
const { refreshUnreadCount } = useNotification();

// Después de marcar como leídos:
await refreshUnreadCount();
```

---

## Technical Decisions (Story-specific)

### Decision 1: Count de mensajes vs conversaciones

**Chosen:** Contar mensajes no leídos (no conversaciones)

**Reasoning:**
- ✅ Match con los ACs de la story ("count of unread messages")
- ✅ Más granular para el usuario
- ❌ Trade-off: Número puede ser alto si hay muchos mensajes

**Display strategy:** Mostrar "99+" si count > 99

### Decision 2: Filtro de Realtime subscription

**Chosen:** Suscribirse a TODOS los INSERT en messages, filtrar en cliente

**Reasoning:**
- ✅ Supabase Realtime + RLS ya filtra por usuario automáticamente
- ✅ Evita problemas de suscripción a nuevas conversaciones
- ❌ Trade-off: Más eventos procesados en cliente

**Alternative rejected:** Filtro por conversation_ids → No funciona para nuevas conversaciones

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] MYM-56: Tablas `conversations` y `messages` con RLS ✅
- [x] MYM-57: Conversation thread con mark as read ✅
- [x] Toast component (shadcn/ui) ✅
- [x] AuthContext con user ✅

---

## Risks & Mitigations

**Risk 1:** Realtime connection drops / offline users
- **Impact:** Medium - Count desincronizado
- **Mitigation:** Refetch count al reconectar (`visibilitychange` event)

**Risk 2:** Race condition entre toast y navegación
- **Impact:** Low - UX momentánea inconsistente
- **Mitigation:** Toast desaparece al navegar (cleanup en useEffect)

**Risk 3:** Performance con muchos mensajes
- **Impact:** Low - Solo count, no data
- **Mitigation:** Query optimizada con índice en `is_read`

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] AC1: Badge visible en navbar con count correcto
  - [ ] AC2: Real-time update sin refresh + toast
  - [ ] AC3: Toast clickable navega, auto-dismiss 5s
  - [ ] AC4: No toast para conversación activa
  - [ ] AC5: Badge decrementa al leer mensajes
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types`
  - [ ] Props tipadas correctamente
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [ ] Colores del design system (bg-accent para badge)
  - [ ] Bordes rounded-full para badge
  - [ ] Efectos hover coherentes
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Deployed to staging
- [ ] Manual smoke test:
  - [ ] Badge aparece en navbar para usuarios autenticados
  - [ ] Count es correcto
  - [ ] Toast aparece para mensajes nuevos
  - [ ] Click en toast navega correctamente
  - [ ] Badge actualiza en real-time

---

*Generado por Claude Code*
*Última actualización: 2025-12-14*
