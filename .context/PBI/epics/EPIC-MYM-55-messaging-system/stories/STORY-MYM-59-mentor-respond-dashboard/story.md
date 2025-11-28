# STORY-MYM-59: Mentor Respond to Messages from Dashboard

**Jira Key:** MYM-59
**Epic:** MYM-55 - Messaging System
**Status:** To Do
**Priority:** Medium
**Story Points:** 5

---

## User Story

As a Mentor, I want to respond to messages from my dashboard so that I can manage inquiries efficiently

---

## Description

Mentors need a convenient way to manage incoming messages from potential mentees directly from their dashboard. This includes a widget showing recent messages and the ability to respond quickly without navigating away from the dashboard. This improves mentor response rates and overall platform engagement.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Dashboard messages widget

* **Given:** I am a logged-in mentor on my dashboard
* **When:** I view my dashboard
* **Then:** I should see a "Recent Messages" widget
* **And:** It should show up to 5 most recent conversations
* **And:** Each should show mentee name, last message preview, and time

### Scenario 2: Quick reply from dashboard

* **Given:** I am viewing the Recent Messages widget
* **When:** I click on a conversation
* **Then:** I should be able to view the full conversation
* **And:** I should be able to compose and send a reply

### Scenario 3: Reply functionality

* **Given:** I am viewing a conversation with a mentee
* **When:** I type a message and click "Send"
* **Then:** The message should be sent to the mentee
* **And:** The message should appear in the conversation immediately
* **And:** The mentee should receive a notification

### Scenario 4: View all messages link

* **Given:** I am viewing the Recent Messages widget
* **When:** I click "View All Messages"
* **Then:** I should be navigated to my full messages inbox

### Scenario 5: Conversation context

* **Given:** I am responding to a mentee's message
* **When:** I view the conversation
* **Then:** I should see the mentee's profile summary (name, avatar)
* **And:** I should have a link to view their full profile

### Scenario 6: Empty widget state

* **Given:** I am a mentor with no messages
* **When:** I view my dashboard
* **Then:** The Recent Messages widget should show an empty state
* **And:** I should see a message like "No messages yet. Your inquiries will appear here."

---

## Technical Notes

* Create `RecentMessagesWidget` component for mentor dashboard
* Implement inline reply or modal reply functionality
* Add link to mentee profile from conversation view
* Reuse conversation components from MYM-57
* Ensure RLS policies allow mentors to respond to conversations
* Widget should auto-refresh or use Realtime subscription

### Component Structure

```tsx
// RecentMessagesWidget.tsx
<Card>
  <CardHeader>
    <CardTitle>Recent Messages</CardTitle>
    <Badge>{unreadCount}</Badge>
  </CardHeader>
  <CardContent>
    {conversations.slice(0, 5).map(conv => (
      <ConversationPreview
        key={conv.id}
        conversation={conv}
        onClick={() => openConversation(conv.id)}
      />
    ))}
    {conversations.length === 0 && <EmptyState />}
  </CardContent>
  <CardFooter>
    <Link href="/dashboard/messages">View All Messages</Link>
  </CardFooter>
</Card>
```

---

## Out of Scope

* Canned responses / templates
* Message scheduling
* Bulk reply functionality
* Auto-replies

---

## Definition of Done

* [ ] RecentMessagesWidget component created
* [ ] Widget displays up to 5 recent conversations
* [ ] Each conversation shows mentee info, last message, timestamp
* [ ] Click opens conversation view
* [ ] Reply functionality working
* [ ] "View All Messages" link navigates to inbox
* [ ] Empty state implemented
* [ ] Link to mentee profile available
* [ ] Unit tests achieve > 80% coverage
* [ ] Integration tests verify widget functionality
* [ ] E2E tests cover dashboard messaging flow
* [ ] Code review completed and approved
* [ ] Deployed to staging environment

---

## Dependencies

* **MYM-56:** Send message functionality (database schema)
* **MYM-57:** Conversation history view (reusable components)
* **MYM-58:** Notifications (mentee receives notification when mentor replies)

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-59-mentor-respond-dashboard/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-59-mentor-respond-dashboard/implementation-plan.md`
* **Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-59
