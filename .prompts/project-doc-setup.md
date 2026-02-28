# Project Documentation Setup

> **Tipo:** Prompt Standalone (Reutilizable)
> **Objetivo:** Crear README profesional + System Prompt para AI Coding Agents
> **Pre-requisito:** Proyecto con estructura básica definida (recomendado: después de Fase 3 Infrastructure)
> **Output:** `README.md` + archivo de system prompt (`CLAUDE.md` / `GEMINI.md` / `AGENTS.md`)

---

## Instrucciones para la IA

Este prompt genera dos documentos esenciales para el proyecto:

1. **README.md** - Documentación profesional del proyecto
2. **System Prompt** - Archivo de configuración para AI coding agents (Context Engineering)

---

## PASO 1: Validar Pre-requisitos

Antes de continuar, verifica que el proyecto tiene la infraestructura mínima necesaria:

### 1.1 Verificar Backend

Busca evidencia de backend configurado:

```
Archivos esperados:
├── src/lib/supabase/           # O equivalente (prisma, drizzle, etc.)
│   ├── client.ts               # Cliente browser
│   └── server.ts               # Cliente server
├── src/types/                  # Tipos de base de datos
├── middleware.ts               # Auth middleware (si aplica)
└── .env.example                # Variables de entorno documentadas
```

**Criterio:** Al menos debe existir conexión a base de datos y tipos TypeScript.

### 1.2 Verificar Frontend

Busca evidencia de frontend configurado:

```
Archivos esperados:
├── src/app/                    # Next.js App Router (o pages/)
│   ├── layout.tsx              # Layout principal
│   └── page.tsx                # Homepage
├── src/components/             # Componentes UI
│   └── ui/                     # Design system (shadcn, etc.)
├── tailwind.config.*           # Configuración de estilos
└── package.json                # Dependencias
```

**Criterio:** Al menos debe existir una app funcional con layout y componentes base.

### 1.3 Decisión

```
SI backend Y frontend están configurados:
  → Continuar al PASO 2

SI faltan archivos críticos:
  → DETENER y notificar al usuario:
    "Para generar la documentación del proyecto necesito que primero
    completes el setup de backend y frontend.

    Faltantes detectados:
    - [lista de archivos/carpetas faltantes]

    Ejecuta los prompts de backend-setup.md y frontend-setup.md
    antes de continuar con este paso."
```

---

## PASO 2: Recopilar Información del Proyecto

Lee los siguientes archivos para entender el proyecto:

### 2.1 Contexto de Negocio

```
Leer en orden de prioridad:
1. .context/idea/business-model.md     # Modelo de negocio
2. .context/PRD/executive-summary.md   # Resumen ejecutivo
3. .context/PRD/user-personas.md       # Usuarios objetivo
4. .context/PRD/mvp-scope.md           # Alcance del MVP
```

**Extraer:**

- Nombre del producto
- Problema que resuelve
- Propuesta de valor
- Usuarios objetivo
- Features principales

### 2.2 Arquitectura Técnica

```
Leer:
1. .context/SRS/architecture-specs.md  # Stack técnico, diagramas
2. .context/SRS/functional-specs.md    # Requerimientos funcionales
3. package.json                        # Dependencias actuales
4. tsconfig.json                       # Configuración TypeScript
```

**Extraer:**

- Tech stack completo (framework, DB, UI, etc.)
- Versiones de dependencias clave
- Estructura de carpetas
- Configuración de TypeScript

### 2.3 Base de Datos

```
Leer:
1. src/types/supabase.ts              # Tipos generados (o equivalente)
2. .context/SRS/architecture-specs.md  # ERD si existe
```

**Extraer:**

- Tablas principales
- Relaciones entre entidades
- Flujos de estado (si aplica)

### 2.4 Variables de Entorno

```
Leer:
1. .env.example                        # Variables requeridas
```

**Extraer:**

- Variables necesarias para desarrollo
- Servicios externos requeridos

---

## PASO 3: Detectar o Preguntar sobre AI Coding Agent

### 3.1 Detección Automática

Primero, busca archivos de system prompt existentes en el root del proyecto:

```
Verificar existencia de:
├── CLAUDE.md     → Si existe, el usuario probablemente usa Claude Code
├── GEMINI.md     → Si existe, el usuario probablemente usa Gemini CLI
└── AGENTS.md     → Si existe, el usuario usa otra herramienta

SI existe algún archivo:
  → Informar al usuario:
    "Detecté que ya tienes {archivo}. ¿Quieres que lo actualice
    con la información del proyecto actual, o prefieres crear uno nuevo?"

SI no existe ninguno:
  → Continuar con la pregunta al usuario
```

### 3.2 Preguntar al Usuario

Si no se detectó ningún archivo existente, pregunta:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CONFIGURACIÓN DE AI AGENT                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ¿Qué herramienta de AI coding usas principalmente?                 │
│                                                                      │
│  1. Claude Code (Anthropic CLI)                                     │
│     → Genera: CLAUDE.md                                             │
│     → Ubicación: ./CLAUDE.md (root del proyecto)                    │
│                                                                      │
│  2. Gemini CLI (Google)                                             │
│     → Genera: GEMINI.md                                             │
│     → Ubicación: ./GEMINI.md (root del proyecto)                    │
│                                                                      │
│  3. Opencode / Otros                                                │
│     → Genera: AGENTS.md                                             │
│     → Ubicación: ./AGENTS.md (root del proyecto)                    │
│                                                                      │
│  4. Todos (generar los 3 archivos)                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Explicar al usuario:**

> **¿Qué son estos archivos?**
>
> Los AI coding agents (Claude Code, Gemini CLI, etc.) pueden leer archivos
> especiales en tu proyecto para entender el contexto antes de ayudarte.
>
> - **CLAUDE.md**: Claude Code lo lee automáticamente al iniciar sesión
> - **GEMINI.md**: Gemini CLI lo lee como instrucciones del sistema
> - **AGENTS.md**: Formato genérico para otras herramientas
>
> Estos archivos contienen:
>
> - Estructura del proyecto
> - Estándares de código
> - Instrucciones de Context Loading (qué archivos leer según la tarea)
> - MCPs disponibles y cuándo usarlos
>
> **Beneficio:** La IA no necesita que le expliques el proyecto cada vez.
> Ya sabe cómo está organizado y qué estándares seguir.

---

## PASO 4: Generar README.md

### 4.1 Advertencias de Seguridad

**El README NO debe incluir:**

- ❌ Credenciales o API keys reales (usa placeholders como `your-api-key`)
- ❌ URLs de producción con datos sensibles
- ❌ Información personal de usuarios/clientes
- ❌ Tokens de acceso o secrets
- ❌ Rutas internas de infraestructura
- ❌ Datos de negocio confidenciales

**Siempre usar:**

- ✅ `.env.example` para documentar variables (sin valores reales)
- ✅ Placeholders descriptivos: `{tu-proyecto-id}`, `{tu-api-key}`
- ✅ `localhost` para URLs de desarrollo

### 4.2 Template de README

Crea un README profesional con la siguiente estructura:

```markdown
# {Nombre del Proyecto}

{Descripción corta en 1-2 líneas}

[![Next.js](https://img.shields.io/badge/Next.js-{version}-black?logo=next.js)]
[![TypeScript](https://img.shields.io/badge/TypeScript-{version}-blue?logo=typescript)]
{...más badges según tech stack}

---

## The Problem

{Descripción del problema que resuelve - extraído del PRD}

| Current Reality | Impact    |
| --------------- | --------- |
| {problema 1}    | {impacto} |
| {problema 2}    | {impacto} |

## The Solution

{Nombre del producto} provides:

- **{Feature 1}** - {descripción breve}
- **{Feature 2}** - {descripción breve}
- **{Feature 3}** - {descripción breve}

---

## Tech Stack

| Layer         | Technology                  | Version   |
| ------------- | --------------------------- | --------- |
| **Framework** | {ej: Next.js}               | {version} |
| **Runtime**   | {ej: Bun/Node}              | {version} |
| **Language**  | {ej: TypeScript}            | {version} |
| **Backend**   | {ej: Supabase}              | -         |
| **Styling**   | {ej: Tailwind + shadcn}     | {version} |
| **Forms**     | {ej: React Hook Form + Zod} | {version} |

## Project Structure
```

{nombre-proyecto}/
├── src/
│ ├── app/ # {descripción}
│ │ ├── (auth)/ # {descripción}
│ │ ├── (app)/ # {descripción}
│ │ └── ...
│ ├── components/
│ │ ├── ui/ # {descripción}
│ │ └── layout/ # {descripción}
│ ├── lib/ # {descripción}
│ ├── contexts/ # {descripción}
│ ├── hooks/ # {descripción}
│ └── types/ # {descripción}
├── scripts/ # {descripción}
├── docs/ # {descripción}
└── .context/ # AI context engineering

```

## Database Schema

{Diagrama ASCII del modelo de datos - simplificado}

### {Entidad Principal} Status Flow (si aplica)

```

{estado1} ──▶ {estado2} ──▶ {estado3}
│
└──▶ {estado alternativo}

````

---

## Quick Start

### Prerequisites

- [{runtime}]({link}) (v{version}+)
- [{servicio}]({link}) account
- {otros requisitos}

### Installation

```bash
# Clone the repository
git clone {repo-url}
cd {nombre-proyecto}

# Install dependencies
{package-manager} install

# Copy environment variables
cp .env.example .env
````

### Environment Setup

Edit `.env` with your credentials:

```bash
# {Servicio 1} (Required)
{VARIABLE_1}={descripción}
{VARIABLE_2}={descripción}

# Application
{VARIABLE_APP}={descripción}
```

> {Nota sobre dónde obtener credenciales}

### Run Development Server

```bash
{package-manager} dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Available Scripts

| Script           | Description   |
| ---------------- | ------------- |
| `{pm} dev`       | {descripción} |
| `{pm} build`     | {descripción} |
| `{pm} start`     | {descripción} |
| `{pm} typecheck` | {descripción} |
| `{pm} lint`      | {descripción} |
| `{pm} format`    | {descripción} |

{Si hay scripts adicionales de AI/testing, agregar sección separada}

---

## Architecture

### Authentication Flow (si aplica)

{Diagrama ASCII del flujo de auth}

### Security

- **{Característica 1}:** {descripción}
- **{Característica 2}:** {descripción}

### Route Groups (si usa App Router)

| Group    | Path                | Description   |
| -------- | ------------------- | ------------- |
| `(auth)` | `/login`, `/signup` | {descripción} |
| `(app)`  | `/dashboard`, etc.  | {descripción} |

---

## Development

### Code Quality

{Descripción de herramientas de calidad configuradas}

```bash
# Manual checks
{pm} lint
{pm} format:check
{pm} typecheck
```

### Adding UI Components (si usa shadcn o similar)

```bash
{comando para agregar componentes}
```

### Type Generation (si aplica)

```bash
{comando para regenerar tipos}
```

---

## AI-Driven Development

This project uses **Context Engineering** for AI-assisted development.

### Structure

| Directory   | Purpose                                          |
| ----------- | ------------------------------------------------ |
| `.context/` | Documentation AI reads to understand the project |
| `.prompts/` | Templates for generating documentation           |
| `docs/`     | System blueprints and guides                     |

### Context Loading

The AI loads different context files based on the task:

- **DEV tasks:** `.context/guidelines/DEV/`
- **QA tasks:** `.context/guidelines/QA/`
- **TAE tasks:** `.context/guidelines/TAE/`

See [{system-prompt-file}]({path}) for detailed instructions.

---

## Business Model (si aplica)

### Pricing Tiers

| Feature     | Free    | Pro     |
| ----------- | ------- | ------- |
| {feature 1} | {valor} | {valor} |
| {feature 2} | {valor} | {valor} |

### Target Market

- **Who:** {descripción}
- **Where:** {ubicación geográfica}

---

## Roadmap

### Phase 1: {nombre} (Current)

- [x] {completado}
- [ ] {pendiente}

### Phase 2: {nombre}

- [ ] {feature}

---

## Contributing

1. Read the [Context Engineering Guide](.context/context-engineering.md)
2. Follow the [Code Standards](.context/guidelines/DEV/code-standards.md)
3. Use conventional commits
4. Create PR against `develop` branch

---

## License

{Tipo de licencia} - See [LICENSE](LICENSE) for details.

---

## Links

- [Context Engineering Guide](.context/context-engineering.md)
- {otros links relevantes}

````

---

## PASO 5: Generar System Prompt

Basándose en `.context/system-prompt.md` como template, genera el archivo correspondiente:

### 5.1 Template Base

```markdown
# System Prompt - Context Engineering

## Instrucciones para la IA

Eres un asistente de desarrollo para **{Nombre del Proyecto}**, un proyecto que sigue
**Context Engineering** y **Spec-Driven Development**.

**Descripción del proyecto:** {1-2 líneas del PRD}

Tu trabajo es ayudar a implementar código, tests y documentación siguiendo las
especificaciones definidas en `.context/`.

---

## Stack Técnico

| Capa      | Tecnología                  |
| --------- | --------------------------- |
| Framework | {Next.js version}           |
| Backend   | {Supabase/Prisma/etc}       |
| Styling   | {Tailwind + shadcn/etc}     |
| Forms     | {React Hook Form + Zod/etc} |
| Language  | TypeScript (strict)         |
| Runtime   | {Bun/Node version}          |

---

## Principios Fundamentales

### 1. Spec-Driven Development

- **Nunca** implementes código sin leer primero la especificación
- Las **User Stories** definen QUÉ hacer
- Los **Acceptance Criteria** definen CUÁNDO está listo
- Los **Test Cases** definen CÓMO probar
- El **Implementation Plan** define CÓMO implementar

### 2. Context Loading

- **Siempre** carga el contexto relevante antes de trabajar
- Lee los **guidelines** correspondientes a tu rol
- Usa los **MCPs** para datos en vivo (schema, docs, issues)
- **No asumas** - verifica en la documentación

### 3. Quality First

- Sigue los **estándares de código** desde la primera línea
- Implementa **error handling** correctamente
- Agrega **data-testid** a elementos interactivos
- **No hardcodees** valores - usa configuración

---

## Context Loading por Rol

### Si estás haciendo DESARROLLO (DEV)

````

Antes de codear, leer:
├── .context/guidelines/DEV/
│ ├── code-standards.md # Estándares de código
│ ├── error-handling.md # Manejo de errores
│ ├── data-testid-standards.md # Cómo crear data-testid
│ └── spec-driven-development.md # Principio SDD
│
├── .context/PBI/epics/.../stories/.../
│ ├── story.md # User story + AC
│ ├── acceptance-test-plan.md # Test cases esperados
│ └── implementation-plan.md # Plan técnico
│
└── MCPs relevantes:
├── Supabase → Schema de DB
├── Context7 → Docs de bibliotecas
└── Playwright → Revisión de UI/UX

```

### Si estás haciendo QA (Testing Manual)

```

Antes de testear, leer:
├── .context/guidelines/QA/
│ ├── spec-driven-testing.md # Principio SDT
│ ├── exploratory-testing.md # Técnicas + Trifuerza
│ └── jira-test-management.md # Gestión en Jira
│
├── .context/PBI/epics/.../stories/.../
│ ├── story.md # User story + AC
│ └── acceptance-test-plan.md # Test cases a ejecutar
│
├── .prompts/fase-10-exploratory-testing/
│ ├── exploratory-test.md # UI Testing
│ ├── exploratory-api-test.md # API Testing
│ └── exploratory-db-test.md # Database Testing
│
└── MCPs relevantes (Trifuerza):
├── Playwright → UI Testing
├── Postman/OpenAPI → API Testing
├── DBHub → Database Testing
└── Atlassian → Gestión de tests

```

### Si estás haciendo TAE (Test Automation)

```

Antes de automatizar, leer:
├── .context/guidelines/TAE/
│ ├── KATA-AI-GUIDE.md # Entry point para IA
│ ├── kata-architecture.md # Arquitectura KATA
│ ├── automation-standards.md # Estándares de tests
│ └── test-data-management.md # Manejo de datos
│
├── .context/PBI/epics/.../stories/.../
│ └── acceptance-test-plan.md # Test cases a automatizar
│
└── MCPs relevantes:
├── Playwright → Tests E2E UI
├── DevTools → Debugging
├── Postman/OpenAPI → Tests de API
├── DBHub → Verificación de datos
├── Context7 → Docs de testing
└── Atlassian → Gestión de tests

Nota: Usa gh (CLI de GitHub) para crear PR, hacer reviews, y todo lo relacionado con git.

```

---

## Estructura del Proyecto

```

{estructura real del proyecto actual - simplificada}

```

---

## Flujo de Trabajo General

```

1. IDENTIFICAR ROL
   └─ ¿DEV? ¿QA? ¿TAE?

2. CARGAR CONTEXTO
   └─ Leer guidelines del rol
   └─ Leer story/test-cases/plan relevantes

3. EJECUTAR TAREA
   └─ Seguir principios del rol
   └─ Usar MCPs para datos en vivo

4. VERIFICAR
   └─ ¿Cumple acceptance criteria?
   └─ ¿Sigue estándares?
   └─ ¿Tests pasan?

````

---

## MCPs Disponibles

| MCP        | Cuándo usar                        |
| ---------- | ---------------------------------- |
| Supabase   | Schema, datos, policies de DB      |
| Context7   | Docs oficiales de bibliotecas      |
| Tavily     | Búsqueda web, foros, errores       |
| Playwright | Tests E2E, interacciones UI        |
| DevTools   | Debug de tests, network, console   |
| Postman    | API testing con colecciones        |
| OpenAPI    | API testing via spec (requests)    |
| DBHub      | SQL queries, verificación de datos |
| Sentry     | Errores en producción              |
| Atlassian  | Jira, Confluence                   |
| GitHub     | Issues, PRs, código                |
| Slack      | Notificaciones                     |
| Memory     | Contexto entre sesiones            |

### Trifuerza Testing (QA)

| Capa | MCPs                 |
| ---- | -------------------- |
| UI   | `playwright`         |
| API  | `postman`, `openapi` |
| DB   | `dbhub`              |

Ver `.context/guidelines/MCP/` para detalles de cada uno.

---

## Reglas de Oro

1. **Spec First**: Lee la especificación antes de actuar
2. **Context Matters**: Carga el contexto correcto para el rol
3. **Living Data**: Usa MCPs para datos en vivo, no docs estáticos
4. **Quality Built-In**: Aplica estándares desde el inicio
5. **Traceability**: Todo código/test mapea a una especificación

---

## Comandos Útiles

```bash
# Desarrollo
{pm} dev              # Iniciar servidor de desarrollo
{pm} build            # Build de producción
{pm} typecheck        # Verificar tipos

# Calidad de código
{pm} lint             # Ejecutar linter
{pm} format           # Formatear código

# AI tooling (si aplica)
{pm} ai {preset}      # Cargar MCPs por tarea
````

---

**Última actualización**: {fecha actual}
**Ver también**: `.context/guidelines/` para guidelines detallados por rol

```

### 5.2 Personalización por Herramienta

**Para CLAUDE.md:**
- Ubicación: `./CLAUDE.md` (root)
- Claude Code lo lee automáticamente

**Para GEMINI.md:**
- Ubicación: `./GEMINI.md` (root)
- Gemini CLI lo lee con `--system-instruction`

**Para AGENTS.md:**
- Ubicación: `./AGENTS.md` (root)
- Formato genérico compatible con múltiples herramientas

---

## PASO 6: Crear Archivos

### 6.1 Escribir README.md

```

Ubicación: ./README.md (root del proyecto)

```

### 6.2 Escribir System Prompt

```

Según la elección del usuario:

- Opción 1: ./CLAUDE.md
- Opción 2: ./GEMINI.md
- Opción 3: ./AGENTS.md
- Opción 4: Los 3 archivos

```

---

## PASO 7: Notificar al Usuario

```

✅ Documentación del proyecto generada exitosamente

Archivos creados:
├── README.md # Documentación profesional del proyecto
└── {ARCHIVO}.md # System prompt para {herramienta}

📝 README.md incluye:

- Descripción del problema y solución
- Tech stack completo
- Estructura del proyecto
- Guía de instalación y setup
- Scripts disponibles
- Arquitectura y seguridad
- Roadmap del proyecto

🤖 {ARCHIVO}.md incluye:

- Instrucciones de Context Loading
- Guidelines por rol (DEV/QA/TAE)
- MCPs disponibles y cuándo usarlos
- Reglas de oro del proyecto
- Comandos útiles

💡 Próximos pasos:

1.  Revisa y ajusta el README según necesites
2.  Inicia una nueva sesión con tu AI agent para que cargue el system prompt
3.  Continúa con la siguiente fase de tu proyecto según el flujo UPEX

```

---

## PASO 8: Revisión Post-Generación

Después de crear los archivos, el usuario debe revisar y ajustar:

### README.md

```

Secciones a personalizar:
├── Badges → Verificar versiones correctas
├── The Problem → Ajustar redacción si es necesario
├── Quick Start → Probar que los comandos funcionen
├── Database Schema → Actualizar si cambió el modelo
├── Roadmap → Marcar items completados
└── Links → Verificar que las URLs existan

```

### System Prompt (CLAUDE.md / GEMINI.md / AGENTS.md)

```

Secciones a personalizar:
├── Stack Técnico → Confirmar versiones
├── MCPs → Agregar/quitar según tu setup
├── Comandos Útiles → Ajustar al package manager usado
└── Estructura → Actualizar si hay carpetas nuevas

```

---

## Checklist Final

- [ ] Pre-requisitos validados (backend + frontend existen)
- [ ] Información del proyecto recopilada
- [ ] Usuario indicó herramienta de AI
- [ ] README.md generado con toda la información
- [ ] System prompt generado para la herramienta elegida
- [ ] Usuario notificado de los archivos creados

---

**Versión:** 1.1
**Última actualización:** {fecha actual de ejecución}
**Autor:** UPEX Galaxy - Context Engineering Framework
```
