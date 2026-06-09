"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, UserPlus, CheckCircle2, CreditCard } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    })

    if (error) {
      setError(
        error.message === 'User already registered'
          ? 'Ya existe una cuenta con ese email. ¿Querés iniciar sesión?'
          : 'Ocurrió un error. Intentá de nuevo.'
      )
      setLoading(false)
      return
    }

    // Si hay sesión activa, la confirmación de email está desactivada → redirigir directo
    if (data.session) {
      router.push('/')
      router.refresh()
      return
    }

    // Si no hay sesión, Supabase envió un email de confirmación
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 border border-green-200 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">¡Revisá tu email!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Te enviamos un link de confirmación a{' '}
            <span className="font-semibold text-foreground">{email}</span>.
            Hacé clic en el link para activar tu cuenta.
          </p>
          <p className="text-xs text-muted-foreground">
            ¿No lo encontrás? Revisá la carpeta de spam.
          </p>
          <Link
            href="/login"
            className="inline-block mt-2 text-sm font-semibold text-primary hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-primary-foreground shadow-md mb-4">
            <CreditCard className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            <span className="text-primary">descuen</span>
            <span className="text-secondary">trol</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Creá tu cuenta gratis</p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border/50 rounded-2xl shadow-sm p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoFocus
                disabled={loading}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-foreground">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
              Repetí la contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Creando cuenta...</>
            ) : (
              <><UserPlus className="h-4 w-4" />Crear cuenta</>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-5">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
