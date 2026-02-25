# Project Management Testing con MCPs

Esta carpeta contiene guias para integrar herramientas de **gestion de proyectos** en tu flujo de testing usando MCPs (Model Context Protocol).

## Para quien es esto?

QA Engineers y Test Automation Engineers que quieren:

- Sincronizar test cases con tickets de Jira
- Crear bugs automaticamente desde errores detectados
- Vincular PRs con issues de testing
- Documentar resultados de testing en Confluence
- Automatizar workflows de QA en GitHub

---

## Documentos

| Archivo                                | Descripcion                                       |
| -------------------------------------- | ------------------------------------------------- |
| [mcp-atlassian.md](./mcp-atlassian.md) | Jira + Confluence para gestion de testing         |
| [mcp-github.md](./mcp-github.md)       | GitHub Issues, PRs y Actions para desarrollo y QA |

---

## MCPs Utilizados

| MCP         | Conexion                              | Proposito                           |
| ----------- | ------------------------------------- | ----------------------------------- |
| `atlassian` | `mcp.atlassian.com` o `mcp-atlassian` | Jira issues, Confluence pages       |
| `github`    | `api.githubcopilot.com/mcp`           | Issues, PRs, Actions, Code Security |

---

## Casos de Uso Comunes

### QA Workflow

1. **Crear Test Issues en Jira** vinculados a stories
2. **Documentar Test Plans** en Confluence
3. **Actualizar status** de tickets durante testing
4. **Crear bugs** automaticamente cuando se detectan errores

### Dev Workflow

1. **Revisar PRs** con asistencia de IA
2. **Verificar CI/CD status** de workflows
3. **Buscar issues relacionados** para evitar duplicados
4. **Vincular PRs con tickets** de Jira

---

## Configuracion Basica

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"]
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

## Orden de Lectura Recomendado

1. **Si usas Jira/Confluence** → [mcp-atlassian.md](./mcp-atlassian.md)
2. **Si usas GitHub Issues/PRs** → [mcp-github.md](./mcp-github.md)
3. **Si usas ambos** → Lee ambos y ve las secciones de integracion

---

## Ver Tambien

- [Observability Guide](../observability/README.md) - Sentry y Slack para alertas
- [Database Guide](../database/README.md) - Testing de base de datos
- [API Guide](../api/README.md) - Testing de APIs
