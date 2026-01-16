# Exploratory Database Testing Session: MYM-57 - Conversation History

> AI-guided exploratory testing at the database layer using DBHub MCP for data integrity verification.

---

## Purpose

Execute exploratory testing directly on the database to verify data integrity, validate constraints and triggers, confirm business rules at the data level, and discover issues that API/UI testing might miss.

**This prompt is executed:**
- AFTER API testing (to verify data was stored correctly)
- AFTER UI testing (to verify complete data flow)
- OR independently for data-focused features (reports, migrations, bulk operations)

**When to use Database Exploratory Testing for MYM-57:**
- Verifying data created/modified by API or UI operations
- Testing database constraints (FK, UNIQUE, CHECK)
- Validating triggers and computed columns
- Testing RLS policies at SQL level
- Verifying data migrations
- Testing batch/bulk operations
- Validating complex queries and aggregations

---

## Input Context

### User Story: MYM-57 - View Conversation History
**Jira Key:** MYM-57
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** Ready For QA

### Database Schema
**Database:** Supabase PostgreSQL (staging)
**Tables involved:** `conversations`, `messages`, `profiles`

#### Table: conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES profiles(id),
  participant_2_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Constraint: participant_order
-- Ensures participant_1_id < participant_2_id for consistent ordering
ALTER TABLE conversations ADD CONSTRAINT conversations_participant_order 
CHECK (participant_1_id < participant_2_id);
```

#### Table: messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### Table: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  photo_url TEXT,
  role TEXT CHECK (role IN ('student', 'mentor', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## Phase 1: Context Gathering

### Data Model Understanding
For MYM-57, the data flow is:

1. **Conversation Creation:** When two users start messaging
2. **Message Exchange:** Messages are stored with read status
3. **Read Status Updates:** Messages marked as read/unread
4. **Conversation Updates:** updated_at timestamp changes

### Key Relationships
- **conversations** ↔ **profiles** (many-to-many via participant_1_id, participant_2_id)
- **conversations** ↔ **messages** (one-to-many via conversation_id)
- **messages** ↔ **profiles** (many-to-one via sender_id)

### Verification Points
1. **Data created correctly** - Conversations and messages exist
2. **Relationships intact** - Foreign keys are maintained
3. **Triggers executed** - updated_at timestamps
4. **Constraints enforced** - participant ordering, data types
5. **RLS policies working** - Users can only see their data

---

## Phase 2: Schema Exploration

### Database Connection
```sql
-- Database: Supabase Staging
-- Connection: Via DBHub MCP
-- User: qa_team (for testing)
```

### Schema Verification Queries
```sql
-- List all tables in public schema
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Describe conversations table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- View constraints on conversations table
SELECT 
    constraint_name, 
    constraint_type,
    check_clause
FROM information_schema.table_constraints 
WHERE table_name = 'conversations';

-- View foreign keys for conversations
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'conversations';
```

---

## Phase 3: Data State Verification

### Test Data Setup
```sql
-- Test users (already exist in staging)
SELECT id, email, role, is_verified 
FROM profiles 
WHERE email IN ('student.demo@upexmymentor.com', 'mentor.demo@upexmymentor.com');
```

### Verification Queries

#### 3.1 Conversation Existence Verification
```sql
-- Verify conversations exist for test users
SELECT 
    c.id,
    c.participant_1_id,
    c.participant_2_id,
    c.created_at,
    c.updated_at,
    p1.name as participant_1_name,
    p1.email as participant_1_email,
    p2.name as participant_2_name,
    p2.email as participant_2_email
FROM conversations c
JOIN profiles p1 ON c.participant_1_id = p1.id
JOIN profiles p2 ON c.participant_2_id = p2.id
WHERE p1.email = 'student.demo@upexmymentor.com' 
   OR p2.email = 'student.demo@upexmymentor.com'
ORDER BY c.updated_at DESC;
```

#### 3.2 Message Count Verification
```sql
-- Verify messages exist for conversations
SELECT 
    c.id as conversation_id,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at,
    COUNT(CASE WHEN m.is_read = false THEN 1 END) as unread_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.participant_1_id IN (
    SELECT id FROM profiles WHERE email = 'student.demo@upexmymentor.com'
) OR c.participant_2_id IN (
    SELECT id FROM profiles WHERE email = 'student.demo@upexmymentor.com'
)
GROUP BY c.id, c.updated_at
ORDER BY c.updated_at DESC;
```

#### 3.3 Read Status Verification
```sql
-- Verify read/unread message distribution
SELECT 
    c.id as conversation_id,
    COUNT(m.id) as total_messages,
    COUNT(CASE WHEN m.is_read = true THEN 1 END) as read_messages,
    COUNT(CASE WHEN m.is_read = false THEN 1 END) as unread_messages,
    ROUND(
        COUNT(CASE WHEN m.is_read = true THEN 1 END) * 100.0 / 
        NULLIF(COUNT(m.id), 0), 2
    ) as read_percentage
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.participant_1_id IN (
    SELECT id FROM profiles WHERE email = 'student.demo@upexmymentor.com'
) OR c.participant_2_id IN (
    SELECT id FROM profiles WHERE email = 'student.demo@upexmymentor.com'
)
GROUP BY c.id
ORDER BY c.updated_at DESC;
```

---

## Phase 4: Constraint Testing

### 4.1 Foreign Key Constraints
```sql
-- Test: Cannot create conversation with non-existent user
-- Expected: Foreign key violation
INSERT INTO conversations (participant_1_id, participant_2_id)
VALUES ('non-existent-user-1', 'non-existent-user-2');
```

### 4.2 CHECK Constraints
```sql
-- Test: Cannot violate participant ordering
-- Expected: Check constraint violation
INSERT INTO conversations (participant_1_id, participant_2_id)
VALUES ('user-b-uuid', 'user-a-uuid');
```

### 4.3 UNIQUE Constraints
```sql
-- Test: Cannot create duplicate email
-- Expected: Unique constraint violation
INSERT INTO profiles (email, name, role)
VALUES ('student.demo@upexmymentor.com', 'Duplicate User', 'student');
```

### 4.4 NOT NULL Constraints
```sql
-- Test: Cannot create conversation without required fields
-- Expected: Not null violation
INSERT INTO conversations (participant_1_id)
VALUES ('valid-user-uuid');
```

---

## Phase 5: Data Integrity Checks

### 5.1 Orphan Records Detection
```sql
-- Find conversations without valid users
SELECT c.*
FROM conversations c
LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
LEFT JOIN profiles p2 ON c.participant_2_id = p2.id
WHERE p1.id IS NULL OR p2.id IS NULL;

-- Find messages without valid conversations
SELECT m.*
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
WHERE c.id IS NULL;

-- Find messages without valid senders
SELECT m.*
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE p.id IS NULL;
```

### 5.2 Calculation Mismatches
```sql
-- Find conversations where updated_at doesn't match latest message
SELECT
    c.id,
    c.updated_at as stored_updated_at,
    COALESCECE(MAX(m.created_at), c.created_at) as latest_message_at
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.participant_1_id IN (
    SELECT id FROM profiles WHERE email = 'student.demo@upexmymentor.com'
) OR c.participant_2_id IN (
    SELECT id FROM profiles WHERE email = 'student.demo@upexmymentor.com'
)
GROUP BY c.id, c.updated_at
HAVING c.updated_at != COALESCE(MAX(m.created_at), c.created_at);
```

### 5.3 Invalid States Detection
```sql
-- Find conversations with no messages (should be deleted)
SELECT c.*
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE m.conversation_id IS NULL;

-- Find messages with empty content
SELECT *
FROM messages
WHERE LENGTH(TRIM(content)) = 0;

-- Find messages with future timestamps
SELECT *
FROM messages
WHERE created_at > CURRENT_TIMESTAMP;
```

---

## Phase 6: RLS Policy Testing at SQL Level

### RLS Test Setup
```sql
-- Note: Direct SQL with qa_team role bypasses RLS
-- For true RLS testing, use API layer or set session variables

-- Test 1: User can query own data
-- Simulate: SET LOCAL request.jwt.claim.sub = 'user-a-uuid';
SELECT c.*, p1.name as participant_1_name, p2.name as participant_2_name
FROM conversations c
JOIN profiles p1 ON c.participant_1_id = p1.id
JOIN profiles p2 ON c.participant_2_id = p2.id
WHERE p1.email = 'student.demo@upexmymentor.com';

-- Test 2: User cannot see other user's data
-- Simulate: SET LOCAL request.jwt.claim.sub = 'user-a-uuid';
SELECT COUNT(*) as other_user_conversations
FROM conversations c
WHERE c.participant_1_id IN (
    SELECT id FROM profiles WHERE email = 'mentor.demo@upexmymentor.com'
) OR c.participant_2_id IN (
    SELECT id FROM profiles WHERE email = 'mentor.demo@upexmymentor.com'
);
```

---

## Phase 7: Performance Analysis

### 7.1 Query Performance
```sql
-- Check slow queries
SELECT 
    query,
    mean_exec_time,
    calls,
    total_exec_time,
    min_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%conversations%' 
   OR query LIKE '%messages%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_fetch,
    idx_tup_read,
    idx_tup_fetch,
    idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND (tablename = 'conversations' OR tablename = 'messages')
ORDER BY idx_scan DESC;
```

### 7.2 Table Size Analysis
```sql
-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(table_oid)) as size,
    pg_total_relation_size(table_oid) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename = 'conversations' OR tablename = 'messages' OR tablename = 'profiles')
ORDER BY pg_total_relation_size(table_oid) DESC;
```

---

## Phase 8: Session Summary

### Expected Output
```markdown
# Database Exploratory Testing Session Notes

**Date:** [Current Date]
**Feature:** MYM-57 - Conversation History
**Database:** Supabase Staging
**Duration:** [Time spent]

---

## Executive Summary

- **Overall Status:** [PASSED / ISSUES FOUND / BLOCKED]
- **Tables Tested:** [List]
- **Constraints Verified:** [X of Y]
- **Triggers Verified:** [X of Y]
- **Data Integrity Issues:** [Number]

---

## Schema Verification

| Table | Constraints OK | Triggers OK | Notes |
|-------|----------------|-----------|-------|
| conversations | YES | YES | participant_order constraint |
| messages | YES | N/A | No triggers |
| profiles | YES | N/A | Email unique constraint |

---

## Data State Verification

### After: [Operation tested]

| Verification Point | Expected | Actual | Status |
|-------------------|----------|--------|-------|
| Conversations exist | 2 rows | 2 rows | PASSED |
| Messages exist | [X] rows | [X] rows | PASSED |
| Read status correct | [X]% read | [X]% read | PASSED |
| Timestamps current | Recent | Recent | PASSED |

---

## Constraint Testing

| Constraint Type | Tested | Working | Notes |
|----------------|--------|---------|-------|
| Foreign Keys | 2 | 2 | All enforced |
| CHECK | 1 | 1 | participant_order |
| UNIQUE | 1 | 1 | Email uniqueness |
| NOT NULL | 5 | 5 | Required fields |

---

## Data Integrity Checks

| Check | Issues Found | Severity |
|-------|-------------|--------|
| Orphan conversations | 0 | - |
| Orphan messages | 0 | - |
| Calculation mismatches | 0 | - |
| Invalid states | 0 | - |
| Future timestamps | 0 | - |

---

## RLS Policy Testing

| Policy | Status | Notes |
|--------|--------|-------|
| Users see own conversations | VERIFIED | Working correctly |
| Users can't access others | VERIFIED | RLS blocks unauthorized |
| Users can mark others' messages read | VERIFIED | RLS allows this use case |
| Users can't modify others' messages | VERIFIED | RLS blocks modifications |

---

## Issues Found

### Issue 1: [Title]
- **Severity:** [Critical/High/Medium/Low]
- **Table(s):** [Affected tables]
- **Query to reproduce:**
  ```sql
  [Query that shows the issue]
  ```
- **Expected:** [What should be]
- **Actual:** [What is]
- **Impact:** [Business impact]

---

## Observations & Recommendations

### Positive Findings:
- [What worked well]
- [Schema design strengths]
- [RLS implementation]

### Areas of Concern:
- [Potential data issues to monitor]
- [Performance considerations]
- [Security observations]

### Recommendations:
- [Missing constraints to add]
- [Indexes to add for performance]
- [Triggers to review]

---

## Next Steps

- [ ] Report data integrity issues
- [ ] Coordinate with dev on constraint fixes
- [ ] Document for Test Documentation phase
- [ ] Proceed to UI testing (if applicable)
```

---

## MCP Tools Reference

### DBHub MCP
| Tool | Use Case |
|------|---------|
| `mcp__dbhub__query` | Execute SELECT queries |
| `mcp__dbhub__execute` | Execute INSERT/UPDATE/DELETE |
| `mcp__dbhub__describe` | Explore schema, tables, columns |

### Common Query Patterns
```sql
-- Count records
SELECT COUNT(*) FROM table_name WHERE condition;

-- Check existence
SELECT EXISTS(SELECT 1 FROM table_name WHERE id = 'xxx');

-- Aggregate verification
SELECT SUM(column), AVG(column), MIN(column), MAX(column) FROM table;

-- Join verification
SELECT a.*, b.* FROM table_a a JOIN table_b b ON a.id = b.a_id;

-- Date-based queries
SELECT * FROM table WHERE created_at >= CURRENT_DATE;
```

---

## Best Practices Applied

1. ✅ **Read before write** - Always SELECT before UPDATE/DELETE
2. ✅ **Use transactions for tests** - BEGIN; ...test...; ROLLBACK;
3. ✅ **Verify cascades** - Check that related data is handled correctly
4. ✅ **Test constraints, don't assume** - Constraints might be missing
5. ✅ **Check for NULLs** - NULL handling is a common source of bugs
6. ✅ **Verify calculations** - Don't trust that triggers ran correctly
7. ✅ **Document exact queries** - Makes issues reproducible

---

## Integration with Trifuerza Testing

Database testing completes the verification triangle:

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIFUERZA TESTING                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     UI      │  │     API     │  │     DB      │         │
│  │  Testing    │  │  Testing    │  │  Testing    │         │
│  │             │  │             │  │   (THIS)    │         │
│  │ Playwright  │  │  Postman/   │  │   DBHub     │         │
│  │    MCP      │  │ OpenAPI MCP │  │    MCP      │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┴────────────────┘                 │
│                          │                                  │
│                 Data Flows Through All Layers               │
└─────────────────────────────────────────────────────────────┘
```

**Complete verification flow:**
1. **UI creates data** → API receives it → **DB stores it** (verify here)
2. **API modifies data** → **DB updates** (verify here) → UI reflects change
3. **Trigger fires** → **DB calculates** (verify here) → API returns result

---

## Output

- Database testing session notes with all findings
- Constraint verification results
- Data integrity check results
- List of issues (if any) ready for bug reporting
- Recommendations for schema improvements
- Complete data validation for MYM-57

---

**Ready to execute database exploratory testing on MYM-57?**