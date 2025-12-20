import { notFound } from "next/navigation";
import { RedocViewer } from "./redoc-viewer";
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

export default function ApiDocuPage() {
  // Return 404 in production environment
  if (!isAllowedEnvironment()) {
    notFound();
  }

  // Build the OpenAPI spec URL
  const specUrl = `${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`;

  return <RedocViewer specUrl={specUrl} />;
}
