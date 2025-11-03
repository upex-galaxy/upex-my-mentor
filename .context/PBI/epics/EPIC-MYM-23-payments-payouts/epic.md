# EPIC-005: Payments & Payouts

**Jira Key:** MYM-23
**Status:** ASSIGNED
**Priority:** CRITICAL
**Phase:** Financial & Trust (Sprint 5-6)

---

## Epic Description

This epic handles the complete financial lifecycle of a transaction on the Upex My Mentor platform. It includes processing mentee payments for sessions securely through Stripe, managing the platform's commission model (20%), and distributing payouts to mentors after a 24-hour grace period post-session.

**Business Value:**
This is the revenue engine of the platform. Without a secure and reliable payment system:
- Mentees cannot pay for sessions (no transactions)
- Mentors cannot receive earnings (no incentive to participate)
- Platform cannot collect commission (no business model)

Key business outcomes:
- Enable $5,000 GMV target in first month
- Generate $1,000 in net revenue (20% commission)
- Build trust through secure payment processing
- Automated payout system reduces operational overhead

---

## User Stories

1. **MYM-24** - As a Mentee, I want to securely enter my credit card details at checkout so that I can pay for a session
2. **MYM-25** - As a Mentor, I want to connect my bank account (via Stripe Connect) so that I can receive payouts
3. **MYM-26** - As a Mentor, I want to see a record of my earnings so that I can track my income from the platform
4. **MYM-27** - As the System, I want to automatically process a payout to the mentor after a 24-hour grace period post-session

---

## Scope

### In Scope

**Mentee Payment Processing:**
- Stripe Checkout integration for secure card processing
- Payment intent creation with booking details
- Support for major credit/debit cards (Visa, Mastercard, Amex)
- PCI-compliant payment flow (Stripe handles sensitive data)
- Payment confirmation and receipt generation
- Automatic booking status update on successful payment
- Refund processing for cancelled sessions (linked to EPIC-006)

**Mentor Payout Management:**
- Stripe Connect integration for mentor onboarding
- Bank account connection via Stripe Connect Express
- Automated payout calculation (total - 20% commission)
- Payout holds: 24-hour grace period after session completion
- Payout history and transaction records
- Monthly payout summaries

**Platform Commission:**
- Automatic 20% commission deduction on all transactions
- Commission tracking and reporting
- Revenue analytics dashboard (admin only)

**Transaction Records:**
- Detailed transaction history for both mentees and mentors
- Invoice/receipt generation
- Downloadable transaction records (CSV export)

### Out of Scope (Future)
- Alternative payment methods (PayPal, crypto, wire transfer)
- Subscription plans or package deals
- Dynamic commission rates per mentor
- Split payments (pay part now, part later)
- Multi-currency support
- Tax document generation (1099 forms)
- Escrow system for dispute resolution

---

## Acceptance Criteria (Epic Level)

1. ✅ Mentees can pay for sessions using credit/debit cards via Stripe
2. ✅ Payment processing completes in <5 seconds
3. ✅ Failed payments show clear error messages and allow retry
4. ✅ Successful payment triggers booking confirmation (EPIC-004)
5. ✅ Mentors can onboard to Stripe Connect and link bank accounts
6. ✅ Payouts are calculated correctly (booking amount - 20%)
7. ✅ Payouts are automatically processed 24 hours after session completion
8. ✅ Transaction history shows all payments and payouts
9. ✅ Receipts are generated and emailed to mentees
10. ✅ All financial data is encrypted and PCI-compliant
11. ✅ Webhook handling for Stripe events is idempotent (no duplicate processing)

---

## Related Functional Requirements

- **FR-016:** El sistema debe permitir a los estudiantes pagar de forma segura por una sesión
- **FR-017:** El sistema debe permitir a los mentores recibir sus pagos de sesiones completadas
- **FR-018:** El sistema debe permitir a los usuarios ver un historial de sus transacciones y pagos

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Payment Architecture

**Stripe Integration:**
- **Stripe Checkout:** For mentee payments (hosted payment page)
- **Stripe Connect Express:** For mentor onboarding and payouts
- **Stripe Webhooks:** For asynchronous event handling
- **Stripe API Version:** Use latest stable version (2024-10-28.acacia or newer)

### Database Schema

**Tables:**
- `stripe_accounts` (mentor Stripe Connect accounts)
  - id (uuid, PK)
  - mentor_id (uuid, FK to mentor_profiles.id, UNIQUE)
  - stripe_account_id (string, Stripe Connect account ID)
  - onboarding_complete (boolean)
  - charges_enabled (boolean)
  - payouts_enabled (boolean)
  - created_at, updated_at

- `transactions`
  - id (uuid, PK)
  - booking_id (uuid, FK to bookings.id, UNIQUE)
  - stripe_payment_intent_id (string, Stripe Payment Intent ID)
  - mentee_id (uuid, FK)
  - mentor_id (uuid, FK)
  - gross_amount (numeric) - Full session price
  - platform_fee (numeric) - 20% commission
  - net_amount (numeric) - Amount to mentor (gross - fee)
  - status (enum: 'pending' | 'succeeded' | 'failed' | 'refunded')
  - payment_method (string) - Card brand (Visa, Mastercard, etc.)
  - paid_at (timestamptz)
  - created_at, updated_at

- `payouts`
  - id (uuid, PK)
  - mentor_id (uuid, FK)
  - stripe_payout_id (string, Stripe Payout ID)
  - amount (numeric)
  - currency (string, default 'usd')
  - status (enum: 'pending' | 'in_transit' | 'paid' | 'failed')
  - scheduled_for (timestamptz) - Session completion + 24 hours
  - processed_at (timestamptz)
  - created_at, updated_at

- `payout_items` (joins payouts to transactions)
  - id (uuid, PK)
  - payout_id (uuid, FK)
  - transaction_id (uuid, FK)

### Payment Flow

**Mentee Payment (Checkout):**
1. Mentee selects session slot (EPIC-004)
2. Frontend calls `POST /api/checkout/session`
   ```json
   {
     "booking_id": "uuid",
     "success_url": "/bookings/{BOOKING_ID}/success",
     "cancel_url": "/bookings/{BOOKING_ID}/cancel"
   }
   ```
3. Backend creates Stripe Checkout Session with:
   - Amount: Mentor's hourly_rate (snapshot from booking)
   - Metadata: booking_id, mentor_id, mentee_id
   - Application fee: 20% to platform account
4. Redirect mentee to Stripe Checkout
5. Stripe webhook `checkout.session.completed` fires
6. Backend updates booking status to `confirmed`
7. Trigger confirmation email (EPIC-004)

**Mentor Payout (Automated):**
1. Scheduled job runs every hour
2. Query for sessions with:
   - status = 'completed'
   - completed_at < NOW() - 24 hours
   - No payout record exists
3. For each eligible session:
   - Calculate net_amount = gross_amount * 0.80
   - Create Stripe Transfer to mentor's Connect account
   - Record payout in database
4. Stripe webhook `transfer.paid` confirms completion
5. Update payout status to `paid`
6. Send payout notification email to mentor

### Stripe Webhooks

**Webhook Events to Handle:**
- `checkout.session.completed` - Payment succeeded
- `payment_intent.succeeded` - Alternative payment confirmation
- `payment_intent.payment_failed` - Payment failed
- `account.updated` - Mentor Connect account status changed
- `transfer.created` - Payout initiated
- `transfer.paid` - Payout completed
- `transfer.failed` - Payout failed

**Webhook Security:**
- Verify Stripe signature on all webhook requests
- Implement idempotency keys to prevent duplicate processing
- Log all webhook events for debugging

### API Endpoints

See: `.context/SRS/api-contracts.yaml`

- `POST /api/checkout/session` - Create Stripe Checkout Session
- `POST /api/stripe/connect/onboard` - Start mentor Stripe Connect onboarding
- `GET /api/stripe/connect/status` - Check mentor onboarding status
- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `GET /api/transactions` - List user's transaction history
- `GET /api/payouts` - List mentor's payout history (mentors only)
- `POST /api/refunds` - Process refund for cancelled booking (admin)

### Security Requirements (NFR-002)
- Never store raw credit card data (Stripe handles)
- Use Stripe's PCI-compliant Checkout (not custom forms)
- Encrypt Stripe API keys in environment variables
- Use restricted API keys for client-side (publishable keys only)
- Implement webhook signature verification
- Log all financial transactions for audit trail

---

## Dependencies

### External Dependencies
- **Stripe:** Payment processing, Connect, webhooks
- Stripe account with Connect enabled
- SSL certificate (required for webhooks)

### Internal Dependencies
- **EPIC-001 (User Authentication):** Required
  - Need user IDs for payment attribution
- **EPIC-004 (Scheduling & Booking):** Required
  - Bookings must exist before payment
- **EPIC-006 (Session Management):** Partial
  - Session completion triggers payout
  - Cancellation triggers refund

### Blocks
- None (this epic can be developed in parallel with EPIC-006)

---

## Success Metrics

### Functional Metrics
- >99% payment success rate (excluding card declines)
- 0 duplicate charges or payouts
- <1% payment dispute rate
- >95% payout delivery success rate

### Business Metrics (from Executive Summary)
- $5,000 GMV in first month
- $1,000 net revenue (20% commission)
- Average transaction value: $75 (indicates mentor quality)
- <2% refund rate

### Operational Metrics
- Payment processing time: <5 seconds
- Payout processing time: 24-48 hours (Stripe standard)
- Webhook processing latency: <1 second

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Payment fraud (stolen cards) | High | Low | Use Stripe Radar for fraud detection, require CVV |
| Webhook failures cause missed payouts | High | Medium | Implement retry logic, manual payout reconciliation dashboard |
| Mentor bank account issues delay payouts | Medium | Medium | Clear onboarding instructions, support for payout issues |
| Platform fee calculation errors | High | Low | Extensive unit tests, automated reconciliation checks |
| Stripe account suspension | Critical | Very Low | Comply with Stripe ToS, monitor account health |
| Chargebacks from mentees | Medium | Low | Clear refund policy, session recordings as proof of delivery |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-005-payments-payouts/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** Payment calculation logic, fee computation (>95% coverage)
- **Integration Tests:** Stripe API calls with test mode
- **E2E Tests:** Full payment flow with Stripe test cards
- **Webhook Tests:** Simulate all Stripe webhook events
- **Security Tests:** PCI compliance, API key protection

### Stripe Test Mode
- Use Stripe test mode for all development and testing
- Test cards:
  - `4242 4242 4242 4242` - Successful payment
  - `4000 0000 0000 9995` - Declined payment
  - `4000 0000 0000 0077` - Charge succeeds, payout fails
- Test Connect Express onboarding with test accounts

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-005-payments-payouts/feature-implementation-plan.md`

### Recommended Story Order
1. MYM-24 (Mentee payment) - Core payment flow
2. MYM-25 (Mentor onboarding) - Connect setup
3. MYM-27 (Automated payouts) - Revenue distribution
4. MYM-26 (Transaction history) - Transparency

### Estimated Effort
- **Development:** 3-4 sprints (6-8 weeks)
- **Testing:** 1 sprint (2 weeks) - High complexity, financial testing
- **Total:** 4-5 sprints

### Stripe Setup Checklist
- [ ] Create Stripe account
- [ ] Enable Stripe Connect
- [ ] Configure Connect settings (Express accounts)
- [ ] Set platform commission (20%)
- [ ] Add webhook endpoints
- [ ] Verify webhook signatures
- [ ] Test with Stripe test mode
- [ ] Complete Stripe compliance questionnaire
- [ ] Request production access

---

## Compliance & Legal

### Required Documentation
- **Terms of Service:** Platform fee structure (20% commission)
- **Refund Policy:** 24-hour cancellation policy
- **Privacy Policy:** How payment data is handled (Stripe processes, we don't store)
- **Mentor Agreement:** Payout terms, 24-hour hold, tax responsibilities

### Tax Considerations (Future)
- Platform must issue 1099-K to mentors earning >$600/year (US)
- Consider Stripe Tax for automated tax calculation
- Mentors are responsible for their own tax reporting

---

## Design Considerations

### Checkout Page
```
Complete Your Booking

Session with Carlos Rodriguez
Date: Friday, Nov 15, 2025
Time: 10:00 AM - 11:00 AM EST
Duration: 1 hour

Subtotal:        $100.00
Platform Fee:      $0.00 (included)
Total:           $100.00

[Pay with Card]

Secure payment powered by Stripe
```

### Mentor Earnings Dashboard
```
Your Earnings

Available Balance: $320.00
  └─ Next payout: Nov 18 (3 pending sessions)

Lifetime Earnings: $1,250.00
Total Sessions: 18

Recent Transactions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session with Laura M.
Nov 10, 2025
Gross: $100.00 | Fee: $20.00 | Net: $80.00
Status: Paid ✓

[View Full History] [Connect Bank Account]
```

---

## Notes

- Stripe Connect Express provides a white-labeled onboarding flow (mentors never leave our platform)
- 20% commission is competitive (Upwork: 20%, Fiverr: 20%, MentorCruise: 15-20%)
- 24-hour payout hold protects platform against chargebacks
- Consider implementing Stripe Link for faster repeat checkout
- Monitor Stripe Dashboard for anomalies (unusual transaction patterns)

---

## Related Documentation

- **Business Model:** `.context/idea/business-model.md` (Revenue Streams)
- **PRD:** `.context/PRD/executive-summary.md` (Success metrics)
- **SRS:** `.context/SRS/functional-specs.md` (FR-016, FR-017, FR-018)
- **SRS:** `.context/SRS/non-functional-specs.md` (NFR-002: Security)
- **API:** `.context/SRS/api-contracts.yaml`
