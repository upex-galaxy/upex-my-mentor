# Database Testing con MCPs

Esta carpeta contiene guias para realizar testing de **API** y **Base de Datos** usando MCPs (Model Context Protocol) con herramientas de IA como Claude.

## Para quien es esto?

QA Engineers y Test Automation Engineers que quieren aprender a:

- Testear APIs REST usando especificaciones OpenAPI
- Ejecutar queries SQL para validar datos
- Integrar herramientas de IA en su flujo de testing

---

## Documentos

| Archivo                                    | Descripcion                                                        |
| ------------------------------------------ | ------------------------------------------------------------------ |
| [concepts.md](./concepts.md)               | Teoria sobre testing de API vs Base de Datos, cuando usar cada uno |
| [mcp-dbhub.md](./mcp-dbhub.md)             | Guia para configurar DBHub (acceso SQL directo)                    |
| [mcp-openapi.md](./mcp-openapi.md)         | Guia para configurar OpenAPI MCP (acceso API REST)                 |
| [troubleshooting.md](./troubleshooting.md) | Solucion a problemas comunes (Windows, IPv6, permisos, etc.)       |

---

## MCPs Utilizados

| MCP             | Paquete NPM                   | Proposito                 | Instalacion                          |
| --------------- | ----------------------------- | ------------------------- | ------------------------------------ |
| `dbhub` (sql)   | `@bytebase/dbhub`             | Ejecutar SQL directo      | `npx -y @bytebase/dbhub`             |
| `openapi` (api) | `@ivotoby/openapi-mcp-server` | Consumir APIs via OpenAPI | `npx -y @ivotoby/openapi-mcp-server` |
| `postman`       | `@postman/postman-mcp-server` | Colecciones Postman       | `npx -y @postman/postman-mcp-server` |

---

## Orden de Lectura Recomendado

1. **Empieza por los conceptos** → [concepts.md](./concepts.md)
2. **Configura el acceso a la base de datos** → [mcp-dbhub.md](./mcp-dbhub.md)
3. **Configura el acceso a la API** → [mcp-openapi.md](./mcp-openapi.md)
4. **Consulta si tienes problemas** → [troubleshooting.md](./troubleshooting.md)

---

## Ejemplo de Configuracion Completa

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "@ivotoby/openapi-mcp-server"],
      "env": {
        "API_BASE_URL": "https://TU_PROYECTO.supabase.co/rest/v1",
        "OPENAPI_SPEC_PATH": "https://TU_PROYECTO.supabase.co/rest/v1/?apikey=TU_ANON_KEY",
        "API_HEADERS": "apikey:TU_ANON_KEY,Authorization:Bearer TU_ANON_KEY"
      }
    },
    "dbhub": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--transport", "stdio"],
      "env": {
        "DB_TYPE": "postgres",
        "DB_HOST": "aws-0-us-east-1.pooler.supabase.com",
        "DB_PORT": "6543",
        "DB_USER": "qa_team.TU_PROYECTO",
        "DB_PASSWORD": "TU_PASSWORD",
        "DB_NAME": "postgres"
      }
    }
  }
}
```

---

## Verificacion

Estos documentos fueron verificados con configuraciones reales en:

- Linux (Ubuntu)
- macOS
- Windows (PowerShell, Git Bash, WSL)

Los problemas documentados en troubleshooting son errores reales encontrados durante la configuracion.

---

## Ver Tambien

- [API Guide](../api-guide/README.md) - Testing de APIs con multiples herramientas
- [UI Guide](../ui-guide/README.md) - Testing de UI con Playwright
- [Project Management Guide](../project-management-guide/README.md) - Jira y GitHub
- [Monitoring Guide](../monitoring-guide/README.md) - Sentry y Slack
- [Research Guide](../research-guide/README.md) - Context7 y Tavily
