# Fase 7: Code Review - Guías de Prompts

> **Tipo de fase:** Asincrónica (iterativa por story)
> **Propósito:** Revisar código estáticamente antes de merge

---

## 🎯 ¿Qué es esta fase?

En esta fase se realiza **code review estático** del código implementado en Fase 6.

**Esta fase se enfoca SOLO en:**
- ✅ **Análisis estático** del código
- ✅ **Linting** (ESLint, Prettier, etc.)
- ✅ **Code standards** (DRY, naming, TypeScript)
- ✅ **Security básico** (no secrets hardcodeados, validación de inputs)
- ✅ **Performance básico** (no loops innecesarios, queries optimizadas)
- ✅ **Cumplimiento de Acceptance Criteria**

**Esta fase NO incluye:**
- ❌ Tests unitarios (eso es Fase 8: Test Automation)
- ❌ Tests de integración (eso es Fase 8)
- ❌ Test coverage (eso es Fase 8)
- ❌ Ejecución de tests automatizados (eso es Fase 8)

---

## 📋 Cuándo usar esta fase

**Prerequisitos:**
- ✅ Story implementada completamente (Fase 6)
- ✅ Build exitoso sin errores TypeScript
- ✅ Funcionalidad validada manualmente

**Workflow típico:**
```
Fase 6 (Implementation)
    ↓
Fase 7 (Code Review) ← ESTÁS AQUÍ
    ↓
[Si aprobado] → Fase 8 (Test Automation)
[Si cambios requeridos] → Volver a Fase 6
```

---

## 📚 Prompts disponibles

| Prompt                 | Cuándo usarlo         | Propósito                    |
| ---------------------- | --------------------- | ---------------------------- |
| **`review-pr.md`** ⭐   | Review completo de PR | Análisis estático completo   |
| **`setup-linting.md`** | Proyecto sin linter   | Configurar ESLint + Prettier |

---

## 🔍 ¿Qué revisa esta fase?

### 1. ✅ **Acceptance Criteria**
- Todos los AC de la story se cumplen
- Funcionalidad implementada según especificación

### 2. 📐 **Code Standards**
- **DRY:** No código duplicado
- **Naming:** Variables/funciones descriptivas
- **TypeScript:** Sin `any`, tipos correctos
- **Error handling:** Try-catch apropiados
- **Magic numbers:** No valores hardcodeados

### 3. 🏗️ **Architecture**
- Estructura de carpetas correcta
- Separación de concerns (UI / Logic / Data)
- Componentes reutilizables
- Design patterns apropiados

### 4. 🔒 **Security**
- No secrets hardcodeados
- Validación de inputs de usuario
- Sanitización de datos
- SQL injection prevention (si aplica)

### 5. ⚡ **Performance**
- No loops innecesarios
- Memoization donde aplique (React)
- Queries optimizadas (no N+1)
- Lazy loading si corresponde

### 6. 🎨 **UI/UX** (si aplica)
- Usa componentes del design system
- Responsive design
- Loading/error states
- Accesibilidad básica (a11y)

### 7. 🔧 **Linting**
- ESLint sin errores
- Prettier aplicado (formato consistente)
- No warnings ignorados sin razón

---

## 🚫 ¿Qué NO revisa esta fase?

**Tests automatizados:**
- ❌ NO revisa tests unitarios (Fase 8)
- ❌ NO revisa tests de integración (Fase 8)
- ❌ NO revisa test coverage (Fase 8)
- ❌ NO ejecuta tests automatizados (Fase 8)

**Razón:** La separación entre Code Review (estático) y Test Automation (dinámico) permite:
- QA Engineer se enfoca en testing (Fase 8)
- Tech Lead se enfoca en calidad de código (Fase 7)
- Procesos paralelos y especializados

---

## ⚙️ Setup de Linting

**Si el proyecto NO tiene linter configurado:**

1. Usa el prompt `setup-linting.md`
2. La IA configurará ESLint + Prettier (sin scripts interactivos)
3. Valida que funciona: `npm run lint`

**Si el proyecto YA tiene linter:**
- Ejecuta: `npm run lint`
- Revisa warnings/errors
- Corrige antes de aprobar PR

---

## 🔄 Workflow típico de uso

### Escenario 1: Review de PR

```bash
# 1. Código ya implementado (Fase 6)
# 2. Usa el prompt principal
Use: review-pr.md

# 3. La IA analiza y genera reporte
# 4. Decide: APPROVE / CHANGES REQUESTED

# Si APPROVE → Fase 8 (Test Automation)
# Si CHANGES REQUESTED → Dev corrige (Fase 6)
```

### Escenario 2: Proyecto sin linter

```bash
# 1. Detectas que no hay ESLint configurado
# 2. Usa el prompt de setup
Use: setup-linting.md

# 3. La IA configura linter
# 4. Valida: npm run lint
# 5. Luego procede con review normal
```

---

## ⚠️ Restricciones críticas

### ❌ NO HACER:
- **NO aprobar código con secrets hardcodeados**
- **NO aprobar código con `any` en TypeScript (salvo excepciones justificadas)**
- **NO ignorar violaciones de DRY**
- **NO ejecutar scripts interactivos** para configurar tools
- **NO revisar tests automatizados** (eso es Fase 8)

### ✅ SÍ HACER:
- **Ejecutar linting** (`npm run lint`)
- **Revisar code standards** completos
- **Validar AC cumplidos** (manualmente o con smoke test)
- **Usar Context7 MCP** si dudas de best practices de framework
- **Pedir al usuario** si necesitas ejecutar algo interactivo
- **Ser específico** en feedback (archivo:línea)

---

## 💬 Output esperado de la IA

**Reporte completo de review:**

```markdown
# Code Review: STORY-XXX

## ✅ APPROVED / ❌ CHANGES REQUESTED / ⚠️ APPROVED with comments

---

## 🎯 Cumplimiento de Acceptance Criteria

- ✅ AC1: [Descripción] - Cumplido
- ✅ AC2: [Descripción] - Cumplido
- ❌ AC3: [Descripción] - **NO cumplido** (razón)

---

## 🔍 Issues Encontrados

### 🚨 Critical (debe corregirse):
1. **`app/mentors/page.tsx:45`** - API key hardcodeada
   - **Razón:** Security risk
   - **Sugerencia:** Mover a `.env`

### ⚠️ Medium (debería corregirse):
2. **`lib/api.ts:12`** - Código duplicado
   - **Razón:** Viola DRY
   - **Sugerencia:** Extraer a función reutilizable

### 💡 Nitpicks (opcional):
3. **`components/MentorCard.tsx:8`** - Nombre de variable poco descriptivo
   - **Sugerencia:** `data` → `mentorData`

---

## ✅ Aspectos Positivos

- Buena separación de concerns
- Componentes del design system usados correctamente
- Error handling implementado

---

## 🔧 Linting

- **ESLint:** ✅ Sin errores / ❌ X errores
- **TypeScript:** ✅ Sin errores / ❌ X errores
- **Prettier:** ✅ Aplicado / ⏸️ Pendiente

---

## 🎯 Decisión Final

- [ ] ✅ **APPROVED** - Listo para Fase 8 (Test Automation)
- [ ] ⚠️ **APPROVED with comments** - Merge + crear issues para mejoras menores
- [ ] ❌ **CHANGES REQUESTED** - Corregir critical/medium issues antes de continuar

---

## 💬 Comentarios Adicionales

[Feedback adicional para el developer]

---

**Próximo paso:**
- Si APPROVED → Fase 8: Test Automation (`.prompts/fase-8-test-automation/`)
- Si CHANGES REQUESTED → Fase 6: Corregir issues (`.prompts/fase-6-implementation/fix-issues.md`)
```

---

## 📖 Recursos adicionales

**Guidelines a consultar:**
- `.context/guidelines/code-standards.md` - Estándares completos
- `.context/guidelines/error-handling.md` - Manejo de errores
- `.context/design-system.md` - UI/UX standards

**Story context:**
- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/story.md` - Acceptance Criteria
- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/implementation-plan.md` - Plan técnico

---

## 🎯 Quick Start

```bash
# 1. Elige el prompt apropiado
cd .prompts/fase-7-code-review/

# 2. Si proyecto sin linter → setup-linting.md
# 3. Para review normal → review-pr.md

# 4. Copia el contenido y reemplaza [PROYECTO], [NUM], [nombre]

# 5. Pégalo en tu chat con la IA

# 6. La IA generará reporte de review
```

---

**Nota:** Esta fase revisa código estáticamente. Los tests automatizados se revisan/crean en Fase 8 (Test Automation).
