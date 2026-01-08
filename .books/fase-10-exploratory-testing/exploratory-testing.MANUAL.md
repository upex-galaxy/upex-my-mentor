<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Exploratory Testing - Manual

> **Fase:** 10 - Exploratory Testing
> **Tiempo estimado:** 60-90 minutos (sesión completa)
> **Herramientas:** Browser DevTools, Postman, DBeaver/SQL Client, Jira

---

## Objetivo

Ejecutar testing exploratorio manual para validar funcionalidad y descubrir defectos **ANTES** de invertir en automatización. Esta fase implementa el concepto **Trifuerza**: validación en las tres capas (UI, API, DB).

**¿Por qué exploratory testing primero?**

- Feedback rápido (minutos vs horas)
- Encuentra bugs que los tests automatizados no detectan
- Valida features antes de automatizar
- Shift-left = feedback tan temprano como sea posible

---

## Conceptos Clave

### 🔑 Trifuerza Testing

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIFUERZA TESTING                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     UI      │  │     API     │  │     DB      │         │
│  │  Testing    │  │  Testing    │  │  Testing    │         │
│  │             │  │             │  │             │         │
│  │  Browser    │  │  Postman    │  │   DBeaver   │         │
│  │  DevTools   │  │  cURL       │  │   SQL       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│        Validar         Validar         Validar              │
│        experiencia     contratos       integridad           │
│        usuario         API, RLS        de datos             │
└─────────────────────────────────────────────────────────────┘
```

### 🔑 Smoke Test vs Exploratory Testing

| Aspecto       | Smoke Test                  | Exploratory Testing                 |
| ------------- | --------------------------- | ----------------------------------- |
| **Duración**  | 5-10 minutos                | 60-90 minutos                       |
| **Objetivo**  | Validar deployment funciona | Encontrar bugs y edge cases         |
| **Cobertura** | Solo happy path             | Happy path + edge cases + negatives |
| **Cuándo**    | Inmediatamente post-deploy  | Después de smoke test PASSED        |

### 🔑 Session-Based Testing

- **Charter:** Define qué vas a explorar y por qué
- **Time-box:** Sesiones de 30-45 minutos máximo
- **Session Notes:** Documentas hallazgos mientras exploras

### 🔑 Niveles de Severidad

| Severidad    | Criterio                                     | Ejemplos                                |
| ------------ | -------------------------------------------- | --------------------------------------- |
| **Critical** | Funcionalidad core bloqueada, sin workaround | Login roto, checkout falla              |
| **High**     | Feature mayor rota, workaround difícil       | Búsqueda retorna resultados incorrectos |
| **Medium**   | Issue con workaround fácil                   | Sorting no funciona pero filtering sí   |
| **Low**      | Cosmético, no afecta funcionalidad           | Typo, alineación, glitch menor          |

---

## Pre-requisitos

Antes de comenzar, necesitas:

- [ ] **Feature deployed a staging** - CI/CD pasó exitosamente
- [ ] **User Story en status "Ready For QA"**
- [ ] **Acceso a staging URL** - `https://[project]-develop.vercel.app`
- [ ] **Credenciales de test** - Usuario de prueba configurado
- [ ] **Test cases de Shift-Left** (o Acceptance Criteria si no existen)
- [ ] **Browser con DevTools** - Chrome/Firefox recomendado

**Para API Testing adicional:**

- [ ] Postman instalado y workspace configurado
- [ ] Conocimiento de los endpoints de la API
- [ ] API Keys/tokens de test

**Para DB Testing adicional:**

- [ ] Cliente SQL (DBeaver, TablePlus, pgAdmin)
- [ ] Conexión a base de datos de staging
- [ ] Conocimiento del schema de DB

---

## Paso a Paso

---

## PARTE 1: SMOKE TEST (5-10 minutos)

> **Objetivo:** Validar que el deployment es funcional antes de invertir tiempo en exploratory testing.

### Paso 1.1: Preparar Entorno de Testing

1. **Abrir browser en modo incógnito** (evita cache y cookies previas)
2. **Abrir DevTools (F12)**
   - Tab Console: Para ver errores JavaScript
   - Tab Network: Para ver llamadas API
3. **Navegar a staging URL:**
   ```
   https://[project]-develop.vercel.app
   ```

### Paso 1.2: Validar Acceso Básico

**Checklist de acceso básico:**

| Check | Qué Validar               | Cómo Validar                                 |
| ----- | ------------------------- | -------------------------------------------- |
| ✅    | App carga sin errores 500 | Landing page muestra contenido               |
| ✅    | No hay errores en console | F12 → Console → Sin errores rojos            |
| ✅    | Assets cargan             | CSS aplicado, imágenes visibles, JS funciona |

**Si algo falla aquí → STOP. Reportar blocker y no continuar.**

### Paso 1.3: Validar Autenticación (Si Aplica)

**Flujo de login:**

1. Navegar a `/login`
2. Ingresar credenciales de test:
   ```
   Email: test@example.com
   Password: Test123!
   ```
3. Click en "Login"

**Checklist de autenticación:**

| Check | Qué Validar     | Resultado Esperado                |
| ----- | --------------- | --------------------------------- |
| ✅    | Login funciona  | Redirect a dashboard/home         |
| ✅    | Sesión persiste | Refresh (F5) → sigue logueado     |
| ✅    | Logout funciona | Click logout → redirect a landing |

### Paso 1.4: Validar Happy Path de la Story

**Leer el Acceptance Criteria de la story y ejecutar el flujo principal:**

1. **Identificar el happy path** del AC
2. **Ejecutar paso a paso** cada acción
3. **Validar resultado esperado** en cada paso

**Ejemplo genérico:**

```markdown
Happy Path: [Nombre del flujo según AC]

1. [ ] Navegar a [ruta]
2. [ ] Click en [elemento]
3. [ ] Verificar [resultado esperado]
4. [ ] Ingresar [datos]
5. [ ] Submit → [resultado final]
```

### Paso 1.5: Validar Integración Backend

**En Network tab (F12):**

1. Ejecutar el happy path nuevamente
2. Observar las llamadas API

**Checklist de integración:**

| Check | Qué Validar                    | Resultado Esperado           |
| ----- | ------------------------------ | ---------------------------- |
| ✅    | API calls retornan 200         | No hay 500s ni 404s          |
| ✅    | Datos se envían correctamente  | Request payload correcto     |
| ✅    | Datos se reciben correctamente | Response tiene data esperada |
| ✅    | Datos persisten                | Refresh → datos siguen ahí   |

### Paso 1.6: Decisión Smoke Test

```
┌─────────────────────────────────────────────────────────────┐
│                    SMOKE TEST RESULT                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ PASSED                    ❌ FAILED                      │
│  │                            │                              │
│  │                            ├── Reportar bug BLOCKER       │
│  │                            ├── NO continuar               │
│  │                            └── Esperar fix y re-test      │
│  │                                                           │
│  └── Continuar con                                           │
│      Exploratory Testing                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## PARTE 2: EXPLORATORY TESTING - UI (30-45 minutos)

> **Objetivo:** Explorar la interfaz de usuario para encontrar bugs, edge cases, y problemas de UX.

### Paso 2.1: Crear Test Charter

Antes de explorar, define qué vas a testear:

```markdown
## Test Charter

**Feature:** [Nombre de la feature]
**Scope:** [US/Epic siendo testeado]
**Duration:** 30-45 minutos
**Explore:** [Área específica a explorar]
**With:** [Qué técnicas usar: boundary, state, etc.]
**To discover:** [Qué tipo de problemas buscar]
```

**Ejemplo:**

```markdown
## Test Charter

**Feature:** Formulario de registro
**Scope:** US-123 - User Registration
**Duration:** 30 minutos
**Explore:** Validaciones de formulario
**With:** Boundary testing, special characters
**To discover:** Problemas de validación y UX
```

### Paso 2.2: Ejecutar Escenarios

**Para cada escenario del charter:**

1. **Ejecutar acciones** paso a paso
2. **Observar resultados** - ¿pasó lo esperado?
3. **Documentar hallazgos** inmediatamente

**Formato de documentación:**

```markdown
### Scenario: [Nombre]

**Steps Executed:**

1. [Acción] → [Resultado]
2. [Acción] → [Resultado]
3. [Acción] → [Resultado]

**Outcome:** [PASSED / ISSUE FOUND]

**Notes:**

- [Observación 1]
- [Observación 2]
```

### Paso 2.3: Técnicas de Edge Case Testing

**Aplicar estas técnicas durante la exploración:**

#### 1. Boundary Testing (Límites)

| Tipo    | Qué Probar            | Ejemplos                              |
| ------- | --------------------- | ------------------------------------- |
| Empty   | Campos vacíos         | Submit formulario vacío               |
| Min     | Valores mínimos       | 1 caracter, 0, -1                     |
| Max     | Valores máximos       | 10000 caracteres, MAX_INT             |
| Special | Caracteres especiales | `<script>`, `'; DROP TABLE`, `¿¡@#$%` |

#### 2. State Testing (Estados)

| Técnica       | Qué Probar                              |
| ------------- | --------------------------------------- |
| Refresh       | Recargar página durante flujo           |
| Back button   | Navegar atrás después de submit         |
| Multiple tabs | Misma acción en 2 tabs simultáneas      |
| Timeout       | Esperar mucho tiempo antes de continuar |
| Offline       | Desconectar internet durante acción     |

#### 3. Data Validation (Validación)

| Tipo           | Qué Probar                            |
| -------------- | ------------------------------------- |
| Email inválido | `test`, `test@`, `@test.com`          |
| Password débil | `123`, `password`, `abc`              |
| Duplicados     | Mismo email/username dos veces        |
| Concurrent     | Editar mismo recurso desde 2 sesiones |

### Paso 2.4: Documentar Edge Cases

**Formato para documentar cada edge case:**

```markdown
### Edge Case: [Descripción]

**Input:** [Qué se probó]
**Expected:** [Qué debería pasar]
**Actual:** [Qué pasó realmente]
**Status:** [PASSED / FAILED / OBSERVATION]
```

**Ejemplo:**

```markdown
### Edge Case: Email con formato inválido

**Input:** "usuario@" (sin dominio)
**Expected:** Mostrar error "Email inválido"
**Actual:** Formulario hace submit sin validación
**Status:** FAILED - Bug encontrado
```

---

## PARTE 3: EXPLORATORY TESTING - API (30-45 minutos)

> **Objetivo:** Validar la API directamente para encontrar bugs que la UI puede ocultar.

### Paso 3.1: Preparar Postman/cURL

**Setup en Postman:**

1. Crear/Abrir workspace del proyecto
2. Configurar environment con variables:
   ```
   base_url: https://[project]-develop.vercel.app/api
   anon_key: [tu_anon_key]
   access_token: [se llena después de login]
   ```

### Paso 3.2: Obtener Token de Autenticación

**Request de login (Supabase):**

```http
POST {{base_url}}/auth/v1/token?grant_type=password
Content-Type: application/json
apikey: {{anon_key}}

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

**Guardar el token:**

- Copiar `access_token` de la respuesta
- Guardar en variable de environment

### Paso 3.3: Explorar Endpoints

**Para cada endpoint relevante a la story:**

```markdown
### Endpoint: [METHOD] [PATH]

**Request:**

- Headers: [Lista de headers]
- Body: [Request body si aplica]

**Expected Response:**

- Status: [Código esperado]
- Body: [Estructura esperada]

**Actual Response:**

- Status: [Código actual]
- Body: [Respuesta resumida]

**Assertions:**

- [ ] Status code correcto
- [ ] Schema de response válido
- [ ] Datos correctos
- [ ] Sin campos inesperados

**Outcome:** [PASSED / FAILED / OBSERVATION]
```

### Paso 3.4: Testing de RLS Policies (Supabase)

> **CRÍTICO para proyectos multi-tenant**

**Test 1: Usuario solo ve sus datos**

```http
GET {{base_url}}/rest/v1/orders
Authorization: Bearer {{token_user_a}}
```

- **Expected:** Solo órdenes del User A
- **Actual:** [Documentar resultado]

**Test 2: Usuario no puede ver datos de otro**

```http
GET {{base_url}}/rest/v1/orders?user_id=eq.{{user_b_id}}
Authorization: Bearer {{token_user_a}}
```

- **Expected:** Array vacío (RLS filtra)
- **Actual:** [Documentar resultado]

**Test 3: Usuario no puede modificar datos de otro**

```http
PATCH {{base_url}}/rest/v1/users?id=eq.{{user_b_id}}
Authorization: Bearer {{token_user_a}}

{"name": "Hacked"}
```

- **Expected:** 0 rows affected
- **Actual:** [Documentar resultado]

⚠️ **Si RLS falla = BUG CRÍTICO DE SEGURIDAD**

### Paso 3.5: Testing de Error Handling

**Probar respuestas de error:**

| Scenario       | Request                  | Expected             |
| -------------- | ------------------------ | -------------------- |
| No auth        | GET sin token            | 401 Unauthorized     |
| Token expirado | GET con token viejo      | 401 Unauthorized     |
| Not found      | GET recurso inexistente  | 404 o 200 con []     |
| Validación     | POST con datos inválidos | 400 Bad Request      |
| Servidor       | (forzar error interno)   | 500 con mensaje útil |

---

## PARTE 4: EXPLORATORY TESTING - DATABASE (20-30 minutos)

> **Objetivo:** Verificar integridad de datos directamente en la base de datos.

### Paso 4.1: Conectar a Base de Datos

**Configurar conexión en DBeaver/cliente SQL:**

```
Host: [db-host].supabase.co
Port: 5432 (PostgreSQL) o 6543 (Pooler)
Database: postgres
User: [user]
Password: [password]
```

### Paso 4.2: Verificar Datos Post-Operación

**Después de operaciones vía UI/API, verificar en DB:**

```sql
-- Verificar que entidad fue creada
SELECT id, user_id, status, created_at
FROM orders
WHERE id = 'order-uuid-aqui';

-- Verificar relaciones
SELECT
    oi.id,
    oi.order_id,
    oi.product_id,
    p.name as product_name
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = 'order-uuid-aqui';
```

### Paso 4.3: Verificar Triggers y Cálculos

```sql
-- Verificar que trigger calculó correctamente
SELECT
    o.id,
    o.total as stored_total,
    SUM(oi.quantity * oi.unit_price) as calculated_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'order-uuid'
GROUP BY o.id, o.total;

-- Comparar: stored_total DEBE = calculated_total
```

### Paso 4.4: Data Integrity Checks

**Queries para encontrar problemas de datos:**

```sql
-- Buscar registros huérfanos
SELECT o.*
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- Buscar valores inválidos
SELECT * FROM order_items WHERE quantity <= 0;
SELECT * FROM products WHERE stock < 0;
SELECT * FROM orders WHERE status NOT IN ('pending','paid','shipped','delivered','cancelled');

-- Buscar cálculos incorrectos
SELECT o.id, o.total, COALESCE(SUM(oi.quantity * oi.unit_price), 0) as calc
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total
HAVING o.total != COALESCE(SUM(oi.quantity * oi.unit_price), 0);
```

### Paso 4.5: Testing de Constraints

**Verificar que constraints están funcionando:**

```sql
-- Test FK (debe fallar)
INSERT INTO order_items (order_id, product_id, quantity)
VALUES ('valid-order-id', 'non-existent-product', 1);
-- Expected: ERROR foreign key violation

-- Test CHECK (debe fallar)
UPDATE orders SET status = 'invalid_status' WHERE id = 'some-id';
-- Expected: ERROR check constraint violation

-- Test UNIQUE (debe fallar)
INSERT INTO users (email, name) VALUES ('existing@email.com', 'Duplicate');
-- Expected: ERROR unique violation
```

---

## PARTE 5: BUG REPORTING

> **Objetivo:** Documentar y reportar defectos encontrados de manera efectiva.

### Paso 5.1: Confirmar que es un Bug Real

Antes de reportar, verifica:

- [ ] ¿Es reproducible? (intentar al menos 2 veces)
- [ ] ¿Es realmente un bug o comportamiento esperado?
- [ ] ¿Existe un bug similar ya reportado en Jira?

### Paso 5.2: Documentar el Bug

**Información requerida:**

```markdown
## Bug Report

**Título:** [EPICNAME]: [COMPONENT]: [ISSUE_SUMMARY]
Ejemplo: "CheckoutFlow: Payment: No muestra error con tarjeta inválida"

**Tipo de Error:**

- [ ] Functional - Feature no funciona como especificado
- [ ] UI/Visual - Layout, estilos, diseño
- [ ] Performance - Lento, timeouts, memoria
- [ ] Data - Datos incorrectos, cálculos mal
- [ ] Integration - APIs terceros, webhooks
- [ ] Security - Auth bypass, exposición de datos

**Severidad:** [Critical/High/Medium/Low]

**Environment:** [Development/Staging/Production]

**Steps to Reproduce:**

1. [Precondición - estado del usuario]
2. [Navegación]
3. [Acción que dispara el bug]
4. [Observar el bug]

**Expected Result:**
[Qué debería pasar según requerimientos]

**Actual Result:**
[Qué pasa realmente - incluir mensajes de error]

**Root Cause (si conocido):**
[Análisis técnico: archivo, función, endpoint]

**Evidence:**

- Screenshot: [Adjuntar]
- Console errors: [Copiar]
- Network tab: [Capturar request/response]

**Workaround (si existe):**
[Solución temporal para lograr el objetivo]
```

### Paso 5.3: Crear Bug en Jira

**Información para crear el ticket:**

| Campo       | Valor                                         |
| ----------- | --------------------------------------------- |
| Project     | [PROJECT_KEY]                                 |
| Issue Type  | Bug                                           |
| Summary     | [Título con formato]                          |
| Priority    | Highest/High/Medium/Low (mapear de severidad) |
| Labels      | `bug`, `exploratory-testing`                  |
| Description | [Template completo]                           |

**Mapeo Severidad → Priority:**

| Severidad | Jira Priority |
| --------- | ------------- |
| Critical  | Highest       |
| High      | High          |
| Medium    | Medium        |
| Low       | Low           |

### Paso 5.4: Adjuntar Evidencia

Asegúrate de adjuntar:

- [ ] Screenshots del error
- [ ] Console errors (copiar texto completo)
- [ ] Network tab (export HAR si es necesario)
- [ ] Video (si el bug es difícil de explicar)
- [ ] Logs relevantes

---

## Session Summary Template

Al finalizar la sesión, genera un resumen:

```markdown
# Exploratory Testing Session Notes

**Date:** [Fecha]
**Feature:** [Feature/US testeado]
**Staging URL:** [URL]
**Duration:** [Tiempo total]

---

## Executive Summary

- **Overall Status:** [PASSED / ISSUES FOUND / BLOCKED]
- **Scenarios Tested:** [X of Y]
- **Issues Found:** [Número]
- **Trifuerza Coverage:**
  - UI Testing: [Done/Not Done]
  - API Testing: [Done/Not Done]
  - DB Testing: [Done/Not Done]

---

## Test Coverage

### UI Testing Results

| Scenario        | Status | Notes             |
| --------------- | ------ | ----------------- |
| Happy path      | PASSED | -                 |
| Form validation | FAILED | Bug: empty submit |
| Edge cases      | PASSED | -                 |

### API Testing Results

| Endpoint      | Status | Notes     |
| ------------- | ------ | --------- |
| GET /products | PASSED | -         |
| POST /orders  | FAILED | RLS issue |
| PUT /settings | PASSED | -         |

### DB Testing Results

| Check          | Status | Notes                |
| -------------- | ------ | -------------------- |
| Data integrity | PASSED | -                    |
| Constraints    | PASSED | All enforced         |
| Triggers       | PASSED | Calculations correct |

---

## Issues Found

### Issue 1: [Título]

- **Severity:** [Critical/High/Medium/Low]
- **Jira:** [PROJ-XXX] (si ya creado)
- **Status:** [Reported/Under Investigation]

---

## Recommendations

### For Automation:

- [Escenarios estables que automatizar]

### For Development:

- [Mejoras técnicas sugeridas]

### For Future Testing:

- [Áreas que necesitan más exploración]

---

## Next Steps

- [ ] Report bugs encontrados
- [ ] Transition US status si PASSED
- [ ] Proceed to Test Documentation (Fase 11)
```

---

## Decision Point Final

```
┌─────────────────────────────────────────────────────────────┐
│               EXPLORATORY TESTING RESULT                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ PASSED                    ❌ ISSUES FOUND                │
│  │                            │                              │
│  ├── Transicionar US          ├── Crear bugs en Jira         │
│  │   a "QA Approved"          ├── Esperar fixes              │
│  │                            └── Re-test después de fix     │
│  └── Proceder a Fase 11:                                     │
│      Test Documentation                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist Final

### Smoke Test

- [ ] App carga sin errores 500
- [ ] No hay errores en console
- [ ] Auth funciona (login/logout)
- [ ] Happy path funciona end-to-end
- [ ] Integración backend OK

### UI Exploratory Testing

- [ ] Charter definido
- [ ] Happy paths explorados
- [ ] Edge cases testeados
- [ ] Boundary testing aplicado
- [ ] State testing aplicado
- [ ] Session notes documentados

### API Exploratory Testing

- [ ] Endpoints relevantes testeados
- [ ] RLS policies verificadas
- [ ] Error handling validado
- [ ] Contracts validados

### DB Exploratory Testing

- [ ] Data integrity verificada
- [ ] Constraints funcionando
- [ ] Triggers ejecutándose correctamente
- [ ] No hay data corruption

### Bug Reporting

- [ ] Todos los bugs documentados
- [ ] Bugs creados en Jira con campos completos
- [ ] Evidencia adjuntada
- [ ] Stories relacionadas actualizadas

---

## Troubleshooting

| Problema               | Causa Probable           | Solución                     |
| ---------------------- | ------------------------ | ---------------------------- |
| App no carga           | Deployment falló         | Verificar CI/CD logs         |
| Login falla            | Credenciales incorrectas | Verificar `.env` de staging  |
| API retorna 401        | Token expirado           | Re-autenticar                |
| API retorna 500        | Error en servidor        | Revisar logs de backend      |
| No puedo conectar a DB | Firewall/permisos        | Verificar whitelist IP       |
| RLS no filtra          | Policy mal configurada   | Revisar policies en Supabase |

---

## Recursos Adicionales

- **QA Workflow completo:** `.prompts/us-qa-workflow.md`
- **KATA Guidelines:** `.context/guidelines/TAE/`
- **Jira Test Management:** `.context/guidelines/QA/jira-test-management.md`

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
