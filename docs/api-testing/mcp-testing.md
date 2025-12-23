# API Testing con MCP (IA-Assisted)

Esta guía explica cómo usar los MCP servers configurados para realizar API testing asistido por IA.

---

## MCPs Disponibles

El proyecto tiene configurados varios MCP servers para testing:

| MCP | Propósito | Autenticación |
|-----|-----------|---------------|
| `api` | REST API via OpenAPI spec | `anon_key` en headers |
| `sql` | Queries SQL directos | Rol `qa_team` con acceso completo |
| `supabase` | Gestión de proyecto Supabase | Service role (admin) |

---

## MCP: API (OpenAPI)

### Configuración

```json
{
  "api": {
    "command": "npx",
    "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
    "env": {
      "API_BASE_URL": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1",
      "OPENAPI_SPEC_PATH": "https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/?apikey=<ANON_KEY>",
      "API_HEADERS": "apikey:<ANON_KEY>"
    }
  }
}
```

### Herramientas Disponibles

Este MCP genera herramientas dinámicamente basadas en el schema OpenAPI:

| Tool | Descripción |
|------|-------------|
| `mcp__api__get-profiles` | GET /profiles |
| `mcp__api__post-profiles` | POST /profiles |
| `mcp__api__patch-profiles` | PATCH /profiles |
| `mcp__api__delete-profiles` | DELETE /profiles |
| `mcp__api__get-bookings` | GET /bookings |
| `mcp__api__post-bookings` | POST /bookings |
| `mcp__api__get-reviews` | GET /reviews |
| `mcp__api__post-reviews` | POST /reviews |
| ... | (una por cada tabla/operación) |

### Limitación Importante: Solo Anon Key

**El MCP `api` está configurado con el `anon_key`, NO con un JWT de usuario.**

Esto significa:
- ✅ Puede leer datos públicos (mentores, reviews)
- ❌ No puede ejecutar operaciones autenticadas como un usuario específico
- ❌ RLS policies de usuario no aplican (usa el contexto "anónimo")

### Casos de Uso Válidos

```
# Pedirle a la IA:

"Lista todos los mentores disponibles"
→ La IA usará mcp__api__get-profiles con filtro role=mentor

"Muéstrame las reviews del mentor con ID abc123"
→ La IA usará mcp__api__get-reviews con filtro mentor_id

"¿Cuántas sesiones hay programadas para mañana?"
→ La IA usará mcp__api__get-bookings con filtro de fecha
```

### Workaround: Autenticación Manual

Para operaciones autenticadas, la IA puede guiarte pero NO ejecutar directamente:

```
Usuario: "Quiero crear un booking como el estudiante Alex"

IA: "Para crear un booking autenticado, necesitarías:

1. Obtener el JWT del usuario:
   POST /auth/v1/token?grant_type=password
   Body: { email: 'student.demo@upexmymentor.com', password: 'Demo123!' }

2. Usar ese token en el request:
   POST /rest/v1/bookings
   Headers:
     apikey: <anon_key>
     Authorization: Bearer <jwt_del_paso_1>
   Body: { ... }

No puedo ejecutar esto directamente porque el MCP solo tiene el anon_key.
Puedes hacerlo en Postman o en el navegador."
```

---

## MCP: SQL (Database Hub)

### Configuración

```json
{
  "sql": {
    "command": "npx",
    "args": [
      "-y", "@bytebase/dbhub",
      "--transport", "stdio",
      "--dsn", "postgresql://qa_team.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
    ]
  }
}
```

### Ventaja: Rol `qa_team`

Este MCP conecta con el rol `qa_team` que tiene **RLS bypassed** para testing:

```sql
-- El rol qa_team tiene policies como:
CREATE POLICY "QA team full access to bookings"
ON bookings FOR ALL
TO qa_team
USING (true);
```

### Herramientas Disponibles

| Tool | Descripción |
|------|-------------|
| `mcp__sql__query` | Ejecutar SELECT queries |
| `mcp__sql__execute` | Ejecutar INSERT/UPDATE/DELETE |
| `mcp__sql__describe` | Describir tablas y schema |

### Casos de Uso

```
# Pedirle a la IA:

"Muéstrame todos los bookings del sistema, sin importar el usuario"
→ SELECT * FROM bookings ORDER BY created_at DESC LIMIT 20

"¿Cuántos usuarios hay por rol?"
→ SELECT role, COUNT(*) FROM profiles GROUP BY role

"Verifica que el booking abc123 tenga status 'confirmed'"
→ SELECT id, status FROM bookings WHERE id = 'abc123'

"Inserta un booking de prueba para el estudiante X con el mentor Y"
→ INSERT INTO bookings (student_id, mentor_id, ...) VALUES (...)
```

### Validación de Datos

La IA puede ejecutar queries de validación:

```sql
-- Verificar integridad referencial
SELECT b.id, b.student_id, p.name
FROM bookings b
LEFT JOIN profiles p ON b.student_id = p.id
WHERE p.id IS NULL;  -- Bookings con student_id inválido

-- Verificar constraints de negocio
SELECT * FROM reviews
WHERE rating < 1 OR rating > 5;  -- Ratings fuera de rango

-- Verificar estados válidos
SELECT id, status FROM bookings
WHERE status NOT IN ('provisional', 'pending_payment', 'confirmed', 'completed', 'cancelled');
```

---

## MCP: Supabase (Admin)

### Herramientas Disponibles

| Tool | Descripción |
|------|-------------|
| `mcp__supabase__execute_sql` | Ejecutar SQL como service_role |
| `mcp__supabase__list_tables` | Listar tablas del proyecto |
| `mcp__supabase__get_logs` | Ver logs del proyecto |
| `mcp__supabase__get_advisors` | Ver recomendaciones de seguridad |
| `mcp__supabase__apply_migration` | Aplicar migraciones |

### Casos de Uso para QA

```
# Verificar RLS policies
"Muéstrame todas las RLS policies de la tabla bookings"

# Verificar logs de errores
"¿Hay errores recientes en los logs de auth?"

# Verificar seguridad
"Ejecuta el advisor de seguridad y dime si hay problemas"

# Generar tipos TypeScript
"Genera los tipos TypeScript actualizados del schema"
```

---

## Flujos de Testing con IA

### Flujo 1: Verificar Datos de Prueba

```
Usuario: "Verifica que existan los usuarios demo en la base de datos"

IA ejecutará:
SELECT id, email, name, role
FROM profiles
WHERE email IN ('mentor.demo@upexmymentor.com', 'student.demo@upexmymentor.com');

Resultado: Tabla con los usuarios demo
```

### Flujo 2: Crear Datos de Prueba

```
Usuario: "Crea un booking de prueba entre el estudiante demo y el mentor demo para mañana a las 3pm"

IA ejecutará:
1. Obtener IDs de los usuarios demo
2. INSERT INTO bookings con los datos correctos
3. Verificar que se creó correctamente
```

### Flujo 3: Validar RLS Policies

```
Usuario: "Verifica que la policy de bookings funciona correctamente"

IA ejecutará:
1. Ver la policy actual
2. Explicar qué debería permitir/bloquear
3. Sugerir queries de verificación
```

### Flujo 4: Investigar Bugs

```
Usuario: "El usuario X reporta que no puede ver sus bookings. Investiga."

IA ejecutará:
1. Verificar que el usuario existe: SELECT * FROM profiles WHERE id = 'X'
2. Verificar sus bookings: SELECT * FROM bookings WHERE student_id = 'X' OR mentor_id = 'X'
3. Verificar la policy: SELECT * FROM pg_policies WHERE tablename = 'bookings'
4. Identificar el problema y sugerir solución
```

---

## Limitaciones Actuales

### 1. MCP API sin Autenticación de Usuario

**Problema:** El MCP `api` solo tiene el `anon_key`, no puede simular usuarios específicos.

**Workaround actual:**
- Usar MCP `sql` con rol `qa_team` para operaciones que requieren bypass de RLS
- Usar Postman/DevTools para testing con JWT de usuario real

**Solución futura posible:**
```json
{
  "api-authenticated": {
    "command": "npx",
    "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
    "env": {
      "API_BASE_URL": "https://xxx.supabase.co/rest/v1",
      "API_HEADERS": "apikey:<ANON_KEY>,Authorization:Bearer <USER_JWT>"
    }
  }
}
```

El problema es que el JWT expira (1 hora por defecto), así que habría que regenerarlo frecuentemente.

### 2. No Hay Refresh Automático de Token

Para mantener un token válido, podrías:

1. Crear un script que obtenga un token fresco y actualice el MCP config
2. Usar tokens de larga duración (no recomendado para producción)
3. Usar el MCP `sql` que no tiene este problema

### 3. MCP SQL es Muy Poderoso

El rol `qa_team` puede hacer CUALQUIER operación. Úsalo con cuidado:

- ✅ SELECT para verificar datos
- ✅ INSERT de datos de prueba
- ⚠️ UPDATE con cuidado (puedes romper datos)
- ⚠️ DELETE con mucho cuidado

---

## Ejemplos Prácticos

### Ejemplo 1: Verificar que un Mentor Tiene Reviews

```
Usuario: "Verifica que el mentor 'Laura Martínez' tenga al menos 3 reviews"

IA:
1. Buscar el mentor:
   SELECT id, name FROM profiles WHERE name ILIKE '%Laura%' AND role = 'mentor'

2. Contar reviews:
   SELECT COUNT(*) FROM reviews WHERE mentor_id = '<id_encontrado>'

3. Verificar:
   "Laura Martínez tiene 5 reviews, cumple con el requisito de 3 mínimo ✅"
```

### Ejemplo 2: Crear Escenario de Prueba Completo

```
Usuario: "Crea un escenario de prueba con:
- Un estudiante nuevo
- Un booking con el mentor demo
- Una review de 4 estrellas"

IA ejecutará secuencialmente:
1. INSERT INTO profiles (usuario nuevo)
2. INSERT INTO bookings (booking del estudiante con mentor)
3. UPDATE bookings SET status = 'completed'
4. INSERT INTO reviews (review del estudiante)
5. Verificar todo con SELECTs
```

### Ejemplo 3: Limpiar Datos de Prueba

```
Usuario: "Elimina todos los bookings de prueba creados hoy"

IA:
1. Verificar qué se va a eliminar:
   SELECT * FROM bookings WHERE created_at >= CURRENT_DATE AND status = 'provisional'

2. Confirmar con el usuario

3. DELETE FROM bookings WHERE created_at >= CURRENT_DATE AND status = 'provisional'
```

---

## Mejores Prácticas

### 1. Siempre Verificar Antes de Modificar

```
Usuario: "Elimina el booking abc123"

IA (correcto):
"Primero déjame verificar qué booking es:
SELECT * FROM bookings WHERE id = 'abc123'

Este booking es del estudiante X con el mentor Y, status 'confirmed'.
¿Confirmas que quieres eliminarlo?"
```

### 2. Usar Transacciones para Operaciones Múltiples

```sql
BEGIN;
  INSERT INTO bookings (...) VALUES (...);
  INSERT INTO transactions (...) VALUES (...);
  -- Verificar que todo esté bien
  SELECT * FROM bookings WHERE ...;
COMMIT;
-- O ROLLBACK si algo salió mal
```

### 3. Documentar Cambios

```
Usuario: "Actualiza el status del booking X a 'completed'"

IA:
"Ejecutando actualización...

Antes: { id: 'X', status: 'confirmed', ... }
Después: { id: 'X', status: 'completed', ... }

Cambio registrado. Si necesitas revertir, ejecuta:
UPDATE bookings SET status = 'confirmed' WHERE id = 'X'"
```

---

## Flujo Recomendado para Testing

1. **Preparar datos** (MCP sql):
   - Crear usuarios de prueba si no existen
   - Crear bookings/reviews necesarios

2. **Ejecutar tests de API** (Postman o DevTools):
   - Login como usuario específico
   - Ejecutar operaciones autenticadas
   - Validar responses

3. **Verificar resultados** (MCP sql):
   - Confirmar que los datos se guardaron correctamente
   - Verificar side effects (triggers, etc.)

4. **Limpiar** (MCP sql):
   - Eliminar datos de prueba
   - Restaurar estado inicial si es necesario

---

## Siguiente Paso

Para testing automatizado con código:
→ [Playwright Testing](./playwright-testing.md)
