# MCP Configuration Templates

This directory contains **pre-configured MCP server templates** for different AI CLI tools.

## Available Templates

| File                     | For Tool    | Format | Description                         |
| ------------------------ | ----------- | ------ | ----------------------------------- |
| `claude.template.json`   | Claude Code | JSON   | `.mcp.json` in project root         |
| `opencode.template.json` | OpenCode    | JSON   | `opencode.json` in project root     |
| `codex.template.toml`    | Codex CLI   | TOML   | `~/.codex/config.toml` or `.codex/` |
| `gemini.template.json`   | Gemini CLI  | JSON   | `~/.gemini/settings.json`           |
| `dbhub.example.toml`     | DBHub (SQL) | TOML   | `dbhub.toml` in project root        |

## Variable Format

Templates use `{{VARIABLE}}` as universal placeholder format for sensitive data:

- `{{API_BEARER_TOKEN}}` - Replace with your API bearer token
- `{{POSTMAN_API_KEY}}` - Replace with your Postman API key
- `{{JIRA_API_TOKEN}}` - Replace with your Jira API token
- etc.

Non-sensitive values (URLs, paths) use real examples from SoloQ project.

## MCP Servers Included

| Server         | Type   | Description                                 |
| -------------- | ------ | ------------------------------------------- |
| **playwright** | stdio  | E2E browser testing with vision/PDF/tracing |
| **devtools**   | stdio  | Chrome DevTools integration                 |
| **openapi**    | stdio  | REST API testing via OpenAPI spec           |
| **sql**        | stdio  | Database testing via DBHub                  |
| **supabase**   | stdio  | Supabase database management                |
| **context7**   | stdio  | Developer documentation lookup              |
| **tavily**     | remote | Web search                                  |
| **postman**    | remote | API collections & testing                   |
| **sentry**     | remote | Error monitoring                            |
| **vercel**     | remote | Deployment management                       |
| **notion**     | remote | Documentation                               |
| **atlassian**  | stdio  | Jira/Confluence                             |
| **github**     | remote | Repository management                       |
| **slack**      | stdio  | Team communication                          |

## Quick Start

### 1. Copy Template

**For Claude Code**:

```bash
cp templates/mcp/claude.template.json .mcp.json
```

**For OpenCode**:

```bash
cp templates/mcp/opencode.template.json opencode.json
```

**For Codex CLI**:

```bash
mkdir -p ~/.codex
cp templates/mcp/codex.template.toml ~/.codex/config.toml
```

**For Gemini CLI**:

```bash
mkdir -p ~/.gemini
cp templates/mcp/gemini.template.json ~/.gemini/settings.json
```

### 2. Create DBHub Config (for SQL testing)

```bash
cp templates/mcp/dbhub.example.toml dbhub.toml
# Edit with your database credentials
```

### 3. Replace Variables

Open your config file and replace `{{VARIABLE}}` placeholders with real values:

```json
"API_HEADERS": "Authorization:Bearer {{API_BEARER_TOKEN}}"
```

↓

```json
"API_HEADERS": "Authorization:Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 4. Verify Setup

Run your agent and verify with:

```
/mcp
```

## Key Differences by Tool

| Feature        | Claude         | OpenCode         | Codex          | Gemini       |
| -------------- | -------------- | ---------------- | -------------- | ------------ |
| Root key       | `mcpServers`   | `mcp`            | `mcp_servers`  | `mcpServers` |
| Command        | string         | array            | string         | string       |
| Env vars       | `env`          | `environment`    | `[server.env]` | `env`        |
| Remote type    | `type: "http"` | `type: "remote"` | `url`          | `httpUrl`    |
| Enable/disable | N/A            | `enabled`        | `enabled`      | N/A          |

## Security

- **Templates** (this folder) = Safe for git, uses `{{VAR}}` placeholders
- **Catalog files** (your copies) = NOT in git, contain real API keys
- All `*.catalog.json` and `dbhub.toml` are in `.gitignore`

## Documentation

For complete setup guide, see: [`mcp-configuration-guide.md`](./mcp-configuration-guide.md)

This includes:

- Step-by-step configuration for each tool
- DBHub (SQL) setup with connection strings
- OpenAPI setup with authentication flow
- Postman API key generation
- Troubleshooting guide
