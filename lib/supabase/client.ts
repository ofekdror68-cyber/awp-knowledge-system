'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // Return a no-op proxy during SSR — data is always fetched client-side
    return new Proxy({} as SupabaseClient, {
      get: () => () => Promise.resolve({ data: null, error: null }),
    })
  }
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
