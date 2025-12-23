# Atlassian MCP (Jira + Confluence)

> **Tipo**: Project Management
> **Roles**: DEV, QA, TAE

---

## Cuándo Usar

- Sincronizar stories con Jira
- Crear issues automáticamente
- Leer requirements de Confluence
- Actualizar status de tickets
- Documentar tests en Jira

---

## Ejemplos de Uso

### Specification (Fase 4)

```
"Crea un issue en Jira para esta story"
"Lee los requirements del documento de Confluence ABC-123"
"¿Cuál es el status del ticket PROJ-456?"
```

### Test Documentation (Fase 11)

```
"Crea un Test issue vinculado a STORY-123"
"Actualiza el status de PROJ-456 a 'In Testing'"
"Agrega los test cases al ticket"
```

### Test Automation (Fase 12)

```
"Vincula el test automatizado al ticket de Jira"
"Actualiza el campo 'Automated' a Yes"
```

---

## NO Usar Para

- ❌ Tareas que puedes hacer directamente en Jira web
- ❌ Bulk operations (usa Jira API directamente)
- ❌ Reportes complejos (usa Jira dashboards)

---

## Flujo Jira-First

Este proyecto usa **Jira-First workflow**:

1. Crear issue en Jira → Obtener ID real
2. Crear carpeta local con ID real
3. Sincronizar documentación

Ver `.prompts/fase-4-specification/` para más detalles.

---

## Tips

1. **IDs reales**: Siempre usa el ID de Jira, nunca inventes
2. **Links bidireccionales**: Vincula Jira ↔ código/tests
3. **Status actualizado**: Mantén el status sync con la realidad

---

## Integración con QA

Ver `../QA/jira-test-management.md` para gestión de tests en Jira.

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js planning  # Incluye atlassian
node scripts/mcp-builder.js qa        # Incluye atlassian
```

---

**Última actualización**: 2025-12-21
