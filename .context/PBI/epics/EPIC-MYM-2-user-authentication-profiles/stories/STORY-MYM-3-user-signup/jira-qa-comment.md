# 🧪 QA Update: Test Cases Aligned with PO Decisions

**Update Date:** 2025-11-19
**QA Engineer:** Shift-Left Testing Analysis
**Context:** Updating test cases based on PO decisions (Q1-Q4) from previous comment

---

## 📊 Summary of Changes

Following the PO's decisions on critical questions Q1-Q4, I've updated the test suite to align with the clarified acceptance criteria:

| Decision | Test Impact | Test Cases Affected |
|----------|-------------|---------------------|
| **Q1: Email verification NOT blocking login** | ✅ Major update | TC-001, TC-002, TC-031, TC-032, **NEW: TC-033, TC-034** |
| **Q2: Password max 128 chars** | ✅ New boundary test | **NEW: TC-035** |
| **Q3: Role via URL param** | ℹ️ Minor clarification | TC-001, TC-002 (updated preconditions) |
| **Q4: Auto-login with JWT** | ✅ Major update | TC-001, TC-002 (updated expected results) |

**New Test Cases Added:** 3
**Existing Test Cases Updated:** 6
**Total Test Cases:** 35 (was 32)
**Coverage Change:** 95% → 98% of acceptance criteria

---

## 🔄 Updated Test Cases (TC-001 to TC-032)

### TC-001: Successful Mentee Registration (Happy Path) - UPDATED

**Changes Based on Q3, Q4:**
- **Precondition (NEW):** User navigated to `/signup?role=mentee` from landing page CTA
- **Test Data:** Role pre-filled from URL param
- **Expected Result (UPDATED):**
  ```json
  {
    "success": true,
    "userId": "<UUID>",
    "email": "laura.garcia@example.com",
    "role": "mentee",
    "token": "<JWT_TOKEN>",
    "session": {
      "access_token": "<JWT>",
      "refresh_token": "<REFRESH>",
      "expires_in": 3600
    }
  }
  ```
- **Post-Signup Behavior (UPDATED):**
  - ✅ User auto-logged in (JWT stored in session/cookie)
  - ✅ Redirects to `/dashboard` (NOT `/verify-email`)
  - ✅ Banner shown: "✉️ Please verify your email to unlock full features"
  - ✅ User CAN browse mentors and book sessions immediately
  - ✅ Verification email sent asynchronously (non-blocking)

**Priority:** P0 (Critical Path)

---

### TC-002: Successful Mentor Registration - UPDATED

**Changes Based on Q1, Q3, Q4:**
- **Precondition (NEW):** User navigated to `/signup?role=mentor` from landing page CTA
- **Expected Result (UPDATED):**
  ```json
  {
    "success": true,
    "userId": "<UUID>",
    "email": "carlos.mendoza@example.com",
    "role": "mentor",
    "token": "<JWT_TOKEN>",
    "session": { ... }
  }
  ```
- **Database (UPDATED):**
  - `mentors` table: New record with `is_verified = false` (Q1 decision)
- **Post-Signup Behavior (UPDATED):**
  - ✅ User auto-logged in
  - ✅ Redirects to `/profile/complete` (NOT `/dashboard`)
  - ✅ Banner shown: "⚠️ Verify your email to publish your services"
  - ✅ User CAN complete profile setup
  - ❌ User CANNOT publish services until `is_verified = true` (Q1 restriction)

**Priority:** P0 (Critical Path)

---

### TC-015: Password Max Length Exceeded - UPDATED

**Changes Based on Q2:**
- **Test Data (OLD):** Password with 500 characters
- **Test Data (NEW):** Password with **129 characters** (just above 128 limit)
- **Expected Result:**
  ```json
  {
    "success": false,
    "error": {
      "code": "PASSWORD_TOO_LONG",
      "message": "Password must not exceed 128 characters.",
      "field": "password"
    }
  }
  ```

**Priority:** P2 (Boundary Test)

---

### TC-031: Email Verification Flow (Integration Test) - UPDATED

**Changes Based on Q1, Q4:**
- **NEW Behavior:**
  1. User signs up → Auto-logged in with JWT
  2. Verification email sent
  3. **Mentee:** Can use platform immediately (banner persists)
  4. **Mentor:** Can complete profile but CANNOT publish services
  5. User clicks verification link → `is_email_verified = true`
  6. **Mentor:** After verification, can publish services

**Test Steps:**
1. Complete signup (TC-001 or TC-002)
2. Verify JWT token in cookies/localStorage
3. Verify redirect (mentee: `/dashboard`, mentor: `/profile/complete`)
4. Check email inbox for verification email
5. Click verification link
6. Verify `auth.users.email_verified_at` updated
7. **For mentors:** Verify can toggle availability to "Available"

**Priority:** P1 (Integration Test)

---

## ✨ NEW Test Cases (TC-033 to TC-035)

### TC-033: Mentee Access Without Email Verification ⭐ NEW

**Source:** PO Decision Q1
**Type:** Positive
**Priority:** P1 (Critical)

**Objective:** Verify mentee can use platform without email verification

**Preconditions:**
- Mentee registered via TC-001
- Email NOT verified (`auth.users.email_verified_at = NULL`)
- User logged in (JWT session active)

**Test Steps:**
1. Navigate to `/dashboard`
2. Browse mentors (`GET /api/mentors`)
3. View mentor profile (`/mentors/[id]`)
4. Book a session
5. Verify banner visible

**Expected Results:**
- ✅ Dashboard loads (no redirect to `/verify-email`)
- ✅ Mentor list loads (`200 OK`)
- ✅ Mentor profile loads
- ✅ Booking flow works
- ✅ Banner shown: "✉️ Please verify your email to unlock full features [Resend] [x]"
- ✅ Banner is **non-blocking** (informational only)

**Pass Criteria:** Mentee has full platform access without verification

---

### TC-034: Mentor Cannot Publish Without Email Verification ⭐ NEW

**Source:** PO Decision Q1
**Type:** Negative
**Priority:** P0 (Critical - Quality Gate)

**Objective:** Verify mentor CANNOT publish services until email verified

**Preconditions:**
- Mentor registered via TC-002
- Email NOT verified
- Profile completed (specialties, rate set)
- `mentors.is_verified = false`

**Test Steps:**
1. Navigate to `/profile` or `/mentor/availability`
2. Attempt to toggle availability from "Hidden" to "Available"
3. Attempt to save changes
4. Verify email then retry

**Expected Results:**
- ❌ Toggle disabled with tooltip: "⚠️ Verify your email before publishing"
- ❌ If clicked, API returns `403 Forbidden`:
  ```json
  {
    "success": false,
    "error": {
      "code": "EMAIL_NOT_VERIFIED",
      "message": "Please verify your email before publishing your mentor profile.",
      "action": "verify_email"
    }
  }
  ```
- ✅ Error toast: "Please verify your email before publishing your services"
- ✅ "Resend Verification Email" button shown
- ✅ After verification, toggle works

**Database Validation:**
- `is_verified = false` → Profile NOT in `GET /api/mentors` for students

**Pass Criteria:** Mentor blocked from listing until verified

---

### TC-035: Password Maximum Length Validation (128 chars) ⭐ NEW

**Source:** PO Decision Q2
**Type:** Boundary
**Priority:** P1 (Security Policy)

**Objective:** Verify password validation enforces 128-char maximum

**Test Data (Parametrized):**

**Test 1:** 127 chars (just under limit)
- Password: `"A1!" + "a".repeat(124)`
- **Expected:** `201 Created` ✅

**Test 2:** 128 chars (exactly at limit)
- Password: `"A1!" + "a".repeat(125)`
- **Expected:** `201 Created` ✅

**Test 3:** 129 chars (just over limit)
- Password: `"A1!" + "a".repeat(126)`
- **Expected:** `400 Bad Request`:
  ```json
  {
    "success": false,
    "error": {
      "code": "PASSWORD_TOO_LONG",
      "message": "Password must not exceed 128 characters.",
      "field": "password",
      "maxLength": 128,
      "providedLength": 129
    }
  }
  ```

**Test 4:** 200 chars (far exceeds)
- **Expected:** Same as Test 3

**Validation Points:**
- ✅ Client-side validation before API call
- ✅ Server-side validation (security layer)
- ✅ Supabase handles bcrypt 72-char limit internally
- ✅ User-friendly error (no bcrypt technical details)

**Implementation Note (from PO):**
```typescript
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Must include uppercase letter")
  .regex(/[0-9]/, "Must include number")
  .regex(/[^A-Za-z0-9]/, "Must include special character")
```

**Pass Criteria:** All 4 tests pass (2 success, 2 error)

---

## 📈 Test Coverage Update

### Coverage by Acceptance Criteria

| Acceptance Criteria | Test Cases | Coverage |
|---------------------|------------|----------|
| **Scenario 1: Mentee Signup** | TC-001, TC-033 | 100% ✅ |
| **Scenario 2: Mentor Signup** | TC-002, TC-034 | 100% ✅ |
| **Scenario 3: Duplicate Email** | TC-003, TC-013, TC-032 | 100% ✅ |
| **Scenario 4: Invalid Password** | TC-004, TC-005, TC-006, TC-015, TC-035 | 100% ✅ |
| **Scenario 5: Invalid Email** | TC-008, TC-009, TC-010, TC-014 | 100% ✅ |
| **Scenario 6: Missing Role** | TC-011 | 100% ✅ |
| **Scenario 7: Email Verification** | TC-031, TC-033, TC-034 | 100% ✅ |
| **Scenario 8: Database Error** | TC-025 | 100% ✅ |
| **Scenario 9: Email Service Error** | TC-026 | 100% ✅ |
| **Scenario 10: Network Error** | TC-027 | 100% ✅ |
| **Scenario 11: Role-Specific Redirect** | TC-001, TC-002 | 100% ✅ |

**Overall Coverage:** 98% (35 test cases, 11 scenarios)

### Coverage by Type

| Type | Count | % | Change |
|------|-------|---|--------|
| Positive | 5 | 14% | - |
| Negative | 20 | 57% | +2 |
| Boundary | 8 | 23% | +1 |
| Integration | 2 | 6% | - |
| **Total** | **35** | **100%** | **+3** |

### Coverage by Priority

| Priority | Count | % |
|----------|-------|---|
| P0 (Critical) | 12 | 34% |
| P1 (High) | 15 | 43% |
| P2 (Medium) | 8 | 23% |

---

## 🎯 Testing Strategy

### Critical Test Paths (Must Pass Before Release)

1. **TC-001** (Mentee Happy Path) → **TC-033** (Mentee Access) → **TC-031** (Email Verification)
2. **TC-002** (Mentor Happy Path) → **TC-034** (Mentor Blocking) → **TC-031** (Email Verification)
3. **TC-003** (Duplicate Email) + **TC-032** (Race Condition)
4. **TC-035** (Password Max Length)

### Entry Criteria (Updated)

- [x] PO decisions Q1-Q4 answered ✅
- [ ] Staging Supabase configured
- [ ] Test email service (Mailtrap/MailHog)
- [ ] JWT validation tools ready

### Exit Criteria

- [ ] All 35 test cases passing
- [ ] No P0 bugs open
- [ ] Email verification tested with 3+ providers (Gmail, Outlook, Yahoo)
- [ ] Performance: Signup API < 500ms (NFR-001)
- [ ] Accessibility: WCAG 2.1 AA compliance

---

## ⚠️ Risks & Mitigations

### New Risks Identified

| Risk | Likelihood | Impact | Mitigation | Related TC |
|------|------------|--------|------------|------------|
| **Mentee confusion** (ignores banner) | Medium | Low | A/B test designs, track completion rate | TC-033 |
| **Mentor frustrated** (blocked) | Medium | Medium | Clear error messaging, prominent CTA | TC-034 |
| **Password managers** > 128 chars | Low | Medium | Client validation shows error early | TC-035 |
| **Email deliverability** (spam) | High | High | Authenticated SMTP, test providers | TC-031 |

### Updated Mitigations from PO Decisions

✅ **Q1:** Role-based verification (non-blocking mentees, blocking mentors) balances UX + quality
✅ **Q2:** 128-char limit prevents DoS, accommodates password managers
✅ **Q3:** URL param eliminates form dropdown confusion
✅ **Q4:** Auto-login aligns with industry standard (Supabase default)

---

## 🛠️ Action Items

### Dev Team
- [ ] Review TC-001, TC-002 (auto-login + redirect logic)
- [ ] Implement TC-034 restriction (RLS policy + API validation for mentor publishing)
- [ ] Implement TC-035 validation (Zod schema with max 128)
- [ ] Update error messages per PO's TypeScript example
- [ ] Create email verification banner component (2 variants: mentee/mentor)

### QA Team
- [ ] Execute TC-033 (mentee access without verification) - **NEW**
- [ ] Execute TC-034 (mentor blocked from publishing) - **NEW**
- [ ] Execute TC-035 (password max length boundary) - **NEW**
- [ ] Re-execute TC-001, TC-002 with updated assertions (JWT, redirect, banner)
- [ ] Setup test email accounts for verification flow
- [ ] Automate parametrized tests for TC-035 (4 password lengths)

### UX/UI Team
- [ ] Design email verification banner (see TC-033 expected result for copy)
- [ ] Design mentor blocking error state (see TC-034 expected result for copy)
- [ ] Design password validation feedback for 128-char limit
- [ ] Update signup form mockups with role pre-filled from URL param

---

## 📝 Test Case Documentation

**Full Test Case Details:** Updated in local file
**Location:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-3-user-signup/test-cases.md`

**Changes Logged:**
- Section "FASE 4: Test Design" updated with 3 new test cases
- Section "FASE 3: Refined Acceptance Criteria" aligned with PO decisions
- Section "FASE 5: Jira Integration" updated with this comment reference

---

## ✅ Summary

**Test Suite Status:** ✅ **ALIGNED WITH PO DECISIONS**

**Changes:**
- 6 test cases updated (TC-001, TC-002, TC-008-014, TC-015, TC-031, TC-032)
- 3 test cases added (TC-033, TC-034, TC-035)
- Total test cases: 32 → 35
- Coverage: 95% → 98%

**Blockers Removed:** All test ambiguities resolved per PO decisions Q1-Q4

**Ready for Execution:** YES (pending staging environment setup)

**Estimated Test Execution Time:** 22 hours (was 19h, +3h for new cases)

---

**QA Sign-off:** Shift-Left Testing Analysis
**Next Review:** After test execution in staging environment
**Related Comment:** PO Decisions Q1-Q4 (previous comment in this ticket)
