#!/usr/bin/env bun
/**
 * OpenAPI Sync Script
 *
 * Downloads OpenAPI/Swagger specification from a remote GitHub repository
 * and optionally generates TypeScript types.
 *
 * Usage:
 *   bun run api:sync                    # Interactive mode
 *   bun run api:sync --config           # Use saved config
 *   bun run api:sync --generate-types   # Also generate TypeScript types
 *
 * Configuration is stored in: api/.openapi-config.json
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

// ============================================
// Configuration
// ============================================

const API_DIR = join(process.cwd(), 'api');
const CONFIG_FILE = join(API_DIR, '.openapi-config.json');
const OPENAPI_FILE = join(API_DIR, 'openapi.yaml');
const TYPES_FILE = join(API_DIR, 'types.ts');

interface OpenAPIConfig {
  repo: string; // e.g., "owner/repo"
  branch: string; // e.g., "main"
  filePath: string; // e.g., "docs/openapi.yaml"
  lastSync?: string; // ISO date of last sync
}

// ============================================
// Utility Functions
// ============================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = {
    info: '\x1b[36mℹ\x1b[0m',
    success: '\x1b[32m✓\x1b[0m',
    error: '\x1b[31m✗\x1b[0m',
    warn: '\x1b[33m⚠\x1b[0m',
  };
  console.log(`${icons[type]} ${message}`);
}

function checkGhCli(): boolean {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function checkGhAuth(): boolean {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function loadConfig(): OpenAPIConfig | null {
  if (existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

function saveConfig(config: OpenAPIConfig): void {
  if (!existsSync(API_DIR)) {
    mkdirSync(API_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  log(`Configuration saved to ${CONFIG_FILE}`, 'success');
}

function prompt(question: string, defaultValue?: string): Promise<string> {
  return new Promise(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const defaultStr = defaultValue ? ` (${defaultValue})` : '';

    rl.question(`${question}${defaultStr}: `, answer => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

// ============================================
// Main Functions
// ============================================

async function getConfigInteractive(): Promise<OpenAPIConfig> {
  console.log('\n\x1b[1m📋 OpenAPI Sync Configuration\x1b[0m\n');

  const repo = await prompt('GitHub repository (owner/repo)', 'org/backend-repo');
  const branch = await prompt('Branch name', 'main');
  const filePath = await prompt('Path to OpenAPI file in repo', 'docs/openapi.yaml');

  return { repo, branch, filePath };
}

function downloadOpenAPI(config: OpenAPIConfig): boolean {
  log(`Downloading OpenAPI from ${config.repo}...`);

  try {
    // Use gh api to download raw file content
    const result = spawnSync(
      'gh',
      [
        'api',
        `/repos/${config.repo}/contents/${config.filePath}`,
        '-H',
        'Accept: application/vnd.github.raw',
        '--jq',
        '.',
      ],
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    if (result.status !== 0) {
      // Try alternative: direct raw URL
      log('Trying alternative download method...', 'warn');

      const rawUrl = `https://raw.githubusercontent.com/${config.repo}/${config.branch}/${config.filePath}`;
      const curlResult = spawnSync('curl', ['-sS', '-f', rawUrl], {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      if (curlResult.status !== 0) {
        log(`Failed to download: ${curlResult.stderr}`, 'error');
        return false;
      }

      writeFileSync(OPENAPI_FILE, curlResult.stdout);
    } else {
      writeFileSync(OPENAPI_FILE, result.stdout);
    }

    log(`OpenAPI specification saved to ${OPENAPI_FILE}`, 'success');
    return true;
  } catch (error) {
    log(`Download failed: ${error}`, 'error');
    return false;
  }
}

async function generateTypes(): Promise<boolean> {
  log('Generating TypeScript types from OpenAPI...');

  try {
    // Check if openapi-typescript is installed
    const checkResult = spawnSync('bunx', ['openapi-typescript', '--version'], {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    if (checkResult.status !== 0) {
      log('Installing openapi-typescript...', 'info');
      execSync('bun add -d openapi-typescript', { stdio: 'inherit' });
    }

    // Generate types
    const result = spawnSync('bunx', ['openapi-typescript', OPENAPI_FILE, '-o', TYPES_FILE], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (result.status !== 0) {
      log(`Type generation failed: ${result.stderr}`, 'error');
      return false;
    }

    log(`TypeScript types generated at ${TYPES_FILE}`, 'success');
    return true;
  } catch (error) {
    log(`Type generation failed: ${error}`, 'error');
    return false;
  }
}

// ============================================
// CLI Entry Point
// ============================================

async function main() {
  console.log('\n\x1b[1m🔄 OpenAPI Sync Tool\x1b[0m');
  console.log('━'.repeat(40) + '\n');

  // Check prerequisites
  if (!checkGhCli()) {
    log('GitHub CLI (gh) is not installed. Please install it first:', 'error');
    console.log('  https://cli.github.com/');
    process.exit(1);
  }

  if (!checkGhAuth()) {
    log('GitHub CLI is not authenticated. Please run:', 'error');
    console.log('  gh auth login');
    process.exit(1);
  }

  // Parse arguments
  const args = process.argv.slice(2);
  const useConfig = args.includes('--config') || args.includes('-c');
  const generateTypesFlag = args.includes('--generate-types') || args.includes('-t');
  const helpFlag = args.includes('--help') || args.includes('-h');

  if (helpFlag) {
    console.log(`
Usage: bun run api:sync [options]

Options:
  -c, --config          Use saved configuration (skip prompts)
  -t, --generate-types  Generate TypeScript types from OpenAPI
  -h, --help            Show this help message

Examples:
  bun run api:sync                    # Interactive setup
  bun run api:sync -c                 # Use saved config
  bun run api:sync -c -t              # Sync and generate types
`);
    process.exit(0);
  }

  // Get configuration
  let config: OpenAPIConfig | null = null;

  if (useConfig) {
    config = loadConfig();
    if (!config) {
      log('No saved configuration found. Running interactive setup...', 'warn');
    }
  }

  if (!config) {
    config = await getConfigInteractive();

    // Ask to save configuration
    const saveAnswer = await prompt('Save this configuration for future use? (y/n)', 'y');
    if (saveAnswer.toLowerCase() === 'y') {
      saveConfig(config);
    }
  }

  // Ensure api directory exists
  if (!existsSync(API_DIR)) {
    mkdirSync(API_DIR, { recursive: true });
  }

  // Download OpenAPI spec
  const downloadSuccess = downloadOpenAPI(config);
  if (!downloadSuccess) {
    process.exit(1);
  }

  // Update config with last sync time
  config.lastSync = new Date().toISOString();
  saveConfig(config);

  // Generate TypeScript types if requested
  if (generateTypesFlag) {
    await generateTypes();
  }

  console.log('\n' + '━'.repeat(40));
  log('OpenAPI sync completed!', 'success');

  console.log(`
\x1b[1mNext steps:\x1b[0m
1. Configure MCP OpenAPI server in your .mcp.json:
   {
     "mcpServers": {
       "openapi": {
         "command": "npx",
         "args": ["-y", "@anthropic/mcp-openapi-server"],
         "env": {
           "OPENAPI_SPEC_PATH": "${OPENAPI_FILE}",
           "API_BASE_URL": "https://your-api.com"
         }
       }
     }
   }

2. Use the MCP tools to explore and test your API:
   - list-api-endpoints
   - get-api-endpoint-schema
   - invoke-api-endpoint
`);
}

main().catch(console.error);
