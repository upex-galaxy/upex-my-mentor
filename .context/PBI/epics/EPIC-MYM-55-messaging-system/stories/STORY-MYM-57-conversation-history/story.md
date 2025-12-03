# STORY-MYM-57: View Conversation History

**Jira Key:** MYM-57
**Epic:** MYM-55 - Messaging System
**Status:** To Do
**Priority:** Medium
**Story Points:** 5

---

## User Story

As a User, I want to view my conversation history so that I can follow up on previous discussions

---

## Description

Users (both mentors and mentees) need a centralized place to view all their conversations and access the full message history with each contact. This enables ongoing communication and allows users to reference previous discussions when preparing for sessions or following up afterwards.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Access conversations list

* **Given:** I am a logged-in user
* **When:** I navigate to my messages/inbox
* **Then:** I should see a list of all my conversations
* **And:** Each conversation should show the other user's name and avatar
* **And:** Each conversation should show the last message preview
* **And:** Each conversation should show the timestamp of the last message

### Scenario 2: View conversation thread

* **Given:** I am viewing my conversations list
* **When:** I click on a conversation
* **Then:** I should see the full message history with that user
* **And:** Messages should be displayed in chronological order
* **And:** My messages should be visually distinct from their messages
* **And:** Each message should show its timestamp

### Scenario 3: Conversation ordering

* **Given:** I have multiple conversations
* **When:** I view my conversations list
* **Then:** Conversations should be ordered by most recent activity first

### Scenario 4: Empty state

* **Given:** I am a new user with no conversations
* **When:** I navigate to my messages
* **Then:** I should see a friendly empty state
* **And:** I should see guidance on how to start a conversation (e.g., "Browse mentors to start a conversation")

### Scenario 5: Unread indicator

* **Given:** I have unread messages in a conversation
* **When:** I view my conversations list
* **Then:** That conversation should have an unread indicator (badge/dot)
* **And:** The indicator should disappear when I view the conversation

---

## Technical Notes

* Create conversations list page at `/dashboard/messages`
* Implement conversation detail view at `/dashboard/messages/[conversationId]`
* Query conversations with last message using Supabase joins
* Track read/unread status in database (update `is_read` when viewing)
* Implement infinite scroll or pagination for long conversations (20 messages per page)
* Use optimistic UI updates for better UX

### API Queries

```typescript
// Get conversations list with last message
const { data } = await supabase
  .from('conversations')
  .select(`
    *,
    participant_1:profiles!participant_1_id(*),
    participant_2:profiles!participant_2_id(*),
    messages(content, created_at, is_read, sender_id)
  `)
  .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
  .order('updated_at', { ascending: false });

// Get messages for a conversation
const { data } = await supabase
  .from('messages')
  .select('*, sender:profiles!sender_id(*)')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true })
  .range(offset, offset + limit);
```

---

## Out of Scope

* Search within conversations
* Conversation archiving
* Conversation deletion
* Message reactions

---

## Definition of Done

* [ ] Conversations list page created at `/dashboard/messages`
* [ ] Conversation detail page created at `/dashboard/messages/[conversationId]`
* [ ] Conversations ordered by most recent activity
* [ ] Last message preview shown in list
* [ ] Unread indicator working correctly
* [ ] Empty state implemented
* [ ] Pagination/infinite scroll for long conversations
* [ ] Unit tests achieve > 80% coverage
* [ ] Integration tests verify data fetching
* [ ] E2E tests cover navigation and viewing
* [ ] Code review completed and approved
* [ ] Deployed to staging environment

---

## Dependencies

* **MYM-56:** Database schema for conversations and messages

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-57-conversation-history/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-57-conversation-history/implementation-plan.md`
* **Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-57
