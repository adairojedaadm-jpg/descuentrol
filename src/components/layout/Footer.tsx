import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <span className="font-heading text-lg font-bold tracking-tight">
              <span className="text-primary">descuen</span>
              <span className="text-secondary">trol</span>
              <span className="text-muted-foreground font-light">.com.py</span>
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              La plataforma para saber qué tarjeta de crédito te conviene usar hoy en Paraguay. Ahorrá en segundos con inteligencia en tus compras diarias.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Explorar</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
                  Inicio / Buscador
                </Link>
              </li>
              <li>
                <Link href="/publicidad" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
                  Anunciá aquí
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Legal</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/privacidad" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
                  Políticas de Privacidad (Ley 1682/2001 PY)
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-3xs sm:text-2xs text-muted-foreground text-center sm:text-left leading-relaxed max-w-2xl">
            <strong>Descargo de responsabilidad:</strong> Los datos sobre descuentos y beneficios son puramente informativos y provienen de raspados automáticos semanales de sitios oficiales. Descuentrol no tiene relación comercial con los bancos emisores y no garantiza la validez final de las ofertas al momento de la compra.
          </p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            &copy; {currentYear} descuentrol. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
