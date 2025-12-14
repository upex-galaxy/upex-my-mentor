# Implementation Plan: STORY-MYM-33 - Mentee Reviews Mentor

**Fecha:** 2025-12-13
**Arquitecto:** Claude Code (AI-Assisted)
**Story Jira Key:** MYM-33
**Epic:** EPIC-MYM-32 - Reputation & Reviews System
**Status:** Ready to Implement

---

## Overview

Implementar la funcionalidad que permite a mentees dejar una valoración (1-5 estrellas) y comentario opcional después de completar una sesión con un mentor.

**Acceptance Criteria a cumplir:**
- After a session is marked as completed, the mentee can rate the mentor
- Rating must be between 1-5 stars (required)
- Comment text field supports up to 500 characters (optional)
- Once submitted, the review cannot be edited
- Each session can only be reviewed once by the mentee
- Reviews available 1 hour after session completion

---

## Current State Analysis

### ✅ Already Implemented (from MYM-34/MYM-35)

**Components:**
- `src/components/reviews/star-rating-input.tsx` - Interactive 1-5 star selector
- `src/components/reviews/review-form.tsx` - Complete form with validation
- `src/app/review/submit/page.tsx` - Eligibility check + form display
- `src/app/review/submit/review-form-wrapper.tsx` - Client wrapper

**Server Actions:**
- `src/lib/actions/reviews.ts`:
  - `checkReviewEligibility()` - Validates: auth, booking, participant, completed, 1h, not reviewed
  - `createReview()` - Creates review with full validation
  - `getUserRoleInBooking()` - Returns 'mentor' | 'mentee' | null

**Database:**
- Table `reviews`: id, reviewer_id, subject_id, booking_id, rating, comment, created_at
- UNIQUE constraint: `unique_review_per_booking_reviewer` on (booking_id, reviewer_id)
- Triggers: `update_profile_rating` for INSERT/UPDATE/DELETE (updates average_rating)

### ❌ Missing Implementation

1. **"Leave Review" button in SessionCard** for completed sessions
2. **Review status indicator** showing if already reviewed
3. **Test coverage** for the complete flow

---

## Technical Approach

**Chosen approach:** Add review CTA to existing SessionCard component

**Why this approach:**
- ✅ Minimal changes needed - most logic already exists
- ✅ Reuses existing eligibility checking in `/review/submit`
- ✅ Consistent UX with other session actions
- ❌ Trade-off: Need to check review status for each past session

**Alternatives considered:**
- Separate "Reviews Pending" section: More complex, unnecessary for MVP
- Modal on SessionCard: Worse UX than dedicated page

---

## Implementation Steps

### **Step 1: Add Leave Review Button to SessionCard**

**Task:** Add "Leave Review" button for completed sessions with review status check

**File:** `src/components/sessions/session-card.tsx`

**Details:**
- Add `hasReviewed` prop to check if user already reviewed
- Show "Dejar valoración" button for completed sessions if not reviewed
- Show "Valoración enviada" badge if already reviewed
- Link to `/review/submit?booking={id}`

**Edge cases handled:**
- Already reviewed: Show confirmation badge
- Session not completed: Button not shown
- Cancelled sessions: Button not shown

**Testing:**
- Visual test: Button appears for completed sessions
- Click navigates to review page

---

### **Step 2: Update Sessions Tabs to Fetch Review Status**

**Task:** Pass review status to SessionCard for past sessions

**Files:**
- `src/app/dashboard/sessions/page.tsx`
- `src/app/dashboard/sessions/_components/sessions-tabs.tsx`

**Details:**
- Fetch user's reviews for past sessions
- Add `hasReviewed` to each session in `pastSessions`
- Pass to SessionCard component

**Edge cases handled:**
- No past sessions: Empty array
- Multiple reviews: Only check current user's review

**Testing:**
- Button shows correctly for unreviewed sessions
- Badge shows for already reviewed sessions

---

### **Step 3: Add Review Status Query Helper**

**Task:** Create helper to check review status for multiple bookings

**File:** `src/lib/actions/reviews.ts`

**Details:**
- Add `getReviewStatusForBookings(bookingIds: string[])` function
- Returns Map<bookingId, boolean> indicating if reviewed
- Efficient batch query

**Testing:**
- Returns correct status for mixed reviewed/unreviewed

---

### **Step 4: Verify Existing Flow End-to-End**

**Task:** Ensure complete flow works

**Flow:**
1. User sees completed session in dashboard
2. Clicks "Dejar valoración" button
3. Navigates to `/review/submit?booking={id}`
4. Eligibility verified (should pass if 1h+ after completion)
5. Form displays with mentor name
6. User selects rating + optional comment
7. Submits → Review created
8. Success message shown
9. Redirect to dashboard
10. Button now shows "Valoración enviada"

**Testing:**
- E2E flow from dashboard to review to confirmation

---

## UI/UX Design

### Leave Review Button Design

```
For COMPLETED sessions (past tab):

┌──────────────────────────────────────────┐
│ SessionCard (completed)                  │
│ ...existing content...                   │
│                                          │
│ [✓ Valoración enviada]  ← If reviewed    │
│        OR                                │
│ [⭐ Dejar valoración]   ← If not reviewed│
└──────────────────────────────────────────┘
```

**Styling:**
- "Dejar valoración" → `Button variant="outline"` with Star icon
- "Valoración enviada" → `Badge variant="secondary"` with Check icon
- Consistent with existing button/badge styles in SessionCard

---

## Types & Type Safety

**Types already available:**
- `BookingWithParticipants` in `src/types/sessions.ts`
- `ReviewSubmission`, `ReviewEligibility` in `src/types/index.ts`

**New type to add:**

```typescript
// Add to BookingWithParticipants or create extension
interface SessionWithReviewStatus extends BookingWithParticipants {
  hasReviewed?: boolean;
}
```

---

## Definition of Done Checklist

- [x] Code exists for review form and submission logic (already implemented)
- [ ] "Leave Review" button added to SessionCard for completed sessions
- [ ] Review status (reviewed/not reviewed) displayed correctly
- [ ] Full E2E flow tested from dashboard to submission
- [ ] Linting passes: `bun run lint`
- [ ] Build passes: `bun run build`
- [ ] Zero TypeScript errors
- [ ] Test cases from test-cases.md covered:
  - TC-001: Submit review with rating and comment
  - TC-002: Submit review with rating only
  - TC-011: Prevent duplicate review
  - TC-012: Prevent review before 1 hour

---

## Estimated Effort

| Step | Description | Time |
|------|-------------|------|
| 1 | Add Leave Review button to SessionCard | 30 min |
| 2 | Update Sessions Tabs with review status | 30 min |
| 3 | Add review status query helper | 20 min |
| 4 | E2E verification and testing | 30 min |
| **Total** | | **~2 hours** |

---

## Risks & Mitigations

**Risk 1:** Performance impact fetching review status for all past sessions
- **Impact:** Low
- **Mitigation:** Batch query, only for past sessions (limited set)

**Risk 2:** Race condition between eligibility check and submission
- **Impact:** Low
- **Mitigation:** Server-side re-validation + DB unique constraint

---

## Related Documentation

- **Story:** `story.md` (same folder)
- **Test Cases:** `test-cases.md` (same folder)
- **Feature Implementation Plan:** `../../feature-implementation-plan.md`
- **Design System:** `.context/design-system.md`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
