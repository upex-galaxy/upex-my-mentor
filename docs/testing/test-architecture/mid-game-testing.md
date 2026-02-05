# Mid-Game Testing

> **Fase 2 del IQL** · Continuous Testing · Agile Testing · AI-Driven

## Visión General

**"¿El software cumple con los requerimientos?"**

Fase de **Detección** - Enfoque en detectar defectos antes del release a través de testing estructurado.

La **segunda fase del Integrated Quality Lifecycle** donde el **QA Automation Engineer** lidera la implementación técnica. Como en gaming: **consolidar ventaja del early-game** y prepararse para el late-game.

---

## Mid-Game: Segunda Fase del IQL

**Mid-Game Testing** es la fase central del **Integrated Quality Lifecycle** donde se implementa la estrategia de testing definida en Early-Game.

### Posición en el IQL Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ●══════════════════════════════════════════════════════════▶   │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐│
│  │  EARLY-GAME     │──▶│   MID-GAME      │──▶│   LATE-GAME     ││
│  │  Completado     │   │   ✅ FASE ACTUAL│   │   Siguiente     ││
│  │                 │   │                 │   │                 ││
│  │  Steps 1-4      │   │   Steps 5-9     │   │   Steps 10-15   ││
│  │  QA Analyst     │   │   QA Automation │   │   QA + DevOps   ││
│  └─────────────────┘   └─────────────────┘   └─────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Características del Mid-Game

| Aspecto           | Detalle                      |
| ----------------- | ---------------------------- |
| **Steps**         | 5-9 del IQL                  |
| **Enfoques**      | Continuous, Agile, AI-Driven |
| **Rol Principal** | QA Automation Engineer       |
| **Herramientas**  | Playwright, Jenkins, CI/CD   |

> _"⚡ Mid-Game: Implementación y Automatización"_
>
> Como en los MOBAs, **el mid-game es donde consolidas la ventaja** obtenida en early-game. En el IQL, esta fase **implementa técnicamente la estrategia de testing** para crear un sistema robusto de detección continua de defectos.

---

## Los 5 Pasos del Mid-Game Testing

**Mid-Game Testing** se ejecuta a través de **5 pasos específicos** que corresponden a los Steps 5-9 del IQL.

> _"Transición del TMLC (Test Manual Life Cycle) al TALC (Test Automation Life Cycle) con enfoque en automatización y CI/CD."_

### Step 5: Documentación de ATCs (Acceptance Test Cases)

**TMLC - Test Manual Life Cycle (4th Stage)**

Crear 'Test' tickets (ATCs) formales para cada escenario del ATP priorizado, sin bloquear la entrega de la US.

**Actividades Clave:**

- Los escenarios del ATP se convierten en **ATCs** (Acceptance Test Cases)
- El estado del ATC normalmente comienza como 'Draft'
- QA documenta los pasos de prueba, datos y resultados esperados en cada ATC
- Cada ATC se enlaza al Epic Test Repository en Jira (mapeo 1:1 con tickets)

**Conexión con KATA Framework:**

- Cada ATC es la unidad base para automatización en KATA
- El decorador `@atc('PROJECT-XXX')` vincula el código con el ticket Jira
- La trazabilidad fluye: Story → AC → ATP → ATC → KATA automation

**Resultado Esperado:**
Un backlog sano de ATCs de alto valor, listo para ejecución manual o automatización con KATA.

**Herramientas:** Jira, Xray, Confluence

---

### Step 6: Evaluación de ATCs Candidatos a Automatización

**TALC - Test Automation Life Cycle (1st Stage)**

Revisar los ATCs recién documentados para determinar si deben automatizarse con KATA.

**Actividades Clave:**

- El ATC pasa a estado 'In Review'
- QA Automation inspecciona cada ATC para comprobar su factibilidad de automatización
- Si es viable para KATA, se marca como 'Candidate'; de lo contrario, permanece 'Manual'
- Se actualiza el Automation Backlog con los ATCs candidatos

**Criterios de Evaluación para KATA:**

- ¿El ATC es repetible y determinístico?
- ¿El flujo es estable (no sujeto a cambios frecuentes)?
- ¿Existe cobertura de UI, API, o DB verificable?

**Resultado Esperado:**
Diferenciación clara entre ATCs manuales y ATCs candidatos para automatización con KATA.

**Herramientas:** Jira, Xray, Claude Code

---

### Step 7: Automatización de ATCs con KATA Framework

**TALC - Test Automation Life Cycle (2nd Stage) - KATA Model**

Convertir los ATCs candidatos en scripts automatizados usando el framework KATA.

**Actividades Clave:**

- Transiciones de estado: Candidate → In Automation
- Se crea una nueva rama, se implementan los ATCs como scripts KATA
- Cada ATC usa el decorador `@atc('PROJECT-XXX')` para trazabilidad
- Se hace push de los cambios siguiendo la arquitectura KATA

**Estructura KATA para ATCs:**

```typescript
@atc('PROJECT-123')
test('should validate user login flow', async ({ page }) => {
  // ATC automatizado con trazabilidad a Jira
});
```

**Resultado Esperado:**
Los ATCs automatizados quedan listos para la integración continua.

**Herramientas:** GitHub, Playwright (KATA), Docker

---

### Step 8: Verificación de ATCs Automatizados en CI

**TALC - Test Automation Life Cycle (3rd Stage)**

Validar los ATCs automatizados con KATA en la pipeline de Continuous Integration.

**Actividades Clave:**

- Se ejecuta la suite KATA de ATCs en CI (nightly builds o cada commit)
- Se confirma que los ATCs pasen de forma estable (sin flakiness)
- Cualquier fallo en los ATCs se corrige de forma rápida
- Los reportes muestran trazabilidad ATC → Jira ticket

**Resultado Esperado:**
ATCs automatizados con KATA estables e integrados de manera confiable en CI/CD.

**Herramientas:** GitHub Actions, Docker, Slack

---

### Step 9: Revisión de Código de ATCs (Pull Request)

**TALC - Test Automation Life Cycle (4th Stage)**

Crear un Pull Request detallado para revisión y aprobación de los ATCs automatizados con KATA.

**Actividades Clave:**

- Transiciones de Estado: Merge Request → Automated
- Se crea un Pull Request detallando los nuevos ATCs implementados
- Se revisa arquitectura KATA y trazabilidad de ATCs
- Se realiza el merge una vez aprobado

**Verificación en PR:**

- ¿Los ATCs siguen la arquitectura KATA?
- ¿Cada ATC tiene su decorador `@atc()` con el ticket correcto?
- ¿Los ATCs son mantenibles y siguen los estándares?

**Resultado Esperado:**
Pull Request MERGED. ATCs automatizados con KATA estables e integrados en CI/CD.

**Herramientas:** GitHub, Visual Studio Code, Cursor

---

## KATA Framework: Arquitectura de Automatización

**KATA** (Komponent Action Test Architecture) es el **framework de automatización** usado en Mid-Game para convertir ATCs en scripts ejecutables.

### Conexión ATP → ATC → KATA

```
Story Level (Early-Game):
├── Acceptance Criteria (AC)
└── Acceptance Test Plan (ATP)
    └── Escenarios priorizados

Mid-Game (Steps 5-9):
├── ATC (Acceptance Test Case) → Ticket en Jira
└── KATA Script → Código que implementa el ATC
    └── @atc('PROJECT-XXX') → Trazabilidad
```

**Ver documentación completa de KATA:**

- [KATA Fundamentals](./kata-fundamentals.md) - Conceptos y arquitectura
- [KATA Architecture Guide](/.context/guidelines/TAE/kata-architecture.md) - Configuración del proyecto

---

## Test Automation Pyramid

**Arquitectura estratégica** para organizar la automatización de pruebas con **balance entre velocidad, cobertura y mantenimiento**.

```
                    ┌─────────────┐
                    │  E2E UI     │  10%
                    │   Tests     │  Slowest but comprehensive
                    └─────────────┘
               ┌─────────────────────────┐
               │    Integration/Service   │  20%
               │         Tests            │  Medium speed, good coverage
               └─────────────────────────┘
    ┌─────────────────────────────────────────────────┐
    │                 Unit Tests                       │  70%
    │          Extremely fast                          │  Developers test individual
    │                                                  │  functions/components
    └─────────────────────────────────────────────────┘
```

### Capas de la Pirámide

#### E2E UI Tests (10%)

- **Descripción:** Automate BDD scenarios, simulate full user journeys
- **Características:** Slowest but comprehensive
- **Ejemplos:** Login flow, Purchase workflow, User registration

#### Integration/Service Tests (20%)

- **Descripción:** Test interactions between components/microservices
- **Características:** Medium speed, good coverage
- **Ejemplos:** API integration, Database operations, Service communication

#### Unit Tests (70%)

- **Descripción:** Developers test individual functions/components
- **Características:** Extremely fast
- **Ejemplos:** Function validation, Component isolation, Business logic

### Por Qué la Pirámide Funciona

| Aspecto                      | Beneficio                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| **Velocidad Optimizada**     | 70% de tests unitarios ejecutan en segundos, proporcionando feedback inmediato     |
| **Cobertura Inteligente**    | Cada capa cubre aspectos diferentes: lógica, integración y experiencia del usuario |
| **Mantenimiento Sostenible** | Menos tests E2E significa menor fragilidad y esfuerzo de mantenimiento             |

---

## Los 4 Enfoques del Mid-Game Testing

**Mid-Game Testing** integra cuatro enfoques complementarios que trabajan en sinergia para crear un **sistema robusto de detección**.

### Continuous Testing

- **Descripción:** Testing automatizado integrado en pipelines CI/CD para feedback inmediato en cada cambio.
- **Beneficio:** Feedback Instantáneo

### Agile Testing

- **Descripción:** Ciclos de testing rápidos y eficientes dentro de sprints para acelerar la entrega.
- **Beneficio:** Velocidad Optimizada

### Exploratory Testing

- **Descripción:** Aprovechar inteligencia humana para encontrar issues inesperados que la automatización no detecta.
- **Beneficio:** Cobertura Inteligente

### AI-Driven Testing

- **Descripción:** Utilizar inteligencia artificial para acelerar y mejorar las actividades de testing.
- **Beneficio:** Potencia Amplificada

> _"⚡ Mid-Game: Consolidación de la Ventaja"_
>
> Estos **cuatro enfoques integrados** permiten que el QA Automation Engineer construya un **sistema de detección continua** que consolida la ventaja estratégica obtenida en Early-Game y prepara el terreno para el éxito en Late-Game.

---

## Herramientas del Mid-Game

| Categoría           | Herramientas               |
| ------------------- | -------------------------- |
| **Test Management** | Jira, Xray, Confluence     |
| **Automatización**  | Playwright, Cypress        |
| **CI/CD**           | GitHub Actions, Docker     |
| **IDE**             | Visual Studio Code, Cursor |
| **AI Assistance**   | Claude Code                |
| **Comunicación**    | Slack                      |

---

## Navegación

- [IQL Metodología](./IQL-methodology.md) - Vista completa del Integrated Quality Lifecycle
- [Early-Game Testing](./early-game-testing.md) - Fase 1: Prevención y estrategia temprana
- [Late-Game Testing](./late-game-testing.md) - Fase 3: Observación y producción
