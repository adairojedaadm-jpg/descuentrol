import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export interface ExtractedPromo {
  title: string
  description: string | null
  discount_type: 'PERCENTAGE' | 'CASHBACK' | 'CUOTAS' | 'FREE'
  discount_value: number | null
  discount_display: string
  conditions: string | null
  valid_from: string | null
  valid_to: string | null
  days_of_week: number[]
  category_slugs: string[]
  card_keywords: string[]
}

const EXTRACTION_PROMPT = `Analizá este PDF de beneficios bancarios de Paraguay.
Extraé TODAS las promociones y retorná SOLO un JSON array válido, sin texto adicional antes ni después:
[
  {
    "title": "descripción corta de la promo, ej: 20% de descuento en supermercados",
    "description": "detalle adicional o null",
    "discount_type": "PERCENTAGE" o "CASHBACK" o "CUOTAS" o "FREE",
    "discount_value": número o null (ej: 20 para 20%, 12 para 12 cuotas),
    "discount_display": "texto para mostrar, ej: 20% OFF o 12 cuotas sin interés",
    "conditions": "letra chica o restricciones o null",
    "valid_from": "YYYY-MM-DD" o null,
    "valid_to": "YYYY-MM-DD" o null,
    "days_of_week": [] si aplica todos los días, o array con [0=Dom,1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb],
    "category_slugs": array con uno o más de: combustible, farmacia, supermercado, restaurante, viajes, electrodomesticos, ropa, entretenimiento, tecnologia, salud,
    "card_keywords": array de palabras clave para identificar tarjetas aplicables, ej: ["Visa","Mastercard","Clásica","Oro","Platinum"]
  }
]
Si no encontrás ninguna promoción retorná [].`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const pdf = formData.get('pdf') as File | null
    const bankId = formData.get('bank_id') as string | null

    if (!pdf || !bankId) {
      return NextResponse.json({ error: 'Se requiere PDF y bank_id' }, { status: 400 })
    }

    if (pdf.type !== 'application/pdf' && !pdf.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'El archivo debe ser un PDF' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurado en el servidor' }, { status: 503 })
    }

    const arrayBuffer = await pdf.arrayBuffer()
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64')

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Pdf,
              },
            } as Anthropic.DocumentBlockParam,
            {
              type: 'text',
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extraer el JSON del texto (puede tener backticks o texto previo)
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'No se pudo extraer JSON del análisis. Respuesta: ' + rawText.substring(0, 200) },
        { status: 422 }
      )
    }

    const promotions: ExtractedPromo[] = JSON.parse(jsonMatch[0])

    // Validar estructura mínima
    if (!Array.isArray(promotions)) {
      return NextResponse.json({ error: 'La respuesta de IA no es un array' }, { status: 422 })
    }

    return NextResponse.json({ promotions, count: promotions.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
