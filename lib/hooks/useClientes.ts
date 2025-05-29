import { useState, useEffect } from 'react';
import { Cliente } from '@/lib/types/cliente';

interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createCliente: (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function useClientes(): UseClientesReturn {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/clientes');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error fetching clientes');
      }
      
      const data = await response.json();
      
      if (!data.success || !Array.isArray(data.clientes)) {
        throw new Error('Unexpected response format from server');
      }
      
      setClientes(data.clientes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating cliente');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create cliente');
      }

      // Refresh the list after creating
      await fetchClientes();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error creating cliente');
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    refetch: fetchClientes,
    createCliente
  };
} 