"use client"

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import CardSelector, { Bank } from '@/components/search/CardSelector'
import DayFilter from '@/components/search/DayFilter'
import PromoListByBank from '@/components/promo/PromoListByBank'
import SubscribeDialog from '@/components/search/SubscribeDialog'
import AdSidebar from '@/components/ads/AdSidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard, BellRing, Sparkles } from 'lucide-react'
import type { BankBenefits } from '@/app/api/beneficios/route'

function SearchUI() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlCardIds = searchParams.get('tarjetas')?.split(',').filter(Boolean) || []
  const urlDay = searchParams.get('dia') !== null ? parseInt(searchParams.get('dia')!) : null

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>(urlCardIds)
  const [selectedDay, setSelectedDay] = useState<number | null>(urlDay)
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Día actual en Paraguay (UTC-3)
  function getParaguayWeekday() {
    const utcDate = new Date()
    const pyDate = new Date(utcDate.getTime() + (-3 * 60 + utcDate.getTimezoneOffset()) * 60000)
    return pyDate.getDay()
  }

  const activeDay = selectedDay !== null ? selectedDay : getParaguayWeekday()

  // Cargar bancos para el selector de tarjetas
  const { data: banks = [], isLoading: isBanksLoading } = useQuery<Bank[]>({
    queryKey: ['bancos'],
    queryFn: async () => {
      const res = await fetch('/api/bancos')
      if (!res.ok) throw new Error('Fallo al obtener bancos')
      const json = await res.json()
      return json.data || []
    },
    staleTime: 1000 * 60 * 15,
  })

  // Cargar beneficios por banco
  const { data: beneficiosResponse, isLoading: isBeneficiosLoading, error: beneficiosError } = useQuery<{ banks: BankBenefits[]; total: number }>({
    queryKey: ['beneficios', selectedCardIds.join(','), activeDay],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('tarjetas', selectedCardIds.join(','))
      params.set('dia', activeDay.toString())
      const res = await fetch(`/api/beneficios?${params.toString()}`)
      if (!res.ok) throw new Error('Fallo al obtener beneficios')
      return res.json()
    },
    enabled: isInitialized && selectedCardIds.length > 0,
    placeholderData: { banks: [], total: 0 }
  })

  const banksBenefits = beneficiosResponse?.banks || []
  const totalBeneficios = beneficiosResponse?.total || 0

  // Sincronización inicial con localStorage
  useEffect(() => {
    if (urlCardIds.length > 0) {
      setSelectedCardIds(urlCardIds)
      localStorage.setItem('descuentrol_selected_cards', JSON.stringify(urlCardIds))
    } else {
      const stored = localStorage.getItem('descuentrol_selected_cards')
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as string[]
          if (parsed.length > 0) {
            setSelectedCardIds(parsed)
            const params = new URLSearchParams(searchParams.toString())
            params.set('tarjetas', parsed.join(','))
            router.replace(`/buscar?${params.toString()}`)
          }
        } catch {
          // Ignorar errores de parsing
        }
      }
    }
    setIsInitialized(true)
  }, [])

  const handleCardsChange = (newIds: string[]) => {
    setSelectedCardIds(newIds)
    localStorage.setItem('descuentrol_selected_cards', JSON.stringify(newIds))
    const params = new URLSearchParams(searchParams.toString())
    if (newIds.length > 0) {
      params.set('tarjetas', newIds.join(','))
    } else {
      params.delete('tarjetas')
    }
    router.push(`/buscar?${params.toString()}`)
  }

  const handleDaySelect = (day: number) => {
    setSelectedDay(day)
    const params = new URLSearchParams(searchParams.toString())
    params.set('dia', day.toString())
    router.push(`/buscar?${params.toString()}`)
  }

  const getSelectedCardNames = () => {
    const names: string[] = []
    banks.forEach(bank => {
      bank.cards.forEach(card => {
        if (selectedCardIds.includes(card.id)) {
          names.push(`${bank.name.replace('Banco ', '').trim()} ${card.name.replace(bank.name, '').trim()}`)
        }
      })
    })
    return names
  }

  const showSkeleton = !isInitialized || isBanksLoading || (isBeneficiosLoading && selectedCardIds.length > 0)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full border border-border/40 bg-background/50 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="text-3xs font-extrabold uppercase text-primary tracking-widest">
              Beneficios disponibles
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground mt-0.5">
              Tus tarjetas, hoy
            </h1>
          </div>
        </div>

        <Button
          onClick={() => setIsSubscribeOpen(true)}
          className="rounded-xl bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground font-semibold gap-1.5 shadow-sm"
        >
          <BellRing className="h-4 w-4" />
          <span>Activar Alertas</span>
        </Button>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-14 gap-8">
        {/* Columna izquierda: selector de tarjetas */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Mis Tarjetas</span>
            </h2>
            <p className="text-3xs text-muted-foreground leading-normal">
              Marcá las tarjetas que tenés. Solo se guardan en este dispositivo.
            </p>
          </div>

          {isBanksLoading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="p-4 border border-border/40 rounded-xl bg-card">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2 items-center">
                      <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                      <div className="h-4 w-28 bg-muted animate-pulse" />
                    </div>
                    <div className="h-4 w-12 bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CardSelector
              banks={banks}
              selectedCardIds={selectedCardIds}
              onChange={handleCardsChange}
            />
          )}
        </div>

        {/* Columna derecha: filtro de día + resultados */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          {/* Filtro de día */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-foreground uppercase tracking-wider">
              Filtrar por día de uso:
            </h3>
            <DayFilter
              selectedDay={selectedDay}
              onSelectDay={handleDaySelect}
            />
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center justify-between text-xs text-muted-foreground py-1 border-b border-border/20">
            <span>
              {selectedCardIds.length === 0
                ? 'Marcá tus tarjetas a la izquierda para ver resultados'
                : `${totalBeneficios} beneficio${totalBeneficios !== 1 ? 's' : ''} en ${banksBenefits.length} banco${banksBenefits.length !== 1 ? 's' : ''}`}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              Sincronizado con base de datos
            </span>
          </div>

          {/* Resultados */}
          {beneficiosError ? (
            <div className="text-center p-8 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-xs">
              Ocurrió un error al buscar los beneficios. Por favor, reintentá.
            </div>
          ) : (
            <PromoListByBank
              banks={banksBenefits}
              isLoading={showSkeleton}
              onOpenSubscribe={() => setIsSubscribeOpen(true)}
            />
          )}
        </div>

        {/* Anuncio lateral */}
        <div className="xl:col-span-2 hidden xl:block">
          <AdSidebar slot="sidebar-ad" />
        </div>
      </div>

      {/* Modal de suscripción — usa primera categoría disponible como contexto */}
      <SubscribeDialog
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        categoryId="combustible"
        categoryName="todos los beneficios"
        selectedCardNames={getSelectedCardNames()}
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
