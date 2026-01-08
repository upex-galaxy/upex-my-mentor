# UI Testing Guide

Guia para testing de interfaces de usuario en proyectos Supabase + Next.js.

---

## Proposito

Esta guia cubre el testing de la capa UI, incluyendo:

- Testing exploratorio con Playwright MCP
- Debugging con DevTools MCP
- Preparacion para automatizacion E2E

---

## Documentos en Esta Guia

| Documento                   | Proposito                              |
| --------------------------- | -------------------------------------- |
| `mcp-playwright.md`         | Configuracion y uso del Playwright MCP |
| `mcp-devtools.md`           | Debugging con DevTools MCP             |
| `exploratory-ui-testing.md` | Tecnicas de exploracion manual con IA  |

---

## Integracion con Trifuerza Testing

UI Testing es una de las tres capas del Trifuerza:

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIFUERZA TESTING                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     UI      │  │     API     │  │     DB      │         │
│  │  Testing    │  │  Testing    │  │  Testing    │         │
│  │   (THIS)    │  │             │  │             │         │
│  │ Playwright  │  │  Postman/   │  │   DBHub     │         │
│  │    MCP      │  │ OpenAPI MCP │  │    MCP      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

**Flujo recomendado:**

1. **UI Testing** - Validar experiencia de usuario
2. **API Testing** - Verificar que backend responde correctamente
3. **DB Testing** - Confirmar integridad de datos

---

## MCPs para UI Testing

| MCP          | Proposito                              |
| ------------ | -------------------------------------- |
| `playwright` | Navegacion, interacciones, screenshots |
| `devtools`   | Console, network, debugging            |

---

## Cuando Usar UI Testing

| Escenario                 | Usar UI Testing |
| ------------------------- | --------------- |
| Validar flujos de usuario | Si              |
| Verificar formularios     | Si              |
| Probar navegacion         | Si              |
| Verificar estilos/layout  | Si              |
| Testing de API sin UI     | No (usar API)   |
| Verificar datos en DB     | No (usar DB)    |

---

## Flujo de Testing Exploratorio UI

```
1. Navegar a la pagina objetivo
   └── mcp__playwright__browser_navigate

2. Capturar estructura de la pagina
   └── mcp__playwright__browser_snapshot

3. Interactuar con elementos
   └── mcp__playwright__browser_click
   └── mcp__playwright__browser_type

4. Capturar evidencia
   └── mcp__playwright__browser_take_screenshot

5. Verificar console/network si hay errores
   └── mcp__devtools__* (si aplica)
```

---

## Recursos Relacionados

### Prompts de Exploratory Testing

- `.prompts/fase-10-exploratory-testing/exploratory-test.md` - UI Testing
- `.prompts/fase-10-exploratory-testing/smoke-test.md` - Smoke tests

### Guidelines

- `.context/guidelines/MCP/playwright.md` - Referencia rapida del MCP
- `.context/guidelines/MCP/devtools.md` - Referencia rapida del MCP
- `.context/guidelines/QA/exploratory-testing.md` - Tecnicas de exploracion

### Automatizacion (TAE)

Para automatizar tests E2E con Playwright:

- `.context/guidelines/TAE/KATA-AI-GUIDE.md` - Entry point para IA
- `.context/guidelines/TAE/kata-architecture.md` - Arquitectura KATA
- `.context/guidelines/TAE/automation-standards.md` - Estandares

---

## Ver Tambien

- [API Guide](../api-guide/README.md) - Testing de APIs
- [Database Guide](../database-guide/README.md) - Testing de base de datos
- [Project Management Guide](../project-management-guide/README.md) - Jira y GitHub
- [Monitoring Guide](../monitoring-guide/README.md) - Sentry y Slack
- [Research Guide](../research-guide/README.md) - Context7 y Tavily
