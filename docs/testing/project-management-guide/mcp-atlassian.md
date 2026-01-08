# Project Management con Atlassian MCP

Esta guia explica como configurar y usar el **Atlassian Rovo MCP Server** para gestion de proyectos asistida por IA en proyectos que usan Jira y Confluence.

---

## Que es Atlassian MCP?

El **Atlassian Rovo MCP Server** es un puente basado en la nube entre tu sitio Atlassian Cloud y herramientas externas compatibles. Permite:

- Crear, actualizar y buscar issues en Jira
- Crear y editar paginas en Confluence
- Gestionar componentes en Compass
- Vincular contenido entre productos Atlassian
- Automatizar workflows de gestion de proyectos

**Caracteristicas clave:**

| Caracteristica          | Descripcion                                          |
| ----------------------- | ---------------------------------------------------- |
| **OAuth 2.1 Seguro**    | Todas las acciones respetan los controles de acceso  |
| **Multi-producto**      | Jira, Confluence y Compass en una sola conexion      |
| **Acciones combinadas** | Operaciones que cruzan multiples productos Atlassian |

---

## Requisitos Previos

### 1. Cuenta Atlassian Cloud

Necesitas acceso a un sitio Atlassian Cloud (Jira, Confluence o ambos).

### 2. API Token (para servidor local)

1. Ve a [Atlassian Account Settings](https://id.atlassian.com/manage/api-tokens)
2. Click en **Create API token**
3. Dale un nombre descriptivo (ej: "MCP Claude Code")
4. Copia el token (solo se muestra una vez)

### 3. Guardar credenciales

```bash
# En tu archivo .env
JIRA_URL=https://tu-servidor.atlassian.net
JIRA_USERNAME=tu.email@servidor.com
JIRA_API_TOKEN=tu-api-token
```

---

## Configuracion por Herramienta

### Claude Code

**Servidor Remoto con OAuth (Recomendado):**

```json
{
  "atlassian": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"]
  }
}
```

**Servidor Local (STDIO):**

```json
{
  "atlassian": {
    "command": "uvx",
    "args": ["mcp-atlassian"],
    "env": {
      "JIRA_URL": "https://tu-servidor.atlassian.net",
      "JIRA_USERNAME": "tu.email@servidor.com",
      "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
    }
  }
}
```

### Codex CLI

```toml
[mcp_servers.atlassian]
command = "npx"
args = ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"]
```

### Gemini CLI

```json
{
  "atlassian": {
    "command": "uvx",
    "args": ["mcp-atlassian"],
    "env": {
      "JIRA_URL": "https://tu-servidor.atlassian.net",
      "JIRA_USERNAME": "tu.email@servidor.com",
      "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
    }
  }
}
```

### OpenCode

```json
{
  "atlassian": {
    "type": "local",
    "command": ["uvx", "mcp-atlassian"],
    "environment": {
      "JIRA_URL": "{env:JIRA_URL}",
      "JIRA_USERNAME": "{env:JIRA_USERNAME}",
      "JIRA_API_TOKEN": "{env:JIRA_API_TOKEN}"
    },
    "enabled": true
  }
}
```

---

## Herramientas Disponibles

### Jira Tools

| Herramienta             | Descripcion                             |
| ----------------------- | --------------------------------------- |
| `jira_get_issue`        | Obtener detalles de un issue especifico |
| `jira_search`           | Buscar issues usando JQL                |
| `jira_create_issue`     | Crear un nuevo issue                    |
| `jira_update_issue`     | Actualizar un issue existente           |
| `jira_transition_issue` | Cambiar el estado de un issue           |
| `jira_add_comment`      | Agregar comentario a un issue           |
| `jira_get_worklog`      | Obtener registro de tiempo              |
| `jira_get_transitions`  | Obtener transiciones disponibles        |
| `jira_search_fields`    | Buscar campos de Jira                   |
| `jira_get_agile_boards` | Listar tableros agiles                  |
| `jira_get_board_issues` | Obtener issues de un tablero            |
| `jira_get_sprints`      | Obtener sprints de un tablero           |

### Confluence Tools

| Herramienta                    | Descripcion                       |
| ------------------------------ | --------------------------------- |
| `confluence_search`            | Buscar contenido con CQL          |
| `confluence_get_page`          | Obtener contenido de una pagina   |
| `confluence_create_page`       | Crear una nueva pagina            |
| `confluence_update_page`       | Actualizar una pagina existente   |
| `confluence_add_comment`       | Agregar comentario a una pagina   |
| `confluence_get_page_children` | Obtener paginas hijas             |
| `confluence_get_comments`      | Obtener comentarios de una pagina |
| `confluence_get_labels`        | Obtener etiquetas de una pagina   |

### Compass Tools (Servidor Remoto)

| Herramienta               | Descripcion                       |
| ------------------------- | --------------------------------- |
| `createCompassComponent`  | Crear componente de servicio      |
| `getCompassComponent`     | Obtener detalles de un componente |
| `searchCompassComponents` | Buscar componentes                |

---

## Casos de Uso para QA

### 1. Sincronizar Test Cases con Jira

```
Usuario: "Crea un Test issue vinculado a STORY-123 con los test cases del login"

IA ejecutara:
1. jira_get_issue("STORY-123") -> obtener contexto de la story
2. jira_create_issue({
     project: "TEST",
     type: "Test",
     summary: "Test Cases - Login Flow",
     description: "Test cases para verificar el flujo de login...",
     links: [{ type: "tests", key: "STORY-123" }]
   })
```

### 2. Documentar Resultados de Testing

```
Usuario: "Documenta los resultados del smoke test en Confluence"

IA ejecutara:
1. confluence_create_page({
     space: "QA",
     title: "Smoke Test Results - 2025-01-07",
     parent: "Test Reports",
     body: "## Resumen\n- Tests ejecutados: 25\n- Passed: 23\n- Failed: 2\n\n## Detalles..."
   })
2. jira_add_comment("SPRINT-456", "Resultados de smoke test documentados: [link]")
```

### 3. Actualizar Status de Testing

```
Usuario: "Actualiza el ticket PROJ-789 a 'In Testing' y agrega comentario"

IA ejecutara:
1. jira_get_transitions("PROJ-789") -> obtener transiciones disponibles
2. jira_transition_issue("PROJ-789", "In Testing")
3. jira_add_comment("PROJ-789", "Iniciando pruebas de QA. ETA: 2 dias.")
```

### 4. Buscar Bugs Relacionados

```
Usuario: "Busca todos los bugs abiertos relacionados con autenticacion"

IA ejecutara:
jira_search({
  jql: "project = PROJ AND type = Bug AND status != Done AND text ~ 'auth*' ORDER BY priority DESC"
})
```

### 5. Crear Bug desde Error Detectado

```
Usuario: "Crea un bug para el error de validacion en el formulario de registro"

IA ejecutara:
jira_create_issue({
  project: "PROJ",
  type: "Bug",
  summary: "Error de validacion en formulario de registro",
  description: "## Pasos para reproducir\n1. Ir a /register\n2. Ingresar email invalido\n3. Hacer click en Submit\n\n## Resultado esperado\nMostrar mensaje de error\n\n## Resultado actual\nNo se muestra mensaje, el formulario se envia",
  priority: "High",
  labels: ["qa-found", "regression"]
})
```

---

## Flujos de Testing con IA

### Flujo 1: Preparacion de Sprint

```
Usuario: "Prepara el testing para el sprint 15"

IA:
1. jira_search({ jql: "sprint = 'Sprint 15' AND type = Story" })
2. Para cada story:
   - Crear Test issue vinculado
   - Agregar test cases basados en acceptance criteria
3. confluence_create_page({
     title: "Test Plan - Sprint 15",
     body: "## Scope\n[stories]...\n## Test Cases\n[test cases]..."
   })
4. Reportar: "Creados X test issues y documentado plan en Confluence"
```

### Flujo 2: Reporte de Regression

```
Usuario: "Genera reporte de regression testing"

IA:
1. jira_search({ jql: "type = Bug AND labels = regression AND created >= -7d" })
2. Analizar bugs encontrados
3. confluence_update_page({
     id: "regression-report-page-id",
     body: "## Regression Report - Week X\n### Bugs Found: Y\n..."
   })
```

---

## Integracion con Otros MCPs

### atlassian + sentry

```json
{
  "atlassian": { "..." },
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp/${SENTRY_PROJECT}/${SENTRY_LANG}"
  }
}
```

**Flujo combinado:**

```
Usuario: "Crea un bug en Jira para el error SENTRY-123"

IA:
1. [sentry] Obtener detalles del error
2. [atlassian] jira_create_issue({
     type: "Bug",
     summary: "Error: " + sentry_error.title,
     description: "## Stack Trace\n" + sentry_error.stacktrace + "\n## Affected Users: " + sentry_error.users_affected
   })
```

### atlassian + github

```json
{
  "atlassian": { "..." },
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp",
    "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
  }
}
```

**Flujo combinado:**

```
Usuario: "Vincula el PR #123 al ticket PROJ-456"

IA:
1. [github] Obtener detalles del PR
2. [atlassian] jira_add_comment("PROJ-456", "PR creado: [link to PR]\nCambios: ...")
3. [atlassian] jira_transition_issue("PROJ-456", "Code Review")
```

---

## Mejores Practicas

### 1. Usar JQL Efectivo

```
# Bugs abiertos de alta prioridad
type = Bug AND status != Done AND priority in (High, Critical)

# Issues sin asignar en el sprint actual
sprint in openSprints() AND assignee is EMPTY

# Test issues sin ejecutar
type = Test AND "Test Status" = "Not Run"
```

### 2. Estructura de Test Issues

```
Titulo: [Feature] - [Escenario] - [Tipo de Test]
Ejemplo: "Login - Valid Credentials - Happy Path"

Descripcion:
## Precondiciones
- Usuario registrado existe

## Pasos
1. Navegar a /login
2. Ingresar email valido
3. Ingresar password correcto
4. Click en Login

## Resultado Esperado
- Redirect a /dashboard
- Session cookie creada

## Datos de Prueba
- Email: test@example.com
- Password: Test123!
```

### 3. Documentacion en Confluence

```
Estructura recomendada:
QA Space/
├── Test Plans/
│   ├── Sprint X Test Plan
│   └── Release Y Test Plan
├── Test Reports/
│   ├── Daily Reports/
│   └── Sprint Reports/
├── Test Cases/
│   ├── Feature A/
│   └── Feature B/
└── Bug Reports/
    └── Regression Reports/
```

---

## Troubleshooting

### Error: "Authentication failed"

```
Verificar:
1. API token no ha expirado
2. Email y URL son correctos
3. Usuario tiene permisos en el proyecto
```

### Error: "Issue not found"

```
Verificar:
1. El issue key existe (ej: PROJ-123)
2. Usuario tiene acceso al proyecto
3. El proyecto no fue archivado
```

### Error: "Transition not allowed"

```
Verificar:
1. Usar jira_get_transitions para ver transiciones validas
2. El issue esta en un estado que permite la transicion
3. Usuario tiene permisos para la transicion
```

---

## Recursos Adicionales

- [Atlassian Rovo MCP Server - Docs Oficiales](https://support.atlassian.com/atlassian-rovo-mcp-server/)
- [MCP Atlassian - PyPI](https://pypi.org/project/mcp-atlassian/)
- [MCP Atlassian - GitHub](https://github.com/sooperset/mcp-atlassian)
- [JQL Syntax Reference](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jql/)

---

## Siguiente Paso

Para testing con GitHub:
--> [mcp-github.md](./mcp-github.md)

Para monitoreo de errores:
--> [mcp-sentry.md](../monitoring-guide/mcp-sentry.md)
