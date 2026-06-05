"use client"

import Link from 'next/link'
import { Sparkles, CreditCard } from 'lucide-react'

export default function Navbar() {
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
      </div>
    </header>
  )
}
