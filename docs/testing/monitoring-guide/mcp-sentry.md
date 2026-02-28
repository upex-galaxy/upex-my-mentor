# Error Monitoring con Sentry MCP

Esta guia explica como configurar y usar el **Sentry MCP Server** para monitoreo de errores y debugging asistido por IA en proyectos de produccion.

---

## Que es Sentry MCP?

El **Sentry MCP Server** proporciona a los sistemas de IA acceso completo al contexto de issues y errores de Sentry. Permite:

- Investigar errores en produccion en tiempo real
- Analizar stack traces y frecuencia de errores
- Crear tests para reproducir errores
- Monitorear performance issues
- Priorizar fixes basado en impacto

**Caracteristicas clave:**

| Caracteristica             | Descripcion                          |
| -------------------------- | ------------------------------------ |
| **Acceso en tiempo real**  | Ver errores conforme ocurren         |
| **Stack traces completos** | Contexto detallado de cada error     |
| **Impacto de usuarios**    | Ver cuantos usuarios estan afectados |
| **Integracion CI/CD**      | Detectar errores post-deploy         |

---

## Requisitos Previos

### 1. Cuenta de Sentry

Necesitas un proyecto configurado en [Sentry.io](https://sentry.io).

### 2. Informacion del Proyecto

- **Project name**: El slug de tu proyecto en Sentry
- **Language**: El lenguaje principal del proyecto (javascript, python, etc.)

---

## Configuracion por Herramienta

### Claude Code

**Servidor Remoto:**

```json
{
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp/${SENTRY_PROJECT_NAME}/${SENTRY_PROJECT_LANGUAGE}"
  }
}
```

**Ejemplo con valores:**

```json
{
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp/my-nextjs-app/javascript"
  }
}
```

### Codex CLI

```toml
[mcp_servers.sentry]
url = "https://mcp.sentry.dev/mcp/${SENTRY_PROJECT_NAME}/${SENTRY_PROJECT_LANGUAGE}"
```

### Gemini CLI

```json
{
  "sentry": {
    "httpUrl": "https://mcp.sentry.dev/mcp/${SENTRY_PROJECT_NAME}/${SENTRY_PROJECT_LANGUAGE}"
  }
}
```

### OpenCode

```json
{
  "sentry": {
    "type": "remote",
    "url": "https://mcp.sentry.dev/mcp/{env:SENTRY_PROJECT_NAME}/{env:SENTRY_PROJECT_LANGUAGE}",
    "enabled": true
  }
}
```

### Variables de Entorno

```bash
# En tu archivo .env
SENTRY_PROJECT_NAME=my-project-slug
SENTRY_PROJECT_LANGUAGE=javascript
```

**Lenguajes soportados:**

- `javascript` / `typescript`
- `python`
- `java`
- `go`
- `ruby`
- `php`
- `csharp`
- `rust`

---

## Casos de Uso para QA

### 1. Investigar Errores en Produccion

```
Usuario: "Que errores se estan reportando en produccion?"

IA ejecutara:
1. Consultar issues recientes de Sentry
2. Agrupar por tipo de error
3. Mostrar:
   - Top 5 errores mas frecuentes
   - Usuarios afectados
   - Primera/ultima ocurrencia
```

### 2. Analizar Error Especifico

```
Usuario: "Dame el stack trace del error SENTRY-ABC123"

IA ejecutara:
1. Obtener issue por ID
2. Mostrar:
   - Mensaje de error completo
   - Stack trace formateado
   - Contexto (browser, OS, version)
   - Variables de entorno relevantes
```

### 3. Verificar Post-Deploy

```
Usuario: "Hay nuevos errores despues del deploy de ayer?"

IA ejecutara:
1. Filtrar issues por fecha (ultimas 24h)
2. Identificar errores nuevos vs recurrentes
3. Analizar si estan relacionados con cambios recientes
```

### 4. Crear Test para Reproducir Error

````
Usuario: "Crea un test case para el error SENTRY-XYZ"

IA ejecutara:
1. Obtener detalles del error:
   - Endpoint afectado
   - Parametros que causaron el error
   - Condiciones de la falla
2. Generar test que reproduzca el escenario:
   ```typescript
   test('should handle invalid input gracefully', async () => {
     // Basado en error SENTRY-XYZ
     const response = await api.post('/endpoint', { invalid: 'data' });
     expect(response.status).not.toBe(500);
   });
````

```

### 5. Priorizar Bugs

```

Usuario: "Que errores debemos arreglar primero?"

IA ejecutara:

1. Obtener todos los errores abiertos
2. Calcular prioridad basado en:
   - Frecuencia de ocurrencia
   - Numero de usuarios afectados
   - Severidad del error
3. Crear lista priorizada

```

---

## Flujos de Testing con IA

### Flujo 1: Regression Testing Post-Deploy

```

Usuario: "Verifica si el deploy causo regressions"

IA:

1. Obtener baseline de errores pre-deploy
2. Comparar con errores post-deploy
3. Identificar:
   - Errores nuevos
   - Errores que aumentaron en frecuencia
   - Errores que afectan mas usuarios
4. Generar reporte de regression

```

### Flujo 2: Test Coverage para Errores

```

Usuario: "Tenemos tests para los errores mas frecuentes?"

IA:

1. [sentry] Obtener top 10 errores
2. Para cada error:
   - Identificar componente/funcion afectada
   - Buscar tests existentes para esa area
3. Crear plan de test coverage para gaps

```

### Flujo 3: Error Monitoring Continuo

```

Usuario: "Moniterea errores del checkout y alertame"

IA:

1. Configurar filtro para errores de "/checkout"
2. Cada X minutos:
   - Verificar nuevos errores
   - Analizar severity
3. Si hay errores criticos:
   - Notificar con detalles
   - Sugerir acciones inmediatas

````

---

## Integracion con Otros MCPs

### sentry + github

```json
{
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp/${SENTRY_PROJECT}/${SENTRY_LANG}"
  },
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
  }
}
````

**Flujo combinado:**

```
Usuario: "Crea un issue en GitHub para el error SENTRY-123"

IA:
1. [sentry] Obtener detalles completos del error
2. [github] issue_write({
     title: "Bug: " + error.title,
     body: formatErrorDetails(error),
     labels: ["bug", "sentry-linked", "production"]
   })
3. [sentry] Vincular issue de GitHub al error de Sentry (si soportado)
```

### sentry + atlassian

```json
{
  "sentry": { "..." },
  "atlassian": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"]
  }
}
```

**Flujo combinado:**

```
Usuario: "Crea un ticket de Jira para los errores criticos"

IA:
1. [sentry] Filtrar errores con severity = critical
2. Para cada error:
   [atlassian] jira_create_issue({
     type: "Bug",
     priority: "Critical",
     summary: error.title,
     description: formatForJira(error)
   })
```

### sentry + slack

```json
{
  "sentry": { "..." },
  "slack": {
    "command": "npx",
    "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
    "env": { "SLACK_MCP_XOXP_TOKEN": "${SLACK_TOKEN}" }
  }
}
```

**Flujo combinado:**

```
Usuario: "Notifica al equipo sobre los errores nuevos"

IA:
1. [sentry] Obtener errores de las ultimas 2 horas
2. [slack] Enviar mensaje a #engineering:
   "🚨 Nuevos errores detectados:
   - TypeError: Cannot read property 'x' (15 users)
   - NetworkError: Request failed (8 users)
   Ver detalles: [link a Sentry]"
```

---

## Mejores Practicas

### 1. Categorizar Errores

```
Por Severidad:
- Critical: App crash, data loss
- High: Feature broken, UX degraded
- Medium: Minor bugs, edge cases
- Low: Cosmetic issues

Por Tipo:
- Runtime errors: TypeError, ReferenceError
- Network errors: Failed fetches, timeouts
- Validation errors: Bad input
- Auth errors: Unauthorized, forbidden
```

### 2. Formato de Bug Reports

```markdown
## Error: [Titulo del error de Sentry]

### Frecuencia

- Ocurrencias: X en ultimas 24h
- Usuarios afectados: Y

### Stack Trace
```

[stack trace del error]

```

### Contexto
- Browser: Chrome 120
- OS: Windows 11
- App Version: 1.2.3

### Pasos para Reproducir
1. [basado en el contexto del error]

### Posible Causa
[analisis del stack trace]

### Sugerencia de Fix
[codigo sugerido]
```

### 3. Metricas Clave

```
- Error Rate: errores/minuto
- Unique Users Affected: usuarios unicos
- Time to First Error: tiempo desde deploy
- Mean Time to Resolution: tiempo promedio de fix
```

---

## Troubleshooting

### Error: "Project not found"

```
Verificar:
1. El slug del proyecto es correcto
2. El lenguaje especificado es correcto
3. Tienes acceso al proyecto en Sentry
```

### Error: "Authentication required"

```
Solucion:
1. El servidor MCP de Sentry usa OAuth
2. Seguir el flujo de autenticacion en el cliente
3. Verificar que la sesion no ha expirado
```

### No se muestran errores recientes

```
Verificar:
1. La aplicacion tiene el SDK de Sentry configurado
2. Hay trafico real generando errores
3. Los filtros de fecha son correctos
```

---

## Recursos Adicionales

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry MCP Announcement](https://blog.sentry.io/mcp-server/)
- [Sentry SDK Setup Guides](https://docs.sentry.io/platforms/)

---

## Siguiente Paso

Para gestion de repositorios:
--> [mcp-github.md](../project-management-guide/mcp-github.md)

Para comunicacion de errores:
--> [mcp-slack.md](./mcp-slack.md)
