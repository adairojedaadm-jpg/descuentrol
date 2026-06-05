import { createClient } from '@/lib/supabase/server'

export async function getActiveCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, color, display_order')
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`Error obteniendo categorías: ${error.message}`)
  }

  return data || []
}
