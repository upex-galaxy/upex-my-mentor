# Integration Test Automation

> **Propósito**: Automatizar tests de integración (API) siguiendo la arquitectura KATA.
> **Ubicación de Tests**: `tests/integration/{resource}/{resource}.test.ts`

---

## Flujo de 3 Fases

```
┌───────────────────────────────────────┐
│  FASE 1: PLAN                         │
│  ─────────────────────────            │
│  • Analizar endpoint de API           │
│  • Diseñar tipos de request/response  │
│  • Identificar componentes existentes │
│  • Definir ATCs con assertions        │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  FASE 2: CODING                       │
│  ─────────────────────────            │
│  • Crear definiciones de tipos        │
│  • Implementar componente API         │
│  • Crear archivo de test              │
│  • Registrar en fixture               │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  FASE 3: REVIEW                       │
│  ─────────────────────────            │
│  • Verificar cumplimiento KATA        │
│  • Validar tipos de retorno (tuples)  │
│  • Evaluar assertions fijas           │
│  • Reporte de issues (si hay)         │
└───────────────────────────────────────┘
```

---

## Prompts Disponibles

| Prompt                  | Propósito                                         |
| ----------------------- | ------------------------------------------------- |
| `integration-plan.md`   | Analizar endpoint API y planificar implementación |
| `integration-coding.md` | Implementar componente API y archivo de test      |
| `integration-review.md` | Validar cumplimiento KATA y calidad de código     |

---

## Prerrequisitos

Antes de usar estos prompts:

1. **Tests documentados en TMS** (Fase 11 completada)
2. **Especificación OpenAPI disponible** (o documentación API)
3. **Framework KATA configurado**

---

## Arquitectura KATA para Integration

```
tests/
├── components/
│   ├── api/
│   │   ├── ApiBase.ts        # Layer 2
│   │   └── {Resource}Api.ts  # Layer 3 (componentes)
│   └── ApiFixture.ts         # Layer 4
└── integration/
    └── {resource}/
        └── {resource}.test.ts # Tests de API
```

---

## Patrones de Tipo de Retorno

| HTTP Method  | Tipo de Retorno                  | Ejemplo                        |
| ------------ | -------------------------------- | ------------------------------ |
| GET (single) | `[APIResponse, TBody]`           | `[response, user]`             |
| GET (list)   | `[APIResponse, TBody[]]`         | `[response, users]`            |
| POST         | `[APIResponse, TBody, TPayload]` | `[response, created, payload]` |
| PUT/PATCH    | `[APIResponse, TBody, TPayload]` | `[response, updated, payload]` |
| DELETE       | `[APIResponse, void]`            | `[response, _]`                |

---

## Ventaja: Sin Overhead de Browser

```typescript
// Test de Integration - NO abre browser
test('crear usuario', async ({ api }) => {
  // Solo request HTTP, muy rápido (~50ms startup)
  await api.users.createUserSuccessfully(payload);
});
```

---

**Siguiente Paso**: Comenzar con `integration-plan.md` para planificar la implementación.
