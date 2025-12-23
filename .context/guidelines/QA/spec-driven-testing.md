# Spec-Driven Testing

> **Para**: QA Engineers
> **Principio**: Primero especificar, luego testear

---

## El Principio

**Spec-Driven Testing** es el complemento de Spec-Driven Development. Así como el desarrollo se guía por especificaciones, el testing también:

- **User Story** → Define QUÉ probar
- **Acceptance Criteria** → Define los CRITERIOS de éxito
- **Test Cases** → Define CÓMO probar

---

## Los 4 Pilares

### 1. Test from Specs

```
❌ MAL: "Voy a probar el login a ver qué encuentro"
✅ BIEN: "Voy a verificar que STORY-XXX cumple sus acceptance criteria"
```

Antes de testear:

- Leer la **story** completa
- Entender los **acceptance criteria**
- Revisar los **test cases** documentados

### 2. Traceability

```
❌ MAL: Bug: "El botón no funciona"
✅ BIEN: Bug: "AC-3 de STORY-XXX falla: El botón submit no responde"
```

Todo bug debe:

- Referenciar la story relacionada
- Indicar qué acceptance criteria falla
- Tener pasos claros de reproducción

### 3. Coverage from Requirements

```
❌ MAL: "Probé todo lo que se me ocurrió"
✅ BIEN: "Verifiqué cada AC y sus edge cases documentados"
```

La cobertura se mide por:

- % de acceptance criteria verificados
- % de test cases ejecutados
- Edge cases cubiertos

### 4. Exploratory with Purpose

```
❌ MAL: Click random por la aplicación
✅ BIEN: Exploración enfocada en áreas de riesgo de la story
```

Testing exploratorio debe:

- Partir de la story y sus ACs
- Buscar edge cases no documentados
- Documentar hallazgos con trazabilidad

---

## Flujo de Trabajo Spec-Driven Testing

```
Especificación              Testing                    Feedback
     │                         │                          │
     ▼                         ▼                          ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Story  │ → │  Test   │ → │ Execute │ → │ Report  │
│   +AC   │    │  Cases  │    │ & Find  │    │ & Doc   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
   Fase 4        Fase 5        Fase 10       Fase 11
```

**El testing NO inventa qué probar** - la especificación ya lo define.

---

## Relación con Spec-Driven Development

| Desarrollo (SDD)            | Testing (SDT)          |
| --------------------------- | ---------------------- |
| Story → Implementation Plan | Story → Test Cases     |
| AC → Código                 | AC → Test Criteria     |
| Plan → Código               | Test Cases → Ejecución |
| Code Review                 | Test Review            |

**Son dos caras de la misma moneda**: Especificación primero.

---

## Beneficios

| Aspecto          | Sin SDT         | Con SDT           |
| ---------------- | --------------- | ----------------- |
| **Enfoque**      | "¿Qué pruebo?"  | Story + AC claros |
| **Cobertura**    | Subjetiva       | Medible por AC    |
| **Bugs**         | "Algo anda mal" | Trazables a spec  |
| **Priorización** | Por intuición   | Por impacto en AC |

---

## Anti-Patrones

### ❌ Random Testing

```
"Voy a clickear por ahí a ver qué pasa"
```

**Problema**: Sin foco, sin cobertura medible, sin trazabilidad.

### ❌ Test Without Spec

```
"No leí la story pero pruebo igual"
```

**Problema**: ¿Cómo sabes si algo es bug o es el comportamiento esperado?

### ❌ Bug Without Context

```
"Bug: El botón no funciona"
```

**Problema**: Sin referencia a story/AC, el dev no sabe qué debería hacer.

---

## Checklist SDT

Antes de testear:

- [ ] Leí la story completa
- [ ] Entiendo todos los acceptance criteria
- [ ] Revisé los test cases documentados
- [ ] Tengo el ambiente de staging listo

Durante el testing:

- [ ] Verifico cada AC sistemáticamente
- [ ] Documento hallazgos con referencia a specs
- [ ] Busco edge cases más allá de los documentados
- [ ] Capturo evidencia (screenshots, videos)

Después del testing:

- [ ] Todos los AC verificados ✓/✗
- [ ] Bugs reportados con trazabilidad
- [ ] Tests documentados para automatización
- [ ] Priorización de tests para TAE

---

## Ver También

- `exploratory-testing.md` - Técnicas de testing exploratorio
- `jira-test-management.md` - Gestión en Jira
- `data-testid-usage.md` - Uso de data-testid
- `.prompts/us-qa-workflow.md` - Workflow de QA
- `../DEV/spec-driven-development.md` - SDD para desarrollo

---

**Última actualización**: 2025-12-21
