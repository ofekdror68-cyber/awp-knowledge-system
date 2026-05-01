import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken } from '@/lib/auth'

const USERS: Record<string, string | undefined> = {
  'הדס':  process.env.AWP_HADAS_PASSWORD,
  'מידן': process.env.AWP_MIDAN_PASSWORD,
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const expected = USERS[username]
  if (!expected || password !== expected) {
    await new Promise(r => setTimeout(r, 400))
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const token = await createSessionToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('awp_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
