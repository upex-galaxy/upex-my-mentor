# MCP - Model Context Protocol Guidelines

> **Para**: Todos los roles (DEV, QA, TAE)
> **Propósito**: Saber CUÁNDO y CÓMO usar cada MCP

---

## Principio General

**Usar MCPs para datos EN VIVO, NO para documentación estática.**

```
Living Data (usar MCP) vs Static Docs (leer archivo)

✅ MCP: Database schema actual
❌ Docs: Schema hardcodeado (puede estar desactualizado)

✅ MCP: Issues abiertas en Jira
❌ Docs: Lista de issues estática

✅ MCP: Documentación oficial de biblioteca
❌ Docs: Tutorial copiado que puede estar obsoleto
```

---

## MCPs Disponibles

| MCP        | Archivo         | Cuándo usar                         |
| ---------- | --------------- | ----------------------------------- |
| Supabase   | `supabase.md`   | Schema, datos, policies de DB       |
| Context7   | `context7.md`   | Docs oficiales de bibliotecas       |
| Tavily     | `tavily.md`     | Búsqueda web, foros, Stack Overflow |
| Playwright | `playwright.md` | Tests E2E, interacciones UI         |
| DevTools   | `devtools.md`   | Debug de tests, network, console    |
| Postman    | `postman.md`    | API testing con colecciones         |
| OpenAPI    | `openapi.md`    | API testing via spec (requests)     |
| DBHub      | `dbhub.md`      | SQL queries, verificación de datos  |
| Sentry     | `sentry.md`     | Errores en producción               |
| Atlassian  | `atlassian.md`  | Jira, Confluence                    |
| GitHub     | `github.md`     | Issues, PRs, código                 |
| Slack      | `slack.md`      | Notificaciones, reportes            |
| Memory     | `memory.md`     | Contexto entre sesiones             |

### MCPs para Trifuerza Testing

| Capa | MCPs                 | Documentación                  |
| ---- | -------------------- | ------------------------------ |
| UI   | `playwright`         | `docs/testing/ui-guide/`       |
| API  | `postman`, `openapi` | `docs/testing/api-guide/`      |
| DB   | `dbhub`              | `docs/testing/database-guide/` |

---

## Decision Tree: ¿Qué MCP usar?

```
¿Necesitas información de...?

├─ Base de datos (schema) → supabase.md
│   └─ Schema, policies, migraciones
│
├─ Base de datos (queries) → dbhub.md
│   └─ SQL directo, verificación de datos
│
├─ Documentación oficial → context7.md
│   └─ Next.js, React, Playwright docs
│
├─ Búsqueda web / foros → tavily.md
│   └─ Stack Overflow, GitHub issues, blogs
│
├─ Project management → atlassian.md
│   └─ Issues, stories, requirements
│
├─ UI/E2E testing → playwright.md
│   └─ User flows, interactions, screenshots
│
├─ E2E debugging → devtools.md
│   └─ Console, network, performance
│
├─ API testing (colecciones) → postman.md
│   └─ Test suites, auth flows
│
├─ API testing (requests) → openapi.md
│   └─ Quick requests via spec
│
├─ Error monitoring → sentry.md
│   └─ Production errors, stack traces
│
├─ Repository → github.md
│   └─ Issues, PRs, código
│
├─ Team communication → slack.md
│   └─ Notifications, reports
│
└─ Session memory → memory.md
    └─ Contexto entre sesiones
```

---

## MCPs por Rol

### DEV (Desarrollo)

```
Primarios: supabase, context7, tavily
Secundarios: github, postman, openapi
```

### QA (Testing Manual)

```
Primarios: atlassian, playwright, postman, dbhub
Secundarios: openapi, tavily, slack
Trifuerza: playwright (UI) + postman/openapi (API) + dbhub (DB)
```

### TAE (Test Automation)

```
Primarios: playwright, devtools, context7
Secundarios: postman, openapi, dbhub, sentry, tavily
```

---

## Optimización de Tokens

Usar el MCP Builder para cargar solo los MCPs necesarios:

```bash
# Solo para backend
node scripts/mcp-builder.js backend
# Carga: supabase + context7 + tavily

# Solo para frontend
node scripts/mcp-builder.js frontend
# Carga: context7 + tavily + playwright

# Solo para testing
node scripts/mcp-builder.js uitest
# Carga: playwright + devtools + context7 + tavily
```

Ver `docs/mcp-builder-strategy.md` para más detalles.

---

## Regla de Oro

**Context7 para "cómo usar", Tavily para "cómo resolver"**

| Pregunta                               | MCP      |
| -------------------------------------- | -------- |
| "¿Cómo usar useState en React?"        | Context7 |
| "Error: hydration mismatch en Next.js" | Tavily   |
| "¿Playwright tiene retry automático?"  | Context7 |
| "Best practices para folder structure" | Tavily   |

---

**Última actualización**: 2025-12-26
