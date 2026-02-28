# Smoke Test: STORY-MYM-59 - Mentor Respond to Messages from Dashboard

**Staging URL:** https://staging-upexmymentor.vercel.app/dashboard
**Fecha Última Ejecución:** 21/01/2026
**QA:** José Andrés Lorca
**Asistente:** Gemini AI
**Status General:** ❌ FAILED (Blockers detected)

---

## ✅ Smoke Test Checklist

### 1. Acceso Básico & UI

- [x] **Aplicación carga sin errores 500**
- [x] **Estabilidad Visual (Scenario 8):** El widget soporta mensajes infinitos sin romper el layout (Ellipsis funcionando).
- [x] **Navegación (Scenario 6):** El clic en el nombre del alumno funciona incluso durante actualizaciones de estado.

- [⚠️] **No hay errores en console (F12)**
  - **Nota:** Se detectan múltiples errores 404 al refrescar el Dashboard.
  - **Diagnóstico:** Son fallos de prefetch en rutas globales (pricing, about, terms, etc.) ajenas a la mensajería.
  - **Estado:** No bloqueante para STORY-MYM-59.

- [x] **Assets cargan correctamente**
  - [x] CSS carga (página tiene estilos)
  - [x] JavaScript carga (interacciones funcionan)
  - [x] Imágenes cargan (no hay placeholders rotos)

---

### 2. Autenticación

- Email Mentor: `joseqa81@gmail.com`
- Password: `f8N6g5agBHuv#`

- Email Mentee (alumno): `jose-student@hotmail.com`
- Password: `joS123@456`
- Deben redirigir al Dashboard después del login.

- [x] **Login funciona**
  - Mentor y Mentee acceden al dashboard correctamente.
- [x] **Sesión persiste al refrescar**
  - F5 no cierra la sesión.
- [x] **Logout funciona**
  - Redirección correcta al landing.

---

### 3. Happy Path: Dashboard Messages & Quick Reply

**Descripción:** Validar que el mentor puede ver mensajes recientes y responder rápidamente desde el dashboard.

**Steps:**

1. [x] **Ver Widget de Mensajes Recientes**
   - Acción: Navegar al Dashboard.
   - Validar: Se ve el widget "Recent Messages" con hasta 5 conversaciones.
   - Validar: Se muestra nombre, avatar, preview del mensaje y tiempo relativo.

2. [x] **Respuesta Rápida (Quick Reply)**
   - Acción: Click en una conversación del widget.
   - Validar: Se abre modal/vista de conversación.
   - Acción: Escribir "Hola, gracias por contactar" y enviar.
   - Validar: El mensaje aparece en el historial inmediatamente.

3. [x] **Ver todos los mensajes**
   - Acción: Click en "View All Messages".
   - Validar: Redirige a `/dashboard/messages` correctamente.

**Validación visual:**

- [x] UI se ve consistente con Shadcn/UI (cards, botones).
- [x] No hay textos superpuestos en mensajes largos (Scenario 8).
- [x] Estado vacío se muestra si no hay mensajes (Validado: muestra mensaje informativo).

---

### 4. Integración con Backend

**Network Tab Validation:**

- [x] **API calls retornan 200 OK**
  - Abrir DevTools → Network tab
  - Validar requests a `/api/conversations` o similar.

- [❌] **Realtime Updates**
  - Acción: Recibir mensaje nuevo de un mentee (simulado u otro dispositivo).
  - Validar: El widget se actualiza automáticamente sin refrescar.
  - **Nota:** FAILED. Tras limpiar caché y cookies, el widget 'Mensajes Recientes' sigue sin actualizarse automáticamente tras el envío. Requiere F5 (Scenario 1 & 9).

- [x] **Datos del Perfil**
  - Validar: Al abrir la conversación, se puede navegar al perfil del mentee.

---

## 📊 Resultado del Smoke Test

**Ejecutado por:** José Andrés Lorca & Gemini AI
**Última Ejecución:** 21/01/2026
**Estatus Final:** ❌ **FAILED** (Technical Blockers)

### Resumen de la Situación:

El componente es visualmente estable y cumple con la navegación básica (incluyendo el acceso al perfil del alumno - AC #5). Sin embargo, el despliegue no es apto para producción debido a fallos críticos en la gestión de errores de red y en la sincronización de datos en tiempo real.

---

### 🚫 Blockers (Issues Críticos encontrados):

**1. [MYM-132] Crash Crítico por pérdida de conexión (Issue 2)**

- **Descripción:** La aplicación lanza una excepción no controlada (pantalla en blanco) si la red falla durante el envío de un mensaje.
- **Impacto:** Bloqueante. Riesgo de pérdida de datos y mala experiencia de usuario.

**2. Fallo de Sincronización en Tiempo Real (Issue 3)**

- **Descripción:** El widget no actualiza el contenido del mensaje ni el historial de conversación del modal automáticamente tras el envío/recepción.
- **Impacto:** Alto. Invalida la propuesta de valor de un sistema de mensajería "viva". Requiere refresco manual (F5).
- **Nota Técnica:** Probablemente vinculado a la misma causa raíz que el Issue 1 (MYM-96): la suscripción de Sockets no está refrescando el estado del componente Dashboard.

**3. Regresión de Notificaciones [Relacionado con MYM-96] (Issue 1)**

- **Descripción:** El indicador de mensaje no leído (punto morado o zombie dot) persiste incluso después de interactuar con el mensaje a través del Dashboard.
- **Impacto:** Medio (UX).

---

### 🔄 Historial de Re-testing (Resumen)

- **21/01/2026:** Se confirma que el acceso al perfil del alumno (AC #5) ha sido corregido y es funcional. No obstante, persisten problemas de sincronización profunda: el sistema de suscripciones no actualiza el historial interno del modal de respuesta rápida en tiempo real.
- **Conclusión:** La corrección no es completa. Se recomienda NO pasar a producción hasta que los Issues 2 y 3 sean resueltos.

---

### 🧭 Próximos Pasos:

1. Validar corrección de MYM-132 (Resiliencia).
2. Investigar si el Issue 3 es un problema de Front-end (Suscripción de React) o de Back-end (Socket/API).
3. Iniciar fase de pruebas de API para mayor diagnóstico.
