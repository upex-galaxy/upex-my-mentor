# STORY-MYM-11: Approve or Reject Mentor Application

**Jira Key:** MYM-11
**Epic:** MYM-8 - Mentor Vetting & Onboarding
**Status:** Estimation
**Priority:** Medium

---

## User Story

As an Admin, I want to approve or reject a mentor application so that I can maintain the quality of the marketplace

---

## Description

After reviewing a mentor's application, the administrator must have the ability to either approve or reject it. This action is the core of the vetting process.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Admin approves an application

* **Given:** An administrator is reviewing a mentor's application.
* **When:** They click the "Approve" button.
* **Then:** The mentor's `vetting_status` in the `profiles` table is updated to 'approved'.
* **And:** The mentor is removed from the 'pending' list.

### Scenario 2: Admin rejects an application

* **Given:** An administrator is reviewing a mentor's application.
* **When:** They click the "Reject" button.
* **Then:** The mentor's `vetting_status` in the `profiles` table is updated to 'rejected'.
* **And:** The mentor is removed from the 'pending' list.

---

## 🧪 QA Refinements (Shift-Left Analysis)

**Analysis Date:** 2025-11-11
**Status:** Refined by QA

### Refined Acceptance Criteria

#### Scenario 1: Admin aprueba una solicitud de mentor pendiente (Happy Path)

**Tipo:** Positivo, **Prioridad:** Crítica

* **Dado:** Un usuario con rol `admin` está autenticado.
    * Y existe un perfil de mentor con `user_id` "carlos-123" y `vetting_status` es `'pending'`.
* **Cuando:** El admin envía una petición `PUT` a `/api/admin/applications/carlos-123/status` con el body `{"action": "approve"}`.
* **Entonces:** La API responde con un status `200 OK`.
    * Y el `vetting_status` del perfil "carlos-123" en la tabla `mentor_profiles` es `'approved'`.
    * Y se crea un nuevo registro en la tabla `application_audit_log` con `mentor_profile_id`="carlos-123", `action`="approved" y el `admin_id` correcto.
    * Y se dispara un evento para enviar un email de "aprobación" al mentor (ver `MYM-12`).

#### Scenario 2: Admin rechaza una solicitud de mentor pendiente

**Tipo:** Positivo, **Prioridad:** Crítica

* **Dado:** Un usuario con rol `admin` está autenticado.
    * Y existe un perfil de mentor con `user_id` "laura-456" y `vetting_status` es `'pending'`.
* **Cuando:** El admin envía una petición `PUT` a `/api/admin/applications/laura-456/status` con el body `{"action": "reject", "reason": "Perfil de LinkedIn incompleto"}`.
* **Entonces:** La API responde con un status `200 OK`.
    * Y el `vetting_status` del perfil "laura-456" en la tabla `mentor_profiles` es `'rejected'`.
    * Y el campo `rejection_reason` se actualiza con "Perfil de LinkedIn incompleto".
    * Y se crea un nuevo registro en el `application_audit_log` con `action`="rejected".
    * Y se dispara un evento para enviar un email de "rechazo" al mentor (ver `MYM-12`).

#### Scenario 3: Usuario no-admin intenta aprobar una solicitud

**Tipo:** Negativo (Seguridad), **Prioridad:** Crítica

* **Dado:** Un usuario con rol `student` o `mentor` está autenticado.
    * Y existe un perfil de mentor con `vetting_status` es `'pending'`.
* **Cuando:** El usuario envía una petición `PUT` a `/api/admin/applications/carlos-123/status` con el body `{"action": "approve"}`.
* **Entonces:** La API responde con un status `403 Forbidden`.
    * Y el `vetting_status` del perfil "carlos-123" permanece `'pending'`.
    * Y NO se crea ningún registro en el `application_audit_log`.

#### Scenario 4: Admin intenta actuar sobre una solicitud ya procesada (Caso de Borde)

**Tipo:** Negativo (Edge Case), **Prioridad:** Alta

* **Dado:** Un usuario con rol `admin` está autenticado.
    * Y existe un perfil de mentor con `user_id` "carlos-123" y `vetting_status` es `'approved'`.
* **Cuando:** El admin envía una petición `PUT` a `/api/admin/applications/carlos-123/status` con el body `{"action": "reject"}`.
* **Entonces:** La API responde con un status `409 Conflict` y un mensaje de error "La solicitud ya ha sido procesada".
    * Y el `vetting_status` del perfil "carlos-123" permanece `'approved'`.

### Edge Cases Identified

* **Simultaneidad:** ¿Qué pasa si dos admins actúan sobre la misma solicitud simultáneamente? Se necesita definir el comportamiento (ej. último gana).
* **Estado no pendiente:** ¿Qué pasa si se intenta aprobar/rechazar una solicitud que ya no está en estado 'pending'? La API debería devolver un error.
* **Perfil eliminado:** ¿Qué pasa si el perfil del mentor se elimina mientras la solicitud está pendiente? La API debería devolver un error 404.

---

## Technical Notes

* The admin interface will have "Approve" and "Reject" buttons.
* These buttons will trigger a call to a secure Supabase Edge Function or a backend endpoint.
* The function will update the `vetting_status` for the given `mentor_id`.
* This action should also trigger the notification email (covered in MYM-12).

---

## Definition of Done

* [ ] Code implemented for the approve/reject functionality.
* [ ] Unit tests for the status change logic achieve > 80% coverage.
* [ ] Integration tests verify the database update and RLS policies.
* [ ] E2E tests (Playwright) cover an admin approving and rejecting an application.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/STORY-MYM-11-approve-reject-application/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/STORY-MYM-11-approve-reject-application/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-11
