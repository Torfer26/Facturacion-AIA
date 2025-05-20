'use client';

import { useState, useEffect } from 'react';
import { IssuedInvoice, CreateIssuedInvoiceDTO } from '../types/issuedInvoice';
import { getIssuedInvoices, createIssuedInvoice, updateIssuedInvoice, deleteIssuedInvoice } from '../services/issuedInvoices';
import { useToast } from '@/components/ui/use-toast';

export const useIssuedInvoices = () => {
  const [invoices, setInvoices] = useState<IssuedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getIssuedInvoices();
      
      // The data is already in the correct format thanks to the service
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las facturas emitidas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoice: CreateIssuedInvoiceDTO) => {
    try {
      setLoading(true);
      console.log('useIssuedInvoices: Creating invoice with data:', invoice);
      const newInvoice = await createIssuedInvoice(invoice);
      console.log('useIssuedInvoices: Invoice created successfully:', newInvoice);
      setInvoices(prev => [...prev, newInvoice]);
      toast({
        title: 'Éxito',
        description: 'Factura creada correctamente',
      });
      return newInvoice;
    } catch (err) {
      console.error('useIssuedInvoices: Error creating invoice:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo crear la factura',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (id: string, invoice: Partial<IssuedInvoice>) => {
    try {
      setLoading(true);
      const updatedInvoice = await updateIssuedInvoice(id, invoice);
      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
      toast({
        title: 'Éxito',
        description: 'Factura actualizada correctamente',
      });
      return updatedInvoice;
    } catch (err) {
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
      await deleteIssuedInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: 'Éxito',
        description: 'Factura eliminada correctamente',
      });
    } catch (err) {
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
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refreshInvoices: fetchInvoices,
  };
}; 