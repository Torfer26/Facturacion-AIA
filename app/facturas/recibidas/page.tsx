"use client"

import { useInvoices } from '@/lib/hooks/useInvoices';
import { InvoiceTable } from '@/components/facturas/InvoiceTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function FacturasRecibidasPage() {
  const { invoices, loading, error } = useInvoices();

  if (error) {
    return <div>Error al cargar las facturas: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Facturas Recibidas</h1>
        <Link href="/facturas/procesar">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Procesar Nueva Factura
          </Button>
        </Link>
      </div>
      <InvoiceTable invoices={invoices} isLoading={loading} />
    </div>
  );
} 