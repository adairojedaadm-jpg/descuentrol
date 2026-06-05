export interface NormalizedPromotion {
  title: string
  description?: string | null
  discount_type: 'PERCENTAGE' | 'CASHBACK' | 'CUOTAS' | 'FREE'
  discount_value?: number | null
  discount_display: string
  conditions?: string | null
  valid_from?: string | null // YYYY-MM-DD
  valid_to?: string | null // YYYY-MM-DD
  days_of_week: number[] // DOW integers
  source_type: 'HTML' | 'PDF'
  source_url?: string | null
  pdf_url?: string | null
  external_hash?: string | null
  
  // Scraper association helpers (not saved directly to promotions table)
  category_slugs: string[] // e.g. ['combustible', 'supermercado']
  card_keywords?: string[] // e.g. ['visa', 'mastercard', 'gold'] (empty means all bank cards)
}

/**
 * Cleans and normalizes text by removing extra spaces.
 */
export function cleanText(text?: string | null): string {
  if (!text) return ''
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Helper to parse discount value and type from title or description.
 */
export function parseDiscount(
  title: string,
  description?: string | null
): {
  type: 'PERCENTAGE' | 'CASHBACK' | 'CUOTAS' | 'FREE'
  value: number | null
  display: string
} {
  const combined = `${title} ${description || ''}`.toLowerCase()
  
  // 1. Try to find a percentage discount
  const pctMatch = combined.match(/\b(\d+)\s*%/ )
  const pctValue = pctMatch ? parseInt(pctMatch[1], 10) : null

  if (pctValue !== null) {
    const isCashback = combined.includes('reintegro') || combined.includes('cashback') || combined.includes('devolucion')
    return {
      type: isCashback ? 'CASHBACK' : 'PERCENTAGE',
      value: pctValue,
      display: `${pctValue}% ${isCashback ? 'Reintegro' : 'Ahorro'}`
    }
  }

  // 2. Try to find "cuotas"
  const cuotasMatch = combined.match(/\b(\d+)\s*(?:cuotas|pagos)\b/)
  if (cuotasMatch) {
    const cuotasValue = parseInt(cuotasMatch[1], 10)
    return {
      type: 'CUOTAS',
      value: cuotasValue,
      display: `${cuotasValue} Cuotas`
    }
  }

  if (combined.includes('cuotas sin interes') || combined.includes('sin interes')) {
    return {
      type: 'CUOTAS',
      value: null,
      display: 'Cuotas sin Interés'
    }
  }

  // 3. Try to find "gratis" or 2x1
  if (combined.includes('2x1') || combined.includes('3x2') || combined.includes('duo') || combined.includes('gratis')) {
    let display = 'Beneficio Gratis'
    if (combined.includes('2x1')) display = '2x1'
    if (combined.includes('3x2')) display = '3x2'
    return {
      type: 'FREE',
      value: null,
      display
    }
  }

  // Default fallback
  return {
    type: 'PERCENTAGE',
    value: null,
    display: 'Beneficio Especial'
  }
}

/**
 * Infers category slugs from promotion text using simple keywords.
 */
export function inferCategorySlugs(title: string, description?: string | null): string[] {
  const combined = `${title} ${description || ''}`.toLowerCase()
  const slugs: string[] = []

  const categoryKeywords: { [key: string]: string[] } = {
    combustible: ['combustible', 'puma', 'copetrol', 'petrobras', 'shell', 'barcos y rodados', 'b&r', 'estacion', 'nafta', 'gasoil'],
    farmacia: ['farmacia', 'farma', 'punto farma', 'catedral', 'vicente scavone', 'farmacenter', 'kaneko', 'medicina', 'medicamentos'],
    supermercado: ['supermercado', 'super', 'retail', 'real', 'stock', 'superseis', 's6', 'casa rica', 'aregua', 'hipermercado', 'compras', 'alimentos', 'delimarket', 'los jardines', 'salemma'],
    restaurante: ['restaurante', 'gastronomia', 'bar', 'cafe', 'heladeria', 'cena', 'almuerzo', 'comida', 'sushi', 'pizza', 'burguer', 'hamburguesa'],
    viajes: ['viajes', 'vuelo', 'hotel', 'pasaje', 'turismo', 'aerolinea', 'latam', 'despegar', 'asuncion de la nacion', 'alojamiento'],
    electrodomesticos: ['electrodomesticos', 'tv', 'heladera', 'lavarropas', 'acondicionador', 'plancha', 'tienda de hogar', 'ngo', 'tupí', 'tupi', 'gonzalez gimenez'],
    ropa: ['ropa', 'calzado', 'zapateria', 'tienda de ropa', 'indumentaria', 'vestir', 'moda', 'prenda', 'multimarcas'],
    entretenimiento: ['entretenimiento', 'cine', 'concierto', 'teatro', 'evento', 'entrada', 'show', 'diversion'],
    tecnologia: ['tecnologia', 'celular', 'smartphone', 'computadora', 'notebook', 'tablet', 'electronica', 'apple', 'samsung'],
    salud: ['salud', 'clinica', 'sanatorio', 'optica', 'laboratorio', 'odontologia', 'gimnasio', 'gym', 'spa']
  }

  for (const [slug, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => combined.includes(keyword))) {
      slugs.push(slug)
    }
  }

  return slugs
}
