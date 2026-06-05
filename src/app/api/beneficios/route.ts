import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ratelimit } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  tarjetas: z.string()
    .transform((s) => s.split(',').filter(Boolean))
    .pipe(z.array(z.string().uuid()).min(1).max(20)),
  dia: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? undefined : Number(val)),
    z.number().int().min(0).max(6).optional()
  )
})

export interface CardInfo { id: string; name: string; network: string }
export interface BankInfo { id: string; name: string; logo_url: string | null }
export interface PromoResult {
  id: string
  title: string
  description: string | null
  discount_type: string
  discount_value: number | null
  discount_display: string
  conditions: string | null
  valid_to: string | null
  days_of_week: number[]
  source_type: string
  source_url: string | null
  pdf_url: string | null
  bank: BankInfo
  matched_cards: CardInfo[]
}
export interface BankBenefits { bank: BankInfo; promotions: PromoResult[] }

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    const { success, limit, remaining, reset } = await ratelimit.limit(ip)
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    }
    if (!success) {
      return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429, headers })
    }

    const searchParams = request.nextUrl.searchParams
    const validation = schema.safeParse({
      tarjetas: searchParams.get('tarjetas'),
      dia: searchParams.get('dia'),
    })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos.', details: validation.error.format() },
        { status: 400, headers }
      )
    }

    const { tarjetas: cardIds, dia } = validation.data

    // Día en horario de Paraguay (UTC-3)
    let dayNum: number
    if (dia !== undefined) {
      dayNum = dia
    } else {
      const utcDate = new Date()
      const pyDate = new Date(utcDate.getTime() + (-3 * 60 + utcDate.getTimezoneOffset()) * 60000)
      dayNum = pyDate.getDay()
    }

    const supabase = await createClient()

    // Query 1: pares (promotion_id, card) para las tarjetas seleccionadas
    type PairRow = { promotion_id: string; card: CardInfo | null }
    const { data: pairsRaw, error: pairsError } = await supabase
      .from('promotion_cards')
      .select('promotion_id, card:cards(id, name, network)')
      .in('card_id', cardIds)

    if (pairsError) return NextResponse.json({ error: pairsError.message }, { status: 500, headers })

    const pairs = (pairsRaw || []) as unknown as PairRow[]
    if (pairs.length === 0) {
      return NextResponse.json({ banks: [], total: 0 }, { status: 200, headers })
    }

    // Query 2: detalles de las promociones con info del banco
    const promoIds = [...new Set(pairs.map(p => p.promotion_id))]
    const today = new Date().toISOString().split('T')[0]

    type PromoRow = {
      id: string; title: string; description: string | null
      discount_type: string; discount_value: number | null; discount_display: string
      conditions: string | null; valid_to: string | null; days_of_week: number[]
      source_type: string; source_url: string | null; pdf_url: string | null
      bank: BankInfo | null
    }

    const { data: promosRaw, error: promosError } = await supabase
      .from('promotions')
      .select('id, title, description, discount_type, discount_value, discount_display, conditions, valid_to, days_of_week, source_type, source_url, pdf_url, bank:banks(id, name, logo_url)')
      .in('id', promoIds)
      .eq('is_active', true)
      .or(`valid_to.is.null,valid_to.gte.${today}`)

    if (promosError) return NextResponse.json({ error: promosError.message }, { status: 500, headers })

    const promos = (promosRaw || []) as unknown as PromoRow[]

    // Filtrar por día en JS (days_of_week vacío = todos los días)
    const filtered = promos.filter(p =>
      p.days_of_week.length === 0 || p.days_of_week.includes(dayNum)
    )

    // Mapa promotion_id → matched_cards
    const matchedCardsMap = new Map<string, CardInfo[]>()
    for (const pair of pairs) {
      if (!pair.card) continue
      if (!matchedCardsMap.has(pair.promotion_id)) matchedCardsMap.set(pair.promotion_id, [])
      matchedCardsMap.get(pair.promotion_id)!.push(pair.card)
    }

    // Agrupar por banco
    const bankMap = new Map<string, BankBenefits>()
    for (const promo of filtered) {
      if (!promo.bank) continue
      const { bank } = promo
      if (!bankMap.has(bank.id)) bankMap.set(bank.id, { bank, promotions: [] })
      bankMap.get(bank.id)!.promotions.push({
        id: promo.id,
        title: promo.title,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_display: promo.discount_display,
        conditions: promo.conditions,
        valid_to: promo.valid_to,
        days_of_week: promo.days_of_week,
        source_type: promo.source_type,
        source_url: promo.source_url,
        pdf_url: promo.pdf_url,
        bank,
        matched_cards: matchedCardsMap.get(promo.id) || [],
      })
    }

    // Bancos A-Z, promos por descuento DESC
    const banks: BankBenefits[] = Array.from(bankMap.values())
      .sort((a, b) => a.bank.name.localeCompare(b.bank.name, 'es'))
      .map(entry => ({
        ...entry,
        promotions: entry.promotions.sort((a, b) => (b.discount_value || 0) - (a.discount_value || 0))
      }))

    return NextResponse.json({ banks, total: filtered.length }, { status: 200, headers })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
