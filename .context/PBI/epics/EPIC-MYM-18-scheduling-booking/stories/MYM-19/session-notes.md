# Notas de la Sesión de Pruebas Exploratorias: MYM-19

**Fecha:** 07 de enero de 2026
**Historia:** MYM-19 - Configurar Disponibilidad Semanal del Mentor
**Entorno:** Staging (https://staging-upexmymentor.vercel.app/)
**Tester:** Alejandro (Usuario) + Gemini CLI (Guía)

---

## 🎯 Objetivo / Charter
Explorar el calendario de disponibilidad del mentor para asegurar que los espacios semanales recurrentes puedan crearse, actualizarse y eliminarse correctamente, reflejando los cambios en la base de datos y manejando casos borde como solapamiento de horarios.

---

## 🗺️ Mapa de Exploración

### 1. Happy Path: Configuración Inicial
- **Acciones:** Login como mentor → Navegar a Disponibilidad → Crear nuevos espacios → Guardar.
- **Resultado Esperado:** Mensaje de éxito, los espacios persisten tras refrescar.

### 2. Actualización y Borrado
- **Acciones:** Modificar horas de espacios existentes → Eliminar un espacio → Agregar nuevos → Guardar.
- **Resultado Esperado:** Actualización atómica (espacios antiguos eliminados, nuevos guardados).

### 3. Validación y Casos Borde
- **Acciones:** Intentar guardar espacios solapados → Intentar guardar sin seleccionar días/horas → Verificar comportamiento de zona horaria.
- **Resultado Esperado:** Mensajes de error claros, sin corrupción de datos.

---

## 📝 Registro de la Sesión (Session Log)

### Escenario 1: Flujo Principal y Persistencia
- **Pasos:** Login, acceso a `/dashboard/mentor/availability`, creación de slots.
- **Resultado:** [FALLIDO]
- **Notas:** Los horarios cargan inicialmente bien. Se pueden configurar y ver las horas, pero el guardado es inconsistente o nulo en la mayoría de los casos.

### Escenario 2: Edición y Eliminación
- **Pasos:** Modificar un slot existente y eliminar otro.
- **Resultado:** [FALLIDO]
- **Notas:** En la UI parece funcionar, pero al guardar no hay reacción y al refrescar todo vuelve al estado por defecto.

### Escenario 3: Validaciones de Negocio
- **Pasos:** Probar solapamientos y vaciado total.
- **Resultado:** [PARCIALMENTE EXITOSO]
- **Notas:** La validación de solapamiento funciona. El vaciado total funciona y persiste. Sin embargo, tras vaciarlo, solo permite volver a crear un único slot (ej. Lunes 9-10am), ignorando cualquier intento posterior de agregar más.

---

## 🐞 Errores Encontrados (Issues Found)

### Issue 1: El botón de "Guardar" no persiste los datos ni da feedback (Crítico)
- **Severidad:** High / Critical
- **Pasos para reproducir:**
  1. Iniciar sesión como mentor.
  2. Ir a Disponibilidad.
  3. Modificar o agregar un horario.
  4. Hacer clic en "Guardar".
- **Resultado Esperado:** Debería aparecer un mensaje de éxito (Toast) y los datos deberían guardarse en la DB.
- **Resultado Actual:** No hay reacción visual (no hay toast). La consola muestra un mensaje ambiguo: `"Obtener terminado de cargar POST"`. Al refrescar la página, los cambios han desaparecido.

### Issue 2: Imposibilidad de agregar múltiples horarios tras vaciar el calendario (Alto)
- **Severidad:** High
- **Pasos para reproducir:**
  1. Eliminar todos los horarios existentes y guardar (esto sí persiste).
  2. Intentar agregar un horario para el Lunes (se guarda y persiste).
  3. Intentar agregar un segundo horario para cualquier otro día u hora.
  4. Guardar y refrescar.
- **Resultado Esperado:** Ambos horarios deberían estar presentes.
- **Resultado Actual:** Solo permanece el primer horario creado (Lunes); el resto se pierden.

### Issue 3: La edición y el borrado no son persistentes (Alto)
- **Severidad:** High
- **Pasos para reproducir:**
  1. Cambiar un valor de un horario existente o borrar un slot.
  2. Hacer clic en "Guardar".
  3. Refrescar la página.
- **Resultado Esperado:** El calendario debería reflejar los cambios realizados.
- **Resultado Actual:** El calendario vuelve a su estado por defecto, ignorando los cambios de edición o eliminación.

---

## 💡 Observaciones / Recomendaciones
- [ ] El sistema de validación de solapamiento es correcto ("Este horario se solapa con otro existente"), lo cual es positivo.
- [ ] Se recomienda revisar la lógica del Server Action que maneja el guardado, ya que parece que solo procesa el primer elemento o falla silenciosamente tras la primera inserción.
- [ ] Es urgente implementar feedback visual (Toasts de Sonner o Shadcn) para que el usuario sepa si la operación falló o fue exitosa.