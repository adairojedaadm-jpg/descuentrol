"use client"

import { useEffect, useState } from 'react'

interface AdSidebarProps {
  slot: string
  className?: string
}

export default function AdSidebar({ slot, className = '' }: AdSidebarProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID
  const isDev = process.env.NODE_ENV === 'development' || !adsenseId || adsenseId === 'ca-pub-xxxxxxxxxxxxxxxx'

  useEffect(() => {
    if (!isDev && adsenseId) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || []
        adsbygoogle.push({})
        setIsLoaded(true)
      } catch (err) {
        console.warn('[AdSense] Omitiendo inicialización de Sidebar:', err)
      }
    }
  }, [adsenseId, isDev])

  if (isDev) {
    return (
      <div className={`hidden xl:flex w-[160px] h-[600px] bg-muted/40 border border-border/20 rounded-2xl p-4 flex-col items-center justify-center text-center sticky top-24 backdrop-blur-sm select-none ${className}`}>
        <span className="text-[10px] font-extrabold tracking-widest text-primary uppercase rotate-90 my-8">Anuncio</span>
        <span className="text-[11px] text-muted-foreground mt-auto">Google AdSense<br />(160x600)</span>
      </div>
    )
  }

  return (
    <div className={`hidden xl:block w-[160px] h-[600px] overflow-hidden sticky top-24 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '160px', height: '600px' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
      />
    </div>
  )
}
