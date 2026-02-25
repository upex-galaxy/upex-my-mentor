# E2E Test Automation

> **Propósito**: Automatizar tests E2E (End-to-End) siguiendo la arquitectura KATA.
> **Ubicación de Tests**: `tests/e2e/{feature}/{feature}.test.ts`

---

## Flujo de 3 Fases

```
┌───────────────────────────────────────┐
│  FASE 1: PLAN                         │
│  ─────────────────────────            │
│  • Analizar caso de test              │
│  • Decisiones de arquitectura         │
│  • Identificar componentes            │
│  • Definir ATCs y assertions          │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  FASE 2: CODING                       │
│  ─────────────────────────            │
│  • Implementar componente KATA        │
│  • Crear archivo de test              │
│  • Registrar en fixture               │
│  • Ejecutar y validar                 │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  FASE 3: REVIEW                       │
│  ─────────────────────────            │
│  • Verificar cumplimiento KATA        │
│  • Validar calidad de código          │
│  • Evaluar calidad de test            │
│  • Reporte de issues (si hay)         │
└───────────────────────────────────────┘
```

---

## Prompts Disponibles

| Prompt          | Propósito                                              |
| --------------- | ------------------------------------------------------ |
| `e2e-plan.md`   | Analizar caso de test y planificar implementación KATA |
| `e2e-coding.md` | Implementar componente UI y archivo de test            |
| `e2e-review.md` | Validar cumplimiento KATA y calidad de código          |

---

## Prerrequisitos

Antes de usar estos prompts:

1. **Tests documentados en TMS** (Fase 11 completada)
2. **Tests marcados como "automation-candidate"**
3. **Framework KATA configurado**

---

## Arquitectura KATA para E2E

```
tests/
├── components/
│   ├── ui/
│   │   ├── UiBase.ts         # Layer 2
│   │   └── {Page}Page.ts     # Layer 3 (componentes)
│   └── UiFixture.ts          # Layer 4
└── e2e/
    └── {feature}/
        └── {feature}.test.ts # Tests E2E
```

---

## Selección de Fixture

| Fixture    | Abre Browser? | Usar Cuando                 |
| ---------- | ------------- | --------------------------- |
| `{ ui }`   | Sí            | Testing solo UI             |
| `{ test }` | Sí            | Setup API + verificación UI |

---

**Siguiente Paso**: Comenzar con `e2e-plan.md` para planificar la implementación.
