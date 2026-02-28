# Repository Management con GitHub MCP

Esta guia explica como configurar y usar el **GitHub MCP Server oficial** para gestion de repositorios, issues, PRs y workflows de CI/CD asistidos por IA.

---

## Que es GitHub MCP?

El **GitHub MCP Server** conecta herramientas de IA directamente con la plataforma de GitHub, permitiendo:

- Navegar y consultar codigo en repositorios
- Crear, actualizar y gestionar issues y PRs
- Monitorear workflows de GitHub Actions
- Analizar alertas de seguridad y Dependabot
- Automatizar tareas de desarrollo

**Caracteristicas clave:**

| Caracteristica             | Descripcion                                      |
| -------------------------- | ------------------------------------------------ |
| **Servidor Remoto**        | Hosted por GitHub, facil configuracion con OAuth |
| **Servidor Local**         | Control total con PAT, funciona offline          |
| **Toolsets configurables** | Habilita solo las funcionalidades que necesitas  |
| **GitHub Enterprise**      | Soporte para GHEC y GHES                         |

---

## Requisitos Previos

### Servidor Remoto (OAuth)

1. Un cliente MCP compatible (VS Code 1.101+, Claude, Cursor, etc.)
2. Cuenta de GitHub

### Servidor Local

1. Docker instalado (recomendado) o Go para compilar
2. [Personal Access Token (PAT)](https://github.com/settings/personal-access-tokens/new)

### Permisos Recomendados para PAT

```
- repo: Operaciones de repositorio
- read:packages: Acceso a Docker image
- read:org: Acceso a equipos de organizacion
```

---

## Configuracion por Herramienta

### Claude Code

**Servidor Remoto con OAuth (Recomendado):**

```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/"
  }
}
```

**Servidor Remoto con PAT:**

```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": {
      "Authorization": "Bearer ${GITHUB_TOKEN}"
    }
  }
}
```

**Servidor Local con Docker:**

```json
{
  "github": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "-e",
      "GITHUB_PERSONAL_ACCESS_TOKEN",
      "ghcr.io/github/github-mcp-server"
    ],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

### Codex CLI

```toml
[mcp_servers.github]
url = "https://api.githubcopilot.com/mcp"
bearer_token_env_var = "GITHUB_TOKEN"
```

### Gemini CLI

```json
{
  "github": {
    "httpUrl": "https://api.githubcopilot.com/mcp",
    "headers": {
      "Authorization": "Bearer ${GITHUB_TOKEN}"
    }
  }
}
```

### OpenCode

```json
{
  "github": {
    "type": "remote",
    "url": "https://api.githubcopilot.com/mcp",
    "oauth": false,
    "headers": {
      "Authorization": "Bearer {env:GITHUB_TOKEN}"
    },
    "enabled": true
  }
}
```

---

## Toolsets Disponibles

GitHub MCP organiza sus herramientas en toolsets que puedes habilitar segun necesidad:

### Toolsets por Defecto

| Toolset         | Descripcion                                    |
| --------------- | ---------------------------------------------- |
| `context`       | Info del usuario actual y contexto de GitHub   |
| `repos`         | Operaciones de repositorio (archivos, commits) |
| `issues`        | Gestion de issues                              |
| `pull_requests` | Gestion de pull requests                       |
| `users`         | Busqueda y info de usuarios                    |

### Toolsets Adicionales

| Toolset               | Descripcion                         |
| --------------------- | ----------------------------------- |
| `actions`             | Workflows y CI/CD de GitHub Actions |
| `code_security`       | Code Scanning alerts                |
| `dependabot`          | Alertas de Dependabot               |
| `discussions`         | GitHub Discussions                  |
| `gists`               | GitHub Gists                        |
| `git`                 | Operaciones Git de bajo nivel       |
| `labels`              | Gestion de etiquetas                |
| `notifications`       | Notificaciones                      |
| `orgs`                | Organizaciones                      |
| `projects`            | GitHub Projects                     |
| `secret_protection`   | Secret Scanning                     |
| `security_advisories` | Advisories de seguridad             |
| `stargazers`          | Stars de repositorios               |

### Toolsets Solo en Servidor Remoto

| Toolset                      | Descripcion                         |
| ---------------------------- | ----------------------------------- |
| `copilot`                    | GitHub Copilot Coding Agent         |
| `github_support_docs_search` | Buscar en docs de soporte de GitHub |

---

## Herramientas Principales

### Issues

| Herramienta         | Descripcion                         |
| ------------------- | ----------------------------------- |
| `issue_read`        | Obtener detalles de un issue        |
| `issue_write`       | Crear o actualizar issues           |
| `list_issues`       | Listar issues con filtros           |
| `search_issues`     | Buscar issues con sintaxis avanzada |
| `add_issue_comment` | Agregar comentario a un issue       |

### Pull Requests

| Herramienta            | Descripcion                         |
| ---------------------- | ----------------------------------- |
| `pull_request_read`    | Obtener detalles, diff, files, etc. |
| `create_pull_request`  | Crear nuevo PR                      |
| `update_pull_request`  | Actualizar PR existente             |
| `merge_pull_request`   | Mergear un PR                       |
| `list_pull_requests`   | Listar PRs con filtros              |
| `search_pull_requests` | Buscar PRs                          |

### Repositories

| Herramienta             | Descripcion                  |
| ----------------------- | ---------------------------- |
| `get_file_contents`     | Obtener contenido de archivo |
| `create_or_update_file` | Crear/actualizar archivo     |
| `push_files`            | Push multiples archivos      |
| `create_branch`         | Crear nueva rama             |
| `list_commits`          | Listar commits               |
| `search_code`           | Buscar codigo en repos       |

### Actions

| Herramienta          | Descripcion                    |
| -------------------- | ------------------------------ |
| `list_workflows`     | Listar workflows               |
| `list_workflow_runs` | Listar ejecuciones de workflow |
| `get_job_logs`       | Obtener logs de un job         |
| `run_workflow`       | Disparar un workflow           |
| `rerun_failed_jobs`  | Re-ejecutar jobs fallidos      |

---

## Casos de Uso para QA

### 1. Crear Issue de Bug

```
Usuario: "Crea un bug para el error de validacion en el formulario"

IA ejecutara:
issue_write({
  method: "create",
  owner: "org",
  repo: "project",
  title: "Bug: Error de validacion en formulario de registro",
  body: "## Descripcion\nEl formulario no valida correctamente...\n\n## Pasos para reproducir\n1. ...",
  labels: ["bug", "qa-found"]
})
```

### 2. Revisar PR de Feature

```
Usuario: "Revisa el PR #123 y dame un resumen de los cambios"

IA ejecutara:
1. pull_request_read({ method: "get", pullNumber: 123 })
2. pull_request_read({ method: "get_files", pullNumber: 123 })
3. pull_request_read({ method: "get_diff", pullNumber: 123 })
4. Analizar y reportar cambios relevantes para QA
```

### 3. Verificar CI/CD Status

```
Usuario: "El build esta fallando? Muestrame los logs"

IA ejecutara:
1. list_workflow_runs({ workflow_id: "ci.yml", status: "failure" })
2. get_job_logs({ run_id: run.id, failed_only: true, return_content: true })
3. Analizar errores y sugerir fixes
```

### 4. Buscar Issues Relacionados

```
Usuario: "Hay issues abiertos relacionados con autenticacion?"

IA ejecutara:
search_issues({
  query: "auth authentication login is:open is:issue",
  owner: "org",
  repo: "project"
})
```

### 5. Verificar Alertas de Seguridad

```
Usuario: "Hay alertas de Dependabot pendientes?"

IA ejecutara:
list_dependabot_alerts({
  owner: "org",
  repo: "project",
  state: "open"
})
```

---

## Flujos de Testing con IA

### Flujo 1: Test Coverage Check

```
Usuario: "Verifica si el PR #456 tiene tests"

IA:
1. pull_request_read({ method: "get_files", pullNumber: 456 })
2. Analizar archivos modificados
3. Buscar archivos .test.ts o .spec.ts correspondientes
4. Reportar coverage de tests para los cambios
```

### Flujo 2: Regression Analysis

```
Usuario: "Que PRs se mergearon esta semana que podrian causar regressions?"

IA:
1. search_pull_requests({
     query: "is:merged merged:>=2025-01-01",
     owner: "org",
     repo: "project"
   })
2. Para cada PR, analizar archivos criticos modificados
3. Crear lista de areas de riesgo para regression testing
```

### Flujo 3: Bug Triage

```
Usuario: "Prioriza los bugs abiertos"

IA:
1. list_issues({ state: "open", labels: ["bug"] })
2. Analizar severidad, antiguedad, asignacion
3. Crear reporte priorizado:
   - Critical: [issues]
   - High: [issues]
   - Medium: [issues]
```

---

## Configuracion de Toolsets

### Habilitar Toolsets Especificos

**Via headers (servidor remoto):**

```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/repos,issues,pull_requests,actions"
  }
}
```

**Via CLI (servidor local):**

```bash
./github-mcp-server --toolsets repos,issues,pull_requests,actions
```

**Via environment:**

```bash
export GITHUB_TOOLSETS="repos,issues,pull_requests,actions"
```

### Modo Solo Lectura

```bash
./github-mcp-server --read-only
```

---

## Integracion con Otros MCPs

### github + atlassian

```json
{
  "github": { "..." },
  "atlassian": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"]
  }
}
```

**Flujo combinado:**

```
Usuario: "Vincula el PR #123 al ticket JIRA-456"

IA:
1. [github] pull_request_read para obtener info del PR
2. [atlassian] jira_add_comment con link al PR
3. [atlassian] jira_transition_issue a "In Review"
```

### github + sentry

```json
{
  "github": { "..." },
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp/${SENTRY_PROJECT}/${SENTRY_LANG}"
  }
}
```

**Flujo combinado:**

```
Usuario: "Crea un issue para el error de Sentry SENTRY-123"

IA:
1. [sentry] Obtener detalles del error
2. [github] issue_write con stack trace y metadata de Sentry
3. [github] Agregar label "sentry-linked"
```

---

## Mejores Practicas

### 1. Busquedas Efectivas

```
# Issues abiertos con label bug
is:issue is:open label:bug

# PRs ready for review
is:pr is:open review:required

# Commits de un autor en la ultima semana
author:username committer-date:>2025-01-01
```

### 2. Estructura de Issues

```markdown
## Descripcion

[Descripcion clara del bug/feature]

## Pasos para Reproducir (bugs)

1. Paso 1
2. Paso 2

## Comportamiento Esperado

[Que deberia pasar]

## Comportamiento Actual

[Que pasa actualmente]

## Ambiente

- OS: [sistema operativo]
- Browser: [navegador y version]
- Version: [version de la app]
```

### 3. PR Reviews con IA

```
Usuario: "Revisa el PR #789 enfocandote en seguridad"

IA:
1. Obtener diff y files
2. Analizar patrones de seguridad:
   - Input validation
   - SQL injection
   - XSS
   - Auth/AuthZ
3. Reportar findings
```

---

## Troubleshooting

### Error: "Bad credentials"

```
Verificar:
1. PAT no ha expirado
2. PAT tiene los permisos necesarios
3. Token esta correctamente configurado en env
```

### Error: "Not found"

```
Verificar:
1. El repositorio existe y es accesible
2. El usuario tiene permisos de lectura
3. El owner/repo estan correctos
```

### Error: "Rate limit exceeded"

```
Solucion:
1. Los PAT tienen rate limits mas altos que sin auth
2. Esperar el reset del rate limit
3. Usar servidor remoto con OAuth para mejores limites
```

---

## Recursos Adicionales

- [GitHub MCP Server - GitHub](https://github.com/github/github-mcp-server)
- [Documentacion de Instalacion](https://github.com/github/github-mcp-server/tree/main/docs/installation-guides)
- [Configuracion de Servidor](https://github.com/github/github-mcp-server/blob/main/docs/server-configuration.md)
- [GitHub Search Syntax](https://docs.github.com/en/search-github/searching-on-github)

---

## Siguiente Paso

Para gestion de proyectos con Atlassian:
--> [mcp-atlassian.md](./mcp-atlassian.md)

Para monitoreo de errores:
--> [mcp-sentry.md](../observability/mcp-sentry.md)
