# API Testing Guide - Upex My Mentor

Esta guía cubre todas las estrategias de API Testing para el proyecto Upex My Mentor, incluyendo testing manual, automatizado y asistido por IA.

---

## Tabla de Contenidos

1. [Arquitectura de la API](#arquitectura-de-la-api)
2. [Autenticación y Tokens](#autenticación-y-tokens)
3. [Guías de Testing](#guías-de-testing)
4. [Recursos y URLs](#recursos-y-urls)

---

## Arquitectura de la API

Este proyecto utiliza **dos tipos de APIs**:

### 1. Supabase REST API (PostgREST)

```
Cliente → PostgREST → PostgreSQL + RLS Policies
```

- **Base URL:** `https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/`
- **Endpoints:** Auto-generados desde el schema de la DB
- **Autenticación:** `apikey` header + `Authorization: Bearer <jwt>` para operaciones autenticadas
- **Seguridad:** Row Level Security (RLS) policies en PostgreSQL

**Tablas principales:**
| Endpoint | Descripción |
|----------|-------------|
| `/profiles` | Perfiles de usuarios (mentores y estudiantes) |
| `/bookings` | Reservas de sesiones de mentoría |
| `/reviews` | Reseñas de mentores |
| `/conversations` | Hilos de mensajes |
| `/messages` | Mensajes individuales |
| `/mentor_availability` | Disponibilidad de mentores |
| `/transactions` | Transacciones de pago |

### 2. Next.js API Routes (Custom)

```
Cliente → Next.js API → Lógica de Negocio → Supabase/Stripe/Email
```

- **Base URL:** `http://localhost:3000/api/` (dev) o `https://[domain]/api/` (prod)
- **Endpoints:** Definidos manualmente para lógica compleja

**Endpoints disponibles:**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/checkout/session` | Crear sesión de pago Stripe |
| POST | `/api/bookings/[id]/cancel` | Cancelar una reserva |
| GET | `/api/bookings/[id]/meeting-link` | Obtener link de videollamada |
| GET | `/api/mentors/[id]/availability` | Disponibilidad de un mentor |
| GET | `/api/messages/unread-count` | Contar mensajes no leídos |
| POST | `/api/stripe/connect/onboard` | Onboarding de Stripe Connect |
| GET | `/api/stripe/connect/status` | Estado de cuenta Stripe |
| POST | `/api/stripe/webhook` | Webhook de Stripe |

---

## Autenticación y Tokens

### Conceptos Clave

| Concepto | Descripción |
|----------|-------------|
| **anon key** | Clave pública para acceso anónimo. Limitado por RLS. |
| **service_role key** | Clave privada que bypasea RLS. SOLO backend. |
| **User JWT** | Token del usuario autenticado. Contiene `user_id` y `role`. |
| **RLS Policies** | Reglas en PostgreSQL que controlan acceso por usuario. |

### Flujo de Autenticación

```bash
# 1. Login - Obtener JWT del usuario
POST https://ionevzckjyxtpmyenbxc.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json
apikey: <ANON_KEY>

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
GET https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/bookings
apikey: <ANON_KEY>
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# RLS aplica: solo verás TUS bookings (donde student_id o mentor_id = tu user_id)
```

### Headers Requeridos

| Header | Valor | Cuándo |
|--------|-------|--------|
| `apikey` | `<ANON_KEY>` | Siempre (Supabase REST) |
| `Authorization` | `Bearer <JWT>` | Operaciones autenticadas |
| `Content-Type` | `application/json` | POST/PATCH requests |
| `Prefer` | `return=representation` | Para recibir el objeto creado/actualizado |

---

## Guías de Testing

| Guía | Descripción | Archivo |
|------|-------------|---------|
| **System Architecture** | Visión general de las 2 APIs y 14 endpoints custom | [system-architecture.md](./system-architecture.md) |
| **Authentication Guide** | Cómo usar UN token para ambas APIs (Supabase + Next.js) | [authentication-guide.md](./authentication-guide.md) |
| **DevTools** | Testing manual interceptando requests en el navegador | [devtools-testing.md](./devtools-testing.md) |
| **Postman** | Testing manual con colecciones y environments | [postman-testing.md](./postman-testing.md) |
| **MCP (IA)** | Testing asistido por IA usando MCP tools | [mcp-testing.md](./mcp-testing.md) |
| **Playwright** | Testing automatizado con arquitectura KATA | [playwright-testing.md](./playwright-testing.md) |

---

## Recursos y URLs

### Ambientes

| Ambiente | Web URL | API URL |
|----------|---------|---------|
| Development | `http://localhost:3000` | `http://localhost:3000/api` |
| Staging | `https://upex-my-mentor-git-staging-upex-galaxy.vercel.app` | Mismo + `/api` |
| Production | `https://upex-my-mentor.vercel.app` | Mismo + `/api` |

### Supabase

| Recurso | URL |
|---------|-----|
| REST API | `https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/` |
| Auth API | `https://ionevzckjyxtpmyenbxc.supabase.co/auth/v1/` |
| API Docs (Redoc) | `/api-docu` (solo dev/staging) |
| Dashboard | `https://supabase.com/dashboard/project/ionevzckjyxtpmyenbxc` |

### Credenciales de Prueba

```bash
# Mentor Demo
Email: mentor.demo@upexmymentor.com
Password: Demo123!

# Estudiante Demo
Email: student.demo@upexmymentor.com
Password: Demo123!
```

### Variables de Entorno para Testing

```bash
# .env.test o .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ionevzckjyxtpmyenbxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Test users
TEST_MENTOR_EMAIL=mentor.demo@upexmymentor.com
TEST_MENTOR_PASSWORD=Demo123!
TEST_STUDENT_EMAIL=student.demo@upexmymentor.com
TEST_STUDENT_PASSWORD=Demo123!
```

---

## Quick Reference: Estructura de Requests

### Request Anónimo (lectura pública)
```bash
GET /rest/v1/profiles?role=eq.mentor&select=id,name,photo_url
Headers:
  apikey: <ANON_KEY>
```

### Request Autenticado (como usuario)
```bash
POST /rest/v1/reviews
Headers:
  apikey: <ANON_KEY>
  Authorization: Bearer <USER_JWT>
  Content-Type: application/json
  Prefer: return=representation
Body:
  {"mentor_id": "...", "rating": 5, "comment": "Excelente!"}
```

### Request a API Route (Next.js)
```bash
POST /api/bookings/abc123/cancel
Headers:
  Content-Type: application/json
  Cookie: <session_cookies>  # Manejado por el navegador
Body:
  {"reason": "Schedule conflict"}
```

---

## Siguiente Paso

Elige la guía que mejor se adapte a tu necesidad:

- **¿Debugging en el navegador?** → [DevTools Testing](./devtools-testing.md)
- **¿Crear colecciones reutilizables?** → [Postman Testing](./postman-testing.md)
- **¿Testing con IA/Claude?** → [MCP Testing](./mcp-testing.md)
- **¿Automatización con código?** → [Playwright Testing](./playwright-testing.md)
