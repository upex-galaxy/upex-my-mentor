# API Testing Guide - Supabase + Next.js

Esta guia cubre todas las estrategias de API Testing para proyectos que usan **Supabase** (PostgreSQL + PostgREST) y **Next.js** (API Routes), incluyendo testing manual, automatizado y asistido por IA.

---

## Configuracion del Proyecto

Antes de usar esta guia, configura las siguientes variables de entorno en tu proyecto:

```bash
# .env.local o .env.test

# Supabase
NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}
# Ejemplo: https://abcdefghijklmnop.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}
# Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs...

# Usuarios de prueba (crear en Supabase Auth)
TEST_USER_EMAIL={{TEST_USER_EMAIL}}
# Ejemplo: test.user@tuproyecto.com

TEST_USER_PASSWORD={{TEST_USER_PASSWORD}}
# Ejemplo: TestPassword123!

TEST_ADMIN_EMAIL={{TEST_ADMIN_EMAIL}}
# Ejemplo: test.admin@tuproyecto.com

TEST_ADMIN_PASSWORD={{TEST_ADMIN_PASSWORD}}
# Ejemplo: AdminPassword123!
```

---

## Tabla de Contenidos

| Documento                                     | Descripcion                                            | Nivel       |
| --------------------------------------------- | ------------------------------------------------------ | ----------- |
| [Arquitectura](./architecture.md)             | Vision general de las 2 APIs (Supabase REST + Next.js) | Fundamental |
| [Autenticacion](./authentication.md)          | Como usar UN token para ambas APIs                     | Fundamental |
| [DevTools Testing](./devtools-testing.md)     | Testing manual interceptando requests en el navegador  | Basico      |
| [Postman Testing](./postman-testing.md)       | Testing manual con colecciones y environments          | Intermedio  |
| [MCP Testing](./mcp-testing.md)               | Testing asistido por IA usando OpenAPI/SQL MCP         | Intermedio  |
| [Postman MCP](./mcp-postman.md)               | Testing asistido por IA usando Postman MCP oficial     | Intermedio  |
| [Playwright Testing](./playwright-testing.md) | Testing automatizado con arquitectura KATA             | Avanzado    |

---

## Arquitectura de la API

Este tipo de proyectos utiliza **dos tipos de APIs**:

### 1. Supabase REST API (PostgREST)

```
Cliente --> PostgREST --> PostgreSQL + RLS Policies
```

- **Base URL:** `{{SUPABASE_URL}}/rest/v1/`
  - Ejemplo: `https://abcdefghijklmnop.supabase.co/rest/v1/`
- **Endpoints:** Auto-generados desde el schema de la DB
- **Autenticacion:** `apikey` header + `Authorization: Bearer <jwt>` para operaciones autenticadas
- **Seguridad:** Row Level Security (RLS) policies en PostgreSQL

**Ejemplo de tablas tipicas:**

| Endpoint    | Descripcion           |
| ----------- | --------------------- |
| `/users`    | Perfiles de usuarios  |
| `/products` | Catalogo de productos |
| `/orders`   | Pedidos/ordenes       |
| `/reviews`  | Resenas de productos  |
| `/payments` | Transacciones de pago |

### 2. Next.js API Routes (Custom)

```
Cliente --> Next.js API --> Logica de Negocio --> Supabase/Stripe/Email
```

- **Base URL:** `http://localhost:3000/api/` (dev) o `https://[domain]/api/` (prod)
- **Endpoints:** Definidos manualmente para logica compleja

**Ejemplo de endpoints custom tipicos:**

| Metodo | Endpoint                          | Descripcion             |
| ------ | --------------------------------- | ----------------------- |
| POST   | `/api/checkout/session`           | Crear sesion de pago    |
| POST   | `/api/orders/[id]/cancel`         | Cancelar un pedido      |
| GET    | `/api/orders/[id]/tracking`       | Obtener estado de envio |
| GET    | `/api/products/[id]/availability` | Verificar stock         |
| POST   | `/api/webhooks/stripe`            | Webhook de Stripe       |
| POST   | `/api/webhooks/shipping`          | Webhook de envios       |

---

## Autenticacion y Tokens

### Conceptos Clave

| Concepto             | Descripcion                                                 |
| -------------------- | ----------------------------------------------------------- |
| **anon key**         | Clave publica para acceso anonimo. Limitado por RLS.        |
| **service_role key** | Clave privada que bypasea RLS. SOLO backend.                |
| **User JWT**         | Token del usuario autenticado. Contiene `user_id` y `role`. |
| **RLS Policies**     | Reglas en PostgreSQL que controlan acceso por usuario.      |

### Flujo de Autenticacion

```bash
# 1. Login - Obtener JWT del usuario
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=password
# Ejemplo: POST https://abcdefghijklmnop.supabase.co/auth/v1/token?grant_type=password

Content-Type: application/json
apikey: {{SUPABASE_ANON_KEY}}

{
  "email": "user@example.com",
  "password": "password123"
}

# Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",  # <-- Este es el JWT
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid-del-usuario",
    "email": "user@example.com",
    ...
  }
}
```

```bash
# 2. Usar el JWT en requests autenticados
GET {{SUPABASE_URL}}/rest/v1/orders
# Ejemplo: GET https://abcdefghijklmnop.supabase.co/rest/v1/orders

apikey: {{SUPABASE_ANON_KEY}}
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# RLS aplica: solo veras TUS ordenes (donde user_id = tu user_id)
```

### Headers Requeridos

| Header          | Valor                   | Cuando                                    |
| --------------- | ----------------------- | ----------------------------------------- |
| `apikey`        | `{{SUPABASE_ANON_KEY}}` | Siempre (Supabase REST)                   |
| `Authorization` | `Bearer <JWT>`          | Operaciones autenticadas                  |
| `Content-Type`  | `application/json`      | POST/PATCH requests                       |
| `Prefer`        | `return=representation` | Para recibir el objeto creado/actualizado |

---

## Quick Reference: Estructura de Requests

### Request Anonimo (lectura publica)

```bash
GET /rest/v1/products?category=eq.electronics&select=id,name,price,image_url
Headers:
  apikey: {{SUPABASE_ANON_KEY}}
```

### Request Autenticado (como usuario)

```bash
POST /rest/v1/reviews
Headers:
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer <USER_JWT>
  Content-Type: application/json
  Prefer: return=representation
Body:
  {"product_id": "...", "rating": 5, "comment": "Excelente producto!"}
```

### Request a API Route (Next.js)

```bash
POST /api/orders/abc123/cancel
Headers:
  Content-Type: application/json
  Cookie: <session_cookies>  # Manejado por el navegador
Body:
  {"reason": "Changed my mind"}
```

---

## Ambientes

| Ambiente    | Web URL                                  | API URL                     |
| ----------- | ---------------------------------------- | --------------------------- |
| Development | `http://localhost:3000`                  | `http://localhost:3000/api` |
| Staging     | `https://{{PROJECT}}-staging.vercel.app` | Mismo + `/api`              |
| Production  | `https://{{PROJECT}}.vercel.app`         | Mismo + `/api`              |

---

## Siguiente Paso

Elige la guia que mejor se adapte a tu necesidad:

- **Entender la arquitectura?** --> [architecture.md](./architecture.md)
- **Entender autenticacion?** --> [authentication.md](./authentication.md)
- **Debugging en el navegador?** --> [devtools-testing.md](./devtools-testing.md)
- **Crear colecciones reutilizables?** --> [postman-testing.md](./postman-testing.md)
- **Testing con IA (OpenAPI/SQL)?** --> [mcp-testing.md](./mcp-testing.md)
- **Testing con IA (Postman MCP)?** --> [mcp-postman.md](./mcp-postman.md)
- **Automatizacion con codigo?** --> [playwright-testing.md](./playwright-testing.md)

---

## Ver Tambien

- [UI Guide](../ui-guide/README.md) - Testing de UI con Playwright
- [Database Guide](../database-guide/README.md) - Testing de base de datos
- [Project Management Guide](../project-management-guide/README.md) - Jira y GitHub
- [Monitoring Guide](../monitoring-guide/README.md) - Sentry y Slack
- [Research Guide](../research-guide/README.md) - Context7 y Tavily
