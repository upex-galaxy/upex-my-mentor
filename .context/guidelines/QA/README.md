# QA - Quality Engineering Guidelines

> **Para**: QA Engineers (Testing Manual/Exploratorio)
> **Fases**: 10 (Exploratory Testing), 11 (Test Documentation)

---

## Propósito

Esta carpeta contiene los guidelines para **Quality Engineering general**, enfocado en:

- Testing Exploratorio
- Gestión de pruebas en Jira
- Reporte de bugs
- Documentación de tests

**Nota**: Para Test Automation, ver la carpeta `TAE/`.

---

## QA vs TAE

| Aspecto          | QA (esta carpeta)        | TAE                        |
| ---------------- | ------------------------ | -------------------------- |
| **Enfoque**      | Testing Manual           | Testing Automatizado       |
| **Fases**        | 10, 11                   | 12                         |
| **Actividades**  | Exploratorio, bugs, docs | E2E, Integration, CI/CD    |
| **Herramientas** | Jira, browser manual     | Playwright, KATA framework |

---

## Contenido

| Archivo                   | Propósito                                      |
| ------------------------- | ---------------------------------------------- |
| `exploratory-testing.md`  | Principios de testing exploratorio             |
| `jira-test-management.md` | Gestión de tests en Jira                       |
| `spec-driven-testing.md`  | Principio de testing guiado por especificación |

**Nota**: Para uso de `data-testid` en automatización, ver `TAE/data-testid-usage.md`.

---

## Principio Central: Spec-Driven Testing

El testing en este proyecto sigue el principio de **Spec-Driven Testing**:

1. **Test from Specs**: Todo test nace de una especificación
2. **User Story = Test Source**: La story define qué probar
3. **AC = Test Criteria**: Los acceptance criteria son los criterios de prueba
4. **Traceability**: Cada test mapea a una especificación

---

## Cuándo Leer Estos Guidelines

La IA DEBE leer estos guidelines **ANTES** de:

- Realizar testing exploratorio
- Reportar bugs
- Documentar tests en Jira
- Priorizar tests para automatización

---

## Workflow de QA

Para el workflow detallado paso a paso, ver:

- `.prompts/us-qa-workflow.md` - Workflow completo de QA
- `.prompts/fase-10-exploratory-testing/` - Prompts de testing exploratorio
- `.prompts/fase-11-test-documentation/` - Prompts de documentación

---

**Última actualización**: 2025-12-21
