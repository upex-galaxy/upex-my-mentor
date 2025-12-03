# CEO Decision Log - EPIC MYM-23: Payments & Payouts

**Date:** 2025-11-11
**Decision Maker:** CEO/Product Lead
**Context:** Resolving 7 critical questions (blockers) identified during Shift-Left QA analysis
**Status:** ✅ ALL RESOLVED - Implementation unblocked

---

## Executive Summary

All 7 critical questions for EPIC MYM-23 (Payments & Payouts) have been resolved through CEO-level strategic decision-making. Decisions prioritize:

1. **User trust & safety** (refund 100%, auto-refund edge cases)
2. **MVP simplicity** (USD-only, cards-only)
3. **Transparency** (clear payout timing, 24h + 2-7 days)
4. **Operational excellence** (automated reconciliation, admin dashboard)
5. **User experience** (3 payment retries, preserve booking)

**Financial Impact:**
- Platform absorbs ~3% Stripe fees on refunds (customer-first approach)
- Target <2% refund rate minimizes financial impact
- Net margin on refunds: 17% (down from 20%)

**Technical Scope Changes:**
- Booking reservation: 15min → 30min (when payment initiated)
- Payment retry: Max 3 attempts in 30min window
- Reconciliation: Daily automated job at 2am UTC + admin dashboard
- Currency: USD-only hardcoded for MVP
- Payment methods: Cards only (Visa, MC, Amex, Discover)

---

## Decision Matrix

| # | Question | Decision | Impact | Priority |
|---|----------|----------|--------|----------|
| Q1 | Payment expiration edge case | Auto-refund + 30min reservation extension | User safety, prevent overbooking | P1 BLOCKER ✅ |
| Q2 | Refund fee allocation | Platform absorbs Stripe fees (~3%) | Reduces margin 20%→17% on refunds | P1 BLOCKER ✅ |
| Q3 | Currency support | USD-only for MVP | Simplicity, covers target markets | P1 BLOCKER ✅ |
| Q4 | Payout timing clarity | Initiated 24h, arrives 2-7 days | Transparency, sets expectations | P2 ✅ |
| Q5 | Payment retry limits | 3 attempts in 30min, preserve booking | Balance UX with fairness | P2 ✅ |
| Q6 | Reconciliation process | Daily automated + admin dashboard | Operational excellence, reliability | P2 ✅ |
| Q7 | Payment methods | Cards only (Stripe Checkout) | Simplicity, covers 95% users | P2 ✅ |

---

## Detailed Decision Rationale

### Q1: Payment Expiration Edge Case ✅

**Question:** If payment succeeds but booking expired (>15min), what happens?

**Options Considered:**
- **Option A:** Auto-refund + email ✅ **SELECTED**
- **Option B:** Auto-rebook if slot available ⚠️ Complex, slot may be taken
- **Option C:** Create booking anyway ❌ Overbooking risk, unfair to mentor

**DECISION:** Auto-refund + extend reservation to 30 minutes

**Implementation Details:**
```
Booking Reservation Logic:
- Default reservation: 15 minutes
- When Stripe Checkout Session created: EXTEND to 30 minutes
- Database: booking.reservation_expires_at = NOW() + 30 minutes
- Database: booking.reservation_extended = TRUE (flag for tracking)

Edge Case Handling (payment succeeds but booking expired):
- Webhook receives checkout.session.completed
- Query booking by booking_id from metadata
- IF booking.reservation_expires_at < NOW():
    - Trigger full refund via Stripe API (Refund.create)
    - Send email: "Your booking expired during payment. Fully refunded."
    - Log incident in webhook_logs with severity=WARNING
    - Monitor rate: Should be <0.1% (rare with 30min window)
- ELSE:
    - Proceed normal flow (confirm booking, create transaction)
```

**Rationale:**
1. **User Safety First:** NEVER take money without providing service. Zero tolerance for financial bugs.
2. **30min Extension:** Stripe Checkout typically completes in <5 minutes. 30min window gives ample time for slow networks, user hesitation, 3D Secure flows. Edge case should be extremely rare (<0.1% of payments).
3. **Auto-Refund:** No manual intervention required. System self-heals. User gets money back immediately.
4. **Clear Communication:** Email explains what happened, instructs to re-book. Prevents support tickets.
5. **No Overbooking:** Option C would allow double-booking if slot was taken by another user during payment. Unfair to mentor.

**Business Impact:**
- Stripe charges refund fee (~$0.30 + 2.9%) which platform absorbs (per Q2 decision)
- Cost of edge case: <$5/month if 0.1% of 100 transactions
- Benefit: Zero user complaints about money taken without service

**Test Cases to Add:**
- Payment succeeds at minute 29 → booking confirmed ✅
- Payment succeeds at minute 31 → auto-refund triggered, email sent ✅
- Monitor webhook_logs for expired booking incidents (should be rare)

---

### Q2: Refund Fee Allocation ✅

**Question:** Session cancelled → mentee gets refund, but Stripe charges ~3% non-refundable fee. Who pays?

**Options Considered:**
- **Option A:** Platform absorbs fee ✅ **SELECTED** (CEO chose this)
- **Option B:** Mentee pays fee (refund = 100% - 3%) ⚠️ Poor UX
- **Option C:** Mentor pays fee ❌ Unfair, mentor did nothing wrong

**DECISION:** Platform absorbs Stripe fees (~3%)

**Financial Model:**

**Normal Transaction (no refund):**
```
Session price: $100
Platform commission: $20 (20%)
Stripe payment fee: $3.20 (2.9% + $0.30)
Mentor payout (24h later): $80
Platform net revenue: $20 - $3.20 = $16.80 (16.8% net margin)
```

**Refunded Transaction (Option A - Platform absorbs):**
```
Session price: $100
Platform commission: $20 (collected but refunded)
Stripe payment fee: $3.20 (NON-REFUNDABLE)
Refund to mentee: $100 (100%)
Stripe refunds platform: $100 - $3.20 = $96.80
Platform net loss: -$3.20 (absorbed Stripe fee)
Mentor: $0 (session didn't happen)
```

**Refunded Transaction (Option B - Mentee pays - NOT SELECTED):**
```
Refund to mentee: $96.80 (100% - 3.2% Stripe fee)
Platform net: $0 (breaks even)
User Experience: Poor - "Why didn't I get full refund?"
```

**Implementation Details:**
```
Refund Logic:
- User cancels session >24h before start (per refund policy)
- Platform issues full refund via Stripe API:
  - Refund.create(payment_intent_id, amount=FULL_AMOUNT)
- Stripe refunds: $100 - $3.20 = $96.80 to platform
- Platform receives $96.80 but refunded $100 to user
- Net cost to platform: $3.20

Database Tracking:
- transactions.status = 'refunded'
- transactions.platform_fee_absorbed = TRUE
- transactions.refund_amount = 100.00
- transactions.stripe_fee_absorbed = 3.20

Receipt/Email:
- "Full refund: $100.00 (processing fees waived by Upex My Mentor)"
```

**Rationale:**
1. **Customer-First Philosophy:** In MVP, trust is MORE valuable than 3% margin. Laura sees "100% refund" → trusts platform → books again.
2. **Competitive Advantage:** Most marketplaces charge cancellation fees. 100% refund = differentiation.
3. **Acceptable Cost:** Target <2% refund rate. If 100 sessions/month, 2 refunds = $6.40 monthly cost. Trivial compared to user acquisition cost ($50-100/user).
4. **Mitigated Risk:**
   - 24h cancellation policy (no refunds <24h before session)
   - Monitor refund abuse (>20% refund rate per user = flag + investigation)
   - Penalty for late cancellations (no refund <24h)
5. **Long-term:** V2 can re-evaluate if refund rate exceeds 5% or abuse detected.

**Business Impact:**
- **Best case (2% refund rate):** 2 refunds/100 sessions = $6.40/month cost
- **Worst case (10% refund rate):** 10 refunds/100 sessions = $32/month cost
- **Mitigation:** Enforce 24h policy strictly, monitor abuse, penalize serial refunders

**Alternative Considered (Option B):**
- Mentee pays Stripe fee (refund $96.80 instead of $100)
- **Pros:** Platform breaks even on refunds
- **Cons:** Poor UX, requires explanation ("Why less?"), support tickets, negative reviews ("Hidden fees")
- **Why rejected:** Trust loss > $3.20 savings

**Test Cases to Add:**
- Refund processed → mentee receives 100% of original payment ✅
- Database: transactions.platform_fee_absorbed = TRUE ✅
- Email shows: "Full refund: $100.00 (processing fees waived)" ✅
- Admin financial report: Shows absorbed fees per refund ✅
- User with >20% refund rate flagged for review ✅

---

### Q3: Currency Support ✅

**Question:** USD-only or multi-currency for MVP?

**Options Considered:**
- **Option A:** USD-only ✅ **SELECTED**
- **Option B:** Multi-currency (EUR, GBP, MXN, ARS, etc.) ⚠️ Complex

**DECISION:** USD-only for MVP

**Implementation Details:**
```
Hardcoded Currency:
- All Stripe Checkout Sessions: currency='usd'
- All Stripe Transfers (payouts): currency='usd'
- Database: transactions.currency = 'usd' (default, NOT NULL)
- Frontend: Display all prices with "$" symbol
- API validation: Reject non-USD requests (400 Bad Request)

Mentor Onboarding:
- Stripe Connect supports USD globally
- Mentor can receive USD in local bank account
- Stripe handles currency conversion (if bank account is non-USD)
- Example: Carlos (Spain, EUR bank) receives €90 for $100 payout (Stripe converts)

Error Handling:
- POST /api/checkout/session with currency='eur' → 400 Bad Request
- Error message: "Only USD is supported. Please contact support for multi-currency."
```

**Rationale:**
1. **MVP Principle:** Simplicity > Flexibility. Ship fast, iterate based on real demand.
2. **Target Market Coverage:**
   - Laura (Mexico): Comfortable with USD (common in online payments)
   - Carlos (Spain): Tech professionals accustomed to USD for freelance/consulting
   - Sofía (Argentina): USD widely used for digital services
   - US mentors/students: Native USD
3. **Avoids Complexity:**
   - **FX Rate Fluctuations:** Mentee books in EUR, but payout in USD → who bears FX risk?
   - **Commission Calculations:** 20% of €100 = €20, but if converted to USD at booking vs payout, rates differ
   - **Rounding Errors:** Converting $99.99 → EUR → back to USD may result in $99.97 (data integrity issues)
   - **Display:** Mentee sees €100, mentor sees $115, transaction history shows both? Confusing.
4. **Stripe Global Support:** Stripe handles USD→local currency conversion for mentor payouts automatically. Mentors with EUR/GBP/MXN bank accounts CAN receive USD (Stripe converts).
5. **Low Demand Validation:** MVP will test if non-USD is a real blocker. If 10% of users request EUR/GBP, add in V2.

**V2 Roadmap (Multi-Currency):**
```
Phase 2 (based on demand):
- Mentors set rates in preferred currency (EUR, GBP, MXN, ARS, USD)
- Platform displays prices in mentee's currency (browser detection or manual selection)
- Stripe Checkout uses mentee's currency for payment
- Commission calculated in transaction currency
- Payout to mentor in MENTOR'S currency (not transaction currency)
- FX rate locked at booking time (Stripe handles)
- Database: transactions.currency, transactions.fx_rate, mentor_profiles.currency
```

**Business Impact:**
- **MVP:** 95%+ users covered (tech community comfortable with USD)
- **V2:** Unlock international markets (Brazil, India, non-USD EU) if demand exists
- **Cost:** Multi-currency adds 2-3 weeks dev time. Not justified for MVP.

**Alternative Considered (Option B - Multi-Currency MVP):**
- **Pros:** Broader market coverage, localized pricing
- **Cons:**
  - FX risk (who absorbs rate changes between booking and payout?)
  - Complexity in commission calculations
  - Rounding/precision errors
  - Longer dev time (2-3 weeks)
  - Not validated as real user need yet
- **Why rejected:** Premature optimization. Ship USD MVP, add currencies if users actually request.

**Test Cases to Add:**
- POST /api/checkout/session with currency='eur' → 400 Bad Request ✅
- All transactions in database have currency='usd' ✅
- Frontend displays "$100/hour" (not "100 USD/hour") ✅
- Mentor with EUR bank account can complete Stripe Connect onboarding ✅
- Remove multi-currency test cases from MVP scope ✅

---

### Q4: Payout Timing Clarity ✅

**Question:** "24h after completion" = job runs OR funds arrive in bank?

**Options Considered:**
- **Option A:** "Payout initiated 24h after, funds arrive 2-7 days" ✅ **SELECTED**
- **Option B:** "Payout arrives 24h after" ❌ False promise (impossible)
- **Option C:** "Payout processing starts immediately" ❌ Violates grace period

**DECISION:** "Payout initiated 24 hours after session completion. Funds arrive in 2-7 business days (Stripe standard)."

**Implementation Details:**
```
Payout Job (runs hourly):
- Schedule: 0 * * * * (every hour on the hour)
- Query: SELECT * FROM bookings
        WHERE status='completed'
        AND completed_at < NOW() - INTERVAL '24 hours'
        AND booking_id NOT IN (SELECT booking_id FROM transactions JOIN payout_items)
- For each eligible session:
  - Create Stripe Transfer to mentor stripe_account_id
  - Create payout record: payouts.scheduled_for = completed_at + 24h
  - Create payout_item linking transaction to payout

Email Notification (when payout created):
Subject: "Your payout of $80 has been sent!"
Body:
  "Hi Carlos,

  Great news! Your payout for the session with Laura on Nov 15, 2025 has been sent.

  Amount: $80.00
  Sent: Nov 16, 2025 10:15 AM
  Expected arrival: 2-7 business days

  You can track this payout in your Stripe Dashboard.

  Thanks for being an amazing mentor!"

Dashboard Display:
- Pending Payouts section:
  - "Session on Nov 15 → Payout sent Nov 16 (arriving in 2-7 business days)"
- Payout History section:
  - "Nov 16, 2025: $80.00 - In transit (2-7 days)"
  - "Nov 20, 2025: $80.00 - Arrived ✅" (after transfer.paid webhook)
```

**Rationale:**
1. **Transparency > False Promises:** Carlos wants to know WHEN he gets paid. Honesty builds trust.
2. **We Control:** Payout initiation (24h after completion). We DON'T control: Bank transfer speed (Stripe → bank takes 2-7 days, sometimes instant).
3. **Industry Standard:**
   - Airbnb: "Payout released 24h after check-in, arrives in 3-5 days"
   - Upwork: "Funds available after 5 days, withdrawal takes 3-5 days"
   - Stripe: "Standard bank transfers take 2-7 business days"
4. **Grace Period Justification (24h hold):**
   - Chargeback protection: If dispute arises <24h after session, payout can be held/reversed
   - Fraud detection: Time to verify session legitimacy
   - Marketplace standard: Allows platform to investigate disputes before releasing funds
5. **Mentor Can Verify:** Stripe Dashboard shows transfer status (pending, in_transit, paid). Mentors have transparency even if our dashboard lags.

**Timeline Example:**
```
Nov 15, 10:00 AM - Session completed
Nov 15, 10:05 AM - Session marked 'completed' in database
Nov 16, 11:00 AM - Payout job runs (first run after 24h elapsed)
Nov 16, 11:02 AM - Stripe Transfer created, email sent
Nov 16-23       - Stripe processes transfer (2-7 business days)
Nov 18, 9:00 AM - Funds arrive in Carlos's bank account (best case: 2 days)
Nov 23, 9:00 AM - Funds arrive in Carlos's bank account (worst case: 7 days)
Nov 18, 9:05 AM - Stripe fires transfer.paid webhook
Nov 18, 9:06 AM - Dashboard updates: "Nov 16: $80.00 - Arrived ✅"
```

**Business Impact:**
- Mentors know EXACTLY what to expect (no "where's my money?" tickets)
- Grace period protects platform from chargebacks (standard risk management)
- Transparency = trust = mentor retention

**Alternative Considered (Option B - "Arrives 24h after"):**
- **Pros:** Simple messaging
- **Cons:** IMPOSSIBLE to deliver. Stripe bank transfers take 2-7 days. Would generate support tickets: "It's been 24h, where's my money?"
- **Why rejected:** Setting false expectations destroys trust. Better to be honest.

**Test Cases to Add:**
- Session completed Nov 15 10:00 → payout job runs Nov 16 11:00 (first hourly run after 24h) ✅
- Session completed Nov 15 10:00 → payout NOT created at Nov 16 09:00 (only 23h elapsed) ✅
- Email sent when payout created (not when funds arrive) ✅
- Dashboard shows "Sent: Nov 16, Arrival: 2-7 days" (not "Arriving: Nov 16") ✅
- transfer.paid webhook updates payout.processed_at, dashboard shows "Arrived ✅" ✅

---

### Q5: Payment Retry Limits ✅

**Question:** Card declined → max retries? Preserve booking?

**Options Considered:**
- **Option A:** 3 retries in 30min, preserve booking ✅ **SELECTED**
- **Option B:** Unlimited retries ❌ Holds slot indefinitely
- **Option C:** No retries, booking expires immediately ❌ Poor UX

**DECISION:** 3 retry attempts within 30-minute window, preserve booking

**Implementation Details:**
```
Payment Failure Flow:
1. Stripe Checkout payment fails (card declined, insufficient funds, invalid CVV)
2. Stripe redirects to cancel_url: /checkout/failed?booking_id=X&error=card_declined
3. Frontend page shows:
   - Error message: "Payment declined. Please try another card."
   - "Try Again" button (prominent, primary color)
   - Booking details (mentor, time, price) - preserved
   - Retry counter: "Attempt 1 of 3"
4. User clicks "Try Again":
   - POST /api/checkout/session with SAME booking_id
   - Backend checks: booking.payment_retry_count < 3
   - IF yes: Increment payment_retry_count, create new Stripe Checkout Session
   - IF no (already 3 attempts): 400 Bad Request "Maximum retry attempts exceeded"
5. User is redirected to new Stripe Checkout Session (different session_id, SAME booking_id)
6. Repeat until:
   - Payment succeeds → booking confirmed ✅
   - 3 attempts exhausted → booking expires, slot released ❌
   - 30 minutes elapsed → booking expires (from Q1 extended reservation) ❌

Database Schema:
- bookings.payment_retry_count INT DEFAULT 0
- bookings.first_payment_attempt_at TIMESTAMP (set on first Checkout Session creation)
- bookings.reservation_expires_at = first_payment_attempt_at + 30 minutes

Email (after 3 failures):
Subject: "Your booking has expired"
Body:
  "Hi Laura,

  Your booking with Carlos for Nov 15 at 3:00 PM has expired after 3 unsuccessful payment attempts.

  The time slot has been released and is now available to other students.

  If you'd like to book this mentor, please select a new time slot and try again.

  Need help? Contact support."
```

**Rationale:**
1. **Balance UX with Fairness:**
   - UX: Laura accidentally types wrong card number → can fix without re-selecting slot
   - Fairness: Slot not held indefinitely → Carlos's availability not blocked by payment failures
2. **3 Attempts is Sufficient:**
   - Attempt 1: Typo in card number → correct it
   - Attempt 2: Wrong CVV → enter correct CVV
   - Attempt 3: Try different card
   - If 3 attempts fail → likely insufficient funds or fraud → booking should expire
3. **30min Window:** Aligns with Q1 extended reservation. After 30min, booking expires regardless of retry count.
4. **Preserve Booking:** Laura doesn't re-select time slot. SAME booking_id used across all retry attempts. Better UX than forcing re-booking.
5. **Prevent Abuse:** Max 3 retries prevents users from holding slots for hours/days with failed payments.

**User Flow Example (Success):**
```
10:00 AM - Laura selects slot with Carlos (Nov 15, 3 PM)
10:01 AM - Laura clicks "Pay with Card"
10:02 AM - Payment fails (typo: 4242 4242 4242 4243 instead of 4242)
10:03 AM - Page shows "Payment declined. Try Again" button
10:04 AM - Laura clicks "Try Again", corrects card number (4242 4242 4242 4242)
10:05 AM - Payment succeeds ✅
10:06 AM - Booking confirmed, email sent
Outcome: Booking secured, slot NOT released
```

**User Flow Example (Failure):**
```
10:00 AM - Laura selects slot with Carlos (Nov 15, 3 PM)
10:01 AM - Payment fails (insufficient funds)
10:02 AM - "Try Again" → attempt 2 fails (still insufficient funds)
10:03 AM - "Try Again" → attempt 3 fails (still insufficient funds)
10:04 AM - Page shows "Maximum attempts exceeded. Booking expired."
10:05 AM - Email sent: "Your booking has expired"
10:06 AM - Slot released, available for other students
Outcome: Booking lost, slot freed for others
```

**Business Impact:**
- Reduces booking abandonment (users can retry without re-selecting)
- Prevents slot hoarding (3 attempts max, 30min window)
- Fair to mentors (slots not blocked indefinitely)

**Alternative Considered (Option B - Unlimited Retries):**
- **Pros:** Maximum UX flexibility
- **Cons:**
  - User could hold slot for hours/days with repeated failures
  - Unfair to mentor (slot unavailable to paying students)
  - Abuse potential (hold competitor's slot to block bookings)
- **Why rejected:** Fairness to mentors > extreme user convenience

**Alternative Considered (Option C - No Retries):**
- **Pros:** Simple, slot freed immediately
- **Cons:**
  - Poor UX (Laura makes typo, loses slot, must re-select)
  - High abandonment rate (users frustrated by having to start over)
- **Why rejected:** UX too poor for MVP

**Test Cases to Add:**
- 1st payment fails, 2nd succeeds → booking confirmed (SAME booking_id) ✅
- 3 payments fail → booking expires, slot released, email sent ✅
- 2 payments fail, then 31min passes → booking expires (timeout) ✅
- payment_retry_count increments correctly (0 → 1 → 2 → 3) ✅
- "Try Again" button disabled after 3rd attempt ✅

---

### Q6: Reconciliation Process ✅

**Question:** If webhook never arrives, who catches it? Daily job? Manual?

**Options Considered:**
- **Option A:** Daily automated job + admin dashboard ✅ **SELECTED**
- **Option B:** Manual admin monitoring only ❌ Reactive, error-prone
- **Option C:** Webhook retries only ⚠️ Insufficient (what if retries also fail?)

**DECISION:** Daily automated reconciliation job + admin dashboard (defense in depth)

**Implementation Details:**

**Automated Reconciliation Job:**
```
Job Name: payment-reconciliation-job
Schedule: 0 2 * * * (daily at 2:00 AM UTC)
Timeout: 10 minutes
Retry: 3 attempts if job fails

Actions:

1. Reconcile Payments (Stripe → Database):
   - Query Stripe API: stripe.paymentIntents.list({
       created: { gte: yesterday },
       status: 'succeeded'
     })
   - For each PaymentIntent:
     - Check if exists in transactions table (by stripe_payment_intent_id)
     - IF NOT EXISTS:
       - Extract booking_id from metadata
       - Auto-create transaction record
       - Update booking.status = 'confirmed'
       - Send confirmation email (late, but better than never)
       - Log: "Reconciliation: Created missing transaction for payment_intent_id X"

2. Reconcile Bookings (Database → Stripe):
   - Query: SELECT * FROM bookings WHERE status='confirmed' AND created_at > yesterday
   - For each booking:
     - Check if transaction exists with booking_id
     - IF NOT EXISTS:
       - Flag for manual review (potential data corruption)
       - Log: "Reconciliation: Confirmed booking X has no payment"

3. Reconcile Payouts (Sessions → Payouts):
   - Query: SELECT * FROM bookings
           WHERE status='completed'
           AND completed_at < NOW() - INTERVAL '24 hours'
           AND booking_id NOT IN (SELECT booking_id FROM transactions JOIN payout_items)
   - For each eligible session:
     - Check mentor has Stripe Connect (payouts_enabled=true)
     - IF yes: Auto-trigger payout (create Transfer, send email)
     - IF no: Flag for manual review
     - Log: "Reconciliation: Created missing payout for booking X"

4. Reconcile Payout Status (Stripe → Database):
   - Query: SELECT * FROM payouts WHERE status='pending' AND created_at < NOW() - INTERVAL '48 hours'
   - For each stuck payout:
     - Query Stripe: stripe.transfers.retrieve(stripe_payout_id)
     - IF status='paid': Update payouts.status='paid', processed_at=NOW()
     - IF status='failed': Update payouts.status='failed', send alert
     - Log: "Reconciliation: Updated payout X status from pending to paid"

5. Send Daily Report Email:
   To: admin@upexmymentor.com
   Subject: "Daily Reconciliation Report - {date}"
   Body:
     "Reconciliation Summary:
     - Missing transactions created: 2
     - Confirmed bookings without payments: 0
     - Missing payouts created: 1
     - Stuck payouts resolved: 0

     Total discrepancies: 3
     Auto-fixed: 3
     Requiring manual review: 0

     See admin dashboard for details."
```

**Admin Dashboard (Payout Reconciliation):**
```
Route: /admin/reconciliation
Auth: admin-only (role='admin' required)

Sections:

1. Missing Payouts:
   - Table: Sessions completed >24h with no payout record
   - Columns: Booking ID, Mentor, Session Date, Amount, Days Since Completion
   - Actions: "Trigger Payout Now" button (manual override)

2. Stuck Payouts:
   - Table: Payouts in status='pending' for >48 hours
   - Columns: Payout ID, Mentor, Amount, Stripe Payout ID, Days Pending
   - Actions: "Check Stripe Status" button, "Mark as Paid" button

3. Webhook Failures:
   - Table: Payments succeeded (Stripe) but bookings NOT confirmed (database)
   - Columns: Payment Intent ID, Booking ID, Amount, Date
   - Actions: "Confirm Booking Now" button, "Refund Payment" button

4. Financial Summary:
   - Total platform commission collected (today, this week, this month)
   - Total platform commission expected (20% of GMV)
   - Variance (expected - collected) → flags if >5%
   - Total payouts sent vs expected
   - Absorbed refund fees (from Q2 decision)

5. Recent Reconciliation Logs:
   - Last 100 reconciliation actions
   - Columns: Date, Action Type, Booking ID, Status, Auto/Manual
```

**Rationale:**
1. **Defense in Depth:**
   - Layer 1: Webhook (real-time)
   - Layer 2: Webhook retry (Stripe retries for 3 days)
   - Layer 3: Reconciliation job (daily catch-all)
   - Layer 4: Admin dashboard (manual override)
2. **Automated Job = Proactive:** Catches 99% of issues WITHOUT human intervention. Runs while team sleeps.
3. **Admin Dashboard = Safety Net:** For edge cases, manual investigation, operational visibility.
4. **Redundancy = Reliability:** Webhook fails → reconciliation job fixes it next day. Zero user impact.
5. **Financial Compliance:** Daily report = audit trail. Can prove to investors/regulators that financial systems are monitored.
6. **Operational Excellence:** Admin sees platform health at a glance. Can detect systemic issues (e.g., all payouts failing → Stripe API issue).

**Edge Case Example:**
```
Scenario: Webhook delivery fails (server downtime during webhook arrival)

10:00 AM Nov 15 - Laura pays for session (payment succeeds in Stripe)
10:01 AM Nov 15 - Stripe sends webhook checkout.session.completed
10:01 AM Nov 15 - Upex server is down (deployment in progress) → webhook delivery fails
10:02 AM Nov 15 - Stripe retries webhook (1st retry) → server still down
10:05 AM Nov 15 - Server comes back online
11:00 AM Nov 15 - Stripe retries webhook (2nd retry) → server up, webhook processed ✅
Outcome: Webhook eventually succeeds, no reconciliation needed

Alternative Scenario (all retries fail):
10:00 AM Nov 15 - Payment succeeds
10:01-10:30 AM Nov 15 - All webhook retries fail (extended server outage)
2:00 AM Nov 16 - Reconciliation job runs
2:01 AM Nov 16 - Job queries Stripe API, finds successful payment
2:02 AM Nov 16 - Job creates transaction, confirms booking, sends email
Outcome: 16-hour delay, but booking eventually confirmed automatically
```

**Business Impact:**
- Zero financial loss (all transactions reconciled)
- Minimal user impact (worst case: 24h delay in confirmation, rare)
- Operational visibility (admin knows if systemic issues arise)
- Audit trail (compliance, investor confidence)

**Alternative Considered (Option B - Manual Only):**
- **Pros:** Simple, no automated job complexity
- **Cons:**
  - Reactive (admin discovers issue only when user complains)
  - Error-prone (humans miss things)
  - Not scalable (100 sessions/month = 2 manual checks/day, 1000 sessions = 20/day)
- **Why rejected:** Manual doesn't scale, reactive not acceptable for financial systems

**Alternative Considered (Option C - Webhook Retries Only):**
- **Pros:** Stripe handles retries automatically
- **Cons:**
  - If retries fail (server down for 3+ days), no fallback
  - No way to detect if webhook was lost
  - No audit trail of discrepancies
- **Why rejected:** Insufficient for financial reliability

**Test Cases to Add:**
- Webhook fails, reconciliation job creates transaction 24h later ✅
- Payout stuck >48h, reconciliation job queries Stripe, updates status ✅
- Reconciliation job finds 0 discrepancies (normal operation) → email sent ✅
- Admin manually triggers payout from dashboard → payout created ✅
- Admin marks stuck payout as 'paid' → database updated, email sent ✅

---

### Q7: Payment Methods ✅

**Question:** Cards only (Stripe Checkout) or ACH/crypto too?

**Options Considered:**
- **Option A:** Cards only ✅ **SELECTED**
- **Option B:** Cards + ACH ⚠️ Adds complexity, low adoption for one-time payments
- **Option C:** Cards + ACH + PayPal + crypto ❌ Over-engineering for MVP

**DECISION:** Cards only for MVP (Stripe Checkout default)

**Implementation Details:**
```
Stripe Checkout Session Creation:
- payment_method_types: ['card']
- Supported card brands (Stripe handles automatically):
  - Visa
  - Mastercard
  - American Express
  - Discover
  - Diners Club
  - JCB
  - UnionPay (if enabled)

Frontend Messaging:
- Checkout page: "We accept Visa, Mastercard, Amex, and Discover"
- Payment modal: Stripe Checkout form shows card logos
- FAQ: "Do you accept PayPal? Not yet, but we're considering it for future updates."

NOT Supported (V1):
- ACH Direct Debit (US bank accounts)
- PayPal
- Apple Pay / Google Pay
- Crypto (Bitcoin, Ethereum, USDC)
- Buy Now Pay Later (Klarna, Afterpay)
- Wire Transfer / SEPA

Error Handling:
- If user asks in support: "We currently accept credit/debit cards only. ACH and PayPal coming soon!"
- Roadmap item for V2 based on demand
```

**Rationale:**
1. **Coverage:** Cards cover 95%+ of target market
   - Laura (Mexico): Has Visa/Mastercard
   - Carlos (Spain): Has credit card
   - Sofía (Argentina): Common to have international credit card for online purchases
   - US users: Credit cards ubiquitous
2. **MVP Principle:** Ship fastest path to revenue. Cards = simplest, most universal.
3. **Stripe Checkout Benefits:**
   - **PCI Compliance:** Platform NEVER handles card data (Stripe hosted page)
   - **Fraud Detection:** Stripe Radar included (detects stolen cards)
   - **3D Secure:** Automatic for high-risk transactions (EU SCA compliance)
   - **Mobile Optimized:** Works on iOS/Android
   - **Localized:** Stripe auto-translates checkout form to user's language
4. **Why NOT ACH:**
   - Slow (3-5 business days for funds to clear)
   - Low adoption for one-time payments (more common for subscriptions)
   - Higher dispute rate (easier to reverse than card payments)
   - Adds dev complexity (different flow than cards)
5. **Why NOT PayPal:**
   - Additional integration (PayPal SDK, not Stripe)
   - Additional fees (~3.5% vs Stripe 2.9%)
   - Dispute complexity (PayPal disputes separate from Stripe)
   - Not validated as user need yet
6. **Why NOT Crypto:**
   - Volatility (price changes during checkout)
   - Regulatory uncertainty (SEC, CFTC guidance unclear)
   - Niche (<1% of users have crypto)
   - Tax complexity (crypto payments = taxable events in many jurisdictions)
   - Irreversible (no refunds/chargebacks = customer risk)
7. **Why NOT Apple Pay/Google Pay:**
   - Requires additional Stripe setup (PaymentRequest API)
   - Mobile-first feature (less critical for desktop MVP)
   - Can add in V2 for mobile UX optimization

**V2 Roadmap (Based on User Demand):**
```
Payment Methods Priority for V2:
1. Apple Pay / Google Pay (if >30% traffic from mobile)
   - Better mobile UX
   - Faster checkout (saved cards)
   - Stripe supports via Payment Request API

2. ACH Direct Debit (if >10% users request)
   - Lower fees (0.8% vs 2.9% for cards)
   - Common for B2B mentorships (enterprise clients prefer ACH)
   - Use case: $1000+ sessions where ACH fee savings matter

3. PayPal (if >5% users request)
   - Users without credit cards (rare, but exists)
   - Some users prefer PayPal for buyer protection
   - Trade-off: Higher fees, dispute complexity

4. Crypto (only if regulation clarifies + >1% users request)
   - Stablecoins (USDC, USDT) to avoid volatility
   - Appeal to crypto-native mentors/mentees
   - Requires legal review, tax guidance

Decision Criteria for V2:
- Add method if:
  - >5% users request it explicitly (support tickets, surveys)
  - Incremental revenue > implementation cost
  - Regulatory/compliance risk acceptable
```

**Business Impact:**
- **Current:** 95%+ users covered with cards
- **Risk:** 5% users may abandon if no alternative method
- **Mitigation:** V2 adds top requested method based on data
- **Cost:** ACH/PayPal add 2-3 weeks dev time each. Not justified for MVP.

**Alternative Considered (Option B - Cards + ACH):**
- **Pros:** Lower fees for large transactions, appeals to enterprise
- **Cons:**
  - 3-5 day settlement delay (poor UX for instant booking confirmation)
  - Higher dispute rate
  - Dev complexity (separate flow from cards)
  - Unvalidated demand
- **Why rejected:** Premature. Add ACH only if users request.

**Alternative Considered (Option C - All Methods):**
- **Pros:** Maximum flexibility, covers all users
- **Cons:**
  - Over-engineering for MVP
  - Each method adds 1-2 weeks dev time
  - Each method adds support/dispute complexity
  - 95% of users only need cards
- **Why rejected:** Violates MVP principle. Ship simple, iterate based on data.

**Test Cases to Add:**
- Stripe Checkout Session created with payment_method_types=['card'] ✅
- Payment succeeds with Visa (4242 4242 4242 4242) ✅
- Payment succeeds with Mastercard (5555 5555 5555 4444) ✅
- Payment succeeds with Amex (3782 822463 10005) ✅
- Payment declined with invalid card (4000 0000 0000 9995) ✅
- Frontend shows "We accept Visa, Mastercard, Amex, Discover" ✅
- Remove ACH/PayPal/crypto test cases from MVP scope ✅

---

## Implementation Checklist

**@Dev Team:**
- [ ] Booking reservation: 15min → 30min when Checkout Session created
- [ ] Auto-refund flow for expired bookings (payment succeeds after 30min)
- [ ] Refund amount = 100% (platform absorbs Stripe fees)
- [ ] Database: transactions.platform_fee_absorbed BOOLEAN
- [ ] Hardcode currency='usd' in all payment flows
- [ ] Input validation: Reject non-USD payment requests (400)
- [ ] Payment retry logic: max 3 attempts, preserve booking_id
- [ ] Database: bookings.payment_retry_count INT
- [ ] Reconciliation job: daily 2am UTC, auto-fix discrepancies
- [ ] Admin dashboard: /admin/reconciliation (missing payouts, stuck payouts, webhook failures)
- [ ] Stripe Checkout: payment_method_types=['card']
- [ ] Email templates: refund confirmation, payout sent, booking expired
- [ ] Dashboard: payout status "Sent: Nov 16, Arrival: 2-7 days"

**@Product:**
- [ ] Update messaging: "Payout sent in 24h, arrives 2-7 days"
- [ ] Design refund email: emphasize 100% refund
- [ ] Design payment retry page: "Try Again" button, attempt counter
- [ ] Add "We accept Visa, Mastercard, Amex" to checkout page
- [ ] FAQ: Multi-currency, alternative payment methods coming in V2

**@QA:**
- [ ] Update test cases based on all 7 decisions
- [ ] Add new test cases: 30min reservation, retry flow, reconciliation job
- [ ] Remove out-of-scope: multi-currency, ACH, crypto
- [ ] Test Stripe Radar for fraud detection
- [ ] Test 3D Secure flow (test card: 4000 0027 6000 3184)

---

## Metrics to Monitor

**Post-Launch Monitoring (Epic MYM-23):**

1. **Payment Success Rate:** Target >99% (excluding card declines)
2. **Payout Delivery Success Rate:** Target >95%
3. **Refund Rate:** Target <2%
4. **Payment Expiration Edge Case:** <0.1% (payments succeeding after 30min)
5. **Payment Retry Success Rate:** % of retries that eventually succeed (goal: >70%)
6. **Reconciliation Discrepancies:** <5 per month (goal: 0)
7. **Webhook Delivery Success Rate:** Target >99%
8. **Platform Fee Absorbed on Refunds:** $X/month (track cost of Q2 decision)
9. **User Requests for Non-USD:** Track support tickets (threshold: 10% triggers V2 multi-currency)
10. **User Requests for Alternative Payment Methods:** Track requests (threshold: 5% triggers V2)

**Alerts:**
- Payment success rate <95% → investigate Stripe integration
- Payout delivery rate <90% → investigate Stripe Connect
- Refund rate >5% → investigate abuse, policy enforcement
- Reconciliation job failures → immediate escalation
- Webhook delivery rate <95% → investigate server health

---

## Financial Model Update

**Impact of Q2 Decision (Platform Absorbs Refund Fees):**

**Scenario: 100 sessions/month, 2% refund rate**
```
Total GMV: $10,000 (100 sessions × $100 average)
Platform Commission: $2,000 (20%)
Stripe Fees on Payments: $320 (3.2% of GMV)
Platform Net Revenue (no refunds): $1,680 (16.8%)

With Refunds (2% rate = 2 sessions):
- Refund to users: $200 (2 sessions × $100)
- Stripe refunds platform: $193.60 ($200 - $6.40 non-refundable fee)
- Platform absorbs: $6.40

Adjusted Net Revenue: $1,673.60 (16.7%)
Cost of customer-first policy: $6.40/month (0.4% margin reduction)
```

**Scenario: 1000 sessions/month, 2% refund rate (Scale)**
```
Total GMV: $100,000
Platform Commission: $20,000
Stripe Fees: $3,200
Platform Net (no refunds): $16,800

With Refunds (2% = 20 sessions):
- Refund to users: $2,000
- Stripe refunds: $1,936
- Platform absorbs: $64

Adjusted Net Revenue: $16,736
Cost: $64/month (0.4% margin reduction)
```

**Break-even Analysis:**
- Q2 decision costs 0.4% margin at 2% refund rate
- Acceptable trade-off for trust-building in MVP
- Re-evaluate if refund rate exceeds 5% (would cost 1% margin)

---

## Approval & Sign-off

**Decision Maker:** CEO/Product Lead
**Date:** 2025-11-11
**Status:** ✅ APPROVED

**Stakeholder Acknowledgment:**
- [ ] @Dev Lead: Reviewed technical implementation requirements
- [ ] @Product Manager: Reviewed UX/messaging changes
- [ ] @QA Lead: Updated test plan to reflect decisions
- [ ] @Finance: Acknowledged financial impact of Q2 decision (platform absorbs refund fees)

**Epic Status:** UNBLOCKED - Implementation can proceed

**Next Epic:** MYM-28 (Session Management) - Feature Test Plan to be generated

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Location:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/decisions.md`
