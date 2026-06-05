import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token || !z.string().uuid().safeParse(token).success) {
      return new NextResponse('Token de desuscripción inválido.', { status: 400 })
    }

    const supabase = await createClient()

    // HTML de confirmación definido antes del delete para reutilizarlo en ambas ramas
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Desuscripción Exitosa | Descuentrol</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px 30px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025);
          }
          .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: #f0fdf4;
            color: #16a34a;
            border: 1px solid #dcfce7;
            font-size: 24px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 20px;
            font-weight: 750;
            margin: 0 0 10px 0;
            color: #0f172a;
          }
          p {
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
            margin: 0 0 24px 0;
          }
          .btn {
            display: inline-block;
            background-color: #f97316;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 12px;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #ea580c;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h1>Desuscripción completada</h1>
          <p>Tu correo ha sido eliminado de nuestra lista de alertas para esta categoría de forma exitosa. Ya no recibirás más notificaciones de este tipo.</p>
          <a href="/" class="btn">Volver al Home</a>
        </div>
      </body>
      </html>
    `

    // Eliminar el suscriptor y verificar filas afectadas
    const { data: deleted, error } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', token)
      .select('id')

    if (error) {
      return new NextResponse(`Error al procesar desuscripción: ${error.message}`, { status: 500 })
    }

    // Devolver el mismo HTML de éxito independientemente de si se encontró el suscriptor
    // (idempotente: doble clic funciona; evita enumeración de UUIDs)
    void deleted
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return new NextResponse(`Error: ${message}`, { status: 500 })
  }
}
