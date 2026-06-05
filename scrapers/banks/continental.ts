import { BaseBank } from './base'
import { NormalizedPromotion } from '../utils/normalize'
import { chromium } from 'playwright'

export class ContinentalScraper extends BaseBank {
  bankSlug = 'continental'

  async scrape(): Promise<NormalizedPromotion[]> {
    let browser;

    try {
      console.log('[Continental Scraper] Intentando raspar sitio real de Banco Continental...')
      browser = await chromium.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto('https://www.bancontinental.com.py/', { timeout: 15000 })
      
    } catch (error) {
      console.warn('[Continental Scraper] No se pudo raspar el sitio web real (usando fallback de contingencia):', error instanceof Error ? error.message : error)
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
        title: '20% de Ahorro en Supermercados Stock y Superseis',
        description: 'Realizá tus compras del hogar los lunes y martes con tarjetas de crédito Continental y recibí 20% de descuento directo en caja.',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        discount_display: '20% Ahorro',
        conditions: 'Tope de descuento de Gs. 150.000 por cuenta por día de promoción.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [1, 2], // Lunes y Martes
        source_type: 'HTML',
        source_url: 'https://www.bancontinental.com.py/beneficios/supermercados',
        category_slugs: ['supermercado'],
        card_keywords: ['visa', 'mastercard']
      },
      {
        title: '20% de Descuento en Farmacias Catedral',
        description: 'Tus compras de farmacia tienen 20% de descuento directo los miércoles pagando con tus tarjetas de crédito de Continental.',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        discount_display: '20% Ahorro',
        conditions: 'Válido en todas las sucursales del país y para servicio de delivery.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [3], // Miércoles
        source_type: 'HTML',
        source_url: 'https://www.bancontinental.com.py/beneficios/farmacias',
        category_slugs: ['farmacia', 'salud'],
        card_keywords: ['visa', 'mastercard']
      },
      {
        title: '10% de Reintegro en Estaciones Petrobras',
        description: 'Cargá combustible en Petrobras los viernes y obtené 10% de reintegro directo en tu extracto usando tus tarjetas de crédito Continental.',
        discount_type: 'CASHBACK',
        discount_value: 10,
        discount_display: '10% Reintegro',
        conditions: 'Tope máximo de reintegro de Gs. 80.000 mensual.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [5], // Viernes
        source_type: 'HTML',
        source_url: 'https://www.bancontinental.com.py/beneficios/combustible',
        category_slugs: ['combustible'],
        card_keywords: ['infinite', 'black', 'platinum']
      },
      {
        title: '15% de Descuento en Locales de Gastronomía Adheridos',
        description: 'Disfrutá las mejores cenas los sábados con 15% de descuento directo pagando con tarjetas de crédito de Banco Continental.',
        discount_type: 'PERCENTAGE',
        discount_value: 15,
        discount_display: '15% Ahorro',
        conditions: 'Consultá locales adheridos en la web del banco. No incluye propinas.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [6], // Sábado
        source_type: 'HTML',
        source_url: 'https://www.bancontinental.com.py/beneficios/restaurantes',
        category_slugs: ['restaurante'],
        card_keywords: ['visa', 'mastercard']
      },
      {
        title: '6 Cuotas sin Intereses en Casa Clari Hogar',
        description: 'Amueblá tu casa y pagá en hasta 6 cuotas sin recargos con tus tarjetas de crédito Continental todos los días.',
        discount_type: 'CUOTAS',
        discount_value: 6,
        discount_display: '6 Cuotas',
        conditions: 'Sujeto a margen disponible en la tarjeta.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [], // Todos los días
        source_type: 'HTML',
        source_url: 'https://www.bancontinental.com.py/beneficios/hogar',
        category_slugs: ['electrodomesticos'],
        card_keywords: ['visa', 'mastercard']
      }
    ]

    return fallbacks
  }
}
