import { Star } from 'lucide-react';
import { getReviewsPlural } from '@/lib/reviews';

interface RatingDisplayProps {
  rating: number;
  totalReviews: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Display average rating with stars visualization
 */
export function RatingDisplay({ rating, totalReviews, size = 'md' }: RatingDisplayProps) {
  const sizeClasses = {
    sm: { container: 'text-sm', star: 'h-4 w-4', rating: 'text-base' },
    md: { container: 'text-base', star: 'h-5 w-5', rating: 'text-xl' },
    lg: { container: 'text-lg', star: 'h-6 w-6', rating: 'text-2xl' },
  };

  const classes = sizeClasses[size];

  if (totalReviews === 0) {
    return (
      <div data-testid="rating-display" className={`flex items-center ${classes.container}`}>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Star className={`${classes.star} text-gray-300`} />
          <span>Sin valoraciones aún</span>
        </div>
      </div>
    );
  }

  // Calculate filled stars (full and partial)
  const fullStars = Math.floor(rating);
  const partialFill = rating - fullStars;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div data-testid="rating-display" className={`flex items-center gap-2 ${classes.container}`}>
      {/* Star visualization */}
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${classes.star} fill-yellow-400 text-yellow-400`}
          />
        ))}

        {/* Partial star */}
        {partialFill > 0 && (
          <div className="relative">
            <Star className={`${classes.star} text-gray-300`} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${partialFill * 100}%` }}
            >
              <Star className={`${classes.star} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${classes.star} text-gray-300`}
          />
        ))}
      </div>

      {/* Rating number */}
      <span className={`font-bold ${classes.rating}`}>
        {rating.toFixed(1)}/5.0
      </span>

      {/* Reviews count */}
      <span className="text-muted-foreground">
        ({totalReviews} {getReviewsPlural(totalReviews)})
      </span>
    </div>
  );
}
