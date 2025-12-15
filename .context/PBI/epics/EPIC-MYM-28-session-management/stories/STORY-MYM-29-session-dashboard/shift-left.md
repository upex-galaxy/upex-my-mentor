🧪 Casos de Prueba Shift-Left - Generados el 11/11/2025
Ingeniero/a QA: Generado por IA
Estado: Borrador - Pendiente de revisión por PO / Desarrollador

📋 FASE 1: Análisis Crítico
Contexto del Negocio de esta Historia
Usuario principal afectado:
👩‍💻 Laura, Desarrolladora Junior – Necesita ver sus próximas sesiones para poder prepararse y administrar su tiempo.

Usuario secundario:
👨‍💻 Carlos, Arquitecto Senior – Necesita ver sus sesiones programadas para gestionar su disponibilidad.

Valor para el negocio:

Propuesta de valor: “Flexibilidad y elección” – El panel (dashboard) es una funcionalidad clave para la gestión posterior a una reserva, reduciendo la fricción.

Impacto en el negocio: Mejora la retención de usuarios al ofrecer una forma clara y autoservicio de gestionar sus sesiones, reduciendo la carga del soporte.

Viaje del usuario relacionado:

Etapa: Gestión posterior a la reserva

Paso: El panel es el punto de entrada para todas las acciones posteriores a la reserva (unirse a una llamada, dejar una reseña, etc.).

Contexto Técnico de esta Historia
Componentes de la arquitectura:
Frontend:

Componentes: SessionDashboard, UpcomingSessionsTab, PastSessionsTab, SessionCard, EmptyState, LoadingSpinner.

Páginas/Rutas: /dashboard/sessions (ruta autenticada).

Manejo de estado: Contexto de autenticación para obtener el userId, SWR/React Query para obtener datos.

Backend:

Endpoints API: GET /api/bookings?status=upcoming|past

Servicios: BookingService para obtener las sesiones del usuario.

Base de datos: Tabla bookings.

Puntos de integración:

Frontend ↔ Backend API: (obtención de sesiones).

Backend API ↔ Base de datos: (consulta a la tabla bookings).

Análisis de Complejidad de la Historia
Complejidad general: Media

Factores:

Complejidad de lógica de negocio: Media (dividir correctamente sesiones, manejo de zonas horarias).

Complejidad de integración: Baja (solo un endpoint API).

Complejidad de UI: Media (manejar dos pestañas, estados de carga y vacíos).

Esfuerzo estimado de pruebas: Medio

🚨 FASE 2: Análisis de Calidad de la Historia
Ambigüedades Identificadas
Ambigüedad 1: La historia dice “muestra el nombre del otro participante”, pero no especifica qué hacer si el nombre está vacío o es null.
👉 Pregunta para PO/Dev: ¿Qué se debe mostrar si el nombre es null? ¿“Usuario anónimo”? ¿Su email?
📈 Impacto en testing: No se puede probar el escenario de un usuario sin nombre.

Ambigüedad 2: No se define el comportamiento de paginación.
👉 Pregunta para PO/Dev: ¿Cuántos elementos por página? ¿Es scroll infinito o paginación clásica? ¿Cuál es el comportamiento esperado?

Información Faltante / Brechas
Brecha 1: No se mencionan los estados de carga ni error en los criterios de aceptación.
🧠 Por qué es crítico: La interfaz debe manejar estos estados correctamente para brindar buena experiencia al usuario.
💡 Sugerencia: Agregar criterios de aceptación para cuando la llamada a la API está en progreso o falla.

Casos límite no cubiertos en la historia original
Usuario que solo tiene sesiones en la pestaña “Próximas” o solo en “Pasadas”.

Una sesión que ocurre exactamente ahora: ¿debe aparecer en “Próximas” o en “Pasadas”?

Usuario (mentor o aprendiz) con nombre vacío o nulo.

✅ FASE 3: Criterios de Aceptación Refinados
Escenario 1: Usuario con sesiones próximas y pasadas visualiza el panel
Tipo: Positivo

Prioridad: Crítica

Dado: Un usuario autenticado tiene 2 sesiones próximas y 3 pasadas.
Cuando: El usuario navega a /dashboard/sessions.
Entonces: La pestaña “Próximas” se muestra por defecto con 2 tarjetas de sesión.
Y: La pestaña “Pasadas” muestra 3 tarjetas.
Y: Cada tarjeta muestra correctamente el nombre del otro participante y la fecha/hora en la zona horaria local del usuario.

Escenario 2: Usuario sin sesiones visualiza el panel
Tipo: Negativo

Prioridad: Alta

Dado: Usuario autenticado sin sesiones.
Cuando: Navega a /dashboard/sessions.
Entonces: Se muestra el mensaje “Aún no tienes sesiones”.
Y: Un botón visible con el texto “Buscar un mentor”.

Escenario 3: La API falla al cargar las sesiones
Tipo: Negativo

Prioridad: Media

Dado: Usuario autenticado navega a /dashboard/sessions.
Cuando: La llamada GET /api/bookings devuelve un error 500.
Entonces: El panel muestra “Error al cargar las sesiones. Inténtalo nuevamente.”
Y: Aparece un botón “Reintentar”.

🧪 FASE 4: Diseño de Pruebas (Test Design)
TC-MYM-29-01: Verificar que el panel muestra correctamente las sesiones próximas y pasadas
Escenario relacionado: 1

Tipo: Positivo

Prioridad: Crítica

Nivel de prueba: UI

Precondiciones:

Usuario autenticado.

En base de datos: 2 sesiones próximas y 3 pasadas.

Pasos de prueba:

Navegar a /dashboard/sessions.

Verificar que la pestaña “Próximas” está activa.

Verificar que hay exactamente 2 componentes SessionCard.

Hacer clic en la pestaña “Pasadas”.

Verificar que está activa.

Verificar que hay 3 SessionCard.

TC-MYM-29-02: Verificar los detalles de la tarjeta de sesión
Escenario relacionado: 1

Tipo: Positivo

Prioridad: Crítica

Nivel: UI

Precondiciones:

Usuario autenticado.

Tiene una sesión próxima con “Carlos, el Arquitecto Senior”.

Fecha de la sesión: 2025-12-01T10:00:00Z.

Zona horaria del usuario: America/New_York (EST).

Pasos:

Navegar a /dashboard/sessions.

Localizar la tarjeta de esa sesión.

Verificar que muestra el nombre “Carlos, el Arquitecto Senior”.

Verificar que la hora se convierte correctamente a la zona local (“1 de diciembre de 2025, 5:00 AM EST”).

TC-MYM-29-03: Verificar el estado vacío para un usuario nuevo
Escenario relacionado: 2

Tipo: Negativo

Prioridad: Alta

Nivel: UI

Precondiciones: Usuario autenticado sin reservas.

Pasos:

Navegar a /dashboard/sessions.

Verificar que aparece el mensaje “Aún no tienes sesiones”.

Verificar que hay un botón “Buscar un mentor”, visible y clickeable.

TC-MYM-29-04: Verificar el estado de error cuando falla la API
Escenario relacionado: 3

Tipo: Negativo

Prioridad: Media

Nivel: UI

Precondiciones:

Usuario autenticado.

La API /api/bookings devuelve un error 500 simulado.

Pasos:

Navegar a /dashboard/sessions.

Verificar que aparece el mensaje “Error al cargar las sesiones. Inténtalo nuevamente.”

Verificar que hay un botón “Reintentar”.

TC-MYM-29-05: Verificar el estado de carga (loading)
Tipo: Positivo

Prioridad: Media

Nivel: UI

Precondiciones:

Usuario autenticado.

La API /api/bookings tiene un retraso simulado de 2 segundos.

Pasos:

Navegar a /dashboard/sessions.

Verificar que se muestra un spinner o “skeleton loader” mientras se cargan los datos.

Verificar que el loader desaparece al completarse la carga.

📢 Acción Requerida
👤 @[Product Owner]:

Revisar y responder las preguntas críticas.

Validar las mejoras sugeridas en la historia.

Confirmar el comportamiento esperado en los casos límite.

👨‍💻 @[Líder de Desarrollo]:

Revisar las preguntas técnicas.

Validar puntos de integración y el enfoque de pruebas.

Próximos pasos:
El equipo discute las preguntas críticas y ambigüedades.

PO/Dev proveen respuestas y aclaraciones.

QA actualiza los casos de prueba según el feedback.

Desarrollo inicia la implementación con criterios de aceptación claros.
