# 📧 Sistema de Confirmación de Reservas - Estado de Setup

## ✅ Completado Automáticamente

### 1. Estructura del Proyecto ✅
```
upex-my-mentor/
├── supabase/
│   └── functions/
│       ├── DEPLOYMENT.md          # 📖 Guía completa de despliegue
│       ├── deploy.sh              # 🚀 Script de despliegue automatizado
│       └── confirm-booking/
│           ├── index.ts           # Edge Function principal
│           ├── deno.json          # Configuración Deno
│           └── tests/             # Tests unitarios
```

### 2. Variables de Entorno Configuradas ✅

**Archivo `.env` actualizado con:**
```bash
# Ya configuradas:
SUPABASE_URL=https://ionevzckjyxtpmyenbxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL_CONFIRM_BOOKING=...

# Necesitan tu API key real:
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # ⚠️ ACTUALIZAR
FROM_EMAIL=noreply@upexmymentor.com
FROM_NAME=Upex My Mentor
```

### 3. Endpoint de Testing ✅
- **Ubicación**: `src/app/api/testing/trigger-confirmation-email/[bookingId]/route.ts`
- **URL**: `POST /api/testing/trigger-confirmation-email/{bookingId}`
- **Estado**: ✅ Implementado y listo para usar

---

## 🎯 Pasos Restantes (Acción Manual Requerida)

### Paso 1: Obtener API Key de Resend
1. Ve a https://resend.com/api-keys
2. Crea una cuenta si no tienes una (tienen plan gratuito)
3. Genera una nueva API key
4. Actualiza en `.env`:
   ```bash
   RESEND_API_KEY=re_tu_key_real_aqui
   ```

### Paso 2: Configurar Dominio de Email (Opcional pero recomendado)
1. En Resend Dashboard, ve a **Domains**
2. Añade tu dominio: `upexmymentor.com`
3. Configura los registros DNS (MX, TXT, DKIM)
4. Actualiza `FROM_EMAIL` en `.env`:
   ```bash
   FROM_EMAIL=noreply@tudominio.com
   ```

**Alternativa para testing:** Resend permite enviar desde `onboarding@resend.dev` sin configurar dominio.

### Paso 3: Desplegar Edge Function

#### Opción A - Script Automatizado (Más fácil) 🚀
```bash
# Desde la raíz del proyecto:
./supabase/functions/deploy.sh
```

El script automáticamente:
- ✅ Verifica variables de entorno
- ✅ Hace login en Supabase
- ✅ Vincula el proyecto
- ✅ Configura los secrets
- ✅ Despliega la función

#### Opción B - Manual usando CLI
```bash
# 1. Login
npx supabase login

# 2. Vincular proyecto
npx supabase link --project-ref ionevzckjyxtpmyenbxc

# 3. Configurar secrets
npx supabase secrets set SUPABASE_URL="https://ionevzckjyxtpmyenbxc.supabase.co"
npx supabase secrets set SUPABASE_ANON_KEY="tu_anon_key"
npx supabase secrets set RESEND_API_KEY="tu_resend_key"
npx supabase secrets set FROM_EMAIL="noreply@tudominio.com"
npx supabase secrets set FROM_NAME="Upex My Mentor"

# 4. Desplegar
npx supabase functions deploy confirm-booking
```

#### Opción C - Interface Web de Supabase
Ver guía completa en: `supabase/functions/DEPLOYMENT.md`

---

## 🧪 Cómo Probar el Sistema

### 1. Iniciar servidor de desarrollo
```bash
npm run dev
```

### 2. Probar con un booking real
```bash
# Reemplaza BOOKING_ID con un ID real de tu tabla bookings
curl -X POST http://localhost:3000/api/testing/trigger-confirmation-email/BOOKING_ID
```

### 3. Verificar resultado
- ✅ Revisa la consola de Next.js para logs
- ✅ Revisa los logs en Supabase Dashboard > Edge Functions > confirm-booking > Logs
- ✅ Verifica que los emails lleguen a las bandejas de entrada del mentor y mentee

---

## 📊 Flujo del Sistema

```
Usuario hace una reserva
         ↓
Sistema llama a Edge Function
         ↓
Edge Function obtiene datos del booking
         ↓
Genera emails personalizados + calendarios (.ics)
         ↓
Envía emails via Resend
         ↓
Actualiza campo confirmation_sent_at en DB
         ↓
✅ Mentor y Mentee reciben confirmación
```

---

## 🔍 Verificación de Requisitos

**Antes de desplegar, asegúrate de tener:**

- [ ] ✅ Cuenta de Resend creada
- [ ] ✅ API Key de Resend obtenida
- [ ] ⚠️ Dominio configurado (opcional para producción)
- [ ] ✅ Variables en `.env` actualizadas
- [ ] ⚠️ Booking de test en la base de datos
- [ ] ⚠️ Estructura de tabla `bookings` con campos:
  - `id`, `session_datetime`, `duration_minutes`
  - `mentor_id`, `mentee_id`, `confirmation_sent_at`
- [ ] ⚠️ Tabla `users` con campos:
  - `id`, `name`, `email`, `timezone`
- [ ] ⚠️ Tabla `mentors` con campos:
  - `id`, `name`, `email`, `timezone`

---

## 📚 Recursos Adicionales

- **Guía de Despliegue Completa**: `supabase/functions/DEPLOYMENT.md`
- **Script de Despliegue**: `supabase/functions/deploy.sh`
- **Código de la Edge Function**: `supabase/functions/confirm-booking/index.ts`
- **Endpoint de Testing**: `src/app/api/testing/trigger-confirmation-email/[bookingId]/route.ts`

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar otro servicio de email?
Sí, pero necesitarás modificar el código en `index.ts` para usar otro proveedor.

### ¿Los calendarios funcionan en todos los clientes?
Sí, los archivos `.ics` son compatibles con Google Calendar, Outlook, Apple Calendar, etc.

### ¿Cuánto cuesta Resend?
- Plan gratuito: 100 emails/día, 3,000/mes
- Plan Pro: $20/mes, 50,000 emails/mes
- Ver: https://resend.com/pricing

### ¿Necesito Supabase CLI instalado globalmente?
No, el script usa `npx` que descarga y ejecuta temporalmente.

---

## 🎉 ¡Próximos Pasos!

Una vez completados los pasos manuales:

1. **Desplegar** la Edge Function
2. **Probar** con un booking real
3. **Verificar** que los emails lleguen
4. **Integrar** en tu flujo de creación de reservas

¿Necesitas ayuda? Revisa `DEPLOYMENT.md` o contacta al equipo de desarrollo.
