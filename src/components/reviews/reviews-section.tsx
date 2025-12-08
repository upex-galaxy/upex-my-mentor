import { MessageSquare } from 'lucide-react';
import { RatingDisplay } from './rating-display';
import { RatingBreakdown } from './rating-breakdown';
import { ReviewsList } from './reviews-list';
import { calculateRatingDistribution } from '@/lib/reviews';
import type { ReviewWithReviewer } from '@/types';

interface ReviewsSectionProps {
  mentorId: string;
  reviews: ReviewWithReviewer[];
  averageRating: number;
  totalReviews: number;
}

/**
 * Complete reviews section with rating display, breakdown, and list
 */
export function ReviewsSection({
  mentorId,
  reviews,
  averageRating,
  totalReviews,
}: ReviewsSectionProps) {
  const ratingDistribution = calculateRatingDistribution(reviews);

  // Empty state
  if (totalReviews === 0) {
    return (
      <div data-testid="reviews_section" className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>

        <div data-testid="reviews-empty-state" className="text-center py-12 bg-muted/30 rounded-lg">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Sin reviews aún</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            Este mentor aún no ha recibido valoraciones.
            Reserva una sesión y sé el primero en compartir tu experiencia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="reviews_section" className="container mx-auto px-4 py-12">
      {/* Section Header */}
      <h2 data-testid="reviews_title" className="text-2xl font-bold mb-6">
        Reviews ({totalReviews})
      </h2>

      {/* Rating Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Rating Display */}
        <div className="flex flex-col justify-center">
          <RatingDisplay
            rating={averageRating}
            totalReviews={totalReviews}
            size="lg"
          />
        </div>

        {/* Rating Breakdown */}
        <div>
          <RatingBreakdown
            distribution={ratingDistribution}
            totalReviews={totalReviews}
          />
        </div>
      </div>

      {/* Reviews List */}
      <ReviewsList reviews={reviews} mentorId={mentorId} />
    </div>
  );
}
