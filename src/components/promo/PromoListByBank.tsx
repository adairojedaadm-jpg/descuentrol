"use client"

import PromoCard, { Promo } from './PromoCard'
import PdfPromoCard from './PdfPromoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Bell, Inbox, Info, Building2 } from 'lucide-react'
import type { BankBenefits } from '@/app/api/beneficios/route'

interface PromoListByBankProps {
  banks: BankBenefits[]
  isLoading: boolean
  onOpenSubscribe: () => void
}

export default function PromoListByBank({ banks, isLoading, onOpenSubscribe }: PromoListByBankProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((n) => (
          <div key={n} className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            {[1, 2].map((m) => (
              <div key={m} className="flex flex-col md:flex-row gap-5 p-5 border border-border/40 rounded-2xl bg-card">
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
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (banks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-card border border-border/40 rounded-2xl shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border/80 mb-4">
          <Inbox className="h-7 w-7" />
        </div>
        <h4 className="font-heading text-lg font-bold text-foreground mb-2">
          Sin beneficios para hoy
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          No encontramos promociones activas para las tarjetas seleccionadas en este día. Intentá cambiar el día o seleccionar más tarjetas.
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

  return (
    <div className="space-y-10">
      {banks.map(({ bank, promotions }) => (
        <section key={bank.id}>
          {/* Encabezado del banco */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background border border-border/50 font-heading text-xs font-black text-muted-foreground shadow-sm shrink-0">
              {bank.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="font-heading text-base font-bold text-foreground">{bank.name}</h3>
            <span className="ml-auto text-3xs font-semibold text-muted-foreground bg-muted/50 border border-border/30 px-2 py-0.5 rounded-full shrink-0">
              {promotions.length} beneficio{promotions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Promos del banco */}
          <div className="space-y-4">
            {promotions.map((promo) => {
              const promoTyped = promo as unknown as Promo
              return promo.source_type === 'PDF'
                ? <PdfPromoCard key={promo.id} promo={promoTyped} />
                : <PromoCard key={promo.id} promo={promoTyped} />
            })}
          </div>
        </section>
      ))}

      {/* Resumen final */}
      <div className="flex items-center gap-2 text-3xs text-muted-foreground py-3 border-t border-border/20">
        <Building2 className="h-3 w-3" />
        <span>{banks.length} banco{banks.length !== 1 ? 's' : ''} con beneficios activos para tus tarjetas</span>
      </div>
    </div>
  )
}
