#!/bin/bash

# Script de despliegue automatizado para Edge Function confirm-booking
# Uso: ./deploy.sh

set -e  # Salir si hay error

echo "🚀 Iniciando despliegue de Edge Function: confirm-booking"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "supabase/functions/confirm-booking" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar que .env existe
if [ ! -f ".env" ]; then
    echo "❌ Error: Archivo .env no encontrado"
    exit 1
fi

# Cargar variables de .env
source .env

# Verificar variables requeridas
echo "✅ Verificando variables de entorno..."

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurado en .env"
    exit 1
fi

if [ -z "$RESEND_API_KEY" ] || [ "$RESEND_API_KEY" = "re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" ]; then
    echo "❌ Error: RESEND_API_KEY no está configurado correctamente en .env"
    echo "   Ve a https://resend.com/api-keys para obtener tu API key"
    exit 1
fi

if [ -z "$FROM_EMAIL" ]; then
    echo "❌ Error: FROM_EMAIL no está configurado en .env"
    exit 1
fi

echo "✅ Variables de entorno verificadas"
echo ""

# Intentar hacer login en Supabase
echo "🔑 Verificando autenticación con Supabase..."
if ! npx supabase projects list > /dev/null 2>&1; then
    echo "⚠️  No estás autenticado. Iniciando login..."
    npx supabase login
fi

echo "✅ Autenticado en Supabase"
echo ""

# Vincular proyecto (si no está vinculado)
echo "🔗 Verificando vinculación del proyecto..."
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Proyecto no vinculado. Vinculando..."
    npx supabase link --project-ref ionevzckjyxtpmyenbxc
fi

echo "✅ Proyecto vinculado"
echo ""

# Configurar secrets en Supabase
echo "🔐 Configurando secrets en Supabase..."
npx supabase secrets set SUPABASE_URL="${SUPABASE_URL}"
npx supabase secrets set SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
npx supabase secrets set RESEND_API_KEY="${RESEND_API_KEY}"
npx supabase secrets set FROM_EMAIL="${FROM_EMAIL}"
npx supabase secrets set FROM_NAME="${FROM_NAME:-Upex My Mentor}"

echo "✅ Secrets configurados"
echo ""

# Desplegar función
echo "📦 Desplegando Edge Function..."
npx supabase functions deploy confirm-booking

echo ""
echo "✨ ¡Despliegue completado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verifica los logs en: https://supabase.com/dashboard/project/ionevzckjyxtpmyenbxc/functions"
echo "2. Prueba la función con:"
echo "   curl -X POST http://localhost:3000/api/testing/trigger-confirmation-email/BOOKING_ID"
echo ""
echo "🔗 URL de la función:"
echo "   https://ionevzckjyxtpmyenbxc.supabase.co/functions/v1/confirm-booking"
