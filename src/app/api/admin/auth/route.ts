import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/proxy'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 días
}

// POST /api/admin/auth  →  login
export async function POST(request: NextRequest) {
  const { password } = await request.json()

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ error: 'Servidor no configurado.' }, { status: 503 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 })
  }

  const token = btoa(`admin:${adminPassword}`)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, token, COOKIE_OPTIONS)
  return response
}

// DELETE /api/admin/auth  →  logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 })
  return response
}
