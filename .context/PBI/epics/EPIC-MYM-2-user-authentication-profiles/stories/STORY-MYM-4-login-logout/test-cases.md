# Test Cases: STORY-MYM-4 - User Login and Logout

**Generado:** 2025-11-27
**QA Engineer:** AI-Generated
**Estado:** Borrador – pendiente de revisión de PO/Dev

---

## Resumen de Cobertura

| Tipo | Cantidad |
|------|----------|
| Positivos | 2 |
| Negativos | 4 |
| Edge Cases | 1 |
| **Total** | **7** |

---

## TC-001 – Login exitoso (usuario verificado)

**Tipo:** Positivo | **Prioridad:** Crítico | **Nivel:** UI/API

**Precondiciones:**
- Usuario verificado existe (`mentor.demo@upexmymentor.com` / `Demo123!`)

**Pasos:**
1. Ir a `/login`
2. Ingresar credenciales válidas
3. Click en "Iniciar Sesión"

**Resultado Esperado:**
- API retorna 200
- Cookie HttpOnly+Secure (SameSite=Lax) guardada
- Sesión Supabase disponible
- Redirect a `/dashboard`
- Header muestra email del usuario
- Sin errores en consola

---

## TC-002 – Password inválido

**Tipo:** Negativo | **Prioridad:** Alta | **Nivel:** UI/API

**Precondiciones:**
- Usuario verificado existe

**Pasos:**
1. Ir a `/login`
2. Email correcto + password incorrecta
3. Click en "Iniciar Sesión"

**Resultado Esperado:**
- API retorna 401
- UI muestra mensaje: "Email o contraseña incorrectos. Verifica e intenta de nuevo."
- Sin cookie de sesión creada
- Ruta protegida `/dashboard` sigue redirigiendo a `/login`

---

## TC-003 – Email con formato inválido

**Tipo:** Negativo | **Prioridad:** Media | **Nivel:** UI

**Precondiciones:**
- Ninguna

**Pasos:**
1. Ir a `/login`
2. Ingresar `not-an-email` en campo email
3. Ingresar password válida
4. Click en "Iniciar Sesión"

**Resultado Esperado:**
- Validación cliente bloquea envío
- Muestra mensaje: "Ingresa un email válido"
- Sin llamada a API
- Sin sesión creada

---

## TC-004 – Login con email no verificado (pendiente PO)

**Tipo:** Edge | **Prioridad:** Alta | **Nivel:** UI/API

**Precondiciones:**
- Cuenta existe pero email no verificado

**Pasos:**
1. Ir a `/login`
2. Login con credenciales correctas
3. Click en "Iniciar Sesión"

**Resultado Esperado:**
- Login bloqueado
- Mensaje: "Por favor verifica tu email antes de iniciar sesión."
- Opción para reenviar email de verificación (si disponible)
- Sin cookie de sesión creada

**Nota:** Comportamiento exacto pendiente de confirmación del PO.

---

## TC-005 – Rate limiting tras 5 fallos

**Tipo:** Negativo | **Prioridad:** Alta | **Nivel:** API

**Precondiciones:**
- Cuenta existente

**Pasos:**
1. Realizar 5 logins inválidos rápidos
2. Intentar 6.º login dentro de 15 minutos

**Resultado Esperado:**
- Intentos 1-5: API retorna 401
- Intento 6: Bloqueado (429 o mensaje de bloqueo)
- UI muestra: "Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo."
- Tras cooldown/Retry-After, login válido funciona

**Nota:** Rate limiting es manejado por Supabase built-in.

---

## TC-006 – Acceso a ruta protegida sin sesión

**Tipo:** Negativo | **Prioridad:** Alta | **Nivel:** UI

**Precondiciones:**
- Sin sesión activa (incógnito o después de logout)

**Pasos:**
1. Ir directamente a `/dashboard`

**Resultado Esperado:**
- Redirección automática a `/login?redirectTo=/dashboard`
- Sin flash de contenido protegido
- URL actualiza a `/login`
- Después de login exitoso, redirige a `/dashboard`

---

## TC-007 – Logout limpia sesión

**Tipo:** Positivo | **Prioridad:** Crítica | **Nivel:** UI/API

**Precondiciones:**
- Usuario autenticado en dashboard

**Pasos:**
1. Click en "Logout" (desde navbar)

**Resultado Esperado:**
- `signOut` de Supabase llamado
- Cookies de sesión eliminadas
- Redirige a homepage (`/`)
- Recargar `/dashboard` redirige a `/login`
- `getSession` de Supabase devuelve null

---

## Acción Requerida

| Rol | Acción |
|-----|--------|
| **PO** | Aclarar comportamiento para email no verificado y mensaje de lockout/rate-limit |
| **Dev** | Confirmar contrato de rate-limit (código + headers) y hook de reenvío de verificación |
| **QA** | Actualizar tras respuestas de PO/Dev |

---

## Edge Cases Adicionales Identificados

1. **Expiración de sesión:** Token de 7 días expira → fuerza re-autenticación
2. **Cross-tab behavior:** Logout en una pestaña → invalida sesión en otras pestañas
3. **Network failure:** Error de red después de auth → mensaje de reintento sin duplicar requests

---

*Generado desde comentario de Jira MYM-4 - 2025-11-27*
