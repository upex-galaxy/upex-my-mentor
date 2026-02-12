# Notas de sesion de testing exploratorio de base de datos

Fecha: 2026-02-12
Feature: MYM-14 - Ver todos los mentores disponibles
Base de datos: Supabase (staging, compartida entre entornos)
Tipo de sesion: testing exploratorio de BD (solo lectura)

---

## Resumen ejecutivo

- Estado general: SE ENCONTRARON PROBLEMAS
- Tablas evaluadas: profiles, reviews
- Restricciones verificadas: 5 (PK/UK/FK/CHECK)
- Disparadores verificados: 4 (actualizacion de rating + notificaciones de vetting de mentores)
- Problemas de integridad de datos: 2

---

## Plan de exploracion de base de datos

Feature: galeria de mentores (solo verificados, orden por rating)
Scope: MYM-14

Tablas involucradas:

| Tabla     | Rol en la feature        | Columnas clave |
| --------- | ------------------------ | -------------- |
| profiles  | Catalogo de mentores     | id, role, is_verified, name, specialties, hourly_rate, average_rating, total_reviews |
| reviews   | Fuente de rating/reviews | id, subject_id, rating, booking_id |

Puntos de verificacion:

1) Solo aparecen mentores verificados (`role = 'mentor'`, `is_verified = true`).
2) El rating y total_reviews reflejan la tabla reviews (integridad del trigger).
3) Especialidad principal y tarifa por hora existen para mentores verificados.
4) El orden por average_rating desc es viable con los datos actuales.

---

## Verificacion de esquema

### profiles

Columnas (subset clave):

- id (uuid, PK, FK -> auth.users.id)
- email (varchar, UNIQUE, NOT NULL)
- role (user_role enum, NOT NULL)
- is_verified (boolean, default false)
- specialties (text[])
- hourly_rate (numeric)
- average_rating (numeric)
- total_reviews (integer)

Restricciones:

- PK: profiles_pkey (id)
- FK: profiles_id_fkey -> auth.users(id)
- UNIQUE: profiles_email_key (email)

Disparadores:

- on_mentor_vetting_change (AFTER UPDATE) -> notify_mentor_vetting_change()

### reviews

Columnas (subset clave):

- id (uuid, PK)
- reviewer_id (uuid, FK -> profiles.id)
- subject_id (uuid, FK -> profiles.id)
- booking_id (uuid, nullable)
- rating (integer, NOT NULL)

Restricciones:

- PK: reviews_pkey (id)
- FK: fk_reviewer -> profiles(id)
- FK: fk_subject -> profiles(id)
- CHECK: reviews_rating_check (rating between 1 and 5)
- UNIQUE: unique_review_per_booking_reviewer (booking_id, reviewer_id)

Disparadores:

- trigger_update_profile_rating_insert (AFTER INSERT) -> update_profile_rating()
- trigger_update_profile_rating_update (AFTER UPDATE) -> update_profile_rating()
- trigger_update_profile_rating_delete (AFTER DELETE) -> update_profile_rating()

---

## Verificacion de estado de datos

### Disponibilidad de mentores para el listado

Query:

```sql
select
  (select count(*) from profiles where role = 'mentor' and is_verified = true) as verified_mentors,
  (select count(*) from profiles where role = 'mentor' and is_verified = false) as unverified_mentors;
```

Actual:

- verified_mentors: 22
- unverified_mentors: 1

Estado: VERIFICADO

### Mentores verificados sin nombre

Query:

```sql
select id, name
from profiles
where role = 'mentor' and is_verified = true and (name is null or trim(name) = '');
```

Actual: 0 filas
Estado: VERIFICADO

### Rangos de rating

Query:

```sql
select id, average_rating
from profiles
where average_rating is not null and (average_rating < 0 or average_rating > 5);
```

Actual: 0 filas
Estado: VERIFICADO

### Viabilidad de orden (average_rating desc)

Query:

```sql
select id, name, average_rating, total_reviews
from profiles
where role = 'mentor' and is_verified = true
order by average_rating desc nulls last, id asc
limit 10;
```

Actual: top de mentores ordenado como se espera (rating desc, nulls al final)
Estado: VERIFICADO

---

## Testing de restricciones

Se omitieron pruebas de escritura para evitar mutar datos de staging compartido.
La validacion se realizo por inspeccion de esquema + checks de integridad.

---

## Comprobaciones de integridad de datos

### Check A: Consistencia entre profiles y reviews

Query:

```sql
select p.id, p.name, p.total_reviews, p.average_rating, count(r.id) as calc_count
from profiles p
left join reviews r on r.subject_id = p.id
where p.role = 'mentor' and p.is_verified = true
group by p.id, p.name, p.total_reviews, p.average_rating
having (p.total_reviews is not null and p.total_reviews > 0 and count(r.id) = 0)
    or (p.average_rating is not null and count(r.id) = 0);
```

Actual:

- 1 mentor con rating/contador almacenado pero 0 reviews: profile id `81dce8b2-c2c6-486e-856c-b5645b2e68e9`

Estado: FALLA

### Check B: Reviews solo asociados a mentores

Query:

```sql
select r.id, r.subject_id
from reviews r
left join profiles p on p.id = r.subject_id
where p.id is null or p.role <> 'mentor';
```

Actual: 0 filas
Estado: APROBADO

### Check C: Reviews asociados a bookings

Query:

```sql
select count(*) as total_reviews,
       count(*) filter (where booking_id is null) as reviews_without_booking
from reviews;
```

Actual:

- total_reviews: 16
- reviews_without_booking: 16

Estado: ADVERTENCIA (probables datos semilla, pero rompen trazabilidad)

### Check D: Mentores verificados sin especialidad o tarifa

Query:

```sql
select id, name, specialties
from profiles
where role = 'mentor' and is_verified = true
  and (specialties is null or array_length(specialties, 1) = 0);

select id, name, hourly_rate
from profiles
where role = 'mentor' and is_verified = true
  and (hourly_rate is null or hourly_rate <= 0);
```

Actual:

- 4 mentores verificados sin specialties
- 4 mentores verificados sin hourly_rate (mismo set)

Estado: ADVERTENCIA (puede violar el AC de especialidad y tarifa)

---

## Issues encontrados

### Issue 1: Rating y total_reviews fuera de sincronizacion

- Severidad: Media
- Tabla(s): profiles, reviews
- Evidencia: profile id `81dce8b2-c2c6-486e-856c-b5645b2e68e9` tiene total_reviews=12, average_rating=4.9, pero 0 reviews.
- Esperado: reviews debe tener 12 filas para ese subject_id o profiles debe mostrar 0/null.
- Actual: profiles tiene valores sin respaldo en reviews.
- Impacto: la lista muestra rating/reviews no sustentados; afecta confianza y orden.

### Issue 2: Mentores verificados sin campos base de tarjeta

- Severidad: Baja
- Tabla(s): profiles
- Evidencia: 4 mentores verificados con specialties y hourly_rate null.
- Esperado: mentores verificados deben tener al menos 1 specialty y hourly_rate positivo.
- Actual: campos ausentes, UI muestra 0/hr y sin especialidad.
- Impacto: viola expectativas del AC de la tarjeta; UX debil.

---

## Observaciones y recomendaciones

Hallazgos positivos:

- No hay mentores verificados sin nombre.
- Los ratings estan dentro de 1-5.
- El orden por average_rating desc funciona con los datos actuales.

Areas de preocupacion:

- Todas las reviews carecen de booking_id (gap de trazabilidad).

Recomendaciones:

1) Recalcular o reconciliar ratings en profiles desde reviews.
2) Enforzar `hourly_rate > 0` y `specialties` no vacio para mentores verificados (constraint o regla de verificacion).
3) Asegurar que reviews creadas por booking seteen booking_id.

---

## Punto de decision

Resultado: PROBLEMAS DE INTEGRIDAD

Accion:

- Reportar Issue 1 como bug de integridad (rating inconsistente).
- Reportar Issue 2 como problema de calidad de datos/UX (specialties/hourly_rate faltante).
