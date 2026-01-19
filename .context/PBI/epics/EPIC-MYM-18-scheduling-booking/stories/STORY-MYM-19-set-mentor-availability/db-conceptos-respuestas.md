# Respuestas: Conceptos de Database Testing

> **Aprendizaje Basado en Conceptos** (Concept-Driven Learning) - Nivel 0
>
> Este documento contiene las respuestas correctas del quiz.
> **Consulta solo DESPUÉS de haber respondido todas las preguntas.**

---

## RESPUESTAS

### Pregunta 1: Concepto de Base de Datos Relacional

**Respuesta correcta: B**

> Para evitar redundancia de datos y mantener cada tipo de información organizada

**Explicación:**
El modelo relacional separa los datos en tablas especializadas para:
- **Evitar redundancia**: Si guardáramos el nombre del mentor en cada slot de disponibilidad, tendríamos el mismo nombre repetido muchas veces
- **Facilitar actualizaciones**: Si el mentor cambia su nombre, solo se actualiza en un lugar (profiles)
- **Mantener organización**: Cada tabla tiene una responsabilidad clara (profiles = datos de usuario, mentor_availability = horarios)

**Por qué las otras opciones son incorrectas:**
- **A)** Las queries no son más lentas por tener tablas separadas; de hecho, con índices adecuados son muy eficientes
- **C)** PostgreSQL no tiene ese límite de columnas
- **D)** La seguridad no es la razón principal de la separación

**Concepto clave:** Base de Datos Relacional, Normalización

---

### Pregunta 2: Clave Primaria (Primary Key)

**Respuesta correcta: C**

> Identificar de forma única cada registro, garantizando que no haya duplicados

**Explicación:**
La clave primaria (PK) tiene tres características fundamentales:
1. **Unicidad**: No puede haber dos filas con el mismo valor de PK
2. **No nulabilidad**: La PK nunca puede ser NULL
3. **Identificación**: Permite referenciar un registro específico desde otras tablas

**Por qué las otras opciones son incorrectas:**
- **A)** La PK no almacena el nombre; es un identificador técnico (generalmente UUID)
- **B)** La conexión con otras tablas la hace la FK, no la PK por sí sola
- **D)** La PK no tiene función de encriptación

**Concepto clave:** Clave Primaria (Primary Key)

---

### Pregunta 3: Clave Foránea (Foreign Key)

**Respuesta correcta: B**

> La base de datos rechazaría la inserción por violación de integridad referencial

**Explicación:**
La restricción de clave foránea (FK constraint) garantiza que:
- Todo valor en la columna FK debe existir como PK en la tabla padre
- Si intentas insertar un valor inválido, la base de datos lanza un error
- Esto previene datos "huérfanos" que no pertenecen a ningún registro padre

**Error típico en PostgreSQL:**
```
ERROR: insert or update on table "mentor_availability" violates
foreign key constraint "mentor_availability_mentor_id_fkey"
```

**Por qué las otras opciones son incorrectas:**
- **A)** No se insertaría; la BD lo rechaza
- **C)** No se crean registros automáticamente en otras tablas
- **D)** No se cambia a NULL; simplemente falla

**Concepto clave:** Clave Foránea (Foreign Key), Integridad Referencial

---

### Pregunta 4: Tipos de JOIN

**Respuesta correcta: C**

> No aparecería en el resultado (sería excluido)

**Explicación:**
El `INNER JOIN` solo devuelve filas que tienen coincidencia en AMBAS tablas:
- Si `mentor_availability.mentor_id` no existe en `profiles.id`, esa fila de availability es excluida
- Por eso se llama "inner" (interior): solo muestra la intersección

```
   availability        profiles
   ┌─────────┐        ┌─────────┐
   │    A    │────────│    A    │  ✓ Aparece
   │    B    │────────│    B    │  ✓ Aparece
   │    X    │        │    C    │  ✗ X no está en profiles
   └─────────┘        └─────────┘
```

**Por qué las otras opciones son incorrectas:**
- **A)** Eso describe LEFT JOIN, no INNER JOIN
- **B)** No causa error; simplemente excluye la fila
- **D)** No hay duplicación por datos inválidos

**Concepto clave:** INNER JOIN

---

### Pregunta 5: LEFT JOIN vs INNER JOIN

**Respuesta correcta: B**

> LEFT JOIN desde profiles, buscando donde los campos de availability sean NULL

**Explicación:**
Para encontrar mentores SIN disponibilidad:
```sql
SELECT p.*
FROM profiles p
LEFT JOIN mentor_availability ma ON p.id = ma.mentor_id
WHERE p.role = 'mentor' AND ma.id IS NULL;
```

- `LEFT JOIN` incluye TODOS los profiles (incluso sin match)
- Donde no hay match, las columnas de availability son NULL
- Filtramos `WHERE ma.id IS NULL` para encontrar los sin slots

**Por qué las otras opciones son incorrectas:**
- **A)** INNER JOIN excluiría exactamente lo que buscamos
- **C)** RIGHT JOIN desde availability no ayuda (queremos partir de profiles)
- **D)** Sí es posible; la opción B lo demuestra

**Concepto clave:** LEFT JOIN, detección de ausencia de datos

---

### Pregunta 6: Alias de Tablas

**Respuesta correcta: B**

> Una vez definido un alias, debemos usar SOLO el alias en toda la query, no el nombre original

**Explicación:**
Cuando defines `FROM profiles p`:
- En esa query, `profiles` ya no es reconocido
- Debes usar `p.name`, no `profiles.name`
- El alias solo existe durante la ejecución de esa query

```sql
-- Correcto:
SELECT p.name FROM profiles p WHERE p.role = 'mentor';

-- Error:
SELECT profiles.name FROM profiles p WHERE p.role = 'mentor';
-- "profiles" ya no existe, ahora se llama "p"
```

**Por qué las otras opciones son incorrectas:**
- **A)** Los alias son opcionales, no obligatorios
- **C)** No hay restricción de longitud de nombre
- **D)** El alias es temporal, no cambia nada permanentemente

**Concepto clave:** Alias de Tablas

---

### Pregunta 7: Tipos de Datos

**Respuesta correcta: B**

> Porque facilita ordenar, comparar y ocupa menos espacio

**Explicación:**
Usar números para días tiene ventajas:
- **Ordenamiento natural**: `ORDER BY day_of_week` ordena Dom→Sáb automáticamente
- **Comparaciones simples**: `WHERE day_of_week >= 1 AND day_of_week <= 5` (lun-vie)
- **Eficiencia**: Un integer ocupa 4 bytes; "Miércoles" ocupa 9+ bytes
- **Internacionalización**: El número 1 significa Lunes en cualquier idioma

**Por qué las otras opciones son incorrectas:**
- **A)** SQL puede almacenar texto perfectamente
- **C)** Sí se pueden almacenar, pero es menos eficiente
- **D)** PostgreSQL no hace conversión automática

**Concepto clave:** Tipos de Datos, diseño eficiente

---

### Pregunta 8: Integridad Referencial

**Respuesta correcta: B**

> Que las claves foráneas siempre apuntan a registros existentes en la tabla padre

**Explicación:**
La integridad referencial garantiza que:
- No puedes tener un `mentor_id` que no exista en `profiles`
- Si eliminas un mentor, debes decidir qué pasa con sus slots (CASCADE, SET NULL, o error)
- Los datos siempre están "conectados" correctamente

Esto previene el problema de datos "huérfanos" que no pertenecen a nadie.

**Por qué las otras opciones son incorrectas:**
- **A)** No tiene que ver con encriptación
- **C)** No todas las tablas necesitan referencias a otras
- **D)** No tiene que ver con backups

**Concepto clave:** Integridad Referencial

---

### Pregunta 9: Aplicación Práctica del JOIN

**Respuesta correcta: B**

> Que combinamos filas donde el mentor_id de availability coincide con el id de profiles

**Explicación:**
La condición `ON ma.mentor_id = p.id` dice:
- "Une cada fila de mentor_availability..."
- "...con la fila de profiles donde los IDs coincidan"
- Esto conecta cada slot con los datos de su mentor

```
mentor_availability.mentor_id = 'abc123'
            ↓ match ↓
profiles.id = 'abc123' → name = 'Carlos', email = 'carlos@...'
```

**Por qué las otras opciones son incorrectas:**
- **A)** No es una comparación de menor/mayor
- **C)** No crea columnas nuevas
- **D)** ON no ordena; ORDER BY ordena

**Concepto clave:** Condición de JOIN

---

### Pregunta 10: ORDER BY

**Respuesta correcta: B**

> Primero alfabéticamente por nombre, luego por día de la semana dentro de cada mentor

**Explicación:**
`ORDER BY p.name, ma.day_of_week` significa:
1. **Primero** ordenar por `name` (A→Z)
2. **Dentro de cada nombre**, ordenar por `day_of_week` (0→6)

Resultado:
```
Ana       | 1 (Lunes)
Ana       | 3 (Miércoles)
Carlos    | 2 (Martes)
Carlos    | 5 (Viernes)
```

**Por qué las otras opciones son incorrectas:**
- **A)** El orden de las columnas en ORDER BY importa; name va primero
- **C)** Ambas columnas se usan para ordenar
- **D)** No es aleatorio; hay un orden determinístico

**Concepto clave:** ORDER BY múltiple

---

### Pregunta 11: Verificación de Datos Huérfanos

**Respuesta correcta: B**

> Porque LEFT JOIN incluye filas de mentor_availability aunque no tengan match en profiles

**Explicación:**
Para encontrar datos huérfanos:
- Necesitamos VER las filas de availability que NO tienen match
- `INNER JOIN` las excluiría (solo muestra matches)
- `LEFT JOIN` las incluye, con NULL en las columnas de profiles
- Luego filtramos `WHERE p.id IS NULL` para encontrar los huérfanos

```sql
-- LEFT JOIN incluye todo de la izquierda (mentor_availability)
-- Donde no hay match, profiles.* es NULL
SELECT ma.*
FROM mentor_availability ma  -- IZQUIERDA (se incluye todo)
LEFT JOIN profiles p ON ma.mentor_id = p.id
WHERE p.id IS NULL;  -- Filtramos los que no tienen match
```

**Por qué las otras opciones son incorrectas:**
- **A)** LEFT JOIN no es más rápido; tiene propósito diferente
- **C)** INNER JOIN sí funciona con WHERE, pero excluiría lo que buscamos
- **D)** El ordenamiento no es la razón

**Concepto clave:** LEFT JOIN para detectar ausencia

---

### Pregunta 12: Formato de Hora

**Respuesta correcta: A**

> Porque es un valor de tipo TIME y se representa como texto

**Explicación:**
En SQL, los valores de tipo TIME, DATE, y TIMESTAMP se escriben como strings (texto) entre comillas:
- `'14:00:00'` → TIME
- `'2025-01-15'` → DATE
- `'2025-01-15 14:00:00'` → TIMESTAMP

Las comillas simples indican un valor literal, y PostgreSQL lo interpreta según el contexto o el tipo de la columna.

**Por qué las otras opciones son incorrectas:**
- **B)** Las comillas no afectan la velocidad
- **C)** Aunque técnicamente `14:00:00` sin comillas sería interpretado como operación, la razón real es que TIME es un tipo que se representa como texto
- **D)** Sin comillas causaría error o resultado incorrecto

**Concepto clave:** Tipos de Datos, literales en SQL

---

## Tabla de Respuestas

| Pregunta | Respuesta | Concepto Evaluado |
|----------|-----------|-------------------|
| 1 | B | Base de Datos Relacional |
| 2 | C | Clave Primaria |
| 3 | B | Clave Foránea |
| 4 | C | INNER JOIN |
| 5 | B | LEFT JOIN vs INNER JOIN |
| 6 | B | Alias de Tablas |
| 7 | B | Tipos de Datos |
| 8 | B | Integridad Referencial |
| 9 | B | Condición de JOIN |
| 10 | B | ORDER BY |
| 11 | B | LEFT JOIN para detección |
| 12 | A | Tipos de Datos (TIME) |

---

## Autoevaluación

### Calcula tu puntaje

| Respuestas Correctas | Puntaje | Nivel de Comprensión |
|----------------------|---------|----------------------|
| 12/12 | 100% | Excelente - Dominas los conceptos |
| 10-11/12 | 83-92% | Muy bien - Comprensión sólida |
| 7-9/12 | 58-75% | Regular - Necesitas reforzar algunos conceptos |
| 4-6/12 | 33-50% | Básico - Revisa el documento de análisis |
| 0-3/12 | 0-25% | Insuficiente - Estudia los fundamentos |

**Tu puntaje:** ___/12 = ___%

---

## Conceptos a Reforzar

Si fallaste alguna pregunta, aquí están los conceptos que debes revisar:

| Pregunta | Si fallaste, revisa |
|----------|---------------------|
| 1 | Base de Datos Relacional - Sección "Concepto 1" del análisis |
| 2 | Clave Primaria - Sección "Concepto 2" del análisis |
| 3 | Clave Foránea - Sección "Concepto 3" del análisis |
| 4 | JOIN - Sección "Concepto 4" del análisis |
| 5 | LEFT JOIN - Comparación de tipos de JOIN |
| 6 | Alias - Sección "Concepto 5" del análisis |
| 7 | Tipos de Datos - Sección "Concepto 7" del análisis |
| 8 | Integridad Referencial - Sección "Concepto 6" del análisis |
| 9 | Condición ON - Dentro de "Concepto 4" |
| 10 | ORDER BY - Sección "Concepto 8" del análisis |
| 11 | LEFT JOIN aplicado - Práctica con queries reales |
| 12 | Tipos de Datos TIME - Sección "Concepto 7" |

---

## Resumen de Conceptos Aprendidos

| Concepto | Definición Breve | Aplicación en la Consigna |
|----------|------------------|---------------------------|
| Base de Datos Relacional | Datos organizados en tablas relacionadas | profiles + mentor_availability |
| Clave Primaria | ID único por registro | profiles.id |
| Clave Foránea | Referencia a otra tabla | mentor_availability.mentor_id |
| INNER JOIN | Combina filas con coincidencia | Ver slots CON su mentor |
| LEFT JOIN | Incluye filas sin coincidencia | Encontrar datos huérfanos |
| Alias | Nombre corto para tablas | ma, p |
| Tipos de Datos | Formato de cada columna | integer, time, uuid |
| Integridad Referencial | FK apunta a PK válida | Evitar slots huérfanos |

---

## Siguiente Paso

Ahora que comprendes el **POR QUÉ** de los conceptos de Database Testing, estás listo para:

**Opción A:** Ejecutar las consignas por tu cuenta en **Nivel 1: Prompt-Driven Learning**
- Archivo: `db-testing-consignas.md`
- Ya sabes la teoría, ahora practica la ejecución

**Opción B:** Explorar más conceptos relacionados
- Funciones de agregación (COUNT, GROUP BY)
- Operaciones CRUD (INSERT, UPDATE, DELETE)
- Transacciones y atomicidad

**Opción C:** Subir de nivel
- Si ya dominas la ejecución (Nivel 1), avanza a diseñar pruebas (Nivel 2)
- Aprende a crear tus propias consignas a partir de requisitos

---

## Glosario Rápido

| Término | Definición |
|---------|------------|
| PK (Primary Key) | Columna que identifica únicamente cada fila |
| FK (Foreign Key) | Columna que referencia a una PK de otra tabla |
| JOIN | Operación que combina filas de múltiples tablas |
| INNER JOIN | Solo filas con coincidencia en ambas tablas |
| LEFT JOIN | Todas las filas de la izquierda + coincidencias |
| NULL | Ausencia de valor (diferente de vacío o cero) |
| Alias | Nombre corto temporal para una tabla |
| Integridad Referencial | Garantía de que las FK apuntan a PKs válidas |
| Normalización | Proceso de organizar datos para evitar redundancia |
| CRUD | Create, Read, Update, Delete - operaciones básicas |

---

**Documento generado para:** STORY-MYM-19 - Set Mentor Weekly Availability
**Nivel:** 0 - Concept-Driven Learning
**Propósito:** Respuestas y autoevaluación del quiz de conceptos
