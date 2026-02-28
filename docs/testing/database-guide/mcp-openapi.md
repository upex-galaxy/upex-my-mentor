# Configuración de openapi MCP para Testing de API

## ¿Qué es openapi MCP?

**openapi** (`@ivotoby/openapi-mcp-server`) es un MCP que convierte cualquier especificación OpenAPI/Swagger en herramientas MCP. Lee el esquema de una API y convierte cada endpoint en una herramienta que Claude puede usar directamente.

---

## Requisitos previos

- **Node.js 18+** instalado
- Acceso a una API con especificación OpenAPI (en este caso, Supabase)
- API Key de autenticación

---

## Cómo funciona con Supabase

Supabase usa **PostgREST**, que expone automáticamente un esquema **Swagger 2.0** de tu base de datos.

### URL del esquema OpenAPI de Supabase

```
https://<PROJECT_REF>.supabase.co/rest/v1/?apikey=<ANON_KEY>
```

**Ejemplo:**

```
https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1...
```

### Verificar que el esquema existe

Ejecuta esto en tu terminal:

```bash
curl "https://<PROJECT_REF>.supabase.co/rest/v1/?apikey=<TU_ANON_KEY>"
```

Deberías ver un JSON con formato Swagger 2.0 listando todas tus tablas.

---

## Obtener las credenciales de Supabase

1. Ve a tu proyecto en **Supabase Dashboard**
2. Ve a **Project Settings** → **API**
3. Copia:
   - **Project URL:** `https://<project-ref>.supabase.co`
   - **anon public key:** La API key pública

---

## Configuración del MCP

### Claude Code (CLI)

```bash
claude mcp add-json "openapi" '{
  "command": "npx",
  "args": ["-y", "@ivotoby/openapi-mcp-server"],
  "env": {
    "API_BASE_URL": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1",
    "OPENAPI_SPEC_PATH": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/?apikey=TU_ANON_KEY",
    "API_HEADERS": "apikey:TU_ANON_KEY,Authorization:Bearer TU_ANON_KEY"
  }
}'
```

### Claude Desktop / Cursor / VS Code

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "@ivotoby/openapi-mcp-server"],
      "env": {
        "API_BASE_URL": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1",
        "OPENAPI_SPEC_PATH": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/?apikey=TU_ANON_KEY",
        "API_HEADERS": "apikey:TU_ANON_KEY,Authorization:Bearer TU_ANON_KEY"
      }
    }
  }
}
```

---

## Variables de entorno explicadas

| Variable            | Descripción                                     | Ejemplo                                       |
| ------------------- | ----------------------------------------------- | --------------------------------------------- |
| `API_BASE_URL`      | URL base para las peticiones                    | `https://xxx.supabase.co/rest/v1`             |
| `OPENAPI_SPEC_PATH` | URL del esquema OpenAPI (con apikey)            | `https://xxx.supabase.co/rest/v1/?apikey=...` |
| `API_HEADERS`       | Headers para autenticación (separados por coma) | `apikey:xxx,Authorization:Bearer xxx`         |

---

## Opciones avanzadas

El MCP soporta argumentos de línea de comandos para configuración adicional:

### Modos de herramientas

| Modo               | Descripción                                           |
| ------------------ | ----------------------------------------------------- |
| `--tools all`      | Carga todos los endpoints como herramientas (default) |
| `--tools dynamic`  | Expone meta-herramientas para descubrir endpoints     |
| `--tools explicit` | Solo carga herramientas específicas                   |

### Filtrado de operaciones

| Argumento          | Descripción                    |
| ------------------ | ------------------------------ |
| `--operation get`  | Solo operaciones GET (lectura) |
| `--operation post` | Solo operaciones POST          |
| `--tag <tag>`      | Filtrar por tag OpenAPI        |

### Ejemplo: Solo lectura

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "@ivotoby/openapi-mcp-server", "--operation", "get"],
      "env": {
        "API_BASE_URL": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1",
        "OPENAPI_SPEC_PATH": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/?apikey=TU_ANON_KEY",
        "API_HEADERS": "apikey:TU_ANON_KEY,Authorization:Bearer TU_ANON_KEY"
      }
    }
  }
}
```

### Ejemplo: Modo dynamic (recomendado para exploración)

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
      "env": {
        "API_BASE_URL": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1",
        "OPENAPI_SPEC_PATH": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/?apikey=TU_ANON_KEY",
        "API_HEADERS": "apikey:TU_ANON_KEY,Authorization:Bearer TU_ANON_KEY"
      }
    }
  }
}
```

Con `--tools dynamic`, el MCP expone 3 meta-herramientas:

- `list-api-endpoints`: Ver todos los endpoints disponibles
- `get-api-endpoint-schema`: Ver el schema de un endpoint específico
- `invoke-api-endpoint`: Ejecutar cualquier endpoint

Esto evita saturar el contexto con decenas de herramientas.

---

## Herramientas generadas

Dependiendo del modo, tendrás acceso a herramientas que representan cada endpoint de tu API.

### Ejemplo: Si tienes una tabla `users`

El MCP generará herramientas como:

- `GET /users` → Listar usuarios
- `POST /users` → Crear usuario
- `PATCH /users` → Actualizar usuario
- `DELETE /users` → Eliminar usuario

### Ejemplos de uso en conversación:

- _"Lista todos los productos de la tabla products"_
- _"Crea un nuevo usuario con email test@example.com"_
- _"Obtén el usuario con id 123"_
- _"¿Qué endpoints están disponibles en la API?"_

---

## Comparación: dbhub vs openapi MCP

| Aspecto                 | dbhub (SQL)          | openapi (API)              |
| ----------------------- | -------------------- | -------------------------- |
| **Qué hace**            | Ejecuta SQL directo  | Llama endpoints REST       |
| **Acceso**              | Connection string DB | API Key + URL              |
| **Operaciones**         | Queries SQL          | GET, POST, PATCH, DELETE   |
| **JOINs complejos**     | ✅ Sí                | ❌ Limitado a foreign keys |
| **Pasa por RLS**        | ❌ No                | ✅ Sí                      |
| **Validaciones de API** | ❌ No                | ✅ Sí                      |

**Recomendación:** Usa ambos en conjunto para testing completo.

---

## Configuración completa: openapi + dbhub

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "@ivotoby/openapi-mcp-server"],
      "env": {
        "API_BASE_URL": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1",
        "OPENAPI_SPEC_PATH": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/?apikey=TU_ANON_KEY",
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
        "DB_USER": "qa_team.ionevzckjyxtpmyenbxc",
        "DB_PASSWORD": "TU_PASSWORD",
        "DB_NAME": "postgres"
      }
    }
  }
}
```

Con esto tienes:

- **`openapi`**: Para testing de API REST (pasa por RLS y validaciones)
- **`dbhub`**: Para testing de base de datos con SQL (acceso directo)

---

## Flujos Relacionados

Este documento cubre el **Flujo C: MCP para testing con AI**. El spec OpenAPI puede venir de diferentes fuentes:

| Fuente del Spec        | Cuando usarlo                     | Documento                                                                       |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| **Supabase auto-spec** | Proyectos con Supabase (este doc) | Este documento                                                                  |
| **sync-openapi.ts**    | Backend externo tiene el spec     | Script: [`scripts/sync-openapi.ts`](../../../scripts/sync-openapi.ts)           |
| **Zod-to-OpenAPI**     | Tu defines schemas con Zod        | [openapi-zod-contract-testing.md](../api-guide/openapi-zod-contract-testing.md) |

---

## Referencias

- [@ivotoby/openapi-mcp-server en npm](https://www.npmjs.com/package/@ivotoby/openapi-mcp-server)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Supabase API Documentation](https://supabase.com/docs/guides/api)
- [PostgREST Documentation](https://postgrest.org/en/stable/)
