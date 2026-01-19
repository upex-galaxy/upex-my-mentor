# Quiz: Conceptos de Database Testing

> **Aprendizaje Basado en Conceptos** (Concept-Driven Learning) - Nivel 0
>
> Este quiz evalúa tu comprensión de los conceptos fundamentales.
> Lee cada pregunta y selecciona la opción correcta (A, B, C o D).
> **No consultes el documento de análisis mientras respondes.**

---

## Contexto

### La Consigna

> "Obtén una lista que muestre: el nombre del mentor, su email, el día de la semana de su disponibilidad, y las horas de inicio/fin. Solo muestra mentores que tengan al menos un slot configurado."

### La Solución

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

---

## Instrucciones

1. Lee cada pregunta cuidadosamente
2. Analiza las 4 opciones
3. Selecciona **una sola respuesta**
4. Anota tus respuestas antes de consultar el documento de respuestas
5. Cada pregunta correcta vale **1 punto**

---

## PREGUNTAS

### Pregunta 1: Concepto de Base de Datos Relacional

En el contexto de la funcionalidad "Disponibilidad del Mentor", tenemos dos tablas: `profiles` y `mentor_availability`.

**¿Por qué los datos están separados en dos tablas en lugar de una sola?**

- **A)** Para que las queries sean más lentas y seguras
- **B)** Para evitar redundancia de datos y mantener cada tipo de información organizada
- **C)** Porque PostgreSQL no permite tablas con más de 10 columnas
- **D)** Para que sea más difícil para los hackers acceder a los datos

**Tu respuesta:** ___

---

### Pregunta 2: Clave Primaria (Primary Key)

**¿Cuál es el propósito principal de la clave primaria en la tabla `profiles`?**

- **A)** Almacenar el nombre del usuario en formato único
- **B)** Crear una conexión automática con todas las otras tablas
- **C)** Identificar de forma única cada registro, garantizando que no haya duplicados
- **D)** Encriptar los datos del usuario para mayor seguridad

**Tu respuesta:** ___

---

### Pregunta 3: Clave Foránea (Foreign Key)

En la tabla `mentor_availability`, la columna `mentor_id` es una clave foránea.

**¿Qué sucedería si intentamos insertar un slot de disponibilidad con un `mentor_id` que NO existe en la tabla `profiles`?**

- **A)** Se insertaría normalmente sin ningún problema
- **B)** La base de datos rechazaría la inserción por violación de integridad referencial
- **C)** Se crearía automáticamente un nuevo registro en `profiles`
- **D)** El valor de `mentor_id` se cambiaría a NULL automáticamente

**Tu respuesta:** ___

---

### Pregunta 4: Tipos de JOIN

En la solución se usa `INNER JOIN` entre `mentor_availability` y `profiles`.

**Si existiera un slot de disponibilidad con un `mentor_id` inválido (que no existe en profiles), ¿qué pasaría con ese slot en el resultado del INNER JOIN?**

- **A)** Aparecería con valores NULL en las columnas de profiles
- **B)** Causaría un error en la ejecución de la query
- **C)** No aparecería en el resultado (sería excluido)
- **D)** Aparecería duplicado varias veces

**Tu respuesta:** ___

---

### Pregunta 5: LEFT JOIN vs INNER JOIN

**Si quisieras encontrar mentores que NO tienen ningún slot de disponibilidad configurado, ¿qué tipo de JOIN usarías?**

- **A)** INNER JOIN, porque incluye todas las filas
- **B)** LEFT JOIN desde profiles, buscando donde los campos de availability sean NULL
- **C)** RIGHT JOIN desde mentor_availability
- **D)** No es posible encontrar esos mentores con SQL

**Tu respuesta:** ___

---

### Pregunta 6: Alias de Tablas

En la query solución, usamos `ma` y `p` como alias.

**¿Cuál de las siguientes afirmaciones sobre los alias es CORRECTA?**

- **A)** Los alias son obligatorios en todas las queries de SQL
- **B)** Una vez definido un alias, debemos usar SOLO el alias en toda la query, no el nombre original
- **C)** Los alias solo funcionan con tablas que tienen nombres de más de 10 caracteres
- **D)** Los alias cambian permanentemente el nombre de la tabla en la base de datos

**Tu respuesta:** ___

---

### Pregunta 7: Tipos de Datos

La columna `day_of_week` en `mentor_availability` es de tipo `integer` con valores 0-6.

**¿Por qué se usa un número (0-6) en lugar del nombre del día ("Lunes", "Martes", etc.)?**

- **A)** Porque SQL no puede almacenar texto
- **B)** Porque facilita ordenar, comparar y ocupa menos espacio
- **C)** Porque los nombres de días son diferentes en cada idioma y no se pueden almacenar
- **D)** Porque PostgreSQL convierte automáticamente números a días

**Tu respuesta:** ___

---

### Pregunta 8: Integridad Referencial

**¿Qué significa "integridad referencial" en el contexto de bases de datos?**

- **A)** Que todos los datos están encriptados con referencias seguras
- **B)** Que las claves foráneas siempre apuntan a registros existentes en la tabla padre
- **C)** Que cada tabla tiene al menos una referencia a otra tabla
- **D)** Que los datos se respaldan automáticamente cada hora

**Tu respuesta:** ___

---

### Pregunta 9: Aplicación Práctica del JOIN

En la solución, la condición del JOIN es: `ON ma.mentor_id = p.id`

**¿Qué representa esta condición?**

- **A)** Que solo queremos mentores cuyo ID sea menor que el ID del availability
- **B)** Que combinamos filas donde el mentor_id de availability coincide con el id de profiles
- **C)** Que creamos una nueva columna llamada "mentor_id" en profiles
- **D)** Que ordenamos los resultados por mentor_id

**Tu respuesta:** ___

---

### Pregunta 10: ORDER BY

La query termina con: `ORDER BY p.name, ma.day_of_week`

**¿Cómo se ordenarán los resultados?**

- **A)** Primero por día de la semana, luego alfabéticamente por nombre
- **B)** Primero alfabéticamente por nombre, luego por día de la semana dentro de cada mentor
- **C)** Solo por nombre, el día de la semana se ignora
- **D)** De forma aleatoria porque hay dos columnas en ORDER BY

**Tu respuesta:** ___

---

### Pregunta 11: Verificación de Datos Huérfanos

Para encontrar slots de disponibilidad que no tienen un mentor válido asociado, usamos:

```sql
SELECT ma.*
FROM mentor_availability ma
LEFT JOIN profiles p ON ma.mentor_id = p.id
WHERE p.id IS NULL;
```

**¿Por qué usamos `LEFT JOIN` en lugar de `INNER JOIN` para esta verificación?**

- **A)** Porque LEFT JOIN es más rápido que INNER JOIN
- **B)** Porque LEFT JOIN incluye filas de mentor_availability aunque no tengan match en profiles
- **C)** Porque INNER JOIN no funciona con condiciones WHERE
- **D)** Porque LEFT JOIN ordena mejor los resultados

**Tu respuesta:** ___

---

### Pregunta 12: Formato de Hora

Para comparar horas en SQL, usamos: `WHERE start_time = '14:00:00'`

**¿Por qué la hora está entre comillas simples?**

- **A)** Porque es un valor de tipo TIME y se representa como texto
- **B)** Porque las comillas hacen que la comparación sea más rápida
- **C)** Porque sin comillas el SQL pensaría que es una operación matemática (14:00:00 = 14 dividido 0 dividido 0)
- **D)** Las comillas son opcionales, también funciona sin ellas

**Tu respuesta:** ___

---

## Hoja de Respuestas

Anota tus respuestas aquí antes de verificar:

| Pregunta | Tu Respuesta |
|----------|--------------|
| 1        |              |
| 2        |              |
| 3        |              |
| 4        |              |
| 5        |              |
| 6        |              |
| 7        |              |
| 8        |              |
| 9        |              |
| 10       |              |
| 11       |              |
| 12       |              |

---

**Documento de respuestas:** `db-conceptos-respuestas.md`
**Consulta solo DESPUÉS de completar todas las preguntas.**
