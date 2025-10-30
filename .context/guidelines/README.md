# Guidelines - Reference Material

> **Para**: Fases 6-7-8 (Implementation, Code Review, Test Automation)
> **Propósito**: Guidelines que la IA debe leer antes de implementar código o tests

---

## 📂 Estructura

```
guidelines/
├── README.md (este archivo)
│
├── 📝 Code Implementation Guidelines
│   ├── implementation-workflow.md  # Workflow paso a paso
│   ├── code-standards.md          # DRY, naming, TypeScript strict
│   ├── error-handling.md          # Manejo de errores estructurado
│   ├── context-loading.md         # Qué leer en cada fase
│   └── mcp-usage-tips.md          # Cuándo usar cada MCP
│
└── 🧪 Test Automation Guidelines
    └── tae/                        # Test Automation Engineering
        ├── README.md
        ├── kata-architecture.md
        ├── test-strategy.md
        ├── automation-standards.md
        ├── test-data-management.md
        ├── ci-cd-integration.md
        ├── tms-integration.md
        ├── component-catalog.md
        └── atc-registry.md
```

---

## 🎯 Uso por Fase

### **Fase 6: Implementation**

La IA DEBE leer:
```
✅ implementation-workflow.md  # Cómo implementar
✅ code-standards.md          # Estándares de código
✅ error-handling.md          # Manejo de errores
✅ context-loading.md         # Qué archivos leer
✅ mcp-usage-tips.md          # Cuándo usar MCPs
```

### **Fase 7: Code Review**

La IA DEBE leer:
```
✅ code-standards.md          # Verificar estándares
✅ error-handling.md          # Verificar errores
✅ implementation-workflow.md # Definition of Done
```

### **Fase 8: Test Automation**

La IA DEBE leer:
```
✅ tae/kata-architecture.md   # Arquitectura KATA
✅ tae/test-strategy.md       # Estrategia de testing
✅ tae/automation-standards.md # Estándares de tests
✅ tae/test-data-management.md # Manejo de datos
✅ context-loading.md         # Qué archivos leer
✅ mcp-usage-tips.md          # Usar Playwright MCP
```

---

## 🔑 Conceptos Clave

### **1. Guidelines vs Documentation**

| Tipo | Ubicación | Cuándo se lee |
|------|-----------|---------------|
| **Guidelines** | `.context/guidelines/` | SIEMPRE antes de implementar |
| **Specs** | `.context/SRS/`, `.context/PRD/` | Al planificar features |
| **Stories** | `.context/PBI/` | Al implementar tasks específicas |

### **2. Living Documentation**

Guidelines promueven **living documentation**:
- ✅ Usar Supabase MCP para schema real (no docs estáticos)
- ✅ Usar Context7 MCP para docs oficiales (siempre actualizadas)
- ✅ Usar Atlassian MCP para issues en vivo

Ver: `mcp-usage-tips.md`

### **3. Reference Material**

Guidelines son **reference material**, NO se generan:
- Pre-pobladas con best practices
- Se consultan constantemente
- Se actualizan solo cuando cambian estándares del proyecto

---

## 📚 Archivos Detallados

### **implementation-workflow.md**
Workflow completo de implementación:
1. Cargar contexto
2. Verificar plan
3. Breakdown en subtareas
4. Implementar iterativamente
5. Quality checks
6. Testing continuo
7. Code review self-check
8. Documentación

### **code-standards.md**
Estándares de código:
- DRY, KISS, YAGNI
- Naming conventions
- TypeScript strict mode
- Component structure
- Performance best practices
- Accessibility (a11y)

### **error-handling.md**
Manejo de errores:
- Custom error classes
- Structured responses
- Retry logic
- Strategic logging
- Qué NO hacer

### **context-loading.md**
Qué leer en cada fase:
- Fase 3: Specification
- Fase 4: Shift-Left Testing
- Fase 5: Planning
- Fase 6: Implementation
- Fase 7: Code Review
- Fase 8: Test Automation

### **mcp-usage-tips.md**
Cuándo usar cada MCP:
- Supabase → Database schema
- Context7 → Docs oficiales
- Atlassian → Project management
- Playwright → E2E testing
- Postman → API testing
- GitHub → Repository
- Slack → Notifications

### **tae/** (Test Automation Engineering)
Ver `tae/README.md` para detalles completos de testing guidelines.

---

## ✅ Checklist para Developers

Antes de implementar cualquier feature:
- [ ] Leí `implementation-workflow.md`
- [ ] Revisé `code-standards.md`
- [ ] Entiendo `error-handling.md`
- [ ] Sé qué contexto cargar (`context-loading.md`)
- [ ] Configuré MCPs correctos (`mcp-usage-tips.md`)
- [ ] Si hago tests, leí `tae/` guidelines

---

## 🔗 Ver También

- **MCP Builder**: `docs/mcp-builder-strategy.md`
- **Blueprint**: `docs/ai-driven-software-project-blueprint.md`
- **KATA Testing**: `docs/kata-test-architecture.md`

---

**Última actualización**: 2025-10-29
**Tipo**: Reference material (pre-poblado)
**Fases**: 6-7-8 (Implementation, Code Review, Test Automation)
