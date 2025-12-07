# Test Cases: STORY-MYM-12 - Email Notification on Application Status

**Story:** MYM-12
**Epic:** MYM-8 - Mentor Vetting & Onboarding
**Analysis Date:** 2025-11-19
**QA Engineer:** Gemini AI (Shift-Left)
**Status:** Refined by QA (Shift-Left)

---

## Test Case Summary

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| TC-012-001 | Approval email is sent correctly | Positive | Critical |
| TC-012-002 | Rejection email is sent correctly | Positive | Critical |
| TC-012-003 | No email for irrelevant profile updates | Negative | High |
| TC-012-004 | Retry logic on email service failure | Edge Case | High |
| TC-012-005 | Trigger ignores non-relevant status changes | Negative | Medium |

---

## Critical Analysis

### Business Context

**User Persona Affected:**
- **Primary:** Carlos, el Arquitecto Senior. Despues de enviar su aplicacion, la notificacion por correo electronico es el principal punto de contacto que define su percepcion inicial de la plataforma. Una comunicacion clara y oportuna es crucial para mantenerlo comprometido.

**Business Value:**
- **Value Proposition:** Refuerza la promesa de un "canal de confianza" al proporcionar una comunicacion profesional y transparente.
- **Business Impact:** Reduce la ansiedad del mentor y la carga del equipo de soporte al disminuir las consultas sobre el estado de la aplicacion. Una buena experiencia de notificacion mejora la tasa de retencion de mentores.

### Technical Context

**Architecture Components:**
- **Services:** Supabase Database Function (Trigger en la tabla `profiles`), Supabase Edge Function (para la logica de envio de correo).
- **Database:** La tabla `profiles` sera monitoreada en busca de cambios en la columna `vetting_status`.

**External Services:**
- **Servicio de Email:** Un servicio transaccional como Resend sera invocado por la Edge Function.

**Integration Points:**
- **Database Trigger -> Edge Function:** El cambio en la base de datos debe invocar correctamente la Edge Function con la informacion necesaria (ID del mentor, nuevo estado, email del mentor).
- **Edge Function -> Email Service:** La Edge Function debe formatear y enviar la solicitud a la API del servicio de correo electronico correctamente.

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**
- **Business logic complexity:** Low (la logica es un simple if/else basado en el estado 'approved'/'rejected').
- **Integration complexity:** High (involucra un trigger de base de datos, una funcion serverless y una API externa de correo).
- **Data validation complexity:** Low.
- **UI complexity:** N/A (backend-only story).

---

## Detailed Test Cases

### TC-012-001: Approval email is sent correctly (Happy Path)

**Type:** Positive
**Priority:** Critical
**Test Level:** E2E / Integration

**Preconditions:**
- Un perfil de mentor existe en la DB con `vetting_status = 'pending'`
- El servicio de mock de correo (Mailtrap/Inbucket) esta configurado para interceptar envios

**Steps:**
1. Actualizar el `vetting_status` del mentor a `'approved'` en la base de datos de Supabase
2. Observar los logs de la Supabase Edge Function para confirmar su invocacion
3. Verificar la bandeja de entrada del servicio de mock de correo

**Expected Results:**
- El trigger de base de datos en la tabla `profiles` se activa
- La Supabase Edge Function `handle-vetting-notification` es invocada con el payload del perfil actualizado
- Se recibe un correo electronico dirigido al email del mentor
- El asunto del correo contiene texto de felicitacion/aprobacion
- El cuerpo del correo menciona el nombre del mentor y los proximos pasos

**Test Data:**
```json
{
  "mentorId": "test-mentor-id",
  "email": "carlos@example.com",
  "name": "Carlos Mendoza",
  "vetting_status": "approved"
}
```

---

### TC-012-002: Rejection email is sent correctly

**Type:** Positive
**Priority:** Critical
**Test Level:** E2E / Integration

**Preconditions:**
- Un perfil de mentor existe en la DB con `vetting_status = 'pending'`
- El servicio de mock de correo esta configurado

**Steps:**
1. Actualizar el `vetting_status` del mentor a `'rejected'` y llenar el campo `rejection_reason`
2. Observar los logs de la Supabase Edge Function
3. Verificar la bandeja de entrada del servicio de mock de correo

**Expected Results:**
- El trigger de base de datos en la tabla `profiles` se activa
- La Supabase Edge Function es invocada
- Se recibe un correo electronico en la bandeja de mock
- El asunto del correo indica el rechazo de manera profesional
- El cuerpo del correo contiene un mensaje de rechazo educado, menciona el nombre del mentor

**Test Data:**
```json
{
  "mentorId": "test-mentor-id",
  "email": "laura@example.com",
  "name": "Laura Garcia",
  "vetting_status": "rejected",
  "rejection_reason": "Experiencia no verificable en LinkedIn"
}
```

---

### TC-012-003: No email for irrelevant profile updates

**Type:** Negative
**Priority:** High
**Test Level:** Integration

**Preconditions:**
- Un perfil de mentor existe en la DB con `vetting_status = 'pending'`

**Steps:**
1. Actualizar el campo `bio` del perfil del mentor, sin modificar `vetting_status`
2. Monitorear los logs de la Edge Function `handle-vetting-notification`

**Expected Results:**
- La Edge Function NO es invocada
- No se envia ningun correo electronico
- El trigger solo se activa cuando cambia `vetting_status` a 'approved' o 'rejected'

**Notes:**
- Esto valida que el trigger tiene la condicion correcta en `OLD.vetting_status IS DISTINCT FROM NEW.vetting_status`

---

### TC-012-004: Retry logic on email service failure

**Type:** Edge Case (Error Handling)
**Priority:** High
**Test Level:** Integration

**Preconditions:**
- El servicio de mock de correo esta configurado para responder con un error 500

**Steps:**
1. Actualizar el `vetting_status` de un mentor a `'approved'`
2. Observar los logs de la Edge Function

**Expected Results:**
- El log muestra el intento de envio inicial y el error 500
- El log muestra al menos un reintento despues de un intervalo de tiempo
- El estado `vetting_status` en la base de datos permanece como `'approved'` (el fallo del email no revierte la aprobacion)
- El error se registra para monitoreo

**Notes:**
- El sistema deberia tener tolerancia a fallos del servicio de email
- Considerar implementar cola de reintentos o notificacion in-app como fallback

---

### TC-012-005: Trigger ignores non-relevant status changes

**Type:** Negative
**Priority:** Medium
**Test Level:** Integration

**Preconditions:**
- Un perfil de mentor existe en la DB con `vetting_status = 'pending'`

**Steps:**
1. Actualizar el `vetting_status` a `'under_review'` (u otro valor que no sea 'approved'/'rejected')
2. Observar los logs de la Edge Function

**Expected Results:**
- La Edge Function `handle-vetting-notification` NO es invocada
- No se envia ningun correo electronico
- Solo los estados finales ('approved', 'rejected') disparan notificaciones

---

## Refined Acceptance Criteria

### Scenario 1: Mentor application is approved (Happy Path)

- **Given:** Un perfil de mentor con `vetting_status` de 'pending'
- **When:** Un admin actualiza el `vetting_status` a 'approved'
- **Then:**
  - Un trigger de base de datos en la tabla `profiles` se activa
  - La Supabase Edge Function `handle-vetting-notification` es invocada
  - La Edge Function envia un correo electronico al mentor
  - El correo contiene mensaje de felicitacion y proximos pasos

### Scenario 2: Mentor application is rejected (Happy Path)

- **Given:** Un perfil de mentor con `vetting_status` de 'pending'
- **When:** Un admin actualiza el `vetting_status` a 'rejected'
- **Then:**
  - El trigger de base de datos se activa
  - La Edge Function envia un correo de rechazo educado
  - El correo incluye el nombre del mentor

### Scenario 3: No email on irrelevant status change (Negative)

- **Given:** Un perfil de mentor con `vetting_status` de 'pending'
- **When:** Un admin actualiza un campo diferente (bio, hourly_rate) sin cambiar `vetting_status`
- **Then:**
  - El trigger para notificaciones NO se activa
  - No se envia ningun correo electronico

---

## Technical Implementation Notes

### Database Trigger
```sql
CREATE OR REPLACE FUNCTION notify_vetting_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vetting_status IS DISTINCT FROM OLD.vetting_status
     AND NEW.vetting_status IN ('approved', 'rejected') THEN
    -- Invoke Edge Function via pg_net or supabase_functions.invoke
    PERFORM net.http_post(
      url := 'https://<project>.supabase.co/functions/v1/handle-vetting-notification',
      body := json_build_object(
        'mentor_id', NEW.id,
        'email', NEW.email,
        'name', NEW.full_name,
        'status', NEW.vetting_status
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Edge Function Contract

**Endpoint:** `POST /functions/v1/handle-vetting-notification`

**Request Body:**
```typescript
{
  mentor_id: string
  email: string
  name: string
  status: 'approved' | 'rejected'
}
```

**Response Codes:**
| Code | Description |
|------|-------------|
| 200 | Email sent successfully |
| 400 | Invalid request body |
| 500 | Email service error (will retry) |

---

## Coverage Matrix

| Acceptance Criteria | Test Cases |
|---------------------|------------|
| Email sent on approval | TC-012-001 |
| Email sent on rejection | TC-012-002 |
| Email personalized with mentor name | TC-012-001, TC-012-002 |
| No email for other updates | TC-012-003 |
| Error handling for email failures | TC-012-004 |
| Only final statuses trigger email | TC-012-005 |

---

## Open Questions / Gaps

### Gap 1: Email Content Templates (BLOCKER)

**Type:** Business Rule / Content
**Why Critical:** Es imposible verificar que la funcionalidad es correcta sin el contenido exacto que se debe enviar.
**Suggested Resolution:** Definir templates de email para aprobacion y rechazo antes de implementacion.

### Question 1: What happens if mentor's email bounces?

**Status:** Pending PO clarification
**Impact:** Define escenarios de prueba negativos adicionales

### Question 2: Is there a fallback notification method?

**Status:** Pending PO clarification
**Impact:** Si hay fallback (notificacion in-app), se necesitan pruebas adicionales

---

## Related Stories

- **MYM-11:** Approve/Reject Application - triggers the status change that fires this notification
- **MYM-9:** View Pending Applications - admin workflow context
- **MYM-10:** Review Application Details - admin workflow context

---

**Source:** Jira comment on MYM-12 (2025-11-19)
**Synced to repo:** 2025-12-06
