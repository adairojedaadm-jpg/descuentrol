import type { Metadata } from 'next'
import Link from 'next/link'
import { Megaphone, Users, TrendingUp, Mail, Zap, BarChart3, Star, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Anunciá en Descuentrol | Llegá a usuarios que buscan descuentos en Paraguay',
  description: 'Mostrá tu banco o comercio a miles de paraguayos que buscan descuentos activamente. Paquetes desde USD 50/mes.',
}

const PAQUETES = [
  {
    nombre: 'Banner',
    precio: 'USD 50',
    periodo: '/mes',
    descripcion: 'Tu imagen aparece entre los resultados de búsqueda.',
    items: [
      'Banner visual en página de resultados',
      'Link directo a tu web o promo',
      'Visible en todas las categorías',
      'Renovación mensual flexible',
    ],
    destacado: false,
    cta: 'Consultar',
  },
  {
    nombre: 'Banco Destacado',
    precio: 'USD 150',
    periodo: '/mes',
    descripcion: 'Tu banco aparece primero en una categoría, con badge "Patrocinado".',
    items: [
      'Primera posición garantizada en 1 categoría',
      'Badge "Patrocinado" en color dorado',
      'Banner incluido en resultados',
      'Link a tu landing de beneficios',
    ],
    destacado: true,
    cta: 'Consultar',
  },
  {
    nombre: 'Paquete Completo',
    precio: 'USD 300',
    periodo: '/mes',
    descripcion: 'Máxima visibilidad: banco destacado + banner + alertas a suscriptores.',
    items: [
      'Primera posición en 3 categorías',
      'Banner en resultados + homepage',
      'Mención en alertas por email',
      'Reporte mensual de impressiones',
    ],
    destacado: false,
    cta: 'Consultar',
  },
]

const STATS = [
  { label: 'Búsquedas mensuales', valor: '10.000+', icon: TrendingUp },
  { label: 'Categorías activas', valor: '10', icon: BarChart3 },
  { label: 'Bancos en catálogo', valor: '14', icon: Star },
  { label: 'Crecimiento mensual', valor: '↑ 30%', icon: Users },
]

export default function PublicidadPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">

      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-semibold text-amber-700 mb-6">
          <Megaphone className="h-3.5 w-3.5" />
          Publicidad en Descuentrol
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-5">
          Llegá a quienes ya están{' '}
          <span className="text-primary">buscando descuentos</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Descuentrol es el único lugar en Paraguay donde la gente busca activamente qué tarjeta usar hoy.
          Tu banco o comercio aparece justo cuando el usuario está decidiendo dónde gastar.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {STATS.map(({ label, valor, icon: Icon }) => (
          <div key={label} className="text-center p-5 bg-card border border-border/40 rounded-2xl shadow-sm">
            <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="font-heading text-2xl font-extrabold text-foreground">{valor}</div>
            <div className="text-3xs text-muted-foreground mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </section>

      {/* Paquetes */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl font-bold text-center text-foreground mb-10">
          Paquetes disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAQUETES.map((pkg) => (
            <div
              key={pkg.nombre}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                pkg.destacado
                  ? 'border-primary bg-primary/5 shadow-primary/10 shadow-md'
                  : 'border-border/50 bg-card'
              }`}
            >
              {pkg.destacado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary text-primary-foreground text-3xs font-bold px-3 py-1 rounded-full shadow">
                  <Zap className="h-2.5 w-2.5" />
                  Más popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-heading text-base font-bold text-foreground mb-1">{pkg.nombre}</h3>
                <p className="text-3xs text-muted-foreground leading-relaxed">{pkg.descripcion}</p>
              </div>

              <div className="mb-5">
                <span className="font-heading text-3xl font-extrabold text-foreground">{pkg.precio}</span>
                <span className="text-xs text-muted-foreground font-medium">{pkg.periodo}</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {pkg.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={`mailto:adairojeda.adm@gmail.com?subject=Consulta%20publicidad%20Descuentrol%20-%20${encodeURIComponent(pkg.nombre)}&body=Hola%2C%20me%20interesa%20el%20paquete%20${encodeURIComponent(pkg.nombre)}%20de%20Descuentrol.`}
                className={`w-full text-center rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                  pkg.destacado
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border/60 bg-background text-foreground hover:bg-muted/50'
                }`}
              >
                {pkg.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mb-16 border-t border-border/40 pt-14">
        <h2 className="font-heading text-2xl font-bold text-center text-foreground mb-10">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { paso: '1', titulo: 'Contactanos', desc: 'Escribinos al email y te respondemos en menos de 24 horas con los detalles.' },
            { paso: '2', titulo: 'Enviás tu material', desc: 'Mandás tu imagen o logo y la URL a donde querés llevar a los usuarios.' },
            { paso: '3', titulo: 'Tu anuncio aparece', desc: 'En 24 horas tu banco o comercio ya está visible para todos los usuarios.' },
          ].map(({ paso, titulo, desc }) => (
            <div key={paso} className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-heading font-black text-lg mb-4">
                {paso}
              </div>
              <h4 className="font-heading text-sm font-bold text-foreground mb-2">{titulo}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="text-center bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-3xl p-10">
        <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
          ¿Listo para anunciar?
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Escribinos y te armamos una propuesta a medida. Sin contratos largos — paquetes mensuales renovables.
        </p>
        <a
          href="mailto:adairojeda.adm@gmail.com?subject=Consulta%20publicidad%20Descuentrol&body=Hola%2C%20me%20interesa%20anunciar%20en%20Descuentrol."
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Mail className="h-4 w-4" />
          Contactar ahora
        </a>
        <p className="text-3xs text-muted-foreground mt-4">
          O escribí directamente a{' '}
          <a href="mailto:adairojeda.adm@gmail.com" className="font-semibold text-primary hover:underline">
            adairojeda.adm@gmail.com
          </a>
        </p>
      </section>

    </div>
  )
}
