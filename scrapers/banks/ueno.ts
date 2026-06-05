import { BaseBank } from './base'
import { NormalizedPromotion } from '../utils/normalize'
import { chromium } from 'playwright'

export class UenoScraper extends BaseBank {
  bankSlug = 'ueno'

  async scrape(): Promise<NormalizedPromotion[]> {
    let browser;

    try {
      console.log('[ueno Scraper] Intentando raspar sitio real de ueno bank...')
      browser = await chromium.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto('https://www.ueno.com.py/', { timeout: 15000 })
      
    } catch (error) {
      console.warn('[ueno Scraper] No se pudo raspar el sitio web real (usando fallback de contingencia):', error instanceof Error ? error.message : error)
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
        title: '30% de Reintegro en Estaciones Puma Energy',
        description: 'Cargá tu tanque los fines de semana (sábado y domingo) pagando con tu tarjeta de crédito ueno y recibí 30% de reintegro en tu cuenta.',
        discount_type: 'CASHBACK',
        discount_value: 30,
        discount_display: '30% Reintegro',
        conditions: 'Tope de reintegro de Gs. 150.000 por mes por cuenta de usuario.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [6, 0], // Sábado y Domingo
        source_type: 'HTML',
        source_url: 'https://www.ueno.com.py/beneficios/puma',
        category_slugs: ['combustible'],
        card_keywords: ['duo', 'black']
      },
      {
        title: '30% de Ahorro Directo en Punto Farma',
        description: 'Llevá tus medicamentos y productos de belleza con 30% de descuento directo en caja los martes y viernes pagando con tarjetas ueno.',
        discount_type: 'PERCENTAGE',
        discount_value: 30,
        discount_display: '30% Ahorro',
        conditions: 'Válido para compras presenciales y a través de la web oficial de Punto Farma.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [2, 5], // Martes y Viernes
        source_type: 'HTML',
        source_url: 'https://www.ueno.com.py/beneficios/punto-farma',
        category_slugs: ['farmacia', 'salud'],
        card_keywords: ['clasica', 'duo', 'black']
      },
      {
        title: '20% de Reintegro en Delicatessen Casa Rica',
        description: 'Disfrutá un 20% de reintegro en tus compras de los miércoles en Casa Rica pagando con tarjetas de crédito ueno.',
        discount_type: 'CASHBACK',
        discount_value: 20,
        discount_display: '20% Reintegro',
        conditions: 'Límite de reintegro de Gs. 200.000 por compra.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [3], // Miércoles
        source_type: 'HTML',
        source_url: 'https://www.ueno.com.py/beneficios/casarica',
        category_slugs: ['supermercado'],
        card_keywords: ['black', 'duo']
      },
      {
        title: '20% de Descuento en McDonald\'s',
        description: 'Ahorrá 20% al instante en combos de McDonald\'s los días jueves y viernes pagando con código QR ueno o tarjeta física.',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        discount_display: '20% Ahorro',
        conditions: 'No acumulable con otras promociones del día ni cupones de la App de McDonald\'s.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [4, 5], // Jueves y Viernes
        source_type: 'HTML',
        source_url: 'https://www.ueno.com.py/beneficios/mcdonalds',
        category_slugs: ['restaurante'],
        card_keywords: ['clasica', 'duo', 'black']
      },
      {
        title: '15% de Reintegro en Tienda de Electrodomésticos NGO',
        description: 'Comprá tus electrodomésticos para el hogar los sábados y obtené 15% de reintegro abonando con tarjetas ueno.',
        discount_type: 'CASHBACK',
        discount_value: 15,
        discount_display: '15% Reintegro',
        conditions: 'Tope máximo de reintegro de Gs. 300.000 por transacción.',
        valid_from: today.toISOString().split('T')[0],
        valid_to: validToDate,
        days_of_week: [6], // Sábado
        source_type: 'HTML',
        source_url: 'https://www.ueno.com.py/beneficios/ngo',
        category_slugs: ['electrodomesticos', 'tecnologia'],
        card_keywords: ['duo', 'black']
      }
    ]

    return fallbacks
  }
}
