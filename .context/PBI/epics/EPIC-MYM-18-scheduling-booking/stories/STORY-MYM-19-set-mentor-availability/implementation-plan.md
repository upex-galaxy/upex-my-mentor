# Implementation Plan: STORY-MYM-19 - Set Mentor Weekly Availability

## Overview

Implement the mentor availability configuration page at `/dashboard/mentor/availability` where mentors can set their weekly recurring availability slots.

**Acceptance Criteria to fulfill:**

- Mentor can access availability settings page from dashboard
- Mentor can set weekly recurring time slots (e.g., "Mondays 9-11 AM")
- Mentor can update existing availability (atomic delete + insert)
- Mentor can clear all availability slots
- Times are stored in UTC based on mentor's timezone
- Overlapping slots are validated and prevented

---

## Technical Approach

**What already exists:**
- ✅ Database table `mentor_availability` with schema (id, mentor_id, day_of_week, start_time, end_time, is_active)
- ✅ GET API `/api/mentors/[id]/availability` for fetching
- ✅ Types: `MentorAvailability` in `src/types/scheduling.ts`
- ✅ Some scheduling components (booking-calendar, time-slot-picker)

**What needs to be built:**
- ❌ Page at `/dashboard/mentor/availability`
- ❌ Server Action for atomic save (delete all + insert new)
- ❌ `AvailabilityCalendar` component for mentors to configure slots
- ❌ Navigation link in navbar/dashboard

**Chosen approach:** Server Actions with optimistic updates

**Alternatives considered:**
- API Routes: More boilerplate, less integrated with React 19
- Client-side mutations: Less secure, more complex error handling

**Why this approach:**
- ✅ Server Actions provide atomic operations with proper error handling
- ✅ Works seamlessly with React 19 `useTransition`
- ✅ Type-safe with Zod validation
- ❌ Trade-off: Slightly less cacheable than API routes

---

## UI/UX Design

**Design System:** `.context/design-system.md`
**Style:** Moderno/Bold (Morado Creativo)

### Components to use:

**From Design System:**
- ✅ `Card` - Container for calendar
- ✅ `Button` - Save/Cancel actions
- ✅ `Badge` - Day labels
- ✅ `Select` - Timezone picker

### Custom components to create:

**1. AvailabilityCalendar**
- **Purpose:** Weekly grid for mentors to configure availability
- **Location:** `src/components/scheduling/availability-calendar.tsx`
- **Design:** 7-column grid (Sun-Sat) with time rows

**2. TimeBlockEditor**
- **Purpose:** Modal/inline editor for time block (start/end time)
- **Location:** `src/components/scheduling/time-block-editor.tsx`

### Layout:

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Configura tu Disponibilidad" + [Guardar]       │
├─────────────────────────────────────────────────────────┤
│ Timezone: [Select: America/Mexico_City ▼]               │
├─────────────────────────────────────────────────────────┤
│ Weekly Calendar Grid:                                    │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐            │
│ │ Dom │ Lun │ Mar │ Mié │ Jue │ Vie │ Sáb │            │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │
│ │     │9-11 │     │14-17│     │10-12│     │            │
│ │     │     │     │     │     │     │     │            │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘            │
│                                                          │
│ [+ Agregar horario]                                      │
└─────────────────────────────────────────────────────────┘
```

### States:

- **Loading:** Skeleton grid with shimmer
- **Empty:** Empty calendar with "Haz clic para agregar tu primer horario"
- **Error:** Toast with retry
- **Saving:** Button disabled with spinner

---

## Types & Type Safety

**Existing types to use:**
```typescript
// From src/types/scheduling.ts
export interface MentorAvailability {
  id: string
  mentor_id: string
  day_of_week: number  // 0-6 (Sunday-Saturday)
  start_time: string   // HH:MM format
  end_time: string     // HH:MM format
  is_active: boolean
  created_at: string
  updated_at: string
}
```

**New types to add:**
```typescript
// For the form/component state
export interface AvailabilitySlot {
  id?: string           // Optional for new slots
  day_of_week: number
  start_time: string
  end_time: string
}

// For the save action
export interface SaveAvailabilityInput {
  slots: AvailabilitySlot[]
  timezone: string
}

// Props for the calendar component
export interface AvailabilityCalendarProps {
  mentorId: string
  initialSlots: MentorAvailability[]
  mentorTimezone?: string
}
```

---

## Implementation Steps

### **Step 1: Add Types & Validation Schema**

**Task:** Extend `src/types/scheduling.ts` with new types and create Zod schema

**Files:**
- `src/types/scheduling.ts` - Add new interfaces
- `src/lib/validations/availability.ts` - Zod schema

**Details:**
- Add `AvailabilitySlot` and `SaveAvailabilityInput` interfaces
- Create Zod schema for validation:
  - day_of_week: 0-6
  - start_time/end_time: HH:MM format
  - Validate end_time > start_time
  - Validate no overlapping slots on same day

**Estimated time:** 30 min

---

### **Step 2: Create Server Action for Saving Availability**

**Task:** Atomic save operation (delete all existing + insert new)

**File:** `src/lib/actions/availability.ts`

**Logic:**
1. Validate user is authenticated and is a mentor
2. Validate input with Zod schema
3. Check for overlapping slots
4. Begin transaction:
   - Delete all existing availability for mentor
   - Insert new slots
5. Return success or error

**Edge cases:**
- Empty slots array = clear all availability (allowed)
- Invalid time format = validation error
- Overlapping slots = validation error before save

**Estimated time:** 1 hour

---

### **Step 3: Create AvailabilityCalendar Component**

**Task:** Weekly calendar UI for setting availability

**File:** `src/components/scheduling/availability-calendar.tsx`

**Structure:**
- 7-column grid for days of week
- Each day shows list of time blocks
- Click to add/edit/remove blocks
- Visual feedback for overlaps

**Features:**
- Add new time block
- Edit existing block (click to modify)
- Delete block (X button)
- Visual overlap detection

**Estimated time:** 2 hours

---

### **Step 4: Create TimeBlockEditor Component**

**Task:** Inline editor for time blocks

**File:** `src/components/scheduling/time-block-editor.tsx`

**Structure:**
- Start time selector (30-min increments)
- End time selector (30-min increments)
- Save/Cancel buttons

**Features:**
- Default 1-hour duration
- Prevent end < start
- Close on save or cancel

**Estimated time:** 1 hour

---

### **Step 5: Create Availability Page**

**Task:** Dashboard page at `/dashboard/mentor/availability`

**File:** `src/app/dashboard/mentor/availability/page.tsx`

**Structure:**
- Server component that fetches initial data
- Uses `AvailabilityCalendar` client component
- Protected by middleware (mentor only)

**Details:**
- Fetch mentor's existing availability
- Fetch mentor's timezone from profile
- Pass to client component

**Estimated time:** 45 min

---

### **Step 6: Add Navigation Link**

**Task:** Add link to availability page in navbar/dashboard

**Files:**
- `src/components/layout/navbar.tsx` - Add link for mentors
- Update sidebar if exists

**Details:**
- Show "Disponibilidad" link for mentor role
- Use Calendar icon from lucide-react

**Estimated time:** 15 min

---

### **Step 7: Integration & Testing**

**Task:** Connect all components and test

**Flow:**
1. Mentor navigates to `/dashboard/mentor/availability`
2. Page loads existing slots
3. Mentor adds/edits/removes slots
4. Mentor clicks "Guardar"
5. Server Action validates and saves atomically
6. UI updates optimistically

**Manual Testing:**
- Create new availability
- Update existing availability
- Clear all availability
- Verify persistence after refresh

**Estimated time:** 45 min

---

## Technical Decisions

### Decision 1: Time storage format

**Chosen:** Store times as `time` type in DB (already exists)

**Reasoning:**
- ✅ PostgreSQL `time` type handles time-only data correctly
- ✅ No timezone conversion issues for recurring weekly slots
- ❌ Trade-off: Timezone must be stored separately in mentor profile

### Decision 2: Timezone handling

**Chosen:** Store mentor's timezone in profile, display times in that timezone

**Reasoning:**
- ✅ Mentor sees times in their local timezone
- ✅ Mentees see converted times based on their timezone
- ❌ Trade-off: Need to ensure profile has timezone field

---

## Dependencies

**Pre-requisites:**
- [x] Database table `mentor_availability` exists
- [x] GET API for fetching availability exists
- [ ] Mentor profile should have timezone field (may need migration)

---

## Risks & Mitigations

**Risk 1:** Timezone field missing from mentor profile
- **Impact:** Medium
- **Mitigation:** Default to browser timezone, add migration if needed

**Risk 2:** Race condition on save
- **Impact:** Low
- **Mitigation:** Atomic transaction handles this

---

## Estimated Effort

| Step                        | Time    |
|-----------------------------|---------|
| 1. Types & Validation       | 30 min  |
| 2. Server Action            | 1 hour  |
| 3. AvailabilityCalendar     | 2 hours |
| 4. TimeBlockEditor          | 1 hour  |
| 5. Availability Page        | 45 min  |
| 6. Navigation Link          | 15 min  |
| 7. Integration & Testing    | 45 min  |
| **Total**                   | **6 hours** |

**Story points:** 5 (matches estimate in story.md)

---

## Definition of Done Checklist

- [ ] Page `/dashboard/mentor/availability` accessible
- [ ] Mentor can view existing availability
- [ ] Mentor can add new time slots
- [ ] Mentor can edit existing time slots
- [ ] Mentor can remove time slots
- [ ] Mentor can save changes (atomic operation)
- [ ] Overlapping slots prevented with clear error message
- [ ] Empty availability (no slots) allowed
- [ ] Navigation link added in navbar for mentors
- [ ] Types properly defined and used
- [ ] Zod validation working
- [ ] `bun run lint` passes
- [ ] `bun run build` passes
- [ ] Manual smoke test on staging
  - [ ] Desktop view works
  - [ ] Mobile view works

---

**Generated by:** Claude Code
**Date:** 2025-12-27
