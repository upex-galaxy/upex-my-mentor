# API Testing con DevTools

Esta guia explica como interceptar y analizar requests de la API usando las DevTools del navegador.

---

## Por Que los Requests se Ven "Raros"

### El Problema que Notas

Cuando abres DevTools > Network, probablemente ves:

```
# Lo que esperabas (API tradicional):
POST /api/reviews          --> {"product_id": "abc", "rating": 5}
GET  /api/products/abc     --> {"name": "Producto", "price": 99.99}

# Lo que ves (Supabase PostgREST):
GET  /rest/v1/products?category=eq.electronics&select=id,name,price...
POST /rest/v1/reviews?select=*
GET  /rest/v1/orders?or=(user_id.eq.xxx,seller_id.eq.xxx)&order=created_at.desc
```

### Por Que es Diferente

| Aspecto                 | API Tradicional | Supabase PostgREST             |
| ----------------------- | --------------- | ------------------------------ |
| **URL**                 | `/api/products` | `/rest/v1/products`            |
| **Query Params**        | `?id=abc`       | `?id=eq.abc`                   |
| **Filtros**             | En el backend   | En la URL (sintaxis PostgREST) |
| **Seleccion de campos** | Backend decide  | `?select=id,name,price`        |
| **Ordenamiento**        | Backend decide  | `?order=created_at.desc`       |

---

## Sintaxis PostgREST (Cheatsheet)

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

# Logica
?or=(col1.eq.a,col2.eq.b)     # col1 = 'a' OR col2 = 'b'
?and=(col1.gt.5,col2.lt.10)   # col1 > 5 AND col2 < 10

# Seleccion de campos
?select=id,name,price         # Solo esos campos
?select=*                     # Todos los campos
?select=*,reviews(*)          # Con relacion (JOIN)

# Ordenamiento
?order=created_at.desc        # ORDER BY created_at DESC
?order=name.asc,id.desc       # Multiples columnas

# Paginacion
?limit=10&offset=20           # LIMIT 10 OFFSET 20
```

---

## Configurar DevTools para API Testing

### Paso 1: Abrir DevTools

1. Abre la app en el navegador: `http://localhost:3000`
2. F12 o Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
3. Ve a la pestana **Network**

### Paso 2: Filtrar por Tipo

Usa estos filtros para ver solo lo relevante:

| Filtro      | Que muestra                       |
| ----------- | --------------------------------- |
| `Fetch/XHR` | Requests de API (AJAX)            |
| `Doc`       | Navegacion de paginas             |
| `WS`        | WebSocket (real-time de Supabase) |

**Recomendado:** Click en `Fetch/XHR` para ver solo API calls.

### Paso 3: Filtrar por URL

En el campo de busqueda:

```
# Solo Supabase REST
rest/v1

# Solo API Routes de Next.js
/api/

# Endpoints especificos
products
orders
users
```

---

## Interceptar Requests de Autenticacion

### Login Flow

1. Ve a `/login`
2. Abre DevTools > Network
3. Ingresa credenciales de prueba:
   - Email: `{{TEST_USER_EMAIL}}`
   - Password: `{{TEST_USER_PASSWORD}}`
   - Ejemplo: `test.user@miproyecto.com` / `TestPassword123!`
4. Click en "Iniciar Sesion"

### Request que Veras

```
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=password
# Ejemplo: POST https://abcdefghijklmnop.supabase.co/auth/v1/token?grant_type=password
```

**Headers:**

```
apikey: eyJhbGciOiJIUzI1NiIs...  (anon key)
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "test.user@miproyecto.com",
  "password": "TestPassword123!"
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
    "email": "test.user@miproyecto.com",
    "role": "authenticated",
    "user_metadata": {
      "name": "Test User",
      "role": "customer"
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

### Ejemplo: Ver Mis Ordenes

Despues de hacer login, navega a `/dashboard/orders`:

**Request:**

```
GET {{SUPABASE_URL}}/rest/v1/orders
    ?select=*,products:order_items(product:products(id,name,image_url))
    &user_id=eq.550e8400-e29b-41d4-a716-446655440000
    &order=created_at.desc

# Ejemplo:
# GET https://abcdefghijklmnop.supabase.co/rest/v1/orders?select=*,...
```

**Headers Importantes:**

```
apikey: eyJhbGciOiJIUzI1NiIs...           # Anon key (siempre)
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...  # Tu JWT de login
```

**Desglose de la URL:**

| Parte                                | Significado                           |
| ------------------------------------ | ------------------------------------- |
| `/rest/v1/orders`                    | Tabla orders                          |
| `select=*,products:order_items(...)` | Todos los campos + JOIN con productos |
| `user_id=eq.xxx`                     | Donde soy el usuario                  |
| `order=created_at.desc`              | Ordenar por fecha descendente         |

**Response (200 OK):**

```json
[
  {
    "id": "order-uuid-1",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "delivered",
    "total": 149.99,
    "created_at": "2024-01-20T15:00:00Z",
    "products": [
      {
        "product": {
          "id": "product-uuid",
          "name": "Laptop Stand",
          "image_url": "https://..."
        }
      }
    ]
  }
]
```

---

## Probar RLS Policies en DevTools

### Experimento: Intentar Ver Ordenes de Otro Usuario

1. Estas logueado como usuario A
2. En DevTools > Console, ejecuta:

```javascript
// Obtener el cliente de Supabase
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  '{{SUPABASE_URL}}', // Ejemplo: 'https://abcdefghijklmnop.supabase.co'
  '{{SUPABASE_ANON_KEY}}'
);

// Intentar ver ordenes de OTRO usuario
const { data, error } = await supabase.from('orders').select('*').eq('user_id', 'otro-usuario-id');

console.log('Data:', data); // [] - Array vacio!
console.log('Error:', error); // null - No hay error, pero no hay datos
```

**Resultado:** RLS policy bloquea el acceso. No ves error, pero tampoco datos.

### Ver la Policy en Accion

En Network tab, veras:

```
GET /rest/v1/orders?user_id=eq.otro-usuario-id
Status: 200 OK
Response: []
```

La policy `"Users can view their own orders"` filtra automaticamente:

```sql
-- Solo retorna filas donde:
auth.uid() = user_id
```

---

## Validar Responses

### Que Validar en Cada Request

| Aspecto            | Que Revisar                               |
| ------------------ | ----------------------------------------- |
| **Status Code**    | 200 (OK), 201 (Created), 204 (No Content) |
| **Headers**        | `content-type: application/json`          |
| **Body Structure** | Campos esperados presentes                |
| **Data Types**     | Strings, numbers, dates correctos         |
| **Relationships**  | JOINs incluyen datos relacionados         |
| **Pagination**     | `content-range` header si aplica          |

### Status Codes Comunes

| Code  | Significado   | Cuando                        |
| ----- | ------------- | ----------------------------- |
| `200` | OK            | GET exitoso                   |
| `201` | Created       | POST exitoso                  |
| `204` | No Content    | DELETE exitoso                |
| `400` | Bad Request   | Sintaxis incorrecta           |
| `401` | Unauthorized  | Falta JWT o expiro            |
| `403` | Forbidden     | RLS bloqueo la operacion      |
| `404` | Not Found     | Recurso no existe             |
| `409` | Conflict      | Violacion de constraint unico |
| `422` | Unprocessable | Validacion fallo              |

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
  "product_id": "product-uuid",
  "user_id": "mi-uuid",
  "rating": 5,
  "comment": "Excelente producto!"
}
```

**Response Esperada (201 Created):**

```json
[
  {
    "id": "nuevo-review-uuid",
    "product_id": "product-uuid",
    "user_id": "mi-uuid",
    "rating": 5,
    "comment": "Excelente producto!",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Validaciones:**

- [ ] Status: 201
- [ ] `id` generado automaticamente
- [ ] `created_at` tiene timestamp actual
- [ ] Todos los campos del body estan presentes

---

## Tips y Trucos

### 1. Preserve Log

Activa **"Preserve log"** para mantener requests entre navegaciones:

```
[x] Preserve log
```

### 2. Copy as cURL

Para replicar un request en terminal o Postman:

1. Click derecho en el request
2. Copy > Copy as cURL

```bash
curl '{{SUPABASE_URL}}/rest/v1/products?category=eq.electronics' \
  -H 'apikey: eyJ...' \
  -H 'Authorization: Bearer eyJ...'

# Ejemplo:
# curl 'https://abcdefghijklmnop.supabase.co/rest/v1/products?category=eq.electronics' \
#   -H 'apikey: eyJ...' \
#   -H 'Authorization: Bearer eyJ...'
```

### 3. Copy as Fetch

Para replicar en JavaScript:

```javascript
fetch('{{SUPABASE_URL}}/rest/v1/products?category=eq.electronics', {
  headers: {
    apikey: 'eyJ...',
    Authorization: 'Bearer eyJ...',
  },
});

// Ejemplo:
// fetch("https://abcdefghijklmnop.supabase.co/rest/v1/products?category=eq.electronics", {...})
```

### 4. Throttling

Simula conexiones lentas para testing:

1. Network tab > Throttling dropdown
2. Selecciona "Slow 3G" o "Offline"

### 5. Block Requests

Bloquea endpoints para testear error handling:

1. Click derecho en un request
2. Block request URL
3. Recarga la pagina - veras como la app maneja el fallo

---

## Checklist de Testing con DevTools

### Para cada feature:

- [ ] Identificar todos los requests involucrados
- [ ] Verificar headers correctos (apikey, Authorization)
- [ ] Validar request body (POST/PATCH)
- [ ] Verificar status code esperado
- [ ] Validar estructura del response
- [ ] Probar con usuario sin permisos (RLS)
- [ ] Probar con datos invalidos
- [ ] Verificar error handling de la UI

---

## Siguiente Paso

Si quieres crear requests reutilizables y organizados, continua con:
--> [postman-testing.md](./postman-testing.md)
