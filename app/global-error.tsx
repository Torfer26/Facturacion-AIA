'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error crítico de la aplicación</h2>
            <p className="text-gray-700 mb-6">
              Ha ocurrido un error fatal en la aplicación. Por favor, inténtelo de nuevo.
            </p>
            <p className="text-sm text-gray-500 mb-6 break-words">
              {error.message || 'Error desconocido'}
            </p>
            <Button 
              onClick={reset} 
              className="w-full text-white bg-blue-600 hover:bg-blue-700"
            >
              Reiniciar aplicación
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
} 