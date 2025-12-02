# Release Notes - Upex My Mentor

> Registro de funcionalidades implementadas y cambios en el sistema.

---

## [Unreleased]

### Features en Staging

#### MYM-6: Mentor Profile (Detailed Profile with Properties)
- **Epic:** EPIC-MYM-2 (User Authentication & Profiles)
- **PR:** [#9](../../pulls/9) MERGED
- **Descripcion:** Permite a los mentores crear y editar su perfil detallado con especialidades, experiencia y tarifas.
- **Cambios principales:**
  - Formulario de edicion de perfil de mentor
  - Validaciones con Zod
  - Integracion con Supabase profiles

---

### Features en Desarrollo

*Las siguientes US tienen implementation plan creado y estan en progreso:*

#### MYM-3: User Sign Up
- **Epic:** EPIC-MYM-2 (User Authentication & Profiles)
- **Branch:** `feat/MYM-3/user-signup`
- **PR:** [#1](../../pulls/1) MERGED
- **Estado:** Implementation plan creado

#### MYM-4: Login/Logout
- **Epic:** EPIC-MYM-2 (User Authentication & Profiles)
- **Branch:** `feat/MYM-4/login-logout`
- **Estado:** Implementation plan creado

#### MYM-7: Password Reset
- **Epic:** EPIC-MYM-2 (User Authentication & Profiles)
- **Branch:** `feat/MYM-7/password-reset`
- **PR:** Pendiente de crear
- **Estado:** ✅ Implementado
- **Descripcion:** Flujo completo de recuperación de contraseña
- **Cambios principales:**
  - Página `/password-reset` para solicitar enlace de recuperación
  - Página `/password-reset/confirm` para establecer nueva contraseña
  - Componentes: ForgotPasswordForm, ResetPasswordForm, TokenErrorState
  - Indicador de fortaleza de contraseña
  - Mensaje de éxito en login después de reset
  - Middleware actualizado para rutas públicas de reset

---

## Historico

### PRs Mergeados

| PR | Story | Descripcion | Fecha |
|----|-------|-------------|-------|
| #9 | MYM-6 | Mentor Profile implementation | 2025-11 |
| #3 | MYM-35 | View Profile Reviews | 2025-11 |
| #1 | MYM-3 | User Sign Up | 2025-11 |

---

*Ultima actualizacion: 2025-12-02*
