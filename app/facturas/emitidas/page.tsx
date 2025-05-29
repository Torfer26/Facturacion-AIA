"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useIssuedInvoices } from '@/lib/hooks/useIssuedInvoices';
import { IssuedInvoice } from '@/lib/types/issuedInvoice';
import { usePDF } from '@/lib/hooks/usePDF';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

// Función para formatear fechas
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'No especificada';
  
  try {
    // Si es un timestamp de Airtable o ISO string
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
    console.error('Error formateando fecha:', e, dateString);
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

// Función para formatear productos
function formatProducto(producto: any): string {
  if (!producto) return 'No especificado';
  
  // Si es un string directo
  if (typeof producto === 'string') {
    try {
      // Intentar parsear como JSON
      const parsed = JSON.parse(producto);
      if (Array.isArray(parsed)) {
        return parsed.map(p => p.descripcion || p.name || 'Producto').join(', ');
      }
      return producto;
    } catch {
      return producto;
    }
  }
  
  // Si es un array
  if (Array.isArray(producto)) {
    return producto.map(p => p.descripcion || p.name || 'Producto').join(', ');
  }
  
  // Si es un objeto
  if (typeof producto === 'object') {
    if (producto.descripcion) return producto.descripcion;
    if (producto.name) return producto.name;
    return JSON.stringify(producto);
  }
  
  return 'Producto sin descripción';
}

export default function FacturasEmitidasPage() {
  const { invoices, loading, error } = useIssuedInvoices();
  const { showToast, ToastComponent } = useToast();
  
  const { isGenerating, downloadFacturaPDF, previewFacturaPDF } = usePDF({
    onSuccess: (filename) => showToast(`PDF generado: ${filename}`, 'success'),
    onError: (error) => showToast(`Error: ${error}`, 'error'),
  });

  return (
    <div className="container mx-auto py-10">
      {ToastComponent}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Facturas Emitidas</h1>
        <div className="flex gap-2">
          <Link href="/facturas/emitidas/nueva">
            <Button>Nueva Factura Emitida</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error.message}</div>}
      <div className="space-y-4">
        {invoices && invoices.map((factura) => (
          <Card key={factura.id} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div><b>ID:</b> {factura.facturaID}</div>
                <div><b>Cliente:</b> {factura.nombrecliente}</div>
                <div><b>Fecha:</b> {formatDate(factura.creationDate)}</div>
                <div><b>Vencimiento:</b> {formatDate(factura.fechavencimiento)}</div>
                <div><b>Producto:</b> {formatProducto(factura.productofactura)}</div>
                <div><b>Total:</b> {formatCurrency(factura.total)}</div>
                <div className="flex items-center gap-2">
                  <b>Estado:</b> 
                  <EstadoFacturaSelect id={factura.id} estado={factura.estadofactura} />
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFacturaPDF(factura.id, factura.facturaID)}
                  disabled={isGenerating}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {isGenerating ? 'Generando...' : 'Descargar PDF'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => previewFacturaPDF(factura.id)}
                  disabled={isGenerating}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Vista previa
                </Button>
              </div>
            </div>
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
