import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return new NextResponse('Servidor no configurado correctamente.', { status: 503 })
    }

    const validAuth = 'Basic ' + btoa(`admin:${adminPassword}`)

    if (authHeader !== validAuth) {
      return new NextResponse('Acceso denegado', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Descuentrol Admin"' }
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}
