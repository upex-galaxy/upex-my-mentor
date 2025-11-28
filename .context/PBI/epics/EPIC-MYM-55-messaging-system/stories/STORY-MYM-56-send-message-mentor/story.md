# STORY-MYM-56: Send Message to Mentor Before Booking

**Jira Key:** MYM-56
**Epic:** MYM-55 - Messaging System
**Status:** To Do
**Priority:** High
**Story Points:** 8

---

## User Story

As a Mentee, I want to send a message to a mentor before booking so that I can clarify doubts

---

## Description

A mentee viewing a mentor's profile should be able to send them a direct message without having to book a session first. This allows potential mentees to ask questions about the mentor's expertise, availability, or approach before committing financially. This feature reduces booking friction and increases trust between mentor and mentee.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Access messaging from mentor profile

* **Given:** I am a logged-in mentee viewing a mentor's profile
* **When:** I click on the "Send Message" button
* **Then:** I should see a message composition interface

### Scenario 2: Compose and send a message

* **Given:** I am in the message composition interface
* **When:** I write a message (minimum 10 characters) and click "Send"
* **Then:** The message should be sent to the mentor
* **And:** I should see a confirmation that my message was sent
* **And:** The message should appear in my conversation history

### Scenario 3: View sent messages

* **Given:** I have sent a message to a mentor
* **When:** I navigate to my messages/conversations
* **Then:** I should see the conversation with that mentor
* **And:** I should see my sent message with timestamp

### Scenario 4: Message validation

* **Given:** I am composing a message
* **When:** I try to send an empty message or one with less than 10 characters
* **Then:** I should see a validation error
* **And:** The message should not be sent

### Scenario 5: Unauthenticated user

* **Given:** I am not logged in and viewing a mentor's profile
* **When:** I click the "Send Message" button
* **Then:** I should be redirected to the login page
* **And:** After logging in, I should return to the mentor's profile

---

## Technical Notes

* Create `conversations` table to track message threads between users
* Create `messages` table with foreign keys to users and conversations
* Implement Supabase Realtime subscription for new messages
* Add "Send Message" CTA button to mentor profile page (`/mentors/[id]`)
* Create message composition modal/drawer component
* Implement RLS policies to ensure users can only access their own conversations

### Database Schema

```sql
-- conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID REFERENCES profiles(id) NOT NULL,
  participant_2_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id)
);

-- messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 10),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Out of Scope

* File attachments
* Message editing after send
* Message deletion
* Rich text formatting
* Typing indicators

---

## Definition of Done

* [ ] Database migrations created for `conversations` and `messages` tables
* [ ] RLS policies implemented and tested
* [ ] "Send Message" button added to mentor profile page
* [ ] Message composition modal/drawer implemented
* [ ] Message validation (min 10 characters) working
* [ ] Message successfully creates conversation and stores message
* [ ] Confirmation UI shown after message sent
* [ ] Unit tests achieve > 80% coverage
* [ ] Integration tests verify message creation
* [ ] E2E tests cover full message flow
* [ ] Code review completed and approved
* [ ] Deployed to staging environment

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-56-send-message-mentor/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-56-send-message-mentor/implementation-plan.md`
* **Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-56
