import HomeSearch from '@/components/search/HomeSearch'
import { Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Búsqueda anónima, rápida y sin registro</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
          ¿Qué tarjeta te conviene usar <span className="bg-gradient-to-r from-primary via-primary-foreground to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse">hoy</span> en Paraguay?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Seleccioná tus tarjetas y descubrí todos los beneficios disponibles en cada banco, ordenados para que no pierdas ni un descuento.
        </p>
      </section>

      {/* Selector de tarjetas */}
      <section className="max-w-2xl mx-auto mb-20">
        <HomeSearch />
      </section>

      {/* How it works Section */}
      <section className="border-t border-border/40 pt-16 mb-8">
        <h3 className="font-heading text-2xl font-bold tracking-tight text-center text-foreground mb-12">
          Cómo funciona Descuentrol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-4 font-bold font-heading text-lg">
              1
            </div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">Marcás tus tarjetas</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Indicá qué tarjetas de crédito tenés en tu billetera. Solo se guardan localmente en tu navegador.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 border border-secondary/20 text-secondary mb-4 font-bold font-heading text-lg">
              2
            </div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">Ves todos los beneficios</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Te mostramos todos los descuentos y promociones activas para esas tarjetas, organizados por banco.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent-foreground mb-4 font-bold font-heading text-lg">
              3
            </div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">¡Ahorrás al instante!</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Sabés exactamente qué tarjeta usar en cada comercio para aprovechar el mayor beneficio disponible.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
