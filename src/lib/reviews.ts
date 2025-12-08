import type { RatingDistribution, ReviewWithReviewer } from '@/types';

/**
 * Calculate rating distribution from reviews array
 */
export function calculateRatingDistribution(
  reviews: { rating: number }[]
): RatingDistribution {
  const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((review) => {
    const rating = review.rating;
    if (rating >= 1 && rating <= 5) {
      distribution[rating as 1 | 2 | 3 | 4 | 5]++;
    }
  });

  return distribution;
}

/**
 * Format review date to human-readable relative time
 */
export function formatReviewDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Hoy';
  } else if (diffInDays === 1) {
    return 'Ayer';
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Hace ${months} mes${months !== 1 ? 'es' : ''}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `Hace ${years} año${years !== 1 ? 's' : ''}`;
  }
}

/**
 * Format date to locale string (e.g., "Nov 10, 2025")
 */
export function formatReviewDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Sort reviews by different criteria
 */
export function sortReviews(
  reviews: ReviewWithReviewer[],
  sortOption: 'recent' | 'highest' | 'lowest'
): ReviewWithReviewer[] {
  return [...reviews].sort((a, b) => {
    switch (sortOption) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'highest':
        return b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'lowest':
        return a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });
}

/**
 * Filter reviews by rating
 */
export function filterReviews(
  reviews: ReviewWithReviewer[],
  filterOption: 'all' | '5' | '4' | '3' | '2' | '1'
): ReviewWithReviewer[] {
  if (filterOption === 'all') {
    return reviews;
  }
  const targetRating = parseInt(filterOption, 10);
  return reviews.filter((review) => review.rating === targetRating);
}

/**
 * Paginate reviews
 */
export function paginateReviews(
  reviews: ReviewWithReviewer[],
  page: number,
  perPage: number = 10
): { reviews: ReviewWithReviewer[]; totalPages: number } {
  const start = (page - 1) * perPage;
  const paginatedReviews = reviews.slice(start, start + perPage);
  const totalPages = Math.ceil(reviews.length / perPage);

  return {
    reviews: paginatedReviews,
    totalPages: Math.max(1, totalPages),
  };
}

/**
 * Get plural form for reviews count
 */
export function getReviewsPlural(count: number): string {
  return count === 1 ? 'review' : 'reviews';
}
