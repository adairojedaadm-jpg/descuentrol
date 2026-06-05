"use client"

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import CardSelector, { Bank } from '@/components/search/CardSelector'
import DayFilter from '@/components/search/DayFilter'
import PromoList from '@/components/promo/PromoList'
import SubscribeDialog from '@/components/search/SubscribeDialog'
import AdBanner from '@/components/ads/AdBanner'
import AdSidebar from '@/components/ads/AdSidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard, BellRing, Sparkles } from 'lucide-react'
import { Promo } from '@/components/promo/PromoCard'

function SearchUI() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const categorySlug = searchParams.get('cat') || 'combustible'
  const urlCardIds = searchParams.get('tarjetas')?.split(',').filter(Boolean) || []
  const urlDay = searchParams.get('dia') !== null ? parseInt(searchParams.get('dia')!) : null

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>(urlCardIds)
  const [selectedDay, setSelectedDay] = useState<number | null>(urlDay)
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Nombre legible de la categoría
  const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)

  // 1. Obtener Bancos y Tarjetas del API
  const { data: banks = [], isLoading: isBanksLoading } = useQuery<Bank[]>({
    queryKey: ['bancos'],
    queryFn: async () => {
      const res = await fetch('/api/bancos')
      if (!res.ok) throw new Error('Fallo al obtener bancos')
      const json = await res.json()
      return json.data || []
    },
    staleTime: 1000 * 60 * 15, // Cache por 15 minutos en cliente
  })

  // 2. Obtener Promociones según filtros
  // Solo se ejecuta si el usuario tiene al menos una tarjeta seleccionada
  const activeDay = selectedDay !== null ? selectedDay : getParaguayWeekday()

  const { data: promosResponse, isLoading: isPromosLoading, error: promosError } = useQuery<{ data: Promo[]; total: number }>({
    queryKey: ['promociones', categorySlug, selectedCardIds.join(','), activeDay],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('categoria', categorySlug)
      params.set('tarjetas', selectedCardIds.join(','))
      params.set('dia', activeDay.toString())
      
      const res = await fetch(`/api/promociones?${params.toString()}`)
      if (!res.ok) throw new Error('Fallo al obtener promociones')
      return res.json()
    },
    enabled: isInitialized && selectedCardIds.length > 0, // No correr si no hay tarjetas o no se cargó el localStorage
    placeholderData: { data: [], total: 0 }
  })

  const promos = promosResponse?.data || []

  // Helper para obtener el día actual en Asunción (UTC-3)
  function getParaguayWeekday() {
    const utcDate = new Date()
    const pyOffset = -3 * 60
    const pyDate = new Date(utcDate.getTime() + (pyOffset + utcDate.getTimezoneOffset()) * 60000)
    return pyDate.getDay()
  }

  // 3. Sincronización Inicial con LocalStorage
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

  // 4. Cambios en selección de tarjetas
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

  // 5. Cambios en selección de día
  const handleDaySelect = (day: number) => {
    setSelectedDay(day)
    const params = new URLSearchParams(searchParams.toString())
    params.set('dia', day.toString())
    router.push(`/buscar?${params.toString()}`)
  }

  // Nombres de tarjetas seleccionadas para prellenar la suscripción
  const getSelectedCardNames = () => {
    const names: string[] = []
    if (banks.length > 0) {
      banks.forEach(bank => {
        bank.cards.forEach(card => {
          if (selectedCardIds.includes(card.id)) {
            names.push(`${bank.name.replace('Banco ', '').trim()} ${card.name.replace(bank.name, '').trim()}`)
          }
        })
      })
    }
    return names
  }

  const showSkeleton = !isInitialized || isBanksLoading || (isPromosLoading && selectedCardIds.length > 0)

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
            <div className="flex items-center gap-2">
              <span className="text-3xs font-extrabold uppercase text-primary tracking-widest">
                Categoría seleccionada:
              </span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground mt-0.5">
              {categoryName}
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

      {/* Grid de Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-14 gap-8">
        {/* Columna Izquierda: Selector de Tarjetas */}
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

        {/* Columna Derecha: Resultados y Filtro de Día */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          {/* Filtro de día */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-xs font-bold text-foreground uppercase tracking-wider">
                Filtrar por día de uso:
              </h3>
            </div>
            <DayFilter 
              selectedDay={selectedDay} 
              onSelectDay={handleDaySelect} 
            />
          </div>

          {/* Estado de Resultados */}
          <div className="flex items-center justify-between text-xs text-muted-foreground py-1 border-b border-border/20">
            <span>
              {selectedCardIds.length === 0 
                ? 'Marcá tus tarjetas a la izquierda para ver resultados' 
                : `${promos.length} beneficio${promos.length !== 1 ? 's' : ''} disponible${promos.length !== 1 ? 's' : ''}`}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              Sincronizado con base de datos
            </span>
          </div>

          {/* Lista de Promociones */}
          {promosError ? (
            <div className="text-center p-8 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-xs">
              Ocurrió un error al buscar las promociones. Por favor, reintentá.
            </div>
          ) : (
            <>
              {promos.length > 0 && <AdBanner slot="top-results-ad" className="mb-4" />}
              <PromoList 
                promos={promos} 
                isLoading={showSkeleton} 
                isDbEmpty={false} // Se asume que no está vacía si banks cargaron, o se maneja en promos.length = 0
                onOpenSubscribe={() => setIsSubscribeOpen(true)}
              />
            </>
          )}
        </div>

        {/* Columna Anuncio Lateral Derecha (Sticky) */}
        <div className="xl:col-span-2 hidden xl:block">
          <AdSidebar slot="sidebar-ad" />
        </div>
      </div>

      {/* Modal de Suscripción */}
      <SubscribeDialog
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        categoryId={categorySlug}
        categoryName={categoryName}
        selectedCardNames={getSelectedCardNames()}
      />
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-7xl px-4 py-8 text-center text-xs text-muted-foreground">
        Cargando filtros y buscador...
      </div>
    }>
      <SearchUI />
    </Suspense>
  )
}
