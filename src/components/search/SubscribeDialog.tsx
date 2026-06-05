"use client"

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BellRing, CheckCircle, Mail, ShieldAlert } from 'lucide-react'

interface SubscribeDialogProps {
  isOpen: boolean
  onClose: () => void
  categoryName: string
  categoryId: string
  selectedCardNames: string[]
}

export default function SubscribeDialog({ 
  isOpen, 
  onClose, 
  categoryName, 
  categoryId, 
  selectedCardNames 
}: SubscribeDialogProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    // Quick email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMsg('Ingresá un correo electrónico válido.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const response = await fetch('/api/suscribirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          category_id: categoryId,
          card_names: selectedCardNames
        })
      })

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
      } else {
        const data = await response.json()
        setErrorMsg(data.error || 'Ocurrió un error al procesar tu suscripción.')
      }
    } catch {
      setErrorMsg('No pudimos conectar con el servidor. Reintentá en unos momentos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsSuccess(false)
    setErrorMsg('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 gap-6">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                ¡Suscripción exitosa!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Te enviamos un aviso semanal al registrarse nuevas promociones de **{categoryName}** para tus tarjetas de interés. Podés desuscribirte cuando quieras con un solo clic.
              </DialogDescription>
            </div>
            <Button onClick={handleClose} className="w-full mt-4 rounded-xl font-semibold">
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader className="gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-2">
                <BellRing className="h-5 w-5" />
              </div>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                Recibir Alertas de {categoryName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Te notificaremos únicamente cuando los beneficios para tus tarjetas en **{categoryName}** se actualicen.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Selected cards info */}
              <div className="p-3 bg-muted/40 border border-border/20 rounded-xl space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Tarjetas a monitorear:
                </span>
                <p className="text-2xs font-semibold text-foreground leading-snug">
                  {selectedCardNames.length > 0 
                    ? selectedCardNames.join(', ') 
                    : 'Cualquier tarjeta activa del banco'}
                </p>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Tu correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10 rounded-xl h-10 border-border/60 focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive text-3xs border border-destructive/20">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <DialogFooter className="flex sm:justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-xl font-semibold border border-transparent hover:bg-muted/50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !email}
                className="rounded-xl font-semibold"
              >
                {isSubmitting ? 'Suscribiendo...' : 'Suscribirme'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
