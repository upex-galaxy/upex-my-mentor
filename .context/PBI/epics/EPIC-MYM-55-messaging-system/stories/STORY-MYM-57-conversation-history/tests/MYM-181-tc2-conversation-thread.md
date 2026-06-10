# MYM-181: MYM-57: TC2: Validate conversation thread displays all messages in chronological order when conversation has messages from both participants

**Jira:** [MYM-181](https://upexgalaxy69.atlassian.net/browse/MYM-181)
**Status:** CANDIDATE
**Type:** E2E (UI → Server Action → DB)
**Priority:** Critical
**Related Story:** MYM-57
**Parent:** MYM-108 (Test Repository)
**ROI Score:** 35.0
**Covers:** AC2 (thread with full message history in chronological order)

---

## ⚠️ Bugs Previos (área de MAYOR riesgo de regresión)

- **MYM-155 (High, Closed):** Sent messages NOT displayed in conversation thread — exactamente el comportamiento que este test protege
- **MYM-137 (Low, Closed):** Chat bubbles fail to wrap long continuous text strings
- Riesgo futuro: MYM-58 (notifications/realtime) tocará el rendering y merge de mensajes

## Código de Implementación

| Archivo | Propósito |
|---------|-----------|
| src/app/(main)/dashboard/messages/[conversationId]/page.tsx | Thread page (Server Component) |
| src/lib/actions/messaging.ts | Server Action `getConversationMessages` |
| src/components/messaging/conversation-thread.tsx | Thread container |
| src/components/messaging/message-bubble.tsx | Message bubble (sender, content, timestamp) |

## Arquitectura

- **Data Fetching:** SSR via Supabase Server Client + Server Action (NO API REST de Next.js)
- **Acceso:** `notFound()` si la conversación no existe o el usuario no es participante (RLS)

## Test IDs Disponibles

```
data-testid="conversation_page"
data-testid="conversation_thread"
data-testid="thread_header"
data-testid="participant_name"
data-testid="messages_container"
data-testid="message_sender_name"
data-testid="message_timestamp"
data-testid="back_button"
```

---

## Variables del Test Case

| Variable | Descripción | Cómo obtenerla |
|----------|-------------|----------------|
| {user_a} / {user_b} | Los dos participantes de la conversación | Seeded demo users (student + mentor) de los fixtures |
| {conversation_id} | UUID de la conversación | `SELECT id FROM conversations WHERE student_id = '{user_a_id}' AND mentor_id = '{user_b_id}' LIMIT 1` |
| {M} | Cantidad de mensajes | `SELECT COUNT(*) FROM messages WHERE conversation_id = '{conversation_id}'` |

---

## Diseño del Test

```gherkin
Feature: Conversation History - Conversation Thread (MYM-57)

  @critical @regression @automation-candidate @MYM-57-TC2
  Scenario: User opens a conversation and sees all messages from both participants in chronological order

    # === PRECONDITIONS (Variables - tester/script builds them) ===
    Given a conversation {conversation_id} exists between {user_a} and {user_b}
    And the conversation has {M} messages where {M} > 2
    And both participants have sent at least 1 message each
    And one message content includes special characters "<script>alert('xss')</script>"
    And the user is authenticated as {user_a}

    # === ACTION ===
    When the user navigates to "/dashboard/messages/{conversation_id}"
    And the page completes loading

    # === VALIDATIONS — AC2: completeness (MYM-155 regression) ===
    Then the thread displays ALL {M} messages of the conversation
    And messages sent by {user_a} are displayed (own messages visible — MYM-155 check)
    And messages sent by {user_b} are displayed

    # === VALIDATIONS — AC2: chronological order ===
    And messages are ordered chronologically (oldest first, by created_at ASC)
    And each message shows its sender name and timestamp

    # === TRANSVERSAL CHARACTERISTICS ===
    And the XSS probe message is rendered as plain text (script NOT executed)
    And long messages wrap correctly inside the bubble (MYM-137 check)
    And the thread renders correctly on mobile viewport (375x667)
```

## Notas

- Cross-check: conteo de mensajes UI vs DB ({M})
- Componente Lego de: Complete Messaging E2E (MYM-56 → MYM-57 → MYM-58)
- El mark-as-read (efecto colateral al abrir el thread) lo cubre TC3 (MYM-182)
