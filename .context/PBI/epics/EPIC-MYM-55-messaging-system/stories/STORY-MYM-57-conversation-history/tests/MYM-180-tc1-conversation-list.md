# MYM-180: MYM-57: TC1: Validate conversation list displays complete metadata and recent-activity ordering when user has multiple conversations

**Jira:** [MYM-180](https://upexgalaxy69.atlassian.net/browse/MYM-180)
**Status:** CANDIDATE
**Type:** E2E (UI → Server Action → DB)
**Priority:** Critical
**Related Story:** MYM-57
**Parent:** MYM-108 (Test Repository)
**ROI Score:** 35.0
**Covers:** AC1 (complete metadata) + AC3 (recent-activity ordering — absorbed TC4)

---

## Código de Implementación

| Archivo | Propósito |
|---------|-----------|
| src/app/(main)/dashboard/messages/page.tsx | Conversation list page (Server Component) |
| src/lib/actions/messaging.ts | Server Action `getConversations` |
| src/components/messaging/conversation-list.tsx | List container |
| src/components/messaging/conversation-list-item.tsx | Item con metadata (name, preview, timestamp, unread) |

## Arquitectura

- **Data Fetching:** SSR via Supabase Server Client + Server Actions (NO API REST de Next.js)
- **Componente principal:** ConversationList

## Test IDs Disponibles

```
data-testid="messages_page"
data-testid="conversations_list"
data-testid="participant_name"
data-testid="message_preview"
data-testid="conversation_timestamp"
data-testid="unread_badge"
data-testid="unread_dot"
data-testid="unread_indicator"
```

---

## Variables del Test Case

| Variable | Descripción | Cómo obtenerla |
|----------|-------------|----------------|
| {user_email} | Test user con múltiples conversaciones | Seeded demo user (student o mentor) de los fixtures |
| {user_id} | UUID del usuario | `SELECT id FROM profiles WHERE email = '{user_email}'` |
| {N} | Cantidad de conversaciones | `SELECT COUNT(*) FROM conversations WHERE student_id = '{user_id}' OR mentor_id = '{user_id}'` |

---

## Diseño del Test

```gherkin
Feature: Conversation History - Conversation List (MYM-57)

  @critical @regression @automation-candidate @MYM-57-TC1
  Scenario: User views conversation list with complete metadata ordered by recent activity

    # === PRECONDITIONS (Variables - tester/script builds them) ===
    Given a user {user_email} exists with {N} conversations where {N} > 1
    And each conversation has at least 1 message
    And at least one conversation has unread messages for the user
    And the user is authenticated as {user_email}

    # === ACTION ===
    When the user navigates to "/dashboard/messages"
    And the page completes loading

    # === VALIDATIONS — AC1: complete metadata ===
    Then the conversations list displays {N} conversation items
    And each conversation item shows the other participant's name
    And each conversation item shows the last message preview
    And each conversation item shows a relative timestamp
    And conversations with unread messages show the unread indicator

    # === VALIDATIONS — AC3: ordering (absorbed TC4) ===
    And conversation items are ordered by most recent activity (updated_at DESC)

    # === TRANSVERSAL CHARACTERISTICS ===
    And the list renders correctly on mobile viewport (375x667)
    And the page server response completes in under 300ms
```

## Notas

- Bugs previos del módulo (área, no directos): MYM-155 (High, closed), MYM-132 (Medium, closed)
- Componente Lego de: Complete Messaging E2E (MYM-56 → MYM-57 → MYM-58)
- TC6 (timestamp format) se agregará como assertion aquí cuando MYM-170 cierre (característica compartida)
