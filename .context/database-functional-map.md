# Database Functional Map
```
  ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
  ║                                          🎓 UPEX MY MENTOR - DATABASE FUNCTIONAL MAP                                 ║
  ║                                     Marketplace de Mentoría 1-on-1 para Ingenieros                                  ║
  ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                              📊 DATABASE SCHEMA OVERVIEW                                              │
  │                                                    (12 tablas, RLS enabled)                                           │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

      ┌───────────────────┐                                    ┌──────────────────────────────────┐
      │    auth.users     │                                    │         communication_           │
      │  (Supabase Auth)  │                                    │          channels                │
      │───────────────────│                                    │──────────────────────────────────│
      │ id (uuid) PK      │─────trigger────►┌────────────────┐ │ id (uuid) PK                     │
      │ email             │                 │    profiles    │ │ user_id → profiles.id            │
      │ raw_user_meta     │                 │────────────────│◄│ channel_type (whatsapp|slack|    │
      └───────────────────┘                 │ id (uuid) PK   │ │   email|google_meet|zoom|...)    │
                                            │ email (unique) │ │ handle (phone/username/link)     │
                                            │ name           │ │ is_active                        │
           Roles:                           │ role (enum)    │ └──────────────────────────────────┘
      ┌─────────────────┐                   │  └─ student    │
      │ • student (35)  │                   │  └─ mentor     │         ┌──────────────────────┐
      │ • mentor (14)   │                   │  └─ admin      │         │ mentor_availability  │
      │ • admin         │                   │ photo_url      │         │──────────────────────│
      └─────────────────┘                   │ description    │         │ id (uuid) PK         │
                                            │ specialties[]  │◄────────│ mentor_id            │
                                            │ hourly_rate    │         │ day_of_week (0-6)    │
                                            │ linkedin_url   │         │ start_time           │
                                            │ github_url     │         │ end_time             │
                                            │ is_verified    │         │ is_active            │
                                            │ average_rating │         └──────────────────────┘
                                            │ total_reviews  │
                                            │ years_of_exp   │
                                            │ rejection_reason│
                                            └───────┬────────┘
                                                    │
                ┌───────────────────────────────────┼───────────────────────────────────┐
                │                                   │                                   │
                ▼                                   ▼                                   ▼
      ┌──────────────────────┐           ┌──────────────────────┐           ┌──────────────────────┐
      │      bookings        │           │       reviews        │           │    conversations     │
      │──────────────────────│           │──────────────────────│           │──────────────────────│
      │ id (uuid) PK         │           │ id (uuid) PK         │           │ id (uuid) PK         │
      │ student_id ──────────│───┐       │ reviewer_id ─────────│───┐       │ participant_1_id ────│───┐
      │ mentor_id ───────────│───┤       │ subject_id ──────────│───┤       │ participant_2_id ────│───┤
      │ session_date         │   │       │ booking_id ──────────│◄──┘       │ created_at           │   │
      │ duration_minutes (60)│   │       │ rating (1-5) ★★★★★   │   │       │ updated_at           │   │
      │ total_cost           │   │       │ comment              │   │       └──────────┬───────────┘   │
      │ status: ─────────────│───┼──►    │ created_at           │   │                  │               │
      │  ├─ provisional      │   │       └──────────────────────┘   │                  ▼               │
      │  ├─ pending_payment  │   │                                  │       ┌──────────────────────┐   │
      │  ├─ confirmed ◄──────│───┼───webhook                        │       │      messages        │   │
      │  ├─ completed        │   │                                  │       │──────────────────────│   │
      │  └─ cancelled        │   │                                  │       │ id (uuid) PK         │   │
      │ videocall_url        │   │                                  │       │ conversation_id      │   │
      │ notes                │   │                                  │       │ sender_id ───────────│───┤
      │ confirmation_sent_at │   │                                  │       │ content (min 10 char)│   │
      │ completed_at ────────│───┼───► triggers payout (24h later)  │       │ is_read (bool)       │   │
      │ communication_channels│  │                                  │       │ created_at           │   │
      │ session_meeting_link │   │                                  │       └──────────────────────┘   │
      │ cancelled_at         │   │                                  │                                  │
      │ cancelled_by         │   │                                  └──────────────────────────────────┘
      │ cancellation_reason  │   │                                               FK to profiles
      └──────────┬───────────┘   │
                 │               └─────────────────────────────────────┐
                 ▼                                                     │
      ┌──────────────────────┐                                         │
      │    transactions      │                                         │
      │──────────────────────│                                         │
      │ id (uuid) PK         │                                         │
      │ booking_id (unique) ─│─────────────────────────────────────────┘
      │ stripe_payment_intent│
      │ stripe_checkout_sess │
      │ mentee_id ───────────│───► FK to profiles
      │ mentor_id ───────────│───► FK to profiles
      │ gross_amount ($)     │     (e.g., $50)
      │ platform_fee (20%)   │     (e.g., $10)
      │ net_amount (80%)     │     (e.g., $40) → goes to mentor
      │ currency (usd)       │
      │ status: ─────────────│
      │  ├─ pending          │
      │  ├─ succeeded ◄──────│───webhook
      │  ├─ failed           │
      │  └─ refunded         │
      │ payment_method (card)│
      │ paid_at              │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐       ┌──────────────────────┐
      │      payouts         │◄──────│    payout_items      │
      │──────────────────────│       │──────────────────────│
      │ id (uuid) PK         │       │ id (uuid) PK         │
      │ mentor_id ───────────│───►   │ payout_id            │
      │ stripe_transfer_id   │       │ transaction_id ──────│───► prevents duplicates
      │ amount               │       │ created_at           │
      │ currency (usd)       │       └──────────────────────┘
      │ status: ─────────────│
      │  ├─ pending          │       ┌──────────────────────┐
      │  ├─ in_transit       │       │   failed_payouts     │
      │  ├─ paid             │       │──────────────────────│
      │  ├─ failed           │       │ id (uuid) PK         │
      │  └─ cancelled        │       │ booking_id           │
      │ failure_reason       │       │ transaction_id       │
      │ scheduled_for        │       │ mentor_id            │
      │ processed_at         │       │ reason               │
      └──────────────────────┘       │ error_details (JSONB)│
                                     │ resolved_at          │
      ┌──────────────────────┐       └──────────────────────┘
      │   stripe_accounts    │
      │──────────────────────│
      │ id (uuid) PK         │
      │ mentor_id (unique) ──│───► FK to profiles
      │ stripe_account_id    │     (acct_xxx - Stripe Connect Express)
      │ onboarding_complete  │
      │ charges_enabled      │
      │ payouts_enabled      │
      └──────────────────────┘


  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                         🔄 FLUJOS DE USUARIO PRINCIPALES                                              │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  FLUJO 1: REGISTRO Y AUTENTICACIÓN
  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

      ┌─────────────┐     POST /signup      ┌─────────────────┐    trigger:           ┌────────────────┐
      │   Usuario   │ ──────────────────► │   auth.users     │ ──handle_new_user──► │    profiles    │
      │  Anónimo    │    {email, password, │  (Supabase Auth) │                      │                │
      └─────────────┘     name, role}       └─────────────────┘                      │ role = student │
                                                                                      │ role = mentor  │
                                                                                      │ is_verified=F  │
      ┌─────────────┐     POST /login       ┌─────────────────┐     session          └────────────────┘
      │   Usuario   │ ──────────────────► │   auth.getUser   │ ──────────────────►  Cookie JWT
      │  Registrado │    {email, password} │                  │
      └─────────────┘                       └─────────────────┘

      MIDDLEWARE (middleware.ts):
      ┌────────────────────────────────────────────────────────────────────────────────────────────┐
      │  /dashboard, /profile/edit, /checkout/* → requireAuth() → redirect /login si no auth       │
      │  /login, /signup → si auth → redirect /dashboard                                            │
      │  /mentors/[id]/book → requireAuth() → redirect /login?returnTo=/mentors/[id]/book          │
      └────────────────────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  FLUJO 2: APLICACIÓN Y VERIFICACIÓN DE MENTOR
  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

      ┌────────────────┐         ┌────────────────┐         ┌────────────────┐         ┌────────────────┐
      │    REGISTRO    │         │   PENDIENTE    │         │    REVISIÓN    │         │   VERIFICADO   │
      │   Como Mentor  │────────►│   VERIFICACIÓN │────────►│    POR ADMIN   │────────►│   (o Rechazado)│
      └────────────────┘         └────────────────┘         └────────────────┘         └────────────────┘

      User signs up                profiles.role = 'mentor'     Admin Dashboard              is_verified = true
      with role=mentor             profiles.is_verified = false  /admin/applications         (puede recibir bookings)

                                                                 GET profiles WHERE          OR
                                                                 role='mentor' AND           rejection_reason = "..."
                                                                 is_verified = false         is_verified = false

      Admin Review Flow:
      ┌───────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                        │
      │  /admin/applications ──► Lista mentores no verificados                                 │
      │         │                                                                              │
      │         ▼                                                                              │
      │  /admin/applications/[id] ──► Detalle del aplicante                                   │
      │         │                     (LinkedIn, GitHub, specialties, description)             │
      │         ▼                                                                              │
      │    ┌─────────┐  ┌───────────┐                                                         │
      │    │ APROBAR │  │ RECHAZAR  │                                                         │
      │    └────┬────┘  └─────┬─────┘                                                         │
      │         ▼             ▼                                                                │
      │    is_verified     rejection_reason = "motivo"                                         │
      │    = true          is_verified = false                                                 │
      │                                                                                        │
      └───────────────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  FLUJO 3: BÚSQUEDA Y RESERVA DE SESIÓN (BOOKING FLOW)
  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

      STUDENT JOURNEY:

      ┌───────────┐    /mentors     ┌──────────────────┐   /mentors/[id]   ┌──────────────────┐
      │  Student  │ ────────────► │  Browse Mentors   │ ──────────────► │  Mentor Profile   │
      │  (Auth)   │                │  (search/filter)  │                  │  (reviews, rate)  │
      └───────────┘                └──────────────────┘                  └────────┬─────────┘
                                                                                   │
                                          Filters:                                 │ "Book Session"
                                          • specialties[]                          ▼
                                          • hourly_rate range              ┌──────────────────┐
                                          • search_mentors_by_keyword()    │  /mentors/[id]/  │
                                          • is_verified = true             │      book        │
                                          • role = 'mentor'                │ (BookingCalendar)│
                                                                           └────────┬─────────┘
                                                                                    │
      ┌─────────────────────────────────────────────────────────────────────────────┴────────────────────────────────┐
      │                                                                                                               │
      │   1. FETCH AVAILABILITY                    2. SELECT SLOT                    3. CONFIRM BOOKING              │
      │   ┌────────────────────────┐              ┌────────────────────────┐         ┌────────────────────────┐      │
      │   │ GET mentor_availability │              │   Calendar UI shows    │         │   INSERT bookings      │      │
      │   │ WHERE mentor_id = :id   │──────────► │   available time slots │────────►│   status='provisional' │      │
      │   │ AND is_active = true    │              │   (excluding existing  │         │   student_id = user.id │      │
      │   └────────────────────────┘              │    bookings)           │         │   mentor_id = :id      │      │
      │                                           └────────────────────────┘         └──────────┬─────────────┘      │
      │                                                                                         │                     │
      │   mentor_availability:                                                                  │                     │
      │   ┌────────────────────────────────────┐                                               ▼                     │
      │   │ day_of_week │ start    │ end      │                              ┌─────────────────────────────────────┐ │
      │   │───────────────────────────────────│                              │     BOOKING STATUS MACHINE          │ │
      │   │     1 (Mon) │ 09:00:00 │ 17:00:00 │                              │─────────────────────────────────────│ │
      │   │     2 (Tue) │ 09:00:00 │ 17:00:00 │                              │                                     │ │
      │   │     3 (Wed) │ 09:00:00 │ 17:00:00 │                              │  provisional ──► pending_payment    │ │
      │   │     4 (Thu) │ 09:00:00 │ 17:00:00 │                              │       │               │             │ │
      │   │     5 (Fri) │ 09:00:00 │ 17:00:00 │                              │       │               │ Stripe Pay  │ │
      │   └────────────────────────────────────┘                              │       │               ▼             │ │
      │                                                                       │       │         confirmed ──────────│ │
      │                                                                       │       │               │             │ │
      │                                                                       │       ▼               ▼             │ │
      │                                                                       │   cancelled ◄── completed          │ │
      │                                                                       │       ▲               │             │ │
      │                                                                       │       └───────────────┘             │ │
      │                                                                       └─────────────────────────────────────┘ │
      │                                                                                                               │
      └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

      INDEX: idx_bookings_no_double_booking (session_date, mentor_id) UNIQUE
      → Previene doble reserva en el mismo horario


  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  FLUJO 4: PAGO CON STRIPE (CHECKOUT FLOW)
  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

      ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                     STRIPE PAYMENT ARCHITECTURE                                               │
      │                                                                                                               │
      │   Platform Fee: 20%                           Mentor Payout: 80%                                              │
      │   ───────────────                             ────────────────                                                │
      │                                                                                                               │
      │                                                                                                               │
      │                              ┌──────────────────────────────────────────┐                                     │
      │                              │           STRIPE PLATFORM                 │                                     │
      │                              │          (Upex My Mentor)                 │                                     │
      │                              └─────────────────┬────────────────────────┘                                     │
      │                                                │                                                              │
      │    ┌───────────────────────────────────────────┼───────────────────────────────────────────┐                  │
      │    │                                           │                                           │                  │
      │    ▼                                           ▼                                           ▼                  │
      │  ┌────────────────┐                    ┌────────────────┐                    ┌────────────────┐               │
      │  │    STUDENT     │                    │   CHECKOUT     │                    │    MENTOR      │               │
      │  │   (Mentee)     │                    │   SESSION      │                    │ Stripe Connect │               │
      │  └───────┬────────┘                    └───────┬────────┘                    └───────┬────────┘               │
      │          │                                     │                                     │                        │
      │          │  1. POST /api/checkout/session      │                                     │                        │
      │          │     { booking_id }                  │                                     │                        │
      │          │─────────────────────────────────────►                                     │                        │
      │          │                                     │                                     │                        │
      │          │                                     │  stripe.checkout.sessions.create    │                        │
      │          │                                     │  • application_fee_amount: 20%      │                        │
      │          │                                     │  • transfer_data.destination:       │                        │
      │          │                                     │      mentor.stripe_account_id       │                        │
      │          │                                     │──────────────────────────────────────►                        │
      │          │                                     │                                     │                        │
      │          │  2. Redirect to Stripe Checkout     │                                     │                        │
      │          │◄─────────────────────────────────────                                     │                        │
      │          │     { checkout_url }                │                                     │                        │
      │          │                                     │                                     │                        │
      │          │  3. User pays on Stripe             │                                     │                        │
      │          │─────────────────────────────────────►                                     │                        │
      │          │                                     │                                     │                        │
      │          │  4. Success redirect                │  5. Webhook: checkout.session.      │                        │
      │          │◄─────────────────────────────────────     completed                       │                        │
      │          │  /checkout/success?session_id=...   │─────────────────────────────────────►                        │
      │                                                │                                     │                        │
      │                                                │  6. transactions INSERT             │                        │
      │                                                │     status = 'succeeded'            │                        │
      │                                                │                                     │                        │
      │                                                │  7. bookings UPDATE                 │                        │
      │                                                │     status = 'confirmed'            │                        │
      │                                                │                                     │                        │
      └────────────────────────────────────────────────┴─────────────────────────────────────┴────────────────────────┘


      STRIPE CONNECT ONBOARDING (Mentores):
      ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                                                │
      │  1. Mentor visita /dashboard/payouts                                                                           │
      │         │                                                                                                      │
      │         ▼                                                                                                      │
      │  2. POST /api/stripe/connect/onboard ──► stripe.accountLinks.create ──► Stripe Onboarding URL                 │
      │         │                                                                                                      │
      │         ▼                                                                                                      │
      │  3. Redirect a Stripe ──► Mentor completa identidad/bank info                                                  │
      │         │                                                                                                      │
      │         ▼                                                                                                      │
      │  4. Return to /dashboard/payouts?stripe_onboarding=success                                                     │
      │         │                                                                                                      │
      │         ▼                                                                                                      │
      │  5. Webhook: account.updated ──► UPDATE stripe_accounts                                                        │
      │         │                        • onboarding_complete = true                                                  │
      │         │                        • charges_enabled = true                                                      │
      │         │                        • payouts_enabled = true                                                      │
      │         ▼                                                                                                      │
      │  6. Mentor puede recibir pagos ✓                                                                               │
      │                                                                                                                │
      │  stripe_accounts:                                                                                              │
      │  ┌───────────────────────────────────────────────────────────────────────────────────────┐                     │
      │  │ mentor_id     │ stripe_account_id  │ onboarding │ charges  │ payouts  │ status      │                     │
      │  │───────────────────────────────────────────────────────────────────────────────────────│                     │
      │  │ uuid-1234     │ acct_1abc123...    │ true       │ true     │ true     │ connected   │                     │
      │  │ uuid-5678     │ acct_2def456...    │ false      │ false    │ false    │ pending     │                     │
      │  └───────────────────────────────────────────────────────────────────────────────────────┘                     │
      │                                                                                                                │
      └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  FLUJO 5: PAYOUT AUTOMÁTICO A MENTORES (CRON JOB)
  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

      ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                                                 │
      │  VERCEL CRON JOB: Daily at 00:00 UTC                                                                           │
      │                                                                                                                 │
      │       ┌───────────────┐        ┌─────────────────────────────────────────────────────────────────────┐         │
      │       │ Vercel Cron   │───────►│  POST /api/cron/process-payouts                                     │         │
      │       │ (scheduler)   │  auth: │  Authorization: Bearer ${CRON_SECRET}                               │         │
      │       └───────────────┘        └────────────────────────────────────────────────────────┬────────────┘         │
      │                                                                                          │                      │
      │                                                                                          ▼                      │
      │       ┌──────────────────────────────────────────────────────────────────────────────────────────────┐         │
      │       │  STEP 1: Find Eligible Payouts                                                                │         │
      │       │  ───────────────────────────────                                                              │         │
      │       │                                                                                               │         │
      │       │  SELECT FROM bookings b                                                                       │         │
      │       │  JOIN transactions t ON t.booking_id = b.id                                                   │         │
      │       │  JOIN stripe_accounts sa ON sa.mentor_id = b.mentor_id                                        │         │
      │       │  LEFT JOIN payout_items pi ON pi.transaction_id = t.id                                        │         │
      │       │  WHERE                                                                                        │         │
      │       │    b.status = 'completed'                                                                     │         │
      │       │    AND b.completed_at < NOW() - INTERVAL '24 hours'   ◄─── 24h grace period                   │         │
      │       │    AND t.status = 'succeeded'                                                                 │         │
      │       │    AND pi.id IS NULL   ◄─── not already paid out                                              │         │
      │       │    AND sa.payouts_enabled = true                                                              │         │
      │       └────────────────────────────────────────────────────────────────────────────────┬─────────────┘         │
      │                                                                                         │                       │
      │                                                                                         ▼                       │
      │       ┌──────────────────────────────────────────────────────────────────────────────────────────────┐         │
      │       │  STEP 2: For Each Eligible Session                                                            │         │
      │       │  ────────────────────────────────                                                             │         │
      │       │                                                                                               │         │
      │       │   ┌─────────────────────┐                                                                     │         │
      │       │   │  stripe.transfers.  │    amount: net_amount (80% of booking)                              │         │
      │       │   │     create()        │    destination: mentor.stripe_account_id                            │         │
      │       │   └──────────┬──────────┘                                                                     │         │
      │       │              │                                                                                │         │
      │       │         ┌────┴────┐                                                                           │         │
      │       │         ▼         ▼                                                                           │         │
      │       │    SUCCESS     FAILURE                                                                        │         │
      │       │       │           │                                                                           │         │
      │       │       ▼           ▼                                                                           │         │
      │       │  INSERT payouts  INSERT failed_payouts                                                        │         │
      │       │  INSERT payout_items                                                                          │         │
      │       │  (links transaction)                                                                          │         │
      │       │                                                                                               │         │
      │       └──────────────────────────────────────────────────────────────────────────────────────────────┘         │
      │                                                                                                                 │
      │  IDEMPOTENCY: payout_items.transaction_id UNIQUE ──► prevents duplicate payouts                                │
      │                                                                                                                 │
      └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  FLUJO 6: SISTEMA DE MENSAJERÍA
  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

      ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                                                │
      │   CONVERSATIONS & MESSAGES (Real-time via Supabase Realtime)                                                   │
      │                                                                                                                │
      │   Student Profile Page                                                                                         │
      │   (/mentors/[id])                                                                                              │
      │         │                                                                                                      │
      │         │  "Send Message" button                                                                               │
      │         ▼                                                                                                      │
      │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     │
      │   │                                                                                                      │     │
      │   │  1. get_or_create_conversation(user_a_id, user_b_id)  ──► PostgreSQL Function                       │     │
      │   │         │                                                                                            │     │
      │   │         │   • Normalizes IDs (smaller first) ──► satisfies CHECK constraint                          │     │
      │   │         │   • Finds existing OR creates new conversation                                             │     │
      │   │         ▼                                                                                            │     │
      │   │   conversation_id returned                                                                           │     │
      │   │         │                                                                                            │     │
      │   │         │                                                                                            │     │
      │   │  2. INSERT INTO messages (conversation_id, sender_id, content)                                       │     │
      │   │         │                                                                                            │     │
      │   │         │   CHECK: length(content) >= 10                                                             │     │
      │   │         ▼                                                                                            │     │
      │   │   message created with is_read = false                                                               │     │
      │   │         │                                                                                            │     │
      │   │         │                                                                                            │     │
      │   │  3. Supabase Realtime broadcasts INSERT                                                              │     │
      │   │         │                                                                                            │     │
      │   │         ▼                                                                                            │     │
      │   │   NotificationContext receives event ──► shows toast + updates badge                                 │     │
      │   │                                                                                                      │     │
      │   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
      │                                                                                                                │
      │   Dashboard Messages:                                                                                          │
      │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     │
      │   │                                                                                                      │     │
      │   │   /dashboard/messages ──► ConversationList                                                           │     │
      │   │         │                    │                                                                       │     │
      │   │         │                    ▼                                                                       │     │
      │   │         │              conversations WITH                                                            │     │
      │   │         │              • other_participant                                                           │     │
      │   │         │              • last_message                                                                │     │
      │   │         │              • unread_count                                                                │     │
      │   │         │                                                                                            │     │
      │   │         ▼                                                                                            │     │
      │   │   /dashboard/messages/[conversationId] ──► ConversationThread                                        │     │
      │   │                                                │                                                     │     │
      │   │                                                ▼                                                     │     │
      │   │                                          messages WITH sender info                                   │     │
      │   │                                          • MessageBubble (own/other)                                 │     │
      │   │                                          • Realtime subscription                                     │     │
      │   │                                                                                                      │     │
      │   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
      │                                                                                                                │
      │   Unread Count API: GET /api/messages/unread-count                                                             │
      │         │                                                                                                      │
      │         ▼                                                                                                      │
      │   SELECT COUNT(*) FROM messages m                                                                              │
      │   JOIN conversations c ON c.id = m.conversation_id                                                             │
      │   WHERE m.is_read = false                                                                                      │
      │   AND m.sender_id != auth.uid()                                                                                │
      │   AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())                                     │
      │                                                                                                                │
      └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  FLUJO 7: REVIEWS Y RATINGS
  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

      ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                                                │
      │   SESSION COMPLETED                                                                                            │
      │         │                                                                                                      │
      │         │   bookings.status = 'completed'                                                                      │
      │         │   bookings.completed_at = NOW()                                                                      │
      │         ▼                                                                                                      │
      │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     │
      │   │                                                                                                      │     │
      │   │   BOTH PARTICIPANTS CAN REVIEW:                                                                      │     │
      │   │                                                                                                      │     │
      │   │   Student → Review Mentor (MYM-33)        Mentor → Review Mentee (MYM-34)                            │     │
      │   │         │                                         │                                                  │     │
      │   │         ▼                                         ▼                                                  │     │
      │   │   /review/submit?booking_id=...            /review/submit?booking_id=...                             │     │
      │   │         │                                         │                                                  │     │
      │   │         │   Eligibility Check:                    │                                                  │     │
      │   │         │   • is participant?                     │                                                  │     │
      │   │         │   • booking completed?                  │                                                  │     │
      │   │         │   • not already reviewed?               │                                                  │     │
      │   │         │                                         │                                                  │     │
      │   │         ▼                                         ▼                                                  │     │
      │   │   INSERT reviews                           INSERT reviews                                            │     │
      │   │   • reviewer_id = student.id               • reviewer_id = mentor.id                                 │     │
      │   │   • subject_id = mentor.id                 • subject_id = student.id                                 │     │
      │   │   • booking_id = :id                       • booking_id = :id                                        │     │
      │   │   • rating (1-5) ★★★★★                    • rating (1-5) ★★★★★                                      │     │
      │   │   • comment                                • comment                                                 │     │
      │   │                                                                                                      │     │
      │   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
      │                                                                                                                │
      │   UNIQUE CONSTRAINT: unique_review_per_booking_reviewer (booking_id, reviewer_id)                              │
      │   → One review per person per session                                                                          │
      │                                                                                                                │
      │   MENTOR PROFILE DISPLAY:                                                                                      │
      │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     │
      │   │                                                                                                      │     │
      │   │   SELECT r.*, reviewer.name, reviewer.photo_url                                                      │     │
      │   │   FROM reviews r                                                                                     │     │
      │   │   JOIN profiles reviewer ON r.reviewer_id = reviewer.id                                              │     │
      │   │   WHERE r.subject_id = :mentor_id                                                                    │     │
      │   │   ORDER BY r.created_at DESC                                                                         │     │
      │   │                                                                                                      │     │
      │   │   Rating Distribution:                                                                               │     │
      │   │   ★★★★★ ████████████████████ 5 reviews                                                              │     │
      │   │   ★★★★☆ ██████████ 3 reviews                                                                        │     │
      │   │   ★★★☆☆ ████ 1 review                                                                               │     │
      │   │   ★★☆☆☆ 0 reviews                                                                                   │     │
      │   │   ★☆☆☆☆ 0 reviews                                                                                   │     │
      │   │                                                                                                      │     │
      │   │   Average: profiles.average_rating (denormalized for performance)                                    │     │
      │   │   Count: profiles.total_reviews                                                                      │     │
      │   │                                                                                                      │     │
      │   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
      │                                                                                                                │
      └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  FLUJO 8: SESSION MANAGEMENT
  ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

      ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                                                │
      │   /dashboard/sessions                                                                                          │
      │         │                                                                                                      │
      │         ├──► Upcoming Tab                       ├──► Past Tab                                                  │
      │         │    (confirmed, today+)                │    (completed, cancelled)                                    │
      │         │                                       │                                                              │
      │         ▼                                       ▼                                                              │
      │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     │
      │   │                                                                                                      │     │
      │   │   SessionCard Display Status:                                                                        │     │
      │   │                                                                                                      │     │
      │   │   ┌──────────────────┬────────────────────────────────────────────────────────────────────────┐     │     │
      │   │   │ Status           │ Condition                                                               │     │     │
      │   │   ├──────────────────┼────────────────────────────────────────────────────────────────────────┤     │     │
      │   │   │ upcoming         │ booking.status = 'confirmed' AND session_date > now                    │     │     │
      │   │   │ joinable         │ within 15min before session_date                                       │     │     │
      │   │   │ in_progress      │ now between session_date and session_date + duration                   │     │     │
      │   │   │ completed        │ booking.status = 'completed' OR now > session end                      │     │     │
      │   │   │ cancelled        │ booking.status = 'cancelled'                                           │     │     │
      │   │   └──────────────────┴────────────────────────────────────────────────────────────────────────┘     │     │
      │   │                                                                                                      │     │
      │   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
      │                                                                                                                │
      │   SESSION ACTIONS:                                                                                             │
      │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     │
      │   │                                                                                                      │     │
      │   │   "Join Session" ──► GET /api/bookings/[id]/video-link                                               │     │
      │   │         │                                                                                            │     │
      │   │         ├── TOO_EARLY_TO_JOIN (> 15min before)                                                       │     │
      │   │         ├── SESSION_EXPIRED (past end time)                                                          │     │
      │   │         ├── LINK_NOT_AVAILABLE (no videocall_url)                                                    │     │
      │   │         └── SUCCESS ──► returns videocall_url                                                        │     │
      │   │                                                                                                      │     │
      │   │   "Cancel Session" ──► POST /api/bookings/[id]/cancel                                                │     │
      │   │         │                                                                                            │     │
      │   │         ├── CANCELLATION_WINDOW_CLOSED (< 24h before)                                                │     │
      │   │         ├── SESSION_NOT_CONFIRMED (not confirmed status)                                             │     │
      │   │         └── SUCCESS ──► Stripe refund + status = 'cancelled'                                         │     │
      │   │                         cancelled_at, cancelled_by, cancellation_reason                              │     │
      │   │                                                                                                      │     │
      │   │   "Add Meeting Link" (Mentor only) ──► PATCH /api/bookings/[id]/meeting-link                         │     │
      │   │         │                                                                                            │     │
      │   │         └── Updates session_meeting_link                                                             │     │
      │   │                                                                                                      │     │
      │   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
      │                                                                                                                │
      └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                              📧 EMAIL NOTIFICATIONS                                                   │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

      ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                                                │
      │   POST /api/email/booking-confirmation                                                                         │
      │         │                                                                                                      │
      │         │   Triggered after booking.status = 'confirmed'                                                       │
      │         │                                                                                                      │
      │         ▼                                                                                                      │
      │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     │
      │   │                                                                                                      │     │
      │   │   Resend.com API ──► Sends to BOTH mentor and student                                                │     │
      │   │                                                                                                      │     │
      │   │   Content:                                                                                           │     │
      │   │   • Session date/time                                                                                │     │
      │   │   • Mentor/Student names                                                                             │     │
      │   │   • Session details                                                                                  │     │
      │   │   • .ics calendar invite attachment                                                                  │     │
      │   │                                                                                                      │     │
      │   │   bookings.confirmation_sent_at = NOW()                                                              │     │
      │   │                                                                                                      │     │
      │   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
      │                                                                                                                │
      │   ENV Variables:                                                                                               │
      │   • RESEND_API_KEY                                                                                             │
      │   • EMAIL_FROM_ADDRESS (MyMentor <hello@...>)                                                                  │
      │   • EMAIL_DRY_RUN (for testing - logs instead of sends)                                                        │
      │                                                                                                                │
      └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                           🔐 ROW LEVEL SECURITY (RLS)                                                 │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

      ┌────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────┐
      │ Table                  │ Policies                                                                            │
      ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
      │ profiles               │ • Users can view all profiles                                                       │
      │                        │ • Users can only UPDATE their own profile (id = auth.uid())                         │
      │                        │ • Admins can update is_verified, rejection_reason                                   │
      ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
      │ bookings               │ • Users can view bookings where they are student_id OR mentor_id                    │
      │                        │ • Students can INSERT (as student_id = auth.uid())                                  │
      │                        │ • Participants can UPDATE status, videocall_url, etc.                               │
      ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
      │ reviews                │ • Anyone can SELECT (public)                                                        │
      │                        │ • Only reviewer_id = auth.uid() can INSERT                                          │
      │                        │ • Only reviewer_id = auth.uid() can UPDATE/DELETE                                   │
      ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
      │ conversations          │ • Users can view where they are participant_1 OR participant_2                      │
      │                        │ • Participants can INSERT (via get_or_create_conversation function)                 │
      ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
      │ messages               │ • Users can view messages in their conversations                                    │
      │                        │ • Only sender_id = auth.uid() can INSERT                                            │
      │                        │ • Recipient can UPDATE is_read = true                                               │
      ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
      │ stripe_accounts        │ • Mentor can view their own account                                                 │
      │                        │ • Webhooks use service_role to bypass RLS                                           │
      ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
      │ transactions           │ • Users can view where they are mentee_id OR mentor_id                              │
      │                        │ • Only service_role can INSERT (from webhook)                                       │
      ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
      │ mentor_availability    │ • Anyone can SELECT (for booking calendar)                                          │
      │                        │ • Only mentor_id = auth.uid() can INSERT/UPDATE/DELETE                              │
      └────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────┘


  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                              🗄️ DATABASE FUNCTIONS                                                    │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

      ┌──────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
      │ Function                         │ Purpose                                                                    │
      ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
      │ handle_new_user()                │ TRIGGER: Creates profile when auth.user is inserted                       │
      │                                  │ • Extracts name, role from raw_user_meta_data                             │
      │                                  │ • Defaults role to 'student'                                              │
      ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
      │ handle_updated_at()              │ TRIGGER: Updates updated_at column on any row change                      │
      │                                  │ • Applied to profiles, bookings, etc.                                     │
      ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
      │ get_or_create_conversation(      │ RPC: Idempotently gets or creates conversation                            │
      │   user_a_id, user_b_id)          │ • Normalizes UUID order (smaller first)                                   │
      │                                  │ • Returns conversation_id                                                 │
      ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
      │ get_all_unique_skills()          │ RPC: Returns all unique specialties from mentors                          │
      │                                  │ • Used for filter/search UI                                               │
      ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
      │ search_mentors_by_keyword(       │ RPC: Fuzzy search mentors by name, bio, specialties                       │
      │   search_keyword)                │ • Uses pg_trgm extension for similarity                                   │
      ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
      │ is_admin()                       │ RPC: Checks if current user has admin role                                │
      │                                  │ • Used for authorization checks                                           │
      └──────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘


  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                               📈 KEY INDEXES                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

      Performance Indexes:
      ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                                                │
      │ profiles:                                                                                                      │
      │   • idx_profiles_role_verified (role, is_verified) ──► /mentors listing                                        │
      │   • idx_profiles_name_trgm (name) USING GIN ──► fuzzy search                                                   │
      │   • idx_profiles_specialties_gin (specialties) USING GIN ──► specialty filter                                  │
      │   • idx_profiles_avg_rating (average_rating) ──► sort by rating                                                │
      │                                                                                                                │
      │ bookings:                                                                                                      │
      │   • idx_bookings_no_double_booking (session_date, mentor_id) UNIQUE ──► prevent conflicts                      │
      │   • idx_bookings_mentor (mentor_id) ──► mentor dashboard                                                       │
      │   • idx_bookings_student (student_id) ──► student dashboard                                                    │
      │   • idx_bookings_status (status) ──► filter by status                                                          │
      │   • idx_bookings_completed_at (completed_at) ──► payout cron query                                             │
      │                                                                                                                │
      │ messages:                                                                                                      │
      │   • idx_messages_conversation_id ──► fetch conversation messages                                               │
      │   • idx_messages_unread (conversation_id, is_read) ──► unread count                                            │
      │                                                                                                                │
      └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


  ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
  ║                                              🧪 TESTING GUIDE                                                         ║
  ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

      Para testing de esta base de datos, considerar estos flujos críticos:

      ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │ TEST SCENARIO                                 │ TABLES INVOLVED                   │ KEY VALIDATIONS           │
      ├───────────────────────────────────────────────┼───────────────────────────────────┼───────────────────────────┤
      │ 1. User Registration                          │ auth.users → profiles             │ trigger fires, role set   │
      │ 2. Mentor Verification                        │ profiles                          │ is_verified, admin only   │
      │ 3. Mentor Availability Setup                  │ mentor_availability               │ no overlapping slots      │
      │ 4. Booking Creation                           │ bookings                          │ no double booking         │
      │ 5. Payment Flow                               │ transactions, bookings            │ status transitions        │
      │ 6. Payout Processing                          │ payouts, payout_items, failed_*   │ 24h delay, idempotency    │
      │ 7. Messaging                                  │ conversations, messages           │ RLS, realtime             │
      │ 8. Review Submission                          │ reviews                           │ one per booking/reviewer  │
      │ 9. Session Cancellation                       │ bookings, transactions            │ 24h window, refund        │
      └───────────────────────────────────────────────┴───────────────────────────────────┴───────────────────────────┘

      API ENDPOINTS FOR E2E TESTING:
      ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                                                                                                 │
      │ Authentication:                                                                                                 │
      │   • POST /signup, POST /login, GET /auth/callback                                                              │
      │                                                                                                                 │
      │ Mentors:                                                                                                        │
      │   • GET /mentors (search, filter)                                                                               │
      │   • GET /mentors/[id] (profile)                                                                                 │
      │   • GET /api/mentors/[id]/availability                                                                          │
      │                                                                                                                 │
      │ Bookings:                                                                                                       │
      │   • POST (via Supabase client)                                                                                  │
      │   • GET /api/bookings/[id]/video-link                                                                           │
      │   • PATCH /api/bookings/[id]/meeting-link                                                                       │
      │   • POST /api/bookings/[id]/cancel                                                                              │
      │                                                                                                                 │
      │ Payments:                                                                                                       │
      │   • POST /api/checkout/session                                                                                  │
      │   • GET /api/stripe/connect/status                                                                              │
      │   • POST /api/stripe/connect/onboard                                                                            │
      │   • POST /api/stripe/webhook                                                                                    │
      │                                                                                                                 │
      │ Messaging:                                                                                                      │
      │   • GET /api/messages/unread-count                                                                              │
      │   • RPC: get_or_create_conversation                                                                             │
      │                                                                                                                 │
      │ Admin:                                                                                                          │
      │   • GET /admin/applications                                                                                     │
      │   • PATCH profiles (is_verified, rejection_reason)                                                              │
      │                                                                                                                 │
      └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
  ║                                              📊 STATS ACTUALES                                                        ║
  ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
  ║  profiles: 49 registros (students: ~35, mentors: ~14, admin: ?)                                                      ║
  ║  reviews: 16 registros (ratings 4-5, mainly for verified mentors)                                                    ║
  ║  bookings: 0 registros (no active bookings in current data)                                                          ║
  ║  transactions: 0 registros                                                                                           ║
  ║  stripe_accounts: 4 registros (mentors con Stripe Connect)                                                           ║
  ║  mentor_availability: 33 registros (horarios semanales)                                                              ║
  ║  conversations: 7 registros                                                                                          ║
  ║  messages: 53 registros                                                                                              ║
  ║  communication_channels: 3 registros                                                                                 ║
  ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

● He creado un mapa funcional completo del schema de la base de datos de MyMentor. El mapa incluye:

  Resumen del Schema (12 tablas con RLS habilitado):

  | Tabla                                   | Propósito                       | Registros |
  | --------------------------------------- | ------------------------------- | --------- |
  | profiles                                | Usuarios (student/mentor/admin) | 49        |
  | reviews                                 | Reseñas de sesiones (★1-5)      | 16        |
  | bookings                                | Reservas de mentoría            | 0         |
  | stripe_accounts                         | Cuentas Stripe Connect          | 4         |
  | transactions                            | Pagos procesados                | 0         |
  | payouts / payout_items / failed_payouts | Sistema de pago a mentores      | 0         |
  | mentor_availability                     | Horarios semanales              | 33        |
  | conversations / messages                | Sistema de mensajería           | 7/53      |
  | communication_channels                  | Canales de contacto             | 3         |

  8 Flujos Principales Documentados:

  1. Registro/Auth → auth.users trigger → profiles
  2. Verificación Mentor → Admin aprueba/rechaza → is_verified
  3. Booking Flow → provisional → pending_payment → confirmed → completed
  4. Stripe Checkout → 20% platform fee, 80% mentor → transactions
  5. Payout Cron → 24h después de completado → payouts
  6. Mensajería → get_or_create_conversation() → Realtime
  7. Reviews → Ambos pueden dejar review → unique per booking/reviewer
  8. Session Management → Join, Cancel (24h window), Meeting Link

  El mapa es útil para:
  - Database testing: Entender constraints, indexes y RLS policies
  - API testing: Ver endpoints y flujos de datos
  - E2E testing: Seguir journeys completos de usuario
```
