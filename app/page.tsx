'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Invoice } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/facturas')
      if (!response.ok) {
        throw new Error('Error al cargar las facturas')
      }

      const data = await response.json()
      if (!data.success || !data.invoices) {
        throw new Error('Error al cargar las facturas')
      }

      setInvoices(data.invoices)
    } catch (err) {
      console.error('Error loading invoices:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Calcular estadísticas
  const totalInvoices = invoices.length
  const pendingInvoices = invoices.filter(invoice => !invoice.paid).length
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.totalPriceIncVat, 0)
  const totalVat = invoices.reduce((sum, invoice) => sum + invoice.taxAmount, 0)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Resumen de Facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Facturas</CardTitle>
            <CardDescription>Resumen de facturas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total facturas:</span>
                <span className="font-semibold">{totalInvoices}</span>
              </div>
              <div className="flex justify-between">
                <span>Pendientes de cobro:</span>
                <span className="font-semibold">{pendingInvoices}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado Fiscal */}
        <Card>
          <CardHeader>
            <CardTitle>Estado Fiscal</CardTitle>
            <CardDescription>Próximas declaraciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Próxima declaración:</span>
                <span className="font-semibold">IVA Trimestral</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha límite:</span>
                <span className="font-semibold">20/04/2025</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen Financiero */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
            <CardDescription>Totales acumulados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total facturado:</span>
                <span className="font-semibold">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA total:</span>
                <span className="font-semibold">{formatCurrency(totalVat)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 