# EPIC-007: Reputation & Reviews System

**Jira Key:** MYM-32
**Status:** ASSIGNED
**Priority:** CRITICAL
**Phase:** Financial & Trust (Sprint 5-6)

---

## Epic Description

This epic establishes a bidirectional reputation system that builds trust in the Upex My Mentor marketplace. It enables both mentees and mentors to provide feedback after sessions, creating a transparent history of interactions that helps future users make informed decisions. This trust mechanism is fundamental to the platform's value proposition.

**Business Value:**
The reputation system is a core differentiator mentioned in the Business Model Canvas:
- **"Verified expertise + transparent reviews"** reduces risk for mentees
- **Bidirectional reviews** encourage professional behavior from both parties
- **Social proof** increases conversion rates (mentees more likely to book highly-rated mentors)
- **Quality control** naturally filters out poor performers
- **Feedback loop** helps mentors improve their service

Without this epic, the platform cannot deliver on its promise of "trust-building through transparency."

---

## User Stories

1. **MYM-33** - As a Mentee, I want to rate and leave a comment about my mentor after a session so that I can share my experience
2. **MYM-34** - As a Mentor, I want to rate and leave a comment about my mentee after a session so that I can provide feedback and build trust
3. **MYM-35** - As a user, I want to view ratings and reviews on user profiles so that I can make informed decisions

---

## Scope

### In Scope

**Review Submission:**
- Review prompt triggered 1 hour after session completion
- Star rating system (1-5 stars, required)
- Text comment (max 500 characters, optional)
- Review form accessible from:
  - Email reminder ("Leave a review for [Name]")
  - Session dashboard ("Leave Review" button)
  - Direct link from session details
- One review per session per user (immutable after submission)
- Reviews are public by default

**Bidirectional Reviews:**
- Both mentor and mentee can review each other
- Reviews are independent (can't see other's review before submitting)
- Reviews appear on reviewer's profile (as "Reviews Given") and reviewee's profile (as "Reviews Received")

**Rating Aggregation:**
- Average rating calculated in real-time
- Display format: 4.7/5.0 (based on 23 reviews)
- Rating breakdown histogram (# of 5-star, 4-star, etc.)
- Recent reviews prioritized in display

**Profile Integration:**
- Average rating displayed prominently on profile cards (EPIC-003)
- Reviews section on detailed profile page
- Sort reviews: Most Recent, Highest Rated, Lowest Rated
- Pagination: 10 reviews per page
- Filter reviews: By rating (5-star only, 4-star+, etc.)

**Review Moderation (Manual for MVP):**
- Flag inappropriate reviews (report button)
- Admin can hide flagged reviews
- Email notification to admin when review is flagged

### Out of Scope (Future)
- Review editing or deletion (immutable for trust)
- Review responses (mentor replies to mentee review)
- Verified reviews badge (only from confirmed sessions)
- Review helpfulness voting ("Was this helpful?")
- Detailed review criteria (e.g., "Communication: 5/5, Expertise: 4/5")
- Review incentives (discount for leaving review)
- Automated review moderation (AI spam detection)
- Review sentiment analysis
- Anonymous reviews (all reviews show reviewer name)

---

## Acceptance Criteria (Epic Level)

1. ✅ Users can submit a review 1 hour after session completion
2. ✅ Star rating (1-5) is required, comment is optional
3. ✅ Each session can only be reviewed once per user
4. ✅ Reviews cannot be edited or deleted after submission
5. ✅ Average rating updates immediately after new review
6. ✅ Reviews display on both mentor and mentee profiles
7. ✅ Profile shows accurate rating breakdown (histogram)
8. ✅ Reviews are sorted by date (most recent first) by default
9. ✅ Users can flag inappropriate reviews
10. ✅ Flagged reviews are hidden from public view until admin review
11. ✅ Empty state shown for profiles with no reviews

---

## Related Functional Requirements

- **FR-013:** El sistema debe permitir a los estudiantes valorar y comentar a su mentor
- **FR-014:** El sistema debe permitir a los mentores valorar y comentar a su estudiante
- **FR-015:** El sistema debe mostrar valoraciones y comentarios en los perfiles de usuario

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Database Schema

**Tables:**
- `reviews`
  - id (uuid, PK)
  - booking_id (uuid, FK to bookings.id)
  - reviewer_id (uuid, FK to users.id) - Who wrote the review
  - reviewee_id (uuid, FK to users.id) - Who is being reviewed
  - reviewer_role (enum: 'mentor' | 'mentee') - Role of reviewer
  - rating (integer, 1-5, NOT NULL)
  - comment (text, max 500 chars, nullable)
  - is_flagged (boolean, default false)
  - is_hidden (boolean, default false) - Admin can hide
  - flagged_reason (text, nullable)
  - created_at, updated_at
  - **UNIQUE CONSTRAINT** on (booking_id, reviewer_id) - One review per user per session

- `user_ratings` (materialized view or cached table)
  - user_id (uuid, PK)
  - role (enum: 'mentor' | 'mentee')
  - average_rating (numeric, computed)
  - total_reviews (integer, computed)
  - rating_distribution (jsonb) - {"5": 10, "4": 5, "3": 2, "2": 0, "1": 0}
  - updated_at

### Rating Calculation

**Average Rating Computation:**
```sql
-- Recalculate on each new review
SELECT
  reviewee_id,
  AVG(rating) as average_rating,
  COUNT(*) as total_reviews,
  jsonb_object_agg(rating, count) as rating_distribution
FROM (
  SELECT
    reviewee_id,
    rating,
    COUNT(*) as count
  FROM reviews
  WHERE is_hidden = false
  GROUP BY reviewee_id, rating
) subquery
GROUP BY reviewee_id;
```

**Performance Optimization:**
- Use triggers to update `user_ratings` table on INSERT/UPDATE/DELETE in `reviews`
- Cache average rating on profile object
- Index on `reviewee_id` and `reviewer_id`

### Review Eligibility Logic

```javascript
function canReview(userId, bookingId) {
  const booking = await getBooking(bookingId);

  // Check 1: User is part of this booking
  const isParticipant =
    booking.mentor_id === userId ||
    booking.mentee_id === userId;

  // Check 2: Session is completed
  const isCompleted = booking.status === 'completed';

  // Check 3: Session ended at least 1 hour ago
  const sessionEndTime = new Date(booking.session_datetime);
  sessionEndTime.setHours(sessionEndTime.getHours() + 1);
  const hasBeenAnHour = new Date() > sessionEndTime;

  // Check 4: User hasn't reviewed this booking yet
  const existingReview = await getReview(bookingId, userId);
  const hasNotReviewed = !existingReview;

  return isParticipant && isCompleted && hasBeenAnHour && hasNotReviewed;
}
```

### API Endpoints

See: `.context/SRS/api-contracts.yaml`

- `POST /api/reviews` - Submit a review
  ```json
  {
    "booking_id": "uuid",
    "rating": 5,
    "comment": "Excellent mentor, very helpful!"
  }
  ```

- `GET /api/reviews` - List reviews
  - Query params: `?reviewee_id=uuid&sort=recent&page=1&limit=10`
  - Returns: Array of reviews with reviewer info

- `GET /api/users/:id/rating` - Get user's rating summary
  - Returns: `{ average_rating, total_reviews, rating_distribution }`

- `POST /api/reviews/:id/flag` - Flag a review
  ```json
  {
    "reason": "Inappropriate language"
  }
  ```

- `PATCH /api/reviews/:id/moderate` - Admin: Hide/unhide review
  ```json
  {
    "is_hidden": true
  }
  ```

### Email Notifications

**Review Reminder Email (sent 1 hour after session):**
```
Subject: How was your session with [Name]?

Hi [User],

We hope you had a great session with [Mentor/Mentee Name]!

Your feedback helps build trust in our community. Please take a moment to share your experience.

[Leave a Review]

Thanks,
The Upex My Mentor Team
```

**New Review Notification Email (to reviewee):**
```
Subject: You have a new review!

Hi [User],

[Reviewer Name] left you a review:

★★★★★ 5/5
"Excellent mentor, very helpful!"

[View Your Profile]
```

---

## Dependencies

### External Dependencies
- Email service for review reminders and notifications

### Internal Dependencies
- **EPIC-004 (Scheduling & Booking):** Required
  - Reviews are tied to bookings
- **EPIC-006 (Session Management):** Required
  - Session must be completed before review
- **EPIC-003 (Mentor Discovery):** Integration point
  - Reviews display on mentor profiles

### Blocks
- None (this is a terminal epic in the user journey)

---

## Success Metrics

### Functional Metrics
- >50% review completion rate (reviews submitted / sessions completed)
- <2% flagged reviews (indicates quality)
- >4.0 average platform rating (overall quality)
- 0 duplicate reviews per session

### Business Metrics
- 70% of mentees check reviews before booking (Discovery tracking)
- 30% increase in booking conversion for 5-star mentors vs. no ratings
- <5% mentor churn due to negative reviews (balanced ecosystem)

### Trust Metrics
- 80% of reviews include a comment (detailed feedback)
- Average review length: 50-150 characters (quality feedback)
- >90% of users trust the review system (survey metric)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Review bombing (malicious low ratings) | High | Low | Flag suspicious patterns, manual review, verified purchase requirement |
| Quid pro quo reviews (mentors & mentees exchange 5-star reviews) | Medium | Medium | Bidirectional reviews reduce incentive, monitor for patterns |
| Negative reviews discourage new mentors | Medium | Medium | Onboarding sets expectations, highlight learning opportunities |
| Spam or inappropriate comments | Medium | Low | Flag system, manual moderation, basic keyword filtering |
| Users don't leave reviews (low participation) | High | Medium | Email reminders, in-app prompts, simplify review process |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-007-reputation-reviews/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** Rating calculation, eligibility logic (>95% coverage)
- **Integration Tests:** Full review submission flow
- **E2E Tests:** User journey from session completion to review submission
- **Load Tests:** Rating aggregation performance with 10,000+ reviews
- **Security Tests:** Prevent duplicate reviews, unauthorized review submission

### Critical Test Scenarios
1. **One Review Per Session:**
   - User submits review for session → Success
   - Same user attempts second review for same session → Error

2. **Bidirectional Independence:**
   - Mentee submits review → Mentor cannot see it before submitting their own
   - Both submit reviews → Both appear on respective profiles

3. **Rating Aggregation:**
   - Mentor has 5 reviews: [5, 5, 4, 4, 3]
   - Average rating: 4.2/5.0
   - Distribution: {"5": 2, "4": 2, "3": 1, "2": 0, "1": 0}

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-007-reputation-reviews/feature-implementation-plan.md`

### Recommended Story Order
1. MYM-33 (Mentee reviews mentor) - Foundation, basic review flow
2. MYM-34 (Mentor reviews mentee) - Bidirectional implementation
3. MYM-35 (Display reviews) - Public-facing integration

### Estimated Effort
- **Development:** 2-3 sprints (4-6 weeks)
- **Testing:** 0.5 sprint (1 week)
- **Total:** 3-4 sprints

---

## Design Considerations

### Review Submission Form
```
How was your session with Carlos?

Rating: ★★★★☆ (4 / 5)
        [Interactive star selector]

Comment (optional):
┌─────────────────────────────────────┐
│ Carlos was very helpful and patient │
│ in explaining React hooks. Would    │
│ definitely book again!              │
│                                     │
│ 125 / 500 characters               │
└─────────────────────────────────────┘

[Cancel]  [Submit Review]
```

### Profile Rating Display
```
★★★★☆ 4.7 / 5.0 (based on 23 reviews)

Rating Breakdown:
5 ★★★★★ ███████████████░░ 15
4 ★★★★☆ ██████░░░░░░░░░░  5
3 ★★★☆☆ ███░░░░░░░░░░░░░  2
2 ★★☆☆☆ ░░░░░░░░░░░░░░░░  0
1 ★☆☆☆☆ █░░░░░░░░░░░░░░░  1

[Sort: Most Recent ▼] [Filter: All ▼]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
★★★★★ Laura Martinez
Nov 10, 2025

"Excellent mentor! Carlos helped me
debug a complex state management issue
and explained everything clearly."

[👎 Flag]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Empty State (No Reviews Yet)
```
╔═══════════════════════════════════╗
║  No reviews yet                   ║
║                                   ║
║  Be the first to leave a review   ║
║  and help build trust in our      ║
║  community!                       ║
╚═══════════════════════════════════╝
```

---

## Review Guidelines (To Be Communicated to Users)

**What makes a helpful review:**
- ✅ Specific examples of what went well or could improve
- ✅ Honest assessment of the experience
- ✅ Constructive feedback for improvement
- ✅ Professional tone

**What to avoid:**
- ❌ Personal attacks or offensive language
- ❌ Irrelevant information (off-topic)
- ❌ Spam or promotional content
- ❌ Threats or harassment

---

## Notes

- Consider implementing review responses in v2 (mentors can reply to reviews)
- Monitor review velocity to identify inactive users
- Highlight top-rated mentors in discovery interface (EPIC-003)
- Consider review analytics dashboard for mentors (show trends)
- Future: Implement ML model to detect fake reviews

---

## Related Documentation

- **Business Model:** `.context/idea/business-model.md` (Value Proposition: Trust)
- **PRD:** `.context/PRD/executive-summary.md` (Trust mechanism)
- **SRS:** `.context/SRS/functional-specs.md` (FR-013, FR-014, FR-015)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API:** `.context/SRS/api-contracts.yaml`
