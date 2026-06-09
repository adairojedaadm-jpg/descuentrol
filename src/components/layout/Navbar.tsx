"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, CreditCard, LogIn, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-primary-foreground shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            <CreditCard className="h-5 w-5 animate-pulse" />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-primary">descuen</span>
            <span className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-secondary">trol</span>
            <span className="text-accent text-xs font-semibold px-1 py-0.5 rounded bg-accent/10 border border-accent/20 ml-1">PY</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Inicio
          </Link>
          <Link
            href="/#como-funciona"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Cómo funciona
          </Link>
        </nav>

        {/* Auth — solo se muestra cuando ya cargó el estado */}
        {mounted && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <User className="h-3.5 w-3.5" />
                  <span className="max-w-[160px] truncate">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                Ingresar
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
