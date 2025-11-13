# Prompt: Session Notes

## Contexto
Durante o después de ejecutar exploratory testing.

## Tu tarea

Documentar hallazgos de la sesión:

### Session Notes Template

```markdown
# Exploratory Testing Session: [STORY-XXX]

**Fecha:** [Fecha]
**QA:** [Nombre]
**Duración:** [Tiempo real]
**Charter:** [Link al charter usado]

---

## 📊 Resumen Ejecutivo

- **Estado:** [✅ PASSED / ⚠️ PASSED WITH ISSUES / ❌ FAILED]
- **Bugs encontrados:** [Número - con severidades]
- **Cobertura:** [% del charter completado]

---

## ✅ Áreas Validadas

### [Área 1]
- ✅ [Funcionalidad validada 1]
- ✅ [Funcionalidad validada 2]
- ✅ [Funcionalidad validada 3]

### [Área 2]
- ✅ [Funcionalidad validada 1]
- ⚠️ [Funcionalidad con issue - ver BUG-XXX]

---

## 🐛 Bugs Encontrados

### 🔴 Critical (bloquean funcionalidad)
1. **[BUG-XXX]:** [Descripción breve]
   - Severidad: Critical
   - Steps to reproduce: [Breve]
   - Reportado en Jira: [Link]

### 🟠 High (funcionalidad parcial)
1. **[BUG-XXX]:** [Descripción breve]
   - Severidad: High
   - Steps to reproduce: [Breve]
   - Reportado en Jira: [Link]

### 🟡 Medium (UX issues)
1. **[BUG-XXX]:** [Descripción breve]
   - Severidad: Medium
   - Reportado en Jira: [Link]

### 🟢 Low (mejoras)
1. **[Sugerencia]:** [Descripción]
   - No bloqueante

---

## 💡 Observaciones de UX

- ✅ [Aspecto positivo 1]
- ✅ [Aspecto positivo 2]
- ⚠️ [Sugerencia de mejora 1]
- ⚠️ [Sugerencia de mejora 2]

---

## 📸 Screenshots/Videos

[Links a evidencia visual si aplica]

---

## 🎯 Recomendaciones

**Para Development:**
- [Recomendación 1]
- [Recomendación 2]

**Para Automation (Fase 11):**
- [Casos a automatizar prioritarios]
- [Edge cases encontrados que deben cubrirse]

---

## ✅ Decisión Final

- [ ] **APPROVED:** Lista para automation (Fase 11)
- [ ] **CHANGES REQUESTED:** Bugs críticos/high deben corregirse
- [ ] **BLOCKED:** Funcionalidad no implementada correctamente
```

## Output
Documento de session notes con hallazgos y decisión.
