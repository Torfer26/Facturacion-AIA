"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { IssuedInvoice } from '@/lib/types/issuedInvoice'

export default function FacturasEmitidasPage() {
  const [facturas, setFacturas] = useState<IssuedInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const res = await fetch("/api/facturas/emitidas")
        const data = await res.json()
        if (!data.success) throw new Error(data.error || "Error al cargar facturas")
        setFacturas(data.facturas)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Error desconocido")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchFacturas()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Facturas Emitidas</h1>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="mb-4 flex justify-end">
        <a href="/facturas/emitidas/nueva">
          <Button>Nueva Factura Emitida</Button>
        </a>
      </div>
      <div className="space-y-4">
        {facturas.map((factura) => (
          <Card key={factura.id} className="p-4 flex flex-col gap-2">
            <div><b>ID:</b> {factura.facturaID}</div>
            <div><b>Cliente:</b> {factura.nombrecliente}</div>
            <div><b>Fecha:</b> {factura.creationDate}</div>
            <div><b>Vencimiento:</b> {factura.fechavencimiento}</div>
            <div><b>Producto:</b> {factura.productofactura.map(item => item.descripcion).join(', ')}</div>
            <div><b>Total:</b> {factura.total} €</div>
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
