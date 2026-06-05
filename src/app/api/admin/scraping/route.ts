import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { z } from 'zod'

// GET: Obtener logs de scraping
export async function GET() {
  try {
    const supabase: SupabaseClient<Database> = await createClient()
    const { data, error } = await supabase
      .from('scraping_logs')
      .select('*, bank:banks(name)')
      .order('started_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    type LogWithBank = Database['public']['Tables']['scraping_logs']['Row'] & { bank: { name: string } | null }
    const formatted = ((data || []) as unknown as LogWithBank[]).map(log => {
      return {
        ...log,
        bank_name: log.bank ? log.bank.name : 'Desconocido'
      }
    })

    return NextResponse.json({ data: formatted })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: Disparar manualmente un scraper en GitHub Actions
const triggerSchema = z.object({
  bank_slug: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = triggerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Falta especificar el banco a scrapear.' }, { status: 400 })
    }

    const { bank_slug } = validation.data

    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO
    const token = process.env.GITHUB_PAT

    const isGithubConfigured = owner && repo && token

    if (!isGithubConfigured) {
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[Scraping] Disparo manual de '${bank_slug}' simulado correctamente (falta configurar variables de entorno GITHUB_*).`)
        return NextResponse.json({
          success: true,
          message: `[Simulación Local] Raspado iniciado exitosamente para '${bank_slug}'.`
        })
      }
      return NextResponse.json({
        error: 'Integración de GitHub no configurada en las variables de entorno.'
      }, { status: 501 })
    }

    // Llamar a la API de GitHub Actions para disparar la ejecución manual
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/scrape-manual.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          'User-Agent': 'descuentrol-app'
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            bank_slug: bank_slug
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        error: `Error de API de GitHub (Status ${response.status}): ${errorText}`
      }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      message: `Raspado manual iniciado en GitHub Actions para el banco '${bank_slug}'.`
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
