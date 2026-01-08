# Test Prioritization

> Aplicar análisis ROI para determinar qué pruebas entran en regresión y cuáles se automatizan.

---

## Propósito

Priorizar los candidatos de test identificados en el análisis, determinando:

1. **¿Vale la pena documentar?** → Entra en regresión
2. **¿Vale la pena automatizar?** → Candidate vs Manual
3. **¿En qué orden?** → Prioridad de implementación

**Este prompt se ejecuta DESPUÉS de:**

- Test analysis completado
- Lista de candidatos con clasificaciones

---

## Pre-requisitos

**Cargar contexto obligatorio:**

```
Leer: .context/guidelines/QA/jira-test-management.md
```

---

## Input Requerido

- Reporte de análisis de `test-analysis.md`
- O lista de candidatos con clasificaciones

---

## Workflow

### Fase 1: Calcular ROI para Cada Candidato

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

**Interpretación del ROI:**

| ROI Score | Decisión                                |
| --------- | --------------------------------------- |
| > 2.0     | **Automatizar** - ROI excelente         |
| 1.5 - 2.0 | **Automatizar** - ROI bueno             |
| 1.0 - 1.5 | **Evaluar** - Caso por caso             |
| 0.5 - 1.0 | **Manual** - ROI bajo para automatizar  |
| < 0.5     | **Diferir/Descartar** - No vale la pena |

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

### Fase 4: Asignar Tracks de Regresión

**Track 1: Automated Regression (CI/CD)**

- ROI > 1.5
- Automatizable = Sí
- Se ejecuta en cada PR o nightly

**Track 2: Manual Regression**

- ROI 0.5 - 1.5 con Automatizable = No
- O ROI > 1.5 pero no automatizable
- Se ejecuta antes de release

**Track 3: Deferred**

- ROI < 0.5
- Baja prioridad
- Se revisa en futuro

---

### Fase 5: Determinar Path del Workflow

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

### Fase 6: Generar Reporte de Priorización

```markdown
# Test Prioritization Report

**Feature:** [Feature/US name]
**Fecha:** [Date]
**Total Candidatos:** [N]

---

## Análisis ROI

| #   | Escenario           | Freq | Impact | Stab | Effort | Deps | ROI  | Comp Bonus | Final |
| --- | ------------------- | ---- | ------ | ---- | ------ | ---- | ---- | ---------- | ----- |
| 1   | Login exitoso       | 5    | 5      | 5    | 2      | 1    | 12.5 | ×2.0       | 25.0  |
| 2   | Checkout completo   | 4    | 5      | 4    | 4      | 3    | 1.7  | ×1.0       | 1.7   |
| 3   | Validación password | 4    | 3      | 5    | 2      | 1    | 3.0  | ×1.4       | 4.2   |
| 4   | Visual alignment    | 2    | 2      | 3    | 4      | 2    | 0.4  | -          | 0.4   |

---

## Decisiones por Candidato

### Candidatos para Automatización (→ Candidate)

| Rank | Escenario           | ROI Final | Tipo       | Justificación                  |
| ---- | ------------------- | --------- | ---------- | ------------------------------ |
| 1    | Login exitoso       | 25.0      | Functional | Base para 5 E2E, ROI excelente |
| 2    | Validación password | 4.2       | Functional | Componente de Login, alto ROI  |
| 3    | Checkout completo   | 1.7       | E2E        | Flujo crítico de negocio       |

**Path Workflow:** Ready → In Review → Candidate
**Esfuerzo estimado:** [X] ATCs para Fase 12

---

### Candidatos para Regresión Manual (→ Manual)

| Rank | Escenario         | ROI | Razón No Automatizar              |
| ---- | ----------------- | --- | --------------------------------- |
| 1    | Visual alignment  | 0.4 | Solo validación visual            |
| 2    | Third-party OAuth | 0.8 | Dependencia externa incontrolable |

**Path Workflow:** Ready → Manual
**Tiempo ejecución manual:** ~[X] minutos

---

### Diferidos (No documentar ahora)

| Escenario           | ROI | Razón                  |
| ------------------- | --- | ---------------------- |
| Feature X raramente | 0.2 | Uso < 1%, bajo impacto |

---

## Resumen de Tracks

| Track                | Count | Ejecución            |
| -------------------- | ----- | -------------------- |
| Automated Regression | [N]   | CI/CD Pipeline       |
| Manual Regression    | [N]   | Sprint end / Release |
| Deferred             | [N]   | Backlog              |

---

## Orden de Implementación Recomendado

### Sprint actual (Fase 12):

1. **Login exitoso** - Base para otros tests, implementar primero
2. **Validación password** - Extensión natural de Login
3. **Checkout completo** - E2E crítico

### Sprint siguiente:

4. [Otros candidatos...]

---

## Para Test Documentation (siguiente paso):

Los siguientes tests serán documentados en Jira:

| Escenario           | Path Final  | Status Target |
| ------------------- | ----------- | ------------- |
| Login exitoso       | → Candidate | In Review     |
| Validación password | → Candidate | In Review     |
| Checkout completo   | → Candidate | In Review     |
| Visual alignment    | → Manual    | Manual        |
| Third-party OAuth   | → Manual    | Manual        |
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

- Lista priorizada con scores ROI
- Decisión de path (Candidate/Manual/Deferred) por test
- Orden de implementación recomendado
- Justificaciones documentadas
- Estimación de esfuerzo para Fase 12
