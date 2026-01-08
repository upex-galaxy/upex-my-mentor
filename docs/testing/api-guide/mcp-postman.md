# API Testing con Postman MCP

Esta guia explica como configurar y usar el **Postman MCP Server oficial** para testing de APIs asistido por IA en proyectos Supabase + Next.js.

---

## Que es Postman MCP?

El **Postman MCP Server** conecta Postman con herramientas de IA, permitiendo a agentes y asistentes:

- Acceder y gestionar workspaces
- Crear y modificar colecciones
- Manejar environments y variables
- Ejecutar colecciones de tests
- Generar codigo cliente desde specs
- Automatizar workflows via lenguaje natural

---

## Modos de Configuracion

El Postman MCP ofrece tres modos segun tus necesidades:

| Modo        | Tools | Descripcion                                             | URL Remota                        |
| ----------- | ----- | ------------------------------------------------------- | --------------------------------- |
| **Minimal** | ~40   | Operaciones basicas (crear, leer colecciones/envs)      | `https://mcp.postman.com/minimal` |
| **Code**    | ~50   | Minimal + busqueda de APIs + generacion de codigo       | `https://mcp.postman.com/code`    |
| **Full**    | 111+  | Todas las herramientas de la Postman API (colaboracion) | `https://mcp.postman.com/mcp`     |

> Para usuarios en la UE, usar `https://mcp.eu.postman.com/` en lugar de `https://mcp.postman.com/`.

---

## Requisitos Previos

### 1. Obtener API Key de Postman

1. Ve a [Postman Settings > API Keys](https://postman.postman.co/settings/me/api-keys)
2. Click en **Generate API Key**
3. Dale un nombre descriptivo (ej: "MCP Claude Code")
4. Copia la key (solo se muestra una vez)

### 2. Guardar la API Key

```bash
# En tu archivo .env o secrets
POSTMAN_API_KEY=PMAK-xxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Configuracion por Herramienta

### Claude Code

**Servidor Remoto (Recomendado):**

```json
{
  "postman": {
    "type": "http",
    "url": "https://mcp.postman.com/mcp",
    "headers": {
      "Authorization": "Bearer ${POSTMAN_API_KEY}"
    }
  }
}
```

Para modo **Minimal** (menos tools, mas rapido):

```json
{
  "postman": {
    "type": "http",
    "url": "https://mcp.postman.com/minimal",
    "headers": {
      "Authorization": "Bearer ${POSTMAN_API_KEY}"
    }
  }
}
```

**Servidor Local (STDIO):**

```json
{
  "postman": {
    "command": "npx",
    "args": ["-y", "@postman/postman-mcp-server", "--full"],
    "env": {
      "POSTMAN_API_KEY": "${POSTMAN_API_KEY}"
    }
  }
}
```

### VS Code (Copilot/Claude Extension)

Crear `.vscode/mcp.json`:

```json
{
  "servers": {
    "postman": {
      "type": "stdio",
      "command": "npx",
      "args": ["@postman/postman-mcp-server", "--full"],
      "env": {
        "POSTMAN_API_KEY": "${input:postman-api-key}"
      }
    }
  },
  "inputs": [
    {
      "id": "postman-api-key",
      "type": "promptString",
      "description": "Enter your Postman API key"
    }
  ]
}
```

### Cursor

```json
{
  "mcpServers": {
    "postman": {
      "command": "npx",
      "args": ["-y", "@postman/postman-mcp-server", "--full"],
      "env": {
        "POSTMAN_API_KEY": "PMAK-xxxxx"
      }
    }
  }
}
```

### Gemini CLI

Ejecutar en terminal:

```bash
gemini mcp install @postman/postman-mcp-server
```

---

## Herramientas Disponibles

### Modo Minimal (~40 tools)

Herramientas esenciales para operaciones basicas:

| Categoria        | Herramientas                                                                 |
| ---------------- | ---------------------------------------------------------------------------- |
| **Collections**  | `getCollections`, `getCollection`, `createCollection`, `putCollection`       |
| **Requests**     | `createCollectionRequest`, `createCollectionResponse`                        |
| **Environments** | `getEnvironments`, `getEnvironment`, `createEnvironment`, `putEnvironment`   |
| **Workspaces**   | `getWorkspaces`, `getWorkspace`, `createWorkspace`, `updateWorkspace`        |
| **Specs**        | `getAllSpecs`, `getSpec`, `createSpec`, `getSpecDefinition`                  |
| **Mocks**        | `getMocks`, `getMock`, `createMock`, `updateMock`, `publishMock`             |
| **Execution**    | `runCollection`, `duplicateCollection`                                       |
| **Generation**   | `generateCollection`, `generateSpecFromCollection`, `syncCollectionWithSpec` |

### Modo Full (111+ tools)

Incluye todo de Minimal mas:

| Categoria           | Herramientas Adicionales                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **Collections**     | `deleteCollection`, `patchCollection`, `getCollectionForks`, `mergeCollectionFork`                        |
| **Folders**         | `createCollectionFolder`, `updateCollectionFolder`, `deleteCollectionFolder`, `transferCollectionFolders` |
| **Requests**        | `updateCollectionRequest`, `deleteCollectionRequest`, `transferCollectionRequests`                        |
| **Comments**        | `createCollectionComment`, `getFolderComments`, `createRequestComment`, `resolveCommentThread`            |
| **Monitors**        | `createMonitor`, `getMonitors`, `runMonitor`, `updateMonitor`, `deleteMonitor`                            |
| **Tags**            | `getCollectionTags`, `updateCollectionTags`, `getTaggedEntities`                                          |
| **Documentation**   | `publishDocumentation`, `unpublishDocumentation`                                                          |
| **Private Network** | `getAllElementsAndFolders`, `postPanElementOrFolder`                                                      |

---

## Casos de Uso para API Testing

### 1. Obtener Colecciones del Workspace

```
Usuario: "Lista mis colecciones en el workspace de QA"

IA ejecutara:
1. getWorkspaces → encontrar workspace "QA"
2. getCollections(workspace: "workspace-id") → listar colecciones
```

### 2. Ejecutar Coleccion de Tests

```
Usuario: "Ejecuta la coleccion 'API Regression Tests'"

IA ejecutara:
1. getCollections → buscar coleccion por nombre
2. runCollection(collectionId: "collection-id") → ejecutar tests

Resultado: Estadisticas de tests (passed, failed, duration)
```

### 3. Crear Environment para Testing

```
Usuario: "Crea un environment de staging con las variables de Supabase"

IA ejecutara:
createEnvironment({
  name: "Staging",
  values: [
    { key: "base_url", value: "https://xxx.supabase.co" },
    { key: "anon_key", value: "eyJ...", type: "secret" },
    { key: "test_user_email", value: "test@example.com" }
  ]
})
```

### 4. Generar Coleccion desde OpenAPI Spec

```
Usuario: "Genera una coleccion desde mi spec de OpenAPI"

IA ejecutara:
1. createSpec → subir el spec
2. generateCollection(specId: "spec-id", name: "Generated API Tests")
```

### 5. Sincronizar Coleccion con Spec

```
Usuario: "Actualiza mi coleccion para que coincida con el nuevo spec"

IA ejecutara:
syncCollectionWithSpec(collectionUid: "uid", specId: "spec-id")
```

---

## Flujo de Testing con IA

### Flujo 1: Setup Inicial de Testing

```
Usuario: "Configura un ambiente de testing para mi proyecto Supabase"

IA:
1. getWorkspaces() → verificar workspaces existentes
2. createWorkspace({ name: "{{PROJECT}} Testing" })
3. createEnvironment({
     workspace: "workspace-id",
     name: "Development",
     values: [
       { key: "base_url", value: "{{SUPABASE_URL}}" },
       { key: "anon_key", value: "{{ANON_KEY}}", type: "secret" },
       { key: "access_token", value: "", type: "secret" }
     ]
   })
4. createCollection({
     workspace: "workspace-id",
     name: "API Tests"
   })

Resultado: Workspace, environment y coleccion listos para testing
```

### Flujo 2: Agregar Tests a Coleccion

```
Usuario: "Agrega un request para probar el login de Supabase"

IA:
createCollectionRequest({
  collectionId: "collection-id",
  name: "Login - User",
  request: {
    method: "POST",
    url: "{{base_url}}/auth/v1/token?grant_type=password",
    header: [
      { key: "apikey", value: "{{anon_key}}" },
      { key: "Content-Type", value: "application/json" }
    ],
    body: {
      mode: "raw",
      raw: JSON.stringify({
        email: "{{test_email}}",
        password: "{{test_password}}"
      })
    }
  }
})
```

### Flujo 3: Ejecutar y Analizar Tests

```
Usuario: "Ejecuta mis tests de regression y dime si hay errores"

IA:
1. getCollections() → encontrar "API Regression Tests"
2. runCollection(collectionId, environmentId)
3. Analizar resultados:
   - Total: 25 tests
   - Passed: 23
   - Failed: 2
   - Errores en: "Create Order", "Update Profile"
4. Sugerir fixes basados en los errores
```

---

## Integracion con Otros MCPs

### postman + dbhub (Recomendado para Testing Completo)

Combinar ambos MCPs para testing end-to-end:

```json
{
  "postman": {
    "type": "http",
    "url": "https://mcp.postman.com/mcp",
    "headers": { "Authorization": "Bearer ${POSTMAN_API_KEY}" }
  },
  "dbhub": {
    "command": "npx",
    "args": ["-y", "@bytebase/dbhub", "--transport", "stdio"],
    "env": {
      "DB_TYPE": "postgres",
      "DB_HOST": "aws-0-us-east-1.pooler.supabase.com",
      "DB_PORT": "6543",
      "DB_USER": "qa_team.{{PROJECT_REF}}",
      "DB_PASSWORD": "${DB_PASSWORD}",
      "DB_NAME": "postgres"
    }
  }
}
```

**Flujo combinado:**

```
Usuario: "Verifica que la API de productos funciona correctamente"

IA:
1. [dbhub] mcp__dbhub__query → verificar datos en DB
2. [postman] runCollection → ejecutar tests de API
3. Comparar resultados de DB con respuestas de API
4. Reportar discrepancias
```

### postman + openapi

```json
{
  "postman": { "..." },
  "openapi": {
    "command": "npx",
    "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
    "env": {
      "API_BASE_URL": "{{SUPABASE_URL}}/rest/v1",
      "OPENAPI_SPEC_PATH": "{{SUPABASE_URL}}/rest/v1/?apikey={{ANON_KEY}}"
    }
  }
}
```

---

## Limitaciones y Workarounds

### 1. No Ejecuta Requests Individuales

**Problema:** Postman MCP ejecuta colecciones completas, no requests individuales.

**Workaround:**

- Crear colecciones de un solo request para tests aislados
- O usar el OpenAPI MCP para requests directos

### 2. Variables de Environment en Secrets

**Problema:** Variables sensibles deben estar configuradas previamente.

**Workaround:**

```
Usuario: "Actualiza el access_token en mi environment"

IA:
patchEnvironment({
  environmentId: "env-id",
  body: [{
    op: "replace",
    path: "/values/0/value",
    value: "nuevo-token-jwt"
  }]
})
```

### 3. Rate Limits de la API

**Problema:** La Postman API tiene rate limits.

**Recomendacion:**

- Usar modo **Minimal** cuando sea posible
- Cachear resultados de `getCollections`, `getWorkspaces`
- Evitar llamadas repetitivas en loops

---

## Ejemplos Practicos

### Ejemplo 1: Crear Suite de Tests para CRUD

```
Usuario: "Crea una coleccion con tests CRUD para la entidad 'products'"

IA ejecutara:
1. createCollection({ name: "Products CRUD Tests" })
2. createCollectionFolder({ name: "Create" })
3. createCollectionRequest({ name: "POST /products", ... })
4. createCollectionFolder({ name: "Read" })
5. createCollectionRequest({ name: "GET /products", ... })
6. createCollectionRequest({ name: "GET /products/:id", ... })
7. createCollectionFolder({ name: "Update" })
8. createCollectionRequest({ name: "PATCH /products/:id", ... })
9. createCollectionFolder({ name: "Delete" })
10. createCollectionRequest({ name: "DELETE /products/:id", ... })
```

### Ejemplo 2: Verificar Estado de Coleccion

```
Usuario: "Revisa mi coleccion de tests y dime que tiene"

IA:
1. getCollection(collectionId, model: "full")
2. Analizar estructura:
   - 3 folders: Auth, Products, Orders
   - 12 requests total
   - 8 tests con scripts
   - 4 requests sin tests
3. Recomendar: "Los requests X, Y, Z no tienen tests. Quieres que los agregue?"
```

### Ejemplo 3: Duplicar Coleccion para Otro Environment

```
Usuario: "Duplica mi coleccion de dev para staging"

IA:
1. getCollection(collectionId) → obtener coleccion original
2. duplicateCollection({
     collectionId: "original-id",
     workspace: "staging-workspace-id"
   })
3. getDuplicateCollectionTaskStatus(taskId) → verificar completado
4. Reportar: "Coleccion duplicada exitosamente. Nueva URL: ..."
```

---

## Mejores Practicas

### 1. Organizar Colecciones por Proposito

```
Workspace: {{PROJECT}} API Testing
├── Collections/
│   ├── Smoke Tests (5-10 requests criticos)
│   ├── Regression Tests (todos los endpoints)
│   ├── Performance Tests (requests con delays)
│   └── Security Tests (autenticacion, RLS)
├── Environments/
│   ├── Development
│   ├── Staging
│   └── Production (read-only)
```

### 2. Usar Variables para Flexibilidad

```javascript
// En Pre-request script de coleccion
const baseUrl = pm.environment.get('base_url');
const apiKey = pm.environment.get('anon_key');

// Los requests usan {{base_url}} y {{anon_key}}
```

### 3. Documentar Requests con Descripciones

```
Usuario: "Agrega descripcion al request de login"

IA:
updateCollectionRequest({
  requestId: "request-id",
  collectionId: "collection-id",
  description: "Autentica un usuario y retorna JWT token. El token se guarda automaticamente en la variable {{access_token}}."
})
```

---

## Troubleshooting

### Error: "Invalid API Key"

```
Verificar:
1. API key tiene formato correcto: PMAK-xxxxx-xxxxx
2. Key no ha expirado
3. Key tiene permisos para las operaciones requeridas
```

### Error: "Collection not found"

```
Verificar:
1. Usar collection UID (formato: owner-uuid), no solo el ID
2. Tener acceso al workspace donde esta la coleccion
3. La coleccion no fue eliminada
```

### Error: "Rate limit exceeded"

```
Solucion:
1. Esperar 60 segundos
2. Reducir frecuencia de llamadas
3. Usar modo Minimal en lugar de Full
```

---

## Recursos Adicionales

- [Postman MCP Server - Documentacion Oficial](https://learning.postman.com/docs/developer/postman-api/postman-mcp-server/set-up-postman-mcp-server/)
- [Postman MCP Server - NPM](https://www.npmjs.com/package/@postman/postman-mcp-server)
- [Postman MCP Server - GitHub](https://github.com/postmanlabs/postman-mcp-server)
- [Postman API Documentation](https://www.postman.com/postman/workspace/postman-public-workspace/)

---

## Siguiente Paso

Para testing manual con Postman (sin MCP):
--> [postman-testing.md](./postman-testing.md)

Para testing con otros MCPs (OpenAPI, SQL):
--> [mcp-testing.md](./mcp-testing.md)
