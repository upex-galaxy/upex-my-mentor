# Feature Test Plan: EPIC-MYM-2 - User Authentication & Profiles

**Fecha:** 2025-11-07
**QA Lead:** AI-Generated (Pending Assignment)
**Epic Jira Key:** MYM-2
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

This epic establishes the foundational authentication and profile management system for Upex My Mentor, a marketplace connecting verified tech mentors with students seeking personalized 1-on-1 mentorship. Without this epic, the platform cannot function - it's the critical first step enabling all other marketplace features.

**Key Value Proposition:**

- Enables secure user identity management with role-based access (Mentor vs Mentee), establishing trust from day one
- Creates the foundation for discovery and matching by allowing users to build comprehensive, public-facing profiles
- Supports the verification workflow for mentors, ensuring marketplace quality and trust
- Enables personalized experiences and access control for all subsequent features (booking, payments, reviews)

**Success Metrics (KPIs):**

- 50 mentors complete profile setup in first 3 months (directly depends on MYM-6)
- 500 students register in first 3 months (directly depends on MYM-3)
- <10% registration abandonment rate (directly impacted by MYM-3 UX quality)
- 100% of new users can complete registration flow (quality metric for MYM-3, MYM-4)
- <5% password reset failure rate (quality metric for MYM-7)
- 0 critical authentication vulnerabilities (security metric for entire epic)

**User Impact:**

- **Laura (Desarrolladora Junior):** As a mentee, she needs a smooth registration experience and a simple profile to introduce herself to mentors. Any friction in MYM-3 or MYM-5 will cause abandonment.
- **Carlos (Arquitecto Senior):** As a mentor, he needs a professional profile creation flow (MYM-6) that allows him to showcase his expertise, set his rate, and connect LinkedIn/GitHub for credibility. Profile quality directly impacts his ability to attract serious students.
- **Sofia (Career Changer):** As a mentee transitioning careers, she needs clear onboarding and profile creation to articulate her learning goals and background effectively.

**Critical User Journeys:**

- **Journey 1: Registro de Estudiante y Reserva de Primera Sesión** - Steps 1-2 are directly enabled by MYM-3 (registration). Profile completion in Step 2 onboarding uses MYM-5.
- **Journey 2: Registro de Mentor y Configuración de Perfil** - Steps 1-4 are fully enabled by MYM-3 (registration), MYM-6 (mentor profile setup), and the verification flow mentioned in the epic.

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Next.js 15 App Router pages and components:
  - `/signup` route - Registration form (MYM-3)
  - `/login` route - Login form (MYM-4)
  - `/logout` functionality (MYM-4)
  - `/profile/edit` route - Profile editing (MYM-5, MYM-6)
  - `/password-reset` route - Password reset flow (MYM-7)
- React components:
  - SignupForm component (email, password, role selector)
  - LoginForm component
  - MenteeProfileForm component (name, photo, bio)
  - MentorProfileForm component (specialties, hourly rate, LinkedIn/GitHub, bio)
  - PasswordResetRequestForm, PasswordResetForm components
- Form validation using Zod schemas (client-side)
- Photo upload component (profile pictures)

**Backend:**

- Next.js 15 API Routes:
  - `/api/auth/register` - POST endpoint (FR-001)
  - `/api/auth/login` - POST endpoint (FR-002)
  - `/api/auth/logout` - POST endpoint
  - `/api/users/{userId}` - PUT endpoint for profile editing (FR-003)
  - `/api/mentors/{mentorId}/profile` - PUT endpoint (FR-004)
  - `/api/mentors/{mentorId}/socials` - PUT endpoint (FR-005)
  - `/api/auth/password-reset-request` - POST endpoint
  - `/api/auth/password-reset` - POST endpoint
- Server-side validation using Zod schemas
- Integration with Supabase Auth SDK
- Session management (JWT token handling)
- Email triggering logic (verification, password reset)

**Database:**

- **Tables involved (PostgreSQL via Supabase):**
  - `auth.users` table (managed by Supabase Auth) - stores id, email, encrypted_password, role
  - `public.profiles` table - stores id (FK to users.id), name, photo_url, description, created_at, updated_at
  - `public.mentor_profiles` table - stores profile_id (FK to profiles.id), specialties (text[]), hourly_rate (numeric), linkedin_url, github_url, verification_status
- **Critical queries:**
  - Email uniqueness check on registration
  - User lookup by email on login
  - Profile CRUD operations with RLS policies
  - Mentor profile queries with joins to profiles and users tables

**External Services:**

- **Supabase Auth:** User registration, login, JWT generation, email verification, password reset token generation
- **Email Service:** Supabase built-in email or Resend for:
  - Email verification on signup
  - Password reset emails with secure tokens
- **File Storage:** Supabase Storage for profile photo uploads (requires image upload, validation, URL generation)

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend ↔ Backend API (all `/api/auth/*` and `/api/users/*` endpoints)
- Backend ↔ Supabase Auth (registration, login, token validation, password reset)
- Backend ↔ Supabase Database (user profile CRUD, RLS policy enforcement)
- Backend ↔ Supabase Storage (profile photo uploads)
- Frontend ↔ Supabase Storage (direct upload or via API, needs testing)

**External Integration Points:**

- Upex My Mentor Backend ↔ Supabase Auth Service (authentication flow, token refresh)
- Upex My Mentor Backend ↔ Email Service (verification emails, password reset emails)
- Upex My Mentor Backend ↔ Supabase Storage (file upload/retrieval)

**Data Flow:**

```
User Registration Flow (MYM-3):
User → Frontend (SignupForm) → /api/auth/register → Supabase Auth → auth.users table
                                                   ↓
                                              Email Service (verification)
                                                   ↓
                                              public.profiles table (trigger)

Login Flow (MYM-4):
User → Frontend (LoginForm) → /api/auth/login → Supabase Auth (validate credentials)
                                              ↓
                                         JWT Token → Frontend (stored in HttpOnly cookie)

Profile Update Flow (MYM-5, MYM-6):
User → Frontend (ProfileForm) → /api/users/{userId} → Supabase DB (RLS validation)
                                                    ↓
                                               public.profiles + mentor_profiles tables

Password Reset Flow (MYM-7):
User → Frontend (Reset Request) → /api/auth/password-reset-request → Supabase Auth
                                                                    ↓
                                                               Email Service (reset link)
User → Email Link → Frontend (Reset Form) → /api/auth/password-reset → Supabase Auth
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Email delivery failures prevent account verification

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend → External Service (Email)
- **Mitigation Strategy:**
  - Use reliable email service (Supabase built-in or Resend with proven deliverability)
  - Implement retry logic for failed email sends
  - Provide manual "Resend verification email" option in UI
  - Log all email send attempts for debugging
  - Test email delivery across common providers (Gmail, Outlook, Yahoo, corporate emails)
- **Test Coverage Required:**
  - Positive: Email sent successfully and received in inbox
  - Negative: Email service down, network timeout - verify retry logic
  - Edge: Spam folder detection, email with special characters, extremely long email addresses
  - Integration: Mock email service to test failure scenarios

#### Risk 2: Weak passwords compromise user accounts

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Frontend + Backend (validation), Security
- **Mitigation Strategy:**
  - Enforce password policy: min 8 chars, 1 uppercase, 1 number, 1 special character (per epic specs)
  - Implement password strength indicator in UI (not in scope, but suggested improvement)
  - Add client-side AND server-side validation
  - Use bcrypt hashing via Supabase Auth (automatic, verify it's enabled)
  - Consider adding password complexity score validation
- **Test Coverage Required:**
  - Boundary: Test exact policy boundaries (8 chars, missing uppercase, etc.)
  - Negative: Common weak passwords ("Password1!", "12345678A!")
  - Security: Verify passwords are never logged or exposed in responses
  - Positive: Various strong password formats

#### Risk 3: Profile photo storage consumes excessive space or enables malicious uploads

- **Impact:** Medium
- **Likelihood:** Medium
- **Area Affected:** Backend → Supabase Storage, Security
- **Mitigation Strategy:**
  - Implement file size limit (5MB max per epic specs)
  - Validate file type (JPEG, PNG, WebP only - NOT SPECIFIED IN EPIC, AMBIGUITY!)
  - Implement image optimization/compression before storage
  - Scan uploaded files for malicious content (if Supabase Storage provides this)
  - Set storage quotas per user
- **Test Coverage Required:**
  - Boundary: Upload exactly 5MB file, 5.1MB file (should fail)
  - Negative: Upload non-image files (.exe, .pdf, .svg with scripts)
  - Security: Test for XSS via SVG uploads, EXIF data injection
  - Performance: Upload large valid images and verify optimization works

#### Risk 4: SQL Injection vulnerabilities in profile queries

- **Impact:** High
- **Likelihood:** Low (using Supabase ORM reduces risk)
- **Area Affected:** Backend → Database
- **Mitigation Strategy:**
  - Use Supabase client SDK (parameterized queries by default)
  - Validate and sanitize ALL user inputs server-side
  - Enable Row Level Security (RLS) on all tables
  - Audit all raw SQL queries (should be none)
- **Test Coverage Required:**
  - Security: Test SQL injection patterns in email, name, bio, specialties fields
  - Negative: Input with SQL keywords ('; DROP TABLE users;--)
  - Integration: Verify RLS prevents unauthorized data access

#### Risk 5: XSS vulnerabilities in profile display (bio, name fields)

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Frontend (profile rendering)
- **Mitigation Strategy:**
  - Sanitize user-generated content before rendering (React escapes by default, verify)
  - Avoid using dangerouslySetInnerHTML for user content
  - Implement Content Security Policy (CSP) headers
  - Validate and strip HTML/script tags server-side
- **Test Coverage Required:**
  - Security: Input XSS payloads in name, bio, specialties fields
  - Negative: Test <script>, <iframe>, event handlers (onclick, onerror)
  - Integration: Verify CSP blocks inline scripts

#### Risk 6: Session hijacking via JWT token theft

- **Impact:** High
- **Likelihood:** Low
- **Area Affected:** Frontend ↔ Backend (authentication)
- **Mitigation Strategy:**
  - Store JWT in HttpOnly cookies (NOT localStorage)
  - Use HTTPS only (enforced by Vercel in production)
  - Set short token expiration (7 days per epic, consider shorter)
  - Implement token refresh mechanism
  - Add CSRF protection for state-changing operations
- **Test Coverage Required:**
  - Security: Verify tokens not accessible via JavaScript
  - Integration: Test token expiration and refresh flow
  - Negative: Test expired token rejection, invalid token rejection

#### Risk 7: Password reset token vulnerabilities (timing, reuse, brute force)

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend → Supabase Auth (password reset flow)
- **Mitigation Strategy:**
  - Use cryptographically secure tokens (Supabase Auth handles this)
  - Set token expiration (HOW LONG? NOT SPECIFIED IN EPIC - AMBIGUITY!)
  - Invalidate token after single use
  - Rate limit password reset requests per email
  - Do not reveal if email exists in system (generic response)
- **Test Coverage Required:**
  - Security: Test token reuse (should fail), expired token (should fail)
  - Negative: Brute force token guessing, rate limit testing
  - Boundary: Test token expiration edge cases
  - Integration: Full password reset flow end-to-end

---

### Business Risks

#### Risk 1: High registration abandonment due to complex or buggy signup flow

- **Impact on Business:** Directly impacts "500 students in 3 months" KPI and "<10% abandonment rate" goal
- **Impact on Users:** Laura and Sofia (mentees) abandon if signup is confusing or has errors
- **Likelihood:** High (first-time user experience is critical)
- **Mitigation Strategy:**
  - Implement progressive disclosure (minimal fields initially)
  - Add clear validation errors with helpful messages
  - Test on slow networks (3G) to ensure performance
  - Implement analytics to track abandonment at each step
  - A/B test onboarding flow (future)
- **Acceptance Criteria Validation:**
  - Epic AC #1 says "Users can register... following security best practices" but doesn't specify UX quality
  - SUGGESTION: Add AC for "Registration flow completable in <2 minutes" and "Clear error messages for all validation failures"

#### Risk 2: Incomplete mentor profiles reduce marketplace quality and trust

- **Impact on Business:** Impacts "50 mentors in 3 months" KPI, reduces mentor discoverability and student trust
- **Impact on Users:** Carlos (mentor) may not complete profile if flow is tedious; students won't book incomplete profiles
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Add profile completion percentage indicator (OUT OF SCOPE per epic, but critical for business)
  - Make key fields required (name, bio, specialties, hourly rate)
  - Validate LinkedIn/GitHub URLs are reachable (optional but recommended)
  - Send reminder emails for incomplete profiles
  - Block mentor from appearing in search until profile is "complete"
- **Acceptance Criteria Validation:**
  - Epic AC #4 lists required mentor profile fields, but doesn't define "complete" vs "incomplete"
  - AMBIGUITY: Can a mentor with missing LinkedIn/GitHub be verified? Can they appear in search?

#### Risk 3: Users lose trust if email verification is not enforced

- **Impact on Business:** Fake accounts, spam, reduced platform credibility
- **Impact on Users:** All personas - platform quality degrades
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Block access to protected routes until email is verified
  - Show prominent "Verify your email" banner until verified
  - Resend verification email option
  - Clear messaging about why verification is required
- **Acceptance Criteria Validation:**
  - Epic states "Email verification for new accounts" is in scope
  - AMBIGUITY: What exactly happens if user doesn't verify? Can they login? Can they view profiles? Book sessions? NEEDS CLARIFICATION.

---

### Integration Risks

#### Integration Risk 1: Supabase Auth service downtime blocks all authentication

- **Integration Point:** Backend ↔ Supabase Auth
- **What Could Go Wrong:** Users cannot register, login, or reset passwords during Supabase outages
- **Impact:** High
- **Mitigation:**
  - Monitor Supabase status page
  - Implement graceful error handling with user-friendly messages
  - Add retry logic with exponential backoff
  - Consider implementing queue for critical operations (email verification)
  - Test with mocked Supabase unavailability

#### Integration Risk 2: Email service integration fails or has delays

- **Integration Point:** Backend ↔ Email Service (Supabase/Resend)
- **What Could Go Wrong:** Verification emails not sent, password reset emails delayed by hours
- **Impact:** High
- **Mitigation:**
  - Integration tests with mocked email service
  - Implement webhook/callback to confirm email delivery
  - Add "Resend email" functionality
  - Log all email send attempts with status
  - Test email delivery to various providers

#### Integration Risk 3: File storage integration for profile photos fails

- **Integration Point:** Backend ↔ Supabase Storage
- **What Could Go Wrong:** Photo uploads fail, URLs break, images not accessible
- **Impact:** Medium
- **Mitigation:**
  - Integration tests with mocked storage
  - Implement fallback to default avatar if photo fails
  - Validate storage URLs are publicly accessible (or require auth)
  - Test upload, retrieval, and deletion flows
  - Test storage quota limits

#### Integration Risk 4: Database connection pooling limits reached under load

- **Integration Point:** Backend ↔ Supabase PostgreSQL DB
- **What Could Go Wrong:** Concurrent user registrations/logins exhaust connection pool
- **Impact:** Medium
- **Mitigation:**
  - Supabase manages connection pooling (verify configuration)
  - Load test with concurrent authentications
  - Implement connection error handling
  - Monitor connection pool metrics in production

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1: Email verification enforcement - what happens if user doesn't verify?**

- **Found in:** EPIC-MYM-2 scope - states "Email verification for new accounts" but no details
- **Question for PO:**
  - Can an unverified user login?
  - Can they view mentor profiles?
  - Can they edit their own profile?
  - Can they book sessions (blocker for EPIC-003)?
  - How long is the verification link valid?
  - Do we send reminder emails if not verified within X days?
- **Impact if not clarified:** Testing cannot define entry criteria for protected routes; inconsistent user experience; potential security issues

**Ambiguity 2: Password reset token expiration time**

- **Found in:** STORY-MYM-7 (password reset)
- **Question for Dev:**
  - How long is the password reset token valid? (30 min? 1 hour? 24 hours?)
  - What happens if user clicks expired link? (error message? new request?)
  - Is token invalidated after successful password change?
  - Can user request multiple reset tokens? Are old ones invalidated?
- **Impact if not clarified:** Cannot design test cases for token expiration scenarios; security risk if tokens don't expire

**Ambiguity 3: Profile photo file format and size restrictions**

- **Found in:** EPIC-MYM-2 (Profile editing capabilities) and risk table mentions 5MB limit
- **Question for PO/Dev:**
  - What image file formats are allowed? (JPEG, PNG, WebP, GIF, SVG?)
  - Exact file size limit? (5MB mentioned in risk section but not in specs)
  - Image dimension limits? (max width/height?)
  - Is image optimization/compression automatic?
  - What happens to oversized uploads? (error? auto-resize?)
- **Impact if not clarified:** Cannot write validation test cases; users may be frustrated by unclear upload errors

**Ambiguity 4: Mentor hourly rate validation**

- **Found in:** FR-004 - states `hourly_rate` (number, float, > 0, required)
- **Question for PO:**
  - Is there a maximum hourly rate? (prevent absurd values like $10,000/hour)
  - Is there a minimum hourly rate? (prevent $0.01/hour)
  - How many decimal places? (e.g., $50.99 or $50.00 only?)
  - Currency? (epic doesn't mention currency at all - assuming USD?)
- **Impact if not clarified:** Cannot test boundary conditions; potential for data quality issues in mentor profiles

**Ambiguity 5: Profile bio character limits**

- **Found in:** Database schema in epic states `description (text, max 500 chars)` for profiles table
- **Question for PO/Dev:**
  - Is 500 chars for BOTH mentee and mentor bios?
  - Is this limit enforced in UI character counter?
  - What about mentor specialties array - any limit on number of skills or length per skill?
  - What about name field - any max length? (epic says "max 100 chars" in FR-003)
- **Impact if not clarified:** Cannot test character limit boundaries properly; inconsistent UX

**Ambiguity 6: Role selection during signup - can it be changed later?**

- **Found in:** STORY-MYM-3 mentions "User role selection (Mentor or Mentee) during signup"
- **Question for PO:**
  - Is role selection permanent or can user change it later?
  - Can a user be BOTH mentor and mentee? (use case: junior dev wants mentoring but also mentors beginners)
  - If role is permanent, how do we communicate this in UI?
- **Impact if not clarified:** Impacts database design and user expectations; testing cannot validate role change scenarios

---

### Missing Information

**Missing 1: LinkedIn/GitHub URL validation requirements**

- **Needed for:** FR-005 testing and mentor verification flow (EPIC-002)
- **Suggestion:** Add to FR-005:
  - Must be valid URLs starting with https://www.linkedin.com/ or https://github.com/
  - Should we verify the URLs are reachable (HTTP 200 response)?
  - Should we extract and store profile username/handle for verification?
  - What if LinkedIn/GitHub profile is private or deleted?

**Missing 2: Session duration and token refresh logic**

- **Needed for:** MYM-4 (login/logout) testing and security validation
- **Suggestion:** Add to epic technical considerations:
  - JWT token expiration time (7 days mentioned, but is refresh implemented?)
  - When/how does token refresh happen? (automatic on page load? explicit refresh endpoint?)
  - What happens when token expires? (redirect to login? auto-refresh?)
  - Is "remember me" functionality in scope?

**Missing 3: Error message specifications**

- **Needed for:** All stories - consistent error handling testing
- **Suggestion:** Add error message guidelines to epic:
  - For validation errors (specific: "Password must contain at least 1 uppercase letter")
  - For system errors (generic: "Something went wrong. Please try again.")
  - For security errors (generic: "Invalid credentials" - don't reveal if email exists)
  - Localization? (epic doesn't mention language support)

**Missing 4: Accessibility requirements**

- **Needed for:** Frontend testing - NFR references WCAG 2.1 AA but no specific guidance
- **Suggestion:** Add to epic acceptance criteria:
  - All forms keyboard navigable
  - Error messages announced to screen readers
  - Password visibility toggle for accessibility
  - Color contrast meets WCAG AA standards

**Missing 5: Rate limiting specifications**

- **Needed for:** Security testing, especially for MYM-3 (signup) and MYM-7 (password reset)
- **Suggestion:** Add to security requirements (NFR-001, NFR-002):
  - Max registration attempts per IP per hour
  - Max login attempts per email per 15 minutes (epic says "max 5 per 15 minutes")
  - Max password reset requests per email per hour
  - Response when rate limit is hit (429 status code, error message, lockout duration)

---

### Suggested Improvements (Before Implementation)

**Improvement 1: Add password strength indicator**

- **Story Affected:** STORY-MYM-3 (signup)
- **Current State:** Only validation error shown AFTER submission
- **Suggested Change:** Add real-time password strength meter (Weak/Medium/Strong) as user types
- **Benefit:** Reduces frustration, improves password quality, reduces signup abandonment

**Improvement 2: Implement profile completion percentage**

- **Story Affected:** STORY-MYM-6 (mentor profile)
- **Current State:** Out of scope per epic, but critical for business
- **Suggested Change:** Show "Profile 60% complete" indicator with checklist of missing fields
- **Benefit:** Increases profile completion rate (impacts "50 mentors in 3 months" KPI), improves mentor discoverability

**Improvement 3: Add email verification reminder flow**

- **Story Affected:** STORY-MYM-3 (signup)
- **Current State:** User receives verification email but no follow-up if ignored
- **Suggested Change:** Send reminder email after 24 hours if not verified, add "Resend verification email" link in UI
- **Benefit:** Reduces unverified accounts, improves activation rate, better user experience

**Improvement 4: Add "Login with Google/GitHub" placeholder for future**

- **Story Affected:** STORY-MYM-3, STORY-MYM-4
- **Current State:** Only email/password (OAuth is out of scope)
- **Suggested Change:** Design UI with space for social login buttons (grayed out or hidden for MVP), backend architecture should allow easy OAuth integration later
- **Benefit:** Future-proofs design, reduces rework when OAuth is added (likely soon after MVP)

**Improvement 5: Add mentor profile preview before publishing**

- **Story Affected:** STORY-MYM-6 (mentor profile)
- **Current State:** User edits profile and saves, no preview of public view
- **Suggested Change:** Add "Preview Profile" button showing how profile appears to students
- **Benefit:** Increases mentor confidence in profile quality, reduces support requests, improves profile completeness

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI, API, Database) for ALL user stories (MYM-3, MYM-4, MYM-5, MYM-6, MYM-7)
- Integration testing:
  - Frontend ↔ Backend API (all auth and profile endpoints)
  - Backend ↔ Supabase Auth
  - Backend ↔ Supabase Database (CRUD + RLS)
  - Backend ↔ Supabase Storage (profile photos)
  - Backend ↔ Email Service
- Non-functional testing:
  - Security: Password hashing, SQL injection, XSS, CSRF, JWT security (NFR-001, NFR-002)
  - Performance: Page load <2.5s, API response <500ms (NFR-P)
  - Accessibility: WCAG 2.1 AA compliance (NFR-U)
- Cross-browser testing: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile responsiveness: iOS Safari, Android Chrome
- API contract validation (according to api-contracts.yaml)
- Data validation (input/output according to FR-001 to FR-005)

**Out of Scope (For This Epic):**

- Social login (Google, GitHub OAuth) - explicitly out of scope per epic
- Two-factor authentication (2FA) - out of scope per epic
- Profile privacy settings - out of scope per epic
- Multi-language profiles/UI - not mentioned in epic or NFRs
- Load testing beyond concurrent user limits in NFRs (100 concurrent users for MVP)
- Penetration testing (recommend external security audit before production)
- Mentor vetting workflow (covered in EPIC-002)
- Booking functionality (covered in EPIC-003)

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** > 80% code coverage (per NFR maintainability specs)
- **Focus Areas:**
  - Password validation functions (strength, format)
  - Email format validation functions
  - Data sanitization functions (XSS prevention)
  - Profile data transformation functions
  - JWT token generation/validation functions
  - File upload validation functions (size, type)
- **Responsibility:** Dev team (QA validates tests exist and coverage meets goal)

#### Integration Testing

- **Coverage Goal:** All integration points identified in architecture analysis
- **Focus Areas:**
  - Frontend ↔ Backend API (test each endpoint with valid/invalid data)
  - Backend ↔ Supabase Auth (registration, login, password reset, token refresh)
  - Backend ↔ Supabase Database (user/profile CRUD, RLS policy enforcement)
  - Backend ↔ Supabase Storage (photo upload, retrieval, deletion)
  - Backend ↔ Email Service (trigger verification email, password reset email)
  - Contract testing for API endpoints (match api-contracts.yaml spec)
- **Responsibility:** QA + Dev (pair programming recommended)

#### End-to-End (E2E) Testing

- **Coverage Goal:** Critical user journeys complete (from user personas and user journeys docs)
- **Tool:** Playwright
- **Focus Areas:**
  - **Journey 1 (Mentee):** Registration → Email verification → Login → Profile creation → Logout
  - **Journey 2 (Mentor):** Registration → Email verification → Login → Mentor profile creation (full fields) → Logout
  - **Journey 3 (Password Reset):** Forgotten password → Request reset → Receive email → Reset password → Login with new password
  - **Journey 4 (Profile Editing):** Login → Edit mentee profile → Save → Logout → Login → Verify changes persisted
  - Happy paths complete (all steps successful)
  - Error scenarios (network failure, validation errors, expired sessions)
- **Responsibility:** QA team

#### API Testing

- **Coverage Goal:** 100% of authentication and profile endpoints added in this epic
- **Tool:** Postman/Newman or Playwright API
- **Focus Areas:**
  - `/api/auth/register` - FR-001 (all scenarios: valid, invalid email, weak password, duplicate email)
  - `/api/auth/login` - FR-002 (valid credentials, invalid credentials, unverified email)
  - `/api/auth/logout` - logout flow
  - `/api/users/{userId}` - FR-003 (update profile, unauthorized access)
  - `/api/mentors/{mentorId}/profile` - FR-004 (update mentor specifics, validation)
  - `/api/mentors/{mentorId}/socials` - FR-005 (LinkedIn/GitHub URLs)
  - Password reset endpoints (request, reset)
  - Contract validation (request/response schemas match api-contracts.yaml)
  - Status codes correct (201, 200, 400, 401, 403, 404, 500)
  - Error responses include proper error codes and messages
  - Authentication/Authorization (JWT token required for protected endpoints, RLS enforced)
- **Responsibility:** QA team

---

### Test Types per Story

For each story in this epic (MYM-3, MYM-4, MYM-5, MYM-6, MYM-7), the following test types must be covered:

**Positive Test Cases:**

- Happy path (successful flow with valid data)
- Valid data variations (different valid formats, optional vs required fields)
- Successful integration with external services

**Negative Test Cases:**

- Invalid input data (format, length, type)
- Missing required fields
- Unauthorized access attempts (wrong user, no token, expired token)
- Duplicate data (email already exists)
- External service failures (email service down, storage unavailable)

**Boundary Test Cases:**

- Min/max values (character limits, file sizes)
- Empty/null values (optional fields empty, required fields empty)
- Edge cases specific to authentication (password exactly 8 chars, exactly 1 uppercase, etc.)
- Token expiration edge cases (token expires during request)

**Security Test Cases:**

- SQL injection attempts (in email, name, bio fields)
- XSS injection attempts (in name, bio, specialties fields)
- CSRF attempts (state-changing operations)
- Password exposure (ensure never logged or returned in responses)
- Session hijacking attempts (token theft, replay attacks)

**Exploratory Testing:**

- User experience flows (onboarding smoothness, error message clarity)
- Edge cases not covered in formal test cases
- Cross-browser/device compatibility issues
- **Recommendation:** Conduct exploratory testing session BEFORE implementation using Figma mockups/prototypes to identify UX issues early (Shift-Left!)

---

## 📊 Test Cases Summary by Story

### STORY-MYM-3: User Sign Up

**Complexity:** Medium
**Estimated Test Cases:** 28

- Positive: 6 test cases
  - Register as student with valid data
  - Register as mentor with valid data
  - Email verification link works
  - Redirect to onboarding after registration
  - Verification email sent successfully
  - Re-send verification email works
- Negative: 12 test cases
  - Invalid email format (missing @, invalid domain, etc.)
  - Email already registered (duplicate)
  - Weak password (< 8 chars, no uppercase, no number, no special char - 4 cases)
  - Missing required fields (email, password, role - 3 cases)
  - Email service failure (retry logic)
  - Supabase Auth service unavailable
- Boundary: 5 test cases
  - Password exactly 8 characters
  - Password with exactly 1 uppercase, 1 number, 1 special char (minimal valid)
  - Email at max length (254 chars per RFC)
  - Email with special characters but valid
  - Role not selected (validation error)
- Integration: 5 test cases
  - Frontend → Backend → Supabase Auth → Database flow
  - Email verification token generation and validation
  - User created in auth.users and public.profiles tables
  - RLS policies allow user to read own profile
  - Supabase Auth JWT token generated correctly

**Rationale for estimate:** MYM-3 is the entry point to the platform and has multiple validation points (email, password, role), external service integration (Supabase Auth, email), and security requirements. Password validation alone requires multiple boundary cases. Email verification adds complexity.

**Parametrized Tests Recommended:** Yes - password validation can be parametrized with different invalid password formats. Email validation can be parametrized with various invalid email formats.

---

### STORY-MYM-4: User Login and Logout

**Complexity:** Medium
**Estimated Test Cases:** 18

- Positive: 4 test cases
  - Login with valid credentials (student)
  - Login with valid credentials (mentor)
  - Logout successfully (session cleared)
  - JWT token stored in HttpOnly cookie
- Negative: 8 test cases
  - Login with invalid email
  - Login with invalid password
  - Login with unverified email (if blocked - depends on PO answer)
  - Login with non-existent email
  - Rate limiting (6+ failed login attempts)
  - Logout when not logged in
  - Access protected route without login (redirect to login)
  - Login with correct email but wrong case (should be case-insensitive)
- Boundary: 3 test cases
  - Login with email at max length
  - Login exactly at rate limit threshold (5th attempt)
  - Token expires during session (auto-refresh or logout)
- Integration: 3 test cases
  - Frontend → Backend → Supabase Auth login flow
  - JWT token validation on protected endpoints
  - Session persistence across page refreshes (token in cookie)

**Rationale for estimate:** Login is critical but simpler than registration. Focus is on credential validation, rate limiting, and session management. Logout is straightforward.

**Parametrized Tests Recommended:** Yes - invalid login attempts can be parametrized (wrong email, wrong password, non-existent email).

---

### STORY-MYM-5: Mentee Profile Creation

**Complexity:** Low
**Estimated Test Cases:** 15

- Positive: 4 test cases
  - Create mentee profile with name and bio
  - Create mentee profile with photo upload
  - Edit mentee profile and save changes
  - Profile changes persist after logout/login
- Negative: 6 test cases
  - Create profile with missing name (required field)
  - Create profile with bio exceeding 500 chars
  - Upload photo exceeding 5MB (if limit enforced)
  - Upload non-image file (if validation exists)
  - Unauthorized user tries to edit another user's profile
  - Unauthenticated user tries to access profile edit page
- Boundary: 3 test cases
  - Bio exactly 500 characters
  - Name at max length (100 chars per FR-003)
  - Photo exactly at 5MB limit
- Integration: 2 test cases
  - Profile data saved to public.profiles table
  - RLS policy allows user to edit only own profile

**Rationale for estimate:** Mentee profile is simpler than mentor profile (fewer fields, no verification). Main complexity is photo upload validation and RLS testing.

**Parametrized Tests Recommended:** No - test cases are diverse enough that parametrization doesn't add value.

---

### STORY-MYM-6: Mentor Profile Creation

**Complexity:** High
**Estimated Test Cases:** 32

- Positive: 6 test cases
  - Create mentor profile with all required fields
  - Add specialties (array of skills)
  - Set hourly rate
  - Add LinkedIn URL
  - Add GitHub URL
  - Profile marked as "Pending Verification" after adding socials
- Negative: 14 test cases
  - Missing specialties (required)
  - Missing hourly rate (required)
  - Invalid hourly rate (negative, zero, extremely high - depends on PO answer)
  - Invalid LinkedIn URL format
  - Invalid GitHub URL format
  - Bio exceeding 500 chars (same as mentee)
  - Specialties array empty
  - Specialties exceeds max limit (if any - NOT SPECIFIED)
  - Hourly rate with more decimals than allowed (depends on PO answer)
  - Non-mentor user tries to access mentor profile endpoints
  - Student tries to create mentor profile
  - Unauthorized user tries to edit another mentor's profile
  - Unauthenticated user tries to access mentor profile edit
  - Upload photo exceeding 5MB
- Boundary: 6 test cases
  - Hourly rate at minimum valid value (depends on PO answer)
  - Hourly rate at maximum valid value (depends on PO answer)
  - Specialties array with 1 skill (minimum)
  - Specialties array at max skills (if limit exists)
  - Bio exactly 500 characters
  - Name at max length (100 chars)
- Integration: 6 test cases
  - Mentor data saved to public.mentor_profiles table
  - Foreign key relationship to public.profiles maintained
  - RLS policy allows mentor to edit only own profile
  - LinkedIn/GitHub URLs stored correctly
  - Verification status set to "Pending" (for EPIC-002)
  - Specialties stored as PostgreSQL text array

**Rationale for estimate:** MYM-6 is the most complex story with many fields, validation rules (specialties, hourly rate, URLs), role-based access control, and integration with future vetting epic (verification_status). Multiple boundary cases for hourly rate and specialties.

**Parametrized Tests Recommended:** Yes - invalid URL formats can be parametrized. Invalid hourly rate values can be parametrized.

---

### STORY-MYM-7: Password Reset

**Complexity:** Medium
**Estimated Test Cases:** 22

- Positive: 5 test cases
  - Request password reset with valid email
  - Receive password reset email
  - Reset password with valid token
  - Login with new password successfully
  - Old password no longer works after reset
- Negative: 10 test cases
  - Request reset with non-existent email (generic response for security)
  - Request reset with invalid email format
  - Reset with expired token (depends on PO answer for expiration time)
  - Reset with invalid token
  - Reset with already-used token (should fail)
  - New password same as old password (should be allowed or blocked?)
  - New password doesn't meet password policy
  - Rate limiting on reset requests per email
  - Email service failure on reset request
  - Multiple reset requests (old tokens invalidated?)
- Boundary: 4 test cases
  - Token expires exactly at expiration time
  - New password exactly 8 characters (min valid)
  - Reset request exactly at rate limit
  - Token used exactly once
- Integration: 3 test cases
  - Frontend → Backend → Supabase Auth password reset flow
  - Email with reset link sent successfully
  - Password updated in auth.users table

**Rationale for estimate:** Password reset is security-critical with token management, expiration, rate limiting, and email integration. Many edge cases around token validity and reuse.

**Parametrized Tests Recommended:** Yes - invalid token scenarios can be parametrized. Invalid new password formats can be parametrized.

---

### Total Estimated Test Cases for Epic

**Total:** 115 test cases

**Breakdown:**

- Positive: 25
- Negative: 50
- Boundary: 21
- Integration: 19

**NOTE:** This is a realistic estimate based on complexity analysis. Some stories are simple (MYM-5: 15 cases), others are complex (MYM-6: 32 cases). We do NOT force minimum numbers - estimate reflects actual testing needs.

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

Based on user personas (Laura, Carlos, Sofia):

- **Student User Data:**
  - Email: laura.garcia@example.com, sofia.rojas@example.com
  - Name: Laura García, Sofía Rojas
  - Bio: "Desarrolladora frontend con pasión por React y UX." (Laura), "Ex-marketing manager en transición a Data Science." (Sofia)
  - Role: student
- **Mentor User Data:**
  - Email: carlos.mendoza@example.com
  - Name: Carlos Mendoza
  - Bio: "Arquitecto de Software con 15 años de experiencia en sistemas distribuidos."
  - Role: mentor
  - Specialties: ["React", "AWS", "Python", "Microservices", "System Design"]
  - Hourly Rate: $50.00, $75.00, $100.00 (various rates for testing)
  - LinkedIn: https://www.linkedin.com/in/carlosmendoza
  - GitHub: https://github.com/carlosmendoza
- **Password Examples (Valid):**
  - SecureP@ss1
  - MyP@ssw0rd!
  - T3st1ng#Pass

**Invalid Data Sets:**

- **Invalid Emails:**
  - "notanemail" (missing @)
  - "user@" (missing domain)
  - "@example.com" (missing local part)
  - "user@.com" (invalid domain)
  - "user space@example.com" (space in email)
- **Invalid Passwords:**
  - "short1!" (< 8 chars)
  - "nouppercase1!" (no uppercase)
  - "NOLOWERCASE1!" (no lowercase)
  - "NoNumber!" (no number)
  - "NoSpecial1" (no special char)
  - "password" (common weak password)
- **SQL Injection Payloads:**
  - "'; DROP TABLE users;--"
  - "' OR '1'='1"
  - "admin'--"
- **XSS Injection Payloads:**
  - "<script>alert('XSS')</script>"
  - "<img src=x onerror=alert('XSS')>"
  - "javascript:alert('XSS')"
- **Invalid URLs:**
  - "not-a-url"
  - "http://linkedin.com/in/user" (wrong protocol)
  - "https://twitter.com/user" (wrong domain)

**Boundary Data Sets:**

- **Min/Max values (per SRS and epic):**
  - Password exactly 8 characters: "P@ssw0rd"
  - Name at max length: 100 characters (generate with Faker)
  - Bio at max length: 500 characters (generate with Faker)
  - Email at max length: 254 characters
  - Hourly rate minimum: $0.01 (or depends on PO answer)
  - Hourly rate maximum: $9999.99 (or depends on PO answer)
- **Empty/null values:**
  - Empty string for optional fields (photo_url)
  - Null for optional fields
  - Empty array for specialties (should fail validation)
- **Special characters:**
  - Unicode characters in name: "María José"
  - Emoji in bio: "I love coding! 💻"
  - Special chars in password (required): "@!#$%^&*()"

**Test Data Management:**

- ✅ Use Faker.js for generating realistic test data (names, emails, bios)
- ✅ Create data factories for common entities (users, profiles)
- ❌ DO NOT hardcode static test data in tests (use factories)
- ✅ Clean up test data after test execution (delete test users, profiles)
- ✅ Use separate test database for integration/E2E tests (not production DB)
- ✅ For E2E tests, seed database with known users before test suite runs

---

### Test Environments

**Staging Environment:**

- URL: [To be provided by DevOps]
- Database: Supabase staging project
- Supabase Auth: Staging configuration
- Email Service: Use test email provider (Mailtrap or similar) to capture emails without sending to real addresses
- File Storage: Supabase Storage staging bucket
- **Purpose:** Primary testing environment for all test levels (integration, E2E, API)

**Production Environment:**

- URL: https://upexmymentor.com (or TBD)
- Database: Supabase production project
- **Purpose:** ONLY smoke tests post-deployment
- **Restrictions:**
  - NO destructive tests
  - NO test data creation
  - ONLY verify critical paths work (login, profile view)
  - Run smoke tests via CI/CD after production deployment

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

- [ ] Story is fully implemented and deployed to staging environment
- [ ] Code review is approved by 2+ reviewers
- [ ] Unit tests exist and are passing (>80% coverage for business logic)
- [ ] Dev has done smoke testing and confirms basic functionality works (happy path)
- [ ] No blocker bugs exist in dependent stories (e.g., MYM-4 depends on MYM-3)
- [ ] Test data is prepared and available in staging (seeded users, profiles)
- [ ] API documentation is updated in api-contracts.yaml (if API changes)
- [ ] Critical questions from this test plan are answered by PO/Dev
- [ ] Test cases are designed and reviewed (story-test-cases.md prompt executed)

### Exit Criteria (Per Story)

Story is considered "Done" from QA perspective when:

- [ ] All test cases are executed
- [ ] Critical/High priority test cases: 100% passing
- [ ] Medium/Low priority test cases: ≥95% passing
- [ ] All critical and high severity bugs are resolved and verified
- [ ] Medium severity bugs have mitigation plan or are scheduled for next sprint
- [ ] Regression testing passed (if changes affect other features)
- [ ] Non-functional requirements validated:
  - Performance: Page load <2.5s, API <500ms
  - Security: No XSS, SQL injection, password exposure
  - Accessibility: Keyboard navigable, screen reader compatible
- [ ] Test execution report is generated and shared with team
- [ ] Known issues are documented in release notes (if any medium/low bugs remain)

### Epic Exit Criteria

Epic is considered "Done" from QA perspective when:

- [ ] ALL stories (MYM-3, MYM-4, MYM-5, MYM-6, MYM-7) meet individual exit criteria
- [ ] Integration testing across all stories is complete:
  - Full user journey: Signup → Verify → Login → Profile → Logout tested
  - API contract testing complete (all auth/profile endpoints validated)
- [ ] E2E testing of critical user journeys is complete and passing:
  - Mentee registration and profile creation journey
  - Mentor registration and profile creation journey
  - Password reset journey
- [ ] Non-functional testing is complete:
  - Performance testing (load time, API response time)
  - Security testing (OWASP Top 10 checks)
  - Accessibility testing (WCAG 2.1 AA compliance)
  - Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Mobile responsiveness testing (iOS, Android)
- [ ] Exploratory testing session completed (findings documented and triaged)
- [ ] No critical or high severity bugs open
- [ ] Medium bugs reviewed and accepted by PO for release (or scheduled)
- [ ] QA sign-off document is created and approved by QA Lead and Product Owner
- [ ] Test metrics collected and reported (test pass rate, bug detection rate, coverage)

---

## 📝 Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-001: Page Load Time (LCP) < 2.5s on 3G**

- **Target:** <2.5 seconds for registration, login, profile pages
- **Test Approach:**
  - Use Lighthouse in Chrome DevTools (throttled to 3G)
  - Test on staging with realistic network conditions
  - Measure LCP for /signup, /login, /profile/edit pages
- **Tools:** Lighthouse, WebPageTest
- **Pass Criteria:** LCP <2.5s for all auth/profile pages

**NFR-P-002: API Response Time < 500ms (p95)**

- **Target:** <500ms p95 percentile for auth/profile API endpoints
- **Test Approach:**
  - Load test API endpoints with realistic concurrency (10-50 concurrent users)
  - Measure p50, p95, p99 response times
  - Test /api/auth/login, /api/auth/register, /api/users/{userId} endpoints
- **Tools:** k6 or Apache JMeter
- **Pass Criteria:** p95 response time <500ms

**NFR-P-003: Time to Interactive (TTI) < 3.5s on mobile**

- **Target:** <3.5 seconds on mobile devices
- **Test Approach:**
  - Use Lighthouse mobile simulation
  - Test on real devices (iPhone, Android) if available
- **Tools:** Lighthouse mobile mode
- **Pass Criteria:** TTI <3.5s for auth/profile pages

**NFR-P-004: Concurrent Users Support (100 users for MVP)**

- **Target:** 100 concurrent users without degradation
- **Test Approach:**
  - Load test with 100 concurrent users performing registration/login
  - Monitor response times, error rates, database connections
  - Verify no performance degradation under load
- **Tools:** k6 with ramping scenario
- **Pass Criteria:** No errors, response times remain <500ms at 100 concurrent users

---

### Security Requirements

**NFR-S-001: Password Hashing (bcrypt via Supabase Auth)**

- **Requirement:** All passwords hashed with bcrypt, never stored in plain text
- **Test Approach:**
  - Verify passwords in auth.users table are hashed (manual DB inspection in staging)
  - Verify password never appears in logs, API responses, error messages
  - Attempt to retrieve plain text password (should be impossible)
- **Tools:** Manual DB inspection, log review
- **Pass Criteria:** No plain text passwords found anywhere

**NFR-S-002: HTTPS Only for All Communication**

- **Requirement:** All frontend-backend, backend-Supabase communication uses HTTPS/TLS 1.3
- **Test Approach:**
  - Verify all API calls use https:// protocol
  - Attempt http:// request (should auto-redirect to https or fail)
  - Check TLS version in browser dev tools (should be TLS 1.3)
- **Tools:** Browser dev tools (Network tab), SSL Labs test
- **Pass Criteria:** All traffic encrypted, TLS 1.3, no http allowed

**NFR-S-003: JWT Token Security**

- **Requirement:** JWT stored in HttpOnly cookies, not accessible via JavaScript
- **Test Approach:**
  - Attempt to access token via document.cookie in browser console (should be empty or not show JWT)
  - Verify cookie has HttpOnly, Secure, SameSite attributes
  - Test token expiration (should reject expired tokens)
- **Tools:** Browser dev tools (Application tab), manual testing
- **Pass Criteria:** Token not accessible via JS, proper cookie attributes

**NFR-S-004: Input Validation (SQL Injection, XSS Prevention)**

- **Requirement:** All user inputs validated and sanitized server-side
- **Test Approach:**
  - Inject SQL injection payloads in all input fields (email, name, bio, etc.)
  - Inject XSS payloads in all input fields
  - Verify payloads are escaped/rejected, not executed
- **Tools:** Manual testing with payloads, OWASP ZAP (optional)
- **Pass Criteria:** No SQL injection or XSS vulnerabilities found

**NFR-S-005: CSRF Protection**

- **Requirement:** CSRF protection on all state-changing operations
- **Test Approach:**
  - Attempt to submit form from external domain (should fail)
  - Verify CSRF tokens present if using token-based CSRF (or SameSite cookies)
- **Tools:** Manual testing, browser dev tools
- **Pass Criteria:** State-changing requests blocked without valid CSRF protection

**NFR-S-006: Rate Limiting**

- **Requirement:** Max 5 login attempts per 15 minutes per email (per epic security specs)
- **Test Approach:**
  - Attempt 6+ login failures rapidly
  - Verify 6th attempt is rate limited (429 status or lockout message)
  - Wait 15 minutes, verify rate limit resets
- **Tools:** Manual testing, API testing tool (Postman)
- **Pass Criteria:** Rate limit enforced after 5 failed attempts

---

### Usability Requirements

**NFR-U-001: WCAG 2.1 AA Compliance**

- **Requirement:** Forms, error messages, navigation meet WCAG 2.1 AA
- **Test Approach:**
  - Keyboard navigation testing (Tab, Enter, Esc keys)
  - Screen reader testing (VoiceOver on Mac, NVDA on Windows)
  - Color contrast validation (4.5:1 for text)
  - Focus indicators visible on all interactive elements
- **Tools:** Lighthouse accessibility audit, axe DevTools, manual testing
- **Pass Criteria:** No WCAG 2.1 AA violations, keyboard navigable, screen reader compatible

**NFR-U-002: Clear Error Messages**

- **Requirement:** Validation errors specific and helpful (not generic)
- **Test Approach:**
  - Trigger validation errors for each field
  - Verify error messages are specific ("Password must contain at least 1 uppercase letter" not "Invalid password")
  - Verify errors announced to screen readers
- **Tools:** Manual testing, screen reader
- **Pass Criteria:** All error messages clear, specific, accessible

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

This is the FIRST epic of the platform, so there are no existing features to regress. However, as future epics are added, authentication and profile functionality must be regression tested because:

- All future epics depend on authentication (login to access any feature)
- User profiles are displayed in multiple future epics (mentor discovery, booking, reviews)
- Session management affects all authenticated pages

**Future Regression Testing (for subsequent epics):**

- [ ] Signup/Login flow still works after changes to UI framework or Supabase config
- [ ] Profile display correct in mentor search (EPIC-002 dependency)
- [ ] Profile data persists correctly when user books sessions (EPIC-003 dependency)
- [ ] Authentication state maintained across all pages (navigation regression)

**Regression Test Execution:**

- Run automated regression suite (unit + integration tests) before starting epic testing
- Re-run after all stories are complete
- Focus on integration points when new epics add dependencies on auth/profile

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** 2 sprints (4 weeks)

**Breakdown:**

- **Test case design:** 3 days (1 day per story on average, using story-test-cases.md prompt)
- **Test data preparation:** 2 days (create Faker.js factories, seed staging DB)
- **Test execution (per story):**
  - MYM-3 (28 cases): 3 days
  - MYM-4 (18 cases): 2 days
  - MYM-5 (15 cases): 2 days
  - MYM-6 (32 cases): 3 days
  - MYM-7 (22 cases): 2.5 days
  - **Total execution:** 12.5 days
- **Integration testing:** 2 days (test cross-story flows)
- **E2E testing:** 3 days (full user journeys)
- **Non-functional testing (performance, security, accessibility):** 3 days
- **Bug fixing cycles:** 4 days buffer (2-3 bug fix iterations expected)
- **Exploratory testing:** 2 days
- **Test reporting and sign-off:** 1 day

**Total:** ~33 days (approximately 2 sprints with 2 QA resources)

**Dependencies:**

- Depends on: None (this is the foundational epic)
- Blocks: EPIC-002 (Mentor Vetting) - requires mentor profiles to exist
- Blocks: EPIC-003 (Mentor Discovery) - requires user profiles to display
- Blocks: ALL other epics - authentication is prerequisite for everything

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- **E2E Testing:** Playwright (TypeScript, supports all browsers)
- **API Testing:** Postman/Newman or Playwright API testing
- **Unit Testing:** Vitest (frontend), Jest (backend if separate)
- **Performance Testing:** Lighthouse (page load), k6 (API load testing)
- **Security Testing:** OWASP ZAP (optional, recommend for pre-production), manual testing with payloads
- **Accessibility Testing:** Lighthouse, axe DevTools, manual screen reader testing
- **Test Data:** Faker.js for generating realistic data
- **Visual Regression:** Percy or Chromatic (optional, for future)

**CI/CD Integration:**

- [ ] Tests run automatically on PR creation (unit + integration tests)
- [ ] Tests run on merge to main branch (full test suite including E2E)
- [ ] Tests run on deployment to staging (smoke tests + full suite)
- [ ] Smoke tests run on deployment to production (critical paths only)
- [ ] Test results reported in GitHub PR comments
- [ ] Failed tests block PR merge

**Test Management:**

- Jira for story tracking and bug tracking
- Test cases documented per story (using story-test-cases.md prompt)
- Test execution tracked in spreadsheet or Jira Xray (if available)
- Bug tracking in Jira with priority labels (Critical, High, Medium, Low)
- Test reports generated per story and per epic (summary metrics)

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- Test cases executed vs. total (daily)
- Test pass rate (% passing)
- Bug detection rate (bugs found per test case)
- Bug fix rate (bugs fixed per day)
- Test coverage (unit test code coverage from Vitest/Jest reports)
- Time to test (actual days per story vs. estimated)
- Test execution velocity (test cases per day)

**Reporting Cadence:**

- **Daily:** Test execution status update (standup report: X cases executed, Y passing, Z bugs found)
- **Per Story:** Test completion report (summary: total cases, pass rate, bugs, status)
- **Per Epic:** Comprehensive QA sign-off report (final metrics, risk summary, known issues, sign-off)

**Report Template (Per Story):**

```
Story: MYM-X - [Title]
Test Cases: X executed / Y total
Pass Rate: X%
Bugs Found: X (Critical: X, High: X, Medium: X, Low: X)
Bugs Fixed: X
Open Bugs: X (blocking/non-blocking)
Status: In Progress | Blocked | Complete
```

**Report Template (Per Epic):**

```
Epic: MYM-2 - User Authentication & Profiles
Stories Tested: 5/5 complete
Total Test Cases: 115 executed
Pass Rate: X%
Total Bugs Found: X
Bugs Fixed: X
Open Bugs: X (with severity breakdown)
Critical Risks Mitigated: [List]
Known Issues: [List for release notes]
QA Sign-off: Approved / Pending / Rejected
```

---

## 🎓 Notes & Assumptions

**Assumptions:**

- Supabase Auth is pre-configured and working in staging environment before testing starts
- Email service (Supabase or Resend) is configured and accessible in staging
- Supabase Storage is configured for profile photo uploads
- Figma designs for signup, login, profile pages are available for UI validation
- PO/Dev will answer critical questions BEFORE implementation starts (Shift-Left!)
- 2 QA resources available for this epic (1 for test case design, 1 for execution)
- Access to staging environment and Supabase dashboard for DB inspection

**Constraints:**

- Time: 2 sprints (4 weeks) - tight but achievable with 2 QA resources
- Resources: 2 QA engineers (if only 1, extend timeline to 3 sprints)
- Tools: Playwright license not required (open source), but Jira Xray may require license
- Environment: Staging environment must be stable (no frequent deployments during testing)

**Known Limitations:**

- Cannot fully test email deliverability to all email providers (Gmail, Outlook, Yahoo, corporate) - will use test email service in staging
- Load testing limited to 100 concurrent users (MVP target) - higher load not tested
- Penetration testing not in scope - recommend external security audit before production launch
- Accessibility testing limited to automated tools + manual testing - no formal certification
- Multi-language support not tested (out of scope for MVP)

**Exploratory Testing Sessions:**

- **Recommended:** 2 exploratory testing sessions BEFORE implementation
  - **Session 1 (BEFORE dev starts):** Test with Figma mockups/prototypes
    - Goal: Identify UX issues, confusing flows, missing error states EARLY
    - Participants: QA Lead + UX Designer + 1 Dev
    - Duration: 2 hours
    - Output: List of UX improvements to add to stories
  - **Session 2 (AFTER implementation):** Test edge cases not covered in formal test cases
    - Goal: Find bugs outside scripted test cases, test realistic user scenarios
    - Participants: 2 QA engineers
    - Duration: 4 hours (2 hours per QA)
    - Output: Bug reports for any issues found

---

## 📎 Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-*/story.md` (not yet created - to be generated)
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (executive-summary.md, user-personas.md, user-journeys.md)
- **SRS:** `.context/SRS/` (functional-specs.md, non-functional-specs.md, architecture-specs.md, api-contracts.yaml)
- **Jira Epic:** https://upexgalaxy61.atlassian.net/browse/MYM-2

---

**Formato:** Markdown estructurado siguiendo flujo **JIRA-FIRST → LOCAL MIRROR**

**Generated with Shift-Left Testing principles:** Analyze early, test early, prevent bugs before code is written.
