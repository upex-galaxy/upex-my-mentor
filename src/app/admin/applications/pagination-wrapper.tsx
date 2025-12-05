"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Pagination } from "@/components/ui/pagination"

interface PaginationWrapperProps {
  currentPage: number
  totalPages: number
}

export function PaginationWrapper({
  currentPage,
  totalPages,
}: PaginationWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", page.toString())
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}
