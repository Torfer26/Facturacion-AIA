'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestAuthPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/v2/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@facturas.com',
          password: 'Admin123@Facturas2024!',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(`✅ Login exitoso!\n👤 Usuario: ${data.user.name}\n📧 Email: ${data.user.email}\n🔑 Rol: ${data.user.role}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testOldLogin = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@facturas.com',
          password: 'Admin123@Facturas2024!',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(`✅ Login antiguo exitoso!\n👤 Usuario: ${data.user.name}\n📧 Email: ${data.user.email}\n🔑 Rol: ${data.user.role}`);
      } else {
        setResult(`❌ Error en sistema antiguo: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error}`);
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>🧪 Test de Autenticación</CardTitle>
          <CardDescription>
            Prueba ambos sistemas de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={testLogin} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Probando...' : '🔐 Probar Auth V2 (Nuevo)'}
            </Button>
            
            <Button 
              onClick={testOldLogin} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Probando...' : '🔓 Probar Auth V1 (Actual)'}
            </Button>
          </div>

          {result && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Credenciales de Prueba:</h3>
            <p className="text-blue-800 text-sm">
              <strong>Email:</strong> admin@facturas.com<br />
              <strong>Contraseña:</strong> Admin123@Facturas2024!
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">🔗 Enlaces de Prueba:</h3>
            <div className="space-y-1 text-sm">
              <a href="/login" className="block text-blue-600 hover:underline">
                → Login Sistema Actual (/login)
              </a>
              <a href="/login-v2" className="block text-blue-600 hover:underline">
                → Login Sistema Nuevo (/login-v2)
              </a>
              <a href="/dashboard" className="block text-blue-600 hover:underline">
                → Dashboard (requiere autenticación)
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}