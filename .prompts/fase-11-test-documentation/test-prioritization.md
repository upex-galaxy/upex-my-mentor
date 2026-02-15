# Test Prioritization

> Aplicar análisis ROI **estricto** para determinar qué pruebas realmente valen la pena mantener en regresión.

---

## Propósito

Priorizar los candidatos de test con enfoque **Risk-Based Testing**, siendo **muy selectivos** sobre qué entra en regresión para minimizar mantenibilidad.

**Preguntas clave que responde este prompt:**

1. **¿Este test protege contra regresiones FUTURAS?** → No solo valida implementación inicial
2. **¿Vale la pena el costo de mantenimiento?** → Cada test tiene costo
3. **¿Cuántos tests REALMENTE necesitamos?** → Menos es más

**⚠️ CONTEXTO CRÍTICO:**

La User Story ya está **QA Approved**:

- ✅ TODAS las pruebas YA PASARON
- ✅ Los bugs YA SE CERRARON
- ✅ NO estamos diseñando tests para ejecutar

**Estamos decidiendo:** ¿Cuáles de esas pruebas que ya pasaron valen la pena VOLVER a correr en el futuro?

---

## Pre-requisitos

**Cargar contexto obligatorio:**

```
Leer: .context/guidelines/QA/jira-test-management.md
```

---

## Input Requerido

- Reporte de análisis de `test-analysis.md`
- Lista de candidatos con clasificaciones
- Lista de bugs previos relacionados (para análisis de riesgo)

---

## Workflow

### Fase 0: Preguntas Críticas de Risk-Based Testing

**⚠️ OBLIGATORIO:** Antes de calcular ROI, responder estas preguntas para CADA candidato:

#### Pregunta 1: ¿Protege contra regresiones FUTURAS?

```
¿Si alguien hace cambios en el código en 3 meses, este test evitará que rompan algo?

- SÍ → Continuar evaluación
- NO → Probablemente fue validación one-time, DIFERIR
```

**Indicadores de "NO protege":**

- Error fue typo o implementación inicial incorrecta
- Área del código muy estable, nadie la toca
- Edge case extremadamente raro (< 1% de usuarios)
- One-time validation (pluralización, copy, etc.)

#### Pregunta 2: ¿Hay bugs PREVIOS relacionados?

```
¿Este escenario está relacionado con un bug que ya se encontró y cerró?

- SÍ → Mayor probabilidad de regresión, PRIORIZAR
- NO → Evaluar normalmente
```

**Regla:** Si falló una vez, puede volver a fallar. Bugs previos = mayor riesgo.

#### Pregunta 3: ¿Se valida mejor a nivel APP o FEATURE?

```
¿Esta validación aplica a TODA la app o solo a esta feature?

- Nivel APP → No crear test por feature (ejemplos: XSS, error handling global, responsive)
- Nivel FEATURE → Crear test específico
```

**Validaciones a nivel APP (NO son tests por feature):**

- XSS prevention → Suite de seguridad global
- Error handling → Tests de resiliencia globales
- Mobile responsive → Ejecutar tests en múltiples viewports
- Performance → Métricas globales de app
- Accesibilidad → Suite de a11y global

---

### Fase 1: Calcular ROI para Cada Candidato (Estricto)

**Solo evaluar candidatos que pasaron las 3 preguntas de Fase 0.**

**Fórmula ROI:**

```
ROI = (Frecuencia × Impacto × Estabilidad) / (Esfuerzo × Dependencias)

Donde cada factor se puntúa 1-5:

FRECUENCIA (¿Cada cuánto se ejecutará?)
- 5: Cada PR / commit
- 4: Diario
- 3: Cada sprint
- 2: Cada release
- 1: Ocasionalmente

IMPACTO (¿Qué tan grave si falla?)
- 5: Afecta revenue / core business
- 4: Bloquea feature principal
- 3: Degrada experiencia de usuario
- 2: Inconveniente menor
- 1: Cosmético / bajo impacto

ESTABILIDAD (¿Qué tan estable es el flujo?)
- 5: Muy estable, rara vez cambia
- 4: Estable, cambios menores
- 3: Moderado, cambia cada sprint
- 2: Inestable, cambia frecuentemente
- 1: Muy volátil, en desarrollo activo

ESFUERZO (¿Cuánto cuesta automatizar?)
- 1: Trivial (minutos)
- 2: Bajo (horas)
- 3: Moderado (1-2 días)
- 4: Alto (varios días)
- 5: Muy alto (semana+)

DEPENDENCIAS (¿Cuántas integraciones?)
- 1: Ninguna / self-contained
- 2: 1-2 dependencias simples
- 3: 3-4 dependencias
- 4: 5+ dependencias
- 5: Dependencias externas complejas
```

**Interpretación del ROI (Umbrales ESTRICTOS):**

| ROI Score | Decisión                    | Acción                                |
| --------- | --------------------------- | ------------------------------------- |
| > 5.0     | **Automatizar**             | ROI excelente, incluir en regresión   |
| 3.0 - 5.0 | **Automatizar con cautela** | Evaluar si hay alternativa más simple |
| 1.5 - 3.0 | **Evaluar caso por caso**   | ¿Hay bug previo? ¿Es flujo crítico?   |
| 0.5 - 1.5 | **Probablemente diferir**   | Solo incluir si hay bug previo        |
| < 0.5     | **Diferir**                 | No vale la pena mantener en regresión |

**⚠️ Cambio vs versión anterior:** Los umbrales son más altos porque:

- Cada test tiene costo de mantenimiento
- La mayoría de bugs no vuelven a ocurrir tras la primera corrección
- Menos tests bien elegidos > muchos tests de bajo valor

---

### Fase 2: Aplicar Matriz de Riesgo

```
                    ALTO IMPACTO DE NEGOCIO
                           │
           ┌───────────────┼───────────────┐
           │   CRÍTICO     │    ALTO       │
           │  Automatizar  │  Automatizar  │
           │  Primero      │  Segundo      │
           │               │               │
ALTO ──────┼───────────────┼───────────────┼────── BAJO
RIESGO     │               │               │      RIESGO
DE FALLO   │    MEDIO      │    BAJO       │
           │  Automatizar  │  Manual o     │
           │  Tercero      │  Diferir      │
           │               │               │
           └───────────────┼───────────────┘
                           │
                    BAJO IMPACTO DE NEGOCIO
```

---

### Fase 3: Evaluar Valor como Componente

**Bonus de reutilización:**

Un test que es componente de múltiples flujos E2E tiene mayor valor:

```
Valor Componente = ROI Base × (1 + 0.2 × N)

Donde N = número de flujos E2E que lo usan

Ejemplo:
- "Login exitoso" usado en 5 flujos E2E
- ROI Base = 1.5
- Valor Componente = 1.5 × (1 + 0.2 × 5) = 1.5 × 2.0 = 3.0
- Resultado: Alta prioridad para automatizar
```

---

### Fase 4: Decisión Final por Candidato

**Para CADA candidato, aplicar esta tabla de decisión:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ÁRBOL DE DECISIÓN POR CANDIDATO                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ¿Pasó las 3 preguntas de Fase 0?                                          │
│  ├─ NO → DIFERIR (no protege contra regresiones futuras)                   │
│  └─ SÍ ↓                                                                   │
│                                                                             │
│  ¿Tiene bug previo relacionado?                                            │
│  ├─ SÍ → PRIORIZAR (incluir aunque ROI sea moderado)                       │
│  └─ NO ↓                                                                   │
│                                                                             │
│  ¿ROI > 3.0?                                                               │
│  ├─ SÍ → AUTOMATIZAR                                                       │
│  └─ NO ↓                                                                   │
│                                                                             │
│  ¿Es flujo principal/crítico de la feature?                                │
│  ├─ SÍ → Considerar 1 test que cubra el happy path principal               │
│  └─ NO → DIFERIR                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Fase 5: Consolidar en Tracks (Resultado Mínimo)

**Track 1: Automated Regression (CI/CD)**

- Pasó árbol de decisión
- ROI > 3.0 O tiene bug previo
- Se ejecuta en cada PR o nightly

**Track 2: Manual Regression** (usar con cautela)

- ROI 1.5 - 3.0 Y no automatizable
- Muy pocos tests deberían estar aquí
- Se ejecuta antes de release

**Track 3: Deferred** (mayoría de candidatos)

- No pasó árbol de decisión
- ROI < 1.5 sin bug previo
- Ya se validó en primera ejecución, muy improbable que falle

**⚠️ OBJETIVO:** La mayoría de candidatos deberían ser DIFERIDOS. Si más del 50% pasa a regresión, revisar si estamos siendo demasiado permisivos.

---

### Fase 6: Determinar Path del Workflow

Basado en el análisis, decidir el path en el workflow:

```
Para cada test candidato:

SI (ROI > 1.5 AND Automatizable = Sí):
    → Path: Ready → In Review → Candidate
    → Resultado: Listo para Fase 12 (Automation)

SI (ROI > 0.5 AND Automatizable = No):
    → Path: Ready → Manual
    → Resultado: Regresión manual

SI (ROI 1.0-1.5 AND Automatizable = Sí):
    → Path: Ready → In Review
    → Resultado: Evaluar con más contexto
    → Puede ir a Candidate o Manual

SI (ROI < 0.5):
    → No documentar
    → O documentar como Draft y diferir
```

---

### Fase 7: Generar Reporte de Priorización

```markdown
# Test Prioritization Report

**Feature:** [Feature/US name]
**Fecha:** [Date]
**Total Candidatos Inicial:** [N]
**Candidatos que pasaron filtro:** [M] (objetivo: < 50% del total)

---

## Fase 0: Filtro de Preguntas Críticas

| #   | Escenario                 | ¿Protege futuro? | ¿Bug previo? | ¿Nivel feature? | ¿Pasa filtro? |
| --- | ------------------------- | ---------------- | ------------ | --------------- | ------------- |
| 1   | [Nombre con nomenclatura] | SÍ/NO            | SÍ/NO        | SÍ/NO           | ✅/❌         |
| 2   | [Nombre con nomenclatura] | SÍ/NO            | SÍ/NO        | SÍ/NO           | ✅/❌         |

**Resultado:** [X] de [N] candidatos pasan el filtro inicial.

---

## Análisis ROI (Solo candidatos que pasaron filtro)

| #   | Escenario (Nomenclatura) | Freq | Impact | Stab | Effort | Deps | ROI | Bug Previo | Decisión   |
| --- | ------------------------ | ---- | ------ | ---- | ------ | ---- | --- | ---------- | ---------- |
| 1   | Validar X cuando Y       | 4    | 5      | 4    | 2      | 2    | 5.0 | BUG-XXX    | ✅ AUTO    |
| 2   | Validar A cuando B       | 3    | 3      | 5    | 2      | 1    | 4.5 | -          | ✅ AUTO    |
| 3   | Validar C cuando D       | 2    | 2      | 4    | 3      | 2    | 1.3 | -          | ❌ DIFERIR |

---

## Decisión Final

### ✅ Para Regresión Automatizada

| #   | Escenario                          | ROI | Justificación                             |
| --- | ---------------------------------- | --- | ----------------------------------------- |
| 1   | [Nombre completo con nomenclatura] | X.X | [Flujo principal / Bug previo / ROI alto] |

**Total:** [N] tests (objetivo: 1-3 por feature simple, 3-5 por feature compleja)

### ❌ Diferidos (NO entran en regresión)

| #   | Escenario | ROI | Razón para diferir                     |
| --- | --------- | --- | -------------------------------------- |
| X   | [Nombre]  | X.X | Ya se validó, muy improbable que falle |
| Y   | [Nombre]  | X.X | Edge case raro, one-time validation    |
| Z   | [Nombre]  | X.X | Se valida a nivel APP, no por feature  |

**Total diferidos:** [M] (debería ser mayoría)

---

## Resumen

| Métrica | Antes (candidatos) | Después (regresión) | Reducción |
| ------- | ------------------ | ------------------- | --------- |
| Total   | [N]                | [M]                 | [X]%      |

| Track                | Count | Justificación        |
| -------------------- | ----- | -------------------- |
| Automated Regression | [1-3] | Solo lo esencial     |
| Manual Regression    | [0-1] | Casi nunca necesario |
| Deferred             | [N-M] | Mayoría              |

---

## Para Test Documentation (siguiente paso):

**Tests a documentar en Jira:**

| Escenario | Path        | Nomenclatura Final                           |
| --------- | ----------- | -------------------------------------------- |
| [Nombre]  | → Candidate | `{US_ID}: TC1: Validar <CORE> <CONDITIONAL>` |

**Características transversales (NO son tests):**

| Característica    | Cómo se valida                    |
| ----------------- | --------------------------------- |
| Mobile responsive | Ejecutar tests en viewport mobile |
| XSS prevention    | Incluir en test data              |
| Performance       | Assertions de tiempo              |
```

---

## Decisión Point

Después de priorización:

| Acción            | Siguiente Paso                |
| ----------------- | ----------------------------- |
| Tests priorizados | → `test-documentation.md`     |
| Todos diferidos   | → Cerrar fase                 |
| Necesita más info | → Volver a `test-analysis.md` |

---

## Output

- **Filtro aplicado:** Cuántos candidatos pasaron las preguntas críticas
- **Lista priorizada:** Con scores ROI y decisión final
- **Tests para regresión:** Mínimo necesario (1-3 por feature simple)
- **Diferidos documentados:** Con justificación de por qué no entran
- **Nomenclatura preservada:** Usar mismos nombres que en Shift-Left/Exploratory

---

## Principios de Risk-Based Testing

1. **Menos es más:** Cada test tiene costo de mantenimiento
2. **Bugs previos priorizan:** Si falló una vez, puede volver a fallar
3. **Mayoría se difiere:** La mayoría de tests one-time no necesitan regresión
4. **Nivel correcto:** Algunas validaciones son a nivel APP, no FEATURE
5. **Flujo > fragmentos:** Preferir 1 test de flujo completo que 5 tests atómicos
