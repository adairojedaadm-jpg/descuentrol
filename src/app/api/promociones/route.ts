import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ratelimit } from '@/lib/rate-limit'
import { Database } from '@/types/database'
import { z } from 'zod'

// Validación estricta con Zod
const searchSchema = z.object({
  categoria: z.string().min(1).max(50),
  tarjetas: z.string()
    .transform((s) => s.split(',').filter(Boolean))
    .pipe(z.array(z.string().uuid()).min(1).max(20)), // Límite de 20 tarjetas
  dia: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? undefined : Number(val)),
    z.number().int().min(0).max(6).optional()
  )
})

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener la IP para Rate Limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    
    // 2. Validar Rate Limit
    const { success, limit, remaining, reset } = await ratelimit.limit(ip)
    
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Por favor, reintenta en un minuto.' },
        { status: 429, headers }
      )
    }

    // 3. Validar Parámetros de Query
    const searchParams = request.nextUrl.searchParams
    const queryData = {
      categoria: searchParams.get('categoria'),
      tarjetas: searchParams.get('tarjetas'),
      dia: searchParams.get('dia'),
    }

    const validation = searchSchema.safeParse(queryData)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos o insuficientes.', details: validation.error.format() },
        { status: 400, headers }
      )
    }

    const { categoria, tarjetas, dia } = validation.data
    
    // 4. Crear cliente de Supabase
    const supabase = await createClient()

    const rpcArgs: Database['public']['Functions']['search_promotions']['Args'] = {
      p_categoria: categoria,
      p_tarjetas: tarjetas,
    }
    if (dia !== undefined) {
      rpcArgs.p_dia = dia
    }

    // Interfaz segura para evitar problemas de resolución del compilador en el rpc de Supabase
    interface SearchPromotionsClient {
      rpc(
        fn: 'search_promotions',
        args: Database['public']['Functions']['search_promotions']['Args']
      ): Promise<{ data: unknown; error: { message: string } | null }>
    }

    const { data, error } = await (supabase as unknown as SearchPromotionsClient).rpc(
      'search_promotions',
      rpcArgs
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers })
    }

    const dataArray = Array.isArray(data) ? data : []

    return NextResponse.json({ 
      data: dataArray, 
      total: dataArray.length 
    }, { status: 200, headers })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
