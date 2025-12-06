# Implementation Plan: STORY-MYM-12 - Email Notification on Application Status

**Story:** MYM-12
**Epic:** MYM-8 - Mentor Vetting & Onboarding
**Planning Date:** 2025-12-06
**Status:** Ready for Development

---

## Overview

Implementar notificaciones automaticas por email cuando un admin aprueba o rechaza la aplicacion de un mentor. El sistema debe enviar emails personalizados usando un trigger de base de datos y una Supabase Edge Function.

**Acceptance Criteria a cumplir:**
- Sistema envia email de felicitacion cuando `is_verified` cambia a `true`
- Sistema envia email de rechazo educado cuando admin rechaza aplicacion
- Emails son personalizados con nombre del mentor
- El flujo es asincrono (no bloquea la respuesta de aprobacion/rechazo)

---

## Technical Approach

**Chosen approach:** Database Trigger + Supabase Edge Function + Resend API

**Architecture:**
```
Admin approves/rejects
         │
         ▼
┌─────────────────┐
│ Server Action   │  (MYM-11 - ya implementado)
│ UPDATE profiles │
└────────┬────────┘
         │ triggers
         ▼
┌─────────────────────────┐
│ PostgreSQL Trigger      │
│ notify_mentor_vetting   │
└────────┬────────────────┘
         │ calls via pg_net
         ▼
┌─────────────────────────┐
│ Edge Function           │
│ send-vetting-email      │
└────────┬────────────────┘
         │ sends email via
         ▼
┌─────────────────────────┐
│ Resend API              │
│ Transactional email     │
└─────────────────────────┘
```

**Alternatives considered:**
- **Next.js API Route**: Requeriria llamada sincrona desde server action, bloqueando respuesta
- **Supabase Database Webhook**: Menos control sobre retry logic y payload

**Why this approach:**
- ✅ Completamente asincrono (no bloquea UI)
- ✅ Retry logic integrado en Edge Functions
- ✅ Desacoplado del frontend (puede ser triggereado desde cualquier cliente)
- ✅ Environment variables seguras en Supabase dashboard
- ❌ Trade-off: Requiere deployment separado de Edge Function

---

## Types & Type Safety

**Tipos nuevos requeridos:**

```typescript
// Agregar a src/types/index.ts

// MYM-12: Email Notification Payload
export interface VettingEmailPayload {
  mentor_id: string
  mentor_email: string
  mentor_name: string
  action: 'approved' | 'rejected'
  rejection_reason?: string
}

// Edge Function Response
export interface EmailSendResult {
  success: boolean
  message_id?: string
  error?: string
}
```

**Directiva:**
- ✅ Tipos compartidos entre trigger y Edge Function
- ✅ Payload validado con estructura definida
- ✅ Response tipado para logging

---

## Implementation Steps

### **Step 1: Enable pg_net Extension**

**Task:** Habilitar la extension `pg_net` en Supabase para permitir HTTP requests desde triggers

**Details:**
- pg_net permite hacer llamadas HTTP desde funciones de PostgreSQL
- Requerido para invocar Edge Functions desde triggers
- Se habilita via Supabase dashboard o SQL

**SQL:**
```sql
-- Habilitar extension pg_net (si no esta habilitada)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

**Testing:**
- Verificar que extension esta habilitada: `SELECT * FROM pg_extension WHERE extname = 'pg_net';`

**Notes:**
- Esta extension ya deberia estar disponible en proyectos Supabase
- Usar MCP Supabase para ejecutar

---

### **Step 2: Create Database Trigger Function**

**Task:** Crear funcion PostgreSQL que se ejecuta cuando `is_verified` cambia

**Details:**
- La funcion detecta cambios en `is_verified` de `false` a `true` (approval)
- Detecta cuando se agrega `rejection_reason` (rejection)
- Construye payload con datos del mentor
- Invoca Edge Function via HTTP POST

**SQL Function:**
```sql
CREATE OR REPLACE FUNCTION notify_mentor_vetting_change()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  payload JSONB;
  action_type TEXT;
BEGIN
  -- Determinar tipo de accion
  IF NEW.is_verified = true AND (OLD.is_verified = false OR OLD.is_verified IS NULL) THEN
    action_type := 'approved';
  ELSIF NEW.rejection_reason IS NOT NULL
        AND (OLD.rejection_reason IS NULL OR OLD.rejection_reason != NEW.rejection_reason)
        AND NEW.is_verified = false THEN
    action_type := 'rejected';
  ELSE
    -- No es una accion relevante, salir sin hacer nada
    RETURN NEW;
  END IF;

  -- Solo procesar mentores
  IF NEW.role != 'mentor' THEN
    RETURN NEW;
  END IF;

  -- Construir payload
  payload := jsonb_build_object(
    'mentor_id', NEW.id,
    'mentor_email', NEW.email,
    'mentor_name', COALESCE(NEW.name, 'Mentor'),
    'action', action_type,
    'rejection_reason', NEW.rejection_reason
  );

  -- URL del Edge Function (usando project ref)
  edge_function_url := 'https://ionevzckjyxtpmyenbxc.supabase.co/functions/v1/send-vetting-email';

  -- Invocar Edge Function via pg_net
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Testing:**
- Unit: Verificar que funcion se crea sin errores
- Integration: Actualizar `is_verified` y verificar logs de pg_net

---

### **Step 3: Create Database Trigger**

**Task:** Crear trigger que ejecuta la funcion en UPDATE de profiles

**Details:**
- Trigger se ejecuta AFTER UPDATE en tabla profiles
- Solo se ejecuta cuando cambian las columnas relevantes
- Usa condicion WHEN para filtrar updates irrelevantes

**SQL Trigger:**
```sql
DROP TRIGGER IF EXISTS on_mentor_vetting_change ON profiles;

CREATE TRIGGER on_mentor_vetting_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (
    OLD.is_verified IS DISTINCT FROM NEW.is_verified
    OR OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason
  )
  EXECUTE FUNCTION notify_mentor_vetting_change();
```

**Testing:**
- Verificar trigger creado: `SELECT * FROM pg_trigger WHERE tgname = 'on_mentor_vetting_change';`

---

### **Step 4: Create Edge Function Structure**

**Task:** Crear estructura del Edge Function `send-vetting-email`

**File:** `supabase/functions/send-vetting-email/index.ts`

**Details:**
- Crear directorio y archivo principal
- Importar Resend SDK
- Definir handler para HTTP POST
- Validar payload entrante

**Structure:**
```
supabase/
└── functions/
    └── send-vetting-email/
        ├── index.ts          # Main handler
        └── templates.ts      # Email templates
```

**Implementation:**
```typescript
// supabase/functions/send-vetting-email/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface VettingEmailPayload {
  mentor_id: string;
  mentor_email: string;
  mentor_name: string;
  action: "approved" | "rejected";
  rejection_reason?: string;
}

Deno.serve(async (req: Request) => {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: VettingEmailPayload = await req.json();

    // Validar payload
    if (!payload.mentor_email || !payload.action) {
      return new Response(
        JSON.stringify({ error: "Invalid payload: missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determinar template y subject
    const { subject, html } = getEmailContent(payload);

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: "Upex My Mentor <noreply@upexgalaxy.com>",
      to: payload.mentor_email,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Email sent successfully to ${payload.mentor_email}`, data);

    return new Response(
      JSON.stringify({ success: true, message_id: data?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function getEmailContent(payload: VettingEmailPayload): {
  subject: string;
  html: string;
} {
  if (payload.action === "approved") {
    return {
      subject: "Your Mentor Application Has Been Approved!",
      html: getApprovalEmailTemplate(payload.mentor_name),
    };
  } else {
    return {
      subject: "Update on Your Mentor Application",
      html: getRejectionEmailTemplate(
        payload.mentor_name,
        payload.rejection_reason
      ),
    };
  }
}

function getApprovalEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations, ${name}!</h1>
        </div>
        <div class="content">
          <p>Great news! Your mentor application on <strong>Upex My Mentor</strong> has been approved.</p>
          <p>You're now part of our community of verified mentors. Students can now discover your profile and book mentorship sessions with you.</p>
          <h3>What's Next?</h3>
          <ul>
            <li>Complete your profile with a detailed bio and photo</li>
            <li>Set your availability for sessions</li>
            <li>Review your hourly rate and specialties</li>
          </ul>
          <p>We're excited to have you on board and look forward to seeing you help students grow in their careers!</p>
          <a href="https://my-mentor.upexgalaxy.com/dashboard" class="button">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>Upex My Mentor - Connecting Students with Expert Mentors</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getRejectionEmailTemplate(
  name: string,
  reason?: string
): string {
  const reasonSection = reason
    ? `<p><strong>Feedback from our team:</strong></p><p style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-style: italic;">${reason}</p>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6b7280; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Update on Your Application</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for your interest in becoming a mentor on <strong>Upex My Mentor</strong>.</p>
          <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
          ${reasonSection}
          <p>We encourage you to:</p>
          <ul>
            <li>Update your LinkedIn profile with more details about your experience</li>
            <li>Add projects to your GitHub showcasing your expertise</li>
            <li>Consider reapplying in the future with an enhanced profile</li>
          </ul>
          <p>If you have questions or believe this decision was made in error, please reach out to our support team.</p>
          <p>Best regards,<br>The Upex My Mentor Team</p>
        </div>
        <div class="footer">
          <p>Upex My Mentor - Connecting Students with Expert Mentors</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
```

**Testing:**
- Local: `supabase functions serve send-vetting-email`
- curl test con payload de prueba

---

### **Step 5: Configure Environment Variables**

**Task:** Configurar RESEND_API_KEY en Supabase

**Details:**
- Agregar secret via Supabase Dashboard o CLI
- El Edge Function lee la variable con `Deno.env.get()`

**Commands:**
```bash
# Via CLI (si esta configurado)
supabase secrets set RESEND_API_KEY=re_xxxxxxxx

# O via Dashboard:
# Project Settings > Edge Functions > Secrets
```

**Required Secrets:**
| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | API key de Resend para enviar emails |

**Notes:**
- Resend ofrece tier gratuito con 100 emails/dia
- Verificar dominio en Resend para mejor deliverability

---

### **Step 6: Deploy Edge Function**

**Task:** Desplegar Edge Function a Supabase

**Commands:**
```bash
# Desde el directorio del proyecto
supabase functions deploy send-vetting-email --project-ref ionevzckjyxtpmyenbxc
```

**Verification:**
- Verificar en Supabase Dashboard > Edge Functions
- Probar endpoint manualmente con curl

**Testing:**
```bash
curl -X POST https://ionevzckjyxtpmyenbxc.supabase.co/functions/v1/send-vetting-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "mentor_id": "test-123",
    "mentor_email": "test@example.com",
    "mentor_name": "Test Mentor",
    "action": "approved"
  }'
```

---

### **Step 7: Configure Service Role Key in Database**

**Task:** Configurar service role key como setting de PostgreSQL para uso en triggers

**Details:**
- El trigger necesita autenticarse con el Edge Function
- Usamos `app.settings.service_role_key` como custom setting

**SQL:**
```sql
-- Configurar service role key (ejecutar como superuser)
ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

**Alternative (mas seguro):**
- Usar Supabase Vault para almacenar secrets
- O crear Edge Function con verificacion de origen (hostname check)

**Notes:**
- Para MVP, autenticacion basica es aceptable
- Produccion: implementar webhook signature verification

---

### **Step 8: Integration Testing**

**Task:** Probar flujo completo end-to-end

**Test Scenarios:**

1. **Approval Flow:**
   - Crear/usar mentor con `is_verified = false`
   - Ejecutar `UPDATE profiles SET is_verified = true WHERE id = 'xxx'`
   - Verificar que email llega

2. **Rejection Flow:**
   - Crear/usar mentor con `is_verified = false`
   - Ejecutar `UPDATE profiles SET rejection_reason = 'Test reason' WHERE id = 'xxx'`
   - Verificar que email de rechazo llega

3. **Negative Test:**
   - Actualizar campo no relacionado (bio, hourly_rate)
   - Verificar que NO se envia email

**Testing Tool:**
- Usar Mailtrap o Inbucket para capturar emails en desarrollo
- O configurar email de prueba en Resend

---

## Technical Decisions (Story-specific)

### Decision 1: Trigger vs Webhook

**Chosen:** PostgreSQL Trigger con pg_net

**Reasoning:**
- ✅ Se ejecuta automaticamente sin modificar codigo existente de MYM-11
- ✅ Garantiza consistencia (siempre se ejecuta cuando cambia el estado)
- ✅ No depende de que el frontend llame a un endpoint adicional
- ❌ Trade-off: Debugging mas complejo que API route

### Decision 2: Email Service

**Chosen:** Resend

**Reasoning:**
- ✅ API moderna y simple
- ✅ Tier gratuito generoso (100 emails/dia)
- ✅ Soporte nativo para Deno/Edge Functions
- ✅ Templates HTML inline (sin necesidad de sistema de templates externo)
- ❌ Trade-off: Requiere verificacion de dominio para produccion

### Decision 3: Email Templates Inline vs External

**Chosen:** Templates HTML inline en el Edge Function

**Reasoning:**
- ✅ Simplicidad para MVP
- ✅ No requiere sistema de templates adicional
- ✅ Facil de modificar y desplegar
- ❌ Trade-off: Para muchos templates, considerar sistema externo (React Email, MJML)

---

## Dependencies

**Pre-requisitos tecnicos:**
- [x] MYM-11 completado (Server Action que actualiza `is_verified`)
- [x] Columna `rejection_reason` existe en profiles
- [ ] Extension `pg_net` habilitada
- [ ] Cuenta Resend configurada con API key
- [ ] Supabase CLI instalado para deploy de Edge Functions

**External Services:**
- Resend account (https://resend.com)
- Dominio verificado en Resend (opcional pero recomendado)

---

## Risks & Mitigations

### Risk 1: Email Delivery Failures

**Impact:** Medium (mentor no notificado)
**Likelihood:** Medium
**Mitigation:**
- Retry logic en Edge Function (Resend tiene reintentos automaticos)
- Logging de errores para monitoreo
- Fallback: notificacion in-app en futuro

### Risk 2: pg_net Rate Limits

**Impact:** Low
**Likelihood:** Low (bajo volumen de aprobaciones)
**Mitigation:**
- Monitorear uso de pg_net
- Para alto volumen: usar cola de mensajes (Supabase Realtime + worker)

### Risk 3: Service Role Key Exposure

**Impact:** High (security)
**Likelihood:** Low
**Mitigation:**
- Key almacenada como database setting (no en codigo)
- Futuro: usar Supabase Vault o webhook signatures
- Edge Function valida origen de requests

---

## Estimated Effort

| Step | Description | Time |
|------|-------------|------|
| 1 | Enable pg_net extension | 5 min |
| 2 | Create trigger function | 20 min |
| 3 | Create trigger | 5 min |
| 4 | Create Edge Function | 45 min |
| 5 | Configure secrets | 10 min |
| 6 | Deploy Edge Function | 10 min |
| 7 | Configure DB setting | 10 min |
| 8 | Integration testing | 30 min |
| **Total** | | **~2.5 hours** |

**Story points:** 3 (Medium complexity, mostly infrastructure)

---

## Definition of Done Checklist

- [ ] pg_net extension habilitada
- [ ] Trigger function `notify_mentor_vetting_change` creada
- [ ] Trigger `on_mentor_vetting_change` creado
- [ ] Edge Function `send-vetting-email` implementada
  - [ ] Handler POST implementado
  - [ ] Payload validation
  - [ ] Resend integration
  - [ ] Email templates (approval + rejection)
- [ ] RESEND_API_KEY configurada en Supabase
- [ ] Edge Function desplegada
- [ ] Service role key configurada en DB
- [ ] Tests pasando:
  - [ ] TC-012-001: Approval email sent
  - [ ] TC-012-002: Rejection email sent
  - [ ] TC-012-003: No email for irrelevant updates
- [ ] Build y typecheck exitosos
- [ ] Code review aprobado
- [ ] Documentacion actualizada
- [ ] Manual smoke test en staging

---

## Related Documentation

- **Story:** `story.md`
- **Test Cases:** `test-cases.md`
- **Feature Plan:** `../../feature-implementation-plan.md`
- **Epic:** `../../epic.md`
- **Backend Setup:** `.context/backend-setup.md`
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Resend Docs:** https://resend.com/docs

---

**Versión:** 1.0
**Última actualización:** 2025-12-06
**Generado con:** Claude Code (AI-Assisted Development)
