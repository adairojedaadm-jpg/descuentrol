"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity, // Mantener en caché de forma indefinida, se invalida al cambiar parámetros URL
            refetchOnWindowFocus: false, // Evitar peticiones adicionales al cambiar de pestaña
            retry: 1, // Limitar a un intento en caso de fallo
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
