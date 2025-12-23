import { notFound } from "next/navigation";
import { RedocViewer } from "./redoc-viewer";
import { ApiDocSelector } from "./api-doc-selector";
import { supabaseUrl, supabaseAnonKey } from "@/lib/config";

// Check if we're in an allowed environment (development, staging, preview)
function isAllowedEnvironment(): boolean {
  // VERCEL_ENV is auto-injected by Vercel: 'production' | 'preview' | 'development'
  // This is server-side only (no NEXT_PUBLIC_ prefix needed in Server Components)
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv) {
    // On Vercel: allow preview (staging) and development, block production
    return vercelEnv !== "production";
  }

  // Local development: use NODE_ENV
  return process.env.NODE_ENV === "development";
}

interface PageProps {
  searchParams: Promise<{ api?: string }>;
}

export default async function ApiDocuPage({ searchParams }: PageProps) {
  // Return 404 in production environment
  if (!isAllowedEnvironment()) {
    notFound();
  }

  const params = await searchParams;
  const apiType = params.api || "nextjs"; // Default to Next.js API

  // Build the OpenAPI spec URL based on selected API
  const specUrl =
    apiType === "supabase"
      ? `${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`
      : "/api/openapi";

  return (
    <div className="min-h-screen bg-background">
      <ApiDocSelector currentApi={apiType} />
      <RedocViewer specUrl={specUrl} />
    </div>
  );
}
