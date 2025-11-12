# Feature Test Plan: MYM-32 - Reputation & Reviews System

**Fecha:** 2025-11-11
**QA Lead:** AI-Generated (Shift-Left Analysis)
**Epic Jira Key:** MYM-32
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

The Reputation & Reviews System is a **core differentiator** and trust-building mechanism explicitly mentioned in the Business Model Canvas. It directly enables the platform's value proposition of "access to verified expertise through transparent reviews."

**Key Value Proposition:**

* **Reduces Risk for Mentees:** Transparent reviews from real sessions help mentees make informed booking decisions, reducing fear of wasting money on poor-quality mentors
* **Encourages Professionalism:** Bidirectional reviews (mentors review mentees too) create accountability on both sides, fostering respectful interactions
* **Increases Conversion:** Social proof (high ratings) significantly increases booking conversion rates - mentors with 4.5+ ratings are estimated to convert 30% higher than unrated mentors
* **Natural Quality Control:** Low-rated mentors naturally filter out of the marketplace, maintaining overall platform quality without heavy-handed moderation
* **Continuous Improvement:** Feedback loop helps mentors identify weaknesses and improve their service over time

**Success Metrics (KPIs):**

This epic directly impacts the following KPIs from Executive Summary:

* **Adoption KPIs:**
  * 50 mentors verified in first 3 months → Reviews help validate mentor quality
  * 500 students registered → Reviews build trust that drives student sign-ups
* **Engagement KPIs:**
  * 100 sessions completed in first month → Reviews encourage repeat bookings
  * >80% mentor retention after 6 months → Fair review system prevents unfair churn
* **Business KPIs:**
  * $5,000 GMV, $1,000 revenue in first month → Trust drives transactions

**Additional Epic-Specific Metrics:**

* >50% review completion rate (reviews submitted / sessions completed)
* <2% flagged reviews (quality indicator)
* >4.0 average platform rating (ecosystem health)
* 70% of mentees check reviews before booking (utilization)
* 80% of reviews include text comment (quality feedback)

**User Impact:**

This epic affects **ALL three user personas** from the PRD:

* **Persona 1: Laura, la Desarrolladora Junior (Mentee)**
  * **How affected:** Can read reviews to find the best mentor for her React problem, reducing risk of booking the wrong mentor
  * **Pain point addressed:** "Teme invertir en... que no aborden sus necesidades puntuales" → Reviews show if mentor is good for her specific need
  * **Journey impact:** In Journey 1 (Step 4), Laura reviews mentor profiles - reviews are the KEY decision factor

* **Persona 2: Carlos, el Arquitecto Senior (Mentor)**
  * **How affected:** Receives reviews from mentees that build his reputation and validate the quality of students (via bidirectional reviews)
  * **Pain point addressed:** "Desea un sistema que valide la reputación de los estudiantes" → Bidirectional reviews let him see mentee quality
  * **Journey impact:** In Journey 2, Carlos's profile quality affects discoverability - reviews are critical for his success

* **Persona 3: Sofía, la Career Changer**
  * **How affected:** As a newcomer to tech, she relies heavily on reviews to validate mentor expertise since she can't evaluate it herself
  * **Pain point addressed:** "Validar sus conocimientos y ganar confianza" → Reviews provide social proof of mentor quality

**Critical User Journeys:**

This epic enables/modifies the following user journeys from PRD:

* **Journey 1: Registro de Estudiante y Reserva de Primera Sesión (Step 4)**
  * **Current:** "Laura revisa varios perfiles, se detiene en uno con buenas valoraciones"
  * **This epic enables:** The "buenas valoraciones" display on profiles (MYM-35) and the ability to read detailed reviews
  * **Critical test:** Ensure reviews display correctly on profiles during discovery

* **Journey 3: Estudiante Deja Valoración y Mentor Recibe Pago (Steps 1-2)**
  * **Current:** Laura receives email to leave review, submits 5-star rating and comment
  * **This epic enables:** The entire review submission flow (MYM-33, MYM-34)
  * **Critical test:** Ensure review prompt triggers correctly 1h after session, submission works, and review appears on mentor profile

**NEW User Journey (Not in PRD, but implied by epic):**

* **Bidirectional Review Flow:**
  * Session completes → 1h passes → Both parties receive review reminder email
  * Mentee submits review for mentor (cannot see mentor's review yet)
  * Mentor submits review for mentee (cannot see mentee's review yet)
  * Both reviews become visible simultaneously
  * **Critical test:** Ensure neither party can see the other's review before submitting (prevents bias)

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

* **Review Submission Form Component** (new)
  * Star rating selector (1-5 stars, interactive)
  * Comment textarea (max 500 chars with counter)
  * Submit/Cancel buttons
  * Eligibility validation (can user review this session?)
* **Profile Review Display Component** (enhancement to existing profile components)
  * Average rating display (e.g., "★★★★☆ 4.7 / 5.0")
  * Rating breakdown histogram (bar chart showing distribution)
  * Individual review cards (rating, comment, reviewer name, date)
  * Pagination controls (10 reviews per page)
  * Sort dropdown (Most Recent, Highest, Lowest)
  * Filter dropdown (All, 5-star, 4-star+, etc.)
  * Flag review button
* **Session Dashboard Enhancement**
  * "Leave Review" button for completed sessions
  * Review status indicator (reviewed / pending)
* **Pages affected:**
  * `/dashboard/sessions` (review button)
  * `/mentors/[id]` (review display on mentor profiles)
  * `/students/[id]` (review display on mentee profiles - TBD if public)
  * `/review/submit?booking=[id]` (review submission form)

**Backend:**

* **API Endpoints (see api-contracts.yaml lines 478-599):**
  * `POST /api/reviews/mentor` - Mentee submits review for mentor (FR-013)
  * `POST /api/reviews/student` - Mentor submits review for mentee (FR-014)
  * `GET /api/profiles/{profileId}/reviews` - Get reviews for a profile (FR-015)
  * `POST /api/reviews/:id/flag` - Flag inappropriate review
  * `PATCH /api/reviews/:id/moderate` - Admin hide/unhide review (admin only)
  * `GET /api/users/:id/rating` - Get user's rating summary
* **Business Logic Services:**
  * `ReviewEligibilityService` - Check if user can review a session
  * `RatingAggregationService` - Calculate average rating and distribution
  * `ReviewModerationService` - Handle flagging and admin moderation
* **Background Jobs:**
  * `ReviewReminderEmailJob` - Sends email 1h after session completion
  * `NewReviewNotificationJob` - Notifies reviewee when they receive a review

**Database:**

* **Tables involved (see architecture-specs.md ERD lines 102-111):**
  * `reviews` (new table)
    * Columns: id, booking_id, reviewer_id, reviewee_id, reviewer_role, rating, comment, is_flagged, is_hidden, flagged_reason, created_at, updated_at
    * **CRITICAL CONSTRAINT:** UNIQUE (booking_id, reviewer_id) - Prevents duplicate reviews
    * Indexes: reviewee_id, reviewer_id, booking_id, created_at
  * `user_ratings` (new materialized view or cached table)
    * Columns: user_id, role, average_rating, total_reviews, rating_distribution (JSONB), updated_at
    * Updated via DB triggers on INSERT/UPDATE/DELETE in `reviews`
  * `bookings` (existing, no schema changes)
    * Used to validate review eligibility (session completed, 1h passed)
  * `users` (existing, no schema changes)
    * Reviewer and reviewee data
* **DB Triggers:**
  * `update_user_ratings_trigger` - Recalculates `user_ratings` when review is inserted/updated/deleted
  * Ensures rating aggregation stays in sync without manual updates

**External Services:**

* **Email Service (Resend or SendGrid via Supabase Edge Functions):**
  * Review reminder email (1h after session)
  * New review notification email (when user receives review)
  * Flagged review alert (to admin)
* **Supabase Storage (if applicable):**
  * Not directly involved, but reviewer profile photos are displayed (existing storage)

### Integration Points (Critical for Testing)

**Internal Integration Points:**

1. **Frontend ↔ Backend API**
   * Review submission: Form validation → POST request → Response handling
   * Review display: Profile page load → GET request → Render reviews
   * **Test:** API contract validation (request/response schemas match api-contracts.yaml)

2. **Backend API ↔ Database**
   * Review CRUD operations
   * Rating aggregation queries
   * **Test:** DB constraints work (UNIQUE on booking_id + reviewer_id), triggers fire correctly

3. **Backend ↔ Auth Service (Supabase Auth)**
   * Verify user is authenticated before submitting/viewing reviews
   * RLS (Row Level Security) policies: users can only review sessions they participated in
   * **Test:** Authorization checks (user can't review someone else's session)

4. **Reviews ↔ Bookings (Data Dependency)**
   * Review submission requires a completed booking
   * Eligibility check: `booking.status === 'completed'` AND `1h has passed`
   * **Test:** Can't review a pending/cancelled session, can't review before 1h has passed

5. **Reviews ↔ User Profiles (Display Integration)**
   * Reviews appear on mentor profiles (EPIC-003 Mentor Discovery integration)
   * Reviews may appear on mentee profiles (TBD - needs clarification)
   * Average rating displayed on profile cards in search results
   * **Test:** Profile display updates immediately after new review submitted

6. **DB Triggers ↔ Cached Ratings**
   * When review is inserted → Trigger recalculates `user_ratings.average_rating`
   * When review is flagged/hidden → Trigger recalculates (excludes hidden reviews)
   * **Test:** Rating calculation is accurate, trigger fires reliably, performance acceptable

**External Integration Points:**

1. **Backend ↔ Email Service (Resend/SendGrid)**
   * Trigger: Session completes + 1h → Send review reminder email
   * Trigger: User receives new review → Send notification email
   * Trigger: Review is flagged → Send admin alert email
   * **Test:** Email delivery (use email testing tools), template rendering, link validity

2. **Email Link ↔ Review Submission Page**
   * Email contains link: `https://app.upexmymentor.com/review/submit?booking=[id]&token=[jwt]`
   * Link must authenticate user and pre-fill booking context
   * **Test:** Link works, loads correct session, user is authenticated

**Data Flow (Review Submission Flow):**

```
User (Frontend) → Submit Review Form
  ↓
Frontend Validation (Zod schema)
  ↓
POST /api/reviews/mentor (with JWT auth header)
  ↓
Backend API Route
  ├─ Verify JWT (Supabase Auth)
  ├─ Check Review Eligibility (ReviewEligibilityService)
  │  ├─ Fetch booking from DB
  │  ├─ Verify user is participant (booking.mentee_id === userId)
  │  ├─ Verify booking.status === 'completed'
  │  ├─ Verify 1h has passed since session end
  │  └─ Verify no existing review (query reviews table)
  ├─ Insert review into DB (reviews table)
  │  └─ DB Trigger fires → Update user_ratings table
  ├─ Send Email Notification (to reviewee)
  └─ Return 201 Created response
  ↓
Frontend: Display success message, redirect to profile
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Rating Calculation Race Conditions (Concurrent Review Submissions)

* **Impact:** High
* **Likelihood:** Medium
* **Area Affected:** Backend (rating aggregation logic)
* **What could go wrong:**
  * Two reviews submitted simultaneously for the same user
  * DB trigger calculates average based on stale data
  * Final average rating is incorrect (e.g., 4.7 instead of 4.6)
* **Mitigation Strategy:**
  * Use **database transactions** with row-level locking for rating updates
  * Use **materialized view** with `REFRESH CONCURRENTLY` instead of triggers for high-volume mentors
  * Add **pessimistic locking** on `user_ratings` table during updates
  * Test with K6 load testing: 100 concurrent reviews for same user, verify final rating is accurate
* **Test Coverage Required:**
  * **Load test:** 100 concurrent review submissions for same mentor
  * **Integration test:** Submit 2 reviews simultaneously, verify both are saved and rating is correct
  * **Unit test:** Rating calculation function with edge cases (1 review, 1000 reviews, all 5-star, all 1-star)

#### Risk 2: Review Duplicate Prevention Failure (DB Constraint Bypass)

* **Impact:** Critical
* **Likelihood:** Low
* **Area Affected:** Database (UNIQUE constraint on reviews table)
* **What could go wrong:**
  * User submits review twice (double-click button, network retry, malicious API call)
  * UNIQUE constraint on (booking_id, reviewer_id) fails or is not configured
  * Duplicate reviews appear on profile, skewing average rating
  * Breaks epic acceptance criteria #3: "Each session can only be reviewed once per user"
* **Mitigation Strategy:**
  * **Enforce UNIQUE constraint at DB level** (primary defense)
  * **Check for existing review in API layer** before INSERT (secondary defense)
  * **Frontend: Disable submit button after first click** (UX defense)
  * **API: Use idempotency keys** for review submission (Stripe-style pattern)
* **Test Coverage Required:**
  * **Unit test:** Attempt duplicate review submission → Expect 400 error
  * **Integration test:** Submit review, verify success, submit again → Expect 400 error with message "Already reviewed"
  * **E2E test:** Click submit button rapidly 10 times → Only 1 review saved
  * **Manual test:** Verify DB constraint exists: `SELECT * FROM information_schema.table_constraints WHERE constraint_name LIKE '%booking_reviewer%';`

#### Risk 3: Bidirectional Review Leakage (One Party Sees Other's Review Before Submitting)

* **Impact:** High
* **Likelihood:** Medium
* **Area Affected:** Backend API, Frontend display logic
* **What could go wrong:**
  * Mentee submits review for mentor
  * Mentor can see mentee's review BEFORE submitting their own
  * Mentor's review is biased (retaliatory low rating, or fake high rating to reciprocate)
  * Destroys authenticity of bidirectional review system
  * Violates epic scope: "Reviews are independent (can't see other's review before submitting)"
* **Mitigation Strategy:**
  * **API Logic:** When fetching reviews for a session, hide the other party's review if current user hasn't reviewed yet
  * **Frontend Logic:** Don't display "other's review" until both parties have submitted
  * **DB Query:** `SELECT * FROM reviews WHERE booking_id = X AND (reviewer_id = current_user OR has_current_user_reviewed = true)`
  * **Alternative Approach:** Use a `review_pairs` table that only reveals both reviews when both are submitted
* **Test Coverage Required:**
  * **E2E test:**
    1. Mentee submits review → Mentor logs in → Mentor fetches session details → Verify mentee's review is NOT visible
    2. Mentor submits review → Both log in → Both can now see each other's reviews
  * **API test:**
    1. Mentee submits review → GET /api/bookings/{id}/reviews as mentor → Expect empty array or only mentor's own review (if submitted)
    2. Both submit → GET /api/bookings/{id}/reviews → Expect both reviews

#### Risk 4: DB Trigger Failure (Rating Not Updated After Review Submission)

* **Impact:** High
* **Likelihood:** Low
* **Area Affected:** Database triggers
* **What could go wrong:**
  * User submits review → Review is saved successfully
  * DB trigger to update `user_ratings` table fails or doesn't fire
  * Mentor's average rating is stale (still shows 4.5 when it should be 4.6)
  * Profile displays incorrect rating, affecting booking decisions
* **Mitigation Strategy:**
  * **Comprehensive trigger testing** in staging environment
  * **Monitoring/alerting:** Log when rating updates occur, alert if trigger doesn't fire within 5s of review insert
  * **Fallback:** Background job runs hourly to recalculate all ratings (safety net)
  * **Idempotent trigger:** Trigger should be safe to run multiple times (use UPSERT)
* **Test Coverage Required:**
  * **Integration test:** Insert review → Wait 1s → Query `user_ratings` → Verify average_rating updated
  * **Integration test:** Insert 3 reviews rapidly → Verify rating reflects all 3 reviews
  * **Integration test:** Hide a review (set is_hidden = true) → Verify rating recalculates excluding hidden review
  * **Manual test:** Monitor DB logs for trigger execution

#### Risk 5: Review Comment XSS Vulnerability (Malicious Script Injection)

* **Impact:** Critical
* **Likelihood:** Low
* **Area Affected:** Frontend review display
* **What could go wrong:**
  * Malicious user submits review with comment: `<script>alert('XSS')</script>` or `<img src=x onerror=alert('XSS')>`
  * Frontend renders comment without sanitization
  * Script executes in other users' browsers when viewing profile
  * Could steal session tokens, redirect to phishing sites, deface profile
* **Mitigation Strategy:**
  * **Backend:** Sanitize input on submission (strip HTML tags, escape special characters)
  * **Frontend:** Use React's default XSS protection (don't use `dangerouslySetInnerHTML`)
  * **Content Security Policy (CSP):** Configure CSP headers to block inline scripts
  * **Validation:** Allow only alphanumeric + basic punctuation in comments
* **Test Coverage Required:**
  * **Security test:** Submit review with XSS payload → Verify payload is escaped/stripped
  * **E2E test:** Submit review with `<script>alert('test')</script>` → View profile → Verify no alert pops up
  * **Manual test:** Use OWASP ZAP to scan review submission endpoint for XSS vulnerabilities

---

### Business Risks

#### Risk 1: Review Bombing / Coordinated Malicious Ratings (Destroys Mentor Reputation)

* **Impact on Business:** Critical - Could destroy trust in the platform and drive away mentors
* **Impact on Users:** Mentor receives 20+ fake 1-star reviews in 24 hours, drops from 4.8 to 1.2 rating, loses all future bookings
* **Likelihood:** Medium (especially for high-profile mentors or competitive niches)
* **Mitigation Strategy:**
  * **Verified Purchase Requirement:** Can only review if booking was paid and session completed (already in epic)
  * **Rate Limiting:** Max 5 reviews per user per day (prevent single attacker)
  * **Pattern Detection:** Flag suspicious patterns (20 reviews from new accounts in 24h, all 1-star, no comments)
  * **Manual Review:** Admin dashboard shows flagged patterns for investigation
  * **Review Velocity Alerts:** Email mentor if they receive 5+ reviews in 1 day (unusual activity)
* **Acceptance Criteria Validation:**
  * Epic AC #9: "Users can flag inappropriate reviews" ✅ (but not enough - needs automated detection)
  * Epic AC #10: "Flagged reviews are hidden from public view until admin review" ✅
  * **MISSING:** Automated pattern detection, rate limiting (suggest adding to epic)

#### Risk 2: Low Review Participation Rate (Users Don't Leave Reviews)

* **Impact on Business:** High - Without reviews, the trust mechanism doesn't work, and the platform loses its differentiation
* **Impact on Users:** Mentees can't make informed decisions, mentors don't get feedback to improve
* **Likelihood:** High (common problem on review platforms - Uber had to experiment heavily to reach 50% review rate)
* **Mitigation Strategy:**
  * **Multiple Touchpoints:** Email reminder (1h after), in-app banner, dashboard notification
  * **Simplify Process:** Pre-fill session details, minimize clicks (1-click to 5-star, optional comment)
  * **Incentives (Future):** Small discount on next session for leaving review (out of scope for MVP)
  * **Social Proof:** "23 people have reviewed [Name] - share your experience too!"
  * **Timing:** 1h after session (not too soon, not too late) - but test if 24h delay increases completion
* **Acceptance Criteria Validation:**
  * Epic success metric: ">50% review completion rate" - ambitious but achievable with good UX
  * Epic AC #1: "Users can submit a review 1 hour after session completion" ✅
  * **TEST:** Measure review completion rate in beta testing, iterate on reminders if below 40%

#### Risk 3: Negative Reviews Discourage New Mentors (Churn Risk)

* **Impact on Business:** Medium - If first-time mentors get harsh reviews, they may quit before improving
* **Impact on Users:** Reduces mentor supply, hurts marketplace liquidity
* **Likelihood:** Medium (especially for mentors new to teaching/mentoring)
* **Mitigation Strategy:**
  * **Onboarding Expectations:** Explain that reviews are a learning tool, not just a judgment
  * **Mentor Training:** Provide resources on how to deliver great sessions (reduce negative reviews at source)
  * **Review Response (Future):** Let mentors reply to reviews to provide context (out of MVP scope)
  * **Highlight Growth:** Show mentor their rating trend over time (e.g., "You've improved from 3.8 to 4.5!")
  * **Balanced Display:** Show both positive and negative reviews (don't hide negative ones, but frame them constructively)
* **Acceptance Criteria Validation:**
  * Epic success metric: "<5% mentor churn due to negative reviews" - needs tracking
  * **MISSING:** Mentor-facing review analytics/dashboard (suggest for v2)

#### Risk 4: Quid Pro Quo Reviews (Fake 5-Star Exchanges Between Friends)

* **Impact on Business:** Medium - Erodes trust if users realize reviews are fake
* **Impact on Users:** Mentees book mentors with fake high ratings, have bad experience, lose trust in platform
* **Likelihood:** Medium (especially in small communities or early stage when few reviews exist)
* **Mitigation Strategy:**
  * **Bidirectional Reviews Reduce Incentive:** Mentor can't control mentee's review, so quid pro quo is risky
  * **Verified Purchase:** Can only review if payment was made (prevents zero-cost fake reviews)
  * **Pattern Detection:** Flag if user always gives 5-stars to everyone (suspicious pattern)
  * **Review Variance:** Healthy review distribution should have some 3-4 star reviews (all 5-star is suspicious)
  * **Long-Term Solution:** ML model to detect fake reviews (out of MVP scope)
* **Acceptance Criteria Validation:**
  * Epic risk table mentions this: "Bidirectional reviews reduce incentive" ✅
  * Epic success metric: ">4.0 average platform rating" - reasonable, not too high (5.0 would be suspicious)

#### Risk 5: Inappropriate/Offensive Comments in Reviews (Brand Risk)

* **Impact on Business:** Medium - Offensive language damages platform reputation, potential legal issues
* **Impact on Users:** Reviewee feels harassed, may leave platform, other users see unprofessional content
* **Likelihood:** Medium (on any open review platform)
* **Mitigation Strategy:**
  * **Flag System:** Users can flag inappropriate reviews (already in epic AC #9) ✅
  * **Manual Moderation:** Admin can hide flagged reviews (already in epic AC #10) ✅
  * **Auto-Moderation (Future):** Keyword filter for profanity, slurs (out of MVP scope per epic)
  * **Review Guidelines:** Display clear guidelines before submission (epic has guidelines section) ✅
  * **Character Limit:** 500 char limit reduces spam/rants (already in epic) ✅
* **Acceptance Criteria Validation:**
  * Epic AC #9: "Users can flag inappropriate reviews" ✅
  * Epic AC #10: "Flagged reviews are hidden from public view until admin review" ✅
  * Epic success metric: "<2% flagged reviews" - good quality indicator
  * **TEST:** Submit reviews with profanity, verify flag system works, verify admin can hide

---

### Integration Risks

#### Integration Risk 1: Email Delivery Failure (Review Reminders Not Sent)

* **Integration Point:** Backend ↔ Email Service (Resend/SendGrid)
* **What Could Go Wrong:**
  * Session completes + 1h passes → Review reminder email should be sent
  * Email service is down, API quota exceeded, or request fails
  * User never receives reminder → Low review participation rate
  * Violates epic AC #1: "After a session is marked as completed, the user receives a prompt to rate"
* **Impact:** High (directly impacts review completion rate KPI)
* **Mitigation:**
  * **Retry Logic:** If email send fails, retry 3 times with exponential backoff
  * **Dead Letter Queue:** If still fails, log to error tracking (Sentry) for manual follow-up
  * **In-App Backup:** Show review prompt in user dashboard even if email fails
  * **Monitoring:** Alert if email delivery rate drops below 95%
  * **Testing:** Use email testing service (Mailtrap, MailHog) in staging
* **Test Coverage:**
  * **Integration test:** Trigger review reminder email → Mock email service failure → Verify retry logic executes
  * **E2E test:** Complete session → Wait 1h (or fast-forward time in test) → Verify email sent
  * **Manual test:** Check email spam folder (ensure emails don't get spam-filtered)

#### Integration Risk 2: Profile Display Not Updating After New Review (Caching Issue)

* **Integration Point:** Reviews ↔ User Profiles (Frontend Display)
* **What Could Go Wrong:**
  * User submits review for mentor → Review saved successfully
  * Another user views mentor profile → Old average rating displayed (cache not invalidated)
  * Stale rating affects booking decisions
* **Impact:** Medium (degrades user experience, but doesn't break functionality)
* **Mitigation:**
  * **Cache Invalidation:** When review is submitted, invalidate cache for reviewee's profile
  * **Short Cache TTL:** Set profile cache TTL to 5 minutes (balance freshness vs. performance)
  * **ISR (Incremental Static Regeneration):** Use Next.js ISR to regenerate profile pages on-demand
  * **Testing:** Submit review, immediately fetch profile, verify new rating appears
* **Test Coverage:**
  * **Integration test:** Submit review → Fetch mentor profile API → Verify new average_rating in response
  * **E2E test:** Submit review → Refresh mentor profile page → Verify new rating displays
  * **Load test:** Ensure rating aggregation query is fast enough to run on every profile view (<150ms per NFR-001)

#### Integration Risk 3: Booking Status Mismatch (Review Allowed for Non-Completed Session)

* **Integration Point:** Reviews ↔ Bookings (Data Dependency)
* **What Could Go Wrong:**
  * Booking is in status `pending` or `cancelled`
  * User somehow accesses review submission form (direct URL, timing race condition)
  * Review is submitted for a session that never happened
  * Violates eligibility logic: "Session must be completed before review"
* **Impact:** Medium (data integrity issue, but doesn't affect most users)
* **Mitigation:**
  * **Backend Validation:** Check `booking.status === 'completed'` in API before accepting review
  * **Frontend Validation:** Disable "Leave Review" button if session not completed
  * **DB Constraint:** Add foreign key constraint: `reviews.booking_id` must reference valid booking
  * **Testing:** Attempt to submit review for pending/cancelled session, verify error
* **Test Coverage:**
  * **Negative test:** POST /api/reviews/mentor with booking_id of pending session → Expect 400 error
  * **Negative test:** POST /api/reviews/mentor with booking_id of cancelled session → Expect 400 error
  * **Negative test:** POST /api/reviews/mentor with non-existent booking_id → Expect 404 error

#### Integration Risk 4: 1-Hour Timing Inconsistency (Review Allowed Too Early or Too Late)

* **Integration Point:** Backend Eligibility Logic ↔ Booking Timestamps
* **What Could Go Wrong:**
  * Session ends at 3:00 PM
  * Review eligibility should start at 4:00 PM (1h after)
  * Due to timezone bugs, clock skew, or logic errors, review is allowed at 3:30 PM (too early) or blocked at 5:00 PM (too late)
* **Impact:** Medium (UX issue - users confused why they can't review)
* **Mitigation:**
  * **Consistent Timezone:** Store all timestamps in UTC (already in architecture)
  * **Clear Definition:** "1h after session end" = `booking.session_date + booking.duration_minutes + 60 minutes`
  * **Testing:** Freeze time in tests, advance by 59 min (blocked), advance by 61 min (allowed)
* **Test Coverage:**
  * **Unit test:** `canReview()` function with various time offsets (0 min, 59 min, 60 min, 61 min, 24 hours)
  * **Integration test:** Complete session → Fast-forward time by 59 min → POST /api/reviews → Expect 400 error "Review not available yet"
  * **Integration test:** Complete session → Fast-forward time by 61 min → POST /api/reviews → Expect 201 success

#### Integration Risk 5: Admin Moderation UI Not Connected to API (Flagged Reviews Can't Be Hidden)

* **Integration Point:** Admin UI ↔ Review Moderation API
* **What Could Go Wrong:**
  * User flags inappropriate review → Flag is saved in DB
  * Admin logs into admin dashboard → Sees flagged review
  * Admin clicks "Hide Review" → API call fails or UI doesn't update
  * Inappropriate review remains visible to public
  * Violates epic AC #10: "Flagged reviews are hidden from public view until admin review"
* **Impact:** Low (admin feature, doesn't affect end users directly, but needed for moderation)
* **Mitigation:**
  * **Admin UI Testing:** Manual testing of admin dashboard in staging
  * **RBAC Enforcement:** Ensure only admin users can call `PATCH /api/reviews/:id/moderate`
  * **Audit Log:** Log all admin actions (who hid what review, when)
* **Test Coverage:**
  * **E2E test (admin):** Flag review as user → Log in as admin → Hide review → Verify review no longer visible on public profile
  * **API test:** PATCH /api/reviews/:id/moderate as admin → Expect 200 success
  * **Security test:** PATCH /api/reviews/:id/moderate as regular user → Expect 403 Forbidden

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1: Review Timing - "1 hour after session completion" - which timestamp?**

* **Found in:** Epic scope ("Review prompt triggered 1 hour after session completion"), FR-013
* **Question for PO:**
  * Is "completion" = scheduled end time (`booking.session_date + duration_minutes`) OR actual completion timestamp (when mentor clicks "End Session")?
  * **Example:** Session scheduled 2:00-3:00 PM, but mentor ends call at 2:45 PM. When can user review?
    * Option A: At 3:00 PM (1h after scheduled end) - simpler, predictable
    * Option B: At 3:45 PM (1h after actual end) - more accurate, but requires tracking actual end time
  * **Recommendation:** Option A (scheduled end time) for MVP simplicity
* **Impact if not clarified:**
  * Dev implements Option A, PO expects Option B → Rework required
  * Users receive review reminder at unexpected time → Confusion, lower completion rate

**Ambiguity 2: Anonymous Reviews - Epic and Acceptance Criteria Contradict**

* **Found in:**
  * Epic notes section: "Anonymous reviews (all reviews show reviewer name)"
  * MYM-35 AC: "Each review shows: rating, comment, reviewer name (or \"Anonymous Mentee/Mentor\"), and date"
* **Question for PO:**
  * Are reviews ALWAYS named (show full name: "Laura García") OR are they anonymous by default ("Anonymous Mentee")?
  * If anonymous, how does it build trust? (named reviews are more credible)
  * If named, does user have option to review anonymously?
* **Impact if not clarified:**
  * **Critical UX issue:** Dev builds named reviews, users expect anonymity → Privacy complaints
  * **Business impact:** Anonymous reviews may reduce trust and booking conversion

**Ambiguity 3: Bidirectional Review Visibility - How to technically prevent leakage?**

* **Found in:** Epic scope ("Reviews are independent (can't see other's review before submitting)")
* **Question for Dev:**
  * What is the technical implementation to ensure mentee can't see mentor's review before submitting?
    * Option A: Reviews are hidden until BOTH parties submit, then both are revealed simultaneously
    * Option B: Each party can see their own submitted review, but not the other's until they also submit
  * Does the DB have a `review_pair_id` or `both_submitted` flag to track this?
  * What happens if one party never reviews? (e.g., mentee reviews but mentor ignores reminder)
* **Impact if not clarified:**
  * **High-risk implementation mistake:** If logic is wrong, entire bidirectional trust mechanism is compromised

**Ambiguity 4: Flagged Review Threshold - Auto-hide or manual review?**

* **Found in:** Epic AC #10 ("Flagged reviews are hidden from public view until admin review")
* **Question for PO:**
  * Does ONE flag hide the review immediately (harsh, but fast) OR does it require multiple flags (more fair, but slower)?
  * Is there a threshold? (e.g., 3+ flags = auto-hide, fewer = manual admin review)
  * What if a review is mass-flagged by coordinated attackers? (review bombing on the flag system itself)
  * **Recommendation:** 3+ flags = auto-hide + admin notification (balance speed and fairness)
* **Impact if not clarified:**
  * **Business risk:** Too sensitive = legitimate reviews get hidden unfairly, angering users
  * **Business risk:** Too lenient = inappropriate reviews stay visible too long, damaging brand

**Ambiguity 5: Mentee Rating Display - Where and to whom?**

* **Found in:** Epic mentions bidirectional reviews, but mentee profiles are not mentioned in Mentor Discovery epic
* **Question for PO:**
  * Where do mentee ratings appear? Options:
    * A: Only visible to mentors (when mentee tries to book a session, mentor sees their rating)
    * B: Public on mentee profile page (like mentor profiles)
    * C: Not displayed at all for MVP (bidirectional reviews collected but not shown)
  * **Recommendation:** Option A (mentor-facing only) for MVP - helps mentors filter serious mentees
* **Impact if not clarified:**
  * **Scope creep:** If Option B (public mentee profiles), needs new pages/routes not in current epic
  * **Wasted dev effort:** If Option C (not displayed), why collect mentee reviews at all in MVP?

---

### Missing Information

**Missing 1: Review Edit Grace Period**

* **Needed for:** Handling accidental typos or immediate regrets after submission
* **Current State:** Epic says reviews are "immutable after submission" (strict)
* **Suggestion:** Add 5-10 minute edit window after submission (like Gmail's "Undo Send")
  * User submits review → Has 10 min to edit comment (rating cannot change to prevent gaming)
  * After 10 min → Review becomes truly immutable
  * Maintains integrity (can't change review weeks later to retaliate) while allowing typo fixes
* **Rationale:** Users will make typos, and a harsh "no edits ever" policy may discourage review participation

**Missing 2: Review Reminder Cadence and Follow-Up**

* **Needed for:** Achieving >50% review completion rate KPI
* **Current State:** Epic mentions "email reminder 1h after session" but no follow-up plan
* **Suggestion:**
  * **Reminder 1 (1 hour after session):** "How was your session with [Name]?" (primary prompt)
  * **Reminder 2 (7 days after session):** "You haven't reviewed [Name] yet - your feedback helps our community" (gentle nudge)
  * **In-App Prompt:** Banner on dashboard: "You have 3 sessions waiting for your review"
  * **No Reminder 3:** Stop after 2 reminders (avoid being annoying)
* **Rationale:** Uber/Airbnb use 2-3 reminder touchpoints to achieve high review rates

**Missing 3: API Rate Limiting on Review Submission**

* **Needed for:** Preventing spam and review bombing attacks
* **Current State:** No mention of rate limiting in epic or API specs
* **Suggestion:**
  * **Per-user limit:** Max 10 reviews per user per 24 hours
  * **Per-IP limit:** Max 20 reviews per IP per 24 hours (catches multiple fake accounts)
  * **Honeypot:** If user exceeds limit, flag for admin review but don't show error (to avoid tipping off attacker)
* **Rationale:** Mitigates Risk #1 (Review Bombing) identified in Business Risks section

**Missing 4: Review Helpful/Unhelpful Voting (Out of Scope, but mentioned)**

* **Needed for:** Prioritizing high-quality reviews (future enhancement)
* **Current State:** Epic explicitly says "Out of Scope (Future): Review helpfulness voting"
* **Suggestion:** Acknowledge this is v2, but design review data model to support it later
  * Add `helpful_count` and `unhelpful_count` columns to `reviews` table (default 0, not used in MVP)
  * Allows smooth v2 migration without DB schema changes
* **Rationale:** Future-proof the design

**Missing 5: Admin Dashboard for Review Moderation**

* **Needed for:** Epic AC #10 (Admin can hide/unhide reviews)
* **Current State:** API endpoint exists (`PATCH /api/reviews/:id/moderate`) but no UI mentioned
* **Suggestion:** Add to epic scope or create separate admin story:
  * Admin dashboard at `/admin/reviews/flagged`
  * Shows list of flagged reviews with: Review content, Reviewer, Reviewee, Flag reason, Date flagged
  * Actions: Hide, Unhide, Dismiss Flag, Ban User (extreme cases)
  * Audit log: Track who performed what action and when
* **Rationale:** Without UI, the admin API endpoint is useless

**Missing 6: Empty State and Zero-Review Scenarios**

* **Needed for:** New mentors/mentees with no reviews yet
* **Current State:** Epic AC #11 mentions "Empty state shown for profiles with no reviews" but no design details
* **Suggestion:** Define empty state message:
  * For new mentors: "No reviews yet - be the first to leave feedback after your session!"
  * For established mentors: "This mentor hasn't received reviews yet, but they're verified and ready to help!"
* **Rationale:** Empty state should encourage first reviewer, not discourage booking

---

### Suggested Improvements (Before Implementation)

**Improvement 1: Add Explicit Review Edit Grace Period (5-10 minutes)**

* **Story Affected:** MYM-33, MYM-34 (both review submission stories)
* **Current State:** Epic says reviews are "immutable after submission" - no edits allowed ever
* **Suggested Change:**
  * Allow review editing for 10 minutes after submission
  * Only allow comment edits (rating cannot change to prevent gaming)
  * After 10 min, review becomes truly immutable
  * Display timer: "You can edit this review for 9 more minutes"
* **Benefit:** Reduces user frustration from typos, increases review submission confidence, improves review quality

**Improvement 2: Define Explicit Mentee Rating Visibility Rules**

* **Story Affected:** MYM-34 (mentor reviews mentee), MYM-35 (display reviews)
* **Current State:** Epic mentions bidirectional reviews but doesn't specify where mentee ratings are shown
* **Suggested Change:**
  * **For MVP:** Mentee ratings are visible ONLY to mentors (when viewing booking request or mentee profile)
  * **Rationale:** Helps mentors filter serious mentees, doesn't add scope of public mentee profiles
  * **Add to epic:** "Mentee ratings are displayed on mentor-facing views (booking requests, mentee profile in mentor dashboard)"
* **Benefit:** Clarifies scope, prevents scope creep, ensures bidirectional reviews serve a purpose

**Improvement 3: Add Auto-Hide Threshold for Flagged Reviews (3+ flags)**

* **Story Affected:** Epic scope (review moderation)
* **Current State:** Epic AC #10 says flagged reviews are hidden "until admin review" but doesn't specify trigger
* **Suggested Change:**
  * **1-2 flags:** Review stays visible, admin is notified for manual review
  * **3+ flags:** Review is auto-hidden temporarily (fast action to protect users)
  * **Admin can:** Unhide if false flags, permanently hide if truly inappropriate, ban reviewer if egregious
* **Benefit:** Balances speed (protects users from inappropriate content fast) and fairness (doesn't hide reviews after 1 false flag)

**Improvement 4: Clarify Anonymous vs. Named Review Policy**

* **Story Affected:** MYM-33, MYM-34, MYM-35 (all review stories)
* **Current State:** Epic notes say "all reviews show reviewer name" but MYM-35 AC says "or Anonymous Mentee/Mentor" (contradicts)
* **Suggested Change:**
  * **Decision A (Recommended):** All reviews show full reviewer name (e.g., "Laura García") - builds more trust, aligns with "verified expertise" value prop
  * **Decision B:** Reviews are anonymous by default ("Anonymous Mentee"), with option to show name - more privacy, less trust
  * **Pick one and update epic + all AC consistently**
* **Benefit:** Eliminates confusion, ensures consistent UX, avoids last-minute rework

**Improvement 5: Add API Rate Limiting on Review Submission**

* **Story Affected:** Backend API for MYM-33, MYM-34
* **Current State:** No rate limiting mentioned in epic or api-contracts.yaml
* **Suggested Change:**
  * Add rate limiting: Max 10 reviews per user per 24 hours
  * Add to non-functional specs: "Review submission rate limited to prevent spam"
  * Implement in API middleware (before review submission logic)
* **Benefit:** Mitigates review bombing risk (Identified as Risk #1 in Business Risks), prevents spam

**Improvement 6: Add Review Reminder Follow-Up (7 days after session)**

* **Story Affected:** Epic scope (email notifications)
* **Current State:** Only one email reminder mentioned (1h after session)
* **Suggested Change:**
  * **Reminder 1:** 1h after session (primary prompt)
  * **Reminder 2:** 7 days after session (only if user hasn't reviewed yet) - "Don't forget to review [Name]!"
  * **In-app banner:** "You have 3 sessions waiting for your review" on dashboard
* **Benefit:** Increases review completion rate (helps achieve >50% KPI), proven strategy from Uber/Airbnb

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

* **Functional testing:**
  * UI: Review submission form, profile review display, flag button, sort/filter controls
  * API: All 6 review endpoints (submit mentor review, submit student review, get reviews, flag review, moderate review, get rating summary)
  * Database: Review CRUD, rating aggregation triggers, unique constraints
* **Integration testing:**
  * Reviews ↔ Bookings (eligibility validation)
  * Reviews ↔ User Ratings (DB triggers)
  * Reviews ↔ Profiles (display integration)
  * Backend ↔ Email Service (review reminders)
  * Backend ↔ Auth Service (authorization, RLS policies)
* **Non-functional testing:**
  * Performance: Rating aggregation query speed (<150ms per NFR), load test with 1000+ reviews
  * Security: XSS prevention, SQL injection, duplicate review prevention, authorization checks
  * Concurrency: Race conditions in rating calculation, simultaneous review submissions
* **Cross-browser testing:** Chrome, Firefox, Safari, Edge (latest 2 versions per NFR-005)
* **Mobile responsiveness:** iOS Safari, Android Chrome (per NFR-005)
* **API contract validation:** All requests/responses match api-contracts.yaml schemas
* **Data validation:** Input/output validation per FR-013, FR-014, FR-015

**Out of Scope (For This Epic):**

* **Review editing/deletion** (explicitly out of scope per epic)
* **Review responses** (mentor replies to reviews - future enhancement)
* **AI spam detection** (manual moderation only for MVP)
* **Detailed review criteria** (e.g., "Communication: 5/5" - simple overall rating only)
* **Load testing extreme scale** (1M+ reviews) - test up to 10,000 reviews per epic testing strategy
* **Penetration testing** (external security audit) - basic security tests only

---

### Test Levels

#### Unit Testing

* **Coverage Goal:** >95% code coverage (critical business logic per epic testing strategy)
* **Focus Areas:**
  * `ReviewEligibilityService.canReview()` - All eligibility checks (user is participant, session completed, 1h passed, not reviewed yet)
  * `RatingAggregationService.calculateAverage()` - Rating calculation logic (average, distribution)
  * `ReviewModerationService.shouldAutoHide()` - Flag threshold logic
  * Input validation functions (rating 1-5, comment ≤500 chars)
  * Utility functions (timestamp calculations, eligibility checks)
* **Responsibility:** Dev team (implements unit tests alongside features)
* **QA Role:** Review unit test coverage reports, ensure critical paths are tested

#### Integration Testing

* **Coverage Goal:** All 6 integration points identified in architecture analysis
* **Focus Areas:**
  * **Frontend ↔ Backend API:** API contract validation (request/response match api-contracts.yaml)
  * **Backend ↔ Database:** DB triggers fire correctly (rating updates after review insert/update/delete)
  * **Reviews ↔ Bookings:** Eligibility validation (can't review uncompleted sessions)
  * **Backend ↔ Email Service:** Review reminders sent successfully, templates render correctly
  * **Reviews ↔ Profiles:** Rating display updates immediately after new review
  * **Backend ↔ Auth:** RLS policies enforce authorization (user can only review their own sessions)
* **Responsibility:** QA + Dev (pair programming for complex scenarios)
* **Tools:** Playwright API testing, Postman/Newman for API integration tests

#### End-to-End (E2E) Testing

* **Coverage Goal:** 2 critical user journeys identified in business context analysis
* **Tool:** Playwright
* **Focus Areas:**
  * **Journey 1: Bidirectional Review Flow**
    1. Mentee and mentor complete session
    2. 1h passes (or fast-forward time in test)
    3. Both receive review reminder emails
    4. Mentee submits review for mentor (5 stars, comment)
    5. Mentor submits review for mentee (4 stars, comment)
    6. Both reviews become visible on respective profiles
    7. Average ratings update correctly
  * **Journey 2: Profile Browsing with Review Display**
    1. User navigates to mentor profile
    2. Reviews load and display correctly (rating, comment, reviewer name, date)
    3. User sorts by "Highest Rated" - reviews reorder
    4. User filters by "5-star only" - only 5-star reviews shown
    5. User clicks "Next Page" - pagination works
    6. User flags inappropriate review - flag is saved
  * **Happy Paths:** Full successful flows with no errors
  * **Error Scenarios:**
    * Attempt to review before 1h has passed → Error message shown
    * Attempt to submit duplicate review → Error message shown
    * Attempt to review someone else's session → 403 Forbidden
* **Responsibility:** QA team

#### API Testing

* **Coverage Goal:** 100% of review endpoints (6 endpoints)
* **Tool:** Postman/Newman or Playwright API
* **Focus Areas:**
  * **Contract validation:** All requests/responses match api-contracts.yaml schemas
  * **POST /api/reviews/mentor:** Submit mentee review for mentor
    * Status codes: 201 (success), 400 (invalid data), 401 (unauthorized), 403 (forbidden)
    * Schema validation: rating (1-5 integer), comment (string ≤500 chars), bookingId (UUID)
  * **POST /api/reviews/student:** Submit mentor review for mentee (same tests as above)
  * **GET /api/profiles/{id}/reviews:** Get reviews for a profile
    * Schema validation: average_rating (float), reviews array, pagination metadata
    * Query params: sort (recent/highest/lowest), filter (rating threshold), page, limit
  * **POST /api/reviews/{id}/flag:** Flag inappropriate review
    * Status codes: 200 (success), 404 (review not found), 401 (unauthorized)
  * **PATCH /api/reviews/{id}/moderate:** Admin hide/unhide review
    * Status codes: 200 (success), 403 (non-admin), 404 (review not found)
    * RBAC test: Regular user cannot call this endpoint
  * **GET /api/users/{id}/rating:** Get user rating summary
    * Schema validation: average_rating, total_reviews, rating_distribution (JSONB)
  * **Error handling:** Test all error cases (missing fields, invalid UUIDs, expired tokens)
  * **Authentication/Authorization:** Test with no token, expired token, wrong user token
* **Responsibility:** QA team

---

### Test Types per Story

For each story in this epic, the following test types must be covered:

**Positive Test Cases:**

* Happy path (successful review submission with rating + comment)
* Valid data variations (1-5 stars, different comment lengths including 0 and 500 chars)
* Bidirectional flow (both parties submit reviews independently)
* Multiple reviews on same profile (verify aggregation)

**Negative Test Cases:**

* Invalid rating (0, 6, negative numbers, non-integer, null)
* Invalid comment (>500 chars, special characters/XSS, null if required)
* Missing required fields (rating missing, bookingId missing)
* Unauthorized access (user tries to review someone else's session)
* Duplicate review (same user tries to review same session twice)
* Ineligible session (pending, cancelled, or <1h after completion)

**Boundary Test Cases:**

* Rating: 1 (min valid), 5 (max valid), 0 (min invalid), 6 (max invalid)
* Comment: 0 chars (empty), 1 char, 500 chars (max valid), 501 chars (max invalid)
* Time eligibility: 59 min after session (invalid), 60 min (valid), 61 min (valid)
* Pagination: page=1 (first page), page=N (last page), page=N+1 (beyond last), limit=1 (min), limit=100 (max)

**Exploratory Testing:**

* **Review bombing scenarios:** Rapidly submit many reviews from different accounts, look for patterns/edge cases
  * Why: Mitigate Risk #1 (Review Bombing) - need to manually explore attack vectors
* **Bidirectional review leakage:** Try various timing/UI tricks to see other's review before submitting
  * Why: Mitigate Risk #3 (Bidirectional Review Leakage) - critical security issue
* **Rating calculation edge cases:** Test with unusual review patterns (all 5-star, all 1-star, one review, 1000 reviews)
  * Why: Ensure rating aggregation is accurate in all scenarios
* **Suggestion:** Do exploratory testing BEFORE implementation with mockups/wireframes (shift-left!)

---

## 📊 Test Cases Summary by Story

### MYM-33: Mentee Rates and Reviews Mentor

**Complexity:** HIGH (foundational story, sets up entire review system)
**Estimated Test Cases:** 35

* **Positive:** 8 test cases
  * Submit review with 5-star + comment (happy path)
  * Submit review with 1-star + comment (low rating)
  * Submit review with 3-star + no comment (optional comment)
  * Submit review with 5-star + max length comment (500 chars)
  * Submit review immediately at 1h mark (boundary)
  * Submit review 24h after session (late but valid)
  * Verify review appears on mentor profile immediately
  * Verify mentor's average rating updates correctly
* **Negative:** 15 test cases
  * Submit review with rating=0 (below min)
  * Submit review with rating=6 (above max)
  * Submit review with rating=null (missing required field)
  * Submit review with rating='five' (wrong type)
  * Submit review with comment >500 chars (exceeds max)
  * Submit review with XSS payload in comment (security)
  * Submit review with SQL injection in comment (security)
  * Submit duplicate review for same session (unique constraint)
  * Submit review for pending session (not completed)
  * Submit review for cancelled session (not completed)
  * Submit review before 1h has passed (too early)
  * Submit review for someone else's session (unauthorized)
  * Submit review without auth token (401)
  * Submit review with expired token (401)
  * Submit review with missing bookingId (400)
* **Boundary:** 5 test cases
  * Rating = 1 (min valid)
  * Rating = 5 (max valid)
  * Comment = 0 chars (empty, valid)
  * Comment = 500 chars (max valid)
  * Submit at exactly 60 min after session (boundary)
* **Integration:** 5 test cases
  * Verify DB trigger updates `user_ratings` table
  * Verify review appears on mentor profile (profile integration)
  * Verify email notification sent to mentor (new review notification)
  * Verify RLS policy: mentee can only review their own sessions
  * Verify unique constraint: duplicate insert fails at DB level
* **API:** 2 test cases
  * POST /api/reviews/mentor - validate request/response schemas per api-contracts.yaml
  * GET /api/profiles/{mentorId}/reviews - verify new review appears in response

**Rationale for estimate:**
High complexity due to:
- First story to implement entire review flow (DB schema, API, UI)
- Critical eligibility logic (completed session, 1h passed, not reviewed yet)
- Rating calculation/aggregation (DB triggers)
- Security concerns (XSS, SQL injection, duplicate prevention)

**Parametrized Tests Recommended:** Yes
- Rating values (1, 2, 3, 4, 5) can be parametrized
- Comment lengths (0, 1, 250, 500, 501) can be parametrized
- Session eligibility states (pending, confirmed, completed, cancelled) can be parametrized

---

### MYM-34: Mentor Rates and Reviews Mentee

**Complexity:** MEDIUM (similar to MYM-33, but leverages existing infrastructure)
**Estimated Test Cases:** 28

* **Positive:** 7 test cases
  * Submit review with 5-star + comment (happy path)
  * Submit review with 1-star + comment (low rating)
  * Submit review with 3-star + no comment (optional comment)
  * Submit review with 5-star + max length comment (500 chars)
  * Verify review appears on mentee profile (if public) or mentor-facing view
  * Verify mentee's average rating updates correctly
  * Verify bidirectional independence: mentor can't see mentee's review before submitting
* **Negative:** 12 test cases (similar to MYM-33, but from mentor perspective)
  * Submit review with rating=0, 6, null, wrong type
  * Submit review with comment >500 chars, XSS payload, SQL injection
  * Submit duplicate review for same session
  * Submit review for pending/cancelled session
  * Submit review before 1h has passed
  * Submit review for someone else's session (unauthorized)
  * Submit review without auth token or with expired token
* **Boundary:** 5 test cases (same as MYM-33)
  * Rating = 1, 5
  * Comment = 0 chars, 500 chars
  * Submit at exactly 60 min after session
* **Integration:** 3 test cases
  * Verify DB trigger updates `user_ratings` for mentee
  * Verify email notification sent to mentee (new review notification)
  * **CRITICAL:** Verify bidirectional review leakage prevention (mentee can't see mentor's review before submitting theirs)
* **API:** 1 test case
  * POST /api/reviews/student - validate request/response schemas per api-contracts.yaml

**Rationale for estimate:**
Medium complexity (lower than MYM-33) because:
- Reuses review submission infrastructure from MYM-33
- Similar validation logic
- Main new complexity: Bidirectional review leakage prevention (Critical Integration Test)

**Parametrized Tests Recommended:** Yes (same as MYM-33)
- Rating values, comment lengths, session states

---

### MYM-35: View Ratings and Reviews on Profiles

**Complexity:** MEDIUM (display and filtering logic, no submission complexity)
**Estimated Test Cases:** 24

* **Positive:** 8 test cases
  * Display mentor profile with average rating (e.g., "★★★★☆ 4.7 / 5.0")
  * Display rating breakdown histogram (distribution of 5-star, 4-star, etc.)
  * Display individual reviews (rating, comment, reviewer name, date) sorted by Most Recent
  * Sort reviews by Highest Rated - verify order changes correctly
  * Sort reviews by Lowest Rated - verify order changes correctly
  * Filter reviews by 5-star only - verify only 5-star reviews shown
  * Pagination: Navigate to page 2 - verify next 10 reviews load
  * Display empty state for profile with no reviews ("No reviews yet")
* **Negative:** 6 test cases
  * Request profile with invalid profileId (404)
  * Request reviews for non-existent user (404)
  * Request reviews page beyond last page (empty results, not error)
  * Request reviews with invalid sort param (400 or default to Most Recent)
  * Request reviews with invalid filter param (400 or ignore filter)
  * Verify hidden/flagged reviews are NOT displayed (moderation)
* **Boundary:** 3 test cases
  * Profile with 1 review (min) - verify single review displays correctly
  * Profile with 100 reviews - verify pagination works (10 per page = 10 pages)
  * Profile with 0 reviews - verify empty state displays
* **Integration:** 5 test cases
  * Verify reviews display updates immediately after new review submitted (cache invalidation)
  * Verify average rating matches calculated value from DB
  * Verify only public/non-hidden reviews are displayed
  * Verify reviews are sorted correctly (Most Recent = DESC created_at)
  * Verify pagination: page 1 shows reviews 1-10, page 2 shows reviews 11-20
* **API:** 2 test cases
  * GET /api/profiles/{profileId}/reviews - validate response schema per api-contracts.yaml
  * GET /api/profiles/{profileId}/reviews with query params (sort, filter, page, limit) - verify params work

**Rationale for estimate:**
Medium complexity due to:
- Display logic is simpler than submission logic (no eligibility checks, no DB writes)
- BUT multiple filtering/sorting options add test cases
- Integration with profile display (both mentor and mentee profiles)
- Cache invalidation must be tested

**Parametrized Tests Recommended:** Yes
- Sort options (recent, highest, lowest) can be parametrized
- Filter options (all, 5-star, 4-star+, 3-star+) can be parametrized
- Pagination (page 1, 2, N, N+1) can be parametrized

---

### Total Estimated Test Cases for Epic

**Total:** 87 test cases
**Breakdown:**

* **Positive:** 23 (26%)
* **Negative:** 33 (38%)
* **Boundary:** 13 (15%)
* **Integration:** 13 (15%)
* **API:** 5 (6%)

**Analysis:**
- High negative test case count (38%) reflects security focus (XSS, SQL injection, duplicate prevention, authorization)
- Integration test count (15%) is appropriate for epic with 6 integration points
- Positive test cases (26%) cover happy paths and valid variations
- Total of 87 is realistic for a CRITICAL priority epic with high complexity

**Parametrization Impact:**
- With parametrized tests, actual test implementations may be ~50-60 distinct test functions
- But total test executions = 87 (each parametrized test runs multiple times)

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

Based on user personas (Laura, Carlos, Sofía) and realistic review scenarios:

* **Mentee Reviews (Positive):**
  * Laura (Mentee) → Carlos (Mentor): 5 stars, "Excellent mentor! Carlos helped me debug a complex state management issue and explained React hooks clearly. Highly recommend!"
  * Sofía (Mentee) → Carlos (Mentor): 5 stars, "Very patient and knowledgeable. Carlos helped me understand Data Science concepts I was struggling with."
* **Mentee Reviews (Critical but Constructive):**
  * Laura → Mentor X: 3 stars, "Session was okay, but mentor seemed rushed. Got my question answered but would have liked more in-depth explanation."
* **Mentor Reviews (Positive):**
  * Carlos (Mentor) → Laura (Mentee): 5 stars, "Laura came well-prepared with specific questions. Great session!"
  * Carlos (Mentor) → Sofía (Mentee): 4 stars, "Sofía was engaged and asked good questions. Could benefit from more pre-session research."
* **Mentor Reviews (Low but Fair):**
  * Mentor Y → Mentee Z: 2 stars, "Mentee was 15 minutes late and didn't have clear questions. Wasted most of the session."

**Invalid Data Sets:**

* **Rating Violations:**
  * Rating = 0 (below min)
  * Rating = 6 (above max)
  * Rating = -1 (negative)
  * Rating = 3.5 (float, but should be integer)
  * Rating = "five" (wrong type)
  * Rating = null (missing required)
* **Comment Violations:**
  * Comment = 501+ characters (exceeds max 500)
  * Comment = `<script>alert('XSS')</script>` (XSS payload)
  * Comment = `'; DROP TABLE reviews; --` (SQL injection)
  * Comment = `<img src=x onerror=alert('XSS')>` (XSS via img tag)

**Boundary Data Sets:**

* **Rating Boundaries:**
  * Min valid: 1
  * Max valid: 5
  * Min invalid: 0
  * Max invalid: 6
* **Comment Length Boundaries:**
  * Min valid: 0 characters (empty comment, optional)
  * Max valid: 500 characters (exactly at limit)
  * Min invalid: 501 characters (just over limit)
  * Test string: "a" * 500 (exactly 500 chars)
  * Test string: "a" * 501 (exactly 501 chars, should fail)
* **Time Boundaries:**
  * Session ends at 3:00 PM
  * Test at 3:59 PM (59 min after, should fail)
  * Test at 4:00 PM (60 min after, should succeed)
  * Test at 4:01 PM (61 min after, should succeed)
* **Special Characters:**
  * Unicode characters: "¡Excelente sesión! 你好" (should be allowed)
  * Emoji: "Great mentor! 🔥🚀" (should be allowed)
  * Profanity: Use test list of common profanity (for future auto-moderation testing)

**Test Data Management:**

* ✅ Use **Faker.js** for generating realistic test data (user names, comments, dates)
* ✅ Create **data factories** for common entities:
  * `createTestBooking({ status: 'completed', session_date: Date })` - Factory for bookings
  * `createTestReview({ rating: 5, comment: 'Test' })` - Factory for reviews
  * `createTestUser({ role: 'mentor' })` - Factory for users
* ❌ **DO NOT hardcode** static test data in tests (makes tests brittle)
* ✅ **Clean up test data** after test execution:
  * Use database transactions in tests (rollback after each test)
  * Use test-specific database schema (isolated from staging data)
  * Delete test reviews/bookings in `afterEach()` hook
* ✅ **Seed baseline data** for E2E tests:
  * Pre-create 3 mentors with varying ratings (5.0, 4.2, 3.1)
  * Pre-create 10 reviews per mentor (for pagination testing)
  * Pre-create completed bookings for test users

---

### Test Environments

**Staging Environment:**

* **URL:** https://staging.upexmymentor.com (from api-contracts.yaml)
* **Database:** Staging PostgreSQL (Supabase staging project)
* **Email Service:** Use email testing service (Mailtrap, MailHog, or Resend test mode)
* **Video Service:** Daily.co test room URLs (no actual video calls needed)
* **External Services:** All external services in test/staging mode
* **Purpose:** Primary testing environment for all manual and automated tests
* **Data Policy:** Can create/modify/delete test data freely

**Local Development Environment:**

* **URL:** http://localhost:3000 (from api-contracts.yaml)
* **Database:** Local PostgreSQL via Supabase CLI or Docker
* **Email Service:** MailHog (local email testing)
* **Purpose:** Dev testing, fast feedback loop
* **Data Policy:** Ephemeral, reset frequently

**Production Environment:**

* **URL:** https://api.upexmymentor.com (from api-contracts.yaml)
* **Purpose:** **ONLY smoke tests post-deployment** (no comprehensive testing)
* **Restrictions:**
  * ❌ NO destructive tests (don't delete real reviews)
  * ❌ NO test data creation (don't pollute prod with fake reviews)
  * ✅ Read-only smoke tests: Check if reviews display on real mentor profiles
  * ✅ Monitoring: Verify rating calculation is working via monitoring dashboards

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

* [ ] **Story is fully implemented** and deployed to staging environment
* [ ] **Code review is approved** by 2+ reviewers (per dev process)
* [ ] **Unit tests exist and are passing** (>95% coverage for review logic per epic testing strategy)
* [ ] **Dev has done smoke testing** and confirms basic functionality works (can submit review, review appears on profile)
* [ ] **No blocker bugs exist** in dependent stories:
  * MYM-33/MYM-34 depend on booking system (EPIC-004) being stable in staging
  * MYM-35 depends on MYM-33/MYM-34 (can't display reviews if submission doesn't work)
* [ ] **Test data is prepared and available** in staging (test users, completed bookings)
* [ ] **API documentation is updated** (if any changes to api-contracts.yaml)
* [ ] **DB schema is deployed** to staging (reviews table, user_ratings table, triggers)

### Exit Criteria (Per Story)

Story is considered "Done" from QA perspective when:

* [ ] **All test cases are executed** (manual and automated)
* [ ] **Critical/High priority test cases: 100% passing**
  * **Critical tests** (0 failures allowed):
    * Review submission with valid data succeeds
    * Average rating updates correctly after new review
    * Duplicate review is prevented (unique constraint works)
    * Unauthorized user cannot review someone else's session
    * Reviews display on profile correctly
  * **High priority tests** (0 failures allowed):
    * XSS payloads are escaped/stripped
    * SQL injection attempts fail safely
    * Bidirectional review leakage is prevented
    * DB triggers fire reliably
    * Email reminders are sent
* [ ] **Medium/Low priority test cases: ≥95% passing**
  * **Medium tests** (up to 5% failures acceptable if documented):
    * Filtering and sorting work correctly
    * Pagination works correctly
    * Edge cases (0 reviews, 1000 reviews) handled
  * **Low priority tests** (up to 5% failures acceptable):
    * UI polish (star animations, loading states)
    * Non-critical error messages
* [ ] **All critical and high bugs are resolved and verified**
  * **Critical bug example:** User can submit duplicate reviews (breaks unique constraint)
  * **High bug example:** Average rating calculation is wrong (5 reviews [5,5,4,4,3] → avg 4.2, but shows 4.5)
* [ ] **Medium bugs have mitigation plan or are scheduled**
  * **Medium bug example:** Sorting by "Lowest Rated" doesn't work (workaround: manually view all reviews)
  * Must be documented in Jira, with plan to fix in next sprint or as tech debt
* [ ] **Regression testing passed** (if review changes affect other features)
  * Verify mentor profile display (EPIC-003) still works after adding reviews
  * Verify booking flow (EPIC-004) not broken by review eligibility checks
* [ ] **Non-functional requirements validated** (see NFR section below)
  * Performance: Rating aggregation query <150ms (per NFR-001)
  * Security: XSS/SQL injection prevented, authorization enforced
* [ ] **Test execution report is generated and shared** (with team and stakeholders)
  * Report includes: Test pass rate, bug summary, performance metrics, risk status
* [ ] **Known issues are documented in release notes** (if any medium/low bugs remain unfixed)

### Epic Exit Criteria

Epic is considered "Done" from QA perspective when:

* [ ] **ALL stories meet individual exit criteria** (MYM-33, MYM-34, MYM-35 all done)
* [ ] **Integration testing across all stories is complete**
  * Mentee submits review (MYM-33) → Review displays on mentor profile (MYM-35) → Integration works
  * Mentor submits review (MYM-34) → Review displays on mentee profile (MYM-35) → Integration works
  * Both parties submit reviews → Both reviews visible → Bidirectional independence verified
* [ ] **E2E testing of critical user journeys is complete and passing**
  * **Journey 1:** Bidirectional review flow (both parties submit, both reviews appear)
  * **Journey 2:** Profile browsing with reviews (search mentor, view reviews, filter/sort works)
* [ ] **Load testing is complete** (rating aggregation performance with 10,000+ reviews per epic testing strategy)
  * Rating calculation <150ms with 1000 reviews (per NFR-001)
  * Rating calculation <500ms with 10,000 reviews (scalability target)
* [ ] **Security testing is complete** (XSS, SQL injection, authorization, duplicate prevention)
  * OWASP ZAP scan shows no critical/high vulnerabilities
  * Manual penetration testing (if applicable)
* [ ] **API contract testing is complete** (all 6 endpoints validated against api-contracts.yaml)
* [ ] **Exploratory testing session completed** (findings documented)
  * 4-hour exploratory testing session by QA team
  * Document edge cases, UX issues, potential attack vectors
* [ ] **No critical or high bugs open** (all critical/high bugs fixed and verified)
* [ ] **QA sign-off document is created and approved**
  * Summary of testing performed, test results, known issues, go/no-go recommendation

---

## 📝 Non-Functional Requirements Validation

Based on .context/SRS/non-functional-specs.md, the following NFRs apply to this epic:

### Performance Requirements (NFR-001)

**NFR-P-001: API Response Time for Review Submission**

* **Target:** POST /api/reviews/mentor, POST /api/reviews/student < 500ms (p95 percentile)
* **Test Approach:**
  * Use Postman/Newman with performance monitoring
  * Submit 100 reviews sequentially, measure response time for each
  * Calculate p95 (95th percentile) - should be <500ms
* **Tools:** Postman Performance Testing, K6, Lighthouse (for frontend)
* **Pass Criteria:** p95 response time <500ms

**NFR-P-002: Rating Aggregation Query Performance**

* **Target:** GET /api/profiles/{id}/reviews (rating calculation) < 150ms (per NFR-001: "Database Query Time < 150ms for queries simples")
* **Test Approach:**
  * Create mentor profile with 100, 1,000, 10,000 reviews
  * Measure query time for `SELECT AVG(rating) FROM reviews WHERE reviewee_id = X`
  * Ensure DB indexes on `reviewee_id` exist
  * Test DB trigger execution time (should not block review submission)
* **Tools:** PostgreSQL EXPLAIN ANALYZE, Grafana/Datadog monitoring
* **Pass Criteria:**
  * 100 reviews: <50ms
  * 1,000 reviews: <100ms
  * 10,000 reviews: <150ms

**NFR-P-003: Profile Page Load Time with Reviews**

* **Target:** Profile page load (with reviews displayed) < 2.5s LCP (per NFR-001)
* **Test Approach:**
  * Use Lighthouse in Chrome DevTools
  * Test mentor profile with 100+ reviews
  * Simulate 3G connection (throttling)
  * Measure Largest Contentful Paint (LCP)
* **Tools:** Lighthouse, WebPageTest
* **Pass Criteria:** LCP < 2.5s on 3G connection

---

### Security Requirements (NFR-002)

**NFR-S-001: XSS Prevention in Review Comments**

* **Requirement:** All user input (comments) must be sanitized to prevent XSS attacks
* **Test Approach:**
  * Submit review with XSS payloads: `<script>alert('XSS')</script>`, `<img src=x onerror=alert('XSS')>`
  * View review on profile page, verify payload is escaped (displays as plain text, not executed)
  * Check Content Security Policy (CSP) headers are configured
* **Tools:** OWASP ZAP, manual testing, browser DevTools
* **Pass Criteria:** All XSS payloads are escaped, no scripts execute

**NFR-S-002: SQL Injection Prevention**

* **Requirement:** All database queries must use parameterized queries (ORM) to prevent SQL injection
* **Test Approach:**
  * Submit review with SQL injection payloads: `'; DROP TABLE reviews; --`, `' OR '1'='1`
  * Verify payload is treated as literal string, not executed
  * Verify error messages don't reveal DB structure
* **Tools:** OWASP ZAP, manual testing
* **Pass Criteria:** All SQL injection attempts fail safely, no DB data exposed

**NFR-S-003: Authorization Enforcement (RBAC + RLS)**

* **Requirement:** Users can only review sessions they participated in (enforced by RLS policies)
* **Test Approach:**
  * User A tries to submit review for User B's session (should fail with 403)
  * Admin tries to submit review (admins can't review, they can only moderate)
  * Unauthenticated user tries to submit review (should fail with 401)
  * Verify Supabase RLS policies: `reviews.reviewer_id = auth.uid()`
* **Tools:** Postman (with different auth tokens), manual testing
* **Pass Criteria:** Unauthorized access attempts return 401/403, no data leakage

**NFR-S-004: Duplicate Review Prevention**

* **Requirement:** Each user can only review each session once (DB unique constraint)
* **Test Approach:**
  * Submit review for session X → Success (201)
  * Submit second review for session X (same user) → Fail (400)
  * Verify DB constraint: `UNIQUE (booking_id, reviewer_id)`
  * Test concurrent submissions (race condition)
* **Tools:** Postman, DB inspection, K6 (for concurrency test)
* **Pass Criteria:** Second review attempt fails with error "Already reviewed this session"

**NFR-S-005: JWT Token Validation**

* **Requirement:** All review endpoints require valid JWT token (per NFR-002: "JWT tokens via Supabase Auth")
* **Test Approach:**
  * Submit review with no Authorization header → Expect 401
  * Submit review with expired token → Expect 401
  * Submit review with invalid token (tampered) → Expect 401
  * Submit review with valid token → Expect 201
* **Tools:** Postman, manual token generation/tampering
* **Pass Criteria:** Invalid/missing tokens return 401, valid token returns 201

---

### Reliability Requirements (NFR-007)

**NFR-R-001: DB Trigger Reliability**

* **Requirement:** Rating calculation trigger must fire consistently (>99% reliability per NFR-007: "<1% error rate")
* **Test Approach:**
  * Submit 100 reviews, verify `user_ratings` table updates 100 times
  * Monitor DB logs for trigger execution
  * Test trigger failure handling (what happens if trigger fails?)
* **Tools:** PostgreSQL logs, Grafana monitoring
* **Pass Criteria:** Trigger fires >99% of the time, failures are logged and alertable

**NFR-R-002: Email Delivery Reliability**

* **Requirement:** Review reminder emails must be delivered reliably (>95% delivery rate per NFR-007)
* **Test Approach:**
  * Complete 100 test sessions, verify 95+ reminder emails sent
  * Test email service downtime handling (retry logic)
  * Monitor email delivery metrics in Resend/SendGrid dashboard
* **Tools:** Email service dashboard, manual testing, monitoring
* **Pass Criteria:** >95% email delivery rate, failures trigger alerts

---

### Usability Requirements (NFR-004)

**NFR-U-001: Review Submission Form Usability**

* **Requirement:** Form must be accessible (WCAG 2.1 Level AA per NFR-004)
* **Test Approach:**
  * Test keyboard navigation (Tab, Enter to submit)
  * Test screen reader support (NVDA, JAWS)
  * Verify ARIA labels on form fields (rating stars, comment textarea)
  * Verify color contrast (4.5:1 minimum per NFR-004)
* **Tools:** axe DevTools, Lighthouse accessibility audit, manual screen reader testing
* **Pass Criteria:** No critical accessibility issues, passes Lighthouse audit with >90 score

**NFR-U-002: Review Display Readability**

* **Requirement:** Reviews must be readable and well-formatted
* **Test Approach:**
  * Test on mobile (320px width) and desktop (1920px width)
  * Verify line length <80 chars (readability guideline)
  * Verify font size ≥16px for comment text
  * Test dark mode support (if applicable)
* **Tools:** Browser DevTools, responsive design testing
* **Pass Criteria:** Reviews are readable on all screen sizes

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

This epic integrates with existing features, so changes may affect:

* [ ] **EPIC-003 (Mentor Discovery & Search):** Mentor profiles now display average rating and reviews
  * **Test:** Search for mentors → View profile → Verify reviews display correctly
  * **Test:** Verify search results show average rating (e.g., "★★★★☆ 4.7")
* [ ] **EPIC-004 (Scheduling & Booking):** Review eligibility depends on booking status
  * **Test:** Complete booking flow → Session completes → Review eligibility check works
  * **Test:** Cancel booking → Verify cannot review cancelled session
* [ ] **EPIC-006 (Session Management):** Session completion triggers review reminder
  * **Test:** Complete session → Verify session status updates → Review prompt appears
* [ ] **User Profiles (EPIC-001):** Reviews appear on both mentor and mentee profiles
  * **Test:** Update user profile → Verify reviews are not lost or broken
* [ ] **API Contracts:** New review endpoints must not break existing API clients
  * **Test:** Run full API contract test suite (all endpoints in api-contracts.yaml)

**Regression Test Execution:**

* **Before Starting Epic Testing:** Run automated regression suite to establish baseline
  * Verify all existing features work before review system is added
* **After Each Story Completes:** Run regression tests for affected areas
  * After MYM-33/MYM-34: Test booking flow still works
  * After MYM-35: Test profile display still works
* **After Epic Completes:** Run full regression suite
  * All existing E2E tests must pass
  * Focus on integration points (profiles, bookings, sessions)
* **Tools:** Playwright E2E test suite, Postman API test collection

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** 2 sprints (4 weeks)

**Breakdown:**

* **Week 1 (Sprint 1):**
  * **Test case design:** 3 days (create detailed test cases for all 3 stories)
  * **Test data preparation:** 1 day (create test users, bookings, seed data)
  * **Test environment setup:** 1 day (configure staging, email testing, monitoring)
* **Week 2 (Sprint 1):**
  * **Test execution (MYM-33 - Mentee reviews):** 5 days
    * Manual testing: 2 days
    * Automated test creation (E2E, API): 2 days
    * Bug fixing support: 1 day
* **Week 3 (Sprint 2):**
  * **Test execution (MYM-34 - Mentor reviews):** 3 days
    * Manual testing: 1 day
    * Automated test creation: 1 day
    * Bug fixing support: 1 day
  * **Test execution (MYM-35 - Display reviews):** 2 days
    * Manual testing: 1 day
    * Automated test creation: 1 day
* **Week 4 (Sprint 2):**
  * **Integration testing:** 2 days (cross-story flows, E2E journeys)
  * **Load testing (rating aggregation):** 1 day (K6 tests with 10K reviews)
  * **Security testing:** 1 day (XSS, SQL injection, authorization)
  * **Regression testing:** 1 day (verify no existing features broken)
  * **Exploratory testing:** 1 day (4-hour session)
  * **Bug fixing cycles:** Built into daily schedule (20% buffer)

**Dependencies:**

* **Depends on:**
  * EPIC-004 (Scheduling & Booking) must be complete and stable in staging (review eligibility depends on completed bookings)
  * EPIC-006 (Session Management) must be complete (session completion triggers review reminder)
* **Blocks:**
  * None (this is a terminal epic in the user journey, doesn't block other features)

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

* **E2E Testing:** Playwright (per tech stack)
* **API Testing:** Postman/Newman or Playwright API Testing
* **Unit Testing:** Vitest (frontend), Jest (backend) - Dev responsibility, QA reviews coverage
* **Load Testing:** K6 (rating aggregation performance testing)
* **Performance Testing:** Lighthouse (page load), WebPageTest (network simulation)
* **Security Testing:** OWASP ZAP (automated vulnerability scanning)
* **Email Testing:** Mailtrap or MailHog (local email testing in staging)
* **Test Data:** Faker.js (generate realistic test data)
* **Monitoring:** Grafana/Datadog (DB query performance, email delivery rate)

**CI/CD Integration:**

* [ ] **Tests run automatically on PR creation** (GitHub Actions per tech stack)
  * Unit tests (Vitest/Jest) run on every PR
  * Linting (ESLint) and type checking (TypeScript) run on every PR
* [ ] **Tests run on merge to main branch**
  * Full E2E test suite runs on merge (Playwright)
  * API contract tests run on merge (Postman/Newman)
* [ ] **Tests run on deployment to staging**
  * Smoke tests run after staging deployment
  * Integration tests run to verify review flow works end-to-end
* [ ] **Smoke tests run on deployment to production**
  * Read-only tests only (verify reviews display, no writes)
  * Monitoring alerts triggered if smoke tests fail

**Test Management:**

* **Jira:** Test cases linked to stories (MYM-33, MYM-34, MYM-35)
  * Use Jira Xray if available (test case management)
* **Test Execution Reports:** Generate reports in Jira Xray or standalone HTML reports
* **Bug Tracking:** All bugs tracked in Jira, linked to stories
* **Test Coverage:** Track in code coverage tools (Vitest coverage, Jest coverage)

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

* **Test cases executed vs. total:** 87/87 (100% target)
* **Test pass rate:** Critical/High: 100%, Medium/Low: ≥95%
* **Bug detection rate:** Bugs found per test case executed
* **Bug fix rate:** Bugs fixed per day
* **Test coverage (code):** >95% for review logic (unit tests per epic testing strategy)
* **Time to test (per story):** Track days to complete testing per story

**Reporting Cadence:**

* **Daily:** Test execution status (in standup or Slack)
  * "MYM-33: 25/35 test cases executed, 2 bugs found (1 high, 1 medium)"
* **Per Story:** Test completion report (when story exits testing)
  * Summary: Test cases executed, pass rate, bugs found, bugs fixed, blockers
* **Per Epic:** Comprehensive QA sign-off report
  * Executive summary: Go/No-Go recommendation
  * Test results: Pass rates, coverage, performance metrics
  * Risk status: All risks mitigated or accepted
  * Known issues: Documented bugs that remain unfixed
  * Appendix: Detailed test results, bug list

---

## 🎓 Notes & Assumptions

**Assumptions:**

* Booking system (EPIC-004) is stable and completed sessions can be reliably identified
* Session Management (EPIC-006) correctly marks sessions as completed
* Email service (Resend/SendGrid) is configured and working in staging
* Mentor profiles (EPIC-003) are accessible and can be extended to show reviews
* User authentication (EPIC-001) is stable and JWT tokens work correctly
* DB triggers are supported in Supabase PostgreSQL (assumption: yes)

**Constraints:**

* Testing timeline constrained by booking system dependency (can't test reviews without completed bookings)
* Load testing limited to 10,000 reviews (not million-scale testing)
* Manual admin moderation (no AI spam detection in MVP)
* Email testing limited to staging environment (no production email testing)

**Known Limitations:**

* Cannot test actual email delivery to real inboxes (use email testing service in staging)
* Cannot fully test review bombing scenarios (requires multiple fake accounts and coordinated attack)
* Bidirectional review leakage testing requires careful test design (simulate concurrent users)
* Rating calculation race conditions require load testing tool (K6) - may not catch all edge cases

**Exploratory Testing Sessions:**

* Recommended: 2 exploratory testing sessions
  * **Session 1 (BEFORE implementation):** Test with mockups/wireframes to identify UX issues early
  * **Session 2 (AFTER implementation):** Test edge cases not covered in scripted tests (review bombing, bidirectional leakage attempts, unusual review patterns)

---

## 📎 Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/epic.md`
* **Stories:**
  * `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/MYM-33/story.md` (if exists)
  * `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/MYM-34/story.md` (if exists)
  * `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/MYM-35/story.md` (if exists)
* **Business Model:** `.context/idea/business-model.md`
* **PRD:** `.context/PRD/` (executive-summary.md, user-personas.md, user-journeys.md)
* **SRS:** `.context/SRS/` (functional-specs.md, non-functional-specs.md, architecture-specs.md)
* **Architecture:** `.context/SRS/architecture-specs.md`
* **API Contracts:** `.context/SRS/api-contracts.yaml`
* **Jira Epic:** https://upexgalaxy61.atlassian.net/browse/MYM-32

---

**Formato:** Markdown estructurado siguiendo flujo **JIRA-FIRST → LOCAL MIRROR**

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

_This test plan was generated using Shift-Left Testing methodology to identify risks, ambiguities, and improvements BEFORE implementation begins._
