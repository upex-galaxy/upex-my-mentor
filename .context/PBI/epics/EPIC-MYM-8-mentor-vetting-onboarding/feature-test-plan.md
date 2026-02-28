# Feature Test Plan: EPIC-MYM-8 - Mentor Vetting & Onboarding

[Fecha: 2025-01-07]
[QA Lead: AI-Generated (Pending Assignment)]
[Epic Jira Key: MYM-8]
[Status: Draft]

---

## 📋 Business Context Analysis

### Business Value Proposition
**Epic MYM-8** delivers the **core differentiator** of the upex-my-mentor marketplace: **verified mentors**. According to the Business Model Canvas, verification is the key trust signal that distinguishes this platform from competitors where anyone can claim expertise.

- **Business Model Impact**: Enables 20% commission model by ensuring quality mentors worth paying for
- **MVP Success Criteria**: 50 verified mentors within 3 months, GMV target $5,000
- **Differentiation**: Without verified mentors, the platform loses its primary competitive advantage
- **Blocking Dependency**: EPIC-003 (Mentor Discovery) cannot proceed until verified mentors exist

### Target KPIs for This Epic
- **Approval Rate**: >80% of legitimate applications approved within 48 hours (SLA TBD)
- **Rejection Rate**: <20% (high rejection indicates poor onboarding UX or unclear requirements)
- **Vetting Throughput**: Admin can review 10 applications/hour (efficiency target)
- **Audit Compliance**: 100% of approve/reject actions logged with admin identity + timestamp
- **Email Delivery**: >99% notification delivery rate
- **False Positives**: <5% of verified mentors later flagged as fraudulent

### User Impact Analysis

**Primary Users:**
1. **Carlos (Mentor Persona - Arquitecto Senior 40 años)**
   - **Journey Stage**: Registro → Configuración perfil → **Verificación (THIS EPIC)** → Publicar servicios
   - **Pain Point**: Waiting for verification creates anxiety ("¿Cuándo puedo empezar a recibir mentorados?")
   - **Success Criteria**: Clear status visibility, fast turnaround (<48h), transparent rejection reasons

2. **Admin User (New Persona - NOT in current personas)**
   - **Gap Identified**: No admin persona defined (see Questions section)
   - **Assumed Profile**: Platform operator, possibly part-time initially, needs efficient UI to scale vetting
   - **Pain Point**: Manually reviewing LinkedIn/GitHub profiles is time-intensive, inconsistent criteria lead to subjective decisions

**Secondary Users:**
3. **Laura (Student Persona - Dev Junior)**
   - **Indirect Impact**: Trusts "verified" badge when booking mentors
   - **Risk**: If vetting is weak, Laura books low-quality mentor → bad experience → platform abandonment

### Critical User Journey: Mentor Verification Flow
```
[Mentor completes profile]
  ↓
[Status: PENDING_VERIFICATION]
  ↓
[Admin views application in dashboard] (MYM-9)
  ↓
[Admin reviews LinkedIn/GitHub + bio] (MYM-10)
  ↓
[Admin approves OR rejects with reason] (MYM-11)
  ↓
[Email sent to mentor] (MYM-12)
  ↓
[Status: VERIFIED or REJECTED] → [Audit log entry created]
```

**Current Gap**: Journey assumes mentor already submitted profile. Does EPIC-001 include profile creation with LinkedIn/GitHub URLs? **Needs clarification**.

---

## 🏗️ Technical Architecture Analysis

### System Components

#### **Frontend Components (New)**
1. **Admin Dashboard** (`/admin` route - NEW)
   - Navigation: Dashboard, Pending Applications, Verified Mentors, Audit Log
   - Authentication: Protected route requiring `role = 'admin'`
   - **Question**: Is this a separate Next.js app or new pages in existing app?

2. **Application Review Interface** (`/admin/applications/[id]`)
   - Displays: Mentor bio, LinkedIn URL (clickable), GitHub URL (clickable), profile photo, submitted date
   - Actions: Approve button, Reject button + textarea for reason
   - **Gap**: Does UI validate LinkedIn/GitHub URLs are reachable before displaying?

3. **Pending Applications List** (`/admin/applications`)
   - Table: Mentor name, submitted date, LinkedIn/GitHub icons (green if valid), action buttons
   - Filters: Date range, status (if allowing statuses beyond PENDING)
   - Pagination: Required (assumes >100 applications over time)

#### **Backend APIs (New - Extend api-contracts.yaml)**

Based on functional requirements, these endpoints are needed:

```yaml
# Suggested additions to api-contracts.yaml

/api/admin/applications:
  GET:
    summary: List pending mentor applications
    security: [BearerAuth]
    parameters:
      - status: query (default: PENDING_VERIFICATION)
      - limit/offset: pagination
    responses:
      200: { applications: [], total: int }
      403: Forbidden (not admin)

/api/admin/applications/{id}:
  GET:
    summary: Get application details
    responses:
      200: { mentor_profile, user_info, linkedin_url, github_url, submitted_at }
      404: Application not found

  PATCH:
    summary: Approve or reject application
    requestBody:
      action: "approve" | "reject"
      rejection_reason: string (required if reject)
    responses:
      200: { status: "VERIFIED" | "REJECTED", verified_at, verified_by }
      400: Invalid action or missing rejection_reason
      409: Application already processed

/api/admin/audit-log:
  GET:
    summary: Retrieve audit log for compliance
    parameters:
      - admin_id: filter by admin
      - date_range: filter by time
    responses:
      200: { logs: [] }
```

**Integration Point**: These APIs must enforce RBAC via Supabase RLS policies (see Database section).

#### **Database Schema Changes**

**New Tables:**

1. **`admin_users`** (Mentioned in epic but NOT in current schema)
   ```sql
   CREATE TABLE admin_users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id) NOT NULL,
     role VARCHAR(50) NOT NULL, -- 'super_admin' | 'vetting_admin' ?
     created_at TIMESTAMPTZ DEFAULT NOW(),
     created_by UUID REFERENCES admin_users(id),
     UNIQUE(user_id)
   );
   ```
   **Question**: Who creates the first admin? Manual SQL insert?

2. **`application_audit_log`**
   ```sql
   CREATE TABLE application_audit_log (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     mentor_id UUID REFERENCES mentor_profiles(id) NOT NULL,
     action VARCHAR(50) NOT NULL, -- 'APPROVED' | 'REJECTED'
     admin_id UUID REFERENCES admin_users(id) NOT NULL,
     rejection_reason TEXT,
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );
   ```

**Extended Tables:**

3. **`mentor_profiles`** (Existing table from EPIC-001)
   ```sql
   ALTER TABLE mentor_profiles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION';
   -- Values: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'

   ALTER TABLE mentor_profiles ADD COLUMN verified_at TIMESTAMPTZ;
   ALTER TABLE mentor_profiles ADD COLUMN verified_by UUID REFERENCES admin_users(id);
   ALTER TABLE mentor_profiles ADD COLUMN rejection_reason TEXT;
   ```
   **Critical**: Default status must be `PENDING_VERIFICATION` from profile creation (EPIC-001 dependency).

#### **External Services**

1. **Email Service** (MYM-12)
   - **Provider**: Not specified (Sendgrid? AWS SES? Supabase Email?)
   - **Templates Needed**:
     - Approval: "Congratulations Carlos, your profile is verified! Start offering mentorships."
     - Rejection: "Your application needs revision. Reason: [reason]. Reapply link."
   - **Gap**: Are templates designed? Who writes copy?
   - **Failure Handling**: What if email fails? Retry logic? Fallback notification in app?

2. **LinkedIn/GitHub Validation** (Scope OUT: Automated verification)
   - **Current Approach**: Admin manually clicks URLs and verifies
   - **Risk**: Admin doesn't validate → fake profiles slip through
   - **Suggested Enhancement**: Frontend validation that URLs are reachable (HTTP 200) before submission

#### **Integration Points**

| Integration | Components | Risk Level | Test Coverage Required |
|-------------|-----------|------------|------------------------|
| **Admin Auth** | Frontend `/admin` route → Supabase Auth (role check) | HIGH | E2E: Non-admin cannot access |
| **RBAC/RLS** | Backend API → Supabase RLS policies (admin_users table) | HIGH | API: 403 if not admin |
| **Email Delivery** | Backend → Email Service API | MEDIUM | Integration: Mock email, verify payload |
| **Audit Logging** | Approve/Reject API → `application_audit_log` insert | MEDIUM | Unit: Transaction rollback if log fails |
| **Profile Visibility** | `mentor_profiles.verification_status` → Mentor Discovery (EPIC-003) | HIGH | Integration: Only VERIFIED mentors shown publicly |

---

## 🚨 Risk Analysis

### Technical Risks

#### **Risk T1: Admin Access Control Bypass (CRITICAL)**
- **Description**: Non-admin users access `/admin` routes or APIs by manipulating tokens/cookies
- **Impact**: Unauthorized users approve/reject applications → platform integrity compromised
- **Likelihood**: MEDIUM (common vulnerability if RBAC not implemented correctly)
- **Area Affected**: Frontend routing, Backend API authorization, Supabase RLS
- **Mitigation**:
  - Supabase RLS policy: `admin_users` table only readable by users with matching `user_id`
  - Backend middleware: Verify `role = 'admin'` from JWT claims before processing
  - Frontend: Route guards (defense in depth, not primary security)
- **Test Coverage Required**:
  - API Test: Non-admin JWT → 403 on all `/api/admin/*` endpoints
  - E2E Test: Non-admin user navigates to `/admin` → redirect to 403 page
  - E2E Test: Admin user logged out → session expired, redirect to login

#### **Risk T2: LinkedIn/GitHub URL Validation (HIGH)**
- **Description**: Mentors submit fake URLs (e.g., `linkedin.com/in/fake-elon-musk`) or private profiles admins can't verify
- **Impact**: Low-quality mentors get verified → damages trust → Laura (student) has bad experience
- **Likelihood**: HIGH (no automated validation in scope)
- **Area Affected**: Profile submission (EPIC-001), Admin review UI (MYM-10)
- **Mitigation**:
  - Frontend: URL format validation (regex: `linkedin\.com\/in\/[\w-]+`)
  - Backend: Store URLs, don't auto-verify (manual admin check)
  - Admin UI: Display URLs as clickable links, show warning if URL returns 404
- **Test Coverage Required**:
  - Unit Test: URL validation rejects malformed URLs
  - Integration Test: Admin UI displays "Profile not found" warning if LinkedIn URL is 404
  - E2E Test: Submit profile with private LinkedIn → Admin sees warning → Rejects with reason "LinkedIn profile is private"

#### **Risk T3: Email Delivery Failures (MEDIUM)**
- **Description**: Mentor approved/rejected but email notification fails (email service down, invalid email, spam filter)
- **Impact**: Mentor not notified → doesn't start offering sessions → lost revenue
- **Likelihood**: MEDIUM (5-10% delivery failures common)
- **Area Affected**: MYM-12 (Email Notifications), Backend API
- **Mitigation**:
  - Decouple email from approval: Approval commits to DB, email sent async
  - Retry logic: 3 attempts with exponential backoff
  - Fallback: In-app notification ("Your profile is verified!")
  - Monitoring: Alert if delivery rate <95%
- **Test Coverage Required**:
  - Integration Test: Mock email service returns 500 → Approval still succeeds, retry queued
  - E2E Test: Email service down → In-app notification shown to mentor
  - API Test: Verify email payload (to, subject, body) matches template

#### **Risk T4: Audit Log Integrity (HIGH - Compliance)**
- **Description**: Audit log entry fails to insert (DB constraint, transaction rollback) → No record of who approved/rejected
- **Impact**: Legal/compliance risk, cannot trace fraudulent approvals
- **Likelihood**: LOW (if transaction handled correctly)
- **Area Affected**: Backend API (MYM-11), Database
- **Mitigation**:
  - Atomic transaction: Approval + Audit log insert in single DB transaction
  - If audit log fails → Rollback approval, return 500
  - Immutable log: No DELETE permission on `application_audit_log`
- **Test Coverage Required**:
  - Unit Test: Audit log insert fails → Approval rollback, mentor status unchanged
  - Integration Test: 100 approvals → 100 audit log entries (no missing records)
  - Security Test: Admin cannot delete audit log entries (DB permission check)

#### **Risk T5: Race Condition - Concurrent Approvals (MEDIUM)**
- **Description**: Two admins approve/reject same application simultaneously
- **Impact**: Duplicate audit log entries, inconsistent status
- **Likelihood**: LOW initially (single admin), MEDIUM at scale
- **Area Affected**: Backend API (MYM-11)
- **Mitigation**:
  - Optimistic locking: Check `verification_status = 'PENDING_VERIFICATION'` before update
  - Return 409 Conflict if already processed
- **Test Coverage Required**:
  - Concurrency Test: Simulate 2 admins clicking Approve simultaneously → Only 1 succeeds, other gets 409

---

### Business Risks

#### **Risk B1: Manual Vetting Bottleneck (CRITICAL)**
- **Description**: At scale (500 applications/month), manual review becomes unsustainable
- **Impact on Business**: Cannot reach 50 verified mentors in 3 months, GMV target missed
- **Impact on Users**: Carlos waits 2 weeks for approval → Abandons platform
- **Likelihood**: HIGH (manual vetting doesn't scale)
- **Mitigation**:
  - **Short-term**: SLA of 48h review time, monitor queue depth
  - **Long-term**: Phase 2 automation (LinkedIn API verification, AI-assisted review)
  - **Metrics**: Track avg review time, flag if >48h
- **Test Coverage**: Load test with 100 pending applications → Measure admin review throughput

#### **Risk B2: Inconsistent Vetting Decisions (HIGH)**
- **Description**: Different admins have different standards (one approves bootcamp grads, another rejects)
- **Impact on Business**: Inconsistent quality → Brand confusion
- **Impact on Users**: Rejected mentors complain "Why was I rejected but this person approved?"
- **Likelihood**: HIGH (no documented criteria in epic)
- **Mitigation**:
  - **Critical Gap**: Document vetting criteria (see Questions section)
  - Admin training documentation
  - Rejection reason dropdown (standardized reasons)
- **Test Coverage**: QA reviews sample approvals/rejections for consistency (manual audit)

#### **Risk B3: Rejected Mentors Leave Negative Reviews (MEDIUM)**
- **Description**: Carlos rejected → Posts on Reddit/Twitter "Platform rejected me unfairly"
- **Impact on Business**: Reputation damage, deters future mentor signups
- **Impact on Users**: N/A
- **Likelihood**: MEDIUM (common in competitive application processes)
- **Mitigation**:
  - Empathetic rejection email with clear reason + "reapply in 30 days"
  - Appeals process? (Not in scope, suggest for Phase 2)
- **Test Coverage**: Review email templates for tone (manual QA)

#### **Risk B4: Admin Account Compromise (HIGH)**
- **Description**: Admin credentials stolen → Attacker approves fake mentors
- **Impact on Business**: Platform flooded with scammers → Laura (student) scammed → Legal liability
- **Impact on Users**: Loss of trust, financial harm
- **Likelihood**: MEDIUM (phishing, weak passwords)
- **Mitigation**:
  - 2FA for admin accounts (not in scope, recommend)
  - Audit log tracks all admin actions (already in scope)
  - Rate limiting: Max 50 approvals/hour per admin (flag anomalies)
- **Test Coverage**: Security test - Attempt to approve 100 applications in 1 minute → Rate limit blocks

---

### Integration Risks

| Integration | Risk Description | Impact | Mitigation | Test Strategy |
|-------------|------------------|--------|------------|---------------|
| **Admin Dashboard ↔ Backend API** | API schema mismatch (frontend expects `rejection_reason`, backend doesn't return it) | Frontend crash, admin cannot reject | Contract testing with OpenAPI schema validation | API contract tests (Pactum.js or schema validation) |
| **Email Service ↔ Backend** | Email service API changes (deprecated endpoint) | All notifications fail | Version pinning, monitor email service changelog | Mock email service, verify integration tests pass |
| **Audit Log ↔ Supabase RLS** | RLS policy too restrictive (admin cannot read own audit logs) | Compliance reports fail | Test RLS policies in isolation | Database integration tests (Supabase local dev) |
| **Mentor Profile ↔ Mentor Discovery (EPIC-003)** | EPIC-003 queries `mentor_profiles` without filtering `verification_status = 'VERIFIED'` | Unverified mentors shown publicly | Document requirement in EPIC-003 acceptance criteria | E2E test: Create PENDING mentor → Not visible in search |

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

#### **1. Verification Criteria (BLOCKS IMPLEMENTATION)**
**Issue**: Epic says "admin reviews LinkedIn/GitHub" but doesn't specify **what makes a valid mentor**.

**Questions**:
- What is the minimum LinkedIn profile completeness? (e.g., Must have 5+ years experience in title, 500+ connections?)
- Is GitHub **required** or optional? (Many senior architects don't have active GitHub)
- What if LinkedIn profile is in Spanish/Portuguese? (International mentors)
- Red flags that auto-reject? (e.g., <1 year experience, no profile photo, suspicious activity)

**Impact**: Without criteria, admins make subjective decisions → Inconsistent quality (Risk B2)

**Recommendation**: PO documents vetting rubric (Appendix A in epic.md) before Sprint 1

---

#### **2. Admin User Provisioning (BLOCKS TESTING)**
**Issue**: Who is the **initial admin**? How are additional admins created?

**Questions**:
- Is there a super_admin role that can create other admins?
- Is admin creation a manual SQL insert or is there a UI? (Not in MYM-9 to MYM-12)
- What happens if the only admin leaves the company? (Bus factor)

**Impact**: QA cannot set up test environment without admin access

**Recommendation**:
- DEV creates migration script to insert first admin (hardcoded email)
- PHASE 2: Admin management UI (`/admin/users`)

---

#### **3. Reapplication After Rejection (AMBIGUOUS)**
**Issue**: If Carlos is rejected, can he **edit his profile and reapply**?

**Questions**:
- Does rejection set status to `REJECTED` permanently, or can mentor resubmit?
- Is there a cooldown period? (e.g., reapply after 30 days)
- Does resubmission create a new audit log entry or update existing?

**Impact**: Without reapplication flow, rejected mentors are permanently banned → Lost potential mentors

**Recommendation**:
- **Scope IN for this epic**: Allow 1 reapplication (status changes `REJECTED` → `PENDING_VERIFICATION` if mentor edits profile)
- **Scope OUT**: Unlimited reapplications (spam risk)

---

#### **4. Notification Delivery SLA (UNDEFINED)**
**Issue**: MYM-12 says "send email" but no SLA defined

**Questions**:
- What is acceptable delivery time? (Immediate, within 1 hour, within 24 hours?)
- What happens if mentor's email bounces? (Invalid email address)
- Is there a fallback notification method? (SMS, in-app notification)

**Impact**: Without SLA, cannot define test pass/fail criteria

**Recommendation**:
- Email sent within **5 minutes** of approval/rejection (async job)
- If delivery fails after 3 retries → In-app notification fallback

---

#### **5. Audit Log Retention (COMPLIANCE GAP)**
**Issue**: `application_audit_log` table created, but no retention policy

**Questions**:
- How long are logs stored? (1 year, 7 years for compliance?)
- Are logs archived or deleted? (GDPR right to be forgotten conflicts with audit logs)
- Who can access logs? (Only super_admin? External auditors?)

**Impact**: Legal/compliance risk if logs are deleted prematurely

**Recommendation**:
- Retain logs for **7 years** (industry standard for financial transactions)
- Logs are **immutable** (no DELETE, UPDATE permissions)

---

### Missing Information

#### **1. Email Templates (REQUIRED FOR MYM-12)**
**Gap**: No email copy provided in epic or stories

**Needed**:
- Approval email: Subject, body, CTA ("Start offering mentorships")
- Rejection email: Subject, body, reason placeholder, reapply CTA
- Sender: `noreply@upexmymentor.com` or `vetting@upexmymentor.com`?

**Blocker**: Cannot implement MYM-12 without templates

**Recommendation**: PO/Marketing provides copy in Story MYM-12 before dev starts

---

#### **2. Admin Dashboard Design (UI/UX)**
**Gap**: No wireframes or mockups for `/admin` routes

**Needed**:
- Layout: Sidebar navigation or top nav?
- Branding: Same look as main app or separate admin theme?
- Responsive: Mobile support for admin dashboard? (Probably not MVP)

**Blocker**: Frontend dev cannot start without design

**Recommendation**: Designer creates low-fidelity wireframes in Sprint Planning

---

#### **3. LinkedIn/GitHub URL Storage (DATABASE SCHEMA)**
**Gap**: Epic assumes LinkedIn/GitHub URLs exist in `mentor_profiles`, but current schema doesn't show these columns

**Questions**:
- Were `linkedin_url` and `github_url` columns added in EPIC-001? (Dependency check)
- Are they TEXT fields? VARCHAR(500)? Validated on insert?

**Blocker**: Cannot review applications without URLs in database

**Recommendation**: Verify EPIC-001 included URL fields, update schema if missing

---

#### **4. Error Handling Specifications (API)**
**Gap**: No error codes defined for admin APIs

**Needed**:
- 403 vs 401 (Unauthorized vs Forbidden)
- 409 (Application already processed)
- 500 (Audit log failed)
- 400 (Missing rejection_reason)

**Impact**: Frontend cannot display user-friendly error messages

**Recommendation**: DEV defines error schema in api-contracts.yaml

---

### Suggested Improvements (Before Implementation)

#### **Improvement 1: Vetting Decision Rubric UI**
**Current**: Admin sees raw LinkedIn/GitHub URLs, makes subjective decision

**Suggested**: Admin UI includes **checklist**:
```
☐ LinkedIn profile is public
☐ Has 3+ years experience in relevant field
☐ Profile photo present
☐ GitHub shows code contributions (if applicable)
☐ No red flags (suspicious activity, offensive content)
```

**Benefit**: Consistent decisions, faster reviews, audit trail of criteria checked

---

#### **Improvement 2: Partial Automation - LinkedIn Scraping**
**Current**: Scope OUT automated verification

**Suggested**: Even without full automation, fetch **public LinkedIn data** via API (if available) and display in admin UI:
- Years of experience (calculated from job history)
- Endorsements count
- Profile completeness %

**Benefit**: Admin doesn't need to manually visit LinkedIn, faster reviews

**Feasibility**: Depends on LinkedIn API access (likely requires partnership)

---

#### **Improvement 3: Batch Approval (LOW PRIORITY)**
**Current**: Scope OUT batch approval

**Suggested**: If queue grows >50 applications, add **bulk approve** for obvious high-quality profiles:
- Filter: LinkedIn with >500 connections + GitHub with >10 repos
- Admin reviews list, selects multiple, clicks "Approve Selected"

**Benefit**: 10x throughput increase

**Risk**: Higher false positive rate, mitigated by audit log

---

#### **Improvement 4: Real-Time Status for Mentors**
**Current**: Mentor receives email notification

**Suggested**: Add **in-app status dashboard** for mentors:
- `/mentor/application-status` page showing:
  - Submitted: ✅ Jan 5, 2025
  - Under Review: 🔄 (Estimated 24-48h)
  - Decision: ⏳ Pending

**Benefit**: Reduces "Where is my application?" support tickets

---

#### **Improvement 5: Rejection Reason Dropdown (CONSISTENCY)**
**Current**: Rejection reason is free-text textarea

**Suggested**: Dropdown with predefined reasons:
- "LinkedIn profile is private or incomplete"
- "Insufficient professional experience (<3 years)"
- "GitHub profile does not demonstrate technical expertise"
- "Profile contains inappropriate content"
- "Other (please specify)"

**Benefit**: Consistent communication, easier analytics (track rejection reasons)

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**
- Admin authentication and authorization (RBAC)
- Application listing and filtering (MYM-9)
- Application detail display (MYM-10)
- Approve/reject workflow (MYM-11)
- Email notification delivery (MYM-12)
- Audit log creation and integrity
- Database RLS policies
- API contract validation
- Error handling (403, 404, 409, 500)
- Email template rendering
- Non-admin access prevention

**Out of Scope:**
- Automated LinkedIn/GitHub verification (future phase)
- Batch approval (future phase)
- Admin user management UI (manual provisioning)
- Mobile responsive admin dashboard (desktop only for MVP)
- Appeals process (future phase)
- Advanced analytics/reporting (basic audit log only)

### Test Levels

| Level | Tools | Coverage Target | Responsibility |
|-------|-------|-----------------|----------------|
| **Unit** | Vitest | 80% code coverage for business logic (approval workflow, email formatting) | DEV |
| **API** | Postman/Pactum | 100% endpoint coverage, contract validation | QA |
| **Integration** | Vitest + Supabase Local | Database transactions, RLS policies, email service mocks | DEV/QA |
| **E2E** | Playwright | Critical paths (admin login → review → approve → email), cross-browser (Chrome, Firefox) | QA |
| **Security** | Manual + OWASP ZAP | RBAC bypass attempts, SQL injection, XSS in rejection reasons | QA |
| **Performance** | K6 | Admin dashboard load time (<2s), API response time (<500ms p95) | QA |

### Test Types Per Story

#### **MYM-9: View Pending Applications**
- **Positive**: Admin views list, sees all PENDING applications, pagination works
- **Negative**: Non-admin gets 403, empty state if no applications
- **Boundary**: 0 applications, 1 application, 100 applications (pagination)
- **Integration**: Database query filters by `verification_status = 'PENDING_VERIFICATION'`
- **API**: `GET /api/admin/applications` returns correct JSON schema

#### **MYM-10: Review Application Details**
- **Positive**: Admin clicks application, sees mentor bio + LinkedIn/GitHub links
- **Negative**: Application ID not found (404), unauthorized access (403)
- **Integration**: LinkedIn URL is clickable and opens in new tab
- **UI**: Display warning if URL is malformed or unreachable (404)

#### **MYM-11: Approve/Reject Workflow**
- **Positive**: Approve sets status to VERIFIED, reject requires reason
- **Negative**: Reject without reason (400), approve already-processed application (409)
- **Boundary**: Rejection reason max length (2000 chars?), concurrent approvals (race condition)
- **Integration**: Audit log entry created, transaction rollback if log fails
- **API**: `PATCH /api/admin/applications/{id}` validates request body

#### **MYM-12: Email Notifications**
- **Positive**: Email sent with correct template (approval vs rejection)
- **Negative**: Email service returns 500 (retry logic), invalid mentor email (bounce)
- **Integration**: Mock email service, verify payload (to, subject, body)
- **E2E**: Email appears in test inbox (Mailtrap or similar)

### Parametrized Tests

**Yes, heavily used for:**
1. **Admin Authorization Tests** (parametrize by user role):
   - `role: 'admin'` → 200 OK
   - `role: 'mentor'` → 403 Forbidden
   - `role: 'student'` → 403 Forbidden
   - `no auth token` → 401 Unauthorized

2. **Approval/Rejection Tests** (parametrize by action):
   - `action: 'approve'` → Status becomes VERIFIED, email sent, audit log = "APPROVED"
   - `action: 'reject', reason: 'xyz'` → Status becomes REJECTED, email sent with reason, audit log = "REJECTED"

3. **URL Validation Tests** (parametrize by URL format):
   - Valid: `https://linkedin.com/in/carlos-architect`
   - Invalid: `linkedin.com/in/fake`, `http://notlinkedin.com`, `javascript:alert(1)`

### Test Data Requirements

**Test Personas:**
1. **Admin User**: `admin@upexmymentor.com` (role: `admin`)
2. **Non-Admin User**: `carlos@example.com` (role: `mentor`)
3. **Mentor Applications**:
   - Valid: LinkedIn public + 5yrs experience + GitHub
   - Invalid: LinkedIn private, <1yr experience, no GitHub
   - Edge: Non-English profile, 404 LinkedIn URL

**Test Data Generation:**
- **Faker.js** for mentor bios, names, emails
- **Hardcoded URLs** for LinkedIn/GitHub (use real test accounts or mocks)
- **Seed Script**: `npm run seed:admin` to create admin user + 20 pending applications

**Data Cleanup:**
- Truncate `application_audit_log` after each test suite
- Reset `mentor_profiles.verification_status` to PENDING for reusable test data

### Entry Criteria

- ✅ EPIC-001 (User Auth) is deployed to staging and verified
- ✅ `mentor_profiles` table includes `linkedin_url` and `github_url` columns
- ✅ Admin user provisioned in staging environment
- ✅ Email service API credentials configured (Sendgrid/SES)
- ✅ Email templates provided by PO/Marketing
- ✅ Vetting criteria documented (Appendix A in epic.md)
- ✅ Test environment Supabase instance with RLS policies enabled

### Exit Criteria

- ✅ All test cases executed (100% coverage of MYM-9 to MYM-12)
- ✅ Critical/High priority test cases: 100% passing
- ✅ Medium/Low priority test cases: ≥95% passing
- ✅ All critical and high bugs are resolved and verified
- ✅ Medium bugs have mitigation plan or are scheduled
- ✅ Regression testing passed (if changes affect other features)
- ✅ Non-functional requirements validated (performance, security)
- ✅ Test execution report is generated and shared
- ✅ Known issues are documented in release notes

---

## 📊 Test Cases Summary by Story

### MYM-9: View Pending Mentor Applications

**Complexity**: Medium
**Justification**: Requires database query filtering, pagination logic, and admin authorization. UI is straightforward (table view).

**Estimated Test Cases**: **18**

#### Positive Tests (6)
1. Admin views applications list → All PENDING applications displayed
2. Pagination: Page 1 shows first 20, Page 2 shows next 20
3. Filter by date range → Only applications in range shown
4. Sort by submitted_at (ascending/descending)
5. Empty state message if no pending applications
6. Click on application → Navigate to detail view (MYM-10)

#### Negative Tests (4)
7. Non-admin user accesses `/admin/applications` → 403 Forbidden
8. Unauthenticated user → 401 Redirect to login
9. Invalid page number (page=-1) → 400 Bad Request
10. Malformed date filter → 400 Bad Request

#### Boundary Tests (3)
11. 0 pending applications → Empty state displayed
12. 1 pending application → No pagination, single row
13. 1000 pending applications → Pagination with 50 pages

#### Integration Tests (3)
14. Database query uses RLS policy (admin can only see applications, not mentor's private data)
15. Application count badge updates in real-time (WebSocket or polling)
16. Supabase query filters `verification_status = 'PENDING_VERIFICATION'` correctly

#### API Tests (2)
17. `GET /api/admin/applications?status=PENDING&limit=20&offset=0` → Returns correct JSON schema
18. Response includes `total` count for pagination

**Parametrized Tests**: Yes
- Role-based access: `admin`, `mentor`, `student`, `unauthenticated`

---

### MYM-10: Review Application Details

**Complexity**: Medium
**Justification**: Displays mentor profile data, validates URLs, requires database join (mentor_profiles + users).

**Estimated Test Cases**: **16**

#### Positive Tests (5)
19. Admin clicks application → Detail page shows bio, LinkedIn, GitHub, submitted_at
20. LinkedIn URL is clickable link (opens in new tab)
21. GitHub URL is clickable link (opens in new tab)
22. Profile photo displayed (or placeholder if missing)
23. Back button returns to applications list

#### Negative Tests (5)
24. Non-admin accesses `/admin/applications/123` → 403 Forbidden
25. Application ID does not exist → 404 Not Found
26. Application ID is UUID but belongs to already-processed application → Still viewable (audit purpose)
27. Malformed application ID (not UUID) → 400 Bad Request
28. Database connection error → 500 Internal Server Error

#### Boundary Tests (2)
29. Bio is 5000 characters → UI displays with scrollbar (no truncation)
30. LinkedIn URL is 500 characters → Displays correctly without breaking layout

#### Integration Tests (3)
31. Frontend fetches data from `GET /api/admin/applications/{id}`
32. UI validates LinkedIn URL format (regex) and shows warning if malformed
33. UI attempts HEAD request to LinkedIn URL → Shows "Profile not reachable" if 404

#### API Tests (1)
34. `GET /api/admin/applications/{id}` → Returns mentor profile + user email + URLs

**Parametrized Tests**: Yes
- Application states: `PENDING`, `VERIFIED`, `REJECTED` (admin can view all for audit)

---

### MYM-11: Approve/Reject Application Workflow

**Complexity**: High
**Justification**: Critical business logic (status update, audit log, transaction integrity), race conditions, error handling.

**Estimated Test Cases**: **24**

#### Positive Tests (6)
35. Admin clicks Approve → Status becomes VERIFIED, `verified_at` timestamp set, `verified_by` = admin.id
36. Admin clicks Reject + enters reason → Status becomes REJECTED, `rejection_reason` saved
37. Approval creates audit log entry: `{ action: 'APPROVED', admin_id, timestamp }`
38. Rejection creates audit log entry: `{ action: 'REJECTED', admin_id, rejection_reason, timestamp }`
39. After approval, application disappears from pending list (MYM-9)
40. After rejection, application disappears from pending list (MYM-9)

#### Negative Tests (8)
41. Non-admin tries `PATCH /api/admin/applications/123` → 403 Forbidden
42. Admin clicks Reject without reason → 400 Bad Request "rejection_reason is required"
43. Admin approves already-VERIFIED application → 409 Conflict "Application already processed"
44. Admin rejects already-REJECTED application → 409 Conflict
45. Application ID does not exist → 404 Not Found
46. Malformed request body (`action: 'invalid'`) → 400 Bad Request
47. Database transaction fails (audit log insert fails) → 500 Internal Server Error, status NOT updated (rollback)
48. Network timeout during PATCH → Request retried (idempotency check)

#### Boundary Tests (3)
49. Rejection reason is 1 character → Accepted
50. Rejection reason is 2000 characters → Accepted
51. Rejection reason is 2001 characters → 400 Bad Request "Reason too long"

#### Integration Tests (5)
52. Approval updates `mentor_profiles.verification_status` in database
53. Rejection updates `mentor_profiles.rejection_reason` in database
54. Audit log entry is created in `application_audit_log` table
55. Transaction: If audit log insert fails, status update is rolled back
56. RLS policy: Only admins can update `verification_status`

#### Concurrency Tests (2)
57. Two admins approve same application simultaneously → One gets 200 OK, other gets 409 Conflict
58. Admin approves while another admin rejects → First request wins, second gets 409

**Parametrized Tests**: Yes
- Action types: `approve`, `reject`
- User roles: `admin`, `mentor`, `unauthenticated`

---

### MYM-12: Email Notifications

**Complexity**: Medium
**Justification**: External service integration, retry logic, template rendering, async job handling.

**Estimated Test Cases**: **20**

#### Positive Tests (6)
59. Approval triggers email to mentor with "Approved" template
60. Rejection triggers email to mentor with "Rejected" template + reason
61. Email subject is correct: "Your upex-my-mentor application has been approved"
62. Email body includes mentor name (personalization)
63. Email includes CTA button: "Start offering mentorships" (approval) or "Reapply" (rejection)
64. Email sent within 5 minutes of approval/rejection (async job)

#### Negative Tests (7)
65. Email service returns 500 → Request retried 3 times with exponential backoff
66. Email service permanently down → Approval still succeeds, email queued for later retry
67. Mentor email is invalid (`invalid@`) → Email bounces, logged in error table
68. Email template rendering fails (missing variable) → Fallback to plain text email
69. Email quota exceeded (Sendgrid limit) → Admin receives alert, emails queued
70. Duplicate email not sent (idempotency: same application ID)
71. Email timeout (30s) → Marked as failed, retried

#### Boundary Tests (2)
72. Rejection reason is 2000 characters → Email body renders correctly (no truncation)
73. Mentor name has special characters (ñ, é) → Email displays correctly (UTF-8)

#### Integration Tests (5)
74. Mock email service: Verify `POST /send` called with correct payload
75. Email payload includes: `to`, `subject`, `body`, `from`
76. Email `from` address is `noreply@upexmymentor.com`
77. Email includes unsubscribe link (compliance)
78. Email service response logged (success/failure)

**Parametrized Tests**: Yes
- Email types: `approval`, `rejection`
- Email service responses: `200 OK`, `500 Error`, `timeout`

---

### **Total Estimated Test Cases for Epic MYM-8**: **78**

**Breakdown**:
- MYM-9: 18 test cases
- MYM-10: 16 test cases
- MYM-11: 24 test cases (most complex)
- MYM-12: 20 test cases

**Justification**:
- This epic has **high technical complexity** (RBAC, database transactions, external integrations) and **high business risk** (core differentiator).
- 78 test cases is **realistic** for 4 stories covering admin workflows, security, email delivery, and audit compliance.
- Not artificially inflated: Each test case addresses a specific risk or requirement.

---

## 📝 Non-Functional Requirements Validation

### Performance

**Requirements** (from NFR Performance):
- API response time <500ms (p95)
- Page load time <2.5s

**Test Plan**:
1. **Admin Dashboard Load Time**:
   - Metric: Time to interactive (TTI) for `/admin/applications`
   - Target: <2s with 100 pending applications
   - Tool: Lighthouse, WebPageTest
   - Test: Cold cache + warm cache

2. **API Response Time**:
   - Endpoint: `GET /api/admin/applications?limit=20`
   - Target: <300ms (p95) for 1000 total applications
   - Tool: K6 load test (100 concurrent requests)
   - Test: Measure p50, p95, p99

3. **Database Query Performance**:
   - Query: `SELECT * FROM mentor_profiles WHERE verification_status = 'PENDING_VERIFICATION' LIMIT 20`
   - Target: <50ms with 10,000 mentor profiles
   - Tool: Supabase query planner (EXPLAIN ANALYZE)
   - Optimization: Index on `verification_status` column

**Pass Criteria**:
- ✅ Admin dashboard loads in <2s (p95)
- ✅ API responses <500ms (p95)
- ✅ No N+1 query issues (verified with Supabase logs)

---

### Security

**Requirements** (from NFR Security):
- Authentication: JWT tokens
- Authorization: RBAC with RLS policies
- Transport: HTTPS/TLS 1.3

**Test Plan**:
1. **RBAC Enforcement**:
   - Test: Non-admin JWT → 403 on all `/api/admin/*` endpoints
   - Test: Expired JWT → 401 Unauthorized
   - Test: Tampered JWT (modified role claim) → 401 Invalid signature

2. **RLS Policies**:
   - Test: Admin can read `admin_users` table (own row only)
   - Test: Mentor cannot read `admin_users` table
   - Test: Admin can update `mentor_profiles.verification_status`
   - Test: Mentor cannot update `verification_status` (only admin)

3. **Input Validation**:
   - Test: SQL injection in rejection reason → Parameterized query prevents injection
   - Test: XSS in rejection reason → Rendered safely in email (HTML escaped)
   - Test: CSRF token required for PATCH requests

4. **Audit Log Security**:
   - Test: Admin cannot DELETE from `application_audit_log` (DB permission denied)
   - Test: Audit log entries are immutable (no UPDATE permission)

**Pass Criteria**:
- ✅ 0 critical security vulnerabilities (OWASP ZAP scan)
- ✅ All RBAC tests pass
- ✅ RLS policies prevent unauthorized access
- ✅ Audit log is tamper-proof

---

### Usability

**Requirements** (Implicit - admin UX):
- Admin can review 10 applications/hour
- Clear visual feedback for actions
- Error messages are actionable

**Test Plan**:
1. **Admin Task Completion Time**:
   - Task: Review application + Approve/Reject
   - Target: <5 minutes per application
   - Method: Usability testing with 3 admin users

2. **UI Clarity**:
   - Test: LinkedIn/GitHub links are visually distinct (icon + color)
   - Test: Approve/Reject buttons use color coding (green/red)
   - Test: Success message appears after approval: "Application approved successfully"

3. **Error Handling UX**:
   - Test: 403 error shows: "You do not have permission. Contact admin."
   - Test: 409 error shows: "This application has already been processed."
   - Test: Network error shows: "Connection failed. Please retry."

**Pass Criteria**:
- ✅ Admin completes review in <5 minutes (avg)
- ✅ No usability issues flagged by test users
- ✅ Error messages are clear and actionable

---

### Reliability

**Requirements** (from NFR Reliability):
- 99.9% uptime (allows ~43 minutes downtime/month)

**Test Plan**:
1. **Email Service Resilience**:
   - Test: Email service down for 10 minutes → Emails queued, sent when service recovers
   - Test: Email delivery failure → Retry 3 times, then fallback to in-app notification

2. **Database Transaction Reliability**:
   - Test: 100 concurrent approvals → All succeed, no lost audit log entries
   - Test: Database connection pool exhausted → Graceful degradation (503 Service Unavailable)

3. **Monitoring & Alerts**:
   - Test: Email delivery rate drops <95% → Alert sent to ops team
   - Test: Admin dashboard 5xx errors → Alert sent

**Pass Criteria**:
- ✅ Email retry logic works (tested with mock failures)
- ✅ No data loss under concurrent load
- ✅ Monitoring alerts configured

---

## 🛠️ Tools & Infrastructure

### Testing Tools

| Category | Tool | Purpose | Version |
|----------|------|---------|---------|
| **Unit Testing** | Vitest | Component + business logic tests | 1.0+ |
| **E2E Testing** | Playwright | User flows (admin login → approve) | 1.40+ |
| **API Testing** | Postman + Pactum.js | Contract validation, endpoint testing | Latest |
| **Performance** | K6 | Load testing (100 concurrent requests) | 0.48+ |
| **Security** | OWASP ZAP | Vulnerability scanning | 2.14+ |
| **Email Testing** | Mailtrap.io | Email delivery verification (staging) | Cloud |
| **Database** | Supabase Local Dev | Integration tests with RLS policies | Latest |
| **Mocking** | MSW (Mock Service Worker) | Mock email service API | 2.0+ |
| **Test Data** | Faker.js | Generate mentor bios, emails | 8.0+ |
| **CI/CD** | GitHub Actions | Run tests on PR, pre-deployment | N/A |

### Test Environment

**Staging Environment**:
- URL: `https://staging-upexmymentor.vercel.app`
- Database: Supabase staging instance (isolated from prod)
- Email: Mailtrap.io (catches emails, no real delivery)
- Admin User: `admin@upexmymentor.com` / `TestPass123!`

**Local Development**:
- Frontend: `http://localhost:3000`
- Backend: Next.js API routes (same server)
- Database: Supabase local dev (`npx supabase start`)
- Email: Mock with MSW (no real API calls)

### Test Data Setup

**Seed Script** (`scripts/seed-admin-test-data.ts`):
```typescript
// Creates:
// - 1 admin user
// - 20 pending mentor applications (10 valid, 10 with issues)
// - 5 verified mentors (for regression testing)
// - 5 rejected mentors (for reapplication testing)

npm run seed:admin
```

**Cleanup Script** (`scripts/cleanup-test-data.ts`):
```typescript
// Truncates:
// - application_audit_log
// - Resets verification_status to PENDING for test mentors

npm run cleanup:test
```

### CI/CD Integration

**GitHub Actions Workflow** (`.github/workflows/test-epic-mym-8.yml`):
```yaml
name: Test EPIC-MYM-8

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run seed:admin
      - run: npm run test:unit
      - run: npm run test:api
      - run: npm run test:e2e:admin
      - run: npm run cleanup:test
```

**Deployment Gate**:
- All tests must pass before merging to `main`
- Manual QA sign-off required for staging → production promotion

---

## 📊 Metrics & Reporting

### Test Metrics

**Track Daily**:
- Test execution time (target: <10 minutes for full suite)
- Test pass rate (target: >95%)
- Code coverage (target: >80% for business logic)
- Bugs found per story (track trend)

**Track Weekly**:
- Mean time to resolution (MTTR) for bugs
- Test flakiness rate (failed tests that pass on retry)
- Regression test failures (broken by new code)

**Track Per Sprint**:
- Total test cases executed
- Critical bugs escaped to production (target: 0)
- Email delivery rate in staging (target: >95%)

### Reporting Cadence

**Daily Standups** (QA Update):
- Test execution status (MYM-9: 18/18 passed)
- Blockers (e.g., "Waiting for email templates from PO")
- Bugs found (severity, assigned to)

**Sprint Review** (Demo):
- QA presents:
  - Test coverage summary (78 test cases, 95% pass rate)
  - Critical bugs fixed
  - Performance metrics (dashboard loads in 1.8s)

**Sprint Retrospective**:
- What went well: Early security testing caught RBAC issue
- What to improve: Test data setup took too long, automate better

### Bug Tracking

**Jira Bug Template**:
```
Title: [MYM-11] Admin can approve already-verified application (409 not returned)
Severity: High
Steps to Reproduce:
1. Admin approves application ID 123
2. Refresh page, click Approve again
3. Expected: 409 Conflict, Actual: 200 OK (duplicate audit log entry)

Environment: Staging
Browser: Chrome 120
Related Story: MYM-11
```

### Dashboards

**Test Results Dashboard** (Hosted on GitHub Pages or internal wiki):
- Real-time test pass/fail status
- Coverage graphs (line, branch, function)
- Flaky test list
- Performance trends (API response time over time)

**Email Delivery Dashboard** (Mailtrap.io):
- Emails sent/received count
- Bounce rate
- Template rendering preview

---

## 🎓 Notes & Assumptions

**Assumptions:**
- Admin user is trusted (company employee or contractor)
- Manual vetting acceptable for MVP (<50 mentors/month)
- Email delivery is not mission-critical (fallback to in-app notification)
- LinkedIn/GitHub profiles are public (private profiles flagged for manual contact)
- Rejected mentors accept decision (no appeals process in MVP)

**Constraints:**
- Time: 2-week sprint for 4 stories
- Resources: 1 QA engineer, part-time admin for testing
- Tools: Must use existing stack (Playwright, Vitest, Postman)

**Known Limitations:**
- Cannot fully test LinkedIn/GitHub validation (depends on external services)
- Email service may have rate limits (Sendgrid free tier: 100 emails/day)
- Supabase local dev doesn't perfectly replicate production RLS behavior

**Exploratory Testing Sessions:**
- Recommended: 2 exploratory sessions BEFORE implementation
  - Session 1: Test with mockups/wireframes (admin UX flow)
  - Session 2: Test edge cases not covered in stories (international profiles, special characters)

---

## 📎 Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/epic.md`
- **Stories:**
  - `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/MYM-9/story.md`
  - `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/MYM-10/story.md`
  - `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/MYM-11/story.md`
  - `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/MYM-12/story.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

**Version:** 1.0
**Last Updated:** 2025-01-07
**Generated with:** Shift-Left Testing Workflow - AI-Assisted Quality Analysis

---

**🤖 This document was generated using AI-assisted analysis to identify risks, gaps, and test requirements early in the development lifecycle. All findings should be reviewed and validated by the team before implementation.**