# Team Communication con Slack MCP

Esta guia explica como configurar y usar el **Slack MCP Server** para comunicacion y notificaciones automatizadas asistidas por IA.

---

## Que es Slack MCP?

El **Slack MCP Server** conecta herramientas de IA con tu workspace de Slack, permitiendo:

- Leer mensajes y conversaciones
- Enviar mensajes y notificaciones
- Gestionar reacciones con emoji
- Listar canales y usuarios
- Buscar contenido en el workspace

**Caracteristicas clave:**

| Caracteristica  | Descripcion                                        |
| --------------- | -------------------------------------------------- |
| **User Token**  | Opera como tu usuario, accede a tus conversaciones |
| **Multi-canal** | Acceso a canales publicos, privados y DMs          |
| **Threads**     | Soporte para conversaciones en hilos               |
| **Real-time**   | Lectura de mensajes en tiempo real                 |

---

## Requisitos Previos

### 1. Crear Slack App

1. Ve a [Slack API Apps](https://api.slack.com/apps)
2. Click en **Create New App** > **From scratch**
3. Nombra tu app (ej: "Claude MCP Integration")
4. Selecciona tu workspace

### 2. Configurar Permisos (OAuth Scopes)

En **OAuth & Permissions**, agrega estos User Token Scopes:

```
channels:history    - Leer mensajes de canales
channels:read       - Listar canales
groups:history      - Leer mensajes de canales privados
groups:read         - Listar canales privados
im:history          - Leer DMs
im:read             - Listar DMs
mpim:history        - Leer group DMs
mpim:read           - Listar group DMs
users:read          - Listar usuarios
search:read         - Buscar mensajes
chat:write          - Enviar mensajes
reactions:write     - Agregar reacciones
```

### 3. Instalar App y Obtener Token

1. Click en **Install to Workspace**
2. Autoriza la app
3. Copia el **User OAuth Token** (comienza con `xoxp-`)

### 4. Guardar Token

```bash
# En tu archivo .env
SLACK_MCP_XOXP_TOKEN=xoxp-your-token-here
```

---

## Configuracion por Herramienta

### Claude Code

```json
{
  "slack": {
    "command": "npx",
    "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
    "env": {
      "SLACK_MCP_XOXP_TOKEN": "${SLACK_MCP_XOXP_TOKEN}",
      "SLACK_MCP_ADD_MESSAGE_TOOL": "true",
      "SLACK_MCP_USERS_CACHE": "/context/mcp/outputs/slack/",
      "SLACK_MCP_CHANNELS_CACHE": "/context/mcp/outputs/slack/"
    }
  }
}
```

### Codex CLI

```toml
[mcp_servers.slack]
command = "npx"
args = ["-y", "slack-mcp-server@latest", "--transport", "stdio"]

[mcp_servers.slack.env]
SLACK_MCP_XOXP_TOKEN = "${SLACK_MCP_XOXP_TOKEN}"
SLACK_MCP_ADD_MESSAGE_TOOL = "true"
SLACK_MCP_USERS_CACHE = "$HOME/.codex/mcp-cache/slack/"
SLACK_MCP_CHANNELS_CACHE = "$HOME/.codex/mcp-cache/slack/"
```

### Gemini CLI

```json
{
  "slack": {
    "command": "npx",
    "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
    "env": {
      "SLACK_MCP_XOXP_TOKEN": "${SLACK_MCP_XOXP_TOKEN}",
      "SLACK_MCP_ADD_MESSAGE_TOOL": "true",
      "SLACK_MCP_USERS_CACHE": "~/.gemini/mcp/slack/",
      "SLACK_MCP_CHANNELS_CACHE": "~/.gemini/mcp/slack/"
    }
  }
}
```

### OpenCode

```json
{
  "slack": {
    "type": "local",
    "command": ["npx", "-y", "slack-mcp-server@latest", "--transport", "stdio"],
    "environment": {
      "SLACK_MCP_XOXP_TOKEN": "{env:SLACK_MCP_XOXP_TOKEN}",
      "SLACK_MCP_ADD_MESSAGE_TOOL": "true",
      "SLACK_MCP_USERS_CACHE": "{env:SLACK_MCP_USERS_CACHE}",
      "SLACK_MCP_CHANNELS_CACHE": "{env:SLACK_MCP_CHANNELS_CACHE}"
    },
    "enabled": true
  }
}
```

---

## Herramientas Disponibles

### Reading Tools

| Herramienta           | Descripcion                               |
| --------------------- | ----------------------------------------- |
| `list_conversations`  | Listar canales y DMs con acceso           |
| `list_users`          | Listar usuarios del workspace             |
| `get_channel_history` | Obtener historial de mensajes de un canal |
| `get_thread_replies`  | Obtener respuestas de un hilo             |
| `search_messages`     | Buscar mensajes en el workspace           |

### Writing Tools

| Herramienta       | Descripcion                         |
| ----------------- | ----------------------------------- |
| `send_message`    | Enviar mensaje a un canal o usuario |
| `reply_to_thread` | Responder en un hilo                |
| `add_reaction`    | Agregar reaccion emoji a un mensaje |

---

## Casos de Uso para QA

### 1. Notificar Resultados de Tests

```
Usuario: "Envía reporte de test results al canal #qa"

IA ejecutara:
send_message({
  channel: "#qa",
  text: "📊 *Test Results - 2025-01-07*\n\n✅ Passed: 45\n❌ Failed: 3\n⏭️ Skipped: 2\n\n*Failed Tests:*\n- `test_login_invalid_email`\n- `test_checkout_empty_cart`\n- `test_api_timeout`\n\nDetails: [link to report]"
})
```

### 2. Alertar sobre Errores Criticos

```
Usuario: "Alerta al equipo sobre el error critico en produccion"

IA ejecutara:
send_message({
  channel: "#alerts",
  text: "🚨 *CRITICAL ERROR DETECTED*\n\nError: `TypeError: Cannot read property 'id' of undefined`\nEndpoint: `/api/users`\nAffected: 150 users\nSentry: [link]\n\ncc: @oncall-engineer"
})
```

### 3. Resumir Discusion de Bug

```
Usuario: "Resume la discusion del bug en #engineering"

IA ejecutara:
1. search_messages({ query: "bug authentication in:#engineering" })
2. get_thread_replies para hilos relevantes
3. Generar resumen:
   "Resumen de discusion:
   - El bug fue reportado por @john hace 2 dias
   - Causa identificada: race condition en auth service
   - Fix propuesto por @sarah en PR #123
   - Pendiente: review y merge"
```

### 4. Coordinar Regression Testing

```
Usuario: "Notifica que vamos a empezar regression testing"

IA ejecutara:
send_message({
  channel: "#qa",
  text: "🧪 *Regression Testing Iniciado*\n\nVersion: v2.3.0\nEnvironment: staging\nETA: 2 horas\n\nPor favor no hacer deploys a staging hasta que termine.\n\nProgress updates en este thread 👇"
})
```

### 5. Post-Deploy Check

```
Usuario: "Confirma que el deploy fue exitoso en #deploys"

IA ejecutara:
send_message({
  channel: "#deploys",
  text: "✅ *Deploy Successful*\n\nVersion: v2.3.0\nEnvironment: production\nTime: 14:30 UTC\n\n*Post-deploy checks:*\n- Health endpoints: ✅\n- E2E smoke tests: ✅\n- Error rate: Normal\n\nMonitoreando por 30 min..."
})
```

---

## Flujos de Comunicacion con IA

### Flujo 1: Daily QA Standup

```
Usuario: "Genera y envia el daily QA update"

IA:
1. Recopilar datos:
   - Tests ejecutados hoy
   - Bugs encontrados
   - Bloqueadores
2. send_message({
     channel: "#qa-standup",
     text: formatDailyUpdate(data)
   })
```

### Flujo 2: Release Communication

```
Usuario: "Comunica el release de v2.4.0"

IA:
1. Obtener release notes
2. send_message a #announcements:
   "🚀 *Release v2.4.0*\n\n*New Features:*\n- Feature A\n- Feature B\n\n*Bug Fixes:*\n- Fix X\n- Fix Y\n\nRelease notes: [link]"
3. send_message a #engineering:
   "Deploy completo. Monitoreando..."
```

### Flujo 3: Bug Escalation

```
Usuario: "Escala el bug critico al canal de on-call"

IA:
1. Recopilar detalles del bug
2. send_message({
     channel: "#oncall",
     text: "🔴 *Escalation Required*\n\nBug: Auth service returning 500\nImpact: All logins failing\nStarted: 10 mins ago\n\n@oncall-primary @oncall-secondary"
   })
```

---

## Integracion con Otros MCPs

### slack + sentry

```json
{
  "slack": { "..." },
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp/${SENTRY_PROJECT}/${SENTRY_LANG}"
  }
}
```

**Flujo combinado:**

```
Usuario: "Notifica al equipo sobre los errores nuevos de Sentry"

IA:
1. [sentry] Obtener errores de las ultimas 2 horas
2. [slack] send_message({
     channel: "#engineering",
     text: "⚠️ Nuevos errores detectados:\n" + formatErrors(errors)
   })
```

### slack + github

```json
{
  "slack": { "..." },
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
  }
}
```

**Flujo combinado:**

```
Usuario: "Notifica en Slack cuando se apruebe un PR"

IA:
1. [github] Verificar estado del PR
2. Si aprobado:
   [slack] send_message({
     channel: "#engineering",
     text: "✅ PR #123 aprobado y listo para merge\nTitulo: Add user authentication\nReviewer: @john"
   })
```

### slack + atlassian

```json
{
  "slack": { "..." },
  "atlassian": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"]
  }
}
```

**Flujo combinado:**

```
Usuario: "Resumen del sprint en Slack"

IA:
1. [atlassian] Obtener issues del sprint
2. Calcular:
   - Stories completadas
   - Bugs abiertos
   - Velocity
3. [slack] send_message al canal del equipo
```

---

## Canales Recomendados

| Canal          | Proposito                | Ejemplo de Mensaje          |
| -------------- | ------------------------ | --------------------------- |
| `#engineering` | Updates de desarrollo    | PR merged, feature complete |
| `#qa`          | Reportes de testing      | Test results, bugs found    |
| `#deploys`     | Notificaciones de deploy | Deploy started/completed    |
| `#alerts`      | Errores criticos         | Production errors, outages  |
| `#oncall`      | Escalaciones urgentes    | Critical bugs, incidents    |
| `#standup`     | Updates diarios          | Daily progress, blockers    |

---

## Mejores Practicas

### 1. Formato de Mensajes

```markdown
# Usar Slack markdown

_bold_ for emphasis
`code` for technical terms

> quotes for context

- bullet points for lists

# Incluir emojis para visual scanning

✅ Success
❌ Failure
⚠️ Warning
🚀 Release
🧪 Testing
🔴 Critical
```

### 2. Mensajes Actionables

```
# Mal
"Hay errores en produccion"

# Bien
"🔴 3 errores criticos detectados
- TypeError en /api/users (150 users affected)
- NetworkError en /checkout (50 users affected)

Action needed: @oncall investigate
Dashboard: [link]"
```

### 3. Threading para Contexto

```
# Mensaje principal en canal
"🧪 Regression Testing Started - v2.3.0"

# Updates en thread
"✅ Auth tests passed (15/15)"
"✅ API tests passed (32/32)"
"❌ UI tests: 2 failures (28/30)"
```

---

## Troubleshooting

### Error: "Invalid token"

```
Verificar:
1. Token comienza con xoxp- (User token)
2. Token no ha sido revocado
3. App sigue instalada en el workspace
```

### Error: "Channel not found"

```
Verificar:
1. Nombre del canal es correcto (con o sin #)
2. El usuario tiene acceso al canal
3. Para canales privados, el usuario debe ser miembro
```

### Error: "Missing scope"

```
Solucion:
1. Ir a Slack API > Your App > OAuth & Permissions
2. Agregar el scope faltante
3. Reinstalar la app en el workspace
4. Obtener nuevo token
```

---

## Recursos Adicionales

- [Slack MCP Server - GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)
- [Slack API Documentation](https://api.slack.com/docs)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [Slack Formatting Guide](https://api.slack.com/reference/surfaces/formatting)

---

## Siguiente Paso

Para monitoreo de errores:
--> [mcp-sentry.md](./mcp-sentry.md)

Para busquedas web:
--> [mcp-tavily.md](../research/mcp-tavily.md)
