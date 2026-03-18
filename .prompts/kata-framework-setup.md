# KATA Framework Setup

> **Purpose**: Set up the KATA test automation framework by cloning the boilerplate into a dedicated `qa/` directory, converting the project into a monorepo.
> **When to Use**: When starting test automation in a new or existing project.
> **Output**: `qa/` directory with full KATA framework + adaptation to project.

---

## Overview

This prompt transforms any project into a **monorepo** with dedicated test automation:

```
project/
├── src/                    # Implementation code (existing)
├── qa/                     # Test automation (KATA framework)
│   ├── tests/
│   ├── playwright.config.ts
│   ├── package.json
│   └── ...
├── .context/               # Shared context
└── package.json            # Root package.json
```

**Process:**

1. **Phase 1**: Clone boilerplate into `qa/`
2. **Phase 2**: Clean up and configure
3. **Phase 3**: Adapt to project (authentication, entities)
4. **Phase 4**: Validate setup

---

## Prerequisites

Before starting, verify:

- [ ] Git initialized in project
- [ ] GitHub CLI installed and authenticated (`gh auth status`)
- [ ] Bun runtime installed (`bun --version`)
- [ ] Access to UPEX Galaxy private repos

```bash
# Verify prerequisites
gh auth status
bun --version
git status
```

---

## PHASE 1: Clone Boilerplate

### Step 1.1: Verify Clean State

```bash
# Check if qa/ already exists
[ -d "qa" ] && echo "WARNING: qa/ directory already exists" || echo "OK: Ready to proceed"
```

### Step 1.2: Download Repository (Without Git History)

**Download the KATA boilerplate as a tarball (no git history, no commits from template authors):**

```bash
# Create qa/ directory and download boilerplate without any git history
mkdir -p qa && \
gh api repos/upex-galaxy/ai-driven-test-automation-boilerplate/tarball \
  -H "Accept: application/vnd.github+json" | \
  tar -xz -C qa --strip-components=1
```

> **Why tarball instead of clone?**
>
> - `git clone` brings commit history - template authors would appear in your git log
> - Tarball downloads **only the files** - like GitHub's "Use this template" feature
> - Files appear as "new" when you commit - clean history with only your commits

### Step 1.3: Verify Structure

```bash
tree qa/ -L 2
```

Expected structure:

```
qa/
├── tests/
│   ├── components/
│   ├── setup/
│   ├── e2e/
│   ├── integration/
│   └── utils/
├── config/
├── scripts/
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── ...
```

---

## PHASE 2: Clean Up and Configure

### Step 2.1: Remove Unnecessary Files

Remove files that are project-specific or not needed:

```bash
# Remove example tests (will create project-specific ones)
rm -rf qa/tests/e2e/example
rm -rf qa/tests/integration/example.test.ts

# Remove template-specific files
rm -rf qa/.prompts
rm -rf qa/.books
rm -rf qa/docs
rm -rf qa/templates

# Remove duplicate context (already exists in root .context/)
rm -rf qa/.context

# Remove root-level duplicates
rm -f qa/context-engineering.md
```

### Step 2.2: Create Environment File

```bash
# Copy example to .env
cp qa/.env.example qa/.env

# Edit with project values
echo "Update qa/.env with your project's URLs and credentials"
```

### Step 2.3: Install Dependencies

```bash
cd qa && bun install && cd ..
```

### Step 2.4: Install Playwright Browsers

```bash
cd qa && bunx playwright install chromium && cd ..
```

---

## PHASE 3: Adapt to Project

### Step 3.1: Read Project Context

**Read these files to understand the project (MANDATORY):**

```
.context/
├── SRS/                    # Architecture, API contracts
├── PRD/                    # Features, user journeys
├── idea/                   # Domain glossary
└── api-architecture.md     # If exists
```

**Identify:**

- Project name/prefix for test IDs (e.g., `PROJ`, `APP`)
- Main domain entities (Users, Products, Orders, etc.)
- API base URL
- UI base URL
- Authentication method (OAuth, JWT, API key)
- Login endpoint and flow

### Step 3.2: Read KATA Guidelines

**Read these files to understand KATA patterns (MANDATORY):**

```
.context/guidelines/TAE/
├── KATA-AI-GUIDE.md              # Entry point - concepts overview
├── kata-architecture.md          # 4-layer architecture
├── automation-standards.md       # ATC rules, naming conventions
└── playwright-automation-system.md  # DI, fixtures, session reuse
```

> **Note:** Las guías TAE se leen desde la raíz del proyecto (`.context/guidelines/TAE/`), no desde `qa/`. El directorio `qa/.context/` se elimina durante la limpieza porque es duplicado.

### Step 3.3: Update Configuration

**File:** `qa/config/variables.ts`

Update with project-specific values:

```typescript
export const urlMap = {
  local: 'http://localhost:3000',
  staging: 'https://staging.yourproject.com',  // UPDATE
  production: 'https://yourproject.com',        // UPDATE
};

export const apiUrlMap = {
  local: 'http://localhost:3000/api',
  staging: 'https://api.staging.yourproject.com',  // UPDATE
  production: 'https://api.yourproject.com',        // UPDATE
};
```

**File:** `qa/.env`

```env
# Application URLs
BASE_URL=https://staging.yourproject.com
API_URL=https://api.staging.yourproject.com

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword

# Environment
NODE_ENV=test
```

### Step 3.4: Adapt Authentication Components

**File:** `qa/tests/components/api/AuthApi.ts`

Update the authentication endpoint and request format:

```typescript
// Update endpoint
private readonly endpoints = {
  login: '/auth/login',  // UPDATE to your project's endpoint
  // ...
};

// Update request body format if needed
@atc('PROJ-API-AUTH-001')
async authenticateSuccessfully(credentials: LoginCredentials) {
  // Adapt to your API's expected format
}
```

**File:** `qa/tests/components/ui/LoginPage.ts`

Update locators to match your login form:

```typescript
// Update locators
readonly emailInput = () => this.page.getByTestId('email');        // UPDATE
readonly passwordInput = () => this.page.getByTestId('password');  // UPDATE
readonly submitButton = () => this.page.getByRole('button', { name: 'Login' });  // UPDATE

// Update success assertion
@atc('PROJ-UI-AUTH-001')
async loginSuccessfully(email: string, password: string) {
  await this.goto();
  await this.emailInput().fill(email);
  await this.passwordInput().fill(password);
  await this.submitButton().click();
  await expect(this.page).toHaveURL(/dashboard/);  // UPDATE to your success URL
}
```

### Step 3.5: Create First Domain Component

Based on project entities, create the first component:

**API Component:** `qa/tests/components/api/{Entity}Api.ts`

```typescript
import { ApiBase } from '@api/ApiBase';
import { atc } from '@utils/decorators';

export class {Entity}Api extends ApiBase {
  private readonly endpoints = {
    list: '/api/{entities}',
    get: (id: string) => `/api/{entities}/${id}`,
    create: '/api/{entities}',
  };

  @atc('PROJ-API-001')
  async get{Entity}Successfully(id: string) {
    const [response, body] = await this.apiGET(this.endpoints.get(id));
    expect(response.status()).toBe(200);
    return [response, body];
  }
}
```

**UI Component:** `qa/tests/components/ui/{Entity}Page.ts`

```typescript
import { UiBase } from '@ui/UiBase';
import { atc } from '@utils/decorators';

export class {Entity}Page extends UiBase {
  async goto() {
    await this.page.goto('/{entities}');
  }

  @atc('PROJ-UI-001')
  async view{Entity}ListSuccessfully() {
    await this.goto();
    await expect(this.page.getByTestId('{entity}-list')).toBeVisible();
  }
}
```

### Step 3.6: Update Fixtures

**File:** `qa/tests/components/ApiFixture.ts`

```typescript
import { {Entity}Api } from '@api/{Entity}Api';

// Add to class
{entity}: {Entity}Api;

// Add to constructor
this.{entity} = new {Entity}Api(options);
```

**File:** `qa/tests/components/UiFixture.ts`

```typescript
import { {Entity}Page } from '@ui/{Entity}Page';

// Add to class
{entity}Page: {Entity}Page;

// Add to constructor
this.{entity}Page = new {Entity}Page(options);
```

---

## PHASE 4: Validate Setup

### Step 4.1: TypeScript Check

```bash
cd qa && bun run type-check && cd ..
```

### Step 4.2: Lint Check

```bash
cd qa && bun run lint && cd ..
```

### Step 4.3: Run Auth Setup

```bash
# Test API authentication
cd qa && bun run test --project=api-setup && cd ..

# Test UI authentication
cd qa && bun run test --project=ui-setup && cd ..
```

### Step 4.4: Run Smoke Test

```bash
cd qa && bun run test --grep @smoke && cd ..
```

---

## PHASE 5: Monorepo Configuration

Esta fase configura el repositorio como un monorepo correctamente aislado, para que VS Code, TypeScript, ESLint y otras herramientas reconozcan `qa/` como un proyecto independiente.

### Step 5.1: Crear archivo .code-workspace

**Crear archivo `[nombre-repo].code-workspace` en la raíz del proyecto:**

1. Obtener el nombre del repositorio:

```bash
# Obtener nombre del repo
REPO_NAME=$(basename $(git rev-parse --show-toplevel))
echo "Nombre del repo: $REPO_NAME"
```

2. Crear el archivo con el nombre correcto:

```bash
# El archivo DEBE tener el nombre del repo como prefijo
# Ejemplo: my-app.code-workspace
```

3. Estructura del archivo:

```json
{
  "folders": [
    { "path": ".", "name": "[Nombre del Proyecto] (App)" },
    { "path": "./qa", "name": "QA (Playwright)" }
  ]
}
```

**Reglas importantes:**

- El nombre DEBE tener prefijo del repo (ej: `my-app.code-workspace`)
- Un archivo llamado solo `.code-workspace` NO es válido y VS Code no lo detectará
- Usar rutas relativas, no absolutas
- Si existen otras subcarpetas con `package.json` (frontend, backend), agregarlas como entradas separadas
- NO agregar `settings`, `extensions` ni `tasks` si cada carpeta ya tiene su propio `.vscode/`
- Este archivo DEBE commitearse (no va en .gitignore)

**Ejemplo para un repo llamado `my-app`:**

```json
{
  "folders": [
    { "path": ".", "name": "App (Next.js)" },
    { "path": "./qa", "name": "QA (Playwright)" }
  ]
}
```

### Step 5.2: Excluir qa/ del tsconfig.json de la raíz

**Editar `tsconfig.json` en la raíz para que ignore `qa/`:**

1. Leer el archivo existente primero
2. Agregar `"qa"` al array `"exclude"`

**Asegurar que `exclude` incluya qa/:**

```json
{
  "exclude": ["node_modules", "qa"]
}
```

> **IMPORTANTE:**
>
> - Leer el archivo antes de modificar para no perder configuraciones existentes.
> - **NO agregar `references`** apuntando a `./qa`. Son proyectos completamente independientes con sus propias dependencias y tipos (Playwright vs React/Next.js). El acoplamiento vía `references` causa más problemas de los que resuelve.
> - `qa/` tiene su propio `tsconfig.json` autónomo — solo necesitamos que el tsconfig raíz lo ignore.

### Step 5.3: Verificar tsconfig.json dentro de /qa

**Verificar `qa/tsconfig.json`:**

1. Confirmar que NO extiende el `tsconfig.json` de la raíz si las configuraciones son distintas
2. Playwright requiere sus propios tipos - si hay conflicto de tipos, usar config autónomo
3. Si extiende y genera errores, reemplazar la extensión por configuración independiente

```bash
# Verificar si extiende el tsconfig raíz
grep -n "extends" qa/tsconfig.json
```

Si hay conflictos, el `qa/tsconfig.json` debe ser autónomo (sin `extends`).

### Step 5.4: Agregar root: true a ESLint de /qa

**Configurar ESLint en qa/ para que no escale al config de la raíz:**

1. Buscar archivo ESLint existente:

```bash
ls qa/.eslintrc* qa/eslint.config.* 2>/dev/null
```

2. Si existe un archivo ESLint, agregar `"root": true`

**Para `.eslintrc.json`:**

```json
{
  "root": true,
  // ... resto de la configuración
}
```

**Para `eslint.config.js` (flat config):**

```javascript
export default [
  {
    // La propiedad root no aplica en flat config
    // El flat config es root por defecto si está en la carpeta
  },
  // ... resto de la configuración
];
```

3. Si NO existe archivo ESLint en qa/, crear uno mínimo:

```bash
# Crear .eslintrc.json mínimo
echo '{ "root": true }' > qa/.eslintrc.json
```

### Step 5.5: Crear .prettierrc en /qa (si necesario)

**Configurar Prettier en qa/ para aislar el contexto:**

1. Si el proyecto raíz tiene Prettier y `/qa` necesita reglas distintas, crear `qa/.prettierrc`
2. Si las reglas pueden ser las mismas, este paso es opcional pero recomendable

```bash
# Verificar si existe Prettier en la raíz
ls .prettierrc* 2>/dev/null

# Si existe y qa/ no tiene uno propio, crear uno
cp .prettierrc qa/.prettierrc 2>/dev/null || echo "No .prettierrc in root"
```

### Step 5.6: Mover GitHub Actions a la raíz

**Configurar GitHub Actions para que funcionen con el monorepo:**

GitHub **SOLO** lee `.github/workflows/` desde la **RAÍZ** del repositorio. Los workflows en `qa/.github/workflows/` NO funcionarán.

1. Si existen workflows en `qa/.github/workflows/`, moverlos a la raíz:

```bash
# Verificar si existen workflows en qa/
ls qa/.github/workflows/*.yml 2>/dev/null
```

2. Crear o adaptar workflows en `.github/workflows/` con `working-directory: qa`:

**Ejemplo de workflow adaptado (`.github/workflows/smoke.yml`):**

```yaml
name: Smoke Tests

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment'
        required: true
        default: 'staging'

jobs:
  smoke:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: qa  # <-- CRÍTICO: ejecutar desde qa/
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx playwright install chromium
      - run: bun run test --grep @smoke
```

3. Después de migrar, eliminar o ignorar `qa/.github/`:

```bash
rm -rf qa/.github
```

### Step 5.7: Add Scripts to Root package.json

Add convenience scripts to run tests from root:

```json
{
  "scripts": {
    "qa:test": "cd qa && bun run test",
    "qa:test:ui": "cd qa && bun run test:ui",
    "qa:test:e2e": "cd qa && bun run test:e2e",
    "qa:test:integration": "cd qa && bun run test:integration",
    "qa:report": "cd qa && bun run test:report",
    "qa:allure": "cd qa && bun run test:allure"
  }
}
```

### Step 5.8: Verificar .gitignore de qa/

El boilerplate ya incluye su propio `qa/.gitignore` con los ignores necesarios (test-results, node_modules, .auth, etc.). Git respeta `.gitignore` en subdirectorios de forma jerárquica, por lo que **NO es necesario modificar el `.gitignore` de la raíz**.

```bash
# Verificar que qa/.gitignore existe y tiene los ignores correctos
cat qa/.gitignore
```

> **Nota:** Si por alguna razón el boilerplate no trae `.gitignore`, crear uno en `qa/` con los ignores necesarios en lugar de contaminar el `.gitignore` de la raíz.

### Step 5.9: Shared Context

El directorio `qa/` no tiene su propio `.context/` — usa el de la raíz del proyecto. Toda la documentación del proyecto y las guías KATA están centralizadas:

```
.context/
├── SRS/                        # Architecture, API contracts
├── PRD/                        # Features, user journeys
├── idea/                       # Domain glossary
└── guidelines/TAE/             # KATA guidelines (shared)
```

---

## ¿Qué cambia en tu editor ahora?

Esta sección explica al usuario cómo trabajar con el nuevo setup de monorepo en VS Code.

### 1. Cómo abrir el proyecto correctamente

A partir de ahora, abre el repo con:

- **File > Open Workspace from File...**
- Selecciona `[nombre-repo].code-workspace`

El archivo tiene el nombre del repo como prefijo (ej: `my-app.code-workspace`).
Si abres con "Open Folder" como antes, pierdes el beneficio del multi-root.

### 2. Qué cambia en el explorador de archivos

El panel lateral mostrará **dos raíces separadas**:

- La raíz del proyecto (Next.js o similar)
- `/qa` como proyecto independiente

Cada uno con su propio árbol de archivos.

### 3. Por qué desaparecen los errores falsos

Cada extensión (TypeScript, ESLint, Playwright) ahora resuelve:

- Dependencias
- tsconfig
- Configuraciones

...desde la raíz del folder al que pertenece el archivo abierto.
Ya NO escala hacia la raíz del repo buscando configs incorrectos.

### 4. Qué pasa con la búsqueda global

El buscador global (`Ctrl+Shift+F`) sigue funcionando en todo el monorepo.
Para buscar solo en QA, usa `./qa/` en el campo "files to include".

### 5. Extensiones recomendadas

Si `.code-workspace` tiene `extensions.recommendations`, VS Code sugiere instalarlas automáticamente la primera vez.
Útil para onboarding de nuevos miembros.

### 6. El archivo se commitea al repo

El archivo `[nombre-repo].code-workspace` debe estar en control de versiones.
**NO va en .gitignore.** Es el punto de entrada oficial del proyecto.

---

## Quick Setup Script

For rapid deployment, run this script:

```bash
#!/bin/bash
# kata-setup.sh

set -e

echo "🚀 Setting up KATA Framework..."

# Phase 1: Download (without git history)
echo "📦 Downloading boilerplate..."
mkdir -p qa && \
gh api repos/upex-galaxy/ai-driven-test-automation-boilerplate/tarball \
  -H "Accept: application/vnd.github+json" | \
  tar -xz -C qa --strip-components=1

# Phase 2: Clean up
echo "🧹 Cleaning up..."
rm -rf qa/tests/e2e/example qa/tests/integration/example.test.ts
rm -rf qa/.prompts qa/.books qa/docs qa/templates
rm -rf qa/.context
rm -f qa/context-engineering.md

# Phase 3: Install
echo "📥 Installing dependencies..."
cd qa && bun install && cd ..

echo "🎭 Installing Playwright browsers..."
cd qa && bunx playwright install chromium && cd ..

# Phase 4: Environment
echo "⚙️ Creating environment file..."
cp qa/.env.example qa/.env

echo "✅ KATA Framework setup complete!"
echo ""
echo "Next steps:"
echo "1. Update qa/.env with your project URLs and credentials"
echo "2. Update qa/config/variables.ts with your URLs"
echo "3. Adapt authentication in qa/tests/components/api/AuthApi.ts"
echo "4. Adapt login page in qa/tests/components/ui/LoginPage.ts"
echo "5. Run: cd qa && bun run test --project=api-setup"
```

---

## Post-Setup Checklist

- [ ] Boilerplate downloaded to `qa/` (no git history)
- [ ] Unnecessary files cleaned up
- [ ] Dependencies installed (`qa/node_modules/`)
- [ ] Playwright browsers installed
- [ ] `qa/.env` configured with project values
- [ ] `qa/config/variables.ts` updated with URLs
- [ ] `AuthApi.ts` adapted to project's auth endpoint
- [ ] `LoginPage.ts` adapted to project's login form
- [ ] Auth setup tests passing
- [ ] TypeScript compiles without errors
- [ ] Lint passes
- [ ] First domain component created
- [ ] Fixtures updated with new components
- [ ] Root `package.json` has qa scripts (optional)
- [ ] `qa/.gitignore` verified (should come from boilerplate)

---

## Troubleshooting

### Download fails

```bash
# Verify GitHub CLI auth
gh auth status

# Verify repo access
gh repo view upex-galaxy/ai-driven-test-automation-boilerplate

# Alternative: manual download
# 1. Go to https://github.com/upex-galaxy/ai-driven-test-automation-boilerplate
# 2. Click "Code" > "Download ZIP"
# 3. Extract contents into qa/ directory
```

### Auth setup fails

1. Check `qa/.env` has correct credentials
2. Check `AuthApi.ts` endpoint matches your API
3. Check `LoginPage.ts` locators match your form
4. Run with debug: `cd qa && bun run test:debug --project=ui-setup`

### Type errors

```bash
cd qa && bun run type-check
# Check import aliases in tsconfig.json
# Verify all imports use @utils/, @api/, @ui/, etc.
```

---

## Files Reference

### Keep from Boilerplate (Core Framework)

| Directory/File | Purpose |
|----------------|---------|
| `tests/components/` | KATA components (TestContext, ApiBase, UiBase, Fixtures) |
| `tests/setup/` | Authentication setup (global, api, ui) |
| `tests/utils/` | Decorators, reporters, utilities |
| `config/` | Environment variables configuration |
| `scripts/` | KATA manifest, sync scripts |
| `README.md` | QA framework documentation |
| `playwright.config.ts` | Playwright configuration |
| `tsconfig.json` | TypeScript configuration |
| `eslint.config.js` | ESLint configuration |
| `.prettierrc` | Prettier configuration |

### Remove from Boilerplate (Not Needed)

| Directory/File | Reason |
|----------------|--------|
| `.prompts/` | Use root project prompts |
| `.books/` | Use root project books |
| `docs/` | Use root project docs |
| `.context/` | Duplicate of root `.context/` (includes TAE guidelines) |
| `tests/e2e/example/` | Will create project-specific tests |

### Create Per Project

| File | Purpose |
|------|---------|
| `tests/components/api/{Entity}Api.ts` | Domain API components |
| `tests/components/ui/{Entity}Page.ts` | Domain UI components |
| `tests/e2e/{feature}/*.test.ts` | E2E test files |
| `tests/integration/{feature}.test.ts` | Integration test files |

---

**Version**: 2.1
**Last Updated**: 2025-03-12
