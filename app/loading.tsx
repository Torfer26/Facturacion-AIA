export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">Cargando...</p>
    </div>
  )
} 