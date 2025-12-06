import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModeToggle } from '@/components/mode-toggle'
import { ThemeProvider } from '@/components/theme-provider'

describe('MYM-71 ModeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('sets dark theme and localStorage when Dark clicked', () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByTestId('set-dark'))
    expect(window.localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('sets light theme when Light clicked', () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByTestId('set-light'))
    expect(window.localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('sets system theme when System clicked', () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByTestId('set-system'))
    expect(window.localStorage.getItem('theme')).toBe('system')
  })
})
