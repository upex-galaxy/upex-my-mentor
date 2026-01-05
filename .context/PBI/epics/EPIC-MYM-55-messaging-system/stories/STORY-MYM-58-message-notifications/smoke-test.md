# Smoke Test: STORY-MYM-58 - Recibir Notificaciones de Mensajes

**Staging URL:** https://staging-upexmymentor.vercel.app/
**Fecha:** 2025-12-14
**QA:** Gemini AI
**Duración:** 5-10 minutos

---

## ✅ Smoke Test Checklist

### 1. Acceso Básico

- [ ] **Aplicación carga sin errores 500**
  - URL: https://staging-upexmymentor.vercel.app/
  - La página de inicio debe cargar completamente.

- [ ] **No hay errores en consola (F12)**
  - La pestaña "Console" no debe mostrar errores en rojo (los warnings amarillos son aceptables).

- [ ] **Assets cargan correctamente**
  - [ ] CSS carga (la página tiene estilos).
  - [ ] JavaScript carga (las interacciones funcionan).
  - [ ] Las imágenes cargan (no hay placeholders de imágenes rotas).

---

### 2. Autenticación

- [ ] **Login funciona**
  - Usar credenciales de un usuario de prueba (ej. `laura@mentee.com`).
  - Debe redirigir al dashboard después de un login exitoso.

- [ ] **Sesión persiste al refrescar**
  - Después de iniciar sesión, refrescar la página (F5) → La sesión debe mantenerse.

- [ ] **Logout funciona**
  - Hacer clic en el botón de logout → Debe redirigir a la página de inicio.

---

### 3. Happy Path: Flujo de Notificación de Mensaje Nuevo

**Descripción:** Validar el ciclo completo de recibir una notificación de mensaje, interactuar con ella y ver la actualización del estado. Se requieren dos usuarios de prueba (Usuario A: receptor, Usuario B: emisor).

**Pasos:**

1. [ ] **Verificar estado inicial**
   - **Acción:** Iniciar sesión como **Usuario A**.
   - **Validar:** El icono de mensajes en la barra de navegación no muestra ninguna insignia (o muestra la cuenta correcta si ya tenía mensajes).

2. [ ] **Recibir un nuevo mensaje**
   - **Acción:** En un navegador o sesión diferente, iniciar sesión como **Usuario B** y enviar un mensaje al **Usuario A**.
   - **Validar (para Usuario A):**
     - [ ] La insignia de notificación aparece en el icono de mensajes con el contador actualizado (ej. "1") en tiempo real (< 3 segundos).
     - [ ] Aparece una notificación "toast" en la esquina de la pantalla mostrando el nombre y un avance del mensaje del Usuario B.

3. [ ] **Interactuar con la notificación "toast"**
   - **Acción:** Hacer clic en la notificación "toast".
   - **Validar:**
     - [ ] Se navega correctamente a la página de la conversación con el Usuario B (`/dashboard/messages/[conversationId]`).
     - [ ] La notificación "toast" se cierra.

4. [ ] **Validar actualización del contador**
   - **Acción:** Una vez en la página de la conversación, los mensajes se marcan como leídos automáticamente.
   - **Validar:** La insignia de notificación en la barra de navegación desaparece o su contador disminuye en tiempo real.

**Validación visual:**
- [ ] La insignia es un círculo rojo/acento con el número en blanco.
- [ ] La notificación "toast" tiene el diseño esperado (avatar, nombre, texto).

---

### 4. Integración con Backend

**Validación en la pestaña Network (F12):**

- [ ] **Suscripción a Supabase Realtime funciona**
  - **Acción:** Al cargar la página, buscar una conexión WebSocket (ws:// o wss://) en la pestaña Network.
  - **Validar:** La conexión se establece y se mantiene activa.

- [ ] **API de lectura de mensajes funciona**
  - **Acción:** Al entrar en una conversación, debe haber una llamada (ej. `PATCH /api/messages/read`) para marcar los mensajes como leídos.
  - **Validar:** La llamada a la API retorna un estado `200 OK`.

- [ ] **API de conteo inicial funciona**
  - **Acción:** Al cargar la página, puede haber una llamada inicial (ej. `GET /api/messages/unread-count`).
  - **Validar:** La API retorna `200 OK` y la respuesta JSON (ej. `{ "count": X }`) coincide con el estado inicial de la insignia.

---

## 📊 Resultado del Smoke Test

**Ejecutado por:** ____________________
**Fecha:** ____________________
**Duración:** ____________________

### Resultado Final:

- [ ] **✅ PASSED:** El deployment es funcional. Se puede proceder con el testing exploratorio.
- [ ] **❌ FAILED:** El deployment está roto. Reportar bug crítico inmediatamente.

---

### Notas (si aplica):



---

### Si FAILED:

**Blocker:** [Descripción del error que bloquea la funcionalidad]

**Evidencia:**
- **Screenshot:** [Adjuntar imagen del error]
- **Errores de consola:** [Copiar y pegar los errores de la consola]

**Próximo paso:**
- Reportar a Desarrollo inmediatamente.
- **NO** continuar con el testing exploratorio hasta que se resuelva.
