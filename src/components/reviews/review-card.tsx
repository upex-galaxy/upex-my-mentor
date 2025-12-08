import { Star, Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatReviewDateFull } from '@/lib/reviews';
import type { ReviewWithReviewer } from '@/types';

interface ReviewCardProps {
  review: ReviewWithReviewer;
  onFlag?: (reviewId: string) => void;
}

/**
 * Individual review card component
 */
export function ReviewCard({ review, onFlag }: ReviewCardProps) {
  const reviewerName = review.reviewer?.name || 'Usuario anónimo';

  return (
    <Card data-testid="review-card" className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        {/* Header: Name, Stars, Date, Flag */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{reviewerName}</div>
            <div className="text-sm text-muted-foreground">
              {formatReviewDateFull(review.created_at)}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Star rating */}
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Flag button */}
            {onFlag && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onFlag(review.id)}
                aria-label="Reportar review"
              >
                <Flag className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="text-muted-foreground whitespace-pre-wrap break-words">
            {review.comment}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
