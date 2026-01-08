<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Production Deployment - Manual

> **Fase:** 13 - Production Deployment
> **Tiempo estimado:** 30-60 minutos (incluyendo monitoreo)
> **Herramientas:** Git, Vercel/Railway Dashboard, Sentry

---

## Objetivo

Desplegar código a producción de manera segura, con plan de rollback y monitoreo activo.

**IMPORTANTE:** Esta fase viene DESPUÉS de:

- Fase 12: Test Automation completada
- Smoke tests pasando en staging
- Aprobación de stakeholders

---

## Conceptos Clave

### 🔑 Flujo de Deploy

```
develop (staging) → main (production)
        │                  │
        │                  ▼
        │          Vercel auto-deploy
        │                  │
        ▼                  ▼
   Staging OK?  →  Production Live
        │                  │
        └── Smoke Tests ───┘
```

### 🔑 Severidad de Rollback

| Severidad    | Cuándo                 | Acción                |
| ------------ | ---------------------- | --------------------- |
| **Critical** | Servicio caído         | Rollback inmediato    |
| **High**     | Feature principal rota | Rollback en 15 min    |
| **Medium**   | Bug importante         | Hotfix en 24h         |
| **Low**      | Bug menor              | Fix en próximo sprint |

---

## Pre-requisitos

- [ ] **Tests automation pasando** - Unit, Integration, E2E
- [ ] **Smoke tests manuales OK** en staging
- [ ] **Code review aprobado**
- [ ] **Aprobación de stakeholders** (PM, QA, DevOps)

---

## Paso a Paso

---

## PARTE 1: PRE-DEPLOY CHECKLIST (15-20 minutos)

> **Objetivo:** Validar que todo está listo antes de desplegar.

### Paso 1.1: Validar Tests

**Checklist de tests:**

| Test                    | Status | Cómo Verificar             |
| ----------------------- | ------ | -------------------------- |
| ✅ Unit tests           |        | `bun run test:unit`        |
| ✅ Integration tests    |        | `bun run test:integration` |
| ✅ E2E tests (staging)  |        | `bun run test:e2e`         |
| ✅ Smoke tests manuales |        | Ejecutar smoke checklist   |
| ✅ Performance tests    |        | (Si aplica al proyecto)    |

**Comando para verificar CI:**

```bash
# Verificar que CI pasó
gh run list --limit 5

# Ver detalle del último run
gh run view [run-id]
```

### Paso 1.2: Validar Code Quality

**Checklist de calidad:**

| Check                     | Status | Cómo Verificar         |
| ------------------------- | ------ | ---------------------- |
| ✅ Code review aprobado   |        | PR aprobado en GitHub  |
| ✅ No hay TODOs críticos  |        | `grep -r "TODO:" src/` |
| ✅ Linting pasando        |        | `bun run lint`         |
| ✅ TypeScript sin errores |        | `bun run type-check`   |
| ✅ Security scan OK       |        | `bun audit`            |

### Paso 1.3: Validar Infraestructura

**Checklist de infra:**

| Check                   | Status | Dónde Verificar                   |
| ----------------------- | ------ | --------------------------------- |
| ✅ Variables de entorno |        | Vercel Dashboard → Settings → Env |
| ✅ Secrets configurados |        | Vercel Dashboard → Settings → Env |
| ✅ Database migrations  |        | (Si aplica) Ver Supabase          |
| ✅ Backup reciente      |        | Supabase → Backups                |

**Variables requeridas en producción:**

```env
# Verificar que existen en Vercel (Production)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Paso 1.4: Validar Monitoreo

**Checklist de monitoreo:**

| Check                   | Status | Dónde Verificar  |
| ----------------------- | ------ | ---------------- |
| ✅ Sentry configurado   |        | Sentry Dashboard |
| ✅ Alertas configuradas |        | Sentry → Alerts  |
| ✅ Dashboards listos    |        | Vercel Analytics |

### Paso 1.5: Aprobaciones

**Obtener sign-off de:**

| Rol     | Nombre | Aprobado |
| ------- | ------ | -------- |
| PM      |        | ☐        |
| QA Lead |        | ☐        |
| DevOps  |        | ☐        |

---

## PARTE 2: DEPLOY A PRODUCCIÓN (10-15 minutos)

> **Objetivo:** Ejecutar el deploy de manera controlada.

### Paso 2.1: Preparar Merge

```bash
# 1. Asegurarse de estar actualizado
git checkout develop
git pull origin develop

# 2. Verificar cambios que irán a producción
git log main..develop --oneline

# 3. Ver archivos modificados
git diff main develop --stat
```

### Paso 2.2: Ejecutar Merge

```bash
# 1. Cambiar a main
git checkout main
git pull origin main

# 2. Merge develop → main
git merge develop

# 3. Push a main (dispara auto-deploy)
git push origin main
```

### Paso 2.3: Monitorear Deploy

**En Vercel Dashboard:**

1. Ir a: https://vercel.com/[team]/[project]
2. Ver pestaña "Deployments"
3. Monitorear build en progreso
4. Verificar que status sea "Ready"

**Tiempo típico de deploy:** 2-5 minutos

### Paso 2.4: Validar Deploy

**Una vez que el deploy esté "Ready":**

```bash
# Verificar que la URL de producción responde
curl -I https://tu-dominio.com

# Verificar health endpoint (si existe)
curl https://tu-dominio.com/api/health
```

---

## PARTE 3: POST-DEPLOY VALIDATION (15-20 minutos)

> **Objetivo:** Confirmar que producción funciona correctamente.

### Paso 3.1: Smoke Test Rápido

**Ejecutar manualmente (2-3 minutos):**

| Check             | URL                      | Expected                  |
| ----------------- | ------------------------ | ------------------------- |
| ✅ Homepage carga | `https://tu-dominio.com` | 200 OK, contenido visible |
| ✅ Login funciona | `/login`                 | Formulario visible        |
| ✅ Auth flow      | Login con test user      | Redirect a dashboard      |
| ✅ API responde   | `/api/health`            | 200 OK                    |

### Paso 3.2: Monitoreo Activo (Primeras 2-4 horas)

**Qué monitorear:**

| Métrica        | Herramienta      | Umbral de Alerta |
| -------------- | ---------------- | ---------------- |
| Errors         | Sentry           | > 10/minuto      |
| Response time  | Vercel Analytics | > 5 segundos     |
| API error rate | Logs             | > 5%             |
| CPU/Memory     | Vercel           | Uso anormal      |

### Paso 3.3: Validar Métricas de Negocio

**Si aplica, verificar:**

- [ ] Usuarios pueden registrarse
- [ ] Usuarios pueden hacer compras
- [ ] Datos se guardan correctamente
- [ ] Emails se envían

---

## PARTE 4: ROLLBACK PLAN

> **Objetivo:** Saber qué hacer si algo sale mal.

### Cuándo Hacer Rollback

| Síntoma                       | Severidad | Acción                |
| ----------------------------- | --------- | --------------------- |
| Servicio completamente caído  | Critical  | Rollback INMEDIATO    |
| Feature principal no funciona | High      | Rollback en 15 min    |
| Errores > 10% de requests     | High      | Rollback en 15 min    |
| Bug importante con workaround | Medium    | Evaluar hotfix        |
| Bug menor, cosmético          | Low       | Fix en próximo deploy |

### Paso 4.1: Rollback en Vercel

**Opción A: Dashboard (Recomendado)**

1. Ir a Vercel Dashboard
2. Click en "Deployments"
3. Encontrar último deploy funcionando
4. Click en "..." → "Promote to Production"

**Opción B: CLI**

```bash
# Listar deployments
vercel ls

# Rollback a deployment específico
vercel rollback [deployment-url]
```

### Paso 4.2: Post-Rollback

1. **Verificar** que producción funciona
2. **Notificar** al equipo que se hizo rollback
3. **Investigar** causa del problema
4. **Fix** en develop
5. **Re-testear** en staging
6. **Re-deploy** cuando esté listo

### Paso 4.3: Documentar Incidente

```markdown
# Incidente: [Fecha] [Hora]

## Resumen

[Qué pasó]

## Timeline

- HH:MM - Deploy a producción
- HH:MM - Problema detectado
- HH:MM - Rollback ejecutado
- HH:MM - Producción estable

## Root Cause

[Por qué pasó]

## Fix

[Qué se hizo para arreglarlo]

## Lessons Learned

[Qué aprendimos]
```

---

## Checklist Final

### Pre-Deploy

- [ ] Unit tests pasando
- [ ] Integration tests pasando
- [ ] E2E tests pasando en staging
- [ ] Smoke tests manuales OK
- [ ] Code review aprobado
- [ ] Variables de entorno verificadas
- [ ] Backup de producción reciente
- [ ] Monitoreo configurado
- [ ] Stakeholders aprobaron

### Deploy

- [ ] Merge develop → main ejecutado
- [ ] Build completó sin errores
- [ ] Deploy status "Ready" en Vercel

### Post-Deploy

- [ ] Homepage carga correctamente
- [ ] Auth funciona
- [ ] API responde
- [ ] Sentry no muestra errores nuevos
- [ ] Métricas de negocio normales
- [ ] Monitoreo activo primeras 2-4 horas

### Rollback (Si Necesario)

- [ ] Rollback ejecutado
- [ ] Producción estable
- [ ] Equipo notificado
- [ ] Incidente documentado

---

## Troubleshooting

| Problema         | Causa Probable       | Solución                     |
| ---------------- | -------------------- | ---------------------------- |
| Build falla      | Error de compilación | Revisar logs de Vercel       |
| 500 errors       | Variables de entorno | Verificar en Vercel settings |
| API no responde  | Database connection  | Verificar Supabase           |
| Auth no funciona | Keys incorrectas     | Verificar SUPABASE\_\* vars  |
| Deploy lento     | Assets grandes       | Optimizar imágenes/bundle    |

---

## Comandos Útiles

```bash
# Ver deployments recientes
vercel ls

# Ver logs de producción
vercel logs [deployment-url]

# Rollback rápido
vercel rollback

# Ver variables de entorno
vercel env ls production

# Ejecutar smoke tests contra producción
PRODUCTION_URL=https://tu-dominio.com bun run test:smoke
```

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
