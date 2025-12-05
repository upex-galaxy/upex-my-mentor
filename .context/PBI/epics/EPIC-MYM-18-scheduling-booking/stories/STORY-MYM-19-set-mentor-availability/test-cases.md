# Test Cases: STORY-MYM-19 - Set Mentor Weekly Availability

**Fecha:** 2025-11-21
**QA Engineer:** Gemini-CLI
**Story Jira Key:** MYM-19
**Epic:** EPIC-MYM-18 - Scheduling & Booking
**Status:** Draft

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary:** Carlos, el Arquitecto Senior. Esta funcionalidad es el habilitador principal para que él pueda empezar a monetizar su tiempo. Sin esto, su perfil no es "reservable".

**Business Value:**
- **Value Proposition:** Proporciona el mecanismo para la propuesta de valor del mentor: "Monetización de la Experiencia".
- **Business Impact:** Impacta directamente la métrica de "Mentores Verificados Activos" y el inventario de sesiones disponibles, que es un prerrequisito para el GMV.

**Related User Journey:**
- **Journey:** Registro de Mentor y Configuración de Perfil
- **Step:** Es el paso 4, "Configura su disponibilidad en el calendario", un paso crucial que convierte a un mentor verificado en un mentor "disponible para negocio".

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
- **Components:** `MentorAvailabilityCalendar`, `TimezoneSelector`.
- **Pages/Routes:** `/dashboard/mentor/availability`.

**Backend:**
- **API Endpoints:** `PUT /api/mentors/{mentorId}/calendar`
- **Services:** `AvailabilityService`
- **Database:** `mentor_availability` (escritura), `availability_exceptions` (escritura).

**External Services:**
- Ninguno.

**Integration Points:**
- **UI ↔ API:** La UI debe enviar un arreglo de slots de disponibilidad en el formato esperado por el endpoint.
- **API ↔ Database:** El servicio debe traducir la solicitud de la API en operaciones atómicas de borrado e inserción en la tabla `mentor_availability`.

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**
- **Business logic complexity:** Medium. La lógica para manejar la atomicidad (borrar todo y luego insertar) y validar que los nuevos slots no se solapen entre sí es moderadamente compleja.
- **UI complexity:** Medium. Un calendario interactivo con selección de rangos horarios es más complejo que un formulario estándar.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**
- **Risk 1:** Timezone Conversion Errors.
  - **Relevance to This Story:** Muy relevante. La disponibilidad que el mentor guarde debe tener asociada su zona horaria para que las conversiones futuras (en STORY-MYM-20) sean correctas.
- **Risk 2:** Mentors Do Not Set Availability.
  - **Relevance to This Story:** Esta historia es la mitigación directa de ese riesgo. Su éxito y usabilidad son clave.

**Critical Questions Already Asked at Epic Level:**
- **Question 1:** Atomicidad de la actualización de disponibilidad.
  - **Status:** ✅ Answered (Implicitly, by this analysis).
  - **Impact on This Story:** Es el core técnico de esta historia. La pregunta se debe responder aquí con una estrategia de transacción en la base de datos.

**Summary: How This Story Fits in Epic:**
- **Story Role in Epic:** Es la fundación de la épica. Proporciona los datos de entrada (el inventario de tiempo del mentor) sin los cuales ninguna reserva puede ocurrir.
- **Inherited Risks:** El riesgo de que el mentor no configure su disponibilidad es directamente abordado por esta historia.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** ¿Desde dónde se obtiene la zona horaria del mentor?
- **Location in Story:** Technical Notes: "based on the mentor's specified timezone during setup."
- **Question for PO/Dev:** ¿Existe ya una historia para que el mentor configure su zona horaria (ej. en su perfil, STORY-MYM-6)? Si no, ¿debería esta historia incluir un selector de zona horaria en la misma página de disponibilidad?
- **Impact on Testing:** Imposible validar el almacenamiento correcto en UTC sin saber la zona horaria de origen.
- **Suggested Clarification:** Asumiremos que la página de disponibilidad debe tener un selector de zona horaria si no está definido en el perfil del usuario.

### Missing Information / Gaps

**Gap 1:** Manejo de errores de validación en la UI.
- **Type:** Acceptance Criteria.
- **Why It's Critical:** La historia no describe qué debe ver el mentor si intenta guardar slots que se solapan o si el formato de hora es inválido.
- **Suggested Addition:** Agregar un Criterio de Aceptación Negativo para este caso.
- **Impact if Not Added:** Experiencia de usuario pobre y potenciales bugs si la UI no maneja los errores 400 del backend.

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Borrar toda la disponibilidad.
- **Scenario:** Un mentor que tenía disponibilidad decide borrar todos sus slots y guardar.
- **Expected Behavior:** El sistema debería eliminar todos sus registros de la tabla `mentor_availability`. El mentor aparecerá como "No disponible".
- **Criticality:** Medium.
- **Action Required:** Add to refined acceptance criteria.

**Edge Case 2:** Crear un slot que abarca la medianoche.
- **Scenario:** Mentor intenta crear un slot de "Viernes 10 PM a Sábado 1 AM".
- **Expected Behavior:** ¿Se permite esto? ¿Se debe crear como dos slots separados (Vie 10-12, Sab 12-1)? El comportamiento debe ser definido.
- **Criticality:** Low.
- **Action Required:** Ask PO. Por ahora, se asumirá que no es un caso soportado en el MVP.

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: El mentor establece su disponibilidad inicial (Happy Path)
- **Given:** Carlos (mentor) está en su página de "Disponibilidad" y ha seleccionado "America/New_York" como su zona horaria.
- **When:** Selecciona "Lunes de 9:00 AM a 11:00 AM" y "Miércoles de 2:00 PM a 5:00 PM" y hace clic en "Guardar".
- **Then:** El sistema guarda dos registros en la tabla `mentor_availability` asociados a su ID, con los días y horas correspondientes.

### Scenario 2: El mentor actualiza su disponibilidad (Happy Path)
- **Given:** Carlos tiene disponibilidad existente para "Lunes de 9:00 AM a 11:00 AM".
- **When:** Elimina el slot del Lunes, agrega "Viernes de 10:00 AM a 12:00 PM" y guarda.
- **Then:** El sistema ejecuta una transacción que primero elimina todos los registros de disponibilidad anteriores de Carlos y luego inserta el nuevo registro para el Viernes.

### Scenario 3: El mentor intenta guardar slots que se solapan (Negative)
- **Given:** Carlos está en su página de "Disponibilidad".
- **When:** Intenta guardar dos slots para el mismo día que se solapan, como "Lunes 9-11 AM" y "Lunes 10 AM-12 PM".
- **Then:** La UI muestra un mensaje de error: "Los horarios de disponibilidad no pueden solaparse." y la operación de guardado no se ejecuta.

### Scenario 4: El mentor borra toda su disponibilidad (Edge Case)
- **Given:** Carlos tiene disponibilidad existente.
- **When:** Elimina todos los slots de su calendario semanal y hace clic en "Guardar".
- **Then:** El sistema elimina todos sus registros de disponibilidad y su perfil público ya no muestra horarios disponibles.

---

## 🧪 FASE 4: Test Design

### Test Cases

#### **TC-MYM19-001: Establecer disponibilidad por primera vez**
- **Type:** Positive, **Priority:** Critical, **Level:** E2E
- **Preconditions:** Usuario logueado como mentor. No tiene disponibilidad previa.
- **Steps:**
  1. Navegar a `/dashboard/mentor/availability`.
  2. Seleccionar "America/New_York" como zona horaria.
  3. Crear un slot para Lunes de 9:00 a 11:00.
  4. Hacer clic en "Guardar".
- **Expected Result:**
  - Mensaje de éxito en la UI.
  - Al recargar la página, el slot del Lunes aparece guardado.
  - En la base de datos, existe un registro en `mentor_availability` para este mentor, `day_of_week: 1`, `start_time: '09:00'`, `end_time: '11:00'`.

#### **TC-MYM19-002: Actualizar disponibilidad borrando y agregando**
- **Type:** Positive, **Priority:** High, **Level:** E2E
- **Preconditions:** Mentor tiene disponibilidad el Lunes de 9:00 a 11:00.
- **Steps:**
  1. Navegar a `/dashboard/mentor/availability`.
  2. Eliminar el slot del Lunes.
  3. Crear un slot para Viernes de 14:00 a 16:00.
  4. Hacer clic en "Guardar".
- **Expected Result:**
  - El slot del Lunes ya no existe en la base de datos.
  - Un nuevo registro para el Viernes existe en la base de datos.

#### **TC-MYM19-03: Intentar guardar slots solapados (Validación de UI)**
- **Type:** Negative, **Priority:** High, **Level:** UI
- **Preconditions:** Mentor en la página de disponibilidad.
- **Steps:**
  1. Crear un slot para Martes de 10:00 a 12:00.
  2. Crear un segundo slot para Martes de 11:00 a 13:00.
  3. Hacer clic en "Guardar".
- **Expected Result:**
  - La UI muestra un error "Los horarios de disponibilidad no pueden solaparse."
  - No se realiza ninguna llamada a la API.

#### **TC-MYM19-04: Intentar guardar slots solapados (Validación de API)**
- **Type:** Negative, **Priority:** High, **Level:** API
- **Preconditions:** Token de autenticación de mentor.
- **Steps:**
  1. Enviar una petición `PUT` a `/api/mentors/{mentorId}/calendar` con un payload que contenga dos slots solapados.
  ```json
  {
    "availability": [
      { "day_of_week": 2, "start_time": "10:00", "end_time": "12:00" },
      { "day_of_week": 2, "start_time": "11:00", "end_time": "13:00" }
    ],
    "timezone": "America/New_York"
  }
  ```
- **Expected Result:**
  - La API responde con un `400 Bad Request`.
  - El cuerpo de la respuesta contiene un error con el código `OVERLAPPING_SLOTS`.
  - La disponibilidad del mentor en la base de datos no ha cambiado.

#### **TC-MYM19-05: Borrar toda la disponibilidad**
- **Type:** Boundary, **Priority:** Medium, **Level:** E2E
- **Preconditions:** Mentor tiene al menos un slot de disponibilidad guardado.
- **Steps:**
  1. Navegar a la página de disponibilidad.
  2. Eliminar todos los slots existentes.
  3. Hacer clic en "Guardar".
- **Expected Result:**
  - Mensaje de éxito.
  - La base de datos no contiene ningún registro de disponibilidad para ese mentor.

#### **TC-MYM19-06: Transacción atómica falla en la inserción**
- **Type:** Negative, **Priority:** High, **Level:** Integration
- **Preconditions:** Mentor tiene disponibilidad guardada. Se usa un mock de la base de datos para simular un fallo.
- **Steps:**
  1. Simular una llamada a la API para actualizar la disponibilidad.
  2. Forzar que la operación `DELETE` sea exitosa.
  3. Forzar que la operación `INSERT` falle (ej. por una restricción violada).
- **Expected Result:**
  - La transacción completa hace rollback.
  - La disponibilidad original del mentor permanece sin cambios en la base de datos.
  - La API devuelve un error `500 Internal Server Error`.
