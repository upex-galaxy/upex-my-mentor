import type { LucideIcon } from "lucide-react"
import { ExternalLink as ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExternalLinkProps {
  href: string | null
  label: string
  icon: LucideIcon
}

export function ExternalLink({ href, label, icon: Icon }: ExternalLinkProps) {
  if (!href) {
    return (
      <span
        data-testid="external_link_not_provided"
        className="text-muted-foreground text-sm"
      >
        Not provided
      </span>
    )
  }

  return (
    <Button
      data-testid="external_link"
      variant="outline"
      size="sm"
      asChild
      className="transition-all duration-200 hover:shadow-lg"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
        <ExternalLinkIcon className="ml-2 h-3 w-3" />
      </a>
    </Button>
  )
}
