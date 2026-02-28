# Monitoring y Communication Testing con MCPs

Esta carpeta contiene guias para integrar herramientas de **monitoreo de errores** y **comunicacion** en tu flujo de testing usando MCPs (Model Context Protocol).

## Para quien es esto?

QA Engineers y Test Automation Engineers que quieren:

- Investigar errores de produccion para crear test cases
- Priorizar bugs basado en impacto real
- Notificar al equipo sobre resultados de testing
- Automatizar alertas de errores criticos
- Verificar el estado post-deploy

---

## Documentos

| Archivo                          | Descripcion                             |
| -------------------------------- | --------------------------------------- |
| [mcp-sentry.md](./mcp-sentry.md) | Monitoreo de errores y debugging        |
| [mcp-slack.md](./mcp-slack.md)   | Notificaciones y comunicacion de equipo |

---

## MCPs Utilizados

| MCP      | Conexion                                  | Proposito                            |
| -------- | ----------------------------------------- | ------------------------------------ |
| `sentry` | `mcp.sentry.dev/mcp/{project}/{language}` | Ver errores, stack traces, impacto   |
| `slack`  | `slack-mcp-server` (local)                | Enviar mensajes, leer conversaciones |

---

## Casos de Uso Comunes

### Error Investigation

1. **Ver errores de produccion** para entender que falla
2. **Analizar stack traces** para reproducir bugs
3. **Crear test cases** basados en errores reales
4. **Verificar post-deploy** si los errores se resolvieron

### Team Communication

1. **Notificar resultados de tests** al canal de QA
2. **Alertar sobre errores criticos** al equipo de on-call
3. **Resumir discusiones** de bugs para nuevos miembros
4. **Coordinar regression testing** antes de releases

---

## Configuracion Basica

```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp/my-project/javascript"
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      "env": {
        "SLACK_MCP_XOXP_TOKEN": "${SLACK_MCP_XOXP_TOKEN}"
      }
    }
  }
}
```

---

## Flujo Tipico de QA

```
1. [Sentry] Detectar error en produccion
     ↓
2. [Sentry] Analizar stack trace y usuarios afectados
     ↓
3. [Slack] Notificar al equipo sobre el error critico
     ↓
4. [QA] Crear test case para reproducir el error
     ↓
5. [Dev] Fix el bug
     ↓
6. [Sentry] Verificar que el error no ocurre post-deploy
     ↓
7. [Slack] Notificar que el fix fue exitoso
```

---

## Orden de Lectura Recomendado

1. **Para investigar errores** → [mcp-sentry.md](./mcp-sentry.md)
2. **Para comunicacion del equipo** → [mcp-slack.md](./mcp-slack.md)

---

## Ver Tambien

- [Project Management Guide](../project-management-guide/README.md) - Jira y GitHub
- [Database Guide](../database-guide/README.md) - Testing de base de datos
- [API Guide](../api-guide/README.md) - Testing de APIs
