# STORY-MYM-58: Receive Notifications for New Messages

**Jira Key:** MYM-58
**Epic:** MYM-55 - Messaging System
**Status:** To Do
**Priority:** Medium
**Story Points:** 5

---

## User Story

As a User, I want to receive notifications when I get a new message so that I can respond promptly

---

## Description

Users need to be notified in real-time when they receive new messages so they can respond promptly without constantly checking their inbox. This feature includes in-app notification badges and toast notifications to keep users informed of new messages while using the platform.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: In-app notification badge

* **Given:** I am logged in and have unread messages
* **When:** I am on any page of the application
* **Then:** I should see a notification badge on the messages icon in the navbar
* **And:** The badge should show the count of unread messages

### Scenario 2: Real-time notification update

* **Given:** I am logged in and viewing the application
* **When:** I receive a new message
* **Then:** The notification badge should update in real-time without page refresh
* **And:** I should see a toast notification with the sender's name and message preview

### Scenario 3: Toast notification behavior

* **Given:** I receive a new message notification toast
* **When:** I click on the toast
* **Then:** I should be navigated to that conversation
* **When:** I ignore the toast
* **Then:** It should auto-dismiss after 5 seconds

### Scenario 4: Notification when in conversation

* **Given:** I am viewing a conversation with User A
* **When:** User B sends me a message
* **Then:** I should see a notification for User B's message
* **When:** User A sends me a message
* **Then:** The message should appear in the conversation without a separate notification

### Scenario 5: Badge count accuracy

* **Given:** I have unread messages across multiple conversations
* **When:** I read messages in one conversation
* **Then:** The badge count should decrease accordingly
* **When:** All messages are read
* **Then:** The badge should disappear

---

## Technical Notes

* Add messages icon with badge to Navbar component
* Implement Supabase Realtime subscription for new messages
* Create toast notification component (use existing shadcn/ui Toast or create custom)
* Store unread count in auth context or dedicated messages context
* Subscribe to messages table changes filtered by recipient

### Realtime Subscription

```typescript
// Subscribe to new messages for current user
const channel = supabase
  .channel('new-messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=in.(${userConversationIds.join(',')})`,
    },
    (payload) => {
      if (payload.new.sender_id !== currentUserId) {
        // Show toast notification
        // Update badge count
      }
    }
  )
  .subscribe();
```

### Components

* `NotificationBadge` - Shows unread count on messages icon
* `MessageToast` - Toast notification for new messages
* `MessagesIcon` - Icon in navbar with badge

---

## Out of Scope

* Email notifications
* Push notifications (browser/mobile)
* Notification preferences/settings
* Do not disturb mode
* Sound notifications

---

## Definition of Done

* [ ] Messages icon added to navbar with notification badge
* [ ] Badge shows accurate unread count
* [ ] Supabase Realtime subscription implemented
* [ ] Toast notifications shown for new messages
* [ ] Toast click navigates to conversation
* [ ] Toast auto-dismisses after 5 seconds
* [ ] Badge updates in real-time
* [ ] Badge count decreases when messages are read
* [ ] Unit tests achieve > 80% coverage
* [ ] Integration tests verify realtime functionality
* [ ] E2E tests cover notification flow
* [ ] Code review completed and approved
* [ ] Deployed to staging environment

---

## Dependencies

* **MYM-56:** Database schema for messages
* **MYM-57:** Conversation history for navigation

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-58-message-notifications/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-58-message-notifications/implementation-plan.md`
* **Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-58
