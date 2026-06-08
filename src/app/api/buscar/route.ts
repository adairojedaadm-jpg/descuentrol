import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { BankGroup } from '@/components/promo/PromoListByBank'
import type { Promo } from '@/components/promo/PromoCard'

const schema = z.object({
  cat: z.string().min(1).max(50),
  tarjetas: z.string().optional().transform(s =>
    s ? s.split(',').filter(Boolean) : []
  ),
  dia: z.preprocess(
    val => (val === null || val === undefined || val === '' ? undefined : Number(val)),
    z.number().int().min(0).max(6).optional()
  ),
})

function groupByBank(promos: Promo[]): BankGroup[] {
  const map = new Map<string, BankGroup>()
  for (const promo of promos) {
    const key = promo.bank.id
    if (!map.has(key)) map.set(key, { bank: promo.bank, promotions: [] })
    map.get(key)!.promotions.push(promo)
  }
  return [...map.values()].sort((a, b) => {
    const maxA = Math.max(0, ...a.promotions.map(p => p.discount_value ?? 0))
    const maxB = Math.max(0, ...b.promotions.map(p => p.discount_value ?? 0))
    return maxB - maxA
  })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const validation = schema.safeParse({
      cat: searchParams.get('cat'),
      tarjetas: searchParams.get('tarjetas'),
      dia: searchParams.get('dia'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos.', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { cat, tarjetas, dia } = validation.data
    const today = new Date().toISOString().split('T')[0]
    const supabase = await createClient()

    // 1. Obtener la categoría
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat)
      .eq('active', true)
      .single()

    if (!category) {
      return NextResponse.json({ banks: [], total: 0 })
    }

    // 2. Obtener promociones de esa categoría con info de banco y tarjetas
    let query = supabase
      .from('promotions')
      .select(`
        id, title, description, discount_type, discount_value, discount_display,
        conditions, valid_to, days_of_week, source_type, source_url, pdf_url,
        bank:banks!inner(id, name, logo_url),
        promotion_categories!inner(category_id),
        promotion_cards(card_id, card:cards(id, name, network))
      `)
      .eq('is_active', true)
      .eq('promotion_categories.category_id', category.id)
      .or(`valid_to.is.null,valid_to.gte.${today}`)

    const { data: rawPromos, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!rawPromos || rawPromos.length === 0) {
      return NextResponse.json({ banks: [], total: 0 })
    }

    // 3. Filtrar por día en JS
    const promosByDay = dia !== undefined
      ? rawPromos.filter(p => {
          const days = p.days_of_week as number[]
          return days.length === 0 || days.includes(dia)
        })
      : rawPromos

    // 4. Filtrar por tarjetas (si se proporcionaron)
    const filtered = tarjetas.length > 0
      ? promosByDay.filter(p => {
          const cards = (p.promotion_cards as unknown as { card_id: string }[]) ?? []
          return cards.length === 0 || cards.some(pc => tarjetas.includes(pc.card_id))
        })
      : promosByDay

    // 5. Mapear a tipo Promo
    const promos: Promo[] = filtered.map(p => {
      const bank = p.bank as unknown as { id: string; name: string; logo_url?: string | null }
      const allCards = (p.promotion_cards as unknown as { card_id: string; card: { id: string; name: string; network: string } }[]) ?? []
      const matchedCards = tarjetas.length > 0
        ? allCards.filter(pc => tarjetas.includes(pc.card_id)).map(pc => pc.card)
        : allCards.map(pc => pc.card)

      return {
        id: p.id,
        title: p.title,
        description: p.description ?? null,
        discount_type: p.discount_type as Promo['discount_type'],
        discount_value: p.discount_value ?? null,
        discount_display: p.discount_display,
        conditions: p.conditions ?? null,
        valid_to: p.valid_to ?? null,
        days_of_week: p.days_of_week as number[],
        source_type: p.source_type as 'HTML' | 'PDF',
        source_url: p.source_url ?? null,
        pdf_url: p.pdf_url ?? null,
        bank,
        matched_cards: matchedCards,
      }
    })

    const banks = groupByBank(promos)

    return NextResponse.json({ banks, total: promos.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
