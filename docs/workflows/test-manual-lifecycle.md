# Test Manual Lifecycle (TMLC)

> **Idioma:** Español
> **Fase IQL:** Early-Game + Mid-Game (Stages 1-4)
> **Audiencia:** QA Analysts que ejecutan el ciclo de testing manual

---

## ¿Qué es TMLC?

El **Test Manual Lifecycle** es el flujo de trabajo que sigue un QA Analyst desde que recibe una User Story hasta que documenta los casos de prueba formales.

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST MANUAL LIFECYCLE                         │
│                                                                  │
│   Stage 1          Stage 2          Stage 3          Stage 4    │
│   ────────         ────────         ────────         ────────   │
│                                                                  │
│   Análisis    →   Exploratory  →   Priorización →  Documentación│
│   de AC            Testing          por Riesgo      de Test Cases│
│                                                                  │
│   ┌───────┐       ┌───────┐       ┌───────┐       ┌───────┐    │
│   │  FTP  │   →   │  FTX  │   →   │ Risk  │   →   │ Test  │    │
│   │ Plan  │       │Execute│       │Assess │       │ Cases │    │
│   └───────┘       └───────┘       └───────┘       └───────┘    │
│                                                                  │
│   IQL Step 1      IQL Step 3      IQL Step 4      IQL Step 5   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: Análisis de Requisitos y AC

> **IQL Step 1** · Shift-Left Testing
> **Output:** Feature Test Plan (FTP)

### ¿Qué hago en esta etapa?

Cuando llega una nueva User Story al sprint, tu primera tarea es **entender completamente qué se va a construir** antes de que Development empiece.

### Pasos

1. **Lee la User Story completa**
   - Título, descripción, criterios de aceptación
   - Si hay mockups o diseños, revísalos

2. **Identifica ambigüedades**
   - ¿Hay AC que no están claros?
   - ¿Faltan casos edge?
   - ¿Qué pasa si el usuario hace X?

3. **Pregunta al PO/BA/Dev**
   - No asumas - pregunta
   - Documenta las respuestas en la US

4. **Crea el Feature Test Plan (FTP)**
   - Lista de escenarios que vas a probar
   - No tienen que ser detallados, solo identificados
   - Prioriza: ¿cuáles son críticos?

### Ejemplo de FTP

```markdown
## FTP: US-123 - Checkout con múltiples métodos de pago

### Escenarios a probar:

1. ✅ Happy path: Pago con tarjeta válida
2. ✅ Pago con tarjeta rechazada
3. ✅ Pago con PayPal
4. ⚠️ Cambiar método de pago después de seleccionar
5. ⚠️ Checkout con carrito vacío (edge case)
6. ❓ Timeout de la pasarela de pago (verificar con Dev)

### Dependencias:

- Necesito credenciales de sandbox de Stripe
- Cuenta de prueba PayPal
```

### Herramientas

- **Jira**: Crear subtask "QA: AC Review" y "QA: Feature Test Plan"
- **Slack**: Comunicación con PO/Dev para aclarar dudas
- **AI Assistant**: Ayuda para generar escenarios iniciales

---

## Stage 2: Exploratory Testing

> **IQL Step 3** · Early-Gank
> **Output:** Bugs reportados, US validada

### ¿Qué hago en esta etapa?

Una vez que Development despliega la US en staging, ejecutas **testing exploratorio** para validar que funciona correctamente.

### Pasos

1. **Verifica que el ambiente está listo**
   - ¿La US está deployada?
   - ¿Tienes acceso al ambiente de staging?
   - ¿Hay datos de prueba disponibles?

2. **Ejecuta el Feature Test Execution (FTX)**
   - Usa tu FTP como guía
   - Empieza por el happy path
   - Luego prueba los edge cases

3. **Documenta lo que encuentras**
   - Si encuentras bug → crea ticket inmediatamente
   - Si algo no está claro → pregunta
   - Si todo está OK → marca como aprobado

4. **Prueba más allá del FTP**
   - Testing exploratorio = creatividad
   - ¿Qué pasa si...?
   - Prueba combinaciones no obvias

### Técnicas de Exploratory Testing

```
📋 Session-Based Testing:
   - Timeboxed (30-60 min)
   - Enfocado en un área
   - Documentas hallazgos al final

🎯 Tour-Based Testing:
   - "Tour del dinero": Sigue el flujo de transacciones
   - "Tour del principiante": Actúa como usuario nuevo
   - "Tour del hacker": Intenta romper cosas

🔍 Heurísticas:
   - CRUD: Create, Read, Update, Delete
   - Boundaries: Límites, valores extremos
   - Interruptions: ¿Qué pasa si cancelo a mitad?
```

### Reporte de Bug

```markdown
## BUG: Checkout falla con tarjetas American Express

**Pasos para reproducir:**

1. Agregar producto al carrito
2. Ir a checkout
3. Seleccionar "Pagar con tarjeta"
4. Ingresar número de tarjeta Amex: 3782 8224 6310 005
5. Completar formulario y hacer clic en "Pagar"

**Resultado actual:**
Error genérico "Payment failed" sin más detalle

**Resultado esperado:**

- Si Amex no está soportada: Mensaje claro indicándolo
- Si está soportada: Pago debería procesarse

**Ambiente:** Staging
**Browser:** Chrome 120
**Screenshots:** [adjuntos]
```

### Herramientas

- **Browser**: Chrome/Firefox con DevTools abierto
- **Postman**: Para probar APIs directamente
- **Jira**: Crear bugs, actualizar US
- **Screenshots**: Loom, Screenshot tool

---

## Stage 3: Priorización por Riesgo

> **IQL Step 4** · Risk-Based Testing
> **Output:** Lista priorizada de escenarios para documentar

### ¿Qué hago en esta etapa?

Después de validar la US, decides **cuáles escenarios merecen documentación formal** vs cuáles quedan como testing exploratorio.

### Criterios de Priorización

| Criterio                | Preguntas                             | Si es Alto...            |
| ----------------------- | ------------------------------------- | ------------------------ |
| **Impacto de negocio**  | ¿Afecta revenue? ¿Usuarios críticos?  | Documentar + Automatizar |
| **Frecuencia de uso**   | ¿Cuántos usuarios lo usan?            | Documentar               |
| **Complejidad técnica** | ¿Hay muchos componentes involucrados? | Documentar               |
| **Historial de bugs**   | ¿Ha fallado antes?                    | Documentar + Automatizar |
| **Cambios frecuentes**  | ¿El código cambia seguido?            | Automatizar              |

### Matriz de Decisión

```
                    Alta Probabilidad de Fallo
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         │    DOCUMENTAR      │    DOCUMENTAR +    │
         │    + MONITOREAR    │    AUTOMATIZAR     │
         │                    │                    │
   Bajo  ├────────────────────┼────────────────────┤ Alto
 Impacto │                    │                    │ Impacto
         │    EXPLORATORY     │    DOCUMENTAR      │
         │    SOLO            │                    │
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    Baja Probabilidad de Fallo
```

### Output: Lista Priorizada

```markdown
## Priorización de Escenarios - US-123 Checkout

### 🔴 Críticos (Documentar + Candidato a Automatizar)

1. Happy path pago con tarjeta
2. Pago rechazado muestra error correcto
3. Validación de campos obligatorios

### 🟡 Importantes (Documentar)

4. Cambio de método de pago
5. Aplicar código de descuento
6. Checkout con múltiples productos

### 🟢 Bajo Riesgo (Solo Exploratorio)

7. Checkout con carrito de un solo item
8. UI en diferentes resoluciones
```

### Herramientas

- **Jira**: Etiquetas de prioridad
- **Confluence**: Documentar decisiones de riesgo
- **Spreadsheet**: Matriz de riesgo si es necesario

---

## Stage 4: Documentación de Test Cases

> **IQL Step 5** · Async Documentation
> **Output:** Test Cases formales en el repositorio

### ¿Qué hago en esta etapa?

Con la lista priorizada, creas **Test Cases formales** para los escenarios importantes. Esto se hace **asincrónicamente** - no bloquea el delivery de la US.

### Pasos

1. **Crea el Test Case en Jira/Xray**
   - Título descriptivo
   - Precondiciones claras
   - Pasos numerados
   - Datos de prueba
   - Resultado esperado

2. **Vincula al Epic de Tests**
   - Cada feature tiene un "Test Repository" (Epic)
   - El Test Case se vincula ahí

3. **Marca como candidato a automatización (si aplica)**
   - Label: "automation-candidate"
   - Esto lo verá el QA Automation en TALC

### Estructura de un Test Case

```markdown
## TC-001: Checkout - Pago exitoso con tarjeta de crédito

**Precondiciones:**

- Usuario logueado
- Al menos 1 producto en el carrito
- Cuenta con tarjeta de prueba válida

**Datos de prueba:**

- Tarjeta: 4242 4242 4242 4242
- Fecha: 12/25
- CVV: 123

**Pasos:**

1. Navegar a /checkout
2. Verificar que el resumen del carrito es correcto
3. Seleccionar "Pagar con tarjeta"
4. Ingresar datos de la tarjeta de prueba
5. Hacer clic en "Confirmar pago"
6. Esperar confirmación

**Resultado esperado:**

- Mensaje de éxito "¡Gracias por tu compra!"
- Email de confirmación enviado
- Order creada en estado "paid"
- Inventario actualizado

**Etiquetas:** regression, checkout, payments, automation-candidate
```

### Cuándo NO documentar

- Escenarios triviales (login básico si ya está documentado)
- Tests one-time (migración de datos)
- Casos que cambian constantemente
- Escenarios cubiertos por otros test cases

### Herramientas

- **Jira + Xray**: Test Management
- **Confluence**: Documentación adicional
- **AI Assistant**: Ayuda para generar test cases desde FTP

---

## Resumen del Flujo TMLC

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   US Llega al Sprint                                            │
│         │                                                        │
│         ▼                                                        │
│   ┌─────────────┐                                               │
│   │  Stage 1    │  "¿Qué vamos a probar?"                       │
│   │  AC Review  │  → FTP creado                                 │
│   └──────┬──────┘                                               │
│          │                                                       │
│          ▼  (Dev implementa, deploya a staging)                 │
│   ┌─────────────┐                                               │
│   │  Stage 2    │  "¿Funciona correctamente?"                   │
│   │  Exploratory│  → Bugs reportados, US validada              │
│   └──────┬──────┘                                               │
│          │                                                       │
│          ▼                                                       │
│   ┌─────────────┐                                               │
│   │  Stage 3    │  "¿Qué merece documentación?"                 │
│   │  Risk-Based │  → Lista priorizada                           │
│   └──────┬──────┘                                               │
│          │                                                       │
│          ▼  (Async - no bloquea delivery)                       │
│   ┌─────────────┐                                               │
│   │  Stage 4    │  "Documentar formalmente"                     │
│   │  Test Cases │  → TCs en repositorio                         │
│   └──────┬──────┘                                               │
│          │                                                       │
│          ▼                                                       │
│   Handoff a TALC (Automation)                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prompts Relacionados

Para ejecutar cada stage con ayuda de AI:

| Stage   | Prompt                                                  |
| ------- | ------------------------------------------------------- |
| Stage 1 | `.prompts/stage-1-shift-left/acceptance-test-plan.md`   |
| Stage 2 | `.prompts/stage-2-exploratory/*.md`                     |
| Stage 3 | `.prompts/stage-3-documentation/test-prioritization.md` |
| Stage 4 | `.prompts/stage-3-documentation/test-documentation.md`  |

---

## Referencias

- [IQL Methodology](../methodology/IQL-methodology.md)
- [Early-Game Testing](../methodology/early-game-testing.md)
- [TALC - Automation Lifecycle](./test-automation-lifecycle.md)
