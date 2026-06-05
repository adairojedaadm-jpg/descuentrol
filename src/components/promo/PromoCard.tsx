import { Calendar, CreditCard, ExternalLink, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface BankInfo {
  id: string
  name: string
  logo_url?: string | null
}

export interface CardInfo {
  id: string
  name: string
  network: string
}

export interface Promo {
  id: string
  title: string
  description?: string | null
  discount_type: 'PERCENTAGE' | 'CASHBACK' | 'CUOTAS' | 'FREE'
  discount_value: number | null
  discount_display: string
  conditions?: string | null
  valid_to?: string | null
  days_of_week: number[]
  source_type: 'HTML' | 'PDF'
  source_url?: string | null
  pdf_url?: string | null
  bank: BankInfo
  matched_cards?: CardInfo[]
}

interface PromoCardProps {
  promo: Promo
}

export const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function formatDays(days: number[]): string {
  if (days.length === 0 || days.length === 7) return 'Todos los días'
  return days.map(d => DAYS_SHORT[d]).join(' · ')
}

export function formatExpiry(dateStr?: string | null): string {
  if (!dateStr) return 'Hasta nuevo aviso'
  const date = new Date(dateStr)
  // Format as DD/MM/YYYY without timezone shift
  const day = dateStr.substring(8, 10)
  const month = dateStr.substring(5, 7)
  const year = dateStr.substring(0, 4)
  return `Vence: ${day}/${month}/${year}`
}

export default function PromoCard({ promo }: PromoCardProps) {
  const isPercentage = promo.discount_type === 'PERCENTAGE' || promo.discount_type === 'CASHBACK'
  const discountDisplayValue = promo.discount_value && isPercentage ? `${promo.discount_value}%` : ''
  const isCuotas = promo.discount_type === 'CUOTAS'

  return (
    <Card className="border border-border/50 bg-card hover:border-border hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden shadow-2sm">
      <CardContent className="p-5 flex flex-col md:flex-row gap-5">
        {/* Discount & Bank Logo Column */}
        <div className="flex md:flex-col items-center justify-between md:justify-center md:items-center md:w-36 shrink-0 p-4 rounded-xl bg-muted/30 border border-border/20 gap-3">
          {/* Discount display */}
          <div className="text-center">
            {discountDisplayValue ? (
              <span className="font-heading text-3xl font-extrabold text-primary tracking-tight leading-none block">
                {discountDisplayValue}
              </span>
            ) : isCuotas ? (
              <span className="font-heading text-xl font-extrabold text-secondary tracking-tight leading-none block">
                {promo.discount_value}
              </span>
            ) : (
              <span className="font-heading text-lg font-extrabold text-accent-foreground tracking-tight leading-none block">
                🎁
              </span>
            )}
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1 block">
              {isCuotas ? 'Cuotas sin interés' : promo.discount_type === 'FREE' ? 'Gratuito' : 'Reintegro'}
            </span>
          </div>

          <div className="h-px w-10 bg-border/50 hidden md:block" />

          {/* Bank Logo Name */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/40 font-heading text-3xs font-black text-muted-foreground shadow-sm">
              {promo.bank.name.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-3xs text-foreground font-semibold mt-1 truncate max-w-[90px]" title={promo.bank.name}>
              {promo.bank.name}
            </span>
          </div>
        </div>

        {/* Promo Details Column */}
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Days Badge */}
              <Badge variant="outline" className="text-3xs font-semibold px-2 py-0.5 rounded-full border-secondary/20 bg-secondary/5 text-secondary">
                {formatDays(promo.days_of_week)}
              </Badge>
              {/* Expiry Badge */}
              <Badge variant="outline" className="text-3xs font-medium px-2 py-0.5 rounded-full border-border/60 bg-muted/10 text-muted-foreground">
                <Calendar className="h-2.5 w-2.5 mr-1" />
                {formatExpiry(promo.valid_to)}
              </Badge>
            </div>

            <h3 className="font-heading text-base font-bold text-foreground leading-snug">
              {promo.title}
            </h3>
            {promo.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {promo.description}
              </p>
            )}
            {promo.conditions && (
              <p className="text-[10px] text-muted-foreground/75 leading-normal bg-muted/20 p-2 rounded-lg border border-border/20 italic">
                * {promo.conditions}
              </p>
            )}
          </div>

          {/* Cards & CTA Row */}
          <div className="flex flex-wrap items-center justify-between border-t border-border/20 pt-3 gap-3 mt-auto">
            {/* Matched Cards */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {promo.matched_cards && promo.matched_cards.length > 0 ? (
                promo.matched_cards.map(card => (
                  <Badge 
                    key={card.id} 
                    variant="outline" 
                    className="text-4xs font-bold px-1.5 py-0 rounded bg-background border-border/60 uppercase"
                  >
                    {card.name.replace(promo.bank.name, '').trim() || card.name}
                  </Badge>
                ))
              ) : (
                <span className="text-3xs text-muted-foreground">Cualquier tarjeta</span>
              )}
            </div>

            {/* CTA */}
            {promo.source_url && (
              <a
                href={promo.source_url}
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
