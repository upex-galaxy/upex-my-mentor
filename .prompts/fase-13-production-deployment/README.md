# Fase 13: Production Deployment

## Propósito

Desplegar código validado a producción de forma segura y controlada. Incluye validaciones pre-deploy, proceso de deploy, y plan de rollback si hay problemas.

**Por qué existe esta fase:**

- Asegura que solo código validado llega a producción
- Establece proceso reproducible de deploy
- Minimiza riesgo con checklists y rollback plan
- Documenta proceso para todo el equipo

---

## Pre-requisitos

- Fase 12 completada:
  - Test automation pasando en staging
  - Smoke tests manuales OK
- Aprobaciones:
  - Code review aprobado
  - QA sign-off
  - PM/Stakeholder approval
- Infraestructura:
  - Variables de producción configuradas
  - Monitoring configurado (Fase 14 parcial)

---

## Prompts en Esta Fase

| Orden | Prompt                    | Propósito                   | Cuándo usar             |
| ----- | ------------------------- | --------------------------- | ----------------------- |
| 1     | `pre-deploy-checklist.md` | Validar que todo está listo | Siempre antes de deploy |
| 2     | `deploy-to-production.md` | Proceso de deploy           | Después del checklist   |
| 3     | `rollback-plan.md`        | Revertir si hay problemas   | Solo si hay issues      |

---

## Flujo de Ejecución

```
Staging validado (Fase 9-12)
        ↓
┌───────────────────────────────────────┐
│  [1] Pre-Deploy Checklist              │
├───────────────────────────────────────┤
│                                        │
│  Tests:                                │
│  - [ ] Unit tests pasando (100%)       │
│  - [ ] Integration tests pasando       │
│  - [ ] E2E tests pasando en staging    │
│  - [ ] Smoke tests manuales OK         │
│                                        │
│  Code Quality:                         │
│  - [ ] Code review aprobado            │
│  - [ ] No TODOs críticos               │
│  - [ ] Linting pasando                 │
│  - [ ] Security scan OK                │
│                                        │
│  Infraestructura:                      │
│  - [ ] Env vars configuradas           │
│  - [ ] Secrets configurados            │
│  - [ ] DB migrations ready             │
│  - [ ] Backup reciente                 │
│                                        │
│  Stakeholders:                         │
│  - [ ] PM aprobó                       │
│  - [ ] QA aprobó                       │
│  - [ ] DevOps listo                    │
│                                        │
└───────────────────────────────────────┘
        ↓ ✅ Todo OK
┌───────────────────────────────────────┐
│  [2] Deploy to Production              │
├───────────────────────────────────────┤
│                                        │
│  Merge a main:                         │
│  git checkout main                     │
│  git pull origin main                  │
│  git merge develop                     │
│  git push origin main                  │
│                                        │
│  Vercel auto-deploya:                  │
│  - Monitorear dashboard                │
│  - Validar build success               │
│                                        │
│  Post-deploy:                          │
│  - Smoke tests automáticos             │
│  - Monitoreo activo (2-4 hrs)          │
│  - Validar métricas de negocio         │
│                                        │
└───────────────────────────────────────┘
        ↓
    ¿Deploy exitoso?
        │
        ├── ✅ SÍ → Producción estable → Fase 14
        │
        └── ❌ NO → Rollback
                    ↓
┌───────────────────────────────────────┐
│  [3] Rollback Plan (si hay problemas)  │
├───────────────────────────────────────┤
│                                        │
│  Trigger rollback si:                  │
│  - Smoke tests fallan                  │
│  - Errores críticos reportados         │
│  - Performance degradada               │
│  - Bug de seguridad                    │
│                                        │
│  Proceso:                              │
│  1. Vercel: Promote previous deploy    │
│  2. Validar producción estable         │
│  3. Investigar causa (RCA)             │
│  4. Fix en develop                     │
│  5. Re-testear en staging              │
│  6. Re-deploy cuando listo             │
│                                        │
└───────────────────────────────────────┘
```

---

## Proceso de Deploy (Vercel)

```bash
# 1. Asegurar que develop está listo
git checkout develop
git pull origin develop

# 2. Merge a main (trigger auto-deploy)
git checkout main
git pull origin main
git merge develop --no-ff -m "Release: [version/feature]"
git push origin main

# 3. Monitorear en Vercel Dashboard
# https://vercel.com/[team]/[project]

# 4. Ejecutar smoke tests post-deploy
npm run test:smoke:production
```

---

## Rollback con Vercel

```bash
# Opción 1: Dashboard
# Vercel Dashboard → Deployments → Previous → "Promote to Production"

# Opción 2: CLI
vercel rollback [previous-deployment-url]

# Opción 3: Git revert
git revert HEAD
git push origin main
```

---

## Output de Esta Fase

- **Código en producción:** URL funcionando
- **Smoke tests pasando:** Validación automática post-deploy
- **Monitoreo activo:** Observabilidad desde el minuto 0
- **RCA documentado:** Si hubo rollback, causa identificada

---

## Siguiente Fase

Con producción estable:

- Proceder a **Fase 14: Shift-Right Testing**
- Configurar observabilidad completa
- Establecer incident response

---

## FAQ

**P: ¿Qué pasa si el deploy falla en build?**
R: Vercel no promoverá el deploy. Fix en develop y re-push a main.

**P: ¿Cuánto tiempo monitorear post-deploy?**
R: Mínimo 2 horas para features menores, 4+ horas para features mayores.

**P: ¿Puedo hacer deploy sin smoke tests automatizados?**
R: Sí, pero ejecuta smoke tests manuales inmediatamente post-deploy.

---

## Documentación Relacionada

- **Staging Deploy:** `.prompts/fase-9-deployment-staging/README.md`
- **Test Automation:** `.prompts/fase-12-test-automation/README.md`
- **Shift-Right:** `.prompts/fase-14-shift-right-testing/README.md`
- **Main README:** `.prompts/README.md`
