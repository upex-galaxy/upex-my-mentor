# Fase 3 - Infrastructure Features

> **Prompts modulares** para complementar la infraestructura generada por los prompts principales de Fase 3.

---

## Propósito

Los prompts principales de Fase 3 (`backend-setup.md`, `frontend-setup.md`) crean la infraestructura base del proyecto. Estos **feature prompts** agregan funcionalidades adicionales que mejoran la calidad, testeabilidad y mantenibilidad del código.

---

## Prompts Disponibles

| Prompt                    | Propósito                              | Modo             |
| ------------------------- | -------------------------------------- | ---------------- |
| `supabase-types-setup.md` | Tipado auto-generado desde Supabase DB | Siempre COMPLETO |
| `env-url-setup.md`        | Sistema de URLs multi-ambiente         | Siempre COMPLETO |
| `openapi-setup.md`        | OpenAPI + Zod + UI Redoc               | PARCIAL/COMPLETO |
| `api-routes-setup.md`     | Estructura de custom API endpoints     | PARCIAL/COMPLETO |

---

## Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 3 PRINCIPAL                         │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │ backend-    │  │ frontend-   │                          │
│  │ setup.md    │  │ setup.md    │                          │
│  └──────┬──────┘  └─────────────┘                          │
│         │                                                   │
│         ▼                                                   │
├─────────────────────────────────────────────────────────────┤
│                    FEATURES (opcionales)                    │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────┐               │
│  │ supabase-types- │    │ env-url-         │               │
│  │ setup.md        │    │ setup.md         │               │
│  │ (tipado DB)     │    │ (URLs ambiente)  │               │
│  └────────┬────────┘    └────────┬─────────┘               │
│           │                      │                          │
│           └──────────┬───────────┘                          │
│                      ▼                                      │
│           ┌──────────────────┐                              │
│           │ openapi-         │                              │
│           │ setup.md         │                              │
│           │ (API docs + UI)  │                              │
│           └────────┬─────────┘                              │
│                    ▼                                        │
│           ┌──────────────────┐                              │
│           │ api-routes-      │                              │
│           │ setup.md         │                              │
│           │ (custom APIs)    │                              │
│           └──────────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Orden de Ejecución Recomendado

```bash
# 1. Tipado de DB (siempre primero si hay Supabase)
→ supabase-types-setup.md

# 2. URLs multi-ambiente (independiente)
→ env-url-setup.md

# 3. Sistema OpenAPI (antes de crear APIs)
→ openapi-setup.md

# 4. Custom API routes (usa todo lo anterior)
→ api-routes-setup.md
```

---

## Modos: PARCIAL vs COMPLETO

Algunos prompts soportan dos modos de ejecución:

### Modo PARCIAL

- Se ejecuta cuando **faltan precondiciones**
- Crea estructura base y configuración mínima
- Permite que el proyecto funcione
- Ejemplo: `openapi-setup` sin APIs custom existentes

### Modo COMPLETO

- Se ejecuta cuando **todas las precondiciones están cumplidas**
- Crea implementación completa con todos los features
- Ejemplo: `openapi-setup` con APIs custom existentes → genera schemas

### Detección Automática

Los prompts **detectan automáticamente** el modo correcto analizando:

- Archivos existentes en el proyecto
- Configuración actual
- Endpoints implementados

**No necesitas especificar el modo manualmente.**

---

## Cuándo Usar Cada Prompt

### `supabase-types-setup.md`

**Usar cuando:**

- ✅ Tienes Supabase configurado con tablas
- ✅ Quieres type-safety completo en queries
- ✅ Necesitas regenerar tipos después de cambios en DB

**No usar si:**

- ❌ No usas Supabase
- ❌ Ya tienes tipos manuales que prefieres mantener

---

### `env-url-setup.md`

**Usar cuando:**

- ✅ Tienes múltiples ambientes (dev, staging, production)
- ✅ Necesitas construir URLs dinámicamente
- ✅ Quieres evitar hardcodear URLs

**No usar si:**

- ❌ Solo tienes un ambiente (desarrollo local)
- ❌ Ya tienes un sistema de URLs funcionando

---

### `openapi-setup.md`

**Usar cuando:**

- ✅ Quieres documentación interactiva de tu API
- ✅ Necesitas UI para testers (Redoc)
- ✅ Quieres validación runtime con Zod

**No usar si:**

- ❌ No tienes ni planeas tener custom APIs
- ❌ Prefieres documentación manual

---

### `api-routes-setup.md`

**Usar cuando:**

- ✅ Necesitas crear endpoints custom en Next.js
- ✅ Quieres patterns consistentes (validación, errores)
- ✅ Ya ejecutaste `openapi-setup` (recomendado)

**No usar si:**

- ❌ Solo usas Supabase REST API directamente
- ❌ Ya tienes estructura de APIs definida

---

## Ejemplo de Uso Completo

```markdown
# Proyecto nuevo con Supabase + Next.js

1. Ejecutar Fase 3 principal:
   → backend-setup.md (crea DB, auth, clients)
   → frontend-setup.md (layout, tema, componentes)

2. Ejecutar features en orden:
   → supabase-types-setup.md (genera src/types/supabase.ts)
   → env-url-setup.md (crea src/lib/urls.ts)
   → openapi-setup.md (crea OpenAPI + /api-docu)

3. Cuando implementes APIs:
   → api-routes-setup.md (estructura + patterns)

4. Re-ejecutar cuando sea necesario:
   → supabase-types-setup.md (después de cambios en DB)
   → openapi-setup.md (después de nuevos endpoints)
```

---

## Archivos Generados por Cada Prompt

### `supabase-types-setup.md`

```
src/types/supabase.ts          # Tipos auto-generados
package.json                   # Script "db:types"
```

### `env-url-setup.md`

```
src/lib/urls.ts                # Helper de URLs
.env.example                   # Actualizado con convenciones
CLAUDE.md                      # Documentación de URLs
```

### `openapi-setup.md`

```
src/lib/openapi/
├── registry.ts                # Configuración OpenAPI
├── index.ts                   # Entry point
└── schemas/
    ├── common.ts              # Schemas reutilizables
    └── index.ts               # Barrel export

src/app/api/openapi/
└── route.ts                   # Endpoint JSON spec

src/app/(minimal)/
├── layout.tsx                 # Layout sin sidebar
└── api-docu/
    ├── page.tsx               # Página principal
    ├── redoc-viewer.tsx       # Viewer Redoc
    ├── api-doc-selector.tsx   # Selector de API
    └── auth-info-panel.tsx    # Info de autenticación
```

### `api-routes-setup.md`

```
src/app/api/
├── [dominio]/
│   └── route.ts               # Endpoints por dominio
└── ...

src/lib/api/
├── responses.ts               # Error handling helpers
└── auth.ts                    # Auth helpers
```

> **Nota:** La documentación de endpoints se genera automáticamente via `openapi-setup.md` (Redoc UI en `/api-docu`).

---

## FAQ

**P: ¿Puedo ejecutar un prompt varias veces?**
R: Sí. Los prompts detectan el estado actual y solo agregan/actualizan lo necesario.

**P: ¿Qué pasa si ejecuto en orden diferente?**
R: Funcionará, pero puede que falten integraciones. Por ejemplo, `api-routes-setup` sin `openapi-setup` no registrará endpoints en OpenAPI.

**P: ¿Los prompts modifican código existente?**
R: Solo actualizan archivos de configuración. El código de negocio no se toca.

**P: ¿Necesito ejecutar TODOS los features?**
R: No. Son opcionales. Usa solo los que necesites para tu proyecto.
