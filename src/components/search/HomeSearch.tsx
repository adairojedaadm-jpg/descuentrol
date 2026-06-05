"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import CardSelector, { Bank } from '@/components/search/CardSelector'
import { Button } from '@/components/ui/button'
import { ArrowRight, CreditCard } from 'lucide-react'

export default function HomeSearch() {
  const router = useRouter()
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
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

  // Restaurar selección guardada en localStorage
  useEffect(() => {
    const stored = localStorage.getItem('descuentrol_selected_cards')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCardIds(parsed)
        }
      } catch {
        // Ignorar errores de parsing
      }
    }
    setIsInitialized(true)
  }, [])

  const handleCardsChange = (newIds: string[]) => {
    setSelectedCardIds(newIds)
    localStorage.setItem('descuentrol_selected_cards', JSON.stringify(newIds))
  }

  const handleVerBeneficios = () => {
    if (selectedCardIds.length === 0) return
    router.push(`/buscar?tarjetas=${selectedCardIds.join(',')}`)
  }

  return (
    <div className="space-y-6">
      {/* Header del selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider">
            Mis Tarjetas
          </h2>
        </div>
        {isInitialized && selectedCardIds.length > 0 && (
          <span className="text-3xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            {selectedCardIds.length} seleccionada{selectedCardIds.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Selector de tarjetas */}
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

      {/* CTA */}
      <Button
        onClick={handleVerBeneficios}
        disabled={selectedCardIds.length === 0}
        className="w-full rounded-xl font-semibold gap-2 h-12 text-sm shadow-sm disabled:opacity-40"
      >
        <span>Ver mis beneficios</span>
        <ArrowRight className="h-4 w-4" />
      </Button>

      {selectedCardIds.length === 0 && (
        <p className="text-center text-3xs text-muted-foreground">
          Marcá al menos una tarjeta para continuar
        </p>
      )}
    </div>
  )
}
