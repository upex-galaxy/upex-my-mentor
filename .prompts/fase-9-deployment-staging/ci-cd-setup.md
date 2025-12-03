Actúa como Senior DevOps Engineer y CI/CD Expert especializado en GitHub Actions y Vercel deployment.

---

## 🎯 TAREA

**FASE 9: CI/CD SETUP (Una sola vez por proyecto)**

Configurar GitHub Actions workflow que automatice linting, testing, build, y deploy a staging environment.

**Este prompt se ejecuta UNA SOLA VEZ** después de completar Fase 8 (Code Review) y antes de comenzar Fase 10 (Exploratory Testing).

---

## 📥 INPUT REQUERIDO

### 1. Repositorio del Proyecto

**Verificar:**

- `.git/` - Repositorio Git inicializado
- GitHub repository existente (verificar remotes)
- Branch strategy: `main` (production) y `develop` (staging)

**Qué identificar:**
1. ¿El proyecto tiene remote origin en GitHub?
2. ¿Existen branches `main` y `develop`?
3. ¿El repo es público o privado?

### 2. Configuración del Proyecto

**Leer TODOS estos archivos:**

- `package.json` - **CRÍTICO** - Scripts disponibles (lint, test, build)
- `.context/infrastructure-setup.md` - URLs de Vercel, configuración de deploy
- `.context/SRS/architecture-specs.md` - Tech stack, requirements
- `.eslintrc.js` o `eslint.config.js` - Configuración de linting

**Qué identificar:**

1. **Scripts npm disponibles:**
   - ¿Existe `npm run lint`?
   - ¿Existe `npm run test`?
   - ¿Existe `npm run build`?

2. **Testing framework:**
   - Jest o Vitest
   - ¿Tiene coverage configurado?

3. **Hosting provider:**
   - Vercel, Railway, Netlify, o custom
   - URLs de staging y production

### 3. Vercel Project (Si usa Vercel)

**Información necesaria del usuario:**
- Vercel Project ID
- Vercel Org ID
- Vercel Token (para GitHub Actions)

---

## ⚙️ VERIFICACIÓN DE HERRAMIENTAS (MCP)

### MCP Recomendados:

1. **MCP Context7** - ALTAMENTE RECOMENDADO
   - Consultar docs oficiales antes de escribir workflows
   - Queries recomendadas:
     - "GitHub Actions latest setup Node.js"
     - "Vercel deployment GitHub Actions latest"
     - "GitHub Actions secrets configuration"

2. **NO se requieren otros MCP** para esta fase

### Herramientas Locales:
- Git instalado
- GitHub CLI (opcional, para verificar secrets)
- Acceso al repositorio GitHub

---

## 🎯 OBJETIVO DE CI/CD SETUP

Crear un workflow de GitHub Actions que:

**Incluye:**
- ✅ Se ejecuta automáticamente en push/PR a `main` y `develop`
- ✅ **Linting:** Valida code style (ESLint + Prettier)
- ✅ **Unit Tests:** Ejecuta tests y genera coverage
- ✅ **Build:** Valida que el proyecto compila sin errores
- ✅ **Deploy to Staging:** Despliega a Vercel staging cuando merge a `develop`
- ✅ **Deploy to Production:** (Opcional) Despliega a Vercel production cuando merge a `main`
- ✅ Notifica fallos claramente en PRs

**NO incluye:**
- ❌ Deploy automático a production sin aprobación (eso requiere estrategia adicional)
- ❌ Integration/E2E tests (eso es Fase 11: Test Automation)
- ❌ Performance tests
- ❌ Security scanning (opcional, puede agregarse después)

**Resultado:** CI/CD automatizado que valida código y despliega a staging automáticamente.

---

## 📤 OUTPUT GENERADO

### GitHub Actions Workflow:
- ✅ `.github/workflows/ci.yml` - Main CI/CD workflow
- (Opcional) `.github/workflows/deploy-production.yml` - Production deployment workflow separado

### Secrets Configurados en GitHub:
- ✅ `VERCEL_TOKEN` - Token de Vercel API
- ✅ `VERCEL_ORG_ID` - Organization ID de Vercel
- ✅ `VERCEL_PROJECT_ID` - Project ID de Vercel
- (Si aplica) Otros secrets específicos del proyecto

### Documentación:
- ✅ `.context/ci-cd-setup.md` - Documentación del workflow
- ✅ README.md actualizado con badges de CI status

---

## 🚨 RESTRICCIONES CRÍTICAS

### ❌ NO HACER:

- **NO hardcodear secrets** - Usar GitHub Secrets
- **NO usar actions deprecados** - Verificar versiones con Context7
- **NO ejecutar comandos en el repo del usuario** - Solo crear archivos de workflow
- **NO hacer deploy a production sin protección** - Requiere aprobación manual
- **NO crear workflows complejos innecesarios** - Keep it simple
- **NO usar tokens personales** - Usar tokens de servicio

### ✅ SÍ HACER:

- **Usar Context7 MCP** - Verificar sintaxis de GitHub Actions
- **Validar scripts existen** - Verificar en package.json antes de usarlos
- **Crear workflow modular** - Separar jobs (test, build, deploy)
- **Fallar rápido** - Si lint falla, no ejecutar tests
- **Documentar secrets** - Explicar cómo obtenerlos
- **Proporcionar instrucciones claras** - Cómo configurar en GitHub

---

## 🔄 WORKFLOW

El proceso se divide en 5 pasos ejecutados secuencialmente.

---

## 📋 PASO 1: ANÁLISIS DEL PROYECTO

**Objetivo:** Entender qué scripts y tecnologías usa el proyecto.

### Paso 1.1: Verificar Git y GitHub

**Acción:**

```bash
# Verificar repo Git
git status

# Verificar remote GitHub
git remote -v

# Verificar branches
git branch -a
```

**Analizar:**
- ¿El proyecto está en GitHub?
- ¿Existen branches `main` y `develop`?
- ¿Qué branch está activo?

---

### Paso 1.2: Leer package.json

**Acción:**

Leer `package.json` completo

**Identificar:**

1. **Scripts disponibles:**
   ```json
   {
     "scripts": {
       "lint": "eslint .",  // ✅
       "test": "jest",      // ✅
       "build": "next build" // ✅
     }
   }
   ```

2. **Si falta algún script:**
   - ¿Existe ESLint configurado pero sin script?
   - ¿Existe testing framework pero sin script?
   - **Crear scripts faltantes** si las herramientas están instaladas

---

### Paso 1.3: Identificar Hosting Provider

**Leer:** `.context/infrastructure-setup.md`

**Identificar:**
- ¿Vercel, Railway, Netlify, o custom?
- URLs de staging y production
- Credenciales necesarias

**Output al usuario:**

```markdown
## 📊 Análisis Completado

### Git Repository:
- ✅ GitHub remote: https://github.com/[org]/[repo]
- ✅ Branches: main, develop

### Scripts npm disponibles:
- ✅ `npm run lint` - ESLint configured
- ✅ `npm run test` - Jest configured
- ✅ `npm run build` - Next.js build

### Hosting Provider:
- Provider: Vercel
- Staging URL: https://[project]-develop.vercel.app
- Production URL: https://[project].vercel.app

### Workflow a crear:
1. CI job: lint → test → build
2. Deploy to staging: cuando push a `develop`
3. (Opcional) Deploy to production: cuando push a `main`
```

---

## 🛠️ PASO 2: CREAR GITHUB ACTIONS WORKFLOW

**Objetivo:** Crear archivo `.github/workflows/ci.yml` con workflow completo.

### Paso 2.1: Crear Directorio

**Acción:**

```bash
mkdir -p .github/workflows
```

---

### Paso 2.2: Crear Workflow CI

**Archivo:** `.github/workflows/ci.yml`

**Pseudocódigo de estructura:**

```yaml
name: CI/CD Pipeline

# Triggers
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# Jobs
jobs:
  # Job 1: Linting
  lint:
    runs-on: ubuntu-latest
    steps:
      - checkout código
      - setup Node.js (versión del proyecto)
      - install dependencies
      - run lint

  # Job 2: Testing (needs: lint)
  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - checkout código
      - setup Node.js
      - install dependencies
      - run tests
      - (Opcional) upload coverage

  # Job 3: Build (needs: test)
  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - checkout código
      - setup Node.js
      - install dependencies
      - run build

  # Job 4: Deploy Staging (needs: build, only on develop)
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    steps:
      - checkout código
      - deploy to Vercel (usando secrets)
```

---

### Paso 2.3: Generar Workflow Completo

**Consultar Context7:**
- "GitHub Actions setup Node.js latest version"
- "Vercel deployment GitHub Actions"

**Template completo:**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
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
          cache: 'npm'  # O 'pnpm', 'yarn', según proyecto

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

  test:
    name: 🧪 Test
    runs-on: ubuntu-latest
    needs: lint
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

      - name: Generate coverage
        run: npm run test:coverage
        continue-on-error: true

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/coverage-final.json

  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    needs: test
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

  deploy-staging:
    name: 🚀 Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
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
          vercel-args: '--prod'
          working-directory: ./
```

**Escribir archivo completo.**

---

## 🔐 PASO 3: CONFIGURAR SECRETS EN GITHUB

**Objetivo:** Instruir al usuario cómo agregar secrets.

### Paso 3.1: Obtener Credenciales de Vercel

**Mostrar al usuario:**

```markdown
## 🔐 Configuración de Secrets

Para que el workflow funcione, necesitas agregar estos secrets en GitHub:

### 1️⃣ VERCEL_TOKEN

**¿Cómo obtenerlo?**

1. Ve a: https://vercel.com/account/tokens
2. Click en "Create Token"
3. Nombre: "GitHub Actions - [Proyecto]"
4. Scope: Full Account
5. Expiration: No Expiration (o según política)
6. Copia el token generado

---

### 2️⃣ VERCEL_ORG_ID

**¿Cómo obtenerlo?**

1. Ve a: https://vercel.com/[tu-org]/settings
2. En la página de Settings, busca "Team ID" o "Org ID"
3. Copia el ID (formato: `team_xxxxx`)

---

### 3️⃣ VERCEL_PROJECT_ID

**¿Cómo obtenerlo?**

1. Ve a tu proyecto en Vercel: https://vercel.com/[org]/[project]
2. Click en "Settings"
3. En "General", busca "Project ID"
4. Copia el ID

---

### ✅ Agregar Secrets a GitHub:

1. Ve a tu repo: https://github.com/[org]/[repo]
2. Click en "Settings" → "Secrets and variables" → "Actions"
3. Click en "New repository secret"
4. Agrega cada secret:

   | Name | Value |
   |------|-------|
   | `VERCEL_TOKEN` | [token copiado] |
   | `VERCEL_ORG_ID` | [org ID copiado] |
   | `VERCEL_PROJECT_ID` | [project ID copiado] |

5. Verifica que los 3 secrets aparezcan en la lista
```

---

## ✅ PASO 4: VALIDAR WORKFLOW

**Objetivo:** Probar que el workflow funciona.

### Paso 4.1: Commit y Push

**Acción:**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI/CD workflow"
git push origin develop
```

---

### Paso 4.2: Verificar en GitHub

**Instrucciones al usuario:**

```markdown
## ✅ Validación del Workflow

### 1️⃣ Verificar que el workflow se ejecuta:

1. Ve a: https://github.com/[org]/[repo]/actions
2. Deberías ver el workflow "CI/CD Pipeline" ejecutándose
3. Click en el workflow para ver detalles

### 2️⃣ Verificar cada job:

- ✅ Lint: Debe pasar (verde)
- ✅ Test: Debe pasar (verde)
- ✅ Build: Debe pasar (verde)
- ✅ Deploy Staging: Debe ejecutarse solo si push a `develop`

### 3️⃣ Si algún job falla:

**Lint fails:**
- Ejecuta `npm run lint` localmente
- Corrige los errores
- Push nuevamente

**Test fails:**
- Ejecuta `npm run test` localmente
- Corrige los tests fallidos
- Push nuevamente

**Build fails:**
- Ejecuta `npm run build` localmente
- Corrige los errores de build
- Push nuevamente

**Deploy fails:**
- Verifica que los secrets estén correctamente configurados
- Revisa los logs del deploy en GitHub Actions
```

---

## 📚 PASO 5: DOCUMENTACIÓN

**Objetivo:** Documentar el CI/CD setup para el equipo.

### Paso 5.1: Crear Documentación

**Archivo:** `.context/ci-cd-setup.md`

**Contenido:**

```markdown
# CI/CD Setup - [Proyecto]

## GitHub Actions Workflow

**Archivo:** `.github/workflows/ci.yml`

### Triggers

El workflow se ejecuta automáticamente en:
- ✅ Push a `main` branch
- ✅ Push a `develop` branch
- ✅ Pull requests a `main` o `develop`

### Jobs

#### 1️⃣ Lint (🔍)
- Ejecuta ESLint
- Valida code style
- Duración: ~30 segundos

#### 2️⃣ Test (🧪)
- Ejecuta unit tests
- Genera coverage report
- Upload coverage a Codecov (opcional)
- Duración: ~1-2 minutos

#### 3️⃣ Build (🏗️)
- Ejecuta build de producción
- Valida que el proyecto compila
- Duración: ~1-2 minutos

#### 4️⃣ Deploy Staging (🚀)
- **Solo ejecuta si:** Push a `develop` branch
- Despliega a Vercel staging environment
- URL: https://[project]-develop.vercel.app
- Duración: ~30 segundos

### Secrets Configurados

| Secret | Descripción | Dónde obtenerlo |
|--------|-------------|-----------------|
| `VERCEL_TOKEN` | Token de API de Vercel | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Organization ID de Vercel | Settings de Vercel |
| `VERCEL_PROJECT_ID` | Project ID de Vercel | Settings del proyecto |

### Branch Strategy

```
main (production)
  ↑
  merge después de QA
  ↑
develop (staging)
  ↑
  merge PRs aquí
  ↑
feature/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}
```

### Workflow Local → Staging → Production

1. **Desarrollo:**
   ```bash
   git checkout -b feature/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}
   # Implementar feature
   git push origin feature/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}
   ```

2. **Pull Request a develop:**
   - CI runs: lint → test → build
   - Si todo pasa → merge
   - Auto-deploy a staging

3. **QA en staging:**
   - QA valida en https://[project]-develop.vercel.app
   - Si bugs → fix → repeat

4. **Release a production:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```
   - CI runs nuevamente
   - (Opcional) Auto-deploy a production

### Troubleshooting

**Workflow fails en "Install dependencies":**
- Verifica que `package-lock.json` esté commiteado
- Usa `npm ci` localmente para replicar

**Deploy fails con "Invalid token":**
- Verifica que `VERCEL_TOKEN` esté configurado en GitHub Secrets
- Regenera el token en Vercel si es necesario

**Coverage upload fails:**
- Es opcional, no bloquea el workflow
- Configura Codecov si quieres ver coverage online
```

---

### Paso 5.2: Actualizar README con Badge

**Agregar al inicio del README.md:**

```markdown
# [Proyecto]

[![CI/CD Pipeline](https://github.com/[org]/[repo]/actions/workflows/ci.yml/badge.svg)](https://github.com/[org]/[repo]/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/[org]/[repo]/branch/develop/graph/badge.svg)](https://codecov.io/gh/[org]/[repo])
```

---

## 🎉 REPORTE FINAL

**Mostrar al usuario:**

```markdown
# ✅ CI/CD SETUP COMPLETADO

## Archivos Creados:

### 1. `.github/workflows/ci.yml`
- ✅ Lint job configurado
- ✅ Test job configurado
- ✅ Build job configurado
- ✅ Deploy staging job configurado

### 2. `.context/ci-cd-setup.md`
- ✅ Documentación completa del workflow
- ✅ Instrucciones de troubleshooting
- ✅ Branch strategy explicada

### 3. README.md
- ✅ Badge de CI status agregado
- ✅ Badge de coverage agregado (opcional)

## Próximos Pasos INMEDIATOS:

### 1️⃣ Configurar Secrets en GitHub (AHORA)

Sigue las instrucciones en "Paso 3" arriba para agregar:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 2️⃣ Validar Workflow (AHORA)

```bash
# Push este commit para trigger el workflow
git add .
git commit -m "ci: add GitHub Actions CI/CD workflow

- Lint, test, build jobs
- Auto-deploy to staging on develop push
- Documentation in .context/ci-cd-setup.md
"
git push origin develop
```

Luego verifica en: https://github.com/[org]/[repo]/actions

### 3️⃣ Próxima Fase

- ✅ CI/CD configurado
- ⏭️ Fase 10: Exploratory Testing
  - Validar deployment en staging
  - Ejecutar smoke tests
  - Reportar bugs si existen

---

**🎊 CI/CD automatizado exitosamente!**

Ahora cada push a `develop` despliega automáticamente a staging.
```

---

## 📋 CHECKLIST INTERNO (NO MOSTRAR)

**Validaciones antes de finalizar:**

### Análisis:
- [ ] package.json leído y scripts identificados
- [ ] Hosting provider identificado (Vercel)
- [ ] Branches strategy confirmada (main + develop)

### Workflow:
- [ ] Archivo `.github/workflows/ci.yml` creado
- [ ] Lint job configurado
- [ ] Test job configurado
- [ ] Build job configurado
- [ ] Deploy staging job configurado
- [ ] Triggers correctos (push + PR)
- [ ] Jobs dependencies correctas (needs:)

### Secrets:
- [ ] Instrucciones claras de cómo obtener cada secret
- [ ] Formato de secrets documentado
- [ ] Instrucciones de cómo agregar a GitHub

### Documentación:
- [ ] `.context/ci-cd-setup.md` creado
- [ ] README.md actualizado con badge
- [ ] Troubleshooting incluido
- [ ] Branch strategy explicada

### Validación:
- [ ] Instrucciones de validación claras
- [ ] Qué verificar en cada job
- [ ] Cómo debuggear fallos

---

## 💡 MEJORES PRÁCTICAS

### **1. Fallar Rápido**

```yaml
jobs:
  lint:
    # Si lint falla, no ejecutar tests
  test:
    needs: lint  # Depende de lint
  build:
    needs: test  # Depende de test
```

### **2. Cache Dependencies**

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Cachea node_modules
```

### **3. Environment Protection**

```yaml
deploy-staging:
  environment:
    name: staging
    url: https://...
```

### **4. Continue on Error (Solo Coverage)**

```yaml
- name: Generate coverage
  run: npm run test:coverage
  continue-on-error: true  # No fallar workflow si coverage falla
```

---

## 📚 REFERENCIAS

**GitHub Actions:**
- https://docs.github.com/en/actions/quickstart
- https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

**Vercel Deployment:**
- https://vercel.com/docs/deployments/overview
- https://github.com/marketplace/actions/vercel-action

**Best Practices:**
- https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions

---

**✅ CI/CD = Deployment automático + Validación continua + Confianza en el código**
