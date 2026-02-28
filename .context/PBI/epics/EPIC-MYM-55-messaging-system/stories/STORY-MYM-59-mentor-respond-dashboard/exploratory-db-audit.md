# DB Audit Report - MYM-59 (Recent Messages Widget)

- **Date:** 2026-02-04
- **Executor:** José Andrés Lorca Gálvez (QA) + Gemini CLI (gemini-3-pro-preview)
- **Environment:** Staging
- **DB:** PostgreSQL 17.6

## Scope

**Validated:**
- Data integrity for `conversations` and `messages` tables.
- Referential integrity checks (`participant_1_id`, `participant_2_id`, `conversation_id`, `sender_id`).
- Business logic for widget ordering (`updated_at` synchronization).
- Performance feasibility of the "Recent Messages" query.

**Not Validated:**
- Frontend component rendering.
- Real-time subscription behavior (Supabase Realtime).
- High-concurrency performance testing.

## Summary

- **Conclusion:** The database schema and current data state are healthy and support the implementation of the "Recent Messages" widget.
- **Critical Note:** The widget's sort order relies entirely on `conversations.updated_at`. It is mandatory that the application logic (or database trigger) updates this timestamp whenever a new message is inserted.
- **Decision:** The query filters out empty conversations (those with 0 messages) to prevent UI errors or empty previews.
- **Note:** The Golden Query executed successfully in Staging (no errors/timeouts observed).

## Test Results

| Test ID | Check                  | Expected | Result            | Pass/Fail | Notes                                                                   |
| :------ | :--------------------- | :------- | :---------------- | :-------- | :---------------------------------------------------------------------- |
| DB-01   | Orphan messages        | 0 rows   | 0 issues observed | **PASS**  | No messages found without valid `conversation_id`.                      |
| DB-02   | Missing participants   | 0 rows   | 0 issues observed | **PASS**  | All participants exist in `profiles`.                                   |
| DB-03   | Ordering integrity     | 0 rows   | 0 issues observed | **PASS**  | `conversations.updated_at` is correctly synced with last message.       |
| DB-04   | Future messages        | 0 rows   | 0 issues observed | **PASS**  | No "time travel" messages detected.                                     |
| DB-05   | Unread by conversation | N/A      | Counts verified   | **PASS**  | Spot-check performed; unread counts returned as expected for test data. |
| DB-06   | Missing senders        | 0 rows   | 0 issues observed | **PASS**  | All messages.sender_id values map to existing profiles.id.              |

### DB-06 — Sender integrity (messages.sender_id -> profiles.id)

```sql
SELECT COUNT(*) AS missing_senders
FROM messages m
LEFT JOIN profiles p ON p.id = m.sender_id
WHERE p.id IS NULL;
```

Result: missing_senders = 0 (PASS)

## Golden Query (Backend)

Use this parameterized query to fetch data for the widget.

```sql
/*
   MYM-59 | Recent Messages Widget (PostgreSQL)
   Param: $1 = current_user_id (UUID)
   Returns: Top 5 conversations with most recent activity (ordered by conversations.updated_at),
            filtering out empty ones (requires at least one message).
*/

SELECT
  c.id AS conversation_id,
  c.updated_at,
  other.id AS other_participant_id,
  other.name AS other_participant_name,
  other.role AS other_participant_role,
  other.photo_url AS other_participant_photo_url,
  lm.id AS last_message_id,
  lm.content AS last_message_content,
  lm.is_read AS last_message_is_read,
  lm.created_at AS last_message_created_at
FROM conversations c
JOIN profiles other
  ON other.id = CASE
    WHEN c.participant_1_id = $1 THEN c.participant_2_id
    ELSE c.participant_1_id
  END
/* INNER JOIN implícito: filtra conversaciones sin mensajes */
JOIN LATERAL (
  SELECT
    m.id,
    m.content,
    m.is_read,
    m.created_at
  FROM messages m
  WHERE m.conversation_id = c.id
  ORDER BY m.created_at DESC, m.id DESC
  LIMIT 1
) lm ON TRUE
WHERE (c.participant_1_id = $1 OR c.participant_2_id = $1)
ORDER BY c.updated_at DESC
LIMIT 5;
```

## Recommended Indexes

Apply these indexes to optimize the query performance.

```sql
/* 1) Crítico para el preview rápido (evita Sort y acelera LATERAL) */
CREATE INDEX IF NOT EXISTS idx_messages_conv_created_id_desc
ON messages (conversation_id, created_at DESC, id DESC);

/* 2) Para búsqueda eficiente de conversaciones con OR (Bitmap OR Scan) */
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1
ON conversations (participant_1_id);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_2
ON conversations (participant_2_id);
```

## Evidence

- **Jira Comment:** See comment ID 47163 in MYM-59 for full execution logs.
- **Data Verification:** Confirmed consistency between Mentor test account and Student test account interactions (details in Jira comment).
