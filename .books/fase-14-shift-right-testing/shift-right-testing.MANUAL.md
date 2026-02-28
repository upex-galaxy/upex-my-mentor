<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Shift-Right Testing - Manual

> **Fase:** 14 - Shift-Right Testing
> **Tiempo estimado:** Setup inicial 2-4 horas, luego monitoreo continuo
> **Herramientas:** Sentry, Vercel Analytics, Logs, Playwright

---

## Objetivo

Implementar observabilidad y testing en producción para detectar problemas tempranamente y responder a incidentes de manera efectiva.

**Shift-Right Testing** complementa al Shift-Left:

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING SPECTRUM                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SHIFT-LEFT                              SHIFT-RIGHT         │
│  ◄──────────────────────────────────────────────────────►   │
│                                                              │
│  Antes de                                Después de          │
│  implementar                             producción          │
│                                                              │
│  - Unit Tests            ───►            - Monitoring        │
│  - Integration Tests     ───►            - Alertas           │
│  - E2E Tests            ───►             - Smoke Tests       │
│  - Exploratory          ───►             - Incident Response │
│                                                              │
│  PREVENIR                                DETECTAR + RESPONDER│
│  bugs                                    bugs                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Conceptos Clave

### 🔑 Observabilidad

Los tres pilares de la observabilidad:

| Pilar       | Qué Es                    | Herramienta          |
| ----------- | ------------------------- | -------------------- |
| **Logs**    | Registro de eventos       | Console, Vercel Logs |
| **Metrics** | Números sobre performance | Vercel Analytics     |
| **Traces**  | Seguimiento de requests   | Sentry               |

### 🔑 Niveles de Severidad

| Nivel             | Descripción                               | Response Time  |
| ----------------- | ----------------------------------------- | -------------- |
| **Critical (P1)** | Servicio caído, afecta todos los usuarios | Inmediato      |
| **High (P2)**     | Feature principal rota                    | < 1 hora       |
| **Medium (P3)**   | Bug importante, tiene workaround          | < 24 horas     |
| **Low (P4)**      | Bug menor, cosmético                      | Próximo sprint |

### 🔑 Smoke Tests en Producción

Tests automáticos que corren después de cada deploy para validar funcionalidad básica.

---

## Pre-requisitos

- [ ] **Deploy a producción completado** (Fase 13)
- [ ] **Cuenta de Sentry** configurada
- [ ] **Acceso a Vercel Dashboard**
- [ ] **Playwright configurado** para smoke tests

---

## Paso a Paso

---

## PARTE 1: CONFIGURAR SENTRY (Error Tracking)

> **Objetivo:** Capturar errores en producción automáticamente.

### Paso 1.1: Instalar Sentry

```bash
# Next.js
bun add @sentry/nextjs

# Wizard de configuración
bunx @sentry/wizard@latest -i nextjs
```

**El wizard creará:**

```
├── sentry.client.config.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
└── next.config.js (modificado)
```

### Paso 1.2: Configurar Variables de Entorno

**Agregar a Vercel (Production):**

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=tu-organizacion
SENTRY_PROJECT=tu-proyecto
```

### Paso 1.3: Configurar User Context

```typescript
// En tu auth provider o layout
import * as Sentry from '@sentry/nextjs';

// Cuando el usuario hace login
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Cuando hace logout
Sentry.setUser(null);
```

### Paso 1.4: Configurar Release Tracking

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Release version
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

  // Sample rate
  tracesSampleRate: 1.0,

  // Ignore known issues
  ignoreErrors: ['ResizeObserver loop limit exceeded', 'Network request failed'],
});
```

---

## PARTE 2: CONFIGURAR ALERTAS

> **Objetivo:** Recibir notificaciones cuando algo sale mal.

### Paso 2.1: Alertas de Sentry

**En Sentry Dashboard → Alerts → Create Alert:**

**Alerta 1: Errores Críticos**

| Campo     | Valor                              |
| --------- | ---------------------------------- |
| Name      | Critical Errors                    |
| Condition | Number of errors > 10 in 5 minutes |
| Action    | Email + Slack                      |

**Alerta 2: Nuevos Issues**

| Campo     | Valor                |
| --------- | -------------------- |
| Name      | New Issues Alert     |
| Condition | New issue is created |
| Action    | Email                |

**Alerta 3: Regression**

| Campo     | Valor                                  |
| --------- | -------------------------------------- |
| Name      | Regression Alert                       |
| Condition | Issue marked as resolved happens again |
| Action    | Email + Slack                          |

### Paso 2.2: Alertas de Vercel

**En Vercel Dashboard → Project → Settings → Notifications:**

- [ ] Deploy failed → Email
- [ ] Deploy succeeded → (Opcional)
- [ ] Domain issues → Email

### Paso 2.3: Configurar Canales

**Slack Integration (Recomendado):**

1. Crear canal `#alerts-production`
2. Integrar Sentry con Slack
3. Configurar alertas a ese canal

---

## PARTE 3: SMOKE TESTS AUTOMÁTICOS

> **Objetivo:** Validar producción después de cada deploy.

### Paso 3.1: Crear Smoke Tests

```typescript
// tests/smoke/production.spec.ts
import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://tu-dominio.com';

test.describe('Production Smoke Tests @smoke', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto(PRODUCTION_URL);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('API health check returns 200', async ({ request }) => {
    const response = await request.get(`${PRODUCTION_URL}/api/health`);

    expect(response.status()).toBe(200);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/login`);

    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('authentication flow works', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/login`);

    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');

    // Esperar redirect a dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });
});
```

### Paso 3.2: Configurar CI/CD para Smoke Tests

```yaml
# .github/workflows/smoke-tests.yml
name: Production Smoke Tests

on:
  deployment_status:

jobs:
  smoke-tests:
    if: github.event.deployment_status.state == 'success' && github.event.deployment_status.environment == 'Production'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Install Playwright browsers
        run: bunx playwright install --with-deps chromium

      - name: Run smoke tests
        run: bunx playwright test tests/smoke/ --grep @smoke
        env:
          PRODUCTION_URL: ${{ github.event.deployment_status.target_url }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: smoke-test-results
          path: playwright-report/
```

### Paso 3.3: Ejecutar Smoke Tests Manualmente

```bash
# Ejecutar contra producción
PRODUCTION_URL=https://tu-dominio.com bun run playwright test tests/smoke/

# Con reporte HTML
PRODUCTION_URL=https://tu-dominio.com bun run playwright test tests/smoke/ --reporter=html

# Ver reporte
bun run playwright show-report
```

---

## PARTE 4: PLAYBOOK DE INCIDENTES

> **Objetivo:** Saber exactamente qué hacer cuando algo sale mal.

### Severidad 1: Critical (Servicio Caído)

**Síntomas:**

- Usuarios no pueden acceder
- Error 500 en toda la aplicación
- Database completamente caída

**Acciones (en orden):**

| Paso | Acción                                  | Responsable   | Tiempo    |
| ---- | --------------------------------------- | ------------- | --------- |
| 1    | Notificar al equipo (Slack/Call)        | Quien detecta | Inmediato |
| 2    | Verificar deploy reciente               | DevOps        | 2 min     |
| 3    | Si deploy reciente → Rollback           | DevOps        | 5 min     |
| 4    | Verificar dependencias (Supabase, APIs) | DevOps        | 5 min     |
| 5    | Comunicar status a stakeholders         | PM/Lead       | 10 min    |
| 6    | Investigar root cause                   | Dev           | Continuo  |
| 7    | Implementar fix                         | Dev           | ASAP      |
| 8    | Deploy hotfix                           | DevOps        | ASAP      |
| 9    | Verificar resolución                    | QA            | 5 min     |
| 10   | Post-mortem                             | Todos         | < 24h     |

### Severidad 2: High (Funcionalidad Parcial)

**Síntomas:**

- Feature principal no funciona
- Subset de usuarios afectados
- Errores > 5% de requests

**Acciones:**

| Paso | Acción                           | Tiempo    |
| ---- | -------------------------------- | --------- |
| 1    | Notificar equipo                 | Inmediato |
| 2    | Evaluar impacto                  | 10 min    |
| 3    | Decidir: Rollback vs Hotfix      | 15 min    |
| 4    | Comunicar workaround (si existe) | 20 min    |
| 5    | Implementar solución             | 1-4 horas |

### Severidad 3: Medium (Bug Importante)

**Síntomas:**

- Feature secundaria afectada
- Workaround disponible
- Afecta experiencia de usuario

**Acciones:**

| Paso | Acción                    | Tiempo     |
| ---- | ------------------------- | ---------- |
| 1    | Crear ticket con detalles | Inmediato  |
| 2    | Comunicar workaround      | 1 hora     |
| 3    | Priorizar en backlog      | < 24 horas |
| 4    | Fix en próximo deploy     | 1-3 días   |

### Severidad 4: Low (Bug Menor)

**Síntomas:**

- Issue cosmético
- No afecta funcionalidad core
- Usuarios rara vez lo notan

**Acciones:**

1. Crear ticket
2. Priorizar en backlog
3. Fix en próximo sprint

---

## PARTE 5: CHECKLIST DE INVESTIGACIÓN

> **Usar cuando hay un incidente para investigar sistemáticamente.**

### Paso 5.1: Recopilar Información

```markdown
## Incidente: [Título]

**Detectado:** [Fecha/Hora]
**Reportado por:** [Nombre]
**Severidad:** [P1/P2/P3/P4]

### Síntomas

- [ ] Qué está fallando exactamente
- [ ] Qué usuarios/features están afectados
- [ ] Desde cuándo empezó

### Timeline

- HH:MM - [Evento]
- HH:MM - [Evento]
```

### Paso 5.2: Investigar

| Check                      | Herramienta        | Qué Buscar                          |
| -------------------------- | ------------------ | ----------------------------------- |
| [ ] Errores en Sentry      | Sentry Dashboard   | Nuevos issues, stack traces         |
| [ ] Logs de aplicación     | Vercel Logs        | Errores, warnings                   |
| [ ] Métricas de API        | Vercel Analytics   | Response times, error rates         |
| [ ] Estado de Supabase     | Supabase Dashboard | Database status, queries lentas     |
| [ ] Deploys recientes      | Vercel Deployments | Cambios que coincidan con el inicio |
| [ ] Cambios de DNS/Dominio | Vercel Domains     | Certificados, configuración         |

### Paso 5.3: Reproducir

```markdown
### Steps to Reproduce

1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### Expected Result

[Qué debería pasar]

### Actual Result

[Qué está pasando]
```

### Paso 5.4: Resolver

```markdown
### Root Cause

[Explicación técnica de por qué pasó]

### Fix Applied

[Qué se hizo para arreglarlo]

### Verification

- [ ] Fix desplegado
- [ ] Smoke tests pasando
- [ ] Usuarios confirmaron resolución
- [ ] Métricas volvieron a la normalidad
```

### Paso 5.5: Post-Mortem

```markdown
# Post-Mortem: [Título del Incidente]

**Fecha:** [Fecha]
**Duración:** [Tiempo de impacto]
**Severidad:** [P1/P2/P3/P4]
**Usuarios Afectados:** [Número/Porcentaje]

## Resumen

[1-2 párrafos describiendo qué pasó]

## Timeline

| Hora  | Evento              |
| ----- | ------------------- |
| HH:MM | [Detección]         |
| HH:MM | [Primera respuesta] |
| HH:MM | [Resolución]        |

## Root Cause

[Explicación detallada]

## Impacto

- [Impacto en usuarios]
- [Impacto en negocio]

## Qué Funcionó Bien

- [Algo que funcionó]

## Qué Podemos Mejorar

- [Área de mejora]

## Action Items

| Acción     | Responsable | Deadline |
| ---------- | ----------- | -------- |
| [Acción 1] | [Nombre]    | [Fecha]  |
| [Acción 2] | [Nombre]    | [Fecha]  |
```

---

## Checklist Final

### Monitoreo Configurado

- [ ] Sentry instalado y configurado
- [ ] User context configurado
- [ ] Release tracking habilitado
- [ ] Source maps subidos
- [ ] Alertas configuradas
- [ ] Slack/Email integrado

### Smoke Tests

- [ ] Tests creados para funcionalidad crítica
- [ ] CI/CD ejecuta tests post-deploy
- [ ] Alertas si tests fallan

### Incident Response

- [ ] Playbook documentado
- [ ] Equipo sabe qué hacer
- [ ] Canales de comunicación definidos
- [ ] Template de post-mortem listo

---

## Comandos Útiles

```bash
# Ver logs de producción
vercel logs [deployment-url]

# Ver errores recientes en Sentry
sentry-cli issues list --project [project]

# Ejecutar smoke tests
PRODUCTION_URL=https://tu-dominio.com bun run test:smoke

# Ver métricas de Vercel
vercel analytics
```

---

## Troubleshooting

| Problema                 | Causa Probable      | Solución                      |
| ------------------------ | ------------------- | ----------------------------- |
| Sentry no recibe errores | DSN incorrecto      | Verificar variable de entorno |
| Source maps no funcionan | Auth token inválido | Regenerar token               |
| Smoke tests fallan       | URL incorrecta      | Verificar PRODUCTION_URL      |
| Alertas no llegan        | Integración rota    | Re-configurar Slack/Email     |

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
