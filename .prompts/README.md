# 🤖 AI PROMPTS - Context Engineering para Desarrollo de Software

Este directorio contiene prompts optimizados para generar documentación de proyecto siguiendo el **AI-Driven Software Project Blueprint**.

---

## 📋 ÍNDICE DE PROMPTS

### **🔹 FASES SINCRÓNICAS** (una sola vez, setup inicial)

#### **Fase 1: Constitution** (Definición del modelo de negocio)
- `fase-1-constitution/business-model.md` - Generar Business Model Canvas
- `fase-1-constitution/market-context.md` - Generar análisis de mercado

#### **Fase 2: Architecture** (Product + Technical specs)

**PRD (Product Requirements Document):**
- `fase-2-architecture/prd-executive-summary.md` - Problem statement, solution, KPIs
- `fase-2-architecture/prd-user-personas.md` - Perfiles de usuarios objetivo
- `fase-2-architecture/prd-mvp-scope.md` - Épicas iniciales y user stories del MVP
- `fase-2-architecture/prd-user-journeys.md` - Flujos de usuario (happy + edge cases)

**SRS (Software Requirements Specification):**
- `fase-2-architecture/srs-functional-specs.md` - Requerimientos funcionales
- `fase-2-architecture/srs-non-functional-specs.md` - Performance, security, scalability
- `fase-2-architecture/srs-architecture-specs.md` - Arquitectura del sistema
- `fase-2-architecture/srs-api-contracts.md` - OpenAPI spec de endpoints

---

### **🔹 FASES ASINCRÓNICAS** (iterativas, por sprint/épica)

#### **Fase 3: Specification** (Product Backlog)
- `fase-3-specification/pbi-product-backlog.md` - Crear epic-tree, épicas y stories

#### **Fase 4: Shift-Left Testing** (QA temprano)
- `fase-4-shift-left-testing/feature-test-plan.md` - Plan de pruebas a nivel épica
- `fase-4-shift-left-testing/story-test-cases.md` - Test cases detallados por story

#### **Fase 5: Planning** (Planificación técnica)
- `fase-5-planning/feature-implementation-plan.md` - Plan técnico a nivel épica
- `fase-5-planning/story-implementation-plan.md` - Plan detallado de implementación por story

#### **Fase 6: Implementation** ❌ NO HAY PROMPTS
**¿Por qué no hay prompts?**
- Esta fase usa `.context/guidelines/` como referencia (no genera docs)
- La IA implementa código siguiendo los implementation plans de Fase 5
- Lee: `.context/guidelines/implementation-workflow.md`, `code-standards.md`, etc.

#### **Fase 7: Code Review** ❌ NO HAY PROMPTS
**¿Por qué no hay prompts?**
- Esta fase usa `.context/guidelines/code-standards.md` como referencia
- El reviewer verifica adherencia a estándares de código
- NO genera documentación adicional

#### **Fase 8: Test Automation Engineering** (Arquitectura de testing)
- `fase-8-test-automation/test-strategy.md` - Estrategia general de testing del proyecto
- `fase-8-test-automation/kata-implementation-plan.md` - Plan de implementación de KATA framework
- `fase-8-test-automation/automation-standards.md` - Estándares de código para tests

---

## 🎯 CÓMO USAR ESTOS PROMPTS

### **Instrucciones Generales**

1. **Abrir el archivo del prompt** correspondiente a la fase en la que estás
2. **Copiar TODO el contenido** del archivo (Ctrl+A → Ctrl+C)
3. **Pegar en tu chat con la IA** (Claude, ChatGPT, etc.)
4. **Reemplazar los placeholders** con tu información específica:
   - `[usar archivo.md]` → Pega el contenido del archivo referenciado
   - `[industria/vertical]` → Especifica tu industria
   - `[proyecto]` → Nombre de tu proyecto
5. **Ejecutar el prompt**
6. **Copiar la respuesta de la IA** al archivo destino en `.context/`

---

### **Workflow Secuencial**

#### **🔹 FASES SINCRÓNICAS** (una sola vez)

#### **Paso 1: Fase 1 - Constitution**

1. Usa `business-model.md` → Genera `.context/idea/business-model.md`
2. Usa `market-context.md` (pega el business-model.md previo) → Genera `.context/idea/market-context.md`

#### **Paso 2: Fase 2 - Architecture (PRD)**

1. Usa `prd-executive-summary.md` → Genera `.context/PRD/executive-summary.md`
2. Usa `prd-user-personas.md` → Genera `.context/PRD/user-personas.md`
3. Usa `prd-mvp-scope.md` → Genera `.context/PRD/mvp-scope.md`
4. Usa `prd-user-journeys.md` → Genera `.context/PRD/user-journeys.md`

#### **Paso 3: Fase 2 - Architecture (SRS)**

1. Usa `srs-functional-specs.md` → Genera `.context/SRS/functional-specs.md`
2. Usa `srs-non-functional-specs.md` → Genera `.context/SRS/non-functional-specs.md`
3. Usa `srs-architecture-specs.md` → Genera `.context/SRS/architecture-specs.md`
4. Usa `srs-api-contracts.md` → Genera `.context/SRS/api-contracts.yaml`

---

#### **🔹 FASES ASINCRÓNICAS** (iterativas, por sprint/épica)

#### **Paso 4: Fase 3 - Specification (PBI)**

1. Usa `pbi-product-backlog.md` → Genera:
   - `.context/PBI/epic-tree.md`
   - `.context/PBI/epics/EPIC-XXX/epic.md` (por cada épica)
   - `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/story.md` (por cada story)

#### **Paso 5: Fase 4 - Shift-Left Testing (por cada épica)**

1. Usa `feature-test-plan.md` → Genera `.context/PBI/epics/EPIC-XXX/feature-test-plan.md`

**Por cada story de la épica:**
2. Usa `story-test-cases.md` → Genera `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/test-cases.md`

#### **Paso 6: Fase 5 - Planning (por cada épica)**

1. Usa `feature-implementation-plan.md` → Genera `.context/PBI/epics/EPIC-XXX/feature-implementation-plan.md`

**Por cada story de la épica:**
2. Usa `story-implementation-plan.md` → Genera `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md`

#### **Paso 7: Fase 6 - Implementation**

❌ **NO hay prompts para esta fase**

La IA implementa código siguiendo:
- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md` (de Fase 5)
- `.context/guidelines/implementation-workflow.md`
- `.context/guidelines/code-standards.md`
- `.context/guidelines/error-handling.md`
- `.context/guidelines/mcp-usage-tips.md`

#### **Paso 8: Fase 7 - Code Review**

❌ **NO hay prompts para esta fase**

El reviewer verifica:
- Adherencia a `.context/guidelines/code-standards.md`
- Tests completos
- Documentation actualizada

#### **Paso 9: Fase 8 - Test Automation Engineering (TAE)**

**Una sola vez para todo el proyecto:**

1. Usa `test-strategy.md` → Genera `.context/guidelines/tae/test-strategy.md`
   - Input: PRD completo, SRS completo, PBI epic-tree
   - Define estrategia de testing: scope, niveles, componentes KATA, execution strategy

2. Usa `kata-implementation-plan.md` → Genera `.context/guidelines/tae/kata-implementation-plan.md`
   - Input: Test Strategy, PBI completo, SRS Architecture
   - Define roadmap de implementación: componentes API/UI, ATCs por componente, priorización

3. Usa `automation-standards.md` → Genera `.context/guidelines/tae/automation-standards.md`
   - Input: Test Strategy, KATA Architecture docs
   - Define estándares: naming conventions, code structure, assertions guidelines, code review checklist

**Archivos de referencia (ya completos en `.context/guidelines/tae/`):**
- `kata-architecture.md` - Documentación completa de KATA adaptada al proyecto
- `test-data-management.md` - Estrategias de gestión de datos de prueba
- `tms-integration.md` - Integración con Xray Cloud o Jira Direct
- `ci-cd-integration.md` - Configuración de GitHub Actions para tests

**Plantillas (llenar conforme se implementa):**
- `component-catalog.md` - Catálogo de componentes implementados
- `atc-registry.md` - Registro de ATCs con trazabilidad a Jira

---

## ⚙️ TIPS DE USO

### **Contexto Acumulativo**

Los prompts están diseñados para funcionar en cascada:
- Cada prompt pide como input el output de prompts anteriores
- Siempre pega el contenido de los archivos generados previamente cuando el prompt lo solicite

### **Placeholders a Reemplazar**

Cuando veas:
- `[usar archivo.md]` → Copia y pega el contenido completo del archivo
- `[especificar X]` → Reemplaza con tu valor específico
- `[listar Y]` → Lista los elementos solicitados

### **Iteración**

- Si la IA genera algo que no te gusta, puedes pedirle que lo refine
- Puedes agregar contexto adicional entre corchetes en el prompt
- Los prompts son templates, no reglas absolutas

### **Herramientas Complementarias**

- **Supabase MCP:** Para obtener schema real de DB (no usar SQL estático en docs)
- **Atlassian MCP:** Para sincronizar PBI con Jira después de generarlos
- **Mermaid Live Editor:** Para visualizar/editar diagramas generados

---

## 🚨 IMPORTANTE

### **NO hacer:**
- ❌ Modificar los prompts sin entender su propósito
- ❌ Saltarse fases (cada fase depende de la anterior)
- ❌ Usar SQL estático en documentación (siempre usar Supabase MCP)

### **SÍ hacer:**
- ✅ Seguir el orden secuencial de fases
- ✅ Pegar contexto completo cuando el prompt lo solicite
- ✅ Revisar y refinar outputs de la IA
- ✅ Mantener consistencia en naming (IDs de épicas/stories)

---

## 📁 ESTRUCTURA DE SALIDA ESPERADA

Después de usar todos los prompts, tu directorio `.context/` debe verse así:

```
.context/
├── idea/                          [Fase 1]
│   ├── business-model.md
│   └── market-context.md
│
├── PRD/                           [Fase 2]
│   ├── executive-summary.md
│   ├── user-personas.md
│   ├── mvp-scope.md
│   └── user-journeys.md
│
├── SRS/                           [Fase 2]
│   ├── functional-specs.md
│   ├── non-functional-specs.md
│   ├── architecture-specs.md
│   └── api-contracts.yaml
│
├── PBI/                           [Fases 3-5]
│   ├── epic-tree.md
│   └── epics/
│       └── EPIC-XXX-nombre/
│           ├── epic.md                     [Fase 3]
│           ├── feature-test-plan.md        [Fase 4]
│           ├── feature-implementation-plan.md [Fase 5]
│           └── stories/
│               └── STORY-XXX-nombre/
│                   ├── story.md            [Fase 3]
│                   ├── test-cases.md       [Fase 4]
│                   └── implementation-plan.md [Fase 5]
│
└── guidelines/                    [Fases 6-7-8 - Reference material]
    ├── implementation-workflow.md
    ├── code-standards.md
    ├── error-handling.md
    ├── context-loading.md
    ├── mcp-usage-tips.md
    │
    └── tae/                       [Fase 8]
        ├── README.md
        ├── test-strategy.md
        ├── kata-architecture.md
        ├── kata-implementation-plan.md
        ├── component-catalog.md
        ├── atc-registry.md
        ├── automation-standards.md
        ├── test-data-management.md
        ├── tms-integration.md
        └── ci-cd-integration.md
```

---

## 🔗 RECURSOS ADICIONALES

- **Blueprint completo:** `docs/ai-driven-software-project-blueprint.md`
- **KATA Architecture (TAE):** `docs/kata-test-architecture.md`
- **Guidelines para IA:** `.context/guidelines/`

---

## 📞 SOPORTE

Si tienes dudas sobre cómo usar estos prompts:
1. Lee el Blueprint completo en `docs/`
2. Consulta los ejemplos en cada prompt
3. Experimenta con prompts individuales primero

---

**Versión:** 3.0 (8 Fases: Sincrónicas + Asincrónicas)
**Última actualización:** 2025-10-29
**Autor:** UPEX Galaxy - DOJO AI-Powered Quality Engineer
