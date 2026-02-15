# Research y Documentation con MCPs

Esta carpeta contiene guias para usar herramientas de **investigacion** y **documentacion** en tu flujo de desarrollo y testing usando MCPs (Model Context Protocol).

## Para quien es esto?

Developers, QA Engineers y TAEs que quieren:

- Obtener documentacion oficial actualizada de librerias
- Buscar soluciones a problemas tecnicos
- Investigar best practices y patrones
- Comparar tecnologias y herramientas
- Resolver errores con ayuda de la comunidad

---

## Documentos

| Archivo                              | Descripcion                                   |
| ------------------------------------ | --------------------------------------------- |
| [mcp-context7.md](./mcp-context7.md) | Documentacion oficial de librerias/frameworks |
| [mcp-tavily.md](./mcp-tavily.md)     | Busqueda web para soluciones y best practices |

---

## MCPs Utilizados

| MCP        | Conexion                   | Proposito                        |
| ---------- | -------------------------- | -------------------------------- |
| `context7` | `mcp.context7.com` o local | Docs oficiales, APIs, ejemplos   |
| `tavily`   | `mcp.tavily.com`           | Busqueda web, foros, discusiones |

---

## Cuando Usar Cual?

| Escenario                  | Context7 | Tavily |
| -------------------------- | -------- | ------ |
| "Como usar useState?"      | Si       | No     |
| "Error hydration mismatch" | No       | Si     |
| "Docs de Playwright"       | Si       | No     |
| "Best practices testing"   | No       | Si     |
| "Bugs conocidos de lib X"  | No       | Si     |
| "API de React Hook Form"   | Si       | No     |
| "Comparar Zod vs Yup"      | No       | Si     |

**Regla general**:

- **Context7** para **"como usar"** → documentacion oficial
- **Tavily** para **"como resolver"** → comunidad, foros, experiencias

---

## Configuracion Basica

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      }
    },
    "tavily": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"]
    }
  }
}
```

---

## Casos de Uso Comunes

### Para Development

1. **Obtener sintaxis correcta** de APIs y frameworks
2. **Ver ejemplos de codigo** de la documentacion oficial
3. **Buscar soluciones** a errores especificos
4. **Investigar patterns** y best practices

### Para Testing

1. **Obtener API de testing frameworks** (Playwright, Vitest, etc.)
2. **Buscar estrategias** para flaky tests
3. **Investigar herramientas** de testing
4. **Encontrar ejemplos** de test configurations

---

## Flujo de Investigacion Recomendado

```
1. Primero, intenta Context7 para docs oficiales
     ↓
2. Si no encuentras lo que necesitas, usa Tavily
     ↓
3. Combina ambas fuentes para tener contexto completo
```

---

## Orden de Lectura Recomendado

1. **Para documentacion oficial** → [mcp-context7.md](./mcp-context7.md)
2. **Para busquedas y debugging** → [mcp-tavily.md](./mcp-tavily.md)

---

## Ver Tambien

- [API Guide](../api/README.md) - Testing de APIs
- [UI Guide](../ui/README.md) - Testing de UI
- [Database Guide](../database/README.md) - Testing de base de datos
