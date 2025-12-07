"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MentorPaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  currentPage: number;
}

export function MentorPagination({
  hasNextPage,
  hasPreviousPage,
  nextCursor,
  currentPage,
}: MentorPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPage = (cursor: string | null, page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (cursor) {
      params.set("cursor", cursor);
      params.set("page", String(page));
    } else {
      params.delete("cursor");
      params.delete("page");
    }

    router.push(`/mentors?${params.toString()}`);
  };

  // Don't render if there's only one page
  if (!hasNextPage && !hasPreviousPage) {
    return null;
  }

  return (
    <div data-testid="mentorPagination" className="flex items-center justify-center gap-4 mt-8">
      <Button
        data-testid="prev_page_button"
        variant="outline"
        size="sm"
        onClick={() => navigateToPage(null, 1)}
        disabled={!hasPreviousPage}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      <span data-testid="page_indicator" className="text-sm text-muted-foreground">
        Página {currentPage}
      </span>

      <Button
        data-testid="next_page_button"
        variant="outline"
        size="sm"
        onClick={() => navigateToPage(nextCursor || null, currentPage + 1)}
        disabled={!hasNextPage}
        className="gap-1"
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
