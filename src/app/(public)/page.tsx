import CategoryGrid, { Category } from '@/components/search/CategoryGrid'
import { getActiveCategories } from '@/lib/db/categories'
import { Sparkles, Flame } from 'lucide-react'

// Revalidar el caché del Home cada 15 minutos
export const revalidate = 900

export default async function Home() {
  let categories: Category[] = []
  
  try {
    categories = await getActiveCategories()
  } catch (error) {
    console.error('Error cargando categorías reales, usando fallbacks:', error)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Búsqueda anónima, rápida y sin registro</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
          ¿Qué tarjeta te conviene usar <span className="bg-gradient-to-r from-primary via-primary-foreground to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse">hoy</span> en Paraguay?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Evitá leer las letras chicas de los correos de los bancos. Seleccioná lo que necesitás comprar, indicá tus tarjetas y descubrí tu mejor descuento en segundos.
        </p>
      </section>

      {/* Categories Grid */}
      <section className="mb-20">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground mb-6 flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <span>Elegí una categoría para empezar</span>
        </h2>
        {/* Si categories es un array vacío, CategoryGrid usará sus valores predefinidos */}
        <CategoryGrid categories={categories.length > 0 ? categories : undefined} />
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
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">Elegís lo que buscás</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Seleccioná combustibles, supermercados o la categoría del beneficio que querés aprovechar hoy.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 border border-secondary/20 text-secondary mb-4 font-bold font-heading text-lg">
              2
            </div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">Marcás tus tarjetas</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Indicás qué tarjetas de crédito tenés en tu billetera. Solo se guardan localmente en tu navegador.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent-foreground mb-4 font-bold font-heading text-lg">
              3
            </div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">¡Ahorrás al instante!</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Te mostramos ordenado por mayor descuento qué tarjeta te conviene pasar hoy por el pos.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
