# Early-Game Testing

> **Fase 1 del IQL** · Shift-Left · BDD · Risk-Based

## Visión General

**"Construyámoslo bien desde el principio"**

Fase de **Prevención** - Enfoque en prevenir defectos a través de colaboración temprana y análisis.

La **primera fase del Integrated Quality Lifecycle** donde el **QA Analyst** lidera la estrategia temprana. Como en gaming: **Dominar el Early-Game** te da ventaja decisiva para toda la partida.

---

## Early-Game: Primera Fase del IQL

**Early-Game Testing** es la fase fundamental del **Integrated Quality Lifecycle** donde se establecen las bases estratégicas de calidad para todo el proyecto.

### Posición en el IQL Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ●══════════════════════════════════════════════════════════▶   │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐│
│  │  EARLY-GAME     │──▶│   MID-GAME      │──▶│   LATE-GAME     ││
│  │  ✅ FASE ACTUAL │   │   Siguiente     │   │   Futuro        ││
│  │                 │   │                 │   │                 ││
│  │  Steps 1-4      │   │   Steps 5-9     │   │   Steps 10-15   ││
│  │  QA Analyst     │   │   QA Automation │   │   QA + DevOps   ││
│  └─────────────────┘   └─────────────────┘   └─────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Características del Early-Game

| Aspecto           | Detalle                     |
| ----------------- | --------------------------- |
| **Steps**         | 1-4 del IQL                 |
| **Enfoques**      | Shift-Left, BDD, Risk-Based |
| **Rol Principal** | QA Analyst                  |
| **Herramientas**  | Jira, Confluence, Postman   |

> _"🎮 Early-Game: La Base de la Ventaja Estratégica"_
>
> Como en los MOBAs, **dominar el early-game te da ventaja para toda la partida**. En el IQL, esta fase establece la **fundación estratégica de calidad** que facilita el éxito en las fases Mid-Game y Late-Game.

---

## Los 4 Pasos del Early-Game Testing

**Early-Game Testing** se ejecuta a través de **4 pasos específicos** que corresponden a los Steps 1-4 del IQL.

> _"Cada paso tiene un objetivo específico dentro del TMLC (Test Manual Life Cycle) y se integra perfectamente con el workflow de desarrollo."_

### Step 1: Análisis de Requerimientos y Planificación

**TMLC - Test Manual Life Cycle (1st Stage)**

Entender los requerimientos y finalizar los acceptance criteria de la US antes de empezar la implementación.

**Actividades Clave:**

- QA discute ambigüedades con los stakeholders
- QA crea un Feature Test Plan (FTP) que describe los escenarios iniciales
- El subtask 'QA: AC Review' y 'QA: Feature Test Plan' pasa de Open → In Progress → Done

**Resultado Esperado:**
Un conjunto claro de acceptance criteria y un FTP para guiar el testing específico en la US.

**Herramientas:** Jira, Confluence, Slack, Claude Code

---

### Step 2: Desarrollo e Implementación

**Trabajo en paralelo (No es tarea directa de QA)**

Construir y desplegar la US en un entorno de staging mientras QA prepara la estrategia.

**Actividades Clave:**

- Los desarrolladores crean una rama e implementan el código de la US
- Se despliega el código en el Environment correspondiente
- QA puede probar la US en la misma rama de desarrollo si es posible

**Resultado Esperado:**
Un entorno funcional donde el equipo de QA puede comenzar con las pruebas.

**Herramientas:** GitHub, Docker, TypeScript, Python

---

### Step 3: Ejecución Temprana de Pruebas Exploratorias

**TMLC - Test Manual Life Cycle (2nd Stage) - Early-Gank**

Validar rápidamente la US usando Feature Test Execution (FTX) definido en el FTP.

**Actividades Clave:**

- El subtask 'QA: Feature Testing' pasa de Open → In Progress → Done
- QA realiza pruebas exploratorias dirigidas en áreas críticas o de alto riesgo
- Se reportan hallazgos y defectos inmediatamente

**Resultado Esperado:**
La User Story puede desplegarse a producción una vez que QA lo aprueba. La US se cierra en Jira.

**Herramientas:** Browser DevTools, Postman, Jira

---

### Step 4: Priorización basada en Riesgo

**TMLC - Test Manual Life Cycle (3rd Stage) - Risk-Based**

Decidir qué escenarios del FTP merecen test cases formales vs mantenerse como exploratorios.

**Actividades Clave:**

- QA evalúa el impacto potencial y probabilidad de defectos de cada escenario
- Los escenarios de alto valor se seleccionan para convertirse en Test Case
- Decisiones se registran en un Test Repository (Epic en Jira)

**Resultado Esperado:**
Lista refinada de escenarios listos para convertirse en test cases scriptados.

**Herramientas:** Xray, Jira, Confluence

---

## Conceptos Clave del Early-Game Testing

### Shift-Left Testing

- **Descripción:** Involucrar a QA desde el inicio para descubrir defectos más pronto y reducir retrabajo.
- **Beneficio:** Prevención Temprana = Economía Optimizada

### Exploratory Testing

- **Descripción:** El Feature Testing de forma 'Exploratoria' proporciona validación rápida antes del cierre de la US.
- **Beneficio:** Feedback Ágil y Flexible

### Risk-Based Selection

- **Descripción:** Destinar recursos de QA a los escenarios de mayor impacto para documentación y automatización.
- **Beneficio:** Tiempo Invertido en lo que Importa

### Async Documentation

- **Descripción:** Diseñar test cases después de la aprobación de la US mantiene el proceso ágil sin bloqueos.
- **Beneficio:** Entrega Sin Retrasos

---

## Enfoques Integrados en Early-Game Testing

Nuestra metodología integra **múltiples tipos y estrategias de testing** organizados en cinco categorías principales para crear una cobertura completa y estratégica.

### 1. Macro-Enfoques Estratégicos

Los tres enfoques fundamentales que guían toda la metodología de trabajo en UPEX:

#### Shift-Left Testing

- **Enfoque principal:** Involucrar al equipo de QA desde las etapas más tempranas del ciclo de desarrollo.
- **Objetivo:** Detectar defectos y ambigüedades al inicio para reducir costos y retrabajo.

#### Risk-Based Testing

- **Enfoque inteligente:** Desarrollar y priorizar pruebas clasificando escenarios según impacto y criticidad.
- **Objetivo:** Enfocar esfuerzos en Valor-Costo-Riesgo, evitando sobrecarga de documentación innecesaria.

#### Continuous Testing

- **Enfoque de automatización:** Integrar pruebas automatizadas en el pipeline de CI/CD para feedback inmediato.
- **Objetivo:** Mantener la calidad del software mediante validación constante y detección temprana de regresiones.

### 2. Enfoques por Método de Diseño y Ejecución

Definen cómo se diseñan y ejecutan los casos de prueba:

#### Scripted Testing

- **Pruebas con Guion:** Diseñadas con pasos concretos, datos de entrada y resultados esperados.
- **Ideales para:** Escenarios repetitivos como regresión y cuando la trazabilidad es prioritaria.

#### Exploratory Testing

- **Pruebas Exploratorias:** Basadas en objetivos o hipótesis (charters) sin pasos rígidamente definidos.
- **Permiten:** Investigar el software de manera libre y creativa, descubriendo defectos en "rincones" poco explorados.

### 3. El "Tridente del Testing" - Competencias Técnicas Clave

Considerado el **conocimiento mínimo esencial** en UPEX. Define las **competencias técnicas fundamentales** que se aprenden y aplican con la metodología Early-Game Testing.

> **Nota importante:** El Tridente no son enfoques de la metodología, sino las **áreas de conocimiento técnico** que todo QA debe dominar.

#### Testing E2E / Frontend (System Testing)

Pruebas que validan el flujo completo desde la UI, simulando cómo un usuario real interactuaría con el sistema.

#### API Testing / Backend (Logic Layer Testing)

Pruebas a nivel de lógica de negocio para validar comunicación y respuestas entre diferentes servicios.

#### Testing de Base de Datos (Data Layer Testing)

Se enfoca en la capa de datos para asegurar integridad y consistencia de la información.

### 4. Testing No Funcional - Aspectos de Calidad

Pruebas que evalúan aspectos de calidad más allá de la funcionalidad:

| Tipo                      | Descripción                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Performance Testing**   | Mide la carga y el estrés que puede soportar el sistema                        |
| **Usability Testing**     | Evalúa qué tan fácil e intuitivo es el sistema para el usuario                 |
| **Security Testing**      | Se enfoca en identificación de vulnerabilidades de seguridad                   |
| **Accessibility Testing** | Asegura que la aplicación sea utilizable por personas con diversas capacidades |

### 5. Enfoques por Estrategia de Ejecución

Se aplican en momentos específicos del ciclo de vida para cumplir objetivos concretos:

| Enfoque                | Descripción                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Smoke Testing**      | Chequeo rápido para validar que las funcionalidades esenciales funcionan. Decide si una versión es estable para pruebas profundas. |
| **Sanity Testing**     | Pruebas superficiales y rápidas después de cambios menores para validar que funcionalidades principales siguen operando.           |
| **Regression Testing** | Ejecutar conjunto amplio de pruebas para confirmar que nuevas modificaciones no afectaron funcionalidades existentes.              |
| **Re-Testing**         | Se enfoca específicamente en volver a probar funcionalidades que previamente tuvieron defectos para confirmar corrección exitosa.  |
| **Feature Testing**    | Testing exhaustivo de características individuales o user stories para validar funcionalidad completa antes de integración.        |

> _"🎮 Early-Game Testing: Metodología Integral"_
>
> Esta **combinación estratégica de enfoques** permite a los QAs formados en UPEX abordar cualquier proyecto con una **ventaja decisiva temprana**, aplicando el enfoque correcto en el momento preciso para maximizar el impacto y optimizar recursos.

---

## ¿Por Qué "Early-Game"?

### La Estrategia Ganadora

En los videojuegos competitivos (MOBA), los jugadores profesionales saben que **dominar el "early game"** es crucial para ganar la partida. Las decisiones y acciones que tomas en los primeros minutos determinan tu ventaja para el resto del juego.

| En Gaming Competitivo                                                                                                                                  | En QA Estratégico                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Controlar recursos temprano, posicionarse estratégicamente y tomar ventaja inicial para dominar el juego completo. **Economía del equipo optimizada.** | Aplicar feedback de calidad desde el comienzo para dar ventaja decisiva al proyecto. **Economía del desarrollo optimizada.** |

---

## Early-Game Testing en la Práctica

Como QA formado en UPEX, no esperas a que el desarrollo termine. **Orquestas la calidad desde el análisis** para crear ventaja estratégica temprana.

### Control Estratégico

Participas en **análisis de requisitos** y **planificación estratégica** para identificar puntos débiles y crear planes de mitigación temprana.

- _Ventaja desde el Origen_

### Economía Optimizada

Realizas **testing exploratorio temprano** y **análisis de riesgos** para optimizar el presupuesto y reducir costos de retrabajo.

- _Recursos Optimizados_

### Base Sólida

Construyes una **fundación de calidad sólida** que facilita automatización, escalabilidad y mantenimiento a largo plazo.

- _Fundación Estratégica_

---

## Tu Ventaja Competitiva en el Mercado

Los QAs formados en Early-Game Testing son altamente valorados porque **piensan estratégicamente** y aportan valor desde el primer día.

### Beneficios Clave

| Beneficio                            | Descripción                                                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Reducción de Costos Dramática**    | Detectar y corregir defectos temprano es hasta 100x más económico que hacerlo en producción. Optimizas la economía del proyecto. |
| **Tiempo de Desarrollo Optimizado**  | Evitas retrabajos y retrasos al identificar problemas antes de que se propaguen. Control total del timeline.                     |
| **Liderazgo Natural**                | Te integras como líder técnico con equipos de desarrollo y producto, orquestando la calidad desde el análisis.                   |
| **Impacto Estratégico Medible**      | Tu trabajo tiene impacto directo y cuantificable en el éxito del producto. Eres parte del core strategy team.                    |
| **Mentalidad de Gaming Competitivo** | Desarrollas pensamiento estratégico, análisis de riesgos y optimización de recursos altamente valorados.                         |
| **Diferenciación Única en CV**       | Te destacas como QA que entiende el negocio, piensa estratégicamente y domina metodologías avanzadas.                            |

---

## Configuración del Ambiente de Trabajo

En UPEX Galaxy trabajas con las **mismas herramientas profesionales** que usarás en empresas reales. Tu experiencia será **100% transferible** al mundo laboral.

### Jira + XRay Integration

**Gestión de Proyectos & Test Management**

- **Jira:** Gestión completa de proyectos, user stories, bugs y seguimiento de avances con metodologías ágiles.
- **XRay:** Test management integrado para diseño, ejecución y reporte de casos de prueba con trazabilidad completa.

_📋 Documentación profesional y trazabilidad_

### GitHub + Actions CI/CD

**Control de Versiones & Automatización**

- **GitHub:** Control de versiones, colaboración en código de automatización y documentación de proyectos.
- **GitHub Actions:** Pipelines CI/CD para ejecución automática de pruebas y deployment de builds.

_⚡ Automatización y Continuous Testing_

### Herramientas Complementarias

| Herramienta            | Uso                                                  |
| ---------------------- | ---------------------------------------------------- |
| **Slack**              | Comunicación en tiempo real con equipos distribuidos |
| **Postman**            | Testing de APIs y documentación de servicios         |
| **Playwright/Cypress** | Automatización de pruebas web y E2E                  |

**Experiencia 100% profesional:** Las mismas herramientas, workflows y metodologías que encontrarás en empresas tecnológicas de primer nivel.

---

## Navegación

- [IQL Metodología](./IQL-methodology.md) - Vista completa del Integrated Quality Lifecycle
- [Mid-Game Testing](./mid-game-testing.md) - Fase 2: Detección e implementación
- [Late-Game Testing](./late-game-testing.md) - Fase 3: Observación y producción
