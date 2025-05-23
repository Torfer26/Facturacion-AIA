"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useIssuedInvoices } from '@/lib/hooks/useIssuedInvoices';
import { IssuedInvoice } from '@/lib/types/issuedInvoice';
import Link from 'next/link';

// Función para formatear fechas
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    // Formatear con localización española
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return 'Error de fecha';
  }
}

// Función para formatear moneda
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0,00 €';
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });
}

export default function FacturasEmitidasPage() {
  const { invoices, loading, error } = useIssuedInvoices();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Facturas Emitidas</h1>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error.message}</div>}
      <div className="mb-4 flex justify-end">
        <Link href="/facturas/emitidas/nueva">
          <Button>Nueva Factura Emitida</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {invoices && invoices.map((factura) => (
          <Card key={factura.id} className="p-4 flex flex-col gap-2">
            <div><b>ID:</b> {factura.facturaID}</div>
            <div><b>Cliente:</b> {factura.nombrecliente}</div>
            <div><b>Fecha:</b> {formatDate(factura.creationDate)}</div>
            <div><b>Vencimiento:</b> {formatDate(factura.fechavencimiento)}</div>
            <div><b>Producto:</b> {typeof factura.productofactura === 'string' ? factura.productofactura : JSON.stringify(factura.productofactura)}</div>
            <div><b>Total:</b> {formatCurrency(factura.total)}</div>
            <div><b>Estado:</b> <EstadoFacturaSelect id={factura.id} estado={factura.estadofactura} /></div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EstadoFacturaSelect({ id, estado }: EstadoFacturaSelectProps) {
  const [valor, setValor] = useState(estado)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value as IssuedInvoice['estadofactura']
    setValor(nuevoEstado)
    setLoading(true)
    try {
      await fetch(`/api/facturas/emitidas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estadofactura: nuevoEstado })
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <select value={valor} onChange={handleChange} disabled={loading} className="border rounded p-1">
      <option value="registrada">Registrada</option>
      <option value="pdfgenerado">PDF Generado</option>
      <option value="enviada">Enviada</option>
      <option value="cobrada">Cobrada</option>
    </select>
  )
}

interface EstadoFacturaSelectProps {
  id: string;
  estado: IssuedInvoice['estadofactura'];
}
