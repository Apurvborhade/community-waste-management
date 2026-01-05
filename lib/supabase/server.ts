import { createServerClient } from "@supabase/ssr"

/**
 * Creates a Supabase client on the server using cookie methods from next/headers.
 * Make sure to always pass the up-to-date cookies from the request (`headers().get('cookie')`)
 * to keep your auth state synced and ensure protected routes work after login.
 * 
 * Usage example in a Server Component or Route Handler:
 * 
 * import { cookies } from "next/headers"
 * const supabase = createClient(cookies())
 */
export function createClient(cookieStore: {
  getAll: () => { name: string; value: string; path?: string }[]
  set?: (name: string, value: string, options?: any) => void
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Always return up-to-date cookies.
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          if (typeof cookieStore.set === "function") {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set!(name, value, options)
            )
          }
          // If set is not available (read-only), do nothing.
        },
      },
    }
  )
}
