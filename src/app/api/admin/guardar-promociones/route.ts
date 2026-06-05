import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import type { ExtractedPromo } from '@/app/api/admin/upload-pdf/route'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { bank_id: string; promotions: ExtractedPromo[] }
    const { bank_id, promotions } = body

    if (!bank_id || !Array.isArray(promotions) || promotions.length === 0) {
      return NextResponse.json({ error: 'Se requiere bank_id y al menos una promoción' }, { status: 400 })
    }

    const supabase = await createClient()

    // Cargar categorías activas
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('active', true)
    if (catError) return NextResponse.json({ error: catError.message }, { status: 500 })

    // Cargar tarjetas del banco
    const { data: cards, error: cardError } = await supabase
      .from('cards')
      .select('id, name, network')
      .eq('bank_id', bank_id)
      .eq('active', true)
    if (cardError) return NextResponse.json({ error: cardError.message }, { status: 500 })

    const categoryMap = new Map((categories || []).map(c => [c.slug, c.id]))
    const today = new Date().toISOString().split('T')[0]

    let saved = 0
    const errors: string[] = []

    for (const promo of promotions) {
      try {
        const hash = createHash('sha256').update(bank_id + promo.title + 'pdf-admin').digest('hex')

        // Upsert promotion
        const { data: upserted, error: upsertError } = await supabase
          .from('promotions')
          .upsert({
            bank_id,
            title: promo.title,
            description: promo.description ?? null,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value ?? null,
            discount_display: promo.discount_display,
            conditions: promo.conditions ?? null,
            valid_from: promo.valid_from ?? null,
            valid_to: promo.valid_to ?? null,
            days_of_week: promo.days_of_week ?? [],
            is_active: true,
            verified_by_admin: false,
            source_type: 'PDF' as const,
            source_url: null,
            pdf_url: null,
            external_hash: hash,
            scraped_at: today,
          }, { onConflict: 'external_hash' })
          .select('id')
          .single()

        if (upsertError) {
          errors.push(`"${promo.title}": ${upsertError.message}`)
          continue
        }

        const promoId = upserted.id

        // Mapear categorías
        const categoryIds = (promo.category_slugs || [])
          .map(slug => categoryMap.get(slug))
          .filter((id): id is string => !!id)

        if (categoryIds.length > 0) {
          await supabase.from('promotion_categories').delete().eq('promotion_id', promoId)
          await supabase.from('promotion_categories').insert(
            categoryIds.map(category_id => ({ promotion_id: promoId, category_id }))
          )
        }

        // Mapear tarjetas por keywords
        let matchedCardIds: string[] = []
        if (promo.card_keywords && promo.card_keywords.length > 0 && cards && cards.length > 0) {
          matchedCardIds = cards
            .filter(card =>
              promo.card_keywords.some(kw =>
                card.name.toLowerCase().includes(kw.toLowerCase())
              )
            )
            .map(c => c.id)
        }
        if (matchedCardIds.length === 0 && cards) {
          matchedCardIds = cards.map(c => c.id)
        }

        if (matchedCardIds.length > 0) {
          await supabase.from('promotion_cards').delete().eq('promotion_id', promoId)
          await supabase.from('promotion_cards').insert(
            matchedCardIds.map(card_id => ({ promotion_id: promoId, card_id }))
          )
        }

        saved++
      } catch (promoErr) {
        errors.push(`"${promo.title}": ${promoErr instanceof Error ? promoErr.message : 'Error desconocido'}`)
      }
    }

    return NextResponse.json({ saved, errors, total: promotions.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
