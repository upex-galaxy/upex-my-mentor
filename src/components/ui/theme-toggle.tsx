'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * ThemeToggle - Button component that toggles between light/dark/system themes.
 *
 * Features (MYM-70):
 * - Cycles through: light → dark → system → light
 * - Shows Sun icon for light mode, Moon for dark, auto-icon for system
 * - Keyboard accessible (Enter/Space to toggle)
 * - Smooth icon transition animation
 * - Tooltip shows current mode
 *
 * The component waits for client-side mount to avoid hydration mismatch.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Toggle between themes: light → dark → system → light
  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // Get tooltip text based on current theme
  const getTooltipText = () => {
    if (theme === 'system') {
      return `Sistema (${resolvedTheme === 'dark' ? 'oscuro' : 'claro'})`
    }
    return theme === 'dark' ? 'Modo oscuro' : 'Modo claro'
  }

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        disabled
        aria-label="Cargando tema"
      >
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      data-testid="theme_toggle"
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative h-9 w-9"
      aria-label={`Cambiar tema. Actual: ${getTooltipText()}`}
      title={getTooltipText()}
    >
      {/* Sun icon - visible in light mode */}
      <Sun
        className="h-5 w-5 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      {/* Moon icon - visible in dark mode */}
      <Moon
        className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
