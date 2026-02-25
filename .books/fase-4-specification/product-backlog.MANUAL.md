<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Product Backlog - Manual

> **Fase:** 4 - Specification (Product Backlog)
> **Tiempo estimado:** 4-8 horas (depende del tamaño del MVP)
> **Herramientas:** Jira (o herramienta de gestión), Markdown, Git
> **Pre-requisito:** Fase 2 (Architecture) completada con PRD y SRS

---

## Objetivo

Crear el **Product Backlog** completo del MVP:

- **Epic Tree:** Vista general de todas las épicas y stories
- **Épicas:** Agrupaciones de funcionalidad relacionada
- **User Stories:** Unidades de trabajo con acceptance criteria
- **Sincronización:** Jira ↔ Documentación local en sync

El backlog es la **fuente de verdad** para todo el desarrollo del proyecto.

---

## Conceptos Clave

### 🔑 Épica (Epic)

Una **épica** es una funcionalidad grande que se divide en user stories más pequeñas.

```
┌─────────────────────────────────────────────────────────────────┐
│                    EPIC: User Authentication                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  STORY:      │  │  STORY:      │  │  STORY:      │           │
│  │  Signup      │  │  Login       │  │  Password    │           │
│  │              │  │              │  │  Reset       │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  STORY:      │  │  STORY:      │                             │
│  │  Profile     │  │  Logout      │                             │
│  │  Edit        │  │              │                             │
│  └──────────────┘  └──────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Características de una buena épica:**

- Representa valor de negocio significativo
- Se puede dividir en 3-10 stories
- Tiene un scope bien definido
- Puede completarse en 2-4 sprints

### 🔑 User Story

Una **user story** describe una funcionalidad desde la perspectiva del usuario.

**Formato estándar:**

```
As a [tipo de usuario]
I want to [acción/funcionalidad]
So that [beneficio/valor]
```

**Ejemplo:**

```
As a new user
I want to create an account with my email
So that I can access personalized features
```

### 🔑 Acceptance Criteria (Gherkin)

Los **acceptance criteria** definen cuándo una story está completa usando formato Gherkin:

```gherkin
Scenario: Successful signup with valid email
  Given I am on the signup page
  When I enter a valid email and password
  And I click the "Create Account" button
  Then I should see a confirmation message
  And I should receive a verification email
```

### 🔑 Story Points (Fibonacci)

**Story Points** estiman complejidad, no tiempo:

| Points | Complejidad   | Ejemplo                                     |
| ------ | ------------- | ------------------------------------------- |
| 1      | Trivial       | Cambiar texto de un botón                   |
| 2      | Simple        | Agregar un campo a un formulario            |
| 3      | Moderada      | Crear una página simple con form            |
| 5      | Compleja      | Integrar con API externa                    |
| 8      | Muy compleja  | Implementar flujo completo con validaciones |
| 13     | Épica pequeña | Sistema de notificaciones completo          |

> 💡 **Tip:** Si una story es > 8 puntos, probablemente debe dividirse.

### 🔑 Nomenclatura de Carpetas

El sistema usa nomenclatura estándar para mantener orden:

```
EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre-descriptivo}/
STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre-descriptivo}/
```

**Componentes:**

- `{PROJECT_KEY}`: Código del proyecto en Jira (ej: MYM, SHOP)
- `{ISSUE_NUM}`: Número asignado por Jira (ej: 1, 2, 13)
- `{nombre-descriptivo}`: 2-4 palabras en kebab-case

**Ejemplos válidos:**

- ✅ `EPIC-MYM-2-user-authentication/`
- ✅ `STORY-MYM-14-signup-email/`

**Ejemplos inválidos:**

- ❌ `EPIC-001-auth/` (falta PROJECT_KEY)
- ❌ `EPIC-MYM-002-auth/` (Jira no usa ceros a la izquierda)
- ❌ `EPIC_MYM_2_auth/` (debe usar guiones, no guiones bajos)

---

## Pre-requisitos

### Documentación Completada

- [ ] `.context/PRD/mvp-scope.md` - Épicas y features del MVP
- [ ] `.context/PRD/user-journeys.md` - Flujos de usuario
- [ ] `.context/SRS/functional-specs.md` - Requerimientos funcionales

### Herramientas Configuradas

- [ ] Proyecto creado en Jira (u otra herramienta)
- [ ] Permisos para crear épicas y stories
- [ ] Project Key identificado (ej: MYM, SHOP)

---

## Paso a Paso

## Paso 1: Obtener el Project Key

### 1.1 Identificar tu Project Key

El **Project Key** es el código de 2-5 letras que Jira usa para identificar tu proyecto.

**Dónde encontrarlo:**

1. Ve a tu proyecto en Jira
2. Mira la URL: `https://tuempresa.atlassian.net/jira/software/projects/MYM/...`
3. O mira cualquier issue: el prefijo antes del número (ej: **MYM**-1)

**Características:**

- 2-5 caracteres
- Solo MAYÚSCULAS
- Sin espacios ni caracteres especiales

**Ejemplo:** Si tus issues son `MYM-1`, `MYM-2`, tu PROJECT_KEY es `MYM`.

---

## Paso 2: Crear el Epic Tree (Vista General)

### 2.1 Analizar el MVPScope

Abre `.context/PRD/mvp-scope.md` e identifica:

1. **Épicas principales** (funcionalidades grandes)
2. **User stories** por cada épica
3. **Prioridades** (qué debe implementarse primero)

### 2.2 Crear archivo epic-tree.md

Crea el archivo `.context/PBI/epic-tree.md`:

```markdown
# Product Backlog - Epic Tree

## Overview

**Total Epics:** [número]
**Total User Stories:** [número estimado]
**Project Code:** [PROJECT_KEY]
**Jira Project:** [URL del proyecto en Jira]

---

## Epic Hierarchy

### EPIC 1: [Nombre de la Épica]

**Planned Jira Key:** [PROJECT_KEY]-TBD
**Priority:** CRITICAL | HIGH | MEDIUM | LOW
**Description:** [1-2 líneas describiendo la épica]

**User Stories (estimado: X):**

1. [PROJECT_KEY]-TBD - As a [user], I want to [action] so that [benefit]
2. [PROJECT_KEY]-TBD - As a [user], I want to [action] so that [benefit]
3. [PROJECT_KEY]-TBD - As a [user], I want to [action] so that [benefit]

---

### EPIC 2: [Nombre de la Épica]

**Planned Jira Key:** [PROJECT_KEY]-TBD
**Priority:** CRITICAL | HIGH | MEDIUM | LOW
**Description:** [1-2 líneas]

**User Stories (estimado: X):**

1. [PROJECT_KEY]-TBD - As a [user], I want to [action] so that [benefit]
2. [PROJECT_KEY]-TBD - As a [user], I want to [action] so that [benefit]

---

[Repetir para cada épica]

---

## Epic Prioritization

### Phase 1: Foundation (Sprint 1-2)

1. EPIC 1 - [Nombre] - Base fundamental del sistema
2. EPIC 2 - [Nombre] - Funcionalidad core

### Phase 2: Core Features (Sprint 3-4)

3. EPIC 3 - [Nombre] - Features principales
4. EPIC 4 - [Nombre] - Features secundarias

### Phase 3: Enhancements (Sprint 5+)

5. EPIC 5 - [Nombre] - Mejoras y optimizaciones

---

## Next Steps

1. Crear cada épica en Jira y obtener ID real
2. Actualizar este archivo con IDs reales
3. Crear carpetas locales con nomenclatura correcta
```

> 💡 **Tip:** En este punto, los IDs son "TBD" (To Be Determined). Se actualizarán cuando crees las épicas en Jira.

---

## Paso 3: Crear Épicas en Jira

### 3.1 Crear la primera épica

1. Ve a tu proyecto en Jira
2. Click en **"Create"** o **"+ Create issue"**
3. Selecciona tipo: **Epic**
4. Completa los campos:

| Campo           | Valor                                                     |
| --------------- | --------------------------------------------------------- |
| **Summary**     | Nombre de la épica (ej: "User Authentication & Profiles") |
| **Description** | Descripción detallada (2-3 párrafos)                      |
| **Priority**    | High / Medium / Low                                       |
| **Labels**      | `mvp`, `phase-1`                                          |

5. Click **"Create"**
6. **IMPORTANTE:** Anota el **Jira Key** asignado (ej: `MYM-2`)

### 3.2 Crear carpeta local de la épica

Con el Jira Key obtenido, crea la carpeta:

```bash
mkdir -p .context/PBI/epics/EPIC-MYM-2-user-authentication/stories
```

**Nomenclatura:** `EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre-descriptivo}/`

### 3.3 Crear archivo epic.md

Dentro de la carpeta, crea `epic.md`:

```markdown
# User Authentication & Profiles

**Jira Key:** MYM-2
**Status:** ASSIGNED
**Priority:** CRITICAL
**Phase:** Foundation

---

## Epic Description

[Descripción detallada de la épica - 2-3 párrafos explicando qué incluye y por qué es importante]

**Business Value:**
[Explicar el valor de negocio - por qué esta épica es fundamental para el producto]

---

## User Stories

1. **MYM-TBD** - As a new user, I want to signup with email
2. **MYM-TBD** - As a user, I want to login to my account
3. **MYM-TBD** - As a user, I want to reset my password
4. **MYM-TBD** - As a user, I want to edit my profile
5. **MYM-TBD** - As a user, I want to logout securely

**NOTA:** Los IDs serán actualizados cuando se creen las stories en Jira.

---

## Scope

### In Scope

- Registro con email/password
- Login/Logout
- Recuperación de contraseña
- Edición de perfil básico
- Sesiones seguras

### Out of Scope (Future)

- OAuth (Google, GitHub, etc.)
- Two-factor authentication
- Social profiles
- Premium subscriptions

---

## Acceptance Criteria (Epic Level)

1. ✅ Usuario puede crear cuenta con email válido
2. ✅ Usuario puede iniciar sesión y cerrar sesión
3. ✅ Usuario puede recuperar contraseña olvidada
4. ✅ Usuario puede editar información de perfil
5. ✅ Sesiones expiran después de 7 días de inactividad

---

## Related Functional Requirements

- **FR-001:** Sistema de registro de usuarios
- **FR-002:** Sistema de autenticación
- **FR-003:** Gestión de perfiles

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Database

**Tables:**

- `profiles` (extends auth.users)
- Campos: id, email, full_name, avatar_url, role, created_at

### Security

- Passwords hasheados con bcrypt
- JWT tokens para sesiones
- Rate limiting en endpoints de auth
- HTTPS obligatorio

---

## Dependencies

### External Dependencies

- Supabase Auth
- Email service para verificación

### Internal Dependencies

- Ninguna (esta es la épica base)

### Blocks

- Todas las demás épicas requieren esta primero

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-MYM-2-user-authentication/feature-test-plan.md` (se crea en Fase 5)

### Test Coverage Requirements

- **Unit Tests:** Auth utilities, validation functions
- **Integration Tests:** Auth endpoints, DB operations
- **E2E Tests:** Signup flow, Login flow, Password reset

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-MYM-2-user-authentication/feature-implementation-plan.md` (se crea en Fase 6)

### Recommended Story Order

1. MYM-3 - Signup (foundation)
2. MYM-4 - Login (depends on signup)
3. MYM-5 - Logout (depends on login)
4. MYM-6 - Password reset (depends on login)
5. MYM-7 - Profile edit (depends on auth)

---

## Related Documentation

- **PRD:** `.context/PRD/executive-summary.md`, `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-001 to FR-003)
- **Architecture:** `.context/SRS/architecture-specs.md`
```

---

## Paso 4: Crear User Stories en Jira

### 4.1 Crear cada story

Para cada user story de la épica:

1. Ve a Jira → **"Create"**
2. Selecciona tipo: **Story**
3. Completa los campos:

| Campo            | Valor                                               |
| ---------------- | --------------------------------------------------- |
| **Summary**      | "As a [user], I want to [action] so that [benefit]" |
| **Description**  | Descripción + Acceptance Criteria (ver abajo)       |
| **Epic Link**    | Selecciona la épica padre (ej: MYM-2)               |
| **Priority**     | High / Medium / Low                                 |
| **Story Points** | 1, 2, 3, 5, 8, o 13                                 |
| **Labels**       | `mvp`, `sprint-1`                                   |

4. Click **"Create"**
5. Anota el **Jira Key** asignado (ej: `MYM-3`)

### 4.2 Template para Description

Usa este template en el campo Description de Jira:

```markdown
## User Story

**As a** [tipo de usuario]
**I want to** [acción]
**So that** [beneficio]

---

## Description

[2-3 párrafos describiendo la funcionalidad en detalle]

---

## Acceptance Criteria

### Scenario 1: [Happy path]

- **Given:** [contexto inicial]
- **When:** [acción del usuario]
- **Then:** [resultado esperado]

### Scenario 2: [Error case]

- **Given:** [contexto inicial]
- **When:** [acción incorrecta]
- **Then:** [manejo del error]

### Scenario 3: [Edge case]

- **Given:** [contexto especial]
- **When:** [acción del usuario]
- **Then:** [resultado esperado]

---

## Technical Notes

- Frontend: [componentes a crear/modificar]
- Backend: [APIs a crear/modificar]
- Database: [tablas afectadas]

---

## Definition of Done

- [ ] Código implementado
- [ ] Tests unitarios (>80% coverage)
- [ ] Tests E2E
- [ ] Code review aprobado
- [ ] Deployed to staging
- [ ] QA testing passed
```

### 4.3 Crear carpeta local de story

Con el Jira Key obtenido:

```bash
mkdir -p .context/PBI/epics/EPIC-MYM-2-user-authentication/stories/STORY-MYM-3-signup-email
```

### 4.4 Crear archivo story.md

Dentro de la carpeta, crea `story.md`:

```markdown
# User Signup with Email

**Jira Key:** MYM-3
**Epic:** MYM-2 (User Authentication & Profiles)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** new user
**I want to** create an account using my email address
**So that** I can access personalized features of the application

---

## Description

Users should be able to create a new account by providing their email address and a secure password. The system must validate the email format, ensure password strength requirements are met, and send a verification email.

This is the entry point for all new users and must provide a smooth, trustworthy experience that encourages completion.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful signup with valid credentials

- **Given:** I am on the signup page
- **When:** I enter a valid email "user@example.com"
- **And:** I enter a password that meets requirements (8+ chars, 1 uppercase, 1 number)
- **And:** I click "Create Account"
- **Then:** I should see a success message
- **And:** I should receive a verification email
- **And:** I should be redirected to a "Check your email" page

### Scenario 2: Signup with invalid email format

- **Given:** I am on the signup page
- **When:** I enter an invalid email "notanemail"
- **And:** I try to submit the form
- **Then:** I should see an error message "Please enter a valid email address"
- **And:** The form should not be submitted

### Scenario 3: Signup with weak password

- **Given:** I am on the signup page
- **When:** I enter a valid email
- **And:** I enter a password "123" (too short/weak)
- **And:** I try to submit the form
- **Then:** I should see an error message listing password requirements
- **And:** The form should not be submitted

### Scenario 4: Signup with already registered email

- **Given:** An account exists with email "existing@example.com"
- **When:** I try to signup with the same email
- **And:** I click "Create Account"
- **Then:** I should see a message "An account with this email already exists"
- **And:** I should see a link to the login page

---

## Technical Notes

### Frontend

- Create `/signup` page
- Use shadcn/ui form components
- Real-time password strength indicator
- Form validation with react-hook-form + zod

### Backend

- Use Supabase Auth `signUp()` method
- Trigger creates profile in `profiles` table
- Rate limiting: 5 attempts per IP per hour

### Database

- `profiles` table created in Fase 3
- Trigger: `on_auth_user_created` → creates profile

---

## Dependencies

### Blocked By

- None (this is the first story)

### Blocks

- MYM-4 (Login) - requires account to exist
- MYM-7 (Profile Edit) - requires authenticated user

### Related Stories

- MYM-4 (Login)
- MYM-6 (Password Reset)

---

## UI/UX Considerations

- Clean, centered form layout
- Clear password requirements visible
- Progress indicator (step 1 of 1)
- Link to login for existing users
- Mobile-responsive design

---

## Definition of Done

- [ ] Signup form implemented and styled
- [ ] Email validation working
- [ ] Password validation with strength indicator
- [ ] Error handling for all scenarios
- [ ] Verification email sent successfully
- [ ] Profile created in database
- [ ] Unit tests for validation logic
- [ ] E2E test for happy path
- [ ] Code review approved
- [ ] Tested on staging environment

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication/epic.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-001)
```

---

## Paso 5: Actualizar epic.md con IDs Reales

Una vez creadas todas las stories de una épica, actualiza el `epic.md`:

```markdown
## User Stories

1. **MYM-3** - As a new user, I want to signup with email
2. **MYM-4** - As a user, I want to login to my account
3. **MYM-5** - As a user, I want to logout securely
4. **MYM-6** - As a user, I want to reset my password
5. **MYM-7** - As a user, I want to edit my profile
```

---

## Paso 6: Actualizar Epic Tree con IDs Reales

Actualiza `.context/PBI/epic-tree.md` con todos los IDs:

```markdown
### EPIC 1: User Authentication & Profiles

**Jira Key:** MYM-2
**Priority:** CRITICAL
**Stories:** 5

1. **MYM-3** - Signup with email
2. **MYM-4** - Login
3. **MYM-5** - Logout
4. **MYM-6** - Password reset
5. **MYM-7** - Profile edit

---

### EPIC 2: [Nombre]

**Jira Key:** MYM-8
...
```

---

## Paso 7: Repetir para Cada Épica

Repite los pasos 3-6 para cada épica del MVP:

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW POR ÉPICA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Crear épica en Jira          → Obtener ID (ej: MYM-8)       │
│                                   ↓                              │
│  2. Crear carpeta local          → EPIC-MYM-8-{nombre}/         │
│                                   ↓                              │
│  3. Crear epic.md                → Documentar épica              │
│                                   ↓                              │
│  4. Crear stories en Jira        → Obtener IDs (MYM-9, 10...)   │
│                                   ↓                              │
│  5. Crear carpetas de stories    → STORY-MYM-9-{nombre}/        │
│                                   ↓                              │
│  6. Crear story.md por cada una                                  │
│                                   ↓                              │
│  7. Actualizar epic.md con IDs                                   │
│                                   ↓                              │
│  8. Actualizar epic-tree.md                                      │
│                                   ↓                              │
│  ✅ Épica completada             → Siguiente épica               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Añadir Features Después del MVP

### Clasificar la Nueva Feature

Cuando tengas una nueva idea/feature, clasifícala:

**NIVEL 1: Story Individual**

- Es una mejora de funcionalidad existente
- Encaja en una épica ya creada
- 1-8 story points

→ **Acción:** Agregar story a épica existente

**NIVEL 2: Épica Completa**

- Feature nueva que NO encaja en épicas existentes
- Requiere 3-8 stories
- Scope bien definido

→ **Acción:** Crear nueva épica con sus stories

**NIVEL 3: Múltiples Épicas**

- Requiere 2+ épicas
- Cambios arquitectónicos significativos
- 20+ stories estimadas

→ **Acción:** Crear plan de división primero

### Agregar Story a Épica Existente

1. Identificar épica padre en Jira
2. Crear story en Jira (vinculada a la épica)
3. Crear carpeta local: `STORY-{KEY}-{NUM}-{nombre}/`
4. Crear archivo story.md
5. Actualizar epic.md
6. Actualizar epic-tree.md

### Agregar Nueva Épica

1. Crear épica en Jira
2. Crear carpeta: `EPIC-{KEY}-{NUM}-{nombre}/`
3. Crear epic.md
4. Crear todas las stories en Jira
5. Crear carpetas y story.md
6. Actualizar epic-tree.md (agregar sección Post-MVP)

---

## Estructura Final de Carpetas

Al completar el backlog, tendrás:

```
.context/PBI/
├── epic-tree.md
└── epics/
    ├── EPIC-MYM-2-user-authentication/
    │   ├── epic.md
    │   └── stories/
    │       ├── STORY-MYM-3-signup-email/
    │       │   └── story.md
    │       ├── STORY-MYM-4-login/
    │       │   └── story.md
    │       ├── STORY-MYM-5-logout/
    │       │   └── story.md
    │       ├── STORY-MYM-6-password-reset/
    │       │   └── story.md
    │       └── STORY-MYM-7-profile-edit/
    │           └── story.md
    │
    ├── EPIC-MYM-8-entity-discovery/
    │   ├── epic.md
    │   └── stories/
    │       ├── STORY-MYM-9-list-entities/
    │       │   └── story.md
    │       ├── STORY-MYM-10-search-entities/
    │       │   └── story.md
    │       └── ...
    │
    └── EPIC-MYM-XX-[otra-epic]/
        ├── epic.md
        └── stories/
            └── ...
```

---

## Checklist Final

### Epic Tree ✅

- [ ] `epic-tree.md` creado con todas las épicas
- [ ] Todas las épicas tienen Jira Keys reales
- [ ] Priorización por fases documentada
- [ ] Conteo total de épicas y stories

### Por Cada Épica ✅

- [ ] Épica creada en Jira con ID real
- [ ] Carpeta local con nomenclatura correcta
- [ ] Archivo `epic.md` completo
- [ ] Todas las stories creadas en Jira
- [ ] Carpetas locales de stories creadas
- [ ] Archivos `story.md` completos
- [ ] `epic.md` actualizado con IDs reales

### Sincronización ✅

- [ ] Jira refleja todas las épicas y stories
- [ ] Documentación local sincronizada con Jira
- [ ] Nomenclatura consistente en todo el proyecto
- [ ] `epic-tree.md` actualizado como índice general

---

## Troubleshooting

### "No sé cómo dividir en stories"

**Solución:** Usa los User Journeys como guía. Cada paso importante del journey puede ser una story.

Ejemplo:

```
Journey: Nuevo usuario se registra y hace primera compra

Stories:
1. Signup (registro)
2. Email verification (verificación)
3. Complete profile (completar perfil)
4. Browse products (explorar productos)
5. Add to cart (agregar al carrito)
6. Checkout (pagar)
```

### "Story muy grande (> 8 puntos)"

**Solución:** Divide la story en partes más pequeñas.

Ejemplo:

```
Antes:
- "User can manage their entire profile" (13 puntos)

Después:
- "User can view profile" (2 puntos)
- "User can edit basic info" (3 puntos)
- "User can upload avatar" (3 puntos)
- "User can change password" (3 puntos)
```

### "No sé qué prioridad asignar"

**Solución:** Usa esta guía:

| Prioridad | Criterio                              |
| --------- | ------------------------------------- |
| CRITICAL  | Sin esto el MVP no funciona           |
| HIGH      | Feature core del producto             |
| MEDIUM    | Mejora experiencia significativamente |
| LOW       | Nice-to-have, puede esperar           |

### "Acceptance criteria muy vagos"

**Solución:** Asegúrate de que cada scenario sea:

- **Específico:** Valores concretos, no genéricos
- **Medible:** Puedes verificar objetivamente si pasó
- **Completo:** Cubre happy path + errores + edge cases

Mal:

```
Given user is on page
When user does something
Then something happens
```

Bien:

```
Given I am on the login page with empty fields
When I enter email "user@example.com"
And I enter password "SecurePass123!"
And I click the "Login" button
Then I should be redirected to "/dashboard"
And I should see "Welcome back" message
And my session should be valid for 7 days
```

---

## Recursos Adicionales

- [Formato Gherkin - Cucumber Docs](https://cucumber.io/docs/gherkin/)
- [Story Points - Atlassian](https://www.atlassian.com/agile/project-management/estimation)
- [User Stories - Mountain Goat Software](https://www.mountaingoatsoftware.com/agile/user-stories)
- [INVEST Criteria](<https://en.wikipedia.org/wiki/INVEST_(mnemonic)>)

---

## Próximos Pasos

Con el Product Backlog completo, puedes proceder a:

1. **Fase 5: Shift-Left Testing** → Crear test plans antes de implementar
2. **Fase 6: Planning** → Crear implementation plans técnicos
3. **Fase 7: Implementation** → Implementar las stories

Los archivos creados en esta fase se expandirán en fases posteriores:

- `feature-test-plan.md` → Fase 5
- `story-xxx/acceptance-test-plan.md` → Fase 5
- `feature-implementation-plan.md` → Fase 6
- `story-xxx/implementation-plan.md` → Fase 6

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
**Autor:** UPEX Galaxy - DOJO AI-Powered Quality Engineer
