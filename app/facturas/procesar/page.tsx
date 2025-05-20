"use client"

import { FileUpload } from '@/components/facturas/FileUpload'
import { uploadInvoiceToApi } from '@/lib/services/upload'

export default function ProcesarFacturaPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Subir Factura Recibida</h1>
      <FileUpload onUpload={uploadInvoiceToApi} />
    </div>
  )
}