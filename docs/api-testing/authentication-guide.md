# Authentication Guide - Unified Token Strategy

> Cómo usar UN SOLO TOKEN para autenticarte en ambas APIs (Supabase REST y Next.js API Routes).

---

## Concepto Clave

El JWT de Supabase es **el mismo token** para todo. Solo cambia cómo se transporta:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UN TOKEN, DOS FORMAS DE USARLO                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SUPABASE REST API          │         NEXT.JS API ROUTES                  │
│   (/rest/v1/*)               │         (/api/*)                            │
│                              │                                             │
│   Header:                    │         Cookie:                             │
│   Authorization: Bearer JWT  │         sb-xxx-auth-token = base64(JWT)     │
│                              │                                             │
│   ────────────────────────────────────────────────────────────────────     │
│                              │                                             │
│               ES EL MISMO JWT, SOLO CAMBIA EL TRANSPORTE                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Paso 1: Obtener el Token (Login via API)

### Request

```http
POST https://ionevzckjyxtpmyenbxc.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "email": "student.demo@upexmymentor.com",
  "password": "Demo123!"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzAzMTIzNDU2LCJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InN0dWRlbnQuZGVtb0B1cGV4bXltZW50b3IuY29tIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQifQ.xxx",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1703123456,
  "refresh_token": "abc123...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student.demo@upexmymentor.com",
    "user_metadata": {
      "name": "Alex García",
      "role": "student"
    }
  }
}
```

**Guardar:**
- `access_token` → Para usar en requests
- `user.id` → Para filtros y validaciones
- `refresh_token` → Para renovar el token cuando expire

---

## Paso 2: Usar el Token en Supabase REST API

### Headers Requeridos

```http
GET https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/bookings?student_id=eq.550e8400-e29b-41d4-a716-446655440000
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  <-- ANON KEY (siempre)
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  <-- ACCESS TOKEN del login
```

### Ejemplo cURL

```bash
curl -X GET \
  'https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/bookings?student_id=eq.550e8400-e29b-41d4-a716-446655440000' \
  -H 'apikey: <ANON_KEY>' \
  -H 'Authorization: Bearer <ACCESS_TOKEN>'
```

### Ejemplo JavaScript

```javascript
const response = await fetch(
  'https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/bookings?student_id=eq.550e8400-e29b-41d4-a716-446655440000',
  {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${accessToken}`
    }
  }
)
```

---

## Paso 3: Usar el Token en Next.js API Routes

Los endpoints de Next.js (`/api/*`) esperan el token en una **cookie**, no en un header.

### Estructura de la Cookie

```
Nombre: sb-ionevzckjyxtpmyenbxc-auth-token
Valor:  base64(JSON con el token)
```

### Contenido del JSON (antes de base64)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "abc123...",
  "expires_at": 1703123456,
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student.demo@upexmymentor.com"
  }
}
```

### Ejemplo: Crear la Cookie Manualmente

```javascript
// 1. Construir el objeto del token
const tokenData = {
  access_token: accessToken,
  refresh_token: refreshToken,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: userId,
    email: userEmail
  }
}

// 2. Codificar en base64
const cookieValue = btoa(JSON.stringify(tokenData))

// 3. El nombre de la cookie
const cookieName = 'sb-ionevzckjyxtpmyenbxc-auth-token'
```

### Ejemplo cURL con Cookie

```bash
# Primero, construir el valor de la cookie (base64 del JSON)
TOKEN_JSON='{"access_token":"eyJ...","refresh_token":"abc...","expires_at":1703123456,"token_type":"bearer","user":{"id":"550e...","email":"student@..."}}'
COOKIE_VALUE=$(echo -n "$TOKEN_JSON" | base64)

# Luego, hacer el request
curl -X GET \
  'http://localhost:3000/api/messages/unread-count' \
  -H "Cookie: sb-ionevzckjyxtpmyenbxc-auth-token=$COOKIE_VALUE"
```

---

## Paso 4: Usar en Postman

### Para Supabase REST API

1. En **Headers**, agregar:
   - `apikey`: `{{anon_key}}`
   - `Authorization`: `Bearer {{access_token}}`

2. Usar el request de Login para obtener y guardar el token automáticamente (ver [postman-testing.md](./postman-testing.md))

### Para Next.js API Routes

1. En **Headers**, agregar:
   - `Cookie`: `sb-ionevzckjyxtpmyenbxc-auth-token={{cookie_value}}`

2. Crear un Pre-request Script para construir la cookie:

```javascript
// Pre-request Script en Postman
const tokenData = {
  access_token: pm.environment.get('access_token'),
  refresh_token: pm.environment.get('refresh_token'),
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: pm.environment.get('user_id'),
    email: pm.environment.get('user_email')
  }
}

const cookieValue = btoa(JSON.stringify(tokenData))
pm.environment.set('cookie_value', cookieValue)
```

---

## Paso 5: Usar en Playwright

### Concepto

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE AUTENTICACIÓN EN PLAYWRIGHT                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. Login via API Request (request fixture)                               │
│      └── Obtener access_token, refresh_token, user_id                      │
│                                                                             │
│   2. Inyectar Cookie en Browser Context                                     │
│      └── page.context().addCookies([...])                                  │
│                                                                             │
│   3. Ahora puedes:                                                          │
│      ├── Navegar en UI (cookies van automáticamente)                       │
│      ├── Hacer requests a /rest/v1/* (con Authorization header)            │
│      └── Hacer requests a /api/* (cookies van automáticamente)             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pasos en Código (Pseudocódigo)

```typescript
// 1. Login via API
const loginResponse = await request.post('/auth/v1/token?grant_type=password', {
  headers: { apikey: ANON_KEY },
  data: { email, password }
})
const { access_token, refresh_token, user } = await loginResponse.json()

// 2. Construir cookie
const cookieData = {
  access_token,
  refresh_token,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: { id: user.id, email: user.email }
}
const cookieValue = Buffer.from(JSON.stringify(cookieData)).toString('base64')

// 3. Inyectar en browser
await page.context().addCookies([{
  name: 'sb-ionevzckjyxtpmyenbxc-auth-token',
  value: cookieValue,
  domain: 'localhost',
  path: '/'
}])

// 4. Ahora el browser está autenticado!
await page.goto('/dashboard')  // Ya estás logueado, sin pasar por /login

// 5. Para requests API en el mismo test:
//    - Supabase REST: usar access_token en header
//    - Next.js API: las cookies ya están, van automáticamente via page.request
```

---

## Tabla Resumen

| API | Método de Auth | Cómo Enviar |
|-----|----------------|-------------|
| **Supabase REST** (`/rest/v1/*`) | Header | `Authorization: Bearer <access_token>` |
| **Next.js API** (`/api/*`) | Cookie | `sb-ionevzckjyxtpmyenbxc-auth-token=<base64>` |
| **Browser (UI)** | Cookie | Misma cookie, se envía automáticamente |

---

## Credenciales de Prueba

| Usuario | Email | Password |
|---------|-------|----------|
| **Estudiante** | `student.demo@upexmymentor.com` | `Demo123!` |
| **Mentor** | `mentor.demo@upexmymentor.com` | `Demo123!` |

---

## Refresh Token (Renovar Sesión)

Cuando el `access_token` expire (1 hora por defecto), usar el `refresh_token`:

```http
POST https://ionevzckjyxtpmyenbxc.supabase.co/auth/v1/token?grant_type=refresh_token
Content-Type: application/json
apikey: <ANON_KEY>

{
  "refresh_token": "abc123..."
}
```

Response: Nuevo `access_token` y `refresh_token`.

---

## Verificar Token (Debug)

Para ver qué contiene un JWT, decodificarlo en https://jwt.io o:

```javascript
// Decodificar payload del JWT (sin verificar firma)
const [header, payload, signature] = accessToken.split('.')
const decoded = JSON.parse(atob(payload))
console.log(decoded)
// { sub: "user-id", email: "...", exp: 1703123456, ... }
```

---

## Siguiente Paso

- Para testing manual con UI: [devtools-testing.md](./devtools-testing.md)
- Para testing con Postman: [postman-testing.md](./postman-testing.md)
- Para testing automatizado: [playwright-testing.md](./playwright-testing.md)
