# Metodología de Aprendizaje UPEX Galaxy

> Sistema pedagógico de cuatro niveles para el desarrollo profesional en QA

---

## Filosofía de Aprendizaje

En UPEX Galaxy, el aprendizaje sigue una estructura de **cuatro niveles** que refleja cómo evolucionan los profesionales de QA en la industria real.

Cada nivel desarrolla un tipo de habilidad diferente y responde a una pregunta clave:

| Nivel       | Tipo de Habilidad    | Pregunta Clave             |
| ----------- | -------------------- | -------------------------- |
| **Nivel 0** | Conceptual / Teórica | ¿POR QUÉ se hace así?      |
| **Nivel 1** | Técnica / Mecánica   | ¿CÓMO lo hago?             |
| **Nivel 2** | Analítica / Táctica  | ¿QUÉ debo hacer?           |
| **Nivel 3** | Estratégica          | ¿QUÉ problemas identifico? |

---

## La Fórmula de los Generadores

Cada nivel tiene un **documento generador** que funciona con la misma fórmula:

```
INPUT → [Análisis de la IA] → OUTPUT (tarea) + RESPUESTAS (para comparar)
```

- **La IA** se encarga del análisis
- **El estudiante** trabaja en resolver la tarea
- **Las respuestas** sirven para autoevaluación

---

## Los Cuatro Niveles

### Nivel 0: Aprendizaje Basado en Conceptos (Base-game)

**Nombre técnico:** Concept-Driven Learning
**Generador:** `qa-concept-driven-learning-generator.md`

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT              GENERA              ESTUDIANTE APRENDE  │
│  ─────              ──────              ─────────────────   │
│  Consigna    ───►   Conceptos    ───►   POR QUÉ se hace    │
│  (instrucción)      (teoría,            de esa manera      │
│                     fundamentos)                            │
└─────────────────────────────────────────────────────────────┘
```

**¿Qué recibe?** Una consigna específica del Nivel 1

**¿Qué genera la IA?** Conceptos: la solución de la consigna + teoría y fundamentos que explican por qué se hace así

**¿Qué hace el estudiante?** Responde un quiz para demostrar comprensión de los conceptos

**Ejemplo:**

- _Consigna:_ "Realiza una petición GET al endpoint /api/users"
- _Conceptos:_ Qué es HTTP, qué es GET, qué es un endpoint, qué es REST, por qué se usa GET para consultar

**Seniority:** Trainee. Construyendo bases teóricas.

---

### Nivel 1: Aprendizaje Basado en Consignas (Micro-game)

**Nombre técnico:** Prompt-Driven Learning
**Generador:** `qa-prompt-driven-learning-generator.md`

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT              GENERA              ESTUDIANTE APRENDE  │
│  ─────              ──────              ─────────────────   │
│  Problema    ───►   Consignas    ───►   CÓMO ejecutar      │
│  (User Story)       (instrucciones)     las pruebas        │
└─────────────────────────────────────────────────────────────┘
```

**¿Qué recibe?** Un problema específico (Historia de Usuario, Historia Técnica, Deuda Técnica)

**¿Qué genera la IA?** Consignas: instrucciones específicas que el estudiante debe ejecutar (casos de prueba, validaciones)

**¿Qué hace el estudiante?** Ejecuta las consignas. Descubre CÓMO hacer cada cosa.

**Ejemplo:**

- _Consigna:_ "Verifica que el endpoint POST /api/users devuelve 400 cuando el email está vacío"
- _El estudiante aprende:_ Cómo usar Postman, estructurar requests, interpretar responses

**Seniority:** Junior. Desarrollando habilidades técnicas.

---

### Nivel 2: Aprendizaje Basado en Problemas (Macro-game)

**Nombre técnico:** Problem-Driven Learning
**Generador:** `qa-problem-driven-learning-generator.md`

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT              GENERA              ESTUDIANTE APRENDE  │
│  ─────              ──────              ─────────────────   │
│  Necesidad   ───►   Problema     ───►   QUÉ probar         │
│  (Épica)            (User Story)        (diseñar plan)     │
└─────────────────────────────────────────────────────────────┘
```

**¿Qué recibe?** Una necesidad u objetivo (Épica, Feature)

**¿Qué genera la IA?** Un problema: una Historia de Usuario para analizar

**¿Qué hace el estudiante?** Diseña el plan de pruebas. Identifica QUÉ hay que probar.

**Ejemplo:**

- _Problema:_ "Como usuario, quiero pagar con tarjeta de crédito para completar mi compra"
- _El estudiante identifica:_ Qué flujos probar, qué validaciones hacer, qué casos negativos considerar

**Seniority:** Mid-level. Desarrollando pensamiento analítico.

---

### Nivel 3: Aprendizaje Basado en Objetivos (Meta-game)

**Nombre técnico:** Objective-Driven Learning
**Generador:** `qa-objective-driven-learning-generator.md`

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT              GENERA              ESTUDIANTE APRENDE  │
│  ─────              ──────              ─────────────────   │
│  Sistema     ───►   Objetivo     ───►   QUÉ problemas      │
│  (Arquitectura)     (Épica)             identificar        │
└─────────────────────────────────────────────────────────────┘
```

**¿Qué recibe?** Un sistema o contexto completo (arquitectura, base de datos, APIs)

**¿Qué genera la IA?** Un objetivo: una Épica o Feature

**¿Qué hace el estudiante?** Identifica los problemas (Historias de Usuario) que componen ese objetivo.

**Ejemplo:**

- _Objetivo:_ "El sistema debe permitir gestión completa del carrito de compras"
- _El estudiante identifica:_ Qué historias de usuario son necesarias, qué priorizar, qué dependencias existen

**Seniority:** Senior / Lead. Desarrollando visión estratégica.

---

## Flujo en Cascada

En un proyecto real de software, el flujo va de arriba hacia abajo:

```
                    SISTEMA
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │  Nivel 3: Objective-Driven Learning  │
    │  Genera: OBJETIVO (Épica)            │
    └──────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │  Nivel 2: Problem-Driven Learning    │
    │  Genera: PROBLEMA (Historia de Usuario) │
    └──────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │  Nivel 1: Prompt-Driven Learning     │
    │  Genera: CONSIGNAS (Casos de Prueba) │
    └──────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │  Nivel 0: Concept-Driven Learning    │
    │  Genera: CONCEPTOS (Teoría, Por qué) │
    └──────────────────────────────────────┘
                       │
                       ▼
                  COMPRENSIÓN
```

---

## Flujo de Aprendizaje

El estudiante elige **desde dónde arrancar** según su nivel actual:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  TRAINEE                                                                │
│  ───────                                                                │
│  Arranca desde Nivel 0 (Conceptos)                                      │
│  → Recibe teoría y fundamentos                                          │
│  → Comprende el "por qué"                                               │
│  → Responde quiz para validar comprensión                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  JUNIOR                                                                 │
│  ──────                                                                 │
│  Arranca desde Nivel 1 (Consignas)                                      │
│  → Recibe instrucciones claras                                          │
│  → Aprende a ejecutar                                                   │
│  → Desarrolla habilidades técnicas                                      │
│  → Si no entiende algo, baja a Nivel 0                                  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  MID-LEVEL                                                              │
│  ─────────                                                              │
│  Arranca desde Nivel 2 (Problemas)                                      │
│  → Recibe un problema para analizar                                     │
│  → Diseña el plan de pruebas                                            │
│  → Luego ejecuta (puede usar Nivel 1 para practicar)                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SENIOR / LEAD                                                          │
│  ────────────                                                           │
│  Arranca desde Nivel 3 (Objetivos)                                      │
│  → Recibe un objetivo para descomponer                                  │
│  → Identifica los problemas                                             │
│  → Diseña planes para cada uno                                          │
│  → Ejecuta las pruebas                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Regla importante:** Mientras más arriba arranques, más trabajo haces por tu cuenta. Y siempre puedes bajar de nivel si necesitas reforzar algo.

---

## Tabla de Referencia Completa

| Aspecto                   | Nivel 0: Conceptos              | Nivel 1: Consignas              | Nivel 2: Problemas              | Nivel 3: Objetivos              |
| ------------------------- | ------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- |
| **Nombre EN**             | Concept-Driven Learning         | Prompt-Driven Learning          | Problem-Driven Learning         | Objective-Driven Learning       |
| **Nombre ES**             | Aprendizaje Basado en Conceptos | Aprendizaje Basado en Consignas | Aprendizaje Basado en Problemas | Aprendizaje Basado en Objetivos |
| **Alias**                 | Base-game                       | Micro-game                      | Macro-game                      | Meta-game                       |
| **Input abstracto**       | Consigna                        | Problema                        | Necesidad/Objetivo              | Sistema/Contexto                |
| **Input en software**     | Consigna de Nivel 1             | User Story, Technical Story     | Épica, Feature                  | Arquitectura, DB, APIs          |
| **La IA genera**          | Conceptos (teoría, fundamentos) | Consignas (casos de prueba)     | Problema (historia de usuario)  | Objetivo (épica)                |
| **El estudiante hace**    | Comprender (responder quiz)     | Ejecutar las consignas          | Diseñar el plan de pruebas      | Identificar los problemas       |
| **El estudiante aprende** | POR QUÉ se hace así             | CÓMO ejecutar                   | QUÉ hacer                       | QUÉ identificar                 |
| **Tipo de habilidad**     | Conceptual / Teórica            | Técnica / Mecánica              | Analítica / Táctica             | Estratégica                     |
| **Seniority**             | Trainee                         | Junior                          | Mid-level                       | Senior / Lead                   |

---

## Glosario de Términos

| Término                  | Definición                                                        | Ejemplo en Software                                       |
| ------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------- |
| **Sistema**              | El contexto técnico completo                                      | Arquitectura, Base de datos, APIs                         |
| **Objetivo / Necesidad** | Una funcionalidad grande o requisito de negocio                   | Épica, Feature                                            |
| **Problema**             | Una unidad de trabajo específica derivada de un objetivo          | Historia de Usuario, Historia Técnica                     |
| **Consigna**             | Una instrucción específica a ejecutar                             | Caso de prueba, Validación                                |
| **Concepto**             | Un conocimiento o fundamento necesario para entender una consigna | Qué es REST, Cómo funciona SQL, Por qué usamos assertions |

---

## Independencia de los Niveles

Los niveles **no dependen entre sí** para ser usados. Un estudiante puede:

- Tomar una consigna y bajar a **Nivel 0** si no entiende el "por qué"
- Tomar una historia de usuario existente → Usar directamente **Nivel 1**
- Tomar una épica existente → Usar directamente **Nivel 2**
- Tomar el sistema completo → Usar **Nivel 3**

Cada generador puede seleccionar un elemento existente del proyecto o generar uno nuevo (excepto Nivel 0 que siempre recibe una consigna).

---

## Archivos Generados por Nivel

### Nivel 0: Conceptos

| Archivo                          | Propósito                                            |
| -------------------------------- | ---------------------------------------------------- |
| `[area]-conceptos-analisis.md`   | La consigna, su solución, y los conceptos explicados |
| `[area]-conceptos-quiz.md`       | Preguntas de opción múltiple (A, B, C, D)            |
| `[area]-conceptos-respuestas.md` | Respuestas correctas con explicaciones               |

Donde `[area]` puede ser: `api`, `db`, `ui`

### Nivel 1: Consignas

| Archivo                        | Propósito                                 |
| ------------------------------ | ----------------------------------------- |
| `[tipo]-testing-analisis.md`   | Contexto y mapeo de ACs a consignas       |
| `[tipo]-testing-consignas.md`  | Instrucciones a ejecutar (sin soluciones) |
| `[tipo]-testing-respuestas.md` | Soluciones para comparar                  |

Donde `[tipo]` puede ser: `db`, `api`, `ui`

### Nivel 2: Problemas

| Archivo                        | Propósito                           |
| ------------------------------ | ----------------------------------- |
| `[epic]-testing-analisis.md`   | Contexto de la épica y arquitectura |
| `[epic]-testing-problema.md`   | La historia de usuario a analizar   |
| `[epic]-testing-respuestas.md` | El plan de pruebas de referencia    |

### Nivel 3: Objetivos

| Archivo                            | Propósito                              |
| ---------------------------------- | -------------------------------------- |
| `[sistema]-objetivo-analisis.md`   | Contexto del sistema completo          |
| `[sistema]-objetivo-necesidad.md`  | La épica/objetivo a descomponer        |
| `[sistema]-objetivo-respuestas.md` | Las historias de usuario de referencia |

---

## Aplicación en UPEX Galaxy

En la plataforma, cada proyecto de software tiene:

```
proyecto/
├── .context/
│   ├── database-functional-map.md    ← Sistema (Nivel 3)
│   ├── system-architecture.md        ← Sistema (Nivel 3)
│   └── PBI/
│       └── epics/
│           ├── EPIC-001/             ← Objetivo (Nivel 2)
│           │   ├── epic.md
│           │   └── stories/
│           │       ├── STORY-001/    ← Problema (Nivel 1)
│           │       └── STORY-002/
│           └── EPIC-002/
└── ...
```

El estudiante elige su nivel y usa el generador correspondiente.

---

## Comandos de Uso

### Nivel 0: Conceptos

```
Genera conceptos para esta consigna: "[texto de la consigna]"
```

### Nivel 1: Consignas

```
Genera consignas de [DB/API/UI] Testing para @.context/PBI/epics/EPIC-XXX/stories/STORY-YYY/
```

### Nivel 2: Problemas

```
Genera problema de testing para @.context/PBI/epics/EPIC-XXX/
```

### Nivel 3: Objetivos

```
Genera objetivo de testing para @.context/
```

---

## Progresión Recomendada

1. **Semanas 1-2:** Usar Nivel 0 para construir bases conceptuales sólidas
2. **Semanas 3-6:** Dominar Nivel 1 con diferentes tipos de testing (DB, API, UI)
3. **Semanas 7-10:** Practicar Nivel 2 con épicas de complejidad creciente
4. **Semanas 11-12:** Abordar Nivel 3 para desarrollar visión estratégica

**Nota:** Los niveles no se "superan". Un profesional avanzado puede volver a Nivel 0 si encuentra un concepto nuevo que no domina.

---

## Cuándo Bajar de Nivel

| Situación                                                        | Acción         |
| ---------------------------------------------------------------- | -------------- |
| Estás en Nivel 1 y no entiendes POR QUÉ una consigna se hace así | Baja a Nivel 0 |
| Estás en Nivel 2 y no sabes CÓMO ejecutar una prueba             | Baja a Nivel 1 |
| Estás en Nivel 3 y no sabes QUÉ probar en un problema            | Baja a Nivel 2 |

---

## Recursos

| Recurso           | Ubicación                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| Generador Nivel 0 | `.prompts/QA-learning-methodology/LEVEL0-QA-CONCEPT-DRIVEN-LEARNING-GEN.md`   |
| Generador Nivel 1 | `.prompts/QA-learning-methodology/LEVEL1-QA-PROMPT-DRIVEN-LEARNING-GEN.md`    |
| Generador Nivel 2 | `.prompts/QA-learning-methodology/LEVEL2-QA-PROBLEM-DRIVEN-LEARNING-GEN.md`   |
| Generador Nivel 3 | `.prompts/QA-learning-methodology/LEVEL3-QA-OBJECTIVE-DRIVEN-LEARNING-GEN.md` |

---

_Metodología Pedagógica UPEX Galaxy - Versión 4.0_
