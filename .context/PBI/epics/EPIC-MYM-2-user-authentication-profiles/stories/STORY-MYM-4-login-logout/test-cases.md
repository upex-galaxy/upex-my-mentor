## Shift-Left Test Cases - Generated 2025-11-27
QA Engineer: AI-Generated
Status: Draft – Pending PO/Dev review

---
FASE 1: Critical Analysis
- Business context: Login/Logout unlocks every authenticated journey for Laura (student) and Carlos (mentor); without it, booking, profiles, and payments are inaccessible.
- Technical context: UI /login + logout control; Supabase Auth signInWithPassword/signOut; JWT in HttpOnly+Secure cookie (SameSite=Lax) or Supabase session; protected routes /dashboard/* must redirect when unauthenticated; API contract /api/auth/login (200 on success, 401 on invalid creds).
- Story complexity: Medium (simple UI, critical auth/security requirements, rate-limit behavior).
- Epic risks inherited: Email delivery failures, weak passwords, session hijacking, XSS/SQLi, password-reset token safety, rate limiting (5 attempts/15m).

FASE 2: Story Quality
- Ambiguities:
  - Handling for unverified emails (block? allow read-only? resend flow?).
  - Rate-limit response shape (429 + Retry-After vs lockout flag/message).
  - Cookie attributes confirmation (SameSite value to assert in tests).
- Gaps: No explicit UX for resend verification; no explicit lockout message copy.
- Edge cases: Session expiry (7-day token) forces re-auth; cross-tab logout invalidates other tabs; network failure after auth response should not leave partial session.

FASE 3: Refined Acceptance Criteria (aligned with description)
1) Verified login (positive, critical): Email-verified active user logs in on /login -> 200, HttpOnly+Secure session stored, redirect to /dashboard, user context loaded.
2) Invalid credentials (negative, high): Wrong email/password -> 401, exact copy "Invalid login credentials.", no session created, protected routes still redirect.
3) Rate limit (negative, high): 6th failed attempt within 15 minutes blocked (429/lockout); cooldown resets after window; no session side effects.
4) Unverified email (edge, needs PO): Login blocked with guidance and resend verification option; no session issued.
5) Logout (positive, critical): From authenticated state, signOut clears cookies/tokens, redirects to homepage; subsequent /dashboard access redirects to /login.

FASE 4: Test Design
Coverage plan: 7 UI/API-focused cases (3 positive, 3 negative, 1 edge + redirect checks). Parametrization not needed beyond credential sets.

TC-001 – Successful login (verified user)
Type: Positive | Priority: Critical | Level: UI/API
Pre: Verified user exists (laura@example.com / valid password).
Steps: Go to /login -> enter valid creds -> submit.
Expected: API 200; HttpOnly+Secure auth cookie set (SameSite=Lax); Supabase session available; redirect to /dashboard; header shows user email; no console errors.

TC-002 – Invalid password
Type: Negative | Priority: High | Level: UI/API
Pre: Verified user exists.
Steps: Login with correct email + wrong password.
Expected: 401; UI shows exact copy “Invalid login credentials.”; no auth cookie; protected route still redirects to /login.

TC-003 – Invalid email format
Type: Negative | Priority: Medium | Level: UI
Steps: Enter not-an-email + valid-looking password; submit.
Expected: Client validation prevents request or returns 400-style message; no API call or shows field-level error; no session created.

TC-004 – Unverified email login (pending PO confirmation)
Type: Edge | Priority: High | Level: UI/API
Pre: Account exists but email not verified.
Steps: Attempt login with correct creds.
Expected: Blocked; message instructs to verify email and offers resend; no session cookie.

TC-005 – Rate limiting after 5 failures
Type: Negative | Priority: High | Level: API
Pre: Existing account.
Steps: 5 rapid invalid logins, then 6th within 15m.
Expected: Attempts 1-5 return 401; attempt 6 blocked (429 or lockout response per contract); UI shows lockout message; after cooldown or Retry-After, valid login succeeds.

TC-006 – Access protected route without session
Type: Negative | Priority: High | Level: UI
Steps: In incognito/no session, navigate directly to /dashboard.
Expected: Redirect to /login; no flash of protected content; URL updates accordingly.

TC-007 – Logout clears session
Type: Positive | Priority: Critical | Level: UI/API
Pre: Authenticated user on dashboard.
Steps: Click “Logout”.
Expected: signOut invoked; auth cookie cleared; user redirected to homepage; refreshing /dashboard redirects to /login; Supabase getSession returns null.

Action Required
- PO: Clarify unverified-email behavior and lockout messaging/response code. Confirm SameSite value for auth cookie.
- Dev: Confirm rate-limit contract (status code + headers) and resend-verification API hook.
- QA: Update after PO/Dev answers.

Local path: .context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-4-login-logout/test-cases.md
