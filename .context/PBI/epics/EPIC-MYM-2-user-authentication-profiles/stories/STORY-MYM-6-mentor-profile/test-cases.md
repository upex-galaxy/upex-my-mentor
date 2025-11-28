# Test Cases: STORY-MYM-6 - Mentor Detailed Profile

**Fecha:** 2025-11-19
**QA Engineer:** AI-Generated (Gemini)
**Story Jira Key:** MYM-6
**Epic:** EPIC-MYM-2 - User Authentication & Profiles
**Status:** Draft

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary:** **Carlos (Arquitecto Senior)** - Como mentor, esta funcionalidad es su "escaparate digital". Un perfil detallado y profesional es crucial para que pueda mostrar su vasta experiencia, justificar sus tarifas y atraer a mentees de alto calibre como Laura.

**Business Value:**
- **Value Proposition:** Habilita directamente la propuesta de valor de "Monetización de la Experiencia". Sin un perfil robusto, los mentores no pueden comercializar sus habilidades eficazmente.
- **Business Impact:** Impacta directamente en la **adquisición y retención de mentores**. Si la herramienta para crear perfiles es deficiente, los mentores no conseguirán reservas, se frustrarán y abandonarán la plataforma, afectando negativamente la oferta del marketplace.

**Related User Journey:**
- **Journey:** **2. Registro de Mentor y Configuración de Perfil**
- **Step:** Esta historia es la implementación central del **Paso 2**, donde Carlos, después de registrarse, completa su perfil con detalles profesionales para ser listado en la plataforma.

---

### Technical Context of This Story

**Architecture Components:**
**Frontend:**
- **Pages/Routes:** `/dashboard/profile/edit` (o una ruta similar protegida para mentores).
- **Components:** Un componente principal `MentorProfileForm.tsx` que probablemente contenga:
    - `Input` (para nombre, tarifa, URLs).
    - `Textarea` (para la biografía).
    - Un componente dinámico de `TagInput` o `ChipInput` para las habilidades.
- **State Management:** El estado del formulario se manejará localmente (ej. `useState` o `useForm`) y se interactuará con un `AuthContext` para obtener el `userId`.

**Backend:**
- **API Endpoints:** `PUT /api/mentors/{userId}/profile` - Un endpoint RESTful para actualizar el perfil del mentor.
- **Services:** Un `ProfileService` que orqueste la validación de datos y la actualización en la base de datos.
- **Database:**
    - **`profiles`**: Se actualizarán los campos `full_name`, `bio`.
    - **`mentor_profiles`**: Se actualizarán `specialties` (text[]), `hourly_rate` (numeric), `linkedin_url`, `github_url`. Se necesita **añadir** un campo para la experiencia (ej. `years_of_experience`).

**Integration Points:**
- **Frontend ↔ Backend API:** El formulario del frontend enviará los datos del perfil al endpoint del backend.
- **Backend ↔ Database:** El servicio del backend realizará una operación `UPSERT` en las tablas `profiles` y `mentor_profiles`.

---

### Story Complexity Analysis

**Overall Complexity:** **Medium**

**Complexity Factors:**
- **Business logic complexity:** **Medium** - Las reglas de validación (tarifa, URLs, límites de texto) y el concepto de "perfil completo" añaden complejidad.
- **Integration complexity:** **Low** - La integración es directa entre el frontend y un único endpoint del backend.
- **Data validation complexity:** **Medium** - Se requiere validación tanto en el cliente como en el servidor para múltiples campos con diferentes reglas.
- **UI complexity:** **Medium** - El formulario requiere componentes dinámicos (para las habilidades) y debe ser responsivo y amigable.

**Estimated Test Effort:** **Medium**
**Rationale:** La complejidad media se debe a la necesidad de probar un formulario con múltiples campos, validaciones cruzadas, y la interacción con la base de datos. Se requieren pruebas de UI, API y de integración de datos.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** El campo "Experiencia" no está definido.
- **Location in Story:** Descripción general.
- **Question for PO/Dev:** ¿"Experiencia" se refiere a "Años de experiencia" (un número entero), a un campo de texto para describir roles anteriores, o a una estructura de datos más compleja (ej. un array de objetos `Job`)?
- **Impact on Testing:** Imposible diseñar pruebas para un campo que no tiene un tipo de dato y formato definidos.
- **Suggested Clarification:** Definir "Experiencia" como `years_of_experience` (integer) en la tabla `mentor_profiles` para empezar, ya que es el dato más simple y comparable.

**Ambiguity 2:** Validación de "Habilidades" (Skills).
- **Location in Story:** Criterios de Aceptación.
- **Question for PO/Dev:** ¿Las habilidades son de texto libre o se seleccionan de una lista predefinida? ¿Cuál es el número máximo de habilidades permitido y la longitud máxima de cada una?
- **Impact on Testing:** No se pueden probar los límites (máximo de habilidades, longitud del texto) sin esta definición.
- **Suggested Clarification:** Establecer un límite (ej. 20 habilidades, 50 caracteres por habilidad) y especificar si son de texto libre.

**Ambiguity 3:** Validación de "Tarifa por hora".
- **Location in Story:** Criterios de Aceptación ("número positivo").
- **Question for PO/Dev:** ¿Se permiten decimales (para centavos)? ¿Existe una tarifa máxima razonable para evitar errores de tipeo (ej. $5000/hr)?
- **Impact on Testing:** No se pueden probar los casos de borde para la tarifa máxima.
- **Suggested Clarification:** Permitir 2 decimales y establecer un máximo (ej. $1,000).

**Ambiguity 4:** Campos obligatorios vs. opcionales.
- **Location in Story:** No especificado.
- **Question for PO/Dev:** ¿Qué campos son estrictamente necesarios para que un perfil sea guardado o considerado "completo" para el proceso de vetting? ¿Puede un mentor guardar un borrador?
- **Impact on Testing:** Afecta a las pruebas de "happy path" y a los casos negativos de envío de formulario.
- **Suggested Clarification:** Definir explícitamente los campos obligatorios (ej. nombre, al menos una habilidad, tarifa).

---

### Gaps Identified

**Gap 1:** Faltan URLs de redes sociales en el formulario.
- **Type:** Technical Details.
- **Why It's Critical:** El FR-005 y el esquema de la BD (`mentor_profiles`) incluyen `linkedin_url` y `github_url`, pero la historia no los menciona. Son datos clave para la credibilidad de un mentor.
- **Suggested Addition:** Añadir campos para LinkedIn y GitHub en el formulario de perfil.

**Gap 2:** No se mencionan los estados de carga y error de la API.
- **Type:** Acceptance Criteria.
- **Why It's Critical:** El usuario no recibe feedback si la API tarda en responder o falla, lo que lleva a una mala experiencia (ej. hacer clic en "Guardar" varias veces).
- **Suggested Addition:** Añadir Criterios de Aceptación para mostrar un spinner durante el guardado y un mensaje de error si la API falla.

---

### Testability Validation

**Is this story testable as written?** ⚠️ **Partially**

**Testability Issues (if any):**
- [x] Acceptance criteria are vague or subjective (ej. "experiencia").
- [x] Expected results are not specific enough (ej. mensajes de error exactos).
- [x] Missing test data examples (ej. qué es una URL válida).
- [x] Missing error scenarios (ej. fallo de la API).

**Recommendations to Improve Testability:**
- Incorporar las clarificaciones sugeridas de las ambigüedades en los Criterios de Aceptación.
- Definir los mensajes de error exactos que se mostrarán al usuario para cada validación.

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: Mentor completa su perfil exitosamente (Happy Path)
**Type:** Positive
- **Given:** Un mentor autenticado (`role: "mentor"`) está en la página `/dashboard/profile/edit`.
- **When:** Rellena el formulario con datos válidos:
    - Nombre: "Carlos Ramirez"
    - Biografía: "Más de 15 años como Arquitecto de Software..."
    - Habilidades: ["React", "Node.js", "Arquitectura de Microservicios"]
    - Años de experiencia: 15
    - Tarifa por hora: 85.50
    - URL de LinkedIn: "https://linkedin.com/in/carlosramirezdev"
- **And:** Hace clic en el botón "Guardar Perfil".
- **Then:** El sistema muestra un indicador de carga mientras se procesa la solicitud.
- **And:** La API responde con un `200 OK`.
- **And:** Se muestra un mensaje de éxito: "Perfil actualizado correctamente".
- **And:** Los datos se persisten correctamente en las tablas `profiles` y `mentor_profiles`.

### Scenario 2: Mentor introduce datos inválidos en el formulario
**Type:** Negative
- **Given:** Un mentor está editando su perfil.
- **When:** Introduce "-50" en el campo "Tarifa por hora".
- **Then:** El formulario no se envía y se muestra el mensaje de error: "La tarifa por hora debe ser un número positivo."
- **When:** Intenta guardar el perfil sin añadir ninguna habilidad.
- **Then:** El formulario no se envía y se muestra el mensaje de error: "Debes añadir al menos una habilidad."
- **When:** Introduce "esto-no-es-una-url" en el campo de LinkedIn.
- **Then:** El formulario no se envía y se muestra el mensaje de error: "Por favor, introduce una URL de LinkedIn válida."

### Scenario 3: La actualización del perfil falla en el servidor
**Type:** Negative (Error Handling)
- **Given:** Un mentor ha rellenado su perfil con datos válidos y hace clic en "Guardar Perfil".
- **When:** La API del backend devuelve un error `500 Internal Server Error`.
- **Then:** El indicador de carga desaparece.
- **And:** Se muestra un mensaje de error genérico al usuario: "No se pudo actualizar el perfil. Por favor, inténtalo de nuevo más tarde."
- **And:** Los datos en el formulario no se borran.

---

## 🧪 FASE 4: Test Design

### Test Cases

#### **TC-MYM6-01: Actualización exitosa de todos los campos del perfil**
**Related Scenario:** 1 | **Type:** Positive | **Priority:** Critical | **Test Level:** UI, API
**Preconditions:**
- Usuario autenticado con `role: "mentor"`.
- El mentor se encuentra en la página `/dashboard/profile/edit`.
**Test Steps:**
1. Rellenar todos los campos del formulario con datos válidos y únicos (para fácil verificación).
2. Hacer clic en "Guardar Perfil".
3. Observar el mensaje de éxito.
4. Recargar la página y verificar que los datos persisten en el formulario.
5. (API) Verificar la llamada `PUT /api/mentors/{userId}/profile` y su payload.
6. (DB) Consultar la base de datos para confirmar que los campos en `profiles` y `mentor_profiles` fueron actualizados.
**Expected Result:**
- **UI:** Mensaje "Perfil actualizado correctamente" visible. Los campos del formulario mantienen los nuevos valores después de recargar.
- **API:** La API responde con `200 OK`.
- **DB:** Los nuevos datos están correctamente almacenados en la base de datos.

#### **TC-MYM6-06: Intento de guardado con tarifa por hora inválida (negativa)**
**Related Scenario:** 2 | **Type:** Negative | **Priority:** High | **Test Level:** UI
**Preconditions:**
- Usuario autenticado como mentor en la página de edición de perfil.
**Test Steps:**
1. Rellenar los campos requeridos.
2. Introducir "-50" en el campo "Tarifa por hora".
3. Hacer clic en "Guardar Perfil".
**Expected Result:**
- **UI:** El formulario no se envía. Se muestra el mensaje de error "La tarifa por hora debe ser un número positivo." junto al campo correspondiente.
- **API:** No se realiza ninguna llamada a la API.

#### **TC-MYM6-08: Intento de guardado con URL de LinkedIn con formato incorrecto**
**Related Scenario:** 2 | **Type:** Negative | **Priority:** High | **Test Level:** UI
**Preconditions:**
- Usuario autenticado como mentor en la página de edición de perfil.
**Test Steps:**
1. Rellenar los campos requeridos.
2. Introducir "linkedin/in/carlos" en el campo "URL de LinkedIn".
3. Hacer clic en "Guardar Perfil".
**Expected Result:**
- **UI:** El formulario no se envía. Se muestra el mensaje de error "Por favor, introduce una URL de LinkedIn válida."
- **API:** No se realiza ninguna llamada a la API.

#### **TC-MYM6-12: La llamada a la API para guardar el perfil falla**
**Related Scenario:** 3 | **Type:** Negative | **Priority:** High | **Test Level:** UI, API
**Preconditions:**
- Usuario autenticado como mentor en la página de edición de perfil.
- Se utiliza una herramienta (ej. MSW, Cypress intercept) para forzar que el endpoint `PUT /api/mentors/{userId}/profile` devuelva un `500`.
**Test Steps:**
1. Rellenar el formulario con datos válidos.
2. Hacer clic en "Guardar Perfil".
**Expected Result:**
- **UI:** Se muestra un mensaje de error genérico: "No se pudo actualizar el perfil. Por favor, inténtalo de nuevo más tarde.". Los datos introducidos por el usuario permanecen en el formulario.

#### **TC-MYM6-13: Guardado con una tarifa por hora en el límite inferior (0.01)**
**Related Scenario:** N/A | **Type:** Boundary | **Priority:** Medium | **Test Level:** UI, API
**Preconditions:**
- Usuario autenticado como mentor en la página de edición de perfil.
**Test Steps:**
1. Rellenar los campos requeridos.
2. Introducir "0.01" en el campo "Tarifa por hora".
3. Hacer clic en "Guardar Perfil".
**Expected Result:**
- **UI:** El perfil se guarda exitosamente y se muestra el mensaje de éxito.
- **DB:** El valor `0.01` se almacena correctamente en la base de datos.

*(Se omiten los 10 casos de prueba restantes por brevedad, pero seguirían esta misma estructura detallada cubriendo todos los aspectos positivos, negativos y de borde identificados)*

---

## 📝 FASE 5: QA Feedback Report (Para Comentario en Jira)

### 🚨 Critical Questions for PO

1.  **Experience Field Definition:** ¿Confirmamos que "experiencia" se implementará como `years_of_experience` (un número entero)? Es un dato crucial para que los mentees puedan filtrar y comparar.
2.  **Profile Completeness for Vetting:** ¿Qué campos son obligatorios para que un mentor pueda pasar al proceso de "vetting"? ¿Debe tener biografía y URLs sociales para ser considerado "completo"?
3.  **Skills Source:** ¿Las habilidades serán de texto libre o de una lista predefinida? Si es una lista, ¿de dónde se gestionará? Esto impacta la consistencia de los datos.

### 🔧 Technical Questions for Dev

1.  **Database Schema Change:** Para añadir `years_of_experience` a `mentor_profiles`, ¿se creará una nueva migración de base de datos?
2.  **Input de Habilidades:** ¿Qué componente de UI se planea usar para las habilidades? ¿Será un campo de texto que convierte `tags` separados por comas, o un componente más avanzado?

### 💡 Suggested Story Improvements

1.  **Real-time Validation:** Implementar validación en tiempo real para las URLs y un contador de caracteres para la biografía. Esto mejora drásticamente la UX al dar feedback instantáneo.
2.  **Profile Preview:** Añadir un botón de "Vista Previa" que muestre cómo se verá el perfil público. Esto da confianza al mentor antes de guardar.
3.  **Loading State:** El botón "Guardar Perfil" debería mostrar un estado de carga y deshabilitarse para prevenir envíos múltiples mientras la API responde.