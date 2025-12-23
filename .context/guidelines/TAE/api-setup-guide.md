# API Setup Guide for KATA

> Configuring OpenAPI integration for AI-powered API testing.

---

## Overview

KATA uses **OpenAPI/Swagger specifications** as the primary source for API documentation and testing. This enables:

- **AI-powered API discovery** - AI knows all endpoints, schemas, and auth
- **Type-safe testing** - Generated TypeScript types from OpenAPI
- **Automated test generation** - AI can create ATCs based on spec
- **MCP integration** - Direct API execution via MCP OpenAPI server

```
┌─────────────────────────────────────────────────────────────────┐
│                    API TESTING ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Backend Repo                    Test Repo (KATA)                │
│  ┌──────────────┐               ┌──────────────────────────┐    │
│  │ openapi.yaml │──── sync ────▶│ /api/openapi.yaml        │    │
│  └──────────────┘               │                          │    │
│                                 │ /api/types.ts (generated)│    │
│                                 └────────────┬─────────────┘    │
│                                              │                   │
│                                              ▼                   │
│                                 ┌──────────────────────────┐    │
│                                 │   MCP OpenAPI Server     │    │
│                                 │   • list-api-endpoints   │    │
│                                 │   • get-api-endpoint-*   │    │
│                                 │   • invoke-api-endpoint  │    │
│                                 └────────────┬─────────────┘    │
│                                              │                   │
│                                              ▼                   │
│                                 ┌──────────────────────────┐    │
│                                 │   AI Agent (Claude)      │    │
│                                 │   • Discovers endpoints  │    │
│                                 │   • Tests API directly   │    │
│                                 │   • Generates ATCs       │    │
│                                 └──────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Setup (5 minutes)

### Step 1: Sync OpenAPI from Backend Repository

```bash
# First time - interactive setup
bun run api:sync

# You'll be prompted for:
# - GitHub repository (e.g., "myorg/backend-api")
# - Branch name (e.g., "main")
# - Path to OpenAPI file (e.g., "docs/openapi.yaml")
```

### Step 2: Generate TypeScript Types

```bash
# Sync and generate types in one command
bun run api:sync -c -t
```

### Step 3: Configure MCP OpenAPI Server

Add to your Claude Code configuration (`.mcp.json` or VS Code settings):

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "mcp-openapi-server"],
      "env": {
        "OPENAPI_SPEC_PATH": "./api/openapi.yaml",
        "API_BASE_URL": "https://staging.yourapp.com/api"
      }
    }
  }
}
```

### Step 4: Verify Setup

Ask the AI:

> "List all available API endpoints"

The AI should use `list-api-endpoints` and show you all endpoints from your spec.

---

## Detailed Configuration

### OpenAPI Sync Script

The sync script (`scripts/sync-openapi.ts`) downloads your OpenAPI spec from a remote GitHub repository.

**Configuration file**: `api/.openapi-config.json`

```json
{
  "repo": "myorg/backend-api",
  "branch": "main",
  "filePath": "docs/openapi.yaml",
  "lastSync": "2024-01-15T10:30:00.000Z"
}
```

**Available commands**:

| Command                  | Description                      |
| ------------------------ | -------------------------------- |
| `bun run api:sync`       | Interactive setup (first time)   |
| `bun run api:sync -c`    | Use saved config (quick update)  |
| `bun run api:sync -c -t` | Sync + generate TypeScript types |
| `bun run api:sync -h`    | Show help                        |

### TypeScript Type Generation

Types are generated using `openapi-typescript` and saved to `api/types.ts`.

**Usage in tests**:

```typescript
import type { paths, components } from '@api/types';

// Request body type
type CreateUserPayload = components['schemas']['CreateUserRequest'];

// Response body type
type UserResponse = components['schemas']['User'];

// Full endpoint types
type CreateUserEndpoint = paths['/users']['post'];
```

### MCP OpenAPI Server Configuration

**Full configuration options**:

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "mcp-openapi-server"],
      "env": {
        "OPENAPI_SPEC_PATH": "./api/openapi.yaml",
        "API_BASE_URL": "https://staging.yourapp.com/api",
        "API_HEADERS": "{\"X-API-Key\": \"your-key\"}",
        "TOOL_LOADING_MODE": "dynamic"
      }
    }
  }
}
```

| Variable            | Description                     | Default   |
| ------------------- | ------------------------------- | --------- |
| `OPENAPI_SPEC_PATH` | Path to OpenAPI file            | Required  |
| `API_BASE_URL`      | Base URL for API calls          | From spec |
| `API_HEADERS`       | JSON string of headers          | `{}`      |
| `TOOL_LOADING_MODE` | `all`, `dynamic`, or `explicit` | `dynamic` |

**Tool loading modes**:

- `all`: Load all endpoints as individual tools
- `dynamic`: Only load meta-tools (list, get-schema, invoke)
- `explicit`: Filter by tags, paths, or methods

---

## Directory Structure

```
/api                              # API documentation directory
├── openapi.yaml                  # OpenAPI specification (synced)
├── types.ts                      # Generated TypeScript types
└── .openapi-config.json          # Sync configuration

/scripts
└── sync-openapi.ts               # Sync script
```

### Adding to .gitignore

```gitignore
# API Documentation (synced from backend)
# Keep config but ignore synced files
/api/openapi.yaml
/api/openapi.json
/api/swagger.yaml
/api/swagger.json
!/api/.openapi-config.json
```

**Note**: You may want to commit `openapi.yaml` if your CI needs it without access to the backend repo.

---

## Using OpenAPI with AI

### Discovering Endpoints

```
User: "What endpoints are available for user management?"

AI uses: list-api-endpoints
AI responds: "I found the following user endpoints:
- POST /users - Create user
- GET /users/{id} - Get user by ID
- PUT /users/{id} - Update user
- DELETE /users/{id} - Delete user"
```

### Getting Endpoint Details

```
User: "What's the schema for creating a user?"

AI uses: get-api-endpoint-schema (operationId: createUser)
AI responds: "The POST /users endpoint requires:
- email (string, required)
- password (string, required, min 8 chars)
- name (string, optional)

Response: 201 with user object including id, email, name, createdAt"
```

### Testing Endpoints Directly

```
User: "Test the create user endpoint with sample data"

AI uses: invoke-api-endpoint
AI executes: POST /users with generated test data
AI responds: "API call successful:
- Status: 201
- Response: { id: 'abc123', email: 'test@example.com', ... }"
```

### Generating ATCs

```
User: "Create an ATC for user creation based on the OpenAPI spec"

AI:
1. Uses get-api-endpoint-schema to understand the endpoint
2. Uses generated types from api/types.ts
3. Creates UserApi.ts with createUserSuccessfully ATC
4. Includes proper request/response types
```

---

## Authentication Setup

### JWT Bearer Token

```json
{
  "mcpServers": {
    "openapi": {
      "env": {
        "API_HEADERS": "{\"Authorization\": \"Bearer ${API_TOKEN}\"}"
      }
    }
  }
}
```

### API Key

```json
{
  "mcpServers": {
    "openapi": {
      "env": {
        "API_HEADERS": "{\"X-API-Key\": \"${API_KEY}\"}"
      }
    }
  }
}
```

### Dynamic Auth (Login First)

For APIs requiring login, the AI can:

1. Use `invoke-api-endpoint` to call login endpoint
2. Extract token from response
3. Include token in subsequent requests

```typescript
// AI workflow:
// 1. invoke-api-endpoint: POST /auth/login
// 2. Extract: response.session.access_token
// 3. Update headers for subsequent calls
```

---

## Fallback: No OpenAPI Available

If the project doesn't have an OpenAPI specification:

### Option 1: Create Minimal Spec Manually

Create `api/openapi.yaml`:

```yaml
openapi: 3.0.0
info:
  title: Project API
  version: 1.0.0
servers:
  - url: https://api.yourapp.com
paths:
  /auth/login:
    post:
      summary: User login
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
              required: [email, password]
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
```

### Option 2: AI-Assisted Spec Creation

Ask the AI to help create the spec:

```
User: "I don't have an OpenAPI spec. Help me create one.
The API has these endpoints:
- POST /auth/login (email, password) → returns token
- GET /users/me → returns current user
- POST /users → creates user"

AI: Creates api/openapi.yaml with proper schema
```

### Option 3: Network Capture

Use Playwright MCP to capture network requests and build spec:

```
User: "Explore the UI and document the API calls"

AI:
1. Uses browser_navigate to navigate the app
2. Uses browser_network_requests to capture API calls
3. Documents endpoints, payloads, responses
4. Optionally creates OpenAPI spec from captured data
```

---

## Integration with KATA Workflow

The KATA workflow automatically uses OpenAPI when available:

```
Phase 1.5: API Discovery
├── Check for api/openapi.yaml
├── If exists → Use MCP OpenAPI server tools
├── If not exists → Ask user about API documentation
│   ├── Offer to sync from backend repo
│   ├── Offer to create minimal spec
│   └── Use network capture as fallback
└── Generate TypeScript types if spec available
```

---

## Troubleshooting

| Issue                          | Solution                                              |
| ------------------------------ | ----------------------------------------------------- |
| `gh` not authenticated         | Run `gh auth login`                                   |
| OpenAPI file not found in repo | Verify path with `gh api /repos/owner/repo/contents/` |
| MCP server not connecting      | Check `OPENAPI_SPEC_PATH` is correct                  |
| Types not generating           | Ensure spec is valid YAML/JSON                        |
| API calls failing              | Verify `API_BASE_URL` and auth headers                |

### Validating OpenAPI Spec

```bash
# Install validator
bun add -d @apidevtools/swagger-cli

# Validate spec
bunx swagger-cli validate api/openapi.yaml
```

---

## Best Practices

1. **Keep OpenAPI synced** - Run `bun run api:sync -c` regularly
2. **Generate types** - Always regenerate types after sync
3. **Version your config** - Commit `api/.openapi-config.json`
4. **Use environment variables** - Don't hardcode tokens in config
5. **Document auth flow** - Note how to get auth tokens

---

## References

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [MCP OpenAPI Server](https://github.com/ivo-toby/mcp-openapi-server)
- [openapi-typescript](https://openapi-ts.dev/)
- [KATA Framework Setup](../../.prompts/kata-framework-setup.md)
- [API Automation Prompt](../../.prompts/fase-12-test-automation/automation-integration-test.md)
