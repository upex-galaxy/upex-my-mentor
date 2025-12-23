# DEV - Development Guidelines

> **Para**: Desarrolladores de Software
> **Fases**: 7 (Implementation), 8 (Code Review)

---

## Propósito

Esta carpeta contiene los guidelines que todo desarrollador debe seguir al implementar código en el proyecto. Son **reglas constantes** que aplican siempre, independientemente de la tarea específica.

---

## Contenido

| Archivo                      | Propósito                                               |
| ---------------------------- | ------------------------------------------------------- |
| `code-standards.md`          | DRY, KISS, YAGNI, naming conventions, TypeScript strict |
| `error-handling.md`          | Custom errors, retry logic, logging estratégico         |
| `data-testid-standards.md`   | Cómo CREAR data-testid en componentes                   |
| `spec-driven-development.md` | Principio de desarrollo guiado por especificación       |

---

## Principio Central: Spec-Driven Development

El desarrollo en este proyecto sigue el principio de **Spec-Driven Development (SDD)**:

1. **Specification First**: Todo código nace de una especificación clara
2. **Plan Before Code**: Leer el implementation plan antes de codear
3. **Quality Built-In**: Seguir estándares desde el inicio, no después
4. **Test-Aware**: Implementar pensando en cómo se probará

Ver `spec-driven-development.md` para más detalles.

---

## Cuándo Leer Estos Guidelines

La IA DEBE leer estos guidelines **ANTES** de:

- Implementar cualquier feature
- Hacer code review
- Refactorizar código existente
- Corregir bugs

---

## Workflow de Desarrollo

Para el workflow detallado paso a paso, ver:

- `.prompts/us-dev-workflow.md` - Workflow completo de desarrollo
- `.prompts/fase-7-implementation/` - Prompts de implementación

---

**Última actualización**: 2025-12-21
