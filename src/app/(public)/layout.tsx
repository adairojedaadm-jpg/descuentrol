import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full bg-gradient-to-b from-background to-muted/20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
