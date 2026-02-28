# QA Concept-Driven Learning Generator

> **Aprendizaje Basado en Conceptos** - Nivel 0 (Base-game)
>
> Genera conceptos y fundamentos a partir del análisis de una Consigna específica.
> El aprendizaje está en el **"por qué"**: el estudiante comprende por qué las cosas se hacen como se hacen.

---

## Concepto: Concept-Driven Learning

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APRENDIZAJE BASADO EN CONCEPTOS                        │
│                        (Concept-Driven Learning)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INPUT                         PROCESO                        OUTPUT       │
│   ─────                         ───────                        ──────       │
│                                                                             │
│   Consigna            ───►    Análisis de la       ───►     CONCEPTOS      │
│   (instrucción                consigna +                    (teoría,       │
│   específica)                 identificación                fundamentos,   │
│                               de conceptos                  razones)       │
│                               necesarios                          │        │
│                                                                   │        │
│                                                                   ▼        │
│                                                              APRENDIZAJE   │
│                                                              (por qué se   │
│                                                               hace así)    │
│                                                                             │
│   Nivel: BASE-GAME                                                         │
│   Una consigna = Un set de conceptos fundamentales                         │
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
│   NIVEL 2: PROBLEM-DRIVEN LEARNING                                          │
│   ════════════════════════════════                                          │
│   Input: Necesidad/Objetivo (Épica/Feature)                                 │
│   Genera: PROBLEMA (Historia de Usuario)                                    │
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
│                           ↓                                                 │
│                                                                             │
│   NIVEL 0: CONCEPT-DRIVEN LEARNING (este documento)                         │
│   ═════════════════════════════════════════════════                         │
│   Input: Consigna específica                                                │
│   Genera: CONCEPTOS (teoría, fundamentos, razones)                          │
│   Estudiante aprende: POR QUÉ se hace de esa manera                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Flujo de aprendizaje (de menor a mayor):**

1. **Nivel 0** (este): "Aquí tienes los conceptos. ¿Por qué se hace así?"
2. **Nivel 1**: "Aquí tienes las consignas. ¿Cómo las ejecutas?"
3. **Nivel 2**: "Aquí tienes un problema. ¿Qué pruebas diseñas?"
4. **Nivel 3**: "Aquí tienes un objetivo. ¿Qué problemas identificas?"

---

## Cuándo Usar Este Nivel

Este nivel es útil cuando el estudiante:

- Es **Trainee** y necesita construir bases sólidas antes de ejecutar
- Encuentra una consigna en Nivel 1 y **no entiende por qué** se hace así
- Quiere reforzar **conceptos teóricos** detrás de una técnica
- Necesita entender el **fundamento** antes de memorizar el procedimiento

**Ejemplo de uso:**

```
El estudiante está en Nivel 1 y recibe la consigna:
"Realiza una petición GET al endpoint /api/users con el header Authorization: Bearer {token}"

No entiende:
- ¿Qué es un endpoint?
- ¿Por qué GET y no otro método?
- ¿Qué es Bearer token?
- ¿Por qué se necesita Authorization?

→ Usa Nivel 0 para comprender los conceptos antes de ejecutar
```

---

## Áreas de Conocimiento Cubiertas

| Área                 | Conceptos Típicos                                                  |
| -------------------- | ------------------------------------------------------------------ |
| **API Testing**      | REST, HTTP methods, status codes, headers, authentication, JSON    |
| **Database Testing** | SQL, CRUD, JOINs, constraints, transactions, normalization         |
| **UI Testing**       | DOM, selectores, eventos, estados, aserciones, waits               |
| **General QA**       | Tipos de testing, cobertura, casos positivos/negativos, edge cases |

---

## Instrucciones para la IA

Cuando el usuario solicite generar conceptos para una consigna, sigue este proceso:

### PASO 1: Análisis de la Consigna

**1.1 Identifica la consigna recibida:**

- ¿Qué tipo de testing involucra? (DB, API, UI)
- ¿Qué acción específica pide?
- ¿Qué herramientas o técnicas implica?

**1.2 Determina cómo se resuelve:**

- ¿Cuál es la solución técnica correcta?
- ¿Qué pasos hay que seguir?
- ¿Qué herramientas se usan?

**1.3 Identifica los conceptos necesarios:**

- ¿Qué debe saber el estudiante para entender la solución?
- ¿Qué teoría hay detrás de cada paso?
- ¿Por qué se hace de esa manera y no de otra?

### PASO 2: Extracción de Conceptos

Para cada concepto identificado, documenta:

1. **Nombre del concepto** → ¿Qué es?
2. **Definición clara** → Explicación simple y directa
3. **Por qué es importante** → Relevancia en el contexto de la consigna
4. **Ejemplo práctico** → Cómo se ve en la realidad

### PASO 3: Generación de Outputs

Genera **3 documentos** en el siguiente orden:

---

## OUTPUT 1: Análisis (`[area]-conceptos-analisis.md`)

**Propósito:** Mostrar la consigna, cómo se resuelve, y los conceptos que el estudiante necesita dominar.

**Estructura:**

````markdown
# Análisis: Conceptos para [Área] Testing

> **Aprendizaje Basado en Conceptos** (Concept-Driven Learning) - Nivel 0
>
> Este documento explica los conceptos fundamentales necesarios para comprender
> por qué una consigna se ejecuta de cierta manera.

---

## La Consigna

### Consigna Original

> "[Texto exacto de la consigna recibida]"

### Contexto

[Breve explicación de qué busca validar esta consigna y en qué contexto se usa]

---

## Cómo se Resuelve

### Solución

```[lenguaje]
[Código, query, request o pasos exactos para resolver la consigna]
```

### Explicación Paso a Paso

1. **[Paso 1]**: [Qué se hace y por qué]
2. **[Paso 2]**: [Qué se hace y por qué]
3. **[Paso 3]**: [Qué se hace y por qué]

---

## Conceptos Necesarios

Para entender **por qué** esta solución es correcta, necesitas dominar estos conceptos:

### Concepto 1: [Nombre]

**¿Qué es?**
[Definición clara y concisa]

**¿Por qué es importante aquí?**
[Cómo se relaciona con la consigna]

**Ejemplo:**

```
[Ejemplo práctico del concepto]
```

---

### Concepto 2: [Nombre]

**¿Qué es?**
[Definición clara y concisa]

**¿Por qué es importante aquí?**
[Cómo se relaciona con la consigna]

**Ejemplo:**

```
[Ejemplo práctico del concepto]
```

---

### Concepto 3: [Nombre]

[Misma estructura...]

---

[Continuar con todos los conceptos relevantes, típicamente 4-8 conceptos]

---

## Mapa de Conceptos

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONCEPTOS DE ESTA CONSIGNA                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [Concepto Principal]                                          │
│         │                                                       │
│         ├── [Subconcepto 1]                                     │
│         │                                                       │
│         ├── [Subconcepto 2]                                     │
│         │                                                       │
│         └── [Subconcepto 3]                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conexión: Concepto → Consigna → Solución

| Concepto     | Se aplica en               | Parte de la solución         |
| ------------ | -------------------------- | ---------------------------- |
| [Concepto 1] | [Qué parte de la consigna] | [Qué parte del código/query] |
| [Concepto 2] | [Qué parte de la consigna] | [Qué parte del código/query] |
| [Concepto 3] | [Qué parte de la consigna] | [Qué parte del código/query] |

---

## Recursos de Referencia

| Concepto     | Recurso Recomendado         |
| ------------ | --------------------------- |
| [Concepto 1] | [Link o nombre del recurso] |
| [Concepto 2] | [Link o nombre del recurso] |
````

---

## OUTPUT 2: Quiz (`[area]-conceptos-quiz.md`)

**Propósito:** Evaluar la comprensión del estudiante sobre los conceptos mediante preguntas de opción múltiple.

**Estructura:**

````markdown
# Quiz: Conceptos de [Área] Testing

> **Aprendizaje Basado en Conceptos** (Concept-Driven Learning) - Nivel 0
>
> Este quiz evalúa tu comprensión de los conceptos fundamentales.
> Lee cada pregunta y selecciona la opción correcta (A, B, C o D).
> **No consultes el documento de análisis mientras respondes.**

---

## Contexto

### La Consigna

> "[Texto de la consigna]"

### La Solución

```[lenguaje]
[Código/query/request de la solución]
```

---

## Instrucciones

1. Lee cada pregunta cuidadosamente
2. Analiza las 4 opciones
3. Selecciona **una sola respuesta**
4. Anota tus respuestas antes de consultar el documento de respuestas
5. Cada pregunta correcta vale **1 punto**

---

## PREGUNTAS

### Pregunta 1: [Título relacionado al concepto]

[Contexto o situación si es necesario]

**¿[Pregunta clara sobre el concepto]?**

- **A)** [Opción incorrecta pero plausible]
- **B)** [Opción correcta]
- **C)** [Opción incorrecta pero plausible]
- **D)** [Opción incorrecta pero plausible]

**Tu respuesta:** \_\_\_

---

### Pregunta 2: [Título relacionado al concepto]

**¿[Pregunta clara sobre el concepto]?**

- **A)** [Opción]
- **B)** [Opción]
- **C)** [Opción]
- **D)** [Opción]

**Tu respuesta:** \_\_\_

---

### Pregunta 3: [Título relacionado al concepto]

**En el contexto de la solución mostrada, ¿[pregunta sobre por qué se hace así]?**

- **A)** [Opción]
- **B)** [Opción]
- **C)** [Opción]
- **D)** [Opción]

**Tu respuesta:** \_\_\_

---

### Pregunta 4: [Título relacionado al concepto]

**¿[Pregunta sobre la relación entre conceptos]?**

- **A)** [Opción]
- **B)** [Opción]
- **C)** [Opción]
- **D)** [Opción]

**Tu respuesta:** \_\_\_

---

### Pregunta 5: [Título - Aplicación práctica]

**Si [situación hipotética relacionada], ¿qué [acción/resultado] esperarías?**

- **A)** [Opción]
- **B)** [Opción]
- **C)** [Opción]
- **D)** [Opción]

**Tu respuesta:** \_\_\_

---

[Continuar con más preguntas según la cantidad de conceptos, típicamente 6-10 preguntas]

---

## Hoja de Respuestas

Anota tus respuestas aquí antes de verificar:

| Pregunta | Tu Respuesta |
| -------- | ------------ |
| 1        |              |
| 2        |              |
| 3        |              |
| 4        |              |
| 5        |              |
| 6        |              |
| 7        |              |
| 8        |              |

---

**Documento de respuestas:** `[area]-conceptos-respuestas.md`
**Consulta solo DESPUÉS de completar todas las preguntas.**
````

---

## OUTPUT 3: Respuestas (`[area]-conceptos-respuestas.md`)

**Propósito:** Proporcionar las respuestas correctas del quiz con explicaciones detalladas.

**Estructura:**

```markdown
# Respuestas: Conceptos de [Área] Testing

> **Aprendizaje Basado en Conceptos** (Concept-Driven Learning) - Nivel 0
>
> Este documento contiene las respuestas correctas del quiz.
> **Consulta solo DESPUÉS de haber respondido todas las preguntas.**

---

## RESPUESTAS

### Pregunta 1: [Título]

**Respuesta correcta: [Letra]**

> [Texto de la opción correcta]

**Explicación:**
[Por qué esta es la respuesta correcta y por qué las otras opciones son incorrectas]

**Concepto clave:** [Nombre del concepto que evalúa esta pregunta]

---

### Pregunta 2: [Título]

**Respuesta correcta: [Letra]**

> [Texto de la opción correcta]

**Explicación:**
[Por qué esta es la respuesta correcta]

**Por qué las otras opciones son incorrectas:**

- **A)** [Por qué está mal]
- **C)** [Por qué está mal]
- **D)** [Por qué está mal]

**Concepto clave:** [Nombre del concepto]

---

### Pregunta 3: [Título]

**Respuesta correcta: [Letra]**

> [Texto de la opción correcta]

**Explicación:**
[Explicación detallada conectando con la consigna original]

**Concepto clave:** [Nombre del concepto]

---

[Continuar con todas las respuestas]

---

## Tabla de Respuestas

| Pregunta | Respuesta | Concepto Evaluado |
| -------- | --------- | ----------------- |
| 1        | [Letra]   | [Concepto]        |
| 2        | [Letra]   | [Concepto]        |
| 3        | [Letra]   | [Concepto]        |
| 4        | [Letra]   | [Concepto]        |
| 5        | [Letra]   | [Concepto]        |
| 6        | [Letra]   | [Concepto]        |
| 7        | [Letra]   | [Concepto]        |
| 8        | [Letra]   | [Concepto]        |

---

## Autoevaluación

### Calcula tu puntaje

| Respuestas Correctas | Puntaje | Nivel de Comprensión                           |
| -------------------- | ------- | ---------------------------------------------- |
| 8/8                  | 100%    | Excelente - Dominas los conceptos              |
| 6-7/8                | 75-87%  | Muy bien - Comprensión sólida                  |
| 4-5/8                | 50-62%  | Regular - Necesitas reforzar algunos conceptos |
| 0-3/8                | 0-37%   | Insuficiente - Revisa el documento de análisis |

**Tu puntaje:** **_/8 = _**%

---

## Conceptos a Reforzar

Si fallaste alguna pregunta, aquí están los conceptos que debes revisar:

| Pregunta | Si fallaste, revisa                           |
| -------- | --------------------------------------------- |
| 1        | [Concepto] - [Recurso o sección del análisis] |
| 2        | [Concepto] - [Recurso o sección del análisis] |
| 3        | [Concepto] - [Recurso o sección del análisis] |
| ...      | ...                                           |

---

## Resumen de Conceptos Aprendidos

| Concepto     | Definición Breve | Aplicación en la Consigna |
| ------------ | ---------------- | ------------------------- |
| [Concepto 1] | [Una línea]      | [Cómo se usa]             |
| [Concepto 2] | [Una línea]      | [Cómo se usa]             |
| [Concepto 3] | [Una línea]      | [Cómo se usa]             |

---

## Siguiente Paso

Ahora que comprendes el **POR QUÉ** de esta consigna, estás listo para:

**Opción A:** Ejecutar la consigna por tu cuenta en **Nivel 1: Prompt-Driven Learning**

- Ya sabes la teoría, ahora practica la ejecución

**Opción B:** Explorar más consignas relacionadas

- Usa este nivel para entender otras consignas del mismo tipo de testing

**Opción C:** Subir de nivel

- Si ya dominas la ejecución (Nivel 1), avanza a diseñar pruebas (Nivel 2)

---

## Glosario Rápido

| Término     | Definición         |
| ----------- | ------------------ |
| [Término 1] | [Definición breve] |
| [Término 2] | [Definición breve] |
| [Término 3] | [Definición breve] |
```

---

## Tipos de Preguntas para el Quiz

Para generar preguntas de calidad, usa estos tipos:

### 1. Definición

> "¿Qué es [concepto]?"

### 2. Propósito

> "¿Para qué sirve [concepto]?"
> "¿Cuál es el objetivo de [técnica]?"

### 3. Diferenciación

> "¿Cuál es la diferencia entre [A] y [B]?"
> "¿En qué se distingue [X] de [Y]?"

### 4. Aplicación

> "Si necesitas [situación], ¿qué [concepto/técnica] usarías?"
> "¿Cuándo es apropiado usar [concepto]?"

### 5. Causa-Efecto

> "¿Por qué [acción] produce [resultado]?"
> "¿Qué sucede si [condición]?"

### 6. Contextual

> "En la solución mostrada, ¿por qué se usa [elemento específico]?"
> "¿Qué pasaría si en la solución cambiamos [X] por [Y]?"

### 7. Identificación

> "¿Cuál de las siguientes opciones representa correctamente [concepto]?"
> "¿Qué tipo de [categoría] es [ejemplo]?"

---

## Ejemplo de Uso

**Input del usuario:**

```
Genera conceptos para esta consigna:
"Realiza una petición GET al endpoint /api/users y verifica que el status code sea 200"
```

**La IA debe:**

1. Analizar la consigna e identificar que es API Testing
2. Determinar la solución (request en Postman/cURL)
3. Identificar conceptos: HTTP methods, endpoints, status codes, REST
4. Generar los 3 archivos:
   - `api-conceptos-analisis.md`
   - `api-conceptos-quiz.md`
   - `api-conceptos-respuestas.md`

---

## Nomenclatura de Archivos

| Área     | Análisis                    | Quiz                    | Respuestas                    |
| -------- | --------------------------- | ----------------------- | ----------------------------- |
| API      | `api-conceptos-analisis.md` | `api-conceptos-quiz.md` | `api-conceptos-respuestas.md` |
| Database | `db-conceptos-analisis.md`  | `db-conceptos-quiz.md`  | `db-conceptos-respuestas.md`  |
| UI       | `ui-conceptos-analisis.md`  | `ui-conceptos-quiz.md`  | `ui-conceptos-respuestas.md`  |

---

## Consideraciones Pedagógicas

1. **Conceptos conectados a la práctica:** Cada concepto debe relacionarse directamente con la consigna, no ser teoría aislada.

2. **Explicaciones simples:** Usar lenguaje claro, evitar jerga innecesaria, dar ejemplos concretos.

3. **Quiz desafiante pero justo:** Las opciones incorrectas deben ser plausibles pero claramente distinguibles para quien entiende el concepto.

4. **Feedback constructivo:** Las respuestas deben explicar no solo qué es correcto, sino por qué las otras opciones son incorrectas.

5. **Conexión con niveles superiores:** Mostrar cómo este conocimiento se aplica cuando el estudiante suba de nivel.

6. **Recursos adicionales:** Proporcionar referencias para profundizar si el estudiante lo desea.

---

## Perfil del Estudiante para este Nivel

Este nivel está diseñado para estudiantes que:

- Son **Trainees** o están comenzando en QA
- Vienen de otros campos y necesitan bases teóricas
- Encuentran consignas que no entienden conceptualmente
- Prefieren entender el "por qué" antes del "cómo"
- Quieren reforzar fundamentos que dieron por sentado

---

## Tags

`#concept-driven-learning` `#nivel-0` `#base-game` `#conceptos` `#fundamentos` `#qa-training` `#teoria` `#quiz`
