# API Testing con DevTools

Esta guía explica cómo interceptar y analizar requests de la API usando las DevTools del navegador.

---

## Por Qué los Requests se Ven "Raros"

### El Problema que Notas

Cuando abres DevTools > Network, probablemente ves:

```
# Lo que esperabas (API tradicional):
POST /api/reviews          → {"mentor_id": "abc", "rating": 5}
GET  /api/mentors/abc      → {"name": "Laura", "rating": 4.5}

# Lo que ves (Supabase PostgREST):
GET  /rest/v1/profiles?role=eq.mentor&select=id,name,photo_url,specialties...
POST /rest/v1/reviews?select=*
GET  /rest/v1/bookings?or=(student_id.eq.xxx,mentor_id.eq.xxx)&order=session_date.desc
```

### Por Qué es Diferente

| Aspecto | API Tradicional | Supabase PostgREST |
|---------|-----------------|---------------------|
| **URL** | `/api/reviews` | `/rest/v1/reviews` |
| **Query Params** | `?mentor_id=abc` | `?mentor_id=eq.abc` |
| **Filtros** | En el backend | En la URL (sintaxis PostgREST) |
| **Selección de campos** | Backend decide | `?select=id,name,email` |
| **Ordenamiento** | Backend decide | `?order=created_at.desc` |

### Sintaxis PostgREST (Cheatsheet)

```bash
# Igualdad
?column=eq.value              # column = 'value'

# Comparaciones
?column=gt.5                  # column > 5
?column=gte.5                 # column >= 5
?column=lt.5                  # column < 5
?column=lte.5                 # column <= 5
?column=neq.value             # column != 'value'

# Null checks
?column=is.null               # column IS NULL
?column=not.is.null           # column IS NOT NULL

# Listas
?column=in.(a,b,c)            # column IN ('a', 'b', 'c')

# Texto
?column=like.*pattern*        # column LIKE '%pattern%'
?column=ilike.*pattern*       # ILIKE (case insensitive)

# Lógica
?or=(col1.eq.a,col2.eq.b)     # col1 = 'a' OR col2 = 'b'
?and=(col1.gt.5,col2.lt.10)   # col1 > 5 AND col2 < 10

# Selección de campos
?select=id,name,email         # Solo esos campos
?select=*                     # Todos los campos
?select=*,reviews(*)          # Con relación (JOIN)

# Ordenamiento
?order=created_at.desc        # ORDER BY created_at DESC
?order=name.asc,id.desc       # Múltiples columnas

# Paginación
?limit=10&offset=20           # LIMIT 10 OFFSET 20
```

---

## Configurar DevTools para API Testing

### Paso 1: Abrir DevTools

1. Abre la app en el navegador: `http://localhost:3000`
2. F12 o Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
3. Ve a la pestaña **Network**

### Paso 2: Filtrar por Tipo

Usa estos filtros para ver solo lo relevante:

| Filtro | Qué muestra |
|--------|-------------|
| `Fetch/XHR` | Requests de API (AJAX) |
| `Doc` | Navegación de páginas |
| `WS` | WebSocket (real-time de Supabase) |

**Recomendado:** Click en `Fetch/XHR` para ver solo API calls.

### Paso 3: Filtrar por URL

En el campo de búsqueda:

```
# Solo Supabase REST
rest/v1

# Solo API Routes de Next.js
/api/

# Endpoints específicos
profiles
bookings
reviews
```

---

## Interceptar Requests de Autenticación

### Login Flow

1. Ve a `/login`
2. Abre DevTools > Network
3. Ingresa credenciales demo:
   - Email: `student.demo@upexmymentor.com`
   - Password: `Demo123!`
4. Click en "Iniciar Sesión"

### Request que Verás

```
POST https://ionevzckjyxtpmyenbxc.supabase.co/auth/v1/token?grant_type=password
```

**Headers:**
```
apikey: eyJhbGciOiJIUzI1NiIs...  (anon key)
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student.demo@upexmymentor.com",
  "password": "Demo123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzA...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1703123456,
  "refresh_token": "abc123...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student.demo@upexmymentor.com",
    "role": "authenticated",
    "user_metadata": {
      "name": "Alex García",
      "role": "student"
    }
  }
}
```

### Copiar el Token

1. Click derecho en el request de login
2. Copy > Copy response
3. Extrae el `access_token` - Este es tu JWT para otros requests

---

## Analizar Requests Autenticados

### Ejemplo: Ver Mis Bookings

Después de hacer login, navega a `/dashboard/sessions`:

**Request:**
```
GET https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/bookings
    ?select=*,mentor:profiles!bookings_mentor_id_fkey(id,name,photo_url)
    &or=(student_id.eq.550e8400-e29b-41d4-a716-446655440000,mentor_id.eq.550e8400-e29b-41d4-a716-446655440000)
    &order=session_date.desc
```

**Headers Importantes:**
```
apikey: eyJhbGciOiJIUzI1NiIs...           # Anon key (siempre)
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...  # Tu JWT de login
```

**Desglose de la URL:**

| Parte | Significado |
|-------|-------------|
| `/rest/v1/bookings` | Tabla bookings |
| `select=*,mentor:profiles!...` | Todos los campos + JOIN con profiles |
| `or=(student_id.eq.xxx,mentor_id.eq.xxx)` | Donde soy estudiante O mentor |
| `order=session_date.desc` | Ordenar por fecha descendente |

**Response (200 OK):**
```json
[
  {
    "id": "booking-uuid-1",
    "student_id": "550e8400-e29b-41d4-a716-446655440000",
    "mentor_id": "mentor-uuid",
    "session_date": "2024-01-20T15:00:00Z",
    "duration_minutes": 60,
    "status": "confirmed",
    "mentor": {
      "id": "mentor-uuid",
      "name": "Laura Martínez",
      "photo_url": "https://..."
    }
  }
]
```

---

## Probar RLS Policies en DevTools

### Experimento: Intentar Ver Bookings de Otro Usuario

1. Estás logueado como estudiante (Alex García)
2. En DevTools > Console, ejecuta:

```javascript
// Obtener el cliente de Supabase
const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(
  'https://ionevzckjyxtpmyenbxc.supabase.co',
  'TU_ANON_KEY'
)

// Intentar ver bookings de OTRO usuario
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('student_id', 'otro-usuario-id')

console.log('Data:', data)   // [] - Array vacío!
console.log('Error:', error) // null - No hay error, pero no hay datos
```

**Resultado:** RLS policy bloquea el acceso. No ves error, pero tampoco datos.

### Ver la Policy en Acción

En Network tab, verás:

```
GET /rest/v1/bookings?student_id=eq.otro-usuario-id
Status: 200 OK
Response: []
```

La policy `"Users can view their own bookings"` filtra automáticamente:
```sql
-- Solo retorna filas donde:
auth.uid() = student_id OR auth.uid() = mentor_id
```

---

## Validar Responses

### Qué Validar en Cada Request

| Aspecto | Qué Revisar |
|---------|-------------|
| **Status Code** | 200 (OK), 201 (Created), 204 (No Content) |
| **Headers** | `content-type: application/json` |
| **Body Structure** | Campos esperados presentes |
| **Data Types** | Strings, numbers, dates correctos |
| **Relationships** | JOINs incluyen datos relacionados |
| **Pagination** | `content-range` header si aplica |

### Status Codes Comunes

| Code | Significado | Cuándo |
|------|-------------|--------|
| `200` | OK | GET exitoso |
| `201` | Created | POST exitoso |
| `204` | No Content | DELETE exitoso |
| `400` | Bad Request | Sintaxis incorrecta |
| `401` | Unauthorized | Falta JWT o expiró |
| `403` | Forbidden | RLS bloqueó la operación |
| `404` | Not Found | Recurso no existe |
| `409` | Conflict | Violación de constraint único |
| `422` | Unprocessable | Validación falló |

### Ejemplo: Crear Review (POST)

**Request:**
```
POST /rest/v1/reviews
Headers:
  apikey: ...
  Authorization: Bearer ...
  Content-Type: application/json
  Prefer: return=representation

Body:
{
  "mentor_id": "mentor-uuid",
  "reviewer_id": "mi-uuid",
  "rating": 5,
  "comment": "Excelente sesión!"
}
```

**Response Esperada (201 Created):**
```json
[
  {
    "id": "nuevo-review-uuid",
    "mentor_id": "mentor-uuid",
    "reviewer_id": "mi-uuid",
    "rating": 5,
    "comment": "Excelente sesión!",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Validaciones:**
- [ ] Status: 201
- [ ] `id` generado automáticamente
- [ ] `created_at` tiene timestamp actual
- [ ] Todos los campos del body están presentes

---

## Tips y Trucos

### 1. Preserve Log

Activa **"Preserve log"** para mantener requests entre navegaciones:

```
☑️ Preserve log
```

### 2. Copy as cURL

Para replicar un request en terminal o Postman:

1. Click derecho en el request
2. Copy > Copy as cURL

```bash
curl 'https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/profiles?role=eq.mentor' \
  -H 'apikey: eyJ...' \
  -H 'Authorization: Bearer eyJ...'
```

### 3. Copy as Fetch

Para replicar en JavaScript:

```javascript
fetch("https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1/profiles?role=eq.mentor", {
  headers: {
    "apikey": "eyJ...",
    "Authorization": "Bearer eyJ..."
  }
})
```

### 4. Throttling

Simula conexiones lentas para testing:

1. Network tab > Throttling dropdown
2. Selecciona "Slow 3G" o "Offline"

### 5. Block Requests

Bloquea endpoints para testear error handling:

1. Click derecho en un request
2. Block request URL
3. Recarga la página - verás cómo la app maneja el fallo

---

## Checklist de Testing con DevTools

### Para cada feature:

- [ ] Identificar todos los requests involucrados
- [ ] Verificar headers correctos (apikey, Authorization)
- [ ] Validar request body (POST/PATCH)
- [ ] Verificar status code esperado
- [ ] Validar estructura del response
- [ ] Probar con usuario sin permisos (RLS)
- [ ] Probar con datos inválidos
- [ ] Verificar error handling de la UI

---

## Siguiente Paso

Si quieres crear requests reutilizables y organizados, continúa con:
→ [Postman Testing](./postman-testing.md)
