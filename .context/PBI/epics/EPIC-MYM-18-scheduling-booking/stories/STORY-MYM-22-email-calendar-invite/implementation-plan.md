# Implementation Plan: STORY-MYM-22 - Email Confirmation and Calendar Invite

**Fecha:** 2025-11-27
**Developer:** Gemini AI
**Story Jira Key:** MYM-22
**Epic:** EPIC-MYM-18 - Scheduling & Booking
**Status:** Draft

---

## 🎯 Objetivo

Implementar la funcionalidad de envío de emails de confirmación y adjuntar un archivo `.ics` (invitación de calendario) para las sesiones de mentoría agendadas, garantizando la correcta gestión de zonas horarias, la resiliencia ante fallos del servicio de email y la validación de la información enviada a mentores y aprendices.

---

## 💡 Estrategia de Implementación

La implementación se centrará en el backend, específicamente en un servicio o función que se activará tras la confirmación exitosa de un pago por una sesión. Se priorizará la robustez, la correcta manipulación de fechas/horas y la adherencia a los estándares para archivos `.ics`.

---

## 🛠️ Tareas Técnicas Detalladas

### Fase 1: Configuración y Preparación

1.  **Configurar Variables de Entorno:**
    *   Asegurar que las credenciales y la URL del servicio de email (e.g., Resend) estén disponibles y configuradas de forma segura en las variables de entorno (`.env`).
    *   Definir el email del remitente: `FROM_EMAIL: "confirmations@upexmymentor.com"` y `FROM_NAME: "Upex My Mentor"`.

2.  **Instalar Librerías Necesarias:**
    *   `date-fns-tz`: Para el manejo preciso de zonas horarias.
    *   `ical-generator` o similar: Para la creación programática de archivos `.ics`.
    *   Cliente para el servicio de email (e.g., Resend SDK).

### Fase 2: Implementación del Servicio de Notificación (Backend - Supabase Edge Function)

1.  **Crear o Extender el Servicio de Confirmación de Booking:**
    *   Desarrollar una nueva Edge Function o extender una existente que se active mediante un webhook o una llamada interna después de que el estado de una booking cambie a `confirmed`.

2.  **Obtener Datos de la Sesión y Usuarios:**
    *   Consultar la tabla `bookings` para obtener los detalles de la sesión (`session_datetime`, `duration_minutes`, `mentor_id`, `mentee_id`).
    *   Consultar la tabla `users` (o `mentors`/`students`) para obtener los emails, nombres y zonas horarias (`timezone`) del mentor y del aprendiz.

3.  **Generar Contenido del Email:**
    *   **Remitente:** Utilizar `FROM_NAME` y `FROM_EMAIL` definidos en la configuración.
    *   **Asunto (Mentee):** `"Your session with [Mentor Name] is confirmed!"`
    *   **Asunto (Mentor):** `"Your session with [Mentee Name] is confirmed!"`
    *   **Cuerpo del Email (Ejemplo de Plantilla Markdown):**
        ```markdown
        Subject: Your session with [Mentor Name] is confirmed!

        Hi [User Name],

        Great news! Your 60-minute session with **[Mentor Name]** is confirmed.

        **When:** [Day], [Date] at [Time] ([User's Local Timezone])
        **Link:** [Link to Video Call]

        We've attached a calendar invite to this email.
        ```
    *   Asegurar que las fechas y horas en el cuerpo del email se muestren en la zona horaria *local* del recipiente, utilizando `date-fns-tz` para las conversiones.
    *   Incluir el enlace de la videollamada de la sesión.

4.  **Generar Archivo `.ics` (Invitación de Calendario):**
    *   Utilizar `ical-generator` para crear el archivo `.ics`.
    *   **Campos Clave a Incluir:**
        *   `SUMMARY`: "Mentorship Session with [Mentor/Mentee Name]" (adaptado para cada recipiente).
        *   `DESCRIPTION`: Detalles de la sesión, enlace a la plataforma, enlace de la videollamada.
        *   `ORGANIZER`: `FROM_EMAIL` de la plataforma.
        *   `ATTENDEE`: Email del mentor y del aprendiz.
        *   `DTSTART` y `DTEND`: Convertir la `session_datetime` a la zona horaria del participante y establecer las duraciones. **CRÍTICO:** Asegurarse de que `ical-generator` maneje correctamente los `TZID` para soportar DST.
        *   `VTIMEZONE`: Incluir el componente `VTIMEZONE` para las zonas horarias relevantes (`America/Los_Angeles`, `America/New_York`, etc.) para una correcta visualización de DST.

5.  **Enviar Email con Archivo `.ics` Adjunto:**
    *   Utilizar el cliente del servicio de email para enviar el email.
    *   Adjuntar el archivo `.ics` generado con el nombre `session.ics`.

6.  **Implementar Lógica de Reintentos (Retry Logic):**
    *   Si el servicio de email devuelve un error (e.g., `5xx`), reintentar el envío del email 3 veces con un backoff exponencial: 1 minuto, 5 minutos, 15 minutos.
    *   Registrar (`log`) los intentos fallidos.
    *   Si después de 3 reintentos el email sigue sin enviarse, registrar un error crítico y detener los reintentos para esa booking. El campo `confirmation_sent_at` permanecerá `NULL` en estos casos.

7.  **Actualizar Base de Datos:**
    *   Tras un envío exitoso del email, actualizar el campo `confirmation_sent_at` en la tabla `bookings` con el timestamp actual.

### Fase 3: Pruebas y Validación

1.  **Unit Tests:**
    *   Asegurar la correcta generación de `.ics` para diferentes zonas horarias y escenarios de DST (TC-005).
    *   Probar la lógica de formateo de fechas en el email.
    *   Verificar la lógica de reintentos del email service (mocking el servicio de email).

2.  **Integration Tests:**
    *   Verificar que el webhook de pago activa correctamente el servicio de notificación (INT-TC-001).
    *   Asegurar que el servicio de notificación obtiene los datos correctos de la DB (INT-TC-002).
    *   Probar la interacción completa con el servicio de email simulando fallos temporales (TC-003, TC-004).

3.  **End-to-End Tests (E2E):**
    *   Simular un flujo completo de reserva y pago.
    *   Verificar que el mentee recibe el email y el `.ics` correcto (TC-001).
    *   Verificar que el mentor recibe el email y el `.ics` correcto (TC-002).
    *   Validar la visualización del evento en diferentes clientes de calendario (Google Calendar, Outlook, Apple Calendar) - **Parametrized Test Group 2 (manual checklist)**.

4.  **Endpoint de Test (Para QA):**
    *   Crear un endpoint interno de solo testing (e.g., `POST /api/testing/trigger-confirmation-email/{bookingId}`) que permita a QA activar la funcionalidad de envío de emails de confirmación bajo demanda, sin necesidad de completar el flujo de pago. Esto facilitará la depuración y reejecución de pruebas.

---

## ⚠️ Consideraciones Adicionales

*   **Zonas Horarias:** La gestión de zonas horarias es el punto más crítico. Se debe asegurar que todas las conversiones (`session_datetime` UTC -> local para email, `session_datetime` UTC -> con `TZID` para `.ics`) sean precisas.
*   **Contenido del `.ics`:** Asegurar la compatibilidad con RFC 5545 y los principales clientes de calendario.
*   **Reminders:** Los emails de recordatorio (`24h antes`, `1h antes`) serán gestionados en una historia de usuario separada (`STORY-MYM-XX: Session Reminder Emails`). Esta historia solo se enfoca en la confirmación post-booking.
*   **Bounce Handling:** Para una versión futura, se podría implementar la integración con webhooks del servicio de email para manejar rebotes (bounce-backs) y actualizar el estado de email de los usuarios. Por ahora, el logging de errores es suficiente.

---

## ✅ Criterios de Aceptación (Resumidos)

*   El sistema envía un email de confirmación con `.ics` adjunto a mentee y mentor tras una booking exitosa.
*   Los emails y `.ics` muestran la hora de la sesión correctamente en la zona horaria local de cada participante, incluyendo manejo de DST.
*   El sistema reintenta el envío del email 3 veces con backoff exponencial en caso de fallo temporal del servicio de email.
*   El campo `confirmation_sent_at` en `bookings` se actualiza solo tras el envío exitoso.
*   Se registran los fallos de envío de emails.
*   El email del remitente es `"Upex My Mentor" <confirmations@upexmymentor.com>`.
*   Los asuntos del email son `"Your session with [Mentor Name] is confirmed!"` (mentee) y `"Your session with [Mentee Name] is confirmed!"` (mentor).
*   El evento de calendario en el `.ics` se titula `"Mentorship Session with [Mentor/Mentee Name]"` y contiene el enlace de la videollamada.

---
