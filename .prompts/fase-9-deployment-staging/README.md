# Fase 9: Deployment & Staging - Despliegue Automático

## 🎯 ¿Qué es esta fase?

La **Fase 9: Deployment & Staging** configura el pipeline de CI/CD y despliega código a staging environment para validación QA.

**Esta fase se ejecuta UNA SOLA VEZ** (setup de CI/CD) y luego AUTOMÁTICAMENTE en cada merge a develop.

**Esta fase se enfoca en:**
- ✅ Configurar GitHub Actions workflow (CI/CD pipeline)
- ✅ Configurar environment variables por ambiente (dev, staging, prod)
- ✅ Desplegar automáticamente a staging cuando merge a `develop`
- ✅ Validar deployment con smoke tests básicos
- ✅ Preparar infraestructura para Fase 10 (Exploratory Testing)

**Esta fase NO incluye:**
- ❌ Deploy a production (eso es Fase 12: Production Deployment)
- ❌ Integration/E2E tests (eso es Fase 11: Test Automation)
- ❌ Exploratory testing completo (eso es Fase 10: Exploratory Testing)
- ❌ Performance testing o security scanning (opcional, puede agregarse después)

---

## 📋 Prompts de esta Fase

| #   | Archivo                 | Descripción                                        | Cuándo ejecutar              | Duración  | MCP Requerido   |
| --- | ----------------------- | -------------------------------------------------- | ---------------------------- | --------- | --------------- |
| 1   | `ci-cd-setup.md`        | Configurar GitHub Actions workflow completo        | UNA vez (después de Fase 8)  | 30-45 min | ✅ Context7      |
| 2   | `environment-config.md` | Configurar env vars separadas por ambiente         | UNA vez (después de ci-cd)   | 15-30 min | ❌ Ninguno       |
| 3   | `deploy-to-staging.md`  | Desplegar código a staging (manual o automático)   | Por cada feature/PR          | 5-10 min  | ❌ Ninguno       |

**Total estimado (setup inicial):** 50-85 minutos

**Después del setup:** Deploy automático en cada merge a `develop` (3-7 minutos por GitHub Actions)

---

## ⚙️ Orden de Ejecución

### **⚠️ ORDEN CRÍTICO - NO ALTERAR (Setup inicial)**

```
1. ci-cd-setup.md           (PRIMERO - Crear GitHub Actions workflow)
                            ↓
2. environment-config.md    (SEGUNDO - Configurar env vars en Vercel/Railway)
                            ↓
3. deploy-to-staging.md     (TERCERO - Trigger primer deploy a staging)
```

### **Por qué este orden:**

**🔹 CI/CD Setup primero:**
- Crea el archivo `.github/workflows/ci.yml`
- Define qué se ejecuta en cada push/PR (lint → test → build → deploy)
- Sin esto, no hay automatización de deploys

**🔹 Environment Config antes de Deploy:**
- Configura variables necesarias en Vercel/Railway (URLs, API keys, etc.)
- Sin esto, el deploy falla porque faltan secrets

**🔹 Deploy to Staging último:**
- Trigger el workflow de GitHub Actions
- Valida que todo funciona end-to-end
- Genera URL de staging para QA

**Flujo natural:**
```
GitHub Actions → Environment Variables → Deploy Automático
   (CI/CD)            (Secrets)             (Staging)
```

**❌ Si haces Deploy sin CI/CD:**
- Deploys manuales cada vez → Propenso a errores humanos
- No hay validación automática (lint/test/build)
- Team no tiene visibilidad de qué se desplegó

**✅ Si haces CI/CD primero:**
- Deploy automático en cada merge → Zero intervention
- CI valida código antes de deploy → Menos bugs en staging
- GitHub Actions logs → Full traceability

---

## 📦 MCP Tools Requeridos

Esta fase requiere los siguientes MCP tools configurados:

| MCP Tool         | Fase que lo usa  | ¿Obligatorio?       | Propósito                                      |
| ---------------- | ---------------- | ------------------- | ---------------------------------------------- |
| **Context7 MCP** | ci-cd-setup.md   | ✅ ALTAMENTE RECOMENDADO | Consultar docs de GitHub Actions y Vercel actualizadas |

**Verificar MCP disponibles:**
```bash
# El AI verificará automáticamente durante ejecución
# Si falta Context7, ci-cd-setup puede usar conocimiento interno (puede estar desactualizado)
```

**Configurar MCP Context7:**
- Documentación: [Context7 Integration](https://context7.ai/docs)

**¿Por qué Context7 es crítico?**
- GitHub Actions cambia frecuentemente (action versions)
- Vercel deployment actions se actualizan
- Context7 asegura usar sintaxis y versiones correctas

---

## 📥 Pre-requisitos

### Antes de ejecutar esta fase, debes tener:

**✅ Fase 8 (Code Review) completada:**
- PR aprobado y listo para merge a `develop`
- Unit tests pasando
- Build local exitoso

**✅ Fase 3 (Infrastructure) completada:**
- `.context/infrastructure-setup.md` - URLs de Vercel/Railway, credenciales
- Proyecto desplegado en Vercel/Railway (aunque sea deploy inicial)

**✅ GitHub Repository configurado:**
- Repositorio GitHub existente
- Branches `main` (production) y `develop` (staging) creadas
- Acceso de escritura al repo (para configurar secrets)

**✅ Herramientas locales instaladas:**
- Git
- Node.js
- npm/pnpm/yarn/bun

**✅ Cuentas y accesos:**
- Cuenta GitHub con acceso al repositorio
- Cuenta Vercel/Railway con proyecto creado
- Capacidad de agregar secrets en GitHub (Settings → Secrets)

**✅ Scripts npm configurados:**
- `package.json` debe tener:
  - `npm run lint` - ESLint configurado
  - `npm run test` - Testing framework (Jest, Vitest, etc.)
  - `npm run build` - Build de producción

---

## 📤 Output Esperado

Al finalizar esta fase tendrás:

### **1. CI/CD Pipeline Configurado:**
- ✅ `.github/workflows/ci.yml` - GitHub Actions workflow completo
- ✅ Workflow triggers: push/PR a `main` y `develop`
- ✅ Jobs secuenciales: lint → test → build → deploy
- ✅ Deploy automático a staging cuando push a `develop`
- ✅ (Opcional) Deploy automático a production cuando push a `main`

### **2. GitHub Secrets Configurados:**
- ✅ `VERCEL_TOKEN` - Token de Vercel API
- ✅ `VERCEL_ORG_ID` - Organization ID de Vercel
- ✅ `VERCEL_PROJECT_ID` - Project ID de Vercel
- ✅ (Si aplica) Otros secrets específicos del proyecto

### **3. Environment Variables por Ambiente:**

**Development (Local):**
- ✅ `.env` - Variables completas para desarrollo local (gitignored)
- ✅ `.env.example` - Template actualizado con todas las variables

**Staging (Vercel/Railway):**
- ✅ Environment variables configuradas con scope "Preview"
- ✅ Variables apuntando a servicios de staging (Supabase staging, etc.)

**Production (Placeholder para Fase 12):**
- ✅ Estructura documentada
- ✅ Variables placeholder en documentación

### **4. Deployment en Staging:**
- ✅ Código desplegado en staging environment
- ✅ Staging URL accesible: `https://[project]-develop.vercel.app`
- ✅ Smoke test básico pasado
- ✅ No hay errores 500 críticos

### **5. Documentación:**
- ✅ `.context/ci-cd-setup.md` - Documentación del workflow
- ✅ `.context/environment-variables.md` - Guía de env vars por ambiente
- ✅ README.md actualizado con badges de CI status

### **6. Badge de CI en README:**
```markdown
[![CI/CD Pipeline](https://github.com/[org]/[repo]/actions/workflows/ci.yml/badge.svg)](https://github.com/[org]/[repo]/actions)
```

---

## 🔄 Escenarios de Uso

### **Escenario 1: Setup Inicial de CI/CD (Primera vez)**

**Situación:** Proyecto no tiene CI/CD configurado, deploys son manuales.

**Flujo:**
1. Ejecuta `ci-cd-setup.md` → Crea GitHub Actions workflow
2. Configura secrets en GitHub (VERCEL_TOKEN, etc.)
3. Ejecuta `environment-config.md` → Configura env vars en Vercel/Railway
4. Ejecuta `deploy-to-staging.md` → Trigger primer deploy automático
5. Valida que workflow funciona (GitHub Actions logs)

**Duración:** 50-85 minutos (setup inicial)

**Output:** CI/CD completamente automatizado, deploys automáticos en cada merge.

**Después de esto:** Cada merge a `develop` despliega automáticamente sin intervención.

---

### **Escenario 2: Deploy de Feature Nueva (Workflow normal)**

**Situación:** CI/CD ya está configurado, quieres desplegar nueva feature.

**Flujo:**
1. Implementa feature en `feature/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}` branch
2. Crea Pull Request a `develop`
3. GitHub Actions ejecuta: lint → test → build (automático)
4. Si CI pasa → Code review (Fase 8)
5. Merge PR a `develop`
6. **GitHub Actions despliega automáticamente a staging** (sin intervención)
7. Valida staging URL

**Duración:** 3-7 minutos (automático por GitHub Actions)

**Nota:** NO necesitas ejecutar `deploy-to-staging.md` manualmente, GitHub Actions lo hace.

---

### **Escenario 3: Deploy Manual (Fallback - CI/CD no disponible)**

**Situación:** GitHub Actions no está configurado o tiene problemas, necesitas desplegar YA.

**Flujo:**
1. Ejecuta `deploy-to-staging.md` → Sigue instrucciones de deploy manual
2. Usa Vercel CLI o Railway CLI para desplegar
3. Valida staging URL

**Duración:** 5-10 minutos (manual)

**Cuándo usar:** Solo como fallback si CI/CD está roto o no configurado.

---

### **Escenario 4: Cambiar Environment Variables en Staging**

**Situación:** Agregaste nueva API key o cambiaste URL de servicio, staging necesita actualización.

**Flujo:**
1. Ejecuta `environment-config.md` → Sección "Cómo Agregar Nueva Variable"
2. Agrega variable en Vercel Dashboard con scope "Preview"
3. Trigger re-deploy:
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy for env var update"
   git push origin develop
   ```
4. GitHub Actions re-despliega con nuevas variables

**Duración:** 5 minutos

---

### **Escenario 5: Debuggear Deploy Fallido**

**Situación:** GitHub Actions muestra "Deploy to Staging" job en rojo.

**Flujo:**
1. Ve a GitHub Actions logs: `https://github.com/[org]/[repo]/actions`
2. Click en workflow fallido → "Deploy to Staging" job
3. Revisa errores:
   - **"Invalid token"** → Verifica `VERCEL_TOKEN` en GitHub Secrets
   - **"Missing env var"** → Ejecuta `environment-config.md` nuevamente
   - **"Build failed"** → Ejecuta `npm run build` localmente, corrige errores
4. Fix el problema
5. Push nuevamente → GitHub Actions re-intenta

**Duración:** Variable (depende del error)

---

## 💡 Conceptos Clave

### **1. CI/CD Pipeline (Continuous Integration / Continuous Deployment)**

**Problema que resuelve:**
- Deploys manuales propensos a errores
- No hay validación automática antes de deploy
- Team no sabe si código está roto hasta después de deploy

**Solución:**
```
Push a develop → GitHub Actions ejecuta:
  1. Lint (valida code style)
  2. Test (valida funcionalidad)
  3. Build (valida que compila)
  4. Deploy (despliega a staging)
```

**Ejemplo de workflow:**
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - checkout código
      - npm run lint  # Si falla, se detiene aquí

  test:
    needs: lint  # Solo ejecuta si lint pasó
    steps:
      - npm run test  # Si falla, no despliega

  build:
    needs: test  # Solo ejecuta si test pasó
    steps:
      - npm run build

  deploy-staging:
    needs: build  # Solo despliega si todo lo anterior pasó
    if: github.ref == 'refs/heads/develop'
    steps:
      - Deploy to Vercel staging
```

**Beneficio:** Si lint o test falla, NO se despliega código roto a staging.

---

### **2. Environment Variables por Ambiente**

**Problema que resuelve:**
- Usar mismas credenciales en dev, staging y production → Riesgo de contaminar prod
- Hardcodear URLs/keys en código → Security risk

**Solución:**
```
Development:   NEXT_PUBLIC_API_URL=http://localhost:3000
               SUPABASE_URL=https://dev-project.supabase.co

Staging:       NEXT_PUBLIC_API_URL=https://[project]-develop.vercel.app
               SUPABASE_URL=https://staging-project.supabase.co

Production:    NEXT_PUBLIC_API_URL=https://[domain].com
               SUPABASE_URL=https://prod-project.supabase.co
```

**Cada ambiente tiene:**
- URLs diferentes
- Database separada (dev DB, staging DB, prod DB)
- API keys diferentes

**Beneficio:** Cambios en staging NO afectan production.

---

### **3. Staging Environment (Pre-production)**

**¿Qué es staging?**
- Copia casi idéntica de production
- Donde QA valida features antes de production
- Conectado a staging database (no production)

**URL típica:**
- Staging: `https://[project]-develop.vercel.app`
- Production: `https://[project].vercel.app` o `https://[domain].com`

**Flujo de datos:**
```
Feature branch → develop → Staging → QA valida → main → Production
```

**Beneficio:** Bugs se descubren en staging, NO en production.

---

### **4. GitHub Secrets (Encrypted Variables)**

**Problema que resuelve:**
- No puedes hardcodear API keys en código (security risk)
- No puedes commitear `.env` a Git (exposed secrets)

**Solución:**
- Guardas secrets en GitHub Settings → Secrets
- GitHub Actions accede a ellos via `${{ secrets.VERCEL_TOKEN }}`
- Nunca aparecen en logs (GitHub los oculta)

**Ejemplo:**
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}  # ✅ Encrypted
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
```

**Beneficio:** Secrets nunca se exponen en código o logs.

---

### **5. Smoke Test Post-Deploy**

**¿Qué es smoke test?**
- Validación rápida de que deployment funciona básicamente
- NO es testing completo (eso es Fase 10)
- Solo verifica: "¿La app carga sin errores 500?"

**Checklist típico:**
```markdown
Smoke Test - Staging:
- [ ] Landing page carga sin errores 500
- [ ] No hay errores en browser console (F12)
- [ ] Assets (CSS, JS, images) cargan correctamente
- [ ] Auth pages accesibles (signup/login)
- [ ] Database connection funciona (páginas que usan DB no dan error)
```

**Duración:** 2-3 minutos

**Beneficio:** Detecta errores críticos inmediatamente después de deploy.

---

## 🔍 Validaciones Post-Ejecución

### **Checklist de Validación:**

**Después de `ci-cd-setup.md`:**
- [ ] Archivo `.github/workflows/ci.yml` existe y está completo
- [ ] Secrets configurados en GitHub (Settings → Secrets):
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
- [ ] Push a `develop` trigger GitHub Actions automáticamente
- [ ] Workflow ejecuta jobs: lint → test → build → deploy
- [ ] `.context/ci-cd-setup.md` documentado
- [ ] README.md tiene badge de CI status

**Verificar en GitHub:**
1. Ve a: `https://github.com/[org]/[repo]/actions`
2. Deberías ver workflow "CI/CD Pipeline" ejecutándose o completado
3. Todos los jobs deben estar verdes (✅)

---

**Después de `environment-config.md`:**
- [ ] `.env` existe localmente con valores de development
- [ ] `.env.example` actualizado con todas las variables
- [ ] Variables configuradas en Vercel Dashboard con scope "Preview":
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `.context/environment-variables.md` creado
- [ ] `npm run dev` local funciona sin errores de env vars

**Verificar en Vercel:**
1. Ve a: `https://vercel.com/[org]/[project]/settings/environment-variables`
2. Variables deben aparecer con scope "Preview"
3. Valores deben ser diferentes a production (si existe)

---

**Después de `deploy-to-staging.md`:**
- [ ] Feature branch merged a `develop` (o push directo)
- [ ] GitHub Actions workflow ejecutado exitosamente
- [ ] Deployment completado en Vercel/Railway
- [ ] Staging URL accesible: `https://[project]-develop.vercel.app`
- [ ] Smoke test básico pasado:
  - [ ] Aplicación carga sin errores 500
  - [ ] No hay errores en browser console
  - [ ] Assets cargan correctamente
  - [ ] Database connection funciona

**Verificar en Vercel:**
1. Ve a: `https://vercel.com/[org]/[project]`
2. En "Deployments", busca deployment más reciente de `develop`
3. Status debe ser "Ready" (verde)
4. Click en URL para validar

---

## 🚨 Problemas Comunes y Soluciones

### **Problema 1: Workflow falla en "Install dependencies"**

**Error en GitHub Actions:**
```
npm ERR! code ENOLOCK
npm ERR! npm ci can only install packages when your package.json and package-lock.json are in sync
```

**Solución:**
1. Localmente ejecuta:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "fix: update package-lock.json"
   git push origin develop
   ```
2. GitHub Actions re-ejecuta automáticamente

---

### **Problema 2: Deploy falla con "Invalid token"**

**Error en GitHub Actions:**
```
Error: Invalid Vercel token
```

**Solución:**
1. Verifica que `VERCEL_TOKEN` está configurado en GitHub Secrets:
   - Ve a: `https://github.com/[org]/[repo]/settings/secrets/actions`
   - Debe aparecer `VERCEL_TOKEN` en la lista
2. Si no existe, crea nuevo token en Vercel:
   - Ve a: `https://vercel.com/account/tokens`
   - Create Token → Copia el token
   - Agrega a GitHub Secrets
3. Re-run GitHub Actions workflow

---

### **Problema 3: Staging carga pero con errores en console**

**Error en browser console (F12):**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

**Solución:**
1. Verifica variables en Vercel Dashboard:
   - Ve a: `https://vercel.com/[org]/[project]/settings/environment-variables`
   - `NEXT_PUBLIC_SUPABASE_URL` debe existir con scope "Preview"
2. Si falta, agrégala:
   - Add Variable → Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://[staging-project].supabase.co`
   - Environment: **Preview** (NO Production)
3. Trigger re-deploy:
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy"
   git push origin develop
   ```

---

### **Problema 4: CI pasa pero deploy no se ejecuta**

**GitHub Actions muestra:**
- ✅ Lint (verde)
- ✅ Test (verde)
- ✅ Build (verde)
- ⏭️ Deploy Staging (skip)

**Solución:**
1. Verifica condición en `.github/workflows/ci.yml`:
   ```yaml
   deploy-staging:
     if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
   ```
2. Deploy SOLO ejecuta si:
   - Push directo a `develop` (no PR)
   - Evento es `push` (no `pull_request`)
3. Si hiciste PR a develop, necesitas **merge** el PR para trigger deploy

---

### **Problema 5: Auth redirect no funciona en staging**

**Error:** Después de login en staging, redirect falla.

**Solución:**
1. Agrega staging URL a Supabase redirect URLs:
   - Ve a Supabase Dashboard → Authentication → URL Configuration
   - Redirect URLs debe incluir:
     - `http://localhost:3000/**` (dev)
     - `https://[project]-develop.vercel.app/**` (staging)
2. Guarda cambios en Supabase
3. Re-testea auth flow en staging

---

### **Problema 6: Build falla con TypeScript errors**

**Error en GitHub Actions:**
```
Type error: Property 'email' does not exist on type 'User'
```

**Solución:**
1. Ejecuta localmente:
   ```bash
   npm run build
   ```
2. Corrige errores TypeScript
3. Valida que pasa:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```
4. Push fix:
   ```bash
   git add .
   git commit -m "fix: resolve TypeScript errors"
   git push origin develop
   ```

---

## 🎓 Mejores Prácticas

### **1. Ejecuta CI/CD Setup SOLO una vez**

**❌ NO hacer:**
- Re-ejecutar `ci-cd-setup.md` por cada feature
- Crear múltiples workflows para mismo propósito

**✅ SÍ hacer:**
- Ejecutar `ci-cd-setup.md` una vez después de Fase 3 (Infrastructure)
- Después, GitHub Actions maneja deploys automáticamente
- Si necesitas modificar workflow, edita `.github/workflows/ci.yml` directamente

---

### **2. Separar Variables por Ambiente (CRÍTICO)**

**❌ NO hacer:**
```
# Usar misma DB en dev, staging y prod
SUPABASE_URL=https://prod-project.supabase.co  # ⚠️ PELIGRO
```

**✅ SÍ hacer:**
```
Development:  SUPABASE_URL=https://dev-project.supabase.co
Staging:      SUPABASE_URL=https://staging-project.supabase.co
Production:   SUPABASE_URL=https://prod-project.supabase.co
```

**Por qué:** Evita que cambios en staging contaminen production data.

---

### **3. Smoke Test INMEDIATO después de Deploy**

**Workflow recomendado:**
```bash
# 1. Merge PR a develop
git checkout develop
git merge feature/STORY-123
git push origin develop

# 2. Esperar GitHub Actions (~5 min)

# 3. Abrir staging URL INMEDIATAMENTE
https://[project]-develop.vercel.app

# 4. Smoke test básico:
# - ✅ App carga
# - ✅ No hay errores 500
# - ✅ Console sin errores críticos
```

**Beneficio:** Detectas errores en 5 minutos, NO en 2 horas después de QA reportar.

---

### **4. Monitorear GitHub Actions Logs**

**No asumas que deployment pasó.**

**Checklist:**
1. Push a develop
2. Ve a: `https://github.com/[org]/[repo]/actions`
3. Espera a que workflow complete (3-7 min)
4. Verifica todos los jobs están verdes (✅)
5. **Solo entonces** valida staging URL

**Si algún job falla:**
- Click en job rojo
- Lee logs completos
- Identifica error específico
- Fix y push nuevamente

---

### **5. Commitea después de cada prompt**

**Después de `ci-cd-setup.md`:**
```bash
git add .github/workflows/ci.yml .context/ci-cd-setup.md
git commit -m "ci: configure GitHub Actions CI/CD pipeline

- Lint, test, build jobs
- Auto-deploy to staging on develop push
- Secrets documented in ci-cd-setup.md
"
git push origin develop
```

**Después de `environment-config.md`:**
```bash
git add .env.example .context/environment-variables.md
git commit -m "chore: configure environment variables per environment

- Dev, staging, production variables documented
- .env.example updated
"
git push origin develop
```

**Beneficio:** Trazabilidad clara de qué cambió y cuándo.

---

### **6. Protege `main` branch**

**Configurar GitHub Branch Protection:**
1. Ve a: `https://github.com/[org]/[repo]/settings/branches`
2. Add rule para `main` branch:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass (CI/CD)
   - ✅ Require approvals (mínimo 1)
3. Save changes

**Beneficio:** Código roto NUNCA llega a production.

---

## 🔄 Próximos Pasos

**Después de completar Fase 9:**

### **1. Fase 10: Exploratory Testing (QA en Staging)**

**Prompts disponibles:**
```bash
.prompts/fase-10-exploratory-testing/smoke-test.md       # Smoke test completo
.prompts/fase-10-exploratory-testing/test-charter.md     # Planear sesión exploratoria
.prompts/fase-10-exploratory-testing/session-notes.md    # Documentar hallazgos
.prompts/fase-10-exploratory-testing/bug-report.md       # Reportar bugs encontrados
```

**Objetivo:** QA valida features en staging, reporta bugs.

**Staging URL:** `https://[project]-develop.vercel.app`

---

### **2. Si QA encuentra bugs → Fix Loop:**

```
Bug encontrado en staging
    ↓
Fix en feature branch
    ↓
Code review (Fase 8)
    ↓
Merge a develop
    ↓
GitHub Actions re-despliega a staging (automático)
    ↓
QA re-valida
    ↓
Si OK → Fase 11 (Test Automation)
```

---

### **3. Fase 11: Test Automation (Integration & E2E Tests)**

**Después de QA aprobar staging:**
- Crear integration tests (API tests)
- Crear E2E tests (Playwright, Cypress)
- Agregar tests al CI/CD pipeline

---

### **4. Fase 12: Production Deployment**

**Cuando features están estables en staging:**
- Configurar environment variables de production
- Merge `develop` → `main`
- GitHub Actions despliega a production
- Smoke test en production

---

## 📚 Referencias

**Prompts validados:**
- `.prompts/fase-2-architecture/prd-executive-summary.md` - Patrón de prompt validado
- `.prompts/fase-3-infrastructure/README.md` - README de referencia

**Specs técnicas:**
- `.context/SRS/architecture-specs.md` - Arquitectura del proyecto
- `.context/infrastructure-setup.md` - URLs y credenciales

**Guidelines:**
- `.context/guidelines/git-flow.md` - Git workflow strategy
- `.context/guidelines/testing-strategy.md` - Testing strategy completa

**Documentación externa:**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Railway Deployment](https://docs.railway.app/deploy/deployments)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

## 📊 Métricas de Éxito

**Al completar esta fase exitosamente:**

✅ **CI/CD automatizado:**
- Cada merge a `develop` despliega a staging automáticamente
- Zero deploys manuales necesarios
- CI valida código antes de desplegar

✅ **Environment variables correctas:**
- Development, Staging, Production separados
- No hay crossover de datos entre ambientes
- Secrets nunca expuestos en código

✅ **Staging accesible:**
- URL funcional: `https://[project]-develop.vercel.app`
- Smoke test pasa
- Listo para QA (Fase 10)

✅ **Documentación completa:**
- `.context/ci-cd-setup.md` - Cómo funciona el pipeline
- `.context/environment-variables.md` - Guía de env vars
- README.md con CI badge

✅ **Team tiene visibilidad:**
- GitHub Actions logs muestran qué se desplegó
- Badge de CI en README muestra status
- Staging URL accesible para todo el team

---

## 💡 Tips Avanzados

### **Tip 1: Configurar Codecov (Coverage Reporting)**

**¿Para qué?** Ver test coverage online, integrado con PRs.

**Cómo:**
1. Crea cuenta en: https://codecov.io
2. Conecta repo GitHub
3. Agrega a `.github/workflows/ci.yml`:
   ```yaml
   - name: Upload coverage
     uses: codecov/codecov-action@v3
     with:
       files: ./coverage/coverage-final.json
   ```
4. Badge en README:
   ```markdown
   [![Coverage](https://codecov.io/gh/[org]/[repo]/branch/develop/graph/badge.svg)](https://codecov.io/gh/[org]/[repo])
   ```

---

### **Tip 2: Notificaciones de Deploy en Slack**

**¿Para qué?** Team recibe notificación cuando deploy a staging completa.

**Cómo:**
1. Crea Slack webhook: https://api.slack.com/messaging/webhooks
2. Agrega secret `SLACK_WEBHOOK` en GitHub
3. Agrega step a workflow:
   ```yaml
   - name: Notify Slack
     if: success()
     run: |
       curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
       -H 'Content-Type: application/json' \
       -d '{"text":"✅ Deploy to staging complete: https://[project]-develop.vercel.app"}'
   ```

---

### **Tip 3: Preview Deploys en PRs (Vercel automático)**

**¿Qué es?** Vercel crea deployment único por cada PR.

**Beneficio:**
- Code reviewer puede ver cambios en vivo
- No espera a merge para validar UI

**Cómo funciona:**
- Vercel detecta PR automáticamente
- Crea deploy con URL única: `https://[project]-pr-123.vercel.app`
- Comenta URL en el PR

**Zero config necesario** si usas Vercel + GitHub integration.

---

### **Tip 4: Rollback Automático si Deploy Falla**

**¿Para qué?** Si deploy a staging falla, mantener versión anterior funcionando.

**Cómo:**
1. Vercel automáticamente mantiene deployment anterior activo
2. Si nuevo deploy falla, URL sigue apuntando a versión previa
3. Fix error → Push → Re-deploy automático

**No necesitas configurar nada**, Vercel lo hace por defecto.

---

**✅ Fase 9 completada = Deploy automático + Staging funcional + Listo para QA**
