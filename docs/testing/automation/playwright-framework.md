# Playwright Projects - Guía Completa

> Este documento explica cómo funcionan los proyectos de Playwright, su configuración, y cómo usarlos efectivamente en el Framework KATA.

---

## ¿Qué son los Projects?

Los Projects son **configuraciones de test independientes** dentro de un único setup de Playwright. Cada proyecto puede tener:

- Su propio `testMatch` (qué archivos ejecutar)
- Su propio `testDir` (dónde buscar tests)
- Sus propias `dependencies` (qué debe correr antes)
- Su propio `teardown` (qué corre después de que este proyecto y sus dependientes terminen)
- Su propia configuración `use` (browser, viewport, estado de auth, etc.)

Piensa en los projects como **configuraciones nombradas** que pueden encadenarse.

---

## Nuestra Estructura de Projects

```
┌─────────────────────────────────────┐
│  global-setup                       │  Corre PRIMERO - crea directorios, valida env
│  (teardown: 'global-teardown')      │  ← Enlaza al proyecto teardown
└────────────────┬────────────────────┘
                 │
            ┌────┴────┐
            ▼         ▼
      ┌────────┐ ┌─────────┐
      │ui-setup│ │api-setup│  Auth setup - guarda sesión/token
      └────┬───┘ └────┬────┘
           │         │
           ▼         ▼
      ┌────────┐ ┌───────────┐
      │  e2e   │ │integration│  Tests actuales
      └────────┘ └───────────┘
                 │
                 ▼ (después de que TODOS los dependientes completen)
         ┌──────────────┐
         │global-teardown│  Corre ÚLTIMO - cleanup, sync TMS
         └──────────────┘
```

---

## Configuración de Projects

### Global Setup Project

```typescript
{
  name: 'global-setup',
  testMatch: /global\.setup\.ts/,
  testDir: './tests/setup',
  teardown: 'global-teardown',  // ← Activa teardown después de que todos los dependientes terminen
}
```

### Auth Setup Projects

```typescript
{
  name: 'ui-setup',
  testMatch: /ui-auth\.setup\.ts/,
  testDir: './tests/setup',
  dependencies: ['global-setup'],
}
```

### Test Projects

```typescript
{
  name: 'e2e',
  testMatch: '**/e2e/**/*.test.ts',
  dependencies: ['ui-setup'],
  use: {
    storageState: config.auth.storageStatePath,
  },
}
```

---

## Cómo Funcionan las Dependencies

Cuando ejecutas un proyecto, Playwright automáticamente resuelve y ejecuta sus dependencias:

```bash
# Ejecutando proyecto e2e
bun run test --project=e2e

# Playwright ejecuta en orden:
# 1. global-setup (dependencia de ui-setup)
# 2. ui-setup (dependencia de e2e)
# 3. e2e (el proyecto solicitado)
# 4. global-teardown (teardown de global-setup, corre después de todos los dependientes)
```

**Puntos clave:**

- Las dependencies se resuelven recursivamente (hacia arriba)
- Cada dependencia corre solo una vez (aunque múltiples proyectos dependan de ella)
- Si una dependencia falla, los proyectos dependientes se saltan
- **Teardown corre después de que el proyecto setup Y todos sus dependientes completen**

---

## Ejecutando Tests

### Comandos de Terminal

#### Por proyecto

```bash
bun run test --project=e2e           # Solo e2e (con dependencies)
bun run test --project=integration   # Solo integration (con dependencies)
bun run test --project=e2e --project=integration  # Ambos
```

#### Por archivo o carpeta específica

```bash
# Un archivo - Playwright auto-detecta el proyecto que coincide
bun run test tests/integration/auth/auth.test.ts

# Todos los tests en una carpeta
bun run test tests/e2e/dashboard/

# Múltiples archivos
bun run test tests/e2e/login.test.ts tests/e2e/logout.test.ts
```

#### Por nombre de test (grep)

```bash
# Ejecutar tests que coincidan con un patrón
bun run test --grep "should login"

# Ejecutar tests que NO coincidan con un patrón
bun run test --grep-invert "skip"
```

#### Todos los tests

```bash
bun run test  # Ejecuta todos los proyectos con sus dependencies
```

---

## Extensión VS Code

### Instalación

Instalar la extensión oficial de Playwright: `ms-playwright.playwright`

```
Extensions (Ctrl+Shift+X) → Buscar "Playwright" → Instalar "Playwright Test for VSCode"
```

### Panel Sidebar

La extensión agrega un ícono **Testing** en el sidebar con:

| Sección           | Descripción                                          |
| ----------------- | ---------------------------------------------------- |
| **Projects**      | Checkboxes para habilitar/deshabilitar proyectos     |
| **Test Explorer** | Vista de árbol de todos los archivos y casos de test |
| **Settings**      | Mostrar browser, modo headed, etc.                   |

### Checkboxes de Projects

| Estado    | Comportamiento                            |
| --------- | ----------------------------------------- |
| Checked   | Proyecto activo, tests pueden ejecutarse  |
| Unchecked | Proyecto deshabilitado, tests no correrán |

**Tip:** Deshabilita `global-teardown` durante desarrollo para saltar cleanup después de cada ejecución.

---

## Debugging

### Método 1: Breakpoints en VS Code (Recomendado)

1. Coloca breakpoints en tu archivo de test (click en margen izquierdo)
2. Click derecho en test → **"Debug Test"**
3. La ejecución pausa en los breakpoints
4. Usa la toolbar de Debug: Step Over, Step Into, Continue

### Método 2: page.pause()

Inserta `await page.pause()` en tu test para abrir Playwright Inspector:

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/dashboard');
  await page.pause(); // Abre Inspector aquí
  await page.click('#submit');
});
```

### Método 3: Traces

Los traces capturan un registro completo de la ejecución del test para debugging post-mortem.

**Habilitar en config** (ya configurado):

```typescript
trace: 'retain-on-failure'; // Guarda trace solo en fallos
```

**Ver traces:**

```bash
# Abrir visor de traces
bunx playwright show-trace test-results/path-to/trace.zip
```

### Método 4: UI Mode

Modo interactivo con debugging time-travel:

```bash
bun run test --ui
```

### Flags de Debug Resumen

```bash
--debug          # Corre con Playwright Inspector
--ui             # Abre modo UI interactivo
--headed         # Muestra ventana del browser
--trace on       # Fuerza grabación de trace
--slow-mo=1000   # Ralentiza acciones por 1 segundo
```

---

## Buenas Prácticas

### 1. Mantener Setup Projects Livianos

Los proyectos de setup deben ser rápidos. Operaciones pesadas ralentizan cada ejecución.

### 2. Usar Nombres de Proyectos Descriptivos

```typescript
// Bueno
name: 'e2e';
name: 'integration';
name: 'ui-setup';

// Malo
name: 'project1';
name: 'tests';
```

### 3. Matchear Archivos por Directorio

Usar matching basado en directorio para separación clara:

```typescript
testMatch: '**/e2e/**/*.test.ts'; // Todos los tests e2e
testMatch: '**/integration/**/*.test.ts'; // Todos los tests API
```

### 4. Un Solo Sufijo de Archivo de Test

Usar `.test.ts` para todos los archivos de test. La estructura de directorios maneja la separación:

```
tests/
├── e2e/
│   └── dashboard/
│       └── dashboard.test.ts
└── integration/
    └── auth/
        └── auth.test.ts
```

---

## Solución de Problemas

### Tests No Corren

**Síntoma:** El archivo de test existe pero no corre.

**Verificar:**

1. ¿El archivo coincide con el patrón `testMatch`?
2. ¿El proyecto correcto está checked/seleccionado?
3. ¿El archivo está en `testIgnore`?

### Dependencies No Corren

**Síntoma:** Setup no corre antes de los tests.

**Verificar:**

1. ¿El array `dependencies` está correctamente configurado?
2. ¿Los nombres de proyectos de dependency están bien escritos?
3. ¿El proyecto dependency existe?

### Teardown No Corre

**Síntoma:** El proyecto teardown nunca ejecuta.

**Verificar:**

1. ¿El proyecto setup tiene la propiedad `teardown: 'nombre-proyecto'`?
2. ¿El nombre del proyecto teardown está bien escrito?

---

## Documentación Relacionada

- [Playwright Projects](https://playwright.dev/docs/test-projects)
- [Test Configuration](https://playwright.dev/docs/test-configuration)
- [VS Code Extension](https://playwright.dev/docs/getting-started-vscode)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [UI Mode](https://playwright.dev/docs/test-ui-mode)
