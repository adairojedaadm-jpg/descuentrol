import { NextResponse } from 'next/server'
import { getActiveCategories } from '@/lib/db/categories'

export const revalidate = 900

export async function GET() {
  try {
    const data = await getActiveCategories()
    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
