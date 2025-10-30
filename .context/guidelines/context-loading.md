# Context Loading Guide

> **Para**: Todas las fases asincrónicas (3-8)
> **Propósito**: Saber QUÉ archivos leer en cada fase

---

## 🎯 Living Documentation

**Principio**: Usar MCPs para datos en vivo, NO documentación estática.

```
❌ MAL: Leer schema hardcodeado en docs
✅ BIEN: Usar Supabase MCP para obtener schema real

❌ MAL: Leer endpoints hardcodeados
✅ BIEN: Usar api-contracts.yaml actualizado

❌ MAL: Asumir estructura de código
✅ BIEN: Usar IDE diagnostics MCP para verificar
```

---

## 📋 Context Loading por Fase

### **Fase 3: Specification** (Crear stories)

```
Leer ANTES de crear story:
├── .context/PRD/
│   ├── executive-summary.md    # Entender el problema
│   ├── user-personas.md        # Saber para quién
│   └── mvp-scope.md            # Scope general
│
├── .context/SRS/
│   ├── functional-specs.md     # FRs disponibles
│   └── architecture-specs.md   # Restricciones técnicas
│
└── .context/PBI/
    └── epic-tree.md            # Épicas existentes
```

**Output**: Nueva story en `.context/PBI/epics/EPIC-XXX/stories/STORY-YYY/story.md`

---

### **Fase 4: Shift-Left Testing** (Crear test cases)

```
Leer ANTES de crear test cases:
├── .context/PBI/epics/EPIC-XXX/stories/STORY-YYY/
│   └── story.md                # Story + acceptance criteria
│
├── .context/SRS/
│   ├── functional-specs.md     # FRs relevantes
│   └── non-functional-specs.md # NFRs (performance, security)
│
└── .context/guidelines/tae/
    └── test-strategy.md        # Estrategia general de testing
```

**Output**: Test cases en `.context/PBI/epics/EPIC-XXX/stories/STORY-YYY/test-cases.md`

---

### **Fase 5: Planning** (Crear implementation plan)

```
Leer ANTES de crear plan:
├── .context/PBI/epics/EPIC-XXX/stories/STORY-YYY/
│   ├── story.md                # User story
│   └── test-cases.md           # Test cases esperados
│
├── .context/SRS/
│   ├── architecture-specs.md   # Arquitectura general
│   ├── api-contracts.yaml      # API specs
│   └── functional-specs.md     # FRs
│
└── MCPs:
    ├── Supabase → Schema real de DB
    └── Context7 → Docs de bibliotecas
```

**Output**: Plan en `.context/PBI/epics/EPIC-XXX/stories/STORY-YYY/implementation-plan.md`

---

### **Fase 6: Implementation** (Implementar código)

```
Leer ANTES de codear:
├── .context/PBI/epics/EPIC-XXX/stories/STORY-YYY/
│   ├── story.md                # ¿Qué hacer?
│   ├── test-cases.md           # ¿Qué probar?
│   └── implementation-plan.md  # ¿Cómo hacerlo?
│
├── .context/SRS/
│   ├── architecture-specs.md   # Arquitectura
│   └── api-contracts.yaml      # API contracts
│
├── .context/guidelines/
│   ├── implementation-workflow.md  # Workflow
│   ├── code-standards.md       # Estándares
│   ├── error-handling.md       # Errores
│   └── mcp-usage-tips.md       # Cuándo usar MCPs
│
└── MCPs:
    ├── Supabase → Schema, datos reales
    ├── Context7 → Docs de libs
    └── IDE Diagnostics → Errores TypeScript
```

**Output**: Código implementado

---

### **Fase 7: Code Review** (Revisar código)

```
Leer DURANTE review:
├── .context/PBI/epics/EPIC-XXX/stories/STORY-YYY/
│   ├── story.md                # ¿Se cumple?
│   ├── test-cases.md           # ¿Todos pasan?
│   └── implementation-plan.md  # ¿Se siguió el plan?
│
└── .context/guidelines/
    ├── code-standards.md       # ¿Sigue estándares?
    └── error-handling.md       # ¿Errores bien manejados?
```

**Checklist**: Ver `implementation-workflow.md` → Definition of Done

---

### **Fase 8: Test Automation** (Automatizar tests)

```
Leer ANTES de automatizar:
├── .context/PBI/epics/EPIC-XXX/stories/STORY-YYY/
│   └── test-cases.md           # Test cases a automatizar
│
├── .context/guidelines/tae/
│   ├── kata-architecture.md    # Arquitectura KATA
│   ├── test-strategy.md        # Estrategia
│   ├── automation-standards.md # Estándares
│   ├── test-data-management.md # Datos de prueba
│   └── component-catalog.md    # Componentes disponibles
│
└── MCPs:
    ├── Playwright → Generar tests E2E
    └── Context7 → Docs de Playwright/testing libs
```

**Output**: Tests automatizados en `/tests/`

---

## 💡 Tips de Eficiencia

### 1. Cargar solo lo necesario
```
❌ Leer todo .context/ cada vez
✅ Leer solo la carpeta de la story actual + guidelines relevantes
```

### 2. Usar MCPs para datos en vivo
```
❌ Leer schema en docs (puede estar desactualizado)
✅ Supabase MCP: "¿Qué columnas tiene la tabla users?"
```

### 3. Context layering
```
1. Story context (específico)
2. Epic context (feature level)
3. SRS context (arquitectura)
4. Guidelines (reference)
```

---

## ⚠️ Errores Comunes

### ❌ NO hacer:
1. **Leer documentación desactualizada**
   - Usa MCPs para datos en vivo

2. **Cargar todo el contexto**
   - Solo carga lo relevante para la task actual

3. **Ignorar guidelines**
   - Siempre leer guidelines/ antes de implementar

4. **Asumir en vez de verificar**
   - Usa Supabase MCP para schema real
   - Usa IDE Diagnostics para verificar tipos

---

**Última actualización**: 2025-10-29
**Aplica a**: Fases 3-8 (asincrónicas)
