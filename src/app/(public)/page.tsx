import CategoryGrid from '@/components/search/CategoryGrid'
import { Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Búsqueda anónima, rápida y sin registro</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
          ¿Qué tarjeta te conviene usar{' '}
          <span className="bg-gradient-to-r from-primary via-primary-foreground to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse">
            hoy
          </span>{' '}
          en Paraguay?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Elegí qué querés comprar y te mostramos todos los descuentos disponibles, organizados por banco.
        </p>
      </section>

      {/* Grilla de categorías */}
      <section className="mb-20">
        <h2 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider text-center mb-6 flex items-center justify-center gap-2">
          <span className="h-px flex-1 bg-border/40 max-w-[80px]" />
          ¿Qué categoría te interesa?
          <span className="h-px flex-1 bg-border/40 max-w-[80px]" />
        </h2>
        <CategoryGrid />
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="border-t border-border/40 pt-16 mb-8">
        <h3 className="font-heading text-2xl font-bold tracking-tight text-center text-foreground mb-12">
          Cómo funciona Descuentrol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-4 font-bold font-heading text-lg">
              1
            </div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">Elegís la categoría</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Seleccioná qué tipo de gasto te interesa: combustible, farmacia, supermercado y más.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 border border-secondary/20 text-secondary mb-4 font-bold font-heading text-lg">
              2
            </div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">Ves todos los bancos</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Te mostramos qué banco tiene mejor descuento para esa categoría, con la opción recomendada destacada.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent-foreground mb-4 font-bold font-heading text-lg">
              3
            </div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">¡Ahorrás al instante!</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Filtrá por tus tarjetas y por día para ver exactamente qué te conviene usar hoy.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
