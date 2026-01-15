# Smoke Test: STORY-MYM-59 - Mentor Respond to Messages from Dashboard

**Staging URL:** https://upex-my-mentor-develop.vercel.app
**Fecha:** 2025-12-23
**QA:** José Andrés Lorca
**Asistente:** Gemini AI
**Duración:** 5-10 minutos

---

## ✅ Smoke Test Checklist

### 1. Acceso Básico

- [ ] **Aplicación carga sin errores 500**
  - URL: https://upex-my-mentor-develop.vercel.app
  - Landing page debe cargar completamente

- [ ] **No hay errores en console (F12)**
  - Console tab no debe mostrar errores rojos
  - Advertencias amarillas son aceptables

- [ ] **Assets cargan correctamente**
  - [ ] CSS carga (página tiene estilos)
  - [ ] JavaScript carga (interacciones funcionan)
  - [ ] Imágenes cargan (no hay placeholders rotos)

---

### 2. Autenticación

- [ ] **Login funciona**
  - Email: `mentor-test@example.com`
  - Password: `Test123!`
  - Debe redirigir a dashboard después de login

- [ ] **Sesión persiste al refrescar**
  - Refrescar página (F5) → Sesión debe mantenerse

- [ ] **Logout funciona**
  - Click en logout → Debe redirigir a landing/login

---

### 3. Happy Path: Dashboard Messages & Quick Reply

**Descripción:** Validar que el mentor puede ver mensajes recientes y responder rápidamente desde el dashboard.

**Steps:**

1. [ ] **Ver Widget de Mensajes Recientes**
   - Acción: Navegar al Dashboard.
   - Validar: Se ve el widget "Recent Messages" con hasta 5 conversaciones.
   - Validar: Se muestra nombre, avatar, preview del mensaje y tiempo relativo.

2. [ ] **Respuesta Rápida (Quick Reply)**
   - Acción: Click en una conversación del widget.
   - Validar: Se abre modal/vista de conversación.
   - Acción: Escribir "Hola, gracias por contactar" y enviar.
   - Validar: El mensaje aparece en el historial inmediatamente.

3. [ ] **Ver todos los mensajes**
   - Acción: Click en "View All Messages".
   - Validar: Redirige a `/dashboard/messages`.

**Validación visual:**

- [ ] UI se ve consistente con Shadcn/UI (cards, botones).
- [ ] No hay textos superpuestos en mensajes largos.
- [ ] Estado vacío se muestra si no hay mensajes.

---

### 4. Integración con Backend

**Network Tab Validation:**

- [ ] **API calls retornan 200 OK**
  - Abrir DevTools → Network tab
  - Validar requests a `/api/conversations` o similar.

- [❌] **Realtime Updates**
  - Acción: Recibir mensaje nuevo de un mentee (simulado u otro dispositivo).
  - Validar: El widget se actualiza automáticamente sin refrescar.
  - **Nota:** FAILED. Tras limpiar caché y cookies, el widget 'Mensajes Recientes' sigue sin actualizarse automáticamente tras el envío.

- [ ] **Datos del Perfil**
  - Validar: Al abrir la conversación, se puede navegar al perfil del mentee.

---

## 📊 Resultado del Smoke Test

**Ejecutado por:** Gemini AI
**Fecha:** 2025-12-23
**Duración:** 8 min

### Resultado Final:

- [ ] **✅ PASSED:** Deployment funcional, continuar con exploratory testing
- [x] **❌ FAILED:** Deployment roto, reportar bug crítico inmediatamente

---

### Notas:

Se han encontrado problemas críticos que impiden la validación completa de la historia.

---

### Si FAILED:

**Blocker 1: El widget 'Recent Messages' no se actualiza en tiempo real**
- **Descripción:** Al recibir un nuevo mensaje de prueba, el widget no muestra el cambio hasta que se refresca la página manualmente.
- **Impacto:** Incumple la nota técnica de Realtime subscription y afecta la experiencia "viva" del dashboard.

**Blocker 2: Falta el enlace al perfil del alumno en la vista de conversación**
- **Descripción:** En la vista de "Quick Reply" (modal), se ve el nombre del mentee pero no es clickeable ni hay un enlace visible para ver su perfil completo.
- **Impacto:** Incumple el Criterio de Aceptación #5 ("I should have a link to view their full profile").

**Próximo paso:**
- Reportar a Development inmediatamente.
- NO continuar con exploratory testing hasta que se corrijan estos issues.

---

## 🔄 Re-testing Session (08/01/2026)

**Status:** ❌ FAILED (Partial Fix)

### Observations:
- **Real-time Sync:** Se observa una mejora parcial. El widget de "Mensajes Recientes" en el dashboard ahora recibe y muestra el mensaje nuevo sin necesidad de refrescar la página.
- **Bug Persistente:** Sin embargo, si el mentor tiene el modal de conversación abierto (Quick Reply), el nuevo mensaje **NO** aparece automáticamente en el historial del chat. El mentor debe cerrar y volver a abrir el modal o refrescar la página para ver la respuesta completa, lo que rompe la fluidez de la comunicación.

### Conclusion:
La corrección no es completa. El sistema de suscripciones parece estar conectado al widget del dashboard pero no a la vista de detalle de la conversación.
