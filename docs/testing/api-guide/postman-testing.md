# API Testing con Postman

Esta guia explica como configurar Postman para testing de APIs en proyectos Supabase + Next.js, incluyendo autenticacion automatica.

---

## Configuracion Inicial

### Paso 1: Crear Workspace

1. Abre Postman
2. Create Workspace > "{{PROJECT_NAME}} API"
   - Ejemplo: "Mi Proyecto API"
3. Tipo: Personal o Team

### Paso 2: Crear Environment

Ve a Environments > Create Environment > "{{PROJECT_NAME}} - Development"

**Variables:**

| Variable              | Initial Value             | Current Value                |
| --------------------- | ------------------------- | ---------------------------- |
| `base_url`            | `{{SUPABASE_URL}}`        | (tu URL de Supabase)         |
| `api_url`             | `{{base_url}}/rest/v1`    | (igual)                      |
| `auth_url`            | `{{base_url}}/auth/v1`    | (igual)                      |
| `anon_key`            | `{{SUPABASE_ANON_KEY}}`   | (tu anon key)                |
| `access_token`        | _(vacio)_                 | _(se llena automaticamente)_ |
| `user_id`             | _(vacio)_                 | _(se llena automaticamente)_ |
| `test_user_email`     | `{{TEST_USER_EMAIL}}`     | (tu email de prueba)         |
| `test_user_password`  | `{{TEST_USER_PASSWORD}}`  | (tu password de prueba)      |
| `test_admin_email`    | `{{TEST_ADMIN_EMAIL}}`    | (email admin de prueba)      |
| `test_admin_password` | `{{TEST_ADMIN_PASSWORD}}` | (password admin de prueba)   |

**Ejemplo de valores reales:**

| Variable             | Ejemplo                                   |
| -------------------- | ----------------------------------------- |
| `base_url`           | `https://abcdefghijklmnop.supabase.co`    |
| `anon_key`           | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `test_user_email`    | `test.customer@miproyecto.com`            |
| `test_user_password` | `Customer123!`                            |

---

## Coleccion: Autenticacion

### Request: Login como Usuario

**Crear request:**

- Name: `Login - User`
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
  "email": "{{test_user_email}}",
  "password": "{{test_user_password}}"
}
```

**Tests (JavaScript):**

```javascript
// Guardar token automaticamente
pm.test('Login exitoso', function () {
  pm.response.to.have.status(200);
});

pm.test('Token recibido', function () {
  const response = pm.response.json();

  // Guardar access_token para usar en otros requests
  pm.environment.set('access_token', response.access_token);

  // Guardar user_id
  pm.environment.set('user_id', response.user.id);

  // Guardar refresh_token (opcional)
  pm.environment.set('refresh_token', response.refresh_token);

  // Guardar email para referencia
  pm.environment.set('user_email', response.user.email);

  console.log('✅ Token guardado para user:', response.user.email);
});
```

### Request: Login como Admin

Duplica el request anterior y cambia:

- Name: `Login - Admin`
- Body:

```json
{
  "email": "{{test_admin_email}}",
  "password": "{{test_admin_password}}"
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
pm.test('Token refrescado', function () {
  pm.response.to.have.status(200);
  const response = pm.response.json();
  pm.environment.set('access_token', response.access_token);
  pm.environment.set('refresh_token', response.refresh_token);
});
```

---

## Coleccion: Users/Profiles

### Request: Listar Usuarios (Publico)

- Name: `Get Users`
- Method: `GET`
- URL: `{{api_url}}/users?role=eq.seller&select=id,name,email,avatar_url,rating`

**Headers:**

```
apikey: {{anon_key}}
```

_(No necesita Authorization para lectura publica)_

**Tests:**

```javascript
pm.test('Status 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Es un array', function () {
  const response = pm.response.json();
  pm.expect(response).to.be.an('array');
});

pm.test('Usuarios tienen campos requeridos', function () {
  const users = pm.response.json();
  if (users.length > 0) {
    const user = users[0];
    pm.expect(user).to.have.property('id');
    pm.expect(user).to.have.property('name');
  }
});
```

### Request: Obtener Mi Perfil

- Name: `Get My Profile`
- Method: `GET`
- URL: `{{api_url}}/users?id=eq.{{user_id}}&select=*`

**Headers:**

```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
```

**Tests:**

```javascript
pm.test('Status 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Perfil encontrado', function () {
  const profiles = pm.response.json();
  pm.expect(profiles).to.have.lengthOf(1);
  pm.expect(profiles[0].id).to.equal(pm.environment.get('user_id'));
});
```

### Request: Actualizar Mi Perfil

- Name: `Update My Profile`
- Method: `PATCH`
- URL: `{{api_url}}/users?id=eq.{{user_id}}`

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
  "bio": "Actualizado desde Postman - {{$timestamp}}"
}
```

**Tests:**

```javascript
pm.test('Status 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Bio actualizado', function () {
  const users = pm.response.json();
  pm.expect(users[0].bio).to.include('Actualizado desde Postman');
});
```

---

## Coleccion: Products

### Request: Listar Productos

- Name: `Get Products`
- Method: `GET`
- URL: `{{api_url}}/products?select=id,name,price,category,image_url&order=created_at.desc&limit=20`

**Headers:**

```
apikey: {{anon_key}}
```

**Tests:**

```javascript
pm.test('Status 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Productos tienen campos requeridos', function () {
  const products = pm.response.json();
  if (products.length > 0) {
    const product = products[0];
    pm.expect(product).to.have.property('id');
    pm.expect(product).to.have.property('name');
    pm.expect(product).to.have.property('price');

    // Guardar primer producto para otros tests
    pm.environment.set('product_id', product.id);
  }
});
```

### Request: Crear Producto (Admin)

- Name: `Create Product`
- Method: `POST`
- URL: `{{api_url}}/products`

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
  "name": "Test Product - {{$timestamp}}",
  "price": 99.99,
  "category": "electronics",
  "description": "Producto creado desde Postman para testing",
  "stock": 100
}
```

**Tests:**

```javascript
pm.test('Status 201 Created', function () {
  pm.response.to.have.status(201);
});

pm.test('Producto creado correctamente', function () {
  const products = pm.response.json();
  pm.expect(products).to.have.lengthOf(1);
  pm.expect(products[0]).to.have.property('id');
  pm.expect(products[0].price).to.equal(99.99);

  // Guardar para cleanup
  pm.environment.set('new_product_id', products[0].id);
});
```

---

## Coleccion: Orders

### Request: Mis Ordenes

- Name: `Get My Orders`
- Method: `GET`
- URL: `{{api_url}}/orders?user_id=eq.{{user_id}}&select=*,items:order_items(quantity,product:products(name,price))&order=created_at.desc`

**Headers:**

```
apikey: {{anon_key}}
Authorization: Bearer {{access_token}}
```

**Tests:**

```javascript
pm.test('Status 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Ordenes son mias', function () {
  const orders = pm.response.json();
  const userId = pm.environment.get('user_id');

  orders.forEach(order => {
    pm.expect(order.user_id).to.equal(userId);
  });
});

// Guardar primera orden para otros tests
const orders = pm.response.json();
if (orders.length > 0) {
  pm.environment.set('order_id', orders[0].id);
}
```

### Request: Crear Orden

- Name: `Create Order`
- Method: `POST`
- URL: `{{api_url}}/orders`

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
  "user_id": "{{user_id}}",
  "status": "pending",
  "total": 99.99,
  "shipping_address": {
    "street": "123 Test Street",
    "city": "Test City",
    "zip": "12345"
  }
}
```

**Pre-request Script:**

```javascript
// Verificar que tenemos user_id
if (!pm.environment.get('user_id')) {
  console.warn("⚠️ user_id no definido. Ejecuta 'Login' primero.");
}
```

**Tests:**

```javascript
pm.test('Status 201 Created', function () {
  pm.response.to.have.status(201);
});

pm.test('Orden creada correctamente', function () {
  const orders = pm.response.json();
  pm.expect(orders).to.have.lengthOf(1);
  pm.expect(orders[0]).to.have.property('id');
  pm.expect(orders[0].status).to.equal('pending');

  // Guardar para otros tests
  pm.environment.set('new_order_id', orders[0].id);
});
```

---

## Coleccion: Reviews

### Request: Reviews de un Producto

- Name: `Get Product Reviews`
- Method: `GET`
- URL: `{{api_url}}/reviews?product_id=eq.{{product_id}}&select=*,user:users(name,avatar_url)&order=created_at.desc`

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
  "product_id": "{{product_id}}",
  "user_id": "{{user_id}}",
  "rating": 5,
  "comment": "Excelente producto! Muy recomendado."
}
```

---

## Testing de RLS Policies

### Test: No puedo ver ordenes de otros

1. Login como Usuario A
2. Ejecuta este request:

- Name: `RLS Test - Other User Orders`
- Method: `GET`
- URL: `{{api_url}}/orders?user_id=eq.00000000-0000-0000-0000-000000000000`

**Tests:**

```javascript
pm.test('Status 200 pero array vacio', function () {
  pm.response.to.have.status(200);
  const orders = pm.response.json();
  pm.expect(orders).to.be.an('array');
  pm.expect(orders).to.have.lengthOf(0);
});

console.log('✅ RLS Policy funcionando: No puedo ver ordenes de otros usuarios');
```

### Test: No puedo actualizar perfil de otro

- Name: `RLS Test - Update Other Profile`
- Method: `PATCH`
- URL: `{{api_url}}/users?id=eq.00000000-0000-0000-0000-000000000000`

**Body:**

```json
{
  "name": "Hacked!"
}
```

**Tests:**

```javascript
pm.test('No se actualizo ningun registro', function () {
  // PostgREST retorna array vacio si RLS bloquea
  const result = pm.response.json();
  pm.expect(result).to.have.lengthOf(0);
});

console.log('✅ RLS Policy funcionando: No puedo actualizar perfiles de otros');
```

---

## Pre-request Script Global

En la coleccion, puedes agregar un script que se ejecute antes de cada request:

**Collection > Pre-request Script:**

```javascript
// Verificar que tenemos token valido
const token = pm.environment.get('access_token');

if (!token && pm.request.headers.has('Authorization')) {
  console.warn('⚠️ No hay access_token. Ejecuta Login primero.');
}

// Opcional: Verificar expiracion del token
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // convertir a ms
    const now = Date.now();

    if (now > exp) {
      console.warn('⚠️ Token expirado. Ejecuta Login o Refresh Token.');
    }
  } catch (e) {
    // Token malformado
  }
}
```

---

## Collection Runner

Para ejecutar todos los tests de una coleccion:

1. Click en "..." de la coleccion
2. Run collection
3. Selecciona el environment
4. Configura:
   - Delay: 100ms (evitar rate limiting)
   - Iterations: 1
5. Run

### Orden Recomendado de Ejecucion

1. `Login - User`
2. `Get My Profile`
3. `Get Products` (guarda `product_id`)
4. `Get My Orders`
5. `Get Product Reviews`
6. RLS Tests

---

## Exportar e Importar

### Exportar Coleccion

1. Click derecho en la coleccion
2. Export
3. Format: Collection v2.1
4. Guardar como: `{{project}}-api.postman_collection.json`

### Exportar Environment

1. Click en el icono de ojo junto al environment
2. Export
3. Guardar como: `{{project}}-dev.postman_environment.json`

### Importar en Otro Equipo

1. Import > Upload Files
2. Seleccionar los archivos JSON
3. Ajustar variables de environment (passwords, keys)

---

## Tips Avanzados

### 1. Usar Variables Dinamicas

```javascript
// En Body
{
  "created_at": "{{$isoTimestamp}}",
  "unique_id": "{{$guid}}",
  "random_number": "{{$randomInt}}"
}
```

### 2. Chaining de Requests

```javascript
// En Tests del request A, guardar dato
pm.environment.set('product_id', pm.response.json()[0].id);

// En request B, usar
// URL: ?product_id=eq.{{product_id}}
```

### 3. Visualizar Responses

```javascript
// En Tests tab
const template = `
<table>
    <tr><th>ID</th><th>Name</th><th>Price</th></tr>
    {{#each response}}
    <tr>
        <td>{{id}}</td>
        <td>{{name}}</td>
        <td>{{price}}</td>
    </tr>
    {{/each}}
</table>
`;

pm.visualizer.set(template, { response: pm.response.json() });
```

---

## Siguiente Paso

Para testing con IA usando MCP:
--> [mcp-testing.md](./mcp-testing.md)
