'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * ThemeProvider - Wrapper for next-themes that provides theme switching functionality.
 *
 * Features (MYM-70, MYM-71):
 * - Toggle between light/dark modes
 * - Persist preference in localStorage (key: "theme")
 * - Detect system preference automatically (prefers-color-scheme)
 * - No FOUC (Flash of Unstyled Content) on page load
 *
 * Configuration:
 * - attribute="class": Uses Tailwind's class-based dark mode
 * - defaultTheme="system": Respects OS theme preference by default
 * - enableSystem: Enables system theme detection
 * - storageKey="theme": localStorage key for persistence
 * - disableTransitionOnChange: Prevents transition flash during theme change
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
