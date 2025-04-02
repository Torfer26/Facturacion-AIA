import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/app/facturas/columns"
import { Invoice } from "@/lib/types"

interface InvoiceTableProps {
  invoices: Invoice[]
  isLoading: boolean
}

export function InvoiceTable({ invoices, isLoading }: InvoiceTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando facturas...</div>
      </div>
    )
  }

  if (!invoices.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No hay facturas disponibles</div>
      </div>
    )
  }

  return <DataTable columns={columns} data={invoices} />
} 