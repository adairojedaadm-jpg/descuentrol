import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import Script from "next/script";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Descuentrol | ¿Qué tarjeta uso hoy en Paraguay?",
  description: "Buscá al instante qué tarjeta de crédito paraguaya te conviene usar hoy para obtener los mejores descuentos y reintegros en combustibles, supermercados, farmacias y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
