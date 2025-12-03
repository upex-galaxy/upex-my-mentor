# API Documentation - Upex My Mentor

**Base URL:** `https://ionevzckjyxtpmyenbxc.supabase.co`

Esta documentación describe la API REST autogenerada por Supabase. Para todas las peticiones a los endpoints de datos, se requieren dos cabeceras:
- `apikey`: Tu `anon_key` pública de Supabase.
- `Authorization`: `Bearer [JWT]`, donde JWT es el token de sesión del usuario autenticado.

---

## 🔑 Authentication

La autenticación se gestiona a través de los endpoints de Supabase Auth.

### Login
**Endpoint:** `POST /auth/v1/token?grant_type=password`

**Headers:**
- `apikey: [SUPABASE_ANON_KEY]`
- `Content-Type: application/json`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "...",
  "user": { ... }
}
```

---

### Signup
**Endpoint:** `POST /auth/v1/signup`

**Headers:**
- `apikey: [SUPABASE_ANON_KEY]`
- `Content-Type: application/json`

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "strongpassword123",
  "data": {
    "name": "John Doe",
    "role": "student"
  }
}
```
---

## 📊 Data Endpoints

### `profiles`

**List All Mentors:**
- **Method:** GET
- **Endpoint:** `/rest/v1/profiles?role=eq.mentor&select=*`

**Get Profile by ID:**
- **Method:** GET
- **Endpoint:** `/rest/v1/profiles?id=eq.[user_id]&select=*`

**Update Profile:**
- **Method:** PATCH
- **Endpoint:** `/rest/v1/profiles?id=eq.[user_id]`
- **Body:** (Solo los campos a actualizar)
  ```json
  {
    "description": "A new description for my profile.",
    "hourly_rate": 125
  }
  ```

---

### `reviews`

**List All Reviews for a specific user (subject):**
- **Method:** GET
- **Endpoint:** `/rest/v1/reviews?subject_id=eq.[user_id]&select=*,reviewer:reviewer_id(name,photo_url)`
- **Nota:** El `select` anidado permite obtener información del perfil del autor de la reseña.

**Create a Review:**
- **Method:** POST
- **Endpoint:** `/rest/v1/reviews`
- **Body:**
  ```json
  {
    "reviewer_id": "[current_user_id]",
    "subject_id": "[mentor_user_id]",
    "rating": 5,
    "comment": "Excellent session!"
  }
  ```

---

## 🧪 Testing con Postman/Insomnia

1.  Crea una nueva colección.
2.  Configura las siguientes variables de entorno en la colección:
    - `base_url`: `https://ionevzckjyxtpmyenbxc.supabase.co`
    - `anon_key`: Tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3.  Realiza una petición de `Login` para obtener un `access_token` (JWT).
4.  Guarda el JWT en una variable de entorno, por ejemplo `jwt_token`.
5.  Para las peticiones a los endpoints de datos, añade la cabecera `Authorization` con el valor `Bearer {{jwt_token}}`.
6.  Ahora puedes realizar peticiones a los endpoints de `profiles` y `reviews`.

---

## 🔒 RLS Impact on API

Las políticas de Row Level Security (RLS) que hemos definido afectan directamente a lo que la API devuelve:
- Una petición `PATCH` a `/rest/v1/profiles` solo funcionará si el `id` en la URL coincide con el `id` del usuario autenticado (cuyo JWT se está usando). De lo contrario, la API devolverá una lista vacía o un error, como si el registro no existiera.
- Una petición `POST` a `/rest/v1/reviews` funcionará para cualquier usuario autenticado, pero las políticas de `UPDATE` o `DELETE` sobre esa reseña solo funcionarán para el usuario que la creó.
