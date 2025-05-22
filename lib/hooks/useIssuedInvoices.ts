'use client';

import { useState, useEffect } from 'react';
import { IssuedInvoice, CreateIssuedInvoiceDTO } from '../types/issuedInvoice';
import { getIssuedInvoices, createIssuedInvoice, updateIssuedInvoice, deleteIssuedInvoice } from '../services/issuedInvoices';
import { useToast } from '@/components/ui/use-toast';
import { getToken } from '../auth';

export function useIssuedInvoices() {
  const [invoices, setInvoices] = useState<IssuedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/facturas/emitidas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error fetching issued invoices');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch issued invoices');
      }
      
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err as Error);
      toast({
        title: 'Error al cargar las facturas',
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoice: any) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/facturas/emitidas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invoice),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating invoice');
      }
      
      const data = await response.json();
      await fetchInvoices(); // Refresh the list
      return data.invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  const updateInvoice = async (id: string, invoice: Partial<IssuedInvoice>) => {
    try {
      setLoading(true);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/facturas/emitidas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invoice),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating invoice');
      }
      
      const data = await response.json();
      const updatedInvoice = data.invoice;
      
      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
      
      toast({
        title: 'Éxito',
        description: 'Factura actualizada correctamente',
      });
      
      return updatedInvoice;
    } catch (err) {
      console.error('Error updating invoice:', err);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la factura',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      setLoading(true);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/facturas/emitidas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting invoice');
      }
      
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      
      toast({
        title: 'Éxito',
        description: 'Factura eliminada correctamente',
      });
    } catch (err) {
      console.error('Error deleting invoice:', err);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la factura',
        variant: 'destructive',
      });
      throw err;
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
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
} 