import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email(),
  category_id: z.string().min(1), // this is the category slug sent by the client dialog
  card_names: z.array(z.string()).default([]),
})

interface SubscribersClient {
  from(table: 'categories'): {
    select(columns: 'id'): {
      eq(column: 'slug', value: string): {
        maybeSingle(): Promise<{
          data: { id: string } | null
          error: { message: string } | null
        }>
      }
    }
  }
  from(table: 'subscribers'): {
    upsert(
      values: {
        email: string
        category_id: string
        card_names: string[]
        active: boolean
      },
      options?: { onConflict?: string }
    ): {
      select(): {
        single(): Promise<{
          data: Database['public']['Tables']['subscribers']['Row'] | null
          error: { message: string } | null
        }>
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = subscribeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos de suscripción inválidos.', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { email, category_id: categorySlug, card_names } = validation.data
    const supabase = await createClient()
    const client = supabase as unknown as SubscribersClient

    // 1. Resolver el UUID de la categoría usando el slug
    const { data: category, error: catError } = await client
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle()

    if (catError) {
      return NextResponse.json(
        { error: 'Error interno al validar la categoría.' },
        { status: 500 }
      )
    }
    if (!category) {
      return NextResponse.json(
        { error: 'La categoría especificada no es válida.' },
        { status: 400 }
      )
    }

    // 2. Realizar el upsert en la tabla de suscriptores
    const { data, error } = await client
      .from('subscribers')
      .upsert(
        {
          email: email.trim().toLowerCase(),
          category_id: category.id,
          card_names,
          active: true
        },
        { onConflict: 'email,category_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

