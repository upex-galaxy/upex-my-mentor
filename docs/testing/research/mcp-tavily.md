# Web Search con Tavily MCP

Esta guia explica como configurar y usar el **Tavily MCP Server** para busquedas web y research asistidos por IA en proyectos de desarrollo.

---

## Que es Tavily MCP?

**Tavily MCP** proporciona a los agentes de IA acceso a busqueda web en tiempo real, permitiendo:

- Buscar soluciones a problemas tecnicos
- Investigar errores especificos
- Comparar tecnologias y bibliotecas
- Encontrar best practices recientes
- Buscar en foros y discusiones

**Caracteristicas clave:**

| Caracteristica         | Descripcion                                  |
| ---------------------- | -------------------------------------------- |
| **Real-time search**   | Acceso a informacion actualizada de la web   |
| **AI-optimized**       | Resultados formateados para consumo por LLMs |
| **Content extraction** | Extrae contenido limpio de paginas web       |
| **Domain filtering**   | Filtrar por dominios especificos             |
| **Multiple depths**    | basic, advanced, fast, ultra-fast            |

---

## Requisitos Previos

### 1. API Key de Tavily

1. Ve a [Tavily](https://tavily.com) y crea una cuenta
2. Obtiene tu API key del dashboard
3. Plan gratuito incluye 1000 queries/mes

### 2. Guardar API Key

```bash
# En tu archivo .env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Configuracion por Herramienta

### Claude Code

**Servidor Remoto (Recomendado):**

```json
{
  "tavily": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"]
  }
}
```

### Codex CLI

```toml
[mcp_servers.tavily]
command = "npx"
args = [
    "-y",
    "mcp-remote",
    "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"
]
```

### Gemini CLI

```json
{
  "tavily": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"]
  }
}
```

### OpenCode

```json
{
  "tavily": {
    "type": "remote",
    "url": "https://mcp.tavily.com/mcp",
    "oauth": false,
    "headers": {
      "Authorization": "Bearer {env:TAVILY_API_KEY}"
    },
    "enabled": true
  }
}
```

---

## Herramientas Disponibles

| Herramienta      | Descripcion                                |
| ---------------- | ------------------------------------------ |
| `tavily_search`  | Busqueda web con configuraciones avanzadas |
| `tavily_extract` | Extraer contenido de URLs especificas      |
| `tavily_crawl`   | Crawlear multiples paginas de un sitio     |
| `tavily_map`     | Mapear estructura de un sitio web          |

### Parametros de tavily_search

| Parametro         | Default     | Descripcion                                  |
| ----------------- | ----------- | -------------------------------------------- |
| `query`           | (requerido) | Query de busqueda                            |
| `search_depth`    | "basic"     | basic, advanced, fast, ultra-fast            |
| `topic`           | "general"   | general, news, finance                       |
| `max_results`     | 5           | Numero maximo de resultados (max 20)         |
| `include_domains` | []          | Solo incluir estos dominios                  |
| `exclude_domains` | []          | Excluir estos dominios                       |
| `days`            | 30          | Resultados de los ultimos N dias (para news) |

### Profundidad de Busqueda

| Depth        | Latencia | Relevancia | Uso Recomendado                      |
| ------------ | -------- | ---------- | ------------------------------------ |
| `ultra-fast` | ~200ms   | Buena      | Queries simples, alta velocidad      |
| `fast`       | ~500ms   | Mejor      | Balance velocidad/calidad            |
| `basic`      | ~1s      | Alta       | Default, buena para la mayoria       |
| `advanced`   | ~2-3s    | Muy alta   | Research profundo, queries complejos |

---

## Casos de Uso para Development

### 1. Resolver Errores

```
Usuario: "Error hydration mismatch en Next.js - soluciones"

IA ejecutara:
tavily_search({
  query: "Next.js hydration mismatch error solution 2024",
  search_depth: "advanced",
  include_domains: ["stackoverflow.com", "github.com", "nextjs.org"]
})
```

### 2. Investigar Best Practices

```
Usuario: "Busca best practices para estructurar folders en Next.js 15"

IA ejecutara:
tavily_search({
  query: "Next.js 15 folder structure best practices",
  search_depth: "advanced",
  max_results: 10
})
```

### 3. Comparar Tecnologias

```
Usuario: "Compara Zod vs Yup para validacion en 2025"

IA ejecutara:
tavily_search({
  query: "Zod vs Yup validation library comparison 2025",
  search_depth: "advanced",
  include_domains: ["dev.to", "medium.com", "reddit.com"]
})
```

### 4. Buscar Bugs Conocidos

```
Usuario: "Investiga si hay issues conocidos con React 19 y Zustand"

IA ejecutara:
tavily_search({
  query: "React 19 Zustand compatibility issues bugs",
  search_depth: "advanced",
  include_domains: ["github.com"]
})
```

### 5. Encontrar Discusiones

```
Usuario: "Que dicen en Reddit sobre testing con Playwright?"

IA ejecutara:
tavily_search({
  query: "Playwright testing experience recommendations",
  include_domains: ["reddit.com"],
  max_results: 10
})
```

---

## Casos de Uso para Testing

### 1. Buscar Solucion a Test Fallido

```
Usuario: "Mi test de Playwright falla con 'element not visible' - busca soluciones"

IA ejecutara:
tavily_search({
  query: "Playwright test element not visible error fix",
  search_depth: "advanced",
  include_domains: ["stackoverflow.com", "github.com", "playwright.dev"]
})
```

### 2. Investigar Flaky Tests

```
Usuario: "Busca estrategias para manejar flaky tests en CI/CD"

IA ejecutara:
tavily_search({
  query: "flaky tests CI CD strategies solutions 2024",
  search_depth: "advanced"
})
```

### 3. Best Practices de Testing

```
Usuario: "Busca best practices para E2E testing en Next.js"

IA ejecutara:
tavily_search({
  query: "Next.js E2E testing best practices Playwright",
  search_depth: "advanced",
  max_results: 10
})
```

### 4. Investigar Tools de Testing

```
Usuario: "Compara Vitest vs Jest para testing en 2025"

IA ejecutara:
tavily_search({
  query: "Vitest vs Jest comparison performance 2025",
  search_depth: "advanced"
})
```

---

## Tavily vs Context7

| Escenario                      | Context7 | Tavily |
| ------------------------------ | -------- | ------ |
| "Como usar useState?"          | Si       | No     |
| "Error hydration mismatch"     | No       | Si     |
| "Docs de Playwright"           | Si       | No     |
| "Best practices testing"       | No       | Si     |
| "Bugs conocidos de lib X"      | No       | Si     |
| "API de React Hook Form"       | Si       | No     |
| "Comparar Zod vs Yup"          | No       | Si     |
| "Discusiones en Reddit/dev.to" | No       | Si     |
| "Issues de GitHub de una lib"  | No       | Si     |

**Regla**: Context7 para **"como usar"**, Tavily para **"como resolver"**.

---

## Uso Avanzado

### Extraer Contenido de URLs

```
Usuario: "Extrae el contenido de este blog post para analizar"

IA ejecutara:
tavily_extract({
  urls: ["https://blog.example.com/article"],
  format: "markdown"
})
```

### Crawl de Documentacion

```
Usuario: "Crawlea la documentacion de esa libreria"

IA ejecutara:
tavily_crawl({
  url: "https://docs.example.com",
  max_depth: 2,
  max_breadth: 20,
  limit: 50
})
```

### Mapear Estructura de Sitio

```
Usuario: "Muestra la estructura de la documentacion"

IA ejecutara:
tavily_map({
  url: "https://docs.example.com",
  max_depth: 2
})
```

---

## Integracion con Otros MCPs

### tavily + context7

```json
{
  "tavily": { "..." },
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

**Flujo combinado:**

```
Usuario: "Implementa autenticacion con Supabase (investiga primero)"

IA:
1. [context7] Obtener docs oficiales de Supabase Auth
2. [tavily] Buscar best practices y ejemplos recientes
3. Combinar documentacion oficial + experiencias de la comunidad
```

### tavily + github

```json
{
  "tavily": { "..." },
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/"
  }
}
```

**Flujo combinado:**

```
Usuario: "Busca si hay issues abiertos para este error"

IA:
1. [tavily] Buscar en Google/GitHub issues relacionados
2. [github] search_issues para busqueda mas precisa
3. Combinar resultados
```

---

## Mejores Practicas

### 1. Queries Especificos

```
# Bien
"Next.js 14 App Router hydration mismatch error solution"

# Mal
"error Next.js"
```

### 2. Incluir Contexto Temporal

```
# Bien - incluye año para resultados recientes
"Playwright vs Cypress comparison 2025"

# Bien - usa days para noticias recientes
tavily_search({ query: "React updates", topic: "news", days: 7 })
```

### 3. Filtrar por Dominio

```
# Para soluciones tecnicas
include_domains: ["stackoverflow.com", "github.com"]

# Para discusiones/opiniones
include_domains: ["reddit.com", "dev.to", "medium.com"]

# Para documentacion oficial
include_domains: ["nextjs.org", "react.dev", "playwright.dev"]
```

### 4. Usar Profundidad Apropiada

```
# Query simple, respuesta rapida
search_depth: "fast"

# Research profundo
search_depth: "advanced"
```

---

## Troubleshooting

### Error: "Invalid API key"

```
Verificar:
1. API key comienza con tvly-
2. Key no ha expirado
3. No excediste el limite mensual
```

### Resultados irrelevantes

```
Solucion:
1. Hacer query mas especifico
2. Usar include_domains para filtrar
3. Aumentar search_depth a "advanced"
```

### Rate limit exceeded

```
Solucion:
1. Plan gratuito: 1000 queries/mes
2. Reducir frecuencia de queries
3. Cachear resultados cuando sea posible
4. Upgrade a plan de pago si necesitas mas
```

---

## Recursos Adicionales

- [Tavily - Website](https://tavily.com)
- [Tavily API Documentation](https://docs.tavily.com)
- [Tavily MCP - Blog](https://blog.tavily.com)
- [Search Depth Guide](https://blog.tavily.com/how-we-built-the-fastest-web-search-in-the-world)

---

## Siguiente Paso

Para documentacion oficial de librerias:
--> [mcp-context7.md](./mcp-context7.md)

Para testing con Playwright:
--> [../ui/mcp-playwright.md](../ui/mcp-playwright.md)
