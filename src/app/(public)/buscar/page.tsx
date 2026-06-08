"use client"

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import DayFilter from '@/components/search/DayFilter'
import CardSelector, { Bank } from '@/components/search/CardSelector'
import PromoListByBank, { BankGroup } from '@/components/promo/PromoListByBank'
import SubscribeDialog from '@/components/search/SubscribeDialog'
import { CategoryIcon } from '@/components/search/CategoryIcon'
import { defaultCategories } from '@/components/search/CategoryGrid'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BellRing, Sparkles, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'

// Día actual en Paraguay (UTC-3)
function getParaguayWeekday() {
  const utcDate = new Date()
  const pyDate = new Date(utcDate.getTime() + (-3 * 60 + utcDate.getTimezoneOffset()) * 60000)
  return pyDate.getDay()
}

function SearchUI() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlCat = searchParams.get('cat') || ''
  const urlCardIds = searchParams.get('tarjetas')?.split(',').filter(Boolean) || []
  const urlDay = searchParams.get('dia') !== null ? parseInt(searchParams.get('dia')!) : null

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>(urlCardIds)
  const [selectedDay, setSelectedDay] = useState<number | null>(urlDay)
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)
  const [showCardFilter, setShowCardFilter] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const activeDay = selectedDay !== null ? selectedDay : getParaguayWeekday()
  const activeCatInfo = defaultCategories.find(c => c.slug === urlCat)

  // Redirigir al home si no hay categoría
  useEffect(() => {
    if (!urlCat) router.replace('/')
    setIsInitialized(true)
  }, [])

  // Restaurar tarjetas guardadas si no vienen en URL
  useEffect(() => {
    if (urlCardIds.length === 0) {
      const stored = localStorage.getItem('descuentrol_selected_cards')
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as string[]
          if (Array.isArray(parsed) && parsed.length > 0) setSelectedCardIds(parsed)
        } catch { /* ignorar */ }
      }
    }
  }, [])

  // Cargar bancos para el selector de tarjetas
  const { data: banks = [] } = useQuery<Bank[]>({
    queryKey: ['bancos'],
    queryFn: async () => {
      const res = await fetch('/api/bancos')
      if (!res.ok) throw new Error('Error al cargar bancos')
      const json = await res.json()
      return json.data || []
    },
    staleTime: 1000 * 60 * 15,
  })

  // Fetch de promociones — tarjetas son opcionales
  const { data, isLoading, error } = useQuery<{ banks: BankGroup[]; total: number }>({
    queryKey: ['buscar', urlCat, selectedCardIds.join(','), activeDay],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('cat', urlCat)
      params.set('dia', activeDay.toString())
      if (selectedCardIds.length > 0) params.set('tarjetas', selectedCardIds.join(','))
      const res = await fetch(`/api/buscar?${params.toString()}`)
      if (!res.ok) throw new Error('Error al obtener promociones')
      return res.json()
    },
    enabled: !!urlCat && isInitialized,
    placeholderData: { banks: [], total: 0 },
  })

  const bankGroups = data?.banks || []
  const totalPromos = data?.total || 0
  const recommendedBankId = bankGroups[0]?.bank.id

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams()
    params.set('cat', slug)
    if (selectedCardIds.length > 0) params.set('tarjetas', selectedCardIds.join(','))
    if (selectedDay !== null) params.set('dia', selectedDay.toString())
    router.push(`/buscar?${params.toString()}`)
  }

  const handleDaySelect = (day: number) => {
    setSelectedDay(day)
    const params = new URLSearchParams(searchParams.toString())
    params.set('dia', day.toString())
    router.replace(`/buscar?${params.toString()}`)
  }

  const handleCardsChange = (newIds: string[]) => {
    setSelectedCardIds(newIds)
    localStorage.setItem('descuentrol_selected_cards', JSON.stringify(newIds))
    const params = new URLSearchParams(searchParams.toString())
    if (newIds.length > 0) params.set('tarjetas', newIds.join(','))
    else params.delete('tarjetas')
    router.replace(`/buscar?${params.toString()}`)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button type="button" variant="ghost" size="icon" className="rounded-full border border-border/40 bg-background/50 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            {activeCatInfo && (
              <div className="flex items-center gap-1.5 text-3xs font-extrabold uppercase text-primary tracking-widest mb-0.5">
                <CategoryIcon name={activeCatInfo.icon} className="h-3 w-3" />
                {activeCatInfo.name}
              </div>
            )}
            <h1 className="font-heading text-2xl font-bold text-foreground">
              ¿Con qué banco te conviene hoy?
            </h1>
          </div>
        </div>
        <Button type="button" onClick={() => setIsSubscribeOpen(true)}
          className="rounded-xl bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground font-semibold gap-1.5 shadow-sm">
          <BellRing className="h-4 w-4" />
          Activar Alertas
        </Button>
      </div>

      {/* Chips de categoría */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-2">
          {defaultCategories.map(cat => (
            <button key={cat.id} type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
                urlCat === cat.slug
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground'
              }`}>
              <CategoryIcon name={cat.icon} className="h-3 w-3 shrink-0" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro de día */}
      <div className="mb-5 p-4 bg-card border border-border/40 rounded-2xl">
        <h3 className="font-heading text-xs font-bold text-foreground uppercase tracking-wider mb-3">
          ¿Qué día vas a usar la tarjeta?
        </h3>
        <DayFilter selectedDay={selectedDay} onSelectDay={handleDaySelect} />
      </div>

      {/* Filtro de tarjetas — colapsable */}
      <div className="mb-6 border border-border/40 rounded-2xl overflow-hidden">
        <button type="button"
          onClick={() => setShowCardFilter(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-xs font-semibold text-foreground">
          <span className="flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 text-primary" />
            Filtrar por mis tarjetas
            {selectedCardIds.length > 0 && (
              <span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full text-3xs font-bold">
                {selectedCardIds.length} seleccionada{selectedCardIds.length > 1 ? 's' : ''}
              </span>
            )}
          </span>
          {showCardFilter ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showCardFilter && (
          <div className="p-4 border-t border-border/20 bg-muted/10">
            <p className="text-3xs text-muted-foreground mb-3">
              Seleccioná tus tarjetas para ver solo las promos que te aplican a vos.
            </p>
            <CardSelector banks={banks} selectedCardIds={selectedCardIds} onChange={handleCardsChange} />
            {selectedCardIds.length > 0 && (
              <button type="button" onClick={() => handleCardsChange([])}
                className="mt-3 text-3xs text-muted-foreground hover:text-destructive transition-colors">
                Limpiar filtro de tarjetas
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between text-xs text-muted-foreground py-1 border-b border-border/20 mb-4">
        <span>
          {isLoading
            ? 'Buscando...'
            : `${totalPromos} beneficio${totalPromos !== 1 ? 's' : ''} en ${bankGroups.length} banco${bankGroups.length !== 1 ? 's' : ''}${selectedCardIds.length > 0 ? ' para tus tarjetas' : ''}`}
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
          isLoading={isLoading && isInitialized}
          onOpenSubscribe={() => setIsSubscribeOpen(true)}
          recommendedBankId={recommendedBankId}
        />
      )}

      <SubscribeDialog
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        categoryId={urlCat || 'combustible'}
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
