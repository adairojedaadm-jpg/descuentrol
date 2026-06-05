import Link from 'next/link'
import { ArrowLeft, Scale, ShieldAlert, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TerminosPage() {
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
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 mb-4">
          <Scale className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-4">
          Términos de Uso
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Condiciones generales de uso y acceso a la plataforma comparadora de beneficios Descuentrol.
        </p>
      </header>

      {/* Content */}
      <main className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
        
        {/* Section 1: Propósito */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" />
            <span>1. Naturaleza Informativa</span>
          </h2>
          <p>
            <strong>Descuentrol</strong> es un agregador y comparador independiente de información pública sobre promociones, descuentos, reintegros y cuotas de tarjetas de crédito emitidas por entidades bancarias autorizadas en la República del Paraguay.
          </p>
          <p>
            Declaramos que <strong>Descuentrol no es una entidad financiera</strong>, no emite tarjetas de crédito, no otorga préstamos ni vende productos de ningún tipo. El acceso a la plataforma es libre, gratuito, anónimo y de naturaleza puramente informativa.
          </p>
        </section>

        {/* Section 2: Exclusión de Responsabilidad */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <span>2. Exclusión de Responsabilidad</span>
          </h2>
          <p>
            Aunque realizamos nuestros mejores esfuerzos para recopilar de forma automatizada y semanal la información correcta de los portales de los bancos paraguayos:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Variabilidad de Ofertas:</strong> Las promociones bancarias pueden ser modificadas, suspendidas o canceladas por las entidades bancarias o los comercios adheridos en cualquier momento y sin previo aviso.
            </li>
            <li>
              <strong>Verificación Requerida:</strong> El usuario asume la obligación exclusiva de verificar los términos, condiciones, topes de reintegro y comercios adheridos directamente en los canales oficiales de su banco o comercio antes de realizar cualquier consumo.
            </li>
            <li>
              <strong>Daños y Perjuicios:</strong> Descuentrol no se hace responsable por perjuicios comerciales, diferencias de facturación, fallos en el reintegro o malentendidos entre el tarjetahabiente, el comercio y la entidad emisora de la tarjeta.
            </li>
          </ul>
        </section>

        {/* Section 3: Uso Aceptable */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            3. Propiedad Intelectual y Marcas
          </h2>
          <p>
            Todos los nombres de bancos, marcas de comercios, logotipos, nombres de tarjetas de crédito y redes de pago (Visa, Mastercard, Amex, etc.) mostrados en este portal pertenecen a sus respectivos titulares y se utilizan en esta plataforma únicamente con fines informativos e ilustrativos para el beneficio del consumidor final, conforme al principio de libre elección y comparación de mercado.
          </p>
        </section>

        {/* Section 4: Jurisdicción */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            4. Ley Aplicable y Jurisdicción
          </h2>
          <p>
            Estos términos se rigen e interpretan de acuerdo con las leyes vigentes de la República del Paraguay. Cualquier controversia será sometida a la jurisdicción y competencia de los juzgados y tribunales de la ciudad de Asunción.
          </p>
        </section>

        {/* Footer */}
        <p className="text-center text-4xs text-muted-foreground pt-4">
          Última actualización: Junio de 2026. Descuentrol.
        </p>
      </main>
    </div>
  )
}
