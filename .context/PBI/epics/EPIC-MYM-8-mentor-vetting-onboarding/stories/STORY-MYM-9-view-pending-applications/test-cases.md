## 🧪 Shift-Left Test Cases - Generated 2025-11-28 (v2)

**QA Engineer:** Gemini
**Story Jira Key:** MYM-9
**Status:** Approved - Ready for Implementation

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

*   **User Persona Affected:**
    *   **Primary:** Admin User (Implicit Persona). Their goal is to efficiently manage the mentor application queue to maintain the quality and trustworthiness of the marketplace.
*   **Business Value:**
    *   **Value Proposition:** Directly supports the core value proposition of "Access to verified experts." This story is the entry point for the entire mentor vetting process.
    *   **Business Impact:** Enables the KPI of "50 verified mentors active in the first 3 months." An inefficient vetting pipeline starts here, creating a bottleneck that puts this business goal at risk.
*   **Related User Journey:**
    *   **Journey:** Mentor Verification Flow.
    *   **Step:** This story represents the very first step an Admin takes: "[Admin] views [pending applications] in the dashboard."

### Technical Context of This Story

*   **Architecture Components:**
    *   **Frontend:**
        *   **Components:** A new `ApplicationsDataTable` component, likely using `shadcn/ui` Table components, with sub-components for `Pagination`, `LoadingSkeleton`, and `EmptyState`. This will be placed within a protected `AdminLayout`.
        *   **Pages/Routes:** A new protected route: `/admin/applications`.
    *   **Backend:**
        *   **API Endpoints:** A new endpoint `GET /api/admin/applications` as defined in `api-contracts.yaml`.
        *   **Database:** A `SELECT` query on the `profiles` table, filtering by `role = 'mentor'` and `vetting_status = 'pending'`.
*   **Integration Points:**
    *   **Frontend ↔ Backend API:** The admin dashboard will fetch data from `GET /api/admin/applications`.
    *   **Backend API ↔ Supabase Database:** The API endpoint will query the `profiles` table, applying filters and pagination.
    *   **Backend ↔ Auth Service (Supabase):** The API middleware must verify that the user's JWT contains an `admin` role, enforcing security via RLS.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified (Now Resolved)

*   **Ambiguity 1: What is the "application date"?**
    *   **Status:** ✅ **Resolved.**
    *   **Resolution (from PO):** Use the `created_at` field of the mentor's profile.
*   **Ambiguity 2: What columns should the list have?**
    *   **Status:** ✅ **Resolved.**
    *   **Resolution (from PO):** The table must include: Mentor Name, Email, Application Date, and Specialties (top 3).
*   **Ambiguity 3: How should the list be ordered and paginated?**
    *   **Status:** ✅ **Resolved.**
    *   **Resolution (from PO):** Order by `created_at` ascending (oldest first), with 20 items per page.

### Missing Information / Gaps (Now Filled)

*   **Gap 1: Undefined UI states (Loading, Empty, Error).**
    *   **Status:** ✅ **Filled.**
    *   **Resolution (from PO):** The refined acceptance criteria now explicitly include these states.

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: Admin views a paginated list of pending applications (Happy Path)

*   **Given:** An `admin` user is authenticated.
*   **And:** There are 25 mentor profiles with `vetting_status = 'pending'`.
*   **When:** The admin navigates to the `/admin/applications` page.
*   **Then:** The UI must display a loading skeleton while data is being fetched.
*   **And:** A table is then rendered showing the 20 oldest pending applications.
*   **And:** The table is ordered by "Application Date" ascending.
*   **And:** The table columns are "Mentor Name", "Email", "Application Date", and "Specialties".
*   **And:** Pagination controls are displayed, indicating "Page 1 of 2".

### Scenario 2: Admin views an empty list of applications (Empty State)

*   **Given:** An `admin` user is authenticated.
*   **And:** There are 0 mentor profiles with `vetting_status = 'pending'`.
*   **When:** The admin navigates to the `/admin/applications` page.
*   **Then:** The UI must display a message: "No hay aplicaciones pendientes por revisar."
*   **And:** No table or pagination controls are visible.

### Scenario 3: Unauthorized user attempts to access the admin page (Security)

*   **Given:** A `student` or `mentor` user is authenticated.
*   **When:** The user attempts to navigate directly to `/admin/applications`.
*   **Then:** The system must redirect them to their primary dashboard (e.g., `/dashboard`).
*   **And:** The admin application list must NOT be displayed.

### Scenario 4: API fails to load applications (Error Handling)

*   **Given:** An `admin` user is authenticated.
*   **And:** The `GET /api/admin/applications` endpoint returns a 500 server error.
*   **When:** The admin navigates to the `/admin/applications` page.
*   **Then:** The UI must display an error message: "Error al cargar las aplicaciones. Por favor, intente de nuevo."
*   **And:** A "Retry" button should be available to re-fetch the data.

---

## 🧪 FASE 4: Test Design

### Test Cases

#### **TC-MYM9-01: Successful display of pending applications list**
*   **Type:** Positive, **Priority:** Critical, **Level:** E2E
*   **Steps:**
    1.  Seed the database with 25 profiles where `role='mentor'` and `vetting_status='pending'`.
    2.  Log in as an `admin`.
    3.  Navigate to `/admin/applications`.
*   **Expected Result:**
    *   A loading skeleton appears first.
    *   A table with 20 rows is displayed.
    *   The first row corresponds to the oldest application.
    *   Columns "Mentor Name", "Email", "Application Date", "Specialties" are present.
    *   Pagination shows "Page 1 of 2".

#### **TC-MYM9-02: Pagination functionality**
*   **Type:** Positive, **Priority:** High, **Level:** E2E
*   **Preconditions:** TC-MYM9-01 state.
*   **Steps:**
    1.  On the `/admin/applications` page, click the "Next" page button.
*   **Expected Result:**
    *   The table updates to show the remaining 5 applications.
    *   Pagination shows "Page 2 of 2".

#### **TC-MYM9-03: Display of empty state**
*   **Type:** Positive, **Priority:** Medium, **Level:** E2E
*   **Steps:**
    1.  Ensure no profiles have `vetting_status='pending'`.
    2.  Log in as an `admin`.
    3.  Navigate to `/admin/applications`.
*   **Expected Result:**
    *   The message "No hay aplicaciones pendientes por revisar." is displayed.
    *   No data table is rendered.

#### **TC-MYM9-04: Access denied for non-admin roles**
*   **Type:** Negative (Security), **Priority:** Critical, **Level:** E2E
*   **Steps:**
    1.  Log in as a `student` or `mentor`.
    2.  Attempt to navigate directly to the `/admin/applications` URL.
*   **Expected Result:**
    *   User is immediately redirected away from the admin page to their own dashboard.
    *   No admin data is ever loaded or visible.

#### **TC-MYM9-05: API contract for successful data retrieval**
*   **Type:** Integration, **Priority:** Critical, **Level:** API
*   **Steps:**
    1.  Make a `GET` request to `/api/admin/applications` with an admin user's JWT.
*   **Expected Result:**
    *   HTTP status `200 OK`.
    *   The response body is a JSON object containing a `data` array with mentor profiles and a `pagination` object.
    *   All profiles in the `data` array have `vetting_status: 'pending'`.

#### **TC-MYM9-06: API security for unauthorized access**
*   **Type:** Negative (Security), **Priority:** Critical, **Level:** API
*   **Steps:**
    1.  Make a `GET` request to `/api/admin/applications` with a student's JWT.
    2.  Make a `GET` request to `/api/admin/applications` with no JWT.
*   **Expected Result:**
    *   Both requests must fail with an HTTP status of `401 Unauthorized` or `403 Forbidden`.
    *   The response body must contain an appropriate error message.

---

## 📢 Action Required & Next Steps

*   **@Product Owner:**
    *   [X] Review and answer Critical Questions. (DONE)
    *   [X] Validate refined acceptance criteria. (DONE)
*   **@Dev Lead:**
    *   [ ] This story is now fully specified and **Ready for Implementation**. Please proceed.
*   **@QA Team:**
    *   [ ] Test cases are ready. Please prepare the test environment and data.

**Blocker Status:** 🟢 **GREEN.** There are no outstanding questions. Development can begin immediately.