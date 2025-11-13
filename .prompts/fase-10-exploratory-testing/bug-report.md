# Prompt: Bug Report

## Contexto
Cuando encuentres un bug durante exploratory testing.

## Tu tarea

Crear bug report estructurado en Jira usando Atlassian MCP:

### Bug Report Template

```markdown
# 🐛 [BUG-XXX]: [Título descriptivo breve]

## 📋 Información General

- **Story relacionada:** [STORY-XXX]
- **Severidad:** [Critical / High / Medium / Low]
- **Ambiente:** Staging
- **URL:** [URL donde ocurre]
- **Navegador:** [Chrome/Firefox/Safari + versión]
- **Fecha:** [Fecha de hallazgo]

---

## 🔴 Severidad: [Critical/High/Medium/Low]

**Criterios:**
- **Critical:** Bloquea funcionalidad core, no hay workaround
- **High:** Funcionalidad parcial, workaround difícil
- **Medium:** Issue de UX, hay workaround fácil
- **Low:** Mejora cosmética, no afecta funcionalidad

---

## 📝 Descripción

[Descripción clara del bug en 2-3 oraciones]

---

## 🔄 Steps to Reproduce

1. [Paso 1 - ser específico]
2. [Paso 2]
3. [Paso 3]
4. [Observa el error]

---

## ✅ Expected Behavior

[Qué debería pasar según la story/acceptance criteria]

---

## ❌ Actual Behavior

[Qué pasa actualmente]

---

## 📸 Evidence

**Screenshot:**
[Adjuntar o link]

**Console errors (si aplica):**
```
[Copiar error de console]
```

**Network errors (si aplica):**
```
[Copiar error de network tab]
```

---

## 🌍 Environment Details

- **OS:** [Windows/Mac/Linux + versión]
- **Browser:** [Nombre + versión]
- **Screen size:** [Desktop/Tablet/Mobile + resolución]
- **User role:** [Admin/User/Guest]

---

## 💡 Additional Notes

[Cualquier información adicional relevante]

---

## 🏷️ Labels

- `bug`
- `severity:[critical/high/medium/low]`
- `[story-number]`
- `exploratory-testing`

---

## 🔗 Related Issues

[Links a bugs relacionados si existen]
```

---

## Crear en Jira con MCP

Usa el Atlassian MCP tool para crear el issue:

```typescript
// Ejemplo de llamada MCP
{
  "project": "[PROJECT-KEY]",
  "issueType": "Bug",
  "summary": "[Título del bug]",
  "description": "[Descripción completa formateada]",
  "priority": "[Critical/High/Medium/Low]",
  "labels": ["bug", "severity:high", "STORY-XXX", "exploratory-testing"]
}
```

## Output
- Bug creado en Jira con ID real (BUG-XXX)
- Link al bug para incluir en session notes
