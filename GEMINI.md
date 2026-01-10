# Gemini Project Context: Upex My Mentor

## Project Overview

This is a **Next.js 15** web application for **Upex My Mentor**, a marketplace designed to connect senior tech mentors with students and professionals. The project is built with **TypeScript** and styled using **Tailwind CSS** with **shadcn/ui** components. The preferred runtime environment is **Bun**.

Currently, the project is an "MVP Skeleton." Key functionalities like authentication and data fetching are mocked:
- **Authentication:** A mock authentication system is in place, using the browser's `localStorage` to simulate user sessions.
- **Data:** Mentor profiles and related data are hardcoded within the repository.

The architecture is based on the Next.js App Router, and the codebase is structured to separate concerns clearly (e.g., components, contexts, lib, etc.).

## Building and Running

The project uses **Bun** for package management and script execution.

1.  **Install Dependencies:**
    ```bash
    bun install
    ```

2.  **Run Development Server:**
    Starts the application on `http://localhost:3000`.
    ```bash
    bun run dev
    ```

3.  **Validate TypeScript:**
    **Always run this before building to ensure type safety.**
    ```bash
    bun run typecheck
    ```

4.  **Create a Production Build:**
    ```bash
    bun run build
    ```

5.  **Run Production Server:**
    Starts the application from the production build.
    ```bash
    bun run start
    ```

6.  **Lint the Code:**
    Runs ESLint to check for code quality and style issues.
    ```bash
    bun run lint
    ```

## Development Conventions

The project follows a highly structured, AI-driven development methodology outlined in `README.md` and the `.context` directory.

- **Phased Development:** The workflow is broken down into distinct phases (Constitution, Architecture, Specification, Shift-Left Testing, etc.), with corresponding documentation generated and stored in the `.context` directory.
- **Jira-First Workflow:** For feature development (Epics and Stories), the convention is to first create the issue in Jira to get a real ID, and then create the corresponding local documentation folders (e.g., `EPIC-MYM-13-feature-name`).
- **Directory Structure:** A detailed directory structure is defined in the `README.md`, which should be strictly followed. All development artifacts (specs, test plans, implementation plans) are stored in a unified structure within `.context/PBI/`.
- **Code Style:** The project uses ESLint and Prettier (inferred from standard Next.js setup) to enforce a consistent code style. All new code should adhere to these standards.
- **TypeScript:** The project is written in TypeScript. Type safety should be maintained, and `any` should be avoided.
- **Components:** Reusable UI components are built using shadcn/ui and are located in `src/components/ui`.
- **State Management:** React Context is used for global state, as seen with the mock `AuthContext`.

## Atlassian (Jira) Configuration

When using Atlassian MCP tools to interact with Jira, always use the following default values:

-   **Cloud ID (`cloudId`):** `348c51d9-ae78-4544-b33e-4ee8e89a7534`
-   **Project Key (`projectKey`):** `MYM`

## Supabase Configuration

When using Supabase tools, always use the following default values:

-   **Project ID (`projectId`):** `ionevzckjyxtpmyenbxc`

## Vercel Environments Configuration

This project uses the following Vercel environment structure:

| Environment | Branch | URL | VERCEL_ENV | Usage |
|-------------|--------|-----|------------|-------|
| Development | N/A | `http://localhost:3000` | N/A | Local development |
| **staging** | `staging` | `https://staging-upexmymentor.vercel.app` | `preview` | Primary development/testing |
| Production | `main` | `https://upexmymentor.vercel.app` | `production` | Live production |

**Important Notes:**
- We **exclusively use `staging`** branch for all development and testing
- Push directly to `staging` (no PRs for bug fixes)
- Same Supabase database is shared across ALL environments (including local)
- Production (`main`) is only for final releases
- Preview and Development environments in Vercel are **NOT used** (no domains configured)

### URL Helper (`src/lib/urls.ts`)

For redirects and links that need the base URL, **always use the centralized helper**:

```typescript
import { getBaseUrl } from '@/lib/urls'

// Returns the correct URL based on environment:
// - development: 'http://localhost:3000'
// - staging: 'https://staging-upexmymentor.vercel.app'
// - production: 'https://upexmymentor.vercel.app'
const baseUrl = getBaseUrl()
```

**NEVER use `process.env.NEXT_PUBLIC_APP_URL`** - this variable does not exist. The helper detects the environment automatically using `VERCEL_ENV`.

## Stripe Configuration

This project uses **Stripe Test Mode** for all environments (educational project).

**Important Notes:**
- Same Stripe test account is used across ALL environments
- Never use live Stripe keys (this is an educational project)
- Stripe Connect uses Express accounts for mentor payouts

## Environment Variables (Complete Reference)

All variables actually used in the codebase:

| Variable | Purpose | Required |
|----------|---------|----------|
| **Supabase** |||
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client & server) | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role for RLS bypass (server only) | Yes |
| **Stripe** |||
| `STRIPE_SECRET_KEY` | Stripe secret key for server operations | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification | Yes |
| **Email (Resend)** |||
| `RESEND_API_KEY` | Resend.com API key for sending emails | For emails |
| `EMAIL_FROM_ADDRESS` | Sender address (e.g., `MyMentor <hello@...>`) | For emails |
| `EMAIL_DRY_RUN` | Set to `'true'` to log emails without sending | Optional |
| `EMAIL_API_KEY` | Secret to protect email API endpoints | For testing |
| **Security** |||
| `CRON_SECRET` | Vercel Cron job authorization header | For cron |
| **System (Automatic)** |||
| `NODE_ENV` | `'development'` or `'production'` (auto) | Auto |
| `VERCEL_ENV` | `'production'`, `'preview'`, or `'development'` (auto in Vercel) | Auto |

**Note:** `NEXT_PUBLIC_APP_URL` is **NOT used**. Use `getBaseUrl()` from `@/lib/urls` instead.
