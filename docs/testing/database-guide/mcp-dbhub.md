# Configuración de dbhub MCP para Testing de Base de Datos

## ¿Qué es dbhub?

**dbhub** (`@bytebase/dbhub`) es un MCP (Model Context Protocol) que permite conectar herramientas de IA como Claude a bases de datos PostgreSQL, MySQL, SQLite y otras. Con esto, puedes pedirle a Claude que ejecute queries SQL directamente.

---

## Requisitos previos

- **Node.js 18+** instalado
- Acceso a una base de datos PostgreSQL (en este caso, Supabase)
- Credenciales de conexión

---

## Paso 1: Obtener el Connection String de Supabase

### ⚠️ Importante: IPv4 vs IPv6

Supabase tiene dos tipos de conexión:

| Tipo                  | Puerto | Compatibilidad                            |
| --------------------- | ------ | ----------------------------------------- |
| **Direct Connection** | 5432   | Puede usar IPv6 (falla en algunas redes)  |
| **Shared Pooler**     | 6543   | Usa IPv4 ✅ (funciona en todas las redes) |

**Recomendación:** Usa siempre el **Shared Pooler** para evitar problemas de conectividad.

### Cómo obtener el connection string correcto

1. Ve a tu proyecto en **Supabase Dashboard**
2. Ve a **Project Settings** → **Database**
3. En la sección **Connection string**, cambia el **Method** a **Transaction** o **Session**
4. Copia el connection string del **Shared Pooler**

El formato será:

```
postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres
```

**Ejemplo real:**

```
postgresql://postgres.ionevzckjyxtpmyenbxc:TuPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Paso 2: Crear un usuario con permisos limitados (Recomendado)

En lugar de usar el usuario `postgres` (que tiene acceso total), crea un usuario específico para testing.

### Opción A: Usuario solo lectura (SELECT)

Ejecuta esto en el **SQL Editor** de Supabase:

```sql
-- Crear usuario de solo lectura
CREATE USER qa_readonly WITH PASSWORD 'Password_Seguro_123';

-- Permitir conexión
GRANT CONNECT ON DATABASE postgres TO qa_readonly;

-- Permisos de lectura en schema public
GRANT USAGE ON SCHEMA public TO qa_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO qa_readonly;

-- Para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO qa_readonly;
```

### Opción B: Usuario con permisos DML (SELECT, INSERT, UPDATE, DELETE)

```sql
-- Crear usuario con permisos DML (sin poder modificar estructura)
CREATE USER qa_team WITH PASSWORD 'Password_Seguro_123';

-- Permitir conexión
GRANT CONNECT ON DATABASE postgres TO qa_team;

-- Permisos DML en schema public
GRANT USAGE ON SCHEMA public TO qa_team;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO qa_team;

-- Para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO qa_team;

-- Permitir uso de secuencias (necesario para INSERT con IDs auto-incrementales)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO qa_team;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO qa_team;
```

### El connection string con tu usuario personalizado

**Formato en Shared Pooler:** El usuario debe tener el formato `usuario.proyecto`

```
postgresql://qa_team.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres
```

**Ejemplo:**

```
postgresql://qa_team.ionevzckjyxtpmyenbxc:Password_Seguro_123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Paso 3: Verificar la conexión

Antes de configurar el MCP, verifica que el connection string funciona.

### En Linux/macOS (Bash):

```bash
# Usar comillas SIMPLES para evitar problemas con caracteres especiales
npx -y @bytebase/dbhub --transport stdio --dsn 'postgresql://qa_team.ionevzckjyxtpmyenbxc:Password_Seguro_123@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
```

### En Windows (PowerShell):

```powershell
# Usar comillas DOBLES en PowerShell
npx -y @bytebase/dbhub --transport stdio --dsn "postgresql://qa_team.ionevzckjyxtpmyenbxc:Password_Seguro_123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

**Si conecta exitosamente, verás:**

```
Configuration source: command line argument
Connecting to 1 database source(s)...
  - default: postgresql://qa_team:*******@aws-0-us-east-1.pooler.supabase.com:6543/postgres
Connected successfully!
DBHub MCP Server running on stdio
```

---

## Paso 4: Configurar el MCP

### Claude Code (CLI)

```bash
claude mcp add-json "dbhub" '{"command":"npx","args":["-y","@bytebase/dbhub","--transport","stdio","--dsn","postgresql://qa_team.ionevzckjyxtpmyenbxc:Password_Seguro_123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"]}'
```

### Claude Desktop

Archivo de configuración:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dbhub": {
      "command": "npx",
      "args": [
        "-y",
        "@bytebase/dbhub",
        "--transport",
        "stdio",
        "--dsn",
        "postgresql://qa_team.ionevzckjyxtpmyenbxc:Password_Seguro_123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

### Cursor IDE

Archivo: `~/.cursor/mcp.json` (global) o `.cursor/mcp.json` (por proyecto)

```json
{
  "mcpServers": {
    "dbhub": {
      "command": "npx",
      "args": [
        "-y",
        "@bytebase/dbhub",
        "--transport",
        "stdio",
        "--dsn",
        "postgresql://qa_team.ionevzckjyxtpmyenbxc:Password_Seguro_123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

### VS Code (GitHub Copilot)

Archivo: `.vscode/mcp.json`

```json
{
  "servers": {
    "dbhub": {
      "command": "npx",
      "args": [
        "-y",
        "@bytebase/dbhub",
        "--transport",
        "stdio",
        "--dsn",
        "postgresql://qa_team.ionevzckjyxtpmyenbxc:Password_Seguro_123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

---

## Paso 5: Configuración con variables de entorno (más seguro)

Si tu contraseña tiene caracteres especiales (`!`, `@`, `#`, etc.), usa variables de entorno:

```json
{
  "mcpServers": {
    "dbhub": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--transport", "stdio"],
      "env": {
        "DB_TYPE": "postgres",
        "DB_HOST": "aws-0-us-east-1.pooler.supabase.com",
        "DB_PORT": "6543",
        "DB_USER": "qa_team.ionevzckjyxtpmyenbxc",
        "DB_PASSWORD": "Password_Con_Caracteres!@#",
        "DB_NAME": "postgres"
      }
    }
  }
}
```

---

## Opciones adicionales de DBHub

| Parámetro           | Descripción                                       |
| ------------------- | ------------------------------------------------- |
| `--readonly`        | Solo permite SELECT. Bloquea INSERT/UPDATE/DELETE |
| `--max-rows 1000`   | Limita el número de filas retornadas              |
| `--transport stdio` | Comunicación estándar (requerido)                 |

### Ejemplo con modo read-only y límite de filas:

```json
{
  "mcpServers": {
    "dbhub": {
      "command": "npx",
      "args": [
        "-y",
        "@bytebase/dbhub",
        "--transport",
        "stdio",
        "--readonly",
        "--max-rows",
        "500",
        "--dsn",
        "postgresql://qa_team.ionevzckjyxtpmyenbxc:Password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

---

## Herramientas MCP disponibles

Una vez configurado, tendrás acceso a estas herramientas:

| Herramienta            | Función                                     |
| ---------------------- | ------------------------------------------- |
| `mcp__dbhub__query`    | Ejecutar SELECT queries                     |
| `mcp__dbhub__execute`  | Ejecutar INSERT/UPDATE/DELETE               |
| `mcp__dbhub__describe` | Explorar schemas, tablas, columnas, índices |

### Ejemplos de uso en conversación:

- _"Muéstrame todas las tablas de la base de datos"_
- _"Ejecuta un SELECT de los últimos 10 usuarios registrados"_
- _"Describe la estructura de la tabla orders"_
- _"¿Cuántos registros hay en la tabla products?"_

---

## Protecciones en capas

| Capa                   | Qué protege  | Cómo                                          |
| ---------------------- | ------------ | --------------------------------------------- |
| **Usuario Postgres**   | Schema (DDL) | `qa_team` no puede CREATE/ALTER/DROP tablas   |
| **dbhub `--readonly`** | Datos (DML)  | Bloquea INSERT/UPDATE/DELETE (opcional)       |
| **dbhub `--max-rows`** | Performance  | Evita queries que devuelvan millones de filas |

---

## Verificar que el MCP funciona

### En Claude Code:

```bash
claude mcp list        # Ver servidores configurados
claude mcp get dbhub   # Ver detalles del servidor
```

### En Cursor:

Ve a **Settings** → **Tools & Integrations** → **MCP** y verifica que aparezca "dbhub" con estado activo.

---

## Referencias

- [DBHub en npm](https://www.npmjs.com/package/@bytebase/dbhub)
- [DBHub en GitHub](https://github.com/bytebase/dbhub)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
