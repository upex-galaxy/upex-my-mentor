# Autenticacion - Estrategia de Token Unificado

> Como usar UN SOLO TOKEN para autenticarte en ambas APIs (Supabase REST y Next.js API Routes).

---

## Concepto Clave

El JWT de Supabase es **el mismo token** para todo. Solo cambia como se transporta:

```
+-----------------------------------------------------------------------------+
|                      UN TOKEN, DOS FORMAS DE USARLO                          |
+-----------------------------------------------------------------------------+
|                                                                             |
|   SUPABASE REST API          |         NEXT.JS API ROUTES                  |
|   (/rest/v1/*)               |         (/api/*)                            |
|                              |                                             |
|   Header:                    |         Cookie:                             |
|   Authorization: Bearer JWT  |         sb-xxx-auth-token = base64(JWT)     |
|                              |                                             |
|   --------------------------------------------------------------------     |
|                              |                                             |
|               ES EL MISMO JWT, SOLO CAMBIA EL TRANSPORTE                   |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## Paso 1: Obtener el Token (Login via API)

### Request

```http
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=password
# Ejemplo: POST https://abcdefghijklmnop.supabase.co/auth/v1/token?grant_type=password

Content-Type: application/json
apikey: {{SUPABASE_ANON_KEY}}
# Ejemplo: apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "email": "{{TEST_USER_EMAIL}}",
  "password": "{{TEST_USER_PASSWORD}}"
}
# Ejemplo:
# {
#   "email": "test.user@miproyecto.com",
#   "password": "TestPassword123!"
# }
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzAzMTIzNDU2LCJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InRlc3QudXNlckBtaXByb3llY3RvLmNvbSIsInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.xxx",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1703123456,
  "refresh_token": "abc123...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test.user@miproyecto.com",
    "user_metadata": {
      "name": "Test User",
      "role": "customer"
    }
  }
}
```

**Guardar:**

- `access_token` --> Para usar en requests
- `user.id` --> Para filtros y validaciones
- `refresh_token` --> Para renovar el token cuando expire

---

## Paso 2: Usar el Token en Supabase REST API

### Headers Requeridos

```http
GET {{SUPABASE_URL}}/rest/v1/orders?user_id=eq.550e8400-e29b-41d4-a716-446655440000
# Ejemplo: GET https://abcdefghijklmnop.supabase.co/rest/v1/orders?user_id=eq.550e8400-...

apikey: {{SUPABASE_ANON_KEY}}           # <-- ANON KEY (siempre)
Authorization: Bearer {{ACCESS_TOKEN}}  # <-- ACCESS TOKEN del login
```

### Ejemplo cURL

```bash
curl -X GET \
  '{{SUPABASE_URL}}/rest/v1/orders?user_id=eq.550e8400-e29b-41d4-a716-446655440000' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}'

# Ejemplo real:
# curl -X GET \
#   'https://abcdefghijklmnop.supabase.co/rest/v1/orders?user_id=eq.550e8400-...' \
#   -H 'apikey: eyJhbGciOiJIUzI1NiIs...' \
#   -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Ejemplo JavaScript

```javascript
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}`, {
  headers: {
    apikey: ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
  },
});
```

---

## Paso 3: Usar el Token en Next.js API Routes

Los endpoints de Next.js (`/api/*`) esperan el token en una **cookie**, no en un header.

### Estructura de la Cookie

```
Nombre: sb-{{PROJECT_REF}}-auth-token
# Ejemplo: sb-abcdefghijklmnop-auth-token

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
    "email": "test.user@miproyecto.com"
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
    email: userEmail,
  },
};

// 2. Codificar en base64
const cookieValue = btoa(JSON.stringify(tokenData));

// 3. El nombre de la cookie (reemplaza PROJECT_REF con tu project ref de Supabase)
const cookieName = 'sb-{{PROJECT_REF}}-auth-token';
// Ejemplo: 'sb-abcdefghijklmnop-auth-token'
```

### Ejemplo cURL con Cookie

```bash
# Primero, construir el valor de la cookie (base64 del JSON)
TOKEN_JSON='{"access_token":"eyJ...","refresh_token":"abc...","expires_at":1703123456,"token_type":"bearer","user":{"id":"550e...","email":"test@..."}}'
COOKIE_VALUE=$(echo -n "$TOKEN_JSON" | base64)

# Luego, hacer el request
curl -X GET \
  'http://localhost:3000/api/notifications/unread' \
  -H "Cookie: sb-{{PROJECT_REF}}-auth-token=$COOKIE_VALUE"

# Ejemplo real:
# curl -X GET \
#   'http://localhost:3000/api/notifications/unread' \
#   -H "Cookie: sb-abcdefghijklmnop-auth-token=$COOKIE_VALUE"
```

---

## Paso 4: Usar en Postman

### Para Supabase REST API

1. En **Headers**, agregar:
   - `apikey`: `{{anon_key}}`
   - `Authorization`: `Bearer {{access_token}}`

2. Usar el request de Login para obtener y guardar el token automaticamente (ver [04-testing-postman.md](./04-testing-postman.md))

### Para Next.js API Routes

1. En **Headers**, agregar:
   - `Cookie`: `sb-{{PROJECT_REF}}-auth-token={{cookie_value}}`

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
    email: pm.environment.get('user_email'),
  },
};

const cookieValue = btoa(JSON.stringify(tokenData));
pm.environment.set('cookie_value', cookieValue);
```

---

## Paso 5: Usar en Playwright

### Concepto

```
+-----------------------------------------------------------------------------+
|                   FLUJO DE AUTENTICACION EN PLAYWRIGHT                       |
+-----------------------------------------------------------------------------+
|                                                                             |
|   1. Login via API Request (request fixture)                               |
|      +-- Obtener access_token, refresh_token, user_id                      |
|                                                                             |
|   2. Inyectar Cookie en Browser Context                                     |
|      +-- page.context().addCookies([...])                                  |
|                                                                             |
|   3. Ahora puedes:                                                          |
|      |-- Navegar en UI (cookies van automaticamente)                       |
|      |-- Hacer requests a /rest/v1/* (con Authorization header)            |
|      +-- Hacer requests a /api/* (cookies van automaticamente)             |
|                                                                             |
+-----------------------------------------------------------------------------+
```

### Pasos en Codigo

```typescript
// Configuracion
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PROJECT_REF = SUPABASE_URL.split('//')[1].split('.')[0];
// Ejemplo: 'abcdefghijklmnop' de 'https://abcdefghijklmnop.supabase.co'

// 1. Login via API
const loginResponse = await request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  headers: { apikey: ANON_KEY },
  data: { email, password },
});
const { access_token, refresh_token, user } = await loginResponse.json();

// 2. Construir cookie
const cookieData = {
  access_token,
  refresh_token,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: { id: user.id, email: user.email },
};
const cookieValue = Buffer.from(JSON.stringify(cookieData)).toString('base64');

// 3. Inyectar en browser
await page.context().addCookies([
  {
    name: `sb-${PROJECT_REF}-auth-token`,
    value: cookieValue,
    domain: 'localhost',
    path: '/',
  },
]);

// 4. Ahora el browser esta autenticado!
await page.goto('/dashboard'); // Ya estas logueado, sin pasar por /login

// 5. Para requests API en el mismo test:
//    - Supabase REST: usar access_token en header
//    - Next.js API: las cookies ya estan, van automaticamente via page.request
```

---

## Tabla Resumen

| API                              | Metodo de Auth | Como Enviar                              |
| -------------------------------- | -------------- | ---------------------------------------- |
| **Supabase REST** (`/rest/v1/*`) | Header         | `Authorization: Bearer <access_token>`   |
| **Next.js API** (`/api/*`)       | Cookie         | `sb-{{PROJECT_REF}}-auth-token=<base64>` |
| **Browser (UI)**                 | Cookie         | Misma cookie, se envia automaticamente   |

---

## Usuarios de Prueba (Ejemplo)

| Rol          | Email                  | Password                  |
| ------------ | ---------------------- | ------------------------- |
| **Customer** | `{{TEST_USER_EMAIL}}`  | `{{TEST_USER_PASSWORD}}`  |
| **Admin**    | `{{TEST_ADMIN_EMAIL}}` | `{{TEST_ADMIN_PASSWORD}}` |

Ejemplo:

| Rol          | Email                          | Password       |
| ------------ | ------------------------------ | -------------- |
| **Customer** | `test.customer@miproyecto.com` | `Customer123!` |
| **Admin**    | `test.admin@miproyecto.com`    | `Admin123!`    |

---

## Refresh Token (Renovar Sesion)

Cuando el `access_token` expire (1 hora por defecto), usar el `refresh_token`:

```http
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=refresh_token
# Ejemplo: POST https://abcdefghijklmnop.supabase.co/auth/v1/token?grant_type=refresh_token

Content-Type: application/json
apikey: {{SUPABASE_ANON_KEY}}

{
  "refresh_token": "abc123..."
}
```

Response: Nuevo `access_token` y `refresh_token`.

---

## Verificar Token (Debug)

Para ver que contiene un JWT, decodificarlo en https://jwt.io o:

```javascript
// Decodificar payload del JWT (sin verificar firma)
const [header, payload, signature] = accessToken.split('.');
const decoded = JSON.parse(atob(payload));
console.log(decoded);
// { sub: "user-id", email: "...", exp: 1703123456, ... }
```

**Campos importantes del JWT:**

- `sub`: ID del usuario
- `email`: Email del usuario
- `exp`: Timestamp de expiracion
- `role`: Siempre "authenticated" para usuarios logueados
- `user_metadata`: Datos adicionales del usuario

---

## Siguiente Paso

- Para testing manual con UI: [devtools-testing.md](./devtools-testing.md)
- Para testing con Postman: [postman-testing.md](./postman-testing.md)
- Para testing automatizado: [playwright-testing.md](./playwright-testing.md)
