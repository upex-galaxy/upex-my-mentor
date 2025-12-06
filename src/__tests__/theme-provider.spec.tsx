import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

describe('MYM-71 ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders children', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <span data-testid="child">child</span>
      </ThemeProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('applies system preference when no stored theme', () => {
    const original = window.matchMedia
    ;(window as any).matchMedia = (query: string) => ({
      matches: query.includes('prefers-color-scheme') ? true : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })

    render(<ThemeProvider defaultTheme="system" enableSystem><span /></ThemeProvider>)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    window.matchMedia = original
  })
})
