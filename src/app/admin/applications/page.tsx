import { createServer } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ApplicationsTable } from "@/components/admin/applications-table"
import { PaginationWrapper } from "./pagination-wrapper"
import type { PendingApplication } from "@/types"

const ITEMS_PER_PAGE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminApplicationsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams
  const supabase = await createServer()
  const page = Number(params.page) || 1
  const offset = (page - 1) * ITEMS_PER_PAGE

  // Fetch pending mentor applications (is_verified = false, role = mentor)
  const { data: applications, count, error } = await supabase
    .from("profiles")
    .select(
      "id, name, email, created_at, specialties, linkedin_url, github_url",
      { count: "exact" }
    )
    .eq("role", "mentor")
    .eq("is_verified", false)
    .order("created_at", { ascending: true })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  return (
    <AdminLayout title="Pending Applications" badge={count || 0}>
      <ApplicationsTable
        applications={(applications as PendingApplication[]) || []}
        error={error?.message}
      />
      {totalPages > 1 && (
        <PaginationWrapper currentPage={page} totalPages={totalPages} />
      )}
    </AdminLayout>
  )
}
