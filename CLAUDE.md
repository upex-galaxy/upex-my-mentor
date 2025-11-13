# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Upex My Mentor** is a marketplace platform connecting verified senior engineers (mentors) with students and tech professionals seeking 1-on-1 mentorship. Built with Next.js 15 App Router and Supabase.

**Current State:** MVP with Supabase authentication integration in progress. Mock data being replaced with real backend.

---

## Common Commands

### Development
```bash
# Start development server
bun run dev

# Type checking (before committing)
bun run typecheck

# Linting
bun run lint

# Production build
bun run build
bun run start
```

### MCP Integration
```bash
# Load MCP tools for AI-assisted development (session-based)
bun run ai
```

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React Server Components
- **Runtime:** Bun (package manager and runtime)
- **Language:** TypeScript (strict mode enabled)
- **Styling:** TailwindCSS + shadcn/ui design system
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Authentication:** Supabase Auth with middleware protection
- **Validation:** Zod schemas
- **Icons:** Lucide React

---

## Architecture Overview

### Authentication Flow
- **AuthContext** (`src/contexts/auth-context.tsx`): Client-side auth state management using Supabase Auth helpers
- **Middleware** (`middleware.ts`): Server-side route protection
  - Redirects unauthenticated users to `/login` for protected routes
  - Redirects authenticated users away from `/login` and `/signup` to `/dashboard`
- **Supabase Clients:**
  - `src/lib/supabase/client.ts`: Client component usage
  - `src/lib/supabase/server.ts`: Server component usage

### Directory Structure
```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Route group for auth pages (login, signup)
│   ├── dashboard/           # Protected dashboard route
│   ├── mentors/             # Mentor listing and detail pages
│   │   ├── [id]/           # Dynamic mentor detail
│   │   └── page.tsx        # Mentor listing with search/filters
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Landing page
│
├── components/
│   ├── ui/                 # Design system components (Button, Card, Input, Badge)
│   ├── layout/             # Navbar, Footer
│   ├── landing/            # Landing page sections
│   └── mentors/            # MentorCard, MentorFilters
│
├── contexts/
│   └── auth-context.tsx    # Global auth state (Supabase integration)
│
├── lib/
│   ├── config.ts           # Environment variable access
│   ├── utils.ts            # cn() utility for className merging
│   ├── data.ts             # Mock data (being phased out)
│   └── supabase/           # Supabase client factories
│
└── types/
    ├── index.ts            # Domain types (User, Mentor, etc.)
    └── supabase.ts         # Supabase database types
```

### Key Patterns

**Component Structure:**
- UI components in `components/ui/` use `class-variance-authority` (cva) for type-safe variants
- Domain components compose UI components with business logic
- All components use absolute imports via `@/` path alias

**State Management:**
- Global: React Context API (AuthContext for user session)
- Local: React hooks (useState, useMemo, useCallback)
- Server: Supabase queries in Server Components

**Styling:**
- TailwindCSS utility-first with custom theme
- CSS variables in `app/globals.css` for theming (primary, secondary, accent)
- `cn()` helper from `lib/utils.ts` for conditional classes
- Design tokens: Purple-based palette (primary: `271 91% 65%`)

---

## Important Implementation Details

### Supabase Integration

**Environment Variables Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-only)
```

**Database Schema:**
The project uses Supabase with the following main tables:
- `profiles`: User profiles (extends auth.users)
- `reviews`: Mentor reviews and ratings
- `bookings`: Session bookings (planned)

**Row Level Security (RLS):**
- Users can only update their own profile
- Reviews are public but only editable by creator
- Protected endpoints require authentication

### Middleware Protection

The middleware at `middleware.ts` protects routes based on authentication state. It:
1. Checks session via `supabase.auth.getSession()`
2. Redirects to `/login` if accessing protected routes without auth
3. Redirects to `/dashboard` if authenticated users visit auth pages

**Protected Routes:** All routes except `/`, `/login`, `/signup`, `/mentors`, `/mentors/[id]`, and static assets.

### TypeScript Conventions

**Import Order:**
1. React/Next.js imports
2. Third-party libraries
3. Internal imports with `@/` alias (absolute)
4. Type imports
5. Relative imports (./helpers, etc.)

**Naming:**
- Components: PascalCase (`MentorCard.tsx` → `export function MentorCard`)
- Files: kebab-case (`mentor-card.tsx`, `auth-context.tsx`)
- Utilities: camelCase (`searchMentors`, `cn`)
- Types/Interfaces: PascalCase (`User`, `Mentor`, `LoginCredentials`)

**Component Props:**
```tsx
// Use interfaces for component props
interface MentorCardProps {
  mentor: Mentor
  className?: string
}

// Extend HTML attributes when needed
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}
```

### Design System Usage

**Always use design system components from `components/ui/`:**
```tsx
// ✅ Correct
import { Button } from '@/components/ui/button'
<Button variant="outline">Click me</Button>

// ❌ Wrong
<button className="px-4 py-2 bg-blue-500">Click me</button>
```

**Color classes to use:**
- Primary: `bg-primary text-primary-foreground`
- Secondary: `bg-secondary text-secondary-foreground`
- Accent: `bg-accent text-accent-foreground`
- Muted text: `text-muted-foreground`
- Borders: `border-border`

**Never hardcode colors** - always use theme variables.

---

## Working with Supabase

### MCP Server
This project uses the Supabase MCP server for AI-assisted database operations. Prefer using MCP tools over manual SQL when:
- Querying database schema
- Creating migrations
- Fetching data for context
- Testing RLS policies

### Client vs Server Usage

**Client Components:**
```tsx
"use client"
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase.from('profiles').select('*')
```

**Server Components:**
```tsx
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()
const { data } = await supabase.from('profiles').select('*')
```

### Common Queries

**Fetch all mentors:**
```tsx
const { data: mentors } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'mentor')
```

**Fetch mentor with reviews:**
```tsx
const { data: mentor } = await supabase
  .from('profiles')
  .select('*, reviews(*)')
  .eq('id', mentorId)
  .single()
```

---

## Development Workflow

### AI-Driven Development Process

This project follows an 8-phase AI-driven methodology documented in `.context/`:

1. **Constitution** (`.context/idea/`): Business model and market context
2. **Architecture** (`.context/PRD/`, `.context/SRS/`): Product and technical requirements
3. **Specification** (`.context/PBI/`): Product backlog with epics and stories
4. **Shift-Left Testing**: Test plans at epic/story level
5. **Planning**: Implementation plans for features
6. **Implementation**: Code writing (current phase)
7. **Code Review**: PR review process
8. **Test Automation**: E2E and integration tests

### Working on Features

When implementing a new feature:

1. **Find the story** in `.context/PBI/epics/EPIC-[PROJECT]-[NUM]-[name]/stories/`
2. **Read the story folder** which contains:
   - `story.md`: User story and acceptance criteria
   - `test-cases.md`: Test scenarios
   - `implementation-plan.md`: Technical implementation steps
3. **Follow the plan** and update as needed
4. **Use design system components** from `components/ui/`
5. **Maintain type safety** with TypeScript strict mode
6. **Test locally** before committing

### Adding New UI Components

Follow the shadcn/ui pattern:

```tsx
// components/ui/new-component.tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes-here",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-primary bg-transparent"
      },
      size: {
        sm: "h-9 px-3",
        default: "h-10 px-4"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      className={cn(componentVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Component.displayName = "Component"
```

---

## Code Quality Standards

### Type Safety
- Always define interfaces for component props
- Use Zod schemas for form validation and API responses
- Leverage TypeScript's strict mode (enabled in tsconfig.json)
- Import types with `import type { ... }`

### Performance
- Use Server Components by default
- Add `"use client"` only when needed (hooks, interactivity)
- Memoize expensive calculations with `useMemo`
- Use `useCallback` for stable function references
- Leverage Next.js Image component for images

### Error Handling
- Handle Supabase errors gracefully (check `error` object)
- Show user-friendly error messages
- Log errors to console in development
- Never expose sensitive data in error messages

### Accessibility
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios (WCAG AA)

---

## Context Documentation

The `.context/` directory contains comprehensive project documentation:

- **`.context/design-system.md`**: Complete design system documentation (colors, components, usage guidelines)
- **`.context/frontend-architecture.md`**: Detailed frontend architecture and patterns
- **`.context/api-documentation.md`**: Supabase API endpoints and authentication
- **`.context/backend-setup.md`**: Database schema and Supabase configuration
- **`.context/PBI/`**: Product backlog with epic/story structure

**Before implementing a feature**, read the relevant story documentation in `.context/PBI/epics/`.

---

## Important Notes

### Current Migration
The project is transitioning from **mock localStorage auth** to **real Supabase auth**. When you see both patterns:
- Prefer Supabase implementations
- Mock code can be removed once Supabase is fully integrated
- Check git status for files in transition

### Testing Strategy
Testing infrastructure is planned (Phase 8):
- Unit tests: Vitest + Testing Library
- E2E tests: Playwright
- Test files location: `/tests/` (to be created)
- Follow KATA architecture (documented in `docs/kata-test-architecture.md`)

### Deployment
- Target platform: Vercel
- Automatic deployments from `main` branch
- Environment variables must be configured in Vercel dashboard
- Database hosted on Supabase cloud

---

## Additional Resources

- **Setup Guide:** `SETUP.md` - Full installation and configuration instructions
- **README:** `README.md` - Project overview and feature list
- **Blueprint:** `docs/ai-driven-software-project-blueprint.md` - Complete 8-phase methodology
- **MCP Strategy:** `docs/mcp-builder-strategy.md` - Token optimization for AI tools

---

## Quick Reference

**Key Files to Understand:**
- `src/contexts/auth-context.tsx` - Auth state management
- `middleware.ts` - Route protection logic
- `src/lib/supabase/client.ts` - Supabase client setup
- `tailwind.config.ts` - Design system configuration
- `.context/design-system.md` - UI component documentation
- `.context/frontend-architecture.md` - Architecture patterns

**Common Pitfalls to Avoid:**
- Don't hardcode colors (use theme variables)
- Don't create custom buttons (use Button component)
- Don't skip type definitions (TypeScript strict mode)
- Don't use `"use client"` unnecessarily (prefer Server Components)
- Don't expose sensitive environment variables (check NEXT_PUBLIC_ prefix)
- Don't ignore middleware redirects (understand auth flow)

**When in Doubt:**
1. Check `.context/design-system.md` for UI patterns
2. Check `.context/frontend-architecture.md` for code patterns
3. Check existing components for similar implementations
4. Use MCP tools for Supabase operations
