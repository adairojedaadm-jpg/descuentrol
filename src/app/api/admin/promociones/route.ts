import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { z } from 'zod'

// GET: Listar todas las promociones con datos del banco
export async function GET() {
  try {
    const supabase: SupabaseClient<Database> = await createClient()
    const { data, error } = await supabase
      .from('promotions')
      .select('*, bank:banks(name)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mapear el resultado para aplanar la propiedad bank.name
    type PromoWithBank = Database['public']['Tables']['promotions']['Row'] & { bank: { name: string } | null }
    const formatted = ((data || []) as unknown as PromoWithBank[]).map(promo => {
      return {
        ...promo,
        bank_name: promo.bank ? promo.bank.name : 'Desconocido'
      }
    })

    return NextResponse.json({ data: formatted })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH: Actualizar una promoción (verificación o estado activo)
const updatePromoSchema = z.object({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
  verified_by_admin: z.boolean().optional(),
  title: z.string().min(1).optional(),
  discount_display: z.string().min(1).optional(),
  conditions: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = updatePromoSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Parámetros inválidos.' }, { status: 400 })
    }

    const { id, ...updates } = validation.data
    const supabase: SupabaseClient<Database> = await createClient()

    const { data, error } = await supabase
      .from('promotions')
      .update(updates as Database['public']['Tables']['promotions']['Update'])
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

// DELETE: Borrar promoción de forma permanente
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id || !z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'ID de promoción inválido.' }, { status: 400 })
    }

    const supabase: SupabaseClient<Database> = await createClient()
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
