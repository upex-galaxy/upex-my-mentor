# Database Management con Supabase MCP

Esta guia explica como configurar y usar el **Supabase MCP Server oficial** para gestion de bases de datos y backend asistida por IA.

---

## Que es Supabase MCP?

El **Supabase MCP Server** conecta herramientas de IA directamente con tu proyecto Supabase, permitiendo:

- Ejecutar queries SQL y ver resultados
- Aplicar y gestionar migraciones
- Explorar schema de tablas
- Gestionar RLS policies
- Crear y desplegar Edge Functions
- Gestionar Storage buckets

**Caracteristicas clave:**

| Caracteristica           | Descripcion                                       |
| ------------------------ | ------------------------------------------------- |
| **Schema exploration**   | Ver estructura de tablas, relaciones, constraints |
| **SQL execution**        | Ejecutar queries directamente                     |
| **Migration management** | Crear y aplicar migraciones                       |
| **RLS policies**         | Gestionar Row Level Security                      |
| **Edge Functions**       | Crear y desplegar funciones serverless            |

---

## Requisitos Previos

### 1. Cuenta de Supabase

Necesitas un proyecto en [Supabase](https://supabase.com).

### 2. Personal Access Token

1. Ve a [Supabase Dashboard > Account > Access Tokens](https://supabase.com/dashboard/account/tokens)
2. Click en **Generate New Token**
3. Dale un nombre descriptivo (ej: "Claude MCP")
4. Copia el token (solo se muestra una vez)

### 3. Guardar Token

```bash
# En tu archivo .env
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Configuracion por Herramienta

### Claude Code

```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest"],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
    }
  }
}
```

### Codex CLI

```toml
[mcp_servers.supabase]
command = "npx"
args = ["-y", "@supabase/mcp-server-supabase@latest"]

[mcp_servers.supabase.env]
SUPABASE_ACCESS_TOKEN = "${SUPABASE_ACCESS_TOKEN}"
```

### Gemini CLI

```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest"],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
    }
  }
}
```

### OpenCode

```json
{
  "supabase": {
    "type": "local",
    "command": ["npx", "-y", "@supabase/mcp-server-supabase@latest"],
    "environment": {
      "SUPABASE_ACCESS_TOKEN": "{env:SUPABASE_ACCESS_TOKEN}"
    },
    "enabled": true
  }
}
```

### VS Code

```json
{
  "mcp": {
    "servers": {
      "supabase": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@supabase/mcp-server-supabase@latest"],
        "env": {
          "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
        }
      }
    }
  }
}
```

---

## Herramientas Principales

Segun Supabase Wrapped 2025, las herramientas mas usadas son:

| Herramienta       | Uso | Descripcion                   |
| ----------------- | --- | ----------------------------- |
| `execute_sql`     | 35% | Ejecutar queries SQL          |
| `apply_migration` | 25% | Aplicar migraciones de schema |
| `list_tables`     | 20% | Listar todas las tablas       |
| `list_migrations` | 15% | Ver historial de migraciones  |

### Otras Herramientas Disponibles

| Herramienta            | Descripcion                     |
| ---------------------- | ------------------------------- |
| `get_table_schema`     | Obtener schema de una tabla     |
| `list_policies`        | Listar RLS policies             |
| `create_policy`        | Crear nueva RLS policy          |
| `list_functions`       | Listar database functions       |
| `create_function`      | Crear function de base de datos |
| `list_edge_functions`  | Listar Edge Functions           |
| `deploy_edge_function` | Desplegar Edge Function         |
| `list_storage_buckets` | Listar Storage buckets          |
| `get_project_info`     | Info del proyecto               |

---

## Casos de Uso para Development

### 1. Explorar Schema

```
Usuario: "Que columnas tiene la tabla users?"

IA ejecutara:
1. list_tables() -> ver tablas disponibles
2. get_table_schema({ table: "users" })
3. Mostrar:
   - Columnas con tipos
   - Primary keys
   - Foreign keys
   - Constraints
```

### 2. Verificar Relaciones

```
Usuario: "Cual es la relacion entre users y orders?"

IA ejecutara:
1. get_table_schema({ table: "users" })
2. get_table_schema({ table: "orders" })
3. Analizar foreign keys
4. Explicar: "orders.user_id -> users.id (one-to-many)"
```

### 3. Ejecutar Query

```
Usuario: "Dame los ultimos 10 usuarios registrados"

IA ejecutara:
execute_sql({
  query: "SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10"
})
```

### 4. Crear Migracion

```
Usuario: "Agrega un campo 'avatar_url' a la tabla profiles"

IA ejecutara:
apply_migration({
  name: "add_avatar_url_to_profiles",
  sql: "ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;"
})
```

### 5. Configurar RLS

```
Usuario: "Los usuarios solo deben ver sus propios datos en profiles"

IA ejecutara:
1. create_policy({
     table: "profiles",
     name: "Users can view own profile",
     operation: "SELECT",
     using: "auth.uid() = id"
   })
2. create_policy({
     table: "profiles",
     name: "Users can update own profile",
     operation: "UPDATE",
     using: "auth.uid() = id"
   })
```

---

## Casos de Uso para Testing

### 1. Verificar Test Data

```
Usuario: "Hay datos de prueba en la tabla products?"

IA ejecutara:
execute_sql({
  query: "SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM products"
})
```

### 2. Verificar RLS Policies

```
Usuario: "Que policies tiene la tabla orders?"

IA ejecutara:
list_policies({ table: "orders" })
```

### 3. Test de Constraints

```
Usuario: "Puedo insertar un order sin user_id?"

IA ejecutara:
1. get_table_schema({ table: "orders" }) -> ver constraints
2. Explicar: "No, user_id tiene constraint NOT NULL y FK a users.id"
```

### 4. Verificar Integridad de Datos

```
Usuario: "Hay orders huerfanos sin user valido?"

IA ejecutara:
execute_sql({
  query: `
    SELECT o.* FROM orders o
    LEFT JOIN auth.users u ON o.user_id = u.id
    WHERE u.id IS NULL
  `
})
```

### 5. Setup de Test Environment

```
Usuario: "Crea datos de prueba para testing"

IA ejecutara:
execute_sql({
  query: `
    -- Test user
    INSERT INTO auth.users (id, email)
    VALUES ('test-user-id', 'test@example.com');

    -- Test profile
    INSERT INTO profiles (id, full_name)
    VALUES ('test-user-id', 'Test User');

    -- Test products
    INSERT INTO products (name, price)
    VALUES ('Test Product', 99.99);
  `
})
```

---

## Flujos de Database Testing

### Flujo 1: Schema Validation

```
Usuario: "Verifica que el schema esta correcto para la feature de subscriptions"

IA:
1. list_tables() -> verificar tablas necesarias
2. get_table_schema({ table: "subscriptions" })
3. Validar:
   - Columnas requeridas existen
   - Tipos de datos son correctos
   - Foreign keys configuradas
   - RLS policies activas
4. Reportar discrepancias
```

### Flujo 2: Migration Testing

```
Usuario: "Aplica la migracion y verifica que funciono"

IA:
1. apply_migration({ name: "add_feature_x", sql: "..." })
2. list_migrations() -> verificar que se aplico
3. execute_sql({ query: "SELECT * FROM new_table LIMIT 1" })
4. Confirmar que el schema es correcto
```

### Flujo 3: Data Integrity Check

```
Usuario: "Verifica la integridad de datos post-migration"

IA:
1. Ejecutar queries de validacion:
   - Check foreign key violations
   - Check null violations
   - Check constraint violations
2. Reportar cualquier problema encontrado
```

---

## Integracion con Otros MCPs

### supabase + context7

```json
{
  "supabase": { "..." },
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

**Flujo combinado:**

```
Usuario: "Implementa autenticacion con Supabase"

IA:
1. [context7] Obtener docs de Supabase Auth
2. [supabase] Verificar schema de auth.users
3. [supabase] Verificar RLS policies
4. Generar codigo basado en docs + schema real
```

### supabase + dbhub

Para queries SQL mas avanzados, puedes usar ambos:

```json
{
  "supabase": { "..." },
  "dbhub": {
    "command": "npx",
    "args": ["-y", "@bytebase/dbhub", "--transport", "stdio", "--dsn", "postgresql://..."]
  }
}
```

**Cuando usar cual:**

| Tarea                 | Supabase MCP | DBHub    |
| --------------------- | ------------ | -------- |
| Schema exploration    | Si           | Si       |
| Ejecutar queries      | Si           | Si       |
| Aplicar migraciones   | Si           | No       |
| Gestionar RLS         | Si           | No       |
| Edge Functions        | Si           | No       |
| Queries complejos SQL | Basico       | Avanzado |

---

## Mejores Practicas

### 1. Siempre Verificar Schema

```
# Antes de escribir codigo que usa la DB
Usuario: "Dame el schema de profiles antes de crear el formulario"

# El schema real puede diferir de la documentacion
```

### 2. Usar Migraciones para Cambios

```
# Bien: Crear migracion
apply_migration({
  name: "add_avatar_url",
  sql: "ALTER TABLE profiles ADD COLUMN avatar_url TEXT;"
})

# Mal: Modificar directamente en dashboard
```

### 3. Verificar RLS Siempre

```
# Para cada tabla nueva
Usuario: "Verifica que la tabla X tiene RLS configurado"

# Tablas sin RLS son publicas!
```

### 4. Test Constraints

```
# Verificar que los constraints funcionan
execute_sql({
  query: "INSERT INTO orders (user_id) VALUES (null)"
})
# Esperado: Error por NOT NULL constraint
```

---

## Troubleshooting

### Error: "Invalid access token"

```
Verificar:
1. Token comienza con sbp_
2. Token no ha expirado
3. Token tiene permisos para el proyecto
```

### Error: "Permission denied"

```
Verificar:
1. RLS esta habilitado en la tabla
2. La policy permite la operacion
3. El usuario tiene los permisos necesarios
```

### Error: "Table not found"

```
Verificar:
1. El schema es correcto (public, auth, storage)
2. La tabla existe
3. No hay typos en el nombre
```

---

## Recursos Adicionales

- [Supabase MCP Server - GitHub](https://github.com/supabase/mcp-server-supabase)
- [Supabase MCP Server - NPM](https://www.npmjs.com/package/@supabase/mcp-server-supabase)
- [Supabase Documentation](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Migrations Guide](https://supabase.com/docs/guides/database/migrations)

---

## Siguiente Paso

Para queries SQL avanzados:
--> [mcp-dbhub.md](./mcp-dbhub.md)

Para documentacion de librerias:
--> [../research-guide/mcp-context7.md](../research-guide/mcp-context7.md)
