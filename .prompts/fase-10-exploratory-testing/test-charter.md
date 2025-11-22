Actúa como Senior QA Engineer especializado en exploratory testing y session-based test management.

---

## 🎯 TAREA

**FASE 10: TEST CHARTER GENERATION**

Crear charter de exploración estructurado para sesión de testing manual que cubra funcionalidad completa de la story.

**Este prompt se ejecuta DESPUÉS de:**
- smoke-test.md pasó exitosamente (deployment funcional)
- ANTES de session-notes.md (ejecución de la sesión)

---

## 📥 INPUT REQUERIDO

### 1. Story Actual

**Leer TODOS estos archivos:**
- `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/story.md` - **CRÍTICO** - Acceptance criteria completos
- `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md` - **CRÍTICO** - Test cases de Fase 5
- `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/smoke-test.md` - Resultado de smoke test

**Qué identificar:**
1. **Acceptance Criteria completos** - Qué debe funcionar
2. **Test cases definidos** - Happy path, edge cases, negative cases
3. **Áreas de riesgo** - Funcionalidad compleja, integraciones, UX crítica

### 2. Deployment Context

**Leer:**
- `.context/infrastructure-setup.md` - URLs y configuración
- `.context/SRS/design-specs.md` - Diseños y UX esperada (si aplica)

---

## ⚙️ VERIFICACIÓN DE HERRAMIENTAS (MCP)

**NO se requieren MCP para esta fase.**

### Herramientas Manuales:
- Browser para ejecutar testing
- DevTools (F12) para debugging
- Screenshot tools (opcional)

---

## 🎯 OBJETIVO

Crear test charter que guía sesión exploratoria de 60-90 minutos:

**Incluye:**
- ✅ Áreas a explorar (basadas en ACs y test cases)
- ✅ Técnicas de exploratory testing a usar
- ✅ Time-boxing por área (distribución de tiempo)
- ✅ Criterios de éxito claros
- ✅ Datos de prueba necesarios

**NO incluye:**
- ❌ Smoke test (ya ejecutado en prompt anterior)
- ❌ Tests automatizados (eso es Fase 11)
- ❌ Ejecución de la sesión (eso es session-notes.md)

**Resultado:** Charter estructurado que QA ejecuta en **60-90 minutos** de exploratory testing.

---

## 📤 OUTPUT GENERADO

### Test Charter:
- ✅ `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-charter.md` - Charter ejecutable

**Estructura del charter:**
```markdown
# Test Charter: [STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre} - Nombre]

**Fecha:** [Fecha]
**QA:** [Nombre]
**Duración estimada:** 60-90 minutos
**Staging URL:** https://[project]-develop.vercel.app

---

## 🎯 Objetivo de la Sesión

[Descripción de qué se va a explorar y por qué]

---

## 📋 Áreas a Explorar

### 1. [Área 1 - Happy Path]
- Qué probar: [Descripción]
- Técnica: Tours
- Tiempo: 15-20 minutos

### 2. [Área 2 - Edge Cases]
- Qué probar: [Descripción]
- Técnica: Boundary testing
- Tiempo: 20-25 minutos

### 3. [Área 3 - UX & Performance]
- Qué probar: [Descripción]
- Técnica: UX review
- Tiempo: 15-20 minutos

---

## 🔍 Técnicas a Usar

- [ ] Tours
- [ ] Edge cases
- [ ] Negative testing
- [ ] Pairing (diferentes user personas)
- [ ] UX review

---

## ✅ Criterios de Éxito

- [ ] Happy path funciona end-to-end
- [ ] Validaciones claras
- [ ] No hay errores críticos
- [ ] UX intuitiva

---

## 📝 Datos de Prueba

[Credenciales, data seeds, etc.]
```

---

## 🚨 RESTRICCIONES CRÍTICAS

### ❌ NO HACER:

- **NO duplicar smoke test** - Smoke test ya validó happy path básico
- **NO crear charter genérico** - Debe ser específico a la story
- **NO olvidar técnicas de exploratory testing** - Tours, edge cases, negative testing
- **NO omitir time-boxing** - Cada área debe tener tiempo estimado
- **NO incluir solo happy path** - Exploratory testing busca edge cases y bugs

### ✅ SÍ HACER:

- **Basarse en test cases de Fase 5** - Usar test cases como guía
- **Time-box cada área** - Distribuir 60-90 min efectivamente
- **Incluir diferentes técnicas** - Tours, edge cases, pairing, negative testing
- **Especificar criterios de éxito** - Qué debe funcionar para aprobar story
- **Incluir datos de prueba** - Credenciales, seeds, data necesaria

---

## 🔄 WORKFLOW

---

## 📋 PASO 1: ANALIZAR STORY Y TEST CASES

**Objetivo:** Entender qué explorar.

### Paso 1.1: Leer Acceptance Criteria

**Acción:** Leer `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/story.md`

**Identificar:**
1. **ACs principales:**
   - AC1: [Descripción]
   - AC2: [Descripción]
   - AC3: [Descripción]

2. **Funcionalidad compleja:**
   - ¿Hay formularios con validaciones múltiples?
   - ¿Hay integración con APIs externas?
   - ¿Hay lógica de negocio compleja?

3. **Áreas de riesgo:**
   - ¿Qué puede fallar?
   - ¿Qué es crítico para el usuario?

---

### Paso 1.2: Leer Test Cases de Fase 5

**Acción:** Leer `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md`

**Identificar:**
1. **Happy Path Test Cases:**
   - TC-001: [Descripción]
   - TC-002: [Descripción]

2. **Edge Cases Test Cases:**
   - TC-010: [Descripción]
   - TC-011: [Descripción]

3. **Negative Cases Test Cases:**
   - TC-020: [Descripción]
   - TC-021: [Descripción]

**Output al usuario:**
```markdown
## 📊 Análisis Completado

### Acceptance Criteria a cubrir:
- AC1: [Descripción]
- AC2: [Descripción]
- AC3: [Descripción]

### Test Cases identificados:
- Happy path: [X] test cases
- Edge cases: [Y] test cases
- Negative cases: [Z] test cases

### Áreas de riesgo:
- [Área 1 - ej: "Validaciones de formulario complejas"]
- [Área 2 - ej: "Integración con API de pagos"]
```

---

## 🗺️ PASO 2: DIVIDIR EN ÁREAS DE EXPLORACIÓN

**Objetivo:** Estructurar sesión en áreas time-boxed.

### Paso 2.1: Identificar Áreas

**Típicamente 3-5 áreas:**

**1. Happy Path (15-20 minutos):**
- Validar flujo principal end-to-end
- Ya cubierto en smoke test, pero explorar más profundo
- Técnica: Tours

**2. Edge Cases (20-25 minutos):**
- Inputs límite, vacíos, inválidos
- Boundary conditions
- Técnica: Boundary testing, Negative testing

**3. UX & Usabilidad (15-20 minutos):**
- ¿UI es intuitiva?
- ¿Mensajes de error son claros?
- ¿Loading states son apropiados?
- Técnica: UX review, User personas

**4. Integración con Backend (15-20 minutos):**
- APIs funcionan correctamente
- Data persiste
- Error handling de backend
- Técnica: Data flows, API testing

**5. Performance & Responsiveness (10-15 minutos) - Opcional:**
- Load times aceptables
- Responsive design funciona
- Técnica: Performance profiling

---

### Paso 2.2: Time-boxing

**Total: 60-90 minutos**

**Distribución recomendada:**
```
Área 1 (Happy Path):          15-20 min  (25%)
Área 2 (Edge Cases):           20-25 min  (35%)
Área 3 (UX):                   15-20 min  (25%)
Área 4 (Backend):              10-15 min  (15%)
Buffer para bugs encontrados:  10 min
```

**Ajustar según complejidad de la story.**

---

## 🛠️ PASO 3: DEFINIR TÉCNICAS DE EXPLORATORY TESTING

**Objetivo:** Especificar cómo explorar cada área.

### Técnicas Disponibles:

**1. Tours (Guided exploration):**
- **Feature Tour:** Explorar todas las features de la story
- **User Tour:** Explorar desde perspectiva de user persona
- **Data Tour:** Explorar diferentes tipos de data

**2. Edge Cases & Boundary Testing:**
- Inputs límite (max length, min value, etc.)
- Inputs vacíos
- Inputs inválidos (special characters, SQL injection attempts, XSS)
- Null/undefined values

**3. Negative Testing:**
- ¿Qué pasa si usuario hace algo incorrecto?
- ¿Validaciones funcionan?
- ¿Mensajes de error son claros?

**4. Pairing (User Personas):**
- Probar como Admin vs User vs Guest
- Diferentes roles tienen diferentes permisos

**5. UX Review:**
- ¿UI es intuitiva?
- ¿Navegación es clara?
- ¿Feedback visual es apropiado?

**6. Performance Testing:**
- Load times
- Responsiveness
- Stress testing (muchos datos)

---

### Paso 3.1: Asignar Técnicas a Áreas

**Mapeo:**

```markdown
| Área                | Técnicas                          |
|---------------------|-----------------------------------|
| Happy Path          | Tours, Feature Tour               |
| Edge Cases          | Boundary Testing, Negative Testing|
| UX                  | UX Review, Pairing                |
| Backend Integration | Data flows, API testing           |
| Performance         | Performance profiling             |
```

---

## 📝 PASO 4: DEFINIR CRITERIOS DE ÉXITO

**Objetivo:** Qué debe funcionar para aprobar la story.

### Paso 4.1: Criterios Mínimos

**Basados en Acceptance Criteria:**

```markdown
## ✅ Criterios de Éxito

### Funcionalidad:
- [ ] AC1: [Descripción] funciona end-to-end
- [ ] AC2: [Descripción] funciona correctamente
- [ ] AC3: [Descripción] funciona sin errores

### Validaciones:
- [ ] Inputs inválidos muestran mensajes claros
- [ ] Edge cases manejan correctamente
- [ ] Error handling es apropiado

### UX:
- [ ] UI es intuitiva
- [ ] Navegación es clara
- [ ] Loading states son apropiados
- [ ] Responsive design funciona (mobile, tablet, desktop)

### Performance:
- [ ] Load times < 3 segundos
- [ ] No hay lags o freezes
- [ ] APIs responden en < 500ms (promedio)

### Calidad:
- [ ] No hay bugs críticos (severity: critical)
- [ ] Bugs high son acceptables si hay workaround
- [ ] Bugs medium/low no bloquean aprobación
```

---

## 🔐 PASO 5: PREPARAR DATOS DE PRUEBA

**Objetivo:** Asegurar que QA tiene data necesaria.

### Paso 5.1: Identificar Datos Necesarios

**Credenciales (si aplica):**
```markdown
## 📝 Datos de Prueba

### Credenciales de Test:

**User normal:**
- Email: `test@example.com`
- Password: `Test123!`

**Admin:**
- Email: `admin@example.com`
- Password: `Admin123!`

**Guest:**
- Sin credenciales (testing como guest)
```

---

### Paso 5.2: Seed Data

**Si story requiere data pre-existente:**

```markdown
### Data Seeds:

**[Entidades principales]:**
- [Entity 1]: "[Nombre]" (tiene [X] relaciones activas)
- [Entity 2]: "[Nombre]" (sin relaciones)

(Donde [Entity] se determina del dominio del proyecto.
Ejemplos: Mentors en MYM, Products en SHOP, Posts en BLOG)

**[Relaciones/Transacciones]:**
- [Relation 1]: ID `xxx` (status: pending)
- [Relation 2]: ID `yyy` (status: completed)

(Ejemplos: Sessions en MYM, Orders en SHOP, Comments en BLOG)

### Cómo crear data de prueba:
[Instrucciones para crear data via UI o seeds]
```

---

### Paso 5.3: Test Data Edge Cases

**Data para edge cases:**

```markdown
### Test Data para Edge Cases:

**Inputs inválidos a probar:**
- Email sin @: `testexample.com`
- Password muy corta: `123`
- Special characters: `<script>alert('xss')</script>`
- SQL injection: `'; DROP TABLE users; --`
- Empty fields: ` ` (solo espacios)

**Boundary values:**
- Max length: [255 chars string]
- Min value: 0, -1
- Max value: 999999
```

---

## 📄 PASO 6: GENERAR TEST CHARTER

**Objetivo:** Documentar charter completo.

### Paso 6.1: Crear Archivo

**Acción:** Crear `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-charter.md`

**Contenido completo:**

```markdown
# Test Charter: [STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre} - Nombre de la Story]

**Fecha:** [Fecha actual]
**QA:** [Nombre del QA ejecutor]
**Duración estimada:** 60-90 minutos
**Staging URL:** https://[project]-develop.vercel.app

---

## 🎯 Objetivo de la Sesión

Explorar la funcionalidad [nombre de la story] en staging environment para validar:
- Acceptance criteria se cumplen completamente
- Edge cases y negative scenarios son manejados correctamente
- UX es intuitiva y no hay bugs críticos
- Integración con backend funciona sin errores

**Contexto:**
[Breve descripción de qué hace la story, por qué es importante]

---

## 📋 Áreas a Explorar

### 1. Happy Path - Flujo Principal (15-20 min)

**Qué probar:**
[Descripción del flujo principal basado en AC1, AC2, AC3]

**Steps a explorar:**
1. [Paso 1 del happy path]
2. [Paso 2 del happy path]
3. [Paso 3 del happy path]
4. [Resultado esperado]

**Técnica:** Feature Tour
**Tiempo:** 15-20 minutos
**Criterio de éxito:**
- [ ] Flujo completa end-to-end sin errores
- [ ] UI refleja cambios correctamente
- [ ] Data persiste después de refrescar

---

### 2. Edge Cases & Boundary Testing (20-25 min)

**Qué probar:**
Validar que la aplicación maneja correctamente:
- Inputs límite (max/min length, max/min values)
- Inputs vacíos
- Inputs inválidos (special characters, injection attempts)

**Scenarios a explorar:**

**Formularios (si aplica):**
- [ ] Email sin @
- [ ] Password muy corta
- [ ] Campos vacíos
- [ ] Solo espacios en campos
- [ ] Special characters: `<script>`, `'; DROP TABLE`

**Boundary values:**
- [ ] Max length: [X chars]
- [ ] Min value: 0, -1
- [ ] Max value: [según límite de negocio]

**Técnica:** Boundary Testing, Negative Testing
**Tiempo:** 20-25 minutos
**Criterio de éxito:**
- [ ] Validaciones muestran mensajes claros
- [ ] App no crashea con inputs inválidos
- [ ] Error handling es apropiado

---

### 3. UX & Usabilidad (15-20 min)

**Qué probar:**
Validar que la experiencia de usuario es intuitiva:
- ¿Navegación es clara?
- ¿Mensajes de feedback son útiles?
- ¿Loading states son apropiados?
- ¿Responsive design funciona?

**Scenarios a explorar:**

**Navegación:**
- [ ] Botones son claros y accesibles
- [ ] Links funcionan correctamente
- [ ] Breadcrumbs o navegación secundaria es clara

**Feedback visual:**
- [ ] Loading spinners aparecen cuando aplica
- [ ] Success messages son claros
- [ ] Error messages son descriptivos (no solo "Error occurred")

**Responsive design:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Técnica:** UX Review, User Personas
**Tiempo:** 15-20 minutos
**Criterio de éxito:**
- [ ] UI es intuitiva para usuario nuevo
- [ ] No hay layouts rotos en ningún viewport
- [ ] Mensajes de feedback son útiles

---

### 4. Integración con Backend (15-20 min)

**Qué probar:**
Validar que integración con APIs y DB funciona:
- API calls retornan correctamente
- Data persiste en DB
- Error handling de backend es apropiado

**Scenarios a explorar:**

**API Validation:**
- [ ] GET requests retornan data correcta
- [ ] POST requests crean data en DB
- [ ] PUT requests actualizan data correctamente
- [ ] DELETE requests eliminan data (si aplica)

**Data Persistence:**
- [ ] Crear data via UI → Refrescar → Data persiste
- [ ] Modificar data → Refrescar → Cambios persisten

**Error Handling:**
- [ ] Simular API down (DevTools → Offline mode)
- [ ] App muestra mensaje de error apropiado
- [ ] App no crashea

**Técnica:** Data Flows, API Testing
**Tiempo:** 15-20 minutos
**Criterio de éxito:**
- [ ] Todas las API calls retornan 200/201
- [ ] Data persiste correctamente
- [ ] Error handling es robusto

---

### 5. Performance & Responsiveness (10-15 min) - Opcional

**Qué probar:**
Validar que performance es aceptable:
- Load times < 3 segundos
- No hay lags o freezes
- APIs responden rápidamente

**Scenarios a explorar:**

**Load Times:**
- [ ] Landing page carga en < 2s
- [ ] Navegación entre páginas < 1s
- [ ] Data-heavy pages < 3s

**API Performance:**
- [ ] API calls < 500ms (promedio)
- [ ] Bulk operations < 2s

**Técnica:** Performance Profiling (DevTools → Performance tab)
**Tiempo:** 10-15 minutos
**Criterio de éxito:**
- [ ] Load times son aceptables
- [ ] No hay lags perceptibles

---

## 🔍 Técnicas a Usar Durante la Sesión

- [ ] **Tours:** Recorrer funcionalidad completa
- [ ] **Edge Cases:** Inputs límite, vacíos, inválidos
- [ ] **Negative Testing:** Intentar romper la funcionalidad
- [ ] **Pairing:** Probar con diferentes user personas (Admin vs User)
- [ ] **UX Review:** Validar usabilidad y diseño
- [ ] **Data Flows:** Verificar integración con backend

---

## ✅ Criterios de Éxito General

**Para aprobar la story, debe cumplir:**

### Funcionalidad:
- [ ] AC1: [Descripción del AC1] funciona end-to-end
- [ ] AC2: [Descripción del AC2] funciona correctamente
- [ ] AC3: [Descripción del AC3] funciona sin errores

### Validaciones:
- [ ] Inputs inválidos muestran mensajes claros
- [ ] Edge cases son manejados correctamente
- [ ] Error handling es apropiado y descriptivo

### UX:
- [ ] UI es intuitiva para usuario nuevo
- [ ] Navegación es clara
- [ ] Loading states son apropiados
- [ ] Responsive design funciona (mobile, tablet, desktop)

### Performance:
- [ ] Load times < 3 segundos
- [ ] No hay lags o freezes perceptibles
- [ ] APIs responden en < 500ms (promedio)

### Calidad:
- [ ] **NO** hay bugs críticos (bloquean funcionalidad core)
- [ ] Bugs high son aceptables si hay workaround claro
- [ ] Bugs medium/low no bloquean aprobación

---

## 📝 Datos de Prueba

### Credenciales de Test:

**User normal:**
- Email: `test@example.com`
- Password: `Test123!`

**Admin:**
- Email: `admin@example.com`
- Password: `Admin123!`

**Guest:**
- Testing sin autenticación (si aplica)

---

### Seed Data (si aplica):

[Describir data pre-existente necesaria o cómo crearla]

**Ejemplo:**
(Analizar la story para identificar qué entidades de negocio usar)

- [Entity 1]: "[Nombre]" (tiene [X] relaciones activas)
- [Relation 1]: ID `xxx` (status: [estado])

(Donde [Entity/Relation] depende del dominio. Ejemplos: Mentor/Session en MYM, Product/Order en SHOP, Post/Comment en BLOG)

---

### Test Data para Edge Cases:

**Inputs inválidos a probar:**
- Email sin @: `testexample.com`
- Password muy corta: `123`
- Special characters: `<script>alert('xss')</script>`
- SQL injection: `'; DROP TABLE users; --`
- Empty fields: ` ` (solo espacios)

**Boundary values:**
- Max length: [255 chars string]
- Min value: 0, -1
- Max value: [según límites de negocio]

---

## 🐛 Reportar Bugs

**Si encuentras bugs durante la sesión:**

1. Documentar en session notes (session-notes.md)
2. Crear bug report estructurado (bug-report.md)
3. Severidad:
   - **Critical:** Bloquea funcionalidad core, no hay workaround
   - **High:** Funcionalidad parcial, workaround difícil
   - **Medium:** Issue de UX, hay workaround fácil
   - **Low:** Mejora cosmética

---

## 📊 Métricas a Capturar

**Durante la sesión, capturar:**
- Tiempo real invertido por área
- Número de bugs encontrados (por severidad)
- % de charter completado
- Decisión final: PASSED / PASSED WITH ISSUES / FAILED

---

## 💡 Tips para la Sesión

1. **Time-box estrictamente:** No invertir más del tiempo asignado por área
2. **Documentar mientras exploras:** No esperar al final
3. **Screenshots de bugs:** Capturar evidencia inmediatamente
4. **Revisar console/network:** Siempre tener DevTools abierto
5. **Si encuentras bug crítico:** STOP, reportar inmediatamente

---

## 🔗 Referencias

**Documentos relacionados:**
- Story: `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/story.md`
- Test Cases: `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md`
- Smoke Test: `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/smoke-test.md`

**Próximos pasos:**
- Ejecutar sesión → Documentar en session-notes.md
- Reportar bugs → bug-report.md

---

**🎯 Charter ready para ejecutar!**
```

---

## 🎉 REPORTE FINAL

**Mostrar al usuario:**

```markdown
# ✅ TEST CHARTER GENERADO

## Archivo Creado:

`.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-charter.md`

---

## 📊 Charter Summary:

**Áreas de exploración:** [X] áreas
**Duración estimada:** 60-90 minutos
**Técnicas incluidas:** Tours, Edge Cases, UX Review, Backend Integration

**Distribución de tiempo:**
- Área 1 (Happy Path): 15-20 min
- Área 2 (Edge Cases): 20-25 min
- Área 3 (UX): 15-20 min
- Área 4 (Backend): 15-20 min
- Buffer: 10 min

---

## Próximos Pasos:

### 1️⃣ Ejecutar Sesión Exploratoria

Usa el charter creado para guiar la sesión:

**Duración:** 60-90 minutos
**Staging URL:** https://[project]-develop.vercel.app

**Documentar hallazgos:**
```bash
Use: .prompts/fase-10-exploratory-testing/session-notes.md
```

---

### 2️⃣ Reportar Bugs Encontrados

Si encuentras bugs durante la sesión:

```bash
Use: .prompts/fase-10-exploratory-testing/bug-report.md
```

---

### 3️⃣ Después de la Sesión

**Si PASSED:**
- Continuar a Fase 11 (Test Automation)
- Automatizar test cases críticos

**Si FAILED:**
- Development fix bugs
- Re-deploy a staging
- Re-ejecutar exploratory testing

---

**🎊 Charter ready para ejecutar!**
```

---

## 📋 CHECKLIST INTERNO (NO MOSTRAR)

**Validaciones antes de finalizar:**

### Story Analizada:
- [ ] Acceptance criteria completos leídos
- [ ] Test cases de Fase 5 revisados
- [ ] Áreas de riesgo identificadas

### Charter Completo:
- [ ] Objetivo de sesión claro
- [ ] 3-5 áreas de exploración definidas
- [ ] Time-boxing por área incluido
- [ ] Técnicas específicas asignadas
- [ ] Criterios de éxito definidos
- [ ] Datos de prueba incluidos

### Documentación:
- [ ] Archivo creado en ruta correcta
- [ ] Staging URL incluida
- [ ] Referencias a docs relacionados
- [ ] Próximos pasos claros

---

## 💡 MEJORES PRÁCTICAS

### **1. Time-box Estrictamente**

**60-90 minutos distribuidos:**
```
Happy Path:          20% del tiempo (12-18 min)
Edge Cases:          35% del tiempo (21-32 min)
UX:                  25% del tiempo (15-23 min)
Backend Integration: 15% del tiempo (9-14 min)
Buffer:              5% del tiempo (3-5 min)
```

**Por qué:** Evita over-testing en una área y sub-testing en otras.

---

### **2. Basarse en Test Cases de Fase 5**

**Test cases ya definen:**
- Happy path scenarios
- Edge cases
- Negative scenarios

**Charter debe expandir test cases:**
- Test cases → Qué testear
- Charter → Cómo explorar + técnicas + time-boxing

---

### **3. Incluir Diferentes Técnicas**

**No usar solo una técnica:**
- ❌ Solo happy path testing
- ✅ Tours + Edge cases + UX review + Negative testing

**Beneficio:** Encuentra más bugs, mejor cobertura.

---

### **4. Criterios de Éxito ≠ Perfección**

**Criterios realistas:**
- ✅ NO bugs críticos
- ✅ Bugs high aceptables si hay workaround
- ✅ Bugs medium/low no bloquean

**No esperar:**
- ❌ Zero bugs
- ❌ UX perfecta
- ❌ Performance óptima

**Por qué:** Balance entre calidad y shipping velocity.

---

### **5. Preparar Datos de Prueba ANTES**

**NO improvisar durante sesión:**
- ❌ "No sé qué credenciales usar"
- ❌ "No hay data de prueba"

**Incluir en charter:**
- ✅ Credenciales de test
- ✅ Seed data necesaria
- ✅ Test data para edge cases

**Beneficio:** Sesión es más eficiente.

---

## 📚 REFERENCIAS

**Exploratory testing techniques:**
- https://www.ministryoftesting.com/dojo/lessons/session-based-test-management

**Test charter best practices:**
- https://www.satisfice.com/download/session-based-test-management

**Guidelines:**
- `.context/guidelines/exploratory-testing.md`
- `.context/guidelines/testing-strategy.md`

---

**✅ Test Charter = Guía estructurada (60-90 min) + Time-boxing + Técnicas específicas + Criterios de éxito claros**
