# Test Cases: STORY-MYM-56 - Send Message to Mentor Before Booking

**Fecha:** 2025-11-27
**QA Engineer:** Gemini AI
**Story Jira Key:** MYM-56
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** Draft

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary:** Laura (Desarrolladora Junior) - Necesita hacer preguntas específicas a un mentor sobre su experiencia en React antes de gastar dinero en una sesión. Esto reduce su riesgo y aumenta su confianza para reservar.
- **Secondary:** Carlos (Arquitecto Senior) - Le permite precalificar a los estudiantes, entender sus necesidades y prepararse mejor para la primera sesión, optimizando su tiempo.

**Business Value:**
- **Value Proposition:** Refuerza la propuesta de valor de "acceso a expertise verificado" al permitir una interacción previa que genera confianza.
- **Business Impact:** Aumenta la tasa de conversión de "visita de perfil" a "reserva". Se espera que un 30% de las reservas sean precedidas por un intercambio de mensajes. Reduce la fricción y la ansiedad del estudiante al realizar su primera compra.

**Related User Journey:**
- **Journey:** "Registro de Estudiante y Reserva de Primera Sesión (Happy Path)"
- **Step:** Se inserta un nuevo paso entre el 4 y el 5. Después de que Laura revisa el perfil de un mentor, ahora tiene la opción de "Enviar Mensaje" para aclarar dudas antes de proceder a "Ver Disponibilidad" y pagar.

---

### Technical Context of This Story

**Architecture Components:**
**Frontend:**
- **Components:** `SendMessageButton` (en el perfil del mentor), `MessageComposerModal`, `ConversationView`.
- **Pages/Routes:** `/mentors/[id]` (donde se inicia la conversación), `/dashboard/messages/[conversationId]` (a donde se redirige después de enviar).
- **State Management:** Un nuevo `MessagesContext` para manejar el estado de las conversaciones y notificaciones en tiempo real.

**Backend:**
- **API Endpoints:** `POST /api/conversations`, `POST /api/conversations/{id}/messages`.
- **Services:** `MessagingService` para la lógica de crear conversaciones y enviar mensajes.
- **Database:** Creación de dos nuevas tablas: `conversations` y `messages`.

**External Services:**
- **Supabase Realtime:** Para la entrega de mensajes en tiempo real.

**Integration Points:**
- **Frontend ↔ Backend API:** El modal de composición de mensajes envía los datos al backend.
- **Backend ↔ Supabase DB:** El backend crea registros en las tablas `conversations` y `messages`.
- **Backend ↔ Supabase Realtime:** El backend publica el nuevo mensaje en un canal de Supabase Realtime.

---

### Story Complexity Analysis

**Overall Complexity:** High

- **Business logic complexity:** Medium - La lógica de iniciar una conversación solo una vez entre dos usuarios.
- **Integration complexity:** High - Introduce una nueva dependencia crítica: Supabase Realtime.
- **Data validation complexity:** Medium - Validación de contenido del mensaje y permisos de usuario.
- **UI complexity:** Medium - Requiere un modal y una vista de conversación que debe funcionar en tiempo real.

**Estimated Test Effort:** High
**Rationale:** Es la primera historia de una nueva épica, estableciendo la base de datos y la arquitectura en tiempo real. Requiere pruebas exhaustivas de la lógica de negocio, la base de datos y la capa de tiempo real.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** ¿Qué sucede si ya existe una conversación con un mentor?
- **Location in Story:** Acceptance Criteria no lo cubre.
- **Question for PO/Dev:** ¿El botón "Send Message" cambia a "View Conversation" o siempre abre un nuevo modal de mensaje que se añade a la conversación existente?
- **Suggested Clarification:** El botón debería cambiar a "View Conversation" y llevar a `/dashboard/messages/[conversationId]`.

**Ambiguity 2:** ¿Cómo es la "message composition interface"?
- **Location in Story:** AC1.
- **Question for PO/Dev:** ¿Es un modal, un pop-up en la esquina, o una nueva página?
- **Suggested Clarification:** Debe ser un `Dialog` (modal) para no sacar al usuario del perfil del mentor, manteniendo el contexto.

**Ambiguity 3:** ¿Qué es la "confirmation that my message was sent"?
- **Location in Story:** AC2.
- **Question for PO/Dev:** ¿Es una notificación toast? ¿Un cambio de estado en la UI?
- **Suggested Clarification:** Un `Toast` de confirmación que aparece por 3 segundos.

---

### Gaps Identified

**Gap 1:** No se especifica el comportamiento post-envío.
- **Why It's Critical:** La experiencia de usuario queda incompleta. ¿El usuario se queda en el perfil del mentor? ¿Se le redirige a la bandeja de entrada?
- **Suggested Addition:** Después de enviar el primer mensaje, el usuario debe ser redirigido a la vista de la conversación recién creada (`/dashboard/messages/[new_conversation_id]`).

**Gap 2:** Falta el manejo de errores de la API y de Realtime.
- **Why It's Critical:** Si la API falla, el usuario debe saber que su mensaje no se envió.
- **Suggested Addition:** Añadir Criterios de Aceptación para escenarios donde el envío de mensaje falla (error de red, error de servidor).

---

### Edge Cases NOT Covered

**Edge Case 1:** Enviar un mensaje a un mentor que acaba de ser desactivado o baneado.
- **Expected Behavior:** La API debe devolver un error `403 Forbidden` con un mensaje "Este mentor no puede recibir mensajes en este momento".

**Edge Case 2:** El usuario intenta iniciar una conversación consigo mismo.
- **Expected Behavior:** El botón "Send Message" no debería aparecer en el propio perfil del usuario.

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: Mentee inicia una nueva conversación desde el perfil del mentor
- **Given** un mentee autenticado está en el perfil de un mentor con el que no tiene conversaciones previas.
- **When** hace clic en el botón "Send Message".
- **Then** se abre un modal con el título "Message to [Nombre del Mentor]".
- **And** el modal contiene un `Textarea` para escribir el mensaje y un botón "Send" deshabilitado.

### Scenario 2: Mentee envía el primer mensaje exitosamente
- **Given** el modal de mensaje está abierto.
- **When** el mentee escribe un mensaje de 10 o más caracteres.
- **Then** el botón "Send" se habilita.
- **When** el mentee hace clic en "Send".
- **Then** el sistema muestra un spinner de carga y deshabilita el botón.
- **And** se crea un nuevo registro en la tabla `conversations` con los IDs de ambos participantes.
- **And** se crea un nuevo registro en la tabla `messages` asociado a la nueva conversación.
- **And** el modal se cierra y el usuario es redirigido a `/dashboard/messages/[new_conversation_id]`.
- **And** en el perfil del mentor, el botón ahora dice "View Conversation".

### Scenario 3: Mentee intenta enviar un mensaje demasiado corto
- **Given** el modal de mensaje está abierto.
- **When** el mentee escribe un mensaje de menos de 10 caracteres.
- **Then** el botón "Send" permanece deshabilitado.
- **And** se muestra un texto de ayuda: "El mensaje debe tener al menos 10 caracteres".

### Scenario 4: Usuario no autenticado intenta enviar un mensaje
- **Given** un visitante anónimo está en el perfil de un mentor.
- **When** hace clic en "Send Message".
- **Then** es redirigido a la página `/login`.
- **And** después de iniciar sesión, es redirigido de vuelta al perfil del mentor.

---

## 🧪 FASE 4: Test Design

### Test Cases

#### **TC-MYM56-01: Iniciar conversación y enviar mensaje exitosamente**
- **Type:** Positive (Happy Path) | **Priority:** Critical
1.  **GIVEN** I am logged in as a mentee.
2.  **AND** I navigate to the profile of a mentor I have never messaged.
3.  **WHEN** I click the "Send Message" button.
4.  **THEN** a modal opens to compose a message.
5.  **WHEN** I type a message over 10 characters long and click "Send".
6.  **THEN** I am redirected to the new conversation page.
7.  **AND** the message I sent is visible with a "sent" timestamp.
8.  **AND** if I navigate back to the mentor's profile, the button now shows "View Conversation".

#### **TC-MYM56-02: Enviar un mensaje a una conversación existente**
- **Type:** Positive | **Priority:** High
1.  **GIVEN** I am a mentee and have an existing conversation with a mentor.
2.  **WHEN** I navigate to that mentor's profile and click "View Conversation".
3.  **THEN** I am taken to the existing conversation thread.
4.  **WHEN** I type a new message and send it.
5.  **THEN** the new message appears in the thread.

#### **TC-MYM56-03: Validación de mensaje corto (<10 caracteres)**
- **Type:** Negative | **Priority:** High
1.  **GIVEN** I am composing a message to a mentor.
2.  **WHEN** I type "Hello".
3.  **THEN** the "Send" button should be disabled.
4.  **AND** a helper text "Message must be at least 10 characters" is visible.

#### **TC-MYM56-04: Usuario no autenticado es redirigido a login**
- **Type:** Negative | **Priority:** High
1.  **GIVEN** I am a logged-out user.
2.  **WHEN** I navigate to a mentor's profile and click "Send Message".
3.  **THEN** I should be redirected to the `/login` page.
4.  **WHEN** I log in successfully.
5.  **THEN** I am redirected back to the mentor's profile page.

#### **TC-MYM56-05: (API) Crear una nueva conversación y mensaje**
- **Type:** API Integration | **Priority:** Critical
1.  **GIVEN** a valid JWT for a mentee.
2.  **WHEN** I send a `POST` request to `/api/conversations` with a valid `mentorId` and message content.
3.  **THEN** the API should return a `201 Created` status with the new `conversationId`.
4.  **AND** a new row should exist in the `conversations` table.
5.  **AND** a new row should exist in the `messages` table.

#### **TC-MYM56-06: (API) RLS - Usuario no puede crear conversación para otros**
- **Type:** Security (API) | **Priority:** Critical
1.  **GIVEN** a valid JWT for mentee "A".
2.  **WHEN** I send a `POST` request to create a conversation, but set the `sender_id` in the payload to mentee "B".
3.  **THEN** the API should return a `403 Forbidden` error due to RLS policy violation.

---

## 📝 FASE 5: QA Feedback Report

### 🚨 Critical Questions for PO

1.  **Clarificación de Visibilidad:** Si un mentor tiene su perfil en modo "oculto" o "no disponible", ¿debería un mentee poder iniciar una conversación con él? Sugiero que no, para evitar que los mentores reciban mensajes cuando no están activos.
2.  **Límite de Conversaciones:** ¿Debería un mentee poder iniciar conversaciones con un número ilimitado de mentores, o debería haber un límite (ej. 3 conversaciones activas) para fomentar reservas reales?

### 🔧 Technical Questions for Dev

1.  **Estrategia de Creación de Conversaciones:** La creación de la conversación y el primer mensaje, ¿serán una única transacción en la base de datos para garantizar la atomicidad?
2.  **Suscripción Realtime:** ¿La suscripción al canal de Supabase Realtime se activará al entrar a la página de mensajes o será global para toda la aplicación? Esto tiene implicaciones de performance.

### 💡 Suggested Story Improvements

1.  **Vista Previa del Perfil del Mentor:** En la vista de la conversación, mostrar un pequeño resumen del perfil del mentor (foto, nombre, especialidad principal) con un enlace a su perfil completo. Esto ayuda a mantener el contexto.
2.  **Estado "Leído":** Aunque `is_read` está en el schema, la historia no define cuándo se marca un mensaje como leído. Sugiero que se marquen como leídos automáticamente cuando la conversación es visible en la pantalla del usuario.
