# Test Cases: STORY-MYM-9 - View Pending Mentor Applications

**Jira Key:** MYM-9
**Epic:** MYM-8 - Mentor Vetting & Onboarding
**Generated From:** Shift-Left Analysis in Jira (2025-11-27)
**QA Engineer:** Gemini (Draft - Pending Review)

---

## Test Summary

| Category | Count |
|----------|-------|
| Positive Tests | 6 |
| Negative Tests | 4 |
| Boundary Tests | 3 |
| Integration Tests | 3 |
| API Tests | 2 |
| **Total** | **18** |

---

## Acceptance Criteria Summary

### AC-1: Admin views pending applications (Happy Path)
- **Given:** Admin authenticated + pending applications exist
- **When:** Navigate to `/admin/applications`
- **Then:** Table displays pending mentors with name, email, date + pagination

### AC-2: Empty State
- **Given:** Admin authenticated + no pending applications
- **When:** Navigate to `/admin/applications`
- **Then:** Display "No hay aplicaciones pendientes por revisar"

### AC-3: Unauthorized Access (Security)
- **Given:** Non-admin user authenticated (student/mentor)
- **When:** Navigate to `/admin/applications`
- **Then:** Redirect to `/dashboard` or show 403

### AC-4: Error Handling
- **Given:** Admin authenticated
- **When:** API fails to load data
- **Then:** Show error message with retry option

---

## Test Cases

### Positive Tests

#### TC-001: Admin views applications list successfully
- **Priority:** Critical
- **Preconditions:** Admin logged in, 5+ pending mentor applications exist
- **Steps:**
  1. Navigate to `/admin/applications`
  2. Wait for page load
- **Expected Result:**
  - Table displays all pending mentor applications
  - Each row shows: Name, Email, Application Date
  - Data ordered by `created_at` ascending (oldest first)
- **data-testid:** `applications-table`, `application-row`

#### TC-002: Pagination displays correctly
- **Priority:** High
- **Preconditions:** Admin logged in, 25+ pending applications
- **Steps:**
  1. Navigate to `/admin/applications`
  2. Verify first page shows 20 items
  3. Click "Next" button
- **Expected Result:**
  - Page 1 shows first 20 applications
  - Page 2 shows remaining applications
  - Pagination shows "Page 1 of 2"
- **data-testid:** `pagination-controls`, `pagination-next`, `pagination-prev`

#### TC-003: Click application navigates to detail
- **Priority:** High
- **Preconditions:** Admin logged in, pending applications exist
- **Steps:**
  1. Navigate to `/admin/applications`
  2. Click "Review" button on first application
- **Expected Result:**
  - Navigates to `/admin/applications/[id]`
- **data-testid:** `review-button`

#### TC-004: Loading state displays skeleton
- **Priority:** Medium
- **Preconditions:** Admin logged in
- **Steps:**
  1. Navigate to `/admin/applications`
  2. Observe during data fetch
- **Expected Result:**
  - Skeleton loader visible while loading
  - Table appears after data loads
- **data-testid:** `applications-loading`

#### TC-005: Application date formatted correctly
- **Priority:** Medium
- **Preconditions:** Admin logged in, applications exist
- **Steps:**
  1. Navigate to `/admin/applications`
  2. Check date column
- **Expected Result:**
  - Dates displayed in readable format (e.g., "Dec 2, 2025")
- **data-testid:** `application-date`

#### TC-006: Page header displays correct count
- **Priority:** Medium
- **Preconditions:** Admin logged in, 5 pending applications
- **Steps:**
  1. Navigate to `/admin/applications`
- **Expected Result:**
  - Header shows "Pending Applications (5)"
- **data-testid:** `applications-count`

---

### Negative Tests

#### TC-007: Non-admin user redirected (Student)
- **Priority:** Critical
- **Preconditions:** User with role `student` logged in
- **Steps:**
  1. Navigate directly to `/admin/applications`
- **Expected Result:**
  - Redirected to `/dashboard`
  - Does NOT see applications list
- **data-testid:** N/A (redirect)

#### TC-008: Non-admin user redirected (Mentor)
- **Priority:** Critical
- **Preconditions:** User with role `mentor` logged in
- **Steps:**
  1. Navigate directly to `/admin/applications`
- **Expected Result:**
  - Redirected to `/dashboard`
  - Does NOT see applications list
- **data-testid:** N/A (redirect)

#### TC-009: Unauthenticated user redirected to login
- **Priority:** Critical
- **Preconditions:** User not logged in
- **Steps:**
  1. Navigate directly to `/admin/applications`
- **Expected Result:**
  - Redirected to `/login?redirectTo=/admin/applications`
- **data-testid:** N/A (redirect)

#### TC-010: API error displays error state
- **Priority:** High
- **Preconditions:** Admin logged in, API returns 500
- **Steps:**
  1. Navigate to `/admin/applications`
  2. API fails
- **Expected Result:**
  - Error message: "Error al cargar las aplicaciones"
  - Retry button visible
- **data-testid:** `applications-error`, `retry-button`

---

### Boundary Tests

#### TC-011: Zero pending applications (Empty State)
- **Priority:** High
- **Preconditions:** Admin logged in, no pending applications
- **Steps:**
  1. Navigate to `/admin/applications`
- **Expected Result:**
  - Empty state message: "No hay aplicaciones pendientes por revisar"
  - No table displayed
  - No pagination controls
- **data-testid:** `applications-empty`

#### TC-012: Single pending application
- **Priority:** Medium
- **Preconditions:** Admin logged in, exactly 1 pending application
- **Steps:**
  1. Navigate to `/admin/applications`
- **Expected Result:**
  - Single row displayed
  - No pagination controls (only 1 item)
- **data-testid:** `application-row`

#### TC-013: Large dataset (100+ applications)
- **Priority:** Medium
- **Preconditions:** Admin logged in, 100+ pending applications
- **Steps:**
  1. Navigate to `/admin/applications`
  2. Navigate through pages
- **Expected Result:**
  - Pagination works correctly (5 pages of 20)
  - Page loads in < 2 seconds
- **data-testid:** `pagination-controls`

---

### Integration Tests

#### TC-014: Database query filters correctly
- **Priority:** Critical
- **Preconditions:** Mix of mentors with different verification status
- **Steps:**
  1. Create mentor with `is_verified = true`
  2. Create mentor with `is_verified = false`
  3. Admin views applications
- **Expected Result:**
  - Only `is_verified = false` mentors appear
  - Verified mentors NOT in list
- **data-testid:** N/A (database verification)

#### TC-015: RLS policy restricts non-admin access
- **Priority:** Critical
- **Preconditions:** Student/mentor user token
- **Steps:**
  1. Call API directly with non-admin token
- **Expected Result:**
  - API returns 403 Forbidden
- **data-testid:** N/A (API test)

#### TC-016: Data refresh after approval
- **Priority:** High
- **Preconditions:** Admin on applications page, another admin approves application
- **Steps:**
  1. View applications list
  2. (Simulated) Application gets approved
  3. Refresh page
- **Expected Result:**
  - Approved application no longer in list
  - Count decremented
- **data-testid:** `applications-count`

---

### API Tests

#### TC-017: API returns correct schema
- **Priority:** High
- **Preconditions:** Admin authenticated
- **Steps:**
  1. GET `/api/admin/applications?status=pending&limit=20&offset=0`
- **Expected Result:**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "created_at": "ISO8601",
        "linkedin_url": "string|null",
        "github_url": "string|null"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
  ```
- **data-testid:** N/A (API)

#### TC-018: API pagination parameters work
- **Priority:** Medium
- **Preconditions:** 25 pending applications
- **Steps:**
  1. GET `/api/admin/applications?limit=20&offset=0` → 20 results
  2. GET `/api/admin/applications?limit=20&offset=20` → 5 results
- **Expected Result:**
  - Correct slicing of data
  - Total count remains 25
- **data-testid:** N/A (API)

---

## E2E Test Scenarios

### E2E-001: Full Admin Flow
```gherkin
Feature: Admin views pending mentor applications

  Background:
    Given an admin user exists
    And 5 mentors with pending verification exist

  Scenario: Admin successfully views and navigates applications
    Given I am logged in as admin
    When I navigate to "/admin/applications"
    Then I should see 5 pending applications in the table
    And each row should display name, email, and date
    When I click the "Review" button on the first application
    Then I should be navigated to the application detail page
```

### E2E-002: Security - Unauthorized Access
```gherkin
Feature: Non-admin cannot access admin pages

  Scenario: Student user blocked from admin
    Given I am logged in as a student
    When I navigate to "/admin/applications"
    Then I should be redirected to "/dashboard"

  Scenario: Mentor user blocked from admin
    Given I am logged in as a mentor
    When I navigate to "/admin/applications"
    Then I should be redirected to "/dashboard"
```

---

## Test Data Requirements

### Users
| Email | Role | Purpose |
|-------|------|---------|
| `admin@test.com` | admin | Main test admin |
| `student@test.com` | student | Unauthorized access test |
| `mentor@test.com` | mentor | Unauthorized access test |

### Pending Applications
| Name | Email | Status | Created |
|------|-------|--------|---------|
| Carlos Mentor | carlos@test.com | pending | 2025-12-01 |
| Ana Developer | ana@test.com | pending | 2025-12-02 |
| ... (generate 5-25 for pagination tests) |

---

## Notes

- **Database GAP:** Current schema uses `is_verified` boolean, not `verification_status` enum. Tests assume `is_verified = false` means "pending".
- **Admin Role GAP:** Current `user_role` enum only has `student` | `mentor`. Need migration to add `admin`.
- **Application Date:** Using `created_at` from profiles table as "application date".

---

*Generated from Jira Shift-Left comment by Gemini - 2025-11-27*
