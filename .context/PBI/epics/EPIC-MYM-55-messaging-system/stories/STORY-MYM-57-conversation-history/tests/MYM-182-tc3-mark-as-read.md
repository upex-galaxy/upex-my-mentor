# MYM-182: MYM-57: TC3: Validate conversation is marked as read when opening a conversation with unread messages

**Jira:** [MYM-182](https://upexgalaxy69.atlassian.net/browse/MYM-182)
**Status:** CANDIDATE
**Type:** E2E (UI → Server Action → DB — único TC de esta US con escritura en DB)
**Priority:** Critical
**Related Story:** MYM-57
**Parent:** MYM-108 (Test Repository)
**ROI Score:** 24.0
**Covers:** AC5 (mark as read + unread indicator cleared)

---

## Bugs Previos / Riesgo Futuro

- **MYM-155 (High, Closed):** área thread/estado de mensajes — la más crítica del módulo
- **Riesgo futuro (razón de ser de este test):** MYM-58 (Notifications) se construirá ENCIMA de `is_read` y los unread counts. Es el test con mayor probabilidad de atrapar la próxima regresión.

## Código de Implementación

| Archivo | Propósito |
|---------|-----------|
| src/app/(main)/dashboard/messages/[conversationId]/page.tsx | Thread page — al abrirla se dispara mark-as-read (server side) |
| src/lib/actions/messaging.ts | Server Action `getConversationMessages` (+ lógica mark-as-read) |
| src/components/messaging/conversation-list-item.tsx | Unread indicator en la lista |
| src/components/messaging/messages-nav-icon.tsx / notification-badge.tsx | Badge de no leídos en navegación |

## Arquitectura

- **Mutación:** server-side al cargar el thread (NO un PATCH REST desde el cliente)
- **DB:** `messages.is_read` → true para mensajes recibidos por el usuario en esa conversación
- **RLS:** solo participantes pueden leer/actualizar mensajes de su conversación

## Test IDs Disponibles

```
data-testid="conversation_thread"
data-testid="messages_container"
data-testid="conversations_list"
data-testid="unread_dot"
data-testid="unread_badge"
data-testid="unread_indicator"
data-testid="messages_nav_icon"
data-testid="notification_badge"
data-testid="back_button"
```

---

## Variables del Test Case

| Variable | Descripción | Cómo obtenerla |
|----------|-------------|----------------|
| {user_a} / {user_b} | {user_a} = lector, {user_b} = emisor | Seeded demo users de los fixtures |
| {conversation_id} | UUID de la conversación | `SELECT id FROM conversations WHERE student_id = '{user_a_id}' AND mentor_id = '{user_b_id}' LIMIT 1` |
| {U} | Mensajes no leídos antes del test | `SELECT COUNT(*) FROM messages WHERE conversation_id = '{conversation_id}' AND sender_id = '{user_b_id}' AND is_read = false` |

---

## Diseño del Test

```gherkin
Feature: Conversation History - Mark as Read (MYM-57)

  @critical @regression @automation-candidate @MYM-57-TC3
  Scenario: Opening a conversation with unread messages marks them as read and clears the unread indicator

    # === PRECONDITIONS (Variables - tester/script builds them) ===
    Given a conversation {conversation_id} exists between {user_a} and {user_b}
    And {user_b} has sent {U} messages with is_read = false where {U} > 0
    And the user is authenticated as {user_a}
    And the conversation shows the unread indicator in "/dashboard/messages"

    # === ACTION ===
    When the user opens "/dashboard/messages/{conversation_id}"
    And the page completes loading

    # === VALIDATIONS — DB side effect (state) ===
    Then all messages of {conversation_id} sent by {user_b} have is_read = true in the database
    And the unread count for {conversation_id} is 0 (SQL cross-check)

    # === VALIDATIONS — UI ===
    When the user navigates back to "/dashboard/messages"
    Then the conversation no longer shows the unread indicator
    And the messages nav icon no longer counts these messages in its notification badge

    # === TRANSVERSAL CHARACTERISTICS ===
    And the flow works correctly on mobile viewport (375x667)
```

## Notas

- ⚠️ Test con mutación de estado: el setup debe RE-SEMBRAR mensajes no leídos (idempotencia)
- La mutación es solo de la conversación abierta — otras conversaciones no cambian
- Componente Lego de: Notification E2E (MYM-57 → MYM-58)
