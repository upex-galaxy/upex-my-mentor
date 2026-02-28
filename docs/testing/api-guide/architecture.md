# Arquitectura del Sistema - APIs & Endpoints

> Documentacion tecnica de la arquitectura de APIs para proyectos Supabase + Next.js.
> Este documento es clave para el equipo de QA para entender como testear cada tipo de endpoint.

---

## Las Dos APIs del Proyecto

```
+-----------------------------------------------------------------------------+
|                          NAVEGADOR / CLIENTE                                 |
+-------------------------------------+---------------------------------------+
                                      |
                  +-------------------+-------------------+
                  |                                       |
                  v                                       v
+-------------------------------------+   +---------------------------------------+
|                                     |   |                                       |
|    SUPABASE REST API (PostgREST)    |   |     NEXT.JS API ROUTES (Custom)       |
|                                     |   |                                       |
|  Base: {{SUPABASE_URL}}/rest/v1/    |   |  Base: localhost:3000/api (o Vercel)  |
|  Ej: abc123.supabase.co/rest/v1/    |   |                                       |
|                                     |   |                                       |
|  +-------------------------------+  |   |  +-------------------------------+    |
|  | Autenticacion:                |  |   |  | Autenticacion:                |    |
|  |                               |  |   |  |                               |    |
|  | - Header: apikey (siempre)    |  |   |  | - Cookie: sb-xxx-auth-token   |    |
|  | - Header: Authorization Bearer|  |   |  |   (manejado automaticamente)  |    |
|  |   (JWT del usuario)           |  |   |  | - O Header: X-API-Key (cron)  |    |
|  +-------------------------------+  |   |  +-------------------------------+    |
|                                     |   |                                       |
|  Endpoints (auto-generados):        |   |  Endpoints (manuales):                |
|  - GET/POST/PATCH/DELETE /users     |   |  - POST /api/checkout/session         |
|  - GET/POST/PATCH/DELETE /products  |   |  - POST /api/orders/[id]/cancel       |
|  - GET/POST/PATCH/DELETE /orders    |   |  - GET  /api/orders/[id]/tracking     |
|  - GET/POST/PATCH/DELETE /reviews   |   |  - POST /api/webhooks/stripe          |
|  - GET /payments                    |   |  - POST /api/cron/process-payouts     |
|  - ... (todas las tablas)           |   |  - ... (endpoints custom)             |
|                                     |   |                                       |
|  Seguridad: RLS Policies            |   |  Seguridad: Codigo del servidor       |
|  (PostgreSQL nivel DB)              |   |  (validaciones en cada route.ts)      |
|                                     |   |                                       |
+-------------------------------------+   +---------------------------------------+
                  |                                       |
                  |                                       |
                  v                                       v
+-----------------------------------------------------------------------------+
|                                                                             |
|                            SUPABASE (PostgreSQL)                            |
|                                                                             |
|   +---------------------------------------------------------------------+   |
|   |                              TABLAS                                 |   |
|   |  users | products | orders | reviews | payments | categories | ...  |   |
|   +---------------------------------------------------------------------+   |
|                                                                             |
|   +---------------------------------------------------------------------+   |
|   |                           RLS POLICIES                              |   |
|   |  "Users can view their own orders"                                  |   |
|   |  "Admins can update any product"                                    |   |
|   |  "QA team full access" (para testing)                               |   |
|   +---------------------------------------------------------------------+   |
|                                                                             |
+-----------------------------------------------------------------------------+
                  |                                       |
                  v                                       v
+-------------------------------------+   +---------------------------------------+
|         SERVICIOS EXTERNOS          |   |            VERCEL CRON                |
|                                     |   |                                       |
|  - Stripe (pagos)                   |   |  Ejecuta periodicamente:              |
|  - Resend/SendGrid (emails)         |   |  POST /api/cron/process-payouts       |
|  - Shipping API (envios)            |   |  POST /api/cron/cleanup-expired       |
|                                     |   |                                       |
+-------------------------------------+   +---------------------------------------+
```

---

## Endpoints Custom Tipicos de Next.js

```
+-----------------------------------------------------------------------------+
|                      ENDPOINTS CUSTOM (Next.js API Routes)                   |
+-----------------------------------------------------------------------------+
|                                                                             |
|  PAGOS & CHECKOUT                                                           |
|  |-- POST   /api/checkout/session           --> Crear sesion de pago       |
|  |-- POST   /api/stripe/connect/onboard     --> Onboarding vendedor         |
|  |-- GET    /api/stripe/connect/status      --> Estado cuenta vendedor      |
|  +-- POST   /api/webhooks/stripe            --> Webhooks de Stripe          |
|                                                                             |
|  ORDENES (Logica compleja)                                                  |
|  |-- POST   /api/orders/[id]/cancel         --> Cancelar + reembolso        |
|  |-- PATCH  /api/orders/[id]/status         --> Actualizar estado           |
|  +-- GET    /api/orders/[id]/tracking       --> Obtener tracking de envio   |
|                                                                             |
|  PRODUCTOS & INVENTARIO                                                     |
|  |-- GET    /api/products/[id]/availability --> Verificar stock             |
|  +-- POST   /api/products/bulk-update       --> Actualizacion masiva        |
|                                                                             |
|  NOTIFICACIONES & EMAIL                                                     |
|  |-- POST   /api/email/order-confirmation   --> Enviar email confirmacion   |
|  +-- GET    /api/notifications/unread       --> Contador de no leidas       |
|                                                                             |
|  SISTEMA & CRON                                                             |
|  |-- POST   /api/cron/process-payouts       --> Job: procesar pagos         |
|  |-- POST   /api/cron/cleanup-expired       --> Job: limpiar expirados      |
|  +-- POST   /api/testing/seed-data          --> QA: sembrar datos de prueba |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## Donde Esta Documentado Cada Tipo

```
+-----------------------------------------------------------------------------+
|                        DONDE ESTA DOCUMENTADO?                               |
+-----------------------------------------------------------------------------+
|                                                                             |
|  SUPABASE REST API (PostgREST)                                              |
|  +-- Documentado automaticamente en:                                        |
|      - /api-docu (Redoc) si lo configuras en el proyecto                   |
|      - Supabase Dashboard > API Docs                                        |
|      - {{SUPABASE_URL}}/rest/v1/?apikey={{ANON_KEY}}                       |
|        Ejemplo: https://abc123.supabase.co/rest/v1/?apikey=eyJ...          |
|                                                                             |
|  NEXT.JS API ROUTES (Custom)                                                |
|  +-- NO tienen documentacion auto-generada                                  |
|  +-- Documentados en:                                                       |
|      - Codigo fuente (JSDoc en route.ts)                                   |
|      - OpenAPI spec manual (si lo creas)                                   |
|      - Esta guia de testing                                                |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## Diferencia Clave: Autenticacion por Tipo

```
+-----------------------------------------------------------------------------+
|                         AUTENTICACION POR TIPO                               |
+-----------------------------------------------------------------------------+
|                                                                             |
|  SUPABASE REST (/rest/v1/*)                                                 |
|  +-----------------------------------------------------------------------+  |
|  |  Headers:                                                             |  |
|  |    apikey: eyJhbGciOiJIUzI1NiIs...  (anon key - SIEMPRE)              |  |
|  |    Authorization: Bearer eyJ...      (JWT usuario - si autenticado)   |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  NEXT.JS API (/api/*)                                                       |
|  +-----------------------------------------------------------------------+  |
|  |  Autenticacion via COOKIES (automatico desde el navegador)            |  |
|  |                                                                       |  |
|  |  Cookie: sb-{{PROJECT_REF}}-auth-token=base64...                      |  |
|  |  Ejemplo: sb-abcdefghijklmnop-auth-token=eyJhY2Nlc3...                |  |
|  |                                                                       |  |
|  |  O para endpoints especiales:                                         |  |
|  |    X-API-Key: {{API_KEY}} (para /api/email/*, /api/testing/*)         |  |
|  |    Authorization: Bearer {{CRON_SECRET}} (para /api/cron/*)           |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## Tabla de Requisitos por Endpoint (Ejemplo)

| Endpoint                        | Metodo | Auth             | Requisitos Especiales        |
| ------------------------------- | ------ | ---------------- | ---------------------------- |
| /api/checkout/session           | POST   | Cookie           | Body: { order_id }           |
| /api/orders/[id]/cancel         | POST   | Cookie           | Usuario debe ser propietario |
| /api/orders/[id]/status         | PATCH  | Cookie           | Solo admin puede cambiar     |
| /api/orders/[id]/tracking       | GET    | Cookie           | Dentro de ventana de tiempo  |
| /api/stripe/connect/onboard     | POST   | Cookie           | Usuario debe ser vendedor    |
| /api/stripe/connect/status      | GET    | Cookie           | Usuario debe ser vendedor    |
| /api/webhooks/stripe            | POST   | Stripe-Signature | Solo Stripe puede llamar     |
| /api/products/[id]/availability | GET    | Ninguna          | Publico                      |
| /api/notifications/unread       | GET    | Cookie           | -                            |
| /api/email/order-confirmation   | POST   | X-API-Key        | Clave interna                |
| /api/cron/process-payouts       | POST   | Authorization    | CRON_SECRET                  |
| /api/testing/seed-data          | POST   | X-API-Key        | Solo en dev/staging          |

---

## Diagrama de Flujo: Ejemplo Completo de Compra

```
+-----------------------------------------------------------------------------+
|                     FLUJO COMPLETO: USUARIO REALIZA COMPRA                   |
+-----------------------------------------------------------------------------+

  USUARIO                     NEXT.JS                  SUPABASE              STRIPE
      |                          |                         |                    |
      |  1. Ver productos        |                         |                    |
      |------------------------->|                         |                    |
      |   GET /rest/v1/products  |   (directo a Supabase)  |                    |
      |   + apikey               |-----------------+------>|                    |
      |<-------------------------|<----------------+-------|                    |
      |   productos disponibles  |                         |                    |
      |                          |                         |                    |
      |  2. Agregar al carrito   |                         |                    |
      |------------------------->|                         |                    |
      |  POST /rest/v1/cart_items|   (directo a Supabase)  |                    |
      |  + apikey + JWT          |-----------------+------>|                    |
      |<-------------------------|<----------------+-------|                    |
      |   item agregado          |                         |                    |
      |                          |                         |                    |
      |  3. Crear orden          |                         |                    |
      |------------------------->|                         |                    |
      |  POST /rest/v1/orders    |   (directo a Supabase)  |                    |
      |  + apikey + JWT          |-----------------+------>|                    |
      |<-------------------------|<----------------+-------|                    |
      |   orden creada (pending) |                         |                    |
      |                          |                         |                    |
      |  4. Iniciar pago         |                         |                    |
      |------------------------->|                         |                    |
      |  POST /api/checkout/     |   5. Validar orden      |                    |
      |       session            |------------------------>|                    |
      |  + Cookie sesion         |<------------------------|                    |
      |                          |   6. Crear Checkout     |                    |
      |                          |------------------------------------------>|
      |                          |<------------------------------------------|
      |<-------------------------|   checkout URL          |                    |
      |   redirect a Stripe      |                         |                    |
      |                          |                         |                    |
      |  7. Pago completado      |                         |                    |
      |   (redirect back)        |                         |                    |
      |                          |                         |                    |
      |                          |   8. Webhook            |                    |
      |                          |<------------------------------------------|
      |                          |  POST /api/webhooks/stripe                  |
      |                          |                         |                    |
      |                          |   9. Update orden       |                    |
      |                          |------------------------>|                    |
      |                          |   status='paid'         |                    |
      |                          |   + crear payment       |                    |
      |                          |                         |                    |
      |                          |   10. Send email        |                    |
      |                          |----> Resend/SendGrid    |                    |
      |<---------------------------------------------------------|             |
      |   Email de confirmacion  |                         |                    |
      |                          |                         |                    |
```

---

## Resumen para QA

```
+-----------------------------------------------------------------------------+
|                              RESUMEN PARA QA                                 |
+-----------------------------------------------------------------------------+
|                                                                             |
|  Hay DOS APIs diferentes:                                                   |
|                                                                             |
|  1. SUPABASE REST (/rest/v1/*)                                              |
|      - Auto-generada, documentada en API Docs de Supabase                   |
|      - CRUD directo a la DB                                                 |
|      - Auth: apikey + JWT en headers                                        |
|      - Testing: Postman, MCP api, DevTools                                  |
|                                                                             |
|  2. NEXT.JS API (/api/*)                                                    |
|      - Endpoints custom con logica de negocio                               |
|      - NO documentada automaticamente                                       |
|      - Auth: Cookies de sesion (automatico en browser)                      |
|      - Testing: DevTools (facil), Postman (copiar cookies)                  |
|                                                                             |
|  Para testing completo:                                                     |
|      - Login en la app (obtener cookies)                                    |
|      - DevTools: ver requests automaticamente                               |
|      - Postman: copiar cookies del browser                                  |
|      - Playwright: usa page.context() que maneja cookies                    |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## Siguiente Paso

- Para entender el flujo de autenticacion: [authentication.md](./authentication.md)
- Para empezar a testear manualmente: [devtools-testing.md](./devtools-testing.md)
