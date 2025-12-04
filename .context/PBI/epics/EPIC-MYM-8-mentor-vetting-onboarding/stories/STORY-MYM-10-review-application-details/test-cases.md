# Test Cases: STORY-MYM-10 - Review Mentor Application Details

**Fecha:** 2025-12-04
**QA Engineer:** AI-Generated (Claude Code)
**Story Jira Key:** MYM-10
**Epic:** EPIC-MYM-8 - Mentor Vetting & Onboarding
**Status:** ✅ Approved - PO Questions Resolved (2025-12-04)

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Admin User (Platform Operator) - Reviews mentor credentials to ensure quality
- **Secondary:** Carlos (Mentor Persona, 40 años, Arquitecto Senior) - Indirectly affected; his profile is what admins review to verify his qualifications

**Business Value:**

- **Value Proposition:** Enables admin to assess mentor qualifications individually, supporting the "verified mentors" core differentiator
- **Business Impact:** Critical for maintaining target metrics:
  - 80%+ approval rate (indicates good mentor attraction)
  - <10 min average review time per application
  - 100% applications reviewed within 48 hours

**Related User Journey:**

- Journey: Mentor Registration & Verification (Journey 2 in user-journeys.md)
- Step: Step 4 - "Admin reviews LinkedIn/GitHub + bio" (Critical decision point before approval/rejection in MYM-11)

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Route: `/admin/applications/[id]/page.tsx` (NEW - Next.js 15 dynamic route)
- Components: ApplicationDetailView (NEW), MentorProfileCard (NEW), BackButton
- Layout: Uses existing `AdminLayout` from MYM-9
- State Management: Server Component (RSC) - no client state needed

**Backend:**

- Query: Supabase `SELECT * FROM profiles WHERE id = {application_id}`
- Fields Required: id, name, email, bio, specialties, linkedin_url, github_url, avatar_url, created_at, hourly_rate, is_verified, role, **years_of_experience**, **languages**, **timezone** (PO Decision: Extended fields)
- Security: RLS policy must allow admin to read mentor profiles

**External Services:**

- None directly (LinkedIn/GitHub links are external but not API calls)

**Integration Points:**

- MYM-9 (View Pending Applications): "Review" button navigates to this page
- MYM-11 (Approve/Reject): This page will host action buttons (future integration)
- profiles table: Source of all mentor data

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Low - Display only, no mutations
- Integration complexity: Medium - Must integrate with MYM-9 navigation and prepare for MYM-11 actions
- Data validation complexity: Low - Read-only display, no input validation needed
- UI complexity: Medium - Multiple data fields, external links, responsive design, edge case handling

**Estimated Test Effort:** Medium
**Rationale:** 16 test cases needed covering positive paths, authorization (critical for security), edge cases, and UI validation. The Feature Test Plan estimated 16 test cases for this story.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- **Risk T1: Admin Access Control Bypass (CRITICAL)**
  - **Relevance to This Story:** Directly applicable - must verify non-admin users CANNOT access `/admin/applications/[id]` route
  - Test Coverage: TC-006, TC-007, TC-016

- **Risk T2: LinkedIn/GitHub URL Validation (HIGH)**
  - **Relevance to This Story:** URLs displayed on this page must be clickable external links opening in new tab
  - Test Coverage: TC-002, TC-003, TC-013

**Integration Points from Epic Analysis:**

- **Frontend → Backend API:** ✅ Applies - Page fetches mentor profile data via Supabase
- **Admin Auth → Route Protection:** ✅ Applies - Middleware protects /admin/* routes

**Test Strategy from Epic:**

- Test Levels: Unit (Vitest), Integration, E2E (Playwright), Security
- Tools: Playwright for E2E, Vitest for components
- **How This Story Aligns:** Focus on E2E and UI tests; security tests for RBAC

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** This story is the "detail view" step in the vetting workflow - admin clicks from MYM-9 list → views full profile here → makes decision in MYM-11
- **Inherited Risks:** Access control bypass (T1), URL validation (T2)
- **Unique Considerations:** Must handle edge cases like missing photos, empty specialties, already-processed applications

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Which fields exactly should be displayed?

- **Location in Story:** Acceptance criteria says "full profile information (name, bio, skills, experience, etc.)"
- **Question for PO/Dev:** Is this the complete list: name, email, bio, specialties, linkedin_url, github_url, avatar_url, created_at, hourly_rate?
- **Impact on Testing:** Cannot verify completeness without explicit field list
- **Suggested Clarification:** Confirm fields: name, email, bio, specialties[], linkedin_url, github_url, avatar_url, created_at, hourly_rate

**Ambiguity 2:** What if LinkedIn/GitHub URLs are invalid, private, or unreachable?

- **Location in Story:** Not mentioned in original acceptance criteria
- **Question for PO/Dev:** Should we validate URLs? Display warning if 404?
- **Impact on Testing:** Cannot test URL validation behavior without specification
- **Suggested Clarification:** For MVP, display URLs as clickable links without validation. Admin manually clicks to verify.

**Ambiguity 3:** Can admin view already-approved or rejected applications?

- **Location in Story:** Original story implies only pending applications
- **Question for PO/Dev:** For audit purposes, should admins be able to view VERIFIED/REJECTED applications?
- **Impact on Testing:** Need to test access to applications in different states
- **Suggested Clarification:** Yes - admins should view all applications for audit purposes

---

### Missing Information / Gaps

**Gap 1:** Error message specifications

- **Type:** Technical Details
- **Why It's Critical:** QA needs exact messages to verify UI displays correct feedback
- **Suggested Addition:** Define error messages for 403, 404, 500 scenarios
- **Impact if Not Added:** Tests cannot verify correct user feedback

**Gap 2:** Loading state behavior

- **Type:** UX Details
- **Why It's Critical:** Users need feedback while data loads
- **Suggested Addition:** Show skeleton/spinner while fetching application data
- **Impact if Not Added:** Poor UX if page appears blank during load

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Missing Profile Photo

- **Scenario:** Application has avatar_url = null
- **Expected Behavior:** Display placeholder avatar (user icon or initials)
- **Criticality:** Medium
- **Action Required:** Add to test cases (TC-011)

**Edge Case 2:** Empty Specialties Array

- **Scenario:** Application has specialties = []
- **Expected Behavior:** Display "No specialties listed" message
- **Criticality:** Medium
- **Action Required:** Add to test cases (TC-012)

**Edge Case 3:** Very Long Bio

- **Scenario:** Bio is 5000+ characters
- **Expected Behavior:** Render full bio with proper text wrapping, scrollable if needed
- **Criticality:** Low
- **Action Required:** Add to test cases (TC-014)

**Edge Case 4:** Missing GitHub URL

- **Scenario:** github_url = null, linkedin_url present
- **Expected Behavior:** Only show LinkedIn link, GitHub section hidden
- **Criticality:** Medium
- **Action Required:** Add to test cases (TC-013)

**Edge Case 5:** Already Processed Application

- **Scenario:** Admin navigates to VERIFIED or REJECTED application
- **Expected Behavior:** Page displays with status indicator for audit purposes
- **Criticality:** High
- **Action Required:** Add to test cases (TC-010)

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Acceptance criteria are vague (field list not explicit)
- [x] Expected results are not specific enough (error messages)
- [ ] Missing test data examples
- [x] Missing error scenarios (clarified in refined AC)
- [ ] Missing performance criteria (if NFR applies)
- [ ] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**

1. Define explicit field list for display
2. Specify error messages for 403, 404, 500
3. Confirm edge case behaviors (missing photo, empty specialties)

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: Admin successfully views pending application details (Happy Path)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Admin is logged in with role='admin'
  - Application exists with ID=uuid-123, status=PENDING (is_verified=false)
  - Application has: name="John Doe", email="john@test.com", bio="10+ years experience...", specialties=["React", "Node.js"], linkedin_url="https://linkedin.com/in/johndoe", github_url="https://github.com/johndoe"

- **When:**
  - Admin navigates to /admin/applications/uuid-123

- **Then:**
  - Page displays within 2 seconds (performance target)
  - Mentor name "John Doe" displayed prominently
  - Email "john@test.com" displayed
  - Full bio text displayed
  - Specialties displayed as badges: "React", "Node.js"
  - LinkedIn URL is clickable link (opens in new tab)
  - GitHub URL is clickable link (opens in new tab)
  - Avatar image displayed (or placeholder)
  - Application date (created_at) displayed
  - Hourly rate displayed (if applicable)

---

### Scenario 2: Non-admin user access denied

**Type:** Negative (Security)
**Priority:** Critical

- **Given:**
  - User is logged in with role='mentor' (not admin)
  - Application uuid-123 exists

- **When:**
  - User navigates directly to /admin/applications/uuid-123

- **Then:**
  - System does NOT display application details
  - User is redirected to /dashboard or shown 403 Forbidden page
  - Error message indicates lack of permission

---

### Scenario 3: Application not found

**Type:** Negative
**Priority:** High

- **Given:**
  - Admin is logged in with role='admin'
  - No application exists with ID=non-existent-uuid

- **When:**
  - Admin navigates to /admin/applications/non-existent-uuid

- **Then:**
  - System displays 404 Not Found page
  - Message: "Application not found"
  - Link/button to return to applications list

---

### Scenario 4: Unauthenticated user redirected to login

**Type:** Negative (Security)
**Priority:** Critical

- **Given:**
  - No user is logged in (no session)

- **When:**
  - Visitor navigates directly to /admin/applications/uuid-123

- **Then:**
  - System redirects to /login
  - Optionally stores intended destination for post-login redirect

---

### Scenario 5: LinkedIn URL opens in new tab with security attributes

**Type:** Positive
**Priority:** High

- **Given:**
  - Admin is viewing application with linkedin_url="https://linkedin.com/in/johndoe"

- **When:**
  - Admin clicks the LinkedIn link

- **Then:**
  - New browser tab opens
  - URL is "https://linkedin.com/in/johndoe"
  - Link has rel="noopener noreferrer" (security)

---

### Scenario 6: Application with missing optional fields displays gracefully

**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis (FASE 2)

- **Given:**
  - Application exists with:
    - github_url = null
    - avatar_url = null
    - specialties = []
    - hourly_rate = null

- **When:**
  - Admin views the application detail page

- **Then:**
  - GitHub section is NOT rendered (hidden, not broken)
  - Placeholder avatar displayed instead of broken image
  - "No specialties listed" message shown
  - Hourly rate section hidden or shows "Not specified"
  - **⚠️ NOTE:** Edge case NOT in original story - verify with PO

---

### Scenario 7: Admin views already-approved application (Audit)

**Type:** Edge Case
**Priority:** High
**Source:** Identified during critical analysis (FASE 2)

- **Given:**
  - Application exists with is_verified=true (APPROVED)

- **When:**
  - Admin navigates to the application detail page

- **Then:**
  - Page loads successfully
  - All profile fields visible
  - Status indicator shows "Approved" (or similar)
  - Admin can review for audit purposes
  - **⚠️ NOTE:** Verify with PO if this is desired behavior

---

### Scenario 8: Back navigation to applications list

**Type:** Positive
**Priority:** Medium

- **Given:**
  - Admin is viewing application detail page /admin/applications/uuid-123

- **When:**
  - Admin clicks "Back to Applications" button

- **Then:**
  - Admin is navigated to /admin/applications
  - Applications table is displayed

---

## 🧪 FASE 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 16

**Breakdown:**

- Positive: 5 test cases
- Negative: 5 test cases
- Boundary/Edge: 4 test cases
- Integration: 2 test cases

**Rationale for This Number:**
The Feature Test Plan estimated 16 test cases for MYM-10. This covers:
- All 8 refined acceptance criteria scenarios
- Security-critical RBAC tests (parameterized by role)
- Edge cases for missing/null fields
- UI validation for external links
- Integration with database query

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Role-Based Access Control

- **Base Scenario:** User accesses /admin/applications/{id}
- **Parameters to Vary:** User role, expected outcome

| Role | Has Token | Expected Status | Expected Behavior |
| ---- | --------- | --------------- | ----------------- |
| admin | Yes | 200 OK | Page displays application |
| mentor | Yes | 403 Forbidden | Redirect to dashboard |
| mentee | Yes | 403 Forbidden | Redirect to dashboard |
| (none) | No | 302 Redirect | Redirect to /login |

**Total Tests from Parametrization:** 4
**Benefit:** Single test code covers all authorization scenarios

**Parametrized Test Group 2:** Application Status Visibility

- **Base Scenario:** Admin views application in different states
- **Parameters to Vary:** is_verified value, expected display

| is_verified | Status | Expected Display |
| ----------- | ------ | ---------------- |
| false | PENDING | Show with no status badge |
| true | APPROVED | Show with "Approved" indicator |
| null (rejected) | REJECTED | Show with "Rejected" indicator |

**Total Tests from Parametrization:** 3
**Benefit:** Confirms audit capability for all application states

---

### Test Cases

#### **TC-001: Admin successfully views pending application details**

**Related Scenario:** Scenario 1 (Happy Path)
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

---

**Preconditions:**

- Admin user logged in (email: admin@upexmymentor.com, role: admin)
- Test application exists in database:
  - id: "test-uuid-001"
  - name: "John Doe"
  - email: "john@test.com"
  - bio: "Senior software engineer with 10+ years experience..."
  - specialties: ["React", "Node.js", "AWS"]
  - linkedin_url: "https://linkedin.com/in/johndoe"
  - github_url: "https://github.com/johndoe"
  - avatar_url: "https://example.com/avatar.jpg"
  - is_verified: false
  - created_at: "2025-12-01T10:00:00Z"
  - hourly_rate: 75

---

**Test Steps:**

1. Navigate to /admin/applications
   - **Verify:** Applications table is displayed
2. Locate application for "John Doe"
   - **Verify:** Row exists with name "John Doe"
3. Click "Review" button for John Doe's application
   - **Verify:** URL changes to /admin/applications/test-uuid-001
4. Verify page content displays all fields
   - **Verify:**
     - data-testid="application-detail" is present
     - Name "John Doe" displayed
     - Email "john@test.com" displayed
     - Bio text visible
     - Specialties as badges
     - LinkedIn and GitHub links visible

---

**Expected Result:**

- **UI:** Application detail page fully rendered with all mentor information
- **Data Accuracy:** All displayed values match test data
- **Performance:** Page loads within 2 seconds

---

**Test Data:**

```json
{
  "user": {
    "email": "admin@upexmymentor.com",
    "role": "admin"
  },
  "application": {
    "id": "test-uuid-001",
    "name": "John Doe",
    "email": "john@test.com",
    "bio": "Senior software engineer with 10+ years experience in building scalable web applications...",
    "specialties": ["React", "Node.js", "AWS"],
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe",
    "is_verified": false
  }
}
```

---

**Post-conditions:**

- No data changes (read-only operation)

---

#### **TC-002: LinkedIn URL opens in new tab with security attributes**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Admin viewing application detail page
- Application has linkedin_url: "https://linkedin.com/in/johndoe"

---

**Test Steps:**

1. Locate LinkedIn link element on page
   - **Data:** Look for link with text "LinkedIn" or LinkedIn icon
2. Verify link has correct href attribute
   - **Verify:** href="https://linkedin.com/in/johndoe"
3. Verify link has target="_blank"
   - **Verify:** Opens in new tab
4. Verify link has rel="noopener noreferrer"
   - **Verify:** Security attributes present

---

**Expected Result:**

- **UI:** LinkedIn link is visible and properly formatted
- **Security:** rel="noopener noreferrer" prevents tabnabbing attacks
- **Behavior:** Click opens new tab (not same tab)

---

#### **TC-003: GitHub URL opens in new tab with security attributes**

**Related Scenario:** Scenario 5 (analogous for GitHub)
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Admin viewing application detail page
- Application has github_url: "https://github.com/johndoe"

---

**Test Steps:**

1. Locate GitHub link element on page
2. Verify link has correct href attribute
   - **Verify:** href="https://github.com/johndoe"
3. Verify link has target="_blank"
4. Verify link has rel="noopener noreferrer"

---

**Expected Result:**

- **UI:** GitHub link is visible and properly formatted
- **Security:** rel="noopener noreferrer" present
- **Behavior:** Click opens new tab

---

#### **TC-004: Back button returns to applications list**

**Related Scenario:** Scenario 8
**Type:** Positive
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** ❌ No

---

**Preconditions:**

- Admin is on application detail page /admin/applications/test-uuid-001

---

**Test Steps:**

1. Verify "Back to Applications" button is visible
   - **Verify:** data-testid="back-button" exists
2. Click "Back to Applications" button
3. Verify navigation occurred

---

**Expected Result:**

- **UI:** URL changes to /admin/applications
- **UI:** Applications table is visible
- **Navigation:** Previous page state preserved (if any filters were applied)

---

#### **TC-005: Specialties displayed as badges**

**Related Scenario:** Scenario 1 (component of happy path)
**Type:** Positive
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Application with specialties: ["React", "Node.js", "AWS"]

---

**Test Steps:**

1. Navigate to application detail page
2. Locate specialties section
3. Verify each specialty rendered as Badge component

---

**Expected Result:**

- **UI:** 3 Badge components visible
- **Content:** Badges contain text "React", "Node.js", "AWS"
- **Styling:** Badges use secondary variant styling

---

#### **TC-006: Non-admin user (mentor) gets 403 Forbidden**

**Related Scenario:** Scenario 2
**Type:** Negative (Security)
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- User logged in with role='mentor' (email: carlos@test.com)
- Application test-uuid-001 exists

---

**Test Steps:**

1. Navigate directly to /admin/applications/test-uuid-001
2. Observe system response

---

**Expected Result:**

- **Security:** User does NOT see application details
- **Navigation:** Redirected to /dashboard OR shown 403 page
- **UI:** Error message "You do not have permission to access this page"

---

**Test Data:**

```json
{
  "user": {
    "email": "carlos@test.com",
    "role": "mentor"
  }
}
```

---

#### **TC-007: Unauthenticated user redirected to login**

**Related Scenario:** Scenario 4
**Type:** Negative (Security)
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- No user logged in (clear session/cookies)

---

**Test Steps:**

1. Navigate directly to /admin/applications/test-uuid-001

---

**Expected Result:**

- **Security:** User cannot access page
- **Navigation:** Redirected to /login
- **Optional:** URL includes redirect parameter for post-login return

---

#### **TC-008: Application ID not found returns 404**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

---

**Preconditions:**

- Admin logged in
- No application exists with ID "non-existent-uuid-999"

---

**Test Steps:**

1. Navigate to /admin/applications/non-existent-uuid-999

---

**Expected Result:**

- **UI:** 404 Not Found page displayed
- **UI:** Message "Application not found"
- **UI:** Link/button to return to applications list
- **Status:** HTTP 404 returned (if checking response)

---

#### **TC-009: Malformed UUID returns 400 or 404**

**Related Scenario:** Error handling
**Type:** Negative
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** ❌ No

---

**Preconditions:**

- Admin logged in

---

**Test Steps:**

1. Navigate to /admin/applications/invalid-not-a-uuid

---

**Expected Result:**

- **UI:** Error page displayed (400 Bad Request or 404 Not Found)
- **System:** No crash, graceful error handling
- **Security:** No stack trace or sensitive info exposed

---

#### **TC-010: View already approved application (audit capability)**

**Related Scenario:** Scenario 7
**Type:** Edge Case
**Priority:** High
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 2)

---

**Preconditions:**

- Admin logged in
- Application exists with is_verified=true (approved)

---

**Test Steps:**

1. Navigate to the approved application's detail page
2. Verify page loads successfully
3. Verify all profile fields are visible

---

**Expected Result:**

- **UI:** Page loads successfully (no 403)
- **UI:** Status indicator shows "Approved" or similar
- **UI:** All profile fields visible for audit purposes
- **Behavior:** Admin can review historical decisions

---

#### **TC-011: Missing avatar displays placeholder**

**Related Scenario:** Scenario 6 (edge case)
**Type:** Edge Case
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Application with avatar_url = null

---

**Test Steps:**

1. Navigate to application detail page
2. Locate avatar display area

---

**Expected Result:**

- **UI:** Placeholder avatar displayed (user icon or initials)
- **UI:** No broken image icon
- **Styling:** Placeholder styled consistently with design system

---

#### **TC-012: Empty specialties shows fallback message**

**Related Scenario:** Scenario 6 (edge case)
**Type:** Edge Case
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Application with specialties = []

---

**Test Steps:**

1. Navigate to application detail page
2. Locate specialties section

---

**Expected Result:**

- **UI:** "No specialties listed" text displayed
- **UI:** No empty badges or broken layout

---

#### **TC-013: Missing GitHub URL hides GitHub section**

**Related Scenario:** Scenario 6 (edge case)
**Type:** Edge Case
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Application with github_url = null, linkedin_url present

---

**Test Steps:**

1. Navigate to application detail page
2. Verify LinkedIn link is visible
3. Verify GitHub section

---

**Expected Result:**

- **UI:** LinkedIn link IS rendered
- **UI:** GitHub section NOT rendered (hidden)
- **UI:** No "null" or "undefined" text displayed

---

#### **TC-014: Very long bio renders correctly**

**Related Scenario:** Boundary value testing
**Type:** Boundary
**Priority:** Low
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Application with bio = 5000+ character text

---

**Test Steps:**

1. Navigate to application detail page
2. Locate bio section
3. Verify entire bio is rendered

---

**Expected Result:**

- **UI:** Full bio text rendered (no truncation)
- **UI:** Proper text wrapping
- **UI:** Scrollable container if needed
- **Layout:** Page layout not broken by long text

---

**Test Data:**

```json
{
  "bio": "Lorem ipsum dolor sit amet... [5000+ characters]"
}
```

---

#### **TC-015: Database query filters by application ID**

**Related Scenario:** Integration verification
**Type:** Integration
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Multiple applications exist in database
- Admin is authenticated

---

**Test Steps:**

1. Make request to view application with ID "test-uuid-001"
2. Verify query executed with correct filter

---

**Expected Result:**

- **Query:** Supabase query includes `WHERE id = 'test-uuid-001'`
- **Data:** Only the requested application's data returned
- **Security:** Other applications' data not exposed

---

#### **TC-016: RLS policy allows admin to read application**

**Related Scenario:** Security - Row Level Security
**Type:** Integration (Security)
**Priority:** Critical
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Admin JWT token with role='admin'
- Application exists in profiles table

---

**Test Steps:**

1. Make Supabase query with admin authentication
2. Request application by ID

---

**Expected Result:**

- **Status:** 200 OK
- **Data:** Profile data returned successfully
- **RLS:** Policy check passes for admin role

---

## 🔗 Integration Test Cases

### Integration Test 1: Frontend → Supabase profiles table

**Integration Point:** Next.js page → Supabase Client → profiles table
**Type:** Integration
**Priority:** High

**Preconditions:**

- Supabase client configured with correct credentials
- profiles table has test data
- Admin session active

**Test Flow:**

1. Page component calls `supabase.from('profiles').select().eq('id', applicationId)`
2. Supabase returns profile data
3. Page renders with profile data

**Contract Validation:**

- Query returns expected fields
- Data types match TypeScript interface
- Null handling works correctly

**Expected Result:**

- Profile data displays correctly
- No N+1 queries (verified with Supabase logs)
- Response time <500ms

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --------- | -------------------------- | -------------------- | --------- | -------- |
| Missing avatar_url | ❌ No | ✅ Yes (Scenario 6) | TC-011 | Medium |
| Empty specialties[] | ❌ No | ✅ Yes (Scenario 6) | TC-012 | Medium |
| Missing github_url | ❌ No | ✅ Yes (Scenario 6) | TC-013 | Medium |
| Very long bio (5000+ chars) | ❌ No | ✅ Yes (boundary) | TC-014 | Low |
| Already VERIFIED application | ❌ No | ✅ Yes (Scenario 7) | TC-010 | High |
| Malformed UUID in URL | ❌ No | ⚠️ Add to test cases | TC-009 | Medium |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
| --------- | ----- | ------- | -------- |
| Valid applications | 3 | Positive tests | Pending, Approved, Rejected |
| Invalid IDs | 2 | Negative tests | Non-existent UUID, malformed string |
| Edge case profiles | 3 | Edge case tests | Missing avatar, empty specialties, missing GitHub |
| Boundary values | 1 | Boundary tests | Bio with 5000+ characters |

### Data Generation Strategy

**Static Test Data:**

- Admin user: admin@upexmymentor.com (consistent for all tests)
- Application IDs: test-uuid-001, test-uuid-002, test-uuid-003
- Fixed LinkedIn/GitHub URLs for verification

**Dynamic Test Data (using Faker.js):**

- Mentor names: `faker.person.fullName()`
- Email addresses: `faker.internet.email()`
- Bio text: `faker.lorem.paragraphs(10)` (for boundary tests)

**Test Data Cleanup:**

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order

---

## 📝 FASE 5: Integration Summary

### FASE 5a: Story Updated in Jira

- ✅ Label `shift-left-reviewed` added to MYM-10

### FASE 5b: Test Cases Comment in Jira

- ✅ Test cases comment added (Comment ID: 41536)
- ✅ PO Response comment added (Comment ID: 41537)

### FASE 5c: Local test-cases.md

- ✅ This file created and synced with Jira

---

## ✅ PO Decisions (2025-12-04)

### 1. Campos a mostrar en UI

**Decision:** Campos extendidos

**Field List Confirmed:**
- name, email, bio, specialties[], linkedin_url, github_url, avatar_url, created_at, hourly_rate
- **NEW:** years_of_experience, languages, timezone

> **Note:** Los campos nuevos deberán agregarse a la tabla profiles si no existen.

### 2. Visibilidad de aplicaciones procesadas

**Decision:** Sí, todas visibles para auditoría

- Admin puede ver aplicaciones en CUALQUIER estado: PENDING, VERIFIED, REJECTED
- UI debe mostrar indicador de estado claramente

### 3. Manejo de campos opcionales vacíos

**Decision:** Placeholders para todos

- `avatar_url = null` → Placeholder avatar (user icon)
- `github_url = null` → "Not provided"
- `linkedin_url = null` → "Not provided"
- `specialties = []` → "No specialties listed"

> **Rationale:** Consistencia visual, admin siempre ve todas las secciones

---

## 🎯 Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All 16 test cases executed and passing
- [ ] Critical tests (TC-001, TC-006, TC-007, TC-008, TC-016): 100% passing
- [ ] Medium/Low priority tests: ≥95% passing
- [ ] Security tests verify non-admin cannot access page
- [ ] Edge cases handled gracefully (missing photos, empty specialties)
- [ ] No critical or high bugs open
- [ ] Test execution report generated
- [ ] Exploratory testing session completed

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/STORY-MYM-10-review-application-details/story.md`
- **Epic:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/feature-test-plan.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`

---

## 📋 Test Execution Tracking

[Esta sección se completa durante ejecución]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: 16
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Found:**

- [Bug ID 1]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

**Versión:** 1.0
**Generado:** 2025-12-04
**Metodología:** Shift-Left Testing Workflow v3.1

🤖 Generated with [Claude Code](https://claude.com/claude-code)
