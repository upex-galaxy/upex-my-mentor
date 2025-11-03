Actúa como QA Engineer experto en Shift-Left Testing y Test Case Design.

**Input:**
- Story: [usar .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/story.md]
- Feature Test Plan: [usar .context/PBI/epics/EPIC-XXX/feature-test-plan.md]
- SRS relacionado: [usar secciones relevantes de .context/SRS/]

**Genera archivo: test-cases.md** (dentro de .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/)

---

# Test Cases: STORY-XXX - [Story Title]

## Refined Acceptance Criteria

### Scenario 1: [Nombre del escenario refinado]
- **Given:** [Estado inicial del sistema - específico con datos]
- **When:** [Acción del usuario - con datos concretos]
- **Then:**
  - [Resultado esperado 1 - específico]
  - [Resultado esperado 2 - específico]
  - [Resultado esperado 3 - específico]

### Scenario 2: [Nombre del escenario refinado]
- **Given:** [Estado inicial - específico]
- **When:** [Acción - con datos]
- **Then:**
  - [Resultado esperado - específico]
  - [Mensaje de error esperado - texto exacto]
  - [Estado del sistema después del error]

(Continuar con todos los escenarios del story.md, refinados con datos específicos)

---

## Test Cases

### **TC-001: [Título descriptivo del test case]**

- **Related Story:** STORY-XXX
- **Type:** Positive | Negative | Boundary
- **Priority:** High | Medium | Low

**Preconditions:**
- [Estado inicial del sistema necesario]
- [Datos pre-existentes en DB si aplica]

**Test Steps:**
1. [Paso 1 - acción específica con datos]
2. [Paso 2 - acción específica con datos]
3. [Paso 3 - verificación]
...

**Expected Result:**
- [Resultado esperado 1 - específico y verificable]
- [Resultado esperado 2 - específico]
- [Status code esperado: XXX]
- [Response format esperado]

**Test Data:**
- Field1: [valor específico]
- Field2: [valor específico]

---

### **TC-002: [Título del test case negativo]**

- **Related Story:** STORY-XXX
- **Type:** Negative
- **Priority:** High

**Preconditions:**
- [Estado inicial]

**Test Steps:**
1. [Paso con datos inválidos]
2. [Verificar error]

**Expected Result:**
- Status code: 400 Bad Request
- Response: {success: false, error: {code: "ERROR_CODE", message: "Mensaje exacto"}}
- [Verificación adicional: estado de DB no cambió]

**Test Data:**
- Invalid field: [valor inválido específico]

---

(Generar mínimo 6 test cases: 3 positivos, 2 negativos, 1 boundary)

---

## Edge Cases Identified

Listado de casos límite detectados durante el refinement:

1. **Edge Case 1:** [Descripción]
   - **Riesgo:** [Qué puede salir mal]
   - **Test Case:** TC-XXX cubre este caso

2. **Edge Case 2:** [Descripción]
   - **Riesgo:** ...
   - **Test Case:** ...

---

## Test Data Summary

| Type            | Count | Examples   |
| --------------- | ----- | ---------- |
| Valid data      | X     | [ejemplos] |
| Invalid data    | Y     | [ejemplos] |
| Boundary values | Z     | [ejemplos] |

---

**Formato:** Markdown estructurado, listo para copiar a .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/test-cases.md

**Restricciones:**
- Test cases específicos y ejecutables
- Datos de prueba concretos (no placeholders genéricos)
- Mínimo 6 test cases por story
- Coverage de happy path + error cases + boundaries
- Expected results verificables

**Post-generación:** Crear test cases en Jira Xray y linkear con story.
