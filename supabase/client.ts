import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // ⚠️ WARNING: Hardcoding keys is a security risk and NOT recommended for production.
  // This is for debugging in the v0 preview environment only.
  // Please set these as environment variables in your Vercel project for production.
  const hardcodedSupabaseUrl = "https://pvkafyeazzwvfdgvcfvc.supabase.co"
  const hardcodedSupabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a2FmeWVhenp3dmZkZ3ZjZnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODY1MzAsImV4cCI6MjA1OTM2MjUzMH0.0QK5NH8JdpGIaAyD7MeHWyBKZbnPgjZv85xRD9qQf-o"

  // Attempt to use environment variables first, fall back to hardcoded for preview debugging
  const supabaseUrl = process.env.Music_ai_database_NEXT_PUBLIC_SUPABASE_URL || hardcodedSupabaseUrl
  const supabaseAnonKey = process.env.Music_ai_database_NEXT_PUBLIC_SUPABASE_ANON_KEY || hardcodedSupabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    // This error should ideally not be hit with the hardcoded fallback,
    // but remains as a safeguard if both env vars and hardcoded values are missing.
    throw new Error(
      "Supabase URL and Anon Key are required for the client-side. " +
        "Please ensure 'Music_ai_database_NEXT_PUBLIC_SUPABASE_URL' and " +
        "'Music_ai_database_NEXT_PUBLIC_SUPABASE_ANON_KEY' are set in your Vercel project's environment variables, " +
        "or provided directly for debugging.",
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
