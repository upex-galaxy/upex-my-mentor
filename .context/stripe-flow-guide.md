# Stripe Payment Flow Guide

Guía completa del flujo de pagos con Stripe en MyMentor.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              STRIPE PAYMENT ARCHITECTURE                             │
│                                                                                      │
│   Platform Fee: 20%                              Mentor Payout: 80%                  │
│                                                                                      │
│                        ┌──────────────────────────────────┐                          │
│                        │       STRIPE PLATFORM            │                          │
│                        │      (Upex My Mentor)            │                          │
│                        │                                  │                          │
│                        │  STRIPE_SECRET_KEY               │                          │
│                        │  STRIPE_WEBHOOK_SECRET           │                          │
│                        │  STRIPE_WEBHOOK_SECRET_CONNECT   │                          │
│                        └───────────────┬──────────────────┘                          │
│                                        │                                             │
│         ┌──────────────────────────────┼──────────────────────────────┐              │
│         │                              │                              │              │
│         ▼                              ▼                              ▼              │
│   ┌───────────┐               ┌────────────────┐             ┌────────────────┐      │
│   │  STUDENT  │               │    WEBHOOKS    │             │    MENTOR      │      │
│   │ (Mentee)  │               │                │             │ Stripe Connect │      │
│   │           │               │ • checkout.*   │             │ Express        │      │
│   │ Paga $50  │               │ • account.*    │             │                │      │
│   └───────────┘               └────────────────┘             │ Recibe $40     │      │
│                                                              └────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo 1: Estudiante Reserva y Paga

### Diagrama de Secuencia

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐     ┌──────────┐
│ Student  │     │  Frontend    │     │  Backend    │     │   Stripe   │     │ Database │
└────┬─────┘     └──────┬───────┘     └──────┬──────┘     └─────┬──────┘     └────┬─────┘
     │                  │                    │                  │                  │
     │ 1. Select slot   │                    │                  │                  │
     │─────────────────►│                    │                  │                  │
     │                  │                    │                  │                  │
     │                  │ 2. createBooking() │                  │                  │
     │                  │───────────────────►│                  │                  │
     │                  │                    │                  │                  │
     │                  │                    │ 3. Check payouts_enabled            │
     │                  │                    │─────────────────────────────────────►│
     │                  │                    │◄─────────────────────────────────────│
     │                  │                    │                  │                  │
     │                  │                    │ 4. INSERT booking (pending_payment) │
     │                  │                    │─────────────────────────────────────►│
     │                  │                    │                  │                  │
     │                  │                    │ 5. Create Checkout Session          │
     │                  │                    │─────────────────►│                  │
     │                  │                    │◄─────────────────│                  │
     │                  │                    │  checkout_url    │                  │
     │                  │◄───────────────────│                  │                  │
     │                  │                    │                  │                  │
     │ 6. Redirect to Stripe                 │                  │                  │
     │◄─────────────────│                    │                  │                  │
     │                  │                    │                  │                  │
     │ 7. Pay with card │                    │                  │                  │
     │─────────────────────────────────────────────────────────►│                  │
     │                  │                    │                  │                  │
     │ 8. Success redirect                   │                  │                  │
     │◄─────────────────────────────────────────────────────────│                  │
     │                  │                    │                  │                  │
     │                  │                    │ 9. Webhook: checkout.session.completed
     │                  │                    │◄─────────────────│                  │
     │                  │                    │                  │                  │
     │                  │                    │ 10. UPDATE booking → confirmed      │
     │                  │                    │     INSERT transaction              │
     │                  │                    │─────────────────────────────────────►│
     │                  │                    │                  │                  │
```

### Estados del Booking

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌─────────────┐
│   provisional   │────►│  pending_payment │────►│  confirmed  │────►│  completed  │
└─────────────────┘     └──────────────────┘     └─────────────┘     └─────────────┘
        │                        │                      │                    │
        │                        │                      │                    │
        ▼                        ▼                      ▼                    ▼
   (abandonado)            (no pagó 24h)           (cancelado)          (review)
        │                        │                      │
        └────────────────────────┴──────────────────────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │  cancelled  │
                          └─────────────┘
```

### Archivos Involucrados

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/app/mentors/[id]/book/actions.ts` | Server Action: valida mentor, crea booking, inicia checkout |
| `src/app/api/checkout/session/route.ts` | API: crea Checkout Session para booking existente |
| `src/app/checkout/[bookingId]/page.tsx` | UI: muestra resumen y botón de pago |
| `src/app/checkout/resume/page.tsx` | Redirect: reanuda pago de booking pendiente |
| `src/app/checkout/success/page.tsx` | UI: confirmación post-pago |
| `src/app/api/stripe/webhook/route.ts` | Webhook: procesa `checkout.session.completed` |

---

## Flujo 2: Mentor Configura Stripe Connect

### Diagrama de Secuencia

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐     ┌──────────┐
│  Mentor  │     │  Frontend    │     │  Backend    │     │   Stripe   │     │ Database │
└────┬─────┘     └──────┬───────┘     └──────┬──────┘     └─────┬──────┘     └────┬─────┘
     │                  │                    │                  │                  │
     │ 1. /dashboard/payouts                 │                  │                  │
     │─────────────────►│                    │                  │                  │
     │                  │                    │                  │                  │
     │                  │ 2. Check stripe_accounts              │                  │
     │                  │───────────────────────────────────────────────────────────►│
     │                  │◄──────────────────────────────────────────────────────────│
     │                  │    (no account or incomplete)         │                  │
     │                  │                    │                  │                  │
     │ 3. Click "Connect Stripe"             │                  │                  │
     │─────────────────►│                    │                  │                  │
     │                  │                    │                  │                  │
     │                  │ 4. POST /api/stripe/connect/onboard   │                  │
     │                  │───────────────────►│                  │                  │
     │                  │                    │                  │                  │
     │                  │                    │ 5. Create Express Account           │
     │                  │                    │─────────────────►│                  │
     │                  │                    │◄─────────────────│                  │
     │                  │                    │   acct_xxx       │                  │
     │                  │                    │                  │                  │
     │                  │                    │ 6. INSERT stripe_accounts           │
     │                  │                    │─────────────────────────────────────►│
     │                  │                    │                  │                  │
     │                  │                    │ 7. Create Account Link              │
     │                  │                    │─────────────────►│                  │
     │                  │                    │◄─────────────────│                  │
     │                  │◄───────────────────│   onboarding_url │                  │
     │                  │                    │                  │                  │
     │ 8. Redirect to Stripe Onboarding      │                  │                  │
     │◄─────────────────│                    │                  │                  │
     │                  │                    │                  │                  │
     │ 9. Complete identity & bank info      │                  │                  │
     │─────────────────────────────────────────────────────────►│                  │
     │                  │                    │                  │                  │
     │ 10. Return to app                     │                  │                  │
     │◄─────────────────────────────────────────────────────────│                  │
     │                  │                    │                  │                  │
     │                  │                    │ 11. Webhook: account.updated        │
     │                  │                    │◄─────────────────│                  │
     │                  │                    │                  │                  │
     │                  │                    │ 12. UPDATE stripe_accounts          │
     │                  │                    │     charges_enabled = true          │
     │                  │                    │     payouts_enabled = true          │
     │                  │                    │─────────────────────────────────────►│
     │                  │                    │                  │                  │
```

### Estados de stripe_accounts

| Campo | Descripción |
|-------|-------------|
| `onboarding_complete` | Mentor completó el flujo de onboarding |
| `charges_enabled` | Stripe permite recibir cargos en esta cuenta |
| `payouts_enabled` | Stripe permite enviar pagos a esta cuenta |

**Validación crítica:** Solo permitir checkout si `payouts_enabled = true`

---

## Webhooks

### Configuración

| Ambiente | URL | Secret Variable |
|----------|-----|-----------------|
| Production | `https://upexmymentor.vercel.app/api/stripe/webhook` | `STRIPE_WEBHOOK_SECRET` |
| Staging | `https://staging-upexmymentor.vercel.app/api/stripe/webhook` | `STRIPE_WEBHOOK_SECRET` |
| Localhost | `localhost:3000/api/stripe/webhook` (via Stripe CLI) | `STRIPE_WEBHOOK_SECRET` |

### Webhooks Requeridos

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   STRIPE WEBHOOKS                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   YOUR ACCOUNT (Platform Events)                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │ Event: checkout.session.completed                                            │   │
│   │                                                                              │   │
│   │ Trigger: Estudiante completa pago en Stripe Checkout                         │   │
│   │                                                                              │   │
│   │ Action:                                                                      │   │
│   │   1. INSERT transaction (status: succeeded)                                  │   │
│   │   2. UPDATE booking (status: confirmed)                                      │   │
│   │   3. (Future) Trigger confirmation email                                     │   │
│   │                                                                              │   │
│   │ Secret: STRIPE_WEBHOOK_SECRET                                                │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│   CONNECTED ACCOUNTS (Connect Events)                                                │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │ Event: account.updated                                                       │   │
│   │                                                                              │   │
│   │ Trigger: Mentor completa verificación o cambia estado de cuenta              │   │
│   │                                                                              │   │
│   │ Action:                                                                      │   │
│   │   UPDATE stripe_accounts SET                                                 │   │
│   │     onboarding_complete = details_submitted AND charges AND payouts,         │   │
│   │     charges_enabled = account.charges_enabled,                               │   │
│   │     payouts_enabled = account.payouts_enabled                                │   │
│   │                                                                              │   │
│   │ Secret: STRIPE_WEBHOOK_SECRET_CONNECT                                        │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Verificación de Firma

El código soporta ambos secrets automáticamente:

```typescript
// src/lib/stripe/server.ts
export function verifyWebhookSignature(body, signature) {
  // Intenta con STRIPE_WEBHOOK_SECRET primero
  // Si falla, intenta con STRIPE_WEBHOOK_SECRET_CONNECT
}
```

---

## Desarrollo Local

### Setup con Stripe CLI

```bash
# 1. Instalar Stripe CLI
brew install stripe/stripe-cli/stripe   # macOS
# o ver https://stripe.com/docs/stripe-cli

# 2. Autenticarte
stripe login

# 3. Iniciar listener (en terminal separada)
stripe listen \
  --forward-to localhost:3000/api/stripe/webhook \
  --forward-connect-to localhost:3000/api/stripe/webhook

# Output:
# Ready! Your webhook signing secret is whsec_xxx
# Ready! Your Connect webhook signing secret is whsec_yyy
```

### Variables en `.env.local`

```env
# Stripe Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Webhook Secrets (from stripe listen output)
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_yyy
```

### Tarjetas de Test

| Número | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 3220` | Requiere 3D Secure |
| `4000 0000 0000 9995` | Pago rechazado |

---

## Validaciones Implementadas

### Antes de Crear Booking

```typescript
// src/app/mentors/[id]/book/actions.ts

// 1. Usuario autenticado
if (!user) return { error: 'UNAUTHORIZED' }

// 2. Mentor existe y está verificado
if (!mentor || !mentor.is_verified) return { error: 'Mentor no encontrado' }

// 3. Mentor tiene Stripe Connect habilitado
if (!stripeAccount?.payouts_enabled) {
  return {
    error: 'Este mentor aún no ha completado la verificación de pagos',
    errorCode: 'MENTOR_NOT_VERIFIED'
  }
}

// 4. Slot no ocupado
if (existingBooking) return { error: 'SLOT_TAKEN' }
```

### En API de Checkout

```typescript
// src/app/api/checkout/session/route.ts

// Verificar payouts_enabled antes de crear session
if (!stripeAccount.payouts_enabled) {
  return { error: 'Mentor payment account is not fully verified' }
}
```

---

## Cron Jobs

### Cleanup de Bookings Abandonados

```
Schedule: 0 * * * * (cada hora)
Endpoint: /api/cron/cleanup-bookings
```

Cancela bookings en `pending_payment` que:
- Fueron creados hace más de 24 horas, O
- La fecha de sesión ya pasó

### Payout a Mentores

```
Schedule: 0 0 * * * (diario a medianoche UTC)
Endpoint: /api/cron/process-payouts
```

Procesa pagos a mentores para sesiones completadas hace más de 24 horas.

---

## Troubleshooting

### Booking queda en `pending_payment`

1. **Verificar webhook configurado** en Stripe Dashboard
2. **Verificar `STRIPE_WEBHOOK_SECRET`** en Vercel
3. **Ver logs de webhook** en Stripe Dashboard → Webhooks → Recent deliveries

### Mentor no puede recibir pagos

1. Verificar en DB: `stripe_accounts.payouts_enabled = true`
2. Si es `false`, mentor debe completar onboarding en Stripe
3. Verificar webhook `account.updated` está configurado

### Sesiones no aparecen en dashboard

1. Verificar estado del booking en DB
2. Si es `pending_payment`, el webhook no procesó
3. Ahora se muestran con badge "Pendiente de pago" y botón para completar

---

## Variables de Entorno

| Variable | Descripción | Ambientes |
|----------|-------------|-----------|
| `STRIPE_SECRET_KEY` | API key de Stripe (server-side) | Todos |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | API key pública (client-side) | Todos |
| `STRIPE_WEBHOOK_SECRET` | Firma para webhooks de Your Account | Todos |
| `STRIPE_WEBHOOK_SECRET_CONNECT` | Firma para webhooks de Connected Accounts | Todos |

**Nota:** Usamos Stripe en **Test Mode** para todos los ambientes (proyecto educativo).
