#!/usr/bin/env bun
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Standalone prompts (files in root of .prompts/)
const STANDALONE_PROMPTS = [
  'git-flow.md',
  'git-conflict-fix.md',
  'us-dev-workflow.md',
  'us-qa-workflow.md',
  'kata-framework-setup.md',
  'README.md',
];

// Docs structure - directories to merge (not replace)
const DOCS_DIRECTORIES = ['architecture', 'mcp', 'testing', 'workflows'];

// Root-level docs files
const DOCS_ROOT_FILES = ['README.md'];

// Context structure
const CONTEXT_FILES = ['system-prompt.md', 'README.md'];

// Context guidelines subdirectories
const CONTEXT_GUIDELINES_DIRS = ['DEV', 'QA', 'TAE', 'MCP'];

// Context guidelines root files
const CONTEXT_GUIDELINES_FILES = ['README.md'];

// Scripts to update
const SCRIPT_FILES = ['update-prompts.js', 'mcp-builder.js', 'email-checker.js'];

// ============================================================================
// TERMINAL COLORS
// ============================================================================

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.bold}${colors.cyan}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logStep(message) {
  console.log(`${colors.yellow}📦 ${message}${colors.reset}`);
}

function logMerge(message) {
  console.log(`${colors.magenta}🔀 ${message}${colors.reset}`);
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

/**
 * Merge specific files from source to destination.
 *
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {string[]} files - List of files to copy
 */
function mergeFiles(srcDir, destDir, files) {
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);

    if (fs.existsSync(srcPath)) {
      fs.cpSync(srcPath, destPath);
      logSuccess(file);
    }
  }
}

/**
 * Merge specific subdirectories from source to destination.
 *
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {string[]} dirs - List of subdirectories to merge
 */
function mergeSubdirectories(srcDir, destDir, dirs) {
  fs.mkdirSync(destDir, { recursive: true });

  for (const dir of dirs) {
    const srcPath = path.join(srcDir, dir);
    const destPath = path.join(destDir, dir);

    if (fs.existsSync(srcPath)) {
      logMerge(`Merging ${dir}/...`);
      mergeDirectory(srcPath, destPath, '  ');
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
  all           Actualiza todo (merge inteligente)
  prompts       Actualiza .prompts/ (menu interactivo o con flags)
  docs          Actualiza docs/ (merge, preserva archivos del usuario)
  context       Actualiza .context/ (system-prompt, guidelines)
  templates     Actualiza templates/mcp/
  scripts       Actualiza scripts de actualizacion
  help          Muestra esta ayuda

${colors.bold}FLAGS PARA 'prompts':${colors.reset}
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
  Este script usa merge inteligente:
  - Solo actualiza archivos del template
  - Preserva archivos/carpetas creados por el usuario
  - No elimina nada que no exista en el template

${colors.bold}EJEMPLOS:${colors.reset}
  bun up                        ${colors.dim}# Menu interactivo${colors.reset}
  bun up all                    ${colors.dim}# Actualiza todo${colors.reset}
  bun up prompts                ${colors.dim}# Menu para elegir fases${colors.reset}
  bun up prompts --rol qa-full  ${colors.dim}# QA + Specification${colors.reset}
  bun up prompts --fase 7,8     ${colors.dim}# Fases 7 y 8${colors.reset}
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

function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    logError(`${name} no esta instalado`);
    return false;
  }
}

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

async function cloneTemplate() {
  logStep('Descargando ultima version del template...');
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  try {
    execSync(`gh repo clone ${TEMPLATE_REPO} "${TEMP_DIR}" -- --depth 1`, {
      stdio: 'inherit',
    });
  } catch (error) {
    logError('Error al descargar el template');
    console.log('Verifica que tienes acceso al repositorio privado de UPEX Galaxy');
    process.exit(1);
  }
}

// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================

/**
 * Update .prompts/ directory using merge strategy
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

  // Update specific phases using merge
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

  // Update standalone prompts
  if (includeStandalone) {
    logMerge('Archivos standalone...');
    mergeFiles(templatePromptsPath, '.prompts', STANDALONE_PROMPTS);
  }
}

/**
 * Update docs/ directory using merge strategy
 */
function updateDocs() {
  logStep('Actualizando docs/ (merge)...');

  const docsPath = path.join(TEMP_DIR, 'docs');
  if (!fs.existsSync(docsPath)) {
    logWarning('No se encontro directorio docs en el template');
    return;
  }

  // Merge root-level files
  mergeFiles(docsPath, 'docs', DOCS_ROOT_FILES);

  // Merge subdirectories
  mergeSubdirectories(docsPath, 'docs', DOCS_DIRECTORIES);
}

/**
 * Update .context/ directory using merge strategy
 */
function updateContext() {
  logStep('Actualizando .context/ (merge)...');

  const contextPath = path.join(TEMP_DIR, '.context');
  if (!fs.existsSync(contextPath)) {
    logWarning('No se encontro directorio .context en el template');
    return;
  }

  // Merge root-level context files
  logMerge('Archivos raiz de .context/...');
  mergeFiles(contextPath, '.context', CONTEXT_FILES);

  // Merge guidelines root files
  const guidelinesPath = path.join(contextPath, 'guidelines');
  if (fs.existsSync(guidelinesPath)) {
    logMerge('guidelines/...');
    mergeFiles(guidelinesPath, '.context/guidelines', CONTEXT_GUIDELINES_FILES);

    // Merge guidelines subdirectories
    mergeSubdirectories(guidelinesPath, '.context/guidelines', CONTEXT_GUIDELINES_DIRS);
  }
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
 * Update scripts/ directory (specific files only)
 */
function updateScripts() {
  logStep('Actualizando scripts/...');

  const scriptsPath = path.join(TEMP_DIR, 'scripts');
  if (!fs.existsSync(scriptsPath)) {
    logWarning('No se encontro directorio scripts en el template');
    return;
  }

  mergeFiles(scriptsPath, 'scripts', SCRIPT_FILES);
}

/**
 * Update context-engineering.md from template README
 */
function updateContextEngineering() {
  const templateReadmePath = path.join(TEMP_DIR, 'README.md');
  if (fs.existsSync(templateReadmePath)) {
    logStep('Actualizando context-engineering.md...');
    fs.cpSync(templateReadmePath, 'context-engineering.md');
    logSuccess('context-engineering.md actualizado');
  }
}

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
    const selected = await showMainMenu();

    if (selected.length === 0) {
      logWarning('No seleccionaste nada. Saliendo...');
      process.exit(0);
    }

    await validatePrerequisites();

    // Determine which components to backup and update
    const components = selected.includes('all')
      ? ['prompts', 'docs', 'context', 'templates', 'scripts']
      : selected;

    createBackup(components);
    await cloneTemplate();

    if (selected.includes('all')) {
      updatePrompts(Object.keys(PHASE_CONFIG).map(Number), true);
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
    parsed.commands = ['prompts', 'docs', 'context', 'templates', 'scripts'];
    parsed.all = true;
  }

  createBackup(parsed.commands);
  await cloneTemplate();

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
          const promptsConfig = await showPromptsMenu();
          updatePrompts(promptsConfig.phases, promptsConfig.standalone);
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
