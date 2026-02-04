# QA Objective-Driven Learning Generator

> **Aprendizaje Basado en Objetivos** - Nivel 3 (Meta-game)
>
> Genera un Objetivo (Épica/Feature) a partir del análisis de un Sistema o Contexto completo.
> El aprendizaje está en el **"qué identificar"**: el estudiante aprende a descomponer objetivos en problemas.

---

## Concepto: Objective-Driven Learning

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APRENDIZAJE BASADO EN OBJETIVOS                        │
│                       (Objective-Driven Learning)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INPUT                         PROCESO                        OUTPUT       │
│   ─────                         ───────                        ──────       │
│                                                                             │
│   Sistema/Contexto     ───►    Análisis de          ───►     OBJETIVO      │
│   (Arquitectura,               arquitectura +                (Épica/       │
│   Base de datos,               identificación                 Feature)     │
│   APIs completas)              de necesidades                      │       │
│                                                                    │       │
│                                                                    ▼       │
│                                                              APRENDIZAJE   │
│                                                              (qué          │
│                                                               identificar: │
│                                                               los problemas│
│                                                               del objetivo)│
│                                                                             │
│   Nivel: META-GAME                                                         │
│   Un sistema = Uno o más objetivos (épicas)                                │
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
│   NIVEL 3: OBJECTIVE-DRIVEN LEARNING (este documento)                       │
│   ═══════════════════════════════════════════════════                       │
│   Input: Sistema / Arquitectura completa                                    │
│   Genera: OBJETIVO (Épica/Feature)                                          │
│   Estudiante hace: Identificar los problemas (historias) del objetivo       │
│   Estudiante aprende: QUÉ problemas existen                                 │
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
└─────────────────────────────────────────────────────────────────────────────┘
```

**Flujo completo desde Nivel 3:**

1. **Nivel 3** (este): "Aquí tienes un objetivo. ¿Qué problemas (historias) identificas?"
2. **Nivel 2**: "Aquí tienes un problema. ¿Qué pruebas diseñas?"
3. **Nivel 1**: "Aquí tienes las consignas. ¿Cómo las ejecutas?"

---

## Modos de Operación

Este generador puede funcionar en dos modos:

### Modo A: Generar Objetivo Nuevo

La IA analiza el sistema y **genera una Épica/Feature nueva** basada en el contexto técnico.

**Cuándo usar:** Cuando quieres practicar con un objetivo que no conoces previamente, o cuando quieres simular la creación de nuevas funcionalidades.

### Modo B: Seleccionar Objetivo Existente

La IA analiza el sistema y **selecciona una Épica existente** del backlog del proyecto.

**Cuándo usar:** Cuando quieres trabajar con épicas reales del proyecto.

---

## Instrucciones para la IA

### PASO 0: Preguntar el Modo

Antes de comenzar, pregunta al usuario:

```
¿Cómo deseas obtener el objetivo para este ejercicio?

A) **Generar nuevo**: Crearé una Épica/Feature basada en el análisis del sistema
B) **Seleccionar existente**: Elegiré una Épica existente del backlog del proyecto

Responde A o B:
```

### PASO 1: Investigación

**1.1 Analiza la arquitectura completa del sistema:**

```
.context/
├── business-data-map.md  → Schema completo de DB, todas las tablas, relaciones
├── api-architecture.md      → Todos los endpoints, flujos del sistema
├── design-system.md            → Componentes UI, páginas, navegación
└── project-overview.md         → Visión general del proyecto (si existe)
```

**1.2 Revisa las épicas existentes:**

```
.context/PBI/epics/
├── EPIC-XXX-name/
├── EPIC-YYY-name/
└── ...
```

**1.3 Según el modo seleccionado:**

**Modo A (Generar nuevo):**

- Analiza las capacidades del sistema
- Identifica una necesidad o mejora coherente con la arquitectura
- Genera una Épica/Feature que podría implementarse en el sistema

**Modo B (Seleccionar existente):**

- Lista las épicas disponibles
- Selecciona una con complejidad adecuada para el aprendizaje
- Extrae su información sin modificarla

### PASO 2: Análisis

Antes de generar los outputs, realiza un análisis que incluya:

1. **Capacidades del sistema** → ¿Qué puede hacer actualmente?
2. **Áreas funcionales** → ¿Qué módulos o dominios existen?
3. **El objetivo seleccionado/generado** → ¿Qué épica trabajará el estudiante?
4. **Complejidad estimada** → ¿Cuántas historias podría tener este objetivo?
5. **Dependencias técnicas** → ¿Qué partes del sistema están involucradas?

### PASO 3: Generación de Outputs

Genera **3 documentos** en el siguiente orden:

---

## OUTPUT 1: Análisis (`[sistema]-objetivo-analisis.md`)

**Propósito:** Proporcionar contexto completo sobre el sistema para que el estudiante pueda analizar el objetivo.

**Estructura:**

````markdown
# Análisis: [NOMBRE-SISTEMA] - Contexto del Sistema

> **Aprendizaje Basado en Objetivos** (Objective-Driven Learning) - Nivel 3
>
> Este documento proporciona el contexto del sistema necesario para identificar los problemas del objetivo.

---

## Visión General del Sistema

### Propósito

[¿Para qué sirve este sistema? ¿Qué problema resuelve?]

### Usuarios Principales

| Rol     | Descripción | Funcionalidades principales |
| ------- | ----------- | --------------------------- |
| [Rol 1] | [Quién es]  | [Qué puede hacer]           |
| [Rol 2] | [Quién es]  | [Qué puede hacer]           |

---

## Arquitectura del Sistema

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        [NOMBRE DEL SISTEMA]                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│   │   Frontend  │────►│     API     │────►│  Database   │      │
│   │   (UI/UX)   │◄────│   (Backend) │◄────│  (Storage)  │      │
│   └─────────────┘     └─────────────┘     └─────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Módulos/Dominios Funcionales

| Módulo     | Descripción | Tablas principales | Endpoints principales |
| ---------- | ----------- | ------------------ | --------------------- |
| [Módulo 1] | [Qué hace]  | [Tablas]           | [Endpoints]           |
| [Módulo 2] | [Qué hace]  | [Tablas]           | [Endpoints]           |
| [Módulo 3] | [Qué hace]  | [Tablas]           | [Endpoints]           |

---

## Base de Datos

### Esquema General

```
┌─────────────────────────────────────────────────────────────────┐
│                     MODELO DE DATOS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Diagrama simplificado de las tablas principales y sus        │
│   relaciones]                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tablas Principales

| Tabla     | Propósito        | Relaciones clave  |
| --------- | ---------------- | ----------------- |
| [tabla_1] | [Para qué sirve] | FK → [otra_tabla] |
| [tabla_2] | [Para qué sirve] | FK → [otra_tabla] |

---

## APIs Disponibles

### Resumen de Endpoints

| Dominio         | Endpoints              | Descripción    |
| --------------- | ---------------------- | -------------- |
| /api/[dominio1] | GET, POST, PUT, DELETE | [Qué gestiona] |
| /api/[dominio2] | GET, POST              | [Qué gestiona] |

### Autenticación y Autorización

[Cómo funciona la seguridad del sistema]

---

## Interfaz de Usuario

### Páginas/Secciones Principales

| Página     | Ruta  | Funcionalidad       |
| ---------- | ----- | ------------------- |
| [Página 1] | /ruta | [Qué permite hacer] |
| [Página 2] | /ruta | [Qué permite hacer] |

---

## Épicas/Features Existentes

| Épica    | Nombre   | Estado                 | Historias   |
| -------- | -------- | ---------------------- | ----------- |
| EPIC-001 | [Nombre] | Completada/En progreso | X historias |
| EPIC-002 | [Nombre] | Completada/En progreso | X historias |

---

## Áreas de Oportunidad Identificadas

[Lista de posibles mejoras, nuevas funcionalidades, o áreas que podrían expandirse. Esto ayuda al estudiante a entender el contexto para el objetivo que recibirá.]

1. **[Área 1]**: [Descripción de la oportunidad]
2. **[Área 2]**: [Descripción de la oportunidad]
3. **[Área 3]**: [Descripción de la oportunidad]
````

---

## OUTPUT 2: Objetivo (`[sistema]-objetivo-necesidad.md`)

**Propósito:** Presentar el OBJETIVO (Épica/Feature) que el estudiante debe analizar para identificar los problemas (historias de usuario).

**Estructura:**

````markdown
# Objetivo: [NOMBRE-SISTEMA] - [Nombre del Objetivo]

> **Aprendizaje Basado en Objetivos** (Objective-Driven Learning) - Nivel 3
>
> Este documento presenta el objetivo que debes analizar.
> Tu tarea es identificar los problemas (historias de usuario) necesarios para cumplir este objetivo.

---

## Modo de Generación

[Indicar si fue: **Generado nuevo** o **Seleccionado del backlog**]

---

## El Objetivo

### Épica/Feature

**ID:** [EPIC-ID o "Generada"]
**Nombre:** [Nombre descriptivo del objetivo]

### Descripción

[Descripción narrativa del objetivo: qué se quiere lograr, por qué es importante, qué valor aporta]

### Objetivo de Negocio

[¿Qué problema del usuario o del negocio resuelve esta épica?]

---

## Alcance del Objetivo

### Incluido (In Scope)

- [Funcionalidad que SÍ debe estar]
- [Funcionalidad que SÍ debe estar]
- [Funcionalidad que SÍ debe estar]

### Excluido (Out of Scope)

- [Funcionalidad que NO está incluida]
- [Funcionalidad que NO está incluida]

---

## Contexto Técnico Relevante

### Componentes del Sistema Involucrados

[Qué partes del sistema se verán afectadas o serán utilizadas por este objetivo]

- **Base de datos:** [Tablas que se usarán o crearán]
- **APIs:** [Endpoints que se usarán o crearán]
- **UI:** [Páginas/componentes que se usarán o crearán]

### Dependencias

[De qué otras épicas o funcionalidades depende este objetivo]

---

## Tu Tarea

Como QA Engineer/Analyst, debes **identificar los problemas** (Historias de Usuario) que componen este objetivo.

### Entregables Esperados

1. **Lista de Historias de Usuario**
   - Formato: "Como [rol], quiero [funcionalidad], para [beneficio]"
   - Cada historia debe ser independiente y entregable

2. **Acceptance Criteria por Historia**
   - Al menos 2-3 ACs por historia
   - Criterios claros y verificables

3. **Priorización**
   - Ordenar las historias por importancia/dependencia
   - Justificar el orden

4. **Estimación de Complejidad**
   - Indicar si cada historia es: Simple / Media / Compleja
   - Basarse en los componentes técnicos involucrados

5. **Dependencias entre Historias**
   - Identificar qué historias dependen de otras
   - Proponer un orden de implementación

---

## Preguntas Guía

Responde estas preguntas mientras analizas el objetivo:

1. **¿Qué funcionalidades específicas necesita el usuario?**
   - ¿Qué acciones debe poder realizar?
   - ¿Qué información debe poder ver?
   - ¿Qué problemas debe poder resolver?

2. **¿Cómo descomponer este objetivo en partes manejables?**
   - ¿Qué es lo mínimo que se podría entregar primero?
   - ¿Qué funcionalidades pueden ser independientes?
   - ¿Qué debe existir antes de que otra cosa funcione?

3. **¿Qué escenarios de testing importantes surgirán?**
   - ¿Qué podría fallar en cada historia?
   - ¿Qué casos negativos son críticos?
   - ¿Qué integraciones son riesgosas?

4. **¿Qué datos y precondiciones se necesitan?**
   - ¿Qué debe existir en el sistema?
   - ¿Qué roles de usuario intervienen?

---

## Pistas

- [Pista 1: Área funcional importante que no debe olvidar]
- [Pista 2: Tipo de usuario que tiene necesidades específicas]
- [Pista 3: Integración técnica que genera complejidad]
- [Pista 4: Caso de uso que podría no ser obvio]

---

## Criterios de Evaluación

Tu descomposición será evaluada en base a:

| Criterio           | Descripción                                                           |
| ------------------ | --------------------------------------------------------------------- |
| **Cobertura**      | ¿Las historias cubren todo el scope del objetivo?                     |
| **Granularidad**   | ¿Cada historia es del tamaño adecuado? (ni muy grande ni muy pequeña) |
| **Independencia**  | ¿Las historias son lo más independientes posible?                     |
| **Claridad**       | ¿Los ACs son específicos y verificables?                              |
| **Priorización**   | ¿El orden tiene sentido lógico y de dependencias?                     |
| **Pensamiento QA** | ¿Identificaste riesgos y escenarios de testing?                       |

---

## Formato Sugerido para tu Entrega

```markdown
# Mis Historias de Usuario: [EPIC-ID/Nombre]

## Resumen

| #     | Historia       | Complejidad           | Prioridad | Depende de |
| ----- | -------------- | --------------------- | --------- | ---------- |
| US-01 | [Nombre corto] | Simple/Media/Compleja | 1         | -          |
| US-02 | [Nombre corto] | Simple/Media/Compleja | 2         | US-01      |
| ...   | ...            | ...                   | ...       | ...        |

---

## US-01: [Nombre de la Historia]

**Como** [rol de usuario]
**Quiero** [funcionalidad]
**Para** [beneficio]

### Acceptance Criteria

| AC  | Descripción            | Tipo       |
| --- | ---------------------- | ---------- |
| AC1 | [Criterio verificable] | Happy Path |
| AC2 | [Criterio verificable] | Negative   |
| AC3 | [Criterio verificable] | Edge Case  |

### Notas de Testing

[Escenarios importantes a considerar para esta historia]

### Componentes Técnicos

- DB: [Tablas involucradas]
- API: [Endpoints involucrados]
- UI: [Páginas/componentes involucrados]

---

[Repetir para cada historia]

---

## Orden de Implementación Propuesto

1. **Sprint 1:** US-01, US-02 (funcionalidad base)
2. **Sprint 2:** US-03, US-04 (funcionalidades secundarias)
3. **Sprint 3:** US-05 (mejoras y edge cases)

### Justificación

[Por qué este orden tiene sentido]
```

---

**Documento de contexto:** `[sistema]-objetivo-analisis.md`
**Solución:** `[sistema]-objetivo-respuestas.md` (consultar DESPUÉS de completar tu análisis)
````

---

## OUTPUT 3: Respuestas (`[sistema]-objetivo-respuestas.md`)

**Propósito:** La descomposición completa del objetivo en historias de usuario. Para comparar y aprender.

**Estructura:**

````markdown
# Respuestas: [NOMBRE-SISTEMA] - [Nombre del Objetivo]

> **Aprendizaje Basado en Objetivos** (Objective-Driven Learning) - Nivel 3
>
> Este documento contiene la descomposición de referencia del objetivo.
> **Compara tu solución con esta para evaluar tu trabajo.**
> Consulta solo DESPUÉS de haber completado tu propio análisis.

---

## Resumen de Historias Identificadas

| #     | Historia | Complejidad | Prioridad | Depende de | Justificación            |
| ----- | -------- | ----------- | --------- | ---------- | ------------------------ |
| US-01 | [Nombre] | [S/M/C]     | 1         | -          | [Por qué esta prioridad] |
| US-02 | [Nombre] | [S/M/C]     | 2         | US-01      | [Por qué esta prioridad] |
| US-03 | [Nombre] | [S/M/C]     | 2         | -          | [Por qué esta prioridad] |
| ...   | ...      | ...         | ...       | ...        | ...                      |

---

## Historias de Usuario Detalladas

### US-01: [Nombre de la Historia]

**Como** [rol de usuario]
**Quiero** [funcionalidad específica]
**Para** [beneficio claro]

#### Acceptance Criteria

| AC  | Descripción                         | Tipo       | Notas de Testing |
| --- | ----------------------------------- | ---------- | ---------------- |
| AC1 | [Criterio específico y verificable] | Happy Path | [Qué validar]    |
| AC2 | [Criterio específico y verificable] | Happy Path | [Qué validar]    |
| AC3 | [Criterio específico y verificable] | Negative   | [Qué validar]    |
| AC4 | [Criterio específico y verificable] | Edge Case  | [Qué validar]    |

#### Componentes Técnicos Involucrados

| Capa     | Componentes           | Operaciones       |
| -------- | --------------------- | ----------------- |
| Database | [Tablas]              | [CRUD operations] |
| API      | [Endpoints]           | [Métodos HTTP]    |
| UI       | [Páginas/Componentes] | [Interacciones]   |

#### Complejidad: [Simple/Media/Compleja]

**Justificación:** [Por qué tiene esta complejidad]

#### Riesgos de Testing

- [Riesgo 1]: [Por qué es un riesgo y qué probar]
- [Riesgo 2]: [Por qué es un riesgo y qué probar]

---

### US-02: [Nombre de la Historia]

[Misma estructura...]

---

[Continuar con todas las historias]

---

## Mapa de Dependencias

```
US-01 (Base)
   │
   ├──► US-02 (depende de US-01)
   │       │
   │       └──► US-05 (depende de US-02)
   │
   └──► US-03 (depende de US-01)

US-04 (Independiente)
```

### Explicación de Dependencias

[Por qué cada historia depende de las anteriores]

---

## Plan de Implementación Sugerido

### Sprint 1: Funcionalidad Base

| Historia | Razón                          |
| -------- | ------------------------------ |
| US-01    | [Por qué primero]              |
| US-04    | [Por qué puede ir en paralelo] |

### Sprint 2: Funcionalidad Principal

| Historia | Razón                    |
| -------- | ------------------------ |
| US-02    | [Por qué en este sprint] |
| US-03    | [Por qué en este sprint] |

### Sprint 3: Completar y Pulir

| Historia | Razón              |
| -------- | ------------------ |
| US-05    | [Por qué al final] |

---

## Cobertura del Scope

| Elemento del Scope          | Cubierto por |
| --------------------------- | ------------ |
| [Funcionalidad 1 del scope] | US-01, US-02 |
| [Funcionalidad 2 del scope] | US-03        |
| [Funcionalidad 3 del scope] | US-04, US-05 |

**Verificación:** ✅ Todas las funcionalidades del scope están cubiertas

---

## Errores Comunes al Descomponer Objetivos

1. **Historias demasiado grandes**: [Cómo identificar y dividir]
2. **Historias demasiado pequeñas**: [Cuándo agrupar]
3. **Olvidar casos negativos en ACs**: [Por qué son importantes]
4. **Ignorar dependencias**: [Cómo afecta al testing]
5. **No pensar en el orden de implementación**: [Por qué importa para QA]

---

## Autoevaluación

Compara tu descomposición con esta usando estos criterios:

| Criterio                        | Puntos  | Cómo Evaluar                         | Tu Puntaje |
| ------------------------------- | ------- | ------------------------------------ | ---------- |
| Cantidad de historias apropiada | 15      | ¿Similar cantidad? ¿Tamaño similar?  | /15        |
| Cobertura del scope completa    | 20      | ¿Cubriste todas las funcionalidades? | /20        |
| ACs claros y verificables       | 20      | ¿Cada AC se puede probar?            | /20        |
| Priorización lógica             | 15      | ¿Tu orden tiene sentido?             | /15        |
| Dependencias identificadas      | 15      | ¿Viste las mismas dependencias?      | /15        |
| Pensamiento QA (riesgos)        | 15      | ¿Identificaste qué probar?           | /15        |
| **Total**                       | **100** |                                      | **/100**   |

**Interpretación:**

- 0-40: Necesitas practicar más el análisis de requisitos a alto nivel
- 41-70: Buen progreso, trabaja en la granularidad y los ACs
- 71-90: Muy bien, estás desarrollando visión estratégica
- 91-100: Excelente, tienes pensamiento de QA Lead/Analyst

---

## Siguiente Paso

Has aprendido a identificar los PROBLEMAS de un objetivo.

**Para cada historia identificada, puedes:**

**Opción A:** Diseñar el plan de pruebas usando **Nivel 2: Problem-Driven Learning**

```
Genera problema de testing para [EPIC-ID]
```

**Opción B:** Ir directo a las consignas usando **Nivel 1: Prompt-Driven Learning**

```
Genera consignas de [DB/API/UI] Testing para [STORY-ID]
```
````

---

## Ejemplo de Uso

**Input del usuario:**

```
Genera objetivo de testing para @.context/
```

o más específico:

```
Genera objetivo de testing basado en el sistema de @.context/business-data-map.md y @.context/api-architecture.md
```

**La IA debe:**

1. Preguntar: ¿Modo A (generar nuevo) o Modo B (seleccionar existente)?
2. Analizar business-data-map.md, api-architecture.md, design-system.md
3. Revisar épicas existentes en .context/PBI/epics/
4. Según el modo:
   - **Modo A:** Generar una Épica coherente con el sistema
   - **Modo B:** Seleccionar una Épica existente
5. Generar los 3 archivos:
   - `[sistema]-objetivo-analisis.md`
   - `[sistema]-objetivo-necesidad.md`
   - `[sistema]-objetivo-respuestas.md`

---

## Nomenclatura de Archivos

| Output     | Formato                                      |
| ---------- | -------------------------------------------- |
| Análisis   | `[sistema-lowercase]-objetivo-analisis.md`   |
| Objetivo   | `[sistema-lowercase]-objetivo-necesidad.md`  |
| Respuestas | `[sistema-lowercase]-objetivo-respuestas.md` |

**Ejemplos:**

- Sistema MYM → `mym-objetivo-analisis.md`
- Sistema Ecommerce → `ecommerce-objetivo-analisis.md`

---

## Consideraciones Pedagógicas

1. **Visión sistémica:** El estudiante debe entender el sistema completo antes de descomponer.

2. **Granularidad correcta:** Enseñar a identificar el tamaño correcto de una historia.

3. **Pensamiento de dependencias:** Entender qué debe existir antes de qué.

4. **ACs desde el inicio:** Pensar en testing desde la definición del problema.

5. **Priorización basada en valor y riesgo:** No solo ordenar, sino justificar.

6. **Conexión con niveles inferiores:** Mostrar cómo continuar el aprendizaje.

---

## Perfil del Estudiante para este Nivel

Este nivel está diseñado para estudiantes que:

- Ya dominan la ejecución de pruebas (Nivel 1)
- Ya saben diseñar planes de prueba (Nivel 2)
- Quieren desarrollar habilidades de análisis y planificación
- Aspiran a roles de QA Lead, Test Analyst, o QA Architect
- Participan en sesiones de refinamiento o planificación de sprints

---

## Tags

`#objective-driven-learning` `#nivel-3` `#meta-game` `#objetivos` `#qa-training` `#test-strategy` `#epic-decomposition` `#user-stories`
