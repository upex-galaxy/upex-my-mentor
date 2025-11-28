# EPIC-008: Messaging System

**Jira Key:** MYM-55
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Enhanced UX (Post-MVP)

---

## Epic Description

This epic enables direct communication between mentors and mentees within the platform. It addresses the need for pre-booking conversations and post-session follow-ups, which are essential for building trust and reducing booking friction in the marketplace.

**Business Value:**
Communication is a critical component of successful mentorship platforms:
- Enables mentees to clarify doubts before committing to a session
- Allows mentors to understand mentee needs and prepare accordingly
- Builds ongoing relationships beyond single sessions
- Industry standard feature (MentorCruise, Clarity.fm, Codementor all have messaging)

Without messaging, users rely on external communication channels, reducing platform stickiness and losing valuable interaction data.

---

## User Stories

1. **MYM-56** - As a Mentee, I want to send a message to a mentor before booking so that I can clarify doubts
2. **MYM-57** - As a User, I want to view my conversation history so that I can follow up on previous discussions
3. **MYM-58** - As a User, I want to receive notifications when I get a new message so that I can respond promptly
4. **MYM-59** - As a Mentor, I want to respond to messages from my dashboard so that I can manage inquiries efficiently

---

## Scope

### In Scope
- **Direct Messaging:**
  - One-on-one messaging between mentor and mentee
  - Message composition interface
  - Message validation (minimum characters)
  - Real-time message delivery via Supabase Realtime

- **Conversation History:**
  - Conversations list view
  - Conversation thread view
  - Chronological message ordering
  - Read/unread status tracking

- **Notifications:**
  - In-app notification badge on messages icon
  - Real-time badge updates
  - Toast notifications for new messages
  - Unread message count

- **Mentor Dashboard Integration:**
  - Recent Messages widget
  - Quick reply functionality
  - Link to full inbox

### Out of Scope (Future)
- Group messaging
- File/attachment sharing
- Video messages
- Message scheduling
- Email notifications
- Push notifications (browser/mobile)
- Canned responses / templates
- Message search within conversations
- Message editing after send
- Message deletion
- Rich text formatting

---

## Acceptance Criteria (Epic Level)

1. Mentees can send messages to mentors from their profile page
2. Users can view their conversation history
3. Messages are delivered in real-time without page refresh
4. Users receive in-app notifications for new messages
5. Notification badge shows accurate unread count
6. Mentors can view and respond to messages from their dashboard
7. All message data is stored securely in database
8. Mobile-responsive design for all messaging interfaces
9. Messages are associated with correct users (no cross-contamination)
10. Page loads in <2 seconds with 100 messages

---

## Related Functional Requirements

This epic extends the platform with new functionality not covered in the original PRD/SRS, but aligned with the business model of connecting mentors with mentees.

**New FRs to document:**
- **FR-NEW-001:** The system shall allow users to send direct messages to other users
- **FR-NEW-002:** The system shall display conversation history to users
- **FR-NEW-003:** The system shall notify users of new messages in real-time

---

## Technical Considerations

### Database Schema

**conversations table:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID REFERENCES profiles(id) NOT NULL,
  participant_2_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id)
);
```

**messages table:**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 10),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Users can only see conversations they're part of
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Users can only see messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );

-- Users can only send messages in their conversations
CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );
```

### Supabase Realtime

- Subscribe to `messages` table for real-time updates
- Filter by conversation_id or recipient_id
- Use `broadcast` channel for typing indicators (optional)

### API Endpoints

- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/:id` - Get conversation with messages
- `POST /api/conversations` - Create new conversation
- `POST /api/conversations/:id/messages` - Send message
- `PATCH /api/messages/:id/read` - Mark message as read

### Frontend Components

- `MessageButton` - CTA button on mentor profile
- `MessageComposer` - Message input with validation
- `ConversationList` - List of conversations
- `ConversationThread` - Full conversation view
- `MessageBubble` - Individual message display
- `MessagesWidget` - Dashboard widget for mentors
- `NotificationBadge` - Unread count indicator
- `MessageToast` - New message notification

---

## Dependencies

### External Dependencies
- Supabase Realtime (already configured)

### Internal Dependencies
- **EPIC-MYM-2 (User Authentication):** Required
  - Users must be logged in to send/receive messages
- **EPIC-MYM-13 (Mentor Discovery):** Required
  - Message button appears on mentor profile

### Blocks
- None (this is an enhancement epic)

---

## Success Metrics

### Functional Metrics
- Messages delivered in <500ms (real-time)
- Notification badge updates in <200ms
- Conversation list loads in <1 second
- 0 message delivery failures

### Business Metrics
- 40% of mentees send a message before first booking
- Average 2+ messages exchanged per booking
- Mentor response rate within 24 hours: >80%
- 30% of bookings preceded by messaging

### UX Metrics
- <5% users report messaging issues
- Average conversation has 4+ messages
- 60% of messages are read within 1 hour

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Spam/abuse via messaging | High | Medium | Rate limiting, report feature, content moderation |
| Real-time not working reliably | Medium | Low | Fallback to polling, robust reconnection logic |
| Message delivery failures | High | Low | Retry mechanism, delivery receipts, error handling |
| Performance with many messages | Medium | Medium | Pagination, lazy loading, database indexes |
| Privacy concerns | High | Low | Clear privacy policy, RLS policies, data encryption |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-MYM-55-messaging-system/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** Message validation, notification logic (>90% coverage)
- **Integration Tests:** API endpoints, Supabase Realtime subscriptions
- **E2E Tests:** Full messaging flow from mentor profile to conversation
- **Performance Tests:** Message delivery latency, concurrent users
- **Security Tests:** RLS policies, authentication checks

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-MYM-55-messaging-system/feature-implementation-plan.md`

### Recommended Story Order
1. **MYM-56** (Send message) - Foundation, database schema, basic UI
2. **MYM-57** (Conversation history) - Build on foundation, add list/detail views
3. **MYM-58** (Notifications) - Add real-time features
4. **MYM-59** (Mentor dashboard) - Integration with existing dashboard

### Estimated Effort
- **Development:** 2-3 sprints (4-6 weeks)
- **Testing:** 0.5 sprint (1 week)
- **Total:** 3-4 sprints
- **Story Points Total:** 23 (8 + 5 + 5 + 5)

---

## Design Considerations

### Message Button on Mentor Profile
```
┌────────────────────────────────┐
│ [Photo] Maria Garcia  $85/hr   │
│         ★★★★★ 4.9 (47)         │
│                                │
│ [  Send Message  ] [  Book  ]  │
└────────────────────────────────┘
```

### Conversations List Design
```
┌──────────────────────────────────┐
│ Messages                    (3)  │
├──────────────────────────────────┤
│ [Avatar] Maria Garcia       2m   │
│ Thanks for your question...      │
│ ● (unread indicator)             │
├──────────────────────────────────┤
│ [Avatar] Carlos Tech       1h    │
│ Looking forward to our session   │
├──────────────────────────────────┤
│ [Avatar] Ana Developer     2d    │
│ Great session yesterday!         │
└──────────────────────────────────┘
```

### Conversation Thread Design
```
┌──────────────────────────────────┐
│ ← Maria Garcia                   │
├──────────────────────────────────┤
│        Hi, I'm interested in     │
│        learning React. Do you    │
│        cover hooks?         10:30│
│                                  │
│ Yes! I specialize in             │
│ modern React with hooks.         │
│ What's your current level?       │
│ 10:32                            │
│                                  │
│        I'm a beginner, just      │
│        finished a bootcamp  10:35│
├──────────────────────────────────┤
│ [Type a message...        ] [↑]  │
└──────────────────────────────────┘
```

### Dashboard Widget Design
```
┌──────────────────────────────────┐
│ Recent Messages             (3)  │
├──────────────────────────────────┤
│ [Avatar] New inquiry from Juan   │
│ "Hi, I need help with..."   [↗]  │
├──────────────────────────────────┤
│ [Avatar] Reply to Laura          │
│ "Thanks for the session..."  [↗] │
├──────────────────────────────────┤
│ [View All Messages →]            │
└──────────────────────────────────┘
```

---

## Notes

- Consider rate limiting to prevent spam (e.g., max 10 messages/hour to new contacts)
- Add "Report" button for inappropriate messages in v2
- Consider typing indicators for better UX in v2
- Message timestamps should respect user's timezone
- Ensure message content is sanitized to prevent XSS

---

## Related Documentation

- **PRD:** `.context/PRD/user-journeys.md` (Mentee discovery journey - extend with messaging)
- **Architecture:** `.context/SRS/architecture-specs.md` (Supabase Realtime)
- **Design System:** `.context/design-system.md` (UI components)
