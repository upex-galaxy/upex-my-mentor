const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const TEMPLATE_REPO = "upex-galaxy/ai-driven-project-starter";
const TEMP_DIR = path.join(os.tmpdir(), "aicode-template-update");

// Colores para terminal (funciona en todos los OS)
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: "ignore" });
    return true;
  } catch {
    log(`❌ ${name} no está instalado`, "red");
    return false;
  }
}

async function main() {
  log("🚀 Actualizando prompts desde el template oficial...", "green");

  // Verificar GitHub CLI
  if (!checkCommand("gh", "GitHub CLI (gh)")) {
    console.log("\nInstálalo con:");
    if (process.platform === "darwin") {
      console.log("  brew install gh");
    } else if (process.platform === "win32") {
      console.log("  winget install GitHub.cli");
    } else {
      console.log("  sudo apt install gh  # Ubuntu/Debian");
      console.log("  O visita: https://cli.github.com/");
    }
    process.exit(1);
  }

  // Verificar autenticación
  try {
    execSync("gh auth status", { stdio: "ignore" });
  } catch {
    log("⚠️  No estás autenticado en GitHub CLI", "yellow");
    console.log("Ejecuta: gh auth login");
    process.exit(1);
  }

  // Crear backup
  log("📦 Creando backup...", "yellow");
  const timestamp =
    new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
    "-" +
    new Date().toTimeString().split(" ")[0].replace(/:/g, "");
  const backupDir = path.join(".backups", `prompts-${timestamp}`);

  fs.mkdirSync(backupDir, { recursive: true });

  if (fs.existsSync(".prompts")) {
    fs.cpSync(".prompts", path.join(backupDir, ".prompts"), {
      recursive: true,
    });
  }
  if (fs.existsSync("context-engineering.md")) {
    fs.cpSync(
      "context-engineering.md",
      path.join(backupDir, "context-engineering.md")
    );
  }

  log(`✅ Backup guardado en: ${backupDir}`, "green");

  // Clonar template
  log("📥 Descargando última versión del template...", "yellow");
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  try {
    execSync(`gh repo clone ${TEMPLATE_REPO} "${TEMP_DIR}" -- --depth 1`, {
      stdio: "inherit",
    });
  } catch (error) {
    log("❌ Error al descargar el template", "red");
    console.log(
      "Verifica que tienes acceso al repositorio privado de UPEX Galaxy"
    );
    process.exit(1);
  }

  // Actualizar .prompts/
  log("📝 Actualizando directorio .prompts/...", "yellow");
  fs.rmSync(".prompts", { recursive: true, force: true });
  fs.cpSync(path.join(TEMP_DIR, ".prompts"), ".prompts", { recursive: true });

  // Copiar README.md del template como context-engineering.md
  const templateReadmePath = path.join(TEMP_DIR, "README.md");
  if (fs.existsSync(templateReadmePath)) {
    log(
      "📄 Actualizando context-engineering.md (desde README.md del template)...",
      "yellow"
    );
    fs.cpSync(templateReadmePath, "context-engineering.md");
  }

  // Actualizar solo archivos específicos en docs/
  const docsPath = path.join(TEMP_DIR, "docs");
  if (fs.existsSync(docsPath)) {
    log("📚 Actualizando docs/ (solo archivos del template)...", "yellow");
    fs.mkdirSync("docs", { recursive: true });

    // Archivos específicos a actualizar
    const docsFiles = [
      "ai-driven-software-project-blueprint.md",
      "kata-test-architecture.md",
      "GITFLOW.md",
      "AMBIENTES.md",
    ];

    docsFiles.forEach((file) => {
      const srcFile = path.join(docsPath, file);
      if (fs.existsSync(srcFile)) {
        fs.cpSync(srcFile, path.join("docs", file));
      }
    });

    // Actualizar todos los archivos mcp-config-*
    const allDocsFiles = fs.readdirSync(docsPath);
    allDocsFiles.forEach((file) => {
      if (file.startsWith("mcp-config-")) {
        const srcFile = path.join(docsPath, file);
        fs.cpSync(srcFile, path.join("docs", file));
      }
    });
  }

  // Actualizar solo scripts específicos en scripts/
  const scriptsPath = path.join(TEMP_DIR, "scripts");
  if (fs.existsSync(scriptsPath)) {
    log(
      "⚙️  Actualizando scripts/ (solo scripts de actualización)...",
      "yellow"
    );
    fs.mkdirSync("scripts", { recursive: true });

    const scriptFiles = ["update-prompts.js", "update-prompts.md"];
    scriptFiles.forEach((file) => {
      const srcFile = path.join(scriptsPath, file);
      if (fs.existsSync(srcFile)) {
        fs.cpSync(srcFile, path.join("scripts", file));
      }
    });
  }

  // Limpiar
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  // Resultado
  console.log("");
  log("✅ Actualización completada!", "green");
  log(
    "💡 Tu README.md y archivos personalizados se mantienen intactos",
    "yellow"
  );
  log(`💡 Si algo salió mal, restaura desde: ${backupDir}`, "yellow");
  console.log("");
  log("📋 Archivos actualizados:", "green");
  console.log("  • .prompts/ (todos los prompts)");
  console.log("  • context-engineering.md");
  console.log("  • docs/ (solo archivos del template)");
  console.log("  • scripts/update-prompts.js y .md");
}

main().catch((error) => {
  log("❌ Error inesperado:", "red");
  console.error(error);
  process.exit(1);
});
