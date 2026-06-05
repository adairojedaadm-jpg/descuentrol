import { FileText, Calendar, CreditCard, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDays, formatExpiry, Promo } from './PromoCard'

interface PdfPromoCardProps {
  promo: Promo
}

export default function PdfPromoCard({ promo }: PdfPromoCardProps) {
  const fileUrl = promo.pdf_url || promo.source_url

  return (
    <Card className="border border-border/50 bg-card hover:border-border hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden shadow-2sm">
      <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        {/* PDF Icon Column */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-sm">
          <FileText className="h-7 w-7" />
        </div>

        {/* Promo Details Column */}
        <div className="flex-1 flex flex-col justify-between gap-2.5 w-full">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-3xs font-semibold px-2 py-0.5 rounded-full border-red-500/20 bg-red-500/5 text-red-500">
                Catálogo PDF
              </Badge>
              <Badge variant="outline" className="text-3xs font-semibold px-2 py-0.5 rounded-full border-secondary/20 bg-secondary/5 text-secondary">
                {formatDays(promo.days_of_week)}
              </Badge>
              <Badge variant="outline" className="text-3xs font-medium px-2 py-0.5 rounded-full border-border/60 bg-muted/10 text-muted-foreground">
                <Calendar className="h-2.5 w-2.5 mr-1" />
                {formatExpiry(promo.valid_to)}
              </Badge>
            </div>

            <h3 className="font-heading text-sm sm:text-base font-bold text-foreground leading-snug">
              {promo.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {promo.description || 'Este beneficio proviene de un folleto o catálogo en formato PDF provisto por el banco.'}
            </p>
          </div>

          {/* Cards & CTA Row */}
          <div className="flex flex-wrap items-center justify-between border-t border-border/20 pt-3 gap-3">
            <div className="flex flex-wrap gap-1.5 items-center">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-3xs text-foreground font-bold uppercase">{promo.bank.name}</span>
              {promo.matched_cards && promo.matched_cards.length > 0 && (
                <span className="text-3xs text-muted-foreground">({promo.matched_cards.map(c => c.name.replace(promo.bank.name, '').trim()).join(', ')})</span>
              )}
            </div>

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-3xs font-bold bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg transition-all duration-200 shadow-sm shadow-red-600/10"
              >
                <span>Ver PDF Completo</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
