# Prompt: Test Charter

## Contexto
Lee:
- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/story.md`
- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/test-cases.md` (Fase 5)

## Tu tarea

Crear charter de exploración para sesión de testing manual:

### Charter Template

```markdown
# Test Charter: [STORY-XXX - Nombre]

**Fecha:** [Fecha]
**QA:** [Nombre]
**Duración estimada:** 60-90 minutos

---

## 🎯 Objetivo de la Sesión

[Descripción de qué se va a explorar]

---

## 📋 Áreas a Explorar

### 1. [Área 1 - ej: "Flujo de creación"]
- **Qué probar:** [Descripción]
- **Técnica:** [Tour/Pairing/Personas/Edge cases]
- **Tiempo:** [15-20 minutos]

### 2. [Área 2 - ej: "Validaciones de formulario"]
- **Qué probar:** [Descripción]
- **Técnica:** [Edge cases/Inputs inválidos]
- **Tiempo:** [15-20 minutos]

### 3. [Área 3 - ej: "Integración con backend"]
- **Qué probar:** [Descripción]
- **Técnica:** [Data flows]
- **Tiempo:** [20-30 minutos]

---

## 🔍 Técnicas a Usar

- [ ] **Tours:** Recorrer la funcionalidad completa
- [ ] **Edge cases:** Inputs límite, vacíos, inválidos
- [ ] **Pairing:** Probar con diferentes user personas
- [ ] **Negative testing:** Intentar romper la funcionalidad
- [ ] **UX review:** Validar usabilidad y diseño

---

## ✅ Criterios de Éxito

- [ ] Happy path funciona end-to-end
- [ ] Validaciones muestran mensajes claros
- [ ] No hay errores críticos
- [ ] UX es intuitiva
- [ ] Performance aceptable (< 3s load times)

---

## 📝 Notas
- URL de staging: [URL]
- Credenciales: [Si aplica]
- Datos de prueba: [Si se necesitan]
```

## Output
Test charter markdown listo para ejecutar.
