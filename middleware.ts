import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/types/supabase'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })
  
  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()
  
  // Add security headers for HTML/JSON responses only
  const accept = request.headers.get('accept') || ''
  if (accept.includes('text/html') || accept.includes('application/json')) {
    res.headers.set('Content-Security-Policy', [
      "default-src 'self';",
      "img-src 'self' data: https:;",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
      "style-src 'self' 'unsafe-inline';",
      "font-src 'self' data:;",
      "connect-src *;",
      "frame-ancestors 'none';"
    ].join(' '))
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  }
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 