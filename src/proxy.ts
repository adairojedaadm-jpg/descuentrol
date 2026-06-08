import { NextRequest, NextResponse } from 'next/server'

export const ADMIN_COOKIE = 'descuentrol_admin'

function expectedToken(password: string) {
  return btoa(`admin:${password}`)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas libres: la página de login y la API de autenticación
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return new NextResponse('Servidor no configurado.', { status: 503 })
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value

    if (token !== expectedToken(adminPassword)) {
      // API → 401 JSON
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
      // Página → redirigir al login
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
