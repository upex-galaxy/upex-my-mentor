'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPasswordRequirements, type PasswordRequirement } from '@/lib/validations/auth'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const requirements = getPasswordRequirements(password)
  const metCount = requirements.filter((r) => r.met).length
  const allMet = metCount === requirements.length

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar */}
      <div className="flex gap-1">
        {requirements.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              index < metCount
                ? allMet
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Requirements list */}
      <ul className="space-y-1">
        {requirements.map((requirement, index) => (
          <RequirementItem key={index} requirement={requirement} />
        ))}
      </ul>
    </div>
  )
}

function RequirementItem({ requirement }: { requirement: PasswordRequirement }) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 text-xs transition-colors duration-200',
        requirement.met ? 'text-green-600' : 'text-muted-foreground'
      )}
    >
      {requirement.met ? (
        <Check className="h-3 w-3" aria-hidden="true" />
      ) : (
        <X className="h-3 w-3" aria-hidden="true" />
      )}
      <span>{requirement.label}</span>
    </li>
  )
}
