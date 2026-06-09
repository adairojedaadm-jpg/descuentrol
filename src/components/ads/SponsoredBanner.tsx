"use client"

import Link from 'next/link'
import { Megaphone, ExternalLink } from 'lucide-react'

interface SponsoredBannerProps {
  imageUrl?: string
  linkUrl?: string
  brandName?: string
  className?: string
}

export default function SponsoredBanner({ imageUrl, linkUrl, brandName, className = '' }: SponsoredBannerProps) {
  // Anuncio real (imagen cargada por el anunciante)
  if (imageUrl && linkUrl) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden border border-border/30 shadow-sm ${className}`}>
        <span className="absolute top-2 left-2 z-10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-border/30">
          Publicidad
        </span>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-95 transition-opacity">
          <img src={imageUrl} alt={brandName ?? 'Anuncio'} className="w-full object-cover max-h-28" />
        </a>
      </div>
    )
  }

  // Placeholder "Anunciá aquí" (se muestra hasta que haya un anunciante)
  return (
    <Link href="/publicidad" className={`group flex items-center justify-between gap-4 w-full rounded-2xl border border-dashed border-primary/25 bg-primary/3 hover:bg-primary/6 hover:border-primary/40 px-5 py-4 transition-all duration-200 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
          <Megaphone className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            ¿Querés llegar a miles de usuarios en Paraguay?
          </p>
          <p className="text-3xs text-muted-foreground mt-0.5">
            Anunciá tu banco o comercio aquí — desde USD 50/mes
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 text-3xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Ver opciones <ExternalLink className="h-3 w-3" />
      </div>
    </Link>
  )
}
