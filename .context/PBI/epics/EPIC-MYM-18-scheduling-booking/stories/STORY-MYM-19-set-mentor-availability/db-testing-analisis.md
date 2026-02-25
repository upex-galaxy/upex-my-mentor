# Análisis: MYM-19 - Database Testing

> **Aprendizaje Basado en Consignas**
>
> Este documento explica CÓMO se derivaron las consignas de Database Testing
> a partir de los Acceptance Criteria y Test Cases de la historia MYM-19.

---

## Contexto de la Historia de Usuario

### Historia

**Como** Mentor,
**quiero** configurar mi disponibilidad semanal en un calendario,
**para que** los estudiantes sepan cuándo estoy disponible para reservar sesiones.

### Tabla Principal Involucrada

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABLA: mentor_availability                   │
├──────────────────┬──────────────┬───────────────────────────────┤
│ Columna          │ Tipo         │ Descripción                   │
├──────────────────┼──────────────┼───────────────────────────────┤
│ id               │ uuid (PK)    │ Identificador único           │
│ mentor_id        │ uuid (FK)    │ Referencia a profiles.id      │
│ day_of_week      │ integer      │ 0=Dom, 1=Lun...6=Sáb          │
│ start_time       │ time         │ Hora de inicio                │
│ end_time         │ time         │ Hora de fin                   │
│ is_active        │ boolean      │ Si el slot está activo        │
│ created_at       │ timestamp    │ Fecha de creación             │
│ updated_at       │ timestamp    │ Última modificación           │
└──────────────────┴──────────────┴───────────────────────────────┘
```

---

## Acceptance Criteria Identificados

| ID | Acceptance Criteria | Tipo | Verificable en DB |
|----|---------------------|------|-------------------|
| AC1 | El mentor puede establecer su disponibilidad inicial (ej: "Lunes 9-11, Miércoles 14-17") | Happy Path | ✅ Sí |
| AC2 | El sistema almacena los slots en la tabla `mentor_availability` | Happy Path | ✅ Sí |
| AC3 | El mentor puede actualizar su disponibilidad (eliminar slot, agregar nuevo) | Happy Path | ✅ Sí |
| AC4 | La operación es atómica: elimina todo lo anterior e inserta lo nuevo | Technical | ✅ Sí |
| AC5 | Los horarios no pueden solaparse | Negative | ✅ Sí (constraint) |
| AC6 | El mentor puede eliminar toda su disponibilidad | Edge Case | ✅ Sí |

---

## Test Cases Relacionados (de test-cases.md)

| TC ID | Nombre | Nivel | Prioridad |
|-------|--------|-------|-----------|
| TC-MYM19-001 | Establecer disponibilidad por primera vez | E2E | Critical |
| TC-MYM19-002 | Actualizar disponibilidad (borrar y agregar) | E2E | High |
| TC-MYM19-003 | Validación de slots solapados (UI) | UI | High |
| TC-MYM19-004 | Validación de slots solapados (API) | API | High |
| TC-MYM19-005 | Borrar toda la disponibilidad | E2E | Medium |
| TC-MYM19-006 | Transacción atómica falla en inserción | Integration | High |

---

## Mapeo: De Requisitos a Consignas

### Análisis Previo: ¿Qué debemos verificar?

Antes de crear consignas, identificamos qué aspectos de la base de datos debemos verificar:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASPECTOS A VERIFICAR                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DATOS BÁSICOS                                               │
│     └── ¿Se guardan los slots correctamente?                    │
│     └── ¿Los campos tienen los valores esperados?               │
│                                                                 │
│  2. RELACIONES                                                  │
│     └── ¿Cada slot está asociado a un mentor válido?            │
│     └── ¿La FK mentor_id apunta a un profile existente?         │
│                                                                 │
│  3. INTEGRIDAD                                                  │
│     └── ¿Hay slots huérfanos (sin mentor)?                      │
│     └── ¿Los datos cumplen las reglas de negocio?               │
│                                                                 │
│  4. OPERACIONES CRUD                                            │
│     └── INSERT: ¿Se pueden crear slots?                         │
│     └── UPDATE: ¿Se pueden modificar?                           │
│     └── DELETE: ¿Se pueden eliminar?                            │
│                                                                 │
│  5. ATOMICIDAD                                                  │
│     └── ¿El "guardar" elimina todo e inserta nuevo?             │
│     └── ¿Si falla, hace rollback?                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### AC1 + AC2 → Consignas de Verificación Básica

**Acceptance Criteria:**
> "El mentor establece su disponibilidad y el sistema la almacena"

**Análisis Técnico:**
- Necesitamos verificar que existen registros en `mentor_availability`
- Los registros deben tener `mentor_id`, `day_of_week`, `start_time`, `end_time` correctos
- Debemos poder filtrar por mentor específico

**Consignas Generadas:**

| # | Consigna | Concepto SQL | Razón |
|---|----------|--------------|-------|
| 1 | Exploración inicial | SELECT, ORDER BY | Ver el estado actual de los datos |
| 3 | Filtrado específico | WHERE, IN, AND | Verificar slots de un mentor específico |
| 4 | Acción frontend + verificación | WHERE múltiple | Confirmar que el frontend guardó correctamente |

---

### AC2 → Consignas de Relaciones

**Acceptance Criteria:**
> "El sistema almacena los slots asociados al mentor"

**Análisis Técnico:**
- La tabla tiene FK: `mentor_id → profiles.id`
- Necesitamos verificar que la relación es válida
- Queremos ver datos del mentor junto con sus slots

**Consignas Generadas:**

| # | Consigna | Concepto SQL | Razón |
|---|----------|--------------|-------|
| 2 | Verificación con JOIN | INNER JOIN | Mostrar datos de mentor + slots juntos |
| 11 | Verificación de integridad | LEFT JOIN + NULL | Detectar slots huérfanos |

---

### AC3 → Consignas de Operaciones CRUD

**Acceptance Criteria:**
> "El mentor puede actualizar su disponibilidad"

**Análisis Técnico:**
- UPDATE: Modificar horarios existentes
- DELETE: Eliminar slots
- INSERT: Crear nuevos slots
- Estas operaciones normalmente las hace el frontend, pero debemos saber hacerlas

**Consignas Generadas:**

| # | Consigna | Concepto SQL | Razón |
|---|----------|--------------|-------|
| 7 | INSERT manual | INSERT INTO | Simular creación de slot |
| 8 | UPDATE | UPDATE SET WHERE | Simular modificación |
| 9 | DELETE | DELETE WHERE | Simular eliminación |

---

### AC4 → Consigna de Atomicidad

**Acceptance Criteria:**
> "La operación debe ser atómica: delete all + insert new"

**Análisis Técnico:**
- Cuando el mentor guarda, el backend debe:
  1. Eliminar TODOS los slots existentes del mentor
  2. Insertar los NUEVOS slots
- Si falla la inserción, el delete debe hacer rollback
- Necesitamos verificar el conteo antes/después

**Consignas Generadas:**

| # | Consigna | Concepto SQL | Razón |
|---|----------|--------------|-------|
| 10 | Verificación de atomicidad | COUNT antes/después | Confirmar que solo quedan los nuevos slots |

---

### AC5 → Consigna de Validación de Negocio

**Acceptance Criteria:**
> "Los horarios deben estar en rango válido"

**Análisis Técnico:**
- Regla de negocio: Horarios entre 8 AM y 10 PM
- Necesitamos detectar datos fuera de rango
- Esto valida que el sistema no permite datos inválidos

**Consignas Generadas:**

| # | Consigna | Concepto SQL | Razón |
|---|----------|--------------|-------|
| 6 | Verificación de rango | BETWEEN, NOT | Detectar slots fuera del horario permitido |

---

### Consignas Adicionales para Completar Aprendizaje

Para cubrir más conceptos de SQL útiles, agregamos:

| # | Consigna | Concepto SQL | Razón Pedagógica |
|---|----------|--------------|------------------|
| 5 | Conteo y agregación | COUNT, GROUP BY | Aprender funciones de agregación |
| 12 | Búsqueda por patrón | LIKE, ILIKE | Aprender búsqueda flexible |

---

## Resumen de Cobertura

| Consigna | AC Cubierto | TC Relacionado | Operación SQL | Dificultad |
|----------|-------------|----------------|---------------|------------|
| 1 | AC2 | TC-001 | SELECT | Fácil |
| 2 | AC2 | TC-001 | SELECT + JOIN | Media |
| 3 | AC1 | TC-001 | SELECT + WHERE | Fácil |
| 4 | AC1, AC2 | TC-001 | SELECT + WHERE | Media |
| 5 | - | - | SELECT + GROUP BY | Media |
| 6 | AC5 | TC-003 | SELECT + BETWEEN | Media |
| 7 | AC1 | TC-001 | INSERT | Media |
| 8 | AC3 | TC-002 | UPDATE | Media |
| 9 | AC3, AC6 | TC-002, TC-005 | DELETE | Media |
| 10 | AC4 | TC-006 | SELECT + COUNT | Avanzada |
| 11 | AC2 | - | LEFT JOIN | Avanzada |
| 12 | - | - | LIKE/ILIKE | Media |

---

## Progresión de Dificultad

Las consignas están diseñadas con progresión pedagógica:

### Nivel Básico (Consignas 1, 3)
**Objetivo:** Familiarizarse con SELECT y WHERE
- Query simple sin joins
- Filtros básicos
- Orden de resultados

**Conceptos:**
- `SELECT columnas FROM tabla`
- `WHERE condicion`
- `ORDER BY columna`
- Operadores: `=`, `AND`, `OR`, `IN`

### Nivel Intermedio (Consignas 2, 4, 5, 6, 7, 8, 9, 12)
**Objetivo:** Dominar JOINs, agregaciones y operaciones CRUD
- Relacionar múltiples tablas
- Funciones de agregación
- Modificar datos

**Conceptos:**
- `INNER JOIN tabla ON condicion`
- `COUNT()`, `GROUP BY`
- `BETWEEN`, `LIKE`, `ILIKE`
- `INSERT INTO`, `UPDATE SET`, `DELETE FROM`

### Nivel Avanzado (Consignas 10, 11)
**Objetivo:** Verificaciones complejas de integridad
- Comparación de estados (antes/después)
- Detección de datos inconsistentes
- Subconsultas

**Conceptos:**
- `LEFT JOIN` + `IS NULL`
- `NOT IN (subconsulta)`
- `NOT EXISTS`
- Análisis de atomicidad

---

## Flujo de Aprendizaje Recomendado

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE RESOLUCIÓN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   FASE 1: Exploración (15 min)                                  │
│   └── Consigna 1: Ver todos los datos                           │
│   └── Consigna 2: Entender relaciones                           │
│                                                                 │
│   FASE 2: Filtrado (20 min)                                     │
│   └── Consigna 3: Filtrar por condiciones                       │
│   └── Consigna 4: Verificar acción de frontend                  │
│                                                                 │
│   FASE 3: Análisis (20 min)                                     │
│   └── Consigna 5: Agregaciones                                  │
│   └── Consigna 6: Validación de rangos                          │
│                                                                 │
│   FASE 4: Modificación (30 min)                                 │
│   └── Consigna 7: INSERT                                        │
│   └── Consigna 8: UPDATE                                        │
│   └── Consigna 9: DELETE                                        │
│                                                                 │
│   FASE 5: Avanzado (25 min)                                     │
│   └── Consigna 10: Atomicidad                                   │
│   └── Consigna 11: Integridad referencial                       │
│   └── Consigna 12: Búsqueda por patrón                          │
│                                                                 │
│   TIEMPO TOTAL: ~2 horas                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Valor de Cada Consigna

| Consigna | Habilidad que Desarrolla | Aplicación Real |
|----------|--------------------------|-----------------|
| 1 | Explorar datos desconocidos | Debugging, reconocimiento |
| 2 | Relacionar datos de múltiples tablas | Reportes, análisis |
| 3 | Filtrar datos específicos | Verificación de bugs |
| 4 | Conectar UI con DB | Testing de integración |
| 5 | Análisis agregado | Métricas, dashboards |
| 6 | Validar reglas de negocio | QA de datos |
| 7-9 | Manipular datos | Setup de tests, fixtures |
| 10 | Verificar transacciones | Testing de consistencia |
| 11 | Detectar datos corruptos | Auditoría de datos |
| 12 | Búsqueda flexible | Debugging, soporte |

---

**Documento generado para:** STORY-MYM-19 - Set Mentor Weekly Availability
**Tipo de Testing:** Database Testing
**Metodología:** Aprendizaje Basado en Consignas (Prompt-Driven Learning)
