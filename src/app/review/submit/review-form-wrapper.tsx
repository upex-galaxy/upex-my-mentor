'use client';

import { useRouter } from 'next/navigation';
import { ReviewForm } from '@/components/reviews/review-form';

interface ReviewFormWrapperProps {
  bookingId: string;
  subjectId: string;
  subjectName: string;
}

/**
 * Client component wrapper for ReviewForm
 * Handles navigation after successful submission or cancellation
 */
export function ReviewFormWrapper({
  bookingId,
  subjectId,
  subjectName,
}: ReviewFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to dashboard after successful review
    router.push('/dashboard');
  };

  const handleCancel = () => {
    // Go back or to dashboard
    router.back();
  };

  return (
    <ReviewForm
      bookingId={bookingId}
      subjectId={subjectId}
      subjectName={subjectName}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
