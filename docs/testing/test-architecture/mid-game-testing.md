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

### Step 5: Documentación de Casos de Prueba Asíncrono

**TMLC - Test Manual Life Cycle (4th Stage)**

Crear 'Test' tickets formales para cada escenario scriptado priorizado, sin bloquear la entrega de la US.

**Actividades Clave:**

- El estado normalmente comienza como 'Draft'
- QA documenta los pasos de prueba, datos y resultados esperados en los 'Test' tickets
- Cada ticket se enlaza al Epic Test Repository en Jira para una gestión centralizada

**Resultado Esperado:**
Un backlog sano de test cases de alto valor, listo para ejecución manual o automatizada.

**Herramientas:** Jira, Xray, Confluence

---

### Step 6: Evaluación de Pruebas Candidatas a Automatización

**TALC - Test Automation Life Cycle (1st Stage)**

Revisar los test cases recién documentados para determinar si deben automatizarse.

**Actividades Clave:**

- El test pasa a estado 'In Review'
- QA Automation inspecciona cada 'Test' ticket para comprobar su factibilidad
- Si es viable, se marca como 'Candidate'; de lo contrario, permanece 'Manual'
- Se actualiza el Automation Backlog en consecuencia

**Resultado Esperado:**
Diferenciación clara entre tests manuales y candidatos a automatizar.

**Herramientas:** Jira, Xray, Claude Code

---

### Step 7: Automatización de Casos de Pruebas Candidatas

**TALC - Test Automation Life Cycle (2nd Stage) - TAUS Model**

Convertir los tests candidatos en scripts automatizados para CI usando el modelo TAUS.

**Actividades Clave:**

- Transiciones de estado: Candidate → In Automation
- Se crea una nueva rama, se implementan los scripts de prueba
- Se hace push de los cambios siguiendo el patrón TAUS

**Resultado Esperado:**
Los tests scriptados quedan listos para la integración continua.

**Herramientas:** GitHub, Playwright, Cypress, Docker

---

### Step 8: Verificación de Pruebas Automatizadas en CI

**TALC - Test Automation Life Cycle (3rd Stage)**

Validar los nuevos tests automatizados en la pipeline de Continuous Integration.

**Actividades Clave:**

- Se ejecuta el conjunto de tests automatizados en CI (nightly builds o cada commit)
- Se confirma que los tests pasen de forma estable (sin flakiness)
- Cualquier fallo o problema en los scripts se corrige de forma rápida

**Resultado Esperado:**
Tests automatizados estables e integrados de manera confiable en CI/CD.

**Herramientas:** GitHub Actions, Docker, Slack

---

### Step 9: Revisión de Código de Pruebas (Pull Request)

**TALC - Test Automation Life Cycle (4th Stage)**

Crear un Pull Request detallado para revisión y aprobación de los nuevos tests automatizados.

**Actividades Clave:**

- Transiciones de Estado: Merge Request → Automated
- Se crea un Pull Request detallando los nuevos cambios del Repositorio
- Se revisa y se aprueba el Pull Request por otro QA/Dev
- Se realiza el merge una vez aprobado

**Resultado Esperado:**
Pull Request MERGED. Tests automatizados estables e integrados de manera confiable en CI/CD.

**Herramientas:** GitHub, Visual Studio Code, Cursor

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
