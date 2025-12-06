import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createServer } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ApplicationDetailView } from "@/components/admin/application-detail"
import { VerificationActions } from "@/components/admin/verification-actions"
import { Button } from "@/components/ui/button"
import type { ApplicationDetail } from "@/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServer()

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      email,
      created_at,
      specialties,
      linkedin_url,
      github_url,
      description,
      photo_url,
      hourly_rate,
      is_verified,
      years_of_experience,
      average_rating,
      total_reviews,
      rejection_reason
    `)
    .eq("id", id)
    .eq("role", "mentor")
    .single()

  if (error || !data) {
    notFound()
  }

  const application: ApplicationDetail = {
    id: data.id,
    name: data.name,
    email: data.email,
    created_at: data.created_at ?? new Date().toISOString(),
    specialties: data.specialties,
    linkedin_url: data.linkedin_url,
    github_url: data.github_url,
    description: data.description,
    photo_url: data.photo_url,
    hourly_rate: data.hourly_rate,
    is_verified: data.is_verified ?? false,
    years_of_experience: data.years_of_experience,
    average_rating: data.average_rating,
    total_reviews: data.total_reviews,
    rejection_reason: data.rejection_reason,
  }

  return (
    <AdminLayout title="Application Details">
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          data-testid="back_to_applications"
          variant="outline"
          size="sm"
          asChild
          className="transition-all duration-200 hover:shadow-lg"
        >
          <Link href="/admin/applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>

        {/* Application Detail */}
        <ApplicationDetailView application={application} />

        {/* MYM-11: Approve/Reject Buttons */}
        <VerificationActions
          applicationId={application.id}
          applicationName={application.name || 'Unknown'}
          isVerified={application.is_verified}
          isRejected={!!application.rejection_reason}
        />
      </div>
    </AdminLayout>
  )
}
