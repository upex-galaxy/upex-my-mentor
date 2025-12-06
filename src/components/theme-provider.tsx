"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

type Props = {
  children: React.ReactNode
  attribute?: "class"
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeContextValue = {
  setTheme: (t: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function applyTheme(theme: Theme, enableSystem: boolean) {
  if (typeof window === "undefined") return
  const root = document.documentElement
  const prefersDark = enableSystem && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange,
}: Props) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)

  // Initialize from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem('theme') as Theme | null
      const initial = stored ?? defaultTheme
      setThemeState(initial)
      applyTheme(initial, enableSystem)
    } catch {
      // storage unavailable; fall back to default/theme application
      applyTheme(defaultTheme, enableSystem)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Respond to OS theme changes when using system
  React.useEffect(() => {
    if (!enableSystem || theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system', true)
    if (mq.addEventListener) mq.addEventListener('change', handler)
    else if ((mq as any).addListener) (mq as any).addListener(handler)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler)
      else if ((mq as any).removeListener) (mq as any).removeListener(handler)
    }
  }, [theme, enableSystem])

  // Persist and apply when theme changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem('theme', theme)
    } catch {}
    applyTheme(theme, enableSystem)
  }, [theme, enableSystem])

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
