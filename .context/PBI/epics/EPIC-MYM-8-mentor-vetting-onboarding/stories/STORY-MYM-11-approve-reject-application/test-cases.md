# Test Cases: STORY-MYM-11 - Approve or Reject Mentor Application

**Story:** MYM-11
**Epic:** MYM-8 - Mentor Vetting & Onboarding
**Analysis Date:** 2025-11-11
**Status:** Refined by QA (Shift-Left)

---

## Test Case Summary

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| TC-011-001 | Admin approves pending mentor application | Positive | Critical |
| TC-011-002 | Admin rejects pending mentor application | Positive | Critical |
| TC-011-003 | Non-admin attempts to approve application | Negative (Security) | Critical |
| TC-011-004 | Admin acts on already processed application | Edge Case | High |
| TC-011-005 | Concurrent approval attempts | Edge Case | Medium |
| TC-011-006 | Action on deleted mentor profile | Edge Case | Medium |

---

## Detailed Test Cases

### TC-011-001: Admin approves pending mentor application (Happy Path)

**Type:** Positive
**Priority:** Critical

**Preconditions:**
- User with `admin` role is authenticated
- Mentor profile exists with `user_id` = "test-mentor-id" and `is_verified` = `false`

**Steps:**
1. Navigate to `/admin/applications/[id]`
2. Click "Approve" button
3. Confirm action (if confirmation modal exists)

**Expected Results:**
- API responds with status `200 OK`
- `is_verified` field in `profiles` table is updated to `true`
- Audit log entry is created with `action` = "approved" and correct `admin_id`
- Event is triggered to send approval email to mentor (see MYM-12)
- UI shows success feedback (toast/alert)
- User is redirected to applications list

**Test Data:**
```json
{
  "mentorId": "test-mentor-id",
  "action": "approve"
}
```

---

### TC-011-002: Admin rejects pending mentor application

**Type:** Positive
**Priority:** Critical

**Preconditions:**
- User with `admin` role is authenticated
- Mentor profile exists with `user_id` = "test-mentor-id" and `is_verified` = `false`

**Steps:**
1. Navigate to `/admin/applications/[id]`
2. Click "Reject" button
3. Enter rejection reason: "Incomplete LinkedIn profile"
4. Confirm action

**Expected Results:**
- API responds with status `200 OK`
- `is_verified` field remains `false`
- `rejection_reason` field is updated with provided reason
- Audit log entry is created with `action` = "rejected"
- Event is triggered to send rejection email to mentor (see MYM-12)
- UI shows success feedback
- User is redirected to applications list

**Test Data:**
```json
{
  "mentorId": "test-mentor-id",
  "action": "reject",
  "reason": "Incomplete LinkedIn profile"
}
```

---

### TC-011-003: Non-admin attempts to approve application

**Type:** Negative (Security)
**Priority:** Critical

**Preconditions:**
- User with `student` or `mentor` role is authenticated
- Pending mentor application exists

**Steps:**
1. Attempt to access `/admin/applications/[id]` directly
2. Attempt to call approval API endpoint

**Expected Results:**
- Page access returns `403 Forbidden` or redirects to dashboard
- API call returns `403 Forbidden`
- `is_verified` status remains unchanged
- No audit log entry is created
- No email notification is sent

**Notes:**
- This tests RLS policies and middleware protection
- Should be tested both via UI and direct API calls

---

### TC-011-004: Admin acts on already processed application

**Type:** Edge Case
**Priority:** High

**Preconditions:**
- User with `admin` role is authenticated
- Mentor profile exists with `is_verified` = `true` (already approved)

**Steps:**
1. Navigate to `/admin/applications/[id]`
2. Attempt to click "Reject" button

**Expected Results:**
- API responds with status `409 Conflict`
- Error message: "This application has already been processed"
- `is_verified` status remains unchanged
- UI shows appropriate error message
- No duplicate audit log entries

**Variations:**
- Test rejecting an already rejected application
- Test approving an already approved application

---

### TC-011-005: Concurrent approval attempts (Race Condition)

**Type:** Edge Case
**Priority:** Medium

**Preconditions:**
- Two admin users authenticated in separate sessions
- Same pending mentor application

**Steps:**
1. Admin A navigates to application detail
2. Admin B navigates to same application detail
3. Admin A clicks "Approve"
4. Admin B clicks "Reject" (nearly simultaneously)

**Expected Results:**
- First action succeeds
- Second action returns `409 Conflict`
- Only one audit log entry exists
- Final status reflects first action only
- Second admin sees appropriate error message

**Notes:**
- Tests optimistic locking implementation
- May require manual testing or specialized concurrent test setup

---

### TC-011-006: Action on deleted mentor profile

**Type:** Edge Case
**Priority:** Medium

**Preconditions:**
- Admin has application detail page open
- Mentor profile is deleted (by user or another admin) while page is open

**Steps:**
1. Admin views application detail page
2. Mentor profile is deleted from database
3. Admin clicks "Approve" button

**Expected Results:**
- API responds with status `404 Not Found`
- Error message: "Application not found"
- UI shows appropriate error message
- No orphan audit log entries

---

## API Contract

### Endpoint: Update Application Status

**Method:** Server Action (Next.js) or `PUT /api/admin/applications/[id]/status`

**Request Body:**
```typescript
{
  action: 'approve' | 'reject'
  reason?: string  // Required if action is 'reject'
}
```

**Response Codes:**
| Code | Description |
|------|-------------|
| 200 | Success - status updated |
| 400 | Bad Request - invalid action or missing reason for rejection |
| 403 | Forbidden - user is not admin |
| 404 | Not Found - application/profile doesn't exist |
| 409 | Conflict - application already processed |
| 500 | Server Error - unexpected failure |

**Success Response:**
```typescript
{
  success: true
  updatedAt: string  // ISO timestamp
}
```

**Error Response:**
```typescript
{
  success: false
  error: string  // Human-readable error message
}
```

---

## UI Validation Points

### Approve Button
- Should be enabled only for pending applications
- Should show loading state during API call
- Should be disabled after successful action

### Reject Button
- Should be enabled only for pending applications
- Should open modal/form for rejection reason
- Reason field should be required (min 10 characters)
- Should show loading state during API call

### Confirmation Flow
- Consider confirmation dialog for destructive actions
- Show mentor name in confirmation message
- Allow cancellation

### Success/Error Feedback
- Toast notification for success
- Inline error message for failures
- Redirect to list after success (with delay for toast)

---

## Coverage Matrix

| Acceptance Criteria | Test Cases |
|---------------------|------------|
| Admin can approve pending application | TC-011-001 |
| Status updated to 'approved' | TC-011-001 |
| Mentor removed from pending list | TC-011-001 |
| Admin can reject pending application | TC-011-002 |
| Status updated to 'rejected' | TC-011-002 |
| Rejection reason is saved | TC-011-002 |
| Non-admin cannot access | TC-011-003 |
| Already processed applications handled | TC-011-004 |

---

## Notes for Implementation

1. **Audit Log**: Consider creating `application_audit_log` table or using existing logging mechanism
2. **Email Integration**: Coordinate with MYM-12 for notification triggers
3. **Optimistic UI**: Consider optimistic updates for better UX
4. **Revalidation**: Use `revalidatePath` after Server Action to refresh list

---

**Extracted from:** `story.md` section "🧪 QA Refinements (Shift-Left Analysis)"
**Last updated:** 2025-12-05
