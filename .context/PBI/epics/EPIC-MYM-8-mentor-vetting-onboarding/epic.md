# EPIC-002: Mentor Vetting & Onboarding

**Jira Key:** MYM-8
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Foundation (Sprint 1-2)

---

## Epic Description

This epic establishes the quality control process for mentors joining the Upex My Mentor marketplace. It provides administrators with the tools necessary to review, assess, and approve mentor applications, ensuring that only qualified and vetted professionals are accessible to mentees.

**Business Value:**
The "verified mentor" promise is a core differentiator in the Business Model Canvas. This epic directly supports:
- **Value Proposition:** "Access to verified experts reduces risk for students"
- **Trust Building:** Only qualified mentors appear in the marketplace
- **Quality Control:** Administrative oversight prevents low-quality experiences
- **Competitive Advantage:** Rigorous vetting vs. open platforms

Without this epic, the platform cannot deliver on its promise of "verified expertise."

---

## User Stories

1. **MYM-9** - As an Admin, I want to view a list of pending mentor applications so that I can manage the vetting pipeline
2. **MYM-10** - As an Admin, I want to review an individual mentor's application details so that I can assess their qualifications
3. **MYM-11** - As an Admin, I want to approve or reject a mentor application so that I can maintain the quality of the marketplace
4. **MYM-12** - As a Mentor, I want to receive an email notification about the status of my application so that I know if I've been accepted

---

## Scope

### In Scope
- Admin dashboard to view pending mentor applications
- Detailed application review interface showing:
  - Mentor profile information (from EPIC-001)
  - LinkedIn and GitHub profile links
  - Skills/specialties claimed
  - Proposed hourly rate
- Approve/Reject workflow with status updates
- Email notifications to mentors about application status
- Application status tracking (pending → approved/rejected)
- Admin notes/comments on applications (internal use)

### Out of Scope (Future)
- Automated verification (e.g., LinkedIn API integration)
- Video interview scheduling
- Background checks or identity verification
- Mentor onboarding checklist/training
- Appeal process for rejected mentors
- Batch approval of multiple mentors
- Public badge/certification display

---

## Acceptance Criteria (Epic Level)

1. ✅ Admins can log in and access a dedicated admin dashboard
2. ✅ Admin dashboard displays all mentor applications with status (pending/approved/rejected)
3. ✅ Admins can filter applications by status
4. ✅ Admins can view full application details including:
   - Profile information
   - LinkedIn/GitHub URLs (clickable)
   - Claimed specialties
   - Hourly rate
5. ✅ Admins can approve or reject applications with a single action
6. ✅ Approved mentors have their `verification_status` updated to 'verified'
7. ✅ Rejected mentors have their `verification_status` updated to 'rejected'
8. ✅ Mentors receive email notifications within 1 hour of status change
9. ✅ Only verified mentors appear in the mentor discovery interface (EPIC-003)
10. ✅ All admin actions are logged for audit purposes

---

## Related Functional Requirements

- **FR-005:** El sistema debe permitir a los mentores conectar sus cuentas de LinkedIn/GitHub para validación

**Note:** This epic introduces new admin-specific requirements not explicitly detailed in the original SRS. Consider these as extensions:
- **FR-ADM-001:** El sistema debe permitir a los administradores visualizar aplicaciones pendientes de mentores
- **FR-ADM-002:** El sistema debe permitir a los administradores aprobar o rechazar aplicaciones de mentores
- **FR-ADM-003:** El sistema debe notificar a los mentores sobre el estado de su aplicación

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Database Schema Extensions

**Tables:**
- `mentor_profiles` (extends from EPIC-001)
  - verification_status (enum: 'pending' | 'verified' | 'rejected')
  - verified_at (timestamp, nullable)
  - verified_by (uuid, FK to users.id, nullable) - Admin who approved
  - rejection_reason (text, nullable)

- `admin_users` (new table)
  - id (uuid, PK, FK to users.id)
  - admin_role (enum: 'super_admin' | 'vetting_admin')
  - created_at, updated_at

- `application_audit_log` (new table for compliance)
  - id (uuid, PK)
  - mentor_profile_id (uuid, FK)
  - admin_id (uuid, FK)
  - action (enum: 'approved' | 'rejected' | 'viewed')
  - notes (text, nullable)
  - created_at

### Admin Access Control
- Admin users are identified by a special role in the users table
- Only users with admin role can access admin routes
- Admin UI is a separate protected section of the application
- RLS (Row Level Security) policies ensure admins can only perform admin actions

### Email Notifications
- Approval email template with next steps (how to complete profile, guidelines)
- Rejection email template (professional, encourages improvement)
- Use Supabase Edge Functions or Resend for email delivery

---

## Dependencies

### External Dependencies
- Email delivery service (Supabase/Resend)
- None for external verification (manual process for MVP)

### Internal Dependencies
- **EPIC-001 (User Authentication):** Required
  - Mentor profiles must exist before vetting
  - Admin authentication must be in place

### Blocks
- **EPIC-003 (Mentor Discovery):** Approved mentors must be available before discovery works

---

## Success Metrics

### Functional Metrics
- 100% of applications are reviewed within 48 hours
- <5% admin action errors (wrong approval/rejection)
- 100% email notification delivery rate

### Business Metrics
- 50 mentors verified in first 3 months (per MVP hypothesis)
- >80% approval rate (indicates good mentor attraction)
- <10% mentor churn after rejection feedback

### Operational Metrics
- Average review time per application: <10 minutes
- Admin dashboard page load time: <2 seconds

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Manual vetting becomes bottleneck at scale | High | High | Define clear vetting criteria, consider semi-automation in v2 |
| Inconsistent vetting decisions | Medium | Medium | Create vetting guidelines document, admin training |
| Rejected mentors leave negative reviews | Medium | Medium | Provide constructive rejection feedback, offer reapplication |
| Admin accounts compromised | High | Low | Strong admin authentication, audit logs, limited admin users |
| LinkedIn/GitHub URLs are fake or misleading | Medium | Medium | Manual verification by clicking links, future: API validation |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-002-mentor-vetting/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** Admin service functions (>90% coverage)
- **Integration Tests:** Full application approval/rejection flows
- **E2E Tests:** Admin dashboard navigation and actions
- **Security Tests:** Admin role enforcement, unauthorized access prevention
- **Email Tests:** Notification delivery and template rendering

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-002-mentor-vetting/feature-implementation-plan.md`

### Recommended Story Order
1. MYM-9 (View pending applications) - Foundation, admin dashboard
2. MYM-10 (Review application details) - Application review interface
3. MYM-11 (Approve/reject) - Core workflow
4. MYM-12 (Email notifications) - Feedback loop

### Estimated Effort
- **Development:** 2 sprints (4 weeks)
- **Testing:** 0.5 sprint (1 week)
- **Total:** 2-3 sprints

---

## Admin Vetting Guidelines (To Be Created)

The following guidelines should be documented for admin users:

1. **Profile Completeness Check:**
   - Bio is professional and descriptive (>100 chars)
   - Skills are relevant and specific (not generic)
   - Hourly rate is within reasonable market range ($30-$300/hr)

2. **LinkedIn Verification:**
   - Profile exists and is public
   - Job titles match claimed experience
   - Connections/recommendations indicate legitimacy
   - Profile is active (recent posts/updates)

3. **GitHub Verification (if applicable):**
   - Profile exists with public repositories
   - Activity indicates real technical work
   - Contributions align with claimed skills

4. **Red Flags (Auto-Reject):**
   - No LinkedIn/GitHub provided
   - LinkedIn profile is private or doesn't exist
   - Claimed skills don't match LinkedIn experience
   - Hourly rate is unreasonably low (<$20) or high (>$500)
   - Profile bio contains spam or inappropriate content

5. **Borderline Cases:**
   - Junior mentors (<3 years experience) - Review case-by-case
   - Niche technologies with limited verifiable history - Accept with caution
   - International mentors with non-English profiles - Ensure bio is in English

---

## Notes

- This epic was not in the original PRD but is essential for the "verified mentors" value proposition
- Consider creating a public "verification badge" in future iterations
- Manual vetting is acceptable for MVP; plan for automation/AI assistance in v2
- Admin dashboard could be built with existing UI components or a lightweight admin framework

---

## Related Documentation

- **Business Model:** `.context/idea/business-model.md` (Value Proposition section)
- **PRD:** `.context/PRD/executive-summary.md` (Problem Statement)
- **SRS:** `.context/SRS/functional-specs.md` (FR-005)
- **Non-Functional:** `.context/SRS/non-functional-specs.md` (Security requirements)
