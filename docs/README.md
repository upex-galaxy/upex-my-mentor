# Documentacion del Proyecto

Bienvenido a la documentacion del **AI-Driven Software Project Template**.

Esta documentacion esta orientada a **humanos** - para aprender conceptos, entender arquitecturas y seguir guias paso a paso.

> **Nota**: Para documentacion orientada a **IA**, consulta `.context/guidelines/`.

---

## Estructura de Documentos

```
docs/
├── architecture/          # Arquitectura del proyecto
│   └── ai-driven-blueprint.md
│
├── workflows/             # Flujos de trabajo
│   ├── ambientes.md       # Ambientes de desarrollo (dev, staging, prod)
│   └── git-flow-guide.md  # Guia de Git Flow
│
├── mcp/                   # Model Context Protocol
│   ├── README.md          # Conceptos generales de MCP
│   ├── builder-strategy.md
│   ├── claude-code.md
│   ├── gemini-cli.md
│   ├── copilot-cli.md
│   └── vscode.md
│
└── testing/               # Testing y QA
    ├── api-guide/         # API Testing (Supabase + Next.js)
    ├── database-guide/    # Database Testing con MCPs
    └── test-architecture/ # Arquitecturas de testing (KATA)
```

---

## Arquitectura

### [AI-Driven Software Project Blueprint](./architecture/ai-driven-blueprint.md)

Documentacion completa de la metodologia y estructura del proyecto. Incluye las 13 fases del desarrollo impulsado por IA (3 sincronicas + 10 asincronicas).

---

## Workflows

### [Ambientes de Desarrollo](./workflows/ambientes.md)

Guia educativa sobre ambientes de desarrollo:

- Local, Development, Staging, Production
- Diferencias entre empresas
- Relacion entre ramas Git y ambientes

### [Git Flow Guide](./workflows/git-flow-guide.md)

Tutorial sobre Git Flow simplificado para trabajo con IA:

- Estructura de ramas (main, staging, feature/\*)
- Ciclo de trabajo tipico
- Commits semanticos
- Pull Requests

---

## MCP (Model Context Protocol)

### [Conceptos Generales](./mcp/README.md)

Introduccion a MCP:

- Que es MCP y como funciona
- Tipos de transporte (stdio, SSE, HTTP)
- Seguridad y autenticacion
- Casos de uso comunes

### [MCP Builder Strategy](./mcp/builder-strategy.md)

Sistema de configuracion dinamica de MCPs:

- Problema del "Token Hell"
- Carga de MCPs por sesion
- Optimizacion de uso de tokens (80-90% reduccion)

### Configuracion por Herramienta

| Herramienta        | Documento                              |
| ------------------ | -------------------------------------- |
| Claude Code        | [claude-code.md](./mcp/claude-code.md) |
| Gemini CLI         | [gemini-cli.md](./mcp/gemini-cli.md)   |
| GitHub Copilot CLI | [copilot-cli.md](./mcp/copilot-cli.md) |
| VS Code            | [vscode.md](./mcp/vscode.md)           |

---

## Testing

### [API Testing Guide](./testing/api-guide/README.md)

Guia completa de API Testing para proyectos Supabase + Next.js:

| Documento                                                          | Descripcion                      |
| ------------------------------------------------------------------ | -------------------------------- |
| [architecture.md](./testing/api-guide/architecture.md)             | Vision general de las 2 APIs     |
| [authentication.md](./testing/api-guide/authentication.md)         | Como usar tokens para ambas APIs |
| [devtools-testing.md](./testing/api-guide/devtools-testing.md)     | Testing manual con DevTools      |
| [postman-testing.md](./testing/api-guide/postman-testing.md)       | Testing con Postman              |
| [mcp-testing.md](./testing/api-guide/mcp-testing.md)               | Testing asistido por IA          |
| [playwright-testing.md](./testing/api-guide/playwright-testing.md) | Testing automatizado             |

### [Database Testing Guide](./testing/database-guide/README.md)

Guia de testing de bases de datos con MCPs:

| Documento                                                         | Descripcion                    |
| ----------------------------------------------------------------- | ------------------------------ |
| [concepts.md](./testing/database-guide/concepts.md)               | Conceptos de API vs DB testing |
| [mcp-dbhub.md](./testing/database-guide/mcp-dbhub.md)             | Configuracion DBHub MCP        |
| [mcp-openapi.md](./testing/database-guide/mcp-openapi.md)         | Configuracion OpenAPI MCP      |
| [troubleshooting.md](./testing/database-guide/troubleshooting.md) | Solucion de problemas          |

### [Test Architecture](./testing/test-architecture/)

Documentacion conceptual de arquitecturas de testing:

| Documento                                                                | Descripcion                             |
| ------------------------------------------------------------------------ | --------------------------------------- |
| [kata-fundamentals.md](./testing/test-architecture/kata-fundamentals.md) | Filosofia y conceptos de KATA Framework |

---

## Quick Start

### 1. Elige tu herramienta de IA

- Claude Code → [Configuracion](./mcp/claude-code.md)
- Gemini CLI → [Configuracion](./mcp/gemini-cli.md)
- GitHub Copilot CLI → [Configuracion](./mcp/copilot-cli.md)
- VS Code → [Configuracion](./mcp/vscode.md)

### 2. Configura MCP Builder

```bash
# Lee la estrategia
cat docs/mcp/builder-strategy.md

# Copia template
cp templates/mcp/gemini.template.json .gemini/settings.catalog.json

# Agrega tus API keys al archivo copiado

# Ejecuta el builder
node scripts/mcp-builder.js backend
```

### 3. Empieza a desarrollar

- Sigue el [Blueprint](./architecture/ai-driven-blueprint.md)
- Lee los [workflows](./workflows/)
- Implementa tests siguiendo las [guias de testing](./testing/)

---

## Relacion con `.context/`

| Directorio  | Audiencia | Proposito                                      |
| ----------- | --------- | ---------------------------------------------- |
| `docs/`     | Humanos   | Aprendizaje, tutoriales, referencia            |
| `.context/` | IA        | Guidelines, memoria persistente, instrucciones |

**Regla general**:

- Si necesitas **aprender** algo → `docs/`
- Si la IA necesita **recordar** algo → `.context/guidelines/`

---

## Contribuir

Para agregar documentacion:

1. **Educativa/Tutorial** → Agregar en `docs/` apropiado
2. **Guidelines para IA** → Agregar en `.context/guidelines/`
3. **Prompts ejecutables** → Agregar en `.prompts/`

---

**Ultima actualizacion**: 2025-12-22
