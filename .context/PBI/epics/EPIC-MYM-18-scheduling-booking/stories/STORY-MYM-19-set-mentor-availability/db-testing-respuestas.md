# Respuestas: MYM-19 - Database Testing

> **Aprendizaje Basado en Consignas** (Prompt-Driven Learning)
>
> Soluciones completas a las consignas de `db-testing-consignas.md`.
> Úsalo para autoevaluación o como referencia cuando estés bloqueado.
>
> **Documentos relacionados:**
> - `db-testing-analisis.md` - Mapeo de ACs a consignas
> - `db-testing-consignas.md` - Los problemas a resolver

---

## Setup Inicial

Antes de comenzar, ejecuta esta query para obtener el mentor de prueba:

```sql
SELECT id, name, email, role
FROM profiles
WHERE role = 'mentor' AND is_verified = true
LIMIT 1;
```

**Guarda el `id` resultante** - lo usaremos como `{MENTOR_ID}` en las siguientes soluciones.

**Ejemplo de resultado:**
| id | name | email | role |
|----|------|-------|------|
| `a1b2c3d4-...` | Carlos García | carlos@example.com | mentor |

---

## SOLUCIONES

---

### SOLUCIÓN CONSIGNA 1: Exploración Inicial

#### Respuesta

```sql
SELECT
    day_of_week,
    start_time,
    end_time,
    is_active
FROM mentor_availability
ORDER BY day_of_week;
```

#### Explicación
- `SELECT` con las columnas específicas que nos pidieron
- `ORDER BY day_of_week` ordena de 0 (Domingo) a 6 (Sábado)
- No usamos `WHERE` porque queremos TODOS los registros

#### Resultado Esperado
Una tabla con todos los slots del sistema, ordenados por día:

| day_of_week | start_time | end_time | is_active |
|-------------|------------|----------|-----------|
| 0 | 10:00:00 | 12:00:00 | true |
| 1 | 09:00:00 | 11:00:00 | true |
| 1 | 14:00:00 | 16:00:00 | true |
| ... | ... | ... | ... |

#### Errores Comunes
- Usar `SELECT *` en lugar de columnas específicas (funciona pero no es lo pedido)
- Olvidar el `ORDER BY`

---

### SOLUCIÓN CONSIGNA 2: Verificación con Relación (JOIN)

#### Respuesta

```sql
SELECT
    p.name AS mentor_name,
    p.email,
    ma.day_of_week,
    ma.start_time,
    ma.end_time
FROM mentor_availability ma
INNER JOIN profiles p ON ma.mentor_id = p.id
ORDER BY p.name, ma.day_of_week;
```

#### Explicación
- `INNER JOIN` une las dos tablas donde `mentor_id = profiles.id`
- Usamos aliases (`ma`, `p`) para hacer la query más legible
- `AS mentor_name` renombra la columna en el resultado
- El `INNER JOIN` automáticamente excluye slots sin mentor válido

#### Resultado Esperado
| mentor_name | email | day_of_week | start_time | end_time |
|-------------|-------|-------------|------------|----------|
| Ana López | ana@... | 1 | 09:00:00 | 11:00:00 |
| Ana López | ana@... | 3 | 14:00:00 | 17:00:00 |
| Carlos García | carlos@... | 2 | 10:00:00 | 12:00:00 |

#### Errores Comunes
- Confundir `JOIN` con `LEFT JOIN` (en este caso ambos funcionan si no hay datos huérfanos)
- Olvidar especificar la condición del JOIN (`ON ...`)
- No usar aliases y escribir nombres completos de tabla (más largo pero funciona)

---

### SOLUCIÓN CONSIGNA 3: Filtrado Específico

#### Respuesta

**Opción A: Usando IN**
```sql
SELECT
    day_of_week,
    start_time,
    end_time
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week IN (1, 3);
```

**Opción B: Usando OR**
```sql
SELECT
    day_of_week,
    start_time,
    end_time
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND (day_of_week = 1 OR day_of_week = 3);
```

#### Explicación
- `WHERE mentor_id = ...` filtra por el mentor específico
- `AND day_of_week IN (1, 3)` filtra solo Lunes (1) y Miércoles (3)
- La opción con `IN` es más limpia cuando hay múltiples valores
- Los paréntesis en la opción B son importantes por precedencia de operadores

#### Resultado Esperado
| day_of_week | start_time | end_time |
|-------------|------------|----------|
| 1 | 09:00:00 | 11:00:00 |
| 3 | 14:00:00 | 17:00:00 |

#### Errores Comunes
- Olvidar filtrar por `mentor_id` (devolvería datos de todos los mentores)
- En opción B, olvidar los paréntesis alrededor del OR

---

### SOLUCIÓN CONSIGNA 4: Acción desde Frontend + Verificación

#### Respuesta

```sql
SELECT *
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 5
  AND start_time = '14:00:00'
  AND end_time = '16:00:00';
```

**Alternativa más flexible (por si el formato de hora varía):**
```sql
SELECT *
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 5
  AND start_time::text LIKE '14:00%'
  AND end_time::text LIKE '16:00%';
```

#### Explicación
- Filtramos por todas las condiciones que deben cumplirse
- `day_of_week = 5` es Viernes (Dom=0, Lun=1, Mar=2, Mie=3, Jue=4, **Vie=5**, Sab=6)
- Las horas se comparan como `'HH:MM:SS'` o simplemente `'HH:MM'` dependiendo del formato de la DB
- `::text LIKE` convierte a texto y busca patrón (más flexible)

#### Resultado Esperado
Si el slot se creó correctamente, debe devolver **exactamente 1 fila**:

| id | mentor_id | day_of_week | start_time | end_time | is_active |
|----|-----------|-------------|------------|----------|-----------|
| uuid... | {MENTOR_ID} | 5 | 14:00:00 | 16:00:00 | true |

Si devuelve **0 filas**, el test FALLA (el slot no se guardó).

#### Errores Comunes
- Usar el número incorrecto para el día de la semana
- Formato de hora incorrecto (`14:00` vs `14:00:00`)
- Olvidar alguna de las condiciones AND

---

### SOLUCIÓN CONSIGNA 5: Conteo y Agregación

#### Respuesta

```sql
SELECT
    p.name AS mentor_name,
    COUNT(ma.id) AS total_slots
FROM profiles p
LEFT JOIN mentor_availability ma ON p.id = ma.mentor_id
WHERE p.role = 'mentor'
GROUP BY p.id, p.name
ORDER BY total_slots DESC;
```

#### Explicación
- `LEFT JOIN` para incluir mentores aunque no tengan slots (mostrarían 0)
- `COUNT(ma.id)` cuenta los slots (no `COUNT(*)` que contaría la fila del mentor)
- `GROUP BY` agrupa todos los slots de cada mentor para contarlos
- `ORDER BY ... DESC` ordena de mayor a menor
- Filtramos `WHERE p.role = 'mentor'` para excluir students/admins

#### Resultado Esperado
| mentor_name | total_slots |
|-------------|-------------|
| Carlos García | 5 |
| Ana López | 3 |
| María Rodríguez | 2 |
| Pedro Martínez | 0 |

#### Errores Comunes
- Usar `INNER JOIN` en lugar de `LEFT JOIN` (excluiría mentores sin slots)
- Olvidar incluir `p.id` en el `GROUP BY` (error de SQL)
- Usar `COUNT(*)` que daría resultados incorrectos con LEFT JOIN

---

### SOLUCIÓN CONSIGNA 6: Verificación de Rango de Tiempo

#### Respuesta

**Opción A: Con NOT BETWEEN**
```sql
SELECT
    ma.*,
    p.name AS mentor_name
FROM mentor_availability ma
JOIN profiles p ON ma.mentor_id = p.id
WHERE ma.start_time NOT BETWEEN '08:00:00' AND '22:00:00';
```

**Opción B: Con comparadores**
```sql
SELECT
    ma.*,
    p.name AS mentor_name
FROM mentor_availability ma
JOIN profiles p ON ma.mentor_id = p.id
WHERE ma.start_time < '08:00:00'
   OR ma.start_time > '22:00:00';
```

#### Explicación
- `NOT BETWEEN` encuentra valores fuera del rango
- La opción B es equivalente pero más explícita
- Incluimos JOIN para saber a qué mentor pertenece cada slot problemático

#### Resultado Esperado
**Idealmente: 0 filas** (todos los slots están en horario válido)

Si hay filas, son datos potencialmente inválidos:
| id | mentor_id | day_of_week | start_time | mentor_name |
|----|-----------|-------------|------------|-------------|
| uuid... | ... | 2 | 06:00:00 | Juan... |

#### Errores Comunes
- Confundir `BETWEEN` (inclusivo) - incluye los extremos 08:00 y 22:00
- Olvidar que buscamos FUERA del rango, no dentro

---

### SOLUCIÓN CONSIGNA 7: INSERT Manual

#### Respuesta

**Query 1: INSERT**
```sql
INSERT INTO mentor_availability (
    mentor_id,
    day_of_week,
    start_time,
    end_time,
    is_active
) VALUES (
    '{MENTOR_ID}',
    6,              -- Sábado
    '10:00:00',
    '12:00:00',
    true
);
```

**Query 2: Verificación**
```sql
SELECT *
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 6;
```

#### Explicación
- `INSERT INTO tabla (columnas) VALUES (valores)`
- El `id` se genera automáticamente (uuid)
- `created_at` y `updated_at` también se generan automáticamente
- La segunda query verifica que se insertó correctamente

#### Resultado Esperado
El SELECT debe devolver el registro recién creado:

| id | mentor_id | day_of_week | start_time | end_time | is_active |
|----|-----------|-------------|------------|----------|-----------|
| nuevo-uuid | {MENTOR_ID} | 6 | 10:00:00 | 12:00:00 | true |

#### Errores Comunes
- Olvidar las comillas en los valores de texto/tiempo
- Poner el día incorrecto (Sábado = 6, no 7)
- Intentar insertar un valor para `id` (dejar que la DB lo genere)

---

### SOLUCIÓN CONSIGNA 8: UPDATE

#### Respuesta

**Query 1: UPDATE**
```sql
UPDATE mentor_availability
SET start_time = '15:00:00',
    end_time = '17:00:00',
    updated_at = NOW()
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 5;
```

**Alternativa más simple (sin updated_at manual):**
```sql
UPDATE mentor_availability
SET start_time = '15:00:00',
    end_time = '17:00:00'
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 5;
```

**Query 2: Verificación**
```sql
SELECT day_of_week, start_time, end_time, updated_at
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 5;
```

#### Explicación
- `UPDATE tabla SET columna = valor WHERE condición`
- **CRÍTICO**: Siempre incluir `WHERE` o actualizarás TODA la tabla
- `updated_at = NOW()` actualiza el timestamp (puede ser automático con triggers)
- Se pueden actualizar múltiples columnas separadas por coma

#### Resultado Esperado
| day_of_week | start_time | end_time | updated_at |
|-------------|------------|----------|------------|
| 5 | 15:00:00 | 17:00:00 | 2025-01-15 ... |

#### Errores Comunes
- **PELIGROSO**: Olvidar el WHERE (actualiza TODOS los registros)
- Usar `AND` entre las columnas del SET (debe ser coma)
- Olvidar las comillas en los valores de tiempo

---

### SOLUCIÓN CONSIGNA 9: DELETE

#### Respuesta

**Query 0: Verificar qué se va a eliminar (SIEMPRE hacer esto primero)**
```sql
SELECT *
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 6;
```

**Query 1: DELETE**
```sql
DELETE FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 6;
```

**Query 2: Verificación**
```sql
SELECT *
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 6;
```

#### Explicación
- `DELETE FROM tabla WHERE condición`
- **CRÍTICO**: Siempre incluir `WHERE` o eliminarás TODA la tabla
- **MEJOR PRÁCTICA**: Hacer SELECT con el mismo WHERE antes de DELETE
- No hay "deshacer" para DELETE (a menos que tengas backup)

#### Resultado Esperado
La query de verificación debe devolver **0 filas** (el registro fue eliminado).

#### Errores Comunes
- **MUY PELIGROSO**: Olvidar el WHERE (elimina TODOS los registros)
- No verificar antes qué se va a eliminar
- Confundir DELETE con TRUNCATE (TRUNCATE elimina todo sin WHERE)

---

### SOLUCIÓN CONSIGNA 10: Verificación de Atomicidad

#### Respuesta

**Query 1: Contar ANTES del cambio**
```sql
SELECT COUNT(*) AS slots_antes
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}';
```

*[Usuario hace cambios en el frontend]*

**Query 2: Contar DESPUÉS del cambio**
```sql
SELECT COUNT(*) AS slots_despues
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}';
```

**Query 3: Verificar el slot específico**
```sql
SELECT *
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week = 2
  AND start_time = '10:00:00'
  AND end_time = '12:00:00';
```

**Query 4: Verificar que los anteriores no existen**
```sql
SELECT *
FROM mentor_availability
WHERE mentor_id = '{MENTOR_ID}'
  AND day_of_week != 2;
```

#### Explicación
- Query 1: Guarda el número inicial de slots
- Query 2: Después del cambio, debería ser `1`
- Query 3: Verifica que el nuevo slot existe con los datos correctos
- Query 4: Verifica que NO existen otros slots (deben haber sido eliminados)

#### Resultado Esperado
- Query 1: `slots_antes = N` (algún número > 0)
- Query 2: `slots_despues = 1`
- Query 3: Exactamente 1 fila con el slot del Martes
- Query 4: 0 filas (no hay slots de otros días)

#### Errores Comunes
- No hacer el conteo ANTES del cambio (perdemos la referencia)
- Olvidar verificar que los slots anteriores fueron eliminados

---

### SOLUCIÓN CONSIGNA 11: Verificación de Relación Rota

#### Respuesta

**Opción A: Con LEFT JOIN y NULL**
```sql
SELECT ma.*
FROM mentor_availability ma
LEFT JOIN profiles p ON ma.mentor_id = p.id
WHERE p.id IS NULL;
```

**Opción B: Con NOT IN**
```sql
SELECT *
FROM mentor_availability
WHERE mentor_id NOT IN (
    SELECT id FROM profiles
);
```

**Opción C: Con NOT EXISTS**
```sql
SELECT *
FROM mentor_availability ma
WHERE NOT EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = ma.mentor_id
);
```

#### Explicación
- **Opción A**: El LEFT JOIN incluye todas las filas de `mentor_availability`. Si no hay match en `profiles`, las columnas de `profiles` son NULL.
- **Opción B**: La subconsulta obtiene todos los IDs válidos, y buscamos los que NO están en esa lista.
- **Opción C**: Para cada slot, verificamos si NO EXISTE un profile con ese ID.

#### Resultado Esperado
**Idealmente: 0 filas** (todos los slots tienen un mentor válido)

Si hay filas, son datos corruptos que necesitan limpieza:
| id | mentor_id | day_of_week | start_time |
|----|-----------|-------------|------------|
| uuid... | uuid-inexistente | 3 | 14:00:00 |

#### Errores Comunes
- Confundir LEFT JOIN con INNER JOIN (INNER no mostraría los huérfanos)
- En opción B, olvidar el `NOT` antes de `IN`
- No entender que buscamos relaciones ROTAS, no válidas

---

### SOLUCIÓN CONSIGNA 12: Búsqueda por Patrón

#### Respuesta

**Opción A: Con ILIKE (PostgreSQL - case insensitive)**
```sql
SELECT
    p.name AS mentor_name,
    ma.day_of_week,
    ma.start_time,
    ma.end_time
FROM mentor_availability ma
JOIN profiles p ON ma.mentor_id = p.id
WHERE p.name ILIKE '%carlos%'
   OR p.name ILIKE '%ana%';
```

**Opción B: Con LOWER (más portable)**
```sql
SELECT
    p.name AS mentor_name,
    ma.day_of_week,
    ma.start_time,
    ma.end_time
FROM mentor_availability ma
JOIN profiles p ON ma.mentor_id = p.id
WHERE LOWER(p.name) LIKE '%carlos%'
   OR LOWER(p.name) LIKE '%ana%';
```

#### Explicación
- `%` es el comodín que significa "cualquier cantidad de caracteres"
- `ILIKE` es LIKE pero ignora mayúsculas/minúsculas (específico de PostgreSQL)
- `LOWER()` convierte el texto a minúsculas para comparar
- `%carlos%` encuentra: "Carlos", "carlos garcia", "Juan Carlos", etc.

#### Resultado Esperado
| mentor_name | day_of_week | start_time | end_time |
|-------------|-------------|------------|----------|
| Carlos García | 1 | 09:00:00 | 11:00:00 |
| Carlos García | 3 | 14:00:00 | 17:00:00 |
| Ana López | 2 | 10:00:00 | 12:00:00 |

#### Errores Comunes
- Usar `LIKE` sin `LOWER()` (no encontraría "Carlos" si buscas "carlos")
- Olvidar los `%` (sin ellos busca coincidencia exacta)
- Usar `=` en lugar de `LIKE` (= es para igualdad exacta)

---

## Resumen de Comandos Aprendidos

| Comando | Uso | Ejemplo |
|---------|-----|---------|
| `SELECT` | Leer datos | `SELECT * FROM tabla` |
| `WHERE` | Filtrar filas | `WHERE columna = valor` |
| `ORDER BY` | Ordenar resultados | `ORDER BY columna DESC` |
| `JOIN` | Unir tablas | `JOIN tabla2 ON t1.id = t2.fk` |
| `LEFT JOIN` | Unir incluyendo NULLs | `LEFT JOIN tabla2 ON ...` |
| `GROUP BY` | Agrupar para agregación | `GROUP BY columna` |
| `COUNT()` | Contar filas | `COUNT(*)` o `COUNT(columna)` |
| `IN` | Múltiples valores | `WHERE col IN (1, 2, 3)` |
| `BETWEEN` | Rango de valores | `WHERE col BETWEEN a AND b` |
| `LIKE/ILIKE` | Búsqueda por patrón | `WHERE col LIKE '%texto%'` |
| `INSERT` | Crear registro | `INSERT INTO tabla (cols) VALUES (vals)` |
| `UPDATE` | Modificar registro | `UPDATE tabla SET col=val WHERE ...` |
| `DELETE` | Eliminar registro | `DELETE FROM tabla WHERE ...` |
| `IS NULL` | Verificar nulo | `WHERE columna IS NULL` |
| `NOT` | Negar condición | `NOT IN`, `NOT BETWEEN`, `IS NOT NULL` |

---

## Checklist de Validación

Usa esta lista para verificar que cada test pasó:

- [ ] **Consigna 1**: Query devuelve todos los slots ordenados por día
- [ ] **Consigna 2**: JOIN muestra nombres de mentores con sus slots
- [ ] **Consigna 3**: Filtro devuelve solo Lunes y Miércoles del mentor específico
- [ ] **Consigna 4**: Después del frontend, existe el slot del Viernes 14:00-16:00
- [ ] **Consigna 5**: Agregación muestra cantidad de slots por mentor
- [ ] **Consigna 6**: No hay slots fuera del horario 08:00-22:00 (0 filas)
- [ ] **Consigna 7**: INSERT creó el slot del Sábado correctamente
- [ ] **Consigna 8**: UPDATE cambió el Viernes a 15:00-17:00
- [ ] **Consigna 9**: DELETE eliminó el slot del Sábado (0 filas en verificación)
- [ ] **Consigna 10**: Atomicidad: solo queda 1 slot después del cambio masivo
- [ ] **Consigna 11**: No hay slots huérfanos (0 filas)
- [ ] **Consigna 12**: Búsqueda por nombre funciona con patrones

---

**Documento generado para:** STORY-MYM-19 - Set Mentor Weekly Availability
**Tipo de Testing:** Database Testing
**Fecha:** 2025-01-15
**Autor:** Claude Code
