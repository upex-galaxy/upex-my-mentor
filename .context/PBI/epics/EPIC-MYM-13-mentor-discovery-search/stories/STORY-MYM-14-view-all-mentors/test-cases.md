# Test Cases: STORY-MYM-14 - As a Mentee, I want to see a gallery of all available mentors so that I can browse my options

**Fecha:** 2025-11-12
**QA Engineer:** Gemini AI
**Story Jira Key:** [MYM-14](https://upexgalaxy62.atlassian.net/browse/MYM-14#icft=MYM-14)
**Epic:** EPIC-MYM-13 - Mentor Discovery & Search
**Status:** Draft

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

* **Primary:** Laura, la Desarrolladora Junior. Esta es su primera interacción con los mentores de la plataforma. Una buena experiencia aquí es crucial para que continúe el journey.
* **Secondary:** Sofía, la Cambiadora de Carrera. También necesita una vista clara y sin fricciones para encontrar mentores que la guíen.

**Business Value:**

* **Value Proposition:** Materializa la promesa de "Acceso a Expertise Verificado". Es el escaparate principal del marketplace.
* **Business Impact:** Impacta directamente la métrica de "100 sesiones en el primer mes" y el GMV de "$5,000". Si los usuarios no pueden ver mentores, no pueden reservar.

**Related User Journey:**

* **Journey:** Registro de Estudiante y Reserva de Primera Sesión (Happy Path)
* **Step:** Step 3, donde Laura busca mentores después de registrarse.

---

### Technical Context of This Story

**Architecture Components:**
**Frontend:**

* **Components:** `MentorGallery`, `MentorCard`, `Pagination` (implícito en los AC).
* **Pages/Routes:** `/mentors`
* **State Management:** Probablemente `useState` o `useSWR` para manejar la data de los mentores y la paginación.

**Backend:**

* **API Endpoints:** `GET /api/mentors` (según `api-contracts.yaml`).
* **Services:** Lógica de negocio para filtrar mentores (`role = 'mentor'`, `is_verified = true`).
* **Database:** `USERS`, `MENTORS` (o `profiles` y `mentor_profiles` según el ERD).

**External Services:**

* Ninguno directamente para esta historia. Las fotos de perfil se obtienen de una URL, pero el origen es gestionado en el perfil del mentor (otra historia).

**Integration Points:**

* **Frontend ↔ Backend API:** El componente `MentorGallery` consume el endpoint `GET /api/mentors`.
* **Backend API ↔ Database:** El endpoint `GET /api/mentors` consulta la base de datos para obtener los perfiles de mentores verificados.

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

* **Business logic complexity:** Low. La regla es simple: mostrar solo mentores verificados.
* **Integration complexity:** Medium. La integración frontend-backend-db debe ser robusta y manejar estados de carga/error. La paginación añade complejidad.
* **Data validation complexity:** Low. La validación principal (`is_verified`) ocurre en el backend.
* **UI complexity:** Medium. Debe ser responsive y manejar diferentes cantidades de tarjetas de mentor de forma elegante.

**Estimated Test Effort:** Medium
**Rationale:** Aunque la funcionalidad parece simple, asegurar el rendimiento con paginación, la correcta visualización en diferentes dispositivos y el manejo de casos de borde (0 mentores, errores de API) requiere un esfuerzo de prueba considerable.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

* **Risk 1:** Slow Page Load with 50+ Mentors
  * **Relevance to This Story:** **Directamente relevante.** Esta historia es la que implementa la galería. El rendimiento de carga es un NFR clave (LCP < 2.5s).
* **Risk 2:** Poor Search Relevance
  * **Relevance to This Story:** No directamente, pertenece a MYM-15.
* **Risk 3:** Complex Filter Combinations → Empty Results
  * **Relevance to This Story:** No directamente, pertenece a MYM-16.

**Integration Points from Epic Analysis:**

* **Integration Point 1:** Frontend ↔ Backend API
  * **Applies to This Story:** ✅ Yes
  * **If Yes:** Esta historia implementa el consumo del endpoint `GET /api/mentors` desde el frontend.
* **Integration Point 2:** API ↔ DB
  * **Applies to This Story:** ✅ Yes
  * **If Yes:** El endpoint `GET /api/mentors` debe consultar la base de datos para obtener los mentores.

**Critical Questions Already Asked at Epic Level:**
**Questions for Dev:**

* **Question 1:** Pagination: Offset-based or cursor-based?
  * **Status:** ✅ Answered (en la descripción de la épica).
  * **Answer:** La épica especifica "cursor-based pagination for better performance".
  * **Impact on This Story:** **Crítico.** El testing de la paginación debe validar la lógica de cursores (enviar el ID del último ítem para obtener la siguiente página) en lugar de números de página.

**Test Strategy from Epic:**

* **Test Levels:** Unit, Integration, E2E, API, Performance.
* **Tools:** Playwright (E2E), Vitest (unit), Postman (API), Lighthouse (performance).
* **How This Story Aligns:** Todos los niveles aplican. Se necesitan tests unitarios para los componentes de UI, tests de API para el endpoint `/api/mentors`, tests E2E para el flujo de visualización y tests de performance para validar el LCP.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Layout no especificado (Grid vs. List)

* **Location in Story:** Acceptance Criteria ("paginated grid or list of mentor cards").
* **Question for PO/Dev:** ¿Cuál es el layout para el MVP? ¿Grid, lista, o un selector para que el usuario elija? El diseño en la épica sugiere un grid.
* **Impact on Testing:** El diseño de los tests E2E (especialmente los selectores para los asserts) depende del layout.
* **Suggested Clarification:** "Para el MVP, se implementará un layout de grid. La opción de cambiar a vista de lista se considera para v2."

**Ambiguity 2:** Contenido de la tarjeta de mentor inconsistente.

* **Location in Story:** Acceptance Criteria vs. Diseño en la Épica. El AC dice "name, title, and key skills". El diseño en la épica muestra "Photo, Name, Primary Skill, Rating, Reviews, Price".
* **Question for PO/Dev:** ¿Cuál es la fuente de verdad para el contenido de la `MentorCard`?
* **Impact on Testing:** No se pueden escribir tests de UI precisos sin saber qué campos deben estar presentes.
* **Suggested Clarification:** "La tarjeta de mentor debe mostrar: Foto, Nombre, Especialidad Principal, Valoración Promedio (con estrellas), Nro. de Reviews y Tarifa por hora."

**Ambiguity 3:** Orden de mentores por defecto.

* **Location in Story:** No mencionado. El epic test plan ya lo marcó como ambiguo.
* **Question for PO:** ¿Cuál es el orden por defecto en que aparecen los mentores? ¿Fecha de registro, aleatorio, por valoración?
* **Impact on Testing:** Imposible validar el orden de los resultados sin una regla definida. Un orden aleatorio requiere una estrategia de testing diferente (verificar que los ítems correctos están presentes, pero no su orden).
* **Suggested Clarification:** "Por defecto, los mentores se mostrarán en orden aleatorio en cada carga de página para asegurar una visibilidad justa."

---

### Missing Information / Gaps

**Gap 1:** Comportamiento con cero mentores en el sistema.

* **Type:** Business Rule / Edge Case.
* **Why It's Critical:** Es el estado inicial de la plataforma. La página no puede estar en blanco o rota.
* **Suggested Addition:** Un nuevo Criterio de Aceptación: "Si no hay mentores verificados en el sistema, la página debe mostrar un mensaje amigable invitando a los usuarios a volver más tarde y un CTA para aplicar como mentor."
* **Impact if Not Added:** Mala primera impresión para los primeros usuarios, posible percepción de que la plataforma está rota.

**Gap 2:** Archivos de contexto locales faltantes.

* **Type:** Technical Details.
* **Why It's Critical:** El workflow especifica la existencia de `feature-test-plan.md` y `story.md` locales. No existen.
* **Suggested Addition:** Usar la información de Jira como fuente de verdad y crear los archivos locales como parte de este proceso.
* **Impact if Not Added:** Inconsistencia con el workflow definido.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Mentor des-verificado mientras el usuario navega.

* **Scenario:** Un usuario carga la página de mentores. Un admin des-verifica a un mentor que aparece en la página. El usuario navega a la página 2 y luego vuelve a la 1.
* **Expected Behavior:** El mentor des-verificado ya no debería aparecer en la lista.
* **Criticality:** Medium.
* **Action Required:** Add to test cases only.

**Edge Case 2:** Foto de perfil de mentor rota o inválida.

* **Scenario:** La URL de la foto de un mentor devuelve un 404 o es una imagen corrupta.
* **Expected Behavior:** La `MentorCard` debería mostrar un avatar de fallback (ej. las iniciales del mentor) en lugar de un ícono de imagen rota.
* **Criticality:** Medium.
* **Action Required:** Add to Refined AC.

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues (if any):**

* [x] Acceptance criteria are vague or subjective (grid vs list, card content).
* [x] Expected results are not specific enough (default sort order).
* [x] Missing error scenarios (0 mentors in system).

**Recommendations to Improve Testability:**

* Aclarar las ambigüedades 1, 2 y 3.
* Añadir el Criterio de Aceptación para el caso de 0 mentores.
* Definir el comportamiento para el caso de imágenes rotas.

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: Visualización exitosa de la galería de mentores (Happy Path)

**Type:** Positive, **Priority:** Critical

* **Given:** Hay al menos 5 mentores con estado `is_verified = true` en la base de datos.
* **And:** Un usuario (visitante o logueado) navega a la página `/mentors`.
* **When:** La página termina de cargar.
* **Then:** Se muestra un grid de tarjetas de mentor.
* **And:** Solo se muestran los mentores con `is_verified = true`.
* **And:** Cada tarjeta de mentor muestra: Foto (o avatar de fallback), Nombre, Especialidad Principal, Valoración Promedio, Nro. de Reviews y Tarifa por hora.
* **And:** El endpoint `GET /api/mentors` responde con un status `200 OK`.

---

### Scenario 2: Visualización con paginación

**Type:** Positive, **Priority:** High

* **Given:** Hay 25 mentores verificados en la base de datos y la paginación está configurada a 20 por página.
* **And:** Un usuario está en la página `/mentors`.
* **When:** El usuario hace clic en el botón "Siguiente" de la paginación.
* **Then:** La galería se actualiza para mostrar los 5 mentores restantes.
* **And:** El endpoint `GET /api/mentors` es llamado con el parámetro de cursor correcto.

---

### Scenario 3: No hay mentores verificados en el sistema

**Type:** Negative (Empty State), **Priority:** High

* **Given:** No hay ningún mentor con `is_verified = true` en la base de datos.
* **And:** Un usuario navega a la página `/mentors`.
* **When:** La página termina de cargar.
* **Then:** No se muestra ningún grid de mentores.
* **And:** Se muestra un mensaje claro, como "Aún no hay mentores disponibles. ¡Vuelve pronto o aplica para ser uno!".

---

### Scenario 4: Avatar de fallback para imagen rota

**Type:** Boundary, **Priority:** Medium

* **Given:** Un mentor verificado tiene una `photo_url` que resulta en un error 404.
* **And:** Un usuario navega a la página `/mentors`.
* **When:** La tarjeta de ese mentor se renderiza.
* **Then:** En lugar de un ícono de imagen rota, se muestra un avatar de fallback con las iniciales del mentor.

---

## 🧪 FASE 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8
**Breakdown:**

* Positive: 3
* Negative: 2
* Boundary: 1
* Integration: 2

**Rationale for This Number:** La historia es de complejidad media. El foco está en la correcta visualización, paginación, y manejo de estados vacíos/de error.

---

### Test Cases

#### **TC-001: Verificar que los mentores se muestran por defecto en orden de rating descendente**

**Related Scenario:** Scenario 1 (Refined AC above)
**Type:** Positive, **Priority:** Critical, **Test Level:** E2E
**Preconditions:**

* Existen 3 mentores en la DB:
  * Mentor A: `is_verified = true`, rating = 4.5
  * Mentor B: `is_verified = true`, rating = 4.9
  * Mentor C: `is_verified = false`, rating = 4.8
* El usuario no necesita estar logueado.
**Test Steps:**

1. Navegar a la página `/mentors`.
2. Esperar a que la galería de mentores cargue.
3. Verificar el orden de los mentores que se muestran.
**Expected Result:**

* **UI:** La galería muestra solo 2 tarjetas. La tarjeta del Mentor B aparece antes que la del Mentor A. La tarjeta del Mentor C NO se muestra.

---

#### **TC-002: Verificar el contenido de la tarjeta de mentor**

**Related Scenario:** Scenario 1
**Type:** Positive, **Priority:** High, **Test Level:** Component (UI)
**Preconditions:**

* Se renderiza un componente `MentorCard` con datos de un mentor específico (ej. Carlos Mendoza, $120/hr, 4.9 rating).
**Test Steps:**

1. Inspeccionar el componente renderizado.
**Expected Result:**

* **UI:** La tarjeta debe contener:
  * El nombre "Carlos Mendoza".
  * La tarifa "$120/hr".
  * La valoración "4.9".
  * Un avatar o imagen.
  * Al menos una especialidad (ej. "System Design").

---

#### **TC-003: Verificar el comportamiento cuando no hay mentores verificados**

**Related Scenario:** Scenario 3
**Type:** Negative, **Priority:** High, **Test Level:** E2E
**Preconditions:**

* La base de datos no contiene ningún mentor con `is_verified = true`.
* El usuario navega a `/mentors`.
**Test Steps:**

1. Observar el contenido de la página.
**Expected Result:**

* **UI:** No se muestra el grid de mentores. Se muestra un texto visible con el mensaje "Aún no hay mentores disponibles. ¡Vuelve pronto o aplica para ser uno!".

---

#### **TC-004: Verificar el avatar de fallback para una imagen de perfil rota**

**Related Scenario:** Scenario 4
**Type:** Boundary, **Priority:** Medium, **Test Level:** Component (UI)
**Preconditions:**

* Se renderiza un componente `MentorCard` para un mentor cuya `photo_url` es inválida (devuelve 404).
**Test Steps:**

1. Inspeccionar el componente renderizado.
**Expected Result:**

* **UI:** La tarjeta no muestra un ícono de imagen rota. En su lugar, muestra un avatar de fallback (ej. un círculo con las iniciales del mentor).

---

#### **TC-005: Verificar la paginación - Carga de la segunda página**

**Related Scenario:** Scenario 2
**Type:** Positive, **Priority:** High, **Test Level:** E2E
**Preconditions:**

* Existen 21 mentores verificados en la DB. La paginación está configurada a 20 por página.
* El usuario está en `/mentors`.
**Test Steps:**

1. Verificar que se muestran 20 tarjetas de mentor.
2. Hacer clic en el botón "Siguiente" de la paginación.
3. Esperar a que la nueva página cargue.
**Expected Result:**

* **UI:** La galería se actualiza y ahora muestra 1 única tarjeta de mentor (el número 21).

---

#### **TC-006: Verificar que la página es responsive**

**Related Scenario:** General
**Type:** Negative (Visual), **Priority:** Medium, **Test Level:** E2E
**Preconditions:**

* El usuario está en `/mentors` con una lista de mentores visible.
**Test Steps:**

1. Abrir las herramientas de desarrollador del navegador.
2. Cambiar el tamaño de la ventana a una resolución de móvil (ej. 375x667).
3. Observar el layout de la galería.
**Expected Result:**

* **UI:** Las tarjetas de mentor se reorganizan en una sola columna. No hay overflow horizontal ni elementos superpuestos.

---

#### **TC-007: API - Verificar que el endpoint GET /api/mentors funciona correctamente**

**Related Scenario:** Integration
**Type:** Integration, **Priority:** Critical, **Test Level:** API
**Preconditions:**

* Existen 2 mentores verificados y 1 no verificado en la DB.
**Test Steps:**

1. Realizar una petición `GET` a `/api/mentors`.
**Expected Result:**

* **API Response:**
  * Status Code: `200 OK`.
  * Response Body: Un array JSON que contiene los datos de los 2 mentores verificados únicamente. El mentor no verificado no debe estar en la respuesta.

---

#### **TC-008: Performance - Verificar el LCP de la galería de mentores**

**Related Scenario:** Non-Functional Requirement
**Type:** Performance, **Priority:** High, **Test Level:** Manual E2E
**Preconditions:**

* El entorno de `staging` está desplegado.
* Existen ~50 mentores con `is_verified = true` en la base de datos de `staging`.
**Test Steps:**

1. Abrir el navegador en modo incógnito con las herramientas de desarrollador (DevTools) abiertas.
2. En la pestaña "Network", emular una conexión "Slow 3G".
3. Navegar a la página de mentores (`/mentors`).
4. Observar el tiempo de LCP (Largest Contentful Paint) reportado en la pestaña "Performance" o "Lighthouse".
**Expected Result:**

* **Performance:** El valor de LCP es ≤ 2.5 segundos.
