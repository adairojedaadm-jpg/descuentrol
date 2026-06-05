import { createClient } from '@/lib/supabase/server'

export async function getActiveBanksWithCards() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('banks')
    .select('id, name, logo_url, website_url, promotions_url, cards(id, name, network, color)')
    .eq('active', true)
    .eq('cards.active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Error obteniendo bancos: ${error.message}`)
  }

  // Ordenar las tarjetas por nombre alfabéticamente para cada banco
  const formattedData = (data || []).map(bank => {
    const b = bank as unknown as {
      id: string
      name: string
      logo_url: string | null
      website_url: string | null
      promotions_url: string | null
      cards: { id: string; name: string; network: 'VISA' | 'MASTERCARD' | 'AMEX' | 'LOCAL'; color: string | null }[]
    }
    return {
      id: b.id,
      name: b.name,
      logo_url: b.logo_url,
      website_url: b.website_url,
      promotions_url: b.promotions_url,
      cards: [...(b.cards || [])].sort((a, b) => a.name.localeCompare(b.name))
    }
  })

  return formattedData
}
