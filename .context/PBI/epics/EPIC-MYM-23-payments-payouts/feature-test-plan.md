# Feature Test Plan: EPIC-MYM-23 - Payments & Payouts

**Fecha:** 2025-11-11
**QA Lead:** AI-Generated (Shift-Left Analysis)
**Epic Jira Key:** MYM-23
**Status:** Draft - Pending Team Review

---

## 📋 Business Context Analysis

### Business Value

This epic represents the **revenue engine** of the Upex My Mentor platform. Without secure payment processing and reliable payout distribution, the platform cannot monetize, mentors cannot earn, and the entire business model collapses.

**Key Value Proposition:**

- **For Mentees:** Secure, PCI-compliant payment processing builds trust and enables seamless transaction completion. Students can pay confidently knowing their financial data is protected by Stripe.
- **For Mentors:** Automated payout system (24h after session completion) ensures timely compensation without administrative overhead. Transparent earnings tracking builds confidence in platform monetization.
- **For Platform:** Enables commission-based revenue model (20% per transaction), activates GMV generation, and creates sustainable business operations. This is the bridge between user engagement and financial sustainability.

**Success Metrics (KPIs):**

From Executive Summary, this epic directly enables:
- **$5,000 GMV in first month post-launch** - Payment processing is the gateway to revenue
- **$1,000 net revenue (20% commission)** - Platform fee collection mechanism
- **100 sessions in first month** - Each requires successful payment processing
- **>99% payment success rate** (excluding card declines) - System reliability
- **<1% payment dispute rate** - Trust and fraud prevention
- **>95% payout delivery success rate** - Mentor satisfaction

**User Impact:**

- **Laura (Junior Developer / Mentee):** Needs a secure, transparent payment experience to overcome security concerns. Clear pricing display and Stripe-powered checkout build confidence. Payment failures or confusing pricing would cause booking abandonment (Business Risk 2).
- **Carlos (Senior Architect / Mentor):** Requires reliable, predictable payouts to justify time investment. 24-hour payout hold is acceptable if transparent. Missing or delayed payouts would cause mentor churn and platform abandonment (Business Risk 2).
- **Platform Credibility:** Payment issues (failed transactions, delayed payouts, incorrect commissions) would destroy user trust and generate negative reviews, blocking marketplace growth.

**Critical User Journeys:**

From user-journeys.md:

1. **Payment Journey (Laura's Steps 6-7):**
   - Laura confirms booking → Redirected to Stripe Checkout → Enters card details → Payment processed → Receives confirmation email with receipt
   - **Pain Points:** Payment security concerns, unclear pricing, payment failures, missing receipt

2. **Payout Journey (Carlos's implied flow):**
   - Carlos completes session → 24h grace period → Automatic payout processed → Receives payout notification → Funds arrive in bank account
   - **Pain Points:** Slow verification, unclear payout timeline, missing payout notifications, incorrect commission deduction

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- **Payment UI Components:**
  - Checkout page: Session summary, pricing breakdown (subtotal, platform fee, total)
  - Stripe Checkout redirect (hosted by Stripe, not custom form)
  - Payment success/failure pages
  - Transaction history list (paginated table)
- **Mentor Earnings Components:**
  - Earnings dashboard (available balance, lifetime earnings, payout schedule)
  - Stripe Connect onboarding flow (embedded iframe or redirect)
  - Payout history list
  - Transaction details modal
- **Pages/Routes:**
  - `/checkout/[bookingId]` - Payment checkout page
  - `/checkout/success` - Payment confirmation
  - `/checkout/cancel` - Payment cancelled/failed
  - `/dashboard/earnings` - Mentor earnings dashboard (mentor-only)
  - `/dashboard/transactions` - Transaction history (all users)
  - `/onboarding/stripe-connect` - Stripe Connect setup (mentor-only)

**Backend:**

- **API Endpoints** (from api-contracts.yaml and epic.md):
  - `POST /api/checkout/session` - Create Stripe Checkout Session (FR-016)
  - `POST /api/stripe/connect/onboard` - Initiate mentor Stripe Connect onboarding
  - `GET /api/stripe/connect/status` - Check mentor Stripe Connect status
  - `POST /api/webhooks/stripe` - Handle Stripe webhook events (payment, transfer, account updates)
  - `GET /api/transactions` - List user's transaction history (FR-018)
  - `GET /api/payouts` - List mentor's payout history (mentors only)
  - `POST /api/refunds` - Process refund for cancelled booking (admin-only, linked to EPIC-006)
- **Services:**
  - Stripe Checkout service (session creation, success/failure handling)
  - Stripe Connect service (mentor onboarding, account verification)
  - Payment processing service (webhook handling, idempotency)
  - Payout service (automated payout calculation and scheduling)
  - Commission calculation service (20% fee calculation)
  - Transaction reconciliation service (match Stripe events with bookings)
- **Scheduled Jobs:**
  - **Payout Processor:** Runs every hour
    - Finds sessions with status='completed' AND completed_at < NOW() - 24 hours AND no payout record
    - Creates Stripe Transfer to mentor's Connect account
    - Records payout in database
  - **Webhook Retry Handler:** Runs every 15 minutes
    - Retries failed webhook processing (max 3 attempts)
  - **Reconciliation Job:** Runs daily at midnight
    - Checks for paid-but-not-confirmed bookings (data integrity)
    - Alerts admin for manual review

**Database:**

Tables from epic.md:

- **`stripe_accounts`** (mentor Stripe Connect accounts):
  - Columns: id, mentor_id (UNIQUE FK), stripe_account_id, onboarding_complete, charges_enabled, payouts_enabled, created_at, updated_at
  - Indexes: (mentor_id), (stripe_account_id)
  - **UNIQUE CONSTRAINT:** mentor_id (one Connect account per mentor)

- **`transactions`** (payment records):
  - Columns: id, booking_id (UNIQUE FK), stripe_payment_intent_id, mentee_id, mentor_id, gross_amount, platform_fee, net_amount, status (enum: pending, succeeded, failed, refunded), payment_method, paid_at, created_at, updated_at
  - **UNIQUE CONSTRAINT:** booking_id (one transaction per booking)
  - Indexes: (mentee_id, status), (mentor_id, status), (stripe_payment_intent_id), (status, paid_at)

- **`payouts`** (mentor payout records):
  - Columns: id, mentor_id (FK), stripe_payout_id, amount, currency (default 'usd'), status (enum: pending, in_transit, paid, failed), scheduled_for, processed_at, created_at, updated_at
  - Indexes: (mentor_id, status), (stripe_payout_id), (scheduled_for, status)

- **`payout_items`** (many-to-many join: payouts ↔ transactions):
  - Columns: id, payout_id (FK), transaction_id (FK)
  - Indexes: (payout_id), (transaction_id)

**Critical Queries:**

- Get available balance for mentor: SUM(transactions.net_amount) WHERE mentor_id=X AND paid_at IS NOT NULL - SUM(payout_items.amount via payouts) WHERE status='paid'
- Find sessions eligible for payout: SELECT bookings WHERE status='completed' AND completed_at < NOW() - INTERVAL '24 hours' AND booking_id NOT IN (SELECT booking_id FROM transactions JOIN payout_items)
- Get transaction history: SELECT transactions WHERE mentee_id=X OR mentor_id=X ORDER BY created_at DESC LIMIT/OFFSET

**External Services:**

- **Stripe API:**
  - **Stripe Checkout:** Hosted payment page (no card data handled by platform)
  - **Stripe Connect Express:** Mentor onboarding and payout management
  - **Stripe Webhooks:** Asynchronous event notifications
  - **API Version:** 2024-10-28.acacia or newer (per epic.md)
- **Email Service** (Supabase Email or Resend):
  - Payment confirmation emails (with receipt)
  - Payout notification emails
  - Failed payment alerts

### Integration Points (Critical for Testing)

**Internal Integration Points:**

1. **Frontend ↔ Backend API**
   - Checkout session creation (POST /api/checkout/session)
   - Stripe Connect onboarding flow (POST /api/stripe/connect/onboard)
   - Transaction history fetching (GET /api/transactions)
   - Payout history fetching (GET /api/payouts)

2. **Backend ↔ Supabase Database**
   - Transaction CRUD (with UNIQUE constraint on booking_id)
   - Payout record creation (scheduled job)
   - Stripe account status updates (webhook)

3. **Backend ↔ Supabase Auth**
   - JWT validation for payment endpoints
   - Role-based access (only mentors can access Connect onboarding, payout history)
   - RLS enforcement (users only see their own transactions)

4. **Booking Flow (EPIC-004) → Payment Flow**
   - Draft booking created with booking_id
   - Checkout session references booking_id
   - Payment success updates booking.status to 'confirmed'
   - Payment failure keeps booking in 'draft' (expires after 15min)

5. **Payment Flow → Session Management (EPIC-006)**
   - Session completion triggers payout eligibility
   - Cancellation triggers refund flow

**External Integration Points:**

1. **Backend ↔ Stripe Checkout**
   - Create Checkout Session with booking metadata
   - Redirect user to Stripe-hosted payment page
   - Handle success/cancel redirects

2. **Backend ↔ Stripe Connect**
   - Create Express Connect account for mentor
   - Generate onboarding link (AccountLink)
   - Verify account status (charges_enabled, payouts_enabled)
   - Create Transfer to mentor account (payout)

3. **Backend ↔ Stripe Webhooks**
   - `checkout.session.completed` - Payment succeeded
   - `payment_intent.succeeded` - Alternative payment confirmation
   - `payment_intent.payment_failed` - Payment failed
   - `account.updated` - Mentor Connect account status changed
   - `transfer.created` - Payout initiated
   - `transfer.paid` - Payout completed
   - `transfer.failed` - Payout failed
   - **Security:** Verify webhook signature using Stripe signing secret
   - **Idempotency:** Use stripe_payment_intent_id as deduplication key

4. **Backend ↔ Email Service**
   - Payment confirmation email (with receipt attachment)
   - Payout notification email
   - Failed payment notification

**Data Flow (Payment Creation):**

```
Mentee (Browser)
  → Confirms booking (from EPIC-004)
  → POST /api/checkout/session {booking_id}
    → Backend validates booking exists and is status='draft'
    → Backend fetches mentor hourly_rate from booking
    → Backend creates Stripe Checkout Session:
       - line_items: [{ price_data: { amount: hourly_rate * 100, currency: 'usd' }, quantity: 1 }]
       - metadata: { booking_id, mentor_id, mentee_id }
       - success_url: /checkout/success?session_id={CHECKOUT_SESSION_ID}
       - cancel_url: /checkout/cancel?booking_id={booking_id}
    → Backend returns {checkout_url}
  → Frontend redirects to Stripe Checkout
  → Mentee enters card details (on Stripe)
  → Stripe processes payment
  → Stripe fires webhook: checkout.session.completed
    → Backend verifies webhook signature
    → Backend checks idempotency (stripe_payment_intent_id not in transactions)
    → Backend creates transaction record with status='succeeded'
    → Backend updates booking.status to 'confirmed'
    → Backend sends confirmation email
  → Stripe redirects to success_url
  → Frontend shows success page
```

**Data Flow (Payout Processing):**

```
Scheduled Job (Payout Processor, runs every hour)
  → Query: SELECT * FROM bookings WHERE status='completed' AND completed_at < NOW() - INTERVAL '24 hours' AND booking_id NOT IN (SELECT booking_id FROM transactions JOIN payout_items)
  → For each eligible booking:
    → Fetch transaction.net_amount (gross_amount - platform_fee)
    → Fetch mentor stripe_account_id from stripe_accounts
    → Verify mentor account has payouts_enabled=true
    → Create Stripe Transfer:
       - amount: net_amount * 100
       - currency: 'usd'
       - destination: mentor stripe_account_id
       - metadata: { booking_id, mentor_id }
    → Create payout record with status='pending', stripe_payout_id
    → Create payout_item linking payout to transaction
  → Stripe fires webhook: transfer.paid
    → Backend updates payout.status to 'paid', payout.processed_at = NOW()
    → Backend sends payout notification email to mentor
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Payment Fraud (Stolen Cards, Chargeback Abuse)

- **Impact:** **CRITICAL** - Financial loss, Stripe account suspension, platform reputation damage, potential legal issues
- **Likelihood:** **MEDIUM** - Payment fraud is common, but Stripe Radar provides fraud detection
- **Area Affected:** Payment processing, Stripe integration, transaction records
- **Mitigation Strategy:**
  - Use Stripe Radar for automated fraud detection (enabled by default)
  - Require CVV for all transactions (Stripe Checkout enforces this)
  - Implement 3D Secure (SCA) for high-risk transactions (Stripe handles automatically in EU)
  - Monitor chargeback rate (target: <0.65% per Stripe guidelines)
  - Clear refund policy (24h cancellation per EPIC-006)
  - Session recordings as proof of service delivery (EPIC-006)
  - Block users with multiple failed payment attempts (rate limiting)
- **Test Coverage Required:**
  - Positive: Successful payment with valid test card (4242 4242 4242 4242)
  - Negative: Declined payment (4000 0000 0000 9995 - card declined by Stripe)
  - Security: Multiple failed payment attempts → rate limiting triggered
  - Integration: Stripe Radar flags suspicious payment → manual review required
  - Compliance: 3D Secure flow triggered for high-risk payment (test with 4000 0027 6000 3184)

#### Risk 2: Webhook Failures Cause Missed Payouts or Unconfirmed Bookings

- **Impact:** **HIGH** - Mentees pay but booking not confirmed (refund required), mentors complete session but no payout (trust destroyed)
- **Likelihood:** **MEDIUM** - Webhooks can fail due to network issues, server downtime, or incorrect configuration
- **Area Affected:** Backend webhook handler, booking status updates, payout processing
- **Mitigation Strategy:**
  - Implement webhook signature verification (mandatory - prevent spoofing)
  - Use idempotency keys (stripe_payment_intent_id) to prevent duplicate processing
  - Implement retry logic with exponential backoff (3 attempts: 1min, 5min, 15min)
  - Log ALL webhook events (success, failure, retry) in database (webhook_logs table - suggested improvement)
  - Daily reconciliation job: Check for paid-but-not-confirmed bookings (Stripe API query vs database)
  - Manual payout reconciliation dashboard for admin (if payout status mismatch)
  - Monitor webhook delivery rate in Stripe Dashboard (target: >99% success)
- **Test Coverage Required:**
  - Positive: Webhook delivered successfully → booking confirmed, transaction created
  - Negative: Webhook delivery fails → retry logic triggers, eventually succeeds
  - Negative: Webhook signature invalid → request rejected (401 Unauthorized)
  - Negative: Duplicate webhook (same payment_intent_id) → idempotency prevents double-processing
  - Integration: Webhook arrives 20 minutes after payment → still processed correctly
  - Edge case: Booking expires between payment success and webhook delivery → graceful handling

#### Risk 3: Stripe Account Suspension (Platform or Mentor)

- **Impact:** **CRITICAL** - Platform cannot process payments (all revenue stops), mentor cannot receive payouts (platform liability)
- **Likelihood:** **LOW** - Unlikely if following Stripe ToS, but possible due to disputes, fraud, or policy violations
- **Area Affected:** All payment processing, payout distribution, platform operations
- **Mitigation Strategy:**
  - Comply with Stripe Terms of Service (no prohibited activities: gambling, adult content, MLM)
  - Maintain low dispute rate (<0.65%) and chargeback rate (<0.75%)
  - Monitor Stripe account health dashboard (disputes, risk score, compliance)
  - Respond to disputes within 7 days (automated dispute notification system)
  - Provide clear service description in Stripe Dashboard ("Mentorship sessions")
  - For mentor accounts: Verify identity via Stripe Connect Express (automatic KYC)
  - Backup payment processor considered (Paddle, PayPal) but out of scope for MVP
- **Test Coverage Required:**
  - Manual: Review Stripe Dashboard for compliance alerts
  - Manual: Verify mentor verification flow collects required info (identity, bank details)
  - Negative: Mentor without complete Stripe Connect onboarding → cannot receive payouts (blocked with clear error)
  - Monitoring: Alert if dispute rate >0.5% (early warning)

#### Risk 4: Platform Fee Calculation Errors (20% Commission Incorrect)

- **Impact:** **HIGH** - Revenue loss (if too low), mentor dissatisfaction (if too high), accounting errors
- **Likelihood:** **LOW** - Simple calculation, but edge cases exist (rounding, currency, refunds)
- **Area Affected:** Transaction creation, payout calculation, revenue reporting
- **Mitigation Strategy:**
  - Store hourly_rate snapshot in booking at booking time (prevents rate changes affecting past bookings)
  - Calculate platform_fee = gross_amount * 0.20 (server-side only, never trust frontend)
  - Calculate net_amount = gross_amount - platform_fee
  - Unit tests with multiple hourly_rate values (edge cases: $49.99, $0.01, $9999.99)
  - Automated reconciliation: Daily job compares SUM(platform_fee) vs expected 20% of GMV
  - Admin dashboard shows commission breakdown per transaction (manual audit capability)
  - Round to 2 decimal places (currency standard: $0.01 precision)
- **Test Coverage Required:**
  - Unit tests: Commission calculation (parametrized with 10+ hourly_rate values)
  - Boundary: hourly_rate = $0.01 → platform_fee = $0.00, net_amount = $0.01
  - Boundary: hourly_rate = $9999.99 → platform_fee = $2000.00, net_amount = $7999.99
  - Boundary: hourly_rate = $49.99 → platform_fee = $10.00, net_amount = $39.99 (rounding check)
  - Integration: End-to-end payment → verify transaction record has correct gross, fee, net
  - Regression: Mentor changes hourly_rate → existing bookings use old rate (snapshot)

#### Risk 5: Mentor Bank Account Issues Delay Payouts

- **Impact:** **MEDIUM** - Payout fails, mentor frustrated, platform support burden, trust damage
- **Likelihood:** **MEDIUM** - Bank account errors (invalid, closed, wrong currency) are common
- **Area Affected:** Stripe Connect onboarding, payout processing
- **Mitigation Strategy:**
  - Use Stripe Connect Express (Stripe handles bank verification, not platform)
  - Collect bank details via Stripe-hosted onboarding (PCI-compliant, platform never sees bank info)
  - Verify mentor account has payouts_enabled=true before attempting payout
  - Handle Stripe payout failure gracefully (transfer.failed webhook)
  - Email mentor if payout fails with actionable steps: "Update bank account in Stripe Dashboard"
  - Retry failed payout after mentor updates bank info (manual or automatic)
  - Clear documentation: "How to connect your bank account" in Help Center
- **Test Coverage Required:**
  - Positive: Mentor completes Stripe Connect onboarding → payouts_enabled=true
  - Positive: Payout created successfully → transfer.paid webhook → mentor notified
  - Negative: Payout to account with payouts_enabled=false → blocked with error
  - Negative: Stripe payout fails (transfer.failed webhook) → mentor notified, admin alerted
  - Integration: Mentor updates bank account → payout retried successfully
  - Edge case: Mentor with incomplete onboarding (onboarding_complete=false) → cannot receive payouts

#### Risk 6: Race Condition in Payout Scheduling (Duplicate Payouts)

- **Impact:** **HIGH** - Mentor paid twice (financial loss), accounting errors, reconciliation nightmare
- **Likelihood:** **LOW** - Unlikely if idempotency implemented correctly, but possible under concurrent job execution
- **Area Affected:** Scheduled job (payout processor), database transactions
- **Mitigation Strategy:**
  - Database UNIQUE constraint on payout_items.transaction_id (one payout per transaction)
  - Pessimistic locking: SELECT FOR UPDATE when checking payout eligibility
  - Idempotent payout creation: Check if payout_item exists for transaction_id before creating
  - Scheduled job uses distributed lock (if multiple instances) to prevent concurrent runs
  - Reconciliation job detects duplicate payouts (SUM(payout_items) > transaction.net_amount)
- **Test Coverage Required:**
  - Concurrency: Simulate 2 payout jobs running simultaneously → verify only 1 payout created
  - Database: Attempt INSERT payout_item with duplicate transaction_id → UNIQUE constraint violation
  - Integration: Scheduled job runs twice within 1 hour → 2nd run finds no eligible sessions (already processed)

#### Risk 7: Currency Mismatch or Multi-Currency Issues

- **Impact:** **MEDIUM** - Incorrect payout amounts, user confusion, accounting errors
- **Likelihood:** **LOW** (MVP is USD-only per scope), **HIGH** (future if multi-currency added)
- **Area Affected:** Transaction creation, payout calculation, Stripe API calls
- **Mitigation Strategy:**
  - MVP: Hardcode currency='usd' for all transactions and payouts (per epic scope)
  - Validate currency in API requests (reject if not 'usd')
  - Store currency in transactions and payouts tables (future-proofing)
  - If multi-currency added (out of scope): Use Stripe's multi-currency support, conversion rates
- **Test Coverage Required:**
  - Positive: All transactions and payouts created with currency='usd'
  - Negative: Attempt to create transaction with currency='eur' → rejected (400 Bad Request)
  - Edge case: Mentor in non-USD country → Stripe handles currency conversion automatically (out of scope for MVP)

---

### Business Risks

#### Risk 1: Impact on GMV Target ($5,000 in First Month)

- **Impact on Business:** **CRITICAL** - Payment failures directly block GMV generation. If payment success rate <99%, GMV target is missed.
- **Impact on Users:** Mentees abandon bookings due to payment failures; mentors see "interest" but no revenue
- **Likelihood:** **MEDIUM** - Payment systems are complex; downtime, bugs, or UX friction can reduce conversion
- **Mitigation Strategy:**
  - Use Stripe (99.99% uptime SLA) for high reliability
  - Clear error messages for payment failures: "Payment declined. Please try another card."
  - Offer alternative payment retry (don't force new booking)
  - Monitor payment success rate daily (target: >99%)
  - A/B test checkout UX (Stripe Checkout vs custom form - MVP uses Stripe Checkout per epic)
  - Email follow-up for abandoned payments: "Complete your booking with Carlos"
- **Acceptance Criteria Validation:**
  - **Existing AC:** "Payment processing completes in <5 seconds" ✓ Addresses UX friction
  - **Existing AC:** "Failed payments show clear error messages and allow retry" ✓ Good
  - **Suggested AC:** "Payment success rate >99% (excluding card declines)" - ADD to epic metrics

#### Risk 2: Mentor Churn Due to Payout Issues (Delayed, Missing, Incorrect)

- **Impact on Business:** **CRITICAL** - Mentors are supply side; losing mentors kills marketplace. Payout issues → negative reviews → mentor exodus
- **Impact on Users:** Carlos completes session but doesn't get paid → leaves platform, warns others on LinkedIn/Twitter
- **Likelihood:** **MEDIUM** - Payout systems are complex; bugs in scheduling, calculation, or bank transfers can cause issues
- **Mitigation Strategy:**
  - Clear payout timeline communication: "You'll receive payment 24-48 hours after session completion"
  - Transparent earnings dashboard: Show available balance, pending payouts, payout history
  - Email notification when payout is sent AND when it arrives in bank (transfer.paid webhook)
  - Fast support response for payout issues (<24h resolution time)
  - Monthly payout summaries (automated report)
  - Automated reconciliation to catch errors early
- **Acceptance Criteria Validation:**
  - **Existing AC:** "Payouts are calculated correctly (booking amount - 20%)" ✓ Good
  - **Existing AC:** "Payouts are automatically processed 24 hours after session completion" ✓ Clear timeline
  - **Suggested AC:** ">95% payout delivery success rate" - ADD to epic metrics
  - **Suggested AC:** "Mentors receive payout notification email within 1 hour of transfer.paid event" - ADD to MYM-27

#### Risk 3: Chargebacks Reduce Net Revenue

- **Impact on Business:** **MEDIUM** - Chargebacks = refund + $15 Stripe fee. High chargeback rate (>0.75%) → Stripe account suspension
- **Impact on Users:** Mentees abuse chargebacks to get free sessions; mentors lose earnings
- **Likelihood:** **LOW** - Most users are legitimate, but fraud exists
- **Mitigation Strategy:**
  - Clear refund policy (24h cancellation window per EPIC-006)
  - Session recordings as proof of delivery (EPIC-006)
  - Respond to chargebacks within 7 days with evidence (automated notification)
  - Monitor chargeback rate (target: <0.65%)
  - Block users with chargeback history from future bookings
  - Use Stripe Radar to flag high-risk transactions
- **Acceptance Criteria Validation:**
  - **Existing AC:** "<1% payment dispute rate" ✓ Good metric
  - **Suggested AC:** "Chargeback rate <0.65%" - ADD to epic metrics (stricter than dispute rate)

#### Risk 4: Payment Processing Fees Eat Into Net Revenue

- **Impact on Business:** **MEDIUM** - Stripe fees (~2.9% + $0.30 per transaction) reduce net revenue from 20% commission to ~17%
- **Impact on Users:** None (fees are absorbed by platform)
- **Likelihood:** **CERTAIN** - Stripe fees are unavoidable
- **Mitigation Strategy:**
  - Calculate net revenue accounting for Stripe fees: Net = (GMV * 0.20) - (GMV * 0.029 + $0.30)
  - Optimize transaction size (larger transactions = lower % fee impact)
  - Consider volume discounts with Stripe (if GMV exceeds $1M/year)
  - Accept Stripe fees as cost of doing business (PCI compliance, fraud prevention, reliability)
- **Acceptance Criteria Validation:**
  - **Existing:** Epic mentions "Stripe transaction fees (~2.9% + $0.30)" in business value section ✓ Acknowledged
  - **Note:** This is NOT a QA risk - it's a known business cost

---

### Integration Risks

#### Integration Risk 1: Booking Flow → Payment Flow - Status Transition Failures

- **Integration Point:** Booking (EPIC-004) ↔ Payment (EPIC-005)
- **What Could Go Wrong:**
  - Payment succeeds but booking.status not updated to 'confirmed' → Mentee paid but no session
  - Booking expires during payment → Payment succeeds but booking is deleted → Refund required
  - Payment webhook arrives late (>15min after checkout) → Booking expired, webhook updates non-existent record
  - Webhook handler fails (500 error) → Payment succeeded but booking still 'draft' → User confusion
- **Impact:** **CRITICAL** - Money taken from mentee but no booking = refund + support ticket + trust destroyed
- **Mitigation:**
  - **Atomic transaction:** Update booking.status + create transaction record in single DB transaction (rollback on failure)
  - **Extend reservation during payment:** When Stripe Checkout Session is created, update booking with reservation_extended=true (prevents 15min expiration)
  - **Idempotent webhook handler:** Check if transaction exists for payment_intent_id before processing
  - **Retry mechanism:** If webhook fails, Stripe retries for 3 days (ensure handler is idempotent)
  - **Reconciliation job:** Daily check for paid-but-not-confirmed bookings → manual review + auto-rebook or refund
  - **Clear error handling:** If payment succeeds but booking expired, auto-refund + email: "Your booking expired during payment. You have been refunded."
- **Test Coverage Required:**
  - Integration: Payment success → verify booking.status='confirmed' AND transaction created
  - Integration: Payment success → confirmation email sent
  - Edge case: Booking expires during Stripe Checkout → payment succeeds → auto-refund triggered
  - Edge case: Webhook arrives 20 minutes after payment → booking still confirmed (reservation extended)
  - Negative: Webhook handler throws error → Stripe retries webhook → eventually succeeds
  - Negative: Duplicate webhook (same payment_intent_id) → idempotency prevents double transaction

#### Integration Risk 2: Payment Flow → Session Management - Session Completion Triggers Payout

- **Integration Point:** Payment (EPIC-005) ↔ Session Management (EPIC-006)
- **What Could Go Wrong:**
  - Session marked 'completed' but payout job doesn't find it → Mentor never paid
  - Session completed but <24h ago → Payout job processes it immediately (business rule violation)
  - Session cancelled AFTER payment but payout still processes → Mentor paid for cancelled session
  - Payout processed but session status changes to 'cancelled' later → Double-work (refund + clawback)
- **Impact:** **HIGH** - Incorrect payouts = financial loss or mentor dissatisfaction
- **Mitigation:**
  - **Strict query condition:** Payout job checks booking.status='completed' AND completed_at < NOW() - INTERVAL '24 hours'
  - **Cancellation handling:** If booking cancelled AFTER payment, mark transaction.status='refunded' → exclude from payout eligibility
  - **Webhook coordination:** Session completion (EPIC-006) fires internal event → Payout job picks up on next hourly run
  - **Grace period enforcement:** 24-hour hold is BUSINESS RULE (chargeback protection) → never bypass
- **Test Coverage Required:**
  - Integration: Session completed → 24h grace period → payout job processes
  - Edge case: Session completed 23h59m ago → payout job skips it (waits 1 more minute)
  - Negative: Session cancelled after payment → payout job excludes it (transaction.status='refunded')
  - Integration: Payout created → transfer.paid webhook → payout.status='paid'

#### Integration Risk 3: Stripe API Integration - Rate Limits, Downtime, API Changes

- **Integration Point:** Backend ↔ Stripe API (Checkout, Connect, Transfers, Webhooks)
- **What Could Go Wrong:**
  - Stripe API rate limit exceeded (100 requests/second for test mode) → Payments fail during load spike
  - Stripe API downtime (rare but possible) → Platform cannot process payments
  - Stripe API version deprecated → Breaking changes after platform launch
  - Stripe webhook signature algorithm changes → Webhook verification fails
- **Impact:** **HIGH** - Direct revenue impact, user frustration, support burden
- **Mitigation:**
  - **Rate limiting:** Implement exponential backoff for Stripe API calls (Stripe SDK handles this)
  - **Error handling:** Catch Stripe API errors (StripeAPIError, StripeAuthenticationError, etc.) → return user-friendly message
  - **Downtime handling:** If Stripe API is down (500, 503), show: "Payment system temporarily unavailable. Please try again in 5 minutes."
  - **API versioning:** Pin Stripe API version (2024-10-28.acacia per epic) → explicit upgrades only
  - **Monitor Stripe status:** https://status.stripe.com → automated alerts if downtime
  - **Webhook signature verification:** Use Stripe SDK (stripe.webhooks.constructEvent) → handles signature algorithm changes
- **Test Coverage Required:**
  - Negative: Stripe API returns 429 Rate Limit → Backend retries with exponential backoff
  - Negative: Stripe API returns 500 Server Error → User sees friendly error message
  - Integration: Webhook signature verification (valid signature → processed, invalid → rejected)
  - Manual: Review Stripe API version in codebase (verify it matches epic spec)

#### Integration Risk 4: Frontend ↔ Backend API - Checkout Session Creation Errors

- **Integration Point:** Frontend ↔ Backend API (POST /api/checkout/session)
- **What Could Go Wrong:**
  - Frontend sends invalid booking_id → Backend can't create Checkout Session → User stuck
  - Backend returns checkout_url but redirect fails → User sees blank page
  - Network timeout during Checkout Session creation → User doesn't know if payment started
  - Success/cancel URLs incorrect → User redirected to wrong page after payment
- **Impact:** **MEDIUM** - Booking abandonment, user frustration, support tickets
- **Mitigation:**
  - **Input validation:** Backend validates booking_id exists and is status='draft'
  - **Clear error messages:** Return 400 with message: "Invalid booking. Please select a time slot again."
  - **Loading states:** Frontend shows "Preparing secure checkout..." during API call
  - **URL validation:** Test success_url and cancel_url in staging before production
  - **Timeout handling:** Frontend timeout after 10 seconds → show error: "Checkout preparation failed. Please try again."
- **Test Coverage Required:**
  - Positive: POST /api/checkout/session with valid booking_id → returns checkout_url → redirect works
  - Negative: POST /api/checkout/session with invalid booking_id → 400 Bad Request
  - Negative: POST /api/checkout/session with booking.status='confirmed' → 400 "Booking already paid"
  - Integration: Redirect to Stripe Checkout → payment success → redirect to success_url with session_id
  - Integration: Redirect to Stripe Checkout → user cancels → redirect to cancel_url with booking_id

#### Integration Risk 5: Stripe Connect Onboarding - Mentor Verification Failures

- **Integration Point:** Backend ↔ Stripe Connect (AccountLink generation, account verification)
- **What Could Go Wrong:**
  - Mentor abandons Stripe Connect onboarding → payouts_enabled=false → cannot receive money
  - Mentor provides incorrect bank details → payouts fail → support burden
  - Stripe rejects mentor due to incomplete identity verification → mentor blocked
  - AccountLink expires (links expire after 1 hour) → mentor sees "Link expired" error
- **Impact:** **MEDIUM** - Mentor cannot monetize → frustration, churn
- **Mitigation:**
  - **Onboarding reminders:** Email mentor if onboarding_complete=false after 24h, 7 days
  - **Clear instructions:** "Connect your bank account to receive payouts" with step-by-step guide
  - **Link refresh:** If AccountLink expired, automatically generate new link and email mentor
  - **Status tracking:** Show onboarding progress in mentor dashboard: "Step 2 of 3: Verify identity"
  - **Support:** Dedicated support for onboarding issues (<24h response time)
- **Test Coverage Required:**
  - Positive: Mentor completes Stripe Connect onboarding → account.updated webhook → onboarding_complete=true, payouts_enabled=true
  - Negative: Mentor abandons onboarding → payouts_enabled=false → blocked from receiving payouts
  - Negative: AccountLink expires → mentor sees clear error + "Generate new link" button
  - Integration: POST /api/stripe/connect/onboard → returns AccountLink URL → redirect works
  - Integration: Mentor completes onboarding → GET /api/stripe/connect/status → returns onboarding_complete=true

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1: What happens if a payment succeeds but the booking has already expired (>15 minutes)?**

- **Found in:** Epic scope ("Slot Reservation Logic") and payment flow integration
- **Question for Dev:**
  - Does Stripe Checkout Session creation extend the 15-minute reservation window?
  - If payment succeeds but booking is deleted (expired), what happens?
    - Option A: Auto-refund and email user: "Booking expired during payment. Refunded."
    - Option B: Auto-rebook the same slot if still available
    - Option C: Create booking anyway (ignore expiration if paid)
  - How do we prevent this edge case?
- **Impact if not clarified:** Edge case could cause money taken but no booking (critical bug), or unclear test scenarios

**Ambiguity 2: How are refunds processed for cancelled sessions? Who absorbs Stripe fees?**

- **Found in:** Epic scope mentions "Refund processing for cancelled sessions (linked to EPIC-006)" but no details
- **Question for PO:**
  - If session cancelled <24h before start (per refund policy), who pays Stripe fees?
    - Option A: Mentee refunded 100%, platform absorbs Stripe fee (~3%)
    - Option B: Mentee refunded (100% - Stripe fee), platform breaks even
    - Option C: Mentee refunded 100%, mentor pays Stripe fee (deducted from future earnings)
  - If session cancelled >24h before start (no refund per policy), is mentee charged a cancellation fee?
  - Does refund reverse the platform commission (20%)?
  - Is there a partial refund option (e.g., 50% refund if cancelled 12h before)?
- **Impact if not clarified:** Cannot design refund test cases; financial model unclear; support policy undefined

**Ambiguity 3: What currency/currencies are supported? USD only or multi-currency?**

- **Found in:** Epic scope - "Out of Scope (Future): Multi-currency support" implies USD-only for MVP
- **Question for PO:**
  - Confirm MVP is USD-only for all transactions and payouts?
  - Can mentors in non-USD countries (e.g., UK, EU, Brazil) receive payouts?
    - Stripe supports currency conversion, but are we allowing non-USD bank accounts?
  - If USD-only, should we block non-US mentors during onboarding?
  - How do we display currency to users? ("$50" vs "$50 USD" vs "50.00 USD")
- **Impact if not clarified:** Cannot design currency validation test cases; mentor onboarding flow unclear; pricing display inconsistent

**Ambiguity 4: How do we handle failed payouts (bank account issues)? Retry? Manual? Email mentor?**

- **Found in:** Epic mentions "transfer.failed" webhook but no retry logic specified
- **Question for Dev:**
  - If Stripe Transfer fails (invalid bank account), what happens?
    - Option A: Retry automatically after 24h
    - Option B: Email mentor: "Update your bank account" and retry manually (admin action)
    - Option C: Hold payout indefinitely until mentor fixes bank account
  - How many retry attempts before manual intervention required?
  - Is failed payout amount held in "available balance" for mentor?
  - Does mentor get notified of payout failure immediately (transfer.failed webhook)?
- **Impact if not clarified:** Cannot design payout failure test cases; mentor experience unclear; support process undefined

**Ambiguity 5: What is the exact payout timing? "24 hours after session completion" - but when does Stripe Transfer complete?**

- **Found in:** Epic AC: "Payouts are automatically processed 24 hours after session completion"
- **Question for PO/Dev:**
  - Does "processed" mean payout job runs 24h after completion, or funds arrive in bank 24h after?
  - Stripe Transfers typically take 2-7 business days to arrive in bank (Stripe's timeline, not ours)
  - How do we communicate this to mentors? "You'll be paid 24-48 hours after session" is misleading
  - Suggested messaging: "Payout initiated 24h after session, arrives in bank 2-7 business days (Stripe)"
- **Impact if not clarified:** Mentor expectations misaligned; support tickets about "missing payouts"; unclear SLA

**Ambiguity 6: How do we reconcile payments with bookings if webhook never arrives (Stripe outage)?**

- **Found in:** Epic mentions "Webhook handling for Stripe events is idempotent" but no reconciliation process
- **Question for Dev:**
  - If webhook is never delivered (Stripe outage >3 days), how do we confirm payment?
  - Is there a daily reconciliation job that queries Stripe API for recent payments?
    - Query Stripe: GET /v1/checkout/sessions?limit=100&created[gte]={yesterday}
    - Compare with database transactions table
    - Create missing transaction records + update booking status
  - Who is responsible for manual reconciliation (admin, dev, QA)?
  - How often does reconciliation run (daily, hourly)?
- **Impact if not clarified:** Edge case (Stripe outage) could cause unconfirmed bookings; no test cases for reconciliation logic

**Ambiguity 7: Can mentees use the same payment method for multiple bookings? Is payment method saved?**

- **Found in:** Epic scope - Stripe Checkout is mentioned, but no details on payment method storage
- **Question for PO:**
  - MVP: Does Stripe Checkout save payment methods for repeat bookings?
    - Stripe Checkout can use Stripe Link (auto-saves payment methods)
    - Or one-time payment (no save)
  - If payment methods are saved, do we show "Use saved card ending in 4242"?
  - Is payment method management (add, remove) in scope for MVP?
- **Impact if not clarified:** UX unclear (one-time vs saved payment); test scenarios for repeat payments undefined

---

### Missing Information

**Missing 1: Minimum and Maximum Transaction Amounts**

- **Needed for:** Validation logic and test case design
- **Suggestion:** Add to FR-016: "Transaction amount must be ≥$1.00 (minimum Stripe charge) and ≤$10,000 (fraud prevention). Mentor hourly_rate validation should enforce this range."
- **Test Impact:** Need boundary test cases for $0.99 (reject), $1.00 (accept), $10,000 (accept), $10,001 (reject)

**Missing 2: Payment Method Types Supported**

- **Needed for:** Stripe Checkout configuration and test scenarios
- **Suggestion:** Specify: "MVP supports credit/debit cards (Visa, Mastercard, Amex, Discover) via Stripe Checkout. No support for ACH, wire transfer, crypto, or buy-now-pay-later (Klarna, Affirm)."
- **Test Impact:** Test with various card brands (Visa, Mastercard, Amex); no tests for unsupported methods

**Missing 3: Receipt Generation Format**

- **Needed for:** Email confirmation template and legal compliance
- **Suggestion:** Define receipt contents:
  - Transaction ID (Stripe Payment Intent ID)
  - Date/time of payment
  - Mentee name and email
  - Mentor name
  - Session date/time
  - Gross amount, platform fee (displayed? or hidden?), total paid
  - Payment method (last 4 digits of card)
  - Platform business details (company name, address, tax ID)
  - Link to view/download full receipt (PDF?)
- **Test Impact:** Need to validate receipt email template contains all required fields

**Missing 4: Tax Handling (1099-K, Sales Tax, VAT)**

- **Needed for:** Legal compliance and mentor expectations
- **Suggestion:** Clarify:
  - MVP: No automatic tax calculation or 1099-K generation (out of scope per epic)
  - Mentors are responsible for reporting their own income
  - Include in Mentor Agreement: "You are an independent contractor. We will issue 1099-K if you earn >$600/year (US IRS requirement)."
  - For sales tax/VAT: "Platform does not collect sales tax (mentorship services are typically exempt in most jurisdictions)"
- **Test Impact:** No tax-related test cases for MVP; note for future (Stripe Tax integration)

**Missing 5: Payout Frequency (Daily, Weekly, Monthly?)**

- **Needed for:** Payout job scheduling and mentor expectations
- **Suggestion:** Clarify:
  - Epic says "Payouts are automatically processed 24 hours after session completion" → implies per-session payout
  - Alternative: Batch payouts (weekly: every Monday, monthly: 1st of month)
  - Recommended: Per-session payout for MVP (simplicity, mentor satisfaction)
  - Add to epic: "Each completed session results in a separate payout 24h after completion. Future: Batch payouts (weekly/monthly) to reduce Stripe Transfer fees."
- **Test Impact:** Test per-session payout logic; note for future (batch payout aggregation)

**Missing 6: Transaction History Pagination and Filters**

- **Needed for:** GET /api/transactions endpoint design
- **Suggestion:** Add to FR-018:
  - Pagination: 50 transactions per page (default)
  - Sort: Most recent first (created_at DESC)
  - Filters: status (all, succeeded, failed, refunded), date range, role (payments sent as mentee, payouts received as mentor)
  - Search: By mentor name, mentee name, booking ID
- **Test Impact:** Test pagination (page 1, page 2, last page); test filters (status, date range)

**Missing 7: Error Message Catalog for Payment Failures**

- **Needed for:** Frontend error handling and user messaging
- **Suggestion:** Define error messages:
  - `CARD_DECLINED`: "Your card was declined. Please try a different payment method."
  - `INSUFFICIENT_FUNDS`: "Insufficient funds. Please use a different card."
  - `PAYMENT_TIMEOUT`: "Payment processing timed out. Please try again."
  - `BOOKING_INVALID`: "This booking is no longer valid. Please select a new time slot."
  - `STRIPE_ERROR`: "Payment system error. Please try again in a few minutes or contact support."
- **Test Impact:** Validate error messages match catalog; test each error scenario

**Missing 8: Admin Capabilities (Refunds, Payout Management)**

- **Needed for:** Support and operations
- **Suggestion:** Add to epic scope:
  - Admin can issue refunds (POST /api/refunds with admin JWT)
  - Admin can view all transactions (GET /api/admin/transactions)
  - Admin can manually trigger payout (POST /api/admin/payouts/{mentorId}/trigger)
  - Admin can view payout reconciliation dashboard
- **Test Impact:** Test admin-only endpoints (403 for non-admin); test refund flow

---

### Suggested Improvements (Before Implementation)

**Improvement 1: Add Webhook Event Logging Table**

- **Story Affected:** All stories (MYM-24, MYM-25, MYM-26, MYM-27)
- **Current State:** Epic mentions "Log all webhook events for debugging" but no schema
- **Suggested Change:** Create `webhook_logs` table:
  - Columns: id, stripe_event_id (UNIQUE), event_type (checkout.session.completed, transfer.paid, etc.), payload (JSON), processed_at, retry_count, error_message, created_at
  - Purpose: Debugging, reconciliation, audit trail, replay failed webhooks
- **Benefit:**
  - Easier debugging (view raw webhook payload)
  - Reconciliation (compare Stripe events with database state)
  - Audit trail (compliance)
  - Retry failed webhooks (if processing failed)

**Improvement 2: Show Estimated Payout Date in Mentor Dashboard**

- **Story Affected:** MYM-26 (Earnings tracking)
- **Current State:** Epic says mentors can "see a record of earnings" but no payout ETA
- **Suggested Change:** Mentor dashboard shows:
  - "Pending Payouts: $240 (3 sessions eligible for payout on Nov 18, Nov 19, Nov 20)"
  - For each session: "Session on Nov 15 → Payout on Nov 17 (24h after completion)"
- **Benefit:**
  - Sets clear expectations (reduces "where's my money?" support tickets)
  - Transparent (builds trust)
  - Encourages mentors to complete sessions (they know exactly when they'll be paid)

**Improvement 3: Add Payment Retry Flow for Failed Payments**

- **Story Affected:** MYM-24 (Student payment)
- **Current State:** Epic AC says "Failed payments show clear error messages and allow retry" but no flow specified
- **Suggested Change:** On payment failure page:
  - Show error message: "Payment failed: Card declined"
  - "Try Again" button → regenerates Stripe Checkout Session (new session_id)
  - Preserve booking (don't create new booking, update existing booking_id)
  - Track retry attempts (max 3 retries within 15-minute window)
- **Benefit:**
  - Reduces booking abandonment (users can fix typos or try different card)
  - Better UX (no need to re-select time slot)
  - Higher conversion rate

**Improvement 4: Implement Payment Intent Confirmation (Instead of Redirect-Only Flow)**

- **Story Affected:** MYM-24 (Student payment)
- **Current State:** Epic uses Stripe Checkout (redirect flow)
- **Suggested Change:** Consider Stripe Payment Element (embedded form, no redirect):
  - Better UX (no redirect, faster checkout)
  - More customization (brand colors, custom fields)
  - Same security (PCI-compliant)
  - Note: Requires more frontend/backend work (Stripe.js integration)
- **Benefit:**
  - Faster checkout (reduces abandonment)
  - Better mobile UX
  - More control over payment flow
- **Risk:** More complex implementation (may not be worth it for MVP)

**Improvement 5: Add Commission Breakdown to Transaction History**

- **Story Affected:** MYM-26 (Transaction history), FR-018
- **Current State:** Epic says "transaction history shows bookingId, amount, commission_applied, net_amount" ✓ Good
- **Suggested Change:** Make commission breakdown MORE visible:
  - Transaction details modal shows:
    - "Gross amount: $100.00"
    - "Platform fee (20%): -$20.00"
    - "Net earnings: $80.00"
  - For mentees: Show "Total paid: $100.00" (platform fee is NOT shown to mentees - hidden in price)
- **Benefit:**
  - Transparency (mentors see exactly how commission is calculated)
  - Trust (no hidden fees)
  - Reduces "why is my payout less than session price?" support tickets

**Improvement 6: Stripe Test Mode Indicator in UI**

- **Story Affected:** All stories (development/staging only)
- **Current State:** No indication if platform is in Stripe test mode
- **Suggested Change:** In staging/dev environments, show banner:
  - "TEST MODE: Payments are simulated. Use test card 4242 4242 4242 4242"
  - Banner disappears in production
- **Benefit:**
  - Prevents confusion during testing
  - Ensures devs/QA don't accidentally use real cards in test mode
  - Clear visual indicator of environment

**Improvement 7: Add "Download Receipt" Button in Transaction History**

- **Story Affected:** MYM-26, FR-018
- **Current State:** Receipts are emailed, but no self-service download
- **Suggested Change:** Transaction history includes:
  - "Download Receipt (PDF)" button for each transaction
  - PDF generated on-demand (using library like pdfkit or Stripe Receipt API)
- **Benefit:**
  - Self-service (reduces support load)
  - Users can retrieve receipts anytime (no email search)
  - Accounting/expense reporting (users need receipts for reimbursement)

**Improvement 8: Add Payout Reconciliation Dashboard (Admin Only)**

- **Story Affected:** MYM-27 (Automated payouts)
- **Current State:** Epic mentions "Manual payout reconciliation dashboard" in risks but not in scope
- **Suggested Change:** Admin dashboard shows:
  - Sessions completed >24h ago with no payout (missing payouts)
  - Payouts in "pending" status >48h (stuck payouts)
  - Total platform commission collected vs expected (20% of GMV)
  - Payout success rate (target: >95%)
- **Benefit:**
  - Proactive error detection (catch missing payouts before mentor complains)
  - Financial audit (ensure commission calculations are correct)
  - Operational health (monitor payout success rate)

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- **Functional Testing:**
  - Checkout session creation (POST /api/checkout/session)
  - Stripe Checkout payment flow (redirect, payment, success/cancel)
  - Payment confirmation (webhook handling: checkout.session.completed)
  - Transaction record creation (database CRUD)
  - Stripe Connect onboarding (mentor bank account linking)
  - Payout calculation (gross - 20% commission = net)
  - Automated payout processing (scheduled job, Stripe Transfer)
  - Payout status updates (webhook: transfer.paid, transfer.failed)
  - Transaction history (GET /api/transactions, pagination, filters)
  - Earnings dashboard (GET /api/payouts, balance calculation)
  - Receipt email generation and delivery

- **Integration Testing:**
  - Frontend ↔ Backend API (checkout, transactions, payouts)
  - Backend ↔ Stripe Checkout (session creation, redirect, webhooks)
  - Backend ↔ Stripe Connect (onboarding, transfers, account status)
  - Backend ↔ Supabase Database (transactions, payouts, stripe_accounts CRUD)
  - Backend ↔ Email Service (payment confirmation, payout notification)
  - Booking → Payment → Session flow (EPIC-004 → EPIC-005 → EPIC-006)
  - Scheduled job execution (payout processor, webhook retry, reconciliation)

- **Non-Functional Testing (per NFR specs):**
  - **Security (NFR-002):**
    - PCI compliance (Stripe handles card data, platform never stores)
    - Webhook signature verification (prevent spoofing)
    - JWT authentication for all payment endpoints
    - RLS enforcement (users only see their own transactions)
    - API key protection (never expose secret keys in frontend)
    - HTTPS-only communication
  - **Performance (NFR-001):**
    - Checkout session creation <500ms (p95)
    - Transaction history API <500ms (p95)
    - Payout job processes 100 sessions <5 minutes
  - **Reliability (NFR-007):**
    - Payment success rate >99% (excluding card declines)
    - Payout delivery success rate >95%
    - Webhook processing success rate >99%
    - Error rate <1% for payment endpoints

- **API Contract Validation (per api-contracts.yaml):**
  - POST /api/checkout/session matches schema
  - POST /api/payments/process matches schema (if exists)
  - GET /api/payments/history matches schema
  - Error responses (400, 401, 403, 404, 409, 500) match ErrorResponse schema

**Out of Scope (For This Epic):**

- Alternative payment methods (PayPal, crypto, wire transfer, ACH) - Future
- Subscription plans or package deals - Future
- Dynamic commission rates per mentor - Future
- Split payments (pay part now, part later) - Future
- Multi-currency support - Future (MVP is USD-only)
- Tax document generation (1099-K forms) - Future (manual for MVP)
- Escrow system for dispute resolution - Future
- Stripe Link integration (one-click checkout) - Nice-to-have, not critical for MVP
- Saved payment methods (requires Customer objects in Stripe) - Future
- Refund flow - Partially in scope (API exists) but full testing in EPIC-006
- Load testing beyond 100 concurrent users - Post-MVP
- Penetration testing - External contractor, post-launch

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** >95% for payment business logic (commission calculation, validation, idempotency)
- **Focus Areas:**
  - **Commission calculation:**
    - calculatePlatformFee(gross_amount) → gross * 0.20
    - calculateNetAmount(gross, fee) → gross - fee
    - Rounding to 2 decimal places
  - **Payment validation:**
    - Booking exists and is status='draft'
    - Amount matches mentor hourly_rate
    - Currency is 'usd'
  - **Idempotency logic:**
    - Check if transaction exists for stripe_payment_intent_id
    - Prevent duplicate transaction creation
  - **Payout eligibility:**
    - Session completed >24h ago
    - No payout record exists for booking
    - Mentor has payouts_enabled=true
- **Responsibility:** Dev team (TDD approach for payment logic)
- **Tools:** Vitest (frontend), Jest (backend)

#### Integration Testing

- **Coverage Goal:** All integration points identified in Architecture Analysis
- **Focus Areas:**
  - **Frontend ↔ Backend API:**
    - POST /api/checkout/session → returns checkout_url
    - GET /api/transactions → returns paginated list
    - GET /api/payouts → returns mentor's payouts
  - **Backend ↔ Stripe Checkout:**
    - Create Checkout Session with correct metadata (booking_id, mentor_id, mentee_id)
    - Verify success_url and cancel_url are correct
    - Test webhook: checkout.session.completed → transaction created
  - **Backend ↔ Stripe Connect:**
    - POST /api/stripe/connect/onboard → returns AccountLink URL
    - Webhook: account.updated → updates stripe_accounts table
    - Create Transfer → webhook: transfer.paid → payout marked as paid
  - **Backend ↔ Database:**
    - INSERT transaction with UNIQUE constraint on booking_id
    - INSERT payout_item with UNIQUE constraint on transaction_id
    - SELECT transactions with filters (mentee_id, status, date range)
  - **Booking → Payment → Session Flow:**
    - Draft booking → payment success → booking.status='confirmed' → session completed → payout processed
  - **Scheduled Jobs:**
    - Payout processor finds eligible sessions
    - Webhook retry handler retries failed webhooks
    - Reconciliation job detects paid-but-not-confirmed bookings
- **Responsibility:** QA + Dev (pair programming for critical flows)
- **Tools:** Playwright API, Stripe Test Mode, Supabase test instance

#### End-to-End (E2E) Testing

- **Coverage Goal:** Critical payment and payout user journeys
- **Tool:** Playwright
- **Focus Areas:**
  - **Mentee Payment Journey (Laura's flow):**
    1. Mentee logs in → Books session (from EPIC-004)
    2. Proceeds to checkout → POST /api/checkout/session
    3. Redirected to Stripe Checkout (test mode)
    4. Enters test card: 4242 4242 4242 4242, future expiry, any CVV
    5. Completes payment → Stripe redirects to success_url
    6. Sees confirmation page: "Your booking is confirmed!"
    7. Receives confirmation email with receipt (verify in test inbox)
    8. Transaction appears in transaction history
    9. Booking status updated to 'confirmed'

  - **Mentor Stripe Connect Onboarding (Carlos's flow):**
    1. Mentor logs in → Navigates to earnings dashboard
    2. Sees "Connect your bank account to receive payouts" prompt
    3. Clicks "Connect" → POST /api/stripe/connect/onboard
    4. Redirected to Stripe Connect Express onboarding
    5. Completes onboarding (test mode: auto-approves)
    6. Stripe fires webhook: account.updated → onboarding_complete=true
    7. Mentor redirected back to dashboard
    8. Dashboard shows: "Your account is ready to receive payouts"

  - **Automated Payout Flow:**
    1. Session is completed (EPIC-006) → booking.status='completed', completed_at=NOW()
    2. Wait 24 hours (or fast-forward test clock)
    3. Payout processor job runs (trigger manually in test)
    4. Job finds eligible session
    5. Verifies mentor has payouts_enabled=true
    6. Creates Stripe Transfer → stripe_payout_id recorded
    7. Stripe fires webhook: transfer.paid → payout.status='paid'
    8. Mentor receives payout notification email
    9. Dashboard shows: "Payout of $80 sent on Nov 17" (gross $100 - $20 fee)

  - **Payment Failure Handling:**
    1. Mentee proceeds to checkout
    2. Enters declined test card: 4000 0000 0000 9995
    3. Stripe rejects payment
    4. Redirected to cancel_url
    5. Sees error: "Payment failed. Please try a different card."
    6. Booking remains status='draft'
    7. Can retry payment (new checkout session)

  - **Cross-Story Integration (Full Marketplace Flow):**
    1. Mentee searches for mentor (EPIC-003)
    2. Views mentor profile → Books session (EPIC-004)
    3. Pays via Stripe Checkout (EPIC-005)
    4. Attends session via video call (EPIC-006)
    5. Session marked as completed (EPIC-006)
    6. 24h later: Payout processed (EPIC-005)
    7. Mentor receives payout notification

- **Responsibility:** QA team
- **Test Data:** Faker.js for users, Stripe test cards, factories for bookings

#### API Testing

- **Coverage Goal:** 100% of payment/payout endpoints
- **Tool:** Postman/Newman or Playwright API
- **Focus Areas:**
  - **Contract Validation:**
    - POST /api/checkout/session request/response matches api-contracts.yaml
    - GET /api/transactions response matches TransactionResponse schema
    - GET /api/payments/history response matches schema
    - Error responses match ErrorResponse schema

  - **Status Codes:**
    - 200 OK: Successful checkout session creation, transaction history fetch
    - 201 Created: Transaction created (if applicable)
    - 400 Bad Request: Invalid booking_id, currency, amount
    - 401 Unauthorized: Missing or invalid JWT token
    - 403 Forbidden: Mentee trying to access /api/payouts (mentor-only)
    - 404 Not Found: Booking ID doesn't exist
    - 409 Conflict: Transaction already exists for booking_id (idempotency)
    - 500 Internal Server Error: Stripe API error (catch and log)

  - **Authentication/Authorization:**
    - All endpoints require valid JWT (except webhooks, which use Stripe signature)
    - Only authenticated user can POST /api/checkout/session (for their booking)
    - Only mentors can GET /api/payouts
    - Only admins can POST /api/refunds
    - RLS: Users only see their own transactions in GET /api/transactions

  - **Webhook Handling:**
    - POST /api/webhooks/stripe with valid signature → 200 OK, processed
    - POST /api/webhooks/stripe with invalid signature → 401 Unauthorized
    - POST /api/webhooks/stripe with duplicate event (same stripe_event_id) → 200 OK, ignored (idempotency)
    - POST /api/webhooks/stripe with checkout.session.completed → booking confirmed, transaction created
    - POST /api/webhooks/stripe with transfer.paid → payout marked as paid

- **Responsibility:** QA team
- **Test Environment:** Staging with Stripe test mode

---

### Test Types per Story

For EACH user story, the following test types will be covered:

**Positive Test Cases (Happy Paths):**
- Successful execution with valid data (test cards, valid bookings)
- Multiple valid scenarios (different card brands, amounts, mentors)
- Standard user flows (payment, onboarding, payout)

**Negative Test Cases (Error Scenarios):**
- Invalid input data (declined cards, invalid booking_id, wrong currency)
- Missing required fields (booking_id, amount)
- Unauthorized access (non-mentor accessing payout history)
- Business rule violations (booking already paid, payout already processed)
- External service failures (Stripe API error, webhook failure)

**Boundary Test Cases (Edge Cases):**
- Min/max values (transaction amounts: $1, $10,000)
- Timing boundaries (payout exactly 24h after completion, 23h59m - too early)
- Concurrency (2 payments for same booking, duplicate webhooks)
- Rounding (commission calculation with $49.99 hourly rate)

**Security Test Cases:**
- Webhook signature verification (valid, invalid, missing)
- API key protection (never exposed in frontend, logs, errors)
- JWT authentication (valid, expired, missing, wrong user)
- RLS enforcement (users only see own data)
- Input validation (SQL injection, XSS in transaction metadata)

**Exploratory Testing:**
- Real-world usage patterns (repeat payments, multiple mentors, international cards)
- UI/UX issues (confusing checkout flow, unclear pricing, missing confirmations)
- Performance under realistic load (100 concurrent checkouts)
- Edge cases not covered in formal tests (network timeouts, browser refresh during payment)

---

## 📊 Test Cases Summary by Story

### MYM-24: Student Payment (Stripe Checkout)

**Complexity:** **HIGH**
- Stripe Checkout integration (redirect flow, webhooks)
- Idempotency handling (prevent duplicate charges)
- Booking status synchronization (draft → confirmed)
- Email confirmation with receipt
- Multiple failure scenarios (declined cards, network errors)

**Estimated Test Cases:** **52**

**Breakdown:**

- **Positive:** 12 test cases
  - Successful payment with Visa test card (4242 4242 4242 4242)
  - Successful payment with Mastercard (5555 5555 5555 4444)
  - Successful payment with Amex (3782 822463 10005)
  - Checkout session created with correct metadata (booking_id, amounts)
  - Redirect to Stripe Checkout works
  - Payment success → redirect to success_url with session_id
  - Booking status updated to 'confirmed'
  - Transaction record created with correct gross, fee, net
  - Confirmation email sent with receipt
  - Transaction appears in mentee's transaction history
  - Hourly rate snapshot preserved (if mentor changes rate later, booking uses old rate)
  - Payment processed <5 seconds (per AC)

- **Negative:** 22 test cases
  - Payment declined (test card 4000 0000 0000 9995)
  - Insufficient funds (test card 4000 0000 0000 9995)
  - Invalid card number (1234 5678 9012 3456)
  - Expired card (expiry in the past)
  - Invalid CVV (123 when 4 digits required for Amex)
  - Checkout session with invalid booking_id → 400 Bad Request
  - Checkout session with booking.status='confirmed' → 400 "Already paid"
  - Checkout session with booking.status='cancelled' → 400 "Booking cancelled"
  - Checkout session without authentication → 401 Unauthorized
  - Checkout session for another user's booking → 403 Forbidden
  - Stripe API error (500) → user sees friendly error
  - Stripe API rate limit (429) → retry with exponential backoff
  - Webhook with invalid signature → 401 Unauthorized, not processed
  - Duplicate webhook (same payment_intent_id) → idempotency prevents double transaction
  - Webhook arrives but booking expired → graceful handling (refund or ignore)
  - Payment success but booking deleted → auto-refund + email notification
  - Network timeout during checkout session creation → user sees error
  - Redirect to success_url fails (URL incorrect) → manual verification required
  - Payment cancelled by user (clicks "Back" in Stripe Checkout) → redirect to cancel_url
  - Payment with unsupported currency (EUR) → 400 Bad Request
  - Transaction amount mismatch (frontend sends $100, backend calculates $50) → rejected

- **Boundary:** 10 test cases
  - Payment amount = $1.00 (minimum Stripe charge)
  - Payment amount = $0.99 → 400 Bad Request (below minimum)
  - Payment amount = $10,000 (maximum per validation)
  - Payment amount = $10,001 → 400 Bad Request (above maximum)
  - Commission calculation: $49.99 → fee = $10.00, net = $39.99 (rounding)
  - Commission calculation: $100.00 → fee = $20.00, net = $80.00
  - Commission calculation: $0.01 → fee = $0.00, net = $0.01 (edge case)
  - Booking expires exactly at 15:00 minute mark during payment → edge case handling
  - Webhook arrives exactly 24h after payment → still processed
  - Checkout session expires (link clicked >24h later) → Stripe error

- **Integration:** 6 test cases
  - Frontend → Backend → Stripe Checkout → Webhook → Database → Email (full flow)
  - Checkout session metadata propagates to webhook (booking_id, mentor_id)
  - Payment success updates booking.status atomically (transaction prevents partial update)
  - Confirmation email triggered by webhook (not by frontend redirect)
  - Transaction history API returns newly created transaction
  - RLS: Mentee sees their payment in transaction history, mentor does NOT see it yet (until payout)

- **API:** 2 test cases
  - POST /api/checkout/session matches request/response schema
  - POST /api/webhooks/stripe matches Stripe webhook schema

**Rationale for Estimate:**
MYM-24 is CRITICAL and HIGH complexity due to:
- Stripe integration (multiple failure modes: declined cards, API errors, webhook failures)
- Idempotency requirements (prevent double-charging)
- Cross-epic coordination (booking status updates)
- Security (webhook signature verification, PCI compliance)
- Multiple test card scenarios (Visa, Mastercard, Amex, declined, insufficient funds)
- Edge cases (booking expiration, webhook timing, network failures)

**Parametrized Tests Recommended:** **YES**
- Test card variations (Visa, Mastercard, Amex, declined, insufficient funds)
- Hourly rate variations ($1, $50, $100, $9999)
- Webhook event types (checkout.session.completed, payment_intent.succeeded)
- Error scenarios (400, 401, 403, 404, 500)

---

### MYM-25: Mentor Stripe Connect Onboarding

**Complexity:** **MEDIUM-HIGH**
- Stripe Connect Express integration (AccountLink generation)
- Mentor account status tracking (onboarding_complete, payouts_enabled)
- Webhook handling (account.updated)
- Link expiration handling (AccountLinks expire after 1h)

**Estimated Test Cases:** **35**

**Breakdown:**

- **Positive:** 10 test cases
  - Mentor initiates onboarding → AccountLink generated
  - Redirect to Stripe Connect Express works
  - Mentor completes onboarding (test mode: auto-approves)
  - Webhook: account.updated → onboarding_complete=true, payouts_enabled=true
  - Mentor redirected back to platform (return_url)
  - Dashboard shows: "Your account is ready to receive payouts"
  - stripe_accounts record created with stripe_account_id
  - GET /api/stripe/connect/status returns correct onboarding status
  - Mentor can view onboarding status in dashboard
  - AccountLink refresh works (if link expires, new one generated)

- **Negative:** 15 test cases
  - Mentor tries to onboard twice → error: "Already connected"
  - Non-mentor user tries to access onboarding → 403 Forbidden
  - AccountLink generation fails (Stripe API error) → user sees friendly error
  - AccountLink expires (>1h) → user sees "Link expired" + refresh button
  - Mentor abandons onboarding → onboarding_complete=false, payouts_enabled=false
  - Webhook: account.updated with payouts_enabled=false → mentor blocked from receiving payouts
  - Mentor tries to create payout without onboarding → error: "Complete Stripe Connect onboarding first"
  - Webhook with invalid signature → rejected
  - Duplicate webhook (same account.updated event) → idempotency prevents double-processing
  - Mentor deletes Stripe account externally → webhook updates payouts_enabled=false
  - Mentor in unsupported country (e.g., North Korea) → Stripe rejects
  - Mentor provides incomplete identity info → Stripe requires additional verification
  - Return URL incorrect → manual verification required

- **Boundary:** 4 test cases
  - AccountLink exactly at 1h expiration → still works
  - AccountLink at 1h01m → expired, needs refresh
  - Mentor completes onboarding exactly when webhook arrives → race condition handling
  - Multiple refresh_url clicks → new AccountLink each time (no issue)

- **Integration:** 4 test cases
  - Backend → Stripe Connect API → AccountLink generated
  - Webhook: account.updated → stripe_accounts table updated
  - Mentor completes onboarding → can now receive payouts (end-to-end)
  - GET /api/stripe/connect/status queries Stripe API (not just database cache)

- **API:** 2 test cases
  - POST /api/stripe/connect/onboard matches schema
  - GET /api/stripe/connect/status matches schema

**Rationale for Estimate:**
MYM-25 is MEDIUM-HIGH complexity due to:
- Stripe Connect integration (Express vs Standard vs Custom account types)
- Link expiration handling (1-hour window)
- Webhook coordination (account.updated with multiple fields)
- Mentor onboarding UX (abandonment scenarios)
- Security (payouts_enabled=false blocks fraudulent accounts)

**Parametrized Tests Recommended:** **YES**
- Webhook variations (onboarding_complete, payouts_enabled, charges_enabled combinations)
- Error scenarios (Stripe API errors, link expiration)

---

### MYM-26: Earnings Tracking (Transaction History)

**Complexity:** **MEDIUM**
- Transaction history querying (filters, pagination, sorting)
- Earnings calculation (available balance, lifetime earnings)
- RLS enforcement (users only see own transactions)
- Payout history display

**Estimated Test Cases:** **38**

**Breakdown:**

- **Positive:** 12 test cases
  - GET /api/transactions returns mentee's payments (as mentee)
  - GET /api/transactions returns mentor's earnings (as mentor)
  - Pagination works (page 1, page 2, last page)
  - Sorting by date (newest first)
  - Filter by status (succeeded, failed, refunded)
  - Filter by date range (last 30 days, last 90 days, custom range)
  - Transaction details show: booking_id, mentor/mentee name, gross, fee, net, payment_method
  - Available balance calculated correctly (sum of net_amount - sum of paid payouts)
  - Lifetime earnings displayed (sum of all succeeded transactions)
  - GET /api/payouts returns mentor's payout history (mentor-only)
  - Payout details show: payout_id, amount, status, scheduled_for, processed_at
  - Dashboard shows pending payouts (sessions eligible for payout soon)

- **Negative:** 12 test cases
  - GET /api/transactions without authentication → 401 Unauthorized
  - Mentee tries to access GET /api/payouts → 403 Forbidden (mentor-only)
  - Invalid filter value (status='invalid') → 400 Bad Request
  - Invalid date range (start_date > end_date) → 400 Bad Request
  - Page number = 0 → 400 Bad Request
  - Limit = 0 or >100 → 400 Bad Request
  - RLS: User A cannot see User B's transactions (query returns 0 results)
  - Transaction history for user with 0 transactions → empty array
  - Payout history for mentor with 0 payouts → empty array
  - API error during query → 500 Internal Server Error (logged)

- **Boundary:** 8 test cases
  - Transaction history with exactly 50 transactions (default page size)
  - Transaction history with 1000+ transactions (performance test)
  - Pagination: Last page with <50 transactions (partial page)
  - Filter: Date range exactly at transaction boundaries
  - Available balance = $0.00 (no unpaid transactions)
  - Available balance = $10,000+ (large balance)
  - Lifetime earnings = $0.00 (new mentor)
  - Lifetime earnings = $100,000+ (successful mentor)

- **Integration:** 4 test cases
  - Payment success → transaction appears in history immediately
  - Payout processed → transaction marked as paid, removed from available balance
  - Refund issued → transaction status='refunded', balance adjusted
  - RLS policy enforced at database level (not just API)

- **API:** 2 test cases
  - GET /api/transactions matches TransactionResponse schema
  - GET /api/payouts matches schema

**Rationale for Estimate:**
MYM-26 is MEDIUM complexity due to:
- Multiple query filters (status, date range, role)
- Pagination and sorting logic
- RLS enforcement (security-critical)
- Balance calculations (sum aggregations)
- Cross-role views (mentee sees payments, mentor sees earnings)

**Parametrized Tests Recommended:** **YES**
- Filter combinations (status × date range × role)
- Pagination scenarios (page 1, 2, 3, last page, empty)

---

### MYM-27: Automated Payouts

**Complexity:** **HIGH**
- Scheduled job execution (hourly cron)
- Payout eligibility calculation (24h grace period)
- Stripe Transfer creation (to mentor Connect account)
- Webhook handling (transfer.paid, transfer.failed)
- Payout retry logic (failed payouts)
- Reconciliation (ensure all eligible sessions are paid)

**Estimated Test Cases:** **55**

**Breakdown:**

- **Positive:** 12 test cases
  - Session completed >24h ago → payout job processes it
  - Payout job creates Stripe Transfer with correct amount (net_amount)
  - Transfer includes metadata (booking_id, mentor_id)
  - Payout record created with status='pending', scheduled_for
  - Webhook: transfer.paid → payout.status='paid', processed_at=NOW()
  - Mentor receives payout notification email
  - Dashboard shows: "Payout of $80 sent on Nov 17"
  - Multiple sessions in same hour → batched into separate payouts (per-session payout)
  - Payout job runs every hour (scheduled via cron)
  - Payout job is idempotent (running twice doesn't create duplicate payouts)
  - Payout history shows all past payouts (paid, pending, failed)
  - Commission calculation correct: gross $100 → net $80 (20% fee)

- **Negative:** 20 test cases
  - Session completed <24h ago → payout job skips it (too early)
  - Session completed exactly 23h59m ago → payout job skips it
  - Session completed exactly 24h00m ago → payout job processes it
  - Mentor without Stripe Connect onboarding → payout job skips (payouts_enabled=false)
  - Mentor with onboarding_complete=false → payout job skips
  - Payout already exists for session → job skips it (idempotency)
  - Stripe Transfer API error (500) → payout marked as 'failed', admin alerted
  - Stripe Transfer declined (invalid bank account) → webhook: transfer.failed → payout.status='failed', mentor notified
  - Payout job fails mid-execution → retry on next run (no partial payouts)
  - Duplicate payout attempt (race condition) → UNIQUE constraint on payout_items.transaction_id prevents
  - Session cancelled after completion → payout job skips it (transaction.status='refunded')
  - Mentor deletes Stripe account → Transfer fails, payout marked as failed
  - Webhook with invalid signature → rejected
  - Duplicate webhook (same transfer.paid event) → idempotency prevents double-update
  - Webhook arrives before payout record exists → queued for retry (or creates record if missing)
  - Payout to mentor in unsupported currency (EUR) → fails (MVP is USD-only)
  - Payout amount = $0.00 (commission = 100% due to refund) → skipped
  - Payout job runs but no eligible sessions → exits gracefully

- **Boundary:** 12 test cases
  - Payout exactly at 24h after completion (boundary)
  - Payout at 24h00m01s (just past boundary)
  - Payout for session with gross=$1.00 → net=$0.80, platform fee=$0.20
  - Payout for session with gross=$10,000 → net=$8,000, fee=$2,000
  - Payout job processes 100 sessions in single run (performance)
  - Payout job processes 0 sessions (no eligible sessions)
  - First payout for new mentor (mentor_id not in payouts table yet)
  - 100th payout for successful mentor (large payout history)
  - Payout scheduled_for in the past (if job was down for >1 hour) → still processes
  - Payout scheduled_for in the future → skipped (shouldn't happen)
  - Transfer amount exactly at Stripe minimum ($0.50 USD) → success
  - Transfer amount below Stripe minimum ($0.49) → fails

- **Integration:** 8 test cases
  - Scheduled job → Database query → Stripe Transfer → Webhook → Database update → Email
  - Payout job runs hourly (verify cron schedule)
  - Payout job finds eligible sessions (SQL query correctness)
  - Stripe Transfer created with correct destination (mentor stripe_account_id)
  - Webhook updates payout status atomically (no race conditions)
  - Email notification triggered by webhook (not by job directly)
  - Reconciliation job detects missing payouts (if webhook lost)
  - Admin dashboard shows failed payouts (for manual retry)

- **API:** 3 test cases
  - GET /api/payouts matches schema (payout history)
  - Payout object matches expected structure (id, amount, status, dates)
  - Webhook payload: transfer.paid matches Stripe schema

**Rationale for Estimate:**
MYM-27 is HIGH complexity due to:
- Scheduled job (cron, distributed locking, idempotency)
- Complex eligibility query (24h grace period, completion status, no existing payout)
- Stripe Transfer API integration (multiple failure modes)
- Webhook coordination (transfer.paid, transfer.failed)
- Retry logic (failed payouts, webhook failures)
- Reconciliation (ensure no missing payouts)
- Financial accuracy (commission calculations, rounding)
- Security (ensure only eligible mentors receive payouts)

**Parametrized Tests Recommended:** **YES**
- Payout timing scenarios (23h59m, 24h, 25h, 48h after completion)
- Commission calculations ($1, $50, $100, $9999 gross amounts)
- Mentor statuses (onboarding_complete, payouts_enabled combinations)
- Webhook event types (transfer.paid, transfer.failed)

---

### Total Estimated Test Cases for Epic

**Total:** **180 test cases**

**Breakdown:**
- **Positive:** 46 (26%)
- **Negative:** 79 (44%)
- **Boundary:** 34 (19%)
- **Integration:** 22 (12%)
- **API:** 9 (5%)

**Story Distribution:**
- MYM-24 (Student Payment): 52 test cases (29%)
- MYM-25 (Mentor Onboarding): 35 test cases (19%)
- MYM-26 (Earnings Tracking): 38 test cases (21%)
- MYM-27 (Automated Payouts): 55 test cases (31%)

**Rationale:**
180 test cases is realistic for a **CRITICAL** epic with **HIGH** technical and business complexity:
- Payment processing is the **revenue engine** (Technical Risk 1, Business Risk 1)
- Stripe integration has multiple failure modes (declined cards, API errors, webhooks, Connect onboarding)
- Financial accuracy is critical (commission calculations, payout amounts)
- Security requirements (PCI compliance, webhook verification, RLS)
- Cross-epic coordination (EPIC-004 → EPIC-005 → EPIC-006)
- This epic BLOCKS platform monetization - quality cannot be compromised

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

From user personas and Stripe test mode:

- **Mentees (Students):**
  - Laura García: laura.garcia@test.com, needs to pay $100 for React session
  - Sofía Rojas: sofia.rojas@test.com, needs to pay $75 for Data Science session
  - Timezone: PST, email verified, has valid booking (status='draft')

- **Mentors:**
  - Carlos Mendoza: carlos.mendoza@test.com, hourly_rate=$100, specialties ["AWS", "Microservices"]
  - Stripe Connect: onboarding_complete=true, payouts_enabled=true
  - Bank account: Test bank account (Stripe auto-generates in test mode)
  - Has completed sessions eligible for payout

- **Stripe Test Cards (from Stripe docs):**
  - **Successful payment:** 4242 4242 4242 4242 (Visa)
  - **Successful payment:** 5555 5555 5555 4444 (Mastercard)
  - **Successful payment:** 3782 822463 10005 (Amex)
  - **Declined (generic):** 4000 0000 0000 9995
  - **Insufficient funds:** 4000 0000 0000 9995 (same as declined in test mode)
  - **Expired card:** Use past expiry date (e.g., 01/20)
  - **Incorrect CVV:** Use 000 or 999 (Stripe test mode may not enforce)
  - **3D Secure (SCA) required:** 4000 0027 6000 3184
  - **Charge succeeds, payout fails:** 4000 0000 0000 0077 (useful for testing transfer failures)

- **Booking Scenarios:**
  - Draft booking: booking_id=UUID, status='draft', mentee_id=Laura, mentor_id=Carlos, gross_amount=$100
  - Confirmed booking: booking_id=UUID, status='confirmed', paid_at=NOW() - 1h
  - Completed booking (eligible for payout): status='completed', completed_at=NOW() - 25h
  - Cancelled booking: status='cancelled'

- **Transaction Data:**
  - Successful transaction: stripe_payment_intent_id=pi_123, gross=$100, fee=$20, net=$80, status='succeeded'
  - Failed transaction: status='failed'
  - Refunded transaction: status='refunded'

**Invalid Data Sets:**

- **Invalid Cards:**
  - Random numbers: 1234 5678 9012 3456
  - Too short: 4242 4242
  - Invalid Luhn checksum: 4242 4242 4242 4243

- **Invalid Booking IDs:**
  - Non-existent UUID: "00000000-0000-0000-0000-000000000000"
  - Invalid format: "not-a-uuid"
  - Null/empty: null, ""

- **Invalid Currency:**
  - EUR (not supported in MVP)
  - GBP (not supported)
  - Invalid: "INVALID"

- **Invalid Amounts:**
  - Negative: -$50
  - Zero: $0.00
  - Below minimum: $0.99
  - Above maximum: $10,001
  - Non-numeric: "one hundred"

- **Malicious Inputs (Security Testing):**
  - SQL injection in metadata: `'; DROP TABLE transactions;--`
  - XSS in metadata: `<script>alert('XSS')</script>`
  - Webhook signature spoofing: Invalid HMAC signature

**Boundary Data Sets:**

- **Transaction Amounts:**
  - Minimum valid: $1.00 → gross=$1.00, fee=$0.20, net=$0.80
  - Maximum valid: $10,000 → gross=$10,000, fee=$2,000, net=$8,000
  - Rounding edge case: $49.99 → gross=$49.99, fee=$10.00 (rounded), net=$39.99

- **Payout Timing:**
  - Session completed exactly 24h00m00s ago (boundary)
  - Session completed 23h59m59s ago (too early)
  - Session completed 24h00m01s ago (eligible)
  - Session completed 48h ago (eligible, late processing)

- **Pagination:**
  - Transactions: 0 results (empty page)
  - Transactions: exactly 50 results (default page size)
  - Transactions: 51 results (2 pages)
  - Transactions: 1000+ results (performance test)

- **Stripe API Limits:**
  - 100 requests/second (rate limit test)
  - Checkout Session expiration: 24h (link clicked >24h later)

**Test Data Management:**

- ✅ **Use Stripe Test Mode** for ALL testing (never use real cards or bank accounts)
- ✅ **Create data factories** for bookings, transactions, payouts
  - Factory: createBooking({ mentee, mentor, gross_amount, status })
  - Factory: createTransaction({ booking, stripe_payment_intent_id, status })
  - Factory: createPayout({ mentor, amount, status })
- ✅ **Seed test database** with known data (Carlos as mentor, Laura as mentee, 10 bookings)
- ❌ **NO hardcoded data** in tests (use factories for flexibility)
- ✅ **Clean up after tests** (delete test data or use database transactions with rollback)
- ✅ **Test email inbox** (Mailtrap, Mailhog, or Resend test mode) to capture confirmation/payout emails
- ✅ **Webhook testing tool** (Stripe CLI or webhook simulation endpoint)

**Test Data Volume:**

For load/performance tests:
- 100 mentees with bookings in various states
- 50 mentors with Stripe Connect accounts
- 500 transactions (succeeded, failed, refunded)
- 200 payouts (pending, paid, failed)

---

### Test Environments

**Staging Environment:**

- **URL:** `https://staging.upexmymentor.com`
- **Database:** Supabase staging instance (separate from production)
- **External Services:**
  - Stripe: Test mode (publishable_key_test, secret_key_test)
  - Email: Test inbox (Mailtrap or Resend sandbox)
- **Purpose:** Primary testing environment for all test levels
- **Test Data:** Seeded with Carlos (mentor), Laura (mentee), sample bookings
- **Restrictions:**
  - NO real payments (Stripe test mode only)
  - NO real emails (test inbox only)
  - Stripe webhooks: Use Stripe CLI or configure webhook endpoint

**Production Environment:**

- **URL:** `https://upexmymentor.com`
- **Purpose:** ONLY smoke tests post-deployment
- **Restrictions:**
  - ❌ NO test payments (don't use test cards in production)
  - ❌ NO test data creation
  - ✅ Read-only verification (transaction history loads, Stripe Connect status works)
  - ✅ Monitoring: Datadog, Stripe Dashboard (payment success rate, payout delivery)

**Local Development Environment:**

- **URL:** `http://localhost:3000`
- **Database:** Supabase local instance or Docker PostgreSQL
- **Stripe:** Test mode (local webhook forwarding via Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- **Purpose:** Developer testing, unit tests, integration tests
- **Test Data:** Factories + Faker.js for on-demand generation

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

- [ ] Story is **fully implemented** and deployed to staging
- [ ] Code review is **approved by 2+ reviewers**
- [ ] Unit tests exist and are **passing** (>95% coverage for payment/payout logic)
- [ ] Dev has done **smoke testing** (happy path works: payment success, payout success)
- [ ] **No blocker bugs** exist in dependent stories (EPIC-004: Booking must be complete)
- [ ] **Stripe integration configured** in staging (API keys, webhooks, Connect)
- [ ] **Test data prepared** (mentor with Stripe Connect, mentee with draft booking)
- [ ] **API documentation updated** in api-contracts.yaml (if endpoints changed)
- [ ] **Database migrations applied** to staging (transactions, payouts, stripe_accounts tables)
- [ ] **Environment variables configured** (Stripe keys, webhook secret, email service)
- [ ] **Critical questions answered** by PO/Dev (from Critical Analysis section)

### Exit Criteria (Per Story)

Story is considered "Done" from QA perspective when:

- [ ] **All test cases executed** (100% of designed test cases)
- [ ] **Critical/High priority test cases:** 100% passing
- [ ] **Medium/Low priority test cases:** ≥95% passing
- [ ] **All critical and high bugs resolved and verified**
- [ ] **Medium bugs** have mitigation plan or scheduled for future sprints
- [ ] **Regression testing passed** (payment flow doesn't break booking/session flows)
- [ ] **Non-functional requirements validated:**
  - [ ] **Security:** PCI compliance (Stripe handles cards), webhook signature verification, JWT auth, RLS
  - [ ] **Performance:** Checkout session creation <500ms, transaction history <500ms
  - [ ] **Reliability:** Payment success rate >99%, payout delivery >95%, webhook processing >99%
- [ ] **Test execution report generated and shared** with team
- [ ] **Known issues documented** in release notes (if any medium/low bugs remain)

### Epic Exit Criteria

Epic is considered "Done" from QA perspective when:

- [ ] **ALL stories (MYM-24, MYM-25, MYM-26, MYM-27) meet individual exit criteria**
- [ ] **Integration testing across all stories complete:**
  - [ ] End-to-end: Booking → Payment → Session → Payout (full marketplace flow)
  - [ ] Stripe integration: Checkout, Connect, Transfers, Webhooks all working
  - [ ] Commission calculation correct across all transactions
- [ ] **E2E testing of critical user journeys complete and passing:**
  - [ ] Laura's payment journey (book → pay → confirmed)
  - [ ] Carlos's onboarding journey (connect bank → receive payouts)
  - [ ] Automated payout flow (session completed → 24h → payout sent)
- [ ] **API contract testing complete** (all endpoints validated against api-contracts.yaml)
- [ ] **Non-functional testing complete:**
  - [ ] **Performance:** All endpoints <500ms (p95), checkout <5s
  - [ ] **Security:** Webhook verification, PCI compliance (Stripe audit), API key protection
  - [ ] **Reliability:** Payment success rate >99%, payout delivery >95%
  - [ ] **Scalability:** 100 concurrent checkouts supported without degradation
- [ ] **Exploratory testing session completed** (findings documented, bugs filed)
- [ ] **No critical or high bugs open** (all resolved or have workarounds)
- [ ] **QA sign-off document created and approved** by QA Lead and Product Owner
- [ ] **Handoff to EPIC-006 (Session Management) validated:**
  - [ ] Session completion triggers payout eligibility
  - [ ] Cancellation triggers refund flow (if implemented)
- [ ] **Stripe production readiness checklist complete:**
  - [ ] Stripe account activated (not test mode)
  - [ ] Webhook endpoints configured in production
  - [ ] API keys rotated (test keys → production keys)
  - [ ] Connect platform settings verified
  - [ ] Compliance questionnaire completed (Stripe)

---

## 📝 Non-Functional Requirements Validation

From `/home/sai/Desktop/upex/web-apps/upex-my-mentor/.context/SRS/non-functional-specs.md`:

### Performance Requirements

**NFR-P-001: API Response Time < 500ms (p95)**

- **Target:** <500ms p95 percentile for payment endpoints
- **Endpoints to test:**
  - POST /api/checkout/session (Stripe API call involved)
  - GET /api/transactions (database query with pagination)
  - GET /api/payouts (database query with joins)
- **Test Approach:**
  - Load test with Artillery (100 concurrent users)
  - Measure p50, p95, p99 response times
  - Test with realistic data volume (1000+ transactions)
- **Tools:** Artillery, Datadog APM, Lighthouse (for frontend)
- **Pass Criteria:** p95 ≤500ms for all critical endpoints

**NFR-P-002: Payment Processing < 5 Seconds**

- **Target:** <5 seconds from "Pay Now" click to confirmation page (per epic AC)
- **Test Approach:**
  - E2E test: Measure time from POST /api/checkout/session → Stripe Checkout → payment → webhook → redirect to success_url
  - Includes: API call, Stripe Checkout load, payment processing, webhook delivery, database update
- **Tools:** Playwright (performance metrics), Chrome DevTools (Network tab)
- **Pass Criteria:** Total time ≤5 seconds for 90% of payments

**NFR-P-003: Database Query Performance**

- **Target:** <300ms for complex queries (transaction history with filters)
- **Test Approach:**
  - EXPLAIN ANALYZE on transaction history query
  - Test with 100, 500, 1000 transactions per user
  - Verify indexes are used (mentee_id, mentor_id, status, paid_at)
- **Tools:** PostgreSQL EXPLAIN, Supabase Dashboard
- **Pass Criteria:** Query execution time <300ms with 1000 transactions

---

### Security Requirements

**NFR-S-001: PCI Compliance (Stripe Handles Card Data)**

- **Requirement:** Platform NEVER stores, processes, or transmits raw card data
- **Test Approach:**
  - Verify Stripe Checkout is used (hosted by Stripe, not custom form)
  - Audit codebase: NO card number, CVV, expiry date fields in frontend or backend
  - Verify API keys are encrypted in environment variables (not hardcoded)
  - Check logs: Card data NEVER appears in logs, errors, or database
- **Tools:** Manual code review, log analysis, Stripe PCI compliance checklist
- **Pass Criteria:** Platform is PCI-compliant Level 4 (Stripe handles Level 1)

**NFR-S-002: Webhook Signature Verification**

- **Requirement:** All Stripe webhooks must verify HMAC signature before processing
- **Test Approach:**
  - POST /api/webhooks/stripe with valid signature → 200 OK, processed
  - POST /api/webhooks/stripe with invalid signature → 401 Unauthorized, rejected
  - POST /api/webhooks/stripe with missing signature → 401 Unauthorized
  - POST /api/webhooks/stripe with expired signature → 401 Unauthorized
- **Tools:** Manual testing, Stripe CLI (stripe trigger)
- **Pass Criteria:** 100% of webhook requests without valid signature are rejected

**NFR-S-003: HTTPS Only for All Communication**

- **Requirement:** All frontend-backend, backend-Stripe communication uses HTTPS/TLS 1.3
- **Test Approach:**
  - Verify all API calls use https:// protocol (in staging and production)
  - Attempt http:// request → auto-redirect to https or fail
  - Check TLS version in browser dev tools (should be TLS 1.3)
  - Verify Stripe API calls use HTTPS (Stripe SDK enforces this)
- **Tools:** Browser dev tools (Network tab), SSL Labs test, Qualys SSL Test
- **Pass Criteria:** All traffic encrypted, TLS 1.3, no http allowed, A+ rating on SSL Labs

**NFR-S-004: JWT Authentication for Payment Endpoints**

- **Requirement:** All payment endpoints require valid JWT token (except webhooks)
- **Test Approach:**
  - POST /api/checkout/session without Authorization header → 401 Unauthorized
  - POST /api/checkout/session with expired JWT → 401 Unauthorized
  - POST /api/checkout/session with invalid JWT signature → 401 Unauthorized
  - POST /api/checkout/session with valid JWT → 200 OK
- **Tools:** Postman, Playwright API
- **Pass Criteria:** Unauthenticated requests are blocked (100% coverage)

**NFR-S-005: Row Level Security (RLS) for Transactions**

- **Requirement:** Users can only view their own transactions (mentee payments, mentor earnings)
- **Test Approach:**
  - Mentee A queries GET /api/transactions → sees only their payments
  - Mentee A tries to query transactions for Mentee B → 0 results (RLS blocks)
  - Mentor queries GET /api/transactions → sees their earnings (net_amount)
  - Mentor queries GET /api/payouts → sees only their payouts
  - SQL injection attempts blocked by Supabase ORM
- **Tools:** Manual testing, SQL injection test suite (OWASP ZAP)
- **Pass Criteria:** Unauthorized access attempts are blocked (100%)

**NFR-S-006: API Key Protection**

- **Requirement:** Stripe secret keys NEVER exposed in frontend, logs, or error messages
- **Test Approach:**
  - Audit frontend code: NO secret_key references (only publishable_key)
  - Audit error messages: Stripe API errors don't leak secret_key
  - Audit logs: Secret keys redacted (show "sk_test_***" not full key)
  - Check environment variables: Secret keys stored in .env, not in code
- **Tools:** Code review, log analysis, GitHub secret scanning
- **Pass Criteria:** No secret keys exposed anywhere

---

### Reliability Requirements

**NFR-R-001: Payment Success Rate > 99%**

- **Requirement:** >99% of valid payment attempts succeed (excluding card declines)
- **Test Approach:**
  - Load test: 1000 payment attempts with valid test cards
  - Measure: Success rate (checkout.session.completed webhooks received)
  - Exclude: User errors (400), card declines (declined by Stripe)
  - Include: System errors (500), Stripe API failures
- **Tools:** Artillery, Datadog monitoring, Stripe Dashboard
- **Pass Criteria:** ≥99% success rate for valid payments

**NFR-R-002: Payout Delivery Success Rate > 95%**

- **Requirement:** >95% of payouts are delivered successfully (transfer.paid)
- **Test Approach:**
  - Monitor production payouts for first month
  - Measure: transfer.paid vs transfer.failed events
  - Exclude: Mentor bank account errors (not platform fault)
  - Include: Stripe Transfer API errors, platform bugs
- **Tools:** Stripe Dashboard, Datadog, reconciliation job
- **Pass Criteria:** ≥95% payout delivery rate

**NFR-R-003: Webhook Processing Success Rate > 99%**

- **Requirement:** >99% of webhooks are processed successfully (no 500 errors)
- **Test Approach:**
  - Monitor Stripe webhook delivery dashboard
  - Measure: 200 OK responses vs 500 errors
  - Test: Simulate 1000 webhook deliveries (Stripe CLI)
  - Verify: Retry logic works for failed webhooks
- **Tools:** Stripe Dashboard (webhook logs), application logs
- **Pass Criteria:** ≥99% webhook success rate

**NFR-R-004: Error Rate < 1% for Payment Endpoints**

- **Requirement:** <1% of payment API requests result in 5xx errors
- **Test Approach:**
  - Load test: 10,000 requests to POST /api/checkout/session
  - Measure: % of 5xx errors
  - Exclude: User errors (4xx)
  - Include: Database errors, Stripe API errors, application bugs
- **Tools:** Artillery, Datadog APM
- **Pass Criteria:** Error rate <1%

---

### Usability Requirements

**NFR-U-001: Clear Pricing Display**

- **Requirement:** Mentees see total cost BEFORE payment (no surprises)
- **Test Approach:**
  - Manual testing: Booking page shows mentor hourly_rate
  - Checkout page shows: "Total: $100.00"
  - Platform fee is NOT shown to mentees (included in price)
  - Receipt shows: "Total paid: $100.00"
- **Tools:** Manual testing, user testing
- **Pass Criteria:** 100% of users understand total cost before payment

**NFR-U-002: Clear Error Messages for Payment Failures**

- **Requirement:** Error messages are actionable and user-friendly (not technical)
- **Test Approach:**
  - Declined card → "Your card was declined. Please try a different payment method."
  - Stripe API error → "Payment system temporarily unavailable. Please try again in a few minutes."
  - Booking expired → "Your booking has expired. Please select a new time slot."
  - NOT: "StripeCardError: card_declined" (technical)
- **Tools:** Manual testing, user testing
- **Pass Criteria:** All error messages are clear, specific, actionable

**NFR-U-003: Payout Timeline Transparency**

- **Requirement:** Mentors understand when they'll receive payouts
- **Test Approach:**
  - Dashboard shows: "Payout will be sent 24 hours after session completion"
  - Email notification: "Your payout of $80 has been sent. It will arrive in your bank in 2-7 business days."
  - Payout history shows: scheduled_for and processed_at dates
- **Tools:** Manual testing, mentor user testing
- **Pass Criteria:** >90% of mentors correctly understand payout timeline

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

This epic introduces payment/payout functionality, which could affect:
- **EPIC-004 (Booking):** Booking status updates (draft → confirmed after payment)
- **EPIC-006 (Session Management):** Session completion triggers payout (future)
- **EPIC-002 (Auth):** JWT authentication for payment endpoints
- **All epics:** Transaction history affects dashboard displays

**Regression Test Execution:**

- **Before starting epic testing:**
  1. Run automated regression suite for EPIC-002, EPIC-004
  2. Verify baseline: Booking flow works (create draft booking, view calendar)
  3. Verify: User authentication still works (login, profile access)

- **After all stories complete:**
  1. Re-run regression suite
  2. Verify: Payment feature doesn't break existing features
  3. Focus areas:
     - Booking creation still works
     - Booking status transitions correctly (draft → confirmed)
     - User authentication still works (JWT for payment endpoints)
     - Dashboard loads correctly (with transaction history)

**Regression Test Cases:**

- **Booking Regression:**
  - [ ] Create draft booking → still works (no payment integration breaks this)
  - [ ] Draft booking → payment → booking.status='confirmed' (integration)
  - [ ] Booking expires after 15min if NOT paid (existing logic preserved)
  - [ ] Booking calendar shows "booked" slots correctly (after payment)

- **Auth Regression:**
  - [ ] Login → access payment endpoints (JWT works)
  - [ ] Logout → cannot access payment endpoints (401 Unauthorized)
  - [ ] JWT expiration → refresh token works

- **Dashboard Regression:**
  - [ ] Mentee dashboard shows transaction history (new feature)
  - [ ] Mentor dashboard shows earnings (new feature)
  - [ ] Dashboard loads <2.5s (performance not degraded by new queries)

**Tools:** Playwright E2E suite (automated), manual smoke testing

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** **3 sprints (6 weeks)**

**Breakdown:**

- **Test Case Design:** **5 days**
  - Story breakdown and test scenario identification (180 test cases)
  - Risk analysis and edge case identification
  - Test data requirements (Stripe test cards, webhooks)
  - Review and approval by QA Lead

- **Test Data Preparation:** **3 days**
  - Create data factories (bookings, transactions, payouts)
  - Seed staging database with test mentors/mentees
  - Configure Stripe test mode (API keys, webhooks, Connect)
  - Set up test email inbox (Mailtrap)
  - Configure Stripe CLI for webhook testing

- **Test Execution (per story):**
  - **MYM-24 (Student Payment):** **7 days** (52 test cases, HIGH complexity: Stripe Checkout, webhooks, idempotency)
  - **MYM-25 (Mentor Onboarding):** **5 days** (35 test cases, MEDIUM-HIGH complexity: Stripe Connect, AccountLinks)
  - **MYM-26 (Earnings Tracking):** **5 days** (38 test cases, MEDIUM complexity: query logic, RLS, pagination)
  - **MYM-27 (Automated Payouts):** **7 days** (55 test cases, HIGH complexity: scheduled job, Stripe Transfers, webhooks)
  - **Total:** **24 days** (4.8 weeks)

- **Regression Testing:** **3 days**
  - Run automated regression suite (EPIC-002, EPIC-004)
  - Manual smoke testing of booking → payment → session flow

- **Bug Fixing Cycles:** **7 days (buffer)**
  - Time for dev to fix bugs (financial bugs require careful fixes)
  - QA re-verification of fixes
  - Typically 3-4 fix cycles expected (payment systems are complex)

- **Exploratory Testing:** **3 days**
  - Ad-hoc testing with realistic scenarios (multiple payments, payout timing, edge cases)
  - UX evaluation (checkout flow, error messages, earnings dashboard)
  - Cross-browser testing (payment redirects, Stripe Checkout compatibility)

- **Performance & Security Testing:** **3 days**
  - Load testing (100 concurrent checkouts, API response times)
  - Security testing (webhook verification, PCI compliance, RLS)
  - Stripe production readiness review

- **Reconciliation & Financial Audit:** **2 days**
  - Verify commission calculations (20% across all transactions)
  - Test reconciliation job (paid-but-not-confirmed detection)
  - Admin dashboard testing (refunds, payout management)

**Total:** **50 days ≈ 10 weeks ≈ 3 sprints** (with 2 QA engineers in parallel)

**Critical Path:**
1. Test case design + data prep (must complete before execution)
2. Story testing (can partially overlap: MYM-24 → MYM-25 in parallel after MYM-24 basics pass)
3. Bug fixing (may extend timeline if critical financial bugs found)
4. Stripe production setup (blocked by Stripe approval process - can take 1-2 weeks)

**Dependencies:**

- **Depends on:**
  - EPIC-002 (Auth) completed and stable (JWT for payment endpoints)
  - EPIC-004 (Booking) completed and stable (draft bookings must exist)
  - Staging environment configured with Stripe test mode
  - Email service configured
  - Supabase database with required tables (migrations applied)

- **Blocks:**
  - EPIC-006 (Session Management) - Requires payment confirmation before session starts
  - Platform monetization - No revenue without this epic
  - Mentor payouts - Mentors cannot earn without this epic

**Risk Buffer:**
- **7 days buffer** included for:
  - Webhook debugging (timing issues, signature failures)
  - Stripe API edge cases (rate limits, API changes)
  - Commission calculation bugs (financial accuracy is critical)
  - Payout scheduling issues (24h grace period, job timing)
  - Reconciliation complexity (matching Stripe events with database state)

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- **E2E Testing:** Playwright
  - Browser automation for checkout flow
  - Stripe Checkout interaction (redirect, payment, success/cancel)
  - Cross-browser testing (Chromium, Firefox, WebKit)
  - Video recording of payment failures

- **API Testing:** Postman + Newman (or Playwright API)
  - API contract validation (api-contracts.yaml)
  - Webhook simulation (POST /api/webhooks/stripe)
  - Request/response schema validation
  - Authentication testing (JWT)

- **Unit Testing:** Vitest (frontend), Jest (backend)
  - Commission calculation functions
  - Idempotency logic
  - Payout eligibility queries
  - Validation functions

- **Stripe Testing:** Stripe CLI
  - Webhook forwarding: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - Webhook triggering: `stripe trigger checkout.session.completed`
  - Event replay: Replay production events in staging
  - Logs: View webhook delivery logs

- **Performance Testing:** Artillery, Lighthouse
  - Load testing: 100 concurrent checkouts
  - API response time validation
  - Checkout page load time

- **Security Testing:** OWASP ZAP (optional), manual testing
  - Webhook signature verification
  - SQL injection prevention
  - API key protection audit
  - PCI compliance checklist

- **Email Testing:** Mailtrap, Mailhog, or Resend test mode
  - Capture confirmation emails
  - Capture payout notification emails
  - Verify receipt content

- **Test Data:** Faker.js, Stripe test cards
  - Realistic user data (names, emails)
  - Data factories for bookings, transactions
  - Stripe test cards (4242, 9995, etc.)

**CI/CD Integration:**

- [ ] **Tests run automatically on PR creation**
  - Unit tests (Vitest, Jest)
  - API contract validation
  - Linting and type checking

- [ ] **Tests run on merge to main branch**
  - Unit tests
  - Integration tests (API, mocked Stripe)
  - Critical E2E tests (payment happy path)

- [ ] **Tests run on deployment to staging**
  - Full E2E test suite (payment, onboarding, payout)
  - Performance tests (load testing, response times)
  - Security tests (webhook verification)
  - Smoke tests (verify deployment successful)

- [ ] **Smoke tests run on deployment to production**
  - Read-only verification (transaction history loads)
  - Stripe health check (API keys valid)
  - Webhook endpoint health check
  - Dashboard loads (earnings, transactions)

**Test Management:**

- **Jira Xray** (or similar):
  - Test cases linked to user stories (MYM-24, MYM-25, MYM-26, MYM-27)
  - Test execution tracking (pass/fail status)
  - Bug tracking linked to test cases
  - Test execution reports per sprint

- **Test Coverage Dashboard:**
  - Code coverage from unit tests (>95% goal for payment logic)
  - API endpoint coverage (100% for payment endpoints)
  - E2E scenario coverage (critical journeys)

- **Stripe Dashboard:**
  - Monitor payment success rate
  - Monitor payout delivery rate
  - Monitor webhook delivery rate
  - Review failed payments/payouts

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- **Test Execution Metrics:**
  - Test cases executed vs. total (target: 100%)
  - Test pass rate (target: >95% before story completion)
  - Test execution time (optimize CI/CD pipeline)

- **Bug Metrics:**
  - Bugs found per story (track quality of implementation)
  - Bug severity distribution (Critical, High, Medium, Low)
  - Bug fix rate (target: Critical/High bugs fixed within 1 day for payment issues)
  - Financial bugs (commission errors, payout errors) tracked separately (zero tolerance)

- **Test Coverage Metrics:**
  - Unit test code coverage (target: >95% for payment/payout logic)
  - API endpoint coverage (target: 100% for payment endpoints)
  - User journey coverage (target: 100% of critical payment/payout flows)

- **Business Metrics (Monitor in Production):**
  - Payment success rate (target: >99%)
  - Payout delivery success rate (target: >95%)
  - GMV (Gross Merchandise Value) - track toward $5,000 first month goal
  - Net revenue (20% commission) - track toward $1,000 first month goal
  - Chargeback rate (target: <0.65%)
  - Dispute rate (target: <1%)

- **Performance Metrics:**
  - Checkout session creation time (target: <500ms p95)
  - Transaction history API response time (target: <500ms p95)
  - Payout job execution time (target: <5min for 100 sessions)
  - Webhook processing time (target: <1s)

**Reporting Cadence:**

- **Daily:**
  - Test execution status (test cases run, passed, failed, blocked)
  - Bugs found and fixed today
  - Blockers or risks identified
  - Payment/payout metrics (if in staging with realistic load)

- **Per Story:**
  - Story test completion report (all test cases executed, pass rate)
  - Story bug summary (total found, severity, status)
  - Financial accuracy validation (commission calculations correct)
  - Story exit criteria checklist (ready to close or not)

- **Per Epic:**
  - Comprehensive QA sign-off report:
    - Total test cases executed: 180
    - Pass rate: >95%
    - Bug summary: X critical (0), Y high (0), Z medium (all resolved or mitigated)
    - Payment success rate: >99%
    - Payout delivery rate: >95%
    - Performance validation results (all endpoints <500ms)
    - Security testing results (PCI compliance, webhook verification)
    - Regression test results (no regressions)
    - Risk mitigation summary (all critical risks addressed)
    - Known issues (if any medium/low bugs remain)
    - Recommendation: **Approved for production** / Needs more work

**Report Recipients:**
- **PO:** Epic-level report (business metrics, GMV, revenue, risks)
- **Dev Lead:** Daily + story-level reports (technical issues, Stripe integration, bugs)
- **QA Team:** Daily standups (test execution progress, blockers)
- **Finance/Ops:** Business metrics (GMV, commission, payout success rate)
- **Stakeholders:** Epic-level report (go/no-go decision for monetization)

---

## 🎓 Notes & Assumptions

**Assumptions:**

1. **Stripe is the ONLY payment processor for MVP:** No alternative payment methods (PayPal, crypto, etc.)
2. **MVP is USD-only:** Multi-currency support is out of scope (future enhancement)
3. **20% commission is FIXED:** No dynamic commission rates per mentor (future)
4. **Per-session payouts:** Each completed session results in separate payout 24h later (not batched weekly/monthly)
5. **Stripe Connect Express accounts:** Mentors use Express (not Standard or Custom) for simplicity
6. **24-hour payout hold is MANDATORY:** Grace period for chargebacks/cancellations (business rule)
7. **Refund policy:** Linked to EPIC-006 (Session Management) - 24h cancellation window
8. **Email service is reliable:** Using Resend or Supabase Email with >95% delivery rate
9. **Stripe production approval:** May take 1-2 weeks (compliance review by Stripe)
10. **PCI compliance:** Platform is Level 4 (Stripe is Level 1) - platform never handles card data

**Constraints:**

- **Time:** 3 sprints (6 weeks) is realistic but tight for 180 test cases + financial accuracy validation
- **Resources:** QA team size (assume 2 QA engineers); may need dev support for Stripe webhook debugging
- **Tools:** Limited to tools already in stack (Playwright, Vitest, Postman, Stripe CLI)
- **Environment:** Staging must be stable; Stripe test mode required (no production testing before approval)
- **Financial accuracy:** ZERO tolerance for commission calculation errors (every bug is critical)

**Known Limitations:**

- **Cannot fully test Stripe production environment:** Limited to test mode until Stripe approves production access
- **Cannot test all card types:** Stripe test mode supports limited card brands (Visa, Mastercard, Amex); edge cases (international cards, prepaid cards) may have issues in production
- **Cannot simulate real bank transfers:** Stripe test mode auto-completes transfers; real-world delays (2-7 days) not testable
- **Cannot test extreme load:** Staging environment limited to 100 concurrent users; production monitoring required for higher load
- **Webhook timing edge cases:** Difficult to simulate exact timing (e.g., webhook arrives exactly at 15min expiration); rely on automated tests + production monitoring

**Exploratory Testing Sessions:**

Recommended: **2 exploratory testing sessions** BEFORE implementation

**Session 1: Payment UX Exploration (2 hours)**
- **Objective:** Identify confusing checkout flow, unclear pricing, payment errors
- **Approach:**
  - Use Figma mockups/prototypes of checkout page
  - Test with 3 users (mentees): Laura, Sofía, and 1 external tester
  - Ask: "How much will you pay?" "What happens if payment fails?" "Do you trust this checkout?"
  - Measure: Comprehension rate, time to complete payment, trust level
- **Output:** UX improvements for checkout flow (feed into Improvement 3, 4)

**Session 2: Payout Flow Edge Cases (2 hours)**
- **Objective:** Discover unexpected payout scenarios or reconciliation issues
- **Approach:**
  - Real mentor + admin (internal team members)
  - Complete session → wait for payout (fast-forward clock in test)
  - Try various scenarios: multiple sessions, failed payout, missing bank account
  - Check reconciliation: Does admin dashboard show correct earnings?
- **Output:** New test cases, bug reports, reconciliation improvements (feed into Improvement 8)

---

## 📎 Related Documentation

- **Epic:** `/home/sai/Desktop/upex/web-apps/upex-my-mentor/.context/PBI/epics/EPIC-MYM-23-payments-payouts/epic.md`
- **User Stories:** (within epic.md)
  - MYM-24: Student Payment (Stripe Checkout)
  - MYM-25: Mentor Stripe Connect Onboarding
  - MYM-26: Earnings Tracking (Transaction History)
  - MYM-27: Automated Payouts
- **Business Model:** `.context/idea/business-model.md`
- **PRD:**
  - `.context/PRD/executive-summary.md` (GMV, revenue targets)
  - `.context/PRD/user-personas.md` (Laura, Carlos)
  - `.context/PRD/user-journeys.md` (payment journey, payout journey)
- **SRS:**
  - `.context/SRS/functional-specs.md` (FR-016, FR-017, FR-018)
  - `.context/SRS/non-functional-specs.md` (NFR-002 Security, NFR-001 Performance, NFR-007 Reliability)
  - `.context/SRS/architecture-specs.md` (Database schema, Stripe integration)
  - `.context/SRS/api-contracts.yaml` (Payment endpoints)
- **Dependencies:**
  - EPIC-002 (User Authentication) - JWT for payment endpoints
  - EPIC-004 (Scheduling & Booking) - Draft bookings for payment
  - EPIC-006 (Session Management) - Session completion triggers payout (future)
- **Stripe Documentation:**
  - Stripe Checkout: https://stripe.com/docs/payments/checkout
  - Stripe Connect: https://stripe.com/docs/connect
  - Stripe Webhooks: https://stripe.com/docs/webhooks
  - Stripe Test Cards: https://stripe.com/docs/testing

---

**End of Feature Test Plan**

---

**Next Steps:**
1. **QA Lead:** Review this test plan and validate test case estimates (180 cases realistic?)
2. **PO:** Answer critical questions in "Critical Analysis" section (7 ambiguities identified)
3. **Dev Lead:** Validate technical risks and Stripe integration architecture
4. **Finance/Ops:** Review commission calculations, payout timeline, reconciliation requirements
5. **Team:** Schedule refinement session to discuss:
   - Refund policy (linked to EPIC-006)
   - Currency support (USD-only for MVP confirmed?)
   - Payout frequency (per-session vs batched)
   - Admin capabilities (refunds, reconciliation dashboard)
6. **QA:** Begin test case design for MYM-24 (first story: Student Payment)
7. **DevOps:** Configure Stripe test mode in staging (API keys, webhooks, Connect)

**Risk Alerts:**
- ⚠️ **Stripe production approval may take 1-2 weeks** - start early!
- ⚠️ **Financial bugs have ZERO tolerance** - extra care in testing commission calculations
- ⚠️ **Webhook failures are HIGH risk** - extensive testing of idempotency and retry logic required
- ⚠️ **This epic BLOCKS platform monetization** - quality cannot be compromised

**Generated with Shift-Left Testing principles:** Analyze early, test early, prevent bugs before code is written.

---

## ✅ CEO DECISIONS - CRITICAL QUESTIONS RESOLVED

**Date:** 2025-11-11
**Decision Maker:** CEO/Product Lead
**Status:** All 7 critical questions RESOLVED - Epic UNBLOCKED for implementation

---

### Decision Summary Table

| # | Question | Decision | Impact | Status |
|---|----------|----------|--------|--------|
| Q1 | Payment expiration edge case | Auto-refund + 30min reservation | User safety, prevent overbooking | ✅ RESOLVED |
| Q2 | Refund fee allocation | Platform absorbs Stripe fees (~3%) | Reduces margin to 17% on refunds | ✅ RESOLVED |
| Q3 | Currency support | USD-only for MVP | Simplicity, covers 95% users | ✅ RESOLVED |
| Q4 | Payout timing clarity | Initiated 24h, arrives 2-7 days | Transparency, sets expectations | ✅ RESOLVED |
| Q5 | Payment retry limits | 3 attempts in 30min, preserve booking | Balance UX with fairness | ✅ RESOLVED |
| Q6 | Reconciliation process | Daily automated + admin dashboard | Operational excellence | ✅ RESOLVED |
| Q7 | Payment methods | Cards only (Stripe Checkout) | Covers 95% users, MVP simplicity | ✅ RESOLVED |

---

### Implementation Changes Based on Decisions

**Updated Scope:**

1. **Booking Reservation Logic:**
   - BEFORE: 15-minute reservation window
   - AFTER: 30-minute reservation when Stripe Checkout Session created
   - Rationale: Minimize payment expiration edge cases (Q1)

2. **Refund Policy:**
   - BEFORE: Ambiguous (who pays Stripe fee?)
   - AFTER: Mentee receives 100% refund, platform absorbs ~3% Stripe fee
   - Rationale: Customer-first approach builds trust (Q2)
   - Financial Impact: 0.4% margin reduction at 2% refund rate

3. **Currency Support:**
   - BEFORE: Unclear if multi-currency supported
   - AFTER: USD-only hardcoded for MVP
   - Rationale: Simplicity, avoids FX complexity (Q3)
   - V2 Roadmap: Multi-currency based on user demand

4. **Payout Messaging:**
   - BEFORE: "Payout 24h after completion" (ambiguous)
   - AFTER: "Payout initiated 24h after completion. Funds arrive in 2-7 business days."
   - Rationale: Transparency > false promises (Q4)

5. **Payment Retry Flow:**
   - NEW FEATURE: "Try Again" button after payment failure
   - Max 3 retry attempts within 30-minute window
   - SAME booking_id preserved across retries
   - Rationale: Balance UX with fairness (Q5)

6. **Reconciliation System:**
   - NEW FEATURE: Daily automated job (2am UTC)
   - NEW FEATURE: Admin reconciliation dashboard (/admin/reconciliation)
   - Rationale: Defense in depth, operational excellence (Q6)

7. **Payment Methods:**
   - BEFORE: Unclear if ACH/PayPal/crypto supported
   - AFTER: Cards only (Visa, MC, Amex, Discover) via Stripe Checkout
   - Rationale: Covers 95% users, MVP simplicity (Q7)
   - V2 Roadmap: Apple Pay, ACH based on demand

---

### Ambiguities Resolution

**Original Ambiguities Identified:**

1. ~~What happens if payment succeeds but booking expired?~~ 
   - **✅ RESOLVED:** Auto-refund + 30min reservation extension (Q1)

2. ~~How are refunds processed? Who pays Stripe fees?~~ 
   - **✅ RESOLVED:** Platform absorbs fees, mentee receives 100% (Q2)

3. ~~What currency is supported?~~ 
   - **✅ RESOLVED:** USD-only for MVP (Q3)

4. ~~How to handle failed payouts?~~ 
   - **✅ RESOLVED:** Daily reconciliation job + admin dashboard (Q6)

5. ~~What is exact payout timing?~~ 
   - **✅ RESOLVED:** Initiated 24h after, arrives 2-7 days (Q4)

6. ~~Reconciliation process if webhook never arrives?~~ 
   - **✅ RESOLVED:** Daily automated job catches discrepancies (Q6)

7. ~~Payment methods saved for repeat bookings?~~ 
   - **✅ RESOLVED:** No saved methods for MVP, cards-only (Q7)

**All original ambiguities have been resolved. No blockers remain for implementation.**

---

### Missing Information - Now Provided

**Original Missing Information:**

1. ~~Min/max transaction amounts~~ 
   - **✅ PROVIDED:** $1 minimum (Stripe limit), $10,000 maximum (validation)

2. ~~Payment method types~~ 
   - **✅ PROVIDED:** Cards only (Visa, MC, Amex, Discover) - Q7

3. ~~Receipt generation format~~ 
   - **Addressed in Q2 decision:** Email receipt shows "Full refund: $100.00 (processing fees waived)"

4. ~~Tax handling~~ 
   - **Clarified:** Out of scope for MVP. Mentors responsible for tax reporting. Platform may issue 1099-K for >$600/year (future).

5. ~~Payout frequency~~ 
   - **✅ PROVIDED:** Per-session payout (24h after each session completion) - Q4

6. ~~Transaction history pagination/filters~~ 
   - **Spec:** 50 transactions/page, sort by created_at DESC, filters: status, date range

7. ~~Error message catalog~~ 
   - **Examples provided:** "Payment declined. Try another card." / "Booking expired after 3 attempts."

8. ~~Admin capabilities~~ 
   - **✅ PROVIDED:** Admin reconciliation dashboard with manual actions - Q6

**All critical missing information has been provided.**

---

### Test Plan Updates Required

**Test Cases to ADD (based on decisions):**

**Q1 (Payment Expiration):**
- [ ] Payment succeeds at minute 29 → booking confirmed
- [ ] Payment succeeds at minute 31 → auto-refund triggered
- [ ] booking.reservation_expires_at extended to 30min when Checkout Session created

**Q2 (Refund Fees):**
- [ ] Refund processed → mentee receives 100% of amount paid
- [ ] transactions.platform_fee_absorbed = TRUE after refund
- [ ] Email shows "Full refund: $100.00 (processing fees waived)"

**Q3 (Currency):**
- [ ] POST /api/checkout/session with currency='eur' → 400 Bad Request
- [ ] All transactions in database have currency='usd'
- [ ] Frontend displays "$100/hour" (USD symbol)

**Q4 (Payout Timing):**
- [ ] Session completed Nov 15 10:00 → payout job runs Nov 16 11:00+ (first hourly run after 24h)
- [ ] Email sent when payout created shows "Expect funds in 2-7 business days"
- [ ] Dashboard shows "Sent: Nov 18" not "Arriving: Nov 18"

**Q5 (Payment Retry):**
- [ ] 1st payment fails, 2nd succeeds → booking confirmed (SAME booking_id)
- [ ] 3 payments fail → booking expires, slot released
- [ ] payment_retry_count increments correctly (0 → 1 → 2 → 3)

**Q6 (Reconciliation):**
- [ ] Daily reconciliation job runs at 2am UTC
- [ ] Webhook fails, reconciliation creates transaction 24h later
- [ ] Admin dashboard shows missing payouts, stuck payouts
- [ ] Admin can manually trigger payout from dashboard

**Q7 (Payment Methods):**
- [ ] Stripe Checkout created with payment_method_types=['card']
- [ ] Payment succeeds with Visa (4242...)
- [ ] Payment succeeds with Mastercard (5555...)
- [ ] Payment succeeds with Amex (3782...)

**Test Cases to REMOVE (out of scope for MVP):**
- [ ] Multi-currency payment tests (EUR, GBP, MXN)
- [ ] ACH Direct Debit tests
- [ ] PayPal payment tests
- [ ] Crypto payment tests
- [ ] Apple Pay / Google Pay tests

**Updated Total Test Case Estimate:** 180 → **195 test cases** (+15 from decision implementations)

---

### Updated Entry/Exit Criteria

**Entry Criteria (ALL MET - Implementation can proceed):**

✅ All Priority 1 BLOCKER questions resolved (Q1, Q2, Q3)
✅ All Priority 2 questions resolved (Q4, Q5, Q6, Q7)
✅ Ambiguities clarified and documented
✅ Missing information provided
✅ Test plan updated to reflect decisions
✅ Dev team briefed on implementation changes

**Exit Criteria (Updated):**

- [ ] All 195 test cases executed and passed (>95% pass rate)
- [ ] Critical/High bugs resolved (0 open critical bugs)
- [ ] Non-Functional Requirements validated:
  - [ ] Payment success rate >99% (excluding card declines)
  - [ ] Payout delivery success rate >95%
  - [ ] Refund rate <2%
  - [ ] Payment expiration edge cases <0.1%
  - [ ] Reconciliation job success rate 100%
  - [ ] Webhook delivery rate >99%
- [ ] 30min reservation logic working correctly
- [ ] Platform absorbing refund fees (financial tracking accurate)
- [ ] USD-only validation working (non-USD rejected)
- [ ] Payment retry flow (max 3 attempts) working
- [ ] Reconciliation job running daily at 2am UTC
- [ ] Admin dashboard accessible and functional
- [ ] Cards-only Stripe Checkout working (Visa, MC, Amex)
- [ ] All email templates updated (refund, payout timing)

---

### Financial Model Update

**Impact of Q2 Decision (Platform Absorbs Refund Fees):**

**100 sessions/month, 2% refund rate:**
- Total GMV: $10,000
- Platform Commission: $2,000 (20%)
- Stripe Fees on Payments: $320 (3.2%)
- **Platform Net (no refunds): $1,680 (16.8%)**

**With Refunds (2 sessions):**
- Refund to users: $200
- Stripe refunds platform: $193.60 (Stripe keeps $6.40)
- Platform absorbs: $6.40
- **Adjusted Net Revenue: $1,673.60 (16.7%)**
- **Cost of customer-first policy: $6.40/month (0.4% margin reduction)**

**Acceptable cost for building trust in MVP phase.**

---

### Next Steps

**@Dev Team - Implementation Checklist:**
- [ ] Update booking reservation logic (15min → 30min when Checkout Session created)
- [ ] Implement auto-refund for expired bookings (payment success after 30min)
- [ ] Set refund amount = 100% (platform absorbs Stripe fees)
- [ ] Add database field: transactions.platform_fee_absorbed BOOLEAN
- [ ] Hardcode currency='usd' in all payment flows
- [ ] Add input validation: reject non-USD payments (400 Bad Request)
- [ ] Implement payment retry logic (max 3, preserve booking_id)
- [ ] Add database field: bookings.payment_retry_count INT
- [ ] Create reconciliation job (daily 2am UTC)
- [ ] Build admin reconciliation dashboard (/admin/reconciliation)
- [ ] Set Stripe Checkout: payment_method_types=['card']
- [ ] Update email templates (refund, payout timing, retry expiration)
- [ ] Update dashboard messaging (payout timing: "Sent Nov 18, arrives 2-7 days")

**@QA Team - Test Plan Updates:**
- [ ] Add 15 new test cases (from decisions above)
- [ ] Remove out-of-scope tests (multi-currency, ACH, PayPal, crypto)
- [ ] Update test data (all transactions in USD)
- [ ] Test Stripe test cards (Visa 4242..., MC 5555..., Amex 3782...)
- [ ] Test payment retry flow (max 3 attempts)
- [ ] Test reconciliation job (schedule, auto-fix, admin dashboard)

**@Product Team - Messaging Updates:**
- [ ] Update payout messaging: "Payout sent in 24h, arrives 2-7 days"
- [ ] Design refund email: emphasize "Full refund: $100 (fees waived)"
- [ ] Design payment retry page: "Try Again" button, attempt counter
- [ ] Add to checkout page: "We accept Visa, Mastercard, Amex, Discover"
- [ ] FAQ entry: "Do you support PayPal/ACH? Coming in V2 based on demand."

---

### Documentation References

**Complete CEO Decision Rationale:**
`.context/PBI/epics/EPIC-MYM-23-payments-payouts/decisions.md` (31 KB, comprehensive analysis)

**Jira Epic MYM-23:**
- Updated with QA Test Strategy section ✅
- CEO Decision Log comment added ✅
- Labels: `test-plan-ready`, `critical-risks-identified`, `shift-left-analysis` ✅

**Status:** ✅ **EPIC UNBLOCKED - READY FOR IMPLEMENTATION**

---

**Last Updated:** 2025-11-11
**Updated By:** CEO/Product Lead + QA Lead (Shift-Left Analysis)
**Version:** 2.0 (includes CEO decisions)
