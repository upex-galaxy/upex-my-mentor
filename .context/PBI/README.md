# FASES 2-4: Product Backlog Items (PBI)

Este directorio contiene el backlog completo del producto organizado por épicas y stories.

## 🏗️ Arquitectura Unificada

**Beneficio clave**: Para trabajar en una story, la IA lee **UNA sola carpeta**.

```
PBI/
├── epic-tree.md                    Vista high-level de todas las épicas
├── ALIGNMENT-REPORT.md             [Opcional] Mapeo PRD → Jira
└── epics/
    └── EPIC-{PROYECTO}-{NUM}-{nombre-descriptivo}/
        ├── epic.md                 [FASE 3] Descripción de la épica
        ├── feature-test-plan.md    [FASE 4] Plan de pruebas
        ├── feature-implementation-plan.md  [FASE 5] Plan técnico
        └── stories/
            └── STORY-{PROYECTO}-{NUM}-{nombre-descriptivo}/
                ├── story.md        [FASE 3] User story
                ├── test-cases.md   [FASE 4] Test cases
                └── implementation-plan.md  [FASE 5] Plan de implementación
```

**Ejemplo real:**

```
PBI/
├── epic-tree.md
└── epics/
    └── EPIC-MYM-13-mentor-discovery-search/
        ├── epic.md
        ├── feature-test-plan.md
        ├── feature-implementation-plan.md
        └── stories/
            ├── STORY-MYM-14-view-all-mentors/
            │   ├── story.md
            │   ├── test-cases.md
            │   └── implementation-plan.md
            ├── STORY-MYM-15-search-mentors-keyword/
            │   └── ...
            └── STORY-MYM-16-filter-mentors-skills/
                └── ...
```

## 📄 Archivos a generar

### FASE 3: Product Backlog Specification ⚡ **FLUJO JIRA-FIRST**

**IMPORTANTE:** Usa `.prompts/fase-3-specification/pbi-product-backlog.md` que trabaja con MCP de Atlassian.

**Primera ejecución (Planificación):**

- Genera `epic-tree.md` - Vista completa del backlog planificado

**Por cada épica (Incremental - Jira First → Local):**

1. **Jira:** Crea épica en Jira usando MCP → Obtén ID real (ej: MYM-13)
2. **Local:** Crea carpeta `epics/EPIC-MYM-13-nombre-descriptivo/`
3. **Local:** Crea archivo `epic.md` con datos completos
4. **Jira:** Crea todas las stories de la épica en Jira → Obtén IDs reales
5. **Local:** Crea carpetas `stories/STORY-MYM-14-nombre/` con `story.md`
6. **Local:** Actualiza `epic.md` con IDs reales de stories
7. ✅ Repite para siguiente épica

**Beneficio del flujo Jira-First:**

- Nomenclatura correcta desde el inicio (IDs reales de Jira en carpetas)
- No hay necesidad de sincronización posterior
- Trazabilidad perfecta: carpeta local ↔ Jira issue (1:1)

---

### FASE 3B: Agregar Features Post-MVP ⚡ **NUEVO**

**IMPORTANTE:** Usa `.prompts/fase-3-specification/pbi-add-feature.md` para agregar features después del setup inicial.

**¿Qué hace este prompt?**

El prompt **analiza automáticamente la complejidad** de tu idea y:

1. **Clasifica en 3 niveles:**
   - **Nivel 1: Story Individual** → Agrega 1 story a épica existente
   - **Nivel 2: Épica Completa** → Crea épica nueva + sus stories
   - **Nivel 3: Múltiples Épicas** → ⚠️ Advierte + genera plan de división (no crea nada)

2. **Ejecuta según nivel:**
   - Nivel 1-2: Crea en Jira + local automáticamente (flujo Jira-First)
   - Nivel 3: Solo genera plan, usuario debe dividir la idea primero

**Input:**

- Descripción de la nueva feature/idea
- Epic tree existente (automáticamente lee este directorio)
- Código del proyecto en Jira

**Ejemplos de uso:**

**Nivel 1 - Story Individual:**

```
Input: "Agregar filtro por precio en búsqueda de mentores"
→ Detecta que pertenece a EPIC-MYM-13 (Mentor Discovery)
→ Crea STORY-MYM-45 en Jira
→ Crea carpeta local STORY-MYM-45-filter-by-price/
→ Actualiza epic.md y epic-tree.md
✅ Completado
```

**Nivel 2 - Épica Completa:**

```
Input: "Sistema de mensajería entre mentor y mentee"
→ Detecta que requiere nueva épica
→ Crea EPIC-MYM-50 en Jira
→ Crea carpeta local EPIC-MYM-50-messaging-system/
→ Crea stories en Jira (MYM-51, MYM-52, MYM-53...)
→ Crea carpetas locales de stories
→ Actualiza epic-tree.md
✅ Completado
```

**Nivel 3 - Múltiples Épicas:**

```
Input: "Sistema completo de suscripciones mensuales con planes y billing"
→ Detecta que requiere 3+ épicas
→ ⚠️ ADVERTENCIA: Demasiado complejo
→ Genera plan de división detallado
→ NO crea nada en Jira/local
→ Usuario debe dividir la idea y ejecutar de nuevo por cada épica
⚠️ Plan generado - Requiere división
```

**Beneficios:**

- ✅ Inteligente: Analiza antes de crear
- ✅ Flexible: Maneja 1 story, 1 épica, o múltiples épicas
- ✅ Seguro: Previene crear features complejas de una vez
- ✅ Incremental: Mismo flujo Jira-First que setup inicial

### FASE 4: Shift-Left Testing (QA) 🔍 **CRITICAL ANALYSIS + TEST DESIGN**

**NUEVO ENFOQUE V2.0:** QA como analista crítico, no solo ejecutor de test cases.

**Por cada épica (una vez):**

- Usa `.prompts/fase-4-shift-left-testing/feature-test-plan.md`
- Genera `epics/EPIC-XXX/feature-test-plan.md`
- **Incluye:**
  - Business context analysis (valor de negocio, KPIs, user personas afectadas)
  - Technical architecture analysis (componentes, integration points)
  - Risk analysis (técnicos, de negocio, de integración)
  - **Critical Analysis & Questions for PO/Dev** ⚡ (feedback temprano)
  - Test strategy (sin forzar número mínimo de test cases)
  - NFRs validation plan

**Por cada story:**

- Usa `.prompts/fase-4-shift-left-testing/story-test-cases.md`
- Genera `epics/EPIC-XXX/stories/STORY-XXX/test-cases.md`
- **Trabaja en 5 FASES:**
  1. **Critical Analysis** - Business + technical context de la story
  2. **Story Quality Analysis** - Identificar ambiguities, gaps, edge cases NO cubiertos
  3. **Refined Acceptance Criteria** - Refinar con datos específicos + edge cases
  4. **Test Design** - Test cases (flexible, con parametrización si aplica)
  5. **QA Feedback Report** - Preguntas y mejoras para PO/Dev ANTES de implementar

**Contexto completo requerido:**

- `.context/idea/business-model.md`
- `.context/PRD/` (TODOS los archivos)
- `.context/SRS/` (TODOS los archivos)
- `.context/PBI/epics/EPIC-XXX/epic.md`
- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/story.md`

**Beneficios:**

- ✅ QA entiende el "por qué" de la feature (business context)
- ✅ Identifica ambigüedades ANTES de implementación
- ✅ Feedback temprano para mejorar stories (valor real de Shift-Left)
- ✅ Test cases basados en arquitectura real (integration/API tests correctos)
- ✅ NO forzar número fijo de test cases (depende de complejidad)
- ✅ Parametrización cuando aplique (reduce duplicación)
- ✅ Edge cases identificados proactivamente

### FASE 5: Planning (Dev)

**Por cada épica (una vez):**

- Usa `.prompts/fase-5-planning/feature-implementation-plan.md`
- Genera `epics/EPIC-XXX/feature-implementation-plan.md`

**Por cada story (antes de codear):**

- Usa `.prompts/fase-5-planning/story-implementation-plan.md`
- Genera `epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md`

## 🎯 Output esperado

### Para MVP Inicial (usando pbi-product-backlog.md)

Al completar todas las fases para una story tendrás:

- Definición clara (story.md)
- Test cases detallados (test-cases.md)
- Plan de implementación (implementation-plan.md)
- **TODO en una carpeta** → Context Engineering optimizado

### Para Features Post-MVP (usando pbi-add-feature.md)

**Nivel 1 (Story Individual):**

- Story creada en Jira con ID real
- Carpeta local STORY-XXX/ con story.md
- Epic.md y epic-tree.md actualizados

**Nivel 2 (Épica Completa):**

- Épica creada en Jira con ID real
- Carpeta local EPIC-XXX/ con epic.md
- Todas las stories creadas en Jira con IDs reales
- Carpetas locales STORY-XXX/ con story.md
- Epic-tree.md actualizado

**Nivel 3 (Múltiples Épicas):**

- Plan de división detallado generado
- Roadmap de implementación
- Análisis de dependencias
- ⚠️ NINGÚN archivo creado (requiere aprobación y división primero)

## 📝 Nomenclatura de Carpetas

**IMPORTANTE:** Nomenclatura estándar usando IDs reales de Jira.

### Épicas

**Formato:** `EPIC-{PROYECTO}-{NUMERO}-{nombre-descriptivo}/`

**Componentes:**

- `{PROYECTO}`: Código del proyecto en Jira (ej: MYM, UPEX) - MAYÚSCULAS
- `{NUMERO}`: ID numérico de Jira sin ceros a la izquierda (ej: 2, 13, 28)
- `{nombre-descriptivo}`: 2-4 palabras en kebab-case, minúsculas, descriptivo

**Ejemplos válidos:**

- ✅ `EPIC-MYM-2-user-authentication-profiles/`
- ✅ `EPIC-MYM-13-mentor-discovery-search/`
- ✅ `EPIC-UPEX-45-payment-processing/`

**Ejemplos INVÁLIDOS:**

- ❌ `EPIC-001-user-auth/` (falta código proyecto)
- ❌ `EPIC_MYM_2_UserAuth/` (snake_case/CamelCase)
- ❌ `EPIC-MYM-002-auth/` (no usar ceros a la izquierda)
- ❌ `EPIC-MYM-2-user-authentication-and-comprehensive-profile-management-system/` (muy largo)

### Stories

**Formato:** `STORY-{PROYECTO}-{NUMERO}-{nombre-descriptivo}/`
(Mismas reglas que épicas)

**Ejemplos válidos:**

- ✅ `STORY-MYM-3-user-signup-email/`
- ✅ `STORY-MYM-14-view-all-mentors/`
- ✅ `STORY-UPEX-67-stripe-payment-integration/`

### Reglas Generales

- ✅ Usar kebab-case en nombres de carpetas (palabras separadas por guiones)
- ✅ IDs sin ceros a la izquierda (MYM-2, no MYM-002)
- ✅ Nombres concisos pero descriptivos (2-4 palabras)
- ❌ NO usar snake_case, CamelCase, o espacios
- ❌ NO usar caracteres especiales excepto guiones (-)
- ❌ NO inventar IDs, SIEMPRE usar IDs reales de Jira

**Nota:** El flujo Jira-First garantiza que siempre uses IDs correctos porque primero creas el issue en Jira, obtienes el ID, y luego creas la carpeta local.
