# Integration Test Code Review

> **Fase**: 3 de 3 (Plan → Coding → Review)
> **Propósito**: Validar cumplimiento KATA, calidad de código y calidad de test del código implementado.
> **Output**: Reporte de issues con niveles de severidad y sugerencias de mejora.

---

## Carga de Contexto

**Cargar estos archivos de referencia:**

1. `.context/guidelines/TAE/kata-ai-index.md` → Patrones core KATA
2. `.context/guidelines/TAE/automation-standards.md` → Reglas y anti-patrones
3. `.context/guidelines/TAE/api-testing-patterns.md` → Patrones de API

---

## Input Requerido

1. **Código implementado** de la Fase 2:
   - Archivo de componente API (`{Resource}Api.ts`)
   - Archivo de test (`{resource}.test.ts`)
   - Actualizaciones de fixture (`ApiFixture.ts`)
   - Definiciones de tipos (`types.ts`)

2. **Plan Original** de la Fase 1 (para referencia)

---

## Proceso de Review

### Paso 1: Recolectar Código para Review

```bash
# Leer el componente
cat tests/components/api/{Resource}Api.ts

# Leer el archivo de test
cat tests/integration/{resource}/{resource}.test.ts

# Leer cambios de fixture
cat tests/components/ApiFixture.ts

# Verificar tipos
cat tests/data/types.ts
```

---

### Paso 2: Review de Cumplimiento KATA

#### 2.1 Estructura del Componente

| Check | Criterio                                             | Estado              |
| ----- | ---------------------------------------------------- | ------------------- |
| K-01  | Extiende `ApiBase`                                   | [ ] PASS / [ ] FAIL |
| K-02  | Constructor acepta `TestContextOptions`              | [ ] PASS / [ ] FAIL |
| K-03  | Decorator `@atc` presente con ID válido              | [ ] PASS / [ ] FAIL |
| K-04  | ATCs son operaciones completas (no wrappers simples) | [ ] PASS / [ ] FAIL |
| K-05  | Assertions fijas dentro de ATCs                      | [ ] PASS / [ ] FAIL |
| K-06  | Tipo de retorno es tupla correcta                    | [ ] PASS / [ ] FAIL |
| K-07  | Incluye payload en tupla de retorno (POST/PUT/PATCH) | [ ] PASS / [ ] FAIL |

#### 2.2 Tipos de Retorno de ATCs

Para cada ATC, verificar el tipo de retorno:

| HTTP Method  | Tipo de Retorno Esperado         | Ejemplo                        |
| ------------ | -------------------------------- | ------------------------------ |
| GET (single) | `[APIResponse, TBody]`           | `[response, user]`             |
| GET (list)   | `[APIResponse, TBody[]]`         | `[response, users]`            |
| POST         | `[APIResponse, TBody, TPayload]` | `[response, created, payload]` |
| PUT/PATCH    | `[APIResponse, TBody, TPayload]` | `[response, updated, payload]` |
| DELETE       | `[APIResponse, void]`            | `[response, undefined]`        |

---

### Paso 3: Review de Calidad de Código

#### 3.1 Calidad TypeScript

| Check | Criterio                               | Estado              |
| ----- | -------------------------------------- | ------------------- |
| T-01  | Sin tipos `any`                        | [ ] PASS / [ ] FAIL |
| T-02  | Tipos de request/response definidos    | [ ] PASS / [ ] FAIL |
| T-03  | Tipos exportados para uso en tests     | [ ] PASS / [ ] FAIL |
| T-04  | Import type usado para imports de tipo | [ ] PASS / [ ] FAIL |

#### 3.2 Calidad de Imports

| Check | Criterio                                        | Estado              |
| ----- | ----------------------------------------------- | ------------------- |
| I-01  | Usando import aliases (`@api/`, `@data/`, etc.) | [ ] PASS / [ ] FAIL |
| I-02  | Sin imports relativos (`../../../`)             | [ ] PASS / [ ] FAIL |
| I-03  | Tipos re-exportados desde componente            | [ ] PASS / [ ] FAIL |

---

### Paso 4: Review del Archivo de Test

#### 4.1 Estructura del Test

| Check | Criterio                                        | Estado              |
| ----- | ----------------------------------------------- | ------------------- |
| TF-01 | Importa `test` desde `@TestFixture`             | [ ] PASS / [ ] FAIL |
| TF-02 | Setup de auth en `beforeEach` (si es necesario) | [ ] PASS / [ ] FAIL |
| TF-03 | Usa fixture `{ api }` (no `{ ui }`)             | [ ] PASS / [ ] FAIL |
| TF-04 | Estructura ARRANGE-ACT-ASSERT                   | [ ] PASS / [ ] FAIL |
| TF-05 | Tags apropiados (`@integration`, `@{resource}`) | [ ] PASS / [ ] FAIL |

#### 4.2 Datos de Test

| Check | Criterio                                 | Estado              |
| ----- | ---------------------------------------- | ------------------- |
| TD-01 | Usando Faker para datos dinámicos        | [ ] PASS / [ ] FAIL |
| TD-02 | Sin IDs hardcodeados                     | [ ] PASS / [ ] FAIL |
| TD-03 | Datos únicos por test (timestamps, UUID) | [ ] PASS / [ ] FAIL |
| TD-04 | Factory functions para payloads comunes  | [ ] PASS / [ ] FAIL |

---

### Paso 5: Review de Assertions

#### 5.1 Assertions en ATCs

| Check | Criterio                            | Estado              |
| ----- | ----------------------------------- | ------------------- |
| A-01  | Status code verificado              | [ ] PASS / [ ] FAIL |
| A-02  | Campos de respuesta verificados     | [ ] PASS / [ ] FAIL |
| A-03  | Echo check (payload vs response)    | [ ] PASS / [ ] FAIL |
| A-04  | Assertions usando Playwright expect | [ ] PASS / [ ] FAIL |

---

## Template de Reporte de Issues

```markdown
# Reporte de Code Review: {TEST-ID}

## Resumen

| Categoría         | Pass | Fail | Total |
| ----------------- | ---- | ---- | ----- |
| Cumplimiento KATA | X    | Y    | 7     |
| Calidad de Código | X    | Y    | 7     |
| Calidad de Test   | X    | Y    | 9     |
| **Total**         | X    | Y    | 23    |

## Veredicto

- [ ] **APROBADO** - Sin issues críticos/altos
- [ ] **NECESITA REVISIÓN** - Tiene issues que deben corregirse
- [ ] **CAMBIOS MENORES** - Puede hacer merge después de corregir

---

## Issues Encontrados

### Issues CRÍTICOS

| ID   | Ubicación         | Issue         | Sugerencia   |
| ---- | ----------------- | ------------- | ------------ |
| C-01 | {archivo}:{línea} | {descripción} | {corrección} |

### Issues ALTOS

| ID   | Ubicación         | Issue         | Sugerencia   |
| ---- | ----------------- | ------------- | ------------ |
| H-01 | {archivo}:{línea} | {descripción} | {corrección} |

---

## Checks Pasados

- [x] K-01: Extiende ApiBase
- [x] K-02: Constructor correcto
- [x] ... (listar todos)
```

---

## Issues Comunes de Integration Tests

### Issue: Tipo de Retorno Incorrecto

```typescript
// ❌ INCORRECTO - No retorna payload
async createUserSuccessfully(payload: CreateUserPayload): Promise<[APIResponse, UserResponse]>

// ✅ CORRECTO - Retorna tupla completa con payload
async createUserSuccessfully(payload: CreateUserPayload): Promise<[APIResponse, UserResponse, CreateUserPayload]>
```

### Issue: Sin Assertion de Status Code

```typescript
// ❌ INCORRECTO - Sin verificar status
@atc('TEST-001')
async createUserSuccessfully(payload: CreateUserPayload) {
  const [response, body] = await this.apiPOST(endpoint, payload);
  return [response, body, payload]; // ¿Status 201? ¿500?
}

// ✅ CORRECTO - Verifica status
@atc('TEST-001')
async createUserSuccessfully(payload: CreateUserPayload) {
  const [response, body] = await this.apiPOST(endpoint, payload);
  expect(response.status()).toBe(201);
  expect(body.id).toBeDefined();
  return [response, body, payload];
}
```

### Issue: Usar Fixture UI para Tests de API

```typescript
// ❌ INCORRECTO - Abre browser innecesariamente
test('crear usuario', async ({ ui }) => {
  // ui fixture abre browser aunque no se use
});

// ✅ CORRECTO - Solo API
test('crear usuario', async ({ api }) => {
  // api fixture no abre browser
});
```

---

## Definiciones de Severidad

| Severidad   | Definición                           | Ejemplos                                        |
| ----------- | ------------------------------------ | ----------------------------------------------- |
| **CRÍTICO** | Rompe arquitectura, test no funciona | Sin `@atc`, tipo de retorno incorrecto          |
| **ALTO**    | Viola estándares importantes         | Sin assertion de status, usando `any`           |
| **MEDIO**   | Best practice                        | Sin factory functions, falta re-export de tipos |
| **BAJO**    | Mejora menor                         | Orden de imports, comentarios JSDoc             |

---

## Checklist Final

Antes de aprobar:

- [ ] Todos los issues CRÍTICOS resueltos
- [ ] Todos los issues ALTOS resueltos
- [ ] Test ejecuta exitosamente: `bun run test <archivo>`
- [ ] Sin errores TypeScript: `bun run type-check`
- [ ] Componente registrado en fixture
- [ ] Tipos exportados correctamente

---

## Después del Review

1. **Si APROBADO**:
   - Actualizar TMS → "Automated"
   - Commit y push
   - Crear PR si se requiere

2. **Si NECESITA REVISIÓN**:
   - Volver a fase de Coding
   - Corregir issues
   - Re-ejecutar review

---

**Review Completo** - Documentar veredicto y compartir.
