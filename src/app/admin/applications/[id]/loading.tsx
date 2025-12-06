import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  )
}

export default function ApplicationDetailLoading() {
  return (
    <AdminLayout title="Application Details">
      <div className="space-y-6">
        {/* Back Button Skeleton */}
        <Skeleton className="h-9 w-44" />

        {/* Application Detail Card Skeleton */}
        <Card className="rounded-lg shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <Skeleton className="w-20 h-20 rounded-full" />

              {/* Name, Email, Date */}
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Status Badge */}
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            {/* Bio Section */}
            <div className="border-t border-border pt-6 space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Specialties Section */}
            <div className="border-t border-border pt-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>

            {/* Experience & Rates Section */}
            <div className="border-t border-border pt-6 space-y-3">
              <Skeleton className="h-4 w-36" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
            </div>

            {/* External Profiles Section */}
            <div className="border-t border-border pt-6 space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-3">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
