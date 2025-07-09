'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';

interface PasswordValidation {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  // Validación de contraseña en tiempo real
  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[@$!%*?&]/.test(password)
    };
  };

  const passwordValidation = validatePassword(passwords.newPassword);
  const allRulesMet = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = passwords.newPassword === passwords.confirmPassword && passwords.confirmPassword.length > 0;

  // Verificar token al cargar la página
  useEffect(() => {
    if (!token) {
      setError('Token de restablecimiento no encontrado');
      setIsVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/reset-password/confirm?token=${token}`);
      const data = await response.json();

      if (data.success && data.valid) {
        setUserEmail(data.email);
        setTokenValid(true);
      } else {
        setError(data.error || 'El enlace de restablecimiento ha expirado o es inválido');
      }
    } catch (error) {
      setError('Error al verificar el enlace. Inténtalo de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allRulesMet || !passwordsMatch) {
      setError('Por favor, corrige los errores antes de continuar');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Componente de regla de validación
  const ValidationRule = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <CheckCircle className={`w-4 h-4 ${met ? 'text-green-600' : 'text-gray-300'}`} />
      <span>{text}</span>
    </div>
  );

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]"></div>
        </div>
        
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative z-10">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando enlace de restablecimiento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]"></div>
        </div>
        
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Enlace Inválido</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
            
            <p className="text-gray-600">
              El enlace puede haber expirado o ya haber sido utilizado.
            </p>
            
            <div className="space-y-3">
              <Link href="/auth/reset-password">
                <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700">
                  Solicitar Nuevo Enlace
                </Button>
              </Link>
              
              <Link href="/login">
                <Button variant="outline" className="w-full h-12">
                  Volver al Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">¡Contraseña Restablecida!</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Tu contraseña ha sido restablecida exitosamente. 
              Serás redirigido al login en unos segundos.
            </p>
            
            <Link href="/login">
              <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700">
                Ir al Login Ahora
              </Button>
            </Link>
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
            Nueva Contraseña
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Ingresa tu nueva contraseña para <strong>{userEmail}</strong>
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nueva contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  placeholder="Ingresa tu nueva contraseña"
                  value={passwords.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Validaciones de contraseña */}
            {passwords.newPassword.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-700">Requisitos de contraseña:</p>
                <div className="grid grid-cols-1 gap-1">
                  <ValidationRule met={passwordValidation.minLength} text="Al menos 8 caracteres" />
                  <ValidationRule met={passwordValidation.hasUpper} text="Una letra mayúscula" />
                  <ValidationRule met={passwordValidation.hasLower} text="Una letra minúscula" />
                  <ValidationRule met={passwordValidation.hasNumber} text="Un número" />
                  <ValidationRule met={passwordValidation.hasSymbol} text="Un símbolo (@$!%*?&)" />
                </div>
              </div>
            )}

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="Confirma tu nueva contraseña"
                  value={passwords.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {passwords.confirmPassword.length > 0 && (
                <div className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium"
              disabled={isLoading || !allRulesMet || !passwordsMatch}
            >
              {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </Button>
          </form>

          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Volver al Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 