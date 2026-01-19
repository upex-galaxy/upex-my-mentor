# Análisis: Conceptos de Database Testing

> **Aprendizaje Basado en Conceptos** (Concept-Driven Learning) - Nivel 0
>
> Este documento explica los conceptos fundamentales necesarios para comprender
> por qué las consignas de Database Testing se ejecutan de cierta manera.

---

## La Consigna (Representativa)

### Consigna Original

> "Obtén una lista que muestre: el nombre del mentor, su email, el día de la semana de su disponibilidad, y las horas de inicio/fin. Solo muestra mentores que tengan al menos un slot configurado."

### Contexto

Esta consigna es parte del testing de la historia **MYM-19: Set Mentor Weekly Availability**. Necesitamos verificar que cuando un mentor configura su disponibilidad, los datos se guardan correctamente y podemos relacionarlos con el perfil del mentor.

---

## Cómo se Resuelve

### Solución

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

### Explicación Paso a Paso

1. **`SELECT columnas`**: Especificamos qué datos queremos ver (nombre, email, día, horas)
2. **`FROM mentor_availability ma`**: Indicamos la tabla principal y le damos un alias corto (`ma`)
3. **`INNER JOIN profiles p`**: Unimos con la tabla de perfiles usando alias (`p`)
4. **`ON ma.mentor_id = p.id`**: Definimos cómo se relacionan las tablas (FK = PK)
5. **`ORDER BY`**: Ordenamos los resultados para facilitar lectura

---

## Conceptos Necesarios

Para entender **por qué** esta solución es correcta, necesitas dominar estos conceptos:

---

### Concepto 1: Base de Datos Relacional

**¿Qué es?**
Una base de datos relacional organiza la información en **tablas** (también llamadas relaciones). Cada tabla tiene:
- **Filas** (registros): Cada fila es una instancia de datos (ej: un mentor específico)
- **Columnas** (campos): Cada columna es un atributo (ej: nombre, email)
- **Claves**: Identificadores únicos para relacionar tablas entre sí

**¿Por qué es importante aquí?**
La funcionalidad de "disponibilidad del mentor" requiere DOS tablas relacionadas:
- `profiles`: Contiene los datos del mentor (nombre, email, rol)
- `mentor_availability`: Contiene los slots de disponibilidad

Sin entender las relaciones entre tablas, no podríamos verificar que los datos están correctamente conectados.

**Ejemplo:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         MODELO RELACIONAL                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   profiles (tabla padre)          mentor_availability (hija)   │
│   ┌──────────────────────┐        ┌──────────────────────┐     │
│   │ id (PK)              │◄───────│ mentor_id (FK)       │     │
│   │ name                 │        │ day_of_week          │     │
│   │ email                │        │ start_time           │     │
│   │ role                 │        │ end_time             │     │
│   └──────────────────────┘        └──────────────────────┘     │
│                                                                 │
│   1 mentor puede tener N slots de disponibilidad (1:N)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Concepto 2: Clave Primaria (Primary Key - PK)

**¿Qué es?**
Una clave primaria es una columna (o conjunto de columnas) que identifica de forma **única** cada fila en una tabla. No puede haber dos filas con el mismo valor de PK, y nunca puede ser NULL.

**¿Por qué es importante aquí?**
En la tabla `profiles`, la columna `id` es la clave primaria. Esto garantiza que:
- Cada mentor tiene un identificador único
- Podemos referenciar a un mentor específico desde otras tablas
- No hay duplicados ni ambigüedad

**Ejemplo:**

```sql
-- La PK garantiza que este ID es único en toda la tabla
SELECT * FROM profiles WHERE id = 'a1b2c3d4-e5f6-...';
-- Siempre devuelve 0 o 1 fila, NUNCA más de una
```

---

### Concepto 3: Clave Foránea (Foreign Key - FK)

**¿Qué es?**
Una clave foránea es una columna que crea una **relación** entre dos tablas. Contiene valores que deben existir como clave primaria en otra tabla (tabla padre).

**¿Por qué es importante aquí?**
La columna `mentor_id` en `mentor_availability` es una FK que apunta a `profiles.id`. Esto significa:
- Cada slot de disponibilidad DEBE pertenecer a un mentor existente
- La base de datos puede rechazar inserciones si el mentor no existe
- Podemos "navegar" entre las tablas siguiendo la relación

**Ejemplo:**

```sql
-- Esto funcionará si el mentor existe en profiles
INSERT INTO mentor_availability (mentor_id, day_of_week, ...)
VALUES ('uuid-existente', 1, ...);

-- Esto FALLARÁ si activamos la restricción FK
INSERT INTO mentor_availability (mentor_id, day_of_week, ...)
VALUES ('uuid-inventado', 1, ...);
-- Error: violación de restricción de clave foránea
```

---

### Concepto 4: JOIN (Unión de Tablas)

**¿Qué es?**
JOIN es la operación que combina filas de dos o más tablas basándose en una columna relacionada. Existen varios tipos:

| Tipo | Descripción | Uso |
|------|-------------|-----|
| `INNER JOIN` | Solo filas que coinciden en ambas tablas | Datos que DEBEN existir en ambas |
| `LEFT JOIN` | Todas las filas de la izquierda + coincidencias | Incluir filas sin relación |
| `RIGHT JOIN` | Todas las filas de la derecha + coincidencias | Menos común |
| `FULL JOIN` | Todas las filas de ambas tablas | Análisis completo |

**¿Por qué es importante aquí?**
Usamos `INNER JOIN` porque queremos:
- Ver datos de `mentor_availability` (slots)
- Junto con datos de `profiles` (nombre, email del mentor)
- SOLO para slots que tienen un mentor válido

**Ejemplo Visual:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         INNER JOIN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   profiles                    mentor_availability               │
│   ┌─────────────────┐        ┌─────────────────┐               │
│   │ id    │ name    │        │ mentor_id │ day │               │
│   ├───────┼─────────┤        ├───────────┼─────┤               │
│   │ A     │ Carlos  │───────►│ A         │ 1   │ ✓ Match       │
│   │ B     │ Ana     │───────►│ A         │ 3   │ ✓ Match       │
│   │ C     │ Pedro   │        │ B         │ 2   │ ✓ Match       │
│   └───────┴─────────┘        │ X         │ 5   │ ✗ No match    │
│                              └───────────┴─────┘               │
│                                                                 │
│   Resultado del INNER JOIN:                                     │
│   ┌─────────────────────────────────────┐                      │
│   │ name   │ day │ (Solo coincidencias) │                      │
│   ├────────┼─────┤                      │                      │
│   │ Carlos │ 1   │                      │                      │
│   │ Carlos │ 3   │                      │                      │
│   │ Ana    │ 2   │                      │                      │
│   └────────┴─────┘                      │                      │
│   (El slot con mentor_id='X' NO aparece)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Concepto 5: Alias de Tablas

**¿Qué es?**
Un alias es un nombre corto que asignamos a una tabla para hacer las queries más legibles. Se define con la palabra `AS` o simplemente después del nombre de la tabla.

**¿Por qué es importante aquí?**
Cuando hacemos JOIN entre tablas, necesitamos especificar de cuál tabla viene cada columna. Sin alias:
```sql
SELECT profiles.name, mentor_availability.day_of_week
FROM mentor_availability
INNER JOIN profiles ON mentor_availability.mentor_id = profiles.id
```

Con alias:
```sql
SELECT p.name, ma.day_of_week
FROM mentor_availability ma
INNER JOIN profiles p ON ma.mentor_id = p.id
```

**Ejemplo:**

```sql
-- Sin alias (verbose)
SELECT profiles.name FROM profiles WHERE profiles.role = 'mentor';

-- Con alias (conciso)
SELECT p.name FROM profiles p WHERE p.role = 'mentor';

-- El alias se define DESPUÉS del nombre de la tabla
-- FROM profiles p  ←  "profiles" ahora se llama "p" en esta query
```

---

### Concepto 6: Integridad Referencial

**¿Qué es?**
La integridad referencial es una regla que garantiza que las relaciones entre tablas son válidas. Si una tabla hija (mentor_availability) tiene una FK, el valor DEBE existir en la tabla padre (profiles).

**¿Por qué es importante aquí?**
Si existieran slots de disponibilidad con un `mentor_id` que no existe en `profiles`, tendríamos:
- Datos "huérfanos" que no pertenecen a nadie
- Posibles errores en la aplicación al intentar mostrar datos del mentor
- Indicación de un bug en el sistema

**Ejemplo de Verificación:**

```sql
-- Esta query encuentra slots "huérfanos" (violación de integridad)
SELECT ma.*
FROM mentor_availability ma
LEFT JOIN profiles p ON ma.mentor_id = p.id
WHERE p.id IS NULL;

-- Si devuelve filas, hay un problema de integridad
```

---

### Concepto 7: Tipos de Datos SQL

**¿Qué es?**
Cada columna en SQL tiene un tipo de dato que define qué valores puede almacenar:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `uuid` | Identificador único universal | `'a1b2c3d4-e5f6-...'` |
| `text` / `varchar` | Cadenas de texto | `'Carlos García'` |
| `integer` | Números enteros | `0, 1, 2, 3, 4, 5, 6` |
| `time` | Hora del día | `'09:00:00'`, `'14:30:00'` |
| `boolean` | Verdadero/Falso | `true`, `false` |
| `timestamp` | Fecha y hora completa | `'2025-01-15 10:30:00'` |

**¿Por qué es importante aquí?**
La tabla `mentor_availability` usa tipos específicos:
- `day_of_week` es `integer` (0-6) porque facilita ordenar y comparar
- `start_time` y `end_time` son `time` porque solo guardamos hora, no fecha
- Entender los tipos evita errores de comparación

**Ejemplo:**

```sql
-- Correcto: comparar time con formato correcto
WHERE start_time = '14:00:00'

-- Error común: comparar como número
WHERE start_time = 1400  -- Esto NO funciona

-- Correcto: comparar integer para día
WHERE day_of_week = 5  -- Viernes

-- Error común: comparar como texto
WHERE day_of_week = 'Friday'  -- Esto NO funciona
```

---

### Concepto 8: Ordenamiento (ORDER BY)

**¿Qué es?**
`ORDER BY` especifica cómo ordenar los resultados de una consulta. Por defecto es ascendente (ASC), pero puede ser descendente (DESC).

**¿Por qué es importante aquí?**
Ordenar los resultados facilita:
- Leer los datos de forma lógica
- Verificar que los slots están en el orden esperado
- Comparar manualmente con la interfaz de usuario

**Ejemplo:**

```sql
-- Ordenar por nombre del mentor, luego por día
ORDER BY p.name, ma.day_of_week

-- Resultado ordenado:
-- Ana      | 1 (Lunes)
-- Ana      | 3 (Miércoles)
-- Carlos   | 2 (Martes)
-- Carlos   | 5 (Viernes)
```

---

## Mapa de Conceptos

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONCEPTOS DE ESTA CONSIGNA                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   BASE DE DATOS RELACIONAL                                      │
│         │                                                       │
│         ├── CLAVE PRIMARIA (PK)                                 │
│         │     └── Identifica único cada registro                │
│         │                                                       │
│         ├── CLAVE FORÁNEA (FK)                                  │
│         │     └── Crea relación entre tablas                    │
│         │     └── Habilita INTEGRIDAD REFERENCIAL               │
│         │                                                       │
│         └── JOIN                                                │
│               ├── INNER JOIN (solo coincidencias)               │
│               ├── LEFT JOIN (todas + coincidencias)             │
│               └── Usa ALIAS para claridad                       │
│                                                                 │
│   FUNDAMENTOS SQL                                               │
│         │                                                       │
│         ├── TIPOS DE DATOS                                      │
│         │     └── uuid, text, integer, time, boolean            │
│         │                                                       │
│         └── ORDER BY                                            │
│               └── ASC (ascendente) / DESC (descendente)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conexión: Concepto → Consigna → Solución

| Concepto | Se aplica en | Parte de la solución |
|----------|--------------|----------------------|
| Base de datos relacional | Entender que hay DOS tablas | `FROM mentor_availability ... JOIN profiles` |
| Clave primaria | `profiles.id` es único | `ON ma.mentor_id = p.id` |
| Clave foránea | `mentor_id` referencia a `profiles` | `ON ma.mentor_id = p.id` |
| INNER JOIN | Solo slots con mentor válido | `INNER JOIN profiles p` |
| Alias | Simplificar la query | `ma` para availability, `p` para profiles |
| Tipos de datos | Entender qué columnas seleccionar | `day_of_week` (int), `start_time` (time) |
| ORDER BY | Ordenar resultados | `ORDER BY p.name, ma.day_of_week` |

---

## Recursos de Referencia

| Concepto | Recurso Recomendado |
|----------|---------------------|
| SQL Basics | [W3Schools SQL Tutorial](https://www.w3schools.com/sql/) |
| JOIN visual | [Visual Representation of SQL Joins](https://www.codeproject.com/Articles/33052/Visual-Representation-of-SQL-Joins) |
| PostgreSQL tipos | [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html) |
| Integridad referencial | [Database Normalization](https://www.guru99.com/database-normalization.html) |

---

## Conceptos Adicionales para Database Testing

Además de los conceptos anteriores, para hacer Database Testing efectivo necesitas entender:

### Operaciones CRUD

```
┌─────────────────────────────────────────────────────────────────┐
│                         OPERACIONES CRUD                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   C = CREATE (INSERT)                                           │
│       INSERT INTO tabla (columnas) VALUES (valores);            │
│                                                                 │
│   R = READ (SELECT)                                             │
│       SELECT columnas FROM tabla WHERE condicion;               │
│                                                                 │
│   U = UPDATE                                                    │
│       UPDATE tabla SET columna = valor WHERE condicion;         │
│                                                                 │
│   D = DELETE                                                    │
│       DELETE FROM tabla WHERE condicion;                        │
│                                                                 │
│   ⚠️  SIEMPRE usa WHERE en UPDATE y DELETE                      │
│       (o modificarás/eliminarás TODAS las filas)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Funciones de Agregación

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUNCIONES DE AGREGACIÓN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   COUNT(*)      → Cuenta filas                                  │
│   SUM(columna)  → Suma valores numéricos                        │
│   AVG(columna)  → Promedio de valores                           │
│   MIN(columna)  → Valor mínimo                                  │
│   MAX(columna)  → Valor máximo                                  │
│                                                                 │
│   Se usan con GROUP BY para agrupar resultados:                 │
│                                                                 │
│   SELECT mentor_id, COUNT(*) as total_slots                     │
│   FROM mentor_availability                                      │
│   GROUP BY mentor_id;                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**Documento generado para:** STORY-MYM-19 - Set Mentor Weekly Availability
**Nivel:** 0 - Concept-Driven Learning
**Propósito:** Comprender el "por qué" de las consignas de Database Testing
