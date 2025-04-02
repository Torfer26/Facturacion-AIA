import { useCallback, useState } from 'react';
import { 
  type Factura, 
  type TipoFactura, 
  type EstadoFactura
} from '@prisma/client';
import { useRouter } from 'next/navigation';

export interface UseInvoicesProps {
  initialInvoices?: Factura[];
  tipo?: TipoFactura;
}

export default function useInvoices({ initialInvoices = [], tipo }: UseInvoicesProps = {}) {
  const [facturas, setFacturas] = useState<Factura[]>(initialInvoices);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchFacturas = useCallback(async (filters?: {
    estado?: EstadoFactura;
    fechaDesde?: Date;
    fechaHasta?: Date;
    busqueda?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Construir la URL con los filtros
      const queryParams = new URLSearchParams();
      
      if (tipo) {
        queryParams.append('tipo', tipo);
      }
      
      if (filters?.estado) {
        queryParams.append('estado', filters.estado);
      }
      
      if (filters?.fechaDesde) {
        queryParams.append('fechaDesde', filters.fechaDesde.toISOString());
      }
      
      if (filters?.fechaHasta) {
        queryParams.append('fechaHasta', filters.fechaHasta.toISOString());
      }
      
      if (filters?.busqueda) {
        queryParams.append('busqueda', filters.busqueda);
      }

      const queryString = queryParams.toString();
      const url = `/api/facturas${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al cargar facturas');
      }
      
      const data = await response.json();
      setFacturas(data);
    } catch (err) {
      console.error('Error al obtener facturas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [tipo]);

  const updateFacturaEstado = useCallback(async (facturaId: string, nuevoEstado: EstadoFactura) => {
    try {
      const response = await fetch(`/api/facturas/${facturaId}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la factura');
      }

      const updatedFactura = await response.json();
      
      // Actualizar la lista local
      setFacturas(prev => 
        prev.map(f => f.id === facturaId ? updatedFactura : f)
      );

      return updatedFactura;
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const deleteFactura = useCallback(async (facturaId: string) => {
    try {
      const response = await fetch(`/api/facturas/${facturaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la factura');
      }

      // Eliminar de la lista local
      setFacturas(prev => prev.filter(f => f.id !== facturaId));
      
      return true;
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const navigateToDetail = useCallback((facturaId: string) => {
    router.push(`/facturas/${tipo?.toLowerCase() || 'todas'}/${facturaId}`);
  }, [router, tipo]);

  return {
    facturas,
    isLoading,
    error,
    fetchFacturas,
    updateFacturaEstado,
    deleteFactura,
    navigateToDetail
  };
} 