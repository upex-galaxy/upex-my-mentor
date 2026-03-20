# Criterios de Aceptación - Shift-Left Testing PRs

> **Propósito:** Guía para revisar PRs de Shift-Left QA antes de aprobar y mergear.
> **Audiencia:** Reviewers (Dev Lead, QA Lead, IA)

---

## Contexto

Los PRs de Shift-Left contienen análisis y test cases creados por QA **antes** de la implementación. Estos PRs solo deben modificar archivos dentro de `.context/` y nunca código fuente.

**Flujo esperado:**

1. QA crea rama `test/MYM-XX/descripcion` o `docs/MYM-XX/descripcion`
2. QA genera `test-cases.md` y/o `acceptance-test-plan.md` en la story
3. QA deja comentario en Jira con resumen del análisis
4. QA crea PR a `staging`
5. Reviewer valida con estos criterios
6. Merge → US transiciona a "Ready For Dev"

---

## Criterios de Evaluación

### 1. Nomenclatura del PR (Título)

| Criterio           | Requerido | Ejemplo Válido                 |
| ------------------ | --------- | ------------------------------ |
| Prefijo correcto   | ✅        | `test`, `docs`, `docs(qa)`     |
| ID de User Story   | ✅        | `MYM-XX` presente               |
| Título descriptivo | ✅        | Describe el trabajo realizado  |
| Idioma             | ✅        | Inglés o español (consistente) |

**Ejemplos válidos:**

- `test(MYM-30): add acceptance test plan`
- `docs(qa): add Test Cases for MYM-30 - Save Invoice as Draft`
- `docs(MYM-18): add shift-left testing and implementation plans`

**Ejemplos inválidos:**

- `Update files` ❌ (no descriptivo)
- `MYM-30` ❌ (solo ID, sin contexto)
- `feat(MYM-30): add test cases` ❌ (prefijo incorrecto)

---

### 2. Nomenclatura de la Rama

| Criterio           | Requerido | Ejemplo Válido                     |
| ------------------ | --------- | ---------------------------------- |
| Prefijo correcto   | ✅        | `test/` o `docs/`                  |
| ID de User Story   | ✅        | `MYM-XX` presente                   |
| Nombre descriptivo | ✅        | kebab-case, describe el contenido  |
| Consistencia       | ✅        | Rama y título deben ser coherentes |

**Ejemplos válidos:**

- `test/MYM-30/save-invoice-draft`
- `docs/MYM-18-shift-left-plan`
- `test/MYM-25/add-discounts`

**Ejemplos inválidos:**

- `feature/add-test-cases` ❌ (prefijo incorrecto)
- `test/test-cases` ❌ (sin ID de US)
- `feat/MYM-30/tests` ❌ (prefijo de feature, no de test)

---

### 3. Rama Base

| Criterio                   | Requerido |
| -------------------------- | --------- |
| Debe apuntar a `staging`   | ✅        |
| **NUNCA** apuntar a `main` | ❌        |

> ⚠️ **Importante:** Si el PR apunta a `main`, solicitar cambio de base inmediatamente.

---

### 4. Descripción del PR

| Criterio              | Requerido | Detalle                                                    |
| --------------------- | --------- | ---------------------------------------------------------- |
| Estructura clara      | ✅        | Summary, Test Plan, etc.                                   |
| No vacía/pobre        | ✅        | Mínimo 3-5 líneas de contexto                              |
| Links a Jira          | ✅        | `[MYM-XX](https://upexgalaxy64.atlassian.net/browse/MYM-XX)` |
| Resumen de test cases | ✅        | Tabla o lista de TCs creados                               |

**Estructura recomendada:**

```markdown
## Summary

- [Descripción del trabajo realizado]
- [Cantidad de test cases]
- [Hallazgos relevantes]

## Test Plan

- [ ] Review test cases document
- [ ] Verify alignment with story requirements

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

### 5. Archivos Modificados

| Criterio                       | Requerido | Detalle                       |
| ------------------------------ | --------- | ----------------------------- |
| Solo archivos en `.context/`   | ✅        | NUNCA código fuente           |
| Dentro de épica/story correcta | ✅        | `EPIC-MYM-XX/.../STORY-MYM-YY/` |
| No pisar archivos de otros PRs | ✅        | Solo su story/epic            |
| Nombre según estándar          | ✅        | Ver tabla abajo               |

**Nombres de archivo estándar:**

| Archivo                   | Propósito                     | Ubicación                                     |
| ------------------------- | ----------------------------- | --------------------------------------------- |
| `test-cases.md`           | Test cases de la US           | `.context/PBI/epics/.../stories/STORY-MYM-XX/` |
| `acceptance-test-plan.md` | Plan de pruebas de aceptación | `.context/PBI/epics/.../stories/STORY-MYM-XX/` |
| `feature-test-plan.md`    | Plan de pruebas del Epic      | `.context/PBI/epics/EPIC-MYM-XX/`              |

---

### 6. Trabajo en Jira

| Criterio              | Requerido | Detalle                          |
| --------------------- | --------- | -------------------------------- |
| Comentario en US/Epic | ✅        | Resumen del análisis             |
| Contenido relevante   | ✅        | Test cases, findings, estimación |
| Menciones si aplica   | ⚡        | @Dev o @PO para ambiguedades     |

**El comentario en Jira debe incluir:**

- Resumen de complejidad
- Tabla de test cases
- Ambiguedades/gaps encontrados
- Link al PR (una vez creado)

---

## Sistema de Scoring

| Score | Significado                                | Acción                     |
| ----- | ------------------------------------------ | -------------------------- |
| 5     | Excelente - Ejemplar, usar como referencia | ✅ Approve + Merge         |
| 4-4.5 | Muy bueno - Cumple todos los criterios     | ✅ Approve + Merge         |
| 3.5   | Bueno con observaciones menores            | ✅ Approve con comentarios |
| 3     | Aceptable con correcciones necesarias      | ⚠️ Approve condicional     |
| < 3   | Requiere cambios significativos            | ❌ Request Changes         |

---

## Acciones del Reviewer

### Aprobar PR

```bash
# 1. Dejar comentario con el review
gh pr comment <PR#> --body "## 📋 Review Shift-Left PR

**Score:** X/5 - [Veredicto]

### Checklist
- [x] Nomenclatura PR
- [x] Nomenclatura Rama
- [x] Rama Base (staging)
- [x] Descripción
- [x] Archivos en .context/
- [x] Comentario en Jira

### Observaciones
[Observaciones si las hay]

✅ **Aprobado para merge**"

# 2. Aprobar
gh pr review <PR#> --approve --body "LGTM - Shift-Left QA completo"

# 3. Mergear (si US está Ready For Dev)
gh pr merge <PR#> --merge
```

### Solicitar Cambios

```bash
gh pr review <PR#> --request-changes --body "## ❌ Cambios Requeridos

[Lista de cambios necesarios]

Por favor corregir antes de re-review."
```

---

## Checklist Rápido para Reviewer

```
[ ] Título: Prefijo correcto + MYM-XX + descriptivo
[ ] Rama: test/ o docs/ + MYM-XX + descriptivo
[ ] Base: staging (NO main)
[ ] Descripción: Completa con contexto
[ ] Archivos: Solo en .context/, story correcta
[ ] Jira: Comentario con análisis
[ ] US Status: Ready For Dev (para merge)
```

---

## Referencias

- [Spec-Driven Testing](./spec-driven-testing.md)
- [Jira Test Management](./jira-test-management.md)
- [Git Flow](../../../.prompts/git-flow.md)

---

_Creado: 2026-02-11_
_Última actualización: 2026-02-11_
