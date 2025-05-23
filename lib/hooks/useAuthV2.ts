import { useState, useEffect, createContext, useContext } from 'react';
import { SafeUser, LoginInput, CreateUserInput } from '@/lib/auth-v2/types';
import logger from '@/lib/logger/universal';

interface AuthContextType {
  user: SafeUser | null;
  loading: boolean;
  login: (credentials: LoginInput) => Promise<boolean>;
  logout: () => Promise<void>;
  createUser: (userData: CreateUserInput) => Promise<boolean>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthV2() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v2/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      logger.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginInput): Promise<boolean> => {
    try {
      const response = await fetch('/api/v2/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/v2/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      logger.error('Logout error:', error);
    }
  };

  const createUser = async (userData: CreateUserInput): Promise<boolean> => {
    try {
      const response = await fetch('/api/v2/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return response.ok;
    } catch (error) {
      logger.error('Create user error:', error);
      return false;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    createUser,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: !!user,
  };
}