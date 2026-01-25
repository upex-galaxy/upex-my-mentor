# QA Learning Methodology

## Propósito

Sistema de aprendizaje progresivo para QA basado en **4 niveles** de complejidad. Genera material educativo adaptado al nivel del estudiante, desde conceptos fundamentales hasta objetivos complejos de arquitectura.

**Por qué existe esta metodología:**

- Aprendizaje estructurado y progresivo
- Cada nivel construye sobre el anterior
- Genera ejercicios prácticos contextualizados
- Conecta teoría con práctica real del proyecto

---

## Niveles de Aprendizaje

```
┌─────────────────────────────────────────────────────────────┐
│                 JERARQUÍA DE APRENDIZAJE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  NIVEL 3: OBJECTIVE-DRIVEN LEARNING                         │
│  ══════════════════════════════════                         │
│  Input: Sistema / Arquitectura completa                     │
│  Genera: OBJETIVO (Épica/Feature)                           │
│  Aprendizaje: Diseñar sistemas de testing completos         │
│                        ↑                                    │
│  NIVEL 2: PROBLEM-DRIVEN LEARNING                           │
│  ═════════════════════════════════                          │
│  Input: Feature / User Story                                │
│  Genera: PROBLEMA (escenario real)                          │
│  Aprendizaje: Resolver problemas de testing                 │
│                        ↑                                    │
│  NIVEL 1: PROMPT-DRIVEN LEARNING                            │
│  ═════════════════════════════════                          │
│  Input: Consigna específica                                 │
│  Genera: EJERCICIOS (paso a paso)                           │
│  Aprendizaje: Ejecutar técnicas de testing                  │
│                        ↑                                    │
│  NIVEL 0: CONCEPT-DRIVEN LEARNING                           │
│  ═════════════════════════════════                          │
│  Input: Consigna específica                                 │
│  Genera: CONCEPTOS (teoría + fundamentos)                   │
│  Aprendizaje: Por qué se hace así                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Prompts Disponibles

| Nivel | Prompt                                       | Input         | Output                    |
| ----- | -------------------------------------------- | ------------- | ------------------------- |
| 0     | `LEVEL0-QA-CONCEPT-DRIVEN-LEARNING-GEN.md`   | Consigna      | Conceptos y fundamentos   |
| 1     | `LEVEL1-QA-PROMPT-DRIVEN-LEARNING-GEN.md`    | Consigna      | Ejercicios paso a paso    |
| 2     | `LEVEL2-QA-PROBLEM-DRIVEN-LEARNING-GEN.md`   | Feature/Story | Problemas reales          |
| 3     | `LEVEL3-QA-OBJECTIVE-DRIVEN-LEARNING-GEN.md` | Sistema       | Objetivos de arquitectura |

---

## Descripción por Nivel

### LEVEL 0: Concept-Driven Learning (Base-game)

**Foco:** Entender el "por qué"

```
Input:  Consigna específica (ej: "Escribe un test case")
Output: Conceptos fundamentales necesarios para entender la consigna

Ejemplo:
- Qué es un test case
- Por qué se estructuran así
- Principios de diseño de tests
- Terminología clave
```

**Cuándo usar:** Estudiante necesita fundamentos teóricos.

---

### LEVEL 1: Prompt-Driven Learning

**Foco:** Aprender haciendo con guía

```
Input:  Consigna específica (ej: "Escribe test cases para login")
Output: Ejercicios guiados paso a paso

Ejemplo:
- Paso 1: Identificar inputs
- Paso 2: Definir expected results
- Paso 3: Escribir el test case
- Paso 4: Revisar cobertura
```

**Cuándo usar:** Estudiante entiende teoría, necesita práctica guiada.

---

### LEVEL 2: Problem-Driven Learning

**Foco:** Resolver problemas reales

```
Input:  Feature o User Story del proyecto
Output: Problema contextualizado para resolver

Ejemplo:
- Escenario: "El login falla intermitentemente"
- Contexto: Código real del proyecto
- Objetivo: Identificar causa y crear tests
- Restricciones: Tiempo, herramientas disponibles
```

**Cuándo usar:** Estudiante domina técnicas, necesita aplicar en contexto real.

---

### LEVEL 3: Objective-Driven Learning

**Foco:** Diseñar soluciones de arquitectura

```
Input:  Sistema o arquitectura completa
Output: Objetivo de testing a nivel feature/épica

Ejemplo:
- Objetivo: "Diseñar estrategia de testing para módulo de pagos"
- Scope: Arquitectura completa del módulo
- Entregables: Test plan, automation strategy, metrics
- Criterios de éxito: Cobertura, tiempo, confiabilidad
```

**Cuándo usar:** Estudiante es senior, necesita pensar a nivel arquitectura.

---

## Flujo de Aprendizaje Recomendado

```
Estudiante nuevo
        ↓
[LEVEL 0] Conceptos fundamentales
        │
        ├── ¿Entiende la teoría? → NO → Repetir LEVEL 0
        │
        ↓ SÍ
[LEVEL 1] Ejercicios guiados
        │
        ├── ¿Ejecuta correctamente? → NO → Volver a LEVEL 0 o repetir
        │
        ↓ SÍ
[LEVEL 2] Problemas reales
        │
        ├── ¿Resuelve problemas? → NO → Más práctica LEVEL 1
        │
        ↓ SÍ
[LEVEL 3] Objetivos de arquitectura
        │
        └── QA Senior / Lead level
```

---

## Uso con el Proyecto

Los prompts pueden usar contexto del proyecto actual:

```
LEVEL 2 con contexto:
- Input: Story real del backlog (.context/PBI/...)
- Output: Problema basado en esa story

LEVEL 3 con contexto:
- Input: Epic real del proyecto
- Output: Objetivo de testing para esa feature
```

---

## Output de Cada Nivel

| Nivel | Tipo de Material       | Formato                         |
| ----- | ---------------------- | ------------------------------- |
| 0     | Documentación teórica  | Markdown con diagramas          |
| 1     | Ejercicios paso a paso | Checklist + ejemplos            |
| 2     | Caso de estudio        | Escenario + contexto + solución |
| 3     | Plan de arquitectura   | Strategy doc + métricas         |

---

## Integración con Fases del Proyecto

| Nivel | Fases Relacionadas                                 |
| ----- | -------------------------------------------------- |
| 0-1   | Onboarding, training inicial                       |
| 2     | Fase 5 (Shift-Left), Fase 10 (Exploratory)         |
| 3     | Fase 11 (Test Documentation), Fase 12 (Automation) |

---

## FAQ

**P: ¿Puedo empezar en LEVEL 2 si ya tengo experiencia?**
R: Sí, pero asegúrate de que los fundamentos (LEVEL 0-1) estén sólidos.

**P: ¿Estos prompts generan certificaciones?**
R: No. Generan material de aprendizaje, no evaluaciones formales.

**P: ¿Puedo usar contexto de otro proyecto?**
R: Sí, solo modifica los paths de input en el prompt.

---

## Documentación Relacionada

- **Main README:** `.prompts/README.md`
- **QA Workflow:** `.prompts/us-qa-workflow.md`
- **Testing Phases:** `.prompts/fase-10-exploratory-testing/`, `.prompts/fase-12-test-automation/`
