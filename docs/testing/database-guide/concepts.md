# Testing de API y Base de Datos: Guía Conceptual

## Introducción

En el desarrollo de software moderno, un QA Engineer necesita entender cómo testear tanto la capa de API como la base de datos directamente. Esta guía te explica los conceptos fundamentales para que puedas realizar pruebas efectivas en ambas capas.

---

## ¿Cómo se documenta una API en la industria?

En equipos maduros, **no deberías necesitar preguntarle al Tech Lead** cómo usar la API. Lo esperado es que exista documentación dinámica accesible, generalmente en una URL como `/docs`, `/swagger` o `/api-docs`.

Si te encuentras preguntando al equipo o leyendo código directamente para entender la API, eso es síntoma de **deuda técnica**.

### El estándar actual: OpenAPI

**OpenAPI Specification (OAS)** es el estándar de facto para describir APIs REST. Antes se llamaba Swagger, y mucha gente aún usa ambos términos indistintamente.

Es un archivo YAML o JSON que describe:

- Todos los endpoints disponibles
- Métodos HTTP (GET, POST, PUT, DELETE...)
- Parámetros y cuerpos de request
- Respuestas posibles con sus tipos
- Esquemas de autenticación

### ¿Cómo se genera la documentación?

Existen dos enfoques principales:

**Code-first**: El código es la fuente de verdad. Usas decoradores o anotaciones en tu framework, y la documentación se genera automáticamente.

Ejemplos de frameworks que lo soportan:

- **FastAPI** (Python): genera OpenAPI sin configuración extra
- **NestJS** (Node): con decoradores `@ApiProperty()`, `@ApiResponse()`
- **Spring Boot** (Java): con springdoc-openapi

**Design-first**: Escribes la especificación OpenAPI primero, y luego generas código o mocks desde ella. Útil cuando hay contratos entre equipos.

### Herramientas de visualización

Una vez que tienes el archivo OpenAPI, lo renderizas con:

- **Swagger UI**: interfaz interactiva donde puedes probar endpoints directamente
- **Redoc**: documentación más limpia, estilo referencia
- **Stoplight**: plataforma completa de diseño de APIs

---

## Autenticación: El estándar actual

**JWT con Bearer tokens** es el estándar dominante para APIs privadas.

El flujo típico:

1. Haces login a `/auth/login` con credenciales
2. Recibes un token JWT
3. Envías ese token en el header `Authorization: Bearer <token>` en cada request

OAuth 2.0 se usa cuando necesitas delegar acceso (por ejemplo, "Iniciar sesión con Google").

---

## Caso específico: Supabase

### ¿Qué es PostgREST?

Supabase usa **PostgREST** internamente. Este servicio genera una API REST automáticamente basada en la estructura de tu base de datos PostgreSQL.

**Lo que obtienes sin hacer nada:**

- API REST completa para todas tus tablas
- Documentación auto-generada accesible desde el dashboard de Supabase (sección "API Docs")
- Generación de tipos TypeScript con `supabase gen types`

### Endpoints generados automáticamente

Por cada tabla en tu schema `public`, automáticamente tienes:

| Operación     | Método HTTP | Endpoint                          |
| ------------- | ----------- | --------------------------------- |
| Leer todos    | `GET`       | `/rest/v1/tabla`                  |
| Leer filtrado | `GET`       | `/rest/v1/tabla?columna=eq.valor` |
| Insertar      | `POST`      | `/rest/v1/tabla`                  |
| Actualizar    | `PATCH`     | `/rest/v1/tabla?id=eq.123`        |
| Eliminar      | `DELETE`    | `/rest/v1/tabla?id=eq.123`        |

### Autenticación en Supabase

```
Headers requeridos:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>  // opcional, para usuarios autenticados
```

La `anon key` da acceso básico, pero las políticas RLS (Row Level Security) determinan qué datos puede ver/modificar cada rol.

### OpenAPI en Supabase

**PostgREST sirve la especificación OpenAPI (Swagger 2.0) automáticamente.**

```
GET https://<project-ref>.supabase.co/rest/v1/?apikey=<SUPABASE_ANON_KEY>
```

Esto devuelve un JSON con la especificación completa: todas las tablas, columnas, tipos, relaciones.

La especificación **se genera dinámicamente** basándose en:

- Las tablas expuestas en el schema `public`
- Los permisos del rol que hace la petición (anon o authenticated)
- Los comentarios SQL que hayas puesto en tablas/columnas

### Relaciones (JOINs) en la API

Algo que mucha gente no sabe: PostgREST usa "embedding" para hacer JOINs automáticos basándose en las foreign keys:

```bash
# Obtener órdenes CON los datos del cliente (equivalente a un JOIN)
GET /rest/v1/orders?select=id,total,customers(name,email)

# Equivale aproximadamente a:
SELECT orders.id, orders.total, customers.name, customers.email
FROM orders
JOIN customers ON orders.customer_id = customers.id
```

**Limitaciones de la API:**

- No puedes hacer JOINs arbitrarios (solo los definidos por foreign keys)
- No puedes hacer agregaciones complejas (`GROUP BY`, `HAVING`, subqueries)
- No puedes hacer `UNION`, CTEs, window functions, etc.

Para eso necesitas **RPC functions** (funciones SQL que expones como endpoints) o **acceso SQL directo**.

---

## Diferencia entre Testing de API vs Base de Datos

### ¿La API es SQL "disfrazado"?

Sí y no. PostgREST traduce requests HTTP a queries SQL, pero con limitaciones y algunas capacidades extra.

### Las capas del sistema

```
┌─────────────────────────────────────────┐
│           Frontend (UI)                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         API Layer (PostgREST)            │  ← Testing de API
│  • Autenticación JWT                     │
│  • Row Level Security (RLS)              │
│  • Validaciones de entrada               │
│  • Transformación de respuesta           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Base de Datos (Postgres)         │  ← Testing de DB
│  • Constraints (FK, UNIQUE, CHECK)       │
│  • Triggers                              │
│  • Datos "crudos"                        │
└─────────────────────────────────────────┘
```

### Comparación directa

| Aspecto                     | Testing via API                                       | Testing via SQL directo   |
| --------------------------- | ----------------------------------------------------- | ------------------------- |
| **Qué testeas**             | El contrato de la API (endpoints, auth, validaciones) | Los datos en sí           |
| **Capa de acceso**          | Pasa por RLS, validaciones, middleware                | Directo a la DB           |
| **Autenticación**           | JWT tokens, API keys                                  | Connection string         |
| **Permisos**                | Políticas RLS del usuario                             | Permisos del rol Postgres |
| **Formato de respuesta**    | JSON estructurado                                     | Rows/columnas             |
| **Joins complejos**         | Limitado a foreign keys                               | Cualquier query           |
| **Validaciones de negocio** | Se aplican (triggers, constraints via API)            | Depende de cómo insertes  |

---

## ¿Cuándo usar cada tipo de testing?

### API testing es mejor para:

**Validar el contrato de la API:**

```
POST /rest/v1/users con email inválido
→ Debería devolver 400 Bad Request
→ El mensaje de error debería ser claro
```

**Validar autorización:**

```
GET /rest/v1/orders (sin token)
→ Debería devolver 401

GET /rest/v1/orders (con token de usuario A)
→ Solo debería ver órdenes del usuario A (RLS)
```

**Validar que la respuesta tiene el formato esperado:**

```
GET /rest/v1/products?select=id,name,price
→ El JSON debería tener exactamente esos campos
→ Los tipos deberían ser correctos
```

### SQL testing es mejor para:

**Verificar integridad de datos después de una operación:**

```sql
-- El frontend hizo un checkout, verifico que se crearon todas las entidades
SELECT COUNT(*) FROM orders WHERE user_id = 'X' AND created_at > NOW() - INTERVAL '1 minute';
SELECT COUNT(*) FROM order_items WHERE order_id = (SELECT id FROM orders WHERE...);
SELECT balance FROM wallets WHERE user_id = 'X'; -- ¿Se descontó correctamente?
```

**Queries de validación que la API no expone:**

```sql
-- ¿Hay órdenes huérfanas (sin usuario)?
SELECT * FROM orders WHERE user_id NOT IN (SELECT id FROM users);

-- ¿Los totales cuadran?
SELECT o.id, o.total, SUM(oi.price * oi.quantity) as calculated
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total
HAVING o.total != SUM(oi.price * oi.quantity);
```

**Verificar efectos secundarios (triggers, cascadas):**

```sql
-- Si borré un usuario, ¿se borraron sus datos relacionados?
SELECT * FROM orders WHERE user_id = 'usuario_eliminado';
SELECT * FROM sessions WHERE user_id = 'usuario_eliminado';
```

### El approach combinado (el más potente)

```
1. Hago una acción via UI o API
2. Verifico con SQL que los datos son correctos
3. Verifico con API que la respuesta es correcta
```

**Ejemplo concreto:**

```javascript
// Test: Crear orden de compra
test('checkout creates order with correct items', async () => {
  // 1. Acción via API (simula lo que haría el frontend)
  const response = await api.post('/checkout', {
    items: [{ product_id: 1, quantity: 2 }],
  });

  expect(response.status).toBe(201);
  const orderId = response.data.id;

  // 2. Verificación via API (lo que vería el usuario)
  const orderResponse = await api.get(`/orders/${orderId}`);
  expect(orderResponse.data.status).toBe('pending');

  // 3. Verificación via SQL (lo que está realmente en la DB)
  const dbResult = await sql`
    SELECT
      o.total,
      COUNT(oi.id) as item_count,
      SUM(oi.quantity) as total_quantity
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ${orderId}
    GROUP BY o.id
  `;

  expect(dbResult[0].item_count).toBe(1);
  expect(dbResult[0].total_quantity).toBe(2);
});
```

---

## Bugs que detecta cada tipo de testing

### Solo detectables con SQL:

- Datos huérfanos por cascadas mal configuradas
- Timestamps incorrectos por problemas de timezone
- Campos que la API no expone pero están mal
- Inconsistencias entre tablas relacionadas

### Solo detectables con API:

- Respuestas con formato incorrecto
- Políticas RLS que filtran datos incorrectamente
- Validaciones de entrada que no funcionan
- Headers de cache incorrectos

---

## Seguridad: DDL vs DML

Hay una distinción clave para entender los permisos:

| Nivel            | Qué controla                                     | Cómo se configura                              |
| ---------------- | ------------------------------------------------ | ---------------------------------------------- |
| **DDL** (schema) | Crear/modificar/eliminar tablas, columnas, tipos | Roles de Postgres (`postgres`, `service_role`) |
| **DML** (datos)  | SELECT, INSERT, UPDATE, DELETE sobre filas       | Políticas RLS + roles `anon`/`authenticated`   |

**Punto importante:** La `anon key` y `service_role key` de Supabase **NO pueden modificar el schema**. Solo el rol `postgres` (acceso directo a la DB) puede hacer DDL.

Cuando usas la API REST con la `anon key`, **solo puedes hacer operaciones DML** (leer, insertar, actualizar, eliminar datos). No puedes tocar columnas ni tipos.

---

## Resumen

| Pregunta                        | Respuesta                                                  |
| ------------------------------- | ---------------------------------------------------------- |
| ¿La API es SQL disfrazado?      | Parcialmente. Traduce HTTP a SQL pero con limitaciones     |
| ¿Supabase hace JOINs?           | Sí, via "embedding" basado en foreign keys                 |
| ¿Es lo mismo testear API vs DB? | No. Testeas capas diferentes con preocupaciones diferentes |
| ¿Cuál usar para QA?             | **Ambos**, porque cada uno detecta tipos de bugs distintos |

La combinación de ambos tipos de testing es lo que hace un QA Engineer completo: no solo verificar que "funciona" sino que los datos son **correctos, consistentes y completos**.
