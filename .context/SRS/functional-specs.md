# Functional Specifications: Upex My Mentor

## FR-001: El sistema debe permitir el registro de usuarios con email y contraseña

*   **Relacionado a:** EPIC-UPEX-001 (Gestión de Autenticación y Perfiles de Usuario), US 1.1
*   **Input:**
    *   `email` (string, formato RFC 5321, max 254 chars)
    *   `password` (string, min 8 chars, al menos 1 mayúscula, 1 número, 1 carácter especial)
    *   `role` (enum: 'student', 'mentor')
*   **Processing:**
    *   Validar formato de email.
    *   Validar fortaleza de password según política.
    *   Verificar que el email no exista ya en la base de datos.
    *   Hashear la contraseña.
    *   Crear un nuevo registro de usuario en la tabla `users` con el email, password hasheado y rol.
    *   Enviar un email de verificación de cuenta al email proporcionado.
*   **Output:**
    *   **Success (201 Created):** Objeto de usuario con `id`, `email`, `role`, `created_at`.
    *   **Error (400 Bad Request):** Código de error y mensaje descriptivo (ej. "Email ya registrado", "Contraseña débil", "Formato de email inválido").
*   **Validations:**
    *   El email debe ser único en el sistema.
    *   La contraseña debe cumplir con la política de seguridad.
    *   El email debe ser un formato válido.
    *   El rol debe ser 'student' o 'mentor'.

## FR-002: El sistema debe permitir el inicio de sesión de usuarios

*   **Relacionado a:** EPIC-UPEX-001 (Gestión de Autenticación y Perfiles de Usuario), US 1.2
*   **Input:**
    *   `email` (string, formato RFC 5321)
    *   `password` (string)
*   **Processing:**
    *   Validar formato de email.
    *   Buscar usuario por email.
    *   Comparar la contraseña proporcionada con la contraseña hasheada almacenada.
    *   Si las credenciales son válidas, generar un token de sesión (JWT).
*   **Output:**
    *   **Success (200 OK):** Token de autenticación (JWT) y datos básicos del usuario (`id`, `email`, `role`).
    *   **Error (401 Unauthorized):** Código de error y mensaje descriptivo ("Credenciales inválidas").
*   **Validations:**
    *   El email y la contraseña deben coincidir con un usuario registrado y verificado.

## FR-003: El sistema debe permitir a los usuarios editar su perfil

*   **Relacionado a:** EPIC-UPEX-001 (Gestión de Autenticación y Perfiles de Usuario), US 1.3
*   **Input:**
    *   `userId` (UUID, del usuario autenticado)
    *   `name` (string, max 100 chars, opcional)
    *   `photo_url` (string, URL válida, opcional)
    *   `description` (string, max 500 chars, opcional)
    *   `skills` (array of strings, max 50 skills, opcional)
*   **Processing:**
    *   Verificar que el `userId` corresponde al usuario autenticado.
    *   Actualizar los campos proporcionados en el perfil del usuario en la base de datos.
*   **Output:**
    *   **Success (200 OK):** Objeto de usuario actualizado.
    *   **Error (400 Bad Request):** Mensaje de error si los datos son inválidos.
    *   **Error (401 Unauthorized):** Si el usuario no está autenticado o no tiene permisos.
*   **Validations:**
    *   `name` no debe estar vacío si se proporciona.
    *   `photo_url` debe ser una URL válida si se proporciona.
    *   `description` no debe exceder el límite de caracteres.
    *   `skills` deben ser strings y no exceder el número máximo.

## FR-004: El sistema debe permitir a los mentores añadir y gestionar sus especialidades y tarifa

*   **Relacionado a:** EPIC-UPEX-001 (Gestión de Autenticación y Perfiles de Usuario), US 1.4
*   **Input:**
    *   `mentorId` (UUID, del mentor autenticado)
    *   `specialties` (array of strings, ej. ["React", "AWS", "Python"], requerido)
    *   `hourly_rate` (number, float, > 0, requerido)
*   **Processing:**
    *   Verificar que el `mentorId` corresponde a un usuario con rol 'mentor' y está autenticado.
    *   Actualizar las `specialties` y `hourly_rate` en el perfil del mentor.
*   **Output:**
    *   **Success (200 OK):** Objeto de mentor actualizado.
    *   **Error (400 Bad Request):** Mensaje de error si los datos son inválidos.
    *   **Error (401 Unauthorized):** Si el usuario no es un mentor o no está autenticado.
*   **Validations:**
    *   `specialties` debe ser un array de strings no vacío.
    *   `hourly_rate` debe ser un número positivo.

## FR-005: El sistema debe permitir a los mentores conectar sus cuentas de LinkedIn/GitHub para validación

*   **Relacionado a:** EPIC-UPEX-001 (Gestión de Autenticación y Perfiles de Usuario), US 1.5
*   **Input:**
    *   `mentorId` (UUID, del mentor autenticado)
    *   `linkedin_url` (string, URL de LinkedIn, opcional)
    *   `github_url` (string, URL de GitHub, opcional)
*   **Processing:**
    *   Verificar que el `mentorId` corresponde a un usuario con rol 'mentor' y está autenticado.
    *   Almacenar las URLs proporcionadas en el perfil del mentor.
    *   Marcar el perfil del mentor como "Pendiente de Verificación" para revisión manual/automática.
*   **Output:**
    *   **Success (200 OK):** Objeto de mentor actualizado con URLs y estado de verificación.
    *   **Error (400 Bad Request):** Mensaje de error si las URLs son inválidas.
    *   **Error (401 Unauthorized):** Si el usuario no es un mentor o no está autenticado.
*   **Validations:**
    *   `linkedin_url` y `github_url` deben ser URLs válidas si se proporcionan.

## FR-006: El sistema debe permitir a los estudiantes buscar mentores por especialidad técnica

*   **Relacionado a:** EPIC-UPEX-002 (Búsqueda y Descubrimiento de Mentores), US 2.1
*   **Input:**
    *   `keyword` (string, ej. "React", "Python", "AWS", opcional)
*   **Processing:**
    *   Buscar mentores cuyos `specialties` incluyan la `keyword` proporcionada.
    *   Retornar solo mentores con perfil 'Verificado' y 'Activo'.
*   **Output:**
    *   **Success (200 OK):** Lista paginada de perfiles de mentores (nombre, foto, descripción, especialidades, tarifa, valoración promedio).
*   **Validations:**
    *   `keyword` puede ser vacío para mostrar todos los mentores.

## FR-007: El sistema debe permitir a los estudiantes filtrar mentores por precio, disponibilidad y valoraciones

*   **Relacionado a:** EPIC-UPEX-002 (Búsqueda y Descubrimiento de Mentores), US 2.2
*   **Input:**
    *   `min_price` (number, float, opcional)
    *   `max_price` (number, float, opcional)
    *   `available_date` (date, opcional)
    *   `min_rating` (number, float, 0-5, opcional)
*   **Processing:**
    *   Aplicar filtros a la lista de mentores (previamente filtrada por keyword si aplica).
    *   Filtrar por `hourly_rate` dentro del rango `min_price` y `max_price`.
    *   Filtrar por mentores que tengan disponibilidad en `available_date`.
    *   Filtrar por `average_rating` mayor o igual a `min_rating`.
*   **Output:**
    *   **Success (200 OK):** Lista paginada de perfiles de mentores filtrados.
*   **Validations:**
    *   `min_price` y `max_price` deben ser números positivos, `min_price` <= `max_price`.
    *   `available_date` debe ser una fecha futura válida.
    *   `min_rating` debe estar entre 0 y 5.

## FR-008: El sistema debe permitir a los estudiantes ver el perfil detallado de un mentor

*   **Relacionado a:** EPIC-UPEX-002 (Búsqueda y Descubrimiento de Mentores), US 2.3
*   **Input:**
    *   `mentorId` (UUID)
*   **Processing:**
    *   Buscar el perfil del mentor por `mentorId`.
    *   Recuperar toda la información pública del mentor, incluyendo experiencia, habilidades, tarifa, valoraciones y comentarios.
*   **Output:**
    *   **Success (200 OK):** Objeto completo del perfil del mentor, incluyendo `name`, `photo_url`, `description`, `specialties`, `hourly_rate`, `average_rating`, `reviews` (lista de comentarios y valoraciones).
    *   **Error (404 Not Found):** Si el `mentorId` no existe o el perfil no está activo/verificado.
*   **Validations:**
    *   `mentorId` debe ser un UUID válido.

## FR-009: El sistema debe permitir a los estudiantes ver la disponibilidad de un mentor y reservar una sesión

*   **Relacionado a:** EPIC-UPEX-003 (Booking y Gestión de Sesiones), US 3.1
*   **Input:**
    *   `studentId` (UUID, del estudiante autenticado)
    *   `mentorId` (UUID)
    *   `session_date` (datetime)
    *   `duration_minutes` (number, ej. 30, 60)
*   **Processing:**
    *   Verificar que el `studentId` corresponde al usuario autenticado.
    *   Verificar que el `mentorId` es de un mentor activo y verificado.
    *   Verificar que el `session_date` y `duration_minutes` corresponden a un slot disponible en el calendario del mentor.
    *   Calcular el costo total de la sesión.
    *   Crear una reserva provisional.
*   **Output:**
    *   **Success (200 OK):** Detalles de la reserva provisional, incluyendo costo total y pasos para el pago.
    *   **Error (400 Bad Request):** Si el slot no está disponible o la duración es inválida.
    *   **Error (401 Unauthorized):** Si el usuario no es un estudiante o no está autenticado.
*   **Validations:**
    *   `session_date` debe ser una fecha y hora futura.
    *   `duration_minutes` debe ser un valor permitido (ej. 30, 60).
    *   El slot debe estar realmente disponible.

## FR-010: El sistema debe permitir a los mentores gestionar su calendario y aceptar/rechazar solicitudes

*   **Relacionado a:** EPIC-UPEX-003 (Booking y Gestión de Sesiones), US 3.2
*   **Input:**
    *   `mentorId` (UUID, del mentor autenticado)
    *   `action` (enum: 'add_availability', 'remove_availability', 'accept_request', 'reject_request')
    *   `slot_details` (datetime, duration, para add/remove)
    *   `booking_id` (UUID, para accept/reject)
*   **Processing:**
    *   Verificar que el `mentorId` corresponde al mentor autenticado.
    *   Para 'add_availability'/'remove_availability': Actualizar los slots disponibles en el calendario del mentor.
    *   Para 'accept_request'/'reject_request': Actualizar el estado de la reserva (`booking_id`) y notificar al estudiante.
*   **Output:**
    *   **Success (200 OK):** Estado actualizado del calendario o de la reserva.
    *   **Error (400 Bad Request):** Si la acción es inválida o el slot/booking no existe.
    *   **Error (401 Unauthorized):** Si el usuario no es un mentor o no está autenticado.
*   **Validations:**
    *   Los slots de disponibilidad deben ser coherentes (no solaparse).
    *   Solo se pueden aceptar/rechazar solicitudes pendientes.

## FR-011: El sistema debe enviar notificaciones de confirmación y recordatorios de sesiones

*   **Relacionado a:** EPIC-UPEX-003 (Booking y Gestión de Sesiones), US 3.3
*   **Input:** (Interno, activado por eventos del sistema)
    *   `event_type` (enum: 'booking_confirmed', 'session_reminder', 'booking_cancelled')
    *   `user_email` (string)
    *   `session_details` (object)
*   **Processing:**
    *   Cuando ocurre un evento relevante (reserva confirmada, sesión próxima, cancelación), generar y enviar un email al usuario correspondiente.
*   **Output:**
    *   **Success:** Email enviado.
    *   **Error:** Fallo en el envío del email (registrado para reintento).
*   **Validations:**
    *   El email debe ser un formato válido.
    *   Las plantillas de email deben estar predefinidas.

## FR-012: El sistema debe proporcionar un enlace de videollamada para las sesiones

*   **Relacionado a:** EPIC-UPEX-003 (Booking y Gestión de Sesiones), US 3.4
*   **Input:**
    *   `bookingId` (UUID)
    *   `userId` (UUID, del usuario autenticado)
*   **Processing:**
    *   Verificar que el `userId` está asociado al `bookingId` como estudiante o mentor.
    *   Generar o recuperar un enlace único de videollamada para la sesión.
*   **Output:**
    *   **Success (200 OK):** URL del enlace de la videollamada.
    *   **Error (401 Unauthorized):** Si el usuario no está autorizado para acceder a esa sesión.
    *   **Error (404 Not Found):** Si el `bookingId` no existe.
*   **Validations:**
    *   El enlace debe ser accesible solo para los participantes de la sesión.
    *   El enlace debe ser válido durante la duración de la sesión.

## FR-013: El sistema debe permitir a los estudiantes valorar y comentar a su mentor

*   **Relacionado a:** EPIC-UPEX-004 (Sistema de Reputación y Feedback), US 4.1
*   **Input:**
    *   `studentId` (UUID, del estudiante autenticado)
    *   `mentorId` (UUID)
    *   `bookingId` (UUID, de la sesión completada)
    *   `rating` (number, integer, 1-5)
    *   `comment` (string, max 500 chars, opcional)
*   **Processing:**
    *   Verificar que el `studentId` corresponde al usuario autenticado y que la sesión (`bookingId`) ha sido completada y no ha sido valorada previamente por este estudiante.
    *   Almacenar la valoración y el comentario en la base de datos, asociados al mentor y a la sesión.
    *   Recalcular la valoración promedio del mentor.
*   **Output:**
    *   **Success (201 Created):** Confirmación de la valoración.
    *   **Error (400 Bad Request):** Si la sesión no ha terminado, ya fue valorada, o los datos son inválidos.
    *   **Error (401 Unauthorized):** Si el usuario no es el estudiante de la sesión.
*   **Validations:**
    *   `rating` debe ser un entero entre 1 y 5.
    *   `comment` no debe exceder el límite de caracteres.
    *   Solo se puede valorar una sesión una vez.

## FR-014: El sistema debe permitir a los mentores valorar y comentar a su estudiante

*   **Relacionado a:** EPIC-UPEX-004 (Sistema de Reputación y Feedback), US 4.2
*   **Input:**
    *   `mentorId` (UUID, del mentor autenticado)
    *   `studentId` (UUID)
    *   `bookingId` (UUID, de la sesión completada)
    *   `rating` (number, integer, 1-5)
    *   `comment` (string, max 500 chars, opcional)
*   **Processing:**
    *   Verificar que el `mentorId` corresponde al usuario autenticado y que la sesión (`bookingId`) ha sido completada y no ha sido valorada previamente por este mentor.
    *   Almacenar la valoración y el comentario en la base de datos, asociados al estudiante y a la sesión.
    *   Recalcular la valoración promedio del estudiante (para futuros mentores).
*   **Output:**
    *   **Success (201 Created):** Confirmación de la valoración.
    *   **Error (400 Bad Request):** Si la sesión no ha terminado, ya fue valorada, o los datos son inválidos.
    *   **Error (401 Unauthorized):** Si el usuario no es el mentor de la sesión.
*   **Validations:**
    *   `rating` debe ser un entero entre 1 y 5.
    *   `comment` no debe exceder el límite de caracteres.
    *   Solo se puede valorar una sesión una vez.

## FR-015: El sistema debe mostrar valoraciones y comentarios en los perfiles de usuario

*   **Relacionado a:** EPIC-UPEX-004 (Sistema de Reputación y Feedback), US 4.3
*   **Input:**
    *   `profileId` (UUID, del perfil a consultar)
*   **Processing:**
    *   Recuperar la valoración promedio y la lista de comentarios asociados al `profileId` (ya sea mentor o estudiante).
    *   Retornar solo valoraciones y comentarios públicos.
*   **Output:**
    *   **Success (200 OK):** Objeto con `average_rating` (float) y `reviews` (array de objetos con `rating`, `comment`, `reviewer_name`, `created_at`).
    *   **Error (404 Not Found):** Si el `profileId` no existe.
*   **Validations:**
    *   `profileId` debe ser un UUID válido.

## FR-016: El sistema debe permitir a los estudiantes pagar de forma segura por una sesión

*   **Relacionado a:** EPIC-UPEX-005 (Procesamiento de Pagos), US 5.1
*   **Input:**
    *   `studentId` (UUID, del estudiante autenticado)
    *   `bookingId` (UUID, de la reserva provisional)
    *   `payment_method_details` (token de tarjeta de crédito/débito de la pasarela de pago)
*   **Processing:**
    *   Verificar que el `studentId` corresponde al usuario autenticado.
    *   Verificar que el `bookingId` es una reserva provisional válida y pendiente de pago.
    *   Procesar el pago a través de la pasarela de pago (ej. Stripe), cargando el monto total al estudiante.
    *   Actualizar el estado de la reserva a 'Pagada' y 'Confirmada'.
    *   Notificar al mentor de la confirmación de la reserva.
*   **Output:**
    *   **Success (200 OK):** Confirmación del pago y de la reserva.
    *   **Error (400 Bad Request):** Si el pago falla (ej. tarjeta rechazada).
    *   **Error (401 Unauthorized):** Si el usuario no está autenticado o no es el estudiante de la reserva.
*   **Validations:**
    *   `payment_method_details` debe ser un token válido de la pasarela de pago.
    *   La reserva debe estar en estado 'pendiente de pago'.

## FR-017: El sistema debe permitir a los mentores recibir sus pagos de sesiones completadas

*   **Relacionado a:** EPIC-UPEX-005 (Procesamiento de Pagos), US 5.2
*   **Input:** (Interno, activado por el sistema)
    *   `bookingId` (UUID, de la sesión completada y pagada)
*   **Processing:**
    *   Cuando una sesión se marca como 'Completada' y 'Pagada', calcular el monto a transferir al mentor (monto total - comisión de la plataforma).
    *   Iniciar la transferencia de fondos al mentor a través de la pasarela de pago (ej. Stripe Connect).
    *   Registrar la transacción de pago al mentor.
*   **Output:**
    *   **Success:** Transferencia iniciada/completada.
    *   **Error:** Fallo en la transferencia (registrado para revisión manual).
*   **Validations:**
    *   La sesión debe estar en estado 'Completada' y 'Pagada'.
    *   El mentor debe tener una cuenta de pagos configurada.

## FR-018: El sistema debe permitir a los usuarios ver un historial de sus transacciones y pagos

*   **Relacionado a:** EPIC-UPEX-005 (Procesamiento de Pagos), US 5.3
*   **Input:**
    *   `userId` (UUID, del usuario autenticado)
*   **Processing:**
    *   Recuperar todas las transacciones (pagos realizados por estudiantes, pagos recibidos por mentores) asociadas al `userId`.
*   **Output:**
    *   **Success (200 OK):** Lista paginada de transacciones, incluyendo `bookingId`, `amount`, `commission_applied` (si aplica), `net_amount` (si aplica), `transaction_date`, `status`.
    *   **Error (401 Unauthorized):** Si el usuario no está autenticado.
*   **Validations:**
    *   `userId` debe ser un UUID válido.
