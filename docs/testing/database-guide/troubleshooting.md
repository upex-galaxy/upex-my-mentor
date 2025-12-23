# Troubleshooting: Problemas Comunes con MCPs de Base de Datos y API

Esta guía documenta problemas reales encontrados durante la configuración de los MCPs y sus soluciones verificadas.

---

## Problemas de conexión a base de datos

### Error: `ENETUNREACH` con dirección IPv6

**Síntoma:**

```
Failed to connect to PostgreSQL database: Error: connect ENETUNREACH 2600:1f18:2e13:9d37:7429:2f13:d1ef:5476:5432
```

**Causa:** Tu red solo soporta IPv4, pero Supabase está intentando conectar via IPv6.

**Solución:** Usa el **Shared Pooler** de Supabase en lugar de la conexión directa.

| Tipo                 | Host                                 | Puerto |
| -------------------- | ------------------------------------ | ------ |
| ❌ Direct Connection | `db.<ref>.supabase.co`               | 5432   |
| ✅ Shared Pooler     | `aws-0-<region>.pooler.supabase.com` | 6543   |

**Cómo obtener el Shared Pooler:**

1. Supabase Dashboard → Project Settings → Database
2. Cambia **Method** de "Direct connection" a "Transaction" o "Session"
3. Copia el nuevo connection string

---

### Error: `bash: !@...: event not found`

**Síntoma:**

```bash
npx -y @bytebase/dbhub --dsn "postgresql://user:Password!@host..."
bash: !@host: event not found
```

**Causa:** Bash interpreta `!` como un comando de historial cuando usas comillas dobles.

**Solución:** Usa comillas **simples** en Bash:

```bash
# ❌ Incorrecto (comillas dobles)
npx -y @bytebase/dbhub --dsn "postgresql://user:Pass!@host/db"

# ✅ Correcto (comillas simples)
npx -y @bytebase/dbhub --dsn 'postgresql://user:Pass!@host/db'
```

**Alternativa:** Usa variables de entorno en la configuración JSON:

```json
{
  "env": {
    "DB_PASSWORD": "Password_Con_Caracteres!@#"
  }
}
```

---

### Error: `Password authentication failed`

**Causas posibles:**

1. **Contraseña incorrecta** - Verifica la contraseña en Supabase Dashboard
2. **Usuario no existe** - Verifica que creaste el usuario con el SQL correcto
3. **Formato de usuario incorrecto en Shared Pooler** - El formato debe ser `usuario.proyecto`

**Formato correcto para Shared Pooler:**

```
postgresql://qa_team.ionevzckjyxtpmyenbxc:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Nota:** El usuario es `qa_team.ionevzckjyxtpmyenbxc`, NO solo `qa_team`.

---

## Problemas específicos de Windows

### Error: `EPERM: operation not permitted, rmdir`

**Síntoma:**

```
npm warn cleanup Failed to remove some directories
npm warn cleanup [Error: EPERM: operation not permitted, rmdir 'C:\Users\...\node_modules\@azure\...']
```

**Causa:** npm tiene problemas de permisos al limpiar el caché en Windows.

**Soluciones (en orden de preferencia):**

#### Opción 1: Limpiar caché de npm

```powershell
# PowerShell como Administrador
npm cache clean --force
```

Luego intenta de nuevo el comando.

#### Opción 2: Eliminar carpeta de caché manualmente

1. Cerrar todas las terminales, VS Code, Cursor
2. Eliminar la carpeta: `C:\Users\<Usuario>\AppData\Local\npm-cache\_npx`
3. Volver a ejecutar el comando

#### Opción 3: Instalar globalmente

```powershell
npm install -g @bytebase/dbhub
dbhub --transport stdio --dsn "tu_connection_string"
```

---

### Error: `gyp ERR! find Python`

**Síntoma:**

```
gyp ERR! find Python You need to install the latest version of Python.
error: install script from "better-sqlite3" exited with 1
```

**Causa:** DBHub tiene una dependencia nativa (`better-sqlite3`) que requiere Python y Build Tools para compilar en Windows.

**Soluciones:**

#### Opción 1: Instalar dependencias de compilación

1. Instalar Python desde [python.org](https://www.python.org/downloads/)
   - ✅ Marcar "Add Python to PATH" durante instalación

2. Instalar Build Tools:

   ```powershell
   npm install -g windows-build-tools
   ```

3. Reiniciar terminal y probar de nuevo

#### Opción 2: Usar Docker (evita compilación)

```powershell
docker run --rm -it bytebase/dbhub --transport stdio --dsn "postgresql://user:pass@host:6543/postgres"
```

Configuración MCP con Docker:

```json
{
  "mcpServers": {
    "database": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "bytebase/dbhub",
        "--transport",
        "stdio",
        "--dsn",
        "postgresql://user:pass@host:6543/postgres"
      ]
    }
  }
}
```

#### Opción 3: Usar WSL (Windows Subsystem for Linux)

Si tienes WSL instalado, ejecuta desde ahí:

```bash
npx -y @bytebase/dbhub --transport stdio --dsn 'postgresql://user:pass@host:6543/postgres'
```

#### Opción 4: Usar Bun en lugar de npm

```powershell
# Instalar Bun
powershell -c "irm bun.sh/install.ps1 | iex"

# Ejecutar con bunx
bunx @bytebase/dbhub --transport stdio --dsn "postgresql://user:pass@host:6543/postgres"
```

---

### Diferencias entre terminales en Windows

| Terminal       | Comillas para DSN | Escape de `!` |
| -------------- | ----------------- | ------------- |
| **PowerShell** | Dobles `"..."`    | No necesario  |
| **CMD**        | Dobles `"..."`    | No necesario  |
| **Git Bash**   | Simples `'...'`   | O usar `\!`   |
| **WSL**        | Simples `'...'`   | O usar `\!`   |

---

## Problemas del MCP

### El MCP aparece como "failed" en Claude Code

**Pasos de diagnóstico:**

1. **Ver detalles del error:**

   ```bash
   claude mcp get <nombre-del-mcp>
   ```

2. **Probar el comando directamente:**
   Copia el comando del MCP y ejecútalo manualmente en terminal para ver el error real.

3. **Verificar que los argumentos estén completos:**
   ```bash
   claude mcp list
   ```
   Revisa que todos los args aparezcan correctamente.

### Falta `--transport stdio`

Si el MCP no funciona, verifica que incluiste `--transport stdio` en los argumentos:

```json
{
  "args": [
    "-y",
    "@bytebase/dbhub",
    "--transport",
    "stdio", // ← Requerido
    "--dsn",
    "..."
  ]
}
```

---

## Problemas de permisos de base de datos

### Error: `permission denied for table`

**Causa:** El usuario no tiene permisos sobre la tabla.

**Solución:** Ejecuta en Supabase SQL Editor:

```sql
-- Para usuario de solo lectura
GRANT SELECT ON ALL TABLES IN SCHEMA public TO tu_usuario;

-- Para usuario con permisos DML
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tu_usuario;
```

### Error: `permission denied for sequence`

**Causa:** Falta permiso para secuencias (necesario para INSERT con IDs auto-incrementales).

**Solución:**

```sql
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tu_usuario;
```

---

## Verificación rápida de conexión

### Probar conexión a Supabase manualmente

```bash
# Con psql (si lo tienes instalado)
psql "postgresql://qa_team.proyecto:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Con curl (verificar que el host responde)
curl -I "https://proyecto.supabase.co/rest/v1/" -H "apikey: TU_ANON_KEY"
```

### Probar el MCP directamente

```bash
# DBHub
npx -y @bytebase/dbhub --transport stdio --dsn 'tu_connection_string'

# OpenAPI MCP (verificar que carga el esquema)
curl "https://proyecto.supabase.co/rest/v1/?apikey=TU_ANON_KEY"
```

---

## Checklist de troubleshooting

- [ ] ¿Estás usando el **Shared Pooler** (puerto 6543)?
- [ ] ¿El formato del usuario es `usuario.proyecto` para el pooler?
- [ ] ¿Usaste comillas **simples** en Bash?
- [ ] ¿Incluiste `--transport stdio` en DBHub?
- [ ] ¿El usuario tiene los permisos necesarios en la DB?
- [ ] ¿Probaste el comando directamente en terminal?
- [ ] ¿Reiniciaste Claude Desktop/Cursor después de cambiar la config?
