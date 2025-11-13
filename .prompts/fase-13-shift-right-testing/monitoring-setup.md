# Prompt: Monitoring Setup

## Tu tarea
Configurar observabilidad en producción.

### 1. Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configurar:
- DSN en variables de entorno
- Source maps para debugging
- Release tracking
- User context

### 2. Logging
Configurar logs estructurados:
- Application logs
- API request/response logs
- Error logs
- Performance logs

### 3. Alertas
Configurar notificaciones para:
- Errores críticos (>10/min)
- Response time > 5s
- API errors > 5% rate
- Deployment issues

## Output
- Sentry configurado
- Logs centralizados
- Alertas activas
