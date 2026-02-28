# E2E Test Code Review

> **Fase**: 3 de 3 (Plan → Coding → Review)
> **Propósito**: Validar cumplimiento KATA, calidad de código y calidad de test del código implementado.
> **Output**: Reporte de issues con niveles de severidad y sugerencias de mejora.

---

## Carga de Contexto

**Cargar estos archivos de referencia:**

1. `.context/guidelines/TAE/kata-ai-index.md` → Patrones core KATA
2. `.context/guidelines/TAE/automation-standards.md` → Reglas y anti-patrones
3. `.context/guidelines/TAE/typescript-patterns.md` → Convenciones TypeScript

---

## Input Requerido

1. **Código implementado** de la Fase 2:
   - Archivo de componente UI (`{PageName}Page.ts`)
   - Archivo de test (`{feature}.test.ts`)
   - Actualizaciones de fixture (`UiFixture.ts`)
   - Definiciones de tipos (si hay)

2. **Plan Original** de la Fase 1 (para referencia)

---

## Proceso de Review

### Paso 1: Recolectar Código para Review

Recolectar todos los archivos a revisar:

```bash
# Leer el componente
cat tests/components/ui/{PageName}Page.ts

# Leer el archivo de test
cat tests/e2e/{feature}/{feature}.test.ts

# Leer cambios de fixture
cat tests/components/UiFixture.ts

# Verificar definiciones de tipos
cat tests/data/types.ts
```

---

### Paso 2: Review de Cumplimiento KATA

#### 2.1 Estructura del Componente

| Check | Criterio                                             | Estado              |
| ----- | ---------------------------------------------------- | ------------------- |
| K-01  | Extiende `UiBase`                                    | [ ] PASS / [ ] FAIL |
| K-02  | Constructor acepta `TestContextOptions`              | [ ] PASS / [ ] FAIL |
| K-03  | Decorator `@atc` presente con ID válido              | [ ] PASS / [ ] FAIL |
| K-04  | ATCs son casos de test completos (no clicks simples) | [ ] PASS / [ ] FAIL |
| K-05  | Assertions fijas dentro de ATCs                      | [ ] PASS / [ ] FAIL |
| K-06  | Locators inline (no en archivo separado)             | [ ] PASS / [ ] FAIL |
| K-07  | Locators compartidos solo si se usan en 2+ ATCs      | [ ] PASS / [ ] FAIL |
| K-08  | ATCs no llaman a otros ATCs                          | [ ] PASS / [ ] FAIL |
| K-09  | Método `goto()` separado de ATCs                     | [ ] PASS / [ ] FAIL |

#### 2.2 Calidad del ATC

Para cada ATC, verificar:

```markdown
### ATC: {methodName}

| Check | Criterio                                                                          | Estado |
| ----- | --------------------------------------------------------------------------------- | ------ |
| A-01  | Decorator: `@atc('{TEST-ID}')`                                                    | [ ]    |
| A-02  | Nombre sigue convención: `{verb}{Resource}Successfully` o `{verb}With{Condition}` | [ ]    |
| A-03  | Parámetros tienen tipos                                                           | [ ]    |
| A-04  | Tipo de retorno es `Promise<void>`                                                | [ ]    |
| A-05  | Contiene al menos una assertion                                                   | [ ]    |
| A-06  | Assertions usan Playwright expect                                                 | [ ]    |
| A-07  | Sin datos de test hardcodeados                                                    | [ ]    |
| A-08  | Sin llamadas a `waitForTimeout()`                                                 | [ ]    |
```

---

### Paso 3: Review de Calidad de Código

#### 3.1 Calidad TypeScript

| Check | Criterio                                           | Estado              |
| ----- | -------------------------------------------------- | ------------------- |
| T-01  | Sin tipos `any`                                    | [ ] PASS / [ ] FAIL |
| T-02  | Todos los parámetros de función tienen tipos       | [ ] PASS / [ ] FAIL |
| T-03  | Tipos de retorno especificados                     | [ ] PASS / [ ] FAIL |
| T-04  | Interfaces/tipos exportados para reutilización     | [ ] PASS / [ ] FAIL |
| T-05  | Tipos definidos después de imports, antes de clase | [ ] PASS / [ ] FAIL |

#### 3.2 Calidad de Imports

| Check | Criterio                                          | Estado              |
| ----- | ------------------------------------------------- | ------------------- |
| I-01  | Usando import aliases (`@ui/`, `@utils/`, etc.)   | [ ] PASS / [ ] FAIL |
| I-02  | Sin imports relativos (`../../../`)               | [ ] PASS / [ ] FAIL |
| I-03  | Imports de tipo usan `import type`                | [ ] PASS / [ ] FAIL |
| I-04  | Imports organizados (tipos → externos → internos) | [ ] PASS / [ ] FAIL |

#### 3.3 Calidad de Métodos

| Check | Criterio                                                       | Estado              |
| ----- | -------------------------------------------------------------- | ------------------- |
| M-01  | Máximo 2 parámetros posicionales (usar objeto si más)          | [ ] PASS / [ ] FAIL |
| M-02  | Métodos organizados: constructor → navegación → ATCs → helpers | [ ] PASS / [ ] FAIL |
| M-03  | Helpers privados son realmente privados (no públicos)          | [ ] PASS / [ ] FAIL |
| M-04  | Comentarios JSDoc en métodos públicos                          | [ ] PASS / [ ] FAIL |

---

### Paso 4: Review del Archivo de Test

#### 4.1 Estructura del Test

| Check | Criterio                                        | Estado              |
| ----- | ----------------------------------------------- | ------------------- |
| TF-01 | Importa `test` desde `@TestFixture`             | [ ] PASS / [ ] FAIL |
| TF-02 | Usa `test.describe()` para agrupar              | [ ] PASS / [ ] FAIL |
| TF-03 | Estructura ARRANGE-ACT-ASSERT                   | [ ] PASS / [ ] FAIL |
| TF-04 | Nombres de test descriptivos                    | [ ] PASS / [ ] FAIL |
| TF-05 | Tags apropiados (`@regression`, `@smoke`, etc.) | [ ] PASS / [ ] FAIL |

#### 4.2 Independencia de Tests

| Check | Criterio                                   | Estado              |
| ----- | ------------------------------------------ | ------------------- |
| TI-01 | Cada test genera sus propios datos         | [ ] PASS / [ ] FAIL |
| TI-02 | Sin estado mutable compartido entre tests  | [ ] PASS / [ ] FAIL |
| TI-03 | Tests pueden ejecutarse en cualquier orden | [ ] PASS / [ ] FAIL |
| TI-04 | Sin `test.only` o `test.skip` sin razón    | [ ] PASS / [ ] FAIL |

#### 4.3 Datos de Test

| Check | Criterio                                              | Estado              |
| ----- | ----------------------------------------------------- | ------------------- |
| TD-01 | Usando Faker o funciones factory                      | [ ] PASS / [ ] FAIL |
| TD-02 | Sin UUIDs o IDs hardcodeados                          | [ ] PASS / [ ] FAIL |
| TD-03 | Sin credenciales de usuario reales                    | [ ] PASS / [ ] FAIL |
| TD-04 | Datos únicos por ejecución de test (timestamps, etc.) | [ ] PASS / [ ] FAIL |

---

### Paso 5: Review de Registro en Fixture

| Check | Criterio                                       | Estado              |
| ----- | ---------------------------------------------- | ------------------- |
| F-01  | Componente importado en UiFixture              | [ ] PASS / [ ] FAIL |
| F-02  | Propiedad declarada como `public readonly`     | [ ] PASS / [ ] FAIL |
| F-03  | Inicializado en constructor con mismas options | [ ] PASS / [ ] FAIL |
| F-04  | Nombre de propiedad sigue camelCase            | [ ] PASS / [ ] FAIL |

---

### Paso 6: Review de Estrategia de Locators

| Check | Criterio                                      | Estado              |
| ----- | --------------------------------------------- | ------------------- |
| L-01  | Prefiere atributos `data-testid`              | [ ] PASS / [ ] FAIL |
| L-02  | Usa `role` para elementos semánticos          | [ ] PASS / [ ] FAIL |
| L-03  | Evita selectores frágiles (nth-child, clases) | [ ] PASS / [ ] FAIL |
| L-04  | Locators son específicos (no muy amplios)     | [ ] PASS / [ ] FAIL |

---

## Template de Reporte de Issues

Generar un reporte con todos los hallazgos:

````markdown
# Reporte de Code Review: {TEST-ID}

## Resumen

| Categoría         | Pass | Fail | Total |
| ----------------- | ---- | ---- | ----- |
| Cumplimiento KATA | X    | Y    | 9     |
| Calidad de Código | X    | Y    | 12    |
| Calidad de Test   | X    | Y    | 8     |
| **Total**         | X    | Y    | 29    |

## Veredicto

- [ ] **APROBADO** - Sin issues críticos/altos, listo para merge
- [ ] **NECESITA REVISIÓN** - Tiene issues críticos/altos que deben corregirse
- [ ] **CAMBIOS MENORES** - Tiene issues medios/bajos, puede hacer merge después de corregir

---

## Issues Encontrados

### Issues CRÍTICOS (Debe Corregir)

| ID   | Ubicación         | Issue         | Sugerencia      |
| ---- | ----------------- | ------------- | --------------- |
| C-01 | {archivo}:{línea} | {descripción} | {cómo corregir} |

### Issues ALTOS (Debería Corregir)

| ID   | Ubicación         | Issue         | Sugerencia      |
| ---- | ----------------- | ------------- | --------------- |
| H-01 | {archivo}:{línea} | {descripción} | {cómo corregir} |

### Issues MEDIOS (Recomendado)

| ID   | Ubicación         | Issue         | Sugerencia      |
| ---- | ----------------- | ------------- | --------------- |
| M-01 | {archivo}:{línea} | {descripción} | {cómo corregir} |

### Issues BAJOS (Nice to Have)

| ID   | Ubicación         | Issue         | Sugerencia      |
| ---- | ----------------- | ------------- | --------------- |
| L-01 | {archivo}:{línea} | {descripción} | {cómo corregir} |

---

## Snippets de Código con Issues

### Issue C-01: {Título}

**Ubicación**: `{archivo}:{línea}`

**Código Actual**:

```typescript
// Código problemático actual
```
````

**Corrección Sugerida**:

```typescript
// Código corregido
```

**Razón**: {explicación de por qué es un issue}

---

## Checks Pasados

Todos los siguientes checks pasaron:

- [x] K-01: Extiende UiBase correctamente
- [x] K-02: Patrón de constructor correcto
- [x] ... (listar todos los checks pasados)

---

## Recomendaciones

1. **{Categoría}**: {Recomendación}
2. **{Categoría}**: {Recomendación}

````

---

## Definiciones de Severidad

| Severidad | Definición | Acción |
|-----------|------------|--------|
| **CRÍTICO** | Rompe arquitectura KATA, test no funcionará correctamente, issue de seguridad | Debe corregir antes de merge |
| **ALTO** | Viola estándares importantes, potenciales issues de mantenimiento | Debería corregir antes de merge |
| **MEDIO** | Violación de best practice, code smell | Recomendado corregir |
| **BAJO** | Issue de estilo, mejora menor | Nice to have |

### Ejemplos de Issues Críticos

- ATC llama a otro ATC
- Falta decorator `@atc`
- Sin assertions en ATC
- Usando `waitForTimeout()`
- Credenciales hardcodeadas

### Ejemplos de Issues Altos

- Imports relativos en lugar de aliases
- Faltan tipos TypeScript
- Locators en archivo separado
- ATC de interacción simple

### Ejemplos de Issues Medios

- Faltan comentarios JSDoc
- Estrategia de locators subóptima
- Datos de test podrían ser más únicos
- Faltan tags en tests

### Ejemplos de Issues Bajos

- Orden de imports no óptimo
- Nombres de variables podrían ser más claros
- Líneas en blanco extra

---

## Referencia de Issues Comunes

### Issue: ATC es Demasiado Simple

**Patrón**: ATC solo hace una acción sin assertions

```typescript
// ❌ INCORRECTO
@atc('TEST-001')
async clickSubmit() {
  await this.page.click('#submit');
}
````

**Corrección**: Hacer un caso de test completo con assertions

```typescript
// ✅ CORRECTO
@atc('TEST-001')
async submitFormSuccessfully(data: FormData) {
  await this.page.fill('#email', data.email);
  await this.page.click('#submit');
  await expect(this.page).toHaveURL(/.*success.*/);
}
```

---

### Issue: Usando waitForTimeout

**Patrón**: Esperas arbitrarias en lugar de condiciones

```typescript
// ❌ INCORRECTO
await this.page.waitForTimeout(3000);
```

**Corrección**: Usar esperas basadas en condiciones

```typescript
// ✅ CORRECTO
await this.page.waitForSelector('[data-loaded="true"]');
// o
await this.page.waitForLoadState('networkidle');
// o
await expect(element).toBeVisible();
```

---

### Issue: ATC Llamando a ATC

**Patrón**: Un ATC invoca a otro

```typescript
// ❌ INCORRECTO
@atc('TEST-001')
async checkoutFlow() {
  await this.loginSuccessfully(creds); // ¡Esto es otro ATC!
}
```

**Corrección**: Usar módulo Flows u orquestación desde archivo de test

```typescript
// ✅ CORRECTO - En archivo de test
await ui.login.loginSuccessfully(creds);
await ui.checkout.completeCheckoutSuccessfully();

// O usar módulo Flows para setup reutilizable
```

---

### Issue: Locators en Archivo Separado

**Patrón**: Constantes de locators centralizadas

```typescript
// ❌ INCORRECTO
// locators/login.ts
export const LOCATORS = { email: '#email' };

// LoginPage.ts
import { LOCATORS } from './locators';
await this.page.fill(LOCATORS.email, data.email);
```

**Corrección**: Locators inline en ATCs

```typescript
// ✅ CORRECTO
await this.page.locator('[data-testid="email-input"]').fill(data.email);
```

---

### Issue: Falta Seguridad de Tipos

**Patrón**: Usando `any` o sin tipos

```typescript
// ❌ INCORRECTO
async login(data: any) {
  // ...
}
```

**Corrección**: Definir tipos apropiados

```typescript
// ✅ CORRECTO
interface LoginCredentials {
  email: string;
  password: string;
}

async loginSuccessfully(data: LoginCredentials): Promise<void> {
  // ...
}
```

---

## Checklist Final

Antes de aprobar:

- [ ] Todos los issues CRÍTICOS resueltos
- [ ] Todos los issues ALTOS resueltos (o excepción documentada)
- [ ] Test ejecuta exitosamente: `bun run test <archivo-de-test>`
- [ ] Sin errores TypeScript: `bun run type-check`
- [ ] Linting pasa: `bun run lint`
- [ ] Componente registrado correctamente en fixture
- [ ] Test tiene tags apropiados para CI

---

## Después del Review

Una vez que el review esté completo:

1. **Si APROBADO**:
   - Actualizar estado del test en TMS a "Automated"
   - Commit y push de cambios
   - Crear PR si se requiere

2. **Si NECESITA REVISIÓN**:
   - Volver a fase de Coding
   - Corregir issues identificados
   - Ejecutar review nuevamente

---

**Review Completo** - Documentar el veredicto y compartir con el equipo.
