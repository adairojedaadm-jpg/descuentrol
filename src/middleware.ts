import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Proteger tanto el panel administrativo visual como los API routes de administración
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return new NextResponse('Servidor no configurado correctamente.', { status: 503 })
    }

    // btoa es una API web estándar compatible con Next.js Edge Runtime (a diferencia de Buffer)
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
