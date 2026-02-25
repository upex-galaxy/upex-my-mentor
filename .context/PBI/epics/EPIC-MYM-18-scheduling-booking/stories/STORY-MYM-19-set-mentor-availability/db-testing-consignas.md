# Consignas: MYM-19 - Database Testing

> **Aprendizaje Basado en Consignas** (Prompt-Driven Learning)
>
> Problemas reales de Database Testing derivados de la historia MYM-19.
> Resuelve cada consigna aplicando tus conocimientos de SQL.
>
> **Documento relacionado:** `db-testing-analisis.md` explica cómo se derivaron estas consignas.

---

## Objetivo de Aprendizaje

Al completar estos ejercicios podrás:
- Escribir queries SQL para verificar funcionalidades de software
- Usar SELECT, INSERT, UPDATE, DELETE correctamente
- Aplicar JOINs para relacionar tablas
- Validar integridad de datos en una base de datos real

---

## Contexto de la Funcionalidad

**Historia de Usuario:** Como Mentor, quiero configurar mi disponibilidad semanal para que los estudiantes sepan cuándo puedo dar mentorías.

**Tabla Principal:** `mentor_availability`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Identificador único |
| mentor_id | uuid | FK a profiles.id |
| day_of_week | integer | 0=Dom, 1=Lun...6=Sáb |
| start_time | time | Hora de inicio |
| end_time | time | Hora de fin |
| is_active | boolean | Si el slot está activo |

**Tabla Relacionada:** `profiles` (contiene datos del mentor: name, email, role)

---

## Setup Inicial

**Ejecuta esta query para obtener tu mentor de prueba:**

```sql
SELECT id, name, email, role
FROM profiles
WHERE role = 'mentor' AND is_verified = true
LIMIT 1;
```

Guarda el `id` del resultado. Lo necesitarás para las siguientes consignas.

---

## CONSIGNAS

---

### CONSIGNA 1: Exploración Inicial

**Escenario:**
Acabas de recibir la historia de usuario MYM-19. Antes de probar nada, necesitas entender qué datos ya existen en el sistema.

**Consigna:**
> "Necesitas obtener una lista de TODOS los slots de disponibilidad que existen actualmente en el sistema, mostrando: el día de la semana, hora de inicio, hora de fin, y si está activo. Ordena los resultados por día de la semana."

**Pistas:**
- Comando principal: `SELECT`
- Para ordenar: `ORDER BY`
- La columna del día es numérica (0-6)

**Escenario de Prueba que Valida:** Reconocimiento del estado inicial

---

### CONSIGNA 2: Verificación con Relación (JOIN)

**Escenario:**
Quieres ver los slots de disponibilidad, pero también necesitas saber A QUIÉN pertenece cada slot (el nombre del mentor).

**Consigna:**
> "Obtén una lista que muestre: el nombre del mentor, su email, el día de la semana de su disponibilidad, y las horas de inicio/fin. Solo muestra mentores que tengan al menos un slot configurado."

**Pistas:**
- Necesitas datos de DOS tablas: `mentor_availability` y `profiles`
- Comando para unir tablas: `JOIN` o `INNER JOIN`
- La relación es: `mentor_availability.mentor_id = profiles.id`

**Escenario de Prueba que Valida:** Integridad referencial

---

### CONSIGNA 3: Filtrado Específico

**Escenario:**
Un mentor reporta que configuró disponibilidad para los días Lunes y Miércoles. Necesitas verificar que sus datos están correctos.

**Consigna:**
> "Dado el ID del mentor de prueba que guardaste al inicio, obtén SOLO los slots de disponibilidad que corresponden a Lunes (1) o Miércoles (3)."

**Pistas:**
- Comando para filtrar: `WHERE`
- Para múltiples condiciones del mismo campo: `IN (valor1, valor2)` o usar `OR`
- Necesitas filtrar por `mentor_id` Y por `day_of_week`

**Escenario de Prueba que Valida:** AC Scenario 1 - Verificar días específicos guardados

---

### CONSIGNA 4: Acción desde Frontend + Verificación

**Escenario:**
Vas a realizar una acción en el frontend y luego verificar el resultado en la base de datos.

**Acción en Frontend (haz esto primero):**
1. Inicia sesión como el mentor de prueba
2. Ve a `/dashboard/settings/availability`
3. Agrega un nuevo slot: **Viernes de 14:00 a 16:00**
4. Haz clic en "Guardar"

**Consigna:**
> "Después de que el mentor guardó el nuevo slot del Viernes, verifica que existe un registro con día de semana = 5 (Viernes), hora de inicio = 14:00 y hora de fin = 16:00 para ese mentor específico."

**Pistas:**
- Comando: `SELECT`
- Filtros: `WHERE` con múltiples condiciones usando `AND`
- El día Viernes es el número `5`
- Las horas se comparan como strings: `'14:00:00'`

**Escenario de Prueba que Valida:** AC Scenario 1 - El sistema almacena los slots

---

### CONSIGNA 5: Conteo y Agregación

**Escenario:**
Quieres saber cuántos slots de disponibilidad tiene cada mentor en el sistema, para verificar que la distribución es correcta.

**Consigna:**
> "Obtén una lista que muestre: el nombre de cada mentor y la CANTIDAD de slots de disponibilidad que tiene configurados. Ordena de mayor a menor cantidad."

**Pistas:**
- Función de agregación: `COUNT()`
- Para agrupar resultados: `GROUP BY`
- Para ordenar de mayor a menor: `ORDER BY ... DESC`
- Necesitas unir con la tabla `profiles` para obtener el nombre

**Escenario de Prueba que Valida:** Verificación de volumen de datos

---

### CONSIGNA 6: Verificación de Rango de Tiempo

**Escenario:**
Por reglas de negocio, los slots de disponibilidad deberían estar dentro del horario laboral típico (entre las 8:00 AM y las 10:00 PM).

**Consigna:**
> "Encuentra todos los slots de disponibilidad cuya hora de INICIO esté FUERA del rango permitido (antes de las 08:00 o después de las 22:00). Esto sería un posible bug o dato inválido."

**Pistas:**
- Para rangos: `BETWEEN` o comparadores `<` y `>`
- Para condición "fuera de rango": usar `NOT BETWEEN` o combinar con `OR`
- Las horas se pueden comparar directamente: `'08:00:00'`

**Escenario de Prueba que Valida:** Validación de reglas de negocio

---

### CONSIGNA 7: INSERT Manual (Simular Creación)

**Escenario:**
Quieres probar qué pasa cuando se inserta un nuevo slot directamente en la base de datos (simulando lo que haría el backend).

**Consigna:**
> "Inserta un nuevo slot de disponibilidad para tu mentor de prueba: día Sábado (6), de 10:00 a 12:00, estado activo. Luego, verifica que se creó correctamente con un SELECT."

**Pistas:**
- Comando para insertar: `INSERT INTO ... VALUES ...`
- Columnas requeridas: `mentor_id`, `day_of_week`, `start_time`, `end_time`, `is_active`
- El ID se genera automáticamente
- Después del INSERT, haz un SELECT para verificar

**Nota:** Esta consigna requiere DOS queries: una de acción y una de verificación.

**Escenario de Prueba que Valida:** Prueba de inserción de datos

---

### CONSIGNA 8: UPDATE (Modificar Datos)

**Escenario:**
Un mentor quiere cambiar su horario del Viernes. En lugar de las 14:00-16:00, ahora quiere 15:00-17:00.

**Consigna:**
> "Actualiza el slot del Viernes (day_of_week = 5) del mentor de prueba para que la hora de inicio sea 15:00 y la hora de fin sea 17:00. Luego verifica el cambio."

**Pistas:**
- Comando para actualizar: `UPDATE ... SET ... WHERE`
- MUY IMPORTANTE: Siempre incluir `WHERE` para no actualizar TODOS los registros
- Puedes actualizar múltiples columnas separadas por coma

**Escenario de Prueba que Valida:** AC Scenario 2 - El mentor actualiza su disponibilidad

---

### CONSIGNA 9: DELETE (Eliminar Datos)

**Escenario:**
El mentor decide que ya no quiere ofrecer mentorías los Sábados, así que elimina ese slot.

**Consigna:**
> "Elimina el slot del Sábado (day_of_week = 6) que creaste anteriormente para el mentor de prueba. Después verifica que ya no existe."

**Pistas:**
- Comando para eliminar: `DELETE FROM ... WHERE`
- MUY IMPORTANTE: SIEMPRE incluir `WHERE` (sin WHERE elimina TODO)
- Buena práctica: Primero hacer un SELECT con el mismo WHERE para ver qué se va a eliminar

**Escenario de Prueba que Valida:** El mentor puede eliminar slots

---

### CONSIGNA 10: Verificación de Atomicidad (Avanzada)

**Escenario:**
Según la historia de usuario, cuando un mentor guarda su disponibilidad, el sistema debe BORRAR todos los slots anteriores e INSERTAR los nuevos (operación atómica).

**Acción en Frontend:**
1. El mentor tiene varios slots configurados
2. Ve a la página de disponibilidad
3. ELIMINA todos los slots existentes visualmente
4. Agrega UN SOLO slot nuevo: Martes 10:00-12:00
5. Guarda

**Consigna:**
> "Antes de que el mentor guarde, cuenta cuántos slots tiene. Después de guardar, verifica que: (1) solo existe 1 slot, (2) ese slot es Martes 10:00-12:00, y (3) los slots anteriores ya no existen."

**Pistas:**
- Primera query: `SELECT COUNT(*)` antes del cambio
- Segunda query: `SELECT COUNT(*)` después del cambio
- Tercera query: `SELECT` con filtro para verificar el slot específico
- Comparar los conteos manualmente

**Escenario de Prueba que Valida:** Operación atómica (delete all + insert new)

---

### CONSIGNA 11: Verificación de Relación Rota (Integridad)

**Escenario:**
Quieres verificar que no existen slots de disponibilidad "huérfanos" (que apunten a un mentor que no existe en la tabla profiles).

**Consigna:**
> "Encuentra todos los slots de disponibilidad cuyo mentor_id NO exista en la tabla profiles. Estos serían datos corruptos."

**Pistas:**
- Necesitas comparar dos tablas
- Opción 1: `LEFT JOIN` y buscar donde el resultado del JOIN sea `NULL`
- Opción 2: `NOT IN` con una subconsulta
- Opción 3: `NOT EXISTS`

**Escenario de Prueba que Valida:** Integridad referencial de la base de datos

---

### CONSIGNA 12: Búsqueda por Patrón

**Escenario:**
Quieres encontrar todos los mentores cuyo nombre contenga una palabra específica y ver su disponibilidad.

**Consigna:**
> "Encuentra todos los slots de disponibilidad de mentores cuyo nombre contenga la palabra 'Carlos' o 'Ana' (sin importar mayúsculas/minúsculas). Muestra el nombre del mentor, día y horario."

**Pistas:**
- Para búsqueda de patrones: `LIKE` con comodín `%`
- Para ignorar mayúsculas/minúsculas: `ILIKE` (PostgreSQL) o `LOWER()`
- Para múltiples patrones: combinar con `OR`

**Escenario de Prueba que Valida:** Búsqueda flexible de datos

---

## Tabla de Referencia: Día de la Semana

| Número | Día |
|--------|-----|
| 0 | Domingo |
| 1 | Lunes |
| 2 | Martes |
| 3 | Miércoles |
| 4 | Jueves |
| 5 | Viernes |
| 6 | Sábado |

---

## Resumen de Dificultad

| Consigna | Comandos Clave | Dificultad |
|----------|----------------|------------|
| 1 | SELECT, ORDER BY | Fácil |
| 2 | INNER JOIN | Media |
| 3 | WHERE, IN/OR | Fácil |
| 4 | WHERE, AND | Media |
| 5 | COUNT, GROUP BY | Media |
| 6 | BETWEEN, NOT | Media |
| 7 | INSERT | Media |
| 8 | UPDATE, SET | Media |
| 9 | DELETE | Media |
| 10 | COUNT (comparativo) | Avanzada |
| 11 | LEFT JOIN + NULL | Avanzada |
| 12 | LIKE/ILIKE | Media |

---

**Historia:** MYM-19 - Set Mentor Weekly Availability
**Tipo:** Database Testing
**Tiempo estimado:** 2-3 horas
