<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Code Review Estático - Manual

> **Fase:** 8 - Code Review
> **Tiempo estimado:** 30-60 minutos por story
> **Herramientas:** IDE, Terminal (ESLint, TypeScript), Browser DevTools

---

## 🎯 Objetivo

Aprender a **revisar código estáticamente** antes de hacer merge, asegurando calidad, seguridad y cumplimiento de estándares.

**Al completar este manual podrás:**

- Ejecutar y configurar linting (ESLint + Prettier)
- Revisar código según checklist de calidad
- Identificar issues críticos vs. menores
- Generar reportes de code review profesionales
- Decidir: APPROVED vs. CHANGES REQUESTED

---

## 🔑 Conceptos Clave

### ¿Qué es Code Review Estático?

```
┌─────────────────────────────────────────────────────────────┐
│               CODE REVIEW = ANÁLISIS ESTÁTICO               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ✅ SÍ REVISA (Estático)        ❌ NO REVISA (Dinámico)   │
│    ┌──────────────────────┐       ┌──────────────────────┐  │
│    │ • Linting            │       │ • Unit tests         │  │
│    │ • Code standards     │       │ • Integration tests  │  │
│    │ • TypeScript types   │       │ • E2E tests          │  │
│    │ • Security patterns  │       │ • Coverage reports   │  │
│    │ • Architecture       │       │ • Performance tests  │  │
│    │ • DRY principles     │       │                      │  │
│    │ • data-testid        │       │ (Fase 7 y 11)        │  │
│    └──────────────────────┘       └──────────────────────┘  │
│                                                             │
│    Leer y analizar código         Ejecutar código          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Terminología

| Término      | Definición                                                                   |
| ------------ | ---------------------------------------------------------------------------- |
| **Linting**  | Análisis automático de código para encontrar errores y violaciones de estilo |
| **ESLint**   | Herramienta de linting para JavaScript/TypeScript                            |
| **Prettier** | Formateador automático de código                                             |
| **DRY**      | Don't Repeat Yourself - No duplicar código                                   |
| **CRITICAL** | Issue que bloquea el merge (security, breaks build)                          |
| **MEDIUM**   | Issue que debería corregirse (DRY, naming)                                   |
| **NITPICK**  | Mejora opcional (estilo, comentarios)                                        |

### Flujo de Code Review

```
┌────────────────────────────────────────────────────────────────┐
│                    FLUJO DE CODE REVIEW                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│    Fase 7              Fase 8              Decisión            │
│    ┌──────────┐        ┌──────────┐        ┌──────────┐        │
│    │  Código  │        │  Code    │        │ APPROVED │        │
│    │  + Unit  │ ─────► │  Review  │ ─────► │   ─► Fase 9      │
│    │  Tests   │        │  Estático│        └──────────┘        │
│    └──────────┘        └──────────┘              │             │
│                              │                   │             │
│                              │            ┌──────────┐         │
│                              └──────────► │ CHANGES  │         │
│                                           │ REQUESTED│         │
│                                           │   ─► Fase 7       │
│                                           └──────────┘         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-requisitos

**Antes de hacer code review:**

- [ ] Story implementada completamente (Fase 7)
- [ ] Build exitoso sin errores TypeScript
- [ ] Funcionalidad validada manualmente
- [ ] Unit tests pasando (si aplica)

**Archivos de contexto a tener abiertos:**

```
.context/PBI/epics/EPIC-.../stories/STORY-.../
├── story.md                # Acceptance Criteria a validar
└── implementation-plan.md  # Approach técnico planificado

.context/guidelines/DEV/
├── code-standards.md       # Estándares de código
├── error-handling.md       # Manejo de errores
└── data-testid-standards.md # Atributos para testing
```

---

# PARTE 1: Configurar Linting (Si no existe)

## Paso 1: Detectar Estado Actual

### 1.1 Verificar si ya existe linting

```bash
# Buscar configuración ESLint
ls -la .eslintrc* eslint.config.js 2>/dev/null

# Buscar configuración Prettier
ls -la .prettierrc* prettier.config.js 2>/dev/null

# Verificar scripts en package.json
cat package.json | grep -E "(lint|format|prettier)"
```

**Resultados posibles:**

| Estado                         | Acción                    |
| ------------------------------ | ------------------------- |
| ESLint + Prettier configurados | Ir al Paso 3 (Review)     |
| Solo ESLint                    | Agregar Prettier          |
| Nada configurado               | Seguir este paso completo |

---

## Paso 2: Instalar y Configurar Linting

### 2.1 Instalar dependencias

**Para proyecto Next.js:**

```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-next @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**Para proyecto React + Vite:**

```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 2.2 Crear `.eslintrc.json`

**Para Next.js:**

```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**Para React + Vite:**

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": { "jsx": true },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["react", "react-hooks", "@typescript-eslint"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": "warn"
  },
  "settings": {
    "react": { "version": "detect" }
  }
}
```

### 2.3 Crear `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### 2.4 Crear archivos de ignore

**`.eslintignore`:**

```
node_modules
.next
out
dist
build
.env*
*.config.js
```

**`.prettierignore`:**

```
node_modules
.next
out
dist
build
*.md
pnpm-lock.yaml
package-lock.json
```

### 2.5 Agregar scripts a `package.json`

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

### 2.6 Validar configuración

```bash
# Probar linting
npm run lint

# Probar fix automático
npm run lint:fix

# Probar formateo
npm run format
```

---

# PARTE 2: Checklist de Code Review

## Paso 3: Revisar Acceptance Criteria

### 3.1 Comparar AC con implementación

**Abre `story.md` y verifica cada AC:**

```markdown
## Ejemplo de Verificación

### AC1: Usuario puede ver lista de mentores

- [ ] ¿La página /mentors existe?
- [ ] ¿Los datos se cargan correctamente?
- [ ] ¿Se muestra información de cada mentor?

### AC2: Cada mentor tiene foto, nombre y especialidad

- [ ] ¿El componente MentorCard muestra estos campos?
- [ ] ¿Las imágenes cargan correctamente?
- [ ] ¿Hay fallback si no hay imagen?

### AC3: Usuario puede filtrar por especialidad

- [ ] ¿Existe el filtro en la UI?
- [ ] ¿Filtra correctamente al seleccionar?
- [ ] ¿Muestra resultados vacíos apropiadamente?
```

**Resultado:**

| AC  | ¿Cumplido? | Notas                         |
| --- | ---------- | ----------------------------- |
| AC1 | ✅         | Lista visible                 |
| AC2 | ✅         | Foto, nombre, especialidad OK |
| AC3 | ❌         | Filtro no implementado        |

> 🚨 **CRITICAL:** Si algún AC no se cumple, es bloqueante.

---

## Paso 4: Ejecutar Linting y Build

### 4.1 Ejecutar linting

```bash
npm run lint
```

**Analizar output:**

```
✖ 5 problems (2 errors, 3 warnings)

./app/mentors/page.tsx
  15:7  error    Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  23:1  warning  Unexpected console statement              no-console

./lib/api/mentors.ts
  8:5   error    'data' is defined but never used          @typescript-eslint/no-unused-vars
```

**Clasificación:**

| Tipo    | Ejemplo       | Acción                         |
| ------- | ------------- | ------------------------------ |
| Error   | `any` usado   | 🚨 CRITICAL - Corregir         |
| Warning | `console.log` | ⚠️ MEDIUM - Debería corregirse |

### 4.2 Ejecutar build

```bash
npm run build
```

**Resultado esperado:**

```
✓ Build exitoso
```

> 🚨 **CRITICAL:** Build fallido es bloqueante.

---

## Paso 5: Revisar Code Standards

### 5.1 DRY (Don't Repeat Yourself)

**Buscar código duplicado:**

```bash
# Buscar patrones repetidos
grep -rn "await fetch" src/
grep -rn "const response = await" src/
```

**Ejemplo de violación:**

```typescript
// ❌ MAL - Código duplicado en 3 lugares
// archivo1.ts
const response = await fetch('/api/users');
const data = await response.json();

// archivo2.ts
const response = await fetch('/api/users'); // Igual
const data = await response.json();

// ✅ BIEN - Extraer a función reutilizable
// lib/api/users.ts
export async function fetchUsers() {
  const response = await fetch('/api/users');
  return response.json();
}
```

### 5.2 Naming Conventions

**Verificar nomenclatura:**

| Tipo        | Convención        | Ejemplo                      |
| ----------- | ----------------- | ---------------------------- |
| Variables   | camelCase         | `userData`, `isLoading`      |
| Funciones   | camelCase + verbo | `getUserData`, `handleClick` |
| Componentes | PascalCase        | `MentorCard`, `LoginForm`    |
| Constantes  | UPPER_SNAKE       | `MAX_RETRIES`, `API_URL`     |

**Ejemplo de violación:**

```typescript
// ❌ MAL - Nombres genéricos
const data = getUserData();
const x = 5;

// ✅ BIEN - Nombres descriptivos
const mentorData = getMentorData();
const maxRetryAttempts = 5;
```

### 5.3 TypeScript Strict

**Buscar violaciones:**

```bash
# Buscar uso de 'any'
grep -rn ": any" src/
grep -rn "as any" src/

# Buscar @ts-ignore
grep -rn "@ts-ignore" src/
```

**Ejemplo de violación:**

```typescript
// ❌ MAL
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// ✅ BIEN
interface DataItem {
  value: string;
  id: number;
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}
```

### 5.4 Error Handling

**Verificar patrones:**

```typescript
// ❌ MAL - Sin error handling
async function fetchData() {
  const data = await fetch('/api/data');
  console.error('Error'); // No específico
}

// ✅ BIEN - Error handling apropiado
async function fetchData(): Promise<Data[]> {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch data', { error });
    throw error;
  }
}
```

### 5.5 Magic Numbers y Hardcoding

**Buscar valores hardcodeados:**

```bash
# Buscar posibles API keys
grep -rn "sk-" src/
grep -rn "api_key" src/

# Buscar magic numbers
grep -rn "if.*[0-9][0-9]" src/
```

**Ejemplo de violación:**

```typescript
// ❌ MAL
const apiKey = 'sk-1234567890'; // Secret hardcodeado
if (users.length > 50) {        // Magic number

// ✅ BIEN
const apiKey = process.env.API_KEY;
const MAX_USERS_PER_PAGE = 50;
if (users.length > MAX_USERS_PER_PAGE) {
```

---

## Paso 6: Revisar Security

### 6.1 Checklist de Seguridad

```markdown
## Security Checklist

- [ ] NO hay secrets hardcodeados (API keys, tokens, passwords)
- [ ] Inputs de usuario están validados
- [ ] Queries SQL usan parámetros (no concatenación)
- [ ] No hay `dangerouslySetInnerHTML` sin sanitizar
- [ ] Rutas protegidas tienen verificación de auth
```

**Buscar problemas de seguridad:**

```bash
# Secrets hardcodeados
grep -rn "password" src/ --include="*.ts" --include="*.tsx"
grep -rn "secret" src/ --include="*.ts" --include="*.tsx"
grep -rn "Bearer " src/ --include="*.ts" --include="*.tsx"

# SQL injection potencial
grep -rn "query\`" src/
grep -rn "sql\`" src/
```

> 🚨 **CRITICAL:** Cualquier secret hardcodeado es bloqueante absoluto.

---

## Paso 7: Revisar Performance

### 7.1 Patrones a Buscar

**N+1 Queries:**

```typescript
// ❌ MAL - N+1 queries
users.forEach(user => {
  const posts = await fetchPostsByUser(user.id); // N queries
});

// ✅ BIEN - Una query
const allPosts = await fetchAllPosts();
const postsByUser = groupBy(allPosts, 'userId');
```

**React Performance:**

```typescript
// ❌ MAL - Función recreada en cada render
<Button onClick={() => handleClick(item.id)} />

// ✅ BIEN - Función memoizada
const handleItemClick = useCallback((id) => {
  // lógica
}, [dependencies]);
<Button onClick={() => handleItemClick(item.id)} />
```

---

## Paso 8: Revisar UI/UX (Si aplica)

### 8.1 Design System

**Verificar uso de componentes:**

```tsx
// ❌ MAL - No usa design system
<button className="bg-blue-500 px-4 py-2">Click</button>;

// ✅ BIEN - Usa design system
import { Button } from '@/components/ui/button';
<Button variant="primary">Click</Button>;
```

### 8.2 Estados de UI

**Checklist:**

- [ ] Loading states (skeleton, spinner)
- [ ] Error states (mensaje + retry)
- [ ] Empty states (mensaje + CTA)
- [ ] Responsive design (mobile, tablet, desktop)

### 8.3 Accesibilidad Básica

- [ ] Labels en inputs
- [ ] Alt text en imágenes
- [ ] Keyboard navigation funciona

---

## Paso 9: Revisar data-testid

### 9.1 Verificar Estándares

**Componentes de dominio (MentorCard, LoginForm):**

```tsx
// ✅ BIEN - data-testid en la definición
export function MentorCard({ mentor }) {
  return (
    <Card data-testid="mentorCard">
      {' '}
      {/* Root: camelCase */}
      <h3 data-testid="mentor_name">{mentor.name}</h3> {/* Interno: snake_case */}
      <Button data-testid="book_session_button">Agendar</Button>
    </Card>
  );
}
```

**Componentes UI base (Button, Card de shadcn):**

```tsx
// ✅ BIEN - data-testid donde se USA, no en definición
<Input data-testid="email_input" type="email" />
<Button data-testid="login_button">Iniciar sesión</Button>
```

**Buscar violaciones:**

```bash
# Buscar IDs dinámicos (NO permitidos)
grep -rn 'data-testid={`' src/
grep -rn "data-testid={\`" src/
```

> ⚠️ **MEDIUM:** Falta de data-testid bloquea futura automatización E2E.

---

# PARTE 3: Generar Reporte de Review

## Paso 10: Clasificar Issues

### 10.1 Niveles de Severidad

| Nivel        | Símbolo | Criterio                             | Acción             |
| ------------ | ------- | ------------------------------------ | ------------------ |
| **CRITICAL** | 🚨      | Security, build roto, AC no cumplido | CHANGES REQUESTED  |
| **MEDIUM**   | ⚠️      | DRY, naming, TypeScript `any`        | Debería corregirse |
| **NITPICK**  | 💡      | Estilo, comentarios, mejoras         | Opcional           |

### 10.2 Template de Reporte

```markdown
# Code Review: STORY-MYM-15-mentor-listing

**Reviewer:** [Tu nombre]
**Date:** 2025-12-30

---

## 🎯 Decisión

- [x] ✅ **APPROVED** - Listo para Fase 9
- [ ] ⚠️ **APPROVED with comments** - Merge + crear issues
- [ ] ❌ **CHANGES REQUESTED** - Corregir antes de continuar

---

## ✅ Cumplimiento de Acceptance Criteria

| AC                              | Status      | Notas |
| ------------------------------- | ----------- | ----- |
| AC1: Lista de mentores visible  | ✅ Cumplido |       |
| AC2: Foto, nombre, especialidad | ✅ Cumplido |       |
| AC3: Filtro por especialidad    | ✅ Cumplido |       |

---

## 🔍 Issues Encontrados

### 🚨 CRITICAL (0)

Ninguno encontrado.

### ⚠️ MEDIUM (2)

1. **`lib/api/mentors.ts:15`** - Console.log olvidado
   - **Problema:** `console.log('mentors:', data)`
   - **Sugerencia:** Eliminar antes de merge

2. **`components/MentorCard.tsx:8`** - Falta data-testid
   - **Problema:** No tiene atributos para testing
   - **Sugerencia:** Agregar según estándar

### 💡 NITPICKS (1)

3. **`app/mentors/page.tsx:12`** - Nombre genérico
   - **Problema:** `const data = await fetchMentors()`
   - **Sugerencia:** `const mentorData = await fetchMentors()`

---

## ✅ Aspectos Positivos

- ✅ Buena separación de concerns
- ✅ Design system usado correctamente
- ✅ Error handling implementado
- ✅ TypeScript strict respetado

---

## 🔧 Linting & Build

- **ESLint:** ✅ Sin errores
- **TypeScript:** ✅ Sin errores
- **Build:** ✅ Exitoso

---

## 🎯 Próximos Pasos

✅ APPROVED - Proceder a Fase 9: Deployment Staging
```

---

## 📋 Checklist Final de Code Review

### Acceptance Criteria

- [ ] Todos los AC de la story se cumplen
- [ ] Funcionalidad probada manualmente

### Linting y Build

- [ ] `npm run lint` sin errores
- [ ] `npm run build` exitoso
- [ ] Sin errores TypeScript

### Code Standards

- [ ] Sin código duplicado (DRY)
- [ ] Naming conventions correctas
- [ ] Sin uso de `any` en TypeScript
- [ ] Error handling implementado
- [ ] Sin magic numbers/hardcoding

### Security

- [ ] Sin secrets hardcodeados
- [ ] Inputs validados
- [ ] Sin SQL injection vulnerabilities

### Performance

- [ ] Sin N+1 queries
- [ ] React memoization donde aplique

### UI/UX (Si aplica)

- [ ] Design system usado
- [ ] Loading/error/empty states
- [ ] Responsive design
- [ ] Accesibilidad básica

### Testing (data-testid)

- [ ] Componentes de dominio tienen data-testid
- [ ] Nomenclatura correcta (camelCase/snake_case)
- [ ] Sin IDs dinámicos

---

## ⚠️ Troubleshooting

### ESLint no reconoce TypeScript

**Problema:** Errores de parsing en archivos `.ts/.tsx`

**Solución:**

```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Verificar `.eslintrc.json` tiene:

```json
{
  "parser": "@typescript-eslint/parser"
}
```

### Conflicto ESLint + Prettier

**Problema:** Reglas de ESLint contradicen Prettier

**Solución:**

```bash
npm install -D eslint-config-prettier
```

Agregar `"prettier"` al final de `extends` en `.eslintrc.json`.

### Build falla por TypeScript

**Problema:** Errores de tipos que no aparecen en IDE

**Solución:**

```bash
# Ver todos los errores
npx tsc --noEmit

# Corregir uno por uno
```

---

## 💡 Tips para Code Reviews Efectivos

### Ser Específico

```markdown
// ❌ MAL
"El código tiene problemas"

// ✅ BIEN
"En `lib/api/mentors.ts:15` hay un console.log que debería eliminarse"
```

### Explicar el Por Qué

```markdown
// ❌ MAL
"Usa TypeScript types"

// ✅ BIEN
"Usar `any` en `processData()` permite errores en runtime.
Definir interface `DataItem` previene esto."
```

### Sugerir Soluciones

```markdown
// ❌ MAL
"Esto está mal"

// ✅ BIEN
"Sugiero extraer la lógica duplicada a un custom hook `useMentorFilters()`"
```

---

## 📚 Recursos Adicionales

**Guías de estilo:**

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Patterns](https://reactpatterns.com/)
- [ESLint Rules](https://eslint.org/docs/rules/)

**Herramientas:**

- [ESLint Config Generator](https://eslint.org/docs/user-guide/configuring/)
- [Prettier Playground](https://prettier.io/playground/)

---

## 🎯 Próximos Pasos

Después de aprobar el code review:

1. **Si APPROVED** → Fase 9: Deployment Staging
2. **Si CHANGES REQUESTED** → Developer corrige con `fix-issues.md`
3. **Re-review** después de correcciones

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
