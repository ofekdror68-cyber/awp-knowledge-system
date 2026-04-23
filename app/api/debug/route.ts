import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anthropic = process.env.ANTHROPIC_API_KEY

  return NextResponse.json({
    url: url ? url.substring(0, 30) + '...' : 'MISSING',
    anon: anon ? anon.substring(0, 20) + '...' : 'MISSING',
    service: service ? service.substring(0, 20) + '...' : 'MISSING',
    anthropic: anthropic ? anthropic.substring(0, 15) + '...' : 'MISSING',
  })
}
