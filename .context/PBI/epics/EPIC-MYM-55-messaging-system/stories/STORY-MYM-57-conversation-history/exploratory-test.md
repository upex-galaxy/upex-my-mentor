# Exploratory Testing Session: MYM-57 - Conversation History

> AI-guided exploratory testing using Playwright MCP tools for complete feature validation.

---

## Purpose

Execute comprehensive exploratory testing on MYM-57 (Conversation History) to validate functionality, discover edge cases, and identify potential defects before automation.

**This testing covers the complete Trifuerza:**
- UI Testing: User interface interactions and workflows
- API Testing: Backend endpoints and data flows
- DB Testing: Data integrity and persistence

**This prompt is executed AFTER:**
- Smoke test passed (deployment is functional)
- Feature is deployed to staging
- Shift-Left Testing test cases are available

---

## Input Context

### User Story: MYM-57 - View Conversation History
**Jira Key:** MYM-57
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** Ready For QA

### Test Cases Reference
**Source:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-57-conversation-history/test-cases.md`

**Key Scenarios from Shift-Left Testing:**
1. View conversation list with metadata
2. Sort conversations by recent activity
3. Open conversation thread view
4. Mark conversations as read
5. Handle empty state
6. Navigate between conversations

---

## Testing Environment

**Staging URL:** https://staging-upexmymentor.vercel.app
**Test User Credentials:**
- Email: `student.demo@upexmymentor.com`
- Password: `Demo123!`

**Database:** Supabase (staging)
**Tables involved:** `conversations`, `messages`, `profiles`

---

## Phase 1: Context Gathering

### Feature Analysis
MYM-57 is a conversation history feature that allows users to:
- View all their conversations with mentors/students
- Access individual conversation threads
- See message history in chronological order
- Mark conversations as read/unread
- Navigate between different conversations

### Key Components to Test
1. **Conversation List** (`/dashboard/messages`)
   - Displays all user conversations
   - Shows participant avatars and names
   - Displays last message preview
   - Shows unread message indicators
   - Sorts by recent activity

2. **Conversation Thread** (`/dashboard/messages/[conversationId]`)
   - Shows full message history
   - Displays messages in chronological order
   - Differentiates own vs. other user messages
   - Shows timestamps for each message
   - Auto-scrolls to latest message

3. **Message Actions**
   - Mark conversation as read
   - Navigate back to list
   - Click on participant profiles

---

## Phase 2: UI Exploration Plan

### Scenarios to Explore

#### 1. Happy Path - View Conversation History
**Precondition:** User is logged in and has conversations
**Steps:**
1. Navigate to `/dashboard/messages`
2. Verify conversation list loads
3. Click on a conversation
4. Verify thread opens with messages
5. Verify messages are in chronological order
6. Navigate back to list
7. Verify list maintains sorting

#### 2. Empty State - No Conversations
**Precondition:** User is logged in but has no conversations
**Steps:**
1. Navigate to `/dashboard/messages`
2. Verify empty state message displays
3. Verify CTA to find mentors works
4. Verify design is consistent with app

#### 3. Unread Message Indicators
**Precondition:** User has unread conversations
**Steps:**
1. Navigate to `/dashboard/messages`
2. Verify blue dot indicators show for unread conversations
3. Click on unread conversation
4. Verify thread opens
5. Verify blue dot disappears after viewing
6. Navigate back to list
7. Verify conversation is now marked as read

#### 4. Conversation Sorting
**Precondition:** User has multiple conversations
**Steps:**
1. Navigate to `/dashboard/messages`
2. Verify most recent conversation appears first
3. Send a new message (if possible)
4. Verify conversation moves to top of list
5. Verify timestamps update correctly

#### 5. Navigation Between Conversations
**Precondition:** User has multiple conversations
**Steps:**
1. Open conversation A
2. Navigate back to list
3. Open conversation B
4. Verify correct thread loads
5. Verify browser history/back button works
6. Verify deep linking works (direct URL to conversation)

#### 6. Edge Cases - Boundary Testing
**Precondition:** Various edge conditions
**Steps:**
1. **Very long messages:** Verify display and scrolling
2. **Special characters:** Test messages with emojis, special chars
3. **Rapid navigation:** Quick switching between conversations
4. **Browser refresh:** Verify state persistence
5. **Multiple tabs:** Test concurrent sessions
6. **Network conditions:** Test slow loading scenarios

#### 7. Error Handling - Negative Scenarios
**Precondition:** Various error conditions
**Steps:**
1. **Invalid conversation ID:** Test `/dashboard/messages/[invalid-id]`
2. **Deleted conversation:** Test accessing removed conversation
3. **Network errors:** Test with poor connectivity
4. **Permission errors:** Test accessing other user's conversations

---

## Phase 3: Test Execution

### Tools Required
- `mcp__playwright__browser_navigate` - Navigate to pages
- `mcp__playwright__browser_snapshot` - Capture page structure
- `mcp__playwright__browser_click` - Interact with elements
- `mcp__playwright__browser_type` - Fill form fields
- `mcp__playwright__browser_take_screenshot` - Capture evidence

### Test Data Setup
```bash
# Test users (if needed for testing)
STUDENT_USER = {
  "email": "student.demo@upexmymentor.com",
  "password": "Demo123!"
}

MENTOR_USER = {
  "email": "mentor.demo@upexmymentor.com", 
  "password": "Demo123!"
}
```

---

## Phase 4: Session Documentation

### Test Results Format
```markdown
### Scenario: [Name]

**Steps Executed:**
1. [Action] → [Result]
2. [Action] → [Result]
3. [Action] → [Result]

**Outcome:** [PASSED / ISSUE FOUND]

**Evidence:** [Screenshot reference or observation]

**Notes:**
- [Observation 1]
- [Observation 2]
```

---

## Phase 5: Integration with API Testing

### API Endpoints to Verify
During UI testing, observe and validate:
1. **GET /api/conversations** - Loads conversation list
2. **GET /api/conversations/[id]** - Loads conversation thread
3. **PATCH /api/conversations/[id]** - Marks as read
4. **WebSocket** - Real-time message updates

### Network Validation
- Check that API calls return appropriate status codes
- Verify response schemas match expected format
- Validate authentication headers are present
- Check for proper error handling

---

## Phase 6: Integration with DB Testing

### Database Verification
After UI operations, verify data integrity:
1. **Conversations Table:** Verify conversation records exist
2. **Messages Table:** Verify message records are correct
3. **Read Status:** Verify read/unread flags are updated
4. **Timestamps:** Verify updated_at fields are current
5. **Foreign Keys:** Verify relationships are maintained

### Sample SQL Queries
```sql
-- Verify conversation exists
SELECT id, participant_1_id, participant_2_id, updated_at 
FROM conversations 
WHERE id = '[conversation-id]';

-- Verify messages in conversation
SELECT id, sender_id, content, created_at, is_read 
FROM messages 
WHERE conversation_id = '[conversation-id]' 
ORDER BY created_at;

-- Verify read status update
SELECT is_read 
FROM messages 
WHERE conversation_id = '[conversation-id]' 
AND sender_id != '[current-user-id]';
```

---

## Phase 7: Session Summary

### Expected Output
```markdown
# Exploratory Testing Session Notes

**Date:** [Current Date]
**Feature:** MYM-57 - Conversation History
**Staging URL:** https://staging-upexmymentor.vercel.app
**Duration:** [Time spent]
**Tester:** [Your Name]

---

## Executive Summary

- **Overall Status:** [PASSED / ISSUES FOUND / BLOCKED]
- **Scenarios Tested:** [X of Y]
- **Issues Found:** [Number]
- **Severity Distribution:** [Critical/High/Medium/Low]

---

## Scenarios Tested

### 1. Happy Path - View Conversation History - [PASSED/FAILED]
[Details...]

### 2. Empty State - No Conversations - [PASSED/FAILED]
[Details...]

### 3. Unread Message Indicators - [PASSED/FAILED]
[Details...]

### 4. Conversation Sorting - [PASSED/FAILED]
[Details...]

### 5. Navigation Between Conversations - [PASSED/FAILED]
[Details...]

### 6. Edge Cases - [PASSED/FAILED]
[Details...]

### 7. Error Handling - [PASSED/FAILED]
[Details...]

---

## Issues Found

### Issue 1: [Title]
- **Severity:** [Critical/High/Medium/Low]
- **Component:** [UI/API/DB]
- **Steps to Reproduce:**
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Expected:** [Expected behavior]
- **Actual:** [Actual behavior]
- **Evidence:** [Screenshot reference]

---

## API Integration Results

| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /api/conversations | [PASSED/FAILED] | [Notes] |
| GET /api/conversations/[id] | [PASSED/FAILED] | [Notes] |
| PATCH /api/conversations/[id] | [PASSED/FAILED] | [Notes] |
| WebSocket updates | [PASSED/FAILED] | [Notes] |

---

## Database Verification Results

| Table | Status | Notes |
|-------|--------|-------|
| conversations | [VERIFIED/DISCREPANCY] | [Notes] |
| messages | [VERIFIED/DISCREPANCY] | [Notes] |
| profiles | [VERIFIED/DISCREPANCY] | [Notes] |

---

## Observations & Recommendations

### Positive Findings:
- [What worked well]
- [UI/UX strengths]
- [Performance observations]

### Areas of Concern:
- [Potential issues to monitor]
- [Usability improvements needed]
- [Performance concerns]

### Recommendations for Automation:
- [Scenarios that should be automated]
- [Priority suggestions]
- [Test types to focus on]

---

## Next Steps

- [ ] Report critical bugs (use bug-report.md)
- [ ] Create automation test cases for stable scenarios
- [ ] Transition US to "QA Approved" if PASSED
- [ ] Wait for fixes if ISSUES FOUND
- [ ] Proceed to Test Documentation phase

---

## Decision Point

| Result | Action |
|--------|--------|
| **PASSED** | Transition US to "QA Approved", proceed to Test Documentation |
| **ISSUES FOUND** | Use bug-report.md for each issue, wait for fixes |
| **BLOCKED** | Report blocker immediately, do not proceed |
```

---

## Best Practices Applied

1. ✅ **Explored, don't just execute** - Looked for unexpected behaviors
2. ✅ **Documented as we go** - Captured findings during testing
3. ✅ **Took screenshots** - Visual evidence captured for key scenarios
4. ✅ **Checked console/network** - Monitored for hidden errors
5. ✅ **Thought like a user** - Considered real user experience
6. ✅ **Time-boxed exploration** - Focused on efficient testing
7. ✅ **Covered complete feature** - UI + API + DB integration

---

## Integration with KATA

This exploratory testing feeds into:
1. **Bug Reports** - Issues found → `bug-report.md`
2. **Test Documentation** - Validated scenarios → Jira Test issues  
3. **Automation Candidates** - Stable scenarios → ATCs

The goal is to validate complete functionality BEFORE investing in automation.

---

## Output

- Complete exploratory testing session notes
- List of issues (if any) ready for bug reporting
- API integration verification results
- Database integrity verification results
- Recommendations for test documentation and automation
- Complete feature validation for MYM-57

---

**Ready to execute exploratory testing on MYM-57?**