"use client"

import { useEffect, useState } from 'react'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal'
  responsive?: boolean
  className?: string
}

export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}: AdBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID
  const isDev = process.env.NODE_ENV === 'development' || !adsenseId || adsenseId === 'ca-pub-xxxxxxxxxxxxxxxx'

  useEffect(() => {
    if (!isDev && adsenseId) {
      try {
        // Ejecutar inicialización de AdSense
        const adsbygoogle = (window as any).adsbygoogle || []
        adsbygoogle.push({})
        setIsLoaded(true)
      } catch (err) {
        console.warn('[AdSense] Omitiendo inicialización de Banner:', err)
      }
    }
  }, [adsenseId, isDev])

  if (isDev) {
    // Renderizar un placeholder estético para desarrollo local o hasta que se apruebe AdSense
    return (
      <div className={`w-full bg-muted/40 border border-border/20 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[90px] text-center backdrop-blur-sm select-none ${className}`}>
        <span className="text-[10px] font-extrabold tracking-widest text-primary uppercase">Espacio Publicitario</span>
        <span className="text-[11px] text-muted-foreground mt-1">Google AdSense (Slot {slot})</span>
      </div>
    )
  }

  return (
    <div className={`w-full overflow-hidden flex justify-center py-2 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
