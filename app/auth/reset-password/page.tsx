'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devInfo, setDevInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (data.dev_info) {
          setDevInfo(data.dev_info);
        }
      } else {
        setError(data.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]"></div>
        </div>
        
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">
              Solicitud Enviada
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Te hemos enviado instrucciones para restablecer tu contraseña
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Si existe una cuenta con el email <strong>{email}</strong>, recibirás un correo con las instrucciones para crear una nueva contraseña.
              </p>
              
              {/* Información de desarrollo */}
              {devInfo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    🔧 Información de Desarrollo
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Usuario:</strong> {devInfo.email}</p>
                    <p><strong>Nueva contraseña:</strong> 
                      <code className="bg-gray-100 px-2 py-1 rounded ml-2 font-mono">
                        {devInfo.new_password}
                      </code>
                    </p>
                    <p className="text-yellow-700 text-xs mt-2">
                      {devInfo.message}
                    </p>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                ¿No recibiste el correo? Revisa tu carpeta de spam o contacta al administrador.
              </p>
              
              <Link href="/">
                <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700">
                  Volver al Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]"></div>
      </div>
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <img src="/images/logo-aia.png" alt="AIA Automate" className="w-20 h-20" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Restablecer Contraseña
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Ingresa tu email y te enviaremos instrucciones para crear una nueva contraseña
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <Input
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                disabled={isLoading || !email}
              >
                {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
              </Button>
          </form>

          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 