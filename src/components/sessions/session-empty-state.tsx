import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SessionTab } from "@/types/sessions"

interface SessionEmptyStateProps {
  tab: SessionTab
  userRole: 'student' | 'mentor'
}

export function SessionEmptyState({ tab, userRole }: SessionEmptyStateProps) {
  if (tab === 'upcoming') {
    return (
      <div data-testid="sessionEmptyState" className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p data-testid="empty_state_message" className="text-muted-foreground mb-4">
          {userRole === 'student'
            ? "No tienes sesiones programadas. ¿Listo para tu primera mentoría?"
            : "No tienes sesiones programadas. Tus estudiantes aparecerán aquí."}
        </p>
        {userRole === 'student' && (
          <Link href="/mentors" data-testid="explore_mentors_link">
            <Button data-testid="explore_mentors_button">Explorar Mentores</Button>
          </Link>
        )}
      </div>
    )
  }

  // Past sessions empty state
  return (
    <div data-testid="sessionEmptyState" className="text-center py-12">
      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p data-testid="empty_state_message" className="text-muted-foreground">
        Aún no has completado ninguna sesión
      </p>
    </div>
  )
}
