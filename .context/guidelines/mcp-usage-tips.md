# MCP Usage Tips

> **Para**: Fases 3-8 (asincrónicas)
> **Propósito**: Saber CUÁNDO y CÓMO usar cada MCP tool

---

## 🎯 Principio General

**Usar MCPs para datos EN VIVO, NO para documentación estática**.

```
Living Data (usar MCP) vs Static Docs (leer archivo)

✅ MCP: Database schema actual
❌ Docs: Schema hardcodeado (puede estar desactualizado)

✅ MCP: Issues abiertas en Jira
❌ Docs: Lista de issues estática

✅ MCP: Documentación oficial de biblioteca
❌ Docs: Tutorial copiado que puede estar obsoleto
```

---

## 🔧 MCPs Disponibles y Cuándo Usarlos

### **Supabase MCP**

**Cuándo usar**:
- Necesitas schema real de base de datos
- Quieres ver datos de ejemplo
- Verificar relaciones entre tablas
- Conocer constraints, indexes, policies

**Ejemplos**:
```
Fase 5 (Planning):
"¿Qué columnas tiene la tabla users?"
"¿Cuál es la relación entre users y orders?"

Fase 6 (Implementation):
"Dame un ejemplo de row de la tabla products"
"¿Qué policies RLS tiene la tabla profiles?"
```

**NO usar para**:
- ❌ Operaciones que modifican datos (solo lectura)
- ❌ Consultas complejas (usa tu DB client directamente)

---

### **Atlassian MCP** (Jira + Confluence)

**Cuándo usar**:
- Sincronizar stories con Jira
- Crear issues automáticamente
- Leer requirements de Confluence
- Actualizar status de tickets

**Ejemplos**:
```
Fase 3 (Specification):
"Crea un issue en Jira para esta story"
"Lee los requirements del documento de Confluence ABC-123"

Fase 8 (Test Automation):
"Actualiza el status de PROJ-456 a 'In Testing'"
```

**NO usar para**:
- ❌ Tareas que puedes hacer directamente en Jira web
- ❌ Bulk operations (usa Jira API directamente)

---

### **Context7 MCP**

**Cuándo usar**:
- Necesitas documentación OFICIAL de bibliotecas
- Quieres ver ejemplos de uso de una librería
- Verificar API de framework (Next.js, React, etc.)

**Ejemplos**:
```
Fase 5 (Planning):
"¿Cómo implementar server actions en Next.js 14?"
"¿Cuál es la API de React Hook Form?"

Fase 6 (Implementation):
"Dame un ejemplo de uso de Playwright para E2E testing"
"¿Cómo usar Zod para validación de schemas?"
```

**NO usar para**:
- ❌ Preguntas sobre tu código específico
- ❌ Debugging (usa IDE diagnostics)
- ❌ Búsquedas en foros (usa Tavily MCP)

---

### **Tavily MCP** 🔍

**Cuándo usar**:
- Buscar soluciones a problemas técnicos
- Investigar errores específicos (Stack Overflow, GitHub issues)
- Comparar tecnologías/bibliotecas
- Buscar best practices recientes
- Encontrar discusiones en foros (Reddit, dev.to, etc.)
- Investigar bugs conocidos de bibliotecas

**Diferencia con Context7**:
- **Context7**: Docs oficiales de bibliotecas → "¿Cómo usar React Hooks?"
- **Tavily**: Búsqueda web general → "¿Cómo resolver error 'hydration mismatch' en Next.js?"

**Ejemplos**:
```
Fase 4 (Planning):
"Busca best practices para estructurar folders en Next.js 15"
"¿Cómo manejan otros proyectos la autenticación con Supabase?"

Fase 6 (Implementation):
"Busca soluciones al error 'Cannot read property of undefined'"
"¿Qué dicen en Stack Overflow sobre optimizar Playwright tests?"
"Investiga si hay issues conocidos con React 19 y Zustand"

Fase 8 (Test Automation):
"Busca estrategias de retry en tests E2E flaky"
"¿Cómo otros proyectos implementan test data management?"
```

**Casos de uso únicos**:
- Buscar en GitHub issues de bibliotecas
- Investigar discusiones en Reddit/dev.to
- Encontrar posts de blogs técnicos
- Buscar comparaciones de tecnologías
- Investigar problemas específicos de versiones

**NO usar para**:
- ❌ Docs oficiales (usa Context7)
- ❌ Código de tu proyecto (lee archivos locales)
- ❌ Información de tu DB (usa Supabase MCP)

---

### **Playwright MCP**

**Cuándo usar**:
- Generar tests E2E automatizados
- Crear Page Object Models
- Simular interacciones de usuario

**Ejemplos**:
```
Fase 8 (Test Automation):
"Genera un test E2E para el flujo de login"
"Crea un Page Object para la página de checkout"
"Simula el llenado de formulario de registro"
```

**NO usar para**:
- ❌ Unit tests (usa Jest/Vitest directamente)
- ❌ Integration tests simples

---

### **Chrome DevTools MCP** 🔧

**Cuándo usar**:
- Debug de tests E2E fallidos
- Inspeccionar network requests durante testing
- Ver console errors en tests
- Performance profiling de aplicación
- Analizar comportamiento del DOM
- Capturar screenshots/videos de tests

**Ejemplos**:
```
Fase 8 (Test Automation):
"Inspecciona los console errors durante el test de login"
"Captura network requests durante el checkout flow"
"Analiza el performance de la página de dashboard"
"¿Qué recursos se están cargando lentamente?"
"Muestra los eventos del DOM durante el test"
```

**Complementa a Playwright**:
- **Playwright**: Ejecuta tests E2E
- **DevTools**: Debug cuando tests fallan o son lentos

**NO usar para**:
- ❌ Unit testing (usa Jest/Vitest)
- ❌ Production debugging (usa Sentry MCP)
- ❌ API testing (usa Postman MCP)

---

### **Postman MCP**

**Cuándo usar**:
- Testear endpoints de API
- Verificar respuestas de API
- Crear colecciones de requests

**Ejemplos**:
```
Fase 6 (Implementation):
"Testea el endpoint POST /api/users"
"¿Qué responde GET /api/products/123?"

Fase 8 (Test Automation):
"Crea una colección de Postman para la API de auth"
```

**NO usar para**:
- ❌ Testing de UI (usa Playwright)
- ❌ Load testing (usa herramienta específica)

---

### **Sentry MCP** 🐛

**Cuándo usar**:
- Investigar errores en producción
- Ver stack traces de bugs reportados
- Analizar frecuencia de errores
- Crear tests para reproducir errores
- Monitorear performance issues
- Verificar si un bug ya fue reportado

**Ejemplos**:
```
Fase 6 (Implementation):
"¿Qué errores se están reportando en production?"
"Dame el stack trace del error más frecuente"
"¿Cuántas veces ha ocurrido el error SENTRY-ABC123?"

Fase 8 (Test Automation):
"Crea un test para reproducir el error SENTRY-XYZ"
"¿Qué usuarios están afectados por este error?"
"Muestra los últimos 10 errores de tipo 'TypeError'"
```

**Trazabilidad de bugs**:
- Ver errores reportados en tiempo real
- Analizar patrones de errores
- Priorizar fixes basado en frecuencia
- Verificar si un fix resolvió el problema

**NO usar para**:
- ❌ Local debugging (usa DevTools)
- ❌ Test errors (usa Playwright trace viewer)
- ❌ Build errors (usa logs de CI/CD)

---

### **GitHub MCP**

**Cuándo usar**:
- Crear issues automáticamente
- Buscar PRs relacionadas
- Leer código de otros repos
- Verificar historial de commits

**Ejemplos**:
```
Fase 3 (Specification):
"Crea un issue para implementar dark mode"

Fase 7 (Code Review):
"¿Hay PRs abiertos relacionados con auth?"
"Busca issues similares a este bug"
```

---

### **Slack MCP**

**Cuándo usar**:
- Notificar al equipo de cambios importantes
- Enviar reportes de test results
- Comunicar deploys

**Ejemplos**:
```
Fase 8 (Test Automation):
"Envía reporte de test results al canal #qa"

Fase 6 (Implementation):
"Notifica en #engineering que el feature está listo"
```

---

### **Memory MCP**

**Cuándo usar**:
- Recordar contexto entre sesiones
- Guardar decisiones técnicas
- Mantener estado de proyecto

**Ejemplos**:
```
Cualquier fase:
"Recuerda que usamos Zod para validación"
"¿Qué decisiones tomamos sobre el schema de auth?"
```

---

## 📋 Decision Tree: ¿Qué MCP usar?

```
¿Necesitas información de...?

├─ Base de datos → Supabase MCP
│   └─ Schema, datos, policies
│
├─ Documentación oficial → Context7 MCP
│   └─ Next.js, React, Playwright docs
│
├─ Búsqueda web / foros → Tavily MCP ⭐ NUEVO
│   └─ Stack Overflow, GitHub issues, Reddit, blogs
│
├─ Project management → Atlassian MCP
│   └─ Issues, stories, requirements
│
├─ E2E testing → Playwright MCP
│   └─ User flows, interactions
│
├─ E2E debugging → DevTools MCP ⭐ NUEVO
│   └─ Console, network, performance
│
├─ API testing → Postman MCP
│   └─ Endpoints, responses
│
├─ Error monitoring → Sentry MCP ⭐ NUEVO
│   └─ Production errors, stack traces
│
├─ Repository → GitHub MCP
│   └─ Issues, PRs, code
│
├─ Team communication → Slack MCP
│   └─ Notifications, reports
│
└─ Session memory → Memory MCP
    └─ Contexto entre sesiones
```

---

## ⚡ Optimización de Tokens

### Usar MCPs estratégicamente

**Perfil "backend"** (carga 3 MCPs):
```bash
node scripts/mcp-builder.js backend
# Carga: supabase + context7 + tavily

Usa supabase para schema
Usa context7 para docs oficiales de libs
Usa tavily para investigar problemas técnicos
```

**Perfil "frontend"** (carga 3 MCPs):
```bash
node scripts/mcp-builder.js frontend
# Carga: context7 + tavily + playwright

Usa context7 para docs de React/Next.js
Usa tavily para buscar soluciones a bugs UI
Usa playwright para tests E2E (si se necesitan)
```

**Perfil "testing"** (carga 4 MCPs):
```bash
node scripts/mcp-builder.js uitest
# Carga: playwright + devtools + context7 + tavily

Usa playwright para E2E tests
Usa devtools para debugging
Usa context7 para docs de testing
Usa tavily para best practices de testing
```

**Perfil "debugging"** (carga 4 MCPs):
```bash
node scripts/mcp-builder.js debug
# Carga: devtools + sentry + tavily + supabase

Usa devtools para debugging E2E
Usa sentry para errores production
Usa tavily para buscar soluciones
Usa supabase para ver datos DB
```

**Ver más**: `docs/mcp-builder-strategy.md`

---

## ⚠️ Errores Comunes

### ❌ NO hacer:
1. **Cargar todos los MCPs siempre**
   ```bash
   # ❌ MAL
   node scripts/mcp-builder.js full

   # ✅ BIEN
   node scripts/mcp-builder.js backend
   ```

2. **Usar MCP para lo que puedes hacer localmente**
   ```
   ❌ "Usa Context7 para leer mi código local"
   ✅ Lee el archivo directamente
   ```

3. **No cambiar MCPs entre tareas**
   ```
   ❌ Usar perfil "backend" para testing
   ✅ Cambiar a perfil "uitest" cuando hagas tests
   ```

---

## 🔄 Context7 vs Tavily: ¿Cuál usar?

| Escenario | Context7 | Tavily |
|-----------|----------|--------|
| "¿Cómo usar useState en React?" | ✅ Docs oficiales | ❌ Overkill |
| "Error: hydration mismatch en Next.js" | ❌ No indexa foros | ✅ Stack Overflow |
| "¿Playwright tiene retry automático?" | ✅ Docs oficiales | ❌ Innecesario |
| "Best practices para folder structure" | ❌ No opina | ✅ Blogs + foros |
| "¿Hay bugs conocidos de Zustand + React 19?" | ❌ No indexa issues | ✅ GitHub issues |
| "Comparar Zod vs Yup" | ❌ Solo docs individuales | ✅ Comparaciones |
| "¿Cómo configurar Playwright?" | ✅ Docs oficiales | ❌ Innecesario |
| "¿Por qué Supabase Auth no funciona con SSR?" | ❌ Problema específico | ✅ Reddit/GitHub |

**Regla de oro**: Context7 para **"cómo usar"**, Tavily para **"cómo resolver"**.

---

## 💡 Tips Finales

1. **Cambia perfil según task**:
   ```bash
   # Implementing backend
   node scripts/mcp-builder.js backend

   # Implementing frontend
   node scripts/mcp-builder.js frontend

   # Testing UI
   node scripts/mcp-builder.js uitest

   # Debugging issues
   node scripts/mcp-builder.js debug

   # API testing
   node scripts/mcp-builder.js apitest
   ```

2. **Usa MCPs para datos dinámicos**:
   - Schema de DB (Supabase)
   - Issues abiertas (Atlassian, GitHub)
   - Docs oficiales (Context7)
   - Búsquedas web (Tavily)
   - Errores production (Sentry)

3. **Workflow recomendado Context7 + Tavily**:
   - Primero busca en Context7 (docs oficiales)
   - Si no encuentras, usa Tavily (foros, GitHub issues)
   - Context7 para "cómo usar", Tavily para "cómo resolver"

4. **Lee archivos locales para datos estáticos**:
   - Guidelines
   - Implementation plans
   - Test cases

---

## 📊 Resumen de MCPs Actualizados

**Total MCPs disponibles**: 11

| MCP | Tipo | Cuándo usar |
|-----|------|-------------|
| Supabase | Database | Schema, datos, policies |
| Atlassian | Project Mgmt | Jira, Confluence |
| Context7 | Docs Oficiales | React, Next.js, Playwright |
| **Tavily** ⭐ | Web Search | Stack Overflow, foros, blogs |
| Playwright | E2E Testing | User flows, interactions |
| **DevTools** ⭐ | E2E Debug | Console, network, performance |
| Postman | API Testing | Endpoints, responses |
| **Sentry** ⭐ | Monitoring | Production errors, traces |
| GitHub | Repository | Issues, PRs, code |
| Slack | Communication | Notificaciones, reportes |
| Memory | Persistence | Contexto entre sesiones |

---

**Última actualización**: 2025-01-29
**Ver también**: `docs/mcp-builder-strategy.md`
