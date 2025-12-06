import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/admin/status-badge"
import { ExternalLink } from "@/components/admin/external-link"
import { User, Linkedin, Github, Star, Calendar, DollarSign, Briefcase } from "lucide-react"
import type { ApplicationDetail as ApplicationDetailType } from "@/types"

interface ApplicationDetailProps {
  application: ApplicationDetailType
}

export function ApplicationDetailView({ application }: ApplicationDetailProps) {
  const formattedDate = new Date(application.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card data-testid="applicationDetail" className="rounded-lg shadow-lg transition-all duration-200">
      <CardContent className="p-6 space-y-6">
        {/* Header Section: Avatar + Name + Email + Date */}
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {application.photo_url ? (
              <Image
                data-testid="application_avatar"
                src={application.photo_url}
                alt={application.name || "Mentor"}
                width={80}
                height={80}
                className="rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div
                data-testid="application_avatar_placeholder"
                className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border"
              >
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Name, Email, Date */}
          <div className="flex-1 min-w-0">
            <h2
              data-testid="application_name"
              className="text-2xl font-bold tracking-tight truncate"
            >
              {application.name || "Name not provided"}
            </h2>
            <p
              data-testid="application_email"
              className="text-muted-foreground"
            >
              {application.email}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span data-testid="application_date">Applied: {formattedDate}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            <StatusBadge
              isVerified={application.is_verified}
              rejectionReason={application.rejection_reason}
            />
          </div>
        </div>

        {/* Bio Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Bio
          </h3>
          <p
            data-testid="application_bio"
            className="text-foreground whitespace-pre-wrap"
          >
            {application.description || "No bio provided"}
          </p>
        </div>

        {/* Specialties Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Specialties
          </h3>
          <div data-testid="application_specialties" className="flex flex-wrap gap-2">
            {application.specialties && application.specialties.length > 0 ? (
              application.specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant="secondary"
                  className="rounded-lg"
                >
                  {specialty}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">No specialties listed</span>
            )}
          </div>
        </div>

        {/* Experience & Rates Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Experience & Rates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Years of Experience */}
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Years of Experience</p>
                <p data-testid="application_experience" className="font-semibold">
                  {application.years_of_experience !== null
                    ? `${application.years_of_experience} years`
                    : "Not specified"}
                </p>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p data-testid="application_rate" className="font-semibold">
                  {application.hourly_rate !== null
                    ? `$${application.hourly_rate}/hr`
                    : "Rate not specified"}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p data-testid="application_rating" className="font-semibold">
                  {application.average_rating !== null ? (
                    <>
                      <span className="text-amber-500">★</span>{" "}
                      {application.average_rating.toFixed(1)}
                      {application.total_reviews !== null && (
                        <span className="text-muted-foreground text-sm ml-1">
                          ({application.total_reviews} reviews)
                        </span>
                      )}
                    </>
                  ) : (
                    "No reviews yet"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* External Profiles Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            External Profiles
          </h3>
          <div data-testid="application_external_links" className="flex flex-wrap gap-3">
            <div data-testid="linkedin_link_container">
              <ExternalLink
                href={application.linkedin_url}
                label="LinkedIn"
                icon={Linkedin}
              />
            </div>
            <div data-testid="github_link_container">
              <ExternalLink
                href={application.github_url}
                label="GitHub"
                icon={Github}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
