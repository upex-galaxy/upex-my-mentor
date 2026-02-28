# Exploratory API Testing Session: MYM-57 - Conversation History

> AI-guided exploratory testing at the API layer using Postman MCP and OpenAPI MCP tools for backend validation.

---

## Purpose

Execute exploratory testing on MYM-57 API endpoints to validate backend functionality, verify data contracts, test authentication flows, and discover integration defects before automation.

**This prompt is executed AFTER:**
- Smoke test passed (deployment is functional)
- Feature is deployed to staging
- API endpoints are accessible

**When to use API Exploratory Testing:**
- Testing endpoints that don't have UI yet
- Validating API contracts (request/response schemas)
- Testing authentication and authorization (RLS policies)
- Verifying data transformations and business logic
- Testing error handling and edge cases at API level

---

## Input Context

### User Story: MYM-57 - View Conversation History
**Jira Key:** MYM-57
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** Ready For QA

### Test Cases Reference
**Source:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-57-conversation-history/test-cases.md`

**Key API Endpoints from Shift-Left Testing:**
1. `GET /api/conversations` - Get user's conversations
2. `GET /api/conversations/[id]` - Get conversation thread
3. `PATCH /api/conversations/[id]` - Mark as read
4. `POST /api/messages` - Send new message (related functionality)

---

## Testing Environment

**API Base URL:** https://staging-upexmymentor.vercel.app/api
**Authentication:** Supabase Auth (JWT tokens)
**Database:** Supabase PostgreSQL (staging)
**Tables involved:** `conversations`, `messages`, `profiles`

---

## Phase 1: Context Gathering

### API Endpoints Analysis
Based on the implementation in `src/lib/actions/messaging.ts`:

#### 1. Get Conversations
```typescript
// Function: getConversations()
// Endpoint: GET /api/conversations (via Server Actions)
// Purpose: Get all conversations for current user
// Authentication: Required (JWT token)
// Returns: Array of ConversationWithDetails
```

#### 2. Get Conversation Messages
```typescript
// Function: getConversationMessages(conversationId)
// Endpoint: GET /api/conversations/[id] (via Server Actions)
// Purpose: Get messages for specific conversation
// Authentication: Required (JWT token)
// Authorization: User must be participant
// Returns: MessageWithSender array
```

#### 3. Mark Conversation as Read
```typescript
// Function: markConversationAsRead(conversationId)
// Endpoint: PATCH /api/conversations/[id] (via Server Actions)
// Purpose: Mark all messages as read
// Authentication: Required (JWT token)
// Authorization: User must be participant
// Returns: void
```

#### 4. Send Message (Related)
```typescript
// Function: sendMessageToMentor(data)
// Endpoint: POST /api/messages (via Server Actions)
// Purpose: Send new message
// Authentication: Required (JWT token)
// Authorization: User must be participant
// Returns: SendMessageResponse
```

### Database Schema
```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES profiles(id),
  participant_2_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Profiles table
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

## Phase 2: Authentication Setup

### Supabase Authentication Flow
```typescript
// 1. Login to get JWT token
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'student.demo@upexmymentor.com',
  password: 'Demo123!'
});

// 2. Extract token for API calls
const token = data.session.access_token;

// 3. Use token in Authorization header
headers: {
  'Authorization': `Bearer ${token}`,
  'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}
```

### Test Users
```typescript
STUDENT_USER = {
  email: 'student.demo@upexmymentor.com',
  password: 'Demo123!',
  role: 'student',
  expected_conversations: 2
}

MENTOR_USER = {
  email: 'mentor.demo@upexmymentor.com', 
  password: 'Demo123!',
  role: 'mentor',
  expected_conversations: 2
}
```

---

## Phase 3: API Exploration Plan

### Endpoints to Test
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|--------------|
| GET | `/api/conversations` | List user conversations | Yes |
| GET | `/api/conversations/[id]` | Get conversation thread | Yes |
| PATCH | `/api/conversations/[id]` | Mark as read | Yes |
| POST | `/api/messages` | Send message | Yes |

### Test Scenarios

#### 1. Authentication Testing
- Valid JWT token
- Invalid JWT token
- Missing JWT token
- Expired JWT token

#### 2. Authorization Testing (RLS)
- User can access own conversations
- User cannot access other user's conversations
- Admin can access all conversations (if applicable)

#### 3. Happy Path Testing
- Get conversation list successfully
- Get conversation thread successfully
- Mark conversation as read successfully
- Send message successfully

#### 4. Edge Case Testing
- Non-existent conversation ID
- Empty conversation list
- Very long message content
- Special characters in messages
- Concurrent modifications

#### 5. Data Validation Testing
- Required fields validation
- Data type validation
- Length constraints
- Business rule validation

---

## Phase 4: API Test Execution

### Test Documentation Format
```markdown
### Scenario: [Name]

**Endpoint:** [METHOD] [PATH]

**Request:**
- Headers: [List headers]
- Body: [Request body if applicable]
- Query params: [If applicable]

**Expected Response:**
- Status: [Expected status code]
- Body: [Expected structure/values]

**Actual Response:**
- Status: [Actual status code]
- Body: [Actual response - summarized]

**Assertions:**
- [ ] Status code matches
- [ ] Response schema is valid
- [ ] Data values are correct
- [ ] No unexpected fields

**Outcome:** [PASSED / FAILED / OBSERVATION]

**Notes:**
- [Any observations]
```

---

## Phase 5: RLS Policy Testing

### Critical RLS Tests for MYM-57

#### Test 1: User Can Only See Own Conversations
```sql
-- Setup: Login as User A
SET LOCAL request.jwt.claim.sub = 'user-a-uuid';

-- Test: Get conversations
SELECT * FROM conversations;
-- Expected: Only conversations where user_a is participant_1_id or participant_2_id
```

#### Test 2: User Cannot Access Other User's Data
```sql
-- Setup: Login as User A
SET LOCAL request.jwt.claim.sub = 'user-a-uuid';

-- Test: Try to access User B's conversation
SELECT * FROM conversations 
WHERE participant_1_id = 'user-b-uuid' OR participant_2_id = 'user-b-uuid';
-- Expected: Empty array (RLS filters out)
```

#### Test 3: User Can Only Update Own Read Status
```sql
-- Setup: Login as User A
SET LOCAL request.jwt.claim.sub = 'user-a-uuid';

-- Test: Mark conversation as read
UPDATE messages 
SET is_read = true 
WHERE conversation_id = 'conv-owned-by-user-a' 
AND sender_id != 'user-a-uuid';
-- Expected: Success (can mark messages from others as read)
```

#### Test 4: User Cannot Update Other User's Messages
```sql
-- Setup: Login as User A
SET LOCAL request.jwt.claim.sub = 'user-a-uuid';

-- Test: Try to update User B's message content
UPDATE messages 
SET content = 'modified content' 
WHERE conversation_id = 'conv-owned-by-user-b' 
AND sender_id = 'user-b-uuid';
-- Expected: No rows affected (RLS blocks)
```

---

## Phase 6: Error Handling & Edge Cases

### Input Validation Tests
```markdown
### Edge Case: Empty required field

**Request:** POST /api/messages
Body: { "conversation_id": "", "content": "" }

**Expected:** 400 Bad Request with validation error
**Actual:** [Result]
**Status:** [PASSED/FAILED]
```

### Authentication Error Tests
```markdown
### Edge Case: Invalid JWT token

**Request:** GET /api/conversations
Headers: Authorization: Bearer [invalid_token]

**Expected:** 401 Unauthorized
**Actual:** [Result]
**Status:** [PASSED/FAILED]
```

### Not Found Tests
```markdown
### Edge Case: Non-existent conversation

**Request:** GET /api/conversations/[non-existent-uuid]

**Expected:** 404 Not Found
**Actual:** [Result]
**Status:** [PASSED/FAILED]
```

### Boundary Tests
```markdown
### Edge Case: Maximum message length

**Request:** POST /api/messages
Body: { "conversation_id": "valid-id", "content": "[10000 character string]" }

**Expected:** Either accepted or 400 with length error
**Actual:** [Result]
**Status:** [PASSED/FAILED]
```

---

## Phase 7: Data Verification

### Database Verification After API Operations
```sql
-- After GET /api/conversations
SELECT id, participant_1_id, participant_2_id, updated_at
FROM conversations
WHERE participant_1_id = '[user-id]' OR participant_2_id = '[user-id]';

-- After GET /api/conversations/[id]
SELECT id, sender_id, content, is_read, created_at
FROM messages
WHERE conversation_id = '[conversation-id]'
ORDER BY created_at;

-- After PATCH /api/conversations/[id] (mark as read)
SELECT COUNT(*) as unread_count
FROM messages
WHERE conversation_id = '[conversation-id]'
AND sender_id != '[user-id]'
AND is_read = false;

-- After POST /api/messages
SELECT id, conversation_id, sender_id, content, created_at
FROM messages
WHERE conversation_id = '[conversation-id]'
ORDER BY created_at DESC
LIMIT 1;
```

---

## Phase 8: Session Summary

### Expected Output
```markdown
# API Exploratory Testing Session Notes

**Date:** [Current Date]
**Feature:** MYM-57 - Conversation History
**API Base URL:** https://staging-upexmymentor.vercel.app/api
**Duration:** [Time spent]

---

## Executive Summary

- **Overall Status:** [PASSED / ISSUES FOUND / BLOCKED]
- **Endpoints Tested:** [X endpoints]
- **Scenarios Executed:** [X of Y]
- **Issues Found:** [Number]
- **RLS Policies:** [VERIFIED / NOT TESTED / VULNERABLE]

---

## Authentication Testing

| Scenario | Status | Notes |
|---------|--------|-------|
| Valid login | PASSED | JWT token generated successfully |
| Invalid password | PASSED | Returns 400 Bad Request |
| Expired token | PASSED | Returns 401 Unauthorized |
| Missing auth | PASSED | Returns 401 Unauthorized |

---

## Endpoint Testing

### 1. GET /api/conversations - [PASSED/FAILED]
- Happy path: Works correctly
- Filtering: Returns only user's conversations
- Sorting: Ordered by updated_at DESC
- Pagination: Not implemented (returns all)

### 2. GET /api/conversations/[id] - [PASSED/FAILED]
- Happy path: Works correctly
- Authorization: RLS blocks unauthorized access
- Data integrity: Messages in chronological order

### 3. PATCH /api/conversations/[id] - [PASSED/FAILED]
- Happy path: Marks messages as read
- Authorization: RLS allows marking others' messages
- Data integrity: Read status updates correctly

---

## RLS Policy Testing

| Policy | Status | Notes |
|--------|--------|-------|
| Users see own conversations | VERIFIED | RLS working correctly |
| Users can't access others | VERIFIED | RLS blocks unauthorized access |
| Users can mark others' messages read | VERIFIED | RLS allows this use case |
| Users can't modify others' messages | VERIFIED | RLS blocks modifications |

---

## Issues Found

### Issue 1: [Title]
- **Severity:** [Critical/High/Medium/Low]
- **Endpoint:** [METHOD] [PATH]
- **Request:** [How to reproduce]
- **Expected:** [Expected behavior]
- **Actual:** [Actual behavior]
- **Impact:** [Business impact]

---

## Observations & Recommendations

### Positive Findings:
- [What worked well]
- [API design strengths]
- [RLS implementation]

### Areas of Concern:
- [Potential issues to monitor]
- [Security considerations]
- [Performance observations]

### Recommendations for Automation:
- [API tests that should be automated]
- [Integration tests to add]
- [Security tests to implement]

---

## Next Steps

- [ ] Report critical bugs (use bug-report.md)
- [ ] Verify data integrity with DB testing
- [ ] Transition US status if PASSED
- [ ] Proceed to UI testing (if applicable)
- [ ] Create automation test cases for stable scenarios
```

---

## MCP Tools Reference

### Postman MCP
| Tool | Use Case |
|------|---------|
| `getCollections` | List available test collections |
| `getCollection` | Get collection details and requests |
| `runCollection` | Execute full test flow |
| `getEnvironments` | List environments |
| `createEnvironment` | Set up test environment |
| `putEnvironment` | Update environment variables |

### OpenAPI MCP
| Tool | Use Case |
|------|---------|
| `list-api-endpoints` | Discover available endpoints |
| `get-api-endpoint-schema` | View request/response schema |
| `mcp__openapi__get-[table]` | Execute GET request |
| `mcp__openapi__post-[table]` | Execute POST request |
| `mcp__openapi__patch-[table]` | Execute PATCH request |

---

## Best Practices Applied

1. ✅ **Test auth first** - Many issues stem from authentication problems
2. ✅ **Verify RLS policies** - Critical for multi-tenant apps
3. ✅ **Check response schemas** - Don't just check status codes
4. ✅ **Test with different users** - Verify role-based access
5. ✅ **Document exact requests** - Makes bug reproduction easier
6. ✅ **Combine with DB verification** - API might return success but data is wrong
7. ✅ **Test error messages** - Users see these, they should be helpful

---

## Integration with Trifuerza Testing

This API testing is one part of complete feature validation:

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIFUERZA TESTING                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     UI      │  │     API     │  │     DB      │         │
│  │  Testing    │  │  Testing    │  │  Testing    │         │
│  │             │  │   (THIS)    │  │             │         │
│  │ Playwright  │  │  Postman/   │  │   DBHub     │         │
│  │    MCP      │  │ OpenAPI MCP │  │    MCP      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│        │                │                │                  │
│        └────────────────┴────────────────┘                  │
│                         │                                   │
│              Complete Feature Validation                    │
└─────────────────────────────────────────────────────────────┘
```

**Recommended flow:**
1. **API Testing** - Validate backend logic works
2. **DB Testing** - Verify data integrity
3. **UI Testing** - Confirm user experience

---

## Output

- API testing session notes with all findings
- RLS policy verification results
- List of issues (if any) ready for bug reporting
- Recommendations for automation and documentation
- Complete backend validation for MYM-57

---

**Ready to execute API exploratory testing on MYM-57?**