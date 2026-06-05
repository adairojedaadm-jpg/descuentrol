import { BaseBank } from './banks/base'
import { ItauScraper } from './banks/itau'
import { UenoScraper } from './banks/ueno'
import { ContinentalScraper } from './banks/continental'
import { FamiliarScraper } from './banks/familiar'
import { SudamerisScraper } from './banks/sudameris'
import { GnbScraper } from './banks/gnb'
import { InterfisaScraper } from './banks/interfisa'
import { BnfScraper } from './banks/bnf'
import { AtlasScraper } from './banks/atlas'
import { BancopScraper } from './banks/bancop'
import { BasaScraper } from './banks/basa'
import { SolarScraper } from './banks/solar'
import { ZetaScraper } from './banks/zeta'
import { Resend } from 'resend'
import * as dotenv from 'dotenv'

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

async function main() {
  const scrapers: BaseBank[] = [
    new ItauScraper(),
    new UenoScraper(),
    new ContinentalScraper(),
    new FamiliarScraper(),
    new SudamerisScraper(),
    new GnbScraper(),
    new InterfisaScraper(),
    new BnfScraper(),
    new AtlasScraper(),
    new BancopScraper(),
    new BasaScraper(),
    new SolarScraper(),
    new ZetaScraper()
  ]

  // Parse command line arguments (e.g., --bank=itau)
  const bankArg = process.argv.find(arg => arg.startsWith('--bank='))
  const targetBankSlug = bankArg ? bankArg.split('=')[1]?.trim().toLowerCase() : null

  let scrapersToRun = scrapers
  if (targetBankSlug) {
    scrapersToRun = scrapers.filter(s => s.bankSlug === targetBankSlug)
    if (scrapersToRun.length === 0) {
      console.error(`Error: No se encontró ningún scraper implementado para el banco: '${targetBankSlug}'`)
      process.exit(1)
    }
  }

  console.log(`[Scraper Runner] Ejecutando ${scrapersToRun.length} scrapers...`)

  const results: { bankSlug: string; status: 'SUCCESS' | 'FAILED'; info?: any; error?: string }[] = []

  for (const scraper of scrapersToRun) {
    try {
      const info = await scraper.run()
      results.push({ bankSlug: scraper.bankSlug, status: 'SUCCESS', info })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      results.push({ bankSlug: scraper.bankSlug, status: 'FAILED', error: errorMsg })
      console.error(`[Scraper Runner] Scraper ${scraper.bankSlug} falló:`, err)
    }
  }

  // Generate and send email report if configured
  await sendEmailReport(results)

  // Exit with error code if any scraper failed
  const failed = results.some(r => r.status === 'FAILED')
  if (failed) {
    console.error('[Scraper Runner] Uno o más scrapers fallaron.')
    process.exit(1)
  } else {
    console.log('[Scraper Runner] Todos los scrapers finalizaron exitosamente.')
  }
}

async function sendEmailReport(results: { bankSlug: string; status: 'SUCCESS' | 'FAILED'; info?: any; error?: string }[]) {
  const adminEmail = process.env.ADMIN_EMAIL
  const apiKey = process.env.RESEND_API_KEY

  if (!adminEmail || !apiKey) {
    console.info('[Scraper Runner] Email de reporte omitido (falta configurar ADMIN_EMAIL o RESEND_API_KEY).')
    return
  }

  const successCount = results.filter(r => r.status === 'SUCCESS').length
  const totalCount = results.length

  const rowsHtml = results.map(r => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; font-weight: bold; text-transform: uppercase;">${r.bankSlug}</td>
      <td style="padding: 10px;">
        <span style="background-color: ${r.status === 'SUCCESS' ? '#22C55E' : '#EF4444'}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
          ${r.status}
        </span>
      </td>
      <td style="padding: 10px; font-family: monospace;">
        ${r.status === 'SUCCESS' 
          ? `Leídas: <b>${r.info.found}</b> | Creadas: <b>${r.info.created}</b> | Borradas: <b>${r.info.deleted}</b>` 
          : `<span style="color: #EF4444;">${r.error || 'Error desconocido'}</span>`
        }
      </td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #F97316; border-bottom: 2px solid #F97316; padding-bottom: 8px;">Reporte de Scraping Semanal - Descuentrol</h2>
      <p style="font-size: 14px;">Se completaron exitosamente <b>${successCount}</b> de <b>${totalCount}</b> scrapers ejecutados.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f3f4f6; border-bottom: 2px solid #ddd; text-align: left;">
            <th style="padding: 10px;">Banco</th>
            <th style="padding: 10px;">Estado</th>
            <th style="padding: 10px;">Detalles</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      
      <p style="font-size: 12px; color: #777; margin-top: 25px; border-top: 1px solid #eee; padding-top: 10px;">
        Este es un correo automático generado por los workflows de GitHub Actions de Descuentrol.
      </p>
    </div>
  `

  try {
    await resend.emails.send({
      from: 'alertas@promocard.com.py',
      to: adminEmail,
      subject: `[Descuentrol] Reporte de Scraping — ${successCount}/${totalCount} bancos OK`,
      html
    })
    console.log('[Scraper Runner] Reporte de correo enviado a admin exitosamente.')
  } catch (emailErr) {
    console.error('[Scraper Runner] Error enviando correo de reporte:', emailErr)
  }
}

main().catch(err => {
  console.error('[Scraper Runner] Error fatal:', err)
  process.exit(1)
})
