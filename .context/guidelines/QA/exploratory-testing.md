# Exploratory Testing Guidelines

> **Para**: QA Engineers
> **Fase**: 10 (Exploratory Testing)
> **Propósito**: Estándares para realizar testing exploratorio efectivo

---

## Principio Central

El Testing Exploratorio valida funcionalidades **ANTES** de invertir en automatización. Es un proceso de exploración activa donde el QA:

1. **Explora** la funcionalidad con ojos críticos
2. **Documenta** hallazgos en tiempo real
3. **Decide** si la funcionalidad está lista para producción

---

## Cuándo Realizar Testing Exploratorio

| Trigger                      | Scope                  | Objetivo            |
| ---------------------------- | ---------------------- | ------------------- |
| User Story en "Ready for QA" | Story individual       | Validar ACs         |
| Feature desplegada a staging | Épica/Feature completa | Validación integral |
| Hotfix desplegado            | Área afectada          | Regresión rápida    |
| Release candidate            | Aplicación completa    | Smoke + Sanity      |

---

## Prerrequisitos

Antes de iniciar una sesión de testing exploratorio:

- [ ] Feature desplegada en staging
- [ ] Acceso a URL de staging
- [ ] Acceptance Criteria o Test Cases disponibles
- [ ] MCP de Playwright conectado (recomendado)
- [ ] MCP de Atlassian conectado (para crear bugs)

---

## Herramientas MCP

### Playwright MCP (Recomendado)

Usar Playwright MCP para explorar la aplicación de manera sistemática:

| Herramienta                                | Uso                              |
| ------------------------------------------ | -------------------------------- |
| `mcp__playwright__browser_navigate`        | Navegar a páginas                |
| `mcp__playwright__browser_snapshot`        | Capturar estructura de la página |
| `mcp__playwright__browser_click`           | Interactuar con elementos        |
| `mcp__playwright__browser_type`            | Llenar campos de formulario      |
| `mcp__playwright__browser_take_screenshot` | Capturar evidencia visual        |

**Flujo típico con Playwright MCP:**

```
1. browser_navigate → Ir a la página
2. browser_snapshot → Entender la estructura
3. browser_click / browser_type → Ejecutar acciones
4. browser_take_screenshot → Capturar evidencia
5. Repetir para cada escenario
```

Ver `.context/guidelines/MCP/playwright.md` para más detalles.

---

## Flujo de Testing Exploratorio

```
┌─────────────────────────────────────────┐
│     FASE 10: EXPLORATORY TESTING        │
├─────────────────────────────────────────┤
│ 1. Smoke Test (validación rápida)       │
│    └── ¿Funciona lo básico?             │
│                                         │
│ 2. Exploración Guiada                   │
│    └── Seguir ACs o Test Cases          │
│    └── Documentar hallazgos             │
│                                         │
│ 3. Exploración de Edge Cases            │
│    └── Inputs vacíos, límites           │
│    └── Flujos alternativos              │
│                                         │
│ 4. Reporte de Bugs (si hay)             │
│    └── Confirmar reproducibilidad       │
│    └── Crear en Jira                    │
│                                         │
│ 5. Decisión Final                       │
│    └── PASSED → QA Approved             │
│    └── FAILED → Esperar fixes           │
└─────────────────────────────────────────┘
```

---

## Técnicas de Exploración

### 1. Happy Path Testing

Validar los flujos principales según los Acceptance Criteria:

```markdown
Escenario: Login exitoso

1. Navegar a /login
2. Ingresar email válido
3. Ingresar password válido
4. Click en Submit
   ✓ Resultado: Redirect a dashboard
```

### 2. Boundary Testing

Probar límites y condiciones extremas:

| Input           | Valores a Probar                                    |
| --------------- | --------------------------------------------------- |
| Campos de texto | Vacío, 1 char, máximo, > máximo                     |
| Números         | 0, -1, MAX_INT, decimales                           |
| Fechas          | Pasado, hoy, futuro, inválidas                      |
| Emails          | Formato válido, inválido, con caracteres especiales |

### 3. Negative Testing

Probar cómo la aplicación maneja errores:

```markdown
Escenarios negativos:

- Login con credenciales inválidas
- Submit de formulario sin campos requeridos
- Acceso a páginas protegidas sin auth
- Operaciones con datos inexistentes
```

### 4. State Testing

Probar comportamiento en diferentes estados:

- Refresh de página a mitad de flujo
- Botón "Atrás" del navegador
- Múltiples tabs con la misma sesión
- Timeout de sesión

### 5. Security Quick Checks

Validaciones básicas de seguridad:

- Inyección SQL: `'; DROP TABLE users; --`
- XSS: `<script>alert('xss')</script>`
- Acceso directo a URLs protegidas
- Exposición de datos sensibles en console

---

## Documentación de Sesión

Durante la exploración, documentar en tiempo real:

```markdown
## Session Notes - [Feature/Story]

**Fecha:** YYYY-MM-DD
**Duración:** X minutos
**URL:** [staging URL]

### Escenarios Probados

#### 1. [Nombre del escenario] - ✅ PASSED

- Acción: [lo que hice]
- Resultado: [lo que pasó]
- Notas: [observaciones]

#### 2. [Nombre del escenario] - ❌ FAILED

- Acción: [lo que hice]
- Esperado: [lo que debía pasar]
- Actual: [lo que pasó]
- Evidencia: [screenshot]

### Issues Encontrados

1. **[Título del bug]**
   - Severidad: Critical/High/Medium/Low
   - Pasos: [reproducción]
   - Evidencia: [screenshot]

### Observaciones Generales

- [Lo que funcionó bien]
- [Áreas de preocupación]
- [Sugerencias de mejora]
```

---

## Criterios de Decisión

### PASSED (QA Approved)

- ✅ Todos los Acceptance Criteria validados
- ✅ No hay bugs críticos o altos
- ✅ UX es aceptable
- ✅ Performance es aceptable

### PASSED con Issues

- ✅ Funcionalidad core funciona
- ⚠️ Bugs menores encontrados
- → Crear bugs en Jira
- → Continuar a documentación

### FAILED

- ❌ Bugs críticos encontrados
- ❌ ACs no cumplidos
- → Reportar y esperar fixes
- → NO continuar a documentación

---

## Mejores Prácticas

### DO (Hacer)

- ✅ **Explorar, no solo ejecutar** - Buscar comportamientos inesperados
- ✅ **Documentar en tiempo real** - No esperar al final
- ✅ **Tomar screenshots** - Evidencia visual es invaluable
- ✅ **Revisar console/network** - Errores ocultos aparecen ahí
- ✅ **Pensar como usuario** - ¿Qué confundiría a un usuario real?
- ✅ **Time-box la exploración** - No pasar tiempo infinito en un área

### DON'T (No Hacer)

- ❌ **No automatizar antes de explorar** - Validar primero
- ❌ **No ignorar edge cases** - Son donde viven los bugs
- ❌ **No asumir que "funciona"** - Verificar todo
- ❌ **No crear bugs sin reproducir** - Confirmar antes de reportar

---

## Integración con el Flujo QA

El Testing Exploratorio es el **primer paso** del flujo QA:

```
Fase 10: Exploratory Testing
    ↓
    (PASSED)
    ↓
Fase 11: Test Documentation
    ↓
Fase 12: Test Automation
```

**Ver también:**

- `.prompts/us-qa-workflow.md` - Workflow completo de QA
- `.prompts/fase-10-exploratory-testing/` - Prompts detallados
- `.context/guidelines/MCP/playwright.md` - Uso de Playwright MCP

---

## Output de la Fase

Al finalizar el testing exploratorio:

1. **Session Notes** con todos los hallazgos
2. **Bugs reportados** en Jira (si hay)
3. **Decisión clara**: PASSED / FAILED
4. **Transición de estado** en Jira (si PASSED)
5. **Lista de candidatos** para documentación y automatización

---

**Última actualización**: 2025-12-21
