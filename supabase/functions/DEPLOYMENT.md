# Guía de Despliegue - Edge Function confirm-booking

## ✅ Pasos Completados

- [x] ✅ Estructura de proyecto creada en `supabase/functions/confirm-booking/`
- [x] ✅ Variables de entorno configuradas en `.env`
- [x] ✅ Endpoint de testing creado en `/api/testing/trigger-confirmation-email/{bookingId}`

---

## 📋 Pasos Pendientes (Requieren acción manual)

### 1. Obtener API Key de Resend

1. Ve a [Resend Dashboard](https://resend.com/api-keys)
2. Crea una nueva API Key
3. Cópiala y actualiza tu archivo `.env`:
   ```bash
   RESEND_API_KEY=re_tu_api_key_real_aqui
   ```

### 2. Verificar/Configurar dominio de email en Resend

1. En Resend, ve a **Domains**
2. Añade y verifica tu dominio (ej: `upexmymentor.com`)
3. Actualiza `FROM_EMAIL` en `.env` con un email verificado:
   ```bash
   FROM_EMAIL=noreply@tudominio.com
   ```

---

## 🚀 Opción A: Despliegue usando Supabase CLI (Recomendado)

### Instalar Supabase CLI

#### En Windows (usando PowerShell como administrador):
```powershell
iwr -useb https://raw.githubusercontent.com/supabase/cli/main/install.ps1 | iex
```

#### O usando npm con -y para auto-aprobar:
```bash
yes | npx supabase@latest login
```

### Login en Supabase
```bash
npx supabase login
```

### Vincular tu proyecto
```bash
npx supabase link --project-ref ionevzckjyxtpmyenbxc
```

### Configurar variables de entorno en Supabase
```bash
npx supabase secrets set SUPABASE_URL=https://ionevzckjyxtpmyenbxc.supabase.co
npx supabase secrets set SUPABASE_ANON_KEY=tu_anon_key
npx supabase secrets set RESEND_API_KEY=tu_resend_api_key
npx supabase secrets set FROM_EMAIL=noreply@tudominio.com
npx supabase secrets set FROM_NAME="Upex My Mentor"
```

### Desplegar la función
```bash
npx supabase functions deploy confirm-booking
```

---

## 🌐 Opción B: Despliegue usando la Web UI de Supabase

Si prefieres no instalar el CLI, puedes desplegar manualmente:

### Paso 1: Ir a Edge Functions
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard/project/ionevzckjyxtpmyenbxc)
2. En el menú lateral, click en **Edge Functions**
3. Click en **Create a new function**

### Paso 2: Crear la función
1. **Function name**: `confirm-booking`
2. Copia el contenido de `supabase/functions/confirm-booking/index.ts` en el editor
3. Click en **Deploy function**

### Paso 3: Configurar variables de entorno
1. En la página de la función, ve a **Settings** > **Secrets**
2. Añade las siguientes variables:
   - `SUPABASE_URL`: `https://ionevzckjyxtpmyenbxc.supabase.co`
   - `SUPABASE_ANON_KEY`: (tu anon key del .env)
   - `RESEND_API_KEY`: (tu API key de Resend)
   - `FROM_EMAIL`: `noreply@tudominio.com`
   - `FROM_NAME`: `Upex My Mentor`

---

## ✅ Verificar el Despliegue

### 1. Obtener la URL de la función
Después de desplegar, la URL será:
```
https://ionevzckjyxtpmyenbxc.supabase.co/functions/v1/confirm-booking
```

Esta URL ya está configurada en tu `.env` como:
```
NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL_CONFIRM_BOOKING
```

### 2. Probar la función

#### Opción 1: Usando el endpoint de testing de Next.js
1. Asegúrate de que tu servidor Next.js esté corriendo:
   ```bash
   npm run dev
   ```

2. Haz una petición POST (reemplaza `BOOKING_ID` con un ID real):
   ```bash
   curl -X POST http://localhost:3000/api/testing/trigger-confirmation-email/BOOKING_ID
   ```

#### Opción 2: Directamente a la Edge Function
```bash
curl -X POST https://ionevzckjyxtpmyenbxc.supabase.co/functions/v1/confirm-booking \
  -H "Authorization: Bearer TU_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"BOOKING_ID_REAL"}'
```

### 3. Verificar logs
- En Supabase Dashboard, ve a **Edge Functions** > **confirm-booking** > **Logs**
- Busca errores o confirmaciones de envío de email

---

## 🔍 Troubleshooting

### Error: "RESEND_API_KEY is not set"
- Verifica que la variable esté configurada en Supabase Secrets
- Redeploy la función después de añadir las variables

### Error: "Booking not found"
- Verifica que el `bookingId` existe en tu tabla `bookings`
- Asegúrate de que la estructura de la tabla coincide con la query en la función

### Emails no se envían
- Verifica que tu dominio esté verificado en Resend
- Revisa los logs de la Edge Function en Supabase
- Verifica que `FROM_EMAIL` use un dominio verificado

### Error de autorización
- Asegúrate de incluir el header `Authorization: Bearer ANON_KEY`
- Verifica que el anon key sea correcto

---

## 📝 Notas Importantes

1. **API Keys en Producción**: Los valores en `.env` son para desarrollo. En producción (Vercel/otros):
   - Configura las variables de entorno en tu plataforma de hosting
   - Usa secrets management para API keys sensibles

2. **Testing**: Antes de usar en producción, prueba con bookings de test

3. **Monitoring**: Configura alertas en Resend y Supabase para monitorear el envío de emails

4. **Rate Limits**: Resend tiene límites de envío. Revisa tu plan en [Resend Pricing](https://resend.com/pricing)

---

## ✨ ¡Listo!

Una vez completados estos pasos, tu sistema de confirmación de reservas estará operativo:

✅ La Edge Function estará desplegada en Supabase  
✅ Los emails de confirmación se enviarán automáticamente  
✅ Ambos mentor y mentee recibirán invitaciones de calendario  
✅ El endpoint de testing estará disponible para pruebas manuales
