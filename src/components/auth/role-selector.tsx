'use client'

import { Briefcase, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'mentor' | 'student'

interface RoleSelectorProps {
  value: Role | null
  onChange: (role: Role) => void
  error?: string
}

interface RoleOption {
  value: Role
  label: string
  description: string
  icon: React.ReactNode
}

const roleOptions: RoleOption[] = [
  {
    value: 'mentor',
    label: 'Quiero ser Mentor',
    description: 'Comparte tu experiencia y genera ingresos',
    icon: <Briefcase className="h-6 w-6" />,
  },
  {
    value: 'student',
    label: 'Busco Mentoría',
    description: 'Aprende de expertos en tu área',
    icon: <GraduationCap className="h-6 w-6" />,
  },
]

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div data-testid="roleSelector" className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        {roleOptions.map((option) => (
          <RoleCard
            key={option.value}
            option={option}
            isSelected={value === option.value}
            onSelect={() => onChange(option.value)}
            hasError={!!error}
          />
        ))}
      </div>
      {error && <p data-testid="role_error" className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface RoleCardProps {
  option: RoleOption
  isSelected: boolean
  onSelect: () => void
  hasError: boolean
}

function RoleCard({ option, isSelected, onSelect, hasError }: RoleCardProps) {
  return (
    <button
      type="button"
      data-testid={`${option.value}_role_card`}
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all duration-200',
        'hover:border-primary/50 hover:bg-primary/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border bg-background',
        hasError && !isSelected && 'border-red-200'
      )}
    >
      <div
        className={cn(
          'rounded-full p-2 transition-colors',
          isSelected ? 'bg-primary/10' : 'bg-muted'
        )}
      >
        {option.icon}
      </div>
      <div>
        <p className="font-semibold text-sm">{option.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
      </div>
    </button>
  )
}
