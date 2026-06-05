import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function GET() {
  try {
    const supabase: SupabaseClient<Database> = await createClient()

    // Ejecutar consultas estadísticas en paralelo para optimizar la velocidad
    const [
      promosRes,
      banksRes,
      subscribersRes,
      pendingRes,
      lastScrapeRes
    ] = await Promise.all([
      supabase.from('promotions').select('id', { count: 'exact', head: true }),
      supabase.from('banks').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('promotions').select('id', { count: 'exact', head: true }).eq('verified_by_admin', false).eq('is_active', true),
      supabase.from('scraping_logs')
        .select('finished_at')
        .eq('status', 'SUCCESS')
        .order('finished_at', { ascending: false })
        .limit(1)
    ])

    if (promosRes.error || banksRes.error || subscribersRes.error || pendingRes.error || lastScrapeRes.error) {
      const errorMsg =
        promosRes.error?.message ||
        banksRes.error?.message ||
        subscribersRes.error?.message ||
        pendingRes.error?.message ||
        lastScrapeRes.error?.message
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    type LogDate = Pick<Database['public']['Tables']['scraping_logs']['Row'], 'finished_at'>
    const lastScrape = lastScrapeRes.data && lastScrapeRes.data.length > 0
      ? (lastScrapeRes.data[0] as LogDate).finished_at
      : null

    return NextResponse.json({
      data: {
        total_promotions: promosRes.count || 0,
        active_banks: banksRes.count || 0,
        active_subscribers: subscribersRes.count || 0,
        pending_verification: pendingRes.count || 0,
        last_scrape_at: lastScrape
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
