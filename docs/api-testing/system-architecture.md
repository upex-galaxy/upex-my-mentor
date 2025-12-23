# System Architecture - APIs & Endpoints

> Documentación técnica de la arquitectura de APIs del proyecto Upex My Mentor.
> Este documento es clave para el equipo de QA para entender cómo testear cada tipo de endpoint.

---

## Los 14 Endpoints Custom de Next.js

┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENDPOINTS CUSTOM (Next.js API Routes)               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔵 STRIPE & PAGOS                                                          │
│  ├── POST   /api/checkout/session           → Crear sesión de pago         │
│  ├── POST   /api/stripe/connect/onboard     → Onboarding mentor Stripe     │
│  ├── GET    /api/stripe/connect/status      → Estado cuenta Stripe mentor  │
│  └── POST   /api/stripe/webhook             → Webhooks de Stripe           │
│                                                                             │
│  🟢 BOOKINGS (Lógica compleja)                                              │
│  ├── POST   /api/bookings/[id]/cancel       → Cancelar + reembolso         │
│  ├── PATCH  /api/bookings/[id]/meeting-link → Mentor agrega link           │
│  └── GET    /api/bookings/[id]/video-link   → Obtener link de sesión       │
│                                                                             │
│  🟡 MENTORES & USUARIOS                                                     │
│  ├── GET    /api/mentors/[id]/availability  → Disponibilidad del mentor    │
│  ├── GET    /api/users/[id]/communication-channels → Canales públicos      │
│  └── GET/PUT /api/users/me/communication-channels  → Mis canales           │
│                                                                             │
│  🟣 MENSAJERÍA & EMAIL                                                      │
│  ├── GET    /api/messages/unread-count      → Contador de no leídos        │
│  └── POST   /api/email/booking-confirmation → Enviar email confirmación    │
│                                                                             │
│  ⚙️  SISTEMA                                                                 │
│  ├── POST   /api/cron/process-payouts       → Job: procesar pagos (diario) │
│  └── POST   /api/testing/trigger-confirmation → QA: trigger email test     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Arquitectura Completa del Proyecto

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    NAVEGADOR / CLIENTE                                  │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
                    ▼                                               ▼
┌───────────────────────────────────────┐   ┌───────────────────────────────────────────┐
│                                       │   │                                           │
│     SUPABASE REST API (PostgREST)     │   │      NEXT.JS API ROUTES (Custom)          │
│                                       │   │                                           │
│  Base: ionevzckjyxtpmyenbxc.supabase  │   │  Base: localhost:3000/api (o Vercel)      │
│        .co/rest/v1/                   │   │                                           │
│                                       │   │                                           │
│  ┌─────────────────────────────────┐  │   │  ┌─────────────────────────────────────┐  │
│  │ Autenticación:                  │  │   │  │ Autenticación:                      │  │
│  │                                 │  │   │  │                                     │  │
│  │ • Header: apikey (siempre)      │  │   │  │ • Cookie: sb-xxx-auth-token         │  │
│  │ • Header: Authorization Bearer  │  │   │  │   (manejado automáticamente)        │  │
│  │   (JWT del usuario)             │  │   │  │ • O Header: X-API-Key (para cron)   │  │
│  └─────────────────────────────────┘  │   │  └─────────────────────────────────────┘  │
│                                       │   │                                           │
│  Endpoints (auto-generados):          │   │  Endpoints (manuales):                    │
│  • GET/POST/PATCH/DELETE /profiles    │   │  • POST /api/checkout/session             │
│  • GET/POST/PATCH/DELETE /bookings    │   │  • POST /api/bookings/[id]/cancel         │
│  • GET/POST/PATCH/DELETE /reviews     │   │  • GET  /api/stripe/connect/status        │
│  • GET/POST/PATCH/DELETE /messages    │   │  • POST /api/stripe/webhook               │
│  • GET/POST /conversations            │   │  • GET  /api/mentors/[id]/availability    │
│  • GET/POST /mentor_availability      │   │  • POST /api/cron/process-payouts         │
│  • GET /transactions                  │   │  • ... (14 endpoints en total)            │
│  • ... (todas las tablas)             │   │                                           │
│                                       │   │                                           │
│  Seguridad: RLS Policies              │   │  Seguridad: Código del servidor           │
│  (PostgreSQL nivel DB)                │   │  (validaciones en cada route.ts)          │
│                                       │   │                                           │
└───────────────────────────┬───────────┘   └────────────────────┬──────────────────────┘
                            │                                    │
                            │                                    │
                            ▼                                    ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│                              SUPABASE (PostgreSQL)                                    │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐     │
│   │                                TABLAS                                       │     │
│   │  profiles │ bookings │ reviews │ messages │ conversations │ transactions   │     │
│   │  mentor_availability │ communication_channels │ stripe_accounts │ payouts  │     │
│   └─────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐     │
│   │                           RLS POLICIES                                      │     │
│   │  "Users can view their own bookings"                                        │     │
│   │  "Mentors can update own availability"                                      │     │
│   │  "QA team full access" (para testing)                                       │     │
│   └─────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
                            │                                    │
                            │                                    │
                            ▼                                    ▼
┌───────────────────────────────────────┐   ┌───────────────────────────────────────────┐
│         SERVICIOS EXTERNOS            │   │            VERCEL CRON                    │
│                                       │   │                                           │
│  • Stripe (pagos)                     │   │  Ejecuta diariamente:                     │
│  • Resend (emails)                    │   │  POST /api/cron/process-payouts           │
│                                       │   │                                           │
└───────────────────────────────────────┘   └───────────────────────────────────────────┘

---

## ¿Están en la API Docs de Supabase?

**NO.** Los endpoints custom de Next.js **NO aparecen** en `/api-docu` (Redoc).

┌─────────────────────────────────────────────────────────────────────────────┐
│                        ¿DÓNDE ESTÁ DOCUMENTADO?                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📗 /api-docu (Redoc - Supabase)                                            │
│  └── Solo muestra: /rest/v1/profiles, /rest/v1/bookings, etc.               │
│      (endpoints auto-generados de PostgREST)                                │
│                                                                             │
│  📘 Endpoints Custom (Next.js)                                              │
│  └── NO tienen documentación auto-generada                                  │
│  └── Documentados en: código fuente (JSDoc en route.ts)                     │
│  └── Para QA: Ver esta guía + código                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Cómo Testear los Endpoints Custom

### Diferencia Clave: Autenticación

┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTENTICACIÓN POR TIPO                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SUPABASE REST (/rest/v1/*)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Headers:                                                           │    │
│  │    apikey: eyJhbGciOiJIUzI1NiIs...  (anon key - SIEMPRE)            │    │
│  │    Authorization: Bearer eyJ...      (JWT usuario - si autenticado) │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  NEXT.JS API (/api/*)                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Autenticación via COOKIES (automático desde el navegador)          │    │
│  │                                                                     │    │
│  │  Cookie: sb-ionevzckjyxtpmyenbxc-auth-token=base64...               │    │
│  │                                                                     │    │
│  │  O para endpoints especiales:                                       │    │
│  │    X-API-Key: dev-api-key (para /api/email/*, /api/testing/*)       │    │
│  │    Authorization: Bearer <CRON_SECRET> (para /api/cron/*)           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Testing en DevTools

```javascript
// Los endpoints Next.js usan cookies, NO headers
// Cuando estás logueado en el navegador, las cookies se envían automáticamente

// Ejemplo: Ver en Network tab después de hacer login y navegar
fetch('/api/messages/unread-count')
  .then(r => r.json())
  .then(console.log)
// Las cookies van automáticamente
```

### Testing en Postman

```bash
# PROBLEMA: Postman no tiene las cookies de sesión

# SOLUCIÓN 1: Copiar cookies del navegador
# 1. Login en la app
# 2. DevTools > Application > Cookies
# 3. Copiar: sb-ionevzckjyxtpmyenbxc-auth-token
# 4. En Postman: Headers > Cookie: sb-ionevzckjyxtpmyenbxc-auth-token=<valor>

# SOLUCIÓN 2: Para endpoints con API Key
POST /api/email/booking-confirmation
Headers:
  X-API-Key: dev-api-key
  Content-Type: application/json
Body:
  { "bookingId": "uuid-aqui" }
```

---

## Tabla de Requisitos por Endpoint

| Endpoint                               | Método  | Auth             | Requisitos Especiales           |
| -------------------------------------- | ------- | ---------------- | ------------------------------- |
| /api/checkout/session                  | POST    | Cookie           | Body: { booking_id }            |
| /api/bookings/[id]/cancel              | POST    | Cookie           | Usuario debe ser participante   |
| /api/bookings/[id]/meeting-link        | PATCH   | Cookie           | Solo el mentor puede actualizar |
| /api/bookings/[id]/video-link          | GET     | Cookie           | Dentro de ventana de tiempo     |
| /api/stripe/connect/onboard            | POST    | Cookie           | Usuario debe ser mentor         |
| /api/stripe/connect/status             | GET     | Cookie           | Usuario debe ser mentor         |
| /api/stripe/webhook                    | POST    | Stripe-Signature | Solo Stripe puede llamar        |
| /api/mentors/[id]/availability         | GET     | Ninguna          | Público                         |
| /api/messages/unread-count             | GET     | Cookie           | -                               |
| /api/users/[id]/communication-channels | GET     | Ninguna          | Público                         |
| /api/users/me/communication-channels   | GET/PUT | Cookie           | -                               |
| /api/email/booking-confirmation        | POST    | X-API-Key        | dev-api-key                     |
| /api/cron/process-payouts              | POST    | Authorization    | CRON_SECRET                     |
| /api/testing/trigger-confirmation      | POST    | X-API-Key        | Solo en dev/staging             |

---

## Diagrama de Flujo: Ejemplo Completo de Booking

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO COMPLETO: ESTUDIANTE RESERVA SESIÓN                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ESTUDIANTE                    NEXT.JS                  SUPABASE              STRIPE
      │                            │                         │                    │
      │  1. Ver disponibilidad     │                         │                    │
      ├───────────────────────────►│                         │                    │
      │   GET /api/mentors/[id]/   │                         │                    │
      │       availability         │   2. Query DB           │                    │
      │                            ├────────────────────────►│                    │
      │                            │◄────────────────────────┤                    │
      │◄───────────────────────────┤   slots disponibles     │                    │
      │                            │                         │                    │
      │  3. Crear booking          │                         │                    │
      ├────────────────────────────┼────────────────────────►│                    │
      │  POST /rest/v1/bookings    │   (directo a Supabase)  │                    │
      │  + apikey + JWT            │                         │                    │
      │◄───────────────────────────┼────────────────────────┤                    │
      │   booking creado (provisional)                       │                    │
      │                            │                         │                    │
      │  4. Iniciar pago           │                         │                    │
      ├───────────────────────────►│                         │                    │
      │  POST /api/checkout/session│   5. Crear Checkout     │                    │
      │  + Cookie sesión           ├────────────────────────►│                    │
      │                            │◄────────────────────────┤                    │
      │                            │   6. Crear Session      │                    │
      │                            ├───────────────────────────────────────────►│
      │                            │◄───────────────────────────────────────────┤
      │◄───────────────────────────┤   checkout URL          │                    │
      │   redirect a Stripe        │                         │                    │
      │                            │                         │                    │
      │  7. Pago completado        │                         │                    │
      │   (redirect back)          │                         │                    │
      │                            │                         │                    │
      │                            │   8. Webhook            │                    │
      │                            │◄───────────────────────────────────────────┤
      │                            │  POST /api/stripe/webhook                   │
      │                            │                         │                    │
      │                            │   9. Update booking     │                    │
      │                            ├────────────────────────►│                    │
      │                            │   status='confirmed'    │                    │
      │                            │   + create transaction  │                    │
      │                            │                         │                    │
      │                            │   10. Send email        │                    │
      │                            ├────► Resend API         │                    │
      │◄─────────────────────────────────────────────────────│                    │
      │   Email de confirmación    │                         │                    │
      │                            │                         │                    │
```

---

## Resumen para QA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RESUMEN PARA QA                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Hay DOS APIs diferentes:                                                   │
│                                                                             │
│  1️⃣  SUPABASE REST (/rest/v1/*)                                             │
│      • Auto-generada, documentada en /api-docu                              │
│      • CRUD directo a la DB                                                 │
│      • Auth: apikey + JWT en headers                                        │
│      • Testing: Postman, MCP api, DevTools                                  │
│                                                                             │
│  2️⃣  NEXT.JS API (/api/*)                                                   │
│      • 14 endpoints custom con lógica de negocio                            │
│      • NO documentada en Redoc                                              │
│      • Auth: Cookies de sesión (automático en browser)                      │
│      • Testing: DevTools (fácil), Postman (copiar cookies)                  │
│                                                                             │
│  Para testing completo:                                                     │
│      • Login en la app (obtener cookies)                                    │
│      • DevTools: ver requests automáticamente                               │
│      • Postman: copiar cookies del browser                                  │
│      • Playwright: usa page.context() que maneja cookies                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
