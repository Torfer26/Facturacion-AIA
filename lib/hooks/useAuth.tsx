'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Types - importados del sistema V3
type User = {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'USER' | 'VIEWER';
  activo: boolean;
  fechaCreacion?: Date;
  ultimaConexion?: Date;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
};

// Context creation
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
  error: null
});

// Local storage key for token
const TOKEN_KEY = 'auth-token';

// Cookie utility functions
const cookies = {
  set: (name: string, value: string, days: number = 7) => {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax;`;
  },
  
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    }
    return null;
  },
  
  remove: (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
  }
};

// Safe localStorage access
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first
    try {
      const value = localStorage.getItem(key);
      if (value) return value;
    } catch (error) {
      console.warn('localStorage not available, falling back to cookies');
    }
    
    // Fall back to cookies
    return cookies.get(key);
  },
  
  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    let success = false;
    
    // Try localStorage
    try {
      localStorage.setItem(key, value);
      success = true;
    } catch (error) {
      console.warn('localStorage not available');
    }
    
    // Also set cookie as backup
    try {
      cookies.set(key, value);
      success = true;
    } catch (error) {
      console.warn('Cookies not available');
    }
    
    return success;
  },
  
  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    let success = false;
    
    // Try localStorage
    try {
      localStorage.removeItem(key);
      success = true;
    } catch (error) {
      console.warn('localStorage not available');
    }
    
    // Also remove cookie
    try {
      cookies.remove(key);
      success = true;
    } catch (error) {
      console.warn('Cookies not available');
    }
    
    return success;
  }
};

// Export auth hook
export function useAuth() {
  return useContext(AuthContext);
}

// Function to get the token (useful for API requests)
export function getAuthToken(): string | null {
  return safeStorage.getItem(TOKEN_KEY);
}

// Add auth token to API requests
const addAuthHeaderToFetch = (originalFetch: typeof fetch): typeof fetch => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    // Clone the init object to avoid mutating the original
    const modifiedInit = init ? { ...init } : {};
    
    // Get the token from storage
    const token = safeStorage.getItem(TOKEN_KEY);
    
    // If token exists, add it to headers
    if (token) {
      modifiedInit.headers = {
        ...modifiedInit.headers,
        'Authorization': `Bearer ${token}`,
        'X-Auth-Token': token
      };
    }
    
    // Call the original fetch with our modified init
    return originalFetch(input, modifiedInit);
  };
};

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Override fetch with our version that adds auth headers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = addAuthHeaderToFetch(originalFetch);
      
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentar obtener token de múltiples fuentes
        let token = safeStorage.getItem(TOKEN_KEY);
        
        // Si no hay token en localStorage, intentar con cookies del documento
        if (!token && typeof document !== 'undefined') {
          const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
          if (cookieValue) {
            token = decodeURIComponent(cookieValue);
          }
        }
        
        if (!token) {
          console.log('[AUTH] No token found');
          setIsLoading(false);
          return;
        }

        console.log('[AUTH] Token found, verifying...');
        const response = await fetch('/api/auth/check', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Auth-Token': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.authenticated && data.user) {
            console.log('[AUTH] Authentication successful:', data.user.email);
            setUser(data.user);
          } else {
            console.log('[AUTH] Authentication failed:', data);
            safeStorage.removeItem(TOKEN_KEY);
          }
        } else {
          console.log('[AUTH] Auth check request failed:', response.status);
          safeStorage.removeItem(TOKEN_KEY);
        }
      } catch (err) {
        console.error('[AUTH] Auth check failed:', err);
        safeStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Error en el inicio de sesión';
        setError(errorMsg);
        return false;
      }

      if (!data.token) {
        setError('No se recibió un token de autenticación');
        return false;
      }

      // Save token and user data
      const saved = safeStorage.setItem(TOKEN_KEY, data.token);
      
      if (!saved) {
        setError('No se pudo guardar la sesión. Revise la configuración de su navegador.');
        return false;
      }
      
      setUser(data.user);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Error en el servidor, inténtelo de nuevo');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    console.log('[AUTH] Starting logout process...');
    setIsLoading(true);
    try {
      console.log('[AUTH] Calling logout API...');
      await fetch('/api/auth/logout', { method: 'POST' });
      console.log('[AUTH] Logout API call completed');
    } catch (err) {
      console.error('[AUTH] Logout API error:', err);
    } finally {
      console.log('[AUTH] Cleaning up tokens and user data...');
      safeStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setIsLoading(false);
      
      console.log('[AUTH] Redirecting to home page...');
      // Añadir pequeño delay para asegurar cleanup completo
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 