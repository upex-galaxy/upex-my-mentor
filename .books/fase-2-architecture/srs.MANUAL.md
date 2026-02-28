<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Software Requirements Specification (SRS) - Manual

> **Fase:** 2 - Architecture
> **Tiempo estimado:** 3-5 horas
> **Herramientas:** Editor de código, Draw.io/Mermaid, OpenAPI Editor
> **Prerequisitos:** PRD completo (executive-summary, user-personas, mvp-scope, user-journeys)

---

## 🎯 Objetivo

Crear el **SRS (Software Requirements Specification)** que define CÓMO construiremos técnicamente lo que el PRD definió como QUÉ.

Al finalizar tendrás 4 archivos en `.context/SRS/`:

- `functional-specs.md`
- `non-functional-specs.md`
- `architecture-specs.md`
- `api-contracts.yaml`

---

## 🔑 Conceptos Clave

| Término          | Significado                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| **SRS**          | Software Requirements Specification - Especificaciones técnicas detalladas  |
| **FR**           | Functional Requirement - Qué debe hacer el sistema                          |
| **NFR**          | Non-Functional Requirement - Cómo debe comportarse (performance, seguridad) |
| **ERD**          | Entity-Relationship Diagram - Diseño de base de datos                       |
| **API Contract** | Especificación de endpoints (request/response)                              |
| **OpenAPI**      | Estándar para documentar APIs REST                                          |
| **C4 Model**     | Framework para diagramar arquitectura de software                           |
| **RLS**          | Row Level Security - Seguridad a nivel de fila en DB                        |

---

## 📐 Estructura del SRS

```
┌─────────────────────────────────────────────────────────────────┐
│                            SRS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. FUNCTIONAL SPECS          2. NON-FUNCTIONAL SPECS           │
│  ┌───────────────────┐        ┌───────────────────┐             │
│  │ • FR por cada US  │        │ • Performance     │             │
│  │ • Input/Output    │        │ • Security        │             │
│  │ • Validaciones    │        │ • Scalability     │             │
│  │ • Reglas negocio  │        │ • Accessibility   │             │
│  └───────────────────┘        └───────────────────┘             │
│          │                            │                         │
│          └────────────┬───────────────┘                         │
│                       ▼                                         │
│           3. ARCHITECTURE SPECS                                 │
│           ┌───────────────────────────────┐                     │
│           │ • System Architecture (C4)    │                     │
│           │ • Database Design (ERD)       │                     │
│           │ • Tech Stack Justification    │                     │
│           │ • Security Architecture       │                     │
│           └───────────────────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│           4. API CONTRACTS                                      │
│           ┌───────────────────────────────┐                     │
│           │ • OpenAPI 3.0 Spec            │                     │
│           │ • Endpoints detallados        │                     │
│           │ • Request/Response schemas    │                     │
│           └───────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 PARTE 1: Functional Specifications

### ¿Qué es?

Traducción de User Stories a requerimientos técnicos específicos que un developer puede implementar.

### Paso 1.1: Mapea User Stories a Functional Requirements

**¿Qué hacer?**
Por cada User Story del MVP, crea un Functional Requirement (FR).

**¿Por qué?**
Los FRs eliminan ambigüedad. Un developer sabe exactamente qué implementar.

**Formato:**

````markdown
## FR-[NUM]: [Título descriptivo]

**Relacionado a:** EPIC-XXX, US-X.X
**Prioridad:** Must Have | Should Have | Could Have

### Input

| Campo    | Tipo   | Validaciones            | Ejemplo          |
| -------- | ------ | ----------------------- | ---------------- |
| email    | string | RFC 5321, max 254 chars | user@example.com |
| password | string | min 8, 1 upper, 1 digit | Password123      |

### Processing

1. [Paso 1 del procesamiento]
2. [Paso 2 del procesamiento]
3. [Paso N del procesamiento]

### Output

**Success (200/201):**

```json
{
  "success": true,
  "data": { ... }
}
```
````

**Error (4XX/5XX):**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo"
  }
}
```

### Validaciones de Negocio

- [ ] [Regla 1]
- [ ] [Regla 2]

````

**Ejemplo completo:**

```markdown
## FR-001: Registro de usuario con email

**Relacionado a:** EPIC-001 (Authentication), US-1.1
**Prioridad:** Must Have

### Input
| Campo | Tipo | Validaciones | Ejemplo |
|-------|------|--------------|---------|
| email | string | RFC 5321, max 254 chars, único en sistema | maria@example.com |
| password | string | min 8 chars, 1 mayúscula, 1 número | SecurePass1 |
| name | string | min 2, max 100 chars | María García |

### Processing
1. Validar formato de email (RFC 5321)
2. Validar fortaleza de password
3. Verificar que email no existe en tabla `users`
4. Hash password con bcrypt (cost factor 12)
5. Crear registro en tabla `users`
6. Crear registro en tabla `profiles`
7. Enviar email de verificación
8. Retornar user object (sin password)

### Output

**Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "maria@example.com",
    "name": "María García",
    "emailVerified": false,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
````

**Error (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Este email ya está registrado"
  }
}
```

### Validaciones de Negocio

- [ ] Email debe ser único en el sistema
- [ ] Password no puede ser igual al email
- [ ] Usuario debe verificar email en 24h o se elimina

```

---

### Paso 1.2: Crea FRs para todas las User Stories

**¿Qué hacer?**
Repite el proceso para cada US del MVP.

**Nomenclatura:**
```

FR-001, FR-002, FR-003...

````

**Organización sugerida:**

```markdown
# Functional Specifications

## EPIC-001: Authentication
- FR-001: Registro de usuario con email
- FR-002: Login con email y password
- FR-003: Logout
- FR-004: Recuperar contraseña

## EPIC-002: Profile Management
- FR-005: Ver perfil propio
- FR-006: Editar perfil
- FR-007: Cambiar contraseña

## EPIC-003: [Nombre]
- FR-008: ...
- FR-009: ...
````

**Archivo:** `.context/SRS/functional-specs.md`

---

## 📋 PARTE 2: Non-Functional Specifications

### ¿Qué es?

Requisitos de calidad que definen CÓMO debe comportarse el sistema (no QUÉ hace).

### Paso 2.1: Define métricas de Performance

**¿Qué hacer?**
Establece métricas cuantificables para tiempos de respuesta.

**¿Por qué?**
"Debe ser rápido" no es medible. "< 2 segundos" sí lo es.

```markdown
## 1. Performance

### Web Vitals (Core)

| Métrica                        | Target MVP | Target v2 | Cómo medir |
| ------------------------------ | ---------- | --------- | ---------- |
| LCP (Largest Contentful Paint) | < 2.5s     | < 1.5s    | Lighthouse |
| FID (First Input Delay)        | < 100ms    | < 50ms    | Lighthouse |
| CLS (Cumulative Layout Shift)  | < 0.1      | < 0.05    | Lighthouse |

### API Performance

| Métrica             | Target   | Notas                     |
| ------------------- | -------- | ------------------------- |
| Response Time (p50) | < 200ms  | Operaciones simples       |
| Response Time (p95) | < 500ms  | Incluye queries complejas |
| Response Time (p99) | < 1000ms | Edge cases                |

### Database

| Métrica              | Target        |
| -------------------- | ------------- |
| Query time (simple)  | < 50ms        |
| Query time (complex) | < 200ms       |
| Connection pool      | 20 conexiones |

### Capacity (MVP)

| Recurso          | Límite |
| ---------------- | ------ |
| Concurrent users | 100    |
| Requests/minute  | 1000   |
| Database size    | 10 GB  |
```

---

### Paso 2.2: Define requisitos de Security

**¿Qué hacer?**
Documenta cómo protegerás el sistema y los datos.

```markdown
## 2. Security

### Authentication

| Aspecto          | Implementación        |
| ---------------- | --------------------- |
| Método           | JWT via Supabase Auth |
| Token expiration | 1 hora                |
| Refresh token    | 7 días                |
| Session storage  | HttpOnly cookies      |

### Authorization

| Aspecto     | Implementación                   |
| ----------- | -------------------------------- |
| Modelo      | RBAC (Role-Based Access Control) |
| Roles       | user, admin                      |
| Enforcement | Middleware + RLS                 |

### Password Policy

| Requisito       | Valor                |
| --------------- | -------------------- |
| Longitud mínima | 8 caracteres         |
| Mayúsculas      | Al menos 1           |
| Números         | Al menos 1           |
| Símbolos        | Opcional             |
| Historial       | No repetir últimas 3 |

### Data Protection

| Capa       | Método             |
| ---------- | ------------------ |
| In Transit | TLS 1.3 (HTTPS)    |
| At Rest    | AES-256 (Supabase) |
| Passwords  | bcrypt (cost 12)   |

### OWASP Top 10 Mitigations

| Vulnerabilidad            | Mitigación                                |
| ------------------------- | ----------------------------------------- |
| Injection                 | Parameterized queries, input sanitization |
| Broken Auth               | Secure session management, MFA opcional   |
| XSS                       | Content Security Policy, output encoding  |
| CSRF                      | SameSite cookies, CSRF tokens             |
| Security Misconfiguration | Security headers, env variables           |
```

> 🔑 **OWASP:** Open Web Application Security Project - estándar de seguridad web

---

### Paso 2.3: Define Scalability y Reliability

```markdown
## 3. Scalability

### Arquitectura

| Componente | Estrategia                           |
| ---------- | ------------------------------------ |
| Frontend   | Static + Edge CDN (Vercel)           |
| API        | Stateless (horizontally scalable)    |
| Database   | PostgreSQL + Connection pooling      |
| Files      | Object storage (S3/Supabase Storage) |

### Caching

| Nivel   | Estrategia            | TTL      |
| ------- | --------------------- | -------- |
| Browser | Cache-Control headers | 1 hora   |
| CDN     | Edge caching          | 5 min    |
| API     | Redis (futuro)        | Variable |
| DB      | Query result caching  | 1 min    |

## 4. Reliability

| Métrica         | Target   | Cómo lograr      |
| --------------- | -------- | ---------------- |
| Uptime          | 99.9%    | Vercel managed   |
| Error rate      | < 0.1%   | Error monitoring |
| Recovery time   | < 15 min | Auto-scaling     |
| Data durability | 99.99%   | Supabase backups |

## 5. Monitoring

| Qué monitorear | Herramienta        |
| -------------- | ------------------ |
| Errors         | Sentry             |
| Performance    | Vercel Analytics   |
| Database       | Supabase Dashboard |
| Uptime         | UptimeRobot (free) |
```

---

### Paso 2.4: Define Accessibility y Browser Support

```markdown
## 6. Accessibility

### WCAG 2.1 Level AA

| Criterio            | Implementación                 |
| ------------------- | ------------------------------ |
| Color contrast      | Mínimo 4.5:1 para texto        |
| Keyboard navigation | Tab order lógico               |
| Screen readers      | ARIA labels                    |
| Focus indicators    | Visible en todos los elementos |
| Text resize         | Hasta 200% sin pérdida         |

## 7. Browser Support

### Desktop

| Browser | Versiones |
| ------- | --------- |
| Chrome  | Últimas 2 |
| Firefox | Últimas 2 |
| Safari  | Últimas 2 |
| Edge    | Últimas 2 |

### Mobile

| Browser        | Versiones |
| -------------- | --------- |
| iOS Safari     | Últimas 2 |
| Android Chrome | Últimas 2 |

### No soportado

- Internet Explorer
- Opera Mini
- Browsers con JS deshabilitado
```

**Archivo:** `.context/SRS/non-functional-specs.md`

---

## 📋 PARTE 3: Architecture Specifications

### ¿Qué es?

Diseño técnico del sistema: componentes, database, flujos de datos.

### Paso 3.1: Crea el System Architecture Diagram

**¿Qué hacer?**
Crea un diagrama C4 Level 1-2 del sistema.

**¿Por qué?**
Visualizar la arquitectura ayuda a entender cómo interactúan los componentes.

**C4 Model Levels:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    C4 MODEL LEVELS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Level 1: CONTEXT                                               │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Usuarios ←→ Sistema ←→ Sistemas externos           │       │
│  │  (vista de alto nivel, sin detalles técnicos)       │       │
│  └──────────────────────────────────────────────────────┘       │
│                           │                                     │
│                           ▼                                     │
│  Level 2: CONTAINERS                                            │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Web App ←→ API ←→ Database ←→ External Services    │       │
│  │  (aplicaciones, bases de datos, servicios)          │       │
│  └──────────────────────────────────────────────────────┘       │
│                           │                                     │
│                           ▼                                     │
│  Level 3: COMPONENTS (para fases posteriores)                   │
│  Level 4: CODE (para fases posteriores)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ejemplo de diagrama (ASCII):**

```
┌─────────────────────────────────────────────────────────────────┐
│                   SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      ┌─────────────┐                            │
│                      │   USERS     │                            │
│                      │  (Browser)  │                            │
│                      └──────┬──────┘                            │
│                             │ HTTPS                             │
│                             ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    VERCEL EDGE                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │              NEXT.JS 15 APPLICATION                │  │   │
│  │  │  ┌──────────────┐    ┌──────────────────────────┐  │  │   │
│  │  │  │   FRONTEND   │    │      API ROUTES          │  │  │   │
│  │  │  │   (React)    │◄──►│   (Server Actions)       │  │  │   │
│  │  │  │              │    │                          │  │  │   │
│  │  │  └──────────────┘    └────────────┬─────────────┘  │  │   │
│  │  └───────────────────────────────────┼────────────────┘  │   │
│  └──────────────────────────────────────┼───────────────────┘   │
│                                         │                       │
│                    ┌────────────────────┼────────────────────┐  │
│                    │                    ▼                    │  │
│                    │  ┌─────────────────────────────────┐    │  │
│                    │  │           SUPABASE              │    │  │
│                    │  │  ┌───────────┐ ┌─────────────┐  │    │  │
│                    │  │  │PostgreSQL │ │    Auth     │  │    │  │
│                    │  │  │ + RLS     │ │   (JWT)     │  │    │  │
│                    │  │  └───────────┘ └─────────────┘  │    │  │
│                    │  │  ┌───────────┐ ┌─────────────┐  │    │  │
│                    │  │  │  Storage  │ │  Realtime   │  │    │  │
│                    │  │  │  (Files)  │ │ (WebSocket) │  │    │  │
│                    │  │  └───────────┘ └─────────────┘  │    │  │
│                    │  └─────────────────────────────────┘    │  │
│                    │              SUPABASE CLOUD             │  │
│                    └─────────────────────────────────────────┘  │
│                                                                 │
│  EXTERNAL SERVICES                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Jira     │  │   Stripe   │  │  Resend    │                │
│  │   (API)    │  │ (Payments) │  │  (Email)   │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Paso 3.2: Diseña el Entity-Relationship Diagram (ERD)

**¿Qué hacer?**
Diseña las tablas y relaciones de la base de datos.

**¿Por qué?**
El ERD es el blueprint de tu data model. Afecta todo el desarrollo.

**Notación:**

```
┌────────────────────────────────────────────────────────────┐
│                    ERD NOTATION                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  RELACIONES:                                               │
│                                                            │
│  1:1   ────────────  Uno a uno                            │
│  1:N   ────────<     Uno a muchos                          │
│  N:M   >───────<     Muchos a muchos (requiere tabla join)│
│                                                            │
│  SÍMBOLOS:                                                 │
│                                                            │
│  PK    Primary Key (llave primaria)                        │
│  FK    Foreign Key (llave foránea)                         │
│  UK    Unique Key (valor único)                            │
│  NN    Not Null (valor obligatorio)                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Ejemplo de ERD (ASCII):**

```
┌─────────────────────────────────────────────────────────────────┐
│                        ERD - MVP                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐           ┌─────────────────┐              │
│  │     USERS       │           │    PROFILES     │              │
│  ├─────────────────┤           ├─────────────────┤              │
│  │ PK id: uuid     │───1:1────►│ PK id: uuid     │              │
│  │    email: text  │           │ FK user_id: uuid│              │
│  │    created_at   │           │    name: text   │              │
│  │    updated_at   │           │    avatar_url   │              │
│  └────────┬────────┘           │    bio: text    │              │
│           │                    │    created_at   │              │
│           │                    └─────────────────┘              │
│           │                                                     │
│           │ 1:N                                                 │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐           ┌─────────────────┐              │
│  │    PROJECTS     │           │   TEST_CASES    │              │
│  ├─────────────────┤           ├─────────────────┤              │
│  │ PK id: uuid     │───1:N────►│ PK id: uuid     │              │
│  │ FK owner_id: uuid           │ FK project_id   │              │
│  │    name: text   │           │    title: text  │              │
│  │    description  │           │    steps: jsonb │              │
│  │    created_at   │           │    status: enum │              │
│  │    updated_at   │           │    priority     │              │
│  └─────────────────┘           │    created_at   │              │
│                                └─────────────────┘              │
│                                                                 │
│  ENUM: test_status = (draft, ready, executed, passed, failed)  │
│  ENUM: priority = (low, medium, high, critical)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Paso 3.3: Justifica el Tech Stack

**¿Qué hacer?**
Documenta por qué elegiste cada tecnología.

```markdown
## Tech Stack Justification

### Frontend: Next.js 15 (App Router)

| Aspecto      | Detalle                                     |
| ------------ | ------------------------------------------- |
| ✅ Ventaja   | React Server Components = mejor performance |
| ✅ Ventaja   | File-based routing = DX mejorada            |
| ✅ Ventaja   | Full-stack = API routes integrados          |
| ❌ Trade-off | Curva de aprendizaje App Router             |

### Database: Supabase (PostgreSQL)

| Aspecto      | Detalle                                        |
| ------------ | ---------------------------------------------- |
| ✅ Ventaja   | PostgreSQL robusto + Row Level Security        |
| ✅ Ventaja   | Auth, Storage, Realtime incluidos              |
| ✅ Ventaja   | Generous free tier para MVP                    |
| ❌ Trade-off | Vendor lock-in (mitigado: PostgreSQL estándar) |

### Hosting: Vercel

| Aspecto      | Detalle                         |
| ------------ | ------------------------------- |
| ✅ Ventaja   | Edge Network global             |
| ✅ Ventaja   | Preview deployments automáticos |
| ✅ Ventaja   | Zero-config para Next.js        |
| ❌ Trade-off | Costos escalan con tráfico      |

### Styling: Tailwind CSS

| Aspecto      | Detalle                           |
| ------------ | --------------------------------- |
| ✅ Ventaja   | Utility-first = desarrollo rápido |
| ✅ Ventaja   | Purge CSS = bundle pequeño        |
| ❌ Trade-off | HTML puede verse verbose          |
```

---

### Paso 3.4: Documenta Security Architecture

```markdown
## Security Architecture

### Authentication Flow
```

┌─────────────────────────────────────────────────────────────────┐
│ AUTH FLOW (Login) │
├─────────────────────────────────────────────────────────────────┤
│ │
│ USER FRONTEND API SUPABASE │
│ │ │ │ │ │
│ │──[credentials]──►│ │ │ │
│ │ │──[POST /auth]─►│ │ │
│ │ │ │──[signIn]────►│ │
│ │ │ │◄──[JWT]───────│ │
│ │ │◄──[Set Cookie]─│ │ │
│ │◄──[Redirect]──────│ │ │ │
│ │ │ │ │ │
└─────────────────────────────────────────────────────────────────┘

````

### RBAC Implementation

| Role | Permisos |
|------|----------|
| user | CRUD propios recursos |
| admin | CRUD todos los recursos |

### RLS Policies (Supabase)

```sql
-- Ejemplo: Users solo ven sus proyectos
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = owner_id);

-- Ejemplo: Users pueden crear proyectos
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = owner_id);
````

````

**Archivo:** `.context/SRS/architecture-specs.md`

---

## 📋 PARTE 4: API Contracts

### ¿Qué es?

Especificación formal de todos los endpoints de la API en formato OpenAPI 3.0.

### Paso 4.1: Define la estructura base

**¿Qué hacer?**
Crea el skeleton del archivo OpenAPI.

```yaml
# api-contracts.yaml
openapi: 3.0.3
info:
  title: [Nombre del Proyecto] API
  description: API para [descripción breve]
  version: 1.0.0

servers:
  - url: http://localhost:3000
    description: Development
  - url: https://staging.example.com
    description: Staging
  - url: https://api.example.com
    description: Production

tags:
  - name: Auth
    description: Authentication endpoints
  - name: Users
    description: User management
  - name: Projects
    description: Project operations
````

---

### Paso 4.2: Documenta cada endpoint

**Formato por endpoint:**

```yaml
paths:
  /api/auth/register:
    post:
      tags:
        - Auth
      summary: Register new user
      description: Creates a new user account with email and password
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
                - name
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  minLength: 8
                  example: SecurePass123
                name:
                  type: string
                  minLength: 2
                  maxLength: 100
                  example: María García
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          description: Validation error or email exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
```

---

### Paso 4.3: Define componentes reutilizables

```yaml
components:
  schemas:
    # Success response wrapper
    SuccessResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object

    # Error response wrapper
    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: VALIDATION_ERROR
            message:
              type: string
              example: Email format is invalid

    # User object
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        emailVerified:
          type: boolean
        createdAt:
          type: string
          format: date-time

    # User response (wrapped)
    UserResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          $ref: '#/components/schemas/User'

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

### Paso 4.4: Lista todos los endpoints

**Checklist de endpoints típicos:**

```markdown
## Endpoints a documentar

### Auth (/api/auth/\*)

- [ ] POST /register - Crear usuario
- [ ] POST /login - Iniciar sesión
- [ ] POST /logout - Cerrar sesión
- [ ] POST /forgot-password - Solicitar reset
- [ ] POST /reset-password - Cambiar password
- [ ] GET /me - Obtener usuario actual

### Users (/api/users/\*)

- [ ] GET /:id - Obtener usuario
- [ ] PATCH /:id - Actualizar usuario
- [ ] DELETE /:id - Eliminar usuario

### Projects (/api/projects/\*)

- [ ] GET / - Listar proyectos
- [ ] POST / - Crear proyecto
- [ ] GET /:id - Obtener proyecto
- [ ] PATCH /:id - Actualizar proyecto
- [ ] DELETE /:id - Eliminar proyecto

### [Otros recursos específicos de tu app]

- [ ] ...
```

**Archivo:** `.context/SRS/api-contracts.yaml`

---

## 📋 Checklist Final del SRS

### Functional Specs

- [ ] Cada User Story tiene un FR correspondiente
- [ ] Inputs tienen tipos y validaciones
- [ ] Processing describe la lógica paso a paso
- [ ] Outputs incluyen success y error responses
- [ ] Validaciones de negocio están documentadas

### Non-Functional Specs

- [ ] Performance tiene métricas cuantificables
- [ ] Security cubre auth, authorization, encryption
- [ ] Scalability tiene estrategia definida
- [ ] Accessibility cumple WCAG 2.1 AA
- [ ] Browser support está documentado

### Architecture Specs

- [ ] System diagram muestra todos los componentes
- [ ] ERD incluye todas las tablas y relaciones
- [ ] Tech stack tiene justificación por cada elección
- [ ] Security architecture documenta auth flow y RBAC

### API Contracts

- [ ] OpenAPI 3.0 válido
- [ ] Todos los endpoints documentados
- [ ] Request/Response schemas definidos
- [ ] Error responses estandarizados
- [ ] Security schemes configurados

---

## 📚 Estructura de Archivos Final

```
.context/SRS/
├── functional-specs.md      # FRs por cada User Story
├── non-functional-specs.md  # Performance, security, etc.
├── architecture-specs.md    # Diagramas y diseño
└── api-contracts.yaml       # OpenAPI 3.0 spec
```

---

## 🎓 Recursos Adicionales

**OpenAPI:**

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger Editor](https://editor.swagger.io/) - Editor online
- [Stoplight Studio](https://stoplight.io/studio) - GUI para OpenAPI

**Diagramas:**

- [C4 Model](https://c4model.com/) - Framework de arquitectura
- [Mermaid Live Editor](https://mermaid.live/) - Diagramas en código
- [Draw.io](https://draw.io/) - Diagramas visuales

**Database Design:**

- [dbdiagram.io](https://dbdiagram.io/) - ERD online
- [Supabase Schema Visualizer](https://supabase.com/dashboard) - En el dashboard

---

## ❓ Preguntas Frecuentes

**P: ¿Cuánto detalle deben tener los FRs?**
R: Lo suficiente para que un developer pueda implementar sin preguntas de "qué" hacer. El "cómo" lo decide el developer.

**P: ¿Debo documentar TODOS los endpoints?**
R: Sí para el MVP. Es mejor tener documentación que descubrir inconsistencias en producción.

**P: ¿Puedo usar Mermaid en lugar de ASCII para diagramas?**
R: Sí. Mermaid es mejor si tu herramienta lo soporta. ASCII funciona en cualquier lugar.

**P: ¿El ERD debe incluir tablas de Supabase Auth?**
R: No las custom tables de auth (esas las maneja Supabase). Sí incluye tu tabla `profiles` y cualquier relación con `auth.users`.

---

**Fase 2 completa.** Siguiente: Fase 3 - Infrastructure (setup técnico)
