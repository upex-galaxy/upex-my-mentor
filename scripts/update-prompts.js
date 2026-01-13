#!/usr/bin/env bun
/**
 * @fileoverview UPEX Template Updater - CLI para sincronizar proyectos con el template
 *
 * Este script permite mantener proyectos derivados sincronizados con el template
 * oficial de UPEX (ai-driven-project-starter). Usa una estrategia de "merge inteligente"
 * que actualiza archivos del template sin eliminar archivos personalizados del usuario.
 *
 * @description
 * Características principales:
 * - Menú interactivo para selección de componentes
 * - Actualización por roles (QA, Dev, DevOps, PO)
 * - Actualización por fases específicas (1-14)
 * - Sistema de backups automáticos
 * - Merge inteligente (preserva archivos del usuario)
 *
 * @requires gh - GitHub CLI debe estar instalado y autenticado
 * @requires bun - Runtime de JavaScript (o Node.js compatible)
 *
 * @example
 * // Menú interactivo
 * bun up
 *
 * @example
 * // Actualizar todo
 * bun up all
 *
 * @example
 * // Actualizar por rol
 * bun up prompts --rol qa
 *
 * @see docs/workflows/update-prompts-guide.md - Guía completa de uso
 *
 * @author UPEX Galaxy
 * @version 3.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// ============================================================================
// CONFIGURATION
// ============================================================================

const TEMPLATE_REPO = 'upex-galaxy/ai-driven-project-starter';
const TEMP_DIR = path.join(os.tmpdir(), 'aicode-template-update');

// Phase configuration for .prompts/
const PHASE_CONFIG = {
  1: { name: 'Constitution', dir: 'fase-1-constitution' },
  2: { name: 'Architecture', dir: 'fase-2-architecture' },
  3: { name: 'Infrastructure', dir: 'fase-3-infrastructure' },
  4: { name: 'Specification', dir: 'fase-4-specification' },
  5: { name: 'Shift-Left Testing', dir: 'fase-5-shift-left-testing' },
  6: { name: 'Planning', dir: 'fase-6-planning' },
  7: { name: 'Implementation', dir: 'fase-7-implementation' },
  8: { name: 'Code Review', dir: 'fase-8-code-review' },
  9: { name: 'Deployment Staging', dir: 'fase-9-deployment-staging' },
  10: { name: 'Exploratory Testing', dir: 'fase-10-exploratory-testing' },
  11: { name: 'Test Documentation', dir: 'fase-11-test-documentation' },
  12: { name: 'Test Automation', dir: 'fase-12-test-automation' },
  13: { name: 'Production Deployment', dir: 'fase-13-production-deployment' },
  14: { name: 'Shift-Right Testing', dir: 'fase-14-shift-right-testing' },
};

// Role-based phase groupings
const ROLE_PHASES = {
  qa: {
    phases: [5, 10, 11, 12],
    description: 'Shift-Left, Exploratory, Documentation, Automation',
  },
  'qa-full': {
    phases: [4, 5, 10, 11, 12],
    description: 'QA + Specification (contexto de negocio)',
  },
  dev: { phases: [6, 7, 8], description: 'Planning, Implementation, Code Review' },
  devops: {
    phases: [3, 9, 13, 14],
    description: 'Infrastructure, Staging, Production, Monitoring',
  },
  po: { phases: [1, 2, 4], description: 'Constitution, Architecture, Specification' },
  setup: { phases: [1, 2, 3], description: 'Fases sincronicas iniciales' },
};

// NOTE: No hardcoded file lists - all directories use mergeDirectory() for full sync
// This ensures any new files/folders in the template are automatically included

// ============================================================================
// TERMINAL COLORS
// ============================================================================

/** @description ANSI escape codes para colorear output en terminal */
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};

/** @param {string} message - Título de sección */
function logHeader(message) {
  console.log(`\n${colors.bold}${colors.cyan}${message}${colors.reset}`);
}

/** @param {string} message - Mensaje de éxito */
function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

/** @param {string} message - Mensaje de advertencia */
function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

/** @param {string} message - Mensaje de error */
function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

/** @param {string} message - Mensaje informativo */
function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

/** @param {string} message - Mensaje de paso/progreso */
function logStep(message) {
  console.log(`${colors.yellow}📦 ${message}${colors.reset}`);
}

/** @param {string} message - Mensaje de operación merge */
function logMerge(message) {
  console.log(`${colors.magenta}🔀 ${message}${colors.reset}`);
}

// ============================================================================
// DEPENDENCY CHECK
// ============================================================================

/**
 * Check if a npm package is installed locally
 * Uses filesystem check instead of require.resolve for Bun compatibility
 */
function isPackageInstalled(packageName) {
  // Check in node_modules (works with both npm and bun)
  const nodeModulesPath = path.join(process.cwd(), 'node_modules', packageName);
  if (fs.existsSync(nodeModulesPath)) {
    return true;
  }

  // Also check for scoped packages like @inquirer/prompts
  if (packageName.startsWith('@')) {
    const [scope, name] = packageName.split('/');
    const scopedPath = path.join(process.cwd(), 'node_modules', scope, name);
    if (fs.existsSync(scopedPath)) {
      return true;
    }
  }

  return false;
}

/**
 * Prompt nativo usando readline (sin dependencias externas).
 * Se usa como fallback cuando @inquirer/prompts no está instalado.
 *
 * @param {string} question - Pregunta a mostrar al usuario
 * @returns {Promise<string>} Respuesta del usuario en minúsculas y sin espacios
 */
function nativePrompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Check if interactive mode dependencies are available.
 * If not, offer to install them.
 * @returns {Promise<boolean>} true if dependencies are ready, false if user declined
 */
async function ensureDependencies() {
  if (isPackageInstalled('@inquirer/prompts')) {
    return true;
  }

  console.log(`
${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
${colors.bold}${colors.yellow}⚠️  Dependencia faltante: @inquirer/prompts${colors.reset}
${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

Esta dependencia es necesaria para el ${colors.cyan}menú interactivo${colors.reset} del script.

${colors.dim}Sin ella, solo puedes usar comandos directos como:${colors.reset}
  ${colors.green}bun up all${colors.reset}              - Actualizar todo
  ${colors.green}bun up docs${colors.reset}             - Actualizar docs/
  ${colors.green}bun up prompts --rol qa${colors.reset} - Actualizar prompts para QA

${colors.bold}¿Deseas instalar la dependencia ahora?${colors.reset}
`);

  const answer = await nativePrompt(`${colors.cyan}[Y/n]:${colors.reset} `);

  if (answer === '' || answer === 'y' || answer === 'yes' || answer === 'si' || answer === 's') {
    console.log(`\n${colors.blue}📦 Instalando @inquirer/prompts...${colors.reset}\n`);

    try {
      execSync('bun add @inquirer/prompts', { stdio: 'inherit' });
      console.log(`
${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
${colors.bold}${colors.green}✅ Dependencia instalada correctamente${colors.reset}
${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

Ahora puedes ejecutar el script nuevamente:

  ${colors.cyan}bun up${colors.reset}          - Menú interactivo
  ${colors.cyan}bun up all${colors.reset}      - Actualizar todo
  ${colors.cyan}bun up help${colors.reset}     - Ver opciones

`);
      process.exit(0);
    } catch (error) {
      logError(`Error instalando dependencia: ${error.message}`);
      console.log(`\n${colors.yellow}Intenta instalar manualmente:${colors.reset}`);
      console.log(`  ${colors.green}bun add @inquirer/prompts${colors.reset}\n`);
      process.exit(1);
    }
  } else {
    console.log(`\n${colors.yellow}Instalación cancelada.${colors.reset}`);
    console.log(`\nPuedes usar comandos directos sin el menú interactivo:`);
    console.log(`  ${colors.green}bun up all${colors.reset}      - Actualizar todo`);
    console.log(`  ${colors.green}bun up help${colors.reset}     - Ver todas las opciones\n`);
    process.exit(0);
  }
}

// ============================================================================
// MERGE UTILITIES
// ============================================================================

/**
 * Merge files from source to destination without deleting user files.
 * Only overwrites files that exist in source (template).
 * Preserves any files/folders in destination that don't exist in source.
 *
 * @param {string} srcDir - Source directory (from template)
 * @param {string} destDir - Destination directory (user's project)
 * @param {string} prefix - Prefix for logging (indentation)
 */
function mergeDirectory(srcDir, destDir, prefix = '') {
  // Ensure destination exists
  fs.mkdirSync(destDir, { recursive: true });

  // Get all items from source
  const items = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const item of items) {
    const srcPath = path.join(srcDir, item.name);
    const destPath = path.join(destDir, item.name);

    if (item.isDirectory()) {
      // Recursively merge subdirectory
      mergeDirectory(srcPath, destPath, prefix + '  ');
      logSuccess(`${prefix}${item.name}/`);
    } else {
      // Copy file (overwrites if exists)
      fs.cpSync(srcPath, destPath);
      logSuccess(`${prefix}${item.name}`);
    }
  }
}

// ============================================================================
// HELP
// ============================================================================

function showHelp() {
  console.log(`
${colors.bold}${colors.cyan}📦 UPEX Template Updater - Ayuda${colors.reset}

${colors.bold}USO:${colors.reset}
  bun up                        ${colors.dim}# Menu interactivo${colors.reset}
  bun up <comando> [opciones]   ${colors.dim}# Ejecucion directa${colors.reset}

${colors.bold}COMANDOS:${colors.reset}
  all           Actualiza todo (merge completo de todos los directorios)
  prompts       Actualiza .prompts/ (menu interactivo o con flags)
  books         Actualiza .books/ (manuales para humanos, mismas flags que prompts)
  docs          Actualiza docs/ (merge completo del directorio)
  context       Actualiza .context/ (merge completo del directorio)
  templates     Actualiza templates/mcp/ (merge completo del directorio)
  scripts       Actualiza scripts/ (merge completo del directorio)
  help          Muestra esta ayuda

${colors.bold}FLAGS PARA 'prompts' y 'books':${colors.reset}
  --all         Todas las fases (1-14) + standalone
  --fase N      Fases especificas (ej: --fase 5 o --fase 5,10,11)
  --rol ROLE    Por rol (ver roles disponibles)
  --standalone  Solo archivos standalone

${colors.bold}ROLES DISPONIBLES:${colors.reset}
  qa       ${colors.dim}-> Fases 5, 10, 11, 12 (Testing)${colors.reset}
  qa-full  ${colors.dim}-> Fases 4, 5, 10, 11, 12 (Testing + Specification)${colors.reset}
  dev      ${colors.dim}-> Fases 6, 7, 8 (Desarrollo)${colors.reset}
  devops   ${colors.dim}-> Fases 3, 9, 13, 14 (Infraestructura)${colors.reset}
  po       ${colors.dim}-> Fases 1, 2, 4 (Producto)${colors.reset}
  setup    ${colors.dim}-> Fases 1, 2, 3 (Setup inicial)${colors.reset}

${colors.bold}MERGE INTELIGENTE:${colors.reset}
  Este script sincroniza TODOS los archivos del template:
  - Actualiza/agrega cualquier archivo que exista en el template
  - Preserva archivos/carpetas creados por el usuario (no en template)
  - No elimina nada que no exista en el template
  - Sin listas hardcodeadas: nuevos archivos del template se incluyen automaticamente

${colors.bold}EJEMPLOS:${colors.reset}
  bun up                        ${colors.dim}# Menu interactivo${colors.reset}
  bun up all                    ${colors.dim}# Actualiza todo${colors.reset}
  bun up prompts                ${colors.dim}# Menu para elegir fases${colors.reset}
  bun up prompts --rol qa-full  ${colors.dim}# QA + Specification${colors.reset}
  bun up prompts --fase 7,8     ${colors.dim}# Fases 7 y 8${colors.reset}
  bun up books --all            ${colors.dim}# Todos los manuales${colors.reset}
  bun up books --rol qa         ${colors.dim}# Manuales de QA${colors.reset}
  bun up docs context           ${colors.dim}# Multiples componentes${colors.reset}
`);
}

// ============================================================================
// INTERACTIVE MENUS
// ============================================================================

async function showMainMenu() {
  const { checkbox } = await import('@inquirer/prompts');

  return await checkbox({
    message: 'Que deseas actualizar?',
    instructions: '(Usa las flechas, ESPACIO para seleccionar, ENTER para confirmar)',
    choices: [
      { name: 'Todo (all)', value: 'all' },
      { name: 'Prompts (.prompts/)', value: 'prompts' },
      { name: 'Books (.books/) - Manuales para humanos', value: 'books' },
      { name: 'Documentacion (docs/)', value: 'docs' },
      { name: 'Context (.context/)', value: 'context' },
      { name: 'Templates MCP (templates/mcp/)', value: 'templates' },
      { name: 'Scripts de actualizacion', value: 'scripts' },
    ],
  });
}

async function showPromptsMenu() {
  const { select } = await import('@inquirer/prompts');

  const mode = await select({
    message: 'Que fases deseas actualizar?',
    choices: [
      { name: 'Todas las fases (1-14) + standalone', value: 'all' },
      { name: 'Por rol...', value: 'role' },
      { name: 'Fases especificas...', value: 'phases' },
      { name: 'Solo archivos standalone (git-flow, workflows)', value: 'standalone' },
    ],
  });

  switch (mode) {
    case 'all':
      return { phases: Object.keys(PHASE_CONFIG).map(Number), standalone: true };
    case 'role':
      return await showRoleMenu();
    case 'phases':
      return await showPhasesMenu();
    case 'standalone':
      return { phases: [], standalone: true };
  }
}

async function showRoleMenu() {
  const { select } = await import('@inquirer/prompts');

  const role = await select({
    message: 'Selecciona un rol:',
    choices: Object.entries(ROLE_PHASES).map(([key, value]) => ({
      name: `${key.toUpperCase()} (fases ${value.phases.join(', ')}) - ${value.description}`,
      value: key,
    })),
  });

  return { phases: ROLE_PHASES[role].phases, standalone: false };
}

async function showPhasesMenu() {
  const { checkbox } = await import('@inquirer/prompts');

  const phases = await checkbox({
    message: 'Selecciona las fases a actualizar:',
    instructions: '(ESPACIO para seleccionar, ENTER para confirmar)',
    choices: Object.entries(PHASE_CONFIG).map(([num, config]) => ({
      name: `Fase ${num}: ${config.name}`,
      value: Number(num),
    })),
  });

  return { phases, standalone: false };
}

// ============================================================================
// ARGUMENT PARSING
// ============================================================================

/**
 * Parsea argumentos de línea de comandos.
 *
 * @param {string[]} args - Array de argumentos (process.argv.slice(2))
 * @returns {{commands: string[], phases: number[]|null, role: string|null, standalone: boolean, all: boolean, help: boolean}}
 */
function parseArgs(args) {
  const result = {
    commands: [],
    phases: null,
    role: null,
    standalone: false,
    all: false,
    help: false,
  };

  // Support both 'guidelines' (legacy) and 'context' (new)
  const validCommands = [
    'all',
    'prompts',
    'books',
    'docs',
    'context',
    'guidelines',
    'templates',
    'scripts',
    'help',
  ];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === 'help' || arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--all') {
      result.all = true;
    } else if (arg === '--standalone') {
      result.standalone = true;
    } else if (arg === '--fase' || arg === '--phase') {
      const nextArg = args[++i];
      if (nextArg) {
        result.phases = nextArg
          .split(',')
          .map(Number)
          .filter(n => n >= 1 && n <= 14);
      }
    } else if (arg === '--rol' || arg === '--role') {
      const nextArg = args[++i];
      if (nextArg && ROLE_PHASES[nextArg]) {
        result.role = nextArg;
        result.phases = ROLE_PHASES[nextArg].phases;
      } else if (nextArg) {
        logError(`Rol desconocido: ${nextArg}`);
        logInfo(`Roles disponibles: ${Object.keys(ROLE_PHASES).join(', ')}`);
        process.exit(1);
      }
    } else if (validCommands.includes(arg)) {
      // Map 'guidelines' to 'context' for backwards compatibility
      result.commands.push(arg === 'guidelines' ? 'context' : arg);
    } else if (!arg.startsWith('-')) {
      logWarning(`Comando desconocido: ${arg}`);
    }
  }

  return result;
}

// ============================================================================
// PREREQUISITES
// ============================================================================

/**
 * Verifica si un comando CLI está disponible en el sistema.
 *
 * @param {string} command - Comando a verificar (ej: 'gh', 'node')
 * @param {string} name - Nombre descriptivo para mensajes de error
 * @returns {boolean} true si el comando existe, false si no
 */
function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    logError(`${name} no esta instalado`);
    return false;
  }
}

/**
 * Valida que GitHub CLI esté instalado y autenticado.
 * Termina el proceso si no cumple los requisitos.
 *
 * @returns {Promise<void>}
 */
async function validatePrerequisites() {
  if (!checkCommand('gh', 'GitHub CLI (gh)')) {
    console.log('\nInstalalo con:');
    if (process.platform === 'darwin') {
      console.log('  brew install gh');
    } else if (process.platform === 'win32') {
      console.log('  winget install GitHub.cli');
    } else {
      console.log('  sudo apt install gh  # Ubuntu/Debian');
      console.log('  O visita: https://cli.github.com/');
    }
    process.exit(1);
  }

  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    logWarning('No estas autenticado en GitHub CLI');
    console.log('Ejecuta: gh auth login');
    process.exit(1);
  }
}

// ============================================================================
// BACKUP
// ============================================================================

/**
 * Crea un backup de los componentes antes de actualizarlos.
 * Los backups se guardan en .backups/update-YYYY-MM-DD-HHMMSS/
 *
 * @param {string[]} components - Lista de componentes a respaldar ('prompts', 'docs', etc.)
 * @returns {string} Ruta del directorio de backup creado
 */
function createBackup(components) {
  logStep('Creando backup...');

  const timestamp =
    new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] +
    '-' +
    new Date().toTimeString().split(' ')[0].replace(/:/g, '');
  const backupDir = path.join('.backups', `update-${timestamp}`);

  fs.mkdirSync(backupDir, { recursive: true });

  const backupMap = {
    prompts: { src: '.prompts', dest: '.prompts' },
    books: { src: '.books', dest: '.books' },
    docs: { src: 'docs', dest: 'docs' },
    context: { src: '.context', dest: '.context' },
    templates: { src: 'templates/mcp', dest: 'templates/mcp' },
    scripts: { src: 'scripts', dest: 'scripts' },
  };

  for (const comp of components) {
    const mapping = backupMap[comp];
    if (mapping && fs.existsSync(mapping.src)) {
      const destPath = path.join(backupDir, mapping.dest);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.cpSync(mapping.src, destPath, { recursive: true });
    }
  }

  if (fs.existsSync('context-engineering.md')) {
    fs.cpSync('context-engineering.md', path.join(backupDir, 'context-engineering.md'));
  }

  logSuccess(`Backup guardado en: ${backupDir}`);
  return backupDir;
}

// ============================================================================
// CLONE TEMPLATE
// ============================================================================

/**
 * Clona el template desde GitHub a un directorio temporal.
 * Usa GitHub CLI (gh) para manejar autenticación automáticamente.
 *
 * @returns {Promise<void>}
 * @throws {Error} Si no hay autenticación o acceso al repo
 */
async function cloneTemplate() {
  logStep('Descargando ultima version del template...');
  console.log(`${colors.dim}  Repo: ${TEMPLATE_REPO}${colors.reset}`);
  console.log(`${colors.dim}  Destino temporal: ${TEMP_DIR}${colors.reset}`);

  // Clean up any previous temp directory
  if (fs.existsSync(TEMP_DIR)) {
    console.log(`${colors.dim}  Limpiando directorio temporal anterior...${colors.reset}`);
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  // First, verify gh CLI is authenticated
  console.log(`${colors.dim}  Verificando autenticacion de GitHub CLI...${colors.reset}`);
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    console.log(`${colors.green}  ✓ GitHub CLI autenticado${colors.reset}`);
  } catch {
    logError('GitHub CLI no esta autenticado');
    console.log(`\n${colors.yellow}Ejecuta primero:${colors.reset}`);
    console.log(`  ${colors.cyan}gh auth login${colors.reset}\n`);
    process.exit(1);
  }

  // Clone the repository
  console.log(
    `${colors.dim}  Clonando repositorio (esto puede tomar unos segundos)...${colors.reset}`
  );

  try {
    const cloneCommand = `gh repo clone ${TEMPLATE_REPO} "${TEMP_DIR}" -- --depth 1 --quiet`;
    execSync(cloneCommand, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000, // 60 second timeout
    });
    console.log(`${colors.green}  ✓ Template descargado correctamente${colors.reset}`);
  } catch (error) {
    if (error.killed) {
      logError('Timeout: La descarga tardo demasiado (>60s)');
      console.log(`${colors.yellow}Posibles causas:${colors.reset}`);
      console.log('  • Conexion a internet lenta');
      console.log('  • Problemas con GitHub');
      console.log(`\n${colors.yellow}Intenta ejecutar manualmente:${colors.reset}`);
      console.log(`  ${colors.cyan}gh repo clone ${TEMPLATE_REPO}${colors.reset}\n`);
    } else {
      logError('Error al descargar el template');
      console.log(`${colors.yellow}Posibles causas:${colors.reset}`);
      console.log('  • No tienes acceso al repositorio privado de UPEX Galaxy');
      console.log('  • Problemas de conexion a internet');
      console.log('  • GitHub CLI no configurado correctamente');
      console.log(`\n${colors.yellow}Verifica tu acceso:${colors.reset}`);
      console.log(`  ${colors.cyan}gh repo view ${TEMPLATE_REPO}${colors.reset}\n`);
    }
    process.exit(1);
  }
}

// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================

/**
 * Update .prompts/ directory using merge strategy.
 * - Full update (all phases + standalone): merges entire directory
 * - Specific phases: merges only those phase directories
 * - Standalone only: merges root files/folders that are NOT phase directories
 */
function updatePrompts(phases, includeStandalone) {
  logStep('Actualizando .prompts/ (merge)...');

  const templatePromptsPath = path.join(TEMP_DIR, '.prompts');
  if (!fs.existsSync(templatePromptsPath)) {
    logWarning('No se encontro directorio .prompts en el template');
    return;
  }

  // Ensure .prompts exists
  fs.mkdirSync('.prompts', { recursive: true });

  // Check if this is a full update (all phases + standalone)
  const allPhaseNums = Object.keys(PHASE_CONFIG).map(Number);
  const isFullUpdate =
    includeStandalone &&
    phases.length === allPhaseNums.length &&
    allPhaseNums.every(p => phases.includes(p));

  if (isFullUpdate) {
    // Full directory merge - syncs everything from template
    logMerge('Sincronizando directorio completo...');
    mergeDirectory(templatePromptsPath, '.prompts');
    return;
  }

  // Update specific phases
  if (phases && phases.length > 0) {
    for (const phaseNum of phases) {
      const phaseConfig = PHASE_CONFIG[phaseNum];
      if (!phaseConfig) continue;

      const srcPath = path.join(templatePromptsPath, phaseConfig.dir);
      const destPath = path.join('.prompts', phaseConfig.dir);

      if (fs.existsSync(srcPath)) {
        logMerge(`Fase ${phaseNum}: ${phaseConfig.name}`);
        mergeDirectory(srcPath, destPath, '  ');
      } else {
        logWarning(`Fase ${phaseNum} no encontrada en template`);
      }
    }
  }

  // Update standalone (non-phase files/folders)
  if (includeStandalone) {
    logMerge('Archivos standalone...');
    const phaseDirs = Object.values(PHASE_CONFIG).map(c => c.dir);
    const items = fs.readdirSync(templatePromptsPath, { withFileTypes: true });

    for (const item of items) {
      // Skip phase directories - only sync non-phase items
      if (phaseDirs.includes(item.name)) continue;

      const srcPath = path.join(templatePromptsPath, item.name);
      const destPath = path.join('.prompts', item.name);

      if (item.isDirectory()) {
        mergeDirectory(srcPath, destPath, '  ');
      } else {
        fs.cpSync(srcPath, destPath);
        logSuccess(`  ${item.name}`);
      }
    }
  }
}

/**
 * Update .books/ directory using merge strategy.
 * Books are human-readable manuals that mirror .prompts/ structure.
 * - Full update (all phases + standalone): merges entire directory
 * - Specific phases: merges only those phase directories
 * - Standalone only: merges root files/folders that are NOT phase directories
 */
function updateBooks(phases, includeStandalone) {
  logStep('Actualizando .books/ (merge)...');

  const templateBooksPath = path.join(TEMP_DIR, '.books');
  if (!fs.existsSync(templateBooksPath)) {
    logWarning('No se encontro directorio .books en el template');
    return;
  }

  // Ensure .books exists
  fs.mkdirSync('.books', { recursive: true });

  // Check if this is a full update (all phases + standalone)
  const allPhaseNums = Object.keys(PHASE_CONFIG).map(Number);
  const isFullUpdate =
    includeStandalone &&
    phases.length === allPhaseNums.length &&
    allPhaseNums.every(p => phases.includes(p));

  if (isFullUpdate) {
    // Full directory merge - syncs everything from template
    logMerge('Sincronizando directorio completo...');
    mergeDirectory(templateBooksPath, '.books');
    return;
  }

  // Update specific phases
  if (phases && phases.length > 0) {
    for (const phaseNum of phases) {
      const phaseConfig = PHASE_CONFIG[phaseNum];
      if (!phaseConfig) continue;

      const srcPath = path.join(templateBooksPath, phaseConfig.dir);
      const destPath = path.join('.books', phaseConfig.dir);

      if (fs.existsSync(srcPath)) {
        logMerge(`Fase ${phaseNum}: ${phaseConfig.name}`);
        mergeDirectory(srcPath, destPath, '  ');
      } else {
        logWarning(`Fase ${phaseNum} no encontrada en template .books/`);
      }
    }
  }

  // Update standalone (non-phase files/folders)
  if (includeStandalone) {
    logMerge('Archivos standalone...');
    const phaseDirs = Object.values(PHASE_CONFIG).map(c => c.dir);
    const items = fs.readdirSync(templateBooksPath, { withFileTypes: true });

    for (const item of items) {
      // Skip phase directories - only sync non-phase items
      if (phaseDirs.includes(item.name)) continue;

      const srcPath = path.join(templateBooksPath, item.name);
      const destPath = path.join('.books', item.name);

      if (item.isDirectory()) {
        mergeDirectory(srcPath, destPath, '  ');
      } else {
        fs.cpSync(srcPath, destPath);
        logSuccess(`  ${item.name}`);
      }
    }
  }
}

/**
 * Update docs/ directory using merge strategy.
 * Merges entire directory - any new files/folders in template are synced.
 */
function updateDocs() {
  logStep('Actualizando docs/ (merge)...');

  const docsPath = path.join(TEMP_DIR, 'docs');
  if (!fs.existsSync(docsPath)) {
    logWarning('No se encontro directorio docs en el template');
    return;
  }

  logMerge('Sincronizando directorio completo...');
  mergeDirectory(docsPath, 'docs');
}

/**
 * Update .context/ directory using merge strategy.
 * Merges entire directory - any new files/folders in template are synced.
 */
function updateContext() {
  logStep('Actualizando .context/ (merge)...');

  const contextPath = path.join(TEMP_DIR, '.context');
  if (!fs.existsSync(contextPath)) {
    logWarning('No se encontro directorio .context en el template');
    return;
  }

  logMerge('Sincronizando directorio completo...');
  mergeDirectory(contextPath, '.context');
}

/**
 * Update templates/mcp/ directory
 */
function updateTemplates() {
  logStep('Actualizando templates/mcp/ (merge)...');

  const templatesPath = path.join(TEMP_DIR, 'templates', 'mcp');
  if (!fs.existsSync(templatesPath)) {
    logWarning('No se encontro directorio templates/mcp en el template');
    return;
  }

  mergeDirectory(templatesPath, 'templates/mcp');
}

/**
 * Update scripts/ directory using merge strategy.
 * Merges entire directory - any new scripts in template are synced.
 */
function updateScripts() {
  logStep('Actualizando scripts/ (merge)...');

  const scriptsPath = path.join(TEMP_DIR, 'scripts');
  if (!fs.existsSync(scriptsPath)) {
    logWarning('No se encontro directorio scripts en el template');
    return;
  }

  logMerge('Sincronizando directorio completo...');
  mergeDirectory(scriptsPath, 'scripts');
}

/**
 * Auto-actualiza este script antes de cualquier operación.
 * Compara el script actual con la versión del template y lo actualiza si hay diferencias.
 *
 * @returns {boolean} true si el script fue actualizado y necesita reiniciarse
 */
function selfUpdate() {
  const currentScriptPath = path.join(process.cwd(), 'scripts', 'update-prompts.js');
  const templateScriptPath = path.join(TEMP_DIR, 'scripts', 'update-prompts.js');

  if (!fs.existsSync(templateScriptPath)) {
    return false;
  }

  const currentContent = fs.existsSync(currentScriptPath)
    ? fs.readFileSync(currentScriptPath, 'utf-8')
    : '';
  const templateContent = fs.readFileSync(templateScriptPath, 'utf-8');

  if (currentContent !== templateContent) {
    logStep('Auto-actualizando update-prompts.js...');
    fs.mkdirSync('scripts', { recursive: true });
    fs.cpSync(templateScriptPath, currentScriptPath);
    logSuccess('update-prompts.js actualizado a la ultima version');
    return true;
  }

  return false;
}

/**
 * Actualiza context-engineering.md desde el README del template.
 * Este archivo sirve como documentación maestra de la arquitectura.
 */
function updateContextEngineering() {
  const templateReadmePath = path.join(TEMP_DIR, 'README.md');
  if (fs.existsSync(templateReadmePath)) {
    logStep('Actualizando context-engineering.md...');
    fs.cpSync(templateReadmePath, 'context-engineering.md');
    logSuccess('context-engineering.md actualizado');
  }
}

/**
 * Limpia el directorio temporal después de la actualización.
 * Se ejecuta al final de cada operación exitosa.
 */
function cleanup() {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  logHeader('📦 UPEX Template Updater');
  logInfo('Usando merge inteligente (preserva archivos del usuario)');

  // No arguments -> Interactive menu
  if (args.length === 0) {
    // Check for interactive dependencies before showing menu
    const depsReady = await ensureDependencies();
    if (!depsReady) return; // Script is restarting after install

    const selected = await showMainMenu();

    if (selected.length === 0) {
      logWarning('No seleccionaste nada. Saliendo...');
      process.exit(0);
    }

    await validatePrerequisites();

    // Determine which components to backup and update
    const components = selected.includes('all')
      ? ['prompts', 'books', 'docs', 'context', 'templates', 'scripts']
      : selected;

    createBackup(components);
    await cloneTemplate();

    // Auto-actualizar el script primero (siempre)
    selfUpdate();

    if (selected.includes('all')) {
      updatePrompts(Object.keys(PHASE_CONFIG).map(Number), true);
      updateBooks(Object.keys(PHASE_CONFIG).map(Number), true);
      updateDocs();
      updateContext();
      updateTemplates();
      updateScripts();
      updateContextEngineering();
    } else {
      for (const cmd of selected) {
        if (cmd === 'prompts') {
          const promptsConfig = await showPromptsMenu();
          updatePrompts(promptsConfig.phases, promptsConfig.standalone);
        } else if (cmd === 'books') {
          const booksConfig = await showPromptsMenu();
          updateBooks(booksConfig.phases, booksConfig.standalone);
        } else if (cmd === 'docs') {
          updateDocs();
        } else if (cmd === 'context') {
          updateContext();
        } else if (cmd === 'templates') {
          updateTemplates();
        } else if (cmd === 'scripts') {
          updateScripts();
        }
      }
    }

    cleanup();
    logHeader('✅ Actualizacion completada!');
    logInfo('Tus archivos personalizados han sido preservados.');
    return;
  }

  // Parse arguments
  const parsed = parseArgs(args);

  if (parsed.help) {
    showHelp();
    process.exit(0);
  }

  if (parsed.commands.length === 0) {
    logError('No se especifico ningun comando valido');
    showHelp();
    process.exit(1);
  }

  await validatePrerequisites();

  // Expand 'all' command
  if (parsed.commands.includes('all')) {
    parsed.commands = ['prompts', 'books', 'docs', 'context', 'templates', 'scripts'];
    parsed.all = true;
  }

  createBackup(parsed.commands);
  await cloneTemplate();

  // Auto-actualizar el script primero (siempre)
  selfUpdate();

  // Execute commands
  for (const cmd of parsed.commands) {
    switch (cmd) {
      case 'prompts':
        if (parsed.all) {
          updatePrompts(Object.keys(PHASE_CONFIG).map(Number), true);
        } else if (parsed.phases) {
          updatePrompts(parsed.phases, parsed.standalone);
        } else if (parsed.standalone) {
          updatePrompts([], true);
        } else {
          // Check for interactive dependencies before showing prompts menu
          const depsReady = await ensureDependencies();
          if (!depsReady) return;

          const promptsConfig = await showPromptsMenu();
          updatePrompts(promptsConfig.phases, promptsConfig.standalone);
        }
        break;
      case 'books':
        if (parsed.all) {
          updateBooks(Object.keys(PHASE_CONFIG).map(Number), true);
        } else if (parsed.phases) {
          updateBooks(parsed.phases, parsed.standalone);
        } else if (parsed.standalone) {
          updateBooks([], true);
        } else {
          // Check for interactive dependencies before showing menu
          const depsReady = await ensureDependencies();
          if (!depsReady) return;

          const booksConfig = await showPromptsMenu();
          updateBooks(booksConfig.phases, booksConfig.standalone);
        }
        break;
      case 'docs':
        updateDocs();
        break;
      case 'context':
        updateContext();
        break;
      case 'templates':
        updateTemplates();
        break;
      case 'scripts':
        updateScripts();
        break;
    }
  }

  // Also update context-engineering.md when updating all
  if (parsed.commands.includes('prompts') && parsed.all) {
    updateContextEngineering();
  }

  cleanup();
  logHeader('✅ Actualizacion completada!');
  logInfo('Tus archivos personalizados han sido preservados.');
}

main().catch(error => {
  logError('Error inesperado:');
  console.error(error);
  process.exit(1);
});
