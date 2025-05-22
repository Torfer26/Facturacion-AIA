"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { z } from 'zod';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, user, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loginStatus, setLoginStatus] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Redirect if already authenticated - use a separate flag to prevent loops
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user && !redirectAttempted) {
      setRedirectAttempted(true);
      console.log('User is authenticated, redirecting to dashboard');
      setDebugInfo('Authenticated as: ' + user.email + '. Redirecting...');
      
      // Use direct navigation after a delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  }, [isAuthenticated, user, redirectAttempted]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('Validando credenciales...');
    
    // Validate form data
    try {
      loginSchema.parse(formData);
      setValidationErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach(error => {
          if (error.path.length > 0) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setValidationErrors(errors);
        setLoginStatus('Error de validación');
        return;
      }
    }
    
    // Attempt login
    try {
      setLoginStatus('Intentando iniciar sesión...');
      setDebugInfo('Login attempt with: ' + formData.email);
      console.log('Login attempt with:', formData.email);
      
      const success = await login(formData.email, formData.password);
      
      console.log('Login result:', success);
      setLoginStatus(success ? 'Inicio de sesión exitoso' : 'Falló el inicio de sesión');
      setDebugInfo(success ? 'Login successful, waiting for redirect' : 'Login failed');
      
      if (success) {
        // Don't redirect here - let the useEffect handle it
        console.log('Login successful, useEffect will handle redirect');
        
        // Still show a message
        setLoginStatus('Inicio de sesión exitoso. Redirigiendo...');
        
        // Force token to localStorage directly as a backup
        try {
          localStorage.setItem('auth-token', 'backup-token-' + Date.now());
          setDebugInfo(prev => prev + ' | Token backup saved');
        } catch (err) {
          console.error('Error saving backup token:', err);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginStatus('Error durante el inicio de sesión');
      setDebugInfo('Login error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  // Function to check for localStorage
  const checkLocalStorage = () => {
    try {
      const testValue = 'test-' + Date.now();
      localStorage.setItem('test-storage', testValue);
      const retrieved = localStorage.getItem('test-storage');
      localStorage.removeItem('test-storage');
      
      if (retrieved === testValue) {
        setDebugInfo(prev => prev + ' | localStorage works');
      } else {
        setDebugInfo(prev => prev + ' | localStorage test failed');
      }
    } catch (err) {
      setDebugInfo(prev => prev + ' | localStorage error: ' + String(err));
    }
  };
  
  // Run localStorage check on mount
  useEffect(() => {
    checkLocalStorage();
    
    // Debug what's in localStorage already
    try {
      const token = localStorage.getItem('auth-token');
      setDebugInfo(prev => prev + ' | Existing token: ' + (token ? 'Yes' : 'No'));
    } catch (err) {
      // Ignore
    }
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Acceso a Facturación AIA
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}
          
          {loginStatus && (
            <div className="mb-4 rounded-md bg-blue-50 p-4">
              <div className="text-sm text-blue-700">
                {loginStatus}
              </div>
            </div>
          )}
          
          {/* Debug info for development */}
          {debugInfo && (
            <div className="mb-4 rounded-md bg-gray-100 p-2">
              <div className="text-xs text-gray-700 font-mono break-all">
                Debug: {debugInfo}
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm
                    ${validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                />
                {validationErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm
                    ${validationErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                />
                {validationErrors.password && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Accediendo...' : 'Acceder'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500">
                  Credenciales de prueba: admin@facturas.com / admin123
                </span>
              </div>
            </div>
          </div>
          
          {/* Debug button - for development only */}
          <div className="mt-4">
            <button 
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem('auth-token', 'manual-test-token');
                  setDebugInfo('Manual token set');
                  setTimeout(() => window.location.href = '/dashboard', 500);
                } catch (err) {
                  setDebugInfo('Error setting manual token: ' + String(err));
                }
              }}
              className="w-full text-xs text-gray-500 hover:text-gray-700 text-center py-2"
            >
              Debug: Forzar Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 