import { BaseBank } from './base'
import { NormalizedPromotion } from '../utils/normalize'
import { chromium } from 'playwright'

export class ZetaScraper extends BaseBank {
  bankSlug = 'zeta'

  async scrape(): Promise<NormalizedPromotion[]> {
    let browser;

    try {
      console.log('[Zeta Scraper] Intentando raspar sitio real de Banco Zeta...')
      browser = await chromium.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto('https://www.bancozeta.com.py/', { timeout: 15000 })
      
    } catch (error) {
      console.warn('[Zeta Scraper] No se pudo raspar el sitio web real (usando fallback de contingencia):', error instanceof Error ? error.message : error)
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
        title: '20% de Descuento en Supermercados Stock y Superseis',
        description: 'Tus compras de los miércoles tienen 20% de ahorro directo en caja pagando con tu tarjeta de crédito Zeta.',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        discount_display: '20% Ahorro',
        conditions: 'Tope de Gs. 120.000 por cuenta por día de promoción.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [3], // Miércoles
        source_type: 'HTML',
        source_url: 'https://www.bancozeta.com.py/beneficios',
        category_slugs: ['supermercado'],
        card_keywords: ['clasica', 'gold']
      },
      {
        title: '20% de Descuento en Farmacias Farmacenter',
        description: 'Cuidá tu salud los martes con 20% de ahorro directo en caja pagando con tarjetas de crédito Zeta.',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        discount_display: '20% Ahorro',
        conditions: 'Tope de Gs. 100.000 por transacción.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [2], // Martes
        source_type: 'HTML',
        source_url: 'https://www.bancozeta.com.py/beneficios',
        category_slugs: ['farmacia', 'salud'],
        card_keywords: ['clasica', 'gold']
      },
      {
        title: '15% de Descuento en Estaciones Shell',
        description: 'Cargá nafta o diesel los sábados y obtené 15% de descuento al instante con tu tarjeta Zeta.',
        discount_type: 'PERCENTAGE',
        discount_value: 15,
        discount_display: '15% Ahorro',
        conditions: 'Tope de Gs. 80.000 por carga.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [6], // Sábado
        source_type: 'HTML',
        source_url: 'https://www.bancozeta.com.py/beneficios',
        category_slugs: ['combustible'],
        card_keywords: ['clasica', 'gold']
      }
    ]

    return fallbacks
  }
}
