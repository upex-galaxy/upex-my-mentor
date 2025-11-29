# ✅ Checklist - Sistema de Confirmación de Reservas

## 🎯 Tareas que DEBES completar (3 pasos)

### [ ] 1. Obtener API Key de Resend (5 minutos)
```bash
# 1. Ve a: https://resend.com/api-keys
# 2. Regístrate/Login
# 3. Crea una API Key
# 4. Cópiala y actualiza .env:
RESEND_API_KEY=re_tu_api_key_aqui
```

### [ ] 2. (Opcional) Configurar dominio de email
```bash
# Para testing puedes usar: onboarding@resend.dev
# Para producción, configura tu dominio en Resend
FROM_EMAIL=noreply@tudominio.com
```

### [ ] 3. Desplegar Edge Function (2 minutos)
```bash
# Opción más fácil - ejecuta el script:
./supabase/functions/deploy.sh

# El script hace todo automáticamente:
# ✅ Login en Supabase
# ✅ Vincula el proyecto
# ✅ Configura secrets
# ✅ Despliega la función
```

---

## 🧪 Probar que funciona

```bash
# 1. Inicia el servidor
npm run dev

# 2. Prueba con un booking ID real
curl -X POST http://localhost:3000/api/testing/trigger-confirmation-email/TU_BOOKING_ID

# 3. Verifica que los emails lleguen
```

---

## 📚 Documentación Completa

Si necesitas más detalles:
- **Resumen completo**: `CONFIRMATION-SYSTEM-SETUP.md`
- **Guía de despliegue**: `supabase/functions/DEPLOYMENT.md`
- **Script automatizado**: `supabase/functions/deploy.sh`

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Obtén Resend API Key
# Ve a https://resend.com/api-keys

# 2. Actualiza .env
RESEND_API_KEY=re_tu_key_aqui

# 3. Despliega
./supabase/functions/deploy.sh

# 4. Prueba
npm run dev
curl -X POST http://localhost:3000/api/testing/trigger-confirmation-email/BOOKING_ID
```

¡Listo! 🎉
