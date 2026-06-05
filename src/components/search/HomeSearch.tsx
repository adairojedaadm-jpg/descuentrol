"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import CardSelector, { Bank } from '@/components/search/CardSelector'
import { CategoryIcon } from '@/components/search/CategoryIcon'
import { defaultCategories } from '@/components/search/CategoryGrid'
import { Button } from '@/components/ui/button'
import { ArrowRight, CreditCard, ChevronRight } from 'lucide-react'

export default function HomeSearch() {
  const router = useRouter()
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: banks = [], isLoading } = useQuery<Bank[]>({
    queryKey: ['bancos'],
    queryFn: async () => {
      const res = await fetch('/api/bancos')
      if (!res.ok) throw new Error('Fallo al obtener bancos')
      const json = await res.json()
      return json.data || []
    },
    staleTime: 1000 * 60 * 15,
  })

  useEffect(() => {
    const stored = localStorage.getItem('descuentrol_selected_cards')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[]
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedCardIds(parsed)
      } catch {
        // ignorar
      }
    }
    setIsInitialized(true)
  }, [])

  const handleCardsChange = (newIds: string[]) => {
    setSelectedCardIds(newIds)
    localStorage.setItem('descuentrol_selected_cards', JSON.stringify(newIds))
    if (newIds.length === 0) setSelectedCategory(null)
  }

  const handleVerResultados = () => {
    if (selectedCardIds.length === 0 || !selectedCategory) return
    router.push(`/buscar?tarjetas=${selectedCardIds.join(',')}&cat=${selectedCategory}`)
  }

  const step2Visible = isInitialized && selectedCardIds.length > 0

  return (
    <div className="space-y-8">
      {/* PASO 1: Tarjetas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">1</div>
          <h2 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-primary" />
            Elegí tus tarjetas
          </h2>
          {isInitialized && selectedCardIds.length > 0 && (
            <span className="ml-auto text-3xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              {selectedCardIds.length} seleccionada{selectedCardIds.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isLoading || !isInitialized ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-4 border border-border/40 rounded-xl bg-card animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <div className="h-8 w-8 rounded-lg bg-muted" />
                    <div className="h-4 w-28 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-12 bg-muted rounded" />
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

        {isInitialized && selectedCardIds.length === 0 && (
          <p className="text-center text-3xs text-muted-foreground">
            Marcá al menos una tarjeta para continuar
          </p>
        )}
      </div>

      {/* PASO 2: Categoría — aparece cuando hay tarjetas seleccionadas */}
      {step2Visible && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold shrink-0">2</div>
            <h2 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider">
              ¿Qué categoría te interesa?
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {defaultCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 text-xs font-semibold ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <ChevronRight className="h-3 w-3 ml-auto shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA — visible cuando hay categoría seleccionada */}
      {step2Visible && (
        <Button
          type="button"
          onClick={handleVerResultados}
          disabled={!selectedCategory}
          className="w-full rounded-xl font-semibold gap-2 h-12 text-sm shadow-sm disabled:opacity-40"
        >
          <span>
            {selectedCategory
              ? `Ver descuentos en ${defaultCategories.find(c => c.slug === selectedCategory)?.name ?? selectedCategory}`
              : 'Seleccioná una categoría'}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
