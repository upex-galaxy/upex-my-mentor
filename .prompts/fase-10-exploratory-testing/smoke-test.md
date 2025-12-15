Actúa como Senior QA Engineer especializado en smoke testing y validación post-deployment.

---

## 🎯 TAREA

**FASE 10: SMOKE TEST EN STAGING**

Validar que el deployment en staging es funcional ANTES de comenzar exploratory testing completo.

**Este prompt se ejecuta INMEDIATAMENTE** después de deployment a staging (Fase 9) y ANTES de test-charter.md.

---

## 📥 INPUT REQUERIDO

### 1. Deployment en Staging

**Verificar:**
- Código desplegado en staging (Fase 9 completada)
- Staging URL accesible
- CI/CD workflow pasó exitosamente

**Información necesaria del usuario:**
- Staging URL: `https://[project]-develop.vercel.app`
- Feature/Story recién desplegada: `STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}`

### 2. Story Actual

**Leer:**
- `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/story.md` - **CRÍTICO** - Acceptance criteria
- `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md` - Test cases definidos (Fase 5)

**Qué identificar:**
1. ¿Cuál es el happy path de la story?
2. ¿Qué funcionalidad crítica debe validarse?
3. ¿Hay integración con backend/auth que validar?

### 3. Deployment Context

**Leer:**
- `.context/ci-cd-setup.md` - Workflow de deployment
- `.context/environment-variables.md` - Variables de staging
- `.context/infrastructure-setup.md` - URLs y configuración

---

## ⚙️ VERIFICACIÓN DE HERRAMIENTAS (MCP)

**NO se requieren MCP para esta fase.**

### Herramientas Manuales:
- Browser (Chrome/Firefox/Safari)
- DevTools (F12) para revisar console/network
- Acceso a staging URL

---

## 🎯 OBJETIVO

Crear smoke test checklist para validar deployment funcional:

**Incluye:**
- ✅ Validar que aplicación carga sin errores 500
- ✅ Verificar assets cargan (CSS, JS, imágenes)
- ✅ Validar autenticación funciona (si aplica)
- ✅ Validar happy path de la story funciona end-to-end
- ✅ Verificar integración con backend (APIs, DB)
- ✅ Validar navegación básica funciona

**NO incluye:**
- ❌ Exploratory testing completo (eso es test-charter.md + session-notes.md)
- ❌ Edge cases o negative testing (eso es exploratory testing)
- ❌ Tests automatizados (eso es Fase 11: Test Automation)

**Resultado:** Checklist que QA ejecuta en **5-10 minutos** para confirmar deployment funcional.

---

## 📤 OUTPUT GENERADO

### Smoke Test Checklist:
- ✅ `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/smoke-test.md` - Checklist ejecutable

**Estructura del checklist:**
```markdown
# Smoke Test: [STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre} - Nombre]

**Staging URL:** https://[project]-develop.vercel.app
**Fecha:** [Fecha]
**QA:** [Nombre]
**Duración:** 5-10 minutos

---

## ✅ Checklist

### 1. Acceso Básico
- [ ] Aplicación carga sin errores 500
- [ ] No hay errores en console (F12)
- [ ] Assets cargan (CSS, JS, imágenes)

### 2. Autenticación (si aplica)
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Sesión persiste al refrescar

### 3. Happy Path de Story
- [ ] [Paso 1 del happy path]
- [ ] [Paso 2 del happy path]
- [ ] [Paso 3 del happy path]

### 4. Integración Backend
- [ ] APIs responden correctamente
- [ ] Datos se guardan en DB
- [ ] Datos se recuperan correctamente

---

## ✅ Resultado

- [ ] **PASSED:** Deployment funcional, continuar con exploratory testing
- [ ] **FAILED:** Deployment roto, NO continuar, reportar bug crítico
```

---

## 🚨 RESTRICCIONES CRÍTICAS

### ❌ NO HACER:

- **NO hacer exploratory testing completo** - Solo smoke test rápido
- **NO testear edge cases todavía** - Eso es para exploratory testing
- **NO crear bugs de UX menores** - Solo bugs críticos que bloquean funcionalidad
- **NO invertir más de 10 minutos** - Smoke test debe ser rápido
- **NO asumir que deployment funciona** - Validar manualmente

### ✅ SÍ HACER:

- **Validar lo mínimo necesario** - Aplicación carga + happy path funciona
- **Revisar console y network** - Identificar errores técnicos
- **Reportar inmediatamente si falla** - No continuar si smoke test falla
- **Documentar resultado** - PASSED o FAILED con evidencia

---

## 🔄 WORKFLOW

---

## 📋 PASO 1: LEER ACCEPTANCE CRITERIA DE LA STORY

**Objetivo:** Entender qué debe funcionar en staging.

### Paso 1.1: Leer Story

**Acción:** Leer `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/story.md`

**Identificar:**
1. **Acceptance Criteria (AC):**
   - ¿Qué debe funcionar?
   - ¿Cuál es el happy path?

2. **Funcionalidad crítica:**
   - ¿Requiere autenticación?
   - ¿Hay integración con backend?
   - ¿Hay formularios o inputs?

---

### Paso 1.2: Leer Test Cases

**Acción:** Leer `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md`

**Identificar:**
- Test case #1 (happy path) → Smoke test debe cubrir esto
- Funcionalidad mínima que debe funcionar

---

## 🌐 PASO 2: ABRIR STAGING URL Y VALIDAR ACCESO BÁSICO

**Objetivo:** Verificar que aplicación carga sin errores críticos.

### Paso 2.1: Abrir Staging URL

**Acción:**
1. Abrir browser (Chrome recomendado)
2. Abrir DevTools (F12)
3. Navegar a: `https://[project]-develop.vercel.app`

---

### Paso 2.2: Validar Acceso Básico

**Checklist:**

**1. Aplicación carga sin errores 500:**
- [ ] Landing page carga completamente
- [ ] No hay pantalla de error 500 o 404
- [ ] Loading states terminan correctamente

**2. No hay errores en console:**
- Abrir Console tab (F12)
- [ ] No hay errores rojos en console
- [ ] Advertencias amarillas son aceptables (no críticas)

**3. Assets cargan correctamente:**
- [ ] CSS carga (página se ve con estilos)
- [ ] JavaScript carga (interacciones funcionan)
- [ ] Imágenes cargan (no hay placeholders rotos)

**Si algo falla aquí:**
```markdown
## ❌ SMOKE TEST FAILED - Acceso Básico

**Blocker:** [Descripción del error]

**Evidence:**
- Screenshot: [Adjuntar]
- Console errors:
  ```
  [Copiar errores de console]
  ```

**Acción:** Reportar a Development inmediatamente, NO continuar.
```

---

## 🔐 PASO 3: VALIDAR AUTENTICACIÓN (Si aplica)

**Objetivo:** Verificar que auth flow funciona.

### Paso 3.1: Login

**Acción:**
1. Navegar a `/login` (o la ruta de login)
2. Usar credenciales de test:
   - Email: `test@example.com` (o según `.env.example`)
   - Password: `Test123!`

**Validar:**
- [ ] Login form aparece correctamente
- [ ] Submit login funciona
- [ ] Redirect a dashboard/home después de login exitoso
- [ ] No hay errores en console durante login

---

### Paso 3.2: Sesión Persistencia

**Acción:**
1. Después de login exitoso, refrescar página (F5)

**Validar:**
- [ ] Sesión persiste (no te saca de la app)
- [ ] User info aparece correctamente (avatar, nombre, etc.)

---

### Paso 3.3: Logout

**Acción:**
1. Click en logout button

**Validar:**
- [ ] Logout funciona
- [ ] Redirect a landing/login page
- [ ] Sesión se limpia (no puedes acceder a rutas protegidas)

**Si auth falla:**
```markdown
## ❌ SMOKE TEST FAILED - Autenticación

**Blocker:** [Login/Logout no funciona]

**Steps to reproduce:**
1. [Paso que falla]

**Acción:** Reportar inmediatamente, auth es crítico.
```

---

## ✅ PASO 4: VALIDAR HAPPY PATH DE LA STORY

**Objetivo:** Verificar que funcionalidad principal de la story funciona.

### Paso 4.1: Ejecutar Happy Path

**Acción:** Ejecutar el flujo principal definido en acceptance criteria.

**Ejemplo adaptado a TU story:**

```markdown
### Happy Path: [Nombre del flujo según AC]

1. [ ] [Primer paso según acceptance criteria]
2. [ ] [Segundo paso]
3. [ ] [Lista de entidades aparece]
4. [ ] [Cada card muestra: campos relevantes]
5. [ ] [Click en entidad abre detalle]
6. [ ] [Detalle muestra información completa]

(Donde [entidades/campos] se determinan del AC de tu story.
Ejemplos: mentors/skills en MYM, products/price en SHOP, posts/author en BLOG)
```

**Para TU story específica, adapta el happy path:**

1. **Paso 1:** [Primer paso del AC]
   - [ ] [Qué debe pasar]
   - [ ] [Qué validar visualmente]

2. **Paso 2:** [Segundo paso del AC]
   - [ ] [Qué debe pasar]
   - [ ] [Qué validar]

3. **Paso 3:** [Tercer paso del AC]
   - [ ] [Resultado final esperado]

---

### Paso 4.2: Validar Visualmente

**Checklist visual:**
- [ ] UI se ve como en diseños (colores, spacing, fonts)
- [ ] Componentes se renderizan correctamente
- [ ] Responsive design funciona (resize browser)
- [ ] Loading states son claros
- [ ] No hay layouts rotos o overlapping elements

**Si happy path falla:**
```markdown
## ❌ SMOKE TEST FAILED - Happy Path

**Blocker:** [Descripción de qué no funciona]

**Expected:** [Qué debería pasar según AC]

**Actual:** [Qué pasa actualmente]

**Evidence:** [Screenshot o descripción]

**Acción:** Reportar inmediatamente.
```

---

## 🔗 PASO 5: VALIDAR INTEGRACIÓN CON BACKEND

**Objetivo:** Verificar que APIs y DB funcionan.

### Paso 5.1: Revisar Network Tab

**Acción:**
1. Abrir Network tab en DevTools (F12)
2. Ejecutar happy path nuevamente
3. Observar requests

**Validar:**
- [ ] API calls a backend retornan 200 OK (no 500, no 404)
- [ ] Datos se envían correctamente (payload en request)
- [ ] Datos se reciben correctamente (response tiene data esperada)
- [ ] No hay requests que fallen continuamente

**Ejemplo de validación:**
```
GET /api/[entities] → 200 OK
Response: { "data": [...entities] }  ✅

POST /api/[resources] → 201 Created
Response: { "id": "xxx", "status": "created" }  ✅

(Donde [entities/resources] dependen del dominio de tu proyecto.
Ejemplos: mentors/sessions en MYM, products/orders en SHOP, posts/comments en BLOG)
```

---

### Paso 5.2: Validar Persistencia de Datos

**Acción (si story modifica datos):**
1. Crear/modificar data via UI (ej: crear entidad, editar perfil, etc.)
2. Refrescar página (F5)
3. Validar que cambios persisten

**Validar:**
- [ ] Datos se guardan en DB (persisten después de refresh)
- [ ] No hay data loss
- [ ] Data muestra valores correctos

---

## 📝 PASO 6: GENERAR SMOKE TEST CHECKLIST

**Objetivo:** Documentar smoke test para referencia del QA.

### Paso 6.1: Crear Archivo

**Acción:** Crear `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/smoke-test.md`

**Contenido:**

```markdown
# Smoke Test: [STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre} - Nombre]

**Staging URL:** https://[project]-develop.vercel.app
**Fecha:** [Fecha actual]
**QA:** [Nombre del QA]
**Duración:** 5-10 minutos

---

## ✅ Smoke Test Checklist

### 1. Acceso Básico

- [ ] **Aplicación carga sin errores 500**
  - URL: https://[project]-develop.vercel.app
  - Landing page debe cargar completamente

- [ ] **No hay errores en console (F12)**
  - Console tab no debe mostrar errores rojos
  - Advertencias amarillas son aceptables

- [ ] **Assets cargan correctamente**
  - [ ] CSS carga (página tiene estilos)
  - [ ] JavaScript carga (interacciones funcionan)
  - [ ] Imágenes cargan (no hay placeholders rotos)

---

### 2. Autenticación (si aplica)

- [ ] **Login funciona**
  - Email: `test@example.com`
  - Password: `Test123!`
  - Debe redirigir a dashboard después de login

- [ ] **Sesión persiste al refrescar**
  - Refrescar página (F5) → Sesión debe mantenerse

- [ ] **Logout funciona**
  - Click en logout → Debe redirigir a landing/login

---

### 3. Happy Path: [Nombre del Happy Path]

**Descripción:** [Breve descripción del flujo principal]

**Steps:**

1. [ ] **[Paso 1]**
   - Acción: [Qué hacer]
   - Validar: [Qué debe pasar]

2. [ ] **[Paso 2]**
   - Acción: [Qué hacer]
   - Validar: [Qué debe pasar]

3. [ ] **[Paso 3]**
   - Acción: [Qué hacer]
   - Validar: [Resultado final esperado]

**Validación visual:**
- [ ] UI se ve como en diseños
- [ ] No hay layouts rotos
- [ ] Loading states son claros

---

### 4. Integración con Backend

**Network Tab Validation:**

- [ ] **API calls retornan 200 OK**
  - Abrir DevTools → Network tab
  - Ejecutar happy path
  - Validar que requests a `/api/*` retornan 200

- [ ] **Datos se guardan en DB (si aplica)**
  - Crear/modificar data via UI
  - Refrescar página (F5)
  - Validar que cambios persisten

- [ ] **Datos se recuperan correctamente**
  - Data mostrada en UI coincide con lo esperado

---

## 📊 Resultado del Smoke Test

**Ejecutado por:** [Nombre]
**Fecha:** [Fecha]
**Duración:** [Tiempo real]

### Resultado Final:

- [ ] **✅ PASSED:** Deployment funcional, continuar con exploratory testing
- [ ] **❌ FAILED:** Deployment roto, reportar bug crítico inmediatamente

---

### Notas (si aplica):

[Cualquier observación adicional]

---

### Si FAILED:

**Blocker:** [Descripción del error que bloquea]

**Evidence:**
- Screenshot: [Adjuntar]
- Console errors: [Copiar]

**Próximo paso:**
- Reportar a Development inmediatamente
- NO continuar con exploratory testing hasta que se fixee
```

---

## 🎉 REPORTE FINAL

**Mostrar al usuario:**

```markdown
# ✅ SMOKE TEST CHECKLIST GENERADO

## Archivo Creado:

`.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/smoke-test.md`

---

## Próximos Pasos:

### ✅ Si Smoke Test PASSED:

Continuar con exploratory testing:

```bash
# 1. Crear test charter
Use: .prompts/fase-10-exploratory-testing/test-charter.md

# 2. Ejecutar sesión exploratoria
Use: .prompts/fase-10-exploratory-testing/session-notes.md

# 3. Si encuentras bugs
Use: .prompts/fase-10-exploratory-testing/bug-report.md
```

---

### ❌ Si Smoke Test FAILED:

**NO continuar con exploratory testing.**

**Acción inmediata:**
1. Reportar bug crítico a Development
2. Incluir evidencia (screenshots, console errors)
3. Deployment debe corregirse antes de continuar

**Flujo de fix:**
```
Bug reportado → Development fix → Re-deploy a staging → Re-ejecutar smoke test
```

---

## 📊 Checklist Generado:

**Secciones incluidas:**
- ✅ Acceso básico (app carga, console sin errores, assets OK)
- ✅ Autenticación (login, logout, sesión persiste)
- ✅ Happy path de la story (steps específicos)
- ✅ Integración backend (API calls, persistencia de datos)

**Duración estimada:** 5-10 minutos

**Ready para ejecutar!**
```

---

## 📋 CHECKLIST INTERNO (NO MOSTRAR)

**Validaciones antes de finalizar:**

### Story Analizada:
- [ ] Acceptance criteria leídos
- [ ] Happy path identificado
- [ ] Funcionalidad crítica clara

### Checklist Generado:
- [ ] Sección "Acceso Básico" incluida
- [ ] Sección "Autenticación" incluida (si aplica)
- [ ] Sección "Happy Path" con steps específicos
- [ ] Sección "Integración Backend" incluida
- [ ] Resultado PASSED/FAILED incluido

### Documentación:
- [ ] Archivo creado en ruta correcta
- [ ] Staging URL incluida
- [ ] Duración estimada (5-10 min) mencionada
- [ ] Próximos pasos claros

---

## 💡 MEJORES PRÁCTICAS

### **1. Smoke Test ≠ Exploratory Testing**

**Smoke test (5-10 min):**
- Solo happy path
- Validar que deployment funciona
- Go/No-Go decision

**Exploratory testing (60-90 min):**
- Edge cases
- Negative testing
- UX review
- Full coverage

**No confundir:** Smoke test es rápido, exploratory testing es profundo.

---

### **2. FAILED Smoke Test = STOP**

**Si smoke test falla:**
- ❌ NO continuar con exploratory testing
- ❌ NO invertir tiempo en testing algo roto
- ✅ Reportar inmediatamente
- ✅ Development fix → Re-deploy → Re-test

**Beneficio:** No desperdiciar tiempo de QA en deployment roto.

---

### **3. Validar Backend Integration SIEMPRE**

**Incluso si UI se ve bien:**
- Revisar Network tab (F12)
- Validar que APIs retornan 200
- Validar que datos persisten

**Por qué:** UI puede renderizar data mock/hardcoded pero backend estar roto.

---

### **4. Documentar Evidencia Si Falla**

**Si smoke test falla, incluir:**
- Screenshot del error
- Console errors (copiar texto completo)
- Network tab errors (copiar request/response)
- Steps exactos que causaron el error

**Beneficio:** Development puede reproducir y fixear más rápido.

---

### **5. Ejecutar en Diferentes Browsers (Si tiempo permite)**

**Si tienes 2-3 minutos extra:**
- Ejecutar smoke test en Chrome
- Ejecutar en Firefox o Safari

**Por qué:** Catch browser-specific issues temprano.

---

## 📚 REFERENCIAS

**Smoke testing best practices:**
- https://www.guru99.com/smoke-testing.html

**Exploratory testing:**
- `.prompts/fase-10-exploratory-testing/test-charter.md` - Charter de exploración

**Testing strategy:**
- `.prompts/fase-11-test-automation/test-strategy.md` - Estrategia completa

---

**✅ Smoke Test = Validación rápida (5-10 min) + Go/No-Go decision + Fundación para exploratory testing**
