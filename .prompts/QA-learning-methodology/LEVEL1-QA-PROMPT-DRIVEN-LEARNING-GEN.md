# QA Prompt-Driven Learning Generator

> **Aprendizaje Basado en Consignas** - Nivel 1 (Micro-game)
>
> Genera consignas de testing a partir del análisis de un Problema (Historia de Usuario, Historia Técnica o Deuda Técnica).
> El aprendizaje está en el **"cómo hacerlo"**: el estudiante aprende ejecutando las consignas.

---

## Concepto: Prompt-Driven Learning

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APRENDIZAJE BASADO EN CONSIGNAS                        │
│                         (Prompt-Driven Learning)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INPUT                         PROCESO                        OUTPUT       │
│   ─────                         ───────                        ──────       │
│                                                                             │
│   Problema            ───►    Análisis de ACs        ───►    CONSIGNAS     │
│   (User Story,                + Mapeo técnico                (instrucciones │
│   Technical Story,            + Identificación                a ejecutar)  │
│   Technical Debt)               de escenarios                      │       │
│                                                                    │       │
│                                                                    ▼       │
│                                                              APRENDIZAJE   │
│                                                              (cómo hacerlo)│
│                                                                             │
│   Nivel: MICRO-GAME                                                        │
│   Un problema = Un set de consignas                                        │
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
│   Estudiante aprende: QUÉ hacer (diseñar plan de pruebas)                   │
│                                                                             │
│                           ↓                                                 │
│                                                                             │
│   NIVEL 1: PROMPT-DRIVEN LEARNING (este documento)                          │
│   ═══════════════════════════════════════════════                           │
│   Input: Problema (Historia de Usuario)                                     │
│   Genera: CONSIGNAS (instrucciones/casos de prueba)                         │
│   Estudiante aprende: CÓMO ejecutar las pruebas                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Flujo de aprendizaje:**

1. **Nivel 1**: "Aquí tienes las consignas. ¿Cómo las ejecutas?"
2. **Nivel 2**: "Aquí tienes un problema. ¿Qué pruebas necesitas?"
3. **Nivel 3**: "Aquí tienes un objetivo. ¿Qué problemas identificas?"

---

## Tipos de Testing Soportados

| Tipo                 | Cuándo Aplica                                           | Herramientas         | Habilidades                      |
| -------------------- | ------------------------------------------------------- | -------------------- | -------------------------------- |
| **Database Testing** | Operaciones CRUD, RLS policies, constraints, integridad | SQL, Supabase        | Queries, JOINs, validaciones     |
| **API Testing**      | Endpoints, validaciones, autenticación, status codes    | Postman, cURL        | Requests, responses, headers     |
| **UI Testing**       | Interacciones, formularios, navegación, estados         | DevTools, Playwright | Selectores, acciones, aserciones |

---

## Instrucciones para la IA

Cuando el usuario solicite generar consignas para un problema, sigue este proceso:

### PASO 1: Investigación

**1.1 Lee la documentación del Problema:**

```
[STORY_PATH]/
├── story.md              → Acceptance Criteria, descripción, User Story
├── acceptance-test-plan.md         → Casos de prueba existentes (si hay)
└── implementation-plan.md → Detalles técnicos de implementación
```

**1.2 Consulta la arquitectura del sistema:**

```
.context/
├── business-data-map.md  → Schema DB, tablas, relaciones, RLS
├── api-architecture.md      → APIs, endpoints, flujos
└── design-system.md            → Componentes UI (si aplica)
```

**1.3 Identifica el tipo de testing según el input del usuario:**

- **Database Testing**: Si hay tablas involucradas, operaciones CRUD, policies
- **API Testing**: Si hay endpoints, requests/responses
- **UI Testing**: Si hay interacciones de usuario, formularios, navegación

### PASO 2: Análisis y Mapeo

Antes de generar consignas, realiza este análisis interno:

1. **Extracción de Acceptance Criteria** → Lista todos los ACs de la historia
2. **Extracción de Test Cases** → Lista los TCs del archivo acceptance-test-plan.md (si existe)
3. **Mapeo AC → Escenario Técnico** → Qué se debe verificar técnicamente para cada AC
4. **Mapeo Escenario → Consigna** → Cómo convertir cada escenario en una instrucción ejecutable

### PASO 3: Generación de Outputs

Genera **3 documentos** en el siguiente orden:

---

## OUTPUT 1: Análisis (`[tipo]-testing-analisis.md`)

**Propósito:** Documentar el razonamiento detrás de cada consigna. Muestra CÓMO se derivaron las consignas de los ACs y Test Cases.

**Estructura:**

```markdown
# Análisis: [STORY-ID] - [Tipo] Testing

> **Aprendizaje Basado en Consignas** (Prompt-Driven Learning) - Nivel 1
>
> Este documento muestra cómo se derivaron las consignas a partir del problema.

---

## Contexto del Problema

### Historia de Usuario

[Copiar el "As a... I want... So that..."]

### Acceptance Criteria Identificados

| ID  | Acceptance Criteria | Tipo                         |
| --- | ------------------- | ---------------------------- |
| AC1 | [Descripción]       | Happy Path / Negative / Edge |
| AC2 | [Descripción]       | ...                          |

### Test Cases Relacionados (si existen)

| TC ID  | Nombre   | Nivel      | Prioridad            |
| ------ | -------- | ---------- | -------------------- |
| TC-001 | [Nombre] | E2E/API/DB | Critical/High/Medium |

---

## Arquitectura Técnica Involucrada

### Base de Datos (si aplica)

[Tablas, campos principales, relaciones]

### APIs (si aplica)

| Método | Endpoint | Descripción |
| ------ | -------- | ----------- |
| POST   | /api/... | ...         |

### Componentes UI (si aplica)

[Páginas, componentes, flujos]

---

## Mapeo: De Requisitos a Consignas

### AC1 → Consignas Derivadas

**Acceptance Criteria:**

> [Texto del AC]

**Análisis Técnico:**

- ¿Qué tablas/endpoints/componentes están involucrados?
- ¿Qué operaciones se realizan?
- ¿Qué se debe verificar?

**Consignas Generadas:**

| #   | Consigna | Razón                                |
| --- | -------- | ------------------------------------ |
| 1   | [Título] | Verifica [aspecto específico del AC] |
| 2   | [Título] | Verifica [otro aspecto]              |

[Repetir para cada AC relevante]

---

## Resumen de Cobertura

| Consigna | AC Cubierto | TC Relacionado | Operación/Acción     |
| -------- | ----------- | -------------- | -------------------- |
| 1        | AC1         | TC-001         | SELECT / GET / Click |
| 2        | AC1         | TC-001         | SELECT + JOIN / POST |
| ...      | ...         | ...            | ...                  |

---

## Progresión de Dificultad

Las consignas están ordenadas de menor a mayor complejidad:

1. **Nivel Básico (1-4):** [Qué habilidades desarrollan]
2. **Nivel Intermedio (5-8):** [Qué habilidades desarrollan]
3. **Nivel Avanzado (9-12):** [Qué habilidades desarrollan]
```

---

## OUTPUT 2: Consignas (`[tipo]-testing-consignas.md`)

**Propósito:** Documento de trabajo para el estudiante. Contiene las instrucciones a ejecutar SIN las soluciones.

**Estructura:**

```markdown
# Consignas: [STORY-ID] - [Tipo] Testing

> **Aprendizaje Basado en Consignas** (Prompt-Driven Learning) - Nivel 1
>
> Este documento contiene instrucciones de testing derivadas del problema [STORY-ID].
> Tu tarea es ejecutar cada consigna. El aprendizaje está en descubrir CÓMO hacerlo.

---

## Objetivo de Aprendizaje

Al completar estas consignas podrás:

- [Habilidad técnica 1]
- [Habilidad técnica 2]
- [Habilidad técnica 3]

---

## Contexto Técnico

[Información necesaria para ejecutar las consignas: tablas, endpoints, componentes]

---

## Setup Inicial

[Pasos de preparación antes de comenzar: conexiones, herramientas, datos previos]

---

## CONSIGNAS

### CONSIGNA 1: [Título Descriptivo]

**Contexto:**
[Por qué esta verificación es importante desde el punto de vista de negocio o técnico]

**Acción Previa:** (si aplica)
[Pasos que debe realizar en el sistema antes de ejecutar la consigna]

**Instrucción:**

> "[Instrucción clara y específica de lo que debe hacer/verificar]"

**Pistas:**

- [Concepto, comando o función que podría necesitar]
- [Otra pista relevante sin dar la respuesta]

**Valida:** [AC o TC que esta consigna verifica]

---

### CONSIGNA 2: [Título Descriptivo]

[Misma estructura...]

---

[Continuar con todas las consignas]

---

## Tabla de Referencia

[Información de apoyo: códigos de estado, formatos de fecha, valores válidos, etc.]

---

## Resumen de Consignas

| #   | Consigna | Conceptos Clave      | Dificultad |
| --- | -------- | -------------------- | ---------- |
| 1   | [Título] | [Comandos/conceptos] | Básica     |
| 2   | [Título] | [Comandos/conceptos] | Básica     |
| 3   | [Título] | [Comandos/conceptos] | Intermedia |
| ... | ...      | ...                  | ...        |

---

**Documento de contexto:** `[tipo]-testing-analisis.md`
**Soluciones:** `[tipo]-testing-respuestas.md` (consultar después de intentar)
```

---

## OUTPUT 3: Respuestas (`[tipo]-testing-respuestas.md`)

**Propósito:** Soluciones completas con explicaciones. Para autoevaluación después de intentar.

**Estructura:**

````markdown
# Respuestas: [STORY-ID] - [Tipo] Testing

> **Aprendizaje Basado en Consignas** (Prompt-Driven Learning) - Nivel 1
>
> Este documento contiene las soluciones a las consignas.
> **Consulta solo DESPUÉS de haber intentado resolver cada consigna.**

---

## RESPUESTAS

### RESPUESTA CONSIGNA 1: [Título]

**Solución:**

```[lenguaje]
[Código/Query/Request/Pasos exactos]
```

**Explicación:**
[Por qué esta es la solución correcta, qué hace cada parte]

**Resultado Esperado:**
[Qué debería ver/obtener si lo hizo correctamente]

**Errores Comunes:**

- [Error típico 1]: [Por qué ocurre y cómo evitarlo]
- [Error típico 2]: [Por qué ocurre y cómo evitarlo]

**Variantes Válidas:**
[Otras formas de resolver que también son correctas]

---

### RESPUESTA CONSIGNA 2: [Título]

[Misma estructura...]

---

[Continuar con todas las respuestas]

---

## Conceptos Aprendidos

| Concepto/Comando | Descripción      | Ejemplo     |
| ---------------- | ---------------- | ----------- |
| [Concepto 1]     | [Para qué sirve] | [Uso breve] |
| [Concepto 2]     | [Para qué sirve] | [Uso breve] |

---

## Checklist de Validación

- [ ] Consigna 1: [Criterio de éxito específico]
- [ ] Consigna 2: [Criterio de éxito específico]
- [ ] ...

---

## Autoevaluación

| Criterio                                | Puntos  | Tu Puntaje |
| --------------------------------------- | ------- | ---------- |
| Consignas básicas completadas (1-4)     | 25      | /25        |
| Consignas intermedias completadas (5-8) | 35      | /35        |
| Consignas avanzadas completadas (9-12)  | 40      | /40        |
| **Total**                               | **100** | **/100**   |

**Interpretación:**

- 0-40: Necesitas reforzar los fundamentos
- 41-70: Buen progreso, practica más los casos complejos
- 71-90: Muy bien, estás listo para el siguiente nivel
- 91-100: Excelente dominio técnico

---

## Siguiente Paso

Has aprendido CÓMO ejecutar pruebas para este problema.

Cuando estés listo para aprender a identificar QUÉ probar por tu cuenta, usa el **Nivel 2: Problem-Driven Learning**.
````

---

## Guías Específicas por Tipo de Testing

### Para DATABASE TESTING

**Progresión de comandos SQL:**

1. `SELECT` básico, `ORDER BY`, `LIMIT`
2. `WHERE` con `AND`, `OR`, `IN`, `NOT IN`
3. `JOIN` / `INNER JOIN` entre dos tablas
4. `COUNT`, `SUM`, `GROUP BY`, `HAVING`
5. `BETWEEN`, `LIKE`, patrones de búsqueda
6. `INSERT` con validación posterior
7. `UPDATE` con condiciones específicas
8. `DELETE` con verificación de integridad
9. `LEFT JOIN`, `RIGHT JOIN`, múltiples tablas
10. Subconsultas, `EXISTS`, `NOT EXISTS`
11. Transacciones, rollback scenarios
12. RLS policies, permisos por rol

**Distribución recomendada:**

- 60-70% consultas de verificación (SELECT)
- 15-20% operaciones de modificación (INSERT, UPDATE, DELETE)
- 10-20% casos con acciones previas en frontend

### Para API TESTING

**Progresión de conceptos:**

1. GET request básico, leer response
2. Validar status code 200
3. POST request con body JSON
4. Validar estructura del response
5. Headers: Content-Type, Authorization
6. Status codes de error: 400, 401, 403, 404
7. Autenticación con token/cookie
8. PUT/PATCH para actualización
9. DELETE y verificación
10. Validación de schema completo
11. Casos de error del servidor (500)
12. Flujos encadenados (crear → leer → actualizar → eliminar)

### Para UI TESTING

**Progresión de conceptos:**

1. Identificar elementos por ID, clase
2. Selectores con data-testid
3. Acciones: click, type básico
4. Validar texto visible
5. Validar atributos de elementos
6. Estados: loading, disabled, error
7. Formularios: validación, submit
8. Navegación entre páginas
9. Selectores complejos (nth-child, combinadores)
10. Esperas y sincronización
11. Estados vacíos, listas, paginación
12. Responsive: validar en diferentes viewports

---

## Ejemplo de Uso

**Input del usuario:**

```
Genera consignas de Database Testing para @.context/PBI/epics/EPIC-MYM-18/stories/STORY-MYM-19/
```

**La IA debe:**

1. Leer story.md, acceptance-test-plan.md (si existe), implementation-plan.md
2. Consultar business-data-map.md y api-architecture.md
3. Generar los 3 archivos en la carpeta de la story:
   - `db-testing-analisis.md`
   - `db-testing-consignas.md`
   - `db-testing-respuestas.md`

---

## Nomenclatura de Archivos

| Tipo Testing | Análisis                  | Consignas                  | Respuestas                  |
| ------------ | ------------------------- | -------------------------- | --------------------------- |
| Database     | `db-testing-analisis.md`  | `db-testing-consignas.md`  | `db-testing-respuestas.md`  |
| API          | `api-testing-analisis.md` | `api-testing-consignas.md` | `api-testing-respuestas.md` |
| UI           | `ui-testing-analisis.md`  | `ui-testing-consignas.md`  | `ui-testing-respuestas.md`  |

---

## Consideraciones Pedagógicas

1. **Progresión gradual:** Ordenar de fácil a difícil, construyendo sobre conceptos anteriores.

2. **Contexto real:** Cada consigna tiene un "por qué" de negocio, no es solo ejercicio técnico.

3. **Pistas que guían:** Apuntar hacia la solución sin revelarla directamente.

4. **Conexión con requisitos:** Toda consigna debe mapear a un AC o TC real.

5. **Errores anticipados:** Documentar los errores típicos ayuda al aprendizaje.

6. **Autoevaluación:** El estudiante puede medir su progreso objetivamente.

---

## Tags

`#prompt-driven-learning` `#nivel-1` `#micro-game` `#consignas` `#qa-training` `#database-testing` `#api-testing` `#ui-testing`
