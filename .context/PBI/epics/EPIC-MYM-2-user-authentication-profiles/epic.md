# EPIC-001: User Authentication & Profiles

**Jira Key:** MYM-2
**Status:** ASSIGNED
**Priority:** CRITICAL
**Phase:** Foundation (Sprint 1-2)

---

## Epic Description

This epic covers the foundational features for user identity and management in the Upex My Mentor marketplace. It enables users to create accounts, authenticate securely, and build their public-facing profiles that are essential for establishing trust and enabling discovery in the platform.

**Business Value:**
Without a robust authentication and profile system, the marketplace cannot function. This epic establishes:
- Secure user identity management
- Role-based access (Mentor vs Mentee)
- Profile information necessary for trust-building and discovery
- Foundation for all other platform features

---

## User Stories

1. **MYM-3** - As a new user, I want to sign up with my email and password so that I can create an account
2. **MYM-4** - As a user, I want to log in and log out so that I can securely access my account
3. **MYM-5** - As a Mentee, I want to create a basic profile with my name and a short bio so that mentors know who I am
4. **MYM-6** - As a Mentor, I want to create a detailed profile including my skills, experience, hourly rate, and a bio so that I can attract mentees
5. **MYM-7** - As a user, I want to be able to reset my password so that I can regain access if I forget it

---

## Scope

### In Scope
- Email/password registration and authentication
- User role selection (Mentor or Mentee) during signup
- Basic profile creation for mentees (name, photo, bio)
- Detailed mentor profiles (skills, experience, hourly rate, bio, LinkedIn/GitHub URLs)
- Password reset flow via email
- Session management (JWT tokens)
- Profile editing capabilities
- Email verification for new accounts

### Out of Scope (Future)
- Social login (Google, GitHub OAuth)
- Two-factor authentication (2FA)
- Profile privacy settings
- Multi-language profiles
- Profile completion progress indicators

---

## Acceptance Criteria (Epic Level)

1. ✅ Users can register with email and password following security best practices
2. ✅ Users can log in and log out successfully
3. ✅ Mentees can create and edit their basic profiles
4. ✅ Mentors can create and edit comprehensive profiles including:
   - Skills/specialties array
   - Hourly rate
   - Bio/description
   - LinkedIn and GitHub profile links
5. ✅ Users can reset their password through a secure email flow
6. ✅ All authentication flows handle errors gracefully with clear messaging
7. ✅ Profile data is validated on both client and server side
8. ✅ Only authenticated users can access protected routes

---

## Related Functional Requirements

- **FR-001:** El sistema debe permitir el registro de usuarios con email y contraseña
- **FR-002:** El sistema debe permitir el inicio de sesión de usuarios
- **FR-003:** El sistema debe permitir a los usuarios editar su perfil
- **FR-004:** El sistema debe permitir a los mentores añadir y gestionar sus especialidades y tarifa
- **FR-005:** El sistema debe permitir a los mentores conectar sus cuentas de LinkedIn/GitHub para validación

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Authentication Strategy
- **Technology:** Supabase Auth (built on PostgreSQL + GoTrue)
- **Token Type:** JWT (JSON Web Tokens)
- **Session Duration:** 7 days (configurable)
- **Password Policy:** Min 8 chars, 1 uppercase, 1 number, 1 special character

### Database Schema
**Tables:**
- `users` (managed by Supabase Auth)
  - id (uuid, PK)
  - email (string, unique)
  - encrypted_password (string)
  - role (enum: 'mentor' | 'student')
  - created_at, updated_at

- `profiles` (custom table)
  - id (uuid, PK, FK to users.id)
  - name (string)
  - photo_url (string, nullable)
  - description (text, max 500 chars)
  - created_at, updated_at

- `mentor_profiles` (extends profiles for mentors)
  - profile_id (uuid, PK, FK to profiles.id)
  - specialties (text[], array of skills)
  - hourly_rate (numeric)
  - linkedin_url (string, nullable)
  - github_url (string, nullable)
  - verification_status (enum: 'pending' | 'verified' | 'rejected')

### Security Requirements (NFR-001, NFR-002)
- All passwords must be hashed using bcrypt
- Email verification required before full account access
- Rate limiting on login attempts (max 5 per 15 minutes)
- HTTPS only for all authentication endpoints
- CSRF protection on all state-changing operations

---

## Dependencies

### External Dependencies
- Supabase Auth service
- Email delivery service (Supabase built-in or Resend)
- File storage for profile photos (Supabase Storage)

### Internal Dependencies
- None (this is a foundational epic)

### Blocks
- EPIC-002 (Mentor Vetting) - requires mentor profiles to exist
- EPIC-003 (Mentor Discovery) - requires user profiles to display
- All other epics depend on authentication being complete

---

## Success Metrics

### Functional Metrics
- 100% of new users can complete registration flow
- <5% password reset failure rate
- 0 critical authentication vulnerabilities

### Business Metrics (from Executive Summary)
- 50 mentors complete profile setup in first 3 months
- 500 students register in first 3 months
- <10% registration abandonment rate

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Email delivery failures prevent verification | High | Medium | Use reliable email service (Supabase/Resend), implement retry logic |
| Users forget passwords frequently | Medium | High | Implement clear password reset flow, consider password managers integration |
| Weak passwords compromise accounts | High | Medium | Enforce strong password policy, add password strength indicator |
| Profile photos consume excessive storage | Medium | Low | Implement file size limits (5MB), image optimization |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-001-user-authentication/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** All authentication service functions (>90% coverage)
- **Integration Tests:** Full registration/login/reset flows
- **E2E Tests:** User journey from signup to profile completion
- **Security Tests:** Password hashing, SQL injection, XSS prevention

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-001-user-authentication/feature-implementation-plan.md`

### Recommended Story Order
1. MYM-3 (Sign up) - Foundation
2. MYM-4 (Login/Logout) - Complete auth cycle
3. MYM-7 (Password reset) - Recovery flow
4. MYM-5 (Mentee profile) - Basic profiles
5. MYM-6 (Mentor profile) - Extended profiles

### Estimated Effort
- **Development:** 3-4 sprints (6-8 weeks)
- **Testing:** 1 sprint (2 weeks)
- **Total:** 4-5 sprints

---

## Notes

- This epic is the foundation of the entire platform - quality is critical
- Consider using Supabase Auth libraries to reduce custom auth code
- Profile data structure may evolve based on EPIC-002 (Vetting) requirements
- LinkedIn/GitHub URLs will be used by admins in EPIC-002 for verification

---

## Related Documentation

- **PRD:** `.context/PRD/executive-summary.md`, `.context/PRD/user-personas.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-001 to FR-005)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml` (Auth endpoints)
