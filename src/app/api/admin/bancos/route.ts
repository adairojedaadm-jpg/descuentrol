import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// GET: Obtener todos los bancos para el admin (activos e inactivos)
export async function GET() {
  try {
    const supabase: SupabaseClient<Database> = await createClient()
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH: Actualizar campos de un banco (active, is_sponsored)
const updateBankSchema = z.object({
  id: z.string().uuid(),
  active: z.boolean().optional(),
  is_sponsored: z.boolean().optional(),
}).refine(d => d.active !== undefined || d.is_sponsored !== undefined, {
  message: 'Se debe proporcionar al menos un campo a actualizar.',
})

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = updateBankSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Parámetros inválidos.' }, { status: 400 })
    }

    const { id, active, is_sponsored } = validation.data
    const updates: Database['public']['Tables']['banks']['Update'] = {}
    if (active !== undefined) updates.active = active
    if (is_sponsored !== undefined) updates.is_sponsored = is_sponsored

    const supabase: SupabaseClient<Database> = await createClient()

    const { data, error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
