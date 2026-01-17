# QA Problem-Driven Learning Generator

> **Aprendizaje Basado en Problemas** - Nivel 2 (Macro-game)
>
> Genera un Problema (Historia de Usuario) a partir del análisis de una Necesidad u Objetivo (Épica/Feature).
> El aprendizaje está en el **"qué hacer"**: el estudiante aprende a diseñar el plan de pruebas para el problema.

---

## Concepto: Problem-Driven Learning

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APRENDIZAJE BASADO EN PROBLEMAS                        │
│                        (Problem-Driven Learning)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INPUT                         PROCESO                        OUTPUT       │
│   ─────                         ───────                        ──────       │
│                                                                             │
│   Necesidad/Objetivo   ───►    Análisis del          ───►    PROBLEMA      │
│   (Épica/Feature)              objetivo + contexto           (Historia de  │
│                                técnico                        Usuario)     │
│                                                                    │       │
│                                                                    ▼       │
│                                                              APRENDIZAJE   │
│                                                              (qué hacer:   │
│                                                               diseñar el   │
│                                                               plan de      │
│                                                               pruebas)     │
│                                                                             │
│   Nivel: MACRO-GAME                                                        │
│   Una épica = Uno o más problemas (historias de usuario)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Relación con los Otros Niveles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         JERARQUÍA DE APRENDIZAJE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   NIVEL 3: OBJECTIVE-DRIVEN LEARNING                                        │
│   ══════════════════════════════════                                        │
│   Input: Sistema / Arquitectura completa                                    │
│   Genera: OBJETIVO (Épica/Feature)                                          │
│   Estudiante aprende: QUÉ problemas identificar                             │
│                                                                             │
│                           ↓                                                 │
│                                                                             │
│   NIVEL 2: PROBLEM-DRIVEN LEARNING (este documento)                         │
│   ═════════════════════════════════════════════════                         │
│   Input: Necesidad/Objetivo (Épica/Feature)                                 │
│   Genera: PROBLEMA (Historia de Usuario)                                    │
│   Estudiante hace: Diseñar plan de pruebas para el problema                 │
│   Estudiante aprende: QUÉ hay que probar                                    │
│                                                                             │
│                           ↓                                                 │
│                                                                             │
│   NIVEL 1: PROMPT-DRIVEN LEARNING                                           │
│   ═══════════════════════════════                                           │
│   Input: Problema (Historia de Usuario)                                     │
│   Genera: CONSIGNAS (instrucciones/casos de prueba)                         │
│   Estudiante aprende: CÓMO ejecutar las pruebas                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Flujo completo:**

1. **Nivel 2** (este): "Aquí tienes un problema (US). ¿Qué pruebas necesitas diseñar?"
2. **Nivel 1** (siguiente): "Aquí tienes las consignas. ¿Cómo las ejecutas?"

---

## Modos de Operación

Este generador puede funcionar en dos modos:

### Modo A: Generar Problema Nuevo

La IA analiza la Épica y **genera una Historia de Usuario nueva** basada en el contexto.

**Cuándo usar:** Cuando quieres practicar con un problema que no conoces previamente.

### Modo B: Seleccionar Problema Existente

La IA analiza la Épica y **selecciona una Historia de Usuario existente** del backlog.

**Cuándo usar:** Cuando quieres trabajar con historias reales del proyecto.

---

## Instrucciones para la IA

### PASO 0: Preguntar el Modo

Antes de comenzar, pregunta al usuario:

```
¿Cómo deseas obtener el problema para este ejercicio?

A) **Generar nuevo**: Crearé una Historia de Usuario basada en el contexto de la Épica
B) **Seleccionar existente**: Elegiré una Historia de Usuario del backlog de la Épica

Responde A o B:
```

### PASO 1: Investigación

**1.1 Lee la documentación de la Épica:**

```
EPIC-[KEY]-[name]/
├── epic.md                      → Descripción, objetivo, scope, requisitos
├── feature-test-plan.md         → Plan de pruebas de la feature (REFERENCIA)
├── feature-implementation-plan.md → Detalles técnicos
└── stories/                     → Lista de User Stories existentes
```

**1.2 Consulta la arquitectura del sistema:**

```
.context/
├── database-functional-map.md  → Schema DB, tablas, relaciones
├── system-architecture.md      → APIs, endpoints, flujos
└── design-system.md            → Componentes UI (si aplica)
```

**1.3 Según el modo seleccionado:**

**Modo A (Generar nuevo):**

- Analiza el objetivo de la Épica
- Identifica un aspecto que pueda convertirse en una US
- Genera una Historia de Usuario coherente con el contexto

**Modo B (Seleccionar existente):**

- Lista las historias en la carpeta `stories/`
- Selecciona una que tenga complejidad adecuada para el aprendizaje
- Extrae su información sin modificarla

### PASO 2: Análisis

Antes de generar los outputs, realiza un análisis que incluya:

1. **Objetivo de la Épica** → ¿Qué necesidad del software resuelve?
2. **Componentes técnicos** → ¿Qué tablas, APIs, componentes están involucrados?
3. **El problema seleccionado/generado** → ¿Qué historia de usuario trabajará el estudiante?
4. **Áreas de riesgo** → ¿Dónde podrían ocurrir bugs en este problema?
5. **Tipos de testing aplicables** → ¿DB? ¿API? ¿UI? ¿Integración?

### PASO 3: Generación de Outputs

Genera **3 documentos** en el siguiente orden:

---

## OUTPUT 1: Análisis (`[epic-key]-testing-analisis.md`)

**Propósito:** Proporcionar contexto técnico sobre la Épica y preparar al estudiante para enfrentar el problema.

**Estructura:**

````markdown
# Análisis: [EPIC-KEY] - [Nombre de la Épica]

> **Aprendizaje Basado en Problemas** (Problem-Driven Learning) - Nivel 2
>
> Este documento proporciona el contexto necesario para abordar el problema de testing.

---

## Contexto de la Épica

### Objetivo de Negocio

[¿Qué problema del usuario/negocio resuelve esta Épica?]

### Descripción General

[Resumen de la funcionalidad que implementa la Épica]

### Alcance (Scope)

**Incluido:**

- [Funcionalidad 1]
- [Funcionalidad 2]

**Excluido:**

- [Funcionalidad fuera de scope]

---

## Arquitectura Técnica Involucrada

### Base de Datos

```
┌─────────────────────────────────────────┐
│            TABLAS INVOLUCRADAS          │
├─────────────────────────────────────────┤
│ tabla_1: [descripción breve]            │
│ tabla_2: [descripción breve]            │
│ Relación: tabla_1.fk → tabla_2.id       │
└─────────────────────────────────────────┘
```

[Descripción de las tablas principales y sus relaciones]

### APIs/Endpoints

| Método | Endpoint | Descripción |
| ------ | -------- | ----------- |
| POST   | /api/... | ...         |
| GET    | /api/... | ...         |
| PUT    | /api/... | ...         |
| DELETE | /api/... | ...         |

### Componentes de UI

[Páginas y componentes principales involucrados]

---

## Historias de Usuario de la Épica

| Story ID | Nombre   | Descripción Breve |
| -------- | -------- | ----------------- |
| [ID-1]   | [Nombre] | [Descripción]     |
| [ID-2]   | [Nombre] | [Descripción]     |
| [ID-3]   | [Nombre] | [Descripción]     |

---

## Áreas de Riesgo Identificadas

1. **[Área 1]**: [Por qué es un área de riesgo]
2. **[Área 2]**: [Por qué es un área de riesgo]
3. **[Área 3]**: [Por qué es un área de riesgo]

---

## Información Adicional

[Cualquier contexto técnico o de negocio relevante para el testing]
````

---

## OUTPUT 2: Problema (`[epic-key]-testing-problema.md`)

**Propósito:** Presentar el PROBLEMA (Historia de Usuario) que el estudiante debe analizar para crear su plan de pruebas.

**Estructura:**

````markdown
# Problema: [EPIC-KEY] - [Nombre del Problema]

> **Aprendizaje Basado en Problemas** (Problem-Driven Learning) - Nivel 2
>
> Este documento presenta el problema que debes resolver.
> Tu tarea es diseñar el plan de pruebas para esta Historia de Usuario.

---

## Modo de Generación

[Indicar si fue: **Generado nuevo** o **Seleccionado del backlog**]

---

## La Historia de Usuario

**ID:** [STORY-ID o "Generada"]

**Como** [tipo de usuario]
**Quiero** [funcionalidad específica]
**Para** [beneficio o valor que obtiene]

---

## Contexto del Problema

[Descripción narrativa que explica:

- Por qué esta historia es importante
- Qué problema del usuario resuelve
- Cómo se relaciona con la Épica general]

---

## Acceptance Criteria

| AC  | Descripción                | Tipo       |
| --- | -------------------------- | ---------- |
| AC1 | [Criterio de aceptación 1] | Happy Path |
| AC2 | [Criterio de aceptación 2] | Happy Path |
| AC3 | [Criterio de aceptación 3] | Negative   |
| AC4 | [Criterio de aceptación 4] | Edge Case  |

---

## Información Técnica Relevante

### Base de Datos

[Tablas directamente involucradas en esta historia - solo nombres y descripción breve]

### APIs

[Endpoints que esta historia utiliza - solo métodos y rutas]

### UI

[Páginas/componentes donde se implementa esta historia]

---

## Tu Tarea

Como QA Engineer, debes crear el **plan de pruebas** para esta Historia de Usuario.

### Entregables Esperados

1. **Estrategia de Testing**
   - ¿Qué tipos de testing son necesarios? (DB, API, UI)
   - ¿Por qué cada tipo es necesario?

2. **Casos de Prueba**
   - Lista de casos de prueba organizados por tipo
   - Prioridad de cada caso (Critical / High / Medium / Low)
   - Descripción clara de qué valida cada caso

3. **Datos de Prueba**
   - ¿Qué precondiciones necesitas?
   - ¿Qué usuarios/datos de prueba requieres?

4. **Cobertura de ACs**
   - Mapeo de cada caso de prueba al AC que verifica

---

## Preguntas Guía

Responde estas preguntas mientras diseñas tu plan:

1. **¿Qué tipos de testing necesitas y por qué?**
   - ¿Necesitas testing de base de datos? ¿Por qué?
   - ¿Necesitas testing de API? ¿Por qué?
   - ¿Necesitas testing de UI? ¿Por qué?

2. **¿Cuáles son los escenarios críticos?**
   - ¿Cuáles son los happy paths?
   - ¿Cuáles son los casos negativos importantes?
   - ¿Qué edge cases podrían romper la funcionalidad?

3. **¿Cómo priorizarías las pruebas?**
   - ¿Qué probarías primero y por qué?
   - ¿Qué podrías dejar para después si hay poco tiempo?

4. **¿Qué datos necesitas?**
   - ¿Qué debe existir en el sistema antes de probar?
   - ¿Qué usuarios con qué roles necesitas?

---

## Pistas

- [Pista 1: Área importante a considerar sin dar la respuesta]
- [Pista 2: Aspecto técnico que no debe ignorar]
- [Pista 3: Riesgo potencial que debería cubrir]

---

## Criterios de Evaluación

Tu plan de pruebas será evaluado en base a:

| Criterio          | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| **Cobertura**     | ¿Identificaste todas las áreas críticas?         |
| **Priorización**  | ¿Ordenaste las pruebas por importancia?          |
| **Especificidad** | ¿Tus casos son concretos y ejecutables?          |
| **Justificación** | ¿Explicaste por qué cada prueba es necesaria?    |
| **Mapeo a ACs**   | ¿Cada AC tiene al menos un caso que lo verifica? |

---

## Formato Sugerido para tu Entrega

```markdown
# Mi Plan de Pruebas: [STORY-ID]

## 1. Estrategia de Testing

### Tipos de Testing Necesarios

| Tipo     | Necesario | Justificación |
| -------- | --------- | ------------- |
| Database | Sí/No     | [Por qué]     |
| API      | Sí/No     | [Por qué]     |
| UI       | Sí/No     | [Por qué]     |

## 2. Casos de Prueba

### Database Testing

| #     | Caso          | Prioridad | AC  |
| ----- | ------------- | --------- | --- |
| DB-01 | [Descripción] | Critical  | AC1 |

### API Testing

| #      | Caso          | Endpoint  | Prioridad | AC  |
| ------ | ------------- | --------- | --------- | --- |
| API-01 | [Descripción] | POST /... | High      | AC2 |

### UI Testing

| #     | Caso          | Página | Prioridad | AC  |
| ----- | ------------- | ------ | --------- | --- |
| UI-01 | [Descripción] | /page  | Medium    | AC3 |

## 3. Datos de Prueba

### Precondiciones

- [Dato que debe existir]

### Usuarios Necesarios

| Rol   | Propósito         |
| ----- | ----------------- |
| [Rol] | [Para probar qué] |
```

---

**Documento de contexto:** `[epic-key]-testing-analisis.md`
**Solución:** `[epic-key]-testing-respuestas.md` (consultar DESPUÉS de completar tu plan)
````

---

## OUTPUT 3: Respuestas (`[epic-key]-testing-respuestas.md`)

**Propósito:** El plan de pruebas completo que el estudiante debería haber creado. Para comparar y aprender.

**Estructura:**

````markdown
# Respuestas: [EPIC-KEY] - [Nombre del Problema]

> **Aprendizaje Basado en Problemas** (Problem-Driven Learning) - Nivel 2
>
> Este documento contiene el plan de pruebas de referencia.
> **Compara tu solución con esta para evaluar tu trabajo.**
> Consulta solo DESPUÉS de haber completado tu propio plan.

---

## Estrategia de Testing

### Tipos de Testing Necesarios

| Tipo                | Necesario     | Justificación                      |
| ------------------- | ------------- | ---------------------------------- |
| Database Testing    | ✅ Sí / ❌ No | [Explicación detallada de por qué] |
| API Testing         | ✅ Sí / ❌ No | [Explicación detallada de por qué] |
| UI Testing          | ✅ Sí / ❌ No | [Explicación detallada de por qué] |
| Integration Testing | ✅ Sí / ❌ No | [Explicación detallada de por qué] |

### Priorización General

1. **Crítico (probar primero):** [Qué y por qué]
2. **Alto (probar después):** [Qué y por qué]
3. **Medio (si hay tiempo):** [Qué y por qué]
4. **Bajo (opcional):** [Qué y por qué]

---

## Plan de Pruebas Completo

### Database Testing

**Objetivo:** [Qué se valida a nivel de base de datos]

| #     | Caso de Prueba      | Prioridad | Tipo      | AC  |
| ----- | ------------------- | --------- | --------- | --- |
| DB-01 | [Descripción clara] | Critical  | Positive  | AC1 |
| DB-02 | [Descripción clara] | High      | Negative  | AC3 |
| DB-03 | [Descripción clara] | Medium    | Edge Case | AC4 |

**Tablas involucradas:** [Lista]

---

### API Testing

**Objetivo:** [Qué se valida a nivel de API]

| #      | Caso de Prueba | Endpoint      | Prioridad | AC  |
| ------ | -------------- | ------------- | --------- | --- |
| API-01 | [Descripción]  | POST /api/... | Critical  | AC1 |
| API-02 | [Descripción]  | GET /api/...  | High      | AC2 |
| API-03 | [Descripción]  | PUT /api/...  | Medium    | AC2 |

---

### UI Testing

**Objetivo:** [Qué se valida a nivel de interfaz]

| #     | Caso de Prueba | Página/Componente | Prioridad | AC  |
| ----- | -------------- | ----------------- | --------- | --- |
| UI-01 | [Descripción]  | /página           | Critical  | AC1 |
| UI-02 | [Descripción]  | /página           | High      | AC2 |

---

## Casos de Prueba Detallados

### [DB-01]: [Nombre del Caso]

**Tipo:** Database Testing
**Prioridad:** Critical
**AC que verifica:** AC1

**Precondiciones:**

- [Lo que debe existir antes]

**Pasos:**

1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado Esperado:**
[Qué debe ocurrir]

**Query de verificación:** (si aplica)

```sql
SELECT ... FROM ... WHERE ...
```

---

[Repetir para cada caso de prueba importante]

---

## Datos de Prueba Necesarios

### Usuarios

| Rol     | ID/Datos        | Propósito                    |
| ------- | --------------- | ---------------------------- |
| [Rol 1] | [Identificador] | [Para probar qué escenarios] |
| [Rol 2] | [Identificador] | [Para probar qué escenarios] |

### Precondiciones en Base de Datos

- [Dato 1 que debe existir]
- [Dato 2 que debe existir]
- [Relación que debe existir]

---

## Mapeo: Casos de Prueba ↔ Acceptance Criteria

| AC  | Casos que lo verifican | Cobertura   |
| --- | ---------------------- | ----------- |
| AC1 | DB-01, API-01, UI-01   | ✅ Completa |
| AC2 | API-02, API-03, UI-02  | ✅ Completa |
| AC3 | DB-02, API-04          | ✅ Completa |
| AC4 | DB-03                  | ⚠️ Parcial  |

---

## Errores Comunes al Diseñar el Plan

1. **[Error común 1]**: [Por qué es un error y cómo evitarlo]
2. **[Error común 2]**: [Por qué es un error y cómo evitarlo]
3. **[Error común 3]**: [Por qué es un error y cómo evitarlo]

---

## Autoevaluación

Compara tu plan con este usando estos criterios:

| Criterio                                     | Puntos  | Cómo Evaluar                          | Tu Puntaje |
| -------------------------------------------- | ------- | ------------------------------------- | ---------- |
| Identificaste los tipos de testing correctos | 20      | ¿Coinciden con la referencia?         | /20        |
| Casos de prueba cubren los ACs               | 25      | ¿Cada AC tiene al menos un caso?      | /25        |
| Priorizaste correctamente                    | 15      | ¿Los críticos son realmente críticos? | /15        |
| Casos específicos y ejecutables              | 20      | ¿Se entiende qué hacer en cada caso?  | /20        |
| Justificación clara                          | 10      | ¿Explicaste el "por qué"?             | /10        |
| Datos de prueba identificados                | 10      | ¿Definiste precondiciones?            | /10        |
| **Total**                                    | **100** |                                       | **/100**   |

**Interpretación:**

- 0-40: Necesitas practicar más el análisis de requisitos
- 41-70: Buen progreso, trabaja en la cobertura y priorización
- 71-90: Muy bien, estás desarrollando pensamiento analítico
- 91-100: Excelente, estás listo para el Nivel 3

---

## Siguiente Paso

Has aprendido QUÉ probar para este problema.

**Opción A:** Practica CÓMO ejecutar las pruebas usando **Nivel 1: Prompt-Driven Learning**

```
Genera consignas de [DB/API/UI] Testing para [STORY-ID]
```

**Opción B:** Sube de nivel y aprende a identificar problemas usando **Nivel 3: Objective-Driven Learning**

```
Genera objetivo de testing para [SISTEMA/CONTEXTO]
```
````

---

## Ejemplo de Uso

**Input del usuario:**

```
Genera problema de testing para @.context/PBI/epics/EPIC-MYM-18-scheduling-booking/
```

**La IA debe:**

1. Preguntar: ¿Modo A (generar nuevo) o Modo B (seleccionar existente)?
2. Leer epic.md, feature-implementation-plan.md
3. Según el modo:
   - **Modo A:** Generar una US coherente con la épica
   - **Modo B:** Seleccionar una US de stories/
4. Generar los 3 archivos en la carpeta del Epic:
   - `mym-18-testing-analisis.md`
   - `mym-18-testing-problema.md`
   - `mym-18-testing-respuestas.md`

---

## Nomenclatura de Archivos

| Output     | Formato                                      |
| ---------- | -------------------------------------------- |
| Análisis   | `[epic-key-lowercase]-testing-analisis.md`   |
| Problema   | `[epic-key-lowercase]-testing-problema.md`   |
| Respuestas | `[epic-key-lowercase]-testing-respuestas.md` |

**Ejemplos:**

- EPIC-MYM-18 → `mym-18-testing-analisis.md`
- EPIC-MYM-32 → `mym-32-testing-analisis.md`

---

## Consideraciones Pedagógicas

1. **El problema debe ser desafiante pero alcanzable:** Suficiente complejidad para aprender, pero no tanto que frustre.

2. **Contexto técnico claro:** El estudiante necesita información para tomar decisiones, pero no la respuesta directa.

3. **Pistas que orientan:** Deben apuntar a áreas importantes sin revelar qué casos crear.

4. **Las respuestas explican el "por qué":** No solo listar casos, sino justificar cada decisión.

5. **Conexión con otros niveles:** Indicar cómo continuar el aprendizaje hacia arriba o hacia abajo.

6. **Autoevaluación objetiva:** Criterios claros para que el estudiante mida su progreso.

---

## Tags

`#problem-driven-learning` `#nivel-2` `#macro-game` `#problemas` `#qa-training` `#test-planning` `#test-strategy`
