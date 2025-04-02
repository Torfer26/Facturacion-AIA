import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - FiscalApp',
  description: 'Panel de control principal de FiscalApp',
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Resumen de Facturas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Facturas</h2>
          <p className="text-gray-600">Total facturas: 0</p>
          <p className="text-gray-600">Pendientes de cobro: 0</p>
        </div>

        {/* Resumen Fiscal */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Estado Fiscal</h2>
          <p className="text-gray-600">Próxima declaración: IVA Trimestral</p>
          <p className="text-gray-600">Fecha límite: 20/04/2025</p>
        </div>

        {/* Resumen de Clientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Clientes</h2>
          <p className="text-gray-600">Total clientes: 0</p>
          <p className="text-gray-600">Activos este mes: 0</p>
        </div>
      </div>
    </div>
  )
} 