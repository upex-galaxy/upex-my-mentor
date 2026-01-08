# API Testing con MCP (IA-Assisted)

Esta guia explica como usar los MCP servers configurados para realizar API testing asistido por IA.

---

## MCPs Disponibles para Testing

El proyecto puede tener configurados varios MCP servers para testing:

| MCP             | Paquete NPM                   | Proposito                    | Autenticacion                     |
| --------------- | ----------------------------- | ---------------------------- | --------------------------------- |
| `openapi` (api) | `@ivotoby/openapi-mcp-server` | REST API via OpenAPI spec    | `anon_key` en headers             |
| `dbhub` (sql)   | `@bytebase/dbhub`             | Queries SQL directos         | Rol `qa_team` con acceso completo |
| `postman`       | `@postman/postman-mcp-server` | Colecciones y environments   | Postman API Key                   |
| `supabase`      | `@supabase/mcp-server`        | Gestion de proyecto Supabase | Service role (admin)              |

---

## MCP: openapi (api)

> Paquete: `@ivotoby/openapi-mcp-server`

### Configuracion Tipica

```json
{
  "openapi": {
    "command": "npx",
    "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
    "env": {
      "API_BASE_URL": "{{SUPABASE_URL}}/rest/v1",
      "OPENAPI_SPEC_PATH": "{{SUPABASE_URL}}/rest/v1/?apikey={{SUPABASE_ANON_KEY}}",
      "API_HEADERS": "apikey:{{SUPABASE_ANON_KEY}}"
    }
  }
}
```

Ejemplo con valores reales:

```json
{
  "openapi": {
    "command": "npx",
    "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
    "env": {
      "API_BASE_URL": "https://abcdefghijklmnop.supabase.co/rest/v1",
      "OPENAPI_SPEC_PATH": "https://abcdefghijklmnop.supabase.co/rest/v1/?apikey=eyJ...",
      "API_HEADERS": "apikey:eyJ..."
    }
  }
}
```

### Herramientas Disponibles

Este MCP genera herramientas dinamicamente basadas en el schema OpenAPI:

| Tool                          | Descripcion                    |
| ----------------------------- | ------------------------------ |
| `mcp__openapi__get-users`     | GET /users                     |
| `mcp__openapi__post-users`    | POST /users                    |
| `mcp__openapi__patch-users`   | PATCH /users                   |
| `mcp__openapi__delete-users`  | DELETE /users                  |
| `mcp__openapi__get-products`  | GET /products                  |
| `mcp__openapi__post-products` | POST /products                 |
| `mcp__openapi__get-orders`    | GET /orders                    |
| `mcp__openapi__post-orders`   | POST /orders                   |
| ...                           | (una por cada tabla/operacion) |

### Limitacion Importante: Solo Anon Key

**El MCP `openapi` esta configurado con el `anon_key`, NO con un JWT de usuario.**

Esto significa:

- Puede leer datos publicos (productos, reviews publicas)
- No puede ejecutar operaciones autenticadas como un usuario especifico
- RLS policies de usuario no aplican (usa el contexto "anonimo")

### Casos de Uso Validos

```
# Pedirle a la IA:

"Lista todos los productos de la categoria electronics"
--> La IA usara mcp__openapi__get-products con filtro category=electronics

"Muestrame las reviews del producto con ID abc123"
--> La IA usara mcp__openapi__get-reviews con filtro product_id

"Cuantas ordenes hay con status pending?"
--> La IA usara mcp__openapi__get-orders con filtro de status
```

### Workaround: Autenticacion Manual

Para operaciones autenticadas, la IA puede guiarte pero NO ejecutar directamente:

```
Usuario: "Quiero crear una orden como el usuario Test"

IA: "Para crear una orden autenticada, necesitarias:

1. Obtener el JWT del usuario:
   POST /auth/v1/token?grant_type=password
   Body: { email: 'test.user@miproyecto.com', password: 'TestPassword123!' }

2. Usar ese token en el request:
   POST /rest/v1/orders
   Headers:
     apikey: <anon_key>
     Authorization: Bearer <jwt_del_paso_1>
   Body: { ... }

No puedo ejecutar esto directamente porque el MCP solo tiene el anon_key.
Puedes hacerlo en Postman o en el navegador."
```

---

## MCP: dbhub (sql)

> Paquete: `@bytebase/dbhub`

### Configuracion Tipica

```json
{
  "dbhub": {
    "command": "npx",
    "args": [
      "-y",
      "@bytebase/dbhub",
      "--transport",
      "stdio",
      "--dsn",
      "postgresql://{{DB_USER}}.{{PROJECT_REF}}:{{DB_PASSWORD}}@aws-0-{{REGION}}.pooler.supabase.com:6543/postgres"
    ]
  }
}
```

Ejemplo con valores reales:

```json
{
  "dbhub": {
    "command": "npx",
    "args": [
      "-y",
      "@bytebase/dbhub",
      "--transport",
      "stdio",
      "--dsn",
      "postgresql://qa_team.abcdefghijklmnop:mypassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
    ]
  }
}
```

### Ventaja: Rol `qa_team`

El MCP `dbhub` conecta con el rol `qa_team` que tiene **RLS bypassed** para testing:

```sql
-- El rol qa_team tiene policies como:
CREATE POLICY "QA team full access to orders"
ON orders FOR ALL
TO qa_team
USING (true);
```

### Herramientas Disponibles

| Tool                   | Descripcion                   |
| ---------------------- | ----------------------------- |
| `mcp__dbhub__query`    | Ejecutar SELECT queries       |
| `mcp__dbhub__execute`  | Ejecutar INSERT/UPDATE/DELETE |
| `mcp__dbhub__describe` | Describir tablas y schema     |

### Casos de Uso

```
# Pedirle a la IA:

"Muestrame todas las ordenes del sistema, sin importar el usuario"
--> SELECT * FROM orders ORDER BY created_at DESC LIMIT 20

"Cuantos usuarios hay por rol?"
--> SELECT role, COUNT(*) FROM users GROUP BY role

"Verifica que la orden abc123 tenga status 'paid'"
--> SELECT id, status FROM orders WHERE id = 'abc123'

"Inserta una orden de prueba para el usuario X"
--> INSERT INTO orders (user_id, status, ...) VALUES (...)
```

### Validacion de Datos

La IA puede ejecutar queries de validacion:

```sql
-- Verificar integridad referencial
SELECT o.id, o.user_id, u.name
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;  -- Ordenes con user_id invalido

-- Verificar constraints de negocio
SELECT * FROM reviews
WHERE rating < 1 OR rating > 5;  -- Ratings fuera de rango

-- Verificar estados validos
SELECT id, status FROM orders
WHERE status NOT IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
```

---

## MCP: Supabase (Admin)

### Herramientas Disponibles

| Tool                             | Descripcion                      |
| -------------------------------- | -------------------------------- |
| `mcp__supabase__execute_sql`     | Ejecutar SQL como service_role   |
| `mcp__supabase__list_tables`     | Listar tablas del proyecto       |
| `mcp__supabase__get_logs`        | Ver logs del proyecto            |
| `mcp__supabase__get_advisors`    | Ver recomendaciones de seguridad |
| `mcp__supabase__apply_migration` | Aplicar migraciones              |

### Casos de Uso para QA

```
# Verificar RLS policies
"Muestrame todas las RLS policies de la tabla orders"

# Verificar logs de errores
"Hay errores recientes en los logs de auth?"

# Verificar seguridad
"Ejecuta el advisor de seguridad y dime si hay problemas"

# Generar tipos TypeScript
"Genera los tipos TypeScript actualizados del schema"
```

---

## Flujos de Testing con IA

### Flujo 1: Verificar Datos de Prueba

```
Usuario: "Verifica que existan los usuarios de prueba en la base de datos"

IA ejecutara:
SELECT id, email, name, role
FROM users
WHERE email IN ('test.customer@miproyecto.com', 'test.admin@miproyecto.com');

Resultado: Tabla con los usuarios de prueba
```

### Flujo 2: Crear Datos de Prueba

```
Usuario: "Crea una orden de prueba para el usuario test.customer con 2 productos"

IA ejecutara:
1. Obtener ID del usuario test.customer
2. Obtener IDs de productos disponibles
3. INSERT INTO orders con los datos correctos
4. INSERT INTO order_items con los productos
5. Verificar que se creo correctamente
```

### Flujo 3: Validar RLS Policies

```
Usuario: "Verifica que la policy de orders funciona correctamente"

IA ejecutara:
1. Ver la policy actual
2. Explicar que deberia permitir/bloquear
3. Sugerir queries de verificacion
```

### Flujo 4: Investigar Bugs

```
Usuario: "El usuario X reporta que no puede ver sus ordenes. Investiga."

IA ejecutara:
1. Verificar que el usuario existe: SELECT * FROM users WHERE id = 'X'
2. Verificar sus ordenes: SELECT * FROM orders WHERE user_id = 'X'
3. Verificar la policy: SELECT * FROM pg_policies WHERE tablename = 'orders'
4. Identificar el problema y sugerir solucion
```

---

## Limitaciones Actuales

### 1. MCP openapi sin Autenticacion de Usuario

**Problema:** El MCP `openapi` solo tiene el `anon_key`, no puede simular usuarios especificos.

**Workaround actual:**

- Usar MCP `dbhub` con rol `qa_team` para operaciones que requieren bypass de RLS
- Usar Postman MCP o Postman app para testing con JWT de usuario real

**Solucion futura posible:**

```json
{
  "openapi-authenticated": {
    "command": "npx",
    "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
    "env": {
      "API_BASE_URL": "{{SUPABASE_URL}}/rest/v1",
      "API_HEADERS": "apikey:{{SUPABASE_ANON_KEY}},Authorization:Bearer {{USER_JWT}}"
    }
  }
}
```

El problema es que el JWT expira (1 hora por defecto), asi que habria que regenerarlo frecuentemente.

### 2. No Hay Refresh Automatico de Token

Para mantener un token valido, podrias:

1. Crear un script que obtenga un token fresco y actualice el MCP config
2. Usar tokens de larga duracion (no recomendado para produccion)
3. Usar el MCP `dbhub` que no tiene este problema
4. Usar el MCP `postman` que maneja environments con variables

### 3. MCP dbhub es Muy Poderoso

El rol `qa_team` puede hacer CUALQUIER operacion. Usalo con cuidado:

- SELECT para verificar datos
- INSERT de datos de prueba
- UPDATE con cuidado (puedes romper datos)
- DELETE con mucho cuidado

---

## Ejemplos Practicos

### Ejemplo 1: Verificar que un Producto Tiene Reviews

```
Usuario: "Verifica que el producto 'Laptop Pro' tenga al menos 3 reviews"

IA:
1. Buscar el producto:
   SELECT id, name FROM products WHERE name ILIKE '%Laptop Pro%'

2. Contar reviews:
   SELECT COUNT(*) FROM reviews WHERE product_id = '<id_encontrado>'

3. Verificar:
   "Laptop Pro tiene 5 reviews, cumple con el requisito de 3 minimo"
```

### Ejemplo 2: Crear Escenario de Prueba Completo

```
Usuario: "Crea un escenario de prueba con:
- Un usuario nuevo
- Una orden con 2 productos
- Una review de 4 estrellas"

IA ejecutara secuencialmente:
1. INSERT INTO users (usuario nuevo)
2. INSERT INTO orders (orden del usuario)
3. INSERT INTO order_items (2 items)
4. UPDATE orders SET status = 'delivered'
5. INSERT INTO reviews (review del usuario)
6. Verificar todo con SELECTs
```

### Ejemplo 3: Limpiar Datos de Prueba

```
Usuario: "Elimina todas las ordenes de prueba creadas hoy"

IA:
1. Verificar que se va a eliminar:
   SELECT * FROM orders WHERE created_at >= CURRENT_DATE AND status = 'pending'

2. Confirmar con el usuario

3. DELETE FROM orders WHERE created_at >= CURRENT_DATE AND status = 'pending'
```

---

## Mejores Practicas

### 1. Siempre Verificar Antes de Modificar

```
Usuario: "Elimina la orden abc123"

IA (correcto):
"Primero dejame verificar que orden es:
SELECT * FROM orders WHERE id = 'abc123'

Esta orden es del usuario X, status 'delivered', total $99.99.
Confirmas que quieres eliminarla?"
```

### 2. Usar Transacciones para Operaciones Multiples

```sql
BEGIN;
  INSERT INTO orders (...) VALUES (...);
  INSERT INTO order_items (...) VALUES (...);
  -- Verificar que todo este bien
  SELECT * FROM orders WHERE ...;
COMMIT;
-- O ROLLBACK si algo salio mal
```

### 3. Documentar Cambios

```
Usuario: "Actualiza el status de la orden X a 'delivered'"

IA:
"Ejecutando actualizacion...

Antes: { id: 'X', status: 'shipped', ... }
Despues: { id: 'X', status: 'delivered', ... }

Cambio registrado. Si necesitas revertir, ejecuta:
UPDATE orders SET status = 'shipped' WHERE id = 'X'"
```

---

## Flujos Combinados de MCPs

### Configuracion Completa: openapi + dbhub + postman

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
      "env": {
        "API_BASE_URL": "{{SUPABASE_URL}}/rest/v1",
        "OPENAPI_SPEC_PATH": "{{SUPABASE_URL}}/rest/v1/?apikey={{ANON_KEY}}",
        "API_HEADERS": "apikey:{{ANON_KEY}}"
      }
    },
    "dbhub": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--transport", "stdio"],
      "env": {
        "DB_TYPE": "postgres",
        "DB_HOST": "aws-0-{{REGION}}.pooler.supabase.com",
        "DB_PORT": "6543",
        "DB_USER": "qa_team.{{PROJECT_REF}}",
        "DB_PASSWORD": "${DB_PASSWORD}",
        "DB_NAME": "postgres"
      }
    },
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/mcp",
      "headers": { "Authorization": "Bearer ${POSTMAN_API_KEY}" }
    }
  }
}
```

### Cuando Usar Cada MCP

| MCP       | Usar para                                                  |
| --------- | ---------------------------------------------------------- |
| `openapi` | Exploracion rapida de endpoints, requests anonimos         |
| `dbhub`   | Preparar/verificar datos, bypass de RLS, queries complejos |
| `postman` | Tests con autenticacion, colecciones, flujos completos     |

### Flujo Combinado: Testing End-to-End

```
Usuario: "Prueba el flujo completo de crear una orden"

IA ejecuta:

1. [dbhub] Preparar datos:
   INSERT INTO products (...) -- producto de prueba
   INSERT INTO users (...) -- usuario de prueba si no existe

2. [postman] Ejecutar flujo autenticado:
   runCollection("Order Flow Tests", environment: "Development")
   - Login como usuario
   - Agregar producto al carrito
   - Crear orden
   - Verificar orden creada

3. [dbhub] Verificar en DB:
   SELECT * FROM orders WHERE user_id = 'xxx' ORDER BY created_at DESC LIMIT 1
   SELECT * FROM order_items WHERE order_id = 'orden_creada'
   -- Verificar triggers, totales, etc.

4. [dbhub] Limpiar:
   DELETE FROM order_items WHERE order_id = 'orden_creada'
   DELETE FROM orders WHERE id = 'orden_creada'
```

---

## Flujo Recomendado para Testing

1. **Preparar datos** (MCP `dbhub`):
   - Crear usuarios de prueba si no existen
   - Crear ordenes/productos necesarios

2. **Ejecutar tests de API** (MCP `postman` o Postman app):
   - Login como usuario especifico
   - Ejecutar operaciones autenticadas
   - Validar responses

3. **Verificar resultados** (MCP `dbhub`):
   - Confirmar que los datos se guardaron correctamente
   - Verificar side effects (triggers, etc.)

4. **Limpiar** (MCP `dbhub`):
   - Eliminar datos de prueba
   - Restaurar estado inicial si es necesario

---

## Siguiente Paso

Para testing automatizado con codigo:
--> [playwright-testing.md](./playwright-testing.md)
