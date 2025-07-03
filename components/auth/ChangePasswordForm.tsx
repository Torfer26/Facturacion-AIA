'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, XCircle, Lock } from 'lucide-react';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ChangePasswordForm({ 
  onSuccess, 
  onCancel, 
  isModal = false 
}: ChangePasswordFormProps) {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Validación de contraseña en tiempo real
  const validatePassword = (password: string) => {
    const rules = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[@$!%*?&]/.test(password)
    };
    return rules;
  };

  const passwordRules = validatePassword(formData.newPassword);
  const allRulesPassed = Object.values(passwordRules).every(Boolean);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Limpiar mensaje de éxito al escribir
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validaciones locales
      const newErrors: FormErrors = {};
      
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'La contraseña actual es requerida';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'La nueva contraseña es requerida';
      } else if (!allRulesPassed) {
        newErrors.newPassword = 'La contraseña no cumple con los requisitos';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma la nueva contraseña';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Enviar al API
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('¡Contraseña cambiada exitosamente!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Ejecutar callback de éxito después de un breve delay
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        if (data.details && Array.isArray(data.details)) {
          // Errores de validación de Zod
          const zodErrors: FormErrors = {};
          data.details.forEach((error: any) => {
            if (error.path?.[0]) {
              zodErrors[error.path[0] as keyof FormErrors] = error.message;
            }
          });
          setErrors(zodErrors);
        } else {
          setErrors({ general: data.error || 'Error al cambiar la contraseña' });
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({ general: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRuleIndicator = ({ rule, text }: { rule: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${rule ? 'text-green-600' : 'text-gray-500'}`}>
      {rule ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <Card className={isModal ? "w-full max-w-md" : "w-full max-w-lg mx-auto"}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="w-5 h-5" />
          <span>Cambiar Contraseña</span>
        </CardTitle>
        <CardDescription>
          Actualiza tu contraseña para mantener tu cuenta segura
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {successMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {errors.general && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <XCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errors.general}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña Actual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={errors.currentPassword ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.current ? 
                  <EyeOff className="w-4 h-4 text-gray-500" /> : 
                  <Eye className="w-4 h-4 text-gray-500" />
                }
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          {/* Nueva Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={errors.newPassword ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.new ? 
                  <EyeOff className="w-4 h-4 text-gray-500" /> : 
                  <Eye className="w-4 h-4 text-gray-500" />
                }
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword}</p>
            )}
            
            {/* Indicadores de reglas de contraseña */}
            {formData.newPassword && (
              <div className="space-y-1 mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">Requisitos de contraseña:</p>
                <PasswordRuleIndicator rule={passwordRules.minLength} text="Al menos 8 caracteres" />
                <PasswordRuleIndicator rule={passwordRules.hasUpper} text="Una letra mayúscula" />
                <PasswordRuleIndicator rule={passwordRules.hasLower} text="Una letra minúscula" />
                <PasswordRuleIndicator rule={passwordRules.hasNumber} text="Un número" />
                <PasswordRuleIndicator rule={passwordRules.hasSymbol} text="Un símbolo (@$!%*?&)" />
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.confirm ? 
                  <EyeOff className="w-4 h-4 text-gray-500" /> : 
                  <Eye className="w-4 h-4 text-gray-500" />
                }
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !allRulesPassed}
              className="flex-1"
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 