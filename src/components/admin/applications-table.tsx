"use client"

import Link from "next/link"
import { FileX, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { PendingApplication } from "@/types"

interface ApplicationsTableProps {
  applications: PendingApplication[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

function TableSkeleton() {
  return (
    <div data-testid="applications-loading" className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-16 bg-muted animate-pulse rounded-lg"
        />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div
      data-testid="applications-empty"
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No pending applications</h3>
      <p className="text-muted-foreground max-w-sm">
        There are no mentor applications waiting for review at this time.
      </p>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      data-testid="applications-error"
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <RefreshCw className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-2">Error loading applications</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          data-testid="retry-button"
          variant="outline"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function ApplicationRow({ application }: { application: PendingApplication }) {
  const specialties = application.specialties || []
  const displaySpecialties = specialties.slice(0, 3)
  const remainingCount = specialties.length - 3

  return (
    <tr data-testid="application-row" className="border-b border-border">
      <td className="py-4 px-4 font-medium">
        {application.name || "No name provided"}
      </td>
      <td className="py-4 px-4 text-muted-foreground">
        {application.email}
      </td>
      <td className="py-4 px-4 text-muted-foreground">
        {formatDate(application.created_at)}
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-wrap gap-1">
          {displaySpecialties.length > 0 ? (
            <>
              {displaySpecialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="outline">+{remainingCount}</Badge>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-sm">No specialties</span>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <Button
          data-testid="review-button"
          size="sm"
          asChild
        >
          <Link href={`/admin/applications/${application.id}`}>
            Review
          </Link>
        </Button>
      </td>
    </tr>
  )
}

export function ApplicationsTable({
  applications,
  isLoading = false,
  error = null,
  onRetry,
}: ApplicationsTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <TableSkeleton />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <ErrorState message={error} onRetry={onRetry} />
      </Card>
    )
  }

  if (applications.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table data-testid="applications-table" className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-sm">
                Mentor Name
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm">
                Email
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm">
                Application Date
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm">
                Specialties
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
