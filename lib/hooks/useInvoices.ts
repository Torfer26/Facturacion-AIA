'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Invoice } from '@/lib/types';
import { getAuthToken } from './useAuth';
import { handleClientError, NetworkError, DataError } from '@/lib/utils/errorHandler';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/facturas', {
        credentials: 'include', // This ensures cookies are sent
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new DataError(errorData.error || 'Error fetching invoices', errorData);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new DataError(data.error || 'Failed to fetch invoices', data);
      }
      
      setInvoices(data.invoices || []);
      setError(null);
    } catch (err) {
      const appError = handleClientError(err, toast);
      setError(appError);
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