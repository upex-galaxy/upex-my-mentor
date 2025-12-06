"use client"

import * as React from "react"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()
  return (
    <div role="group" aria-label="Theme selector" data-testid="mode-toggle">
      <button type="button" data-testid="set-light" onClick={() => setTheme("light")}>Light</button>
      <button type="button" data-testid="set-dark" onClick={() => setTheme("dark")}>Dark</button>
      <button type="button" data-testid="set-system" onClick={() => setTheme("system")}>System</button>
    </div>
  )
}
