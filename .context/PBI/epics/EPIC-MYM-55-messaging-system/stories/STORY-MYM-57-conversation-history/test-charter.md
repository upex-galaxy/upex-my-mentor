# Test Charter: STORY-MYM-57-view-conversation-history

**Fecha:** 2025-12-16
**QA:** Claude AI
**Duración estimada:** 60-90 minutos
**Staging URL:** https://staging-upexmymentor.vercel.app

---

## 🎯 Objetivo de la Sesión

Explorar la funcionalidad de conversaciones en staging environment para validar:
- Acceptance criteria se cumplen completamente (lista de conversaciones + thread detallado)
- Edge cases y negative scenarios son manejados correctamente
- UX es intuitiva y no hay bugs críticos
- Integración con backend funciona sin errores

**Contexto:**
Story MYM-57 implementa el historial de conversaciones para mentores y mentees, permitiendo ver lista de conversaciones con previews y acceder al thread completo con mensajes individuales.

---

## 📋 Áreas a Explorar

### 1. Happy Path - Flujo Principal (15-20 min)

**Qué probar:**
Validar el flujo completo de ver conversaciones desde el estado vacío hasta tener conversaciones activas

**Steps a explorar:**
1. **Estado vacío** - Validar mensaje amigable y CTA a mentors
2. **Navegación** - Validar acceso desde dashboard y navbar
3. **Simular conversación** - Navegar a un mentor, intentar enviar mensaje (si MYM-56 está implementado)
4. **Volver a mensajes** - Verificar que nueva conversación aparece en lista
5. **Ver thread** - Click en conversación para ver mensajes detallados

**Técnica:** Feature Tour
**Tiempo:** 15-20 minutos
**Criterio de éxito:**
- [ ] Flujo completa end-to-end sin errores
- [ ] UI refleja cambios correctamente
- [ ] Data persiste después de refrescar

---

### 2. Edge Cases & Boundary Testing (20-25 min)

**Qué probar:**
Validar que la aplicación maneja correctamente:
- Estados de datos inesperados
- Navegación inconsistente
- Datos corruptos o incompletos

**Scenarios a explorar:**

**Estados de Conversación:**
- [ ] Conversación con usuario eliminado (si hay data de test)
- [ ] Conversación sin mensajes
- [ ] Conversación con mensajes muy largos
- [ ] Conversación con caracteres especiales en mensajes

**Navegación:**
- [ ] Acceso directo a URLs de conversaciones inexistentes
- [ ] Recargar página en medio de una conversación
- [ ] Navegación atrás/adelante entre browser

**Boundary values:**
- [ ] Lista con muchas conversaciones (performance)
- [ ] Mensajes con longitud máxima
- [ ] Timestamps con fechas extremas

**Técnica:** Boundary Testing, Negative Testing
**Tiempo:** 20-25 minutos
**Criterio de éxito:**
- [ ] App no crashea con datos inesperados
- [ ] Error handling es apropiado
- [ ] UX permanece usable

---

### 3. UX & Usabilidad (15-20 min)

**Qué probar:**
Validar que la experiencia de usuario es intuitiva:
- ¿Navegación es clara?
- ¿Mensajes de feedback son útiles?
- ¿Loading states son apropiados?
- ¿Responsive design funciona?

**Scenarios a explorar:**

**Navegación:**
- [ ] Botones/beads son claros y accesibles
- [ ] Links funcionan correctamente
- [ ] Breadcrumbs o navegación secundaria es clara
- [ ] Visual hierarchy guía al usuario

**Feedback visual:**
- [ ] Loading spinners aparecen cuando aplica
- [ ] Success messages son claros
- [ ] Error messages son descriptivos (no solo "Error occurred")
- [ ] Empty states son útiles y motivadores

**Responsive design:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Técnica:** UX Review, User Personas
**Tiempo:** 15-20 minutos
**Criterio de éxito:**
- [ ] UI es intuitiva para usuario nuevo
- [ ] No hay layouts rotos en ningún viewport
- [ ] Mensajes de feedback son útiles

---

### 4. Integración con Backend (15-20 min)

**Qué probar:**
Validar que integración con APIs y DB funciona:
- API calls retornan correctamente
- Data persiste en DB
- Error handling de backend es apropiado

**Scenarios a explorar:**

**API Validation:**
- [ ] GET /api/conversations retorna data correcta
- [ ] GET /api/conversations/:id retorna mensajes
- [ ] POST /api/conversations crea nueva conversación
- [ ] POST /api/messages envía mensaje

**Data Persistence:**
- [ ] Crear conversación via UI → Refrescar → Conversación persiste
- [ ] Enviar mensaje → Refrescar → Mensaje persiste
- [ ] Marcar como leído → Refrescar → Estado persiste

**Error Handling:**
- [ ] Simular API down (DevTools → Offline mode)
- [ ] App muestra mensaje de error apropiado
- [ ] App no crashea con errores de red

**Técnica:** Data Flows, API Testing
**Tiempo:** 15-20 minutos
**Criterio de éxito:**
- [ ] Todas las API calls retornan 200/201
- [ ] Data persiste correctamente
- [ ] Error handling es robusto

---

### 5. Performance & Responsiveness (10-15 min) - Opcional

**Qué probar:**
Validar que performance es aceptable:
- Load times < 3 segundos
- No hay lags o freezes
- APIs responden rápidamente

**Scenarios a explorar:**

**Load Times:**
- [ ] Landing page carga en < 2s
- [ ] Navegación entre páginas < 1s
- [ ] Conversaciones list < 3s

**API Performance:**
- [ ] API calls < 500ms (promedio)
- [ ] Bulk operations < 2s

**Técnica:** Performance Profiling (DevTools → Performance tab)
**Tiempo:** 10-15 minutos
**Criterio de éxito:**
- [ ] Load times son aceptables
- [ ] No hay lags perceptibles

---

## 🔍 Técnicas a Usar Durante la Sesión

- [ ] **Tours:** Recorrer funcionalidad completa de mensajes
- [ ] **Edge Cases:** Estados inesperados, datos límite
- [ ] **Negative Testing:** Intentar romper la funcionalidad
- [ ] **Pairing:** Probar con diferentes user personas (Estudiante vs Mentor)
- [ ] **UX Review:** Validar usabilidad y diseño
- [ ] **Data Flows:** Verificar integración con backend

---

## ✅ Criterios de Éxito General

**Para aprobar la story, debe cumplir:**

### Funcionalidad:
- [ ] AC1: Conversaciones list con metadata funciona end-to-end
- [ ] AC2: Conversation thread view funciona correctamente  
- [ ] AC3: Conversaciones ordenadas por actividad reciente funciona sin errores
- [ ] AC4: Empty state implementado correctamente
- [ ] AC5: Indicador de no leído funciona y desaparece al ver conversación

### Validaciones:
- [ ] Estados inesperados muestran mensajes claros
- [ ] Edge cases son manejados correctamente
- [ ] Error handling es apropiado y descriptivo

### UX:
- [ ] UI es intuitiva para usuario nuevo
- [ ] Navegación es clara y consistente
- [ ] Loading states son apropiados
- [ ] Responsive design funciona (mobile, tablet, desktop)

### Performance:
- [ ] Load times < 3 segundos
- [ ] No hay lags o freezes perceptibles
- [ ] APIs responden en < 500ms (promedio)

### Calidad:
- [ ] **NO** hay bugs críticos (bloquean funcionalidad core)
- [ ] Bugs high son aceptables si hay workaround claro
- [ ] Bugs medium/low no bloquean aprobación

---

## 📝 Datos de Prueba

### Credenciales de Test:

**Estudiante:**
- Email: `student.demo@upexmymentor.com`
- Password: `Demo123!`

**Mentor:**
- Email: `mentor.demo@upexmymentor.com`  
- Password: `Demo123!`

**Guest:**
- Testing sin autenticación (debe redirigir a login)

---

### Seed Data (si aplica):

**Conversaciones de prueba:**
- Necesitamos crear conversaciones via UI si MYM-56 está implementado
- Si no, podemos probar con data mock si existe

**Mentores para crear conversaciones:**
- Navegar a `/mentors` y seleccionar un mentor disponible
- Intentar iniciar conversación para probar el flujo

---

### Test Data para Edge Cases:

**Inputs inválidos a probar (si hay formularios):**
- Email sin @: `testexample.com`
- Password muy corta: `123`
- Special characters: `<script>alert('xss')</script>`
- SQL injection: `'; DROP TABLE users; --`
- Empty fields: ` ` (solo espacios)

**Boundary values:**
- Max length: [255 chars string]
- Min value: 0, -1
- Max value: [según límites de negocio]

---

## 🐛 Reportar Bugs

**Si encuentras bugs durante la sesión:**

1. Documentar en session notes (session-notes.md)
2. Crear bug report estructurado (bug-report.md)
3. Severidad:
   - **Critical:** Bloquea funcionalidad core, no hay workaround
   - **High:** Funcionalidad parcial, workaround difícil
   - **Medium:** Issue de UX, hay workaround fácil
   - **Low:** Mejora cosmética

---

## 📊 Métricas a Capturar

**Durante la sesión, capturar:**
- Tiempo real invertido por área
- Número de bugs encontrados (por severidad)
- % de charter completado
- Decisión final: PASSED / PASSED WITH ISSUES / FAILED

---

## 💡 Tips para la Sesión

1. **Time-box estrictamente:** No invertir más del tiempo asignado por área
2. **Documentar mientras exploras:** No esperar al final
3. **Screenshots de bugs:** Capturar evidencia inmediatamente
4. **Revisar console/network:** Siempre tener DevTools abierto
5. **Si encuentras bug crítico:** STOP, reportar inmediatamente

---

## 🔗 Referencias

**Documentos relacionados:**
- Story: `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-57-conversation-history/story.md`
- Test Cases: `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-57-conversation-history/test-cases.md`
- Smoke Test: `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-57-conversation-history/smoke-test.md`

**Próximos pasos:**
- Ejecutar sesión → Documentar en session-notes.md
- Reportar bugs → bug-report.md

---

**🎯 Charter ready para ejecutar!**