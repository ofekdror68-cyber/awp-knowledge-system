'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Public keys — safe to expose in client bundle
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yucirvuwucgarlfkfzqx.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y2lydnV3dWNnYXJsZmtmenF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTQwNjksImV4cCI6MjA5MjQzMDA2OX0.lXcT1zAQjzfQ3Tzbw7riiRxenU8Mn0JOcn6bDUfAtsw'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return new Proxy({} as SupabaseClient, {
      get: () => () => Promise.resolve({ data: null, error: null }),
    })
  }
  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return client
}
