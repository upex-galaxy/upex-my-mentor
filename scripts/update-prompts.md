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

---

### 🔄 Actualizar (cuando Ely anuncie cambios)
```bash
# con Bun:
bun update-prompts
```
```bash
# con pnpm:
pnpm run up:prompt
```

**Eso es todo.** Funciona igual en Mac, Windows y Linux.

---

### 📋 ¿Qué se actualiza?

✅ **Se actualizan:**
- `.prompts/` → Todos los prompts de las 13 fases
- `README.md` → Documentación principal
- `docs/` → Blueprints y arquitectura
- `scripts/` → Scripts de utilidad

❌ **NO se tocan (tu trabajo):**
- `.context/` → Toda tu documentación del proyecto
- `src/` → Tu código
- `.env` / `.env.local` → Tus credenciales
- `node_modules/` → Tus dependencias

Cada actualización crea un backup automático en `.backups/`.

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

**Error: "Cannot find module 'fs-extra'"**
```bash
# Instala las dependencias del proyecto con bun o pnpm
bun install
```

**Algo salió mal y quiero revertir los cambios**

Los backups están en `.backups/prompts-FECHA/`:
```bash
# Ver backups disponibles
ls -la .backups/

# Restaurar el último backup
cp -r .backups/prompts-2024-XX-XX-XXXXXX/.prompts .
cp .backups/prompts-2024-XX-XX-XXXXXX/README.md .
```

---

### 💡 Tips

- Ejecuta `bun update-prompts` cada vez que Ely anuncie actualizaciones en Discord/Slack
- El script **nunca toca** tu carpeta `.context/` donde está tu trabajo
- Si tienes dudas, revisa el CHANGELOG.md para ver qué cambió
- Los backups se guardan automáticamente, así que puedes probar sin miedo
