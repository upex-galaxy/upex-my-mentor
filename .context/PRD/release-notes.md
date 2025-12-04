# Release Notes - Upex My Mentor

> Registro de funcionalidades implementadas y cambios en el sistema.

---

## [Unreleased]

### Features en Staging

#### MYM-3: User Sign Up
- **Epic:** EPIC-MYM-2 (User Authentication & Profiles)
- **PR:** [#18](../../pulls/18) MERGED
- **Descripcion:** Registro de nuevos usuarios con seleccion de rol (mentor/mentee).
- **Cambios principales:**
  - Formulario de registro con validaciones
  - Seleccion de rol mentor/mentee
  - Integracion con Supabase Auth

#### MYM-4: Login/Logout
- **Epic:** EPIC-MYM-2 (User Authentication & Profiles)
- **PR:** [#19](../../pulls/19) MERGED
- **Descripcion:** Flujo completo de autenticacion con login y logout.
- **Cambios principales:**
  - Pagina `/login` con formulario de autenticacion
  - Logout desde navbar
  - Middleware de proteccion de rutas
  - Redireccion post-login a dashboard

#### MYM-6: Mentor Profile (Detailed Profile with Properties)
- **Epic:** EPIC-MYM-2 (User Authentication & Profiles)
- **PR:** [#9](../../pulls/9) MERGED
- **Descripcion:** Permite a los mentores crear y editar su perfil detallado con especialidades, experiencia y tarifas.
- **Cambios principales:**
  - Formulario de edicion de perfil de mentor
  - Validaciones con Zod
  - Integracion con Supabase profiles

#### MYM-7: Password Reset
- **Epic:** EPIC-MYM-2 (User Authentication & Profiles)
- **PR:** [#20](../../pulls/20) MERGED
- **Descripcion:** Flujo completo de recuperacion de contrasena.
- **Cambios principales:**
  - Pagina `/password-reset` para solicitar enlace de recuperacion
  - Pagina `/password-reset/confirm` para establecer nueva contrasena
  - Componentes: ForgotPasswordForm, ResetPasswordForm, TokenErrorState
  - Indicador de fortaleza de contrasena
  - Mensaje de exito en login despues de reset
  - Middleware actualizado para rutas publicas de reset

---

### Features en Desarrollo

*Las siguientes US tienen implementation plan creado y estan en progreso:*

#### MYM-9: View Pending Applications
- **Epic:** EPIC-MYM-8 (Mentor Vetting & Onboarding)
- **Branch:** `feat/MYM-9/view-pending-applications`
- **Estado:** Implementation plan creado

---

## Historico

### PRs Mergeados

| PR | Story | Descripcion | Fecha |
|----|-------|-------------|-------|
| #20 | MYM-7 | Password Reset Flow | 2025-12 |
| #19 | MYM-4 | User Login and Logout | 2025-12 |
| #18 | MYM-3 | User Sign Up | 2025-12 |
| #9 | MYM-6 | Mentor Profile implementation | 2025-11 |
| #3 | MYM-35 | View Profile Reviews | 2025-11 |

---

*Ultima actualizacion: 2025-12-03*
