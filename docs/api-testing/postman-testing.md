# API Testing con Postman

Esta guía explica cómo configurar Postman para testing de la API de Upex My Mentor, incluyendo autenticación automática.

---

## Configuración Inicial

### Paso 1: Crear Workspace

1. Abre Postman
2. Create Workspace > "Upex My Mentor API"
3. Tipo: Personal o Team

### Paso 2: Crear Environment

Ve a Environments > Create Environment > "MyMentor - Development"

**Variables:**

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://ionevzckjyxtpmyenbxc.supabase.co` | (igual) |
| `api_url` | `{{base_url}}/rest/v1` | (igual) |
| `auth_url` | `{{base_url}}/auth/v1` | (igual) |
| `anon_key` | `eyJhbGciOiJIUzI1NiIs...` | (tu anon key) |
| `access_token` | _(vacío)_ | _(se llena automáticamente)_ |
| `user_id` | _(vacío)_ | _(se llena automáticamente)_ |
| `mentor_email` | `mentor.demo@upexmymentor.com` | (igual) |
| `mentor_password` | `Demo123!` | (igual) |
| `student_email` | `student.demo@upexmymentor.com` | (igual) |
| `student_password` | `Demo123!` | (igual) |

---

## Colección: Autenticación

### Request: Login como Estudiante

**Crear request:**
- Name: `Login - Student`
- Method: `POST`
- URL: `{{auth_url}}/token?grant_type=password`

**Headers:**
```
apikey: {{anon_key}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "{{student_email}}",
  "password": "{{student_password}}"
}
```

**Tests (JavaScript):**
```javascript
// Guardar token automáticamente
pm.test("Login exitoso", function () {
    pm.response.to.have.status(200);
});

pm.test("Token recibido", function () {
    const response = pm.response.json();

    // Guardar access_token para usar en otros requests
    pm.environment.set("access_token", response.access_token);

    // Guardar user_id
    pm.environment.set("user_id", response.user.id);

    // Guardar refresh_token (opcional)
    pm.environment.set("refresh_token", response.refresh_token);

    console.log("✅ Token guardado para user:", response.user.email);
});
```

### Request: Login como Mentor

Duplica el request anterior y cambia:
- Name: `Login - Mentor`
- Body:
```json
{
  "email": "{{mentor_email}}",
  "password": "{{mentor_password}}"
}
```

### Request: Refresh Token

**Crear request:**
- Name: `Refresh Token`
- Method: `POST`
- URL: `{{auth_url}}/token?grant_type=refresh_token`

**Headers:**
```
apikey: {{anon_key}}
Content-Type: application/json
```

**Body:**
```json
{
  "refresh_token": "{{refresh_token}}"
}
```

**Tests:**
```javascript
pm.test("Token refrescado", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.environment.set("access_token", response.access_token);
});
```

---

## Colección: Profiles

### Request: Listar Mentores

- Name: `Get Mentors`
- Method: `GET`
- URL: `{{api_url}}/profiles?role=eq.mentor&select=id,name,email,photo_url,specialties,hourly_rate,average_rating`

**Headers:**
```
apikey: {{anon_key}}
```
_(No necesita Authorization para lectura pública)_

**Tests:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Es un array", function () {
    const response = pm.response.json();
    pm.expect(response).to.be.an('array');
});

pm.test("Mentores tienen campos requeridos", function () {
    const mentors = pm.response.json();
    if (mentors.length > 0) {
        const mentor = mentors[0];
        pm.expect(mentor).to.have.property('id');
        pm.expect(mentor).to.have.property('name');
        pm.expect(mentor).to.have.property('hourly_rate');
    }
});
```

### Request: Obtener Mi Perfil

- Name: `Get My Profile`
- Method: `GET`
- URL: `{{api_url}}/profiles?id=eq.{{user_id}}&select=*`

**Headers:**
```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
```

**Tests:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Perfil encontrado", function () {
    const profiles = pm.response.json();
    pm.expect(profiles).to.have.lengthOf(1);
    pm.expect(profiles[0].id).to.equal(pm.environment.get("user_id"));
});
```

### Request: Actualizar Mi Perfil

- Name: `Update My Profile`
- Method: `PATCH`
- URL: `{{api_url}}/profiles?id=eq.{{user_id}}`

**Headers:**
```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
Prefer: return=representation
```

**Body:**
```json
{
  "description": "Actualizado desde Postman - {{$timestamp}}"
}
```

**Tests:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Descripción actualizada", function () {
    const profiles = pm.response.json();
    pm.expect(profiles[0].description).to.include("Actualizado desde Postman");
});
```

---

## Colección: Bookings

### Request: Mis Bookings

- Name: `Get My Bookings`
- Method: `GET`
- URL: `{{api_url}}/bookings?or=(student_id.eq.{{user_id}},mentor_id.eq.{{user_id}})&select=*,mentor:profiles!bookings_mentor_id_fkey(name,photo_url),student:profiles!bookings_student_id_fkey(name)&order=session_date.desc`

**Headers:**
```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
```

**Tests:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Bookings son míos", function () {
    const bookings = pm.response.json();
    const userId = pm.environment.get("user_id");

    bookings.forEach(booking => {
        const isMyBooking = booking.student_id === userId || booking.mentor_id === userId;
        pm.expect(isMyBooking).to.be.true;
    });
});

// Guardar primer booking para otros tests
if (pm.response.json().length > 0) {
    pm.environment.set("booking_id", pm.response.json()[0].id);
}
```

### Request: Crear Booking (Estudiante)

- Name: `Create Booking`
- Method: `POST`
- URL: `{{api_url}}/bookings`

**Headers:**
```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
Prefer: return=representation
```

**Body:**
```json
{
  "student_id": "{{user_id}}",
  "mentor_id": "{{mentor_id}}",
  "session_date": "2024-02-15T15:00:00Z",
  "duration_minutes": 60,
  "total_cost": 50.00,
  "status": "provisional"
}
```

**Pre-request Script:**
```javascript
// Necesitas tener mentor_id definido
// Puedes obtenerlo de "Get Mentors" y guardarlo
if (!pm.environment.get("mentor_id")) {
    console.warn("⚠️ mentor_id no definido. Ejecuta 'Get Mentors' primero.");
}
```

**Tests:**
```javascript
pm.test("Status 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("Booking creado correctamente", function () {
    const bookings = pm.response.json();
    pm.expect(bookings).to.have.lengthOf(1);
    pm.expect(bookings[0]).to.have.property('id');
    pm.expect(bookings[0].status).to.equal('provisional');

    // Guardar para otros tests
    pm.environment.set("new_booking_id", bookings[0].id);
});
```

---

## Colección: Reviews

### Request: Reviews de un Mentor

- Name: `Get Mentor Reviews`
- Method: `GET`
- URL: `{{api_url}}/reviews?mentor_id=eq.{{mentor_id}}&select=*,reviewer:profiles!reviews_reviewer_id_fkey(name,photo_url)&order=created_at.desc`

**Headers:**
```
apikey: {{anon_key}}
```

### Request: Crear Review

- Name: `Create Review`
- Method: `POST`
- URL: `{{api_url}}/reviews`

**Headers:**
```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
Prefer: return=representation
```

**Body:**
```json
{
  "mentor_id": "{{mentor_id}}",
  "reviewer_id": "{{user_id}}",
  "booking_id": "{{booking_id}}",
  "rating": 5,
  "comment": "Excelente sesión de mentoría. Muy recomendado!"
}
```

---

## Colección: Messages

### Request: Mis Conversaciones

- Name: `Get My Conversations`
- Method: `GET`
- URL: `{{api_url}}/conversations?or=(participant_1_id.eq.{{user_id}},participant_2_id.eq.{{user_id}})&select=*&order=updated_at.desc`

**Headers:**
```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
```

### Request: Mensajes de una Conversación

- Name: `Get Conversation Messages`
- Method: `GET`
- URL: `{{api_url}}/messages?conversation_id=eq.{{conversation_id}}&select=*,sender:profiles!messages_sender_id_fkey(name,photo_url)&order=created_at.asc`

**Headers:**
```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
```

---

## Testing de RLS Policies

### Test: No puedo ver bookings de otros

1. Login como Estudiante
2. Ejecuta este request:

- Name: `RLS Test - Other User Bookings`
- Method: `GET`
- URL: `{{api_url}}/bookings?student_id=eq.00000000-0000-0000-0000-000000000000`

**Tests:**
```javascript
pm.test("Status 200 pero array vacío", function () {
    pm.response.to.have.status(200);
    const bookings = pm.response.json();
    pm.expect(bookings).to.be.an('array');
    pm.expect(bookings).to.have.lengthOf(0);
});

console.log("✅ RLS Policy funcionando: No puedo ver bookings de otros usuarios");
```

### Test: No puedo actualizar perfil de otro

- Name: `RLS Test - Update Other Profile`
- Method: `PATCH`
- URL: `{{api_url}}/profiles?id=eq.00000000-0000-0000-0000-000000000000`

**Body:**
```json
{
  "name": "Hacked!"
}
```

**Tests:**
```javascript
pm.test("No se actualizó ningún registro", function () {
    // PostgREST retorna array vacío si RLS bloquea
    const result = pm.response.json();
    pm.expect(result).to.have.lengthOf(0);
});

console.log("✅ RLS Policy funcionando: No puedo actualizar perfiles de otros");
```

---

## Pre-request Script Global

En la colección, puedes agregar un script que se ejecute antes de cada request:

**Collection > Pre-request Script:**
```javascript
// Verificar que tenemos token válido
const token = pm.environment.get("access_token");

if (!token && pm.request.headers.has("Authorization")) {
    console.warn("⚠️ No hay access_token. Ejecuta Login primero.");
}

// Opcional: Verificar expiración del token
if (token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // convertir a ms
        const now = Date.now();

        if (now > exp) {
            console.warn("⚠️ Token expirado. Ejecuta Login o Refresh Token.");
        }
    } catch (e) {
        // Token malformado
    }
}
```

---

## Collection Runner

Para ejecutar todos los tests de una colección:

1. Click en "..." de la colección
2. Run collection
3. Selecciona el environment
4. Configura:
   - Delay: 100ms (evitar rate limiting)
   - Iterations: 1
5. Run

### Orden Recomendado de Ejecución

1. `Login - Student`
2. `Get My Profile`
3. `Get Mentors` (guarda `mentor_id`)
4. `Get My Bookings`
5. `Get Mentor Reviews`
6. RLS Tests

---

## Exportar e Importar

### Exportar Colección

1. Click derecho en la colección
2. Export
3. Format: Collection v2.1
4. Guardar como: `upex-my-mentor-api.postman_collection.json`

### Exportar Environment

1. Click en el ícono de ojo junto al environment
2. Export
3. Guardar como: `mymentor-dev.postman_environment.json`

### Importar en Otro Equipo

1. Import > Upload Files
2. Seleccionar los archivos JSON
3. Ajustar variables de environment (passwords, keys)

---

## Tips Avanzados

### 1. Usar Variables Dinámicas

```javascript
// En Body
{
  "session_date": "{{$isoTimestamp}}",
  "unique_id": "{{$guid}}",
  "random_number": "{{$randomInt}}"
}
```

### 2. Chaining de Requests

```javascript
// En Tests del request A, guardar dato
pm.environment.set("mentor_id", pm.response.json()[0].id);

// En request B, usar
// URL: ?mentor_id=eq.{{mentor_id}}
```

### 3. Visualizar Responses

```javascript
// En Tests tab
const template = `
<table>
    <tr><th>ID</th><th>Name</th><th>Rating</th></tr>
    {{#each response}}
    <tr>
        <td>{{id}}</td>
        <td>{{name}}</td>
        <td>{{average_rating}}</td>
    </tr>
    {{/each}}
</table>
`;

pm.visualizer.set(template, {response: pm.response.json()});
```

---

## Siguiente Paso

Para testing con IA usando MCP:
→ [MCP Testing](./mcp-testing.md)
