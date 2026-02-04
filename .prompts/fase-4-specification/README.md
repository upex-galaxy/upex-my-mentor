# Fase 4: Specification (Product Backlog)

## Propósito

Crear y gestionar el Product Backlog en Jira siguiendo el flujo **Jira-First → Local Mirror**. Transforma las User Stories del PRD en issues reales de Jira con estructura de carpetas local sincronizada.

**Por qué existe esta fase:**

- Establece el backlog real en Jira (fuente de verdad)
- Crea mirror local para trabajo offline y versionado
- Mantiene nomenclatura consistente entre Jira y filesystem
- Permite agregar features incrementalmente al backlog

---

## Pre-requisitos

- Fase 2 completada:
  - `.context/PRD/mvp-scope.md` (Epics y User Stories)
  - `.context/SRS/functional-specs.md` (Functional Requirements)
- Proyecto Jira configurado con PROJECT_KEY
- MCP Atlassian disponible

---

## Prompts en Esta Fase

| Orden | Prompt                   | Propósito                      | Cuándo usar            |
| ----- | ------------------------ | ------------------------------ | ---------------------- |
| 1     | `pbi-product-backlog.md` | Crear backlog inicial completo | Primera vez, desde PRD |
| 2     | `pbi-add-feature.md`     | Agregar features incrementales | Nuevas ideas post-MVP  |

---

## Flujo de Ejecución

### Backlog Inicial (`pbi-product-backlog.md`)

```
PRD (mvp-scope.md)
        ↓
[PASO 0] Solicitar PROJECT_KEY al usuario
        ↓
[PASO 1] Crear Epic en Jira (MCP)
        └── Obtener ISSUE_NUM real (ej: 13)
        ↓
[PASO 2] Crear carpeta local con ID real
        └── EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}
        ↓
[PASO 3] Crear epic.md local
        ↓
[PASO 4] Crear Stories de esa Epic en Jira (MCP)
        └── Obtener ISSUE_NUMs reales
        ↓
[PASO 5] Crear carpetas locales de Stories
        └── STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}
        ↓
[PASO 6] Crear story.md locales
        ↓
[REPETIR] Para cada Epic del PRD
```

### Agregar Feature (`pbi-add-feature.md`)

```
Nueva idea/feature
        ↓
[ANÁLISIS] Clasificar complejidad
        │
        ├── NIVEL 1: Story Individual
        │   └── Agregar a Epic existente
        │
        ├── NIVEL 2: Epic Completa
        │   └── Crear nueva Epic + Stories
        │
        └── NIVEL 3: Múltiples Epics
            └── Requiere planning adicional
```

---

## Nomenclatura de Carpetas

### Estructura

```
.context/PBI/
├── epic-tree.md                              # Índice de todas las Epics
└── epics/
    └── EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/
        ├── epic.md                           # Metadata de la Epic
        └── stories/
            └── STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/
                └── story.md                  # Metadata de la Story
```

### Ejemplo Real

```
.context/PBI/
├── epic-tree.md
└── epics/
    └── EPIC-UPEX-13-user-authentication/
        ├── epic.md
        └── stories/
            ├── STORY-UPEX-45-user-registration/
            │   └── story.md
            └── STORY-UPEX-46-user-login/
                └── story.md
```

### Componentes de la Nomenclatura

| Componente         | Origen                 | Ejemplo       |
| ------------------ | ---------------------- | ------------- |
| `EPIC-` / `STORY-` | Fijo (template)        | `EPIC-`       |
| `{PROJECT_KEY}`    | Usuario define en Jira | `UPEX`, `MYM` |
| `{ISSUE_NUM}`      | Jira autogenera        | `13`, `45`    |
| `{nombre}`         | Análisis del dominio   | `user-auth`   |

---

## Flujo Jira-First → Local

```
┌─────────────────────────────────────────────────────────────┐
│                    JIRA-FIRST WORKFLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. CREAR EN JIRA            2. MIRROR LOCAL               │
│   ─────────────────           ─────────────                 │
│                                                              │
│   Epic/Story creada    ───►   Carpeta con ID real           │
│   en Jira (MCP)               de Jira                       │
│                                                              │
│   Jira asigna          ───►   Nomenclatura usa              │
│   ISSUE_NUM                   ese número                    │
│                                                              │
│   Fuente de verdad:           Mirror local:                 │
│   JIRA                        .context/PBI/                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Herramientas Requeridas

| Herramienta   | Propósito                     |
| ------------- | ----------------------------- |
| MCP Atlassian | Crear Epics y Stories en Jira |
| Filesystem    | Crear estructura local mirror |

---

## Output de Esta Fase

- **Jira:** Epics y Stories creadas con IDs reales
- **Local:** Estructura `.context/PBI/` sincronizada
- **Índice:** `epic-tree.md` con mapa del backlog
- **Trazabilidad:** Jira Key ↔ Carpeta local

---

## Siguiente Fase

Con backlog creado:

- Proceder a **Fase 5: Shift-Left Testing**
- Crear test plans a nivel Feature (Epic)
- Crear test cases a nivel Story

---

## FAQ

**P: ¿Por qué Jira-First y no Local-First?**
R: Jira asigna IDs únicos secuenciales. Crear local primero requeriría renombrar carpetas después.

**P: ¿Puedo agregar features después del backlog inicial?**
R: Sí, usa `pbi-add-feature.md` para análisis de complejidad e inserción correcta.

**P: ¿Qué pasa si cambio algo en Jira manualmente?**
R: El mirror local no se actualiza automáticamente. Mantén consistencia manual o re-ejecuta el prompt.

---

## Documentación Relacionada

- **PRD:** `.context/PRD/mvp-scope.md`
- **Main README:** `.prompts/README.md`
- **Fase 5:** `.prompts/fase-5-shift-left-testing/README.md`
