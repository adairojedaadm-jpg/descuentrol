"use client"

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import DayFilter from '@/components/search/DayFilter'
import PromoListByBank, { BankGroup } from '@/components/promo/PromoListByBank'
import SubscribeDialog from '@/components/search/SubscribeDialog'
import AdSidebar from '@/components/ads/AdSidebar'
import { CategoryIcon } from '@/components/search/CategoryIcon'
import { defaultCategories } from '@/components/search/CategoryGrid'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BellRing, Sparkles, ChevronRight } from 'lucide-react'
import type { Promo } from '@/components/promo/PromoCard'

// Día actual en Paraguay (UTC-3)
function getParaguayWeekday() {
  const utcDate = new Date()
  const pyDate = new Date(utcDate.getTime() + (-3 * 60 + utcDate.getTimezoneOffset()) * 60000)
  return pyDate.getDay()
}

// Agrupa promos planas por banco; ordena: mayor descuento primero
function groupByBank(promos: Promo[]): BankGroup[] {
  const map = new Map<string, BankGroup>()
  for (const promo of promos) {
    const key = promo.bank.id
    if (!map.has(key)) map.set(key, { bank: promo.bank, promotions: [] })
    map.get(key)!.promotions.push(promo)
  }
  return [...map.values()].sort((a, b) => {
    const maxA = Math.max(0, ...a.promotions.map(p => p.discount_value ?? 0))
    const maxB = Math.max(0, ...b.promotions.map(p => p.discount_value ?? 0))
    return maxB - maxA
  })
}

function SearchUI() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlCardIds = searchParams.get('tarjetas')?.split(',').filter(Boolean) || []
  const urlCat = searchParams.get('cat') || ''
  const urlDay = searchParams.get('dia') !== null ? parseInt(searchParams.get('dia')!) : null

  const [selectedCardIds] = useState<string[]>(urlCardIds)
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCat)
  const [selectedDay, setSelectedDay] = useState<number | null>(urlDay)
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)

  const activeDay = selectedDay !== null ? selectedDay : getParaguayWeekday()
  const activeCat = selectedCategory || urlCat

  // Si no hay tarjetas en la URL, volver al inicio
  useEffect(() => {
    if (urlCardIds.length === 0) {
      router.replace('/')
    }
  }, [])

  // Fetch promos con categoría obligatoria
  const { data: promoResponse, isLoading, error } = useQuery<{ data: Promo[]; total: number }>({
    queryKey: ['promociones', selectedCardIds.join(','), activeCat, activeDay],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('categoria', activeCat)
      params.set('tarjetas', selectedCardIds.join(','))
      params.set('dia', activeDay.toString())
      const res = await fetch(`/api/promociones?${params.toString()}`)
      if (!res.ok) throw new Error('Fallo al obtener promociones')
      return res.json()
    },
    enabled: selectedCardIds.length > 0 && activeCat.length > 0,
    placeholderData: { data: [], total: 0 },
  })

  const promos = promoResponse?.data || []
  const bankGroups = groupByBank(promos)
  const recommendedBankId = bankGroups[0]?.bank.id

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug)
    const params = new URLSearchParams(searchParams.toString())
    params.set('cat', slug)
    router.push(`/buscar?${params.toString()}`)
  }

  const handleDaySelect = (day: number) => {
    setSelectedDay(day)
    const params = new URLSearchParams(searchParams.toString())
    params.set('dia', day.toString())
    router.push(`/buscar?${params.toString()}`)
  }

  const activeCatInfo = defaultCategories.find(c => c.slug === activeCat)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button type="button" variant="ghost" size="icon" className="rounded-full border border-border/40 bg-background/50 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="text-3xs font-extrabold uppercase text-primary tracking-widest flex items-center gap-1">
              {activeCatInfo && <CategoryIcon name={activeCatInfo.icon} className="h-3 w-3" />}
              {activeCatInfo?.name ?? 'Beneficios'}
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground mt-0.5">
              ¿Con qué banco te conviene hoy?
            </h1>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsSubscribeOpen(true)}
          className="rounded-xl bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground font-semibold gap-1.5 shadow-sm"
        >
          <BellRing className="h-4 w-4" />
          <span>Activar Alertas</span>
        </Button>
      </div>

      {/* Chips de categoría para cambiar sin volver */}
      <div className="mb-6">
        <p className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cambiar categoría:</p>
        <div className="flex flex-wrap gap-2">
          {defaultCategories.map(cat => {
            const isActive = activeCat === cat.slug
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <CategoryIcon name={cat.icon} className="h-3 w-3 shrink-0" />
                {cat.name}
                {isActive && <ChevronRight className="h-2.5 w-2.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtro de día — prominente */}
      <div className="mb-6 p-4 bg-card border border-border/40 rounded-2xl">
        <h3 className="font-heading text-xs font-bold text-foreground uppercase tracking-wider mb-3">
          ¿Qué día vas a usar la tarjeta?
        </h3>
        <DayFilter selectedDay={selectedDay} onSelectDay={handleDaySelect} />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 xl:grid-cols-14 gap-8">
        <div className="xl:col-span-12 space-y-4">
          {/* Contador */}
          <div className="flex items-center justify-between text-xs text-muted-foreground py-1 border-b border-border/20">
            <span>
              {!activeCat
                ? 'Seleccioná una categoría arriba'
                : isLoading
                  ? 'Buscando...'
                  : `${promos.length} beneficio${promos.length !== 1 ? 's' : ''} en ${bankGroups.length} banco${bankGroups.length !== 1 ? 's' : ''}`}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              Actualizado semanalmente
            </span>
          </div>

          {/* Resultados */}
          {error ? (
            <div className="text-center p-8 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-xs">
              Ocurrió un error al buscar los beneficios. Por favor, reintentá.
            </div>
          ) : (
            <PromoListByBank
              banks={bankGroups}
              isLoading={isLoading}
              onOpenSubscribe={() => setIsSubscribeOpen(true)}
              recommendedBankId={recommendedBankId}
            />
          )}
        </div>

        {/* Anuncio lateral */}
        <div className="xl:col-span-2 hidden xl:block">
          <AdSidebar slot="sidebar-ad" />
        </div>
      </div>

      <SubscribeDialog
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        categoryId={activeCat || 'combustible'}
        categoryName={activeCatInfo?.name ?? 'esta categoría'}
        selectedCardNames={[]}
      />
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-7xl px-4 py-8 text-center text-xs text-muted-foreground">
        Cargando beneficios...
      </div>
    }>
      <SearchUI />
    </Suspense>
  )
}
