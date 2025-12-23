# .context/ - Context Engineering Directory

Este directorio contiene toda la documentación que la IA lee para trabajar en el proyecto.

## 📂 Estructura

```
.context/
├── system-prompt.md    # System prompt para copiar a claude.md/gemini.md
├── idea/               FASE 1: Constitution (negocio)
├── PRD/                FASE 2: Architecture - Product Requirements
├── SRS/                FASE 2: Architecture - Software Requirements
├── PBI/                FASES 4-6: Product Backlog (Specification, Testing, Planning)
└── guidelines/         FASES 7-14: Reference material por ROL
    ├── DEV/            Development Guidelines
    ├── QA/             Quality Engineering Guidelines
    ├── TAE/            Test Automation Engineering
    └── MCP/            MCP Guidelines (atomizado)
```

## 🚀 Cómo empezar

### System Prompt

Antes de empezar, configura tu IA:

1. Lee `system-prompt.md`
2. Copia su contenido a tu archivo de configuración:
   - Claude Code: `.claude/claude.md`
   - Gemini CLI: `.gemini/gemini.md`
   - GitHub Copilot: `.github/copilot-instructions.md`
   - Cursor: `.cursor/rules`

### Fases del Proyecto

**Fases Sincrónicas (una sola vez):**

1. **FASE 1**: Usa `.prompts/fase-1-constitution/` → genera `idea/`
2. **FASE 2**: Usa `.prompts/fase-2-architecture/` → genera `PRD/`, `SRS/`
3. **FASE 3**: Usa `.prompts/fase-3-infrastructure/` → setup técnico

**Fases Asincrónicas (iterativas por sprint):**

4. **FASE 4**: Usa `.prompts/fase-4-specification/` → genera `PBI/`
5. **FASE 5**: Usa `.prompts/fase-5-shift-left-testing/` → test cases en `PBI/`
6. **FASE 6**: Usa `.prompts/fase-6-planning/` → implementation plans en `PBI/`
7. **FASE 7**: Implementación - lee `guidelines/DEV/`
8. **FASE 8**: Code Review - lee `guidelines/DEV/`
9. **FASE 9-14**: Deployment, Testing, Automation - lee `guidelines/` por rol

## 📖 Guidelines por Rol

| Rol           | Carpeta           | Cuándo leer      |
| ------------- | ----------------- | ---------------- |
| Desarrollador | `guidelines/DEV/` | Fases 7, 8       |
| QA Engineer   | `guidelines/QA/`  | Fases 10, 11     |
| QA Automation | `guidelines/TAE/` | Fase 12          |
| Cualquier rol | `guidelines/MCP/` | Cuando uses MCPs |

## 📖 Referencias

- **System Prompt**: `system-prompt.md`
- **Blueprint completo**: `docs/ai-driven-software-project-blueprint.md`
- **Instrucciones de prompts**: `.prompts/README.md`

---

**Última actualización**: 2025-12-21
