import Link from "next/link"
import { FileX, ArrowLeft } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"

export default function ApplicationNotFound() {
  return (
    <AdminLayout title="Application Not Found">
      <div
        data-testid="application_not_found"
        className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <FileX className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Application not found</h2>
          <p className="text-muted-foreground text-center max-w-md">
            The application you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>

        <Button
          data-testid="back_to_applications"
          variant="outline"
          asChild
          className="transition-all duration-200 hover:shadow-lg"
        >
          <Link href="/admin/applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
      </div>
    </AdminLayout>
  )
}
