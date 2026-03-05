# Fase 7: Implementation - Guías de Prompts

> **Tipo de fase:** Asincrónica (iterativa por story)
> **Propósito:** Implementar código funcional + unit tests siguiendo los planes de Fase 6

---

## 🎯 ¿Qué es esta fase?

En esta fase **NO generas documentación**. En su lugar, **implementas código real** que hace funcionar la aplicación **+ unit tests para lógica crítica**.

**Esta fase se enfoca SOLO en:**

- ✅ Implementar funcionalidad según `implementation-plan.md`
- ✅ **Crear unit tests para lógica de negocio**
- ✅ **Corregir bugs/defects reportados en Jira**
- ✅ Seguir code standards de `.context/guidelines/`
- ✅ Validar manualmente que funciona (smoke testing)
- ✅ Crear código limpio y mantenible

**Esta fase NO incluye:**

- ❌ Pruebas de integración con APIs (eso es Fase 11: Test Automation)
- ❌ Pruebas E2E (eso es Fase 11: Test Automation)
- ❌ Code review (eso es Fase 8: Code Review)

---

## 📋 Cuándo usar esta fase

**Prerequisitos:**

- ✅ Story tiene `implementation-plan.md` completo (Fase 6: Planning)
- ✅ Test cases definidos en `acceptance-test-plan.md` (Fase 5: Shift-Left Testing)
- ✅ Design system configurado (Fase 3: Infrastructure - si hay UI)
- ✅ Architecture specs claras (Fase 2: Architecture)

**Workflow típico:**

```
Fase 6 (Planning)
    ↓
Fase 7 (Implementation + Unit Tests) ← ESTÁS AQUÍ
    ↓
Fase 8 (Code Review)
    ↓
Fase 9 (Deployment Staging)
    ↓
Fase 10 (Exploratory Testing)
    ↓
Fase 11 (Test Automation - Integration/E2E)
```

---

## 📚 Prompts disponibles

| Prompt                             | Cuándo usarlo                       | Propósito                              | Duración  |
| ---------------------------------- | ----------------------------------- | -------------------------------------- | --------- |
| **`implement-story.md`** ⭐        | Iniciar story desde cero            | Implementar funcionalidad completa     | 1-4 hours |
| **`unit-testing.md`** ⭐           | Durante/después de implementación   | Crear unit tests para lógica crítica   | 30-90 min |
| **`bug-fix-workflow.md`** ⭐       | Bug/Defect reportado en Jira        | Workflow completo: triage, fix, document | 30-90 min |
| **`continue-implementation.md`**   | Retomar story pausada               | Continuar desde donde quedó            | Variable  |
| **`fix-issues.md`**                | Debuggear errores durante desarrollo| Corregir bugs encontrados localmente   | Variable  |

---

## 🔄 Workflow típico de uso

### Escenario 1: Implementar story nueva (Recomendado)

```bash
# 1. Implementar funcionalidad
Use: implement-story.md

# 2. La IA implementa step by step
# 3. Valida manualmente que funciona

# 4. Crear unit tests (NUEVO en v4.0)
Use: unit-testing.md

# 5. La IA analiza código, identifica funciones críticas, crea tests
# 6. Valida que tests pasan (npm run test)

# 7. Si todo OK → Fase 8 (Code Review)
```

### Escenario 2: Story pausada/interrumpida

```bash
# 1. Retoma desde donde quedó
Use: continue-implementation.md

# 2. La IA analiza qué falta
# 3. Continúa implementación

# 4. Una vez completado, crear unit tests
Use: unit-testing.md
```

### Escenario 3: Errores/bugs durante implementación local

```bash
# 1. Debuggea el error
Use: fix-issues.md

# 2. La IA investiga y corrige
# 3. Valida que funciona

# 4. Actualizar/crear unit tests si aplica
Use: unit-testing.md
```

### Escenario 4: Bug/Defect reportado en Jira (desde QA o Producción)

```bash
# 1. Bug reportado en Jira por QA o usuarios
Use: bug-fix-workflow.md

# 2. La IA:
#    - Lee contexto completo de Jira (issue + comentarios)
#    - Reproduce el bug
#    - Hace triage (real bug vs WAD vs duplicate)
#    - Implementa fix mínimo
#    - Crea branch, commit, PR
#    - Documenta en Jira

# 3. Si es HOTFIX (crítico en producción):
#    - Branch: hotfix/ISSUE-KEY/...
#    - PR directo a main

# 4. Para múltiples bugs en una sesión:
#    - Usa JQL query del prompt para listar bugs pendientes
#    - Usa Session Report Template al finalizar
```

### Escenario 5: Solo agregar tests a código existente

```bash
# Si ya implementaste la funcionalidad pero faltaron tests:

Use: unit-testing.md

# La IA:
# 1. Analiza código implementado
# 2. Identifica funciones críticas
# 3. Crea unit tests con alta cobertura
```

---

## ⚙️ MCP Tools requeridos

### **Context7 MCP** (Recomendado)

**¿Para qué?** Consultar documentación oficial de tecnologías (Next.js, React, Supabase, etc.)

**Si NO está disponible:**
La IA debe pedirle al usuario:

```
⚠️ MCP Context7 no detectado

Para implementar con documentación verificada y actualizada, necesito que conectes el MCP de Context7.

**¿Cómo conectarlo?**
1. Revisa: docs/mcp-config-[tu-herramienta].md
2. Agrega Context7 a tu configuración
3. Reinicia la sesión

¿Quieres continuar sin Context7? (usaré conocimiento interno, puede estar desactualizado)
```

### **Supabase MCP** (Si proyecto usa Supabase)

**¿Para qué?** Ejecutar queries, crear tablas, gestionar DB sin hardcodear SQL.

**Si NO está disponible:**
La IA debe advertir y pedir conexión o instruir al usuario cómo ejecutar manualmente.

---

## ⚠️ Restricciones críticas

### ❌ NO HACER:

- **NO hardcodear SQL** - Usa Supabase MCP o instruye al usuario
- **NO ejecutar scripts interactivos** - Evitar comandos que requieren input del usuario
- **NO hardcodear valores de configuración** - Usa environment variables
- **NO ignorar error handling** - Implementar según `.context/guidelines/error-handling.md`
- **NO crear componentes si ya existen** - Reusar design system
- **NO hacer commits automáticos** - Solo recomendar al usuario

### ✅ SÍ HACER:

- **Leer todos los guidelines** antes de empezar
- **Implementar step by step** según `implementation-plan.md`
- **Seguir code standards** (DRY, naming, TypeScript strict)
- **Validar manualmente** que funciona (smoke test)
- **Usar Context7 MCP** para consultar docs oficiales
- **Pedir al usuario** si algo requiere script interactivo

---

## 💬 Output esperado de la IA

**Durante implementación:**

1. Explicar cada step antes de ejecutarlo
2. Mostrar código creado/modificado con contexto
3. Validar manualmente que funciona
4. Reportar cualquier blocker o decisión técnica

**Al finalizar:**

````markdown
## ✅ Implementación Completada

**Archivos creados/modificados:**

- `app/page.tsx` - [Descripción breve]
- `components/[DomainComponent].tsx` - [Descripción breve]
- `lib/api/[domain-entity].ts` - [Descripción breve]

(Donde [DomainComponent] y [domain-entity] se definen según el dominio de la story. Ejemplos: MentorCard/mentors en MYM, ProductCard/products en SHOP, PostCard/posts en BLOG)

**Funcionalidad implementada:**

- ✅ AC1: [Descripción]
- ✅ AC2: [Descripción]
- ✅ AC3: [Descripción]

**Validación manual:**

- ✅ Página carga correctamente
- ✅ Datos se muestran
- ✅ Navegación funciona

**Comandos para probar:**

```bash
npm run dev
# Abre: http://localhost:3000/[ruta-de-tu-feature]
```
````

**Próximo paso:**

- ✅ Unit tests completados
- ⏭️ Fase 8: Code Review (usar `.prompts/fase-8-code-review/review-pr.md`)

````

---

## 📖 Recursos adicionales

**Guidelines a leer:**
- `.context/guidelines/DEV/` - Guidelines de desarrollo (code-standards, error-handling, data-testid)
- `.context/guidelines/DEV/spec-driven-development.md` - Principio SDD
- `.context/guidelines/MCP/` - Tips de MCP tools (un archivo por MCP)

**Specs técnicas:**
- `.context/SRS/architecture-specs.md` - Arquitectura del proyecto
- `.context/SRS/api-contracts.yaml` - Contratos de API
- `.context/design-system.md` - Design System (si hay UI)

---

## 🎯 Quick Start

```bash
# 1. Elige el prompt apropiado
cd .prompts/fase-7-implementation/

# 2a. Para implementar funcionalidad:
#     Copia el contenido de implement-story.md

# 2b. Para crear unit tests:
#     Copia el contenido de unit-testing.md

# 3. Reemplaza {PROJECT_KEY}, {ISSUE_NUM}, {nombre} con valores reales de tu story

# 4. Pégalo en tu chat con la IA

# 5. La IA implementará/testeará step by step
````

---

## 💡 Mejores Prácticas

### **1. Implementa primero, testea después**

- Primero usa `implement-story.md` para implementar
- Luego usa `unit-testing.md` para crear tests
- Esto permite identificar mejor qué funciones son críticas

### **2. No todos los archivos necesitan unit tests**

- Solo funciones con lógica de negocio compleja
- Helpers y utilidades reutilizables
- Cálculos y transformaciones
- NO testear componentes UI triviales

### **3. Mínimo 80% coverage en funciones críticas**

- Usa `npm run test:coverage` para validar
- Focus en calidad, no cantidad de tests

---

**Nota:** Esta fase implementa funcionalidad **+ unit tests**. Los integration/E2E tests se agregan en Fase 11 (Test Automation).
