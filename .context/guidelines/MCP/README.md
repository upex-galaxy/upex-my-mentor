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
| Postman    | `postman.md`    | API testing, endpoints              |
| Sentry     | `sentry.md`     | Errores en producción               |
| Atlassian  | `atlassian.md`  | Jira, Confluence                    |
| GitHub     | `github.md`     | Issues, PRs, código                 |
| Slack      | `slack.md`      | Notificaciones, reportes            |
| Memory     | `memory.md`     | Contexto entre sesiones             |

---

## Decision Tree: ¿Qué MCP usar?

```
¿Necesitas información de...?

├─ Base de datos → supabase.md
│   └─ Schema, datos, policies
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
├─ E2E testing → playwright.md
│   └─ User flows, interactions
│
├─ E2E debugging → devtools.md
│   └─ Console, network, performance
│
├─ API testing → postman.md
│   └─ Endpoints, responses
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
Secundarios: github, postman
```

### QA (Testing Manual)

```
Primarios: atlassian, playwright (para explorar)
Secundarios: tavily, slack
```

### TAE (Test Automation)

```
Primarios: playwright, devtools, context7
Secundarios: postman, sentry, tavily
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

**Última actualización**: 2025-12-21
