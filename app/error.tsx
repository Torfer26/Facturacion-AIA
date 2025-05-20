'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Ha ocurrido un error</h2>
      <p className="text-gray-600 mb-6">
        Lo sentimos, algo ha salido mal. Puedes intentar reiniciar la página.
      </p>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        Error: {error.message || 'Error desconocido'}
      </p>
      <Button onClick={reset} variant="default">
        Reintentar
      </Button>
    </div>
  )
} 