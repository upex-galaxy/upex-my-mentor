<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Implementación de Código + Unit Tests - Manual

> **Fase:** 7 - Implementation
> **Tiempo estimado:** 2-6 horas por story
> **Herramientas:** IDE (VS Code/Cursor), Terminal, Testing Framework (Jest/Vitest), Context7 MCP (opcional)

---

## 🎯 Objetivo

Aprender a **implementar código funcional paso a paso** siguiendo un plan técnico, incluyendo la creación de **unit tests** para lógica de negocio crítica.

**Al completar este manual podrás:**

- Implementar stories siguiendo su implementation plan
- Escribir código que cumple con code standards
- Crear unit tests con alta cobertura
- Debuggear y corregir errores comunes
- Continuar implementaciones pausadas

---

## 🔑 Conceptos Clave

### Step-by-Step Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                  FLUJO DE IMPLEMENTACIÓN                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    1. ANALIZAR          2. IMPLEMENTAR        3. VALIDAR   │
│    ┌──────────┐         ┌──────────────┐      ┌─────────┐  │
│    │  Leer    │         │  Código por  │      │ Build + │  │
│    │  Plan +  │ ──────► │  Steps del   │ ───► │ Smoke   │  │
│    │  Story   │         │  Plan        │      │ Test    │  │
│    └──────────┘         └──────────────┘      └─────────┘  │
│                                │                     │      │
│                                ▼                     │      │
│                         4. UNIT TESTS               │      │
│                         ┌──────────────┐            │      │
│                         │  Tests para  │ ◄─────────┘      │
│                         │  lógica      │                   │
│                         │  crítica     │                   │
│                         └──────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Terminología

| Término         | Definición                                                                            |
| --------------- | ------------------------------------------------------------------------------------- |
| **Smoke Test**  | Prueba rápida manual para verificar que la funcionalidad básica funciona              |
| **Unit Test**   | Test automatizado que verifica una función/módulo de forma aislada                    |
| **AAA Pattern** | Arrange (preparar), Act (ejecutar), Assert (verificar) - estructura estándar de tests |
| **Coverage**    | Porcentaje del código cubierto por tests                                              |
| **data-testid** | Atributo HTML que facilita seleccionar elementos en tests E2E                         |
| **Mock**        | Simulación de una dependencia externa (API, DB) para tests aislados                   |
| **Edge Case**   | Caso límite que puede causar comportamiento inesperado                                |

### Qué incluye esta fase

| ✅ SÍ Incluye                        | ❌ NO Incluye                   |
| ------------------------------------ | ------------------------------- |
| Implementar funcionalidad según plan | Pruebas de integración con APIs |
| Crear unit tests para lógica crítica | Pruebas E2E                     |
| Seguir code standards                | Code Review (Fase 8)            |
| Smoke testing manual                 | Deployment                      |
| Agregar data-testid                  |                                 |

---

## 📋 Pre-requisitos

**Antes de implementar, asegúrate de tener:**

- [ ] `implementation-plan.md` completo (Fase 6: Planning)
- [ ] `test-cases.md` definido (Fase 5: Shift-Left Testing)
- [ ] Design system configurado (si hay UI)
- [ ] Entorno de desarrollo funcionando (`npm run dev`)
- [ ] Testing framework instalado (Jest o Vitest)

**Archivos de contexto a tener abiertos:**

```
.context/PBI/epics/EPIC-.../stories/STORY-.../
├── story.md                # Qué implementar
├── implementation-plan.md  # Cómo implementar
└── test-cases.md           # Qué validar

.context/guidelines/DEV/
├── code-standards.md       # Estándares de código
├── error-handling.md       # Manejo de errores
└── data-testid-standards.md # Atributos para testing
```

---

# PARTE 1: Implementar una Story

## Paso 1: Análisis y Comprensión

### 1.1 Leer el Implementation Plan

**Abre el archivo:**

```
.context/PBI/epics/EPIC-{KEY}-{NUM}-{nombre}/stories/STORY-{KEY}-{NUM}-{nombre}/implementation-plan.md
```

**Identifica:**

1. **Todos los steps** - Cuántos pasos tiene
2. **Dependencias** - Qué se necesita para cada step
3. **Archivos a crear/modificar** - Lista completa
4. **Componentes del Design System** - Qué reusar

**Ejemplo de lectura:**

```markdown
# Mi Implementation Plan dice:

## Step 1: Crear tipos y interfaces

- Archivo: src/types/mentor.ts
- Tarea: Definir MentorType

## Step 2: Crear función de fetch

- Archivo: src/lib/api/mentors.ts
- Tarea: fetchMentors() con Supabase

## Step 3: Crear componente de tarjeta

- Archivo: src/components/mentors/MentorCard.tsx
- Usa: Card, Button del design system
```

### 1.2 Revisar los Test Cases

**Abre `test-cases.md` y observa:**

- Qué escenarios deben funcionar
- Qué edge cases considerar
- Qué NO debe pasar

> 💡 **Tip:** Los test cases te dicen qué validar después de implementar. Tenlos presentes mientras codeas.

### 1.3 Revisar Code Standards

**Lee rápidamente:**

- `.context/guidelines/DEV/code-standards.md` - Naming, DRY, TypeScript
- `.context/guidelines/DEV/error-handling.md` - Try-catch, mensajes
- `.context/guidelines/DEV/data-testid-standards.md` - Atributos para testing

---

## Paso 2: Setup y Validación

### 2.1 Verificar Dependencias

```bash
# Verificar que todo está instalado
npm install

# Verificar que el proyecto compila
npm run build

# Verificar que dev server funciona
npm run dev
```

### 2.2 Verificar Variables de Entorno

```bash
# ¿Existe .env.local?
cat .env.local

# Debe tener las variables necesarias:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Si falta algo:**

- Copia `.env.example` a `.env.local`
- Pide las credenciales al líder técnico

---

## Paso 3: Implementación Incremental

> 🔑 **Regla de Oro:** Un step a la vez. No saltes pasos.

### 3.1 Para cada Step del Plan

**A) Anuncia qué vas a hacer (mentalmente):**

```markdown
### 🔨 Step 1: Crear tipos y interfaces

**Task:** Definir MentorType con todos los campos
**Archivo:** src/types/mentor.ts
**Approach:** Basarme en la tabla mentors de Supabase
```

**B) Implementa el código:**

```typescript
// src/types/mentor.ts

export interface MentorType {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatar_url: string | null;
  hourly_rate: number;
  is_available: boolean;
  created_at: string;
}
```

**C) Aplica data-testid (si hay UI):**

```tsx
// src/components/mentors/MentorCard.tsx

export function MentorCard({ mentor }: { mentor: MentorType }) {
  return (
    // Root component: camelCase
    <Card data-testid="mentorCard">
      {/* Elementos internos: snake_case */}
      <h3 data-testid="mentor_name">{mentor.name}</h3>
      <p data-testid="mentor_specialty">{mentor.specialty}</p>
      <Button data-testid="book_session_button">Agendar Sesión</Button>
    </Card>
  );
}
```

**Reglas de data-testid:**

| Tipo               | Naming     | Ejemplo                        |
| ------------------ | ---------- | ------------------------------ |
| Componente root    | camelCase  | `mentorCard`, `loginForm`      |
| Elementos internos | snake_case | `mentor_name`, `submit_button` |

> ⚠️ **Cuidado:** NUNCA uses IDs dinámicos como `data-testid={`card-${id}`}`

**D) Valida que compila:**

```bash
# Después de cada step, verifica que no hay errores
npm run build
```

**E) Prueba manualmente (Smoke Test):**

1. Abre el navegador en http://localhost:3000/[tu-ruta]
2. Verifica que se ve lo que implementaste
3. Si es interactivo, prueba clicks básicos

---

## Paso 4: Smoke Testing Manual

**Al terminar todos los steps:**

### 4.1 Verificar Build

```bash
npm run build
```

**Resultado esperado:**

```
✓ Build exitoso
✓ Sin errores TypeScript
✓ Sin warnings críticos
```

### 4.2 Probar Manualmente cada AC

**Para cada Acceptance Criterion:**

| AC                          | Cómo probarlo      | Resultado           |
| --------------------------- | ------------------ | ------------------- |
| AC1: Ver lista de mentores  | Navegar a /mentors | ✅ Lista visible    |
| AC2: Cada mentor tiene foto | Verificar imágenes | ✅ Fotos cargan     |
| AC3: Botón de agendar       | Click en botón     | ✅ Navega a booking |

### 4.3 Probar Edge Cases Básicos

- ¿Qué pasa si no hay datos?
- ¿Qué pasa con datos vacíos?
- ¿La página carga rápido?

---

## Paso 5: Documentar Implementación

**Al finalizar, documenta:**

````markdown
## ✅ Implementación Completada

### Archivos creados:

- `src/types/mentor.ts` - Tipos de mentor
- `src/lib/api/mentors.ts` - Funciones de API
- `src/components/mentors/MentorCard.tsx` - Tarjeta de mentor
- `src/app/mentors/page.tsx` - Página de listado

### Archivos modificados:

- `src/app/layout.tsx` - Agregado link a mentors

### Acceptance Criteria:

- ✅ AC1: Lista de mentores visible
- ✅ AC2: Cada mentor tiene foto
- ✅ AC3: Botón de agendar funciona

### Comandos para probar:

```bash
npm run dev
# Abrir: http://localhost:3000/mentors
```
````

```

---

# PARTE 2: Unit Testing

## Paso 6: Identificar Funciones a Testear

### 6.1 ¿Qué necesita Unit Tests?

```

┌─────────────────────────────────────────────────────────────┐
│ ¿ESTA FUNCIÓN NECESITA TESTS? │
├─────────────────────────────────────────────────────────────┤
│ │
│ ¿Tiene lógica de negocio compleja? │
│ │ │
│ ┌─────────┴─────────┐ │
│ │ │ │
│ SÍ NO │
│ │ │ │
│ ▼ ▼ │
│ 🟢 TESTEAR ¿Es reutilizable? │
│ │ │
│ ┌─────────┴─────────┐ │
│ │ │ │
│ SÍ NO │
│ │ │ │
│ ▼ ▼ │
│ 🟡 CONSIDERAR 🔴 NO TESTEAR │
│ │
└─────────────────────────────────────────────────────────────┘

````

**🟢 TESTEAR (Crítico):**
- Cálculos matemáticos o financieros
- Transformaciones de datos
- Validaciones complejas
- Algoritmos de negocio

**🟡 CONSIDERAR (Opcional):**
- Helpers reutilizables
- Formatters básicos
- Parsers

**🔴 NO TESTEAR:**
- Componentes React simples (solo presentacionales)
- Código que solo llama APIs (eso es integration test)
- Configuraciones y constantes

### 6.2 Ejemplo de Análisis

```markdown
## Análisis de Funciones Implementadas

### Archivos revisados:
- src/lib/discount-calculator.ts
- src/utils/format-currency.ts
- src/components/PriceCard.tsx

### Funciones que REQUIEREN unit tests:

1. `calculateDiscount()` - src/lib/discount-calculator.ts
   **Razón:** Lógica de negocio crítica (cálculo de precios)

2. `formatCurrency()` - src/utils/format-currency.ts
   **Razón:** Helper reutilizable en múltiples partes

### Funciones que NO necesitan tests:

- `PriceCard.tsx` - Solo renderiza props (presentacional)
````

---

## Paso 7: Setup del Testing Framework

### 7.1 Verificar si ya existe

```bash
# Buscar en package.json
cat package.json | grep -E "(jest|vitest)"
```

### 7.2 Instalar si no existe

**Opción A: Jest (más común)**

```bash
npm install -D jest @types/jest ts-jest
```

Crear `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**Opción B: Vitest (más rápido)**

```bash
npm install -D vitest
```

Crear `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      threshold: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

### 7.3 Agregar Scripts

En `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Paso 8: Escribir Unit Tests

### 8.1 Estructura AAA Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      AAA PATTERN                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ARRANGE          ACT              ASSERT                  │
│   (Preparar)       (Ejecutar)       (Verificar)             │
│                                                             │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│   │ Definir  │     │ Llamar   │     │ Comparar │           │
│   │ inputs   │ ──► │ función  │ ──► │ resultado│           │
│   │ esperados│     │ a testear│     │ esperado │           │
│   └──────────┘     └──────────┘     └──────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Template de Test

```typescript
// src/lib/discount-calculator.test.ts

import { calculateDiscount } from './discount-calculator';

describe('calculateDiscount', () => {
  // Happy path tests
  describe('cuando el pedido es mayor a $100', () => {
    it('debería aplicar 10% de descuento', () => {
      // Arrange
      const orderAmount = 150;
      const expected = 135; // 150 - 15 = 135

      // Act
      const result = calculateDiscount(orderAmount);

      // Assert
      expect(result).toBe(expected);
    });
  });

  // Edge cases
  describe('casos límite', () => {
    it('debería manejar exactamente $100 (boundary)', () => {
      expect(calculateDiscount(100)).toBe(90);
    });

    it('debería manejar $0', () => {
      expect(calculateDiscount(0)).toBe(0);
    });

    it('debería manejar valores muy grandes', () => {
      expect(calculateDiscount(1_000_000)).toBe(900_000);
    });
  });

  // Error cases
  describe('manejo de errores', () => {
    it('debería lanzar error para valores negativos', () => {
      expect(() => calculateDiscount(-50)).toThrow('Order amount must be positive');
    });
  });
});
```

### 8.3 Tests con Mocks

**Cuando la función depende de servicios externos:**

```typescript
// src/lib/user-service.test.ts

import { getUserById } from './user-service';
import { supabase } from '@/lib/supabase/client';

// Mock del cliente Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: { id: '123', name: 'John' },
          error: null,
        }),
      }),
    }),
  },
}));

describe('getUserById', () => {
  it('debería retornar datos del usuario', async () => {
    const result = await getUserById('123');

    expect(result).toEqual({ id: '123', name: 'John' });
    expect(supabase.from).toHaveBeenCalledWith('users');
  });
});
```

> 💡 **Tip:** Solo mockea dependencias externas (APIs, DB), nunca mockees la función que estás testeando.

---

## Paso 9: Ejecutar y Validar Tests

### 9.1 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Modo watch (re-ejecuta al guardar)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage
```

### 9.2 Interpretar Resultados

**Output exitoso:**

```
 PASS  src/lib/discount-calculator.test.ts
  calculateDiscount
    cuando el pedido es mayor a $100
      ✓ debería aplicar 10% de descuento (3 ms)
    casos límite
      ✓ debería manejar exactamente $100 (1 ms)
      ✓ debería manejar $0 (1 ms)
    manejo de errores
      ✓ debería lanzar error para valores negativos (2 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

### 9.3 Interpretar Coverage

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
discount-calculator.ts|    100  |    100   |    100  |    100  |
format-currency.ts    |     95  |   87.5   |    100  |     95  |
----------------------|---------|----------|---------|---------|
```

**Objetivo:** Mínimo 80% en funciones críticas

| Métrica | Significado                |
| ------- | -------------------------- |
| Stmts   | % de statements ejecutados |
| Branch  | % de if/else cubiertos     |
| Funcs   | % de funciones testeadas   |
| Lines   | % de líneas ejecutadas     |

---

# PARTE 3: Debugging (Fix Issues)

## Paso 10: Cuando Hay Errores

### 10.1 Reproducir el Error

**Documenta:**

```markdown
## 🐛 Error Identificado

**Tipo:** TypeScript error / Runtime error / Build error

**Mensaje:**
```

Type 'undefined' is not assignable to type 'MentorType[]'
at MentorList.tsx:15

```

**Cuándo ocurre:** Al hacer build

**Cómo reproducir:**
1. Ejecutar npm run build
2. Error aparece en línea 15
```

### 10.2 Diagnóstico

**Causas comunes y soluciones:**

| Error                                    | Causa Probable       | Solución                                |
| ---------------------------------------- | -------------------- | --------------------------------------- |
| `Type 'X' is not assignable to type 'Y'` | Tipo incorrecto      | Revisar interfaces, agregar type guards |
| `Cannot find module 'X'`                 | Import incorrecto    | Verificar ruta, instalar dependency     |
| `undefined is not a function`            | Variable no existe   | Agregar null checks                     |
| `Build failed`                           | Error de compilación | Leer mensaje completo, revisar config   |

### 10.3 Aplicar Corrección

**Ejemplo:**

```typescript
// ❌ Antes (error)
const mentors: MentorType[] = data; // data puede ser undefined

// ✅ Después (corregido)
const mentors: MentorType[] = data ?? []; // Default a array vacío
```

### 10.4 Validar Corrección

```bash
# Verificar que compila
npm run build

# Verificar que tests pasan
npm run test

# Probar manualmente
npm run dev
```

---

# PARTE 4: Continuar Implementación Pausada

## Paso 11: Retomar una Story

### 11.1 Analizar Estado Actual

**Revisa:**

1. Implementation plan - ¿Qué steps faltan?
2. Código existente - ¿Qué ya está hecho?
3. Build status - ¿Compila?

**Genera resumen:**

```markdown
## 📊 Estado de STORY-MYM-15

### ✅ Completado:

- Step 1: Crear tipos - src/types/mentor.ts
- Step 2: API functions - src/lib/api/mentors.ts

### ⏳ En Progreso:

- Step 3: MentorCard - Parcialmente implementado
  - ✅ Estructura básica
  - ⏸️ Falta estilos y data-testid

### ⏸️ Pendiente:

- Step 4: Página de listado
- Step 5: Navegación

### 🎯 Próximo Paso:

Completar MentorCard (estilos + data-testid)
```

### 11.2 Continuar desde donde quedó

1. Abre el archivo en progreso
2. Completa lo pendiente
3. Valida con build
4. Continúa con siguiente step

---

## 📋 Checklist Final

### Implementación

- [ ] Leí implementation-plan.md completo
- [ ] Implementé todos los steps en orden
- [ ] Seguí code standards (DRY, naming, TypeScript)
- [ ] Apliqué error handling apropiado
- [ ] Agregué data-testid a componentes UI
- [ ] Build compila sin errores

### Unit Tests

- [ ] Identifiqué funciones que necesitan tests
- [ ] Testing framework configurado
- [ ] Tests siguen AAA pattern
- [ ] Cubrí happy paths
- [ ] Cubrí edge cases
- [ ] Cubrí error cases
- [ ] Coverage mínimo 80% en funciones críticas

### Validación

- [ ] Smoke test manual pasó
- [ ] Todos los AC funcionan
- [ ] Tests automatizados pasan (100%)

### Documentación

- [ ] Documenté archivos creados/modificados
- [ ] Preparé sugerencia de commit message

---

## ⚠️ Troubleshooting

### Error: "Cannot find module"

**Problema:** Import no encuentra el archivo

**Solución:**

```typescript
// Verificar que la ruta es correcta
import { MentorType } from '@/types/mentor'; // ✅ Alias configurado
import { MentorType } from '../types/mentor'; // ✅ Ruta relativa
import { MentorType } from 'types/mentor'; // ❌ Falta @/ o ./
```

### Error: "Type 'undefined' is not assignable"

**Problema:** TypeScript detecta posible undefined

**Solución:**

```typescript
// Agregar valor por defecto
const items = data ?? [];

// O usar optional chaining
const name = user?.name ?? 'Unknown';
```

### Tests fallan intermitentemente

**Problema:** Tests dependen de orden o estado compartido

**Solución:**

```typescript
// Limpiar estado entre tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Cada test debe ser independiente
it('test A', () => {
  const data = createFreshData(); // Crear datos nuevos
});
```

### Coverage baja

**Problema:** Hay líneas no cubiertas

**Solución:**

1. Ejecuta `npm run test:coverage`
2. Abre `coverage/lcov-report/index.html`
3. Ve qué líneas están en rojo
4. Agrega tests que ejecuten esas líneas

---

## 💡 Tips y Mejores Prácticas

### Nombres de Tests Descriptivos

```typescript
// ❌ Mal
it('test 1', () => { ... });

// ✅ Bien
it('debería aplicar 10% de descuento para pedidos mayores a $100', () => { ... });
```

### Tests Independientes

```typescript
// ❌ Mal (tests dependen de orden)
let user;
it('crear usuario', () => {
  user = createUser();
});
it('borrar usuario', () => {
  deleteUser(user.id);
}); // Falla si el anterior falla

// ✅ Bien (cada test es autónomo)
it('crear usuario', () => {
  const user = createUser();
  expect(user).toBeDefined();
});

it('borrar usuario', () => {
  const user = createUser(); // Crea su propio usuario
  deleteUser(user.id);
  expect(getUser(user.id)).toBeNull();
});
```

### No Mockear lo que Testeas

```typescript
// ❌ Mal (mockear la función que testeas)
jest.mock('./discount-calculator');

// ✅ Bien (mockear dependencias externas)
jest.mock('@/lib/supabase/client');
```

---

## 📚 Recursos Adicionales

**Documentación oficial:**

- [Jest](https://jestjs.io/docs/getting-started)
- [Vitest](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

**Best Practices:**

- [Kent C. Dodds - Testing](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🎯 Próximos Pasos

Después de completar la implementación + unit tests:

1. **Fase 8: Code Review** - Revisión de código
2. **Fase 9: Deployment Staging** - Deploy a ambiente de pruebas
3. **Fase 11: Test Automation** - Integration/E2E tests

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
