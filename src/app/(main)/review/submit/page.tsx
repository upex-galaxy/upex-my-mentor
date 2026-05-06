import { redirect } from 'next/navigation';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { checkReviewEligibility, getUserRoleInBooking } from '@/lib/actions/reviews';
import { ReviewFormWrapper } from './review-form-wrapper';

interface ReviewSubmitPageProps {
  searchParams: Promise<{ booking?: string }>;
}

export default async function ReviewSubmitPage({
  searchParams,
}: ReviewSubmitPageProps) {
  const params = await searchParams;
  const bookingId = params.booking;

  // No booking ID provided
  if (!bookingId) {
    redirect('/dashboard');
  }

  // Check eligibility
  const eligibility = await checkReviewEligibility(bookingId);

  // Not eligible - show appropriate message
  if (!eligibility.canReview) {
    return (
      <div data-testid="reviewSubmitPage" className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <NotEligibleMessage reason={eligibility.reason} />
      </div>
    );
  }

  // Get user role to determine who they're reviewing
  const userRole = await getUserRoleInBooking(bookingId);

  if (!userRole || !eligibility.booking) {
    redirect('/dashboard');
  }

  // Determine the subject (reviewee) based on user role
  const subjectId =
    userRole === 'mentor'
      ? eligibility.booking.student_id
      : eligibility.booking.mentor_id;

  const subjectName =
    userRole === 'mentor'
      ? eligibility.booking.student_name || 'el mentee'
      : eligibility.booking.mentor_name || 'el mentor';

  return (
    <div data-testid="reviewSubmitPage" className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <ReviewFormWrapper
        bookingId={bookingId}
        subjectId={subjectId}
        subjectName={subjectName}
      />
    </div>
  );
}

function NotEligibleMessage({
  reason,
}: {
  reason?: string;
}) {
  const messages: Record<
    string,
    { icon: React.ReactNode; title: string; description: string }
  > = {
    not_authenticated: {
      icon: <AlertCircle className="h-12 w-12 text-yellow-500" />,
      title: 'Inicia sesión',
      description: 'Debes iniciar sesión para dejar una valoración.',
    },
    booking_not_found: {
      icon: <AlertCircle className="h-12 w-12 text-destructive" />,
      title: 'Sesión no encontrada',
      description: 'No pudimos encontrar esta sesión. Verifica el enlace.',
    },
    not_participant: {
      icon: <AlertCircle className="h-12 w-12 text-destructive" />,
      title: 'Sin acceso',
      description: 'No tienes permiso para valorar esta sesión.',
    },
    not_completed: {
      icon: <Clock className="h-12 w-12 text-yellow-500" />,
      title: 'Sesión no completada',
      description:
        'La sesión aún no ha sido marcada como completada. Podrás dejar tu valoración una vez finalice.',
    },
    too_early: {
      icon: <Clock className="h-12 w-12 text-yellow-500" />,
      title: 'Espera un momento',
      description:
        'Podrás dejar tu valoración 1 hora después de completar la sesión.',
    },
    already_reviewed: {
      icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
      title: 'Ya dejaste una valoración',
      description: 'Ya has valorado esta sesión. Gracias por tu feedback.',
    },
  };

  const content = messages[reason || ''] || {
    icon: <AlertCircle className="h-12 w-12 text-destructive" />,
    title: 'Error',
    description: 'Ocurrió un error inesperado.',
  };

  return (
    <Card data-testid="notEligibleMessage" className="w-full max-w-md shadow-lg rounded-xl">
      <CardContent className="pt-8 pb-8 text-center">
        <div className="flex justify-center mb-4">{content.icon}</div>
        <h2 data-testid="not_eligible_title" className="text-xl font-semibold mb-2">{content.title}</h2>
        <p data-testid="not_eligible_description" className="text-muted-foreground mb-6">{content.description}</p>
        <Button asChild data-testid="go_to_dashboard_button">
          <Link href="/dashboard" data-testid="go_to_dashboard_link">Ir al dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
