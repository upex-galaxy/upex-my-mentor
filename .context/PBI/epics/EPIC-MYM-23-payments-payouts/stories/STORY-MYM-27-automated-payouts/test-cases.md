# Test Cases: STORY-MYM-27 - Automated Payout Processing

**Fecha:** 2025-11-22
**QA Engineer:** Gemini AI
**Story Jira Key:** MYM-27
**Epic:** EPIC-MYM-23 - Payments & Payouts
**Status:** Draft

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
*   **Primary:** Carlos, el Arquitecto Senior. Esta historia es el núcleo de su motivación para usar la plataforma: recibir pagos de manera fiable y automatizada por su tiempo y conocimiento. Aborda directamente su "Pain Point" sobre la falta de un canal eficiente y seguro para monetizar su experiencia. Un fallo aquí destruye su confianza en la plataforma.
*   **Secondary:** El equipo de operaciones de la plataforma, que se beneficia de no tener que procesar pagos manualmente.

**Business Value:**
*   **Value Proposition:** Automatiza y garantiza el ciclo de ingresos para los mentores, construyendo confianza y fomentando la retención, lo cual es crítico para mantener la oferta de mentores de alta calidad en el marketplace.
*   **Business Impact:** Contribuye directamente a los KPIs de negocio:
    *   **Tasa de Retención de Mentores (>80%):** Un sistema de pago fiable es el principal motor de retención de mentores.
    *   **Tasa de Entrega de Pagos (>95%):** Esta historia es la implementación directa de este NFR.
    *   Reduce la carga operativa, permitiendo que el negocio escale sin aumentar los costos de personal para la gestión de pagos.

**Related User Journey:**
*   **Journey:** Estudiante Deja Valoración y Mentor Recibe Pago
*   **Step:** Es el paso final y culminante (Paso 5), donde el valor prometido al mentor (la monetización) se materializa. Un fallo en este paso invalida todo el viaje para Carlos.

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
*   Ninguno. Esta es una historia exclusivamente de backend. Sin embargo, los resultados (el estado del pago) se reflejarán en el Dashboard de Ganancias del Mentor (MYM-26).

**Backend:**
*   **API Endpoints:** Ninguno público. La funcionalidad es interna, ejecutada por un proceso programado.
*   **Services:**
    *   **Payout Service (Nuevo):** Lógica de negocio para identificar sesiones elegibles y procesar los pagos.
    *   **Stripe Service:** Wrapper para la API de Stripe, específicamente para crear `Transfers`.
    *   **Notification Service:** Para notificar al mentor cuando se envía un pago.
*   **Scheduled Jobs:**
    *   **Supabase Cron Job:** Un trabajo programado que se ejecuta periódicamente (diaria u horariamente) para invocar la función de pago. El `epic.md` sugiere una ejecución horaria.

**Database:**
*   **Tablas Afectadas:**
    *   `bookings`: Se consulta para encontrar sesiones con `status = 'completed'` y `completed_at < NOW() - INTERVAL '24 hours'`.
    *   `transactions`: Se consulta para asegurar que no exista ya un pago para el `booking_id`.
    *   `payouts`: Se crea un nuevo registro para agrupar las transacciones de un pago.
    *   `payout_items`: Se crea un registro que vincula el `payout` con la `transaction`.
    *   `stripe_accounts`: Se consulta para obtener el `stripe_account_id` del mentor y verificar que `payouts_enabled` es `true`.

**External Services:**
*   **Stripe API:** Para crear un `Transfer` al `destination` (la cuenta de Stripe Connect del mentor).
*   **Email Service:** Para enviar notificaciones de pago al mentor.

**Integration Points:**
*   **Scheduled Job ↔ Backend Logic:** El cron job de Supabase debe invocar correctamente la Edge Function que contiene la lógica de pago.
*   **Backend Logic ↔ Database:** La consulta para sesiones elegibles es compleja y crítica para la corrección del sistema.
*   **Backend Logic ↔ Stripe API:** La llamada para crear el `Transfer` es un punto de fallo crítico. El manejo de errores de la API de Stripe es fundamental.

---

### Story Complexity Analysis

**Overall Complexity:** **High**

**Complexity Factors:**

*   **Business logic complexity:** **High**. La lógica para determinar la elegibilidad de un pago es crítica e involucra múltiples condiciones basadas en tiempo y estado. Un error aquí puede resultar en pagos duplicados, pagos omitidos o pagos prematuros.
*   **Integration complexity:** **High**. Involucra la coordinación entre un trabajo programado (cron), la base de datos interna y un servicio externo crítico (Stripe API). El manejo de fallos en cualquiera de estos puntos es complejo.
*   **Data validation complexity:** **Medium**. Se debe validar el estado de la sesión, el tiempo transcurrido, el estado del pago anterior y, crucialmente, el estado de la cuenta de Stripe Connect del mentor (`payouts_enabled`).
*   **UI complexity:** **N/A** (Backend-only).

**Estimated Test Effort:** **High**. Esta funcionalidad no puede ser probada manualmente de forma sencilla, ya que depende del tiempo. Requiere una robusta suite de tests de integración y E2E que puedan simular el paso del tiempo y mockear las respuestas de la API de Stripe.

**Rationale:** Como funcionalidad financiera crítica, asíncrona y sin intervención del usuario, los requisitos de fiabilidad, idempotencia y manejo de errores son extremadamente altos.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**⚠️ IMPORTANTE:** El análisis de esta historia se beneficia enormemente de las decisiones tomadas a nivel de épica, documentadas en `decisions.md` y en el plan de pruebas de la épica `MYM-23`.

**Critical Risks Already Identified at Epic Level:**
*   **Risk 2: Webhook Failures Cause Missed Payouts (HIGH):** Esta historia es el mecanismo principal de pago. Si el cron job falla, es un riesgo directo. El plan de mitigación de la épica (reconciliation job) actúa como una red de seguridad para esta historia.
*   **Risk 3: Mentor Churn Due to Payout Issues (CRITICAL):** Esta historia es la mitigación directa de este riesgo. Si funciona bien, los mentores confían en la plataforma. Si falla, el riesgo se materializa.
*   **Risk 5: Mentor Bank Account Issues Delay Payouts (MEDIUM):** El `Scenario 2` de esta historia (payout fails) está directamente relacionado con este riesgo y debe manejarlo con gracia.

**Integration Points from Epic Analysis:**
*   **Booking → Payment → Session flow:** Esta historia es el paso final de este flujo, cerrando el ciclo financiero para el mentor.
*   **Scheduled job execution:** El `feature-test-plan.md` especifica que el Payout Processor es un trabajo programado que corre cada hora.

**Critical Questions Already Asked and ANSWERED at Epic Level:**
*   **Q4: Payout timing clarity:**
    *   **Status:** ✅ **Answered** en `decisions.md`.
    *   **Decision:** "Payout initiated 24 hours after session completion. Funds arrive in 2-7 business days (Stripe standard)."
    *   **Impact on This Story:** El cron job debe buscar sesiones con `completed_at < NOW() - INTERVAL '24 hours'`. La comunicación al mentor debe ser clara sobre el tiempo de llegada.
*   **Q6: Reconciliation process:**
    *   **Status:** ✅ **Answered** en `decisions.md`.
    *   **Decision:** "Daily automated reconciliation job + admin dashboard".
    *   **Impact on This Story:** Esta historia es la primera línea de pago. El reconciliation job es la segunda línea (red de seguridad). Debemos asegurar que el cron job sea idempotente para que la ejecución del reconciliation job no cause pagos duplicados.

**Summary: How This Story Fits in Epic:**
*   **Story Role in Epic:** Es el corazón de la propuesta de valor para los mentores. Implementa la promesa de "monetización automatizada". Es la pieza final del ciclo de vida de una transacción exitosa.
*   **Inherited Risks:** Es susceptible a fallos en la API de Stripe, problemas con la cuenta de Stripe Connect del mentor y fallos en la ejecución del cron job.
*   **Unique Considerations:** Al ser una tarea de fondo (backend-only y asíncrona), el logging robusto y las alertas en caso de fallo son más críticos que en las historias orientadas a la UI. La idempotencia es fundamental para evitar pagos duplicados.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Frecuencia del Cron Job (Diaria vs. Horaria)**

*   **Location in Story:** "Technical Notes" menciona "a scheduled Supabase Function (cron job) that runs once a day".
*   **Conflict:** Los documentos de la épica (`feature-test-plan.md` y `decisions.md`) especifican un "payout job (runs hourly)". Esta es una contradicción directa.
*   **Question for PO/Dev:** ¿El cron job de pagos debe ejecutarse una vez al día o cada hora? La ejecución horaria parece más robusta para procesar pagos a medida que se vuelven elegibles.
*   **Impact on Testing:** Afecta la estrategia de pruebas de rendimiento y la validación de la ventana de tiempo para los pagos.
*   **Suggested Clarification:** Asumiremos que la decisión a nivel de épica (horaria) es la correcta. La nota técnica de la historia debe ser actualizada.

**Ambiguity 2: Definición de "payout status is not 'paid_out'"**

*   **Location in Story:** Acceptance Criteria, Scenario 1.
*   **Question for Dev:** ¿Cómo se determina que una sesión no ha sido pagada? ¿Existe un campo `payout_status` en la tabla `bookings`? O ¿se infiere por la ausencia de un registro en la tabla `payout_items`?
*   **Impact on Testing:** La consulta exacta para identificar sesiones elegibles no está clara. Probar la idempotencia (evitar pagos dobles) depende de esta definición.
*   **Suggested Clarification:** La consulta debe ser `...WHERE booking_id NOT IN (SELECT booking_id FROM payout_items)`. Esto es más robusto que un campo de estado que podría desincronizarse.

**Ambiguity 3: Cálculo del "correct net amount"**

*   **Location in Story:** Acceptance Criteria, Scenario 1.
*   **Question for PO:** La historia no define cómo se calcula el "net amount". La épica (`epic.md`) menciona una comisión del 20%. ¿Es este el caso?
*   **Impact on Testing:** Imposible validar la corrección financiera del pago sin la fórmula exacta.
*   **Suggested Clarification:** Se debe añadir: "El monto neto se calcula como `gross_amount * 0.80`, donde `gross_amount` es el total de la transacción original."

**Ambiguity 4: Definición de "logs the error for administrative review"**

*   **Location in Story:** Acceptance Criteria, Scenario 2.
*   **Question for Dev:** ¿Qué significa "loguear el error"? ¿Un `console.log`? ¿Un registro en Sentry? ¿Un registro en una tabla `failed_payouts` en la DB? ¿Una alerta por email a un administrador?
*   **Impact on Testing:** No se puede verificar la acción de "logueo" sin una especificación clara.
*   **Suggested Clarification:** Basado en `decisions.md` (Q6), la acción debería ser "Crear un registro en una tabla de `failed_payouts` para ser mostrado en el Admin Reconciliation Dashboard y enviar una alerta a un canal de monitoreo."

---

### Missing Information / Gaps

**Gap 1: Idempotencia del Cron Job**
*   **Why It's Critical:** Si el cron job falla a mitad de camino y se reinicia, podría procesar las mismas sesiones dos veces, resultando en pagos duplicados. La historia no menciona ninguna salvaguarda.
*   **Suggested Addition:** Añadir un Criterio de Aceptación: "El cron job debe ser idempotente. Ejecutar el job múltiples veces sobre el mismo conjunto de sesiones elegibles no debe resultar en pagos duplicados." Esto se puede lograr con una restricción `UNIQUE` en `payout_items(transaction_id)`.

**Gap 2: Notificación al Mentor en Caso de Fallo de Pago**
*   **Why It's Critical:** El Scenario 2 solo menciona el log para el administrador. El mentor (Carlos) no es notificado de que su pago ha fallado, lo que genera desconfianza y tickets de soporte.
*   **Suggested Addition:** Añadir al Scenario 2: "**And:** El sistema envía un email de notificación al mentor informando que el pago ha fallado y que debe revisar su cuenta de Stripe."

**Gap 3: Comportamiento en Lotes (Batch Processing)**
*   **Why It's Critical:** El job puede encontrar 1,000 sesiones elegibles. Si la número 50 falla, ¿qué pasa con las 950 restantes? ¿Se detiene todo el proceso (malo para los otros mentores) o continúa?
*   **Suggested Addition:** Definir el comportamiento: "El job debe procesar cada sesión de forma independiente. Un fallo en el pago de una sesión no debe detener el procesamiento de las demás sesiones elegibles en el mismo lote."

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1: Sesión con Costo Cero**
*   **Scenario:** Una sesión fue gratuita (ej. cupón de 100% de descuento). El `net_amount` es $0.
*   **Expected Behavior:** El cron job debería procesar la sesión, marcarla como pagada para sacarla de la cola, pero NO intentar una transferencia de $0 a Stripe (la API de Stripe podría rechazarla).

**Edge Case 2: El Mentor Desconecta su Cuenta de Stripe**
*   **Scenario:** Un mentor tiene una sesión completada elegible para pago, pero antes de que el cron job se ejecute, desconecta o su cuenta de Stripe es restringida (`payouts_enabled` pasa a `false`).
*   **Expected Behavior:** El cron job debe verificar el estado `payouts_enabled` del mentor justo antes de intentar la transferencia. Si es `false`, debe omitir el pago y registrarlo como un `failed_payout` para revisión administrativa.

**Edge Case 3: Volumen Masivo de Pagos**
*   **Scenario:** Hay 10,000 sesiones elegibles para pago.
*   **Expected Behavior:** La consulta inicial a la base de datos (`SELECT ... FROM sessions ...`) no debería intentar cargar las 10,000 sesiones en memoria. Debe usar paginación (`LIMIT` y `OFFSET`) o un cursor para procesar los pagos en lotes más pequeños (ej. de 100 en 100) para evitar timeouts y consumo excesivo de memoria.

---

### Testability Validation

**Is this story testable as written?** ⚠️ **Parcialmente**

**Testability Issues:**
*   **Dependencia del Tiempo:** La regla de "24 horas" hace que las pruebas manuales sean inviables y requiere la capacidad de manipular o "congelar" el tiempo (`clock-mocking`) en las pruebas automatizadas.
*   **Falta de Especificación de Errores:** Sin saber cómo se registran los errores (Gap 4) o cómo se notifica a los usuarios (Gap 2), es imposible escribir assertions precisas para los casos de fallo.
*   **Lógica de Negocio Implícita:** El cálculo del `net_amount` y la lógica de idempotencia son críticos pero no están en los AC, lo que deja la validación a la interpretación del tester.

---
## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: Un pago de sesión es procesado exitosamente por el cron job (Happy Path)

**Type:** Positive
**Priority:** Critical

*   **Given:**
    *   Existe una reserva en la tabla `bookings` con `booking_id: 'booking-123'`, `status: 'completed'`, y `completed_at` es una fecha de hace 25 horas.
    *   Existe una transacción en `transactions` para `booking-123` con `gross_amount: 100.00` y `net_amount: 80.00`.
    *   El mentor asociado tiene una cuenta en `stripe_accounts` con `stripe_account_id: 'acct_mentor456'` y `payouts_enabled: true`.
    *   NO existe un registro en `payout_items` para el `transaction_id` de `booking-123`.
*   **When:**
    *   El cron job de Supabase (que corre cada hora) se ejecuta.
*   **Then:**
    *   El sistema identifica la `booking-123` como elegible para pago.
    *   Se realiza una llamada a la API de Stripe `Transfer.create` con los siguientes parámetros:
        *   `amount: 8000` (80.00 USD en centavos).
        *   `currency: 'usd'`.
        *   `destination: 'acct_mentor456'`.
        *   `metadata: { booking_id: 'booking-123' }`.
    *   Se crea un nuevo registro en la tabla `payouts` con el `payout_id` de Stripe, `status: 'pending'` y el monto de 80.00.
    *   Se crea un nuevo registro en la tabla `payout_items` que asocia el `payout_id` con el `transaction_id` de la `booking-123`.
    *   Se envía un email al mentor notificando que su pago de $80.00 ha sido enviado y que puede tardar de 2 a 7 días hábiles en llegar a su banco.

### Scenario 2: Un pago de sesión falla debido a una cuenta de Stripe restringida

**Type:** Negative
**Priority:** High

*   **Given:**
    *   Una reserva elegible para pago (`booking-124`), completada hace 26 horas.
    *   El mentor asociado tiene una cuenta en `stripe_accounts`, pero su estado es `payouts_enabled: false`.
*   **When:**
    *   El cron job de Supabase se ejecuta.
*   **Then:**
    *   El sistema identifica la `booking-124` como elegible.
    *   El sistema verifica el estado de la cuenta del mentor en Stripe y detecta que `payouts_enabled` es `false`.
    *   NO se realiza ninguna llamada a la API de Stripe `Transfer.create`.
    *   El estado de la reserva NO cambia. La sesión sigue siendo elegible para el próximo ciclo.
    *   Se crea un registro en una tabla `failed_payouts` con el `booking_id`, la causa (`'MENTOR_ACCOUNT_RESTRICTED'`) y un timestamp para revisión en el dashboard de administración.
    *   Se envía un email al mentor informándole que su pago no pudo ser procesado y que debe revisar su cuenta de Stripe Connect para resolver el problema.
    *   Se envía una alerta a un canal de monitoreo de administración (ej. Slack o email).

### Scenario 3: El cron job se ejecuta sobre una sesión ya pagada (Idempotencia)

**Type:** Boundary
**Priority:** Critical

*   **Given:**
    *   Una reserva (`booking-123`) fue procesada exitosamente en un ciclo anterior.
    *   Existe un registro en la tabla `payout_items` para la transacción de `booking-123`.
*   **When:**
    *   El cron job de Supabase se ejecuta nuevamente.
*   **Then:**
    *   La consulta de sesiones elegibles (`...WHERE booking_id NOT IN (SELECT booking_id FROM ...payout_items)`) NO retorna la `booking-123`.
    *   No se realiza ninguna llamada a la API de Stripe para la `booking-123`.
    *   No se crea ningún registro duplicado en las tablas `payouts` o `payout_items`.
    *   El sistema registra en los logs "0 nuevas sesiones para pagar" (o un mensaje similar).

### Scenario 4: El cron job se ejecuta sobre una sesión que no cumple el período de gracia

**Type:** Boundary
**Priority:** High

*   **Given:**
    *   Una reserva (`booking-125`) fue completada hace exactamente 23 horas y 59 minutos.
*   **When:**
    *   El cron job de Supabase se ejecuta.
*   **Then:**
    *   La consulta de sesiones elegibles (`...WHERE completed_at < NOW() - INTERVAL '24 hours'`) NO retorna la `booking-125`.
    *   No se procesa ningún pago para esta sesión.

### Scenario 5: El cron job procesa un lote y una de las sesiones falla

**Type:** Negative
**Priority:** Medium

*   **Given:**
    *   Hay dos sesiones elegibles para pago: `booking-A` (mentor con cuenta válida) y `booking-B` (mentor con cuenta restringida).
*   **When:**
    *   El cron job de Supabase se ejecuta y procesa ambas.
*   **Then:**
    *   El pago para `booking-A` se procesa exitosamente (se crea la transferencia en Stripe y los registros en DB).
    *   El pago para `booking-B` falla (no se llama a Stripe, se loguea el error, se notifica al mentor).
    *   El fallo de `booking-B` NO impide que `booking-A` sea procesado correctamente.

---
## 🧪 FASE 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 35

**Breakdown:**
*   **Positive:** 8 test cases
*   **Negative:** 15 test cases
*   **Boundary:** 7 test cases
*   **Integration:** 5 test cases (la mayoría de los casos son de integración por naturaleza)

**Rationale for This Number:**
La historia es de **alta complejidad** y **crítica** para el negocio. Un número elevado de casos de prueba es necesario para cubrir:
1.  **Lógica Financiera:** Precisión en los cálculos de comisiones y montos netos.
2.  **Lógica Temporal:** La ventana de 24 horas debe ser probada en sus límites.
3.  **Integración Externa:** Múltiples escenarios de éxito y fallo con la API de Stripe.
4.  **Idempotencia:** Prevenir pagos duplicados es una necesidad no funcional crítica.
5.  **Manejo de Errores:** El sistema debe ser resiliente y manejar con gracia los fallos esperados (ej. cuenta de mentor restringida).

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

---

#### **Parametrized Test Group 1: Payout Eligibility by Time**

*   **Base Scenario:** El cron job se ejecuta y evalúa una sesión completada en diferentes momentos.
*   **Parameters to Vary:** `completed_at` (relativo a `NOW()`)
*   **Test Data Sets:**

| Test ID | `completed_at` | Expected Outcome |
| :--- | :--- | :--- |
| TC-009 | `NOW() - 23 hours 59 minutes` | No procesado |
| TC-010 | `NOW() - 24 hours` | No procesado (el AC es `> 24h`) |
| TC-001 | `NOW() - 24 hours 1 minute` | Procesado |
| TC-011 | `NOW() - 72 hours` | Procesado |

---

#### **Parametrized Test Group 2: Mentor Stripe Account Status**

*   **Base Scenario:** El cron job intenta procesar un pago para un mentor con diferentes estados en su cuenta de Stripe.
*   **Parameters to Vary:** `payouts_enabled` en la tabla `stripe_accounts`.
*   **Test Data Sets:**

| Test ID | `payouts_enabled` | Expected Outcome |
| :--- | :--- | :--- |
| TC-001 | `true` | Pago procesado |
| TC-002 | `false` | Pago fallido, error logueado, mentor notificado |
| TC-012 | `null` (o la cuenta no existe) | Pago fallido, error logueado |

---

### Test Cases

#### **TC-001: Procesamiento exitoso de un pago elegible (Happy Path)**

**Related Scenario:** Scenario 1 (Refined AC)
**Type:** Positive
**Priority:** Critical
**Test Level:** Integration

---

**Preconditions:**

*   Una reserva con `booking_id: 'booking-hp-01'` existe en la tabla `bookings`.
*   El estado de la reserva es `status: 'completed'` y `completed_at` tiene un valor de hace 25 horas.
*   Una transacción con `transaction_id: 'txn-hp-01'` asociada a la reserva existe con `gross_amount: 100.00` y `net_amount: 80.00`.
*   El mentor (`mentor-carlos`) tiene una cuenta en `stripe_accounts` con `stripe_account_id: 'acct_VALID'` y `payouts_enabled: true`.
*   No existe ningún registro en `payout_items` para `transaction_id: 'txn-hp-01'`.
*   La API de Stripe está operacional.

---

**Test Steps:**

1.  **Ejecutar** el Supabase Cron Job `payout-processor`.
2.  **Verificar** que se realiza una llamada a la API de Stripe `Transfer.create`.
3.  **Inspeccionar** las tablas `payouts` y `payout_items` en la base de datos.
4.  **Revisar** el servicio de email de prueba para el email del mentor.

---

**Expected Result:**

*   **API Call (Stripe):** Se realiza una llamada `POST /v1/transfers` con:
    *   `amount: 8000`
    *   `currency: 'usd'`
    *   `destination: 'acct_VALID'`
    *   `metadata: { booking_id: 'booking-hp-01' }`
*   **Database:**
    *   Tabla `payouts`: Se crea un nuevo registro con `status: 'pending'`, `amount: 80.00`, y el `stripe_payout_id` devuelto por Stripe.
    *   Tabla `payout_items`: Se crea un nuevo registro vinculando el `payout_id` con `transaction_id: 'txn-hp-01'`.
*   **Email:** Se envía un email a `mentor-carlos@example.com` informando que su pago de $80.00 ha sido iniciado.

---

#### **TC-002: Falla en el pago debido a cuenta de Stripe restringida**

**Related Scenario:** Scenario 2 (Refined AC)
**Type:** Negative
**Priority:** High
**Test Level:** Integration

---

**Preconditions:**

*   Una reserva elegible (`booking-fail-01`) existe, completada hace 26 horas.
*   El mentor asociado tiene una cuenta en `stripe_accounts` con `payouts_enabled: false`.

---

**Test Steps:**

1.  **Ejecutar** el Supabase Cron Job `payout-processor`.
2.  **Verificar** que NO se realiza ninguna llamada a la API de Stripe `Transfer.create`.
3.  **Inspeccionar** la tabla `failed_payouts` (o mecanismo de logging de errores).
4.  **Revisar** el servicio de email de prueba para el email del mentor.
5.  **Inspeccionar** las tablas `payouts` y `payout_items`.

---

**Expected Result:**

*   **API Call (Stripe):** No se realiza ninguna llamada.
*   **Database:**
    *   `failed_payouts`: Se crea un nuevo registro con `booking_id: 'booking-fail-01'` y `reason: 'MENTOR_ACCOUNT_RESTRICTED'`.
    *   `payouts` y `payout_items`: No se crea ningún registro nuevo.
*   **Email:** Se envía un email al mentor notificándole del fallo en el pago.

---

#### **TC-003: El cron job ignora una sesión ya pagada (Idempotencia)**

**Related Scenario:** Scenario 3 (Refined AC)
**Type:** Boundary
**Priority:** Critical
**Test Level:** Integration

---

**Preconditions:**

*   Una reserva (`booking-paid-01`) fue completada y pagada en un ciclo anterior.
*   Existe un registro en `payout_items` para la transacción de `booking-paid-01`.

---

**Test Steps:**

1.  **Ejecutar** el Supabase Cron Job `payout-processor`.
2.  **Verificar** los logs de la ejecución del job.
3.  **Verificar** que NO se realiza ninguna llamada a la API de Stripe `Transfer.create`.

---

**Expected Result:**

*   **Logs:** El job registra un mensaje como "0 sesiones elegibles para pago encontradas."
*   **API Call (Stripe):** No se realiza ninguna llamada.
*   **Database:** No hay cambios en las tablas `payouts` ni `payout_items`.

---

#### **TC-004: Falla en la llamada a la API de Stripe**

**Related Scenario:** Implícito en el manejo de errores robusto.
**Type:** Negative
**Priority:** High
**Test Level:** Integration

---

**Preconditions:**

*   Una reserva elegible (`booking-api-fail-01`) existe.
*   El mentor tiene una cuenta válida.
*   La API de Stripe está mockeada para devolver un error `500 Internal Server Error`.

---

**Test Steps:**

1.  **Ejecutar** el Supabase Cron Job `payout-processor`.
2.  **Verificar** los logs de la ejecución y la tabla `failed_payouts`.

---

**Expected Result:**

*   **Database:** Se crea un registro en `failed_payouts` con `reason: 'STRIPE_API_ERROR'` y detalles del error.
*   **Logs:** El error de la API de Stripe es capturado y logueado.
*   **Comportamiento:** La sesión `booking-api-fail-01` NO se marca como pagada y será reintentada en el próximo ciclo de ejecución del job.
