# GitHub MCP

> **Tipo**: Repository
> **Roles**: DEV, TAE

---

## Cuándo Usar

- Crear issues automáticamente
- Buscar PRs relacionadas
- Leer código de otros repos
- Verificar historial de commits
- Gestionar pull requests

---

## Ejemplos de Uso

### Specification (Fase 4)

```
"Crea un issue para implementar dark mode"
"¿Hay issues abiertos sobre autenticación?"
```

### Code Review (Fase 8)

```
"¿Hay PRs abiertos relacionados con auth?"
"Busca issues similares a este bug"
"¿Quién fue el último en modificar este archivo?"
```

### Research

```
"¿Cómo implementan X en el repo de Y?"
"Busca ejemplos de uso de esta biblioteca"
```

---

## NO Usar Para

- ❌ Operaciones que puedes hacer en GitHub web
- ❌ CI/CD management (usa GitHub Actions directamente)
- ❌ Gestión de secretos

---

## Tips

1. **Issues descriptivos**: Incluye contexto, pasos, expected behavior
2. **PRs atómicos**: Un PR = una feature/fix
3. **Referencias cruzadas**: Vincula issues ↔ PRs ↔ commits

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js dev       # Puede incluir github
node scripts/mcp-builder.js review    # Incluye github
```

---

**Última actualización**: 2025-12-21
