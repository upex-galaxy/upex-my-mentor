# FASES 2-4: Product Backlog Items (PBI)

Este directorio contiene el backlog completo del producto organizado por épicas y stories.

## 🏗️ Arquitectura Unificada

**Beneficio clave**: Para trabajar en una story, la IA lee **UNA sola carpeta**.

```
PBI/
├── epic-tree.md                    Vista high-level de todas las épicas
└── epics/
    └── EPIC-XXX-nombre/
        ├── epic.md                 [FASE 2] Descripción de la épica
        ├── feature-test-plan.md    [FASE 3] Plan de pruebas
        ├── feature-implementation-plan.md  [FASE 4] Plan técnico
        └── stories/
            └── STORY-XXX-nombre/
                ├── story.md        [FASE 2] User story
                ├── test-cases.md   [FASE 3] Test cases
                └── implementation-plan.md  [FASE 4] Plan de implementación
```

## 📄 Archivos a generar

### FASE 2: Product Backlog

Usa `.prompts/fase-3-specification/pbi-product-backlog.md` para crear:
- `epic-tree.md` - Vista completa del backlog
- `epics/EPIC-XXX/epic.md` - Por cada épica
- `epics/EPIC-XXX/stories/STORY-XXX/story.md` - Por cada story

### FASE 3: Shift-Left Testing (QA)

**Por cada épica:**
- Usa `.prompts/fase-3-shift-left-testing/feature-test-plan.md`
- Genera `epics/EPIC-XXX/feature-test-plan.md`

**Por cada story:**
- Usa `.prompts/fase-3-shift-left-testing/story-test-cases.md`
- Genera `epics/EPIC-XXX/stories/STORY-XXX/test-cases.md`

### FASE 4: Planning (Dev)

**Por cada épica (una vez):**
- Usa `.prompts/fase-4-planning/feature-implementation-plan.md`
- Genera `epics/EPIC-XXX/feature-implementation-plan.md`

**Por cada story (antes de codear):**
- Usa `.prompts/fase-4-planning/story-implementation-plan.md`
- Genera `epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md`

## 🎯 Output esperado

Al completar todas las fases para una story tendrás:
- Definición clara (story.md)
- Test cases detallados (test-cases.md)
- Plan de implementación (implementation-plan.md)
- **TODO en una carpeta** → Context Engineering optimizado

## 📝 Nomenclatura

- Épicas: `EPIC-XXX-nombre-descriptivo/` (ej: `EPIC-001-user-authentication/`)
- Stories: `STORY-XXX-nombre-descriptivo/` (ej: `STORY-005-login-page/`)
- Usar kebab-case en nombres de carpetas
- IDs numéricos o de Jira (UPEX-123)
