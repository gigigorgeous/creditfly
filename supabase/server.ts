import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()
  // These environment variables MUST be set in your Vercel project dashboard.
  const supabaseUrl = process.env.Music_ai_database_NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.Music_ai_database_NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key are required for the server-side. " +
        "Please ensure 'Music_ai_database_NEXT_PUBLIC_SUPABASE_URL' and " +
        "'Music_ai_database_NEXT_PUBLIC_SUPABASE_ANON_KEY' are set in your Vercel project's environment variables.",
    )
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called from a Server Component or Route Handler.
          // This error is `TypeError: cookies().set() is not a function`.
          console.warn("Could not set cookie from server client:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          console.warn("Could not remove cookie from server client:", error)
        }
      },
    },
  })
}
