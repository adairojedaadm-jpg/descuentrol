"use client"

import PromoCard, { Promo } from './PromoCard'
import PdfPromoCard from './PdfPromoCard'
import TieredPromoCard, { baseTieredTitle } from './TieredPromoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Bell, Inbox, Building2, Star, Zap } from 'lucide-react'

// ─── Lógica de agrupamiento escalonado ────────────────────────────────────────

type GroupedItem =
  | { kind: 'single'; promo: Promo }
  | { kind: 'tiered'; promos: Promo[] }

function groupKey(promo: Promo): string {
  const sortedDays = (promo.days_of_week as number[]).slice().sort().join(',')
  return [
    promo.discount_type,
    promo.valid_to ?? '',
    sortedDays,
    baseTieredTitle(promo.title),
  ].join('||')
}

function groupTieredPromos(promos: Promo[]): GroupedItem[] {
  const buckets = new Map<string, Promo[]>()
  for (const promo of promos) {
    const key = groupKey(promo)
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(promo)
  }

  const result: GroupedItem[] = []
  for (const group of buckets.values()) {
    if (group.length === 1) {
      result.push({ kind: 'single', promo: group[0] })
      continue
    }
    const uniqueValues = new Set(group.map(p => p.discount_value).filter(v => v !== null))
    if (uniqueValues.size > 1) {
      const sorted = [...group].sort((a, b) => (b.discount_value ?? 0) - (a.discount_value ?? 0))
      result.push({ kind: 'tiered', promos: sorted })
    } else {
      // Mismo valor en todos: mostrar solo la primera (duplicado)
      result.push({ kind: 'single', promo: group[0] })
    }
  }
  return result
}

export interface BankGroup {
  bank: { id: string; name: string; logo_url?: string | null; is_sponsored?: boolean }
  promotions: Promo[]
}

interface PromoListByBankProps {
  banks: BankGroup[]
  isLoading: boolean
  onOpenSubscribe: () => void
  recommendedBankId?: string
  sponsoredBankId?: string
}

export default function PromoListByBank({ banks, isLoading, onOpenSubscribe, recommendedBankId, sponsoredBankId }: PromoListByBankProps) {
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
          Sin beneficios para este día
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          No encontramos promociones activas para las tarjetas seleccionadas en este día. Intentá cambiar el día o seleccionar más tarjetas.
        </p>
        <Button
          type="button"
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
      {banks.map(({ bank, promotions }, index) => {
        const isRecommended = recommendedBankId === bank.id
        const isSponsored = sponsoredBankId === bank.id

        const grouped = groupTieredPromos(promotions)
        const displayCount = grouped.length

        return (
          <div key={bank.id}>
            <section className={isSponsored ? 'rounded-2xl border border-amber-200 bg-amber-50/30 p-4 -mx-4' : ''}>
              {/* Encabezado del banco */}
              <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${isSponsored ? 'border-amber-200' : isRecommended ? 'border-primary/40' : 'border-border/30'}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border font-heading text-xs font-black shadow-sm shrink-0 ${
                  isSponsored ? 'bg-amber-100 border-amber-300 text-amber-700' :
                  isRecommended ? 'bg-primary/10 border-primary/40 text-primary' :
                  'bg-background border-border/50 text-muted-foreground'
                }`}>
                  {bank.name.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">{bank.name}</h3>

                {isSponsored && (
                  <span className="flex items-center gap-1 text-3xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    <Zap className="h-2.5 w-2.5 fill-amber-600" />
                    Patrocinado
                  </span>
                )}

                {isRecommended && !isSponsored && (
                  <span className="flex items-center gap-1 text-3xs font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
                    <Star className="h-2.5 w-2.5 fill-primary" />
                    Opción Recomendada
                  </span>
                )}

                <span className="ml-auto text-3xs font-semibold text-muted-foreground bg-muted/50 border border-border/30 px-2 py-0.5 rounded-full shrink-0">
                  {displayCount} beneficio{displayCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Promos del banco (agrupadas si son escalonadas) */}
              <div className="space-y-4">
                {grouped.map((item, i) => {
                  if (item.kind === 'tiered') {
                    return <TieredPromoCard key={`tiered-${i}`} promos={item.promos} />
                  }
                  return item.promo.source_type === 'PDF'
                    ? <PdfPromoCard key={item.promo.id} promo={item.promo} />
                    : <PromoCard key={item.promo.id} promo={item.promo} />
                })}
              </div>
            </section>
          </div>
        )
      })}

      {/* Resumen final */}
      <div className="flex items-center gap-2 text-3xs text-muted-foreground py-3 border-t border-border/20">
        <Building2 className="h-3 w-3" />
        <span>{banks.length} banco{banks.length !== 1 ? 's' : ''} con beneficios activos para tus tarjetas</span>
      </div>
    </div>
  )
}
