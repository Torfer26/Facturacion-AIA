'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { useIssuedInvoices } from '@/lib/hooks/useIssuedInvoices';
import { IssuedInvoice } from '@/lib/types/issuedInvoice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Trash } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const columns: ColumnDef<IssuedInvoice>[] = [
  {
    accessorKey: 'facturaID',
    header: 'Número',
  },
  {
    accessorKey: 'creationDate',
    header: 'Fecha',
    cell: ({ row }) => {
      const date = new Date(row.getValue('creationDate'));
      return date.toLocaleDateString('es-ES');
    },
  },
  {
    accessorKey: 'nombrecliente',
    header: 'Cliente',
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.getValue('total')),
  },
  {
    accessorKey: 'estadofactura',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.getValue('estadofactura') as string;
      const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
        borrador: 'secondary',
        emitida: 'default',
        pagada: 'outline',
        vencida: 'destructive',
      };
      return (
        <Badge variant={variants[estado]}>
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/facturas/emitidas/${invoice.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export function IssuedInvoicesTable() {
  const { invoices, loading, error } = useIssuedInvoices();

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error al cargar las facturas
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Cargando facturas...
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={invoices}
    />
  );
} 