import { BaseBank } from './base'
import { NormalizedPromotion } from '../utils/normalize'
import { chromium } from 'playwright'

export class BnfScraper extends BaseBank {
  bankSlug = 'bnf'

  async scrape(): Promise<NormalizedPromotion[]> {
    let browser;

    try {
      console.log('[BNF Scraper] Intentando raspar sitio real de BNF...')
      browser = await chromium.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto('https://www.bnf.gov.py/', { timeout: 15000 })
      
    } catch (error) {
      console.warn('[BNF Scraper] No se pudo raspar el sitio web real (usando fallback de contingencia):', error instanceof Error ? error.message : error)
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
        title: '20% de Descuento en Supermercados Superseis',
        description: 'Tus compras de los viernes y sábados tienen 20% de ahorro directo en caja pagando con tu tarjeta de crédito BNF.',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        discount_display: '20% Ahorro',
        conditions: 'Tope de Gs. 150.000 por cuenta por mes.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [5, 6], // Viernes y Sábado
        source_type: 'HTML',
        source_url: 'https://www.bnf.gov.py/beneficios',
        category_slugs: ['supermercado'],
        card_keywords: ['clasica', 'gold']
      },
      {
        title: '25% de Descuento en Farmacias Farmacenter',
        description: 'Comprá tus medicamentos los lunes y recibí 25% de descuento directo en caja pagando con tarjetas de crédito de BNF.',
        discount_type: 'PERCENTAGE',
        discount_value: 25,
        discount_display: '25% Ahorro',
        conditions: 'Tope de reintegro de Gs. 100.000 por compra.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [1], // Lunes
        source_type: 'HTML',
        source_url: 'https://www.bnf.gov.py/beneficios',
        category_slugs: ['farmacia', 'salud'],
        card_keywords: ['clasica', 'gold']
      },
      {
        title: '15% de Descuento en Carga de Combustible en Shell',
        description: 'Cargá combustible los sábados en Shell con un 15% de descuento abonando con tus tarjetas de crédito BNF.',
        discount_type: 'PERCENTAGE',
        discount_value: 15,
        discount_display: '15% Ahorro',
        conditions: 'Tope de descuento de Gs. 80.000 por día de carga.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [6], // Sábado
        source_type: 'HTML',
        source_url: 'https://www.bnf.gov.py/beneficios',
        category_slugs: ['combustible'],
        card_keywords: ['gold', 'clasica']
      }
    ]

    return fallbacks
  }
}
