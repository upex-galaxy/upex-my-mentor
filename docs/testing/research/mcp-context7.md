# Documentacion Oficial con Context7 MCP

Esta guia explica como configurar y usar el **Context7 MCP Server** de Upstash para obtener documentacion actualizada de librerias y frameworks directamente en tu flujo de trabajo con IA.

---

## Que es Context7 MCP?

**Context7 MCP** proporciona a los agentes de IA acceso a documentacion actualizada y especifica por version, extraida directamente de fuentes oficiales. Incluye:

- Documentacion oficial de librerias y frameworks
- Ejemplos de codigo funcionales
- Informacion especifica por version
- Formato optimizado para consumo por LLMs

**Caracteristicas clave:**

| Caracteristica                | Descripcion                                         |
| ----------------------------- | --------------------------------------------------- |
| **Documentacion actualizada** | Extraida directamente de fuentes oficiales          |
| **Version-specific**          | Soporte para versiones especificas de librerias     |
| **LLM-optimized**             | Formateado para consumo eficiente por modelos de IA |
| **40k+ librerias**            | Cobertura amplia del ecosistema de desarrollo       |

---

## Requisitos Previos

### 1. API Key (Opcional pero Recomendado)

Obtener una API key gratuita en [context7.com/dashboard](https://context7.com/dashboard) para rate limits mas altos.

### 2. Guardar la API Key

```bash
# En tu archivo .env
CONTEXT7_API_KEY=tu-api-key
```

---

## Configuracion por Herramienta

### Claude Code

**Servidor Remoto (Recomendado):**

```json
{
  "context7": {
    "url": "https://mcp.context7.com/mcp",
    "headers": {
      "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
    }
  }
}
```

**Servidor Local:**

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp", "--api-key", "${CONTEXT7_API_KEY}"]
  }
}
```

### Codex CLI

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

### Gemini CLI

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

### OpenCode

```json
{
  "context7": {
    "type": "remote",
    "url": "https://mcp.context7.com/mcp",
    "enabled": true
  }
}
```

### VS Code

```json
{
  "mcp": {
    "servers": {
      "context7": {
        "type": "http",
        "url": "https://mcp.context7.com/mcp",
        "headers": {
          "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
        }
      }
    }
  }
}
```

---

## Herramientas Disponibles

Context7 MCP v2.0 proporciona 2 herramientas principales:

| Herramienta          | Descripcion                                                    |
| -------------------- | -------------------------------------------------------------- |
| `resolve-library-id` | Resuelve un nombre de libreria a un ID compatible con Context7 |
| `query-docs`         | Obtiene documentacion usando el ID de libreria                 |

### Parametros de resolve-library-id

| Parametro     | Requerido | Descripcion                                       |
| ------------- | --------- | ------------------------------------------------- |
| `query`       | Si        | La pregunta del usuario (para rankear resultados) |
| `libraryName` | Si        | Nombre de la libreria a buscar                    |

### Parametros de query-docs

| Parametro   | Requerido | Descripcion                                      |
| ----------- | --------- | ------------------------------------------------ |
| `libraryId` | Si        | ID exacto de Context7 (ej: `/vercel/next.js`)    |
| `query`     | Si        | La pregunta para obtener documentacion relevante |

---

## Casos de Uso para Development

### 1. Obtener API de un Framework

```
Usuario: "Como implementar server actions en Next.js 14? use context7"

IA ejecutara:
1. resolve-library-id({ query: "server actions Next.js 14", libraryName: "next.js" })
2. query-docs({ libraryId: "/vercel/next.js", query: "server actions implementation" })
3. Retornar documentacion con ejemplos de codigo
```

### 2. Sintaxis de Testing Library

```
Usuario: "Cual es la sintaxis de expect en Playwright? use context7"

IA ejecutara:
1. resolve-library-id({ query: "expect assertions", libraryName: "playwright" })
2. query-docs({ libraryId: "/microsoft/playwright", query: "expect assertions syntax" })
```

### 3. Validacion con Zod

```
Usuario: "Como validar un email con Zod? use context7"

IA ejecutara:
1. resolve-library-id({ query: "email validation", libraryName: "zod" })
2. query-docs({ libraryId: "/colinhacks/zod", query: "email string validation" })
```

### 4. Usar Library ID Directo

Si ya conoces el ID de la libreria, puedes especificarlo directamente:

```
Usuario: "Implementa autenticacion con Supabase. use library /supabase/supabase"

IA ejecutara:
1. query-docs({ libraryId: "/supabase/supabase", query: "authentication implementation" })
```

---

## Casos de Uso para Testing

### 1. Configurar Test Framework

```
Usuario: "Como configurar Vitest con Next.js? use context7"

IA:
1. resolve-library-id para "vitest"
2. query-docs para "vitest next.js configuration"
3. Retornar configuracion correcta con ejemplos
```

### 2. Mocking en Tests

```
Usuario: "Como hacer mock de fetch en Vitest? use context7"

IA:
1. query-docs({ libraryId: "/vitest-dev/vitest", query: "mock fetch vi.mock" })
2. Retornar ejemplos de mocking
```

### 3. Playwright Locators

```
Usuario: "Cuales son los mejores locators en Playwright? use context7"

IA:
1. query-docs({ libraryId: "/microsoft/playwright", query: "locator strategies best practices" })
```

### 4. Testing Library Queries

```
Usuario: "Diferencia entre getBy y queryBy en Testing Library? use context7"

IA:
1. resolve-library-id para "@testing-library/react"
2. query-docs para "getBy queryBy findBy differences"
```

---

## Reglas para Auto-invocacion

Para evitar escribir "use context7" en cada prompt, configura una regla en tu cliente MCP:

### Cursor

En `Cursor Settings > Rules`:

```
Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
```

### Claude Code

En `CLAUDE.md`:

```markdown
## Context7 Integration

Usar Context7 MCP automaticamente cuando:

- Se necesite documentacion oficial de librerias
- Se requieran ejemplos de codigo de frameworks
- Se busque configuracion o setup de herramientas
- Se consulte sintaxis de APIs
```

---

## Context7 vs Tavily

| Escenario                  | Context7 | Tavily |
| -------------------------- | -------- | ------ |
| "Como usar useState?"      | Si       | No     |
| "Error hydration mismatch" | No       | Si     |
| "Docs de Playwright"       | Si       | No     |
| "Best practices testing"   | No       | Si     |
| "Bugs conocidos de lib X"  | No       | Si     |
| "API de React Hook Form"   | Si       | No     |
| "Comparar Zod vs Yup"      | No       | Si     |

**Regla**: Context7 para **"como usar"**, Tavily para **"como resolver"**.

---

## Librerias Populares Soportadas

| Libreria     | Library ID                  |
| ------------ | --------------------------- |
| Next.js      | `/vercel/next.js`           |
| React        | `/facebook/react`           |
| Playwright   | `/microsoft/playwright`     |
| Vitest       | `/vitest-dev/vitest`        |
| Zod          | `/colinhacks/zod`           |
| Supabase     | `/supabase/supabase`        |
| Tailwind CSS | `/tailwindlabs/tailwindcss` |
| TypeScript   | `/microsoft/typescript`     |
| Prisma       | `/prisma/prisma`            |
| tRPC         | `/trpc/trpc`                |

Para buscar mas librerias: [context7.com](https://context7.com)

---

## Especificar Version

Para obtener documentacion de una version especifica, menciona la version en tu prompt:

```
Usuario: "Como configurar middleware en Next.js 14? use context7"
```

Context7 automaticamente matcheara la version apropiada.

---

## Integracion con Otros MCPs

### context7 + supabase

```json
{
  "context7": { "..." },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest"],
    "env": { "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}" }
  }
}
```

**Flujo combinado:**

```
Usuario: "Implementa autenticacion con Supabase"

IA:
1. [context7] Obtener documentacion de auth de Supabase
2. [supabase] Verificar schema actual de auth.users
3. Generar codigo basado en docs + schema real
```

### context7 + playwright

```json
{
  "context7": { "..." },
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest", "--caps", "testing"]
  }
}
```

**Flujo combinado:**

```
Usuario: "Crea un test E2E para el login"

IA:
1. [context7] Obtener sintaxis de Playwright para tests
2. [playwright] Explorar la pagina de login con browser_snapshot
3. [playwright] browser_generate_locator para elementos
4. Generar test con sintaxis correcta
```

---

## Mejores Practicas

### 1. Se Especifico en las Consultas

```
# Bien
"Como usar useEffect con cleanup en React 18? use context7"

# Mal
"useEffect"
```

### 2. Incluye Version cuando sea Relevante

```
# Bien - version especifica
"Server components en Next.js 14 App Router use context7"

# Bien - ultima version implicita
"Server components en Next.js use context7"
```

### 3. Un Tema por Consulta

```
# Bien
"Como configurar Zod schemas? use context7"

# Mal
"Como configurar Zod y validar formularios y hacer error handling?"
```

---

## Troubleshooting

### Error: "Library not found"

```
Verificar:
1. El nombre de la libreria es correcto
2. La libreria esta indexada en Context7
3. Buscar en context7.com para el ID correcto
```

### Error: "Rate limit exceeded"

```
Solucion:
1. Obtener API key gratuita en context7.com/dashboard
2. Configurar la API key en el cliente
3. Las API keys tienen rate limits mas altos
```

### Documentacion no actualizada

```
Solucion:
1. Context7 actualiza periodicamente
2. Reportar en el proyecto GitHub si hay issues
3. Para docs muy recientes, complementar con Tavily
```

---

## Recursos Adicionales

- [Context7 - Website](https://context7.com)
- [Context7 MCP - GitHub](https://github.com/upstash/context7)
- [Context7 MCP - NPM](https://www.npmjs.com/package/@upstash/context7-mcp)
- [Documentacion Completa](https://context7.com/docs)
- [Lista de Clientes Soportados](https://context7.com/docs/all-clients)

---

## Siguiente Paso

Para busquedas web y debugging:
--> [mcp-tavily.md](./mcp-tavily.md)

Para testing con Playwright:
--> [../ui/mcp-playwright.md](../ui/mcp-playwright.md)
