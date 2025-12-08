'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ReviewCard } from './review-card';
import { sortReviews, filterReviews, paginateReviews } from '@/lib/reviews';
import type { ReviewWithReviewer, ReviewSortOption, ReviewFilterOption } from '@/types';

const REVIEWS_PER_PAGE = 10;

interface ReviewsListProps {
  reviews: ReviewWithReviewer[];
  mentorId: string;
}

/**
 * Reviews list with sorting, filtering, and pagination
 */
export function ReviewsList({ reviews, mentorId }: ReviewsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state from URL
  const sortOption = (searchParams.get('sort') as ReviewSortOption) || 'recent';
  const filterOption = (searchParams.get('filter') as ReviewFilterOption) || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Update URL with new params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === 'recent' || value === 'all' || value === '1') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const queryString = params.toString();
      router.push(`/mentors/${mentorId}${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      });
    },
    [router, mentorId, searchParams]
  );

  // Process reviews: sort -> filter -> paginate
  const sortedReviews = useMemo(
    () => sortReviews(reviews, sortOption),
    [reviews, sortOption]
  );

  const filteredReviews = useMemo(
    () => filterReviews(sortedReviews, filterOption),
    [sortedReviews, filterOption]
  );

  const { reviews: paginatedReviews, totalPages } = useMemo(
    () => paginateReviews(filteredReviews, currentPage, REVIEWS_PER_PAGE),
    [filteredReviews, currentPage]
  );

  // Handlers
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ sort: e.target.value, page: '1' });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ filter: e.target.value, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const handleFlag = (reviewId: string) => {
    // TODO: Implement flag functionality
    console.log('Flag review:', reviewId);
  };

  // Empty state after filtering
  if (filteredReviews.length === 0 && reviews.length > 0) {
    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <Select
            value={sortOption}
            onChange={handleSortChange}
            className="w-[180px]"
          >
            <option value="recent">Más recientes</option>
            <option value="highest">Mayor valoración</option>
            <option value="lowest">Menor valoración</option>
          </Select>

          <Select
            value={filterOption}
            onChange={handleFilterChange}
            className="w-[180px]"
          >
            <option value="all">Todas las valoraciones</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </Select>
        </div>

        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No hay reviews con esta valoración.
          </p>
          <Button
            variant="link"
            onClick={() => updateParams({ filter: 'all', page: '1' })}
            className="mt-2"
          >
            Ver todas las reviews
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="reviews-list" className="space-y-4">
      {/* Sort and Filter Controls */}
      <div className="flex flex-wrap gap-4">
        <Select
          value={sortOption}
          onChange={handleSortChange}
          className="w-[180px]"
        >
          <option value="recent">Más recientes</option>
          <option value="highest">Mayor valoración</option>
          <option value="lowest">Menor valoración</option>
        </Select>

        <Select
          value={filterOption}
          onChange={handleFilterChange}
          className="w-[180px]"
        >
          <option value="all">Todas las valoraciones</option>
          <option value="5">5 estrellas</option>
          <option value="4">4 estrellas</option>
          <option value="3">3 estrellas</option>
          <option value="2">2 estrellas</option>
          <option value="1">1 estrella</option>
        </Select>
      </div>

      {/* Reviews Cards */}
      <div className="space-y-4">
        {paginatedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} onFlag={handleFlag} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          data-testid="reviews-pagination"
          className="flex items-center justify-center gap-4 pt-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
