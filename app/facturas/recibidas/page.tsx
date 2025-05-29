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
        <div className="flex gap-2">
          <Link href="/facturas/procesar">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Procesar Nueva Factura
            </Button>
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
      <InvoiceTable invoices={invoices} isLoading={loading} />
    </div>
  );
} 