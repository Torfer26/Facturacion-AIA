'use client'

import { useState, useEffect } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Upload, MoreHorizontal, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DataTable } from '@/components/ui/data-table'
import type { Invoice } from '@/lib/types'

const ALLOWED_FILE_TYPES = ['.pdf', '.png', '.jpg', '.jpeg']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function FacturasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/facturas')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al cargar las facturas')
      }

      setInvoices(data.invoices)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las facturas"
      })
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validar tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). El tamaño máximo es 10MB`
      })
      return
    }

    // Validar tipo de archivo
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG"
      })
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('tipo', 'factura')

    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/facturas/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al subir el archivo')
      }

      toast({
        title: "Éxito",
        description: "Factura subida correctamente"
      })

      await fetchInvoices()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (invoice: Invoice) => {
    try {
      const response = await fetch(invoice.driveUrl)
      if (!response.ok) {
        throw new Error('Error al descargar el archivo')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = invoice.invoiceNumber || 'factura'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar la factura"
      })
    }
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceDate',
      header: 'Fecha',
      cell: ({ row }) => {
        const date = new Date(row.getValue('invoiceDate'))
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    },
    {
      accessorKey: 'invoiceDescription',
      header: 'Descripción',
      cell: ({ row }) => row.getValue('invoiceDescription') as string || 'Sin descripción'
    },
    {
      accessorKey: 'supplierName',
      header: 'Proveedor',
      cell: ({ row }) => row.getValue('supplierName') as string || 'Sin proveedor'
    },
    {
      accessorKey: 'totalPriceIncVat',
      header: 'Total',
      cell: ({ row }) => {
        const amount = row.getValue('totalPriceIncVat') as number
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(amount)
      }
    },
    {
      accessorKey: 'paid',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.getValue('paid') ? "success" : "secondary"}>
          {row.getValue('paid') ? 'Pagada' : 'Pendiente'}
        </Badge>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(invoice.driveUrl, '_blank')}>
                <FileText className="mr-2 h-4 w-4" />
                Ver documento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subir Nueva Factura</CardTitle>
          <CardDescription>
            Arrastra y suelta tu factura o haz clic para seleccionar un archivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="dropzone-file" 
              className={`
                flex flex-col items-center justify-center w-full h-64 
                border-2 border-gray-300 border-dashed rounded-lg cursor-pointer 
                bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 
                hover:bg-gray-100 dark:border-gray-600 
                dark:hover:border-gray-500 dark:hover:bg-gray-600
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">
                    {isUploading ? 'Subiendo...' : 'Haz clic para subir'}
                  </span>
                  {!isUploading && ' o arrastra y suelta'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, PNG, JPG hasta 10MB
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                disabled={isUploading}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facturas</CardTitle>
          <CardDescription>
            Listado de facturas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DataTable
            columns={columns}
            data={invoices}
          />
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
} 
