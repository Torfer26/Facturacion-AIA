"use client"

import { IssuedInvoicesTable } from '@/components/facturas/emitidas/IssuedInvoicesTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function IssuedInvoicesDirectPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Facturas Emitidas (Acceso Directo)</h1>
        <Button asChild>
          <Link href="/facturas/emitidas/nueva">
            Nueva Factura
          </Link>
        </Button>
      </div>
      <IssuedInvoicesTable />
    </div>
  );
} 