# Stripe Connect Issues - Investigación y Resolución

**Fecha de investigación:** 2026-01-11
**Reportado por:** Tester Agustina
**Investigado por:** Claude + Sai

---

## Síntomas Reportados

1. **Pago muestra "exitoso"** pero en Dashboard aparece como "pendiente de pago"
2. **"Mis Sesiones"** vacío tanto para Mentor como Estudiante
3. **Stripe Connect** muestra mensaje de éxito ("Your account has been successfully connected")
   pero también "Stripe necesita información adicional para habilitar los pagos"

---

## Datos de Prueba (Mentor 31)

```
ID: e4bad9de-432b-42d0-9ed2-532283149e87
Email: agustinatramanzoli@gmail.com
Stripe Account: acct_1Sk85iBt88eJY3PP

Estado en DB:
- onboarding_complete: false
- charges_enabled: false
- payouts_enabled: false
- stripe_updated: 2025-12-30 (nunca actualizado por webhook)

Bookings: 6 registros, TODOS con status "pending_payment"
Transactions: 0 registros (ninguna transacción creada)
```

---

## Root Causes Identificados

### Bug #1: Validación Inconsistente en Checkout

**Ubicación:** `src/app/mentors/[id]/book/actions.ts:151-162`

**Problema:** El flujo de booking directo permite crear checkout sessions incluso cuando
el mentor NO tiene `payouts_enabled`. En lugar de bloquear, simplemente omite el
`transfer_data`, lo que significa que el pago va a la plataforma sin transferir al mentor.

**Código problemático:**
```typescript
// Solo agrega transfer si charges_enabled es true
// Si es false, el pago procede pero el mentor no recibe nada
if (stripeAccount?.stripe_account_id && stripeAccount.charges_enabled) {
  sessionParams.payment_intent_data = {
    application_fee_amount: platformFee,
    transfer_data: { destination: stripeAccount.stripe_account_id },
  }
}
```

**Comparación:** El endpoint `/api/checkout/session/route.ts` SÍ valida correctamente:
```typescript
if (!stripeAccount.payouts_enabled) {
  return NextResponse.json(
    { error: 'Mentor payment account is not fully verified' },
    { status: 400 }
  )
}
```

---

### Bug #2 & #3: Webhook NO Configurado (ROOT CAUSE PRINCIPAL)

**Diagnóstico:** No existe webhook endpoint configurado en Stripe Dashboard.

**Evidencia:**
- Stripe genera eventos `checkout.session.completed` y `account.updated`
- Pero no hay endpoint donde enviarlos
- El `STRIPE_WEBHOOK_SECRET` en Vercel es de un webhook inexistente/eliminado

**Consecuencias:**
1. Bookings nunca se actualizan de `pending_payment` a `confirmed`
2. Transactions nunca se crean en la DB
3. Estado de cuenta Connect nunca se sincroniza (`charges_enabled`, `payouts_enabled`)

**Eventos observados en Stripe Dashboard:**
- `checkout.session.completed` - Jan 11, 2026, 9:56:18 PM UTC (no entregado)
- `account.updated` - Dec 8, 2025 (último evento, no entregado)

---

### Bug #4: Sesiones No Visibles (Consecuencia)

**Ubicación:** `src/app/dashboard/sessions/page.tsx:47`

**Problema:** Query filtra solo sesiones con status `confirmed`, `completed`, `cancelled`.
Los bookings con `pending_payment` nunca aparecen.

```typescript
.in("status", ["confirmed", "completed", "cancelled"])
```

---

## Solución Implementada

### Fix #1: Validación de Checkout
Agregar validación en `actions.ts` para bloquear checkout si mentor no está verificado.

### Fix #2 & #3: Configuración de Webhook
**Acciones manuales requeridas:**
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://staging-upexmymentor.vercel.app/api/stripe/webhook`
3. Eventos: `checkout.session.completed`, `account.updated`
4. Copiar nuevo signing secret
5. Actualizar `STRIPE_WEBHOOK_SECRET` en Vercel

### Fix #4: Solución Completa para pending_payment
1. Incluir `pending_payment` en query de sessions
2. Mostrar badge visual claro ("Pendiente de pago")
3. Agregar botón "Completar pago"
4. Crear cron job para auto-expirar bookings abandonados

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/app/mentors/[id]/book/actions.ts` | Agregar validación payouts_enabled |
| `src/app/dashboard/sessions/page.tsx` | Incluir pending_payment en query |
| `src/components/sessions/session-card.tsx` | Badge + botón completar pago |
| `src/app/api/cron/cleanup-bookings/route.ts` | Nuevo - auto-expiración |

---

## Notas Adicionales

- Proyecto usa Stripe en **modo test** para todos los ambientes (staging, local, prod)
- Mismo Supabase database compartido entre ambientes
- Los errores 400 en logs de Stripe son de intentos de checkout que fallaron por otras razones

---

## Estado

- [x] Investigación completada
- [x] Fix #1 implementado (validación en actions.ts)
- [ ] Fix #2 & #3 configurado (usuario - webhook + secret)
- [x] Fix #4 implementado (sessions page, SessionCard, checkout resume, cron job)
- [ ] Verificación completa
- [ ] Bug creado en Jira
