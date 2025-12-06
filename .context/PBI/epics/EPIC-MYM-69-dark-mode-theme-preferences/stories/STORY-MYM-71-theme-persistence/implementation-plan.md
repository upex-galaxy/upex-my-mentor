# Implementation Plan: Theme Preference Persistence

**Story:** MYM-71
**Epic:** EPIC-MYM-2-user-authentication-profiles

## Technical Approach
We will use the `next-themes` library, which is the standard solution for Next.js + Tailwind CSS (and Shadcn/UI) to handle theme switching and persistence. It automatically handles `localStorage` synchronization and prevents hydration mismatch warnings.

## Dependencies
- **Library:** `next-themes`
- **Command:** `bun add next-themes`

## Step-by-Step Implementation

### Step 1: Install Dependencies
- Run `bun add next-themes` in the `upex-my-mentor` directory.

### Step 2: Create Theme Provider
- **File:** `src/components/theme-provider.tsx`
- **Content:**
  ```typescript
  "use client"

  import * as React from "react"
  import { ThemeProvider as NextThemesProvider } from "next-themes"
  import { type ThemeProviderProps } from "next-themes/dist/types"

  export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  }
  ```

### Step 3: Update Root Layout
- **File:** `src/app/layout.tsx`
- **Action:** Wrap the application content with `ThemeProvider`.
- **Attributes:**
  - `attribute="class"` (for Tailwind dark mode class strategy)
  - `defaultTheme="system"`
  - `enableSystem`
  - `disableTransitionOnChange` (optional, prevents transition on load)

### Step 4: Create/Update Mode Toggle Component
- **File:** `src/components/mode-toggle.tsx`
- **Action:** Create a dropdown or button to switch themes.
- **Logic:** Use `useTheme` hook from `next-themes`.
  ```typescript
  "use client"

  import * as React from "react"
  import { Moon, Sun } from "lucide-react"
  import { useTheme } from "next-themes"
  import { Button } from "@/components/ui/button"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

  export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
      // ... UI implementation
    )
  }
  ```

### Step 5: Verify Persistence
- Manual verification using the Test Plan (MYM-71).

## QA Checklist
- [ ] `localStorage` has key `theme`.
- [ ] Refreshing page maintains theme.
- [ ] No hydration error in console.
