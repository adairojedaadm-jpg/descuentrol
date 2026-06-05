import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-xl border border-border/40 text-xs font-semibold gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al Home</span>
          </Button>
        </Link>
      </div>

      {/* Header */}
      <header className="mb-10 text-center sm:text-left">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-4">
          Política de Privacidad
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          De conformidad con la Ley N° 1682/2001 de la República del Paraguay y sus modificaciones (De la regulación de información de carácter privado).
        </p>
      </header>

      {/* Content */}
      <main className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
        
        {/* Section 1: Compromiso de Privacidad */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <span>1. Anonimato y Datos Financieros</span>
          </h2>
          <p>
            En <strong>Descuentrol</strong>, valoramos y protegemos la privacidad de nuestros usuarios. Declaramos explícitamente lo siguiente:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Sin Registro:</strong> No requerimos la creación de cuentas de usuario, contraseñas ni almacenamiento de perfiles de identidad para el uso del buscador de beneficios.
            </li>
            <li>
              <strong>Sin Datos del Medio de Pago:</strong> No almacenamos, solicitamos ni procesamos números de tarjetas de crédito, códigos de seguridad (CVV) ni fechas de vencimiento de tus plásticos.
            </li>
            <li>
              <strong>Persistencia Local:</strong> La selección de tus tarjetas de interés se almacena exclusivamente de forma local en tu navegador (mediante <code className="text-foreground font-mono bg-muted/65 px-1 py-0.5 rounded">localStorage</code>). Estos datos nunca se envían ni se guardan en nuestros servidores.
            </li>
          </ul>
        </section>

        {/* Section 2: Ley 1682/2001 */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-secondary" />
            <span>2. Cumplimiento de la Ley N° 1682/2001 (Paraguay)</span>
          </h2>
          <p>
            Nuestra plataforma cumple de forma estricta con la legislación vigente en la República del Paraguay:
          </p>
          <p>
            Dado que la plataforma se limita a categorizar y comparar públicamente las promociones y tasas de descuento de entidades bancarias oficiales activas, no se recopila información crediticia de carácter patrimonial ni historial de solvencia de ningún ciudadano paraguayo. Por tanto, no se configuran registros de historial de crédito conforme a los supuestos de la Ley N° 1682/2001.
          </p>
        </section>

        {/* Section 3: Datos Recopilados Voluntariamente */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-accent-foreground" />
            <span>3. Recopilación Voluntaria de Correo Electrónico</span>
          </h2>
          <p>
            La única información recolectada de forma activa ocurre al suscribirse de forma voluntaria al servicio de alertas semanales:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Uso Exclusivo:</strong> Tu dirección de correo se utilizará únicamente para enviarte notificaciones cuando los beneficios de tus tarjetas seleccionadas en una categoría específica sean actualizados.
            </li>
            <li>
              <strong>Sin Venta de Datos:</strong> Tu dirección de correo nunca será comercializada, distribuida ni compartida con terceros ajenos a la plataforma o a los servicios técnicos necesarios para el envío de correos (Resend).
            </li>
            <li>
              <strong>Desuscripción Simple:</strong> Cada boletín o correo electrónico enviado cuenta con un enlace directo y único de baja. Al hacer clic en dicho enlace, tus datos serán eliminados permanentemente de nuestra base de datos al instante.
            </li>
          </ul>
        </section>

        {/* Section 4: Cookies y Terceros */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            4. Enlaces a Terceros y Publicidad
          </h2>
          <p>
            Nuestra web contiene enlaces a los sitios oficiales de las entidades bancarias (Itaú, Continental, ueno, etc.) y muestra anuncios publicitarios gestionados por Google AdSense. Google utiliza cookies para mostrar anuncios basados en las visitas previas a este sitio web. Los usuarios pueden inhabilitar la publicidad personalizada a través del Administrador de preferencias de anuncios de Google.
          </p>
        </section>

        {/* Section 5: Actualizaciones */}
        <p className="text-center text-4xs text-muted-foreground pt-4">
          Última actualización: Junio de 2026. Descuentrol.
        </p>
      </main>
    </div>
  )
}
