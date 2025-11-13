# Backend Setup - Upex My Mentor

**Generado:** Fase 2.5 - Backend Infrastructure
**Fecha:** 2025-11-12
**Database:** Supabase PostgreSQL

---

## 📊 Database Schema

### Tablas Creadas

**profiles**
- **Propósito:** Almacena los datos públicos de todos los usuarios, tanto mentores como estudiantes. Se enriquece con campos específicos para mentores.
- **Columnas principales:** `id` (FK a auth.users), `email`, `name`, `role`, `specialties`, `hourly_rate`.
- **Relaciones:** Vinculada 1 a 1 con la tabla `auth.users` de Supabase.
- **RLS:**
    - Lectura: Pública para todos.
    - Inserción: Solo el propio usuario puede crear su perfil.
    - Actualización: Solo el propio usuario puede actualizar su perfil.

**reviews**
- **Propósito:** Almacena las valoraciones y comentarios que los usuarios se dejan entre sí.
- **Columnas principales:** `id`, `reviewer_id` (FK a profiles), `subject_id` (FK a profiles), `rating`, `comment`.
- **Relaciones:** Vinculada a la tabla `profiles` para identificar quién hace la reseña y quién la recibe.
- **RLS:**
    - Lectura: Pública para todos.
    - Inserción: Cualquier usuario autenticado puede crear una reseña.
    - Actualización/Eliminación: Solo el autor de la reseña puede modificarla o borrarla.

### Funciones y Triggers

**handle_new_user()**
- **Propósito:** Un trigger que se ejecuta automáticamente cuando un nuevo usuario se registra en Supabase Auth.
- **Acción:** Crea una entrada correspondiente en la tabla `public.profiles`, estableciendo el `id`, `email` y `name` del nuevo usuario, con un rol por defecto de 'student'.

**get_all_unique_skills()**
- **Propósito:** Una función de base de datos (RPC) que devuelve una lista de todas las especialidades (`specialties`) únicas de los mentores.
- **Uso:** Se utiliza en la página de búsqueda de mentores para poblar los filtros de habilidades.

---

## 🔐 Row Level Security (RLS)

- RLS está **habilitado** en todas las tablas (`profiles`, `reviews`).
- Las políticas aseguran que los usuarios solo puedan modificar sus propios datos, mientras que la información pública (perfiles de mentores, reseñas) es de lectura abierta para facilitar la navegación en el marketplace.

---

## 🔑 Authentication

**Provider:** Supabase Auth
**Métodos habilitados:** Email/Password

**Flujo:**
1.  **Signup:** Un nuevo usuario se registra a través de la UI. `supabase.auth.signUp()` crea un registro en `auth.users`.
2.  **Trigger:** El trigger `on_auth_user_created` se dispara y ejecuta `handle_new_user()` para crear el perfil en `public.profiles`.
3.  **Login:** El usuario inicia sesión con `supabase.auth.signInWithPassword()`, obteniendo un JWT.
4.  **Protected Routes:** El `middleware.ts` interecepta las peticiones, valida la sesión del JWT y redirige a `/login` si es necesario.
5.  **State Management:** `AuthContext` escucha los cambios de estado de autenticación con `onAuthStateChange` y mantiene la información del usuario actualizada en toda la aplicación.

---

## 🌐 API Layer

- **Cliente de Servidor (`src/lib/supabase/server.ts`):** Para uso en Server Components y API Routes.
- **Cliente de Cliente (`src/lib/supabase/client.ts`):** Para uso en Client Components.
- **Tipos (`src/types/supabase.ts`):** Tipos de TypeScript generados automáticamente desde el esquema de la base de datos para garantizar la seguridad de tipos en las consultas.

---

## 🛠️ Comandos Útiles

**Regenerar tipos:**
```bash
bunx supabase gen types typescript --project-id ionevzckjyxtpmyenbxc > src/types/supabase.ts
```

---

## 📝 Próximos Pasos

1.  Configurar `.env.local` con credenciales reales de Supabase.
2.  Implementar el resto de las features del MVP (booking, pagos, etc.).
3.  Agregar más tablas (`bookings`, `transactions`) según las necesidades de las próximas historias de usuario.
