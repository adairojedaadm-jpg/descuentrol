"use client"

import { useState, useEffect } from 'react'
import { Check, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface CardItem {
  id: string
  name: string
  network: 'VISA' | 'MASTERCARD' | 'AMEX' | 'LOCAL'
  color?: string | null
}

export interface Bank {
  id: string
  name: string
  logo_url?: string | null
  cards: CardItem[]
}

interface CardSelectorProps {
  banks: Bank[]
  selectedCardIds: string[]
  onChange: (ids: string[]) => void
}

export default function CardSelector({ banks, selectedCardIds, onChange }: CardSelectorProps) {
  const [expandedBanks, setExpandedBanks] = useState<Record<string, boolean>>({})

  // Expand all banks by default if no preference
  useEffect(() => {
    if (banks.length > 0 && Object.keys(expandedBanks).length === 0) {
      const initial: Record<string, boolean> = {}
      banks.forEach((b, index) => {
        // Expand the first 3 banks by default, collapse others to save space
        initial[b.id] = index < 3
      })
      setExpandedBanks(initial)
    }
  }, [banks])

  const toggleBank = (bankId: string) => {
    setExpandedBanks((prev) => ({
      ...prev,
      [bankId]: !prev[bankId],
    }))
  }

  const toggleCard = (cardId: string) => {
    const isSelected = selectedCardIds.includes(cardId)
    let newSelection: string[]
    if (isSelected) {
      newSelection = selectedCardIds.filter((id) => id !== cardId)
    } else {
      // Limit to 20 cards to prevent overloading queries
      if (selectedCardIds.length >= 20) return
      newSelection = [...selectedCardIds, cardId]
    }
    onChange(newSelection)
  }

  const selectAllBankCards = (bank: Bank) => {
    const cardIds = bank.cards.map((c) => c.id)
    const allSelected = cardIds.every((id) => selectedCardIds.includes(id))
    let newSelection: string[]

    if (allSelected) {
      // Remove all
      newSelection = selectedCardIds.filter((id) => !cardIds.includes(id))
    } else {
      // Add missing
      const toAdd = cardIds.filter((id) => !selectedCardIds.includes(id))
      if (selectedCardIds.length + toAdd.length > 20) return // Limit reached
      newSelection = [...selectedCardIds, ...toAdd]
    }
    onChange(newSelection)
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {banks.map((bank) => {
        const isExpanded = expandedBanks[bank.id]
        const bankCardIds = bank.cards.map((c) => c.id)
        const selectedCount = bank.cards.filter((c) => selectedCardIds.includes(c.id)).length
        const allSelected = selectedCount === bank.cards.length

        return (
          <Card key={bank.id} className="border border-border/50 overflow-hidden shadow-2sm">
            {/* Bank Header */}
            <div 
              className="flex items-center justify-between p-4 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors duration-150"
              onClick={() => toggleBank(bank.id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/40 font-heading text-xs font-bold text-muted-foreground shadow-sm">
                  {bank.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-foreground">
                    {bank.name}
                  </h4>
                  {selectedCount > 0 && (
                    <span className="text-3xs text-primary font-semibold">
                      {selectedCount} seleccionada{selectedCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-2xs text-muted-foreground hover:text-foreground font-semibold"
                  onClick={() => selectAllBankCards(bank)}
                >
                  {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => toggleBank(bank.id)}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Bank Cards Grid */}
            {isExpanded && (
              <div className="p-4 border-t border-border/20 bg-background/50 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-slide-down">
                {bank.cards.map((card) => {
                  const isSelected = selectedCardIds.includes(card.id)
                  const accentColor = card.color || '#F97316'

                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleCard(card.id)}
                      className={`relative flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-2sm' 
                          : 'border-border/50 hover:border-border hover:bg-muted/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Fake credit card thumbnail */}
                        <div 
                          className="w-10 h-6.5 rounded-md flex flex-col justify-between p-1 text-[5px] text-white font-mono shadow-sm"
                          style={{ backgroundColor: accentColor }}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-extrabold tracking-widest leading-none">💳</span>
                            <span className="font-extrabold leading-none">{card.network}</span>
                          </div>
                          <span className="font-semibold leading-none truncate max-w-full">xxxx</span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">
                            {card.name}
                          </p>
                          <span className="text-3xs text-muted-foreground uppercase tracking-wider font-medium">
                            {card.network}
                          </span>
                        </div>
                      </div>

                      <div className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-all ${
                        isSelected 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-border/80 bg-background'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
