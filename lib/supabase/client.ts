'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return new Proxy({} as SupabaseClient, {
      get: () => () => Promise.resolve({ data: null, error: null }),
    })
  }
  if (!client) {
    client = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  }
  return client
}
