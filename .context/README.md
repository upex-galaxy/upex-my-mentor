# .context/ - Context Engineering Directory

Este directorio contiene toda la documentación que la IA lee para trabajar en el proyecto.

## 📂 Estructura

```
.context/
├── idea/           FASE 1: Constitution (negocio)
├── PRD/            FASE 2: Architecture - Product Requirements
├── SRS/            FASE 2: Architecture - Software Requirements
├── PBI/            FASES 3-5: Product Backlog (Specification, Testing, Planning)
└── guidelines/     FASES 6-7-8: Reference material para implementación
    └── tae/        FASE 8: Test Automation Engineering
```

## 🚀 Cómo empezar

**Fases Sincrónicas (una sola vez):**
1. **FASE 1**: Usa prompts de `.prompts/fase-1-constitution/` para generar archivos en `idea/`
2. **FASE 2**: Usa prompts de `.prompts/fase-2-architecture/` para generar archivos en `PRD/`, `SRS/`

**Fases Asincrónicas (iterativas por sprint):**
3. **FASE 3**: Usa prompts de `.prompts/fase-3-specification/` para generar archivos en `PBI/`
4. **FASE 4**: Usa prompts de `.prompts/fase-4-shift-left-testing/` para generar test plans en `PBI/`
5. **FASE 5**: Usa prompts de `.prompts/fase-5-planning/` para generar implementation plans en `PBI/`
6. **FASE 6**: Implementación (usa `guidelines/` como referencia, NO hay prompts)
7. **FASE 7**: Code Review (usa `guidelines/code-standards.md`, NO hay prompts)
8. **FASE 8**: Usa prompts de `.prompts/fase-8-test-automation/` para generar docs de testing en `guidelines/tae/`

## 📖 Referencias

- **Blueprint completo**: `docs/ai-driven-software-project-blueprint.md`
- **Instrucciones de prompts**: `.prompts/README.md`
