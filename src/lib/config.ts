// src/lib/config.ts

// This file centralizes the access to environment variables.
// Next.js automatically loads environment variables from .env, etc.
// and makes them available in the process.env object.

// Variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Basic validation to ensure the variables are set.
if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}
