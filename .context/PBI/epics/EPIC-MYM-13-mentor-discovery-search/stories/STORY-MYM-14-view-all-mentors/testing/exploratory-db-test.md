# Database Exploratory Testing Session Notes

Date: 2026-02-12
Feature: MYM-14 - View All Available Mentors
Database: Supabase (staging, shared across envs)
Session Type: DB exploratory testing (read-only)

---

## Executive Summary

- Overall Status: ISSUES FOUND
- Tables Tested: profiles, reviews
- Constraints Verified: 5 (PK/UK/FK/CHECK)
- Triggers Verified: 4 (rating update + mentor vetting notifications)
- Data Integrity Issues: 2

---

## Database Exploration Plan

Feature: Mentor gallery (verified mentors only, rating-based ordering)
Scope: MYM-14

Tables involved:

| Table     | Role in Feature               | Key Columns |
| --------- | ----------------------------- | ----------- |
| profiles  | Mentor catalog                | id, role, is_verified, name, specialties, hourly_rate, average_rating, total_reviews |
| reviews   | Rating/Review source of truth | id, subject_id, rating, booking_id |

Verification points:

1) Only verified mentors surface (`role = 'mentor'`, `is_verified = true`).
2) Rating + review count reflect reviews table (trigger integrity).
3) Primary specialty and hourly rate exist for verified mentors.
4) Sorting by average_rating desc is feasible with current data.

---

## Schema Verification

### profiles

Columns (key subset):

- id (uuid, PK, FK -> auth.users.id)
- email (varchar, UNIQUE, NOT NULL)
- role (user_role enum, NOT NULL)
- is_verified (boolean, default false)
- specialties (text[])
- hourly_rate (numeric)
- average_rating (numeric)
- total_reviews (integer)

Constraints:

- PK: profiles_pkey (id)
- FK: profiles_id_fkey -> auth.users(id)
- UNIQUE: profiles_email_key (email)

Triggers:

- on_mentor_vetting_change (AFTER UPDATE) -> notify_mentor_vetting_change()

### reviews

Columns (key subset):

- id (uuid, PK)
- reviewer_id (uuid, FK -> profiles.id)
- subject_id (uuid, FK -> profiles.id)
- booking_id (uuid, nullable)
- rating (integer, NOT NULL)

Constraints:

- PK: reviews_pkey (id)
- FK: fk_reviewer -> profiles(id)
- FK: fk_subject -> profiles(id)
- CHECK: reviews_rating_check (rating between 1 and 5)
- UNIQUE: unique_review_per_booking_reviewer (booking_id, reviewer_id)

Triggers:

- trigger_update_profile_rating_insert (AFTER INSERT) -> update_profile_rating()
- trigger_update_profile_rating_update (AFTER UPDATE) -> update_profile_rating()
- trigger_update_profile_rating_delete (AFTER DELETE) -> update_profile_rating()

---

## Data State Verification

### Mentor availability for listing

Query:

```sql
select
  (select count(*) from profiles where role = 'mentor' and is_verified = true) as verified_mentors,
  (select count(*) from profiles where role = 'mentor' and is_verified = false) as unverified_mentors;
```

Actual:

- verified_mentors: 22
- unverified_mentors: 1

Status: VERIFIED

### No verified mentors with null name

Query:

```sql
select id, name
from profiles
where role = 'mentor' and is_verified = true and (name is null or trim(name) = '');
```

Actual: 0 rows
Status: VERIFIED

### Rating bounds

Query:

```sql
select id, average_rating
from profiles
where average_rating is not null and (average_rating < 0 or average_rating > 5);
```

Actual: 0 rows
Status: VERIFIED

### Sorting viability (average_rating desc)

Query:

```sql
select id, name, average_rating, total_reviews
from profiles
where role = 'mentor' and is_verified = true
order by average_rating desc nulls last, id asc
limit 10;
```

Actual: top mentors sorted as expected (rating-desc, nulls last)
Status: VERIFIED

---

## Constraint Testing

Write-based constraint tests were skipped to avoid mutating shared staging data.
Validation was performed by schema inspection + data integrity checks.

---

## Data Integrity Checks

### Check A: Rating consistency between profiles and reviews

Query:

```sql
select p.id, p.name, p.total_reviews, p.average_rating, count(r.id) as calc_count
from profiles p
left join reviews r on r.subject_id = p.id
where p.role = 'mentor' and p.is_verified = true
group by p.id, p.name, p.total_reviews, p.average_rating
having (p.total_reviews is not null and p.total_reviews > 0 and count(r.id) = 0)
    or (p.average_rating is not null and count(r.id) = 0);
```

Actual:

- 1 mentor with stored rating/count but 0 reviews: profile id `81dce8b2-c2c6-486e-856c-b5645b2e68e9`

Status: FAILED

### Check B: Reviews linked to mentors only

Query:

```sql
select r.id, r.subject_id
from reviews r
left join profiles p on p.id = r.subject_id
where p.id is null or p.role <> 'mentor';
```

Actual: 0 rows
Status: PASSED

### Check C: Reviews linked to bookings

Query:

```sql
select count(*) as total_reviews,
       count(*) filter (where booking_id is null) as reviews_without_booking
from reviews;
```

Actual:

- total_reviews: 16
- reviews_without_booking: 16

Status: WARN (likely seed data, but breaks lineage)

### Check D: Verified mentors missing primary specialty or hourly_rate

Query:

```sql
select id, name, specialties
from profiles
where role = 'mentor' and is_verified = true
  and (specialties is null or array_length(specialties, 1) = 0);

select id, name, hourly_rate
from profiles
where role = 'mentor' and is_verified = true
  and (hourly_rate is null or hourly_rate <= 0);
```

Actual:

- 4 verified mentors missing specialties
- 4 verified mentors missing hourly_rate (same set)

Status: WARN (may violate AC requirement for primary specialty and hourly rate)

---

## Issues Found

### Issue 1: Rating and review count out of sync

- Severity: Medium
- Table(s): profiles, reviews
- Evidence: profile id `81dce8b2-c2c6-486e-856c-b5645b2e68e9` has total_reviews=12, average_rating=4.9, but 0 reviews.
- Expected: reviews table should have 12 rows for that subject_id, or profile totals should be 0/null.
- Actual: profile totals populated without review rows.
- Impact: mentor list displays rating/reviews not backed by review data; affects trust and ordering accuracy.

### Issue 2: Verified mentors missing core display fields

- Severity: Low
- Table(s): profiles
- Evidence: 4 verified mentors have null specialties and null hourly_rate.
- Expected: verified mentors should have at least 1 specialty and a positive hourly_rate to meet card requirements.
- Actual: fields missing, UI shows 0/hr and no primary specialty.
- Impact: violates AC expectations for mentor card content; weakens discovery UX.

---

## Observations & Recommendations

Positive Findings:

- No verified mentors with null name.
- Rating values are within 1-5.
- Sorting by average_rating desc works with current data.

Areas of Concern:

- All reviews lack booking_id (lineage gap).

Recommendations:

1) Backfill or reconcile profile rating fields from reviews.
2) Enforce `hourly_rate > 0` and `specialties` non-empty for verified mentors (constraint or verification rule).
3) Ensure reviews created via booking flow always set booking_id.

---

## Decision Point

Result: INTEGRITY ISSUES

Action:

- Log Issue 1 as data integrity bug (rating mismatch).
- Log Issue 2 as data quality/UX issue (missing specialty/hourly_rate).
