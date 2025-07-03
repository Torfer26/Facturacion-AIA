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
  
  // Simple redirect after successful authentication - no loops
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      // Simple redirect using router.replace to avoid history issues
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, isLoading, router]);
  
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
      const success = await login(formData.email, formData.password);
      
      if (success) {
        setLoginStatus('Inicio de sesión exitoso. Redirigiendo...');
        // The useEffect will handle the redirect
      } else {
        setLoginStatus('Error en el inicio de sesión');
      }
    } catch (err) {
      setLoginStatus('Error durante el inicio de sesión');
      console.error('Login error:', err);
    }
  };
  
  // Show dashboard if already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirigiendo...</h2>
          <p className="text-gray-500">Ya estás autenticado como {user.email}</p>
        </div>
      </div>
    );
  }
  
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
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Accediendo...' : 'Acceder'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center text-sm text-gray-600">
              Credenciales de prueba: admin@tuempresa.com / TuPasswordAdmin123@
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 