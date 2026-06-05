"use client"

import PromoCard, { Promo } from './PromoCard'
import PdfPromoCard from './PdfPromoCard'
import AdBanner from '../ads/AdBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, HelpCircle, Inbox, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PromoListProps {
  promos: Promo[]
  isLoading: boolean
  isDbEmpty: boolean // True if no promos exist in the entire db
  onOpenSubscribe: () => void
}

export default function PromoList({ promos, isLoading, isDbEmpty, onOpenSubscribe }: PromoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-col md:flex-row gap-5 p-5 border border-border/40 rounded-2xl bg-card">
            <div className="flex md:flex-col items-center justify-center md:w-36 shrink-0 gap-3">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex-1 space-y-3 py-1">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 1. Database is empty (Scraper hasn't run yet)
  if (isDbEmpty) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-muted/20 border border-dashed border-border/80 rounded-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
          <Info className="h-7 w-7" />
        </div>
        <h4 className="font-heading text-lg font-bold text-foreground mb-2">
          Sin datos en la plataforma
        </h4>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Aún no se ha realizado la primera extracción de datos. Los scrapers automáticos corren los domingos de madrugada.
        </p>
        <div className="flex gap-3">
          <Button 
            onClick={onOpenSubscribe}
            className="rounded-xl px-5 font-semibold gap-1.5"
          >
            <Bell className="h-4 w-4" />
            <span>Suscribirme a Alertas</span>
          </Button>
        </div>
      </div>
    )
  }

  // 2. No promos found for filters
  if (promos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-card border border-border/40 rounded-2xl shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border/80 mb-4">
          <Inbox className="h-7 w-7" />
        </div>
        <h4 className="font-heading text-lg font-bold text-foreground mb-2">
          No hay promociones para hoy
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          No encontramos ofertas activas para esta categoría con las tarjetas que seleccionaste. Intentá seleccionando más tarjetas o cambiando el día de la semana.
        </p>
        <Button 
          variant="outline"
          onClick={onOpenSubscribe}
          className="rounded-xl px-5 border-border/60 hover:bg-muted/50 font-semibold gap-1.5"
        >
          <Bell className="h-4 w-4 text-primary" />
          <span>Avisarme cuando haya promos</span>
        </Button>
      </div>
    )
  }

  // 3. Render Promos List with Ads
  return (
    <div className="space-y-4">
      {promos.map((promo, index) => {
        const showAdAfter = (index + 1) % 5 === 0
        
        return (
          <div key={promo.id} className="space-y-4">
            {promo.source_type === 'PDF' ? (
              <PdfPromoCard promo={promo} />
            ) : (
              <PromoCard promo={promo} />
            )}

            {/* Ad Banner placeholder every 5 items */}
            {showAdAfter && (
              <AdBanner slot="in-feed-ad" />
            )}
          </div>
        )
      })}
    </div>
  )
}
