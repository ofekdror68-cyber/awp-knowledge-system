import { NextResponse } from 'next/server'

// Debug endpoint removed — exposes env var presence to unauthenticated callers.
// Auth is now handled centrally in middleware.ts.
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
