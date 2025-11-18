## 📦 Actualizar prompts del template

### ⚙️ Setup inicial (una sola vez)

**1. Instalar GitHub CLI:**
```bash
# Mac
brew install gh

# Windows
winget install GitHub.cli

# Linux (Ubuntu/Debian)
sudo apt install gh
```

**2. Autenticarse en GitHub CLI:**
```bash
gh auth login
```

Selecciona:
- ✅ GitHub.com
- ✅ HTTPS
- ✅ Login with web browser
- ✅ Copia el código de 8 dígitos
- ✅ Pégalo en el navegador

**3. Verificar acceso al template de UPEX Galaxy:**
```bash
gh repo view upex-galaxy/ai-driven-project-starter
```

Si ves la info del repo → ✅ Todo listo!

**4. Agregar script al package.json:**

Abre tu `package.json` y agrega esta línea en la sección `"scripts"`:

```json
{
  "scripts": {
    "up:prompt": "node scripts/update-prompts.js"
  }
}
```

**5. Agregar `.backups` en tu `.gitignore` (recomendado):**

Abre tu archivo `.gitignore` y agrega esta línea en cualquier parte:

```
.backups
```

**¿Por qué?** Cada vez que actualices los prompts, el script genera un backup automático con timestamp (ej: `.backups/prompts-2024-11-13-101845/`). Estos backups son útiles para revertir cambios si algo sale mal, pero **no necesitas versionar cada backup en Git** ya que son copias temporales de trabajo.

Ignorar `.backups` ayuda a:
- 🧹 Mantener tu repo limpio de archivos temporales
- 🚀 Hacer commits más rápidos (menos archivos que revisar)
- 📦 Reducir el tamaño del repositorio a largo plazo

💡 **Nota:** Este paso no es crítico para el funcionamiento del script, es solo una buena práctica para mantener tu Git organizado.

---

### 🔄 Actualizar (cuando Ely anuncie cambios)
```bash
# con Bun:
bun up:prompt
```
```bash
# con pnpm:
pnpm run up:prompt
```

**Eso es todo.** Funciona igual en Mac, Windows y Linux.

---

### 📋 ¿Qué se actualiza?

✅ **Se actualizan:**
- `.prompts/` → Todos los prompts de las 13 fases (completo)
- `context-engineering.md` → Documentación de la arquitectura del template (nuevo o actualizado)
- `docs/` → Solo archivos del template:
  - `ai-driven-software-project-blueprint.md`
  - `kata-test-architecture.md`
  - `GITFLOW.md`
  - `AMBIENTES.md`
  - `mcp-config-*.md` (todos los archivos de MCP)
- `scripts/` → Solo los scripts de actualización:
  - `update-prompts.js`
  - `update-prompts.md`

❌ **NO se tocan (tu trabajo):**
- `.context/` → Toda tu documentación del proyecto
- `src/` → Tu código
- `.env` → Tus credenciales
- `node_modules/` → Tus dependencias
- `README.md` → Tu documentación personalizada del proyecto
- `docs/` → Cualquier archivo personalizado que hayas agregado
- `scripts/` → Cualquier otro script personalizado

**📦 Sistema de backups:**

Cada ejecución crea un **nuevo directorio** de backup con timestamp único:
- Formato: `.backups/prompts-YYYY-MM-DD-HHMMSS/`
- Ejemplo: `.backups/prompts-2024-11-13-101845/`
- Los backups **NO se sobreescriben**, se acumulan
- Útil para comparar versiones o revertir cambios

---

### 🆘 Troubleshooting

**Error: "gh: command not found"**
```bash
# Instala GitHub CLI según tu OS:
# Mac: brew install gh
# Windows: winget install GitHub.cli
# Linux: sudo apt install gh
```

**Error: "authentication required"**
```bash
gh auth login
# Sigue los pasos de autenticación
```

**Error: "repository not found"**
→ Verifica que Ely te dio acceso al repositorio privado de UPEX Galaxy
→ Contacta a Ely para que te agregue como colaborador

**Algo salió mal y quiero revertir los cambios**

Los backups están en `.backups/prompts-FECHA/`:
```bash
# Ver backups disponibles (ordenados por fecha)
ls -la .backups/

# Restaurar el último backup (reemplaza la fecha con la del backup que quieres)
cp -r .backups/prompts-2024-XX-XX-XXXXXX/.prompts .
cp .backups/prompts-2024-XX-XX-XXXXXX/context-engineering.md .
```

---

### 💡 Tips

- Ejecuta `update-prompts.js` (ya sea directamente con node o con un script con bun) cada vez que Ely anuncie actualizaciones en Slack
- El script **nunca toca** tu carpeta `.context/` donde está tu trabajo
- Si tienes dudas, revisa el CHANGELOG.md para ver qué cambió
- Los backups se guardan automáticamente, así que puedes probar sin miedo
