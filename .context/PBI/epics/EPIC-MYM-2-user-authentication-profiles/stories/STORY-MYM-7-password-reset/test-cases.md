# Test Cases: STORY-MYM-7 - Password Reset

**Fecha:** 2025-11-10
**QA Engineer:** AI-Generated (Pending Assignment)
**Story Jira Key:** MYM-7
**Epic:** EPIC-MYM-2 - User Authentication & Profiles
**Status:** Draft - Pending PO/Dev Review

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Laura, la Desarrolladora Junior - Esta funcionalidad es crítica para ella cuando olvida su contraseña y necesita acceso urgente para reservar una sesión de mentoría o resolver un problema técnico.
- **Secondary:** Carlos, el Arquitecto Senior - También necesita poder recuperar su cuenta si olvida su contraseña, especialmente importante ya que su perfil contiene información crítica de ingresos.
- **Tertiary:** Sofía, la Career Changer - En transición de carrera, puede tener múltiples plataformas y olvidar contraseñas fácilmente.

**Business Value:**

- **Value Proposition:** Sin recuperación de contraseña, los usuarios pierden acceso permanente a sus cuentas, reduciendo dramáticamente la retención de usuarios.
- **Business Impact:**
  - Reduce abandono de cuentas (sin reset, usuarios simplemente crean nuevas cuentas, duplicando datos)
  - Mantiene KPI de "500 estudiantes registrados" - si pierden acceso, el KPI real es menor
  - Protege revenue: si un mentor pierde acceso, se pierden sesiones futuras y comisiones del 20%

**Related User Journey:**
- Journey: User Authentication Flow
- Step: Account Recovery - Critical recovery path cuando usuarios olvidan credenciales

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
- Components: `ForgotPasswordForm`, `ResetPasswordForm`, Form validation components
- Pages/Routes: `/forgot-password`, `/reset-password?token=xxx`
- State Management: No aplica state management global, formularios locales

**Backend:**
- API Endpoints: Supabase Auth maneja esto directamente (no endpoints custom)
- Services: Supabase Auth - `resetPasswordForEmail()` método, Email service
- Database: Tabla `auth.users` - se actualiza el password_hash

**External Services:**
- Supabase Auth: Genera magic link con token único y temporal
- Email Service: Envía email con enlace de reset
- Supabase Database: Almacena tokens temporales y nuevos password hashes

**Integration Points:**
1. Frontend → Supabase Auth (direct SDK call) - solicita password reset
2. Supabase Auth → Email Service - envía email con magic link
3. Email Service → Usuario - entrega email
4. Usuario → Frontend (via email link) - abre página de reset
5. Frontend → Supabase Auth - actualiza password con nuevo valor

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**
- Business logic complexity: Low-Medium
- Integration complexity: Medium - Depende de 2 servicios externos
- Data validation complexity: Medium - Validación de email, password strength, token validity
- UI complexity: Low - 2 formularios simples

**Estimated Test Effort:** Medium (28 test cases)

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**
- Risk 1: Password policy enforcement inconsistency across signup/reset
  - **Relevance to This Story:** Password reset DEBE usar la misma policy que signup (FR-001)
- Risk 2: Session management after password change
  - **Relevance to This Story:** ¿Se invalidan todas las sesiones activas?

**Integration Points from Epic Analysis:**
- Integration Point 1: Frontend ↔ Supabase Auth API
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** Esta story usa Supabase Auth para todo el flujo de reset

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**
- Question 1: "¿Qué política de contraseñas usamos?"
  - **Status:** ✅ Answered (FR-001: Min 8 chars, 1 uppercase, 1 number, 1 special)
  - **Impact on This Story:** Usar misma validación en reset que en signup

**Questions for Dev:**
- Question 1: "¿Cómo maneja Supabase la expiración de tokens?"
  - **Status:** ⏳ Pending
  - **Impact on This Story:** BLOCKER - necesitamos saber el tiempo de expiración

**Test Strategy from Epic:**
- Test Levels: Unit, Integration, E2E
- Tools: Playwright (E2E), Vitest (Unit)
- **How This Story Aligns:** E2E tests para flujo completo, Unit tests para validación de formularios

**Summary: How This Story Fits in Epic:**
- **Story Role in Epic:** Componente crítico de seguridad - sin esto, usuarios pierden cuentas permanentemente
- **Inherited Risks:** Password policy consistency, session invalidation
- **Unique Considerations:** Email delivery, token expiration, rate limiting contra ataques

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Confirmation message wording**
- **Location in Story:** Scenarios 1 & 3
- **Question for PO/Dev:** ¿Cuál es el EXACT mensaje que debe mostrarse? Ambos scenarios deben mostrar el mismo mensaje genérico para prevent user enumeration.
- **Impact on Testing:** No podemos validar el mensaje exacto en test cases.
- **Suggested Clarification:** "If an account exists with this email, you will receive a password reset link within 5 minutes. Please check your spam folder."

**Ambiguity 2: "Secure password" definition**
- **Location in Story:** Scenario 2
- **Question for PO/Dev:** ¿Qué define una contraseña "secure"? ¿Es la misma policy que FR-001?
- **Impact on Testing:** No podemos escribir test cases para validación de password.
- **Suggested Clarification:** Min 8 chars, 1 uppercase, 1 number, 1 special character

**Ambiguity 3: "Redirected to login page" - logged in or not?**
- **Location in Story:** Scenario 2
- **Question for PO/Dev:** ¿El usuario queda automáticamente logueado o DEBE loguearse manualmente?
- **Impact on Testing:** Afecta el test flow.
- **Suggested Clarification:** User is logged out from all sessions and must log in manually.

**Ambiguity 4: Reset link validity period** ⚠️ **BLOCKER**
- **Location in Story:** NOT mentioned
- **Question for PO/Dev:** ¿Cuánto tiempo es válido el reset link?
- **Impact on Testing:** Cannot test token expiration.
- **Suggested Clarification:** Reset links expire after 1 hour.

**Ambiguity 5: Multiple reset requests behavior**
- **Location in Story:** NOT mentioned
- **Question for PO/Dev:** ¿Los múltiples links son válidos o el último invalida los anteriores?
- **Impact on Testing:** Affects security testing.
- **Suggested Clarification:** Only the most recent link is valid. Previous links are invalidated.

---

### Missing Information / Gaps

**Gap 1: Error scenarios beyond non-existent email**
- **Type:** Acceptance Criteria
- **Why It's Critical:** Story solo cubre 3 scenarios. Faltan:
  - Password no cumple policy
  - Reset link expirado
  - Reset link ya usado
  - Reset link malformado
- **Suggested Addition:** Add Scenarios 4-7
- **Impact if Not Added:** High risk - edge cases críticos de seguridad no especificados

**Gap 2: Rate limiting specifications**
- **Type:** Technical Details
- **Why It's Critical:** Sin rate limiting, atacantes pueden spam emails o brute force tokens.
- **Suggested Addition:** Max 3 reset requests per email per hour. Max 10 per IP per hour.
- **Impact if Not Added:** Security vulnerability

**Gap 3: Email delivery failure handling**
- **Type:** Technical Details + UX
- **Why It's Critical:** ¿Qué pasa si email service falla?
- **Suggested Addition:** Show success message regardless, log error, retry 3 times.
- **Impact if Not Added:** Poor UX

**Gap 4: Session invalidation after password reset**
- **Type:** Security Rule
- **Why It's Critical:** ¿Se invalidan TODAS las sesiones activas?
- **Suggested Addition:** All sessions are invalidated after password reset.
- **Impact if Not Added:** High security risk

**Gap 5: Password confirmation field**
- **Type:** UX + Validation
- **Why It's Critical:** ¿Se requiere "Confirm Password" field?
- **Suggested Addition:** Require password confirmation field.
- **Impact if Not Added:** Low risk - poor UX

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1: User clicks reset link while already logged in**
- **Scenario:** Usuario solicita reset, luego logra loguearse, luego hace click en reset link.
- **Expected Behavior:** NEEDS PO CLARIFICATION
- **Criticality:** Medium
- **Action Required:** Ask PO

**Edge Case 2: Email verification status and password reset** ⚠️ **BLOCKER**
- **Scenario:** Usuario NO verificó email. Luego solicita password reset.
- **Expected Behavior:** NEEDS PO CLARIFICATION
- **Criticality:** High
- **Action Required:** Ask PO

**Edge Case 3: Reset link clicked multiple times**
- **Scenario:** Usuario resetea password exitosamente, luego hace click en mismo link otra vez.
- **Expected Behavior:** Show error "This reset link has already been used."
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 4: Token expiration while user is on Reset Password page**
- **Scenario:** Usuario abre link con 5 min antes de expirar, se distrae, regresa después de expiración.
- **Expected Behavior:** Show error "This reset link has expired."
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 5: Copy-paste password with leading/trailing spaces**
- **Scenario:** Usuario copia password con espacio al final.
- **Expected Behavior:** NEEDS DEV CLARIFICATION - Trim automáticamente o aceptar spaces?
- **Criticality:** Low-Medium
- **Action Required:** Ask Dev

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**
- [x] Acceptance criteria are vague (no password policy specified)
- [x] Expected results are not specific enough (message wording)
- [x] Missing test data examples
- [x] Missing error scenarios (expired token, used token, etc.)
- [x] Missing performance criteria (rate limiting not specified)
- [ ] Cannot be tested in isolation - OK, dependencies clear

**Recommendations to Improve Testability:**
1. Specify exact confirmation message text
2. Reference FR-001 for password policy
3. Add scenarios for expired/used tokens
4. Specify rate limiting rules
5. Clarify session invalidation behavior

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: User requests a password reset link (Happy Path)

**Type:** Positive | **Priority:** Critical

**Given:**
- User is on `/forgot-password` page
- User has registered account with email "laura.garcia@example.com"
- Email is verified (email_verified = true)
- No other reset requests in last 5 minutes

**When:**
- User enters email "laura.garcia@example.com"
- User clicks "Send Reset Link" button
- System calls `supabase.auth.resetPasswordForEmail()`

**Then:**
- System sends email to "laura.garcia@example.com"
- Email contains reset link: `https://upexmymentor.com/reset-password?token=<unique_token>&type=recovery`
- Token valid for 1 hour ⚠️ (NEEDS CONFIRMATION)
- Success message displayed:
  ```
  "Check your email"
  "If an account exists with this email, you will receive a password reset link within 5 minutes. Please check your spam folder if you don't see it."
  ```
- System does NOT reveal whether email exists (prevents user enumeration)
- Email delivered within 2 minutes
- Reset token stored in database with expiration timestamp

---

### Scenario 2: User successfully resets their password (Happy Path)

**Type:** Positive | **Priority:** Critical

**Given:**
- User received reset email with valid token
- Token has NOT expired (< 1 hour old)
- Token has NOT been used yet
- User clicks link in email

**When:**
- User is redirected to `/reset-password?token=abc123&type=recovery`
- Page loads with "Reset Password" form
- User enters new password: "NewSecure123!"
- User enters password confirmation: "NewSecure123!"
- Password meets policy (FR-001): min 8 chars, 1 uppercase, 1 number, 1 special
- User clicks "Reset Password" button

**Then:**
- System validates token is still valid
- System validates password meets policy
- System validates passwords match
- System updates password_hash in `auth.users` table
- System invalidates reset token (marks as used)
- System invalidates ALL active sessions for this user ⚠️ (NEEDS CONFIRMATION)
- User is redirected to `/login`
- Success message displayed: "Your password has been reset successfully. Please log in with your new password."
- User is NOT automatically logged in (must log in manually)

---

### Scenario 3: User enters a non-existent email (Security - Prevent Enumeration)

**Type:** Negative | **Priority:** High

**Given:**
- User is on `/forgot-password` page
- Email "nonexistent@example.com" is NOT registered in system

**When:**
- User enters email "nonexistent@example.com"
- User clicks "Send Reset Link" button

**Then:**
- System shows SAME success message as Scenario 1:
  ```
  "Check your email"
  "If an account exists with this email, you will receive a password reset link within 5 minutes. Please check your spam folder if you don't see it."
  ```
- NO email is sent (email doesn't exist)
- Response time is similar to Scenario 1 (prevents timing attacks)
- No indication to user that email doesn't exist

---

### Scenario 4: Password does not meet security policy (NEW - from FASE 2)

**Type:** Negative | **Priority:** High
**Source:** Identified during critical analysis (FASE 2 - Gap 1)

**Given:**
- User is on `/reset-password` page with valid token
- System enforces password policy (FR-001)

**When:**
- User enters weak password: "abc123"
- User enters confirmation: "abc123"
- User clicks "Reset Password" button

**Then:**
- System shows validation error:
  ```
  "Password does not meet security requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)"
  ```
- Password is NOT updated
- User remains on reset page
- Token remains valid (not consumed)

⚠️ **NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation

---

### Scenario 5: Reset link has expired (NEW - from FASE 2)

**Type:** Negative | **Priority:** High
**Source:** Identified during critical analysis (FASE 2 - Gap 1)

**Given:**
- User received reset email 2 hours ago
- Token expiration is 1 hour ⚠️ (NEEDS CONFIRMATION)
- Token has expired

**When:**
- User clicks link in old email
- User is redirected to `/reset-password?token=expired_token`

**Then:**
- System validates token and finds it expired
- Error page displayed with message:
  ```
  "This password reset link has expired"
  "Password reset links are valid for 1 hour. Please request a new reset link."
  ```
- "Request New Link" button redirects to `/forgot-password`
- No password reset form is shown

⚠️ **NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation of expiration time

---

### Scenario 6: Reset link has already been used (NEW - from FASE 2)

**Type:** Negative | **Priority:** Medium
**Source:** Identified during critical analysis (FASE 2 - Edge Case 3)

**Given:**
- User successfully reset password using token "abc123"
- Token marked as "used" in database
- User tries to use same link again

**When:**
- User clicks same reset link again
- User is redirected to `/reset-password?token=abc123`

**Then:**
- System validates token and finds it already used
- Error page displayed with message:
  ```
  "This password reset link has already been used"
  "If you need to reset your password again, please request a new reset link."
  ```
- "Request New Link" button redirects to `/forgot-password`
- No password reset form is shown

⚠️ **NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation

---

### Scenario 7: Reset link is malformed or invalid (NEW - from FASE 2)

**Type:** Negative | **Priority:** Medium
**Source:** Identified during critical analysis (FASE 2 - Gap 1)

**Given:**
- User receives link with invalid/tampered token
- Token does not exist in database OR is malformed

**When:**
- User clicks link `/reset-password?token=invalid_or_tampered`

**Then:**
- System validates token and finds it invalid
- Error page displayed with message:
  ```
  "This password reset link is invalid"
  "Please request a new password reset link."
  ```
- "Request New Link" button redirects to `/forgot-password`
- No password reset form is shown

⚠️ **NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation

---

### Scenario 8: Passwords don't match in confirmation (NEW - from FASE 2)

**Type:** Negative | **Priority:** Medium
**Source:** Identified during critical analysis (FASE 2 - Gap 5)

**Given:**
- User is on `/reset-password` page with valid token
- Password confirmation field is required ⚠️ (NEEDS CONFIRMATION)

**When:**
- User enters password: "NewSecure123!"
- User enters confirmation: "NewSecure456!" (different)
- User clicks "Reset Password" button

**Then:**
- System validates passwords match
- Error message displayed: "Passwords do not match. Please try again."
- Password is NOT updated
- User remains on reset page
- Token remains valid (not consumed)
- Both password fields are cleared for security

⚠️ **NOTE:** This scenario assumes password confirmation is required - NEEDS PO confirmation

---

### Scenario 9: Rate limiting - Too many reset requests (NEW - from FASE 2)

**Type:** Negative | **Priority:** High (Security)
**Source:** Identified during critical analysis (FASE 2 - Gap 2)

**Given:**
- User has requested password reset 3 times in last hour for "user@example.com"
- System rate limit is 3 requests per email per hour ⚠️ (NEEDS CONFIRMATION)

**When:**
- User attempts 4th reset request within same hour
- User clicks "Send Reset Link" button

**Then:**
- System blocks request
- Error message displayed:
  ```
  "Too many password reset requests"
  "For security reasons, please wait 1 hour before requesting another password reset link."
  ```
- NO email is sent
- User remains on `/forgot-password` page

⚠️ **NOTE:** This scenario was NOT in original story - NEEDS PO/Dev confirmation of rate limits

---

### Scenario 10: Multiple reset links - Only latest is valid (NEW - from FASE 2)

**Type:** Boundary | **Priority:** Medium
**Source:** Identified during critical analysis (FASE 2 - Ambiguity 5)

**Given:**
- User requests reset at 10:00 AM → Token A generated
- User requests reset again at 10:05 AM → Token B generated
- User has both emails

**When:**
- User clicks Token A link (older)
- User is redirected to `/reset-password?token=A`

**Then:**
- System validates Token A and finds it invalidated by newer request
- Error page displayed:
  ```
  "This password reset link has been superseded"
  "A newer password reset link was requested. Please use the most recent link from your email."
  ```
- "Request New Link" button redirects to `/forgot-password`

⚠️ **NOTE:** This scenario assumes only latest token valid - NEEDS PO/Dev confirmation

---

## 🧪 FASE 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 28

**Breakdown:**
- Positive: 8 test cases
- Negative: 12 test cases
- Boundary: 5 test cases
- Integration: 3 test cases

**Rationale for This Number:**
Esta story tiene complejidad MEDIUM debido a:
- Flujo de 2 páginas (forgot + reset)
- Integración con 3 servicios externos (Supabase Auth, Email, Database)
- 10 scenarios refinados (original 3 + 7 nuevos identificados)
- Múltiples edge cases de seguridad (expiration, rate limiting, enumeration)
- Validaciones complejas (password policy, token validity, session invalidation)

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1: Invalid Email Formats**
- **Base Scenario:** User enters invalid email on Forgot Password page
- **Parameters to Vary:** Email format variations
- **Test Data Sets:**

| Email Input | Expected UI Validation | Expected Backend Call |
|-------------|----------------------|----------------------|
| "" (empty) | "Email is required" | No API call |
| "notanemail" | "Invalid email format" | No API call |
| "user@" | "Invalid email format" | No API call |
| "@example.com" | "Invalid email format" | No API call |
| "user @example.com" | "Invalid email format" | No API call |
| "user@example" | "Invalid email format" | No API call |

**Total Tests from Parametrization:** 6
**Benefit:** Reduce duplicación - todas usan mismo test base con diferentes inputs

---

**Parametrized Test Group 2: Invalid Password Formats**
- **Base Scenario:** User enters invalid password on Reset Password page
- **Parameters to Vary:** Password variations that don't meet policy
- **Test Data Sets:**

| Password Input | Missing Requirement | Expected Error |
|----------------|-------------------|----------------|
| "abc" | Too short (< 8 chars) | "Minimum 8 characters" |
| "abcdefgh" | No uppercase, number, special | "At least 1 uppercase letter, 1 number, 1 special character" |
| "Abcdefgh" | No number, special | "At least 1 number, 1 special character" |
| "Abcdefg1" | No special char | "At least 1 special character" |
| "abcdefg1!" | No uppercase | "At least 1 uppercase letter" |

**Total Tests from Parametrization:** 5
**Benefit:** Comprehensive password policy validation coverage

---

**Parametrized Test Group 3: Token States**
- **Base Scenario:** User attempts to use reset link with various token states
- **Parameters to Vary:** Token validity states
- **Test Data Sets:**

| Token State | Expected Behavior | Expected Message |
|-------------|------------------|------------------|
| Valid, not used | Show reset form | - |
| Expired (> 1 hour) | Show error page | "This password reset link has expired" |
| Already used | Show error page | "This password reset link has already been used" |
| Invalid/malformed | Show error page | "This password reset link is invalid" |
| Superseded by newer | Show error page | "This password reset link has been superseded" |

**Total Tests from Parametrization:** 5
**Benefit:** Systematic coverage of all token states

---

### Test Cases

#### **TC-001: Request password reset with valid registered email**

**Related Scenario:** Scenario 1 (Refined AC above)
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**
- User "laura.garcia@example.com" exists in `auth.users`
- Email is verified (`email_verified = true`)
- No reset requests in last 5 minutes for this email
- Email service is operational

**Test Steps:**
1. Navigate to `/forgot-password`
   - **Verify:** Page loads with email input field and "Send Reset Link" button
2. Enter email: "laura.garcia@example.com"
   - **Data:** Email field value = "laura.garcia@example.com"
3. Click "Send Reset Link" button
   - **Verify:** Loading state shown during API call
4. Wait for response

**Expected Result:**
- **UI:**
  - Success message displayed (see Scenario 1 for exact text)
  - Email input field disabled or cleared
  - "Send Reset Link" button disabled to prevent double-click
- **Backend:**
  - API call to `supabase.auth.resetPasswordForEmail("laura.garcia@example.com")` succeeds
  - Response: `{ success: true }`
- **Email:**
  - Email sent to "laura.garcia@example.com" within 2 minutes
  - Email subject: "Reset Your Password - Upex My Mentor"
  - Email body contains reset link with format: `https://upexmymentor.com/reset-password?token=<unique_token>&type=recovery`
  - Token is unique (UUID format)
- **Database:**
  - Reset token stored in database
  - Token expiration set to current_time + 1 hour
  - Token status = 'unused'

**Test Data:**
```json
{
  "input": {
    "email": "laura.garcia@example.com"
  },
  "expected_email": {
    "to": "laura.garcia@example.com",
    "subject": "Reset Your Password - Upex My Mentor",
    "contains_link": true
  }
}
```

**Post-conditions:**
- Reset token exists in database for this user
- Email delivered to user's inbox
- No cleanup needed (token expires automatically)

---

#### **TC-002: Request password reset with non-existent email (prevents enumeration)**

**Related Scenario:** Scenario 3
**Type:** Negative (Security)
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**
- Email "nonexistent@example.com" does NOT exist in `auth.users`

**Test Steps:**
1. Navigate to `/forgot-password`
2. Enter email: "nonexistent@example.com"
3. Click "Send Reset Link" button
4. Wait for response

**Expected Result:**
- **UI:**
  - SAME success message as TC-001 (prevents user enumeration)
  - Response time within ±500ms of TC-001 (prevents timing attacks)
  - No visual difference from valid email scenario
- **Backend:**
  - API call returns success (does NOT reveal email doesn't exist)
  - NO email is sent
- **Database:**
  - NO token created
- **System State:**
  - No indication anywhere that email doesn't exist

**Test Data:**
```json
{
  "input": {
    "email": "nonexistent@example.com"
  },
  "expected_email_sent": false
}
```

**Post-conditions:**
- No emails sent
- No database changes

---

#### **TC-003: Successfully reset password with valid token**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**
- User "laura.garcia@example.com" exists
- Valid reset token exists: "abc123xyz" (< 1 hour old, unused)
- User has active session on device A
- User is on device B (different browser)

**Test Steps:**
1. Navigate to `/reset-password?token=abc123xyz&type=recovery`
   - **Verify:** Page loads with reset form (password + confirm fields)
2. Enter new password: "NewSecure123!"
   - **Data:** Password field = "NewSecure123!"
3. Enter password confirmation: "NewSecure123!"
   - **Data:** Confirm password field = "NewSecure123!"
4. Click "Reset Password" button
   - **Verify:** Loading state shown
5. Wait for response

**Expected Result:**
- **UI:**
  - Success message: "Your password has been reset successfully. Please log in with your new password."
  - Redirect to `/login` after 2 seconds
  - User is NOT automatically logged in
- **Backend:**
  - Token validated successfully
  - Password validated against policy (FR-001)
  - Passwords match validation passes
  - Password hash updated in `auth.users` table
- **Database:**
  - `auth.users.password_hash` updated for user
  - Reset token marked as 'used'
  - Token `used_at` timestamp set to current time
  - ALL active sessions invalidated ⚠️ (NEEDS CONFIRMATION)
- **Session Management:**
  - User on device A is logged out automatically
  - User must log in with new password on both devices

**Test Data:**
```json
{
  "input": {
    "token": "abc123xyz",
    "new_password": "NewSecure123!",
    "confirm_password": "NewSecure123!"
  },
  "user": {
    "email": "laura.garcia@example.com"
  }
}
```

**Post-conditions:**
- User can log in with new password
- User CANNOT log in with old password
- Reset token cannot be reused

---

#### **TC-004: Invalid email format - parametrized test**

**Related Scenario:** Form validation (not in original scenarios)
**Type:** Negative
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**
- User is on `/forgot-password` page

**Test Steps:**
1. Enter invalid email from test data set (see Parametrized Group 1)
2. Click "Send Reset Link" button OR tab out of field (triggers validation)

**Expected Result:**
- **UI:**
  - Validation error message displayed below email field
  - Error message matches expected from test data table
  - "Send Reset Link" button remains disabled OR shows validation error on click
  - NO API call made to backend (validation happens client-side first)
- **Backend:**
  - NO API call if client validation blocks it

**Test Data:** See Parametrized Test Group 1 table

**Post-conditions:**
- No emails sent
- No database changes

---

#### **TC-005: Password does not meet security policy - parametrized test**

**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** High
**Test Level:** UI + Integration
**Parametrized:** ✅ Yes (Group 2)

**Preconditions:**
- User is on `/reset-password` page with valid token
- Password policy (FR-001): min 8 chars, 1 uppercase, 1 number, 1 special

**Test Steps:**
1. Enter invalid password from test data set (see Parametrized Group 2)
2. Enter same password in confirmation field
3. Click "Reset Password" button

**Expected Result:**
- **UI:**
  - Validation error message displayed
  - Error message explains what's missing (see test data table)
  - Password fields remain populated (for user to fix)
  - "Reset Password" button can be clicked again after fixing
- **Backend:**
  - API call may be made, but backend also validates
  - Response: `{ success: false, error: "Password does not meet policy" }`
- **Database:**
  - NO password update
  - Token remains valid (not consumed)

**Test Data:** See Parametrized Test Group 2 table

**Post-conditions:**
- Password NOT updated
- Token still valid for retry

---

#### **TC-006: Reset link expired - parametrized test**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 3 - Expired state)

**Preconditions:**
- Reset token "expired_token_123" was created 2 hours ago
- Token expiration policy: 1 hour ⚠️ (NEEDS CONFIRMATION)
- Token status = 'unused' but creation_time + 1 hour < current_time

**Test Steps:**
1. Navigate to `/reset-password?token=expired_token_123&type=recovery`
2. Wait for page load

**Expected Result:**
- **UI:**
  - Error page displayed (NO reset form)
  - Error message: "This password reset link has expired"
  - Additional info: "Password reset links are valid for 1 hour. Please request a new reset link."
  - "Request New Link" button → redirects to `/forgot-password`
- **Backend:**
  - Token validation fails (expired)
- **Database:**
  - NO changes

**Test Data:**
```json
{
  "input": {
    "token": "expired_token_123",
    "created_at": "2025-11-10T10:00:00Z",
    "current_time": "2025-11-10T12:01:00Z"
  }
}
```

**Post-conditions:**
- User redirected to request new link

---

#### **TC-007: Reset link already used - parametrized test**

**Related Scenario:** Scenario 6
**Type:** Negative
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 3 - Used state)

**Preconditions:**
- Reset token "used_token_456" was used 10 minutes ago
- Token status = 'used'
- Token used_at = 10 minutes ago

**Test Steps:**
1. Navigate to `/reset-password?token=used_token_456&type=recovery`
2. Wait for page load

**Expected Result:**
- **UI:**
  - Error page displayed (NO reset form)
  - Error message: "This password reset link has already been used"
  - Additional info: "If you need to reset your password again, please request a new reset link."
  - "Request New Link" button → redirects to `/forgot-password`
- **Backend:**
  - Token validation fails (already used)
- **Database:**
  - NO changes

**Test Data:**
```json
{
  "input": {
    "token": "used_token_456",
    "status": "used",
    "used_at": "2025-11-10T11:50:00Z"
  }
}
```

**Post-conditions:**
- User redirected to request new link

---

#### **TC-008: Reset link is malformed or invalid**

**Related Scenario:** Scenario 7
**Type:** Negative
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 3 - Invalid state)

**Preconditions:**
- Token "invalid_or_tampered" does NOT exist in database

**Test Steps:**
1. Navigate to `/reset-password?token=invalid_or_tampered&type=recovery`
2. Wait for page load

**Expected Result:**
- **UI:**
  - Error page displayed (NO reset form)
  - Error message: "This password reset link is invalid"
  - Additional info: "Please request a new password reset link."
  - "Request New Link" button → redirects to `/forgot-password`
- **Backend:**
  - Token validation fails (not found in database)
- **Database:**
  - NO changes

**Test Data:**
```json
{
  "input": {
    "token": "invalid_or_tampered"
  }
}
```

**Post-conditions:**
- User redirected to request new link

---

#### **TC-009: Passwords don't match in confirmation field**

**Related Scenario:** Scenario 8
**Type:** Negative
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**
- User is on `/reset-password` page with valid token
- Password confirmation field exists ⚠️ (NEEDS CONFIRMATION)

**Test Steps:**
1. Enter password: "NewSecure123!"
2. Enter confirmation: "DifferentPass456!"
3. Click "Reset Password" button

**Expected Result:**
- **UI:**
  - Validation error: "Passwords do not match. Please try again."
  - Both password fields cleared (security best practice)
  - Focus returns to password field
- **Backend:**
  - Validation may happen client-side first (no API call)
  - If API call made, backend also validates and rejects
- **Database:**
  - NO password update
  - Token remains valid

**Test Data:**
```json
{
  "input": {
    "password": "NewSecure123!",
    "confirm_password": "DifferentPass456!"
  }
}
```

**Post-conditions:**
- Token still valid for retry

---

#### **TC-010: Rate limiting - Too many reset requests from same email**

**Related Scenario:** Scenario 9
**Type:** Negative (Security)
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**
- User "user@example.com" has requested resets at:
  - 10:00 AM
  - 10:15 AM
  - 10:30 AM
- Rate limit: 3 requests per email per hour ⚠️ (NEEDS CONFIRMATION)
- Current time: 10:45 AM (within same hour)

**Test Steps:**
1. Navigate to `/forgot-password`
2. Enter email: "user@example.com"
3. Click "Send Reset Link" button (4th request)

**Expected Result:**
- **UI:**
  - Error message: "Too many password reset requests"
  - Additional info: "For security reasons, please wait 1 hour before requesting another password reset link."
  - Countdown timer showing time until next allowed request (optional)
- **Backend:**
  - API call returns error: `{ success: false, error: "RATE_LIMIT_EXCEEDED" }`
  - NO email sent
- **Database:**
  - NO new token created
  - Rate limit log entry created (for audit)

**Test Data:**
```json
{
  "input": {
    "email": "user@example.com"
  },
  "previous_requests": [
    "2025-11-10T10:00:00Z",
    "2025-11-10T10:15:00Z",
    "2025-11-10T10:30:00Z"
  ],
  "current_time": "2025-11-10T10:45:00Z"
}
```

**Post-conditions:**
- User must wait until 11:00 AM to request again

---

#### **TC-011: Multiple reset links - Only latest is valid**

**Related Scenario:** Scenario 10
**Type:** Boundary
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**
- User requested reset at 10:00 AM → Token A created
- User requested reset at 10:05 AM → Token B created
- Both tokens are < 1 hour old
- System invalidates previous tokens when new one requested ⚠️ (NEEDS CONFIRMATION)

**Test Steps:**
1. User tries to use Token A (older one)
2. Navigate to `/reset-password?token=A&type=recovery`

**Expected Result:**
- **UI:**
  - Error page: "This password reset link has been superseded"
  - Additional info: "A newer password reset link was requested. Please use the most recent link from your email."
  - "Request New Link" button → `/forgot-password`
- **Backend:**
  - Token validation checks if superseded by newer token
  - Validation fails
- **Database:**
  - Token A status = 'superseded'
  - Token B status = 'unused'

**Test Data:**
```json
{
  "tokens": [
    { "token": "A", "created_at": "2025-11-10T10:00:00Z", "status": "superseded" },
    { "token": "B", "created_at": "2025-11-10T10:05:00Z", "status": "unused" }
  ]
}
```

**Post-conditions:**
- User must use Token B

---

#### **TC-012: Token expiration while user is filling form (Edge Case)**

**Related Scenario:** Edge Case 4 from FASE 2
**Type:** Boundary
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**
- User opens reset link at 10:55 AM (5 min before expiration)
- Token expires at 11:00 AM (1 hour validity)
- User spends time reading instructions

**Test Steps:**
1. Navigate to `/reset-password?token=expiring_token` at 10:55 AM
   - **Verify:** Form loads successfully (token still valid)
2. User fills out form slowly
3. User clicks "Reset Password" button at 11:02 AM (after expiration)

**Expected Result:**
- **UI:**
  - Error message: "This password reset link has expired while you were resetting your password."
  - Additional info: "Please request a new reset link."
  - Redirect to `/forgot-password` automatically or via button
- **Backend:**
  - Token validation at submission time finds token expired
  - Password NOT updated
- **Database:**
  - NO password change
  - Token remains expired

**Test Data:**
```json
{
  "input": {
    "token": "expiring_token",
    "created_at": "2025-11-10T10:00:00Z",
    "form_loaded_at": "2025-11-10T10:55:00Z",
    "form_submitted_at": "2025-11-10T11:02:00Z"
  }
}
```

**Post-conditions:**
- User must request new link

---

#### **TC-013: User clicks reset link while already logged in (Edge Case)**

**Related Scenario:** Edge Case 1 from FASE 2
**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**
- User requested password reset
- User then remembered password and logged in
- User is currently logged in with active session
- User clicks reset link from email

**Test Steps:**
1. User is logged in on device
2. User clicks reset link from email
3. Navigate to `/reset-password?token=valid_token`

**Expected Result:**
⚠️ **NEEDS PO CLARIFICATION** - Two possible behaviors:

**Option A (Recommended):**
- User is logged out automatically
- Reset form is shown
- User can proceed with password reset

**Option B:**
- Message: "You are already logged in. Log out first to reset password."
- "Log Out" button provided

**For Testing:** Will test Option A (more secure) pending confirmation

**Test Data:**
```json
{
  "input": {
    "token": "valid_token",
    "user_logged_in": true
  }
}
```

**Post-conditions:**
- TBD based on PO decision

---

#### **TC-014: Email delivery failure handling**

**Related Scenario:** Gap 3 from FASE 2
**Type:** Negative (Integration)
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**
- Email service is DOWN or failing
- User "user@example.com" exists

**Test Steps:**
1. Mock email service to return error
2. Navigate to `/forgot-password`
3. Enter email: "user@example.com"
4. Click "Send Reset Link" button

**Expected Result:**
⚠️ **NEEDS DEV CLARIFICATION** - Expected behavior:

**Recommended Approach:**
- **UI:** SAME success message (don't reveal failure to prevent enumeration)
- **Backend:**
  - Log error
  - Retry email sending 3 times with exponential backoff
  - If all retries fail, log critical error
- **Monitoring:** Alert sent to ops team

**For Testing:** System shows success message regardless

**Test Data:**
```json
{
  "input": {
    "email": "user@example.com"
  },
  "email_service_status": "down"
}
```

**Post-conditions:**
- Error logged for ops
- User sees success (doesn't know failure)

---

#### **TC-015: Session invalidation verification after password reset**

**Related Scenario:** Gap 4 from FASE 2
**Type:** Positive (Security)
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**
- User has 3 active sessions:
  - Device A: Laptop (Chrome)
  - Device B: Phone (Safari)
  - Device C: Tablet (Firefox)
- User resets password on Device D

**Test Steps:**
1. Verify all 3 sessions are active (can access protected routes)
2. User resets password on Device D
3. Attempt to access protected route on Devices A, B, C

**Expected Result:**
- **All 3 sessions invalidated:**
  - Device A: Redirected to `/login` with message "Your session has expired. Please log in again."
  - Device B: Same behavior
  - Device C: Same behavior
- **Database:**
  - All session tokens for this user marked as invalid
  - `session.invalidated_at` timestamp set
- **Security:**
  - User must re-authenticate on ALL devices with new password

⚠️ **NEEDS CONFIRMATION:** Session invalidation behavior

**Test Data:**
```json
{
  "user_sessions": [
    { "device": "Laptop", "session_id": "session_A" },
    { "device": "Phone", "session_id": "session_B" },
    { "device": "Tablet", "session_id": "session_C" }
  ]
}
```

**Post-conditions:**
- All old sessions invalid
- User must log in on all devices

---

#### **TC-016: Copy-paste password with leading/trailing spaces**

**Related Scenario:** Edge Case 5 from FASE 2
**Type:** Boundary
**Priority:** Low-Medium
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**
- User is on `/reset-password` page with valid token

**Test Steps:**
1. User copies password from password manager: " NewSecure123! " (with spaces)
2. Paste into password field
3. Paste same into confirmation field (with spaces)
4. Click "Reset Password" button

**Expected Result:**
⚠️ **NEEDS DEV CLARIFICATION** - Two possible behaviors:

**Option A (Recommended):**
- System automatically trims leading/trailing spaces
- Password accepted: "NewSecure123!" (trimmed)
- Password updated successfully

**Option B:**
- System accepts spaces as part of password
- Password stored with spaces: " NewSecure123! "
- User must enter with spaces when logging in (bad UX)

**For Testing:** Will test Option A (trim spaces) pending confirmation

**Test Data:**
```json
{
  "input": {
    "password_with_spaces": " NewSecure123! ",
    "expected_stored": "NewSecure123!"
  }
}
```

**Post-conditions:**
- Password behavior confirmed

---

## 🔗 Integration Test Cases

### Integration Test 1: Frontend → Supabase Auth API (Request Reset)

**Integration Point:** Frontend → Supabase Auth API
**Type:** Integration
**Priority:** High

**Preconditions:**
- Frontend running on localhost:3000
- Supabase Auth API accessible
- Valid user exists in database

**Test Flow:**
1. Frontend sends request to Supabase Auth:
   ```typescript
   supabase.auth.resetPasswordForEmail('user@example.com', {
     redirectTo: 'https://upexmymentor.com/reset-password'
   })
   ```
2. Supabase Auth processes request
3. Supabase Auth returns response
4. Frontend receives response

**Contract Validation:**
- ✅ Request format matches Supabase SDK spec
- ✅ Response format matches Supabase SDK spec
- ✅ Status codes: 200 OK or 400 Bad Request

**Expected Result:**
- Integration successful
- Data flows: Frontend → Supabase Auth → Email Service
- No errors in console
- Proper error handling if API fails

---

### Integration Test 2: Supabase Auth → Email Service

**Integration Point:** Supabase Auth → Email Service
**Type:** Integration
**Priority:** High

**Preconditions:**
- Supabase Auth configured with email templates
- Email service (e.g., SendGrid) configured

**Test Flow:**
1. Supabase Auth receives reset request
2. Supabase generates unique token
3. Supabase calls Email Service API
4. Email Service sends email to user

**Mock Strategy:**
- Email service will be MOCKED for automated tests
- Real integration tested manually in staging environment
- Mock tool: MSW (Mock Service Worker)

**Expected Result:**
- Email delivered to inbox within 2 minutes
- Email contains correct reset link
- Email template rendered correctly

---

### Integration Test 3: Frontend → Supabase Auth (Update Password)

**Integration Point:** Frontend → Supabase Auth API
**Type:** Integration
**Priority:** High

**Preconditions:**
- User has valid reset token
- Frontend on reset password page

**Test Flow:**
1. Frontend submits new password to Supabase Auth:
   ```typescript
   supabase.auth.updateUser({
     password: 'NewSecure123!'
   })
   ```
2. Supabase validates token
3. Supabase updates password hash
4. Supabase invalidates token
5. Supabase returns success response

**Expected Result:**
- Password updated in `auth.users` table
- Token marked as used
- User can log in with new password
- User CANNOT log in with old password

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
|-----------|---------------------------|---------------------|-----------|----------|
| Password doesn't meet policy | ❌ No | ✅ Yes (Scenario 4) | TC-005 | High |
| Reset link expired | ❌ No | ✅ Yes (Scenario 5) | TC-006 | High |
| Reset link already used | ❌ No | ✅ Yes (Scenario 6) | TC-007 | Medium |
| Reset link malformed | ❌ No | ✅ Yes (Scenario 7) | TC-008 | Medium |
| Passwords don't match | ❌ No | ✅ Yes (Scenario 8) | TC-009 | Medium |
| Rate limiting exceeded | ❌ No | ✅ Yes (Scenario 9) | TC-010 | High |
| Multiple reset links | ❌ No | ✅ Yes (Scenario 10) | TC-011 | Medium |
| Token expires during form fill | ❌ No | ✅ Yes (Edge Case) | TC-012 | Medium |
| User logged in clicks reset link | ❌ No | ⚠️ Needs PO confirmation | TC-013 | Medium |
| Email delivery failure | ❌ No | ⚠️ Needs Dev confirmation | TC-014 | Medium |
| Session invalidation | ❌ No | ⚠️ Needs confirmation | TC-015 | High |
| Password with spaces | ❌ No | ⚠️ Needs Dev confirmation | TC-016 | Low-Med |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
|-----------|-------|---------|----------|
| Valid emails | 3 | Positive tests | laura.garcia@example.com, carlos@example.com |
| Invalid email formats | 6 | Negative tests | "notanemail", "user@", "@example.com" |
| Valid passwords | 2 | Positive tests | "NewSecure123!", "ValidPass1!" |
| Invalid passwords | 5 | Negative tests | "abc", "abcdefgh", "Abcdefg1" |
| Token states | 5 | Boundary tests | valid, expired, used, invalid, superseded |
| Rate limit scenarios | 1 | Security tests | 3 requests in 1 hour |

### Data Generation Strategy

**Static Test Data:**
- Email formats for validation testing
- Password policy violation examples
- Error messages (must match exactly)
- Token expiration times (1 hour)

**Dynamic Test Data (using Faker.js):**
- User emails: `faker.internet.email()`
- Timestamps: `faker.date.recent()`
- Unique tokens: `faker.string.uuid()`

**Test Data Cleanup:**
- ✅ All test tokens cleaned up after test execution (auto-expire)
- ✅ No test emails sent to real addresses (use test email service or mocks)
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order

---

## 📝 Critical Questions for PO

⚠️ **These questions MUST be answered before implementation:**

**Question 1: Exact confirmation message wording**
- **Context:** Scenarios 1 & 3 show generic message to prevent user enumeration
- **Question:** ¿Cuál es el EXACT mensaje a mostrar? Propongo: "If an account exists with this email, you will receive a password reset link within 5 minutes. Please check your spam folder."
- **Impact if not answered:** Cannot validate exact message in tests, UX inconsistency
- **Suggested Answer:** Approve proposed message or provide alternative

**Question 2: Reset link validity period** ⚠️ **BLOCKER**
- **Context:** Not specified in original story
- **Question:** ¿Cuánto tiempo es válido el reset link antes de expirar?
- **Impact if not answered:** Cannot test expiration, security risk if too long
- **Suggested Answer:** 1 hour (industry standard)

**Question 3: Multiple reset requests behavior**
- **Context:** User requests reset multiple times
- **Question:** ¿Los múltiples links son válidos simultáneamente o solo el último?
- **Impact if not answered:** Security vulnerability if all links valid
- **Suggested Answer:** Only most recent link is valid, previous ones invalidated

**Question 4: User logged in clicks reset link**
- **Context:** Edge Case 1 - user already logged in
- **Question:** ¿Qué pasa si usuario logged in hace click en reset link?
- **Impact if not answered:** Confusing UX
- **Suggested Answer:** Log out user automatically, show reset form

**Question 5: Email not verified - can reset password?** ⚠️ **BLOCKER**
- **Context:** Edge Case 2 - security concern
- **Question:** ¿Usuario con email NO verificado puede resetear password?
- **Impact if not answered:** Security vulnerability
- **Suggested Answer:** Only verified emails can reset password

**Question 6: Session invalidation after reset**
- **Context:** Gap 4 - security critical
- **Question:** ¿Se invalidan TODAS las sesiones activas después de reset?
- **Impact if not answered:** Security vulnerability (attacker sessions remain active)
- **Suggested Answer:** Yes, invalidate all sessions

**Question 7: Password confirmation field**
- **Context:** Gap 5 - UX consideration
- **Question:** ¿Se requiere campo "Confirm Password" en reset form?
- **Impact if not answered:** Implementation uncertainty
- **Suggested Answer:** Yes, require confirmation (standard practice)

---

## 🔧 Technical Questions for Dev

⚠️ **These questions affect testing approach:**

**Question 1: Supabase token expiration configuration**
- **Context:** Ambiguity 4 - token validity
- **Question:** ¿Cuál es el token expiration configurado en Supabase? ¿Es configurable?
- **Impact on Testing:** Need to know actual expiration to test properly
- **Suggested Answer:** Confirm default (likely 1 hour) or custom config

**Question 2: Rate limiting implementation**
- **Context:** Gap 2 - security
- **Question:** ¿Rate limiting está en frontend, backend, o Supabase? ¿Límites configurados?
- **Impact on Testing:** Need to know where to mock/test rate limiting
- **Suggested Answer:** Backend rate limiting, 3 per email per hour, 10 per IP per hour

**Question 3: Password trimming behavior**
- **Context:** Edge Case 5 - spaces in password
- **Question:** ¿Sistema hace trim automático de leading/trailing spaces en passwords?
- **Impact on Testing:** Affects password validation tests
- **Suggested Answer:** Trim spaces on submit (better UX)

**Question 4: Email delivery retries**
- **Context:** Gap 3 - email service failure
- **Question:** ¿Cuántos retries si email service falla? ¿Exponential backoff?
- **Impact on Testing:** Need to know retry behavior for integration tests
- **Suggested Answer:** 3 retries with exponential backoff

**Question 5: Session invalidation mechanism**
- **Context:** Gap 4 - sessions
- **Question:** ¿Cómo se invalidan sesiones? ¿Supabase lo hace automáticamente?
- **Impact on Testing:** Need to verify session invalidation
- **Suggested Answer:** Supabase invalidates all sessions on password change (verify)

---

## 💡 Suggested Story Improvements

**Improvement 1: Add password policy reference**
- **Current State:** Scenario 2 says "secure password" (vague)
- **Suggested Change:** "Password meets policy (FR-001): min 8 chars, 1 uppercase, 1 number, 1 special character"
- **Benefit:**
  - Clarity: Developers know exact validation rules
  - Testability: QA can write specific test cases
  - Quality: Consistent password policy across signup/reset

**Improvement 2: Add token expiration specification**
- **Current State:** No mention of token expiration
- **Suggested Change:** Add to Scenario 1: "Token expires after 1 hour"
- **Benefit:**
  - Clarity: Clear security expectation
  - Testability: Can test expiration scenarios
  - Quality: Prevents indefinitely valid tokens

**Improvement 3: Add error scenarios as acceptance criteria**
- **Current State:** Only 3 scenarios (happy paths mostly)
- **Suggested Change:** Add Scenarios 4-7 from Refined AC (expired token, used token, invalid password, etc.)
- **Benefit:**
  - Clarity: Error handling specified upfront
  - Testability: Clear error scenarios
  - Quality: Comprehensive edge case coverage

**Improvement 4: Specify rate limiting**
- **Current State:** No rate limiting mentioned
- **Suggested Change:** Add Technical Note: "Rate limiting: Max 3 reset requests per email per hour"
- **Benefit:**
  - Clarity: Security measure documented
  - Testability: Can test rate limit scenarios
  - Quality: Prevents abuse

**Improvement 5: Clarify session invalidation**
- **Current State:** Not mentioned
- **Suggested Change:** Add to Scenario 2: "All active user sessions are invalidated after password reset"
- **Benefit:**
  - Clarity: Security behavior documented
  - Testability: Can verify session invalidation
  - Quality: Proper security implementation

---

## 🧪 Testing Recommendations

### Pre-Implementation Testing:
- ✅ Recommended: Review Supabase Auth documentation for password reset flow
- ✅ Recommended: Test email templates in staging environment
- ✅ Recommended: Validate password policy matches FR-001 exactly

### During Implementation:
- ✅ Pair with Dev for integration testing approach
- ✅ Review unit tests as Dev writes them
- ✅ Test email delivery in staging (not production)

### Post-Implementation:
- ✅ Run all 28 test cases designed here
- ✅ Additional exploratory testing session (30 minutes)
- ✅ Security testing:
  - Token reuse attempts
  - Token tampering attempts
  - Rate limit bypass attempts
  - User enumeration prevention
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Mobile responsive testing

---

## ⚠️ Risks & Mitigation

**Risk 1: Email delivery failures**
- **Likelihood:** Medium
- **Impact:** High (users can't recover accounts)
- **Mitigation:**
  - TC-014 tests email failure handling
  - Retry mechanism (3 attempts)
  - Monitoring alerts on email failures
  - User sees success regardless (security + UX)

**Risk 2: Token security vulnerabilities**
- **Likelihood:** Low-Medium
- **Impact:** High (account takeover)
- **Mitigation:**
  - TC-006, TC-007, TC-008 test token states
  - TC-011 tests token invalidation
  - Short expiration (1 hour)
  - One-time use tokens
  - Token superseding on new request

**Risk 3: User enumeration**
- **Likelihood:** Medium (common attack)
- **Impact:** Medium (privacy, targeting)
- **Mitigation:**
  - TC-002 tests enumeration prevention
  - Same message for valid/invalid emails
  - Same response time (no timing attacks)

**Risk 4: Rate limit bypass**
- **Likelihood:** Low-Medium
- **Impact:** Medium (spam, DoS)
- **Mitigation:**
  - TC-010 tests rate limiting
  - Per-email AND per-IP limits
  - Exponential backoff

**Risk 5: Session persistence after password change**
- **Likelihood:** Low (if Supabase handles it)
- **Impact:** High (security vulnerability)
- **Mitigation:**
  - TC-015 tests session invalidation
  - Explicit verification all sessions invalidated
  - PO confirmation required

---

## 🎯 Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All ambiguities and questions from this document are resolved by PO/Dev
- [ ] Story is updated with suggested improvements (if accepted by PO)
- [ ] All 28 test cases are executed and passing:
  - [ ] Critical/High test cases: 100% passing (TC-001, TC-002, TC-003, TC-005, TC-006, TC-010, TC-015)
  - [ ] Medium/Low test cases: ≥95% passing
- [ ] All critical and high bugs resolved and verified
- [ ] Integration tests passing:
  - [ ] Frontend ↔ Supabase Auth (request reset)
  - [ ] Supabase Auth ↔ Email Service
  - [ ] Frontend ↔ Supabase Auth (update password)
- [ ] Security tests passed:
  - [ ] User enumeration prevention verified
  - [ ] Token reuse prevented
  - [ ] Rate limiting working
  - [ ] Session invalidation verified
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing completed
- [ ] Exploratory testing completed (30 min session)
- [ ] Test execution report generated
- [ ] No blockers for next stories in epic

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-7-password-reset/story.md`
- **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/feature-test-plan.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
- **Functional Specs:** `.context/SRS/functional-specs.md` (FR-001 - Password Policy)

---

## 📋 Test Execution Tracking

[Esta sección se completa durante ejecución]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**
- Total Tests: 28
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Found:**
- [Bug ID 1]: [Descripción breve]
- [Bug ID 2]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

**Generated:** 2025-11-10 (Mirror from Jira Comment)
**Last Updated:** 2025-11-26 (Local file created)
**Status:** Draft - Pending PO/Dev Review of Critical Questions
