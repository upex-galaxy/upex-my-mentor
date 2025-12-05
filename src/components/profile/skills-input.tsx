'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SkillsInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  maxSkills?: number
  error?: string
  disabled?: boolean
  placeholder?: string
}

export function SkillsInput({
  value,
  onChange,
  maxSkills = 20,
  error,
  disabled = false,
  placeholder = 'Escribe una habilidad y presiona Enter',
}: SkillsInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [duplicateWarning, setDuplicateWarning] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isAtLimit = value.length >= maxSkills

  const addSkill = React.useCallback(() => {
    const trimmedValue = inputValue.trim().toLowerCase()

    if (!trimmedValue) return

    // Check for duplicates (case-insensitive)
    const isDuplicate = value.some(
      (skill) => skill.toLowerCase() === trimmedValue
    )

    if (isDuplicate) {
      setDuplicateWarning(true)
      setTimeout(() => setDuplicateWarning(false), 2000)
      return
    }

    if (value.length >= maxSkills) return

    // Capitalize first letter
    const formattedSkill =
      trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1)

    onChange([...value, formattedSkill])
    setInputValue('')
  }, [inputValue, value, onChange, maxSkills])

  const removeSkill = React.useCallback(
    (skillToRemove: string) => {
      onChange(value.filter((skill) => skill !== skillToRemove))
    },
    [value, onChange]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addSkill()
      }
      // Allow removing last skill with backspace when input is empty
      if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
        removeSkill(value[value.length - 1])
      }
    },
    [addSkill, inputValue, value, removeSkill]
  )

  return (
    <div data-testid="skillsInput" className="space-y-3">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          data-testid="input_field"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAtLimit ? `Límite alcanzado (${maxSkills})` : placeholder}
          disabled={disabled || isAtLimit}
          className={cn(
            'flex-1',
            error && 'border-destructive focus-visible:ring-destructive',
            duplicateWarning && 'border-amber-500 focus-visible:ring-amber-500'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'skills-error' : undefined}
        />
        <Button
          data-testid="add_button"
          type="button"
          variant="outline"
          onClick={addSkill}
          disabled={disabled || isAtLimit || !inputValue.trim()}
          className="shrink-0"
        >
          Añadir
        </Button>
      </div>

      {/* Duplicate warning */}
      {duplicateWarning && (
        <p data-testid="duplicate_warning" className="text-sm text-amber-600">
          Esta especialidad ya está añadida
        </p>
      )}

      {/* Skills badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge
              key={skill}
              data-testid="skill_badge"
              variant="secondary"
              className="gap-1 pr-1 text-sm"
            >
              {skill}
              <button
                type="button"
                data-testid="remove_skill_button"
                onClick={() => removeSkill(skill)}
                disabled={disabled}
                className="ml-1 rounded-full p-0.5 hover:bg-secondary-foreground/20 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                aria-label={`Eliminar ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Counter */}
      <div data-testid="skills_counter" className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {value.length} de {maxSkills} especialidades
        </span>
        {isAtLimit && (
          <span data-testid="limit_warning" className="text-amber-600">Límite alcanzado</span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p data-testid="skills_error" id="skills-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
