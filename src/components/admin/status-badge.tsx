import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface StatusBadgeProps {
  isVerified: boolean
  rejectionReason?: string | null
}

export function StatusBadge({ isVerified, rejectionReason }: StatusBadgeProps) {
  // Verified state
  if (isVerified) {
    return (
      <Badge
        data-testid="status_badge_verified"
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <CheckCircle className="mr-1 h-3 w-3" />
        Verified
      </Badge>
    )
  }

  // Rejected state (not verified but has rejection reason)
  if (rejectionReason) {
    return (
      <Badge
        data-testid="status_badge_rejected"
        variant="destructive"
      >
        <XCircle className="mr-1 h-3 w-3" />
        Rejected
      </Badge>
    )
  }

  // Pending state (not verified, no rejection reason)
  return (
    <Badge
      data-testid="status_badge_pending"
      variant="outline"
      className="border-amber-500 text-amber-600"
    >
      <Clock className="mr-1 h-3 w-3" />
      Pending Review
    </Badge>
  )
}
