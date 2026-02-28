# Bug Report: Mentor Gallery Pagination Does Not Advance

**Title:** MentorDiscovery: Galería: Paginación mantiene "Siguiente" activo pero no actualiza resultados

**Error Type:** Functional

**Severity:** Medium

**Test Environment:** Staging

**Steps to Reproduce:**
1. Navigate to `https://staging-upexmymentor.vercel.app/mentors`.
2. Observe the "20 mentores encontrados" count.
3. Scroll to the bottom of the page.
4. Verify the "Siguiente" button is enabled.
5. Click the "Siguiente" button.
6. Observe that the list does not change and the page indicator remains on "Página 1".
7. Check Network for the pagination request.

**Expected Result:**
If there are only 20 mentors and the page size covers them all, the "Siguiente" button should be disabled.
If there are more mentors, clicking "Siguiente" should load the next set of mentors and update the page indicator.

**Actual Result:**
The "Siguiente" button is enabled. Clicking it performs a request to `/mentors?cursor=...&page=2` (200 OK), but the displayed mentor list does not change and the page indicator stays on "Página 1".

**Root Cause Analysis:**
Investigation needed. Likely an issue in cursor/`hasNextPage` logic in `src/app/(main)/mentors/page.tsx` or in `src/components/mentors/mentor-pagination.tsx` that keeps "Siguiente" enabled and does not update state when no new results are returned.

**Evidence:**
- Network shows `GET /mentors?cursor=...&page=2` returning 200 OK.
- UI remains unchanged after clicking "Siguiente".

**Workaround:**
None (users cannot see more mentors if they exist, or are confused by the button if they don't).
