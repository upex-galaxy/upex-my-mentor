'use client'

/**
 * MYM-29/MYM-31: Sessions Tabs Component
 *
 * Client component for interactive tabs switching between
 * upcoming and past sessions.
 * MYM-31: Added refresh support after session cancellation.
 */

import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionCard } from "@/components/sessions/session-card"
import { SessionEmptyState } from "@/components/sessions/session-empty-state"
import type { BookingWithParticipants } from "@/types/sessions"

interface SessionsTabsProps {
  upcomingSessions: BookingWithParticipants[]
  pastSessions: BookingWithParticipants[]
  currentUserId: string
  currentUserRole: 'student' | 'mentor'
  /** MYM-33: Map of bookingId -> hasReviewed status for completed sessions */
  reviewStatus?: Record<string, boolean>
}

export function SessionsTabs({
  upcomingSessions,
  pastSessions,
  currentUserId,
  currentUserRole,
  reviewStatus = {},
}: SessionsTabsProps) {
  const router = useRouter()

  // MYM-31: Refresh page data after session cancellation
  function handleSessionCancelled() {
    router.refresh()
  }

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="upcoming" data-testid="upcoming_tab">
          Próximas ({upcomingSessions.length})
        </TabsTrigger>
        <TabsTrigger value="past" data-testid="past_tab">
          Pasadas ({pastSessions.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="mt-6">
        {upcomingSessions.length === 0 ? (
          <SessionEmptyState tab="upcoming" userRole={currentUserRole} />
        ) : (
          <div className="space-y-4" data-testid="upcoming_sessions_list">
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                booking={session}
                currentUserId={currentUserId}
                onSessionCancelled={handleSessionCancelled}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past" className="mt-6">
        {pastSessions.length === 0 ? (
          <SessionEmptyState tab="past" userRole={currentUserRole} />
        ) : (
          <div className="space-y-4" data-testid="past_sessions_list">
            {pastSessions.map((session) => (
              <SessionCard
                key={session.id}
                booking={session}
                currentUserId={currentUserId}
                onSessionCancelled={handleSessionCancelled}
                hasReviewed={reviewStatus[session.id] ?? false}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
