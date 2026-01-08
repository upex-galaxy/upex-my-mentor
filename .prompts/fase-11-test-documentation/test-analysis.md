# Test Analysis

> Analizar el contexto completo de una User Story para identificar candidatos de pruebas de regresión.

---

## Propósito

Recopilar y analizar toda la información disponible sobre una funcionalidad para identificar qué escenarios deben convertirse en pruebas de regresión (manuales o automatizadas).

**Este prompt se ejecuta DESPUÉS de:**

- Exploratory testing completado (US status: QA Approved)
- Session notes documentan escenarios validados

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

## Workflow

### Fase 1: Recopilar Contexto desde Jira

**Usar MCP Atlassian para obtener:**

```
1. User Story completa:
   Tool: mcp__atlassian__getJiraIssue
   - Summary, Description, Acceptance Criteria
   - Status actual
   - Labels y componentes

2. Comentarios de la US:
   Tool: mcp__atlassian__getJiraIssue (incluye comentarios)
   - Notas de desarrollo
   - Feedback de QA
   - Discusiones técnicas

3. Issues enlazadas:
   - Bugs relacionados (is blocked by, causes)
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

### Fase 2: Identificar Escenarios de Prueba

**Para cada escenario encontrado, clasificar:**

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

| Categoría           | Cantidad |
| ------------------- | -------- |
| Total escenarios    | [N]      |
| Candidatos regresión| [N]      |
| Automatizables      | [N]      |
| Manual-only         | [N]      |
| Diferidos           | [N]      |

---

## Recomendaciones

### Para Priorización (siguiente paso):

- Escenarios [1, 2, 3, 4] son candidatos principales
- [1] tiene alto valor por reutilización
- [2] es E2E crítico que agrupa componentes

### Áreas de Riesgo Detectadas:

- [Área X] tuvo bugs previos (BUG-XXX)
- [Área Y] mencionada en comentarios como compleja

### Componentes a Crear Primero:

1. Login exitoso - base para múltiples E2E
2. [Componente Y] - usado en [N] flujos
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
