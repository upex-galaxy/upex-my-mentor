<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Deployment a Staging - Manual

> **Fase:** 9 - Deployment Staging
> **Tiempo estimado:** 50-90 minutos (setup inicial), 5-10 minutos (deploys posteriores)
> **Herramientas:** GitHub, Vercel/Railway, Terminal

---

## 🎯 Objetivo

Aprender a **configurar CI/CD** con GitHub Actions y **desplegar código a staging** para que QA pueda validar features antes de production.

**Al completar este manual podrás:**

- Configurar GitHub Actions para CI/CD
- Configurar variables de entorno por ambiente
- Desplegar automáticamente a staging
- Ejecutar smoke tests post-deploy

---

## 🔑 Conceptos Clave

### CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     CI/CD PIPELINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Developer Push      GitHub Actions         Staging        │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │   Push a     │    │  Lint ────►  │    │  App        │  │
│   │   develop    │ ─► │  Test ────►  │ ─► │  desplegada │  │
│   │              │    │  Build ───►  │    │  en Vercel  │  │
│   │              │    │  Deploy ──►  │    │             │  │
│   └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                             │
│   Zero intervención manual si todo pasa                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Terminología

| Término            | Definición                                               |
| ------------------ | -------------------------------------------------------- |
| **CI**             | Continuous Integration - Validación automática de código |
| **CD**             | Continuous Deployment - Deploy automático a ambientes    |
| **Staging**        | Ambiente de pre-producción para validación QA            |
| **Production**     | Ambiente real con usuarios finales                       |
| **GitHub Actions** | Servicio de CI/CD integrado en GitHub                    |
| **Workflow**       | Archivo YAML que define el pipeline                      |
| **Job**            | Unidad de trabajo dentro del workflow                    |
| **Secret**         | Variable encriptada para datos sensibles                 |

### Flujo de Branches

```
main (production)
  ↑
  merge después de QA aprobar
  ↑
develop (staging) ←── GitHub Actions despliega aquí
  ↑
  merge PRs aquí
  ↑
feature/STORY-MYM-15-mentor-listing
```

---

## 📋 Pre-requisitos

**Antes de configurar CI/CD:**

- [ ] Repositorio GitHub configurado
- [ ] Branches `main` y `develop` creadas
- [ ] Proyecto en Vercel/Railway creado
- [ ] Scripts npm funcionando: `lint`, `test`, `build`
- [ ] Code Review aprobado (Fase 8)

---

# PARTE 1: Configurar CI/CD (Una Sola Vez)

## Paso 1: Crear Workflow de GitHub Actions

### 1.1 Crear directorio

```bash
mkdir -p .github/workflows
```

### 1.2 Crear archivo de workflow

Crea `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Linting
  lint:
    name: 🔍 Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

  # Job 2: Testing
  test:
    name: 🧪 Test
    runs-on: ubuntu-latest
    needs: lint # Solo ejecuta si lint pasa
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

  # Job 3: Build
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    needs: test # Solo ejecuta si test pasa
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

  # Job 4: Deploy a Staging
  deploy-staging:
    name: 🚀 Deploy to Staging
    runs-on: ubuntu-latest
    needs: build # Solo ejecuta si build pasa
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment:
      name: staging
      url: https://${{ secrets.VERCEL_PROJECT_NAME }}-develop.vercel.app
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
```

### Entendiendo el Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   ESTRUCTURA DEL WORKFLOW                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   on:                    # ¿Cuándo ejecutar?               │
│   ├── push: [main, develop]                                 │
│   └── pull_request: [main, develop]                         │
│                                                             │
│   jobs:                  # ¿Qué ejecutar?                   │
│   ├── lint:                                                 │
│   │   └── runs-on: ubuntu-latest                            │
│   │                                                         │
│   ├── test:                                                 │
│   │   └── needs: lint    # Dependencia                      │
│   │                                                         │
│   ├── build:                                                │
│   │   └── needs: test                                       │
│   │                                                         │
│   └── deploy-staging:                                       │
│       ├── needs: build                                      │
│       └── if: develop && push  # Condición                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Paso 2: Configurar Secrets en GitHub

### 2.1 Obtener credenciales de Vercel

**VERCEL_TOKEN:**

1. Ve a: https://vercel.com/account/tokens
2. Click en "Create Token"
3. Nombre: `GitHub Actions - [Proyecto]`
4. Scope: Full Account
5. Copia el token generado

**VERCEL_ORG_ID:**

1. Ve a: https://vercel.com/[tu-org]/settings
2. Busca "Team ID" o "Org ID"
3. Copia el ID (formato: `team_xxxxx`)

**VERCEL_PROJECT_ID:**

1. Ve a tu proyecto: https://vercel.com/[org]/[project]
2. Click en "Settings"
3. En "General", busca "Project ID"
4. Copia el ID

### 2.2 Agregar Secrets a GitHub

1. Ve a tu repo: `https://github.com/[org]/[repo]`
2. Click en "Settings" → "Secrets and variables" → "Actions"
3. Click en "New repository secret"
4. Agrega cada secret:

| Name                | Value                |
| ------------------- | -------------------- |
| `VERCEL_TOKEN`      | [token copiado]      |
| `VERCEL_ORG_ID`     | [org ID copiado]     |
| `VERCEL_PROJECT_ID` | [project ID copiado] |

5. Verifica que los 3 secrets aparezcan en la lista

---

## Paso 3: Validar Workflow

### 3.1 Commit y Push

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI/CD workflow

- Lint, test, build jobs
- Auto-deploy to staging on develop push
"
git push origin develop
```

### 3.2 Verificar en GitHub

1. Ve a: `https://github.com/[org]/[repo]/actions`
2. Busca el workflow "CI/CD Pipeline"
3. Verifica que cada job esté verde:
   - ✅ Lint
   - ✅ Test
   - ✅ Build
   - ✅ Deploy Staging (solo en push a develop)

---

# PARTE 2: Configurar Variables de Entorno

## Paso 4: Entender Ambientes

### 4.1 Separación por Ambiente

```
┌─────────────────────────────────────────────────────────────┐
│              VARIABLES POR AMBIENTE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   DEVELOPMENT          STAGING            PRODUCTION        │
│   (Local)              (Vercel Preview)   (Vercel Prod)     │
│   ┌──────────┐         ┌──────────┐       ┌──────────┐      │
│   │ .env     │         │ Vercel   │       │ Vercel   │      │
│   │ (local)  │         │ Preview  │       │ Production│     │
│   │          │         │ Scope    │       │ Scope     │     │
│   └──────────┘         └──────────┘       └──────────┘      │
│                                                             │
│   localhost:3000       [project]-develop   [domain].com     │
│   dev DB               staging DB          prod DB          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Variables Típicas

| Variable                   | Development             | Staging                      | Production               |
| -------------------------- | ----------------------- | ---------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL` | dev-project.supabase.co | staging-project.supabase.co  | prod-project.supabase.co |
| `NEXT_PUBLIC_APP_URL`      | localhost:3000          | [project]-develop.vercel.app | [domain].com             |

---

## Paso 5: Configurar Development (Local)

### 5.1 Crear/Actualizar .env

```bash
# Si no existe, copiar del ejemplo
cp .env.example .env
```

### 5.2 Editar .env con valores reales

```env
# =============================================================================
# Supabase (Development)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# ⚠️ NUNCA commitear - está en .gitignore
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# =============================================================================
# App Configuration (Development)
# =============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5.3 Validar localmente

```bash
npm run dev
# Verificar que no hay errores de variables faltantes
```

---

## Paso 6: Configurar Staging (Vercel)

### 6.1 Acceder a Vercel Dashboard

1. Ve a: https://vercel.com/[org]/[project]/settings/environment-variables

### 6.2 Agregar cada variable

Para cada variable, especifica **Scope: Preview**:

| Variable Name                   | Value                                 | Environment |
| ------------------------------- | ------------------------------------- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | https://[staging-project].supabase.co | **Preview** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [anon key staging]                    | **Preview** |
| `SUPABASE_SERVICE_ROLE_KEY`     | [service key staging]                 | **Preview** |
| `NEXT_PUBLIC_APP_URL`           | https://[project]-develop.vercel.app  | **Preview** |

> 💡 **Tip:** "Preview" scope = Solo para deploys de branches no-main (staging)

### 6.3 Guardar cambios

Click "Save" después de cada variable.

---

## Paso 7: Documentar Variables

Crea `.context/environment-variables.md`:

```markdown
# Environment Variables - [Proyecto]

## Development (Local)

**Archivo:** `.env` (gitignored)

| Variable                        | Descripción                   | Ejemplo                 |
| ------------------------------- | ----------------------------- | ----------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase dev | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública              | eyJhbGc...              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role (server-only)    | eyJhbGc...              |
| `NEXT_PUBLIC_APP_URL`           | URL base                      | http://localhost:3000   |

## Staging (Vercel Preview)

**Platform:** Vercel Dashboard → Environment Variables
**Scope:** Preview

[Mismas variables con valores de staging]

## Production (Fase 13)

**Platform:** Vercel Dashboard
**Scope:** Production

⚠️ Configurar en Fase 13

## Cómo Agregar Nueva Variable

1. Agregar a `.env.example`
2. Agregar a `.env` (local)
3. Agregar en Vercel (scope Preview)
4. Documentar aquí
```

---

# PARTE 3: Deploy a Staging

## Paso 8: Deploy Automático (Recomendado)

### 8.1 Workflow Normal

```bash
# 1. Asegúrate de estar en tu feature branch
git checkout feature/STORY-MYM-15-mentor-listing

# 2. Commit tus cambios
git add .
git commit -m "feat: implement mentor listing"

# 3. Push y crea PR a develop
git push origin feature/STORY-MYM-15-mentor-listing
```

### 8.2 En GitHub

1. Crea Pull Request a `develop`
2. GitHub Actions ejecuta: lint → test → build
3. Si CI pasa y PR aprobado → Merge
4. GitHub Actions despliega automáticamente a staging

### 8.3 Monitorear Deploy

1. Ve a: `https://github.com/[org]/[repo]/actions`
2. Busca el workflow reciente
3. Espera que todos los jobs estén verdes (3-7 min)

---

## Paso 9: Obtener URL de Staging

### 9.1 Desde Vercel Dashboard

1. Ve a: https://vercel.com/[org]/[project]
2. En "Deployments", busca el más reciente de `develop`
3. Copia la URL: `https://[project]-develop.vercel.app`

### 9.2 Desde GitHub Actions

1. Click en el workflow completado
2. En el job "Deploy Staging", busca la URL en los logs

---

## Paso 10: Smoke Test Post-Deploy

### 10.1 Checklist Básico

```markdown
## 🔥 Smoke Test - Staging

**URL:** https://[project]-develop.vercel.app

### Validaciones:

1. **Aplicación carga:**
   - [ ] Landing page sin errores 500
   - [ ] No hay errores en browser console (F12)
   - [ ] Assets (CSS, JS, imágenes) cargan

2. **Auth flow (si aplica):**
   - [ ] Signup page accesible
   - [ ] Login page accesible

3. **Navegación:**
   - [ ] Links principales funcionan
   - [ ] No hay 404 en rutas válidas

4. **Database:**
   - [ ] Páginas con data no dan error
   - [ ] Queries funcionan
```

### 10.2 Si hay errores

**Error 500:**

1. Ve a Vercel Dashboard → Logs
2. Identifica el error
3. Común: variable de entorno faltante

**Error de variable:**

1. Verifica en Vercel → Environment Variables
2. Asegura scope "Preview"
3. Re-deploy con:
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy"
   git push origin develop
   ```

---

# PARTE 4: Deploy Manual (Fallback)

## Paso 11: Si CI/CD no está disponible

### 11.1 Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (desde raíz del proyecto)
vercel

# Deploy a staging específicamente
vercel --prod=false
```

### 11.2 Usando Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

---

## 📋 Checklist Final

### CI/CD Setup (Una vez)

- [ ] `.github/workflows/ci.yml` creado
- [ ] Secrets configurados en GitHub (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
- [ ] Workflow ejecuta exitosamente
- [ ] `.context/ci-cd-setup.md` documentado

### Environment Variables (Una vez)

- [ ] `.env` local configurado
- [ ] Variables en Vercel con scope "Preview"
- [ ] `.context/environment-variables.md` documentado

### Deploy (Cada feature)

- [ ] PR merged a develop
- [ ] GitHub Actions ejecutado exitosamente
- [ ] Staging URL funcionando
- [ ] Smoke test pasado

---

## ⚠️ Troubleshooting

### Workflow falla en "Install dependencies"

```
npm ERR! npm ci can only install packages when your package.json
and package-lock.json are in sync
```

**Solución:**

```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: update package-lock.json"
git push
```

### Deploy falla con "Invalid token"

**Solución:**

1. Verifica VERCEL_TOKEN en GitHub Secrets
2. Si expiró, regenera en https://vercel.com/account/tokens
3. Actualiza el secret en GitHub

### Staging muestra errores de variable

**Solución:**

1. Verifica variables en Vercel Dashboard
2. Asegura que scope es "Preview"
3. Trigger re-deploy

### Deploy no se ejecuta

**Problema:** Job "Deploy Staging" se salta

**Solución:**

- Deploy SOLO ejecuta si:
  - Push directo a `develop` (no PR)
  - Evento es `push` (no `pull_request`)
- Merge el PR para trigger deploy

---

## 💡 Tips y Mejores Prácticas

### Siempre Validar Localmente Primero

```bash
# Antes de push
npm run lint && npm run test && npm run build
```

### No Asumir que Deploy Pasó

1. Siempre verificar GitHub Actions
2. Ver logs completos
3. Probar staging URL

### Smoke Test Inmediato

Apenas staging esté ready, abrir URL y validar. No esperar.

### Agregar Badge al README

```markdown
[![CI/CD Pipeline](https://github.com/[org]/[repo]/actions/workflows/ci.yml/badge.svg)](https://github.com/[org]/[repo]/actions)
```

---

## 📚 Recursos Adicionales

**GitHub Actions:**

- [Quickstart](https://docs.github.com/en/actions/quickstart)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

**Vercel:**

- [Deployments](https://vercel.com/docs/deployments/overview)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## 🎯 Próximos Pasos

Después de completar el deploy a staging:

1. **Fase 10: Exploratory Testing** - QA valida features en staging
2. **Fase 11: Test Automation** - Crear integration/E2E tests
3. **Fase 13: Production Deployment** - Deploy a producción

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
