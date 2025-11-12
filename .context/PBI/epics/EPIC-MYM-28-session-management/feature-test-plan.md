
# Feature Test Plan: EPIC-MYM-28 - Session Management

**Fecha:** 2025-11-11
**QA Lead:** AI-Generated
**Epic Jira Key:** MYM-28
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

Esta épica es fundamental para la propuesta de valor de la plataforma, ya que se centra en la experiencia post-reserva del usuario. Proporciona las herramientas para que tanto mentores como estudiantes gestionen el ciclo de vida completo de una sesión, desde la confirmación hasta la finalización. Un manejo de sesiones fluido y sin fricciones es clave para la retención de usuarios y para fomentar la confianza en la plataforma.

**Key Value Proposition:**
- **Flexibilidad y Elección:** Permite a los usuarios gestionar sus compromisos, con políticas de cancelación claras que generan confianza.
- **Acceso a Expertise Verificado:** Facilita el punto de encuentro final (la videollamada), materializando el valor de la conexión.

**Success Metrics (KPIs):**
- **Engagement:** Impacta directamente en la "Tasa de Retención de Mentores" y las "Sesiones de Mentoría Completadas".
- **Negocio:** Un buen sistema de gestión de sesiones reduce la carga de soporte y fomenta la repetición de reservas, impactando indirectamente el "Volumen Bruto de Transacciones (GMV)".

**User Impact:**
- **Laura, la Desarrolladora Junior:** Necesita un lugar centralizado para ver sus próximas sesiones, acceder a ellas fácilmente y cancelarlas si sus planes cambian.
- **Carlos, el Arquitecto Senior:** Requiere una vista clara de sus sesiones programadas para gestionar su tiempo y un sistema confiable para la cancelación y la gestión de su disponibilidad.

**Critical User Journeys:**
- **Post-Booking Management:** Esta épica es el núcleo de este viaje del usuario.
- **Estudiante Deja Valoración y Mentor Recibe Pago:** La finalización de una sesión es el disparador para este viaje.

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**
- **Componentes a crear/modificar:** `SessionDashboard`, `UpcomingSessionsTab`, `PastSessionsTab`, `SessionCard`, `JoinCallButton`, `CancelSessionModal`, `LoadingSpinner`, `EmptyState`.
- **Páginas/rutas afectadas:** `/dashboard/sessions` (ruta autenticada).

**Backend:**
- **APIs a crear/modificar:**
    - `GET /api/bookings?status=upcoming|past`: Para alimentar el dashboard.
    - `GET /api/bookings/{bookingId}/videocall-link`: Para obtener el enlace de la videollamada.
    - `POST /api/bookings/{bookingId}/cancel`: Nueva API para procesar cancelaciones.
- **Servicios de negocio afectados:** `BookingService`, `NotificationService`, `PaymentService` (para reembolsos).

**Database:**
- **Tablas involucradas:** `BOOKINGS` (actualizar `status`, `videocall_url`, `cancelled_at`), `TRANSACTIONS` (crear registros de reembolso).
- **Queries críticos:** Consultas para obtener sesiones de un usuario, filtrando por fecha para separar pasadas y futuras, y considerando la zona horaria.

**External Services:**
- **Servicio de Videoconferencia (Daily.co):** Para generar y gestionar los enlaces de las videollamadas.
- **Pasarela de Pagos (Stripe):** Para procesar los reembolsos de las cancelaciones.
- **Servicio de Email (SendGrid/Resend):** Para enviar notificaciones de cancelación.

### Integration Points (Critical for Testing)

**Internal Integration Points:**
- **Frontend ↔ Backend API:** El dashboard depende de `GET /api/bookings`. La cancelación depende de `POST /api/bookings/{id}/cancel`.
- **Backend ↔ Database:** El backend debe actualizar el estado de `BOOKINGS` y crear `TRANSACTIONS` de forma atómica.

**External Integration Points:**
- **Backend ↔ Servicio de Videoconferencia:** La generación y recuperación del `videocall_url` es un punto crítico de falla.
- **Backend ↔ Stripe:** El procesamiento de reembolsos al cancelar es una transacción financiera crítica.
- **Backend ↔ Servicio de Email:** La notificación fiable de cancelaciones es clave para la experiencia del usuario.

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Manejo incorrecto de Zonas Horarias
- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend, Frontend
- **Mitigation Strategy:**
    - Todas las fechas deben almacenarse en UTC en la base de datos.
    - El frontend es responsable de mostrar las fechas en la zona horaria local del usuario.
    - La lógica de negocio (ej. regla de 24h para cancelación) debe realizarse en el backend usando UTC para evitar inconsistencias.
- **Test Coverage Required:** Casos de prueba con usuarios en diferentes zonas horarias reservando sesiones y cancelando cerca del límite de 24h.

#### Risk 2: Falla en la Integración con la API de Reembolsos (Stripe)
- **Impact:** High
- **Likelihood:** Low
- **Area Affected:** Backend, Integration
- **Mitigation Strategy (DECIDED):**
    - Implementar un mecanismo de reintentos con backoff exponencial para fallas transitorias.
    - En caso de falla persistente, la sesión se moverá a un estado `pending_manual_refund`.
    - El sistema enviará una alerta de alta prioridad a un administrador para que procese el reembolso manualmente.
    - Se notificará al usuario que la sesión fue cancelada y que el reembolso se está procesando manualmente.
- **Test Coverage Required:** Pruebas de integración que simulen un fallo en la API de Stripe y verifiquen que: 1) el estado de la reserva cambia a `pending_manual_refund`, 2) se genera una alerta para el administrador, y 3) se notifica correctamente al usuario.

### Business Risks

#### Risk 1: Experiencia de usuario confusa en el Dashboard
- **Impact on Business:** Puede llevar a que los usuarios no encuentren sus sesiones, generando tickets de soporte y frustración.
- **Impact on Users:** Laura podría perder una sesión importante si no la ve claramente en su dashboard.
- **Likelihood:** Medium
- **Mitigation Strategy:**
    - Realizar pruebas de usabilidad con los diseños del dashboard.
    - Asegurar que los estados (próxima, pasada, cancelada) sean visualmente distintos.
    - Incluir un estado vacío claro con un llamado a la acción para nuevos usuarios.
- **Acceptance Criteria Validation:** Los Criterios de Aceptación de MYM-29 deben cubrir explícitamente la claridad de la interfaz.

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1 (MYM-29): Paginación del Dashboard**
- **Found in:** STORY-MYM-29
- **Question for PO:** La historia no define el comportamiento cuando un usuario tiene una gran cantidad de sesiones (ej. >20). ¿Implementamos paginación, scroll infinito o simplemente mostramos las N más recientes/próximas?
- **Impact if not clarified:** Puede causar problemas de rendimiento en el frontend y una mala experiencia para usuarios muy activos.

**Ambiguity 2 (MYM-30): Acceso anticipado al enlace de la videollamada**
- **Found in:** STORY-MYM-30
- **Question for Dev/PO:** La historia indica que el botón "Join Call" se activa 15 minutos antes. ¿Qué sucede si un usuario tiene el enlace de alguna otra manera y trata de unirse antes? ¿La sala de video debe estar bloqueada? ¿Mostramos un mensaje específico en la UI si intentan acceder al enlace antes de tiempo?
- **Impact if not clarified:** Puede generar confusión si los usuarios acceden a una sala vacía o si el comportamiento no es consistente.

**Ambiguity 3 (MYM-31): Lógica de reembolso en caso de falla - RESOLVED**
- **Found in:** STORY-MYM-31
- **Decision:** Se ha decidido implementar la **Opción B (Estado Intermedio con Intervención Manual)**. Si el reembolso automático falla, la sesión pasará al estado `pending_manual_refund`, y se alertará a un administrador para su procesamiento manual. El usuario será notificado de esta situación.
- **Impact:** Esta decisión desbloquea la implementación y las pruebas detalladas para el escenario de fallo de reembolso.

### Suggested Improvements (Before Implementation)

**Improvement 1: Unificar el estado de la sesión**
- **Story Affected:** MYM-29, MYM-31
- **Current State:** Las historias describen estados como "upcoming", "past", "cancelled".
- **Suggested Change:** Formalizar una máquina de estados para las reservas (`provisional` -> `confirmed` -> `in_progress` -> `completed` | `cancelled`) en la documentación de arquitectura. Esto asegura que toda la lógica (dashboard, cancelaciones) se base en la misma fuente de verdad.
- **Benefit:** Reduce la ambigüedad y previene bugs derivados de estados inconsistentes.

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**
- Funcionalidad completa del dashboard de sesiones (vista de próximas/pasadas).
- Lógica de activación y acceso al enlace de la videollamada.
- Flujo completo de cancelación de sesión, incluyendo la regla de 24 horas.
- Integración con el servicio de video para la generación/obtención de enlaces.
- Integración con Stripe para el procesamiento de reembolsos.
- Notificaciones por email para cancelaciones.
- Validación de permisos (solo los participantes pueden ver/gestionar la sesión).

**Out of Scope (For This Epic):**
- La implementación de la videollamada en sí (se asume un servicio externo).
- Disputas sobre la calidad de la sesión.
- Reprogramación de sesiones (solo se contempla cancelación).

---

### Test Levels

#### Unit Testing
- **Coverage Goal:** > 80%
- **Focus Areas:**
    - Lógica de negocio para la regla de cancelación de 24 horas.
    - Funciones de utilidad para el manejo de zonas horarias.
    - Componentes de React para el dashboard (renderizado condicional, etc.).

#### Integration Testing
- **Coverage Goal:** Todos los integration points identificados.
- **Focus Areas:**
    - **Backend ↔ Stripe:** Simular llamadas a la API de Stripe para reembolsos (éxito y fracaso).
    - **Backend ↔ Servicio de Video:** Simular la obtención de enlaces de video.
    - **Backend ↔ DB:** Verificar que las transacciones (cancelación + reembolso) sean atómicas.

#### End-to-End (E2E) Testing
- **Coverage Goal:** Los 3 user journeys cubiertos por las historias.
- **Tool:** Playwright
- **Focus Areas:**
    - Un usuario inicia sesión, ve su dashboard, accede a una videollamada.
    - Un usuario inicia sesión, cancela una sesión >24h antes y verifica que desaparece de "próximas".
    - Un usuario inicia sesión e intenta cancelar una sesión <24h antes, verificando que el botón está deshabilitado.

---

## 📊 Test Cases Summary by Story

### STORY-MYM-29: Dashboard de Sesiones
- **Complexity:** Medium
- **Estimated Test Cases:** 8
- **Rationale:** Cubre estados de carga, error, vacío, y la correcta visualización de datos en dos pestañas. Requiere pruebas de UI para diferentes escenarios de datos.

### STORY-MYM-30: Unirse a Videollamada
- **Complexity:** Low
- **Estimated Test Cases:** 5
- **Rationale:** La lógica principal es la visibilidad condicional del botón y la correcta redirección. Las pruebas se centran en la regla de tiempo (15 min antes) y los permisos.

### STORY-MYM-31: Cancelar Sesión
- **Complexity:** High
- **Estimated Test Cases:** 12
- **Rationale:** Implica lógica de negocio crítica (regla de 24h), una transacción financiera (reembolso) y múltiples integraciones (Stripe, Email). Requiere pruebas exhaustivas de happy path, casos de borde y fallos.

---

### Total Estimated Test Cases for Epic
- **Total:** 25

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**
- Usuario (estudiante) con sesiones próximas (>24h), próximas (<24h) y pasadas.
- Usuario (mentor) con sesiones en los mismos estados.
- Usuario nuevo sin ninguna sesión.

**Invalid Data Sets:**
- Intentos de acceso a sesiones por parte de usuarios no participantes.
- Datos de sesión con fechas corruptas o en formatos incorrectos.

**Boundary Data Sets:**
- Sesiones que empiezan en exactamente 24 horas y 1 segundo.
- Sesiones que empiezan en exactamente 23 horas y 59 minutos.
- Sesiones que están ocurriendo en el momento exacto de la consulta.

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)
- [ ] Historia implementada y desplegada en `staging`.
- [ ] Unit tests existen y pasan (>80% coverage).
- [ ] Dev confirma que la funcionalidad básica está operativa.
- [ ] No hay bugs bloqueantes en dependencias.

### Epic Exit Criteria
- [ ] Todas las historias cumplen sus criterios de salida individuales.
- [ ] Pruebas E2E de los 3 flujos principales (ver dashboard, unirse a llamada, cancelar) completadas y pasando.
- [ ] Pruebas de integración con Stripe y Servicio de Video completadas.
- [ ] No hay bugs críticos o altos abiertos relacionados con la épica.
- [ ] QA sign-off aprobado.

---

## 📝 Non-Functional Requirements Validation

### Performance Requirements
- **NFR-P-XXX:** El dashboard de sesiones (`/dashboard/sessions`) debe tener un LCP < 2.5 segundos.
- **Test Approach:** Medir con Lighthouse en el entorno de staging.

### Security Requirements
- **NFR-S-XXX:** Un usuario solo puede acceder a los detalles y enlaces de las sesiones en las que participa.
- **Test Approach:** Crear tests de API y E2E donde un usuario autenticado intenta acceder a `bookingId` de otra persona y verifica que recibe un error 403/404.
