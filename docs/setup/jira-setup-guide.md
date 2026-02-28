# Guía de Configuración de Jira + Xray TMS

> **Propósito**: Guía paso a paso para configurar Jira con Xray como Sistema de Gestión de Tests (TMS) alineado con la metodología IQL.
> **Prerrequisito**: Leer `jira-platform.md` y `test-management-system.md` primero.
> **Tiempo Estimado**: 2-4 horas para configuración completa.

---

## Tabla de Contenidos

1. [Lista de Verificación Pre-Setup](#1-lista-de-verificación-pre-setup)
2. [Instalar Xray](#2-instalar-xray)
3. [Configurar Proyecto](#3-configurar-proyecto)
4. [Configurar Tipos de Issue](#4-configurar-tipos-de-issue)
5. [Configurar Campos Personalizados](#5-configurar-campos-personalizados)
6. [Crear Workflows](#6-crear-workflows)
7. [Configurar Repositorio de Tests](#7-configurar-repositorio-de-tests)
8. [Configurar Acceso a API](#8-configurar-acceso-a-api)
9. [Crear Test Plan](#9-crear-test-plan)
10. [Validación Final](#10-validación-final)

---

## 1. Lista de Verificación Pre-Setup

Antes de comenzar, asegúrate de tener:

- [ ] Instancia de Jira Cloud o Jira Data Center
- [ ] Permisos de Administrador de Jira
- [ ] Licencia de Xray (trial o pagada)
- [ ] Lista de módulos/features definida
- [ ] Entender la distinción entre Test Type y Test Run Status (ver `jira-platform.md`)

### Conceptos Clave a Recordar

| Concepto            | Propósito                   | Valores de Ejemplo        |
| ------------------- | --------------------------- | ------------------------- |
| **Test Type**       | Clasificación del test      | Manual, Cucumber, Generic |
| **Test Status**     | Estado del workflow de Jira | Draft, Ready, Automated   |
| **Test Run Status** | Resultado de ejecución      | TODO, PASS, FAIL, BLOCKED |
| **Requirement**     | Tipo de issue cubrible      | Story, Epic, Bug          |

---

## 2. Instalar Xray

### Paso 2.1: Instalar desde Marketplace

**Para Jira Cloud:**

1. Ve a **Configuración** (ícono de engranaje) > **Apps** > **Buscar nuevas apps**
2. Busca "Xray Test Management"
3. Haz clic en **Obtener app** > **Obtener ahora**
4. Espera a que complete la instalación
5. Haz clic en **Comenzar** para iniciar la configuración

**Para Jira Data Center:**

1. Ve a **Configuración** > **Administrar apps** > **Buscar nuevas apps**
2. Busca "Xray Test Management for Jira"
3. Haz clic en **Instalar** y acepta el acuerdo de licencia
4. Espera a que complete la instalación

### Paso 2.2: Activar Licencia

1. Ve a **Configuración** > **Administrar apps** > **Xray**
2. Ingresa tu clave de licencia o inicia un trial
3. Haz clic en **Actualizar**

### Paso 2.3: Verificar Instalación

Después de la instalación, deberías ver:

- Nuevos tipos de issue: Test, Pre-Condition, Test Set, Test Execution, Test Plan
- Sección de Xray en **Configuración** > **Apps**
- Paneles de Xray en las vistas de issues

---

## 3. Configurar Proyecto

### Paso 3.1: Agregar Tipos de Issue de Xray al Proyecto

1. Ve a **Configuración del Proyecto** > **Tipos de issue**
2. Haz clic en **Acciones** > **Agregar Tipos de Issue de Xray**
3. Selecciona todos los tipos de issue de Xray:
   - [ ] Test
   - [ ] Pre-Condition
   - [ ] Test Set
   - [ ] Test Execution
   - [ ] Test Plan
4. Haz clic en **Agregar**

### Paso 3.2: Configurar Cobertura de Requisitos

1. Ve a **Configuración del Proyecto** > **Apps** > **Configuración de Xray**
2. Haz clic en **Cobertura de Tests**
3. Selecciona qué tipos de issue pueden ser "cubiertos" por tests:
   - [ ] Story
   - [ ] Epic
   - [ ] Bug (opcional)
   - [ ] Task (opcional)
4. Haz clic en **Guardar**

### Paso 3.3: Configurar Mapeo de Tipos de Issue (Global)

1. Ve a **Configuración** > **Apps** > **Xray** > **Mapeo de Tipos de Issue**
2. Configura:
   - **Tipos de Issue de Requisitos**: Story, Epic
   - **Tipos de Issue de Defectos**: Bug
3. Haz clic en **Guardar**

---

## 4. Configurar Tipos de Issue

### Paso 4.1: Configurar Tipo de Issue Test

1. Ve a **Configuración** > **Issues** > **Tipos de issue**
2. Encuentra el tipo de issue **Test**
3. Configura pantallas y campos (ver Paso 5)

### Paso 4.2: Configuración de Test Types

Xray soporta tres tipos de test por defecto:

| Test Type    | Descripción                        | Cuándo Usar                            |
| ------------ | ---------------------------------- | -------------------------------------- |
| **Manual**   | Caso de test paso a paso           | Tests ejecutados por humanos           |
| **Cucumber** | Sintaxis BDD/Gherkin               | Specification by example               |
| **Generic**  | No estructurado, referencia por ID | Tests automatizados (Playwright, Jest) |

**Para configurar test types:**

1. Ve a **Configuración** > **Apps** > **Xray** > **Test Types**
2. Revisa los tipos por defecto (Manual, Cucumber, Generic)
3. Opcionalmente agrega tipos personalizados si es necesario

### Paso 4.3: Crear Estados de Test (Estados de Workflow)

Crea estos estados de workflow para issues de Test:

| Estado     | Categoría   | Descripción                    | Etapa IQL  |
| ---------- | ----------- | ------------------------------ | ---------- |
| Draft      | Por Hacer   | Estado inicial, siendo escrito | TMLC       |
| Ready      | Por Hacer   | Listo para revisión            | TMLC       |
| Approved   | En Progreso | Revisado y aprobado            | TMLC       |
| Manual     | Hecho       | Permanecerá manual             | TMLC       |
| Automating | En Progreso | Siendo automatizado            | TALC       |
| Automated  | Hecho       | Completamente automatizado     | TALC       |
| Deprecated | Hecho       | Ya no es válido                | Cualquiera |

---

## 5. Configurar Campos Personalizados

### Paso 5.1: Revisar Campos Personalizados de Xray

Xray crea automáticamente estos campos personalizados:

| Campo                   | Tipo            | Tipos de Issue | Propósito                    |
| ----------------------- | --------------- | -------------- | ---------------------------- |
| Test Type               | Select          | Test           | Manual/Cucumber/Generic      |
| Manual Test Steps       | Editor de Pasos | Test           | Definición de pasos de test  |
| Cucumber Test Type      | Select          | Test           | Feature/Scenario             |
| Generic Test Definition | Texto           | Test           | Referencia de automatización |
| Test Environments       | Multi-select    | Test Execution | Ambientes objetivo           |
| Revision                | Texto           | Test Execution | Info de build/versión        |
| Begin Date              | DateTime        | Test Execution | Hora de inicio               |
| End Date                | DateTime        | Test Execution | Hora de fin                  |
| Test Execution Status   | Progreso        | Test Execution | Progreso general             |
| Test Plan Status        | Progreso        | Test Plan      | Progreso general             |
| Requirement Status      | Estado          | Story/Epic     | Estado de cobertura          |

### Paso 5.2: Agregar Campos Personalizados a Pantallas

1. Ve a **Configuración** > **Issues** > **Pantallas**
2. Encuentra **Default Test Screen** o crea una nueva
3. Agrega estos campos:
   - [ ] Test Type
   - [ ] Manual Test Steps
   - [ ] Generic Test Definition
   - [ ] Labels
   - [ ] Components
   - [ ] Priority
   - [ ] Fix Version

### Paso 5.3: Crear Campos Específicos del Proyecto (Opcional)

Puedes agregar campos personalizados para tu proyecto:

**Campo de Módulo/Feature:**

1. Ve a **Configuración** > **Issues** > **Campos personalizados**
2. Haz clic en **Crear campo personalizado**
3. Selecciona **Lista de Selección (opción única)**
4. Nombre: `Module`
5. Agrega opciones: Auth, Bookings, Invoices, Reconciliation, etc.
6. Asocia con el tipo de issue Test

---

## 6. Crear Workflows

### Paso 6.1: Crear Workflow de Test

1. Ve a **Configuración** > **Issues** > **Workflows**
2. Haz clic en **Agregar workflow**
3. Nombre: `Test Lifecycle Workflow`
4. Agrega estados y transiciones:

```
WORKFLOW DE TEST:

┌─────────┐        ┌─────────┐        ┌──────────┐
│  Draft  │───────▶│  Ready  │───────▶│ Approved │
└─────────┘ Submit └─────────┘ Approve └────┬─────┘
                                            │
              ┌─────────────────────────────┼─────────────────────┐
              │                             │                     │
              ▼                             ▼                     ▼
        ┌──────────┐               ┌─────────────┐        ┌────────────┐
        │  Manual  │               │ Automating  │        │ Deprecated │
        └──────────┘               └──────┬──────┘        └────────────┘
                                          │
                                          ▼
                                   ┌───────────┐
                                   │ Automated │
                                   └───────────┘
```

### Paso 6.2: Definir Transiciones

| Desde      | Hacia      | Nombre de Transición | Condiciones      |
| ---------- | ---------- | -------------------- | ---------------- |
| Draft      | Ready      | Submit               | Summary no vacío |
| Ready      | Approved   | Approve              | -                |
| Ready      | Draft      | Reject               | -                |
| Approved   | Manual     | Mark as Manual       | -                |
| Approved   | Automating | Start Automation     | -                |
| Approved   | Deprecated | Deprecate            | -                |
| Automating | Automated  | Complete Automation  | -                |
| Automating | Approved   | Cancel Automation    | -                |
| Manual     | Automated  | Automate             | -                |
| Cualquiera | Deprecated | Deprecate            | -                |

### Paso 6.3: Asignar Workflow al Proyecto

1. Ve a **Configuración** > **Issues** > **Esquemas de workflow**
2. Crea un nuevo esquema o edita el existente
3. Asocia `Test Lifecycle Workflow` con el tipo de issue **Test**
4. Asigna el esquema a tu proyecto

---

## 7. Configurar Repositorio de Tests

El Test Repository es la estructura de carpetas de Xray para organizar tests.

### Paso 7.1: Acceder al Test Repository

1. Ve a tu proyecto
2. Haz clic en **Tests** en la barra lateral izquierda
3. Haz clic en la pestaña **Test Repository**

### Paso 7.2: Crear Estructura de Carpetas

Crea una estructura de carpetas que coincida con los módulos de tu aplicación:

```
Test Repository
├── Auth
│   ├── Login
│   ├── Logout
│   └── Password Reset
├── Bookings
│   ├── Create Booking
│   ├── Edit Booking
│   └── Cancel Booking
├── Invoices
│   ├── Generate Invoice
│   └── Export Invoice
├── Reconciliation
│   └── Monthly Close
└── Smoke Tests
    └── Critical Paths
```

**Para crear carpetas:**

1. Haz clic derecho en la raíz del repositorio
2. Selecciona **Crear carpeta**
3. Ingresa el nombre de la carpeta
4. Repite para subcarpetas

### Paso 7.3: Organizar Tests Existentes

1. Selecciona tests de la lista
2. Arrastra y suelta en las carpetas apropiadas
3. O usa acciones masivas para mover múltiples tests

---

## 8. Configurar Acceso a API

### Paso 8.1: Crear Credenciales de API (Cloud)

1. Ve a **Configuración** > **Apps** > **Xray** > **API Keys**
2. Haz clic en **Crear API Key**
3. Ingresa un nombre descriptivo: `QA Automation - CI/CD`
4. Haz clic en **Generar**
5. **Guarda ambos valores de forma segura:**
   ```
   Client ID: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   Client Secret: YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   ```

### Paso 8.2: Crear Personal Access Token (Server/DC)

1. Haz clic en tu avatar de perfil > **Perfil**
2. Ve a **Personal Access Tokens**
3. Haz clic en **Crear token**
4. Ingresa nombre: `QA Automation`
5. Establece expiración (o sin expiración para CI)
6. Copia y guarda el token

### Paso 8.3: Probar Conexión de API

**Cloud:**

```bash
# Obtener token de autenticación
curl -X POST \
  https://xray.cloud.getxray.app/api/v2/authenticate \
  -H "Content-Type: application/json" \
  -d '{"client_id": "TU_CLIENT_ID", "client_secret": "TU_CLIENT_SECRET"}'

# Debería retornar un token JWT
```

**Server/DC:**

```bash
# Probar con PAT
curl -H "Authorization: Bearer TU_PAT" \
  https://tu-jira.com/rest/raven/2.0/api/test

# Debería retornar datos de test
```

### Paso 8.4: Configurar Variables de Entorno

Crea o actualiza tu archivo `.env`:

```bash
# Configuración de Jira + Xray
JIRA_BASE_URL=https://tu-empresa.atlassian.net
JIRA_PROJECT_KEY=PROJ

# Autenticación Cloud
XRAY_CLIENT_ID=tu_client_id
XRAY_CLIENT_SECRET=tu_client_secret

# Autenticación Server/DC (alternativa)
# XRAY_TOKEN=tu_personal_access_token

# Opcional: Valores por defecto
XRAY_TEST_PLAN_KEY=PROJ-300
XRAY_ENVIRONMENT=staging
```

---

## 9. Crear Test Plan

### Paso 9.1: Crear Tu Primer Test Plan

1. Haz clic en **Crear** (botón +)
2. Selecciona tipo de issue **Test Plan**
3. Completa los detalles:
   - **Resumen**: `Regression v2.0`
   - **Fix Version**: Selecciona versión objetivo
   - **Descripción**: Agrega objetivos del plan
4. Haz clic en **Crear**

### Paso 9.2: Agregar Tests al Plan

1. Abre el Test Plan
2. Ve a la sección **Tests**
3. Haz clic en **Agregar Tests**
4. Elige método:
   - **Buscar**: Encontrar tests individuales
   - **Test Set**: Agregar todos los tests de un set
   - **Carpeta**: Agregar todos los tests de una carpeta del repositorio
5. Selecciona tests y haz clic en **Agregar**

### Paso 9.3: Crear Test Execution

1. Abre el Test Plan
2. Haz clic en **Crear Test Execution**
3. Completa los detalles:
   - **Resumen**: `Regression Staging Sprint 5`
   - **Test Environments**: Selecciona `staging`
   - **Revision**: Ingresa versión del build
4. Los tests se agregan automáticamente del plan
5. Haz clic en **Crear**

### Paso 9.4: Configurar Test Environments

1. Ve a **Configuración** > **Apps** > **Xray** > **Test Environments**
2. Agrega ambientes:
   - `local`
   - `dev`
   - `staging`
   - `production`
3. Haz clic en **Guardar**

---

## 10. Validación Final

### Paso 10.1: Validar Configuración de Tipos de Issue

Ejecuta estas verificaciones:

- [ ] El tipo de issue Test tiene todos los campos requeridos
- [ ] Los Test Types están configurados (Manual, Cucumber, Generic)
- [ ] El workflow está asignado al tipo de issue Test
- [ ] El Test Repository es accesible
- [ ] La cobertura de requisitos está habilitada para Story/Epic

### Paso 10.2: Validar Conexión de API

```bash
# Configurar autenticación
export XRAY_CLIENT_ID="tu_client_id"
export XRAY_CLIENT_SECRET="tu_client_secret"

# Probar conexión CLI
bun xray auth status

# Listar tests (debería retornar datos)
bun xray test list

# Crear un caso de test
bun xray test create \
  --summary "Verify login flow" \
  --type Generic \
  --project PROJ

# Importar resultados de muestra
bun xray import sample-results.xml \
  --project PROJ \
  --test-plan PROJ-300
```

### Paso 10.3: Probar Flujo Completo

1. **Crear Test**: Crea un test Generic con patrón de ID
2. **Agregar al Plan**: Agrega el test a un Test Plan
3. **Ejecutar Playwright**: Ejecuta con reporter JUnit
4. **Importar Resultados**: Usa API o CLI para importar
5. **Verificar en Xray**: Verifica que el Test Execution muestre resultados

### Paso 10.4: Documentar Tu Configuración

Después del setup, guarda tus valores específicos:

```yaml
# Referencia de Configuración Xray
jira:
  base_url: https://tu-empresa.atlassian.net
  project_key: PROJ

xray:
  api_type: cloud # o server
  client_id: (guardado en .env)
  client_secret: (guardado en .env)

issue_types:
  test: 10001
  pre_condition: 10002
  test_set: 10003
  test_execution: 10004
  test_plan: 10005

environments:
  - local
  - dev
  - staging
  - production

test_plan_naming: 'Regression [Environment] [Sprint/Version]'
test_execution_naming: 'CI Run #[number] - [Environment]'
```

---

## Solución de Problemas

### Problemas Comunes

| Problema                           | Solución                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Los paneles de Xray no se muestran | Verifica que el esquema de tipos de issue incluya los tipos de Xray                              |
| No se pueden agregar tests al plan | Verifica que los tests existan y el usuario tenga permisos                                       |
| API retorna 401                    | Regenera las credenciales de API                                                                 |
| API retorna 404                    | Verifica que la clave del proyecto y las claves de issues existan                                |
| Tests no coinciden al importar     | Asegúrate de que los nombres de test incluyan claves de Jira (ej: `PROJ-101 \| nombre del test`) |
| Cobertura no se muestra            | Habilita cobertura de requisitos en configuración del proyecto                                   |

### Queries JQL Útiles

```jql
# Encontrar todos los tests automatizados
project = PROJ AND issuetype = Test AND status = Automated

# Encontrar tests sin cobertura
project = PROJ AND issuetype = Test AND "Requirement Status" is EMPTY

# Encontrar test runs fallidos
project = PROJ AND issuetype = "Test Execution" AND "Test Execution Status" = FAIL

# Encontrar tests en carpeta específica
project = PROJ AND issuetype = Test AND "Test Repository Path" ~ "Auth/Login"

# Encontrar tests por label
project = PROJ AND issuetype = Test AND labels in (regression, smoke)
```

---

## Próximos Pasos

Después de completar este setup:

1. **Crear Tests**: Comienza a crear casos de test para tu aplicación
2. **Organizar Repositorio**: Estructura tests por módulo/feature
3. **Vincular a Requisitos**: Asocia tests con Stories/Epics
4. **Configurar CI/CD**: Configura importación automática de resultados
5. **Capacitar al Equipo**: Comparte esta guía con los miembros del equipo

---

## Fuentes y Referencias

- [Documentación de Xray Cloud](https://docs.getxray.app/display/XRAYCLOUD)
- [Documentación de Xray Server/DC](https://docs.getxray.app/display/XRAY)
- [Xray Academy - Curso de Fundamentos](https://academy.getxray.app/)
- [Referencia de API REST de Xray](https://docs.getxray.app/display/XRAYCLOUD/REST+API)
- [Administración de Jira Atlassian](https://support.atlassian.com/jira-cloud-administration/)
- [Integración Playwright-Xray](https://github.com/inluxc/playwright-xray)

---

**Documento Creado**: 2026-02-09
**Versión IQL**: 2.0
**Compatible Con**: jira-platform.md v1.0, cli/xray.ts v1.0.0
