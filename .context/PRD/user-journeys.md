# User Journeys: Upex My Mentor

## 1. Journey Title: Registro de Estudiante y Reserva de Primera Sesión (Happy Path)

*   **Persona:** Laura, la Desarrolladora Junior
*   **Scenario:** Laura está atascada en un problema de React en su trabajo y necesita ayuda urgente de un experto. Ha oído hablar de Upex My Mentor y decide probarlo.

*   **Steps:**

    *   **Step 1:**
        *   **User Action:** Laura visita la página de inicio de Upex My Mentor y hace clic en "Registrarse como Estudiante".
        *   **System Response:** La plataforma muestra un formulario de registro con campos para email y contraseña.
        *   **Pain Point:** Ninguno. El proceso es claro y directo.

    *   **Step 2:**
        *   **User Action:** Laura completa el formulario y hace clic en "Crear Cuenta".
        *   **System Response:** La plataforma crea su cuenta, la redirige a un onboarding básico (ej. "cuéntanos qué buscas") y le envía un email de verificación.
        *   **Pain Point:** Podría sentirse abrumada si el onboarding es demasiado largo o pide demasiada información inicial.

    *   **Step 3:**
        *   **User Action:** Laura busca mentores usando el filtro "React" y "Frontend".
        *   **System Response:** La plataforma muestra una lista de mentores que cumplen los criterios, con sus fotos, nombres, especialidades, tarifas y valoraciones promedio.
        *   **Pain Point:** Si la lista es muy larga o los filtros no son efectivos, podría frustrarse al no encontrar rápidamente un mentor relevante.

    *   **Step 4:**
        *   **User Action:** Laura revisa varios perfiles, se detiene en uno con buenas valoraciones y experiencia relevante en React, y hace clic en "Ver Disponibilidad".
        *   **System Response:** Se muestra el calendario del mentor con los slots disponibles y la opción de seleccionar una duración de sesión (ej. 30 min, 60 min).
        *   **Pain Point:** Si el calendario del mentor está vacío o no hay slots disponibles pronto, Laura podría desanimarse.

    *   **Step 5:**
        *   **User Action:** Laura selecciona un slot de 60 minutos para mañana por la tarde y procede al pago.
        *   **System Response:** La plataforma la redirige a una pasarela de pago segura (ej. Stripe) para introducir sus datos de tarjeta.
        *   **Pain Point:** Preocupación por la seguridad de sus datos de pago si la pasarela no parece confiable.

    *   **Step 6:**
        *   **User Action:** Laura completa el pago.
        *   **System Response:** La plataforma confirma la reserva, le envía un email con los detalles de la sesión y el enlace de la videollamada, y actualiza el calendario del mentor.
        *   **Pain Point:** Ninguno. Proceso exitoso.

    *   **Step 7:**
        *   **User Action:** Al día siguiente, Laura hace clic en el enlace de la videollamada 5 minutos antes de la sesión.
        *   **System Response:** Se abre la sala de videollamada y el mentor ya está esperando.
        *   **Pain Point:** Problemas técnicos con la videollamada (audio, video, conexión) podrían arruinar la experiencia.

*   **Expected Outcome:** Laura recibe mentoría experta, resuelve su problema de React y se siente más segura en su trabajo.

*   **Alternative Paths / Edge Cases:**
    *   **¿Qué pasa si el pago falla?** La plataforma notifica a Laura del error, le permite reintentar el pago o usar otro método, y no confirma la sesión hasta que el pago sea exitoso.
    *   **¿Qué pasa si el mentor cancela?** La plataforma notifica a Laura, le ofrece reprogramar con el mismo mentor o buscar otro, y procesa un reembolso completo si no se reprograma.

## 2. Journey Title: Registro de Mentor y Configuración de Perfil

*   **Persona:** Carlos, el Arquitecto Senior
*   **Scenario:** Carlos ha decidido monetizar su experiencia y busca una plataforma confiable para ofrecer mentorías.

*   **Steps:**

    *   **Step 1:**
        *   **User Action:** Carlos visita Upex My Mentor y hace clic en "Registrarse como Mentor".
        *   **System Response:** La plataforma muestra un formulario de registro inicial (email, contraseña) y luego un flujo de onboarding específico para mentores.
        *   **Pain Point:** Si el proceso de registro es demasiado largo o pide información irrelevante, Carlos podría abandonarlo.

    *   **Step 2:**
        *   **User Action:** Carlos completa su perfil de mentor, incluyendo su experiencia, especialidades técnicas (ej. Arquitectura de Microservicios, AWS, Go), tarifa por hora y una descripción detallada.
        *   **System Response:** La plataforma guarda la información y le pide conectar su LinkedIn/GitHub para verificación.
        *   **Pain Point:** La interfaz para añadir especialidades o gestionar la tarifa podría ser confusa o poco intuitiva.

    *   **Step 3:**
        *   **User Action:** Carlos conecta su cuenta de LinkedIn y GitHub.
        *   **System Response:** La plataforma inicia el proceso de verificación de credenciales y le notifica que su perfil está "Pendiente de Aprobación".
        *   **Pain Point:** Si el proceso de verificación es lento o poco transparente, Carlos podría impacientarse.

    *   **Step 4:**
        *   **User Action:** Carlos configura su disponibilidad en el calendario de la plataforma.
        *   **System Response:** El calendario muestra slots disponibles para que los estudiantes puedan reservar.
        *   **Pain Point:** La gestión del calendario podría ser tediosa si no es fácil de usar o no permite importar/exportar.

    *   **Step 5:**
        *   **User Action:** Carlos recibe una notificación de que su perfil ha sido aprobado.
        *   **System Response:** Su perfil se activa y es visible para los estudiantes.
        *   **Pain Point:** Ninguno. Proceso exitoso.

*   **Expected Outcome:** Carlos tiene un perfil de mentor activo y verificado, listo para recibir solicitudes de sesión y monetizar su experiencia.

*   **Alternative Paths / Edge Cases:**
    *   **¿Qué pasa si la verificación de credenciales falla?** La plataforma notifica a Carlos el motivo del rechazo y le ofrece opciones para apelar o proporcionar información adicional.
    *   **¿Qué pasa si Carlos no configura su disponibilidad?** Su perfil se muestra como "No Disponible" o con una advertencia, y la plataforma le recuerda que debe configurar su calendario para recibir reservas.

## 3. Journey Title: Estudiante Deja Valoración y Mentor Recibe Pago

*   **Persona:** Laura, la Desarrolladora Junior (para valoración) y Carlos, el Arquitecto Senior (para pago)
*   **Scenario:** Laura ha completado una sesión exitosa con un mentor y quiere dejar su feedback. Carlos ha completado la sesión y espera su pago.

*   **Steps:**

    *   **Step 1 (Laura):**
        *   **User Action:** Después de la sesión, Laura recibe un email o notificación in-app solicitando su valoración.
        *   **System Response:** La plataforma la redirige a un formulario de valoración con estrellas y un campo de texto para comentarios.
        *   **Pain Point:** Si el formulario es muy largo o aparece en un momento inoportuno, Laura podría ignorarlo.

    *   **Step 2 (Laura):**
        *   **User Action:** Laura valora al mentor con 5 estrellas y deja un comentario positivo.
        *   **System Response:** La valoración se guarda y se hace visible en el perfil del mentor.
        *   **Pain Point:** Ninguno. Proceso exitoso.

    *   **Step 3 (Carlos):**
        *   **User Action:** Carlos recibe una notificación de que la sesión ha sido completada y el pago está en proceso.
        *   **System Response:** La plataforma muestra el monto a recibir (después de la comisión) y la fecha estimada de transferencia a su cuenta bancaria.
        *   **Pain Point:** Si el proceso de pago es lento o poco transparente, Carlos podría preocuparse por sus ingresos.

    *   **Step 4 (Carlos):**
        *   **User Action:** Carlos revisa su historial de transacciones en la plataforma.
        *   **System Response:** El historial muestra la sesión completada, el monto bruto, la comisión de la plataforma y el monto neto recibido.
        *   **Pain Point:** Si el desglose no es claro, podría generar confusión.

    *   **Step 5 (Carlos):**
        *   **User Action:** Carlos recibe el pago en su cuenta bancaria.
        *   **System Response:** La plataforma marca la transacción como "Pagada".
        *   **Pain Point:** Retrasos inesperados en la transferencia bancaria.

*   **Expected Outcome:** Laura contribuye a la comunidad con su feedback, y Carlos recibe su pago de forma eficiente y transparente.

*   **Alternative Paths / Edge Cases:**
    *   **¿Qué pasa si Laura no valora al mentor?** La plataforma puede enviar recordatorios suaves, pero no es un bloqueo. La sesión se marca como completada de todos modos.
    *   **¿Qué pasa si hay una disputa sobre la sesión?** La plataforma tiene un proceso de mediación (fuera del MVP, pero a considerar para v2) para resolver conflictos antes de procesar el pago final.
