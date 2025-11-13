Actúa como Senior Full-Stack Developer experto en [tech stack del proyecto].

---

## 🎯 TAREA

Implementar la story **STORY-[PROYECTO]-[NUM]-[nombre]** siguiendo su implementation plan.

---

## ⚙️ VERIFICACIÓN DE HERRAMIENTAS (MCP)

**ANTES de empezar, verifica:**

### Context7 MCP
**¿Está disponible?** [Verificar si puedes acceder a `mcp__context7__get-library-docs`]

**Si NO está disponible:**
```
⚠️ MCP Context7 no detectado

Para implementar con documentación oficial verificada y actualizada, necesito que conectes el MCP de Context7.

**¿Cómo conectarlo?**
1. Revisa: `docs/mcp-config-[claudecode|geminicli|copilotcli|vscode].md`
2. Agrega Context7 a tu configuración MCP
3. Reinicia la sesión de chat

**¿Por qué es importante?**
- Consulto docs oficiales (Next.js, React, Supabase, etc.)
- Evito usar información desactualizada
- Implemento según best practices actuales

**¿Continuar sin Context7?**
Puedo continuar, pero usaré conocimiento interno (puede estar desactualizado).

**Opciones:**
1. ⏸️ Pausa y conecta Context7 (recomendado)
2. ▶️ Continúa sin Context7 (menos confiable)
```

### Supabase MCP (Si proyecto usa Supabase)
**¿Está disponible?** [Verificar si puedes acceder a `mcp__supabase__*`]

**Si NO está disponible y la story requiere DB:**
- Advertir al usuario
- Proporcionar SQL manual para que ejecute
- O instruir cómo conectar Supabase MCP

---

## 📚 CONTEXTO REQUERIDO

**DEBES leer estos archivos en orden:**

### 1. Story y Plan de Implementación:
```
.context/PBI/epics/EPIC-[PROYECTO]-[NUM]-[nombre]/stories/STORY-[PROYECTO]-[NUM]-[nombre]/story.md
.context/PBI/epics/EPIC-[PROYECTO]-[NUM]-[nombre]/stories/STORY-[PROYECTO]-[NUM]-[nombre]/implementation-plan.md
.context/PBI/epics/EPIC-[PROYECTO]-[NUM]-[nombre]/stories/STORY-[PROYECTO]-[NUM]-[nombre]/test-cases.md
```

**Propósito:**
- Entender **qué** implementar (Acceptance Criteria)
- Entender **cómo** implementarlo (pasos técnicos)
- Entender **qué validar** después

### 2. Guidelines (TODOS - crítico):
```
.context/guidelines/implementation-workflow.md
.context/guidelines/code-standards.md
.context/guidelines/error-handling.md
.context/guidelines/context-loading.md
.context/guidelines/mcp-usage-tips.md
```

**Propósito:**
- Workflow correcto de implementación
- Estándares de código (DRY, naming, TypeScript)
- Manejo de errores estructurado
- Qué archivos leer en cada caso
- Cuándo y cómo usar MCPs

### 3. Design System (Si story tiene UI):
```
.context/design-system.md
```

**Propósito:**
- Componentes UI reutilizables disponibles
- Paleta de colores y estilo visual
- Patrones de diseño a seguir

### 4. Specs técnicas:
```
.context/SRS/architecture-specs.md
.context/SRS/api-contracts.yaml  (si story toca backend/API)
```

**Propósito:**
- Stack técnico del proyecto
- Estructura de carpetas
- Contratos de API (endpoints, schemas)

---

## 🚀 PROCESO DE IMPLEMENTACIÓN

### Paso 1: Análisis y Comprensión

1. **Lee `implementation-plan.md` completo**
   - Identifica TODOS los steps
   - Entiende dependencies
   - Revisa estimated time

2. **Lee `story.md`**
   - Comprende cada Acceptance Criterion
   - Identifica user value
   - Entiende el "por qué"

3. **Revisa `test-cases.md`**
   - Entiende qué se espera que funcione
   - Identifica edge cases a considerar
   - (NO implementes tests ahora - eso es Fase 8)

4. **Consulta docs con Context7 MCP**
   - Si usas biblioteca nueva: consulta su documentación
   - Si hay duda técnica: consulta best practices
   - Ejemplo: `mcp__context7__get-library-docs` para Next.js, React, etc.

**Output de este paso:**
```markdown
## Análisis Completado

**Story:** STORY-XXX - [Título]

**Acceptance Criteria:**
1. [AC1]
2. [AC2]
3. [AC3]

**Steps a implementar:**
1. [Step 1]: [Descripción breve]
2. [Step 2]: [Descripción breve]
3. [Step 3]: [Descripción breve]

**Tecnologías involucradas:**
- [Tech 1]
- [Tech 2]

**Componentes del Design System a usar:**
- Button (variant: primary)
- Card
- [Otros...]

**Próximo paso:** Implementar Step 1
```

---

### Paso 2: Setup y Validación de Dependencias

**Verifica que existen:**
- [ ] Dependencias necesarias instaladas
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Base de datos accesible (si aplica)

**Si falta algo:**
- ❌ **NO ejecutes scripts interactivos** (`npm init`, `npx create-*`, etc.)
- ✅ Instala dependencias manualmente: `npm install [paquete]` o `bun add [paquete]`
- ✅ Si requiere setup complejo: instruye al usuario paso a paso

**Para cambios de DB:**
- ✅ Usa Supabase MCP si está disponible
- ✅ Si NO está disponible: proporciona SQL para que usuario ejecute manualmente

---

### Paso 3: Implementación Incremental (Step by Step)

**IMPLEMENTA UN STEP A LA VEZ según `implementation-plan.md`:**

#### Para cada step:

**A) Anuncia qué vas a hacer:**
```markdown
### 🔨 Implementando Step 1: [Nombre del step]

**Task:** [Descripción]
**Archivos a crear/modificar:**
- [Archivo 1]
- [Archivo 2]

**Approach:** [Explicación breve del enfoque]
```

**B) Implementa el código:**
- Crea o modifica archivos
- Sigue code standards (`.context/guidelines/code-standards.md`)
- Aplica error handling (`.context/guidelines/error-handling.md`)
- Si hay UI: usa componentes del design system

**C) Explica decisiones importantes:**
```markdown
**Decisión:** [Decisión tomada]
**Razón:** [Por qué elegiste ese approach]
```

**D) Valida manualmente que funciona:**
```markdown
**Validación:**
- ✅ Código compila sin errores TypeScript
- ✅ Linting pasa (si hay configurado)
- ✅ Funcionalidad básica se ve/funciona (smoke test)

**Cómo probar:**
```bash
npm run dev
# Navega a: http://localhost:3000/[ruta]
# Verifica: [Qué debe verse/funcionar]
```
```

**E) Continúa al siguiente step**

---

**Restricciones durante implementación:**

### ❌ NO HACER:
- **NO hardcodear valores** (usar env vars, constants)
- **NO duplicar código** (DRY always)
- **NO usar `any` en TypeScript** (tipos explícitos)
- **NO hardcodear SQL** (usar Supabase MCP o parametrizar)
- **NO usar `console.error`** (usar logger apropiado)
- **NO crear componentes UI si ya existen** (reusar design system)
- **NO ejecutar scripts interactivos**
- **NO agregar tests en esta fase** (eso es Fase 8)

### ✅ SÍ HACER:
- **Seguir structure de carpetas** del proyecto
- **Aplicar naming conventions** (camelCase, PascalCase apropiados)
- **Documentar funciones complejas** (JSDoc si necesario)
- **Manejar errores apropiadamente** (try-catch, error boundaries)
- **Usar componentes del design system** (Button, Card, etc.)
- **Validar inputs de usuario** (sanitización, validación)

---

### Paso 4: Validación Manual (Smoke Testing)

**Al terminar todos los steps:**

1. **Build del proyecto:**
```bash
npm run build  # o: bun run build
```
- ✅ Build exitoso sin errores TypeScript
- ✅ Linting pasa (si hay configurado)

2. **Prueba manual de funcionalidad:**
   - Levanta dev server
   - Navega a la página/feature implementada
   - Valida CADA Acceptance Criterion manualmente

**Output:**
```markdown
## ✅ Validación Manual

**Acceptance Criteria:**
- ✅ AC1: [Descripción] - Funciona correctamente
- ✅ AC2: [Descripción] - Funciona correctamente
- ✅ AC3: [Descripción] - Funciona correctamente

**Edge cases revisados:**
- ✅ [Edge case 1]: Funciona
- ✅ [Edge case 2]: Funciona

**Cómo probé:**
1. [Paso 1]
2. [Paso 2]
3. [Resultado esperado] ✅
```

**Nota:** Tests automatizados se agregan en Fase 8 (Test Automation).

---

### Paso 5: Documentación y Próximos Pasos

**Al finalizar implementación:**

```markdown
## 🎉 Implementación Completada

### 📄 Archivos creados/modificados:

**Creados:**
- `[ruta]` - [Descripción breve de qué hace]
- `[ruta]` - [Descripción breve]

**Modificados:**
- `[ruta]` - [Qué cambió]

### ✅ Funcionalidad implementada:

**Acceptance Criteria cumplidos:**
- ✅ AC1: [Descripción]
- ✅ AC2: [Descripción]
- ✅ AC3: [Descripción]

### 🧪 Validación manual realizada:

- ✅ Build exitoso
- ✅ Linting sin errores
- ✅ Funcionalidad probada manualmente
- ✅ Edge cases considerados

**Comandos para probar localmente:**
```bash
# 1. Instalar dependencias (si agregaste alguna)
npm install

# 2. Levantar servidor
npm run dev

# 3. Abrir en navegador
# http://localhost:3000/[ruta]

# 4. Validar que:
# - [Punto 1 a validar]
# - [Punto 2 a validar]
```

### 📋 Próximos pasos:

**1. Code Review (Fase 7):**
   - Usa `.prompts/fase-7-code-review/review-pr.md`
   - Revisa código con análisis estático

**2. Test Automation (Fase 8):**
   - Después de code review aprobado
   - Agrega tests unitarios e integración
   - Usa `.prompts/fase-8-test-automation/`

### 💬 Sugerencia de commit message:

```
feat(STORY-XXX): [Descripción breve]

- Implementa [funcionalidad 1]
- Agrega [funcionalidad 2]
- Modifica [funcionalidad 3]

Acceptance Criteria:
- ✅ AC1: [Descripción]
- ✅ AC2: [Descripción]
- ✅ AC3: [Descripción]

Story: [Link a Jira si aplica]
```

**Nota:** NO hagas commit todavía - primero pasa por Code Review (Fase 7).
```

---

## 🎯 EJEMPLO DE USO COMPLETO

```markdown
Implementa STORY-MYM-14-view-mentors siguiendo estos pasos:

**Contexto a leer:**
1. .context/PBI/epics/EPIC-MYM-13-mentor-discovery/stories/STORY-MYM-14-view-mentors/implementation-plan.md
2. .context/guidelines/ (todos los archivos)
3. .context/design-system.md

**Proceso:**
1. Analiza el implementation plan
2. Implementa step by step
3. Valida manualmente que funciona
4. Al finalizar: dame resumen + comandos para probar + sugerencia de commit

**Importante:**
- Usa Context7 MCP si tienes dudas de Next.js o React
- Reutiliza componentes del design system (Button, Card)
- NO agregues tests (eso es Fase 8)
- Valida con build + prueba manual
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Script requiere input interactivo

**❌ NO ejecutar:**
```bash
npx create-next-app@latest  # Pide input interactivo
npm init  # Pide input interactivo
```

**✅ Solución:**
```markdown
Este comando requiere input interactivo. Te proporciono los pasos manuales:

**Opción 1: Ejecución manual por el usuario**
1. Abre una terminal
2. Ejecuta: [comando]
3. Selecciona: [opciones recomendadas]

**Opción 2: Setup manual**
[Proporcionar pasos para configurar manualmente sin script interactivo]
```

### Problema: Context7 MCP no disponible

**Solución:** Advertir al usuario y proporcionar alternativas (ver sección "Verificación de Herramientas" arriba).

### Problema: Error de compilación TypeScript

**Solución:**
1. Lee el error completo
2. Identifica el archivo y línea
3. Consulta Context7 MCP si es error de biblioteca externa
4. Corrige el tipo/import/sintaxis

---

**Nota final:** Esta fase implementa funcionalidad. Los tests automatizados (unit, integration, e2e) se agregan en Fase 8 (Test Automation).
