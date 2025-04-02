"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUpload } from "@/components/facturas/FileUpload"
import { InvoiceTable } from "@/components/facturas/InvoiceTable"
import { useInvoices } from "@/lib/hooks/useInvoices"
import { uploadInvoice } from "@/lib/services/googleDrive"
import { processInvoice } from "@/lib/services/n8n"
import { Invoice } from "@/lib/types"

export default function FacturasPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { invoices, isLoading, error, refetch } = useInvoices()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const handleFileUpload = async (file: File) => {
    try {
      // Subir archivo a Google Drive
      const driveFile = await uploadInvoice(file)
      
      // Procesar factura con n8n
      await processInvoice(driveFile.id)
      
      // Recargar lista de facturas
      await refetch()
    } catch (error) {
      console.error("Error al subir factura:", error)
      throw error
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Ha ocurrido un error al cargar las facturas. Por favor, intenta de nuevo más tarde.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Facturas</h1>
      </div>

      <div className="grid gap-8">
        <FileUpload onUpload={handleFileUpload} />
        <InvoiceTable invoices={invoices} isLoading={isLoading} />
      </div>
    </div>
  )
} 
