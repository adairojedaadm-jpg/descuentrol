"use client"

import { useState } from 'react'
import { Calendar, CreditCard, ChevronDown, ChevronUp, ExternalLink, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDays, formatExpiry, Promo } from './PromoCard'

interface TieredPromoCardProps {
  promos: Promo[] // ordenados por discount_value desc
}

function extractLevelLabel(title: string): string | null {
  const match = title.match(/nivel\s+(\d+)/i)
  return match ? `Nivel ${match[1]}` : null
}

export function baseTieredTitle(title: string): string {
  return title
    .replace(/nivel\s+\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    // quitar coma o guión al final si quedaron
    .replace(/[,\-–]\s*$/, '')
    .trim()
}

export default function TieredPromoCard({ promos }: TieredPromoCardProps) {
  const [expanded, setExpanded] = useState(false)
  const base = promos[0]

  const values = promos.map(p => p.discount_value ?? 0).filter(v => v > 0)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  const title = baseTieredTitle(base.title)

  const levels = promos.map(p => ({
    label: extractLevelLabel(p.title) ?? p.discount_display,
    value: p.discount_value ?? 0,
    display: p.discount_display,
    cards: (p.matched_cards ?? []).map(c => ({
      ...c,
      shortName: c.name.replace(p.bank.name, '').trim() || c.name,
    })),
  }))

  // Tarjetas únicas entre todos los niveles (para la fila inferior)
  const allCards = [
    ...new Map(
      promos.flatMap(p => p.matched_cards ?? []).map(c => [c.id, c])
    ).values(),
  ]

  const sourceUrl = base.source_url

  return (
    <Card className="border border-border/50 bg-card hover:border-border hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden shadow-2sm">
      <CardContent className="p-5 flex flex-col md:flex-row gap-5">

        {/* Columna de rango de reintegro */}
        <div className="flex md:flex-col items-center justify-between md:justify-center md:items-center md:w-36 shrink-0 p-4 rounded-xl bg-muted/30 border border-border/20 gap-3">
          <div className="text-center">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">desde</span>
            <span className="font-heading text-3xl font-extrabold text-primary tracking-tight leading-none block">
              {minValue}%
            </span>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5 block">
              hasta {maxValue}%
            </span>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-1.5 block">
              Reintegro
            </span>
          </div>

          <div className="h-px w-10 bg-border/50 hidden md:block" />

          <div className="flex flex-col items-center text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/40 font-heading text-3xs font-black text-muted-foreground shadow-sm">
              {base.bank.name.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-3xs text-foreground font-semibold mt-1 truncate max-w-[90px]" title={base.bank.name}>
              {base.bank.name}
            </span>
          </div>
        </div>

        {/* Columna de detalle */}
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            {/* Badges de días / vencimiento / niveles */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-3xs font-semibold px-2 py-0.5 rounded-full border-secondary/20 bg-secondary/5 text-secondary">
                {formatDays(base.days_of_week)}
              </Badge>
              <Badge variant="outline" className="text-3xs font-medium px-2 py-0.5 rounded-full border-border/60 bg-muted/10 text-muted-foreground">
                <Calendar className="h-2.5 w-2.5 mr-1" />
                {formatExpiry(base.valid_to)}
              </Badge>
              <Badge className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 gap-1 flex items-center">
                <Layers className="h-2.5 w-2.5" />
                {promos.length} niveles
              </Badge>
            </div>

            {/* Título base (sin "nivel X") */}
            <h3 className="font-heading text-base font-bold text-foreground leading-snug">
              {title}
            </h3>

            {/* Descripción de la primera promo */}
            {base.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {base.description}
              </p>
            )}

            {/* Condiciones */}
            {base.conditions && (
              <p className="text-[10px] text-muted-foreground/75 leading-normal bg-muted/20 p-2 rounded-lg border border-border/20 italic">
                * {base.conditions}
              </p>
            )}

            {/* Toggle de desglose por nivel */}
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 text-3xs font-semibold text-primary hover:text-primary/80 transition-colors mt-0.5"
            >
              {expanded
                ? <><ChevronUp className="h-3 w-3" /> Ocultar detalle por nivel</>
                : <><ChevronDown className="h-3 w-3" /> Ver reintegro por nivel</>
              }
            </button>

            {/* Tabla de niveles */}
            {expanded && (
              <div className="rounded-xl border border-border/30 bg-muted/20 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20 bg-muted/40">
                      <th className="text-left px-3 py-2 text-3xs font-bold text-muted-foreground uppercase tracking-wider">Nivel / Tarjeta</th>
                      <th className="text-right px-3 py-2 text-3xs font-bold text-muted-foreground uppercase tracking-wider">Reintegro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levels.map((lvl, i) => (
                      <tr key={i} className="border-b border-border/10 last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-2 text-xs text-foreground font-semibold">
                          {lvl.label}
                          {lvl.cards.length > 0 && (
                            <span className="ml-1.5 text-3xs text-muted-foreground font-normal">
                              ({lvl.cards.map(c => c.shortName).filter(Boolean).join(', ')})
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-heading font-extrabold text-primary text-sm">
                          {lvl.display}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fila inferior: tarjetas + link */}
          <div className="flex flex-wrap items-center justify-between border-t border-border/20 pt-3 gap-3 mt-auto">
            <div className="flex flex-wrap gap-1.5 items-center">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {allCards.length > 0 ? (
                allCards.map(card => (
                  <Badge
                    key={card.id}
                    variant="outline"
                    className="text-4xs font-bold px-1.5 py-0 rounded bg-background border-border/60 uppercase"
                  >
                    {card.name.replace(base.bank.name, '').trim() || card.name}
                  </Badge>
                ))
              ) : (
                <span className="text-3xs text-muted-foreground">Cualquier tarjeta</span>
              )}
            </div>

            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-3xs font-bold text-primary hover:text-primary-foreground hover:bg-primary px-2.5 py-1 rounded-md border border-primary/20 hover:border-primary transition-all duration-200"
              >
                <span>Ver legales</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
