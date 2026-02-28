# Testing Analysis - Issues Ready for QA

> **Fecha de Generación:** 2026-01-07
> **Proyecto:** MyMentor (MYM)
> **Status Analizado:** Ready for QA
> **Total User Stories:** 23

---

## Resumen Ejecutivo

Este documento analiza todas las issues en estado "Ready for QA" y clasifica los **niveles de testing** (pirámide) y **tipos de testing** (funcional/no funcional) necesarios para cada una.

### Leyenda

**Niveles de Testing (Pirámide):**
- **Unit**: Tests unitarios de funciones/componentes aislados
- **Integration**: Tests de integración entre módulos/servicios
- **E2E**: Tests end-to-end de flujos completos de usuario

**Tipos de Testing Funcional:**
- **UI**: Interfaz de usuario, componentes visuales, interacciones
- **Database**: Operaciones de base de datos, RLS policies, triggers
- **API**: Endpoints, Server Actions, Edge Functions, Webhooks

**Tipos de Testing No Funcional:**
- **Security**: Autenticación, autorización, RLS, XSS, CSRF
- **Performance**: Tiempos de respuesta, carga
- **Accessibility**: WCAG, navegación por teclado

---

## Estadísticas Generales

| Métrica | Valor |
|---------|-------|
| Total User Stories | 23 |
| Requieren E2E | 22 (96%) |
| Requieren Integration | 23 (100%) |
| Requieren Unit | 23 (100%) |
| Requieren UI Testing | 20 (87%) |
| Requieren DB Testing | 18 (78%) |
| Requieren API Testing | 20 (87%) |
| Requieren Security Testing | 12 (52%) |
| Requieren Accessibility Testing | 19 (83%) |

---

## User Stories - Tablas Resumen

### Tabla Resumen - Niveles de Testing

| Key | Título | E2E | Integration | Unit |
|-----|--------|:---:|:-----------:|:----:|
| MYM-4 | Login/Logout | ✅ | ✅ | ✅ |
| MYM-5 | Mentee Basic Profile | ✅ | ✅ | ✅ |
| MYM-7 | Password Reset | ✅ | ✅ | ✅ |
| MYM-9 | Admin View Pending Applications | ✅ | ✅ | ✅ |
| MYM-10 | Admin Review Application Details | ✅ | ✅ | ✅ |
| MYM-11 | Admin Approve/Reject Application | ✅ | ✅ | ✅ |
| MYM-12 | Email Notification for Application | ✅ | ✅ | ✅ |
| MYM-15 | Search Mentors by Keyword | ✅ | ✅ | ✅ |
| MYM-16 | Filter Mentors by Skills | ✅ | ✅ | ✅ |
| MYM-17 | View Mentor Profile | ✅ | ✅ | ✅ |
| MYM-19 | Mentor Set Availability | ✅ | ✅ | ✅ |
| MYM-20 | Availability Timezone Conversion | ✅ | ✅ | ✅ |
| MYM-21 | Book Session | ✅ | ✅ | ✅ |
| MYM-22 | Email Confirmation + Calendar | ✅ | ✅ | ✅ |
| MYM-24 | Stripe Checkout Payment | ✅ | ✅ | ✅ |
| MYM-25 | Stripe Connect Onboarding | ✅ | ✅ | ✅ |
| MYM-27 | Automatic Payout (Cron) | ❌ | ✅ | ✅ |
| MYM-29 | User Dashboard Sessions | ✅ | ✅ | ✅ |
| MYM-30 | Communication Channels | ✅ | ✅ | ✅ |
| MYM-33 | Mentee Rate Mentor | ✅ | ✅ | ✅ |
| MYM-34 | Mentor Rate Mentee | ✅ | ✅ | ✅ |
| MYM-56 | Send Message Before Booking | ✅ | ✅ | ✅ |
| MYM-71 | Theme Preference Persistence | ✅ | ✅ | ✅ |

### Tabla Resumen - Tipos de Testing Funcional

| Key | Título | UI | Database | API |
|-----|--------|:--:|:--------:|:---:|
| MYM-4 | Login/Logout | ✅ | ❌ | ✅ |
| MYM-5 | Mentee Basic Profile | ✅ | ✅ | ✅ |
| MYM-7 | Password Reset | ✅ | ❌ | ✅ |
| MYM-9 | Admin View Pending Applications | ✅ | ✅ | ✅ |
| MYM-10 | Admin Review Application Details | ✅ | ✅ | ✅ |
| MYM-11 | Admin Approve/Reject Application | ✅ | ✅ | ✅ |
| MYM-12 | Email Notification for Application | ❌ | ✅ | ✅ |
| MYM-15 | Search Mentors by Keyword | ✅ | ✅ | ✅ |
| MYM-16 | Filter Mentors by Skills | ✅ | ✅ | ✅ |
| MYM-17 | View Mentor Profile | ✅ | ✅ | ✅ |
| MYM-19 | Mentor Set Availability | ✅ | ✅ | ✅ |
| MYM-20 | Availability Timezone Conversion | ✅ | ❌ | ❌ |
| MYM-21 | Book Session | ✅ | ✅ | ✅ |
| MYM-22 | Email Confirmation + Calendar | ❌ | ✅ | ✅ |
| MYM-24 | Stripe Checkout Payment | ✅ | ✅ | ✅ |
| MYM-25 | Stripe Connect Onboarding | ✅ | ✅ | ✅ |
| MYM-27 | Automatic Payout (Cron) | ❌ | ✅ | ✅ |
| MYM-29 | User Dashboard Sessions | ✅ | ✅ | ✅ |
| MYM-30 | Communication Channels | ✅ | ✅ | ✅ |
| MYM-33 | Mentee Rate Mentor | ✅ | ✅ | ✅ |
| MYM-34 | Mentor Rate Mentee | ✅ | ✅ | ✅ |
| MYM-56 | Send Message Before Booking | ✅ | ✅ | ✅ |
| MYM-71 | Theme Preference Persistence | ✅ | ❌ | ❌ |

### Tabla Resumen - Testing No Funcional

| Key | Título | Security | Performance | Accessibility |
|-----|--------|:--------:|:-----------:|:-------------:|
| MYM-4 | Login/Logout | ✅ | ❌ | ✅ |
| MYM-5 | Mentee Basic Profile | ❌ | ❌ | ✅ |
| MYM-7 | Password Reset | ✅ | ❌ | ✅ |
| MYM-9 | Admin View Pending Applications | ✅ | ❌ | ✅ |
| MYM-10 | Admin Review Application Details | ✅ | ❌ | ✅ |
| MYM-11 | Admin Approve/Reject Application | ✅ | ❌ | ❌ |
| MYM-12 | Email Notification for Application | ❌ | ❌ | ❌ |
| MYM-15 | Search Mentors by Keyword | ✅ | ✅ | ✅ |
| MYM-16 | Filter Mentors by Skills | ❌ | ✅ | ✅ |
| MYM-17 | View Mentor Profile | ❌ | ❌ | ✅ |
| MYM-19 | Mentor Set Availability | ❌ | ❌ | ✅ |
| MYM-20 | Availability Timezone Conversion | ❌ | ❌ | ❌ |
| MYM-21 | Book Session | ✅ | ❌ | ✅ |
| MYM-22 | Email Confirmation + Calendar | ❌ | ❌ | ❌ |
| MYM-24 | Stripe Checkout Payment | ✅ | ❌ | ✅ |
| MYM-25 | Stripe Connect Onboarding | ✅ | ❌ | ❌ |
| MYM-27 | Automatic Payout (Cron) | ✅ | ❌ | ❌ |
| MYM-29 | User Dashboard Sessions | ❌ | ❌ | ✅ |
| MYM-30 | Communication Channels | ❌ | ❌ | ✅ |
| MYM-33 | Mentee Rate Mentor | ✅ | ❌ | ✅ |
| MYM-34 | Mentor Rate Mentee | ✅ | ❌ | ✅ |
| MYM-56 | Send Message Before Booking | ✅ | ❌ | ✅ |
| MYM-71 | Theme Preference Persistence | ❌ | ❌ | ✅ |

---

## Análisis Detallado - User Stories

### MYM-4: User Login and Logout ⭐ CRÍTICO

| Atributo | Valor |
|----------|-------|
| **Epic** | Authentication |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |

**Descripción:** Usuario registrado puede hacer login/logout de forma segura.

**Componentes Involucrados:**
- `/login` page
- `AuthContext` (client-side)
- Supabase Auth (`signInWithPassword`, `signOut`)
- Middleware de protección de rutas
- Cookies HttpOnly+Secure

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Login exitoso → dashboard, login fallido, logout → homepage |
| Integration | ✅ | AuthContext + Supabase Auth + Middleware |
| Unit | ✅ | Validación de formulario, manejo de errores |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Formulario login, mensajes de error, redirecciones |
| Database | ❌ | Solo usa Supabase Auth (no tablas custom) |
| API | ✅ | Supabase Auth endpoints, session management |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Rate limiting (5 intentos/15min), HttpOnly cookies, XSS |
| Performance | ❌ | N/A |
| Accessibility | ✅ | Form labels, keyboard navigation |

**Edge Cases Documentados:**
- Session expiry (7 días)
- Cross-tab logout sync
- Network failure recovery

---

### MYM-5: Mentee Create Basic Profile

| Atributo | Valor |
|----------|-------|
| **Epic** | User Profiles |
| **Prioridad** | Medium |

**Descripción:** Mentee actualiza su perfil con nombre y bio.

**Componentes Involucrados:**
- Profile settings page
- Form components
- `profiles` table (UPSERT)

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Flujo completo: editar → guardar → ver cambios |
| Integration | ✅ | Form + Server Action + Database |
| Unit | ✅ | Validación de campos, sanitización |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Form pre-populated, estados de carga, feedback |
| Database | ✅ | UPSERT en `profiles`, RLS policies |
| API | ✅ | Server action para actualizar perfil |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ❌ | RLS cubre autorización |
| Accessibility | ✅ | Form labels, error messages |

---

### MYM-7: Password Reset ⭐ CRÍTICO

| Atributo | Valor |
|----------|-------|
| **Epic** | Authentication |
| **Prioridad** | Medium |

**Descripción:** Usuario puede solicitar y completar reset de contraseña.

**Componentes Involucrados:**
- `/forgot-password` page
- `/reset-password` page (con token)
- Supabase Auth `resetPasswordForEmail`
- Email service

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Solicitar reset → email → click link → nueva contraseña |
| Integration | ✅ | Form + Supabase Auth + Email callback |
| Unit | ✅ | Validación de email, validación de nueva contraseña |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Forms, mensajes de confirmación, manejo de token |
| Database | ❌ | Supabase Auth maneja todo internamente |
| API | ✅ | Supabase Auth API, email webhook |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Token expiry, user enumeration prevention |
| Accessibility | ✅ | Form labels |

---

### MYM-9: Admin View Pending Applications

| Atributo | Valor |
|----------|-------|
| **Epic** | Mentor Vetting |
| **Prioridad** | Medium |

**Descripción:** Admin ve lista de aplicaciones de mentores pendientes.

**Componentes Involucrados:**
- Admin dashboard (`/admin/applications`)
- `profiles` table (query `role='mentor'` + `vetting_status='pending'`)
- RLS policy admin-only

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Admin login → ver lista de pendientes |
| Integration | ✅ | Admin UI + RLS + Database query |
| Unit | ✅ | Componentes de lista, filtros |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Tabla de aplicaciones, nombre, email, fecha |
| Database | ✅ | Query optimizada, RLS admin policy |
| API | ✅ | Endpoint protegido para listar pendientes |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Solo admins pueden acceder |
| Accessibility | ✅ | Tabla accesible |

---

### MYM-10: Admin Review Individual Application

| Atributo | Valor |
|----------|-------|
| **Epic** | Mentor Vetting |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |

**Descripción:** Admin ve detalles completos de una aplicación de mentor.

**Componentes Involucrados:**
- Detail view/modal
- `profiles` table (fetch by ID)

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Click en aplicación → ver todos los detalles |
| Integration | ✅ | List → Detail view + Database |
| Unit | ✅ | Componente de detalle, formateo de datos |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Mostrar nombre, bio, skills, experiencia |
| Database | ✅ | Fetch de mentor profile completo |
| API | ✅ | Endpoint de detalle protegido |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Solo admins |
| Accessibility | ✅ | Modal accesible |

---

### MYM-11: Admin Approve/Reject Application ⭐ CRÍTICO

| Atributo | Valor |
|----------|-------|
| **Epic** | Mentor Vetting |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |

**Descripción:** Admin aprueba o rechaza aplicación de mentor.

**Componentes Involucrados:**
- Approve/Reject buttons
- Edge Function o API endpoint
- `profiles.vetting_status` update
- `application_audit_log` table
- Trigger para email (MYM-12)

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Admin aprueba → status cambia → email enviado |
| Integration | ✅ | UI + API + DB + Email trigger |
| Unit | ✅ | Lógica de cambio de status, audit log |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Botones Approve/Reject, feedback visual |
| Database | ✅ | Update status, audit log, trigger email |
| API | ✅ | PUT `/api/admin/applications/:id/status` |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Solo admins (403 para otros), RLS |

**Edge Cases Documentados:**
- Usuario no-admin intenta aprobar (403)
- Solicitud ya procesada (409 Conflict)
- Simultaneidad de dos admins
- Perfil eliminado durante revisión

---

### MYM-12: Email Notification for Application Status

| Atributo | Valor |
|----------|-------|
| **Epic** | Mentor Vetting |
| **Prioridad** | Medium |

**Descripción:** Sistema envía email al mentor cuando su aplicación es aprobada/rechazada.

**Componentes Involucrados:**
- Database trigger (on `vetting_status` change)
- Edge Function para envío de email
- Email templates (approval/rejection)

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Aprobar mentor → verificar email recibido |
| Integration | ✅ | Trigger + Edge Function + Email service |
| Unit | ✅ | Template rendering, lógica de trigger |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ❌ | Backend-only |
| Database | ✅ | Trigger on status change |
| API | ✅ | Edge Function, email service integration |

---

### MYM-15: Search Mentors by Keyword

| Atributo | Valor |
|----------|-------|
| **Epic** | Mentor Discovery |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |

**Descripción:** Mentee busca mentores por keyword en bio/skills/name.

**Componentes Involucrados:**
- Search input component
- `search_mentors_by_keyword` RPC function
- Full-text search (tsvector)

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Buscar "React" → ver resultados filtrados |
| Integration | ✅ | Search input + RPC + Database |
| Unit | ✅ | Debounce, sanitización de input |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Search bar, resultados, "no results" state |
| Database | ✅ | Full-text search, índices, performance |
| API | ✅ | RPC `search_mentors_by_keyword` |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Input sanitization (SQL injection prevention) |
| Performance | ✅ | Debounce, query optimization |
| Accessibility | ✅ | Aria-live for results |

---

### MYM-16: Filter Mentors by Skills

| Atributo | Valor |
|----------|-------|
| **Epic** | Mentor Discovery |
| **Prioridad** | Medium |

**Descripción:** Mentee filtra mentores por skills seleccionadas.

**Componentes Involucrados:**
- Multi-select filter component
- Query con `@>` array containment
- Combinación con search

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Seleccionar Python + Django → ver filtrados |
| Integration | ✅ | Filter UI + Query builder + Database |
| Unit | ✅ | Filter state management, query construction |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Multi-select, chips, clear filters |
| Database | ✅ | Array query, índice GIN |
| API | ✅ | Query parameter handling |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Performance | ✅ | Query con múltiples filtros |
| Accessibility | ✅ | Filtros accesibles |

---

### MYM-17: View Mentor Detailed Profile

| Atributo | Valor |
|----------|-------|
| **Epic** | Mentor Discovery |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |

**Descripción:** Mentee ve perfil completo de un mentor.

**Componentes Involucrados:**
- `/mentors/[id]` page (SSR/SSG)
- `profiles` table + `reviews` join
- SEO metadata

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Click en card → ver perfil completo |
| Integration | ✅ | Dynamic route + Database fetch |
| Unit | ✅ | Profile components, rating display |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Name, bio, skills, rate, reviews, photo |
| Database | ✅ | Join profiles + reviews |
| API | ✅ | Server-side fetch |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Accessibility | ✅ | Semantic HTML, images alt text |

**Edge Cases Documentados:**
- Mentor sin reviews
- Mentor con bio muy larga
- Mentor no existente (404)
- Mentor no verificado (404)

---

### MYM-19: Mentor Set Weekly Availability

| Atributo | Valor |
|----------|-------|
| **Epic** | Scheduling & Booking |
| **Prioridad** | Medium |

**Descripción:** Mentor configura su disponibilidad semanal recurrente.

**Componentes Involucrados:**
- Calendar interface component
- `mentor_availability` table
- UTC timezone storage

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Crear/modificar slots → guardar → ver en perfil |
| Integration | ✅ | Calendar UI + Atomic DB operation |
| Unit | ✅ | Time slot validation, overlap detection |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Drag-to-create calendar, slot editing |
| Database | ✅ | Atomic replace (delete all + insert new) |
| API | ✅ | Availability CRUD endpoint |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Accessibility | ✅ | Calendar keyboard navigation |

---

### MYM-20: Availability Timezone Conversion

| Atributo | Valor |
|----------|-------|
| **Epic** | Scheduling & Booking |
| **Prioridad** | Medium |

**Descripción:** Mentee ve disponibilidad convertida a su timezone local.

**Componentes Involucrados:**
- Browser timezone detection
- `date-fns-tz` conversion
- Display formatting

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Mentor GMT → Mentee EST ve hora convertida |
| Integration | ✅ | Timezone detection + Conversion + Display |
| Unit | ✅ | Conversion functions, DST handling |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Mostrar timezone del usuario, tiempos correctos |
| Database | ❌ | UTC storage, conversion client-side |
| API | ❌ | Conversion client-side |

---

### MYM-21: Book Session ⭐ CRÍTICO

| Atributo | Valor |
|----------|-------|
| **Epic** | Scheduling & Booking |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |

**Descripción:** Mentee selecciona slot disponible y reserva sesión.

**Componentes Involucrados:**
- Booking calendar
- `bookings` table (create with 'pending_payment')
- Race condition handling
- Stripe checkout redirect

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Seleccionar slot → crear booking → redirect Stripe |
| Integration | ✅ | Calendar + Booking creation + Payment initiation |
| Unit | ✅ | Slot availability check, conflict detection |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Calendar, slot selection, confirmation modal |
| Database | ✅ | Create booking, check availability atomic |
| API | ✅ | Create session, Stripe checkout session |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Double-booking prevention, TOCTOU |
| Accessibility | ✅ | Calendar interaction |

**Edge Cases:**
- Slot taken while selecting (race condition)
- Payment timeout

---

### MYM-22: Email Confirmation + Calendar Invite ⭐ CRÍTICO

| Atributo | Valor |
|----------|-------|
| **Epic** | Scheduling & Booking |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |

**Descripción:** Sistema envía email con .ics después de pago confirmado.

**Componentes Involucrados:**
- Stripe webhook (`checkout.session.completed`)
- Edge Function para email
- `ical-generator` para .ics
- `date-fns-tz` para timezone
- `bookings.confirmation_sent_at`

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Pago exitoso → email con .ics recibido |
| Integration | ✅ | Webhook + Edge Function + Email + DB update |
| Unit | ✅ | .ics generation, timezone conversion, retry logic |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ❌ | Backend-only |
| Database | ✅ | Update `confirmation_sent_at` |
| API | ✅ | Webhook handler, email service |

**Edge Cases Documentados:**
- Email service down (retry 3x exponential backoff)
- DST boundary booking
- Invalid email address

---

### MYM-24: Stripe Checkout Payment ⭐ CRÍTICO

| Atributo | Valor |
|----------|-------|
| **Epic** | Payments |
| **Prioridad** | Medium |

**Descripción:** Mentee paga sesión via Stripe Checkout.

**Componentes Involucrados:**
- Stripe Checkout embedded/redirect
- Webhook handler (`checkout.session.completed`)
- `bookings.status` update ('pending_payment' → 'confirmed')

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Checkout → pago test → confirmación |
| Integration | ✅ | Stripe Checkout + Webhook + DB update |
| Unit | ✅ | Webhook signature verification |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Checkout form, success/error pages |
| Database | ✅ | Status update on webhook |
| API | ✅ | Create checkout session, webhook endpoint |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Webhook signature verification, HTTPS |
| Accessibility | ✅ | Stripe hosted UI is accessible |

---

### MYM-25: Stripe Connect Onboarding

| Atributo | Valor |
|----------|-------|
| **Epic** | Payments |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |

**Descripción:** Mentor conecta cuenta bancaria via Stripe Connect Express.

**Componentes Involucrados:**
- Stripe Account Link generation
- `stripe_accounts` table
- Webhook `account.updated`

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Click → redirect Stripe → return → status updated |
| Integration | ✅ | Account Link + Redirect + Webhook + DB |
| Unit | ✅ | Return URL handling, status mapping |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Connect button, status indicator |
| Database | ✅ | Store Stripe account ID, onboarding status |
| API | ✅ | Generate Account Link, webhook handler |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Webhook verification, account ownership |

**Edge Cases Documentados:**
- User abandons onboarding
- Stripe requires additional verification
- Multiple click on connect button

---

### MYM-27: Automatic Payout (Cron Job)

| Atributo | Valor |
|----------|-------|
| **Epic** | Payments |
| **Prioridad** | Medium |

**Descripción:** Sistema procesa payouts automáticos 24h después de sesión.

**Componentes Involucrados:**
- Supabase cron job (scheduled function)
- Query eligible sessions
- Stripe Transfer API
- `payouts` table, `payout_items` table

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ❌ | N/A (backend cron) |
| Integration | ✅ | Cron + Query + Stripe Transfer + DB update |
| Unit | ✅ | Eligibility query, amount calculation |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ❌ | Backend-only |
| Database | ✅ | Query eligible, update payout_status |
| API | ✅ | Stripe Transfer API |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Idempotency, double-payout prevention |

**Edge Cases:**
- Mentor account restricted
- Insufficient platform balance
- Session disputed

---

### MYM-29: User Dashboard Sessions

| Atributo | Valor |
|----------|-------|
| **Epic** | User Experience |
| **Prioridad** | Medium |

**Descripción:** Usuario ve sus sesiones upcoming y past en dashboard.

**Componentes Involucrados:**
- Dashboard page
- `bookings` table query (user as mentor or mentee)
- Session cards

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Login → ver upcoming y past sessions |
| Integration | ✅ | Dashboard + Query + Display |
| Unit | ✅ | Session card, date formatting |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Two lists (upcoming/past), session details |
| Database | ✅ | Query by user ID, partition by date |
| API | ✅ | Sessions endpoint |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Accessibility | ✅ | List semantics |

---

### MYM-30: Communication Channels

| Atributo | Valor |
|----------|-------|
| **Epic** | Session Management |
| **Prioridad** | Medium |

**Descripción:** Mentor configura canales de comunicación; mentee selecciona durante booking.

**Componentes Involucrados:**
- `communication_channels` table
- Mentor preferences UI
- Booking step for channel selection
- `bookings.communication_channels` JSONB

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Mentor configura → Mentee ve y selecciona → Session muestra |
| Integration | ✅ | Preferences + Booking flow + Display |
| Unit | ✅ | Channel selector, validation |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Channel config, selection during booking |
| Database | ✅ | communication_channels table, booking JSONB |
| API | ✅ | Channel CRUD, booking update |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Accessibility | ✅ | Form accessibility |

---

### MYM-33: Mentee Rate Mentor ⭐ CRÍTICO

| Atributo | Valor |
|----------|-------|
| **Epic** | Reputation & Reviews |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed (35 test cases) |

**Descripción:** Mentee puede calificar mentor después de sesión completada.

**Componentes Involucrados:**
- `SessionCard` con botón "Leave Review"
- `/review/submit` page
- `reviews` table
- `StarRatingInput`, `ReviewForm`
- DB trigger `update_mentor_average_rating`

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Sesión completed → review → ver en perfil mentor |
| Integration | ✅ | Form + Server Action + DB + Trigger |
| Unit | ✅ | Rating validation (1-5), comment (0-500 chars) |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Star selector, textarea, character counter |
| Database | ✅ | Insert review, UNIQUE constraint, trigger |
| API | ✅ | Eligibility check, create review |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | XSS prevention, eligibility verification |
| Accessibility | ✅ | Star rating keyboard accessible |

**Edge Cases Documentados:**
- Review antes de 1 hora post-sesión (block)
- Review duplicada (UNIQUE constraint)
- Comment > 500 chars
- Rating fuera de rango (0, 6, -1)

---

### MYM-34: Mentor Rate Mentee

| Atributo | Valor |
|----------|-------|
| **Epic** | Reputation & Reviews |
| **Prioridad** | Medium |

**Descripción:** Mentor puede calificar mentee después de sesión completada.

**Componentes Involucrados:**
- Same as MYM-33 but reverse direction
- `reviews` table
- DB trigger `update_mentee_average_rating`

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Sesión completed → mentor reviews → avg rating updated |
| Integration | ✅ | Form + Server Action + DB + Trigger |
| Unit | ✅ | Same validations as MYM-33 |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Star selector, textarea |
| Database | ✅ | Insert review, trigger avg rating |
| API | ✅ | Eligibility check, create review |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | XSS prevention |
| Accessibility | ✅ | Form accessible |

---

### MYM-56: Send Message Before Booking

| Atributo | Valor |
|----------|-------|
| **Epic** | Messaging System |
| **Prioridad** | Medium |
| **Shift-Left** | ✅ Reviewed |
| **Story Points** | 8 |

**Descripción:** Mentee envía mensaje a mentor desde su perfil antes de reservar.

**Componentes Involucrados:**
- `SendMessageButton` en perfil mentor
- `MessageComposerModal`
- `conversations` table
- `messages` table
- RPC `get_or_create_conversation`
- Supabase Realtime

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Click Send → Modal → Enviar → Redirect a conversación |
| Integration | ✅ | Modal + Server Action + DB + Realtime |
| Unit | ✅ | Message validation (min 10 chars), existing conversation check |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Button states, modal, loading, redirect |
| Database | ✅ | conversations + messages creation, RLS |
| API | ✅ | Server actions, RPC function |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Security | ✅ | Can't message deactivated mentor, can't message self |
| Accessibility | ✅ | Modal focus trap, form |

**Edge Cases Documentados:**
- Mensaje a mentor desactivado (403)
- Mensaje a sí mismo (button hidden)
- Conversación ya existe (show "View Conversation")

---

### MYM-71: Theme Preference Persistence

| Atributo | Valor |
|----------|-------|
| **Epic** | Dark Mode & Theme |
| **Prioridad** | Medium |

**Descripción:** Preferencia de tema persiste en localStorage entre sesiones.

**Componentes Involucrados:**
- `ThemeProvider` (next-themes)
- `ModeToggle` component
- localStorage key: "theme"

**Testing Requerido:**

| Nivel | Requerido | Enfoque |
|-------|:---------:|---------|
| E2E | ✅ | Cambiar tema → reload → tema persiste (no FOUC) |
| Integration | ✅ | ThemeProvider + localStorage + hydration |
| Unit | ✅ | localStorage read/write logic |

| Tipo Funcional | Requerido | Enfoque |
|----------------|:---------:|---------|
| UI | ✅ | Toggle funciona, tema se aplica visualmente |
| Database | ❌ | Solo localStorage |
| API | ❌ | N/A |

| Tipo No Funcional | Requerido | Enfoque |
|-------------------|:---------:|---------|
| Accessibility | ✅ | Toggle button accessible |

---

## Matriz de Prioridad de Testing

### Alta Prioridad (Crítico para negocio)

| US | Razón |
|----|-------|
| MYM-4 | Autenticación - core security |
| MYM-7 | Password reset - security critical |
| MYM-21 | Core booking flow |
| MYM-24 | Payment processing |
| MYM-22 | Confirmación de booking |
| MYM-25 | Mentor payout onboarding |

### Media Prioridad (Funcionalidad importante)

| US | Razón |
|----|-------|
| MYM-11 | Admin vetting workflow |
| MYM-33/34 | Sistema de reputación |
| MYM-56 | Messaging - conversión |
| MYM-15/16 | Search & Discovery |
| MYM-19 | Mentor availability |

### Baja Prioridad (UX/Polish)

| US | Razón |
|----|-------|
| MYM-71 | Theme persistence |
| MYM-5 | Basic profile |
| MYM-29 | Dashboard sessions view |
| MYM-20 | Timezone conversion |

---

## Recomendaciones Generales

### Para Testing E2E
1. **Priorizar flujos críticos**: Login → Search → Book → Pay → Confirm
2. **Usar Playwright** con Page Object Model
3. **Test data isolation** por test suite

### Para Testing de Integración
1. **Mock external services**: Stripe, Email
2. **Test RLS policies** directamente en Supabase
3. **Test triggers y functions** con data fixtures

### Para Testing Unitario
1. **Validation functions** (password, email, rating)
2. **Utility functions** (timezone, formatting)
3. **Component states** (loading, error, success)

### Para Testing de Seguridad
1. **Verificar RLS** en todas las tablas
2. **Test rate limiting** en endpoints críticos
3. **XSS prevention** en inputs de usuario
4. **Webhook signature verification**

---

## Referencias

- [Jira Project MYM](https://upexgalaxy62.atlassian.net/browse/MYM)
- [Supabase Project](https://supabase.com/dashboard/project/ionevzckjyxtpmyenbxc)
- [Staging Environment](https://staging-upexmymentor.vercel.app)

---

> **Nota:** Este documento fue generado automáticamente y debe ser revisado por el equipo QA para validar las clasificaciones.
