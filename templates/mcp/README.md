# MCP Configuration Templates

This directory contains **pre-configured MCP server templates** for different AI CLI tools.

## 📋 Available Templates

| File | For Tool | Description |
|------|----------|-------------|
| `gemini.template.json` | Gemini CLI | Template with Gemini-specific format |
| `claude.template.json` | Claude Code | Template with Claude-specific format |

## 🎯 What's Included

Each template contains popular MCP servers:
- **playwright** - E2E browser testing
- **devtools** - Chrome DevTools
- **supabase** - PostgreSQL database
- **context7** - Documentation lookup
- **postman** - API testing
- **github** - Repository management
- **atlassian** - Jira/Confluence
- **slack** - Team communication
- **notion** - Documentation
- **memory** - Persistent sessions
- And more...

## 🚀 How to Use

### 1. Copy Template

**For Gemini CLI**:
```bash
mkdir -p .gemini
cp templates/mcp/gemini.template.json .gemini/settings.catalog.json
```

**For Claude Code**:
```bash
cp templates/mcp/claude.template.json .mcp.catalog.json
```

### 2. Add Your API Keys

Open your new catalog file and replace placeholders:

```json
"SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
```
↓
```json
"SUPABASE_ACCESS_TOKEN": "sbp_your_real_token_here"
```

### 3. Configure & Run

See main documentation: [`docs/mcp-builder-strategy.md`](../../docs/mcp-builder-strategy.md)

## 🔒 Security

- **Templates** (this folder) = Safe for git, no secrets
- **Catalogs** (your copies) = NOT in git, contains your API keys
- All `*.catalog.json` files are in `.gitignore`

## 📝 Note

Variables in templates use `${VARIABLE_NAME}` format. These are **placeholders** - you must replace them with actual values in your catalog file.

---

For complete setup guide, see: [`docs/mcp-builder-strategy.md`](../../docs/mcp-builder-strategy.md)
