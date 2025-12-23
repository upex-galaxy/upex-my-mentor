# Spec-Driven Development (SDD)

> **Para**: Desarrolladores de Software
> **Principio**: Primero especificar, luego implementar

---

## El Principio

**Spec-Driven Development** es un enfoque donde todo código nace de especificaciones claras y documentadas. No se escribe código "al aire" - cada línea tiene trazabilidad hacia una especificación.

---

## Los 4 Pilares

### 1. Specification First

```
❌ MAL: "Voy a crear un formulario de login"
✅ BIEN: "Voy a implementar STORY-XXX que especifica el flujo de login"
```

Antes de codear:

- Leer la **story** (`.context/PBI/epics/.../stories/.../story.md`)
- Entender los **acceptance criteria**
- Revisar los **test cases** esperados

### 2. Plan Before Code

```
❌ MAL: Abrir el editor y empezar a escribir
✅ BIEN: Leer el implementation plan y entender los pasos
```

Antes de codear:

- Leer el **implementation plan** (`.context/PBI/.../implementation-plan.md`)
- Identificar dependencias
- Entender el orden de implementación

### 3. Quality Built-In

```
❌ MAL: "Después le agrego validaciones"
✅ BIEN: Implementar con validaciones desde el inicio
```

Durante el código:

- Aplicar `code-standards.md` desde la primera línea
- Implementar `error-handling.md` en cada operación
- Agregar `data-testid` a elementos interactivos

### 4. Test-Aware Development

```
❌ MAL: "Después veo cómo testearlo"
✅ BIEN: Implementar sabiendo cómo se probará
```

Durante el código:

- Revisar los test cases antes de implementar
- Agregar data-testid para facilitar testing
- Pensar en edge cases desde el inicio

---

## Flujo de Trabajo SDD

```
Especificación                  Implementación
     │                               │
     ▼                               ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Story  │ → │  Test   │ → │  Plan   │ → │  Code   │
│   +AC   │    │  Cases  │    │ Técnico │    │ + Tests │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
   Fase 4        Fase 5        Fase 6        Fase 7
```

**Antes de escribir código** ya existe:

1. User story con acceptance criteria (Fase 4)
2. Test cases detallados (Fase 5)
3. Plan técnico paso a paso (Fase 6)

---

## Beneficios

| Aspecto          | Sin SDD                        | Con SDD            |
| ---------------- | ------------------------------ | ------------------ |
| **Claridad**     | "¿Qué debo hacer?"             | Story + AC claros  |
| **Calidad**      | Bugs en producción             | Bugs en desarrollo |
| **Trazabilidad** | "¿Por qué existe este código?" | Mapeado a story    |
| **Testing**      | "¿Cómo lo pruebo?"             | Test cases listos  |
| **Review**       | "¿Cumple requirements?"        | Checklist claro    |

---

## Anti-Patrones

### ❌ Code-First Development

```
"Déjame escribir el código y después veo qué hace"
```

**Problema**: Sin especificación, no hay forma de validar si el código es correcto.

### ❌ Assumption-Driven Development

```
"Asumo que el usuario quiere..."
```

**Problema**: Las asunciones llevan a retrabajos. Usar la story como fuente de verdad.

### ❌ Test-Last Development

```
"Ya funciona, no necesita tests"
```

**Problema**: Sin tests, no hay confianza en refactorizar. Los test cases ya existen en Fase 5.

---

## Checklist SDD

Antes de escribir código:

- [ ] Leí la story completa
- [ ] Entiendo todos los acceptance criteria
- [ ] Revisé los test cases
- [ ] Leí el implementation plan
- [ ] Tengo claro el orden de implementación
- [ ] Sé qué data-testid agregar

Durante el código:

- [ ] Cada función tiene propósito claro (mapeado a AC)
- [ ] Error handling implementado
- [ ] data-testid en elementos interactivos
- [ ] Sin valores hardcodeados

Después del código:

- [ ] Todos los AC se cumplen
- [ ] Unit tests escritos
- [ ] Code standards verificados

---

## Ver También

- `code-standards.md` - Estándares de código
- `error-handling.md` - Manejo de errores
- `data-testid-standards.md` - Estándares de data-testid
- `.prompts/us-dev-workflow.md` - Workflow de desarrollo

---

**Última actualización**: 2025-12-21
