import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, saveToken, getToken, logout as authLogout } from '@/lib/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthentication: () => Promise<User | null>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const checkAuthentication = useCallback(async (): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        setUser(null);
        return null;
      }
      
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.authenticated && data.user) {
        setUser(data.user);
        return data.user;
      }
      
      setUser(null);
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error de autenticación'));
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar el token en localStorage
        if (data.token) {
          saveToken(data.token);
        }
        
        setUser(data.user);
        return true;
      } else {
        throw new Error(data.error || 'Error de autenticación');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error de inicio de sesión'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Llamar a la función de logout del cliente
      authLogout();
      
      // Limpiar el estado
      setUser(null);
      
      // Redirigir al login
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cerrar sesión'));
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuthentication,
  };
} 