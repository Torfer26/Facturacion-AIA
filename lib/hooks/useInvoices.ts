'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Invoice } from '@/lib/types';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/facturas');
      if (!response.ok) {
        throw new Error('Error fetching invoices');
      }
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las facturas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    refreshInvoices: fetchInvoices,
  };
} 