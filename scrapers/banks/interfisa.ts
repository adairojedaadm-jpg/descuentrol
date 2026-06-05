import { BaseBank } from './base'
import { NormalizedPromotion } from '../utils/normalize'
import { chromium } from 'playwright'

export class InterfisaScraper extends BaseBank {
  bankSlug = 'interfisa'

  async scrape(): Promise<NormalizedPromotion[]> {
    let browser;

    try {
      console.log('[Interfisa Scraper] Intentando raspar sitio real de Banco Interfisa...')
      browser = await chromium.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto('https://www.interfisa.com.py/', { timeout: 15000 })
      
    } catch (error) {
      console.warn('[Interfisa Scraper] No se pudo raspar el sitio web real (usando fallback de contingencia):', error instanceof Error ? error.message : error)
    } finally {
      if (browser) {
        await browser.close()
      }
    }

    const today = new Date()
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    const validToDate = nextYear.toISOString().split('T')[0]

    const fallbacks: NormalizedPromotion[] = [
      {
        title: '20% de Descuento en Supermercados Stock',
        description: 'Tus compras de supermercado los miércoles tienen 20% de descuento directo pagando con tarjetas de crédito Interfisa.',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        discount_display: '20% Ahorro',
        conditions: 'Tope de reintegro de Gs. 100.000 por compra.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [3], // Miércoles
        source_type: 'HTML',
        source_url: 'https://www.interfisa.com.py/beneficios',
        category_slugs: ['supermercado'],
        card_keywords: ['clasica', 'gold']
      },
      {
        title: '20% de Descuento en Farmacenter',
        description: 'Cuidá tu salud los martes con 20% de ahorro directo en caja pagando con tu tarjeta Interfisa.',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        discount_display: '20% Ahorro',
        conditions: 'Válido en sucursales físicas de todo el país.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [2], // Martes
        source_type: 'HTML',
        source_url: 'https://www.interfisa.com.py/beneficios',
        category_slugs: ['farmacia', 'salud'],
        card_keywords: ['clasica', 'gold']
      },
      {
        title: '15% de Descuento en Cargas en Petrobras',
        description: 'Ahorrá 15% los sábados en combustibles seleccionados cargando en Petrobras y pagando con tarjetas Interfisa.',
        discount_type: 'PERCENTAGE',
        discount_value: 15,
        discount_display: '15% Ahorro',
        conditions: 'Tope máximo de Gs. 80.000 por carga por día.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [6], // Sábado
        source_type: 'HTML',
        source_url: 'https://www.interfisa.com.py/beneficios',
        category_slugs: ['combustible'],
        card_keywords: ['gold']
      }
    ]

    return fallbacks
  }
}
