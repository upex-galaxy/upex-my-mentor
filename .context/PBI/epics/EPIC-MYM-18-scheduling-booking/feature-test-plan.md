# Feature Test Plan: EPIC-MYM-18 - Scheduling & Booking

**Fecha:** 2025-11-21
**QA Lead:** Gemini-CLI
**Epic Jira Key:** MYM-18
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

Esta épica es el núcleo transaccional de Upex My Mentor. Habilita la monetización del conocimiento, que es la propuesta de valor central tanto para mentores como para estudiantes. Al permitir que los mentores ofrezcan su tiempo y que los estudiantes lo reserven, esta funcionalidad desbloquea directamente el flujo de ingresos de la plataforma.

**Key Value Proposition:**

- **Para Estudiantes (Laura, la Dev Junior):** Proporciona un mecanismo tangible y flexible para acceder a "Expertise Verificado" bajo demanda, resolviendo bloqueos específicos que los cursos genéricos no pueden abordar.
- **Para Mentores (Carlos, el Arq. Senior):** Ofrece un "Canal de Confianza" para monetizar su experiencia, gestionando la logística de programación que de otro modo sería una barrera de entrada.

**Success Metrics (KPIs):**

- **Adopción:** Contribuir al objetivo de 50 mentores activos y 500 estudiantes registrados, ya que la capacidad de reservar es un incentivo clave para unirse.
- **Engagement:** Directamente responsable de alcanzar el objetivo de 100 sesiones completadas en el primer mes.
- **Negocio:** Habilitador principal para alcanzar los objetivos de GMV ($5,000) e Ingresos Netos ($1,000) en el primer mes.

**User Impact:**

- **Laura (Desarrolladora Junior):** Le permite pasar de la frustración por un problema técnico a una solución concreta. Este journey valida la promesa de la plataforma y la convierte en una usuaria recurrente.
- **Carlos (Arquitecto Senior):** Le proporciona la herramienta para transformar su tiempo y conocimiento en ingresos, haciendo que su participación en la plataforma sea valiosa y sostenible.
- **Sofía (Cambiadora de Carrera):** Le da un camino claro para obtener la guía que necesita, permitiéndole reservar tiempo con un experto que puede validar su ruta de aprendizaje.

**Critical User Journeys:**

- **Registro de Estudiante y Reserva de Primera Sesión:** Esta épica cubre los pasos 4, 5 y 6 de este journey, desde ver la disponibilidad hasta confirmar la reserva. Es el clímax del journey de conversión del estudiante.
- **Registro de Mentor y Configuración de Perfil:** Cubre el paso 4, donde el mentor configura su disponibilidad, un paso crucial para que su perfil sea "reservable" y pueda empezar a generar ingresos.

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**
- **Componentes a crear/modificar:**
  - `MentorAvailabilityCalendar`: Un componente complejo para que los mentores definan sus horarios.
  - `BookingCalendar`: Un componente para que los estudiantes vean y seleccionen slots.
  - `BookingConfirmationPage`: Resumen de la reserva antes del pago.
  - `TimezoneSelector`: Componente para mostrar y ajustar la visualización de zonas horarias.
- **Páginas/rutas afectadas:**
  - `/dashboard/mentor/availability` (para mentores)
  - `/mentors/{mentorId}` (donde se mostrará el calendario de booking)
  - `/book/{mentorId}` (página de reserva)

**Backend:**
- **APIs a crear/modificar:**
  - `PUT /api/mentors/{mentorId}/calendar`: Para que el mentor guarde su disponibilidad.
  - `GET /api/mentors/{mentorId}/availability`: Para obtener los slots disponibles de un mentor (requiere lógica compleja de cálculo).
  - `POST /api/bookings`: Para crear una reserva provisional.
  - `PATCH /api/bookings/{id}/confirm`: (Llamado por el webhook de pago) Para confirmar la reserva.
  - `POST /api/notifications/send`: Endpoint interno para disparar emails (confirmación, recordatorios).
- **Servicios de negocio afectados:**
  - `AvailabilityService`: Lógica para calcular slots disponibles, considerando la disponibilidad base, las excepciones y las reservas existentes.
  - `BookingService`: Gestiona el ciclo de vida de una reserva.
  - `NotificationService`: Orquesta el envío de emails.

**Database:**
- **Tablas involucradas:**
  - `mentor_availability`: Almacena la disponibilidad semanal recurrente.
  - `availability_exceptions`: Almacena fechas bloqueadas por el mentor.
  - `bookings`: Tabla central que registra todas las sesiones.
  - `users`: Para obtener datos del mentor/estudiante para las notificaciones.
- **Queries críticos:** La consulta para generar los slots disponibles de un mentor es la más crítica, ya que debe combinar la disponibilidad recurrente, restar las excepciones y los slots ya reservados, y manejar las zonas horarias.

**External Services:**
- **Servicio de Email (ej. Resend):** Para enviar confirmaciones y recordatorios.
- **Servicio de Tareas Programadas (Supabase Cron):** Para enviar recordatorios (24h y 1h antes) y limpiar reservas `draft` expiradas.

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- **Frontend ↔ Backend API:** El frontend debe enviar y recibir correctamente las estructuras de datos de disponibilidad y reserva.
- **Backend ↔ Database:** Las consultas para calcular la disponibilidad y la restricción `UNIQUE` en la tabla `bookings` para evitar doble reserva son cruciales.
- **BookingService ↔ NotificationService:** Una reserva confirmada debe disparar de forma fiable una notificación.

**External Integration Points:**

- **Backend ↔ Email Service:** La conexión y el formato de las solicitudes a la API del servicio de email.
- **Backend ↔ Cron Jobs (Supabase):** La correcta configuración y ejecución de las tareas programadas para recordatorios y limpieza.
- **Booking Flow ↔ Payments Flow (EPIC-MYM-23):** Esta es la integración más crítica del negocio. El `BookingService` debe pasar el control de forma segura al `PaymentService`, y el webhook de pago debe notificar fiablemente al `BookingService`.

**Data Flow (Booking):**
`User (Mentee) → Frontend (Selects Slot) → POST /api/bookings (Backend) → Create 'draft' booking (DB) → Redirect to Stripe (Payments EPIC) → Stripe Webhook → PATCH /api/bookings/:id/confirm (Backend) → Update booking to 'confirmed' (DB) → Trigger NotificationService → Send Email (Email Service)`

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Timezone Conversion Errors

- **Impact:** Critical
- **Likelihood:** High
- **Area Affected:** Backend & Frontend
- **Mitigation Strategy:**
  - Forzar almacenamiento de todas las fechas en UTC en la DB (`timestamptz`).
  - Usar una librería robusta como `date-fns-tz` en ambos lados.
  - El frontend debe detectar la zona horaria del navegador y mostrarla explícitamente al usuario.
- **Test Coverage Required:** Tests unitarios específicos para la lógica de conversión. E2E tests que simulen diferentes zonas horarias en el navegador.

#### Risk 2: Race Conditions Leading to Double Bookings

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend & Database
- **Mitigation Strategy:**
  - Aplicar un `UNIQUE CONSTRAINT` en la base de datos en `(mentor_id, session_datetime)`.
  - La transacción para crear la reserva debe verificar la disponibilidad justo antes de insertar (SELECT then INSERT dentro de una transacción).
- **Test Coverage Required:** Tests de integración que simulen dos solicitudes concurrentes para el mismo slot.

### Business Risks

#### Risk 1: Mentors Do Not Set Availability

- **Impact on Business:** Reduce el inventario de sesiones disponibles, afectando directamente el GMV.
- **Impact on Users:** Mentees no encuentran mentores disponibles, generando frustración y abandono.
- **Likelihood:** High
- **Mitigation Strategy:**
  - En el onboarding del mentor, hacer que la configuración de disponibilidad sea un paso obligatorio.
  - Enviar emails recordatorios a mentores sin disponibilidad.
- **Acceptance Criteria Validation:** La historia MYM-19 cubre la configuración inicial. Se debe validar que la UI lo promueve activamente.

#### Risk 2: Mentee Abandons Booking During Payment

- **Impact on Business:** Un slot queda bloqueado temporalmente sin generar ingresos.
- **Impact on Users:** Otros mentees no pueden reservar ese slot durante 15 minutos.
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Implementar una tarea de limpieza (cron job) que elimine las reservas en estado `draft` después de 15 minutos.
  - Mostrar un temporizador claro en la UI durante el checkout.
- **Acceptance Criteria Validation:** El criterio "Selected slot is held for 15 minutes during checkout" debe ser verificado.

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Atomicidad de la actualización de disponibilidad (STORY-MYM-19)
- **Found in:** STORY-MYM-19 Technical Notes: "The operation should be atomic: delete all existing availability for the mentor and insert the new set."
- **Question for Dev:** Si la eliminación es exitosa pero la inserción falla, ¿se realiza un rollback de la eliminación? ¿Cómo se asegura la atomicidad? ¿Se usa una transacción en la base de datos?
- **Impact if not clarified:** Un mentor podría quedar sin disponibilidad registrada si la operación falla a la mitad.

**Ambiguity 2:** ¿Qué constituye un "enlace de videollamada externo"? (STORY-MYM-22)
- **Found in:** STORY-MYM-22 Acceptance Criteria.
- **Question for PO:** Para el MVP, ¿el mentor proporciona manualmente este enlace en su perfil y simplemente lo adjuntamos? ¿O se espera una integración futura que lo genere?
- **Impact if not clarified:** La implementación del `NotificationService` puede ser incorrecta o incompleta.

### Missing Information

**Missing 1:** Comportamiento exacto de la UI del calendario (STORY-MYM-19)
- **Needed for:** Testear la usabilidad y la funcionalidad de la creación de slots.
- **Suggestion:** Definir el "incremento" de tiempo mínimo (ej. 30 min), si se puede arrastrar para crear/redimensionar slots, y cómo se manejan visualmente los solapamientos antes de guardar.

**Missing 2:** Política de cancelación (relacionado, pero no en esta épica)
- **Needed for:** Entender el ciclo de vida completo del estado `cancelled`.
- **Suggestion:** Aunque la cancelación es de otra épica, saber si un mentee/mentor puede cancelar una sesión confirmada impacta el diseño de la tabla `bookings`. Por ahora se asume que sí es posible.

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**
- Funcionalidad completa de gestión de disponibilidad del mentor.
- Flujo completo de reserva de sesión por el mentee (hasta el inicio del pago).
- Lógica de cálculo de disponibilidad y conversión de zonas horarias.
- Generación y envío de emails de confirmación y recordatorios con adjunto `.ics`.
- Prevención de doble reserva.
- Limpieza de reservas expiradas.

**Out of Scope (For This Epic):**
- El flujo de pago en sí (cubierto en EPIC-MYM-23).
- Cancelación y reprogramación de sesiones (será otra épica).
- Sincronización con calendarios externos (Google, Outlook).

### Test Levels

#### Unit Testing
- **Coverage Goal:** > 90% para la lógica de negocio crítica.
- **Focus Areas:**
  - `AvailabilityService`: Lógica de cálculo de slots disponibles.
  - Lógica de conversión de zonas horarias.
  - Generación de archivos `.ics`.
- **Responsibility:** Dev team.

#### Integration Testing
- **Coverage Goal:** Todos los integration points identificados.
- **Focus Areas:**
  - `BookingService` ↔ `Database`: Verificar la restricción `UNIQUE` y la correcta creación/actualización de reservas.
  - `BookingService` ↔ `NotificationService`: Asegurar que la confirmación de reserva dispara el email.
  - `API` ↔ `Cron Jobs`: Verificar que el job de limpieza de reservas `draft` funciona.
- **Responsibility:** QA + Dev.

#### End-to-End (E2E) Testing
- **Coverage Goal:** Los 2 critical user journeys completos.
- **Tool:** Playwright.
- **Focus Areas:**
  - Mentor configura disponibilidad, mentee la ve en su zona horaria y reserva.
  - Flujo de reserva fallido (intento de doble reserva).
- **Responsibility:** QA team.

#### API Testing
- **Coverage Goal:** 100% de los endpoints de esta épica.
- **Tool:** Postman/Newman.
- **Focus Areas:**
  - `GET /api/mentors/:id/availability`: Probar con diferentes zonas horarias y escenarios de disponibilidad.
  - `POST /api/bookings`: Probar casos de éxito y de fallo (slot ya tomado).
- **Responsibility:** QA team.

---

## 📊 Test Cases Summary by Story

### STORY-MYM-19: Set Mentor Weekly Availability
**Complexity:** Medium
**Estimated Test Cases:** 8
- Positive: 2, Negative: 3, Boundary: 3
**Rationale:** La complejidad está en la UI del calendario y la validación de solapamientos y horarios inválidos.

### STORY-MYM-20: Timezone Conversion for Availability
**Complexity:** High
**Estimated Test Cases:** 6
- Positive: 4, Negative: 1, Boundary: 1
**Rationale:** Requiere múltiples combinaciones de zonas horarias (mentor/mentee en misma zona, diferente, con y sin horario de verano) para asegurar la correctitud.

### STORY-MYM-21: Book a Session
**Complexity:** High
**Estimated Test Cases:** 7
- Positive: 2, Negative: 3, Boundary: 2
**Rationale:** La criticidad del negocio y el riesgo de race conditions exigen pruebas robustas de los escenarios de fallo y concurrencia.

### STORY-MYM-22: Email Confirmation and Calendar Invite
**Complexity:** Medium
**Estimated Test Cases:** 5
- Positive: 2, Negative: 1, Boundary: 2
**Rationale:** Se debe validar el contenido del email, la validez del archivo `.ics` en múltiples clientes de calendario, y el trigger que lo envía.

---

### Total Estimated Test Cases for Epic
**Total:** 26
**Breakdown:**
- Positive: 10
- Negative: 8
- Boundary: 8

---

## ✅ Entry/Exit Criteria

### Entry Criteria
- [ ] Todas las historias de la épica `EPIC-MYM-2-user-authentication-profiles` están completas.
- [ ] El `PaymentService` (de EPIC-MYM-23) tiene una interfaz definida para iniciar el checkout.
- [ ] Las preguntas críticas de este documento han sido respondidas por PO/Dev.

### Epic Exit Criteria
- [ ] Todos los test cases (manuales y automáticos) para las 4 stories han sido ejecutados y están pasando.
- [ ] El E2E test del flujo de reserva completo (hasta el pago) es exitoso.
- [ ] No hay bugs críticos o altos abiertos relacionados con esta épica.
- [ ] Se ha verificado manualmente que los emails y los archivos `.ics` se generan y reciben correctamente.
- [ ] QA sign-off es aprobado.