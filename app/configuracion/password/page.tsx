'use client';

import { useRouter } from 'next/navigation';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';

export default function ChangePasswordPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirigir al dashboard después de cambiar la contraseña
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Cuenta</h1>
          <p className="text-gray-600 mt-2">
            Cambia tu contraseña para mantener tu cuenta segura
          </p>
        </div>
        
        <ChangePasswordForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
} 