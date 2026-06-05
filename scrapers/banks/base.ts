import { supabase } from '../utils/supabase-client'
import { NormalizedPromotion } from '../utils/normalize'
import { generateHash } from '../utils/hash'

export interface ScrapingResult {
  found: number
  created: number
  updated: number
  deleted: number
}

export function getBankSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace('banco ', '')
    .replace(' (banco nacional de fomento)', '')
    .trim()
    .split(' ')[0] // e.g. "itau", "continental", "ueno"
}

export abstract class BaseBank {
  abstract bankSlug: string
  abstract scrape(): Promise<NormalizedPromotion[]>

  async run(): Promise<ScrapingResult> {
    console.log(`[Scraper ${this.bankSlug}] Iniciando corrida...`)

    // 1. Obtener ID del Banco y verificar si existe
    const { data: banks, error: bankErr } = await supabase
      .from('banks')
      .select('*')

    if (bankErr || !banks) {
      throw new Error(`Error consultando bancos: ${bankErr?.message || 'Sin datos'}`)
    }

    const bank = banks.find(b => getBankSlug(b.name) === this.bankSlug)
    if (!bank) {
      throw new Error(`Banco con slug '${this.bankSlug}' no encontrado en la base de datos.`)
    }

    if (!bank.active) {
      console.log(`[Scraper ${this.bankSlug}] El banco está inactivo en el panel. Abortando raspado.`)
      return { found: 0, created: 0, updated: 0, deleted: 0 }
    }

    const bankId = bank.id

    // 2. Registrar inicio en scraping_logs
    const { data: logRow, error: logErr } = await supabase
      .from('scraping_logs')
      .insert({
        bank_id: bankId,
        status: 'RUNNING',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (logErr || !logRow) {
      throw new Error(`No se pudo iniciar el log de scraping: ${logErr?.message}`)
    }

    const logId = logRow.id

    try {
      // 3. Traer categorías y tarjetas activas para mapeo
      const { data: categories, error: catErr } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('active', true)

      if (catErr || !categories) {
        throw new Error(`Error trayendo categorías: ${catErr?.message}`)
      }

      const { data: bankCards, error: cardErr } = await supabase
        .from('cards')
        .select('id, name, network')
        .eq('bank_id', bankId)
        .eq('active', true)

      if (cardErr || !bankCards) {
        throw new Error(`Error trayendo tarjetas del banco: ${cardErr?.message}`)
      }

      // 4. Ejecutar el scrap
      const scrapedPromos = await this.scrape()
      console.log(`[Scraper ${this.bankSlug}] Se encontraron ${scrapedPromos.length} promociones brutas.`)

      let createdCount = 0
      let updatedCount = 0
      const activeHashes: string[] = []

      // 5. Procesar y persistir cada promoción
      for (const rawPromo of scrapedPromos) {
        // Generar hash único
        const externalHash = generateHash(bankId, rawPromo.title, rawPromo.source_url)
        activeHashes.push(externalHash)

        // Resolver categorías
        const matchedCategoryIds = categories
          .filter(c => rawPromo.category_slugs.includes(c.slug))
          .map(c => c.id)

        // Resolver tarjetas del banco
        let matchedCardIds: string[] = []
        if (rawPromo.card_keywords && rawPromo.card_keywords.length > 0) {
          const keywords = rawPromo.card_keywords.map(k => k.toLowerCase())
          matchedCardIds = bankCards
            .filter(c => {
              const nameLower = c.name.toLowerCase()
              const netLower = c.network.toLowerCase()
              return keywords.some(k => nameLower.includes(k) || netLower === k)
            })
            .map(c => c.id)
        }

        // Si no especificó tarjetas o ninguna coincide, asociar a TODAS las tarjetas del banco
        if (matchedCardIds.length === 0) {
          matchedCardIds = bankCards.map(c => c.id)
        }

        // Preparar fila de promoción
        const promoRow = {
          bank_id: bankId,
          title: rawPromo.title,
          description: rawPromo.description || null,
          discount_type: rawPromo.discount_type,
          discount_value: rawPromo.discount_value || null,
          discount_display: rawPromo.discount_display,
          conditions: rawPromo.conditions || null,
          valid_from: rawPromo.valid_from || null,
          valid_to: rawPromo.valid_to || null,
          days_of_week: rawPromo.days_of_week,
          is_active: true,
          verified_by_admin: false,
          source_type: rawPromo.source_type,
          source_url: rawPromo.source_url || null,
          pdf_url: rawPromo.pdf_url || null,
          external_hash: externalHash,
          scraped_at: new Date().toISOString()
        }

        // Verificar si ya existe para ver si es UPDATE o INSERT
        const { data: existing } = await supabase
          .from('promotions')
          .select('id')
          .eq('external_hash', externalHash)
          .maybeSingle()

        let promoId: string

        if (existing) {
          // Actualizar
          const { error: updErr } = await supabase
            .from('promotions')
            .update(promoRow)
            .eq('id', existing.id)

          if (updErr) {
            console.error(`Error actualizando promo ${rawPromo.title}: ${updErr.message}`)
            continue
          }
          promoId = existing.id
          updatedCount++
        } else {
          // Insertar
          const { data: inserted, error: insErr } = await supabase
            .from('promotions')
            .insert(promoRow)
            .select('id')
            .single()

          if (insErr || !inserted) {
            console.error(`Error insertando promo ${rawPromo.title}: ${insErr?.message}`)
            continue
          }
          promoId = inserted.id
          createdCount++
        }

        // Actualizar relaciones M:M (Categories)
        const { error: delCatErr } = await supabase.from('promotion_categories').delete().eq('promotion_id', promoId)
        if (delCatErr) console.error(`[Scraper ${this.bankSlug}] Error borrando categorias promo ${promoId}:`, delCatErr.message)
        if (matchedCategoryIds.length > 0) {
          const { error: insCatErr } = await supabase.from('promotion_categories').insert(
            matchedCategoryIds.map(catId => ({
              promotion_id: promoId,
              category_id: catId
            }))
          )
          if (insCatErr) console.error(`[Scraper ${this.bankSlug}] Error insertando categorias promo ${promoId}:`, insCatErr.message)
        }

        // Actualizar relaciones M:M (Cards)
        const { error: delCardErr } = await supabase.from('promotion_cards').delete().eq('promotion_id', promoId)
        if (delCardErr) console.error(`[Scraper ${this.bankSlug}] Error borrando tarjetas promo ${promoId}:`, delCardErr.message)
        if (matchedCardIds.length > 0) {
          const { error: insCardErr } = await supabase.from('promotion_cards').insert(
            matchedCardIds.map(cardId => ({
              promotion_id: promoId,
              card_id: cardId
            }))
          )
          if (insCardErr) console.error(`[Scraper ${this.bankSlug}] Error insertando tarjetas promo ${promoId}:`, insCardErr.message)
        }
      }

      // 6. Limpieza Semanal (Hard Delete de promos de este banco no encontradas en esta corrida)
      let deletedCount = 0
      if (activeHashes.length > 0) {
        // Obtener promos actuales en DB para este banco
        const { data: currentPromos } = await supabase
          .from('promotions')
          .select('id, external_hash')
          .eq('bank_id', bankId)

        if (currentPromos) {
          const obsoletePromos = currentPromos.filter(
            p => p.external_hash && !activeHashes.includes(p.external_hash)
          )

          if (obsoletePromos.length > 0) {
            const obsoleteIds = obsoletePromos.map(p => p.id)
            const { error: delErr } = await supabase
              .from('promotions')
              .delete()
              .in('id', obsoleteIds)

            if (delErr) {
              console.error(`[Scraper ${this.bankSlug}] Error en borrado de obsoletos:`, delErr.message)
            } else {
              deletedCount = obsoleteIds.length
              console.log(`[Scraper ${this.bankSlug}] Hard Delete completado: ${deletedCount} promos obsoletas eliminadas.`)
            }
          }
        }
      }

      // 7. Borrado de Promociones Vencidas (LT hoy en Asunción)
      const todayString = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' }) // YYYY-MM-DD
      const { data: expiredDeleted, error: expErr } = await supabase
        .from('promotions')
        .delete()
        .eq('bank_id', bankId)
        .lt('valid_to', todayString)
        .select('id')

      if (expErr) {
        console.error(`[Scraper ${this.bankSlug}] Error eliminando vencidas:`, expErr.message)
      } else if (expiredDeleted && expiredDeleted.length > 0) {
        console.log(`[Scraper ${this.bankSlug}] Borrados ${expiredDeleted.length} promociones vencidas del banco.`)
        deletedCount += expiredDeleted.length
      }

      // 8. Actualizar last_scraped_at en banks
      await supabase
        .from('banks')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', bankId)

      // 9. Registrar éxito en logs
      const result: ScrapingResult = {
        found: scrapedPromos.length,
        created: createdCount,
        updated: updatedCount,
        deleted: deletedCount
      }

      await supabase
        .from('scraping_logs')
        .update({
          status: 'SUCCESS',
          finished_at: new Date().toISOString(),
          promos_found: result.found,
          promos_created: result.created,
          promos_updated: result.updated,
          promos_deleted: result.deleted
        })
        .eq('id', logId)

      console.log(`[Scraper ${this.bankSlug}] Corrida finalizada con éxito.`, result)

      // Enviar alertas de email a suscriptores si se crearon o modificaron promos
      if (result.created > 0 || result.updated > 0) {
        await this.sendSubscriberAlerts(bankId, bank.name)
      }

      return result

    } catch (error) {
      console.error(`[Scraper ${this.bankSlug}] Ocurrió un error en la corrida:`, error)
      
      // Registrar falla en scraping_logs
      await supabase
        .from('scraping_logs')
        .update({
          status: 'FAILED',
          finished_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : String(error)
        })
        .eq('id', logId)

      throw error
    }
  }

  private async sendSubscriberAlerts(bankId: string, bankName: string) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log(`[Scraper ${this.bankSlug}] Resend API Key no configurada. Omitiendo alertas a suscriptores.`)
      return
    }

    try {
      const { Resend } = require('resend')
      const resend = new Resend(apiKey)

      // 1. Obtener los category_ids de las promociones ACTIVAS de este banco
      const { data: activePromos, error: promosErr } = await supabase
        .from('promotions')
        .select('id')
        .eq('bank_id', bankId)
        .eq('is_active', true)

      if (promosErr || !activePromos || activePromos.length === 0) {
        console.log(`[Scraper ${this.bankSlug}] No hay promociones activas para evaluar alertas.`)
        return
      }

      const { data: promoCats, error: promoCatsErr } = await supabase
        .from('promotion_categories')
        .select('category_id')
        .in('promotion_id', activePromos.map(p => p.id))

      if (promoCatsErr || !promoCats || promoCats.length === 0) {
        console.log(`[Scraper ${this.bankSlug}] No hay categorias asignadas a las promos activas. No se envian alertas.`)
        return
      }

      const relevantCategoryIds = [...new Set(promoCats.map(pc => pc.category_id))]

      // 2. Traer solo suscriptores cuya category_id esté en las categorías activas del banco
      const { data: subscribers, error: subErr } = await supabase
        .from('subscribers')
        .select('*, categories:category_id(name, slug)')
        .eq('active', true)
        .in('category_id', relevantCategoryIds)

      if (subErr || !subscribers || subscribers.length === 0) {
        console.log(`[Scraper ${this.bankSlug}] Sin suscriptores para las categorias activas de este banco.`)
        return
      }

      console.log(`[Scraper ${this.bankSlug}] Evaluando ${subscribers.length} suscriptores filtrados por categoria...`)

      const bankSearchWord = getBankSlug(bankName)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      // 3. Filtrar destinatarios por coincidencia de tarjetas
      const toNotify = subscribers.filter(sub => {
        const cat = sub.categories as unknown as { name: string; slug: string } | null
        if (!cat) return false
        if (!sub.card_names || sub.card_names.length === 0) return true
        return sub.card_names.some((name: string) =>
          name.toLowerCase().includes(bankSearchWord) ||
          bankName.toLowerCase().includes(name.toLowerCase())
        )
      })

      const alertCount = toNotify.length

      // 4. Enviar emails en paralelo con catch individual por destinatario
      await Promise.all(
        toNotify.map(sub => {
          const cat = sub.categories as unknown as { name: string; slug: string }
          const subject = `¡Beneficios de tus tarjetas actualizados en ${cat.name}! - Descuentrol`
          const unsubscribeUrl = `${appUrl}/api/desuscribirse?token=${sub.id}`
          const searchUrl = `${appUrl}/buscar?cat=${cat.slug}`

          const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
              <h2 style="color: #F97316; border-bottom: 2px solid #F97316; padding-bottom: 8px;">
                Beneficios Actualizados - Descuentrol
              </h2>
              <p>¡Hola!</p>
              <p>Te escribimos para recordarte que los beneficios y promociones de tus tarjetas de <b>${bankName}</b> en la categoría <b>${cat.name}</b> han sido actualizados en nuestra plataforma.</p>
              <p>Cada vez que ejecutamos nuestros scrapers semanales, realizamos una limpieza y actualización completa para que siempre veas únicamente lo que está vigente hoy en el mercado paraguayo.</p>

              <div style="margin: 25px 0; text-align: center;">
                <a href="${searchUrl}" style="background-color: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
                  Ver mis beneficios vigentes
                </a>
              </div>

              <p style="font-size: 11px; color: #777; margin-top: 40px; border-top: 1px solid #eee; padding-top: 15px;">
                Recibís este correo porque te suscribiste a las alertas de Descuentrol.<br />
                Si querés dejar de recibir estas alertas de forma definitiva, podés desuscribirte haciendo clic en el siguiente enlace:<br />
                <a href="${unsubscribeUrl}" style="color: #EF4444; text-decoration: underline;">
                  Cancelar mi suscripción a esta alerta
                </a>.
              </p>
            </div>
          `

          return resend.emails.send({
            from: 'alertas@promocard.com.py',
            to: sub.email,
            subject,
            html
          }).catch((err: unknown) => {
            console.error(`[Scraper ${this.bankSlug}] Fallo email a ${sub.email}:`, err)
          })
        })
      )

      console.log(`[Scraper ${this.bankSlug}] Alertas de correo enviadas a ${alertCount} suscriptores.`)

    } catch (err) {
      console.error(`[Scraper ${this.bankSlug}] Error enviando alertas a suscriptores:`, err)
    }
  }
}
