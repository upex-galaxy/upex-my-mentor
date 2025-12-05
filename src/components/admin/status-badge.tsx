import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock } from "lucide-react"

interface StatusBadgeProps {
  isVerified: boolean
}

export function StatusBadge({ isVerified }: StatusBadgeProps) {
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
