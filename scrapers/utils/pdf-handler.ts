import { supabase } from './supabase-client'
import pdf from 'pdf-parse'
import { createHash } from 'crypto'

export async function handlePdf(
  pdfUrl: string,
  bankSlug: string
): Promise<{
  text: string | null
  storedUrl: string
}> {
  try {
    // 1. Descargar PDF
    const response = await fetch(pdfUrl)
    if (!response.ok) {
      throw new Error(`Error descargando PDF: status ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 2. Subir a Supabase Storage
    const hash = createHash('sha256').update(pdfUrl).digest('hex').slice(0, 8)
    const dateStr = new Date().toISOString().split('T')[0]
    const fileName = `${bankSlug}/${dateStr}/${hash}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('promotions-pdfs')
      .upload(fileName, buffer, {
        upsert: true,
        contentType: 'application/pdf',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.warn(`[PDF Handler] Error subiendo PDF a Supabase Storage: ${uploadError.message}`)
    }

    const { data } = supabase.storage
      .from('promotions-pdfs')
      .getPublicUrl(fileName)

    const storedUrl = data?.publicUrl || pdfUrl

    // 3. Intentar extracción de texto
    try {
      const parsed = await pdf(buffer)
      const text = parsed.text?.trim() || null
      return { text, storedUrl }
    } catch (parseError) {
      console.warn(`[PDF Handler] Error parseando PDF (posiblemente escaneado/imagen):`, parseError)
      return { text: null, storedUrl }
    }
  } catch (error) {
    console.error(`[PDF Handler] Error general procesando PDF ${pdfUrl}:`, error)
    return { text: null, storedUrl: pdfUrl }
  }
}
