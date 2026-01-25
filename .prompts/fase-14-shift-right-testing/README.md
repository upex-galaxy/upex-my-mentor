# Fase 14: Shift-Right Testing

## Propósito

Establecer observabilidad y testing en producción. Incluye monitoreo, smoke tests post-deploy, y playbook de respuesta a incidentes para mantener la salud del sistema en producción.

**Por qué existe esta fase:**

- Detecta problemas que solo aparecen en producción real
- Proporciona visibilidad sobre el comportamiento del sistema
- Permite respuesta rápida ante incidentes
- Completa el ciclo de feedback: código → producción → insights

---

## Pre-requisitos

- Fase 13 completada:
  - Deploy a producción exitoso
  - Smoke tests iniciales pasando
- Infraestructura:
  - Acceso a Vercel/hosting
  - Variables de entorno de producción
- Cuentas de servicios:
  - Sentry (error tracking)
  - Logging service (opcional)

---

## Prompts en Esta Fase

| Orden | Prompt                 | Propósito                     | Cuándo usar              |
| ----- | ---------------------- | ----------------------------- | ------------------------ |
| 1     | `monitoring-setup.md`  | Configurar observabilidad     | Inmediato post-deploy    |
| 2     | `smoke-tests.md`       | Tests automáticos post-deploy | Configuración CI/CD      |
| 3     | `incident-response.md` | Playbook de incidentes        | Documentación del equipo |

---

## Flujo de Ejecución

```
Producción estable (Fase 13)
        ↓
┌───────────────────────────────────────┐
│  [1] Monitoring Setup                  │
├───────────────────────────────────────┤
│                                        │
│  Error Tracking (Sentry):              │
│  - Instalar @sentry/nextjs             │
│  - Configurar DSN                      │
│  - Source maps para debugging          │
│  - User context                        │
│                                        │
│  Logging:                              │
│  - Application logs                    │
│  - API request/response logs           │
│  - Error logs                          │
│  - Performance logs                    │
│                                        │
│  Alertas:                              │
│  - Errores críticos (>10/min)          │
│  - Response time > 5s                  │
│  - API errors > 5% rate                │
│  - Deployment issues                   │
│                                        │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│  [2] Smoke Tests Post-Deploy           │
├───────────────────────────────────────┤
│                                        │
│  Playwright tests automáticos:         │
│  - Homepage loads                      │
│  - API health check                    │
│  - Authentication works                │
│  - Critical flows                      │
│                                        │
│  CI/CD Integration:                    │
│  - Trigger on deployment_status        │
│  - Run after successful deploy         │
│  - Alert if tests fail                 │
│                                        │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│  [3] Incident Response Playbook        │
├───────────────────────────────────────┤
│                                        │
│  Severidad 1 (Critical):               │
│  - Servicio caído completamente        │
│  - Alert → Investigate → Rollback      │
│  - Hotfix → Post-mortem                │
│                                        │
│  Severidad 2 (High):                   │
│  - Funcionalidad parcial               │
│  - Notify → Triage → Fix/Workaround    │
│                                        │
│  Severidad 3 (Medium):                 │
│  - Issue no crítico                    │
│  - Ticket → Backlog → Próximo sprint   │
│                                        │
└───────────────────────────────────────┘
```

---

## Observabilidad Stack

```
┌─────────────────────────────────────────────────────────────┐
│                  OBSERVABILIDAD EN PRODUCCIÓN                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ERROR TRACKING        LOGGING             ALERTS           │
│   ──────────────        ───────             ──────           │
│                                                              │
│   Sentry                Structured logs     Thresholds       │
│   - Exceptions          - Request/Response  - Error rate     │
│   - Stack traces        - Business events   - Latency        │
│   - User context        - Performance       - Availability   │
│   - Source maps         - Debug info        - Deployments    │
│                                                              │
│                    ↓ Datos fluyen hacia ↓                    │
│                                                              │
│              ┌─────────────────────────────┐                 │
│              │      DASHBOARDS + ALERTS     │                 │
│              │                              │                 │
│              │   Métricas en tiempo real   │                 │
│              │   Notificaciones Slack      │                 │
│              │   Email alerts              │                 │
│              └─────────────────────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Smoke Tests con Playwright

```typescript
// tests/smoke/production.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto(process.env.PRODUCTION_URL);
    await expect(page).toHaveTitle(/.*/);
  });

  test('API health check', async ({ request }) => {
    const response = await request.get(`${process.env.PRODUCTION_URL}/api/health`);
    expect(response.status()).toBe(200);
  });

  test('authentication works', async ({ page }) => {
    // Basic auth flow validation
  });
});
```

---

## CI/CD Integration

```yaml
# .github/workflows/smoke-tests.yml
name: Production Smoke Tests

on:
  deployment_status:

jobs:
  smoke-tests:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test tests/smoke/
        env:
          PRODUCTION_URL: ${{ secrets.PRODUCTION_URL }}
```

---

## Severidad de Incidentes

| Severidad        | Definición                     | Tiempo de Respuesta | Acciones                         |
| ---------------- | ------------------------------ | ------------------- | -------------------------------- |
| **1 - Critical** | Servicio completamente caído   | Inmediato (<15 min) | Alert → Rollback → Hotfix        |
| **2 - High**     | Funcionalidad parcial afectada | < 2 horas           | Notify → Triage → Fix/Workaround |
| **3 - Medium**   | Issue no crítico               | < 24 horas          | Ticket → Backlog → Sprint        |

---

## Checklist de Investigación de Incidentes

```
┌─────────────────────────────────────────────────────────────┐
│                 INCIDENT INVESTIGATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DETECT                                                   │
│     - [ ] Check Sentry errors                                │
│     - [ ] Check logs                                         │
│     - [ ] Check monitoring dashboards                        │
│                                                              │
│  2. INVESTIGATE                                              │
│     - [ ] Reproduce locally if possible                      │
│     - [ ] Identify root cause                                │
│     - [ ] Document findings                                  │
│                                                              │
│  3. RESOLVE                                                  │
│     - [ ] Create fix                                         │
│     - [ ] Test fix                                           │
│     - [ ] Deploy fix                                         │
│                                                              │
│  4. VERIFY                                                   │
│     - [ ] Verify resolution in production                    │
│     - [ ] Monitor for recurrence                             │
│     - [ ] Write post-mortem (Sev 1-2)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Output de Esta Fase

- **Sentry configurado:** Error tracking activo con alertas
- **Logs centralizados:** Visibilidad de eventos del sistema
- **Smoke tests:** Validación automática post-deploy
- **Alertas activas:** Notificaciones cuando algo falla
- **Playbook documentado:** Proceso claro de respuesta a incidentes
- **Equipo entrenado:** Todos saben qué hacer ante un incidente

---

## Conexión con el Ciclo Completo

```
Shift-Left (Fase 5)              Shift-Right (Fase 14)
─────────────────                ─────────────────────
Testing ANTES del código    ←→   Testing EN producción

  Test Plans                       Monitoring
  Test Cases                       Smoke Tests
  Prevención                       Detección

              ↓ Feedback loop ↓

        Insights de producción informan
        mejores test plans para el futuro
```

---

## FAQ

**P: ¿Cuánto cuesta Sentry?**
R: Tiene tier gratuito suficiente para proyectos pequeños/medianos. Planes pagos para más volumen.

**P: ¿Qué pasa si los smoke tests fallan?**
R: Depende de la severidad. Si es crítico, activar rollback inmediato. Si no, investigar y decidir.

**P: ¿Necesito post-mortem para todos los incidentes?**
R: Solo para Severidad 1 y 2. Severidad 3 se documenta en el ticket.

**P: ¿Puedo usar otra herramienta en lugar de Sentry?**
R: Sí. Alternativas: LogRocket, Datadog, New Relic. El proceso es similar.

---

## Documentación Relacionada

- **Production Deploy:** `.prompts/fase-13-production-deployment/README.md`
- **Test Automation:** `.prompts/fase-12-test-automation/README.md`
- **Main README:** `.prompts/README.md`
