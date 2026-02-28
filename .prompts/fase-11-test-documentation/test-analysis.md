# Test Analysis

> Analizar el contexto completo de una User Story para identificar candidatos de pruebas de regresión.

---

## Propósito

Recopilar y analizar toda la información disponible sobre una funcionalidad para identificar qué escenarios deben convertirse en pruebas de regresión (manuales o automatizadas).

**⚠️ CONTEXTO CRÍTICO:**

La User Story ya está en estado **QA Approved**, lo que significa:

- ✅ Exploratory testing COMPLETADO
- ✅ TODAS las pruebas YA PASARON
- ✅ Los bugs encontrados YA SE CERRARON
- ✅ La funcionalidad es ESTABLE

**NO estamos diseñando tests para ejecutar**. Estamos decidiendo **cuáles de las pruebas ya ejecutadas valen la pena mantener en regresión** para proteger contra cambios futuros.

---

## Pre-requisitos

**Cargar contexto obligatorio:**

```
Leer: .context/guidelines/QA/jira-test-management.md
```

**Herramientas requeridas:**

- MCP Atlassian (para leer Jira)

---

## Input Requerido

Proveer **al menos uno** de los siguientes:

1. **User Story ID** - Para análisis completo desde Jira
2. **Epic ID** - Para análisis de múltiples stories
3. **Exploratory session notes** - Path o contenido

---

## Nomenclatura Obligatoria de Tests

**Formato:** `Validar <CORE> <CONDITIONAL>`

| Componente    | Qué es                                       | Ejemplos                                             |
| ------------- | -------------------------------------------- | ---------------------------------------------------- |
| `CORE`        | El comportamiento principal (verbo + objeto) | `login exitoso`, `visualización de reviews`          |
| `CONDITIONAL` | La condición que hace único este escenario   | `con credenciales válidas`, `cuando hay 10+ reseñas` |

**Ejemplos correctos:**

- ✅ `Validar visualización de reviews cuando el mentor tiene múltiples reseñas`
- ✅ `Validar mensaje de error con opción de reintento cuando la API retorna 500`
- ❌ `Empty state` (muy vago, no es un flujo)
- ❌ `API error handling` (característica, no escenario)
- ❌ `Mobile responsive` (transversal, no es test separado)

**Referencia completa:** `.context/guidelines/QA/jira-test-management.md`

---

## Workflow

### Fase 1: Recopilar Contexto desde Jira

**Usar MCP Atlassian para obtener:**

```
1. User Story completa:
   Tool: mcp__atlassian__jira_get_issue
   - Summary, Description, Acceptance Criteria
   - Status actual (debe ser QA Approved)
   - Labels y componentes

2. Comentarios de la US:
   Tool: mcp__atlassian__jira_get_issue (incluye comentarios)
   - Notas de desarrollo
   - Feedback de QA
   - Discusiones técnicas

3. Issues enlazadas:
   - Bugs relacionados (is blocked by, causes) ← CRÍTICO para riesgo
   - Sub-tasks
   - Otras stories relacionadas (relates to)
   - Tests existentes (is tested by)

4. Epic padre (si aplica):
   - Contexto de negocio más amplio
   - Otras stories del mismo epic
```

**Extraer de cada fuente:**

| Fuente            | Qué buscar                                 |
| ----------------- | ------------------------------------------ |
| Description       | Acceptance Criteria, reglas de negocio     |
| Comentarios US    | Edge cases discutidos, decisiones técnicas |
| Comentarios Bugs  | Problemas conocidos, áreas de riesgo       |
| Sub-tasks         | Detalle de implementación                  |
| Exploratory notes | Escenarios validados, observaciones        |

---

### Fase 1.5: Recopilar Tests Ya Documentados

**⚠️ IMPORTANTE:** NO inventar tests nuevos. Buscar los que YA existen:

**Fuentes de tests existentes:**

| Fuente                   | Path/Ubicación                                               | Qué contiene                        |
| ------------------------ | ------------------------------------------------------------ | ----------------------------------- |
| **Acceptance Test Plan** | `.context/PBI/epics/.../stories/.../acceptance-test-plan.md` | Test cases de Shift-Left            |
| **Comentarios en Jira**  | Comentario "🧪 Acceptance Test Plan" en la US                | Test cases documentados             |
| **Session Notes**        | Notas de exploratory testing                                 | Escenarios validados                |
| **Bugs cerrados**        | Issues enlazadas con status CLOSED                           | Áreas que fallaron y se corrigieron |

**Reutilizar nomenclatura existente:**

Si un test ya fue documentado en Shift-Left como:

```
Validar visualización completa de reviews cuando el mentor tiene múltiples reseñas
```

Usar ESA MISMA nomenclatura en todo el análisis para mantener trazabilidad.

---

### Fase 2: Separar Características Transversales vs Escenarios Reales

**⚠️ CRÍTICO:** Antes de listar escenarios, identificar qué es un TEST REAL vs qué es una CARACTERÍSTICA que se valida DENTRO de los tests.

#### Características Transversales (NO son tests separados)

Estas se validan **DENTRO** de cada test, no como tests independientes:

| Característica        | Cómo se valida                                         | Ejemplo                                 |
| --------------------- | ------------------------------------------------------ | --------------------------------------- |
| **Mobile responsive** | Ejecutar cada test en viewport mobile Y desktop        | No crear test "Mobile responsive"       |
| **XSS prevention**    | Incluir datos con caracteres especiales en test data   | No crear test "XSS prevention"          |
| **Performance**       | Medir tiempo de carga en cada test                     | No crear test "Performance"             |
| **Accesibilidad**     | Assertions de a11y en tests UI                         | No crear test "Accessibility"           |
| **API contract**      | Verificar responses en cada test con API               | No crear test "API validation"          |
| **Error handling**    | Validar como parte de escenarios negativos específicos | No crear test genérico "Error handling" |

#### Escenarios Reales (SÍ son tests)

Un escenario real es un **FLUJO de usuario** con:

- Objetivo de negocio claro
- Inicio, acción y resultado verificable
- Nomenclatura: `Validar <CORE> <CONDITIONAL>`

**Ejemplo de separación:**

| ❌ Característica (NO es test) | ✅ Escenario Real (SÍ es test)                                     |
| ------------------------------ | ------------------------------------------------------------------ |
| `Empty state`                  | `Validar mensaje informativo cuando el mentor no tiene reseñas`    |
| `API error handling`           | `Validar mensaje de error con reintento cuando la API retorna 500` |
| `Mobile responsive`            | Se valida ejecutando TODOS los tests en mobile                     |
| `Pagination`                   | `Validar navegación entre páginas cuando hay más de 10 reseñas`    |

---

### Fase 2.5: Clasificar Escenarios Identificados

**Para cada escenario REAL encontrado, clasificar:**

#### Por Prioridad de Negocio

| Clasificación | Criterios                            |
| ------------- | ------------------------------------ |
| **Critical**  | Flujo core de negocio, alto impacto  |
| **High**      | Feature importante, uso frecuente    |
| **Medium**    | Feature secundaria, impacto moderado |
| **Low**       | Edge case, uso raro                  |

#### Por Automatizabilidad

| Automatizable              | No Automatizable       |
| -------------------------- | ---------------------- |
| Resultados determinísticos | Requiere juicio humano |
| Locators/APIs estables     | Solo validación visual |
| Pasos repetibles           | Setup complejo/manual  |
| Assertions claras          | Integraciones terceros |
| Pocas dependencias         | Datos muy dinámicos    |

#### Por Tipo de Test

| Tipo            | Descripción                           | Ejemplo                       |
| --------------- | ------------------------------------- | ----------------------------- |
| **E2E**         | Flujo completo de usuario             | Login → Compra → Confirmación |
| **Integration** | Comunicación entre sistemas/APIs      | API Auth → API Productos      |
| **Functional**  | Funcionalidad específica aislada      | Validación de formulario      |
| **Smoke**       | Verificación básica de funcionamiento | App carga, login funciona     |

#### Detección de Necesidad E2E/Integration

**Preguntar:**

1. ¿Esta story es parte de un flujo más grande que cruza múltiples módulos?
   - SÍ → Considerar test E2E que integre con otras stories

2. ¿Esta story consume o provee APIs que otras features usan?
   - SÍ → Considerar test de Integration

3. ¿Esta story es atómica y autocontenida?
   - SÍ → Solo tests Functional/Smoke

---

### Fase 3: Identificar Componentes Reutilizables

**Concepto "Lego":** Cada test atómico puede ser componente de tests más grandes.

```
Analizar si el escenario:

1. Es un COMPONENTE de un flujo E2E más grande
   Ejemplo: "Login exitoso" → componente de "Flujo de compra completo"

2. Puede REUTILIZAR componentes existentes
   Ejemplo: Test de "Editar perfil" puede reutilizar "Login exitoso"

3. Es un flujo E2E COMPLETO que agrupa varios componentes
   Ejemplo: "Checkout completo" = Login + Carrito + Pago + Confirmación
```

**Documentar relaciones:**

```
Escenario: Login exitoso
├── Tipo: Functional (atómico)
├── Componente de: [Checkout E2E, Profile E2E, Admin E2E]
└── Valor: Alto (reutilizable en múltiples flujos)
```

---

### Fase 4: Generar Reporte de Análisis

```markdown
# Test Analysis Report

**User Story:** [STORY-XXX] [Summary]
**Epic:** [EPIC-XXX] [Epic name]
**Fecha:** [Date]
**Analista:** AI Assistant

---

## Fuentes Analizadas

| Fuente            | Issues/Docs         | Insights Clave           |
| ----------------- | ------------------- | ------------------------ |
| User Story        | STORY-XXX           | [Resumen de AC]          |
| Comentarios US    | [N] comentarios     | [Edge cases mencionados] |
| Bugs relacionados | BUG-XXX, BUG-YYY    | [Áreas de riesgo]        |
| Exploratory notes | [Path o referencia] | [Escenarios validados]   |
| Stories enlazadas | STORY-YYY           | [Contexto adicional]     |

---

## Escenarios Identificados

### Critical Priority

| #   | Escenario           | Tipo       | Automatizable | Componente de |
| --- | ------------------- | ---------- | ------------- | ------------- |
| 1   | [Login exitoso]     | Functional | Sí            | Checkout E2E  |
| 2   | [Checkout completo] | E2E        | Sí            | -             |

### High Priority

| #   | Escenario             | Tipo        | Automatizable | Componente de |
| --- | --------------------- | ----------- | ------------- | ------------- |
| 3   | [Validación password] | Functional  | Sí            | Login         |
| 4   | [Error en pago]       | Integration | Sí            | Checkout E2E  |

### Medium Priority

| #   | Escenario       | Tipo       | Automatizable | Notas            |
| --- | --------------- | ---------- | ------------- | ---------------- |
| 5   | [Editar perfil] | Functional | Sí            | Flujo secundario |

### Low Priority / Deferred

| #   | Escenario                   | Razón para Diferir |
| --- | --------------------------- | ------------------ |
| 6   | [Feature X raramente usada] | Uso < 1% usuarios  |

---

## Mapa de Componentes (Lego)
```

E2E: Flujo de Compra Completo
├── [1] Login exitoso (Functional)
├── [NEW] Buscar producto (Functional)
├── [NEW] Agregar al carrito (Functional)
├── [4] Proceso de pago (Integration)
└── [NEW] Confirmación de orden (Functional)

E2E: Gestión de Perfil
├── [1] Login exitoso (reutilizado)
├── [5] Editar perfil (Functional)
└── [NEW] Cambiar password (Functional)

```

---

## Resumen de Candidatos

| Categoría                    | Cantidad |
| ---------------------------- | -------- |
| Total escenarios reales      | [N]      |
| Características transversales| [N] (NO son tests)|
| Candidatos regresión         | [N]      |
| Con bugs previos (riesgo)    | [N]      |
| Automatizables               | [N]      |
| Manual-only                  | [N]      |
| Diferidos                    | [N]      |

---

## Análisis de Bugs Previos (Riesgo)

**⚠️ CRÍTICO:** Los bugs cerrados indican áreas que fallaron antes y PUEDEN volver a fallar.

| Bug ID | Descripción | Área Afectada | ¿Escenario relacionado? | ¿Mayor riesgo? |
|--------|-------------|---------------|------------------------|----------------|
| BUG-XXX | [Descripción] | [Área] | [Escenario #N] | SÍ/NO |

**Regla:** Si un escenario está relacionado con un bug previo, tiene **mayor prioridad** para regresión.

---

## Recomendaciones

### Para Priorización (siguiente paso):

- Escenarios [X, Y] tienen bugs previos → Mayor prioridad
- Escenario [Z] es flujo principal → Considerar
- Escenarios [A, B, C] son edge cases → Probablemente diferir

### Áreas de Riesgo Detectadas:

- [Área X] tuvo bugs previos (BUG-XXX) → **Incluir en regresión**
- [Área Y] mencionada en comentarios como compleja → **Evaluar**

### Necesidad de Tests E2E/Integration:

| ¿Necesita E2E? | Razón |
|----------------|-------|
| SÍ / NO | [Esta story es parte de flujo X que cruza Y y Z] |

| ¿Necesita Integration? | Razón |
|------------------------|-------|
| SÍ / NO | [Esta story consume/provee API X usada por Y] |
```

---

## Decisión Point

Después del análisis, proceder a:

| Resultado                       | Siguiente Paso             |
| ------------------------------- | -------------------------- |
| Candidatos identificados        | → `test-prioritization.md` |
| Sin candidatos (feature simple) | → Cerrar o ir a Fase 12    |
| Necesita más exploración        | → Volver a Fase 10         |

---

## Output

- Reporte de análisis con escenarios clasificados
- Lista de candidatos de regresión
- Mapa de componentes (relaciones lego)
- Recomendaciones para priorización
- Áreas de riesgo identificadas
