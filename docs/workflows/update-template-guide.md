# Actualizar Template - Guia de Uso

Esta guia explica como usar el script `update-template.js` para mantener tu proyecto sincronizado con el template de UPEX.

---

## Setup Inicial (una sola vez)

### 1. Instalar GitHub CLI

```bash
# Mac
brew install gh

# Windows
winget install GitHub.cli

# Linux (Ubuntu/Debian)
sudo apt install gh
```

### 2. Autenticarse en GitHub CLI

```bash
gh auth login
```

Selecciona:

- GitHub.com
- HTTPS
- Login with web browser
- Copia el codigo de 8 digitos
- Pegalo en el navegador

### 3. Verificar acceso al template

```bash
gh repo view upex-galaxy/ai-driven-project-starter
```

Si ves la info del repo, todo listo.

### 4. Instalar dependencias

```bash
bun install
```

### 5. Agregar script al package.json

```json
{
  "scripts": {
    "up": "bun scripts/update-template.js"
  }
}
```

### 6. Agregar .backups al .gitignore

```
.backups
```

---

## Uso del Script

### Menu Interactivo (recomendado)

```bash
bun up
```

Abre un menu donde puedes seleccionar que actualizar:

- Todo (all)
- Prompts (.prompts/)
- Books (.books/) - Manuales para humanos
- Documentacion (docs/)
- Context (.context/)
- Templates MCP (templates/mcp/)
- Scripts de actualizacion

### Comandos Directos

```bash
bun up all                    # Actualiza todo
bun up prompts                # Menu para elegir fases
bun up books                  # Manuales (.books/)
bun up docs                   # Actualiza docs/
bun up context                # Actualiza .context/
bun up templates              # Actualiza templates/mcp/
bun up scripts                # Actualiza scripts
bun up help                   # Muestra ayuda
```

### Multiples Componentes

```bash
bun up prompts docs context   # Actualiza los 3 componentes
```

---

## Opciones para Prompts

Cuando usas `bun up prompts`, puedes especificar que fases actualizar:

### Por Rol (presets)

```bash
bun up prompts --rol qa       # Fases 5, 10, 11, 12 (Testing)
bun up prompts --rol qa-full  # Fases 4, 5, 10, 11, 12 (Testing + Specification)
bun up prompts --rol dev      # Fases 6, 7, 8 (Desarrollo)
bun up prompts --rol devops   # Fases 3, 9, 13, 14 (Infraestructura)
bun up prompts --rol po       # Fases 1, 2, 4 (Producto)
bun up prompts --rol setup    # Fases 1, 2, 3 (Setup inicial)
```

### Por Fases Especificas

```bash
bun up prompts --fase 5       # Solo fase 5
bun up prompts --fase 5,10,12 # Fases 5, 10 y 12
```

### Otras Opciones

```bash
bun up prompts --all          # Todas las fases (1-14) + standalone
bun up prompts --standalone   # Solo archivos standalone (git-flow, workflows)
```

---

## Roles Disponibles

| Rol       | Fases            | Descripcion                                        |
| --------- | ---------------- | -------------------------------------------------- |
| `qa`      | 5, 10, 11, 12    | Shift-Left, Exploratory, Documentation, Automation |
| `qa-full` | 4, 5, 10, 11, 12 | QA + Specification (contexto de negocio)           |
| `dev`     | 6, 7, 8          | Planning, Implementation, Code Review              |
| `devops`  | 3, 9, 13, 14     | Infrastructure, Staging, Production, Monitoring    |
| `po`      | 1, 2, 4          | Constitution, Architecture, Specification          |
| `setup`   | 1, 2, 3          | Fases sincronicas iniciales                        |

---

## Merge Inteligente

El script usa **merge inteligente**:

- **Solo actualiza archivos del template** - Si un archivo existe en el template, se actualiza
- **Preserva tus archivos** - Si creaste archivos/carpetas propios, no se tocan
- **No elimina nada** - Solo agrega o actualiza, nunca borra

### Ejemplo

Si tienes en `docs/testing/`:

```
docs/testing/
├── api/                 # Del template - SE ACTUALIZA
├── database/            # Del template - SE ACTUALIZA
├── automation/          # Del template - SE ACTUALIZA
├── mi-guia-custom.md    # Tuyo - NO SE TOCA
└── mis-tests/           # Tuyo - NO SE TOCA
```

---

## Que se Actualiza

### Se actualizan (merge)

| Componente               | Contenido                                                    |
| ------------------------ | ------------------------------------------------------------ |
| `.prompts/`              | Fases seleccionadas + archivos standalone                    |
| `.books/`                | Manuales para humanos (mismas fases que prompts)             |
| `docs/`                  | architectures/, methodology/, testing/, workflows/, setup/   |
| `.context/`              | system-prompt.md, README.md, guidelines/ (DEV, QA, TAE, MCP) |
| `templates/mcp/`         | Todos los templates de configuracion MCP                     |
| `scripts/`               | update-template.js, mcp-builder.js, email-checker.js         |
| `context-engineering.md` | Documentacion de la arquitectura del template                |

### NO se tocan (tu trabajo)

| Directorio       | Descripcion                                |
| ---------------- | ------------------------------------------ |
| `.context/idea/` | Tu documentacion de negocio                |
| `.context/PRD/`  | Tus requerimientos de producto             |
| `.context/SRS/`  | Tus especificaciones tecnicas              |
| `.context/PBI/`  | Tu product backlog                         |
| `src/`           | Tu codigo                                  |
| `.env`           | Tus credenciales                           |
| Archivos propios | Cualquier archivo/carpeta que hayas creado |

---

## Sistema de Backups

Cada ejecucion crea un backup automatico:

- Formato: `.backups/update-YYYY-MM-DD-HHMMSS/`
- Los backups NO se sobrescriben, se acumulan
- Util para comparar versiones o revertir cambios

### Restaurar un Backup

```bash
# Ver backups disponibles
ls -la .backups/

# Restaurar (reemplaza la fecha)
cp -r .backups/update-2026-XX-XX-XXXXXX/.prompts .
cp -r .backups/update-2026-XX-XX-XXXXXX/.books .
cp -r .backups/update-2026-XX-XX-XXXXXX/docs .
cp -r .backups/update-2026-XX-XX-XXXXXX/.context .
```

---

## Troubleshooting

### "gh: command not found"

```bash
# Instala GitHub CLI segun tu OS
brew install gh        # Mac
winget install GitHub.cli  # Windows
sudo apt install gh    # Linux
```

### "authentication required"

```bash
gh auth login
```

### "repository not found"

Verifica que tienes acceso al repositorio privado de UPEX Galaxy.

### "Cannot find module '@inquirer/prompts'"

```bash
bun install
# O especificamente:
bun add @inquirer/prompts
```

---

## Tips

- Usa `bun up` sin argumentos para el menu interactivo
- El script **preserva tus archivos personalizados**
- Los backups se guardan automaticamente
- Usa `bun up help` para ver todas las opciones

---

**Ver tambien:**

- [Git Flow](./git-flow.md)
- [Environments](./environments.md)
