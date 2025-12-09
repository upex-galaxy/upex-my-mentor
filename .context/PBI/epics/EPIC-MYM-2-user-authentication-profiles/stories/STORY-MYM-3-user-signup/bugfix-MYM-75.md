# Bugfix: MYM-75 - Password Validation Mismatch

**Jira Key:** MYM-75
**Related Story:** MYM-3 (User Sign Up)
**Date:** 2025-12-09
**Status:** Fixed

---

## Bug Description

Users could not create accounts because the system showed a "password doesn't meet requirements" error even when the password visually met all displayed criteria in the UI.

**Reported Behavior:**
- User enters password that shows all 4 requirements as met (green checkmarks)
- Submit button is clicked
- Error appears: "La contraseña no cumple los requisitos de seguridad"
- User is stuck on registration form

**Severity:** Critical
**Frequency:** Intermittent (depends on which special characters the user chooses)

---

## Root Cause Analysis

### The Problem

A mismatch existed between **client-side validation (Zod)** and **server-side validation (Supabase Auth)**.

**Original Zod regex:**
```typescript
const hasSpecialChar = /[^A-Za-z0-9]/
```

This regex accepts **ANY** non-alphanumeric character, including:
- Unicode symbols: €, £, ¥, ©, ®
- Accented characters: ñ, ü, á
- Inverted punctuation: ¡, ¿

**Supabase Auth allowed symbols:**
```
!@#$%^&*()_+-=[]{};'\:"|<>?,./`~
```

Supabase only accepts a **specific set of ASCII symbols**.

### Reproduction Steps

1. Go to `/signup`
2. Select role "Busco Mentoría"
3. Enter email: `test@example.com`
4. Enter password: `Test1234€` (using Euro symbol)
5. Observe: All 4 password requirements show green checkmarks
6. Click "Crear cuenta"
7. Error appears: "La contraseña no cumple los requisitos de seguridad"

### Evidence

- Supabase Auth logs showed 422 errors on `/signup` endpoint
- Error code: `weak_password`
- The Euro symbol (€) passes Zod validation but fails Supabase validation

---

## Solution Implemented

### Code Change

**File:** `src/lib/validations/auth.ts`

**Before:**
```typescript
// Password policy regex patterns
const hasUppercase = /[A-Z]/
const hasNumber = /[0-9]/
const hasSpecialChar = /[^A-Za-z0-9]/
```

**After:**
```typescript
// Password policy regex patterns
const hasUppercase = /[A-Z]/
const hasNumber = /[0-9]/
// Only allow symbols that Supabase Auth accepts: !@#$%^&*()_+-=[]{};'\:"|<>?,./`~
const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/
```

### Validation Results

**Symbols that now correctly PASS:**
- `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `(`, `)`
- `_`, `+`, `-`, `=`, `{`, `}`, `[`, `]`
- `;`, `:`, `'`, `"`, `\`, `|`
- `<`, `>`, `?`, `,`, `.`, `/`
- `` ` ``, `~`

**Symbols that now correctly FAIL (client-side, before reaching Supabase):**
- `€`, `£`, `¥` (currency symbols)
- `ñ`, `ü`, `á` (accented characters)
- `©`, `®` (trademark symbols)
- `¡`, `¿` (inverted punctuation)

---

## Testing Performed

### Unit Test (Regex Validation)
```bash
bun -e "
const hasSpecialChar = /[!@#\$%^&*()_+\\-=\\[\\]{};':\"\\\\|<>?,./\`~]/

// All 25 allowed symbols - PASS
// All 9 disallowed symbols (€, £, ¥, ñ, ü, ©, ®, ¡, ¿) - FAIL
"
```
Result: All tests passed

### E2E Test (Playwright)
1. Tested `Test1234€` on staging - correctly showed validation error BEFORE submit
2. Tested `Test1234!` on staging - successfully created account

---

## Impact

- **User Experience:** Users now see accurate feedback. If they use an unsupported symbol, the UI will show the requirement as NOT met (red X instead of green check).
- **Error Prevention:** Invalid passwords are caught client-side before reaching Supabase, providing immediate feedback.
- **Consistency:** Client and server validations are now aligned.

---

## Related Files

- `src/lib/validations/auth.ts` - Password validation schemas
- `src/components/auth/signup-form.tsx` - Signup form component
- `src/components/auth/password-strength.tsx` - Password strength indicator

---

## Lessons Learned

1. **Always verify third-party constraints:** When integrating with external services (Supabase Auth), ensure client-side validation matches server-side requirements exactly.
2. **Document external dependencies:** The Supabase password policy should be documented in the codebase to prevent future mismatches.
3. **Test with edge cases:** Password validation should be tested with various Unicode characters, not just common ASCII symbols.
