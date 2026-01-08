# Guidelines - Reference Material

> **Propósito**: Guidelines que la IA debe leer antes de trabajar
> **Principio**: Cada carpeta corresponde a un ROL específico

---

## Estructura por Rol

```
guidelines/
├── README.md (este archivo)
│
├── DEV/                           # Development Guidelines
│   ├── README.md                  # Índice de DEV
│   ├── code-standards.md          # DRY, KISS, naming, TypeScript
│   ├── error-handling.md          # Custom errors, retry, logging
│   ├── data-testid-standards.md   # Cómo CREAR data-testid
│   └── spec-driven-development.md # Principio SDD
│
├── QA/                            # Quality Engineering Guidelines
│   ├── README.md                  # Índice de QA
│   ├── spec-driven-testing.md     # Principio SDT
│   ├── exploratory-testing.md     # Técnicas de testing exploratorio
│   ├── data-testid-usage.md       # Cómo USAR data-testid en tests
│   └── jira-test-management.md    # Gestión de tests en Jira
│
├── TAE/                           # Test Automation Engineering
│   ├── README.md                  # Índice de TAE
│   ├── KATA-AI-GUIDE.md           # Entry point para IA
│   ├── kata-architecture.md       # Arquitectura KATA
│   ├── automation-standards.md    # Estándares de tests
│   ├── api-setup-guide.md         # Setup de API testing
│   ├── test-data-management.md    # Manejo de datos de prueba
│   ├── tms-integration.md         # Integración con Jira/Xray
│   └── ci-cd-integration.md       # Integración con CI/CD
│
└── MCP/                           # MCP Guidelines (atomizado)
    ├── README.md                  # Overview + decision tree
    ├── supabase.md                # Solo Supabase
    ├── context7.md                # Solo Context7
    ├── tavily.md                  # Solo Tavily
    ├── playwright.md              # Solo Playwright
    ├── devtools.md                # Solo DevTools
    ├── postman.md                 # Solo Postman
    ├── sentry.md                  # Solo Sentry
    ├── atlassian.md               # Solo Atlassian/Jira
    ├── github.md                  # Solo GitHub
    ├── slack.md                   # Solo Slack
    └── memory.md                  # Solo Memory
```

---

## Uso por Rol

### Desarrollador (DEV)

```
Leer ANTES de implementar:
├── DEV/code-standards.md
├── DEV/error-handling.md
├── DEV/data-testid-standards.md
├── DEV/spec-driven-development.md
└── MCP/ (los que necesites)
```

### QA Engineer (Testing Manual)

```
Leer ANTES de testear:
├── QA/spec-driven-testing.md
├── QA/exploratory-testing.md
├── QA/data-testid-usage.md
├── QA/jira-test-management.md
└── MCP/ (los que necesites)
```

### QA Automation Engineer (TAE)

```
Leer ANTES de automatizar:
├── TAE/KATA-AI-GUIDE.md (entry point)
├── TAE/kata-architecture.md
├── TAE/automation-standards.md
└── MCP/ (los que necesites)
```

---

## Conceptos Clave

### 1. Guidelines por Rol

Cada carpeta contiene los guidelines específicos para un rol:

- **DEV**: Cómo escribir código de calidad
- **QA**: Cómo hacer testing manual efectivo
- **TAE**: Cómo automatizar tests
- **MCP**: Cómo usar herramientas externas

### 2. Principios Compartidos

Aunque cada rol tiene sus guidelines, comparten principios:

- **Spec-Driven**: Todo nace de especificaciones
- **Quality First**: Calidad desde el inicio
- **Traceability**: Todo mapea a requirements

### 3. MCP Atomizado

La carpeta MCP tiene un archivo por herramienta:

- Carga **solo** el MCP que necesitas
- Evita llenar contexto con información irrelevante
- Ver `MCP/README.md` para el decision tree

---

## Workflows

Los guidelines son **principios constantes**. Para workflows paso a paso, ver:

- `.prompts/us-dev-workflow.md` - Workflow de desarrollo
- `.prompts/us-qa-workflow.md` - Workflow de QA
- `.prompts/fase-12-test-automation/` - Workflow de TAE

---

## System Prompt

Para configurar tu IA para que cargue contexto automáticamente:

- Ver `.context/system-prompt.md`
- Copiar a `./CLAUDE.md (en el root)` o equivalente

---

## Ver También

- `.context/system-prompt.md` - System prompt para IA
- `.prompts/` - Prompts para cada fase
- `docs/ai-driven-software-project-blueprint.md` - Blueprint completo

---

**Última actualización**: 2025-12-21
