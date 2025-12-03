# Test Cases: STORY-MYM-21 - Book a Session

**Fecha:** 2025-11-27
**QA Engineer:** Gemini AI
**Story Jira Key:** MYM-21
**Epic:** EPIC-MYM-18 - Scheduling & Booking
**Status:** Draft - Pending PO/Dev Review

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary: Laura (Desarrolladora Junior)** - Este es el momento culminante de su journey. Después de encontrar al mentor adecuado, la acción de reservar la sesión es el paso final para resolver su problema. Cualquier fricción aquí resultará en el abandono de la plataforma.
- **Secondary: Carlos (Arquitecto Senior)** - El éxito de esta historia impacta directamente su capacidad para monetizar su tiempo. Un flujo de reserva propenso a errores significa que sus slots de tiempo se bloquean sin generar ingresos.

**Business Value:**
- **Value Proposition:** Materializa la promesa de "acceso a expertise verificado". Es el puente entre el descubrimiento y la transacción.
- **Business Impact:** Esta historia es el **punto de conversión de usuario a cliente**. Habilita directamente los KPIs de "100 sesiones completadas" y "$5,000 GMV". Un fallo aquí significa cero ingresos.

**Related User Journey:**
- **Journey:** "Registro de Estudiante y Reserva de Primera Sesión (Happy Path)"
- **Step:** Es el **Paso 5 y 6**, donde Laura selecciona un slot y procede al pago. El éxito de este paso es crucial para que el journey se complete.

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
- **Components:** `MentorProfileCalendar`, `BookingConfirmationModal`, `CountdownTimer`.
- **Pages/Routes:** La lógica se encuentra probablemente en `app/mentors/[id]/page.tsx` o en una página modal de reserva.

**Backend:**
- **API Endpoints:** `POST /api/bookings` (definido en `api-contracts.yaml`) para crear la reserva provisional.
- **Services:** `BookingService` para manejar la lógica de creación, validación de slot y reserva.
- **Database:** Creación de un nuevo registro en la tabla `bookings`. El esquema, según `epic.md`, debe incluir `id`, `mentor_id`, `mentee_id`, `session_datetime` (UTC), `duration_minutes` (default 60), `status` (enum), `total_amount`. **Crucialmente**, debe tener un `UNIQUE CONSTRAINT on (mentor_id, session_datetime)` para prevenir dobles reservas.

**External Services:**
- **Stripe:** Esta historia es la responsable de iniciar la transición hacia Stripe. El `epic.md` de `EPIC-MYM-23` confirma que se usará "Stripe Checkout (hosted payment page)", implicando una redirección.

**Integration Points:**
- **EPIC-MYM-18 (Scheduling) ↔ MYM-21:** Consume la disponibilidad del mentor.
- **MYM-21 ↔ EPIC-MYM-23 (Payments):** Inicia el flujo de pago al crear una reserva y redirigir a Stripe.
- **Backend ↔ Database:** La creación de la reserva debe ser una transacción atómica y segura.

---

### Story Complexity Analysis

**Overall Complexity:** High

**Complexity Factors:**
- **Business logic complexity:** High - La lógica de reserva de 15 minutos, prevención de race conditions y el snapshot del precio son complejos.
- **Integration complexity:** High - Es el nexo entre la disponibilidad del calendario y la pasarela de pagos. Un fallo aquí rompe todo el flujo de valor.
- **Data validation complexity:** Medium - Se debe validar la disponibilidad del slot en tiempo real en el momento exacto de la reserva.
- **UI complexity:** Medium - Requiere una UI clara para la confirmación y un manejo elegante de los errores.

**Estimated Test Effort:** High (Aprox. 42 test cases)
**Rationale:** La criticidad de la transacción financiera, la necesidad de prevenir race conditions y las múltiples integraciones requieren un testing exhaustivo.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**
- **Risk 1: Double-Booking Due to Race Conditions:** El `feature-test-plan.md` de la épica lo marca como un riesgo alto. La mitigación principal es el `UNIQUE CONSTRAINT` en la base de datos, que debe ser probado rigurosamente.
- **Risk 2: 15-Minute Slot Reservation Expires During Payment:** La historia no lo menciona, pero el plan de pruebas de la épica y el `epic.md` sí. Es un punto de fallo crítico. ¿Qué pasa si el pago tarda 16 minutos?

**Integration Points from Epic Analysis:**
- **Booking Flow → Payment Flow (EPIC-MYM-23):** Esta historia es el "handoff". La creación del `draft` booking es el disparador.

**Critical Questions Already Asked at Epic Level:**
- **Question:** "¿Qué pasa si un mentor cambia su disponibilidad DESPUÉS de una reserva confirmada?"
  - **Status:** ⏳ Pending.
  - **Impact on This Story:** Aunque esta story trata con reservas `draft`, la lógica debe ser robusta. Si un mentor puede cambiar su disponibilidad en cualquier momento, podría eliminar un slot que un mentee está intentando reservar, causando un error.
- **Question:** "¿Cómo se manejan los conflictos de scheduling?"
  - **Status:** ⏳ Pending.
  - **Impact on This Story:** La validación final al momento de hacer clic en "Confirmar" es la última línea de defensa contra estos conflictos.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Flujo de "Confirmación"**
- **Location in Story:** "And: They confirm the booking."
- **Question for PO/Dev:** ¿Qué significa "confirmar"? ¿Es un modal que resume la reserva (mentor, fecha, hora, precio)? ¿O el clic en el slot es la confirmación?
- **Impact on Testing:** El flujo del usuario cambia completamente. Sin esta aclaración, no podemos diseñar los pasos E2E correctos.
- **Suggested Clarification:** Basado en el `epic.md` ("Booking summary page"), se debería mostrar un modal o página de resumen antes de redirigir a Stripe.

**Ambiguity 2: Nomenclatura del estado de la reserva**
- **Location in Story:** "Then: The system creates a new record in the `sessions` table with a 'pending_payment' status."
- **Question for Dev:** El `epic.md` para `EPIC-MYM-18` especifica el estado como `draft`. ¿Cuál es el correcto?
- **Impact on Testing:** Afecta las aserciones de la base de datos.
- **Suggested Clarification:** Usar `draft` como se define en el `epic.md` ya que es un documento de mayor nivel.

**Ambiguity 3: Tabla `sessions` vs `bookings`**
- **Location in Story:** "Then: The system creates a new record in the `sessions` table..."
- **Question for Dev:** Todos los demás documentos (`epic.md`, `architecture-specs.md`) se refieren a la tabla como `bookings`. ¿Es un error en la historia?
- **Impact on Testing:** Afecta las consultas de base de datos para verificación.
- **Suggested Clarification:** Confirmar que el nombre correcto de la tabla es `bookings`.

---

### Missing Information / Gaps

**Gap 1: La reserva de 15 minutos no está en los Criterios de Aceptación**
- **Type:** Business Rule
- **Why It's Critical:** Es el mecanismo principal para prevenir race conditions y una de las lógicas más complejas de la historia.
- **Suggested Addition:** Añadir un Criterio de Aceptación: "Then: The selected time slot is reserved for 15 minutes, and a countdown is displayed to the user."

**Gap 2: Snapshot del Precio**
- **Type:** Technical Details
- **Why It's Critical:** Si un mentor cambia su tarifa mientras un mentee está en el flujo de pago, podría haber una discrepancia. El sistema debe "fijar" el precio al momento de la reserva.
- **Suggested Addition:** El `epic.md` ya lo contempla en el schema (`bookings.total_amount`). Hay que añadir un C.A. para validarlo: "Then: The `total_amount` is stored in the `bookings` record, based on the mentor's `hourly_rate` at the time of booking."

**Gap 3: Manejo de Errores Adicionales**
- **Type:** Acceptance Criteria
- **Why It's Critical:** La historia solo cubre el caso de "slot no disponible". Faltan otros escenarios.
- **Suggested Addition:** Crear escenarios para:
    - API `POST /api/bookings` devuelve 500.
    - El mentor ya no está verificado.
    - La redirección a Stripe falla.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1: Doble Clic en el Botón de Reserva**
- **Scenario:** El usuario hace doble clic en el botón "Confirmar y Pagar".
- **Expected Behavior:** El sistema debe ser idempotente. Solo debe crear UNA reserva `draft`. La segunda petición debería ser ignorada o devolver la reserva ya creada.

**Edge Case 2: Botón "Atrás" del Navegador desde Stripe**
- **Scenario:** El usuario es redirigido a Stripe, pero hace clic en el botón "Atrás" del navegador.
- **Expected Behavior:** ¿A dónde vuelve? ¿Al perfil del mentor? ¿A una página de "pago cancelado"? ¿La reserva `draft` sigue activa por el resto de los 15 minutos? (Decisión de PO requerida).

**Edge Case 3: Intento de reservar un slot en el pasado**
- **Scenario:** Un usuario manipula la petición a la API para reservar un slot que ya pasó.
- **Expected Behavior:** El backend debe validar que `session_datetime` es una fecha futura y devolver un error 400.

---

### Testability Validation

**Is this story testeable as written?** ⚠️ **Partially**
**Testability Issues:**
- Las ambigüedades sobre el flujo de confirmación y el estado de la reserva impiden escribir los pasos exactos de un test E2E.
- La falta de la lógica de reserva de 15 minutos en los C.A. deja fuera del scope de testing la funcionalidad más compleja.

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: Mentee successfully initiates a session booking (Happy Path)

- **Given:** A logged-in mentee is viewing a verified mentor's profile with an available time slot at "2025-11-28 16:00:00Z".
- **When:** They click on the "16:00" time slot.
- **And:** A confirmation modal appears showing: Mentor: "Carlos", Date: "November 28, 2025", Time: "16:00 (Your Timezone)", Price: "$100.00".
- **And:** The user clicks the "Confirm and Proceed to Payment" button.
- **Then:** The system creates a new record in the `bookings` table with `status: 'draft'`, `mentor_id`, `mentee_id`, `session_datetime` = "2025-11-28 16:00:00Z", and `total_amount` = 100.00.
- **And:** The system initiates a 15-minute reservation timer for this booking.
- **And:** The system redirects the mentee to the Stripe checkout page, passing the `booking_id` in the metadata.

### Scenario 2: Mentee tries to book a slot that was just taken (Race Condition)

- **Given:** Mentee A is viewing a mentor's profile with an available slot at "16:00".
- **And:** Mentee B books the "16:00" slot, and the record in the `bookings` table is created.
- **When:** Mentee A, whose UI has not yet updated, clicks on the "16:00" slot and clicks "Confirm".
- **Then:** The `POST /api/bookings` call fails due to the `UNIQUE CONSTRAINT` on (`mentor_id`, `session_datetime`).
- **And:** The system returns a `409 Conflict` error.
- **And:** The UI displays an error message: "Sorry, this time slot is no longer available. Please select another one."

### Scenario 3: User abandons payment flow (Reservation Expiration)

- **Given:** A mentee has created a `draft` booking for a slot at "17:00", initiating a 15-minute reservation.
- **And:** The mentee does not complete the payment within 15 minutes.
- **When:** A background job or cleanup process runs.
- **Then:** The `draft` booking record is deleted from the `bookings` table.
- **And:** The slot at "17:00" becomes available again for other mentees to book.

---

## 🧪 FASE 4: Test Design

### Test Cases

*(Extracto de los casos más críticos. El total estimado es de 42)*

#### **TC-MYM21-01: Successful booking initiation (Happy Path)**
- **Type:** Positive | **Priority:** Critical | **Test Level:** E2E
- **Preconditions:** Logged in as mentee. Mentor with ID 'mentor-carlos' has an available slot.
- **Steps:**
    1. Navigate to mentor Carlos's profile.
    2. Click on an available time slot.
    3. In the confirmation modal, verify mentor name, time, and price.
    4. Click "Confirm and Proceed to Payment".
- **Expected Result:**
    - **UI:** User is redirected to a URL starting with `https://checkout.stripe.com`.
    - **DB:** A record is created in the `bookings` table with `status: 'draft'`, the correct `mentor_id`, `mentee_id`, `session_datetime`, and `total_amount`.

#### **TC-MYM21-02: Attempt to book an unavailable slot (Race Condition)**
- **Type:** Negative | **Priority:** Critical | **Test Level:** Integration
- **Preconditions:** A booking for mentor 'mentor-carlos' at '2025-12-01 18:00:00Z' already exists.
- **Steps:**
    1. As a different mentee, send a `POST` request to `/api/bookings` for the same mentor and `session_datetime`.
- **Expected Result:**
    - **API:** Returns a `409 Conflict` status code.
    - **Body:** `{ "error": "This time slot is no longer available." }`.
    - **DB:** No new record is created in the `bookings` table.

#### **TC-MYM21-03: Booking reservation expires after 15 minutes**
- **Type:** Boundary | **Priority:** High | **Test Level:** E2E
- **Preconditions:** Test environment allows time manipulation.
- **Steps:**
    1. Initiate a booking to create a `draft` record.
    2. Fast-forward the system clock by 16 minutes.
    3. Trigger the cleanup job (or wait for it to run).
    4. As another mentee, view the same mentor's calendar.
- **Expected Result:**
    - **DB:** The `draft` booking is deleted.
    - **UI:** The time slot from step 1 is now visible as available again.

#### **TC-MYM21-04: Price snapshot is taken at booking time**
- **Type:** Positive | **Priority:** High | **Test Level:** Integration
- **Preconditions:** Mentor 'mentor-carlos' has `hourly_rate` = 100.
- **Steps:**
    1. Initiate a booking for mentor 'mentor-carlos'.
    2. Verify the created `bookings` record.
    3. **After booking**, update mentor Carlos's `hourly_rate` to 150.
    4. Re-verify the `bookings` record.
- **Expected Result:**
    - **DB:** The `total_amount` in the `bookings` record is `100.00`. It does NOT change to 150.00 after the mentor's rate is updated.

---

## 📝 FASE 5: Jira Integration & Local Mirroring

Este documento se ha generado para actuar como el archivo `test-cases.md` local. El siguiente paso sería actualizar la story `MYM-21` en Jira con estos refinamientos y añadir el contenido completo de este análisis como un comentario para el equipo.

---

### ⚠️ Resumen de Preguntas Críticas para el Equipo

- **Para el PO:** ¿Cuál es el flujo de UI exacto para "confirmar la reserva"? ¿Un modal o una página de resumen?
- **Para el PO:** Si un usuario vuelve atrás desde la página de Stripe, ¿qué debería ocurrir? ¿Se cancela la reserva o el temporizador de 15 minutos sigue corriendo?
- **Para el Dev:** Confirmar si el estado de la reserva es `draft` (como en la épica) y la tabla es `bookings` (como en la arquitectura), no `pending_payment` ni `sessions` (como en la story).