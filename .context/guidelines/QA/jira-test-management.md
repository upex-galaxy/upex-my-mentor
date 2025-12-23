# Jira Test Management Guidelines

> **Para**: QA Engineers
> **Fase**: 11 (Test Documentation)
> **Propósito**: Estándares para gestión de pruebas en Jira

---

## Principio Central

El Test Management en Jira comienza **DESPUÉS** de que una funcionalidad está **estable y funcional**. El objetivo es:

1. **Documentar** las pruebas validadas durante exploratory testing
2. **Trazar** las pruebas hacia las historias de usuario
3. **Preparar** las pruebas para automatización

---

## Cuándo Crear Tests en Jira

| Momento                     | Acción                            |
| --------------------------- | --------------------------------- |
| Feature explorada y estable | ✅ Crear Test issues              |
| Feature con bugs críticos   | ❌ Esperar fixes primero          |
| Antes de explorar           | ❌ No documentar antes de validar |

**Regla**: Solo documentar pruebas para funcionalidades que ya pasaron QA Approved.

---

## Tipo de Incidencia: Test

### Configuración en Jira

Crear un Issue Type personalizado llamado **Test** con los siguientes campos:

| Campo                | Tipo         | Propósito                                                   |
| -------------------- | ------------ | ----------------------------------------------------------- |
| Summary              | Texto        | Nombre claro del test case                                  |
| Description          | Texto largo  | Pasos del test (Gherkin o tradicional)                      |
| Test Status          | Select list  | `New`, `Designed`, `Review`, `Ready`, `Automated`, `Manual` |
| Automation Candidate | Checkbox     | ¿Es candidato para automatizar?                             |
| Priority             | Select list  | `Critical`, `High`, `Medium`, `Low`                         |
| Labels               | Multi-select | `regression`, `smoke`, `e2e`, `integration`                 |

---

## Workflow de Test en Jira

```
┌─────────┐    ┌──────────┐    ┌────────┐    ┌───────┐    ┌───────────┐
│   New   │ → │ Designed │ → │ Review │ → │ Ready │ → │ Automated │
└─────────┘    └──────────┘    └────────┘    └───────┘    └───────────┘
                                   │                           ↑
                                   │         ┌────────┐        │
                                   └────────→│ Manual │────────┘
                                             └────────┘    (si no se automatiza)
```

### Estados

| Estado        | Descripción               | Siguiente paso              |
| ------------- | ------------------------- | --------------------------- |
| **New**       | Test recién creado        | Escribir pasos              |
| **Designed**  | Pasos documentados        | Peer review                 |
| **Review**    | En revisión por otro QA   | Aprobar o rechazar          |
| **Ready**     | Aprobado, listo para usar | Decidir: ¿Automatizar?      |
| **Automated** | Test automatizado en KATA | Ejecuta en CI               |
| **Manual**    | Test se queda manual      | Incluir en regresión manual |

---

## Trazabilidad

### Estructura de Links

Cada Test debe estar conectado a:

```
User Story (STORY-XXX)
    ↓ is tested by
Test (TEST-XXX)
    ↓ is blocked by (opcional)
Bug (BUG-XXX)
```

### Links Requeridos

| Desde | Hacia      | Tipo de Link                |
| ----- | ---------- | --------------------------- |
| Test  | User Story | "tests" / "is tested by"    |
| Test  | Bug        | "is blocked by" (si aplica) |
| Test  | Epic       | Via la story                |

---

## Formato de Test Cases

### Opción 1: Gherkin (Recomendado para KATA)

```gherkin
Feature: Login de Usuario

Scenario: Login exitoso con credenciales válidas
  Given estoy en la página de login
  When ingreso email "usuario@ejemplo.com"
  And ingreso password "Password123!"
  And hago click en el botón de submit
  Then debería ser redirigido al dashboard
  And debería ver un mensaje de bienvenida

Scenario Outline: Login fallido con credenciales inválidas
  Given estoy en la página de login
  When ingreso email "<email>"
  And ingreso password "<password>"
  And hago click en el botón de submit
  Then debería ver el mensaje de error "<error>"

  Examples:
    | email              | password   | error                    |
    | invalido           | Pass123!   | Formato de email inválido|
    | usuario@ejemplo.com| incorrecto | Credenciales inválidas   |
```

### Opción 2: Formato Tradicional

| Paso | Acción            | Datos de Prueba     | Resultado Esperado   |
| ---- | ----------------- | ------------------- | -------------------- |
| 1    | Navegar a /login  | -                   | Formulario visible   |
| 2    | Ingresar email    | usuario@ejemplo.com | Campo poblado        |
| 3    | Ingresar password | Password123!        | Campo enmascarado    |
| 4    | Click en Submit   | -                   | Redirect a dashboard |

---

## Plan de Pruebas (Test Plan)

### Estructura por Sprint

En teoría, cada sprint tiene su propio Test Plan:

```
Sprint 10 - Test Plan
├── TEST-101: Login con credenciales válidas
├── TEST-102: Login con credenciales inválidas
├── TEST-103: Registro de nuevo usuario
└── TEST-104: Recuperación de contraseña
```

### Repositorio de Pruebas (Épica Permanente)

En la práctica, mantener una **Épica permanente** como repositorio:

```
EPIC: Test Repository (siempre In Progress)
├── TEST-001: [Smoke] Login básico
├── TEST-002: [Smoke] Navegación principal
├── TEST-003: [Regression] Checkout completo
├── TEST-004: [Regression] Perfil de usuario
└── ... (se agregan tests continuamente)
```

**Beneficios:**

- Épica nunca se cierra
- Fácil de encontrar todos los tests
- Tests se agregan incrementalmente
- Conectada a CI para resultados

---

## Análisis de Automatización

### Criterios para Automatizar

| Factor          | Automatizar             | Mantener Manual        |
| --------------- | ----------------------- | ---------------------- |
| **Frecuencia**  | Ejecutar frecuentemente | Una sola vez           |
| **Estabilidad** | Flujo estable           | Flujo cambiante        |
| **Complejidad** | Pasos repetitivos       | Requiere juicio humano |
| **Riesgo**      | Alto impacto si falla   | Bajo riesgo            |
| **ROI**         | Alto valor vs esfuerzo  | Esfuerzo > beneficio   |

### Marcado en Jira

Para tests candidatos a automatización:

- Checkbox: `Automation Candidate = Yes`
- Label: `automation-candidate`
- Comentario: Razón por la que debe automatizarse

---

## Integración con CI/CD

### Xray Cloud (Premium)

Si el proyecto usa Xray:

1. Tests en Jira tienen tipo `Test` de Xray
2. Resultados se importan automáticamente
3. Ver `../TAE/tms-integration.md` para configuración

### Jira Direct (Budget-Friendly)

Si NO hay Xray:

1. Campo personalizado `Test Status` con valores: PASS/FAIL/BLOCKED
2. Resultados se actualizan via API de Jira
3. Comentarios con detalles de ejecución

### Flujo de Resultados

```
Playwright ejecuta tests
        ↓
Genera reporte JSON
        ↓
Script sincroniza con Jira
        ↓
Campo "Test Status" actualizado
        ↓
Comentario con detalles de ejecución
```

---

## Priorización de Tests

### Matriz de Riesgo

| Impacto ↓ / Probabilidad → | Alta         | Media      | Baja          |
| -------------------------- | ------------ | ---------- | ------------- |
| **Alto**                   | P1 - Crítico | P2 - Alto  | P3 - Medio    |
| **Medio**                  | P2 - Alto    | P3 - Medio | P4 - Bajo     |
| **Bajo**                   | P3 - Medio   | P4 - Bajo  | P5 - Opcional |

### Labels de Prioridad

| Label         | Significado             | Acción                    |
| ------------- | ----------------------- | ------------------------- |
| `smoke`       | Test de humo, esencial  | Ejecutar siempre          |
| `regression`  | Regresión completa      | Ejecutar antes de release |
| `e2e`         | End-to-end crítico      | Automatizar primero       |
| `integration` | Integración de sistemas | Automatizar               |
| `manual-only` | No automatizable        | Regresión manual          |

---

## Mejores Prácticas

### DO (Hacer)

- ✅ Crear tests **DESPUÉS** de que la feature esté estable
- ✅ Vincular tests a User Stories
- ✅ Usar formato Gherkin para tests automatizables
- ✅ Marcar claramente candidatos de automatización
- ✅ Incluir datos de prueba en los test cases
- ✅ Mantener la épica de repositorio actualizada

### DON'T (No Hacer)

- ❌ Crear tests antes de explorar la funcionalidad
- ❌ Tests sin trazabilidad a requirements
- ❌ Tests genéricos sin pasos claros
- ❌ Duplicar tests para la misma funcionalidad
- ❌ Olvidar actualizar el estado después de automatizar

---

## Herramientas MCP

### Atlassian MCP

| Herramienta                                        | Uso                    |
| -------------------------------------------------- | ---------------------- |
| `mcp__atlassian__createJiraIssue`                  | Crear Test issues      |
| `mcp__atlassian__getJiraIssue`                     | Leer detalles de story |
| `mcp__atlassian__addCommentToJiraIssue`            | Agregar resultados     |
| `mcp__atlassian__getJiraProjectIssueTypesMetadata` | Obtener schema de Test |

Ver `.context/guidelines/MCP/atlassian.md` para más detalles.

---

## Flujo Completo

```
1. EXPLORAR (Fase 10)
   └── Validar funcionalidad
   └── Identificar escenarios

2. ANALIZAR (Fase 11 - paso 1)
   └── Revisar session notes
   └── Clasificar: automatable vs manual

3. PRIORIZAR (Fase 11 - paso 2)
   └── Aplicar matriz de riesgo
   └── Ordenar por prioridad

4. DOCUMENTAR (Fase 11 - paso 3)
   └── Crear Test issues en Jira
   └── Vincular a stories
   └── Marcar automation candidates

5. AUTOMATIZAR (Fase 12)
   └── Implementar ATCs en KATA
   └── Actualizar estado en Jira
```

---

## Ver También

- `.context/guidelines/QA/spec-driven-testing.md` - Principio SDT
- `.context/guidelines/TAE/tms-integration.md` - Integración con TMS
- `.prompts/fase-11-test-documentation/` - Prompts de documentación
- `.prompts/us-qa-workflow.md` - Workflow completo de QA

---

**Última actualización**: 2025-12-21
