import { LoginFormV2 } from '@/components/auth/LoginFormV2';

export default function LoginV2Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Sistema de Facturación AIA
          </h1>
          <p className="text-gray-600 mt-2">
            Autenticación Segura V2
          </p>
        </div>
        <LoginFormV2 />
      </div>
    </div>
  );
}