# Product Backlog - Epic Tree

## Overview

This document provides a high-level view of all epics in the Upex My Mentor MVP. The structure reflects the actual epics and stories currently in Jira (Project MYM).

**Total Epics:** 8
**Total User Stories:** 31
**Source of Truth:** Jira Project MYM (https://upexgalaxy61.atlassian.net/jira/software/c/projects/MYM/boards/27)

---

## Epic Hierarchy

### 🔐 EPIC 1: User Authentication & Profiles
**Jira Key:** MYM-2
**Status:** ASSIGNED
**Priority:** CRITICAL (Foundation)
**Description:** Foundational features for user identity and management. Allows users to create accounts, sign in, and manage their public-facing profiles.

**User Stories (5):**
1. **MYM-3** - As a new user, I want to sign up with my email and password so that I can create an account
2. **MYM-4** - As a user, I want to log in and log out so that I can securely access my account
3. **MYM-5** - As a Mentee, I want to create a basic profile with my name and a short bio so that mentors know who I am
4. **MYM-6** - As a Mentor, I want to create a detailed profile including my skills, experience, hourly rate, and a bio so that I can attract mentees
5. **MYM-7** - As a user, I want to be able to reset my password so that I can regain access if I forget it

**Related Functional Requirements:** FR-001, FR-002, FR-003, FR-004, FR-005

---

### ✅ EPIC 2: Mentor Vetting & Onboarding
**Jira Key:** MYM-8
**Status:** ASSIGNED
**Priority:** HIGH (Quality Control)
**Description:** Establishes the quality control process for mentors. Provides administrators with tools to review and manage mentor applications, ensuring only qualified and vetted professionals are available on the marketplace.

**User Stories (4):**
1. **MYM-9** - As an Admin, I want to view a list of pending mentor applications so that I can manage the vetting pipeline
2. **MYM-10** - As an Admin, I want to review an individual mentor's application details so that I can assess their qualifications
3. **MYM-11** - As an Admin, I want to approve or reject a mentor application so that I can maintain the quality of the marketplace
4. **MYM-12** - As a Mentor, I want to receive an email notification about the status of my application so that I know if I've been accepted

**Related Functional Requirements:** FR-005 (LinkedIn/GitHub validation)
**Note:** This epic adds administrative controls not explicitly in original PRD but essential for the "verified mentors" value proposition.

---

### 🔍 EPIC 3: Mentor Discovery & Search
**Jira Key:** MYM-13
**Status:** ASSIGNED
**Priority:** CRITICAL (Core Marketplace)
**Description:** Core marketplace experience for mentees: finding the right mentor. Includes features for browsing, searching, and filtering the list of available, approved mentors.

**User Stories (4):**
1. **MYM-14** - As a Mentee, I want to see a gallery of all available mentors so that I can browse my options
2. **MYM-15** - As a Mentee, I want to search for mentors by keyword so that I can find relevant experts
3. **MYM-16** - As a Mentee, I want to filter mentors by their skills or technologies so that I can narrow down my search
4. **MYM-17** - As a Mentee, I want to view a mentor's detailed public profile so that I can decide if they are a good fit for me

**Related Functional Requirements:** FR-006, FR-007, FR-008

---

### 📅 EPIC 4: Scheduling & Booking
**Jira Key:** MYM-18
**Status:** ASSIGNED
**Priority:** CRITICAL (Core Transaction)
**Description:** Enables the core transaction of the marketplace: booking a session. Allows mentors to define their availability and enables mentees to select a time slot and book it.

**User Stories (4):**
1. **MYM-19** - As a Mentor, I want to set my weekly availability on a calendar so that mentees know when I am available to book
2. **MYM-20** - As a Mentee, I want to see a mentor's availability in my own timezone so that I can avoid confusion
3. **MYM-21** - As a Mentee, I want to select an open time slot and book a one-hour session so that I can schedule my mentorship
4. **MYM-22** - As a user, I want to receive an email confirmation and a calendar invite for my booked session so that I don't miss it

**Related Functional Requirements:** FR-009, FR-010, FR-011

---

### 💳 EPIC 5: Payments & Payouts
**Jira Key:** MYM-23
**Status:** ASSIGNED
**Priority:** CRITICAL (Revenue Model)
**Description:** Handles the complete financial lifecycle of a transaction on the platform. Includes processing mentee payments for sessions and managing subsequent payouts to mentors.

**User Stories (4):**
1. **MYM-24** - As a Mentee, I want to securely enter my credit card details at checkout so that I can pay for a session
2. **MYM-25** - As a Mentor, I want to connect my bank account (via Stripe Connect) so that I can receive payouts
3. **MYM-26** - As a Mentor, I want to see a record of my earnings so that I can track my income from the platform
4. **MYM-27** - As the System, I want to automatically process a payout to the mentor after a 24-hour grace period post-session

**Related Functional Requirements:** FR-016, FR-017, FR-018

---

### 📋 EPIC 6: Session Management
**Jira Key:** MYM-28
**Status:** ASSIGNED
**Priority:** HIGH (UX Critical)
**Description:** Provides users with tools to manage their sessions after booking. Includes a dashboard to view their schedule and the ability to cancel a session under specific conditions.

**User Stories (3):**
1. **MYM-29** - As a user, I want a simple dashboard where I can see my upcoming and past sessions so that I can manage my schedule
2. **MYM-30** - As a user, I want to be able to join a video call for my session (via a provided link) so that we can communicate
3. **MYM-31** - As a user, I want to be able to cancel a session up to 24 hours in advance so that I have flexibility

**Related Functional Requirements:** FR-012 (video call link)
**Note:** This epic enhances UX with session lifecycle management not explicitly detailed in original PRD.

---

### ⭐ EPIC 7: Reputation & Reviews System
**Jira Key:** MYM-32
**Status:** ASSIGNED
**Priority:** CRITICAL (Trust Mechanism)
**Description:** Establishes a bidirectional reputation system that builds trust in the marketplace. Enables both mentees and mentors to provide feedback after sessions, creating a transparent history of interactions.

**User Stories (3):**
1. **MYM-33** - As a Mentee, I want to rate and leave a comment about my mentor after a session so that I can share my experience
2. **MYM-34** - As a Mentor, I want to rate and leave a comment about my mentee after a session so that I can provide feedback and build trust
3. **MYM-35** - As a user, I want to view ratings and reviews on user profiles so that I can make informed decisions

**Related Functional Requirements:** FR-013, FR-014, FR-015
**Note:** This epic was missing from initial Jira backlog but is CRITICAL per Business Model Canvas (trust-building mechanism).

---

### 💬 EPIC 8: Messaging System
**Jira Key:** MYM-55
**Status:** ASSIGNED
**Priority:** HIGH (Enhanced UX)
**Description:** Enables direct communication between mentors and mentees within the platform. Addresses the need for pre-booking conversations and post-session follow-ups, which are essential for building trust and reducing booking friction.

**User Stories (4):**
1. **MYM-56** - As a Mentee, I want to send a message to a mentor before booking so that I can clarify doubts
2. **MYM-57** - As a User, I want to view my conversation history so that I can follow up on previous discussions
3. **MYM-58** - As a User, I want to receive notifications when I get a new message so that I can respond promptly
4. **MYM-59** - As a Mentor, I want to respond to messages from my dashboard so that I can manage inquiries efficiently

**Related Functional Requirements:** FR-NEW-001, FR-NEW-002, FR-NEW-003
**Note:** Post-MVP enhancement. Industry standard feature (MentorCruise, Clarity.fm). Reduces booking friction and increases platform engagement.

---

## Epic Prioritization

### Phase 1: Foundation (Sprint 1-2)
1. **User Authentication & Profiles** (MYM-2) - Must complete first
2. **Mentor Vetting & Onboarding** (MYM-8) - Required before mentors can appear in marketplace

### Phase 2: Core Marketplace (Sprint 3-4)
3. **Mentor Discovery & Search** (MYM-13) - Core user journey
4. **Scheduling & Booking** (MYM-18) - Core transaction

### Phase 3: Financial & Trust (Sprint 5-6)
5. **Payments & Payouts** (MYM-23) - Revenue model
6. **Reputation & Reviews System** (MYM-32) - Trust mechanism

### Phase 4: Enhanced UX (Sprint 7-8)
7. **Session Management** (MYM-28) - Lifecycle management
8. **Messaging System** (MYM-55) - Direct communication between users

---

## Mapping to Original PRD

| Original PRD Epic | Jira Epic | Status |
|------------------|-----------|---------|
| EPIC-UPEX-001: Autenticación y Perfiles | MYM-2: User Authentication & Profiles | ✅ Mapped |
| EPIC-UPEX-002: Búsqueda y Descubrimiento | MYM-13: Mentor Discovery & Search | ✅ Mapped |
| EPIC-UPEX-003: Booking y Gestión de Sesiones | MYM-18: Scheduling & Booking + MYM-28: Session Management | ✅ Expanded (2 epics) |
| EPIC-UPEX-004: Reputación y Feedback | MYM-32: Reputation & Reviews System | ✅ Added to Jira |
| EPIC-UPEX-005: Procesamiento de Pagos | MYM-23: Payments & Payouts | ✅ Mapped |
| N/A (Not in PRD) | MYM-8: Mentor Vetting & Onboarding | ✅ New (Quality Control) |
| N/A (Not in PRD) | MYM-55: Messaging System | ✅ New (Enhanced UX) |

**Total:** 5 original PRD epics expanded to 8 comprehensive Jira epics with enhanced scope.

---

## Next Steps

For each epic, the following documentation will be created in `.context/PBI/epics/`:

1. **epic.md** - Full epic description, scope, and acceptance criteria (FASE 2)
2. **feature-test-plan.md** - High-level test strategy for the epic (FASE 4)
3. **feature-implementation-plan.md** - Technical approach and architecture decisions (FASE 5)
4. **stories/** folder - Individual story documentation with test cases and implementation plans

**Status:** Epic tree defined ✅
**Next Phase:** Generate detailed epic documentation (epic.md for each epic)
