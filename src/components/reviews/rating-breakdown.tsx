import { Star } from 'lucide-react';
import type { RatingDistribution } from '@/types';

interface RatingBreakdownProps {
  distribution: RatingDistribution;
  totalReviews: number;
}

/**
 * Histogram showing distribution of ratings (5-star to 1-star)
 */
export function RatingBreakdown({ distribution, totalReviews }: RatingBreakdownProps) {
  const ratings = [5, 4, 3, 2, 1] as const;

  if (totalReviews === 0) {
    return null;
  }

  return (
    <div data-testid="rating-breakdown" className="space-y-2">
      {ratings.map((rating) => {
        const count = distribution[rating];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-2 text-sm">
            {/* Rating label */}
            <div className="flex items-center gap-1 w-12 shrink-0">
              <span className="font-medium">{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>

            {/* Progress bar */}
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Percentage */}
            <span className="text-muted-foreground w-10 text-right shrink-0">
              {percentage.toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
