import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, createSessionToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/cron') || pathname.startsWith('/api/audit')) {
    return NextResponse.next()
  }

  // Portal SSO: auto-login when ?pt=PORTAL_SSO_TOKEN is present
  const pt = (req.nextUrl.searchParams.get('pt') ?? '').trim()
  const portalSecret = (process.env.PORTAL_SSO_TOKEN ?? '').trim()
  if (pt && portalSecret && pt === portalSecret) {
    const sessionToken = await createSessionToken()
    const cleanUrl = req.nextUrl.clone()
    cleanUrl.searchParams.delete('pt')
    const res = NextResponse.redirect(cleanUrl)
    res.cookies.set('awp_auth', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return res
  }

  const token = req.cookies.get('awp_auth')?.value
  const authed = !!token && await verifySessionToken(token)

  if (!authed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|apple-icon.png).*)'],
}
